// Updated debug script to capture all Wix rich‑text elements and report any that overflow the 375 px viewport
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const width = 375;
  const height = 800;
  const url = 'http://localhost:8000/index.html';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for any rich‑text element to be present
  await page.waitForSelector('.wixui-rich-text', { timeout: 30000 });

  // Gather info for all rich‑text elements
  const items = await page.$$eval('.wixui-rich-text', nodes => {
    return nodes.map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id || null,
        classList: Array.from(el.classList),
        rect: { left: rect.left, right: rect.right, width: rect.width },
        computedStyle: {
          width: style.width,
          minWidth: style.minWidth,
          maxWidth: style.maxWidth,
          display: style.display,
          position: style.position,
          flex: style.flex || null,
          transform: style.transform,
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight
        },
        inlineStyle: el.getAttribute('style') || ''
      };
    });
  });

  // Identify overflow items
  const overflowItems = items.filter(i => i.rect.right > width);

  const result = { viewport: { width, height }, overflowItems, allItems: items };
  fs.writeFileSync('e:/Dhi-Brisk/debug_overflow.json', JSON.stringify(result, null, 2));
  await page.screenshot({ path: 'e:/Dhi-Brisk/debug_overflow.png', fullPage: true });
  await browser.close();
})();
