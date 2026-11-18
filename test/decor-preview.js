// node test/decor-preview.js <out-prefix> [states…]  — a díszek közeli képe (nyugalmi + állapotok)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/dc'; const states = process.argv.slice(3);
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc'); await page.waitForTimeout(900);
  const first = await page.$('.lb-case'); 
  const shot = async (name, st) => {
    if (st) await page.evaluate(([s]) => { document.querySelectorAll('.lb-deco').forEach(e => { e.classList.remove('is-boop', 'is-rage', 'is-pet', 'is-blink', 'is-glance', 'is-flick', 'is-slam', 'is-wag'); }); const [cls, who] = s.split('@'); const el = document.querySelector('.lb-deco.dc-' + who); if (el) { el.style.setProperty('--t', '0'); el.classList.add(cls); el.querySelectorAll('*').forEach(n => { n.getAnimations && n.getAnimations().forEach(a => { a.pause(); }); }); } }, [st]);
    await page.waitForTimeout(60);
    await first.screenshot({ path: out + '-' + name + '.png' });
  };
  await shot('rest');
  for (const st of states) {
    // animációk pillanatképe: elindítjuk, adott ms-nál megállítjuk
    const [cls, who, ms] = st.split('@');
    await page.evaluate(([cls, who]) => { document.querySelectorAll('.lb-deco').forEach(e => e.classList.remove('is-boop', 'is-rage', 'is-pet', 'is-blink', 'is-glance', 'is-flick', 'is-slam', 'is-wag')); const el = document.querySelector('.lb-deco.dc-' + who); void el.offsetWidth; el.classList.add(cls); }, [cls, who]);
    await page.waitForTimeout(+ms || 400);
    await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    await first.screenshot({ path: out + '-' + cls + '-' + who + '-' + (ms || 400) + '.png' });
    await page.evaluate(() => document.getAnimations().forEach(a => a.finish && a.cancel()));
  }
  console.log(errs.length ? 'HIBA: ' + errs.join(' | ') : 'nincs konzolhiba'); await b.close();
})();
