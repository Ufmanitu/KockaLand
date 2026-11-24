/* ===== Kézműves (v2). Technika-címkék: akvarell, akril, gyurma, origami, horgolás, kötés, makramé, hímzés, gyertya, szappan, gyöngy, kollázs, nyomat,
   textilfesték, fafaragás, mozaik, gipsz, papírmasé, üvegfestés. Minden tárgy csak az észszerű technikákhoz kapcsolódik. */
SeedParts.kezmuves = T => T.theme('kezmuves', 'Kézműves', '🎨', '#3a8060', 'Ötletadó alkotáshoz: technika, tárgy, kinek, stílus, idő és közös szabály.', [
  T.die('kez-technika', 'Technika', '🧵', `
Akvarellfestés #akvarell
Akrilfestés vászonra #akril
Levegőn száradó gyurma #gyurma
Origami, papírhajtogatás #origami #gyors !napos
Horgolás #horgolás #lassú
Kötés #kötés #lassú
Makramé, csomózás #makramé #lassú
Hímzés #hímzés #lassú
Gyertyaöntés #gyertya
Szappanöntés #szappan
Gyöngyfűzés #gyöngy
Kollázs és scrapbook #kollázs #gyors !napos
Pecsétnyomás vagy linómetszet #nyomat #gyors !napos
Textilfestés (vászontáska, póló) #textilfesték
Fafaragás vagy pirográfia #fafaragás #lassú
Mozaik #mozaik #lassú
Gipszöntés és festés #gipsz
Papírmasé #papírmasé
Üvegfestés #üvegfestés
`),
  T.die('kez-targy', 'Mit készítünk', '🎁', `
Képeslap ?akvarell|akril|origami|kollázs|nyomat|hímzés ?ajándék|csak-úgy
Könyvjelző ?origami|kollázs|nyomat|akvarell|makramé|hímzés|horgolás|gyöngy
Kulcstartó ?makramé|gyöngy|gyurma|fafaragás|horgolás
Karkötő vagy nyaklánc ?gyöngy|makramé|gyurma
Gyertya ?gyertya
Szappan ?szappan
Falikép vagy fali dísz ?akvarell|akril|makramé|mozaik|gipsz|kollázs|hímzés|fafaragás|üvegfestés
Poháralátét ?mozaik|makramé|horgolás|fafaragás|gyurma
Vászontáska vagy póló ?textilfesték|hímzés|nyomat
Ajándékdoboz-díszítés ?origami|kollázs|nyomat|papírmasé ?ajándék
Cserépdísz vagy kis szobor ?gyurma|gipsz|papírmasé|akril
Plüssfigura vagy sál ?horgolás|kötés ?délután|napos
Ünnepi dísz (húsvét, karácsony) ?origami|gyurma|horgolás|hímzés|papírmasé|üvegfestés ?karácsony|otthonunk
Fotókeret ?fafaragás|mozaik|kollázs|papírmasé
Naptár vagy tervező ?akvarell|akril|kollázs|nyomat
Hűtőmágnes ?gyurma|gipsz|mozaik|gyöngy
Mécsestartó ?üvegfestés|mozaik|gipsz|gyurma
Valami, aminek nincs funkciója, de gyönyörű ~
Működő időgép, kartonból ~
`),
  T.die('kez-kinek', 'Kinek, mikor', '🎀', `
Ajándék neki #ajándék
Ajándék egy barátnak vagy családtagnak #ajándék
Az otthonunkba, közös emléknek #otthonunk
Évfordulóra #ajándék #évforduló
Szülinapra #ajándék #szülinap
Karácsonyra #ajándék #karácsony
Csak úgy, hangulatból #csak-úgy
`),
  T.die('kez-stilus', 'Stílus', '🌈', `
Minimalista
Színes és vidám
Vintage
Természetes (ágak, levelek, kavicsok) ?fafaragás|mozaik|kollázs|nyomat|makramé|gyertya|szappan|akvarell|gyurma
Vicces
Romantikus
Pasztell
Sötét és hangulatos
`),
  T.die('kez-ido', 'Idő', '⏱️', `
Fél óra, gyors alkotás ?gyors #fél-óra
Egy-két óra #két-óra
Egy egész délután #délután
Több napos projekt ?lassú #napos
`),
  T.die('kez-szabaly', 'Közös szabály', '🤝', `
Mindketten ugyanazt készítjük, aztán összehasonlítjuk
Egymásnak készítünk valamit, titokban ?ajándék|csak-úgy
Egyikünk tervez, a másik kivitelez
Csendben, zenével alkotunk
Versenyben, időkorláttal !napos
Fele-fele: mindkettőnktől egy rész az alkotásból
Amit elrontunk, az ma a stílus része
`)
]);
