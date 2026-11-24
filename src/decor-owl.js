/* ===== Díszek: bagoly (saját rajz) =====
   Pufi, barna bagoly a polcon. Kattintás: körülnéz (a feje oldalra fordul, a szeme követi), gyorsan még egyszer: huhog (hanggyűrűk, a mellkasa felpuffad),
   harmadszor: megrémül, szárnyra kap egy pillanatra és tollak hullanak. Néha pislog, néha félrebillenti a fejét. */
'use strict';

registerDecor({
  id: 'bagoly', name: 'Bagoly', hint: 'Kattints: körülnéz. Még egyszer: huhog. Harmadszor megrémül!', ar: 0.86, k: 0.82, look: true,
  svg: u => {
    const O = 'stroke="rgba(50,30,14,.65)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
    let chev = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4 - (r % 2); c++) { const x = 40 + c * 10 + (r % 2) * 5, y = 78 + r * 9; chev += 'M' + (x - 3.6) + ' ' + y + 'L' + x + ' ' + (y + 3.6) + 'L' + (x + 3.6) + ' ' + y; }
    const eye = x => '<g class="d-look' + (x < 50 ? ' d-eye' : '') + '"><circle cx="' + x + '" cy="43" r="9.4" fill="#ffc83a" stroke="#6a4310" stroke-width="1.2"/><circle cx="' + x + '" cy="43" r="5.2" fill="#14110d"/><circle cx="' + (x + 2) + '" cy="40.400" r="1.900" fill="#fff"/><circle cx="' + (x - 1.800) + '" cy="46.400" r="1" fill="#fff" opacity=".7"/></g>';
    const lid = x => '<ellipse class="d-lid" cx="' + x + '" cy="43" rx="10.500" ry="10.800" fill="#e9d5ab"/>';
    return '<svg class="dc-svg ow-svg" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="ob' + u + '" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#b88a58"/><stop offset=".5" stop-color="#8a5f38"/><stop offset="1" stop-color="#5f3e22"/></linearGradient>' +
      '<linearGradient id="oc' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeed0"/><stop offset="1" stop-color="#e8cf9c"/></linearGradient>' +
      '<linearGradient id="ow' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f6439"/><stop offset="1" stop-color="#4f321b"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="55" cy="127" rx="40" ry="3.400" fill="rgba(0,0,0,.4)"/>' +
      '<g class="d-fall"><path class="f1" d="M0 0C3 -5 8 -5 9 1C6 7 1 6 0 0Z" fill="#c9a06a" stroke="rgba(50,30,14,.6)" stroke-width=".8"/><path class="f2" d="M0 0C3 -5 8 -5 9 1C6 7 1 6 0 0Z" fill="#a57a4b" stroke="rgba(50,30,14,.6)" stroke-width=".8"/></g>' +
      '<g class="d-wingl"><path d="M24 74C10 86 12 108 24 120C32 112 34 94 31 78Z" fill="url(#ow' + u + ')" ' + O + '/><path d="M20 90C22 98 24 106 26 112M26 84C28 94 29 102 30 108" fill="none" stroke="rgba(255,225,170,.3)" stroke-width="1.300" stroke-linecap="round"/></g>' +
      '<g class="d-wingr"><path d="M86 74C100 86 98 108 86 120C78 112 76 94 79 78Z" fill="url(#ow' + u + ')" ' + O + '/><path d="M90 90C88 98 86 106 84 112M84 84C82 94 81 102 80 108" fill="none" stroke="rgba(255,225,170,.3)" stroke-width="1.300" stroke-linecap="round"/></g>' +
      '<g class="d-body"><path d="M22 118C13 92 18 58 55 51C92 58 97 92 88 118C80 126 30 126 22 118Z" fill="url(#ob' + u + ')" ' + O + '/>' +
      '<ellipse cx="55" cy="95" rx="24.500" ry="27.500" fill="url(#oc' + u + ')"/><path d="' + chev + '" fill="none" stroke="#a87a45" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<g fill="#f0a23a" stroke="rgba(110,60,10,.7)" stroke-width="1.100" stroke-linejoin="round" stroke-linecap="round"><path d="M38 124c-3 0-5-1-6-3M42 125c-1 0-1-1-1-3M46 124c1-1 3-1 4-3M38 124c0 1 2 3 8 3"/><path d="M72 124c3 0 5-1 6-3M68 125c1 0 1-1 1-3M64 124c-1-1-3-1-4-3M72 124c0 1-2 3-8 3"/></g>' +
      '<g class="d-head">' +
      '<path d="M26 30L20 8L42 19Z" fill="url(#ob' + u + ')" ' + O + '/><path d="M84 30L90 8L68 19Z" fill="url(#ob' + u + ')" ' + O + '/>' +
      '<ellipse cx="55" cy="42" rx="35" ry="29" fill="url(#ob' + u + ')" ' + O + '/>' +
      '<path d="M55 20C52 26 51 31 52 36M55 20C58 26 59 31 58 36" fill="none" stroke="rgba(255,225,170,.35)" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="40.500" cy="43.500" r="16" fill="url(#oc' + u + ')" stroke="rgba(120,80,40,.55)" stroke-width="1.400"/><circle cx="69.500" cy="43.500" r="16" fill="url(#oc' + u + ')" stroke="rgba(120,80,40,.55)" stroke-width="1.400"/>' +
      '<g class="d-eyes">' + eye(41) + eye(69) + '</g>' + lid(41) + lid(69) +
      '<path d="M30 30C34 27 40 27 45 30M65 30C70 27 76 27 80 30" fill="none" stroke="#5a3a1e" stroke-width="2.600" stroke-linecap="round"/>' +
      '<g class="d-beak"><path d="M50.500 50L55 60L59.500 50C57 47.500 53 47.500 50.500 50Z" fill="#f2a63c" stroke="rgba(110,60,10,.75)" stroke-width="1.200" stroke-linejoin="round"/><path class="d-beako" d="M52 56.500Q55 63 58 56.500Z" fill="#8a3446"/></g>' +
      '</g>' +
      '<g class="d-hoots"><path class="hr1" d="M80 56C86 54 90 60 86 66" fill="none"/><path class="hr2" d="M85 49C95 46 101 58 94 69" fill="none"/><path class="hr3" d="M24 52C18 54 15 60 19 66" fill="none"/><path class="hr4" d="M19 47C9 49 4 61 11 70" fill="none"/></g>' +
      '<rect class="d-hit" x="20" y="10" width="70" height="116" rx="16" fill="transparent"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const st = A.st, now = Date.now(), all = ['is-look', 'is-hoot', 'is-fright', 'is-tilt'];
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    all.forEach(c => el.classList.remove(c));
    if (st.n === 1) A.play(el, 'is-look', 3000);
    else if (st.n === 2) A.play(el, 'is-hoot', 2400);
    else { A.play(el, 'is-fright', 2600); st.n = 0; }
  },
  idle(el) {
    const s = dcSt(el); if (Date.now() - s.last < 5000) return;
    if (Math.random() < 0.55) dcPlay(el, 'is-blink', 300); else dcPlay(el, 'is-tilt', 1800);
  }
});

registerSet({ id: 'bagoly', name: 'Bagoly', desc: 'Pufi, barna bagoly. Körülnéz, huhog, és ha háromszor megböksz, megrémül.', tip: 'Kattints többször egymás után!', parts: [{ type: 'bagoly', at: 'end' }] });
