// node test/fly-preview.js <out.png> [layers,…]  — a repülő sárkány rajzának előnézete (src/decor-baby.js, a rajz-függvények kinyerve)
const fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
(async () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/decor-baby.js'), 'utf8').replace(/registerDecor\([\s\S]*$/, '');
  const f = new Function(src + '; return { flySvg, FLY_LAYERS, FLY_ORDER, flyDefs, FLY };')();
  const only = process.argv[3] ? process.argv[3].split(',') : null;
  const svg = only ? '<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">' + f.flyDefs(1) + only.map(k => f.FLY_LAYERS[k](1)).join('') + '</svg>' : f.flySvg(1, 'x');
  const bg = process.env.BG || '#6b4a35';
  const html = '<style>.d-puffs circle{opacity:0}</style><body style="margin:0;background:' + bg + '"><div style="width:' + (process.env.PW || 960) + 'px">' + svg.replace('<svg ', '<svg style="width:100%;display:block" ') + '</div></body>';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +(process.env.PW || 960), height: Math.round((process.env.PW || 960) * 200 / 240) } });
  await p.setContent(html); await p.screenshot({ path: process.argv[2] }); await b.close();
})();
