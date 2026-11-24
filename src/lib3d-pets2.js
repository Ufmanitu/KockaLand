/* ===== 3D díszek: alvó macska, bagoly, cserepes pozsgás (puha, „vinyl-játék” hatású, procedurális modellek) ===== */
'use strict';

const p2Mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const p2Sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function p2Ring() {
  return kTex(128, 128, (g, W) => { g.lineCap = 'round'; for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,240,200,' + (0.95 - i * 0.22) + ')'; g.lineWidth = 7 - i; g.beginPath(); g.arc(W * 0.5, W * 0.5, 22 + i * 17, -0.8, 0.8); g.stroke(); } }, 'p2Ring');
}
function p2Star() {
  return kTex(64, 64, g => { g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 5 : 30, a = i * Math.PI / 4 - Math.PI / 2; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.closePath(); g.fill(); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 14); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }, 'p2Star');
}

/* ---------- alvó macska ---------- */
const ctCol = {};
function ctColInit() { if (!ctCol.g) Object.assign(ctCol, { g: lc('#6d6d80'), gl: lc('#8d8da0'), gd: lc('#2c2c40'), cream: lc('#f6eedf'), pink: lc('#b0707a') }); }
function ctBodyGeo() {
  ctColInit();
  return drGeoOnce('ctBody', () => sdfGeo((x, y, z) => {
    let d = sdEll(x - 6, y - 26, z + 4, 52, 27, 30);
    d = smin(d, sdEll(x - 34, y - 22, z - 2, 26, 22, 27), 10);
    d = smin(d, sdEll(x + 20, y - 24, z - 4, 22, 22, 24), 10);
    return smax(d, 1 - y, 4);
  }, [-62, 0, -38], [66, 62, 34], 1.8, (x, y, z) => {
    const base = p2Mix(ctCol.g, ctCol.gl, p2Sm(8, 52, y) * 0.8);
    const c = Math.cos(x * 0.3927 + (y > 36 ? 0.25 : 0)), t = p2Sm(0.55, 0.82, c) * p2Sm(10, 22, y) * p2Sm(-14, 4, z);
    return p2Mix(base, ctCol.gd, t * 0.85);
  }));
}
function ctHeadGeo() {
  ctColInit();
  return drGeoOnce('ctHead', () => sdfGeo((x, y, z) => {
    let d = sdEll(x, y, z, 25, 21.5, 21);
    d = smin(d, sdEll(Math.abs(x) - 16, y + 6, z - 7, 9.5, 8, 10), 5);
    return d;
  }, [-30, -26, -26], [30, 26, 26], 1.4, (x, y, z) => {
    let col = p2Mix(ctCol.g, ctCol.gl, p2Sm(-10, 20, y) * 0.7);
    const e = (x / 12.5) * (x / 12.5) + ((y + 8.5) / 8.5) * ((y + 8.5) / 8.5), mz = p2Sm(4, 12, z);
    col = p2Mix(col, ctCol.cream, (1 - p2Sm(0.75, 1.15, e)) * mz);
    // homlok-csíkok (3) és arc-csíkok
    if (z > -2) {
      const ax = Math.abs(x);
      const f = Math.max(1 - p2Sm(0.9, 1.9, Math.abs(x)), 1 - p2Sm(0.9, 1.9, Math.abs(ax - 7))) * p2Sm(6, 10, y) * (1 - p2Sm(19, 22, y));
      const ch = (1 - p2Sm(0.8, 1.5, Math.abs(((y + 4) % 6.5 + 6.5) % 6.5 - 3.25))) * p2Sm(15, 19, ax) * p2Sm(-8, 0, y) * (1 - p2Sm(3, 8, y));
      col = p2Mix(col, ctCol.gd, Math.min(1, f * 0.8 + ch * 0.7));
    }
    return col;
  }));
}
function ctBuild(it) {
  ctColInit(); const T = THREE, K = kRoot(it, 90), root = K.r, parts = [];
  const M = {
    fur: l3Skin({ color: '#ffffff', kind: 'fur', vcol: true, cell: 2.4, amt: 0.55, rough: 0.88, env: 0.5 }),
    furP: l3Skin({ color: '#6d6d80', kind: 'fur', cell: 2.4, amt: 0.55, rough: 0.88, env: 0.5 }),
    cream: kVinyl('#f6eedf', { roughness: 0.8, clearcoat: 0 }),
    pink: new T.MeshStandardMaterial({ color: l3Col('#b0707a'), roughness: 0.7 }),
    nose: kVinyl('#ee8fa4', { roughness: 0.35 }),
    iris: new T.MeshStandardMaterial({ color: l3Col('#c0ee6f'), roughness: 0.3, emissive: l3Col('#9bd04a'), emissiveIntensity: 0.25 }),
    pupil: new T.MeshBasicMaterial({ color: 0x15180e }),
    glint: new T.MeshBasicMaterial({ color: 0xffffff }),
    line: new T.MeshBasicMaterial({ color: 0x2a2a3a }),
    mouth: new T.MeshStandardMaterial({ color: l3Col('#b04460'), roughness: 0.6 }),
    tongue: new T.MeshStandardMaterial({ color: l3Col('#f08aa0'), roughness: 0.5 }),
    whisk: new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
  };
  const P = (m, part) => { m.userData.part = part || 'body'; parts.push(m); return m; };
  const bg = new T.Group(); root.add(bg);   // test (szuszogás, remegés)
  const body = new T.Mesh(ctBodyGeo(), M.fur); body.castShadow = true; body.receiveShadow = true; bg.add(P(body, 'body'));
  // farok (a törzs körül, elöl)
  const TP = [52, 9, -2], tg = l3TubeGeo(30, 12);
  l3TubeSet(tg, l3CatmullPts([[0, 0, 0], [8, -3, 8], [3, -5, 20], [-14, -5, 30], [-40, -5, 35], [-66, -5, 34]]), t => 6.2 - 1.6 * t * t, null, [0, 1, 0]);
  const tailG = new T.Group(); tailG.position.set(TP[0], TP[1], TP[2]); bg.add(tailG);
  const tail = new T.Mesh(tg, M.furP); tail.castShadow = true; tailG.add(P(tail, 'tail'));
  const tip = new T.Mesh(new T.SphereGeometry(5.2, 12, 10), M.furP); tip.position.set(-66, -5, 34); tip.scale.set(1, 0.9, 0.95); tailG.add(P(tip, 'tail'));
  // mancsok
  [-1, 1].forEach(sg => {
    const g = new T.Group(); g.position.set(-35 + sg * 13, 6, 30);
    const p = new T.Mesh(new T.SphereGeometry(1, 16, 12), M.cream); p.scale.set(10.4, 5.6, 9); p.castShadow = true; g.add(P(p, 'paw'));
    for (let k = -1; k <= 1; k++) { const l = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 3.4, 5), M.line); l.position.set(k * 3.6, 1.4, 8.6); l.rotation.x = 1.25; g.add(l); }
    bg.add(g);
  });
  // fej
  const head = new T.Group(); head.position.set(-33, 31, 16); bg.add(head);
  const hm = new T.Mesh(ctHeadGeo(), M.fur); hm.castShadow = true; hm.receiveShadow = true; head.add(P(hm, 'head'));
  const ears = [-1, 1].map(sg => {
    const g = new T.Group(); g.position.set(sg * 15.5, 14, -1);
    const o = new T.Mesh(new T.ConeGeometry(10.5, 22, 3), M.furP); o.position.y = 10; o.scale.z = 0.5; o.rotation.y = Math.PI / 2; o.castShadow = true; g.add(P(o, 'head'));
    const i2 = new T.Mesh(new T.ConeGeometry(6.4, 15, 3), M.pink); i2.position.set(0, 8.4, 2.4); i2.scale.z = 0.35; i2.rotation.y = Math.PI / 2; g.add(i2);
    g.rotation.z = -sg * 0.42; g.userData.rz = -sg * 0.42; head.add(g); return g;
  });
  const lids = [], irises = [], arcs = [];
  [-1, 1].forEach(sg => {
    const ex = sg * 9;
    const ig = new T.Group(); ig.position.set(ex, 2, 18.6); const im = new T.Mesh(new T.SphereGeometry(1, 16, 12), M.iris); im.scale.set(5.4, 5.9, 2.4); ig.add(im);
    const pu = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.pupil); pu.scale.set(1.7, 4.7, 0.8); pu.position.z = 2.0; ig.add(pu);
    const gl = new T.Mesh(new T.SphereGeometry(0.95, 8, 6), M.glint); gl.position.set(1.5, 2.3, 2.9); pu.userData.gl = gl; ig.add(gl);
    head.add(ig); irises.push({ g: ig, pu: pu, gl: gl });
    const arc = new T.Mesh(new T.TorusGeometry(5.4, 0.85, 6, 14, Math.PI), M.line); arc.rotation.z = Math.PI; arc.position.set(ex, 4.6, 19.8); arc.scale.y = 0.5; head.add(arc); arcs.push(arc);
    const br = new T.Mesh(new T.BoxGeometry(13, 1.9, 1.2), M.line); br.position.set(sg * 9.5, 8.2, 19.8); br.rotation.z = -sg * 0.4; br.visible = false; head.add(br); lids.push(br);
  });
  const nose = new T.Mesh(new T.ConeGeometry(2.9, 3.2, 3), M.nose); nose.rotation.set(0.1, 0, Math.PI); nose.scale.z = 0.7; nose.position.set(0, -5.8, 20.6); head.add(nose);
  [-1, 1].forEach(sg => { const s = new T.Mesh(new T.TorusGeometry(3.1, 0.5, 5, 10, Math.PI * 0.85), M.line); s.rotation.z = Math.PI + sg * 0.2; s.position.set(sg * 3.1, -8.4, 20.2); s.scale.y = 0.85; head.add(s); });
  const mouth = new T.Group(); mouth.position.set(0, -10, 19.6); const mm = new T.Mesh(new T.SphereGeometry(1, 14, 10), M.mouth); mm.scale.set(5.6, 6, 2.4); mm.position.y = -3; mouth.add(mm);
  const tn = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.tongue); tn.scale.set(3.4, 2.4, 1.4); tn.position.set(0, -6, 1.2); mouth.add(tn); mouth.visible = false; head.add(mouth);
  const wp = []; [-1, 1].forEach(sg => { [[-6, 0, 28, 4], [-9, -2.5, 29, -7], [-12, 1, 27, 9]].forEach(w => { wp.push(sg * 11, -7 + 0, 18.5, sg * 30, -7 + w[3] * 0.5, 22 + w[1]); }); });
  const wl = []; for (let i = 0; i < wp.length; i += 6) wl.push([wp[i], wp[i + 1], wp[i + 2]], [wp[i + 3], wp[i + 4], wp[i + 5]]);
  kLines(wl, 0xffffff, head, 0.8);
  // Zs és szívek
  const S = kState({ open: 0, yawn: 0, brow: 0, hx: 0, hy: 0, hz: 0, ear: 0, earFl: 0, earTw: 0, breath: 0, tail: 0, vib: 0, lx: 0, ly: 0, lift: 0 }, S => {
    head.rotation.set(S.hx - S.yawn * 0.34, S.hy + S.lx * 0.18 * S.open, S.hz); head.position.y = 31 + S.lift * 3; head.position.x = -33 + S.vib * 0.3;
    bg.scale.set(1 + S.breath * 0.01, 1 + S.breath * 0.018, 1 + S.breath * 0.01); bg.position.x = S.vib * 0.4;
    const o = Math.max(0.001, S.open); irises.forEach((e, i) => { e.g.visible = S.open > 0.12; e.g.scale.set(1, o * (1 - S.yawn * 0.55), 1); e.pu.position.x = S.lx * 1.7; e.pu.position.y = -S.ly * 0.9; e.gl.position.x = 1.5 + S.lx * 1.7; e.gl.position.y = 2.3 - S.ly * 0.9; });
    arcs.forEach(a => { a.visible = S.open <= 0.12; });
    lids.forEach(b => { b.visible = S.brow > 0.4; });
    mouth.visible = S.yawn > 0.04; mouth.scale.set(1, Math.max(0.05, S.yawn), 1);
    ears.forEach((e, i) => { e.rotation.set(-S.ear * 0.75, 0, e.userData.rz + (i ? 1 : -1) * S.ear * 0.55 + (i ? S.earTw : 0) * 0.5); e.position.y = 14 - S.ear * 1.5; });
    tailG.rotation.y = S.tail; tailG.rotation.z = S.tail * 0.06;
  });
  S.__apply();
  const zOnce = () => {
    if (!ctl.snoring || !L3.on) return;
    const sp = l3Sprite(kZTex(), 0xffffff, 8, 0); sp.position.set(-12, 56, 22); root.add(sp);
    l3Anim(2.0, u => { sp.position.set(-12 + u * 18 + Math.sin(u * 6) * 2.5, 56 + u * 34, 22); sp.material.opacity = Math.sin(u * Math.PI) * 0.95; const s = 7 + u * 9; sp.scale.set(s, s, 1); }, () => { root.remove(sp); sp.material.dispose(); });
  };
  const hearts = (n) => { for (let i = 0; i < n; i++) setTimeout(() => { if (!L3.on) return; drParticle(root, 'heart', new T.Vector3(-30 + (Math.random() - 0.5) * 30, 56, 24 + Math.random() * 6), { vx: (Math.random() - 0.5) * 8, vy: 14 + Math.random() * 6, life: 1.7, big: 0.9 }); }, i * 220); };
  const ctl = {
    S: S, root: root, awake: false, snoring: false,
    look(p) { if (!ctl.awake) return; const v = kLookVec(head, p, 180); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.06) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv('v'); } },
    wake() {
      crStop(ctl); ctl.awake = true; ctl.snoring = false;
      ctl.seq = l3Seq().to(S, { open: 1, lift: 1, hx: -0.06, ear: -0.35 }, 0.35, 'out')
        .to(S, { yawn: 1, hx: -0.1, open: 0.55 }, 0.5, 'io').wait(0.6).to(S, { yawn: 0, open: 1, ear: 0 }, 0.35, 'io')
        .to(S, { hy: -0.18 }, 0.4, 'io').wait(0.5).to(S, { hy: 0.18 }, 0.6, 'io').wait(0.4).to(S, { hy: 0 }, 0.35, 'io').wait(0.3)
        .call(() => { ctl.awake = false; }).to(S, { lx: 0, ly: 0 }, 0.2, 'io').to(S, { open: 0, lift: 0, hx: 0.1, ear: 0 }, 0.6, 'io').play();
    },
    purr() {
      crStop(ctl); ctl.awake = false; ctl.snoring = false;
      ctl.seq = l3Seq().to(S, { open: 0, lift: 0.5, hz: 0.1, hx: 0.04, ear: -0.15 }, 0.3, 'out').call(() => hearts(7)).play();
      l3Anim(2.8, u => { S.vib = Math.sin(u * 2.8 * 38) * Math.min(1, u * 8, (1 - u) * 6); S.breath = Math.sin(u * 2.8 * 7) * 0.9; S.__apply(); }, () => { S.vib = 0; S.breath = 0; l3Seq().to(S, { hz: 0, lift: 0, hx: 0.1, ear: 0 }, 0.4, 'io').play(); });
    },
    grump() {
      crStop(ctl); ctl.awake = false; ctl.snoring = false;
      ctl.seq = l3Seq().to(S, { open: 0.75, brow: 1, ear: 1, lift: 1, hx: -0.04 }, 0.2, 'out').play();
      l3Anim(2.6, u => { S.tail = Math.sin(u * 2.6 * 11) * 0.28 * Math.min(1, u * 8, (1 - u) * 5); S.__apply(); }, () => { S.tail = 0; l3Seq().to(S, { open: 0, brow: 0, ear: 0, lift: 0, hx: 0.1 }, 0.45, 'io').play(); });
    },
    snore() {
      if (ctl.awake || ctl.snoring) return; ctl.snoring = true; [0.2, 1.3, 2.4].forEach(t => setTimeout(zOnce, t * 1000));
      l3Anim(3.4, u => { S.breath = Math.sin(u * 3.4 * 2.6); S.__apply(); }, () => { S.breath = 0; ctl.snoring = false; S.__apply(); });
    },
    twitch() { if (ctl.awake) return; l3Anim(1.0, u => { S.earTw = Math.sin(u * 22) * 0.35 * (1 - u) ; S.__apply(); }, () => { S.earTw = 0; S.__apply(); }); },
    idle() { if (ctl.awake || ctl.snoring) return; if (Math.random() < 0.5) ctl.snore(); else ctl.twitch(); }
  };
  S.hx = 0.1; S.__apply();
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 40, ctl: ctl };
}
registerDecor3({
  id: 'macska', build: ctBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n === 1) c.wake(); else if (st.n === 2) c.purr(); else { c.grump(); st.n = 0; }
  }
});

/* ---------- bagoly ---------- */
const owCol = {};
function owColInit() { if (!owCol.t) Object.assign(owCol, { t: lc('#a47a4c'), m: lc('#82583a'), b: lc('#5a3a22') }); }
function owBodyGeo() {
  owColInit();
  return drGeoOnce('owBody', () => sdfGeo((x, y, z) => smax(sdEll(x, y - 42, z, 33, 38, 29), 3 - y, 5), [-38, 1, -34], [38, 84, 34], 1.8, (x, y, z) => {
    const c = p2Mix(owCol.b, owCol.t, p2Sm(0, 80, y)), sp = Math.sin(x * 0.55 + y * 0.12) * Math.sin(y * 0.7 - x * 0.2);
    return [c[0] * (1 + sp * 0.12), c[1] * (1 + sp * 0.12), c[2] * (1 + sp * 0.12)];
  }));
}
function owHeadGeo() {
  owColInit();
  return drGeoOnce('owHead', () => sdfGeo((x, y, z) => smax(sdEll(x, y, z, 35, 29, 27), y - 24, 6), [-40, -33, -31], [40, 31, 31], 1.7, (x, y, z) => {
    const c = p2Mix(owCol.m, owCol.t, p2Sm(-20, 24, y));
    const v = Math.max(1 - p2Sm(0.6, 1.6, Math.abs(Math.abs(x) * 0.9 - (24 - y) * 0.25 - 1)), 0) * p2Sm(8, 12, y) * (z > 0 ? 1 : 0);
    return p2Mix(c, lc('#e6c98f'), v * 0.35);
  }));
}
function owBellyTex() {
  return kTex(256, 256, (g, W) => {
    const gr = g.createLinearGradient(0, 0, 0, W); gr.addColorStop(0, '#fbeed0'); gr.addColorStop(1, '#e8cf9c'); g.fillStyle = gr; g.fillRect(0, 0, W, W);
    g.strokeStyle = '#a87a45'; g.lineWidth = 4.2; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let r = 0; r < 7; r++) for (let c = 0; c < 6 - (r % 2); c++) { const x = 30 + c * 38 + (r % 2) * 19, y = 36 + r * 32; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x, y + 14); g.lineTo(x + 14, y); g.stroke(); }
  }, 'owBelly');
}
function owFeatherGeo() { return drGeoOnce('owFeather', () => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(5, 3, 5, 9, 0, 14); s.bezierCurveTo(-5, 9, -5, 3, 0, 0); return new THREE.ShapeGeometry(s); }); }
function owBuild(it) {
  owColInit(); const T = THREE, K = kRoot(it, 130), root = K.r, parts = [];
  const M = {
    fur: l3Skin({ color: '#ffffff', kind: 'scale', vcol: true, cell: 7, amt: 0.5, rough: 0.8, env: 0.45 }),
    wing: l3Skin({ color: '#6a4528', kind: 'scale', cell: 6, amt: 0.7, rough: 0.78, env: 0.45 }),
    belly: new T.MeshStandardMaterial({ map: owBellyTex(), roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    disc: new T.MeshStandardMaterial({ color: l3Col('#f6e6c0'), roughness: 0.85 }),
    discR: new T.MeshStandardMaterial({ color: l3Col('#b48a55'), roughness: 0.85 }),
    eye: new T.MeshStandardMaterial({ color: l3Col('#ffc83a'), roughness: 0.25, emissive: l3Col('#ffb21e'), emissiveIntensity: 0.3 }),
    lid: new T.MeshStandardMaterial({ color: l3Col('#d9c08c'), roughness: 0.85 }),
    beak: kVinyl('#f2a63c', { roughness: 0.4 }), beak2: kVinyl('#d98a24', { roughness: 0.45 }),
    brow: new T.MeshStandardMaterial({ color: l3Col('#5a3a1e'), roughness: 0.9 }),
    horn: kVinyl('#7a5230', { roughness: 0.75, clearcoat: 0 }),
    foot: kVinyl('#f0a23a', { roughness: 0.5 }),
    feather: new T.MeshStandardMaterial({ color: l3Col('#b58a58'), roughness: 0.85, side: T.DoubleSide }),
    ring: new T.SpriteMaterial({ map: p2Ring(), color: 0xfff0c8, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 })
  };
  const P = (m, part) => { m.userData.part = part || 'body'; parts.push(m); return m; };
  const bg = new T.Group(); root.add(bg);
  const body = new T.Mesh(owBodyGeo(), M.fur); body.castShadow = true; body.receiveShadow = true; bg.add(P(body, 'body'));
  const bel = new T.Mesh(new T.SphereGeometry(1, 28, 20, Math.PI / 2 - 0.95, 1.9, 0.35, 2.4), M.belly); bel.scale.set(24.5, 27.5, 8); bel.position.set(0, 36, 22.6); bel.userData.part = 'body'; bg.add(bel); parts.push(bel);
  // lábak
  [-1, 1].forEach(sg => { for (let k = -1; k <= 1; k++) { const t = new T.Mesh(new T.SphereGeometry(1, 10, 8), M.foot); t.scale.set(2, 1.9, 6.4); t.rotation.set(0, k * 0.38, 0); t.position.set(sg * 13 + k * 3.8, 2.2, 25 - Math.abs(k) * 0.3); t.castShadow = true; bg.add(t); } });
  // szárnyak
  const wings = [-1, 1].map(sg => {
    const g = new T.Group(); g.position.set(sg * 31, 69, -1); g.userData.sg = sg;
    const m = new T.Mesh(new T.SphereGeometry(1, 20, 16), M.wing); m.scale.set(8.2, 28, 14); m.position.set(sg * 2.2, -24, -2); m.rotation.z = sg * 0.1; m.castShadow = true; g.add(P(m, 'wing'));
    for (let k = 0; k < 3; k++) { const l = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 15 - k * 2, 5), new T.MeshBasicMaterial({ color: 0xffe0aa, transparent: true, opacity: 0.28 })); l.position.set(sg * (5.4 - k * 0.2), -22 - k * 3, 11 - k * 1.2); l.rotation.z = sg * 0.1; g.add(l); M['wl' + sg + k] = l.material; }
    bg.add(g); return g;
  });
  // fej
  const head = new T.Group(); head.position.set(0, 88, 0); bg.add(head);
  const hm = new T.Mesh(owHeadGeo(), M.fur); hm.castShadow = true; hm.receiveShadow = true; head.add(P(hm, 'head'));
  [-1, 1].forEach(sg => { const h = new T.Mesh(new T.ConeGeometry(7, 22, 4), M.horn); h.position.set(sg * 23, 26, -2); h.rotation.set(-0.1, 0.7, -sg * 0.55); h.scale.z = 0.7; h.castShadow = true; head.add(P(h, 'head')); });
  const eyes = [], lidG = [];
  [-1, 1].forEach(sg => {
    const ex = sg * 14.5;
    const dr = new T.Mesh(new T.SphereGeometry(1, 24, 16), M.discR); dr.scale.set(17.4, 17.4, 4.6); dr.position.set(ex, -1.5, 20.8); head.add(dr);
    const d = new T.Mesh(new T.SphereGeometry(1, 24, 16), M.disc); d.scale.set(16, 16, 5); d.position.set(ex, -1.5, 21.2); head.add(P(d, 'head'));
    const eg = new T.Group(); eg.position.set(ex, -1, 26.2); head.add(eg);
    const ball = new T.Mesh(new T.SphereGeometry(1, 20, 16), M.eye); ball.scale.set(9.9, 9.9, 5.2); eg.add(ball);
    const pg = new T.Group(); pg.position.z = 4.4; eg.add(pg); const pup = kBead(pg, 0, 0, 0, 5.2, 0.5); eyes.push({ g: eg, pg: pg, pup: pup });
    const lg = new T.Group(); lg.position.set(ex, 9.0, 27.6); head.add(lg); const lm = new T.Mesh(new T.SphereGeometry(1, 20, 14), M.lid); lm.scale.set(10.6, 10.6, 6.3); lm.position.y = -9.6; lg.add(lm); lg.scale.y = 0.001; lidG.push(lg);
    const br = new T.Mesh(new T.TorusGeometry(8.5, 1.35, 6, 12, Math.PI * 0.62), M.brow); br.rotation.z = Math.PI / 2 - Math.PI * 0.31 + sg * 0.0; br.position.set(ex, 9.5, 22.8); br.scale.y = 0.5; br.rotation.y = 0; head.add(br); eyes[eyes.length - 1].brow = br;
  });
  const beak = new T.Group(); beak.position.set(0, -7.5, 23.5); head.add(beak);
  const bu = new T.Mesh(new T.ConeGeometry(5.2, 11.5, 4), M.beak); bu.rotation.x = 2.2; bu.position.set(0, -3.4, 4.2); bu.scale.set(1.2, 1.15, 1); bu.castShadow = true; beak.add(P(bu, 'beak'));
  const bl = new T.Mesh(new T.ConeGeometry(3.3, 7, 4), M.beak2); bl.rotation.x = 2.2; bl.position.set(0, -6.4, 3.4); beak.add(bl);
  // hangkarikák
  const rings = []; [-1, 1].forEach(sg => { for (let k = 0; k < 2; k++) { const s = new T.Sprite(M.ring.clone()); s.scale.set(16, 16, 1); s.center.set(0.5, 0.5); s.position.set(sg * 36, 82, 8); s.material.rotation = sg < 0 ? Math.PI : 0; root.add(s); rings.push({ s: s, sg: sg, k: k }); } });
  const S = kState({ blink: 0, hy: 0, hx: 0, hz: 0, puff: 0, beak: 0, wing: 0, hop: 0, pupil: 1, eyeW: 1, lx: 0, ly: 0, shake: 0, brow: 0 }, S => {
    head.rotation.set(S.hx, S.hy + S.lx * 0.1, S.hz); head.position.y = 88 + S.puff * 1.2;
    bg.position.set(S.shake, S.hop * 14, 0); bg.scale.set(1 + S.puff * 0.07, 1 + S.puff * 0.02 - S.hop * 0.03, 1 + S.puff * 0.07);
    wings.forEach(w => { w.rotation.z = w.userData.sg * S.wing * 1.15; w.rotation.x = -S.wing * 0.25; });
    eyes.forEach((e, i) => { e.g.scale.setScalar(S.eyeW); e.pg.position.x = S.lx * 2.3; e.pg.position.y = -S.ly * 1.6; e.pup.scale.setScalar(S.pupil); e.brow.position.y = 9.5 + (S.eyeW - 1) * 12 + S.brow; });
    lidG.forEach(l => { l.scale.y = Math.max(0.001, S.blink); });
    bl.rotation.x = 2.2 + S.beak * 0.55; bl.position.y = -6.4 - S.beak * 1.5; bl.position.z = 3.4 - S.beak * 0.4;
  });
  S.__apply();
  const hootOnce = () => rings.forEach(r => { const d = r.k * 0.22; l3Anim(1.1 + d, u => { const v = Math.max(0, u - d / (1.1 + d)) / (1 - d / (1.1 + d)); r.s.material.opacity = v <= 0 ? 0 : Math.sin(Math.min(1, v) * Math.PI) * 0.9; const sc = 16 + v * 30; r.s.scale.set(sc, sc, 1); r.s.position.x = r.sg * (36 + v * 16); }, () => { r.s.material.opacity = 0; }); });
  const featherFall = () => {
    for (let i = 0; i < 6; i++) setTimeout(() => {
      if (!L3.on) return; const f = new T.Mesh(owFeatherGeo(), M.feather); f.scale.setScalar(0.8 + Math.random() * 0.5); const x0 = (Math.random() - 0.5) * 70, z0 = 10 + Math.random() * 20, y0 = 50 + Math.random() * 40, ph = Math.random() * 6; f.position.set(x0, y0, z0); root.add(f);
      l3Anim(1.6, u => { f.position.set(x0 + Math.sin(u * 7 + ph) * 8, y0 - u * (y0 - 4), z0); f.rotation.set(u * 5 + ph, u * 3, Math.sin(u * 6 + ph) * 1.2); }, () => { root.remove(f); f.geometry = null; });
    }, i * 140);
  };
  const ctl = {
    S: S, root: root,
    look(p) { if (ctl.busy) return; const v = kLookVec(head, p, 180); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.06) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv('v'); } },
    blink() { l3Seq().to(S, { blink: 1 }, 0.07, 'out').to(S, { blink: 0 }, 0.12, 'io').play(); },
    lookAround() {
      crStop(ctl); ctl.busy = true; S.lx = 0; S.ly = 0;
      ctl.seq = l3Seq().to(S, { hy: -1.05, lx: -1 }, 0.5, 'io').wait(0.45).to(S, { hy: 1.05, lx: 1 }, 0.8, 'io').wait(0.4).to(S, { hy: 0, lx: 0 }, 0.5, 'io').call(() => { ctl.busy = false; }).play();
    },
    hoot() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { puff: 1, beak: 1, hx: -0.12, eyeW: 1.08 }, 0.3, 'out').call(hootOnce).wait(0.45).to(S, { puff: 0.2, beak: 0.2 }, 0.2, 'io').to(S, { puff: 1, beak: 1 }, 0.2, 'out').call(hootOnce).wait(0.45).to(S, { puff: 0, beak: 0, hx: 0, eyeW: 1 }, 0.4, 'io').call(() => { ctl.busy = false; }).play();
    },
    fright() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { hop: 1, wing: 1, eyeW: 1.2, pupil: 0.55, puff: 0.6, brow: 1.5 }, 0.16, 'out').call(featherFall).to(S, { shake: 1.2 }, 0.05).to(S, { shake: -1.2 }, 0.06).to(S, { shake: 1 }, 0.06).to(S, { shake: -0.8 }, 0.06).to(S, { shake: 0 }, 0.06)
        .wait(0.5).to(S, { hop: 0 }, 0.3, 'bounce').wait(0.55).to(S, { wing: 0, eyeW: 1, pupil: 1, puff: 0, brow: 0 }, 0.6, 'io').call(() => { ctl.busy = false; }).play();
    },
    tilt() { crStop(ctl); ctl.seq = l3Seq().to(S, { hz: 0.32 }, 0.35, 'io').wait(0.9).to(S, { hz: 0 }, 0.4, 'io').play(); },
    idle() { if (ctl.busy) return; if (Math.random() < 0.55) ctl.blink(); else ctl.tilt(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 40, ctl: ctl };
}
registerDecor3({
  id: 'bagoly', build: owBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n === 1) c.lookAround(); else if (st.n === 2) c.hoot(); else { c.fright(); st.n = 0; }
  }
});

/* ---------- cserepes pozsgás ---------- */
function plPotTex() {
  return kTex(512, 128, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#74403a'); gr.addColorStop(1, '#42221c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const rng = dcRng(4); for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(' + (rng() < 0.5 ? '255,220,190' : '90,40,20') + ',' + (0.03 + rng() * 0.06).toFixed(3) + ')'; g.fillRect(rng() * W, rng() * H, 1 + rng() * 3, 1 + rng() * 3); }
    const y0 = H * 0.3, y1 = H * 0.54; g.fillStyle = '#cdb98f'; g.fillRect(0, y0, W, y1 - y0);
    g.strokeStyle = 'rgba(110,50,20,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y0); g.lineTo(W, y0); g.moveTo(0, y1); g.lineTo(W, y1); g.stroke();
    g.strokeStyle = '#6a2a24'; g.lineWidth = 3.4; g.lineJoin = 'round'; g.beginPath(); const n = 24, s = W / n, ym = (y0 + y1) / 2; for (let i = 0; i <= n; i++) { const x = i * s, y = ym + (i % 2 ? -1 : 1) * (y1 - y0) * 0.27; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }, 'plPot');
}
function plLeafGeo() {
  return drGeoOnce('plLeaf', () => {
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(Math.max(0.001, Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.85) * 1), t)); }
    return new THREE.LatheGeometry(pts, 14);
  });
}
function plPetalGeo() { return drGeoOnce('plPetal', () => { const g = new THREE.SphereGeometry(1, 14, 10); g.translate(0, 1, 0); return g; }); }
function plBuild(it) {
  const T = THREE, K = kRoot(it, 110), root = K.r, parts = [];
  const shade = ['#4cb572', '#5cc47f', '#69cf8b', '#7bd99a', '#8fe3a9'];
  const M = {
    pot: new T.MeshStandardMaterial({ map: plPotTex(), roughness: 0.8, metalness: 0 }),
    rim: kVinyl('#7e463a', { roughness: 0.7, clearcoat: 0.05 }),
    soil: new T.MeshStandardMaterial({ color: l3Col('#4a2f20'), roughness: 1 }),
    stone: kVinyl('#9a8f86', { roughness: 0.8, clearcoat: 0 }),
    stem: kVinyl('#2f8a4e', { roughness: 0.6 }),
    petal: l3Phys({ color: l3Col('#a3223f'), roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4, emissive: l3Col('#7a1428'), emissiveIntensity: 0.1 }),
    center: kVinyl('#ffd34a', { roughness: 0.4 }), glint: new T.MeshBasicMaterial({ color: 0xfff6c8 }),
    bug: kVinyl('#e8322b', { roughness: 0.25, clearcoat: 0.9 }), bugD: new T.MeshStandardMaterial({ color: 0x2a1010, roughness: 0.5 }),
    spark: new T.SpriteMaterial({ map: p2Star(), color: 0xfff4b0, transparent: true, depthWrite: false, opacity: 0, blending: T.AdditiveBlending, toneMapped: false })
  };
  shade.forEach((c, i) => { M['l' + i] = l3Phys({ color: l3Col(c), roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5, emissive: l3Col(c), emissiveIntensity: 0.1, envMapIntensity: 0.7 }); });
  const P = (m, part) => { m.userData.part = part || 'pot'; parts.push(m); return m; };
  // cserép
  const pot = new T.Mesh(new T.CylinderGeometry(26, 19.5, 34, 40, 1, true), M.pot); pot.position.y = 17.5; pot.castShadow = true; pot.receiveShadow = true; root.add(P(pot, 'pot'));
  const base = new T.Mesh(new T.CircleGeometry(19.5, 28), M.pot); base.rotation.x = Math.PI / 2; base.position.y = 0.5; root.add(base);
  const rim = kLathe([[27, 33], [30.6, 33.8], [31.6, 36], [31.6, 40.5], [30.6, 42.4], [27, 43]], 44, M.rim, root, 'pot'); parts.push(rim);
  const soil = new T.Mesh(new T.CircleGeometry(28.2, 36), M.soil); soil.rotation.x = -Math.PI / 2; soil.position.y = 41.6; soil.receiveShadow = true; root.add(soil);
  for (let i = 0; i < 7; i++) { const a = i * 2.4 + 0.4, r = 11 + (i % 3) * 5; const st = new T.Mesh(new T.SphereGeometry(1.6 + (i % 2) * 0.7, 8, 6), M.stone); st.scale.y = 0.6; st.position.set(Math.cos(a) * r, 41.8, Math.sin(a) * r); root.add(st); }
  // növény
  const plant = new T.Group(); plant.position.y = 41.5; root.add(plant);
  const leaves = [], rings = [[7, 1.25, 26, 7, 0.2, 0], [6, 0.82, 33, 8, 0.55, 1], [5, 0.42, 36, 8, 0.95, 2], [4, 0.16, 29, 6.4, 0.3, 3]];
  rings.forEach(r => { for (let i = 0; i < r[0]; i++) {
    const g = new T.Group(); g.rotation.y = i * Math.PI * 2 / r[0] + r[4]; const h = new T.Group(); h.rotation.x = r[1]; g.add(h);
    const m = new T.Mesh(plLeafGeo(), M['l' + (i % 2 + r[5] % 3)]); m.scale.set(r[3], r[2], r[3] * 0.5); m.castShadow = true; m.receiveShadow = true; h.add(P(m, 'leaf'));
    plant.add(g); leaves.push({ h: h, a: r[1], ph: i * 1.7 + r[5], amp: 1 });
  } });
  // száv + virág
  const sc = l3CatmullPts([[0, 0, 0], [-1.2, 12, 1], [1.4, 26, 2], [0, 40, 3.5]]), sg = l3TubeGeo(14, 8); l3TubeSet(sg, sc, t => 2.0 - 0.5 * t, null, [0, 0, 1]);
  const stem = new T.Mesh(sg, M.stem); stem.castShadow = true; plant.add(P(stem, 'flower'));
  const fl = new T.Group(); fl.position.set(0, 41, 4); fl.rotation.x = 0.5; plant.add(fl);
  const petals = []; for (let i = 0; i < 6; i++) { const g = new T.Group(); g.rotation.z = i * Math.PI / 3; const h = new T.Group(); g.add(h); const m = new T.Mesh(plPetalGeo(), M.petal); m.scale.set(7.2, 11.4, 2.3); m.castShadow = true; h.add(P(m, 'flower')); fl.add(g); petals.push(h); }
  const cn = new T.Mesh(new T.SphereGeometry(4.6, 16, 12), M.center); cn.scale.z = 0.85; cn.position.z = 1.6; fl.add(P(cn, 'flower'));
  const gl = new T.Mesh(new T.SphereGeometry(1.2, 8, 6), M.glint); gl.position.set(-1.6, 1.8, 5.2); fl.add(gl);
  // szikrák
  const sparks = [[-26, 70, 14], [24, 62, 12], [14, 94, 8], [-18, 88, 10]].map(p => { const s = new T.Sprite(M.spark.clone()); s.position.set(p[0], p[1], p[2]); s.scale.set(5, 5, 1); root.add(s); return s; });
  // katicabogár
  const bug = new T.Group(); bug.visible = false; bug.scale.setScalar(1.7); root.add(bug);
  const bb = new T.Mesh(new T.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.bug); bb.scale.set(4.6, 3.8, 4.2); bb.castShadow = true; bug.add(P(bb, 'bug'));
  const bl = new T.Mesh(new T.BoxGeometry(0.4, 0.2, 7.6), M.bugD); bl.position.set(0, 3.76, 0); bug.add(bl);
  const bh = new T.Mesh(new T.SphereGeometry(2, 8, 6), M.bugD); bh.position.set(0, 1.2, 4.6); bug.add(bh);
  [[-1.9, 2.6, 1.4], [1.9, 2.6, 1.4], [-1.5, 2.6, -1.6], [1.5, 2.6, -1.6]].forEach(p => { const d = new T.Mesh(new T.SphereGeometry(0.75, 6, 5), M.bugD); d.position.set(p[0], p[1], p[2]); bug.add(d); });
  const S = kState({ sway: 0, jig: 0, t: 0, bloom: 0, bug: 0, bx: -34, by: 0, bz: 30, br: 0, hop: 0, spark: 0, breeze: 0 }, S => {
    plant.rotation.z = S.sway * 0.05 + S.breeze * 0.03; plant.rotation.x = S.sway * 0.02;
    leaves.forEach(l => { l.h.rotation.x = l.a + S.jig * Math.sin(S.t * 13 + l.ph) * 0.09 + S.breeze * Math.sin(S.t * 3 + l.ph) * 0.03; });
    petals.forEach((h, i) => { const o = S.bloom, p = 1.35 - o * 1.1 + Math.sin(S.t * 5 + i) * S.jig * 0.03; h.rotation.x = p; h.position.set(0, 0, 0); h.scale.set(1 - (1 - o) * 0.45, 1, 1); });
    fl.scale.setScalar(1.05 + S.bloom * 0.3); fl.rotation.x = 0.5 - S.bloom * 0.12;
    sparks.forEach((s, i) => { const v = Math.max(0, Math.sin((S.spark * 1.0 - i * 0.12) * Math.PI)); s.material.opacity = v * 0.95; const k = 3 + v * 5; s.scale.set(k, k, 1); });
    bug.visible = S.bug > 0; bug.position.set(S.bx, 44.4 + S.by + S.hop * 10, S.bz); bug.rotation.y = S.br;
  });
  S.__apply();
  const ctl = {
    S: S, root: root, busy: false,
    sway() { crStop(ctl); l3Anim(1.9, u => { const d = Math.exp(-u * 2.6); S.t = u * 1.9; S.sway = Math.sin(u * 1.9 * 9) * d; S.jig = d; S.__apply(); }, () => { S.sway = 0; S.jig = 0; S.__apply(); }); },
    bloom() {
      crStop(ctl);
      ctl.seq = l3Seq().to(S, { bloom: 1, jig: 0.7 }, 1.1, 'back').to(S, { jig: 0 }, 0.3, 'io').play();
      l3Anim(3.4, u => { S.t = u * 3.4; S.spark = Math.min(1.3, Math.max(0, u * 3.4 - 0.3) * 0.5); S.__apply(); }, () => { S.spark = 0; S.__apply(); });
      setTimeout(() => { if (L3.on) l3Seq().to(S, { bloom: 0 }, 1.0, 'io').play(); }, 2400);
    },
    bugRun() {
      crStop(ctl); S.bug = 1; S.bx = -36; S.bz = 24; S.br = Math.PI / 2 + 0.3; S.hop = 0; S.__apply();
      ctl.seq = l3Seq().to(S, { bx: -4, bz: 29.5, br: Math.PI / 2 }, 1.3, 'io').wait(0.4).to(S, { br: Math.PI / 2 - 0.9 }, 0.2, 'io').to(S, { br: Math.PI / 2 + 0.7 }, 0.3, 'io').to(S, { bx: 30, bz: 24, br: Math.PI / 2 - 0.3 }, 1.2, 'io')
        .to(S, { hop: 1, bx: 52, by: 6 }, 0.35, 'out').call(() => { S.bug = 0; S.hop = 0; S.by = 0; S.__apply(); }).play();
    },
    breeze() { l3Anim(2.2, u => { S.t = u * 2.2; S.breeze = Math.sin(u * Math.PI) * Math.sin(u * 14); S.__apply(); }, () => { S.breeze = 0; S.__apply(); }); },
    idle() { ctl.breeze(); }
  };
  return { grp: K.g, parts: parts, mats: kMatsAll(M), d: 36, ctl: ctl };
}
registerDecor3({
  id: 'noveny', build: plBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (part === 'flower') { c.bloom(); st.n = 2; st.last = now; return; }
    if (part === 'bug') { return; }
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n === 1) c.sway(); else if (st.n === 2) c.bloom(); else { c.bugRun(); st.n = 0; }
  }
});
