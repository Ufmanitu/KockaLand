// node test/decor3.test.js <out-prefix>  — Díszek 3: kis sárkány, macska, bagoly, növény, book nook (állapotok, mentés, teljesítmény, mobil)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = process.argv[2] || '/tmp/dc3';
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
  const clickAt = async (page, sel, fx, fy) => { const el = await page.$(sel); await el.scrollIntoViewIfNeeded(); const bb = await el.boundingBox(); const x = bb.x + bb.width * fx, y = bb.y + bb.height * fy; await page.mouse.move(x, y); await page.mouse.click(x, y); };
  const addAll = (page, ids) => page.evaluate(ids => { S.decor = []; S.shelves.forEach(s => { s.ids = s.ids.filter(i => !isDecorId(i)); }); ids.forEach((id, i) => addDecorSet(DECOR_SETS.find(s => s.id === id), i % 2)); persist(); drawLibrary(); }, ids);
  const triple = async (page, sel, fx, fy, states) => {
    for (let i = 0; i < states.length; i++) { await clickAt(page, sel, fx, fy); await page.waitForTimeout(110); ok(await has(page, sel, states[i]), sel.slice(4) + ': ' + (i + 1) + '. kattintás → ' + states[i]); }
  };
  const NEW = ['kis-sarkany', 'macska', 'bagoly', 'noveny', 'book-nook'];

  let { page, errs } = await mk(1280, 1000);
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
  const nSets = await page.evaluate(() => DECOR_SETS.length);
  ok(nSets >= 10, 'katalógus: ' + nSets + ' halmaz');
  await page.click('button:has-text("Díszek")'); await page.waitForTimeout(300);
  ok((await page.$$('.dc-modal .dc-card')).length === nSets, 'a Díszek ablak minden halmazt mutat');
  await page.evaluate(() => document.querySelector('.dc-modal .dc-list').scrollTo(0, 99999)); await page.screenshot({ path: out + '-modal.png' });
  await page.click('.dc-modal .btn.primary:has-text("Kész")'); await page.waitForTimeout(300);

  await addAll(page, NEW); await page.waitForTimeout(400);
  ok((await page.$$('.lb-deco')).length === 5, 'minden új dísz a polcokon (' + (await page.$$('.lb-deco')).length + ')');
  await page.evaluate(() => clearTimeout(DecorLife.t));
  await page.screenshot({ path: out + '-shelf.png', fullPage: true });
  const nAnim = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
  ok(nAnim === 0, 'nyugalomban nincs futó animáció (' + nAnim + ')');

  // repülő sárkány: nagyot fúj → csapkod; füstoszlopra: puffan
  await clickAt(page, '.dc-kis-sarkany', .6, .4); await page.waitForTimeout(110);
  ok(await has(page, '.dc-kis-sarkany', 'is-blast'), 'repülő sárkány: első kattintás is-blast (tüzet fúj)');
  await page.waitForTimeout(1900);
  await clickAt(page, '.dc-kis-sarkany', .6, .4); await page.waitForTimeout(110);
  ok(await has(page, '.dc-kis-sarkany', 'is-flap'), 'repülő sárkány: második kattintás is-flap');
  await page.waitForTimeout(1800);
  await clickAt(page, '.dc-kis-sarkany', .43, .73); await page.waitForTimeout(110);
  ok(await has(page, '.dc-kis-sarkany', 'is-puff'), 'repülő sárkány: a füstoszlopra kattintva is-puff');
  await page.waitForTimeout(1700);

  // macska
  await triple(page, '.dc-macska', .5, .5, ['is-wake', 'is-purr', 'is-grump']);
  await page.waitForTimeout(3100);
  // bagoly
  await triple(page, '.dc-bagoly', .5, .5, ['is-look', 'is-hoot', 'is-fright']);
  await page.waitForTimeout(2700);
  // növény
  await triple(page, '.dc-noveny', .5, .5, ['is-sway', 'is-bloom', 'is-bug']);
  await page.waitForTimeout(4300);

  // book nook: lámpa kapcsol, mentve; jelenet: ajtó
  await clickAt(page, '.dc-book-nook .d-sw', .5, .5); await page.waitForTimeout(150);
  ok(await has(page, '.dc-book-nook', 'is-off') && await page.evaluate(() => S.decor.find(d => d.type === 'book-nook').off === true), 'book nook: lámpa-kattintás lekapcsol, mentve');
  await page.waitForTimeout(900);
  ok((await page.$eval('.dc-book-nook .d-dim', e => +getComputedStyle(e).opacity)) > 0.4, 'book nook: lekapcsolva sötétebb');
  await clickAt(page, '.dc-book-nook', .5, .55); await page.waitForTimeout(150);
  ok(!(await has(page, '.dc-book-nook', 'is-off')), 'book nook: sötét jelenetre kattintva felkapcsol');
  await page.waitForTimeout(1000);
  await clickAt(page, '.dc-book-nook', .5, .55); await page.waitForTimeout(150);
  ok(await has(page, '.dc-book-nook', 'is-door'), 'book nook: világító jelenetre kattintva kinyílik az ajtó');
  await page.waitForTimeout(3900);

  // idle: néhány tick után nem marad beragadt osztály, nincs hiba
  await page.evaluate(() => { document.querySelectorAll('.lb-deco').forEach(el => { const T = DECOR[el.dataset.type]; if (T && T.idle) T.idle(el, dcApi(el)); }); });
  await page.waitForTimeout(6200);
  const stuck = await page.$$eval('.lb-deco', els => els.map(e => [...e.classList].filter(c => /^is-/.test(c) && c !== 'is-off').join(' ')).filter(Boolean));
  ok(stuck.length === 0, 'az idle-animációk lejárnak, nincs beragadt állapot' + (stuck.length ? ': ' + stuck.join(' | ') : ''));
  ok(errs.length === 0, 'nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  // Kímélő mód: nincs idle/szemkövetés, de a kattintás megy
  ({ page, errs } = await mk(1280, 900));
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(700);
  await page.evaluate(() => { S.settings.lite = true; applyMotionClasses && applyMotionClasses(); });
  await addAll(page, ['macska', 'bagoly']); await page.waitForTimeout(300);
  await clickAt(page, '.dc-bagoly', .5, .5); await page.waitForTimeout(110);
  ok(await has(page, '.dc-bagoly', 'is-look'), 'Kímélő módban is reagál a kattintásra');
  ok(errs.length === 0, 'nincs konzolhiba (lite)' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await page.context().close();

  // mobil
  for (const [w, hh, sch] of [[390, 800], [360, 740]]) {
    ({ page, errs } = await mk(w, hh));
    await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
    await addAll(page, NEW.concat(['szellem', 'lampas', 'uveg-var'])); await page.waitForTimeout(500);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth), cw = await page.evaluate(() => document.documentElement.clientWidth);
    ok(sw <= cw, w + 'px: sok dísszel sincs vízszintes görgetés (' + sw + '/' + cw + ')');
    await page.screenshot({ path: out + '-m' + w + '.png', fullPage: true });
    await page.tap('.dc-macska').catch(() => { }); await page.waitForTimeout(150);
    ok(await has(page, '.dc-macska', 'is-wake'), w + 'px: érintésre a macska felébred');
    ok(errs.length === 0, w + 'px: nincs konzolhiba' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await page.context().close();
  }
  await b.close();
  console.log(fails ? fails + ' HIBA' : 'minden rendben'); process.exitCode = fails ? 1 : 0;
})();
