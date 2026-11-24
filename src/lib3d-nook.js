/* ===== 3D dísz: BOOK NOOK – könyvméretű mini szoba (és ráközelítve: egy szobányi mini világ) =====
   Valódi 3D szoba nyitott fronttal: deszkapadló, csíkos tapéta, íves ablak (hold, csillagok, tetők), beépített könyvespolc sok kis könyvvel + földgömb,
   kandalló (táncoló láng), fotel párnával, kis asztal lámpával, szőnyeg, alvó cica, növény, gerendák, fényfüzér, függőlámpa.
   A polcon a doboz-diorámát látod (enyhe parallaxissal); rákattintva a kis világ „felnagyul”: a kamera belép a szobába (nkZoomOpen, lent), ott körül lehet nézni, és a tárgyakra kattintani.
   A lámpa kapcsol (mentődik: d.off). Egy szoba-építő (nkRoom) szolgál mindkét nézetet. */
'use strict';

const NK = { W: 104, H: 100, D: 84, WX: -9, WY0: 42, WR: 13, WY1: 73 };
const NK_LABEL = { sw: 'Lámpa', fire: 'Kandalló', window: 'Ablak', cat: 'Cica', globe: 'Földgömb', plant: 'Növény', chair: 'Fotel', shelf: 'Könyvespolc', clock: 'Óra', rug: 'Szőnyeg' };

/* ---------- textúrák ---------- */
const nkRep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
function nkTexPlanks() {
  return nkRep(kTex(256, 256, (g, W, H) => {
    const rng = dcRng(5), cols = ['#4c2e1e', '#40261a', '#55331f', '#46291b'], ph = H / 6;
    for (let i = 0; i < 6; i++) {
      g.fillStyle = cols[i % 4]; g.fillRect(0, i * ph, W, ph);
      for (let k = 0; k < 14; k++) { g.strokeStyle = 'rgba(70,38,14,' + (0.06 + rng() * 0.14).toFixed(2) + ')'; g.lineWidth = 0.6 + rng(); const y = i * ph + rng() * ph; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + (rng() - .5) * 6, W * .6, y + (rng() - .5) * 6, W, y + (rng() - .5) * 4); g.stroke(); }
      g.fillStyle = 'rgba(40,20,8,.55)'; g.fillRect(0, i * ph, W, 1.6); g.fillRect((i % 2) * 90 + 40, i * ph, 1.4, ph);
    }
  }, 'nkPlanks'), 1 / 40, 1 / 40);
}
function nkTexPaper() {
  return nkRep(kTex(128, 128, (g, W, H) => {
    g.fillStyle = '#3d1019'; g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 32) { g.fillStyle = 'rgba(214,170,90,.09)'; g.fillRect(x, 0, 16, H); }
    [[16, 20], [48, 52], [80, 20], [112, 52], [16, 84], [48, 116], [80, 84], [112, 116]].forEach(p => {
      g.fillStyle = 'rgba(200,160,86,.45)'; for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(p[0] + Math.cos(a * 1.2566) * 4.4, p[1] + Math.sin(a * 1.2566) * 4.4, 1.7, 0, 6.283); g.fill(); }
      g.fillStyle = 'rgba(214,174,92,.85)'; g.beginPath(); g.arc(p[0], p[1], 2.3, 0, 6.283); g.fill();
    });
  }, 'nkPaper'), 1 / 32, 1 / 32);
}
function nkTexRug() {
  return kTex(256, 256, (g, W, H) => {
    const c = W / 2; g.fillStyle = '#4e0f1c'; g.beginPath(); g.arc(c, c, c, 0, 6.283); g.fill();
    [[118, '#b99a52'], [108, '#1c2a3a'], [92, '#a8802f'], [80, '#4e0f1c'], [66, '#b99a52']].forEach(r => { g.fillStyle = r[1]; g.beginPath(); g.arc(c, c, r[0], 0, 6.283); g.fill(); });
    g.fillStyle = '#1c2a3a'; g.beginPath(); g.arc(c, c, 52, 0, 6.283); g.fill();
    g.fillStyle = '#b99a52'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.save(); g.translate(c + Math.cos(a) * 72, c + Math.sin(a) * 72); g.rotate(a + 1.5708); g.beginPath(); g.moveTo(0, -8); g.lineTo(6, 0); g.lineTo(0, 8); g.lineTo(-6, 0); g.closePath(); g.fill(); g.restore(); }
    g.fillStyle = '#a8802f'; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = i % 2 ? 20 : 44; g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); } g.closePath(); g.fill();
    g.strokeStyle = 'rgba(60,20,16,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(c, c, c - 2, 0, 6.283); g.stroke();
  }, 'nkRug');
}
function nkTexWin() {   // az ablak mögötti éjszakai táj: hold, csillagok, háztetők
  return kTex(250, 400, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0f1646'); gr.addColorStop(0.55, '#2a2860'); gr.addColorStop(0.85, '#5a2038'); gr.addColorStop(1, '#b8643a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const rng = dcRng(9); g.fillStyle = '#fff6c8'; for (let i = 0; i < 34; i++) { g.globalAlpha = 0.35 + rng() * 0.65; g.beginPath(); g.arc(rng() * W, rng() * H * 0.62, 0.8 + rng() * 1.6, 0, 6.283); g.fill(); } g.globalAlpha = 1;
    const mg = g.createRadialGradient(168, 112, 14, 168, 112, 110); mg.addColorStop(0, 'rgba(255,240,190,.55)'); mg.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = mg; g.fillRect(0, 0, W, H);
    g.fillStyle = '#fff1bb'; g.beginPath(); g.arc(168, 112, 36, 0, 6.283); g.fill(); g.fillStyle = '#ecd88a'; [[-10, -12, 8], [12, 10, 6], [-4, 16, 4.5]].forEach(c => { g.beginPath(); g.arc(168 + c[0], 112 + c[1], c[2], 0, 6.283); g.fill(); });
    g.fillStyle = '#1c1432'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 330); [[30, 330], [30, 300], [62, 300], [62, 338], [86, 338], [86, 312], [96, 296], [106, 312], [106, 346], [140, 346], [140, 322], [176, 322], [176, 300], [212, 300], [212, 340], [250, 340]].forEach(p => g.lineTo(p[0], p[1])); g.lineTo(W, H); g.closePath(); g.fill();
    g.fillStyle = '#ffd27a'; [[40, 312], [46, 322], [72, 350], [118, 358], [150, 335], [186, 312], [196, 326], [230, 352]].forEach(p => g.fillRect(p[0], p[1], 5, 6));
  }, 'nkWin');
}
function nkTexGlobe() {
  return kTex(128, 64, (g, W, H) => { g.fillStyle = '#1f4a6a'; g.fillRect(0, 0, W, H); g.fillStyle = '#6a7a4a'; [[22, 22, 16, 10], [40, 40, 6, 8], [74, 20, 20, 9], [92, 36, 10, 10], [108, 22, 9, 6], [60, 46, 6, 5]].forEach(c => { g.beginPath(); g.ellipse(c[0], c[1], c[2], c[3], 0, 0, 6.283); g.fill(); }); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(0, 0, W, 4); g.fillRect(0, H - 4, W, 4); }, 'nkGlobe');
}
function nkTexPic(n) {
  return kTex(64, 80, (g, W, H) => {
    if (n === 0) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#c98a4a'); gr.addColorStop(1, '#7a2a3a'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#fff1bb'; g.beginPath(); g.arc(40, 28, 12, 0, 6.283); g.fill(); g.fillStyle = '#5a3d6a'; g.beginPath(); g.moveTo(0, 62); g.lineTo(22, 38); g.lineTo(40, 58); g.lineTo(54, 44); g.lineTo(64, 56); g.lineTo(64, 80); g.lineTo(0, 80); g.fill(); }
    else { g.fillStyle = '#cdbf9e'; g.fillRect(0, 0, W, H); g.fillStyle = '#2f5a4a'; g.beginPath(); g.ellipse(32, 46, 14, 20, 0, 0, 6.283); g.fill(); g.fillStyle = '#e8a43c'; g.beginPath(); g.arc(32, 22, 7, 0, 6.283); g.fill(); g.strokeStyle = '#7a4a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 66); g.lineTo(32, 76); g.stroke(); }
  }, 'nkPic' + n);
}
function nkTexClock() { return kTex(64, 64, (g, W, H) => { g.fillStyle = '#f6ecd2'; g.beginPath(); g.arc(32, 32, 30, 0, 6.283); g.fill(); g.strokeStyle = '#6a3f25'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#3a2418'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(32 + Math.cos(a) * 24 - 1, 32 + Math.sin(a) * 24 - 1, 2.4, 2.4); } g.strokeStyle = '#3a2418'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(32, 32); g.lineTo(32, 14); g.moveTo(32, 32); g.lineTo(44, 38); g.stroke(); }, 'nkClock'); }

/* ---------- geometria-segédek ---------- */
function nkMerge(list) {   // list: [{g (indexelt BufferGeometry), m (Matrix4), c ([r,g,b])}] → vertex-színes geometria
  const T = THREE, P = [], N = [], I = [], C = [], v = new T.Vector3(), nm = new T.Matrix3(); let off = 0;
  list.forEach(e => {
    const g = e.g, p = g.attributes.position, n = g.attributes.normal; nm.getNormalMatrix(e.m);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(e.m); P.push(v.x, v.y, v.z); v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z); C.push(e.c[0], e.c[1], e.c[2]); }
    const ix = g.index.array; for (let k = 0; k < ix.length; k++) I.push(ix[k] + off); off += p.count;
  });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); geo.setAttribute('color', new T.Float32BufferAttribute(C, 3)); geo.setIndex(I); return geo;
}
function nkArchGeo(cx, y0, hw, hs, t, tb, depth) {   // íves keret (gyűrű): a nyílás közepe cx, alja y0, fél-szélessége hw, egyenes szakasz hs, vastagság t, alsó léc tb
  const T = THREE, s = new T.Shape(), ro = hw + t, ri = hw;
  s.moveTo(cx - ro, y0 - tb); s.lineTo(cx + ro, y0 - tb); s.lineTo(cx + ro, y0 + hs); s.absarc(cx, y0 + hs, ro, 0, Math.PI, false); s.lineTo(cx - ro, y0 - tb);
  const h = new T.Path(); h.moveTo(cx - ri, y0); h.lineTo(cx + ri, y0); h.lineTo(cx + ri, y0 + hs); h.absarc(cx, y0 + hs, ri, 0, Math.PI, false); h.lineTo(cx - ri, y0); s.holes.push(h);
  return new T.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 14 });
}
function nkWallGeo(u0, u1, H, hole) {
  const T = THREE, s = new T.Shape(); s.moveTo(u0, 0); s.lineTo(u1, 0); s.lineTo(u1, H); s.lineTo(u0, H); s.lineTo(u0, 0);
  if (hole) { const h = new T.Path(); hole(h); s.holes.push(h); } return new T.ShapeGeometry(s, 16);
}
function nkChairF(x, y, z) {   // fotel (lokális: elöl +z), magasság ≈ 36
  let d = sdBox(x, y - 7.5, z, 12.5, 4, 11.5, 2.5);                                  // alap
  d = smin(d, sdBox(x, y - 12, z - 1.2, 11.2, 3.2, 10, 2.4), 2);                     // ülőpárna
  d = smin(d, sdBox(x, y - 23, z + 9.6, 13.2, 13.5, 3.2, 3), 3);                      // háttámla
  d = smin(d, sdBox(Math.abs(x) - 12, y - 16.5, z, 3, 8.5, 11.5, 2.6), 2);           // karfák
  return d;
}
function nkCatF(x, y, z) {   // összegömbölyödött cica (lokális: fej -x, +z felé)
  let d = sdEll(x - 1, y - 4.6, z, 9.6, 5, 7.6);
  d = smin(d, sdEll(x - 6.4, y - 4.1, z - 3.6, 4.8, 4.2, 4.6), 3);
  d = smin(d, sdEll(x + 5, y - 3.6, z - 1, 5, 4.1, 5), 3);
  d = smin(d, dgChain(x, y, z, [[8.5, 2.6, 3.5, 1.9], [10.5, 2.2, 8, 1.7], [6.5, 1.9, 12, 1.5], [-0.5, 1.8, 11.5, 1.3], [-6, 2, 8, 1.1]], 2), 2);   // farok körbeölel
  d = smin(d, sdEll(x + 9, y - 2.4, z - 6.5, 2.6, 1.8, 3), 2);                        // mancs
  return d;
}

/* ---------- a szoba ---------- */
function nkRoom(mode, it) {
  const T = THREE, zoom = mode === 'zoom', W = NK.W, H = NK.H, D = NK.D, hx = W / 2, g = new T.Group(), parts = [], M = {}, flick = [], pend = [];
  const PT = (o, part) => { o.traverse(m => { if (m.isMesh) { if (part) m.userData.part = part; parts.push(m); m.castShadow = !m.userData.noShadow && !m.userData.shell; m.receiveShadow = true; } }); return o; };
  const mk = o => l3Mat(Object.assign({ roughness: 0.8 }, o));
  M.floor = mk({ color: '#ffffff', map: nkTexPlanks(), roughness: 0.62 }); M.paper = mk({ color: '#ffffff', map: nkTexPaper(), roughness: 0.92 });
  M.ceil = mk({ color: '#2e1c18', roughness: 0.95 }); M.beam = mk({ color: '#3a2014', roughness: 0.7, map: l3Wood(), bumpMap: l3Wood(), bumpScale: 0.8 });
  M.wood = mk({ color: '#4c2d1b', map: l3Wood(), bumpMap: l3Wood(), bumpScale: 1.0, roughness: 0.55 }); M.paint = mk({ color: '#34231e', roughness: 0.6 }); M.case = mk({ color: '#3d2619', roughness: 0.55 });
  M.dark = mk({ color: '#2a1a12', roughness: 0.8 }); M.stone = mk({ color: '#a8957c', roughness: 0.95 }); M.stoneD = mk({ color: '#7a6856', roughness: 0.95 });
  M.brass = mk({ color: '#e0b04a', roughness: 0.3, metalness: 1 }); M.fabric = l3Skin({ color: '#6a1827', kind: 'grain', cell: 3, amt: 0.4, rough: 0.9, env: 0.3 }); M.fabric2 = mk({ color: '#bfa06a', roughness: 0.95 });
  M.curtain = mk({ color: '#4a0f1d', roughness: 0.9, side: T.DoubleSide }); M.rugM = mk({ color: '#ffffff', map: nkTexRug(), roughness: 0.98 });
  M.books = mk({ color: '#ffffff', vertexColors: true, roughness: 0.72 }); M.terra = mk({ color: '#5a3022', roughness: 0.8 }); M.leaf = mk({ color: '#3f8a52', roughness: 0.6, side: T.DoubleSide }); M.leaf2 = mk({ color: '#5fa860', roughness: 0.6, side: T.DoubleSide });
  M.shade = mk({ color: '#e0a04c', roughness: 0.7, emissive: '#ff9a3a', side: T.DoubleSide }); M.bulb2 = new T.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false });
  M.win = new T.MeshBasicMaterial({ map: nkTexWin(), toneMapped: false }); M.fireIn = new T.MeshBasicMaterial({ color: l3Col('#1a0c08') }); M.ember = new T.MeshBasicMaterial({ color: 0xff7a22, toneMapped: false });
  M.glass = mk({ color: '#1f4a6a', map: nkTexGlobe(), roughness: 0.35 }); M.cat = l3Skin({ color: '#ffffff', kind: 'fur', cell: 3.2, amt: 0.5, rough: 0.85, vcol: true, env: 0.3 }); M.catP = l3Skin({ color: '#d9782e', kind: 'fur', cell: 3.2, amt: 0.5, rough: 0.85, env: 0.3 });
  const add = (o, part, parent) => { (parent || g).add(o); PT(o, part || 'room'); return o; };
  const box = (w, h, d, mat, x, y, z, part, parent) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return add(m, part, parent); };

  /* héj: padló, falak, mennyezet, gerendák */
  const SH = o => { o.userData.shell = true; return o; };
  const fl = new T.Mesh(nkWallGeo(-hx, hx, D), M.floor); fl.rotation.x = -Math.PI / 2; add(SH(fl), 'room');
  const bw = new T.Mesh(nkWallGeo(-hx, hx, H, h => { h.moveTo(NK.WX - NK.WR, NK.WY0); h.lineTo(NK.WX + NK.WR, NK.WY0); h.lineTo(NK.WX + NK.WR, NK.WY1); h.absarc(NK.WX, NK.WY1, NK.WR, 0, Math.PI, false); h.lineTo(NK.WX - NK.WR, NK.WY0); }), M.paper); bw.position.z = -D; add(SH(bw), 'room');
  const lw = new T.Mesh(nkWallGeo(0, D, H), M.paper); lw.rotation.y = Math.PI / 2; lw.position.x = -hx; add(SH(lw), 'room');
  const rw = new T.Mesh(nkWallGeo(-D, 0, H), M.paper); rw.rotation.y = -Math.PI / 2; rw.position.x = hx; add(SH(rw), 'room');
  const cl = new T.Mesh(nkWallGeo(-hx, hx, D), M.ceil); cl.geometry.translate(0, -D, 0); cl.rotation.x = Math.PI / 2; cl.position.y = H; add(SH(cl), 'room');
  [-14, -40, -66].forEach(z => box(W, 4.6, 5.2, M.beam, 0, H - 2.3, z));
  box(W, 2.6, 1.2, M.paint, 0, 1.3, -D + 0.6); box(1.2, 2.6, D, M.paint, -hx + 0.6, 1.3, -D / 2); box(1.2, 2.6, D, M.paint, hx - 0.6, 1.3, -D / 2);   // szegélylécek

  /* ablak: ég, keret, kereszt, párkány, függöny */
  const sky = new T.Mesh(new T.PlaneGeometry(32, 51), M.win); sky.position.set(NK.WX, 63.6, -D - 0.12); add(sky, 'window'); sky.castShadow = false;
  const wf = new T.Mesh(nkArchGeo(NK.WX, NK.WY0, NK.WR, NK.WY1 - NK.WY0, 2.6, 2.2, 3.4), M.paint); wf.position.z = -D - 1.6; add(wf, 'window');
  box(1.3, 44, 1.6, M.paint, NK.WX, 62, -D - 0.4, 'window'); box(26, 1.3, 1.6, M.paint, NK.WX, 60, -D - 0.4, 'window'); box(26, 1.3, 1.6, M.paint, NK.WX, 74, -D - 0.4, 'window');
  box(33, 2.2, 8, M.paint, NK.WX, NK.WY0 - 2.6, -D + 3.4, 'window');
  const rod = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 50, 8), M.brass); rod.rotation.z = Math.PI / 2; rod.position.set(NK.WX, 90.5, -D + 3.4); add(rod, 'window'); [-24, 24].forEach(dx => { const f = new T.Mesh(new T.SphereGeometry(1.4, 8, 6), M.brass); f.position.set(NK.WX + dx, 90.5, -D + 3.4); add(f, 'window'); });
  const curt = [];
  [-1, 1].forEach(sd => {
    const cg = new T.PlaneGeometry(9.5, 57, 12, 1), cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 2.1 + sd) * 1.25 + (cp.getY(i) > 0 ? 0 : 0.0));
    cg.computeVertexNormals(); const c = new T.Mesh(cg, M.curtain); c.position.set(NK.WX + sd * 17.2 + (sd < 0 ? -0.5 : 0.5), 60.5, -D + 3.2); add(c, 'window'); curt.push(c);
  });

  /* beépített könyvespolc a bal falon */
  const bx = -hx + 5.5, bz0 = -81, bz1 = -34, shelfYs = [0.8, 19.8, 38.8, 57.8, 76.8, 95.4];
  box(1, H - 2, bz1 - bz0 + 1, M.case, -hx + 0.6, H / 2, (bz0 + bz1) / 2, 'shelf'); box(10.6, H - 3, 2.2, M.case, bx, H / 2, bz0 - 0.4, 'shelf'); box(10.6, H - 3, 2.2, M.case, bx, H / 2, bz1 + 0.4, 'shelf');
  shelfYs.forEach(y => box(10.6, 1.6, bz1 - bz0 + 1, M.case, bx, y, (bz0 + bz1) / 2, 'shelf'));
  { // könyvek: egy összefésült háló, csúcsszínekkel
    const rng = dcRng(23), pal = ['#a8403d', '#33618f', '#c79d45', '#3f8a6a', '#7a4a8a', '#d9784a', '#2f4a6a', '#8a6a3a', '#b04a6a', '#5a8a9a', '#e9dfc4'].map(lc), list = [];
    for (let r = 0; r < 5; r++) {
      let z = bz0 + 2.2; const y0 = shelfYs[r] + 0.8;
      while (z < bz1 - 3) {
        const w = 1.7 + rng() * 1.8, h = 10.5 + rng() * 6.5, cc = pal[Math.floor(rng() * pal.length)], lean = rng() < 0.07 ? (rng() < 0.5 ? -0.28 : 0.28) : 0, skip = rng() < 0.06;
        if (skip) { z += 3 + rng() * 3; continue; }
        if (r === 4 && z > -76 && z < -60) { z += 17; continue; }   // a legfelső polcon hely a földgömbnek
        const m = new T.Matrix4().compose(new T.Vector3(bx, y0 + h / 2 * Math.cos(lean), z + w / 2), new T.Quaternion().setFromEuler(new T.Euler(lean, 0, 0)), new T.Vector3(1, 1, 1));
        list.push({ g: new T.BoxGeometry(7.6, h, w), m: m, c: cc });
        const m2 = new T.Matrix4().compose(new T.Vector3(bx + 3.9, y0 + h * 0.76 * Math.cos(lean), z + w / 2), new T.Quaternion().setFromEuler(new T.Euler(lean, 0, 0)), new T.Vector3(1, 1, 1));
        list.push({ g: new T.BoxGeometry(0.4, 0.7, w + 0.08), m: m2, c: lc('#c9a14a') });
        z += w + (lean ? 1.4 : 0.05);
      }
    }
    const bm = new T.Mesh(nkMerge(list), M.books); add(bm, 'shelf');
  }
  const gl = new T.Group(); gl.position.set(bx + 0.5, 77.6, -68); add(gl, 'globe');   // földgömb a 4. polcon
  const gst = new T.Mesh(new T.CylinderGeometry(2.2, 2.8, 1.2, 14), M.brass); gst.position.y = 0.6; gl.add(gst);
  const gax = new T.Group(); gax.position.y = 7.4; gax.rotation.z = 0.41; gl.add(gax); const gball = new T.Mesh(new T.SphereGeometry(5, 24, 16), M.glass); gax.add(gball);
  const gring = new T.Mesh(new T.TorusGeometry(5.9, 0.35, 8, 28), M.brass); gring.rotation.y = Math.PI / 2; gax.add(gring); PT(gl, 'globe');
  const gpos = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 7, 6), M.brass); gpos.position.set(0, 4.2, 0); gl.add(gpos);

  /* kandalló a jobb falon: kémény-mell, kő-keret nyílással, rönkök, parázs, láng, kandallópárkány gyertyákkal, óra */
  const fz = -34, fxf = hx - 8;   // a kémény-mell előlapja x=fxf (44)
  box(8, H, 36, M.stone, hx - 4, H / 2, fz, 'fire');
  box(14, 2.2, 38, M.stoneD, fxf - 5, 1.1, fz, 'fire');                                        // kandallólap
  [-1, 1].forEach(s2 => box(6, 27, 6.4, M.stone, fxf - 3, 15.7, fz + s2 * 10.2, 'fire'));      // oszlopok
  box(6, 5.4, 27, M.stone, fxf - 3, 31.1, fz, 'fire');                                         // szemöldökgerenda
  box(10, 2.6, 33, M.wood, fxf - 5, 34.8, fz, 'fire'); box(1, 1.1, 30, M.brass, fxf - 10.1, 34.4, fz, 'fire');   // párkány
  const fin = new T.Mesh(new T.PlaneGeometry(14, 25), M.fireIn); fin.rotation.y = -Math.PI / 2; fin.position.set(fxf - 0.05, 15, fz); add(fin, 'fire'); fin.userData.shell = true;
  [-1, 1].forEach(s2 => { const ln = new T.Mesh(new T.PlaneGeometry(6, 26), M.fireIn); ln.position.set(fxf - 3, 15.5, fz + s2 * 6.88); if (s2 > 0) ln.rotation.y = Math.PI; add(ln, 'fire'); ln.userData.shell = true; });
  { const ln = new T.Mesh(new T.PlaneGeometry(6, 14), M.fireIn); ln.rotation.x = Math.PI / 2; ln.position.set(fxf - 3, 28.32, fz); add(ln, 'fire'); ln.userData.shell = true; }
  [-1, 1].forEach(s2 => { const lg = new T.Mesh(new T.CylinderGeometry(1.9, 1.9, 12, 10), M.beam); lg.rotation.x = Math.PI / 2; lg.rotation.z = s2 * 0.1; lg.position.set(fxf - 3.4, 4.6, fz + s2 * 2.6); add(lg, 'fire'); });
  box(4.4, 1.2, 12, M.ember, fxf - 3.2, 3.0, fz, 'fire').userData.shell = true;
  const flames = [[0, 8, 10, 0xff8a2a, 0.85], [-3.6, 6, 7.5, 0xffb23a, 0.75], [3.4, 6.4, 8, 0xff6a20, 0.75], [0.4, 11, 8.5, 0xffd860, 0.65], [0, 5, 14, 0xff5a18, 0.38]].map(q => { const s = kGlowSprite(q[3], q[2], q[4], true); s.position.set(fxf - 4.4, 2.2 + q[1], fz + q[0]); s.userData.base = q[2]; s.userData.bo = q[4]; g.add(s); flick.push(s); return s; });
  const fx = fxf;
  const clk = new T.Mesh(new T.CircleGeometry(4.6, 24), new T.MeshStandardMaterial({ map: nkTexClock(), roughness: 0.5 })); clk.rotation.y = -Math.PI / 2; clk.position.set(fxf - 0.2, 56, fz); add(clk, 'clock');
  const cfr = new T.Mesh(new T.TorusGeometry(4.7, 0.6, 8, 24), M.brass); cfr.rotation.y = Math.PI / 2; cfr.position.set(fxf - 0.2, 56, fz); add(cfr, 'clock');
  [-9, 10].forEach((dz, i) => { const hh = i ? 5 : 7, cd = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, hh, 10), M.fabric2); cd.position.set(fxf - 5, 36.1 + hh / 2, fz + dz); add(cd, 'fire'); const fs = kGlowSprite(0xffc060, 4.6, 0.8, true); fs.position.set(fxf - 5, 36.1 + hh + 1.2, fz + dz); g.add(fs); flick.push(fs); fs.userData.base = 4.6; fs.userData.bo = 0.8; });

  /* szőnyeg + cica */
  const rug = new T.Mesh(new T.CircleGeometry(25, 40), M.rugM); rug.rotation.x = -Math.PI / 2; rug.position.set(-4, 0.25, -44); add(rug, 'rug'); rug.castShadow = false;
  const catG = new T.Group(); catG.position.set(-5, 0.3, -46); catG.rotation.y = 1.15; catG.scale.setScalar(1.15); add(catG, 'cat');
  const cgeo = drGeoOnce('nkCat', () => sdfGeo(nkCatF, [-14, 0, -10], [20, 14, 18], 0.9, (x, y, z) => { const s = 0.5 + 0.5 * Math.sin(x * 1.3 + z * 0.5 + y * 0.8); return y < 2.2 && x < 0 ? lc('#fff2e0') : dgMix(lc('#ea9440'), lc('#b85a22'), dgSm(0.55, 0.95, s) * 0.8); }));
  const cbody = new T.Mesh(cgeo, M.cat); cbody.castShadow = true; catG.add(cbody); PT(catG, 'cat');
  [-1, 1].forEach(sx => { const e = new T.Mesh(new T.ConeGeometry(1.7, 3.2, 4), M.catP); e.position.set(-6.2, 9.1, -3.6 + sx * 2.5); e.rotation.x = sx * 0.28; e.rotation.z = 0.12; catG.add(e); e.userData.part = 'cat'; parts.push(e); });
  [-1, 1].forEach(sx => { const ln = new T.Mesh(new T.BoxGeometry(0.3, 0.32, 1.7), new T.MeshBasicMaterial({ color: 0x2a1a10 })); ln.position.set(-10.5, 5.4, -3.6 + sx * 2.3); catG.add(ln); });
  const zz = l3Sprite(kZTex(), 0xffffff, 6, 0); zz.position.set(-6, 13, -42); g.add(zz);

  /* fotel + párna + kis asztal + lámpa */
  const chG = new T.Group(); chG.position.set(13, 0, -62); chG.rotation.y = -0.62; add(chG, 'chair');
  const chM = new T.Mesh(drGeoOnce('nkChair', () => sdfGeo(nkChairF, [-17, 2, -15], [17, 38, 15], 0.9)), M.fabric); chM.castShadow = true; chG.add(chM);
  [[-9.5, -8.5], [9.5, -8.5], [-9.5, 8.5], [9.5, 8.5]].forEach(p => { const lg = new T.Mesh(new T.CylinderGeometry(1.1, 0.7, 4.6, 8), M.beam); lg.position.set(p[0], 2.3, p[1]); chG.add(lg); });
  const pil = new T.Mesh(new T.SphereGeometry(1, 16, 12), M.fabric2); pil.scale.set(6.4, 6, 2.2); pil.position.set(-2, 20.2, -3.9); pil.rotation.set(-0.28, 0.25, 0.4); chG.add(pil); PT(chG, 'chair');
  const tb = new T.Group(); tb.position.set(37, 0, -73); add(tb, 'room');
  const ttop = new T.Mesh(new T.CylinderGeometry(6.4, 6.4, 1.5, 24), M.wood); ttop.position.y = 24.6; tb.add(ttop); const tst = new T.Mesh(new T.CylinderGeometry(0.9, 1.3, 24, 10), M.beam); tst.position.y = 12; tb.add(tst); const tft = new T.Mesh(new T.CylinderGeometry(4, 4.6, 1, 16), M.wood); tft.position.y = 0.5; tb.add(tft); PT(tb, 'room');
  const lamp = new T.Group(); lamp.position.set(39.4, 25.4, -73.6); g.add(lamp);
  lamp.add(kLathe([[0, 0], [3.2, 0], [3.4, 0.5], [2.4, 1.4], [0.9, 3], [0.8, 9], [0.4, 10], [0, 10]], 18, M.terra)); lamp.add(kLathe([[3, 8.4], [6.4, 17], [6.4, 17.4], [3, 8.8]], 20, M.shade));
  PT(lamp, 'sw'); [lamp].forEach(l => l.traverse(m => { if (m.isMesh) m.userData.part = 'sw'; }));
  const stackG = new T.Group(); stackG.position.set(32.6, 25.4, -71.4); g.add(stackG); [[0, 0.8, 0x6a4a8a, 0.3], [0.2, 2.4, 0x2f6a5a, -0.2]].forEach(b => { const bk = new T.Mesh(new T.BoxGeometry(5.6, 1.5, 4.2), mk({ color: '#' + b[2].toString(16).padStart(6, '0'), roughness: 0.7 })); bk.position.set(b[0], b[1], 0); bk.rotation.y = b[3]; stackG.add(bk); }); PT(stackG, 'room');

  /* növény a padlón + falképek */
  const pl = new T.Group(); pl.position.set(-29, 0, -74); add(pl, 'plant');
  pl.add(kLathe([[0, 0], [4.4, 0], [6, 10], [6.8, 10.8], [6.2, 11.4], [0, 11.4]], 18, M.terra));
  const rng2 = dcRng(41); for (let i = 0; i < 11; i++) { const lf = new T.Mesh(new T.SphereGeometry(1, 10, 8), i % 2 ? M.leaf : M.leaf2), a = i * 2.4 + rng2(), tilt = 0.45 + rng2() * 0.7, ln = 11 + rng2() * 9; lf.scale.set(2.4, ln / 2, 0.55); lf.position.set(Math.sin(a) * Math.sin(tilt) * ln * 0.45, 11 + Math.cos(tilt) * ln * 0.5, Math.cos(a) * Math.sin(tilt) * ln * 0.45); lf.rotation.set(Math.cos(a) * tilt, a, -Math.sin(a) * tilt); pl.add(lf); } PT(pl, 'plant');
  [[22, 70, 0], [34, 61, 1]].forEach(p => { const fm = box(11, 14, 1.4, M.wood, p[0], p[1], -D + 1, 'room'), pc = new T.Mesh(new T.PlaneGeometry(8.6, 11.6), new T.MeshStandardMaterial({ map: nkTexPic(p[2]), roughness: 0.8 })); pc.position.set(p[0], p[1], -D + 1.8); add(pc, 'room'); });

  /* függőlámpa + fényfüzérek */
  const pe = new T.Group(); pe.position.set(14, 0, -30); g.add(pe); const cord = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 22, 6), M.dark); cord.position.y = H - 11; pe.add(cord);
  const pshade = kLathe([[0, 0], [8.5, -0.5], [8.8, 0], [1.4, 9], [1.4, 11], [0, 11]], 22, M.shade); pshade.position.y = 68; pe.add(pshade);
  const pbulb = new T.Mesh(new T.SphereGeometry(2.2, 12, 8), M.bulb2); pbulb.position.y = 68.8; pe.add(pbulb); PT(pe, 'sw');
  const bulbs = [], strGeo = [], mkStr = (a, b, sag, n) => { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag, a[2] + (b[2] - a[2]) * t]); } const ln = kLines(pts.flatMap((p, i) => i ? [pts[i - 1], p] : []), 0x1c1018, g, 0.9); for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag - 1.6, a[2] + (b[2] - a[2]) * t]; strGeo.push({ g: new T.SphereGeometry(1.15, 8, 6), m: new T.Matrix4().makeTranslation(p[0], p[1], p[2]), c: [1, 1, 1] }); const s = kGlowSprite(0xffc060, 7, 0.7, true); s.position.set(p[0], p[1], p[2]); g.add(s); bulbs.push(s); } };
  mkStr([-50, 96, -D + 2], [50, 96, -D + 2], 8, 13); mkStr([-50, 98, -10], [50, 98, -10], 7, 12); mkStr([-hx + 1, 97, -78], [-hx + 1, 97, -30], 3, 6);
  const bm2 = new T.Mesh(nkMerge(strGeo), new T.MeshBasicMaterial({ vertexColors: true, color: 0xffd27a, toneMapped: false })); g.add(bm2); M.bulb = bm2.material;

  /* fények */
  const L = {};
  if (!L3.lowq && !L3.lite || zoom) {
    L.lamp = new T.PointLight(0xffb866, 1.3, 120, 1.6); L.lamp.position.set(38, 38, -70); g.add(L.lamp);
    L.fire = new T.PointLight(0xff7a2a, 1.5, 110, 1.6); L.fire.position.set(fx - 8, 11, fz); g.add(L.fire);
    L.pend = new T.PointLight(0xffd29a, 0.9, 100, 1.6); L.pend.position.set(14, 66, -30); g.add(L.pend);
  }
  /* szegmens: a falon belüli világítás-egyensúly a polcos nézetben a globális fényre épül */

  /* shooting star */
  const star = kGlowSprite(0xfff2c0, 5, 0, true); star.position.set(NK.WX + 8, 80, -D - 1); g.add(star);

  /* állapot + animáció */
  const off0 = it && it.d && it.d.off;
  const S = kState({ lit: off0 ? 0 : 1, fl: 0, flare: 0, sway: 0, tw: 0, spin: 0, wake: 0, shoot: 0 }, S => {
    const lit = S.lit, f = 1 + 0.16 * Math.sin(S.fl * 13) + 0.1 * Math.sin(S.fl * 23 + 1), fb = f + S.flare * 0.7;
    M.shade.emissiveIntensity = 0.03 + 0.42 * lit; M.shade.color.setScalar(0.35 + 0.65 * lit); M.bulb.color.setRGB(0.12 + 0.88 * lit, 0.1 + 0.8 * lit, 0.06 + 0.5 * lit);
    bulbs.forEach((b, i) => { b.material.opacity = 0.7 * lit * (0.75 + 0.25 * Math.sin(S.tw * 6.283 * 2 + i * 1.3)); b.visible = lit > 0.02; });
    if (L.lamp) { L.lamp.intensity = 1.3 * lit; L.pend.intensity = 0.9 * lit; L.fire.intensity = 1.5 * fb; }
    flick.forEach((s, i) => { const k = (i % 2 ? f : fb + 0.05 * i) * (S.flare ? 1 + S.flare * 0.5 : 1); s.scale.set(s.userData.base * k, s.userData.base * k * (1.0 + 0.2 * Math.sin(S.fl * 17 + i)), 1); s.material.opacity = Math.min(1, s.userData.bo * (0.85 + 0.2 * f)); });
    curt.forEach((c, i) => { c.rotation.y = Math.sin(S.sway * 6.283 * 2 + i * 1.7) * 0.05 * Math.sin(S.sway * Math.PI); });
    gax.rotation.y = S.spin * Math.PI * 6; const k = Math.max(0, S.wake);
    catG.scale.set(1.15 * (1 + 0.04 * Math.sin(S.fl * 1.7)), 1.15 * (1 + 0.05 * Math.sin(S.fl * 1.7) + k * 0.28), 1.15 * (1 + k * 0.04)); catG.rotation.z = -k * 0.08; cbody.rotation.y = k * 0.0;
    zz.material.opacity = S.zz || 0; zz.position.y = 13 + (S.zz || 0) * 2;
    star.material.opacity = Math.sin(Math.min(1, S.shoot) * Math.PI) * 0.95; star.position.set(NK.WX + 10 - S.shoot * 22, 82 - S.shoot * 22, -D - 1);
  });
  const dimM = Object.keys(M).filter(k => M[k] && M[k].isMeshStandardMaterial && !M[k].emissiveIntensity).map(k => M[k]); dimM.push(M.cat, M.catP, M.fabric); dimM.forEach(m => { m.userData.c0 = m.color.clone(); });
  const S0 = S.__apply; S.__apply = () => { S0(); const k = 0.3 + 0.7 * S.lit; dimM.forEach(m => m.color.copy(m.userData.c0).multiplyScalar(k)); };
  S.__apply();
  const ctl = {
    S: S, L: L, room: g,
    lit(on) { ctl.stop(); ctl.seq = l3Seq().to(S, { lit: on ? 1 : 0 }, on ? 0.6 : 0.45, 'io').play(); },
    blaze() { ctl.stop(); l3Anim(1.6, u => { S.flare = Math.sin(Math.min(1, u * 1.3) * Math.PI); S.fl += 0.2; S.__apply(); }, () => { S.flare = 0; S.__apply(); });
      for (let i = 0; i < 7; i++) setTimeout(() => { if (L3.on || zoom) drParticle(g, 'spark', new T.Vector3(fx - 6, 7 + Math.random() * 4, fz + (Math.random() - 0.5) * 8), { vx: -8 - Math.random() * 8, vy: 14 + Math.random() * 12, vz: (Math.random() - 0.5) * 8, life: 1.1 }); }, i * 80); },
    shoot() { l3Anim(1.3, u => { S.shoot = u; S.sway = u; S.__apply(); }, () => { S.shoot = 0; S.sway = 0; S.__apply(); }); },
    wake() { l3Seq().to(S, { wake: 1 }, 0.5, 'out').call(() => { for (let i = 0; i < 3; i++) setTimeout(() => drParticle(g, 'heart', new T.Vector3(-8 + i * 3, 14 + i, -44), { vx: (i - 1) * 3, vy: 12, life: 1.7, big: 0.9 }), i * 220); }).wait(1.1).to(S, { wake: 0 }, 0.7, 'io').play(); },
    rustle() { l3Anim(1.5, u => { pl.rotation.z = Math.sin(u * 6.283 * 3) * 0.05 * (1 - u); pl.rotation.x = Math.cos(u * 6.283 * 2.4) * 0.04 * (1 - u); }, () => { pl.rotation.set(0, 0, 0); }); },
    fluff() { l3Anim(0.9, u => { const k = Math.sin(u * Math.PI); pil.scale.set(6.4 * (1 + 0.14 * k), 6 * (1 - 0.2 * k), 2.2 * (1 + 0.5 * k)); }, () => { pil.scale.set(6.4, 6, 2.2); }); },
    chime() { l3Anim(1.1, u => { const k = Math.sin(u * Math.PI * 5) * (1 - u) * 0.12 + 1; clk.scale.set(k, k, k); cfr.scale.set(k, k, k); }, () => { clk.scale.set(1, 1, 1); cfr.scale.set(1, 1, 1); });
      for (let i = 0; i < 5; i++) setTimeout(() => drParticle(g, 'spark', new T.Vector3(fx - 1, 56 + Math.random() * 3, fz + (Math.random() - 0.5) * 10), { vx: -6 - Math.random() * 8, vy: 6 + Math.random() * 10, vz: (Math.random() - 0.5) * 8, life: 1 }), i * 70); },
    spin() { l3Anim(2.2, u => { S.spin = 1 - Math.pow(1 - u, 3); S.__apply(); }, () => { S.spin = 0; S.__apply(); }); },
    sleepZ() { l3Anim(2.6, u => { S.zz = Math.sin(u * Math.PI) * 0.9; S.__apply(); }, () => { S.zz = 0; S.__apply(); }); },
    tick(t) { S.fl = t; S.tw = t * 0.25; S.__apply(); },
    idle() { if (zoom) return; const r = Math.random(); if (r < 0.34) l3Anim(1.4, u => { S.fl += 0.35; S.__apply(); }); else if (r < 0.62) l3Anim(2.2, u => { S.tw = u; S.__apply(); }, () => { S.tw = 0; S.__apply(); }); else if (r < 0.82) ctl.sleepZ(); else l3Anim(2, u => { S.sway = u; S.__apply(); }, () => { S.sway = 0; S.__apply(); }); },
    stop() { if (ctl.seq) ctl.seq.stop(); }
  };
  return { g: g, parts: parts, M: M, S: S, ctl: ctl, L: L };
}

/* ---------- keret + szoba összeállítása (a polcon és a ráközelítésnél is ez) ---------- */
function nkAssemble(root, it, mode) {
  const T = THREE, W = NK.W, H = NK.H, D = NK.D, R = nkRoom(mode, it);
  const fm = l3Mat({ color: '#a8743f', map: l3Wood(), bumpMap: l3Wood(), bumpScale: 1.1, roughness: 0.55, envMapIntensity: 0.5 }), parts = R.parts.slice();
  R.M.frame = fm;
  const room = R.g; room.position.set(0, 6, 0); root.add(room);
  const fz = -D / 2 + 3, fd = D + 6;
  [kBox(W + 12, 6, fd, fm, root, 0, 109, fz, 'box'), kBox(W + 12, 6, fd, fm, root, 0, 3, fz, 'box'), kBox(6, H + 6, fd, fm, root, -(W / 2 + 3), 56, fz, 'box'), kBox(6, H + 6, fd, fm, root, W / 2 + 3, 56, fz, 'box'), kBox(W + 12, H + 12, 2, fm, root, 0, 56, -D - 1.2, 'box')].forEach(m => parts.push(m));
  kBox(W + 14, 2.4, 3, fm, root, 0, 108.8, 3.4, 'box'); parts.push(kBox(W + 14, 2.4, 3, fm, root, 0, 3.2, 3.4, 'box'));
  parts.push(kHit(room, 14, 39.4, 38, -73.6, 'sw'));
  return { R: R, parts: parts, room: room };
}
function nkBuild(it) {
  const K = kRoot(it, 112), A = nkAssemble(K.r, it, 'shelf'), ctl = A.R.ctl; ctl.item = it;
  return { grp: K.g, parts: A.parts, mats: kMatsAll(A.R.M), d: 70, ctl: ctl };
}
registerDecor3({
  id: 'book-nook', build: nkBuild,
  onClick(it, A, e, part) {
    const c = it.ctl;
    if (part === 'sw') { const on = A.toggle(); c.lit(on); return; }
    nkZoomOpen(it, A);
  }
});
