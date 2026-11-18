/* ===== 3D díszek közös eszköztára: textúrák (canvas/SVG), kis építőelemek, fények, állapot-segéd ===== */
'use strict';

/* canvas → textúra */
function kCache(key, fn) { L3.kc = L3.kc || {}; return L3.kc[key] || (L3.kc[key] = fn()); }
function kTex(w, h, draw, key) {
  if (key) return kCache('tex:' + key, () => kTex(w, h, draw));
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
/* SVG → textúra (aszinkron: betöltés után frissül a síkon) */
function kSvgPlane(inner, vb, w, h, pw, ph, opt) {
  const T = THREE; opt = opt || {};
  const mat = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, side: T.DoubleSide });
  const geo = new T.PlaneGeometry(w, h); if (opt.dx || opt.dy) geo.translate(opt.dx || 0, opt.dy || 0, 0);
  const m = new T.Mesh(geo, mat); m.visible = false;
  const ck = opt.key && L3.kc && L3.kc['svg:' + opt.key];
  if (ck) { mat.map = ck; m.visible = !opt.hidden; m.userData.ready = true; if (opt.onReady) opt.onReady(m); return m; }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + pw + '" height="' + ph + '">' + inner + '</svg>', img = new Image();
  img.onload = () => { const c = document.createElement('canvas'); c.width = pw; c.height = ph; c.getContext('2d').drawImage(img, 0, 0, pw, ph); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; mat.map = t; mat.needsUpdate = true; if (opt.key) { L3.kc = L3.kc || {}; L3.kc['svg:' + opt.key] = t; } m.visible = opt.hidden ? false : true; m.userData.ready = true; if (opt.onReady) opt.onReady(m); l3Inv(); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return m;
}
/* egy álló (z irányban lapos) SVG-textúrás sík azonosítóval a gyorsítótárhoz */
function kGlowSprite(color, size, opacity, additive) {
  const sp = l3Sprite(l3Glow(), color, size, opacity == null ? 1 : opacity); if (additive !== false) sp.material.blending = THREE.AdditiveBlending; sp.renderOrder = 5; return sp;
}
function kLight(parent, color, intensity, dist, x, y, z) {   // pont-fény (Kímélő/gyenge gépen kihagyva)
  if (L3.lowq || (L3.lite)) return null;
  const l = new THREE.PointLight(color, intensity, dist, 1.6); l.position.set(x, y, z); parent.add(l); return l;
}
const kBox = (w, h, d, mat, parent, x, y, z, part) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (part) m.userData.part = part; parent.add(m); return m; };
function kLathe(pts, seg, mat, parent, part) {
  const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg || 24), m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; if (part) m.userData.part = part; if (parent) parent.add(m); return m;
}
/* sík négyszög a 4 sarokból (a,b,c,d körüljárásban); uv-k a sarkokból */
function kQuad(p, mat, parent, opt) {
  opt = opt || {};
  const g = new THREE.BufferGeometry(), pos = new Float32Array([p[0][0], p[0][1], p[0][2], p[1][0], p[1][1], p[1][2], p[2][0], p[2][1], p[2][2], p[3][0], p[3][1], p[3][2]]);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2)); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  if (opt.vcol) g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(opt.vcol), 3));
  const m = new THREE.Mesh(g, mat); m.receiveShadow = !!opt.recv; if (opt.part) m.userData.part = opt.part; if (parent) parent.add(m); return m;
}
/* a szerkezet vonalai (vékony sötét vonalak) */
function kLines(pts, color, parent, opacity) {
  const g = new THREE.BufferGeometry(), a = []; pts.forEach(p => a.push(p[0], p[1], p[2])); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
  const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: color, transparent: opacity != null, opacity: opacity == null ? 1 : opacity })); if (parent) parent.add(m); return m;
}
/* bármely állapot-objektumhoz: S.__apply az l3Seq-tween-ek után hívódik */
function kState(init, apply) { const S = Object.assign({}, init); S.__apply = () => apply(S); return S; }
/* gyors, ismétlődő rezgés (zaj): a nagyságrend t-ben lecseng */
const kNoise = t => Math.sin(t * 37.1) * 0.5 + Math.sin(t * 23.7 + 1.3) * 0.35 + Math.sin(t * 61.3 + 0.4) * 0.15;
/* a „csak a nézet szerinti oldalról látszó” vizsgálatot a pick-hez: láthatatlan kattintási gömb */
function kHit(parent, r, x, y, z, part) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); m.visible = false; m.position.set(x, y, z); m.userData.part = part; parent.add(m); return m; }
/* a dísz gyökere: a modell-egységekből (viewBox-magasság vh) a polc-pixelekre skáláz */
function kRoot(it, vh) { const g = new THREE.Group(), r = new THREE.Group(); r.scale.setScalar(it.h / vh); g.add(r); return { g: g, r: r, s: it.h / vh }; }
function kMatsAll(o) { const a = []; for (const k in o) if (o[k] && o[k].dispose) a.push(o[k]); return a; }

/* a pont (kép-px) iránya egy 3D objektumhoz képest: {x,y} ∈ [-1,1] (távolsággal csillapítva); p=null → 0 */
function kLookVec(obj, p, range) {
  if (!p || SH.edit) return { x: 0, y: 0 };
  const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(L3.cam); const c = l3Cam(), ex = (v.x * 0.5 + 0.5) * c.vw, ey = (-v.y * 0.5 + 0.5) * c.vh, dx = p.x - ex, dy = p.y - ey, d = Math.hypot(dx, dy) || 1, f = Math.min(1, d / (range || 170));
  return { x: dx / d * f, y: dy / d * f };
}
/* anyag „puha műanyag/vinyl” játék-figurákhoz */
const kVinyl = (color, o) => l3Mat(Object.assign({ color: color, roughness: 0.46, metalness: 0, clear: 1, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 0.75 }, o || {}));
/* fényes fekete gyöngyszem két fényfolttal; a csoport z-ben lapított */
function kBead(parent, x, y, z, r, flat) {
  const T = THREE, g = new T.Group(); g.position.set(x, y, z); g.scale.z = flat || 0.7;
  const b = new T.Mesh(new T.SphereGeometry(r, 16, 12), kBead.mat || (kBead.mat = new T.MeshPhysicalMaterial({ color: 0x07060a, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 })));
  g.add(b);
  const h1 = new T.Mesh(new T.SphereGeometry(r * 0.3, 8, 6), kBead.w || (kBead.w = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }))); h1.position.set(r * 0.34, r * 0.4, r * 0.82 / (flat || 0.7)); g.add(h1);
  const h2 = new T.Mesh(new T.SphereGeometry(r * 0.15, 8, 6), kBead.w); h2.position.set(-r * 0.3, -r * 0.34, r * 0.88 / (flat || 0.7)); g.add(h2);
  parent.add(g); return g;
}
/* betű/„Z” sprite (alvás) */
function kZTex() { return kTex(64, 64, (g, W, H) => { g.font = 'bold 46px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(40,50,110,.85)'; g.strokeText('z', 32, 34); g.fillStyle = '#e8eeff'; g.fillText('z', 32, 34); }, 'z'); }
