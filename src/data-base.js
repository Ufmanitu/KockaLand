/* ===== Seed alap: segédek, példa könyvek, migráció. A témák a src/data-*.js fájlokban vannak (SeedParts) ===== */
const SeedParts = {};   // témánként: SeedParts.<id> = T => T.theme(...)
const Seed = (() => {
  const VERSION = 2;
  const ORDER = ['randi', 'utazas', 'kaja', 'fozes', 'mozi', 'kezmuves', 'konyv', 'meghitt'];
  const NEW_IN_V2 = ['fozes'];
  // a v1 alap témák aláírásai: ha a tárolt téma még pontosan ilyen, csendben lecserélhető az újra
  const LEGACY = { randi: 'izqoye', utazas: '906rc2', kaja: '1xbpg2i', mozi: 'iqn7zj', kezmuves: '1mfhgqk', konyv: '12xfzm2', meghitt: '1kwsxje' };
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const sig = t => hash(JSON.stringify(t.dice.map(d => [d.name, d.kind || '', (d.options || []).map(o => o.t)])));

  const die = (id, name, icon, lines, extra) =>
    Object.assign({ id, name, icon, enabled: true, role: null, options: Engine.parseLines(lines) }, extra || {});
  const theme = (id, name, emoji, color, desc, dice) => ({ id, name, emoji, color, desc, builtin: true, dice });
  const T = { die, theme };

  /* ---------- Könyvek ---------- */
  const BOOK_GENRES = ['Krimi', 'Thriller', 'Fantasy', 'Sci-fi', 'Regény', 'Romantikus', 'Történelmi regény', 'Ifjúsági', 'Horror', 'Humor', 'Ismeretterjesztő', 'Mese', 'Disztópia'];
  const BOOK_MOODS = ['megnyugtató', 'izgalmas', 'megható', 'vicces', 'elgondolkodtató', 'sötét', 'kalandos'];

  // [cím, szerző, műfaj, hangulat, oldal, állapot]
  const BOOKS = [
    ['A kis herceg', 'Antoine de Saint-Exupéry', 'Mese', 'megható', 96, 'olvasatlan'],
    ['Micimackó', 'A. A. Milne', 'Mese', 'megnyugtató', 160, 'olvasatlan'],
    ['A Pál utcai fiúk', 'Molnár Ferenc', 'Ifjúsági', 'megható', 240, 'elolvastam'],
    ['Abigél', 'Szabó Magda', 'Ifjúsági', 'izgalmas', 380, 'olvasatlan'],
    ['Egri csillagok', 'Gárdonyi Géza', 'Történelmi regény', 'kalandos', 620, 'olvasatlan'],
    ['Utas és holdvilág', 'Szerb Antal', 'Regény', 'elgondolkodtató', 300, 'olvasatlan'],
    ['Édes Anna', 'Kosztolányi Dezső', 'Regény', 'sötét', 250, 'olvasatlan'],
    ['A szőke ciklon', 'Rejtő Jenő', 'Humor', 'vicces', 170, 'olvasatlan'],
    ['Gyilkosság az Orient expresszen', 'Agatha Christie', 'Krimi', 'izgalmas', 260, 'olvasatlan'],
    ['Holtodiglan', 'Gillian Flynn', 'Thriller', 'sötét', 450, 'olvasatlan'],
    ['A hobbit', 'J. R. R. Tolkien', 'Fantasy', 'kalandos', 330, 'olvasatlan'],
    ['Harry Potter és a bölcsek köve', 'J. K. Rowling', 'Fantasy', 'kalandos', 330, 'elolvastam'],
    ['Sosehol', 'Neil Gaiman', 'Fantasy', 'kalandos', 380, 'olvasatlan'],
    ['A galaxis útikalauz stopposoknak', 'Douglas Adams', 'Sci-fi', 'vicces', 220, 'olvasatlan'],
    ['A marsi', 'Andy Weir', 'Sci-fi', 'izgalmas', 400, 'olvasatlan'],
    ['Dűne', 'Frank Herbert', 'Sci-fi', 'elgondolkodtató', 700, 'olvasatlan'],
    ['1984', 'George Orwell', 'Disztópia', 'sötét', 330, 'olvasatlan'],
    ['Büszkeség és balítélet', 'Jane Austen', 'Romantikus', 'megnyugtató', 400, 'olvasatlan'],
    ['Egy Ove nevű férfi', 'Fredrik Backman', 'Regény', 'megható', 330, 'olvasatlan'],
    ['Az alkimista', 'Paulo Coelho', 'Regény', 'elgondolkodtató', 190, 'olvasatlan'],
    ['Ragyogás', 'Stephen King', 'Horror', 'sötét', 520, 'olvasatlan'],
    ['Sapiens: Az emberiség rövid története', 'Yuval Noah Harari', 'Ismeretterjesztő', 'elgondolkodtató', 520, 'olvasatlan'],
    ['Kafka a tengerparton', 'Murakami Haruki', 'Regény', 'elgondolkodtató', 500, 'olvasatlan'],
    ['Mágia színe', 'Terry Pratchett', 'Fantasy', 'vicces', 280, 'olvasatlan']
  ];
  const books = () => BOOKS.map(b => ({
    id: Engine.uid(), title: b[0], author: b[1], genre: b[2], mood: b[3], pages: b[4], status: b[5], note: '', example: true
  }));

  function themes() { return ORDER.filter(id => SeedParts[id]).map(id => SeedParts[id](T)); }

  /* v1 → v2: az érintetlen alap témák cseréje az újakra, az átírtak megtartása, új témák hozzáadása */
  function migrate(S) {
    if ((S.seedV || 1) >= VERSION) return null;
    const fresh = themes(), replaced = [], kept = [];
    S.themes = S.themes.map(t => {
      const f = t.builtin && fresh.find(x => x.id === t.id);
      if (!f) return t;
      if (sig(t) === LEGACY[t.id]) { replaced.push(t.name); return f; }
      kept.push(t.name); return t;
    });
    NEW_IN_V2.forEach(id => {
      if (S.themes.some(t => t.id === id)) return;
      const f = fresh.find(x => x.id === id); if (!f) return;
      const prev = S.themes.findIndex(t => t.id === ORDER[ORDER.indexOf(id) - 1]);
      S.themes.splice(prev >= 0 ? prev + 1 : S.themes.length, 0, f);
    });
    S.seedV = VERSION;
    return { replaced, kept };
  }

  return { VERSION, themes, books, BOOK_GENRES, BOOK_MOODS, T, migrate, sig };
})();
