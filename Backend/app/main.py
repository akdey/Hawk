from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import logging
import os
from datetime import datetime

# Setup logging
if not os.path.exists("logs"):
    os.makedirs("logs")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(f"logs/hawk_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("hawk")

from contextlib import asynccontextmanager
from app.core.agent import hawk_agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the autonomous loop in the background
    asyncio.create_task(hawk_agent.start())
    yield
    # Stop the loop on shutdown
    hawk_agent.stop()

from app.api.v1.signals import router as signals_router

app = FastAPI(
    title="Hawk_v1 API",
    description="Autonomous Technical Investigator Backend",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(signals_router, prefix="/api/v1/signals", tags=["signals"])

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Hawk_v1 is circling...",
        "status": "active",
        "timestamp": datetime.now()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
