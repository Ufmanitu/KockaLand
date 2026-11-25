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

  /* A barátnő valódi könyvespolcának könyvei (a fotók gerincei alapján): [cím, szerző, műfaj, hangulat, {c: szín, s: stílus, p: minta, a: díszítő szín, h: magasság, th: vastagság}, megjegyzés].
     Az oldalszám nem ismert (a vastagság a fotóról való), az állapot mind „olvasatlan”, hogy a kockák az egész polcból válogathassanak – a polcon átállítható. */
  const AU = '#d9b25a', AG = '#cdd2d8', CU = '#c98a55', RD = '#b3243a', BK = '#17110f', CR = '#efe2c4';
  const K = (c, s, p, a, th, h) => ({ c, s, p, a, th, h: h || 1 });
  const MAFI = (t, c, p, a) => [t, 'Tahereh Mafi', 'Disztópia, Romantikus', 'izgalmas', K(c, 3, p, a, 2)];
  const KEN = (t, c) => [t, 'Raven Kennedy', 'Fantasy, Romantikus', 'sötét', K(c, 2, 6, AU, 3)];
  const LIB = [
    ['Tahereh Mafi – Ne érints! sorozat', [
      MAFI('Ne érints', '#5d6b78', 6, AG), MAFI('Ne keress', '#4c5f9c', 6, AG), MAFI('Ne félts', '#3f8d8a', 6, AG), MAFI('Ne hazudj', '#e1e4e8', 6, AG), MAFI('Ne engedj', '#8b9db4', 6, AG),
      MAFI('Ne felejts', '#566a82', 6, AU), MAFI('Ne add fel', '#7c4636', 6, AU), MAFI('Ne hagyj el', '#5f2f86', 4, AU), MAFI('Ne tágíts', '#cdd6e2', 6, AG), MAFI('Ne színlelj', '#a99bd2', 6, AG)]],
    ['Kennedy és Garber', [
      KEN('Gild', '#1b1c27'), KEN('Glint', '#1a1b26'), KEN('Gleam', '#191a25'), KEN('Glow', '#181a24'), KEN('Gold', '#1a1a22'),
      ['Caraval', 'Stephanie Garber', 'Fantasy, Ifjúsági', 'kalandos', K('#18233f', 6, 4, CR, 3)], ['Finale', 'Stephanie Garber', 'Fantasy, Ifjúsági', 'kalandos', K('#2b2354', 6, 4, CU, 3)]]],
    ['Sötét romantika', [
      ['Ne! Veszíts el!', 'Laura Kneidl', 'Romantikus', '', K('#a6cbe0', 3, 0, BK, 2)], ['Hooked', 'Emily McIntire', 'Romantikus, Fantasy', 'sötét', K('#262a30', 2, 6, RD, 3)],
      ['A hatalom tőre', 'Kristen Ciccarelli', 'Fantasy', 'kalandos', K('#15161a', 3, 0, CU, 3)], ['Riot House', 'Callie Hart', 'Romantikus', 'sötét', K('#121214', 3, 0, AU, 3, 0.94)],
      ['Gothikana', 'RuNyx', 'Romantikus', 'sötét', K('#16161a', 2, 3, AU, 3)], ['Téveszmék I.', 'Végh Csenge', 'Regény', '', K('#cfd0d2', 3, 6, BK, 3)],
      ['Satan\'s Affair', 'H. D. Carlton', 'Romantikus', 'sötét', K('#3a3c42', 2, 6, AG, 3, 0.94)],
      ['Szavad ne feledd!', 'Riley Baker', 'Regény', '', K('#9a9a98', 3, 0, BK, 2)], ['…szerencse', 'Riley Baker', 'Regény', '', K('#b86a1e', 3, 0, BK, 2), 'A gerincen a cím nem volt jól olvasható – javítsd át a pontos címre!']]],
    ['Romantikus kedvencek', [
      ['Hideghábori', 'Orgován Ramóna', 'Romantikus', '', K('#e8a2b0', 3, 0, RD, 2, 0.94)], ['Ellenséges szobatárs', 'Vörös Viktória', 'Romantikus', '', K('#4a3a86', 3, 4, CR, 2, 0.94)],
      ['Under the Magnolias', 'T. I. Lowe', 'Romantikus', 'megható', K('#9ccbb0', 3, 0, AU, 2, 0.94)], ['A lelkitárs-egyenlet', 'Christina Lauren', 'Romantikus', 'megható', K('#e6b52c', 3, 0, BK, 3)],
      ['Az igaz szerelem-kísérlet', 'Christina Lauren', 'Romantikus', 'vicces', K('#7e2f86', 3, 7, CR, 3)]]],
    ['Egyéb', [
      ['Piranesi', 'Susanna Clarke', 'Fantasy', 'elgondolkodtató', K('#efe8d8', 2, 7, CU, 3, 0.94)], ['A Titok', 'Rhonda Byrne', 'Ismeretterjesztő', 'elgondolkodtató', K('#4a1a14', 5, 0, AU, 2, 0.88)]]]
  ];
  function library() {
    const books = [], shelves = [];
    LIB.forEach(sh => { const ids = []; sh[1].forEach(r => { const k = r[4], b = { id: Engine.uid(), title: r[0], author: r[1], genre: r[2], mood: r[3], pages: 0, status: 'olvasatlan', note: r[5] || '', color: k.c, style: k.s, pat: k.p, acc: k.a, h: k.h, th: k.th }; books.push(b); ids.push(b.id); }); shelves.push({ id: Engine.uid(), name: sh[0], ids }); });
    return { books, shelves };
  }
  const books = () => library().books;
  /* v13: a régi (érintetlen) példakönyvek helyére egyszer a valódi polc kerül; saját könyvekhez nem nyúlunk */
  function adoptReal(S) {
    if (!S.settings) S.settings = {}; if ((S.settings.libV || 0) >= 13) return 0;
    S.settings.libV = 13;
    if (Array.isArray(S.books) && S.books.length && S.books.every(b => b && b.example)) { const l = library(); S.books = l.books; S.shelves = l.shelves; return l.books.length; }
    return 0;
  }

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

  /* v12: a rózsaszínes/barbie alap-témaszínek helyett sötét, „dark romance” tónusok — csak az érintetlen (nem átszínezett) alap témákon */
  const RECOLOR = { randi: ['#e04a5f', '#a8233a'], utazas: ['#2c9bb8', '#2f7d86'], kaja: ['#e8832a', '#b5632a'], fozes: ['#d9622b', '#a6482a'], mozi: ['#9b6bdb', '#6b4a9c'], kezmuves: ['#3fae7b', '#3a8060'], konyv: ['#c9923a', '#a67a32'], meghitt: ['#c2335f', '#7d1d3a'] };
  function recolor(S) {
    if (!S.settings) S.settings = {}; if ((S.settings.palV || 0) >= 12) return 0;
    let n = 0; S.themes.forEach(t => { const r = t.builtin && RECOLOR[t.id]; if (r && String(t.color).toLowerCase() === r[0]) { t.color = r[1]; n++; } });
    S.settings.palV = 12; return n;
  }

  return { VERSION, themes, books, library, adoptReal, BOOK_GENRES, BOOK_MOODS, T, migrate, recolor, sig };
})();
