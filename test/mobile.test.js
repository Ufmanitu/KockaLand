// node test/mobile.test.js <out-prefix> — telefon-szélesség: vízszintes túlcsordulás + képernyőképek
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/mb';
  const b = await chromium.launch();
  const errs = [];
  for (const w of [360, 400]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 }, colorScheme: w === 360 ? 'dark' : 'light', deviceScaleFactor: 1, hasTouch: true, isMobile: false });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.resolve('dist/index.html'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const over = async (label) => {
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth, bad = [];
        document.querySelectorAll('body *').forEach(e => {
          const rc = e.getBoundingClientRect(); if (!rc.width) return;
          if (rc.right > vw + 1 && !e.closest('.themebar,.ed-side,.tbl-wrap,.modal-back,#bg,#fx,.opts,.help-table')) bad.push(e.tagName + '.' + (e.className && e.className.baseVal === undefined ? e.className : '') + ' r=' + Math.round(rc.right));
        });
        return { sw: document.documentElement.scrollWidth, vw: vw, bad: bad.slice(0, 5) };
      });
      if (r.sw > r.vw + 1 || r.bad.length) console.log('  ✗ ' + w + 'px ' + label + ': scrollWidth ' + r.sw + ' > ' + r.vw + ' ' + JSON.stringify(r.bad));
      else console.log('  ✓ ' + w + 'px ' + label);
    };
    for (const id of ['randi', 'utazas', 'kaja', 'mozi', 'kezmuves', 'konyv', 'meghitt']) {
      await page.evaluate(i => { S.ui.themeId = i; location.hash = 'dobas'; show('dobas'); }, id);
      await page.waitForTimeout(1900); await over('dobás/' + id);
      if (id === 'utazas' || id === 'mozi') await page.screenshot({ path: out + '-' + w + '-' + id + '.png', fullPage: true });
    }
    await page.evaluate(() => { location.hash = 'szerkeszto'; E.tid = 'utazas'; show('szerkeszto'); }); await page.waitForTimeout(500);
    await page.click('.die-card:nth-child(2) .ibtn.tog'); await page.waitForTimeout(300);
    await page.click('.die-card.open .orow:nth-child(1) .tagbtn'); await page.waitForTimeout(300);
    await over('szerkesztő'); await page.screenshot({ path: out + '-' + w + '-editor.png' });
    await page.evaluate(() => { location.hash = 'polc'; }); await page.waitForTimeout(500); await over('polc'); await page.screenshot({ path: out + '-' + w + '-shelf.png' });
    await page.click('button:has-text("Új könyv")'); await page.waitForTimeout(400); await over('könyv űrlap'); await page.screenshot({ path: out + '-' + w + '-bookform.png' }); await page.keyboard.press('Escape');
    await page.evaluate(() => { location.hash = 'naplo'; }); await page.waitForTimeout(400); await over('napló');
    await page.evaluate(() => { location.hash = 'sugo'; }); await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelectorAll('.help-sec').forEach(d => d.open = true)); await page.waitForTimeout(200); await over('súgó (mind nyitva)'); await page.screenshot({ path: out + '-' + w + '-help.png' });
    await page.click('#top .ibtn[title="Beállítások"]'); await page.waitForTimeout(400); await over('beállítások'); await page.screenshot({ path: out + '-' + w + '-settings.png' });
    await ctx.close();
  }
  console.log(errs.length ? errs.join('\n') : 'nincs JS-hiba');
  await b.close();
})();
