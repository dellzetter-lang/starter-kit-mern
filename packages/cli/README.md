# @fullstack-starter/cli

The official CLI for the MERN Fullstack Starter Kit. Scaffold new projects and extend existing ones with modular generators.

## Commands

| Command | Description |
|---------|-------------|
| `init [project-name]` | Create a new project from the starter kit template |
| `make:resource [name]` | Create a new CRUD resource from schema or wizard |
| `generate` | Add features to an existing project (`module`, `page`, `theme`, `deploy`) |
| `remove <type> <name>` | Remove a generated page or module, cleaning up references |
| `cleanup` | Clean up demo files and branding to prepare project |
| `customize` | Customize design & branding (`theme`, `layout`, `brand`, `data`) |
| `wizard` | Interactive guide to extend your project step-by-step |
| `doctor` | Check environment and project health |
| `preset [name]` | Apply a predefined configuration preset |
| `rollback` | Undo the last generation action |
| `finalize` | Prepare project for production (lint, test, build) |

## Installation

Use via npx (no install needed):

```bash
npx @fullstack-starter/cli init my-app
```

Or install globally:

```bash
pnpm add -g @fullstack-starter/cli
```

## Usage

### Initialize a new project

```bash
fsk init [project-name]
```

Interactive mode will ask for preset, theme, layout, brand, extra modules, deployment targets, and architecture level.

Non-interactive:

```bash
fsk init myapp \
  --preset clinic \
  --theme clinicSoft \
  --layout sidebarWorkspace \
  --brand-name "CareDesk" \
  --tagline "Patient management simplified" \
  --target ./projects \
  --no-install
```

Options:

- `--preset` — saas|clinic|studio|operations|commerce|custom (default: saas)
- `--theme` — executiveBlue|clinicSoft|studioElevated|operationsDense|commerceWarm
- `--layout` — hybridSaas|sidebarWorkspace|topbarPortal|rightRailStudio
- `--brand-name` — Custom brand name
- `--tagline` — Brand tagline
- `--extra-modules <list>` — Comma-separated backend modules to include (e.g., users,products)
- `--deploy-targets <list>` — Comma-separated deploy targets (docker,vercel,railway)
- `--no-install` — Skip pnpm install after scaffolding
- `--target <dir>` — Output parent directory (default: current dir)
- `--force` — Overwrite existing project directory
- `-h, --help` — Show help

### Generate inside an existing project

Navigate to your starter kit project, then run:

```bash
# Generate a new backend module
fsk generate module invoices

# Generate a new frontend page with route and navigation
fsk generate page settings --route /settings --icon settings

# Import a shadcn/ui theme (from file or pasted CSS)
fsk generate theme --file path/to/theme.css
fsk generate theme --paste ":root { --primary: 262 83% 58%; } .dark { --primary: 263 70% 64%; }"

# Output deployment configurations (optional)
fsk generate deploy --target all
```

#### Module generator

Creates `backend/src/modules/<name>/` with 5 files (model, service, controller, routes, validator) and mounts the route in `backend/src/routes/index.js`.

Generate a frontend page alongside the module:

```bash
fsk generate module orders --fields "name:string:required;total:number:min=0" --with-page
```

Form display mode for the generated page (default: `page`):

```bash
fsk generate module orders \
  --fields "name:string:required;total:number:min=0" \
  --with-page \
  --form-mode modal   # page|modal|sidepanel|inline
```

Options: `--force`, `--fields`, `--interactive`, `--architecture` (lightweight|moderate|advanced), `--with-page`, `--form-mode`

#### Page generator

Creates `frontend/src/pages/<name>/<Name>Page.jsx`, adds a lazy import to `AppRouter.jsx`, inserts a `<Route>` (before the wildcard 404), and optionally adds a navigation entry in `app-preset.js`.

**With a form:**

```bash
fsk generate page product --with-form --form-fields "name:string:required;price:number:min=0;isActive:boolean"
```

**Form display modes:**

```bash
# Default: form embedded directly in the page
fsk generate page product --with-form --form-fields "name:string:required"

# Modal: form opens in a Dialog overlay
fsk generate page product --with-form --form-mode modal --form-fields "name:string:required"

# Sidepanel: form slides in from the right via a Sheet
fsk generate page product --with-form --form-mode sidepanel --form-fields "name:string:required"

# Inline: minimal, form replaces page content
fsk generate page product --with-form --form-mode inline --form-fields "name:string:required"
```

**Interactive field definition:**

```bash
fsk generate page product --with-form --interactive
```

This prompts for each field's name, type, label, validation rules, min/max, pattern, placeholder, and helper text.

**Field specification format:**

```
name:type:rule1|rule2;name2:type2:ruleA|ruleB
```

Example:

```
name:string:required|minLength=3;price:number:min=0;email:email:required;active:boolean
```

Supported types: `string`, `text`, `email`, `password`, `number`, `boolean`, `date`, `datetime-local`, `time`, `tel`, `url`, `color`, `range`, `file`, `hidden`, `select`, `textarea`

Supported rules: `required`, `unique`, `minLength=N`, `maxLength=N`, `min=N`, `max=N`, `step=N`, `pattern=/regex/`, `default=value`, `accept=type`, `multiple`

**Quick field add (adding a forgotten field):**

If you forgot to add a field, just re-run the generator with the complete field list and `--force`:

```bash
# You already have a "product" page with name + price
# Add the missing "isActive" boolean field:
fsk generate page product --with-form \
    --form-fields "name:string:required;price:number:min=0;isActive:boolean" \
    --force
```

Routes and navigation entries are idempotent — they won't be duplicated.

Options: `--route`, `--no-nav`, `--icon`, `--force`, `--with-form`, `--form-mode` (page|modal|sidepanel|inline), `--form-fields`, `--interactive`

#### Theme generator

Parses shadcn CSS variables and outputs instructions for importing them into `app-preset.js`. The CSS is saved to `frontend/src/config/imported-shadcn-theme.css` for reference.

Options:
- `--file <path>` — Path to CSS file containing `:root` and `.dark`
- `--paste <css>` — Directly supply the CSS string
- `--fallback` — Fallback theme to use (default: executiveBlue)
- `--appearance` — Appearance recipe: elevated|quiet|soft|flatDense|warm

#### Deploy generator

Generates deployment config files for Docker, Vercel, or Railway. Files are created at project root.

Options:
- `--target` — docker | vercel | railway | all
- `--force` — Overwrite existing files

Generated files:
- Docker: `Dockerfile`, `docker-compose.yml`
- Vercel: `vercel.json`
- Railway: `railway.yaml`

---

### Cleanup

Remove demo files, sample data, and starter kit branding to prepare your project for production or distribution.

```bash
# Minimal: remove demo pages and replace branding
fsk cleanup --preset minimal

# Production: also strip test files and metadata
fsk cleanup --preset production

# Template: extract reusable UI components into .template/
fsk cleanup --preset template

# Interactive: choose mode from a prompt
fsk cleanup
```

Presets:
- **minimal** — Removes demo/example page directories and replaces starter kit branding in README and package.json
- **production** — Minimal + removes test files (`.test.js`, `__tests__/`)
- **template** — Extracts reusable UI components, lib utilities, and backend utils into a `.template/` directory for reuse in future projects

---

### Customize an existing project

Modify your project's design tokens, layout, branding, and data display templates directly from the CLI. All changes edit `frontend/src/config/app-preset.js` in-place.

#### Theme

```bash
fsk customize theme set executiveBlue
fsk customize theme import --file ./brand-theme.css
fsk customize theme import --paste ":root { --primary: 240 80% 60%; } .dark { --primary: 280 70% 65%; }"
```

#### Layout

```bash
fsk customize layout set hybridSaas
```

Options: `hybridSaas`, `sidebarWorkspace`, `topbarPortal`, `rightRailStudio`

#### Brand

```bash
fsk customize brand set --name "AcmeCorp" --tagline "Innovate daily"
```

#### Data display

```bash
fsk customize data set dashboard
```

Options: `dashboard`, `denseOps`, `editorial`, `commerce`

#### Discovery

```bash
fsk customize list-themes
fsk customize list-layouts
fsk customize list-data
```

---

### Remove generated resources

Safely delete a page or module and automatically clean up all references (imports, routes, navigation).

```bash
# Remove a page (will ask for confirmation)
fsk remove page reports

# Remove a module (skip confirmation with --force)
fsk remove module products --force
```

Options: `--force` — Skip interactive confirmation

---

### Wizard (interactive guide)

Run inside any MERN Starter project to get an interactive, step-by-step guide for extending your project:

```bash
cd my-project
fsk wizard
# optionally: fsk wizard --skip-confirm
```

The wizard lets you:
- Add backend modules
- Add frontend pages with forms
- Import shadcn themes
- Generate deploy configs
- Remove existing resources
- Run cleanup presets

All actions are batched and executed with a single confirmation.

Options: `--skip-confirm` — Skip the final confirmation step

---

## Local Development & Testing

### Run the CLI directly from source

```bash
cd packages/cli
pnpm install
node bin/cli.js --help

# Create test project
node bin/cli.js init my-test --preset saas --no-install --target /tmp --force

# Run other commands inside the generated project
cd /tmp/my-test
node ../../bin/cli.js generate module products --fields "name:string:required;price:number:min=0" --with-page
node ../../bin/cli.js generate page admin --route /admin --icon shield --with-form --form-mode modal --form-fields "title:string:required"
node ../../bin/cli.js customize theme set clinicSoft
node ../../bin/cli.js customize brand set --name "TestApp"
node ../../bin/cli.js remove page admin --force
node ../../bin/cli.js cleanup --preset minimal
```

### Automated smoke test

From `packages/cli/` run:

```bash
node test-smoke.js
```

This script exercises all core commands end-to-end:
- `init` → fresh project
- `generate module` → scaffold + mount (with tests for lightweight/moderate/advanced)
- `generate page` → component + lazy import + route + nav
- `generate page --form-mode modal|sidepanel|inline` → UI overlay variants
- `generate page --with-form` → form with validation, sanitization, `onSuccess` callback
- `generate page --force` → idempotent overwrite (add forgotten fields)
- `generate deploy --target all` → Docker/Vercel/Railway files
- `remove page` → full cleanup (dir, import, route, nav)
- `remove module` → unmount + directory deletion
- `cleanup --preset minimal|production|template`
- Syntax validation of generated `.js` files
- Presence checks for generated assets

### Validation checklist

After any operation, verify:

```bash
# No syntax errors
node --check backend/src/routes/index.js
node --check frontend/src/config/app-preset.js

# Page component rendered
ls frontend/src/pages/<name>/

# Router integrity
grep -c "lazy(() => import" frontend/src/routes/AppRouter.jsx
```

---

## Generated form features

Forms generated with `--with-form` include:

- **Input sanitization** — Email lowercasing, URL auto-prefix, phone stripping, HTML stripping for text fields. Imports `sanitizeEmail`, `sanitizeUrl`, `sanitizePhone`, `sanitizeText` from `@/utils/sanitize`.
- **Strict validation** — Required fields check `=== undefined || === null || === ''` to correctly validate `0` and `false`.
- **Boolean fields** — Default to `false`, render as checkboxes using `type === 'checkbox' ? checked : value`.
- **Number fields** — Default to `0`, with min/max validation that skips checks for undefined/null values.
- **onSuccess callback** — Form accepts an optional `onSuccess` prop called after successful submission. This enables modal/sidepanel forms to close automatically:

```jsx
<CustomerForm onSuccess={() => setShowForm(false)} />
```

---

## Safety

- `init` always creates a fresh project directory (non-destructive).
- `generate` commands are additive by default and refuse to overwrite existing files without `--force`.
- `customize` commands are **idempotent** — safe to run repeatedly; they replace values in-place without affecting other parts of `app-preset.js`.
- `remove` prompts for confirmation by default (use `--force` to skip); it only touches files it generated.
- `cleanup` only removes known demo directories and replaces known branding strings. It never deletes user-created files.
- No in-place modifications of the starter kit repo itself. The template is downloaded from GitHub (tagged release) via GitHub archives.

## Architecture

- The CLI downloads the starter kit on-demand from GitHub (pinned to `main` or latest release).
- All customizations are applied to the copied project only.
- Generators follow the established naming conventions and patterns of the starter kit.
- Form display modes use shadcn/ui primitives (`Dialog`, `Sheet`) for consistent, accessible overlays.

## Contributing

This CLI lives in `packages/cli` of the monorepo. To develop:

```bash
cd packages/cli
pnpm install
pnpm dev -- <command> [options]
```

## License

MIT