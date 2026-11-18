// node test/decor.test.js <out-prefix>  — Díszek: kezdő pár, animáció-állapotok, billentyű, húzás, hozzáadás/eltávolítás, mentés, Kímélő mód, mobil
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/dc';
  const b = await chromium.launch();
  const mk = async (w, hgt, scheme, seed) => {
    const ctx = await b.newContext({ viewport: { width: w, height: hgt }, colorScheme: scheme || 'light', hasTouch: w < 600 });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.addInitScript(s => { try { if (!sessionStorage.getItem('dc-seeded')) { sessionStorage.setItem('dc-seeded', '1'); localStorage.setItem('kockazzunk.v1', JSON.stringify(s || { v: 1, themes: [], settings: { seen: true, view3d: false } })); } } catch (e) { } }, seed || null);
    return { page, errs, ctx };
  };
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const url = 'file://' + path.resolve('dist/index.html') + '#polc';
  const has = (page, sel, cls) => page.$eval(sel, (e, c) => e.classList.contains(c), cls);
  const centre = async (page, sel) => { const bb = await (await page.$(sel)).boundingBox(); return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }; };
  const clickNose = async page => { const c = await centre(page, '.dc-sarkany-fej .d-nose'); await page.mouse.move(c.x, c.y); await page.mouse.click(c.x, c.y); };

  /* --- asztali --- */
  let { page, errs } = await mk(1280, 1000, 'light');
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(900);
  const nDeco = await page.$$eval('.lb-deco', e => e.length);
  ok(nDeco === 7, 'kezdő díszek a polcokon (' + nDeco + ')');
  const pos = await page.evaluate(() => { const s = S.shelves.find(s => s.ids.some(isDecorId)); const d = s.ids.filter(isDecorId); return [s.ids.indexOf(d[0]), s.ids.length - 1 - s.ids.indexOf(d[1]), DECOR[decorById(d[0]).type].id, DECOR[decorById(d[1]).type].id, s.ids.length]; });
  ok(pos[0] === 0 && pos[1] === 0 && pos[2] === 'sarkany-fej' && pos[3] === 'sarkany-farok', 'fej a polc elején, farok a végén: ' + pos.join(','));
  ok(await page.evaluate(() => Array.isArray(S.decor) && S.decor.length === 7 && S.decor[0].link === S.decor[1].link), 'S.decor: 7 elem, a sárkány-pár összekötve');
  const hb = await page.$eval('.dc-sarkany-fej', e => { const r = e.getBoundingClientRect(); return [r.width, r.height]; });
  ok(hb[0] > 60 && hb[1] > 100, 'a fej látható mérettel: ' + hb.map(Math.round).join('×'));

  // bökés → szemöldök + farok legyintés
  await clickNose(page); await page.waitForTimeout(120);
  ok(await has(page, '.dc-sarkany-fej', 'is-boop'), 'orr-bökés: is-boop');
  await page.waitForTimeout(700);
  ok(await has(page, '.dc-sarkany-farok', 'is-flick'), 'a farok legyint (is-flick)');
  await page.waitForTimeout(2200);
  ok(!(await has(page, '.dc-sarkany-fej', 'is-boop')) && !(await has(page, '.dc-sarkany-farok', 'is-flick')), 'az állapot magától lekerül');
  // 3× gyors bökés → düh
  for (let i = 0; i < 3; i++) { await clickNose(page); await page.waitForTimeout(160); }
  ok(await has(page, '.dc-sarkany-fej', 'is-rage'), 'háromszori bökés: is-rage');
  await page.waitForTimeout(600);
  ok(await has(page, '.dc-sarkany-farok', 'is-slam'), 'a farok csap (is-slam)');
  await page.screenshot({ path: out + '-rage.png', clip: { x: 0, y: 120, width: 1280, height: 500 } });
  await page.waitForTimeout(2800);
  ok(!(await has(page, '.dc-sarkany-fej', 'is-rage')), 'a düh elmúlik');
  // simogatás (nem az orr)
  const hbb = await (await page.$('.dc-sarkany-fej')).boundingBox();
  await page.mouse.click(hbb.x + hbb.width * 0.62, hbb.y + hbb.height * 0.45); await page.waitForTimeout(150);
  ok(await has(page, '.dc-sarkany-fej', 'is-pet'), 'fejtetőn kattintás: is-pet (simogatás)');
  await page.waitForTimeout(2800);
  // farok kattintás
  const tbb = await (await page.$('.dc-sarkany-farok')).boundingBox();
  await page.mouse.click(tbb.x + tbb.width * 0.7, tbb.y + tbb.height * 0.62); await page.waitForTimeout(150);
  ok(await has(page, '.dc-sarkany-farok', 'is-wag'), 'farok-kattintás: is-wag');
  await page.waitForTimeout(500);
  ok(await has(page, '.dc-sarkany-fej', 'is-glance'), 'a fej hátranéz (is-glance)');
  await page.waitForTimeout(2200);
  // billentyű: Enter a fejen → bökés (nincs egér)
  await page.focus('.dc-sarkany-fej'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  ok(await has(page, '.dc-sarkany-fej', 'is-boop'), 'Enter a fejen: is-boop (billentyűzettel is játszható)');
  ok(!!(await page.$eval('.dc-sarkany-fej', e => e.getAttribute('aria-label'))), 'van aria-label a díszen');
  await page.waitForTimeout(2400);
  // szemkövetés
  await page.mouse.move(900, 300); await page.waitForTimeout(150); await page.mouse.move(120, 700); await page.waitForTimeout(250);
  const ex = await page.$eval('.dc-sarkany-fej', e => [e.style.getPropertyValue('--ex'), e.style.getPropertyValue('--ey')]);
  ok(ex[0] !== '' && ex[1] !== '', 'a szem követi az egeret (' + ex.join(',') + ')');

  // díszek hozzáadása / eltávolítása
  await page.click('button:has-text("Díszek")'); await page.waitForTimeout(300);
  ok(await page.$('.dc-modal .dc-card') != null, 'Díszek ablak katalógussal');
  await page.screenshot({ path: out + '-modal.png' });
  await page.selectOption('#dc-shelf', '1');
  const before = await page.evaluate(() => S.decor.length);
  await page.click('.dc-modal .dc-card:nth-of-type(1) .btn.primary'); await page.waitForTimeout(500);
  const after = await page.evaluate(() => S.decor.length);
  ok(after === before + 2, 'hozzáadás: +2 elem (' + before + '→' + after + ')');
  ok(await page.evaluate(() => { const s = S.shelves[1]; return isDecorId(s.ids[0]) && isDecorId(s.ids[s.ids.length - 1]); }), 'a választott polcra kerültek (eleje/vége)');
  ok((await page.$$('.lb-deco')).length === 9, '9 dísz látszik (7 kezdő + 2)');
  // szerkesztő módban a dísz kattintása a kezelő ablakot nyitja
  await page.click('button:has-text("Átrendezés")'); await page.waitForTimeout(200);
  ok(!(await page.$('.lb-deco.is-boop')), 'szerkesztő módban nincs animáció-bökés');
  await page.click('.lb-case:nth-of-type(2) .lb-deco >> nth=0'); await page.waitForTimeout(300);
  ok(await page.$('.dc-modal') != null, 'átrendezés módban: dísz-ablak (polc / eltávolítás)');
  await page.click('.dc-modal .btn.danger'); await page.waitForTimeout(400);
  ok((await page.evaluate(() => S.decor.length)) === after - 1, 'dísz eltávolítva');
  await page.click('.toast:last-child button'); await page.waitForTimeout(300);
  ok((await page.evaluate(() => S.decor.length)) === after, 'visszavonás visszahozza');
  // húzás: a fej a 3. polcra
  const rows = await page.$$('.lb-row'); const r3 = await rows[2].boundingBox();
  const hd = await (await page.$('.lb-case:nth-of-type(1) .lb-deco')).boundingBox(); const hid = await page.$eval('.lb-case:nth-of-type(1) .lb-deco', e => e.dataset.id);
  const sumBefore = await page.evaluate(() => S.shelves.reduce((n, s) => n + s.ids.length, 0));
  await page.mouse.move(hd.x + hd.width / 2, hd.y + hd.height / 2); await page.mouse.down();
  await page.mouse.move(hd.x + 40, hd.y + 20, { steps: 4 }); await page.mouse.move(r3.x + 200, r3.y + r3.height / 2, { steps: 12 }); await page.waitForTimeout(150);
  await page.screenshot({ path: out + '-drag.png' });
  await page.mouse.up(); await page.waitForTimeout(300);
  const mv = await page.evaluate(id => [S.shelves.findIndex(s => s.ids.indexOf(id) >= 0), S.shelves.reduce((n, s) => n + s.ids.length, 0)], hid);
  ok(mv[0] === 2 && mv[1] === sumBefore, 'a dísz átkerült a 3. polcra, nincs elveszett elem (' + mv.join(',') + ')');
  await page.click('button:has-text("Kész az átrendezés")'); await page.waitForTimeout(200);
  // könyv-keresés nem halványítja a díszt
  await page.fill('#lb-q', 'dűne'); await page.waitForTimeout(150);
  ok((await page.$$('.lb-deco.dim')).length === 0, 'keresés közben a díszek nem halványodnak');
  await page.fill('#lb-q', '');
  // mentés + biztonsági mentés körút
  const st = await page.evaluate(() => { persistNow(); const o = JSON.parse(localStorage.getItem('kockazzunk.v1')); const bk = JSON.parse(JSON.stringify(backupObject())); const n = S.decor.length; S.decor = []; S.shelves.forEach(s => { s.ids = s.ids.filter(i => !isDecorId(i)); }); restoreBackup(bk); return [o.decor.length, n, S.decor.length, S.shelves.reduce((c, s) => c + s.ids.filter(isDecorId).length, 0)]; });
  ok(st[0] === st[1] && st[2] === st[1] && st[3] === st[1], 'tárolás + mentés/visszaállítás megőrzi a díszeket: ' + st.join(','));
  ok(errs.length === 0, 'nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  /* --- „minden díszt levettem” → újratöltés után sem jön vissza --- */
  ({ page, errs } = await mk(1280, 900, 'light'));
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
  await page.evaluate(() => { S.decor = []; S.shelves.forEach(s => { s.ids = s.ids.filter(i => !isDecorId(i)); }); persistNow(); });
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
  ok((await page.$$('.lb-deco')).length === 0, 'üres S.decor: nem jönnek vissza a kezdő díszek');
  ok(await page.$('.lb') != null, 'üres díszekkel is rendben a polc');
  ok(errs.length === 0, 'nincs konzolhiba (üres)' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  /* --- Kímélő mód: nincs szemkövetés, de a kattintás-animáció megy --- */
  ({ page, errs } = await mk(1280, 900, 'light', { v: 1, themes: [], settings: { seen: true, lite: true } }));
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
  await page.mouse.move(900, 300); await page.waitForTimeout(150); await page.mouse.move(120, 700); await page.waitForTimeout(250);
  const ex2 = await page.$eval('.dc-sarkany-fej', e => e.style.getPropertyValue('--ex'));
  ok(ex2 === '', 'Kímélő mód: nincs szemkövetés');
  await clickNose(page); await page.waitForTimeout(150);
  ok(await has(page, '.dc-sarkany-fej', 'is-boop'), 'Kímélő módban is reagál a kattintásra');
  ok(errs.length === 0, 'nincs konzolhiba (lite)' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  /* --- sötét + mobil --- */
  for (const [w, hh, sch] of [[390, 800, 'dark'], [360, 740, 'light']]) {
    ({ page, errs } = await mk(w, hh, sch));
    await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(900);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth), cw = await page.evaluate(() => document.documentElement.clientWidth);
    ok(sw <= cw, w + 'px: nincs vízszintes görgetés (' + sw + '/' + cw + ')');
    ok((await page.$$('.lb-deco')).length === 7, w + 'px: a díszek megvannak');
    const tb = await page.$eval('.dc-sarkany-fej', e => { const r = e.getBoundingClientRect(); return [r.width, r.height]; });
    ok(tb[0] >= 44 && tb[1] >= 44, w + 'px: a dísz elég nagy az érintéshez: ' + tb.map(Math.round).join('×'));
    await page.tap('.dc-sarkany-fej .d-nose').catch(() => { }); await page.waitForTimeout(150);
    ok(await has(page, '.dc-sarkany-fej', 'is-boop'), w + 'px: érintésre is bökés');
    await page.screenshot({ path: out + '-m' + w + '.png' });
    await page.click('button:has-text("Átrendezés")'); await page.waitForTimeout(200);
    const sw2 = await page.evaluate(() => document.documentElement.scrollWidth); ok(sw2 <= cw, w + 'px szerkesztő módban sincs túlcsordulás');
    await page.click('button:has-text("Kész az átrendezés")'); await page.click('button:has-text("Díszek")'); await page.waitForTimeout(400);
    const mw = await page.evaluate(() => { const m = document.querySelector('.modal'); const r = m.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), document.documentElement.scrollWidth, document.documentElement.clientWidth]; });
    ok(mw[0] >= 0 && mw[1] <= mw[3] && mw[2] <= mw[3], w + 'px: Díszek ablak befér ' + mw.join('/'));
    await page.screenshot({ path: out + '-m' + w + '-modal.png' });
    ok(errs.length === 0, w + 'px: nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await page.context().close();
  }
  await b.close();
  console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exitCode = fails ? 1 : 0;
})();
