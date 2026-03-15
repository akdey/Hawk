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
            raw_signals = await scraper.swoop()
            if not raw_signals:
                logger.info("No raw signals found during swoop.")
                return
            
            # Save raw signals for the 'All' stream in frontend
            vault.save_raw(raw_signals)

            # 2. Sieve (Filter)
            high_signal_items = await sieve.filter_noise(raw_signals)
            if not high_signal_items:
                logger.info("No high-signal items passed the sieve.")
                return

            # 3. Brain (Synthesize)
            jewels = []
            for item in high_signal_items:
                jewel = await brain.synthesize(item)
                if jewel and jewel.get("classification") == "Jewel":
                    jewels.append(jewel)
                    self.notify_jewel_discovery(jewel)

            # 4. Vault (Store)
            if jewels:
                vault.save_locally(jewels)
                await vault.push_to_hf()
                logger.info(f"Cycle completed. {len(jewels)} jewels vaulted.")
            else:
                logger.info("Cycle completed. No jewels found this time.")

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
