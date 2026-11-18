// node test/lib3d.test.js <out-prefix>  — 3D Könyvtár: betöltés, hover, kattintás, húzás, billentyű, 2D tartalék, mobil
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2] || '/tmp/l3t';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const THREE = fs.readFileSync(path.join(__dirname, 'vendor/three.min.js'));
  const url = 'file://' + path.resolve('dist/index.html') + '#polc';
  const mk = async (w, h, o) => {
    o = o || {}; const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: !!o.touch }); const page = await ctx.newPage(); page.setDefaultTimeout(120000); const errs = [];
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (o.noThree) await page.route(/cdn\.jsdelivr\.net/, r => r.abort()); else await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: THREE }));
    await page.addInitScript(() => { window.__L3_LOWQ = true; });
    await page.addInitScript(s => { try { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: Object.assign({ seen: true }, s) })); } } catch (e) { } }, o.settings || {});
    return { page, errs, ctx };
  };
  const ready = p => p.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 30000 });
  const scr = (p, id) => p.evaluate(id => { l3Cam(); const it = L3.items.get(id), v = new THREE.Vector3(); it.grp.getWorldPosition(v); v.y += it.h * 0.5; v.project(L3.cam); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; }, id);
  const until = (p, fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 20000 }).then(() => true, () => false);
  const bookId = (p, i) => p.evaluate(i => S.books[i].id, i);

  let { page, errs } = await mk(960, 760);
  await page.goto(url); await ready(page); await page.waitForTimeout(500);
  const info = await page.evaluate(() => ({ items: L3.items.size, books: S.books.length, decor: S.decor.length, canvas: !!document.getElementById('l3') && getComputedStyle(document.getElementById('l3')).display, l3: !!document.querySelector('.lb.l3'), btns: document.querySelectorAll('.lb-sp').length }));
  ok(info.items === info.books + info.decor, '3D: minden könyv és dísz a színtérben (' + info.items + ')');
  ok(info.canvas === 'block' && info.l3, '3D: a canvas látszik, a nézet .l3');
  ok(info.btns === info.items, 'a láthatatlan gombréteg is megvan (' + info.btns + ')');
  await page.evaluate(() => scrollTo(0, 330)); await page.waitForTimeout(400);

  // hover: kihúzódik
  const id0 = await bookId(page, 0); let p0 = await scr(page, id0);
  if (p0.y < 140 || p0.y > 700) { await page.evaluate(dy => scrollBy(0, dy), p0.y - 320); await page.waitForTimeout(500); p0 = await scr(page, id0); }
  await page.mouse.move(p0.x, p0.y);
  ok(await until(page, id => L3.hov && L3.hov.id === id && L3.hov.hv > 0.8, id0), 'hover: a könyv kihúzódik (hv>0.8)');
  ok(await page.evaluate(() => document.getElementById('l3').parentNode.querySelector('.lb-shelves').style.cursor === 'pointer'), 'hover: kéz-kurzor');
  await page.mouse.move(5, 5);
  ok(await until(page, id => L3.items.get(id).hv < 0.05, id0), 'elhúzva visszacsúszik');

  // kattintás → modal
  p0 = await scr(page, id0); await page.mouse.click(p0.x, p0.y); await page.waitForTimeout(300);
  ok(!!(await page.$('.modal')), 'kattintás: megnyílik a könyv ablaka');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // keresés: halványít
  await page.fill('#lb-q', 'zzzzzz'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => Array.from(L3.items.values()).filter(i => i.kind === 'book').every(i => i.dim === 1)), 'keresés: nem találat → minden könyv halvány');
  await page.fill('#lb-q', ''); await page.waitForTimeout(200);
  ok(await page.evaluate(() => Array.from(L3.items.values()).every(i => !i.dim)), 'keresés törölve: minden normál');

  // húzás: Átrendezés mód
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300); await page.click('button:has-text("Átrendezés")'); await page.waitForTimeout(600);
  const before = await page.evaluate(() => JSON.stringify(S.shelves.map(s => s.ids)));
  const dragId = await page.evaluate(() => S.shelves[0].ids.find(i => !isDecorId(i)));
  const from = await scr(page, dragId), lastShelfBook = await page.evaluate(() => { const s = S.shelves[S.shelves.length - 1]; return s.ids.filter(i => !isDecorId(i)).slice(-1)[0]; });
  const to = await scr(page, lastShelfBook);
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(from.x + 12, from.y + 8, { steps: 3 });
  ok(await page.evaluate(() => !!(DND.s && DND.s.l3 && DND.s.on)), 'húzás: elindul');
  await page.mouse.move(to.x + 30, to.y, { steps: 18 }); await until(page, () => DND.s && DND.s.slot && DND.s.si === S.shelves.length - 1, null, 15000); await page.waitForTimeout(400);
  await page.screenshot({ path: out + '-drag.png' });
  await page.mouse.up(); await until(page, () => !DND.s && L3.anims.length === 0, null, 15000); await page.waitForTimeout(500);
  const after = await page.evaluate(() => JSON.stringify(S.shelves.map(s => s.ids)));
  const sh = JSON.parse(after), sb = JSON.parse(before);
  ok(before !== after && sh.reduce((n, a) => n + a.length, 0) === sb.reduce((n, a) => n + a.length, 0), 'húzás: a könyv átkerült, az összeg stimmel');
  ok(sh[sh.length - 1].indexOf(dragId) >= 0, 'húzás: az utolsó polcon van az áthúzott könyv');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('kockazzunk.v1')).shelves.some(s => s.ids.length) ), 'húzás: mentve');
  // Esc megszakít
  const b2 = after, f2 = await scr(page, dragId);
  await page.mouse.move(f2.x, f2.y); await page.mouse.down(); await page.mouse.move(f2.x + 20, f2.y - 30, { steps: 4 }); await page.mouse.move(f2.x + 120, f2.y - 60, { steps: 5 }); await page.keyboard.press('Escape'); await page.mouse.up(); await until(page, () => !DND.s, null); await page.waitForTimeout(700);
  ok(await page.evaluate(() => JSON.stringify(S.shelves.map(s => s.ids))) === b2, 'Esc: a húzás megszakad, nincs változás');
  // billentyű: Shift+jobb
  const kb = await page.evaluate(() => S.shelves[0].ids.find(i => !isDecorId(i)));
  await page.focus('.lb-sp[data-id="' + kb + '"]'); const i0 = await page.evaluate(id => S.shelves.find(s => s.ids.includes(id)).ids.indexOf(id), kb);
  await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(500);
  ok(await page.evaluate(([id, i]) => { const sh = S.shelves.find(s => s.ids.includes(id)); return sh.ids.indexOf(id) !== i; }, [kb, i0]), 'Shift+→: a könyv odébb lép (billentyűs mozgatás)');
  await page.click('button:has-text("Kész az átrendezés")'); await page.waitForTimeout(400);

  // 2D/3D kapcsoló
  await page.click('button:has-text("2D nézet")'); await page.waitForTimeout(600);
  ok(!(await page.$('.lb.l3')) && (await page.$$('.lb-bk')).length > 5 && (await page.$eval('#l3', e => getComputedStyle(e).display)) === 'none', '2D nézet: a tartalék működik, a canvas rejtve');
  ok(await page.evaluate(() => S.settings.view3d === false), '2D választás mentve');
  await page.click('button:has-text("3D nézet")'); await ready(page); await page.waitForTimeout(400);
  ok(!!(await page.$('.lb.l3')), 'vissza 3D-re');
  // másik nézetre váltás elrejti a canvast
  await page.click('#top .nav a:has-text("Dobás")'); await page.waitForTimeout(500);
  ok((await page.$eval('#l3', e => getComputedStyle(e).display)) === 'none', 'másik nézet: a canvas elrejtve');
  ok(errs.length === 0, 'nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  // Three.js nem tölt be → 2D
  ({ page, errs } = await mk(1280, 900, { noThree: true }));
  await page.goto(url); await page.waitForTimeout(2500);
  ok((await page.$$('.lb-bk')).length > 5 && !(await page.$('.lb.l3')), 'CDN nélkül: a 2D könyvtár látszik');
  ok(errs.length === 0, 'CDN nélkül nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  // Kímélő mód → 2D
  ({ page, errs } = await mk(1280, 900, { settings: { lite: true } }));
  await page.goto(url); await page.waitForTimeout(1200);
  ok((await page.$$('.lb-bk')).length > 5 && !(await page.$('.lb.l3')), 'Kímélő módban 2D');
  await page.context().close();

  // mobil
  for (const w of [390, 360]) {
    ({ page, errs } = await mk(w, 800, { touch: true }));
    await page.goto(url); await ready(page); await page.waitForTimeout(500);
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    ok(sw[0] <= sw[1], w + 'px: nincs vízszintes görgetés (' + sw.join('/') + ')');
    await page.evaluate(() => scrollTo(0, 360)); await page.waitForTimeout(400); await page.screenshot({ path: out + '-m' + w + '.png' });
    ok(errs.length === 0, w + 'px: nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await page.context().close();
  }
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exitCode = fails ? 1 : 0;
})();
