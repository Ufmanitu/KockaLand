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
      ctl.seq = l3Seq().quiet().to(S, { lean: 0.5, flame: 0.0, fk: 0.2 }, 0.34, 'in').to(S, { lit: 0, lean: 0, fk: 0 }, 0.6, 'io').play();
    },
    light() { ctl.stop(); S.lean = 0; ctl.seq = l3Seq().quiet().to(S, { flame: 1.25, lit: 1 }, 0.3, 'out').to(S, { flame: 1 }, 0.35, 'io').play(); },
    idle() { if (it.d.off) return; l3Anim(1.7, u => { S.fk = kNoise(u * 14) * 0.7 * (1 - u * 0.6); S.__apply(); }, () => { S.fk = 0; S.__apply(); }, true); },
    stop() { if (ctl.seq) ctl.seq.stop(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 70, ctl: ctl };
}
registerDecor3({
  id: 'lampas', build: lnBuild,
  onClick(it, A) { const on = A.toggle(); if (on) it.ctl.light(); else it.ctl.blow(); }
});

/* ---------- üvegablak-lámpák (3D): a nyomat a valódi termékfotóból (GL_ART), ívelt panel + a fotón látható talp ----------
   Modell-egység = a fotó px-e; y=0 a talp alja. A nyomat fényforrás-mentes (MeshBasic): a fotón a hátulról világított panel már „kész”.
   Kikapcsolva a nyomat elsötétül, a háttérfény és az effektek elmaradnak. */
const GL_TH = 12;   // a panel vastagsága
const GL_FZ = GL_TH / 2 + 1.4;   // az előlap z-je (a test előlapja)
function glShape(g) {
  const T = THREE, hw = g.W / 2, R = (g.rise * g.rise + hw * hw) / (2 * hw), phi = Math.atan2(g.rise, R - hw), sh = new T.Shape();
  sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(hw, g.ys);
  sh.absarc(hw - R, g.ys, R, 0, phi, false);              // jobb ív a csúcsig
  sh.absarc(-hw + R, g.ys, R, Math.PI - phi, Math.PI, false);   // bal ív a csúcstól lefelé
  sh.lineTo(-hw, 0);
  return sh;
}
function glGeos(k) {   // {face: a nyomat lapja (UV a teljes kivágásra), body: a vastagított test}
  return drGeoOnce('gl:' + k, () => {
    const T = THREE, g = glGeom(k), sh = glShape(g);
    const face = new T.ShapeGeometry(sh, 48), p = face.attributes.position, uv = face.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + g.W / 2) / g.W, p.getY(i) / g.H);
    const body = new T.ExtrudeGeometry(sh, { depth: GL_TH, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1.4, bevelSegments: 2, curveSegments: 48 }); body.translate(0, 0, -GL_TH / 2);
    face.userData.shared = body.userData.shared = true; return { face: face, body: body };
  });
}
function glBaseGeo(k) {
  return drGeoOnce('glb:' + k, () => {
    const T = THREE, P = GL_SPEC[k], hw = P.bw / 2; let g;
    if (k === 'night') {   // sötét fa lap: a felső élek levágva
      const sh = new T.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(hw, P.bh - 6); sh.lineTo(hw - 16, P.bh); sh.lineTo(-hw + 16, P.bh); sh.lineTo(-hw, P.bh - 6); sh.lineTo(-hw, 0);
      g = new T.ExtrudeGeometry(sh, { depth: P.bd, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 0.8, bevelSegments: 2 });
    } else if (k === 'rose') {   // fekete, lekerekített végű lap
      const r = 13, sh = new T.Shape(); sh.moveTo(-hw + r, 0); sh.lineTo(hw - r, 0); sh.absarc(hw - r, r, r, -Math.PI / 2, 0, false); sh.lineTo(hw, P.bh - r); sh.absarc(hw - r, P.bh - r, r, 0, Math.PI / 2, false); sh.lineTo(-hw + r, P.bh); sh.absarc(-hw + r, P.bh - r, r, Math.PI / 2, Math.PI, false); sh.lineTo(-hw, r); sh.absarc(-hw + r, r, r, Math.PI, Math.PI * 1.5, false);
      g = new T.ExtrudeGeometry(sh, { depth: P.bd, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.6, bevelSegments: 3, curveSegments: 14 });
    } else {   // füstös akril lap
      g = new T.BoxGeometry(P.bw, P.bh, P.bd); g.translate(0, P.bh / 2, P.bd / 2);
    }
    g.translate(0, 0, -P.bd / 2); g.userData.shared = true; return g;
  });
}
function glFaceMat(k, cb) {   // a nyomat: betöltésig sötét; a textúra a Texture-gyorsítótárban marad (l3Clear nem dobja el)
  const T = THREE, mat = new T.MeshBasicMaterial({ color: 0x120f14, toneMapped: false }), set = t => { mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true; if (cb) cb(); l3Inv(); };
  const ck = L3.kc && L3.kc['gl:' + k]; if (ck) { set(ck); return mat; }
  const img = new Image();
  img.onload = () => { const t = new T.Texture(img); t.encoding = T.sRGBEncoding; t.anisotropy = Math.min(8, L3.r.capabilities.getMaxAnisotropy()); t.needsUpdate = true; L3.kc = L3.kc || {}; L3.kc['gl:' + k] = t; set(t); };
  img.src = GL_ART[k].src; return mat;
}
const glStreakTex = () => kTex(128, 16, (g, w, h) => {   // hullócsillag-csík: a feje (bal vég) fényes, a farka elhalványul
  let gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(255,226,170,.85)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in'; gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, 'glStreak');
const glGlintTex = () => kTex(256, 256, (g, w, h) => {   // ferde, lágy fényfoltsáv (a '/' dőlés a panel képarányára számolva)
  for (let y = 0; y < h; y++) {
    const cx = w * 0.5 + (1 - y / h) * 180 - 90, gr = g.createLinearGradient(cx - 46, 0, cx + 46, 0);
    gr.addColorStop(0, 'rgba(255,235,225,0)'); gr.addColorStop(0.5, 'rgba(255,236,226,.62)'); gr.addColorStop(1, 'rgba(255,235,225,0)'); g.fillStyle = gr; g.fillRect(cx - 46, y, 92, 1.2);
  }
}, 'glGlint');
const glKnurlTex = () => kTex(128, 16, (g, w, h) => {   // a füstös talp alsó, recés sávja
  g.fillStyle = '#2b2b30'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a5a62'; g.lineWidth = 2;
  for (let x = -h; x < w + h; x += 6) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
}, 'glKnurl');

function glBuild3(it, k) {
  const T = THREE, g = glGeom(k), P = GL_SPEC[k], A = GL_ART[k], K = kRoot(it, g.VH + GL_STAGE), root = K.r, parts = [], py = P.bh - P.sink, G = glGeos(k);
  let S = null;
  const M = {
    frame: l3Mat({ color: '#0b0b0f', roughness: 0.55, metalness: 0.2, clear: 1, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.35 }),
    face: glFaceMat(k, () => { if (S) S.__apply(); }),
    gloss: l3Phys({ color: 0xffffff, transparent: true, opacity: k === 'rose' ? 0.14 : 0.08, roughness: 0.03, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false }),
    base: k === 'night' ? l3Mat({ color: '#150b06', roughness: 0.46, metalness: 0.04, clear: 1, clearcoat: 0.45, clearcoatRoughness: 0.35, envMapIntensity: 0.6 })
      : k === 'rose' ? l3Mat({ color: '#0b0b0f', roughness: 0.3, metalness: 0.3, clear: 1, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1 })
        : l3Mat({ color: '#101014', roughness: 0.2, metalness: 0.1, clear: 1, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0.93, envMapIntensity: 0.8 })
  };
  const part = (m, nm) => { m.userData.part = nm; parts.push(m); return m; };
  // panel: test (keret) + a nyomat lapja + fényes fedő
  const body = new T.Mesh(G.body, M.frame); body.position.y = py; body.castShadow = true; body.receiveShadow = true; root.add(part(body, 'frame'));
  const face = new T.Mesh(G.face, M.face); face.position.set(0, py, GL_FZ + 0.25); root.add(part(face, 'glass'));
  const gs = new T.Mesh(G.face, M.gloss); gs.position.set(0, py, GL_FZ + 0.9); gs.renderOrder = 3; root.add(part(gs, 'glass'));
  // talp
  const base = new T.Mesh(glBaseGeo(k), M.base); base.castShadow = true; base.receiveShadow = true; root.add(part(base, 'sw'));
  const X = u => (u - 0.5) * g.W, Y = v => py + (1 - v) * g.H, zf = GL_FZ + 3;
  // talp-részletek + fény-folt a talpon
  const lit = [];   // a „fény” állapotától függő kiegészítők: [mesh|sprite, max-átlátszóság]
  if (k === 'night') {   // a fa lap elülső-felső élén a meleg visszfény
    M.ledge = new T.MeshBasicMaterial({ color: 0xffb870, transparent: true, opacity: 0.85, toneMapped: false });
    const le = new T.Mesh(new T.BoxGeometry(P.bw - 46, 1.8, 2.2), M.ledge); le.position.set(0, P.bh + 0.3, P.bd / 2 - 10); root.add(le); lit.push([le, 0.85]);
  }
  if (k === 'sword') {   // a füstös akril lap élei + recés alsó sáv
    M.edge = new T.MeshBasicMaterial({ color: 0xcfc6b8, transparent: true, opacity: 0.55, toneMapped: false });
    [-1, 1].forEach(s => { const e = new T.Mesh(new T.BoxGeometry(1.8, P.bh - 16, 1.8), M.edge); e.position.set(s * (P.bw / 2 - 3), (P.bh - 16) / 2 + 16, P.bd / 2 + 0.6); root.add(e); });
    M.knurl = new T.MeshBasicMaterial({ map: glKnurlTex(), toneMapped: false });
    const kn = new T.Mesh(new T.PlaneGeometry(P.bw - 2, 14), M.knurl); kn.position.set(0, 8, P.bd / 2 + 0.5); root.add(kn);
  }
  const poolM = new T.Mesh(new T.PlaneGeometry(g.VW * 0.95, 70), new T.MeshBasicMaterial({ map: l3Glow(), color: P.halo, transparent: true, opacity: 0.3, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); poolM.rotation.x = -Math.PI / 2; poolM.position.set(0, P.bh + 0.2, P.bd / 2 - 22); poolM.renderOrder = 4; root.add(poolM); M.pool = poolM.material;
  // háttérfény + pont-fény a szomszédokra
  const halo = kGlowSprite(P.halo, g.VW * 1.7, 0.4); halo.position.set(0, py + g.H * 0.52, -GL_TH / 2 - 16); root.add(halo);
  const light = kLight(root, P.gl, 0.65, it.h * 1.45, 0, py + g.H * 0.5, g.H * 0.28);

  // --- a lámpa effektjei ---
  const fx = {};
  const addSp = (col, size) => { const s = kGlowSprite(col, size, 0); s.visible = false; s.position.z = zf; root.add(s); return s; };
  if (k === 'night') {
    fx.stars = (A.stars || []).map((p, i) => { const s = addSp(0xfff0c4, 15 + (i % 3) * 5); s.position.set(X(p[0]), Y(p[1]), zf + 1); s.userData.ph = i * 1.9; return s; });
    const st = glStreakTex(); fx.met = [[0.82, 0.03, 0], [0.62, 0.0, 0.32], [0.93, 0.12, 0.62]].map(m => {
      const mg = new T.PlaneGeometry(96, 7); mg.translate(48, 0, 0);
      const mm = new T.Mesh(mg, new T.MeshBasicMaterial({ map: st, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
      mm.rotation.z = Math.atan2(0.835, 0.55); mm.position.z = zf + 2; mm.visible = false; mm.renderOrder = 6; mm.userData.m = m; root.add(mm); M['met' + m[2]] = mm.material; return mm;
    });
  } else if (k === 'rose') {
    const gt = kCache('tex:glGlint2', () => { const t0 = glGlintTex().clone(); t0.needsUpdate = true; t0.wrapS = t0.wrapT = T.ClampToEdgeWrapping; return t0; });   // egy közös másolat (az offset-et a jelenet tolja); nem szivárog újraépítéskor
    M.glint = new T.MeshBasicMaterial({ map: gt, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
    fx.glint = new T.Mesh(G.face, M.glint); fx.glint.position.set(0, py, GL_FZ + 0.6); fx.glint.visible = false; fx.glint.renderOrder = 4; root.add(fx.glint);
  } else {
    const fl = P.fl; fx.fl = [[0, 6, 104, 0xff7a1a], [-8, -10, 78, 0xffb43a], [10, 26, 68, 0xffd878], [-4, 50, 50, 0xffe9a8]].map((f, i) => { const s = addSp(f[3], f[2]); s.position.set(X(fl[0]) + f[0], Y(fl[1]) + f[1], zf + 1); s.userData.b = [f[0], f[1], f[2]]; s.userData.i = i; return s; });
    const rng = dcRng(77); fx.em = []; for (let i = 0; i < 18; i++) { const s = addSp(0xffbe5a, 9); s.position.set(X(fl[0]), Y(fl[1]), zf + 2); s.userData.e = { x0: X(fl[0]) + (rng() - 0.5) * 70, y0: Y(fl[1]) + 30 + rng() * 40, vx: (rng() - 0.5) * 90, vy: 150 + rng() * 150, delay: rng() * 1.2, life: 1.5 + rng() * 0.9, size: 6 + rng() * 6 }; fx.em.push(s); }
  }

  S = kState({ lit: it.d.off ? 0 : 1, pulse: 0, env: 0, t: 0, mode: 0 }, S => {
    const lt = S.lit, kk = (0.12 + 0.88 * lt) * (1 + 0.1 * S.pulse);
    if (M.face.map) M.face.color.setScalar(Math.min(1.2, kk)); else M.face.color.setScalar(0.07 + 0.1 * lt);
    halo.material.opacity = 0.5 * lt * (1 + 0.35 * S.pulse); halo.visible = lt > 0.01; if (light) light.intensity = 0.65 * lt * (1 + 0.5 * S.pulse);
    M.pool.opacity = (k === 'rose' ? 0.16 : 0.3) * lt; if (M.knurl) M.knurl.color.setScalar(0.3 + 0.35 * lt); lit.forEach(l => { l[0].material.opacity = l[1] * (0.12 + 0.88 * lt); });
    const e = S.env * lt, t = S.t;
    if (k === 'night') {
      fx.stars.forEach(s => { const v = e * Math.pow(Math.max(0, Math.sin(t * 5.2 + s.userData.ph)), 2) * 0.95; s.visible = v > 0.02; s.material.opacity = v; s.scale.setScalar(15 + 12 * v); });
      fx.met.forEach(m => {
        const mt = m.userData.m, p = (t - mt[2]) / 1.05, on = S.mode === 1 && p > 0 && p < 1 && lt > 0.3; m.visible = on;
        if (on) { m.position.set(X(mt[0]) - 0.55 * 180 * p, Y(mt[1]) - 0.835 * 180 * p, zf + 2); m.material.opacity = Math.sin(Math.PI * Math.min(1, p * 1.05)) * 0.95; }
      });
    } else if (k === 'rose') {
      const p = Math.max(0, Math.min(1, t / 1.7)), on = e > 0.01 && S.mode === 1; fx.glint.visible = on;
      if (on) { M.glint.map.offset.x = -1.1 + 2.2 * p; M.glint.opacity = Math.sin(Math.PI * p) * 0.95; }
    } else {
      fx.fl.forEach(s => { const b = s.userData.b, n = kNoise(t * 1.3 + s.userData.i * 2.1), v = e * (0.7 + 0.3 * n) * (S.mode === 2 ? 0.55 : 1); s.visible = v > 0.02; s.material.opacity = Math.min(1, v) * 0.8; const sc = b[2] * (0.8 + 0.4 * e) * (1 + 0.14 * n); s.scale.set(sc * 0.85, sc * 1.15, 1); s.position.y = Y(P.fl[1]) + b[1] + 4 * n; });
      fx.em.forEach(s => {
        const q = s.userData.e, p = (t - q.delay) / q.life, on = S.mode === 1 && p > 0 && p < 1 && lt > 0.3; s.visible = on;
        if (on) { s.position.set(q.x0 + q.vx * p + Math.sin(p * 7 + q.size) * 6, q.y0 + q.vy * p, zf + 2); s.material.opacity = Math.sin(Math.min(1, p * 1.3) * Math.PI * 0.5) * (1 - p) * 0.95; s.scale.setScalar(q.size * (1 - 0.55 * p)); }
      });
    }
  });
  S.__apply();
  let run = 0;
  const play = (mode, dur) => {   // mode 1 = jelenet (a kattintásra), 2 = csendes (idle: csak a csillanás/villódzás)
    const id = ++run; S.mode = mode; S.t = 0;
    l3Anim(dur, u => { if (id !== run) return; S.t = u * dur; S.env = Math.sin(Math.min(1, u * 1.04) * Math.PI) ** 0.6; S.pulse = mode === 1 ? Math.sin(u * Math.PI) : 0; S.__apply(); },
      () => { if (id !== run) return; S.t = 0; S.env = 0; S.pulse = 0; S.mode = 0; S.__apply(); }, true);   // csendes: nem mozog árnyékot vető geometria → nincs árnyék-újrarajzolás
  };
  const ctl = {
    S: S, root: root,
    lit(on) { ctl.stop(); ctl.seq = l3Seq().quiet().to(S, { lit: on ? 1 : 0 }, on ? 0.55 : 0.4, 'io').play(); if (on) setTimeout(() => { if (L3.on) ctl.scene(); }, 450); },
    scene() { play(1, k === 'night' ? 3.3 : k === 'rose' ? 2.4 : 3.0); },
    idle() { if (it.d.off) return; play(2, k === 'night' ? 1.9 : k === 'rose' ? 2.0 : 1.7); },
    stop() { if (ctl.seq) ctl.seq.stop(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 60, ctl: ctl };
}
function glClick(it, A, e, part) {
  const c = it.ctl; if (part === 'sw') { const on = A.toggle(); c.lit(on); return; }
  if (!A.on) { A.toggle(); c.lit(true); return; }
  c.scene();
}
registerDecor3({ id: 'uveg-var', build: it => glBuild3(it, 'night'), onClick: glClick });
registerDecor3({ id: 'uveg-rozsa', build: it => glBuild3(it, 'rose'), onClick: glClick });
registerDecor3({ id: 'uveg-kard', build: it => glBuild3(it, 'sword'), onClick: glClick });
