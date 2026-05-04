import { Card, CardContent } from "@/components/ui/card";
import { dataDensityClasses, dataGridColumns } from "@/lib/data-display-classes";
import { cn } from "@/lib/utils";

function MobileCards({ columns, rows, className = "md:hidden" }) {
  return (
    <div className={cn("grid gap-[var(--data-gap)]", className)}>
      {rows.map((row, index) => (
        <Card key={row.id || index}>
          <CardContent className="space-y-3 pt-[var(--card-padding)]">
            {columns.map((column) => (
              <div className="flex items-start justify-between gap-4" key={column.key}>
                <span className="text-sm text-muted-foreground">{column.label}</span>
                <span className="text-right text-sm font-medium">{row[column.key]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DesktopTable({ columns, rows }) {
  return (
    <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border bg-card shadow-[var(--shadow-card)] [border-width:var(--border-width)] md:block">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>{columns.map((column) => <th className="px-4 py-3 font-medium" key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="border-t [border-top-width:var(--border-width)]" key={row.id || index}>
              {columns.map((column) => <td className="h-[var(--data-row-height)] px-4" key={column.key}>{row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResponsiveRecordView({ columns = [], rows = [], template = {} }) {
  if (template.mode === "cards") {
    return (
      <section className={cn("grid", dataGridColumns[template.columns || "three"], dataDensityClasses[template.density || "comfortable"])}>
        <MobileCards columns={columns} rows={rows} className="" />
      </section>
    );
  }

  return (
    <section className={cn("space-y-[var(--data-gap)]", dataDensityClasses[template.density || "comfortable"])}>
      <MobileCards columns={columns} rows={rows} />
      <DesktopTable columns={columns} rows={rows} />
    </section>
  );
}
