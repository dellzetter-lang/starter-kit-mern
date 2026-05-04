import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppPreset } from "@/hooks/useAppPreset";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const hasTopbar = (mode) => mode === "topbar" || mode === "hybrid";
const hasSidebar = (mode) => mode === "sidebar" || mode === "hybrid";

export function AppShell({ secure = false, children }) {
  const { layout } = useAppPreset();
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const mode = secure ? layout.shell.protected : layout.shell.public;
  const showTopbar = hasTopbar(mode);
  const showSidebar = secure && hasSidebar(mode);
  const sidebarSide = layout.sidebar?.side || "left";
  const topbarFixed = showTopbar && layout.topbar?.position === "fixed";

  return (
    <div className={cn("min-h-screen", layout.footer?.position === "bottom" && "flex flex-col")}>
      {showTopbar && <Navbar showMenuButton={showSidebar} />}
      {showSidebar && !showTopbar && (
        <Button
          className={cn("fixed top-4 z-30 md:hidden", sidebarSide === "right" ? "right-4" : "left-4")}
          size="icon"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      <div className={cn("min-h-0 flex-1", showSidebar && "flex", sidebarSide === "right" && "flex-row-reverse")}>
        {showSidebar && <Sidebar showAccountActions={!showTopbar} />}
        <div className={cn("min-w-0 flex-1", topbarFixed && "pt-16")}>{children}</div>
      </div>
      {layout.footer?.enabled && <Footer />}
    </div>
  );
}
