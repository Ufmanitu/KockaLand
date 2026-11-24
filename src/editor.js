/* ===== Szerkesztő: témák, kockák, opciók, új téma, kód ki/be ===== */
'use strict';

const EMOJIS = ['💞', '❤️', '💌', '🌹', '🕯️', '🥂', '🍷', '🍸', '☕', '🍰', '🍕', '🍝', '🍣', '🌮', '🍔', '🍓', '🥐', '🧁', '🍫', '✈️', '🚆', '🚗', '🚲', '⛵', '🏖️', '🏔️', '🏕️', '🌍', '🗺️', '🧳', '🎒', '🏨', '🎬', '🍿', '🎭', '🎞️', '📺', '🎶', '🎧', '🎤', '🎸', '🎨', '🖌️', '🧵', '🧶', '✂️', '🎁', '🎀', '📚', '📖', '✏️', '📝', '🏷️', '📏', '🗣️', '🪑', '🛋️', '🛁', '🏠', '📍', '⏰', '⏳', '⏱️', '🕑', '🌙', '⭐', '✨', '🌈', '🔥', '❄️', '🌸', '🌿', '🍂', '🌗', '🔮', '🪄', '🎲', '🎯', '🎮', '🧩', '♟️', '🎳', '📸', '💡', '🐾', '🤝', '⚡', '🌍', '🎡', '🛍️', '🧘', '🏃', '🚿'];
const COLORS = ['#a8233a', '#b5632a', '#a67a32', '#3a8060', '#2f7d86', '#4a63a8', '#6b4a9c', '#7d1d3a', '#5e2a45', '#6b7a8c'];
const E = { tid: null, open: {}, adv: {}, focus: null, lastField: null };

function toastAction(msg, label, fn) {
  let box = $('#toasts');
  if (!box) { box = h('div', { id: 'toasts' }); document.body.appendChild(box); }
  const t = h('div', { class: 'toast act', role: 'status', style: { pointerEvents: 'auto' } }, h('span', null, msg),
    h('button', { type: 'button', class: 'toast-btn', onclick: () => { fn(); t.remove(); } }, label));
  box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 6500);
}

function emojiModal(cb) {
  const grid = h('div', { class: 'emoji-grid' });
  const custom = h('input', { type: 'text', maxlength: '8', placeholder: 'Vagy írj / illessz be egyet…', 'aria-label': 'Saját emoji' });
  let m;
  EMOJIS.forEach(e => grid.appendChild(h('button', { type: 'button', class: 'emoji-btn', onclick: () => { cb(e); m.close(); } }, e)));
  m = openModal({
    title: 'Ikon választása', body: [grid, h('div', { class: 'field' }, custom)],
    actions: [{ label: 'Mégse' }, { label: 'Saját használata', kind: 'primary', onClick: () => { const v = custom.value.trim(); if (!v) { toast('Írj be egy emojit, vagy válassz a rácsból.'); return false; } cb(v); } }], focus: '.emoji-btn'
  });
}

/* ---------- fő nézet ---------- */
function renderEditor() {
  if (!E.tid || !themeById(E.tid)) E.tid = S.ui.themeId;
  const root = h('section', { class: 'editor view-in' },
    h('div', { class: 'page-title' }, h('h1', null, 'Szerkesztő'), h('p', null, 'Itt átírhatsz mindent: témákat, kockákat és a bennük lévő lehetőségeket. Minden változás azonnal mentődik.')),
    h('div', { class: 'editor-grid' }, h('div', { class: 'ed-side', id: 'ed-side' }), h('div', { class: 'ed-main', id: 'ed-main' })));
  clear($('#view')).appendChild(root);
  drawSide(); drawThemeEditor();
}
function drawSide() {
  const side = clear($('#ed-side'));
  S.themes.forEach(t => {
    const nopt = t.dice.reduce((a, d) => a + (d.options ? d.options.length : 0), 0);
    side.appendChild(h('button', {
      type: 'button', class: 'ed-theme' + (t.id === E.tid ? ' on' : ''), style: { '--tc': t.color }, 'aria-current': t.id === E.tid ? 'true' : null,
      onclick: () => { E.tid = t.id; drawSide(); drawThemeEditor(); window.scrollTo({ top: 0 }); }
    }, h('span', { class: 'et-e' }, t.emoji), h('span', { class: 'et-t' }, h('b', null, t.name), h('small', null, plural(t.dice.length, 'kocka', 'kocka') + ' · ' + nopt + ' opció'))));
  });
  side.appendChild(btn('Új téma', { icon: 'plus', kind: 'primary sm', onclick: () => newThemeModal(), cls: 'side-new' }));
  side.appendChild(btn('Téma importálása', { icon: 'import', kind: 'ghost sm', onclick: () => newThemeModal('kod'), cls: 'side-imp' }));
}

function drawThemeEditor(focusId) {
  const t = themeById(E.tid); if (!t) return;
  const y = window.scrollY;
  const main = clear($('#ed-main'));
  $('#app').style.setProperty('--tc', t.color);
  main.appendChild(themeCard(t));
  const hasShelf = t.dice.some(d => d.kind === 'shelf');
  main.appendChild(h('div', { class: 'ed-dice-head' }, h('h2', null, 'Kockák'), h('span', { class: 'muted small' }, 'Minden kocka egy szempont. Egy dobásnál mindegyikből kijön egy lehetőség.'),
    h('span', { class: 'spacer' }),
    btn('Új kocka', { icon: 'plus', kind: 'sm', onclick: () => addDie(t) }),
    !hasShelf ? btn('Könyvespolc-kocka', { icon: 'book', kind: 'sm', title: 'Olyan kocka, ami a Könyvespolcodról sorsol könyvet', onclick: () => addDie(t, true) }) : null));
  const list = h('div', { class: 'die-list' });
  t.dice.forEach((d, i) => list.appendChild(dieCard(t, d, i)));
  if (!t.dice.length) list.appendChild(h('p', { class: 'muted empty-note' }, 'Ennek a témának még nincs kockája. Adj hozzá egyet!'));
  main.appendChild(list);
  window.scrollTo({ top: y });
  if (E.focus) { const el = $('[data-fid="' + E.focus + '"]'); E.focus = null; if (el) { el.focus({ preventScroll: false }); if (el.select) el.select(); } }
}

/* ---------- téma kártya ---------- */
function themeCard(t) {
  const i = S.themes.indexOf(t);
  const emojiBtn = h('button', { type: 'button', class: 'icon-pick big', title: 'Ikon cseréje', onclick: () => emojiModal(v => { t.emoji = v; persist(); drawSide(); drawThemeEditor(); }) }, t.emoji);
  const name = h('input', { type: 'text', id: 'th-name', value: t.name, maxlength: 40, 'aria-label': 'A téma neve', oninput: e => { t.name = e.target.value; persist(); }, onchange: () => { if (!t.name.trim()) { t.name = 'Névtelen téma'; drawThemeEditor(); } drawSide(); } });
  const desc = h('textarea', { rows: 2, maxlength: 200, 'aria-label': 'Rövid leírás', placeholder: 'Egy mondat arról, mire jó ez a téma', oninput: e => { t.desc = e.target.value; persist(); } });
  desc.value = t.desc || '';
  const sw = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': 'Téma színe' });
  const paint = () => $$('.swatch', sw).forEach(b => b.classList.toggle('on', b.dataset.c.toLowerCase() === t.color.toLowerCase()));
  COLORS.forEach(c => sw.appendChild(h('button', { type: 'button', class: 'swatch', dataset: { c: c }, style: { background: c }, 'aria-label': 'Szín: ' + c, role: 'radio', onclick: () => { t.color = c; persist(); $('#app').style.setProperty('--tc', c); paint(); drawSide(); } })));
  sw.appendChild(h('input', { type: 'color', class: 'swatch-custom', value: t.color, 'aria-label': 'Saját szín', title: 'Saját szín', oninput: e => { t.color = e.target.value; persist(); $('#app').style.setProperty('--tc', t.color); paint(); }, onchange: () => drawSide() }));
  setTimeout(paint, 0);
  const canDel = S.themes.length > 1;
  return h('div', { class: 'panel theme-card' },
    h('div', { class: 'tc-top' }, emojiBtn,
      h('div', { class: 'field grow' }, h('label', { for: 'th-name' }, 'Téma neve'), name)),
    h('div', { class: 'field' }, h('label', null, 'Leírás'), desc),
    h('div', { class: 'field' }, h('label', null, 'Szín'), sw),
    h('div', { class: 'tc-actions' },
      btn('Dobás ezzel', { icon: 'dice', kind: 'primary sm', onclick: () => { S.ui.themeId = t.id; persist(); go('dobas'); } }),
      btn('Másolat', { icon: 'copy', kind: 'sm', onclick: () => duplicateTheme(t) }),
      btn('Kód (megosztás)', { icon: 'export', kind: 'sm', onclick: () => textBox('Téma kódja', makeCode({ v: 1, themes: [themeToCompact(t)] }), 'Másold ki ezt a kódot, és küldd el: a másik Kockázzunkban az „Új téma › Kód” fülön tudja beilleszteni.') }),
      h('span', { class: 'spacer' }),
      iconBtn('up', 'Előrébb a sorrendben', () => moveTheme(t, -1), i === 0 ? 'sm off' : 'sm'),
      iconBtn('down', 'Hátrébb a sorrendben', () => moveTheme(t, 1), i === S.themes.length - 1 ? 'sm off' : 'sm'),
      t.builtin ? btn('Alapok visszaállítása', { icon: 'undo', kind: 'ghost sm', onclick: () => resetTheme(t) }) : null,
      btn('Törlés', { icon: 'trash', kind: 'danger sm', disabled: !canDel, title: canDel ? '' : 'Legalább egy téma maradjon', onclick: () => deleteTheme(t) })));
}
function moveTheme(t, d) {
  const i = S.themes.indexOf(t), j = i + d;
  if (j < 0 || j >= S.themes.length) return;
  S.themes.splice(i, 1); S.themes.splice(j, 0, t); persist(); drawSide(); drawThemeEditor();
}
function duplicateTheme(t) {
  const c = themeFromCompact(themeToCompact(t));
  c.name = t.name + ' (másolat)'; c.builtin = false;
  S.themes.splice(S.themes.indexOf(t) + 1, 0, c); E.tid = c.id; persist(); drawSide(); drawThemeEditor(); toast('Másolat kész, ezt szerkesztheted szabadon');
}
async function resetTheme(t) {
  if (!await ask({ title: 'Alapok visszaállítása', text: 'A(z) „' + t.name + '” téma minden kockáját és opcióját visszaállítom az eredetire. A saját módosításaid elvesznek ebben a témában.', ok: 'Visszaállítom', danger: true })) return;
  const seed = Seed.themes().find(x => x.id === t.id); if (!seed) return;
  const i = S.themes.indexOf(t); S.themes[i] = seed; delete RT[t.id]; delete S.rolls[t.id]; persist(); drawSide(); drawThemeEditor(); toast('Visszaállítva');
}
function deleteTheme(t) {
  if (S.themes.length < 2) return;
  const i = S.themes.indexOf(t), saved = RT[t.id];
  S.themes.splice(i, 1); delete RT[t.id];
  if (S.ui.themeId === t.id) S.ui.themeId = S.themes[0].id;
  E.tid = S.themes[Math.min(i, S.themes.length - 1)].id;
  persist(); drawSide(); drawThemeEditor();
  toastAction('Törölve: ' + t.name, 'Visszavonás', () => { S.themes.splice(i, 0, t); if (saved) RT[t.id] = saved; E.tid = t.id; persist(); drawSide(); drawThemeEditor(); });
}

/* ---------- kocka ---------- */
function addDie(t, shelf) {
  const d = { id: 'd' + Engine.uid().slice(-8), name: shelf ? 'A könyv' : 'Új kocka', icon: shelf ? '📖' : '🎲', enabled: true, role: null, kind: shelf ? 'shelf' : undefined, options: shelf ? [] : Engine.parseLines('Első ötlet\nMásodik ötlet\nHarmadik ötlet') };
  t.dice.push(d); E.open[d.id] = true; E.focus = d.id + ':name'; persist(); drawThemeEditor();
}
function moveDie(t, d, dir) {
  const i = t.dice.indexOf(d), j = i + dir; if (j < 0 || j >= t.dice.length) return;
  t.dice.splice(i, 1); t.dice.splice(j, 0, d); persist(); drawThemeEditor();
}
function removeDie(t, d) {
  const i = t.dice.indexOf(d); t.dice.splice(i, 1);
  const r = RT[t.id]; const pk = r && r.picks[d.id], lk = r && r.locks[d.id];
  if (r) { delete r.picks[d.id]; delete r.locks[d.id]; }
  persist(); drawThemeEditor();
  toastAction('Kocka törölve: ' + d.name, 'Visszavonás', () => { t.dice.splice(i, 0, d); if (r && pk) { r.picks[d.id] = pk; if (lk) r.locks[d.id] = true; } persist(); drawThemeEditor(); });
}
function dieCard(t, d, idx) {
  const open = !!E.open[d.id];
  const shelf = d.kind === 'shelf';
  const cnt = h('span', { class: 'pill cnt' }, shelf ? 'polc' : String(d.options.length));
  const nameIn = h('input', { type: 'text', value: d.name, maxlength: 30, 'aria-label': 'A kocka neve', dataset: { fid: d.id + ':name' }, oninput: e => { d.name = e.target.value; persist(); }, onchange: () => { if (!d.name.trim()) { d.name = 'Kocka'; drawThemeEditor(); } } });
  const head = h('div', { class: 'die-head' },
    h('button', { type: 'button', class: 'icon-pick', title: 'Ikon cseréje', onclick: () => emojiModal(v => { d.icon = v; persist(); drawThemeEditor(); }) }, d.icon),
    h('div', { class: 'grow dn' }, nameIn),
    cnt,
    h('label', { class: 'switch mini', title: 'Ki/be: részt vesz-e a dobásban' }, h('input', { type: 'checkbox', checked: d.enabled !== false, 'aria-label': 'Bekapcsolva', onchange: e => { d.enabled = e.target.checked; persist(); card.classList.toggle('off', !d.enabled); } }), h('span', { class: 'tr' })),
    iconBtn('up', 'Feljebb', () => moveDie(t, d, -1), 'sm' + (idx === 0 ? ' off' : '')),
    iconBtn('down', 'Lejjebb', () => moveDie(t, d, 1), 'sm' + (idx === t.dice.length - 1 ? ' off' : '')),
    iconBtn(open ? 'up' : 'edit', open ? 'Összecsukás' : 'Opciók szerkesztése', () => { E.open[d.id] = !E.open[d.id]; drawThemeEditor(); }, 'sm tog' + (open ? ' on' : '')),
    iconBtn('trash', 'Kocka törlése', () => removeDie(t, d), 'sm danger'));
  const card = h('div', { class: 'panel die-card' + (open ? ' open' : '') + (d.enabled === false ? ' off' : ''), dataset: { die: d.id } }, head);
  if (open) card.appendChild(dieBody(t, d, cnt));
  else if (!shelf) card.appendChild(h('button', { type: 'button', class: 'die-peek', onclick: () => { E.open[d.id] = true; drawThemeEditor(); } },
    d.options.slice(0, 6).map(o => h('span', { class: 'peek-o' + (o.s ? ' s' : '') }, o.t)), d.options.length > 6 ? h('span', { class: 'peek-more' }, '+' + (d.options.length - 6) + ' további') : null,
    !d.options.length ? h('span', { class: 'muted' }, 'Még nincs opció: nyisd meg, és írj be párat') : null));
  return card;
}

function dieBody(t, d, cnt) {
  const body = h('div', { class: 'die-body' });
  const hasShelf = t.dice.some(x => x.kind === 'shelf');
  if (d.kind === 'shelf') {
    body.appendChild(h('p', { class: 'muted' }, 'Ez a kocka nem fix listából, hanem a Könyvespolcodról sorsol, a többi kocka (műfaj, hangulat, hossz) szűrése szerint.'));
    body.appendChild(btn('Könyvtár megnyitása', { icon: 'book', kind: 'sm', onclick: () => go('polc') }));
    return body;
  }
  if (hasShelf) {
    const sel = h('select', { id: 'role-' + d.id, 'aria-label': 'Szerep a könyv-választásban', onchange: e => { d.role = e.target.value || null; persist(); } },
      [['', 'Semmi (csak ötlet)'], ['genre', 'Műfaj-szűrő'], ['mood', 'Hangulat-szűrő'], ['length', 'Hossz-szűrő']].map(x => h('option', { value: x[0], selected: (d.role || '') === x[0] }, x[1])));
    body.appendChild(h('div', { class: 'field role-field' }, h('label', { for: 'role-' + d.id }, 'Szerepe a könyv-sorsolásban'), sel,
      h('span', { class: 'hint' }, 'A választott opció címkéi a polc könyveinek műfajára / hangulatára / hosszára szűkítik a találatot.')));
  }
  const box = h('div', { class: 'opts' });
  const filter = h('input', { type: 'search', placeholder: 'Szűrés az opciók között…', 'aria-label': 'Szűrés', class: 'opt-filter', hidden: d.options.length <= 12, oninput: () => applyFilter() });
  function applyFilter() { const q = Engine.slug(filter.value); $$('.orow', box).forEach(r => { r.hidden = !!q && Engine.slug(r.dataset.t || '').indexOf(q) < 0; }); }
  function fill() {
    clear(box);
    d.options.forEach(o => box.appendChild(optRow(t, d, o, fill)));
    cnt.textContent = String(d.options.length);
    filter.hidden = d.options.length <= 12;
    if (!d.options.length) box.appendChild(h('p', { class: 'muted empty-note' }, 'Még nincs opció. Írj be egyet lent, vagy használd a „Szövegként” szerkesztést.'));
    applyFilter();
  }
  const addIn = h('input', { type: 'text', placeholder: 'Új lehetőség, majd Enter…', 'aria-label': 'Új lehetőség', dataset: { fid: d.id + ':add' } });
  const doAdd = () => {
    const v = addIn.value.trim(); if (!v) return;
    const o = Engine.parseLine(v); if (!o.t) { toast('Írj be valamit az opció szövegéhez.'); return; }
    d.options.push(o); addIn.value = ''; persist(); fill(); addIn.focus();
    box.scrollTop = box.scrollHeight;
  };
  addIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } });
  body.appendChild(filter);
  body.appendChild(box);
  body.appendChild(h('div', { class: 'addrow' }, addIn, btn('Hozzáad', { icon: 'plus', kind: 'primary sm', onclick: doAdd })));
  body.appendChild(h('div', { class: 'die-tools' },
    btn('Szövegként szerkesztem', { icon: 'list', kind: 'sm', title: 'Az összes opció egy szövegmezőben, soronként egy', onclick: () => bulkModal(t, d, () => drawThemeEditor()) }),
    btn('Mind törlése', { icon: 'trash', kind: 'danger sm', onclick: () => { const old = d.options; d.options = []; persist(); fill(); toastAction('Az opciók törölve', 'Visszavonás', () => { d.options = old; persist(); drawThemeEditor(); }); } }),
    h('span', { class: 'spacer' }),
    h('span', { class: 'muted small' }, 'Tipp: sor végére írhatsz #címkét, !ütközőt, ?kelleket, +szívesent, ~ szürreálist.')));
  fill();
  return body;
}

/* ---------- opció sor ---------- */
function optRow(t, d, o, refill) {
  const advOpen = !!E.adv[o.id];
  const row = h('div', { class: 'orow' + (advOpen ? ' adv' : ''), dataset: { t: o.t } });
  const txt = h('input', { type: 'text', value: o.t, 'aria-label': 'Opció szövege', dataset: { fid: o.id + ':t' }, oninput: e => { o.t = e.target.value; row.dataset.t = o.t; persist(); } });
  txt.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const i = d.options.indexOf(o); const n = Engine.parseLine(''); n.t = ''; d.options.splice(i + 1, 0, n); E.focus = n.id + ':t'; persist(); drawThemeEditor(); }
    if (e.key === 'Backspace' && !txt.value && d.options.length > 1) { e.preventDefault(); const i = d.options.indexOf(o); d.options.splice(i, 1); const p = d.options[Math.max(0, i - 1)]; E.focus = p ? p.id + ':t' : null; persist(); drawThemeEditor(); }
  });
  const nTags = o.g.length + o.x.length + o.n.length + o.w.length + (o.p && o.p !== 1 ? 1 : 0);
  const sBtn = h('button', { type: 'button', class: 'ibtn sm' + (o.s ? ' on' : ''), title: 'Szürreális: csak szürreális módban jöhet ki', 'aria-pressed': o.s ? 'true' : 'false', onclick: e => { o.s = !o.s; persist(); e.currentTarget.classList.toggle('on', o.s); e.currentTarget.setAttribute('aria-pressed', o.s); } }, ic('swirl', 17));
  const tBtn = h('button', { type: 'button', class: 'ibtn sm tagbtn' + (advOpen ? ' on' : ''), title: 'Címkék és kapcsolatok szerkesztése', 'aria-expanded': advOpen ? 'true' : 'false', onclick: () => { E.adv[o.id] = !E.adv[o.id]; const nr = optRow(t, d, o, refill); row.replaceWith(nr); } },
    ic('tag', 17), nTags ? h('span', { class: 'badge' }, String(nTags)) : null);
  const del = iconBtn('trash', 'Opció törlése', () => { const i = d.options.indexOf(o); d.options.splice(i, 1); persist(); refill(); toastAction('Opció törölve', 'Visszavonás', () => { d.options.splice(i, 0, o); persist(); drawThemeEditor(); }); }, 'sm danger');
  row.appendChild(h('div', { class: 'orow-main' }, txt, sBtn, tBtn, del));
  if (advOpen) row.appendChild(advPanel(t, d, o));
  return row;
}
function advPanel(t, d, o) {
  const tagsInTheme = Engine.uniq([].concat.apply([], t.dice.map(x => (x.options || []).map(p => p.g).reduce((a, b) => a.concat(b), [])))).sort();
  const mk = (label, hint, getv, setv) => {
    const inp = h('input', { type: 'text', value: getv(), 'aria-label': label, autocomplete: 'off', spellcheck: 'false', onfocus: e => { E.lastField = e.target; }, onchange: e => { setv(e.target.value); persist(); } });
    return h('div', { class: 'field' }, h('label', null, label), inp, h('span', { class: 'hint' }, hint));
  };
  const parse = s => Engine.uniq(String(s).split(/[,;]+/).map(x => Engine.tag(x)).filter(Boolean));
  const lab = a => a.map(Engine.tagLabel);
  const grid = h('div', { class: 'adv-grid' },
    mk('Címkék (mi ez?)', 'pl. otthon, este, kint', () => lab(o.g).join(', '), v => { o.g = parse(v); }),
    mk('Nem fér össze ezzel', 'pl. ejjel, hideg: egyszerre nem jöhetnek ki', () => lab(o.x).join(', '), v => { o.x = parse(v); }),
    mk('Kell mellé (valamelyik)', 'pl. otthon|nappali, kint: vessző = mind, | = vagy', () => o.n.map(g => lab(g).join('|')).join(', '), v => { o.n = String(v).split(/[,;]+/).map(p => Engine.uniq(p.split('|').map(Engine.tag).filter(Boolean))).filter(g => g.length); }),
    mk('Szívesen mellé', 'pl. bor, este: ezek mellé gyakrabban kerül', () => lab(o.w).join(', '), v => { o.w = parse(v); }),
    mk('Súly (gyakoriság)', '1 = normál, 5 = ötször gyakrabban jön ki, 0,3 = ritkábban', () => String(o.p || 1).replace('.', ','), v => { const n = parseFloat(String(v).replace(',', '.')); o.p = isFinite(n) && n > 0 ? Math.min(50, Math.max(0.1, n)) : 1; }));
  const chips = h('div', { class: 'tagpick' }, h('span', { class: 'lbl' }, 'A témában használt címkék'),
    tagsInTheme.length ? tagsInTheme.slice(0, 60).map(tg => h('button', { type: 'button', class: 'tagchip', title: 'Beszúrás a kijelölt mezőbe', onclick: () => { const f = E.lastField && E.lastField.isConnected ? E.lastField : $('input', grid); const lbl = Engine.tagLabel(tg); const parts = f.value.split(/[,;]+/).map(x => x.trim()).filter(Boolean); if (parts.indexOf(lbl) < 0) parts.push(lbl); f.value = parts.join(', '); f.dispatchEvent(new Event('change')); f.focus(); } }, '#' + Engine.tagLabel(tg))) : h('span', { class: 'muted small' }, 'Még nincs címke ebben a témában.'));
  return h('div', { class: 'adv-panel' }, grid, chips,
    h('p', { class: 'muted small' }, 'A címkék segítenek, hogy a kijött kockák összeillőek legyenek. ', h('a', { href: '#sugo', onclick: ev => { ev.preventDefault(); go('sugo'); } }, 'Részletek a Súgóban')));
}

/* ---------- szövegként szerkesztés ---------- */
function bulkModal(t, d, done) {
  const ta = h('textarea', { class: 'codebox bulk', rows: 14, spellcheck: 'false', 'aria-label': 'Opciók soronként' });
  ta.value = d.options.map(Engine.fmtLine).join('\n');
  openModal({
    title: d.name + ': opciók szövegként', wide: true,
    body: [h('p', { class: 'muted' }, 'Soronként egy opció. A sor végére írhatsz: #címke, !ütközik, ?kell (a|b = vagy), +szívesen, ~ (szürreális). Üres sorok kimaradnak.'), ta],
    actions: [{ label: 'Mégse' }, {
      label: 'Mentés', kind: 'primary', onClick: () => {
        const parsed = Engine.parseLines(ta.value), used = new Set();
        parsed.forEach(p => { const m = d.options.find(o => o.t === p.t && !used.has(o.id)); if (m) { p.id = m.id; used.add(m.id); } });
        d.options = parsed; persist(); toast(plural(parsed.length, 'opció', 'opció') + ' mentve'); if (done) done();
      }
    }], focus: 'textarea'
  });
}

/* ---------- új téma ---------- */
function newThemeModal(startTab) {
  let tab = startTab || 'ures', emoji = '🎲', color = COLORS[rnd(COLORS.length)];
  const name = h('input', { type: 'text', id: 'nt-name', maxlength: 40, placeholder: 'pl. Hétvégi program', 'aria-label': 'Az új téma neve' });
  const eBtn = h('button', { type: 'button', class: 'icon-pick big', title: 'Ikon cseréje', onclick: () => emojiModal(v => { emoji = v; eBtn.textContent = v; }) }, emoji);
  const sw = h('div', { class: 'swatches' });
  const paint = () => $$('.swatch', sw).forEach(b => b.classList.toggle('on', b.dataset.c === color));
  COLORS.forEach(c => sw.appendChild(h('button', { type: 'button', class: 'swatch', dataset: { c: c }, style: { background: c }, 'aria-label': 'Szín ' + c, onclick: () => { color = c; paint(); } })));
  const src = h('select', { id: 'nt-src', 'aria-label': 'Melyik témáról készüljön másolat' }, S.themes.map(x => h('option', { value: x.id }, x.emoji + ' ' + x.name)));
  const quick = h('textarea', { rows: 7, class: 'codebox', spellcheck: 'false', placeholder: 'Mikor: reggel; délután; este\nHol: otthon; a parkban; a városban\nMit csinálunk: sütés; séta; társasjáték' });
  const code = h('textarea', { rows: 6, class: 'codebox', spellcheck: 'false', placeholder: 'KZ1:…' });
  const pane = h('div', { class: 'nt-pane' });
  const tabs = h('div', { class: 'nt-tabs', role: 'tablist' });
  const TABS = [['ures', 'Üres téma'], ['masolat', 'Másolat'], ['gyors', 'Gyors szöveg'], ['kod', 'Kód']];
  function draw() {
    $$('.chip', tabs).forEach(c => { c.classList.toggle('on', c.dataset.k === tab); c.setAttribute('aria-selected', c.dataset.k === tab); });
    clear(pane);
    const common = h('div', { class: 'nt-common' },
      h('div', { class: 'tc-top' }, eBtn, h('div', { class: 'field grow' }, h('label', { for: 'nt-name' }, 'Téma neve'), name)),
      h('div', { class: 'field' }, h('label', null, 'Szín'), sw));
    if (tab === 'ures') pane.append(h('p', { class: 'muted' }, 'Egy kockával indul három minta-opcióval; utána a Szerkesztőben bővítheted.'), common);
    if (tab === 'masolat') pane.append(h('div', { class: 'field' }, h('label', { for: 'nt-src' }, 'Melyik témát másoljam?'), src), common);
    if (tab === 'gyors') pane.append(h('p', { class: 'muted' }, 'Soronként egy kocka: „Kocka neve: opció; opció; opció”. Az opciók után írhatsz #címkét is.'), quick, common);
    if (tab === 'kod') pane.append(h('p', { class: 'muted' }, 'Illeszd be a kapott KZ1: kezdetű kódot. Egy témát és egy teljes mentést is elfogad (a mentésből csak a témákat veszi át).'), code);
    paint();
  }
  TABS.forEach(x => tabs.appendChild(h('button', { type: 'button', role: 'tab', class: 'chip', dataset: { k: x[0] }, onclick: () => { tab = x[0]; draw(); } }, x[1])));
  const m = openModal({
    title: 'Új téma', wide: true, body: [tabs, pane],
    actions: [{ label: 'Mégse' }, {
      label: 'Létrehozás', kind: 'primary', icon: 'plus', onClick: () => {
        let made = [];
        try {
          const nm = name.value.trim();
          if (tab === 'kod') {
            const c = readCode(code.value); const arr = c.themes || (c.x ? [c] : null);
            if (!arr || !arr.length) throw new Error('A kódban nem találtam témát.');
            made = arr.map(themeFromCompact);
          } else {
            if (!nm) { toast('Adj nevet az új témának.'); name.focus(); return false; }
            if (tab === 'ures') { made = [{ id: 'sajat-' + Engine.uid().slice(-6), name: nm, emoji: emoji, color: color, desc: '', builtin: false, dice: [] }]; addDefaultDie(made[0]); }
            if (tab === 'masolat') { const s = themeById(src.value); const c = themeFromCompact(themeToCompact(s)); c.name = nm; c.emoji = emoji; c.color = color; made = [c]; }
            if (tab === 'gyors') {
              const dice = String(quick.value).split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
                const k = l.indexOf(':'); if (k < 1) return null;
                const dn = l.slice(0, k).trim(); let rest = l.slice(k + 1);
                let parts = rest.split(';').map(x => x.trim()).filter(Boolean); if (parts.length < 2 && rest.indexOf(',') >= 0) parts = rest.split(',').map(x => x.trim()).filter(Boolean);
                return { id: 'd' + Engine.uid().slice(-8), name: dn.slice(0, 30), icon: '🎲', enabled: true, role: null, options: parts.map(Engine.parseLine).filter(o => o.t) };
              }).filter(x => x && x.options.length);
              if (!dice.length) { toast('Nem találtam használható sort. Formátum: „Kocka neve: opció; opció”.'); return false; }
              made = [{ id: 'sajat-' + Engine.uid().slice(-6), name: nm, emoji: emoji, color: color, desc: '', builtin: false, dice: dice }];
            }
          }
        } catch (e) { toast(e.message, 'long'); return false; }
        made.forEach(x => S.themes.push(x));
        E.tid = made[0].id; made[0].dice.forEach(dd => { if (made.length === 1 && tab !== 'kod') E.open[dd.id] = true; });
        persist(); toast(made.length > 1 ? made.length + ' téma importálva' : 'Téma kész: ' + made[0].name);
        if (S.ui.view === 'szerkeszto') { drawSide(); drawThemeEditor(); } else { S.ui.themeId = made[0].id; persist(); go('szerkeszto'); }
      }
    }], focus: '#nt-name'
  });
  draw();
}
function addDefaultDie(t) {
  t.dice.push({ id: 'd' + Engine.uid().slice(-8), name: 'Első szempont', icon: '🎲', enabled: true, role: null, options: Engine.parseLines('Első ötlet\nMásodik ötlet\nHarmadik ötlet') });
}
