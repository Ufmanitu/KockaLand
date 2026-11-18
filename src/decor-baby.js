/* ===== Díszek: kis sárkány + felhő (saját rajz) =====
   Pufi, mentazöld kis sárkány a polcon, mellette lebegő füstfelhő.
   Kattintás (testére): prüszköl – a felhő megpuffan, apró szikra. Gyorsan még egyszer: örömében csapkod a szárnyával. Harmadszor: ásít és elalszik (z-betűk), pár másodperc múlva felébred.
   A felhőre kattintva eleredt az eső. A szeme követi az egeret, néha pislog, a farka megrezzen. */
'use strict';

registerDecor({
  id: 'kis-sarkany', name: 'Kis sárkány és felhője', hint: 'Bökd meg: prüszköl. Még egyszer: csapkod. Harmadszor elalszik. A felhőre kattintva esik az eső.', ar: 1, k: 0.66, look: true,
  svg: u => {
    const eye = x => '<g class="d-look' + (x < 40 ? ' d-eye' : '') + '"><ellipse cx="' + x + '" cy="50" rx="5.3" ry="6.7" fill="#1b2230"/><ellipse cx="' + (x + 1.8) + '" cy="47.2" rx="1.9" ry="2.3" fill="#fff"/><circle cx="' + (x - 1.6) + '" cy="53.4" r=".9" fill="#fff" opacity=".7"/></g>';
    const lid = x => '<ellipse class="d-lid" cx="' + x + '" cy="50" rx="6.4" ry="7.8" fill="#5ac4a1"/>';
    const O = 'stroke="rgba(30,70,60,.55)" stroke-width="1.4" stroke-linejoin="round"';
    const z = (x, y, s, c) => '<path class="d-z ' + c + '" d="M' + x + ' ' + y + 'h' + 7 * s + 'l' + (-7 * s) + ' ' + 8 * s + 'h' + 7 * s + '" fill="none" stroke="#bfe3ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
    return '<svg class="dc-svg bb-svg" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="bd' + u + '" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#93ecca"/><stop offset=".5" stop-color="#4fc19d"/><stop offset="1" stop-color="#2e8f74"/></linearGradient>' +
      '<linearGradient id="bl' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7da"/><stop offset="1" stop-color="#ffdc98"/></linearGradient>' +
      '<linearGradient id="bw' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3c8"/><stop offset="1" stop-color="#e0587f"/></linearGradient>' +
      '<linearGradient id="bh' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#e3c680"/></linearGradient>' +
      '<radialGradient id="bc' + u + '" gradientUnits="userSpaceOnUse" cx="94" cy="74" r="44"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#dfe6f7"/><stop offset="1" stop-color="#b3bfe0"/></radialGradient>' +
      '</defs>' +
      '<ellipse cx="52" cy="127" rx="44" ry="3.6" fill="rgba(0,0,0,.38)"/>' +
      /* farok */
      '<g class="d-tail"><path d="M24 116C10 120 3 110 6 100C8 94 14 92 17 95" fill="none" stroke="rgba(30,70,60,.55)" stroke-width="11" stroke-linecap="round"/><path d="M24 116C10 120 3 110 6 100C8 94 14 92 17 95" fill="none" stroke="url(#bd' + u + ')" stroke-width="8.6" stroke-linecap="round"/>' +
      '<path d="M16 88L24 93L14 99Z" fill="url(#bw' + u + ')" ' + O + '/></g>' +
      /* szárnyak */
      '<g class="d-wingr"><path d="M64 82C70 62 88 52 100 54C95 60 97 66 92 70C94 75 88 78 84 78C82 83 76 86 70 90Z" fill="url(#bw' + u + ')" ' + O + '/><path d="M66 82C74 70 86 62 98 56M70 86C78 78 86 74 91 71" fill="none" stroke="rgba(150,40,80,.45)" stroke-width="1.2" stroke-linecap="round"/></g>' +
      '<g class="d-wingl"><path d="M30 82C24 66 10 60 2 62C6 68 4 74 8 78C6 82 12 85 16 85C17 89 24 90 28 92Z" fill="url(#bw' + u + ')" ' + O + '/></g>' +
      /* test */
      '<g class="d-body"><path d="M20 120C13 104 17 78 38 68C56 60 76 70 77 96C78 112 72 122 60 123C46 125 28 124 20 120Z" fill="url(#bd' + u + ')" ' + O + '/>' +
      '<ellipse cx="48" cy="102" rx="14.500" ry="19" fill="url(#bl' + u + ')"/><path d="M38 92H58M36 99H60M36 106H60M38 113H58" fill="none" stroke="rgba(190,140,60,.35)" stroke-width="1"/>' +
      '<ellipse cx="26" cy="121" rx="9" ry="5" fill="url(#bd' + u + ')" ' + O + '/><ellipse cx="68" cy="121" rx="9" ry="5" fill="url(#bd' + u + ')" ' + O + '/><path d="M22 122V119M26 123V120M30 122V119M64 122V119M68 123V120M72 122V119" stroke="rgba(30,70,60,.5)" stroke-width="1" stroke-linecap="round"/>' +
      '<ellipse class="d-arml" cx="21" cy="96" rx="5.500" ry="9" fill="url(#bd' + u + ')" ' + O + ' transform="rotate(14 21 96)"/><ellipse class="d-armr" cx="74" cy="96" rx="5.500" ry="9" fill="url(#bd' + u + ')" ' + O + ' transform="rotate(-14 74 96)"/>' +
      '<path d="M40 70L44 61L48 70M50 68L54 60L57 69" fill="url(#bh' + u + ')" ' + O + '/></g>' +
      /* fej */
      '<g class="d-head">' +
      '<path d="M20 46C9 43 6 33 10 26C17 29 22 35 25 41Z" fill="url(#bw' + u + ')" ' + O + '/><path d="M73 46C84 43 87 33 83 26C76 29 71 35 68 41Z" fill="url(#bw' + u + ')" ' + O + '/>' +
      '<path d="M33 30C30 19 33 12 38 9C41 16 41 24 41 31Z" fill="url(#bh' + u + ')" ' + O + '/><path d="M60 30C63 19 60 12 55 9C52 16 52 24 52 31Z" fill="url(#bh' + u + ')" ' + O + '/>' +
      '<ellipse cx="46.500" cy="50" rx="28.500" ry="25.500" fill="url(#bd' + u + ')" ' + O + '/><ellipse cx="38" cy="36" rx="11" ry="5" fill="rgba(255,255,255,.35)" transform="rotate(-24 38 36)"/>' +
      '<ellipse cx="47" cy="59" rx="12" ry="8" fill="#a9f0d6" opacity=".85"/><ellipse cx="42.500" cy="57" rx="1.4" ry="1.1" fill="#1d5a49"/><ellipse cx="51.500" cy="57" rx="1.4" ry="1.1" fill="#1d5a49"/>' +
      '<ellipse cx="27" cy="58" rx="5.500" ry="3.300" fill="#ff9ab4" opacity=".6"/><ellipse cx="67" cy="58" rx="5.500" ry="3.300" fill="#ff9ab4" opacity=".6"/>' +
      '<g class="d-eyes">' + eye(35) + eye(58) + '</g>' + lid(35) + lid(58) +
      '<path d="M29 42C31 40 36 39.500 40 41M54 41C58 39.500 62 40 64 42" fill="none" stroke="rgba(30,70,60,.55)" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path class="d-smile" d="M41 64Q47 69 53 64" fill="none" stroke="#1d5a49" stroke-width="1.8" stroke-linecap="round"/><ellipse class="d-oh" cx="47" cy="66" rx="3.600" ry="4.400" fill="#7a2f3a"/>' +
      '</g>' +
      /* puffok + szikra + z-betűk */
      '<g class="d-puffs"><circle class="pf1" cx="52" cy="64" r="3.400"/><circle class="pf2" cx="52" cy="64" r="2.800"/><circle class="pf3" cx="52" cy="64" r="3.800"/></g>' +
      '<g class="d-sparks"><circle class="sk1" cx="52" cy="64" r="1.400"/><circle class="sk2" cx="52" cy="64" r="1.200"/><circle class="sk3" cx="52" cy="64" r="1.500"/></g>' +
      '<g class="d-zs">' + z(72, 30, 1, 'z1') + z(82, 18, 1.2, 'z2') + z(94, 5, 1.45, 'z3') + '</g>' +
      /* felhő */
      '<g class="d-cloud"><g fill="url(#bc' + u + ')" stroke="rgba(110,125,175,.55)" stroke-width="1.2"><circle cx="86" cy="86" r="13"/><circle cx="101" cy="78" r="15"/><circle cx="116" cy="88" r="12"/><circle cx="102" cy="92" r="14"/></g>' +
      '<g fill="url(#bc' + u + ')"><circle cx="86" cy="86" r="12"/><circle cx="101" cy="78" r="14"/><circle cx="116" cy="88" r="11"/><circle cx="102" cy="92" r="13"/><rect x="88" y="84" width="26" height="18" rx="6"/></g>' +
      '<path d="M82 92C86 96 92 97 98 96M99 72C104 70 110 72 113 76" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2" stroke-linecap="round"/><path d="M92 103C100 106 110 105 116 98" fill="none" stroke="rgba(120,135,190,.4)" stroke-width="1.6" stroke-linecap="round"/></g>' +
      '<g class="d-drops"><path class="r1" d="M86 100c-2.300 3.400-2.300 5 0 5.800c2.300-.8 2.300-2.400 0-5.800z"/><path class="r2" d="M98 106c-2.300 3.400-2.300 5 0 5.800c2.300-.8 2.300-2.400 0-5.800z"/><path class="r3" d="M108 102c-2.300 3.400-2.300 5 0 5.800c2.300-.8 2.300-2.400 0-5.800z"/><path class="r4" d="M114 106c-2.300 3.400-2.300 5 0 5.800c2.300-.8 2.300-2.400 0-5.800z"/><path class="r5" d="M92 108c-2.300 3.400-2.300 5 0 5.800c2.300-.8 2.300-2.400 0-5.800z"/></g>' +
      '<ellipse class="d-hit d-cl" cx="101" cy="86" rx="22" ry="17" fill="transparent"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const all = ['is-sneeze', 'is-flap', 'is-sleep', 'is-rain'];
    if (ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-cl')) { all.forEach(c => el.classList.remove(c)); A.play(el, 'is-rain', 2800); return; }
    const st = A.st, now = Date.now();
    if (el.classList.contains('is-sleep')) { el.classList.remove('is-sleep'); A.play(el, 'is-sneeze', 1600); st.n = 1; st.last = now; return; }   // felébresztés: prüszköl egyet
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    all.forEach(c => el.classList.remove(c));
    if (st.n === 1) A.play(el, 'is-sneeze', 1600);
    else if (st.n === 2) A.play(el, 'is-flap', 2000);
    else { A.play(el, 'is-sleep', 5200); st.n = 0; }
  },
  idle(el) {
    const s = dcSt(el); if (Date.now() - s.last < 5000 || el.classList.contains('is-sleep')) return;
    if (Math.random() < 0.6) dcPlay(el, 'is-blink', 300); else dcPlay(el, 'is-wag', 1200);
  }
});

registerSet({ id: 'kis-sarkany', name: 'Kis sárkány és felhője', desc: 'Pufi, mentazöld kis sárkány és egy füstfelhő. Prüszköl, csapkod, elalszik – és eleredhet az eső.', tip: 'Háromszor egymás után: elalszik!', parts: [{ type: 'kis-sarkany', at: 'end' }] });
