// node test/lib3d-gallery.js <out.png> <típus,típus,…|all> [js] — a megadott díszeket egy polcra teszi, és képet készít a polcról (CLIP=x,y,w,h, DSF)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2], types = process.argv[3] || 'all', pre = process.argv[4] || '';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: process.env.DSF ? +process.env.DSF : 1 }); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  const lowq = !process.env.HQ; await page.addInitScript(l => { window.__MAX_DECOR = 99; window.__L3_LOWQ = l; try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } }, lowq);
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 40000 }).catch(() => { });
  await page.evaluate(`(() => {
    const want = ${JSON.stringify(types)}.split(','), keep = new Set(want);
    // az 1. polcot kiürítjük a könyvektől, és csak a kért díszeket tesszük rá
    S.shelves.forEach(s => { s.ids = s.ids.filter(id => !isDecorId(id)); });
    S.decor = [];
    DECOR_SETS.forEach(set => { if (want[0] === 'all' || set.parts.some(p => keep.has(p.type))) addDecorSet(set, 0); });
    S.shelves[0].ids = S.shelves[0].ids.filter(id => isDecorId(id) || S.books.some(b => b.id === id)).slice(0, 40);
    const nb = ${+process.env.BOOKS || 0}; const bk = S.books.slice(0, nb).map(b => b.id); S.shelves[0].ids = bk.concat(S.shelves[0].ids.filter(id => isDecorId(id)));
    drawLibrary();
  })()`);
  await page.waitForFunction('L3.on && L3.items.size > 0', null, { timeout: 30000 }).catch(() => { });
  await page.waitForTimeout(1500);
  if (pre) await page.evaluate(pre);
  await page.waitForTimeout(1200);
  const clip = process.env.CLIP ? (c => ({ x: c[0], y: c[1], width: c[2], height: c[3] }))(process.env.CLIP.split(',').map(Number)) : null;
  await page.screenshot(Object.assign({ path: out }, clip ? { clip: clip } : {}));
  console.log(errs.length ? 'HIBA: ' + errs.join(' | ') : 'nincs konzolhiba', await page.evaluate(() => 'items=' + L3.items.size));
  await b.close();
})();
