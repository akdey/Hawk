from fastapi import APIRouter, Query
from typing import List
import pandas as pd
import os
from app.core.config import settings

router = APIRouter()

@router.get("/jewels")
async def get_jewels(limit: int = Query(20, gt=0)):
    """Fetch synthesized architectural jewels."""
    path = "data/vault_cache.csv"
    if not os.path.exists(path):
        return []
    
    df = pd.read_csv(path).fillna("")
    # Return last 'limit' items (newest first)
    data = df.tail(limit).to_dict(orient="records")
    return data[::-1]

@router.get("/raw")
async def get_raw_signals(limit: int = Query(50, gt=0)):
    """Fetch raw discovery stream."""
    path = "data/raw_signals.csv"
    if not os.path.exists(path):
        return []
    
    df = pd.read_csv(path).fillna("")
    data = df.tail(limit).to_dict(orient="records")
    return data[::-1]
