export type SentimentLabel = "positive" | "negative" | "neutral";

export interface AnalyzeResult {
  sentiment: SentimentLabel;
  confidence: number;
  scores: { positive: number; negative: number; neutral: number };
  keywords: string[];
  explanation: string;
}

// ---------- Lexicons (weighted) ----------
// Weights: stronger words = higher magnitude
const POS_LEXICON: Record<string, number> = {
  love: 3, loved: 3, loving: 2.5, adore: 3, amazing: 3, awesome: 3, incredible: 3,
  fantastic: 3, wonderful: 3, perfect: 3, brilliant: 2.5, superb: 2.5, excellent: 3,
  outstanding: 3, phenomenal: 3, magnificent: 3, gorgeous: 2.5, stunning: 2.5,
  beautiful: 2.5, pretty: 1.5, cute: 2, adorable: 2.5, sweet: 1.5, lovely: 2,
  great: 2, good: 1.5, nice: 1.5, cool: 1.5, fine: 1, ok: 0.5, okay: 0.5,
  happy: 2, glad: 1.5, excited: 2.5, thrilled: 3, delighted: 2.5, joy: 2.5,
  best: 2.5, better: 1.5, fav: 2, favorite: 2, favourite: 2, goat: 2.5,
  fire: 2, lit: 2, slay: 2.5, slaying: 2.5, slayed: 2.5, queen: 2, king: 2,
  iconic: 2.5, vibe: 1.5, vibes: 1.5, mood: 1, blessed: 2, grateful: 2,
  thanks: 1.5, thank: 1.5, ty: 1, tysm: 2, congrats: 2, congratulations: 2.5,
  proud: 2, win: 1.5, winning: 2, success: 2, successful: 2, dream: 1.5,
  inspiring: 2.5, inspired: 2, motivating: 2, masterpiece: 3, flawless: 3,
  obsessed: 2, yay: 1.5, woohoo: 2, omg: 1, wow: 2, yes: 1, yess: 1.5, yesss: 2,
  enjoy: 2, enjoyed: 2, enjoying: 2, like: 1, liked: 1, likes: 1,
  hot: 1.5, fit: 1.5, snatched: 2, glow: 1.5, glowing: 2, ate: 2, eating: 1.5,
  bestie: 1.5, bff: 1.5, support: 1.5, supportive: 2, kind: 1.5, sweetheart: 2,
};

const NEG_LEXICON: Record<string, number> = {
  hate: 3, hated: 3, hating: 2.5, despise: 3, loathe: 3, detest: 3,
  terrible: 3, awful: 3, horrible: 3, horrendous: 3, atrocious: 3, dreadful: 3,
  worst: 3, worse: 2, bad: 2, poor: 1.5, mediocre: 1.5, lame: 2, weak: 1.5,
  sad: 2, depressed: 2.5, depressing: 2.5, miserable: 2.5, heartbroken: 2.5,
  angry: 2.5, mad: 2, furious: 3, pissed: 2.5, annoyed: 2, annoying: 2.5,
  frustrated: 2, frustrating: 2.5, irritating: 2, irritated: 2,
  disappointing: 2.5, disappointed: 2.5, disappointment: 2.5, letdown: 2,
  ugly: 2.5, gross: 2.5, disgusting: 3, nasty: 2.5, vile: 2.5, repulsive: 3,
  cringe: 2.5, cringey: 2.5, cringeworthy: 2.5, embarrassing: 2.5, awkward: 1.5,
  boring: 2, bored: 1.5, dull: 1.5, lifeless: 2, basic: 1, mid: 2, meh: 1.5,
  trash: 3, garbage: 3, rubbish: 2.5, junk: 2, useless: 2.5, worthless: 3,
  fail: 2, failed: 2, failure: 2, flop: 2.5, flopped: 2.5, ratio: 2,
  broken: 1.5, broke: 1, crash: 1.5, crashed: 1.5, bug: 1.5, glitch: 1.5,
  problem: 1, issue: 1, wrong: 1.5, mistake: 1.5, error: 1.5,
  stupid: 2.5, dumb: 2.5, idiot: 2.5, idiotic: 2.5, moron: 2.5, foolish: 2,
  pathetic: 2.5, ridiculous: 1.5, absurd: 1.5, nonsense: 1.5, fake: 2, phony: 2,
  scam: 2.5, scammer: 2.5, fraud: 2.5, liar: 2.5, lying: 2, manipulative: 2.5,
  toxic: 2.5, rude: 2, mean: 1.5, harsh: 1.5, cruel: 2.5, evil: 2.5,
  overrated: 2, underwhelming: 2, regret: 2, regretted: 2,
  unfollow: 2, unfollowed: 2, blocked: 1.5, block: 1, report: 1.5, reported: 1.5,
  yikes: 1.5, ew: 2, eww: 2.5, ick: 2, bruh: 1, smh: 1.5, wtf: 2, ffs: 2,
  cancel: 1.5, cancelled: 1.5, canceled: 1.5,
};

// Profanity / cuss words — strong negative weight (covers common + obfuscated)
const PROFANITY: Record<string, number> = {
  fuck: 3, fucked: 3, fucking: 3, fck: 3, fk: 2.5, fuk: 3, fuckin: 3,
  shit: 2.5, shitty: 3, shite: 2.5, sh1t: 2.5, sht: 2.5,
  bitch: 3, bitches: 3, b1tch: 3, btch: 3,
  asshole: 3, ass: 1.5, arse: 1.5, bastard: 2.5, bastards: 2.5,
  damn: 1.5, damned: 1.5, dammit: 2,
  crap: 1.5, crappy: 2,
  dick: 2.5, dickhead: 3, prick: 2.5, cock: 2.5,
  cunt: 3.5, twat: 2.5, wanker: 2.5,
  slut: 3, whore: 3, hoe: 2, hoes: 2,
  retard: 3, retarded: 3,
  piss: 2, pissed: 2.5,
  bullshit: 3, bs: 1.5,
  motherfucker: 3.5, mf: 2, mfer: 2.5,
  douche: 2.5, douchebag: 3,
  jerk: 2, scumbag: 3, loser: 2, losers: 2,
  noob: 1.5, simp: 1.5, incel: 2,
  kys: 3.5, "f*ck": 3, "sh*t": 2.5, "b*tch": 3,
};

// Threats / hostile speech — extremely negative
const HOSTILE: Record<string, number> = {
  kill: 3, die: 2.5, death: 2, murder: 3, suicide: 3,
  hurt: 2, harm: 2, attack: 2, threat: 2.5, threaten: 2.5,
  hate: 2, racist: 3, racism: 3, sexist: 3, homophobic: 3, transphobic: 3,
  disgusting: 2.5, abuser: 3, abuse: 2.5, predator: 3, creep: 2, creepy: 2.5,
  ugly: 2, fat: 1.5, // contextual but commonly used as insult on insta
};

// Emoji sentiment
const EMOJI_POS: Record<string, number> = {
  "❤️": 2, "❤": 2, "😍": 2.5, "🥰": 2.5, "😘": 2, "😊": 1.5, "😄": 1.5, "😃": 1.5,
  "🙂": 1, "😁": 1.5, "🤩": 2.5, "🥳": 2, "😻": 2, "💕": 2, "💖": 2, "💗": 2,
  "💞": 2, "💓": 2, "💘": 2, "💝": 2, "🌹": 1.5, "🌸": 1, "✨": 1.5, "🔥": 2,
  "💯": 2, "👏": 1.5, "🙌": 1.5, "👍": 1.5, "🥇": 2, "🏆": 2, "🎉": 2, "🎊": 2,
  "😂": 1.5, "🤣": 1.5, "💪": 1.5, "👑": 2, "⭐": 1.5, "🌟": 1.5,
};

const EMOJI_NEG: Record<string, number> = {
  "😡": 2.5, "🤬": 3, "😠": 2, "😤": 2, "😢": 2, "😭": 2, "💔": 2.5, "😞": 2,
  "😔": 1.5, "😩": 2, "😫": 2, "🙄": 1.5, "😒": 1.5, "🤮": 3, "🤢": 2.5,
  "👎": 2, "💩": 2.5, "☠️": 2, "💀": 1.5, "😨": 1.5, "😰": 1.5, "😱": 1.5,
};

const INTENSIFIERS = new Set([
  "very", "really", "so", "super", "extremely", "absolutely", "totally",
  "completely", "utterly", "highly", "incredibly", "ridiculously", "insanely",
  "freaking", "fucking", "fckin", "damn", "soo", "sooo", "soooo", "mad",
]);

const DIMINISHERS = new Set([
  "slightly", "somewhat", "kinda", "kind", "sort", "barely", "hardly",
  "little", "bit", "fairly", "rather",
]);

const NEGATIONS = new Set([
  "not", "no", "never", "none", "nothing", "neither", "nor", "without",
  "dont", "doesnt", "didnt", "wont", "wouldnt", "cant", "cannot", "couldnt",
  "shouldnt", "isnt", "arent", "wasnt", "werent", "aint", "nope", "nah",
]);

// ---------- Helpers ----------
function preprocess(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/@\w+/g, " ")
    .replace(/#(\w+)/g, "$1")
    .replace(/[''`]/g, "'")
    .replace(/n't/g, "nt");
}

function tokens(text: string): string[] {
  return preprocess(text).match(/\b[a-z][a-z*0-9]*\b/g) ?? [];
}

function extractEmojis(text: string): string[] {
  // eslint-disable-next-line no-misleading-character-class
  return text.match(/\p{Extended_Pictographic}/gu) ?? [];
}

// ---------- Mock analyzer (production-grade rule based) ----------
export function mockAnalyze(text: string): AnalyzeResult {
  const raw = text;
  const toks = tokens(raw);
  const emojis = extractEmojis(raw);

  let posScore = 0;
  let negScore = 0;
  const hits: { word: string; polarity: "pos" | "neg"; weight: number }[] = [];

  // Token scan with negation + intensifier window (look back 2 tokens)
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    let weight = 0;
    let polarity: "pos" | "neg" | null = null;

    if (POS_LEXICON[t]) { weight = POS_LEXICON[t]; polarity = "pos"; }
    else if (NEG_LEXICON[t]) { weight = NEG_LEXICON[t]; polarity = "neg"; }
    else if (PROFANITY[t]) { weight = PROFANITY[t]; polarity = "neg"; }
    else if (HOSTILE[t]) { weight = HOSTILE[t]; polarity = "neg"; }

    if (!polarity) continue;

    // Look-back window for modifiers
    let negated = false;
    let multiplier = 1;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      const prev = toks[j];
      if (NEGATIONS.has(prev)) negated = !negated;
      else if (INTENSIFIERS.has(prev)) multiplier *= 1.5;
      else if (DIMINISHERS.has(prev)) multiplier *= 0.5;
    }

    let finalWeight = weight * multiplier;
    let finalPol = polarity;
    if (negated) {
      finalPol = polarity === "pos" ? "neg" : "pos";
      finalWeight *= 0.85; // negation slightly weaker than direct
    }

    if (finalPol === "pos") posScore += finalWeight;
    else negScore += finalWeight;

    hits.push({ word: t, polarity: finalPol, weight: finalWeight });
  }

  // Emoji contributions
  for (const e of emojis) {
    if (EMOJI_POS[e]) { posScore += EMOJI_POS[e]; hits.push({ word: e, polarity: "pos", weight: EMOJI_POS[e] }); }
    if (EMOJI_NEG[e]) { negScore += EMOJI_NEG[e]; hits.push({ word: e, polarity: "neg", weight: EMOJI_NEG[e] }); }
  }

  // ALL-CAPS boost (anger / excitement)
  const capsWords = (raw.match(/\b[A-Z]{3,}\b/g) ?? []).length;
  if (capsWords > 0) {
    if (negScore > posScore) negScore *= 1 + Math.min(capsWords, 4) * 0.1;
    else if (posScore > negScore) posScore *= 1 + Math.min(capsWords, 4) * 0.1;
  }

  // Excessive punctuation boost
  const exclam = (raw.match(/!/g) ?? []).length;
  if (exclam >= 2) {
    if (negScore > posScore) negScore *= 1.1;
    else if (posScore > negScore) posScore *= 1.1;
  }

  // Normalize to scores
  const total = posScore + negScore;
  let positive = 0, negative = 0, neutral = 1;
  if (total > 0) {
    positive = posScore / (total + 1);
    negative = negScore / (total + 1);
    neutral = Math.max(0, 1 - positive - negative);
  }

  // Decide sentiment
  const compound = posScore - negScore;
  const magnitude = Math.abs(compound);
  let sentiment: SentimentLabel = "neutral";
  if (compound > 1) sentiment = "positive";
  else if (compound < -1) sentiment = "negative";
  else if (compound > 0.3) sentiment = "positive";
  else if (compound < -0.3) sentiment = "negative";

  // Confidence: depends on signal strength + text length
  const lengthFactor = Math.min(toks.length, 40) / 80;
  const confidence = Math.min(0.98, 0.5 + Math.min(magnitude / 8, 0.4) + lengthFactor);

  // Keywords: top hits by absolute weight, then frequent non-stop tokens
  const stop = new Set(["the","a","an","and","or","but","is","are","was","were","be","been","being","to","of","in","on","at","for","with","this","that","it","its","i","me","my","you","your","we","our","im","just","really","very","so","im","ive","id","ill","u","ur"]);
  const seen = new Set<string>();
  const keywordHits: string[] = [];
  hits
    .filter((h) => /^[a-z]/.test(h.word))
    .sort((a, b) => b.weight - a.weight)
    .forEach((h) => { if (!seen.has(h.word)) { seen.add(h.word); keywordHits.push(h.word); } });

  if (keywordHits.length < 5) {
    const freq: Record<string, number> = {};
    for (const t of toks) if (!stop.has(t) && t.length > 2) freq[t] = (freq[t] ?? 0) + 1;
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .forEach(([w]) => { if (!seen.has(w)) { seen.add(w); keywordHits.push(w); } });
  }
  const keywords = keywordHits.slice(0, 5);

  // Explanation
  const topHits = hits
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((h) => h.word);

  let explanation: string;
  if (sentiment === "neutral") {
    explanation = hits.length === 0
      ? "No strong sentiment cues detected — the comment reads as factual or ambiguous."
      : `Mixed signals detected (${posScore.toFixed(1)} positive vs ${negScore.toFixed(1)} negative) — overall tone is balanced.`;
  } else {
    const hostileHit = hits.find((h) => PROFANITY[h.word] || HOSTILE[h.word]);
    const flavor = hostileHit
      ? ` Contains profanity or hostile language ("${hostileHit.word}"), which strongly skews the tone.`
      : "";
    explanation = `Classified as ${sentiment} — driven by ${topHits.length ? `signal terms like "${topHits.join('", "')}"` : "overall lexical polarity"}.${flavor}`;
  }

  return {
    sentiment,
    confidence: +confidence.toFixed(3),
    scores: {
      positive: +positive.toFixed(3),
      negative: +negative.toFixed(3),
      neutral: +neutral.toFixed(3),
    },
    keywords,
    explanation,
  };
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const isDemoMode = !API_URL;

export async function analyzeText(text: string, platform = "custom"): Promise<AnalyzeResult> {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 250));
    return mockAnalyze(text);
  }
  try {
    const res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, platform }),
    });
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch {
    return mockAnalyze(text);
  }
}

export function wordCount(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}
