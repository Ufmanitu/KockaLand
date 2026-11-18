// localStorage dob → az oldal ettől még működjön
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1200, height: 900 } })).newPage(); const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.addInitScript(() => { const thrower = () => { throw new DOMException('blocked', 'SecurityError'); }; Storage.prototype.getItem = thrower; Storage.prototype.setItem = thrower; Storage.prototype.removeItem = thrower; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.resolve('dist/index.html'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.keyboard.press('Space'); await page.waitForTimeout(2200);
  console.log('sorok:', await page.$$eval('.rrow', e => e.length), '| figyelmeztetés:', await page.$$eval('.toast', e => e.map(x => x.textContent.slice(0, 40)).join('|')));
  console.log(errs.length ? errs.join('\n') : 'nincs JS-hiba tárolás nélkül');
  await b.close();
})();
