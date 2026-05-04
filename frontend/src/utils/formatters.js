export const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "";

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency }).format(value || 0);

export const titleCase = (value = "") =>
  value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
