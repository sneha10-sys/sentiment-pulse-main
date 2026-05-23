import { cn } from "@/lib/utils";
import { SentimentLabel } from "@/lib/sentiment";

const styles: Record<SentimentLabel, string> = {
  positive: "bg-positive/15 text-positive border-positive/30",
  negative: "bg-negative/15 text-negative border-negative/30",
  neutral:  "bg-neutral/15 text-neutral border-neutral/30",
};

const dotStyles: Record<SentimentLabel, string> = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral:  "bg-neutral",
};

interface Props {
  sentiment: SentimentLabel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SentimentBadge({ sentiment, size = "md", className }: Props) {
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-sm px-3 py-1.5" : "text-xs px-2.5 py-1";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border font-medium capitalize", styles[sentiment], sizeCls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[sentiment])} />
      {sentiment}
    </span>
  );
}
