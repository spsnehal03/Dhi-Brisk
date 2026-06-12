// Updated overflow audit with scrollWidth, horizontal scroll detection, and element screenshots
const http = require('http');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const os = require('os');

function startServer(port = 8080) {
  const server = http.createServer((req, res) => {
    let filePath = path.join('e:/Dhi-Brisk', req.url.split('?')[0]);
    if (filePath.endsWith('/')) filePath += 'index.html';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
      } else {
        const ext = path.extname(filePath).toLowerCase();
        const mime = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
        }[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.end(data);
      }
    });
  });
  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

// Utility to generate a safe filename from breakpoint and element index
function elementScreenshotPath(bp, idx) {
  const safeIdx = String(idx).padStart(4, '0');
  return path.join('e:/Dhi-Brisk', `overflow_${bp}_${safeIdx}.png`);
}

(async () => {
  const port = 8080;
  const server = await startServer(port);
  const breakpoints = [1024, 768, 375];
  const results = [];
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const urlBase = `http://127.0.0.1:${port}/index.html`;

  for (const bp of breakpoints) {
    await page.setViewport({width: bp, height: 800});
    await page.goto(urlBase, {waitUntil: 'networkidle0', timeout: 60000});
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const horizontalScroll = await page.evaluate(() => window.scrollX > 0 || document.body.scrollWidth > window.innerWidth);
    // Capture full‑page screenshot for visual comparison
    const fullScreenshotPath = path.join('e:/Dhi-Brisk', `screenshot_${bp}.png`);
    await page.screenshot({path: fullScreenshotPath, fullPage: true});

    // Gather potentially overflowing elements
    const overflowCandidates = await page.evaluate(() => {
      const els = [];
      const viewportW = window.innerWidth;
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > viewportW) {
          const style = window.getComputedStyle(el);
          els.push({
            tag: el.tagName,
            id: el.id,
            classes: Array.from(el.classList),
            selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.classList.length ? '.' + Array.from(el.classList).join('.') : ''),
            display: style.display,
            visibility: style.visibility,
            opacity: parseFloat(style.opacity),
            rect: {
              top: rect.top,
              left: rect.left,
              right: rect.right,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height
            }
          });
        }
      });
      return els;
    });

    // Filter out hidden, zero‑size, Wix gallery helpers, and off‑canvas containers
    const filtered = [];
    for (let i = 0; i < overflowCandidates.length; i++) {
      const el = overflowCandidates[i];
      // Hidden checks
      if (el.display === 'none' || el.visibility === 'hidden' || el.opacity === 0) continue;
      if (el.rect.width === 0 || el.rect.height === 0) continue;
      // Wix gallery heuristic: class contains "pro-gallery" or "gallery" and element is not visible content
      const classStr = el.classes.join(' ');
      if (/pro-gallery|gallery/.test(classStr)) continue;
      // Off‑canvas helper (entirely left/right of viewport)
      if (el.rect.right <= 0 || el.rect.left >= viewportWidth) continue;

      // Capture element screenshot
      const elementHandle = await page.$(el.selector);
      if (elementHandle) {
        const elPath = elementScreenshotPath(bp, i);
        await elementHandle.screenshot({path: elPath});
        el.screenshot = elPath;
      }
      filtered.push(el);
    }

    results.push({
      breakpoint: bp,
      viewportWidth,
      scrollWidth,
      scrollMatch: scrollWidth === viewportWidth,
      horizontalScroll,
      fullScreenshot: fullScreenshotPath,
      overflowElements: filtered
    });
  }

  await browser.close();
  server.close();
  console.log(JSON.stringify(results, null, 2));
})();
