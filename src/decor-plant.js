/* ===== Díszek: cserepes pozsgás (saját rajz) =====
   Terrakotta cserép, pozsgás-rozetta és egy rügy. Kattintás: megrezzennek a levelek. Gyorsan még egyszer: kinyílik a virág. Harmadszor: katicabogár mászik át a cserépen.
   Néha magától is meglibben egy szellőtől. */
'use strict';

registerDecor({
  id: 'noveny', name: 'Cserepes pozsgás', hint: 'Kattints: megrezzen. Még egyszer: kinyílik a virága. Harmadszor katicabogár mászik rajta.', ar: 0.82, k: 0.56,
  svg: u => {
    const O = 'stroke="rgba(20,70,40,.6)" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"';
    const leaf = (a, len, w, cls, fill) => '<g transform="translate(45 72) rotate(' + a + ')"><path class="d-lf ' + cls + '" d="M0 0C' + (-w) + ' ' + (-len * 0.22) + ' ' + (-w * 1.05) + ' ' + (-len * 0.7) + ' 0 ' + (-len) + 'C' + w * 1.05 + ' ' + (-len * 0.7) + ' ' + w + ' ' + (-len * 0.22) + ' 0 0Z" fill="' + fill + '" ' + O + '/><path d="M0 -3L0 ' + dcN(-len * 0.72) + '" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.200" stroke-linecap="round"/></g>';
    let pet = '';
    for (let i = 0; i < 6; i++) pet += '<g transform="translate(45 27) rotate(' + i * 60 + ')"><path class="d-pp p' + (i + 1) + '" d="M0 0C-6.500 -4 -8 -15 0 -20.500C8 -15 6.500 -4 0 0Z" fill="url(#pk' + u + ')" stroke="rgba(150,30,80,.55)" stroke-width="1" stroke-linejoin="round"/></g>';
    const spark = (x, y, c) => '<path class="d-spk ' + c + '" d="M' + x + ' ' + (y - 4) + 'L' + (x + 1.2) + ' ' + (y - 1.2) + 'L' + (x + 4) + ' ' + y + 'L' + (x + 1.2) + ' ' + (y + 1.2) + 'L' + x + ' ' + (y + 4) + 'L' + (x - 1.2) + ' ' + (y + 1.2) + 'L' + (x - 4) + ' ' + y + 'L' + (x - 1.2) + ' ' + (y - 1.2) + 'Z" fill="#fff4b0"/>';
    return '<svg class="dc-svg pl-svg" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="pt' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cf6f43"/><stop offset=".4" stop-color="#ee9a68"/><stop offset="1" stop-color="#a94e2a"/></linearGradient>' +
      '<linearGradient id="pk' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8fb8"/><stop offset="1" stop-color="#ff5c93"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="45" cy="107.500" rx="32" ry="3.200" fill="rgba(0,0,0,.38)"/>' +
      '<g class="d-plant">' +
      '<g class="d-stem"><path d="M45 72C44 58 47 42 45 30" fill="none" stroke="#2f8a4e" stroke-width="3.600" stroke-linecap="round"/><path d="M45 56C40 52 36 52 33 54C36 58 41 59 45 56Z" fill="#3fae67" ' + O + '/>' +
      '<g class="d-flower">' + pet + '<circle cx="45" cy="27" r="4.600" fill="#ffd34a" stroke="rgba(150,100,10,.6)" stroke-width="1"/><circle cx="43.600" cy="25.600" r="1.200" fill="#fff6c8"/></g></g>' +
      leaf(-78, 26, 6.500, 'l1', '#5cc47f') + leaf(78, 26, 6.500, 'l2', '#4cb572') + leaf(-52, 34, 8, 'l3', '#69cf8b') + leaf(52, 34, 8, 'l4', '#58c07b') +
      leaf(-28, 38, 8.500, 'l5', '#7bd99a') + leaf(28, 38, 8.500, 'l6', '#6cd08d') + leaf(-8, 30, 7.500, 'l7', '#8fe3a9') + leaf(10, 28, 7, 'l8', '#82dc9f') +
      '</g>' +
      /* cserép */
      '<path d="M19 74H71L65 105Q64.500 107 62.500 107H27.500Q25.500 107 25 105Z" fill="url(#pt' + u + ')" stroke="rgba(110,50,20,.7)" stroke-width="1.400" stroke-linejoin="round"/>' +
      '<path d="M21 88L69 88" stroke="rgba(255,235,205,.8)" stroke-width="6.500"/><path d="M21 84.800L69 84.800M21 91.200L69 91.200" stroke="rgba(110,50,20,.55)" stroke-width="1"/><path d="M26 90L30 86L34 90L38 86L42 90L46 86L50 90L54 86L58 90L62 86L66 90" fill="none" stroke="#b8582f" stroke-width="1.300" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<rect x="14" y="68" width="62" height="10" rx="4" fill="url(#pt' + u + ')" stroke="rgba(110,50,20,.7)" stroke-width="1.400"/><path d="M18 71.500H72" stroke="rgba(255,225,190,.55)" stroke-width="1.600" stroke-linecap="round"/>' +
      '<g class="d-bug"><ellipse cx="0" cy="0" rx="4.600" ry="3.800" fill="#e8322b" stroke="#2a1010" stroke-width="1"/><path d="M0 -3.800V3.800" stroke="#2a1010" stroke-width="1"/><circle cx="-1.900" cy="-1" r=".9" fill="#2a1010"/><circle cx="1.900" cy="-1" r=".9" fill="#2a1010"/><circle cx="-1.700" cy="1.600" r=".8" fill="#2a1010"/><circle cx="1.700" cy="1.600" r=".8" fill="#2a1010"/><circle cx="5" cy="0" r="2.200" fill="#2a1010"/></g>' +
      '<g class="d-sparks">' + spark(24, 44, 's1') + spark(66, 36, 's2') + spark(58, 14, 's3') + spark(30, 22, 's4') + '</g>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const st = A.st, now = Date.now(), all = ['is-sway', 'is-bloom', 'is-bug', 'is-breeze'];
    st.n = now - st.last < 9000 ? st.n + 1 : 1; st.last = now;
    all.forEach(c => el.classList.remove(c));
    if (st.n === 1) A.play(el, 'is-sway', 1900);
    else if (st.n === 2) A.play(el, 'is-bloom', 4200);
    else { A.play(el, 'is-bug', 4200); st.n = 0; }
  },
  idle(el) { const s = dcSt(el); if (Date.now() - s.last < 5000) return; dcPlay(el, 'is-breeze', 2200); }
});

registerSet({ id: 'noveny', name: 'Cserepes pozsgás', desc: 'Terrakotta cserép, zöld levélrozetta és egy rózsaszín rügy. Kinyílik, ha kétszer megböksz; harmadszor egy katicabogár is megjelenik.', tip: 'Kattints kétszer gyorsan: kinyílik!', parts: [{ type: 'noveny', at: 'end' }] });
