"""SentimentScope NLP analyzer.

Pipeline:
  1. Preprocess text (lowercase, strip URLs/mentions, expand contractions)
  2. VADER sentiment scores
  3. TextBlob polarity & subjectivity
  4. Weighted ensemble of VADER compound + TextBlob polarity
  5. Classify: positive (>0.05), negative (<-0.05), else neutral
  6. Top 5 keywords via TF-IDF
  7. Human-readable explanation
"""
from __future__ import annotations
import re
from typing import Dict, List, Tuple

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer

_vader = SentimentIntensityAnalyzer()

CONTRACTIONS = {
    "won't": "will not", "can't": "can not", "n't": " not",
    "'re": " are", "'s": " is", "'d": " would", "'ll": " will",
    "'ve": " have", "'m": " am",
}

URL_RE     = re.compile(r"https?://\S+")
MENTION_RE = re.compile(r"@\w+")
HASHTAG_RE = re.compile(r"#(\w+)")


def preprocess(text: str) -> str:
    text = text.lower()
    text = URL_RE.sub("", text)
    text = MENTION_RE.sub("", text)
    text = HASHTAG_RE.sub(r"\1", text)
    for k, v in CONTRACTIONS.items():
        text = text.replace(k, v)
    return re.sub(r"\s+", " ", text).strip()


def _classify(compound: float) -> str:
    if compound > 0.05:
        return "positive"
    if compound < -0.05:
        return "negative"
    return "neutral"


def _ensemble(vader_compound: float, tb_polarity: float) -> float:
    # 60% VADER (better for social media), 40% TextBlob
    return 0.6 * vader_compound + 0.4 * tb_polarity


def _keywords(text: str, top_k: int = 5) -> List[str]:
    try:
        vec = TfidfVectorizer(stop_words="english", max_features=50, ngram_range=(1, 1))
        m = vec.fit_transform([text])
        scores = m.toarray()[0]
        terms = vec.get_feature_names_out()
        ranked = sorted(zip(terms, scores), key=lambda x: -x[1])
        return [t for t, s in ranked[:top_k] if s > 0]
    except ValueError:
        return []


def analyze(text: str) -> Dict:
    clean = preprocess(text)
    vader = _vader.polarity_scores(clean)
    tb = TextBlob(clean).sentiment  # polarity in [-1, 1], subjectivity in [0, 1]

    compound = _ensemble(vader["compound"], tb.polarity)
    label = _classify(compound)

    pos = round(vader["pos"], 4)
    neg = round(vader["neg"], 4)
    neu = round(vader["neu"], 4)

    confidence = min(0.99, 0.55 + abs(compound) * 0.45)

    kws = _keywords(clean)

    if label == "neutral":
        explanation = "No strong emotional cues detected — the text reads as factual or balanced."
    else:
        explanation = (
            f"Classified as {label} (compound={compound:+.2f}). "
            f"VADER scored pos={vader['pos']:.2f}, neg={vader['neg']:.2f}; "
            f"TextBlob polarity={tb.polarity:+.2f}, subjectivity={tb.subjectivity:.2f}."
        )

    return {
        "sentiment": label,
        "confidence": round(confidence, 4),
        "scores": {"positive": pos, "negative": neg, "neutral": neu},
        "keywords": kws,
        "explanation": explanation,
    }
