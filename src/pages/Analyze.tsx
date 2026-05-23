import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeText, AnalyzeResult, wordCount } from "@/lib/sentiment";
import { AnalysisCard } from "@/components/sentiment/AnalysisCard";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { toast } from "sonner";
import { Sparkles, History } from "lucide-react";

interface SessionItem { text: string; result: AnalyzeResult; }

const platforms = ["twitter", "instagram", "facebook", "reddit", "custom"];

const Analyze = () => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [history, setHistory] = useState<SessionItem[]>([]);

  const submit = async () => {
    if (!text.trim() || !user) return;
    setLoading(true);
    try {
      const r = await analyzeText(text, platform);
      setResult(r);
      setHistory((h) => [{ text, result: r }, ...h].slice(0, 5));
      const { error } = await supabase.from("analyses").insert({
        user_id: user.id,
        input_text: text,
        source_platform: platform,
        sentiment_label: r.sentiment,
        confidence_score: r.confidence,
        positive_score: r.scores.positive,
        negative_score: r.scores.negative,
        neutral_score: r.scores.neutral,
        word_count: wordCount(text),
        keywords: r.keywords,
      });
      if (error) toast.error("Saved locally but failed to persist: " + error.message);
      else toast.success("Analysis saved");
    } catch (e) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analyze</h1>
        <p className="text-sm text-muted-foreground">Paste a social media post and classify its sentiment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your social media post here…"
              rows={6}
              maxLength={5000}
              className="resize-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Platform</span>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="w-40 h-9 text-sm capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">{wordCount(text)} words</span>
                <Button onClick={submit} disabled={loading || !text.trim()}>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  {loading ? "Analyzing…" : "Analyze"}
                </Button>
              </div>
            </div>
          </div>

          {result && <AnalysisCard result={result} text={text} />}
        </div>

        <aside className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">This session</h3>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No analyses yet this session.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((h, i) => (
                <li key={i} className="space-y-1.5">
                  <p className="text-xs text-foreground/80 line-clamp-2">{h.text}</p>
                  <div className="flex items-center justify-between">
                    <SentimentBadge sentiment={h.result.sentiment} size="sm" />
                    <span className="text-xs text-muted-foreground tabular-nums">{Math.round(h.result.confidence * 100)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Analyze;
