# CLI Developer Guide

## Package Structure

```
packages/cli/
├── bin/
│   └── cli.js              # Commander entry point (executable)
├── src/
│   ├── commands/
│   │   ├── init.js         # Project scaffolding (fresh copy)
│   │   ├── cleanup.js      # Cleanup: strip demo files, branding, test files
│   │   └── generate/
│   │       ├── module.js   # Backend module generator
│   │       ├── page.js     # Frontend page generator (with form modes)
│   │       ├── theme.js    # Shadcn theme importer
│   │       ├── deploy.js   # Deployment config generator
│   │       └── index.js    # Command registration
│   └── lib/                # (future) shared utilities
├── package.json           # CLI package manifest
└── README.md              # User-facing docs (this is separate)
```
packages/cli/
├── bin/
│   └── cli.js              # Commander entry point (executable)
├── src/
│   ├── commands/
│   │   ├── init.js         # Project scaffolding (fresh copy)
│   │   └── generate/
│   │       ├── module.js   # Backend module generator
│   │       ├── page.js     # Frontend page generator
│   │       ├── theme.js    # Shadcn theme importer
│   │       ├── deploy.js   # Deployment config generator
│   │       └── index.js    # Command registration
│   └── lib/                # (future) shared utilities
├── package.json           # CLI package manifest
└── README.md              # User-facing docs (this is separate)

Monorepo root:
- Template source: https://github.com/dellzetter-lang/starter-kit-mern
- Downloaded as tar.gz archive: https://github.com/dellzetter-lang/starter-kit-mern/archive/refs/heads/main.tar.gz
- Workspace package (if linking): root package.json "workspaces": ["packages/*"]
```

## How It Works

### Entry Point Flow

1. **bin/cli.js** — initializes Commander, registers commands with subcommands `init`, `generate`, `cleanup`, `remove`, `customize`, and `wizard`, sets up aliases, and exports the program.

2. **Command handlers** — each file under `src/commands/` exports a default async function with signature:
   - `init(projectName, options)` — `projectName` comes from first positional arg, `options` = parsed flags
   - `generate(subcommand, name, options)` — `name` is the resource name (module/page/theme/deploy), `options` = flags
   - `cleanup(options)` — runs one of the cleanup presets (minimal/production/template)

3. **Template flow for `init`**:
    - Create temp dir `os.tmpdir()/fsk-<timestamp>`
    - Download GitHub tar.gz with manual 302 redirect handling
    - Extract with `tar-stream` using `strip: 1` (removes top-level folder)
    - Copy extracted files **directly** from tempDir → destination (no nested folder)
    - Customize `frontend/src/config/app-preset.js` using selected preset + brand/theme/layout/dataDisplay overrides
     - Loop through `extraModules` → call `generateBackendModule()` for each
     - Loop through `deployTargets` → call `generateDeployConfig()` for each
     - Ensure `frontend/src/utils/sanitize.js` exists for form sanitization
     - Optionally run `pnpm install` in destination

 4. **Template flow for `generate`** — operates in-place on an existing project:
    - `module <name>`: writes 5 files under `backend/src/modules/<name>/`, mounts route in `backend/src/routes/index.js`, optionally generates frontend page with form
    - `page <name>`: writes `frontend/src/pages/<name>/<Name>Page.jsx` with correct hook import (`@/hooks/useAuth`), adds lazy import to `AppRouter.jsx`, inserts `<Route>` before the wildcard 404 route, updates `navigation` in `app-preset.js`
    - `page <name> --form-mode modal`: wraps form in a Radix `Dialog` overlay with open/close state
    - `page <name> --form-mode sidepanel`: wraps form in a Radix `Sheet` overlay with open/close state
    - `page <name> --form-mode inline`: embeds form directly in page (default)
    - `theme`: parses CSS from `--file` or `--paste`, saves CSS file, prints import instructions
    - `deploy <target>`: writes Dockerfile/docker-compose.yml, vercel.json, or railway.yaml to project root

### Safety Model

- `init` always creates a **new directory**; never modifies existing content except via `--force` when dest dir is non-empty.
- `generate` commands refuse to overwrite existing files unless `--force` is passed.
- The template **is never modified in-place**; download → extract → copy to dest → then mutate.
- `cleanup` is non-destructive to user code — only removes known demo patterns and replaces known branding strings.

## Cleanup Command

Removes demo files, sample data, starter kit branding, and optionally test files. Three presets:

### Implementation: `src/commands/cleanup.js`

- **minimal**: Removes `frontend/src/pages/demo/`, `frontend/src/pages/examples/`, `frontend/src/components/demo/`, and replaces starter kit branding strings in `README.md` and `package.json`
- **production**: Minimal + removes `.test.js`/`.spec.js` files and `__tests__/` directories from both frontend and backend
- **template**: Extracts reusable UI components (dialogs, sheets, utils) into `.template/` directory and resets branding

### Usage

```bash
# Interactive prompt
fsk cleanup

# Non-interactive
fsk cleanup --preset minimal
```

## Local Development & Testing

Before publishing to npm, you should test the CLI locally to ensure all commands work as expected in a real-world scenario.

### 1. Direct Execution
The simplest way to run the CLI during development is to point Node directly to the entry script:
```bash
# From packages/cli directory
node bin/cli.js --help

# Run init from a different directory
node /path/to/fsk/packages/cli/bin/cli.js init my-new-app
```

### 2. Global Linking (Recommended)
To test the `fsk` command globally as if it were installed via npm:
```bash
# From packages/cli directory
pnpm link --global

# Now you can use 'fsk' anywhere
fsk --version
fsk doctor
```
*Note: If using `npm`, use `npm link`. To undo, use `pnpm unlink --global @fullstack-starter/cli`.*

### 3. Testing Scaffolding
To verify the full generation flow:
1. Create a temporary test directory.
2. Run `fsk init test-app`.
3. Enter the new app: `cd test-app`.
4. Run `pnpm dev` to ensure the project starts correctly.
5. Test generation: `fsk make:resource Product --fields "name:str;price:num"`.

### 4. Production Dry-Run (npm pack)
To see exactly what files will be included in the npm package:
```bash
# From packages/cli directory
npm pack --dry-run
```
This will list all files that will be uploaded to npm based on the `files` array in `package.json`.

## Publication Readiness Checklist

- [ ] Version bumped in `package.json` (following Semantic Versioning).
- [ ] `npm audit` returns zero high-severity vulnerabilities.
- [ ] `pnpm test` passes with 85%+ coverage.
- [ ] `fsk doctor` passes in a clean environment.
- [ ] `README.md` and `CLI_USAGE.md` are up to date.
- [ ] Multi-platform check (Windows/macOS/Linux).
- [ ] Node.js compatibility (18.x, 20.x, 22.x).fsk cleanup --preset production
fsk cleanup --preset template
```

### Branding Replacement Details

Scans all `.js`, `.jsx`, `.json` files under `frontend/src/` and `backend/src/` for the patterns "MERN Fullstack Starter Kit", "MERN Starter", and "Starter Kit", replacing them with "Project". Also renames package from starter-kit names to `my-project`.

## Form Generation

## Local Testing

### Automated smoke test (recommended)

From `packages/cli/`:

```bash
node test-smoke.js
```

Coverage:
- `init` + `--preset` + `--no-install` + `--force`
- `generate module` → files + route mount
- `generate page` → component + lazy import + route (before wildcard) + navigation entry
- `generate page --force` → overwrite + idempotency (import, route, nav already present)
- `generate deploy --target all` → Dockerfile, docker-compose.yml, vercel.json, railway.yaml
- `remove page` → directory, import, route, nav entries removed
- `generate module` then `remove module` → module dir + route unmount
- Syntax validation: backend/src/routes/index.js, frontend/src/config/app-preset.js
- Presence checks for generated files and confirmation of removed items being absent

All steps must pass before publishing.

### Manual step-by-step validation

```bash
# ── Step 0: start fresh ──
rm -rf /tmp/fsk-manual && mkdir -p /tmp/fsk-manual
cd /tmp/fsk-manual

# ── Step 1: init ──
node /path/to/cli/bin/cli.js init demo --preset saas --no-install --target . --force
cd demo

# ── Step 2: generate module ──
node ../../bin/cli.js generate module users
# Check: backend/src/modules/users/*.js exists, backend/src/routes/index.js has router.use("/users", ...)

# ── Step 3: generate page ──
node ../../bin/cli.js generate page reports --route /reports --icon bar-chart
# Check: frontend/src/pages/reports/ReportsPage.jsx exists, AppRouter.jsx has lazy import and route before wildcard, app-preset.js nav entry added

# ── Step 4: customize ──
node ../../bin/cli.js customize theme set operationsDense
node ../../bin/cli.js customize layout set rightRailStudio
node ../../bin/cli.js customize brand set --name "Acme" --tagline "Quality"
node ../../bin/cli.js customize data set denseOps
# Verify: frontend/src/config/app-preset.js reflects all above

# ── Step 5: theme import ──
node ../../bin/cli.js customize theme import --paste ":root { --primary: 250 80% 60%; }"
# Check: frontend/src/config/imported-shadcn-theme.css created; console prints installShadcnDesignPreset snippet

# ── Step 6: remove page ──
node ../../bin/cli.js remove page reports --force
# Check: frontend/src/pages/reports/ gone; AppRouter.jsx import & route removed; app-preset.js nav entry gone

# ── Step 7: generate deploy ──
node ../../bin/cli.js generate deploy --target all
# Check: Dockerfile, docker-compose.yml, vercel.json, railway.yaml at project root
```

### Linking the CLI for live development

During CLI development, you can symlink the package globally to test in any project without rebuilding:

```bash
# In packages/cli
pnpm link --global   # or: npm link

# In your test project
cd my-starter-project
fsk --version  # should show CLI version
fsk customize brand set --name "LiveTest"
```

Changes to CLI source files are reflected immediately (ESM hot-reload via Node.js module cache invalidation on next invocation). No transpilation or build step is required.

### Testing against template changes

If you modify the template source constants in `init.js` (`TEMPLATE_REPO`, `DEFAULT_BRANCH`), verify the download and extraction still work:

```bash
node bin/cli.js init verify-test --target /tmp/verify --preset clinic --no-install --force
ls /tmp/verify/verify-test/frontend/src/App.jsx   # should exist
cat /tmp/verify/verify-test/frontend/src/config/app-preset.js | head -5
```

The automated smoke test covers:
- `init` with `--force` and preset
- `generate module` (files + mount)
- `generate page` (lazy import, route before wildcard, nav)
- `generate page --force` (idempotency)
- `generate deploy --target all` (Docker, Vercel, Railway)
- `remove page` (cleanup of dir, import, route, nav)
- `generate module` then `remove module` (directory + unmount)
- Syntax validation (Node .js files) and presence checks for generated assets

### Manual command-by-command validation

```bash
# 1 — init a fresh project
cd packages/cli
node bin/cli.js init demo --preset saas --no-install --target ./tmp --force

# 2 — cd into it and test each command
cd tmp/demo

# Generate module
node ../../bin/cli.js generate module products
# Verify: backend/src/modules/products/*.js exists, router.use("/products") in backend/src/routes/index.js

# Generate page
node ../../bin/cli.js generate page reports --route /reports --icon bar-chart
# Verify: frontend/src/pages/reports/ReportsPage.jsx, lazy import in AppRouter.jsx, route before *, nav entry in app-preset.js

# Remove page
node ../../bin/cli.js remove page reports --force
# Verify: page dir gone, import removed, route removed, nav entry gone

# Regenerate page, then customize
node ../../bin/cli.js generate page reports
node ../../bin/cli.js customize layout set topbarPortal
node ../../bin/cli.js customize brand set --name "Acme" --tagline "Innovate"
node ../../bin/cli.js customize theme set clinicSoft
node ../../bin/cli.js customize data set editorial
# Verify: frontend/src/config/app-preset.js reflects all changes

# List discovery
node ../../bin/cli.js customize list-themes
node ../../bin/cli.js customize list-layouts

# Deploy configs
node ../../bin/cli.js generate deploy --target all
# Verify: Dockerfile, docker-compose.yml, vercel.json, railway.yaml exist at project root

# Wizard (interactive; run manually inside project)
node ../../bin/cli.js wizard
# Follow prompts to add page/module/deploy; verify each step as above
```

### On your own project

```bash
# Clone starter kit somewhere
git clone https://github.com/dellzetter-lang/starter-kit-mern my-project
cd my-project
pnpm install

# Link local CLI for development
cd path/to/cli/packages/cli
npm link  # or pnpm link --global
# Then from your project:
cd my-project
fsk --version  # should show CLI version
fsk customize brand set --name "MyBrand" --tagline "Unique value"

# Make code changes in the CLI, then re-test immediately (no rebuild needed; CLI is ESM)
```

### Project structure validation

After any operation, check:

```bash
# No syntax errors in generated .js
node --check backend/src/routes/index.js
node --check frontend/src/config/app-preset.js

# Page component compiles
node -e "require('fs').readFileSync('frontend/src/pages/reports/ReportsPage.jsx','utf-8')"  # just reads

# AppRouter has correct lazy imports count
grep -c 'lazy(() => import' frontend/src/routes/AppRouter.jsx
```

### Testing against template changes

If you update `TEMPLATE_REPO` or `DEFAULT_BRANCH` in `init.js`, verify the archive still downloads and extracts correctly:

```bash
# Clean temp test
rm -rf /tmp/fsk-template-test
node bin/cli.js init tst --target /tmp/fsk-template-test --force --preset studio --no-install
ls /tmp/fsk-template-test/tst/frontend/src/config/app-preset.js
```

### Smoke-test script

Create `packages/cli/test-smoke.js`:

```js
#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

const TSHIRT = path.resolve('tshirt');
if (fs.existsSync(TSHIRT)) fs.removeSync(TSHIRT);

console.log('→ init');
execSync('node bin/cli.js init tshirt --preset saas --no-install --target .', {
  cwd: process.cwd(),
  stdio: 'inherit',
});

console.log('→ generate module');
execSync('node bin/cli.js generate module users', {
  cwd: TSHIRT,
  stdio: 'inherit',
});

console.log('→ generate page');
execSyncer('node bin/cli.js generate page dashboard --route /admin --icon shield', {
  cwd: TSHIRT,
  stdio: 'inherit',
});

console.log('✓ all smoke tests passed');
```

Run with `node test-smoke.js` inside `packages/cli`.

### Validating generated code

```bash
# Check Node syntax of generated files
node --check test-output/my-test-app/backend/server.js
node --check test-output/my-test-app/backend/src/routes/index.js

# Lint (if template has eslint configured)
cd test-output/my-test-app
pnpm lint

# Type-check frontend (if using TypeScript)
pnpm tsc --noEmit
```

## Making Changes

## Command Architecture

The CLI uses **Commander** with a flat import structure. All command handlers are plain async functions that receive `(arg1, arg2, options)` based on command signature:

- `init(projectName, options)` — first positional = project name, second = options obj
- `generate.*(name, options)` — first positional = resource name, second = options obj
- `remove(type, name, options)` — first positional = resource type, second = name, third = options
- `wizard(options)` — only options object (no positional args)

### Registration (`bin/cli.js`)

```js
import init from '../src/commands/init.js';
import generateModule from '../src/commands/generate/module.js';
import remove from '../src/commands/remove.js';
import wizard from '../src/commands/wizard.js';

program
  .command('init [project-name]')
  .options(...)
  .action(init);

const generateCmd = program.command('generate').description(...);
generateCmd.command('module <name>').action(generateModule);

program
  .command('remove <type> <name>')
  .option('--force')
  .action(remove);

program
  .command('wizard')
  .option('--skip-confirm')
  .action(wizard);
```

### Extending with a new top-level command

1. **Create file** `src/commands/<name>.js`:

```js
export default async function myCmd(arg1, arg2, options) {
  // implementation
}
```

2. **Import and register** in `bin/cli.js`:

```js
import myCmd from '../src/commands/my-cmd.js';
program
  .command('mycmd <arg1> <arg2>')
  .description('What it does')
  .option('--flag <value>')
  .action(myCmd);
```

3. Update `README.md` and `DEVELOPER.md` accordingly.

### Customize command internals

The `customize` command uses **multiple handler functions** (one per subcommand) exported from `src/commands/customize.js`:

```js
export async function customizeThemeSet(theme, options) { ... }
export async function customizeThemeImport(options) { ... }
export async function customizeLayoutSet(layout) { ... }
export async function customizeBrandSet(options) { ... }
export async function customizeDataSet(template) { ... }
export function customizeListThemes() { ... }
```

**Key pattern:**

1. Validate project by checking `frontend/src/config/app-preset.js` exists.
2. Read file with `fs.readFile`.
3. Perform **line-based regex replacement** to swap values (e.g., `layout: designLayouts.xxx` → `layout: designLayouts.new`).
4. Write back with `fs.writeFile`.
5. Report result via `ora` spinner.

The regex approach preserves all comments, formatting, and user customizations outside the replaced line. It's safe even if the user hand-edits their `app-preset.js`.

### Adding a new customize action

For a new design token (e.g., typography):

1. Add constant to `customize.js`: `const TYPOGRAPHY_VARIANTS = ['sans', 'serif', 'mixed'];`
2. Add handler:

```js
export async function customizeTypographySet(variant) {
  const spinner = ora();
  const projectRoot = process.cwd();
  let presetCode = await ensureProject(projectRoot);
  if (!TYPOGRAPHY_VARIANTS.includes(variant)) { /* error */ }
  presetCode = presetCode.replace(/typography:\s*typography presets?\.\w+/, `typography: typographyPresets.${variant}`);
  await fs.writeFile(getPresetPath(projectRoot), presetCode);
  spinner.succeed(`Typography set to "${variant}"`);
}
```

3. Export it in the default `export default { ... }` object.
4. Register in `bin/cli.js`:

```js
const typographyCmd = customizeCmd.command('typography').description('Typography operations');
typographyCmd
  .command('set <variant>')
  .description('Set typography variant')
  .action(customize.customizeTypographySet);
```

5. Update help text in `README.md`.

### Generator reuse (wizard, tests, CI)

Generators are plain functions; they can be imported and called directly without spawning a subprocess. The `wizard` uses this to batch multiple operations:

```js
import pageGenerator from '../commands/generate/page.js';
await pageGenerator(projectRoot, 'reports', { route: '/reports', icon: 'bar-chart', noNav: false, force: false });
```

Generators rely on `process.cwd()` for project root; the wizard temporarily `chdir`s to target project before invoking each generator, then restores.

## Form Generation

The page generator (`fsk generate page <name> --with-form`) creates both a page component and a form component with built-in validation, sanitization, and configurable layout.

### Form Modes (`--form-mode`)

| Mode | Behavior | UI Components |
|------|----------|---------------|
| `page` (default) | Form embedded directly in the page | None — standard form |
| `modal` | Form opens in a Dialog overlay | `@radix-ui/react-dialog` (Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription) |
| `sidepanel` | Form slides in from the right | `@radix-ui/react-dialog` (Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription) |
| `inline` | Minimal form-only layout | None — direct embed |

### Implementation: `src/commands/generate/page.js`

**Key functions:**

- `generatePageComponent(pageName, routeName, formFields, formMode)` — generates the page component based on form mode
- `generateFormComponent(pageName, fields)` — generates the form component with validation + sanitization
- `parseFormFields(str)` — parses field spec string `"name:type:rule1|rule2;name2:type2"`
- `askFormFields()` — interactive prompt for field-by-field definition

**Generated form features:**

- **`onSuccess` callback prop** — `export function XxxForm({ onSuccess } = {})`. When provided by a modal/sidepanel page, called after successful submit to close the overlay
- **Strict validation** — Required fields use `values.field === undefined || values.field === null || values.field === ''` to correctly validate `0` and `false`
- **Boolean default** — `false` (not `""`), checked via `type === 'checkbox' ? checked : value`
- **Number default** — `0`, with min/max validation that skips undefined/null
- **Input sanitization** — Imports `sanitizeEmail`, `sanitizeUrl`, `sanitizePhone`, `sanitizeText` from `@/utils/sanitize`
- **Reset on submit** — After successful POST, form resets all fields to their default values

### Usage

```bash
# Default embedded form
fsk generate page product --with-form --form-fields "name:string:required;price:number:min=0;active:boolean"

# Modal form
fsk generate page customer --with-form --form-mode modal --form-fields "name:string:required;notes:textarea"

# Sidepanel form
fsk generate page settings --with-form --form-mode sidepanel --form-fields "name:string:required"

# Inline form
fsk generate page search --with-form --form-mode inline --form-fields "query:string:required"

# Interactive (prompts for each field)
fsk generate page product --with-form --interactive
```

### Adding a forgotten field

Re-run the generator with the complete field list and `--force`:

```bash
# Already have "product" page with name + price; forgot "active"
fsk generate page product --with-form \
    --form-fields "name:string:required;price:number:min=0;active:boolean" \
    --force
```

Routes and navigation entries are idempotent — no duplicates on re-run.

### Customize command

The `customize` group provides targeted, in-place edits to `frontend/src/config/app-preset.js` on an existing project. It avoids full regeneration and gives fine-grained control over design tokens.

#### Subcommands

| Subcommand | Purpose | Example |
|------------|---------|---------|
| `customize theme set <theme>` | Switch to a built-in theme | `fsk customize theme set clinicSoft` |
| `customize theme import` | Save custom shadcn CSS & print manual integration snippet | `fsk customize theme import --file ./theme.css` |
| `customize layout set <layout>` | Change layout shell | `fsk customize layout set rightRailStudio` |
| `customize brand set` | Update brand name/tagline (one or both) | `fsk customize brand set --name "Acme" --tagline "Innovate"` |
| `customize data set <template>` | Switch data display template for dashboard | `fsk customize data set denseOps` |
| `customize list-themes` | Show all built-in themes | `fsk customize list-themes` |
| `customize list-layouts` | Show all layout shells | `fsk customize list-layouts` |
| `customize list-data` | Show all data templates | `fsk customize list-data` |

#### Implementation: `src/commands/customize.js`

- **Project detection:** checks for `frontend/src/config/app-preset.js`
- **Edit strategy:** reads file, uses regex to replace specific values, writes back
- **Themes:** `replace(/theme:\s*designThemes\.\w+/, 'theme: designThemes.${theme}')`
- **Layouts:** similar pattern `layout: designLayouts.xxx`
- **Brand:** two independent replacements (name field, tagline field)
- **Data display:** `dataDisplay: dataDisplayTemplates.xxx`
- **Theme import:** writes CSS file, prints code snippet; does **not** auto-modify preset (manual step ensures correctness)

#### Use cases

1. **Quick rebrand** after init: `fsk customize brand set --name "MyCompany" --tagline "Your tagline"`
2. **Layout swap** without regenerating: `fsk customize layout set topbarPortal`
3. **Apply custom design system**: generate shadcn CSS from Figma → `fsk customize theme import --file brand.css` → manually paste `installShadcnDesignPreset` call into preset
4. **Data-dense vs editorial** dashboard: `fsk customize data set editorial`

### Safety patterns

- All file writes use `fs-extra` (atomic on most platforms)
- All modifications check for existence first unless `--force` is passed
- Remove operations are **idempotent** — safe to run twice; missing items produce warnings, not errors
- Interactive confirmation (`remove` and `wizard`) prevents accidental data loss
- No global state mutation; each command is isolated

## Remove Command

The `remove` command safely deletes previously generated resources and cleans up all references:

### Usage

```bash
# Remove a page (interactive confirmation)
fsk remove page reports

# Remove a module (skip confirmation)
fsk remove module products --force
```

### Implementation: `src/commands/remove.js`

- **`remove page <name>`** deletes:
  - `frontend/src/pages/<name>/` directory
  - Lazy import line from `AppRouter.jsx` (`const <Name>Page = lazy(...)`)
  - Route block (`{/* Name */} <Route ... />`) from `AppRouter.jsx`
  - Navigation entry from `frontend/src/config/app-preset.js`
- **`remove module <name>`** deletes:
  - `backend/src/modules/<name>/` directory
  - Mount line `router.use("/<name>", ...)` from `backend/src/routes/index.js`

All operations are idempotent: already-missing items log a warning and continue.

### Extension

Add new resource types by extending the switch in `removeCmd()` and implementing `remove<Type>()` with the same pattern:
- Delete files/directories
- Strip references from parent config files (regex or line-based)
- Use `spinner.succeed/warn()` for consistent UX

## Wizard Command

The `wizard` command provides an interactive, multi-step guide to extend an existing project. It can be run after `init` or anytime during development.

### Usage

```bash
cd my-project
fsk wizard
# optionally: fsk wizard --skip-confirm (no summary step)
```

### Workflow

1. **Validate** — checks for `frontend/src/App.jsx` to confirm project type
2. **Action selection loop** — user picks from:
   - Add backend module
   - Add frontend page
   - Import shadcn theme
   - Generate deploy configs
   - Remove something
   - Done
3. **Per-action prompts** — collects necessary inputs (name, route, icon, etc.)
4. **Summary** — lists all pending actions with confirmation
5. **Execution** — runs each step sequentially, changing `process.cwd()` to the project root and calling generator functions directly (no shell spawn)
6. **Result** — success/failure per step with clear spinners

### Implementation: `src/commands/wizard.js`

- Imports generators directly: `pageGenerator`, `moduleGenerator`, `deployGenerator`, `themeGenerator`, `removeCommand`
- Changes `process.cwd()` to project root before invoking generators, then restores
- Collects steps as plain objects: `{ type: 'generate', subtype: 'page', name, options }` or `{ type: 'remove', resourceType, name }`
- Supports `--skip-confirm` to bypass the summary prompt

### Extensibility

Add new wizard actions by:
- Adding a choice in the main inquirer list
- Writing a prompt block that pushes a `{ type: 'generate', subtype: 'new-type', ... }` step
- Adding a `case 'new-type'` in the execution switch that calls the appropriate generator function

The wizard is designed as a **composition layer** over existing generators — no new business logic, just orchestration.

## Expansion Criteria (v2 / v3)

### New `init` features
- [ ] `--db <postgres|mysql|sqlite>` to switch database adapter (currently MongoDB-only)
- [ ] `--auth <jwt|oauth>` flag to scaffold OAuth providers (Google/GitHub)
- [ ] `--monorepo` toggle (pnpm workspaces, turborepo)
- [ ] `--typescript` toggle for backend (currently JS)
- [ ] `--test-framework <vitest|jest>` for scaffolding test files
- [ ] Preset export/import (`--preset-file my-preset.json`)
- [ ] Template version pinning (`--version v1.4.0`)

### New `generate` subcommands
- [ ] `fsk generate test <module>` — scaffold Jest/Vitest unit tests for a module
- [ ] `fsk generate hook <useX>` — React hook boilerplate with SWR/React Query
- [ ] `fsk generate migration <name>` — database migration file (Mongoose or Prisma)
- [ ] `fsk generate component <name>` — shadcn/ui component boilerplate
- [ ] `fsk generate api <endpoint>` — REST endpoint scaffold with validation + docs

### New top-level commands
- [x] `fsk remove <type> <name>` — safely delete generated pages/modules with cleanup (imports, routes, nav)
- [x] `fsk wizard` — interactive guided workflow to extend your project
- [x] `fsk customize` — modify design tokens & branding on an existing project (theme/layout/brand/data)
- [ ] `fsk doctor` — validate project integrity (missing files, broken imports, unmounted routes)
- [ ] `fsk upgrade` — migrate project to newer template version
- [ ] `fsk plugin <name>` — manage extension plugins (install/enable/disable)

### Quality of life
- [ ] Dry-run mode (`--dry-run`) for all commands (print changes without writing)
- [ ] Backup before overwrite (`--backup` creates `.backup_<timestamp>` dirs)
- [ ] Diff preview (`--diff` shows what would change)
- [ ] Interactive post-init wizard: "What would you like to add next?"
- [ ] Plugin system: load external generators from `~/.fsk/plugins/`

### Platform integrations
- [ ] `fsk deploy <platform>` — one-command deploy to Vercel/Railway/Heroku
- [ ] `fsk env pull` — fetch env from deployed service
- [ ] `fsk db seed` — run seed script after init
- [ ] `fsk logs` — stream logs from deployed service

## Release Checklist (pre-npm publish)

- [ ] Version bump in `package.json` (semver)
- [ ] `README.md` updated with new flags/subcommands (init/generate/remove/wizard/customize)
- [ ] `DEVELOPER.md` updated with architecture changes, extension guides
- [ ] `CHANGELOG.md` entry added
- [ ] Run full smoke test locally: `node test-smoke.js` (covers init, generate, remove, deploy, syntax)
- [ ] Manual smoke of customize: 
  - `fsk customize theme set clinicSoft`
  - `fsk customize brand set --name "X" --tagline "Y"`
  - `fsk customize layout set topbarPortal`
  - `fsk customize data set editorial`
  - `fsk customize list-themes` (no error)
- [ ] Build if needed (ESM — no transpilation required)
- [ ] `npm pack` to verify tarball contents include all new command files
- [ ] Publish: `npm publish --access public` (from `packages/cli/`)
- [ ] Verify on npm: `npm view @fullstack-starter/cli`
- [ ] Smoke-test from clean machine: `npx @fullstack-starter/cli init fresh-app`

## Known Limitations & Gotchas

- Archive `strip: 1` removes the top-level folder; copy must reference `tempDir` directly (fixed 2026-05-05)
- `ora` API uses `.warn()`, not `.warning()` (fixed)
- Page generator inserts route **before** `path="*"` wildcard to keep it reachable; also adds lazy import (fixed 2026-05-05)
- `useAuth` hook lives in `@/hooks/useAuth.js`, not `@/context/AuthContext`; generator template reflects this
- Commander passes positional `(projectName, options)` — do not swap order (fixed)
- Non-interactive mode requires all flags; missing ones fall back to presets
- `init --force` clears existing directory before copying (added 2026-05-05)
- `remove` command uses line-based heuristics to strip route blocks; may fail on heavily hand-edited `AppRouter.jsx` files (safe fallback: manual cleanup)
- `wizard` requires an interactive TTY (does not support fully piped input)
- `customize` commands edit `app-preset.js` via regex; they assume the file uses the standard template structure. If you have heavily customized `app-preset.js` by hand, run `fsk customize` with care and review diffs.
- `customize theme import` does **not** auto-edit `app-preset.js`; you must paste the printed snippet manually. This is intentional to avoid unintended code injection.

## Architecture Decision Record (summarized)

### Philosophy: Unique from day one

The CLI is designed to make every project instantly recognizable as "custom" by its creators:

- **Presets + overrides** — `init` applies a named preset, but every field (brand, theme, layout, dataDisplay) can be overridden via post-init `customize` commands
- **Theme extensibility** — 5 built-in themes + custom shadcn import (`installShadcnDesignPreset`) → unlimited palette variations
- **Layout shells** — 4 distinct layout families, each with their own component tree patterns, enabling different UX feels
- **Brand-first defaults** — Brand name and tagline are always prompted during `init` (not left as "Starter Kit")
- **Customization CLI** — `fsk customize ...` lets teams iterate on design without regenerating or losing data

### Core ADRs

- **Separate npm package** — CLI is not part of starter kit; avoids cyclic deps, allows standalone install
- **On-demand download** — no git clone; GitHub archive fetched on each `init` (pinned to branch)
- **Additive-only generation** — safe by default; `--force` opt-in
- **No in-place template mutation** — downloaded archive treated as immutable source
- **Minimal dependencies** — commander, inquirer, fs-extra, chalk, ora, tar (no degit, no axios)
- **JavaScript (CJS inside ESM wrapper)** — template is JS; generators use CommonJS `require()` strings to match template style
