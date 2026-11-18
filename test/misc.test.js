// node test/misc.test.js <out-prefix>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/ms';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 950 }, colorScheme: 'dark' });
  const page = await ctx.newPage(); const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.resolve('dist/index.html'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2800);   // friss állapot: a túra felugrik
  console.log('túra nyitva:', await page.$$eval('.modal.tour', e => e.length));
  await page.screenshot({ path: out + '-tour.png' });
  for (let i = 0; i < 5; i++) { await page.click('.tour-nav .btn.primary'); await page.waitForTimeout(250); }
  await page.click('.tour-nav .btn.primary'); await page.waitForTimeout(400);
  console.log('túra bezárva, seen:', await page.evaluate(() => S.settings.seen), await page.$$eval('.modal', e => e.length));
  // dobások → napló
  for (let i = 0; i < 2; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(2200); }
  await page.click('.rollbar .btn:has-text("Kedvenc")'); await page.waitForTimeout(300);
  await page.click('.nav a:has-text("Napló")'); await page.waitForTimeout(500);
  console.log('napló kártyák:', await page.$$eval('.log-card', e => e.length), '| kedvenc lap');
  await page.screenshot({ path: out + '-log.png' });
  await page.click('.log-card .btn:has-text("Visszatöltés")'); await page.waitForTimeout(1500);
  console.log('visszatöltve dobás nézet:', await page.evaluate(() => S.ui.view), await page.$$eval('.rrow', e => e.length));
  // súgó
  await page.click('.nav a:has-text("Súgó")'); await page.waitForTimeout(400);
  await page.click('.help-sec:nth-child(4) summary'); await page.waitForTimeout(300);
  await page.screenshot({ path: out + '-help.png' });
  // beállítások + mentés kód körút
  await page.click('#top .ibtn[title="Beállítások"]'); await page.waitForTimeout(400);
  await page.screenshot({ path: out + '-settings.png' });
  const rt = await page.evaluate(() => { const code = makeCode(backupObject()); const n0 = S.themes.length, b0 = S.books.length; S.themes.pop(); S.books.length = 0; restoreBackup(readCode(code)); return [code.length, n0, S.themes.length, b0, S.books.length, S.themes[0].dice[0].id.length > 0].join(','); });
  console.log('mentés körút (hossz,témák előtte/utána,könyvek előtte/utána):', rt);
  // világos mód
  await page.evaluate(() => { S.settings.appearance = 'light'; applyAppearance(); });
  await page.keyboard.press('Escape'); await page.click('.nav a:has-text("Dobás")'); await page.waitForTimeout(2200);
  await page.screenshot({ path: out + '-light.png' });
  console.log(errs.length ? errs.join('\n') : 'nincs hiba');
  await b.close();
})();
