#!/usr/bin/env bash
# RoadGuard AI Build Script
set -e

echo "==> [RoadGuard AI] Installing Python dependencies (Gunicorn)..."
if command -v pip &> /dev/null; then
    pip install -r requirements.txt
fi

echo "==> [RoadGuard AI] Installing Node dependencies and compiling frontend..."
npm install --include=dev
npm run build

echo "==> [RoadGuard AI] Build completed successfully!"
