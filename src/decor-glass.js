/* ===== Díszek: üvegablak-hatású, hátulról megvilágított íves panelek (saját rajz) =====
   "Rózsa és pillangó" és "Csillagos vár" panel. Az üveg ólomkeretes mozaik (determinisztikus, minden példány azonos). Az alján egy kapcsoló: fel/le kapcsolja a háttérfényt (mentődik).
   Az üvegre kattintva: ha sötét, felkapcsol; ha világít, lejátssza a jelenetét (rózsa: pillangó repül, szirom hull; vár: hullócsillag, szív). */
'use strict';

const GL_LEAD = '#17110f';
const glHsl = (h, s, l) => 'hsl(' + Math.round(h) + ' ' + Math.round(s) + '% ' + Math.round(l) + '%)';
const glPt = p => dcN(p[0]) + ' ' + dcN(p[1]);

/* ólomkeretes mozaik: kicsit megdöntött rács, a cellák egy része két háromszögre bontva; col(cx,cy,rng) → szín */
function glMosaic(rng, x0, x1, y0, y1, cols, rows, col) {
  const P = [], dx = (x1 - x0) / cols, dy = (y1 - y0) / rows;
  for (let j = 0; j <= rows; j++) { P[j] = []; for (let i = 0; i <= cols; i++) P[j][i] = [x0 + dx * i + (i === 0 || i === cols ? 0 : (rng() - 0.5) * dx * 0.7), y0 + dy * j + (j === 0 || j === rows ? 0 : (rng() - 0.5) * dy * 0.7)]; }
  let s = '';
  const poly = (pts, c) => '<path d="M' + pts.map(glPt).join('L') + 'Z" fill="' + c + '"/>';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = P[j][i], b = P[j][i + 1], c = P[j + 1][i + 1], d = P[j + 1][i];
    if (rng() < 0.42) {
      const t1 = rng() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      t1.forEach(t => { s += poly(t, col((t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, rng)); });
    } else s += poly([a, b, c, d], col((a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, rng));
  }
  return s;
}
const glStar = (cx, cy, r) => { const k = r * 0.3; return 'M' + dcN(cx) + ' ' + dcN(cy - r) + 'L' + dcN(cx + k) + ' ' + dcN(cy - k) + 'L' + dcN(cx + r) + ' ' + dcN(cy) + 'L' + dcN(cx + k) + ' ' + dcN(cy + k) + 'L' + dcN(cx) + ' ' + dcN(cy + r) + 'L' + dcN(cx - k) + ' ' + dcN(cy + k) + 'L' + dcN(cx - r) + ' ' + dcN(cy) + 'L' + dcN(cx - k) + ' ' + dcN(cy - k) + 'Z'; };

const GL_ARCH_OUT = 'M4 160V58A46 46 0 0 1 96 58V160Z';
const GL_ARCH_IN = 'M11 152V58A39 39 0 0 1 89 58V152Z';

/* a keret + háttérfény + kapcsoló körítése; scene = a jelenet SVG-je (a mozaik felett), glow = halo színe */
function glFrame(u, scene, glow) {
  return '<svg class="dc-svg gl-svg" viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
    '<clipPath id="gc' + u + '"><path d="' + GL_ARCH_IN + '"/></clipPath>' +
    '<radialGradient id="gh' + u + '"><stop offset="0" stop-color="' + glow[0] + '" stop-opacity=".62"/><stop offset=".55" stop-color="' + glow[1] + '" stop-opacity=".2"/><stop offset="1" stop-color="' + glow[1] + '" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="gb' + u + '" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".6" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="gf' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3d46"/><stop offset=".4" stop-color="#17181d"/><stop offset="1" stop-color="#0a0a0d"/></linearGradient>' +
    '<radialGradient id="gk' + u + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#d6a640"/><stop offset="1" stop-color="#7a5514"/></radialGradient>' +
    '</defs>' +
    '<ellipse class="d-halo" cx="50" cy="84" rx="70" ry="84" fill="url(#gh' + u + ')"/>' +
    '<ellipse cx="50" cy="168" rx="44" ry="3.4" fill="rgba(0,0,0,.4)"/>' +
    '<path d="' + GL_ARCH_OUT + '" fill="url(#gf' + u + ')" stroke="rgba(190,200,225,.28)" stroke-width="1"/>' +
    '<g clip-path="url(#gc' + u + ')">' + scene +
    '<rect class="d-back" x="0" y="0" width="100" height="160" fill="url(#gb' + u + ')"/>' +
    '<rect class="d-dim" x="0" y="0" width="100" height="160" fill="#07060d"/>' +
    '<path d="M16 150V60C17 36 32 24 44 21" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="2" stroke-linecap="round"/></g>' +
    '<path d="' + GL_ARCH_IN + '" fill="none" stroke="#0a0908" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M6.6 158V58C6.6 33 26 15.4 50 15.4" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>' +
    '<circle cx="50" cy="9.5" r="3.4" fill="url(#gk' + u + ')"/>' +
    '<path d="M6 160H94L97 169C97 170 96 170 95 170H5C4 170 3 170 3 169Z" fill="url(#gf' + u + ')" stroke="rgba(190,200,225,.28)" stroke-width="1"/>' +
    '<circle cx="50" cy="165" r="3.7" fill="url(#gk' + u + ')" stroke="#4c3410" stroke-width=".8"/><circle class="d-led" cx="50" cy="165" r="1.5" fill="#ff7a1a"/>' +
    '<ellipse class="d-hit d-sw" cx="50" cy="165" rx="12" ry="8" fill="transparent"/>' +
    '</svg>';
}

/* ---------- Rózsa és pillangó ---------- */
function glRoseScene(u) {
  const rng = dcRng(7);
  const col = (x, y, r) => {
    const d = Math.hypot((x - 50) * 0.92, y - 88);
    if (d < 30) return glHsl(36 + r() * 14, 95, 60 + r() * 12);
    if (d < 46) return glHsl(4 + r() * 22, 86, 58 + r() * 10);
    if (d < 62) return glHsl(318 + r() * 28, 62, 50 + r() * 10);
    if (d < 80) return glHsl(268 + r() * 24, 58, 42 + r() * 9);
    return glHsl(222 + r() * 20, 62, 36 + r() * 9);
  };
  let s = '<g stroke="' + GL_LEAD + '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">' + glMosaic(rng, 8, 92, 16, 156, 6, 10, col) + '</g>';
  /* levelek + szár */
  s += '<g stroke="' + GL_LEAD + '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M47 118L53 118L54.5 154L45.5 154Z" fill="#23944f"/><path d="M54 134L61 130L56 138Z" fill="#1c7a41"/>' +
    '<path d="M46 122C32 124 20 116 17 104C29 101 42 108 46 122Z" fill="#2fae5e"/><path d="M46 122C36 116 28 110 20 106" fill="none" stroke="#17703a" stroke-width="1.1"/>' +
    '<path d="M54 126C68 126 80 118 83 106C71 103 58 110 54 126Z" fill="#26a054"/><path d="M54 126C64 120 72 114 80 108" fill="none" stroke="#17703a" stroke-width="1.1"/>' +
    '</g>';
  /* a rózsa */
  s += '<g class="d-rose" stroke="' + GL_LEAD + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M22 88C20 66 34 54 50 54C66 54 80 66 78 88C76 108 64 120 50 120C36 120 24 108 22 88Z" fill="#a50f2c"/>' +
    '<path d="M24 86C25 72 34 62 46 61C40 70 38 80 42 92C44 100 48 106 54 111C38 112 25 102 24 86Z" fill="#cf2442"/>' +
    '<path d="M76 86C75 72 66 62 54 61C60 70 62 80 58 92C56 100 52 106 46 111C62 112 75 102 76 86Z" fill="#e0304f"/>' +
    '<path d="M29 100C37 113 63 113 71 100C69 113 60 120 50 120C40 120 31 113 29 100Z" fill="#8a0e26"/>' +
    '<path d="M37 82C37 69 63 69 63 82C63 95 57 105 50 105C43 105 37 95 37 82Z" fill="#f04a6e"/>' +
    '<path d="M41 80C43 73 57 73 59 80C59 88 53 92 50 88C48 85 52 82 54 84" fill="none" stroke="#7a0a20" stroke-width="1.5"/>' +
    '<path d="M45 79C46 75 54 75 55 79C55 83 52 85.5 50 85.5C48 85.5 45 83 45 79Z" fill="#d6566f"/>' +
    '<path d="M29 100C35 93 38 86 39.500 79M71 100C65 93 62 86 60.500 79M43 108C45 101 47 96.500 49 92M57 108C55 101 53 96.500 51 92M24 88C27 84 30 82 33 81M76 88C73 84 70 82 67 81" fill="none" stroke-width="1.3"/>' +
    '<path d="M30 78C32 70 37 65 43 63" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.6"/><path d="M62 70C67 72 71 77 72 83" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.4"/>' +
    '</g>';
  /* hulló szirom */
  s += '<path class="d-petal" d="M56 70C61 70 64 74 62 79C58 79 55 75 56 70Z" fill="#ff5a7c" stroke="' + GL_LEAD + '" stroke-width="1.2"/>';
  /* pillangó (60,44) */
  s += '<g class="d-bfly"><g transform="translate(60 35) scale(.82)" stroke="' + GL_LEAD + '" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">' +
    '<g class="d-wl"><path d="M-1 -3C-10 -16 -22 -14 -21 -4C-20 3 -9 6 -1 3Z" fill="#ff9a2c"/><path d="M-3 -3C-10 -10 -17 -9 -16 -4C-15 -1 -8 1 -3 0Z" fill="#ffd95c"/><circle cx="-15.5" cy="-5" r="1.8" fill="#2f7bf5"/><path d="M-1 3C-9 4 -15 10 -12 16C-8 19 -2 14 -1 8Z" fill="#3b8cff"/></g>' +
    '<g class="d-wr"><path d="M1 -3C10 -16 22 -14 21 -4C20 3 9 6 1 3Z" fill="#ff9a2c"/><path d="M3 -3C10 -10 17 -9 16 -4C15 -1 8 1 3 0Z" fill="#ffd95c"/><circle cx="15.5" cy="-5" r="1.8" fill="#2f7bf5"/><path d="M1 3C9 4 15 10 12 16C8 19 2 14 1 8Z" fill="#3b8cff"/></g>' +
    '<path d="M0 -8C2 -5 2 8 0 11C-2 8 -2 -5 0 -8Z" fill="#3a1c10"/><path d="M0 -8C-3 -13 -6 -14 -7 -16M0 -8C3 -13 6 -14 7 -16" fill="none" stroke="#3a1c10" stroke-width="1"/></g></g>';
  return s;
}
registerDecor({
  id: 'uveg-rozsa', name: 'Rózsa és pillangó (üvegablak-lámpa)', hint: 'Az alján kapcsolod a fényt. Kattints az üvegre: a pillangó felrebben, egy szirom lehull.', ar: 100 / 170, k: 0.96,
  svg: u => glFrame(u, glRoseScene(u), ['#d99a4a', '#a8324a']),
  onClick(el, ev, A) {
    const sw = ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-sw');
    if (sw) { const on = A.toggle(el); el.classList.remove('is-bloom'); A.play(el, on ? 'is-lit' : 'is-dark', 900); return; }
    if (!A.on) { A.toggle(el); A.play(el, 'is-lit', 900); return; }
    A.play(el, 'is-bloom', 3000);
  },
  idle(el) { if (!el.classList.contains('is-off')) dcPlay(el, 'is-flap', 1100); }
});

/* ---------- Csillagos vár ---------- */
function glCastleScene(u) {
  const rng = dcRng(23);
  const col = (x, y, r) => {
    if (y < 50) return glHsl(236 + r() * 16, 66, 22 + r() * 11);
    if (y < 86) return glHsl(262 + r() * 22, 58, 32 + r() * 11);
    if (y < 112) return glHsl(318 + r() * 30, 74, 46 + r() * 11);
    return glHsl(14 + r() * 24, 88, 54 + r() * 10);
  };
  let s = '<g stroke="' + GL_LEAD + '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">' + glMosaic(rng, 8, 92, 16, 156, 6, 10, col) + '</g>';
  /* hold */
  s += '<g stroke="' + GL_LEAD + '" stroke-width="1.5" stroke-linejoin="round"><circle cx="38" cy="40" r="11.5" fill="#fff0b4"/><circle cx="42" cy="36" r="3.4" fill="#f3d986" stroke-width="1"/><circle cx="33" cy="46" r="2.6" fill="#f3d986" stroke-width="1"/><circle cx="43.500" cy="47.500" r="1.7" fill="#f3d986" stroke-width="1"/><circle cx="32" cy="35.500" r="1.4" fill="#f3d986" stroke-width="1"/></g>';
  /* csillagok */
  s += '<g class="d-stars" stroke="' + GL_LEAD + '" stroke-width="1" stroke-linejoin="round">' + [[56, 28, 4], [24, 46, 3.4], [66, 52, 3], [78, 38, 3.6], [20, 70, 2.8], [52, 64, 2.6]].map((q, i) => '<path class="d-star st' + (i + 1) + '" d="' + glStar(q[0], q[1], q[2]) + '" fill="#ffe680"/>').join('') + '</g>';
  /* domb */
  s += '<path d="M9 152V122C22 112 36 118 50 114C64 110 78 106 91 112V152Z" fill="#0f1e3b" stroke="' + GL_LEAD + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 134C28 128 44 134 62 130C74 127 84 128 91 130" fill="none" stroke="rgba(120,150,210,.3)" stroke-width="1.2"/><path d="M30 118L24 152M46 115L53 152M66 111L72 152M82 109L90 140M9 143L36 140L53 152" fill="none" stroke="' + GL_LEAD + '" stroke-width="1.3" stroke-linecap="round"/>';
  /* vár */
  s += '<g class="d-castle" fill="#0d1438" stroke="' + GL_LEAD + '" stroke-width="1.3" stroke-linejoin="round">' +
    '<path d="M44 116V70H56V116Z"/><path d="M42 70L50 54L58 70Z"/>' +
    '<path d="M56 116V86H66V82H69V86H75V82H78V86H82V116Z"/>' +
    '<path d="M70 116V64H82V116Z"/><path d="M68 64L76 46L84 64Z"/><path d="M76 46V38L84 41L76 43Z" fill="#e0386a" stroke="#17110f"/>' +
    '<path d="M62 116V102Q66 96 70 102V116Z" fill="#ffbe55" class="d-win"/></g>';
  s += '<g fill="#ffcf5a" stroke="#17110f" stroke-width=".8"><path class="d-win w1" d="M48 80V76Q50 73 52 76V80Z"/><path class="d-win w2" d="M48 96V92Q50 89 52 92V96Z"/><path class="d-win w3" d="M74 76V72Q76 69 78 72V76Z"/><path class="d-win w4" d="M74 94V90Q76 87 78 90V94Z"/><path class="d-win w5" d="M60 92V89Q62 86.500 64 89V92Z"/></g>';
  /* pár */
  s += '<g class="d-couple" fill="#0a1128" stroke="#17110f" stroke-width=".9" stroke-linejoin="round"><circle cx="21" cy="111" r="2.7"/><path d="M17.500 124L18.500 115Q21 113 23.500 115L24.500 124Z"/><circle cx="29" cy="109.500" r="2.7"/><path d="M25.500 124L26.500 113.500Q29 111.500 31.500 113.500L32.500 124Z"/><path d="M23 117L26 117" stroke="#0a1128" stroke-width="2"/></g>';
  s += '<path class="d-heart" d="M25 100C22 96 17 99 20 103C21.500 105 25 107.500 25 107.500C25 107.500 28.500 105 30 103C33 99 28 96 25 100Z" fill="#ff5d8f" stroke="#17110f" stroke-width=".9"/>';
  /* hullócsillag */
  s += '<g class="d-shoot"><path d="M34 22L58 38" stroke="rgba(255,244,190,.9)" stroke-width="2.2" stroke-linecap="round"/><path d="M34 22L44 28.600" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><path d="' + glStar(60, 39, 3.6) + '" fill="#fff6c4"/></g>';
  return s;
}
registerDecor({
  id: 'uveg-var', name: 'Csillagos vár (üvegablak-lámpa)', hint: 'Az alján kapcsolod a fényt. Kattints az üvegre: hullócsillag húz el, a pár fölött szív jelenik meg.', ar: 100 / 170, k: 0.96,
  svg: u => glFrame(u, glCastleScene(u), ['#9d7cff', '#ff7aa8']),
  onClick(el, ev, A) {
    const sw = ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-sw');
    if (sw) { const on = A.toggle(el); el.classList.remove('is-wish'); A.play(el, on ? 'is-lit' : 'is-dark', 900); return; }
    if (!A.on) { A.toggle(el); A.play(el, 'is-lit', 900); return; }
    A.play(el, 'is-wish', 3200);
  },
  idle(el) { if (!el.classList.contains('is-off')) dcPlay(el, 'is-twinkle', 1800); }
});

registerSet({ id: 'uveg-rozsa', name: 'Rózsa és pillangó panel', desc: 'Íves, színes üvegablak-hatású lámpa: hátulról megvilágított rózsa és pillangó. Az alján kapcsolhatod a fényt.', tip: 'Kattints az üvegre: a pillangó felrebben.', parts: [{ type: 'uveg-rozsa', at: 'end' }] });
registerSet({ id: 'uveg-var', name: 'Csillagos vár panel', desc: 'Éjszakai vár, hold, csillagok és egy pár a dombon: üvegablak-hatású, hátulról megvilágított panel.', tip: 'Kattints: hullócsillag, szív!', parts: [{ type: 'uveg-var', at: 'end' }] });
