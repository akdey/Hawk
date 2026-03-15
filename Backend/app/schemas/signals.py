from pydantic import BaseModel
from typing import Optional, Dict, Any

class SignalBase(BaseModel):
    title: str
    link: str
    description: Optional[str] = None
    source: str
    type: str
    captured_at: str

class JewelSignal(SignalBase):
    technical_significance: str
    architectural_pattern: str
    future_scope: str
    entropy_score: float
    classification: str
    semantic_drift: Optional[str] = None
