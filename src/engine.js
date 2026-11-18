/* ===== Engine: DSL + koherens sorsoló motor (v2: kényszer-megoldó) =====
   Szürreális mód KI: az eredmény mindig koherens (0 szabálysértés), ha létezik ilyen kombináció.
   Szürreális mód BE: a ~ opciók és a káosz-kockák szabályt szeghetnek (lila jelzés).
   DSL: "Szöveg #cimke !utkozik ?kell|vagy +szivesen *suly ~"                                    */
const Engine = (() => {
  'use strict';

  const slug = s => String(s == null ? '' : s).toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  let _n = 0;
  const uid = () => 'i' + Date.now().toString(36).slice(-4) + (++_n).toString(36) + Math.random().toString(36).slice(2, 6);
  const uniq = a => Array.from(new Set(a));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ---------- címke-szótár: az azonosító ékezet nélküli (slug), a megjelenített név ékezetes ---------- */
  const tagNames = {};
  function tag(raw) {
    const r = String(raw == null ? '' : raw).trim(), s = slug(r);
    if (s && r !== s && /[^\u0000-\u007f]/.test(r)) tagNames[s] = r.toLowerCase();
    return s;
  }
  const tagLabel = s => tagNames[s] || s;
  function setTagNames(o) {
    if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (typeof o[k] === 'string' && o[k].length < 40) tagNames[k] = o[k]; });
  }

  /* ---------- DSL ---------- */
  function parseLine(line) {
    const o = { id: uid(), t: '', g: [], x: [], n: [], w: [], s: false, p: 1 };
    const words = [];
    String(line).trim().split(/\s+/).forEach(tok => {
      if (!tok) return;
      const c = tok[0], rest = tok.slice(1);
      if (c === '~' && !rest) { o.s = true; return; }
      if (c === '*' && /^\d+([.,]\d+)?$/.test(rest)) { o.p = clamp(parseFloat(rest.replace(',', '.')), 0.1, 50); return; }
      if (rest && '#!?+'.indexOf(c) >= 0) {
        if (c === '?') {
          const grp = uniq(rest.split('|').map(tag).filter(Boolean));
          if (grp.length) o.n.push(grp);
        } else {
          const t = tag(rest);
          if (!t) return;
          (c === '#' ? o.g : c === '!' ? o.x : o.w).push(t);
        }
        return;
      }
      words.push(tok);
    });
    o.t = words.join(' ');
    o.g = uniq(o.g); o.x = uniq(o.x); o.w = uniq(o.w);
    return o;
  }

  const lbls = a => a.map(tagLabel);
  function fmtLine(o) {
    return [o.t]
      .concat(lbls(o.g).map(t => '#' + t), lbls(o.x).map(t => '!' + t), o.n.map(g => '?' + lbls(g).join('|')), lbls(o.w).map(t => '+' + t),
        o.p && o.p !== 1 ? ['*' + o.p] : [], o.s ? ['~'] : [])
      .filter(Boolean).join(' ');
  }

  function parseLines(text) {
    return String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(parseLine).filter(o => o.t);
  }

  /* ---------- segédek ---------- */
  const splitList = s => String(s || '').split(/[,;\/|]+/).map(x => x.trim()).filter(Boolean);
  const hasAny = (arr, set) => { for (let i = 0; i < arr.length; i++) if (set.has(arr[i])) return true; return false; };
  const inter = (a, b) => { for (let i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return true; return false; };

  function shuffle(arr, R) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function wchoose(items, weights, R) {
    let tot = 0; for (let i = 0; i < weights.length; i++) tot += weights[i];
    let r = R() * tot;
    for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  const allowed = (die, ctx) => (die.options || []).filter(o => o.t && (ctx.surreal || !o.s));
  const pw = o => o.p > 0 ? o.p : 1;
  const conflict = (a, b) => inter(a.x, b.g) || inter(b.x, a.g);

  /* címke-szolgáltatók: melyik kocka milyen címkéket adhat (az engedélyezett opciókból) */
  function providers(dice, ctx) {
    const prov = {};
    dice.forEach(d => {
      if (d.kind === 'shelf') return;
      const s = new Set();
      allowed(d, ctx).forEach(o => o.g.forEach(t => s.add(t)));
      prov[d.id] = s;
    });
    return prov;
  }

  const satisfiable = (grp, ownId, dice, prov) =>
    dice.some(d => d.id !== ownId && prov[d.id] && grp.some(t => prov[d.id].has(t)));

  function unmetGroups(opt, ownId, picks, dice, prov) {
    const out = [];
    opt.n.forEach(grp => {
      if (!satisfiable(grp, ownId, dice, prov)) return;       // senki nem tud ilyet adni → nem büntetjük
      let ok = false;
      for (const id in picks) {
        if (id === ownId) continue;
        const po = picks[id] && picks[id].opt;
        if (po && inter(po.g, grp)) { ok = true; break; }
      }
      if (!ok) out.push(grp);
    });
    return out;
  }

  /* ---------- ellenőrzés ---------- */
  function violations(dice, picks, prov) {
    const conflicts = [], unmet = [];
    const ids = dice.map(d => d.id).filter(id => picks[id] && picks[id].opt);
    for (let i = 0; i < ids.length; i++) {
      const a = picks[ids[i]].opt;
      for (let j = i + 1; j < ids.length; j++) {
        const b = picks[ids[j]].opt;
        if (conflict(a, b)) conflicts.push([ids[i], ids[j]]);
      }
      unmetGroups(a, ids[i], picks, dice, prov).forEach(grp => unmet.push({ die: ids[i], group: grp }));
    }
    return { count: conflicts.length + unmet.length, conflicts, unmet };
  }

  function annotate(dice, picks, ctx) {
    const prov = providers(dice, ctx);
    const v = violations(dice, picks, prov);
    const bad = new Set();
    v.conflicts.forEach(c => { bad.add(c[0]); bad.add(c[1]); });
    v.unmet.forEach(u => bad.add(u.die));
    for (const id in picks) {
      const p = picks[id]; if (!p || !p.opt) continue;
      p.flag = p.opt.s ? 's' : (bad.has(id) ? (p.chaos && ctx.surreal ? 's' : 'c') : '');
    }
    return v;
  }

  const chaosOf = ctx => ctx.chaos == null ? 0.35 : ctx.chaos;
  const sw = ctx => 0.5 + 1.8 * chaosOf(ctx);

  /* ---------- súlyozás ---------- */
  function prefWeight(o, die, others, dice, prov, ctx) {
    const have = new Set(), want = new Set(), unmet = new Set();
    for (const id in others) {
      const po = others[id] && others[id].opt;
      if (!po || id === die.id) continue;
      po.g.forEach(t => have.add(t));
      po.w.forEach(t => want.add(t));
      unmetGroups(po, id, others, dice, prov).forEach(g => g.forEach(t => unmet.add(t)));
    }
    let w = ((ctx.surreal && o.s) ? sw(ctx) : 1) * pw(o);
    if (hasAny(o.g, want)) w *= 3;
    if (hasAny(o.w, have)) w *= 3;
    if (hasAny(o.g, unmet)) w *= 4;
    const ng = o.n.filter(grp => satisfiable(grp, die.id, dice, prov));
    if (ng.length) w *= ng.every(grp => hasAny(grp, have)) ? 2 : 0.35;
    return w;
  }

  /* ---------- könyvespolc ---------- */
  const bookOpt = b => ({
    id: 'book:' + b.id,
    t: b.title + (b.author ? ' – ' + b.author : ''),
    g: uniq(splitList(b.genre).map(slug).concat(splitList(b.mood).map(slug))),
    x: [], n: [], w: [], s: false, p: 1, book: b
  });

  const noBookOpt = () => ({ id: 'book:none', t: 'A polc üres – vegyél fel könyveket', g: [], x: [], n: [], w: [], s: false, p: 1, book: null });

  function bookFilters(dice, picks) {
    const f = {};
    dice.forEach(d => {
      if (!d.role || d.kind === 'shelf' || !picks[d.id] || !picks[d.id].opt) return;
      const o = picks[d.id].opt;
      f[d.role] = new Set(o.g.concat([slug(o.t)]));
    });
    return f;
  }

  function bookMatches(b, f, skip) {
    if (f.genre && skip.indexOf('genre') < 0 && !f.genre.has('barmi')) {
      const gs = splitList(b.genre).map(slug);
      if (gs.length && !gs.some(g => f.genre.has(g))) return false;
    }
    if (f.mood && skip.indexOf('mood') < 0) {
      const ms = splitList(b.mood).map(slug);
      if (ms.length && !ms.some(m => f.mood.has(m))) return false;
    }
    if (f.length && skip.indexOf('length') < 0) {
      const p = +b.pages;
      if (p > 0) { const k = p < 250 ? 'rovid' : p < 500 ? 'kozepes' : 'hosszu'; if (!f.length.has(k)) return false; }
    }
    return true;
  }

  function pickBook(dice, picks, ctx, R, excludeId) {
    let books = (ctx.books || []).filter(b => b.title);
    if (ctx.onlyUnread) books = books.filter(b => b.status !== 'elolvastam');
    if (!books.length) return { opt: noBookOpt(), relaxed: [] };
    const f = bookFilters(dice, picks);
    const drops = [];
    let pool = books.filter(b => bookMatches(b, f, drops));
    for (const key of ['length', 'mood', 'genre']) {
      if (pool.length) break;
      drops.push(key);
      pool = books.filter(b => bookMatches(b, f, drops));
    }
    if (!pool.length) pool = books;
    if (excludeId && pool.length > 1) pool = pool.filter(b => b.id !== excludeId);
    const b = pool[Math.floor(R() * pool.length)];
    return { opt: bookOpt(b), relaxed: drops };
  }

  /* ---------- kényszer-megoldó (visszalépéses, súlyozott véletlennel) ----------
     base: rögzített választások (zároltak, káosz-kockák); rest: a kiosztandó kockák.
     ignore: azok a rögzítettek, amelyeknek a szabályait nem kényszerítjük (káosz-kockák).
     Siker: minden kiosztott opció ütközésmentes, és minden teljesíthető „kell" feltétel teljesül. */
  function orderDice(rest, ctx, R) {
    const share = d => { const a = allowed(d, ctx); return a.length ? a.filter(o => o.n.length).length / a.length : 0; };
    return shuffle(rest, R).map(d => ({ d, k: share(d) })).sort((a, b) => a.k - b.k).map(x => x.d);
  }

  function solve(normal, rest, base, ctx, prov, R, o) {
    o = o || {};
    const ignore = o.ignore || new Set(), keep = o.keep || null;
    const picks = Object.assign({}, base);
    const order = orderDice(rest, ctx, R);
    const budget = { n: o.budget || 2500 };
    const doms = {}; rest.forEach(d => { doms[d.id] = allowed(d, ctx); });

    // egy kiosztott opció „kell" csoportjai: teljesülnek vagy még teljesülhetnek a hátralévő kockákból
    const needsOK = (opt, ownId, remIds) => {
      for (let gi = 0; gi < opt.n.length; gi++) {
        const grp = opt.n[gi];
        if (!satisfiable(grp, ownId, normal, prov)) continue;
        let ok = false;
        for (const id in picks) { if (id !== ownId && picks[id] && picks[id].opt && inter(picks[id].opt.g, grp)) { ok = true; break; } }
        if (!ok) for (let r = 0; r < remIds.length && !ok; r++) if (remIds[r] !== ownId && prov[remIds[r]] && grp.some(t => prov[remIds[r]].has(t))) ok = true;
        if (!ok) return false;
      }
      return true;
    };
    const feasible = remIds => {
      for (const id in picks) {
        if (ignore.has(id) || !picks[id] || !picks[id].opt) continue;
        if (!needsOK(picks[id].opt, id, remIds)) return false;
      }
      return true;
    };

    function rec(i) {
      if (i >= order.length) return true;
      const die = order[i], remIds = order.slice(i + 1).map(d => d.id);
      let cands = doms[die.id].filter(opt => {
        for (const id in picks) { const po = picks[id] && picks[id].opt; if (po && conflict(opt, po)) return false; }
        return needsOK(opt, die.id, remIds);
      });
      let ws = cands.map(opt => {
        let w = prefWeight(opt, die, picks, normal, prov, ctx);
        if (keep && keep[die.id] && keep[die.id].opt && keep[die.id].opt.id === opt.id) w *= 8;
        return w;
      });
      while (cands.length) {
        if (--budget.n < 0) return false;
        const k = cands.length === 1 ? 0 : (() => { const c = wchoose(cands.map((_, x) => x), ws, R); return c; })();
        const opt = cands[k]; cands.splice(k, 1); ws.splice(k, 1);
        picks[die.id] = { opt };
        if (feasible(remIds) && rec(i + 1)) return true;
        delete picks[die.id];
      }
      return false;
    }
    if (!rec(0)) return null;
    // a rögzítetteket (zárolt) is érvényesítjük: ha azok nem teljesülnek, nincs „tiszta" megoldás
    const v = violations(normal, picks, prov);
    const strict = v.conflicts.filter(c => !(ignore.has(c[0]) && ignore.has(c[1])) && !(base[c[0]] && base[c[1]]));
    const un = v.unmet.filter(u => !ignore.has(u.die));
    if (strict.length || un.length) return null;
    return picks;
  }

  /* ---------- sorsolás ---------- */
  const rngOf = ctx => ctx.rng || Math.random;

  // a régi, szabálysértést minimalizáló keresés: tartalék, ha zárolások miatt nincs tiszta megoldás
  function chooseOpt(die, dice, picks, ctx, prov, R) {
    const cands = allowed(die, ctx);
    if (!cands.length) return null;
    const scored = cands.map(o => {
      let conf = 0;
      for (const id in picks) { const po = picks[id] && picks[id].opt; if (po && id !== die.id && conflict(o, po)) conf++; }
      return { o, conf };
    });
    const min = Math.min.apply(null, scored.map(s => s.conf));
    const pool = scored.filter(s => s.conf === min).map(s => s.o);
    return wchoose(pool, pool.map(o => prefWeight(o, die, picks, dice, prov, ctx)), R);
  }

  function rollAll(dice, cur, locks, ctx) {
    const R = rngOf(ctx);
    const prov = providers(dice, ctx);
    const normal = dice.filter(d => d.kind !== 'shelf');
    const shelf = dice.filter(d => d.kind === 'shelf');
    const base = {};
    dice.forEach(d => { if (locks[d.id] && cur[d.id]) base[d.id] = { opt: cur[d.id].opt, relaxed: cur[d.id].relaxed }; });
    const ignore = new Set();

    if (ctx.surreal) {                       // káosz: néhány kocka figyelmen kívül hagyja a szabályokat
      const pc = chaosOf(ctx) * 0.5;
      normal.forEach(d => {
        if (base[d.id] || R() >= pc) return;
        const c = allowed(d, ctx);
        if (!c.length) return;
        base[d.id] = { opt: wchoose(c, c.map(o => (o.s ? sw(ctx) : 1) * pw(o)), R), chaos: true };
        ignore.add(d.id);
      });
    }

    const rest = normal.filter(d => !base[d.id]);
    const run = () => {
      let b = rest.length ? solve(normal, rest, base, ctx, prov, R, { ignore }) : Object.assign({}, base);
      if (!b) {                              // nincs tiszta megoldás (pl. egymásnak ellentmondó zárak) → legkevesebb szabálysértés
        let bs = Infinity;
        for (let a = 0; a < 200; a++) {
          const picks = Object.assign({}, base);
          shuffle(rest, R).forEach(d => { const o = chooseOpt(d, dice, picks, ctx, prov, R); if (o) picks[d.id] = { opt: o }; });
          const sc = violations(normal, picks, prov).count;
          if (sc < bs) { bs = sc; b = picks; if (sc === 0) break; }
        }
      }
      b = b || Object.assign({}, base);
      shelf.forEach(d => {
        if (base[d.id]) { b[d.id] = base[d.id]; return; }
        const prev = cur[d.id] && cur[d.id].opt && cur[d.id].opt.book ? cur[d.id].opt.book.id : null;
        b[d.id] = pickBook(dice, b, ctx, R, prev);
      });
      return b;
    };
    // ha a polcon nincs a szűrőkhöz illő könyv, újrapróbáljuk más műfaj/hangulat/hossz kombinációval
    const relaxN = b => shelf.reduce((n, d) => n + (b[d.id] && b[d.id].relaxed ? b[d.id].relaxed.length : 0), 0);
    let best = run();
    for (let a = 0; a < 40 && shelf.length && rest.length && relaxN(best) > 0; a++) { const b = run(); if (relaxN(b) < relaxN(best)) best = b; }
    annotate(dice, best, ctx);
    return best;
  }

  /* egy kocka újradobása. Ha a többihez nem illik másik opció, a szomszédos (nem zárolt) kockák is
     átrendeződnek, hogy az eredmény koherens maradjon. A hívó a változott kockákat animálja. */
  function rollOne(dice, dieId, cur, ctx, locks) {
    locks = locks || {};
    const R = rngOf(ctx);
    const die = dice.find(d => d.id === dieId);
    if (!die) return cur;
    const next = Object.assign({}, cur);
    const prov = providers(dice, ctx);
    const refreshShelf = () => dice.filter(d => d.kind === 'shelf').forEach(s => {
      if (die.role && !locks[s.id]) next[s.id] = pickBook(dice, next, ctx, R, null);
    });
    if (die.kind === 'shelf') {
      const prev = cur[dieId] && cur[dieId].opt && cur[dieId].opt.book ? cur[dieId].opt.book.id : null;
      next[dieId] = pickBook(dice, cur, ctx, R, prev);
      annotate(dice, next, ctx);
      return next;
    }
    const normal = dice.filter(d => d.kind !== 'shelf');
    const others = Object.assign({}, cur); delete others[dieId];
    const curId = cur[dieId] && cur[dieId].opt ? cur[dieId].opt.id : null;
    let cands = allowed(die, ctx);
    if (!cands.length) return next;
    if (curId && cands.length > 1) cands = cands.filter(o => o.id !== curId);

    let chosen = null, chaos = false;
    if (ctx.surreal && R() < chaosOf(ctx) * 0.5) {
      chosen = wchoose(cands, cands.map(o => (o.s ? sw(ctx) : 1) * pw(o)), R); chaos = true;
    } else {
      const scored = cands.map(o => {
        const p = Object.assign({}, others); p[dieId] = { opt: o };
        return { o, v: violations(normal, p, prov).count };
      });
      const clean = scored.filter(s => s.v === 0).map(s => s.o);
      if (clean.length) {
        let pool = clean;
        if (die.role && dice.some(d => d.kind === 'shelf')) {   // csak olyan opció, amihez van illő könyv a polcon
          const good = clean.filter(o => { const p = Object.assign({}, others); p[dieId] = { opt: o }; return pickBook(dice, p, ctx, R, null).relaxed.length === 0; });
          if (good.length) pool = good;
        }
        chosen = wchoose(pool, pool.map(o => prefWeight(o, die, others, dice, prov, ctx)), R);
      } else {
        // kaszkád: az új opcióhoz igazítjuk a nem zárolt szomszédokat (a mostaniakat előnyben tartva)
        const free = normal.filter(d => d.id !== dieId && !locks[d.id]);
        const fixed = {}; normal.forEach(d => { if (d.id !== dieId && locks[d.id] && cur[d.id]) fixed[d.id] = cur[d.id]; });
        let order = cands.slice(), ws = order.map(o => prefWeight(o, die, others, dice, prov, ctx));
        for (let tries = 0; tries < 14 && order.length && !chosen; tries++) {
          const k = wchoose(order.map((_, x) => x), ws, R);
          const o = order[k]; order.splice(k, 1); ws.splice(k, 1);
          const base = Object.assign({}, fixed); base[dieId] = { opt: o };
          const sol = solve(normal, free, base, ctx, prov, R, { keep: cur, budget: 1200 });
          if (sol) { chosen = o; normal.forEach(d => { if (sol[d.id]) next[d.id] = { opt: sol[d.id].opt }; }); }
        }
        if (!chosen) {                       // tartalék: a legkevesebb szabálysértésű opció, jelzéssel
          const min = Math.min.apply(null, scored.map(s => s.v));
          const pool = scored.filter(s => s.v === min).map(s => s.o);
          chosen = wchoose(pool, pool.map(o => prefWeight(o, die, others, dice, prov, ctx)), R);
        }
      }
    }
    next[dieId] = { opt: chosen, chaos: chaos };
    refreshShelf();
    annotate(dice, next, ctx);
    return next;
  }

  /* kézzel választott opció állapota a többihez képest */
  function fits(dice, picks, dieId, opt, ctx) {
    const prov = providers(dice, ctx);
    const p = Object.assign({}, picks); p[dieId] = { opt };
    const normal = dice.filter(d => d.kind !== 'shelf');
    const base = Object.assign({}, picks); delete base[dieId];
    return violations(normal, p, prov).count <= violations(normal, base, prov).count;
  }

  /* kikeresi, mely opciók „halottak": soha nem szerepelhetnek koherens eredményben (pontos: opciónként megoldást keres) */
  function deadOptions(dice, ctx) {
    const R = rngOf(ctx), c = Object.assign({}, ctx, { surreal: false });
    const normal = dice.filter(d => d.kind !== 'shelf'), prov = providers(normal, c), dead = [];
    normal.forEach(d => allowed(d, c).forEach(o => {
      const base = {}; base[d.id] = { opt: o };
      const rest = normal.filter(x => x.id !== d.id);
      if (!solve(normal, rest, base, c, prov, R, { budget: 4000 })) dead.push({ die: d.id, opt: o });
    }));
    return dead;
  }

  return { slug, tag, tagLabel, tagNames, setTagNames, uid, uniq, parseLine, parseLines, fmtLine, splitList, rollAll, rollOne, violations, providers, annotate, allowed, bookOpt, noBookOpt, pickBook, fits, conflict, deadOptions };
})();
