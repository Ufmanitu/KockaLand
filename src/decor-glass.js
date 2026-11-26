/* ===== Díszek: üvegablak-lámpák (2D tartalék + közös adatok) =====
   A három lámpa a valódi termékfotók mása: a nyomat a fotókból kivágott kép (GL_ART, src/glass-img.js, a tools/make-glass.py generálja),
   az ívelt panel külső kontúrja két körív, alatta a fotón látható talp (sötét fa lap / fekete lekerekített lap / füstös akril lap).
   Az alján (a talpára kattintva) fel/le kapcsolod a háttérfényt (mentődik); az üvegre kattintva egy rövid „jelenet” játszódik le:
   csillagos vár: hullócsillagok + megcsillanó csillagok · rózsák: fényfoltsáv fut végig a fényes nyomaton · lángoló kard: fellobban a láng, szikrák szállnak. */
'use strict';

/* a talpak és a fény, lámpánként (a fotó px-ében): bw/bh/bd = a talp szélessége/magassága/mélysége; sink = a panel alja ennyit süllyed a talpba;
   halo = a háttér-fény színe; fl = [u, v] a láng helye a kardos nyomaton (balról / fentről, 0..1) */
const GL_SPEC = {
  night: { bw: 460, bh: 22, bd: 105, sink: 3, glow: ['#ffb45a', '#ff7a3a'], halo: 0xffa24a, gl: 0xffb45a },
  rose: { bw: 400, bh: 30, bd: 95, sink: 2, glow: ['#ff6a5a', '#b02030'], halo: 0xff5446, gl: 0xff6a55 },
  sword: { bw: 400, bh: 46, bd: 80, sink: 3, glow: ['#ffa03a', '#e8431a'], halo: 0xff8a2a, gl: 0xff9a3a, fl: [0.465, 0.17] }
};
/* közös rajz-segédek a Book nook SVG-jéhez (decor-nook.js): pont → "x y", négyágú csillag-út */
const glPt = p => dcN(p[0]) + ' ' + dcN(p[1]);
const glStar = (cx, cy, r) => { const k = r * 0.3; return 'M' + dcN(cx) + ' ' + dcN(cy - r) + 'L' + dcN(cx + k) + ' ' + dcN(cy - k) + 'L' + dcN(cx + r) + ' ' + dcN(cy) + 'L' + dcN(cx + k) + ' ' + dcN(cy + k) + 'L' + dcN(cx) + ' ' + dcN(cy + r) + 'L' + dcN(cx - k) + ' ' + dcN(cy + k) + 'L' + dcN(cx - r) + ' ' + dcN(cy) + 'L' + dcN(cx - k) + ' ' + dcN(cy - k) + 'Z'; };
const GL_STAGE = 8;   // a 2D/3D kép alján a vetett árnyéknak hagyott sáv
function glGeom(k) {
  const A = GL_ART[k], P = GL_SPEC[k];
  return { W: A.w, H: A.h, rise: A.rise, ys: A.h - A.rise, VW: Math.max(A.w, P.bw), VH: A.h + P.bh - P.sink };
}
const glAr = k => { const g = glGeom(k); return g.VW / (g.VH + GL_STAGE); };

/* az ívelt panel kontúrja SVG-úttal: a bal/jobb oldal egyenes az ív kezdetéig (ys), onnan két körív a csúcsig */
function glArchPath(g, ox, oy) {
  const hw = g.W / 2, R = ((g.rise * g.rise + hw * hw) / (2 * hw)).toFixed(2), f = n => n.toFixed(1);
  return 'M' + f(ox) + ' ' + f(oy + g.H) + 'V' + f(oy + g.rise) + 'A' + R + ' ' + R + ' 0 0 1 ' + f(ox + hw) + ' ' + f(oy) + 'A' + R + ' ' + R + ' 0 0 1 ' + f(ox + g.W) + ' ' + f(oy + g.rise) + 'V' + f(oy + g.H) + 'Z';   // (SVG: y lefelé, a csúcs fent: az ív kezdete a csúcs alatt `rise`-nyira van)
}

/* ---------- a talpak (2D) ---------- */
function glBase2(u, k, bx, yt) {
  const P = GL_SPEC[k], bw = P.bw, bh = P.bh, x1 = bx + bw, yb = yt + bh;
  if (k === 'night') {
    return '<defs><linearGradient id="gw' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d271b"/><stop offset=".35" stop-color="#241510"/><stop offset="1" stop-color="#100906"/></linearGradient></defs>' +
      '<path d="M' + bx + ' ' + yb + 'L' + x1 + ' ' + yb + 'L' + x1 + ' ' + (yt + 6) + 'L' + (x1 - 16) + ' ' + yt + 'L' + (bx + 16) + ' ' + yt + 'L' + bx + ' ' + (yt + 6) + 'Z" fill="url(#gw' + u + ')" stroke="rgba(255,190,120,.16)" stroke-width="1"/>' +
      '<path class="d-ledge" d="M' + (bx + 22) + ' ' + (yt + 1.2) + 'H' + (x1 - 22) + '" stroke="#ffb870" stroke-width="2" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M' + (bx + 6) + ' ' + (yb - 3) + 'H' + (x1 - 6) + '" stroke="rgba(0,0,0,.45)" stroke-width="2"/>';
  }
  if (k === 'rose') {
    return '<defs><linearGradient id="gw' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a30"/><stop offset=".3" stop-color="#121216"/><stop offset="1" stop-color="#050506"/></linearGradient></defs>' +
      '<rect x="' + bx + '" y="' + yt + '" width="' + bw + '" height="' + bh + '" rx="13" fill="url(#gw' + u + ')"/>' +
      '<path d="M' + (bx + 12) + ' ' + (yt + 1.6) + 'H' + (x1 - 12) + '" stroke="rgba(255,255,255,.22)" stroke-width="1.6" stroke-linecap="round"/>';
  }
  /* sword: füstös akril lap, a panelnél keskenyebb; alul recés sáv */
  return '<defs><linearGradient id="gw' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2d33"/><stop offset=".6" stop-color="#18181c"/><stop offset="1" stop-color="#0d0d10"/></linearGradient>' +
    '<pattern id="gp' + u + '" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#2c2c30"/><rect width="2" height="5" fill="#55555b"/></pattern></defs>' +
    '<rect x="' + bx + '" y="' + yt + '" width="' + bw + '" height="' + bh + '" fill="url(#gw' + u + ')" stroke="rgba(190,190,205,.35)" stroke-width="1.2"/>' +
    '<rect x="' + (bx + 1) + '" y="' + (yb - 15) + '" width="' + (bw - 2) + '" height="14" fill="url(#gp' + u + ')"/>' +
    '<path d="M' + (bx + 4) + ' ' + (yt + 4) + 'V' + (yb - 16) + 'M' + (x1 - 4) + ' ' + (yt + 4) + 'V' + (yb - 16) + '" stroke="rgba(235,225,210,.45)" stroke-width="1.4"/>';
}

/* ---------- a lámpa jelenet-effektjei (2D) ---------- */
function glFx2(u, k, g, ox) {
  const A = GL_ART[k];
  if (k === 'night') {
    let s = '<g class="d-fx"><g class="d-stars" fill="#fff6d2">';
    (A.stars || []).forEach((p, i) => { s += '<circle class="d-twk t' + (i % 6) + '" cx="' + (ox + p[0] * g.W).toFixed(1) + '" cy="' + (p[1] * g.H).toFixed(1) + '" r="' + (3.4 + (i % 3)) + '" style="--dl:' + ((i * 0.11) % 1.1).toFixed(2) + 's"/>'; });
    s += '</g><defs><linearGradient id="gm' + u + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".25" stop-color="#ffd48a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></linearGradient></defs>';
    [[0.78, 0.04, 0], [0.58, 0.02, 1], [0.9, 0.12, 2]].forEach(m => { s += '<g transform="translate(' + (ox + m[0] * g.W).toFixed(1) + ' ' + (m[1] * g.H).toFixed(1) + ')"><g class="d-meteor m' + m[2] + '"><path d="M0 0L46 -70" stroke="url(#gm' + u + ')" stroke-width="4.2" stroke-linecap="round" fill="none"/><circle r="4" fill="#fff"/></g></g>'; });
    return s + '</g>';
  }
  if (k === 'rose') {
    return '<defs><linearGradient id="gg' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#ffe9e0" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<g clip-path="url(#gc' + u + ')"><rect class="d-glint" x="' + (ox - g.W * 0.42).toFixed(1) + '" y="-10" width="' + (g.W * 0.42).toFixed(1) + '" height="' + (g.H + 20) + '" fill="url(#gg' + u + ')" transform="skewX(-16)"/></g>';
  }
  const fx = ox + GL_SPEC.sword.fl[0] * g.W, fy = GL_SPEC.sword.fl[1] * g.H;
  let s = '<defs><radialGradient id="gf' + u + '"><stop offset="0" stop-color="#fff2b0" stop-opacity=".95"/><stop offset=".4" stop-color="#ff9a2a" stop-opacity=".55"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient></defs><g class="d-fx">';
  [[0, 0, 58, 86], [-16, 34, 40, 52], [18, 16, 36, 60]].forEach((f, i) => { s += '<ellipse class="d-flame f' + i + '" cx="' + (fx + f[0]).toFixed(1) + '" cy="' + (fy + f[1]).toFixed(1) + '" rx="' + f[2] + '" ry="' + f[3] + '" fill="url(#gf' + u + ')" style="--dl:' + (i * 0.09).toFixed(2) + 's"/>'; });
  for (let i = 0; i < 9; i++) { s += '<circle class="d-ember e' + (i % 5) + '" cx="' + (fx + (i - 4) * 9).toFixed(1) + '" cy="' + (fy + 10 + (i % 3) * 8).toFixed(1) + '" r="' + (2.4 + (i % 3) * 0.7).toFixed(1) + '" fill="#ffc15a" style="--dx:' + ((i - 4) * 7 + (i % 2 ? 10 : -6)) + 'px;--dy:' + (-70 - (i % 4) * 24) + 'px;--dl:' + (i * 0.12).toFixed(2) + 's"/>'; }
  return s + '</g>';
}

/* ---------- a lámpa (2D) ---------- */
function glSvg(u, k) {
  const A = GL_ART[k], P = GL_SPEC[k], g = glGeom(k), ox = (g.VW - g.W) / 2, bx = (g.VW - P.bw) / 2, yt = g.H - P.sink, VH = g.VH + GL_STAGE;
  const arch = glArchPath(g, ox, 0);
  return '<svg class="dc-svg gl-svg gl-' + k + '" viewBox="0 0 ' + g.VW + ' ' + VH + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
    '<clipPath id="gc' + u + '"><path d="' + arch + '"/></clipPath>' +
    '<radialGradient id="gh' + u + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + P.glow[0] + '" stop-opacity=".55"/><stop offset=".55" stop-color="' + P.glow[1] + '" stop-opacity=".18"/><stop offset="1" stop-color="' + P.glow[1] + '" stop-opacity="0"/></radialGradient></defs>' +
    '<ellipse class="d-halo" cx="' + (g.VW / 2) + '" cy="' + (g.H * 0.52).toFixed(1) + '" rx="' + (g.VW * 0.78).toFixed(1) + '" ry="' + (g.H * 0.62).toFixed(1) + '" fill="url(#gh' + u + ')"/>' +
    '<ellipse cx="' + (g.VW / 2) + '" cy="' + (g.VH + 2) + '" rx="' + (P.bw * 0.54).toFixed(1) + '" ry="5.5" fill="rgba(0,0,0,.42)"/>' +
    glBase2(u, k, bx, yt) +
    '<path d="' + arch + '" fill="#08080a"/>' +
    '<image href="' + A.src + '" x="' + ox + '" y="0" width="' + g.W + '" height="' + g.H + '" preserveAspectRatio="none" clip-path="url(#gc' + u + ')"/>' +
    '<path class="d-dim" d="' + arch + '" fill="#06050a"/>' +
    glFx2(u, k, g, ox) +
    '<path d="' + arch + '" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.5"/>' +
    '<rect class="d-hit d-sw" x="' + bx + '" y="' + (yt - 6) + '" width="' + P.bw + '" height="' + (P.bh + 12) + '" fill="transparent"/>' +
    '</svg>';
}

function glClick2(sceneCls, ms) {
  return (el, ev, A) => {
    const sw = ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-sw');
    if (sw) { const on = A.toggle(el); el.classList.remove(sceneCls); A.play(el, on ? 'is-lit' : 'is-dark', 900); return; }
    if (!A.on) { A.toggle(el); A.play(el, 'is-lit', 900); return; }
    A.play(el, sceneCls, ms);
  };
}

registerDecor({
  id: 'uveg-var', name: 'Csillagos vár (üvegablak-lámpa)', hint: 'A talpára kattintva kapcsolod a fényt. Kattints az üvegre: hullócsillagok húznak el, a csillagok megcsillannak.', ar: glAr('night'), k: 0.96,
  svg: u => glSvg(u, 'night'), onClick: glClick2('is-wish', 3300),
  idle(el) { if (!el.classList.contains('is-off')) dcPlay(el, 'is-twinkle', 1800); }
});
registerDecor({
  id: 'uveg-rozsa', name: 'Rózsák és fekete pillangó (üvegablak-lámpa)', hint: 'A talpára kattintva kapcsolod a fényt. Kattints az üvegre: fény csillan végig a fényes nyomaton.', ar: glAr('rose'), k: 0.96,
  svg: u => glSvg(u, 'rose'), onClick: glClick2('is-glint', 2400),
  idle(el) { if (!el.classList.contains('is-off')) dcPlay(el, 'is-glint', 2400); }
});
registerDecor({
  id: 'uveg-kard', name: 'Lángoló kard (üvegablak-lámpa)', hint: 'A talpára kattintva kapcsolod a fényt. Kattints az üvegre: fellobban a láng, szikrák szállnak.', ar: glAr('sword'), k: 0.96,
  svg: u => glSvg(u, 'sword'), onClick: glClick2('is-blaze', 3000),
  idle(el) { if (!el.classList.contains('is-off')) dcPlay(el, 'is-flick', 1700); }
});

registerSet({ id: 'uveg-var', name: 'Csillagos vár lámpa', desc: 'Íves üvegablak-lámpa: éjszakai vár hegyek alatt, hullócsillagok, egy szárnyas férfi és egy nő az erkélyen. Hátulról világít.', tip: 'Kattints az üvegre: hullócsillagok!', parts: [{ type: 'uveg-var', at: 'end' }] });
registerSet({ id: 'uveg-rozsa', name: 'Rózsák és pillangó lámpa', desc: 'Íves üvegablak-lámpa: vörös rózsák tüskés ágakon, középen fekete pillangó, vastag fekete kerettel.', tip: 'Kattints az üvegre: fény csillan végig rajta.', parts: [{ type: 'uveg-rozsa', at: 'end' }] });
registerSet({ id: 'uveg-kard', name: 'Lángoló kard lámpa', desc: 'Íves üvegablak-lámpa: hátulról látszó, páncélos, hosszú szőke hajú alak, a felmeredő kard markolata fölött láng lobog, mögötte tűzvörös ólomüveg.', tip: 'Kattints az üvegre: a láng fellobban.', parts: [{ type: 'uveg-kard', at: 'end' }] });
