const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
  const outDir = path.join(__dirname, '../public/assets/chladni');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const videoDir = path.join(outDir, 'raw_video');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1200, height: 800 }
    }
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  // Take light mode screenshot
  const lightShotPath = path.join(outDir, 'chladni-light.png');
  await page.screenshot({ path: lightShotPath });
  console.log('Light screenshot saved:', lightShotPath);

  // Take main preview screenshot in root as preview.png
  const previewPath = path.join(__dirname, '../preview.png');
  await page.screenshot({ path: previewPath });
  console.log('Main preview screenshot saved:', previewPath);

  // Canvas element
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  console.log('Canvas bounding box:', box);

  if (box) {
    // Simulate hover and smooth movement across canvas to trigger harmonic shifts
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const x = box.x + 20 + (box.width - 40) * (0.5 + 0.45 * Math.sin((i / steps) * Math.PI * 2));
      const y = box.y + 20 + (box.height - 40) * (0.5 + 0.45 * Math.cos((i / steps) * Math.PI * 2));
      await page.mouse.move(x, y);
      await page.waitForTimeout(70);
    }

    // Toggle dark mode
    console.log('Toggling dark mode...');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(600);

    const darkShotPath = path.join(outDir, 'chladni-dark.png');
    await page.screenshot({ path: darkShotPath });
    console.log('Dark screenshot saved:', darkShotPath);

    // Hover more in dark mode
    for (let i = 0; i <= steps; i++) {
      const x = box.x + 20 + (box.width - 40) * (0.5 + 0.45 * Math.cos((i / steps) * Math.PI * 2));
      const y = box.y + 20 + (box.height - 40) * (0.5 + 0.45 * Math.sin((i / steps) * Math.PI * 2));
      await page.mouse.move(x, y);
      await page.waitForTimeout(70);
    }
  }

  await page.waitForTimeout(500);

  // Close context to finalize video
  await page.close();
  await context.close();
  await browser.close();

  // Find recorded video file
  const videoFiles = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const rawVideo = path.join(videoDir, videoFiles[0]);
    const finalMp4 = path.join(outDir, 'chladni-wave-field.mp4');
    const finalWebm = path.join(outDir, 'chladni-wave-field.webm');
    fs.copyFileSync(rawVideo, finalWebm);
    console.log('Webm video saved:', finalWebm);

    try {
      execSync(`ffmpeg -y -i "${rawVideo}" -c:v libx264 -pix_fmt yuv420p -crf 20 "${finalMp4}"`, { stdio: 'inherit' });
      console.log('MP4 video converted successfully:', finalMp4);
    } catch (e) {
      console.warn('ffmpeg conversion warning:', e.message);
    }
  }

  console.log('Done capturing screenshot and video.');
})();

