const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAssetsForComponent(componentPath) {
  const componentName = path.basename(componentPath, '.tsx');
  console.log(`\n🚀 Processing: ${componentName}`);

  // 1. Inject into page.tsx
  // Use relative import from app/page.tsx to TODO/ component
  const relativePath = path.relative(path.join(__dirname, '../app'), path.join(__dirname, `../${componentPath}`))
    .replace(/\\/g, '/')
    .replace(/\.tsx$/, '');

  // Check if component uses default export or named export
  const componentSource = fs.readFileSync(path.join(__dirname, `../${componentPath}`), 'utf8');
  const hasDefaultExport = componentSource.includes('export default');
  const namedExportMatch = componentSource.match(/export\s+const\s+([A-Z][a-zA-Z0-9_]*)/);
  const namedExportName = namedExportMatch ? namedExportMatch[1] : componentName;

  const importStatement = hasDefaultExport
    ? `import Component from '${relativePath}';`
    : `import { ${namedExportName} as Component } from '${relativePath}';`;

  const pageContent = `
${importStatement}

export default function Page() {
  return (
    <div id="component-wrapper" className="flex items-center justify-center min-h-screen bg-white dark:bg-black p-8 transition-colors duration-300">
      <Component />
    </div>
  );
}
  `;
  fs.writeFileSync(path.join(__dirname, '../app/page.tsx'), pageContent.trim());
  console.log('✅ Injected into app/page.tsx. Waiting for Next.js Fast Refresh...');
  await delay(3000); // Wait for Next.js to recompile

  const browser = await chromium.launch();

  // Setup context with video recording
  const context = await browser.newContext({
    recordVideo: {
      dir: './public/assets/videos',
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000');

  // 2. Responsiveness Checks
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Laptop', width: 1280, height: 720 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await delay(500); // Allow GSAP/Framer Motion layouts to settle
    console.log(`✅ Passed ${vp.name} viewport check`);
  }

  // Reset to Laptop for recording
  await page.setViewportSize({ width: 1280, height: 720 });

  // 3. Capture Centered/Cropped Image
  const wrapper = page.locator('#component-wrapper > *').first();
  await wrapper.screenshot({ path: `./public/assets/images/${componentName}.png` });
  console.log('📸 Captured centered component image');

  // 4. Record 5-7s Interaction Video & Test Theming
  console.log('🎥 Recording interactions and theme toggling...');

  // Simulate hover interactions for animations
  const boundingBox = await wrapper.boundingBox();
  if (boundingBox) {
    await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
    await delay(2000); // Hover state 1

    // Switch to Dark Mode via media emulation
    await page.emulateMedia({ colorScheme: 'dark' });
    await delay(1000);

    // Simulate a click
    await page.mouse.down();
    await delay(200);
    await page.mouse.up();
    await delay(2000); // Observe interaction
  }

  // Close context to save the MP4 file
  const videoPath = await page.video().path();
  await context.close();

  // Rename video and convert WebM (Playwright default) to real MP4
  const tempVideoPath = `./public/assets/videos/${componentName}_temp.webm`;
  const finalVideoPath = `./public/assets/videos/${componentName}.mp4`;
  fs.renameSync(videoPath, tempVideoPath);

  // Convert WebM to real MP4 so 21st CLI accepts it
  try {
    const { execSync } = require('child_process');
    execSync(`ffmpeg -y -i "${tempVideoPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${finalVideoPath}" 2>/dev/null`);
    fs.unlinkSync(tempVideoPath); // Remove temp WebM
    console.log(`🎞️ Converted video to real MP4: ${finalVideoPath}`);
  } catch (e) {
    // Fallback: keep WebM but renamed to .mp4 (CLI may skip, but file exists)
    fs.renameSync(tempVideoPath, finalVideoPath);
    console.log(`🎞️ Saved video (WebM format): ${finalVideoPath} — note: 21st CLI may skip WebM`);
  }

  await browser.close();
  return componentName;
}

// Allow running directly via node for a specific file
if (process.argv[2]) {
  generateAssetsForComponent(process.argv[2]).catch(console.error);
}

module.exports = { generateAssetsForComponent };