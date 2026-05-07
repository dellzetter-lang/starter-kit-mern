import fs from 'fs-extra';
import path from 'path';
import { TemplateLoader } from './template-loader.js';
import { MarkerStrategy } from './marker-strategy.js';
import { ResourceDefinition, parseFieldSpec } from './resource-definition.js';

export class Generator {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot - project root directory
   * @param {string} options.architecture - 'lightweight' | 'moderate' | 'advanced'
   * @param {boolean} options.dryRun - preview only
   * @param {boolean} options.verbose - detailed logging
   * @param {boolean} options.force - overwrite existing
   * @param {boolean} options.withFrontend - generate frontend files
   * @param {boolean} options.withTests - generate test files
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.arch = options.architecture || 'moderate';
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.force = options.force || false;
    this.withFrontend = options.withFrontend !== false; // default true
    this.withTests = options.withTests || false;
    
    this.templates = new TemplateLoader();
    this.templates.projectRoot = this.projectRoot;
    
    this.resource = null;
    this.generatedFiles = []; // { template, output, action, reason? }
    this.issues = []; // warnings/errors
  }

  /**
   * Main entry: generate resource from definition object or file
   */
  async generateFromDefinition(resourceDef) {
    this.resource = resourceDef instanceof ResourceDefinition 
      ? resourceDef 
      : new ResourceDefinition(resourceDef);

    await this.validateProject();
    const context = await this.buildContext();
    await this.generateBackend(context);
    
    if (this.withFrontend) {
      await this.generateFrontend(context);
    }
    
    await this.updateProjectFiles(context);
    
    return {
      files: this.generatedFiles,
      issues: this.issues,
      resource: this.resource,
    };
  }

  /**
   * Validate we're in a FSK project
   */
  async validateProject() {
    const backendCheck = path.join(this.projectRoot, 'backend', 'src', 'modules');
    if (!(await fs.pathExists(backendCheck))) {
      throw new Error('Not a MERN Starter Kit backend. Run from project root where backend/ exists.');
    }
  }

  /**
   * Build context object for templates
   */
  async buildContext() {
    const backendDir = await this.detectDir('backend');
    const frontendDir = await this.detectDir('frontend');
    const usesTS = await this.detectTypeScript();

    return {
      resource: this.resource,
      options: {
        architecture: this.arch,
        force: this.force,
        withTests: this.withTests,
        withFrontend: this.withFrontend,
        timestamp: new Date().toISOString(),
      },
      project: {
        root: this.projectRoot,
        backendDir,
        frontendDir,
        usesTypeScript: usesTS,
      },
      utils: {
        pascal: (s) => s.charAt(0).toUpperCase() + s.slice(1),
        camel: (s) => s.charAt(0).toLowerCase() + s.slice(1),
        snake: (s) => s.replace(/[A-Z]/g, m => '_' + m.toLowerCase()),
        kebab: (s) => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase()),
        quote: (str) => JSON.stringify(str),
        indent: (str, n) => str.split('\n').map(l => ' '.repeat(n) + l).join('\n'),
      },
    };
  }

  /**
   * Detect directory name (backend/, api/, server/)
   */
  async detectDir(prefix) {
    const candidates = [prefix, 'api', 'server', 'be', 'backend'];
    for (const name of candidates) {
      const testPath = path.join(this.projectRoot, name, 'package.json');
      if (await fs.pathExists(testPath)) return name;
    }
    return prefix; // fallback
  }

  /**
   * Detect if project uses TypeScript
   */
  async detectTypeScript() {
    const frontendPkg = path.join(this.projectRoot, 'frontend', 'package.json');
    if (await fs.pathExists(frontendPkg)) {
      try {
        const pkg = await fs.readJSON(frontendPkg);
        return !!pkg.dependencies?.typescript || !!pkg.devDependencies?.typescript;
      } catch {
        // ignore
      }
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKEND GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  async generateBackend(context) {
    const { name } = this.resource;

    const templates = [
      { tpl: 'resource/model.js.ejs', out: `backend/src/modules/${name.kebabName}/models/${name}.js` },
      { tpl: 'resource/service.js.ejs', out: `backend/src/modules/${name.kebabName}/services/${name}.service.js` },
      { tpl: 'resource/controller.js.ejs', out: `backend/src/modules/${name.kebabName}/controllers/${name}.controller.js` },
      { tpl: 'resource/routes.js.ejs', out: `backend/src/modules/${name.kebabName}/routes/${name}.routes.js` },
      { tpl: 'resource/validator.js.ejs', out: `backend/src/utils/validators/${name}.validator.js` },
    ];

    // Advanced architecture adds tests
    if (this.arch === 'advanced' || this.withTests) {
      templates.push({ 
        tpl: 'resource/test.ejs', 
        out: `backend/src/modules/${name.kebabName}/tests/${name}.test.js`,
      });
    }

    for (const job of templates) {
      await this.generateFile(job.tpl, job.out, context);
    }

    // Update routes/index.js to mount new resource
    await this.injectIntoRoutesIndex(context);
  }

    for (const job of templates) {
      await this.generateFile(job.tpl, job.out, context);
    }

    // Update routes/index.js to mount new resource
    await this.injectIntoRoutesIndex(context);
  }

    for (const job of templates) {
      await this.generateFile(job.tpl, job.out, context, { always: job.always });
    }

    // Update routes/index.js to mount new resource
    await this.injectIntoRoutesIndex(context);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FRONTEND GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  async generateFrontend(context) {
    const { name } = this.resource;

    const templates = [
      { tpl: 'resource/page-list.jsx.ejs', out: `frontend/src/pages/admin/${name.kebabName}/ListPage.jsx` },
      { tpl: 'resource/page-detail.jsx.ejs', out: `frontend/src/pages/admin/${name.kebabName}/DetailPage.jsx` },
      { tpl: 'resource/page-form.jsx.ejs', out: `frontend/src/pages/admin/${name.kebabName}/FormModal.jsx` },
      { tpl: 'resource/components/table.jsx.ejs', out: `frontend/src/components/tables/${name}Table.jsx` },
      { tpl: 'resource/components/form.jsx.ejs', out: `frontend/src/components/forms/${name}Form.jsx` },
      { tpl: 'resource/api.js.ejs', out: `frontend/src/api/${name.kebabName}.api.js` },
      { tpl: 'resource/hooks.js.ejs', out: `frontend/src/hooks/use${name}.js` },
    ];

    // If TypeScript enabled
    if (context.project.usesTypeScript) {
      templates.push({ tpl: 'resource/types.ts.ejs', out: `frontend/src/types/${name.kebabName}.types.ts` });
    }

    for (const job of templates) {
      await this.generateFile(job.tpl, job.out, context);
    }

    // Update frontend router
    await this.injectIntoFrontendRouter(context);

    // Update navigation (app-preset.js)
    await this.injectIntoNavigation(context);
  }

    for (const job of templates) {
      await this.generateFile(job.tpl, job.out, context);
    }

    // Update frontend router
    await this.injectIntoFrontendRouter(context);

    // Update navigation (app-preset.js)
    await this.injectIntoNavigation(context);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE GENERATION (with dry-run, force, markers)
  // ═══════════════════════════════════════════════════════════════════════════

  async generateFile(templatePath, outputPath, context) {
    const fullOut = path.join(this.projectRoot, outputPath);
    const exists = await fs.pathExists(fullOut);

    // Skip if exists and not forced
    if (exists && !this.force) {
      this.log(`[SKIP] ${outputPath} exists (use --force to overwrite)`);
      this.generatedFiles.push({ template: templatePath, output: outputPath, action: 'SKIP', reason: 'exists' });
      return;
    }

    if (this.dryRun) {
      this.generatedFiles.push({ 
        template: templatePath, 
        output: outputPath, 
        action: exists ? 'UPDATE' : 'CREATE',
        reason: 'dry-run',
      });
      return;
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullOut));

    // Render template
    let content;
    try {
      content = await this.templates.render(templatePath, context, this.projectRoot);
    } catch (err) {
      this.issues.push({ type: 'error', file: outputPath, message: err.message });
      throw err;
    }

    // Preserve custom code if file exists (marker strategy)
    if (exists) {
      try {
        const existing = await fs.readFile(fullOut, 'utf-8');
        const parsed = MarkerStrategy.parse(existing);
        if (parsed.hasMarkers) {
          // Extract new auto block (between AUTO-GENERATED markers)
          const lines = content.split('\n');
          const autoStart = lines.findIndex(l => l.includes('AUTO-GENERATED')) + 1;
          const autoEnd = lines.findIndex(l => l.includes('END AUTO-GENERATED'));
          const newAuto = lines.slice(autoStart, autoEnd).join('\n').trim();
          content = MarkerStrategy.compose(parsed, newAuto);
        } else {
          // No markers yet: add them, keep old content as custom zone
          content = MarkerStrategy.ensureMarkers(content, context.resource.name);
        }
      } catch (err) {
        this.issues.push({ type: 'warn', file: outputPath, message: `Marker strategy failed: ${err.message}` });
      }
    } else {
      // New file: wrap in markers
      content = MarkerStrategy.ensureMarkers(content, context.resource.name);
    }

    // Write file
    try {
      await fs.writeFile(fullOut, content, 'utf-8');
      this.log(`[${exists ? 'UPDATE' : 'CREATE'}] ${outputPath}`);
      this.generatedFiles.push({ template: templatePath, output: outputPath, action: exists ? 'UPDATE' : 'CREATE' });
    } catch (err) {
      this.issues.push({ type: 'error', file: outputPath, message: err.message });
      throw err;
    }
  }

    if (this.dryRun) {
      this.generatedFiles.push({ 
        template: templatePath, 
        output: outputPath, 
        action: exists ? 'UPDATE' : 'CREATE',
        reason: 'dry-run',
      });
      return;
    }

    // Ensure directory
    await fs.ensureDir(path.dirname(fullOut));

    // Render template
    let content;
    try {
      content = await this.templates.render(templatePath, context, this.projectRoot);
    } catch (err) {
      this.issues.push({ type: 'error', file: outputPath, message: err.message });
      throw err;
    }

    // If file exists, preserve custom code via markers
    if (exists) {
      try {
        const existing = await fs.readFile(fullOut, 'utf-8');
        const parsed = MarkerStrategy.parse(existing);
        if (parsed.hasMarkers) {
          // Extract new auto block (between markers)
          const newAutoMatch = content.match(/^\/\/ ═+ AUTO-GENERATED[\s\S]*?\/\/ ═+\s*$/m);
          if (newAutoMatch) {
            // Get just the inner content (between header and footer lines)
            const lines = content.split('\n');
            const autoStart = lines.findIndex(l => l.includes('AUTO-GENERATED')) + 1;
            const autoEnd = lines.findIndex(l => l.includes('END AUTO-GENERATED'));
            const newAuto = lines.slice(autoStart, autoEnd).join('\n').trim();
            
            content = MarkerStrategy.compose(parsed, newAuto);
          }
        } else {
          // Existing file has no markers — add them, keep old content as custom
          content = MarkerStrategy.ensureMarkers(content, context.resource.name);
        }
      } catch (err) {
        this.issues.push({ type: 'warn', file: outputPath, message: `Marker strategy failed: ${err.message}` });
        // Fall through: write new content anyway
      }
    } else {
      // New file — ensure it has markers
      content = MarkerStrategy.ensureMarkers(content, context.resource.name);
    }

    try {
      await fs.writeFile(fullOut, content, 'utf-8');
      this.log(`[${exists ? 'UPDATE' : 'CREATE'}] ${outputPath}`);
      this.generatedFiles.push({ template: templatePath, output: outputPath, action: exists ? 'UPDATE' : 'CREATE' });
    } catch (err) {
      this.issues.push({ type: 'error', file: outputPath, message: err.message });
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT FILE UPDATES (routes, navigation, etc)
  // ═══════════════════════════════════════════════════════════════════════════

  async injectIntoRoutesIndex(context) {
    const indexPath = path.join(this.projectRoot, 'backend', 'src', 'routes', 'index.js');
    if (!(await fs.pathExists(indexPath))) {
      this.log('[SKIP] backend/src/routes/index.js not found');
      return;
    }

    let code = await fs.readFile(indexPath, 'utf-8');
    // Note: Routes are mounted under /api prefix at app level, so mount at /resource here
    const mountLine = `router.use("/${context.resource.kebabName}", require("../modules/${context.resource.kebabName}/routes/${context.resource.name}.routes"));`;
    
    if (code.includes(mountLine)) {
      this.log('[SKIP] Route already mounted in index.js');
      return;
    }

    if (code.includes('module.exports = router')) {
      code = code.replace('module.exports = router;', `${mountLine}\nmodule.exports = router;`);
      await fs.writeFile(indexPath, code, 'utf-8');
      this.generatedFiles.push({ output: 'backend/src/routes/index.js', action: 'UPDATE', reason: 'mount-route' });
      this.log(`[UPDATE] backend/src/routes/index.js`);
    } else {
      this.issues.push({ type: 'warn', file: 'routes/index.js', message: 'Could not find module.exports line to mount route' });
    }
  }

  async injectIntoFrontendRouter(context) {
    if (!this.withFrontend) return;

    const routerPath = path.join(this.projectRoot, 'frontend', 'src', 'routes', 'AppRouter.jsx');
    if (!(await fs.pathExists(routerPath))) {
      this.log('[SKIP] frontend/src/routes/AppRouter.jsx not found');
      return;
    }

    let code = await fs.readFile(routerPath, 'utf-8');
    const pageName = context.resource.pascalName;
    const kebabName = context.resource.kebabName;
    
    // Import statement
    const importLine = `const ${pageName}List = lazy(() => import("@/pages/admin/${kebabName}/ListPage"));`;
    
    if (!code.includes(importLine)) {
      // Find last lazy import by looking for pattern: const XxPage = lazy(...)
      const importRegex = /^const \w+Page = lazy\(.*?\);/gm;
      const imports = code.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        code = code.replace(lastImport, `${lastImport}\n${importLine}`);
      } else {
        // Insert after "export function AppRouter()"
        code = code.replace('export function AppRouter()', `${importLine}\nexport function AppRouter()`);
      }
      await fs.writeFile(routerPath, code, 'utf-8');
      this.generatedFiles.push({ output: 'frontend/src/routes/AppRouter.jsx', action: 'UPDATE', reason: 'add-import' });
      this.log(`[UPDATE] frontend/src/routes/AppRouter.jsx (import)`);
      
      // Refresh code
      code = await fs.readFile(routerPath, 'utf-8');
    }

    // Add route element before wildcard 404
    const routePath = `/admin/${kebabName}`;
    const routeBlock = `${pageName}List`;
    const routeInsert = `\n      {/* ${pageName} */}
      <Route
        path="${routePath}"
        element={<AppShell secure><${routeBlock} /></AppShell>}
      />`;

    if (code.includes(`path="${routePath}"`)) {
      this.log('[SKIP] Route already exists in AppRouter.jsx');
      return;
    }

    const wildcardRegex = /^(\s*)<Route\s+path="\*"\s+element=.*?\/>/m;
    const match = code.match(wildcardRegex);
    
    if (match) {
      const indent = match[1];
      const indentedInsert = routeInsert.replace(/\n/g, '\n' + indent);
      code = code.replace(wildcardRegex, indentedInsert + '\n' + match[0]);
    } else {
      // Fallback: insert before </Routes>
      code = code.replace('</Routes>', `${routeInsert}\n      </Routes>`);
    }

    await fs.writeFile(routerPath, code, 'utf-8');
    this.generatedFiles.push({ output: 'frontend/src/routes/AppRouter.jsx', action: 'UPDATE', reason: 'add-route' });
    this.log(`[UPDATE] frontend/src/routes/AppRouter.jsx (route)`);
  }

  async injectIntoNavigation(context) {
    if (!this.withFrontend) return;

    const presetPath = path.join(this.projectRoot, 'frontend', 'src', 'config', 'app-preset.js');
    if (!(await fs.pathExists(presetPath))) {
      this.log('[SKIP] frontend/src/config/app-preset.js not found');
      return;
    }

    let presetCode = await fs.readFile(presetPath, 'utf-8');
    const routePath = `/admin/${context.resource.kebabName}`;
    const navLabel = context.resource.name.replace(/([A-Z])/g, ' $1').trim();
    const navEntry = `{ label: "${navLabel}", href: "${routePath}", icon: "layout" },`;

    if (presetCode.includes(`href: "${routePath}"`)) {
      this.log('[SKIP] Navigation entry already exists');
      return;
    }

    // Find navigation array and insert
    const navMatch = presetCode.match(/navigation\s*:\s*\[([^\]]*)\]/s);
    if (!navMatch) {
      this.issues.push({ type: 'warn', file: 'app-preset.js', message: 'Could not find navigation array' });
      return;
    }

    let existingItems = navMatch[1].trim();
    // Remove trailing comma
    existingItems = existingItems.replace(/,\s*$/, '');
    
    const newItems = existingItems ? `${existingItems},\n      ${navEntry}` : navEntry;
    const replacement = `navigation: [\n      ${newItems}\n    ]`;
    
    presetCode = presetCode.replace(/navigation\s*:\s*\[[^\]]*\]/s, replacement);
    await fs.writeFile(presetPath, presetCode, 'utf-8');
    this.generatedFiles.push({ output: 'frontend/src/config/app-preset.js', action: 'UPDATE', reason: 'add-nav' });
    this.log(`[UPDATE] frontend/src/config/app-preset.js (navigation)`);
  }

  async updateProjectFiles(context) {
    // Future: update index files, README badges, etc.
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  log(msg) {
    if (this.verbose) console.log(msg);
  }
}
