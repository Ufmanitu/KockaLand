// node test/interact.js <out-prefix>  — kattintásos folyamat + konzolhibák
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/ix';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.resolve(__dirname, '../dist/index.html'), { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(2500);
  const txt = () => page.$$eval('.rrow', rs => rs.map(r => r.querySelector('.rlabel').textContent + '=' + r.querySelector('.rtext').textContent));
  const before = await txt();
  await page.click('.roll-btn');
  await page.waitForTimeout(550);
  await page.screenshot({ path: out + '-mid.png' });
  await page.waitForTimeout(2600);
  const after = await txt();
  console.log('változott:', JSON.stringify(before) !== JSON.stringify(after));
  await page.screenshot({ path: out + '-after.png' });

  // zár: az 1. kocka zárolása, dobás, az 1. nem változhat
  await page.click('.slot:nth-child(1) .lockbtn');
  const locked = (await txt())[0];
  await page.click('.roll-btn'); await page.waitForTimeout(2800);
  const t2 = await txt();
  console.log('zárolt megmaradt:', t2[0] === locked, '|', t2[0]);

  // egy kocka: 2. kocka kattintás
  const prev2 = t2[1];
  await page.click('.slot:nth-child(2) .stage'); await page.waitForTimeout(2200);
  const t3 = await txt();
  console.log('2. kocka újradobva:', t3[1] !== prev2, '| többi azonos:', t3.filter((x, i) => i !== 1).every((x, i) => x === t2.filter((y, j) => j !== 1)[i]));

  // szürreális
  await page.click('label.switch:has(#sw-surreal)');
  await page.waitForTimeout(300);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(1900); }
  console.log('szürreális jelzők:', await page.$$eval('.rrow .flag.s', e => e.length));
  await page.screenshot({ path: out + '-surreal.png' });

  // téma váltás, könyv téma
  await page.click('.theme-chip:has-text("Könyv")');
  await page.waitForTimeout(2600);
  console.log('könyv:', JSON.stringify(await txt()));
  await page.screenshot({ path: out + '-book.png' });
  await page.click('.theme-chip:has-text("Utazás")'); await page.waitForTimeout(2600);
  console.log('utazás:', JSON.stringify(await txt()));
  // kézi választás
  await page.click('.rrow:nth-child(2) .ibtn[title^="Kiválasztom"]', { force: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: out + '-pick.png' });
  await page.keyboard.press('Escape');
  console.log(errs.length ? errs.join('\n') : 'nincs hiba');
  await browser.close();
})();
