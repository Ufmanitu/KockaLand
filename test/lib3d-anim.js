// node test/lib3d-anim.js <prefix> <típus> <ms,ms,…> "<js: `it` = a típus 3D eleme>" [x,y,w,h]  — a díszt egy üres polcra teszi, lefuttatja a js-t, és a megadott időpontokban képet készít
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const prefix = process.argv[2], type = process.argv[3], times = process.argv[4].split(',').map(Number), js = process.argv[5] || '', clip = (process.argv[6] || '70,470,320,230').split(',').map(Number);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2 }); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('ERR', e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) console.log('CON', m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  await page.addInitScript(() => { window.__L3_LOWQ = true; try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 40000 }).catch(() => { });
  await page.evaluate(`(() => { S.shelves.forEach(s => { s.ids = s.ids.filter(id => !isDecorId(id)); }); S.decor = []; DECOR_SETS.forEach(set => { if (set.parts.some(p => p.type === ${JSON.stringify(type)})) addDecorSet(set, 0); }); S.shelves[0].ids = S.shelves[0].ids.filter(id => isDecorId(id)); drawLibrary(); })()`);
  await page.waitForFunction('L3.on && L3.items.size > 0', null, { timeout: 30000 }).catch(() => { });
  await page.waitForTimeout(1500);
  await page.evaluate(`(() => { window.it = Array.from(L3.items.values()).find(x => x.d && x.d.type === ${JSON.stringify(type)}); ${js} })()`);
  const t0 = Date.now();
  for (const t of times) { const w = t - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); await page.screenshot({ path: prefix + '-' + t + '.png', clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3] } }); }
  await b.close();
})();
