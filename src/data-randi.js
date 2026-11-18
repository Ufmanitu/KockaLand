/* ===== Randi téma (v2: minden Mit/Étel opciónak kötelező helyszín-whitelistje van → nincs értelmetlen párosítás) =====
   Helyszín-címkék (Hol): nappali, konyha, terasz, utca, természet, víz, kávézó, étterem, kilátó, mozi, múzeum, új
   Osztály-címkék (Hol): otthon, kint, város, bent. Napszak-címkék (Mikor): reggel, délelőtt, délután, naplemente, este, éjjel, egésznap */
SeedParts.randi = T => T.theme('randi', 'Randi', '💞', '#e04a5f', 'Randitervező: mikor, hol, mit csinálunk, és milyen hangulatban.', [
  T.die('randi-mikor', 'Mikor', '⏰', `
Reggeli randi, korán kelve #reggel #nappal
Hétvégi délelőtt #délelőtt #nappal
Délután #délután #nappal
Naplementekor #naplemente
Esti randi #este
Késő este, amikor már csendes a város #éjjel
Egy hosszú, lusta nap #egésznap #nappal
A világ vége előtt öt perccel ~ #este
`),
  T.die('randi-hol', 'Hol', '📍', `
Itthon, a nappaliban #otthon #bent #nappali
Itthon, a konyhában #otthon #bent #konyha
Az erkélyen vagy a teraszon #otthon #kint #terasz
Belvárosban, egy kedves utcában #város #kint #utca
A természetben, a város szélén #természet #kint !éjjel
Vízparton #víz #kint !éjjel
Kedvenc kávézónkban #kávézó #város #bent !éjjel
Egy új, még ismeretlen helyen #új #város !éjjel
Étteremben #étterem #város #bent #luxus !reggel
Egy dombtetőn, kilátással #kilátó #kint !éjjel
A moziban #mozi #város #bent !reggel
Múzeumban vagy kiállításon #múzeum #város #bent !este !éjjel
Egy felfújható csónakban a nappali közepén ~ #otthon #bent #nappali
Egy elhagyatott vidámparkban, éjszaka ~ #város #kint
`),
  T.die('randi-mit', 'Mit csinálunk', '🎯', `
Közösen főzünk valami újat ?konyha
Közös sütés, liszttel mindenhol ?konyha
Társasjáték vagy kártya ?nappali|terasz|kávézó #játék #nyugodt
Filmnézés takaró alatt ?nappali #film #nyugodt
Mozizás ?mozi #film #nyugodt
Séta, kézen fogva ?utca|természet|víz|új #nyugodt
Piknik ?természet|víz|kilátó #nyugodt !éjjel
Kirándulás ?természet|kilátó #aktív !este !éjjel
Csillagnézés ?terasz|természet|kilátó|víz ?este|éjjel #nyugodt
Kávé és hosszú beszélgetés ?kávézó|nappali|konyha|terasz|új #nyugodt
Hosszú vacsora, kedvenc kérdéseinkkel ?étterem #nyugodt
Múzeum vagy kiállítás ?múzeum #nyugodt
Minigolf, bowling vagy játékterem ?utca|új #aktív !reggel !éjjel
Egymás masszírozása ?nappali #nyugodt
Biciklizés ?utca|természet|víz #aktív !éjjel
Fotózás, amit később közösen megnézünk ?utca|természet|víz|kilátó|terasz #fotó !éjjel
Kvízest kettesben ?nappali|terasz|kávézó #játék
Tánc a nappaliban ?nappali #aktív
Közös rajzolás vagy festés ?nappali|terasz|kávézó #nyugodt
Strandolás, fürdés ?víz #aktív !éjjel
Szuperhős-jelmezben intézzük a bevásárlást ~ #aktív
Egész délutáni varázsló-párbaj, léggitárral ~ #játék
`),
  T.die('randi-hangulat', 'Hangulat', '✨', `
Nyugis, romantikus !aktív
Játékos, nevetős +játék
Kalandos, kicsit bátor !nyugodt +aktív
Spontán: semmit nem tervezünk előre
Kényeztető: mindent a másiknak !aktív
Nosztalgikus, mint az elején +film
Olcsó és cuki !luxus
Egy kis luxus ?luxus
Nagyon drámai, mintha filmben lennénk ~ #aktív
`),
  T.die('randi-etel', 'Étel és ital', '🍷', `
Pizza otthonra rendelve ?otthon !reggel
Ebéd vagy vacsora étteremben ?étterem !reggel !délelőtt #luxus
Street food a piacon vagy az utcán ?utca|új !reggel
Amit ma közösen főzünk ?konyha
Sajt, gyümölcs és egy üveg bor ?otthon|kint !reggel !délelőtt #luxus
Fagyi, csak mert lehet ?utca|természet|víz|kilátó|új|terasz !reggel
Csak kávé és süti ?kávézó|otthon !éjjel
Reggeli: palacsinta vagy rántotta ?otthon|kávézó ?reggel|délelőtt|egésznap !este !éjjel
Sushi vagy ázsiai wok, rendelve ?otthon !reggel
Tapas-szerű nasolás, mindenből egy kicsi ?otthon|étterem|kávézó !reggel
Piknikkosár: szendvicsek, gyümölcs, limonádé ?természet|víz|kilátó|terasz !éjjel
Popcorn és üdítő a büfében ?mozi
Sütemény a múzeum kávézójában ?múzeum
Desszert előre, főétel utána ~
`),
  T.die('randi-extra', 'Extra szabály', '🎁', `
Ő dönt mindenről, én csak megyek
Én döntök mindenről, ő csak jön
Mindketten hozunk egy kis meglepetést
Telefon nélkül: az egész randin ki van kapcsolva !fotó
Mindegyikünk feltesz egy kérdést, amit még sosem kérdezett
Újrajátsszuk az első randink egy pillanatát
Közben fotózunk egy közös emlékhez #fotó
Csak olyat mondunk, ami a másiknak jólesik
`)
]);
