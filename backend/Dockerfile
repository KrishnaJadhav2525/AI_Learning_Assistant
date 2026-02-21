FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (e.g. for building some python packages if needed)
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
# We expect to run this container with the context of /backend
COPY . /app/backend
WORKDIR /app

# Expose port
EXPOSE 8000

# Start Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
