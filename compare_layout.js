// compare_layout.js
// Loads both the new build (index.html) and the Wix baseline (index_backup.html) and extracts layout metrics.
const puppeteer = require('puppeteer');
const fs = require('fs');

const pages = [
  { name: 'new', url: 'http://localhost:8000/index.html' },
  { name: 'baseline', url: 'http://localhost:8000/index_backup.html' },
];

const selectors = {
  navbar: '.navbar .container',
  heroContainer: '#hero .hero-inner',
  heroHeading: '#hero .hero-text h1',
  heroImages: '#hero .hero-images img',
  aboutContainer: '#about .container',
  galleryGrid: '.gallery .gallery-grid',
  footerContainer: '.footer .container',
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = {};
  for (const pageInfo of pages) {
    const page = await browser.newPage();
    await page.goto(pageInfo.url, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(500); // ensure layout
    const data = {};
    for (const [key, sel] of Object.entries(selectors)) {
      const el = await page.$(sel);
      if (!el) { data[key] = null; continue; }
      const rect = await page.evaluate(el => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          fontSize: style.fontSize,
        };
      }, el);
      data[key] = rect;
    }
    results[pageInfo.name] = data;
    await page.close();
  }
  await browser.close();
  fs.writeFileSync('e:/Dhi-Brisk/layout_compare.json', JSON.stringify(results, null, 2));
})();
