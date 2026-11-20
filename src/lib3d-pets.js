/* ===== 3D díszek: olvasó szellem – puha vinyl-figura, gyöngyszemekkel (a sárkányok: lib3d-dragons2.js) ===== */
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
