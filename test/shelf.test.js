// node test/shelf.test.js <out-prefix>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/sh';
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: 'dark' })).newPage(); const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.resolve('dist/index.html') + '#polc', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: out + '-1.png' });
  // parser tesztek (tiszta függvények a lapon)
  const res = await page.evaluate(() => {
    const gr = 'Book Id,Title,Author,Additional Authors,ISBN,My Rating,Number of Pages,Bookshelves,Exclusive Shelf,My Review\n1,"Dűne (Dune Chronicles #1)",Frank Herbert,,,5,688,"science-fiction, favorites",read,"Nagyon jó, ""tényleg"""\n2,A hobbit,J.R.R. Tolkien,,,0,310,fantasy,to-read,\n3,Gone Girl,Gillian Flynn,,,0,422,"mystery, thriller",currently-reading,';
    const hu = 'cím;szerző;műfaj;hangulat;oldal;státusz\nAbigél;Szabó Magda;Ifjúsági;izgalmas;380;elolvastam\nÉdes Anna;Kosztolányi Dezső;Regény;sötét;250;olvasatlan';
    const js = '[{"title":"Emma","author":"Jane Austen","genre":["romance","classics"],"pages":474},"Sapiens – Yuval Noah Harari"]';
    const ln = 'Egri csillagok – Gárdonyi Géza\nA Pál utcai fiúk; Molnár Ferenc; Ifjúsági; megható; 240\nCsak egy cím';
    const f = x => { const r = parseBooksText(x); return r.format + ' | ' + r.books.map(b => [b.title, b.author, b.genre, b.pages, b.status].join('/')).join(' ; '); };
    return [f(gr), f(hu), f(js), f(ln), JSON.stringify(parseBooksText('KZ1:abc').warnings)];
  });
  res.forEach(r => console.log(r));
  // importálás UI
  await page.click('button:has-text("Importálás")'); await page.waitForTimeout(300);
  await page.fill('#imp-text', 'Dűne; Frank Herbert; Sci-fi; elgondolkodtató; 700\nÚj könyv – Új Szerző\nEmma; Jane Austen; Romantikus; megnyugtató; 474');
  await page.waitForTimeout(500);
  await page.screenshot({ path: out + '-2.png' });
  await page.click('.modal-foot .btn.primary'); await page.waitForTimeout(500);
  console.log('könyvek:', await page.evaluate(() => S.books.length), '| példa törlés...');
  await page.click('button:has-text("Példák törlése")'); await page.waitForTimeout(400);
  console.log('könyvek példák nélkül:', await page.evaluate(() => S.books.length));
  await page.screenshot({ path: out + '-3.png' });
  // dobás a Könyv témával az új polccal
  await page.evaluate(() => { S.ui.themeId = 'konyv'; }); await page.click('.nav a:has-text("Dobás")'); await page.waitForTimeout(2600);
  console.log('könyv-sor:', await page.$$eval('.rrow', rs => rs.map(r => r.querySelector('.rtext').textContent + (r.querySelector('.rmeta') ? ' [' + r.querySelector('.rmeta').textContent + ']' : '')).slice(0, 4).join(' | ')));
  console.log(errs.length ? errs.join('\n') : 'nincs hiba');
  await b.close();
})();
