# Use Python 3.11 for compatibility with transformers/torch on HF Spaces
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency files
copy pyproject.toml .
copy uv.lock .

# Install dependencies using uv
RUN uv sync --frozen --no-cache

# Install Playwright browsers
RUN uv run playwright install --with-deps chromium

# Copy application code
COPY . .

# Create logs and data directories
RUN mkdir -p logs data

# Expose port
EXPOSE 7860

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
