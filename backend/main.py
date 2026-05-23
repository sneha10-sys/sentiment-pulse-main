"""SentimentScope FastAPI backend.

Run locally:
    pip install -r requirements.txt
    python -m textblob.download_corpora     # one-time
    uvicorn main:app --reload --port 8000

Then in the frontend .env set:
    VITE_API_URL=http://localhost:8000
"""
from __future__ import annotations
import io
import uuid
from typing import List

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analyzer import analyze
from models import AnalyzeRequest, AnalyzeResponse, BatchResponse, BatchResultItem

app = FastAPI(title="SentimentScope API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "SentimentScope", "status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(req: AnalyzeRequest):
    try:
        return analyze(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/batch", response_model=BatchResponse)
async def batch_endpoint(file: UploadFile = File(...)):
    raw = await file.read()
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    rows: List[str] = []
    name = (file.filename or "").lower()
    try:
        if name.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(raw))
            col = next((c for c in df.columns if c.lower() == "text"), df.columns[0])
            rows = [str(x).strip() for x in df[col].dropna().tolist() if str(x).strip()]
        else:
            rows = [l.strip() for l in raw.decode("utf-8", errors="ignore").splitlines() if l.strip()]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {e}")

    if not rows:
        raise HTTPException(status_code=400, detail="No rows found")
    if len(rows) > 1000:
        raise HTTPException(status_code=400, detail="Too many rows (max 1000)")

    results: List[BatchResultItem] = []
    for text in rows:
        r = analyze(text)
        results.append(BatchResultItem(text=text, sentiment=r["sentiment"], confidence=r["confidence"]))

    return BatchResponse(job_id=str(uuid.uuid4()), results=results)
