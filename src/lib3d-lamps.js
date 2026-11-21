/* ===== 3D díszek: gyertyás lámpás + üvegablak-lámpák (rózsa/pillangó, csillagos vár) =====
   Valódi fény: a láng/üveg pont-fényt vet a szomszéd könyvekre és a polcra; a kapcsoló/gyertya állapota mentődik (S.decor[].off). */
'use strict';

/* ---------- gyertyás lámpás ---------- */
function lnBuild(it) {
  const T = THREE, K = kRoot(it, 170), root = K.r, parts = [];
  const M = {
    iron: l3Mat({ color: '#1b1e26', roughness: 0.4, metalness: 0.85, envMapIntensity: 1.2 }),
    brass: l3Mat({ color: '#e0b04a', roughness: 0.26, metalness: 1, envMapIntensity: 1.4 }),
    glass: l3Phys({ color: l3Col('#ffe2b0'), transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, emissive: l3Col('#ff9d3f'), emissiveIntensity: 0, depthWrite: false }),
    wax: l3Mat({ color: '#f4e6c4', roughness: 0.55, emissive: '#ffb860', emissiveIntensity: 0 }),
    wick: l3Mat({ color: '#241812', roughness: 0.9 }),
    fo: new T.MeshBasicMaterial({ color: 0xff8a1c, transparent: true, opacity: 0.88, depthWrite: false, toneMapped: false }),
    fm: new T.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false }),
    fi: new T.MeshBasicMaterial({ color: 0xfff6d6, transparent: true, opacity: 1, depthWrite: false, toneMapped: false })
  };
  const P = (m, part) => { m.userData.part = part || 'lamp'; parts.push(m); return m; };
  P(kBox(74, 8, 62, M.iron, root, 0, 4, 0));
  const fr = new T.Mesh(new T.CylinderGeometry(38, 49, 13, 4, 1), M.iron); fr.rotation.y = Math.PI / 4; fr.position.y = 14.5; fr.castShadow = true; fr.receiveShadow = true; root.add(P(fr));
  const hold = new T.Mesh(new T.CylinderGeometry(16, 16, 1.6, 28), M.brass); hold.position.y = 21.8; root.add(P(hold));
  [[-25.2, -25.2], [25.2, -25.2], [-25.2, 25.2], [25.2, 25.2]].forEach(c => P(kBox(4.6, 78, 4.6, M.iron, root, c[0], 60, c[1])));
  [[0, 25.2, 46, 76, 0.7], [0, -25.2, 46, 76, 0.7], [25.2, 0, 0.7, 76, 46], [-25.2, 0, 0.7, 76, 46]].forEach(c => { const g = kBox(c[2], c[3], c[4], M.glass, root, c[0], 60, c[1]); g.castShadow = false; g.receiveShadow = false; P(g); g.renderOrder = 3; });
  [-12.5, 12.5].forEach(x => { P(kBox(2.2, 76, 1.6, M.iron, root, x, 60, 25.8)); P(kBox(2.2, 76, 1.6, M.iron, root, x, 60, -25.8)); P(kBox(1.6, 76, 2.2, M.iron, root, 25.8, 60, x)); P(kBox(1.6, 76, 2.2, M.iron, root, -25.8, 60, x)); });
  P(kBox(52, 3, 1.6, M.iron, root, 0, 83, 25.8)); P(kBox(52, 3, 1.6, M.iron, root, 0, 83, -25.8)); P(kBox(1.6, 3, 52, M.iron, root, 25.8, 83, 0)); P(kBox(1.6, 3, 52, M.iron, root, -25.8, 83, 0));
  [[0, 26.6, 0], [0, -26.6, 0], [26.6, 0, Math.PI / 2], [-26.6, 0, Math.PI / 2]].forEach(c => { const d = kBox(5, 5, 1, M.brass, root, c[0] * (c[2] ? 1 : 0), 83, c[2] ? c[0] : c[1]); d.rotation.z = Math.PI / 4; d.rotation.y = c[2]; P(d); });
  P(kBox(66, 7, 66, M.iron, root, 0, 100.5, 0));
  const cap = kLathe([[33, 104], [29, 110], [23, 118], [15, 125], [7, 130.5], [1.5, 134], [0, 135]].map(p => [p[0] * 1.4142, p[1]]), 4, M.iron, root); cap.rotation.y = Math.PI / 4; P(cap);
  const kn = new T.Mesh(new T.SphereGeometry(3.6, 14, 10), M.brass); kn.position.y = 137; kn.castShadow = true; root.add(P(kn));
  const ring = new T.Mesh(new T.TorusGeometry(10, 1.7, 8, 24, Math.PI), M.iron); ring.position.y = 137; ring.castShadow = true; root.add(P(ring));
  const wax = new T.Mesh(new T.CylinderGeometry(6.5, 7, 30, 22), M.wax); wax.position.y = 37; wax.castShadow = true; root.add(P(wax));
  const lip = new T.Mesh(new T.CylinderGeometry(6.6, 6.6, 0.8, 22), M.wax); lip.position.y = 52.2; root.add(lip);
  const wk = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 4.4, 6), M.wick); wk.position.y = 54.4; root.add(wk);
  const fl = new T.Group(); fl.position.y = 56; root.add(fl);
  const prof = [[0, 0], [2.8, 1.2], [4.4, 5], [4.9, 10.5], [4, 17.5], [2, 25], [0, 31]];
  [[M.fo, 1, 1], [M.fm, 0.66, 0.74], [M.fi, 0.38, 0.46]].forEach(f => { const m = kLathe(prof.map(p => [p[0] * f[1], p[1] * f[2]]), 14, f[0], fl); m.castShadow = false; m.renderOrder = 4; });
  const halo = kGlowSprite(0xffa84a, 170, 0.5); halo.position.set(0, 62, -10); root.add(halo);
  const light = kLight(root, 0xffb457, 1.15, 210, 0, 64, 26);
  const S = kState({ lit: it.d.off ? 0 : 1, flame: it.d.off ? 0 : 1, lean: 0, fk: 0 }, S => {
    M.glass.emissiveIntensity = 0.55 * S.lit; M.glass.opacity = 0.14 + 0.16 * S.lit; M.wax.emissiveIntensity = 0.22 * S.lit;
    fl.visible = S.flame > 0.02; fl.scale.set(S.flame * (1 - S.fk * 0.15), S.flame * (1 + S.fk * 0.4), S.flame * (1 - S.fk * 0.15)); fl.rotation.z = S.lean;
    if (light) light.intensity = 1.15 * S.lit * (1 + S.fk * 0.2);
    halo.material.opacity = 0.55 * S.lit * (1 + S.fk * 0.15); halo.visible = S.lit > 0.01;
  });
  S.__apply();
  const ctl = {
    S: S, root: root,
    blow() {
      ctl.stop();
      for (let i = 0; i < 6; i++) setTimeout(() => { if (L3.on) drParticle(root, 'smoke', new T.Vector3(0, 58 + i * 2, 0), { vx: (Math.random() - 0.3) * 6, vy: 18 + Math.random() * 8, vz: 0, life: 1.7, big: 0.7 }); }, 120 + i * 220);
      ctl.seq = l3Seq().to(S, { lean: 0.5, flame: 0.0, fk: 0.2 }, 0.34, 'in').to(S, { lit: 0, lean: 0, fk: 0 }, 0.6, 'io').play();
    },
    light() { ctl.stop(); S.lean = 0; ctl.seq = l3Seq().to(S, { flame: 1.25, lit: 1 }, 0.3, 'out').to(S, { flame: 1 }, 0.35, 'io').play(); },
    idle() { if (it.d.off) return; l3Anim(1.7, u => { S.fk = kNoise(u * 14) * 0.7 * (1 - u * 0.6); S.__apply(); }, () => { S.fk = 0; S.__apply(); }); },
    stop() { if (ctl.seq) ctl.seq.stop(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 70, ctl: ctl };
}
registerDecor3({
  id: 'lampas', build: lnBuild,
  onClick(it, A) { const on = A.toggle(); if (on) it.ctl.light(); else it.ctl.blow(); }
});

/* ---------- üvegablak-lámpák ---------- */
function glArchGeo() {
  return drGeoOnce('glArch', () => {
    const T = THREE, sh = new T.Shape(), hole = new T.Path();
    sh.moveTo(-46, 10); sh.lineTo(46, 10); sh.lineTo(46, 112); sh.absarc(0, 112, 46, 0, Math.PI, false); sh.lineTo(-46, 10);
    hole.moveTo(-39, 18); hole.lineTo(-39, 112); hole.absarc(0, 112, 39, Math.PI, 0, true); hole.lineTo(39, 18); hole.lineTo(-39, 18); sh.holes.push(hole);
    const g = new T.ExtrudeGeometry(sh, { depth: 9, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.6, bevelSegments: 3, curveSegments: 40 }); g.translate(0, 0, -4.5); g.userData.shared = true; return g;
  });
}
function glGlassGeo() {
  return drGeoOnce('glGlass', () => {
    const T = THREE, sh = new T.Shape(); sh.moveTo(-39.5, 17.5); sh.lineTo(39.5, 17.5); sh.lineTo(39.5, 112); sh.absarc(0, 112, 39.5, 0, Math.PI, false); sh.lineTo(-39.5, 17.5);
    const g = new T.ShapeGeometry(sh, 40), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 50) / 100, p.getY(i) / 170);
    g.userData.shared = true; return g;
  });
}
function glBaseGeo() {
  return drGeoOnce('glBase', () => {
    const T = THREE, sh = new T.Shape(); sh.moveTo(-47, 0); sh.lineTo(47, 0); sh.lineTo(44, 10); sh.lineTo(-44, 10); sh.lineTo(-47, 0);
    const g = new T.ExtrudeGeometry(sh, { depth: 24, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 0.8, bevelSegments: 2 }); g.translate(0, 0, -12); g.userData.shared = true; return g;
  });
}
function glTexMat(inner, cb, key) {
  const T = THREE, mat = new T.MeshBasicMaterial({ color: 0x1a1830, toneMapped: false }), img = new Image(), ck = L3.kc && L3.kc['gl:' + key];
  if (ck) { mat.map = ck; mat.color.set(0xffffff); return mat; }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170" width="600" height="1020"><rect width="100" height="170" fill="#07060d"/>' + inner + '</svg>';
  img.onload = () => { const c = document.createElement('canvas'); c.width = 600; c.height = 1020; c.getContext('2d').drawImage(img, 0, 0, 600, 1020); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; mat.map = t; L3.kc = L3.kc || {}; L3.kc['gl:' + key] = t; mat.color.set(0xffffff); mat.needsUpdate = true; if (cb) cb(); l3Inv(); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); return mat;
}
const GLS = '<g stroke="#17110f" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">';
function glBuild3(it, which) {
  const T = THREE, K = kRoot(it, 170), root = K.r, parts = [], rose = which === 'rose';
  const scene = rose ? glRoseScene('t') : glCastleScene('t');
  let stat = scene, bfly = '', shoot = '', heart = '', petal = '';
  if (rose) { const i = scene.indexOf('<g class="d-bfly">'); bfly = scene.slice(i); stat = scene.slice(0, i); const pm = stat.match(/<path class="d-petal"[^>]*\/>/); petal = pm ? pm[0] : ''; stat = stat.replace(petal, ''); }
  else { const sm = scene.match(/<g class="d-shoot">[\s\S]*?<\/g>/), hm = scene.match(/<path class="d-heart"[^>]*\/>/); shoot = sm ? sm[0] : ''; heart = hm ? hm[0] : ''; stat = scene.replace(shoot, '').replace(heart, ''); }
  const M = {
    frame: l3Mat({ color: '#15171d', roughness: 0.36, metalness: 0.4, clear: 1, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.9 }),
    brass: l3Mat({ color: '#e0b04a', roughness: 0.26, metalness: 1, envMapIntensity: 1.4 }),
    glass: glTexMat(stat, () => { if (typeof S !== 'undefined' && S.__apply) S.__apply(); }, which),
    gloss: l3Phys({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false }),
    led: new T.MeshBasicMaterial({ color: 0xff7a1a, toneMapped: false })
  };
  const P = (m, part) => { m.userData.part = part || 'glass'; parts.push(m); return m; };
  const frame = new T.Mesh(glArchGeo(), M.frame); frame.castShadow = true; frame.receiveShadow = true; frame.position.y = 0; root.add(P(frame, 'frame'));
  const gl = new T.Mesh(glGlassGeo(), M.glass); gl.position.z = 0.4; root.add(P(gl, 'glass'));
  const gs = new T.Mesh(glGlassGeo(), M.gloss); gs.position.z = 1.2; gs.renderOrder = 3; root.add(P(gs, 'glass'));
  const base = new T.Mesh(glBaseGeo(), M.frame); base.castShadow = true; base.receiveShadow = true; root.add(P(base, 'frame'));
  const fin = new T.Mesh(new T.SphereGeometry(3.4, 14, 10), M.brass); fin.position.set(0, 161, 0); fin.castShadow = true; root.add(P(fin, 'frame'));
  const kb = new T.Mesh(new T.SphereGeometry(4.2, 16, 10), M.brass); kb.scale.z = 0.7; kb.position.set(0, 5, 12.4); kb.castShadow = true; root.add(P(kb, 'sw'));
  const led = new T.Mesh(new T.SphereGeometry(1.5, 10, 8), M.led); led.position.set(0, 5, 15.8); root.add(led);
  parts.push(kHit(root, 12, 0, 5, 14, 'sw'));
  const gcol = rose ? 0xffa86b : 0xc9a0ff;
  const halo = kGlowSprite(rose ? 0xff9a60 : 0x9a8cff, 230, 0.5); halo.position.set(0, 88, -16); root.add(halo);
  const light = kLight(root, gcol, 0.6, 230, 0, 92, 46);
  // dinamikus részek
  const dyn = {};
  if (rose) {
    const bf = new T.Group(); bf.position.set(10, 135, 2); root.add(bf); dyn.bf = bf;
    const wl = kSvgPlane(GLS + (bfly.match(/<g class="d-wl">[\s\S]*?<\/g>/) || [''])[0] + '</g>', '-24 -20 24 42', 24 * 0.82, 42 * 0.82, 96, 168, { dx: -12 * 0.82, dy: -1 * 0.82, key: 'bfL' }), wr = kSvgPlane(GLS + (bfly.match(/<g class="d-wr">[\s\S]*?<\/g>/) || [''])[0] + '</g>', '0 -20 24 42', 24 * 0.82, 42 * 0.82, 96, 168, { dx: 12 * 0.82, dy: -1 * 0.82, key: 'bfR' });
    const bd = kSvgPlane('<g stroke="#17110f" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">' + (bfly.match(/<path d="M0 -8C2 -5[^>]*\/>/) || [''])[0] + (bfly.match(/<path d="M0 -8C-3[^>]*\/>/) || [''])[0] + '</g>', '-8 -17 16 29', 16 * 0.82, 29 * 0.82, 64, 116, { dy: -2.5 * 0.82, key: 'bfB' });
    bf.add(wl, wr, bd); dyn.wl = wl; dyn.wr = wr; dyn.bd = bd;
    const pt = kSvgPlane(petal, '54 68 11 13', 11, 13, 66, 78, { key: 'petal' }); pt.position.set(9, 94.5, 2); root.add(pt); dyn.pt = pt;
  } else {
    const sh = kSvgPlane(shoot, '30 18 34 26', 34, 26, 204, 156, { hidden: true, key: 'shoot' }); sh.position.set(-3, 139, 2); sh.visible = false; root.add(sh); dyn.sh = sh;
    const ht = kSvgPlane(heart, '17 94 16 17', 16, 17, 96, 102, { hidden: true, key: 'heart' }); ht.position.set(-25, 67.5, 2); ht.visible = false; root.add(ht); dyn.ht = ht;
  }
  const S = kState({ lit: it.d.off ? 0 : 1, pulse: 0, fly: 0, flap: 0.15, bx: 0, by: 0, bz: 0, shoot: 0, heart: 0, petal: 0 }, S => {
    const k = 0.1 + 0.9 * S.lit * (1 + S.pulse * 0.08); M.glass.color.setScalar(Math.min(1.1, k)); if (M.glass.map === null) M.glass.color.setScalar(0.1 + 0.2 * S.lit);
    halo.material.opacity = 0.6 * S.lit; halo.visible = S.lit > 0.01; if (light) light.intensity = 0.6 * S.lit;
    M.led.color.set(S.lit > 0.5 ? 0xff7a1a : 0x4a2208);
    if (rose) {
      const fl = S.flap; dyn.wl.rotation.y = fl * 1.0; dyn.wr.rotation.y = -fl * 1.0;
      dyn.bf.position.set(10 + S.bx, 135 + S.by, 2 + S.bz); dyn.bf.rotation.z = S.bx * 0.02;
      const pf = S.petal; dyn.pt.position.set(9 + Math.sin(pf * 9) * 4, 94.5 - pf * 70, 2 + pf * 6); dyn.pt.rotation.z = pf * 5; dyn.pt.material.opacity = pf > 0.8 ? (1 - pf) * 5 : 1;
    } else {
      const sh = S.shoot, ht = S.heart; dyn.sh.visible = sh > 0 && sh < 1 && dyn.sh.userData.ready; dyn.sh.position.set(-3 + sh * 46, 139 - sh * 34, 3); dyn.sh.material.opacity = Math.sin(sh * Math.PI);
      dyn.ht.visible = ht > 0 && ht < 1 && dyn.ht.userData.ready; dyn.ht.position.set(-25, 67.5 + ht * 26, 3); const hs = 0.6 + Math.sin(Math.min(1, ht * 2) * Math.PI * 0.5) * 0.7; dyn.ht.scale.set(hs, hs, 1); dyn.ht.material.opacity = ht < 0.7 ? 1 : (1 - ht) / 0.3;
    }
  });
  S.__apply();
  const ctl = {
    S: S, root: root,
    lit(on) { ctl.stop(); ctl.seq = l3Seq().to(S, { lit: on ? 1 : 0 }, on ? 0.55 : 0.4, 'io').play(); },
    bloom() {
      ctl.stop();
      if (rose) {
        l3Anim(3.2, u => {
          const f = Math.sin(Math.PI * Math.min(1, u * 1.05)), a = u * Math.PI * 2;
          S.fly = f; S.bx = Math.sin(a) * 30 * f; S.by = Math.sin(u * Math.PI) * 22 + Math.sin(a * 2) * 5 * f; S.bz = f * 34 + Math.cos(a) * 8 * f; S.flap = 0.15 + Math.abs(Math.sin(u * 60)) * 0.9 * (f > 0.05 ? 1 : 0); S.petal = Math.max(0, Math.min(1, (u - 0.12) / 0.8)); S.__apply();
        }, () => { S.bx = S.by = S.bz = 0; S.flap = 0.15; S.petal = 0; S.__apply(); });
      } else {
        l3Anim(0.9, u => { S.shoot = u; S.__apply(); }, () => { S.shoot = 0; S.__apply(); });
        setTimeout(() => { if (L3.on) l3Anim(2.2, u => { S.heart = u; S.__apply(); }, () => { S.heart = 0; S.__apply(); }); }, 700);
      }
    },
    idle() {
      if (it.d.off) return;
      if (rose) l3Anim(1.1, u => { S.flap = 0.15 + Math.abs(Math.sin(u * 40)) * 0.7 * Math.sin(u * Math.PI); S.bx = Math.sin(u * Math.PI) * 3; S.__apply(); }, () => { S.flap = 0.15; S.bx = 0; S.__apply(); });
      else l3Anim(1.4, u => { S.pulse = Math.sin(u * Math.PI * 3) * (1 - u); S.__apply(); }, () => { S.pulse = 0; S.__apply(); });
    },
    stop() { if (ctl.seq) ctl.seq.stop(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 40, ctl: ctl };
}
function glClick(it, A, e, part) {
  const c = it.ctl; if (part === 'sw') { const on = A.toggle(); c.lit(on); return; }
  if (!A.on) { A.toggle(); c.lit(true); return; }
  c.bloom();
}
registerDecor3({ id: 'uveg-rozsa', build: it => glBuild3(it, 'rose'), onClick: glClick });
registerDecor3({ id: 'uveg-var', build: it => glBuild3(it, 'castle'), onClick: glClick });
