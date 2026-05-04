import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-[var(--control-height)] w-full rounded-[var(--radius-input)] border bg-background px-[var(--input-px)] py-2 text-sm [border-width:var(--border-width)]",
        "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
