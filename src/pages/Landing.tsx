import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap, BarChart3, FileStack, ArrowRight, Sparkles } from "lucide-react";
import { analyzeText, AnalyzeResult } from "@/lib/sentiment";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { ScoreBreakdown } from "@/components/sentiment/ScoreBreakdown";
import { useAuth } from "@/contexts/AuthContext";
import { TiltCard } from "@/components/TiltCard";
import heroImg from "@/assets/hero-sentiment.jpg";
import featureRealtime from "@/assets/feature-realtime.jpg";
import featureBatch from "@/assets/feature-batch.jpg";
import featureTrends from "@/assets/feature-trends.jpg";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("Just tried the new release — it's absolutely fantastic, completely changed my workflow!");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const r = await analyzeText(text);
    setResult(r);
    setLoading(false);
  };

  const ctaTo = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Open dashboard" : "Get started free";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
                <Button asChild size="sm"><Link to="/signup">Sign up</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border hairline bg-secondary/50 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              NLP + Machine Learning · VADER · TextBlob
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Decode public opinion <span className="text-primary">at scale</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
              Real-time sentiment analysis for social media posts. Classify, batch process, and visualize trends with production-grade NLP.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate(ctaTo)}>
                {ctaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>
                Try the demo
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span><strong className="text-foreground tabular-nums">10k+</strong> posts analyzed</span>
              <span className="opacity-30">·</span>
              <span><strong className="text-foreground tabular-nums">94%</strong> accuracy</span>
              <span className="opacity-30">·</span>
              <span><strong className="text-foreground">3</strong> sentiment categories</span>
            </div>
          </div>

          <ParallaxHero />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Zap, title: "Real-time Analysis", desc: "Paste a post, get sentiment + confidence + score breakdown instantly.", img: featureRealtime },
            { icon: FileStack, title: "Batch Processing", desc: "Upload CSV/TXT files and analyze thousands of rows in seconds.", img: featureBatch },
            { icon: BarChart3, title: "Trend Visualization", desc: "Interactive line and donut charts to spot patterns over time.", img: featureTrends },
          ].map((f) => (
            <TiltCard key={f.title} className="glass-card overflow-hidden rounded-xl">
              <div className="aspect-[4/3] overflow-hidden bg-secondary/30">
                <img
                  src={f.img}
                  alt={f.title}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <f.icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="mx-auto max-w-3xl px-4 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Try it live</h2>
          <p className="mt-2 text-sm text-muted-foreground">No signup required — paste any text below.</p>
        </div>
        <div className="glass-card p-5 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste a tweet, comment, or review…"
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={handleDemo} disabled={loading || !text.trim()}>
              {loading ? "Analyzing…" : "Analyze sentiment"}
            </Button>
          </div>
          {result && (
            <div className="border-t hairline pt-4 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <SentimentBadge sentiment={result.sentiment} size="lg" />
                <div className="text-sm text-muted-foreground">
                  Confidence <span className="ml-1 font-semibold text-foreground tabular-nums">{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>
              <ScoreBreakdown scores={result.scores} />
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t hairline py-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-xs text-muted-foreground">
          <Logo />
          <span>© {new Date().getFullYear()} SentimentScope · NIET CSE Project 2025-26</span>
        </div>
      </footer>
    </div>
  );
};

/** Cursor-driven parallax hero visual with floating sentiment dots. */
const ParallaxHero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x, y });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const t = (depth: number) => ({
    transform: `translate3d(${tilt.x * depth}px, ${tilt.y * depth}px, 0)`,
    transition: "transform 0.15s ease-out",
  });

  return (
    <div
      ref={ref}
      className="relative aspect-square w-full overflow-hidden rounded-2xl border hairline bg-card"
      style={{ perspective: "1000px" }}
    >
      <img
        src={heroImg}
        alt="Sentiment data visualization"
        width={1280}
        height={896}
        className="absolute inset-0 h-full w-full object-cover"
        style={t(-12)}
      />
      {/* Floating sentiment chips */}
      <div className="absolute left-[18%] top-[22%] glass-card px-3 py-1.5 text-xs flex items-center gap-1.5 backdrop-blur" style={t(-30)}>
        <span className="h-1.5 w-1.5 rounded-full bg-positive" /> positive · 92%
      </div>
      <div className="absolute right-[14%] top-[40%] glass-card px-3 py-1.5 text-xs flex items-center gap-1.5 backdrop-blur" style={t(40)}>
        <span className="h-1.5 w-1.5 rounded-full bg-negative" /> negative · 78%
      </div>
      <div className="absolute left-[32%] bottom-[18%] glass-card px-3 py-1.5 text-xs flex items-center gap-1.5 backdrop-blur" style={t(-22)}>
        <span className="h-1.5 w-1.5 rounded-full bg-neutral" /> neutral · 64%
      </div>
      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
    </div>
  );
};

export default Landing;
