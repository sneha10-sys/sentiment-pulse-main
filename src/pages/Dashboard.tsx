import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/sentiment/StatCard";
import { TrendChart, TrendPoint } from "@/components/sentiment/TrendChart";
import { DonutChart } from "@/components/sentiment/DonutChart";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { Activity, TrendingUp, TrendingDown, Calendar, MessageSquareText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SentimentLabel } from "@/lib/sentiment";

interface Row {
  id: string;
  input_text: string;
  sentiment_label: SentimentLabel;
  confidence_score: number;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [recent, setRecent] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    (async () => {
      const [{ data: all }, { data: latest }] = await Promise.all([
        supabase.from("analyses")
          .select("id, input_text, sentiment_label, confidence_score, created_at")
          .eq("user_id", user.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false }),
        supabase.from("analyses")
          .select("id, input_text, sentiment_label, confidence_score, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setRows((all ?? []) as Row[]);
      setRecent((latest ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  const total = rows.length;
  const positive = rows.filter((r) => r.sentiment_label === "positive").length;
  const negative = rows.filter((r) => r.sentiment_label === "negative").length;
  const neutral  = rows.filter((r) => r.sentiment_label === "neutral").length;
  const today = new Date().toDateString();
  const todayCount = rows.filter((r) => new Date(r.created_at).toDateString() === today).length;
  const pctPos = total ? Math.round((positive / total) * 100) : 0;
  const pctNeg = total ? Math.round((negative / total) * 100) : 0;

  // Build last 30 days trend
  const trend: TrendPoint[] = [];
  const buckets: Record<string, { positive: number; negative: number; neutral: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(5, 10);
    buckets[key] = { positive: 0, negative: 0, neutral: 0 };
  }
  for (const r of rows) {
    const key = new Date(r.created_at).toISOString().slice(5, 10);
    if (buckets[key]) buckets[key][r.sentiment_label]++;
  }
  for (const [date, v] of Object.entries(buckets)) trend.push({ date, ...v });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your sentiment analyses (last 30 days).</p>
        </div>
        <Button asChild><Link to="/analyze">Quick analyze</Link></Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Analyses" value={total} icon={Activity} hint="Last 30 days" />
          <StatCard label="Positive %" value={`${pctPos}%`} icon={TrendingUp} />
          <StatCard label="Negative %" value={`${pctNeg}%`} icon={TrendingDown} />
          <StatCard label="Today" value={todayCount} icon={Calendar} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Sentiment trend</h2>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          {loading ? <Skeleton className="h-[280px] rounded-md" /> : (total === 0 ? <EmptyChart /> : <TrendChart data={trend} />)}
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-4 font-semibold">Distribution</h2>
          {loading ? <Skeleton className="h-[280px] rounded-md" /> : (total === 0 ? <EmptyChart /> : <DonutChart positive={positive} negative={negative} neutral={neutral} />)}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b hairline">
          <h2 className="font-semibold">Recent analyses</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/history">View all</Link></Button>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">No analyses yet — start with your first one.</p>
            <Button asChild size="sm"><Link to="/analyze">Analyze something</Link></Button>
          </div>
        ) : (
          <div className="divide-y hairline">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{r.input_text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="hidden md:block text-xs tabular-nums text-muted-foreground w-16 text-right">
                  {Math.round(Number(r.confidence_score) * 100)}%
                </div>
                <SentimentBadge sentiment={r.sentiment_label} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyChart = () => (
  <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
    Run your first analysis to see data here.
  </div>
);

export default Dashboard;
