import { Crown } from "lucide-react";
import { MetricGrid } from "@/components/data/MetricGrid";
import { ResponsiveRecordView } from "@/components/data/ResponsiveRecordView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RoleGuard } from "@/components/common/RoleGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppPreset } from "@/hooks/useAppPreset";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/utils/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const preset = useAppPreset();
  const dataDisplay = preset.dataDisplay || {};
  const metrics = [
    { label: "User", value: user?.name || "Active", description: user?.email },
    { label: "Role", value: user?.role || "user", description: "Role-aware UI is ready." },
    { label: "Theme", value: preset.brand.name, description: "Driven by app-preset.js." },
    { label: "Layout", value: preset.layout.shell.protected, description: "Responsive shell mode." },
  ];
  const columns = [
    { key: "area", label: "Area" },
    { key: "status", label: "Status" },
    { key: "next", label: "Next Step" },
  ];
  const rows = preset.dashboardCards.map((card) => ({
    id: card.title,
    area: card.title,
    status: "Template",
    next: card.description,
  }));

  // TODO: Customize - replace these placeholders with your product dashboard.
  return (
    <PageWrapper className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.name}. {preset.brand.tagline}.</p>
      </section>
      <MetricGrid items={metrics} template={dataDisplay.metrics} />
      <ResponsiveRecordView columns={columns} rows={rows} template={dataDisplay.records} />
      <div className="grid gap-[var(--data-gap)] md:grid-cols-2">
        <RoleGuard role={ROLES.ADMIN} fallback={<Skeleton className="h-44" />}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" /> Admin tools</CardTitle>
              <CardDescription>TODO: Customize - add admin-only business workflows here.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Protected backend routes can use requireRole("admin").
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </PageWrapper>
  );
}
