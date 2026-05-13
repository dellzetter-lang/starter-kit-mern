export const designLayouts = {
  // Use for SaaS dashboards where users need global account controls and workspace navigation.
  hybridSaas: {
    shell: { public: "topbar", protected: "hybrid" },
    topbar: { position: "sticky", alignment: "end", maxWidth: "6xl" },
    sidebar: { side: "left", width: "16rem", collapsible: true },
    footer: { enabled: true, position: "normal", alignment: "center" },
    content: { maxWidth: "6xl", align: "center", padding: "comfortable" },
    auth: { cardAlign: "center", cardWidth: "md" },
  },
  // Use for task-heavy internal tools where the protected workspace is the product.
  sidebarWorkspace: {
    shell: { public: "topbar", protected: "sidebar" },
    topbar: { position: "sticky", alignment: "center", maxWidth: "7xl" },
    sidebar: { side: "left", width: "18rem", collapsible: true },
    footer: { enabled: true, position: "bottom", alignment: "start" },
    content: { maxWidth: "7xl", align: "center", padding: "spacious" },
    auth: { cardAlign: "center", cardWidth: "md" },
  },
  // Use for lightweight portals, booking flows, MVPs, and apps with few destinations.
  topbarPortal: {
    shell: { public: "topbar", protected: "topbar" },
    topbar: { position: "sticky", alignment: "center", maxWidth: "7xl" },
    sidebar: { side: "left", width: "18rem", collapsible: true },
    footer: { enabled: true, position: "bottom", alignment: "center" },
    content: { maxWidth: "6xl", align: "center", padding: "spacious" },
    auth: { cardAlign: "center", cardWidth: "md" },
  },
  // Use for canvas/content-first apps where controls work better in a right rail.
  rightRailStudio: {
    shell: { public: "topbar", protected: "sidebar" },
    topbar: { position: "static", alignment: "start", maxWidth: "none" },
    sidebar: { side: "right", width: "20rem", collapsible: true },
    footer: { enabled: false, position: "normal", alignment: "center" },
    content: { maxWidth: "none", align: "full", padding: "compact" },
    auth: { cardAlign: "center", cardWidth: "md" },
  },
};
