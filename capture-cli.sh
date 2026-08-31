#!/bin/bash
# Capture image and video using Playwright CLI directly

echo "Capturing image..."
npx playwright screenshot --viewport-size=1280,720 --wait-for-timeout=5000 --timeout=20000 http://localhost:3003/ to_done/cover-preview.png 2>&1

echo "Image capture done. Checking..."
ls -lh to_done/cover-preview.png 2>/dev/null || echo "Image not found"

# Video recording using Playwright CLI with recording
# Playwright CLI doesn't directly support video recording via CLI flags easily,
# so we'll use a node script that requires playwright via npx
