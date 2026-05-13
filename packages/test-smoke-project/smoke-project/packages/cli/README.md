# @fullstack-starter/cli

The official CLI for the MERN Fullstack Starter Kit. Scaffold new projects and extend existing ones with modular generators.

## Commands

| Command | Description |
|---------|-------------|
| `init [project-name]` | Create a new project from the starter kit template |
| `generate` | Add features to an existing project (`module`, `page`, `theme`, `deploy`) |
| `remove <type> <name>` | Remove a generated page or module, cleaning up references |
| `customize` | Customize design & branding (`theme`, `layout`, `brand`, `data`) |
| `wizard` | Interactive guide to extend your project step-by-step |

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

Interactive mode will ask for preset, theme, layout, brand, extra modules, and deployment configs.

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

Creates `backend/src/modules/<name>/` with 5 files and mounts the route in `backend/src/routes/index.js`.

Options: `--force` to overwrite existing files.

#### Page generator

Creates `frontend/src/pages/<name>/<Name>Page.jsx`, adds a lazy import to `AppRouter.jsx`, inserts a `<Route>` (before the wildcard 404), and optionally adds a navigation entry in `app-preset.js`.

Options:
- `--route` — Custom route path (default: `/${name}`)
- `--icon` — Lucide React icon name (default: layout)
- `--no-nav` — Skip adding to navigation
- `--force` — Overwrite existing files

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

### Customize an existing project

Modify your project's design tokens, layout, branding, and data display templates directly from the CLI. All changes edit `frontend/src/config/app-preset.js` in-place.

> **Why customize?** After `init`, your project is a fully working MERN app. Use `customize` to tweak individual attributes without re-running `init`, or to evolve the design over time (e.g., rebrand, seasonal theme change, layout A/B test).

#### Theme

Switch between **built-in** design themes:

```bash
fsk customize theme set executiveBlue
fsk customize theme set clinicSoft
fsk customize theme set studioElevated
fsk customize theme set operationsDense
fsk customize theme set commerceWarm
```

Or import a **custom shadcn/ui CSS** theme from your design system:

```bash
# From a file (must contain :root and .dark blocks)
fsk customize theme import --file ./brand-theme.css

# Or paste CSS inline
fsk customize theme import --paste ":root { --primary: 240 80% 60%; } .dark { --primary: 280 70% 65%; }"

# Optional: specify fallback theme if CSS is incomplete, and appearance recipe
fsk customize theme import --file ./theme.css --fallback executiveBlue --appearance elevated
```

The `import` command saves the CSS to `frontend/src/config/imported-shadcn-theme.css` and prints integration instructions — you'll need to paste a small code snippet into `app-preset.js` to activate it. This gives you full control beyond the 5 built-in themes.

#### Layout

Change the page layout shell (affects navigation, header, sidebar placement):

```bash
fsk customize layout set hybridSaas
fsk customize layout set sidebarWorkspace
fsk customize layout set topbarPortal
fsk customize layout set rightRailStudio
```

#### Brand

Update project name and tagline (appears in header, footer, landing page, browser title):

```bash
fsk customize brand set --name "AcmeCorp" --tagline "Innovate daily"
fsk customize brand set --name "AcmeCorp"              # only name
fsk customize brand set --tagline "Innovate daily"     # only tagline
```

#### Data display

Select a responsive data template for tables/metrics (the starter ships pre-made components for each):

```bash
fsk customize data set dashboard      # standard card + table layout
fsk customize data set denseOps       # compact, high-density rows
fsk customize data set editorial      # editorial/magazine style
fsk customize data set commerce       # product-grid style
```

#### Discovery

List available built-in options:

```bash
fsk customize list-themes
fsk customize list-layouts
fsk customize list-data
```

### Remove generated resources

Modify design tokens, layout, branding, and data display templates in-place by updating `frontend/src/config/app-preset.js`.

```bash
# Switch to a different built-in theme
fsk customize theme set clinicSoft

# Import a custom shadcn theme from CSS
fsk customize theme import --file ./my-theme.css
fsk customize theme import --paste ":root { --primary: 240 80% 60%; } .dark { --primary: 280 70% 65%; }" --fallback executiveBlue --appearance quiet

# Change layout shell
fsk customize layout set rightRailStudio

# Update brand identity
fsk customize brand set --name "AcmeCorp" --tagline "Innovate daily"

# Switch data display template (used by dashboard widgets)
fsk customize data set denseOps

# Discover available options
fsk customize list-themes
fsk customize list-layouts
fsk customize list-data
```

#### Notes

- `fsk customize theme import` saves the CSS to `frontend/src/config/imported-shadcn-theme.css` and prints code to paste into `app-preset.js` using `installShadcnDesignPreset`. This allows fully custom themes beyond the built-in palette.
- All `customize` commands edit `app-preset.js` in-place using regex replacement. They are idempotent — safe to run multiple times.
- To make your project unique, mix a built-in preset with custom overrides using `fsk customize brand set`, `fsk customize theme set`, etc. You can also edit `app-preset.js` directly for fine-grained control.

### Remove generated resources

Safely delete a page or module and automatically clean up all references (imports, routes, navigation).

```bash
# Remove a page (will ask for confirmation)
fsk remove page reports

# Remove a module (skip confirmation with --force)
fsk remove module products --force
```

Options:
- `--force` — Skip interactive confirmation

### Wizard (interactive guide)

Run inside any MERN Starter project to get an interactive, step-by-step guide for extending your project:

```bash
cd my-project
fsk wizard
# optionally: fsk wizard --skip-confirm
```

The wizard lets you:
- Add backend modules
- Add frontend pages
- Import shadcn themes
- Generate deploy configs
- Remove existing resources

All actions are batched and executed with a single confirmation.

Options:
- `--skip-confirm` — Skip the final confirmation step

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
node ../../bin/cli.js generate module products
node ../../bin/cli.js generate page admin --route /admin --icon shield
node ../../bin/cli.js customize theme set clinicSoft
node ../../bin/cli.js customize brand set --name "TestApp"
node ../../bin/cli.js remove page admin --force
```

### Automated smoke test

From `packages/cli/` run:

```bash
node test-smoke.js
```

This script exercises all core commands end-to-end:
- `init` → fresh project
- `generate module` → scaffold + mount
- `generate page` → component + lazy import + route + nav
- `generate page --force` → idempotent overwrite
- `generate deploy --target all` → Docker/Vercel/Railway files
- `remove page` → full cleanup (dir, import, route, nav)
- `generate module` then `remove module` → unmount + directory deletion
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

## Safety

- `init` always creates a fresh project directory (non-destructive).
- `generate` commands are additive by default and refuse to overwrite existing files without `--force`.
- `customize` commands are **idempotent** — safe to run repeatedly; they replace values in-place without affecting other parts of `app-preset.js`.
- `remove` prompts for confirmation by default (use `--force` to skip); it only touches files it generated.
- No in-place modifications of the starter kit repo itself. The template is downloaded from GitHub (tagged release) via GitHub archives.

## Architecture

- The CLI downloads the starter kit on-demand from GitHub (pinned to `main` or latest release).
- All customizations are applied to the copied project only.
- Generators follow the established naming conventions and patterns of the starter kit.

## Contributing

This CLI lives in `packages/cli` of the monorepo. To develop:

```bash
cd packages/cli
pnpm install
pnpm dev -- <command> [options]
```

## License

MIT
