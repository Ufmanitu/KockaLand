/* ===== 3D díszek: olvasó szellem + kis sárkány (felhővel) – puha vinyl-figurák, gyöngyszemekkel ===== */
'use strict';

/* közös: „soha ne fusson le üresen” tweenek, amik a ctl.seq-et cserélik */
const crStop = c => { if (c.seq) c.seq.stop(); };

/* ---------- olvasó szellem ---------- */
function ghPageTex() {
  return kTex(256, 320, (g, W, H) => {
    g.fillStyle = '#f7edd2'; g.fillRect(0, 0, W, H); const rng = dcRng(9);
    for (let i = 0; i < 14; i++) { const y = 24 + i * 20, w = 150 + rng() * 70; g.strokeStyle = 'rgba(110,80,50,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(22, y); g.lineTo(22 + w, y); g.stroke(); }
    const gr = g.createLinearGradient(W, 0, W - 40, 0); gr.addColorStop(0, 'rgba(120,80,40,.35)'); gr.addColorStop(1, 'rgba(120,80,40,0)'); g.fillStyle = gr; g.fillRect(W - 40, 0, 40, H);
  }, 'ghPage');
}
const ghCol = {};
function ghBodyGeo() {
  if (!ghCol.top) Object.assign(ghCol, { top: lc('#e9eeff'), bot: lc('#b9c6ee'), arm: lc('#dbe3fb') });
  return drGeoOnce('ghBody', () => sdfGeo((x, y, z) => smax(sdEll(x, y - 52, z, 33, 52, 29), 7 - y, 4), [-37, 2, -33], [37, 108, 33], 1.7, (x, y, z) => { const t = Math.min(1, Math.max(0, (70 - y) / 62)), a = ghCol.top, b = ghCol.bot; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }));
}
function ghArmGeo() {   // a bal kar a váll-ponthoz képest
  ghBodyGeo();
  return drGeoOnce('ghArm', () => sdfGeo((x, y, z) => { let d = smin(sdCone(x, y, z, 0, 0, 0, -7, -17, 8, 8.2, 7.4), sdCone(x, y, z, -7, -17, 8, 4, -26, 21, 7.4, 7.8), 4); return smin(d, sdSph(x - 4, y + 26, z - 21, 9), 3); }, [-22, -40, -10], [18, 12, 34], 1.4, () => ghCol.arm));
}
function ghBuild(it) {
  const T = THREE, K = kRoot(it, 130), root = K.r, parts = [];
  const M = {
    body: new T.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, emissive: l3Col('#9fb0ff'), emissiveIntensity: 0.08, envMapIntensity: 0.6 }),
    cover: kVinyl('#6a2f2a', { roughness: 0.6 }),
    page: new T.MeshStandardMaterial({ map: ghPageTex(), roughness: 0.85, emissive: new T.Color(0xffe0a0), emissiveMap: ghPageTex(), emissiveIntensity: 0.22, side: T.DoubleSide }),
    rim: l3Mat({ color: '#6a4a38', roughness: 0.4, metalness: 0.6 }),
    blush: new T.MeshBasicMaterial({ color: 0xffb6c8, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    dark: new T.MeshBasicMaterial({ color: 0x3a2318 })
  };
  const P = (m, part) => { m.userData.part = part || 'body'; parts.push(m); return m; };
  const halo = kGlowSprite(0xcfd9ff, 190, 0.34); halo.position.set(0, 58, -22); root.add(halo);
  const bg = new T.Group(); root.add(bg);
  const body = new T.Mesh(ghBodyGeo(), M.body); body.castShadow = true; body.receiveShadow = true; bg.add(P(body));
  const arms = [-1, 1].map(sg => { const g = new T.Group(); g.position.set(sg * 30, 50, 4); g.scale.x = -sg; const m = new T.Mesh(ghArmGeo(), M.body); m.castShadow = true; g.add(P(m)); bg.add(g); return g; });
  const eyes = [-1, 1].map(sg => kBead(bg, sg * 13.5, 66, 25.2, 3.3, 0.8));
  const lens = [-1, 1].map(sg => { const m = new T.Mesh(new T.TorusGeometry(10.4, 1.15, 8, 32), M.rim); m.position.set(sg * 13.5, 66, 27.4); m.rotation.y = sg * 0.12; m.castShadow = true; bg.add(m); return m; });
  const br = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 6, 6), M.rim); br.rotation.z = Math.PI / 2; br.position.set(0, 67.5, 27.6); bg.add(br);
  [-1, 1].forEach(sg => { const t = new T.Mesh(new T.CylinderGeometry(0.8, 0.8, 11, 6), M.rim); t.rotation.set(0, 0, Math.PI / 2); t.position.set(sg * 29, 68, 20); t.rotation.y = sg * 0.9; bg.add(t); });
  [-1, 1].forEach(sg => { const b = new T.Mesh(new T.CircleGeometry(5.5, 16), M.blush); b.position.set(sg * 21.5, 57.5, 24.4); b.rotation.y = sg * 0.62; bg.add(b); });
  const sm = new T.Mesh(new T.TorusGeometry(3.6, 0.55, 6, 14, Math.PI), M.dark); sm.rotation.z = Math.PI; sm.position.set(0, 58.6, 27.7); bg.add(sm);
  const mo = new T.Mesh(new T.CircleGeometry(4, 16), M.dark); mo.position.set(0, 55.5, 27.9); mo.visible = false; bg.add(mo);
  // könyv
  const bk = new T.Group(); bk.position.set(0, 22, 31); bk.rotation.x = -0.3; root.add(bk);
  P(kBox(68, 40, 3.2, M.cover, bk, 0, 0, -2.4), 'book');
  const pl = new T.Mesh(new T.PlaneGeometry(31, 36), M.page); pl.position.set(-15.6, 0.4, 0); pl.rotation.y = 0.18; bk.add(P(pl, 'book'));
  const pr = new T.Mesh(new T.PlaneGeometry(31, 36), M.page); pr.position.set(15.6, 0.4, 0); pr.rotation.y = -0.18; bk.add(P(pr, 'book'));
  const fp = new T.Group(); fp.position.set(0, 0.4, 0.5); bk.add(fp); const fpm = new T.Mesh(new T.PlaneGeometry(31, 36), M.page); fpm.position.x = 15.6; fp.add(P(fpm, 'book')); fp.visible = false;
  const S = kState({ blink: 0, hop: 0, hide: 0, grow: 0, eyeW: 1, armUp: 0, flip: 0, lx: 0, ly: 0, mouthO: 0, glow: 0.34, shake: 0 }, S => {
    bg.position.set(S.shake, S.hop * 12 - S.hide * 40 + S.grow * 12, -S.hop * 4); bg.scale.set(1 + S.grow * 0.22 - S.hop * 0.05, 1 + S.grow * 0.25 + S.hop * 0.1, 1 + S.grow * 0.2);
    arms[0].rotation.z = -S.armUp; arms[1].rotation.z = S.armUp;
    eyes.forEach(e => { e.scale.set(S.eyeW, S.eyeW * Math.max(0.06, 1 - S.blink), 0.8); e.position.x += 0; });
    eyes[0].position.x = -13.5 + S.lx * 1.6; eyes[1].position.x = 13.5 + S.lx * 1.6; eyes.forEach(e => { e.position.y = 66 - S.ly * 1.1; });
    sm.visible = S.mouthO < 0.4; mo.visible = S.mouthO >= 0.4; mo.scale.setScalar(0.6 + S.mouthO * 0.7);
    M.body.emissiveIntensity = 0.08 + (S.glow - 0.34) * 1.2; halo.material.opacity = S.glow;
    fp.visible = S.flip > 0 && S.flip < 1; fp.rotation.y = -0.18 - S.flip * (Math.PI - 0.36); fp.position.z = 0.5 + Math.sin(S.flip * Math.PI) * 5;
  });
  S.__apply();
  const ctl = {
    S: S, root: root,
    look(p) { const v = kLookVec(eyes[0], p, 160); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.02) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv(); } },
    blink() { l3Seq().to(S, { blink: 1 }, 0.07, 'out').to(S, { blink: 0 }, 0.12, 'io').play(); },
    turn() { if (S.flip > 0 && S.flip < 1) return; S.flip = 0.001; l3Anim(1.3, u => { S.flip = Math.min(0.999, Math.max(0.001, u)); S.__apply(); }, () => { S.flip = 0; S.__apply(); }); },
    startle() { crStop(ctl); ctl.seq = l3Seq().to(S, { hop: 1, eyeW: 1.28, armUp: 0.5, glow: 0.8 }, 0.14, 'out').to(S, { hop: 0 }, 0.22, 'bounce').wait(0.5).to(S, { eyeW: 1, armUp: 0, glow: 0.34 }, 0.5, 'io').play(); },
    hide() { crStop(ctl); ctl.seq = l3Seq().to(S, { hide: 1, eyeW: 1.1 }, 0.4, 'in').wait(1.2).to(S, { hide: 0.62 }, 0.35, 'io').wait(0.5).to(S, { hide: 0, eyeW: 1 }, 0.45, 'back').play(); },
    spook() {
      crStop(ctl);
      ctl.seq = l3Seq().to(S, { grow: 1, eyeW: 1.35, armUp: 1.0, mouthO: 1, glow: 1 }, 0.35, 'out').to(S, { shake: 1.4 }, 0.05).to(S, { shake: -1.4 }, 0.08).to(S, { shake: 1.2 }, 0.08).to(S, { shake: -1 }, 0.08).to(S, { shake: 0 }, 0.08)
        .wait(0.9).to(S, { grow: 0, eyeW: 1, armUp: 0, mouthO: 0, glow: 0.34 }, 0.6, 'io').play();
    },
    idle() { if (Math.random() < 0.65) ctl.blink(); else ctl.turn(); },
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 50, ctl: ctl };
}
registerDecor3({
  id: 'szellem', build: ghBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (part === 'book') { c.turn(); return; }
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n === 1) c.startle(); else if (st.n === 2) c.hide(); else { c.spook(); st.n = 0; }
  }
});

/* ---------- kis sárkány + felhő ---------- */
function bbBodyGeo() {
  const CX = -16, SG = [-1, 1];
  return drGeoOnce('bbBody', () => sdfGeo((x, y, z) => {
    const X = x - CX, ax = Math.abs(X);
    let d = sdEll(X, y - 38, z, 27, 33, 24);
    d = smin(d, sdEll(X, y - 88, z - 3, 29, 26, 25), 12);
    d = smin(d, sdEll(X, y - 80, z - 6, 24, 14, 22), 8);
    d = smin(d, sdEll(X, y - 82, z - 23, 11, 7.5, 7), 5);
    d = smin(d, sdCone(ax, y, z, 27, 92, -2, 42, 101, -8, 6.5, 1.6), 3);
    d = smin(d, sdCone(ax, y, z, 26, 52, 10, 33, 40, 20, 6.2, 4.8), 3);
    d = smin(d, sdSph(ax - 33, y - 39, z - 22, 5.8), 3);
    d = smin(d, sdEll(ax - 12, y - 6, z - 16, 11, 6.6, 13), 4);
    for (let k = -1; k <= 1; k++) d = smin(d, sdSph(ax - 12 - k * 5.5, y - 5, z - 28, 3.4), 2.5);
    return d;
  }, [-64, 0, -30], [32, 118, 38], 1.7, (x, y, z) => {
    const X = x - CX, ax = Math.abs(X), mint = bbCol.mint;
    if (y > 86 && ax > 28) return bbCol.pink;
    if (y < 11 && z > 26) return bbCol.cream;
    if (ax > 30 && y < 50 && y > 34 && z > 20) return bbCol.mintD;
    return mint;
  }));
}
const bbCol = {}; function bbColInit() { if (bbCol.mint) return; Object.assign(bbCol, { mint: lc('#6fd9b0'), mintD: lc('#4fbf97'), pink: lc('#ff9bb8'), cream: lc('#fde7b4') }); }
function bbBellyTex() {
  return kTex(128, 192, (g, W, H) => {
    g.fillStyle = '#fde7b4'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(230,170,110,.55)'; g.lineWidth = 3;
    for (let i = 1; i < 8; i++) { const y = i * H / 8; g.beginPath(); g.moveTo(10, y + 4); g.quadraticCurveTo(W / 2, y - 8, W - 10, y + 4); g.stroke(); }
  }, 'bbBelly');
}
function bbWingShape() { const s = new THREE.Shape(); [[0, 0], [-6, 15], [-24, 28], [-31, 13], [-22, 15], [-25, 2], [-14, 6], [-13, -9], [-5, -3]].forEach((p, i) => { i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); }); s.lineTo(0, 0); return s; }
function bbBuild(it) {
  bbColInit(); const T = THREE, K = kRoot(it, 130), root = K.r, parts = [], CX = -16;
  const M = {
    skin: l3Mat({ color: '#ffffff', vertexColors: true, roughness: 0.42, metalness: 0, clear: 1, clearcoat: 0.4, clearcoatRoughness: 0.35, envMapIntensity: 0.8 }),
    mint: kVinyl('#6fd9b0'), cream: kVinyl('#fde7b4'), horn: kVinyl('#f6e6b5', { roughness: 0.35 }),
    belly: new T.MeshStandardMaterial({ map: bbBellyTex(), roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    wing: new T.MeshStandardMaterial({ color: l3Col('#ff8fb1'), roughness: 0.5, side: T.DoubleSide, emissive: l3Col('#ff6f9a'), emissiveIntensity: 0.12 }),
    bone: new T.LineBasicMaterial({ color: 0xd9608a }),
    blush: new T.MeshBasicMaterial({ color: 0xff9bb0, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    dark: new T.MeshBasicMaterial({ color: 0x24312d }),
    cloud: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, emissive: new T.Color(0xdfe8ff), emissiveIntensity: 0.35 }),
    drop: null
  };
  const P = (m, part) => { m.userData.part = part || 'body'; parts.push(m); return m; };
  const bg = new T.Group(); root.add(bg);
  const body = new T.Mesh(bbBodyGeo(), M.skin); body.castShadow = true; body.receiveShadow = true; bg.add(P(body));
  const belly = new T.Mesh(new T.SphereGeometry(1, 24, 18), M.belly); belly.scale.set(14.5, 21, 8.6); belly.position.set(CX, 36, 17.6); bg.add(P(belly));
  // szarvak
  [-1, 1].forEach(sg => { const h = new T.Mesh(new T.ConeGeometry(4.2, 17, 10), M.horn); h.position.set(CX + sg * 12, 111, 6); h.rotation.z = -sg * 0.3; h.castShadow = true; bg.add(P(h)); });
  // arc
  const eyes = [-1, 1].map(sg => kBead(bg, CX + sg * 11, 90, 24.8, 5.4, 0.75));
  [-1, 1].forEach(sg => { const b = new T.Mesh(new T.CircleGeometry(5, 16), M.blush); b.position.set(CX + sg * 19.5, 82, 21.8); b.rotation.y = sg * 0.62; bg.add(b); const n = new T.Mesh(new T.SphereGeometry(1.1, 6, 5), M.dark); n.position.set(CX + sg * 3.6, 83.5, 29.6); bg.add(n); });
  const sm = new T.Mesh(new T.TorusGeometry(5, 0.7, 6, 14, Math.PI), M.dark); sm.rotation.z = Math.PI; sm.position.set(CX, 77.5, 29.2); bg.add(sm);
  // szárnyak
  const wings = [-1, 1].map(sg => {
    const g = new T.Group(); g.position.set(CX + sg * 24, 66, -12); g.scale.x = -sg; const sh = bbWingShape(), m = new T.Mesh(new T.ShapeGeometry(sh), M.wing); m.castShadow = true; g.add(P(m, 'wing'));
    kLines([[0, 0, 0.1], [-24, 28, 0.1], [0, 0, 0.1], [-30, 13, 0.1], [0, 0, 0.1], [-13, -9, 0.1]], 0xd9608a, g); bg.add(g); return g;
  });
  // farok
  const tg = l3TubeGeo(26, 12); l3TubeSet(tg, l3CatmullPts([[CX, 14, -18], [-36, 9, -24], [-54, 16, -16], [-55, 32, -4], [-47, 40, 3]]), t => 10.5 - 7 * t, null, [0, 0, 1]);
  const tail = new T.Mesh(tg, M.mint); tail.castShadow = true; bg.add(P(tail));
  const tip = new T.Mesh(new T.SphereGeometry(3.8, 10, 8), kVinyl('#ff9bb8')); tip.scale.set(1.2, 0.9, 0.5); tip.position.set(-46, 41.5, 3.4); bg.add(tip); M.tip = tip.material;
  // felhő
  const cl = new T.Group(); cl.position.set(41, 72, 8); root.add(cl);
  [[0, 0, 0, 13], [-13, -4, 2, 10], [13, -3, 2, 10.5], [-6, 9, -2, 9.5], [7, 10, 0, 9], [0, -6, 6, 9]].forEach(c => { const m = new T.Mesh(new T.SphereGeometry(c[3], 18, 14), M.cloud); m.position.set(c[0], c[1], c[2]); m.castShadow = true; m.receiveShadow = true; cl.add(P(m, 'cloud')); });
  const drops = [], dropTex = l3Glow();
  const S = kState({ blink: 0, hop: 0, lean: 0, tilt: 0, wing: 0, sneeze: 0, sleep: 0, rain: 0, lx: 0, ly: 0, cloudX: 0, breath: 0, squint: 0 }, S => {
    bg.position.set(0, S.hop * 16, 0); bg.rotation.set(S.lean + S.sleep * 0.16, 0, S.tilt); bg.scale.set(1 + S.breath * 0.012 - S.sneeze * 0.04, 1 - S.breath * 0.012 + S.sneeze * 0.05, 1);
    wings.forEach((w, i) => { const a = -0.45 + S.wing * 1.0; w.rotation.y = i ? -a : a; });
    eyes.forEach((e, i) => { e.scale.set(1, Math.max(0.08, 1 - Math.max(S.blink, S.sleep, S.squint * 0.8)), 0.75); e.position.x = CX + (i ? 11 : -11) + S.lx * 1.6; e.position.y = 90 - S.ly * 1.1; });
    cl.position.x = 41 + S.cloudX; const g = 1 - S.rain * 0.45; M.cloud.color.setRGB(g, g, Math.min(1, g + 0.05)); M.cloud.emissiveIntensity = 0.35 * (1 - S.rain * 0.7);
  });
  S.__apply();
  const ctl = {
    S: S, root: root, sleeping: false,
    look(p) { if (ctl.sleeping) return; const v = kLookVec(eyes[0], p, 160); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.02) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv(); } },
    blink() { if (ctl.sleeping) return; l3Seq().to(S, { blink: 1 }, 0.07, 'out').to(S, { blink: 0 }, 0.12, 'io').play(); },
    puff() { const v = new T.Vector3(CX, 82, 30); bg.localToWorld(v); root.worldToLocal(v); drParticle(root, 'smoke', v, { vx: 8, vy: 6, vz: 6, life: 1.2, big: 0.8 }); },
    sneeze() { crStop(ctl); ctl.seq = l3Seq().to(S, { lean: -0.18, squint: 1, sneeze: -0.5 }, 0.45, 'io').wait(0.1).to(S, { lean: 0.2, sneeze: 1, cloudX: 9 }, 0.09, 'in').call(() => { ctl.puff(); ctl.puff(); }).to(S, { lean: 0, squint: 0, sneeze: 0, cloudX: 0 }, 0.6, 'back').play(); },
    flap() { crStop(ctl); l3Anim(1.7, u => { S.wing = Math.abs(Math.sin(u * 9 * Math.PI * 0.5)) * Math.min(1, u * 8) * (u > 0.88 ? (1 - u) / 0.12 : 1); S.hop = Math.max(0, Math.sin(u * Math.PI)) * 0.9; S.__apply(); }, () => { S.wing = 0; S.hop = 0; S.__apply(); }); },
    sleep() {
      crStop(ctl); ctl.sleeping = true;
      ctl.seq = l3Seq().to(S, { sleep: 1, lean: 0.05 }, 0.8, 'io').play();
      const z = () => { if (!ctl.sleeping || !L3.on) return; const v = new T.Vector3(CX + 18, 100, 16); const sp = l3Sprite(kZTex(), 0xffffff, 10, 0); sp.position.copy(v); root.add(sp); const x0 = v.x;
        l3Anim(1.8, u => { sp.position.set(x0 + u * 14 + Math.sin(u * 6) * 2, 100 + u * 24, 16); sp.material.opacity = Math.sin(u * Math.PI); const sc = 8 + u * 7; sp.scale.set(sc, sc, 1); }, () => { root.remove(sp); sp.material.dispose(); }); };
      [0.5, 1.7, 2.9, 4.1].forEach(t => setTimeout(z, t * 1000));
      l3Anim(5.2, u => { S.breath = Math.sin(u * 5.2 * 2.2); S.__apply(); }, () => { S.breath = 0; ctl.wake(true); });
    },
    wake(auto) { if (!ctl.sleeping) return; ctl.sleeping = false; crStop(ctl); ctl.seq = l3Seq().to(S, { sleep: 0, lean: 0, breath: 0 }, 0.4, 'out').to(S, { hop: 0.5, wing: 0.6 }, 0.15, 'out').to(S, { hop: 0, wing: 0 }, 0.25, 'bounce').play(); },
    rain() {
      crStop(ctl); const sp = () => { const m = new T.Sprite(new T.SpriteMaterial({ map: dropTex, color: 0x8fb8ff, transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false })); m.scale.set(2.6, 5, 1); const x = 41 + (Math.random() - 0.5) * 26, y0 = 64; m.position.set(x, y0, 10 + Math.random() * 6); root.add(m); l3Anim(0.7, u => { m.position.y = y0 - u * u * 56; m.material.opacity = 0.9 * (1 - u * 0.4); }, () => { root.remove(m); m.material.dispose(); }); };
      l3Anim(2.8, u => { S.rain = Math.min(1, u * 5, (1 - u) * 5); S.cloudX = Math.sin(u * 20) * 0.6 * S.rain; S.__apply(); }, () => { S.rain = 0; S.cloudX = 0; S.__apply(); });
      for (let i = 0; i < 18; i++) setTimeout(() => { if (L3.on) sp(); }, 200 + i * 130);
      l3Seq().to(S, { lx: 0.3, ly: -0.8 }, 0.3, 'out').wait(2.2).to(S, { lx: 0, ly: 0 }, 0.4, 'io').play();
    },
    idle() { if (ctl.sleeping) return; const r = Math.random(); if (r < 0.6) ctl.blink(); else l3Anim(1, u => { S.wing = Math.abs(Math.sin(u * 10)) * 0.5 * Math.sin(u * Math.PI); S.__apply(); }, () => { S.wing = 0; S.__apply(); }); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 50, ctl: ctl };
}
registerDecor3({
  id: 'kis-sarkany', build: bbBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (c.sleeping) { c.wake(); st.n = 0; return; }
    if (part === 'cloud') { c.rain(); return; }
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n === 1) c.sneeze(); else if (st.n === 2) c.flap(); else { c.sleep(); st.n = 0; }
  }
});
