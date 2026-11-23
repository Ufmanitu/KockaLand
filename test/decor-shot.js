// node test/decor-shot.js <out-prefix> <halmaz1,halmaz2…> [állapot@típus@ms …]
// Tiszta polcra (csak a megadott díszek) rak, és közeli képet (DSF 3) készít a díszekről: nyugalmi + a megadott állapotok.
// A díszek a 0. polc elején sorakoznak; a "típus" a DECOR id (pl. szellem), az állapot a CSS osztály (pl. is-startle). off@típus = Kikapcsolt (is-off).
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/ds', sets = (process.argv[3] || 'sarkany').split(','), states = process.argv.slice(4);
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 3, colorScheme: process.env.DARK ? 'dark' : 'light' });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.addInitScript(() => { window.__MAX_DECOR = 99; try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForTimeout(900);
  await page.evaluate(sets => {
    S.decor = []; S.shelves.forEach(s => { s.ids = s.ids.filter(i => !isDecorId(i)); });
    const names = sets; names.forEach((n, i) => { const set = DECOR_SETS.find(x => x.id === n); if (!set) throw new Error('nincs ilyen halmaz: ' + n); addDecorSet(set, 0); });
    persist(); drawLibrary();
  }, sets);
  await page.evaluate(() => { clearTimeout(DecorLife.t); });   // ne induljon véletlen idle-animáció a képek alatt
  await page.waitForTimeout(300);
  const clipOf = async () => page.evaluate(() => {
    const els = [...document.querySelectorAll('.lb-deco')]; const r = els.map(e => e.getBoundingClientRect());
    const x0 = Math.min(...r.map(q => q.left)) - 36, x1 = Math.max(...r.map(q => q.right)) + 36, y0 = Math.min(...r.map(q => q.top)) - 40, y1 = Math.max(...r.map(q => q.bottom)) + 30;
    return { x: Math.max(0, x0), y: Math.max(0, y0 + window.scrollY) - window.scrollY, width: Math.min(1200, x1) - Math.max(0, x0), height: y1 - y0 };
  });
  const clear = () => page.evaluate(() => { document.querySelectorAll('.lb-deco').forEach(e => { [...e.classList].filter(c => /^is-/.test(c) && c !== 'is-off').forEach(c => e.classList.remove(c)); }); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: out + '-rest.png', clip: await clipOf() });
  for (const st of states) {
    const [cls, who, ms] = st.split('@');
    await clear();
    await page.evaluate(([cls, who]) => {
      const el = document.querySelector('.lb-deco.dc-' + who); if (!el) throw new Error('nincs ' + who);
      if (cls === 'off') el.classList.add('is-off'); else if (cls === 'on') el.classList.remove('is-off'); else { void el.offsetWidth; el.classList.add(cls); }
    }, [cls, who]);
    await page.waitForTimeout(+ms || 400);
    await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    await page.screenshot({ path: out + '-' + cls + '-' + who + '-' + (ms || 400) + '.png', clip: await clipOf() });
    await page.evaluate(() => document.getAnimations().forEach(a => a.cancel()));
    if (cls === 'off') await page.evaluate(w => document.querySelector('.lb-deco.dc-' + w).classList.remove('is-off'), who);
  }
  console.log(errs.length ? 'HIBA: ' + errs.join(' | ') : 'nincs konzolhiba'); await b.close();
})();
