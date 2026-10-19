#!/bin/bash
# Convert Playwright WebM video to MP4 using ffmpeg

if [ -f "videos/page-video.webm" ]; then
  echo "Converting videos/page-video.webm to MP4..."
  ffmpeg -i videos/page-video.webm -c:v libx264 -crf 23 -preset fast videos/page-video.mp4 2>/dev/null || echo "Conversion failed (ffmpeg error)"
  echo "MP4 created: videos/page-video.mp4"
else
  echo "No videos/page-video.webm found. Run scripts/capture-preview.js first."
fi
