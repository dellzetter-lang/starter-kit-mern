import { useMemo } from "react";
import { appPreset } from "@/config/app-preset";
import { AppPresetContext } from "./app-preset-context";

export function AppPresetProvider({ children, preset = appPreset }) {
  const value = useMemo(() => preset, [preset]);
  return <AppPresetContext.Provider value={value}>{children}</AppPresetContext.Provider>;
}
