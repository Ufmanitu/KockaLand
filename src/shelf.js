/* ===== Könyvespolc: lista, szűrés, szerkesztés, import (CSV / JSON / Goodreads / sorok), export ===== */
'use strict';

const STATUSES = [['olvasatlan', 'Olvasatlan'], ['olvasom', 'Olvasom'], ['elolvastam', 'Elolvastam']];
const stLabel = s => (STATUSES.find(x => x[0] === s) || STATUSES[0])[1];
const SH = { q: '', genre: '', status: '', sort: 'added', limit: 60, edit: false, lq: '' };

const GENRE_MAP = {
  fantasy: 'Fantasy', 'urban-fantasy': 'Fantasy', 'epic-fantasy': 'Fantasy', 'science-fiction': 'Sci-fi', 'sci-fi': 'Sci-fi', scifi: 'Sci-fi', 'sci-fi-fantasy': 'Sci-fi', sf: 'Sci-fi', 'tudomanyos-fantasztikus': 'Sci-fi',
  mystery: 'Krimi', crime: 'Krimi', detective: 'Krimi', krimi: 'Krimi', 'mystery-thriller': 'Krimi', thriller: 'Thriller', suspense: 'Thriller', romance: 'Romantikus', romantikus: 'Romantikus', 'romantic': 'Romantikus',
  'historical-fiction': 'Történelmi regény', historical: 'Történelmi regény', 'torteneli-regeny': 'Történelmi regény', horror: 'Horror', 'young-adult': 'Ifjúsági', ya: 'Ifjúsági', teen: 'Ifjúsági', ifjusagi: 'Ifjúsági',
  humor: 'Humor', comedy: 'Humor', humoros: 'Humor', 'non-fiction': 'Ismeretterjesztő', nonfiction: 'Ismeretterjesztő', history: 'Ismeretterjesztő', science: 'Ismeretterjesztő', biography: 'Ismeretterjesztő', ismeretterjeszto: 'Ismeretterjesztő',
  fiction: 'Regény', literature: 'Regény', classics: 'Regény', 'literary-fiction': 'Regény', novel: 'Regény', regeny: 'Regény', dystopia: 'Disztópia', dystopian: 'Disztópia', disztopia: 'Disztópia',
  children: 'Mese', childrens: 'Mese', 'children-s': 'Mese', fairy: 'Mese', mese: 'Mese'
};
const SKIP_SHELVES = new Set(['to-read', 'read', 'currently-reading', 'favorites', 'favourites', 'owned', 'wishlist', 'kindle', 'audiobook', 'did-not-finish', 'dnf']);
function normGenres(str) {
  return Engine.uniq(Engine.splitList(str).map(g => { const s = Engine.slug(g); if (SKIP_SHELVES.has(s)) return null; return GENRE_MAP[s] || (g.trim().charAt(0).toUpperCase() + g.trim().slice(1)); }).filter(Boolean)).join(', ');
}
const bookKey = b => Engine.slug(b.title) + '|' + Engine.slug(b.author || '');
const hueOf = s => { let x = 7; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 360; return x; };
const newBook = o => Object.assign({ id: Engine.uid(), title: '', author: '', genre: '', mood: '', pages: 0, status: 'olvasatlan', note: '' }, o || {});

/* ---------- nézet: két fül (Könyvtár = vizuális polcok, Szerkesztés = lista) ---------- */
const shelfTab = () => (S.ui.shelfTab === 'list' ? 'list' : 'lib');
function renderShelf() {
  l3Hide();
  const root = h('section', { class: 'shelf view-in' });
  const tab = shelfTab();
  root.appendChild(h('div', { class: 'page-title' }, h('h1', null, 'Könyvtár'), h('p', null, 'A Könyv téma a polcaidról sorsol. Rendezd át, színezd őket, vagy szerkeszd a listát.')));
  root.appendChild(h('div', { class: 'row wrap lb-tabs', role: 'tablist', 'aria-label': 'Nézet' }, [['lib', 'Könyvtár', 'book'], ['list', 'Szerkesztés', 'list']].map(x =>
    h('button', { type: 'button', role: 'tab', class: 'chip' + (tab === x[0] ? ' on' : ''), 'aria-selected': tab === x[0], onclick: () => { if (tab === x[0]) return; S.ui.shelfTab = x[0]; SH.edit = false; persist(); renderShelf(); } }, ic(x[2], 16), x[1]))));
  const body = h('div', { class: 'shelf-body' });
  root.appendChild(body);
  clear($('#view')).appendChild(root);
  drawShelf();
}
function drawShelf() { if (shelfTab() === 'lib') drawLibrary(); else drawEdit(); }
function emptyShelfPanel() {
  return h('div', { class: 'panel empty-shelf' }, h('div', { class: 'big' }, '📚'), h('h2', null, 'A polc még üres'), h('p', { class: 'muted' }, 'Vegyél fel könyveket kézzel, importáld a listádat (például Goodreads exportot), vagy töltsd be a példákat.'),
    h('div', { class: 'row wrap', style: { justifyContent: 'center' } }, btn('Új könyv', { icon: 'plus', kind: 'primary', onclick: () => bookModal() }), btn('Importálás', { icon: 'import', onclick: importModal }),
      btn('A valódi polc betöltése', { kind: 'ghost', onclick: () => { const l = Seed.library(); S.books = l.books; S.shelves = l.shelves; persist(); drawShelf(); } })));
}
function drawEdit() {
  const body = $('.shelf-body'); if (!body) return;
  const y = window.scrollY;
  clear(body);
  const all = S.books;
  const cnt = k => all.filter(b => b.status === k).length;
  const examples = all.filter(b => b.example).length;

  body.appendChild(h('div', { class: 'shelf-stats' },
    stat(all.length, 'könyv a polcon'), stat(cnt('olvasatlan'), 'olvasatlan'), stat(cnt('olvasom'), 'olvasom épp'), stat(cnt('elolvastam'), 'elolvasva')));

  if (examples) body.appendChild(h('div', { class: 'panel banner' },
    h('div', { class: 'grow' }, h('b', null, 'Ezek példakönyvek.'), ' Töröld őket, és vedd fel a sajátjaidat, vagy tartsd meg, ami tetszik.'),
    btn('Példák törlése', { icon: 'trash', kind: 'sm danger', onclick: deleteExamples }),
    btn('Megtartom őket', { kind: 'sm', onclick: () => { S.books.forEach(b => { delete b.example; }); persist(); drawShelf(); } })));

  /* eszköztár */
  const genres = Engine.uniq([].concat.apply([], all.map(b => Engine.splitList(b.genre)))).sort((a, b) => a.localeCompare(b, 'hu'));
  const search = h('input', { type: 'search', id: 'sh-q', placeholder: 'Keresés cím, szerző, műfaj szerint…', 'aria-label': 'Keresés', value: SH.q, oninput: e => { SH.q = e.target.value; SH.limit = 60; drawList(); } });
  const gsel = h('select', { 'aria-label': 'Műfaj szűrő', onchange: e => { SH.genre = e.target.value; SH.limit = 60; drawList(); } }, h('option', { value: '' }, 'Minden műfaj'), genres.map(g => h('option', { value: g, selected: SH.genre === g }, g)));
  const ssel = h('select', { 'aria-label': 'Rendezés', onchange: e => { SH.sort = e.target.value; drawList(); } }, [['added', 'Hozzáadás sorrendje'], ['title', 'Cím szerint'], ['author', 'Szerző szerint'], ['pages', 'Oldalszám szerint']].map(x => h('option', { value: x[0], selected: SH.sort === x[0] }, x[1])));
  const chips = h('div', { class: 'row wrap st-chips', role: 'group', 'aria-label': 'Státusz szűrő' }, [['', 'Mind']].concat(STATUSES).map(x => h('button', { type: 'button', class: 'chip' + (SH.status === x[0] ? ' on' : ''), 'aria-pressed': SH.status === x[0], onclick: () => { SH.status = x[0]; SH.limit = 60; drawShelf(); } }, x[1])));
  body.appendChild(h('div', { class: 'shelf-tools' },
    h('div', { class: 'row wrap' }, h('div', { class: 'grow search-wrap' }, search), gsel, ssel),
    h('div', { class: 'row wrap' }, chips, h('span', { class: 'spacer' }),
      btn('Új könyv', { icon: 'plus', kind: 'primary sm', onclick: () => bookModal() }),
      btn('Importálás', { icon: 'import', kind: 'sm', onclick: importModal }),
      btn('Exportálás', { icon: 'export', kind: 'sm', onclick: exportModal }))));

  const list = h('div', { class: 'book-list', id: 'book-list' });
  body.appendChild(list);
  body.appendChild(h('div', { class: 'more-wrap', id: 'more-wrap' }));
  drawList();
  window.scrollTo({ top: y });
}
const stat = (n, l) => h('div', { class: 'stat' }, h('b', null, String(n)), h('span', null, l));

function filteredBooks() {
  const q = Engine.slug(SH.q);
  let arr = S.books.filter(b => {
    if (SH.status && b.status !== SH.status) return false;
    if (SH.genre && Engine.splitList(b.genre).indexOf(SH.genre) < 0) return false;
    if (q && Engine.slug([b.title, b.author, b.genre, b.mood].join(' ')).indexOf(q) < 0) return false;
    return true;
  });
  const cmp = { title: (a, b) => a.title.localeCompare(b.title, 'hu'), author: (a, b) => (a.author || '~').localeCompare(b.author || '~', 'hu'), pages: (a, b) => (+a.pages || 1e9) - (+b.pages || 1e9) }[SH.sort];
  if (cmp) arr = arr.slice().sort(cmp);
  return arr;
}
function drawList() {
  const list = $('#book-list'), more = $('#more-wrap'); if (!list) return;
  clear(list); clear(more);
  const arr = filteredBooks();
  if (!S.books.length) {
    list.appendChild(emptyShelfPanel());
    return;
  }
  if (!arr.length) { list.appendChild(h('p', { class: 'muted empty-note' }, 'Nincs a szűrésnek megfelelő könyv.')); return; }
  arr.slice(0, SH.limit).forEach(b => list.appendChild(bookCard(b)));
  if (arr.length > SH.limit) more.appendChild(btn('Még ' + (arr.length - SH.limit) + ' könyv mutatása', { onclick: () => { SH.limit += 80; drawList(); } }));
  else if (arr.length > 20) more.appendChild(h('span', { class: 'muted small' }, plural(arr.length, 'könyv', 'könyv') + ' összesen'));
}
function bookCard(b) {
  const hue = hueOf(b.title);
  const st = h('button', { type: 'button', class: 'st st-' + b.status, title: 'Kattints a státusz váltásához', onclick: () => { const i = STATUSES.findIndex(x => x[0] === b.status); b.status = STATUSES[(i + 1) % 3][0]; persist(); drawShelf(); } }, stLabel(b.status));
  return h('article', { class: 'book', style: { '--hue': hue } },
    h('div', { class: 'spine', 'aria-hidden': 'true' }),
    h('div', { class: 'bk-main' },
      h('h3', null, b.title), b.author ? h('div', { class: 'bk-author' }, b.author) : null,
      h('div', { class: 'bk-tags' }, Engine.splitList(b.genre).map(g => h('span', { class: 'pill' }, g)), Engine.splitList(b.mood).map(g => h('span', { class: 'pill mood' }, g)), +b.pages ? h('span', { class: 'bk-pages' }, b.pages + ' oldal') : null),
      b.note ? h('div', { class: 'bk-note' }, b.note) : null),
    h('div', { class: 'bk-side' }, st, h('div', { class: 'row' }, iconBtn('edit', 'Szerkesztés', () => bookModal(b), 'sm'), iconBtn('trash', 'Törlés', () => deleteBook(b), 'sm danger'))));
}
function deleteBook(b) {
  const i = S.books.indexOf(b), snap = JSON.stringify(S.shelves || []); S.books.splice(i, 1); persist(); drawShelf();
  toastAction('Törölve: ' + b.title, 'Visszavonás', () => { S.books.splice(i, 0, b); S.shelves = JSON.parse(snap); persist(); drawShelf(); });
}

/* ---------- könyv űrlap ---------- */
function bookModal(b) {
  const editing = !!b, d = b || newBook();
  const f = {
    title: h('input', { type: 'text', id: 'bk-title', value: d.title, maxlength: 140 }),
    author: h('input', { type: 'text', id: 'bk-author', value: d.author, maxlength: 100 }),
    genre: h('input', { type: 'text', id: 'bk-genre', value: d.genre, placeholder: 'pl. Krimi, Thriller' }),
    mood: h('input', { type: 'text', id: 'bk-mood', value: d.mood, placeholder: 'pl. izgalmas' }),
    pages: h('input', { type: 'number', id: 'bk-pages', value: d.pages || '', min: 0, max: 5000, inputmode: 'numeric' }),
    status: h('select', { id: 'bk-status' }, STATUSES.map(x => h('option', { value: x[0], selected: d.status === x[0] }, x[1]))),
    note: h('textarea', { id: 'bk-note', rows: 2, maxlength: 300, placeholder: 'Opcionális: ki ajánlotta, hol tartasz, stb.' })
  };
  f.note.value = d.note || '';
  const chipsFor = (input, items) => h('div', { class: 'tagpick' }, items.map(g => {
    const c = h('button', { type: 'button', class: 'tagchip', onclick: () => {
      const parts = Engine.splitList(input.value), i = parts.findIndex(x => Engine.slug(x) === Engine.slug(g));
      if (i >= 0) parts.splice(i, 1); else parts.push(g);
      input.value = parts.join(', ');
    } }, g);
    return c;
  }));
  const knownGenres = Engine.uniq(Seed.BOOK_GENRES.concat([].concat.apply([], S.books.map(x => Engine.splitList(x.genre)))));
  const knownMoods = Engine.uniq(Seed.BOOK_MOODS.concat([].concat.apply([], S.books.map(x => Engine.splitList(x.mood)))));
  const m = openModal({
    title: editing ? 'Könyv szerkesztése' : 'Új könyv', wide: true,
    body: [
      h('div', { class: 'fields' }, field('Cím *', 'bk-title', f.title), field('Szerző', 'bk-author', f.author)),
      field('Műfaj', 'bk-genre', f.genre), chipsFor(f.genre, knownGenres),
      field('Hangulat', 'bk-mood', f.mood), chipsFor(f.mood, knownMoods),
      h('div', { class: 'fields' }, field('Oldalszám', 'bk-pages', f.pages), field('Státusz', 'bk-status', f.status)),
      field('Megjegyzés', 'bk-note', f.note)
    ],
    actions: [{ label: 'Mégse' }, {
      label: editing ? 'Mentés' : 'Hozzáadás', kind: 'primary', onClick: () => {
        const title = f.title.value.trim();
        if (!title) { toast('A cím kötelező.'); f.title.focus(); return false; }
        Object.assign(d, { title: title, author: f.author.value.trim(), genre: f.genre.value.trim(), mood: f.mood.value.trim(), pages: Math.max(0, parseInt(f.pages.value, 10) || 0), status: f.status.value, note: f.note.value.trim() });
        delete d.example;
        if (!editing) S.books.unshift(d);
        persist(); drawShelf(); toast(editing ? 'Mentve' : 'Könyv hozzáadva');
        offerGenres([d.genre]);
      }
    }], focus: '#bk-title'
  });
  const kd = e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); m.foot.querySelector('.btn.primary').click(); } };
  m.el.addEventListener('keydown', kd);
}
function field(label, id, input, hint) { return h('div', { class: 'field' }, h('label', { for: id }, label), input, hint ? h('span', { class: 'hint' }, hint) : null); }

/* új műfaj → felajánljuk a Könyv téma Műfaj kockájába */
function genreDice() { const out = []; S.themes.forEach(t => { if (!t.dice.some(d => d.kind === 'shelf')) return; const g = t.dice.find(d => d.role === 'genre'); if (g) out.push(g); }); return out; }
function offerGenres(list) {
  const dices = genreDice(); if (!dices.length) return;
  const want = Engine.uniq([].concat.apply([], list.map(Engine.splitList)));
  const missing = want.filter(g => dices.some(d => !d.options.some(o => o.g.indexOf(Engine.slug(g)) >= 0)));
  if (!missing.length) return;
  toastAction(plural(missing.length, 'új műfaj', 'új műfaj') + ' a polcon: ' + missing.slice(0, 3).join(', ') + (missing.length > 3 ? '…' : ''), 'Felveszem a Műfaj kockába', () => {
    dices.forEach(d => missing.forEach(g => { if (!d.options.some(o => o.g.indexOf(Engine.slug(g)) >= 0)) d.options.push(Engine.parseLine(g + ' #' + Engine.slug(g))); }));
    persist(); toast('A Műfaj kocka bővült');
  });
}

/* ---------- import ---------- */
function parseCSV(text, delim) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim() !== '')) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some(x => x.trim() !== '')) rows.push(row);
  return rows;
}
const HDR = {
  title: ['title', 'cim', 'konyv', 'konyvcim', 'name', 'nev'], author: ['author', 'szerzo', 'iro', 'authors', 'szerzok'],
  genre: ['genre', 'genres', 'mufaj', 'kategoria', 'bookshelves', 'shelves', 'tags', 'cimkek'], mood: ['mood', 'hangulat'],
  pages: ['pages', 'oldal', 'oldalszam', 'number-of-pages', 'page-count', 'pagecount', 'oldalak'], status: ['status', 'statusz', 'allapot', 'exclusive-shelf', 'read-status', 'reading-status'],
  note: ['note', 'notes', 'megjegyzes', 'jegyzet', 'my-review', 'review']
};
function mapStatus(v) {
  const s = Engine.slug(v);
  if (!s) return 'olvasatlan';
  if (/^(read|elolvastam|elolvasva|kesz|befejezett|done|finished|olvasott)$/.test(s)) return 'elolvastam';
  if (/^(currently-reading|olvasom|olvasas-alatt|reading|folyamatban|in-progress)$/.test(s)) return 'olvasom';
  return 'olvasatlan';
}
function cleanTitle(t) { return String(t || '').replace(/\s+\([^)]*#\d+[^)]*\)\s*$/, '').trim(); }  // "Dűne (Dune Chronicles #1)" → "Dűne"
function recToBook(r) {
  const b = newBook({ title: cleanTitle(r.title), author: String(r.author || '').trim(), genre: normGenres(r.genre), mood: String(r.mood || '').trim(), pages: Math.max(0, parseInt(r.pages, 10) || 0), status: mapStatus(r.status), note: String(r.note || '').trim().slice(0, 300) });
  return b.title ? b : null;
}
function parseBooksText(raw) {
  const text = String(raw || '').replace(/^\uFEFF/, '').trim();
  const out = { books: [], format: '', warnings: [] };
  if (!text) return out;
  if (text.slice(0, 4) === 'KZ1:') { out.warnings.push('Ez teljes mentés-kód. A Beállítások › Mentés részben tudod betölteni.'); return out; }
  // JSON
  if (/^[\[{]/.test(text)) {
    try {
      let j = JSON.parse(text); if (j && !Array.isArray(j)) j = j.books || j.konyvek || j.items || [];
      if (Array.isArray(j)) {
        out.format = 'JSON';
        j.forEach(x => {
          if (typeof x === 'string') { const p = parseLineBook(x); if (p) out.books.push(p); return; }
          const r = {}; Object.keys(x || {}).forEach(k => { const sk = Engine.slug(k); for (const f in HDR) if (HDR[f].indexOf(sk) >= 0 && r[f] == null) r[f] = Array.isArray(x[k]) ? x[k].join(', ') : x[k]; });
          const b = recToBook(r); if (b) out.books.push(b);
        });
        return out;
      }
    } catch (e) { out.warnings.push('A JSON hibás, sorokként próbálom értelmezni.'); }
  }
  // CSV (fejléc alapján)
  const first = text.split(/\r?\n/)[0];
  const delim = [',', ';', '\t'].map(d => [d, (first.match(new RegExp(d === '\t' ? '\\t' : '\\' + d, 'g')) || []).length]).sort((a, b) => b[1] - a[1])[0];
  if (delim[1] >= 1) {
    const rows = parseCSV(text, delim[0]);
    const head = rows[0].map(c => Engine.slug(c));
    const idx = {}; for (const f in HDR) { const i = head.findIndex(c => HDR[f].indexOf(c) >= 0); if (i >= 0) idx[f] = i; }
    if (idx.title != null) {
      out.format = head.indexOf('exclusive-shelf') >= 0 ? 'Goodreads CSV' : 'CSV';
      rows.slice(1).forEach(r => { const rec = {}; for (const f in idx) rec[f] = r[idx[f]]; const b = recToBook(rec); if (b) out.books.push(b); });
      return out;
    }
  }
  // sorok
  out.format = 'Sorok';
  text.split(/\r?\n/).forEach(l => { const b = parseLineBook(l); if (b) out.books.push(b); });
  if (out.books.length === 1 && !/[-–;\t]/.test(text)) out.warnings.push('Egyetlen sort láttam. Soronként egy könyvet írj: „Cím – Szerző”.');
  return out;
}
function parseLineBook(l) {
  l = String(l).trim(); if (!l || /^#/.test(l)) return null;
  let parts;
  if (/[;\t]/.test(l)) parts = l.split(/[;\t]/).map(x => x.trim());
  else if (/\s[–—-]\s/.test(l)) parts = l.split(/\s[–—-]\s/).map(x => x.trim());
  else if (/\sby\s/i.test(l)) { const p = l.split(/\sby\s/i); parts = [p[0].trim(), p.slice(1).join(' by ').trim()]; }
  else parts = [l];
  return recToBook({ title: parts[0], author: parts[1], genre: parts[2], mood: parts[3], pages: parts[4] });
}

function importModal() {
  const ta = h('textarea', { class: 'codebox', rows: 8, id: 'imp-text', spellcheck: 'false', placeholder: 'Illeszd be a listát ide, vagy válassz fájlt.\n\nPéldák:\nA kis herceg – Antoine de Saint-Exupéry\nDűne; Frank Herbert; Sci-fi; elgondolkodtató; 700' });
  const file = h('input', { type: 'file', id: 'imp-file', accept: '.csv,.json,.txt,.tsv,text/csv,application/json,text/plain', class: 'sr-only' });
  const fileBtn = h('label', { class: 'btn sm', for: 'imp-file' }, ic('import', 16), 'Fájl választása');
  const preview = h('div', { class: 'imp-preview' }, h('p', { class: 'muted' }, 'Az előnézet itt jelenik meg.'));
  let mode = 'add', parsed = { books: [] };
  const modeBox = h('div', { class: 'row wrap', role: 'radiogroup', 'aria-label': 'Importálás módja' },
    [['add', 'Hozzáadás a meglévőkhöz'], ['replace', 'Csere (a polc tartalma helyébe)']].map(x => h('label', { class: 'switch radio' }, h('input', { type: 'radio', name: 'imp-mode', checked: mode === x[0], onchange: () => { mode = x[0]; update(); } }), h('span', null, x[1]))));
  let m;
  function update() {
    parsed = parseBooksText(ta.value);
    clear(preview);
    if (!ta.value.trim()) { preview.appendChild(h('p', { class: 'muted' }, 'Az előnézet itt jelenik meg.')); setOk(0); return; }
    parsed.warnings.forEach(w => preview.appendChild(h('p', { class: 'flag c wide' }, ic('warn', 13), w)));
    if (!parsed.books.length) { if (!parsed.warnings.length) preview.appendChild(h('p', { class: 'muted' }, 'Nem találtam könyvet. Soronként egy könyv kell, vagy CSV fejléccel (cím, szerző, …).')); setOk(0); return; }
    const have = new Set(S.books.map(bookKey));
    const seen = new Set(); let dups = 0;
    parsed.books = parsed.books.filter(b => { const k = bookKey(b); if (seen.has(k)) { dups++; return false; } seen.add(k); return true; });
    const fresh = mode === 'replace' ? parsed.books.length : parsed.books.filter(b => !have.has(bookKey(b))).length;
    preview.appendChild(h('p', null, h('b', null, parsed.format + ': '), plural(parsed.books.length, 'könyv', 'könyv') + ' felismerve' + (mode === 'add' ? ', ebből ' + fresh + ' új' : '') + (dups ? ', ' + dups + ' ismétlődés kihagyva' : '') + '.'));
    const tb = h('table', { class: 'imp-table' }, h('thead', null, h('tr', null, ['Cím', 'Szerző', 'Műfaj', 'Oldal', 'Státusz'].map(x => h('th', null, x)))),
      h('tbody', null, parsed.books.slice(0, 8).map(b => h('tr', { class: mode === 'add' && have.has(bookKey(b)) ? 'dup' : '' }, h('td', null, b.title), h('td', null, b.author), h('td', null, b.genre), h('td', null, b.pages || ''), h('td', null, stLabel(b.status))))));
    preview.appendChild(h('div', { class: 'tbl-wrap' }, tb));
    if (parsed.books.length > 8) preview.appendChild(h('p', { class: 'muted small' }, '… és még ' + (parsed.books.length - 8) + ' könyv.'));
    setOk(mode === 'replace' ? parsed.books.length : fresh);
  }
  function setOk(n) { const b = m && m.foot && m.foot.querySelector('.btn.primary'); if (b) { b.disabled = n < 1; b.querySelector('span').textContent = n ? 'Importálás (' + n + ')' : 'Importálás'; } }
  let tm; ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(update, 250); });
  file.addEventListener('change', () => {
    const f = file.files && file.files[0]; if (!f) return;
    if (f.size > 4e6) { toast('A fájl túl nagy (max. 4 MB).'); return; }
    const rd = new FileReader();
    rd.onload = () => { ta.value = String(rd.result || ''); update(); };
    rd.onerror = () => toast('A fájlt nem sikerült beolvasni.');
    rd.readAsText(f, 'utf-8');
  });
  m = openModal({
    title: 'Könyvek importálása', wide: true,
    body: [h('p', { class: 'muted' }, 'Elfogadott: Goodreads export (CSV), saját CSV (fejléc: cím, szerző, műfaj, hangulat, oldal, státusz), JSON lista, vagy egyszerű sorok („Cím – Szerző”).'),
      h('div', { class: 'row wrap' }, fileBtn, file, h('span', { class: 'muted small' }, 'vagy illeszd be a szöveget:')), ta, modeBox, preview],
    actions: [{ label: 'Mégse' }, {
      label: 'Importálás', kind: 'primary', icon: 'import', onClick: () => {
        if (!parsed.books.length) return false;
        const books = parsed.books.slice();
        if (mode === 'replace') { const old = S.books, oldSh = JSON.stringify(S.shelves || []); S.books = books; S.shelves = []; toastAction(plural(books.length, 'könyv', 'könyv') + ' a polcon (csere)', 'Visszavonás', () => { S.books = old; S.shelves = JSON.parse(oldSh); persist(); drawShelf(); }); }
        else { const have = new Set(S.books.map(bookKey)); const add = books.filter(b => !have.has(bookKey(b))); S.books = add.concat(S.books); toast(plural(add.length, 'könyv', 'könyv') + ' hozzáadva'); }
        S.books.forEach(b => { if (books.indexOf(b) >= 0) delete b.example; });
        persist(); drawShelf(); offerGenres(books.map(b => b.genre));
      }
    }], focus: '#imp-text'
  });
  setOk(0);
}

/* ---------- export ---------- */
const csvCell = v => { const s = String(v == null ? '' : v); return /[",;\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
function exportModal() {
  if (!S.books.length) { toast('A polc üres, nincs mit exportálni.'); return; }
  const mk = fmt => fmt === 'json'
    ? JSON.stringify(S.books.map(b => ({ cim: b.title, szerzo: b.author, mufaj: b.genre, hangulat: b.mood, oldal: b.pages || 0, statusz: b.status, megjegyzes: b.note || '' })), null, 2)
    : ['Cím,Szerző,Műfaj,Hangulat,Oldal,Státusz,Megjegyzés'].concat(S.books.map(b => [b.title, b.author, b.genre, b.mood, b.pages || '', b.status, b.note].map(csvCell).join(','))).join('\n');
  const ta = h('textarea', { class: 'codebox', rows: 12, readonly: true, spellcheck: 'false' });
  let fmt = 'csv'; ta.value = mk(fmt);
  const seg = h('div', { class: 'row' }, [['csv', 'CSV (táblázatkezelőbe)'], ['json', 'JSON']].map(x => h('button', { type: 'button', class: 'chip' + (fmt === x[0] ? ' on' : ''), onclick: e => { fmt = x[0]; ta.value = mk(fmt); $$('.chip', seg).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, x[1])));
  openModal({
    title: 'Polc exportálása', wide: true, body: [h('p', { class: 'muted' }, 'Másold ki a szöveget, és mentsd el egy fájlba. Később ugyanezt be tudod importálni.'), seg, ta],
    actions: [{ label: 'Bezár' }, { label: 'Másolás', kind: 'primary', icon: 'copy', onClick: () => { copyText(ta.value, ta); return false; } }], focus: 'textarea'
  });
}
