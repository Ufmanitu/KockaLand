/* ===== Díszek: olvasó szellem (saját rajz) =====
   Kis, barátságos szellem szemüvegben, a polc peremén ül, és olvas. A szeme követi az egeret, néha pislog, néha lapoz.
   Bökés (a testére): megijed (felugrik, felemeli a karját, "!"). Gyors második bökés: kezével eltakarja a szemét, majd kikukucskál.
   Harmadik: "Búúú!" (nyújtózik, karok szét, sugarak). A könyvére kattintva lapoz. */
'use strict';

registerDecor({
  id: 'szellem', name: 'Olvasó szellem', hint: 'Bökd meg: megijed! A könyvére kattintva lapoz. Többször egymás után is próbáld.', ar: 1, k: 0.62, look: true,
  svg: u => {
    let rays = '';
    for (let i = 0; i < 7; i++) { const a = (-160 + i * 23.3) * Math.PI / 180, c = 60, cy = 52, r1 = 58, r2 = 69; rays += 'M' + dcN(c + Math.cos(a) * r1) + ' ' + dcN(cy + Math.sin(a) * r1 * 0.95) + 'L' + dcN(c + Math.cos(a) * r2) + ' ' + dcN(cy + Math.sin(a) * r2 * 0.95); }
    const eye = (x, cls) => '<g class="' + cls + '"><ellipse cx="' + x + '" cy="52" rx="5.8" ry="7.6" fill="#1c1830"/><ellipse cx="' + (x + 1.9) + '" cy="48.6" rx="2" ry="2.4" fill="#fff"/><circle cx="' + (x - 1.8) + '" cy="55.6" r="1" fill="#fff" opacity=".7"/></g>';
    const lid = x => '<ellipse class="d-lid" cx="' + x + '" cy="52" rx="7.4" ry="9" fill="#f2f5fb"/>';
    const lines = (x0, x1, y0, dy, n) => { let s = ''; for (let i = 0; i < n; i++) s += 'M' + x0 + ' ' + (y0 + i * dy) + 'L' + (x1 - (i % 3 === 2 ? 6 : 0)) + ' ' + (y0 + i * dy + (x1 > 60 ? -0.5 : 0.5)); return s; };
    return '<svg class="dc-svg gh-svg" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="gb' + u + '" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#edf0f9"/><stop offset="1" stop-color="#c3cde4"/></linearGradient>' +
      '<radialGradient id="gh' + u + '"><stop offset="0" stop-color="#ffe9ae" stop-opacity=".85"/><stop offset=".55" stop-color="#ffd78a" stop-opacity=".28"/><stop offset="1" stop-color="#ffc66a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="gk' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e2c20"/><stop offset=".5" stop-color="#8a4631"/><stop offset="1" stop-color="#5e2c20"/></linearGradient>' +
      '</defs>' +
      '<ellipse class="d-halo" cx="60" cy="62" rx="64" ry="62" fill="url(#gh' + u + ')"/>' +
      '<ellipse cx="60" cy="125.5" rx="40" ry="4" fill="rgba(0,0,0,.4)"/>' +
      '<path class="d-rays" d="' + rays + '" fill="none" stroke="#ffd36b" stroke-width="2.6" stroke-linecap="round"/>' +
      '<g class="d-gbody">' +
      '<path d="M22 118C20 100 18 78 20 58C22 30 40 12 60 12C80 12 98 30 100 58C102 78 100 100 98 118C94 124 90 116 84 120C78 125 74 117 68 121C62 125 58 125 52 121C46 117 42 125 36 120C30 116 26 124 22 118Z" fill="url(#gb' + u + ')" stroke="rgba(110,128,170,.7)" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M24 100C22 82 22 66 26 52" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="42" cy="26" rx="13" ry="7" fill="rgba(255,255,255,.75)" transform="rotate(-28 42 26)"/>' +
      '<path d="M96 96C98 80 97 66 93 52" fill="none" stroke="rgba(120,138,180,.3)" stroke-width="4" stroke-linecap="round"/>' +
      '<ellipse cx="36.5" cy="63" rx="6" ry="3.4" fill="#ff9fb6" opacity=".5"/><ellipse cx="83.5" cy="63" rx="6" ry="3.4" fill="#ff9fb6" opacity=".5"/>' +
      '<g class="d-eyes">' + eye(46, 'd-look d-eye') + eye(74, 'd-look') + '</g>' + lid(46) + lid(74) +
      '<g class="d-glasses" fill="rgba(255,255,255,.14)" stroke="#6a4727" stroke-width="2.1"><circle cx="46" cy="52" r="11.2"/><circle cx="74" cy="52" r="11.2"/><path d="M57.2 51C59 49.4 61 49.4 62.8 51" fill="none"/><path d="M34.8 50L28 46M85.2 50L92 46" fill="none" stroke-linecap="round"/></g>' +
      '<path d="M39 43C41 40 46 39 50 40" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path class="d-smile" d="M54.5 66.5Q60 71.5 65.5 66.5" fill="none" stroke="#2a2038" stroke-width="1.9" stroke-linecap="round"/><ellipse class="d-oh" cx="60" cy="68" rx="3.6" ry="4.4" fill="#2a2038"/>' +
      /* a könyv az ölében */
      '<g class="d-bookg"><path d="M28 95L60 101L92 95L95 119L60 125L25 119Z" fill="url(#gk' + u + ')" stroke="#2b120c" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="M32 93L60 98.5L60 119L31 114Z" fill="#fff8e4" stroke="#8a7648" stroke-width=".9" stroke-linejoin="round"/><path d="M88 93L60 98.5L60 119L89 114Z" fill="#fffaee" stroke="#8a7648" stroke-width=".9" stroke-linejoin="round"/>' +
      '<path d="' + lines(36, 56, 99, 3.6, 5) + '" stroke="#b9a678" stroke-width="1" stroke-linecap="round" fill="none"/><path d="' + lines(64, 84, 99, 3.6, 5) + '" stroke="#b9a678" stroke-width="1" stroke-linecap="round" fill="none"/>' +
      '<path d="M60 98.5L60 119" stroke="#6b5530" stroke-width="1.3"/><path d="M28 95.5L60 101.5L92 95.5" fill="none" stroke="#e0b25a" stroke-width="1.2" stroke-linecap="round"/>' +
      '<g class="d-pg"><path d="M60 98.5L88 93L89 114L60 119Z" fill="#fffdf4" stroke="#8a7648" stroke-width=".9" stroke-linejoin="round"/><path d="' + lines(64, 84, 99, 3.6, 4) + '" stroke="#c9b98e" stroke-width="1" stroke-linecap="round" fill="none"/></g></g>' +
      /* karok (a kezekkel a könyv szélén) */
      '<g class="d-arml"><path d="M25 68C16 80 22 94 33 99" fill="none" stroke="rgba(110,128,170,.75)" stroke-width="11.4" stroke-linecap="round"/><path d="M25 68C16 80 22 94 33 99" fill="none" stroke="#f1f4fb" stroke-width="9" stroke-linecap="round"/></g>' +
      '<g class="d-armr"><path d="M95 68C104 80 98 94 87 99" fill="none" stroke="rgba(110,128,170,.75)" stroke-width="11.4" stroke-linecap="round"/><path d="M95 68C104 80 98 94 87 99" fill="none" stroke="#f1f4fb" stroke-width="9" stroke-linecap="round"/></g>' +
      '</g>' +
      '<g class="d-excl"><path d="M60 -6L56.5 -23C56.5 -27 63.5 -27 63.5 -23Z" fill="#ff6b6b"/><circle cx="60" cy="-0.5" r="3.1" fill="#ff6b6b"/></g>' +
      '<rect class="d-bookhit" x="27" y="92" width="66" height="32" rx="6" fill="transparent"/>' +
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

registerSet({ id: 'szellem', name: 'Olvasó szellem', desc: 'Kis szemüveges szellem, a polc szélén ülve olvas. A szeme követi az egeret, néha lapoz.', tip: 'Bökd meg, aztán még egyszer, még egyszer…', parts: [{ type: 'szellem', at: 'end' }] });
