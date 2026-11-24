/* ===== Kajasorsoló (v2). Fő fogás: konyha-whitelist + alkalom-tiltás; #kézben (utcai), #hordozható (piknik), #házi (csak otthon).
   Desszert: nemzeti desszert csak a megfelelő konyhához; Kihívás csak olyan módhoz, amihez értelme van. */
SeedParts.kaja = T => T.theme('kaja', 'Kajasorsoló', '🍝', '#b5632a', 'Mit együnk ma? Alkalom, konyha, fő fogás, ital és desszert.', [
  T.die('kaja-alkalom', 'Alkalom', '🕑', `
Reggeli #reggeli
Brunch #brunch
Ebéd #ebéd
Vacsora #vacsora
Késő esti nasi #nasi
`),
  T.die('kaja-hogyan', 'Hogyan', '🏠', `
Együtt főzünk #főzés
Egyikünk főz, a másik segédkezik #főzés
Rendelünk, nem főzünk #rendelés
Étterembe megyünk ?vacsora|ebéd|brunch #étterem !házi !nasi
Street food, séta közben ?kézben #utca !bor !házi
Elvisszük piknikre ?hordozható #piknik !forró
`),
  T.die('kaja-konyha', 'Konyha', '🌍', `
Magyaros #magyar
Olasz #olasz +bor
Mexikói #mexikói
Ázsiai (thai, vietnami, kínai) #ázsiai +tea
Japán #japán +tea
Indiai #indiai
Mediterrán, görög #mediterrán +bor
Amerikai, burgeres #amerikai
Közel-keleti #közel-keleti
Francia #francia +bor
Fúziós: amit a hűtőben találunk ~
`),
  T.die('kaja-fo', 'Fő fogás', '🍽️', `
Carbonara vagy bolognai ?olasz !reggeli !brunch
Lasagne ?olasz !reggeli !brunch !nasi
Pizza, szeletekben ?olasz|amerikai !reggeli !brunch #kézben #hordozható
Burger és hasábburgonya ?amerikai !reggeli #kézben #hordozható
BBQ-bordák vagy csirkeszárny ?amerikai !reggeli !brunch !nasi
Taco vagy burrito ?mexikói #kézben #hordozható
Quesadilla és guacamole ?mexikói #kézben #hordozható
Nachos sajtmártással ?mexikói|amerikai !reggeli
Sushi tekercs ?japán !reggeli #hordozható
Ramen ?japán|ázsiai !reggeli !brunch
Pad thai vagy vietnami tavaszi tekercs ?ázsiai #hordozható
Curry rizzsel és naan kenyérrel ?indiai|ázsiai !reggeli !brunch !nasi
Gulyásleves ?magyar !reggeli !brunch !nasi
Rántott hús, majonézes burgonyával ?magyar !reggeli !brunch !nasi #hordozható
Lángos tejföllel és sajttal ?magyar #kézben
Falafel tál ?közel-keleti|mediterrán !reggeli #hordozható
Gyros vagy shawarma ?közel-keleti|mediterrán !reggeli #kézben #hordozható
Görög saláta és grillezett sajt ?mediterrán #hordozható
Quiche vagy croque monsieur ?francia !nasi #hordozható
Japán reggeli: rizs, miso leves, grillezett hal ?japán ?reggeli|brunch
Huevos rancheros, tortillával ?mexikói ?reggeli|brunch
Frittata és friss pékáru ?olasz ?reggeli|brunch
Masala omlett és paratha ?indiai ?reggeli|brunch
Congee, azaz rizsleves ?ázsiai ?reggeli|brunch
Shakshuka, friss kenyérrel ?közel-keleti ?reggeli|brunch #hordozható
Rántotta, szalonna, pirítós ?magyar|amerikai|francia ?reggeli|brunch !vacsora
Avokádós pirítós, tojással ?amerikai|mediterrán|francia ?reggeli|brunch
Palacsinta, sósan vagy édesen ?magyar|francia|amerikai ?reggeli|brunch|nasi #kézben #hordozható
Egy nagy tál saláta, rengeteg feltéttel ?mediterrán|amerikai|olasz|francia|magyar !nasi !reggeli #hordozható
Sütőben sült zöldségek, sajttal ?főzés ?mediterrán|francia|magyar|olasz !reggeli !nasi #házi
Szendvics-bár: mindenki maga állítja össze ?főzés|piknik ?amerikai|francia|mediterrán|magyar #házi
Sajt- és felvágott-tál ?nasi|brunch|vacsora ?főzés|piknik ?magyar|francia|olasz|mediterrán|amerikai #házi #hordozható
`),
  T.die('kaja-ital', 'Ital', '🥤', `
Vörösbor #bor #alkohol !reggeli !brunch
Fehér- vagy rozébor #bor #alkohol !reggeli
Prosecco vagy pezsgő #alkohol !reggeli
Spritz vagy koktél #alkohol !reggeli
Sör #alkohol !reggeli !brunch
Házi limonádé
Kávé
Tea #tea
Frissen facsart gyümölcslé
Ásványvíz citrommal és jéggel
Forró csoki #forró
Valami zöld, amiről ne kérdezz ~
`),
  T.die('kaja-desszert', 'Desszert', '🍰', `
Palacsinta nutellával vagy lekvárral
Fagyi, kétféle ízben !reggeli
Sajttorta !reggeli
Almás pite, fagylalttal ?amerikai !reggeli
Brownie, vaníliafagyival ?amerikai !reggeli
Tiramisu ?olasz !reggeli
Cannoli ?olasz !reggeli
Churros csokiszósszal ?mexikói
Mochi ?japán !reggeli
Mangós, kókuszos ragacsos rizs ?ázsiai !reggeli
Gulab jamun ?indiai !reggeli
Baklava ?közel-keleti|mediterrán !reggeli
Somlói galuska ?magyar !reggeli
Kürtőskalács ?magyar
Crème brûlée ?francia !reggeli
Gyümölcs olvasztott csokiban
Nincs desszert: még egy kör a főételből
Fagylalt a hűtőből, két kanállal ?főzés|rendelés !reggeli
`),
  T.die('kaja-kihivas', 'Kihívás', '⚡', `
Szemfedővel kóstolunk, a másik találgat
Csak 30 percünk van ?főzés
Csak az, ami már itthon van ?főzés
Mindketten ugyanabból az alapanyagból főzünk, külön ételt ?főzés
Zenével főzünk, ami az első randinkon szólt ?főzés
Gyertyafényes asztal, akkor is, ha pizza ?főzés|rendelés
Pálcikával eszünk ?ázsiai|japán
Villa nélkül, csak kézzel ?kézben
Fejjel lefelé étkezés: desszerttel kezdünk ~
`)
]);
