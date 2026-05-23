import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockAnalyze, SentimentLabel } from "@/lib/sentiment";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { DonutChart } from "@/components/sentiment/DonutChart";
import { Upload, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface ResultRow {
  text: string;
  sentiment: SentimentLabel;
  confidence: number;
}

function parseFile(content: string, filename: string): string[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  // CSV with text column?
  if (filename.toLowerCase().endsWith(".csv")) {
    const header = lines[0].toLowerCase().split(",").map((c) => c.trim().replace(/"/g, ""));
    const idx = header.indexOf("text");
    if (idx >= 0) {
      return lines.slice(1).map((l) => {
        const cols = l.match(/("([^"]|"")*"|[^,]*)/g) ?? [];
        const cell = cols[idx] ?? "";
        return cell.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
      }).filter(Boolean);
    }
  }
  return lines;
}

const Batch = () => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ResultRow[]>([]);

  const handleFile = async (file: File) => {
    if (!user) return;
    setFilename(file.name);
    setResults([]);
    setProgress(0);
    setRunning(true);

    const content = await file.text();
    const rows = parseFile(content, file.name);
    if (rows.length === 0) {
      toast.error("No rows found in file");
      setRunning(false);
      return;
    }
    if (rows.length > 1000) {
      toast.error("Max 1000 rows per batch");
      setRunning(false);
      return;
    }

    const { data: job, error: jobErr } = await supabase.from("batch_jobs").insert({
      user_id: user.id, filename: file.name, total_count: rows.length, status: "processing",
    }).select().single();
    if (jobErr || !job) {
      toast.error(jobErr?.message ?? "Failed to create job");
      setRunning(false);
      return;
    }

    const out: ResultRow[] = [];
    const inserts: { job_id: string; user_id: string; row_text: string; sentiment_label: SentimentLabel; confidence: number }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const text = rows[i];
      const r = mockAnalyze(text);
      const row: ResultRow = { text, sentiment: r.sentiment, confidence: r.confidence };
      out.push(row);
      inserts.push({
        job_id: job.id, user_id: user.id, row_text: text,
        sentiment_label: r.sentiment, confidence: r.confidence,
      });
      if ((i + 1) % 25 === 0 || i === rows.length - 1) {
        setProgress(Math.round(((i + 1) / rows.length) * 100));
        setResults([...out]);
        await new Promise((res) => setTimeout(res, 10));
      }
    }

    // Persist results in chunks
    for (let i = 0; i < inserts.length; i += 100) {
      await supabase.from("batch_results").insert(inserts.slice(i, i + 100));
    }
    await supabase.from("batch_jobs").update({ processed: rows.length, status: "completed" }).eq("id", job.id);
    setRunning(false);
    toast.success(`Processed ${rows.length} rows`);
  };

  const downloadCsv = () => {
    const header = "text,sentiment,confidence\n";
    const body = results
      .map((r) => `"${r.text.replace(/"/g, '""')}",${r.sentiment},${r.confidence}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename || "results"}.analyzed.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = {
    positive: results.filter((r) => r.sentiment === "positive").length,
    negative: results.filter((r) => r.sentiment === "negative").length,
    neutral:  results.filter((r) => r.sentiment === "neutral").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Batch analysis</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV (with a <code>text</code> column) or TXT (one post per line).</p>
      </div>

      <div
        className="glass-card border-dashed border-2 p-10 text-center cursor-pointer transition-colors hover:bg-secondary/30"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Drop a file here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">CSV or TXT · max 1000 rows · max 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {filename && (
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{filename}</span>
            <span className="text-muted-foreground">· {results.length} processed</span>
          </div>
          {running && <Progress value={progress} className="h-1.5" />}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass-card p-5 lg:col-span-2 overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Results</h2>
              <Button size="sm" variant="outline" onClick={downloadCsv} disabled={running}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <div className="max-h-[480px] overflow-auto rounded-md border hairline">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Text</th>
                    <th className="text-left px-3 py-2 w-28">Sentiment</th>
                    <th className="text-right px-3 py-2 w-24">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y hairline">
                  {results.slice(0, 200).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 max-w-md truncate">{r.text}</td>
                      <td className="px-3 py-2"><SentimentBadge sentiment={r.sentiment} size="sm" /></td>
                      <td className="px-3 py-2 text-right tabular-nums">{Math.round(r.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length > 200 && (
                <div className="p-3 text-center text-xs text-muted-foreground">Showing first 200 — export CSV for full results.</div>
              )}
            </div>
          </div>
          <div className="glass-card p-5">
            <h2 className="mb-3 font-semibold">Summary</h2>
            <DonutChart {...counts} />
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Positive</span><span className="tabular-nums">{counts.positive}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Negative</span><span className="tabular-nums">{counts.negative}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Neutral</span><span className="tabular-nums">{counts.neutral}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batch;
