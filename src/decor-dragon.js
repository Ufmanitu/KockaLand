/* ===== Díszek: fekvő sárkány a könyvhalmon (saját rajz; 3D-ben lib3d-dragons2.js) =====
   Egész sárkány, három fekvő könyv tetején szunyókál. Orrbökés: összeráncolja a szemöldökét, füstöl; háromszor egymás után: tüzet okád.
   Máshova kattintva: dorombol (szívek). A pupilla követi az egeret, ritkán pislog, a farka megrezzen.
   Régebbi mentésekben a sárkány-pár (sarkany-fej + sarkany-farok) volt: a migráció az első fejet fekvő sárkánnyá alakítja, a farkat eldobja (lásd dragonMigrate). */
'use strict';

function dragonMigrate(list) {   // régi sárkány-pár → egy fekvő sárkány (a szétszóródott 'farok' elveszik, ha 'fej' is van; különben is kiesik)
  if (!Array.isArray(list)) return list;
  const out = [];
  list.forEach(d => {
    if (!d || typeof d !== 'object') return;
    if (d.type === 'sarkany-fej') { const n = Object.assign({}, d, { type: 'sarkany-fekvo' }); delete n.link; delete n.off; out.push(n); }
    else if (d.type === 'sarkany-farok') { /* eldobjuk */ }
    else out.push(d);
  });
  return out;
}

registerDecor({
  id: 'sarkany-fekvo', name: 'Fekvő sárkány', hint: 'Bökd meg az orrát! Háromszor: tüzet okád. Ha csak megsimogatod, dorombol.', ar: 2.1, k: 0.72, look: true,
  svg: u => {
    const O = 'stroke="rgba(10,3,4,.75)" stroke-width="1.3" stroke-linejoin="round"';
    const book = (x, y, w, h, c1, c2) => '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + c1 + '" ' + O + '/><rect x="' + (x + 3) + '" y="' + (y + 2.2) + '" width="' + (w - 5) + '" height="' + (h - 4.4) + '" rx="1" fill="#f6ecd2"/><path d="M' + (x + 5) + ' ' + (y + 4.6) + 'h' + (w - 9) + 'M' + (x + 5) + ' ' + (y + 7.4) + 'h' + (w - 9) + '" stroke="rgba(150,118,70,.45)" stroke-width=".8"/><rect x="' + x + '" y="' + y + '" width="4" height="' + h + '" rx="2" fill="' + c2 + '"/></g>';
    return '<svg class="dc-svg dl-svg" viewBox="0 0 210 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="lb' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150709"/><stop offset=".42" stop-color="#8c1016"/><stop offset="1" stop-color="#b5251f"/></linearGradient>' +
      '<linearGradient id="ll' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5683f"/><stop offset="1" stop-color="#c9362a"/></linearGradient>' +
      '<linearGradient id="lw' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d12a2c"/><stop offset="1" stop-color="#4a0912"/></linearGradient>' +
      '<radialGradient id="le' + u + '" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff3b8"/><stop offset=".5" stop-color="#ffb722"/><stop offset="1" stop-color="#c0610c"/></radialGradient>' +
      '<clipPath id="lc' + u + '"><ellipse cx="53" cy="39" rx="6.4" ry="6.8"/></clipPath></defs>' +
      '<ellipse cx="104" cy="98" rx="98" ry="3" fill="rgba(0,0,0,.4)"/>' +
      book(6, 76, 198, 22, '#2e4a78', '#1d3052') + book(10, 62, 190, 16, '#2f6b52', '#1d4a38') + book(14, 50, 184, 14, '#c79d45', '#936f23') +
      /* farok: a könyvek tetején fekszik, a vége befordul; fekete gerinc a vörös tetején */
      '<path d="M148 46C164 42 184 40 192 44C198 48 192 53 180 51" fill="none" stroke="rgba(10,3,4,.75)" stroke-width="14" stroke-linecap="round"/><path d="M148 46C164 42 184 40 192 44C198 48 192 53 180 51" fill="none" stroke="#8c1016" stroke-width="11.500" stroke-linecap="round"/><path d="M148 43C164 39 184 37 191 41" fill="none" stroke="#1a0709" stroke-width="4" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M181 51.500l-6 -2l1.500 6z" fill="#17090b" ' + O + '/>' +
      /* törzs + has + hátgerinc */
      '<path d="M62 56C56 38 74 26 104 26C134 26 158 32 160 48C162 60 150 66 130 66L84 66C72 66 64 62 62 56Z" fill="url(#lb' + u + ')" ' + O + '/>' +
      '<path d="M76 62C92 68 124 68 144 64C148 60 150 56 150 54C130 62 96 62 76 58Z" fill="url(#ll' + u + ')"/><path d="M92 63v4M104 64v4M116 64v4M128 63v4" stroke="rgba(190,140,60,.5)" stroke-width="1"/>' +
      '<path d="M84 29l4 -8l5 7M100 26l5 -9l5 8M118 27l5 -9l5 9M136 31l5 -8l4 9" fill="#17090b" ' + O + '/>' +
      '<path class="d-wing" d="M100 34C112 12 138 12 152 24C142 26 140 32 132 34C132 40 122 42 116 42C112 48 104 46 100 40Z" fill="url(#lw' + u + ')" ' + O + '/>' +
      /* mellső mancs */
      '<ellipse cx="50" cy="66" rx="13" ry="6" fill="url(#lb' + u + ')" ' + O + '/><path d="M42 67v3M49 68v3M56 67v3" stroke="#f7efd9" stroke-width="1.6" stroke-linecap="round"/>' +
      /* fej */
      '<g class="d-head">' +
      '<path d="M44 26C40 16 44 8 52 4C52 12 54 20 56 26Z" fill="#2a1a1d" ' + O + '/><path d="M70 28C74 18 72 10 66 6C64 14 64 22 62 28Z" fill="#2a1a1d" ' + O + '/>' +
      '<path d="M28 52C24 40 32 28 50 26C70 24 80 34 80 46C80 56 70 62 56 62C44 62 32 60 28 52Z" fill="url(#lb' + u + ')" ' + O + '/>' +
      '<path d="M26 54C24 48 28 44 34 44C34 50 32 54 26 54Z" fill="url(#lb' + u + ')" ' + O + '/>' +
      '<g class="d-jaw"><path d="M32 56C40 64 56 66 68 60C62 66 46 68 34 62Z" fill="#fbeec2" ' + O + '/></g>' +
      '<ellipse class="d-glow" cx="53" cy="39" rx="12" ry="9" fill="#ffb722" opacity="0"/>' +
      '<g class="d-eye"><ellipse cx="53" cy="39" rx="7.2" ry="7.6" fill="#7b3a10"/><g clip-path="url(#lc' + u + ')"><ellipse cx="53" cy="39" rx="6.4" ry="6.8" fill="url(#le' + u + ')"/><g class="d-look"><ellipse cx="53.500" cy="39" rx="2" ry="5" fill="#120a06"/><circle cx="56" cy="36" r="1.700" fill="#fff"/></g>' +
      '<path class="d-lid" d="M44 30H62V40H44Z" fill="#5e0d12"/></g></g>' +
      '<g class="d-brow"><path d="M44 31C49 27 58 27 63 31" fill="none" stroke="#5c1219" stroke-width="3" stroke-linecap="round"/></g>' +
      '<ellipse class="d-nostril" cx="30" cy="48" rx="1.800" ry="1.200" fill="#000"/>' +
      '<g class="d-smoke"><circle class="sm1" cx="29" cy="46" r="3"/><circle class="sm2" cx="29" cy="46" r="2.500"/><circle class="sm3" cx="29" cy="46" r="3.400"/></g>' +
      '<g class="d-sparks"><circle class="sp1" cx="26" cy="52" r="2"/><circle class="sp2" cx="26" cy="52" r="1.700"/><circle class="sp3" cx="26" cy="52" r="2.200"/></g>' +
      '</g>' +
      '<g class="d-hearts"><path class="h1" d="M44 20c-3-5-9-2-6 3 2 3 6 5 6 5s4-2 6-5c3-5-3-8-6-3z"/><path class="h2" d="M62 12c-2-4-7-2-5 2 2 2 5 4 5 4s3-2 5-4c2-4-3-6-5-2z"/></g>' +
      '<ellipse class="d-nose" cx="28" cy="48" rx="13" ry="11" fill="transparent"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const st = A.st, now = Date.now(), nose = ev.detail === 0 || (ev.target.closest && ev.target.closest('.d-nose'));
    if (nose) {
      st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
      el.classList.remove('is-pet');
      if (st.n >= 3) A.play(el, 'is-rage', 2600); else A.play(el, 'is-boop', 2100);
    } else { st.n = 0; el.classList.remove('is-boop', 'is-rage'); A.play(el, 'is-pet', 2600); }
  },
  idle(el) { const s = dcSt(el); if (Date.now() - s.last > 4000) dcPlay(el, 'is-blink', 260); }
});

registerSet({ id: 'sarkany', name: 'Fekvő sárkány', desc: 'Egész sárkány, három könyv tetején szunyókál: farka lelóg a halom szélén. Orrbökésre füstöl, háromszorra tüzet okád.', tip: 'Bökd meg az orrát!', parts: [{ type: 'sarkany-fekvo', at: 'start' }] });
