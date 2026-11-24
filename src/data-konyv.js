/* ===== Könyv (v2): a műfaj/hangulat/hossz kockák a polcról szűrnek; a „Hogyan"/„Hol" kockák illeszkedő párokat adnak. ===== */
SeedParts.konyv = T => T.theme('konyv', 'Könyv', '📚', '#a67a32', 'A polcodról sorsol: műfaj, hangulat és hossz alapján választ könyvet.', [
  T.die('konyv-mufaj', 'Műfaj', '🏷️', Seed.BOOK_GENRES.map(g => g + ' #' + Engine.slug(g)).join('\n') + '\nBármi, lepj meg #barmi', { role: 'genre' }),
  T.die('konyv-hangulat', 'Hangulat', '🌗', `
Megnyugtató #megnyugtató !sötét
Izgalmas #izgalmas
Megható #megható
Vicces #vicces !sötét
Elgondolkodtató #elgondolkodtató
Sötét #sötét !megnyugtató !vicces
Kalandos #kalandos
`, { role: 'mood' }),
  T.die('konyv-hossz', 'Hossz', '📏', `
Rövid (250 oldal alatt) #rövid
Közepes (250–499 oldal) #közepes
Hosszú (500 oldal fölött) #hosszú
`, { role: 'length' }),
  T.die('konyv-konyv', 'A könyv', '📖', '', { kind: 'shelf' }),
  T.die('konyv-hogyan', 'Hogyan olvassuk', '🗣️', `
Mindketten magunkban, külön könyvet, aztán mesélünk
Ugyanazt a könyvet, nagyjából egy tempóban
Felolvasunk egymásnak, fejezetenként váltva !mozgás !vonat !kávézó
Hangoskönyvként, séta vagy főzés közben ?mozgás
Heti egy fejezet, utána beszélgetés
`),
  T.die('konyv-hol', 'Hol', '🪑', `
Ágyban, takaró alatt #ágy
Kedvenc kávézónkban #kávézó
Parkban, pokrócon #park
Hangulatos sarokban, gyertyafénynél #sarok
Vonaton vagy buszon, útközben #vonat
Kádban, habfürdővel #kád
Séta vagy főzés közben, fülhallgatóval #mozgás
`)
]);
