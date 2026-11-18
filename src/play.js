/* ===== Dobás nézet: tábla, 3D fa kockák, zárolás, kézi választás, eredménylista ===== */
'use strict';

/* a kocka hat lapja: CSS-transzformáció, lapnormális, és az a forgatás (rx, ry), ami a lapot előre hozza */
const FACES = [
  { n: [0, 0, 1], r: [0, 0] },    // elöl
  { n: [0, 0, -1], r: [0, 180] }, // hátul
  { n: [1, 0, 0], r: [0, -90] },  // jobb
  { n: [-1, 0, 0], r: [0, 90] },  // bal
  { n: [0, -1, 0], r: [-90, 0] }, // fent
  { n: [0, 1, 0], r: [90, 0] }    // lent
];
const TILT = { x: -14, y: -18 };
const LIGHT = (() => { const v = [-0.45, -0.7, 0.62], l = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / l); })();
const rad = d => d * Math.PI / 180;
const mRx = a => { a = rad(a); const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
const mRy = a => { a = rad(a); const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
const mMul = (A, B) => A.map((r, i) => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const mVec = (M, v) => M.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const TILT_M = mMul(mRx(TILT.x), mRy(TILT.y));

const P = { rid: 0, slots: {}, rows: {}, theme: null, entry: null, heartBtn: null, rollBtn: null };

function pickText(pick, die) {
  if (!pick || !pick.opt) return '–';
  return pick.opt.t;
}
function faceFit(text) {
  const n = String(text).length;
  return n <= 9 ? 'f1' : n <= 18 ? 'f2' : n <= 32 ? 'f3' : n <= 48 ? 'f4' : 'f5';
}
function faceShortText(pick) {
  if (pick && pick.opt && pick.opt.book) return pick.opt.book.title;
  return pickText(pick);
}
/* tartalék lapszöveg: soha nem lehet üres lap (előbb a kocka többi opciója, végül a kocka neve) */
function faceFallback(die, avoid) {
  const ts = die.kind === 'shelf' ? S.books.filter(b => b.title).map(b => b.title) : die.options.map(o => o.t);
  const other = ts.filter(t => t && t !== avoid);
  return other.length ? pick(other) : (avoid || die.name || '🎲');
}
function randomFaceTexts(die, ctx, n, avoid) {
  let pool;
  if (die.kind === 'shelf') pool = S.books.filter(b => b.title).map(b => b.title);
  else pool = Engine.allowed(die, ctx).map(o => o.t);
  pool = pool.filter(t => t && t !== avoid);
  const out = [];
  const bag = pool.slice();
  for (let i = 0; i < n; i++) {
    if (!bag.length) { out.push(pool.length ? pick(pool) : faceFallback(die, avoid)); continue; }
    out.push(bag.splice(rnd(bag.length), 1)[0]);
  }
  return out;
}
function setFaceText(face, text) {
  text = String(text == null || text === '' ? '🎲' : text);
  if (face._t === text) return;
  face._t = text;
  face.textContent = '';
  face.appendChild(h('span', { class: 'ft ' + faceFit(text) }, text));
}
function shadeFaces(sl, rx, ry, ms) {
  const M = mMul(TILT_M, mMul(mRx(rx), mRy(ry)));
  sl.faces.forEach((f, i) => {
    const w = mVec(M, FACES[i].n);
    const dot = w[0] * LIGHT[0] + w[1] * LIGHT[1] + w[2] * LIGHT[2];
    const dk = clamp((1 - (0.5 + 0.5 * dot)) * 0.62, 0, 0.5);
    f.style.setProperty('--dk', dk.toFixed(3));
    f.style.setProperty('--dur', ms + 'ms');
  });
}

/* ---------- lassúság-érzékelés: ha a dobás animációja akadozik, felajánljuk a Kímélő módot ---------- */
const PerfWatch = {
  slow: 0,
  run(ms) {
    if (S.settings.lite || S.settings.perfAsked || document.hidden || !window.requestAnimationFrame) return;
    const d = []; let last = 0; const stop = performance.now() + ms;
    const tick = t => { if (last) d.push(t - last); last = t; if (t < stop && !document.hidden) requestAnimationFrame(tick); else this.done(d); };
    requestAnimationFrame(tick);
  },
  done(d) {
    if (d.length < 20) return;
    d = d.slice(2).sort((a, b) => a - b);
    const med = d[d.length >> 1], p90 = d[Math.floor(d.length * 0.9)];
    this.slow = (med > 26 || p90 > 48) ? this.slow + 1 : Math.max(0, this.slow - 1);
    if (this.slow >= 2) {
      S.settings.perfAsked = true; persist();
      toastAction('Úgy tűnik, akadozik az animáció ezen a gépen. Bekapcsoljam a Kímélő módot?', 'Bekapcsolom', () => { S.settings.lite = true; persist(); applyMotionClasses(); toast('Kímélő mód bekapcsolva. A Beállításokban bármikor kikapcsolhatod.'); });
    }
  }
};

/* ---------- egy dobás-rés (kocka + felirat) ---------- */
function buildSlot(die, idx, pickNow) {
  const ctx = engineCtx();
  const faces = FACES.map((f, i) => h('div', { class: 'face fc' + i }));
  const cube = h('div', { class: 'cube' }, faces);
  const toss = h('div', { class: 'toss' }, h('div', { class: 'tilt' }, cube));
  const shadow = h('div', { class: 'cshadow' });
  const sl = { die: die, faces: faces, cube: cube, toss: toss, shadow: shadow, k: 0, rx: 0, ry: 0, token: 0 };

  const flagEl = h('span', { class: 'sflag', hidden: true });
  const stage = h('div', {
    class: 'stage', role: 'button', tabindex: '0',
    onclick: () => rollOneAction(die.id),
    onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); rollOneAction(die.id); } }
  }, shadow, toss);
  const lockBtn = h('button', { type: 'button', class: 'lockbtn', 'aria-pressed': 'false', onclick: e => { e.stopPropagation(); toggleLock(die.id); } });
  const label = h('div', { class: 'slot-label' }, h('span', { class: 'num' }, String(idx + 1)), h('span', { class: 'ln' }, die.name));
  const el = h('div', { class: 'slot', dataset: { die: die.id }, style: { '--i': idx } }, stage, flagEl, lockBtn, label);
  sl.el = el; sl.stage = stage; sl.lockBtn = lockBtn; sl.flagEl = flagEl;

  // kezdeti tartalom
  const others = randomFaceTexts(die, ctx, 6, '');
  const txt = pickNow ? faceShortText(pickNow) : others[0];
  const rest = randomFaceTexts(die, ctx, 5, txt);
  faces.forEach((f, i) => setFaceText(f, i === 0 ? txt : rest[i - 1]));
  shadeFaces(sl, 0, 0, 0);
  return sl;
}

function refreshSlotState(dieId) {
  const t = curTheme(), r = rtOf(t.id), sl = P.slots[dieId], row = P.rows[dieId];
  const locked = !!r.locks[dieId], pk = r.picks[dieId];
  if (sl) {
    sl.el.classList.toggle('locked', locked);
    sl.lockBtn.setAttribute('aria-pressed', locked ? 'true' : 'false');
    sl.lockBtn.setAttribute('aria-label', (locked ? 'Zárolás feloldása: ' : 'Zárolás: ') + sl.die.name);
    sl.lockBtn.title = locked ? 'Zárolva – kattints a feloldáshoz' : 'Zárold, hogy a következő dobásnál megmaradjon';
    clear(sl.lockBtn).appendChild(ic(locked ? 'lock' : 'unlock', 15));
    const fl = pk && pk.flag;
    sl.flagEl.hidden = !fl;
    sl.flagEl.className = 'sflag ' + (fl || '');
    sl.flagEl.title = fl === 's' ? 'Szürreális ötlet' : fl === 'c' ? 'Nem teljesen illik a többihez' : '';
    clear(sl.flagEl);
    if (fl) sl.flagEl.appendChild(fl === 's' ? ic('swirl', 14) : ic('warn', 14));
    sl.stage.setAttribute('aria-label', sl.die.name + ': ' + pickText(pk) + '. Koppints az újradobáshoz.');
  }
  if (row) {
    row.el.classList.toggle('locked', locked);
    const lb = row.lock;
    lb.classList.toggle('on', locked);
    lb.setAttribute('aria-pressed', locked ? 'true' : 'false');
    lb.title = locked ? 'Zárolva – kattints a feloldáshoz' : 'Zárolás: a következő dobásnál megmarad';
    clear(lb).appendChild(ic(locked ? 'lock' : 'unlock', 17));
    const fl = pk && pk.flag;
    clear(row.flags);
    if (fl === 's') row.flags.appendChild(h('span', { class: 'flag s', title: 'Szürreális mód: váratlan, vicces ötlet' }, ic('swirl', 13), 'szürreális'));
    if (fl === 'c') row.flags.appendChild(h('span', { class: 'flag c', title: 'Ez az ötlet nem passzol tökéletesen a többihez. Dobd újra, ha zavar.' }, ic('warn', 13), 'nem illik tökéletesen'));
  }
}
function refreshAllState() { Object.keys(P.slots).forEach(refreshSlotState); updateRollBtn(); }

function updateRollBtn() {
  if (!P.rollBtn) return;
  const t = curTheme(), r = rtOf(t.id), dice = activeDice(t);
  const nl = dice.filter(d => r.locks[d.id]).length;
  const lab = P.rollBtn.querySelector('.lbl-main');
  if (lab) lab.textContent = nl && nl < dice.length ? 'Dobás (' + nl + ' zárolva)' : 'Dobás!';
}

/* ---------- eredménysor ---------- */
function buildRow(die, idx) {
  const lock = h('button', { type: 'button', class: 'ibtn sm', 'aria-pressed': 'false', onclick: () => toggleLock(die.id) });
  const flags = h('div', { class: 'rflags' });
  const meta = h('div', { class: 'rmeta' });
  const txt = h('div', { class: 'rtext' });
  const el = h('div', { class: 'rrow', dataset: { die: die.id }, style: { '--i': idx } },
    h('div', { class: 'ricon', 'aria-hidden': 'true' }, die.icon || '🎲'),
    h('div', { class: 'rmain' }, h('div', { class: 'rlabel' }, die.name), txt, meta, flags),
    h('div', { class: 'ractions' },
      iconBtn('dice', 'Csak ezt dobom újra', () => rollOneAction(die.id), 'sm'),
      iconBtn('list', 'Kiválasztom kézzel', () => pickModal(die.id), 'sm'),
      lock));
  return { el: el, txt: txt, meta: meta, flags: flags, lock: lock, die: die };
}
function setRowContent(dieId, pk) {
  const row = P.rows[dieId]; if (!row) return;
  const b = pk && pk.opt && pk.opt.book;
  row.txt.textContent = b ? b.title : pickText(pk);
  clear(row.meta);
  if (pk && pk.opt && pk.opt.id === 'book:none') {
    row.meta.appendChild(btn('Könyvek felvétele', { icon: 'book', kind: 'sm', onclick: () => go('polc') }));
  }
  if (b) {
    const bits = [b.author, b.genre, b.pages ? b.pages + ' oldal' : ''].filter(Boolean).join(' · ');
    if (bits) row.meta.appendChild(h('span', { class: 'muted' }, bits));
    const rel = (pk.relaxed || []).map(k => ({ genre: 'műfaj', mood: 'hangulat', length: 'hossz' }[k])).filter(Boolean);
    if (rel.length) row.meta.appendChild(h('span', { class: 'flag c', title: 'A polcodon nincs pontosan ilyen könyv, ezért a legközelebbit sorsoltam.' }, ic('warn', 12), rel.join(', ') + ' nem pontosan egyezik'));
    row.meta.appendChild(h('button', {
      type: 'button', class: 'btn sm', onclick: () => { b.status = 'olvasom'; persist(); toast('„' + b.title + '” most az olvasólistán: olvasom'); }
    }, ic('book', 15), 'Ezt olvassuk'));
  }
  row.el.classList.remove('rolling');
}
function popRow(dieId) {
  const row = P.rows[dieId]; if (!row) return;
  row.el.classList.remove('pop'); void row.el.offsetWidth; row.el.classList.add('pop');
}

/* ---------- renderelés ---------- */
function reconcile(t) {
  const r = rtOf(t.id);
  restoreRolls(t);
  t.dice.forEach(d => {
    const pk = r.picks[d.id];
    if (!pk || !pk.opt) { delete r.picks[d.id]; return; }
    if (d.kind === 'shelf') {
      if (pk.opt.book) {
        const b = S.books.find(x => x.id === pk.opt.book.id);
        if (!b) delete r.picks[d.id]; else pk.opt = Engine.bookOpt(b);
      }
    } else {
      const o = d.options.find(x => x.id === pk.opt.id);
      if (!o) delete r.picks[d.id]; else pk.opt = o;
    }
  });
  Object.keys(r.locks).forEach(id => { if (!r.picks[id]) delete r.locks[id]; });
}
function curPicks(t, dice) { const r = rtOf(t.id), o = {}; (dice || activeDice(t)).forEach(d => { if (r.picks[d.id]) o[d.id] = r.picks[d.id]; }); return o; }

function themeChips() {
  const bar = h('div', { class: 'themebar', role: 'tablist', 'aria-label': 'Témák' });
  S.themes.forEach(t => {
    const on = t.id === S.ui.themeId;
    bar.appendChild(h('button', {
      type: 'button', role: 'tab', class: 'chip theme-chip' + (on ? ' on' : ''), 'aria-selected': on ? 'true' : 'false', style: { '--tc': t.color },
      onclick: () => switchTheme(t.id)
    }, h('span', { class: 'ce' }, t.emoji), t.name));
  });
  bar.appendChild(h('button', { type: 'button', class: 'chip add-chip', title: 'Új téma létrehozása', onclick: () => newThemeModal() }, ic('plus', 16), 'Új téma'));
  return bar;
}

function renderPlay() {
  const view = $('#view');
  const t = curTheme();
  P.rid++; P.theme = t; P.slots = {}; P.rows = {}; P.entry = null;
  $('#app').style.setProperty('--tc', t.color);
  reconcile(t);
  const dice = activeDice(t), r = rtOf(t.id), ctx = engineCtx();
  const root = h('section', { class: 'play view-in' });

  root.appendChild(themeChips());

  /* eszköztár */
  const hasShelf = dice.some(d => d.kind === 'shelf');
  const chaos = h('input', {
    type: 'range', min: '0', max: '1', step: '0.05', value: String(S.settings.chaos), 'aria-label': 'Káosz mértéke',
    oninput: e => { S.settings.chaos = +e.target.value; persist(); }
  });
  const surrSw = h('label', { class: 'switch', title: 'Bekapcsolva váratlan, vicces opciók és szabályszegő párosítások is kijöhetnek' },
    h('input', { type: 'checkbox', id: 'sw-surreal', checked: !!S.settings.surreal, onchange: e => toggleSurreal(e.target.checked) }),
    h('span', { class: 'tr' }), h('span', null, 'Szürreális', h('span', { class: 'hide-sm' }, ' mód')));
  const chaosBox = h('div', { class: 'chaos', hidden: !S.settings.surreal }, h('span', { class: 'lbl' }, 'Káosz'), chaos);
  const tools = h('div', { class: 'toolbar' },
    btn("Szempontok", { icon: "sliders", kind: "sm", title: 'Melyik kockákkal dobjunk?', onclick: aspectsModal }),
    surrSw, chaosBox,
    hasShelf ? h('label', { class: 'switch', title: 'A már elolvasott könyveket kihagyja' },
      h('input', { type: 'checkbox', checked: !!S.settings.onlyUnread, onchange: e => { S.settings.onlyUnread = e.target.checked; persist(); } }),
      h('span', { class: 'tr' }), h('span', null, 'Csak olvasatlan')) : null,
    h('span', { class: 'spacer' }),
    iconBtn(S.settings.sound ? 'sound' : 'mute', S.settings.sound ? 'Hang kikapcsolása' : 'Hang bekapcsolása', e => {
      S.settings.sound = !S.settings.sound; persist(); Sound.init();
      const b = e.currentTarget; clear(b).appendChild(ic(S.settings.sound ? 'sound' : 'mute', 18)); b.title = S.settings.sound ? 'Hang kikapcsolása' : 'Hang bekapcsolása';
      if (S.settings.sound) Sound.tick();
    }));
  root.appendChild(tools);

  /* tábla */
  const heart = h('button', { type: 'button', class: 'heart-piece', title: 'Meglepetés!', 'aria-label': 'Szívecske: dobás', onclick: () => { Sound.init(); FX.hearts(innerWidth / 2, innerHeight / 3, 26); Sound.chime(); } },
    h('span', { html: '<svg viewBox="0 0 64 58" width="46" height="42"><defs><linearGradient id="hg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#f0687e"/><stop offset="1" stop-color="#a81e3d"/></linearGradient></defs><path d="M32 54S4 37 4 18.5C4 9 11.2 3 19.2 3c5.4 0 10.2 2.7 12.8 7.2C34.6 5.7 39.4 3 44.8 3 52.8 3 60 9 60 18.5 60 37 32 54 32 54z" fill="url(#hg)" stroke="#7d1630" stroke-width="1.5"/><path d="M14 17c0-4 3-7 7-7" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/></svg>' }));
  const slotsEl = h('div', { class: 'slots' });
  const board = h('div', { class: 'board' },
    h('div', { class: 'board-title' }, h('span', null, 'Kockázzunk'), heart, h('span', { class: 'bt-theme' }, t.name)),
    t.desc ? h('div', { class: 'board-desc' }, t.desc) : null,
    slotsEl);
  root.appendChild(board);

  /* eredmények */
  const rowsEl = h('div', { class: 'rows' });
  dice.forEach((d, i) => {
    const pk = r.picks[d.id];
    const sl = buildSlot(d, i, pk); P.slots[d.id] = sl; slotsEl.appendChild(sl.el);
    const row = buildRow(d, i); P.rows[d.id] = row; rowsEl.appendChild(row.el);
    setRowContent(d.id, pk);
  });
  if (!dice.length) {
    slotsEl.appendChild(h('div', { class: 'empty-board' }, h('p', null, 'Ennek a témának most nincs bekapcsolt kockája.'), btn('Kockák kiválasztása', { icon: 'sliders', kind: 'primary', onclick: aspectsModal })));
  }

  /* gombsor */
  P.rollBtn = h('button', { type: 'button', class: 'btn primary lg roll-btn', onclick: () => { rollAllAction(); }, title: 'Mindent újradob, ami nincs zárolva (Szóköz)' },
    ic('dice', 24), h('span', { class: 'lbl-main' }, 'Dobás!'));
  P.heartBtn = h('button', { type: 'button', class: 'btn', onclick: toggleFavorite, title: 'Mentés a kedvencek közé' }, ic('heart', 18), h('span', null, 'Kedvenc'));
  const actions = h('div', { class: 'rollbar' }, P.rollBtn,
    h('div', { class: 'rollbar-sec' },
      P.heartBtn,
      btn('Másolás', { icon: 'copy', onclick: () => copyText(resultText(t)) }),
      btn('Napló', { icon: 'clock', kind: 'ghost', onclick: () => go('naplo') })));
  root.appendChild(actions);

  root.appendChild(h('div', { class: 'result' },
    h('div', { class: 'result-head' }, h('h2', null, 'A mai sorsolás'), h('span', { class: 'muted small' }, t.emoji + ' ' + t.name)),
    rowsEl));
  root.appendChild(h('p', { class: 'hint' },
    ic('dice', 15), ' Koppints egy kockára, és csak az pörög újra.  ', ic('lock', 15), ' A zár megtartja, amit szeretnél.  ', ic('list', 15), ' Kézzel is választhatsz.  Szóköz: mindent újra.'));

  clear(view).appendChild(root);
  refreshAllState();
  updateFavBtn();

  /* hiányzó dobások pótlása */
  const missing = dice.filter(d => !r.picks[d.id] && (d.kind === 'shelf' || d.options.length));
  if (missing.length) {
    if (missing.length === dice.length) {
      const next = Engine.rollAll(dice, {}, {}, ctx);
      applyNext(t, dice, next, dice.map(d => d.id), { record: false, intro: true });
    } else {
      const next = Engine.rollAll(dice, curPicks(t, dice), Object.assign({}, r.locks, Object.fromEntries(dice.filter(d => r.picks[d.id]).map(d => [d.id, true]))), ctx);
      applyNext(t, dice, next, missing.map(d => d.id), { record: false, intro: true });
    }
  } else {
    Engine.annotate(dice, curPicks(t, dice), ctx);
    refreshAllState();
  }
}

function switchTheme(id) {
  if (id === S.ui.themeId) return;
  S.ui.themeId = id; persist(); renderPlay();
  const c = $('.theme-chip.on'); if (c && c.scrollIntoView) c.scrollIntoView({ inline: 'center', block: 'nearest', behavior: motionOK() ? 'smooth' : 'auto' });
}

/* ---------- dobás-műveletek ---------- */
function rollAllAction() {
  const t = curTheme(), dice = activeDice(t), r = rtOf(t.id);
  if (!dice.length) { toast('Nincs bekapcsolt kocka. A Szempontok gombbal kapcsolhatsz be néhányat.'); return; }
  const free = dice.filter(d => !r.locks[d.id]);
  if (!free.length) { toast('Minden kocka zárolva. Oldj fel egyet, és újra dobhatsz.'); P.rollBtn && wiggle(P.rollBtn); Object.values(P.slots).forEach(s => wiggle(s.lockBtn)); return; }
  Sound.init();
  const next = Engine.rollAll(dice, curPicks(t, dice), r.locks, engineCtx());
  applyNext(t, dice, next, free.map(d => d.id), { record: true, all: true });
}
function rollOneAction(dieId) {
  const t = curTheme(), dice = activeDice(t), r = rtOf(t.id);
  const die = dice.find(d => d.id === dieId); if (!die) return;
  if (r.locks[dieId]) { toast('A(z) „' + die.name + '” kocka zárolva. Oldd fel a lakatra kattintva.'); const s = P.slots[dieId]; s && wiggle(s.lockBtn); return; }
  Sound.init();
  const before = curPicks(t, dice);
  if (!r.picks[dieId]) { rollAllAction(); return; }
  const next = Engine.rollOne(dice, dieId, before, engineCtx(), r.locks);
  const changed = dice.filter(d => next[d.id] && next[d.id] !== before[d.id]).map(d => d.id);
  applyNext(t, dice, next, changed.length ? changed : [dieId], { record: true });
}
function wiggle(el) { if (!el || !el.animate || !motionOK()) return; el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 320 }); }

function toggleLock(dieId) {
  const t = curTheme(), r = rtOf(t.id);
  if (!r.picks[dieId]) return;
  Sound.init();
  r.locks[dieId] = !r.locks[dieId];
  if (!r.locks[dieId]) delete r.locks[dieId];
  persist(); refreshSlotState(dieId); updateRollBtn();
  if (r.locks[dieId]) {
    Sound.lock();
    const s = P.slots[dieId];
    if (s) { const b = s.stage.getBoundingClientRect(); FX.sparks(b.left + b.width / 2, b.top + b.height / 2, 9); if (s.lockBtn.animate && motionOK()) s.lockBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35) rotate(-8deg)' }, { transform: 'scale(1)' }], { duration: 300 }); }
  } else Sound.tick();
}

function toggleSurreal(on) {
  S.settings.surreal = on; persist();
  const cb = $('.chaos'); if (cb) cb.hidden = !on;
  Sound.init(); if (on) Sound.chime();
  if (on) toast('Szürreális mód be: néha váratlan párosítások is jönnek 🌀');
  else {
    // a már kijött szürreális opciókat újradobjuk (a zároltakat békén hagyjuk)
    const t = curTheme(), dice = activeDice(t), r = rtOf(t.id);
    const ids = dice.filter(d => !r.locks[d.id] && r.picks[d.id] && r.picks[d.id].opt && r.picks[d.id].opt.s).map(d => d.id);
    if (ids.length) {
      let ps = curPicks(t, dice); const ctx = engineCtx();
      ids.forEach(id => { ps = Engine.rollOne(dice, id, ps, ctx, r.locks); });
      applyNext(t, dice, ps, ids, { record: false });
    }
  }
}

/* a lényeg: új állapot alkalmazása + animáció + napló */
function applyNext(t, dice, next, ids, o) {
  o = o || {};
  const r = rtOf(t.id), rid = P.rid, ctx = engineCtx();
  dice.forEach(d => { if (next[d.id]) r.picks[d.id] = next[d.id]; });
  P.entry = null; updateFavBtn();
  persist();
  const animate = motionOK();
  let maxEnd = 0;
  ids.forEach((id, i) => {
    const sl = P.slots[id], row = P.rows[id], pk = r.picks[id];
    if (!sl || !pk) return;
    const lite = !!S.settings.lite;
    const delay = animate ? (o.intro ? 160 : 0) + i * (lite ? 45 : 110) : 0;
    const dur = animate ? (lite ? 620 + rnd(120) : 1100 + rnd(280) + (o.all ? 0 : 100)) : 0;
    maxEnd = Math.max(maxEnd, delay + dur);
    if (row && animate) { row.el.classList.add('rolling'); row.txt.textContent = ''; clear(row.meta); }
    const token = ++sl.token;
    const run = () => {
      if (sl.token !== token || rid !== P.rid) return;
      const txt = faceShortText(pk);
      const others = randomFaceTexts(sl.die, ctx, 4, txt);
      if (!animate) {
        setFaceText(sl.faces[sl.k], txt);
        let oi = 0; sl.faces.forEach((f, i) => { if (i !== sl.k) setFaceText(f, others[oi++ % others.length] || faceFallback(sl.die, txt)); });
        return;
      }
      let k; do { k = rnd(6); } while (k === sl.k);
      setFaceText(sl.faces[k], txt);
      let oi = 0;
      sl.faces.forEach((f, i) => { if (i !== k && i !== sl.k) setFaceText(f, others[oi++ % others.length] || faceFallback(sl.die, txt)); });
      const tr = FACES[k].r;
      const nrx = sl.rx + (((tr[0] - sl.rx) % 360) + 360) % 360 + 360 * (1 + rnd(2));
      const nry = sl.ry + (((tr[1] - sl.ry) % 360) + 360) % 360 + 360 * (2 + rnd(2));
      sl.cube.style.transition = 'transform ' + dur + 'ms cubic-bezier(.13,.78,.2,1)';
      sl.cube.style.transform = 'rotateX(' + nrx + 'deg) rotateY(' + nry + 'deg)';
      sl.rx = nrx; sl.ry = nry; sl.k = k;
      shadeFaces(sl, nrx, nry, dur);
      if (sl.toss.animate) {
        sl.toss.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-38px)', offset: .27 }, { transform: 'translateY(0)', offset: .6 }, { transform: 'translateY(-10px)', offset: .78 }, { transform: 'translateY(0)' }], { duration: dur, easing: 'ease-out' });
        if (!lite) sl.shadow.animate([{ transform: 'scale(1)', opacity: .6 }, { transform: 'scale(.62)', opacity: .28, offset: .27 }, { transform: 'scale(1)', opacity: .6, offset: .6 }, { transform: 'scale(.86)', opacity: .45, offset: .78 }, { transform: 'scale(1)', opacity: .6 }], { duration: dur, easing: 'ease-out' });
      }
      Sound.roll(0);
      setTimeout(() => {
        if (sl.token !== token || rid !== P.rid) return;
        Sound.land(0);
        const b = sl.stage.getBoundingClientRect();
        FX.sparks(b.left + b.width / 2, b.top + b.height * 0.55, 7);
        setRowContent(id, pk); popRow(id); refreshSlotState(id);
      }, dur);
    };
    if (delay) setTimeout(run, delay); else run();
    if (!animate) { setRowContent(id, pk); }
  });
  refreshAllState();
  const finish = () => {
    if (rid !== P.rid) return;
    refreshAllState();
    if (o.record) recordHistory(t);
    const flagged = dice.some(d => r.picks[d.id] && r.picks[d.id].flag);
    if (o.all && ids.length >= 3 && !flagged && animate) {
      const b = $('.board'); if (b) { const rc = b.getBoundingClientRect(); FX.hearts(rc.left + rc.width / 2, Math.max(60, rc.top + 30), 20); }
      Sound.chime();
    }
  };
  if (maxEnd) { setTimeout(finish, maxEnd + 40); if (o.all || ids.length > 2) PerfWatch.run(maxEnd); } else finish();
}

/* ---------- napló / kedvenc ---------- */
function resultItems(t) {
  const r = rtOf(t.id);
  return activeDice(t).filter(d => r.picks[d.id]).map(d => {
    const pk = r.picks[d.id];
    return { d: d.id, n: d.name, i: d.icon, t: pickText(pk), f: pk.flag || '' };
  });
}
function resultText(t) {
  const items = resultItems(t);
  return t.emoji + ' ' + t.name + '\n' + items.map(x => x.n + ': ' + x.t + (x.f === 's' ? ' (szürreális)' : '')).join('\n');
}
function recordHistory(t, force) {
  const r = rtOf(t.id), items = resultItems(t);
  if (!items.length) return null;
  const p = {}; items.forEach(x => { const pk = r.picks[x.d]; if (pk && pk.opt) p[x.d] = pk.opt.id; });
  const now = Date.now(), last = S.history[0];
  let e;
  if (!force && last && last.tid === t.id && !last.fav && now - last.ts < 6000) {
    last.ts = now; last.items = items; last.p = p; e = last;
  } else {
    e = { id: Engine.uid(), ts: now, tid: t.id, tn: t.name, te: t.emoji, items: items, p: p, fav: false };
    S.history.unshift(e);
    const keep = []; let n = 0;
    S.history.forEach(x => { if (x.fav) keep.push(x); else if (n++ < 80) keep.push(x); });
    S.history = keep;
  }
  P.entry = e; persist(); updateFavBtn();
  return e;
}
function toggleFavorite() {
  const t = curTheme();
  let e = P.entry;
  if (!e) e = recordHistory(t, true);
  if (!e) return;
  e.fav = !e.fav; persist(); updateFavBtn();
  if (e.fav) { Sound.init(); Sound.chime(); const b = P.heartBtn.getBoundingClientRect(); FX.hearts(b.left + b.width / 2, b.top, 14); toast('Elmentve a kedvencek közé'); }
  else toast('Kikerült a kedvencek közül');
}
function updateFavBtn() {
  if (!P.heartBtn) return;
  const on = !!(P.entry && P.entry.fav);
  P.heartBtn.classList.toggle('faved', on);
  P.heartBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  P.heartBtn.querySelector('span:last-child').textContent = on ? 'Kedvenc ✓' : 'Kedvenc';
}

/* ---------- kézi választás ---------- */
function pickModal(dieId) {
  const t = curTheme(), dice = activeDice(t), die = dice.find(d => d.id === dieId); if (!die) return;
  const r = rtOf(t.id), ctx = engineCtx();
  const list = h('div', { class: 'picklist', role: 'listbox' });
  const search = h('input', { type: 'search', placeholder: 'Keresés…', 'aria-label': 'Keresés', oninput: draw });
  let items;
  if (die.kind === 'shelf') items = S.books.filter(b => b.title).map(b => Engine.bookOpt(b));
  else items = Engine.allowed(die, ctx);
  const curId = r.picks[dieId] && r.picks[dieId].opt && r.picks[dieId].opt.id;
  const ps = curPicks(t, dice);
  let m;
  function draw() {
    const q = Engine.slug(search.value);
    clear(list);
    const shown = items.filter(o => !q || Engine.slug(o.t).indexOf(q) >= 0);
    if (!shown.length) list.appendChild(h('p', { class: 'muted' }, items.length ? 'Nincs találat.' : 'Ebben a kockában még nincs opció.'));
    shown.forEach(o => {
      const fit = die.kind === 'shelf' ? true : Engine.fits(dice, ps, dieId, o, ctx);
      list.appendChild(h('button', {
        type: 'button', role: 'option', class: 'pickitem' + (o.id === curId ? ' cur' : ''), 'aria-selected': o.id === curId ? 'true' : 'false',
        onclick: () => { m.close(); choosePick(t, dice, dieId, o); }
      }, h('span', { class: 'pt' }, o.t), o.s ? h('span', { class: 'flag s' }, ic('swirl', 12), 'szürreális') : null,
        !fit ? h('span', { class: 'flag c' }, ic('warn', 12), 'nem illik a többihez') : null,
        o.id === curId ? ic('check', 16) : null));
    });
  }
  m = openModal({
    title: die.icon + ' ' + die.name + ': választás', body: [items.length > 7 ? search : null, list],
    actions: [{ label: 'Mégse' }], focus: items.length > 7 ? 'input' : '.pickitem'
  });
  draw();
}
function choosePick(t, dice, dieId, opt) {
  const r = rtOf(t.id);
  Sound.init();
  const next = Object.assign({}, curPicks(t, dice));
  next[dieId] = { opt: opt };
  Engine.annotate(dice, next, engineCtx());
  applyNext(t, dice, next, [dieId], { record: true });
}

/* ---------- szempontok (kockák be/ki) ---------- */
function aspectsModal() {
  const t = curTheme();
  const list = h('div', { class: 'aspects' });
  t.dice.forEach(d => {
    const empty = d.kind !== 'shelf' && !d.options.length;
    list.appendChild(h('label', { class: 'switch asp' + (empty ? ' dim' : '') },
      h('input', { type: 'checkbox', checked: d.enabled !== false && !empty, disabled: empty, onchange: e => { d.enabled = e.target.checked; } }),
      h('span', { class: 'tr' }),
      h('span', { class: 'asp-n' }, h('span', { class: 'ae' }, d.icon), ' ', d.name),
      h('span', { class: 'muted small' }, empty ? 'nincs opciója' : d.kind === 'shelf' ? 'a polcodról' : plural(d.options.length, 'opció', 'opció'))));
  });
  openModal({
    title: 'Melyik kockákkal dobjunk?',
    body: [h('p', { class: 'muted' }, 'Kapcsold ki azt a szempontot, amit most nem szeretnél. A kockák tartalmát a Szerkesztőben módosíthatod.'), list],
    actions: [{ label: 'Kész', kind: 'primary' }],
    onClose: () => { persist(); if (S.ui.view === 'dobas') renderPlay(); }
  });
}
