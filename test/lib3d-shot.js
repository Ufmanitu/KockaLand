// node test/lib3d-shot.js <out.png> [szélesség] [magasság] [js-kód a képernyőkép előtt]
// A 3D Könyvtárról képet készít (a Three.js-t a test/vendor-ból szolgálja ki, a CDN helyett).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2] || '/tmp/l3.png', W = +process.argv[3] || 1280, H = +process.argv[4] || 900, pre = process.argv[5] || '';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: process.env.DSF ? +process.env.DSF : 1 }); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  await page.addInitScript(() => { try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 30000 }).catch(() => { });
  await page.waitForTimeout(900);
  if (pre) await page.evaluate(pre);
  await page.waitForTimeout(500);
  const clip = process.env.CLIP ? (c => ({ x: c[0], y: c[1], width: c[2], height: c[3] }))(process.env.CLIP.split(',').map(Number)) : null;
  await page.screenshot(Object.assign({ path: out, fullPage: !!process.env.FULL }, clip ? { clip: clip } : {}));
  console.log(errs.length ? 'HIBA: ' + errs.join(' | ') : 'nincs konzolhiba', await page.evaluate(() => typeof L3 !== 'undefined' ? 'items=' + L3.items.size + ' on=' + L3.on + ' st=' + L3.st : 'nincs L3'));
  await b.close();
})();
