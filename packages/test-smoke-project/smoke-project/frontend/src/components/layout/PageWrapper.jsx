import { useAppPreset } from "@/hooks/useAppPreset";
import { alignClasses, maxWidthClasses, paddingClasses } from "@/lib/layout-classes";
import { cn } from "@/lib/utils";

export function PageWrapper({ className, children }) {
  const { layout } = useAppPreset();
  const content = layout.content || {};

  return (
    <main
      className={cn(
        "w-full",
        alignClasses[content.align || "center"],
        maxWidthClasses[content.maxWidth || "6xl"],
        paddingClasses[content.padding || "comfortable"],
        className
      )}
    >
      {children}
    </main>
  );
}
