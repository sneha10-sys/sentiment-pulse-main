import { SentimentBadge } from "./SentimentBadge";
import { ConfidenceBar } from "./ConfidenceBar";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { AnalyzeResult } from "@/lib/sentiment";

interface Props {
  result: AnalyzeResult;
  text: string;
}

export function AnalysisCard({ result, text }: Props) {
  return (
    <div className="glass-card animate-fade-in p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sentiment</div>
          <SentimentBadge sentiment={result.sentiment} size="lg" />
        </div>
        <div className="text-right min-w-[140px]">
          <div className="text-xs text-muted-foreground mb-1">Confidence</div>
          <div className="text-2xl font-semibold tabular-nums">{Math.round(result.confidence * 100)}%</div>
        </div>
      </div>

      <ConfidenceBar value={result.confidence} sentiment={result.sentiment} showLabel={false} />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-3">Score breakdown</div>
          <ScoreBreakdown scores={result.scores} />
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-3">Top keywords</div>
          {result.keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No significant keywords detected.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.map((k) => (
                <span key={k} className="rounded-md border bg-secondary/60 px-2 py-1 text-xs hairline">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-secondary/40 border hairline p-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
      </div>

      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">Analyzed text</div>
        <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4">{text}</p>
      </div>
    </div>
  );
}
