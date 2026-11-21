/* ===== 3D díszek: olvasó szellem – fehér, harang alakú figura a polc szélén ülve, apró fekete könyvet olvas (a sárkányok: lib3d-dragons2.js, lib3d-flyimg.js) ===== */
'use strict';

/* közös: „soha ne fusson le üresen” tweenek, amik a ctl.seq-et cserélik */
const crStop = c => { if (c.seq) c.seq.stop(); };

/* ---------- olvasó szellem ----------
   Referencia: sima, matt fehér harang alakú szellem a polc szélén; két hosszúkás szem-lyuk, rövid, dundi karok, a mellkasánál tartott apró fekete könyvet olvas;
   az alsó szegélye a polc peremén lóg át, három hullámos csúccsal. Modell-egységek: vh = 130; a polc éle z = −1.5 (a test hátrébb ül). */
const GH = { Z: -28.5 };     // a test közepe (a mellkas eleje a peremnél)
function ghF(x, y, z) {
  const zz = z - 0.11 * Math.max(0, y - 24);                  // a fej enyhén előre dől (a könyv felé)
  let d = smin(sdCone(x, y, zz * 1.3, 0, 2, 0, 0, 56, 0, 35, 31), sdEll(x, y - 77, zz, 30, 30, 26), 16);
  return smax(d, -y, 2.2);                                    // lapos alj
}
function ghBodyGeo() { return drGeoOnce('ghBody2', () => sdfGeo(ghF, [-42, -3, -38], [42, 112, 46], 1.6, () => [1, 1, 1])); }
function ghArmGeo() {   // a +x oldali kar a vállhoz képest: könyök kifelé-előre, a kéz a könyv szélén
  return drGeoOnce('ghArm2', () => sdfGeo((x, y, z) => { let d = smin(sdCone(x, y, z, 0, 0, 0, 4, -14, 18, 8.6, 7.8), sdCone(x, y, z, 4, -14, 18, -10, -23, 31, 7.8, 7.6), 4); return smin(d, sdSph(x + 10, y + 23, z - 31, 8.8), 3); }, [-24, -40, -12], [18, 12, 44], 1.4, () => [1, 1, 1]));
}
function ghSurfZ(x, y) { for (let z = 50; z > -40; z -= 0.4) if (ghF(x, y, z) < 0) return z; return 20; }
function ghHemGeo() {
  return drGeoOnce('ghHem', () => {
    const T = THREE, bot = new T.SplineCurve([[30, -8], [28, -15], [22.5, -22], [17, -15], [11, -11.5], [6, -16.5], [0, -17.5], [-5, -12.5], [-11, -10.5], [-16.5, -19], [-22, -25.5], [-27.5, -16], [-30, -9]].map(p => new T.Vector2(p[0], p[1]))).getPoints(64);
    const sh = new T.Shape(); sh.moveTo(-31, 3); sh.lineTo(31, 3); sh.lineTo(30, -8); bot.forEach(p => sh.lineTo(p.x, p.y)); sh.lineTo(-31, 3);
    const g = new T.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1.4, bevelSegments: 3, curveSegments: 4 }); g.translate(0, 0, -1.6); g.userData.shared = true; return g;
  });
}
function ghCoverTex() {
  return kTex(128, 96, (g, W, H) => {
    g.fillStyle = '#1b1b20'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,125,145,.22)'; g.lineWidth = 1; for (let x = 0; x < W; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.35)'; for (let x = 1.5; x < W; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  }, 'ghCover');
}
function ghBuild(it) {
  const T = THREE, K = kRoot(it, 130), root = K.r, parts = [], mats = [];
  const M = {
    body: new T.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.55, metalness: 0, emissive: l3Col('#fff3dc'), emissiveIntensity: 0.07, envMapIntensity: 0.7 }),
    cover: new T.MeshStandardMaterial({ color: 0xffffff, map: ghCoverTex(), roughness: 0.75, metalness: 0, envMapIntensity: 0.35 }),
    edge: new T.MeshStandardMaterial({ color: 0x15151a, roughness: 0.6, envMapIntensity: 0.3 }),
    page: new T.MeshStandardMaterial({ color: 0xf6ecd0, roughness: 0.9, side: T.DoubleSide }),
    hole: new T.MeshBasicMaterial({ color: 0x1b1720, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
    mouth: new T.MeshBasicMaterial({ color: 0x24202a })
  };
  mats.push(M.body, M.cover, M.edge, M.page, M.hole, M.mouth);
  const P = (m, part) => { m.userData.part = part || 'body'; parts.push(m); return m; };
  const halo = kGlowSprite(0xfff0d0, 170, 0.12); halo.position.set(0, 58, -40); root.add(halo); mats.push(halo.material);
  const bg = new T.Group(); root.add(bg);                       // minden, ami a testtel mozog (a hop/rejtőzés/nő)
  const body = new T.Mesh(ghBodyGeo(), M.body); body.position.z = GH.Z; body.castShadow = true; body.receiveShadow = true; bg.add(P(body));
  // szegély a polc peremén
  const hem = new T.Mesh(ghHemGeo(), M.body); hem.position.set(0, 1.6, -0.6); hem.castShadow = true; hem.receiveShadow = true; bg.add(P(hem));
  // karok (a vállnál forognak)
  const arms = [1, -1].map(sg => { const g = new T.Group(); g.position.set(sg * 29.5, 58, GH.Z + 15); g.scale.x = sg; const m = new T.Mesh(ghArmGeo(), M.body); m.castShadow = true; g.add(P(m)); bg.add(g); g.userData.sg = sg; return g; });
  // szem-lyukak: sötét, hosszúkás matrica a mellkas felszínén (a felület normálja mentén állítva)
  const ey = 77.5, eyes = [-1, 1].map(sg => {
    const x = sg * 12.6, zl = ghSurfZ(x, ey), e = 0.8, nx = ghF(x + e, ey, zl) - ghF(x - e, ey, zl), ny = ghF(x, ey + e, zl) - ghF(x, ey - e, zl), nz = ghF(x, ey, zl + e) - ghF(x, ey, zl - e), nl = Math.hypot(nx, ny, nz) || 1;
    const n = new T.Vector3(nx / nl, ny / nl, nz / nl), g = new T.Group(); g.position.set(x, ey, GH.Z + zl + 0.35); g.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), n);
    const h = new T.Mesh(new T.CircleGeometry(1, 28), M.hole); h.scale.set(4.7, 6.8, 1); h.renderOrder = 6; g.add(h); bg.add(g); g.userData.x = x; g.userData.y = ey; return g;
  });
  const mo = new T.Mesh(new T.CircleGeometry(3.6, 16), M.mouth); mo.scale.y = 1.2; mo.position.set(0, 64, GH.Z + ghSurfZ(0, 64) + 0.3); mo.visible = false; bg.add(mo);
  // apró fekete könyv a mellkas előtt: a hátlapja látszik (szövetes), balról a lapok pereme
  const bk = new T.Group(); bk.position.set(0, 41, 17); bk.rotation.x = -0.28; root.add(bk);
  P(kBox(40, 28, 4.6, M.edge, bk, 0, 0, 0), 'book');
  const cv = new T.Mesh(new T.PlaneGeometry(39.2, 27.4), M.cover); cv.position.z = 2.35; bk.add(P(cv, 'book'));
  const pgs = kBox(2.6, 25, 3.8, M.page, bk, -18.6, 0.2, 0.8); P(pgs, 'book');
    const S = kState({ blink: 0, hop: 0, hide: 0, grow: 0, eyeW: 1, armUp: 0, flip: 0, lx: 0, ly: 0, mouthO: 0, glow: 0.12, shake: 0, read: 0 }, S => {
    bg.position.set(S.shake, S.hop * 12 - S.hide * 62 + S.grow * 8, 0); bg.scale.set(1 + S.grow * 0.22 - S.hop * 0.04, 1 + S.grow * 0.25 + S.hop * 0.08, 1 + S.grow * 0.2);
    hem.visible = S.hide < 0.2;
    arms.forEach(g => { g.rotation.z = -g.userData.sg * S.armUp * 1.15; g.rotation.x = -S.armUp * 0.5; });
    bk.position.set(0, 41 - S.armUp * 22 - S.hide * 62, 17 - S.armUp * 6); bk.rotation.x = -0.28 - S.armUp * 0.5 + S.read * 0.07;
    eyes.forEach(e => { e.scale.set(S.eyeW, S.eyeW * Math.max(0.06, 1 - S.blink), 1); e.position.x = e.userData.x + S.lx * 1.7; e.position.y = e.userData.y - 1.6 * (1 - S.mouthO) - S.ly * 1.2; });
    mo.visible = S.mouthO >= 0.4; mo.scale.setScalar(0.6 + S.mouthO * 0.9); mo.scale.y *= 1.2;
    M.body.emissiveIntensity = 0.07 + (S.glow - 0.12) * 0.9; halo.material.opacity = S.glow;
  });
  S.__apply();
  const ctl = {
    S: S, root: root,
    look(p) { if (ctl.busy) return; const v = kLookVec(eyes[0], p, 160); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.02) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv(); } },
    blink() { l3Seq().to(S, { blink: 1 }, 0.07, 'out').to(S, { blink: 0 }, 0.12, 'io').play(); },
    turn() { if (ctl.busy) return; ctl.busy = true; l3Anim(1.7, u => { S.lx = -1 + 2 * u; S.ly = 0.7 - Math.sin(u * Math.PI * 2) * 0.2; S.read = Math.sin(u * Math.PI); S.__apply(); }, () => { S.lx = 0; S.ly = 0; S.read = 0; S.__apply(); ctl.busy = false; }); },
    startle() { crStop(ctl); ctl.seq = l3Seq().to(S, { hop: 1, eyeW: 1.28, armUp: 0.5, glow: 0.5 }, 0.14, 'out').to(S, { hop: 0 }, 0.22, 'bounce').wait(0.5).to(S, { eyeW: 1, armUp: 0, glow: 0.12 }, 0.5, 'io').play(); },
    hide() { crStop(ctl); ctl.seq = l3Seq().to(S, { hide: 1, eyeW: 1.1 }, 0.4, 'in').wait(1.2).to(S, { hide: 0.62 }, 0.35, 'io').wait(0.5).to(S, { hide: 0, eyeW: 1 }, 0.45, 'back').play(); },
    spook() {
      crStop(ctl);
      ctl.seq = l3Seq().to(S, { grow: 1, eyeW: 1.35, armUp: 1.0, mouthO: 1, glow: 0.7 }, 0.35, 'out').to(S, { shake: 1.4 }, 0.05).to(S, { shake: -1.4 }, 0.08).to(S, { shake: 1.2 }, 0.08).to(S, { shake: -1 }, 0.08).to(S, { shake: 0 }, 0.08)
        .wait(0.9).to(S, { grow: 0, eyeW: 1, armUp: 0, mouthO: 0, glow: 0.12 }, 0.6, 'io').play();
    },
    idle() { if (Math.random() < 0.65) ctl.blink(); else ctl.turn(); },
  };
  return { grp: K.g, parts: parts, mats: mats, d: 50, ctl: ctl };
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
