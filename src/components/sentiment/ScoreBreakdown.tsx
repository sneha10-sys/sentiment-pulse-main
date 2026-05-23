interface Props {
  scores: { positive: number; negative: number; neutral: number };
}

const rows: { key: keyof Props["scores"]; label: string; color: string }[] = [
  { key: "positive", label: "Positive", color: "bg-positive" },
  { key: "negative", label: "Negative", color: "bg-negative" },
  { key: "neutral",  label: "Neutral",  color: "bg-neutral"  },
];

export function ScoreBreakdown({ scores }: Props) {
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const v = Math.max(0, Math.min(1, scores[r.key] ?? 0));
        const pct = Math.round(v * 100);
        return (
          <div key={r.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium tabular-nums">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
