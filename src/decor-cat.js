/* ===== Díszek: alvó macska (saját rajz) =====
   Szürke cirmos cica, összegömbölyödve alszik a polcon (néha horkol: z-betűk, szuszog, a füle megrebben).
   Kattintás: felébred (ásít, kinyitja a szemét, követi az egeret), majd visszaalszik. Gyorsan még egyszer: dorombol (szívek). Harmadszor: mérges (füle hátra, farka csapkod). */
'use strict';

registerDecor({
  id: 'macska', name: 'Alvó macska', hint: 'Ébreszd fel! Simogasd meg (még egyszer kattintva dorombol). Háromszor már morcos.', ar: 1.56, k: 0.62, look: true,
  svg: u => {
    const O = 'stroke="rgba(40,40,56,.7)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
    const open = x => '<g class="d-look' + (x < 30 ? ' d-eye' : '') + '"><ellipse cx="' + x + '" cy="58" rx="5.3" ry="5.8" fill="#c0ee6f" stroke="#2c3a16" stroke-width="1.2"/><ellipse cx="' + x + '" cy="58" rx="1.7" ry="4.6" fill="#15180e"/><circle cx="' + (x - 1.8) + '" cy="55.6" r="1.3" fill="#fff" opacity=".85"/></g>';
    const z = (x, y, s, c) => '<path class="d-z ' + c + '" d="M' + x + ' ' + y + 'h' + 7 * s + 'l' + (-7 * s) + ' ' + 8 * s + 'h' + 7 * s + '" fill="none" stroke="#cfe6ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
    const heart = (x, y, c) => '<path class="d-heart ' + c + '" d="M' + x + ' ' + y + 'c-3-4.200-8.500-1.200-5.200 3.200c1.700 2.200 5.200 4.600 5.200 4.600s3.500-2.400 5.200-4.600c3.300-4.400-2.200-7.400-5.200-3.200z" fill="#ff6f9c" stroke="rgba(120,20,50,.5)" stroke-width=".8"/>';
    return '<svg class="dc-svg ct-svg" viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="cb' + u + '" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#b9b9c6"/><stop offset=".55" stop-color="#8e8e9d"/><stop offset="1" stop-color="#6c6c7c"/></linearGradient>' +
      '<linearGradient id="cm' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ec"/><stop offset="1" stop-color="#e3dccd"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="72" cy="87.500" rx="62" ry="3.400" fill="rgba(0,0,0,.4)"/>' +
      '<g class="d-body"><path d="M17 82C10 62 28 34 66 31C104 28 128 46 128 70C128 83 122 87 112 87L28 87C21 87 18 85 17 82Z" fill="url(#cb' + u + ')" ' + O + '/>' +
      '<path d="M54 34C52 42 54 50 58 56M70 32.500C68 42 70 52 74 58M86 32.500C85 43 87 52 91 58M102 36C101 46 103 54 107 60M119 50C118 57 119 63 122 68" fill="none" stroke="rgba(52,52,70,.5)" stroke-width="4.200" stroke-linecap="round"/>' +
      '<path d="M40 44C58 33 88 30 108 38" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g class="d-tail"><path d="M121 80C134 84 124 90 98 88C78 87 66 90 54 88" fill="none" stroke="rgba(40,40,56,.7)" stroke-width="11.500" stroke-linecap="round"/><path d="M121 80C134 84 124 90 98 88C78 87 66 90 54 88" fill="none" stroke="url(#cb' + u + ')" stroke-width="9" stroke-linecap="round"/><path d="M62 88.500C58 89 56 88.500 54 88" fill="none" stroke="#454556" stroke-width="9" stroke-linecap="round"/><path d="M103 81.500L105 91M114 82L116 91.500M92 81L93 90.500" fill="none" stroke="rgba(52,52,70,.5)" stroke-width="2.600" stroke-linecap="round"/></g>' +
      /* fej */
      '<g class="d-head">' +
      '<g class="d-earl"><path d="M14 52L12 27L33 42Z" fill="url(#cb' + u + ')" ' + O + '/><path d="M17.500 47L16.500 33L28 41Z" fill="#f0a3b4"/></g>' +
      '<g class="d-earr"><path d="M58 52L60 27L39 42Z" fill="url(#cb' + u + ')" ' + O + '/><path d="M54.500 47L55.500 33L44 41Z" fill="#f0a3b4"/></g>' +
      '<ellipse cx="36" cy="60" rx="25" ry="21.500" fill="url(#cb' + u + ')" ' + O + '/>' +
      '<path d="M36 40.500V47M30 41.500L31 47M42 41.500L41 47M11.500 58L17 59M11.500 64L17 63M60.500 58L55 59M60.500 64L55 63" fill="none" stroke="rgba(52,52,70,.55)" stroke-width="2.200" stroke-linecap="round"/>' +
      '<ellipse cx="36" cy="68.500" rx="12" ry="8" fill="url(#cm' + u + ')"/>' +
      '<path class="d-closed" d="M21.500 58.500Q27 63.500 32.500 58.500M39.500 58.500Q45 63.500 50.500 58.500" fill="none" stroke="#2a2a3a" stroke-width="1.900" stroke-linecap="round"/>' +
      '<g class="d-open">' + open(27) + open(45) + '</g>' +
      '<g class="d-brows" fill="none" stroke="#2a2a3a" stroke-width="2.600" stroke-linecap="round"><path d="M21 53L33 58M51 53L39 58"/></g>' +
      '<path d="M33.500 65H38.500L36 68Z" fill="#ee8fa4" stroke="rgba(120,40,60,.6)" stroke-width=".8" stroke-linejoin="round"/><path class="d-smile" d="M36 68C35 72 31.500 72.500 29.500 70.500M36 68C37 72 40.500 72.500 42.500 70.500" fill="none" stroke="#3a3040" stroke-width="1.400" stroke-linecap="round"/><ellipse class="d-yawn" cx="36" cy="72" rx="5.500" ry="5.500" fill="#8a3446" stroke="#3a3040" stroke-width="1.200"/>' +
      '<path d="M22 67L5 63.500M22 70L6 72M50 67L67 63.500M50 70L66 72" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1" stroke-linecap="round"/>' +
      '</g>' +
      /* mancsok */
      '<g class="d-paws"><ellipse cx="22" cy="83.500" rx="10" ry="5.500" fill="url(#cm' + u + ')" ' + O + '/><ellipse cx="48" cy="83.500" rx="10" ry="5.500" fill="url(#cm' + u + ')" ' + O + '/><path d="M18 84V80.500M22 84.500V81M26 84V80.500M44 84V80.500M48 84.500V81M52 84V80.500" stroke="rgba(52,52,70,.45)" stroke-width="1.100" stroke-linecap="round"/></g>' +
      '<g class="d-zs">' + z(66, 32, 1, 'z1') + z(76, 20, 1.2, 'z2') + z(88, 7, 1.4, 'z3') + '</g>' +
      '<g class="d-hearts">' + heart(60, 30, 'h1') + heart(74, 24, 'h2') + heart(48, 24, 'h3') + '</g>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const st = A.st, now = Date.now(), all = ['is-wake', 'is-purr', 'is-grump', 'is-snore', 'is-twitch'];
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    all.forEach(c => el.classList.remove(c));
    if (st.n === 1) A.play(el, 'is-wake', 3600);
    else if (st.n === 2) A.play(el, 'is-purr', 3000);
    else { A.play(el, 'is-grump', 2900); st.n = 0; }
  },
  idle(el) {
    const s = dcSt(el); if (Date.now() - s.last < 5000) return;
    if (Math.random() < 0.5) dcPlay(el, 'is-snore', 3600); else dcPlay(el, 'is-twitch', 1100);
  }
});

registerSet({ id: 'macska', name: 'Alvó macska', desc: 'Szürke cirmos cica, aki a polcon alszik. Felébresztheted, megsimogathatod – de ne bosszantsd háromszor!', tip: 'Kattints: felébred, ásít, körülnéz.', parts: [{ type: 'macska', at: 'start' }] });
