/* ===== Díszek (v2): a polcra tehető, egyéni animációjú dekorációk (keretrendszer) =====
   Modell: S.decor = [{id:'d_…', type, link?}]; a dísz id-je a polc ids-ében áll a könyvek között (ugyanúgy húzható/mozgatható).
   Katalógus: registerDecor({id,name,hint,ar,k,svg(u),onClick(el,ev,api),idle?(el),look?}) + registerSet({id,name,desc,parts:[{type,at:'start'|'end'}],preview}).
   Az SVG-k egyedi rajzok (u = példány-azonosító a gradiens/clip id-khez). Animáció: osztály-váltás + CSS keyframes (css/decor.css). */
'use strict';

const DECOR = {};
const DECOR_SETS = [];
let decorSeq = 0;
const registerDecor = d => (DECOR[d.id] = d);
const registerSet = s => DECOR_SETS.push(s);
const isDecorId = id => typeof id === 'string' && id.charAt(0) === 'd' && id.charAt(1) === '_';
const decorById = id => (S.decor || []).find(d => d.id === id);
function newDecor(type, link) { const d = { id: 'd_' + Engine.uid(), type: type }; if (link) d.link = link; return d; }

/* pseudo-véletlen (determinisztikus) a rajzokhoz */
function dcRng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const dcN = n => Math.round(n * 10) / 10;

/* ---------- elem ---------- */
function decorSlotEl(d) {
  const T = DECOR[d.type];
  const holder = h('span', { class: 'dc-art' });
  holder.innerHTML = T.svg('u' + (++decorSeq));
  const ds = { id: d.id, type: d.type };
  if (d.link) ds.link = d.link;
  if (T.look) ds.look = '1';
  const btn = h('button', { type: 'button', class: 'lb-sp lb-deco dc-' + d.type + (d.off ? ' is-off' : ''), dataset: ds, title: T.hint, 'aria-label': T.name + '. ' + T.hint }, holder);
  return h('div', { class: 'lb-slot deco', dataset: { id: d.id }, style: { '--k': String(T.k), '--ar': String(T.ar) } }, btn);
}

/* ---------- animáció-segédek ---------- */
function dcPlay(el, cls, ms) {   // osztály újraindítása (az animáció elölről játszódik), ms után lekerül
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  const k = '_t_' + cls; clearTimeout(el[k]); el[k] = setTimeout(() => el.classList.remove(cls), ms);
}
const dcLinked = el => el.dataset.link ? $$('.lb-deco[data-link="' + el.dataset.link + '"]').filter(x => x !== el) : [];
const dcAt = (fn, ms) => setTimeout(() => { if (document.body.contains($('.lb'))) fn(); }, ms);
const dcState = new WeakMap();
const dcSt = el => { let s = dcState.get(el); if (!s) dcState.set(el, s = { n: 0, last: 0 }); return s; };

function decorClick(el, ev) {
  const T = DECOR[el.dataset.type]; if (!T || !T.onClick) return;
  T.onClick(el, ev, dcApi(el));
}
/* a díszek API-ja: play(el,cls,ms) osztály-animáció, linked(el) a páros darabok, at(fn,ms) késleltetés, st állapot (bökés-számláló), toggle(el) tartósan kikapcsolható (S.decor[].off, mentve) */
function dcToggle(el) {
  const d = decorById(el.dataset.id); if (!d) return false;
  d.off = !d.off; if (!d.off) delete d.off;
  el.classList.toggle('is-off', !!d.off); persist(); return !d.off;
}
function dcApi(el) { return { play: dcPlay, linked: dcLinked, at: dcAt, st: dcSt(el), toggle: dcToggle, on: !el.classList.contains('is-off') }; }

/* ---------- „élet”: a szem követi az egeret, ritka pislogás (csak látható nézetben, Kímélő módban nem) ---------- */
const DecorLife = { raf: 0, t: 0, x: -999, y: -999 };
const dcAlive = () => motionOK() && !S.settings.lite && !document.hidden;
function decorLook() {
  DecorLife.raf = 0;
  if (!dcAlive()) return;
  const vh = window.innerHeight;
  $$('.lb-deco[data-look]').forEach(el => {
    const eye = el.querySelector('.d-eye'); if (!eye) return;
    const r = eye.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    const dx = DecorLife.x - (r.left + r.width / 2), dy = DecorLife.y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, f = Math.min(1, d / 160);
    el.style.setProperty('--ex', dcN(dx / d * f * 2.2) + 'px'); el.style.setProperty('--ey', dcN(dy / d * f * 1.4) + 'px');
  });
}
function decorLifeStart(root) {
  clearTimeout(DecorLife.t);
  root.addEventListener('pointermove', e => { DecorLife.x = e.clientX; DecorLife.y = e.clientY; if (!DecorLife.raf) DecorLife.raf = requestAnimationFrame(decorLook); });
  const tick = () => {
    if (!document.body.contains(root)) return;
    if (dcAlive() && !SH.edit && !DND.s) { const vh = window.innerHeight, all = $$('.lb-deco').filter(e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < vh; }); if (all.length) { const el = all[Math.floor(Math.random() * all.length)], T = DECOR[el.dataset.type]; if (T && T.idle) T.idle(el, dcApi(el)); } }
    DecorLife.t = setTimeout(tick, 2600 + Math.random() * 4600);
  };
  DecorLife.t = setTimeout(tick, 1800);
}

/* ---------- modell: felvétel, törlés, kezdő díszek ---------- */
function starterDecor() {   // kezdő díszek: sárkány-pár az 1. polcon, a többi szétosztva (a polcok száma szerint), hogy az első látogatáskor is "lakott" legyen a könyvtár
  const link = Engine.uid(), a = newDecor('sarkany-fej', link), b = newDecor('sarkany-farok', link);
  const k = newDecor('kis-sarkany'), n = newDecor('book-nook'), o = newDecor('bagoly'), c = newDecor('macska'), p = newDecor('noveny');
  return { decor: [a, b, k, n, o, c, p], place: [[a.id, 'start', 0], [b.id, 'end', 0], [k.id, 'end', 1], [n.id, 'start', 2], [o.id, 'end', 2], [c.id, 'start', 3], [p.id, 'end', 3]] };
}
function placeDecor(pairs, shelfIdx) {
  pairs.forEach(p => {
    const sh = S.shelves[clamp((p[2] != null ? p[2] : shelfIdx) | 0, 0, S.shelves.length - 1)];
    if (p[1] === 'start') sh.ids.unshift(p[0]); else sh.ids.push(p[0]);
  });
}
function addDecorSet(set, shelfIdx) {
  syncShelves();
  const link = set.parts.length > 1 ? Engine.uid() : null, pairs = [];
  set.parts.forEach(p => { const d = newDecor(p.type, link); S.decor.push(d); pairs.push([d.id, p.at]); });
  placeDecor(pairs, shelfIdx);
}
function removeDecor(id) {
  const snapD = JSON.stringify(S.decor), snapS = JSON.stringify(S.shelves), d = decorById(id);
  if (!d) return;
  S.decor = S.decor.filter(x => x.id !== id);
  S.shelves.forEach(s => { s.ids = s.ids.filter(x => x !== id); });
  persist(); drawLibrary();
  toastAction('Dísz levéve: ' + (DECOR[d.type] ? DECOR[d.type].name : 'dísz'), 'Visszavonás', () => { S.decor = JSON.parse(snapD); S.shelves = JSON.parse(snapS); persist(); drawLibrary(); });
}

/* ---------- ablakok ---------- */
function decorPreviewEl(set) {
  const box = h('div', { class: 'dc-prev' });
  set.parts.forEach(p => { const T = DECOR[p.type]; const w = h('span', { class: 'dc-prev-i', style: { '--ar': String(T.ar) } }); w.innerHTML = T.svg('p' + (++decorSeq)); box.appendChild(w); });
  return box;
}
function decorModal() {
  let shelfIdx = 0;
  const sel = h('select', { id: 'dc-shelf', 'aria-label': 'Melyik polcra', onchange: e => { shelfIdx = +e.target.value; } }, S.shelves.map((s, i) => h('option', { value: i }, s.name)));
  const list = h('div', { class: 'dc-list' }, DECOR_SETS.map(set => h('div', { class: 'dc-card panel' },
    decorPreviewEl(set),
    h('div', { class: 'dc-info' }, h('h3', null, set.name), h('p', { class: 'muted small' }, set.desc), h('p', { class: 'dc-tip small' }, ic('sparkle', 13), set.tip)),
    btn('Hozzáadás', { icon: 'plus', kind: 'primary sm', onclick: () => { addDecorSet(set, shelfIdx); persist(); m.close(); drawLibrary(); toast(set.name + ' a polcon. Kattints rá!'); } }))));
  const m = openModal({ title: 'Díszek a polcra', wide: true, cls: 'dc-modal', body: [h('p', { class: 'muted' }, 'Kis kiegészítők, amik a polcon élnek: rájuk kattintva megmozdulnak. Hozzáadás után átrendezés módban a helyükre húzhatod őket.'), h('div', { class: 'field dc-shelfsel' }, h('label', { for: 'dc-shelf' }, 'Melyik polcra kerüljön'), sel), list], actions: [{ label: 'Kész', kind: 'primary' }] });
  return m;
}
function decorPopup(el) {
  const d = decorById(el.dataset.id), T = d && DECOR[d.type]; if (!T) return;
  const sel = h('select', { id: 'dc-mv', 'aria-label': 'Polc', onchange: e => { const to = S.shelves.find(s => s.id === e.target.value), from = shelfOf(d.id); if (!to || !from || to === from) return; from.ids.splice(from.ids.indexOf(d.id), 1); to.ids.push(d.id); persist(); } }, S.shelves.map(s => h('option', { value: s.id, selected: s.ids.indexOf(d.id) >= 0 }, s.name)));
  openModal({
    title: T.name, cls: 'dc-modal', body: [h('p', { class: 'muted' }, T.hint), d.link ? h('p', { class: 'muted small' }, 'Ez egy páros darab: a párja reagál rá, ha a közelben van a polcon.') : null, h('div', { class: 'field' }, h('label', { for: 'dc-mv' }, 'Melyik polcon áll'), sel)],
    actions: [{ label: 'Eltávolítás', kind: 'danger', icon: 'trash', onClick: () => { setTimeout(() => removeDecor(d.id), 0); } }, { label: 'Kész', kind: 'primary' }], onClose: () => { if ($('.lb')) drawLibrary(); }
  });
}
