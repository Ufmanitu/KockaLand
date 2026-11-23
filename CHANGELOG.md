# Változásnapló

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
