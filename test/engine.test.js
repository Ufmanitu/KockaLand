// node test/engine.test.js — motor + seed ellenőrzés (v2)
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.join(__dirname, '..', 'src');
const files = ['engine.js', 'data-base.js'].concat(fs.readdirSync(dir).filter(f => /^data-.*\.js$/.test(f) && f !== 'data-base.js').sort());
const ctx = vm.createContext({ console, Math });
vm.runInContext(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') + '\nthis.Engine=Engine; this.Seed=Seed;', ctx);
const { Engine, Seed } = ctx;
let seed = 12345;
const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log('  ✗', m); } };

// 1) DSL
const o = Engine.parseLine('Szöveg szóközzel #címke-á #b !c ?x|y ?z +w *5 ~');
ok(o.t === 'Szöveg szóközzel' && o.g.join() === 'cimke-a,b' && o.x[0] === 'c' && o.n.length === 2 && o.w[0] === 'w' && o.s && o.p === 5, 'parseLine');
ok(Engine.fmtLine(o).indexOf('#címke-á') > 0 && Engine.fmtLine(o).indexOf('*5') > 0, 'ékezetes címke-szótár és súly a fmtLine-ban');
ok(Engine.parseLine(Engine.fmtLine(o)).p === 5, 'fmt/parse kör súly');
ok(Engine.slug('Őszi Tűz') === 'oszi-tuz', 'slug ékezet');

const books = Seed.books();
const themes = Seed.themes();
ok(themes.length === 8 && themes.some(t => t.id === 'fozes'), 'nyolc alap téma, köztük a főzés');
for (const th of themes) {
  const dice = th.dice.filter(d => d.enabled);
  const c0 = { chaos: 0.35, rng, books, onlyUnread: true };
  // 2) szürreális KI: mindig koherens, soha nem szürreális, soha nem jelzett
  let N = 500, flagged = 0, viol = 0;
  for (let i = 0; i < N; i++) {
    const p = Engine.rollAll(dice, {}, {}, Object.assign({ surreal: false }, c0));
    const missing = dice.filter(d => (d.kind === 'shelf' || Engine.allowed(d, c0).length) && !p[d.id]);
    ok(missing.length === 0, th.id + ' hiányzó pick: ' + missing.map(d => d.id));
    if (Engine.violations(dice.filter(d => d.kind !== 'shelf'), p, Engine.providers(dice, c0)).count) viol++;
    if (Object.values(p).some(x => x.flag)) flagged++;
    ok(!Object.values(p).some(x => x.opt && x.opt.s), th.id + ' szürreális opció kikapcsolt módban');
  }
  ok(viol === 0 && flagged === 0, th.id + ' szürreális KI: szabálysértés ' + viol + ', jelzett ' + flagged);
  const dead = Engine.deadOptions(dice.filter(d => d.kind !== 'shelf'), c0);
  ok(dead.length === 0, th.id + ' halott opciók: ' + dead.map(d => d.opt.t).slice(0, 5).join(' | '));
  // szürreális BE: van szürreális/lila jelzés, de a játék nem omlik össze
  let s = 0;
  for (let i = 0; i < N; i++) { const p = Engine.rollAll(dice, {}, {}, Object.assign({ surreal: true }, c0)); if (Object.values(p).some(x => x.flag === 's')) s++; }
  console.log(th.id.padEnd(9), 'OFF koherens 100% | ON szürreális jelzés:', Math.round(s / N * 100) + '%');
  ok(th.id === 'konyv' || s / N > 0.1, th.id + ' szürreális módban alig van szürreális jelzés');

  // 3) zárolás
  let p = Engine.rollAll(dice, {}, {}, Object.assign({ surreal: false }, c0));
  const locks = {}; locks[dice[0].id] = true;
  const keep = p[dice[0].id].opt.id;
  for (let i = 0; i < 80; i++) { p = Engine.rollAll(dice, p, locks, Object.assign({ surreal: false }, c0)); ok(p[dice[0].id].opt.id === keep, th.id + ' zárolt kocka megváltozott'); }
  // 4) egy kocka újradobása: 0 szabálysértés marad, a zárolt nem változik, a kocka többnyire változik
  const c1 = Object.assign({ surreal: false }, c0);
  p = Engine.rollAll(dice, {}, {}, c1);
  let changed = 0, tries = 0;
  for (const d of dice.filter(d => d.kind !== 'shelf' && Engine.allowed(d, c1).length > 1)) {
    const before = p[d.id].opt.id; tries++;
    const q = Engine.rollOne(dice, d.id, p, c1, locks);
    if (q[d.id].opt.id !== before) changed++;
    ok(Engine.violations(dice.filter(x => x.kind !== 'shelf'), q, Engine.providers(dice, c1)).count === 0 || d.id === dice[0].id, th.id + ' rollOne után szabálysértés (' + d.id + ')');
    ok(q[dice[0].id].opt.id === p[dice[0].id].opt.id || d.id === dice[0].id, th.id + ' rollOne zárolt kockát módosított');
    p = q;
  }
  ok(changed >= Math.max(1, tries - 2), th.id + ' rollOne ritkán változtat: ' + changed + '/' + tries);
}

// 5) Mozi: az elmúlt 15 év túlsúlyban, a film illeszkedik a hosszhoz és a korszakhoz
{
  const dice = themes.find(t => t.id === 'mozi').dice;
  let recent = 0, N = 1000;
  for (let i = 0; i < N; i++) {
    const p = Engine.rollAll(dice, {}, {}, { surreal: false, rng, books });
    const y = +p['mozi-film'].opt.t.match(/\((\d{4})\)/)[1];
    if (y >= 2011) recent++;
    const era = p['mozi-korszak'].opt.g[0];
    ok(era === (y < 1980 ? 'klasszikus' : y < 2000 ? 'retro' : y < 2011 ? 'e2000' : 'uj'), 'mozi korszak/film eltér: ' + y + ' ' + era);
  }
  console.log('mozi: elmúlt 15 év aránya', Math.round(recent / N * 100) + '%', ' filmek:', dice.find(d => d.id === 'mozi-film').options.length);
  ok(recent / N > 0.45, 'mozi: kevés friss film');
  ok(dice.find(d => d.id === 'mozi-film').options.length >= 300, 'mozi: kevés film');
}
// 6) a nonszensz-példák a felhasználói visszajelzésből
{
  const k = themes.find(t => t.id === 'kezmuves').dice, r = themes.find(t => t.id === 'randi').dice;
  for (let i = 0; i < 600; i++) {
    const p = Engine.rollAll(k, {}, {}, { surreal: false, rng, books });
    if (p['kez-targy'].opt.t.indexOf('Fotókeret') === 0) ok(!/gyurma|agyag/i.test(p['kez-technika'].opt.t), 'Fotókeret gyurmából');
    const q = Engine.rollAll(r, {}, {}, { surreal: false, rng, books });
    if (q['randi-hol'].opt.t.indexOf('kávézó') >= 0) ok(q['randi-mit'].opt.t.indexOf('Mozizás') < 0, 'kávézó → mozizás');
  }
}
// 7) könyv-szűrés + üres polc
{
  const dice = themes.find(t => t.id === 'konyv').dice;
  let match = 0, N = 300;
  for (let i = 0; i < N; i++) {
    const p = Engine.rollAll(dice, {}, {}, { surreal: false, rng, books, onlyUnread: true });
    const g = dice.find(d => d.role === 'genre'), pickG = p[g.id].opt;
    const b = p[dice.find(d => d.kind === 'shelf').id].opt.book;
    if (pickG.g.includes('barmi') || Engine.splitList(b.genre).map(Engine.slug).some(x => pickG.g.includes(x))) match++;
  }
  console.log('könyv-műfaj egyezés:', Math.round(match / N * 100) + '%');
  ok(match / N > 0.85, 'könyv műfaj-szűrő gyenge');
  const p = Engine.rollAll(dice, {}, {}, { surreal: false, rng, books: [], onlyUnread: true });
  ok(p[dice.find(d => d.kind === 'shelf').id].opt.id === 'book:none', 'üres polc kezelése');
}
// 8) migráció
{
  const S = { themes: [{ id: 'randi', builtin: true, name: 'Randi', dice: [{ id: 'x', name: 'Saját', options: [{ t: 'A' }] }] }, { id: 'sajat', builtin: false, name: 'Saját', dice: [] }] };
  const m = Seed.migrate(S);
  ok(m && m.kept.indexOf('Randi') >= 0 && S.themes.some(t => t.id === 'fozes') && S.themes.find(t => t.id === 'randi').dice[0].id === 'x' && S.seedV === Seed.VERSION, 'migráció: átírt téma megmarad, főzés hozzáadva');
  ok(Seed.migrate(S) === null, 'migráció csak egyszer');
}
console.log(fail ? '\n' + fail + ' HIBA' : '\nminden rendben');
process.exitCode = fail ? 1 : 0;
