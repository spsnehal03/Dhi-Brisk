const puppeteer = require('puppeteer');
(async () => {
  const breakpoints = [1024, 768, 375];
  const results = [];
  const page = await (await puppeteer.launch({headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']})).newPage();
  const fileUrl = `file:///e:/Dhi-Brisk/index.html`;
  for (const bp of breakpoints) {
    await page.setViewport({width: bp, height: 800});
    await page.goto(fileUrl, {waitUntil: 'networkidle0'});
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const overflow = await page.evaluate(() => {
      const overflowEls = [];
      const all = document.querySelectorAll('*');
      all.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          overflowEls.push({tag: el.tagName, id: el.id, classes: Array.from(el.classList), rect});
        }
      });
      return overflowEls;
    });
    results.push({breakpoint: bp, viewportWidth: bp, scrollWidth, overflowCount: overflow.length, overflowElements: overflow});
  }
  await page.browser().close();
  console.log(JSON.stringify(results, null, 2));
})();
