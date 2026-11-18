// node test/faces.test.js — üres kockalapok keresése (DOM-szöveg) + képkocka-idő mérés dobás közben
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist/index.html');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const themes = await page.$$eval('.theme-chip', els => els.map(e => e.textContent.trim()));
  let bad = 0, total = 0;
  const readFaces = () => page.$$eval('.slot', slots => slots.map(s => ({ die: s.querySelector('.ln').textContent, faces: [...s.querySelectorAll('.face')].map(f => (f.textContent || '').trim()) })));
  for (let ti = 0; ti < themes.length; ti++) {
    await page.locator('.theme-chip').nth(ti).click();
    await page.waitForTimeout(500);
    for (let r = 0; r < 4; r++) {
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await page.keyboard.press('Space');
      await page.waitForTimeout(r % 2 ? 300 : 2100);
      const mid = r % 2 === 1;
      const data = await readFaces();
      data.forEach(d => d.faces.forEach((f, i) => { total++; if (!f || f === '·' || f === '–') { bad++; if (bad < 25) console.log('ÜRES/PONT', themes[ti], '|', d.die, '| lap', i, '|', JSON.stringify(f), mid ? '(dobás közben)' : ''); } }));
    }
  }
  console.log('lapok:', total, 'üres/pont:', bad);
  // képkocka-idő: 8 kocka forog
  await page.locator('.theme-chip').nth(0).click(); await page.waitForTimeout(700);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const ft = await page.evaluate(() => new Promise(res => {
    const t = []; let last = performance.now(), n = 0;
    const tick = now => { t.push(now - last); last = now; if (++n < 100) requestAnimationFrame(tick); else res(t); };
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
    requestAnimationFrame(tick);
  }));
  ft.sort((a, b) => a - b);
  const avg = ft.reduce((a, b) => a + b, 0) / ft.length;
  console.log('képkocka ms: átlag', avg.toFixed(1), 'p50', ft[50].toFixed(1), 'p95', ft[95].toFixed(1), 'max', ft[99].toFixed(1));
  console.log(errs.length ? errs.join('\n') : 'nincs konzolhiba');
  await browser.close();
})();
