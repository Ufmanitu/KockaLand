// node test/shot.js <out-prefix> [hash] — képernyőképek + konzolhibák
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/shot';
  const hash = process.argv[3] || '';
  const browser = await chromium.launch();
  const errs = [];
  for (const [name, vp, scheme] of [['d-dark', { width: 1280, height: 900 }, 'dark'], ['m-light', { width: 400, height: 850 }, 'light']]) {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(name + ' ' + m.type() + ': ' + m.text()); });
    page.on('pageerror', e => errs.push(name + ' PAGEERROR: ' + e.message));
    await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.resolve(__dirname, '../dist/index.html') + hash, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2600);
    // a bevezető modal bezárása, ha van
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.screenshot({ path: out + '-' + name + '.png', fullPage: false });
    await ctx.close();
  }
  console.log(errs.length ? errs.join('\n') : 'nincs konzolhiba');
  await browser.close();
})();
