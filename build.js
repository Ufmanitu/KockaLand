// node build.js → dist/index.html  (CSS + JS beágyazva, a template.html helyőrzőibe)
const fs = require('fs'), path = require('path');
const R = p => path.join(__dirname, p);
const readIf = p => fs.existsSync(R(p)) ? fs.readFileSync(R(p), 'utf8') : '';
const JS = ['engine', 'data-base', 'data-randi', 'data-utazas', 'data-kaja', 'data-fozes', 'data-films', 'data-mozi', 'data-kezmuves', 'data-konyv', 'data-meghitt', 'core', 'play', 'editor', 'shelf', 'library', 'library-ui', 'decor', 'decor-dragon', 'decor-ghost', 'decor-lantern', 'decor-glass', 'decor-baby', 'decor-cat', 'decor-owl', 'decor-plant', 'decor-nook', 'lib3d-sdf', 'lib3d-kit', 'lib3d', 'lib3d-dragon', 'lib3d-lamps', 'lib3d-nook','lib3d-nookzoom', 'lib3d-pets', 'lib3d-pets2', 'lib3d-dragons2', 'misc', 'app'];
const CSS = ['base', 'play', 'editor', 'shelf', 'decor', 'decor2', 'lib3d', 'misc'];
const js = JS.map(f => readIf('src/' + f + '.js')).filter(Boolean).join('\n\n');
const css = CSS.map(f => readIf('src/css/' + f + '.css')).filter(Boolean).join('\n\n');
let out = fs.readFileSync(R('src/template.html'), 'utf8');
out = out.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);
fs.mkdirSync(R('dist'), { recursive: true });
fs.writeFileSync(R('dist/index.html'), out);
// önálló oldal (GitHub Pages / közvetlen megnyitás): ugyanaz a váz, amit az Artifact is köré tesz
const skel = '<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n';
fs.writeFileSync(R('dist/standalone.html'), skel + out + '\n</body></html>\n');
console.log('dist/index.html', (out.length / 1024).toFixed(1) + ' KB', '(js ' + (js.length / 1024).toFixed(1) + ' KB, css ' + (css.length / 1024).toFixed(1) + ' KB)');
