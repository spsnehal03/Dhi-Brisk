// debug_container.js
// Loads the local Dhi‑Brisk site at mobile width (375px) and logs the outerHTML
// of #comp-lk9pm29g and its ancestor chain up to <body>.
// Also captures a screenshot of the region.

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:8000/index.html';
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.setViewport({ width: 375, height: 800 });

  // Wait a moment for Wix to render
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    const el = document.querySelector('#comp-lk9pm29g');
    if (!el) return { error: 'Element not found' };
    const chain = [];
    let cur = el;
    while (cur) {
      chain.push({
        tag: cur.tagName,
        id: cur.id || null,
        classList: Array.from(cur.classList),
        outerHTML: cur.outerHTML.slice(0, 200) // truncate for brevity
      });
      if (cur.tagName === 'BODY') break;
      cur = cur.parentElement;
    }
    return { chain };
  });

  fs.writeFileSync('e:/Dhi-Brisk/container_debug.json', JSON.stringify(result, null, 2));
  await page.screenshot({ path: 'e:/Dhi-Brisk/container_debug.png', fullPage: true });

  await browser.close();
})();
