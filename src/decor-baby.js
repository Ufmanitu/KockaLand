/* ===== Díszek: repülő sárkány + füstoszlopa (2D kép; a 3D polcon is ugyanez a rajz kerül textúraként a síkokra, lib3d-flyimg.js) =====
   A rajz a referenciakép (apró fekete sárkány, a szájából kiömlő füst krémszínű, tekergő felhőoszloppá dagad, ami a ferdén dőlő sötét könyveket tartja) alapján készült.
   Rétegek (a 3D-ben külön síkok, a 2D-ben <g> csoportok; az animációkhoz): shadow · cloud (oszlop+alap) · stream (a szájtól az oszlopig) · books · wisp · wingB · dragon · wingF · puffs
   Kattintás (sárkányra): nagyot fúj (a füstsugár megnő, az oszlop megduzzad, a könyvek megrezzennek). Következő kattintás: csapkod a szárnyával. A füstoszlopra kattintva megpuffan.
   (Az id megmaradt: 'kis-sarkany', hogy a régi mentések díszei is átjöjjenek.) */
'use strict';

/* nézet: 240 × 200; a talaj y≈188; a sárkány balra (orra x≈92), a könyvek jobbra, ferdén balra dőlnek */
const FLY = { W: 240, H: 200, G: 188, bw: 22, bx: 140, bstep: 22.5, bH: 158, tilt: 0.30, nose: [92, 181.5], shoulder: [62, 171], wB: [64, 169] };
const flyEdge = y => FLY.bx - FLY.tilt * (FLY.G - y);          // az 1. könyv bal éle (y magasságban)
const FLY_LOBES = [[173.5, 15], [163, 13.2], [153, 12.6], [143.5, 11.6], [134, 10.6], [125, 9.6], [116.5, 8.6], [108.5, 7.6], [101.5, 6.4], [95.5, 4.8]];

function flySpiral(cx, cy, r, turns, rot, dir) {
  const n = 30, p = [];
  for (let i = 0; i <= n; i++) { const t = i / n, a = rot + dir * t * turns * Math.PI * 2, rr = r * (1 - t * 0.88); p.push((cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1)); }
  return 'M' + p.join('L');
}
function flyDefs(u) {
  return '<defs>' +
    '<radialGradient id="fcl' + u + '" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#fffdf6"/><stop offset=".55" stop-color="#f7ecd4"/><stop offset="1" stop-color="#dcc9a2"/></radialGradient>' +
    '<linearGradient id="fbk' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4b382c"/><stop offset=".35" stop-color="#2d2119"/><stop offset="1" stop-color="#17110d"/></linearGradient>' +
    '<linearGradient id="fdr' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3e48"/><stop offset=".45" stop-color="#1c1d23"/><stop offset="1" stop-color="#0b0b0e"/></linearGradient>' +
    '<linearGradient id="fwm' + u + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0e0e12"/><stop offset="1" stop-color="#2a2c35"/></linearGradient>' +
    '<linearGradient id="fsm' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff9ea" stop-opacity=".25"/><stop offset=".35" stop-color="#fffaf0"/><stop offset="1" stop-color="#f4e8cf"/></linearGradient>' +
    '<radialGradient id="fgl' + u + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2a6" stop-opacity=".75"/><stop offset="1" stop-color="#ffd089" stop-opacity="0"/></radialGradient>' +
    '<filter id="fbl' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>' +
    '<filter id="fbs' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".9"/></filter>' +
    '<clipPath id="fce' + u + '"><ellipse cx="85" cy="173.6" rx="2.5" ry="2.7"/></clipPath>' +
    '</defs>';
}
const FLY_LAYERS = {
  shadow: u => '<g class="fd-shadow"><ellipse cx="186" cy="190.4" rx="52" ry="4.2" fill="rgba(0,0,0,.34)"/><ellipse cx="116" cy="189.6" rx="26" ry="3" fill="rgba(0,0,0,.2)"/><ellipse cx="50" cy="188.8" rx="46" ry="3.2" fill="rgba(0,0,0,.3)"/></g>',
  /* a felhő-oszlop: a lobe-ok a könyv bal éle mentén; bevésett spirálok; alul a talajon szétterülő alap */
  cloud: u => {
    let s = '<g class="fd-cloud d-pillar">';
    const L = FLY_LOBES.map((l, i) => [flyEdge(l[0]) - l[1] * (i % 2 ? 1.18 : 0.92), l[0], l[1]]);
    const sat = [[0, -1.02, 0.5, 0.45], [1, -1.0, 0.46, 0.3], [2, -1.02, 0.44, 0.5], [3, -1.0, 0.42, 0.3], [4, -1.02, 0.4, 0.5], [5, -1.0, 0.38, 0.3], [6, -1.0, 0.36, 0.5], [7, -0.98, 0.34, 0.3]].map(q => { const l = L[q[0]], r = l[2] * q[2]; return [l[0] + l[2] * q[1] - r * 0.2, l[1] + l[2] * q[3], r]; });
    const all = L.concat(sat);
    /* 1. kör: körvonal (a közös sziluett külső pereme), 2. kör: kitöltés */
    for (let i = 0; i < L.length - 1; i++) s += '<line x1="' + L[i][0].toFixed(1) + '" y1="' + L[i][1] + '" x2="' + L[i + 1][0].toFixed(1) + '" y2="' + L[i + 1][1] + '" stroke="#bfa97f" stroke-width="' + (L[i][2] * 1.8 + 2).toFixed(1) + '" stroke-linecap="round"/>';
    all.forEach(c => { s += '<circle cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="' + (c[2] + 1.1).toFixed(1) + '" fill="#bfa97f"/>'; });
    for (let i = 0; i < L.length - 1; i++) s += '<line x1="' + L[i][0].toFixed(1) + '" y1="' + L[i][1] + '" x2="' + L[i + 1][0].toFixed(1) + '" y2="' + L[i + 1][1] + '" stroke="#f3e7cd" stroke-width="' + (L[i][2] * 1.8).toFixed(1) + '" stroke-linecap="round"/>';
    all.forEach(c => { s += '<circle cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="' + c[2].toFixed(1) + '" fill="url(#fcl' + u + ')"/>'; });
    /* bevésett kunkorok: a lobe-ok belsejében egy-egy spirál, farokkal a következő felé */
    const eng = (cx, cy, r, rot, dir, k) => {
      const d = flySpiral(cx, cy, r, 1.7, rot, dir);
      return '<path d="' + d + '" fill="none" stroke="#c9b389" stroke-width="' + (1.2 + k * 0.4).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + flySpiral(cx - 0.55, cy - 0.55, r, 1.7, rot, dir) + '" fill="none" stroke="#fffefa" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>';
    };
    L.forEach((l, i) => { s += eng(l[0] - l[2] * 0.12, l[1] - l[2] * 0.05, l[2] * 0.66, -2.4 + i * 0.7, i % 2 ? -1 : 1, l[2] / 15); });
    sat.forEach((c, i) => { s += eng(c[0], c[1], c[2] * 0.7, 0.8 + i, i % 2 ? 1 : -1, 0.3); });
    /* folyó vonalak az oszlop mentén (a felhő „áramlása”) */
    s += '<path d="M106 176C110 168 116 168 118 160M110 150C112 144 118 144 119 138M114 130C116 124 120 124 121 118" fill="none" stroke="#cdb88f" stroke-width="1" stroke-linecap="round" opacity=".8"/>';
    /* alap: hullámok a talajon */
    s += '<path d="M97 186.8c4-1.8 7 .8 11-1.2s7 .8 11-1M126 187c4-1.2 6 .6 9.6-.8" fill="none" stroke="#cdb88f" stroke-width="1.1" stroke-linecap="round"/><path d="M97.6 186c4-1.8 7 .8 11-1.2" fill="none" stroke="#fffdf6" stroke-width=".7" stroke-linecap="round"/>';
    /* meleg visszfény a könyv felőli oldalon */
    s += '<ellipse cx="124" cy="150" rx="11" ry="40" fill="url(#fgl' + u + ')" opacity=".55" transform="rotate(14 124 150)"/>';
    return s + '</g>';
  },
  /* a szájból kiömlő füstszalag: vékonyan indul, az oszlop aljába torkollik */
  stream: u => '<g class="fd-stream d-flame">' +
    '<path d="M92 181.8C97 181.2 100.6 178.6 104.6 174.4L114 172L114 188.6L99.6 188.6C96.2 187.4 93.6 185.4 92 183.4Z" fill="url(#fsm' + u + ')"/>' +
    '<path d="M92 181.8C97 181.2 100.6 178.6 104.6 174.4L114 172M92 183.4C93.6 185.4 96.2 187.4 99.6 188.4" fill="none" stroke="#c4af85" stroke-width=".9" stroke-linecap="round"/>' +
    '<path d="M93.6 182.6c3.8.2 7.2-1 10.4-3.4M96.6 185.4c3.6-.2 6.6-1.6 9.6-3.6M101 186.8c2.8-.2 5.2-1 7.4-2.4" fill="none" stroke="#fffefb" stroke-width=".9" stroke-linecap="round" opacity=".95"/></g>',
  /* 4 ferdén dőlő sötét könyv, vékony arany fénypereme */
  books: u => {
    let s = '<g class="fd-books d-pcap">', G = FLY.G, H = FLY.bH, t = FLY.tilt * H, top = G - H;
    for (let i = 3; i >= 0; i--) {
      const x0 = FLY.bx + i * FLY.bstep, w = FLY.bw, dx = 8.5, dy = -5.2;
      const q = [[x0, G], [x0 + w, G], [x0 + w - t, top], [x0 - t, top]];
      s += '<g>';
      s += '<path d="M' + q.map(p => p.join(' ')).join('L') + 'Z" fill="url(#fbk' + u + ')"/>';
      s += '<path d="M' + (x0 - t) + ' ' + top + 'L' + (x0 + w - t) + ' ' + top + 'L' + (x0 + w - t + dx) + ' ' + (top + dy) + 'L' + (x0 - t + dx) + ' ' + (top + dy) + 'Z" fill="#33261d"/>';
      s += '<path d="M' + (x0 - t) + ' ' + top + 'L' + (x0 - t + dx) + ' ' + (top + dy) + 'L' + (x0 + w - t + dx) + ' ' + (top + dy) + '" fill="none" stroke="#ffd98f" stroke-width="1.1" stroke-linejoin="round" opacity=".95"/>';
      s += '<path d="M' + x0 + ' ' + G + 'L' + (x0 - t) + ' ' + top + '" stroke="#ffcf7a" stroke-width="1" opacity="' + (i === 0 ? .95 : .5) + '"/>';
      s += '<path d="M' + (x0 + w) + ' ' + G + 'L' + (x0 + w - t) + ' ' + top + '" stroke="#05030a" stroke-width="1.1" opacity=".55"/>';
      s += '<path d="M' + (x0 + 5) + ' ' + (G - 4) + 'L' + (x0 + 5 - t * 0.97) + ' ' + (top + 5) + '" stroke="rgba(255,225,170,.12)" stroke-width="3"/>';
      s += '<path d="M' + (x0 + 1.5 - t * 0.14) + ' ' + (G - 22) + 'h' + (w - 3) + 'M' + (x0 + 1.5 - t * 0.87) + ' ' + (top + 22) + 'h' + (w - 3) + '" stroke="rgba(255,214,140,.3)" stroke-width=".8"/>';
      s += '</g>';
    }
    return s + '</g>';
  },
  /* halvány füstfoszlányok a sárkány és a szalag körül */
  wisp: u => '<g class="fd-wisp" filter="url(#fbl' + u + ')" fill="#fff4de"><ellipse cx="88" cy="168" rx="10" ry="4.6" opacity=".34"/><ellipse cx="102" cy="162" rx="9" ry="4" opacity=".26"/><ellipse cx="80" cy="154" rx="8" ry="3.6" opacity=".2"/><ellipse cx="96" cy="150" rx="7" ry="3.2" opacity=".16"/><ellipse cx="110" cy="183" rx="9" ry="2.6" opacity=".3"/></g>',
  /* a távolabbi szárny (a test mögött) */
  wingB: u => {
    const S = FLY.wB;
    return '<g class="fd-wingB d-wing"><path d="M' + S[0] + ' ' + S[1] + 'L67 150L63 134C56 134 46 136 38 141C44 142 44 148 47 153C51 152 53 157 57 160C59 162 61 165 64 168Z" fill="url(#fwm' + u + ')" stroke="#4a4e5c" stroke-width=".9" stroke-linejoin="round"/>' +
      '<path d="M63 134L38 141M63 134L47 153M63 134L57 160M63 134L67 150" stroke="#3a3d49" stroke-width="1.1" stroke-linecap="round" fill="none"/><path d="M' + S[0] + ' ' + S[1] + 'L67 150L63 134" fill="none" stroke="#2a2c34" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M63 134L38 141" stroke="#7d8496" stroke-width=".5" opacity=".6"/></g>';
  },
  /* a sárkány: farok (kunkori hegy), test, láb, fej, szarv, szem */
  dragon: u => {
    let s = '<g class="fd-dragon d-body">';
    /* farok: három szakasz, fogy; a vége kunkori */
    s += '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M34 179C20 183 8 177 8 167" stroke="#0c0c10" stroke-width="9"/><path d="M8 167C8 158 18 158 17 150" stroke="#0c0c10" stroke-width="6.4"/><path d="M17 150C16 145 11 144 10.4 148.6" stroke="#0c0c10" stroke-width="4"/>' +
      '<path d="M34 177.4C21 181 10.4 176 9.4 167" stroke="#383b46" stroke-width="3.2" opacity=".85"/><path d="M9.6 165.4C10 159.6 17.4 159 17.8 152.6" stroke="#383b46" stroke-width="2" opacity=".8"/></g>';
    s += '<path d="M8.6 148.4l-4.6 -2.2l1.4 5.4z" fill="#15161b" stroke="#454955" stroke-width=".6" stroke-linejoin="round"/>';
    /* hát-tüskék */
    s += '<path d="M33 168l2.4 -4.8l3 4M40 166.6l2.2 -5.2l3.4 4.2M47.6 166.2l2 -5.2l3.4 4.6M55 166.8l1.8 -5l3.4 4.8M62 168.2l1.6 -4.6l3.2 4.8" fill="#15161b" stroke="#3d4050" stroke-width=".6" stroke-linejoin="round"/>';
    /* test + nyak + fej (a száj résnyire nyitva) */
    s += '<path d="M26 184C21.6 176 28.6 167.4 41 166.8C52 166.2 62 168.6 70 170.4C75.6 168 82 167.2 87.6 169.6C92 171.4 94.6 175 95.4 178.4C96 180.4 95 181.8 93 182.4L88.4 182.8C85.6 186.2 79.4 187.4 73 187C64 188 50 188.4 40 188C33 187.8 28 187 26 184Z" fill="url(#fdr' + u + ')" stroke="#0a0a0d" stroke-width=".8" stroke-linejoin="round"/>';
    s += '<path d="M31 170.6C40 166.8 56 166.4 70 170.6C77 167.4 85 167.4 90 171" fill="none" stroke="#8a92a6" stroke-width=".8" stroke-linecap="round" opacity=".55"/>';
    /* has-lemezek */
    s += '<path d="M44 186.6h20M47 184.6h17M52 182.6h13" stroke="#3b3d48" stroke-width=".7" stroke-linecap="round" opacity=".8"/>';
    /* comb + hátsó láb */
    s += '<path d="M28 183C29 176 36 172 44 173.6C50 175 51 181 49 185.4L47 188L34 188Z" fill="#14151a" stroke="#0a0a0d" stroke-width=".7" stroke-linejoin="round"/><path d="M32 178c3-3.6 9-4.6 13-2.4" fill="none" stroke="#6d7385" stroke-width=".7" opacity=".6" stroke-linecap="round"/>';
    s += '<path d="M35.6 188.2l-3 1.6M40 188.4l-1.4 2.2M44.4 188.2l.2 2.4" stroke="#9aa0b0" stroke-width="1.5" stroke-linecap="round"/>';
    /* mellső láb */
    s += '<path d="M64 178L69 187.6L78.2 187.4C78.4 186.2 76.4 185.6 74.2 185.2L72.6 177Z" fill="#16171c" stroke="#0a0a0d" stroke-width=".7" stroke-linejoin="round"/>';
    s += '<path d="M73.4 188.4l2.4 1.4M76.6 188.2l1.6 2M78.4 187.6l2.4 1" stroke="#9aa0b0" stroke-width="1.4" stroke-linecap="round"/>';
    /* szarvak */
    s += '<path d="M80.6 169.6C78 164.4 73 160.2 66.6 158.6C70.6 162.2 73.8 166.2 75 171Z" fill="#101116" stroke="#4c5060" stroke-width=".7" stroke-linejoin="round"/><path d="M86.4 169C84.4 165 81 162 77 160.4C79.6 163.6 81.4 166.6 81.8 170Z" fill="#14151a" stroke="#4c5060" stroke-width=".7" stroke-linejoin="round"/>';
    /* szem-üreg + szemöldök (a szem maga külön réteg: a 3D-ben mozog és pislog) */
    s += '<path d="M81.4 171.8C84 170 88 170.8 89.2 173.6C86.6 175.6 82.6 175.4 80.6 173.6Z" fill="#08080b"/>';
    s += '<path d="M81.6 171C84.4 169.6 87.6 170.2 89.4 172" fill="none" stroke="#5c6174" stroke-width=".8" stroke-linecap="round"/>';
    /* orr + száj + fogak */
    s += '<ellipse cx="93.4" cy="178.2" rx=".9" ry=".6" fill="#000"/><path d="M95 181.4L90 182.6L83 182.2" fill="none" stroke="#000" stroke-width="1.1" stroke-linecap="round"/><path d="M91.6 182.4l-.8 1.8l1.8 -.6zM88.4 182.6l-.8 1.6l1.7 -.5z" fill="#efe9dc"/>';
    return s + '</g>';
  },
  /* a szem (2D-ben külön csoport: pupilla követ, pislog; 3D-ben primitívekből épül) */
  eye: u => '<g class="d-eye"><ellipse cx="85" cy="173.6" rx="3" ry="3.1" fill="#4a2208"/><g clip-path="url(#fce' + u + ')"><ellipse cx="85" cy="173.6" rx="2.5" ry="2.7" fill="#ffb02a"/><g class="d-look"><ellipse cx="85.4" cy="173.6" rx=".8" ry="2.2" fill="#0a0604"/><circle cx="86.2" cy="172.6" r=".7" fill="#fff"/></g><path class="d-lid" d="M81 170.6H89V173.8H81Z" fill="#17181d"/></g></g>',
  wingF: u => {
    const S = FLY.shoulder;
    return '<g class="fd-wingF d-wing"><path d="M' + S[0] + ' ' + S[1] + 'L58 156L51 143C44 142 35 144 28 149C34 150 34 155 36 160C40 159 42 164 47 167C49 168.6 51 170.6 55 172Z" fill="url(#fwm' + u + ')" stroke="#555a6a" stroke-width=".9" stroke-linejoin="round"/>' +
      '<path d="M51 143L28 149M51 143L36 160M51 143L47 167M51 143L55 160" stroke="#3b3e4b" stroke-width="1.1" stroke-linecap="round" fill="none"/><path d="M' + S[0] + ' ' + S[1] + 'L58 156L51 143" fill="none" stroke="#1c1d23" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M51 143L28 149" stroke="#8d95a8" stroke-width=".5" opacity=".6"/><path d="M62 171L58 156" stroke="#555a6a" stroke-width=".6" opacity=".7"/></g>';
  },
  puffs: u => '<g class="d-puffs"><circle class="pf1" cx="102" cy="98" r="4.4"/><circle class="pf2" cx="108" cy="100" r="3.8"/><circle class="pf3" cx="97" cy="102" r="4.8"/></g>'
};
const FLY_ORDER = ['shadow', 'stream', 'cloud', 'books', 'wisp', 'wingB', 'dragon', 'eye', 'wingF', 'puffs'];
function flySvg(u, cls) {
  return '<svg class="' + cls + '" viewBox="0 0 ' + FLY.W + ' ' + FLY.H + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + flyDefs(u) + FLY_ORDER.map(k => FLY_LAYERS[k](u)).join('') + '<ellipse class="d-hit d-cl" cx="104" cy="146" rx="26" ry="46" fill="transparent"/><ellipse class="d-hit d-dr" cx="52" cy="172" rx="50" ry="22" fill="transparent"/></svg>';
}

registerDecor({
  id: 'kis-sarkany', name: 'Repülő sárkány és füstje', hint: 'Bökd meg: nagyot fúj. Még egyszer: csapkod. A füstoszlopra kattintva megpuffan.', ar: 1.2, k: 1.1, look: true,
  svg: u => flySvg(u, 'dc-svg fd-svg'),
  onClick(el, ev, A) {
    const all = ['is-blast', 'is-flap', 'is-puff'];
    if (ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-cl')) { all.forEach(c => el.classList.remove(c)); A.play(el, 'is-puff', 1500); return; }
    const st = A.st, now = Date.now();
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    all.forEach(c => el.classList.remove(c));
    if (st.n % 2 === 1) A.play(el, 'is-blast', 1700); else A.play(el, 'is-flap', 1600);
  },
  idle(el) {
    const s = dcSt(el); if (Date.now() - s.last < 5000) return;
    if (Math.random() < 0.65) dcPlay(el, 'is-blink', 300); else dcPlay(el, 'is-flap', 1200);
  }
});

registerSet({ id: 'kis-sarkany', name: 'Repülő sárkány és füstje', desc: 'Apró fekete sárkány fújja a füstöt a ferdén dőlő könyvekre: a szájából kiömlő füst krémszínű, tekergő felhőoszloppá dagad, ami nekitámaszkodik a könyveknek és nem hagyja őket eldőlni. Nagyot fúj, csapkod – és a füst is megpuffan.', tip: 'Egymás után kétszer: nagyot fúj, aztán csapkod!', parts: [{ type: 'kis-sarkany', at: 'end' }] });
