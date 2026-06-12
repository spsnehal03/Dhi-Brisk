// hero_capture.js
// This script uses Puppeteer to capture computed styles of the desktop hero section and a screenshot.
// It opens the local index.html, sets a 1440px viewport, extracts layout data, and saves a PNG.
// The resulting JSON is written to hero_capture_output.json and screenshot to hero_capture.png in the project root.

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  const filePath = 'file://' + require('path').resolve('e:/Dhi-Brisk/index.html');
  await page.goto(filePath, {waitUntil: 'networkidle0'});

  // Capture screenshot of the hero area
  const heroElement = await page.$('#comp-lk89tpyf');
  if (heroElement) {
    await heroElement.screenshot({path: 'e:/Dhi-Brisk/hero_capture.png'});
  }

  const result = await page.evaluate(() => {
    const hero = document.querySelector('#comp-lk89tpyf');
    if (!hero) return {error: 'Hero element not found'};
    const getInfo = (el) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id || null,
        classList: Array.from(el.classList),
        src: el.src || null,
        text: el.innerText.trim() || null,
        rect: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
        styles: {
          fontSize: styles.fontSize,
          color: styles.color,
          lineHeight: styles.lineHeight,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          marginLeft: styles.marginLeft,
          marginRight: styles.marginRight,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          background: styles.background,
          display: styles.display,
          position: styles.position,
          objectFit: styles.objectFit || null
        }
      };
    };
    const childrenInfo = [];
    hero.querySelectorAll('h1, p, a, button, img').forEach(el => childrenInfo.push(getInfo(el)));
    const heroInfo = getInfo(hero);
    return {hero: heroInfo, children: childrenInfo};
  });

  fs.writeFileSync('e:/Dhi-Brisk/hero_capture_output.json', JSON.stringify(result, null, 2));
  await browser.close();
})();

// This script uses Puppeteer to capture computed styles of the desktop hero section.
// It opens the local index.html, sets a 1440px viewport, and extracts layout data.
// The resulting JSON is written to hero_capture_output.json in the project root.

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1440, height: 900});
  const filePath = 'file://' + require('path').resolve('e:/Dhi-Brisk/index.html');
  await page.goto(filePath, {waitUntil: 'networkidle0'});

  const result = await page.evaluate(() => {
    const hero = document.querySelector('#comp-lk89tpyf');
    if (!hero) return {error: 'Hero element not found'};
    const getInfo = (el) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id || null,
        classList: Array.from(el.classList),
        src: el.src || null,
        text: el.innerText.trim() || null,
        rect: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
        styles: {
          fontSize: styles.fontSize,
          color: styles.color,
          lineHeight: styles.lineHeight,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          marginLeft: styles.marginLeft,
          marginRight: styles.marginRight,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          background: styles.background,
          display: styles.display,
          position: styles.position,
          objectFit: styles.objectFit || null
        }
      };
    };
    const childrenInfo = [];
    hero.querySelectorAll('h1, p, a, button, img').forEach(el => childrenInfo.push(getInfo(el)));
    const heroInfo = getInfo(hero);
    return {hero: heroInfo, children: childrenInfo};
  });

  fs.writeFileSync('e:/Dhi-Brisk/hero_capture_output.json', JSON.stringify(result, null, 2));
  await browser.close();
})();
