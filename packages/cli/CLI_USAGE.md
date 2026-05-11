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

> **Note:** `fsk init` now automatically copies `.env.example` to `.env` in the backend directory and creates `frontend/src/utils/sanitize.js` if not present.

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
| `datetime-local` | Date + time | createdAt, eventTime |
| `time` | Time picker | openingTime |
| `file` | File upload | avatar, document |
| `hidden` | Hidden field | userId, token |
| `select` | Dropdown | status, category |

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
| `--form-mode` | string | `page` | `page`, `modal`, `sidepanel`, `inline` |
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

# Form display modes
fsk generate page customer --with-form --form-mode modal --form-fields "name:string:required"
fsk generate page settings --with-form --form-mode sidepanel --form-fields "name:string:required"
fsk generate page search --with-form --form-mode inline --form-fields "query:string:required"
```

#### Form Display Modes

| Mode | Behavior | UI Components |
|------|----------|---------------|
| `page` (default) | Form embedded directly in the page | Standard form layout |
| `modal` | Form opens in a Dialog overlay | Radix Dialog + "Add New" button |
| `sidepanel` | Form slides in from the right | Radix Sheet + "Add New" button |
| `inline` | Minimal form-only layout | Direct form embed, no listing section |

#### Generated Page Structure

All form modes generate a **listing-focused layout** by default (except `inline`):

```
┌─────────────────────────────────┐
│  Page Title                     │
│  Manage <route> here.           │
├─────────────────────────────────┤
│  [Add New <SingularName>] btn   │  ← modal/sidepanel/page modes
├─────────────────────────────────┤
│  Create New / Form Section      │
│  ┌─────────────────────────┐    │
│  │ <FormComponent />       │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  All Items Section              │  ← modal/sidepanel/page modes
│  (listing placeholder)          │
└─────────────────────────────────┘
```

#### Form Features

- **Real-time validation** — Errors display with toast notifications
- **Strict validation** — Uses `=== undefined || === null || === ''` to correctly validate `0` and `false`
- **Boolean fields** — Default to `false`, rendered as checkbox with `checked` handling
- **Number fields** — Default to `0`, with min/max validation
- **Type-specific inputs** — Date pickers, file uploads, color pickers, range sliders, etc.
- **Sanitization** — XSS prevention via input cleaning (email, URL, phone, text)
- **Loading states** — Disabled submit during API call
- **Toast notifications** — Success/error feedback
- **Auto-submit to API** — Posts to `/api/<page-name>`
- **Reset on submit** — All form fields reset to their default values
- **`onSuccess` callback** — Form accepts an `onSuccess` prop called after successful submission (enables modal/sidepanel auto-dismiss):

```jsx
<ProductsForm onSuccess={() => setShowForm(false)} />
```

#### Form Fields

All form fields are specified using the format: `name:type:rule1|rule2;name2:type2:ruleA|ruleB`

**Supported types:** `string`, `text`, `email`, `password`, `url`, `tel`, `color`, `number`, `range`, `boolean`, `date`, `datetime-local`, `time`, `file`, `hidden`, `select`

**Supported validations:** `required`, `unique`, `min=N`, `max=N`, `minLength=N`, `maxLength=N`, `step=N`, `pattern=/regex/`, `default=value`, `accept=image/*`, `multiple`

#### Generated Files

```
frontend/src/pages/<page-name>/
├── <PageName>Page.jsx          # Page component
└── components/                 # (if --with-form)
    └── <PageName>Form.jsx      # Form with validation + sanitization
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--with-form` | boolean | `false` | Generate form component |
| `--form-fields` | string | `null` | Field specification |
| `--interactive` | boolean | `false` | Prompt for fields interactively |
| `--form-mode` | string | `page` | `page`, `modal`, `sidepanel`, `inline` |
| `--route` | string | `/<name>` | Custom route path |
| `--icon` | string | `layout` | Lucide icon name |
| `--no-nav` | boolean | `false` | Skip navigation entry |
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

### `fsk cleanup`

Clean up demo files and branding to prepare your project for production or distribution as a template.

#### Presets

| Preset | Actions | Description |
|--------|---------|-------------|
| `minimal` | Remove demo pages, replace branding | Removes demo/examples dirs and starter kit branding |
| `production` | minimal + strip test files | Also removes `.test.js` files and `__tests__/` directories |
| `template` | Create reusable template | Extracts reusable components into `.template/` dir and resets branding |

#### Examples

```bash
# Interactive prompt
fsk cleanup

# Non-interactive
fsk cleanup --preset minimal
fsk cleanup --preset production
fsk cleanup --preset template
```

#### Branding Removal

The cleanup command replaces the following strings across all `.js`, `.jsx`, `.json` files in `frontend/src/` and `backend/src/`:
- `MERN Fullstack Starter Kit` → `Project`
- `MERN Starter` → `Project`
- `Starter Kit` → `Project`
- Renames package from starter-kit names to `my-project`

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--preset` | string | interactive | `minimal`, `production`, `template` |

---

### `fsk remove <type> <name>`

Remove a generated page or module with cleanup.

#### Types

- `page` — Remove frontend page (directory, import, route, nav entry)
- `module` — Remove backend module (directory + route unmount)

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

### `fsk customize`

Customize design & branding on an existing project.

#### Subcommands

| Subcommand | Purpose |
|-----------|---------|
| `theme set <theme>` | Switch to a built-in theme |
| `theme import` | Import a custom shadcn/ui theme from CSS |
| `layout set <layout>` | Switch layout shell |
| `brand set` | Update brand name and/or tagline |
| `data set <template>` | Switch data display template |
| `list-themes` | List available themes |
| `list-layouts` | List available layouts |
| `list-data` | List available data templates |

#### Examples

```bash
fsk customize theme set clinicSoft
fsk customize layout set rightRailStudio
fsk customize brand set --name "Acme" --tagline "Innovate"
fsk customize data set denseOps
fsk customize theme import --file ./brand-theme.css
```

---

### `fsk wizard`

Interactive guide to extend your project step-by-step.

```bash
fsk wizard
# Follow prompts to add pages, modules, themes, deploy configs
fsk wizard --skip-confirm  # Skip final summary
```

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

### Quick Module + Page with Form
```bash
fsk generate module products --fields "name:text:required price:number:required" --with-page --form-mode modal
```

### Generate Multi-Mode Pages
```bash
# Modal form (overlay)
fsk generate page customers --with-form --form-mode modal --form-fields "name:string:required;email:email:required"

# Sidepanel form (slide-in)
fsk generate page settings --with-form --form-mode sidepanel --form-fields "key:string:required;value:text"

# Inline form (embedded)
fsk generate page search --with-form --form-mode inline --form-fields "query:string:required"
```

### Generate with All Field Types
```bash
fsk generate page demo --with-form --form-fields \
  "name:string:required|minLength=3 \
   description:text:minLength=10 \
   email:email:required \
   password:password:required|minLength=8 \
   website:url \
   phone:tel \
   age:number:min=0|max=150 \
   rating:range:min=0|max=5|step=0.5 \
   active:boolean \
   country:select \
   birthdate:date"
```

### After Generation

All generated files are meant to be modified:
- Edit models in `backend/src/modules/<name>/<name>.model.js`
- Add business logic in `backend/src/modules/<name>/<name>.service.js`
- Customize forms in `frontend/src/pages/<name>/components/<Name>Form.jsx`
- Update validation in `backend/src/utils/validators/<name>.validator.js`
- Add fields later by regenerating with `--force`

## Troubleshooting

### Issue: "Not a MERN Starter Kit frontend"
**Solution:** Ensure you are inside a project directory with `frontend/src/App.jsx` present. Run `fsk init` first.

### Issue: "Not a MERN Starter Kit backend"
**Solution:** Ensure the project has a `backend/src/modules/` directory. Run `fsk init` first.

### Issue: "Module already exists"
**Solution:** Use `--force` flag to overwrite, or choose a different name.

### Issue: "Route already exists"
**Solution:** Route was previously registered. Remove old entry from `AppRouter.jsx` or use `--force`.

### Issue: Form validation errors on `0` or `false` values
**Solution:** The CLI now uses strict validation (`=== undefined || === null || === ''`) that correctly handles `0` and `false`. If using an older generated form, regenerate with `--force`.

### Issue: API 404 errors
**Solution:** Verify the backend server is running and routes are mounted in `backend/src/routes/index.js`.

### Issue: Missing `@radix-ui/react-dialog` or `@tanstack/react-query`
**Solution:** These are now listed in `frontend/package.json`. Run `pnpm install` in the frontend directory.

## Best Practices

1. **Use descriptive names**: `userProfile` not `up`
2. **Specify validation rules**: Always mark required fields
3. **Set constraints**: Use min/max for numbers, minLength for strings
4. **Keep it modular**: One module per domain concept
5. **Choose the right form mode**: Use `modal` for quick actions, `sidepanel` for complex forms, `page` for full views
6. **Test generated code**: Always review and test generated files
7. **Version control**: Commit before running generators
8. **Customize after init**: Run `fsk customize` to set brand, theme, layout

## Next Steps

- See `DEVELOPER.md` for CLI development and extension patterns
- Check `packages/cli/README.md` for CLI development setup
- Review generated code in your project
- Run `fsk cleanup --preset production` before shipping
- Join the community at the repo issues for questions and feature requests

## Support

For issues or questions:
1. Check this guide and the `--help` output
2. Review `DEVELOPER.md` for architecture details
3. Check generated code comments for implementation hints
4. Run `fsk <command> --help` for per-command help
5. File an issue on GitHub