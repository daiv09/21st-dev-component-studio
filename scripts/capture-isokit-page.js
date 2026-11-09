const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

function isServerUp() {
  return new Promise((resolve) => {
    const req = http.get(URL, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxWaitMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await isServerUp()) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

(async () => {
  let serverProcess = null;
  const running = await isServerUp();
  if (!running) {
    console.log('Starting next dev server on port 3000...');
    serverProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
      shell: true,
      stdio: 'pipe',
    });
    const ready = await waitForServer(40000);
    if (!ready) {
      console.error('Server did not start in time.');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  }

  const outDir = path.join(__dirname, '../public/assets/isokit');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const videoDir = path.join(outDir, 'raw_video_gpu');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const artifactDir = 'C:\\Users\\divya\\.gemini\\antigravity\\brain\\89b9a9b8-0e4f-4ed6-ad6e-ba1d24974598';

  console.log('Launching browser with video recording for TensorCoreGpu...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();
  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // 1. Capture Light Mode Screenshot
  const lightShot = path.join(outDir, 'tensor-core-gpu-light.png');
  await page.screenshot({ path: lightShot });
  console.log('Light mode screenshot saved:', lightShot);

  // Copy to root preview.png and artifactDir
  fs.copyFileSync(lightShot, path.join(__dirname, '../preview.png'));
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(lightShot, path.join(artifactDir, 'tensor-core-gpu-preview.png'));
  }

  // Hover over the GPU plate
  const plateSvg = page.locator('.ik-plate svg').first();
  const box = await plateSvg.boundingBox();
  console.log('Plate bounding box:', box);

  if (box) {
    // Hover over the fans
    await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.45);
    await page.waitForTimeout(600);
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await page.waitForTimeout(600);
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.45);
    await page.waitForTimeout(600);
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45).catch(() => {});
    await page.waitForTimeout(800);
  }

  // 2. Switch to Dark Mode
  console.log('Switching to dark mode...');
  const darkBtn = page.locator('button:has-text("Dark Mode"), button:has-text("Dark mode")').first();
  if (await darkBtn.isVisible().catch(() => false)) {
    await darkBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Capture Dark Mode Screenshot
  const darkShot = path.join(outDir, 'tensor-core-gpu-dark.png');
  await page.screenshot({ path: darkShot });
  console.log('Dark mode screenshot saved:', darkShot);
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(darkShot, path.join(artifactDir, 'tensor-core-gpu-dark.png'));
  }

  // Hover in dark mode
  if (box) {
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4);
    await page.waitForTimeout(600);
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
    await page.waitForTimeout(800);
  }

  // Close context to finalize video
  await page.close();
  await context.close();
  await browser.close();

  // Convert raw WebM to MP4
  const videoFiles = fs.readdirSync(videoDir).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    videoFiles.sort((a, b) => {
      return (
        fs.statSync(path.join(videoDir, b)).mtimeMs -
        fs.statSync(path.join(videoDir, a)).mtimeMs
      );
    });

    const rawVideo = path.join(videoDir, videoFiles[0]);
    const finalMp4 = path.join(outDir, 'tensor-core-gpu.mp4');
    const rootMp4 = path.join(__dirname, '../public/tensor-core-gpu.mp4');

    console.log('Converting to MP4 with ffmpeg...');
    try {
      execSync(
        `ffmpeg -y -i "${rawVideo}" -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 20 -preset medium -movflags +faststart "${finalMp4}"`,
        { stdio: 'inherit' }
      );
      fs.copyFileSync(finalMp4, rootMp4);
      if (fs.existsSync(artifactDir)) {
        fs.copyFileSync(finalMp4, path.join(artifactDir, 'tensor-core-gpu.mp4'));
      }
      console.log('Final MP4 video saved:', finalMp4);
    } catch (e) {
      console.error('ffmpeg conversion error:', e.message);
    }
  }

  if (serverProcess) {
    serverProcess.kill();
  }

  console.log('TensorCoreGpu recording and screenshots generated successfully!');
})();
