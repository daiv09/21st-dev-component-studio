const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    // Ensure output directories exist
    if (!fs.existsSync('to_done')) fs.mkdirSync('to_done', { recursive: true });
    if (!fs.existsSync('videos')) fs.mkdirSync('videos', { recursive: true });

    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'videos', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();

    // Try ports: 3000 first, then detect from common ports
    const ports = [3000, 3001, 3002, 3003];
    let url = null;
    for (const p of ports) {
      try {
        await page.goto(`http://localhost:${p}/`, { timeout: 3000, waitUntil: 'domcontentloaded' });
        url = `http://localhost:${p}/`;
        console.log('Server found on port:', p);
        break;
      } catch (e) {
        // Try next port
      }
    }

    if (!url) {
      console.log('No server found on tested ports. Please start server first.');
      await browser.close();
      process.exit(1);
    }

    // Wait for component to render
    await page.waitForTimeout(1500);

    // Capture image (cover preview)
    await page.screenshot({ path: 'to_done/cover-preview.png', fullPage: false });
    console.log('Cover image captured: to_done/cover-preview.png');

    // Capture video (5-7 seconds with interaction)
    await page.waitForTimeout(1500); // Component load
    await page.click('input[type="text"]').catch(() => {}); // Click input
    await page.waitForTimeout(1500); // Expand animation
    await page.keyboard.press('Tab').catch(() => {}); // Switch tab
    await page.waitForTimeout(1500); // Tab slide
    await page.waitForTimeout(1500); // Final state (total ~7s)

    await context.close();
    await browser.close();
    console.log('Video captured: videos/page-video.webm (5-7s)');
    console.log('Done. Check to_done/cover-preview.png and videos/page-video.webm');
  } catch (e) {
    console.error('Capture error:', e.message);
  }
})();
