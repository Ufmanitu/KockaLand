// node test/nook-zoom-shot.js <prefix> <ms,ms,…> ["js a pillanatképek között"] — a book nook ráközelítéséről képek (CLIP nélkül teljes ablak)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const pre = process.argv[2], times = (process.argv[3] || '300,900,2200').split(',').map(Number), js = process.argv[4] || '';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const W = +process.env.W || 1280, H = +process.env.H || 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: process.env.DSF ? +process.env.DSF : 1 }); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  await page.addInitScript(() => { window.__MAX_DECOR = 99; window.__L3_LOWQ = !window.__HQ; try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } });
  if (process.env.HQ) await page.addInitScript(() => { window.__HQ = true; });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 40000 }).catch(() => { });
  await page.evaluate(`(() => { S.shelves.forEach(s => { s.ids = s.ids.filter(id => !isDecorId(id)); }); S.decor = []; DECOR_SETS.forEach(set => { if (set.parts.some(p => p.type === 'book-nook')) addDecorSet(set, 0); });
    const bk = S.books.slice(0, 3).map(b => b.id); S.shelves[0].ids = bk.concat(S.shelves[0].ids.filter(id => isDecorId(id))); drawLibrary(); })()`);
  await page.waitForFunction('L3.on && L3.items.size > 0', null, { timeout: 30000 }).catch(() => { });
  await page.waitForTimeout(1500);
  const pos = await page.evaluate(() => { const sp = document.querySelector('.lb-sp[data-id^="d_"]'); sp.scrollIntoView({ block: 'center' }); const r = sp.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.52 }; });
  await page.waitForTimeout(600);
  const pos2 = await page.evaluate(() => { const sp = document.querySelector('.lb-sp[data-id^="d_"]'); const r = sp.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.52 }; });
  await page.mouse.move(pos2.x - 20, pos2.y); await page.mouse.click(pos2.x - 20, pos2.y); let t0 = Date.now();
  for (let i = 0; i < times.length; i++) { const w = times[i] - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); await page.screenshot({ path: pre + '-' + times[i] + '.png' }); }
  if (js) { await page.evaluate(js); await page.waitForTimeout(+process.env.AFTER || 800); await page.screenshot({ path: pre + '-after.png' }); }
  console.log(errs.length ? 'HIBA: ' + errs.join(' | ') : 'nincs konzolhiba', await page.evaluate(() => 'nkz=' + !!document.querySelector('.nkz') + ' hold=' + L3.hold));
  await b.close();
})();
