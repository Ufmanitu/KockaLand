// node test/decor-limit.test.js — v12/v16: egyszerre legfeljebb 3 dísz (MAX_DECOR = 3; a 3 üvegablak-lámpa együtt kitehető): induláskor díszmentes polc, a régi mentés díszei egyszer lekerülnek (decor12), a felesleg betöltéskor levágódik, a limit feletti új dísz a legrégebbit cseréli, a modal ezt mondja; gyenge GPU-n alacsonyabb fokozat
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
  ok(await page.evaluate(() => MAX_DECOR === 3 && S.decor.length === 0 && decorLeft() === 3), 'induláskor nincs dísz, három fér ki (MAX_DECOR = 3)');

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

  // a jelző után 4 dísz a mentésben → betöltéskor 3 marad (a polcok sorrendjében az első három), árva id nincs
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY)); raw.settings.decor12 = true; raw.decor = [];
    ['macska', 'bagoly', 'noveny', 'szellem'].forEach((t, i) => { const d = newDecor(t); raw.decor.push(d); raw.shelves[i % raw.shelves.length].ids.push(d.id); });
    localStorage.setItem(STORE_KEY, JSON.stringify(raw)); S = null;
  });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(ready); await page.waitForTimeout(1200);
  const tr = await page.evaluate(() => ({ n: S.decor.length, onShelves: S.shelves.reduce((a, s) => a + s.ids.filter(isDecorId).length, 0), orphan: S.shelves.some(s => s.ids.some(id => isDecorId(id) && !decorById(id))) }));
  ok(tr.n === 3 && tr.onShelves === 3 && !tr.orphan, 'betöltéskor a limit felettiek lekerülnek: ' + JSON.stringify(tr));
  ok(await page.waitForFunction(() => Array.from(document.querySelectorAll('.toast')).some(t => /Egyszerre csak 3/.test(t.textContent)), null, { timeout: 6000 }).then(() => true, () => false), 'üzenet a levágásról');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem(STORE_KEY)).decor.length === 3), 'a levágás el is mentődik');

  // 3 dísz együtt kifér; a negyedik a legrégebbit cseréli (nem mellé kerül)
  const rep = await page.evaluate(() => {
    S.decor = []; S.shelves.forEach(x => { x.ids = x.ids.filter(id => !isDecorId(id)); });
    const sets = DECOR_SETS.filter(s => s.parts.length === 1), ty = i => sets[i].parts[0].type;
    addDecorSet(sets[0], 0); addDecorSet(sets[1], 1); addDecorSet(sets[2], 0); const t3 = S.decor.map(d => d.type).join(), left3 = decorLeft();
    addDecorSet(sets[3], 1); const t4 = S.decor.map(d => d.type).join();
    return { t3, t4, left3, n: S.decor.length, onShelves: S.shelves.reduce((x, s) => x + s.ids.filter(isDecorId).length, 0), want3: [ty(0), ty(1), ty(2)].join(), want4: [ty(1), ty(2), ty(3)].join(), sets: sets.length };
  });
  ok(rep.sets >= 4 && rep.t3 === rep.want3 && rep.left3 === 0, 'három dísz együtt kifér: ' + rep.t3);
  ok(rep.n === 3 && rep.onShelves === 3 && rep.t4 === rep.want4, 'a negyedik a legrégebbit cseréli: ' + JSON.stringify(rep));
  // mind a három üvegablak-lámpa egyszerre kitehető
  const lamps = await page.evaluate(() => {
    S.decor = []; S.shelves.forEach(x => { x.ids = x.ids.filter(id => !isDecorId(id)); });
    ['uveg-var', 'uveg-rozsa', 'uveg-kard'].forEach((id, i) => { const st = DECOR_SETS.find(s => s.id === id); addDecorSet(st, i % S.shelves.length); });
    return { types: S.decor.map(d => d.type).join(), onShelves: S.shelves.reduce((x, s) => x + s.ids.filter(isDecorId).length, 0) };
  });
  ok(lamps.types === 'uveg-var,uveg-rozsa,uveg-kard' && lamps.onShelves === 3, 'mind a 3 lámpa egyszerre a polcon: ' + JSON.stringify(lamps));
  ok(await page.evaluate(() => { const big = DECOR_SETS.find(s => s.parts.length > 1); return !big || addDecorSet(big, 0) === false; }), 'a több darabos készlet (ha van) nem fér ki, false');

  // modal: a számláló szövege + a gomb felirata (tele: „Csere erre”; hely van: „Kirakom”)
  await page.evaluate(() => decorModal()); await page.waitForSelector('.dc-count');
  const cnt = await page.$eval('.dc-count', e => e.textContent);
  ok(/3\/3/.test(cnt) && /legrégebbit cseréled/.test(cnt), 'a modal jelzi: 3/3 és a cserét: ' + cnt.slice(0, 80));
  ok(await page.$$eval('.dc-card button', bs => bs.length > 0 && bs.every(x => /Csere erre/.test(x.textContent))), 'tele polcnál a gombok felirata „Csere erre”');
  await page.evaluate(() => { document.querySelectorAll('.modal-back').forEach(m => m.remove()); removeDecor(S.decor[0].id); });
  await page.evaluate(() => decorModal()); await page.waitForSelector('.dc-count');
  const cnt2 = await page.$eval('.dc-count', e => e.textContent);
  ok(/2\/3/.test(cnt2) && !/cseréled/.test(cnt2) && await page.$$eval('.dc-card button', bs => bs.length > 0 && bs.every(x => /Kirakom/.test(x.textContent))), 'hely van: „Kirakom” gombok és 2/3 (' + cnt2.slice(0, 60) + ')');
  await page.evaluate(() => { document.querySelectorAll('.modal-back').forEach(m => m.remove()); S.decor.slice().forEach(d => removeDecor(d.id)); });
  ok(await page.evaluate(() => S.decor.length === 0 && decorLeft() === 3), 'mind levéve után újra fér három dísz');
  ok(errs.length === 0, '2D: nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await page.context().close();

  /* --- gyenge GPU: alacsonyabb fokozat, MSAA nélkül; díszek 3D-ben és laposan --- */
  ({ page, errs } = await mk(1100, 760, { v3: true, weak: true }));
  await page.addInitScript(() => { window.__STARTER = true; });
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 90000 });
  const w = await page.evaluate(() => ({ weak: L3.weak, deg: L3.deg, aa: L3.r.getContextAttributes().antialias, pr: L3.r.getPixelRatio(), sm: L3.key.shadow.mapSize.x, nd: Array.from(L3.items.values()).filter(i => i.kind === 'decor').length }));
  ok(w.weak === true && w.deg >= 1 && w.aa === false && w.pr <= 1 && w.sm <= 1024, 'gyenge GPU: fokozat ' + w.deg + ', MSAA nélkül, felbontás ' + w.pr + '×, árnyék ' + w.sm);
  ok(w.nd <= 3, 'a 3D polcon legfeljebb három dísz áll: ' + w.nd);
  const f = await page.evaluate(async () => { const n3 = Array.from(L3.items.values()).filter(i => i.kind === 'decor').length; S.settings.flatDecor = true; drawLibrary(); await new Promise(r => setTimeout(r, 2500)); return { n3, nFlat: Array.from(L3.items.values()).filter(i => i.kind === 'decor').length }; });
  ok(f.nFlat === f.n3, 'lapos díszek: ugyanannyi dísz marad (' + f.nFlat + ')');
  ok(errs.length === 0, '3D: nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exit(fails ? 1 : 0);
})();
