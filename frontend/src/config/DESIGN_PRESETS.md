# Design Presets

Use these files together:

- `design-themes.js`: colors, radius, shadows, borders, density
- `design-layouts.js`: topbar/sidebar/content/footer structure
- `app-preset.js`: combines one theme, one layout, and product copy
- `data-display-templates.js`: responsive display rules for metrics, records, and dense data

## Ready Themes

| Theme | Use When | Personality |
| --- | --- | --- |
| `designThemes.executiveBlue` | SaaS, admin, CRM | balanced, safe, professional |
| `designThemes.clinicSoft` | healthcare, school, scheduling | soft radius, calm green, gentle shadows |
| `designThemes.studioElevated` | creative tools, portfolios, content workflows | rounded, expressive, elevated |
| `designThemes.operationsDense` | inventory, logistics, reports | compact, flat, sharp, data-heavy |
| `designThemes.commerceWarm` | shops, orders, merchant tools | warm, approachable, medium depth |

## Ready Layouts

| Layout | Use When |
| --- | --- |
| `designLayouts.hybridSaas` | Users need a topbar and a persistent workspace menu |
| `designLayouts.sidebarWorkspace` | Protected pages are the main product experience |
| `designLayouts.topbarPortal` | The app has few pages and should feel lighter |
| `designLayouts.rightRailStudio` | Main content/canvas should lead, controls live on the side |

## Responsive Behavior

- Topbars can be `static`, `sticky`, or `fixed`; fixed topbars automatically reserve content space.
- Sidebar-only layouts get a mobile menu button even when no topbar is rendered.
- Sidebars can sit on the left or right and slide in from the correct side on mobile.
- Sidebar navigation closes after tapping a link on mobile.
- Active nav links get a visible `bg-muted` state.
- Auth card alignment and width come from `layout.auth`.
- Shared UI components consume design tokens for radius, border width, shadows, and density.

## Data Display Templates

Use data display templates when pages need to show metrics, records, reports, or operational data across mobile and desktop.

| Template | Use When | Behavior |
| --- | --- | --- |
| `dataDisplayTemplates.dashboard` | General dashboards | Auto-fit metric grid, records become cards on mobile and table rows on desktop |
| `dataDisplayTemplates.denseOps` | Inventory, logistics, reports | Compact spacing, four metric columns, dense desktop rows |
| `dataDisplayTemplates.editorial` | Creative/editorial tools | Spacious cards, centered metrics, card-first record display |
| `dataDisplayTemplates.commerce` | Orders/products/customers | Four metric columns, commerce-friendly card/table balance |

Apply one in `app-preset.js`:

```js
import { dataDisplayTemplates } from "./data-display-templates";

export const appPreset = {
  ...presetVariants.operations,
  dataDisplay: dataDisplayTemplates.denseOps,
};
```

Use the reusable components in any page:

```jsx
<MetricGrid items={metrics} template={preset.dataDisplay.metrics} />
<ResponsiveRecordView columns={columns} rows={rows} template={preset.dataDisplay.records} />
```

`ResponsiveRecordView` uses mobile cards and desktop tables by default, so data remains readable on phones without forcing horizontal scrolling.

## Apply A Theme

```js
export const appPreset = {
  ...presetVariants.saas,
  theme: designThemes.operationsDense,
};
```

## Mix Theme And Layout

```js
export const appPreset = {
  ...presetVariants.commerce,
  layout: designLayouts.sidebarWorkspace,
  theme: designThemes.commerceWarm,
};
```

## Paste A shadcn Theme

```js
const pastedCss = `
:root {
  --primary: 262 83% 58%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.875rem;
}

.dark {
  --primary: 263 70% 64%;
}
`;

export const appPreset = {
  ...presetVariants.saas,
  theme: installShadcnDesignPreset(pastedCss, {
    fallbackTheme: designTokens.calmBlue,
    appearance: appearanceRecipes.elevated,
  }),
};
```

`fallbackTheme` fills missing color variables. `appearance` controls radius, shadows, borders, and density.
