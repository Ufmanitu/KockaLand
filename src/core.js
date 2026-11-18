/* ===== Core: DOM-segédek, ikonok, modal, toast, hang, konfetti, állapot + mentés, kódok ===== */
'use strict';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wait = ms => new Promise(r => setTimeout(r, ms));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];

function h(tag, attrs) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') { for (const p in v) { if (p.charAt(0) === '-') el.style.setProperty(p, v[p]); else el.style[p] = v[p]; } }
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value' || k === 'checked' || k === 'selected' || k === 'disabled' || k === 'indeterminate') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (let i = 2; i < arguments.length; i++) add(el, arguments[i]);
  return el;
}
function add(el, c) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(x => add(el, x)); return; }
  el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
}
const clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

/* ---------- ikonok (egyszerű vonalas SVG) ---------- */
const ICONS = {
  dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7M10.2 11v5.5M13.8 11v5.5"/>',
  edit: '<path d="M4 20l4.2-1L19 8.2a2.2 2.2 0 0 0-3.1-3.1L5.1 15.8 4 20z"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.2"/><path d="M15.5 8.5V6.7a2.2 2.2 0 0 0-2.2-2.2H6.7a2.2 2.2 0 0 0-2.2 2.2v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8"/>',
  up: '<path d="M6 14.5l6-6 6 6"/>',
  down: '<path d="M6 9.5l6 6 6-6"/>',
  left: '<path d="M14.5 6l-6 6 6 6"/>',
  right: '<path d="M9.5 6l6 6-6 6"/>',
  heart: '<path d="M12 20.2S4.5 15.6 4.5 9.8A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.2c0 5.8-7.5 10.4-7.5 10.4z"/>',
  star: '<path d="M12 4.2l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"/>',
  book: '<path d="M5.5 4.5h9a3.5 3.5 0 0 1 3.5 3.5v12H9a3.5 3.5 0 0 1-3.5-3.5v-12z"/><path d="M5.5 16.5A3.5 3.5 0 0 1 9 13h9"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  sound: '<path d="M4 9.5v5h3.6L13 19V5L7.6 9.5H4z"/><path d="M16.2 9a4.2 4.2 0 0 1 0 6M18.6 6.6a7.5 7.5 0 0 1 0 10.8"/>',
  mute: '<path d="M4 9.5v5h3.6L13 19V5L7.6 9.5H4z"/><path d="M16.5 9.5l4 5M20.5 9.5l-4 5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  import: '<path d="M12 4v11M7.5 10.8L12 15.3l4.5-4.5M5 19.5h14"/>',
  export: '<path d="M12 15.5V4.5M7.5 9L12 4.5 16.5 9M5 19.5h14"/>',
  swirl: '<path d="M10.5 13a1.5 1.5 0 0 1 3 0 3.5 3.5 0 0 1-7 0 5.5 5.5 0 0 1 11 0 7.5 7.5 0 0 1-15 0"/>',
  search: '<circle cx="11" cy="11" r="6.3"/><path d="M16 16l4.2 4.2"/>',
  list: '<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/><circle cx="4.5" cy="6.5" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1" fill="currentColor"/>',
  moon: '<path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.8 7.8 0 1 0 9.7 9.7z"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18"/>',
  shuffle: '<path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.6 0 2.7-1.6 3.7-3.2M20 7h-3.5c-1.4 0-2.3.9-3.1 2.1"/><path d="M18 5l2 2-2 2M18 15l2 2-2 2"/>',
  home: '<path d="M4.5 11L12 4.5l7.5 6.5v8.5h-5v-5.5h-5v5.5h-5V11z"/>',
  tag: '<path d="M4.5 12.2V5.5h6.7l8 8-6.7 6.7-8-8z"/><circle cx="8.6" cy="9.6" r="1.1" fill="currentColor"/>',
  more: '<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>',
  undo: '<path d="M8.5 6.5L4.5 10.5l4 4M5 10.5h9a5 5 0 0 1 0 10h-3"/>',
  grip: '<circle cx="9" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="17" r="1.2" fill="currentColor"/><circle cx="15" cy="17" r="1.2" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2"/>',
  sparkle: '<path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9z"/>',
  warn: '<path d="M12 4.5l8.2 14.5H3.8L12 4.5z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/>'
};
function ic(name, size) {
  const s = size || 20;
  const el = document.createElement('span');
  el.className = 'ic';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  return el;
}
function btn(label, o) {
  o = o || {};
  const b = h('button', { type: 'button', class: 'btn' + (o.kind ? ' ' + o.kind : '') + (o.cls ? ' ' + o.cls : ''), title: o.title, onclick: o.onclick, disabled: o.disabled, id: o.id, 'aria-label': o.aria });
  if (o.icon) b.appendChild(ic(o.icon, o.size || 18));
  if (label) b.appendChild(h('span', null, label));
  return b;
}
function iconBtn(icon, title, onclick, cls) {
  return h('button', { type: 'button', class: 'ibtn' + (cls ? ' ' + cls : ''), title: title, 'aria-label': title, onclick: onclick }, ic(icon, 18));
}

/* ---------- mozgás-beállítás ---------- */
const reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const motionOK = () => !reduceMQ.matches && !(S && S.settings && S.settings.motion === false);

/* ---------- toast ---------- */
function toast(msg, kind) {
  let box = $('#toasts');
  if (!box) { box = h('div', { id: 'toasts', 'aria-live': 'polite' }); document.body.appendChild(box); }
  const t = h('div', { class: 'toast' + (kind ? ' ' + kind : ''), role: 'status' }, msg);
  box.appendChild(t);
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, kind === 'long' ? 5200 : 2600);
}

/* ---------- modal ---------- */
const MODALS = [];
function openModal(o) {
  const prev = document.activeElement;
  const back = h('div', { class: 'modal-back' });
  const bodyEl = h('div', { class: 'modal-body' });
  add(bodyEl, o.body);
  const closeBtn = o.hideClose ? null : h('button', { type: 'button', class: 'ibtn modal-x', 'aria-label': 'Bezárás', title: 'Bezárás (Esc)', onclick: () => close() }, ic('close', 18));
  const box = h('div', { class: 'modal' + (o.wide ? ' wide' : '') + (o.cls ? ' ' + o.cls : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || 'Ablak' },
    h('div', { class: 'modal-head' }, o.title ? h('h2', null, o.title) : null, closeBtn),
    bodyEl);
  let foot = null;
  const api = { el: box, body: bodyEl, close };
  if (o.actions && o.actions.length) {
    foot = h('div', { class: 'modal-foot' });
    o.actions.forEach(a => {
      foot.appendChild(btn(a.label, {
        kind: a.kind, icon: a.icon, onclick: () => {
          const r = a.onClick ? a.onClick(api) : undefined;
          if (r !== false) close(a.value);
        }
      }));
    });
    box.appendChild(foot);
  }
  api.foot = foot;
  back.appendChild(box);
  document.body.appendChild(back);
  document.documentElement.classList.add('modal-open');
  MODALS.push(api);
  let closed = false;
  function close(val) {
    if (closed) return; closed = true;
    const i = MODALS.indexOf(api); if (i >= 0) MODALS.splice(i, 1);
    back.classList.add('out');
    setTimeout(() => back.remove(), 170);
    if (!MODALS.length) document.documentElement.classList.remove('modal-open');
    if (prev && prev.focus) try { prev.focus({ preventScroll: true }); } catch (e) { }
    if (o.onClose) o.onClose(val);
  }
  api.esc = () => { if (!o.persistent) close(); };
  let down = null;
  back.addEventListener('mousedown', e => { down = e.target; });
  back.addEventListener('click', e => { if (e.target === back && down === back && !o.persistent) close(); });
  setTimeout(() => {
    const f = o.focus ? box.querySelector(o.focus) : box.querySelector('input:not([type=checkbox]),textarea,select');
    (f || box.querySelector('.btn.primary') || closeBtn || box).focus({ preventScroll: true });
  }, 30);
  return api;
}
function ask(o) {
  return new Promise(res => {
    openModal({
      title: o.title || 'Biztos?', cls: 'small',
      body: h('p', { class: 'ask-text' }, o.text || ''),
      actions: [
        { label: o.cancel || 'Mégse', value: false },
        { label: o.ok || 'Rendben', kind: o.danger ? 'danger' : 'primary', value: true }
      ],
      onClose: v => res(v === true)
    });
  });
}

/* ---------- vágólap ---------- */
async function copyText(text, srcEl) {
  try { await navigator.clipboard.writeText(text); toast('Vágólapra másolva'); return true; } catch (e) { }
  try {
    const ta = srcEl || h('textarea', { style: { position: 'fixed', left: '-999px', top: '0' } }, text);
    if (!srcEl) { ta.value = text; document.body.appendChild(ta); }
    ta.focus(); ta.select();
    const ok = document.execCommand && document.execCommand('copy');
    if (!srcEl) ta.remove();
    if (ok) { toast('Vágólapra másolva'); return true; }
  } catch (e) { }
  if (srcEl) { srcEl.focus(); srcEl.select(); }
  toast('Nem sikerült automatikusan: a szöveg ki van jelölve, másold ki kézzel (Ctrl+C).', 'long');
  return false;
}
function textBox(title, text, hint) {
  const ta = h('textarea', { class: 'codebox', readonly: true, rows: 8, spellcheck: 'false' });
  ta.value = text;
  openModal({
    title, wide: true,
    body: [hint ? h('p', { class: 'muted' }, hint) : null, ta],
    actions: [{ label: 'Bezár' }, { label: 'Másolás', kind: 'primary', icon: 'copy', onClick: () => { copyText(text, ta); return false; } }],
    focus: 'textarea'
  });
  setTimeout(() => ta.select(), 60);
}

/* ---------- hang (WebAudio, csak felhasználói művelet után) ---------- */
const Sound = {
  ctx: null, buf: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { }); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      this.ctx = new C();
      const n = Math.floor(this.ctx.sampleRate * 0.4), b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.buf = b;
    } catch (e) { this.ctx = null; }
  },
  get on() { return !!(S && S.settings.sound); },
  _hit(when, f, q, dur, vol, type) {
    if (!this.on || !this.ctx || !this.buf) return;
    const c = this.ctx, t = c.currentTime + when;
    const src = c.createBufferSource(); src.buffer = this.buf;
    const flt = c.createBiquadFilter(); flt.type = type || 'bandpass'; flt.frequency.value = f; flt.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(c.destination);
    src.start(t, Math.random() * 0.2, dur + 0.05);
  },
  clack(delay) { this._hit(delay || 0, 900 + Math.random() * 700, 4 + Math.random() * 3, 0.09, 0.28); },
  roll(delay) { const d = delay || 0; for (let i = 0; i < 4; i++) this.clack(d + i * (0.09 + Math.random() * 0.05)); },
  land(delay) { const d = delay || 0; this._hit(d, 260, 2.2, 0.16, 0.5); this._hit(d + 0.01, 1200, 5, 0.05, 0.2); },
  tick() { this._hit(0, 2400, 8, 0.04, 0.16); },
  lock() { this._hit(0, 520, 6, 0.07, 0.3); this._hit(0.05, 1500, 8, 0.05, 0.2); },
  chime() {
    if (!this.on || !this.ctx) return;
    const c = this.ctx;[880, 1318.5].forEach((f, i) => {
      const t = c.currentTime + 0.05 + i * 0.09, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.75);
    });
  }
};

/* ---------- konfetti / szikrák ---------- */
const FX = {
  cv: null, cx: null, ps: [], raf: 0, last: 0,
  ensure() {
    if (this.cv) return;
    this.cv = h('canvas', { id: 'fx', 'aria-hidden': 'true', style: { display: 'none' } });
    document.body.appendChild(this.cv);
    this.cx = this.cv.getContext('2d');
    const fit = () => { const d = Math.min(S.settings.lite ? 1 : 1.5, window.devicePixelRatio || 1); this.cv.width = innerWidth * d; this.cv.height = innerHeight * d; this.d = d; };
    this.fit = fit; fit(); addEventListener('resize', () => { if (!this.cv.style.display) fit(); });
  },
  add(x, y, n, o) {
    if (!motionOK() || (S.settings.lite && o.kind !== 'heart')) return;
    this.ensure();
    if (this.cv.style.display) { this.cv.style.display = ''; this.fit && this.fit(); }
    for (let i = 0; i < n; i++) {
      const a = (o.angle != null ? o.angle : -Math.PI / 2) + (Math.random() - 0.5) * (o.spread || Math.PI * 2);
      const sp = (o.speed || 5) * (0.4 + Math.random() * 0.8);
      this.ps.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.gravity == null ? 0.16 : o.gravity,
        r: (o.size || 8) * (0.6 + Math.random() * 0.8), rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.25,
        life: 0, max: (o.life || 90) * (0.7 + Math.random() * 0.6), c: pick(o.colors), kind: o.kind || 'heart'
      });
    }
    if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(t => this.loop(t)); }
  },
  hearts(x, y, n) { this.add(x, y, n || 22, { colors: ['#e0526a', '#ff8fa3', '#ffb3c1', '#f4c26b', '#fff1d6'], kind: 'heart', speed: 8, spread: Math.PI * 1.1, size: 9, life: 100 }); },
  sparks(x, y, n) { this.add(x, y, n || 10, { colors: ['#ffe9b0', '#ffd27a', '#fff6dc'], kind: 'spark', speed: 3.2, spread: Math.PI * 2, size: 6, life: 34, gravity: 0.03 }); },
  loop(t) {
    const cx = this.cx, d = this.d; this.raf = 0;
    cx.clearRect(0, 0, this.cv.width, this.cv.height);
    const k = Math.min(2, (t - this.last) / 16.7 || 1); this.last = t;
    this.ps = this.ps.filter(p => {
      p.life += k; if (p.life > p.max) return false;
      p.vy += p.g * k; p.vx *= 0.992; p.x += p.vx * k; p.y += p.vy * k; p.rot += p.vr * k;
      const a = clamp(1 - Math.pow(p.life / p.max, 3), 0, 1);
      cx.save(); cx.translate(p.x * d, p.y * d); cx.rotate(p.rot); cx.scale(d, d); cx.globalAlpha = a; cx.fillStyle = p.c;
      const r = p.r;
      if (p.kind === 'heart') {
        cx.beginPath(); cx.moveTo(0, r * 0.9); cx.bezierCurveTo(-r * 1.5, -r * 0.2, -r * 0.7, -r * 1.2, 0, -r * 0.4);
        cx.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.5, -r * 0.2, 0, r * 0.9); cx.fill();
      } else {
        cx.beginPath(); cx.moveTo(0, -r); cx.quadraticCurveTo(0, 0, r, 0); cx.quadraticCurveTo(0, 0, 0, r); cx.quadraticCurveTo(0, 0, -r, 0); cx.quadraticCurveTo(0, 0, 0, -r); cx.fill();
      }
      cx.restore();
      return true;
    });
    if (this.ps.length) this.raf = requestAnimationFrame(tt => this.loop(tt));
    else { cx.clearRect(0, 0, this.cv.width, this.cv.height); this.cv.style.display = 'none'; }
  }
};

/* ---------- kódok: KZ1:base64(JSON) ---------- */
function toB64(str) { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); }); return btoa(bin); }
function fromB64(b) { const bin = atob(b); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }
function makeCode(obj) { return 'KZ1:' + toB64(JSON.stringify(obj)); }
function readCode(str) {
  const s = String(str || '').trim().replace(/\s+/g, '');
  if (s.slice(0, 4) !== 'KZ1:') throw new Error('Ez nem Kockázzunk-kód (KZ1:-gyel kezdődik).');
  try { return JSON.parse(fromB64(s.slice(4))); } catch (e) { throw new Error('A kód sérült vagy csonka. Másold ki újra teljes egészében.'); }
}
const diceToCompact = d => ({ n: d.name, i: d.icon, e: d.enabled === false ? 0 : 1, r: d.role || undefined, k: d.kind || undefined, o: d.kind === 'shelf' ? [] : d.options.map(Engine.fmtLine) });
const themeToCompact = t => ({ n: t.name, e: t.emoji, c: t.color, d: t.desc || '', x: t.dice.map(diceToCompact) });
function themeFromCompact(c) {
  if (!c || typeof c !== 'object' || !Array.isArray(c.x)) throw new Error('A téma adata hiányos.');
  const slugId = Engine.slug(c.n || 'tema') || 'tema';
  return {
    id: slugId + '-' + Engine.uid().slice(-5), name: String(c.n || 'Új téma').slice(0, 40), emoji: String(c.e || '🎲').slice(0, 8), color: /^#[0-9a-f]{6}$/i.test(c.c) ? c.c : '#e0526a',
    desc: String(c.d || '').slice(0, 200), builtin: false,
    dice: c.x.map(d => ({
      id: 'd' + Engine.uid().slice(-8), name: String(d.n || 'Kocka').slice(0, 30), icon: String(d.i || '🎲').slice(0, 8), enabled: d.e !== 0,
      role: d.r || null, kind: d.k === 'shelf' ? 'shelf' : undefined,
      options: (d.o || []).map(l => Engine.parseLine(l)).filter(o => o.t)
    }))
  };
}

/* ---------- állapot + mentés ---------- */
const STORE_KEY = 'kockazzunk.v1';
const DEFAULTS = { appearance: 'auto', sound: true, motion: true, lite: false, perfAsked: false, surreal: false, chaos: 0.35, onlyUnread: true, seen: false };
let S = null;           // {themes, books, history, settings, ui, rolls}
const RT = {};          // futásidejű: {themeId: {picks, locks}}

function loadStored() { try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function initState() {
  const st = loadStored();
  if (st && st.tags) Engine.setTagNames(st.tags);
  if (st && Array.isArray(st.themes) && st.themes.length) {
    S = st;
    S.books = Array.isArray(S.books) ? S.books : [];
    S.shelves = Array.isArray(S.shelves) ? S.shelves : [];
    S.history = Array.isArray(S.history) ? S.history : [];
    S.settings = Object.assign({}, DEFAULTS, S.settings || {});
    S.ui = Object.assign({ themeId: S.themes[0].id, view: 'dobas' }, S.ui || {});
    S.rolls = S.rolls || {};
    S.fresh = false;
    S.migrated = Seed.migrate(S);
  } else {
    S = { v: 1, themes: Seed.themes(), books: Seed.books(), shelves: [], history: [], settings: Object.assign({}, DEFAULTS, (st && st.settings) || {}), ui: { themeId: 'randi', view: 'dobas' }, rolls: {}, fresh: true, seedV: Seed.VERSION };
  }
  if (!S.themes.some(t => t.id === S.ui.themeId)) S.ui.themeId = S.themes[0].id;
  S.themes.forEach(t => t.dice.forEach(d => { d.options = d.options || []; }));
  syncShelves();
}
let saveTimer = 0, saveFailed = false;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 250);
}
function persistNow() {
  if (!S) return;
  const rolls = {};
  for (const id in RT) {
    const r = RT[id], p = {}, l = {};
    for (const d in r.picks) if (r.picks[d] && r.picks[d].opt) p[d] = r.picks[d].opt.id;
    for (const d in r.locks) if (r.locks[d]) l[d] = 1;
    rolls[id] = { p: p, l: l };
  }
  S.rolls = rolls;
  syncShelves();
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ v: 1, themes: S.themes, books: S.books, shelves: S.shelves, decor: S.decor, history: S.history, settings: S.settings, ui: S.ui, rolls: rolls, seedV: S.seedV, tags: Engine.tagNames })); saveFailed = false; }
  catch (e) { if (!saveFailed) { saveFailed = true; toast('A böngésző nem engedi a mentést – amit most csinálsz, bezáráskor elvész. Használd a Beállítások › Mentés kódot.', 'long'); } }
}
addEventListener('pagehide', persistNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) persistNow(); });

const themeById = id => S.themes.find(t => t.id === id);
const curTheme = () => themeById(S.ui.themeId) || S.themes[0];
const activeDice = t => t.dice.filter(d => d.enabled !== false && (d.kind === 'shelf' || d.options.length));
const rtOf = id => RT[id] || (RT[id] = { picks: {}, locks: {} });
const engineCtx = () => ({ surreal: !!S.settings.surreal, chaos: S.settings.chaos, books: S.books, onlyUnread: !!S.settings.onlyUnread });

/* mentett tárolt dobás visszaállítása azonosítók alapján */
function restoreRolls(t) {
  const saved = S.rolls && S.rolls[t.id];
  const r = rtOf(t.id);
  if (!saved || Object.keys(r.picks).length) return;
  t.dice.forEach(d => {
    const oid = saved.p && saved.p[d.id];
    if (!oid) return;
    if (d.kind === 'shelf') {
      const b = S.books.find(x => 'book:' + x.id === oid);
      r.picks[d.id] = { opt: b ? Engine.bookOpt(b) : Engine.noBookOpt() };
    } else {
      const o = d.options.find(x => x.id === oid);
      if (o) r.picks[d.id] = { opt: o };
    }
    if (saved.l && saved.l[d.id]) r.locks[d.id] = true;
  });
}

/* megjelenés: auto/világos/sötét */
/* mozgás-osztályok: no-motion (nincs animáció), lite (Kímélő mód) */
function applyMotionClasses() {
  const c = document.documentElement.classList;
  c.toggle('no-motion', S.settings.motion === false);
  c.toggle('lite', !!S.settings.lite);
}
function applyAppearance() {
  const a = S.settings.appearance;
  const root = document.documentElement;
  if (a === 'light' || a === 'dark') root.setAttribute('data-theme', a); else root.removeAttribute('data-theme');
}

const fmtTime = ts => { try { return new Date(ts).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
