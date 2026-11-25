/* ===== 3D dísz: a fekete sárkány és füstoszlopa (kis-sarkany) – valódi 3D modell (v13; korábban rétegelt 2D kép volt) =====
   A kép (referencia): apró fekete sárkány a földön, a szájából füst ömlik, ami krémszínű, spirálokkal faragott felhő-oszlopba dagad; az oszlop tartja a ferdén dőlő sötét könyveket.
   Itt: a sárkány SDF-szobor (fényes fekete pikkelyek, a fekvő sárkány részletes feje, összehajtott szárnyak, kunkori farok), az oszlop és a füstszalag
   gyanta-szerű krémszínű SDF-háló bevésett spirálokkal (a bevésés a háló része, nem textúra), a 4 könyv valódi doboz: gerinc arany pántokkal és címmel.
   Modell-egységek: a dísz alja a polcon (y = 0), X jobbra, Z a néző felé; kRoot(it, FY_VH) skáláz. A rész-nevek: body (sárkány), cloud (oszlop + szalag), books. ===== */
'use strict';

const FY_VH = 150;
const FY_TILT = 0.3, FY_BW = 16.5, FY_STEP = 17.2, FY_X0 = 15, FY_ANG = Math.atan(FY_TILT), FY_Z = 4, FY_CZ = 22;   // a könyvek: ferdén balra dőlnek, a bal alsó élükön állnak
const FY_NECK = [[-40, 13, 0, 6.8], [-36.8, 17.2, 0, 5.2], [-34.4, 20.6, 0, 4.4]];
const FY_TAIL = [[-64, 9.2, 0, 6.8], [-71.5, 6.4, 0, 5.2], [-77.5, 4.4, 0.5, 4.1], [-81.2, 7.2, 1, 3.3], [-80.6, 12.6, 1, 2.6], [-77, 16.2, 0.5, 2], [-73, 16.6, 0, 1.4], [-70.8, 14, 0, 0.9]];
const FY_BOOKS = [
  { c: '#1e1613', t: 'FEKETE LÁNG', h: 118 }, { c: '#2a121a', t: 'TŰZ ÉS FÜST', h: 116 }, { c: '#131825', t: 'SÁRKÁNYDAL', h: 113 }, { c: '#241b10', t: 'ÉJFÉLI ÉGBOLT', h: 110 }
];
/* az oszlop gömbjei: [x, y, r] – a bal szélük a legbaloldalibb könyv bal lapja mentén, váltakozva be/kilógva */
const FY_LOBES = [[10.9, 11.3], [18.75, 9.9], [26.25, 9.45], [33.4, 8.7], [40.5, 8], [47.25, 7.2], [53.6, 6.45], [59.6, 5.7], [64.9, 4.8], [69.4, 3.6]].map((q, i) => [FY_X0 - FY_TILT * q[0] - q[1] * (i % 2 ? 1.3 : 0.8), q[0], q[1]]);
const FY_MOUTH = [-20.6, 20.4], FY_DS = 1.15, FY_DX = -56.2;   // a sárkány nagyítása és a helye (a váll-pont X-e)
const FY_C = {};
function fyColInit() {
  if (FY_C.back) return;
  Object.assign(FY_C, { back: lc('#050609'), body: lc('#12141d'), belly: lc('#1f2332'), bellyD: lc('#2b3044'), mem0: lc('#06060a'), mem1: lc('#1c1e2a'), memEdge: lc('#4a5070'), jawIn: lc('#401820'), hornB: lc('#0c0c10'), hornT: lc('#70717f') });
}

/* ---------- a sárkány teste ---------- */
const fyE = (x, y, z, cx, cy, cz, rx, ry, rz) => sdEll(x - cx, y - cy, z - cz, rx, ry, rz);
function fyBody(x, y, z) {
  const az = Math.abs(z);
  let d = fyE(x, y, z, -50, 10.2, 0, 19, 8.4, 8.6);                                      // törzs
  d = smin(d, fyE(x, y, z, -61, 8.8, 0, 11, 8.6, 8.8), 6);                              // csípő
  d = smin(d, fyE(x, y, z, -38, 12.8, 0, 9.6, 9.6, 8), 5);                              // mellkas
  d = smin(d, dgChain(x, y, z, FY_NECK, 5), 4);                                          // nyak
  d = smin(d, dgChain(x, y, z, FY_TAIL, 3), 3);                                          // farok
  d = smin(d, fyE(x, y, az, -59.5, 7.6, 6.2, 8.6, 7.2, 4.4), 3.5);                      // hátsó comb
  d = smin(d, sdCone(x, y, az, -57, 5, 7.2, -53.5, 1.8, 8.8, 3.6, 2.6), 2);             // hátsó lábszár
  d = smin(d, fyE(x, y, az, -52, 1.2, 8.8, 5.4, 1.35, 3), 1.5);                         // hátsó talp
  d = smin(d, fyE(x, y, az, -38.5, 9.4, 5.8, 6.2, 7, 3.8), 3);                          // mellső váll
  d = smin(d, sdCone(x, y, az, -37, 7, 6.8, -32.5, 2.4, 8.6, 3.2, 2.4), 2);             // mellső lábszár
  d = smin(d, fyE(x, y, az, -30.2, 1.2, 8.8, 4.3, 1.35, 2.8), 1.5);                     // mellső talp
  const bw = Math.min(1, Math.max(0, (6.5 - y) / 5)), rid = bw > 0 ? 0.16 * bw * Math.pow(0.5 + 0.5 * Math.sin(x * 2.1), 0.7) : 0;   // hasi lemezek dombormű
  return d + rid * (z > 1.5 ? 1 : 0.5) - 0.07 * bw;
}
function fyBodyGeo() { fyColInit(); return drGeoOnce('fyBody', () => sdfGeo(fyBody, [-90, -2, -12], [-18, 32, 12], 0.68, dgShade(fyBody, FY_C, { dorsal: (x, y, z, n) => n[1] }))); }

/* ---------- a füstoszlop és a szalag: spirálosan faragott gyantafelhő ---------- */
/* az (px,py) pont távolsága egy archimédeszi spirál karjától (R: külső sugár, a vég a középponthoz közel); 9, ha a körön kívül */
function fySpiralD(px, py, R, rot, dir) {
  const r = Math.sqrt(px * px + py * py); if (r > R * 1.04) return 9;
  const turns = 1.7, c = 0.88 * R / (6.2832 * turns), th = (Math.atan2(py, px) * dir - rot + 62.832) % 6.2832;
  let k = Math.round((R - c * th - r) / (6.2832 * c)); k = Math.max(0, Math.min(Math.floor(turns), k));
  const phi = th + 6.2832 * k; if (phi > 6.2832 * turns) return Math.abs(r - c * 0.3);
  return Math.abs(r - (R - c * phi));
}
const fyCarve = (d0, w) => d0 >= 9 ? 0 : (1 - dgSm(0.3 * w, 1.1 * w, d0));
function fyCloud(x, y, z) {
  let d = 1e9, bi = -1, bd = 1e9;
  for (let i = 0; i < FY_LOBES.length; i++) { const l = FY_LOBES[i], s = sdSph(x - l[0], y - l[1], z, l[2]); d = i ? smin(d, s, 3.2) : s; if (s < bd) { bd = s; bi = i; } }
  d = smin(d, sdEll(x - 1, y - 1.8, z, 15, 3.2, 10.5), 5);                                // a talajon szétterülő alap
  d = smin(d, sdCone(x, y, z, -5, 5.5, 0, 3, 10, 0, 3.4, 6), 3);                         // ide torkollik a szalag
  if (bd < 2 && bi >= 0) { const l = FY_LOBES[bi], R = 0.7 * l[2], w = 0.55 + l[2] * 0.05; d += 0.95 * (l[2] / 11) * fyCarve(fySpiralD(x - l[0] + l[2] * 0.1, y - l[1] + l[2] * 0.06, R, -2.4 + bi * 0.7, bi % 2 ? -1 : 1), w) * (z > -2 ? 1 : 0.4); }
  return d;
}
function fyCloudGeo() {
  fyColInit();
  return drGeoOnce('fyCloud', () => sdfGeo(fyCloud, [-20, -3, -16], [26, 82, 16], 0.9, (x, y, z) => {
    const n = dgNormY(fyCloud, x, y, z), ao = dgAO(fyCloud, x, y, z, n), up = 0.5 + 0.5 * n[1], t = Math.max(0.35, ao);
    const k = 0.78 + 0.22 * up, r = 0.95 * k * (0.55 + 0.45 * t), g = 0.88 * k * (0.5 + 0.5 * t), b = 0.7 * k * (0.42 + 0.58 * t);
    return [r * 0.86, g * 0.78, b * 0.62].map(v => v * 1.18);
  }));
}
/* a szalag: a szájból indul (helyi origó = a száj), vékonyan; az oszlop aljába torkollik */
const FY_STREAM = [[0, 0, 0, 0.9], [4, -0.8, 0, 1.8], [9, -3, 0, 2.9], [14.5, -6, 0, 4.4], [20, -8.5, 0, 5.8]];
function fyStream(x, y, z) {
  let d = dgChain(x, y, z, FY_STREAM, 3);
  d = smin(d, sdSph(x - 9, y + 3, z, 2.5), 2); d = smin(d, sdSph(x - 14.5, y + 6, z, 3.6), 2);
  const bd1 = sdSph(x - 9, y + 3, z, 2.5), bd2 = sdSph(x - 14.5, y + 6, z, 3.6);
  if (bd1 < 1.6) d += 0.4 * fyCarve(fySpiralD(x - 9, y + 3, 1.7, 0.8, 1), 0.4);
  else if (bd2 < 1.6) d += 0.5 * fyCarve(fySpiralD(x - 14.5, y + 6, 2.5, 1.9, -1), 0.48);
  return d;
}
function fyStreamGeo() {
  fyColInit();
  return drGeoOnce('fyStream', () => sdfGeo(fyStream, [-3, -16, -9], [26, 6, 9], 0.58, (x, y, z) => { const n = dgNormY(fyStream, x, y, z), ao = dgAO(fyStream, x, y, z, n), t = Math.max(0.4, ao); return [0.95 * t * 0.86 * 1.18, 0.88 * t * 0.8 * 1.18, 0.72 * t * 0.66 * 1.18]; }));
}

/* ---------- a könyvek ---------- */
function fySpineTex(b, i) {   // álló gerinc (128 × 1024): arany pántok, címtábla, a cím fentről lefelé
  return kTex(128, 1024, (g, W, H) => {
    g.fillStyle = b.c; g.fillRect(0, 0, W, H);
    const rng = dcRng(50 + i); for (let k = 0; k < 2400; k++) { g.fillStyle = 'rgba(' + (rng() < 0.5 ? '255,235,210' : '0,0,0') + ',' + (0.025 + rng() * 0.06).toFixed(3) + ')'; g.fillRect(rng() * W, rng() * H, 1 + rng() * 2, 1 + rng() * 5); }
    const gold = g.createLinearGradient(0, 0, W, 0); gold.addColorStop(0, '#8a6420'); gold.addColorStop(0.5, '#f1d78b'); gold.addColorStop(1, '#a87a2a');
    [0.045, 0.19, 0.81, 0.955].forEach(q => { const y = q * H; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, y - 14, W, 28); g.fillStyle = b.c; g.fillRect(0, y - 11, W, 22); g.fillStyle = gold; g.fillRect(0, y - 10, W, 4); g.fillRect(0, y + 6, W, 4); g.fillRect(0, y - 1.5, W, 3); });
    [0.075, 0.915].forEach(q => { g.fillStyle = gold; g.fillRect(0, q * H, W, 2.4); });
    g.fillStyle = 'rgba(0,0,0,.34)'; g.fillRect(W * 0.17, H * 0.27, W * 0.66, H * 0.46); g.strokeStyle = gold; g.lineWidth = 3; g.strokeRect(W * 0.17 + 3, H * 0.27 + 3, W * 0.66 - 6, H * 0.46 - 6);
    g.save(); g.translate(W / 2, H / 2); g.rotate(Math.PI / 2); g.font = '700 46px Georgia, "Times New Roman", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(b.t, 2, 4); g.fillStyle = gold; g.fillText(b.t, 0, 2); g.restore();
    const sh = g.createLinearGradient(0, 0, W, 0); sh.addColorStop(0, 'rgba(255,255,255,.12)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
  }, 'fySpine' + i);
}
function fyCoverTex(b, i) {   // a kötéstábla oldala: bőr + arany keret
  return kTex(256, 512, (g, W, H) => {
    g.fillStyle = b.c; g.fillRect(0, 0, W, H);
    const rng = dcRng(70 + i); for (let k = 0; k < 3200; k++) { g.fillStyle = 'rgba(' + (rng() < 0.5 ? '255,235,210' : '0,0,0') + ',' + (0.02 + rng() * 0.05).toFixed(3) + ')'; g.fillRect(rng() * W, rng() * H, 1 + rng() * 4, 1 + rng() * 3); }
    g.strokeStyle = '#c79a3a'; g.globalAlpha = 0.8; g.lineWidth = 3; g.strokeRect(16, 16, W - 32, H - 32); g.lineWidth = 1.4; g.strokeRect(26, 26, W - 52, H - 52); g.globalAlpha = 1;
    g.fillStyle = '#c79a3a'; g.globalAlpha = 0.6; [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 6, 0, 6.283); g.fill(); }); g.globalAlpha = 1;
  }, 'fyCover' + i);
}
function fyTopTex() { return kTex(64, 256, (g, W, H) => { g.fillStyle = '#e6d9bb'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,92,52,.5)'; g.lineWidth = 1; for (let y = 2; y < H; y += 2.6) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.fillStyle = '#2a1c14'; g.fillRect(0, 0, 6, H); g.fillRect(W - 6, 0, 6, H); g.fillRect(0, H - 6, W, 6); }, 'fyTop'); }

/* ---------- építés ---------- */
function fyBuild(it) {
  fyColInit(); const T = THREE, K = kRoot(it, FY_VH), root = K.r, parts = [], mats = []; root.position.x = 5;
  const M = dgMats(true), P = (m) => { m.userData.part = 'body'; parts.push(m); return m; };
  M.body.dispose();
  M.bodyW = l3Skin({ color: '#ffffff', kind: 'scale', cell: 1.35, amt: 0.5, rough: 0.46, env: 0.95, vcol: true, clear: 0.6, clearR: 0.3 });
  M.body = l3Skin({ color: '#ffffff', kind: 'scale', cell: 3.2, amt: 0.5, rough: 0.46, env: 0.95, vcol: true, clear: 0.6, clearR: 0.3 });
  M.resin = l3Skin({ color: '#ffffff', kind: 'grain', cell: 3.5, amt: 0.22, rough: 0.5, env: 0.55, vcol: true, clear: 0.3, clearR: 0.4 });
  const piece = (geo, mat, part, parent) => { const m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.userData.part = part; parts.push(m); (parent || root).add(m); return m; };
  const mk = (bw, bh, bd, mt, g, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(bw, bh, bd), mt); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; m.userData.part = 'books'; parts.push(m); g.add(m); return m; };
  /* könyvek: a bal alsó élükön állnak, balra dőlnek (a bal szomszédnak támaszkodnak) */
  const bk = new T.Group(); root.add(bk); const bkP = [FY_X0 + 3 * FY_STEP + FY_BW * Math.cos(FY_ANG), FY_Z]; bk.position.set(bkP[0], 0, 0);
  const jit = [0.012, -0.018, 0.02, -0.01], bm = [];
  FY_BOOKS.forEach((b, i) => {
    const g = new T.Group(); g.position.set(FY_X0 + i * FY_STEP - bkP[0], 0, FY_Z + (i % 2 ? -1.2 : 0.8)); g.rotation.z = FY_ANG; g.rotation.y = jit[i]; bk.add(g);
    const cv = new T.MeshStandardMaterial({ map: fyCoverTex(b, i), color: 0x8c8c8c, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.35 }), sp = new T.MeshStandardMaterial({ map: fySpineTex(b, i), color: 0xa0a0a0, roughness: 0.5, metalness: 0.12, envMapIntensity: 0.55 }), tp = new T.MeshStandardMaterial({ map: fyTopTex(), roughness: 0.9 }), bt = new T.MeshStandardMaterial({ color: l3Col(b.c), roughness: 0.8 });
    bm.push(cv, sp, tp, bt);
    mk(FY_BW, b.h, 56, [cv, cv, tp, bt, sp, cv], g, FY_BW / 2, b.h / 2, 0);
  });
  mats.push.apply(mats, bm);
  /* a füstoszlop (a talaj-pontján billen/nyúlik) + a szalag (a szájnál forog/nyúlik) */
  const cloud = new T.Group(); cloud.position.set(0, 0, FY_CZ); root.add(cloud); const cm = piece(fyCloudGeo(), M.resin, 'cloud', cloud);
  const stream = new T.Group(); stream.position.set(FY_MOUTH[0], FY_MOUTH[1], FY_CZ + 2); root.add(stream); piece(fyStreamGeo(), M.resin, 'cloud', stream);
  /* a sárkány: a váll körül „él” (recoil, bob), a lábak a padlón */
  const dg = new T.Group(), dgX = FY_DX; dg.position.set(dgX, 0, FY_CZ + 2); dg.scale.setScalar(FY_DS); root.add(dg); const inner = new T.Group(); inner.position.x = 50; dg.add(inner);
  piece(fyBodyGeo(), M.bodyW, 'body', inner);
  const sp = (pos, nrm, h, r) => { const c = new T.Mesh(new T.ConeGeometry(r, h, 6), M.spike); c.position.set(pos[0] + nrm[0] * h * 0.3, pos[1] + nrm[1] * h * 0.3, pos[2] + nrm[2] * h * 0.3); dgOrient(c, nrm); c.castShadow = true; P(c); inner.add(c); };
  [-36, -39.5, -43.5, -47.5, -51.5, -55.5, -59.5, -63.5, -67.5, -72, -77].forEach((x, i) => { const r = dgTop(fyBody, x, 0, 30, -2); if (!r) return; sp(r.p, [r.n[0] * 0.5 - 0.18, r.n[1] + 0.25, 0], Math.max(1.4, 3.6 - i * 0.15), Math.max(0.55, 1.25 - i * 0.04)); });
  const tipG = new T.Group(); tipG.position.set(-70.9, 14.0, 0); tipG.rotation.z = 3.67; tipG.scale.z = 0.4; inner.add(tipG); { const c = new T.Mesh(new T.ConeGeometry(1.55, 4, 6), M.spike); c.position.y = 1.6; c.castShadow = true; tipG.add(P(c)); }
  const toe = (px, py, pz, ry) => { const g = new T.Group(); g.position.set(px, py, pz); g.rotation.y = ry; const t = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.skin); t.scale.set(1.5, 0.95, 0.85); t.castShadow = true; g.add(P(t)); const c = new T.Mesh(new T.ConeGeometry(0.62, 2.1, 6), M.claw); c.rotation.z = -Math.PI / 2 - 0.5; c.position.set(1.7, -0.35, 0); c.castShadow = true; g.add(c); inner.add(g); };
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k => { toe(-49.6 + 0.4 * Math.abs(k), 1, s * (8.8 + k * 1.5), -k * 0.28); toe(-27.4 + 0.3 * Math.abs(k), 1, s * (8.8 + k * 1.4), -k * 0.26); }));
  /* szárnyak: összehajtva a háton, a hátrafelé nyúló ujjak; a „távolabbi” kisebb */
  const wings = [1, -1].map(side => {
    const g = dgWing(M, side < 0, FY_C); g.scale.setScalar(side > 0 ? 0.42 : 0.35); g.position.set(side > 0 ? -45.5 : -43.5, side > 0 ? 17.2 : 17.6, side > 0 ? 4.6 : -4.8); g.rotation.y = Math.PI; g.userData.side = side;
    g.traverse(o => { if (o.isMesh) { o.userData.part = 'body'; parts.push(o); } }); inner.add(g); return g;
  });
  /* fej: kicsinyített, részletes fej (a fekvő sárkányéval közös szerelvény), kissé lehajtva, a száj résnyire nyitva */
  const hp = new T.Group(); hp.position.set(-33, 22.5, 0); hp.rotation.z = -0.28; inner.add(hp);
  const hj = new T.Group(); hj.rotation.y = Math.PI / 2; hj.scale.setScalar(0.5); hp.add(hj);
  const head = new T.Group(); hj.add(head);
  const HR = dgHeadRig(M, FY_C, P, 'fyHead', head), jaw = HR.jaw, mo = HR.mo, tg = HR.tg, eyes = HR.eyes, brows = HR.brows;
  /* kattintási zóna a teljes sárkány köré (a vékony lábak/szárnyak miatt) */
  const zone = (cx, cy, cz, w, h, d, part) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshBasicMaterial({ visible: false })); m.visible = false; m.position.set(cx, cy, cz); m.userData.part = part; root.add(m); parts.push(m); mats.push(m.material); return m; };
  zone(-58, 20, FY_CZ + 2, 70, 42, 26, 'body');
  /* a száj izzása fújáskor (additív) */
  const glow = kGlowSprite(0xffe2b0, 24, 0, true); glow.position.set(FY_MOUTH[0] + 4, FY_MOUTH[1] + 1, FY_CZ + 12); root.add(glow);

  const S = kState({ bob: 0, recoil: 0, blast: 0, flapF: 0, flapB: 0, swell: 0, squash: 0, wob: 0, drift: 0, lid: 0.25, lx: 0, ly: 0, jaw: 0.14 }, S => {
    dg.position.set(dgX - S.recoil * 2.4, S.bob * 3, FY_CZ + 2); dg.rotation.z = S.recoil * 0.025 + S.bob * 0.01;
    wings[0].rotation.z = -0.3 - S.flapF * 0.5; wings[1].rotation.z = -0.5 - S.flapB * 0.45;
    stream.scale.set(1 + S.blast * 0.7, 1 + S.blast * 0.42, 1 + S.blast * 0.4); glow.material.opacity = Math.min(1, S.blast) * 0.85; glow.scale.set(24 + S.blast * 16, 24 + S.blast * 16, 1);
    cloud.scale.set(1 + S.swell * 0.07 + S.squash * 0.1, 1 + S.swell * 0.05 - S.squash * 0.07, 1 + S.swell * 0.05); cloud.rotation.z = S.drift * 0.012;
    bk.rotation.z = S.wob * 0.011 + S.swell * 0.004;
    jaw.rotation.x = S.jaw * 0.5 + S.blast * 0.3; mo.visible = tg.visible = jaw.rotation.x > 0.06; mo.scale.y = 1.2 + S.jaw * 2.2; tg.position.y = 3.0 - S.jaw * 1.2;
    hp.rotation.z = -0.28 + S.blast * 0.14; head.rotation.y = S.lx * 0.12; head.rotation.x = -S.ly * 0.08;
    eyes.forEach(e => { const c = Math.min(1, Math.max(0, S.lid)); e.lid.rotation.x = -0.35 + c * (Math.PI / 2 + 0.35); e.arc.visible = c > 0.93; e.pg.position.x = S.lx * 0.5; e.pg.position.y = -S.ly * 0.4; });
    brows.forEach(b => { b.rotation.z = b.userData.sx * (-0.28 - S.blast * 0.3); });
  });
  S.__apply();
  const puff = (x, y, n, big, vx, vy) => {   // krémszínű füstpamacs, felfelé szálló, szétterülő
    for (let i = 0; i < n; i++) setTimeout(() => {
      if (!L3.on) return;
      const sp2 = l3Sprite(l3Glow(), 0xfff0d4, 8, 0); sp2.renderOrder = 14; sp2.position.set(x + (Math.random() - 0.5) * 9, y, 16); root.add(sp2);
      const life = 1.5 + Math.random() * 0.6, ax = ((vx || 0) + (Math.random() - 0.5) * 7), ay = ((vy == null ? 11 : vy) + Math.random() * 6), x0 = sp2.position.x;
      l3Anim(life, u => { const t = u * life; sp2.position.set(x0 + ax * t, y + ay * t, 16); sp2.material.opacity = Math.sin(Math.min(1, u * 1.1) * Math.PI) * 0.7; const k = (7 + u * 15) * (big || 1); sp2.scale.set(k, k, 1); }, () => { root.remove(sp2); sp2.material.dispose(); });
    }, i * 140);
  };
  const top = FY_LOBES[FY_LOBES.length - 1], tx = top[0], ty = top[1] + top[2];
  const ctl = {
    S: S, root: root, busy: false,
    look(p) { if (ctl.busy) return; const v = kLookVec(eyes[0].g, p, 220); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.06) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv('v'); } },
    blast() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { blast: 1, recoil: 1, swell: 1, jaw: 0.6, lid: 0.5 }, 0.22, 'out').call(() => { puff(tx + 2, ty + 2, 8, 1.4, -2, 13); puff(FY_MOUTH[0] + 14, FY_MOUTH[1] + 6, 4, 1.1, 5, 6); })
        .wait(0.8).to(S, { blast: 0, recoil: 0, swell: 0, jaw: 0.14, lid: 0.25 }, 0.7, 'io').call(() => { ctl.busy = false; }).play();
      l3Anim(1.6, u => { S.wob = Math.sin(u * 46) * (1 - u) * 1.3; S.__apply(); }, () => { S.wob = 0; S.__apply(); });
    },
    flap() {
      crStop(ctl); ctl.busy = true;
      l3Anim(1.5, u => { const e = Math.min(1, u * 6, (1 - u) * 4), f = Math.sin(u * Math.PI * 6); S.flapF = f * e; S.flapB = Math.sin(u * Math.PI * 6 - 0.5) * e; S.bob = Math.max(0, Math.sin(u * Math.PI * 3)) * e; S.__apply(); }, () => { S.flapF = 0; S.flapB = 0; S.bob = 0; S.__apply(); ctl.busy = false; });
    },
    puff() {
      crStop(ctl);
      l3Anim(1.3, u => { S.squash = Math.sin(u * Math.PI * 8) * 0.5 * (1 - u); S.__apply(); }, () => { S.squash = 0; S.__apply(); });
      puff(tx + 1, ty + 1, 7, 1.3, -2, 12); puff(tx + 8, ty - 22, 3, 1.1, 3, 8);
    },
    books() { crStop(ctl); l3Anim(1.4, u => { S.wob = Math.sin(u * 40) * (1 - u) * 1.6; S.__apply(); }, () => { S.wob = 0; S.__apply(); }); puff(tx + 6, ty + 6, 2, 1, 2, 9); },
    blink() { l3Seq().to(S, { lid: 1 }, 0.08, 'out').to(S, { lid: 0.25 }, 0.14, 'io').play(); },
    idle() {
      if (ctl.busy) return; const r = Math.random();
      if (r < 0.4) ctl.blink(); else if (r < 0.7) puff(tx, ty, 2, 1, -1, 9); else if (r < 0.88) l3Anim(1.6, u => { S.drift = Math.sin(u * Math.PI); S.__apply(); }, () => { S.drift = 0; S.__apply(); });
      else l3Anim(1.1, u => { S.flapF = Math.sin(u * Math.PI * 2) * 0.5 * (1 - u); S.flapB = S.flapF * 0.7; S.__apply(); }, () => { S.flapF = 0; S.flapB = 0; S.__apply(); });
    }
  };
  S.__apply();
  return { grp: K.g, parts: parts, mats: kMatsAll(M).concat(mats), d: 50, ctl: ctl };
}
registerDecor3({
  id: 'kis-sarkany', build: fyBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (part === 'cloud') { c.puff(); st.n = 0; return; }
    if (part === 'books') { c.books(); st.n = 0; return; }
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n % 2 === 1) c.blast(); else c.flap();
  }
});
