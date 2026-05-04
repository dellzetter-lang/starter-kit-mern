import { createContext, useContext, useEffect, useMemo } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppPreset } from "@/hooks/useAppPreset";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { applyThemeVars } from "@/lib/apply-theme-vars";
import { STORAGE_KEYS } from "@/utils/constants";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, "light");
  const preset = useAppPreset();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    applyThemeVars(theme, preset.theme);
  }, [theme, preset.theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
