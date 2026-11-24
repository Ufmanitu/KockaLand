/* ===== Napló + kedvencek, Súgó, bevezető túra, Beállítások, mentés/visszatöltés ===== */
'use strict';

/* ---------- Napló ---------- */
const LG = { tab: 'fav' };
function renderLog() {
  const root = h('section', { class: 'log view-in' });
  root.appendChild(h('div', { class: 'page-title' }, h('h1', null, 'Napló'), h('p', null, 'A kedvenc sorsolásaid és az utolsó dobásaid. Bármelyiket visszatöltheted a táblára.')));
  const favs = S.history.filter(e => e.fav).length;
  root.appendChild(h('div', { class: 'row wrap log-tabs', role: 'tablist' },
    [['fav', 'Kedvencek (' + favs + ')'], ['all', 'Előzmények (' + S.history.length + ')']].map(x => h('button', { type: 'button', role: 'tab', class: 'chip' + (LG.tab === x[0] ? ' on' : ''), 'aria-selected': LG.tab === x[0], onclick: () => { LG.tab = x[0]; renderLog(); } }, x[1])),
    h('span', { class: 'spacer' }),
    LG.tab === 'all' && S.history.some(e => !e.fav) ? btn('Nem kedvencek törlése', { icon: 'trash', kind: 'danger sm', onclick: clearHistory }) : null));
  const list = h('div', { class: 'log-list' });
  const arr = S.history.filter(e => LG.tab === 'all' || e.fav);
  if (!arr.length) {
    list.appendChild(h('div', { class: 'panel empty-shelf' }, h('div', { class: 'big' }, LG.tab === 'fav' ? '💞' : '🕰️'),
      h('h2', null, LG.tab === 'fav' ? 'Még nincs kedvenc' : 'Még nem dobtál'),
      h('p', { class: 'muted' }, LG.tab === 'fav' ? 'A Dobás nézetben a „Kedvenc” gombbal mentheted el, ami tetszik.' : 'Az első dobás után itt látod az utolsó 80-at.'),
      btn('Irány a Dobás', { icon: 'dice', kind: 'primary', onclick: () => go('dobas') })));
  }
  arr.forEach((e, i) => list.appendChild(logCard(e, i)));
  root.appendChild(list);
  clear($('#view')).appendChild(root);
}
function logCard(e, i) {
  const th = themeById(e.tid);
  const canRestore = !!th && e.p && Object.keys(e.p).length > 0;
  return h('article', { class: 'log-card', style: { '--tc': th ? th.color : 'var(--heart)', '--i': Math.min(i, 12) } },
    h('div', { class: 'lc-head' }, h('span', { class: 'lc-e' }, e.te), h('div', { class: 'grow' }, h('b', null, e.tn), h('div', { class: 'muted small' }, fmtTime(e.ts))),
      h('button', { type: 'button', class: 'ibtn' + (e.fav ? ' on' : ''), 'aria-pressed': !!e.fav, title: e.fav ? 'Kivétel a kedvencekből' : 'Kedvenc', onclick: () => { e.fav = !e.fav; persist(); renderLog(); } }, ic('heart', 20))),
    h('ul', { class: 'lc-items' }, e.items.map(x => h('li', null, h('span', { class: 'li-i', 'aria-hidden': 'true' }, x.i), h('span', { class: 'li-n' }, x.n), h('span', { class: 'li-t' }, x.t, x.f === 's' ? h('span', { class: 'flag s' }, ic('swirl', 11), 'szürreális') : null)))),
    h('div', { class: 'lc-foot' },
      btn('Visszatöltés', { icon: 'undo', kind: 'sm', disabled: !canRestore, title: canRestore ? 'Visszateszi a táblára' : th ? 'Ezt a dobást már nem lehet visszatölteni' : 'A téma már nincs meg', onclick: () => restoreEntry(e) }),
      btn('Másolás', { icon: 'copy', kind: 'ghost sm', onclick: () => copyText(e.te + ' ' + e.tn + '\n' + e.items.map(x => x.n + ': ' + x.t).join('\n')) }),
      h('span', { class: 'spacer' }),
      iconBtn('trash', 'Törlés', () => { const idx = S.history.indexOf(e); S.history.splice(idx, 1); persist(); renderLog(); toastAction('Törölve a naplóból', 'Visszavonás', () => { S.history.splice(idx, 0, e); persist(); renderLog(); }); }, 'sm danger')));
}
function clearHistory() {
  const old = S.history.slice(); S.history = S.history.filter(e => e.fav); persist(); renderLog();
  toastAction('Az előzmények törölve (a kedvencek maradtak)', 'Visszavonás', () => { S.history = old; persist(); renderLog(); });
}
function restoreEntry(e) {
  const t = themeById(e.tid); if (!t) { toast('A téma már nincs meg.'); return; }
  const r = rtOf(t.id); r.picks = {}; r.locks = {};
  let n = 0;
  t.dice.forEach(d => {
    const oid = e.p && e.p[d.id]; if (!oid) return;
    if (d.kind === 'shelf') { const b = S.books.find(x => 'book:' + x.id === oid); if (b) { r.picks[d.id] = { opt: Engine.bookOpt(b) }; n++; } }
    else { const o = d.options.find(x => x.id === oid); if (o) { r.picks[d.id] = { opt: o }; n++; } }
  });
  if (!n) { toast('Ebből a dobásból már semmi sincs meg (átírtad az opciókat).'); return; }
  S.ui.themeId = t.id; persist(); go('dobas'); toast('Visszatöltve a táblára');
}

/* ---------- Súgó ---------- */
function kbd(t) { return h('kbd', null, t); }
function renderHelp() {
  const sec = (title, icon, open, ...kids) => h('details', { class: 'help-sec panel', open: open }, h('summary', null, ic(icon, 20), h('span', null, title), ic('down', 18)), h('div', { class: 'help-body' }, kids));
  const root = h('section', { class: 'help view-in' },
    h('div', { class: 'page-title' }, h('h1', null, 'Súgó'), h('p', null, 'Minden, amit a Kockázzunkról tudni érdemes. Kattints egy címre a kinyitáshoz.')),
    h('div', { class: 'row wrap' }, btn('Bemutató újra', { icon: 'sparkle', kind: 'primary sm', onclick: () => showTour() }), btn('Beállítások', { icon: 'sliders', kind: 'sm', onclick: () => settingsModal() })),
    h('div', { class: 'help-list' },
      sec('Gyors kezdés', 'dice', true,
        h('ol', { class: 'steps' },
          h('li', null, h('b', null, 'Válassz témát'), ' a Dobás nézet tetején: Randi, Utazás, Kajasorsoló, Otthoni főzés és sütés, Mozi, Kézműves, Könyv vagy Meghitt idő.'),
          h('li', null, h('b', null, 'Nyomd meg a Dobás! gombot'), ' (vagy a ', kbd('Szóköz'), ' billentyűt). Minden kocka kipörög egy-egy lehetőséget.'),
          h('li', null, h('b', null, 'Ami tetszik, zárold'), ' a kocka sarkában lévő lakattal, a többit pörgesd újra, amíg össze nem áll az este.'),
          h('li', null, h('b', null, 'Mentsd el'), ' a ', h('em', null, 'Kedvenc'), ' gombbal, vagy másold ki a szöveget egy üzenetbe.'))),
      sec('Kockák, zárolás, kézi választás', 'lock', false,
        h('p', null, 'Egy kocka egy szempont (például Mikor, Hol, Mit csinálunk). Hogy mit akarsz újradobni, azt te döntöd el:'),
        h('ul', null,
          h('li', null, h('b', null, 'Koppints egy kockára'), ': csak az pörög újra.'),
          h('li', null, h('b', null, 'Lakat'), ' (a kocka jobb felső sarkában vagy a lenti listában): a zárolt kocka a következő dobásnál is megmarad. Aranyszínű fénye van.'),
          h('li', null, h('b', null, 'Kézi választás'), ' (lista ikon a lenti soron): kiválaszthatod pontosan, mit szeretnél. Ha nem illik a többihez, jelzi.'),
          h('li', null, h('b', null, 'Szempontok'), ' gomb: kikapcsolhatod azokat a kockákat, amelyek most nem kellenek.'))),
      sec('Szürreális mód és káosz', 'swirl', false,
        h('p', null, 'Alapból az eredmények összeillenek: nem kapsz éjféli strandolást vagy hajnali vacsorát. Ha bekapcsolod a ', h('b', null, 'Szürreális módot'), ', két dolog változik:'),
        h('ul', null, h('li', null, 'olyan váratlan, vicces ötletek is kijöhetnek, amiket a témák ', h('code', null, '~'), ' jellel jelöltek (például vacsora a Holdon);'),
          h('li', null, 'a ', h('b', null, 'Káosz'), ' csúszkával szabod meg, mennyire gyakran szeghetnek szabályt a kockák. Jobbra tolva egyre bolondabb párosítások jönnek.')),
        h('p', null, 'A szürreális eredményt 🌀 jelzi. Kikapcsoláskor az éppen kint lévő szürreális ötleteket újradobja a program (a zároltakhoz nem nyúl).')),
      sec('Hogyan lesznek összeillőek az eredmények?', 'tag', false,
        h('p', null, 'Minden opciónak lehetnek ', h('b', null, 'címkéi'), ', és ezekből áll össze a „józan ész”. Szürreális mód nélkül a program mindig hibátlan, összeillő dobást állít össze (ha van ilyen), nem csak „sokat próbálkozik”. Ezek a kapcsolatok vannak:'),
        h('table', { class: 'help-table' }, h('tbody', null,
          [['#címke', 'ez az opció ilyen tulajdonságú', '#otthon'], ['!címke', 'nem fér össze ezzel (kölcsönös)', '!ejjel'], ['?címke', 'kell mellé valaki, aki ezt adja (a|b = vagy)', '?kint|termeszet'], ['+címke', 'szívesen kerül mellé; gyakoribb lesz', '+bor'], ['~', 'szürreális: csak szürreális módban jön ki', '~'], ['*szám', 'súly: a *3 háromszor gyakoribb, a *0.5 ritkább', '*3']]
            .map(r => h('tr', null, h('td', null, h('code', null, r[0])), h('td', null, r[1]), h('td', null, h('code', null, r[2])))))),
        h('p', null, 'Példa: ', h('code', null, 'Piknik ?kint|termeszet #kaja #nyugodt !ejjel'), '. Ez a piknik csak akkor jön ki, ha valamelyik másik kocka „kint” vagy „természet” helyszínt adott, és éjszakával soha nem fér össze.'),
        h('p', { class: 'muted' }, 'Ha egy követelményt a kockák nem tudnának teljesíteni (például kikapcsoltad a helyszín kockát), a program nem kényszeríti ki, hanem figyelmen kívül hagyja. Ha egy dobásnál mégsem sikerült tökéletes összeállítás, a sor mellett ⚠ jelzés látszik.')),
      sec('Szerkesztés: témák, kockák, opciók', 'edit', false,
        h('ul', null,
          h('li', null, 'A ', h('b', null, 'Szerkesztő'), ' nézetben mindent átírhatsz: téma nevét, ikonját, színét, a kockákat és azok opcióit.'),
          h('li', null, h('b', null, 'Új opció'), ': írd be a lista alján, Enter. A sor végére tehetsz címkét is (lásd fent).'),
          h('li', null, h('b', null, 'Címke ikon'), ' az opció során: négy mezőben szerkesztheted a kapcsolatait, a témában használt címkék egy kattintással beszúrhatók.'),
          h('li', null, h('b', null, 'Szövegként szerkesztem'), ': az egész kockát egyben, soronként egy opcióval. Hosszú listáknál ez a leggyorsabb.'),
          h('li', null, h('b', null, 'Új téma'), ': üresen, másolatból, gyors szövegből (Kocka: opció; opció) vagy kódból.'),
          h('li', null, 'Amit elrontasz, azt a legtöbb helyen a lent felbukkanó ', h('em', null, 'Visszavonás'), ' gombbal visszahozhatod. Az alap témák „Alapok visszaállítása” gombbal újra eredetiek lesznek.'))),
      sec('Könyvtár és importálás', 'book', false,
        h('p', null, 'A Könyv téma a saját könyvlistádról sorsol. A műfaj, hangulat és hossz kockák szűkítik a találatokat; ha nincs pontos egyezés, a legközelebbit adja, és jelzi.'),
        h('ul', null,
          h('li', null, h('b', null, 'Könyvtár fül'), ': valódi polcokon álló gerincek. Ha az egeret ráviszed egy könyvre, kissé megbillen; kattintásra megnyílik: itt állíthatod a státuszát, színét, stílusát, magasságát és vastagságát. A dobásból kiválasztott könyv kiemelve áll a polcon.'),
          h('li', null, h('b', null, 'Átrendezés'), ': húzd a könyveket másik helyre vagy másik polcra (telefonon is). Billentyűvel ', kbd('Shift'), ' + nyilak. A polcok átnevezhetők, hozzáadhatók, törölhetők, a ', h('b', null, 'Rendezés…'), ' gomb cím, szerző, szín, vastagság, műfaj vagy státusz szerint sorba rakja őket.'),
          h('li', null, h('b', null, 'Díszek'), ': a polcon kis kiegészítők élnek (kezdetnek egy fekvő sárkány a könyvhalmon). Kattints rájuk: a vörös-fekete fekvő sárkány orrát megbökheted (háromszor már tüzet okád), ha máshova kattintasz, dorombol; az olvasó fehér szellem megijed, kezével eltakarja a szemét, vagy a könyvét olvasva fürkészi a sorokat; a gyertyás lámpást elfújhatod és újra meggyújthatod; az üvegablak-lámpák alján kapcsolod a fényt, az üvegre kattintva pedig életre kel a jelenet; a kis fekete repülő sárkány (képként rajzolva) füstcsíkot fúj, ami krémszínű, kunkorodó felhőoszloppá válik és tartja a dőlő könyveket: kattintásra nagyot fúj, aztán csapkod, a füstre kattintva megpuffan, a könyvekre kattintva megrezegnek; az alvó macskát felébresztheted, megsimogathatod – háromszor már morcos; a bagoly körülnéz, huhog, megrémül; a pozsgás kinyílik, és katicabogár mászik rajta; a book-nook egy berendezett mini szoba: a lámpáját kapcsolhatod, a szobára kattintva (3D nézetben) felnagyul a kis világ, és bele lehet nézni – a kandalló, az ablak, a cica, a földgömb, a növény, a fotel és az óra is megkattintható (Esc: vissza a polcra); 2D nézetben éjszakai sikátor, kinyíló ajtóval. A ', h('b', null, 'Díszek'), ' gombbal újabbakat tehetsz a polcra; átrendezés módban a helyükre húzhatod, rákattintva eltávolíthatod őket. Billentyűvel is játszhatók (', kbd('Enter'), '). Kímélő módban a szem nem követi az egeret.'),
          h('li', null, h('b', null, '3D könyvtár'), ': a polcok, a könyvek és a díszek valódi 3D-ben látszanak fénnyel és árnyékkal; a könyvekre vigyed az egeret (kihajolnak a polcból), kattints (megnyílik), átrendezés módban húzd őket. A könyvek mintája, színe, díszítése és gerince a könyv szerkesztésénél (Szerkesztés / Kinézet) tetszés szerint állítható. Egyszerre csak egy dísz állhat a polcon (új kirakásakor a régi lecserélődik) – így szép és gyors marad. Ha a gép lassú, az oldal először csendben visszavesz a részletességből, aztán a díszeket lapos képre cseréli, végül felajánlja a 2D nézetet; a díszek 3D-jét a Beállításokban ki is kapcsolhatod. A Könyvtár fejlécében a ', h('b', null, '2D nézet'), ' / ', h('b', null, '3D nézet'), ' gombbal és a Beállításokban is válthatsz.'),
          h('li', null, h('b', null, 'Szerkesztés fül'), ': a teljes lista keresővel, szűrőkkel, tömeges kezeléssel.'),
          h('li', null, 'Könyvet felvehetsz kézzel, vagy ', h('b', null, 'importálhatsz'), ': Goodreads CSV-t, saját CSV-t (fejléc: cím, szerző, műfaj, hangulat, oldal, státusz), JSON listát vagy egyszerű sorokat („Cím – Szerző”).'),
          h('li', null, 'Az importálás előnézetet mutat, a duplikátumokat kihagyja, és hozzáadás vagy csere közül választhatsz.'),
          h('li', null, 'A státuszra (olvasatlan / olvasom / elolvastam) kattintva váltogathatod. A „Csak olvasatlan” kapcsoló a Dobás nézeten a már elolvasottakat kihagyja.'),
          h('li', null, 'Az exportálás CSV-t vagy JSON-t ad, amit kimásolhatsz és elmenthetsz.'))),
      sec('Mentés, átvitel, megosztás', 'export', false,
        h('p', null, 'Minden az ', h('b', null, 'adott böngészőben'), ' mentődik. Ha a linket valaki más nyitja meg, ő a saját, alap állapotával indul, a te módosításaidat nem látja.'),
        h('ul', null,
          h('li', null, h('b', null, 'Egy téma megosztása'), ': Szerkesztő › Kód (megosztás), a másik oldalon Új téma › Kód.'),
          h('li', null, h('b', null, 'Teljes mentés'), ': Beállítások › Mentés kódja. Új eszközön a „Betöltés kódból” visszahozza a témákat, könyveket, kedvenceket és a beállításokat.'),
          h('li', null, 'Privát böngészőablakban, vagy ha törlöd a böngésző adatait, a mentés elveszik. Érdemes időnként kimásolni a mentés kódját.'))),
      sec('Billentyűk', 'help', false,
        h('table', { class: 'help-table' }, h('tbody', null,
          [['Szóköz', 'mindent újradob (a zároltakat nem)'], ['1 – 9', 'az adott sorszámú kocka újradobása'], ['Shift + 1–9', 'az adott kocka zárolása / feloldása'], ['S', 'szürreális mód ki/be'], ['M', 'hang ki/be'], ['← →', 'előző / következő téma'], ['?', 'ez a súgó'], ['Esc', 'ablak bezárása']]
            .map(r => h('tr', null, h('td', null, kbd(r[0])), h('td', null, r[1])))))),
      sec('Gyakori kérdések', 'sparkle', false,
        h('p', null, h('b', null, 'Eltűnt, amit szerkesztettem.'), ' Valószínűleg privát ablakban nyitottad meg, vagy törölted a böngésző adatait. Ilyenkor a mentés kódból visszahozható, ha korábban kimásoltad.'),
        h('p', null, h('b', null, 'Nem szól a hang.'), ' A böngészők csak egy kattintás vagy koppintás után engedik a hangot, és a hangszóró ikonnal ki is kapcsolható. Telefonon a némító kapcsolót is nézd meg.'),
        h('p', null, h('b', null, 'Akadozik az animáció vagy lassan reagál az oldal.'), ' Kapcsold be a Kímélő módot (Beállítások): rövidebb dobás, nincs háttérfény és konfetti. Ha az oldal azt észleli, hogy lassú a gép, magától is felajánlja. A „Mozgás és animációk” kapcsolóval mindent le lehet állítani, és a rendszer „csökkentett mozgás” kérését is tiszteletben tartja.'),
        h('p', null, h('b', null, 'Mindig ugyanaz jön ki.'), ' Egy kockában kevés az opció. Bővítsd a Szerkesztőben, vagy kapcsolj be több kockát a Szempontok gombbal.')))
  );
  clear($('#view')).appendChild(root);
}

/* ---------- bevezető túra ---------- */
function tourSlides() {
  const mini = (t, cls) => h('div', { class: 'mini-cube' + (cls ? ' ' + cls : '') }, h('span', null, t));
  return [
    { t: 'Üdv a Kockázzunkban', p: 'Kockák, amik kisorsolják az estédet, az utadat, a vacsorádat vagy a következő könyvedet. Pörgess, zárolj, és szerkessz mindent a saját ízlésed szerint.', art: h('div', { class: 'art-cubes' }, mini('Esti randi'), mini('Piknik', 'b'), mini('Fagyi', 'c')) },
    { t: 'Pörgesd a kockákat', p: 'A Dobás! gomb (vagy a Szóköz) mindet újrapörgeti. Egy kockára koppintva csak az az egy pörög újra.', art: h('div', { class: 'art-row' }, h('span', { class: 'btn primary lg', style: { pointerEvents: 'none' } }, ic('dice', 22), 'Dobás!'), h('span', { class: 'kbd-art' }, kbd('Szóköz'))) },
    { t: 'Zárold, ami tetszik', p: 'A kocka sarkában lévő lakat megtartja az eredményt. A többit pörgesd tovább, amíg össze nem áll a tökéletes terv.', art: h('div', { class: 'art-lock' }, mini('Naplemente', 'locked'), h('span', { class: 'lockbtn static' }, ic('lock', 16))) },
    { t: 'Válassz témát, vagy alkoss újat', p: 'Hét kész téma van, és a Szerkesztőben bármelyiket átírhatod, vagy létrehozhatsz sajátot kockákkal, opciókkal, színnel.', art: h('div', { class: 'art-chips' }, [['💞', 'Randi'], ['✈️', 'Utazás'], ['🍝', 'Kajasorsoló'], ['➕', 'Új téma']].map((x, i) => h('span', { class: 'chip' + (i === 0 ? ' on' : ''), style: { pointerEvents: 'none' } }, x[0], ' ', x[1]))) },
    { t: 'Összeillő eredmények', p: 'A kockák figyelnek egymásra: nem lesz éjféli strandolás vagy hajnali vacsora. Ha kíváncsi vagy a bolondabb oldalra, kapcsold be a Szürreális módot.', art: h('div', { class: 'art-row' }, h('span', { class: 'switch', style: { pointerEvents: 'none' } }, h('input', { type: 'checkbox', checked: true, tabindex: '-1' }), h('span', { class: 'tr' }), h('span', null, 'Szürreális mód')), h('span', { class: 'flag s' }, ic('swirl', 13), 'szürreális')) },
    { t: 'Minden a tiéd', p: 'A könyvlistádat is felveheted vagy importálhatod, a kedvenc dobásaidat elmentheted. A Súgóban minden részlet megvan, és bármikor visszahívhatod ezt a bemutatót.', art: h('div', { class: 'art-row big-emoji' }, h('span', null, '📚'), h('span', null, '💞'), h('span', null, '🎲')) }
  ];
}
function showTour(first) {
  const slides = tourSlides(); let i = 0;
  const art = h('div', { class: 'tour-art' }), title = h('h2', { class: 'tour-title' }), text = h('p', { class: 'tour-text' });
  const dots = h('div', { class: 'tour-dots', role: 'tablist' }, slides.map((s, k) => h('button', { type: 'button', role: 'tab', 'aria-label': (k + 1) + '. lépés', onclick: () => { i = k; draw(); } })));
  let m;
  const prev = btn('Előző', { icon: 'left', kind: 'ghost', onclick: () => { if (i > 0) { i--; draw(); } } });
  const next = btn('', { kind: 'primary', onclick: () => { if (i < slides.length - 1) { i++; draw(); } else m.close(); } });
  function draw() {
    const s = slides[i];
    clear(art).appendChild(s.art.cloneNode(true));
    title.textContent = s.t; text.textContent = s.p;
    art.classList.remove('swap'); void art.offsetWidth; art.classList.add('swap');
    $$('button', dots).forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-selected', k === i); });
    prev.style.visibility = i === 0 ? 'hidden' : 'visible';
    clear(next).append(h('span', null, i === slides.length - 1 ? 'Kezdjük!' : 'Tovább'), ic(i === slides.length - 1 ? 'check' : 'right', 18));
  }
  m = openModal({
    title: '', cls: 'tour', hideClose: false, body: [art, title, text, dots,
      h('div', { class: 'row tour-nav' }, prev, h('span', { class: 'spacer' }), btn('Kihagyom', { kind: 'ghost sm', onclick: () => m.close() }), next)],
    onClose: () => { if (!S.settings.seen) { S.settings.seen = true; persist(); } }
  });
  draw();
}

/* ---------- Beállítások ---------- */
function settingsModal() {
  const st = S.settings;
  const app = h('div', { class: 'row wrap', role: 'radiogroup', 'aria-label': 'Megjelenés' },
    [['auto', 'Automatikus', 'sliders'], ['light', 'Világos', 'sun'], ['dark', 'Sötét', 'moon']].map(x => h('button', { type: 'button', role: 'radio', 'aria-checked': st.appearance === x[0], class: 'chip' + (st.appearance === x[0] ? ' on' : ''), onclick: e => { st.appearance = x[0]; applyAppearance(); persist(); $$('.chip', e.currentTarget.parentNode).forEach(c => { c.classList.remove('on'); c.setAttribute('aria-checked', 'false'); }); e.currentTarget.classList.add('on'); e.currentTarget.setAttribute('aria-checked', 'true'); } }, ic(x[2], 16), x[1])));
  const sw = (label, key, desc, cb) => h('div', { class: 'set-row' }, h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: !!st[key], onchange: e => { st[key] = e.target.checked; persist(); if (cb) cb(e.target.checked); } }), h('span', { class: 'tr' }), h('span', null, label)), desc ? h('span', { class: 'hint' }, desc) : null);
  const chaos = h('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(st.chaos), 'aria-label': 'Káosz mértéke', oninput: e => { st.chaos = +e.target.value; persist(); } });
  openModal({
    title: 'Beállítások', wide: true,
    body: [
      h('div', { class: 'set-sec' }, h('h3', null, 'Megjelenés'), app),
      h('div', { class: 'set-sec' }, h('h3', null, 'Hang és mozgás'),
        sw('Hang', 'sound', 'Kocka-kopogás és csilingelés. Csak egy koppintás után szólalhat meg.', on => { if (on) { Sound.init(); Sound.tick(); } }),
        sw('Mozgás és animációk', 'motion', 'Kikapcsolva a kockák egyből a helyükre ugranak. A rendszer „csökkentett mozgás” beállítását mindig tiszteletben tartja.', () => applyMotionClasses()),
        sw('Kímélő mód', 'lite', 'Gyengébb gépen vagy telefonon, ha akadozik az oldal: rövidebb dobás, nincs háttérfény, nincsenek belépő animációk és konfetti.', () => applyMotionClasses())),
      h('div', { class: 'set-sec' }, h('h3', null, 'Könyvtár nézet'),
        h('div', { class: 'set-row' }, h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: st.view3d !== false, disabled: !l3GL(), onchange: e => { st.view3d = e.target.checked; if (e.target.checked) { delete st.perf3dAsked; if (typeof L3 !== 'undefined') { L3.deg = L3.weak ? 1 : 0; L3.slow = 0; if (L3.r) l3Quality(); } } persist(); if (typeof drawLibrary === 'function' && location.hash === '#polc') drawLibrary(); } }), h('span', { class: 'tr' }), h('span', null, '3D könyvtár')),
          h('span', { class: 'hint' }, l3GL() ? 'Valódi 3D polcok, könyvek és díszek fénnyel-árnyékkal. Gyengébb gépen kikapcsolva a gyorsabb 2D nézet látszik. Kímélő módban mindig 2D.' : 'Ez a böngésző nem támogatja a 3D-t (WebGL), ezért a 2D nézet látszik.')),
        h('div', { class: 'set-row' }, h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: !st.flatDecor, disabled: !l3GL(), onchange: e => { st.flatDecor = !e.target.checked; if (!st.flatDecor) delete st.flatDecor; persist(); if (typeof drawLibrary === 'function' && location.hash === '#polc') drawLibrary(); } }), h('span', { class: 'tr' }), h('span', null, 'Díszek 3D modellként')),
          h('span', { class: 'hint' }, 'Kikapcsolva a díszek lapos képként állnak a 3D polcon: sokkal gyorsabb, ha akadozik az oldal. A könyvek és a polc ettől még 3D. Egyszerre ' + MAX_DECOR + ' dísz állhat kint.'))),
      h('div', { class: 'set-sec' }, h('h3', null, 'Szürreális mód'),
        sw('Szürreális mód bekapcsolva', 'surreal', 'Váratlan, vicces opciók és szabályszegő párosítások is kijöhetnek.'),
        h('div', { class: 'field' }, h('label', null, 'Káosz mértéke'), chaos)),
      h('div', { class: 'set-sec' }, h('h3', null, 'Mentés és átvitel'),
        h('p', { class: 'muted small' }, 'Az adataid ebben a böngészőben vannak. A mentés kódjával átviheted őket másik eszközre, vagy biztonsági másolatot készíthetsz.'),
        h('div', { class: 'row wrap' },
          btn('Mentés kódja', { icon: 'export', kind: 'sm', onclick: () => textBox('Teljes mentés', makeCode(backupObject()), 'Másold ki és tedd el valahová. Új eszközön a „Betöltés kódból” gombbal tudod visszaállítani: témák, könyvek, kedvencek, beállítások.') }),
          btn('Betöltés kódból', { icon: 'import', kind: 'sm', onclick: restoreModal }),
          btn('Hiányzó alap témák', { icon: 'plus', kind: 'sm', title: 'A törölt alap témákat visszahozza', onclick: restoreSeedThemes }))),
      h('div', { class: 'set-sec' }, h('h3', null, 'Újrakezdés'),
        h('div', { class: 'row wrap' }, btn('Minden törlése', { icon: 'trash', kind: 'danger sm', onclick: wipeAll }), h('span', { class: 'muted small' }, 'Töröl minden saját témát, könyvet és kedvencet, és az alap állapotot állítja vissza.')))
    ],
    actions: [{ label: 'Kész', kind: 'primary' }],
    onClose: () => { if (S.ui.view === 'dobas') renderPlay(); }
  });
}
function backupObject() {
  return {
    v: 1, full: true,
    themes: S.themes.map(t => Object.assign(themeToCompact(t), { id: t.id, b: t.builtin ? 1 : 0, x: t.dice.map(d => Object.assign(diceToCompact(d), { id: d.id })) })),
    books: S.books, shelves: S.shelves, decor: S.decor, history: S.history.map(e => Object.assign({}, e, { p: {} })), settings: S.settings, seedV: S.seedV, tags: Engine.tagNames
  };
}
function restoreBackup(o) {
  if (!o || !o.full || !Array.isArray(o.themes) || !o.themes.length) throw new Error('Ez nem teljes mentés. (Egy téma kódját az Új téma › Kód fülön töltheted be.)');
  const themes = o.themes.map(c => {
    const t = themeFromCompact(c); if (c.id) t.id = c.id; t.builtin = !!c.b;
    t.dice.forEach((d, i) => { if (c.x[i] && c.x[i].id) d.id = c.x[i].id; });
    return t;
  });
  Engine.setTagNames(o.tags);
  S.themes = themes; S.seedV = o.seedV || 1;
  S.books = Array.isArray(o.books) ? o.books.map(b => newBook(b)) : [];
  S.shelves = Array.isArray(o.shelves) ? o.shelves : [];
  S.decor = Array.isArray(o.decor) ? o.decor : undefined;
  S.history = Array.isArray(o.history) ? o.history : [];
  S.settings = Object.assign({}, DEFAULTS, o.settings || {}, { seen: true });
  Object.keys(RT).forEach(k => delete RT[k]); S.rolls = {};
  S.migrated = Seed.migrate(S); Seed.recolor(S);
  S.ui.themeId = S.themes[0].id;
  persistNow(); applyAppearance(); applyMotionClasses();
}
function restoreModal() {
  const ta = h('textarea', { class: 'codebox', rows: 7, spellcheck: 'false', placeholder: 'KZ1:…' });
  openModal({
    title: 'Betöltés kódból', body: [h('p', { class: 'muted' }, 'Illeszd be a teljes mentés kódját. A jelenlegi témák, könyvek, kedvencek és beállítások a mentés tartalmára cserélődnek.'), ta],
    actions: [{ label: 'Mégse' }, {
      label: 'Visszaállítás', kind: 'primary', onClick: () => {
        try { restoreBackup(readCode(ta.value)); } catch (e) { toast(e.message, 'long'); return false; }
        toast('Visszaállítva'); drawNav(); show(S.ui.view);
      }
    }], focus: 'textarea'
  });
}
function restoreSeedThemes() {
  const have = new Set(S.themes.map(t => t.id)); let n = 0;
  Seed.themes().forEach(t => { if (!have.has(t.id)) { S.themes.push(t); n++; } });
  persist(); toast(n ? n + ' alap téma visszakerült' : 'Minden alap téma megvan');
}
async function wipeAll() {
  if (!await ask({ title: 'Minden törlése?', text: 'Ez végleges: a saját témáid, könyveid és kedvenceid elvesznek. Ha fontosak, előbb másold ki a mentés kódját.', ok: 'Mindent törlök', danger: true })) return;
  try { localStorage.removeItem(STORE_KEY); } catch (e) { }
  Object.keys(RT).forEach(k => delete RT[k]);
  initState(); applyAppearance(); applyMotionClasses();
  S.settings.seen = true; persistNow(); drawNav(); toast('Újrakezdtük'); if (location.hash !== '#dobas') location.hash = 'dobas'; else show('dobas');
}
