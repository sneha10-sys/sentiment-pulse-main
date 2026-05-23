import { SentimentLabel } from "@/lib/sentiment";
import { cn } from "@/lib/utils";

interface Props {
  value: number;       // 0..1
  sentiment?: SentimentLabel;
  className?: string;
  showLabel?: boolean;
}

const colorMap: Record<SentimentLabel, string> = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral:  "bg-neutral",
};

export function ConfidenceBar({ value, sentiment = "neutral", className, showLabel = true }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence</span>
          <span className="font-medium text-foreground tabular-nums">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[sentiment])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
