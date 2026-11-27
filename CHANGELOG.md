# Változásnapló

## v15 — Gyorsabb 3D polc: ritkább árnyék, 60 fps korlát, megjegyzett minőség, kézi választó (2026-11-27)
Visszajelzés: „szürreálisan lassú az oldal 3D része”. Mérés (`SwiftShader`, szinkron `readPixels`): a főpassz ~ a pixelszámmal arányos (kitöltés-korlátos), az árnyék-térkép újrarajzolása (2048² VSM-elmosás) ugyanannyi, mint a teljes főpassz, és **minden animációs képkockán lefutott** (a lámpák/lángok csillogásánál is, ahol semmi nem mozgat árnyékot vető geometriát); 120/144 Hz-en a képkockaszám is korlátlan volt.
- **Árnyék**: alap térkép 1024² (2048² helyett; a sugár világ-egységben változatlan, szemre azonos), gyors/vészfokozaton 512². Animáció közben a térkép legfeljebb ~20 Hz-en frissül (`l3Render(anim)`, `L3.sdT/sdF`), a záró frissítés mindig lefut (`l3Frame`: függő `L3.sd` → még egy képkocka); a kamera-rács ugrásakor azonnal frissül (különben elcsúszna).
- **Csendes animációk**: `l3Anim(d, fn, done, quiet)` és `l3Seq().quiet()` – nem rajzoltatnak árnyékot. A lámpák (lámpás + 3 üvegablak) minden animációja csendes (fény, csillogás, láng, hullócsillag).
- **~60 fps korlát** (`l3Frame` elején `now - L3.tr < 12` → kihagy): 120/144 Hz-es kijelzőn a GPU-terhelés fele-harmada.
- **Felbontás**: telefonon alap 1,5× (volt 2×; MSAA marad, így a v13-nál jóval élesebb), 1. fokozat 1,25×; asztalin ≤ 1,25×. **„Éles” választással** telefonon 2×, asztalin 1,5× + 2048-as árnyék.
- **Megtanult fokozat** (`l3LoadDeg/l3SaveDeg`, `localStorage['kockazzunk.l3deg']`, eszközönként, nem része a mentésnek, 7 nap): ha a lassúság-őr visszavett, a következő látogatás már az 1. fokozaton indul. 20 képkockás mérési ablak (volt 30). A Beállítások kapcsolói/választója nullázzák.
- **Beállítások › 3D minőség** (`S.settings.q3d`: `auto` | `high` | `fast`; `l3Pref()`): Automatikus (alap), Éles, Gyors (1. fokozat, 1×, 512-es árnyék, parallax nélkül, MSAA nélkül újratöltés után).
- A szekrény `renderOrder = 20`: az utolsó átlátszatlan rajzolás, a könyvek mögötti részére a mélységteszt kiszűri a drága árnyalást (valós GPU-n számít; szoftveres GL-en nem mérhető).
- Mérés-eszközök (scratch, nem a repóban): szinkron képkocka-idő változatonként; díszenként: építés, program-szám, fények, draw call.
- Tesztek: `lib3d-perf` (1024-es árnyék, árnyék-szám animáció közben, csendes animáció = 0, 60 fps korlát, fokozat-táblázat, megtanult fokozat, Beállítások-választó).

## v14 — Hűséges üvegablak-lámpák a termékfotókból, éles könyvek telefonon (2026-11-26)
- **Üvegablak-lámpák: a fotók mása.** A három lámpa (`uveg-var` Csillagos vár, `uveg-rozsa` Rózsák és fekete pillangó, új: `uveg-kard` Lángoló kard) nyomata a felhasználó termékfotóiból van kivágva (`tools/make-glass.py` → `src/glass-img.js`, `GL_ART`): a panel külső kontúrjára (két körív) maszkolva, 1,5× felskálázva + enyhe élesítéssel, JPEG q88 (~740 KB összesen). Nem rajzolt közelítés többé. A kivágás a fotók pixeleiben adott panel-méreteket használja (`GL_SPEC`/`glGeom`: panel, talp, ív-emelkedés); a csillagos vár fényes pontjai (csillagok, hullócsillag-fejek) is a képből vannak kinyerve (`stars`).
- **3D** (`src/lib3d-lamps.js`, `glBuild3`): ívelt, vastagított panel (`glShape`: 2 körív; test + a nyomat lapja UV-val + fényes fedő), a fotón látható talp lámpánként: sötét fa lap levágott élekkel + meleg visszfény-vonal és fényfolt; fekete lekerekített lap; füstös akril lap recés sávval. A nyomat fényforrás-mentes (a fotón már „kész” a hátulról világított kép), kikapcsolva elsötétül, a háttérfény/pont-fény/effektek elmaradnak. Jelenetek: vár = hullócsillagok + megcsillanó csillagok; rózsák = ferde fényfoltsáv fut végig; kard = fellobbanó láng + felszálló szikrák. A talpra kattintva kapcsol a fény, az üvegre kattintva jelenet (sötét üvegre kattintva előbb felkapcsol).
- **2D tartalék** (`src/decor-glass.js`): ugyanaz SVG-ben (`<image>` ívre vágva + talp + CSS-jelenetek `.is-wish`/`.is-glint`/`.is-blaze`); a régi mozaik-rajzok kikerültek (a Book nook számára `glPt`, `glStar` megmaradt).
- **Éles könyvek telefonon/táblán**: a 3D eddig minden érintőkijelzőn „gyenge GPU”-ként 1× felbontásra és MSAA nélkül indult → a gerincek elmosódtak. Új `l3GpuClass()`: `mobile` (érintőkijelző / Mali·Adreno·PowerVR) = a kijelző szerinti felbontás (keskeny nézetben legfeljebb 2×, szélesen 1,5×), MSAA bekapcsolva; csak a valóban gyenge (integrált Intel, szoftveres) GPU indul az 1. fokozaton. A lassúság-őr változatlanul visszavesz (1. fokozat: telefonon 1,5×, 2.: 0,75× + lapos díszek). `l3PixelRatio()`.
- Tesztek: `decor2` (3 lámpa, jelenet-osztályok), `lib3d-perf` (telefon-felbontás fokozatok).

## v13 — A valódi könyvespolc, újraépített sárkányok és díszek (2026-11-25)
- **A barátnő valódi könyvei az alapértelmezett könyvtár** (`Seed.library()` az `src/data-base.js`-ben): 5 polc a fotók szerint – „Tahereh Mafi – Ne érints! sorozat” (10), „Kennedy és Garber” (7), „Sötét romantika” (9), „Romantikus kedvencek” (5), „Egyéb” (2) = 33 könyv; a gerinc színe/stílusa/mintája/fóliája/vastagsága a fotókról közelítve, oldalszám ismeretlen (0), mind „olvasatlan”. Bizonytalan címek (a Riley Baker „…szerencse”, Hideghábori) a könyv-szerkesztőben javíthatók.
- **Egyszeri áttérés** (`Seed.adoptReal`, `settings.libV = 13`): ha a mentésben még csak a régi példakönyvek (`example:true`) vannak, lecserélődnek a valódiakra (üzenet: „Felkerült a valódi könyvespolc…”); a saját könyvekhez nem nyúl. Üres polcon „A valódi polc betöltése” gomb. Friss telepítés eleve a valódi polccal indul.
- **Fekvő sárkány teljes újraépítés** (`src/lib3d-dragons2.js`): felemelt nyak, ék alakú fej szunyókáló réspupillás szemmel, szarvak, fogak, sütött (AO) pikkelyek, hasi lemezek, összehajtott, ívelt szélű szárnyak (4 ujj, hártya-függöny), három sötét bőrkötéses könyv címmel (A SÁRKÁNY KÖNYVE, ÉJFÉLI MESÉK, SÖTÉT LÁNGOK). A 2D tartalék rajza (`decor-dragon.js`) ehhez igazítva újrarajzolva (ar 1,71, viewBox `0 -23 210 123`).
- **A repülő/fújó sárkány valódi 3D modell** (`src/lib3d-fly.js`, a régi `lib3d-flyimg.js` rétegelt 2D képe helyett): fényes fekete SDF-sárkány a fekvő sárkány részletes fejével (közös `dgHeadRig`), kunkori farok, összehajtott szárnyak; a füst spirálokkal bevésett krémszínű gyantafelhő-oszlop (a bevésés a háló része), amely a 4 ferdén dőlő, aranypántos, címes sötét könyvet tartja. Animációk: fújás (visszarúgás, száj, füstpamacsok), szárnycsapás, oszlop-puff, könyv-ringás, pislogás, idle.
- **Szellem**: hosszabb, három csúcsú szegély függőleges redő-bumppal (nem lapos doboz); `dgMats(bk)`, `dgWing(M, far, cs)`, `dgHeadGeo/JawGeo(cs, key)` paraméterezhető (fekete sárkány palettája).
- Tesztek: `decor3d` (nincs többé „2D kép” dísz), `shelf`/`library` a valódi polchoz igazítva.

## v12 — Szebb, mintás könyvek, dark romance színvilág, egyetlen dísz (2026-11-24)
- **Könyvek nagyobbak** (magasabb/szélesebb gerinc, `SPINE_H`, `TH_W`), és **jobban kihajolnak** hoverre (0,3 rad billenés, kiemelkedés előre és fel).
- **Új gerinc-motor `src/spine.js`**: a gerincet egy kettős vászon (`Dual`) rajzolja – szín + „maszk” (R=dombormű, G=érdesség, B=fémesség) – ugyanaz a kép adja a 2D hátteret, a 3D textúrát (map + roughness/metalness/bump) és a szerkesztő előnézetét.
- **8 stílus** (Sima, Csíkos, Díszes, Modern, Kopott, Bőrkötés, Keretes, Kéttónusú) × **9 minta** (Nincs, Damaszt, Rács, Inda és tüske, Csillagos ég, Pikkely, Marmor, Hullám, Gótikus ív) × **6 fólia** (arany/ezüst/réz fém; vérvörös/éjfekete/krém tinta) – fejléc-szalagok, dombornyomott cím, kopásnyomok, lapszélek, vászon-/papír-textúra a 3D-ben. Az alapértelmezett megjelenés a könyv azonosítójából adódik (kb. 80%-uk mintás).
- **Könyv-szerkesztő újraírva** (`bookPopup`): élő előnézet, stílus/minta/szín/fólia/magasság/vastagság választó, 24 színű dark romance paletta, „Véletlen” gomb, gyors gombok.
- **Dark romance színek** az egész oldalon: bordó, vérvörös, éjkék, mélyzöld, arany; nincs rózsaszín/barbie. A témák régi színei egyszeri átszínezéssel (`palV`, `Seed.recolor`) a az új palettára kerülnek; sötétebb dió szekrény, szűkebb expozíció.
- **Díszek: egyszerre egy** (`MAX_DECOR = 1`). Az új dísz kirakása a régit lecseréli („Csere erre”). A régi mentések díszei egyszer lekerülnek (`settings.decor12`), az oldal díszek nélkül indul.
- **Díszek szebben**: nagyobb méret, meleg háttér-fényfolt (additív „spotlámpa” a hátlapon), mélyvörös sárkány és fekete-bordó szárny, a book nook, a növény, a macska füle, az üvegablak-lámpa és a bunting színei átszínezve; a 2D alternatívák is.
- Súgó és Beállítások frissítve; `test/decor-limit.test.js` újraírva (egy dísz, csere, egyszeri törlés, levágás, gyenge GPU). A régi tesztek `window.__STARTER = true`-val kérnek kezdő díszeket.

## v11 — Díszlimit, gyenge-GPU mód, szebb árnyék (2026-11-23)
- **Díszlimit**: egyszerre legfeljebb 8 dísz lehet kint (`MAX_DECOR`). A Díszek ablak számol („Kint van: n / 8”), a limitnél a Hozzáadás üzenetet ad; régi mentésből a felesleg betöltéskor lekerül (a polcok sorrendjében az első 8 marad) és egy üzenet szól róla.
- **Gyenge GPU felismerése** (érintőképernyő, Mali/Adreno/Intel/szoftveres renderer): eleve a 2. minőségi fokozaton indul, MSAA és egér-parallax nélkül.
- **Díszek lapos módban**: a lassúság-őr 2. fokozatán a díszek 3D modellje lapos képre cserélődik; a Beállítások › „Díszek 3D modellként” kapcsolóval ez végleg is kérhető. A könyvek és a polc ekkor is 3D.
- **Gyorsabb szemkövetés/hover**: a „nézés” csak nézet-újrarajzolást kér, az árnyék-térképet nem frissíti; ritkább küszöb.
- **Kinézet**: lágy VSM árnyék a kemény PCF-élek helyett (képkockánként egyetlen mintavétel, a szűrés csak árnyék-frissítéskor fut); a szekrény hátlapja fülkénként árnyalt (sötétebb a deszka alatt, a sarkokban és a polc mentén).
- Súgó és Beállítások frissítve; új teszt: `test/decor-limit.test.js` (limit, levágás, modal-számláló, gyenge GPU, lapos díszek).

## v10 — 3D teljesítmény (2026-11-21)
- **Árnyék-térkép állandó**: csak akkor rajzolódik újra, ha valami mozog (hover, animáció, húzás); görgetéskor és az egér-parallaxnál nem (az árnyék-kamera 96 px-es rácson ugrik). Egy állandósult képkocka ~160 draw call / ~50 e háromszög a korábbi ~420 / ~180 e helyett.
- **Olcsóbb árnyék-szűrés**: PCFShadowMap (9 minta) a PCFSoft (36 minta) helyett, `shadow.radius` a lágysághoz.
- **Alap felbontás ≤ 1,25×** (retina-n a korábbi 2× helyett: ~2,5× kevesebb képpont); a book nook zoom ≤ 1,5×.
- **Clearcoat helyett olcsó fényes anyag** (`l3Phys`: MeshStandard, csökkentett érdesség).
- **Lassúság-őr**: minden folytonos képkockát lát (görgetést is), 30 képkockás ablak, szigorúbb küszöb (med > 24 ms), két csendes minőségi fokozat (`l3Quality`: 1× / 1024-es árnyék, majd 0,75× / 512), végül a 2D-ajánlat.
- Új teszt: `test/lib3d-perf.test.js`; `decor3d` őr-ellenőrzése bővítve.

## v9 — Sárkányok és szellem finomítása (2026-11-21)
- **Fekvő sárkány**: vörös-fekete (fekete hát/szárny, vörös test, narancsos has), hosszabb könyvhalom alatta (már nem lóg le), a farka a halmon pihen. 3D és 2D egyaránt.
- **Repülő sárkány = 2D kép**: a referencia-rajz szerint – kis fekete sárkány, füstcsík, ami krémszínű kunkorodó felhőoszloppá nő és tartja a dőlő sötét könyveket. Egyetlen SVG-forrás (`decor-baby.js`) szolgál a 2D nézetnek és – rétegenként textúrázott síkokként (`lib3d-flyimg.js`) – a 3D polcnak is; kattintás: fúj → csapkod, a füstre: megpuffan, a könyvekre: rezegnek, szemvillogás, idle.
- **Szellem újratervezve**: sima fehér harang-test, ovális szemlyukak, kis fekete könyv, a hullámos szegély átlóg a polc élén (3D: új test/kar/szegély-geometria, 2D: új SVG); könyvkattintásra „olvasó” szemmozgás.
- Súgó frissítve; új segédeszköz: `test/fly-preview.js`; `decor3d` kivétel a képalapú `kis-sarkany`-ra.

## v8 — Új sárkányok + book nook mini világ (2026-11-19)
- **Fekvő sárkány**: egyetlen, teljes sárkány szunyókál három könyv tetején (pikkelyes test, hasi lemezek, hátgerinc-tüskék, összehajtott szárnyak, szarvak, szemhéjas szem). Orrbökés: füstöl, háromszor egymás után tüzet okád; máshova kattintva dorombol. A régi sárkány-pár (fej + farok) mentései automatikusan egy fekvő sárkánnyá alakulnak.
- **Repülő sárkány + füstje**: pillanatkép, ahogy épp nagyot fúj a könyvekre; a füstoszlop nekitámaszkodik a könyveknek és „tartja” őket. Kattintásra nagyot fúj (a láng és a füst megduzzad), aztán csapkod; a füstre kattintva megpuffan.
- **Book nook = berendezett 3D mini szoba**: ívelt ablak holddal és háztetőkkel, csíkos tapéta, deszkapadló, beépített könyvespolc földgömbbel, kandalló párkánnyal és gyertyákkal, fotel párnával, alvó cica, kisasztal lámpával, szőnyeg, növény, függőlámpa, fényfüzér. A lámpa kapcsol (mentődik) és a szoba besötétedik.
- **Ráközelítés**: a szobára kattintva a kis világ felnagyul a polcról (a kamera belép a szobába), egérrel körbe lehet nézni; kattintható a lámpa, a kandalló (fellobban), az ablak (hullócsillag, függöny), a cica (ébred, szívek), a földgömb (pörög), a növény, a fotel, az óra; gombsor billentyűzetre/érintésre; Esc/×/háttér zár. Bezáráskor a saját vászon és minden GPU-erőforrás felszabadul.
- Súgó frissítve; új teszt: `nookzoom`; a decor-tesztek seed-jelzője stabilabb; `decor3d` kezeli a zoom megnyitását.
- A projekt neve KockaLand (repo: Ufmanitu/KockaLand).

## v6 — 3D Könyvtár (2026-11-18)
- A Könyvtár valódi 3D-ben (Three.js): fa szekrények, könyvek, fény + árnyék, hover-kihúzás, kattintás, húzás, billentyűzet; 2D tartalék (nincs WebGL / Kímélő mód / kapcsoló)
- Mind a 11 dísz valódi, procedurális 3D modell egyéni animációkkal: sárkány-fej + farok (doboz, szemöldök, füst, farok-legyintés), lámpás (valódi fény), két üvegablak-lámpa, book-nook, olvasó szellem, kis sárkány + felhő, alvó macska, bagoly, cserepes pozsgás
- Lassúság-őr (csendes visszavétel, majd 2D-ajánlat), „3D könyvtár” kapcsoló a Beállításokban, súgó bővítve
- Új tesztek: decor3d (modellek, kattintás-sorozat, szivárgás, őr), lib3d

## v5 — Díszek D3 + kezdő készlet (2026-11-16)
- Új díszek: kis sárkány + felhő (prüszköl, csapkod, elalszik, esik), alvó macska (ébredés, dorombolás, morcos), bagoly (körülnéz, huhog, megrémül), cserepes pozsgás (virágzik, katicabogár), book-nook minivilág (lámpa-kapcsoló, kinyíló ajtó, macska)
- Kezdő készlet: 7 dísz szétosztva a polcokon (csak első betöltéskor)
- Idle-animáció csak a látható díszeken; súgó bővítve; test/decor3.test.js

## v4 — Díszek D2 (2026-11-16)
- Olvasó szellem, gyertyás lámpás, két üvegablak-lámpa (kapcsolható fény, jelenetek); `dcApi`, tartós `off`

## v3 — Díszek D1 (2026-11-16)
- Dísz-keretrendszer, sárkány-pár (orrbökés, farok-legyintés), Díszek ablak, szemkövetés, billentyűs játék

## v2 — Könyvtár és minőség (2026-11-15)
- Könyvtár nézet (polcok, gerincek, húzás, rendezés), Mozi 339 film, Otthoni főzés/sütés téma, koherencia-átdolgozás, Kímélő mód, kockalapok javítása

## v1 (2026-11-14)
- Témák, motor, 3D kockák, szerkesztő, könyvspolc, napló, súgó
