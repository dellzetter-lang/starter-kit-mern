import { designLayouts } from "./design-layouts";
import { designThemes, designTokens } from "./design-themes";
import { dataDisplayTemplates } from "./data-display-templates";
import { installShadcnDesignPreset } from "@/lib/shadcn-theme";
import { ROUTES } from "@/utils/constants";

const nav = {
  dashboard: { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "layout" },
};

const baseContent = {
  auth: {
    loginTitle: "Sign in",
    loginDescription: "Use your account to continue.",
    registerTitle: "Create account",
    registerDescription: "Set up your secure starter-kit user.",
  },
  navigation: [
      nav.dashboard,
      ,
      { label: "Reports", href: "/reports", icon: "layout" }
    ],
};

const demoShadcnCss = `
:root { --primary: 262 83% 58%; --primary-foreground: 210 40% 98%; --radius: 0.875rem; }
.dark { --primary: 263 70% 64%; --card: 260 24% 12%; }
`;

export const presetVariants = {
  saas: {
    ...baseContent,
    brand: { name: "MERN Starter", tagline: "Secure app foundation" },
    layout: designLayouts.topbarPortal,
    theme: designThemes.operationsDense,
    dataDisplay: dataDisplayTemplates.dashboard,
    landing: {
      badge: "httpOnly refresh-token auth",
      title: "MERN Starter Kit",
      description:
        "Clone-ready Express, MongoDB, React, Tailwind, and shadcn/ui scaffolding with secure auth defaults.",
      primaryCta: "Start building",
      secondaryCta: "Sign in",
    },
    dashboardCards: [
      {
        title: "Session",
        description:
          "Access token in memory, refresh token in an httpOnly cookie.",
      },
      {
        title: "Customize",
        description: "Replace this preset to ship a distinct project quickly.",
      },
    ],
  },
  clinic: {
    ...baseContent,
    brand: { name: "CareDesk", tagline: "Clinic operations kit" },
    layout: designLayouts.sidebarWorkspace,
    theme: designThemes.clinicSoft,
    dataDisplay: dataDisplayTemplates.dashboard,
    landing: {
      badge: "Patient-ready auth foundation",
      title: "CareDesk",
      description:
        "A calm MERN base for appointments, staff dashboards, and patient-facing workflows.",
      primaryCta: "Create workspace",
      secondaryCta: "Staff login",
    },
    dashboardCards: [
      {
        title: "Appointments",
        description: "TODO: Customize - connect booking and visit data.",
      },
      {
        title: "Staff access",
        description: "Role-aware placeholders are ready for admin workflows.",
      },
    ],
  },
  studio: {
    ...baseContent,
    brand: { name: "StudioBoard", tagline: "Creative production hub" },
    layout: designLayouts.rightRailStudio,
    theme: designThemes.studioElevated,
    dataDisplay: dataDisplayTemplates.editorial,
    landing: {
      badge: "Flexible creative workspace",
      title: "StudioBoard",
      description:
        "A bold starter for content workflows, design reviews, approvals, and creative operations.",
      primaryCta: "Open studio",
      secondaryCta: "Sign in",
    },
    dashboardCards: [
      {
        title: "Campaigns",
        description: "TODO: Customize - show active production work.",
      },
      {
        title: "Reviews",
        description: "Use role guards for approval and admin flows.",
      },
    ],
  },
  operations: {
    ...baseContent,
    brand: { name: "OpsGrid", tagline: "Internal operations console" },
    layout: designLayouts.sidebarWorkspace,
    theme: designThemes.operationsDense,
    dataDisplay: dataDisplayTemplates.denseOps,
    landing: {
      badge: "Dense internal tooling",
      title: "OpsGrid",
      description:
        "A restrained layout for inventory, logistics, reporting, and repeated operational tasks.",
      primaryCta: "Create console",
      secondaryCta: "Operator login",
    },
    dashboardCards: [
      {
        title: "Queues",
        description: "TODO: Customize - connect operational queues.",
      },
      {
        title: "Reports",
        description: "Flat surfaces work well for dense data views.",
      },
    ],
  },
  commerce: {
    ...baseContent,
    brand: { name: "MarketPilot", tagline: "Commerce admin starter" },
    layout: designLayouts.topbarPortal,
    theme: designThemes.commerceWarm,
    dataDisplay: dataDisplayTemplates.commerce,
    landing: {
      badge: "Storefront-ready foundation",
      title: "MarketPilot",
      description:
        "A warm starter for products, orders, customer accounts, and merchant dashboards.",
      primaryCta: "Launch store",
      secondaryCta: "Merchant login",
    },
    dashboardCards: [
      {
        title: "Orders",
        description: "TODO: Customize - connect order metrics.",
      },
      {
        title: "Catalog",
        description: "Add product modules and merchant role guards.",
      },
    ],
  },
  shadcnPaste: {
    ...baseContent,
    brand: { name: "Pasted Theme", tagline: "shadcn theme import" },
    layout: designLayouts.hybridSaas,
    theme: installShadcnDesignPreset(demoShadcnCss, {
      fallbackTheme: designTokens.calmBlue,
      appearance: designThemes.studioElevated.appearance,
    }),
    dataDisplay: dataDisplayTemplates.dashboard,
    landing: {
      badge: "Paste shadcn CSS variables",
      title: "Your Imported Theme",
      description:
        "Replace demoShadcnCss with copied shadcn CSS and the app will apply it automatically.",
      primaryCta: "Try preset",
      secondaryCta: "Sign in",
    },
    dashboardCards: [
      {
        title: "Imported CSS",
        description: "Theme variables are parsed from :root and .dark blocks.",
      },
      {
        title: "Still flexible",
        description:
          "Layout, navigation, copy, shadows, and radius remain configurable.",
      },
    ],
  },
};

// TODO: Customize - switch to clinic, studio, operations, commerce, or shadcnPaste.
export const appPreset = presetVariants.saas;
