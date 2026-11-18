/* ===== Filmtár: [cím, műfajok (|), perc, év] — a Mozi témához. Az elmúlt ~15 év (2011–) van túlsúlyban. =====
   Műfaj-kódok: romantikus-film, vígjáték, dráma, musical, sci-fi, akció, kaland, fantasy, horror, thriller, krimi, animáció, családi, szuperhős, történelmi */
const FILMS = [];

/* --- Marvel --- */
FILMS.push(
  ['Vasember', 'szuperhős|akció|sci-fi', 126, 2008], ['Thor', 'szuperhős|fantasy|akció', 115, 2011], ['Amerika Kapitány: Az első bosszúálló', 'szuperhős|akció|kaland', 124, 2011],
  ['A Bosszúállók', 'szuperhős|akció|sci-fi', 143, 2012], ['Vasember 3.', 'szuperhős|akció', 130, 2013], ['Thor: Sötét világ', 'szuperhős|fantasy|akció', 112, 2013],
  ['Amerika Kapitány: A tél katonája', 'szuperhős|akció|thriller', 136, 2014], ['A galaxis őrzői', 'szuperhős|sci-fi|vígjáték|kaland', 121, 2014],
  ['Bosszúállók: Ultron kora', 'szuperhős|akció|sci-fi', 141, 2015], ['Ant-Man', 'szuperhős|vígjáték|akció', 117, 2015], ['Deadpool', 'szuperhős|vígjáték|akció', 108, 2016],
  ['Amerika Kapitány: Polgárháború', 'szuperhős|akció', 147, 2016], ['Doctor Strange', 'szuperhős|fantasy|akció', 115, 2016], ['Logan – Farkas', 'szuperhős|dráma|akció', 137, 2017],
  ['A galaxis őrzői 2.', 'szuperhős|sci-fi|vígjáték|kaland', 136, 2017], ['Pókember: Hazatérés', 'szuperhős|akció|vígjáték', 133, 2017], ['Thor: Ragnarök', 'szuperhős|vígjáték|fantasy|akció', 130, 2017],
  ['Fekete Párduc', 'szuperhős|akció|kaland', 134, 2018], ['Bosszúállók: Végtelen háború', 'szuperhős|akció|sci-fi', 149, 2018], ['Ant-Man és a Darázs', 'szuperhős|vígjáték|akció', 118, 2018],
  ['Marvel Kapitány', 'szuperhős|sci-fi|akció', 123, 2019], ['Bosszúállók: Végjáték', 'szuperhős|akció|sci-fi|dráma', 181, 2019], ['Pókember: Idegenben', 'szuperhős|akció|vígjáték', 129, 2019],
  ['Fekete Özvegy', 'szuperhős|akció|thriller', 134, 2021], ['Shang-Chi és a Tíz Gyűrű legendája', 'szuperhős|akció|fantasy', 132, 2021], ['Pókember: Nincs hazaút', 'szuperhős|akció|kaland', 148, 2021],
  ['Doctor Strange az őrület multiverzumában', 'szuperhős|fantasy|horror', 126, 2022], ['Thor: Szerelem és mennydörgés', 'szuperhős|vígjáték|fantasy', 119, 2022],
  ['Fekete Párduc: Wakanda örökké', 'szuperhős|dráma|akció', 161, 2022], ['A galaxis őrzői 3.', 'szuperhős|sci-fi|vígjáték|dráma', 150, 2023], ['Deadpool & Rozsomák', 'szuperhős|vígjáték|akció', 128, 2024],
  ['Thunderbolts*', 'szuperhős|akció|dráma', 127, 2025], ['A Fantasztikus Négyes: Az első lépések', 'szuperhős|sci-fi|családi', 115, 2025]
);
/* --- DC és más szuperhősök --- */
FILMS.push(
  ['A sötét lovag', 'szuperhős|krimi|thriller|akció', 152, 2008], ['A sötét lovag: Felemelkedés', 'szuperhős|akció|thriller', 164, 2012], ['Acélember', 'szuperhős|sci-fi|akció', 143, 2013],
  ['Batman Superman ellen: Az igazság hajnala', 'szuperhős|akció', 151, 2016], ['Wonder Woman', 'szuperhős|akció|kaland', 141, 2017], ['Igazság Ligája', 'szuperhős|akció', 120, 2017],
  ['Aquaman', 'szuperhős|kaland|fantasy|akció', 143, 2018], ['Joker', 'dráma|thriller|krimi', 122, 2019], ['Shazam!', 'szuperhős|vígjáték|családi|fantasy', 132, 2019],
  ['Ragadozó madarak', 'szuperhős|akció|vígjáték', 109, 2020], ['Az öngyilkos osztag', 'szuperhős|akció|vígjáték', 132, 2021], ['Batman', 'szuperhős|krimi|thriller|dráma', 176, 2022],
  ['Flash', 'szuperhős|sci-fi|akció', 144, 2023], ['Superman', 'szuperhős|akció|kaland', 129, 2025], ['Batman: Kezdődik!', 'szuperhős|akció|krimi', 140, 2005],
  ['Kick-Ass – Teljes gőzzel', 'szuperhős|vígjáték|akció', 117, 2010], ['Hancock', 'szuperhős|vígjáték|akció', 92, 2008], ['Hellboy', 'szuperhős|fantasy|akció', 122, 2004],
  ['Pókember', 'szuperhős|akció|kaland', 121, 2002], ['Pókember 2.', 'szuperhős|akció|romantikus-film', 127, 2004], ['X-Men: Az első osztály', 'szuperhős|sci-fi|akció', 132, 2011],
  ['X-Men: Az eljövendő múlt napjai', 'szuperhős|sci-fi|akció', 132, 2014], ['A hihetetlen család', 'szuperhős|animáció|családi|vígjáték', 115, 2004], ['A hihetetlen család 2.', 'szuperhős|animáció|családi', 118, 2018]
);
/* --- Gyűrűk Ura, Hobbit, Harry Potter, fantasy --- */
FILMS.push(
  ['A Gyűrűk Ura: A gyűrű szövetsége', 'fantasy|kaland', 178, 2001], ['A Gyűrűk Ura: A két torony', 'fantasy|kaland|akció', 179, 2002], ['A Gyűrűk Ura: A király visszatér', 'fantasy|kaland|akció', 201, 2003],
  ['A hobbit: Váratlan utazás', 'fantasy|kaland', 169, 2012], ['A hobbit: Smaug pusztasága', 'fantasy|kaland|akció', 161, 2013], ['A hobbit: Az öt sereg csatája', 'fantasy|kaland|akció', 144, 2014],
  ['Harry Potter és a bölcsek köve', 'fantasy|kaland|családi', 152, 2001], ['Harry Potter és a Titkok Kamrája', 'fantasy|kaland|családi', 161, 2002], ['Harry Potter és az azkabani fogoly', 'fantasy|kaland|családi', 142, 2004],
  ['Harry Potter és a Tűz Serlege', 'fantasy|kaland|thriller', 157, 2005], ['Harry Potter és a Főnix Rendje', 'fantasy|kaland|akció', 138, 2007], ['Harry Potter és a Félvér Herceg', 'fantasy|kaland|romantikus-film', 153, 2009],
  ['Harry Potter és a Halál ereklyéi, 1. rész', 'fantasy|kaland|akció', 146, 2010], ['Harry Potter és a Halál ereklyéi, 2. rész', 'fantasy|kaland|akció', 130, 2011],
  ['Legendás állatok és megfigyelésük', 'fantasy|kaland|családi', 133, 2016], ['Legendás állatok: Grindelwald bűntettei', 'fantasy|kaland', 134, 2018],
  ['Narnia krónikái: Az oroszlán, a boszorkány és a ruhásszekrény', 'fantasy|kaland|családi', 143, 2005], ['A Karib-tenger kalózai: A Fekete Gyöngy átka', 'kaland|fantasy|akció|vígjáték', 143, 2003],
  ['A Karib-tenger kalózai: Holtak kincse', 'kaland|fantasy|vígjáték', 151, 2006], ['Alice Csodaországban', 'fantasy|kaland|családi', 108, 2010], ['Éhezők viadala', 'sci-fi|akció|dráma', 142, 2012],
  ['Éhezők viadala: Futótűz', 'sci-fi|akció|dráma', 146, 2013], ['A szépség és a szörnyeteg', 'fantasy|romantikus-film|musical|családi', 129, 2017],
  ['Aladdin', 'fantasy|kaland|musical|családi', 128, 2019], ['A dzsungel könyve', 'kaland|családi|fantasy', 106, 2016], ['Maleficent – Demóna', 'fantasy|kaland|családi', 97, 2014],
  ['Hamupipőke', 'fantasy|romantikus-film|családi', 105, 2015], ['Híd Terabithia földjére', 'fantasy|dráma|családi', 96, 2007], ['Narnia krónikái: Caspian herceg', 'fantasy|kaland|családi', 150, 2008],
  ['Csillagpor', 'fantasy|romantikus-film|kaland', 127, 2007], ['A Hercegnő menyasszony', 'fantasy|romantikus-film|vígjáték|kaland', 98, 1987], ['Willow', 'fantasy|kaland', 126, 1988],
  ['Pán', 'fantasy|kaland|családi', 111, 2015], ['Dungeons & Dragons: Tolvajok becsülete', 'fantasy|kaland|vígjáték', 134, 2023], ['Wicked', 'musical|fantasy|romantikus-film', 160, 2024]
);
/* --- Star Wars --- */
FILMS.push(
  ['Csillagok háborúja: Egy új remény', 'sci-fi|kaland|akció', 121, 1977], ['Csillagok háborúja: A Birodalom visszavág', 'sci-fi|kaland|akció', 124, 1980], ['Csillagok háborúja: A Jedi visszatér', 'sci-fi|kaland|akció', 131, 1983],
  ['Csillagok háborúja: Baljós árnyak', 'sci-fi|kaland|akció', 136, 1999], ['Csillagok háborúja: A klónok támadása', 'sci-fi|kaland|akció', 142, 2002], ['Csillagok háborúja: A Sithek bosszúja', 'sci-fi|kaland|akció', 140, 2005],
  ['Star Wars: Az ébredő Erő', 'sci-fi|kaland|akció', 138, 2015], ['Zsivány Egyes', 'sci-fi|akció|kaland', 133, 2016], ['Star Wars: Az utolsó Jedik', 'sci-fi|kaland|akció', 152, 2017],
  ['Han Solo: Egy Star Wars-történet', 'sci-fi|kaland|akció', 135, 2018], ['Star Wars: Skywalker kora', 'sci-fi|kaland|akció', 142, 2019]
);
/* --- Animáció és mesék --- */
FILMS.push(
  ['Toy Story – Játékháború', 'animáció|családi|kaland|vígjáték', 81, 1995], ['Toy Story 2.', 'animáció|családi|kaland', 92, 1999], ['Toy Story 3.', 'animáció|családi|kaland', 103, 2010], ['Toy Story 4.', 'animáció|családi|kaland', 100, 2019],
  ['A szépség és a szörnyeteg (rajzfilm)', 'animáció|családi|romantikus-film|musical', 84, 1991], ['Aladdin (rajzfilm)', 'animáció|családi|kaland|musical', 90, 1992], ['Az oroszlánkirály', 'animáció|családi|musical|dráma', 88, 1994],
  ['Mulan', 'animáció|családi|kaland|musical', 88, 1998], ['A kis hableány', 'animáció|családi|musical|romantikus-film', 83, 1989], ['Herkules', 'animáció|családi|kaland|vígjáték', 93, 1997],
  ['Lilo és Stitch', 'animáció|családi|vígjáték|sci-fi', 85, 2002], ['Jégvarázs', 'animáció|családi|musical|kaland', 102, 2013], ['Jégvarázs 2.', 'animáció|családi|musical|kaland', 103, 2019],
  ['Vaiana', 'animáció|családi|musical|kaland', 107, 2016], ['Vaiana 2.', 'animáció|családi|musical|kaland', 100, 2024], ['Zootropolis – Állati nagy balhé', 'animáció|családi|vígjáték|krimi', 108, 2016],
  ['Agymanók', 'animáció|családi|vígjáték|dráma', 95, 2015], ['Agymanók 2.', 'animáció|családi|vígjáték', 96, 2024], ['Szörny Rt.', 'animáció|családi|vígjáték', 92, 2001], ['Némó nyomában', 'animáció|családi|kaland', 100, 2003],
  ['Verdák', 'animáció|családi|vígjáték', 117, 2006], ['Rontó Ralph', 'animáció|családi|vígjáték|kaland', 101, 2012], ['Fel!', 'animáció|családi|kaland|vígjáték', 96, 2009], ['Ratatouille', 'animáció|családi|vígjáték', 111, 2007],
  ['WALL-E', 'animáció|családi|sci-fi|romantikus-film', 98, 2008], ['Coco', 'animáció|családi|musical|kaland', 105, 2017], ['Encanto', 'animáció|családi|musical|fantasy', 102, 2021], ['Soul', 'animáció|családi|vígjáték|dráma', 100, 2020],
  ['Luca', 'animáció|családi|vígjáték|kaland', 95, 2021], ['Pirosodom', 'animáció|családi|vígjáték', 100, 2022], ['Elemi', 'animáció|családi|romantikus-film|vígjáték', 109, 2023], ['Lightyear', 'animáció|családi|sci-fi|kaland', 105, 2022],
  ['Shrek', 'animáció|családi|vígjáték|fantasy', 90, 2001], ['Shrek 2.', 'animáció|családi|vígjáték|fantasy', 93, 2004], ['Madagaszkár', 'animáció|családi|vígjáték|kaland', 86, 2005], ['Kung Fu Panda', 'animáció|családi|vígjáték|akció', 92, 2008],
  ['Így neveld a sárkányodat', 'animáció|családi|fantasy|kaland', 98, 2010], ['Így neveld a sárkányodat 2.', 'animáció|családi|fantasy|kaland', 102, 2014], ['Így neveld a sárkányodat 3.', 'animáció|családi|fantasy|kaland', 104, 2019],
  ['Gru', 'animáció|családi|vígjáték', 95, 2010], ['Minyonok', 'animáció|családi|vígjáték', 91, 2015], ['Pókverzum', 'animáció|szuperhős|akció|családi', 117, 2018], ['Pókverzum: A pókverzumon át', 'animáció|szuperhős|akció|családi', 140, 2023],
  ['A Lego-kaland', 'animáció|családi|vígjáték|kaland', 100, 2014], ['Super Mario Bros. – A film', 'animáció|családi|kaland|vígjáték', 92, 2023], ['Hotel Transylvania', 'animáció|családi|vígjáték', 91, 2012],
  ['Rango', 'animáció|vígjáték|kaland', 107, 2011], ['Coraline és a titkos ajtó', 'animáció|fantasy|horror|családi', 100, 2009], ['Karácsonyi lidércnyomás', 'animáció|fantasy|musical|családi', 76, 1993],
  ['Chihiro Szellemországban', 'animáció|fantasy|kaland|családi', 125, 2001], ['Szomszédom, Totoro', 'animáció|fantasy|családi', 86, 1988], ['A vándorló palota', 'animáció|fantasy|romantikus-film|kaland', 119, 2004],
  ['Mononoke hercegnő', 'animáció|fantasy|kaland|akció', 134, 1997], ['Kiki, a boszorkányfutár', 'animáció|fantasy|családi', 103, 1989], ['A fiú és a gém', 'animáció|fantasy|kaland|dráma', 124, 2023],
  ['Your Name. – Az álmok hangja', 'animáció|romantikus-film|fantasy|dráma', 106, 2016], ['Kubo és a varázshúrok', 'animáció|fantasy|kaland|családi', 101, 2016],
  ['Paddington', 'családi|vígjáték|kaland|fantasy', 95, 2014], ['Paddington 2.', 'családi|vígjáték|kaland|fantasy', 103, 2017], ['Ice Age – Jégkorszak', 'animáció|családi|vígjáték|kaland', 81, 2002],
  ['Stuart Little, kisegér', 'családi|vígjáték|kaland', 84, 1999], ['Micimackó', 'animáció|családi|kaland', 63, 2011], ['Reszkessetek, betörők!', 'családi|vígjáték|kaland', 103, 1990]
);
/* --- Sci-fi --- */
FILMS.push(
  ['Interstellar', 'sci-fi|dráma|kaland', 169, 2014], ['Eredet', 'sci-fi|thriller|akció', 148, 2010], ['Mátrix', 'sci-fi|akció', 136, 1999], ['Vissza a jövőbe', 'sci-fi|vígjáték|kaland', 116, 1985],
  ['Vissza a jövőbe II.', 'sci-fi|vígjáték|kaland', 108, 1989], ['Vissza a jövőbe III.', 'sci-fi|vígjáték|kaland|családi', 118, 1990], ['Szárnyas fejvadász', 'sci-fi|thriller|krimi', 117, 1982],
  ['Szárnyas fejvadász 2049', 'sci-fi|thriller|dráma', 164, 2017], ['Dűne', 'sci-fi|kaland|dráma', 155, 2021], ['Dűne: Második rész', 'sci-fi|kaland|dráma|akció', 166, 2024], ['Gravitáció', 'sci-fi|thriller|dráma', 91, 2013],
  ['Érkezés', 'sci-fi|dráma', 116, 2016], ['A marsi', 'sci-fi|dráma|kaland', 144, 2015], ['Ex Machina', 'sci-fi|thriller|dráma', 108, 2015], ['Ready Player One', 'sci-fi|kaland|akció', 140, 2018],
  ['A holnap határa', 'sci-fi|akció', 113, 2014], ['Pacific Rim – A Csendes-óceán peremén', 'sci-fi|akció', 131, 2013], ['Tron: Örökség', 'sci-fi|akció|kaland', 125, 2010], ['Oblivion – Halálra ítélve', 'sci-fi|akció|thriller', 124, 2013],
  ['Passengers – Utasok', 'sci-fi|romantikus-film|dráma', 116, 2016], ['Ad Astra – Út a csillagokba', 'sci-fi|dráma|thriller', 123, 2019], ['Tenet', 'sci-fi|akció|thriller', 150, 2020], ['Mad Max: A harag útja', 'akció|sci-fi|kaland', 120, 2015],
  ['Avatar', 'sci-fi|kaland|akció', 162, 2009], ['Avatar: A víz útja', 'sci-fi|kaland|akció', 192, 2022], ['Jurassic Park', 'sci-fi|kaland|akció', 127, 1993], ['Jurassic World', 'sci-fi|kaland|akció', 124, 2015],
  ['Jurassic World: Bukott birodalom', 'sci-fi|kaland|akció', 128, 2018], ['E.T., a földönkívüli', 'sci-fi|kaland|családi', 115, 1982], ['Terminátor 2. – Az ítélet napja', 'sci-fi|akció|thriller', 137, 1991],
  ['Alien – A nyolcadik utas: a Halál', 'sci-fi|horror|thriller', 117, 1979], ['Aliens – A bolygó neve: Halál', 'sci-fi|akció|horror', 137, 1986], ['Predator – A ragadozó', 'sci-fi|akció|horror', 107, 1987],
  ['Napfény', 'sci-fi|thriller|dráma', 107, 2007], ['Hold', 'sci-fi|dráma|thriller', 97, 2009], ['Looper – A jövő gyilkosa', 'sci-fi|akció|thriller', 119, 2012], ['Az időutazó felesége', 'sci-fi|romantikus-film|dráma', 107, 2009],
  ['Her – Ő', 'sci-fi|romantikus-film|dráma', 126, 2013], ['Free Guy', 'sci-fi|vígjáték|akció', 115, 2021], ['Ne nézz fel!', 'vígjáték|sci-fi|dráma', 138, 2021], ['Mindenhol, mindenkor, mindent egyszerre', 'sci-fi|vígjáték|akció|dráma', 139, 2022],
  ['Barbie', 'vígjáték|fantasy|kaland', 114, 2023], ['Oppenheimer', 'dráma|történelmi|thriller', 180, 2023], ['Szegény párák', 'vígjáték|dráma|sci-fi|romantikus-film', 141, 2023],
  ['Kapcsolat', 'sci-fi|dráma', 150, 1997], ['Cloverfield', 'sci-fi|thriller|horror', 85, 2008], ['Elysium – Zárt világ', 'sci-fi|akció', 109, 2013],
  ['Chappie', 'sci-fi|akció|dráma', 120, 2015], ['Mátrix: Feltámadások', 'sci-fi|akció', 148, 2021], ['Super 8', 'sci-fi|kaland|thriller', 112, 2011],
  ['Prometheus', 'sci-fi|thriller|horror', 124, 2012], ['Csillagközi invázió', 'sci-fi|akció|horror', 129, 1997]
);
/* --- Akció és kaland --- */
FILMS.push(
  ['Top Gun', 'akció|dráma|romantikus-film', 110, 1986], ['Top Gun: Maverick', 'akció|dráma', 130, 2022], ['John Wick', 'akció|thriller|krimi', 101, 2014], ['John Wick: 2. felvonás', 'akció|thriller|krimi', 122, 2017],
  ['John Wick: 3. felvonás – Parabellum', 'akció|thriller|krimi', 131, 2019], ['John Wick: 4. felvonás', 'akció|thriller|krimi', 169, 2023], ['Mission: Impossible – Fantom protokoll', 'akció|thriller|kaland', 132, 2011],
  ['Mission: Impossible – Titkos nemzet', 'akció|thriller|kaland', 131, 2015], ['Mission: Impossible – Utóhatás', 'akció|thriller|kaland', 147, 2018], ['Casino Royale', 'akció|thriller|kaland', 144, 2006],
  ['Skyfall', 'akció|thriller|kaland', 143, 2012], ['Nincs idő meghalni', 'akció|thriller|kaland', 163, 2021], ['Gladiátor', 'akció|dráma|történelmi', 155, 2000], ['Gladiátor II.', 'akció|dráma|történelmi', 148, 2024],
  ['Indiana Jones és az elveszett frigyláda fosztogatói', 'kaland|akció', 115, 1981], ['Indiana Jones és az utolsó kereszteshadjárat', 'kaland|akció|vígjáték', 127, 1989], ['A múmia', 'kaland|akció|fantasy|vígjáték', 125, 1999],
  ['Halálos iramban', 'akció|krimi|thriller', 106, 2001], ['Halálos iramban 5.', 'akció|krimi|thriller', 130, 2011], ['A Bourne-rejtély', 'akció|thriller', 119, 2002], ['A Bourne-ultimátum', 'akció|thriller', 115, 2007],
  ['Drágán add az életed!', 'akció|thriller', 132, 1988], ['Elrabolva', 'akció|thriller', 93, 2008], ['Dunkirk', 'történelmi|akció|dráma|thriller', 106, 2017], ['Kingsman: A titkosszolgálat', 'akció|vígjáték|kaland', 129, 2014],
  ['Baby Driver', 'akció|krimi|romantikus-film', 113, 2017], ['Mr. és Mrs. Smith', 'akció|vígjáték|romantikus-film', 120, 2005], ['Trója', 'történelmi|akció|dráma', 163, 2004], ['300', 'akció|történelmi|fantasy', 117, 2006],
  ['Sherlock Holmes', 'krimi|akció|kaland', 128, 2009], ['Rocky', 'dráma', 119, 1976], ['Creed', 'dráma', 133, 2015], ['Az utolsó mohikán', 'történelmi|kaland|romantikus-film|akció', 112, 1992]
);
/* --- Vígjáték és romantikus --- */
FILMS.push(
  ['Amélie csodálatos élete', 'romantikus-film|vígjáték', 122, 2001], ['Notting Hill', 'romantikus-film|vígjáték', 124, 1999], ['Szerelmünk lapjai', 'romantikus-film|dráma', 123, 2004], ['Dirty Dancing', 'romantikus-film|musical|dráma', 100, 1987],
  ['Titanic', 'romantikus-film|dráma|történelmi', 194, 1997], ['Igazából szerelem', 'romantikus-film|vígjáték', 135, 2003], ['Büszkeség és balítélet', 'romantikus-film|dráma|történelmi', 129, 2005],
  ['Négy esküvő és egy temetés', 'romantikus-film|vígjáték', 117, 1994], ['Micsoda nő!', 'romantikus-film|vígjáték', 119, 1990], ['Bridget Jones naplója', 'romantikus-film|vígjáték', 97, 2001],
  ['Mielőtt felkel a nap', 'romantikus-film|dráma', 101, 1995], ['Hitch – A megoldásember', 'romantikus-film|vígjáték', 118, 2005], ['Casablanca', 'romantikus-film|dráma|történelmi', 102, 1942],
  ['Egy makulátlan elme örök ragyogása', 'romantikus-film|sci-fi|dráma', 108, 2004], ['Szerelmes Shakespeare', 'romantikus-film|vígjáték|történelmi', 123, 1998], ['Az én nagy görög lakodalmam', 'romantikus-film|vígjáték', 95, 2002],
  ['Love, Simon', 'romantikus-film|vígjáték|dráma', 110, 2018], ['Csillagainkban a hiba', 'romantikus-film|dráma', 126, 2014], ['Mielőtt megismertelek', 'romantikus-film|dráma', 110, 2016], ['10 dolog, amit utálok benned', 'romantikus-film|vígjáték', 97, 1999],
  ['(500) Nap nyár', 'romantikus-film|vígjáték|dráma', 95, 2009], ['A nagy Gatsby', 'dráma|romantikus-film', 143, 2013], ['Mamma Mia!', 'musical|vígjáték|romantikus-film', 108, 2008], ['Mamma Mia! Sose hagyjuk abba', 'musical|vígjáték|romantikus-film', 114, 2018],
  ['Másnaposok', 'vígjáték', 100, 2009], ['Kapj el, ha tudsz', 'krimi|vígjáték|dráma', 141, 2002], ["Ocean's Eleven – Tuti haver", 'krimi|vígjáték|akció', 116, 2001], ['Elf – A manó', 'családi|vígjáték|fantasy', 97, 2003],
  ['Apa csak egy van', 'vígjáték|családi|dráma', 125, 1993], ['Jumanji: Vár a dzsungel', 'kaland|vígjáték|fantasy|családi', 119, 2017], ['Jumanji: A következő szint', 'kaland|vígjáték|fantasy|családi', 123, 2019],
  ['Szellemirtók', 'vígjáték|fantasy|sci-fi', 105, 1984], ['A Grand Budapest Hotel', 'vígjáték|krimi|kaland', 99, 2014], ['Késélen', 'krimi|vígjáték|thriller', 130, 2019], ['Zöld könyv', 'dráma|vígjáték', 130, 2018],
  ['Életrevalók', 'vígjáték|dráma', 112, 2011], ['Birdman', 'dráma|vígjáték', 119, 2014], ['Jojo Nyuszi', 'vígjáték|dráma|történelmi', 108, 2019], ['Volt egyszer egy Hollywood', 'vígjáték|dráma', 161, 2019],
  ['Truman Show', 'dráma|vígjáték|sci-fi', 103, 1998], ['Forrest Gump', 'dráma|vígjáték|romantikus-film', 142, 1994], ['Valami Amerika', 'vígjáték', 107, 2002], ['Valami Amerika 2.', 'vígjáték', 99, 2008],
  ['Üvegtigris', 'vígjáték', 99, 2001], ['A tanú', 'vígjáték|dráma', 105, 1969], ['Kontroll', 'thriller|vígjáték|dráma', 111, 2003]
);
/* --- Musical --- */
FILMS.push(
  ['La La Land', 'musical|romantikus-film|dráma', 128, 2016], ['Moulin Rouge!', 'musical|romantikus-film|dráma', 127, 2001], ['Grease', 'musical|romantikus-film|vígjáték', 110, 1978], ['A muzsika hangja', 'musical|dráma|családi|történelmi', 174, 1965],
  ['A legnagyobb showman', 'musical|dráma', 105, 2017], ['Chicago', 'musical|krimi|vígjáték', 113, 2002], ['A nyomorultak', 'musical|dráma|történelmi', 158, 2012], ['Bohém rapszódia', 'dráma|musical', 134, 2018],
  ['Elvis', 'dráma|musical', 159, 2022], ['Csillag születik', 'dráma|romantikus-film|musical', 136, 2018], ['West Side Story', 'musical|romantikus-film|dráma', 156, 2021], ['Sing – Ének', 'animáció|musical|családi|vígjáték', 108, 2016]
);
/* --- Dráma, thriller, krimi, horror, történelmi --- */
FILMS.push(
  ['A remény rabjai', 'dráma|krimi', 142, 1994], ['A halálsoron', 'dráma|krimi|fantasy', 189, 1999], ['A Keresztapa', 'krimi|dráma', 175, 1972], ['Schindler listája', 'történelmi|dráma', 195, 1993],
  ['Ryan közlegény megmentése', 'történelmi|akció|dráma', 169, 1998], ['A király beszéde', 'dráma|történelmi', 118, 2010], ['Whiplash', 'dráma|musical', 106, 2014], ['Élősködők', 'thriller|dráma|vígjáték', 132, 2019],
  ['Eltűnt lány', 'thriller|krimi|dráma', 149, 2014], ['Hetedik', 'thriller|krimi', 127, 1995], ['A bárányok hallgatnak', 'thriller|krimi|horror', 118, 1991], ['Ragyogás', 'horror|thriller', 146, 1980],
  ['Sikoly', 'horror|thriller', 111, 1996], ['Tűnj el!', 'horror|thriller', 104, 2017], ['Csendes hely', 'horror|thriller|dráma', 90, 2018], ['Az', 'horror|thriller|fantasy', 135, 2017],
  ['Démonok között', 'horror|thriller', 112, 2013], ['Gyilkosság az Orient expresszen', 'krimi|dráma', 128, 1974], ['Gyilkosság az Orient expresszen', 'krimi|dráma|thriller', 114, 2017],
  ['Zodiákus', 'thriller|krimi|dráma', 157, 2007], ['A Wall Street farkasa', 'vígjáték|dráma|krimi', 180, 2013], ['Django elszabadul', 'akció|dráma|kaland', 165, 2012], ['1917', 'történelmi|dráma|thriller', 119, 2019],
  ['Szemfényvesztők', 'thriller|krimi|akció', 115, 2013], ['Saul fia', 'dráma|történelmi', 107, 2015], ['Hukkle', 'krimi|dráma', 79, 2002], ['A Pál utcai fiúk', 'dráma|kaland|családi', 100, 1969],
  ['Rejtett figurák', 'dráma|történelmi', 127, 2016], ['Ellenség a kapuknál', 'történelmi|dráma|akció', 131, 2001], ['A kis herceg', 'animáció|családi|fantasy|dráma', 108, 2015]
);
