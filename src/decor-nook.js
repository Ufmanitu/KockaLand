/* ===== Díszek: book nook – kivilágított éjszakai sikátor (saját rajz) =====
   Kis, fa dobozba zárt minivilág: éjszakai sikátor boltíves ajtóval, ablakokkal, zászlófüzérrel és utcai lámpával, a háttérben hold és csillagok.
   A lámpára kattintva fel/le kapcsolod a fényeket (mentődik). A világító jelenetre kattintva kinyílik az ajtó: meleg fény ömlik ki, egy cica kuksol ki, aztán becsukódik.
   Néha egy árnyék átsétál az ablakban, a zászlók meglibbennek. */
'use strict';

/* a sikátor perspektívája: a (65,98) tűnőpont felé; falak: bal x=10..48, jobb x=120..82; u = mélység (0 közel … 1 távol), v = magasság (0 talaj … 1 tető) */
const nkW = (side, u, v) => { const x = side === 'L' ? 10 + 38 * u : 120 - 38 * u, yb = 158 - 41.5 * u, yt = 10 + 60.8 * u; return [x, yb + (yt - yb) * v]; };
const nkQ = (side, u0, u1, v0, v1) => 'M' + [nkW(side, u0, v0), nkW(side, u1, v0), nkW(side, u1, v1), nkW(side, u0, v1)].map(glPt).join('L') + 'Z';
const nkL = (side, u0, v0, u1, v1) => 'M' + glPt(nkW(side, u0, v0)) + 'L' + glPt(nkW(side, u1, v1));

function nkScene(u) {
  const LEAD = '#150d17';
  let s = '';
  /* ég: hold, csillagok */
  s += '<path d="M10 10H120L82 70.800H48Z" fill="url(#ns' + u + ')"/>';
  s += '<circle cx="86" cy="26" r="13" fill="rgba(255,240,190,.22)"/><circle cx="86" cy="26" r="8.500" fill="#fff1bb"/><circle cx="83.500" cy="24" r="2" fill="#f1d98a"/><circle cx="89" cy="29" r="1.300" fill="#f1d98a"/>';
  s += '<g class="d-stars" fill="#ffe680">' + [[56, 22, 2.8], [68, 40, 2], [48, 40, 2.2], [100, 40, 2.4], [38, 16, 2], [112, 22, 2.4]].map((q, i) => '<path class="d-star st' + (i + 1) + '" d="' + glStar(q[0], q[1], q[2]) + '"/>').join('') + '</g>';
  /* hátsó fal + ajtó */
  s += '<path d="M48 70.800H82V116.500H48Z" fill="url(#nb' + u + ')"/>';
  s += '<g class="d-lit"><path d="M52 76H58V83H52ZM72 76H78V83H72Z" fill="#ffd27a"/></g><path d="M52 76H58V83H52ZM72 76H78V83H72ZM55 76V83M75 76V83M52 79.500H58M72 79.500H78" fill="none" stroke="' + LEAD + '" stroke-width="1"/>';
  s += '<path d="M59 116.500V94Q59 87.500 65 87.500Q71 87.500 71 94V116.500Z" fill="#2a1a14"/>';
  s += '<g class="d-lit"><path d="M59.600 116.500V94.200Q59.600 88.200 65 88.200Q70.400 88.200 70.400 94.200V116.500Z" fill="url(#ng' + u + ')"/></g>';
  s += '<g class="d-cat"><g transform="translate(65 116.500)" fill="#120a10"><ellipse cx="0" cy="-3.500" rx="3.400" ry="3.600"/><circle cx="0" cy="-8.800" r="2.700"/><path d="M-2.600 -10.200L-2.800 -13.200L-0.800 -11.500ZM2.600 -10.200L2.800 -13.200L0.800 -11.500Z"/><path class="d-cattail" d="M2.800 -2C6 -2 7 -6 5 -8" fill="none" stroke="#120a10" stroke-width="1.300" stroke-linecap="round"/></g></g>';
  s += '<g class="d-door"><path d="M59 116.500V94Q59 87.500 65 87.500Q71 87.500 71 94V116.500Z" fill="#7a4526" stroke="' + LEAD + '" stroke-width="1"/><path d="M62 90V116.500M65 87.500V116.500M68 90V116.500" stroke="rgba(30,15,8,.55)" stroke-width=".7"/><circle cx="68.800" cy="104" r="1" fill="#e8c36a"/></g>';
  s += '<path d="M57 116.500V93Q57 85.500 65 85.500Q73 85.500 73 93V116.500" fill="none" stroke="#3a2a3e" stroke-width="2.200" stroke-linejoin="round"/>';
  /* bal fal */
  s += '<path d="M10 10L48 70.800V116.500L10 158Z" fill="url(#nl' + u + ')" stroke="' + LEAD + '" stroke-width="1.200" stroke-linejoin="round"/>';
  s += '<g stroke="#241526" stroke-width="2" stroke-linecap="round" fill="none">' + nkL('L', 0, .3, 1, .3) + nkL('L', 0, .92, 1, .92) + nkL('L', .5, 0, .5, 1) + nkL('L', 1, 0, 1, 1) + nkL('L', 0.02, 0, 0.02, 1) + '</g>';
  s += '<g class="d-lit"><path d="' + nkQ('L', .12, .32, .52, .84) + '" fill="url(#ng' + u + ')"/><path d="' + nkQ('L', .58, .72, .46, .74) + '" fill="url(#ng' + u + ')"/></g>';
  s += '<g fill="none" stroke="' + LEAD + '" stroke-width="1.200" stroke-linejoin="round"><path d="' + nkQ('L', .12, .32, .52, .84) + '"/><path d="' + nkQ('L', .58, .72, .46, .74) + '"/>' + nkL('L', .22, .52, .22, .84) + nkL('L', .12, .68, .32, .68) + nkL('L', .65, .46, .65, .74) + '</g>';
  s += '<g class="d-shadow" fill="#1a0f1c"><circle cx="18.400" cy="58.200" r="2.500"/><path d="M13.800 70C13.800 62.500 23 62.500 23 70Z"/></g>';
  s += '<path d="' + nkQ('L', .04, .12, .5, .88) + '" fill="#2f6b5a" stroke="' + LEAD + '" stroke-width="1"/><path d="' + nkQ('L', .32, .4, .5, .88) + '" fill="#2f6b5a" stroke="' + LEAD + '" stroke-width="1"/>';
  s += '<path d="' + nkQ('L', .1, .34, .42, .52) + '" fill="#6a3f25" stroke="' + LEAD + '" stroke-width="1"/>';
  for (let i = 0; i < 6; i++) { const p = nkW('L', .13 + i * .035, .56); s += '<circle cx="' + dcN(p[0]) + '" cy="' + dcN(p[1]) + '" r="1.900" fill="' + ['#ff7aa8', '#ffd24a', '#ff9a6a'][i % 3] + '"/>'; }
  /* jobb fal */
  s += '<path d="M120 10L82 70.800V116.500L120 158Z" fill="url(#nr' + u + ')" stroke="' + LEAD + '" stroke-width="1.200" stroke-linejoin="round"/>';
  s += '<g stroke="#241526" stroke-width="2" stroke-linecap="round" fill="none">' + nkL('R', 0, .3, 1, .3) + nkL('R', 0, .92, 1, .92) + nkL('R', .5, 0, .5, 1) + nkL('R', 1, 0, 1, 1) + '</g>';
  s += '<g class="d-lit"><path d="' + nkQ('R', .2, .4, .5, .84) + '" fill="url(#ng' + u + ')"/><path d="' + nkQ('R', .6, .76, .46, .72) + '" fill="url(#ng' + u + ')"/></g>';
  s += '<g fill="none" stroke="' + LEAD + '" stroke-width="1.200" stroke-linejoin="round"><path d="' + nkQ('R', .2, .4, .5, .84) + '"/><path d="' + nkQ('R', .6, .76, .46, .72) + '"/>' + nkL('R', .3, .5, .3, .84) + nkL('R', .2, .67, .4, .67) + nkL('R', .68, .46, .68, .72) + '</g>';
  /* talaj */
  s += '<path d="M10 158H120L82 116.500H48Z" fill="url(#nq' + u + ')" stroke="' + LEAD + '" stroke-width="1.200" stroke-linejoin="round"/>';
  let cob = '';
  for (let k = 1; k < 6; k++) { const xn = 10 + k * 18.33, xf = xn + (65 - xn) * (41.5 / 60); cob += 'M' + dcN(xn) + ' 158L' + dcN(xf) + ' 116.500'; }
  [.12, .28, .45, .62, .8].forEach(t => { const y = 158 - 41.5 * t, x0 = 10 + 38 * t; cob += 'M' + dcN(x0) + ' ' + dcN(y) + 'H' + dcN(120 - 38 * t); });
  s += '<path d="' + cob + '" fill="none" stroke="rgba(10,6,16,.5)" stroke-width="1"/>';
  s += '<g class="d-lit"><path class="d-spill" d="M59 116.500H71L92 158H44Z" fill="url(#nspill' + u + ')"/><ellipse cx="100" cy="151" rx="30" ry="8" fill="url(#nhh' + u + ')"/></g>';
  /* zászlófüzér */
  let flags = '';
  const cols = ['#ff7aa8', '#ffd24a', '#6ad0c0', '#ff9a6a', '#9a8cff'];
  for (let i = 0; i < 9; i++) { const t = (i + 0.7) / 9.4, x = (1 - t) * (1 - t) * 18 + 2 * t * (1 - t) * 65 + t * t * 112, y = (1 - t) * (1 - t) * 36 + 2 * t * (1 - t) * 60 + t * t * 38; flags += '<path class="d-flag f' + (i + 1) + '" d="M' + dcN(x - 3.700) + ' ' + dcN(y) + 'H' + dcN(x + 3.700) + 'L' + dcN(x) + ' ' + dcN(y + 8.500) + 'Z" fill="' + cols[i % 5] + '" stroke="' + LEAD + '" stroke-width=".8" stroke-linejoin="round"/>'; }
  s += '<path d="M18 36Q65 60 112 38" fill="none" stroke="#1d121f" stroke-width="1.200"/>' + flags;
  /* utcai lámpa */
  s += '<g class="d-lit"><circle class="d-lglow" cx="104" cy="62" r="36" fill="url(#nlh' + u + ')"/></g>';
  s += '<g fill="#150d17" stroke="rgba(190,180,215,.3)" stroke-width=".6"><rect x="102" y="70" width="4" height="82" rx="1"/><path d="M98 152H110L108 146H100Z"/><rect x="100.500" y="138" width="7" height="3" rx="1"/><path d="M96 70Q96 66 100 66H108Q112 66 112 70Z"/></g>';
  s += '<path d="M98.500 66L99.500 51H108.500L109.500 66Z" fill="#2a2030" stroke="#0c0710" stroke-width=".8"/><g class="d-lit"><path d="M100.300 65L101 52.500H107L107.700 65Z" fill="url(#ng' + u + ')"/></g><path d="M97 51L104 43L111 51Z" fill="#150d17" stroke="rgba(190,180,215,.3)" stroke-width=".6"/><circle cx="104" cy="42" r="1.800" fill="#e8c36a"/>';
  s += '<path d="M103.200 52.500V64.500M104.800 52.500V64.500" stroke="rgba(10,6,16,.65)" stroke-width=".7"/>';
  s += '<ellipse class="d-hit d-sw" cx="104" cy="60" rx="12" ry="22" fill="transparent"/>';
  return s;
}

registerDecor({
  id: 'book-nook', name: 'Book nook: éjszakai sikátor', hint: 'A lámpára kattintva fel/le kapcsolod a fényt. A jelenetre kattintva kinyílik az ajtó.', ar: 130 / 170, k: 0.94,
  svg: u => {
    return '<svg class="dc-svg nk-svg" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<clipPath id="nc' + u + '"><path d="M10 10H120V158H10Z"/></clipPath>' +
      '<linearGradient id="nw' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6338"/><stop offset=".5" stop-color="#5c3a1e"/><stop offset="1" stop-color="#2f1c0e"/></linearGradient>' +
      '<linearGradient id="ns' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a52"/><stop offset=".55" stop-color="#3d3a8e"/><stop offset="1" stop-color="#cf78a0"/></linearGradient>' +
      '<linearGradient id="nb' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e5a86"/><stop offset="1" stop-color="#47385c"/></linearGradient>' +
      '<linearGradient id="nl' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f2340"/><stop offset="1" stop-color="#6a5584"/></linearGradient>' +
      '<linearGradient id="nr' + u + '" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#34273f"/><stop offset="1" stop-color="#6f5a82"/></linearGradient>' +
      '<linearGradient id="nq' + u + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#241a2d"/><stop offset="1" stop-color="#5d4a70"/></linearGradient>' +
      '<linearGradient id="ng' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".6" stop-color="#ffc864"/><stop offset="1" stop-color="#ff9e44"/></linearGradient>' +
      '<linearGradient id="nspill' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc864" stop-opacity=".55"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="nlh' + u + '"><stop offset="0" stop-color="#ffd980" stop-opacity=".7"/><stop offset=".5" stop-color="#ffb457" stop-opacity=".22"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="nhh' + u + '"><stop offset="0" stop-color="#ffc060" stop-opacity=".45"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<ellipse class="d-halo" cx="65" cy="95" rx="78" ry="90" fill="url(#nhh' + u + ')"/>' +
      '<ellipse cx="65" cy="168" rx="56" ry="3.400" fill="rgba(0,0,0,.4)"/>' +
      '<path d="M2 9Q2 2 9 2H121Q128 2 128 9V161Q128 168 121 168H9Q2 168 2 161Z" fill="url(#nw' + u + ')" stroke="rgba(255,225,170,.25)" stroke-width="1"/>' +
      '<g clip-path="url(#nc' + u + ')">' + nkScene(u) + '<rect class="d-dim" x="10" y="10" width="110" height="148" fill="#070514"/></g>' +
      '<path d="M10 10H120V158H10Z" fill="none" stroke="#120a06" stroke-width="2.600" stroke-linejoin="round"/>' +
      '<path d="M6.500 160V9.500" fill="none" stroke="rgba(255,225,170,.22)" stroke-width="1.200"/>' +
      '<rect class="d-hit d-sw" x="94" y="38" width="20" height="46" fill="transparent"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const lamp = ev.detail !== 0 && ev.target.closest && ev.target.closest('.d-sw');
    if (lamp) { const on = A.toggle(el); el.classList.remove('is-door'); A.play(el, on ? 'is-lit' : 'is-dark', 900); return; }
    if (!A.on) { A.toggle(el); A.play(el, 'is-lit', 900); return; }
    A.play(el, 'is-door', 3800);
  },
  idle(el) {
    if (el.classList.contains('is-off')) return;
    const r = Math.random();
    if (r < 0.4) dcPlay(el, 'is-bunting', 2400); else if (r < 0.7) dcPlay(el, 'is-twinkle', 1800); else dcPlay(el, 'is-pass', 2600);
  }
});

registerSet({ id: 'book-nook', name: 'Book nook: éjszakai sikátor', desc: 'Kis, kivilágított minivilág fa dobozban: boltíves ajtó, ablakok, zászlófüzér és egy utcai lámpa. A lámpával kapcsolod a fényt.', tip: 'Kattints a jelenetre: kinyílik az ajtó, kikukucskál a cica.', parts: [{ type: 'book-nook', at: 'start' }] });
