import asyncio
import logging
from datetime import datetime
from typing import Dict, List
from app.core.scrapers import scraper
from app.core.filters import sieve
from app.core.brain import brain
from app.core.vault import vault

logger = logging.getLogger("hawk.agent")

class HawkAgent:
    def __init__(self):
        self.is_running = False
        self.interval_hours = 6  # User mentioned 6-hour cycle

    def notify_jewel_discovery(self, jewel: Dict):
        """Notify the user about a high-signal discovery."""
        logger.info(f"!!! JEWEL DISCOVERED: {jewel.get('title')} !!!")
        logger.info(f"Significance: {jewel.get('technical_significance')}")
        # Placeholder for real notifications (Discord, Email, etc.)

    async def run_swoop_cycle(self):
        """The core search-filter-synthesize-vault loop."""
        logger.info(f"Hawk is taking flight at {datetime.now()}")
        
        try:
            # 1. Swoop (Scrape all sources)
            logger.info("PHASE 1: Taking flight for Discovery Swoop...")
            raw_signals = await scraper.swoop()
            if not raw_signals:
                logger.warning("PHASE 1 FAILED: No raw signals captured.")
                return
            logger.info(f"PHASE 1 COMPLETE: Captured {len(raw_signals)} potential signals.")
            
            # Save raw signals for the 'All' stream in frontend
            vault.save_raw(raw_signals)

            # 2. Sieve (Filter)
            logger.info("PHASE 2: Sifting signals through local Sieve...")
            high_signal_items = await sieve.filter_noise(raw_signals)
            if not high_signal_items:
                logger.info("PHASE 2 COMPLETE: No signals passed the dense noise filter.")
                return
            logger.info(f"PHASE 2 COMPLETE: {len(high_signal_items)} high-signal candidates identified.")

            # 3. Brain (Synthesize)
            logger.info("PHASE 3: Initiating Groq Synthesis for candidate jewels...")
            jewels = []
            for i, item in enumerate(high_signal_items, 1):
                logger.info(f"Synthesizing candidate {i}/{len(high_signal_items)}: {item.get('title')[:50]}...")
                jewel = await brain.synthesize(item)
                if jewel and jewel.get("classification") == "Jewel":
                    jewels.append(jewel)
                    self.notify_jewel_discovery(jewel)
            logger.info(f"PHASE 3 COMPLETE: Synthesized {len(jewels)} technical jewels.")

            # 4. Vault (Store)
            if jewels:
                logger.info("PHASE 4: Locking jewels into the Technical Vault...")
                vault.save_locally(jewels)
                await vault.push_to_hf()
                logger.info(f"PHASE 4 COMPLETE: Project Hawk cycle finalized. {len(jewels)} jewels securely vaulted.")
            else:
                logger.info("PHASE 4 SKIPPED: No new jewels to vault this cycle.")

        except Exception as e:
            logger.error(f"Error in Hawk agent cycle: {e}")

    async def start(self):
        """Start the autonomous loop."""
        if self.is_running:
            return
        
        self.is_running = True
        logger.info("Hawk Agent autonomous loop started.")
        
        while self.is_running:
            await self.run_swoop_cycle()
            logger.info(f"Hawk is resting for {self.interval_hours} hours...")
            await asyncio.sleep(self.interval_hours * 3600)

    def stop(self):
        """Stop the autonomous loop."""
        self.is_running = False
        logger.info("Hawk Agent stopping...")

hawk_agent = HawkAgent()
