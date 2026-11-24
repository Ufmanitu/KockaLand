// node test/nookzoom.test.js — book nook: 3D szoba + ráközelítés (zoom-nézet): megnyílik, tárgyak kattinthatók, lámpa mentődik és szinkronban van a polcon álló szobával, Esc/×/háttér zár, nincs szivárgás
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 900, height: 720 } }); const page = await ctx.newPage(); page.setDefaultTimeout(120000); const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'warning' && /THREE/.test(m.text())) errs.push('WARN ' + m.text().slice(0, 160)); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  await page.addInitScript(() => { window.__MAX_DECOR = 99; window.__STARTER = true; window.__L3_LOWQ = true; try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 60000 });
  await page.evaluate(() => { S.shelves.forEach(s => { s.ids = s.ids.filter(id => !isDecorId(id)); }); S.decor = []; DECOR_SETS.forEach(set => { if (set.parts.some(p => p.type === 'book-nook')) addDecorSet(set, 0); }); drawLibrary(); });
  await page.waitForFunction('L3.on && Array.from(L3.items.values()).some(i => i.d && i.d.type === "book-nook")', null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => { const it = Array.from(L3.items.values()).find(i => i.d.type === 'book-nook'); let tri = 0; const parts = {}; it.grp.traverse(o => { if (o.isMesh && o.geometry) { const g = o.geometry; tri += (g.index ? g.index.count : g.attributes.position.count) / 3; } }); it.parts.forEach(p => { const k = p.userData.part; parts[k] = (parts[k] || 0) + 1; }); return { tri: Math.round(tri), parts: parts, ar: it.w / it.h }; });
  ok(info.tri > 20000, 'polcon: valódi 3D szoba (' + info.tri + ' háromszög)');
  ok(['sw', 'fire', 'window', 'cat', 'globe', 'plant', 'chair', 'clock', 'shelf'].every(k => info.parts[k] > 0), 'polcon: minden kattintható tárgy-rész megvan (' + Object.keys(info.parts).join(',') + ')');
  ok(info.ar > 0.95 && info.ar < 1.15, 'polcon: a szoba majdnem négyzetes (ar ' + info.ar.toFixed(2) + ')');
  const base = await page.evaluate(() => ({ cv: document.querySelectorAll('canvas').length, g: L3.r.info.memory.geometries }));
  // megnyitás (animáció nélkül: gyors), tartalom
  await page.evaluate(() => { S.settings.motion = false; });
  const open = async () => { await page.evaluate(() => { const it = Array.from(L3.items.values()).find(i => i.d.type === 'book-nook'); l3DecorClick(it, null, null, 'shelf'); }); await page.waitForSelector('.nkz'); await page.waitForFunction('NKZ.o && NKZ.o.p === 1', null, { timeout: 60000 }); };
  await open();
  const st = await page.evaluate(() => ({ role: document.querySelector('.nkz').getAttribute('role'), modal: document.querySelector('.nkz').getAttribute('aria-modal'), hold: L3.hold, btns: document.querySelectorAll('.nkz-b').length, cv: document.querySelectorAll('canvas').length, scroll: getComputedStyle(document.documentElement).overflow, foc: document.activeElement && document.activeElement.className }));
  ok(st.role === 'dialog' && st.modal === 'true', 'zoom: párbeszéd-ablak (dialog, aria-modal)');
  ok(st.hold === true && st.cv === base.cv + 1, 'zoom: saját vászon nyílik, a fő színtér szünetel');
  ok(st.btns === 8 && st.scroll === 'hidden', 'zoom: 8 tárgy-gomb, a lap nem görgethető');
  // a vászon közepére kattintás / mozgatás hiba nélkül
  const box = await page.$eval('.nkz-cv', e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  for (const [fx, fy] of [[0.5, 0.35], [0.3, 0.5], [0.6, 0.62], [0.8, 0.5], [0.15, 0.4], [0.5, 0.8]]) { await page.mouse.move(box.x + box.w * fx, box.y + box.h * fy); await page.mouse.click(box.x + box.w * fx, box.y + box.h * fy); await page.waitForTimeout(150); }
  ok(await page.evaluate(() => !!document.querySelector('.nkz')), 'zoom: tárgyakra kattintva marad nyitva');
  // a gombok: lámpa kapcsol + mentődik + a polcon álló szobával szinkronban
  const lampOff = async () => { await page.evaluate(() => { document.querySelector('.nkz-b').click(); }); await page.waitForTimeout(100); return page.evaluate(() => ({ off: S.decor.find(d => d.type === 'book-nook').off === true })); };
  const l1 = await lampOff(); ok(l1.off === true, 'zoom: a lámpa gomb lekapcsol, mentve (d.off)');
  await page.waitForFunction('NKZ.o.ctl.S.lit < 0.05', null, { timeout: 60000 }); ok(true, 'zoom: lekapcsolva a szoba besötétedik (lit→0)');
  const sync = await page.evaluate(async () => { const it = Array.from(L3.items.values()).find(i => i.d.type === 'book-nook'); for (let i = 0; i < 200 && it.ctl.S.lit > 0.05; i++) await new Promise(r => setTimeout(r, 100)); return it.ctl.S.lit; });
  ok(sync < 0.05, 'zoom: a polcon álló szoba is lekapcsolódik');
  const l2 = await lampOff(); ok(l2.off === false, 'zoom: újra megnyomva felkapcsol (d.off törölve)');
  await page.evaluate(() => { Array.from(document.querySelectorAll('.nkz-b')).slice(1).forEach(b => b.click()); }); await page.waitForTimeout(600);
  ok(await page.evaluate(() => !!NKZ.o && NKZ.o.p === 1), 'zoom: mind a 8 gomb hiba nélkül lefut');
  // zárás: Esc, ×, háttér; fókusz-visszaadás
  await page.keyboard.press('Escape'); await page.waitForFunction('!document.querySelector(".nkz")', null, { timeout: 30000 });
  const z1 = await page.evaluate(() => ({ hold: L3.hold, o: NKZ.o, cv: document.querySelectorAll('canvas').length, ov: getComputedStyle(document.documentElement).overflow }));
  ok(z1.hold === false && z1.o === null && z1.cv === base.cv && z1.ov !== 'hidden', 'Esc: bezár, a vászon és a zár megszűnik');
  await open(); await page.click('.nkz-x'); await page.waitForFunction('!document.querySelector(".nkz")', null, { timeout: 30000 }); ok(true, '×: bezár');
  await open(); await page.mouse.click(5, 5); await page.waitForFunction('!document.querySelector(".nkz")', null, { timeout: 30000 }); ok(true, 'háttérre kattintva bezár');
  await open(); await page.keyboard.press('Tab'); ok(await page.evaluate(() => !!document.querySelector('.nkz') && document.querySelector('.nkz').contains(document.activeElement)), 'Tab: a fókusz a párbeszéd-ablakban marad');
  await page.keyboard.press('Escape'); await page.waitForFunction('!document.querySelector(".nkz")', null, { timeout: 30000 });
  // dupla megnyitás: egyszerre csak egy
  await open(); await page.evaluate(() => { const it = Array.from(L3.items.values()).find(i => i.d.type === 'book-nook'); l3DecorClick(it, null, null, 'shelf'); }); await page.waitForTimeout(200);
  ok(await page.evaluate(() => document.querySelectorAll('.nkz').length === 1), 'zoom: egyszerre csak egy nyílhat');
  await page.keyboard.press('Escape'); await page.waitForFunction('!document.querySelector(".nkz")');
  // animációs út (valódi dolly + FLIP), majd szivárgás
  await page.evaluate(() => { delete S.settings.motion; });
  await page.evaluate(() => { const it = Array.from(L3.items.values()).find(i => i.d.type === 'book-nook'); l3DecorClick(it, null, null, 'shelf'); });
  await page.waitForFunction('NKZ.o && NKZ.o.p === 1', null, { timeout: 120000 });
  ok(await page.evaluate(() => document.querySelector('.nkz').classList.contains('on')), 'animált megnyitás: a dolly végére kész');
  await page.keyboard.press('Escape'); await page.waitForFunction('!document.querySelector(".nkz")', null, { timeout: 120000 }); ok(true, 'animált zárás: lefut, takarít');
  await page.evaluate(() => { S.settings.motion = false; });
  for (let i = 0; i < 3; i++) { await open(); await page.keyboard.press('Escape'); await page.waitForFunction('!document.querySelector(".nkz")'); }
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({ cv: document.querySelectorAll('canvas').length, g: L3.r.info.memory.geometries, anims: L3.anims.length }));
  ok(after.cv === base.cv && after.g <= base.g + 2, 'nincs szivárgás 3 nyitás/zárás után (vászon ' + base.cv + '→' + after.cv + ', fő geometria ' + base.g + '→' + after.g + ')');
  ok(after.anims < 6, 'nem marad futó ciklus (anims ' + after.anims + ')');
  // 2D tartalék: a sikátor-jelenet továbbra is él
  await page.evaluate(() => { S.settings.view3d = false; drawLibrary(); }); await page.waitForSelector('.dc-book-nook .nk-svg');
  ok(true, '2D tartalék: a book nook sikátor-jelenete megjelenik');
  ok(errs.length === 0, 'nincs konzolhiba/figyelmeztetés' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exit(fails ? 1 : 0);
})();
