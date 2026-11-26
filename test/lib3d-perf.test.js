// node test/lib3d-perf.test.js — a 3D teljesítmény-védelmek: alap felbontás ≤1,25×, lágy, olcsó árnyék (VSM), az árnyék-térkép csak változáskor rajzolódik újra
// (görgetéskor nem, hoverkor igen), kevés draw call állandósult állapotban, a minőségi fokozatok váltanak és vissza is állnak
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 2 }); const page = await ctx.newPage(); page.setDefaultTimeout(120000); const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.route(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/build\/three\.min\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'vendor/three.min.js')) }));
  await page.addInitScript(() => { try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForFunction('typeof L3 !== "undefined" && L3.on && L3.items.size > 0', null, { timeout: 60000 });
  await page.evaluate(() => { clearTimeout(L3.idleT); });   // a véletlen idle-animáció ne zavarja a méréseket
  await page.waitForFunction('L3.anims.length === 0 && !L3.raf', null, { timeout: 30000 }); await page.waitForTimeout(500);

  const q = await page.evaluate(() => ({ pr: L3.r.getPixelRatio(), dpr: devicePixelRatio, type: L3.r.shadowMap.type, auto: L3.r.shadowMap.autoUpdate, map: L3.key.shadow.mapSize.x }));
  ok(q.dpr === 2 && q.pr <= 1.25, 'alap felbontás: retina (2×) kijelzőn is legfeljebb 1,25× (' + q.pr + ')');
  ok(q.type === 3 && q.auto === false, 'árnyék: lágy VSM (képkockánként 1 mintavétel), nem automatikus frissítés');

  // árnyék-térkép rajzolásainak számlálása
  await page.evaluate(() => { window.__sh = 0; const sm = L3.r.shadowMap, f = sm.render.bind(sm); sm.render = function () { const need = sm.needsUpdate; f.apply(null, arguments); if (need) window.__sh++; }; });
  const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))));
  await frames(); await page.evaluate(() => { window.__sh = 0; });
  // 1) görgetés: sok képkocka, de az árnyék csak a rácsra ugráskor frissül
  const sc = await page.evaluate(async () => { const out = { fr: 0 }; const raf = () => new Promise(r => requestAnimationFrame(r)); for (let i = 0; i < 24; i++) { window.scrollBy(0, 5); await raf(); out.fr++; } out.sh = window.__sh; out.moved = 24 * 5; return out; });
  ok(sc.sh <= Math.ceil(sc.moved / 96) + 1, 'görgetés közben az árnyék nem rajzolódik minden képkockán újra (' + sc.sh + ' frissítés ' + sc.fr + ' képkockán, ' + sc.moved + ' px)');
  // 2) hover: a kihúzódó könyv árnyéka frissül
  await page.evaluate(() => { window.scrollTo(0, 0); }); await page.waitForTimeout(600); await page.evaluate(() => { window.__sh = 0; });
  const pos = await page.evaluate(() => { const it = Array.from(L3.items.values()).find(i => i.kind === 'book' && i.shelf === 0); const v = new THREE.Vector3(); it.grp.updateWorldMatrix(true, false); it.grp.getWorldPosition(v); v.y += it.h * 0.5; v.project(L3.cam); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; });
  await page.mouse.move(pos.x, pos.y); await page.mouse.move(pos.x + 2, pos.y + 1); await page.waitForTimeout(900);
  const hv = await page.evaluate(() => ({ sh: window.__sh, hov: !!L3.hov }));
  ok(hv.hov && hv.sh >= 1, 'hover: a könyv kihúzódik és az árnyék frissül (' + hv.sh + ' frissítés)');
  // 3) állandósult állapot: kevés draw call, nincs folyamatos rajzolás
  await page.mouse.move(2, 2); await page.waitForFunction('L3.anims.length === 0 && !L3.raf', null, { timeout: 60000 }); await page.waitForTimeout(600);   // a parallax-lecsengés (lassú szoftveres GL-en másodpercek) után
  const st = await page.evaluate(async () => { const r = L3.r; r.info.autoReset = false; r.info.reset(); l3Render(); const calls = r.info.render.calls; r.info.autoReset = true; const f0 = r.info.render.frame; await new Promise(res => setTimeout(res, 900)); return { calls: calls, idleFrames: r.info.render.frame - f0 }; });
  ok(st.calls < 260, 'egy képkocka (árnyék nélkül) ' + st.calls + ' draw call');
  ok(st.idleFrames <= 2, 'nyugalmi állapotban nincs folyamatos rajzolás (' + st.idleFrames + ' képkocka 0,9 s alatt)');
  // 4) minőségi fokozatok
  const lv = await page.evaluate(() => { const r = [], pr = () => L3.r.getPixelRatio(); L3.deg = 0; l3Quality(); r.push(pr()); L3.deg = 1; l3Quality(); r.push(pr(), L3.key.shadow.mapSize.x); L3.deg = 2; l3Quality(); r.push(pr(), L3.key.shadow.mapSize.x); L3.deg = 0; l3Quality(); r.push(pr()); return r; });
  ok(lv[0] <= 1.25 && lv[1] === 1 && lv[2] === 1024 && lv[3] === 0.75 && lv[4] === 512 && lv[5] <= 1.25, 'minőségi fokozatok: 0 → ≤1,25× · 1 → 1×/1024 · 2 → 0,75×/512, visszaállítható (' + lv.join(', ') + ')');
  // telefon/tábla (érintőkijelző / mobil-GPU): a kijelző szerinti éles felbontás (keskeny nézetben legfeljebb 2×, széles nézetben 1,5×); a lassúság-őr visszaveszi
  const mv = await page.evaluate(() => {
    const r = [], iw = Object.getOwnPropertyDescriptor(window, 'innerWidth'), at = w => { Object.defineProperty(window, 'innerWidth', { value: w, configurable: true }); };
    L3.mobile = true; at(400); [0, 1, 2].forEach(d => { L3.deg = d; r.push(l3PixelRatio()); }); at(900); L3.deg = 0; r.push(l3PixelRatio());
    L3.mobile = false; L3.deg = 0; if (iw) Object.defineProperty(window, 'innerWidth', iw); else delete window.innerWidth; l3Quality(); return r;
  });
  ok(mv[0] === 2 && mv[1] === 1.5 && mv[2] === 0.75 && mv[3] === 1.5, 'telefon: 0. fokozat 2× · 1. fokozat 1,5× · 2. fokozat 0,75× · széles táblán 1,5× (' + mv.join(', ') + ')');
  ok(errs.length === 0, 'nincs konzolhiba' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exit(fails ? 1 : 0);
})();
