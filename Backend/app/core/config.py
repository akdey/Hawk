from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Hawk_v1"
    DEBUG: bool = True
    
    # API Keys
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN")
    PERPLEXITY_API_KEY: Optional[str] = os.getenv("PERPLEXITY_API_KEY")
    
    # Hugging Face Settings
    HF_REPO_ID: str = os.getenv("HF_REPO_ID", "your-username/hawk-vault")
    
    # Model Settings
    LOCAL_MODEL_NAME: str = "Qwen/Qwen2.5-0.5B-Instruct" 
    
    # Search & Extraction Settings
    TARGET_QUERIES: list = [
        "new technical primitives architect",
        "stateful graph orchestration pattern",
        "headless email architecture",
        "emerging devtools infrastructure"
    ]
    RSS_FEEDS: list = [
        "https://www.reddit.com/r/LocalLLM/.rss",
        "https://www.reddit.com/r/MachineLearning/.rss",
        "https://hnrss.org/frontpage"
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()
