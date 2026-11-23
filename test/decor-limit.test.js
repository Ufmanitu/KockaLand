// node test/decor-limit.test.js — a díszek száma korlátos (MAX_DECOR = 8): betöltéskor a felesleg lekerül, a modal számlál és letilt, a gyenge-GPU mód alacsonyabb fokozaton indul
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

  /* --- 2D nézet: limit, trim, modal --- */
  let { page, errs } = await mk(1280, 1000, { v3: false });
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForFunction('typeof S !== "undefined" && Array.isArray(S.decor) && S.shelves && S.shelves.length'); await page.waitForTimeout(700);
  ok(await page.evaluate(() => S.decor.length === 6 && decorLeft() === 2), 'kezdetben 6 dísz, még 2 fér ki');
  // 12 díszt erőltetünk be a mentésbe (mintha egy régi mentés lenne: a persist() már levágná, ezért közvetlenül írjuk a tárolót, és az S-t nullázzuk, hogy a kilépéskori mentés ne írja felül)
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY)); ['macska', 'bagoly', 'noveny', 'kis-sarkany', 'macska', 'bagoly'].forEach((t, i) => { const d = newDecor(t); raw.decor.push(d); raw.shelves[i % raw.shelves.length].ids.push(d.id); });
    localStorage.setItem(STORE_KEY, JSON.stringify(raw)); S = null;
  });
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem(STORE_KEY)).decor.length === 12), '12 dísz a mentésben');
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction('typeof S !== "undefined" && S && Array.isArray(S.decor) && S.shelves && S.shelves.length'); await page.waitForTimeout(1200);
  const tr = await page.evaluate(() => ({ n: S.decor.length, onShelves: S.shelves.reduce((a, s) => a + s.ids.filter(isDecorId).length, 0), orphan: S.shelves.some(s => s.ids.some(id => isDecorId(id) && !decorById(id))), toast: Array.from(document.querySelectorAll('.toast')).map(t => t.textContent).join('|') }));
  ok(tr.n === 8 && tr.onShelves === 8 && !tr.orphan, 'betöltéskor a limit felettiek lekerülnek: ' + tr.n + ' dísz, ' + tr.onShelves + ' a polcon, árva id nincs');
  ok(await page.waitForFunction(() => Array.from(document.querySelectorAll('.toast')).some(t => /lekerült/.test(t.textContent)), null, { timeout: 6000 }).then(() => true, () => false), 'üzenet a levett díszekről');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('kockazzunk.v1')).decor.length === 8), 'a levágás el is mentődik');
  // a limitnél az új dísz nem kerül fel, a modal számol és figyelmeztet
  ok(await page.evaluate(() => { const before = S.decor.length; const r = addDecorSet(DECOR_SETS[0], 0); return r === false && S.decor.length === before; }), 'a limitnél az addDecorSet false, nem ad hozzá');
  await page.evaluate(() => decorModal()); await page.waitForSelector('.dc-count');
  const cnt = await page.$eval('.dc-count', e => ({ t: e.textContent, full: e.classList.contains('full') }));
  ok(/8 \/ 8/.test(cnt.t) && cnt.full, 'a modal számláló: ' + cnt.t.slice(0, 40) + ' (piros)');
  await page.click('.dc-card .btn-primary, .dc-card button.primary, .dc-card button'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => S.decor.length === 8 && /limit/.test(Array.from(document.querySelectorAll('.toast')).map(t => t.textContent).join('|'))), 'a Hozzáadás a limitnél üzenetet ad, nem tesz fel semmit');
  // levesszük az egyiket → már fér új (1 darabos készlet)
  await page.evaluate(() => { document.querySelectorAll('.modal-back').forEach(m => m.remove()); removeDecor(S.decor[0].id); });
  ok(await page.evaluate(() => { const set = DECOR_SETS.find(s => s.parts.length === 1); return decorLeft() === 1 && addDecorSet(set, 0) === true && S.decor.length === 8; }), 'levétel után újra fér egy dísz');
  ok(errs.length === 0, '2D: nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await page.context().close();

  /* --- gyenge GPU: alacsonyabb fokozat, MSAA nélkül --- */
  ({ page, errs } = await mk(1100, 760, { v3: true, weak: true }));
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 90000 });
  const w = await page.evaluate(() => ({ weak: L3.weak, deg: L3.deg, aa: L3.r.getContextAttributes().antialias, pr: L3.r.getPixelRatio(), sm: L3.key.shadow.mapSize.x }));
  ok(w.weak === true && w.deg >= 1 && w.aa === false && w.pr <= 1 && w.sm <= 1024, 'gyenge GPU: fokozat ' + w.deg + ', MSAA nélkül, felbontás ' + w.pr + '×, árnyék ' + w.sm);
  // lapos díszek kapcsolója: a 3D díszek helyett képek
  const f = await page.evaluate(async () => { const n3 = Array.from(L3.items.values()).filter(i => i.kind === 'decor').length; S.settings.flatDecor = true; drawLibrary(); await new Promise(r => setTimeout(r, 2500)); return { n3, nFlat: Array.from(L3.items.values()).filter(i => i.kind === 'decor').length, bill: Array.from(L3.items.values()).filter(i => i.kind === 'decor' && i.grp && i.grp.userData && i.grp.userData.flat).length }; });
  ok(f.n3 > 0 && f.nFlat === f.n3, 'lapos díszek: ugyanannyi dísz marad (' + f.nFlat + ')');
  ok(errs.length === 0, '3D: nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exit(fails ? 1 : 0);
})();
