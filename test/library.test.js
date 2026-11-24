// node test/library.test.js <out-prefix>  — Könyvtár: megjelenés, hover-billenés, húzás, billentyű, szerkesztés fül, mobil
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/lib';
  const b = await chromium.launch();
  const mk = async (w, hgt, scheme) => {
    const ctx = await b.newContext({ viewport: { width: w, height: hgt }, colorScheme: scheme || 'light', hasTouch: w < 600 });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.addInitScript(() => { try { if (!localStorage.getItem('kockazzunk.v1')) localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } catch (e) { } });
    return { page, errs, ctx };
  };
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const url = 'file://' + path.resolve('dist/index.html') + '#polc';

  /* --- asztali --- */
  let { page, errs } = await mk(1280, 1000, 'light');
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(900);
  ok(await page.$('.lb') != null, 'Könyvtár nézet rajzolódik');
  const nShelves = await page.$$eval('.lb-case', e => e.length), nSp = await page.$$eval('.lb-sp:not(.lb-deco)', e => e.length), nBooks = await page.evaluate(() => S.books.length);
  ok(nSp === nBooks, 'minden könyvnek van gerince: ' + nSp + '/' + nBooks + ', polcok: ' + nShelves);
  ok(nShelves >= 2, 'példakönyvekből több polc készül (műfaj szerint)');
  await page.screenshot({ path: out + '-1-light.png', fullPage: true });
  // hover billenés
  const sp = await page.$('.lb-sp:not(.lb-deco)'); const bb = await sp.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height * .5); await page.waitForTimeout(450);
  const tf = await page.$eval('.lb-sp:hover .lb-bk', e => getComputedStyle(e).transform);
  ok(tf && tf !== 'none', 'hover: a gerinc megbillen (' + tf + ')');
  await page.screenshot({ path: out + '-2-hover.png', clip: { x: Math.max(0, bb.x - 150), y: Math.max(0, bb.y - 60), width: 400, height: 300 } });
  // popup + megjelenés
  await sp.click(); await page.waitForTimeout(400);
  ok(await page.$('.lb-modal') != null, 'kattintás: részletek-ablak');
  ok(await page.$('.lb-modal .lb-bigspine') != null, 'nagy gerinc-előnézet (canvas) az ablakban');
  const idP = await sp.getAttribute('data-id');
  const before = await page.evaluate(id => S.books.find(x => x.id === id).color || spineLook(S.books.find(x => x.id === id)).color, idP);
  const pix0 = await page.$eval('.lb-modal .lb-bigspine', c => c.toDataURL().length + ':' + c.toDataURL().slice(-80));
  await page.click('.lb-modal .lb-sw:nth-child(3)'); await page.waitForTimeout(150);
  const after = await page.evaluate(id => S.books.find(x => x.id === id).color, idP);
  const pix1 = await page.$eval('.lb-modal .lb-bigspine', c => c.toDataURL().length + ':' + c.toDataURL().slice(-80));
  ok(after && String(before).toLowerCase() !== String(after).toLowerCase() && pix0 !== pix1, 'szín váltás az ablakban: ' + before + ' → ' + after + ' (az előnézet újrarajzolódik)');
  await page.click('.lb-modal .lb-th[title="Damaszt"]'); await page.waitForTimeout(100);
  ok(await page.evaluate(id => S.books.find(x => x.id === id).pat === 1, idP), 'minta választás: Damaszt (pat=1)');
  ok(await page.$$eval('.lb-modal .lb-th canvas', cs => cs.length >= 17), 'a miniatűrök a könyv saját színeivel rajzolódnak');
  await page.click('.lb-modal .lb-th[title="Díszes"]'); await page.click('.lb-modal .chip:has-text("Vastag")'); await page.click('.lb-modal .chip:has-text("Magas")');
  const id0 = await sp.getAttribute('data-id');
  const st = await page.evaluate(id => { const b = S.books.find(x => x.id === id); return [b.color, b.style, b.th, b.h]; }, id0);
  ok(st[0] && st[1] === 2 && st[2] === 3 && st[3] === 1, 'megjelenés mentve: ' + JSON.stringify(st));
  await page.screenshot({ path: out + '-3-popup.png' });
  await page.click('.lb-modal .btn.primary'); await page.waitForTimeout(400);
  ok(!(await page.$('.lb-modal')), 'ablak bezárul');
  // átrendezés + húzás
  await page.click('button:has-text("Átrendezés")'); await page.waitForTimeout(200);
  ok(await page.$('.lb.edit') != null, 'szerkesztő mód');
  const orderBefore = await page.evaluate(() => S.shelves.map(s => s.ids.slice()));
  const src = await page.$('.lb-case:nth-of-type(1) .lb-sp:not(.lb-deco)'); const sb = await src.boundingBox();
  const srcId = await src.getAttribute('data-id');
  const targetRow = await page.$$('.lb-row'); const trb = await targetRow[1].boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.mouse.down();
  await page.mouse.move(sb.x + 40, sb.y + 20, { steps: 4 });
  await page.mouse.move(trb.x + 60, trb.y + trb.height / 2, { steps: 12 });
  await page.waitForTimeout(150);
  ok(await page.$('.lb-gap') != null && await page.$('.lb-ghost') != null, 'húzás közben: szellem + jelölő rés');
  await page.screenshot({ path: out + '-4-drag.png' });
  await page.mouse.up(); await page.waitForTimeout(300);
  const orderAfter = await page.evaluate(() => S.shelves.map(s => s.ids.slice()));
  ok(orderAfter[1].indexOf(srcId) >= 0 && orderBefore[0].indexOf(srcId) >= 0 && orderAfter[0].indexOf(srcId) < 0, 'a könyv átkerült a második polcra');
  ok(orderAfter.reduce((n, a) => n + a.length, 0) === nBooks + await page.evaluate(() => S.decor.length), 'nincs elveszett/duplázott könyv');
  const stored = await page.evaluate(() => { persistNow(); return JSON.parse(localStorage.getItem('kockazzunk.v1')).shelves.map(s => s.ids.length).join(','); });
  ok(stored === orderAfter.map(a => a.length).join(','), 'a polcok tárolódnak: ' + stored);
  // billentyű: Shift+jobbra
  const f = await page.$('.lb-sp[data-id="' + srcId + '"]'); await f.focus();
  const i0 = (await page.evaluate(() => S.shelves.map(s => s.ids)))[1].indexOf(srcId);
  await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(200);
  const i1 = (await page.evaluate(() => S.shelves.map(s => s.ids)))[1].indexOf(srcId);
  ok(i1 === i0 + 1, 'Shift+nyíl: egy hellyel arrébb (' + i0 + '→' + i1 + ')');
  ok(await page.evaluate(id => document.activeElement && document.activeElement.dataset.id === id, srcId), 'fókusz a mozgatott könyvön marad');
  // Esc megszakítja a húzást
  const o2 = JSON.stringify(await page.evaluate(() => S.shelves.map(s => s.ids)));
  const s2 = await (await page.$('.lb-row .lb-sp:not(.lb-deco)')).boundingBox();
  await page.mouse.move(s2.x + 5, s2.y + 20); await page.mouse.down(); await page.mouse.move(s2.x + 100, s2.y + 60, { steps: 5 }); await page.keyboard.press('Escape'); await page.mouse.up(); await page.waitForTimeout(250);
  ok(o2 === JSON.stringify(await page.evaluate(() => S.shelves.map(s => s.ids))), 'Esc: a húzás megszakad, semmi sem változik');
  // polc átnevezés + új polc + törlés undo
  await page.fill('.lb-name >> nth=0', 'Kedvenceim'); await page.press('.lb-name >> nth=0', 'Tab'); await page.waitForTimeout(100);
  ok((await page.evaluate(() => S.shelves[0].name)) === 'Kedvenceim', 'polc átnevezve');
  await page.click('button:has-text("Új polc")'); await page.waitForTimeout(200);
  const n2 = await page.$$eval('.lb-case', e => e.length); ok(n2 === nShelves + 1, 'új polc: ' + n2);
  await page.screenshot({ path: out + '-5-edit.png', fullPage: true });
  await page.click('.lb-case:last-of-type .ibtn.danger'); await page.waitForTimeout(200);
  ok((await page.$$eval('.lb-case', e => e.length)) === nShelves, 'üres polc törölve');
  // rendezés modal
  await page.click('button:has-text("Átrendezés"), button:has-text("Kész az átrendezés")'); await page.waitForTimeout(150);
  await page.click('button:has-text("Rendezés…")'); await page.waitForTimeout(250);
  await page.click('.modal label:has-text("Szín szerint")'); await page.click('.modal .btn.primary'); await page.waitForTimeout(400);
  ok(await page.$('.lb') != null, 'rendezés szín szerint lefutott');
  await page.screenshot({ path: out + '-6-color.png', fullPage: true });
  await page.click('.toast button, .toast .btn'); await page.waitForTimeout(300);   // visszavonás
  // műfaj szerint → polcok
  await page.click('button:has-text("Rendezés…")'); await page.waitForTimeout(250);
  await page.click('.modal label:has-text("Műfaj szerint")'); await page.click('.modal .btn.primary'); await page.waitForTimeout(400);
  const names = await page.evaluate(() => S.shelves.map(s => s.name + ':' + s.ids.length).join(' | ')); console.log('műfaj-polcok:', names);
  ok((await page.evaluate(() => S.shelves.reduce((n, s) => n + s.ids.filter(i => !isDecorId(i)).length, 0))) === nBooks, 'műfaj szerint: minden könyv megvan');
  // keresés
  await page.fill('#lb-q', 'dűne'); await page.waitForTimeout(200);
  const dim = await page.$$eval('.lb-sp.dim', e => e.length); ok(dim >= nBooks - 3 && dim < nBooks, 'keresés elhalványítja a többit: ' + dim + '/' + nBooks);
  await page.fill('#lb-q', '');
  // kiválasztott könyv kiemelés a dobásból
  await page.evaluate(() => { S.ui.themeId = 'konyv'; }); await page.click('.nav a:has-text("Dobás")'); await page.waitForTimeout(2800);
  await page.click('.nav a:has-text("Könyvtár")'); await page.waitForTimeout(500);
  ok((await page.$$('.lb-sp.picked')).length >= 1, 'a dobott könyv ki van emelve a polcon');
  await page.screenshot({ path: out + '-7-picked.png' });
  // Szerkesztés fül
  await page.click('[role=tab]:has-text("Szerkesztés")'); await page.waitForTimeout(300);
  ok(await page.$('.book-list .book') != null, 'Szerkesztés fül: lista');
  await page.click('[role=tab]:has-text("Könyvtár")'); await page.waitForTimeout(300);
  // törlés + visszavonás a polcon
  const delId = await page.locator('.lb-sp:not(.lb-deco)').first().getAttribute('data-id'); await page.click('.lb-sp:not(.lb-deco) >> nth=0'); await page.waitForTimeout(300);
  const shBefore = await page.evaluate(id => S.shelves.findIndex(s => s.ids.indexOf(id) >= 0) + ':' + S.shelves.find(s => s.ids.indexOf(id) >= 0).ids.indexOf(id), delId);
  await page.click('.lb-modal .btn.danger'); await page.waitForTimeout(400);
  ok(!(await page.$('.lb-sp[data-id="' + delId + '"]')), 'könyv törölve a polcról');
  await page.click('.toast:last-child button'); await page.waitForTimeout(300);
  const shAfter = await page.evaluate(id => { const s = S.shelves.find(s => s.ids.indexOf(id) >= 0); return s ? S.shelves.indexOf(s) + ':' + s.ids.indexOf(id) : 'nincs'; }, delId);
  ok(shAfter === shBefore, 'visszavonás ugyanarra a helyre teszi: ' + shBefore + ' = ' + shAfter);
  ok(errs.length === 0, 'nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  /* --- sötét + mobil --- */
  for (const [w, hh, sch] of [[390, 800, 'dark'], [360, 740, 'light']]) {
    ({ page, errs } = await mk(w, hh, sch));
    await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(900);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth), cw = await page.evaluate(() => document.documentElement.clientWidth);
    ok(sw <= cw, w + 'px: nincs vízszintes görgetés (' + sw + '/' + cw + ')');
    await page.screenshot({ path: out + '-m' + w + '.png', fullPage: true });
    await page.click('button:has-text("Átrendezés")'); await page.waitForTimeout(200);
    const sw2 = await page.evaluate(() => document.documentElement.scrollWidth); ok(sw2 <= cw, w + 'px szerkesztő módban sincs túlcsordulás');
    await page.click('button:has-text("Kész az átrendezés")'); await page.click('.lb-sp:not(.lb-deco) >> nth=2'); await page.waitForTimeout(400);
    const mw = await page.evaluate(() => { const m = document.querySelector('.modal'); const r = m.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), document.documentElement.scrollWidth, document.documentElement.clientWidth]; });
    ok(mw[0] >= 0 && mw[1] <= mw[3] && mw[2] <= mw[3], w + 'px: részletek-ablak befér ' + mw.join('/'));
    await page.screenshot({ path: out + '-m' + w + '-popup.png' });
    ok(errs.length === 0, w + 'px: nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await page.context().close();
  }
  await b.close();
  console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exitCode = fails ? 1 : 0;
})();
