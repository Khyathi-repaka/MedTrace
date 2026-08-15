# Build context is the repo root (see docker-compose.yml: context: ., dockerfile: backend/Dockerfile)
# because this service needs the sibling ai/ and rag/ packages, not just backend/.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr libgl1 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/
COPY ai/ /app/ai/
COPY rag/ /app/rag/
COPY database/ /app/database/
COPY sample-data/ /app/sample-data/

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
