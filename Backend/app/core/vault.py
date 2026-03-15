import logging
import asyncio
from typing import List, Dict
import pandas as pd
from datetime import datetime
from datasets import Dataset, load_dataset
from app.core.config import settings
import os

logger = logging.getLogger("hawk.vault")

class KnowledgeVault:
    def __init__(self):
        self.repo_id = settings.HF_REPO_ID
        self.local_cache = "data/vault_cache.csv"
        self.raw_cache = "data/raw_signals.csv"
        if not os.path.exists("data"):
            os.makedirs("data")

    def save_raw(self, signals: List[Dict]):
        """Save every single thing the Hawk sees for the 'All' stream."""
        if not signals:
            return
        
        import hashlib
        for s in signals:
            s['hash'] = hashlib.sha256(f"{s.get('title')}{s.get('link')}".encode()).hexdigest()
            s['captured_at'] = datetime.now().isoformat()
            
        df = pd.DataFrame(signals)
        df.to_csv(self.raw_cache, mode='a', header=not os.path.exists(self.raw_cache), index=False)
        logger.info(f"Buffered {len(signals)} raw signals for history.")
    def save_locally(self, jewels: List[Dict]):
        """Save synthesized jewels with deduplication."""
        import hashlib
        
        # Load existing hashes to prevent duplicates
        existing_hashes = set()
        if os.path.exists(self.local_cache):
            df_old = pd.read_csv(self.local_cache)
            if 'hash' in df_old.columns:
                existing_hashes = set(df_old['hash'].tolist())

        new_jewels = []
        for j in jewels:
            j_hash = hashlib.sha256(f"{j.get('title')}{j.get('link')}".encode()).hexdigest()
            if j_hash not in existing_hashes:
                j['hash'] = j_hash
                j['captured_at'] = datetime.now().isoformat()
                new_jewels.append(j)

        if not new_jewels:
            return

        df = pd.DataFrame(new_jewels)
        df.to_csv(self.local_cache, mode='a', header=not os.path.exists(self.local_cache), index=False)
        logger.info(f"Vaulted {len(new_jewels)} NEW technical jewels.")

    async def push_to_hf(self):
        """Push local cache to private HF Dataset."""
        if not settings.HF_TOKEN:
            logger.warning("HF_TOKEN not set. Cannot push to Vault.")
            return

        try:
            if os.path.exists(self.local_cache):
                df = pd.read_csv(self.local_cache)
                dataset = Dataset.from_pandas(df)
                dataset.push_to_hub(self.repo_id, token=settings.HF_TOKEN, private=True)
                logger.info(f"Vault pushed to Hugging Face: {self.repo_id}")
        except Exception as e:
            logger.error(f"Failed to push to HF: {e}")

vault = KnowledgeVault()
