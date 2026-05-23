import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, MessageSquareText } from "lucide-react";
import { SentimentLabel } from "@/lib/sentiment";

interface Row {
  id: string;
  input_text: string;
  source_platform: string;
  sentiment_label: SentimentLabel;
  confidence_score: number;
  created_at: string;
}

const PAGE_SIZE = 20;

const History = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("analyses")
        .select("id, input_text, source_platform, sentiment_label, confidence_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (sentiment !== "all" && r.sentiment_label !== sentiment) return false;
    if (platform !== "all" && r.source_platform !== platform) return false;
    if (search && !r.input_text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [rows, search, sentiment, platform]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const platforms = Array.from(new Set(rows.map((r) => r.source_platform)));

  const exportCsv = () => {
    const header = "text,platform,sentiment,confidence,created_at\n";
    const body = filtered.map((r) =>
      `"${r.input_text.replace(/"/g, '""')}",${r.source_platform},${r.sentiment_label},${r.confidence_score},${r.created_at}`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentimentscope-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">All your past sentiment analyses.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="glass-card p-4 grid gap-3 md:grid-cols-[1fr,160px,160px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search text…"
            className="pl-9"
          />
        </div>
        <Select value={sentiment} onValueChange={(v) => { setSentiment(v); setPage(0); }}>
          <SelectTrigger><SelectValue placeholder="Sentiment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={(v) => { setPlatform(v); setPage(0); }}>
          <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No analyses match your filters.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Text</th>
                  <th className="text-left px-4 py-3 w-28">Platform</th>
                  <th className="text-left px-4 py-3 w-28">Sentiment</th>
                  <th className="text-right px-4 py-3 w-24">Confidence</th>
                  <th className="text-right px-4 py-3 w-44">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 max-w-md truncate">{r.input_text}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{r.source_platform}</td>
                    <td className="px-4 py-3"><SentimentBadge sentiment={r.sentiment_label} size="sm" /></td>
                    <td className="px-4 py-3 text-right tabular-nums">{Math.round(Number(r.confidence_score) * 100)}%</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t hairline p-3 text-xs text-muted-foreground">
              <span>{filtered.length} results · page {page + 1} of {pages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
