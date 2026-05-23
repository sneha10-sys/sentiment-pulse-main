import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, delta, hint, className }: Props) {
  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        {delta && (
          <span className={cn("text-xs font-medium tabular-nums", delta.positive ? "text-positive" : "text-negative")}>
            {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
