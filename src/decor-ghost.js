/* ===== Díszek: olvasó szellem (saját rajz) =====
   Sima, fehér, harang alakú szellem a polc peremén ül (a szegélye áthullik rajta), és az apró fekete könyvét olvassa. A szeme követi az egeret, néha pislog, néha lapoz.
   Bökés (a testére): megijed (felugrik, felemeli a karját, "!"). Gyors második bökés: kezével eltakarja a szemét, majd kikukucskál.
   Harmadik: "Búúú!" (nyújtózik, karok szét, sugarak). A könyvére kattintva lapoz. */
'use strict';

registerDecor({
  id: 'szellem', name: 'Olvasó szellem', hint: 'Bökd meg: megijed! A könyvére kattintva lapoz. Többször egymás után is próbáld.', ar: 1, k: 0.74, look: true,
  svg: u => {
    let rays = '';
    for (let i = 0; i < 7; i++) { const a = (-160 + i * 23.3) * Math.PI / 180, c = 60, cy = 52, r1 = 58, r2 = 69; rays += 'M' + dcN(c + Math.cos(a) * r1) + ' ' + dcN(cy + Math.sin(a) * r1 * 0.95) + 'L' + dcN(c + Math.cos(a) * r2) + ' ' + dcN(cy + Math.sin(a) * r2 * 0.95); }
    const eye = (x, cls) => '<g class="' + cls + '"><ellipse cx="' + x + '" cy="46" rx="4.7" ry="6.8" fill="#1b1720"/></g>';
    const lid = x => '<ellipse class="d-lid" cx="' + x + '" cy="46" rx="6" ry="8.2" fill="#f6f5f0"/>';
    const arm = (d, cls, piv) => '<g class="' + cls + '"><path d="' + d + '" fill="none" stroke="rgba(150,140,128,.5)" stroke-width="13.2" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#fbfaf6" stroke-width="10.6" stroke-linecap="round"/></g>';
    return '<svg class="dc-svg gh-svg" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="gb' + u + '" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f3f1ea"/><stop offset="1" stop-color="#d9d5ca"/></linearGradient>' +
      '<radialGradient id="gh' + u + '"><stop offset="0" stop-color="#fff3d6" stop-opacity=".7"/><stop offset=".55" stop-color="#ffe3a8" stop-opacity=".2"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>' +
      '<pattern id="gw' + u + '" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#1c1c21"/><path d="M0 .5H3M.5 0V3" stroke="rgba(130,135,155,.28)" stroke-width=".7"/></pattern>' +
      '</defs>' +
      '<ellipse class="d-halo" cx="60" cy="62" rx="64" ry="62" fill="url(#gh' + u + ')"/>' +
      '<ellipse cx="60" cy="119" rx="42" ry="3.6" fill="rgba(0,0,0,.32)"/>' +
      '<path class="d-rays" d="' + rays + '" fill="none" stroke="#ffd36b" stroke-width="2.6" stroke-linecap="round"/>' +
      '<g class="d-gbody">' +
      /* harang-test + a polc peremén áthulló, hullámos szegély */
      '<path d="M24 116C22 98 22 78 26 58C30 32 44 14 60 14C76 14 90 32 94 58C98 78 98 98 96 116Z" fill="url(#gb' + u + ')" stroke="rgba(150,140,128,.5)" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M24.6 114H95.4L94.6 122C93 127.4 89.6 129 86 125.4C82.6 122 79 120.4 75.4 122.4C71.6 124.6 67.4 126.6 63.6 124.2C60 121.8 56.4 120 52.6 122.6C48.6 125.2 45.2 130 40.6 126.4C37 123.6 33 120.4 29.6 123C27.4 124.6 25.6 124 24.6 121Z" fill="url(#gb' + u + ')" stroke="rgba(150,140,128,.55)" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M25 114H95" stroke="rgba(120,110,95,.22)" stroke-width="1.6"/>' +
      '<path d="M27 100C25 84 26 68 30 54" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="44" cy="25" rx="12" ry="6.4" fill="rgba(255,255,255,.8)" transform="rotate(-30 44 25)"/>' +
      '<g class="d-eyes">' + eye(46, 'd-look d-eye') + eye(74, 'd-look') + '</g>' + lid(46) + lid(74) +
      '<path class="d-smile" d="M0 0" fill="none"/><ellipse class="d-oh" cx="60" cy="63" rx="3.6" ry="4.6" fill="#1b1720"/>' +
      /* az apró fekete könyv a mellkas előtt: a szövetes hátlapja látszik; lapozáskor egy lap kikandikál a teteje fölött */
      '<g class="d-bookg"><g class="d-pg"><path d="M41 90L79 90L79 78C70 75 50 75 41 78Z" fill="#f6ecd0" stroke="#b9a678" stroke-width=".8" stroke-linejoin="round"/><path d="M46 82H74M46 85.5H70" stroke="#c9b98e" stroke-width=".8" stroke-linecap="round"/></g>' +
      '<rect x="38" y="88" width="44" height="30" rx="2.6" fill="url(#gw' + u + ')" stroke="#0b0b0e" stroke-width="1.3"/><path d="M39.4 89.4H80.6" stroke="rgba(190,195,215,.35)" stroke-width="1" stroke-linecap="round"/><rect x="36.2" y="89" width="3" height="28" rx="1" fill="#f6ecd0" stroke="#b9a678" stroke-width=".7"/></g>' +
      /* karok: dundi, rövid, a kezek a könyv szélén */
      arm('M26 70C14 80 20 96 36 102', 'd-arml') + arm('M94 70C106 80 100 96 84 102', 'd-armr') +
      '</g>' +
      '<g class="d-excl"><path d="M60 -6L56.5 -23C56.5 -27 63.5 -27 63.5 -23Z" fill="#ff6b6b"/><circle cx="60" cy="-0.5" r="3.1" fill="#ff6b6b"/></g>' +
      '<rect class="d-bookhit" x="34" y="86" width="52" height="34" rx="6" fill="transparent"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const book = ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-bookhit');
    const all = ['is-turn', 'is-startle', 'is-hide', 'is-spook'];
    if (book) { all.forEach(c => el.classList.remove(c)); A.play(el, 'is-turn', 1500); return; }
    const st = A.st, now = Date.now();
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    all.forEach(c => el.classList.remove(c));
    if (st.n === 1) A.play(el, 'is-startle', 1800);
    else if (st.n === 2) A.play(el, 'is-hide', 2800);
    else { A.play(el, 'is-spook', 2700); st.n = 0; }
  },
  idle(el) {
    const s = dcSt(el), now = Date.now(); if (now - s.last < 5000) return;
    if (Math.random() < 0.55) dcPlay(el, 'is-blink', 300); else dcPlay(el, 'is-turn', 1500);
  }
});

registerSet({ id: 'szellem', name: 'Olvasó szellem', desc: 'Sima, fehér szellem a polc szélén ülve az apró fekete könyvét olvassa. A szeme követi az egeret, néha lapoz.', tip: 'Bökd meg, aztán még egyszer, még egyszer…', parts: [{ type: 'szellem', at: 'end' }] });
