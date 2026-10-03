FROM python:3.11-slim

WORKDIR /app

# Install build dependencies for scientific python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and proto
COPY backend/ ./backend/
COPY proto/ ./proto/

ENV PYTHONPATH="/app/backend"
ENV PORT=8000
EXPOSE 8000 50051 50052

# Run all microservices (FastAPI Gateway + gRPC Analytics + gRPC CNG)
CMD ["python", "backend/run_all.py"]
