/* ===== Díszek: repülő sárkány + füstoszlopa (saját rajz; 3D-ben lib3d-dragons2.js) =====
   Pillanatkép: a sárkány épp egy nagy adag tüzet fúj a polc szélén álló könyvekre; a belőle lett füstoszlop nekitámaszkodik a könyveknek és „tartja” őket.
   Kattintás (sárkányra): nagyot fúj (a láng megnő, a füstoszlop megduzzad). Következő kattintás: csapkod a szárnyával. A füstoszlopra kattintva megpuffan.
   A szeme követi az egeret, néha pislog. (Az id megmaradt: 'kis-sarkany', hogy a régi mentések díszei is átjöjjenek.) */
'use strict';

registerDecor({
  id: 'kis-sarkany', name: 'Repülő sárkány és füstje', hint: 'Bökd meg: nagyot fúj. Még egyszer: csapkod. A füstoszlopra kattintva megpuffan.', ar: 1.2, k: 0.95, look: true,
  svg: u => {
    const O = 'stroke="rgba(70,20,16,.6)" stroke-width="1.3" stroke-linejoin="round"';
    const CO = 'stroke="rgba(110,120,160,.55)" stroke-width="1.2"';
    return '<svg class="dc-svg fd-svg" viewBox="0 0 132 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="fb' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0603c"/><stop offset=".6" stop-color="#d03e26"/><stop offset="1" stop-color="#a42a17"/></linearGradient>' +
      '<linearGradient id="fl' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a0"/><stop offset="1" stop-color="#f4b873"/></linearGradient>' +
      '<linearGradient id="fw' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0558f"/><stop offset="1" stop-color="#8a2358"/></linearGradient>' +
      '<radialGradient id="fc' + u + '" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#dfe5f5"/><stop offset="1" stop-color="#aab6d8"/></radialGradient>' +
      '<linearGradient id="ff' + u + '" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff3a8"/><stop offset=".45" stop-color="#ffb02a"/><stop offset="1" stop-color="#e8400f"/></linearGradient>' +
      '<clipPath id="fe' + u + '"><ellipse cx="62" cy="31" rx="3.600" ry="3.900"/></clipPath></defs>' +
      '<ellipse cx="62" cy="107" rx="58" ry="3" fill="rgba(0,0,0,.35)"/>' +
      /* felhő-ágy + füstoszlop */
      '<g class="d-cl"><g class="d-pillar"><g fill="url(#fc' + u + ')" ' + CO + '><circle cx="20" cy="95" r="15"/><circle cx="47" cy="99" r="11"/><circle cx="68" cy="100" r="12"/><circle cx="92" cy="101" r="10"/><circle cx="110" cy="102" r="7"/><circle cx="19" cy="79" r="13"/><circle cx="23" cy="64" r="12"/><circle cx="18" cy="52" r="11"/></g>' +
      '<g fill="url(#fc' + u + ')"><circle cx="20" cy="95" r="14"/><circle cx="19" cy="79" r="12"/><circle cx="23" cy="64" r="11"/><circle cx="18" cy="52" r="10"/><circle cx="34" cy="99" r="11"/><circle cx="57" cy="101" r="11"/><circle cx="80" cy="101" r="11"/></g></g>' +
      '<g class="d-pcap"><g fill="#7c747e" ' + CO + '><circle cx="22" cy="42" r="10.500"/><circle cx="11" cy="35" r="8"/><circle cx="26" cy="31" r="8"/><circle cx="14" cy="26" r="6"/></g><g fill="#948c96"><circle cx="22" cy="42" r="9.500"/><circle cx="11" cy="35" r="7"/><circle cx="26" cy="31" r="7"/></g></g></g>' +
      /* láng */
      '<g class="d-flame"><path d="M60 34C50 33 40 36 28 42C38 44 46 50 62 38Z" fill="#e8400f" opacity=".75"/><path d="M60 35C51 34 42 38 33 43C42 44 50 47 61 38Z" fill="url(#ff' + u + ')"/><path d="M59 36C52 36 46 38 40 41C46 42 52 43 59 38Z" fill="#fff3a8"/></g>' +
      /* sárkány */
      '<g class="d-body">' +
      '<path d="M96 60C106 64 114 72 119 84C121 88 120 92 117 94C114 90 112 82 106 76C101 71 94 67 90 66Z" fill="url(#fb' + u + ')" ' + O + '/>' +
      '<path d="M114 93l8 -6l1 8z" fill="#ffd98a" ' + O + '/>' +
      '<g class="d-wing"><path d="M78 40C84 20 98 8 114 6C112 14 120 20 124 30C118 30 118 38 114 42C112 48 104 48 100 46C98 52 90 52 86 50Z" fill="url(#fw' + u + ')" ' + O + '/><path d="M80 42C90 26 100 14 114 7M84 46C98 34 112 26 124 31M88 50C100 44 108 42 114 42" fill="none" stroke="rgba(80,16,40,.55)" stroke-width="1.2" stroke-linecap="round"/></g>' +
      '<path d="M62 36C68 40 74 46 78 50C74 62 86 70 96 66C102 60 98 50 90 44C84 38 74 34 66 33Z" fill="url(#fb' + u + ')" ' + O + '/>' +
      '<path d="M70 52C78 60 90 66 98 64C92 70 80 68 72 60Z" fill="url(#fl' + u + ')"/>' +
      '<path d="M88 66l-3 8l7 -4M96 64l-1 9l8 -5" fill="url(#fb' + u + ')" ' + O + '/><path d="M72 50l-6 6l8 0z" fill="url(#fb' + u + ')" ' + O + '/>' +
      '<g class="d-head"><path d="M62 18C60 10 64 5 70 3C70 9 72 14 73 18Z" fill="#f3c681" ' + O + '/>' +
      '<path d="M44 33C46 24 56 20 66 22C76 24 80 34 74 42C70 46 62 46 56 42C50 40 44 38 44 33Z" fill="url(#fb' + u + ')" ' + O + '/>' +
      '<path d="M46 36C50 40 60 44 70 42C64 46 54 46 48 42Z" fill="url(#fl' + u + ')"/>' +
      '<path d="M66 24l-3 -6l7 3zM74 28l0 -7l5 5z" fill="#ffd98a" ' + O + '/>' +
      '<g class="d-eye"><ellipse cx="62" cy="31" rx="4.400" ry="4.700" fill="#7b3a10"/><g clip-path="url(#fe' + u + ')"><ellipse cx="62" cy="31" rx="3.600" ry="3.900" fill="#ffb722"/><g class="d-look"><ellipse cx="61.500" cy="31" rx="1.300" ry="3" fill="#120a06"/><circle cx="63" cy="29.500" r="1" fill="#fff"/></g><path class="d-lid" d="M57 26H67V36H57Z" fill="#d03e26"/></g></g>' +
      '<path d="M57 26C60 24 64 24 67 26" fill="none" stroke="#ffd98a" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="36" r="1.200" fill="#2a0b06"/></g>' +
      '</g>' +
      /* puffok (a füstoszlopra kattintva) */
      '<g class="d-puffs"><circle class="pf1" cx="18" cy="26" r="4"/><circle class="pf2" cx="26" cy="22" r="3.400"/><circle class="pf3" cx="10" cy="30" r="4.400"/></g>' +
      '<ellipse class="d-hit d-cl" cx="19" cy="66" rx="22" ry="38" fill="transparent"/>' +
      '</svg>';
  },
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

registerSet({ id: 'kis-sarkany', name: 'Repülő sárkány és füstje', desc: 'Piros kis sárkány repül, és épp nagy adag tüzet fúj a könyvekre: a füstoszlop nekitámaszkodik a könyveknek és tartja őket. Nagyot fúj, csapkod – és a füst is megpuffan.', tip: 'Egymás után kétszer: nagyot fúj, aztán csapkod!', parts: [{ type: 'kis-sarkany', at: 'end' }] });
