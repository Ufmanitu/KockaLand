/* ===== App: indítás, fejléc/navigáció, hash-router, billentyűk ===== */
'use strict';
const NAV = [
  { id: 'dobas', label: 'Dobás', icon: 'dice' },
  { id: 'szerkeszto', label: 'Szerkesztő', icon: 'edit' },
  { id: 'polc', label: 'Könyvtár', icon: 'book' },
  { id: 'naplo', label: 'Napló', icon: 'heart' },
  { id: 'sugo', label: 'Súgó', icon: 'help' }
];
const VIEWS = { dobas: () => renderPlay(), szerkeszto: () => renderEditor(), polc: () => renderShelf(), naplo: () => renderLog(), sugo: () => renderHelp() };

function go(view) {
  if (!VIEWS[view]) view = 'dobas';
  if (location.hash !== '#' + view) { location.hash = view; return; }
  show(view);
}
function show(view) {
  if (!VIEWS[view]) view = 'dobas';
  S.ui.view = view; persist();
  l3Hide();
  drawNav();
  const v = $('#view');
  try { VIEWS[view](); }
  catch (e) { console.error(e); clear(v).appendChild(h('div', { class: 'panel' }, h('h2', null, 'Hopp, valami elromlott'), h('p', { class: 'muted' }, 'Frissítsd az oldalt. Ha ismétlődik, a Beállítások › Mentés részben visszaállíthatod az alap állapotot. (' + e.message + ')'))); }
  window.scrollTo({ top: 0, behavior: 'auto' });
}
function drawNav() {
  const mk = (cls) => NAV.map(n => h('a', { href: '#' + n.id, 'aria-current': S.ui.view === n.id ? 'page' : null, onclick: e => { e.preventDefault(); go(n.id); } }, ic(n.icon, cls ? 22 : 18), h('span', null, n.label)));
  const top = $('#top');
  clear(top).appendChild(h('button', { type: 'button', class: 'brand', 'aria-label': 'Kockázzunk – kezdőlap', onclick: () => go('dobas') },
    h('span', { class: 'brand-mark', html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 20.2S4.5 15.6 4.5 9.8A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.2c0 5.8-7.5 10.4-7.5 10.4z"/></svg>' }),
    h('span', { class: 'brand-name' }, 'Kockázzunk')));
  top.appendChild(h('nav', { class: 'nav', 'aria-label': 'Fő navigáció' }, mk(false)));
  top.appendChild(h('div', { class: 'tools' },
    iconBtn('sliders', 'Beállítások', () => settingsModal()),
    iconBtn('help', 'Bemutató', () => showTour())));
  clear($('#tabs')).append(...mk(true));
}

function isTyping(e) { const t = e.target; return !!t && (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable || (t.tagName === 'INPUT' && /^(text|search|number|url|email|tel|password)$/.test(t.type || 'text'))); }
// egérrel átbillentett kapcsoló után ne maradjon rajta a fókusz (így a Szóköz újra dob)
document.addEventListener('click', e => { if (e.detail > 0 && e.target.closest && e.target.closest('.switch') && document.activeElement && document.activeElement.type === 'checkbox') document.activeElement.blur(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && MODALS.length) { MODALS[MODALS.length - 1].esc(); return; }
  if (MODALS.length || isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (S.ui.view !== 'dobas') return;
  const t = curTheme(), dice = activeDice(t);
  if (e.code === 'Space' && !(e.target && e.target.closest && e.target.closest('button,[role=button],a,input,select'))) { e.preventDefault(); rollAllAction(); return; }
  const m = /^Digit([1-9])$/.exec(e.code);
  if (m) { const d = dice[+m[1] - 1]; if (d) { e.preventDefault(); if (e.shiftKey) toggleLock(d.id); else rollOneAction(d.id); } return; }
  if (e.code === 'KeyS') { const cb = $('#sw-surreal'); if (cb) { cb.checked = !cb.checked; toggleSurreal(cb.checked); } return; }
  if (e.code === 'KeyM') { S.settings.sound = !S.settings.sound; persist(); renderPlay(); return; }
  if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
    const i = S.themes.findIndex(x => x.id === t.id), n = S.themes.length;
    switchTheme(S.themes[(i + (e.code === 'ArrowRight' ? 1 : n - 1)) % n].id); return;
  }
  if (e.key === '?') { go('sugo'); }
});

function boot() {
  document.documentElement.lang = 'hu';
  initState();
  applyAppearance();
  applyMotionClasses();
  const start = (location.hash || '').replace('#', '');
  S.ui.view = VIEWS[start] ? start : 'dobas';
  drawNav();
  show(S.ui.view);
  addEventListener('hashchange', () => { const v = (location.hash || '').replace('#', ''); if (VIEWS[v] && v !== S.ui.view) show(v); else if (!VIEWS[v] && v === '') show('dobas'); });
  if (S.migrated && S.migrated.replaced.length) setTimeout(() => toast('Új verzió: frissítettem az alap témákat (pontosabb párosítások, több film, új főzős téma). Az átírt témáid érintetlenek.', 'long'), 1200);
  if (!S.settings.seen) setTimeout(() => { if (typeof showTour === 'function') showTour(true); }, 900);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
