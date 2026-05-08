/**
 * Input Sanitization Utilities
 * For use in generated forms
 */

export function sanitizeText(value) {
  if (typeof value !== "string") return value;
  return value.replace(/<[^>]*>?/gm, "").trim();
}

export function sanitizeEmail(value) {
  if (typeof value !== "string") return value;
  return value.toLowerCase().trim();
}

export function sanitizeUrl(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!/^https?:\/\//.test(trimmed)) {
    return "https://" + trimmed;
  }
  return trimmed;
}

export function sanitizePhone(value) {
  if (typeof value !== "string") return value;
  return value.replace(/[^+0-9]/g, "");
}

export function sanitizeNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export function sanitizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return Boolean(value);
}