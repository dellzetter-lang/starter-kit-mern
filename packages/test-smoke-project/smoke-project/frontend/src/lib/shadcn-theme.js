const blockPattern = /(:root|\.dark)\s*\{([^}]+)\}/g;
const varPattern = /--([^:\s]+)\s*:\s*([^;]+);/g;

const parseVars = (block = "") => {
  const vars = {};
  let match = varPattern.exec(block);

  while (match) {
    vars[match[1]] = match[2].trim();
    match = varPattern.exec(block);
  }

  return vars;
};

export const parseShadcnTheme = (css = "") => {
  const theme = { light: {}, dark: {} };
  let match = blockPattern.exec(css);

  while (match) {
    const target = match[1] === ".dark" ? "dark" : "light";
    theme[target] = { ...theme[target], ...parseVars(match[2]) };
    match = blockPattern.exec(css);
  }

  return theme;
};

export const createThemeFromShadcnCss = (css, fallback = { light: {}, dark: {} }) => {
  const parsed = parseShadcnTheme(css);
  return {
    light: { ...fallback.light, ...parsed.light },
    dark: { ...fallback.dark, ...parsed.dark },
  };
};

export const installShadcnDesignPreset = (
  css,
  { fallbackTheme = { light: {}, dark: {} }, appearance = {} } = {}
) => ({
  cssVars: createThemeFromShadcnCss(css, fallbackTheme),
  appearance,
});
