/* ===== 3D polc: a repülő sárkány (kis-sarkany) 2D KÉPKÉNT – a rajz (decor-baby.js: flyDefs/FLY_LAYERS) rétegenként textúra-síkokra kerül,
   így a sárkány, a szárnyak, a füstszalag, az oszlop és a könyvek külön tudnak mozogni. Nincs világítás-számítás: a kép olyan, amilyennek rajzoltuk.
   Egységek: modell-x = svg-x − 120, modell-y = 200 − svg-y; kRoot(it, 200) a dísz magasságára skáláz (240×200 → ar 1.2). ===== */
'use strict';

const FI = { px: 0.5, mouth: [92, 182], top: [102, 97], pivB: [230, 188], pivC: [118, 188], pivD: [50, 188], sh: [62, 171], shB: [64, 169], eye: [85, 173.6] };
const fiM = (sx, sy) => [sx - 120, 200 - sy];     // svg → modell

function fiBuild(it) {
  const T = THREE, K = kRoot(it, 200), root = K.r, parts = [], mats = [];
  const layer = (name, piv, z, parent) => {
    const P = piv || [120, 100];
    const g = new T.Group(); const m = fiM(P[0], P[1]); g.position.set(m[0], m[1], z); (parent || root).add(g);
    const pl = kSvgPlane(flyDefs('x') + FLY_LAYERS[name]('x'), '0 0 240 200', 240, 200, 720, 600, { key: 'fly:' + name, dx: 120 - P[0], dy: P[1] - 100 });
    pl.renderOrder = 3 + z * 0.1; g.add(pl); mats.push(pl.material); return { g: g, pl: pl };
  };
  const L = {
    shadow: layer('shadow', null, 0), stream: layer('stream', FI.mouth, 1), cloud: layer('cloud', FI.pivC, 2), books: layer('books', FI.pivB, 3), wisp: layer('wisp', null, 4)
  };
  const dg = new T.Group(); const dm = fiM(FI.pivD[0], FI.pivD[1]); dg.position.set(dm[0], dm[1], 5); root.add(dg);
  // a sárkány-csoport gyerekei a saját pivotjához képest: a síkok a (pivD) körül; a szárnyak a vállukon
  const inD = (name, piv, z) => { const P = piv || FI.pivD; const g = new T.Group(); g.position.set(P[0] - FI.pivD[0], FI.pivD[1] - P[1], z); dg.add(g); const pl = kSvgPlane(flyDefs('x') + FLY_LAYERS[name]('x'), '0 0 240 200', 240, 200, 720, 600, { key: 'fly:' + name, dx: 120 - P[0], dy: P[1] - 100 }); pl.renderOrder = 3 + (5 + z) * 0.1; g.add(pl); mats.push(pl.material); return { g: g, pl: pl }; };
  const wB = inD('wingB', FI.shB, -0.5), body = inD('dragon', FI.pivD, 0), wF = inD('wingF', FI.sh, 1.5);
  // szem: borostyán írisz + pupilla-rés + fényfolt + szemhéj (a szem-üregbe, a sárkány-csoportban)
  const ex = FI.eye[0] - FI.pivD[0], ey = FI.pivD[1] - FI.eye[1];
  const eg = new T.Group(); eg.position.set(ex, ey, 0.8); dg.add(eg);
  const bm = c => new T.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true, depthWrite: false });
  const irisM = bm(0xffb02a), pupM = bm(0x0a0604), glM = bm(0xffffff), lidM = bm(0x17181d); mats.push(irisM, pupM, glM, lidM);
  const iris = new T.Mesh(new T.CircleGeometry(2.55, 16), irisM); iris.scale.set(1, 1.07, 1); iris.renderOrder = 9; eg.add(iris);
  const pg = new T.Group(); pg.position.z = 0.1; eg.add(pg);
  const pup = new T.Mesh(new T.CircleGeometry(1, 12), pupM); pup.scale.set(0.8, 2.2, 1); pup.renderOrder = 10; pg.add(pup);
  const glint = new T.Mesh(new T.CircleGeometry(0.7, 8), glM); glint.position.set(0.8, 1.0, 0.1); glint.renderOrder = 11; pg.add(glint);
  const lid = new T.Mesh(new T.CircleGeometry(2.7, 16), lidM); lid.position.set(0, 0, 0.2); lid.renderOrder = 12; eg.add(lid); lid.scale.set(1.05, 0.001, 1);
  // sugár-izzás a szájnál (additív), csak fújáskor látszik
  const mo = fiM(FI.mouth[0], FI.mouth[1]);
  const glow = kGlowSprite(0xffe2b0, 46, 0, true); glow.position.set(mo[0] + 8, mo[1] + 1, 6); root.add(glow);
  // kattintási zónák (láthatatlan síkok): sárkány · füstoszlop · könyvek
  const zone = (x0, y0, x1, y1, part, z) => { const c = fiM((x0 + x1) / 2, (y0 + y1) / 2), m = new T.Mesh(new T.PlaneGeometry(x1 - x0, y1 - y0), new T.MeshBasicMaterial({ visible: false })); m.visible = false; m.position.set(c[0], c[1], z); m.userData.part = part; root.add(m); parts.push(m); mats.push(m.material); return m; };
  zone(4, 134, 98, 190, 'body', 9); zone(86, 94, 134, 190, 'cloud', 8); zone(92, 30, 234, 190, 'books', 4);

  const S = kState({ bob: 0, recoil: 0, blast: 0, flapF: 0, flapB: 0, swell: 0, squash: 0, wob: 0, drift: 0, blink: 0, lx: 0, ly: 0 }, S => {
    dg.position.set(dm[0] - S.recoil * 2.4, dm[1] + S.bob * 3, 5); dg.rotation.z = S.recoil * 0.025 + S.bob * 0.01;
    wF.g.rotation.z = S.flapF * 0.42; wB.g.rotation.z = S.flapB * 0.36;
    L.stream.g.scale.set(1 + S.blast * 0.7, 1 + S.blast * 0.42, 1); L.stream.pl.material.opacity = 1; glow.material.opacity = Math.min(1, S.blast) * 0.85; glow.scale.set(46 + S.blast * 24, 46 + S.blast * 24, 1);
    L.cloud.g.scale.set(1 + S.swell * 0.07 + S.squash * 0.1, 1 + S.swell * 0.05 - S.squash * 0.07, 1);
    L.books.g.rotation.z = S.wob * 0.011 + S.swell * 0.004;
    L.wisp.g.position.x = fiM(120, 100)[0] + S.drift * 6; L.wisp.pl.material.opacity = 0.75 + S.blast * 0.25;
    lid.scale.y = Math.max(0.001, Math.min(1, S.blink)) * 1.05; pg.position.set(S.lx * 0.7, -S.ly * 0.5, 0.1);
  });
  S.__apply();
  const puff = (x, y, n, big, vx, vy) => {   // krémszínű füstpamacs, felfelé szálló, szétterülő
    for (let i = 0; i < n; i++) setTimeout(() => {
      if (!L3.on) return;
      const sp = l3Sprite(l3Glow(), 0xfff0d4, 8, 0); sp.renderOrder = 14; sp.position.set(x + (Math.random() - 0.5) * 9, y, 8); root.add(sp);
      const life = 1.5 + Math.random() * 0.6, ax = ((vx || 0) + (Math.random() - 0.5) * 7), ay = ((vy == null ? 11 : vy) + Math.random() * 6), x0 = sp.position.x, y0 = y;
      l3Anim(life, u => { const t = u * life; sp.position.set(x0 + ax * t, y0 + ay * t, 8); sp.material.opacity = Math.sin(Math.min(1, u * 1.1) * Math.PI) * 0.7; const k = (7 + u * 15) * (big || 1); sp.scale.set(k, k, 1); }, () => { root.remove(sp); sp.material.dispose(); });
    }, i * 140);
  };
  const top = fiM(FI.top[0], FI.top[1]);
  const ctl = {
    S: S, root: root, busy: false,
    look(p) { if (ctl.busy) return; const v = kLookVec(eg, p, 220); if (Math.abs(v.x - S.lx) + Math.abs(v.y - S.ly) > 0.02) { S.lx = v.x; S.ly = v.y; S.__apply(); l3Inv(); } },
    blast() {
      crStop(ctl); ctl.busy = true;
      ctl.seq = l3Seq().to(S, { blast: 1, recoil: 1, swell: 1 }, 0.22, 'out').call(() => { puff(top[0] + 2, top[1] + 4, 8, 1.4, -2, 13); puff(mo[0] + 16, mo[1] + 6, 4, 1.1, 5, 6); })
        .wait(0.8).to(S, { blast: 0, recoil: 0, swell: 0 }, 0.7, 'io').call(() => { ctl.busy = false; }).play();
      l3Anim(1.6, u => { S.wob = Math.sin(u * 46) * (1 - u) * 1.3; S.__apply(); }, () => { S.wob = 0; S.__apply(); });
    },
    flap() {
      crStop(ctl); ctl.busy = true;
      l3Anim(1.5, u => { const e = Math.min(1, u * 6, (1 - u) * 4), f = Math.sin(u * Math.PI * 6); S.flapF = f * e; S.flapB = Math.sin(u * Math.PI * 6 - 0.5) * e; S.bob = Math.max(0, Math.sin(u * Math.PI * 3)) * e; S.__apply(); }, () => { S.flapF = 0; S.flapB = 0; S.bob = 0; S.__apply(); ctl.busy = false; });
    },
    puff() {
      crStop(ctl);
      l3Anim(1.3, u => { S.squash = Math.sin(u * Math.PI * 8) * 0.5 * (1 - u); S.__apply(); }, () => { S.squash = 0; S.__apply(); });
      puff(top[0] + 1, top[1] + 3, 7, 1.3, -2, 12); puff(top[0] + 8, top[1] - 26, 3, 1.1, 3, 8);
    },
    books() { crStop(ctl); l3Anim(1.4, u => { S.wob = Math.sin(u * 40) * (1 - u) * 1.6; S.__apply(); }, () => { S.wob = 0; S.__apply(); }); puff(top[0] + 6, top[1] + 8, 2, 1, 2, 9); },
    blink() { l3Seq().to(S, { blink: 1 }, 0.07, 'out').to(S, { blink: 0 }, 0.13, 'io').play(); },
    idle() {
      if (ctl.busy) return; const r = Math.random();
      if (r < 0.4) ctl.blink(); else if (r < 0.7) puff(top[0], top[1] + 2, 2, 1, -1, 9); else if (r < 0.88) l3Anim(1.6, u => { S.drift = Math.sin(u * Math.PI); S.__apply(); }, () => { S.drift = 0; S.__apply(); });
      else l3Anim(1.1, u => { S.flapF = Math.sin(u * Math.PI * 2) * 0.5 * (1 - u); S.flapB = S.flapF * 0.7; S.__apply(); }, () => { S.flapF = 0; S.flapB = 0; S.__apply(); });
    }
  };
  return { grp: K.g, parts: parts, mats: mats, d: 40, ctl: ctl };
}
registerDecor3({
  id: 'kis-sarkany', build: fiBuild,
  onClick(it, A, e, part) {
    const c = it.ctl, st = A.st, now = Date.now();
    if (part === 'cloud') { c.puff(); st.n = 0; return; }
    if (part === 'books') { c.books(); st.n = 0; return; }
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    if (st.n % 2 === 1) c.blast(); else c.flap();
  }
});
