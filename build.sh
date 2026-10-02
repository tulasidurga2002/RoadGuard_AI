#!/usr/bin/env bash
# RoadGuard AI Build Script
set -e

echo "==> Building RoadGuard AI..."
npm install --include=dev
npm run build
echo "==> Build completed successfully!"
