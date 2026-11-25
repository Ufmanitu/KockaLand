/* ===== Könyvtár (v2): valódi kinézetű polcok, gerincek; modell + rajzolás + rendezés =====
   Modell: S.shelves = [{id, name, ids:[könyvId…]}]; minden könyv pontosan egy polcon van (syncShelves gondoskodik róla).
   Könyv-megjelenés (opcionális mezők): color '#rrggbb', style 0-4, h 0.7-1 (magasság), th 1-3 (vastagság). Ha nincs, a címből számolt, stabil alapérték. */
'use strict';

const PALETTE = ['#5c1320', '#7a1b2e', '#8f1d2c', '#4a1627', '#3f1d38', '#2a1630', '#14192e', '#1b2a4a', '#34506b', '#17353b', '#1f4a4a', '#1f3a2c', '#4a4a22', '#4a2c1c', '#33201a', '#7b3a22', '#9c7a3c', '#25232a', '#14110f', '#3f4552', '#6b6560', '#d8ccb4', '#c9b891', '#e8dfcc'];   // dark romance: vérvörös, szilva, éjkék, erdőzöld, bőrbarna, fekete + 3 világos (csont, pergamen, elefántcsont)
const SPINE_STYLES = ['Sima', 'Csíkos', 'Díszes', 'Modern', 'Kopott', 'Bőrkötés', 'Keretes', 'Kéttónusú'];
const SPINE_H = [['Alacsony', 0.76], ['Közepes', 0.88], ['Magas', 1]];
const SPINE_TH = [['Auto', 0], ['Vékony', 1], ['Közepes', 2], ['Vastag', 3]];
const TH_W = [0, 28, 41, 57];
const hashStr = s => { let x = 5381; s = String(s); for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0; return x; };
const isHex = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16), L = (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
  return L > 0.6 ? '#2b1d12' : '#f7efdf';
}
function hueSortKey(hex) {   // színkör szerinti sorrend: előbb a színesek, a szürkék a végén (világosság szerint)
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d < 0.12) return 1000 + l;
  const hh = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return hh * 60 + l;
}
const lumOf = hex => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255; };
function spineLook(b) {
  const hs = hashStr(b.id + '|' + b.title);
  const color = isHex(b.color) ? b.color : PALETTE[hs % PALETTE.length], lum = lumOf(color);
  const style = b.style != null && b.style >= 0 && b.style < SPINE_STYLES.length ? b.style | 0 : (hs >>> 5) % SPINE_STYLES.length;
  const pr = (hs >>> 13) % 11, pat = b.pat != null && b.pat >= 0 && b.pat < SPINE_PATS.length ? b.pat | 0 : (pr > 8 ? 0 : pr);   // alapból a könyvek ~80%-a mintás
  const fp = lum < 0.45 ? [0, 0, 0, 1, 2, 5] : [3, 4, 3, 4, 2], acc = isHex(b.acc) ? b.acc : FOILS[fp[(hs >>> 17) % fp.length]][1];
  const k = b.h != null ? clamp(+b.h || 0.88, 0.6, 1) : [0.76, 0.82, 0.88, 0.94, 1][(hs >>> 9) % 5];
  const pages = +b.pages || 0;
  const auto = (pages ? 22 + clamp(pages, 60, 900) / 900 * 34 : 26 + (hs >>> 3) % 12) * 1.14;
  const w = Math.round(TH_W[b.th] || auto), ink = inkFor(color), metal = foilMetal(acc), contrast = Math.abs(lumOf(acc) - lum) > 0.4;
  const tfoil = metal && contrast && (style === 2 || style === 5 || style === 6);
  return { color: color, ink: ink, style: style, k: k, w: w, pat: pat, acc: acc, metal: metal, lum: lum, tfoil: tfoil, tink: tfoil ? acc : ink };
}

/* ---------- modell ---------- */
const firstGenre = b => Engine.splitList(b.genre)[0] || '';
function groupShelves(books, keyFn, minSize) {
  const groups = new Map();
  books.forEach(b => { const k = keyFn(b) || 'Egyéb'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(b.id); });
  const other = groups.get('Egyéb') || [];
  groups.forEach((ids, k) => { if (k !== 'Egyéb' && ids.length < minSize) { other.push.apply(other, ids); groups.delete(k); } });
  if (other.length) groups.set('Egyéb', other); else groups.delete('Egyéb');
  const arr = Array.from(groups.entries()).sort((a, b) => (a[0] === 'Egyéb') - (b[0] === 'Egyéb') || b[1].length - a[1].length || a[0].localeCompare(b[0], 'hu'));
  return arr.map(e => ({ id: Engine.uid(), name: e[0], ids: e[1] }));
}
function defaultShelves(books) {
  if (books.length >= 8) { const g = groupShelves(books, firstGenre, 3); if (g.length >= 2) return g; }
  return [{ id: Engine.uid(), name: 'Könyvespolc', ids: books.map(b => b.id) }];
}
function syncShelves() {
  if (!S) return;
  const firstTime = !Array.isArray(S.decor);
  S.decor = dragonMigrate(Array.isArray(S.decor) ? S.decor : []).filter(d => d && typeof d.id === 'string' && DECOR[d.type]);
  let wiped = 0; if (!S.settings.decor12) { wiped = S.decor.length; S.decor = []; S.settings.decor12 = true; }   // v12: a díszek újrakezdése — mindent levesz egyszer, utána egyszerre csak egy lehet kint
  const have = new Set(S.books.map(b => b.id).concat(S.decor.map(d => d.id))), seen = new Set();
  S.shelves = (Array.isArray(S.shelves) ? S.shelves : []).filter(s => s && Array.isArray(s.ids));
  S.shelves.forEach(s => {
    s.id = s.id || Engine.uid(); s.name = String(s.name || 'Polc').slice(0, 40);
    s.ids = s.ids.filter(id => have.has(id) && !seen.has(id) && (seen.add(id), true));
  });
  const missing = S.decor.filter(d => !seen.has(d.id)).map(d => d.id).concat(S.books.filter(b => !seen.has(b.id)).map(b => b.id));
  if (!S.shelves.length) S.shelves = defaultShelves(S.books);
  else if (missing.length) { const last = S.shelves[S.shelves.length - 1]; missing.forEach(id => last.ids.push(id)); }
  if (firstTime && !S.decor.length && window.__STARTER) { const st = starterDecor(); S.decor = st.decor; placeDecor(st.place, 0); }   // (csak a tesztek kérnek kezdő díszeket; az oldal díszek nélkül indul)
  if (S.adopted) { const n = S.adopted; S.adopted = 0; persist(); setTimeout(() => toast('Felkerült a valódi könyvespolc: ' + n + ' könyv, a fotók szerinti polcokkal. A régi példakönyvek lecserélődtek.'), 900); }
  if (wiped) { persist(); setTimeout(() => toast('A díszek lekerültek a polcról. A Díszek gombbal egyet felrakhatsz (egyszerre csak egy lehet kint).'), 700); }
  const cut = trimDecor(); if (cut > 0) { persist(); setTimeout(() => toast('Egyszerre csak ' + MAX_DECOR + ' dísz lehet kint, a többi lekerült a polcról. A Díszek gombbal bármikor cserélhetsz.'), 600); }
}
const shelfOf = id => S.shelves.find(s => s.ids.indexOf(id) >= 0);
const bookById = id => S.books.find(b => b.id === id);
function pickedBooks() {   // a Dobás nézeten épp kiválasztott könyvek: [{book, theme}]
  const out = [];
  S.themes.forEach(t => t.dice.forEach(d => {
    if (d.kind !== 'shelf') return;
    const r = RT[t.id], pk = r && r.picks[d.id];
    const bk = pk && pk.opt && pk.opt.book && bookById(pk.opt.book.id);
    if (bk && !out.some(x => x.book === bk)) out.push({ book: bk, theme: t });
  }));
  return out;
}

/* ---------- rajzolás ---------- */
const libLH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--lh'), 10) || 214;
function titleFit(b, L, lh) {   // betűméret + szerző-sáv magassága, hogy a cím lehetőleg kiférjen a gerincre
  const avail = L.k * (lh - 40) - 34, showA = L.w >= 34 && !!b.author;
  const aH = showA ? Math.min(avail * 0.36, b.author.length * 6) : 0;
  const tAvail = avail - aH - (showA ? 6 : 0);
  const fs = clamp(Math.floor(tAvail / (Math.max(4, b.title.length) * 0.54) * 2) / 2, 9.5, L.w < 30 ? 12 : 13.5);
  return { fs: fs, ah: Math.round(aH), showA: showA };
}
const spineBgCss = (b, L, lh) => { const u = spineBgUrl(b, L, L.w, Math.round(L.k * (lh - 40))); return u ? 'url(' + u + ')' : 'none'; };
function slotEl(b, picked, lh) {
  const L = spineLook(b), F = titleFit(b, L, lh || libLH());
  const cls = 'lb-sp s' + L.style + (L.pat ? ' pt' : '') + (picked ? ' picked' : '') + (b.status === 'olvasom' ? ' reading' : b.status === 'elolvastam' ? ' done' : '');
  const sp = h('button', { type: 'button', class: cls, dataset: { id: b.id }, title: b.title + (b.author ? ' – ' + b.author : '') + (picked ? ' (a dobásból kiválasztva)' : ''), 'aria-label': b.title + (b.author ? ', ' + b.author : '') + (picked ? ' (kiválasztva)' : '') },
    h('span', { class: 'lb-bk' },
      h('span', { class: 'lb-t' }, b.title),
      F.showA ? h('span', { class: 'lb-a' }, b.author) : null,
      b.status !== 'olvasatlan' ? h('i', { class: 'lb-mark', 'aria-hidden': 'true' }) : null));
  return h('div', { class: 'lb-slot', dataset: { id: b.id }, style: { '--c': L.color, '--ink': L.ink, '--tink': L.tink, '--bgimg': spineBgCss(b, L, lh || libLH()), '--w': L.w + 'px', '--k': String(L.k), '--fs': F.fs + 'px', '--ah': F.ah + 'px' } }, sp);
}
function libStats() {
  const n = S.books.length, dc = S.decor.length;
  return plural(n, 'könyv', 'könyv') + ' · ' + plural(S.shelves.length, 'polc', 'polc') + (dc ? ' · ' + dc + ' dísz' : '');
}
function drawLibrary() {
  const body = $('.shelf-body'); if (!body) return;
  const y = window.scrollY;
  clear(body);
  syncShelves();
  const pk = pickedBooks(), pkIds = new Set(pk.map(x => x.book.id));
  let use3 = false;   // 3D (Three.js) nézet, ha elérhető; különben a 2D tartalék
  if (l3Want()) { if (window.THREE) use3 = true; else l3Load(() => { if (S.ui.view === 'polc' && $('.lb') && shelfTab() === 'lib') drawLibrary(); }); }
  if (!use3) l3Hide();
  const root = h('div', { class: 'lb' + (SH.edit ? ' edit' : '') + (use3 ? ' l3' : '') });

  /* eszköztár */
  const find = h('input', { type: 'search', id: 'lb-q', placeholder: 'Keresés a polcokon…', 'aria-label': 'Keresés a polcokon', value: SH.lq || '', oninput: e => { SH.lq = e.target.value; applyLibFilter(); } });
  root.appendChild(h('div', { class: 'lb-bar' },
    h('div', { class: 'row wrap' }, h('div', { class: 'grow search-wrap' }, find), h('span', { class: 'muted small lb-count' }, libStats())),
    h('div', { class: 'row wrap' },
      btn('Új könyv', { icon: 'plus', kind: 'primary sm', onclick: () => bookModal() }),
      btn(SH.edit ? 'Kész az átrendezés' : 'Átrendezés', { icon: SH.edit ? 'check' : 'grip', kind: 'sm' + (SH.edit ? ' on' : ''), onclick: () => { SH.edit = !SH.edit; drawLibrary(); } }),
      btn('Rendezés…', { icon: 'shuffle', kind: 'sm', onclick: arrangeModal }),
      SH.edit ? btn('Új polc', { icon: 'plus', kind: 'sm', onclick: addShelf }) : null,
      btn('Díszek', { icon: 'sparkle', kind: 'sm', onclick: decorModal }),
      (use3 || (S.settings.view3d === false && l3GL() && !S.settings.lite)) ? btn(use3 ? '2D nézet' : '3D nézet', { icon: 'book', kind: 'sm', onclick: () => { S.settings.view3d = !use3; persist(); drawLibrary(); } }) : null,
      h('span', { class: 'spacer' }),
      btn('Importálás', { icon: 'import', kind: 'sm', onclick: importModal }),
      btn('Exportálás', { icon: 'export', kind: 'sm', onclick: exportModal }))));

  if (!SH.edit && S.books.some(b => b.example)) {
    root.appendChild(h('div', { class: 'panel banner' },
      h('div', { class: 'grow' }, h('b', null, 'Ezek példakönyvek.'), ' Töröld őket, és vedd fel a sajátjaidat, vagy tartsd meg, ami tetszik.'),
      btn('Példák törlése', { icon: 'trash', kind: 'sm danger', onclick: deleteExamples }),
      btn('Megtartom őket', { kind: 'sm', onclick: () => { S.books.forEach(b => { delete b.example; }); persist(); drawLibrary(); } })));
  }
  if (pk.length && !SH.edit) {
    root.appendChild(h('div', { class: 'lb-picked' }, ic('heart', 18),
      h('span', { class: 'grow' }, h('b', null, 'A dobásból: '), pk.map((x, i) => [i ? ', ' : '', h('em', null, x.book.title)])),
      btn('Megmutatom', { kind: 'sm', onclick: () => { const e = $('.lb-sp.picked'); if (e) { e.scrollIntoView({ block: 'center', behavior: motionOK() ? 'smooth' : 'auto' }); e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 1600); } } })));
  }
  root.appendChild(h('p', { class: 'muted small lb-hint' }, SH.edit
    ? 'Húzd át a könyveket másik helyre vagy másik polcra. Billentyűvel: Shift + nyilak (balra/jobbra a polcon belül, fel/le másik polcra). Kattintással a részletek nyílnak.'
    : 'Kattints egy gerincre: részletek, szín, stílus, státusz. Az „Átrendezés” gombbal húzással rakhatod a könyveket a helyükre.'));

  if (!S.books.length) root.appendChild(emptyShelfPanel());

  /* polcok: több könyvszekrény egymás mellett, ha elfér */
  const grid = h('div', { class: 'lb-shelves' }), lh = libLH();
  S.shelves.forEach((s, si) => {
    const head = h('header', { class: 'lb-head' },
      SH.edit ? h('input', { class: 'lb-name', value: s.name, maxlength: 40, 'aria-label': 'Polc neve', onchange: e => { s.name = e.target.value.trim() || 'Polc'; e.target.value = s.name; persist(); } }) : h('h2', null, s.name),
      h('span', { class: 'muted small' }, plural(s.ids.filter(i => !isDecorId(i)).length, 'könyv', 'könyv')),
      h('span', { class: 'spacer' }),
      SH.edit ? [iconBtn('up', 'Polc följebb', () => moveShelf(si, -1), 'sm' + (si === 0 ? ' off' : '')), iconBtn('down', 'Polc lejjebb', () => moveShelf(si, 1), 'sm' + (si === S.shelves.length - 1 ? ' off' : '')),
        iconBtn('trash', 'Polc törlése', () => deleteShelf(si), 'sm danger' + (S.shelves.length < 2 ? ' off' : ''))] : null);
    const row = h('div', { class: 'lb-row' + (use3 ? ' a11y' : ''), dataset: { shelf: s.id } });
    s.ids.forEach(id => {
      if (isDecorId(id)) { const d = decorById(id); if (d && DECOR[d.type]) row.appendChild(use3 ? l3DecorEl(d) : decorSlotEl(d)); return; }
      const b = bookById(id); if (b) row.appendChild(use3 ? l3SlotEl(b, pkIds.has(id)) : slotEl(b, pkIds.has(id), lh));
    });
    const empty = !s.ids.length ? h('span', { class: 'lb-empty muted small' }, SH.edit ? 'Üres polc: húzz ide könyvet.' : 'Üres polc.') : null;
    if (empty && !use3) row.appendChild(empty);
    grid.appendChild(h('section', { class: 'lb-case' + (s.ids.length > 16 ? ' wide' : '') }, head, h('div', { class: 'lb-frame' + (use3 ? ' f3' : '') }, row, use3 ? empty : null)));
  });
  root.appendChild(grid);

  root.addEventListener('click', libClick);
  root.addEventListener('keydown', libKey);
  if (!use3) root.addEventListener('pointerdown', dndStart);
  body.appendChild(root);
  if (use3 && !l3Mount(root)) { root.classList.remove('l3'); drawLibrary(); return; }
  applyLibFilter();
  window.scrollTo({ top: y });
  if (!use3) decorLifeStart(root);
}
function applyLibFilter() {
  const q = Engine.slug(SH.lq || '');
  $$('.lb-sp').forEach(sp => {
    const b = bookById(sp.dataset.id);
    sp.classList.toggle('dim', !!q && !!b && Engine.slug([b.title, b.author, b.genre, b.mood].join(' ')).indexOf(q) < 0);
  });
  if (L3.on) l3Filter();
}
function libClick(e) {
  const sp = e.target.closest && e.target.closest('.lb-sp'); if (!sp || DND.dragged) return;
  if (sp.classList.contains('lb-deco')) { if (SH.edit) decorPopup(sp); else decorClick(sp, e); return; }
  const b = bookById(sp.dataset.id); if (b) bookPopup(b);
}

/* ---------- polcok kezelése ---------- */
function addShelf() {
  S.shelves.push({ id: Engine.uid(), name: 'Polc ' + (S.shelves.length + 1), ids: [] });
  persist(); drawLibrary();
  const ins = $$('.lb-name'); const last = ins[ins.length - 1]; if (last) { last.focus(); last.select(); }
}
function moveShelf(i, d) {
  const j = i + d; if (j < 0 || j >= S.shelves.length) return;
  const t = S.shelves[i]; S.shelves[i] = S.shelves[j]; S.shelves[j] = t; persist(); drawLibrary();
}
function deleteShelf(i) {
  if (S.shelves.length < 2) { toast('Legalább egy polc maradjon.'); return; }
  const snap = JSON.stringify(S.shelves), s = S.shelves[i], to = S.shelves[i ? i - 1 : 1];
  to.ids = i ? to.ids.concat(s.ids) : s.ids.concat(to.ids);
  S.shelves.splice(i, 1); persist(); drawLibrary();
  toastAction('Polc törölve (' + s.name + '), a könyvei átkerültek ide: ' + to.name, 'Visszavonás', () => { S.shelves = JSON.parse(snap); persist(); drawLibrary(); });
}
function moveBook(id, dx, dy) {
  const si = S.shelves.findIndex(s => s.ids.indexOf(id) >= 0); if (si < 0) return;
  const sh = S.shelves[si], i = sh.ids.indexOf(id);
  if (dx) {
    const j = i + dx;
    if (j < 0 || j >= sh.ids.length) { const t = S.shelves[si + dx]; if (!t) return; sh.ids.splice(i, 1); if (dx < 0) t.ids.push(id); else t.ids.unshift(id); }
    else { sh.ids.splice(i, 1); sh.ids.splice(j, 0, id); }
  } else if (dy) {
    const t = S.shelves[si + dy]; if (!t) return; sh.ids.splice(i, 1); t.ids.splice(Math.min(i, t.ids.length), 0, id);
  }
  persist(); drawLibrary();
  const e = $('.lb-sp[data-id="' + id + '"]'); if (e) e.focus();
}
function moveToShelf(id, shelfId) {
  const from = shelfOf(id), to = S.shelves.find(s => s.id === shelfId); if (!from || !to || from === to) return;
  from.ids.splice(from.ids.indexOf(id), 1); to.ids.push(id); persist();
}
function deleteExamples() {
  const old = S.books.slice(), snap = JSON.stringify(S.shelves), n = S.books.filter(b => b.example).length;
  S.books = S.books.filter(b => !b.example); persist(); drawShelf();
  toastAction(n + ' példakönyv törölve', 'Visszavonás', () => { S.books = old; S.shelves = JSON.parse(snap); persist(); drawShelf(); });
}

/* ---------- automatikus rendezés ---------- */
const ARRANGE = [
  ['title', 'Cím szerint (A–Z)', 'sort'], ['author', 'Szerző szerint', 'sort'], ['color', 'Szín szerint (szivárvány)', 'sort'], ['pages', 'Vastagság szerint (vékonytól a vastagig)', 'sort'],
  ['genre', 'Műfaj szerint: külön polcok', 'group'], ['status', 'Státusz szerint: külön polcok', 'group']
];
function sortFn(key) {
  const hu = (a, b) => String(a).localeCompare(String(b), 'hu');
  return {
    title: (a, b) => hu(a.title, b.title),
    author: (a, b) => hu(a.author || '~', b.author || '~') || hu(a.title, b.title),
    color: (a, b) => hueSortKey(spineLook(a).color) - hueSortKey(spineLook(b).color),
    pages: (a, b) => (+a.pages || 1e9) - (+b.pages || 1e9) || hu(a.title, b.title)
  }[key];
}
function arrangeBooks(key, within) {
  const snap = JSON.stringify(S.shelves);
  syncShelves();
  const decorPos = [];   // csoportosításnál a díszek a régi polc-indexükre kerülnek (elejére/végére)
  S.shelves.forEach((sh, i) => sh.ids.forEach(id => { if (isDecorId(id)) decorPos.push([id, i, sh.ids[0] === id ? 'start' : 'end']); }));
  if (key === 'genre') S.shelves = groupShelves(S.books.slice().sort(sortFn('title')), firstGenre, 3);
  else if (key === 'status') {
    const names = { olvasom: 'Épp olvasom', olvasatlan: 'Még nem olvastam', elolvastam: 'Elolvastam' };
    S.shelves = ['olvasom', 'olvasatlan', 'elolvastam'].map(k => ({ id: Engine.uid(), name: names[k], ids: S.books.filter(b => b.status === k).sort(sortFn('title')).map(b => b.id) })).filter(s => s.ids.length);
    if (!S.shelves.length) S.shelves = defaultShelves(S.books);
  }
  if (key === 'genre' || key === 'status') decorPos.forEach(q => { const sh = S.shelves[Math.min(q[1], S.shelves.length - 1)]; if (q[2] === 'start') sh.ids.unshift(q[0]); else sh.ids.push(q[0]); });
  if (key !== 'genre' && key !== 'status') {
    const cmp = sortFn(key), sorted = ids => ids.filter(id => !isDecorId(id)).map(bookById).filter(Boolean).sort(cmp).map(b => b.id);
    const fill = (ids, pool) => { let i = 0; return ids.map(id => (isDecorId(id) ? id : pool[i++])); };   // a díszek a helyükön maradnak
    if (within) S.shelves.forEach(s => { s.ids = fill(s.ids, sorted(s.ids)); });
    else { const all = sorted([].concat.apply([], S.shelves.map(s => s.ids))); let p = 0; S.shelves.forEach(s => { const n = s.ids.filter(id => !isDecorId(id)).length; s.ids = fill(s.ids, all.slice(p, p + n)); p += n; }); }
  }
  persist(); drawLibrary();
  toastAction('Átrendezve', 'Visszavonás', () => { S.shelves = JSON.parse(snap); persist(); drawLibrary(); });
}
function arrangeModal() {
  let key = 'title', within = false;
  const keyBox = h('div', { class: 'ar-list', role: 'radiogroup', 'aria-label': 'Rendezés szempontja' }, ARRANGE.map(x => h('label', { class: 'switch radio' }, h('input', { type: 'radio', name: 'ar-key', checked: x[0] === key, onchange: () => { key = x[0]; upd(); } }), h('span', null, x[1]))));
  const inBox = h('label', { class: 'switch' }, h('input', { type: 'checkbox', onchange: e => { within = e.target.checked; } }), h('span', null, 'Csak a polcon belül rendezek (a könyvek nem lépnek át másik polcra)'));
  const note = h('p', { class: 'muted small' });
  function upd() {
    const g = ARRANGE.find(x => x[0] === key)[2] === 'group';
    inBox.hidden = g;
    note.textContent = g ? 'A polcok újra felépülnek: minden csoportnak saját polc jár, a neveket utána átírhatod. A megjelenés (szín, stílus) nem változik.' : 'A könyvek sorrendje változik, a polcok és a megjelenés nem.';
  }
  upd();
  openModal({ title: 'Polcok rendezése', body: [h('p', { class: 'muted' }, 'Egy gombnyomással sorba rakja a könyveidet. Visszavonható.'), keyBox, inBox, note], actions: [{ label: 'Mégse' }, { label: 'Rendezés', kind: 'primary', icon: 'shuffle', onClick: () => { setTimeout(() => arrangeBooks(key, within), 0); } }] });
}
