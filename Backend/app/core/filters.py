import logging
from typing import List, Dict
from app.core.config import settings

logger = logging.getLogger("hawk.filters")

class SignalFilter:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self._is_loading = False

    async def ensure_model_loaded(self):
        """Lazy loader for local LLM to prevent startup latency."""
        if self.model or self._is_loading:
            return
        
        self._is_loading = True
        logger.info(f"Loading local model {settings.LOCAL_MODEL_NAME} for noise filtering...")
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
            import torch
            
            # Using 4-bit quantization if possible, or just default for 0.5B
            self.tokenizer = AutoTokenizer.from_pretrained(settings.LOCAL_MODEL_NAME)
            self.model = AutoModelForCausalLM.from_pretrained(
                settings.LOCAL_MODEL_NAME,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto"
            )
            logger.info("Local model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load local model: {e}")
        finally:
            self._is_loading = False

    async def classify_with_llm(self, text: str) -> bool:
        """Use local LLM to decide if content is high-signal or junk."""
        await self.ensure_model_loaded()
        if not self.model:
            return True # Fallback to density score if model fails

        prompt = f"System: You are an architectural signal filter.\nUser: Is this technical jewelry or marketing fluff? Reply only 'SIGNAL' or 'NOISE'.\nText: {text[:500]}\nAnswer:"
        
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            outputs = self.model.generate(**inputs, max_new_tokens=5)
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return "SIGNAL" in response.upper()
        except Exception as e:
            logger.error(f"Filtering error: {e}")
            return True

    def score_density(self, content: str) -> float:
        """Heuristic scoring based on code snippets and keywords."""
        score = 0.0
        keywords = ["architecture", "primitive", "orchestration", "implementation", "benchmark", "stack", "system", "headless", "stateful"]
        
        if "```" in content or "<code>" in content or "fn " in content or "def " in content:
            score += 0.5
            
        content_lower = content.lower()
        for kw in keywords:
            if kw in content_lower:
                score += 0.1
                
        return min(score, 1.0)

    async def filter_noise(self, signals: List[Dict]) -> List[Dict]:
        """Sieve through signals using density scoring + local LLM."""
        filtered = []
        for signal in signals:
            text = f"{signal.get('title', '')} {signal.get('description', '')}"
            density = self.score_density(text)
            
            if density >= 0.2:
                # Secondary check with local LLM for medium-high density items
                is_signal = await self.classify_with_llm(text)
                if is_signal:
                    signal["density_score"] = density
                    filtered.append(signal)
            elif density >= 0.5: # Hard bypass for obvious code snippets
                signal["density_score"] = density
                filtered.append(signal)
                
        logger.info(f"Sieve completed. {len(filtered)} items preserved.")
        return filtered

sieve = SignalFilter()
