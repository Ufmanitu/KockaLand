// node test/editor.test.js <out-prefix>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/ed';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: 'dark' });
  const page = await ctx.newPage(); const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.resolve('dist/index.html') + '#szerkeszto', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out + '-1.png' });
  // kocka megnyitása
  await page.click('.die-card:nth-child(3) .ibtn.tog'); await page.waitForTimeout(300);
  // opció szerkesztése + haladó panel
  await page.fill('.die-card.open .orow:nth-child(2) .orow-main input', 'Átírt opció');
  await page.click('.die-card.open .orow:nth-child(2) .tagbtn'); await page.waitForTimeout(300);
  await page.screenshot({ path: out + '-2.png' });
  const written = await page.evaluate(() => { persistNow(); const t = themeById(E.tid); return t.dice[2].options[1].t; });
  console.log('átírt opció:', written);
  // hozzáadás
  await page.fill('.die-card.open .addrow input', 'Új ötlet #valami !masik ?kell|vagy +szivesen ~'); await page.keyboard.press('Enter');
  const added = await page.evaluate(() => { const o = themeById(E.tid).dice[2].options.slice(-1)[0]; return JSON.stringify([o.t, o.g, o.x, o.n, o.w, o.s]); });
  console.log('hozzáadva:', added);
  // új téma gyors szöveggel
  await page.click('.side-new'); await page.waitForTimeout(300);
  await page.click('.nt-tabs .chip[data-k=gyors]');
  await page.fill('#nt-name', 'Teszt téma');
  await page.fill('.nt-pane textarea', 'Mikor: reggel; este\nHol: otthon; kint; a parkban #kint');
  await page.screenshot({ path: out + '-3.png' });
  await page.click('.modal-foot .btn.primary'); await page.waitForTimeout(400);
  console.log('témák száma:', await page.evaluate(() => S.themes.length), '| aktív:', await page.evaluate(() => themeById(E.tid).name));
  // kód export-import körút
  const code = await page.evaluate(() => makeCode({ v: 1, themes: [themeToCompact(themeById(E.tid))] }));
  const back = await page.evaluate(c => { const r = readCode(c); return themeFromCompact(r.themes[0]).dice.map(d => d.name + ':' + d.options.length).join(','); }, code);
  console.log('kód körút:', back);
  // dobás az új témával
  await page.click('.tc-actions .btn.primary'); await page.waitForTimeout(2600);
  console.log('dobás új témával:', JSON.stringify(await page.$$eval('.rrow', rs => rs.map(r => r.querySelector('.rtext').textContent))));
  await page.screenshot({ path: out + '-4.png' });
  console.log(errs.length ? errs.join('\n') : 'nincs hiba');
  await b.close();
})();
