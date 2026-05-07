# CLI Usage Guide

## Command Reference

### `fsk init <project-name>`

Scaffold a new MERN project with pre-configured options.

#### Examples

**Interactive (Recommended):**
```bash
fsk init my-app
# Prompts for:
# - Preset variant
# - Brand name & tagline
# - Design theme & layout
# - Data display template
# - Extra modules to include
# - Deployment targets
# - Install dependencies?
```

**Non-Interactive:**
```bash
fsk init my-app \
  --preset saas \
  --brand-name "MyApp" \
  --tagline "Build faster" \
  --theme operationsDense \
  --layout topbarPortal \
  --extra-modules users,products \
  --deploy-targets docker,vercel \
  --no-install \
  --force
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--preset` | string | `saas` | `saas`, `clinic`, `studio`, `operations`, `commerce`, `custom` |
| `--brand-name` | string | Auto-generated | Your app/company name |
| `--tagline` | string | Auto-generated | Short description |
| `--theme` | string | Auto | `executiveBlue`, `clinicSoft`, `studioElevated`, `operationsDense`, `commerceWarm` |
| `--layout` | string | Auto | `hybridSaas`, `sidebarWorkspace`, `topbarPortal`, `rightRailStudio` |
| `--data-display` | string | Auto | `dashboard`, `denseOps`, `editorial`, `commerce` |
| `--extra-modules` | string | `[]` | Comma-separated: `users,products,invoices` |
| `--deploy-targets` | string | `[]` | Comma-separated: `docker`, `vercel`, `railway` |
| `--no-install` | boolean | `false` | Skip `pnpm install` |
| `--force` | boolean | `false` | Overwrite existing directory |
| `--target` | string | `.` | Parent output directory |

---

### `fsk generate module <module-name>`

Generate a backend module with full CRUD support.

#### Architecture Levels

**Lightweight** (Fast):
```
module/
├── module.model.js
└── module.routes.js
```

**Moderate** (Recommended):
```
module/
├── module.model.js
├── module.service.js
├── module.controller.js
├── module.routes.js
└── validators/module.validator.js
```

**Advanced** (With Tests):
```
module/
├── module.model.js
├── module.service.js
├── module.controller.js
├── module.routes.js
├── validators/module.validator.js
└── tests/module.test.js
```

#### Field Specification

Format: `name:type:rule1|rule2;name2:type2:ruleA|ruleB`

**Examples:**

```bash
# Simple module with default name field
fsk generate module products

# Custom fields
fsk generate module products \
  --fields "name:text:required|minLength=3 price:number:required|min=0 sku:string:required|pattern=/^[A-Z0-9]+$/"

# All field types
fsk generate module items \
  --fields "title:text:required|maxLength=100 description:text:required|minLength=10 price:number:required|min=0|max=9999 inStock:boolean featured:boolean image:url tags:string publishedAt:date"
```

#### Field Types

| Type | Description | Example |
|------|-------------|----------|
| `string` | Short text input | name, title |
| `text` | Long text (textarea) | description, bio |
| `email` | Email address | email, contact |
| `password` | Password input | password, secret |
| `url` | URL | website, avatar |
| `tel` | Phone number | phone, mobile |
| `color` | Color picker | themeColor, bgColor |
| `number` | Numeric input | price, quantity |
| `range` | Range slider | rating, priority |
| `boolean` | Checkbox | active, featured |
| `date` | Date picker | birthDate, startDate |
| `datetime` | Date + time | createdAt, eventTime |
| `time` | Time picker | openingTime |
| `file` | File upload | avatar, document |
| `hidden` | Hidden field | userId, token |

#### Validation Rules

| Rule | Usage | Description |
|------|-------|-------------|
| `required` | `name:required` | Field must be filled |
| `unique` | `email:unique` | Must be unique in DB |
| `min=N` | `price:min=0` | Minimum value/length |
| `max=N` | `price:max=999` | Maximum value/length |
| `minLength=N` | `name:minLength=3` | Min string length |
| `maxLength=N` | `desc:maxLength=500` | Max string length |
| `step=N` | `rating:step=0.5` | Step for number/range |
| `pattern=/regex/` | `sku:pattern=/^[A-Z0-9]+$/` | Regex pattern match |
| `default=value` | `status:default=active` | Default value |
| `accept=image/*` | `avatar:accept=image/*` | File accept types |
| `multiple` | `tags:multiple` | Allow multiple values |

#### Generated Endpoints

**Base:** `/api/<module-name>` (pluralized automatically)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Required | Create item |
| GET | `/` | Required | List items (paginated) |
| GET | `/:id` | Required | Get single item |
| PUT | `/:id` | Required | Update item |
| DELETE | `/:id` | Admin | Delete item |

**Query Parameters (GET /):**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 50, max: 100)
- `sort` — Sort field (default: createdAt)
- `order` — Sort order: asc, desc (default: desc)
- `<field>` — Filter by field value

**Example:**
```bash
GET /api/products?page=2&limit=20&sort=price&order=asc&inStock=true
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--fields` | string | `name:text` | Field specification |
| `--interactive` | boolean | `false` | Prompt for fields |
| `--architecture` | string | `moderate` | `lightweight`, `moderate`, `advanced` |
| `--with-page` | boolean | `false` | Generate frontend page |
| `--force` | boolean | `false` | Overwrite existing |

---

### `fsk generate page <page-name>`

Generate a frontend page with optional form.

#### Examples

```bash
# Basic page
fsk generate page about

# Page with form (string spec)
fsk generate page products \
  --with-form \
  --form-fields "name:text:required|minLength=3 price:number:required|min=0"

# Interactive form
fsk generate page products --with-form --interactive

# Custom route and icon
fsk generate page reports \
  --route /analytics \
  --icon bar-chart \
  --no-nav

# Dashboard (special template)
fsk generate page dashboard
```

#### Form Field Options

All module field types are supported plus:
- `select` — Dropdown (with options array)
- Enhanced `boolean` — Checkbox with label

**Select Example:**
```bash
# Define in interactive mode
# Or use field spec with options in form generation
```

#### Generated Files

```
frontend/src/pages/<page-name>/
├── <PageName>Page.jsx          # Page component
└── components/                 # (if --with-form)
    └── <PageName>Form.jsx      # Form with validation
```

#### Form Features

- **Real-time validation** — Errors display as you type
- **Type-specific inputs** — Date pickers, file uploads, etc.
- **Sanitization** — XSS prevention via input cleaning
- **Loading states** — Disabled submit during API call
- **Toast notifications** — Success/error feedback
- **Auto-submit to API** — Posts to `/api/<page-name>`

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--with-form` | boolean | `false` | Generate form component |
| `--form-fields` | string | `null` | Field specification |
| `--interactive` | boolean | `false` | Prompt for fields |
| `--route` | string | `/<name>` | Custom route path |
| `--icon` | string | `layout` | Lucide icon name |
| `--no-nav` | boolean | `false` | Skip navigation |
| `--force` | boolean | `false` | Overwrite existing |

---

### `fsk generate theme`

Import shadcn UI theme from CSS.

#### Examples

```bash
# From file
fsk generate theme --file ./my-theme.css

# From clipboard
fsk generate theme --paste ":root { --primary: 262 83% 58%; }"

# With options
fsk generate theme \
  --file theme.css \
  --fallback executiveBlue \
  --appearance quiet
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file` | string | — | Path to CSS file |
| `--paste` | string | — | Raw CSS string |
| `--fallback` | string | `executiveBlue` | Fallback theme |
| `--appearance` | string | `quiet` | Theme recipe |

---

### `fsk generate deploy`

Generate deployment configuration files.

#### Examples

```bash
# Single target
fsk generate deploy --target docker

# Multiple targets
fsk generate deploy --target docker,vercel,railway

# All targets
fsk generate deploy --target all
```

#### Generated Files

- **Docker:** `Dockerfile`, `docker-compose.yml`
- **Vercel:** `vercel.json`
- **Railway:** `railway.yaml`

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | string | `all` | `docker`, `vercel`, `railway`, or `all` |
| `--force` | boolean | `false` | Overwrite existing |

---

### `fsk remove <type> <name>`

Remove resources and clean up references.

#### Types

- `page` — Remove frontend page
- `module` — Remove backend module

#### Examples

```bash
# Remove page
fsk remove page about

# Remove module
fsk remove module products

# Force without confirmation
fsk remove page reports --force
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--force` | boolean | `false` | Skip confirmation |

---

### `fsk make resource <name>`

Generate complete resource (backend + frontend).

#### Usage

```bash
# Generate module + page with form
fsk make resource products \
  --fields "name:text:required price:number:required" \
  --with-page

# Interactive mode
fsk make resource products --interactive
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--fields` | string | `name:text` | Field specification |
| `--interactive` | boolean | `false` | Prompt for fields |
| `--with-page` | boolean | `true` | Generate frontend page |
| `--architecture` | string | `moderate` | Architecture level |
| `--force` | boolean | `false` | Overwrite existing |

---

## Global Options

| Option | Description |
|--------|-------------|
| `-h, --help` | Display help |
| `-v, --version` | Display version |
| `--verbose` | Verbose output |

## Error Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | File system error |
| 4 | Network error |
| 5 | Validation error |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FSK_VERBOSE` | Enable verbose logging |
| `FSK_DRY_RUN` | Preview changes without writing |
| `NODE_ENV` | Environment (development/production) |

## Tips

### Quick Module + Page
```bash
fsk make resource products --fields "name:text:required price:number:required" --with-page
```

### Generate Test Data
```bash
# Create multiple modules
fsk generate module users
fsk generate module products --with-page
fsk generate module orders --architecture advanced
```

### Customize After Generation

All generated files are meant to be modified:
- Edit models in `backend/src/modules/<name>/<name>.model.js`
- Add business logic in `backend/src/modules/<name>/<name>.service.js`
- Customize forms in `frontend/src/pages/<name>/components/<Name>Form.jsx`
- Update validation in `backend/src/utils/validators/<name>.validator.js`

### Adding Fields Later

Regenerate with `--force` to overwrite, or manually edit files.

## Troubleshooting

### Issue: "Not a MERN Starter Kit backend"
**Solution:** Run `fsk init` first, or verify project structure

### Issue: "Module already exists"
**Solution:** Use `--force` flag or choose different name

### Issue: "Route already exists"
**Solution:** Remove old route from `AppRouter.jsx` or use different route

### Issue: Form validation errors
**Solution:** Check field specification format. Use `--interactive` for guided input.

### Issue: API 404 errors
**Solution:** Verify server is running and module routes are mounted in `backend/src/routes/index.js`

## Best Practices

1. **Use descriptive names**: `userProfile` not `up`
2. **Add validation**: Always mark required fields
3. **Set constraints**: Use min/max for numbers, minLength for strings
4. **Keep it modular**: One module per domain concept
5. **Test generated code**: Always review generated files
6. **Version control**: Commit before generation
7. **Document**: Add comments to generated service methods

## Next Steps

- See `DEVELOPER.md` for code generation patterns
- Check `packages/cli/README.md` for CLI development
- Review generated code in your project
- Customize templates in `src/templates/`

## Support

For issues or questions:
1. Check this guide
2. Review `DEVELOPER.md`
3. Check generated code comments
4. Run `fsk <command> --help`
