/* ===== Könyvgerinc-művészet (v12): kötés-stílusok, minták, fólia =====
   EGY rajzoló szolgálja a 3D textúrát, a könyv-szerkesztő előnézetét és a 2D háttérképet.
   Két vászon készül egyszerre (Dual): szín (albedo) + maszk. A maszk R csatornája a dombormű magassága (bump), G az érdesség, B a fémesség,
   így a fólia (arany/ezüst/réz) a 3D-ben tényleg fémesen csillog, a minták és a bőrkötés-bordák pedig kidomborodnak. */
'use strict';

const SPINE_PATS = ['Nincs', 'Damaszt', 'Rács', 'Inda és tüske', 'Csillagos ég', 'Pikkely', 'Marmor', 'Hullám', 'Gótikus ív'];
const FOILS = [['Arany', '#d9b25a', 1], ['Ezüst', '#cdd2d8', 1], ['Réz', '#c98a55', 1], ['Vérvörös', '#b3243a', 0], ['Éjfekete', '#17110f', 0], ['Krém', '#efe2c4', 0]];
const MASK = { base: 'rgb(60,158,0)', emb: 'rgb(150,150,0)', ink: 'rgb(190,140,0)', foil: 'rgb(255,66,255)', deb: 'rgb(8,172,0)' };
const foilMetal = hex => FOILS.some(f => f[2] && f[1].toLowerCase() === String(hex).toLowerCase());

/* két vászonra egyszerre rajzoló segéd: a szín- és a maszk-vászon ugyanazt az útvonalat kapja; a fill/stroke csak akkor érinti a maszkot, ha a stílusnak van „fajtája” */
class Dual {
  constructor(a, b) { this.a = a; this.b = b; this.m = false; }
  set(col, kind) { this.a.fillStyle = this.a.strokeStyle = col; this.m = !!kind; if (kind) this.b.fillStyle = this.b.strokeStyle = MASK[kind]; return this; }
  lw(x) { this.a.lineWidth = this.b.lineWidth = x; return this; }
  font(f) { this.a.font = this.b.font = f; return this; }
  fillRect(x, y, w, h) { this.a.fillRect(x, y, w, h); if (this.m) this.b.fillRect(x, y, w, h); return this; }
  strokeRect(x, y, w, h) { this.a.strokeRect(x, y, w, h); if (this.m) this.b.strokeRect(x, y, w, h); return this; }
  text(t, x, y) { this.a.fillText(t, x, y); if (this.m) this.b.fillText(t, x, y); return this; }
  fill() { this.a.fill(); if (this.m) this.b.fill(); return this; }
  stroke() { this.a.stroke(); if (this.m) this.b.stroke(); return this; }
  rr(x, y, w, h, r) { return this.beginPath().moveTo(x + r, y).arcTo(x + w, y, x + w, y + h, r).arcTo(x + w, y + h, x, y + h, r).arcTo(x, y + h, x, y, r).arcTo(x, y, x + w, y, r).closePath(); }
}
['beginPath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse', 'bezierCurveTo', 'quadraticCurveTo', 'closePath', 'rect', 'save', 'restore', 'translate', 'rotate'].forEach(n => { Dual.prototype[n] = function () { this.a[n].apply(this.a, arguments); this.b[n].apply(this.b, arguments); return this; }; });

/* ---------- minták (logikai px-ben; w × h a gerinc) ---------- */
const SP_PAT = [
  null,
  function damask(g, w, h, tone, fk) {   // tükrös levél-medalionok sorban
    const cx = w / 2; g.set(tone(0.2), 'emb').lw(0.9);
    for (let y = 24; y < h - 14; y += 31) {
      [-1, 1].forEach(s => { g.beginPath().ellipse(cx + s * w * 0.21, y, w * 0.15, 7.5, s * 0.6, 0, 6.283).stroke(); g.beginPath().moveTo(cx, y + 9).quadraticCurveTo(cx + s * w * 0.34, y + 14, cx + s * w * 0.27, y + 27).stroke(); });
      g.beginPath().ellipse(cx, y, 3, 9.5, 0, 0, 6.283).fill(); g.beginPath().arc(cx, y + 15, 2, 0, 6.283).fill(); g.beginPath().arc(cx, y - 14, 1.5, 0, 6.283).fill();
    }
  },
  function lattice(g, w, h, tone) {   // art deco rombuszlánc pontokkal
    const st = Math.max(13, w * 0.6); g.set(tone(0.22), 'emb').lw(0.8);
    for (let y = st / 2; y < h; y += st) { g.beginPath().moveTo(0, y).lineTo(w / 2, y - st / 2).lineTo(w, y).lineTo(w / 2, y + st / 2).closePath().stroke(); g.beginPath().arc(w / 2, y, 1.1, 0, 6.283).fill(); }
  },
  function vine(g, w, h, tone, fk, acc, rng) {   // tüskés inda apró rózsákkal: a „dark romance” alapminta
    const cx = w / 2, A = w * 0.3, lam = 20, col = acc ? acc : tone(0.32), kind = acc ? fk : 'emb';
    g.set(col, kind).lw(1.15).beginPath(); for (let y = 0; y <= h; y += 2) { const x = cx + A * Math.sin(y / lam * 1.0); y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let y = 8, i = 0; y < h - 4; y += 9, i++) { const x = cx + A * Math.sin(y / lam), s = i % 2 ? 1 : -1; g.beginPath().moveTo(x, y).lineTo(x + s * 4.2, y - 3).lineTo(x + s * 1.2, y + 0.8).closePath().fill(); }
    for (let y = 34, i = 0; y < h - 22; y += 56, i++) {
      const x = cx + A * Math.sin(y / lam); g.set(col, kind).lw(0.9);
      [-1, 1].forEach(s => { g.beginPath().ellipse(x + s * 5.4, y + 4, 3.8, 1.5, s * -0.55, 0, 6.283).fill(); });
      g.beginPath().arc(x, y, 4.2, 0, 6.283).stroke(); g.beginPath().arc(x + 0.4, y - 0.2, 2.5, 0.6, 5.2).stroke(); g.beginPath().arc(x, y, 1.0, 0, 6.283).fill();
    }
  },
  function stars(g, w, h, tone, fk, acc, rng) {   // csillagok és holdsarló
    const col = acc ? acc : tone(0.3), kind = acc ? fk : 'emb';
    g.set(col, kind);
    for (let i = 0; i < 9; i++) { const x = 4 + rng() * (w - 8), y = 12 + rng() * (h - 24), r = 1.8 + rng() * 2.6; g.beginPath().moveTo(x, y - r).quadraticCurveTo(x, y, x + r, y).quadraticCurveTo(x, y, x, y + r).quadraticCurveTo(x, y, x - r, y).quadraticCurveTo(x, y, x, y - r).closePath().fill(); }
    for (let i = 0; i < 22; i++) { g.beginPath().arc(2 + rng() * (w - 4), 4 + rng() * (h - 8), 0.55 + rng() * 0.5, 0, 6.283).fill(); }
    const my = h * 0.2 + rng() * h * 0.5, mx = w / 2, R = Math.min(8, w * 0.22); g.beginPath().arc(mx, my, R, 0.35 * Math.PI, 1.65 * Math.PI, false).arc(mx + R * 0.5, my - R * 0.1, R * 0.82, 1.5 * Math.PI, 0.5 * Math.PI, true).closePath().fill();
  },
  function scales(g, w, h, tone) {   // halpikkely
    const r = 6; g.set(tone(0.2), 'emb').lw(0.8);
    for (let j = 0, y = 0; y < h + r; j++, y += r * 0.55) for (let x = -r + (j % 2) * r; x < w + r; x += r * 2) g.beginPath().arc(x, y, r, 0, Math.PI).stroke();
  },
  function marble(g, w, h, tone, fk, acc, rng) {   // márvány-erezet (csak szín)
    for (let i = 0; i < 4; i++) { const x = rng() * w, y = rng() * h, r = 18 + rng() * 30, gr = g.a.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, tone(0.13)); gr.addColorStop(1, tone(0)); g.a.fillStyle = gr; g.a.fillRect(0, 0, w, h); }
    g.set(tone(0.2), null);
    for (let i = 0; i < 12; i++) { const y0 = rng() * h, A = 2 + rng() * 6, ph = rng() * 6.283, sl = (rng() - 0.5) * 0.9; g.a.strokeStyle = tone(0.08 + rng() * 0.18); g.a.lineWidth = 0.4 + rng() * 0.9; g.a.beginPath(); for (let x = 0; x <= w; x += 2) { const y = y0 + x * sl + Math.sin(x * 0.35 + ph) * A; x ? g.a.lineTo(x, y) : g.a.moveTo(x, y); } g.a.stroke(); }
  },
  function waves(g, w, h, tone) {   // seigaiha hullámok
    g.set(tone(0.2), 'emb').lw(0.8);
    for (let j = 0, y = 4; y < h + 8; j++, y += 6.5) for (let x = -7 + (j % 2) * 7; x < w + 7; x += 14) [7, 4.6, 2.2].forEach(r => g.beginPath().arc(x, y, r, Math.PI, 0).stroke());
  },
  function gothic(g, w, h, tone, fk, acc) {   // csúcsíves ablakok
    const cx = w / 2, a = Math.min(w * 0.36, 11), col = acc ? acc : tone(0.26), kind = acc ? fk : 'emb'; g.set(col, kind).lw(0.9);
    for (let y = 22; y < h - 8; y += 36) {
      [[a, 0], [a * 0.55, 3.6]].forEach(q => { const aa = q[0], o = q[1]; g.beginPath().moveTo(cx - aa, y + 26 - o).lineTo(cx - aa, y + 11).quadraticCurveTo(cx - aa, y + 1 + o, cx, y - 6 + o).quadraticCurveTo(cx + aa, y + 1 + o, cx + aa, y + 11).lineTo(cx + aa, y + 26 - o).stroke(); });
      g.beginPath().arc(cx, y + 9, 1.6, 0, 6.283).fill(); g.beginPath().moveTo(cx, y + 11).lineTo(cx, y + 26).stroke();
    }
  }
];

/* ---------- a gerinc ---------- */
function spineDraw(b, L, F, w, h, S3, full) {
  const S3m = S3 * 0.67, mk = k => { const c = document.createElement('canvas'); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k); return c; };
  const cv = mk(S3), mv = mk(S3m), A = cv.getContext('2d'), B = mv.getContext('2d'), g = new Dual(A, B), rng = dcRng(hashStr(b.id + '|' + L.color + L.pat + L.style + L.acc));
  A.scale(S3, S3); B.scale(S3m, S3m);
  const dark = L.lum < 0.45, tone = a => (dark ? 'rgba(255,238,214,' : 'rgba(34,14,8,') + a + ')', fk = L.metal ? 'foil' : 'ink', cx = w / 2, st = L.style;
  g.set(L.color, 'base').fillRect(0, 0, w, h);
  g.set(L.color, null);
  for (let i = 0; i < w * h / 7; i++) { A.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)'; A.fillRect(rng() * w, rng() * h, 0.35 + rng() * 0.5, 0.33); }   // bőr/vászon szemcse
  if (st === 7) { g.set('rgba(0,0,0,.26)', null); g.fillRect(0, 0, w, h * 0.2); g.fillRect(0, h * 0.88, w, h * 0.12); }
  if (SP_PAT[L.pat]) { A.save(); B.save(); SP_PAT[L.pat](g, w, h, tone, fk, (L.pat === 3 || L.pat === 4 || L.pat === 8) && L.metal ? L.acc : null, rng); A.restore(); B.restore(); }
  if (st === 4) { const vg = A.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, 'rgba(255,255,255,.2)'); vg.addColorStop(0.12, 'rgba(255,255,255,0)'); vg.addColorStop(0.85, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.3)'); A.fillStyle = vg; A.fillRect(0, 0, w, h); g.set('rgba(0,0,0,.2)', null).fillRect(w * 0.24, 0, 0.5, h); for (let i = 0; i < 16; i++) { A.fillStyle = rng() < 0.5 ? 'rgba(255,240,220,.16)' : 'rgba(0,0,0,.16)'; const yy = rng() < 0.5 ? rng() * 12 : h - rng() * 12; A.fillRect(rng() * w, yy, 1 + rng() * 5, 0.5 + rng() * 1.2); } }
  /* kötés-stílusok: fólia-vonalak, bordák, keret */
  const line = (y, th, kind) => { g.set(L.acc, kind || fk).fillRect(0, y, w, th); };
  if (st === 1) { line(6.5, 1.6); line(10.5, 0.9); line(h - 12, 0.9); line(h - 8.2, 1.6); }
  if (st === 2) { line(6.5, 1.6); line(10.5, 1.6); line(h - 12.1, 1.6); line(h - 8.1, 1.6); [-5, 0, 5].forEach(d => { g.set(L.acc, fk).beginPath().moveTo(cx + d, 14.5).lineTo(cx + d + 1.3, 15.8).lineTo(cx + d, 17.1).lineTo(cx + d - 1.3, 15.8).closePath().fill(); g.beginPath().moveTo(cx + d, h - 17.1).lineTo(cx + d + 1.3, h - 15.8).lineTo(cx + d, h - 14.5).lineTo(cx + d - 1.3, h - 15.8).closePath().fill(); }); }
  if (st === 5) {   // bőrkötés: kidomborodó bordák, fólia-vonalakkal
    [8, 15, 22, h - 22, h - 15, h - 8].forEach(y => {
      const gr = A.createLinearGradient(0, y - 2, 0, y + 2); gr.addColorStop(0, 'rgba(255,240,220,.26)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)'); A.fillStyle = gr; A.fillRect(0, y - 2, w, 4); g.set(L.color, 'emb'); B.fillStyle = MASK.emb; B.fillRect(0, y - 1.8, w, 3.6);
      g.set(L.acc, fk).fillRect(0, y - 2.6, w, 0.7); g.fillRect(0, y + 1.9, w, 0.7);
    });
  }
  if (st === 6) {   // keretes: dupla fólia-keret, sarokdíszekkel
    g.set(L.acc, fk).lw(1).strokeRect(2.6, 2.6, w - 5.2, h - 5.2); g.lw(0.55).strokeRect(4.8, 4.8, w - 9.6, h - 9.6);
    [[2.6, 2.6], [w - 2.6, 2.6], [2.6, h - 2.6], [w - 2.6, h - 2.6]].forEach(p => { g.beginPath().arc(p[0], p[1], 1.5, 0, 6.283).fill(); });
  }
  if (st === 7) { g.set(L.acc, fk).fillRect(0, h * 0.2 - 0.6, w, 1.2); g.fillRect(0, h * 0.88 - 0.6, w, 1.2); }
  /* fej- és lábszalag (headband) */
  for (let x = 0; x < w; x += 2) { g.set(x % 4 ? L.acc : 'rgba(0,0,0,.55)', 'ink'); g.fillRect(x, 0, 1.2, 2.6); g.fillRect(x, h - 2.6, 1.2, 2.6); }
  /* a gerinc élei és vége sötétebb (kerekség) – csak a színben */
  { const eg = A.createLinearGradient(0, 0, w, 0); eg.addColorStop(0, 'rgba(0,0,0,.3)'); eg.addColorStop(0.13, 'rgba(0,0,0,0)'); eg.addColorStop(0.84, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,.32)'); A.fillStyle = eg; A.fillRect(0, 0, w, h);
    const vg2 = A.createLinearGradient(0, 0, 0, h); vg2.addColorStop(0, 'rgba(0,0,0,.2)'); vg2.addColorStop(0.05, 'rgba(0,0,0,0)'); vg2.addColorStop(0.95, 'rgba(0,0,0,0)'); vg2.addColorStop(1, 'rgba(0,0,0,.24)'); A.fillStyle = vg2; A.fillRect(0, 0, w, h); }
  if (!full) return { cv: cv, mv: mv };

  /* cím + szerző + állapot */
  const topM = st === 5 ? 32 : 18, botM = st === 5 ? 32 : 16, aH = F.showA ? F.ah : 0, avail = h - topM - botM - (aH ? aH + 6 : 0);
  const ff = s => s + 'px Marcellus, "Palatino Linotype", "Book Antiqua", Georgia, serif';
  let fs = F.fs; g.font(ff(fs)); let tw = A.measureText(b.title).width; if (tw > avail) { fs = Math.max(8.5, fs * avail / tw); g.font(ff(fs)); tw = A.measureText(b.title).width; }
  let tt = b.title; if (tw > avail) { while (tt.length > 3 && A.measureText(tt + '…').width > avail) tt = tt.slice(0, -1); tt += '…'; tw = A.measureText(tt).width; }
  if (L.pat > 0 || st === 3) {   // címtábla: a minta ne zavarja az olvasást
    const pw = Math.min(w - 3, fs * 1.5 + 5), py = topM - 5;
    g.set(st === 3 ? (dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.14)') : L.color, st === 3 ? null : 'base');
    if (st !== 3) { A.globalAlpha = 0.9; g.rr(cx - pw / 2, py, pw, tw + 10, 2.2).fill(); A.globalAlpha = 1; g.set(tone(0.3), 'emb').lw(0.5); g.rr(cx - pw / 2 + 0.5, py + 0.5, pw - 1, tw + 9, 2).stroke(); }
    else g.rr(cx - pw / 2, py, pw, tw + 10, 2).fill();
  }
  const foilT = !!L.tfoil;
  g.set(foilT ? L.acc : L.tink, foilT ? 'foil' : null);
  A.save(); B.save(); g.translate(cx, topM).rotate(Math.PI / 2); A.textBaseline = B.textBaseline = 'middle'; A.textAlign = B.textAlign = 'left';
  if (!foilT && dark) { A.shadowColor = 'rgba(0,0,0,.45)'; A.shadowOffsetY = 0.6 * S3; A.shadowBlur = 0; }
  g.text(tt, 0, 0); A.restore(); B.restore();
  if (F.showA) {
    const fa = Math.min(10.5, w * 0.3); g.font(ff(fa)); let at = b.author; while (at.length > 3 && A.measureText(at).width > aH) at = at.slice(0, -1);
    A.save(); A.translate(cx, h - botM + 2 - Math.min(aH, A.measureText(at).width)); A.rotate(Math.PI / 2); A.globalAlpha = 0.8; A.fillStyle = L.tink; A.textBaseline = 'middle'; A.textAlign = 'left'; A.fillText(at, 0, 0); A.restore();
  }
  if (b.status === 'elolvastam') { g.set('#e8c765', 'foil').beginPath().arc(cx, h - 7, 3.9, 0, 6.283).fill(); g.set('rgba(0,0,0,.35)', null).lw(0.35).stroke(); }
  if (st === 3) { g.set(L.tink, null); A.globalAlpha = 0.65; g.beginPath().arc(cx, h - 12, 4.2, 0, 6.283).fill(); A.globalAlpha = 1; }
  return { cv: cv, mv: mv };
}

/* 2D háttérkép (a szöveg DOM-ban marad): gyorsítótárazott data-URL */
const SP_BG = new Map();
function spineBgUrl(b, L, w, h) {
  const key = [L.color, L.style, L.pat, L.acc, w, h].join('|');
  let u = SP_BG.get(key);
  if (!u) { try { u = spineDraw(b, L, null, w, h, 2, false).cv.toDataURL('image/png'); } catch (e) { u = ''; } SP_BG.set(key, u); if (SP_BG.size > 400) SP_BG.delete(SP_BG.keys().next().value); }
  return u;
}
