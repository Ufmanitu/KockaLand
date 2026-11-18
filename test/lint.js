// node test/lint.js <témaId> [kockaA kockaB]  — koherencia-lint: halott opciók, szabálysértés, minta-eredmények, párosítási tábla
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.join(__dirname, '..', 'src');
const files = ['engine.js'].concat(fs.readdirSync(dir).filter(f => /^data-.*\.js$/.test(f)).sort((a, b) => (a === 'data-base.js' ? -1 : b === 'data-base.js' ? 1 : a.localeCompare(b))));
const ctx = vm.createContext({ console, Math });
vm.runInContext(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') + '\nthis.Engine=Engine; this.Seed=Seed;', ctx);
const { Engine, Seed } = ctx;
let seed = 777; const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const id = process.argv[2];
const themes = Seed.themes().filter(t => !id || t.id === id);
let bad = 0;
for (const th of themes) {
  const dice = th.dice.filter(d => d.enabled && d.kind !== 'shelf');
  const c = { surreal: false, chaos: 0.35, rng, books: [] };
  const N = 600; let viol = 0; const pair = {};
  const short = (d, p) => (p[d.id] ? p[d.id].opt.t.slice(0, 34) : '-');
  const samples = [];
  for (let i = 0; i < N; i++) {
    const p = Engine.rollAll(dice, {}, {}, c);
    const v = Engine.violations(dice, p, Engine.providers(dice, c));
    if (v.count || Object.values(p).some(x => x.flag)) viol++;
    if (i < 14) samples.push(dice.map(d => short(d, p)).join(' | '));
    if (process.argv[3]) { const A = dice.find(d => d.id.endsWith(process.argv[3])), B = dice.find(d => d.id.endsWith(process.argv[4])); if (A && B) { const k = p[A.id].opt.t.slice(0, 30); (pair[k] = pair[k] || new Set()).add(p[B.id].opt.t.slice(0, 30)); } }
  }
  const dead = Engine.deadOptions(dice, c);
  console.log('== ' + th.id + ': szabálysértő/jelzett eredmény ' + viol + '/' + N + ', halott opció: ' + dead.length);
  dead.forEach(d => console.log('   HALOTT:', d.die, '|', d.opt.t));
  if (viol) bad++;
  if (!process.argv[3]) samples.forEach(s => console.log('   ' + s));
  for (const k in pair) console.log('   ' + k + ' → ' + [...pair[k]].join(' / '));
}
process.exitCode = bad ? 1 : 0;
