/* 79-summit-build.js - the Summit final test: which questions go on the two papers (pure, no screen; Node can load it).

   Built ONLY from the stops' own Mini Practice test items (pack.test.items: their dok, lo, twm and 3 sets of numbers),
   never from a real paper. Each try draws a new mix (a seed), and a set of numbers other than the last try's.

   T.summit.plan(packs, {seed, avoid}) -> { seed, papers: [[Q, ...13], [Q, ...13]] }   Q = {s, i, v, dok, lo, twm, marks, strand}
     avoid: {'s.i': v} the items of the last try (picked again only when an objective needs them, with other numbers)
   The rules (Grade 5, the shape of the school's EOS1 Stage 6 papers; checked by T.summit.check over many seeds):
     two papers of 14 numbered questions and 20 marks each (40 marks); marks in [ ] come from the models (1 or 2;
     a claim and a question in two parts have (a) and (b), 1 mark each); an item worth more than 2 is not used
     every one of the 18 objectives of T.OBJECTIVES at least once over the two papers
     DOK by marks (EOS1 specification by items: DOK 1 46%, DOK 2 43%, DOK 3 11%): DOK 1 35-55%, DOK 2 35-55%,
       DOK 3 10-15%, on each paper and on both: one DOK 3 claim (Number) per paper, never in the first 4 questions;
       question 1 is DOK 1
     strands by marks over both papers (EOS1 by items: Number 75%, Geometry and measure 18%, Statistics 7%):
       Number 68-80%, Geometry 14-25%, Statistics 5-12%; each paper has at least 1 S and 2 G questions
   T.summit.code(Q) -> 's.i.v' and T.summit.fromCodes(packs, codes) rebuild a saved paper (a test carried on later). */
(function (T) {
  'use strict';

  const PAPERS = 2, PER = 14, MARKS = 20;
  const DOK_RANGE = { 1: [35, 55], 2: [35, 55], 3: [10, 15] };
  const STRAND_RANGE = { N: [68, 80], G: [14, 25], S: [5, 12] };

  function getMX() { return typeof MX !== 'undefined' ? MX : (typeof window !== 'undefined' ? window.MX : null); }   // eslint-disable-line no-undef

  // a small seeded random (mulberry32): the same seed gives the same test (a test carried on later)
  function rng(seed) {
    let a = (Number(seed) >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, r) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  const strandOf = lo => { const k = String((lo || [])[0] || '').charAt(1); return k === 'G' || k === 'S' ? k : 'N'; };

  // every Mini test item of every stop, with its marks (the same for its three sets of numbers)
  const cache = new WeakMap();
  function poolOf(packs) {
    if (packs && cache.has(packs)) return cache.get(packs);
    const MXo = getMX(), pool = [];
    Object.keys(packs || {}).sort(function (a, b) { return a - b; }).forEach(function (n) {
      const items = (packs[n] && packs[n].test && packs[n].test.items) || [];
      items.forEach(function (it, i) {
        if (!it || !Array.isArray(it.v) || !it.v.length) return;
        let marks = 1, claim = false;
        try { const t = MXo.make(it.v[0], 'your'); marks = t.marks || 1; claim = t.type === 'claim'; } catch (e) { return; }
        if (marks > 2) return;                         // Grade 5: no question on a paper is worth more than 2 marks
        pool.push({ s: Number(n), i: i, dok: it.dok, lo: (it.lo || []).slice(), twm: (it.twm || []).slice(), marks: marks, claim: claim,
          strand: strandOf(it.lo), sets: it.v.length, key: n + '.' + i });
      });
    });
    if (packs) cache.set(packs, pool);
    return pool;
  }

  function objectives() { return Object.keys(T.OBJECTIVES || {}); }

  /* ---------- the figures of a test: marks by DOK and by strand, objectives covered ---------- */

  function stats(list) {
    const o = { questions: list.length, marks: 0, dok: { 1: 0, 2: 0, 3: 0 }, dokQ: { 1: 0, 2: 0, 3: 0 }, strand: { N: 0, G: 0, S: 0 }, strandQ: { N: 0, G: 0, S: 0 }, los: {} };
    list.forEach(function (q) {
      o.marks += q.marks;
      o.dok[q.dok] += q.marks; o.dokQ[q.dok] += 1;
      o.strand[q.strand] += q.marks; o.strandQ[q.strand] += 1;
      q.lo.forEach(function (c) { o.los[c] = (o.los[c] || 0) + 1; });
    });
    o.pct = function (part) { return o.marks ? Math.round(part * 1000 / o.marks) / 10 : 0; };
    return o;
  }
  const inRange = function (st, part, range) { const p = part * 100 / st.marks; return p >= range[0] - 1e-9 && p <= range[1] + 1e-9; };

  // -> '' when a plan keeps every rule, else what is wrong
  function check(plan) {
    const papers = plan && plan.papers;
    if (!Array.isArray(papers) || papers.length !== PAPERS) return 'not two papers';
    const all = [].concat(papers[0], papers[1]), seen = {};
    for (let k = 0; k < all.length; k++) { if (seen[all[k].s + '.' + all[k].i]) return 'a question twice: ' + all[k].s + '.' + all[k].i; seen[all[k].s + '.' + all[k].i] = 1; }
    for (let p = 0; p < PAPERS; p++) {
      const st = stats(papers[p]);
      if (st.questions !== PER) return 'paper ' + (p + 1) + ' has ' + st.questions + ' questions';
      if (st.marks !== MARKS) return 'paper ' + (p + 1) + ' has ' + st.marks + ' marks';
      if (st.dokQ[3] !== 1) return 'paper ' + (p + 1) + ' has ' + st.dokQ[3] + ' DOK 3 questions';
      for (let d = 1; d <= 3; d++) if (!inRange(st, st.dok[d], DOK_RANGE[d])) return 'paper ' + (p + 1) + ' DOK ' + d + ' is ' + st.pct(st.dok[d]) + '%';
      if (st.strandQ.S < 1 || st.strandQ.G < 2) return 'paper ' + (p + 1) + ' strands ' + JSON.stringify(st.strandQ);
      if (papers[p][0].dok !== 1) return 'paper ' + (p + 1) + ' starts with DOK ' + papers[p][0].dok;
      if (papers[p].slice(0, 4).some(function (q) { return q.dok === 3; })) return 'paper ' + (p + 1) + ' has its claim too early';
    }
    const st = stats(all);
    for (let d = 1; d <= 3; d++) if (!inRange(st, st.dok[d], DOK_RANGE[d])) return 'DOK ' + d + ' is ' + st.pct(st.dok[d]) + '%';
    const S = Object.keys(STRAND_RANGE);
    for (let k = 0; k < S.length; k++) if (!inRange(st, st.strand[S[k]], STRAND_RANGE[S[k]])) return 'strand ' + S[k] + ' is ' + st.pct(st.strand[S[k]]) + '%';
    const missing = objectives().filter(function (c) { return !st.los[c]; });
    if (missing.length) return 'objectives not covered: ' + missing.join(' ');
    return '';
  }

  /* ---------- drawing a test ---------- */

  function tryOnce(pool, r, avoid) {
    const used = {}, picked = [];
    const fresh = function (q) { return !used[q.key]; };
    const prefer = function (list) {                       // not on the last try, if there is such a one
      const a = list.filter(function (q) { return !(q.key in avoid); });
      return a.length ? a : list;
    };
    const take = function (q) { used[q.key] = 1; picked.push(q); return q; };
    const pick = function (list) { const l = prefer(list.filter(fresh)); return l.length ? take(l[Math.floor(r() * l.length)]) : null; };
    const covered = function () { const o = {}; picked.forEach(function (q) { q.lo.forEach(function (c) { o[c] = 1; }); }); return o; };

    // two claims (DOK 3, Number), from two stops
    const claims = shuffle(pool.filter(function (q) { return q.dok === 3 && q.strand === 'N'; }), r);
    // the first claim covers two objectives (there are 20 Number objectives and only 15 other Number questions)
    const c1 = pick(claims.filter(function (q) { return q.lo.length > 1; }));
    if (!c1) return null;
    if (!pick(claims.filter(function (q) { return q.s !== c1.s; }))) return null;
    const plain = pool.filter(function (q) { return q.dok !== 3; });

    // Geometry and measure: each objective once, then 1 or 2 more; Statistics: each objective once, sometimes one more
    const G = plain.filter(function (q) { return q.strand === 'G'; }), S = plain.filter(function (q) { return q.strand === 'S'; });
    const gCodes = shuffle(objectives().filter(function (c) { return c.charAt(1) === 'G'; }), r);
    const sCodes = shuffle(objectives().filter(function (c) { return c.charAt(1) === 'S'; }), r);
    gCodes.forEach(function (c) { if (!covered()[c]) pick(G.filter(function (q) { return q.lo.indexOf(c) >= 0; })); });
    sCodes.forEach(function (c) { if (!covered()[c]) pick(S.filter(function (q) { return q.lo.indexOf(c) >= 0; })); });
    // Grade 5 (EOS1: 5 Geometry and 2 Statistics questions of 28): at least 4 G and 2 S, sometimes a fifth or sixth G
    const count = function (k) { return picked.filter(function (q) { return q.strand === k; }).length; };
    const wantG = 4 + Math.floor(r() * 3);
    for (let k = 0; k < 8 && count('G') < wantG; k++) if (!pick(G)) break;
    for (let k = 0; k < 4 && count('S') < 2; k++) if (!pick(S)) break;

    // Number: every objective not covered yet (an item that covers two of them first), then up to 28 questions,
    // with 40 marks in all (20 marks a paper)
    const N = plain.filter(function (q) { return q.strand === 'N'; });
    // a greedy cover: the question that covers the most objectives still missing (ties at random)
    for (let guard = 0; guard < 40; guard++) {
      const have = covered();
      const gain = function (q) { return q.lo.filter(function (x) { return x.charAt(1) === 'N' && !have[x]; }).length; };
      const can = N.filter(function (q) { return fresh(q) && gain(q) > 0; });
      if (!can.length) break;
      const most = Math.max.apply(null, can.map(gain));
      pick(can.filter(function (q) { return gain(q) === most; }));
      if (picked.length > PAPERS * PER) return null;
    }
    if (objectives().some(function (c) { return !covered()[c]; })) return null;
    // then more Number questions up to 26 (an objective that is on the test fewer times first)
    while (picked.length < PAPERS * PER) {
      const counts = {};
      picked.forEach(function (q) { q.lo.forEach(function (c) { counts[c] = (counts[c] || 0) + 1; }); });
      const most = function (q) { return Math.max.apply(null, q.lo.map(function (c) { return counts[c] || 0; })); };
      const can = N.filter(fresh);
      if (!can.length) return null;
      const least = Math.min.apply(null, can.map(most));
      pick(can.filter(function (q) { return most(q) <= least; }));
    }
    // swaps among the Number questions (never the claims) until there are 40 marks (20 a paper), the DOK mix of the whole test is right and every objective is still covered
    const cost = function (list) {
      const st = stats(list);
      let c = Math.abs(st.marks - PAPERS * MARKS) * 3;
      [1, 2].forEach(function (d) {
        c += Math.max(0, DOK_RANGE[d][0] * st.marks / 100 - st.dok[d], st.dok[d] - DOK_RANGE[d][1] * st.marks / 100);
      });
      c += objectives().filter(function (x) { return !st.los[x]; }).length * 5;
      return c;
    };
    let now = cost(picked);
    for (let step = 0; step < 300 && now > 0; step++) {
      const at = picked.map(function (q, k) { return q.strand === 'N' && q.dok !== 3 ? k : -1; }).filter(function (k) { return k >= 0; });
      const k = at[Math.floor(r() * at.length)];
      const outs = N.filter(fresh);
      const q = outs[Math.floor(r() * outs.length)], old = picked[k];
      picked[k] = q;
      const next = cost(picked);
      if (next <= now) { now = next; delete used[old.key]; used[q.key] = 1; } else picked[k] = old;
    }
    if (now > 0) return null;

    // the whole test must keep the strand and DOK rules before it is shared out
    const whole = stats(picked);
    for (let d = 1; d <= 3; d++) if (!inRange(whole, whole.dok[d], DOK_RANGE[d])) return null;
    if (Object.keys(STRAND_RANGE).some(function (k) { return !inRange(whole, whole.strand[k], STRAND_RANGE[k]); })) return null;

    // two papers: one claim each, then swaps until each paper keeps the rules (20 marks, DOK, G and S)
    const cl = picked.filter(function (q) { return q.dok === 3; });
    const rest = shuffle(picked.filter(function (q) { return q.dok !== 3; }), r);
    const papers = [[cl[0]].concat(rest.slice(0, PER - 1)), [cl[1]].concat(rest.slice(PER - 1))];
    const split = function (p) {
      const st = stats(p);
      let c = Math.abs(st.marks - MARKS) * 4;
      [1, 2].forEach(function (d) {
        const lo = DOK_RANGE[d][0] * st.marks / 100, hi = DOK_RANGE[d][1] * st.marks / 100;
        c += Math.max(0, lo - st.dok[d], st.dok[d] - hi);
      });
      c += Math.max(0, 1 - st.strandQ.S) * 3 + Math.max(0, 2 - st.strandQ.G) * 3;
      return c;
    };
    now = split(papers[0]) + split(papers[1]);
    for (let step = 0; step < 400 && now > 0; step++) {
      const a = 1 + Math.floor(r() * (PER - 1)), b = 1 + Math.floor(r() * (PER - 1));   // never the claims (index 0)
      const x = papers[0][a], y = papers[1][b];
      papers[0][a] = y; papers[1][b] = x;
      const next = split(papers[0]) + split(papers[1]);
      if (next <= now) now = next;
      else { papers[0][a] = x; papers[1][b] = y; }
    }
    if (now > 0) return null;
    const out = { papers: papers.map(function (p) { return order(p, r); }) };
    return check(out) ? null : out;
  }

  // the order on a paper: mixed, roughly easy to hard; question 1 is DOK 1, the claim in the second half
  function order(list, r) {
    const keyed = list.map(function (q) { return { q: q, k: q.dok === 3 ? 2.6 + r() * 1.2 : q.dok + (r() - 0.5) * 1.7 }; });
    keyed.sort(function (a, b) { return a.k - b.k; });
    const out = keyed.map(function (x) { return x.q; });
    const first = out.findIndex(function (q) { return q.dok === 1; });
    if (first > 0) out.unshift(out.splice(first, 1)[0]);
    return out;
  }

  function plan(packs, opts) {
    opts = opts || {};
    const seed = (Number(opts.seed) >>> 0) || (Math.floor(Math.random() * 4294967295) >>> 0) || 7;
    const avoid = opts.avoid || {};
    const pool = poolOf(packs);
    const r = rng(seed);
    let got = null;
    for (let t = 0; t < 400 && !got; t++) got = tryOnce(pool, r, t < 300 ? avoid : {});
    if (!got) return null;
    // the set of numbers: random, and not the one this item had on the last try
    got.papers.forEach(function (p) {
      p.forEach(function (q, k) {
        let v = Math.floor(r() * q.sets);
        if (q.key in avoid && q.sets > 1 && v === avoid[q.key]) v = (v + 1 + Math.floor(r() * (q.sets - 1))) % q.sets;
        p[k] = { s: q.s, i: q.i, v: v, dok: q.dok, lo: q.lo, twm: q.twm, marks: q.marks, strand: q.strand };
      });
    });
    got.seed = seed;
    return got;
  }

  const code = function (q) { return q.s + '.' + q.i + '.' + q.v; };
  function fromCodes(packs, codes) {
    const pool = poolOf(packs), by = {};
    pool.forEach(function (q) { by[q.key] = q; });
    if (!Array.isArray(codes) || codes.length !== PAPERS) return null;
    const papers = codes.map(function (list) {
      return (Array.isArray(list) ? list : []).map(function (c) {
        const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(c)), q = m && by[m[1] + '.' + m[2]];
        return q ? { s: q.s, i: q.i, v: Math.min(Number(m[3]), q.sets - 1), dok: q.dok, lo: q.lo, twm: q.twm, marks: q.marks, strand: q.strand } : null;
      });
    });
    return papers.every(function (p) { return p.length === PER && p.every(Boolean); }) ? { papers: papers } : null;
  }

  T.summit = Object.assign(T.summit || {}, {
    plan: plan, check: check, stats: stats, code: code, fromCodes: fromCodes, pool: poolOf,
    PER: PER, MARKS: MARKS, PAPERS: PAPERS, DOK_RANGE: DOK_RANGE, STRAND_RANGE: STRAND_RANGE
  });
})(window.T = window.T || {});

