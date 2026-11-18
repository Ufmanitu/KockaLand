/* ===== Utazás (v2). Úticél-címkék: távolság (közel/közepes/messze), jelleg (város, tenger, víz, hegy, falu, bor, természet, hajózható, kempingezhető),
   éghajlat (meleg, hideg). A Hossz-ra, Közlekedésre, Szállásra, Programra szigorú „kell" szabályok vonatkoznak. */
SeedParts.utazas = T => T.theme('utazas', 'Utazás', '✈️', '#2c9bb8', 'Úti cél, hossz, közlekedés, szállás és program: egyben vagy egyenként.', [
  T.die('utazas-hossz', 'Hossz', '⏳', `
Egy nap #egy-nap
Hétvége (2–3 nap) #hétvége
Hosszú hétvége (4 nap) #hosszú-hétvége
Egy hét #hét
Két hét #két-hét
`),
  T.die('utazas-hely', 'Úticél', '🗺️', `
A Balaton egy szép partszakasza #közel #vasút #víz #hazai #természet #hajózható #kempingezhető +nyár
Visegrád és a Dunakanyar #közel #vasút #természet #hazai #hajózható
Eger: bor és barokk utcák #közel #vasút #város #bor #hazai
Budapest, mintha turisták lennénk #közel #vasút #város #hazai
Tokaj és a pincesorok #közel #vasút #bor #természet #hazai
Egy kis falu a Bükkben #közel #vasút #falu #hegy #természet #hazai #kempingezhető
Bécs #közel #vasút #város #nemzetközi
Prága ?hétvége|hosszú-hétvége|hét|két-hét #közepes #vasút #város #nemzetközi
Velence ?hétvége|hosszú-hétvége|hét|két-hét #közepes #vasút #város #víz #hajózható #nemzetközi
Róma ?hosszú-hétvége|hét|két-hét #közepes #város #nemzetközi #meleg
Az osztrák Alpok ?hétvége|hosszú-hétvége|hét|két-hét #közepes #vasút #hegy #természet #falu #nemzetközi #kempingezhető
A horvát tengerpart ?hétvége|hosszú-hétvége|hét|két-hét #közepes #tenger #víz #nemzetközi #meleg #hajózható #kempingezhető !tél
Lisszabon és a környező part ?hosszú-hétvége|hét|két-hét #messze #város #tenger #nemzetközi #meleg
Barcelona ?hosszú-hétvége|hét|két-hét #messze #város #tenger #nemzetközi #meleg
A görög szigetek ?hét|két-hét #messze #tenger #víz #meleg #nemzetközi #hajózható !tél
Izland ?hét|két-hét #messze #természet #hideg #hegy #nemzetközi
A skót felföld ?hét|két-hét #messze #természet #hideg #hegy #nemzetközi #kempingezhető
Japán ?két-hét #messze #város #természet #nemzetközi
New York ?hét|két-hét #messze #város #nemzetközi
A Hold, egy hétre, űrrepülővel ~ #messze
Atlantisz elsüllyedt városa, búvárruhában ~ #messze #víz #tenger
`),
  T.die('utazas-mod', 'Közlekedés', '🚆', `
Autóval !messze
Vonattal ?vasút
Repülővel ?közepes|messze !hazai !közel
Busszal ?közel|közepes
Biciklivel ?közel !egy-nap
Hajóval vagy kompon ?hajózható
Lakóautóval ?kempingezhető #lakóautó !messze !egy-nap
Hőlégballonnal, szélirányban ~
Teleportálással, ha kell, kétszer ~
`),
  T.die('utazas-szallas', 'Szállás', '🏨', `
Hotel wellness-szel #luxus #wellness !egy-nap !lakóautó
Apartman a belvárosban ?város !egy-nap !lakóautó
Sátorozás ?kempingezhető|természet !tél !luxus !egy-nap !lakóautó
Kisház az erdő szélén ?természet|hegy !egy-nap !lakóautó
Panzió egy kis faluban ?falu|hegy !egy-nap !lakóautó
Bungaló a víz mellett ?víz|tenger !egy-nap !lakóautó
Kemping, saját főzéssel ?kempingezhető #olcsó !luxus !tél !egy-nap
Hajón alszunk ?hajózható !egy-nap !lakóautó
Nem alszunk ott: egy nap alatt hazaérünk ?egy-nap #hazaút
Egy kölcsönkapott kastély ~ #luxus
Faház egy fa tetején ~ #természet
`),
  T.die('utazas-program', 'Program', '🎒', `
Városnézés térkép nélkül ?város
Fürdőzés és napozás ?víz|tenger ?nyár !hideg
Túrázás, amíg bírjuk ?hegy|természet
Gasztrotúra: helyi ételek, mindenből egy kicsi ?város|falu
Borkóstoló ?bor
Múzeumok és kiállítások ?város
Pihenés, semmittevés, olvasás
Wellness és masszázs ?wellness
Snorkeling vagy búvárkodás ?tenger ?meleg ?nyár
Síelés vagy szánkózás ?hegy ?tél !nyár !meleg
Hajókirándulás ?hajózható !tél
Naplemente-vadászat: minden este máshol nézzük ?tenger|hegy|víz|természet !egy-nap
Kincskeresés térkép alapján ~
Csak hátrafelé sétálunk ~
`),
  T.die('utazas-evszak', 'Évszak', '🍂', `
Tavasz #tavasz
Nyár #nyár +tenger +víz
Ősz #ősz +bor +hegy
Tél #tél +hegy +hideg
`)
]);
