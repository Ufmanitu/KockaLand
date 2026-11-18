/* ===== Mozi (v2): a Film kocka a Műfaj, Hossz és Korszak kockákhoz illeszkedik (?-szabályokkal); a Hangulat a műfajhoz. ===== */
SeedParts.mozi = T => {
  const lenTag = m => m < 105 ? 'rövid' : m <= 135 ? 'átlagos' : 'hosszú';
  const eraTag = y => y < 1980 ? 'klasszikus' : y < 2000 ? 'retro' : y < 2011 ? 'e2000' : 'új';
  const filmLines = FILMS.map(f => f[0] + ' (' + f[3] + ') ?' + f[1] + ' ?' + lenTag(f[2]) + ' ?' + eraTag(f[3])).join('\n');
  return T.theme('mozi', 'Mozi', '🎬', '#9b6bdb', 'Hangulat, műfaj, hossz, korszak és konkrét film: az estére való film kisorsolása.', [
    T.die('mozi-hol', 'Hogyan nézzük', '📺', `
A moziban, hátsó sorban #mozi !klasszikus !retro
Otthon, takaró alatt #otthon
Kertben vagy erkélyen, kivetítve #otthon #kint
Szabadtéri vetítésen #mozi #kint
Egy régi mozi különleges vetítésén ?klasszikus|retro #mozi
`),
    T.die('mozi-hangulat', 'Hangulat', '🎭', `
Nevetős, könnyed ?vígjáték|animáció|családi|musical|szuperhős #könnyed !sötét
Izgalmas, tépjük a körmünket ?thriller|krimi|akció|horror|sci-fi|kaland|szuperhős
Romantikus, jöhet a zsebkendő ?romantikus-film|musical|dráma #romantikus
Elgondolkodtató ?dráma|sci-fi|krimi|thriller|történelmi
Kalandos, utazunk a vásznon ?kaland|fantasy|sci-fi|akció|animáció|szuperhős
Egy kicsit ijesztő ?horror|thriller
Nosztalgikus, a régi kedvencek !új
Agykikapcsolós, bármi jöhet ?vígjáték|akció|animáció|szuperhős|kaland|családi #könnyed
`),
    T.die('mozi-mufaj', 'Műfaj', '🎞️', `
Vígjáték #vígjáték
Romantikus film #romantikus-film
Thriller #thriller
Krimi #krimi
Sci-fi #sci-fi
Fantasy #fantasy
Kaland #kaland
Animációs film #animáció
Horror #horror !könnyed !romantikus
Dráma #dráma
Akciófilm #akció
Musical #musical
Szuperhősfilm (Marvel, DC és a többiek) #szuperhős *1.5
Családi film #családi
Történelmi film #történelmi
`),
    T.die('mozi-hossz', 'Hossz', '⏱️', `
Rövidebb, 105 perc alatt #rövid
Átlagos, két óra körül #átlagos
Hosszú, igazi esti program #hosszú
`),
    T.die('mozi-korszak', 'Korszak', '📼', `
Klasszikus (70-es évek vagy régebbi) #klasszikus
Retro (80-as és 90-es évek) #retro *2
2000-es évek #e2000 *2.5
Az elmúlt 15 év (2011-től) #új *6
`),
    T.die('mozi-film', 'Film', '🍿', filmLines),
    T.die('mozi-nasi', 'Nasi', '🍫', `
Klasszikus popcorn
Nachos sajtmártással
Gyümölcstál és sajtkockák ?otthon
Házi pizza, amit a film közben sütünk ?otthon
Csokoládé és forró tea ?otthon
Gumicukor-válogatás, versengve, ki melyik színt kapja
Mozis menü a büfében ?mozi
Frissen sült palacsinta ?otthon
Semmi: csak a film számít
`)
  ]);
};
