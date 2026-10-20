const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const outDir = path.join(__dirname, '../public/assets/images');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    let browser;
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    }
    const context = await browser.newContext({
      viewport: { width: 1200, height: 750 }
    });
    const page = await context.newPage();

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const outPath = path.join(outDir, 'Cylinder3DRing.png');
    await page.screenshot({ path: outPath });
    console.log(`Light screenshot saved to ${outPath}`);

    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1000);
    const darkPath = path.join(outDir, 'Cylinder3DRing-dark.png');
    await page.screenshot({ path: darkPath });
    console.log(`Dark screenshot saved to ${darkPath}`);

    await browser.close();
  } catch (err) {
    console.error('Error capturing screenshot:', err);
    process.exit(1);
  }
})();
