/* ===== 3D díszek: sárkány-pár könyvtámasz (fej + farok) =====
   Szobrászott (SDF → háló) fekete gyanta sárkány: pikkely-bump bőr, csillogó borostyán szem, csuklós alsó állkapocs, külön mozgó szemöldök-gerinc és szemhéj,
   fogak, szarvak; a farok egy animálható cső (tüskékkel). Egységek: „rajz-egység” (a 150×170-es 2D rajz mértéke), a csoport it.h/170-nel skálázva.
   Elrendezés (elem-lokális): X jobbra, Y fel (a polc = 0), Z a néző felé; a doboz a polc hátsó felében áll, a fej a doboz elé nyúlik ki. */
'use strict';

const DR = { cs: null, sk: '#222733' };
const drCol = {};
function drColInit() { if (drCol.skin) return; Object.assign(drCol, { skin: lc('#222733'), horn: lc('#566179'), mouth: lc('#7a1f26'), tongue: lc('#a63a44'), crate: lc('#1a1d25'), cavity: lc('#040404'), claw: lc('#222733') }); }
const drMix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function drGeoOnce(key, fn) { return L3.geo[key] || (L3.geo[key] = fn()); }

/* ---------- gyors geometria-összefésülés (fogak, karmok) ---------- */
function drMerge(list) {
  const T = THREE, P = [], N = [], I = [], v = new T.Vector3(), nm = new T.Matrix3(); let off = 0;
  list.forEach(e => {
    const g = e.g, m = e.m, p = g.attributes.position, n = g.attributes.normal; nm.getNormalMatrix(m);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); P.push(v.x, v.y, v.z); v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z); }
    const ix = g.index.array; for (let k = 0; k < ix.length; k++) I.push(ix[k] + off); off += p.count;
  });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); geo.setIndex(I); geo.computeBoundingSphere(); geo.userData.shared = true; return geo;
}
function drCone(len, rad, pos, dir, seg) {   // kúp: a talpa pos-nál, a csúcsa pos + dir*len
  const T = THREE, g = new T.ConeGeometry(rad, len, seg || 6), q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dir[0], dir[1], dir[2]).normalize());
  const c = new T.Vector3(dir[0], dir[1], dir[2]).normalize().multiplyScalar(len / 2).add(new T.Vector3(pos[0], pos[1], pos[2]));
  return { g: g, m: new T.Matrix4().compose(c, q, new T.Vector3(1, 1, 1)) };
}

/* ---------- formák (az „u” tér: az orr +u felé néz; a végső tér X = −u) ---------- */
function drSkullU(u, y, z) {
  const az = Math.abs(z);
  let d = sdEll(u - 30, y - 5, z, 36, 31, 28);                                                       // koponya
  d = smin(d, sdCone(u, y, z * 1.12, 48, 4, 0, 92, -3, 0, 18, 10.5), 10);                           // pofa
  d = smin(d, sdCone(u, y, z * 1.5, 38, 20, 0, 93, 1, 0, 9, 5.6), 7);                              // orrhát
  d = smin(d, sdSph(u - 95, y + 1, z * 1.08, 10.8), 5);                                              // orrcsúcs
  d = smin(d, sdSph(u - 86, y - 3, az - 9, 6.4), 3.5);                                               // orrszárny
  d = smin(d, sdEll(u - 40, y + 2, az - 17, 24, 15, 11), 9);                                         // pofacsont
  d = smin(d, sdEll(u - 36, y - 18, az - 17, 17, 6, 8), 5);                                          // szemöldök-alap
  d = smin(d, sdEll(u - 22, y - 33, z, 13, 5, 7), 5);                                                // koponyatető-taraj
  // szarvak (hátra és fel ívelnek)
  for (let k = 0; k < 1; k++) {
    d = smin(d, sdCone(u, y, az, 14, 26, 13, 0, 43, 15, 7.6, 5.2), 4);
    d = smin(d, sdCone(u, y, az, 0, 43, 15, -20, 53, 17, 5.2, 3.1), 3);
    d = smin(d, sdCone(u, y, az, -20, 53, 17, -44, 50, 17.5, 3.1, 0.7), 2);
  }
  d = smin(d, sdCone(u, y, az, 24, 22, 20, 17, 33, 25, 4.6, 0.9), 3);                                // kis előre szarv
  d = smin(d, sdCone(u, y, az, -2, -2, 22, -22, -9, 30, 6.2, 1.2), 3);                               // arcpofa-tüske
  d = smin(d, sdCone(u, y, az, 6, 6, 24, -12, 4, 33, 4.8, 1), 3);
  d = smin(d, sdCone(u, y, z, 16, 31, 0, 3, 47, 0, 4.6, 0.8), 2);                                    // háti tüskék
  d = smin(d, sdCone(u, y, z, 0, 27, 0, -15, 40, 0, 4.4, 0.8), 2);
  d = smin(d, sdCone(u, y, z, -12, 18, 0, -29, 27, 0, 4.2, 0.8), 2);
  // szemgödör + orrlyuk (kivésve)
  d = smax(d, -sdSph(u - 40, y - 8, az - 23, 8.8), 2.4);
  d = smax(d, -sdEll(u - 97, y - 2.5, az - 5.4, 4.2, 2.8, 2.8), 1.6);
  return d;
}
function drSkullColor(x, y, z) {
  const u = -x, az = Math.abs(z);
  let c = drCol.skin;
  const th = l3Smooth(37, 52, y); if (th > 0) c = drMix(c, drCol.horn, th * 0.9);
  if (u < 2 && y < 10 && az > 18) c = drMix(c, drCol.horn, l3Smooth(2, -20, u) * 0.8);   // arc-tüske
  if (y < -10.5 && u > 22 && u < 98 && az < 13.5) c = drMix(c, drCol.mouth, l3Smooth(-10.5, -13, y));
  return c;
}
function drJawU(u, y, z) {   // a csuklóhoz (u=6, y=-18) viszonyítva NINCS eltolva: az eltolást a hívó végzi
  const az = Math.abs(z);
  let d = sdEll(u - 52, y + 22.5, z, 47, 9, 11.5);
  d = smin(d, sdSph(u - 8, y + 20, az - 11, 10.5), 6);
  d = smin(d, sdEll(u - 22, y + 22, z, 22, 11, 19), 9);
  d = smin(d, sdSph(u - 93, y + 18.5, z, 7.4), 5);
  d = smin(d, sdCone(u, y, az, 14, -28, 16, -2, -38, 22, 6, 1), 3);                                  // áll-tüske
  return d;
}
function drJawColor(x, y, z) {   // csukló-relatív végső tér → u-tér
  const u = -x + 6, yy = y - 18, az = Math.abs(z);   // helyreállítjuk az abszolút fej-koordinátát
  if (yy > -17.5 && az < 10.6 && u > 12 && u < 96) return drMix(drCol.skin, drCol.tongue, l3Smooth(-17.5, -14.5, yy));
  return drCol.skin;
}
function drBrowU(u, y, z) {   // a +z oldali szemöldök-gerinc, a hátsó vége az origó (u irány előre)
  let d = sdCone(u, y, z, 0, 0, 0, 14, -0.5, 0, 4.6, 4.8);
  d = smin(d, sdCone(u, y, z, 14, -0.5, 0, 29, -3.5, 0.5, 4.8, 3.2), 3);
  d = smin(d, sdCone(u, y, z, 4, 3, 0, 8, 9, 0, 3.2, 0.6), 1.5);
  d = smin(d, sdCone(u, y, z, 15, 2, 0, 20, 8, 0, 3, 0.6), 1.5);
  d = smin(d, sdCone(u, y, z, 25, -0.5, 0, 30, 4.6, 0, 2.6, 0.5), 1.5);
  return d;
}
function drCrateF(x, y, z) {
  const o = sdBox(x, y, z, 43, 80, 35, 3.6), c = sdBox(x, y, z - 12, 37, 74, 41, 2);
  return smax(o, -c, 1.4);
}
function drCrateColor(x, y, z) { return (Math.abs(x) < 38 && Math.abs(y) < 75 && z < 36) ? drCol.cavity : drCol.crate; }
const drCrateGeo = () => drGeoOnce('drCrate', () => sdfGeo(drCrateF, [-46, -82, -37], [46, 82, 37], 2.2, drCrateColor));
function drPalmF(x, y, z) {
  let d = sdEll(x, y - 11, z, 27, 11.5, 20);
  for (let k = -1; k <= 1; k++) d = smin(d, sdCone(x, y, z, -12, 8, 9 * k, -46 + Math.abs(k) * 3, 4.6, 24 * k, 6.4, 3.6), 3.5);
  d = smin(d, sdSph(x - 22, y - 13, z, 13), 8);
  return d;
}

/* ---------- anyagok ---------- */
function drMats() {
  const skinV = l3Skin({ color: '#ffffff', rough: 0.4, metal: 0.42, kind: 'scale', cell: 8.2, amt: 1.25, env: 1.0, vcol: true, clear: 0.6, clearR: 0.28 });
  const skin = l3Skin({ color: DR.sk, rough: 0.4, metal: 0.42, kind: 'scale', cell: 8.2, amt: 1.25, env: 1.0, clear: 0.6, clearR: 0.28 });
  const resin = l3Mat({ color: '#ffffff', roughness: 0.44, metalness: 0.28, vertexColors: true, envMapIntensity: 0.62, clear: 1, clearcoat: 0.3, clearcoatRoughness: 0.42 });
  const bone = l3Mat({ color: '#ece4cf', roughness: 0.32, metalness: 0, envMapIntensity: 0.8 });
  const iris = l3Mat({ color: '#ffffff', roughness: 0.22, metalness: 0, clear: 1, clearcoat: 1, clearcoatRoughness: 0.08, emissive: '#ff8a1c', emissiveIntensity: 0.28, map: drIrisTex(), envMapIntensity: 1.5 });
  const sclera = l3Mat({ color: '#a24a0a', roughness: 0.3, metalness: 0 });
  const pupil = new THREE.MeshBasicMaterial({ color: 0x0a0605 });
  const horn = l3Skin({ color: '#3f485d', rough: 0.34, metal: 0.5, kind: 'scale', cell: 5, amt: 1, env: 1.25, clear: 0.7, clearR: 0.2 });
  const lid = l3Skin({ color: DR.sk, rough: 0.4, metal: 0.42, kind: 'scale', cell: 8.2, amt: 1.0, env: 1.0, clear: 0.5, clearR: 0.3 });
  return { skinV: skinV, skin: skin, resin: resin, bone: bone, iris: iris, sclera: sclera, pupil: pupil, lid: lid, horn: horn, all: [skinV, skin, resin, bone, iris, sclera, pupil, lid, horn] };
}
function drIrisTex() {
  if (L3.irisTex) return L3.irisTex;
  const c = document.createElement('canvas'); c.width = 8; c.height = 128; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#fff3b8'); gr.addColorStop(0.3, '#ffc233'); gr.addColorStop(0.62, '#e8890e'); gr.addColorStop(0.9, '#8c3508'); gr.addColorStop(1, '#4a1a05');
  g.fillStyle = gr; g.fillRect(0, 0, 8, 128); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return (L3.irisTex = t);
}
function drMesh(geo, mat, parent, name) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); if (name) m.userData.part = name; return m; }

/* ---------- részecskék (füst, szikra, szív) ---------- */
function drParticle(parent, kind, pos, opt) {
  const T = THREE; opt = opt || {};
  const tex = kind === 'heart' ? l3HeartTex() : l3Glow(), col = kind === 'smoke' ? 0x8a8f9c : kind === 'spark' ? 0xffb347 : 0xffffff;
  const sp = l3Sprite(tex, col, kind === 'heart' ? 9 : kind === 'smoke' ? 7 : 3.2, 0); if (kind === 'spark') sp.material.blending = T.AdditiveBlending;
  sp.position.copy(pos); sp.renderOrder = 10; parent.add(sp);
  const vx = opt.vx || 0, vy = opt.vy || 0, vz = opt.vz || 0, life = opt.life || 1.4, big = opt.big || 1, x0 = pos.x, y0 = pos.y, z0 = pos.z, wob = Math.random() * 6;
  l3Anim(life, u => {
    const t = u * life;
    sp.position.set(x0 + vx * t + (kind === 'heart' ? Math.sin(t * 5 + wob) * 2.2 : 0), y0 + vy * t - (kind === 'spark' ? 28 * t * t : 0), z0 + vz * t);
    const fade = kind === 'smoke' ? Math.sin(u * Math.PI) * 0.62 : kind === 'spark' ? (1 - u) : Math.sin(Math.min(1, u * 1.15) * Math.PI) * 0.95;
    sp.material.opacity = Math.max(0, fade); const sc = (kind === 'smoke' ? 6 + u * 12 : kind === 'spark' ? 3.2 * (1 - u * 0.7) : 8 + u * 3) * big; sp.scale.set(sc, sc, 1);
  }, () => { parent.remove(sp); sp.material.dispose(); });
}

/* ---------- a fej-modell ---------- */
function drBuildHead(it) {
  drColInit(); const T = THREE, M = drMats(), s = it.h / 170, root = new T.Group(), parts = [];
  root.scale.setScalar(s); root.position.z = 0;
  const S = { jaw: 0, brow: 0, squint: 0, blink: 0, pup: 0.34, lean: 0, nod: 0, yaw: 0, glow: 0.28, lx: 0, ly: 0, purr: 0, ph: 0 };
  // doboz
  const crateG = drCrateGeo();
  const crate = drMesh(crateG, M.resin, root, 'box'); crate.position.set(29, 80, -53); parts.push(crate);
  // mancs a polc szélén
  const palmG = drGeoOnce('drPalm', () => sdfGeo(drPalmF, [-60, -2, -26], [40, 32, 26], 1.6, () => drCol.claw));
  const paw = new T.Group(); paw.position.set(-6, 0, 14); root.add(paw); const pm = drMesh(palmG, M.skinV, paw, 'claw'); parts.push(pm);
  const tipG = drGeoOnce('drTips', () => drMerge([-1, 0, 1].map(k => drCone(13, 3.6, [-46 + Math.abs(k) * 3, 4.6, 24 * k], [-1, -0.25, 0.55 * k], 7))));
  drMesh(tipG, M.bone, paw, 'claw');
  // a nyak + fej csoport: a forgáspont a doboz belsejében
  const G = new T.Group(); G.position.set(30, 20, -50); root.add(G);
  const ng = l3TubeGeo(26, 20), nc = l3CatmullPts([[0, -14, 0], [-1, 14, 8], [-1, 40, 28], [4, 64, 50]]);
  l3TubeSet(ng, nc, t => 23 - 3 * t, null, [0, 0, 1]); const neck = drMesh(ng, M.skin, G, 'head'); parts.push(neck);
  const Hh = new T.Group(); Hh.position.set(4, 64, 50); G.add(Hh); Hh.rotation.y = 0.5;
  const headG = drGeoOnce('drHead', () => sdfGeo((x, y, z) => drSkullU(-x, y, z), [-112, -34, -36], [48, 62, 36], 1.7, drSkullColor));
  const head = drMesh(headG, M.skinV, Hh, 'head'); parts.push(head);
  // alsó állkapocs (csuklós)
  const jawPivot = new T.Group(); jawPivot.position.set(-6, -18, 0); Hh.add(jawPivot);
  const jawG = drGeoOnce('drJaw', () => sdfGeo((x, y, z) => drJawU(-x + 6, y - 18, z), [-104, -34, -30], [14, 20, 30], 1.5, drJawColor));
  const jaw = drMesh(jawG, M.skinV, jawPivot, 'head'); parts.push(jaw);
  // fogak
  const upT = [], loT = [];
  for (let i = 0; i < 7; i++) { const u = 52 + i * 6.4, hw = (16 - (u - 50) * 0.13), len = (i % 2 ? 6.4 : 8.4) * (u > 84 ? 1.1 : 1); for (const sg of [-1, 1]) upT.push(drCone(len, 1.9, [-u, -13.2, sg * (hw - 3.3)], [-0.12, -1, 0.08 * sg], 6)); }
  for (let i = 0; i < 6; i++) { const u = 56 + i * 7, hw = 9.6 - (u - 50) * 0.05; for (const sg of [-1, 1]) loT.push(drCone(i % 2 ? 4.6 : 6, 1.6, [-u + 6, 3.7, sg * (hw - 1.4)], [-0.1, 1, 0], 6)); }
  const upG = drGeoOnce('drUpT', () => drMerge(upT)), loG = drGeoOnce('drLoT', () => drMerge(loT));
  drMesh(upG, M.bone, Hh, 'head'); const loM = drMesh(loG, M.bone, jawPivot, 'head'); loM.position.set(0, 0, 0);
  // szemek, szemhéjak, szemöldök
  const eyes = [], brows = [], gz = [0.88, -0.88];
  [1, -1].forEach((sg, ei) => {
    const eg = new T.Group(); eg.position.set(-40, 8, 22.5 * sg); eg.rotation.order = 'YXZ'; eg.rotation.y = Math.atan2(-0.45, 0.88 * sg); eg.rotation.x = -0.12; Hh.add(eg);
    drMesh(new T.SphereGeometry(7.4, 22, 16), M.sclera, eg);
    const look = new T.Group(); eg.add(look);
    const ir = drMesh(new T.SphereGeometry(7.46, 24, 14, 0, 6.2832, 0, 1.05), M.iris, look); ir.rotation.x = Math.PI / 2;
    const pu = new T.Mesh(new T.SphereGeometry(7.53, 18, 12, 0, 6.2832, 0, 0.55), M.pupil); pu.rotation.x = Math.PI / 2; look.add(pu);
    const lid = drMesh(new T.SphereGeometry(8.3, 22, 12, 0, 6.2832, 0, 1.62), M.lid, eg);
    eyes.push({ eg: eg, look: look, pu: pu, lid: lid, sg: sg });
    const bg = drGeoOnce('drBrow', () => sdfGeo((x, y, z) => drBrowU(-x, y, z), [-36, -9, -9], [4, 16, 9], 1.2, () => drCol.skin));
    const bp = new T.Group(); bp.position.set(-27, 19.5, 17.5 * sg); Hh.add(bp); const bm = drMesh(bg, M.skinV, bp, 'head'); if (sg < 0) bm.scale.z = -1; bm.position.set(0, 0, 0); brows.push(bp);
    bm.position.z = 0; parts.push(bm);
  });
  // az orr „célpontja” (bökés)
  const nose = new T.Mesh(new T.SphereGeometry(17, 10, 8), new T.MeshBasicMaterial({ visible: false })); nose.position.set(-92, -2, 0); nose.visible = false; nose.userData.part = 'nose'; Hh.add(nose); parts.push(nose);
  // illesztés: minden állapot-érték → a hálók
  const apply = () => {
    jawPivot.rotation.z = S.jaw;
    brows.forEach(b => { b.rotation.z = S.brow; b.position.y = 19.5 - S.brow * 6; });
    eyes.forEach(e => {
      e.lid.rotation.x = -0.42 + 1.9 * Math.max(S.blink, S.squint * 0.34) + S.squint * 0.1; e.pu.scale.set(S.pup, 1, 1);
      e.look.rotation.set(S.ly * 0.3, S.lx * 0.34, 0);
    });
    M.iris.emissiveIntensity = S.glow;
    G.rotation.z = S.lean; Hh.rotation.y = 0.5 + S.yaw; Hh.rotation.z = S.nod + Math.sin(S.ph) * S.purr;
  };
  S.__apply = apply; apply();
  const nostrilW = () => { const v = new T.Vector3(-97, 2.5, 5.4); Hh.updateMatrixWorld(true); Hh.localToWorld(v); root.worldToLocal(v); return v; };
  const headW = () => { const v = new T.Vector3(-48, 40, 8); Hh.updateMatrixWorld(true); Hh.localToWorld(v); root.worldToLocal(v); return v; };
  const ctl = {
    S: S, root: root, G: G, H: Hh, nostril: nostrilW, headPos: headW, apply: apply, M: M,
    look(p) {
      let lx = 0, ly = 0;
      if (p && !SH.edit) { const v = new T.Vector3(); eyes[0].eg.getWorldPosition(v); v.project(L3.cam); const c = l3Cam(), ex = (v.x * 0.5 + 0.5) * c.vw, ey = (-v.y * 0.5 + 0.5) * c.vh, dx = p.x - ex, dy = p.y - ey, d = Math.hypot(dx, dy) || 1, f = Math.min(1, d / 170); lx = dx / d * f; ly = dy / d * f; }
      if (Math.abs(lx - S.lx) + Math.abs(ly - S.ly) > 0.01) { S.lx = lx; S.ly = ly; apply(); l3Inv(); }
    },
    idle() { if (Date.now() - (it.st ? it.st.last || 0 : 0) > 4000) { ctl.blink(); if (Math.random() < 0.25) ctl.smoke(1, 0.55); } },
    blink() { l3Seq().to(S, { blink: 1 }, 0.07, 'out').to(S, { blink: 0 }, 0.12, 'io').play(); },
    glance() { l3Seq().to(S, { yaw: 0.6, lx: 1, ly: 0 }, 0.28, 'out').wait(0.55).to(S, { yaw: 0, lx: 0 }, 0.5, 'io').play(); },
    smoke(n, big) { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; for (const sg of [-1, 1]) { const v = nostrilW(); v.z *= 1; drParticle(root, 'smoke', v.clone().add(new T.Vector3(-3 * i, 1, sg * 3)), { vx: -9 - Math.random() * 7, vy: 9 + Math.random() * 7, vz: sg * 2, life: 1.5, big: big || 1 }); } }, i * 170); },
    sparks(n) { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; const v = nostrilW(); drParticle(root, 'spark', v, { vx: -22 - Math.random() * 26, vy: 8 + Math.random() * 22, vz: (Math.random() - 0.5) * 20, life: 0.6 + Math.random() * 0.3 }); }, i * 60); },
    hearts(n) { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; const v = headW(); drParticle(root, 'heart', v.add(new T.Vector3((Math.random() - 0.5) * 30, 12, 8)), { vx: (Math.random() - 0.5) * 8, vy: 20 + Math.random() * 8, life: 1.7, big: 1 }); }, i * 280); },
    boop() {
      ctl.stop(); S.glow = 0.28;
      ctl.seq = l3Seq().to(S, { lean: -0.07, brow: 0.5, squint: 1, pup: 0.15, glow: 1.1, nod: -0.05 }, 0.14, 'out').call(() => ctl.smoke(2, 1)).wait(0.15)
        .to(S, { lean: -0.035, nod: 0.03 }, 0.25, 'io').wait(0.8).to(S, { lean: 0, brow: 0, squint: 0, pup: 0.34, glow: 0.28, nod: 0 }, 0.7, 'io').play();
    },
    rage() {
      ctl.stop();
      ctl.seq = l3Seq().to(S, { lean: -0.1, brow: 0.62, squint: 1, pup: 0.12, glow: 1.5, jaw: 0.5 }, 0.16, 'out').call(() => { ctl.smoke(4, 1.4); ctl.sparks(9); })
        .to(S, { yaw: 0.12 }, 0.07).to(S, { yaw: -0.14 }, 0.1).to(S, { yaw: 0.1 }, 0.1).to(S, { yaw: -0.08 }, 0.1).to(S, { yaw: 0 }, 0.1)
        .to(S, { lean: 0.05 }, 0.14, 'out').wait(0.9).to(S, { jaw: 0, lean: 0, brow: 0, squint: 0, pup: 0.34, glow: 0.28, nod: 0 }, 0.8, 'io').play();
    },
    pet() {
      ctl.stop();
      ctl.seq = l3Seq().to(S, { blink: 1, nod: 0.16, lean: 0.03, pup: 0.5 }, 0.3, 'io').call(() => { ctl.hearts(4); l3Anim(1.9, u => { S.purr = 0.012 * Math.sin(u * Math.PI); S.ph += 1.3; apply(); }); }).wait(1.9)
        .to(S, { blink: 0, nod: 0, lean: 0, pup: 0.34 }, 0.5, 'io').play();
    },
    stop() { if (ctl.seq) ctl.seq.stop(); S.purr = 0; }
  };
  return { grp: root, parts: parts, mats: M.all, d: 110, ctl: ctl, root: root };
}

registerDecor3({
  id: 'sarkany-fej',
  build(it) {
    const o = drBuildHead(it), g = new THREE.Group(); g.add(o.grp); o.grp = g; return o;
  },
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now(), nose = part === 'nose' || (e && e.detail === 0), tail = A.linked()[0];
    if (!c) return;
    if (nose) {
      st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
      if (st.n >= 3) { c.rage(); if (tail && tail.ctl) setTimeout(() => tail.ctl.slam(), 380); }
      else { c.boop(); if (tail && tail.ctl) setTimeout(() => tail.ctl.flick(), 420); }
    } else { st.n = 0; c.pet(); }
  }
});


/* ---------- a farok: animálható cső (tüskékkel, lapáttal), a doboz elülső nyílásán át kígyózik a polcra ---------- */
function drBuildTail(it) {
  drColInit(); const T = THREE, M = drMats(), s = it.h / 170, root = new T.Group(); root.scale.setScalar(s);
  const parts = [], crate = drMesh(drCrateGeo(), M.resin, root, 'box'); crate.position.set(-29, 80, -53); parts.push(crate);
  const N = 64, tg = l3TubeGeo(N, 20), base = l3CatmullPts([[-38, 122, -52], [-38, 74, -36], [-31, 36, -8], [0, 12, 8], [38, 7.5, 12], [70, 13, 10]]);
  const rad = t => 15.5 * Math.pow(1 - t, 0.85) + 2.6, TS = { lift: 0, amp: 0, ph: 0 };
  const curve = t => { const c = base(t), w = TS.amp * Math.pow(t, 1.5), y = c[1] + TS.lift * Math.pow(t, 1.8) * 66 + w * 18 * Math.sin(TS.ph - t * 6), z = c[2] + w * 9 * Math.cos(TS.ph - t * 6); return [c[0], Math.max(y, rad(t) * 0.86 + 0.3), z]; };
  const dors = (t, tx, ty) => [-ty, tx, 0];
  const tube = drMesh(tg, M.skin, root, 'tail'); parts.push(tube);
  const spikeG = drGeoOnce('drSpike', () => { const g = new T.ConeGeometry(1, 1, 6); g.translate(0, 0.5, 0); g.userData.shared = true; return g; });
  const spikes = []; for (let i = 0; i < 9; i++) { const m = drMesh(spikeG, M.horn, root, 'tail'); spikes.push({ m: m, t: 0.2 + i * 0.075 }); parts.push(m); }
  const spadeG = drGeoOnce('drSpade', () => sdfGeo((x, y, z) => { const dd = (Math.abs(x) / 12 + Math.abs(y) / 9.5 - 1) * 5.9; return smax(dd, Math.abs(z) - 2.2, 1.4); }, [-15, -12, -5], [15, 12, 5], 0.9, () => drCol.horn));
  const spade = drMesh(spadeG, M.skinV, root, 'tail'); parts.push(spade);
  const frame = t => {
    const c = curve(t), a = curve(Math.max(0, t - 0.012)), b = curve(Math.min(1, t + 0.012)); let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2]; const l = Math.hypot(tx, ty, tz) || 1; tx /= l; ty /= l; tz /= l;
    let ux = -ty, uy = tx, uz = 0; const d = ux * tx + uy * ty + uz * tz; ux -= tx * d; uy -= ty * d; uz -= tz * d; const ul = Math.hypot(ux, uy, uz) || 1; ux /= ul; uy /= ul; uz /= ul;
    return { c: c, t: new T.Vector3(tx, ty, tz), u: new T.Vector3(ux, uy, uz) };
  };
  const rebuild = () => {
    l3TubeSet(tg, curve, rad, null, dors);
    spikes.forEach(sp => {
      const f = frame(sp.t), r = rad(sp.t), len = 15 * Math.pow(1 - sp.t, 0.55) + 4.5, w = 3.4 * Math.pow(1 - sp.t, 0.4) + 1.1, dir = f.u.clone().add(f.t.clone().multiplyScalar(0.55)).normalize();
      sp.m.position.set(f.c[0] + f.u.x * r * 0.86, f.c[1] + f.u.y * r * 0.86, f.c[2] + f.u.z * r * 0.86); sp.m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir); sp.m.scale.set(w, len, w);
    });
    const f = frame(1), side = new T.Vector3().crossVectors(f.t, f.u).normalize(); spade.matrixAutoUpdate = false;
    spade.matrix.makeBasis(f.t, f.u, side).setPosition(f.c[0] + f.t.x * 8, f.c[1] + f.t.y * 8, f.c[2] + f.t.z * 8); spade.matrixWorldNeedsUpdate = true; spade.updateMatrix = () => { };
  };
  TS.__apply = rebuild; rebuild();
  const tipW = () => { const f = frame(1), v = new T.Vector3(f.c[0], 2, f.c[2]); return v; };
  const ctl = {
    TS: TS, root: root,
    flick() { const A = 0.75; l3Anim(1.1, u => { TS.amp = Math.sin(Math.PI * Math.min(1, u * 1.15)) * A; TS.ph = u * 15; rebuild(); }, () => { TS.amp = 0; rebuild(); }); },
    wag() { l3Anim(1.3, u => { TS.amp = Math.sin(Math.PI * u) * 1; TS.ph = u * 26; rebuild(); }, () => { TS.amp = 0; rebuild(); }); },
    idle() { l3Anim(0.9, u => { TS.amp = Math.sin(Math.PI * u) * 0.3; TS.ph = u * 12; rebuild(); }, () => { TS.amp = 0; rebuild(); }); },
    slam() {
      l3Seq().to(TS, { lift: 1 }, 0.3, 'out').wait(0.06).to(TS, { lift: 0 }, 0.1, 'in').call(() => {
        for (let i = 0; i < 4; i++) drParticle(root, 'smoke', tipW().add(new T.Vector3(-i * 8, 0, 0)), { vx: 6 + Math.random() * 10, vy: 5 + Math.random() * 5, vz: (Math.random() - 0.5) * 10, life: 0.9, big: 0.8 });
        l3Anim(0.4, u => { root.position.y = -Math.sin(u * 18) * (1 - u) * 1.4; });
      }).wait(0.5).play();
    }
  };
  return { grp: root, parts: parts, mats: M.all, d: 110, ctl: ctl };
}
registerDecor3({
  id: 'sarkany-farok',
  build(it) { const o = drBuildTail(it), g = new THREE.Group(); g.add(o.grp); o.grp = g; return o; },
  onClick(it, A) {
    const c = it.ctl, head = A.linked()[0]; if (!c) return; c.wag();
    if (head && head.ctl) setTimeout(() => head.ctl.glance(), 200);
  }
});
