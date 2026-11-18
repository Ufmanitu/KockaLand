# Változásnapló

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
