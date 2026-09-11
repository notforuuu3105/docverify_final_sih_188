# ========================================================
# DocVerify AI - Multi-Stage Production Dockerfile
# Protocol: SIH 2026 PS 188 Full-Stack Platform
# ========================================================

# Stage 1: Build React + Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Python Backend with Computer Vision & Tesseract OCR
FROM python:3.10-slim

# Install system dependencies for OpenCV & Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install lightweight CPU PyTorch first (saves 2.5GB download & prevents OOM)
RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, models, and data
COPY src ./src
COPY data ./data
COPY eng.traineddata ./

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn src.backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
