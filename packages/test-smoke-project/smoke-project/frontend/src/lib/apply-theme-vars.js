const setVars = (target, vars = {}) => {
  Object.entries(vars).forEach(([key, value]) => {
    target.style.setProperty(`--${key}`, value);
  });
};

export const applyThemeVars = (mode, theme = {}) => {
  const root = document.documentElement;
  setVars(root, theme.cssVars?.light);
  setVars(root, theme.cssVars?.[mode]);
  setVars(root, theme.appearance);
};
