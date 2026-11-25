/* ===== 3D dísz: fekvő sárkány a könyvhalmon (sarkany-fekvo). A fekete, fújó sárkány (kis-sarkany): lib3d-fly.js (közös fej-szerelvény: dgHeadRig) =====
   v13: teljes átépítés – felemelt nyak és fej (olvasható sziluett), ék alakú fej szemöldök-gerinccel és résnyi pupillájú, nehéz szemhéjú szemmel,
   izmos láb/comb, hasi lemezek (valódi dombormű), pikkely-bump + „sütött” AO (SDF-mintavétel) csúcsszínekben, nyújtott szárny csontokkal,
   ráncolt hártyával és íves élekkel, sötét bőrkötetű könyvhalom aranyozott, címkézett gerinccel.
   Modell-egységek: a dísz alja a polcon, X jobbra, Y fel, Z a néző felé; kRoot(it, DG_VH) skáláz. */
'use strict';

const DG_VH = 124;
const dgC = {};
function dgColInit() {
  if (dgC.back) return;
  Object.assign(dgC, { back: lc('#150709'), body: lc('#560a15'), belly: lc('#55301f'), bellyD: lc('#744829'), mem0: lc('#1c050a'), mem1: lc('#5e0d1a'), memEdge: lc('#a3303a'), jawIn: lc('#6a1424'), hornB: lc('#241512'), hornT: lc('#c9b78e') });
}
const dgMix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dgSm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/* SDF-gradiens (felület-normál) */
function dgNormY(f, x, y, z) { const e = 0.8; const gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e), l = Math.hypot(gx, gy, gz) || 1; return [gx / l, gy / l, gz / l]; }
/* sütött ambient occlusion: a normál mentén mintavételezett SDF-ből (zugokban sötétebb) */
function dgAO(f, x, y, z, n) {
  let occ = 0, w = 1;
  for (let i = 1; i <= 4; i++) { const h = 0.5 + i * i * 0.55, d = f(x + n[0] * h, y + n[1] * h, z + n[2] * h); occ += Math.max(0, h - d) / h * w; w *= 0.62; }
  return Math.max(0.3, 1 - 0.5 * occ);
}
/* csúcsszín: a hát sötét, az oldal vörös, a has meleg bronz; zugokban AO. dorsal(x,y,n) a „hát felé” mutató összetevőt adja (nyakon más, mint a törzsön) */
function dgShade(f, cs, o) {
  o = o || {};
  return (x, y, z) => {
    const n = dgNormY(f, x, y, z), dd = o.dorsal ? o.dorsal(x, y, z, n) : n[1], up = dgSm(-0.15, 0.6, dd), dn = dgSm(0.12, 0.62, -n[1]) * (o.noBelly ? 0 : 1);
    let c = dgMix(cs.body, cs.back, up);
    if (dn > 0) c = dgMix(c, dgMix(cs.belly, cs.bellyD, dgSm(0.4, 0.95, dn)), dn);
    const ao = dgAO(f, x, y, z, n);
    return [c[0] * ao, c[1] * ao, c[2] * ao];
  };
}
/* felület-pont fentről (tüskék, páncél-lemezek): (x,z) fölül lefelé lépkedve */
function dgTop(f, x, z, y0, y1) {
  for (let y = y0; y > y1; y -= 0.6) if (f(x, y, z) < 0) { let a = y, b = y + 0.6; for (let i = 0; i < 6; i++) { const m = (a + b) / 2; if (f(x, m, z) < 0) a = m; else b = m; } const yy = (a + b) / 2, n = dgNormY(f, x, yy, z); return { p: [x, yy, z], n: n }; }
  return null;
}
function dgOrient(m, n) { const T = THREE, v = new T.Vector3(n[0], n[1], n[2]).normalize(); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v); }
/* tűzsugár: n db additív fénypamacs a from pontból a dir irányba (hossz len), sárga → narancs → vörös, nő a méret */
function dgJet(parent, from, dir, len, scale) {
  const T = THREE, d = dir.clone().normalize(), N = 15;
  for (let i = 0; i < N; i++) setTimeout(() => {
    if (!L3.on) return;
    const sp = l3Sprite(l3Glow(), 0xffffff, 8, 0); sp.material.blending = T.AdditiveBlending; sp.material.depthWrite = false; sp.renderOrder = 8; parent.add(sp);
    const c = new T.Color(); const life = 0.55 + Math.random() * 0.25, v = (len / life) * (0.75 + Math.random() * 0.5), wob = Math.random() * 6, sz = (6 + Math.random() * 3) * (scale || 1);
    l3Anim(life, u => {
      const t = u * life; sp.position.set(from.x + d.x * v * t + Math.sin(t * 9 + wob) * 1.4, from.y + d.y * v * t + 6 * t * t + Math.cos(t * 7 + wob) * 1.2, from.z + d.z * v * t);
      c.setRGB(1, 0.95 - u * 0.62, 0.55 - u * 0.5); sp.material.color.copy(c); sp.material.opacity = Math.min(1, u * 8) * (1 - u * u) * 0.95; const k = sz * (0.7 + u * 1.9); sp.scale.set(k, k, 1);
    }, () => { parent.remove(sp); sp.material.dispose(); });
  }, i * 38);
}
/* hártya: legyező a gyökértől az élpontokig, 3 gyűrűvel (színátmenet + enyhe ráncolás), kétoldalas; rip(i,k) a z-eltolás */
function dgFan(root, edge, c0, c1, mat, parent, rip, tipTint) {
  const T = THREE, n = edge.length, pos = [], col = [], idx = [], RK = [0.34, 0.68, 1];
  pos.push(root[0], root[1], root[2]); col.push(c0[0], c0[1], c0[2]);
  RK.forEach((k, li) => {
    for (let i = 0; i < n; i++) {
      const e = edge[i], z = root[2] + (e[2] - root[2]) * k + (rip ? rip(i, k) : 0) + li * 0.25;
      pos.push(root[0] + (e[0] - root[0]) * k, root[1] + (e[1] - root[1]) * k, z);
      const c = dgMix(c0, c1, k * k), tt = 1 + ((tipTint && tipTint(i)) - 1) * k * k; col.push(c[0] * tt, c[1] * tt, c[2] * tt);
    }
  });
  for (let i = 0; i < n - 1; i++) idx.push(0, 1 + i, 2 + i);
  for (let r = 0; r < 2; r++) for (let i = 0; i < n - 1; i++) { const a = 1 + r * n + i, b = a + 1, c = a + n, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
}
/* csont: vékony, enyhén ívelt cső a→b (b felé vékonyodik) */
function dgBone(a, b, r0, r1, mat, parent, bend) {
  const g = l3TubeGeo(8, 6), mid = [(a[0] + b[0]) / 2 + (bend ? bend[0] : 0), (a[1] + b[1]) / 2 + (bend ? bend[1] : 0), (a[2] + b[2]) / 2 + (bend ? bend[2] : 0)];
  l3TubeSet(g, t => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * mid[0] + t * t * b[0], u * u * a[1] + 2 * u * t * mid[1] + t * t * b[1], u * u * a[2] + 2 * u * t * mid[2] + t * t * b[2]]; }, t => r0 + (r1 - r0) * t, null, [0, 0, 1]);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; if (parent) parent.add(m); return m;
}
/* kapszula-lánc SDF (farok, nyak): pts = [[x,y,z,r],…] */
function dgChain(x, y, z, pts, k) {
  let d = 1e9; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], s = sdCone(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], a[3], b[3]); d = i ? smin(d, s, k) : s; } return d;
}
/* csúcsszín egy csőre a hossz mentén (szarv: sötét tő → csontszínű hegy) */
function dgTubeCol(g, fn) {
  const n = g.userData.n, m = g.userData.m, a = new Float32Array((n + 1) * (m + 1) * 3);
  for (let i = 0; i <= n; i++) { const c = fn(i / n); for (let j = 0; j <= m; j++) { const o = (i * (m + 1) + j) * 3; a[o] = c[0]; a[o + 1] = c[1]; a[o + 2] = c[2]; } }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
}
/* szem: sötét, fényes szemgolyó + íriszsapka (borostyán, függőleges résnyi pupilla) + két fényfolt + nehéz felső szemhéj; a csoport a szemgolyó közepe */
function dgIrisTex() {
  return kTex(256, 256, (g, W) => {
    const c = W / 2, gr = g.createRadialGradient(c, c, 4, c, c, c);
    gr.addColorStop(0, '#ffe9a0'); gr.addColorStop(0.35, '#ffc23a'); gr.addColorStop(0.72, '#d96a12'); gr.addColorStop(0.92, '#7a2208'); gr.addColorStop(1, '#1d0803');
    g.fillStyle = gr; g.fillRect(0, 0, W, W);
    g.strokeStyle = 'rgba(120,40,0,.35)'; g.lineWidth = 2; for (let i = 0; i < 56; i++) { const a = i / 56 * 6.283; g.beginPath(); g.moveTo(c + Math.cos(a) * 30, c + Math.sin(a) * 30); g.lineTo(c + Math.cos(a) * 112, c + Math.sin(a) * 112); g.stroke(); }
    const sl = g.createRadialGradient(c, c, 2, c, c, 46); sl.addColorStop(0, 'rgba(0,0,0,1)'); sl.addColorStop(0.7, 'rgba(0,0,0,1)'); sl.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.translate(c, c); g.scale(0.26, 1.55); g.translate(-c, -c); g.fillStyle = sl; g.beginPath(); g.arc(c, c, 46, 0, 6.283); g.fill(); g.restore();
  }, 'dgIris');
}
function dgEye(parent, x, y, z, r, M, yaw) {
  const T = THREE, g = new T.Group(); g.position.set(x, y, z); g.rotation.y = yaw || 0; parent.add(g);
  const ball = new T.Mesh(new T.SphereGeometry(r, 22, 16), M.rim); ball.scale.set(1, 0.96, 0.96); g.add(ball);
  const pg = new T.Group(); g.add(pg);
  const cg = new T.SphereGeometry(r * 1.012, 30, 14, 0, Math.PI * 2, 0, 0.95); cg.rotateX(Math.PI / 2);
  { const p = cg.attributes.position, uv = cg.attributes.uv, R = r * 1.012 * Math.sin(0.95); for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) / (2 * R), 0.5 + p.getY(i) / (2 * R)); uv.needsUpdate = true; }
  const iris = new T.Mesh(cg, M.iris); pg.add(iris);
  const h1 = new T.Mesh(new T.SphereGeometry(r * 0.2, 8, 6), M.glint); h1.position.set(r * 0.34, r * 0.38, r * 0.86); pg.add(h1);
  const h2 = new T.Mesh(new T.SphereGeometry(r * 0.1, 8, 6), M.glint); h2.position.set(-r * 0.24, -r * 0.32, r * 0.9); pg.add(h2);
  const pu = pg;
  const lid = new T.Group(); g.add(lid);
  const lm = new T.Mesh(new T.SphereGeometry(r * 1.13, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.lid); lm.castShadow = true; lid.add(lm);
  const arc = new T.Mesh(new T.TorusGeometry(r * 0.8, r * 0.09, 6, 16, Math.PI), M.line); arc.rotation.z = Math.PI; arc.position.set(0, r * 0.1, r * 0.94); arc.scale.y = 0.5; arc.visible = false; g.add(arc);
  return { g: g, pg: pg, pu: pu, lid: lid, arc: arc, r: r };
}

/* ---------- könyvhalom: sötét bőrkötetek aranyozott gerinccel (a gerinc a néző felé néz) ---------- */
function dgPagesTex() {
  return kTex(64, 64, (g, W, H) => { g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,92,52,.55)'; g.lineWidth = 1; for (let y = 2; y < H; y += 2.6) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }, 'dgPages');
}
const DG_BOOKS = [
  { c: '#4a0f1d', t: 'A SÁRKÁNY KÖNYVE', w: 212, h: 14, d: 112, x: 2, z: 10, ry: 0.0 },
  { c: '#1c1a2e', t: 'ÉJFÉLI MESÉK', w: 204, h: 12, d: 104, x: 0, z: 9, ry: 0.03 },
  { c: '#2f1d12', t: 'SÖTÉT LÁNGOK', w: 196, h: 11, d: 98, x: 6, z: 8, ry: -0.025 }
];
function dgSpineTex(b, i) {
  return kTex(1024, 128, (g, W, H) => {
    g.fillStyle = b.c; g.fillRect(0, 0, W, H);
    const rng = dcRng(30 + i); for (let k = 0; k < 2600; k++) { g.fillStyle = 'rgba(' + (rng() < 0.5 ? '255,235,210' : '0,0,0') + ',' + (0.025 + rng() * 0.06).toFixed(3) + ')'; g.fillRect(rng() * W, rng() * H, 1 + rng() * 5, 1 + rng() * 2); }
    const gold = g.createLinearGradient(0, 0, 0, H); gold.addColorStop(0, '#f1d78b'); gold.addColorStop(0.5, '#c79a3a'); gold.addColorStop(1, '#8a6420');
    g.fillStyle = gold; g.fillRect(0, 7, W, 3); g.fillRect(0, H - 10, W, 3); g.fillRect(0, 13, W, 1.4); g.fillRect(0, H - 15, W, 1.4);
    [0.11, 0.2, 0.8, 0.89].forEach(q => { const x = q * W; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x - 9, 0, 18, H); g.fillStyle = b.c; g.fillRect(x - 7, 0, 14, H); g.fillStyle = gold; g.fillRect(x - 6, 0, 3, H); g.fillRect(x + 3, 0, 3, H); g.fillRect(x - 1, 0, 2, H); });
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(W * 0.3, 20, W * 0.4, H - 40); g.strokeStyle = gold; g.lineWidth = 3; g.strokeRect(W * 0.3 + 2, 22, W * 0.4 - 4, H - 44);
    g.font = '600 50px Georgia, "Times New Roman", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(b.t, W / 2 + 2, H / 2 + 4); g.fillStyle = gold; g.fillText(b.t, W / 2, H / 2 + 2);
    [0.265, 0.735].forEach(q => { g.fillStyle = gold; g.beginPath(); g.moveTo(q * W, H / 2 - 12); g.lineTo(q * W + 9, H / 2); g.lineTo(q * W, H / 2 + 12); g.lineTo(q * W - 9, H / 2); g.fill(); });
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(255,255,255,.1)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
  }, 'dgSpine' + i);
}
function dgBook(parent, M, i, y) {
  const T = THREE, b = DG_BOOKS[i], g = new T.Group(); g.position.set(b.x, y + b.h / 2, b.z); g.rotation.y = b.ry; const cov = M.cov[i];
  const mk = (bw, bh, bd, mat, px, py, pz) => { const m = new T.Mesh(new T.BoxGeometry(bw, bh, bd), mat); m.position.set(px, py, pz); m.castShadow = true; m.receiveShadow = true; m.userData.part = 'book'; g.add(m); parts.push(m); return m; };
  const w = b.w, h = b.h, d = b.d, cb = 2.5;
  mk(w, cb, d, cov, 0, -h / 2 + cb / 2, 0); mk(w, cb, d, cov, 0, h / 2 - cb / 2, 0);                  // fedlap és hátlap
  mk(w - 3.5, h - 2 * cb + 0.4, d - 7, M.pages, 0, 0, -3.2);                                           // lapok (hátul, a gerinc ellenében)
  const sp = new T.Mesh(new T.BoxGeometry(w, h - 2 * cb + 0.4, 3.2), [cov, cov, cov, cov, M.spine[i], cov]); sp.position.set(0, 0, d / 2 - 1.6); sp.castShadow = true; sp.receiveShadow = true; sp.userData.part = 'book'; g.add(sp); parts.push(sp);
  mk(w - 3.5, h - 2 * cb + 0.4, 3, cov, 0, 0, -d / 2 + 1.5);                                          // hátsó borító-él
  parent.add(g); return g;
}

/* ---------- a fekvő sárkány: formák ---------- */
const DG_NECK = [[-30, 60, 7, 13.2], [-39, 68, 12, 11.4], [-46, 79, 16, 9.8], [-50, 90, 19, 8.7], [-51, 98, 21, 8.2]];
const dgE = (x, y, z, cx, cy, cz, rx, ry, rz) => sdEll(x - cx, y - cy, z - cz, rx, ry, rz);
function dgLieBody(x, y, z) {
  let d = dgE(x, y, z, -24, 55, 1, 24, 19.5, 21);                                                    // mellkas
  d = smin(d, dgE(x, y, z, 4, 53, 0, 30, 17.5, 20), 12);                                             // törzs
  d = smin(d, dgE(x, y, z, 38, 54, 1, 22, 18, 19.5), 10);                                            // csípő
  d = smin(d, dgChain(x, y, z, DG_NECK, 8), 9);                                                      // nyak
  d = smin(d, dgE(x, y, z, 40, 51, 15, 16.5, 16, 10.5), 8);                                          // hátsó comb
  d = smin(d, sdCone(x, y, z, 47, 44, 19, 40, 39.5, 31, 8.4, 5.6), 6);                               // hátsó lábszár
  d = smin(d, dgE(x, y, z, 33, 38.4, 37, 12, 4.4, 8.5), 4);                                          // hátsó talp
  d = smin(d, dgE(x, y, z, -27, 50, 13, 11, 14, 9), 7);                                              // váll
  d = smin(d, sdCone(x, y, z, -27, 52, 13, -35, 43, 28, 9, 6.4), 6);                                 // mellső láb felső
  d = smin(d, sdCone(x, y, z, -35, 43, 28, -43, 39.6, 38, 6.4, 5.2), 4);                             // alsó
  d = smin(d, dgE(x, y, z, -45, 38.5, 43.5, 8.6, 4.3, 7.8), 3);                                      // mancs
  d = smin(d, sdCone(x, y, z, -17, 49, 8, -12, 42, 24, 8, 5.8), 6);                                  // távolabbi mellső láb
  d = smin(d, dgE(x, y, z, -10, 38.6, 35, 7.8, 4.1, 7.2), 3);                                        // távolabbi mancs
  const bw = Math.min(1, Math.max(0, (48 - y) / 7)), rid = bw > 0 ? 0.55 * bw * Math.pow(0.5 + 0.5 * Math.sin(x * 1.15), 0.7) : 0;   // hasi lemezek: valódi dombormű
  return d + rid * (z > 6 ? 1 : 0.6) - 0.28 * bw;
}
const DG_TAIL = [[58, 53, 2, 12.2], [76, 50, -3, 10.4], [92, 46, -1, 8.6], [103, 43, 7, 7], [102, 41, 20, 5.6], [92, 39.6, 30, 4.5], [78, 38.8, 34, 3.6], [66, 38.4, 34, 3]];
function dgLieTail(x, y, z) { return dgChain(x, y, z, DG_TAIL, 4.5); }
const DG_DORSAL = (x, y, z, n) => { const w = dgSm(62, 76, y); return n[1] * (1 - w) + (0.82 * n[0] + 0.45 * n[1]) * w; };
function dgLieBodyGeo() { dgColInit(); return drGeoOnce('dgLieBody', () => sdfGeo(dgLieBody, [-64, 33, -26], [66, 107, 52], 1.25, dgShade(dgLieBody, dgC, { dorsal: DG_DORSAL }))); }
function dgLieTailGeo() { dgColInit(); const P = DG_TAIL[0], f = (x, y, z) => dgLieTail(x + P[0], y + P[1], z + P[2]); return drGeoOnce('dgLieTail', () => sdfGeo(f, [-16, -24, -18], [56, 14, 42], 1.2, dgShade(f, dgC, {}))); }
function dgHeadF(x, y, z) {   // fej-lokális: az origó a koponya közepe, +z előre (pofa), +y fel
  const ax = Math.abs(x), E = (cx, cy, cz, rx, ry, rz) => sdEll(x - cx, y - cy, z - cz, rx, ry, rz), Q = (cx, cy, cz, rx, ry, rz) => sdEll(ax - cx, y - cy, z - cz, rx, ry, rz);   // Q: tükrözött (x előjele nem számít)
  let d = E(0, 0, -1, 10.4, 9, 11.6);                                       // koponya
  d = smin(d, E(0, -2.6, 13.4, 6.6, 4.9, 11.4), 5.5);                       // hosszú felső pofa
  d = smin(d, E(0, -1.8, 24.6, 4.6, 3.5, 4.6), 3);                          // orrvég
  d = smin(d, Q(6.6, 5.4, 3.6, 4.3, 2.5, 6.6), 2.4);                        // szemöldök-gerinc
  d = smin(d, Q(8.4, -2.8, -1.6, 3.6, 4.4, 7.2), 4);                        // arccsont
  d = smin(d, Q(3, -0.4, 27.4, 2.3, 1.6, 2.2), 1.8);                        // orrlyuk-dudor
  d = smin(d, E(0, 6.6, -4, 1.9, 2.2, 8), 3);                               // koponya-taréj
  d = smax(d, -sdSph(ax - 7.9, y - 2.5, z - 5.4, 3.7), 1.4);                // szemüreg
  d = smax(d, -sdEll(ax - 3, y + 0.4, z - 27.2, 1.3, 0.8, 1.6), 0.8);       // orrlyuk
  return d;
}
function dgJawF(x, y, z) {   // csukló-lokális (a csukló az origó); előre +z
  const ax = Math.abs(x);
  let d = sdEll(x, y + 0.6, z - 11.4, 5.0, 2.5, 12.4);
  d = smin(d, sdEll(ax - 4.4, y - 1.0, z - 3.4, 2.4, 2.9, 6.0), 3);
  d = smin(d, sdSph(x, y + 0.6, z - 22.8, 2.9), 2);
  return d;
}
const dgFaceShade = (f, o) => dgShade(f, dgC, o || { dorsal: (x, y, z, n) => n[1] * 0.8 + 0.2 * n[2] });
function dgHeadGeo(cs, key) { dgColInit(); cs = cs || dgC; return drGeoOnce(key || 'dgHead', () => sdfGeo(dgHeadF, [-14, -14, -14], [14, 13, 31], 0.75, dgShade(dgHeadF, cs, { dorsal: (x, y, z, n) => n[1] * 0.8 + 0.2 * n[2] }))); }
function dgJawGeo(cs, key) { dgColInit(); cs = cs || dgC; return drGeoOnce((key || 'dgHead') + 'J', () => sdfGeo(dgJawF, [-9, -5, -7], [9, 6, 27], 0.7, dgShade(dgJawF, cs, { dorsal: (x, y, z, n) => n[1] * 0.5 }))); }

function dgMats(bk) {   // bk: fekete (repülő) sárkány – sötét kék-szürke fényű színek, könyvek nélkül
  const T = THREE;
  const M = {
    body: l3Skin({ color: '#ffffff', kind: 'scale', cell: 3.3, amt: 0.55, rough: 0.58, env: 0.5, vcol: true, clear: 0.25, clearR: 0.4 }),
    skin: l3Skin({ color: bk ? '#17181f' : '#4c0a14', kind: 'scale', cell: 3.3, amt: 0.4, rough: 0.5, env: 0.6, clear: 0.4, clearR: 0.4 }),
    horn: kVinyl('#ffffff', { roughness: 0.34, clearcoat: 0.6, vertexColors: true }), spike: kVinyl(bk ? '#0b0b0f' : '#1b0b0d', { roughness: 0.34, clearcoat: 0.5 }), claw: kVinyl('#d9cdb0', { roughness: 0.35 }), tooth: kVinyl('#efe4c8', { roughness: 0.3 }),
    iris: new T.MeshStandardMaterial({ map: dgIrisTex(), roughness: 0.18, metalness: 0, emissive: l3Col('#ff9a10'), emissiveMap: dgIrisTex(), emissiveIntensity: 0.28 }), rim: new T.MeshStandardMaterial({ color: l3Col('#241008'), roughness: 0.3 }),
    glint: new T.MeshBasicMaterial({ color: 0xffffff }), line: new T.MeshBasicMaterial({ color: 0x1a0507 }),
    lid: l3Skin({ color: bk ? '#0e0f14' : '#3a0910', kind: 'scale', cell: 2.6, amt: 0.45, rough: 0.5, env: 0.6 }),
    mem: new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.72, side: T.DoubleSide, envMapIntensity: 0.3, emissive: l3Col(bk ? '#0a0a10' : '#2a040b'), emissiveIntensity: 0.3 }),
    bone: kVinyl(bk ? '#0e0f13' : '#1c070b', { roughness: 0.4 }),
    nos: new T.MeshBasicMaterial({ color: 0x0c0507 }), mouth: new T.MeshStandardMaterial({ color: l3Col('#7a1a2a'), roughness: 0.6 }), tongue: new T.MeshStandardMaterial({ color: l3Col('#c4546a'), roughness: 0.5 }),
    brow: kVinyl(bk ? '#0b0b0f' : '#1b0a0d', { roughness: 0.35 }),
    pages: bk ? null : new T.MeshStandardMaterial({ map: dgPagesTex(), roughness: 0.9 }),
    cov: bk ? [] : DG_BOOKS.map(b => l3Skin({ color: b.c, kind: 'grain', cell: 3, amt: 0.45, rough: 0.62, env: 0.4 })),
    spine: bk ? [] : DG_BOOKS.map((b, i) => new T.MeshStandardMaterial({ map: dgSpineTex(b, i), roughness: 0.5, metalness: 0.12, envMapIntensity: 0.6 }))
  };
  return M;
}
let parts = null;   // dgBook használja a build alatt
/* összecsukott szárny: váll → könyök (hátra-fel) → csukló (előre-fel) → 4 ujj hátrafelé; hártya ráncolt, íves élű */
function dgWing(M, far, cs) {
  cs = cs || dgC;
  const T = THREE, g = new T.Group(), w = new T.Group(); g.add(w);
  const R = [0, 0, 0], E = [12, 30, 0], Wr = [-4, 47, 0], F = [[48, 41, 1.5], [62, 28, 2.4], [70, 14, 3.2], [68, 1, 3.6]], B = [48, -3, 2];
  const root = [26, 10, 0], tips = [Wr, F[0], F[1], F[2], F[3], B], edge = [];
  tips.forEach((t, i) => {   // a hártya széle: ívesen befelé hajló „függöny” két ujjcsúcs között (több mintapont → sima ív, nem V-alakú csúcs)
    edge.push(t);
    if (i < tips.length - 1) { const a = t, b = tips[i + 1]; [0.2, 0.4, 0.6, 0.8].forEach(u => { const mx = a[0] + (b[0] - a[0]) * u, my = a[1] + (b[1] - a[1]) * u, sag = 0.34 * 4 * u * (1 - u); edge.push([mx + (root[0] - mx) * sag, my + (root[1] - my) * sag, a[2] + (b[2] - a[2]) * u + 1]); }); }
  });
  edge.push(R);
  const k = far ? 0.72 : 1, c0 = dgMix(cs.mem0, cs.back, 0.2).map(v => v * k), c1 = cs.mem1.map(v => v * k);
  const mm = dgFan(root, edge, c0, c1, M.mem, w, (i, kk) => Math.sin(i * 1.1) * 0.5 * kk, i => (i % 4 === 0 ? 1.25 : 0.75 + 0.1 * (i % 4))); mm.userData.part = 'wing'; if (parts) parts.push(mm);
  dgBone(R, E, 2.9, 2.2, M.bone, w, [2, -3, 0]); dgBone(E, Wr, 2.3, 1.7, M.bone, w, [-3, 1, 0]);
  F.forEach((f, i) => dgBone(Wr, f, 2.0, 0.7, M.bone, w, [0, i ? 1.5 : 3, 0]));
  const th = new T.Mesh(new T.ConeGeometry(1.5, 6, 6), M.claw); th.position.set(Wr[0] - 1.5, Wr[1] + 3.2, 0); th.rotation.z = 0.35; w.add(th);
  g.userData.w = w; return g;
}
/* a fej szerelvénye (fej + állkapocs + fogak + orrlyuk + szem + szemöldök + szarvak); a fej-csoportot (head) a hívó helyezi el. cs: színpaletta, key: a háló gyorsítótár-kulcsa */
function dgHeadRig(M, cs, P, key, head) {
  const T = THREE;
  const hm = new T.Mesh(dgHeadGeo(cs, key), M.body); hm.castShadow = true; hm.receiveShadow = true; head.add(P(hm, 'head'));
  const jaw = new T.Group(); jaw.position.set(0, -5.4, -1.2); head.add(jaw);
  const jm = new T.Mesh(dgJawGeo(cs, key), M.body); jm.castShadow = true; jaw.add(P(jm, 'head'));
  const mo = new T.Mesh(new T.SphereGeometry(1, 14, 8), M.mouth); mo.scale.set(4.6, 1.2, 9.5); mo.position.set(0, 3.2, 11); mo.visible = false; jaw.add(mo);
  const tg = new T.Mesh(new T.SphereGeometry(1, 12, 8), M.tongue); tg.scale.set(2.8, 1.2, 6.4); tg.position.set(0, 3.0, 12); tg.visible = false; jaw.add(tg);
  [-1, 1].forEach(sx => {   // fogak: alsó agyarak + felső fogsor
    const t = new T.Mesh(new T.ConeGeometry(0.8, 2.6, 5), M.tooth); t.position.set(sx * 3.4, 3.2, 20.6); jaw.add(t);
    [0, 1, 2].forEach(k => { const u = new T.Mesh(new T.ConeGeometry(0.62 - k * 0.06, 2.0 - k * 0.2, 5), M.tooth); u.position.set(sx * (3.7 + k * 0.5), -8.3, 19.0 - k * 4.2); u.rotation.x = Math.PI; head.add(u); });
  });
  const nostrils = [-1, 1].map(sx => { const n = new T.Mesh(new T.SphereGeometry(1, 8, 6), M.nos); n.scale.set(0.9, 0.55, 0.9); n.position.set(sx * 3, -0.8, 27.4); head.add(n); return n; });
  const eyes = [-1, 1].map(sx => dgEye(head, sx * 7.4, 2.6, 5.2, 2.75, M, sx * 0.62));
  const brows = [-1, 1].map(sx => { const b = new T.Mesh(new T.SphereGeometry(1, 12, 8), M.brow); b.scale.set(4.6, 1.2, 6.4); b.position.set(sx * 7.0, 8.0, 3.8); b.rotation.z = sx * -0.28; b.castShadow = true; head.add(b); b.userData.sx = sx; return b; });
  [-1, 1].forEach(sx => {   // szarvak: hátra ívelő fő szarv + rövid pofaszarv + pofa-tüskék + fül-uszony
    const g = l3TubeGeo(20, 10), cv = l3CatmullPts([[sx * 5.6, 6.4, -5], [sx * 8.4, 12, -10], [sx * 10.4, 17, -19], [sx * 9.6, 18.2, -30]]);
    l3TubeSet(g, cv, t => 3.5 * Math.pow(1 - t, 0.9) + 0.22, (t, a) => 1 + 0.06 * Math.sin(t * 40), [0, 0, 1]); dgTubeCol(g, t => dgMix(cs.hornB, cs.hornT, dgSm(0.55, 1, t)));
    const m = new T.Mesh(g, M.horn); m.castShadow = true; head.add(P(m, 'head'));
    const g2 = l3TubeGeo(10, 8); l3TubeSet(g2, l3CatmullPts([[sx * 8.6, -1.2, -6], [sx * 12.4, -3, -10], [sx * 14.6, -2.4, -15]]), t => 2 * Math.pow(1 - t, 0.9) + 0.2, null, [0, 0, 1]); dgTubeCol(g2, t => dgMix(cs.hornB, cs.hornT, dgSm(0.5, 1, t)));
    const m2 = new T.Mesh(g2, M.horn); m2.castShadow = true; head.add(P(m2, 'head'));
    [[8.8, 1.4, 6.4, 2.6], [8.2, -2.2, 2.2, 2.2], [7.4, -4.8, -2, 1.8]].forEach(c => { const cm = new T.Mesh(new T.ConeGeometry(c[3] * 0.55, c[3] * 1.9, 6), M.spike); cm.position.set(sx * c[0], c[1], c[2]); cm.rotation.set(0, 0, -sx * Math.PI / 2 + sx * 0.4); cm.rotation.x = 0.3; head.add(cm); });
  });
  return { head: head, jaw: jaw, mo: mo, tg: tg, nostrils: nostrils, eyes: eyes, brows: brows };
}
function dgLieBuild(it) {
  dgColInit(); const T = THREE, K = kRoot(it, DG_VH), root = K.r; parts = [];
  const M = dgMats();
  const P = (m, part) => { m.userData.part = part; parts.push(m); return m; };
  // könyvhalom
  let by = 0; DG_BOOKS.forEach((b, i) => { dgBook(root, M, i, by); by += b.h + 0.4; });
  const dg = new T.Group(); dg.position.y = by - 34.4; root.add(dg);   // a sárkány (lélegzik): a talpak a halom tetején (a modell-koordináták a ~34-es talp-magassághoz készültek)
  const body = new T.Mesh(dgLieBodyGeo(), M.body); body.castShadow = true; body.receiveShadow = true; dg.add(P(body, 'body'));
  // farok (a csípőnél forog)
  const TP = DG_TAIL[0], tailG = new T.Group(); tailG.position.set(TP[0], TP[1], TP[2]); dg.add(tailG);
  const tail = new T.Mesh(dgLieTailGeo(), M.body); tail.castShadow = true; tail.receiveShadow = true; tailG.add(P(tail, 'tail'));
  const ts = t => { const q = t * (DG_TAIL.length - 1), i = Math.min(DG_TAIL.length - 2, Math.floor(q)), f = q - i, a = DG_TAIL[i], b = DG_TAIL[i + 1]; return [a[0] + (b[0] - a[0]) * f - TP[0], a[1] + (b[1] - a[1]) * f - TP[1], a[2] + (b[2] - a[2]) * f - TP[2], a[3] + (b[3] - a[3]) * f]; };
  // farok-hegy: levél alakú lapát
  const e = DG_TAIL[DG_TAIL.length - 1], tipG = new T.Group(); tipG.position.set(e[0] - TP[0] - 2, e[1] - TP[1] - 0.9, e[2] - TP[2] - 0.5); tailG.add(tipG);
  const tipM = new T.Mesh(new T.SphereGeometry(1, 16, 10), M.skin); tipM.scale.set(9, 1.9, 5.4); tipM.rotation.y = 0.1; tipM.position.set(-6, 0, 0); tipM.castShadow = true; tipG.add(P(tipM, 'tail'));
  // hátgerinc: tüskék a nyakon, a háton és a farkon (a hátsó vonal mentén kisebbedő sor)
  const sp = (pos, nrm, h, r, par) => { const cm = new T.Mesh(new T.ConeGeometry(r, h, 6), M.spike); cm.position.set(pos[0] + nrm[0] * h * 0.25, pos[1] + nrm[1] * h * 0.25, pos[2] + nrm[2] * h * 0.25); dgOrient(cm, nrm); cm.castShadow = true; par.add(cm); };
  DG_NECK.forEach((nk, i) => { if (!i) return; const r = nk[3], dir = [0.84, 0.5, -0.18]; sp([nk[0] + dir[0] * r * 0.92, nk[1] + dir[1] * r * 0.92, nk[2] + dir[2] * r * 0.92], [dir[0] + 0.1, dir[1] + 0.35, dir[2]], 6.6 - i * 0.7, 2.6 - i * 0.25, dg); });
  const spine = [[-14, 0], [-5, -1], [4, -2], [13, -3], [22, -3], [31, -3], [40, -3], [49, -2]];
  spine.forEach((s2, i) => { const r = dgTop(dgLieBody, s2[0], s2[1], 100, 33); if (!r) return; sp(r.p, [r.n[0] * 0.5 + 0.18, r.n[1] + 0.3, r.n[2] * 0.5], 6.2 - i * 0.4, 2.8 - i * 0.1, dg); });
  for (let i = 0; i < 8; i++) { const q = 0.06 + i * 0.105, s2 = ts(q), r = dgTop(dgLieTail, s2[0] + TP[0], s2[2] + TP[2], s2[1] + TP[1] + 14, s2[1] + TP[1] - 12); if (!r) continue; sp([r.p[0] - TP[0], r.p[1] - TP[1], r.p[2] - TP[2]], [r.n[0] * 0.5, r.n[1] + 0.3, r.n[2] * 0.5], Math.max(1.8, 5 - i * 0.4), Math.max(0.8, 2.3 - i * 0.2), tailG); }
  // karmok és lábujjak
  const toe = (px, py, pz, sx, sz, ry) => { const g = new T.Group(); g.position.set(px, py, pz); g.rotation.y = ry; const t = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.skin); t.scale.set(sx, 2.7, sz); t.castShadow = true; g.add(t); const c = new T.Mesh(new T.ConeGeometry(1.25, 4.4, 6), M.claw); c.rotation.x = Math.PI / 2 + 0.35; c.position.set(0, -0.3, sz + 1.5); c.castShadow = true; g.add(c); dg.add(g); };
  [-1, 0, 1].forEach(k => { toe(-45 + k * 4.6, 37.6, 49.5 - Math.abs(k) * 1.0, 2.6, 4.2, -k * 0.3); toe(-10 + k * 4.2, 37.6, 40.6 - Math.abs(k) * 1.0, 2.4, 3.9, -k * 0.3); toe(33 + k * 4.8, 37.6, 42.6 - Math.abs(k) * 1.0, 2.7, 4.2, -k * 0.28); });
  // szárnyak: a közelebbi a háton, a távolabbi mögötte, kissé elfordítva
  const wings = [1, -1].map(side => {
    const g = dgWing(M, side < 0); g.position.set(-14, 68, side > 0 ? 12 : -8); if (side < 0) { g.rotation.y = -0.2; g.rotation.z = -0.42; g.scale.setScalar(0.9); g.position.set(-4, 66, -9); }
    dg.add(g); g.userData.side = side; return g;
  });
  // fej
  const HP = [-52, 99, 21], head = new T.Group(); head.position.set(HP[0], HP[1], HP[2]); head.rotation.y = -0.55; dg.add(head);
  const HR = dgHeadRig(M, dgC, P, 'dgHead', head), jaw = HR.jaw, mo = HR.mo, tg = HR.tg, nostrils = HR.nostrils, eyes = HR.eyes, brows = HR.brows;
  kHit(head, 10, 0, -2, 19, 'nose');
  // ----- állapot + animáció -----
  const S = kState({ hx: 0, hy: 0, hz: 0, jaw: 0, lid: 0.2, brow: 0, lx: 0, ly: 0, tail: 0, tailZ: 0, wing: 0, breath: 0, vib: 0, tipw: 0, smile: 0 }, S => {
    head.rotation.set(0.07 + S.hx, -0.55 + S.hy + S.lx * 0.16, S.hz); head.position.set(HP[0] + S.vib * 0.2, HP[1], HP[2]);
    jaw.rotation.x = S.jaw * 0.5; mo.visible = S.jaw > 0.12; tg.visible = S.jaw > 0.12; mo.scale.y = 1.2 + S.jaw * 2.2; tg.position.y = 3.0 - S.jaw * 1.2;
    eyes.forEach(e => { const c = Math.min(1, Math.max(0, S.lid)); e.lid.rotation.x = -0.35 + c * (Math.PI / 2 + 0.35); e.arc.visible = c > 0.93; e.pg.position.x = S.lx * 0.5; e.pg.position.y = -S.ly * 0.4; e.g.scale.y = 1; });
    brows.forEach(b => { b.rotation.z = b.userData.sx * (-0.28 - S.brow * 0.45); b.position.y = 8.0 - S.brow * 1.5; });
    dg.scale.set(1 + S.breath * 0.006, 1 + S.breath * 0.016, 1 + S.breath * 0.006); dg.position.x = S.vib * 0.3;
    tailG.rotation.y = S.tail; tailG.rotation.z = S.tailZ; tipG.rotation.y = S.tipw;
    wings.forEach(g => { g.userData.w.scale.set(1 + S.wing * 0.25, 1 + S.wing * 0.25, 1); g.rotation.z = (g.userData.side < 0 ? -0.42 : 0) - S.wing * 0.3; g.rotation.x = S.wing * 0.5 * g.userData.side; });
  });
  S.__apply();
  const smokeAt = (n, big) => { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; [0, 1].forEach(k => { const lp = root.worldToLocal(nostrils[k].getWorldPosition(new T.Vector3())); drParticle(root, 'smoke', lp, { vx: (k ? 4 : -4) + (Math.random() - 0.5) * 4, vy: 9 + Math.random() * 5, vz: 8 + Math.random() * 5, life: 1.5, big: big || 1 }); }); }, i * 170); };
  const hearts = n => { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; drParticle(root, 'heart', new T.Vector3(-56 + (Math.random() - 0.5) * 30, 126, 34 + Math.random() * 6), { vx: (Math.random() - 0.5) * 8, vy: 15 + Math.random() * 6, life: 1.8, big: 0.95 }); }, i * 220); };
  const flame = () => {   // tűzcsóva a szájból: additív fénypamacsok sora + füst
    const m = root.worldToLocal(jaw.getWorldPosition(new T.Vector3())), a = head.rotation.y;
    dgJet(root, new T.Vector3(m.x - 4 + Math.sin(a) * 18, m.y - 1, m.z + 8 + Math.cos(a) * 12), new T.Vector3(Math.sin(a) * 0.9 - 0.1, -0.12, 1), 48, 1);
    smokeAt(3, 1.5);
  };
  const ctl = {
    S: S, root: root, awake: false,
    look(p) { if (ctl.busy) return; const v = kLookVec(head, p, 200); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.06) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv('v'); } },
    boop() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { hx: -0.2, lid: 0.5, brow: 1, tail: 0.35 }, 0.14, 'out').call(() => smokeAt(2, 1)).to(S, { tail: -0.2, tailZ: 0.1 }, 0.3, 'io').wait(0.5).to(S, { hx: 0, lid: 0.2, brow: 0, tail: 0, tailZ: 0 }, 0.5, 'io').call(() => { ctl.busy = false; }).play();
    },
    rage() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { hx: -0.3, jaw: 1, lid: 0.6, brow: 1.4, wing: 1 }, 0.22, 'out').call(() => flame()).to(S, { tail: 0.6 }, 0.12).to(S, { tail: -0.5 }, 0.14).to(S, { tail: 0.4 }, 0.14).wait(0.7).to(S, { hx: 0, jaw: 0, lid: 0.2, brow: 0, wing: 0, tail: 0 }, 0.7, 'io').call(() => { ctl.busy = false; }).play();
      l3Anim(1.4, u => { S.vib = Math.sin(u * 80) * (1 - u) * 2; S.__apply(); }, () => { S.vib = 0; S.__apply(); });
    },
    pet() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { lid: 1, hz: 0.1, hx: 0.08, brow: -0.3 }, 0.3, 'out').call(() => hearts(6)).play();
      l3Anim(2.6, u => { S.vib = Math.sin(u * 2.6 * 38) * Math.min(1, u * 6, (1 - u) * 5) * 0.8; S.breath = Math.sin(u * 2.6 * 6) * 0.9; S.tail = Math.sin(u * 2.6 * 4) * 0.22 * Math.min(1, u * 5); S.__apply(); }, () => { S.vib = 0; S.breath = 0; S.tail = 0; l3Seq().to(S, { lid: 0.2, hz: 0, hx: 0, brow: 0 }, 0.45, 'io').call(() => { ctl.busy = false; }).play(); });
    },
    wag() { crStop(ctl); l3Anim(1.5, u => { S.tail = Math.sin(u * 1.5 * 12) * 0.34 * (1 - u); S.tipw = Math.sin(u * 1.5 * 14) * 0.3 * (1 - u); S.hy = Math.sin(u * Math.PI) * -0.22; S.__apply(); }, () => { S.tail = 0; S.tipw = 0; S.hy = 0; S.__apply(); }); },
    flap() { crStop(ctl); ctl.seq = l3Seq().to(S, { wing: 1 }, 0.25, 'out').to(S, { wing: 0.25 }, 0.18, 'io').to(S, { wing: 1 }, 0.2, 'out').to(S, { wing: 0 }, 0.55, 'io').play(); },
    yawn() { crStop(ctl); ctl.busy = true; ctl.seq = l3Seq().to(S, { hx: -0.22, jaw: 1, lid: 0.95, wing: 0.55 }, 0.5, 'io').wait(0.9).to(S, { hx: 0, jaw: 0, lid: 0.2, wing: 0 }, 0.6, 'io').call(() => { ctl.busy = false; }).play(); },
    blink() { l3Seq().to(S, { lid: 1 }, 0.08, 'out').to(S, { lid: 0.2 }, 0.14, 'io').play(); },
    idle() { if (ctl.busy) return; const r = Math.random(); if (r < 0.45) ctl.blink(); else if (r < 0.75) smokeAt(1, 0.7); else if (r < 0.9) l3Anim(1.0, u => { S.tipw = Math.sin(u * 20) * 0.35 * (1 - u); S.__apply(); }, () => { S.tipw = 0; S.__apply(); }); else l3Anim(2.4, u => { S.breath = Math.sin(u * 2.4 * 2.4); S.__apply(); }, () => { S.breath = 0; S.__apply(); }); }
  };
  S.lid = 0.25; S.__apply();
  const res = { grp: K.g, parts: parts, mats: kMatsAll(M).concat(M.cov, M.spine), d: 60, ctl: ctl };
  parts = null; return res;
}
registerDecor3({
  id: 'sarkany-fekvo', build: dgLieBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (part === 'nose') { st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now; if (st.n >= 3) { c.rage(); st.n = 0; } else c.boop(); return; }
    st.n = 0;
    if (part === 'tail') c.wag(); else if (part === 'wing') c.flap(); else if (part === 'body' || part === 'book') c.yawn(); else c.pet();
  }
});
