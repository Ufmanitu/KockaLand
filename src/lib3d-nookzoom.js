/* ===== Book nook: ráközelítés – a kis világ felnagyul, és bele lehet nézni a szobába =====
   Kattintás a polcon álló szobára → átlátszó, saját WebGL-vászon nő ki a doboz helyéről (FLIP), a kamera betolódik a szobába (dolly-zoom).
   Az egérrel körbe lehet nézni, a tárgyakra kattintva: lámpa (kapcsol, mentődik), kandalló (fellobban), ablak (hullócsillag, függöny), cica, földgömb, növény, fotel, óra.
   Bezárás: ×, Esc, a vászonon kívüli kattintás. A vászon és minden hozzá tartozó GPU-erőforrás bezáráskor felszabadul. */
'use strict';

const NKZ = { o: null };
const NK_BAR = [['sw', '💡', 'Lámpa'], ['fire', '🔥', 'Kandalló'], ['window', '🌙', 'Ablak'], ['cat', '🐱', 'Cica'], ['globe', '🌍', 'Földgömb'], ['plant', '🪴', 'Növény'], ['chair', '🛋️', 'Fotel'], ['clock', '🕰️', 'Óra']];

function nkEnv(r) {   // meleg softbox-ok egy kis stúdióban (mint a fő színtéren), a saját rendererhez
  const T = THREE, es = new T.Scene(); es.background = new T.Color(0x20140d);
  const sb = (w, hh, x, y, z, k, c) => { const m = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
  sb(12, 8, -9, 8, 9, 6, 0xffe2bd); sb(10, 6, 10, 3, 7, 2.4, 0xfff0e0); sb(16, 2, 0, 11, 0, 4, 0xffffff); sb(24, 10, 0, -7, -8, 0.7, 0x7a4a2a);
  const pm = new T.PMREMGenerator(r), t = pm.fromScene(es, 0.03).texture; pm.dispose(); return t;
}

function nkZoomOpen(it, A) {
  if (NKZ.o || !window.THREE) return;
  const T = THREE, W = NK.W, H = NK.H, D = NK.D;
  const sp = $('.lb-sp[data-id="' + it.id + '"]'), from = sp ? sp.getBoundingClientRect() : null, prevFocus = document.activeElement;
  let r;
  try { r = new T.WebGLRenderer({ antialias: !L3.lowq, alpha: true, powerPreference: 'high-performance' }); } catch (e) { console.error(e); return; }
  const ctxOK = r.getContext && r.getContext(); if (!ctxOK) return;
  r.setClearColor(0x000000, 0); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.12;
  r.shadowMap.enabled = !L3.lowq; r.shadowMap.type = T.PCFShadowMap;
  const scene = new T.Scene(); scene.environment = nkEnv(r);
  scene.add(new T.HemisphereLight(0xfff0dc, 0x6a4326, 0.55));
  const key = new T.DirectionalLight(0xffe2bc, 0.95); key.position.set(-70, 130, 170); key.target.position.set(0, 40, -40); scene.add(key, key.target);
  if (!L3.lowq) { key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.radius = 1.8; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.6; const sc = key.shadow.camera; sc.left = -110; sc.right = 110; sc.top = 110; sc.bottom = -110; sc.near = 20; sc.far = 520; sc.updateProjectionMatrix(); }
  const fill = new T.DirectionalLight(0xbcd0ff, 0.2); fill.position.set(80, 40, 120); scene.add(fill);
  const root = new T.Group(); scene.add(root);
  const AS = nkAssemble(root, it, 'zoom'), R = AS.R, ctl = R.ctl, parts = AS.parts;
  const cam = new T.PerspectiveCamera(20, 1.3, 4, 1400), rc = new T.Raycaster(), ndc = new T.Vector2();

  /* DOM */
  const el = document.createElement('div'); el.className = 'nkz'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Book nook – a mini szoba');
  const bg = document.createElement('div'); bg.className = 'nkz-bg';
  const stage = document.createElement('div'); stage.className = 'nkz-stage'; const cv = r.domElement; cv.className = 'nkz-cv'; stage.appendChild(cv);
  const tip = document.createElement('div'); tip.className = 'nkz-tip'; tip.hidden = true; stage.appendChild(tip);
  const x = document.createElement('button'); x.type = 'button'; x.className = 'nkz-x'; x.setAttribute('aria-label', 'Bezárás'); x.textContent = '×';
  const bar = document.createElement('div'); bar.className = 'nkz-bar';
  const hint = document.createElement('div'); hint.className = 'nkz-hint'; hint.textContent = 'Mozgasd az egeret (vagy húzd az ujjad): körbenézhetsz · kattints a tárgyakra · Esc: vissza a polcra';
  el.appendChild(bg); el.appendChild(stage); el.appendChild(bar); el.appendChild(hint); el.appendChild(x); document.body.appendChild(el); document.documentElement.classList.add('nkz-open');

  const Z = { ctl: ctl, r: r, el: el, p: 0, pt: 1, t: 0, lx: 0, ly: 0, tx: 0, ty: 0, closing: false, loop: null }; NKZ.o = Z;
  const size = () => {
    const mw = innerWidth - 24, mh = innerHeight - (innerWidth < 640 ? 150 : 120), w = Math.max(240, Math.min(mw, mh * 1.3)), h = Math.round(w / 1.3);
    stage.style.width = w + 'px'; stage.style.height = h + 'px'; r.setPixelRatio(L3.lowq ? 1 : Math.min(devicePixelRatio || 1, 1.5)); r.setSize(w, h, false); cv.style.width = w + 'px'; cv.style.height = h + 'px'; cam.aspect = w / h; cam.updateProjectionMatrix(); Z.w = w; Z.h = h;
  };
  size(); Z.b = stage.getBoundingClientRect();
  const flip = rev => {   // a polcon álló doboz helyéről nő ki (vagy oda zsugorodik vissza)
    const b = Z.b; stage.style.transformOrigin = '0 0';
    const s = from ? Math.max(0.05, from.height / b.height) : 0.3, dx = from ? from.left + from.width / 2 - (b.left + b.width * s / 2) : 0, dy = from ? from.top + from.height / 2 - (b.top + b.height * s / 2) : 0;
    return 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
  };
  const motion = motionOK();
  stage.style.transform = motion ? flip() : 'none'; if (!motion) { Z.p = 1; el.classList.add('on'); }
  requestAnimationFrame(() => requestAnimationFrame(() => { if (Z.closing) return; el.classList.add('on'); stage.style.transform = 'none'; }));

  /* kamera: a kezdőnézet a polcon álló dobozé (szűk látószög, messziről), a végállás a szobában */
  const C0 = { p: [0, 56, 6 + 56 / Math.tan(10 * Math.PI / 360 * 2)], t: [0, 56, 6], f: 20 }, C1 = { p: [0, 50, 40], t: [0, 42, -50], f: 62 };
  const lv = new T.Vector3(), io = l3Ease.io;
  const setCam = () => {
    const e = io(Math.max(0, Math.min(1, Z.p))), L = (a, b) => a + (b - a) * e, lk = e;
    const f = L(C0.f, C1.f), kd = Math.pow(e, 0.8);
    cam.fov = f; cam.position.set(L(C0.p[0], C1.p[0]) + Z.lx * 16 * lk, L(C0.p[1], C1.p[1]) - Z.ly * 7 * lk, L(C0.p[2], C1.p[2]) + 0 * kd);
    lv.set(L(C0.t[0], C1.t[0]) + Z.lx * 10 * lk, L(C0.t[1], C1.t[1]) - Z.ly * 4 * lk, L(C0.t[2], C1.t[2])); cam.lookAt(lv); cam.updateProjectionMatrix();
  };
  setCam();

  /* érintkezés: sugár a tárgyakra */
  const pick = ev => {
    const b = cv.getBoundingClientRect(); ndc.set(((ev.clientX - b.left) / b.width) * 2 - 1, -((ev.clientY - b.top) / b.height) * 2 + 1); rc.setFromCamera(ndc, cam);
    const hs = rc.intersectObjects(parts, false); for (let i = 0; i < hs.length; i++) { const pt = hs[i].object.userData.part; if (pt && pt !== 'room' && pt !== 'box') return { part: pt, point: hs[i].point }; if (pt === 'room' || pt === 'box') return null; } return null;
  };
  const act = (part, point) => {
    switch (part) {
      case 'sw': { const on = A.toggle(); ctl.lit(on); if (it.ctl && it.ctl.lit) it.ctl.lit(on); break; }
      case 'fire': ctl.blaze(); break;
      case 'window': ctl.shoot(); break;
      case 'cat': ctl.wake(); break;
      case 'globe': ctl.spin(); break;
      case 'plant': ctl.rustle(); break;
      case 'chair': ctl.fluff(); break;
      case 'clock': ctl.chime(); break;
      case 'shelf': if (point) { const p = R.g.worldToLocal(point.clone()); for (let i = 0; i < 6; i++) setTimeout(() => drParticle(R.g, 'spark', p.clone(), { vx: (Math.random() - 0.5) * 18, vy: 6 + Math.random() * 14, vz: Math.random() * 10, life: 0.9 }), i * 50); } break;
      case 'rug': if (point) { const p = R.g.worldToLocal(point.clone()); for (let i = 0; i < 3; i++) setTimeout(() => drParticle(R.g, 'smoke', p.clone().add(new T.Vector3((Math.random() - 0.5) * 6, 1, (Math.random() - 0.5) * 6)), { vy: 6, life: 1.2, big: 0.6 }), i * 120); } break;
    }
  };
  Z.act = act;
  let hovPart = null;
  const onMove = ev => {
    const b = stage.getBoundingClientRect(); Z.tx = Math.max(-1, Math.min(1, ((ev.clientX - (b.left + b.width / 2)) / (b.width / 2)))); Z.ty = Math.max(-1, Math.min(1, ((ev.clientY - (b.top + b.height / 2)) / (b.height / 2))));
    if (Z.p < 0.9 || ev.pointerType === 'touch') return;
    const h = pick(ev), pt = h && h.part; if (pt !== hovPart) { hovPart = pt; cv.style.cursor = pt ? 'pointer' : 'default'; }
    if (pt && NK_LABEL[pt]) { tip.hidden = false; tip.textContent = NK_LABEL[pt]; const sb = stage.getBoundingClientRect(); tip.style.left = Math.min(sb.width - 60, Math.max(4, ev.clientX - sb.left + 12)) + 'px'; tip.style.top = Math.max(4, ev.clientY - sb.top - 30) + 'px'; } else tip.hidden = true;
  };
  const onClick = ev => { if (Z.closing || Z.p < 0.9) return; const h = pick(ev); if (h) act(h.part, h.point); };
  cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', () => { tip.hidden = true; hovPart = null; Z.tx = Z.ty = 0; }); cv.addEventListener('click', onClick);
  NK_BAR.forEach(b => { const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'nkz-b'; bt.innerHTML = '<span aria-hidden="true">' + b[1] + '</span> ' + b[2]; bt.addEventListener('click', () => { if (!Z.closing) act(b[0], null); }); bar.appendChild(bt); });
  bg.addEventListener('click', () => close()); el.addEventListener('click', ev => { if (ev.target === el) close(); }); x.addEventListener('click', () => close());
  const onKey = ev => {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); }
    else if (ev.key === 'Tab') { const f = Array.from(el.querySelectorAll('button')), i = f.indexOf(document.activeElement); ev.preventDefault(); f[(i + (ev.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
  };
  const onSize = () => { size(); if (!Z.closing) { stage.style.transform = 'none'; Z.b = stage.getBoundingClientRect(); } };
  document.addEventListener('keydown', onKey, true); addEventListener('resize', onSize);

  /* ciklus: a fő ciklus órájára ül (L3.anims), a fő színtér közben nem rajzol (L3.hold) */
  L3.hold = true;
  l3Anim(1e9, (u, dt) => {
    if (Z.dead) return;
    Z.t += dt; const dd = Z.pt - Z.p; if (dd !== 0) Z.p += Math.sign(dd) * Math.min(Math.abs(dd), dt / (motion ? 1.15 : 0.01)); if (Z.pt === Z.p && Z.closing) { finish(); return; }
    const k = 1 - Math.pow(0.003, dt); Z.lx += (Z.tx - Z.lx) * k; Z.ly += (Z.ty - Z.ly) * k;
    ctl.tick(Z.t); setCam(); r.render(scene, cam);
  });
  Z.loop = L3.anims[L3.anims.length - 1];
  setTimeout(() => { if (!Z.closing && x.focus) x.focus(); }, motion ? 700 : 0);

  function close() {
    if (Z.closing) return; Z.closing = true; Z.pt = 0; tip.hidden = true; el.classList.remove('on'); el.classList.add('out');
    if (motion) stage.style.transform = flip(true); else finish();
  }
  function finish() {
    if (Z.dead) return; Z.dead = true;
    const i = L3.anims.indexOf(Z.loop); if (i >= 0) L3.anims.splice(i, 1);
    document.removeEventListener('keydown', onKey, true); removeEventListener('resize', onSize);
    el.remove(); document.documentElement.classList.remove('nkz-open'); L3.hold = false; NKZ.o = null;
    const gs = new Set(Object.keys(L3.geo || {}).map(k => L3.geo[k]));
    root.traverse(o => { if (o.geometry && !gs.has(o.geometry) && !(o.geometry.userData && o.geometry.userData.shared)) o.geometry.dispose(); });
    kMatsAll(R.M).forEach(m => m.dispose()); if (scene.environment) scene.environment.dispose();
    r.dispose(); if (r.forceContextLoss) r.forceContextLoss();
    if (prevFocus && prevFocus.focus && document.contains(prevFocus)) try { prevFocus.focus({ preventScroll: true }); } catch (e) { }
    l3Inv();
  }
}
