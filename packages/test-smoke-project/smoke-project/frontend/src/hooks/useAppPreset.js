import { useContext } from "react";
import { AppPresetContext } from "@/context/app-preset-context";

export function useAppPreset() {
  const preset = useContext(AppPresetContext);
  if (!preset) throw new Error("useAppPreset must be used inside AppPresetProvider");
  return preset;
}
