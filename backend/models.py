from typing import List, Literal, Dict
from pydantic import BaseModel, Field

Sentiment = Literal["positive", "negative", "neutral"]

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    platform: str = "custom"

class Scores(BaseModel):
    positive: float
    negative: float
    neutral: float

class AnalyzeResponse(BaseModel):
    sentiment: Sentiment
    confidence: float
    scores: Scores
    keywords: List[str]
    explanation: str

class BatchResultItem(BaseModel):
    text: str
    sentiment: Sentiment
    confidence: float

class BatchResponse(BaseModel):
    job_id: str
    results: List[BatchResultItem]
