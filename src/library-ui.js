/* ===== Könyvtár (v2): részletek-ablak, megjelenés-szerkesztés, húzás (pointer events) és billentyű-mozgatás ===== */
'use strict';

/* ---------- gerinc-részletek + megjelenés ---------- */
function bookPopup(b) {
  const prev = h('div', { class: 'lb-prev', 'aria-hidden': 'true' });
  const syncs = [];
  const paint = () => { clear(prev); const sl = slotEl(b, false); sl.classList.add('static'); prev.appendChild(sl); };
  const changed = () => { delete b.example; persist(); paint(); syncs.forEach(f => f()); };
  function chipRow(label, items, cur, set) {
    const chips = items.map(x => h('button', { type: 'button', class: 'chip sm', onclick: () => { set(x[1]); changed(); } }, x[0]));
    syncs.push(() => chips.forEach((c, i) => { const on = cur() === items[i][1]; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }));
    return h('div', { class: 'lb-opt' }, h('span', { class: 'lbl' }, label), h('div', { class: 'row wrap' }, chips));
  }
  const look = () => spineLook(b);
  const swatches = PALETTE.map(c => h('button', { type: 'button', class: 'lb-sw', style: { background: c }, title: c, 'aria-label': 'Szín: ' + c, onclick: () => { b.color = c; changed(); } }));
  const custom = h('input', { type: 'color', class: 'lb-color', 'aria-label': 'Saját szín', value: look().color, oninput: e => { b.color = e.target.value; changed(); } });
  syncs.push(() => { const cur = look().color.toLowerCase(); swatches.forEach((s, i) => s.classList.toggle('on', PALETTE[i] === cur)); custom.value = cur; });
  const colorRow = h('div', { class: 'lb-opt' }, h('span', { class: 'lbl' }, 'Szín'), h('div', { class: 'lb-sws' }, swatches, h('label', { class: 'lb-sw custom', title: 'Saját szín választása' }, custom, ic('plus', 14))));

  const sel = h('select', { id: 'lb-shelf', 'aria-label': 'Polc', onchange: e => moveToShelf(b.id, e.target.value) }, S.shelves.map(s => h('option', { value: s.id, selected: s.ids.indexOf(b.id) >= 0 }, s.name)));
  const info = h('div', { class: 'lb-info' },
    h('h3', null, b.title), b.author ? h('div', { class: 'bk-author' }, b.author) : null,
    h('div', { class: 'bk-tags' }, Engine.splitList(b.genre).map(g => h('span', { class: 'pill' }, g)), Engine.splitList(b.mood).map(g => h('span', { class: 'pill mood' }, g)), +b.pages ? h('span', { class: 'bk-pages' }, b.pages + ' oldal') : null),
    b.note ? h('div', { class: 'bk-note' }, b.note) : null);

  paint();
  const m = openModal({
    title: 'Könyv', wide: true, cls: 'lb-modal',
    body: [
      h('div', { class: 'lb-top' }, prev, info),
      chipRow('Státusz', STATUSES.map(s => [s[1], s[0]]), () => b.status, v => { b.status = v; }),
      h('div', { class: 'lb-sec' }, h('h4', null, 'Megjelenés a polcon'),
        colorRow,
        chipRow('Stílus', SPINE_STYLES.map((n, i) => [n, i]).concat([['Auto', null]]), () => (b.style == null ? null : b.style), v => { if (v == null) delete b.style; else b.style = v; }),
        chipRow('Magasság', SPINE_H.map(x => [x[0], x[1]]).concat([['Auto', null]]), () => (b.h == null ? null : b.h), v => { if (v == null) delete b.h; else b.h = v; }),
        chipRow('Vastagság', SPINE_TH.map(x => [x[0], x[1]]), () => b.th || 0, v => { if (v) b.th = v; else delete b.th; }),
        h('div', { class: 'row wrap' }, btn('Megjelenés alaphelyzetbe', { kind: 'ghost sm', onclick: () => { ['color', 'style', 'h', 'th'].forEach(k => delete b[k]); changed(); } }))),
      h('div', { class: 'field lb-shelfsel' }, h('label', { for: 'lb-shelf' }, 'Melyik polcon áll'), sel)
    ],
    actions: [
      { label: 'Törlés', kind: 'danger', icon: 'trash', onClick: () => { setTimeout(() => deleteBook(b), 0); } },
      { label: 'Szerkesztés', icon: 'edit', onClick: () => { setTimeout(() => bookModal(b), 0); } },
      { label: 'Kész', kind: 'primary' }
    ],
    onClose: () => { if ($('.lb')) drawLibrary(); }, focus: '.btn.primary'
  });
  syncs.forEach(f => f());
  return m;
}

/* ---------- billentyűk ---------- */
function libKey(e) {
  const sp = e.target.closest && e.target.closest('.lb-sp'); if (!sp) return;
  const k = e.key, id = sp.dataset.id;
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (SH.edit && e.shiftKey) {
    if (k === 'ArrowLeft') { e.preventDefault(); moveBook(id, -1, 0); }
    else if (k === 'ArrowRight') { e.preventDefault(); moveBook(id, 1, 0); }
    else if (k === 'ArrowUp') { e.preventDefault(); moveBook(id, 0, -1); }
    else if (k === 'ArrowDown') { e.preventDefault(); moveBook(id, 0, 1); }
    return;
  }
  if (!e.shiftKey && (k === 'ArrowLeft' || k === 'ArrowRight')) {
    const all = $$('.lb-sp'), n = all[all.indexOf(sp) + (k === 'ArrowLeft' ? -1 : 1)];
    if (n) { e.preventDefault(); n.focus(); }
  }
}

/* ---------- húzás (egér + érintés; csak „Átrendezés” módban) ---------- */
const DND = { s: null, dragged: false };
function dndStart(e) {
  if (!SH.edit || e.button !== 0 || DND.s) return;
  const sp = e.target.closest && e.target.closest('.lb-sp'); if (!sp) return;
  DND.s = { id: sp.dataset.id, sp: sp, slot: sp.parentNode, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, gap: null, ghost: null, raf: 0, last: '' };
  window.addEventListener('pointermove', dndMove);
  window.addEventListener('pointerup', dndEnd);
  window.addEventListener('pointercancel', dndEnd);
  window.addEventListener('keydown', dndKey, true);
}
function dndMove(e) {
  const s = DND.s; if (!s) return;
  s.x = e.clientX; s.y = e.clientY;
  if (s.on) { e.preventDefault(); return; }
  if (Math.hypot(s.x - s.x0, s.y - s.y0) < 6) return;
  s.on = true; DND.dragged = true;
  const r = s.slot.getBoundingClientRect(), br = s.sp.getBoundingClientRect();
  s.w = r.width; s.hh = br.height;
  const css = s.slot.getAttribute('style') || '';
  s.ghost = h('div', { class: 'lb-ghost', style: { width: br.width + 'px', height: br.height + 'px' } }, s.sp.cloneNode(true));
  s.ghost.style.cssText += ';' + css;
  document.body.appendChild(s.ghost);
  s.gap = h('div', { class: 'lb-slot lb-gap' }); s.gap.style.cssText = css; s.gap.style.width = r.width + 'px';
  s.slot.parentNode.insertBefore(s.gap, s.slot);
  s.slot.classList.add('lb-src');
  document.documentElement.classList.add('dragging');
  s.raf = requestAnimationFrame(dndTick);
}
function dndTick() {
  const s = DND.s; if (!s || !s.on) return;
  s.ghost.style.transform = 'translate(' + Math.round(s.x - s.w / 2) + 'px,' + Math.round(s.y - s.hh * 0.6) + 'px) rotate(4deg)';
  const vh = window.innerHeight;
  if (s.y < 80) window.scrollBy(0, -Math.ceil((80 - s.y) / 4)); else if (s.y > vh - 80) window.scrollBy(0, Math.ceil((s.y - (vh - 80)) / 4));
  const key = s.x + ',' + s.y + ',' + window.scrollY;
  if (key !== s.last) { s.last = key; dndTarget(s); }
  s.raf = requestAnimationFrame(dndTick);
}
function dndTarget(s) {
  const el = document.elementFromPoint(s.x, s.y); if (!el || (el.closest && el.closest('.lb-gap'))) return;
  let row = el.closest('.lb-row');
  if (!row) { const cs = el.closest('.lb-case'); if (cs) row = cs.querySelector('.lb-row'); }
  if (!row) return;
  const hit = el.closest('.lb-slot');
  let ref = null;
  if (hit && hit !== s.slot && row.contains(hit)) {
    const r = hit.getBoundingClientRect(); ref = s.x < r.left + r.width / 2 ? hit : hit.nextElementSibling;
  } else {
    let sameLine = null, before = null;
    for (const sl of row.children) {
      if (!sl.classList.contains('lb-slot') || sl === s.gap || sl === s.slot) continue;
      const r = sl.getBoundingClientRect();
      if (s.y >= r.top && s.y <= r.bottom) { sameLine = sl; if (s.x < r.left + r.width / 2) { before = sl; break; } }
    }
    ref = before || (sameLine ? sameLine.nextElementSibling : null);
  }
  if (ref === s.gap) return;
  if (s.gap.parentNode === row && s.gap.nextElementSibling === ref) return;
  const empty = row.querySelector('.lb-empty'); if (empty) empty.style.display = 'none';
  row.insertBefore(s.gap, ref);
}
function dndKey(e) { if (e.key === 'Escape' && DND.s && DND.s.on) { e.preventDefault(); e.stopPropagation(); DND.s.cancel = true; dndEnd(e); } }
function dndEnd(e) {
  const s = DND.s; DND.s = null;
  window.removeEventListener('pointermove', dndMove);
  window.removeEventListener('pointerup', dndEnd);
  window.removeEventListener('pointercancel', dndEnd);
  window.removeEventListener('keydown', dndKey, true);
  if (!s) return;
  cancelAnimationFrame(s.raf);
  if (!s.on) return;
  document.documentElement.classList.remove('dragging');
  if (s.ghost) s.ghost.remove();
  setTimeout(() => { DND.dragged = false; }, 0);
  const abort = s.cancel || (e && e.type === 'pointercancel');
  if (!abort) {
    const rows = $$('.lb-row'), lists = rows.map(r => Array.from(r.children).map(c => c === s.gap ? s.id : c === s.slot ? null : c.dataset && c.dataset.id).filter(Boolean));
    const total = lists.reduce((n, a) => n + a.length, 0);
    if (rows.length === S.shelves.length && total === S.books.length + (S.decor || []).length) { lists.forEach((a, i) => { S.shelves[i].ids = a; }); persist(); }
  }
  drawLibrary();
  const f = $('.lb-sp[data-id="' + s.id + '"]'); if (f && !abort) f.focus({ preventScroll: true });
}
