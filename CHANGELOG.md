# Változásnapló

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
