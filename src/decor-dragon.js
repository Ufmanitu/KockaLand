/* ===== Díszek: sárkány-pár könyvtámasz (fej + farok, saját rajz) =====
   Orrbökés: összeráncolja a szemöldökét, összehúzza a szemét, füstöl; a párja (farok) odacsap. Többszöri bökés: dühös (fogak, szikrák, dupla farokcsapás).
   A fejre kattintva (nem az orrra) dorombol: lehunyja a szemét, szívek szállnak. A pupilla követi az egeret, ritkán pislog. */
'use strict';

const DR_SKULL = 'M6 98C5 90 12 84 22 82C32 80 40 74 48 66C58 56 74 52 88 56C100 60 108 74 106 92C105 102 98 108 90 112C76 114 62 110 50 108C36 106 20 104 12 102C8 101 6 100 6 98Z';
function drScales(rng, x0, y0, x1, y1, step) {
  let s = '';
  for (let y = y0, row = 0; y < y1; y += step * 0.8, row++) for (let x = x0 + (row % 2) * step / 2; x < x1; x += step) s += 'M' + dcN(x + (rng() - 0.5) * 1.4) + ' ' + dcN(y + (rng() - 0.5) * 1.2) + 'q' + dcN(step / 2) + ' ' + dcN(step * 0.6) + ' ' + dcN(step) + ' 0';
  return s;
}
function drTeeth(x0, x1, yAt, n, len, dir, w) {
  let s = '';
  for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * i / (n - 1), y = yAt(x), hh = len * (0.75 + 0.5 * Math.sin(i * 1.7) * 0.5 + 0.25); s += 'M' + dcN(x - w) + ' ' + dcN(y) + 'L' + dcN(x + w) + ' ' + dcN(y) + 'L' + dcN(x + w * 0.1) + ' ' + dcN(y + dir * hh) + 'Z'; }
  return s;
}
function dragonBox(u) {
  return '<rect x="62" y="4" width="86" height="162" rx="5" fill="#0f0c0b"/><rect x="68" y="10" width="74" height="150" rx="2.5" fill="url(#bi' + u + ')"/>' +
    '<rect x="62.5" y="4.5" width="85" height="161" rx="4.6" fill="none" stroke="rgba(190,200,225,.22)"/><path d="M68.5 160V10.5H141" fill="none" stroke="rgba(0,0,0,.7)" stroke-width="1.4"/>' +
    '<path d="M64 8V160" stroke="rgba(255,255,255,.1)"/>';
}
function dragonDefs(u) {
  return '<defs>' +
    '<linearGradient id="sk' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#566175"/><stop offset=".3" stop-color="#2a2e38"/><stop offset=".7" stop-color="#15161b"/><stop offset="1" stop-color="#09090c"/></linearGradient>' +
    '<linearGradient id="hn' + u + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0a0a0d"/><stop offset=".6" stop-color="#2c313b"/><stop offset="1" stop-color="#6e7a90"/></linearGradient>' +
    '<radialGradient id="ir' + u + '" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="#fff3b8"/><stop offset=".42" stop-color="#ffb81f"/><stop offset="1" stop-color="#b8540a"/></radialGradient>' +
    '<linearGradient id="bi' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050404"/><stop offset="1" stop-color="#171210"/></linearGradient>' +
    '<radialGradient id="gl' + u + '"><stop offset="0" stop-color="#ffb347" stop-opacity=".95"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="fd' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050404"/><stop offset=".55" stop-color="#050404" stop-opacity=".92"/><stop offset="1" stop-color="#050404" stop-opacity="0"/></linearGradient>' +
    '<clipPath id="sc' + u + '"><path d="' + DR_SKULL + '"/></clipPath>' +
    '<clipPath id="ec' + u + '"><ellipse cx="60" cy="73.5" rx="8.6" ry="5.8" transform="rotate(-14 60 73.5)"/></clipPath>' +
    '</defs>';
}

registerDecor({
  id: 'sarkany-fej', name: 'Sárkány-fej könyvtámasz', hint: 'Bökd meg az orrát! Ha csak megsimogatod, dorombol.', ar: 150 / 170, k: 0.92, look: true,
  svg: u => {
    const r = dcRng(11), r2 = dcRng(5);
    return '<svg class="dc-svg dr-head" viewBox="0 0 150 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + dragonDefs(u) +
      dragonBox(u) +
      '<g class="d-head">' +
      /* nyak a dobozba */
      '<path d="M92 66C110 70 124 96 126 140L112 156C108 134 98 122 88 114Z" fill="#0b0b0e"/>' +
      '<path d="M92 66C108 72 120 92 124 120" fill="none" stroke="rgba(150,170,205,.28)" stroke-width="1"/>' +
      /* szarvak */
      '<path d="M70 56C74 38 90 24 110 16C102 30 98 46 96 64Z" fill="url(#hn' + u + ')"/><path d="M70 56C75 41 88 29 104 21" fill="none" stroke="rgba(170,190,225,.5)" stroke-width="1"/>' +
      '<path d="M57 62C54 49 58 38 67 31C65 42 67 52 70 60Z" fill="url(#hn' + u + ')"/>' +
      '<path d="M96 70L122 62L104 82Z" fill="url(#hn' + u + ')"/><path d="M100 84L124 84L104 96Z" fill="url(#hn' + u + ')"/>' +
      /* alsó állkapocs */
      '<g class="d-jaw"><path d="M12 103C22 108 38 112 52 114C66 118 82 118 94 112C92 126 76 134 60 132C42 130 26 119 12 103Z" fill="url(#sk' + u + ')"/>' +
      '<path d="M14 105C28 118 44 128 62 131" fill="none" stroke="rgba(160,180,215,.4)" stroke-width="1"/>' +
      '<path d="' + drTeeth(18, 58, x => 109 + (x - 12) * 0.1, 7, 4.6, -1, 1.5) + '" fill="#ddd6c6" class="d-teeth2"/></g>' +
      /* száj belső */
      '<path d="M12 102C24 106 40 108.5 56 109L92 111L90 115C70 119 40 117 14 105Z" fill="#240c0c" class="d-mouth"/>' +
      /* felső fej */
      '<path d="' + DR_SKULL + '" fill="url(#sk' + u + ')"/>' +
      '<g clip-path="url(#sc' + u + ')"><path d="' + drScales(r, 8, 58, 108, 112, 6) + '" fill="none" stroke="rgba(150,170,205,.2)" stroke-width=".7" stroke-linecap="round"/>' +
      '<path d="M30 84C46 80 58 66 76 62" fill="none" stroke="rgba(190,205,235,.3)" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="22" cy="86" rx="9" ry="3.2" fill="rgba(180,200,235,.18)" transform="rotate(-18 22 86)"/></g>' +
      '<path d="M6 98C5 90 12 84 22 82C32 80 40 74 48 66C58 56 74 52 88 56" fill="none" stroke="rgba(180,200,235,.55)" stroke-width="1.1" stroke-linecap="round"/>' +
      /* fogak (felső) */
      '<path class="d-teeth" d="' + drTeeth(14, 54, x => 102 + (x - 12) * 0.13, 8, 6.2, 1, 1.7) + '" fill="#f0ead8"/>' +
      /* arc-tüskék */
      '<path d="M74 58L82 46L84 60Z" fill="url(#hn' + u + ')"/><path d="M62 62L68 50L72 62Z" fill="url(#hn' + u + ')"/><path d="M88 66L98 58L98 72Z" fill="url(#hn' + u + ')"/>' +
      /* szem */
      '<ellipse class="d-glow" cx="60" cy="73.5" rx="17" ry="12" fill="url(#gl' + u + ')"/>' +
      '<g class="d-eye"><ellipse cx="60" cy="73.5" rx="9.2" ry="6.4" transform="rotate(-14 60 73.5)" fill="#080607"/>' +
      '<g clip-path="url(#ec' + u + ')"><ellipse cx="60" cy="73.5" rx="8" ry="5.6" transform="rotate(-14 60 73.5)" fill="url(#ir' + u + ')"/>' +
      '<g class="d-look"><ellipse class="d-pupil" cx="60.5" cy="73.4" rx="1.7" ry="5.2" transform="rotate(-14 60.5 73.4)" fill="#120a06"/><circle cx="63" cy="71" r="1.4" fill="#fff" opacity=".85"/></g>' +
      '<path class="d-lid" d="M44 60L77 54L77 72L44 72Z" fill="#17181d"/></g></g>' +
      /* szemöldök-gerinc */
      '<g class="d-brow"><path d="M38 76C46 66 58 60 78 57L77 65C62 67 50 72 44 82Z" fill="#1b1d24"/><path d="M38 76C46 66 58 60 78 57" fill="none" stroke="rgba(190,205,235,.6)" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M48 70L52 62L56 68ZM58 66L63 58L66 65ZM68 62L74 54L75 62Z" fill="#2a2e38"/></g>' +
      /* orr + füst */
      '<ellipse class="d-nostril" cx="14" cy="91" rx="3.8" ry="2.4" transform="rotate(-30 14 91)" fill="#020202"/><path d="M10.2 89.6C12 87.4 15.8 87.4 18 89.8" fill="none" stroke="rgba(200,215,240,.55)" stroke-width=".9" stroke-linecap="round"/><ellipse cx="13.2" cy="91.4" rx="1.3" ry=".7" fill="rgba(255,140,70,.35)" transform="rotate(-30 13.2 91.4)"/>' +
      '<g class="d-smoke"><circle class="sm1" cx="11" cy="89" r="2.6"/><circle class="sm2" cx="11" cy="89" r="2.2"/><circle class="sm3" cx="11" cy="89" r="3"/></g>' +
      '<g class="d-sparks"><circle class="sp1" cx="11" cy="90" r="1"/><circle class="sp2" cx="11" cy="90" r=".9"/><circle class="sp3" cx="11" cy="90" r="1.1"/><circle class="sp4" cx="11" cy="90" r=".8"/></g>' +
      '</g>' +
      /* karom a polc szélén */
      '<g class="d-claw"><path d="M96 140C84 130 64 130 52 136C43 140 40 148 47 152C58 158 82 156 100 152Z" fill="url(#sk' + u + ')"/>' +
      '<path d="M54 137C45 133 33 135 25 143L35 142C41 141 46 142 51 144Z" fill="url(#sk' + u + ')"/><path d="M52 145C42 144 30 149 23 157L34 154C40 153 46 153 52 153Z" fill="url(#sk' + u + ')"/><path d="M62 150C54 152 46 158 44 164L53 160C57 158 62 158 66 158Z" fill="url(#sk' + u + ')"/>' +
      '<path d="M25 143L19 150L29 145ZM23 157L16 163L28 158ZM44 164L40 169L50 164Z" fill="#cfc8b6"/>' +
      '<path d="M54 134C66 129 84 131 96 140" fill="none" stroke="rgba(180,200,235,.45)" stroke-width="1"/></g>' +
      /* szívek (simogatáshoz) */
      '<g class="d-hearts"><path class="h1" d="M44 40c-3-5-9-2-6 3 2 3 6 5 6 5s4-2 6-5c3-5-3-8-6-3z"/><path class="h2" d="M58 34c-2-4-7-2-5 2 2 2 5 4 5 4s3-2 5-4c2-4-3-6-5-2z"/></g>' +
      /* orr-célpont (bökés) */
      '<ellipse class="d-nose" cx="15" cy="91" rx="15" ry="13" fill="transparent"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const st = A.st, now = Date.now(), nose = ev.detail === 0 || (ev.target.closest && ev.target.closest('.d-nose'));
    const tail = A.linked(el)[0];
    if (nose) {
      st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
      el.classList.remove('is-pet');
      if (st.n >= 3) { A.play(el, 'is-rage', 2600); if (tail) { A.at(() => A.play(tail, 'is-slam', 1500), 380); } }
      else { A.play(el, 'is-boop', 2100); if (tail) A.at(() => A.play(tail, 'is-flick', 1100), 420); }
    } else { st.n = 0; el.classList.remove('is-boop', 'is-rage'); A.play(el, 'is-pet', 2600); }
  },
  idle(el) { const s = dcSt(el); if (Date.now() - s.last > 4000) dcPlay(el, 'is-blink', 260); }
});

/* ---- farok ---- */
function drTailGeom() {
  const P = [[38, 34], [48, 116], [92, 152], [140, 148]];
  const pt = t => { const m = 1 - t; return [m * m * m * P[0][0] + 3 * m * m * t * P[1][0] + 3 * m * t * t * P[2][0] + t * t * t * P[3][0], m * m * m * P[0][1] + 3 * m * m * t * P[1][1] + 3 * m * t * t * P[2][1] + t * t * t * P[3][1]]; };
  const tg = t => { const e = 0.004, a = pt(Math.max(0, t - e)), b = pt(Math.min(1, t + e)), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const hw = t => 17 * Math.pow(1 - t, 0.8) + 2.6;
  const N = 44, up = [], lo = [], rings = [];
  for (let i = 0; i <= N; i++) { const t = i / N, p = pt(t), d = tg(t), n = [d[1], -d[0]], w = hw(t); up.push([p[0] + n[0] * w, p[1] + n[1] * w]); lo.push([p[0] - n[0] * w, p[1] - n[1] * w]); if (i % 3 === 1) rings.push([up[i], lo[i]]); }
  const spikes = [];
  for (let t = 0.2; t < 0.93; t += 0.07) { const a = pt(t - 0.022), b = pt(t + 0.022), d = tg(t), n = [d[1], -d[0]], w = hw(t), len = 17 * Math.pow(1 - t, 0.7) + 5; const ua = [a[0] + n[0] * hw(t - 0.022), a[1] + n[1] * hw(t - 0.022)], ub = [b[0] + n[0] * hw(t + 0.022), b[1] + n[1] * hw(t + 0.022)], p = pt(t); spikes.push([ua, ub, [p[0] + n[0] * (w + len) + d[0] * len * 0.55, p[1] + n[1] * (w + len) + d[1] * len * 0.55]]); }
  return { up, lo, rings, spikes, end: pt(1), endT: tg(1) };
}
const DR_TAIL = drTailGeom();
registerDecor({
  id: 'sarkany-farok', name: 'Sárkány-farok könyvtámasz', hint: 'Ha a fej megbosszankodik, ez csap oda. Rá is kattinthatsz.', ar: 150 / 170, k: 0.92,
  svg: u => {
    const G = DR_TAIL, f = p => dcN(p[0]) + ' ' + dcN(p[1]);
    const body = 'M' + G.up.map(f).join('L') + 'L' + G.lo.slice().reverse().map(f).join('L') + 'Z';
    const spikes = G.spikes.map(s => 'M' + f(s[0]) + 'L' + f(s[2]) + 'L' + f(s[1]) + 'Z').join('');
    const rings = G.rings.map(q => 'M' + f(q[0]) + 'L' + f(q[1])).join('');
    const e = G.end, d = G.endT, nn = [d[1], -d[0]], q = (a, b) => f([e[0] + d[0] * a + nn[0] * b, e[1] + d[1] * a + nn[1] * b]);
    const tip = 'M' + q(-7, 0) + 'L' + q(-4, 11) + 'L' + q(11, 0) + 'L' + q(-4, -11) + 'Z';
    const hl = 'M' + G.up.slice(6, 40).map((p0, i) => f([(p0[0] * 2 + G.lo[i + 6][0]) / 3, (p0[1] * 2 + G.lo[i + 6][1]) / 3])).join('L');
    return '<svg class="dc-svg dr-tail" viewBox="0 0 150 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + dragonDefs(u) +
      '<g transform="translate(150 0) scale(-1 1)">' + dragonBox(u) + '</g>' +
      '<g class="d-tailg">' +
      '<path d="' + spikes + '" fill="url(#hn' + u + ')"/>' +
      '<path d="' + body + '" fill="url(#sk' + u + ')"/>' +
      '<path d="' + rings + '" stroke="rgba(150,170,205,.28)" stroke-width="1" fill="none"/>' +
      '<path d="M' + G.up.map(f).join('L') + '" fill="none" stroke="rgba(190,205,235,.55)" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="' + hl + '" fill="none" stroke="rgba(190,205,235,.22)" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="' + tip + '" fill="url(#hn' + u + ')"/><path d="' + tip + '" fill="none" stroke="rgba(190,205,235,.5)" stroke-width=".9" stroke-linejoin="round"/>' +
      '</g>' +
      '<rect x="8" y="10" width="74" height="86" fill="url(#fd' + u + ')" pointer-events="none"/>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const head = A.linked(el)[0]; A.play(el, 'is-wag', 1300);
    if (head) A.at(() => A.play(head, 'is-glance', 1500), 200);
  }
});

registerSet({ id: 'sarkany', name: 'Sárkány-pár könyvtámasz', desc: 'Fekete gyanta sárkány: a feje és a farka egy-egy dobozból nyúlik ki. A könyvek közé állítható.', tip: 'Bökd meg az orrát!', parts: [{ type: 'sarkany-fej', at: 'start' }, { type: 'sarkany-farok', at: 'end' }] });
