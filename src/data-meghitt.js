/* ===== Meghitt idő (v2). Helyszín-címkék: hálószoba, nappali, fürdő, erkély, hotel; időtartam-címkék: fél-óra, este, reggel, nap. */
SeedParts.meghitt = T => T.theme('meghitt', 'Meghitt idő', '🕯️', '#c2335f', 'Romantikus, tapintatos esték kettesben. Írd át a saját ízlésed szerint.', [
  T.die('meg-hangulat', 'Hangulat', '🌹', `
Lassú és romantikus #lassú
Játékos és nevetős #játékos
Kényeztető: ma csak a másikra figyelünk #kényeztet
Titokzatos, kicsit rejtélyes #titok
Spontán, ahogy esik, úgy puffan #spontán
Csendes, szavak nélkül is értjük egymást #csend
`),
  T.die('meg-hely', 'Helyszín', '🛋️', `
A hálószobában, gyertyákkal #otthon #hálószoba
A nappaliban, takarók és párnák között #otthon #nappali
A fürdőszobában, habfürdővel #otthon #fürdő
Az erkélyen, takaróval, csillagok alatt #otthon #erkély
Egy hangulatos szállodai szobában #hotel
Egy párnavárban a szőnyegen #otthon #nappali
`),
  T.die('meg-nyitany', 'Nyitány', '🎶', `
Közös fürdés ?fürdő
Lassú tánc ?nappali|hálószoba|hotel
Hosszú masszázs ?hálószoba|nappali|hotel|fürdő !fél-óra
Gyertyafényes vacsora ?otthon|hotel ?este|nap !reggel
Felolvasás egymásnak, fekve ?hálószoba|nappali|hotel !csend
Csillagnézés ?erkély ?este|nap
Közös teázás és beszélgetés ?otthon|hotel !csend
Szemfedős kóstolójáték, amit a másik választ ?otthon|hotel !fürdő
`),
  T.die('meg-kellek', 'Kellék', '🕯️', `
Gyertyák mindenhol #gyertya !reggel
Lágy zene, közös lejátszási lista #zene
Illatos masszázsolaj #illat
Selyemkendő vagy puha takaró #puha
Eper és étcsokoládé #édes
Fényfüzér és párnák #fényfüzér !reggel !fürdő
Rózsaszirmok az ágyon ?hálószoba|hotel
`),
  T.die('meg-jatek', 'Játék és ötlet', '💌', `
Őszinte kívánságlista: mindketten mondunk hármat !csend
Csókverseny: ötféle csók, pontozva
Kérdezz-felelek, csak szerelmes kérdésekkel !csend
Kedvenc emlékünk egymásról, felváltva !csend
Szerepjáték: ma este először találkozunk ?este|nap !csend
Szerelmeslevelet írunk egymásnak, és felolvassuk !fél-óra !csend
Egymás arcát, kezét kényeztetjük, szó nélkül
Táncolunk, amíg a zene tart ?nappali|hálószoba|hotel
Megbeszéljük, mi esett jól mostanában, és mit szeretnénk még !csend
Gyertyafényes erődöt építünk a nappaliban ~
`),
  T.die('meg-ido', 'Mennyi idő', '⌛', `
Fél óra, gyors kikapcsolódás #fél-óra
Egész este #este
Hosszú, lusta reggel #reggel
Egy teljes nap kettesben #nap
`)
]);
