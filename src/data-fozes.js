/* ===== Otthoni főzés és sütés (v2, új): döntésben segít. Az „Étel" kocka a típushoz, alapanyaghoz, nehézséghez illeszkedő receptötletet ad. ===== */
SeedParts.fozes = T => {
  // [étel, típus(ok), fő alapanyag(ok), nehézség(ek)]
  const DISHES = [
    // leves
    ['Gulyásleves', 'leves', 'marha|burgonya', 'közepes|hosszú'], ['Húsleves cérnametélttel', 'leves', 'csirke|marha', 'hosszú'], ['Csirkeleves gyömbérrel és citrommal', 'leves', 'csirke', 'közepes'],
    ['Paradicsomleves, bazsalikommal', 'leves', 'zöldség', 'gyors|közepes'], ['Krémes sütőtök-leves kókusztejjel', 'leves', 'zöldség', 'közepes'], ['Gombaleves tejföllel', 'leves', 'gomba', 'közepes'],
    ['Lencseleves füstölt kolbásszal', 'leves', 'hüvelyes|sertés', 'közepes'], ['Bableves csülökkel', 'leves', 'hüvelyes|sertés', 'hosszú'], ['Halászlé', 'leves', 'hal', 'közepes|hosszú'],
    ['Burgonyaleves, ahogy nagymama főzte', 'leves', 'burgonya', 'közepes'], ['Minestrone', 'leves', 'zöldség|hüvelyes', 'közepes'], ['Tom kha gai, kókuszos csirkeleves', 'leves', 'csirke|gomba', 'közepes'],
    ['Miso leves zöldségekkel', 'leves', 'zöldség', 'gyors'], ['Francia hagymaleves sajtos pirítóssal', 'leves', 'sajt|zöldség', 'közepes'], ['Ramen otthon, jó tojással', 'leves', 'tojás|csirke|sertés', 'hosszú'],
    ['Csicseriborsó-leves chilivel', 'leves', 'hüvelyes', 'közepes'],
    // főétel: csirke, sertés, marha
    ['Rántott csirkemell burgonyapürével', 'főétel', 'csirke|burgonya', 'közepes'], ['Paprikás csirke nokedlivel', 'főétel', 'csirke', 'közepes|hosszú'], ['Sült csirkecomb fokhagymás zöldségekkel', 'főétel', 'csirke|zöldség', 'közepes|hosszú'],
    ['Csirke curry rizzsel', 'főétel', 'csirke', 'közepes'], ['Csirkés wrap, sok zöldséggel', 'főétel', 'csirke|zöldség', 'gyors'], ['Teriyaki csirke rizzsel', 'főétel', 'csirke', 'gyors|közepes'],
    ['Rántott szelet, majonézes burgonyával', 'főétel', 'sertés|burgonya', 'közepes'], ['Töltött paprika', 'főétel', 'sertés|zöldség', 'hosszú'], ['Sült oldalas, sült burgonyával', 'főétel', 'sertés|burgonya', 'hosszú'],
    ['Sertéspörkölt galuskával', 'főétel', 'sertés', 'hosszú'], ['Rakott krumpli', 'főétel', 'burgonya|tojás|sertés', 'hosszú'], ['Kolbászos-paprikás krumpli', 'főétel', 'burgonya|sertés', 'közepes'],
    ['Marhapörkölt', 'főétel', 'marha', 'hosszú'], ['Steak sült zöldségekkel', 'főétel', 'marha|zöldség', 'gyors|közepes'], ['Házi hamburger, saját buciban', 'főétel', 'marha|liszt', 'hosszú'],
    ['Chili con carne', 'főétel', 'marha|hüvelyes', 'hosszú'], ['Fasírt, főzelékkel', 'főétel', 'marha|sertés|zöldség', 'közepes'],
    // főétel: hal, sajt, zöldség, hüvelyes, gomba, burgonya
    ['Sült lazac citromos vajjal', 'főétel', 'hal', 'gyors'], ['Rántott halfilé, tartármártással', 'főétel', 'hal', 'közepes'], ['Halfilé sült zöldségágyon', 'főétel', 'hal|zöldség', 'közepes'],
    ['Rántott sajt hasábburgonyával', 'főétel', 'sajt|burgonya', 'közepes'], ['Grillezett sajt és zöldségek', 'főétel', 'sajt|zöldség', 'gyors'], ['Ratatouille', 'főétel', 'zöldség', 'hosszú'],
    ['Töltött cukkini', 'főétel', 'zöldség', 'közepes'], ['Zöldségcurry rizzsel', 'főétel', 'zöldség|hüvelyes', 'közepes'], ['Tökfőzelék, tükörtojással', 'főétel', 'zöldség|tojás', 'gyors|közepes'],
    ['Falafel és hummusz', 'főétel', 'hüvelyes', 'közepes'], ['Chili sin carne', 'főétel', 'hüvelyes|zöldség', 'hosszú'], ['Lencsefőzelék', 'főétel', 'hüvelyes', 'közepes'], ['Babfasírt, sült zöldségekkel', 'főétel', 'hüvelyes|zöldség', 'közepes'],
    ['Gombapörkölt galuskával', 'főétel', 'gomba', 'közepes'], ['Rántott gombafejek', 'főétel', 'gomba', 'gyors|közepes'], ['Töltött gomba sajttal', 'főétel', 'gomba|sajt', 'közepes'],
    ['Tepsis burgonya rozmaringgal', 'főétel', 'burgonya', 'közepes'], ['Burgonyagnocchi vajas zsályával', 'főétel', 'burgonya', 'hosszú'], ['Házi pizza', 'főétel|pékáru', 'liszt|sajt|zöldség', 'hosszú'],
    // tészta
    ['Carbonara', 'tészta', 'tojás|sertés', 'gyors'], ['Bolognai spagetti', 'tészta', 'marha|sertés', 'közepes|hosszú'], ['Aglio e olio', 'tészta', 'zöldség', 'gyors'], ['Pesto tészta', 'tészta', 'zöldség|sajt', 'gyors'],
    ['Lasagne', 'tészta', 'marha|sajt', 'hosszú'], ['Tonhalas tészta', 'tészta', 'hal', 'gyors'], ['Gombás-tejszínes tészta', 'tészta', 'gomba', 'gyors|közepes'], ['Túrós csusza', 'tészta', 'túró|sertés', 'közepes'],
    ['Sonkás kocka', 'tészta', 'sertés|sajt', 'közepes'], ['Mac & cheese', 'tészta', 'sajt', 'gyors|közepes'], ['Csirkés-brokkolis penne', 'tészta', 'csirke|zöldség', 'gyors'], ['Pad thai', 'tészta', 'csirke|tojás', 'közepes'],
    ['Házi tészta, tojással gyúrva', 'tészta', 'tojás|liszt', 'hosszú'], ['Töltött tészta ricottával', 'tészta', 'sajt|túró', 'hosszú'],
    // saláta
    ['Görög saláta', 'saláta', 'zöldség|sajt', 'gyors'], ['Cézár saláta csirkével', 'saláta', 'csirke', 'gyors'], ['Tonhalsaláta tojással', 'saláta', 'hal|tojás', 'gyors'], ['Lencsesaláta', 'saláta', 'hüvelyes', 'gyors'],
    ['Gombás-parmezános saláta', 'saláta', 'gomba|sajt', 'gyors'], ['Meleg burgonyasaláta', 'saláta', 'burgonya', 'közepes'], ['Caprese saláta', 'saláta', 'sajt|zöldség', 'gyors'], ['Gyümölcssaláta, mentával', 'saláta', 'gyümölcs', 'gyors'],
    ['Csicseriborsós saláta', 'saláta', 'hüvelyes|zöldség', 'gyors'],
    // sütemény
    ['Csokis brownie', 'sütemény', 'csokoládé', 'közepes'], ['Csokoládés lávatorta', 'sütemény', 'csokoládé', 'gyors|közepes'], ['Almás pite', 'sütemény', 'gyümölcs|liszt', 'hosszú'], ['Túrós pite', 'sütemény', 'túró|liszt', 'hosszú'],
    ['Sajttorta', 'sütemény', 'túró|sajt', 'hosszú'], ['Meggyes pite', 'sütemény', 'gyümölcs|liszt', 'hosszú'], ['Banánkenyér', 'sütemény', 'gyümölcs|liszt', 'közepes'], ['Palacsinta, nutellával', 'sütemény|reggeli-étel', 'csokoládé|tojás', 'gyors'],
    ['Palacsinta gyümölccsel', 'sütemény|reggeli-étel', 'gyümölcs|tojás', 'gyors'], ['Tiramisu', 'sütemény', 'sajt|csokoládé', 'közepes'], ['Csokis keksz', 'sütemény', 'csokoládé|liszt', 'gyors|közepes'], ['Epres piskóta', 'sütemény', 'gyümölcs|tojás', 'közepes'],
    ['Rákóczi túrós', 'sütemény', 'túró|tojás', 'hosszú'], ['Bögrés süti, csokival', 'sütemény', 'csokoládé', 'gyors'], ['Citromos kevert sütemény', 'sütemény', 'gyümölcs|liszt', 'közepes'], ['Körtés-csokis pite', 'sütemény', 'gyümölcs|csokoládé', 'hosszú'],
    ['Túrógombóc, vaníliaöntettel', 'sütemény', 'túró', 'közepes'], ['Mézeskalács, díszítéssel', 'sütemény', 'liszt', 'hosszú'], ['Muffin, bármilyen gyümölccsel', 'sütemény', 'gyümölcs|liszt', 'gyors|közepes'],
    // pékáru
    ['Házi kenyér', 'pékáru', 'liszt', 'hosszú'], ['Sajtos pogácsa', 'pékáru', 'liszt|sajt', 'közepes|hosszú'], ['Focaccia rozmaringgal', 'pékáru', 'liszt|zöldség', 'hosszú'], ['Kifli, házilag', 'pékáru', 'liszt', 'hosszú'],
    ['Sajtos rúd', 'pékáru', 'sajt|liszt', 'gyors|közepes'], ['Lángos', 'pékáru', 'liszt|burgonya', 'közepes'], ['Pita kenyér serpenyőben', 'pékáru', 'liszt', 'gyors'], ['Fahéjas csiga', 'pékáru|sütemény', 'liszt', 'hosszú'],
    ['Túrós batyu', 'pékáru|sütemény', 'túró|liszt', 'hosszú'],
    // reggeli
    ['Rántotta, pirítóssal', 'reggeli-étel', 'tojás', 'gyors'], ['Omlett gombával és sajttal', 'reggeli-étel', 'tojás|gomba|sajt', 'gyors'], ['Tükörtojás avokádós pirítóson', 'reggeli-étel', 'tojás|zöldség', 'gyors'],
    ['Zabkása gyümölccsel', 'reggeli-étel', 'gyümölcs', 'gyors'], ['Shakshuka', 'reggeli-étel', 'tojás|zöldség', 'közepes'], ['Francia pirítós', 'reggeli-étel', 'tojás', 'gyors'], ['Tojás Benedict', 'reggeli-étel', 'tojás', 'közepes'],
    ['Gofri, friss gyümölcsökkel', 'reggeli-étel|sütemény', 'gyümölcs|tojás', 'közepes'], ['Joghurtos-gyümölcsös reggeli tál', 'reggeli-étel', 'gyümölcs', 'gyors'], ['Sajtos-sonkás melegszendvics', 'reggeli-étel', 'sajt|sertés', 'gyors']
  ];
  const dishLines = DISHES.map(d => d[0] + ' ?' + d[1] + ' ?' + d[2] + ' ?' + d[3]).join('\n');
  return T.theme('fozes', 'Otthoni főzés és sütés', '🍳', '#d9622b', 'Nem tudjátok, mit főzzetek vagy süssetek? A kockák döntenek: alkalom, típus, alapanyag, nehézség, és a konkrét étel.', [
    T.die('foz-alkalom', 'Alkalom', '📅', `
Hétköznap esti vacsora ?leves|főétel|tészta|saláta #hétköznap !hosszú
Hétvégi ebéd ?leves|főétel|tészta|saláta|pékáru #hétvége
Hétvégi reggeli vagy brunch ?reggeli-étel|pékáru #reggeli
Vendégek jönnek ?leves|főétel|tészta|saláta|sütemény|pékáru #vendég
Romantikus vacsora kettesben ?főétel|tészta|leves|saláta|sütemény #romantikus
Délutáni uzsonna, süteményes délután ?sütemény|pékáru|saláta #uzsonna
`),
    T.die('foz-tipus', 'Mit készítünk', '🥘', `
Leves #leves
Főétel #főétel
Tésztaétel #tészta
Saláta #saláta
Sütemény vagy desszert #sütemény
Kenyér és pékáru #pékáru
Reggeli étel #reggeli-étel
`),
    T.die('foz-alapanyag', 'Fő alapanyag', '🧅', `
Csirke ?leves|főétel|tészta|saláta #csirke
Sertés ?leves|főétel|tészta #sertés
Marha ?leves|főétel|tészta #marha
Hal ?leves|főétel|tészta|saláta #hal
Tojás ?leves|főétel|tészta|saláta|reggeli-étel|sütemény #tojás
Sajt ?leves|főétel|tészta|saláta|pékáru|sütemény|reggeli-étel #sajt
Zöldségek ?leves|főétel|tészta|saláta|reggeli-étel|pékáru #zöldség
Hüvelyesek (bab, lencse, csicseriborsó) ?leves|főétel|saláta #hüvelyes
Gomba ?leves|főétel|tészta|saláta #gomba
Burgonya ?leves|főétel|saláta|pékáru #burgonya
Gyümölcs ?sütemény|reggeli-étel|saláta #gyümölcs
Csokoládé ?sütemény|reggeli-étel #csokoládé
Túró ?sütemény|tészta|reggeli-étel|pékáru #túró
Liszt és élesztő ?pékáru|sütemény|főétel|tészta|reggeli-étel #liszt
`),
    T.die('foz-nehezseg', 'Mennyi időnk van', '⏱️', `
Gyors: fél óra alatt kész #gyors
Közepes: egy óra körül #közepes
Hosszabb projekt: két óra vagy több #hosszú
`),
    T.die('foz-etel', 'Az étel', '🍽️', dishLines),
    T.die('foz-ki', 'Ki csinálja', '👩‍🍳', `
Együtt főzünk, közös tempóban
Én főzök, ő segédkezik és a zenéért felel
Ő főz, én segédkezem és terítek
Versenyfőzés: ugyanabból, mindenki a saját módján ?főétel|tészta|saláta|sütemény|leves
Meglepetés: titokban készítem el ?romantikus|vendég|hétvége
Egyikünk főz, a másikunk a desszertet süti ?főétel|tészta
`),
    T.die('foz-szabaly', 'Kihívás', '⚡', `
Csak öt hozzávalóból dolgozunk ?gyors|közepes
Egy lábasban, egy tepsiben ?gyors|közepes
Zenével főzünk, közben táncolunk
Szemfedővel ízlelünk, a másik találgat
Minden ételhez egy új fűszert használunk
Gyertyafényes terítés, még ha hétköznap is ?hétköznap|hétvége|vendég|romantikus
Szépen tálalunk, mintha étteremben lennénk ?főétel|leves|tészta|saláta|sütemény
Nincs kihívás: élvezzük a főzést
`)
  ]);
};
