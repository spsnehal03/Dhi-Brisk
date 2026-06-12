// responsive_audit.js
// This script loads the local Dhi‑Brisk site at three breakpoints (1024, 768, 375px),
// captures a screenshot for each, and gathers a list of elements that overflow
// the viewport width (i.e., cause horizontal scrolling) or have fixed pixel widths
// that are larger than the viewport. The results are saved as JSON and PNG images.

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration – viewports to test (width, height)
const viewports = [
  { width: 1024, height: 900, name: '1024' },
  { width: 768, height: 900, name: '768' },
  { width: 375, height: 800, name: '375' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const fileUrl = 'http://localhost:8000/index.html';
  await page.goto(fileUrl, {waitUntil: 'networkidle0', timeout: 60000});
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const report = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    // Capture full‑page screenshot (includes hero and surrounding sections)
    const screenshotPath = `e:/Dhi-Brisk/screenshot_${vp.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Evaluate elements that exceed the viewport width
    const overflowing = await page.evaluate((vw) => {
      const elems = [];
      const all = Array.from(document.querySelectorAll('*'));
      all.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Consider only visible elements (display not none, opacity > 0)
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || parseFloat(style.opacity) === 0) return;
        if (rect.right > vw) {
          elems.push({
            tag: el.tagName,
            id: el.id || null,
            classes: Array.from(el.classList),
            rect: { left: rect.left, right: rect.right, width: rect.width },
            computedWidth: style.width,
            computedMaxWidth: style.maxWidth,
            computedFlex: style.flex,
          });
        }
      });
      return elems;
    }, vp.width);

    report.push({
      breakpoint: vp.name,
      viewportWidth: vp.width,
      screenshot: screenshotPath,
      overflowElements: overflowing,
    });
  }

  // Save JSON report
  const jsonPath = 'e:/Dhi-Brisk/responsive_audit_report.json';
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  await browser.close();
})();
