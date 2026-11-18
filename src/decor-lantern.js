/* ===== Díszek: gyertyás lámpás (saját rajz) =====
   Vaskeretes, üveges lámpás égő gyertyával. Kattintásra elfújja a lángot (füstszál száll fel, az üveg elsötétül), újra kattintva meggyújtja (szikrák, fellobbanó láng).
   Az állapot (ég / nem ég) mentődik. Néha megrebben a lángja. */
'use strict';

registerDecor({
  id: 'lampas', name: 'Gyertyás lámpás', hint: 'Kattints: elfújja a gyertyát, még egyszer: meggyújtja.', ar: 100 / 170, k: 0.84,
  svg: u => {
    return '<svg class="dc-svg ln-svg" viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="lh' + u + '"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb457" stop-opacity=".2"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="lf' + u + '" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fff2b0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffc561" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="li' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a505d"/><stop offset=".45" stop-color="#1e2128"/><stop offset="1" stop-color="#0d0e12"/></linearGradient>' +
      '<linearGradient id="lg' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b5"/><stop offset=".55" stop-color="#ffc66b"/><stop offset="1" stop-color="#ff9d3f"/></linearGradient>' +
      '<linearGradient id="ld' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b5266"/><stop offset="1" stop-color="#232733"/></linearGradient>' +
      '<linearGradient id="lw' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9c08e"/><stop offset=".4" stop-color="#fff6dc"/><stop offset="1" stop-color="#cdb078"/></linearGradient>' +
      '<linearGradient id="lb' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c36a"/><stop offset="1" stop-color="#8d6a22"/></linearGradient>' +
      '<linearGradient id="ll' + u + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a1a"/><stop offset=".55" stop-color="#ffb02e"/><stop offset="1" stop-color="#ffe27a"/></linearGradient>' +
      '</defs>' +
      '<circle class="d-halo" cx="50" cy="96" r="78" fill="url(#lh' + u + ')"/>' +
      '<ellipse cx="50" cy="151" rx="40" ry="3.6" fill="rgba(0,0,0,.4)"/>' +
      /* gyűrű + sapka */
      '<path d="M40 24C39 6 61 6 60 24" fill="none" stroke="#14161b" stroke-width="3.4" stroke-linecap="round"/><path d="M41 22C40.5 9 59 9 59 22" fill="none" stroke="rgba(180,190,215,.35)" stroke-width="1"/>' +
      '<path d="M19 47C24 33 37 24 50 21C63 24 76 33 81 47Z" fill="url(#li' + u + ')" stroke="rgba(170,185,215,.4)" stroke-width="1"/><path d="M27 41C33 33 41 28 50 26" fill="none" stroke="rgba(190,205,235,.5)" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="50" cy="19.5" r="3.6" fill="url(#lb' + u + ')"/>' +
      '<rect x="16" y="46" width="68" height="7" rx="2" fill="url(#li' + u + ')" stroke="rgba(170,185,215,.4)" stroke-width="1"/>' +
      /* üveg: sötét + világító réteg */
      '<rect class="d-glass-dark" x="24" y="53" width="52" height="76" fill="url(#ld' + u + ')"/>' +
      '<rect class="d-glass-lit" x="24" y="53" width="52" height="76" fill="url(#lg' + u + ')"/>' +
      '<ellipse class="d-fglow" cx="50" cy="92" rx="30" ry="34" fill="url(#lf' + u + ')"/>' +
      /* gyertya */
      '<path d="M43 98L43 126C43 128.5 57 128.5 57 126L57 98Z" fill="url(#lw' + u + ')"/><ellipse cx="50" cy="98" rx="7" ry="1.9" fill="#fffaf0"/><path d="M52.5 99.2C54.2 103 54.4 107 53 109.5" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M50 98L50 94.6" stroke="#2a1a10" stroke-width="1.5" stroke-linecap="round"/><circle class="d-wick" cx="50" cy="94.4" r="1.3" fill="#ff6a1a"/>' +
      '<g class="d-flame"><path d="M50 62C58.5 74.5 60.6 86 56.4 93C54.4 96.8 45.6 96.8 43.6 93C39.4 86 41.5 74.5 50 62Z" fill="url(#ll' + u + ')"/>' +
      '<path d="M50 73C54.4 80.5 55.4 87 53.4 91.4C52.4 93.6 47.6 93.6 46.6 91.4C44.6 87 45.6 80.5 50 73Z" fill="#ffe680"/><path d="M50 82C52 85.6 52.2 89 50.8 91.4C50.4 92.2 49.6 92.2 49.2 91.4C47.8 89 48 85.6 50 82Z" fill="#fffbe6"/>' +
      '<ellipse cx="50" cy="94.4" rx="3.2" ry="2" fill="#6aa6ff" opacity=".55"/></g>' +
      /* üvegkeret: rudak + szalag */
      '<g fill="url(#li' + u + ')" stroke="rgba(170,185,215,.35)" stroke-width=".8"><rect x="22" y="53" width="5" height="78" rx="1.2"/><rect x="73" y="53" width="5" height="78" rx="1.2"/><rect x="36.6" y="53" width="2.2" height="76"/><rect x="61.2" y="53" width="2.2" height="76"/><rect x="24" y="60" width="52" height="3" /></g>' +
      '<path d="M30 60L34 63L30 66L26 63Z" fill="url(#lb' + u + ')"/><path d="M70 60L74 63L70 66L66 63Z" fill="url(#lb' + u + ')"/>' +
      '<path d="M31 70C30.5 90 31 110 33 124" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.2" stroke-linecap="round"/><path d="M68 74C68.5 90 68 104 67 114" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.6" stroke-linecap="round"/>' +
      /* talp */
      '<ellipse cx="50" cy="128.5" rx="16" ry="3.2" fill="url(#lb' + u + ')"/>' +
      '<path d="M20 129H80L85 141H15Z" fill="url(#li' + u + ')" stroke="rgba(170,185,215,.4)" stroke-width="1"/><rect x="12" y="141" width="76" height="8" rx="2.4" fill="url(#li' + u + ')" stroke="rgba(170,185,215,.4)" stroke-width="1"/>' +
      '<path d="M34 134C40 130.5 46 135 50 132C54 135 60 130.5 66 134" fill="none" stroke="url(#lb' + u + ')" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M14 142H86" stroke="rgba(190,205,235,.35)" stroke-width="1"/>' +
      /* füst + szikrák */
      '<path class="d-wisp" d="M50 70C42 60 58 52 50 42C45 35 55 28 50 18" fill="none" stroke="rgba(205,210,225,.8)" stroke-width="2.6" stroke-linecap="round"/>' +
      '<g class="d-embers"><circle class="e1" cx="50" cy="88" r="1.4"/><circle class="e2" cx="50" cy="88" r="1.2"/><circle class="e3" cx="50" cy="88" r="1.5"/><circle class="e4" cx="50" cy="88" r="1.1"/></g>' +
      '</svg>';
  },
  onClick(el, ev, A) {
    const on = A.toggle(el);
    el.classList.remove('is-blow', 'is-light', 'is-flicker');
    A.play(el, on ? 'is-light' : 'is-blow', on ? 1700 : 2000);
  },
  idle(el) { if (!el.classList.contains('is-off')) dcPlay(el, 'is-flicker', 1700); }
});

registerSet({ id: 'lampas', name: 'Gyertyás lámpás', desc: 'Vaskeretes lámpás égő gyertyával. Elfújhatod, és újra meggyújthatod; az állapota megmarad.', tip: 'Fújd el, aztán gyújtsd meg újra!', parts: [{ type: 'lampas', at: 'end' }] });
