/* ===== 3D dísz: book nook – kivilágított éjszakai sikátor fa dobozban =====
   Kényszerített perspektíva (a 2D rajz geometriája, de valódi háló): lejtős padló, szűkülő falak, boltíves ajtó (nyílik), zászlófüzér, utcai lámpa valódi fénnyel.
   A lámpa kapcsol (mentődik), a jelenetre kattintva kinyílik az ajtó, kikukucskál a cica. */
'use strict';

const NK = { D: 64 };
const nkP = (side, u, v) => {
  const x = side === 'L' ? 10 + 38 * u : 120 - 38 * u, yb = 158 - 41.5 * u, yt = 10 + 60.8 * u;
  return [x - 65, 170 - (yb + (yt - yb) * v), -NK.D * u];
};
const nkN = { L: [0.8596, 0, 0.5104], R: [-0.8596, 0, 0.5104] };
const nkOn = (side, pts, off) => pts.map(p => [p[0] + nkN[side][0] * off, p[1], p[2] + nkN[side][2] * off]);
const nkQd = (side, u0, u1, v0, v1, off) => nkOn(side, [nkP(side, u0, v0), nkP(side, u1, v0), nkP(side, u1, v1), nkP(side, u0, v1)], off == null ? 0.45 : off);

function nkSkyTex() {
  return kTex(560, 740, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#121a52'); gr.addColorStop(0.55, '#3d3a8e'); gr.addColorStop(1, '#cf78a0'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const mx = 385, my = 80, mg = g.createRadialGradient(mx, my, 20, mx, my, 150); mg.addColorStop(0, 'rgba(255,240,190,.5)'); mg.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = mg; g.fillRect(0, 0, W, H);
    g.fillStyle = '#fff1bb'; g.beginPath(); g.arc(mx, my, 62, 0, 6.283); g.fill();
    g.fillStyle = '#f1d98a'; [[-12, -14, 16], [20, 16, 12], [30, 38, 8], [-26, 24, 6]].forEach(c => { g.beginPath(); g.arc(mx + c[0], my + c[1], c[2], 0, 6.283); g.fill(); });
  }, 'nkSky');
}
function nkGradTex() {   // a kinyíló ajtó fénye a padlón (lefelé halványodik)
  return kTex(8, 128, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,200,100,.9)'); gr.addColorStop(1, 'rgba(255,176,74,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }, 'nkGrad');
}

function nkBuild(it) {
  const T = THREE, K = kRoot(it, 170), root = K.r, parts = [], D = NK.D;
  const dimMats = [], litMats = [], M = {};
  const std = (o) => { const m = l3Mat(Object.assign({ roughness: 0.85, metalness: 0, side: T.DoubleSide }, o)); dimMats.push(m); return m; };
  M.wood = l3Mat({ color: '#a8743f', map: l3Wood(), bumpMap: l3Wood(), bumpScale: 1.1, roughness: 0.55, envMapIntensity: 0.5 });
  M.wallL = std({ color: '#ffffff', vertexColors: true }); M.wallR = std({ color: '#ffffff', vertexColors: true }); M.back = std({ color: '#ffffff', vertexColors: true }); M.floor = std({ color: '#ffffff', vertexColors: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  M.sky = new T.MeshBasicMaterial({ map: nkSkyTex(), toneMapped: false }); dimMats.push(M.sky);
  M.green = std({ color: '#2f6b5a' }); M.brown = std({ color: '#6a3f25' });
  M.flag = std({ color: '#ffffff', vertexColors: false });
  M.iron = l3Mat({ color: '#171019', roughness: 0.45, metalness: 0.7 }); dimMats.push(M.iron);
  M.brass = l3Mat({ color: '#e0b04a', roughness: 0.3, metalness: 1 });
  M.lampG = new T.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false }); M.lampG.userData.lit = 1;
  M.win = new T.MeshBasicMaterial({ color: 0xffd27a, toneMapped: false, side: T.DoubleSide });
  M.doorL = std({ color: '#7a4526' }); M.arch = std({ color: '#3a2a3e' });
  M.glowDoor = new T.MeshBasicMaterial({ color: 0xffc864, toneMapped: false, side: T.DoubleSide });
  M.spill = new T.MeshBasicMaterial({ map: nkGradTex(), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  M.cat = l3Mat({ color: '#120a10', roughness: 0.9 });
  M.line = null;
  const P = (m, part) => { m.userData.part = part || 'scene'; parts.push(m); return m; };
  const vc = (a, b) => [].concat(lc(a), lc(b), lc(b), lc(a));   // négy csúcs: a (előtte), b (hátul)
  // doboz-keret
  const fz = -(D + 8 - 6) / 2, fd = D + 8 + 6;
  P(kBox(126, 8, fd, M.wood, root, 0, 164, fz), 'box'); P(kBox(126, 10, fd, M.wood, root, 0, 7, fz), 'box'); P(kBox(8, 148, fd, M.wood, root, -59, 86, fz), 'box'); P(kBox(8, 148, fd, M.wood, root, 59, 86, fz), 'box');
  P(kBox(110, 148, 2, M.wood, root, 0, 86, -D - 7), 'box');
  // ég
  const sky = new T.Mesh(new T.PlaneGeometry(112, 148), M.sky); sky.position.set(0, 86, -D - 5.5); root.add(P(sky));
  // falak + padló
  const wl = [nkP('L', 0, 0), nkP('L', 1, 0), nkP('L', 1, 1), nkP('L', 0, 1)], wr = [nkP('R', 0, 0), nkP('R', 1, 0), nkP('R', 1, 1), nkP('R', 0, 1)];
  P(kQuad(wl, M.wallL, root, { vcol: vc('#2f2340', '#6a5584'), recv: true })); P(kQuad(wr, M.wallR, root, { vcol: vc('#34273f', '#6f5a82'), recv: true }));
  P(kQuad([nkP('L', 1, 0), nkP('R', 1, 0), nkP('R', 1, 1), nkP('L', 1, 1)], M.back, root, { vcol: [].concat(lc('#47385c'), lc('#47385c'), lc('#6e5a86'), lc('#6e5a86')), recv: true }));
  P(kQuad([nkP('L', 0, 0), nkP('R', 0, 0), nkP('R', 1, 0), nkP('L', 1, 0)], M.floor, root, { vcol: [].concat(lc('#241a2d'), lc('#241a2d'), lc('#5d4a70'), lc('#5d4a70')), recv: true }));
  // vonalak: falsávok, kocsi-burkolat
  const L1 = [], seg = (a, b) => { L1.push(a, b); };
  ['L', 'R'].forEach(sd => { const q = (u0, v0, u1, v1) => seg(nkOn(sd, [nkP(sd, u0, v0)], 0.3)[0], nkOn(sd, [nkP(sd, u1, v1)], 0.3)[0]); q(0, 0.3, 1, 0.3); q(0, 0.92, 1, 0.92); q(0.5, 0, 0.5, 1); q(1, 0, 1, 1); });
  const fl = nkP('L', 0, 0), fr = nkP('R', 0, 0), bl = nkP('L', 1, 0), br = nkP('R', 1, 0);
  for (let k = 1; k < 6; k++) { const t = k / 6; seg([fl[0] + (fr[0] - fl[0]) * t, fl[1] + 0.25, 0.4], [bl[0] + (br[0] - bl[0]) * t, bl[1] + 0.25, -D + 0.4]); }
  [0.12, 0.28, 0.45, 0.62, 0.8].forEach(t => { const a = [nkP('L', t, 0)[0], nkP('L', t, 0)[1] + 0.25, -D * t + 0.4], b = [nkP('R', t, 0)[0], nkP('R', t, 0)[1] + 0.25, -D * t + 0.4]; seg(a, b); });
  const lines = kLines(L1, 0x1a0f22, root, 0.55); lines.userData.dim = 1;
  // ablakok (világítanak) + keretek
  const winPts = [], frameL = [];
  const addWin = (side, u0, u1, v0, v1) => { const q = nkQd(side, u0, u1, v0, v1); const m = kQuad(q, M.win, root, { part: 'scene' }); parts.push(m); for (let i = 0; i < 4; i++) frameL.push(q[i], q[(i + 1) % 4]); };
  addWin('L', 0.12, 0.32, 0.52, 0.84); addWin('L', 0.58, 0.72, 0.46, 0.74); addWin('R', 0.2, 0.4, 0.5, 0.84); addWin('R', 0.6, 0.76, 0.46, 0.72);
  { const a = nkQd('L', 0.22, 0.22, 0.52, 0.84, 0.5), b = nkQd('L', 0.12, 0.32, 0.68, 0.68, 0.5); frameL.push(a[0], a[3], b[0], b[1]); const c = nkQd('R', 0.3, 0.3, 0.5, 0.84, 0.5), d = nkQd('R', 0.2, 0.4, 0.67, 0.67, 0.5); frameL.push(c[0], c[3], d[0], d[1]); }
  kLines(frameL, 0x150d17, root);
  // zöld spaletta + virágosláda
  P(kQuad(nkQd('L', 0.04, 0.12, 0.5, 0.88, 0.35), M.green, root)); P(kQuad(nkQd('L', 0.32, 0.4, 0.5, 0.88, 0.35), M.green, root)); P(kQuad(nkQd('L', 0.1, 0.34, 0.42, 0.52, 0.8), M.brown, root));
  for (let i = 0; i < 6; i++) { const p = nkP('L', 0.13 + i * 0.035, 0.56), m = l3Mat({ color: ['#ff7aa8', '#ffd24a', '#ff9a6a'][i % 3], roughness: 0.7 }); dimMats.push(m); const s = new T.Mesh(new T.SphereGeometry(1.9, 8, 6), m); s.position.set(p[0] + 2.2, p[1], p[2] + 1.4); root.add(s); parts.push(P(s)); }
  // hátfal: ablakok + ajtó
  [[-13, 78], [13, 78]].forEach(w => { const q = [[w[0] - 3, 87 - 0, -D + 0.5], [w[0] + 3, 87, -D + 0.5], [w[0] + 3, 94, -D + 0.5], [w[0] - 3, 94, -D + 0.5]]; kQuad(q, M.win, root); kLines([q[0], q[1], q[1], q[2], q[2], q[3], q[3], q[0], [w[0], 87, -D + 0.6], [w[0], 94, -D + 0.6], [w[0] - 3, 90.5, -D + 0.6], [w[0] + 3, 90.5, -D + 0.6]], 0x150d17, root); });
  const doorSh = new T.Shape(); doorSh.moveTo(-6, 0); doorSh.lineTo(6, 0); doorSh.lineTo(6, 23); doorSh.absarc(0, 23, 6, 0, Math.PI, false); doorSh.lineTo(-6, 0);
  const dg = new T.ShapeGeometry(doorSh, 16);
  const hole = new T.Mesh(dg, M.glowDoor); hole.position.set(0, 53.6, -D + 0.45); root.add(hole);   // mögötte a fény
  const arch = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3((() => { const a = [new T.Vector3(-7.4, 0, 0), new T.Vector3(-7.4, 23, 0)]; for (let i = 0; i <= 12; i++) { const t = Math.PI - i / 12 * Math.PI; a.push(new T.Vector3(Math.cos(t) * 7.4, 23 + Math.sin(t) * 7.4, 0)); } a.push(new T.Vector3(7.4, 0, 0)); return a; })()), 40, 1.1, 6), M.arch); arch.position.set(0, 53.6, -D + 0.9); root.add(arch);
  const dp = new T.Group(); dp.position.set(-6, 53.6, -D + 1.1); root.add(dp);
  const leaf = new T.Mesh(new T.ExtrudeGeometry(doorSh, { depth: 1.2, bevelEnabled: false, curveSegments: 12 }), M.doorL); leaf.position.x = 6; leaf.castShadow = true; dp.add(P(leaf));
  const kn = new T.Mesh(new T.SphereGeometry(0.9, 8, 6), M.brass); kn.position.set(10.8, 13, 1.5); dp.add(kn);
  kLines([[3.3, 0.5, 1.3], [3.3, 28, 1.3], [6, 0.5, 1.3], [6, 29.2, 1.3], [8.7, 0.5, 1.3], [8.7, 28, 1.3]].map((p, i) => p), 0x2a160c, dp, 0.55).visible = false;
  // cica az ajtóban
  const cat = new T.Group(); cat.position.set(0, 53.6, -D + 0.8); root.add(cat); cat.scale.setScalar(0.001);
  const cb = new T.Mesh(new T.SphereGeometry(3.4, 12, 10), M.cat); cb.scale.set(1, 1.05, 0.8); cb.position.y = 3.5; cat.add(cb);
  const ch = new T.Mesh(new T.SphereGeometry(2.7, 12, 10), M.cat); ch.position.y = 8.8; cat.add(ch);
  [-1, 1].forEach(sg => { const e = new T.Mesh(new T.ConeGeometry(1.1, 2.6, 4), M.cat); e.position.set(sg * 1.8, 11.2, 0); e.rotation.z = -sg * 0.2; cat.add(e); });
  const ct = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(2.8, 2, 0), new T.Vector3(5.5, 2.4, 0), new T.Vector3(6.6, 5, 0), new T.Vector3(5, 8, 0)]), 12, 0.65, 5), M.cat); cat.add(ct);
  [-1, 1].forEach(sg => { const e = new T.Mesh(new T.SphereGeometry(0.5, 6, 5), new T.MeshBasicMaterial({ color: 0xffe27a, toneMapped: false })); e.position.set(sg * 1.1, 9.1, 2.3); cat.add(e); });
  // a padló fényfoltja
  const spill = kQuad([[-6, 53.5 + 0.2, -D + 0.5], [6, 53.5 + 0.2, -D + 0.5], [27, 12.3, 0.2], [-21, 12.3, 0.2]], M.spill, root);
  // zászlófüzér
  const bz = t => -13 - 8 * Math.sin(Math.PI * t), bp = t => { const m = 1 - t; return [m * m * 18 + 2 * t * m * 65 + t * t * 112 - 65, 170 - (m * m * 36 + 2 * t * m * 60 + t * t * 38), bz(t)]; };
  const st = []; for (let i = 0; i < 24; i++) { st.push(bp(i / 24), bp((i + 1) / 24)); } kLines(st, 0x1d121f, root);
  const flags = [], cols = ['#ff7aa8', '#ffd24a', '#6ad0c0', '#ff9a6a', '#9a8cff'];
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.7) / 9.4, p = bp(t), g = new T.Group(); g.position.set(p[0], p[1], p[2]); root.add(g);
    const sh = new T.Shape(); sh.moveTo(-3.7, 0); sh.lineTo(3.7, 0); sh.lineTo(0, -8.5); sh.lineTo(-3.7, 0);
    const fm = l3Mat({ color: cols[i % 5], roughness: 0.8, side: T.DoubleSide }); dimMats.push(fm); const f = new T.Mesh(new T.ShapeGeometry(sh), fm); f.castShadow = true; g.add(f); flags.push(g);
  }
  // utcai lámpa
  const lp = new T.Group(); lp.position.set(39, 18, -9); root.add(lp);
  const pole = new T.Mesh(new T.CylinderGeometry(1.7, 2.2, 82, 10), M.iron); pole.position.y = 41; pole.castShadow = true; lp.add(P(pole, 'sw'));
  const lb = new T.Mesh(new T.CylinderGeometry(3.6, 5.2, 5, 10), M.iron); lb.position.y = 2.5; lp.add(P(lb, 'sw'));
  const lhs = new T.Mesh(new T.BoxGeometry(8.4, 14, 8.4), M.lampG); lhs.position.y = 91; lp.add(P(lhs, 'sw'));
  [[-4.4, -4.4], [4.4, -4.4], [-4.4, 4.4], [4.4, 4.4]].forEach(c => { const b = new T.Mesh(new T.BoxGeometry(1.2, 15, 1.2), M.iron); b.position.set(c[0], 91, c[1]); lp.add(b); });
  const lc2 = new T.Mesh(new T.ConeGeometry(7.2, 8, 4), M.iron); lc2.position.y = 102.5; lc2.rotation.y = Math.PI / 4; lc2.castShadow = true; lp.add(P(lc2, 'sw'));
  const lk = new T.Mesh(new T.SphereGeometry(1.8, 8, 6), M.brass); lk.position.y = 107.4; lp.add(lk);
  const lt = new T.Mesh(new T.CylinderGeometry(5.5, 5.5, 2, 4), M.iron); lt.rotation.y = Math.PI / 4; lt.position.y = 83.4; lp.add(lt);
  parts.push(kHit(lp, 16, 0, 91, 0, 'sw'));
  const halo = kGlowSprite(0xffb85a, 110, 0.55); halo.position.set(0, 92, 0); lp.add(halo);
  const light = kLight(lp, 0xffc070, 1.0, 190, 0, 92, 14);
  // csillagok
  const stars = [[56, 22, 2.8], [68, 40, 2], [48, 40, 2.2], [100, 40, 2.4], [38, 16, 2], [112, 22, 2.4]].map((q, i) => { const m = kSvgPlane('<path d="' + glStar(q[0], q[1], q[2]) + '" fill="#ffe680"/>', (q[0] - 4) + ' ' + (q[1] - 4) + ' 8 8', 8, 8, 40, 40, { key: 'nkStar' + i }); m.position.set(q[0] - 65, 170 - q[1], -D - 4.4); root.add(m); return m; });
  // állapot
  const S = kState({ lit: it.d.off ? 0 : 1, door: 0, cat: 0, tw: 0, sway: 0 }, S => {
    const lit = S.lit, dm = 0.22 + 0.78 * lit;
    dimMats.forEach(m => { const bc = m.userData.base; if (bc) m.color.copy(bc).multiplyScalar(m === M.sky ? 0.25 + 0.75 * lit : dm); });
    M.win.color.setRGB(0.07 + 0.93 * lit, 0.07 + 0.82 * lit, 0.08 + 0.48 * lit); M.lampG.color.setRGB(0.1 + 0.9 * lit, 0.1 + 0.82 * lit, 0.1 + 0.48 * lit); M.glowDoor.color.setRGB(0.1 + 0.9 * lit, 0.1 + 0.78 * lit, 0.1 + 0.39 * lit);
    halo.material.opacity = 0.6 * lit; halo.visible = lit > 0.01; if (light) light.intensity = 1.0 * lit;
    dp.rotation.y = -S.door * 1.75; M.spill.opacity = S.door * lit * 0.9;
    const cs = Math.max(0.001, S.cat); cat.scale.setScalar(cs); cat.position.y = 53.6 - (1 - S.cat) * 4; cat.rotation.z = Math.sin(S.cat * 3) * 0.04;
    flags.forEach((f, i) => { f.rotation.z = Math.sin(S.sway * 6 + i * 0.7) * 0.28 * (S.sway ? 1 - Math.abs(S.sway - 0.5) * 1.6 : 0); f.rotation.x = Math.cos(S.sway * 6 + i * 0.7) * 0.12 * (S.sway ? 1 : 0); });
    stars.forEach((s, i) => { s.scale.setScalar(1 + 0.55 * Math.max(0, Math.sin(S.tw * Math.PI * 2 + i * 1.2))); });
  });
  dimMats.forEach(m => { m.userData.base = m.color.clone(); });
  S.__apply();
  const ctl = {
    S: S, root: root,
    lit(on) { ctl.stop(); ctl.seq = l3Seq().to(S, { lit: on ? 1 : 0 }, on ? 0.6 : 0.45, 'io').play(); },
    door() { ctl.stop(); ctl.seq = l3Seq().to(S, { door: 1 }, 0.7, 'out').to(S, { cat: 1 }, 0.5, 'back').wait(1.5).to(S, { cat: 0 }, 0.35, 'in').to(S, { door: 0 }, 0.7, 'io').play(); },
    idle() {
      if (it.d.off) return; const r = Math.random();
      if (r < 0.5) l3Anim(2.4, u => { S.sway = u; S.__apply(); }, () => { S.sway = 0; S.__apply(); });
      else l3Anim(1.8, u => { S.tw = u; S.__apply(); }, () => { S.tw = 0; S.__apply(); });
    },
    stop() { if (ctl.seq) ctl.seq.stop(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M).concat(dimMats), d: 70, ctl: ctl };
}
registerDecor3({
  id: 'book-nook', build: nkBuild,
  onClick(it, A, e, part) {
    const c = it.ctl; if (part === 'sw') { const on = A.toggle(); c.lit(on); return; }
    if (!A.on) { A.toggle(); c.lit(true); return; }
    c.door();
  }
});
