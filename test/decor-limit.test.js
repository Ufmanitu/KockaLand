// node test/decor-limit.test.js — v12: egyszerre EGY dísz (MAX_DECOR = 1): induláskor díszmentes polc, a régi mentés díszei egyszer lekerülnek (decor12), a felesleg betöltéskor levágódik, az új dísz a régit cseréli, a modal ezt mondja; gyenge GPU-n alacsonyabb fokozat
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const mk = async (w, hgt, init) => {
    const ctx = await b.newContext({ viewport: { width: w, height: hgt } }); const page = await ctx.newPage(); page.setDefaultTimeout(120000); const errs = [];
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
    await page.addInitScript(init => { if (init.weak != null) window.__L3_WEAK = init.weak; try { if (window.name !== 'dl-seeded') { window.name = 'dl-seeded'; localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, tourDone: true, view3d: !!init.v3 } })); } } catch (e) { } }, init);
    return { page, errs };
  };
  const url = 'file://' + path.resolve('dist/index.html') + '#polc';
  const ready = 'typeof S !== "undefined" && S && Array.isArray(S.decor) && S.shelves && S.shelves.length';

  /* --- 2D nézet --- */
  let { page, errs } = await mk(1280, 1000, { v3: false });
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(ready); await page.waitForTimeout(700);
  ok(await page.evaluate(() => MAX_DECOR === 1 && S.decor.length === 0 && decorLeft() === 1), 'induláskor nincs dísz, egy fér ki (MAX_DECOR = 1)');

  // régi mentés (decor12 jelző nélkül) 3 díszszel: egyszer mindet levesszük, a jelző beáll
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY)); raw.decor = raw.decor || []; delete raw.settings.decor12;
    ['macska', 'bagoly', 'noveny'].forEach((t, i) => { const d = newDecor(t); raw.decor.push(d); raw.shelves[i % raw.shelves.length].ids.push(d.id); });
    localStorage.setItem(STORE_KEY, JSON.stringify(raw)); S = null;
  });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(ready); await page.waitForTimeout(1200);
  const w1 = await page.evaluate(() => ({ n: S.decor.length, onShelves: S.shelves.reduce((a, s) => a + s.ids.filter(isDecorId).length, 0), flag: !!S.settings.decor12, saved: JSON.parse(localStorage.getItem(STORE_KEY)).decor.length }));
  ok(w1.n === 0 && w1.onShelves === 0 && w1.flag && w1.saved === 0, 'v12 egyszeri törlés: ' + JSON.stringify(w1));
  ok(await page.waitForFunction(() => Array.from(document.querySelectorAll('.toast')).some(t => /lekerültek/.test(t.textContent)), null, { timeout: 6000 }).then(() => true, () => false), 'üzenet a levett díszekről');

  // a jelző után 3 dísz a mentésben → betöltéskor 1 marad (a polcok sorrendjében az első), árva id nincs
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY)); raw.settings.decor12 = true; raw.decor = [];
    ['macska', 'bagoly', 'noveny'].forEach((t, i) => { const d = newDecor(t); raw.decor.push(d); raw.shelves[i % raw.shelves.length].ids.push(d.id); });
    localStorage.setItem(STORE_KEY, JSON.stringify(raw)); S = null;
  });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(ready); await page.waitForTimeout(1200);
  const tr = await page.evaluate(() => ({ n: S.decor.length, onShelves: S.shelves.reduce((a, s) => a + s.ids.filter(isDecorId).length, 0), orphan: S.shelves.some(s => s.ids.some(id => isDecorId(id) && !decorById(id))) }));
  ok(tr.n === 1 && tr.onShelves === 1 && !tr.orphan, 'betöltéskor a limit felettiek lekerülnek: ' + JSON.stringify(tr));
  ok(await page.waitForFunction(() => Array.from(document.querySelectorAll('.toast')).some(t => /Egyszerre csak 1/.test(t.textContent)), null, { timeout: 6000 }).then(() => true, () => false), 'üzenet a levágásról');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem(STORE_KEY)).decor.length === 1), 'a levágás el is mentődik');

  // csere: az új dísz a régi helyére, nem mellé
  const rep = await page.evaluate(() => {
    const sets = DECOR_SETS.filter(s => s.parts.length === 1), a = sets[0], c = sets[1];
    addDecorSet(a, 0); const t1 = S.decor.map(d => d.type).join(); addDecorSet(c, 1); const t2 = S.decor.map(d => d.type).join();
    return { t1, t2, n: S.decor.length, onShelves: S.shelves.reduce((x, s) => x + s.ids.filter(isDecorId).length, 0), want: c.parts[0].type, sets: sets.length };
  });
  ok(rep.sets >= 2 && rep.n === 1 && rep.onShelves === 1 && rep.t2 === rep.want && rep.t1 !== rep.t2, 'új dísz cseréli a régit: ' + JSON.stringify(rep));
  ok(await page.evaluate(() => { const big = DECOR_SETS.find(s => s.parts.length > 1); return !big || addDecorSet(big, 0) === false; }), 'a több darabos készlet (ha van) nem fér ki, false');

  // modal: a számláló szövege + a gomb "Csere erre"
  await page.evaluate(() => decorModal()); await page.waitForSelector('.dc-count');
  const cnt = await page.$eval('.dc-count', e => e.textContent);
  ok(/lecser/.test(cnt), 'a modal jelzi a cserét: ' + cnt.slice(0, 60));
  ok(await page.$$eval('.dc-card button', bs => bs.length > 0 && bs.every(x => /Csere erre/.test(x.textContent))), 'a gombok felirata „Csere erre”');
  await page.evaluate(() => { document.querySelectorAll('.modal-back').forEach(m => m.remove()); removeDecor(S.decor[0].id); });
  ok(await page.evaluate(() => S.decor.length === 0 && decorLeft() === 1), 'levétel után újra fér egy dísz');
  ok(errs.length === 0, '2D: nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await page.context().close();

  /* --- gyenge GPU: alacsonyabb fokozat, MSAA nélkül; egy dísz 3D-ben és laposan --- */
  ({ page, errs } = await mk(1100, 760, { v3: true, weak: true }));
  await page.addInitScript(() => { window.__STARTER = true; });
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 90000 });
  const w = await page.evaluate(() => ({ weak: L3.weak, deg: L3.deg, aa: L3.r.getContextAttributes().antialias, pr: L3.r.getPixelRatio(), sm: L3.key.shadow.mapSize.x, nd: Array.from(L3.items.values()).filter(i => i.kind === 'decor').length }));
  ok(w.weak === true && w.deg >= 1 && w.aa === false && w.pr <= 1 && w.sm <= 1024, 'gyenge GPU: fokozat ' + w.deg + ', MSAA nélkül, felbontás ' + w.pr + '×, árnyék ' + w.sm);
  ok(w.nd <= 1, 'a 3D polcon legfeljebb egy dísz áll: ' + w.nd);
  const f = await page.evaluate(async () => { const n3 = Array.from(L3.items.values()).filter(i => i.kind === 'decor').length; S.settings.flatDecor = true; drawLibrary(); await new Promise(r => setTimeout(r, 2500)); return { n3, nFlat: Array.from(L3.items.values()).filter(i => i.kind === 'decor').length }; });
  ok(f.nFlat === f.n3, 'lapos díszek: ugyanannyi dísz marad (' + f.nFlat + ')');
  ok(errs.length === 0, '3D: nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exit(fails ? 1 : 0);
})();
