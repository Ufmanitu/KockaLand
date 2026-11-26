// node test/decor2.test.js <out-prefix>  — Díszek 2: szellem, lámpás, üvegablak-panelek (kattintás-állapotok, kapcsoló, mentés, katalógus, mobil)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/dc2';
  const b = await chromium.launch();
  const mk = async (w, hgt) => {
    const ctx = await b.newContext({ viewport: { width: w, height: hgt }, hasTouch: w < 600 });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.addInitScript(() => { window.__MAX_DECOR = 99; window.__STARTER = true; try { if (window.name !== 'dc-seeded') { window.name = 'dc-seeded'; localStorage.setItem('kockazzunk.v1', JSON.stringify({ v: 1, themes: [], settings: { seen: true, view3d: false } })); } } catch (e) { } });
    return { page, errs, ctx };
  };
  let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'HIBA ') + m); if (!c) fails++; };
  const url = 'file://' + path.resolve('dist/index.html') + '#polc';
  const has = (page, sel, cls) => page.$eval(sel, (e, c) => e.classList.contains(c), cls);
  const at = async (page, sel, fx, fy) => { const el = await page.$(sel); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(60); const bb = await el.boundingBox(); return { x: bb.x + bb.width * fx, y: bb.y + bb.height * fy }; };
  const clickAt = async (page, sel, fx, fy) => { const c = await at(page, sel, fx, fy); await page.mouse.move(c.x, c.y); await page.mouse.click(c.x, c.y); };

  let { page, errs } = await mk(1280, 1000);
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
  const nSets = await page.evaluate(() => DECOR_SETS.length);
  ok(nSets >= 5, 'katalógus: ' + nSets + ' halmaz');
  await page.click('button:has-text("Díszek")'); await page.waitForTimeout(300);
  ok((await page.$$('.dc-modal .dc-card')).length === nSets, 'a Díszek ablak minden halmazt mutat');
  await page.screenshot({ path: out + '-modal.png' });
  await page.click('.dc-modal .btn.primary:has-text("Kész")'); await page.waitForTimeout(300);
  // minden új dísz a 0. polcra
  await page.evaluate(() => { ['szellem', 'lampas', 'uveg-rozsa', 'uveg-var', 'uveg-kard'].forEach(id => addDecorSet(DECOR_SETS.find(s => s.id === id), 0)); persist(); drawLibrary(); });
  await page.waitForTimeout(300);
  ok((await page.$$('.lb-deco')).length === 11, '11 dísz a polcon (6 kezdő + 5)');
  await page.screenshot({ path: out + '-shelf.png', fullPage: true });

  // szellem
  await clickAt(page, '.dc-szellem', .5, .3); await page.waitForTimeout(120);
  ok(await has(page, '.dc-szellem', 'is-startle'), 'szellem: bökés → is-startle');
  await clickAt(page, '.dc-szellem', .5, .3); await page.waitForTimeout(120);
  ok(await has(page, '.dc-szellem', 'is-hide') && !(await has(page, '.dc-szellem', 'is-startle')), 'szellem: 2. bökés → is-hide');
  await clickAt(page, '.dc-szellem', .5, .3); await page.waitForTimeout(120);
  ok(await has(page, '.dc-szellem', 'is-spook'), 'szellem: 3. bökés → is-spook');
  await page.waitForTimeout(2900);
  await clickAt(page, '.dc-szellem', .5, .88); await page.waitForTimeout(120);
  ok(await has(page, '.dc-szellem', 'is-turn'), 'szellem: könyvre kattintás → is-turn (lapoz)');
  await page.waitForTimeout(1700);
  ok(!(await has(page, '.dc-szellem', 'is-turn')), 'szellem: az állapot lekerül');
  await page.focus('.dc-szellem'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  ok(await has(page, '.dc-szellem', 'is-startle') || await has(page, '.dc-szellem', 'is-hide'), 'szellem: Enterrel is játszható');
  await page.waitForTimeout(3000);

  // lámpás: elfújás / meggyújtás, mentve
  await clickAt(page, '.dc-lampas', .5, .5); await page.waitForTimeout(150);
  ok(await has(page, '.dc-lampas', 'is-off') && await has(page, '.dc-lampas', 'is-blow'), 'lámpás: kattintás → elfújva (is-off + is-blow)');
  ok(await page.evaluate(() => S.decor.find(d => d.type === 'lampas').off === true), 'lámpás: az állapot S.decor-ban');
  await page.waitForTimeout(2100);
  await page.evaluate(() => persistNow());
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
  ok(await has(page, '.dc-lampas', 'is-off'), 'lámpás: újratöltés után is kialudva');
  await clickAt(page, '.dc-lampas', .5, .5); await page.waitForTimeout(150);
  ok(!(await has(page, '.dc-lampas', 'is-off')) && await has(page, '.dc-lampas', 'is-light'), 'lámpás: újra meggyújtva (is-light)');
  ok(await page.evaluate(() => !('off' in S.decor.find(d => d.type === 'lampas'))), 'lámpás: a bekapcsolt állapotnál nincs felesleges off mező');
  await page.waitForTimeout(1900);

  // üvegablak: kapcsoló + jelenet
  for (const [type, scene] of [['uveg-rozsa', 'is-glint'], ['uveg-var', 'is-wish'], ['uveg-kard', 'is-blaze']]) {
    const sel = '.dc-' + type;
    await clickAt(page, sel + ' .d-sw', .5, .5); await page.waitForTimeout(150);
    ok(await has(page, sel, 'is-off'), type + ': a kapcsoló lekapcsolja');
    await page.waitForTimeout(1000);
    const dim = await page.$eval(sel + ' .d-dim', e => +getComputedStyle(e).opacity);
    ok(dim > 0.5, type + ': lekapcsolt üveg elsötétül (dim ' + dim + ')');
    await clickAt(page, sel, .5, .4); await page.waitForTimeout(150);
    ok(!(await has(page, sel, 'is-off')) && !(await has(page, sel, scene)), type + ': sötét üvegre kattintva felkapcsol (még nincs jelenet)');
    await page.waitForTimeout(1000);
    await clickAt(page, sel, .5, .4); await page.waitForTimeout(150);
    ok(await has(page, sel, scene), type + ': világító üvegre kattintva ' + scene);
    await page.waitForTimeout(3300);
  }
  ok(errs.length === 0, 'nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  // mobil
  for (const [w, hh] of [[390, 800], [360, 740]]) {
    ({ page, errs } = await mk(w, hh));
    await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
    await page.evaluate(() => { ['szellem', 'lampas', 'uveg-rozsa', 'uveg-var', 'uveg-kard'].forEach(id => addDecorSet(DECOR_SETS.find(s => s.id === id), 0)); persist(); drawLibrary(); });
    await page.waitForTimeout(400);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth), cw = await page.evaluate(() => document.documentElement.clientWidth);
    ok(sw <= cw, w + 'px: sok dísszel sincs vízszintes görgetés (' + sw + '/' + cw + ')');
    await page.screenshot({ path: out + '-m' + w + '.png', fullPage: true });
    await page.tap('.dc-lampas').catch(() => { }); await page.waitForTimeout(150);
    ok(await has(page, '.dc-lampas', 'is-off'), w + 'px: érintésre a lámpás elalszik');
    await page.click('button:has-text("Díszek")'); await page.waitForTimeout(400);
    const mw = await page.evaluate(() => { const m = document.querySelector('.modal'); const r = m.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), document.documentElement.scrollWidth, document.documentElement.clientWidth]; });
    ok(mw[0] >= 0 && mw[1] <= mw[3] && mw[2] <= mw[3], w + 'px: Díszek ablak befér ' + mw.join('/'));
    await page.screenshot({ path: out + '-m' + w + '-modal.png' });
    ok(errs.length === 0, w + 'px: nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await page.context().close();
  }
  await b.close();
  console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exitCode = fails ? 1 : 0;
})();
