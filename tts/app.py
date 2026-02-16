from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import numpy as np
import wave
import os
from pathlib import Path

app = FastAPI(title="TTS Service", version="0.1.0")

class SynthesisRequest(BaseModel):
    text: str
    voice: Optional[str] = "default"
    sample_rate: int = 22050
    duration_seconds: Optional[float] = None
    output_path: str
    format: str = "wav"

@app.post("/synthesize")
async def synthesize(req: SynthesisRequest):
    # Simple sine-wave fallback; real TTS (kokoro) could be plugged here later
    sr = int(max(8000, min(req.sample_rate, 48000)))
    # duration: if not provided, 0.06 sec per character (min 2s, max 30s)
    dur = req.duration_seconds
    if dur is None:
        dur = max(2.0, min(30.0, len(req.text) * 0.06))
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    base = 220.0
    voice_map = {
        "speaker1": 220.0,
        "speaker2": 275.0,
        "moderator": 180.0,
        "default": 220.0,
    }
    freq = voice_map.get(req.voice or "default", base)
    audio = 0.2 * np.sin(2 * np.pi * freq * t)
    # 16-bit PCM WAV
    y = np.int16(audio * 32767)
    outpath = Path(req.output_path)
    outpath.parent.mkdir(parents=True, exist_ok=True)
    if req.format.lower() != "wav":
        # Only WAV supported in this minimal service
        raise HTTPException(status_code=400, detail="Only WAV format supported")
    with wave.open(str(outpath), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(y.tobytes())
    return {"ok": True, "path": str(outpath), "sample_rate": sr, "duration": dur}
