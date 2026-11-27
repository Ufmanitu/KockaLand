/* ===== 3D Könyvtár (Three.js r128) =====
   A polcok valódi 3D-ben: faszekrény (oldal, polcdeszkák, hátlap, lábazat, korona), vastagsággal rendelkező könyvek (gerinc-textúra, borító, lapok),
   fény + valódi árnyék + környezeti visszaverődés, egérre kihúzódó könyv, kattintás, húzás. A 2D könyvtár tartalék (WebGL nélkül, Kímélő módban, vagy ha a Three.js nem tölt be).
   Felépítés: a DOM-ban a polcok fejléce/gombjai és egy láthatatlan, billentyűzettel/képernyőolvasóval használható réteg (.lb-sp gombok) marad; a rajzot egy viewport-méretű fix <canvas> adja
   (scissor = a polcok területe), a kamera 1:1 arányban követi az oldal görgetését (1 egység = 1 CSS px a z=0 síkon). Modell: S.shelves / S.books / S.decor – ugyanaz, mint 2D-ben. */
'use strict';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
const L3K = { SIDE: 16, TOPH: 24, PLINTH: 14, BOARD: 12, DEPTH: 150, FOV: 22 };
const L3 = { st: 'idle', gl: null, on: false, cbs: [], cv: null, r: null, scene: null, cam: null, key: null, items: new Map(), pick: [], cases: [], lays: [], tex: new Map(), wood: null, glow: null, hov: null, foc: null, ptr: null, par: { x: 0, y: 0, tx: 0, ty: 0 }, raf: 0, t: 0, box: null, anims: [], ray: null, fonts: false, rects: [], roots: [], geo: {} };

function l3GL() { if (L3.gl == null) { try { const c = document.createElement('canvas'); L3.gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { L3.gl = false; } } return L3.gl; }
function l3Want() { return S.settings.view3d !== false && !S.settings.lite && L3.st !== 'failed' && l3GL(); }
function l3Load(cb) {
  if (window.THREE) { L3.st = 'ready'; if (cb) cb(); return; }
  if (cb) L3.cbs.push(cb);
  if (L3.st === 'loading') return;
  L3.st = 'loading';
  const s = document.createElement('script'); s.src = THREE_URL; s.async = true;
  s.onload = () => { L3.st = window.THREE ? 'ready' : 'failed'; const c = L3.cbs.splice(0); if (L3.st === 'ready') c.forEach(f => f()); };
  s.onerror = () => { L3.st = 'failed'; L3.cbs.length = 0; };
  document.head.appendChild(s);
}
const l3Col = (hex, k) => { const c = new THREE.Color(hex).convertSRGBToLinear(); if (k != null) c.multiplyScalar(k); return c; };
/* l3Inv('v') = csak a nézet változott (görgetés, parallax): az árnyék-térkép nem rajzolódik újra; minden más hívás újrarajzoltatja (L3.sd) */
const l3Inv = v => { if (v !== 'v') L3.sd = true; if (L3.on && !L3.raf) L3.raf = requestAnimationFrame(l3Frame); };

/* ---------- geometria-építő: dobozok világ-UV-val és csúcspont-színnel, egy hívásra összefűzve ---------- */
class L3Geo {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; }
  box(x0, y0, z0, x1, y1, z1, col, uvs) {
    const s = uvs || 220, F = [
      [1, 0, 0, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [-1, 0, 0, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
      [0, 1, 0, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, -1, 0, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
      [0, 0, 1, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, -1, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]];
    F.forEach(f => {
      const base = this.p.length / 3, nx = f[0], ny = f[1], nz = f[2], q = f.slice(3);
      const ax = nx ? [2, 1] : ny ? [0, 2] : [0, 1], ea = Math.abs(Math.max(...q.map(v => v[ax[0]])) - Math.min(...q.map(v => v[ax[0]]))), eb = Math.abs(Math.max(...q.map(v => v[ax[1]])) - Math.min(...q.map(v => v[ax[1]])));
      const ua = ea >= eb ? ax[0] : ax[1], va = ea >= eb ? ax[1] : ax[0];
      q.forEach(v => { this.p.push(v[0], v[1], v[2]); this.n.push(nx, ny, nz); this.u.push(v[ua] / s, v[va] / s); if (col) this.c.push(col.r, col.g, col.b); });
      this.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
    return this;
  }
  shade(x0, x1, y0, y1, z, xs, ys, fn, uvs) {   // z-re merőleges rács; fn(x, y) → csúcspont-szín; xs/ys a rácspontok (x0..x1, y0..y1 között)
    const s = uvs || 220, nx = xs.length, base = this.p.length / 3;
    for (let j = 0; j < ys.length; j++) for (let i = 0; i < nx; i++) { const c = fn(xs[i], ys[j]); this.p.push(xs[i], ys[j], z); this.n.push(0, 0, 1); this.u.push(xs[i] / s, ys[j] / s); this.c.push(c.r, c.g, c.b); }
    for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = base + j * nx + i, b = a + 1, c = a + nx + 1, d = a + nx; this.i.push(a, b, c, a, c, d); }
    return this;
  }
  build() {
    const T = THREE, g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(this.u, 2));
    if (this.c.length) g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i); return g;
  }
}

/* ---------- textúrák ---------- */
function l3Wood() {
  if (L3.wood) return L3.wood;
  const W = 512, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'), rng = dcRng(11);
  g.fillStyle = '#d9cdbf'; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 46; i++) { const y = rng() * W, hh = 6 + rng() * 44; g.fillStyle = rng() < 0.5 ? 'rgba(80,42,16,.07)' : 'rgba(255,236,205,.09)'; g.fillRect(0, y, W, hh); if (y + hh > W) g.fillRect(0, y - W, W, hh); }
  for (let i = 0; i < 520; i++) {
    const y0 = rng() * W, amp = 0.4 + rng() * 3.2, ph = rng() * 6.283, k = 1 + Math.floor(rng() * 3);
    g.strokeStyle = rng() < 0.62 ? 'rgba(66,32,10,' + (0.05 + rng() * 0.17).toFixed(3) + ')' : 'rgba(255,238,210,' + (0.05 + rng() * 0.12).toFixed(3) + ')'; g.lineWidth = 0.5 + rng() * 1.5;
    g.beginPath(); for (let x = 0; x <= W; x += 16) { const y = y0 + Math.sin(x / W * 6.283 * k + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const x = rng() * W, y = rng() * W, r = 5 + rng() * 9; for (let k = 4; k > 0; k--) { g.strokeStyle = 'rgba(60,28,8,' + (0.1 + (4 - k) * 0.035) + ')'; g.lineWidth = 1.1; g.beginPath(); g.ellipse(x, y, r * k * 0.5 + 6, r * k * 0.24 + 2, 0, 0, 6.283); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = Math.min(8, L3.r.capabilities.getMaxAnisotropy());
  return (L3.wood = t);
}
function l3Glow() {   // lágy, kerek árnyék/fény-folt
  if (L3.glow) return L3.glow;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return (L3.glow = new THREE.CanvasTexture(c));
}
function l3SpineTex(b, L, F, w, h) {   // → {t: szín-textúra, m: maszk (R dombormű · G érdesség · B fémesség)}; a rajzot a spine.js készíti
  const key = [b.title, b.author, L.color, L.style, L.pat, L.acc, w, h, F.fs, F.ah, F.showA, b.status, L3.fonts, L3.deg ? 2 : 3].join('|');
  let e = L3.tex.get(key);
  if (!e) {
    const d = spineDraw(b, L, F, w, h, L3.deg ? 2 : 3, true), an = Math.min(8, L3.r.capabilities.getMaxAnisotropy());
    const t = new THREE.CanvasTexture(d.cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = an;
    const m = new THREE.CanvasTexture(d.mv); m.anisotropy = Math.min(4, an);
    e = { t: t, m: m }; L3.tex.set(key, e);
  }
  e.used = true; return e;
}
function l3Paper() {   // közös textúrák: lapélek (finom vonalak) és kötésvászon-szövés
  if (L3.paper) return L3.paper;
  const mkc = n => { const c = document.createElement('canvas'); c.width = c.height = n; return c; }, rng = dcRng(41);
  const pc = mkc(128), pg = pc.getContext('2d'); pg.fillStyle = '#f4ead2'; pg.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 1.5) { pg.fillStyle = 'rgba(120,90,50,' + (0.05 + rng() * 0.1).toFixed(3) + ')'; pg.fillRect(0, y, 128, 0.7); }
  const cc = mkc(128), cg = cc.getContext('2d'); cg.fillStyle = '#ffffff'; cg.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) { cg.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.5)'; cg.fillRect(rng() * 128, rng() * 128, 1 + rng() * 3, 1); }
  for (let y = 0; y < 128; y += 2) { cg.fillStyle = 'rgba(0,0,0,.035)'; cg.fillRect(0, y, 128, 1); }
  const mk = c => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
  return (L3.paper = { pages: mk(pc), cloth: mk(cc) });
}

/* ---------- elrendezés (2D-vel azonos logika: balról jobbra, sortörés polcszintenként) ---------- */
const l3CaseH = (levels, lh) => L3K.TOPH + levels * lh + L3K.PLINTH;
function l3Layout(sh, IW, lh) {
  const out = []; let x = 0, lvl = 0;
  sh.ids.forEach(id => {
    let it;
    if (isDecorId(id)) { const d = decorById(id), T = d && DECOR[d.type]; if (!T) return; const hh = T.k * (lh - 40); it = { id: id, kind: 'decor', d: d, T: T, w: Math.round(hh * T.ar), h: hh }; }
    else { const b = bookById(id); if (!b) return; const L = spineLook(b); it = { id: id, kind: 'book', b: b, L: L, w: L.w, h: Math.round(L.k * (lh - 40)) }; }
    if (x + it.w > IW && x > 0) { lvl++; x = 0; }
    it.x = x; it.lvl = lvl; x += it.w + 1; out.push(it);
  });
  return { items: out, levels: lvl + 1 };
}
function l3Fit(root) {   // a keretek magasságát a 3D szekrény méretére állítja (a DOM-elrendezés ehhez igazodik)
  const lh = libLH(); L3.lays = [];
  $$('.lb-case', root).forEach((cs, si) => {
    const fr = cs.querySelector('.lb-frame'), sh = S.shelves[si]; if (!fr || !sh) return;
    const W = fr.clientWidth, lay = l3Layout(sh, W - 2 * L3K.SIDE - 4, lh); lay.W = W; lay.H = l3CaseH(lay.levels, lh); lay.lh = lh;
    fr.style.height = lay.H + 'px'; L3.lays[si] = lay;
    lay.items.forEach(it => {   // a láthatatlan gombok a könyvek helyén állnak (fókusz-görgetés, érintés-célpont)
      const bt = fr.querySelector('.lb-sp[data-id="' + it.id + '"]'); if (!bt) return;
      bt.style.cssText = 'position:absolute;left:' + (L3K.SIDE + 2 + it.x) + 'px;top:' + (L3K.TOPH + (it.lvl + 1) * lh - L3K.BOARD - it.h) + 'px;width:' + it.w + 'px;height:' + it.h + 'px';
    });
  });
}

/* a GPU osztálya: 'mobile' = telefon/tábla (érintőkijelző vagy mobil-GPU): éles felbontás (a lassúság-őr szükség esetén visszaveszi); 'weak' = integrált Intel / szoftveres:
   alacsonyabb alapminőség (1. fokozat), MSAA nélkül, parallax nélkül; 'ok' = a többi. (A tesztek: window.__L3_WEAK / __L3_MOBILE felülírja.) */
function l3GpuClass() {
  if (window.__L3_MOBILE != null && window.__L3_MOBILE) return 'mobile';
  if (window.__L3_WEAK != null) return window.__L3_WEAK ? 'weak' : 'ok';
  if (navigator.webdriver) return 'ok';
  try {
    const c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl'); if (!gl) return 'ok';
    const x = gl.getExtension('WEBGL_debug_renderer_info'), n = x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL) || '') : '', lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    if (touch || /Mali|Adreno|PowerVR|Immortalis|VideoCore/i.test(n)) return 'mobile';
    return /SwiftShader|llvmpipe|Software|Basic Render|Intel(?!.*\bArc\b)/i.test(n) ? 'weak' : 'ok';
  } catch (e) { return 'ok'; }
}
/* a minőség kézi választása (Beállítások): 'auto' (alap, a lassúság-őrrel) | 'high' (éles: telefonon 2×, asztalin 1,5× felbontás, 2048-as árnyék) | 'fast' (gyors: 1× felbontás, olcsó árnyék, parallax nélkül) */
const l3Pref = () => S.settings.q3d === 'high' || S.settings.q3d === 'fast' ? S.settings.q3d : 'auto';
/* a lassúság-őr által megtanult fokozat eszközönként (nem része a mentésnek), 7 napig él: a következő látogatáskor már a megfelelő szinten indul, nem kell újra végigszenvedni */
function l3LoadDeg() { try { const o = JSON.parse(localStorage.getItem('kockazzunk.l3deg') || 'null'); return o && o.d > 0 && Date.now() - o.t < 7 * 864e5 ? 1 : 0; } catch (e) { return 0; } }
function l3SaveDeg(d) { try { if (d > 0) localStorage.setItem('kockazzunk.l3deg', JSON.stringify({ d: Math.min(1, d), t: Date.now() })); else localStorage.removeItem('kockazzunk.l3deg'); } catch (e) { } }
/* ---------- színtér ---------- */
function l3Init() {
  if (L3.r) return true;
  const T = THREE;
  try {
    const cv = document.createElement('canvas'); cv.id = 'l3'; cv.setAttribute('aria-hidden', 'true'); document.body.insertBefore(cv, $('#app'));
    const lowq = !!window.__L3_LOWQ, cls = lowq ? 'ok' : l3GpuClass(), weak = cls === 'weak', r = new T.WebGLRenderer({ canvas: cv, antialias: !lowq && !weak && l3Pref() !== 'fast', alpha: true, powerPreference: 'high-performance' });
    L3.lowq = lowq; L3.weak = weak; L3.mobile = cls === 'mobile'; L3.deg = Math.max(L3.deg || 0, weak || l3Pref() === 'fast' ? 1 : 0, lowq ? 0 : l3LoadDeg());
    r.setClearColor(0x000000, 0); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true; r.shadowMap.type = T.VSMShadowMap; r.shadowMap.autoUpdate = false; r.setScissorTest(true);
    L3.cv = cv; L3.r = r; L3.scene = new T.Scene(); L3.cam = new T.PerspectiveCamera(L3K.FOV, 1, 10, 6000); L3.ray = new T.Raycaster();
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); L3.st = 'failed'; l3Hide(); if ($('.lb')) drawLibrary(); });
    const sc = L3.scene;
    sc.add(new T.HemisphereLight(0xfff0dc, 0x5e3a22, 0.62));
    const key = new T.DirectionalLight(0xffe2bc, 1.35); key.castShadow = true; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.9; key.shadow.radius = 9; key.shadow.blurSamples = 12; sc.add(key); sc.add(key.target); L3.key = key;
    L3.sd = true;
    const fill = new T.DirectionalLight(0xbcd0ff, 0.22); fill.position.set(700, 200, 800); sc.add(fill);
    // környezeti visszaverődés: meleg softbox-ok egy kis "stúdióban"
    const es = new T.Scene(); es.background = new T.Color(0x20140d);
    const sb = (w, hh, x, y, z, k, c) => { const m = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
    sb(12, 8, -9, 8, 9, 6, 0xffe2bd); sb(10, 6, 10, 3, 7, 2.4, 0xfff0e0); sb(16, 2, 0, 11, 0, 4, 0xffffff); sb(24, 10, 0, -7, -8, 0.7, 0x7a4a2a);
    const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
    addEventListener('resize', l3Resize);
    document.addEventListener('scroll', () => l3Inv('v'), { passive: true });
    l3Resize();
    return true;
  } catch (e) { console.error(e); L3.st = 'failed'; return false; }
}
/* minőségi fokozat: 0 = alap (telefonon/táblán 1,5×, asztali gépen ≤ 1,25× felbontás, 1024-es árnyék), 1 = 1× (telefonon 1,25×) és 512-es árnyék (gyenge GPU-n / „Gyors” módban ez az induló),
   2 = vészfék: 0,75×, 512-es árnyék és lapos képként rajzolt díszek. „Éles” választással: telefonon (keskeny nézet) 2×, asztali gépen 1,5× + 2048-as árnyék. */
function l3PixelRatio() {
  const vw = innerWidth, d = L3.deg || 0, dpr = devicePixelRatio || 1, hi = l3Pref() === 'high';
  if (L3.lowq) return 1;
  if (d >= 2) return 0.75;
  if (d === 1) return L3.mobile ? Math.min(dpr, 1.25) : 1;
  return Math.min(dpr, L3.mobile ? (hi && vw < 700 ? 2 : 1.5) : hi ? 1.5 : vw < 700 ? 1.5 : 1.25);
}
function l3Quality() {
  const r = L3.r; if (!r) return;
  const vw = innerWidth, vh = innerHeight, d = L3.deg || 0, pr = l3PixelRatio();
  r.setPixelRatio(pr); r.setSize(vw, vh, false);
  const sh = L3.key && L3.key.shadow, sm = L3.lowq || d >= 1 ? 512 : l3Pref() === 'high' && !L3.mobile ? 2048 : 1024;
  if (sh && sh.mapSize.x !== sm) { sh.mapSize.set(sm, sm); if (sh.map) { sh.map.dispose(); sh.map = null; } }
  if (sh) { sh.radius = 9 * sm / 2048; sh.blurSamples = sm >= 2048 ? 12 : 8; }
  L3.sd = true;
}
function l3Resize() {
  if (!L3.r) return;
  const vw = innerWidth, vh = innerHeight; l3Quality();
  L3.cv.style.width = vw + 'px'; L3.cv.style.height = vh + 'px'; L3.cam.aspect = vw / vh; L3.cam.updateProjectionMatrix(); l3Inv();
  if (L3.on) { clearTimeout(L3.rt); L3.rt = setTimeout(() => { if ($('.lb.l3') && Math.abs((L3.lastW || 0) - $('.lb').clientWidth) > 1) drawLibrary(); }, 180); }
}
function l3Hide() { L3.on = false; clearTimeout(L3.idleT); if (L3.cv) L3.cv.style.display = 'none'; cancelAnimationFrame(L3.raf); L3.raf = 0; L3.hov = L3.foc = null; }

/* ---------- szekrény ---------- */
function l3BuildCase(W, Hc, levels, lh) {
  const T = THREE, K = L3K, D = K.DEPTH, g = new L3Geo();
  const side = l3Col('#40261a'), mold = l3Col('#523020'), back = l3Col('#26150f'), board = l3Col('#4a2a1b'), plinth = l3Col('#32190f');   // sötét dió/mahagóni (v12: dark romance)
  g.box(0, -Hc, -D, K.SIDE, 0, 0, side); g.box(W - K.SIDE, -Hc, -D, W, 0, 0, side);                          // oldalak
  g.box(-4, -14, -D, W + 4, 0, 7, mold); g.box(0, -K.TOPH, -D, W, -14, 0, side); g.box(-2, -K.TOPH - 5, -D + 4, W + 2, -K.TOPH, 4, mold);   // korona + tető
  g.box(K.SIDE, -(Hc - K.PLINTH), -D, W - K.SIDE, -K.TOPH, -D + 4, back, 160);                                   // hátlap
  for (let l = 0; l < levels; l++) {   // hátlap-árnyalás fülkénként: sötétebb a deszka alatt, a sarkokban és a polc mentén (olcsó „ambient occlusion”, csúcspont-színnel)
    const top = l ? -(K.TOPH + l * lh) : -K.TOPH, bot = -(K.TOPH + (l + 1) * lh) + K.BOARD, h = top - bot, x0 = K.SIDE, x1 = W - K.SIDE, ew = Math.min(46, (x1 - x0) * 0.2);
    const ys = [bot, bot + h * 0.1, bot + h * 0.55, top - h * 0.3, top - h * 0.08, top], xs = [x0, x0 + ew, x1 - ew, x1];
    const kv = y => { const t = (y - bot) / h; return t < 0.1 ? 0.8 + t * 2 : t > 0.7 ? 1 - (t - 0.7) / 0.3 * 0.5 : 1; }, kh = x => { const e = Math.min(x - x0, x1 - x) / ew; return 0.72 + 0.28 * Math.max(0, Math.min(1, e)); };
    g.shade(x0, x1, bot, top, -D + 4.4, xs, ys, (x, y) => back.clone().multiplyScalar(kv(y) * kh(x)), 160);
  }
  for (let l = 0; l < levels; l++) { const yb = -(K.TOPH + (l + 1) * lh); g.box(K.SIDE, yb, -D + 4, W - K.SIDE, yb + K.BOARD, -1.5, board); g.box(K.SIDE, yb + K.BOARD - 2.4, -3, W - K.SIDE, yb + K.BOARD, -1.5, l3Col('#8f5d38')); }  // deszkák + élfény
  g.box(K.SIDE - 5, -Hc, -D + 6, W - K.SIDE + 5, -(K.TOPH + levels * lh), 5, plinth); g.box(K.SIDE - 8, -Hc, -D + 6, K.SIDE - 2, -Hc + 6, 5, plinth); g.box(W - K.SIDE + 2, -Hc, -D + 6, W - K.SIDE + 8, -Hc + 6, 5, plinth);   // lábazat
  [[0, 0], [W - 3, 0]].forEach(p => g.box(p[0], -Hc + K.PLINTH, -1, p[0] + 3, -K.TOPH, 1.6, l3Col('#86583a')));   // élléc a szélén
  const mat = new T.MeshStandardMaterial({ map: l3Wood(), bumpMap: l3Wood(), bumpScale: 1.4, vertexColors: true, roughness: 0.6, metalness: 0, envMapIntensity: 0.55 });
  const m = new T.Mesh(g.build(), mat); m.castShadow = m.receiveShadow = true; m.renderOrder = 20; return m;   // a szekrény az utolsó átlátszatlan rajzolás: a könyvek által takart részére a mélységteszt már nem engedi a drága árnyalást
}

/* ---------- könyv ---------- */
function l3BuildBook(it, lh) {
  const T = THREE, b = it.b, L = it.L, w = it.w, h = it.h, hs = hashStr(b.id), d = 98 + (hs % 30), ct = Math.min(2.8, w * 0.085), bulge = Math.min(3.4, w * 0.09);
  const F = titleFit(b, L, lh), grp = new T.Group(), px = l3Paper();
  const sg = new T.PlaneGeometry(w, h, 12, 2); sg.translate(0, h / 2, 0); const pp = sg.attributes.position; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i) / (w / 2), y = pp.getY(i) / h; pp.setZ(i, bulge * (1 - x * x) * (1 - 0.1 * Math.pow(2 * y - 1, 2))); } sg.computeVertexNormals();
  const tx = l3SpineTex(b, L, F, w, h), glossy = L.style === 2 || L.style === 5 || L.style === 6;
  const smat = new T.MeshStandardMaterial({ map: tx.t, roughnessMap: tx.m, metalnessMap: tx.m, bumpMap: tx.m, bumpScale: 1.6, roughness: glossy ? 0.82 : 1, metalness: 1, envMapIntensity: 0.9 });
  smat.color.setScalar(0.62); smat.userData.k = 0.62;   // a erős fény felmossa a sötét színeket: a dark romance hangulathoz visszavesszük
  const spine = new T.Mesh(sg, smat); spine.castShadow = spine.receiveShadow = true; grp.add(spine);
  const cov = l3Col(L.color, 0.56), g = new L3Geo(), gp = new L3Geo();
  g.box(-w / 2, 0, -d, -w / 2 + ct, h, -0.3, cov, 80); g.box(w / 2 - ct, 0, -d, w / 2, h, -0.3, cov, 80); g.box(-w / 2, 0, -d, w / 2, h, -d + ct, cov, 80);
  gp.box(-w / 2 + ct + 0.2, 2.2, -d + ct, w / 2 - ct - 0.2, h - 2.2, -3.2, null, 60);
  const bmat = new T.MeshStandardMaterial({ vertexColors: true, map: px.cloth, roughness: 0.74, metalness: 0, envMapIntensity: 0.4 });
  const body = new T.Mesh(g.build(), bmat); body.castShadow = body.receiveShadow = true; grp.add(body);
  const pmat = new T.MeshStandardMaterial({ map: px.pages, roughness: 0.92, metalness: 0, envMapIntensity: 0.25 });
  const pages = new T.Mesh(gp.build(), pmat); pages.castShadow = pages.receiveShadow = true; grp.add(pages);
  if (b.status === 'olvasom') {   // könyvjelző-szalag a gerinc tetején
    const sh = new T.Shape(); sh.moveTo(-2.6, 0); sh.lineTo(2.6, 0); sh.lineTo(2.6, 28); sh.lineTo(0, 23); sh.lineTo(-2.6, 28); sh.closePath();
    const rb = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ color: l3Col('#8f1d2c'), roughness: 0.45, side: T.DoubleSide })); rb.position.set(0, h - 22, bulge + 0.8); rb.castShadow = true; grp.add(rb);
  }
  return { grp: grp, parts: [spine, body, pages], mats: [smat, bmat, pmat], d: d, bulge: bulge };
}

/* ---------- dísz: ideiglenes (lapos) alak az SVG-ből; a valódi 3D modellek a DECOR3 katalógusból jönnek ---------- */
const DECOR3 = {};
const registerDecor3 = d => (DECOR3[d.id] = d);
function l3DecorBill(it) {
  const T = THREE, grp = new T.Group(), W = it.w, H = it.h;
  const mat = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false });
  const m = new T.Mesh(new T.PlaneGeometry(W, H), mat); m.position.set(0, H / 2, -34); m.visible = false; grp.add(m);
  const svg = it.T.svg('u3' + (++decorSeq)).replace('<svg ', '<svg width="' + W * 2 + '" height="' + H * 2 + '" ');
  const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; mat.map = tx; mat.needsUpdate = true; m.visible = true; l3Inv(); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const sh = new T.Mesh(new T.PlaneGeometry(W * 1.2, 26), new T.MeshBasicMaterial({ map: l3Glow(), color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.set(0, 0.4, -34); grp.add(sh);
  return { grp: grp, parts: [m], mats: [mat], d: 60, bulge: 0 };
}

/* ---------- a színtér felépítése a modellből ---------- */
function l3Clear() {
  L3.items.forEach(it => { it.mats.forEach(m => m.dispose()); it.grp.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); });
  L3.cases.forEach(c => { c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); }); L3.scene.remove(c); });
  L3.items.clear(); L3.cases = []; L3.pick = []; L3.rects = []; L3.roots = [];
}
function l3Sync() {
  if (!L3.on || !L3.box) return;
  const T = THREE, K = L3K, cont = L3.box.getBoundingClientRect();
  L3.tex.forEach(e => { e.used = false; });
  l3Clear();
  const flatDecor = !!S.settings.flatDecor || (L3.deg || 0) >= 2;   // a díszek lapos képként: sokkal olcsóbb (beállítás, vagy a lassúság-őr vészfoka)
  { const T2 = THREE, cw = cont.width + 300, ch = cont.height + 400, wl = new T2.Mesh(new T2.PlaneGeometry(cw, ch), new T2.ShadowMaterial({ color: 0x3a1408, opacity: 0.3 })); wl.position.set(cont.width / 2, -cont.height / 2 - 60, -L3K.DEPTH - 1); wl.receiveShadow = true; L3.scene.add(wl); L3.cases.push(wl); }
  $$('.lb-case', L3.box).forEach((cs, si) => {
    const fr = cs.querySelector('.lb-frame'), lay = L3.lays[si]; if (!fr || !lay) return;
    const r = fr.getBoundingClientRect(), cg = new T.Group(); cg.position.set(r.left - cont.left, -(r.top - cont.top), 0); L3.rects[si] = { x: r.left - cont.left, y: r.top - cont.top, W: lay.W, H: lay.H }; L3.roots[si] = cg;
    cg.add(l3BuildCase(lay.W, lay.H, lay.levels, lay.lh));
    lay.items.forEach(it => {
      const rec = 3 + ((hashStr(it.id) >>> 4) % 5), bx = K.SIDE + 2 + it.x + it.w / 2, by = -(K.TOPH + (it.lvl + 1) * lay.lh) + K.BOARD;
      const o = it.kind === 'book' ? l3BuildBook(it, lay.lh) : (DECOR3[it.d.type] && DECOR3[it.d.type].build && !flatDecor ? DECOR3[it.d.type].build(it, lay) : l3DecorBill(it));
      const item = { id: it.id, kind: it.kind, b: it.b, d: it.d, T: it.T, w: it.w, h: it.h, grp: o.grp, parts: o.parts, mats: o.mats, ctl: o.ctl, bx: bx, by: by, bz: it.kind === 'book' ? -rec : 0, hv: 0, ht: 0, pk: 0, lf: 0, dim: 0, depth: o.d, shelf: si, lvl: it.lvl };
      o.grp.position.set(bx, by, item.bz); cg.add(o.grp); o.parts.forEach(p => { p.userData.item = item; L3.pick.push(p); });
      L3.items.set(it.id, item);
      if (it.kind === 'decor' && (L3.deg || 0) < 2) {   // v12: meleg "spotlámpa"-folt a díszek mögött a hátlapon (additív, olcsó)
        if (!L3.glowTex) { const c = document.createElement('canvas'); c.width = c.height = 128; const g2 = c.getContext('2d'), gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,170,90,1)'); gr.addColorStop(0.45, 'rgba(210,110,60,.45)'); gr.addColorStop(1, 'rgba(120,40,40,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128); L3.glowTex = new T.CanvasTexture(c); L3.glowTex.encoding = T.sRGBEncoding; }
        const gm = new T.Mesh(new T.PlaneGeometry(it.w * 2.1, it.h * 1.9), new T.MeshBasicMaterial({ map: L3.glowTex, transparent: true, opacity: 0.34, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
        gm.position.set(bx, by + it.h * 0.5, -K.DEPTH + 7); gm.renderOrder = -1; cg.add(gm);
      }
    });
    L3.scene.add(cg); L3.cases.push(cg);
  });
  const pk = new Set(pickedBooks().map(x => x.book.id)); L3.items.forEach(it => { it.pk = pk.has(it.id) ? 1 : 0; l3Pose(it); });
  L3.tex.forEach((e, k) => { if (!e.used) { e.t.dispose(); if (e.m) e.m.dispose(); L3.tex.delete(k); } });
  l3Filter();
  if (!L3.fonts && document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { L3.fonts = true; if (L3.on && $('.lb.l3')) l3Sync(); });
  l3Inv();
}
function l3Filter() {
  const q = Engine.slug(SH.lq || '');
  L3.items.forEach(it => {
    if (it.kind !== 'book') return;
    const dim = !!q && Engine.slug([it.b.title, it.b.author, it.b.genre, it.b.mood].join(' ')).indexOf(q) < 0;
    if (dim !== !!it.dim) { it.dim = dim ? 1 : 0; it.mats.forEach(m => { m.color.setScalar((dim ? 0.28 : 1) * (m.userData.k || 1)); }); }
  });
  l3Inv();
}
function l3Pose(it) {   // könyv: kihúzódik és megdől hover/fókusz/kiválasztás esetén; a forgáspont a könyv alja
  L3.sd = true; if (it.drag) return;
  const hv = it.hv, lift = it.lf || 0;
  it.grp.position.set(it.bx, it.by + lift * 0.35 + (it.kind === 'book' ? 4 * hv : 0), it.bz + (it.kind === 'book' ? 30 : 10) * hv + 15 * it.pk + lift);
  it.grp.rotation.x = it.kind === 'book' ? 0.3 * hv + 0.03 * it.pk + 0.05 * (lift ? 1 : 0) : 0;
}

/* ---------- kamera, fény, kirajzolás ---------- */
function l3Cam() {
  const vw = innerWidth, vh = innerHeight, cb = L3.box.getBoundingClientRect(), cam = L3.cam, dist = (vh / 2) / Math.tan(L3K.FOV * Math.PI / 360);
  const sx = vw / 2 - cb.left, sy = -(vh / 2 - cb.top);
  cam.position.set(sx + L3.par.x, sy + L3.par.y, dist); cam.lookAt(sx, sy, 0); cam.near = dist * 0.25; cam.far = dist + 1600; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return { cb: cb, sx: sx, sy: sy, vw: vw, vh: vh };
}
function l3Render(anim) {   // anim: animáció közben hívva → az árnyék-térkép legfeljebb ~20 Hz-en frissül (a puha árnyék ezt nem mutatja meg, a képkocka kb. fele-harmada az árnyék-rajzolás)
  if (L3.hold) return;   // egy ráközelítés (pl. book nook) saját vásznon rajzol, közben a polc áll
  const r = L3.r, c = l3Cam(), x0 = Math.max(0, c.cb.left - 30), x1 = Math.min(c.vw, c.cb.right + 90), y0 = Math.max(0, c.cb.top - 20), y1 = Math.min(c.vh, c.cb.bottom + 130);
  r.setScissorTest(false); r.clear(); r.setScissorTest(true);
  if (x1 <= x0 || y1 <= y0) return;
  r.setScissor(x0, c.vh - y1, x1 - x0, y1 - y0);
  const key = L3.key, half = Math.hypot(c.vw, c.vh) * 0.72, SN = 96, qx = Math.round(c.sx / SN) * SN, qy = Math.round(c.sy / SN) * SN, kk = qx + ',' + qy + ',' + Math.round(half);
  if (kk !== L3.sdK) {   // az árnyék-kamera 96 px-es rácson ugrik (a keret ≥ 0,2·átló ráhagyással), így görgetéskor nem kell újrarajzolni az árnyékot
    L3.sdK = kk; L3.sd = true; L3.sdF = true; const tgt = new THREE.Vector3(qx, qy, -70), dir = new THREE.Vector3(-0.3, 0.66, 1).normalize();
    key.target.position.copy(tgt); key.position.copy(tgt).addScaledVector(dir, 1500); key.target.updateMatrixWorld();
    const sc = key.shadow.camera; sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 200; sc.far = 3300; sc.updateProjectionMatrix();
  }
  const nw = performance.now(); let upd = !!L3.sd;
  if (upd && anim && !L3.sdF && L3.sdT && nw - L3.sdT < 50) upd = false;   // marad L3.sd = true: a következő képkocka (vagy a záró) frissíti
  if (upd) { L3.sd = false; L3.sdF = false; L3.sdT = nw; }
  r.shadowMap.needsUpdate = upd;
  r.render(L3.scene, L3.cam);
}
function l3Frame(now) {
  L3.raf = 0;
  if (L3.tr && now - L3.tr < 12) { L3.raf = requestAnimationFrame(l3Frame); return; }   // legfeljebb ~60 fps: 120/144 Hz-es kijelzőn minden második képkockát hagyjuk ki (a GPU fele-harmada)
  L3.tr = now; const dt = Math.min(0.12, L3.t ? (now - L3.t) / 1000 : 0.016); L3.t = now;
  let busy = false;
  const P = L3.par; if (Math.abs(P.tx - P.x) > 0.05 || Math.abs(P.ty - P.y) > 0.05) { const k = 1 - Math.pow(0.002, dt); P.x += (P.tx - P.x) * k; P.y += (P.ty - P.y) * k; busy = true; }
  if (L3.hq) { L3.hq = false; l3Hover(); }
  L3.items.forEach(it => {
    if (it.tx != null) { const dx = it.tx - it.bx, dy = it.ty - it.by; if (Math.abs(dx) + Math.abs(dy) > 0.1) { const k = 1 - Math.pow(0.0004, dt); it.bx += dx * k; it.by += dy * k; busy = true; } else { it.bx = it.tx; it.by = it.ty; it.tx = null; } l3Pose(it); }
    const t = it.ht, lf = it.lt != null ? it.lt : 0;
    if (Math.abs(t - it.hv) > 0.004) { it.hv += (t - it.hv) * (1 - Math.pow(0.0005, dt)); busy = true; l3Pose(it); }
    else if (it.hv !== t) { it.hv = t; l3Pose(it); }
    if (it.lt != null && Math.abs(lf - it.lf) > 0.05) { it.lf += (lf - it.lf) * (1 - Math.pow(0.0002, dt)); busy = true; l3Pose(it); }
  });
  if (DND.s && DND.s.l3 && DND.s.on) { l3DndStep(dt); busy = true; L3.sd = true; }
  for (let i = L3.anims.length - 1; i >= 0; i--) { const a = L3.anims[i]; a.t += dt; const u = Math.min(1, a.t / a.d); a.fn(u, dt); busy = true; if (!a.q) L3.sd = true; if (u >= 1) { L3.anims.splice(i, 1); if (a.done) a.done(); } }
  l3Render(busy); l3Perf(now);
  if (L3.sd && !L3.hold) busy = true;   // függő (visszatartott) árnyék-frissítés: még egy képkocka
  if (busy) L3.raf = requestAnimationFrame(l3Frame); else { L3.t = 0; }
}
/* ---------- lassúság-őr: folyamatos animáció közben mért képkocka-idők; először csendben visszaveszünk (felbontás/árnyék), másodszor felajánljuk a 2D nézetet ---------- */
function l3Perf(now) {
  if (L3.lowq || document.hidden) return;
  const pf = L3.pf || (L3.pf = { last: 0, d: [] });
  if (pf.last && now - pf.last < 250) pf.d.push(now - pf.last);
  pf.last = now;
  if (pf.d.length >= 20) { const d = pf.d.slice(2).sort((x, y) => x - y); pf.d = []; l3PerfEval(d[d.length >> 1], d[Math.floor(d.length * 0.9)]); }
}
function l3PerfEval(med, p90) {
  const slow = med > 20 || p90 > 42;   // 60 Hz-en a 2 vsync-es (33 ms) képkocka már lassú
  L3.slow = slow ? (L3.slow || 0) + 1 : Math.max(0, (L3.slow || 0) - 1);
  if (L3.slow >= 2 && (L3.deg || 0) < 2) {   // 1–2. lépcső: csendes visszavétel (felbontás + árnyék)
    L3.deg = (L3.deg || 0) + 1; L3.slow = 0; l3SaveDeg(L3.deg); l3Quality(); if (L3.deg >= 2 && $('.lb.l3')) l3Sync(); else l3Inv(); return 'deg';
  }
  if (L3.slow >= 2 && L3.deg >= 2 && !S.settings.perf3dAsked) {   // 3. lépcső: egyszer rákérdezünk
    S.settings.perf3dAsked = true; persist(); L3.slow = 0;
    toastAction('A 3D könyvtár lassúnak tűnik ezen a gépen. Átváltsak a gyorsabb 2D nézetre?', 'Átváltok', () => { S.settings.view3d = false; persist(); drawLibrary(); toast('2D nézet. A Beállításokban bármikor visszakapcsolhatod a 3D-t.'); });
    return 'ask';
  }
  return slow ? 'slow' : 'ok';
}
/* quiet = true: az animáció nem mozgat árnyékot vető geometriát (fény, csillogás, láng, emissive) → nem rajzoltatja újra az árnyék-térképet */
const l3Anim = (d, fn, done, quiet) => { L3.anims.push({ t: 0, d: d, fn: fn, done: done, q: !!quiet }); l3Inv(quiet ? 'v' : undefined); };

/* ---------- egér: hover, kattintás, fókusz ---------- */
function l3PickHit(x, y) {
  const c = l3Cam(), nd = new THREE.Vector2(x / c.vw * 2 - 1, -(y / c.vh) * 2 + 1); L3.ray.setFromCamera(nd, L3.cam);
  const hits = L3.ray.intersectObjects(L3.pick, false); if (!hits.length) return null;
  const first = hits[0], it = first.object.userData.item, nose = hits.find(h => h.object.userData.item === it && h.object.userData.part === 'nose');
  return { item: it, obj: nose ? nose.object : first.object, part: (nose ? nose.object : first.object).userData.part || '', point: first.point };
}
function l3Pick(x, y) { const h = l3PickHit(x, y); return h ? h.item : null; }
function l3Hover() {
  const p = L3.ptr, it = p && !DND.s ? l3Pick(p.x, p.y) : null;
  if (!DND.s) L3.items.forEach(x => { if (x.ctl && x.ctl.look) x.ctl.look(p); });
  if (it !== L3.hov) {
    if (L3.hov && L3.hov !== L3.foc) L3.hov.ht = 0; if (it) it.ht = 1; L3.hov = it;
    if (L3.box) L3.box.style.cursor = it ? (SH.edit ? 'grab' : 'pointer') : '';
    l3Inv();
  }
}
function l3Move(e) {
  if (!e.target.closest || !e.target.closest('.lb-frame')) { if (L3.hov) { L3.ptr = null; L3.hq = true; l3Inv(); } return; }
  L3.ptr = { x: e.clientX, y: e.clientY }; L3.hq = true;
  if (e.pointerType === 'mouse' && !L3.deg) { L3.par.tx = (e.clientX / innerWidth - 0.5) * 70; L3.par.ty = -(e.clientY / innerHeight - 0.5) * 44; }
  l3Inv();
}
function l3Leave() { L3.ptr = null; L3.hq = true; L3.par.tx = L3.par.ty = 0; l3Inv(); }
function l3Click(e) {
  if (DND.dragged || !e.target.closest || !e.target.closest('.lb-frame')) return;
  const kb = e.detail === 0 && e.target.closest('.lb-sp'), kit = kb && L3.items.get(kb.dataset.id);
  const hit = kit ? { item: kit, part: 'nose' } : l3PickHit(e.clientX, e.clientY); if (!hit) return; const it = hit.item;
  if (it.kind === 'book') { bookPopup(it.b); return; }
  const sp = $('.lb-sp[data-id="' + it.id + '"]'); if (!sp) return;
  if (SH.edit) { decorPopup(sp); return; }
  l3DecorClick(it, e, sp, hit.part);
}
function l3DecorClick(it, e, sp, part) {
  const T3 = DECOR3[it.d.type];
  if (T3 && T3.onClick) { T3.onClick(it, l3Api(it), e, part); return; }
  const g = it.grp; l3Anim(0.5, u => { g.position.z = it.bz + Math.sin(u * Math.PI) * 14; });   // ideiglenes: kis ugrás
}
function l3Api(it) {
  const d = it.d, st = (it.st = it.st || { n: 0, last: 0 });
  return { st: st, anim: l3Anim, seq: l3Seq, inv: l3Inv, item: it, toggle: () => { d.off = !d.off; if (!d.off) delete d.off; persist(); return !d.off; }, on: !d.off, linked: () => Array.from(L3.items.values()).filter(x => x.d && d.link && x.d.link === d.link && x !== it) };
}
function l3Focus(e) { const sp = e.target.closest && e.target.closest('.lb-sp'); const it = sp && L3.items.get(sp.dataset.id); if (it) { L3.foc = it; it.ht = 1; l3Inv(); } }
function l3Blur(e) { const it = L3.foc; L3.foc = null; if (it && it !== L3.hov) { it.ht = 0; l3Inv(); } }

/* ---------- csatolás a Könyvtár nézethez ---------- */
function l3Mount(root) {
  if (!l3Init()) return false;
  L3.box = $('.lb-shelves', root); L3.on = true; L3.cv.style.display = 'block'; L3.lastW = root.clientWidth;
  l3Fit(root);
  L3.box.addEventListener('pointermove', l3Move); L3.box.addEventListener('pointerleave', l3Leave); L3.box.addEventListener('click', l3Click); L3.box.addEventListener('pointerdown', l3Down); L3.box.addEventListener('touchmove', e => { if (DND.s && DND.s.l3 && DND.s.on) e.preventDefault(); }, { passive: false });
  root.addEventListener('focusin', l3Focus); root.addEventListener('focusout', l3Blur);
  l3Sync(); l3IdleStart();
  return true;
}

/* ---------- láthatatlan, de használható (billentyű, képernyőolvasó) réteg ---------- */
function l3SlotEl(b, picked) {
  return h('button', { type: 'button', class: 'lb-sp' + (picked ? ' picked' : '') + (b.status === 'olvasom' ? ' reading' : b.status === 'elolvastam' ? ' done' : ''), dataset: { id: b.id }, title: b.title + (b.author ? ' – ' + b.author : '') + (picked ? ' (a dobásból kiválasztva)' : ''), 'aria-label': b.title + (b.author ? ', ' + b.author : '') + (picked ? ' (kiválasztva)' : '') });
}
function l3DecorEl(d) {
  const T = DECOR[d.type], ds = { id: d.id, type: d.type }; if (d.link) ds.link = d.link;
  return h('button', { type: 'button', class: 'lb-sp lb-deco dc-' + d.type + (d.off ? ' is-off' : ''), dataset: ds, title: T.hint, 'aria-label': T.name + '. ' + T.hint });
}

/* ---------- húzás 3D-ben („Átrendezés” mód): a könyv felemelkedik, követi az egeret, a szomszédok félrecsúsznak ---------- */
function l3World(x, y, z) {   // képernyő-pont → világ-pont a z síkon
  const c = l3Cam(), nd = new THREE.Vector2(x / c.vw * 2 - 1, -(y / c.vh) * 2 + 1); L3.ray.setFromCamera(nd, L3.cam);
  const o = L3.ray.ray.origin, d = L3.ray.ray.direction, t = (z - o.z) / d.z; return new THREE.Vector3(o.x + d.x * t, o.y + d.y * t, z);
}
function l3Down(e) {
  if (!SH.edit || e.button !== 0 || DND.s || !e.target.closest || !e.target.closest('.lb-frame')) return;
  const it = l3Pick(e.clientX, e.clientY); if (!it) return;
  const s = DND.s = { l3: true, id: it.id, it: it, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, touch: e.pointerType === 'touch', tgt: null, last: '', tilt: 0, px: e.clientX, cancel: false };
  if (s.touch) s.lp = setTimeout(() => { if (DND.s === s && !s.on) l3DndBegin(); }, 320);
  addEventListener('pointermove', l3DndMove); addEventListener('pointerup', l3DndEnd); addEventListener('pointercancel', l3DndEnd); addEventListener('keydown', l3DndKey, true);
}
function l3DndOff() { removeEventListener('pointermove', l3DndMove); removeEventListener('pointerup', l3DndEnd); removeEventListener('pointercancel', l3DndEnd); removeEventListener('keydown', l3DndKey, true); }
function l3DndMove(e) {
  const s = DND.s; if (!s || !s.l3) return;
  s.x = e.clientX; s.y = e.clientY;
  if (s.on) return;
  const mv = Math.hypot(s.x - s.x0, s.y - s.y0);
  if (s.touch) { if (mv > 9) { clearTimeout(s.lp); l3DndOff(); DND.s = null; } return; }
  if (mv >= 6) l3DndBegin();
}
function l3DndBegin() {
  const s = DND.s; if (!s) return; s.on = true; DND.dragged = true; document.documentElement.classList.add('dragging');
  const it = s.it, cg = it.grp.parent, w = new THREE.Vector3(); it.grp.getWorldPosition(w);
  it.drag = true; it.hv = it.ht = 0; it.tx = null; L3.scene.add(it.grp); it.grp.position.copy(w); it.grp.rotation.set(0.1, 0, 0); L3.hov = null;
  s.si = it.shelf; s.idx = S.shelves[it.shelf].ids.indexOf(it.id); s.pz = w.z; l3Inv();
}
function l3DndKey(e) { if (e.key === 'Escape' && DND.s && DND.s.l3) { e.preventDefault(); e.stopPropagation(); DND.s.cancel = true; l3DndEnd(e); } }
function l3DndStep(dt) {
  const s = DND.s, it = s.it, vh = innerHeight;
  if (s.y < 90) scrollBy(0, -Math.ceil((90 - s.y) / 4)); else if (s.y > vh - 90) scrollBy(0, Math.ceil((s.y - (vh - 90)) / 4));
  const P = l3World(s.x, s.y, 64), k = 1 - Math.pow(0.0003, dt), g = it.grp;
  g.position.x += (P.x - g.position.x) * k; g.position.y += (P.y - it.h * 0.55 - g.position.y) * k; g.position.z += (64 - g.position.z) * k;
  const tl = Math.max(-0.28, Math.min(0.28, (s.x - s.px) * -0.012)); s.px = s.x; s.tilt += (tl - s.tilt) * 0.2; g.rotation.z = s.tilt;
  const key = Math.round(s.x) + ',' + Math.round(s.y) + ',' + Math.round(scrollY);
  if (key !== s.last) { s.last = key; l3DndTarget(s); }
}
function l3DndTarget(s) {   // melyik polc, melyik szint, hányadik helyre esne a könyv
  const K = L3K, W0 = l3World(s.x, s.y, 0), px = W0.x, py = -W0.y;
  let si = -1, best = 1e9;
  L3.rects.forEach((r, i) => { const dx = Math.max(r.x - px, 0, px - (r.x + r.W)), dy = Math.max(r.y - py, 0, py - (r.y + r.H)), d = Math.hypot(dx, dy); if (d < best) { best = d; si = i; } });
  if (si < 0 || best > 160) return;
  const r = L3.rects[si], lay = L3.lays[si], lh = lay.lh, lvl = Math.max(0, Math.min(lay.levels - 1, Math.floor((py - r.y - K.TOPH) / lh))), lx = px - r.x;
  const ids = S.shelves[si].ids.filter(id => id !== s.id); let idx = ids.length;
  for (let i = 0; i < ids.length; i++) { const it = L3.items.get(ids[i]); if (!it) continue; const cl = it.tl != null ? it.tl : it.lvl, cx = it.tx != null ? it.tx : it.bx; if (cl > lvl || (cl === lvl && cx - K.SIDE > lx - K.SIDE + 0)) { idx = i; break; } }
  if (si === s.si && idx === s.idx) return;
  s.si = si; s.idx = idx; l3Preview(s);
}
function l3Preview(s) {   // a szomszédok az új elrendezés szerint odébb csúsznak
  const K = L3K;
  S.shelves.forEach((sh, si) => {
    const lay0 = L3.lays[si]; if (!lay0) return;
    let ids = sh.ids.filter(id => id !== s.id); if (si === s.si) ids.splice(s.idx, 0, s.id);
    const lay = l3Layout({ ids: ids }, lay0.W - 2 * K.SIDE - 4, lay0.lh);
    if (lay.levels > lay0.levels) { if (si === s.si) s.bad = true; return; }
    if (si === s.si) s.bad = false;
    lay.items.forEach(x => { const it = L3.items.get(x.id); if (!it) return; if (x.id === s.id) { s.slot = { si: si, x: K.SIDE + 2 + x.x + x.w / 2, y: -(K.TOPH + (x.lvl + 1) * lay0.lh) + K.BOARD }; return; } it.tx = K.SIDE + 2 + x.x + x.w / 2; it.ty = -(K.TOPH + (x.lvl + 1) * lay0.lh) + K.BOARD; it.tl = x.lvl; });
  });
  l3Inv();
}
function l3DndEnd(e) {
  const s = DND.s; l3DndOff(); clearTimeout(s && s.lp);
  if (!s || !s.l3) { DND.s = null; return; }
  DND.s = null;
  if (!s.on) return;
  document.documentElement.classList.remove('dragging'); setTimeout(() => { DND.dragged = false; }, 0);
  const abort = s.cancel || (e && e.type === 'pointercancel') || s.bad;
  const it = s.it, g = it.grp, finish = () => {
    if (!abort) { S.shelves.forEach(sh => { sh.ids = sh.ids.filter(id => id !== s.id); }); S.shelves[s.si].ids.splice(s.idx, 0, s.id); persist(); }
    drawLibrary(); const f = $('.lb-sp[data-id="' + s.id + '"]'); if (f && !abort) f.focus({ preventScroll: true });
  };
  if (abort || !s.slot || !L3.rects[s.slot.si]) { finish(); return; }
  const r = L3.rects[s.slot.si], from = g.position.clone(), to = new THREE.Vector3(r.x + s.slot.x, -r.y + s.slot.y, it.bz), rz = g.rotation.z;
  l3Anim(0.16, u => { const v = 1 - Math.pow(1 - u, 3); g.position.lerpVectors(from, to, v); g.rotation.z = rz * (1 - v); g.rotation.x = 0.1 * (1 - v); }, finish);
}

/* ---------- animáció-segédek: könnyítések + egymás után futó lépések (tween-sor) ---------- */
const l3Ease = {
  lin: u => u, out: u => 1 - Math.pow(1 - u, 3), in: u => u * u * u, io: u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  back: u => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }, bounce: u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + 0.75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + 0.9375; return n * (u -= 2.625 / d) * u + 0.984375; },
  wob: u => Math.sin(u * Math.PI * 6) * (1 - u)
};
function l3Seq() {   // sor.to(obj, {x: cél}, mp, könnyítés).wait(mp).call(fn).play()
  const q = [], me = { dead: false, q: false };
  me.quiet = () => { me.q = true; return me; };   // a lépések nem rajzoltatják újra az árnyékot (l3Anim quiet)
  me.to = (o, p, d, ez) => { q.push({ k: 'to', o: o, p: p, d: d, ez: l3Ease[ez || 'io'] }); return me; };
  me.wait = d => { q.push({ k: 'wait', d: d }); return me; };
  me.call = f => { q.push({ k: 'call', f: f }); return me; };
  me.stop = () => { me.dead = true; };
  me.play = done => {
    let i = 0;
    const next = () => {
      if (me.dead) return; const s = q[i++]; if (!s) { if (done) done(); return; }
      if (s.k === 'call') { s.f(); next(); return; }
      if (s.k === 'wait') { l3Anim(s.d, () => { }, next, me.q); return; }
      const from = {}; for (const k in s.p) from[k] = s.o[k];
      l3Anim(s.d, u => { if (me.dead) return; const v = s.ez(u); for (const k in s.p) s.o[k] = from[k] + (s.p[k] - from[k]) * v; if (s.o.__apply) s.o.__apply(); }, next, me.q);
    };
    next(); return me;
  };
  return me;
}
const l3Lerp = (a, b, t) => a + (b - a) * t;
const lc = hex => { const c = l3Col(hex); return [c.r, c.g, c.b]; };
const l3Smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function l3Sprite(tex, color, size, opacity) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: color, transparent: true, opacity: opacity == null ? 1 : opacity, depthWrite: false, toneMapped: false })); m.scale.set(size, size, 1); return m;
}
function l3HeartTex() {
  if (L3.heart) return L3.heart; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#ff5c8a'; g.strokeStyle = 'rgba(140,20,60,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(4, 34, 10, 8, 32, 20); g.bezierCurveTo(54, 8, 60, 34, 32, 54); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(21, 22, 5, 3, -0.6, 0, 6.283); g.fill();
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return (L3.heart = t);
}


/* ---------- „élet”: időnként valamelyik látható dísz magától megmozdul (pislog, füstöl, farkát rángatja) ---------- */
function l3IdleStart() {
  clearTimeout(L3.idleT);
  const tick = () => {
    if (!L3.on) return;
    if (motionOK() && !S.settings.lite && !document.hidden && !SH.edit && !DND.s) {
      const vh = innerHeight, c = L3.box ? L3.box.getBoundingClientRect() : null, vis = [];
      L3.items.forEach(it => { if (it.ctl && it.ctl.idle && c) { const r = L3.rects[it.shelf]; if (r) { const top = c.top + r.y, bot = top + r.H; if (bot > 0 && top < vh) vis.push(it); } } });
      if (vis.length) vis[Math.floor(Math.random() * vis.length)].ctl.idle();
    }
    L3.idleT = setTimeout(tick, 2600 + Math.random() * 4600);
  };
  L3.idleT = setTimeout(tick, 1800);
}
