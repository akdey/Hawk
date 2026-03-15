import asyncio
import aiohttp
from rss_parser import RSSParser
from bs4 import BeautifulSoup
import logging
import os
from datetime import datetime
from typing import List, Dict, Optional
from app.core.config import settings

logger = logging.getLogger("hawk.scrapers")

class TechnicalScraper:
    def __init__(self):
        self.session = None

    async def get_session(self):
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
        return self.session

    async def fetch_rss(self, url: str) -> List[Dict]:
        """Fetch and parse RSS feeds for technical signals."""
        session = await self.get_session()
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    xml = await response.text()
                    parser = RSSParser.parse(xml)
                    items = []
                    for item in parser.channel.items:
                        items.append({
                            "title": item.title.content,
                            "link": item.link.content,
                            "description": item.description.content if item.description else "",
                            "source": url,
                            "type": "rss"
                        })
                    return items
        except Exception as e:
            logger.error(f"Error fetching RSS from {url}: {e}")
        return []

    async def fetch_search(self, query: str) -> List[Dict]:
        """Fetch news results using DuckDuckGo (Perplexity-lite style)."""
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                results = ddgs.news(query, max_results=5)
                signals = []
                for r in results:
                    signals.append({
                        "title": r['title'],
                        "link": r['url'],
                        "description": r['body'],
                        "source": "Search",
                        "type": "news"
                    })
                return signals
        except Exception as e:
            logger.error(f"Error in search scraper for {query}: {e}")
        return []

    async def fetch_nitter(self, query: str) -> List[Dict]:
        """Scrape technical X (Twitter) via Nitter instances."""
        session = await self.get_session()
        # Public Nitter instances rotate; using one as an example
        nitter_url = f"https://nitter.net/search?q={query}"
        try:
            async with session.get(nitter_url, timeout=10) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'lxml')
                    tweets = soup.find_all('div', class_='tweet-content')
                    signals = []
                    for t in tweets[:5]:
                        signals.append({
                            "title": "Technical X Signal",
                            "description": t.get_text(strip=True),
                            "link": nitter_url,
                            "source": "Nitter",
                            "type": "social"
                        })
                    return signals
        except Exception as e:
            logger.error(f"Error fetching from Nitter: {e}")
        return []

    async def fetch_github_audit(self) -> List[Dict]:
        """Forensic audit of emerging GitHub technical shifts using Playwright."""
        from playwright.async_api import async_playwright
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                # Stealth injection or just common headers
                context = await browser.new_context(user_agent="Mozilla/5.0")
                page = await context.new_page()
                
                signals = []
                # Scan Github Trending or specific technical tags
                for query in settings.TARGET_QUERIES:
                    github_url = f"https://github.com/search?q={query}&type=repositories&s=updated"
                    await page.goto(github_url, wait_until="networkidle")
                    
                    items = await page.locator("div.repository-list-item").all()
                    for item in items[:3]:
                        title = await item.locator("a.v-align-middle").text_content()
                        desc = await item.locator("p.mb-1").text_content()
                        signals.append({
                            "title": title.strip(),
                            "description": desc.strip(),
                            "link": f"https://github.com/{title.strip()}",
                            "source": "GitHub Audit",
                            "type": "code"
                        })
                
                await browser.close()
                return signals
        except Exception as e:
            logger.error(f"GitHub Audit failed: {e}")
        return []

class DiscoverySurfer:
    def __init__(self):
        self.visited_urls = set()
        self.max_depth = 2

    async def surf(self, start_url: str, depth: int = 0) -> List[Dict]:
        """Human-like discovery: visit a page, find links, and follow the high-signal ones."""
        if depth > self.max_depth or start_url in self.visited_urls:
            return []

        self.visited_urls.add(start_url)
        logger.info(f"Surfer exploring {start_url} (depth={depth})")
        
        from playwright.async_api import async_playwright
        from playwright_stealth import stealth
        import random
        import asyncio
        
        signals = []
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    viewport={'width': 1920, 'height': 1080},
                    device_scale_factor=1,
                )
                
                page = await context.new_page()
                await stealth(page)
                logger.info("Stealth Sub-Agent active. Masking automation signatures.")
                
                # Human-like navigation: Random delay before goto
                delay = random.uniform(1, 3)
                logger.info(f"Simulating human pause ({delay:.2f}s) before navigation...")
                await asyncio.sleep(delay)
                
                try:
                    logger.info(f"Navigating to investigative target: {start_url}")
                    await page.goto(start_url, wait_until="domcontentloaded", timeout=60000)
                except Exception as e:
                    logger.warning(f"Target navigation resistance detected, retrying with broader wait... {e}")
                    await asyncio.sleep(2)
                    await page.goto(start_url, wait_until="load", timeout=60000)

                # Human-like interaction: Randomized scrolling and pauses
                logger.info("Executing kinetic scrolling pattern for content discovery...")
                for i in range(random.randint(2, 4)):
                    scroll_height = random.randint(300, 800)
                    await page.evaluate(f"window.scrollBy(0, {scroll_height})")
                    await asyncio.sleep(random.uniform(0.5, 1.5))
                
                # Wait for any lazy content
                await asyncio.sleep(random.uniform(2, 4))
                
                # Extra stealth: move mouse to a random position
                await page.mouse.move(random.randint(0, 500), random.randint(0, 500))
                
                # 1. Extract Current Content
                logger.info("Performing surgical content extraction...")
                content = await page.content()
                soup = BeautifulSoup(content, 'lxml')
                
                # Basic context extraction
                title = await page.title()
                text_content = await page.evaluate("document.body.innerText")
                logger.info(f"Extraction successful: '{title[:40]}...' ({len(text_content)} characters captured)")
                
                signals.append({
                    "title": title,
                    "link": start_url,
                    "description": text_content[:1000],
                    "source": "Discovery Surfer",
                    "type": "surfing_discovery"
                })

                # 2. Find Promising Links (Human-like selection)
                if depth < self.max_depth:
                    links = []
                    # Look for links in articles, lists, or comments
                    for a in soup.find_all('a', href=True):
                        href = a['href']
                        if href.startswith('http') and not any(x in href for x in ['google', 'facebook', 'twitter', 'login', 'signup']):
                            # Favor links with technical keywords in text
                            link_text = a.get_text().lower()
                            technical_keywords = ["architecture", "primitive", "engine", "design", "rfc", "implementation", "stateful"]
                            if any(kw in link_text for kw in technical_keywords):
                                links.append(href)
                    
                    # Surf top 3 promising links
                    promising_links = links[:3]
                    tasks = [self.surf(link, depth + 1) for link in promising_links]
                    sub_signals = await asyncio.gather(*tasks)
                    for sub in sub_signals:
                        signals.extend(sub)

                await browser.close()
                return signals
        except Exception as e:
            logger.error(f"Surfer failed on {start_url}: {e}")
            return []

    async def swoop(self) -> List[Dict]:
        """The main autonomous 'Swoop' - using the Discovery Surfer."""
        all_signals = []
        
        # Start hubs
        hubs = [
            "https://news.ycombinator.com",
            "https://www.reddit.com/r/MachineLearning/",
            "https://www.reddit.com/r/Programming/"
        ]
        
        surfer = DiscoverySurfer()
        for hub in hubs:
            results = await surfer.surf(hub)
            all_signals.extend(results)
            
        logger.info(f"Swoop completed. Found {len(all_signals)} potential signals through human-like surfing.")
        return all_signals

scraper = DiscoverySurfer()
