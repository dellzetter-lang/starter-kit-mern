import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataAlignClasses, dataDensityClasses, dataGridColumns } from "@/lib/data-display-classes";
import { cn } from "@/lib/utils";

export function MetricGrid({ items = [], template = {} }) {
  const columns = dataGridColumns[template.columns || "auto"];
  const density = dataDensityClasses[template.density || "comfortable"];
  const align = dataAlignClasses[template.align || "start"];

  return (
    <section className={cn("grid", columns, density)} aria-label="Metrics">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className={cn("pb-2", align)}>
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className={cn("space-y-1", align)}>
            <p className="text-2xl font-semibold tracking-normal">{item.value}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
