/**
 * ResourceDefinition — unified schema for all generators
 * Central type that describes a domain resource end-to-end
 */

export class ResourceDefinition {
  constructor({ 
    name, 
    collection,
    fields = [],
    relations = {},
    ui = {},
    features = {},
    hooks = {},
    permissions = {},
    options = {}
  }) {
    this.name = name;                    // 'User' | 'Product' | 'Order'
    this.collection = collection || this.toKebabCase(name) + 's';
    this.fields = (fields || []).map(f => new FieldDefinition(f));
    this.relations = relations || { belongsTo: [], hasMany: [] };
    this.ui = ui || {};
    this.features = features || {};
    this.hooks = hooks || {};
    this.permissions = permissions || {};
    this.options = options || {};

    this.validate();
  }

  validate() {
    if (!this.name) throw new Error('Resource name is required');
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(this.name)) {
      throw new Error(`Resource name "${this.name}" must be PascalCase (start uppercase, alphanumeric)`);
    }
    
    // Validate field names unique
    const fieldNames = this.fields.map(f => f.name);
    const duplicates = fieldNames.filter((name, i) => fieldNames.indexOf(name) !== i);
    if (duplicates.length) throw new Error(`Duplicate fields: ${duplicates.join(', ')}`);
    
    // Validate referenced models exist (for relations)
    this.relations.belongsTo?.forEach(rel => {
      if (!rel.model) throw new Error(`belongsTo relation missing model`);
    });
    this.relations.hasMany?.forEach(rel => {
      if (!rel.model) throw new Error(`hasMany relation missing model`);
    });
  }

  // ── Naming helpers ────────────────────────────────────────────────────────
  get pascalName() { return this.name; }
  get camelName() { return this.name[0].toLowerCase() + this.name.slice(1); }
  get snakeName() { return this.camelName.replace(/[A-Z]/g, m => '_' + m.toLowerCase()); }
  get kebabName() { return this.camelName.replace(/[A-Z]/g, m => '-' + m.toLowerCase()); }

  // ── Computed flags ────────────────────────────────────────────────────────
  get hasTimestamps() { return true; } // always include createdAt, updatedAt
  get hasSoftDelete() { return this.features?.softDelete === true; }
  get hasAuditLog() { return this.features?.auditLog === true; }
  get hasAuth() { return this.features?.auth === true; }

  // ── Indexes ───────────────────────────────────────────────────────────────
  get indexes() {
    const idxs = [];
    this.fields.forEach(f => {
      if (f.unique) idxs.push({ [f.name]: 1 }, { unique: true });
      if (f.type === 'text' || f.type === 'richtext') idxs.push({ [f.name]: 'text' });
    });
    return idxs;
  }

  // ── Serialization ─────────────────────────────────────────────────────────
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      validation: { ...this.validation },
      ui: { ...this.ui },
      special: { ...this.special },
      // Computed (include private ones for templates)
      _mongooseType: this._mongooseType,
      _mongooseConstraints: this._mongooseConstraints,
      _mongooseDef: this._mongooseDef,
      formInputType: this.formInputType,
      joiBase: this.joiBase,
      joiRule: this.joiRule,
    };
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  toKebabCase(str) {
    return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/, '');
  }
}

export class FieldDefinition {
  constructor({ 
    name, 
    type, 
    validation = {},
    ui = {},
    special = {}
  }) {
    this.name = name;
    this.type = type;              
    this.validation = validation || {};  
    this.ui = ui || {};            
    this.special = special || {};  
    
    this.normalizeType();
    this.validate();
    this.computeDerived(); // precompute form field, mongoose, joi
  }

  normalizeType() {
    const typeMap = { 'str': 'string', 'num': 'number', 'bool': 'boolean', 'int': 'number', 'float': 'number', 'datetime-local': 'datetime', 'ref': 'reference' };
    if (typeMap[this.type]) this.type = typeMap[this.type];
  }

  validate() {
    if (!this.name) throw new Error('Field name required');
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(this.name)) {
      throw new Error(`Invalid field name: ${this.name}`);
    }
    
    const PRESETS = new Set(['string','text','email','phone','url','password','number','boolean','date','datetime','time','range','select','multiselect','image','file','json','richtext','color','reference','ref']);
    if (!PRESETS.has(this.type)) {
      console.warn(`[WARN] Unknown field type "${this.type}" — using 'string'`);
      this.type = 'string';
    }
  }

  computeDerived() {
    // Precompute MongoDB type string
    const mongooseTypes = {
      string: 'String', text: 'String', email: 'String', phone: 'String', url: 'String', password: 'String',
      number: 'Number', boolean: 'Boolean', date: 'Date', datetime: 'Date', time: 'String', range: 'Number',
      select: 'String', multiselect: '[String]',
      image: 'String', file: 'String',
      json: 'mongoose.Schema.Types.Mixed',
      richtext: 'String', color: 'String',
      reference: 'mongoose.Schema.Types.ObjectId', ref: 'mongoose.Schema.Types.ObjectId',
    };
    this._mongooseType = mongooseTypes[this.type] || 'String';

    // Build constraints array
    const constraints = [];
    if (this.validation) {
      if (this.validation.required) constraints.push('required: true');
      if (this.validation.unique) constraints.push('unique: true');
      if (this.validation.default !== undefined) constraints.push(`default: ${JSON.stringify(this.validation.default)}`);
      if (this.validation.min !== undefined && (this.type === 'number' || this.type === 'range')) constraints.push(`min: ${this.validation.min}`);
      if (this.validation.max !== undefined && (this.type === 'number' || this.type === 'range')) constraints.push(`max: ${this.validation.max}`);
      if (this.validation.minLength !== undefined && ['string','text','password','email'].includes(this.type)) constraints.push(`minlength: ${this.validation.minLength}`);
      if (this.validation.maxLength !== undefined && ['string','text','password','email'].includes(this.type)) constraints.push(`maxlength: ${this.validation.maxLength}`);
    }
    if (['string','text','email','phone','url','password'].includes(this.type)) constraints.push('trim: true');
    if (this.type === 'email') constraints.push('lowercase: true');
    if (this.type === 'multiselect') constraints.push('default: []');
    
    this._mongooseConstraints = constraints;
    this._mongooseDef = constraints.length ? `{ type: ${this._mongooseType}, ${constraints.join(', ')} }` : `{ type: ${this._mongooseType} }`;

    // Form input type mapping
    const formMap = { string: 'text', text: 'textarea', number: 'number', boolean: 'checkbox', date: 'date', email: 'email', phone: 'tel', url: 'url', datetime: 'datetime-local', time: 'time', color: 'color', file: 'file', password: 'password', range: 'range', select: 'select', multiselect: 'multiselect', reference: 'select', ref: 'select', image: 'image-upload', richtext: 'richtext-editor' };
    this.formInputType = formMap[this.type] || 'text';

    // Joi base (string representation)
    const joiMap = {
      string: "Joi.string()",
      text: "Joi.string()",
      email: "Joi.string().email().lowercase().trim()",
      phone: "Joi.string().pattern(/^[+]?[1-9]\\d{1,14}$/)",
      url: "Joi.string().uri().trim()",
      password: "Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)",
      number: "Joi.number().integer()",
      boolean: "Joi.boolean()",
      date: "Joi.date().iso()",
      datetime: "Joi.date().iso()",
      time: "Joi.string()",
      range: "Joi.number()",
      select: "Joi.string()", // overridden below if options exist
      multiselect: "Joi.array().items(Joi.string())",
      reference: "Joi.string().regex(/^[0-9a-fA-F]{24}$/)",
      ref: "Joi.string().regex(/^[0-9a-fA-F]{24}$/)",
      json: "Joi.object()",
      richtext: "Joi.string()",
      color: "Joi.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/)",
      image: "Joi.string().uri()",
      file: "Joi.string()",
    };
    this.joiBase = joiMap[this.type] || "Joi.string()";

    // Build full Joi rule string (including .valid() for selects)
    let joiRule = this.joiBase;
    if ((this.type === 'select' || this.type === 'multiselect') && this.special && this.special.options) {
      const opts = this.special.options.map(o => JSON.stringify(o)).join(', ');
      joiRule = this.joiBase + `.valid(${opts})`;
    }
    if (this.validation && this.validation.required) {
      joiRule += '.required()';
    }
    this.joiRule = joiRule;
  }

  getJoiBase() {
    const joiMap = {
      string: 'Joi.string()',
      text: 'Joi.string()',
      email: 'Joi.string().email()',
      phone: 'Joi.string().pattern(/^[+]?[1-9]\\d{1,14}$/)',
      url: 'Joi.string().uri()',
      password: 'Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)',
      number: 'Joi.number().integer()',
      boolean: 'Joi.boolean()',
      date: 'Joi.date().iso()',
      datetime: 'Joi.date().iso()',
      time: 'Joi.string()',
      range: 'Joi.number()',
      select: 'Joi.string().valid(...)', // populated from special.options
      multiselect: 'Joi.array().items(Joi.string())',
      reference: 'Joi.string().regex(/^[0-9a-fA-F]{24}$/)', // ObjectId
      ref: 'Joi.string().regex(/^[0-9a-fA-F]{24}$/)',
      json: 'Joi.object()',
      richtext: 'Joi.string()',
      color: 'Joi.string().regex(/^#/)',
      image: 'Joi.string().uri()',
      file: 'Joi.string()',
    };
    return joiMap[this.type] || 'Joi.string()';
  }
}

/**
 * Parse compact field spec: "name:type[options]" or "name:type:rules"
 * Examples:
 *   "email:email"                     → { name: 'email', type: 'email', validation: { required: true } }
 *   "age:number[min=18,max=100]"       → { name: 'age', type: 'number', validation: { min: 18, max: 100 } }
 *   "category:ref[Category]"           → { name: 'category', type: 'ref', special: { model: 'Category' } }
 *   "role:select[admin,user,guest]"    → { name: 'role', type: 'select', special: { options: ['admin','user','guest'] } }
 *   "price:num[min=0]|required|unique" → { name: 'price', type: 'number', validation: { min: 0, required: true, unique: true } }
 */
export function parseFieldSpec(spec) {
  if (!spec || typeof spec !== 'string') return null;

  // Pattern: name:type[options]:rules OR name:type[options]
  // Groups: 1=name, 2=type, 3=optionsInBrackets, 4=rulesAfterColon
  const match = spec.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z]+)(?:\[(.*?)\])?(?::(.*))?$/);
  if (!match) {
    console.warn(`[WARN] Could not parse field spec: "${spec}". Expected format: name:type[options]`);
    return null;
  }

  const [, name, typeRaw, optionsRaw, rulesRaw] = match;

  const field = {
    name,
    type: typeRaw.toLowerCase(),
    validation: {},
    special: {},
    ui: {},
  };

  // Parse options in brackets [...]
  if (optionsRaw) {
    // If type is 'ref' or 'reference', single value = model name
    if (field.type === 'ref' || field.type === 'reference') {
      field.special.model = optionsRaw.trim();
    }
    // If type is 'select' or 'multiselect', comma-separated options
    else if (field.type === 'select' || field.type === 'multiselect') {
      field.special.options = optionsRaw.split(',').map(o => o.trim());
    }
    // If type is 'image' or 'file', options = upload directory or allowed types
    else if (field.type === 'image' || field.type === 'file') {
      // Format: image[dir] or image[dir;max=5mb]
      const opts = optionsRaw.split(';');
      field.special.upload = opts[0]?.trim() || field.type + 's';
      if (opts[1]) {
        const [k, v] = opts[1].split('=');
        if (k === 'max') field.special.maxSize = v;
      }
    }
    // For number/range: min=0,max=100
    else if (field.type === 'number' || field.type === 'range') {
      const constraints = parseKeyValue(optionsRaw);
      if (constraints.min !== undefined) field.validation.min = parseFloat(constraints.min);
      if (constraints.max !== undefined) field.validation.max = parseFloat(constraints.max);
      if (constraints.step) field.validation.step = parseFloat(constraints.step);
    }
    // For string types with pattern or default
    else if (['string', 'text', 'email', 'password'].includes(field.type)) {
      const constraints = parseKeyValue(optionsRaw);
      if (constraints.minLength) field.validation.minLength = parseInt(constraints.minLength);
      if (constraints.maxLength) field.validation.maxLength = parseInt(constraints.maxLength);
      if (constraints.pattern) field.validation.pattern = constraints.pattern;
      if (constraints.default !== undefined) field.validation.default = constraints.default;
    }
  }

  // Parse rules after second colon (pipe-separated)
  if (rulesRaw) {
    const rules = rulesRaw.split('|').map(r => r.trim());
    rules.forEach(rule => {
      if (rule === 'required') field.validation.required = true;
      else if (rule === 'unique') field.validation.unique = true;
      else if (rule.startsWith('min=')) field.validation.min = parseFloat(rule.split('=')[1]);
      else if (rule.startsWith('max=')) field.validation.max = parseFloat(rule.split('=')[1]);
      else if (rule.startsWith('minLength=')) field.validation.minLength = parseInt(rule.split('=')[1]);
      else if (rule.startsWith('maxLength=')) field.validation.maxLength = parseInt(rule.split('=')[1]);
      else if (rule.startsWith('default=')) field.validation.default = rule.split('=').slice(1).join('=');
    });
  }

  // Auto-add required to first field if no rules specified (common UX)
  if (Object.keys(field.validation).length === 0 && !field.special.model) {
    field.validation.required = true;
  }

  return field;
}

function parseKeyValue(str) {
  // "min=0,max=100,pattern=/^[a-z]+$/" → { min: '0', max: '100', pattern: '/^[a-z]+$/' }
  const result = {};
  if (!str) return result;
  
  const pairs = str.split(',');
  pairs.forEach(pair => {
    const [key, ...valParts] = pair.split('=');
    if (key && valParts.length > 0) {
      result[key.trim()] = valParts.join('=').trim();
    }
  });
  return result;
}

/**
 * Convert field type to form input type
 */
export function fieldTypeToFormInput(type) {
  const map = { 
    string: 'text', 
    text: 'textarea',
    number: 'number', 
    boolean: 'checkbox', 
    date: 'date',
    email: 'email',
    phone: 'tel',
    url: 'url',
    datetime: 'datetime-local',
    time: 'time',
    color: 'color',
    file: 'file',
    password: 'password',
    range: 'range',
    select: 'select',
    multiselect: 'multiselect',
    reference: 'select',
    ref: 'select',
    image: 'image-upload',
  };
  return map[type] || 'text';
}
