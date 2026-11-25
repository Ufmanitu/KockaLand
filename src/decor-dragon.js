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
  id: 'sarkany-fekvo', name: 'Fekvő sárkány', hint: 'Bökd meg az orrát! Háromszor: tüzet okád. Ha csak megsimogatod, dorombol.', ar: 1.71, k: 0.82, look: true,
  svg: u => {
    const O = 'stroke="rgba(8,2,3,.8)" stroke-width="1" stroke-linejoin="round"', fx = 'fill="url(#lg' + u + ')"';
    /* fekvő könyv: gerinc a néző felé (arany pántok + címtábla), a jobb végén a lapok */
    const book = (x, y, w, h, c0, c1, t) => '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.4" fill="' + c1 + '" ' + O + '/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + (w - 5) + '" height="' + h + '" rx="1.4" fill="' + c0 + '"/><rect x="' + x + '" y="' + y + '" width="' + (w - 5) + '" height="' + (h * 0.32) + '" rx="1.2" fill="rgba(255,235,200,.12)"/>' +
      '<rect x="' + (x + w - 5) + '" y="' + (y + 1.2) + '" width="4.2" height="' + (h - 2.4) + '" fill="#e8dcc0"/><path d="M' + (x + w - 4) + ' ' + (y + 3) + 'h3.2M' + (x + w - 4) + ' ' + (y + h / 2) + 'h3.2M' + (x + w - 4) + ' ' + (y + h - 3) + 'h3.2" stroke="rgba(110,90,60,.5)" stroke-width=".3"/>' +
      [0.07, 0.15, 0.78, 0.86].map(k => '<rect x="' + (x + (w - 5) * k) + '" y="' + y + '" width="1.1" height="' + h + '" fill="#d9b25a" opacity=".85"/>').join('') +
      '<rect x="' + (x + (w - 5) * 0.28) + '" y="' + (y + h * 0.2) + '" width="' + ((w - 5) * 0.44) + '" height="' + (h * 0.6) + '" rx=".6" fill="rgba(10,4,4,.38)" stroke="#d9b25a" stroke-width=".35"/>' +
      '<text x="' + (x + (w - 5) * 0.5) + '" y="' + (y + h * 0.63) + '" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="' + (h * 0.36) + '" fill="#e2c277" letter-spacing=".4">' + t + '</text></g>';
    const spine = [[70, 11.5, 5], [76.5, 17, 5.4], [83.5, 23.2, 5.6], [91, 27.8, 5.6], [99, 30, 5.4], [107, 30.2, 5.2], [115, 29.6, 5], [123, 29.8, 5], [131, 30.8, 5], [139, 32, 4.8], [147, 33.8, 4.6], [155, 36.2, 4.4], [164, 39.4, 4.2], [173, 42, 3.8], [182, 44, 3.4], [190, 46, 3], [197, 48.6, 2.6]]
      .map(q => 'M' + (q[0] - 2.3) + ' ' + (q[1] + 1.2) + 'L' + (q[0] + 1.3) + ' ' + (q[1] - q[2]) + 'L' + (q[0] + 2.6) + ' ' + (q[1] + 1.2) + 'Z').join('');
    const bone = '#241512', tip = '#cdbb92', claw = (x, y) => '<path d="M' + x + ' ' + (y - 1.4) + 'l-2.2 1.6l.4 1.2l2.4 -.8z" fill="#eadcc0" stroke="rgba(30,15,10,.7)" stroke-width=".35"/>';
    return '<svg class="dc-svg dl-svg" viewBox="0 -23 210 123" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="lg' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150709"/><stop offset=".3" stop-color="#4a0a12"/><stop offset=".62" stop-color="#7c1119"/><stop offset=".88" stop-color="#8e3a1b"/><stop offset="1" stop-color="#6e3c1d"/></linearGradient>' +
      '<linearGradient id="lm' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a0710"/><stop offset=".55" stop-color="#6a0f1d"/><stop offset="1" stop-color="#9a1a28"/></linearGradient>' +
      '<linearGradient id="lh' + u + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="' + bone + '"/><stop offset=".55" stop-color="#4a3a2c"/><stop offset="1" stop-color="' + tip + '"/></linearGradient>' +
      '<linearGradient id="lv' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4a26"/><stop offset="1" stop-color="#5a331a"/></linearGradient>' +
      '<radialGradient id="le' + u + '" cx=".4" cy=".4" r=".75"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".5" stop-color="#e79a1c"/><stop offset="1" stop-color="#8a3d0a"/></radialGradient>' +
      '<pattern id="lp' + u + '" width="3.4" height="2.9" patternUnits="userSpaceOnUse"><path d="M0 2.9Q1.7 .4 3.4 2.9M-1.7 1.45Q0 -1 1.7 1.45M1.7 1.45Q3.4 -1 5.1 1.45" fill="none" stroke="rgba(0,0,0,.3)" stroke-width=".45"/></pattern>' +
      '<clipPath id="lk' + u + '"><circle cx="57" cy="3" r="3.800"/></clipPath><clipPath id="lc' + u + '"><circle cx="57" cy="3" r="3.3"/></clipPath><clipPath id="lb' + u + '"><path id="lbp' + u + '" d="M70 12C78 22 86 30 100 32C118 31 140 32 158 37C175 41 195 43 205 50C210 54 209 59 203 60C190 61 170 60 158 58C150 62 135 63.500 118 63.500L66 63.500C60 63 57 58 56 50C54 38 50 26 49 15C52 12 62 10 70 12Z"/></clipPath></defs>' +
      '<ellipse cx="104" cy="99" rx="104" ry="3.2" fill="rgba(0,0,0,.45)"/>' +
      book(0, 86, 207, 14, '#7a1e2a', '#5e1520', 'A SÁRKÁNY KÖNYVE') + book(3.500, 75.500, 199, 10.500, '#2a2d4d', '#1d2038', 'ÉJFÉLI MESÉK') + book(12, 64, 196, 11.500, '#5a4028', '#40301c', 'SÖTÉT LÁNGOK') +
      /* túlsó szárny (a test mögött, sötétebb) */
      '<path d="M104 32L112 -2Q128 0 144 8Q152 14 150 24Q140 20 134 26Q126 22 118 30Z" fill="#2c0810" ' + O + '/>' +
      /* test + nyak + farok */
      '<path d="M70 12C78 22 86 30 100 32C118 31 140 32 158 37C175 41 195 43 205 50C210 54 209 59 203 60C190 61 170 60 158 58C150 62 135 63.500 118 63.500L66 63.500C60 63 57 58 56 50C54 38 50 26 49 15C52 12 62 10 70 12Z" ' + fx + ' ' + O + '/>' +
      '<g clip-path="url(#lb' + u + ')"><rect x="40" y="0" width="175" height="70" fill="url(#lp' + u + ')"/>' +
      /* has-lemezek: a nyak elején és a has alatt */
      '<path d="M48 14C49 28 53 40 58 50C60 56 62 60 67 64L84 64C74 58 66 52 61 44C56 36 54 26 53 15Z" fill="url(#lv' + u + ')"/><path d="M66 64C90 65 130 65 152 61L152 56C130 60 92 61 66 58Z" fill="url(#lv' + u + ')"/><path d="M158 58C176 60 192 61 205 58L205 55C192 57 176 56 160 53Z" fill="#6e3c1d" opacity=".85"/>' +
      '<path d="M49.500 20h4M50.500 26h4.400M52 32h4.600M54 38h4.600M56 44h4.800M58 50h5M60.500 56h5.500M70 59.500h2M80 61h2M90 61.500h2M100 61.500h2M110 61.500h2M120 61h2M130 60.500h2M140 60h2" stroke="rgba(30,14,6,.55)" stroke-width=".7"/>' +
      '<ellipse cx="127" cy="49" rx="21" ry="12.500" fill="rgba(255,120,90,.07)"/><path d="M104 38Q130 33 154 41" fill="none" stroke="rgba(255,200,170,.1)" stroke-width="2.500"/></g>' +
      '<path d="' + spine + '" fill="#17090b" ' + O + '/>' +
      /* lábak: elöl, középen, hátul (tompa ujjak, krémszínű karmok) */
      '<path d="M58 46C56 55 59 60 61 63.500L82 63.500C79 59 80 52 82 47C75 43 64 42 58 46Z" ' + fx + ' ' + O + '/><path d="M60 63.500v-3M65 63.500v-3.500M70 63.500v-3.500M75 63.500v-3.500M80 63.500v-3" stroke="rgba(8,2,3,.6)" stroke-width=".5"/>' +
      '<path d="M83 52C90 50 97 54 98 63.500L82 63.500C81 59 81 55 83 52Z" ' + fx + ' ' + O + '/><path d="M110 40C128 34 150 42 150 54C150 60 144 63.500 138 63.500L118 63.500C108 62 104 48 110 40Z" ' + fx + ' ' + O + '/><path d="M110 40C128 34 150 42 150 54" fill="none" stroke="rgba(255,150,120,.18)" stroke-width="1.600"/>' +
      [[62, 63], [67.500, 63.500], [73, 63.500], [89, 63.500], [93.500, 63.500], [98, 63], [126, 63.500], [132, 63.500], [138, 63.500]].map(q => claw(q[0] - 1.6, q[1])).join('') +
      '<path d="M198 49C203 49 206 52 205 56" fill="none" stroke="rgba(8,2,3,.35)" stroke-width="1"/><path d="M205 51l4 5l-4 .6z" fill="#17090b" ' + O + '/>' +
      /* közeli szárny: összehajtva a háton — felkar fel a csuklóig, onnan 4 ujj hátra, íves élű hártya */
      '<g class="d-wing"><path d="M96 31L90 -11L137 -2Q143 6 152 8Q154 15 161 19Q160 25 160 30Q154 28 148 33Q138 28 126 34Q114 28 100 31Z" fill="url(#lm' + u + ')" ' + O + '/>' +
      '<path d="M90 -11L137 -2M90 -11L152 8M90 -11L161 19M90 -11L160 30" stroke="' + bone + '" stroke-width="1.400" stroke-linecap="round" fill="none"/><path d="M99 31C93 22 92 8 90 -11" fill="none" stroke="' + bone + '" stroke-width="2.600" stroke-linecap="round"/><path d="M99 31C93 22 92 8 90 -11" fill="none" stroke="rgba(255,190,150,.16)" stroke-width=".7"/>' +
      '<path d="M90 -11L86 -17L93 -12Z" fill="#eadcc0" stroke="rgba(30,15,10,.7)" stroke-width=".4"/><path d="M102 30Q122 20 150 9M104 31Q128 24 158 22" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".6"/></g>' +
      /* fej */
      '<g class="d-head">' +
      '<path d="M62 0C65 -6 71 -9 80 -10.500C74 -6 71 -3 70 3Z" fill="url(#lh' + u + ')" ' + O + '/><path d="M54 -0.500C55 -7 60 -12 69 -15C64 -11 62 -6 62 0Z" fill="url(#lh' + u + ')" ' + O + '/>' +
      '<path d="M36 8C37 4 42 1 49 -1C56 -3 64 -1 70 5C72 8 72 11 70 13C64 15 58 16 52 16C45 15 39 13 36 11Z" ' + fx + ' ' + O + '/>' +
      '<path d="M37 8C40 3 46 .5 52 0" fill="none" stroke="rgba(255,170,140,.18)" stroke-width="1.100"/><path d="M65 7.500l6.500 2l-6.200 1.800z" fill="#3a2a20" ' + O + '/><path d="M64.500 10.500l5 2.600l-5 -.1z" fill="#3a2a20" ' + O + '/>' +
      '<g class="d-jaw"><path d="M38 11.500C44 14 54 15.500 64 13.500L62 17C54 19 44 17.500 39 14.500Z" fill="#3c0b13" ' + O + '/><path d="M41 11.800l1 2l1.300 -1.700zM46 13l1 2.200l1.300 -1.800zM51 13.700l1 2l1.300 -1.700z" fill="#f0e6cc"/></g>' +
      '<path d="M39 11.500l1 -2l1.200 2zM44 12.500l1 -2l1.200 2.200z" fill="#f0e6cc"/>' +
      '<ellipse class="d-glow" cx="57" cy="3" rx="8" ry="6.500" fill="#ffb722" opacity="0"/>' +
      '<g class="d-eye"><circle cx="57" cy="3" r="3.700" fill="#1a0a06"/><g clip-path="url(#lc' + u + ')"><circle cx="57" cy="3" r="3.300" fill="url(#le' + u + ')"/><g class="d-look"><ellipse cx="57.300" cy="3" rx=".95" ry="2.800" fill="#0c0504"/><circle cx="58.500" cy="1.400" r=".8" fill="#fff"/></g></g>' +
      '<path d="M52.500 3C53 -.2 61 -.8 61.800 3C60.500 1.500 54 1.300 52.500 3Z" fill="#3c0b13" ' + O + '/>' +
      '<g clip-path="url(#lk' + u + ')"><path class="d-lid" d="M52.800 -1.200H61.400V7.200H52.800Z" fill="#3c0b13"/></g></g>' +
      '<g class="d-brow"><path d="M51.500 .2C54 -3 60 -3 64 -.2" fill="none" stroke="#2c0810" stroke-width="1.700" stroke-linecap="round"/></g>' +
      '<ellipse class="d-nostril" cx="38.500" cy="6.200" rx="1.100" ry=".7" fill="#000"/>' +
      '<g class="d-smoke"><circle class="sm1" cx="37" cy="6.500" r="1.800"/><circle class="sm2" cx="37" cy="6.500" r="1.500"/><circle class="sm3" cx="37" cy="6.500" r="2.100"/></g>' +
      '<g class="d-sparks"><circle class="sp1" cx="35" cy="11" r="1.200"/><circle class="sp2" cx="35" cy="11" r="1"/><circle class="sp3" cx="35" cy="11" r="1.300"/></g>' +
      '</g>' +
      '<g class="d-hearts"><path class="h1" d="M44 -6c-3-5-9-2-6 3 2 3 6 5 6 5s4-2 6-5c3-5-3-8-6-3z"/><path class="h2" d="M34 -14c-2-4-7-2-5 2 2 2 5 4 5 4s3-2 5-4c2-4-3-6-5-2z"/></g>' +
      '<ellipse class="d-nose" cx="39" cy="8" rx="9" ry="7" fill="transparent"/>' +
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
