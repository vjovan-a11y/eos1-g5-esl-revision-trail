/* 08-g5-models-s4.js - Grade 5 question models for Stop 4: common multiples and common factors (6Ni.06).
   Every list and every answer is worked out here from the two numbers in the data: the multiples, the factors, the
   common ones, the lowest common multiple (MX.lcm, checked again by counting on) and the highest common factor
   (MX.gcd, checked again from the two factor lists). A set of numbers that does not fit its model throws, so it
   never reaches a child (test/check.mjs reports it).

   cmmark    { a, b, upto, box? }          the two lists of multiples (tool clist): tap the numbers in both lists;
                                           box: then write the lowest common multiple
   cfmark    { a, b, box? }                the two lists of factors: tap the numbers in both; box: write the HCF
   cmpick    { a, b, nums }                a ring around all the common multiples of a and b (rings, tool cpick)
   cfpick    { a, b, nums }                a ring around all the common factors of a and b
   csort     { kind: 'mult' | 'fact', a, b, n, upto? }   two rings that cross: where does n go? (A, B, C or D)
   fmrel     { x, y }                      "x is a ___ of y": factor, multiple, or neither
   mlist     { k, n: 5 }                   write the first n multiples of k (one box each)
   flist     { n }                         write all the factors of n, smallest first (one box each, 10 at most)
   fmiss     { who, he, n, shown }         a factor list that stops too early: write the factors that are missing
   lcm       { a, b }                      write the lowest common multiple
   hcf       { a, b }                      write the highest common factor
   cmrange   { a, b, lo, hi }              a number between lo and hi that is a multiple of both a and b
   cset      { kind: 'cm' | 'cf', a, b, opts: [[..], [..], [..]], at }   which list has ONLY common multiples / ALL
                                           the common factors? (opts[0] must be the right list)
   lcmstory  { text, a, b, unit, tool?, names? }   a real-life problem: the answer is the lowest common multiple
                                           tool: the two lists are on the desk as a help (names: their two titles)
   hcfstory  { text, a, b, unit, tool?, names? }   a real-life problem: the answer is the highest common factor
   twostep   { kind: 'packs' | 'each', text, a, b, unit, things: [first, second], groups?: 'bags' }   two steps: packs: how many
                                           packs altogether (LCM / a + LCM / b); each: how many in each group
                                           ((a + b) / HCF)
   cfix      { who, he, kind: 'lcm' | 'hcf', a, b, slip, at }   spot the mistake: (a) tick what went wrong, (b) write
                                           the right answer. slip for lcm: 'product' (wrote a x b), 'hcf' (wrote the
                                           HCF); for hcf: 'low' (wrote the smallest common factor above 1), 'lcm' */
(function () {
"use strict";
const M = MX.M, fmt = MX.fmt, arrange = MX.arrange, cap = MX.cap, LET = MX.LET;
const X = "×", DIV = "÷";
const NUMW = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/* ---------- the numbers ---------- */
const mults = (k, upto) => { const o = []; for (let v = k; v <= upto; v += k) o.push(v); return o; };
const facts = n => { const o = []; for (let v = 1; v <= n; v++) if (n % v === 0) o.push(v); return o; };
const pairs = n => { const o = []; for (let x = 1; x * x <= n; x++) if (n % x === 0) o.push([x, n / x]); return o; };
const both = (p, q) => p.filter(v => q.indexOf(v) >= 0);
const list = a => a.map(fmt).join(", ");
const and = a => (a.length < 2 ? list(a) : list(a.slice(0, -1)) + " and " + fmt(a[a.length - 1]));
const num = s => (/^\d+$/.test(String(s == null ? "" : s)) ? +s : NaN);
const pairText = n => pairs(n).map(p => p[0] + " " + X + " " + p[1]).join(", ");
const need = (ok, why) => { if (!ok) throw new Error(why); };

/* the lowest common multiple: MX.lcm, and again by counting on in the bigger number */
function LCM(a, b) {
  const L = MX.lcm(a, b), big = Math.max(a, b);
  let v = big; while (v % a !== 0 || v % b !== 0) v += big;
  need(v === L && a !== b && a > 1 && b > 1, "lcm of " + a + " and " + b);
  return L;
}
/* the highest common factor: MX.gcd, and again as the last number in both factor lists */
function HCF(a, b) {
  const g = MX.gcd(a, b), c = both(facts(a), facts(b));
  need(c[c.length - 1] === g && a !== b && a > 1 && b > 1, "hcf of " + a + " and " + b);
  return g;
}

/* why v is not a common multiple of a and b ('' when it is one) */
function notCM(v, a, b) {
  const ma = v % a === 0, mb = v % b === 0, big = Math.max(a, b);
  if (ma && mb) return "";
  if (ma) return fmt(v) + " is a multiple of " + a + " (" + v / a + " " + X + " " + a + "), but it is not a multiple of " + b + ".";
  if (mb) return fmt(v) + " is a multiple of " + b + " (" + v / b + " " + X + " " + b + "), but it is not a multiple of " + a + ".";
  if (a % v === 0 || b % v === 0) return v + " is a factor of " + (a % v === 0 ? a : b) + ", not a multiple. A common multiple of " + a + " and " + b + " is " + big + " or more.";
  return fmt(v) + " is not a multiple of " + a + " or of " + b + ".";
}
/* why v is not a common factor of a and b ('' when it is one) */
function notCF(v, a, b) {
  const fa = a % v === 0, fb = b % v === 0;
  if (fa && fb) return "";
  if (fa) return v + " is a factor of " + a + ", but " + b + " " + DIV + " " + v + " is not exact. So it is not a factor of " + b + ".";
  if (fb) return v + " is a factor of " + b + ", but " + a + " " + DIV + " " + v + " is not exact. So it is not a factor of " + a + ".";
  if (v % a === 0 || v % b === 0) { const n = v % a === 0 ? a : b; return fmt(v) + " is a multiple of " + n + ", not a factor. A factor of " + n + " is never bigger than " + n + "."; }
  return v + " is not a factor of " + a + " or of " + b + ".";
}

/* a wrong answer for the lowest common multiple of a and b */
function lcmSlip(a, b, v) {
  const big = Math.max(a, b), small = Math.min(a, b);
  if (isNaN(v) || v < 1) return "Write a number. Count on in " + big + "s: " + list(mults(big, big * 3)) + " ...";
  if (v % a === 0 && v % b === 0) return (v === a * b ? a + " " + X + " " + b + " = " + fmt(v) : fmt(v)) + " is a common multiple, but it is not the lowest. Look for a smaller number in both lists.";
  if (a % v === 0 && b % v === 0) return v + " is a common factor: it divides " + a + " and " + b + ". A common multiple is in both times tables, so it is " + big + " or more.";
  if (v === a + b) return "Do not add the two numbers. List the multiples of " + a + " and the multiples of " + b + ".";
  if (v % a === 0 || v % b === 0) return notCM(v, a, b) + " It must be in both lists.";
  return "Count on in " + big + "s: " + big + ", " + 2 * big + " ... Stop at the first number that is also a multiple of " + small + ".";
}
/* a wrong answer for the highest common factor of a and b */
function hcfSlip(a, b, v) {
  if (isNaN(v) || v < 1) return "Write a number. List the factors of " + a + " and of " + b + " in pairs.";
  if (a % v === 0 && b % v === 0) return v === 1 ? "1 is a common factor of every pair of whole numbers. But here there is a bigger one. Look at both lists."
    : v + " is a common factor, but it is not the highest. Look for a bigger number in both lists.";
  if (v % a === 0 && v % b === 0) return fmt(v) + " is a common multiple. A factor of " + a + " is never bigger than " + a + ". List the factors.";
  if (a % v === 0 || b % v === 0) return notCF(v, a, b) + " It must be in both lists.";
  return "List the factors of " + a + " and of " + b + " in pairs. Then find the biggest number that is in both lists.";
}

/* how far the two lists of multiples go in a picture: 2 x the LCM when both lists stay short, else the LCM */
const span = (a, b, L) => (L * 2 / Math.min(a, b) <= 12 ? L * 2 : L);
const listPic = (kind, a, b, upto, more) => Object.assign({ k: "clist", kind: kind, a: a, b: b }, kind === "mult" ? { upto: upto } : {}, more || {});
const marksOf = r => String((r && r.marked) || "").split(",").filter(x => x !== "").map(Number);

/* ---------- Draw it: tap the numbers that are in both lists ---------- */
function markTask(kind, d, mode) {
  const a = d.a, b = d.b, mult = kind === "mult";
  const key = mult ? LCM(a, b) : HCF(a, b), upto = mult ? d.upto || span(a, b, key) : 0;
  const A = mult ? mults(a, upto) : facts(a), B = mult ? mults(b, upto) : facts(b), com = both(A, B);
  need(com.length > 0 && (mult ? com[0] : com[com.length - 1]) === key, "the lists of " + a + " and " + b + " hold no common number");
  need(A.length <= 12 && B.length <= 12, "a list of " + a + " and " + b + " is too long");
  const word = mult ? "multiple" : "factor", name = mult ? "lowest common multiple" : "highest common factor";
  const ex = mult ? "multiples of " + a + ": " + list(A) + ". Multiples of " + b + ": " + list(B)
    : "factors of " + a + ": " + list(A) + ". Factors of " + b + ": " + list(B);
  const task = {
    q: "Tap every [[common " + word + "]] of <b>" + a + "</b> and <b>" + b + "</b>: the numbers that are in <b>both</b> lists." + (d.box ? " Then write the [[" + name + "]]." : ""),
    how: mode === "our" ? "Let's do it together. Take a number from the first list. Is it in the second list too? Then tap it." : "A common " + word + " is in both lists. Tap each one.",
    ui: listPic(kind, a, b, upto), right: { marked: com.join(",") },
    ready: r => marksOf(r).length > 0 && (!d.box || (Array.isArray(r.v) && r.v[0] !== "")),
    check(r) {
      const picks = marksOf(r), bad = picks.filter(v => com.indexOf(v) < 0), miss = com.filter(v => picks.indexOf(v) < 0);
      const v = d.box ? num(r.v[0]) : key, vOk = v === key, parts = d.box ? [vOk] : [];
      if (!bad.length && !miss.length && vOk) return { ok: true, parts: parts };
      if (bad.length) return { ok: false, msg: fmt(bad[0]) + " is in one list only. A common " + word + " must be in both lists.", parts: parts };
      if (miss.length) return { ok: false, msg: "Your marks are right. But " + (miss.length === 1 ? "one more number is" : "more numbers are") + " in both lists. Check every number." + (!mult && miss[0] === 1 ? " Do not forget 1." : ""), parts: parts };
      return { ok: false, msg: mult ? lcmSlip(a, b, v) : hcfSlip(a, b, v), parts: parts };
    },
    hint: { step: mult ? "Say the multiples of " + b + ": " + list(B) + ". Which of them are also in the list for " + a + "?"
      : "Go along the list for " + a + ". Does each number divide " + b + " exactly too? Start with 1." },
    worked: { text: cap(ex) + ". In both lists: " + and(com) + "." + (d.box ? " The " + (mult ? "lowest" : "highest") + " is " + key + "." : ""),
      pic: listPic(kind, a, b, upto, { marked: "all", hl: d.box ? (mult ? "low" : "high") : "" }) },
    yes: (com.length === 1 ? fmt(com[0]) + " is" : and(com) + " are") + " in both lists." + (d.box ? " The " + name + " is " + key + "." : ""),
    key: com.join(" ; ") + (d.box ? " ; " + name + " " + key : ""),
    given: r => marksOf(r).join(" ") + (r.v ? " | " + r.v.join(" ") : "")
  };
  if (d.box) { task.lines = [cap(name) + " = {0}"]; task.blanks = [{ len: 3, w: "big" }]; task.fill = [String(key)]; }
  return task;
}
M.cmmark = (d, mode) => markTask("mult", d, mode);
M.cfmark = (d, mode) => markTask("fact", d, mode);

/* ---------- a ring around every common multiple / common factor ---------- */
function pickTask(kind, d) {
  const a = d.a, b = d.b, mult = kind === "mult", key = mult ? LCM(a, b) : HCF(a, b);
  const isOk = v => (mult ? v % a === 0 && v % b === 0 : a % v === 0 && b % v === 0);
  const good = d.nums.filter(isOk).sort((x, y) => x - y), word = mult ? "multiple" : "factor";
  need(good.length > 0 && good.length < d.nums.length, "the numbers must hold some common " + word + "s, not all");
  const why = v => (mult ? notCM(v, a, b) : notCF(v, a, b));
  const tell = v => (mult ? fmt(v) + " = " + v / a + " " + X + " " + a + " = " + v / b + " " + X + " " + b : a + " " + DIV + " " + v + " = " + a / v + " and " + b + " " + DIV + " " + v + " = " + b / v);
  return {
    q: "Put a ring around <b>all</b> the [[common " + word + "s|common " + word + "]] of <b>" + a + "</b> and <b>" + b + "</b>.",
    sub: "Tap a number to put a ring around it. Tap it again to rub the ring out.",
    ui: { k: "cpick", nums: d.nums }, right: { picks: good },
    ready: r => Array.isArray(r.picks) && r.picks.length > 0,
    check(r) {
      const bad = r.picks.filter(v => good.indexOf(v) < 0), miss = good.filter(v => r.picks.indexOf(v) < 0);
      if (!bad.length && !miss.length) return { ok: true };
      if (bad.length) return { ok: false, msg: why(bad[0]), parts: bad };
      return { ok: false, msg: !mult && miss.indexOf(1) >= 0 ? "Do not forget 1. It is a factor of every number, so it is a common factor too."
        : "Your " + (r.picks.length === 1 ? "ring is" : "rings are") + " right. But there are more common " + word + "s. Check every number.", parts: [] };
    },
    hint: { pic: mult ? null : listPic("fact", a, b, 0),
      step: mult ? "Check each number two times. Is it in the " + a + " times table? Is it in the " + b + " times table?" : "A common factor divides " + a + " exactly and divides " + b + " exactly." },
    worked: { text: (mult ? "A common multiple is in both times tables. " : "A common factor divides both numbers exactly. ") + good.map(tell).join(". ") + ". " + d.nums.filter(v => !isOk(v)).map(why).join(" "),
      pic: mult ? null : listPic("fact", a, b, 0, { marked: "all" }) },
    yes: and(good) + (good.length === 1 ? " is a common " + word : " are common " + word + "s") + " of " + a + " and " + b + ".",
    key: good.join(" ; ")
  };
}
M.cmpick = d => pickTask("mult", d);
M.cfpick = d => pickTask("fact", d);

/* ---------- two rings that cross: where does the number go? ---------- */
M.csort = function (d) {
  const a = d.a, b = d.b, n = d.n, mult = d.kind !== "fact", word = mult ? "multiple" : "factor";
  const inA = mult ? n % a === 0 : a % n === 0, inB = mult ? n % b === 0 : b % n === 0;
  const where = inA && inB ? 1 : inA ? 0 : inB ? 2 : 3, ring = k => word + "s of " + k;
  const fits = (k, yes) => (mult ? (yes ? fmt(n) + " = " + n / k + " " + X + " " + k + ", so it is a multiple of " + k : fmt(n) + " is not in the " + k + " times table")
    : (yes ? k + " " + DIV + " " + n + " = " + k / n + ", so " + n + " is a factor of " + k : k + " " + DIV + " " + n + " is not exact, so " + n + " is not a factor of " + k));
  const facts2 = cap(fits(a, inA)) + ". " + cap(fits(b, inB)) + ".";
  const place = [cap(ring(a)) + " only", "Both rings", cap(ring(b)) + " only", "Outside both rings"];
  const opts = place.map((t, i) => ({ html: t, ok: i === where, why: i === where ? "" : facts2 }));
  const upto = mult ? d.upto || span(a, b, MX.lcm(a, b)) : 0;
  return {
    q: "Look at the two rings. Where does <b>" + fmt(n) + "</b> go?", sub: "Tick (✓) one box.", letters: true,
    fig: { k: "venn", kind: mult ? "mult" : "fact", a: a, b: b, upto: upto, letters: true }, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Now find its place." }; },
    hint: { pic: listPic(mult ? "mult" : "fact", a, b, Math.max(upto, n)),
      step: "Ask two questions. Is " + fmt(n) + " a " + word + " of " + a + "? Is " + fmt(n) + " a " + word + " of " + b + "?" },
    worked: { text: facts2 + " So " + fmt(n) + " goes in " + LET[where] + ": " + ["only in the ring for " + ring(a), "where the two rings cross", "only in the ring for " + ring(b), "outside both rings"][where] + ".",
      pic: { k: "venn", kind: mult ? "mult" : "fact", a: a, b: b, upto: Math.max(upto, mult ? n : 0) } },
    yes: facts2, key: LET[where] + ": " + place[where]
  };
};

/* ---------- factor or multiple? ---------- */
M.fmrel = function (d) {
  const x = d.x, y = d.y;
  need(x !== y && x > 1 && y > 1, "fmrel: two different numbers above 1");
  const where = y % x === 0 ? 0 : x % y === 0 ? 1 : 2;
  const tell = where === 0 ? x + " " + X + " " + y / x + " = " + y + ". So " + x + " is a factor of " + y + ", and " + y + " is a multiple of " + x + "."
    : where === 1 ? y + " " + X + " " + x / y + " = " + x + ". So " + x + " is in the " + y + " times table: it is a multiple of " + y + "."
    : x + " does not divide " + y + " exactly, and " + x + " is not in the " + y + " times table. So it is not a factor and not a multiple of " + y + ".";
  const whys = [where === 1 ? "A factor of " + y + " is never bigger than " + y + ". " + x + " is in the " + y + " times table." : y + " " + DIV + " " + x + " is not exact. So " + x + " is not a factor of " + y + ".",
    where === 0 ? "A multiple of " + y + " is " + y + " or more: " + list(mults(y, y * 3)) + " ... " + x + " is smaller than " + y + "." : x + " is not in the " + y + " times table: " + list(mults(y, y * 3)) + " ...",
    where === 0 ? x + " " + X + " " + y / x + " = " + y + ". So " + x + " divides " + y + " exactly." : y + " " + X + " " + x / y + " = " + x + ". So " + x + " is in the " + y + " times table."];
  const opts = ["factor", "multiple", "not a factor and not a multiple"].map((t, i) => ({ html: t, ok: i === where, why: i === where ? "" : whys[i] }));
  return {
    q: "Choose the word or words that fit. <b>" + x + "</b> is a ______ of <b>" + y + "</b>.", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "A factor of " + y + " divides " + y + " exactly. A multiple of " + y + " is in the " + y + " times table: " + list(mults(y, y * 3)) + " ..." },
    worked: { text: tell }, yes: tell, key: opts[where].html
  };
};

/* ---------- lists: the first multiples, all the factors ---------- */
const boxes = n => Array.from({ length: n }, (x, i) => "{" + i + "}").join(" ");

M.mlist = function (d) {
  const k = d.k, n = d.n || 5, want = mults(k, k * n);
  need(n >= 2 && n <= 8 && k > 1, "mlist: 2 to 8 multiples");
  return {
    q: "Write the first <b>" + NUMW[n] + "</b> [[multiples|multiple]] of <b>" + k + "</b>.",
    lines: [boxes(n)], blanks: want.map(() => ({ len: 3, w: "s4" })),
    check(r) {
      const vs = r.v.map(num), parts = want.map((x, i) => vs[i] === x);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      let msg;
      if (vs[0] === 0) msg = "Start with " + k + ": 1 " + X + " " + k + " = " + k + ".";
      else if (vs[0] > 0 && vs[0] < k && k % vs[0] === 0) msg = vs[0] + " is a factor of " + k + ". The multiples of " + k + " are in the " + k + " times table: " + k + ", " + 2 * k + " ...";
      else if (vs[0] === want[1]) msg = "Do not forget " + k + " itself. It is the first multiple: 1 " + X + " " + k + " = " + k + ".";
      else if (i === 0) msg = "The first multiple of " + k + " is " + k + " itself: 1 " + X + " " + k + " = " + k + ".";
      else msg = "Count on in " + k + "s. " + want[i - 1] + " + " + k + " = ?";
      return { ok: false, msg: msg, parts: parts };
    },
    hint: { pic: { k: "hops", terms: want.slice(0, 2), blanks: n - 2, labs: want.slice(1).map(() => "+ " + k) }, step: "Multiples of " + k + " go up in " + k + "s. Start at " + k + "." },
    worked: { text: want.map((v, i) => (i + 1) + " " + X + " " + k + " = " + v).join(". ") + ".", pic: { k: "hops", terms: want, labs: want.slice(1).map(() => "+ " + k) } },
    yes: "The first " + NUMW[n] + " multiples of " + k + " are " + and(want) + ".", key: want.join(" ; "), fill: want.map(String)
  };
};

M.flist = function (d) {
  const n = d.n, want = facts(n), ps = pairs(n);
  need(want.length >= 3 && want.length <= 10, "flist: 3 to 10 factors");
  return {
    q: "Write <b>all</b> the [[factors|factor]] of <b>" + n + "</b>. Start with the smallest.",
    lines: [boxes(want.length)], blanks: want.map(() => ({ len: 2, w: "s4" })),
    check(r) {
      const vs = r.v.map(num), parts = want.map((x, i) => vs[i] === x);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const typed = vs.filter(v => !isNaN(v)), notF = typed.filter(v => v < 1 || n % v !== 0)[0];
      let msg;
      if (notF != null) msg = notF + " is not a factor of " + n + ": " + n + " " + DIV + " " + notF + " is not exact.";
      else if (typed.indexOf(1) < 0) msg = "Do not forget 1. It is a factor of every number: 1 " + X + " " + n + " = " + n + ".";
      else if (typed.indexOf(n) < 0) msg = "Do not forget " + n + " itself. " + n + " " + X + " 1 = " + n + ", so " + n + " is a factor of " + n + ".";
      else if (new Set(typed).size < typed.length) msg = "Write each factor only once. Use factor pairs to find the ones you missed.";
      else msg = "All your numbers are factors. Now put them in order, smallest first.";
      return { ok: false, msg: msg, parts: parts };
    },
    hint: { pic: { k: "frain", n: n, hide: want.slice(1, -1) }, step: "Work in factor pairs, so you do not stop too early: 1 " + X + " " + n + ", then try 2, then 3 ..." },
    worked: { text: "Factor pairs of " + n + ": " + pairText(n) + ". In order: " + list(want) + ".", pic: { k: "frain", n: n } },
    yes: pairText(n) + " all make " + n + ".", key: want.join(" ; "), fill: want.map(String)
  };
};

/* spot the mistake: the list of factors stops too early */
M.fmiss = function (d) {
  const n = d.n, all = facts(n), shown = all.slice(0, d.shown), want = all.slice(d.shown), s = d.he ? "He" : "She";
  need(want.length >= 2 && want.length <= 5 && shown.length >= 2, "fmiss: 2 to 5 factors are missing");
  const partner = v => v + " " + X + " " + n / v + " = " + n, root = Math.round(Math.sqrt(n));
  return {
    q: d.who + " lists the [[factors|factor]] of <b>" + n + "</b>, smallest first: <b>" + list(shown) + "</b>. " + s + " stops too early. Write the factors that are missing.",
    lines: [boxes(want.length)], blanks: want.map(() => ({ len: 2, w: "s4" })),
    check(r) {
      const vs = r.v.map(num), parts = want.map((x, i) => vs[i] === x);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const typed = vs.filter(v => !isNaN(v)), notF = typed.filter(v => v < 1 || n % v !== 0)[0], again = typed.filter(v => shown.indexOf(v) >= 0)[0];
      let msg;
      if (notF != null) msg = notF + " is not a factor of " + n + ": " + n + " " + DIV + " " + notF + " is not exact.";
      else if (again != null) msg = again + " is in the list already. Write the factors that are bigger than " + shown[shown.length - 1] + ".";
      else if (typed.indexOf(n) < 0) msg = "Do not forget " + n + " itself: 1 " + X + " " + n + " = " + n + ". Every factor in the list has a partner.";
      else msg = "Every factor has a partner: " + partner(shown[1]) + ". Find the partner of each number in the list. Write them smallest first.";
      return { ok: false, msg: msg, parts: parts };
    },
    hint: { pic: { k: "frain", n: n, hide: want }, step: "Every factor has a partner. " + shown.slice(0, 2).map(partner).join(" and ") + ". Find the partner of each number in the list." + (root * root === n ? " " + root + " " + X + " " + root + " = " + n + ", so " + root + " is its own partner." : "") },
    worked: { text: "Factor pairs of " + n + ": " + pairText(n) + ". The missing factors are " + and(want) + ".", pic: { k: "frain", n: n } },
    yes: "The factor pairs of " + n + " are " + pairText(n) + ".", key: want.join(" ; "), fill: want.map(String)
  };
};

/* ---------- the lowest common multiple, the highest common factor ---------- */
M.lcm = function (d) {
  const a = d.a, b = d.b, L = LCM(a, b), A = mults(a, L), B = mults(b, L), big = Math.max(a, b), small = Math.min(a, b);
  need(A.length <= 12 && B.length <= 12, "lcm: the lists are too long");
  return {
    q: "Write the [[lowest common multiple]] of <b>" + a + "</b> and <b>" + b + "</b>.",
    lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    check(r) { const v = num(r.v[0]); return v === L ? { ok: true } : { ok: false, msg: lcmSlip(a, b, v), parts: [false] }; },
    hint: { pic: { k: "hops", terms: mults(big, big * 2), blanks: 1, labs: ["+ " + big, "+ " + big] },
      step: "Count on in " + big + "s. Stop at the first number that is also a multiple of " + small + "." },
    worked: { text: "Multiples of " + a + ": " + list(A) + ". Multiples of " + b + ": " + list(B) + ". The first number in both lists is " + L + "." +
      (a * b !== L ? " (" + a + " " + X + " " + b + " = " + fmt(a * b) + " is a common multiple too, but not the lowest.)" : ""), pic: listPic("mult", a, b, L, { marked: "all", hl: "low" }) },
    yes: L + " = " + L / a + " " + X + " " + a + " = " + L / b + " " + X + " " + b + ". No smaller number is in both lists.",
    key: String(L), fill: [String(L)]
  };
};

M.hcf = function (d) {
  const a = d.a, b = d.b, g = HCF(a, b), A = facts(a), B = facts(b), com = both(A, B);
  need(A.length <= 12 && B.length <= 12, "hcf: the lists are too long");
  return {
    q: "Write the [[highest common factor]] of <b>" + a + "</b> and <b>" + b + "</b>.",
    lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    check(r) { const v = num(r.v[0]); return v === g ? { ok: true } : { ok: false, msg: hcfSlip(a, b, v), parts: [false] }; },
    hint: { pic: listPic("fact", a, b, 0), step: "List the factors of each number in pairs. Then find the biggest number that is in both lists." },
    worked: { text: "Factors of " + a + ": " + list(A) + ". Factors of " + b + ": " + list(B) + ". In both lists: " + and(com) + ". The highest is " + g + ".",
      pic: listPic("fact", a, b, 0, { marked: "all", hl: "high" }) },
    yes: a + " " + DIV + " " + g + " = " + a / g + " and " + b + " " + DIV + " " + g + " = " + b / g + ". No bigger number divides both.",
    key: String(g), fill: [String(g)]
  };
};

/* a number in a range that is a multiple of both */
M.cmrange = function (d) {
  const a = d.a, b = d.b, L = LCM(a, b), sol = mults(L, d.hi).filter(v => v > d.lo && v < d.hi);
  need(sol.length >= 1 && sol.length <= 2, "cmrange: one or two numbers must fit");
  need(L / Math.min(a, b) <= 12, "cmrange: the lists are too long");
  const run = mults(L, sol[sol.length - 1] + L);
  return {
    q: "Write a number between <b>" + fmt(d.lo) + "</b> and <b>" + fmt(d.hi) + "</b> that is a [[multiple]] of both <b>" + a + "</b> and <b>" + b + "</b>.",
    lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = num(r.v[0]);
      if (sol.indexOf(v) >= 0) return { ok: true };
      if (isNaN(v)) return { ok: false, msg: "Write a number.", parts: [false] };
      if (v % a === 0 && v % b === 0) return { ok: false, msg: fmt(v) + " is a common multiple of " + a + " and " + b + ". But it is not between " + fmt(d.lo) + " and " + fmt(d.hi) + ". Count on in " + L + "s.", parts: [false] };
      if (v <= d.lo || v >= d.hi) return { ok: false, msg: "The number must be between " + fmt(d.lo) + " and " + fmt(d.hi) + ".", parts: [false] };
      return { ok: false, msg: notCM(v, a, b) + " It must be a multiple of both.", parts: [false] };
    },
    hint: { pic: listPic("mult", a, b, L), step: "First find the lowest common multiple of " + a + " and " + b + ". Every common multiple is a multiple of it. Count on in steps of that number." },
    worked: { text: "The lowest common multiple of " + a + " and " + b + " is " + L + ". Count on in " + L + "s: " + list(run) + ". Between " + fmt(d.lo) + " and " + fmt(d.hi) + ": " + sol.map(fmt).join(" or ") + "." },
    yes: fmt(sol[0]) + " = " + sol[0] / a + " " + X + " " + a + " = " + sol[0] / b + " " + X + " " + b + ".",
    key: sol.map(fmt).join(" or "), fill: [String(sol[0])]
  };
};

/* which list? only common multiples / all the common factors */
M.cset = function (d) {
  const a = d.a, b = d.b, cm = d.kind === "cm", key = cm ? LCM(a, b) : HCF(a, b), com = cm ? null : both(facts(a), facts(b));
  const good = s => (cm ? s.every(v => v % a === 0 && v % b === 0) : s.length === com.length && s.every(v => com.indexOf(v) >= 0));
  const why = s => {
    if (cm) return notCM(s.filter(v => v % a !== 0 || v % b !== 0)[0], a, b);
    const bad = s.filter(v => com.indexOf(v) < 0)[0], miss = com.filter(v => s.indexOf(v) < 0)[0];
    if (bad != null) return notCF(bad, a, b);
    return miss === 1 ? "1 is missing. 1 is a factor of every number, so it is a common factor too." : miss + " is missing: " + a + " " + DIV + " " + miss + " = " + a / miss + " and " + b + " " + DIV + " " + miss + " = " + b / miss + ".";
  };
  need(good(d.opts[0]) && d.opts.slice(1).every(s => !good(s)), "cset: only the first list must be right");
  const opts = arrange(d.opts.map((s, i) => ({ html: list(s), ok: i === 0, why: i === 0 ? "" : why(s) })), d.at);
  const right = opts.findIndex(o => o.ok), upto = cm ? span(a, b, key) : 0;
  return {
    q: cm ? "Which list has <b>only</b> [[common multiples|common multiple]] of <b>" + a + "</b> and <b>" + b + "</b>?"
      : "Which list has <b>all</b> the [[common factors|common factor]] of <b>" + a + "</b> and <b>" + b + "</b>, and nothing else?",
    sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: listPic(cm ? "mult" : "fact", a, b, upto),
      step: cm ? "Check every number in a list two times: is it a multiple of " + a + "? Is it a multiple of " + b + "?" : "List the factors of " + a + " and of " + b + ". Which numbers are in both lists? Do not forget 1." },
    worked: { text: cm ? "The lowest common multiple of " + a + " and " + b + " is " + key + ". The common multiples are the multiples of " + key + ": " + list(mults(key, key * 4)) + " ... Only list " + LET[right] + " fits."
      : "Factors of " + a + ": " + list(facts(a)) + ". Factors of " + b + ": " + list(facts(b)) + ". In both lists: " + and(com) + ". That is list " + LET[right] + ".",
      pic: listPic(cm ? "mult" : "fact", a, b, upto, { marked: "all" }) },
    yes: cm ? and(d.opts[0]) + " are all multiples of " + a + " and of " + b + "." : and(com) + " are the factors of both " + a + " and " + b + ".",
    key: LET[right] + ": " + list(d.opts[0])
  };
};

/* ---------- real life ---------- */
function storyTask(kind, d) {
  const a = d.a, b = d.b, lc = kind === "lcm", ans = lc ? LCM(a, b) : HCF(a, b), other = lc ? HCF(a, b) : LCM(a, b);
  const upto = lc ? span(a, b, ans) : 0;
  const A = lc ? mults(a, ans) : facts(a), B = lc ? mults(b, ans) : facts(b);
  need(A.length <= 12 && B.length <= 12, "story: the lists are too long");
  const step = lc ? "This is a common multiple problem. Count on in " + a + "s and in " + b + "s. Find the first number in both lists."
    : "This is a common factor problem. The answer must divide " + a + " exactly and divide " + b + " exactly. Find the biggest number that does.";
  const task = {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = num(r.v[0]);
      if (v === ans) return { ok: true };
      let msg;
      if (v === other && other !== ans) msg = lc ? fmt(v) + " is the highest common factor. Here you need a number in both times tables: a common multiple."
        : fmt(v) + " is the lowest common multiple. Here the answer must divide " + a + " and " + b + ": a common factor.";
      else if (v === a + b || v === Math.abs(a - b)) msg = "Do not add or subtract the two numbers. " + step;
      else msg = lc ? lcmSlip(a, b, v) : hcfSlip(a, b, v);
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: d.tool ? null : listPic(lc ? "mult" : "fact", a, b, ans, d.names ? { names: d.names } : {}), step: step },
    worked: { text: (lc ? "Multiples of " + a + ": " + list(A) + ". Multiples of " + b + ": " + list(B) + ". The first number in both lists is " + ans + "."
      : "Factors of " + a + ": " + list(A) + ". Factors of " + b + ": " + list(B) + ". The biggest number in both lists is " + ans + ".") + " The answer is " + ans + " " + d.unit + ".",
      pic: listPic(lc ? "mult" : "fact", a, b, ans, Object.assign({ marked: "all", hl: lc ? "low" : "high" }, d.names ? { names: d.names } : {})) },
    yes: lc ? ans + " is the lowest common multiple of " + a + " and " + b + "." : ans + " is the highest common factor of " + a + " and " + b + ".",
    key: String(ans), fill: [String(ans)]
  };
  /* the two lists on the desk are a help: the child may mark them, the answer is the number in the box */
  if (d.tool) { task.ui = listPic(lc ? "mult" : "fact", a, b, upto, d.names ? { names: d.names } : {}); task.ready = r => Array.isArray(r.v) && r.v[0] !== ""; }
  return task;
}
M.lcmstory = d => storyTask("lcm", d);
M.hcfstory = d => storyTask("hcf", d);

/* two steps: find the LCM or the HCF, then use it */
M.twostep = function (d) {
  const a = d.a, b = d.b, t = d.things || ["first", "second"];
  if (d.kind === "packs") {
    const L = LCM(a, b), pa = L / a, pb = L / b, ans = pa + pb;
    need(ans !== L && ans !== a + b, "twostep: the answer must differ from the slips");
    return {
      q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
      check(r) {
        const v = num(r.v[0]);
        if (v === ans) return { ok: true };
        const msg = v === L ? L + " is the number of " + t[0] + " (and of " + t[1] + "). Now work out the packs: " + L + " " + DIV + " " + a + " and " + L + " " + DIV + " " + b + "."
          : v === pa || v === pb ? "That is one kind only. Add the two: " + L + " " + DIV + " " + a + " = " + pa + " and " + L + " " + DIV + " " + b + " = " + pb + "."
          : v === a + b ? "Do not add " + a + " and " + b + ". First find the lowest common multiple of " + a + " and " + b + "."
          : v === a * b ? "Find the lowest common multiple of " + a + " and " + b + ", not just " + a + " " + X + " " + b + "."
          : "Step 1: find the lowest common multiple of " + a + " and " + b + ". Step 2: divide it by " + a + " and by " + b + ". Then add.";
        return { ok: false, msg: msg, parts: [false] };
      },
      hint: { pic: listPic("mult", a, b, L), step: "Step 1: the smallest number that is in both lists. Step 2: how many " + a + "s make it? How many " + b + "s? Add the two answers." },
      worked: { text: "The lowest common multiple of " + a + " and " + b + " is " + L + ". " + L + " " + DIV + " " + a + " = " + pa + " for the " + t[0] + ". " + L + " " + DIV + " " + b + " = " + pb + " for the " + t[1] + ". " + pa + " + " + pb + " = " + ans + ".",
        pic: listPic("mult", a, b, L, { marked: "all", hl: "low" }) },
      yes: pa + " " + X + " " + a + " = " + L + " and " + pb + " " + X + " " + b + " = " + L + ". " + pa + " + " + pb + " = " + ans + ".",
      key: String(ans), fill: [String(ans)]
    };
  }
  const g = HCF(a, b), ea = a / g, eb = b / g, ans = ea + eb, gs = d.groups || "groups", one = gs.replace(/s$/, "");
  need(ans !== g && g > 1, "twostep: the answer must differ from the slips");
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = num(r.v[0]);
      if (v === ans) return { ok: true };
      const msg = v === g ? g + " is the number of " + gs + ". Now share: " + a + " " + DIV + " " + g + " and " + b + " " + DIV + " " + g + ". Then add."
        : v === ea || v === eb ? "That is one kind only. Each " + one + " has " + ea + " " + t[0] + " and " + eb + " " + t[1] + ". Add them."
        : v === a + b ? "That is everything together. First find the highest common factor of " + a + " and " + b + "."
        : "Step 1: find the highest common factor of " + a + " and " + b + ". Step 2: divide " + a + " and " + b + " by it. Then add.";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: listPic("fact", a, b, 0), step: "Step 1: the biggest number that divides " + a + " and " + b + ". That is the number of " + gs + ". Step 2: share the " + t[0] + " and the " + t[1] + " among the " + gs + "." },
    worked: { text: "The highest common factor of " + a + " and " + b + " is " + g + ", so there are " + g + " " + gs + ". " + a + " " + DIV + " " + g + " = " + ea + " " + t[0] + ". " + b + " " + DIV + " " + g + " = " + eb + " " + t[1] + ". " + ea + " + " + eb + " = " + ans + ".",
      pic: listPic("fact", a, b, 0, { marked: "all", hl: "high" }) },
    yes: g + " " + gs + ", each with " + ea + " " + t[0] + " and " + eb + " " + t[1] + ": " + ea + " + " + eb + " = " + ans + ".",
    key: String(ans), fill: [String(ans)]
  };
};

/* ---------- spot the mistake: (a) what went wrong, (b) the right answer ---------- */
M.cfix = function (d) {
  const a = d.a, b = d.b, lc = d.kind === "lcm", L = LCM(a, b), g = HCF(a, b), ans = lc ? L : g, big = Math.max(a, b);
  const s = { he: d.he ? "he" : "she", He: d.he ? "He" : "She", his: d.he ? "his" : "her" };
  const name = lc ? "lowest common multiple" : "highest common factor";
  let w, rs, tell;
  if (lc && d.slip === "product") {
    w = a * b; need(w !== L, "cfix: the product is the LCM here");
    rs = [{ t: fmt(w) + " is a common multiple of " + a + " and " + b + ", but it is not the lowest." },
      { t: fmt(w) + " is not a multiple of " + b + ".", why: fmt(w) + " = " + a + " " + X + " " + b + ", so it is a multiple of " + b + ". But is it the lowest one in both lists?" },
      { t: fmt(w) + " is a common factor, not a common multiple.", why: "A factor of " + a + " is never bigger than " + a + ". " + fmt(w) + " is in both times tables, so it is a common multiple." }];
    tell = d.who + " multiplied: " + a + " " + X + " " + b + " = " + fmt(w) + ". That is always a common multiple, but here " + L + " is lower.";
  } else if (lc && d.slip === "hcf") {
    w = g; need(g > 1 && g < big, "cfix: the HCF must be above 1");
    rs = [{ t: w + " is a common factor of " + a + " and " + b + ", not a common multiple." },
      { t: w + " is a common multiple, but it is not the lowest.", why: "A multiple of " + big + " is " + big + " or more. " + w + " is smaller, so it is not a multiple of " + big + "." },
      { t: w + " is not a factor of " + b + ".", why: b + " " + DIV + " " + w + " = " + b / w + ", so " + w + " is a factor of " + b + ". But the question asks for a multiple." }];
    tell = d.who + " found the highest common factor. Factors divide a number. Multiples are in its times table.";
  } else if (!lc && d.slip === "low") {
    w = both(facts(a), facts(b))[1]; need(w != null && w < g, "cfix: a common factor between 1 and the HCF is needed");
    rs = [{ t: w + " is a common factor of " + a + " and " + b + ", but it is not the highest." },
      { t: w + " is not a factor of " + b + ".", why: b + " " + DIV + " " + w + " = " + b / w + ", so " + w + " is a factor of " + b + ". But is it the biggest one in both lists?" },
      { t: w + " is a common multiple, not a common factor.", why: w + " divides " + a + " and " + b + " exactly. So it is a common factor. But is it the highest?" }];
    tell = d.who + " stopped at the first common factor above 1. Go on to the end of both lists.";
  } else if (!lc && d.slip === "lcm") {
    w = L; need(L !== g, "cfix: the LCM must differ from the HCF");
    rs = [{ t: fmt(w) + " is a common multiple of " + a + " and " + b + ", not a common factor." },
      { t: fmt(w) + " is a common factor, but it is not the highest.", why: "A factor of " + a + " is never bigger than " + a + ". " + fmt(w) + " is in both times tables: it is a multiple." },
      { t: fmt(w) + " is not a multiple of " + a + ".", why: fmt(w) + " = " + w / a + " " + X + " " + a + ", so it is a multiple of " + a + ". But the question asks for a factor." }];
    tell = d.who + " found the lowest common multiple. Multiples are in the times table. Factors divide the number.";
  } else throw new Error("cfix: unknown slip " + d.slip);
  const opts = arrange(rs.map((x, i) => ({ html: x.t, ok: i === 0, why: x.why || "" })), d.at);
  const A = lc ? mults(a, L) : facts(a), B = lc ? mults(b, L) : facts(b), kind = lc ? "mult" : "fact";
  const work = lc ? "Multiples of " + a + ": " + list(A) + ". Multiples of " + b + ": " + list(B) + ". The first number in both lists is " + L + "."
    : "Factors of " + a + ": " + list(A) + ". Factors of " + b + ": " + list(B) + ". The biggest number in both lists is " + g + ".";
  return {
    q: d.who + " looks for the [[" + name + "]] of <b>" + a + "</b> and <b>" + b + "</b>. " + s.He + " writes <b>" + fmt(w) + "</b>. " + cap(s.his) + " answer is wrong.", marks: 2, ab: true,
    sub: "What is wrong? Tick (✓) one box.", letters: true, opts: opts,
    abAsk: "Write the " + name + " of " + a + " and " + b + ".",
    lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const o = opts[r.pick], pickOk = !!(o && o.ok), v = num((r.v || [])[0]), vOk = v === ans;
      if (pickOk && vOk) return { ok: true, parts: [true], pickOk: true };
      const msg = !pickOk ? (o && o.why ? o.why : "Read the three sentences again.")
        : v === w ? "That is " + d.who + "'s answer. " + (lc ? "Look for a lower number in both lists." : "Look for the right kind of number in both lists.")
        : "The mistake is right. Now the answer: " + (lc ? lcmSlip(a, b, v) : hcfSlip(a, b, v));
      return { ok: false, msg: msg, parts: [vOk], pickOk: pickOk };
    },
    hint: { pic: listPic(kind, a, b, L), step: "Write the two lists yourself. Which is the " + (lc ? "first" : "biggest") + " number that is in both lists? Is it " + fmt(w) + "?" },
    worked: { text: work + " " + tell, pic: listPic(kind, a, b, L, { marked: "all", hl: lc ? "low" : "high" }) },
    yes: "The " + name + " of " + a + " and " + b + " is " + ans + ".", key: String(ans), fill: [String(ans)]
  };
};

MX.s4 = { mults: mults, facts: facts, LCM: LCM, HCF: HCF };
})();

