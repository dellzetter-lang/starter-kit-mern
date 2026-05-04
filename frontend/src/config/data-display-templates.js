export const dataDisplayTemplates = {
  dashboard: {
    metrics: { columns: "auto", density: "comfortable", align: "start" },
    records: { mode: "cardsOnMobile", columns: "auto", density: "comfortable" },
  },
  denseOps: {
    metrics: { columns: "four", density: "compact", align: "start" },
    records: { mode: "tableOnDesktop", columns: "two", density: "compact" },
  },
  editorial: {
    metrics: { columns: "three", density: "spacious", align: "center" },
    records: { mode: "cards", columns: "three", density: "spacious" },
  },
  commerce: {
    metrics: { columns: "four", density: "comfortable", align: "start" },
    records: { mode: "cardsOnMobile", columns: "three", density: "comfortable" },
  },
};
