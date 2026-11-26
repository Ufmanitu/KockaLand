# Kockázzunk — ütemterv

## Kész
- v1: 7 téma, koherens motor, szürreális mód, 3D kockák, szerkesztő, könyvspolc, napló/kedvencek, súgó, túra
- v2: teljesítmény + Kímélő mód, üres lapok/ékezetek javítása, szigorú címkék (lint 0 szabálysértés), Mozi 339 film, Otthoni főzés/sütés téma, Könyvtár (polcok, gerincek, húzás)
- 3D Könyvtár (v6): valódi 3D polcok/könyvek (Three.js), mind a 11 dísz saját 3D modell + animáció, 2D tartalék, lassúság-őr, beállítás-kapcsoló
- Díszek D1–D3: szellem, lámpás, 2 üvegablak, macska, bagoly, pozsgás (egyéni animációk), kezdő készlet
- v8 (2026-11-19): fekvő sárkány a könyvhalmon + repülő, tüzet fújó sárkány (a füst tartja a könyveket); book nook = berendezett 3D mini szoba + ráközelítés (zoom-nézet); GitHub: Ufmanitu/KockaLand
- v9 (2026-11-21): vörös-fekete fekvő sárkány hosszabb könyvhalmon; a repülő sárkány 2D kép (füstcsík → krémszínű felhőoszlop, a könyveket tartja; 3D-ben textúra-síkokon); a szellem újratervezve (fehér harang, ovális szem, fekete könyv)
- v10 (2026-11-21): 3D teljesítmény – állandó árnyék-térkép, olcsó PCF, felbontás ≤1,25×, clearcoat nélküli anyagok, gyorsabb automatikus minőségvisszavétel
- v11 (2026-11-23): díszlimit (8), gyenge-GPU felismerés + lapos díszek mód, lágy VSM árnyék, árnyalt hátlap
- v12 (2026-11-24): `spine.js` gerinc-motor (8 stílus × 9 minta × 6 fólia, domborműves/fémes 3D), nagyobb, jobban kihajló könyvek, új könyv-szerkesztő, dark romance színvilág, egyetlen dísz (csere), meleg fényfolt a dísz mögött. Ha a díszek így sem elég szépek/valósághűek, a user döntése: végleg kivenni őket (a 3D polc és a könyvek ettől függetlenül működnek).
- v13 (2026-11-25): a valódi könyvespolc (33 könyv, 5 polc, `Seed.library`/`adoptReal`), a fekvő és a fekete sárkány újraépítve (SDF, `lib3d-dragons2.js`/`lib3d-fly.js`), 2D tartalék-rajz újra, szellem-szegély redők
- v14 (2026-11-26): üvegablak-lámpák a termékfotókból (csillagos vár, rózsák, lángoló kard; 3D + 2D), éles könyvek telefonon (mobil-GPU osztály, 2× felbontás, MSAA)

## Következő (javaslatok, a user döntése szerint)
1. Book nook bővítés: több tárgy a szobában (teáscsésze, madaras ablak), szobák cseréje (pl. tetőtér, konyha), hang
2. 3D finomítás: dísz-ablak 3D előnézete (most 2D SVG), kamera enyhe forgatás, gyertyaláng-fény a lámpáson, hang
3. Díszek finomítása: opcionális hangok (kapcsolható), további díszek (gyertyatartó, kristálygömb, madaras ablak), napszakos hangulat (esti fény)
4. Tartalom: több opció/téma a user visszajelzése alapján; személyes témák (közös emlékek)
5. Dísz-szerkesztő: átnevezés, polc-választás húzással a Díszek ablakból
6. Hozzáférhetőség: képernyőolvasó-szövegek a díszek állapotaihoz, kontraszt-ellenőrzés sötét módban
