/* 08-g5-models-s3.js - Grade 5 question models for Stop 3: sequences and term rules. Counting on and back in equal
   steps with whole numbers, decimals and fractions, also through zero (6Nc.01); the position-to-term rule
   "multiply the position by k, then add or subtract c" (6Nc.03); sequences made from square numbers (6Nc.04).
   Every answer is worked out here from the numbers in the data. Numbers are exact: MX.Q keeps each one as a whole
   numerator over a whole denominator (a decimal is so many thousandths), so 0.1 + 0.2 is 0.3.

   A number in the data is: 7 | -4 (whole), '0.6' | '-1.25' (decimal, as text), '3/4' | '1 1/4' | '-1/2' (fraction, as text).

   scount     { a: '4.5', d: '-0.6', shown: 4, ask: 2, track?: true }   write the next term(s); track: with the sequence track
   sgap       { a, d, n: 6, gaps: [1, 4] }                     write the missing terms (gaps: indexes from 0)
   sstep      { a, d, n: 4, at, off?: 1 }                      tick the term-to-term rule ("subtract 0.4")
   sfit       { a: 7, to: 19, at: 5, unit?: 1 }                the 1st and the at-th term are given, the steps are equal: write
                                                               the terms between (with the track: set the step)
   sfracnext  { a: '1/4', d: '1/2', shown: 4, at }             a sequence with a fraction step: tick the next term
   sfractype  { a: '1/5', d: '2/5', shown: 3, den?: 5, pic?: true }   the same, typed as numerator over denominator (any equal
                                                               fraction is right); pic: with a picture of the track
   snth       { k: 7, c: 2, n: 20, shown: 4 }                  the sequence k x position + c: write the n-th term
   srule      { k, c, shown: 4, at }                           tick the position-to-term rule
   stable     { k, c, pos: [1, 2, 3, 4, 10], hide: [2, 4], say?: true }   complete the position / term table (say: the rule is
              { sq: [s, c], pos, hide, say? }                  given in words); sq: term = (position + s) x (position + s) + c
   sruleset   { k, c, n: 4, far?: 10 }                         build the rule with the table tool (srule) so that it fits every term
   spos       { k, c, term: 96, shown: 4 }                     which position has this term? (works backwards)
   sisin      { k, c, target: 73, shown: 4, at }               is the number in the sequence? yes or no, with the reason (tick)
   sqterm     { s: 0, c: 0, n: 9, shown: 4 }                   a square number sequence (position + s) squared + c: the n-th term
   sqrule     { s, c, shown: 4, at }                           tick the rule of a square number sequence
   sqpos      { s: 0, c: 0, term: 121, shown: 4 }              a square number sequence: which position has this term?
   sstory     { text: '... {a} ... {d} ... {n} ...', a, d, n, unit, start: 0 | 1 }   a two-step problem: start 0: the value
                                                               after n equal steps (a + n x d); start 1: a is term 1, find term n */
(function () {
"use strict";
const M = MX.M, D = MX.D, fmt = MX.fmt, arrange = MX.arrange, F = MX.F, FB = MX.FB, gcd = MX.gcd, lcm = MX.lcm;

/* ---------- exact numbers: whole numbers, decimals (thousandths) and fractions ---------- */
const kindOf = (a, b) => (a.k === "frac" || b.k === "frac" ? "frac" : a.k === "dec" || b.k === "dec" ? "dec" : "int");
const Q = {
  mk(n, d, k) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g, k: k }; },
  p(x) {
    if (x && typeof x === "object" && "n" in x) return x;
    if (typeof x === "number" && Number.isInteger(x)) return Q.mk(x, 1, "int");
    const s = String(x).replace(/−/g, "-").replace(/,/g, "").trim();
    const m = /^(-?)(?:(\d+) )?(\d+)\/(\d+)$/.exec(s);
    if (m) { const top = +(m[2] || 0) * +m[4] + +m[3]; return Q.mk(m[1] ? -top : top, +m[4], "frac"); }
    if (/^-?\d+$/.test(s)) return Q.mk(+s, 1, "int");
    const t = D.p(s);
    if (isNaN(t)) throw new Error("Q: not a number: " + x);
    return Q.mk(t, 1000, "dec");
  },
  add(a, b) { return Q.mk(a.n * b.d + b.n * a.d, a.d * b.d, kindOf(a, b)); },
  sub(a, b) { return Q.mk(a.n * b.d - b.n * a.d, a.d * b.d, kindOf(a, b)); },
  times(a, m) { return Q.mk(a.n * m, a.d, a.k); },
  over(a, m) { return Q.mk(a.n, a.d * m, a.k); },
  neg(a) { return Q.mk(-a.n, a.d, a.k); },
  abs(a) { return Q.mk(Math.abs(a.n), a.d, a.k); },
  eq(a, b) { return a.n * b.d === b.n * a.d; },
  cmp(a, b) { return Math.sign(a.n * b.d - b.n * a.d); },
  sign(a) { return Math.sign(a.n); },
  /* thousandths (a decimal or a whole number) */
  th(a) { if (1000 % a.d) throw new Error("Q: not a decimal: " + a.n + "/" + a.d); return a.n * (1000 / a.d); },
  isFrac(a) { return a.k === "frac" && a.d !== 1; },
  /* plain text: '−0.3', '1 3/4' */
  txt(a) {
    if (!Q.isFrac(a)) return D.s(Q.th(a));
    const t = Math.abs(a.n), w = Math.floor(t / a.d), r = t % a.d;
    return (a.n < 0 ? "−" : "") + (w ? w + " " : "") + r + "/" + a.d;
  },
  /* on the page: a fraction is drawn with a bar, a mixed number as 1 and 3/4 */
  html(a) {
    if (!Q.isFrac(a)) return D.s(Q.th(a));
    const t = Math.abs(a.n), w = Math.floor(t / a.d), r = t % a.d;
    return (a.n < 0 ? "−" : "") + (w ? String(w) : "") + F(r, a.d);
  },
  /* what a child types: '-0.3' */
  raw(a) { return D.s(Q.th(a)).replace(/,/g, "").replace("−", "-"); },
  /* the numerator when the fraction is written with denominator den */
  top(a, den) { if (den % a.d) throw new Error("Q: " + den + " is not a multiple of " + a.d); return a.n * (den / a.d); },
  /* how many decimal places the number needs */
  dp(a) { if (a.k !== "dec") return 0; const t = Math.abs(Q.th(a)) % 1000; return t === 0 ? 0 : t % 100 === 0 ? 1 : t % 10 === 0 ? 2 : 3; }
};
MX.Q = Q;

const ord = n => { const t = n % 100, u = n % 10; return n + (t >= 11 && t <= 13 ? "th" : u === 1 ? "st" : u === 2 ? "nd" : u === 3 ? "rd" : "th"); };
const seq = (a, st, n) => { const t = [a]; for (let i = 1; i < n; i++) t.push(Q.add(t[i - 1], st)); return t; };
const list = t => t.map(Q.html).join(", ");
const stepLab = st => (Q.sign(st) < 0 ? "− " : "+ ") + Q.html(Q.abs(st));
const stepRule = st => (Q.sign(st) < 0 ? "subtract " : "add ") + Q.html(Q.abs(st));
const NUMW = ["", "", "two", "three", "four"];
const sgn = v => (v < 0 ? "−" + fmt(-v) : fmt(v));
const typed = x => (x === "" || x == null ? null : (isNaN(D.p(x)) ? null : Q.mk(D.p(x), 1000, "dec")));
MX.s3 = { ord: ord, seq: seq, stepLab: stepLab };

/* the rule in words: "multiply the position by 3, then add 2" */
const ruleText = (k, c) => "multiply the position by " + fmt(k) + (c > 0 ? ", then add " + fmt(c) : c < 0 ? ", then subtract " + fmt(-c) : "");
/* the working: "10 × 3 = 30, 30 + 2 = 32" */
const ruleWork = (k, c, p) => fmt(p) + " × " + fmt(k) + " = " + fmt(p * k) + (c ? ". " + fmt(p * k) + (c > 0 ? " + " : " − ") + fmt(Math.abs(c)) + " = " + sgn(p * k + c) : "");
const sqText = (s, c) => (s ? "add " + s + " to the position, then multiply the answer by itself" : "multiply the position by itself") + (c > 0 ? ", then add " + c : c < 0 ? ", then subtract " + (-c) : "");
const sqVal = (s, c, p) => (p + s) * (p + s) + c;
const sqWork = (s, c, p) => (s ? p + " + " + s + " = " + (p + s) + ". " : "") + (p + s) + " × " + (p + s) + " = " + (p + s) * (p + s) + (c ? ". " + (p + s) * (p + s) + (c > 0 ? " + " : " − ") + Math.abs(c) + " = " + sqVal(s, c, p) : "");

/* ---------- 6Nc.01: count on and count back ---------- */

/* what went wrong in one term: want is right, prev is the term before it */
function countSlip(v, want, prev, st, t) {
  if (!v) return "Write a number in each box.";
  if (Q.eq(Q.neg(v), want)) return Q.sign(want) < 0 ? "This term is below zero. It needs a minus sign." : "This term is above zero. It has no minus sign.";
  if (Q.eq(v, Q.sub(prev, st))) return "The terms get " + (Q.sign(st) < 0 ? "smaller" : "bigger") + " here. Count " + (Q.sign(st) < 0 ? "back" : "on") + ".";
  if (Q.eq(Q.times(v, 10), want) && st.k === "dec") return "Think in tenths: " + Q.html(prev) + " " + stepLab(st) + ". The answer is not " + Q.html(v) + ". Line up the decimal points.";
  if (Q.eq(Q.sub(v, prev), Q.times(st, 10))) return "The step is " + Q.html(Q.abs(st)) + ", not " + Q.html(Q.abs(Q.times(st, 10))) + ". Look at the decimal point.";
  if (Q.eq(v, prev)) return "The sequence must change. Make one more step of " + Q.html(Q.abs(st)) + ".";
  return "Look at the step from " + Q.html(t[0]) + " to " + Q.html(t[1]) + ". Use the same step each time.";
}

M.scount = function (d, mode) {
  const a = Q.p(d.a), st = Q.p(d.d), n = d.shown + d.ask, t = seq(a, st, n), dp = Math.max(Q.dp(a), Q.dp(st));
  if (t.some(Q.isFrac)) throw new Error("scount: use sfracnext or sfractype for fractions");
  const zero = t.some(x => Q.sign(x) < 0) && t.some(x => Q.sign(x) > 0);
  const labs = t.slice(1).map(() => stepLab(st));
  const work = t.slice(d.shown).map((x, i) => Q.html(t[d.shown + i - 1]) + (Q.sign(st) < 0 ? " − " : " + ") + Q.html(Q.abs(st)) + " = " + Q.html(x)).join(". ");
  return {
    q: d.ask === 1 ? "Write the next [[term]] of the [[sequence]]." : "Write the next " + NUMW[d.ask] + " [[terms|term]] of the [[sequence]].",
    how: mode === "our" ? "Let's do it together. Find the step from " + Q.html(t[0]) + " to " + Q.html(t[1]) + ". Set it with − and +. Then tap <b>Hop</b>." : d.track ? "Set the step with − and +. Then tap Hop and write the terms." : "",
    ui: d.track ? { k: "strack", a: d.a, d: d.d, shown: d.shown, max: n, set: true } : null,
    right: d.track ? { step: Q.raw(st), n: n } : null,
    lines: [list(t.slice(0, d.shown)) + ", " + Array.from({ length: d.ask }, (x, i) => "{" + i + "}").join(", ")],
    blanks: Array.from({ length: d.ask }, () => ({ len: 5, w: "mid", neg: true, dec: dp })),
    check(r) {
      const vs = r.v.map(typed), parts = vs.map((v, i) => !!v && Q.eq(v, t[d.shown + i]));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: countSlip(vs[i], t[d.shown + i], t[d.shown + i - 1], st, t), parts: parts };
    },
    hint: { pic: d.track ? null : { k: "strack", a: d.a, d: d.d, n: d.shown, blanks: d.ask, labs: "first" },
      step: "From " + Q.html(t[0]) + " to " + Q.html(t[1]) + " is " + stepLab(st) + ". The rule is: " + stepRule(st) + " each time." },
    worked: { text: "The [[term-to-term rule]] is: " + stepRule(st) + " each time. " + work + "." + (zero ? " The terms go past zero: below zero they are negative numbers." : ""),
      pic: { k: "strack", a: d.a, d: d.d, n: n } },
    yes: "The rule is: " + stepRule(st) + " each time. " + list(t) + ".",
    key: t.slice(d.shown).map(Q.txt).join(" ; "), fill: t.slice(d.shown).map(Q.raw)
  };
};

M.sgap = function (d) {
  const a = Q.p(d.a), st = Q.p(d.d), t = seq(a, st, d.n), g = d.gaps.slice().sort((x, y) => x - y), dp = Math.max(Q.dp(a), Q.dp(st));
  if (t.some(Q.isFrac)) throw new Error("sgap: whole numbers and decimals only");
  const known = t.map((x, i) => g.indexOf(i) < 0), ks = known.map((x, i) => (x ? i : -1)).filter(i => i >= 0);
  /* the two known terms that are closest together */
  let p = ks[0], q = ks[1];
  for (let i = 1; i < ks.length; i++) if (ks[i] - ks[i - 1] < q - p) { p = ks[i - 1]; q = ks[i]; }
  if (q == null) throw new Error("sgap: two terms must be given");
  const gapN = q - p, diff = Q.sub(t[q], t[p]);
  const find = gapN === 1
    ? Q.html(t[p]) + " and " + Q.html(t[q]) + " are next to each other. The step between them is " + stepLab(st) + "."
    : "From " + Q.html(t[p]) + " to " + Q.html(t[q]) + " there are " + gapN + " equal steps. Together they make " + stepLab(diff) + ", so one step is " + stepLab(st) + ".";
  let k = 0;
  return {
    q: g.length > 1 ? "Write the missing [[terms|term]] of the [[sequence]]." : "Write the missing [[term]] of the [[sequence]].",
    sub: "The step is the same each time.",
    lines: [t.map((x, i) => (known[i] ? Q.html(x) : "{" + (k++) + "}")).join(", ")],
    blanks: g.map(() => ({ len: 5, w: "mid", neg: true, dec: dp })),
    check(r) {
      const vs = r.v.map(typed), parts = g.map((gi, i) => !!vs[i] && Q.eq(vs[i], t[gi]));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), v = vs[i], want = t[g[i]];
      if (v && Q.eq(Q.neg(v), want)) return { ok: false, msg: Q.sign(want) < 0 ? "This term is below zero. It needs a minus sign." : "This term is above zero. It has no minus sign.", parts: parts };
      return { ok: false, msg: gapN === 1 ? "Find two terms that are next to each other. The step between them is the rule." : "Count the steps from " + Q.html(t[p]) + " to " + Q.html(t[q]) + ": " + gapN + " equal steps. How big is one step?", parts: parts };
    },
    hint: { pic: { k: "strack", a: d.a, d: d.d, n: d.n, gaps: g, labs: "none" }, step: find },
    worked: { text: find + " The rule is: " + stepRule(st) + " each time. The sequence is " + list(t) + ".", pic: { k: "strack", a: d.a, d: d.d, n: d.n, mark: g } },
    yes: "The rule is: " + stepRule(st) + " each time. " + list(t) + ".",
    key: g.map(i => Q.txt(t[i])).join(" ; "), fill: g.map(i => Q.raw(t[i]))
  };
};

M.sstep = function (d) {
  const a = Q.p(d.a), st = Q.p(d.d), t = seq(a, st, d.n), up = Q.sign(st) > 0, ab = Q.abs(st);
  const other = st.k === "dec" ? Q.times(ab, 10) : st.k === "frac" ? Q.times(ab, 2) : Q.add(ab, Q.p(d.off || 1));
  const word = up ? "add " : "subtract ";
  const opts = arrange([
    { html: word + Q.html(ab), ok: true },
    { html: (up ? "subtract " : "add ") + Q.html(ab), ok: false, why: "The terms get " + (up ? "bigger" : "smaller") + ", so the rule is to " + (up ? "add" : "subtract") + "." },
    { html: word + Q.html(other), ok: false, why: "Check the step. From " + Q.html(t[0]) + " to " + Q.html(t[1]) + " is " + Q.html(ab) + ", not " + Q.html(other) + "." }], d.at);
  return {
    q: "What is the [[term-to-term rule]] of this [[sequence]]?", sum: list(t) + ", ...", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "strack", a: d.a, d: d.d, n: d.n, labs: "ask" }, step: "Work out the step from " + Q.html(t[0]) + " to " + Q.html(t[1]) + ". Check it with the next two terms." },
    worked: { text: "Each term is " + Q.html(ab) + (up ? " more" : " less") + " than the term before. The rule is: " + stepRule(st) + " each time.", pic: { k: "strack", a: d.a, d: d.d, n: d.n } },
    yes: "The rule is: " + stepRule(st) + " each time.", key: word + Q.txt(ab)
  };
};

/* the first and the last term are given, the steps are equal: the terms between */
M.sfit = function (d, mode) {
  const a = Q.p(d.a), to = Q.p(d.to), gaps = d.at - 1, diff = Q.sub(to, a), st = Q.over(diff, gaps), t = seq(a, st, d.at);
  if (t.some(Q.isFrac)) throw new Error("sfit: whole numbers and decimals only");
  const dp = Math.max(Q.dp(a), Q.dp(st)), mid = t.slice(1, -1), up = Q.sign(st) > 0;
  const neg = Q.sign(a) < 0 || Q.sign(to) < 0;
  const big = neg ? "From " + Q.html(a) + (up ? " up to " : " down to ") + Q.html(to) + " is " + Q.html(Q.abs(diff)) : (up ? Q.html(to) + " − " + Q.html(a) : Q.html(a) + " − " + Q.html(to)) + " = " + Q.html(Q.abs(diff));
  const share = Q.html(Q.abs(diff)) + " ÷ " + gaps + " = " + Q.html(Q.abs(st));
  return {
    q: "The 1st [[term]] of a [[sequence]] is <b>" + Q.html(a) + "</b>. The " + ord(d.at) + " term is <b>" + Q.html(to) + "</b>. The step is the same each time. Write the missing terms.",
    how: mode === "our" ? "Let's do it together. Change the step with − and + until the last hop lands on " + Q.html(to) + "." : "Change the step until the last hop lands on " + Q.html(to) + ". Then write the terms.",
    ui: { k: "strack", mode: "fit", a: d.a, to: d.to, at: d.at, unit: d.unit }, right: { step: Q.raw(st) },
    lines: [Q.html(a) + ", " + mid.map((x, i) => "{" + i + "}").join(", ") + ", " + Q.html(to)],
    blanks: mid.map(() => ({ len: 5, w: "mid", neg: true, dec: dp })),
    check(r) {
      const vs = r.v.map(typed), parts = mid.map((x, i) => !!vs[i] && Q.eq(vs[i], x));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      if (vs.every(Boolean)) {
        const all = [a].concat(vs), s0 = Q.sub(all[1], all[0]);
        if (all.every((x, i) => i === 0 || Q.eq(Q.sub(x, all[i - 1]), s0)) && !Q.eq(s0, st))
          return { ok: false, msg: "Your steps are equal, but the next term would be " + Q.html(Q.add(all[all.length - 1], s0)) + ", not " + Q.html(to) + ". Try a " + (Math.abs(s0.n * st.d) > Math.abs(st.n * s0.d) ? "smaller" : "bigger") + " step.", parts: parts };
      }
      return { ok: false, msg: "The steps must all be the same. From the 1st term to the " + ord(d.at) + " term there are " + gaps + " steps. Share " + Q.html(Q.abs(diff)) + " into " + gaps + " equal steps.", parts: parts };
    },
    hint: { pic: { k: "strack", a: d.a, d: Q.raw(st), n: d.at, gaps: mid.map((x, i) => i + 1), labs: "ask" },
      step: "There are " + gaps + " steps from " + Q.html(a) + " to " + Q.html(to) + ". " + big + ". Share it into " + gaps + " equal steps." },
    worked: { text: big + ". There are " + gaps + " equal steps: " + share + ". The rule is: " + stepRule(st) + " each time. The sequence is " + list(t) + ".",
      pic: { k: "strack", a: d.a, d: Q.raw(st), n: d.at } },
    yes: "The step is " + stepLab(st) + ". " + list(t) + ".",
    key: mid.map(Q.txt).join(" ; "), fill: mid.map(Q.raw)
  };
};

/* fractions: the next term, as options */
M.sfracnext = function (d) {
  const a = Q.p(d.a), st = Q.p(d.d), t = seq(a, st, d.shown + 2), right = t[d.shown], last = t[d.shown - 1];
  const den = lcm(lcm(a.d, st.d), last.d), up = Q.sign(st) > 0;
  /* slip 1: the tops are added and the bottoms are added too; slip 2: one step too many */
  const slipTop = Q.top(last, den) + Q.top(st, den), slip1 = Q.mk(slipTop, 2 * den, "frac"), slip2 = t[d.shown + 1];
  const cand = (up ? [slip1] : []).concat([slip2, Q.add(right, Q.mk(1, den, "frac")), Q.add(last, Q.times(st, 3))]);
  const wrong = []; cand.forEach(x => { if (wrong.length < 2 && !Q.eq(x, right) && Q.sign(x) >= 0 && !wrong.some(y => Q.eq(x, y)) && !t.slice(0, d.shown).some(y => Q.eq(x, y))) wrong.push(x); });
  const whyOf = x => (x === slip1 ? "Do not add the denominators. The parts stay the same size: " + F(Q.top(last, den), den) + " " + (up ? "+" : "−") + " " + F(Math.abs(Q.top(st, den)), den) + " = " + F(Q.top(right, den), den) + "."
    : x === slip2 ? "That is two steps on. Make only one step of " + Q.html(Q.abs(st)) + "."
      : "Check the step. From " + Q.html(t[0]) + " to " + Q.html(t[1]) + " is " + Q.html(Q.abs(st)) + ".");
  const opts = arrange([{ html: Q.html(right), alt: Q.txt(right), ok: true }].concat(wrong.map(x => ({ html: Q.html(x), alt: Q.txt(x), ok: false, why: whyOf(x) }))), d.at);
  const same = den !== st.d ? " Write " + Q.html(Q.abs(st)) + " as " + F(Math.abs(Q.top(st, den)), den) + " first." : "";
  return {
    q: "This [[sequence]] goes " + (up ? "up" : "down") + " in equal steps. Which number is the next [[term]]?", sum: list(t.slice(0, d.shown)) + ", ...", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "strack", a: d.a, d: d.d, n: d.shown, blanks: 1, labs: "first" }, step: "The step is " + stepLab(st) + "." + same + " Then " + (up ? "count on" : "count back") + " one step from " + Q.html(last) + "." },
    worked: { text: "The rule is: " + stepRule(st) + " each time. " + F(Q.top(last, den), den) + " " + (up ? "+" : "−") + " " + F(Math.abs(Q.top(st, den)), den) + " = " + F(Q.top(right, den), den) + (Q.html(right) !== F(Q.top(right, den), den) ? " = " + Q.html(right) : "") + ".",
      pic: { k: "strack", a: d.a, d: d.d, n: d.shown + 1, mark: [d.shown] } },
    yes: Q.html(last) + " " + stepLab(st) + " = " + Q.html(right) + ".", key: Q.txt(right)
  };
};

/* fractions: the next term, typed as numerator over denominator; every term is shown with the same denominator */
M.sfractype = function (d) {
  const a = Q.p(d.a), st = Q.p(d.d), t = seq(a, st, d.shown + 1), den = d.den || lcm(a.d, st.d), up = Q.sign(st) > 0;
  const tops = t.map(x => Q.top(x, den)), sTop = Math.abs(Q.top(st, den)), want = tops[d.shown], prev = tops[d.shown - 1];
  if (tops.some(x => x < 0)) throw new Error("sfractype: the terms must not go below zero");
  const fr = n => F(n, den);
  return {
    q: "Write the next [[term]] of the [[sequence]].",
    fig: d.pic ? { k: "strack", a: d.a, d: d.d, n: d.shown, blanks: 1, labs: "ask", den: den } : null, real: "",
    lines: [tops.slice(0, d.shown).map(fr).join(", ") + ", " + FB(0, 1)],
    blanks: [{ len: 3, w: "fr" }, { len: 3, w: "fr" }],
    check(r) {
      const n = r.v[0] === "" ? NaN : +r.v[0], b = r.v[1] === "" ? NaN : +r.v[1];
      if (!isNaN(n) && b > 0 && n * den === want * b) return { ok: true, parts: [true, true] };
      const parts = [n === want, b === den];
      if (n === want && b === 2 * den) return { ok: false, msg: "Do not add the denominators. The parts stay " + fr(1) + " each, so the denominator stays " + den + ".", parts: parts };
      if (n === want) return { ok: false, msg: "The numerator is right. The denominator stays " + den + ": the size of the parts does not change.", parts: parts };
      if (b === den && n === prev - (want - prev)) return { ok: false, msg: "The terms get " + (up ? "bigger" : "smaller") + " here. Count " + (up ? "on" : "back") + " " + fr(sTop) + ".", parts: parts };
      if (b === den) return { ok: false, msg: "Look at the numerators: " + tops.slice(0, d.shown).join(", ") + ". They go " + (up ? "up" : "down") + " by " + sTop + " each time.", parts: parts };
      return { ok: false, msg: "The step is " + (up ? "+ " : "− ") + fr(sTop) + ". Only the numerator changes. The denominator stays " + den + ".", parts: parts };
    },
    hint: { pic: { k: "strack", a: d.a, d: d.d, n: d.shown, blanks: 1, labs: "first", den: den }, step: "The step is " + (up ? "+ " : "− ") + fr(sTop) + ". The denominator stays " + den + ". Only the numerator changes." },
    worked: { text: "The rule is: " + (up ? "add " : "subtract ") + fr(sTop) + " each time. " + fr(prev) + (up ? " + " : " − ") + fr(sTop) + " = " + fr(want) + (Q.html(t[d.shown]) !== fr(want) ? ". That is the same as " + Q.html(t[d.shown]) : "") + ".",
      pic: { k: "strack", a: d.a, d: d.d, n: d.shown + 1, den: den, mark: [d.shown] } },
    yes: fr(prev) + (up ? " + " : " − ") + fr(sTop) + " = " + fr(want) + ".",
    key: want + "/" + den, fill: [String(want), String(den)]
  };
};

/* ---------- 6Nc.03: the position-to-term rule ---------- */
const lin = (k, c, n) => Array.from({ length: n }, (x, i) => k * (i + 1) + c);
const more = c => (c > 0 ? fmt(c) + " more than" : fmt(-c) + " less than");
const tableOf = (k, c, shown, n) => ({ k: "stable", pos: Array.from({ length: shown }, (x, i) => i + 1).concat(n > shown ? [n] : []), rule: { k: k, c: c } });

M.snth = function (d) {
  const k = d.k, c = d.c || 0, n = d.n, t = lin(k, c, d.shown), ans = k * n + c, last = t[t.length - 1];
  if (n <= d.shown) throw new Error("snth: ask for a term that is not shown");
  const why = "The terms go up in " + fmt(k) + "s, like the multiples of " + fmt(k) + ": " + lin(k, 0, 3).map(fmt).join(", ") + " ..." + (c ? " Each term is " + more(c) + " a multiple of " + fmt(k) + "." : "");
  const tb = tableOf(k, c, d.shown, n);
  return {
    q: "Find the <b>" + ord(n) + "</b> [[term]] of this [[sequence]].", sum: t.map(sgn).join(", ") + ", ...",
    lines: ["{0}"], blanks: [{ len: 5, w: "big" }],
    check(r) {
      const v = r.v[0] === "" ? NaN : +r.v[0];
      if (v === ans) return { ok: true };
      if (c && v === k * n) return { ok: false, msg: fmt(n) + " × " + fmt(k) + " = " + fmt(k * n) + " is the multiple of " + fmt(k) + ". Each term here is " + more(c) + " that.", parts: [false] };
      if (v === last + k) return { ok: false, msg: "That is the next term, the " + ord(d.shown + 1) + ". Use the position to jump to the " + ord(n) + " term.", parts: [false] };
      if (v === ans + k || v === ans - k) return { ok: false, msg: "That is the " + ord(v > ans ? n + 1 : n - 1) + " term. Multiply the position " + fmt(n) + " by " + fmt(k) + ".", parts: [false] };
      if (v === n + k || v === n + t[0]) return { ok: false, msg: "Do not add to the position. Multiply the position by " + fmt(k) + ".", parts: [false] };
      if (c && v === k * n - c) return { ok: false, msg: "Check the last step: the terms are " + more(c) + " the multiples of " + fmt(k) + ".", parts: [false] };
      return { ok: false, msg: "Find the rule. The terms go up in " + fmt(k) + "s, so multiply the position by " + fmt(k) + (c ? ". Then look at the 1st term to see what to add or subtract." : "."), parts: [false] };
    },
    hint: { pic: Object.assign({}, tb, { hide: [d.shown] }), step: why + " So: " + ruleText(k, c) + "." },
    worked: { text: why + " The [[position-to-term rule]] is: " + ruleText(k, c) + ". " + ruleWork(k, c, n) + ".", pic: Object.assign({}, tb, { hl: d.shown }) },
    yes: "The rule is: " + ruleText(k, c) + ". " + ruleWork(k, c, n) + ".",
    key: sgn(ans), fill: [String(ans)]
  };
};

M.srule = function (d) {
  const k = d.k, c = d.c || 0, t = lin(k, c, d.shown), a = t[0];
  const fits = f => t.every((x, i) => f(i + 1) === x);
  const bad = (text, f) => { const p = t.findIndex((x, i) => f(i + 1) !== x) + 1; return { html: text, f: f, ok: false, why: "Try position " + p + ": that rule gives " + sgn(f(p)) + ", but the " + ord(p) + " term is " + sgn(t[p - 1]) + "." }; };
  const wrong = c
    ? [bad("multiply the position by " + fmt(k), p => p * k),
      a > 1 && a !== k ? bad("multiply the position by " + fmt(a), p => p * a) : bad("multiply the position by " + fmt(k) + ", then add " + fmt(k), p => p * k + k)]
    : [bad("add " + fmt(k) + " to the position", p => p + k), bad("multiply the position by " + fmt(k) + ", then add " + fmt(k), p => p * k + k)];
  const opts = arrange([{ html: ruleText(k, c), f: p => p * k + c, ok: true }].concat(wrong), d.at);
  if (!fits(opts.find(o => o.ok).f) || wrong.some(o => fits(o.f))) throw new Error("srule: exactly one rule must fit");
  return {
    q: "Which [[position-to-term rule]] gives every [[term]] of this [[sequence]]?", sum: t.map(sgn).join(", ") + ", ...", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: tableOf(k, c, d.shown, 0), step: "Test each rule with position 1, then position 2, then position 3. The right rule gives every term." },
    worked: { text: t.slice(0, 3).map((x, i) => "Position " + (i + 1) + ": " + ruleWork(k, c, i + 1)).join(". ") + ". The rule is: " + ruleText(k, c) + ".", pic: { k: "smachine", rule: { k: k, c: c } } },
    yes: "The rule is: " + ruleText(k, c) + ". It gives " + t.map(sgn).join(", ") + ".",
    key: ruleText(k, c)
  };
};

/* complete the position / term table (a rule with k and c, or a square number rule) */
M.stable = function (d) {
  const sq = d.sq || null, k = d.k, c = sq ? sq[1] : d.c || 0, s = sq ? sq[0] : 0;
  const f = p => (sq ? sqVal(s, c, p) : k * p + c), text = sq ? sqText(s, c) : ruleText(k, c), work = p => (sq ? sqWork(s, c, p) : ruleWork(k, c, p));
  const hide = d.hide.slice().sort((x, y) => x - y), vals = d.pos.map(f);
  const spec = Object.assign({ k: "stable", pos: d.pos }, sq ? { sq: { s: s, c: c } } : { rule: { k: k, c: c } });
  const firstShown = d.pos.findIndex((p, i) => hide.indexOf(i) < 0);
  const find = sq
    ? "Compare the terms with the [[square numbers|square number]] 1, 4, 9, 16, ..." + (s ? " Position 1 is " + (1 + s) + " × " + (1 + s) + "." : "") + (c ? " Each term is " + more(c) + " a square number." : "")
    : "The terms go up in " + fmt(k) + "s, so multiply the position by " + fmt(k) + "." + (c ? " Position 1: 1 × " + fmt(k) + " = " + fmt(k) + ", but the term is " + sgn(k + c) + ". So " + (c > 0 ? "add " + fmt(c) : "subtract " + fmt(-c)) + "." : "");
  return {
    q: d.say ? "The [[rule]] of a [[sequence]] is: <b>" + text + "</b>. Complete the table." : "Complete the table for this [[sequence]].",
    ui: Object.assign({}, spec, { cells: hide }),
    blanks: hide.map(() => ({ len: 4, w: "tcell", neg: vals.some(v => v < 0) })), marks: hide.length > 1 ? 2 : 1,
    check(r) {
      const parts = hide.map((hi, i) => r.v[i] !== "" && +r.v[i] === vals[hi]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), p = d.pos[hide[i]], v = +r.v[i];
      const before = hide[i] > 0 ? vals[hide[i] - 1] : null;
      if (!sq && c && v === k * p) return { ok: false, msg: "Position " + p + ": " + p + " × " + fmt(k) + " = " + fmt(k * p) + ". Now " + (c > 0 ? "add " + fmt(c) : "subtract " + fmt(-c)) + ".", parts: parts };
      if (!sq && before != null && d.pos[hide[i]] - d.pos[hide[i] - 1] > 1 && v === before + k) return { ok: false, msg: "Position " + p + " does not come straight after position " + d.pos[hide[i] - 1] + ". Use the rule with the position " + p + ".", parts: parts };
      if (sq && v === 2 * (p + s)) return { ok: false, msg: "Multiply the number by itself, not by 2: " + (p + s) + " × " + (p + s) + ".", parts: parts };
      if (sq && (s || c) && v === p * p) return { ok: false, msg: p + " × " + p + " = " + p * p + " is the " + ord(p) + " square number. Now look at the rule of this sequence again.", parts: parts };
      return { ok: false, msg: "Look at position " + p + ". " + (d.say ? "Use the rule: " + text + "." : find), parts: parts };
    },
    hint: { pic: { k: "smachine", rule: sq ? null : { k: k, c: c }, sq: sq ? { s: s, c: c } : null, ask: !d.say }, step: d.say ? "Put each position into the rule: " + text + "." : find },
    worked: { text: (d.say ? "" : "The rule is: " + text + ". ") + hide.map(hi => "Position " + d.pos[hi] + ": " + work(d.pos[hi])).join(". ") + ".", pic: Object.assign({}, spec, { hl: hide[hide.length - 1] }) },
    yes: "The rule is: " + text + ". " + hide.map(hi => "Position " + d.pos[hi] + " → " + sgn(vals[hi])).join(", ") + ".",
    key: hide.map(hi => sgn(vals[hi])).join(" ; "), fill: hide.map(hi => String(vals[hi]))
  };
};

/* build the rule with the table tool */
M.sruleset = function (d, mode) {
  const k = d.k, c = d.c || 0, t = lin(k, c, d.n);
  if (k === 1 && c === 0) throw new Error("sruleset: the rule must differ from the start of the tool");
  return {
    q: "Build the [[position-to-term rule]] of this [[sequence]].", sum: t.map(sgn).join(", ") + ", ...",
    how: mode === "our" ? "Let's do it together. The terms go up in " + fmt(k) + "s. First make the rule <b>× " + fmt(k) + "</b>." + (c ? " Then add or subtract until every term fits." : "") : "Change the rule with − and + until it gives every term.",
    ui: { k: "srule", pos: t.map((x, i) => i + 1), rule: { k: k, c: c }, far: d.far || 0 }, right: { k: k, c: c, moved: true },
    ready: r => r.moved !== false,
    check(r) {
      if (r.k === k && r.c === c) return { ok: true };
      if (r.k !== k) return { ok: false, msg: "Look at the steps between the terms: they go up in " + fmt(k) + "s. So multiply the position by " + fmt(k) + "." };
      return { ok: false, msg: "× " + fmt(k) + " is right. Now look at position 1: 1 × " + fmt(k) + " = " + fmt(k) + ", but the term is " + sgn(t[0]) + ". Add or subtract to make it fit." };
    },
    given: r => "× " + r.k + (r.c < 0 ? " − " + (-r.c) : " + " + r.c),
    hint: { pic: { k: "strack", a: t[0], d: k, n: Math.min(d.n, 4), labs: "all" }, step: "The step from term to term is + " + fmt(k) + ". Repeated adding of " + fmt(k) + " is the same as multiplying by " + fmt(k) + "." },
    worked: { text: "The terms go up in " + fmt(k) + "s, so multiply the position by " + fmt(k) + ": " + lin(k, 0, d.n).map(fmt).join(", ") + "." + (c ? " Each term is " + more(c) + " that, so " + (c > 0 ? "add " + fmt(c) : "subtract " + fmt(-c)) + "." : "") + " The rule is: " + ruleText(k, c) + ".",
      pic: { k: "smachine", rule: { k: k, c: c } } },
    yes: "The rule is: " + ruleText(k, c) + ". It gives " + t.map(sgn).join(", ") + ".",
    key: ruleText(k, c)
  };
};

/* which position has this term? */
M.spos = function (d) {
  const k = d.k, c = d.c || 0, t = lin(k, c, d.shown), T0 = d.term, ans = (T0 - c) / k;
  if (!Number.isInteger(ans) || ans <= d.shown) throw new Error("spos: the term must be in the sequence, after the terms shown");
  const back = (c ? fmt(T0) + (c > 0 ? " − " : " + ") + fmt(Math.abs(c)) + " = " + fmt(T0 - c) + ". " : "") + fmt(T0 - c) + " ÷ " + fmt(k) + " = " + fmt(ans);
  return {
    q: "The number <b>" + fmt(T0) + "</b> is a [[term]] of this [[sequence]]. What is its [[position]]?", sum: t.map(sgn).join(", ") + ", ...",
    lines: ["position {0}"], blanks: [{ len: 4, w: "mid" }],
    check(r) {
      const v = r.v[0] === "" ? NaN : +r.v[0];
      if (v === ans) return { ok: true };
      if (v === T0 * k + c || v === T0 * k) return { ok: false, msg: fmt(T0) + " is the term, not the position. Work backwards from the term.", parts: [false] };
      if (!isNaN(v) && v >= 1) return { ok: false, msg: "Check with the rule: position " + fmt(v) + " gives " + sgn(k * v + c) + ", not " + fmt(T0) + ". Work backwards from " + fmt(T0) + ".", parts: [false] };
      return { ok: false, msg: "The rule is: " + ruleText(k, c) + ". Work backwards from " + fmt(T0) + ".", parts: [false] };
    },
    hint: { pic: { k: "smachine", rule: { k: k, c: c }, back: true }, step: "The rule is: " + ruleText(k, c) + ". Work backwards: " + (c ? (c > 0 ? "subtract " + fmt(c) : "add " + fmt(-c)) + ", then " : "") + "divide by " + fmt(k) + "." },
    worked: { text: "The rule is: " + ruleText(k, c) + ". Work backwards: " + back + ". Check: " + ruleWork(k, c, ans) + ".", pic: Object.assign(tableOf(k, c, d.shown, ans), { hl: d.shown }) },
    yes: fmt(T0) + " is the " + ord(ans) + " term: " + ruleWork(k, c, ans) + ".",
    key: String(ans), fill: [String(ans)]
  };
};

/* is the number in the sequence? yes or no, with the reason */
M.sisin = function (d) {
  const k = d.k, c = d.c || 0, N = d.target, t = lin(k, c, d.shown), last = t[t.length - 1], x = N - c, isIn = x % k === 0 && x / k >= 1, m = Math.floor(x / k);
  if (k < 2 || N <= last) throw new Error("sisin: the target must come after the terms shown");
  const shift = c > 0 ? fmt(N) + " − " + fmt(c) + " = " + fmt(x) : c < 0 ? fmt(N) + " + " + fmt(-c) + " = " + fmt(x) : "";
  const notMult = "The terms are not multiples of " + fmt(k) + ". Each term is " + more(c) + " a multiple of " + fmt(k) + ".";
  const jumps = "The sequence goes up in " + fmt(k) + "s. It jumps over many numbers, like " + fmt(last + 1) + ".";
  const dots = "The three dots (...) mean that the sequence goes on. Use the rule to test " + fmt(N) + ".";
  const list3 = [];
  if (isIn) {
    list3.push({ html: "Yes. " + (c ? shift + ", and " + fmt(x) : fmt(N)) + " = " + fmt(k) + " × " + fmt(m) + ". It is the " + ord(m) + " term.", ok: true });
    list3.push(c && N % k !== 0 ? { html: "No. " + fmt(N) + " is not a multiple of " + fmt(k) + ".", ok: false, why: notMult } : { html: "No. The sequence stops at " + sgn(last) + ".", ok: false, why: dots });
    list3.push({ html: "Yes. The sequence goes on for ever, so every big number is in it.", ok: false, why: jumps + " You must test " + fmt(N) + " with the rule." });
  } else {
    list3.push({ html: "No. " + (c ? shift + ", and " + fmt(x) : fmt(N)) + " is not a multiple of " + fmt(k) + ".", ok: true });
    list3.push(c && N % k === 0 ? { html: "Yes. " + fmt(N) + " is a multiple of " + fmt(k) + ": " + fmt(k) + " × " + fmt(N / k) + " = " + fmt(N) + ".", ok: false, why: notMult }
      : { html: "Yes. The sequence goes on for ever, so every big number is in it.", ok: false, why: jumps });
    list3.push({ html: "No. The sequence stops at " + sgn(last) + ".", ok: false, why: dots });
  }
  const opts = arrange(list3, d.at), lo = k * m + c, hi = lo + k;
  const rule = "The [[position-to-term rule]] is: " + ruleText(k, c) + ".";
  return {
    q: "Here is a [[sequence]]: <b>" + t.map(sgn).join(", ") + ", ...</b> It goes on in the same way. Is <b>" + fmt(N) + "</b> in the sequence? How do you know?",
    sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: tableOf(k, c, d.shown, 0), step: "Find the rule first. The terms go up in " + fmt(k) + "s. Compare them with the multiples of " + fmt(k) + ": " + lin(k, 0, d.shown).map(fmt).join(", ") + "." },
    worked: { text: rule + " Work backwards: " + (c ? shift + ". " : "") + (isIn ? fmt(x) + " ÷ " + fmt(k) + " = " + fmt(m) + ". So " + fmt(N) + " is the " + ord(m) + " term."
      : fmt(x) + " is not a multiple of " + fmt(k) + ": " + fmt(k) + " × " + fmt(m) + " = " + fmt(k * m) + " and " + fmt(k) + " × " + fmt(m + 1) + " = " + fmt(k * (m + 1)) + ". The terms near " + fmt(N) + " are " + sgn(lo) + " and " + sgn(hi) + "."),
      pic: { k: "smachine", rule: { k: k, c: c }, back: true } },
    yes: isIn ? fmt(N) + " is the " + ord(m) + " term: " + ruleWork(k, c, m) + "." : fmt(N) + " is not in the sequence. The terms near it are " + sgn(lo) + " and " + sgn(hi) + ".",
    key: (isIn ? "Yes" : "No") + ": " + String(opts.find(o => o.ok).html).replace(/^(Yes|No)\. /, "")
  };
};

/* ---------- 6Nc.04: sequences made from square numbers ---------- */
M.sqterm = function (d) {
  const s = d.s || 0, c = d.c || 0, n = d.n, t = Array.from({ length: d.shown }, (x, i) => sqVal(s, c, i + 1)), ans = sqVal(s, c, n), b = n + s;
  if (n <= d.shown) throw new Error("sqterm: ask for a term that is not shown");
  const base = Array.from({ length: Math.min(d.shown, 4) }, (x, i) => (i + 1 + s) + " × " + (i + 1 + s)).join(", ");
  const find = !s && !c ? "The terms are the [[square numbers|square number]]: " + base + " ..."
    : (c ? "Compare with the [[square numbers|square number]] " + Array.from({ length: Math.min(d.shown, 4) }, (x, i) => (i + 1 + s) * (i + 1 + s)).join(", ") + ": each term is " + more(c) + " a square number. " : "The terms are [[square numbers|square number]]: " + base + " ... ")
      + (s ? "The number that is squared is always " + s + " more than the position." : "The number that is squared is the position.");
  const tb = { k: "stable", pos: Array.from({ length: d.shown }, (x, i) => i + 1).concat([n]), sq: { s: s, c: c } };
  return {
    q: "This [[sequence]] is made from [[square numbers|square number]]. Find the <b>" + ord(n) + "</b> [[term]].", sum: t.map(sgn).join(", ") + ", ...",
    lines: ["{0}"], blanks: [{ len: 4, w: "big", neg: t.some(v => v < 0) }],
    check(r) {
      const v = r.v[0] === "" ? NaN : +r.v[0];
      if (v === ans) return { ok: true };
      if (v === 2 * b || v === 2 * n) return { ok: false, msg: "A square number is a number times itself, not times 2: " + b + " × " + b + ".", parts: [false] };
      if (s && v === n * n + c) return { ok: false, msg: n + " × " + n + " is not right here. Position 1 is " + (1 + s) + " × " + (1 + s) + ", so position " + n + " is " + b + " × " + b + ".", parts: [false] };
      if (c && v === b * b) return { ok: false, msg: b + " × " + b + " = " + b * b + " is the square number. Each term is " + more(c) + " a square number.", parts: [false] };
      if (v === sqVal(s, c, n - 1) || v === sqVal(s, c, n + 1)) return { ok: false, msg: "That is the " + ord(v > ans ? n + 1 : n - 1) + " term. For position " + n + " you need " + b + " × " + b + ".", parts: [false] };
      if (v === t[t.length - 1] + (t[t.length - 1] - t[t.length - 2])) return { ok: false, msg: "The steps are not equal here: they grow each time. Use square numbers.", parts: [false] };
      return { ok: false, msg: "The rule is: " + sqText(s, c) + ".", parts: [false] };
    },
    hint: { pic: Object.assign({}, tb, { hide: [d.shown] }), step: find },
    worked: { text: find + " Position " + n + ": " + sqWork(s, c, n) + ".", pic: Object.assign({}, tb, { hl: d.shown }) },
    yes: "The rule is: " + sqText(s, c) + ". " + sqWork(s, c, n) + ".",
    key: sgn(ans), fill: [String(ans)]
  };
};

/* a square number sequence: which position has this term? (works backwards: take away c, find the number times
   itself, take away s) */
M.sqpos = function (d) {
  const s = d.s || 0, c = d.c || 0, T0 = d.term, t = Array.from({ length: d.shown }, (x, i) => sqVal(s, c, i + 1));
  const x = T0 - c, b = Math.round(Math.sqrt(x)), ans = b - s;
  if (b * b !== x || ans <= d.shown || sqVal(s, c, ans) !== T0) throw new Error("sqpos: the term must be in the sequence, after the terms shown");
  const back = (c ? T0 + (c > 0 ? " − " : " + ") + Math.abs(c) + " = " + x + ". " : "") + b + " × " + b + " = " + x + (s ? ". " + b + " − " + s + " = " + ans : "");
  const find = (c ? "Each term is " + more(c) + " a square number. " : "") + (s ? "The number that is squared is " + s + " more than the position." : "The number that is squared is the position.");
  const tb = { k: "stable", pos: Array.from({ length: d.shown }, (x, i) => i + 1).concat([ans]), sq: { s: s, c: c } };
  return {
    q: "This [[sequence]] is made from [[square numbers|square number]]. The number <b>" + fmt(T0) + "</b> is a [[term]]. What is its [[position]]?", sum: t.map(sgn).join(", ") + ", ...",
    lines: ["position {0}"], blanks: [{ len: 4, w: "mid" }],
    check(r) {
      const v = r.v[0] === "" ? NaN : +r.v[0];
      if (v === ans) return { ok: true };
      if (v === T0) return { ok: false, msg: fmt(T0) + " is the term, not the position. Which number times itself makes " + fmt(x) + "?", parts: [false] };
      if (v * 2 === x) return { ok: false, msg: v + " × 2 = " + x + ". A square number is a number times itself, not times 2.", parts: [false] };
      if (s && v === b) return { ok: false, msg: b + " × " + b + " = " + x + " is right. But position 1 is " + (1 + s) + " × " + (1 + s) + ", so take away " + s + ".", parts: [false] };
      if (Number.isInteger(v) && v >= 1) return { ok: false, msg: "Check: position " + v + " gives " + sqWork(s, c, v).split(". ").pop() + ", not " + fmt(T0) + ".", parts: [false] };
      return { ok: false, msg: "Which number times itself makes " + fmt(x) + "?", parts: [false] };
    },
    hint: { pic: { k: "stable", pos: t.map((x, i) => i + 1), sq: { s: s, c: c } }, step: find + " Which number times itself makes " + fmt(x) + "?" },
    worked: { text: find + " Work backwards: " + back + ". So " + fmt(T0) + " is the " + ord(ans) + " term." + (s || c ? " Check: " + sqWork(s, c, ans) + "." : ""), pic: Object.assign({}, tb, { hl: d.shown }) },
    yes: fmt(T0) + " is the " + ord(ans) + " term: " + sqWork(s, c, ans) + ".",
    key: String(ans), fill: [String(ans)]
  };
};

M.sqrule = function (d) {
  const s = d.s || 0, c = d.c || 0, t = Array.from({ length: d.shown }, (x, i) => sqVal(s, c, i + 1));
  const k = t[1] - t[0], c2 = t[0] - k;
  const fits = f => t.every((x, i) => f(i + 1) === x);
  const bad = (text, f) => { const p = t.findIndex((x, i) => f(i + 1) !== x) + 1; return { html: text, f: f, ok: false, why: "Try position " + p + ": that rule gives " + sgn(f(p)) + ", but the " + ord(p) + " term is " + sgn(t[p - 1]) + "." }; };
  const wrong = [s || c ? bad(sqText(0, 0), p => p * p) : bad("multiply the position by 2", p => p * 2), bad(ruleText(k, c2), p => p * k + c2)];
  const opts = arrange([{ html: sqText(s, c), f: p => sqVal(s, c, p), ok: true }].concat(wrong), d.at);
  if (wrong.some(o => fits(o.f))) throw new Error("sqrule: exactly one rule must fit");
  return {
    q: "Which [[rule]] gives every [[term]] of this [[sequence]] from its [[position]]?", sum: t.map(sgn).join(", ") + ", ...", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "stable", pos: t.map((x, i) => i + 1), sq: { s: s, c: c } }, step: "The steps between the terms grow: " + t.slice(1).map((x, i) => "+ " + (x - t[i])).join(", ") + ". So think about [[square numbers|square number]]. Test each rule with positions 1, 2 and 3." },
    worked: { text: t.slice(0, 3).map((x, i) => "Position " + (i + 1) + ": " + sqWork(s, c, i + 1)).join(". ") + ". The rule is: " + sqText(s, c) + ".", pic: { k: "smachine", sq: { s: s, c: c } } },
    yes: "The rule is: " + sqText(s, c) + ".", key: sqText(s, c)
  };
};

/* ---------- a two-step problem with equal steps ---------- */
M.sstory = function (d) {
  const a = Q.p(d.a), st = Q.p(d.d), n = d.n, steps = d.start === 1 ? n - 1 : n, grow = Q.times(st, steps), ans = Q.add(a, grow), up = Q.sign(st) > 0;
  if (Q.isFrac(ans)) throw new Error("sstory: whole numbers and decimals only");
  const dp = Math.max(Q.dp(a), Q.dp(st)), ab = Q.abs(st);
  const text = d.text.replace("{a}", "<b>" + Q.html(a) + "</b>").replace("{d}", "<b>" + Q.html(ab) + "</b>").replace("{n}", "<b>" + fmt(n) + "</b>");
  const work = steps + " × " + Q.html(ab) + " = " + Q.html(Q.abs(grow)) + ". " + Q.html(a) + (up ? " + " : " − ") + Q.html(Q.abs(grow)) + " = " + Q.html(ans);
  const off = Q.add(a, Q.times(st, d.start === 1 ? n : n - 1));
  return {
    q: text, lines: ["{0} " + d.unit], blanks: [{ len: 6, w: "big", neg: Q.sign(ans) < 0, dec: dp }],
    check(r) {
      const v = typed(r.v[0]);
      if (v && Q.eq(v, ans)) return { ok: true };
      if (v && Q.sign(ans) < 0 && Q.eq(Q.neg(v), ans)) return { ok: false, msg: "The answer is below zero. It needs a minus sign.", parts: [false] };
      if (v && Q.eq(v, Q.abs(grow))) return { ok: false, msg: "That is how much it changes in " + steps + " steps. Now " + (up ? "add it to" : "take it away from") + " the start, " + Q.html(a) + ".", parts: [false] };
      if (v && Q.eq(v, off)) return { ok: false, msg: d.start === 1 ? "Count the steps: from number 1 to number " + n + " there are " + steps + " steps, not " + n + "." : "Count the steps: there are " + steps + " steps of " + Q.html(ab) + ".", parts: [false] };
      if (v && Q.eq(v, Q.add(a, st))) return { ok: false, msg: "That is only one step. There are " + steps + " equal steps.", parts: [false] };
      if (v && Q.eq(v, Q.sub(a, grow))) return { ok: false, msg: "Read again: does the number get bigger or smaller each time?", parts: [false] };
      return { ok: false, msg: "Two steps: first work out " + steps + " × " + Q.html(ab) + ". Then " + (up ? "add it to " : "take it away from ") + Q.html(a) + ".", parts: [false] };
    },
    hint: { pic: { k: "strack", a: d.a, d: d.d, n: 3, blanks: 1, labs: "all" }, step: "The same step happens " + steps + " times. Multiply: " + steps + " × " + Q.html(ab) + ". Then " + (up ? "add the answer to " : "take the answer away from ") + Q.html(a) + "." },
    worked: { text: (d.start === 1 ? "From number 1 to number " + n + " there are " + steps + " steps. " : "") + work + ". The answer is " + Q.html(ans) + " " + d.unit + "." },
    yes: work + ".", key: Q.txt(ans), fill: [Q.raw(ans)]
  };
};
})();

