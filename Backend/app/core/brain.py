import asyncio
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger("hawk.brain")

class TechnicalArchitect:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def track_semantic_drift(self, jewel: Dict):
        """Analyze how a concept has evolved compared to previous vault entries."""
        try:
            import pandas as pd
            vault_path = "data/vault_cache.csv"
            if not os.path.exists(vault_path):
                return
                
            df = pd.read_csv(vault_path)
            # Find related concepts based on keywords
            related = df[df['technical_significance'].str.contains(jewel.get('technical_significance', '')[:20], na=False)]
            
            if not related.empty:
                logger.info(f"Drift detected for concept: {jewel.get('title')}")
                # Logic to determine if it's a rebranding or evolution
                # This would ideally use an LLM comparison
                jewel["semantic_drift"] = "Potential rebranding of existing concept detected in vault."
        except Exception as e:
            logger.error(f"Semantic drift tracking failed: {e}")

    async def synthesize(self, signal: Dict) -> Optional[Dict]:
        """Synthesize a raw technical signal into an architectural 'Jewel'."""
        from app.core.filters import sieve
        
        if not self.client:
            logger.info("Groq API key missing. Falling back to Local Synthesis.")
            local_result = await sieve.synthesize_locally(signal)
            signal.update(local_result)
            return signal

        prompt = f"""
        ACT AS: A Lead Software Architect and Technical Forensic Investigator.
        TASK: Audit the following technical signal for "Architectural Alpha".
        
        CONTEXT: We are looking for "Jewels" (new primitives, stateful orchestration, headless patterns) 
        and killing "Noise" (marketing fluff, high-level AI clickbait).
        
        SIGNAL:
        Title: {signal.get('title')}
        Description: {signal.get('description')}
        Source: {signal.get('source')}
        
        REQUIRED ANALYSIS (Output JSON):
        - technical_significance: Deep technical breakdown of how this changes existing patterns.
        - architectural_pattern: Identify if it's a new 'Infrastructure Primitive', 'Orchestration Pattern', or 'Semantic Shift'.
        - future_scope: Where does this lead in 6 months?
        - entropy_score: 0.0 to 1.0 (1.0 = Pure Jewel, 0.0 = Pure Marketing Noise).
        - classification: 'Jewel', 'Noise', 'Trend', or 'Dejavu'.
        
        DO NOT include fluff. Be forensic.
        """

        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a forensic technical investigator for a senior architect office."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(chat_completion.choices[0].message.content)
            logger.info(f"Brain Result: classification={result.get('classification', 'N/A')}, entropy={result.get('entropy_score', 'N/A')}")
            signal.update(result)
            
            # Post-processing: Semantic Drift
            if signal.get("classification") == "Jewel":
                await self.track_semantic_drift(signal)
                
            return signal
            
        except Exception as e:
            logger.error(f"Error synthesizing signal with Groq: {e}")
            return None

brain = TechnicalArchitect()
