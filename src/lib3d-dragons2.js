/* ===== 3D díszek: fekvő sárkány a könyvhalmon (sarkany-fekvo) + repülő, füstöt/tüzet okádó sárkány (kis-sarkany) =====
   Közös stílus: puha, „gyanta-figura” hatás, teal-zöld test krém hassal, narancs tüskék/szarvak, korall szárnyhártya, nagy, fényes szem.
   Modell-egységek: a dísz alja a polcon, X jobbra, Y fel, Z a néző felé; kRoot(it, 100) skáláz. */
'use strict';

const dgC = {};
function dgColInit() {
  if (dgC.back) return;
  Object.assign(dgC, { back: lc('#0f5c55'), body: lc('#1f8a76'), belly: lc('#f4dc94'), bellyD: lc('#e2b95a'), mem0: lc('#b02a2e'), mem1: lc('#ef6048'), jawIn: lc('#8f2b3a'),
    fBack: lc('#611109'), fBody: lc('#b02a17'), fBelly: lc('#ffcc84'), fMem0: lc('#6e1a4a'), fMem1: lc('#d6407c') });
}
const dgMix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dgSm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/* SDF-gradiens (felület-normál) → ellenfény színezéshez: hát sötétebb, has világos */
function dgNormY(f, x, y, z) { const e = 0.9; const gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e), l = Math.hypot(gx, gy, gz) || 1; return [gx / l, gy / l, gz / l]; }
function dgShade(f, cs) {   // cs = {back, body, belly, bellyD}; a fv. (x,y,z)→[r,g,b]
  return (x, y, z) => {
    const n = dgNormY(f, x, y, z), up = dgSm(0.05, 0.85, n[1]), dn = dgSm(0.12, 0.62, -n[1]);
    let c = dgMix(cs.body, cs.back, up);
    const plate = 0.5 + 0.5 * Math.sin(x * 1.05 + z * 0.4);
    c = dgMix(c, dgMix(cs.belly, cs.bellyD, dgSm(0.55, 0.95, plate) * 0.55), dn);
    return c;
  };
}
/* felület-pont fentről (tüskék, páncél-lemezek): (x,z) fölül lefelé lépkedve */
function dgTop(f, x, z, y0, y1) {
  for (let y = y0; y > y1; y -= 0.6) if (f(x, y, z) < 0) { let a = y, b = y + 0.6; for (let i = 0; i < 6; i++) { const m = (a + b) / 2; if (f(x, m, z) < 0) a = m; else b = m; } const yy = (a + b) / 2, n = dgNormY(f, x, yy, z); return { p: [x, yy, z], n: n }; }
  return null;
}
function dgOrient(m, n) { const T = THREE, v = new T.Vector3(n[0], n[1], n[2]).normalize(); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v); }
/* tűzsugár: n db additív fénypamacs a from pontból a dir irányba (hossz len), sárga → narancs → vörös, nő a méret; opcionális végső füst */
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
/* hártya (legyező a gyökértől az élpontokig, 2 gyűrűvel a színátmenethez), kétoldalas */
function dgFan(root, edge, c0, c1, mat, parent) {
  const T = THREE, n = edge.length, pos = [], col = [], idx = [];
  pos.push(root[0], root[1], root[2]); col.push(c0[0], c0[1], c0[2]);
  [0.5, 1].forEach((k, li) => {
    for (let i = 0; i < n; i++) { const e = edge[i]; pos.push(root[0] + (e[0] - root[0]) * k, root[1] + (e[1] - root[1]) * k, root[2] + (e[2] - root[2]) * k + (li === 0 ? 0.6 : 0)); const c = dgMix(c0, c1, k * k); col.push(c[0], c[1], c[2]); }
  });
  for (let i = 0; i < n - 1; i++) { idx.push(0, 1 + i, 2 + i); idx.push(1 + i, 1 + n + i, 2 + i); idx.push(2 + i, 1 + n + i, 2 + n + i); }
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
/* szem: borostyán szivárványhártya + fekete pupilla + két fényfolt + felső szemhéj (gömbhéj-sapka), a csoport középpontja a szemgolyó közepe */
function dgEye(parent, x, y, z, r, M) {
  const T = THREE, g = new T.Group(); g.position.set(x, y, z); parent.add(g);
  const rim = new T.Mesh(new T.SphereGeometry(r * 1.03, 18, 14), M.rim); g.add(rim);
  const ball = new T.Mesh(new T.SphereGeometry(r, 20, 16), M.iris); ball.scale.set(0.94, 0.94, 0.9); ball.position.z = 0.2; g.add(ball);
  const pg = new T.Group(); pg.position.z = r * 0.78; g.add(pg);
  const pu = new T.Mesh(new T.SphereGeometry(1, 14, 12), M.pupil); pu.scale.set(r * 0.36, r * 0.62, r * 0.22); pg.add(pu);
  const h1 = new T.Mesh(new T.SphereGeometry(r * 0.2, 8, 6), M.glint); h1.position.set(r * 0.3, r * 0.34, r * 0.16); pg.add(h1);
  const h2 = new T.Mesh(new T.SphereGeometry(r * 0.1, 8, 6), M.glint); h2.position.set(-r * 0.22, -r * 0.3, r * 0.14); pg.add(h2);
  const lid = new T.Group(); g.add(lid);
  const lm = new T.Mesh(new T.SphereGeometry(r * 1.1, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.lid); lm.castShadow = true; lid.add(lm);
  const arc = new T.Mesh(new T.TorusGeometry(r * 0.78, r * 0.09, 6, 16, Math.PI), M.line); arc.rotation.z = Math.PI; arc.position.set(0, r * 0.1, r * 0.94); arc.scale.y = 0.5; arc.visible = false; g.add(arc);
  return { g: g, pg: pg, pu: pu, lid: lid, arc: arc, r: r };
}

/* ---------- könyvhalom ---------- */
function dgPagesTex() {
  return kTex(64, 64, (g, W, H) => { g.fillStyle = '#f6ecd2'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(150,118,70,.55)'; g.lineWidth = 1; for (let y = 2; y < H; y += 3.2) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }, 'dgPages');
}
function dgBook(parent, M, w, h, d, ci, x, y, z, ry) {
  const T = THREE, g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; const cov = M.cov[ci];
  const mk = (bw, bh, bd, mat, px, py, pz) => { const m = new T.Mesh(new T.BoxGeometry(bw, bh, bd), mat); m.position.set(px, py, pz); m.castShadow = true; m.receiveShadow = true; m.userData.part = 'book'; g.add(m); parts.push(m); return m; };
  mk(w, 2.2, d, cov, 0, -h / 2 + 1.1, 0); mk(w, 2.2, d, cov, 0, h / 2 - 1.1, 0);
  mk(w - 3.4, h - 4.2, d - 2.6, M.pages, 1.7, 0, -0.2);
  mk(3.6, h, d, cov, -w / 2 + 1.8, 0, 0);
  const band = new T.Mesh(new T.BoxGeometry(w + 0.2, 0.8, 1.2), M.gold); band.position.set(0, h / 2 - 1.5, d / 2 - 0.2); g.add(band);
  parent.add(g); return g;
}

/* ---------- a fekvő sárkány ---------- */
function dgLieBody(x, y, z) {
  let d = sdEll(x - 20, y - 50, z + 3, 46, 17, 21);                      // törzs
  d = smin(d, sdEll(x + 18, y - 50, z - 2, 21, 17, 19), 9);              // mellkas/váll
  d = smin(d, sdEll(x - 55, y - 48, z + 1, 21, 16, 19), 8);              // far
  d = smin(d, sdCone(x, y, z, -26, 54, 6, -52, 51, 22, 10.5, 9.5), 8);   // nyak
  d = smin(d, sdEll(x - 58, y - 41, z - 12, 15, 13, 12), 7);             // comb
  d = smin(d, sdEll(x - 62, y - 37, z - 25, 11, 5.4, 10.5), 4);          // hátsó láb talp
  d = smin(d, sdCone(x, y, z, -30, 45, 8, -57, 39, 37, 8.6, 7), 6);      // jobb mellső láb
  d = smin(d, sdEll(x + 59, y - 38, z - 38, 10, 5.2, 10.5), 4);          // jobb mancs
  d = smin(d, sdCone(x, y, z, -22, 45, 2, -80, 38, 30, 8, 6.6), 6);      // bal mellső láb
  d = smin(d, sdEll(x + 82, y - 38, z - 31, 9.5, 5.2, 10), 4);           // bal mancs
  return d;
}
const DG_TAIL = [[66, 49, -6, 11.5], [88, 44, -2, 9.8], [98, 31, 4, 8.2], [100, 17, 12, 6.8], [93, 7, 22, 5.4], [79, 5.4, 32, 4.4], [65, 5.8, 35, 3.6], [55, 6.8, 33, 3.2]];
function dgLieTail(x, y, z) { return dgChain(x, y, z, DG_TAIL, 4); }
function dgLieBodyGeo() { dgColInit(); return drGeoOnce('dgLieBody', () => sdfGeo(dgLieBody, [-94, 22, -30], [78, 72, 52], 1.7, dgShade(dgLieBody, { back: dgC.back, body: dgC.body, belly: dgC.belly, bellyD: dgC.bellyD }))); }
function dgLieTailGeo() { dgColInit(); const P = DG_TAIL[0], f = (x, y, z) => dgLieTail(x + P[0], y + P[1], z + P[2]); return drGeoOnce('dgLieTail', () => sdfGeo(f, [-14, -50, -18], [44, 18, 46], 1.5, dgShade(f, { back: dgC.back, body: dgC.body, belly: dgC.belly, bellyD: dgC.bellyD }))); }
function dgHeadF(x, y, z) {
  const ax = Math.abs(x);
  let d = sdEll(x, y - 1, z + 2, 17.5, 15, 16);
  d = smin(d, sdEll(x, y + 3.2, z - 12, 10.8, 8, 12.5), 6);
  d = smin(d, sdEll(ax - 14.5, y + 2.5, z - 1, 6.6, 6.6, 8.5), 5);
  d = smin(d, sdEll(ax - 8.8, y - 9.6, z - 9, 6.6, 3, 5.6), 3);
  d = smin(d, sdSph(ax - 3.8, y + 1.6, z - 24, 2.7), 2.6);
  return d;
}
function dgJawF(x, y, z) {   // csukló-lokális (a csukló az origó); előre +z
  let d = sdEll(x, y + 0.6, z - 10.5, 7.9, 3.7, 11.6);
  d = smin(d, sdEll(Math.abs(x) - 5.6, y, z - 4, 3.8, 3.4, 6.2), 3);
  return d;
}
function dgHeadGeo() { dgColInit(); return drGeoOnce('dgHead', () => sdfGeo(dgHeadF, [-26, -17, -20], [26, 20, 28], 1.2, dgShade(dgHeadF, { back: dgC.back, body: dgC.body, belly: dgC.belly, bellyD: dgC.bellyD }))); }
function dgJawGeo() { dgColInit(); return drGeoOnce('dgJaw', () => sdfGeo(dgJawF, [-12, -7, -4], [12, 7, 24], 1.0, dgShade(dgJawF, { back: dgC.body, body: dgC.belly, belly: dgC.belly, bellyD: dgC.bellyD }))); }

function dgMats() {
  const T = THREE;
  const M = {
    body: l3Skin({ color: '#ffffff', kind: 'scale', cell: 4.6, amt: 0.34, rough: 0.5, env: 0.6, vcol: true, clear: 0.4, clearR: 0.42 }),
    skin: l3Skin({ color: '#1f8a76', kind: 'scale', cell: 4.6, amt: 0.3, rough: 0.5, env: 0.6, clear: 0.4, clearR: 0.42 }),
    horn: kVinyl('#f3c681', { roughness: 0.36 }), spike: kVinyl('#f08b4a', { roughness: 0.4 }), claw: kVinyl('#f7efd9', { roughness: 0.35 }), tooth: kVinyl('#fff7e6', { roughness: 0.3 }),
    iris: new T.MeshStandardMaterial({ color: l3Col('#ffb722'), roughness: 0.22, emissive: l3Col('#ff9a10'), emissiveIntensity: 0.32 }), rim: new T.MeshStandardMaterial({ color: l3Col('#7b3a10'), roughness: 0.5 }),
    pupil: new T.MeshBasicMaterial({ color: 0x120a06 }), glint: new T.MeshBasicMaterial({ color: 0xffffff }), line: new T.MeshBasicMaterial({ color: 0x0f3a33 }),
    lid: l3Skin({ color: '#2f9c85', kind: 'scale', cell: 4.6, amt: 0.3, rough: 0.5, env: 0.6 }),
    mem: new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.55, side: T.DoubleSide, envMapIntensity: 0.6 }),
    bone: kVinyl('#2a8f7d', { roughness: 0.45 }),
    nos: new T.MeshBasicMaterial({ color: 0x0c1a17 }), mouth: new T.MeshStandardMaterial({ color: l3Col('#8f2b3a'), roughness: 0.6 }), tongue: new T.MeshStandardMaterial({ color: l3Col('#ef7f95'), roughness: 0.5 }),
    brow: kVinyl('#f08b4a', { roughness: 0.4 }),
    pages: new T.MeshStandardMaterial({ map: dgPagesTex(), roughness: 0.9 }), gold: kVinyl('#d9ae4e', { roughness: 0.3, metalness: 0.4 }),
    cov: [l3Skin({ color: '#a8403d', kind: 'grain', cell: 3, amt: 0.4, rough: 0.8, env: 0.4 }), l3Skin({ color: '#33618f', kind: 'grain', cell: 3, amt: 0.4, rough: 0.8, env: 0.4 }), l3Skin({ color: '#c79d45', kind: 'grain', cell: 3, amt: 0.4, rough: 0.8, env: 0.4 })]
  };
  return M;
}
let parts = null;   // dgBook használja a build alatt
function dgLieBuild(it) {
  dgColInit(); const T = THREE, K = kRoot(it, 100), root = K.r; parts = [];
  const M = dgMats();
  const P = (m, part) => { m.userData.part = part; parts.push(m); return m; };
  // könyvhalom
  dgBook(root, M, 124, 13, 80, 0, 4, 6.5, 0, 0.0); dgBook(root, M, 106, 11, 70, 1, -4, 19.5, 2, 0.07); dgBook(root, M, 92, 10, 62, 2, 3, 30, -2, -0.06);
  const dg = new T.Group(); root.add(dg);   // a sárkány (lélegzik)
  const body = new T.Mesh(dgLieBodyGeo(), M.body); body.castShadow = true; body.receiveShadow = true; dg.add(P(body, 'body'));
  // farok (a csípőnél forog)
  const TP = DG_TAIL[0], tailG = new T.Group(); tailG.position.set(TP[0], TP[1], TP[2]); dg.add(tailG);
  const tail = new T.Mesh(dgLieTailGeo(), M.body); tail.castShadow = true; tail.receiveShadow = true; tailG.add(P(tail, 'tail'));
  const tl = []; const ts = (t, rr) => { const q = t * (DG_TAIL.length - 1), i = Math.min(DG_TAIL.length - 2, Math.floor(q)), f = q - i, a = DG_TAIL[i], b = DG_TAIL[i + 1]; return [a[0] + (b[0] - a[0]) * f - TP[0], a[1] + (b[1] - a[1]) * f - TP[1], a[2] + (b[2] - a[2]) * f - TP[2], a[3] + (b[3] - a[3]) * f]; };
  // farok-hegy: levél alakú lapát
  const e = DG_TAIL[DG_TAIL.length - 1], tipG = new T.Group(); tipG.position.set(e[0] - TP[0] - 2, e[1] - TP[1] + 0.4, e[2] - TP[2] - 0.5); tailG.add(tipG);
  const tipM = new T.Mesh(new T.SphereGeometry(1, 16, 10), M.spike); tipM.scale.set(9, 1.8, 5); tipM.rotation.y = 0.1; tipM.position.set(-6, 0, 0); tipM.castShadow = true; tipG.add(P(tipM, 'tail'));
  // hátgerinc: narancs tüskék a hát felszínén
  const spine = [[-50, 20], [-42, 14], [-34, 9], [-25, 5], [-14, 0], [-2, -2], [10, -3], [22, -4], [34, -4], [46, -4]];
  spine.forEach((s, i) => { const r = dgTop(dgLieBody, s[0], s[1], 90, 30); if (!r) return; const h = 5.6 - i * 0.18, cm = new T.Mesh(new T.ConeGeometry(2.7 - i * 0.05, h, 6), M.spike); cm.position.set(r.p[0], r.p[1] + h * 0.35, r.p[2]); dgOrient(cm, [r.n[0] * 0.5, r.n[1] + 0.3, r.n[2] * 0.5]); cm.castShadow = true; dg.add(cm); });
  for (let i = 0; i < 8; i++) { const q = 0.06 + i * 0.105, s = ts(q), r = dgTop(dgLieTail, s[0] + TP[0], s[2] + TP[2], s[1] + TP[1] + 14, s[1] + TP[1] - 12); if (!r) continue; const h = 4.8 - i * 0.4, cm = new T.Mesh(new T.ConeGeometry(2.3 - i * 0.18, Math.max(1.6, h), 6), M.spike); cm.position.set(r.p[0] - TP[0], r.p[1] - TP[1] + h * 0.3, r.p[2] - TP[2]); dgOrient(cm, [r.n[0] * 0.5, r.n[1] + 0.3, r.n[2] * 0.5]); cm.castShadow = true; tailG.add(cm); }
  // karmok és lábujjak
  const toe = (px, py, pz, sx, sz, ry) => { const g = new T.Group(); g.position.set(px, py, pz); g.rotation.y = ry; const t = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.skin); t.scale.set(sx, 2.7, sz); t.castShadow = true; g.add(t); const c = new T.Mesh(new T.ConeGeometry(1.2, 3.8, 6), M.claw); c.rotation.x = Math.PI / 2 + 0.3; c.position.set(0, -0.2, sz + 1.2); g.add(c); dg.add(g); };
  [-1, 0, 1].forEach(k => { toe(-55 + k * 5.2, 38, 48.5 - Math.abs(k) * 1.2, 2.8, 4.8, -k * 0.28); toe(-82 + k * 5, 38.5, 41.5 - Math.abs(k) * 1.2, 2.7, 4.6, -k * 0.28); toe(62 + k * 4.4, 36.5, 35.5 - Math.abs(k) * 1, 2.5, 4.4, -k * 0.26); });
  // szárnyak (összecsukva a háton)
  const wings = [1, -1].map(side => {
    const g = new T.Group(); g.position.set(-10, 63, side * 8); dg.add(g);
    const w = new T.Group(); w.scale.set(1.0, 1.0, 1); g.add(w);
    const R = [0, 0, 0], E = [4, 21, 0], Wr = [24, 30, 0], F = [[48, 30, 1], [60, 14, 2], [60, -2, 3], [48, -8, 3]];
    const edge = [Wr, [(Wr[0] + F[0][0]) / 2 + 1, (Wr[1] + F[0][1]) / 2 - 5, 1], F[0], [(F[0][0] + F[1][0]) / 2 - 7, (F[0][1] + F[1][1]) / 2 - 3, 1.5], F[1], [(F[1][0] + F[2][0]) / 2 - 8, (F[1][1] + F[2][1]) / 2, 2], F[2], [(F[2][0] + F[3][0]) / 2 - 6, (F[2][1] + F[3][1]) / 2 + 3, 2.5], F[3], [26, -6, 3], [8, 2, 2]];
    const mm = dgFan(R, edge, dgMix(dgC.mem0, dgC.back, 0.3), dgC.mem1, M.mem, w); mm.userData.part = 'wing'; parts.push(mm);
    dgBone(R, E, 2.4, 1.9, M.bone, w, [0, 2, 0]); dgBone(E, Wr, 1.9, 1.5, M.bone, w, [0, 2, 0]); F.forEach((f, i) => dgBone(Wr, f, 1.4, 0.5, M.bone, w, [0, i ? -1 : 2, 0]));
    const cl = new T.Mesh(new T.ConeGeometry(1.4, 4.4, 6), M.claw); cl.position.set(Wr[0], Wr[1] + 2.4, 0); w.add(cl);
    if (side < 0) { g.position.x = -2; g.position.z = -6; g.rotation.y = -0.2; }
    g.userData.side = side; g.userData.w = w; return g;
  });
  // fej
  const HP = [-60, 56, 27], head = new T.Group(); head.position.set(HP[0], HP[1], HP[2]); head.rotation.y = -0.3; head.scale.setScalar(1.28); dg.add(head);
  const hm = new T.Mesh(dgHeadGeo(), M.body); hm.castShadow = true; hm.receiveShadow = true; head.add(P(hm, 'head'));
  const jaw = new T.Group(); jaw.position.set(0, -6.8, 2); head.add(jaw);
  const jm = new T.Mesh(dgJawGeo(), M.body); jm.castShadow = true; jaw.add(P(jm, 'head'));
  const mo = new T.Mesh(new T.SphereGeometry(1, 14, 8), M.mouth); mo.scale.set(6.6, 1.2, 9); mo.position.set(0, 3.4, 11); mo.visible = false; jaw.add(mo);
  const tg = new T.Mesh(new T.SphereGeometry(1, 12, 8), M.tongue); tg.scale.set(3.6, 1.3, 6); tg.position.set(0, 3.4, 12); tg.visible = false; jaw.add(tg);
  [-1, 1].forEach(sx => {
    const t = new T.Mesh(new T.ConeGeometry(0.9, 2.8, 5), M.tooth); t.position.set(sx * 4.6, 2.6, 19); t.rotation.x = Math.PI; jaw.add(t);
    const t2 = new T.Mesh(new T.ConeGeometry(0.8, 2.4, 5), M.tooth); t2.position.set(sx * 5.2, -2.4 + 6.8, 17.6 - 6.8 + 6.8); t2.visible = false;
    const u = new T.Mesh(new T.ConeGeometry(1, 3.4, 5), M.tooth); u.position.set(sx * 4.4, -9.6, 18.5); u.rotation.x = Math.PI; head.add(u);
  });
  const nostrils = [-1, 1].map(sx => { const n = new T.Mesh(new T.SphereGeometry(1, 8, 6), M.nos); n.scale.set(1.2, 0.8, 0.7); n.position.set(sx * 3.9, 1.6, 26.4); head.add(n); return n; });
  const eyes = [-1, 1].map(sx => dgEye(head, sx * 9.6, 4.2, 9.8, 6.1, M));
  const brows = [-1, 1].map(sx => { const b = new T.Mesh(new T.SphereGeometry(1, 12, 8), M.brow); b.scale.set(6.4, 1.7, 2.4); b.position.set(sx * 9.6, 11.4, 11.2); b.castShadow = true; head.add(b); b.userData.sx = sx; return b; });
  [-1, 1].forEach(sx => {   // szarvak
    const g = l3TubeGeo(18, 10), cv = l3CatmullPts([[sx * 8, 11, -4], [sx * 11, 19, -9], [sx * 13.5, 25.5, -18], [sx * 12.5, 28, -29]]);
    l3TubeSet(g, cv, t => 3.9 * Math.pow(1 - t, 0.85) + 0.25, (t, a) => 1 + 0.07 * Math.sin(t * 34), [0, 0, 1]);
    const m = new T.Mesh(g, M.horn); m.castShadow = true; head.add(P(m, 'head'));
    const fin = new T.Group(); head.add(fin);   // fül-uszony
    const ed = [[sx * 15, 8, -5], [sx * 26, 13, -9], [sx * 30, 8, -11], [sx * 32, 1, -12], [sx * 28, -5, -10], [sx * 16, -4, -4]];
    dgFan([sx * 14, 2, -4], ed, dgMix(dgC.mem0, dgC.back, 0.5), dgC.mem1, M.mem, fin);
    [ed[1], ed[3], ed[4]].forEach(e2 => dgBone([sx * 14, 2, -4], e2, 1.1, 0.4, M.bone, fin));
  });
  kHit(head, 11, 0, -2, 22, 'nose');
  const bg = { dg: dg, body: body };
  // ----- állapot + animáció -----
  const S = kState({ hx: 0, hy: 0, hz: 0, jaw: 0, lid: 0.22, brow: 0, lx: 0, ly: 0, tail: 0, tailZ: 0, wing: 0, breath: 0, vib: 0, tipw: 0, smile: 0 }, S => {
    head.rotation.set(0.04 + S.hx, -0.3 + S.hy + S.lx * 0.16, S.hz); head.position.set(HP[0] + S.vib * 0.2, HP[1], HP[2]);
    jaw.rotation.x = S.jaw * 0.5; mo.visible = S.jaw > 0.12; tg.visible = S.jaw > 0.12; mo.scale.y = 1.2 + S.jaw * 2.2; tg.position.y = 3.4 - S.jaw * 1.2;
    eyes.forEach(e => { const c = Math.min(1, Math.max(0, S.lid)); e.lid.rotation.x = -0.35 + c * (Math.PI / 2 + 0.35); e.arc.visible = c > 0.93; e.pg.position.x = S.lx * 1.9; e.pg.position.y = -S.ly * 1.3; e.g.scale.y = 1; });
    brows.forEach(b => { b.rotation.z = b.userData.sx * -S.brow * 0.5; b.position.y = 11.4 - S.brow * 2.2; });
    dg.scale.set(1 + S.breath * 0.006, 1 + S.breath * 0.016, 1 + S.breath * 0.006); dg.position.x = S.vib * 0.3;
    tailG.rotation.y = S.tail; tailG.rotation.z = S.tailZ; tipG.rotation.y = S.tipw;
    wings.forEach(g => { g.userData.w.scale.set(1 + S.wing * 0.3, 1 + S.wing * 0.3, 1); g.rotation.z = -S.wing * 0.34; g.rotation.x = S.wing * 0.5 * g.userData.side; });
  });
  S.__apply();
  const smokeAt = (n, big) => { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; [0, 1].forEach(k => { const lp = root.worldToLocal(nostrils[k].getWorldPosition(new T.Vector3())); drParticle(root, 'smoke', lp, { vx: (k ? 4 : -4) + (Math.random() - 0.5) * 4, vy: 9 + Math.random() * 5, vz: 8 + Math.random() * 5, life: 1.5, big: big || 1 }); }); }, i * 170); };
  const hearts = n => { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; drParticle(root, 'heart', new T.Vector3(-62 + (Math.random() - 0.5) * 36, 76, 34 + Math.random() * 6), { vx: (Math.random() - 0.5) * 8, vy: 15 + Math.random() * 6, life: 1.8, big: 0.95 }); }, i * 220); };
  const flame = () => {   // tűzcsóva a szájból: additív fénypamacsok sora + füst
    const m = root.worldToLocal(jaw.getWorldPosition(new T.Vector3())), a = head.rotation.y;
    dgJet(root, new T.Vector3(m.x - 8 + Math.sin(a) * 6, m.y + 3, m.z + 14), new T.Vector3(-0.28 + Math.sin(a) * 0.5, 0.1, 1), 46, 1);
    smokeAt(3, 1.5);
  };
  const ctl = {
    S: S, root: root, awake: false,
    look(p) { if (ctl.busy) return; const v = kLookVec(head, p, 200); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.02) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv(); } },
    boop() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { hx: -0.2, lid: 0.55, brow: 1, tail: 0.35 }, 0.14, 'out').call(() => smokeAt(2, 1)).to(S, { tail: -0.2, tailZ: 0.1 }, 0.3, 'io').wait(0.5).to(S, { hx: 0, lid: 0.22, brow: 0, tail: 0, tailZ: 0 }, 0.5, 'io').call(() => { ctl.busy = false; }).play();
    },
    rage() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { hx: -0.3, jaw: 1, lid: 0.7, brow: 1.4, wing: 1 }, 0.22, 'out').call(() => flame()).to(S, { tail: 0.6 }, 0.12).to(S, { tail: -0.5 }, 0.14).to(S, { tail: 0.4 }, 0.14).wait(0.7).to(S, { hx: 0, jaw: 0, lid: 0.22, brow: 0, wing: 0, tail: 0 }, 0.7, 'io').call(() => { ctl.busy = false; }).play();
      l3Anim(1.4, u => { S.vib = Math.sin(u * 80) * (1 - u) * 2; S.__apply(); }, () => { S.vib = 0; S.__apply(); });
    },
    pet() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { lid: 1, hz: 0.1, hx: 0.08, brow: -0.3 }, 0.3, 'out').call(() => hearts(6)).play();
      l3Anim(2.6, u => { S.vib = Math.sin(u * 2.6 * 38) * Math.min(1, u * 6, (1 - u) * 5) * 0.8; S.breath = Math.sin(u * 2.6 * 6) * 0.9; S.tail = Math.sin(u * 2.6 * 4) * 0.22 * Math.min(1, u * 5); S.__apply(); }, () => { S.vib = 0; S.breath = 0; S.tail = 0; l3Seq().to(S, { lid: 0.22, hz: 0, hx: 0, brow: 0 }, 0.45, 'io').call(() => { ctl.busy = false; }).play(); });
    },
    wag() { crStop(ctl); l3Anim(1.5, u => { S.tail = Math.sin(u * 1.5 * 12) * 0.34 * (1 - u); S.tipw = Math.sin(u * 1.5 * 14) * 0.3 * (1 - u); S.hy = Math.sin(u * Math.PI) * -0.22; S.__apply(); }, () => { S.tail = 0; S.tipw = 0; S.hy = 0; S.__apply(); }); },
    flap() { crStop(ctl); ctl.seq = l3Seq().to(S, { wing: 1 }, 0.25, 'out').to(S, { wing: 0.25 }, 0.18, 'io').to(S, { wing: 1 }, 0.2, 'out').to(S, { wing: 0 }, 0.55, 'io').play(); },
    yawn() { crStop(ctl); ctl.busy = true; ctl.seq = l3Seq().to(S, { hx: -0.22, jaw: 1, lid: 0.9, wing: 0.55 }, 0.5, 'io').wait(0.9).to(S, { hx: 0, jaw: 0, lid: 0.22, wing: 0 }, 0.6, 'io').call(() => { ctl.busy = false; }).play(); },
    blink() { l3Seq().to(S, { lid: 1 }, 0.08, 'out').to(S, { lid: 0.22 }, 0.14, 'io').play(); },
    idle() { if (ctl.busy) return; const r = Math.random(); if (r < 0.45) ctl.blink(); else if (r < 0.75) smokeAt(1, 0.7); else if (r < 0.9) l3Anim(1.0, u => { S.tipw = Math.sin(u * 20) * 0.35 * (1 - u); S.__apply(); }, () => { S.tipw = 0; S.__apply(); }); else l3Anim(2.4, u => { S.breath = Math.sin(u * 2.4 * 2.4); S.__apply(); }, () => { S.breath = 0; S.__apply(); }); }
  };
  S.lid = 0.35; S.__apply();
  const res = { grp: K.g, parts: parts, mats: kMatsAll(M).concat(M.cov), d: 60, ctl: ctl };
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


/* =====================================================================================================================
   Repülő sárkány (kis-sarkany): pillanatkép – a sárkány épp egy nagy adag tüzet/füstöt fúj a polc szélén álló könyvekre,
   a füstoszlop nekitámaszkodik a könyveknek és „tartja” őket. Egységek: vh = 110 (modell-magasság), x ≈ −70 … +66; a füstoszlop a BAL szélen áll (a könyvek felől).
   ===================================================================================================================== */
const FL_BODY = [[-27, 90, 4, 7.4], [-19, 83, 3.5, 9.2], [-10, 74, 3, 13], [2, 68, 1, 15], [14, 62, 0, 13], [25, 54, 1, 10], [35, 47, 2, 7.2], [44, 42, 3, 5], [52, 37, 1, 3.6], [57, 30, -2, 2.6]];
const FL_DX = 18, FL_DY = 16;
function flBody(x, y, z) {
  let d = dgChain(x, y, z, FL_BODY, 6);
  d = smin(d, sdEll(x - 15, y - 56, z - 7, 11, 9.5, 8), 5);                   // comb
  d = smin(d, sdCone(x, y, z, 14, 54, 7, 19, 43, 9, 4.8, 3.6), 3);            // hátsó láb: lábszár
  d = smin(d, sdEll(x - 23, y - 41, z - 9.5, 7, 3.2, 4.6), 2.6);              // hátsó láb: talp
  d = smin(d, sdCone(x, y, z, 9, 52, -7, 12, 42, -8, 4.4, 3.4), 3);           // túlsó hátsó láb
  d = smin(d, sdEll(x - 16, y - 40, z + 8.5, 6.4, 3, 4.2), 2.6);
  d = smin(d, sdCone(x, y, z, -7, 64, 9, -17, 55, 11, 5.4, 3.9), 4);          // mellső láb
  d = smin(d, sdEll(x + 20, y - 53, z - 11.5, 5.6, 3.1, 4.6), 2.4);           // mancs
  d = smin(d, sdCone(x, y, z, -2, 62, -8, -10, 54, -10, 4.4, 3.4), 3);        // túlsó mellső láb
  d = smin(d, sdEll(x + 13, y - 53, z + 10.5, 5, 2.9, 4.2), 2.4);
  return d;
}
function flBodyGeo() {
  dgColInit(); const pal = { back: dgC.fBack, body: dgC.fBody, belly: dgC.fBelly, bellyD: lc('#f4b873') };
  return drGeoOnce('flBody', () => sdfGeo(flBody, [-40, 20, -22], [72, 104, 30], 1.6, dgShade(flBody, pal)));
}
function flHeadGeo() { dgColInit(); const pal = { back: dgC.fBack, body: dgC.fBody, belly: dgC.fBelly, bellyD: lc('#f4b873') }; return drGeoOnce('flHead', () => sdfGeo(dgHeadF, [-26, -17, -20], [26, 20, 28], 1.2, dgShade(dgHeadF, pal))); }
function flJawGeo() { dgColInit(); const pal = { back: dgC.fBody, body: dgC.fBelly, belly: dgC.fBelly, bellyD: lc('#f4b873') }; return drGeoOnce('flJaw', () => sdfGeo(dgJawF, [-12, -7, -4], [12, 7, 24], 1.0, dgShade(dgJawF, pal))); }

/* felhő-bázis + füstoszlop (egy SDF): bal oldalon a magas oszlop (a könyvekhez támaszkodik), jobbra alacsony felhő-ágy, amibe a farok belelóg */
const FL_CL = [[-46, 9, 5, 15], [-36, 12, 9, 12.5], [-56, 14, 8, 11], [-44, 24, 5, 13.5], [-52, 33, 8, 11.5], [-42, 38, 3, 11], [-50, 47, 6, 11], [-43, 56, 3, 9.5], [-52, 60, 6, 7.5], [-60, 62, 8, 9.5], [-62, 50, 8, 11], [-61, 73, 1, 11.5], [-68, 79, 1, 9], [-55, 82, 1, 9.5], [-63, 88, 2, 7], [-71, 70, 2, 8], [-40, 28, 12, 10],
  [-24, 8, 7, 12], [-8, 9, 8, 13], [8, 8, 5, 12], [24, 9, 4, 12], [38, 10, 2, 10.5], [50, 11, 0, 8.5], [60, 9, -3, 6.5], [-30, 16, 2, 9], [4, 15, 2, 8.5], [30, 17, 0, 7.5]];
function flCloud(x, y, z) {
  let d = 1e9; for (let i = 0; i < FL_CL.length; i++) { const c = FL_CL[i]; d = Math.min(d, 0) === d && i === 0 ? sdSph(x - c[0], y - c[1], z - c[2], c[3]) : smin(d, sdSph(x - c[0], y - c[1], z - c[2], c[3]), 6.5); }
  d -= 1.25 * Math.abs(Math.sin(x * 0.33 + 1) * Math.sin(y * 0.38) * Math.sin(z * 0.31 + 2));   // gomolyag-dudorok
  return smax(d, -y + 1.5, 1.5);   // alul levágva (a polcon fekszik)
}
function flCloudGeo() {
  const c0 = lc('#c3cce6'), c1 = lc('#ffffff'), cs = lc('#d9936a'), cd = lc('#4c4650');
  return drGeoOnce('flCloud', () => sdfGeo(flCloud, [-80, 0, -18], [72, 96, 30], 2.0, (x, y, z) => {
    const n = dgNormY(flCloud, x, y, z), up = dgSm(-0.2, 0.9, n[1]);
    let c = dgMix(c0, c1, up * 0.9 + 0.1);
    if (x < -30) { const k = dgSm(30, 66, y) * (0.7 + 0.25 * Math.sin(x * 0.7 + z)); c = dgMix(c, dgMix(cs, cd, dgSm(50, 74, y)), k); }   // a láng körül sötétedik/melegszik
    return c;
  }));
}
function flWingSpec() { return { R: [0, 0, 0], E: [13, 22, 0], Wr: [36, 31, 0], F: [[60, 29, 0], [71, 9, 0], [68, -13, 0], [54, -25, 0]], hip: [17, -15, 0] }; }
function flBuildWing(parent, M, near) {
  const T = THREE, sp = flWingSpec(), g = new T.Group(), R = sp.R, E = sp.E, Wr = sp.Wr, F = sp.F;
  const edge = [Wr, [(Wr[0] + F[0][0]) / 2, (Wr[1] + F[0][1]) / 2 - 5, 0.8], F[0], [(F[0][0] + F[1][0]) / 2 - 9, (F[0][1] + F[1][1]) / 2 - 3, 1.2], F[1], [(F[1][0] + F[2][0]) / 2 - 10, (F[1][1] + F[2][1]) / 2, 1.6], F[2], [(F[2][0] + F[3][0]) / 2 - 8, (F[2][1] + F[3][1]) / 2 + 3, 2], F[3], [36, -22, 2], sp.hip];
  const mm = dgFan(R, edge, dgMix(dgC.fMem0, dgC.fBack, 0.35), dgC.fMem1, M.mem, g); mm.userData.part = 'wing'; mm.position.z = -1.8;
  dgBone(R, E, 2.6, 2.1, M.bone, g, [0, 2, 0]); dgBone(E, Wr, 2.1, 1.6, M.bone, g, [0, 3, 0]); F.forEach((f, i) => dgBone(Wr, f, 1.5, 0.5, M.bone, g, [0, i ? -2 : 3, 0]));
  const cl = new T.Mesh(new T.ConeGeometry(1.5, 5, 6), M.claw); cl.position.set(Wr[0] + 0.5, Wr[1] + 3, 0); g.add(cl);
  parent.add(g); return { g: g, mem: mm };
}
function flBuild(it) {
  dgColInit(); const T = THREE, K = kRoot(it, 125), root = K.r, parts = [];
  const M = dgMats();
  M.mem2 = M.mem.clone(); M.bone2 = kVinyl('#5e1620', { roughness: 0.45 }); M.bone = kVinyl('#7a1f2a', { roughness: 0.45 });
  M.skin = l3Skin({ color: '#e2573c', kind: 'scale', cell: 4.6, amt: 0.3, rough: 0.5, env: 0.6, clear: 0.4, clearR: 0.42 });
  M.spike = kVinyl('#ffd98a', { roughness: 0.4 });
  M.lid = l3Skin({ color: '#d84b36', kind: 'scale', cell: 4.6, amt: 0.3, rough: 0.5, env: 0.6 });
  M.cloud = new T.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.96, emissive: new T.Color(0xdfe8ff), emissiveIntensity: 0.04 }); M.cloud.color.setRGB(0.52, 0.54, 0.6);
  M.flameO = new T.MeshBasicMaterial({ color: 0xe8280a, transparent: true, opacity: 0.62, depthWrite: false, toneMapped: false });
  M.flameM = new T.MeshBasicMaterial({ color: 0xff8a12, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false });
  M.flameI = new T.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 1, depthWrite: false, toneMapped: false });
  const P = (m, part) => { m.userData.part = part; parts.push(m); return m; };
  // felhő-bázis + füstoszlop
  const cloud = new T.Mesh(flCloudGeo(), M.cloud); cloud.castShadow = true; cloud.receiveShadow = true; root.add(P(cloud, 'cloud'));
  // a sárkány (lebeg: a csoport enyhén billen)
  const dg = new T.Group(); dg.position.set(FL_DX, FL_DY, 0); root.add(dg);
  const body = new T.Mesh(flBodyGeo(), M.body); body.castShadow = true; body.receiveShadow = true; dg.add(P(body, 'body'));
  // hátgerinc + farok-lapát
  const spine = FL_BODY.slice(1, 9).map(b => b);
  for (let i = 0; i < 12; i++) {
    const q = i / 11, k = q * (FL_BODY.length - 3), j = Math.min(FL_BODY.length - 2, Math.floor(k)), f = k - j, a = FL_BODY[j + 1], b = FL_BODY[j + 2] || a;
    const x = a[0] + (b[0] - a[0]) * f, z = a[2] + (b[2] - a[2]) * f, r = dgTop(flBody, x, z, 110, 20); if (!r) continue;
    const h = 6.2 - i * 0.28, cm = new T.Mesh(new T.ConeGeometry(Math.max(1.2, 3.1 - i * 0.14), Math.max(2, h), 6), M.spike); cm.position.set(r.p[0], r.p[1] + h * 0.3, r.p[2]); dgOrient(cm, [r.n[0] * 0.5, r.n[1] + 0.3, r.n[2] * 0.5]); cm.castShadow = true; dg.add(cm);
  }
  const TL = FL_BODY[FL_BODY.length - 1], tip = new T.Mesh(new T.SphereGeometry(1, 16, 10), M.spike); tip.scale.set(8.5, 1.8, 5); tip.position.set(TL[0] + 2.5, TL[1] - 3.2, TL[2]); tip.rotation.z = -0.9; tip.castShadow = true; dg.add(P(tip, 'tail'));
  // karmok
  const claw = (px, py, pz, sx, sz, ry, rz) => { const g = new T.Group(); g.position.set(px, py, pz); g.rotation.set(0, ry, rz || 0); const t = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.skin); t.scale.set(sx, 2.2, sz); t.castShadow = true; g.add(t); const c = new T.Mesh(new T.ConeGeometry(1, 3.2, 6), M.claw); c.rotation.x = Math.PI / 2 + 0.2; c.position.set(0, -0.4, sz + 1); g.add(c); dg.add(g); };
  [-1, 0, 1].forEach(k => { claw(26 - Math.abs(k) * 0.5, 40.5, 9.5 + k * 3.2, 4.2, 2.1, 0, 0); claw(19, 39.5, -8.5 + k * 2.8, 3.8, 2, 0, 0); claw(-17 - Math.abs(k) * 0.6, 51.5, 12 + k * 2.6, 3.2, 2, 0, 0.1); });
  // szárnyak: közel (nagy, elöl) + túlsó (kisebb, hátrébb, kicsit följebb) – a váll körül forgathatók
  const SH = [-1, 77, 9], shN = new T.Group(); shN.position.set(SH[0], SH[1], SH[2]); dg.add(shN); const wn = flBuildWing(shN, M, true);
  const shF = new T.Group(); shF.position.set(-6, 79, -10); dg.add(shF);
  const mf = flBuildWing(shF, { mem: M.mem2, bone: M.bone2, claw: M.claw }, false); shF.scale.set(0.9, 0.9, 1); shF.rotation.z = 0.42; shN.rotation.z = -0.1; shN.scale.set(0.88, 0.88, 1);
  M.mem2.color.setRGB(0.78, 0.7, 0.78);
  // fej (a láng felé fordul: a pofa balra-le néz)
  const HP = [-19, 91, 6], hg = new T.Group(); hg.position.set(HP[0], HP[1], HP[2]); dg.add(hg); const head = new T.Group(); head.scale.setScalar(1.2); hg.add(head);
  const hm = new T.Mesh(flHeadGeo(), M.body); hm.castShadow = true; hm.receiveShadow = true; head.add(P(hm, 'head'));
  const jaw = new T.Group(); jaw.position.set(0, -6.8, 2); head.add(jaw);
  const jm = new T.Mesh(flJawGeo(), M.body); jm.castShadow = true; jaw.add(P(jm, 'head'));
  const mo = new T.Mesh(new T.SphereGeometry(1, 14, 8), M.mouth); mo.scale.set(6.6, 1.2, 9); mo.position.set(0, 3.4, 11); jaw.add(mo);
  const tg = new T.Mesh(new T.SphereGeometry(1, 12, 8), M.tongue); tg.scale.set(3.6, 1.3, 6); tg.position.set(0, 3.2, 12); jaw.add(tg);
  [-1, 1].forEach(sx => { const t = new T.Mesh(new T.ConeGeometry(0.9, 2.8, 5), M.tooth); t.position.set(sx * 4.6, 2.6, 19); t.rotation.x = Math.PI; jaw.add(t); const u = new T.Mesh(new T.ConeGeometry(1, 3.4, 5), M.tooth); u.position.set(sx * 4.4, -9.6, 18.5); u.rotation.x = Math.PI; head.add(u); });
  [-1, 1].forEach(sx => { const n = new T.Mesh(new T.SphereGeometry(1, 8, 6), M.nos); n.scale.set(1.2, 0.8, 0.7); n.position.set(sx * 3.9, 1.6, 26.4); head.add(n); });
  const eyes = [-1, 1].map(sx => dgEye(head, sx * 9.6, 4.2, 9.8, 6.1, M));
  const brows = [-1, 1].map(sx => { const b = new T.Mesh(new T.SphereGeometry(1, 12, 8), M.spike); b.scale.set(6.4, 1.7, 2.4); b.position.set(sx * 9.6, 11.4, 11.2); b.castShadow = true; head.add(b); b.userData.sx = sx; return b; });
  [-1, 1].forEach(sx => {
    const g = l3TubeGeo(18, 10), cv = l3CatmullPts([[sx * 8, 11, -4], [sx * 11, 19, -9], [sx * 13.5, 25.5, -18], [sx * 12.5, 28, -29]]);
    l3TubeSet(g, cv, t => 3.9 * Math.pow(1 - t, 0.85) + 0.25, (t, a) => 1 + 0.07 * Math.sin(t * 34), [0, 0, 1]);
    const m = new T.Mesh(g, M.horn); m.castShadow = true; head.add(P(m, 'head'));
    const fin = new T.Group(); head.add(fin); const ed = [[sx * 15, 8, -5], [sx * 26, 13, -9], [sx * 30, 8, -11], [sx * 32, 1, -12], [sx * 28, -5, -10], [sx * 16, -4, -4]];
    dgFan([sx * 14, 2, -4], ed, dgMix(dgC.fMem0, dgC.fBack, 0.5), dgC.fMem1, M.mem, fin);
  });
  kHit(head, 13, 0, 0, 10, 'head');
  // láng: 3 egymásba ágyazott cső (a szájtól a füstoszlop teteje felé), a fej-csoport tengelyén kívül, a gyökérben (a láng helye állandó)
  const fl = new T.Group(); root.add(fl);
  const mk = new T.Object3D(); mk.position.set(0, -2, 26); head.add(mk); hg.rotation.z = 0.42; head.rotation.y = -1.2; root.updateMatrixWorld(true);
  const P0 = root.worldToLocal(mk.getWorldPosition(new T.Vector3())).toArray(), P1 = root.worldToLocal(head.localToWorld(new T.Vector3(0, -2, 36))).toArray(), fw = [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]], fl_ = Math.hypot(fw[0], fw[1], fw[2]) || 1;
  const EE = [-57, 71, 14], A1 = [P0[0] + fw[0] / fl_ * 9, P0[1] + fw[1] / fl_ * 9, P0[2] + fw[2] / fl_ * 9];
  fl.position.set(P0[0], P0[1], P0[2]);
  const rel = p => [p[0] - P0[0], p[1] - P0[1], p[2] - P0[2]], FLP = [P0, A1, [(A1[0] + EE[0]) / 2, (A1[1] + EE[1]) / 2 + 3, (A1[2] + EE[2]) / 2], EE].map(rel);
  const flameMesh = (mat, rk, wob) => { const g = l3TubeGeo(20, 12); l3TubeSet(g, l3CatmullPts(FLP), t => (1.8 + 12.5 * Math.pow(t, 1.2)) * rk, (t, a) => 1 + wob * Math.sin(a * 3 + t * 11) * t, [0, 0, 1]); const m = new T.Mesh(g, mat); m.renderOrder = 6; fl.add(m); return m; };
  const f0 = flameMesh(M.flameO, 1.18, 0.2), f1 = flameMesh(M.flameM, 0.82, 0.16), f2 = flameMesh(M.flameI, 0.44, 0.1);
  [[0.08, 8, 0xffc24a, 0.7], [0.3, 13, 0xff8a1a, 0.55], [0.55, 19, 0xff5a12, 0.4], [0.85, 26, 0xff4010, 0.3]].forEach(q => { const c = l3CatmullPts(FLP)(q[0]), g2 = kGlowSprite(q[2], q[1], q[3], true); g2.position.set(c[0], c[1], c[2] + 4); fl.add(g2); });
  const glow = kGlowSprite(0xff6a14, 30, 0.35, true); const er = rel(EE); glow.position.set(er[0] + 4, er[1] + 2, er[2]); fl.add(glow);
  const lamp = kLight(fl, 0xff8a3a, 1.2, 150, er[0] + 8, er[1] + 6, 8);
  fl.userData.part = 'flame'; [f0, f1, f2].forEach(m => { m.userData.part = 'flame'; parts.push(m); });
  // állapot
  const S = kState({ flap: 0, hx: 0, jaw: 0.62, lid: 0.45, brow: 0.7, blast: 0, bob: 0, wob: 0, tail: 0, lx: 0, ly: 0, fx: 1 }, S => {
    dg.position.set(FL_DX, FL_DY + S.bob * 2.2, 0); dg.rotation.z = S.bob * 0.016 + S.wob * 0.03;
    hg.rotation.z = 0.42 + S.hx + S.wob * 0.05; head.rotation.set(0, -1.2 + S.lx * 0.18, 0); jaw.rotation.x = S.jaw * 0.55;
    eyes.forEach(e => { e.lid.rotation.x = -0.35 + Math.min(1, Math.max(0, S.lid)) * (Math.PI / 2 + 0.35); e.pg.position.x = S.lx * 1.9; e.pg.position.y = -S.ly * 1.3; });
    brows.forEach(b => { b.rotation.z = b.userData.sx * -S.brow * 0.45; b.position.y = 11.4 - S.brow * 2.1; });
    shN.rotation.x = S.flap * 0.55; shN.scale.y = 0.88 * (1 - Math.abs(S.flap) * 0.12); shF.rotation.x = -S.flap * 0.5 + 0.0;
    fl.scale.set(1 + S.blast * 0.28, 1 + S.blast * 0.34, 1 + S.blast * 0.28); glow.material.opacity = 0.35 + S.blast * 0.4; if (lamp) lamp.intensity = 1.2 + S.blast * 1.6;
    f0.scale.x = f0.scale.z = S.fx;
  });
  S.__apply();
  const puffAt = (x, y, z, n, big, vx) => { for (let i = 0; i < n; i++) setTimeout(() => { if (L3.on) drParticle(root, 'smoke', new T.Vector3(x + (Math.random() - 0.5) * 12, y, z + (Math.random() - 0.5) * 6), { vx: (vx || 0) + (Math.random() - 0.5) * 5, vy: 8 + Math.random() * 7, vz: 4, life: 1.9, big: big || 1.3 }); }, i * 140); };
  const ctl = {
    S: S, root: root, busy: false,
    look(p) { if (ctl.busy) return; const v = kLookVec(head, p, 220); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.02) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv(); } },
    blast() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { blast: 1, hx: 0.08, jaw: 1, brow: 1.1, lid: 0.62 }, 0.2, 'out').call(() => { dgJet(root, new T.Vector3(P0[0], P0[1], P0[2]), new T.Vector3(EE[0] - P0[0], EE[1] - P0[1], EE[2] - P0[2]), 36, 1.2); puffAt(-52, 58, 8, 6, 1.7, -4); }).to(S, { flap: 0.8 }, 0.25, 'io').to(S, { flap: -0.2 }, 0.25, 'io').to(S, { flap: 0.6 }, 0.25, 'io').wait(0.3)
        .to(S, { blast: 0, hx: 0, jaw: 0.62, brow: 0.7, lid: 0.45, flap: 0 }, 0.6, 'io').call(() => { ctl.busy = false; }).play();
      l3Anim(1.5, u => { S.wob = Math.sin(u * 40) * (1 - u) * 1.2; S.__apply(); }, () => { S.wob = 0; S.__apply(); });
    },
    flap() { crStop(ctl); ctl.busy = true; l3Anim(1.5, u => { S.flap = Math.sin(u * Math.PI * 6) * 0.9 * Math.min(1, u * 6, (1 - u) * 4); S.bob = Math.sin(u * Math.PI * 3) * 1.2; S.__apply(); }, () => { S.flap = 0; S.bob = 0; S.__apply(); ctl.busy = false; }); },
    puff() { crStop(ctl); const sq = l3Anim(1.3, u => { S.fx = 1 + Math.sin(u * Math.PI * 8) * 0.12 * (1 - u); S.__apply(); }, () => { S.fx = 1; S.__apply(); }); puffAt(-50, 62, 8, 7, 1.5, -3); puffAt(-46, 40, 12, 3, 1.2, -6); },
    blink() { l3Seq().to(S, { lid: 1 }, 0.08, 'out').to(S, { lid: 0.45 }, 0.14, 'io').play(); },
    idle() { if (ctl.busy) return; const r = Math.random(); if (r < 0.4) ctl.blink(); else if (r < 0.75) puffAt(-50, 62, 8, 2, 1.2, -3); else l3Anim(1.4, u => { S.bob = Math.sin(u * Math.PI * 2); S.flap = Math.sin(u * Math.PI * 2) * 0.18; S.__apply(); }, () => { S.bob = 0; S.flap = 0; S.__apply(); }); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M).concat(M.cov || []), d: 60, ctl: ctl };
}
registerDecor3({
  id: 'kis-sarkany', build: flBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (part === 'cloud' || part === 'flame') { c.puff(); st.n = 0; return; }
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n % 2 === 1) c.blast(); else c.flap();
  }
});
