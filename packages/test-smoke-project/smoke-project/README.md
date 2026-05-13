# MERN Starter

A reusable MERN monorepo starter with:

- Express + MongoDB + Mongoose backend
- React + Vite + Tailwind frontend
- shadcn-style theme variables
- refresh-token auth with httpOnly cookies
- configurable frontend presets for layout, branding, content, and theme
- module-based backend structure for easy expansion

The goal is simple: clone this project, change a preset, add your business modules, and ship an app that does not look identical to every other clone.

## Quick Start

```bash
pnpm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
pnpm dev
```

Backend: `http://localhost:5000`

Frontend: `http://localhost:5173`

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run backend and frontend together |
| `pnpm build` | Build the frontend |
| `pnpm lint` | Lint backend and frontend |
| `pnpm -C backend dev` | Run only the API |
| `pnpm -C frontend dev` | Run only the React app |
| `pnpm -C frontend build` | Build only the frontend |

## Project Structure

```txt
fullstack-starter-kit/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   └── auth/
│   │   ├── routes/
│   │   └── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   │   └── app-preset.js
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   └── package.json
├── pnpm-workspace.yaml
└── package.json
```

## Environment Variables

### Backend

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Main frontend URL |
| `CORS_ORIGINS` | Comma-separated allowed browser origins |
| `JWT_ACCESS_SECRET` | Secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN` | Default: `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Default: `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hash cost |
| `COOKIE_NAME` | Refresh cookie name |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, usually `/api` in local development |

## Auth Flow

This starter uses a safer token split:

- Access token: short-lived, stored only in React memory.
- Refresh token: stored in an httpOnly cookie.
- App load: frontend calls `/auth/me`.
- Expired API request: Axios attempts one shared silent refresh and retries the original request once.
- Failed refresh: frontend clears local auth state.

Auth files:

- Backend routes: `backend/src/modules/auth/auth.routes.js`
- Backend service: `backend/src/modules/auth/auth.service.js`
- Backend model: `backend/src/modules/auth/auth.model.js`
- Frontend API client: `frontend/src/api/axiosInstance.js`
- Frontend auth context: `frontend/src/context/AuthContext.jsx`

## Frontend Customization System

Most visual and structural customization lives in:

```txt
frontend/src/config/app-preset.js
```

You can change:

- brand name
- tagline
- landing page text
- auth page text
- dashboard placeholder cards
- responsive data display templates
- navigation items
- shadcn theme variables
- public page layout
- protected app layout
- sidebar side and width
- topbar alignment and position
- footer behavior
- content width, alignment, and padding

To switch presets:

```js
export const appPreset = presetVariants.clinic;
```

## Available App Presets

The easiest way to make a clone feel different is to switch `appPreset`.

| Preset | Layout | Theme Feel | Use When |
| --- | --- | --- | --- |
| `presetVariants.saas` | Hybrid topbar + sidebar | calm blue, quiet surfaces | General SaaS dashboards, admin panels, CRM-style apps |
| `presetVariants.clinic` | Sidebar workspace | emerald, soft radius | Clinic portals, booking systems, patient/staff dashboards |
| `presetVariants.studio` | Right sidebar | rose, elevated shadows | Creative tools, editorial workflows, review/approval apps |
| `presetVariants.operations` | Sidebar workspace | graphite, flat/no-shadow | Inventory, logistics, dense internal tools, reports |
| `presetVariants.commerce` | Topbar portal | amber, warm cards | Store dashboards, merchant portals, catalog/order apps |
| `presetVariants.shadcnPaste` | Hybrid | imported shadcn CSS | When you want to paste a shadcn theme directly |

Usage:

```js
// frontend/src/config/app-preset.js
export const appPreset = presetVariants.operations;
```

You can also mix one preset's layout with another preset's theme:

```js
export const appPreset = {
  ...presetVariants.commerce,
  layout: designLayouts.sidebarWorkspace,
  theme: presetVariants.studio.theme,
};
```

Use this when the product domain and interaction model differ. For example, a commerce admin may need a sidebar workspace for heavy catalog management, but still use the warmer commerce palette.

To create your own:

```js
export const appPreset = {
  brand: {
    name: "InvoiceFlow",
    tagline: "Billing workspace",
  },
  layout: {
    shell: {
      public: "topbar",
      protected: "sidebar",
    },
    topbar: {
      position: "sticky",
      alignment: "end",
      maxWidth: "7xl",
    },
    sidebar: {
      side: "left",
      width: "18rem",
    },
    footer: {
      enabled: true,
      position: "bottom",
      alignment: "start",
    },
    content: {
      maxWidth: "7xl",
      align: "center",
      padding: "comfortable",
    },
  },
  theme: {
    cssVars: myTheme,
  },
  landing: {
    badge: "Secure billing starter",
    title: "InvoiceFlow",
    description: "A MERN base for invoices, customers, and payment tracking.",
    primaryCta: "Create account",
    secondaryCta: "Sign in",
  },
  auth: {
    loginTitle: "Sign in",
    loginDescription: "Open your billing workspace.",
    registerTitle: "Create workspace",
    registerDescription: "Start with secure auth and add your billing flows.",
  },
  navigation: [
    { label: "Dashboard", href: "/dashboard", icon: "layout" },
  ],
  dashboardCards: [
    { title: "Invoices", description: "TODO: Connect invoice metrics." },
    { title: "Customers", description: "TODO: Connect customer data." },
  ],
  dataDisplay: dataDisplayTemplates.dashboard,
};
```

## Responsive Data Display

Data display templates live in:

```txt
frontend/src/config/data-display-templates.js
```

They help pages adapt to mobile and desktop without rebuilding layout logic.

| Template | Best For |
| --- | --- |
| `dataDisplayTemplates.dashboard` | Normal dashboards and admin overviews |
| `dataDisplayTemplates.denseOps` | Inventory, logistics, technical reports |
| `dataDisplayTemplates.editorial` | Creative and card-first workflows |
| `dataDisplayTemplates.commerce` | Orders, products, customers, merchant tools |

Use them with:

```jsx
<MetricGrid items={metrics} template={preset.dataDisplay.metrics} />
<ResponsiveRecordView columns={columns} rows={rows} template={preset.dataDisplay.records} />
```

On mobile, records display as readable cards. On larger screens, they can become denser table-style rows. The same component can support many project domains by changing columns, rows, and template settings.

## Available Design Layouts

Layouts live in:

```txt
frontend/src/config/design-layouts.js
```

| Layout | What It Does | Best For |
| --- | --- | --- |
| `designLayouts.hybridSaas` | Public pages use a topbar; protected pages use topbar + sidebar | SaaS apps, CRMs, admin dashboards |
| `designLayouts.sidebarWorkspace` | Public pages use a topbar; protected pages use sidebar-only workspace | Internal tools, inventory, operations, clinic systems |
| `designLayouts.topbarPortal` | Public and protected pages both use topbar-only navigation | Portals, small MVPs, consumer-ish apps |
| `designLayouts.rightRailStudio` | Protected pages use a right sidebar and full-width content | Creative tools, editors, canvas-first apps |

Layout usage:

```js
import { designLayouts } from "./design-layouts";

export const appPreset = {
  ...presetVariants.saas,
  layout: designLayouts.rightRailStudio,
};
```

When choosing a layout:

- Use `hybridSaas` when users need global account controls plus a persistent workspace menu.
- Use `sidebarWorkspace` when the app is task-heavy and users mostly live in protected pages.
- Use `topbarPortal` when there are only a few destinations or the app should feel lighter.
- Use `rightRailStudio` when the main content should dominate and controls belong beside it.

## Available Design Themes

Themes live in:

```txt
frontend/src/config/design-themes.js
```

These are complete design recipes, not just palettes. They include colors, dark mode values, border radius, border thickness, shadows, control height, card padding, and nav shape.

| Design Theme | Feel | Best For |
| --- | --- | --- |
| `designThemes.executiveBlue` | balanced, safe, professional | Generic SaaS, admin panels |
| `designThemes.clinicSoft` | calm green, soft radius, gentle shadows | Healthcare, education, scheduling |
| `designThemes.studioElevated` | rose accent, pill buttons, larger shadows | Creative tools, review workflows |
| `designThemes.operationsDense` | graphite, compact, flat, sharp borders | Inventory, logistics, dense reports |
| `designThemes.commerceWarm` | amber accent, warm medium-depth surfaces | Stores, orders, merchant dashboards |

Theme usage:

```js
import { designThemes } from "./design-themes";

export const appPreset = {
  ...presetVariants.saas,
  theme: designThemes.operationsDense,
};
```

Theme recipes control:

- color palette
- dark mode palette
- card radius via `--radius-card`
- button radius via `--radius-button`
- input radius via `--radius-input`
- nav item radius via `--radius-nav`
- border thickness via `--border-width`
- topbar/sidebar/footer border strength
- card shadows via `--shadow-card`
- button shadows via `--shadow-button`
- form/button density via `--control-height`
- card density via `--card-padding`

This means two teams can use the same components but get different visual personalities by changing only the preset.

Lower-level palette tokens are also exported as `designTokens.*` when you want to build your own theme recipe.

## Layout Options

The `layout.shell` setting controls the main page structure.

| Value | Meaning |
| --- | --- |
| `topbar` | Top navigation only |
| `sidebar` | Sidebar navigation only |
| `hybrid` | Topbar plus sidebar |
| `bare` | No topbar/sidebar shell |

You can set different layouts for public and protected pages:

```js
layout: {
  shell: {
    public: "topbar",
    protected: "hybrid",
  }
}
```

### Scenario: SaaS Dashboard

Best for admin panels, CRMs, dashboards, inventory apps.

```js
layout: {
  shell: { public: "topbar", protected: "hybrid" },
  topbar: { position: "sticky", alignment: "end", maxWidth: "7xl" },
  sidebar: { side: "left", width: "16rem" },
  footer: { enabled: true, position: "normal", alignment: "center" },
  content: { maxWidth: "7xl", align: "center", padding: "comfortable" }
}
```

### Scenario: Sidebar-Only Internal Tool

Best for apps where logged-in users spend most of their time inside a workspace.

```js
layout: {
  shell: { public: "topbar", protected: "sidebar" },
  sidebar: { side: "left", width: "18rem" },
  footer: { enabled: true, position: "bottom", alignment: "start" },
  content: { maxWidth: "screen", align: "full", padding: "compact" }
}
```

### Scenario: Marketing Site With Topbar Only

Best for simple apps, public portals, booking sites, and early MVPs.

```js
layout: {
  shell: { public: "topbar", protected: "topbar" },
  topbar: { position: "sticky", alignment: "center", maxWidth: "6xl" },
  footer: { enabled: true, position: "normal", alignment: "center" },
  content: { maxWidth: "4xl", align: "center", padding: "spacious" }
}
```

### Scenario: Right Sidebar

Useful for creative tools, editors, or apps where the canvas/content should lead.

```js
layout: {
  shell: { public: "topbar", protected: "sidebar" },
  sidebar: { side: "right", width: "20rem" },
  content: { maxWidth: "none", align: "full", padding: "compact" }
}
```

## Layout Reference

### `layout.topbar`

| Option | Values |
| --- | --- |
| `position` | `static`, `sticky`, `fixed` |
| `alignment` | `start`, `center`, `end` |
| `maxWidth` | `none`, `4xl`, `6xl`, `7xl`, `screen` |

### `layout.sidebar`

| Option | Example |
| --- | --- |
| `side` | `left` or `right` |
| `width` | `16rem`, `18rem`, `280px` |

### `layout.footer`

| Option | Values |
| --- | --- |
| `enabled` | `true`, `false` |
| `position` | `normal`, `sticky`, `bottom` |
| `alignment` | `start`, `center`, `end` |

### `layout.content`

| Option | Values |
| --- | --- |
| `maxWidth` | `none`, `4xl`, `6xl`, `7xl`, `screen` |
| `align` | `start`, `center`, `full` |
| `padding` | `compact`, `comfortable`, `spacious` |

## shadcn Theme Usage

You have two options.

### Option 1: Use JS Theme Objects

Paste shadcn-compatible CSS variable values into `theme.cssVars`.

```js
const myTheme = {
  light: {
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    card: "0 0% 100%",
    "card-foreground": "240 10% 3.9%",
    muted: "240 4.8% 95.9%",
    "muted-foreground": "240 3.8% 46.1%",
    primary: "346 77% 49%",
    "primary-foreground": "355 100% 97%",
    destructive: "0 84.2% 60.2%",
    border: "240 5.9% 90%",
    radius: "0.75rem",
  },
  dark: {
    background: "240 10% 3.9%",
    foreground: "0 0% 98%",
    card: "240 10% 3.9%",
    "card-foreground": "0 0% 98%",
    muted: "240 3.7% 15.9%",
    "muted-foreground": "240 5% 64.9%",
    primary: "346 77% 49%",
    "primary-foreground": "355 100% 97%",
    destructive: "0 62.8% 30.6%",
    border: "240 3.7% 15.9%",
  },
};
```

Then attach it:

```js
theme: {
  cssVars: myTheme,
}
```

The theme is applied by `ThemeProvider`, so components using Tailwind tokens like `bg-background`, `text-foreground`, `bg-primary`, and `border` update automatically.

### Option 2: Paste shadcn CSS Directly

If a shadcn theme gives you CSS like this:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 262 83% 58%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.875rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 263 70% 64%;
}
```

Paste it into a string and parse it:

```js
import { appearanceRecipes, designTokens } from "./design-themes";
import { installShadcnDesignPreset } from "@/lib/shadcn-theme";

const pastedShadcnCss = `
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 262 83% 58%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.875rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 263 70% 64%;
}
`;

export const appPreset = {
  ...presetVariants.saas,
  theme: installShadcnDesignPreset(pastedShadcnCss, {
    fallbackTheme: designTokens.calmBlue,
    appearance: appearanceRecipes.elevated,
  }),
};
```

Use `presetVariants.shadcnPaste` as a working example. The fallback theme fills in missing color variables. The appearance recipe adds radius, shadows, border thickness, and density that shadcn CSS may not include.

## Reuse Scenarios

### Inventory System

Change:

- brand to your company or system name
- protected shell to `sidebar`
- navigation to `Dashboard`, `Products`, `Stock In`, `Stock Out`, `Reports`
- dashboard cards to stock metrics
- backend modules to `products`, `stockIn`, `stockOut`, `reports`

### Clinic Portal

Change:

- preset to `presetVariants.clinic`
- navigation to `Appointments`, `Patients`, `Staff`, `Reports`
- theme to a calmer green or blue palette
- backend modules to `patients`, `appointments`, `visits`

### School Dashboard

Change:

- brand to school/product name
- navigation to `Students`, `Classes`, `Attendance`, `Payments`
- protected layout to `hybrid`
- backend modules to `students`, `classes`, `attendance`, `payments`

### SaaS Admin Console

Change:

- protected layout to `hybrid`
- topbar alignment to `end`
- sidebar width to `16rem`
- navigation to `Overview`, `Users`, `Billing`, `Settings`
- backend modules to `organizations`, `subscriptions`, `users`

## Adding Frontend Pages

1. Create a page:

```txt
frontend/src/pages/customers/CustomersPage.jsx
```

2. Add a route constant:

```js
export const ROUTES = {
  DASHBOARD: "/dashboard",
  CUSTOMERS: "/customers",
};
```

3. Add it to `AppRouter.jsx`:

```jsx
<Route path={ROUTES.CUSTOMERS} element={<AppShell secure><CustomersPage /></AppShell>} />
```

4. Add navigation in `app-preset.js`:

```js
navigation: [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "layout" },
  { label: "Customers", href: ROUTES.CUSTOMERS, icon: "users" },
]
```

5. If you need a new icon, add it to `frontend/src/lib/icon-map.jsx`.

## Adding Backend Modules

Create:

```txt
backend/src/modules/products/
├── product.model.js
├── product.validator.js
├── product.service.js
├── product.controller.js
└── product.routes.js
```

Pattern:

- model owns schema definitions
- validator owns request schemas
- service owns database/business logic
- controller calls services only
- routes attach validation, auth, and controllers

Mount it in:

```js
// backend/src/routes/index.js
router.use("/products", productRoutes);
```

Protected route example:

```js
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validate(createProductSchema),
  productController.createProduct
);
```

## API Contract

Success:

```json
{
  "success": true,
  "message": "Done",
  "data": {},
  "meta": null
}
```

Error:

```json
{
  "success": false,
  "message": "Invalid input",
  "statusCode": 400
}
```

## Extension Checklist

When adapting this starter:

1. Rename the app in `app-preset.js`.
2. Choose a layout scenario.
3. Paste your shadcn theme variables.
4. Update navigation.
5. Replace dashboard cards.
6. Add frontend pages.
7. Add backend modules.
8. Add route-level validation.
9. Add role guards where needed.
10. Update `.env` values for your deployment.

Search for `TODO: Customize` for intended extension points and `STARTER-KIT:` for comments explaining why the starter makes certain decisions.
# starter-kit-mern
