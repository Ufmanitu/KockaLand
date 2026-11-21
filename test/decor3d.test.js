// node test/decor3d.test.js — a valódi 3D díszek: minden típushoz van modell, felépülnek, kattintás-sorozat/idle/szem-követés hiba nélkül, nincs szivárgás (2D↔3D váltás)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 800, height: 640 } }); const page = await ctx.newPage(); page.setDefaultTimeout(120000); const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'warning' && /THREE/.test(m.text())) errs.push('WARN ' + m.text().slice(0, 160)); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  await page.addInitScript(() => { window.__L3_LOWQ = true; try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 60000 });
  // minden díszkészlet a 0. polcra
  const types = await page.evaluate(only => { S.shelves.forEach(s => { s.ids = s.ids.filter(id => !isDecorId(id)); }); S.decor = []; DECOR_SETS.forEach(set => { if (!only || set.parts.some(p => only.includes(p.type))) addDecorSet(set, 0); }); drawLibrary(); return Array.from(new Set(S.decor.map(d => d.type))); }, process.env.ONLY ? process.env.ONLY.split(',') : null);
  await page.waitForFunction('L3.on && Array.from(L3.items.values()).filter(i => i.kind !== "book").length >= ' + types.length, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  const missing = await page.evaluate(ts => ts.filter(t => !(DECOR3[t] && DECOR3[t].build)), types);
  ok(missing.length === 0, 'minden dísz-típushoz van 3D modell (' + types.length + ' típus' + (missing.length ? ', hiányzik: ' + missing.join(',') : '') + ')');
  const info = await page.evaluate(() => Array.from(L3.items.values()).filter(i => i.kind !== 'book').map(i => { let tri = 0; i.grp.traverse(o => { if (o.isMesh && o.geometry) { const g = o.geometry; tri += (g.index ? g.index.count : g.attributes.position.count) / 3; } }); return { t: i.d.type, tri: Math.round(tri), parts: i.parts.length, ctl: !!i.ctl }; }));
  const IMG = ['kis-sarkany'];   // a repülő sárkány szándékosan 2D kép (rétegelt síkok), a többi valódi 3D modell
  info.forEach(i => ok(IMG.includes(i.t) ? (i.tri >= 16 && i.parts > 0) : (i.tri > 800 && i.parts > 0), i.t + (IMG.includes(i.t) ? ': 2D kép-rétegek (' : ': valódi 3D modell (') + i.tri + ' háromszög, ' + i.parts + ' kattintható rész)'));
  const lite = info.filter(i => i.tri < 800 && !IMG.includes(i.t)); ok(lite.length === 0, 'nincs lapos (billboard) tartalék-dísz a 3D modellek közt');
  // kattintás-sorozat (3×), idle, szem-követés
  const run = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)); const res = [];
    const items = Array.from(L3.items.values()).filter(i => i.kind !== 'book');
    for (const it of items) {
      try {
        const parts = it.parts && it.parts.length ? it.parts.map(p => p.userData && p.userData.part) : [];
        const nook = it.d.type === 'book-nook', mo = S.settings.motion; if (nook) S.settings.motion = false;   // a book nook rákattintva megnyitja a zoom-nézetet: gyors (animáció nélküli) nyitás/zárás
        for (let k = 0; k < 3; k++) { l3DecorClick(it, null, null, parts[k % Math.max(1, parts.length)]); await wait(250); if (typeof NKZ !== 'undefined' && NKZ.o) { NKZ.o.el.querySelector('.nkz-x').click(); await wait(400); } }
        if (nook) { if (mo === undefined) delete S.settings.motion; else S.settings.motion = mo; }
        if (it.ctl && it.ctl.idle) it.ctl.idle();
        if (it.ctl && it.ctl.look) { it.ctl.look({ x: 100, y: 100 }); it.ctl.look(null); }
        await wait(200); res.push([it.d.type, 'ok']);
      } catch (e) { res.push([it.d.type, String(e && e.message || e)]); }
    }
    return res;
  });
  run.forEach(r => ok(r[1] === 'ok', r[0] + ': 3 kattintás + idle + szem-követés hiba nélkül' + (r[1] === 'ok' ? '' : ' → ' + r[1])));
  await page.waitForFunction('L3.anims.length === 0', null, { timeout: 90000 }).catch(() => { });
  // szivárgás: 2D↔3D oda-vissza, a geometriák/textúrák száma nem nőhet
  const mem = () => page.evaluate(() => ({ g: L3.r.info.memory.geometries, t: L3.r.info.memory.textures }));
  const cyc = async () => {
    await page.evaluate(() => { S.settings.view3d = false; drawLibrary(); }); await page.waitForTimeout(300);
    await page.evaluate(() => { S.settings.view3d = true; drawLibrary(); }); await page.waitForFunction('L3.on && L3.items.size > 0', null, { timeout: 60000 }); await page.waitForTimeout(1500);
    return mem();
  };
  await cyc(); const m0 = await cyc(), m1 = await cyc();   // az 1. kör után „felmelegedett” állapothoz mérünk
  ok(m1.g <= m0.g + 2 && m1.t <= m0.t + 2, 'nincs szivárgás 2D↔3D váltás után (geometria ' + m0.g + '→' + m1.g + ', textúra ' + m0.t + '→' + m1.t + ')');
  // lassúság-őr: 1. lépcső csendes visszavétel, 2. lépcső egyszeri ajánlat a 2D-re; beállítás-kapcsoló
  const pe = await page.evaluate(() => { const r = []; L3.deg = 0; L3.slow = 0; delete S.settings.perf3dAsked; const sl = () => r.push(l3PerfEval(90, 130)); r.push(l3PerfEval(10, 14)); sl(); sl(); r.push(L3.deg); sl(); sl(); r.push(L3.deg); sl(); sl(); r.push(!!S.settings.perf3dAsked); sl(); return r; });
  ok(pe[0] === 'ok' && pe[1] === 'slow' && pe[2] === 'deg' && pe[3] === 1, 'őr: gyors gépen nem történik semmi, lassún csendben visszavesz (deg=1)');
  ok(pe[4] === 'slow' && pe[5] === 'deg' && pe[6] === 2, 'őr: második csendes fokozat (deg=2, vészfék)');
  ok(pe[8] === 'ask' && pe[9] === true && pe[10] !== 'ask', 'őr: egyszer rákérdez a 2D-re, többször nem');
  ok(!!(await page.$('.toast button')) || (await page.evaluate(() => /2D nézet/.test(document.body.textContent))), 'őr: a toast megjelenik');
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('.toast button')).find(x => /Átváltok/.test(x.textContent)); if (b) b.click(); });
  await page.waitForFunction('S.settings.view3d === false && !document.querySelector(".lb.l3")', null, { timeout: 30000 }).catch(() => { });
  ok(await page.evaluate(() => S.settings.view3d === false && !document.querySelector('.lb.l3')), 'őr: az „Átváltok” 2D nézetre vált');
  await page.evaluate(() => settingsModal()); await page.waitForSelector('.modal .set-row');
  const sw = await page.evaluate(() => { const row = Array.from(document.querySelectorAll('.modal .set-row')).find(r => /3D könyvtár/.test(r.textContent)); const i = row && row.querySelector('input'); return i ? { checked: i.checked, disabled: i.disabled } : null; });
  ok(sw && sw.checked === false && !sw.disabled, 'beállítások: „3D könyvtár” kapcsoló látszik, kikapcsolt állapotban');
  await page.evaluate(() => { const row = Array.from(document.querySelectorAll('.modal .set-row')).find(r => /3D könyvtár/.test(r.textContent)); const i = row.querySelector('input'); i.click(); });
  await page.waitForFunction('L3.on && L3.items.size > 0 && S.settings.view3d !== false', null, { timeout: 60000 });
  ok(await page.evaluate(() => !S.settings.perf3dAsked && !L3.deg), 'beállítások: a kapcsoló visszaadja a 3D-t és nullázza az őrt');
  ok(errs.length === 0, 'nincs konzolhiba/figyelmeztetés' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exit(fails ? 1 : 0);
})();
