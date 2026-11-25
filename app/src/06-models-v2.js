/* 06-models-v2.js - the Maths v2 question models (window.MX), as they came with the Grade 3 trail. Grade 5 uses the core
   (MX.make, MX.M.claim, MX.M.chain, the helpers); its own models are in 07-g5-models-base.js and 08-g5-models-sN.js. */
/* Maths Revision Trail: task models.
   Every question in the Trail is a small set of numbers (see mdata.js). This file turns those numbers into the
   question text, the answer, the feedback for common mistakes, the hints and the worked answer.
   There is no page code here, so the answer-key tests can load this file on its own. */
var MX = (function () {
"use strict";

/* ---------- places and number helpers ---------- */
const P = [
  { k: "tth", v: 10000, one: "ten thousand", many: "ten thousands", ab: "TTh", col: "Ten thousands" },
  { k: "th", v: 1000, one: "thousand", many: "thousands", ab: "Th", col: "Thousands" },
  { k: "h", v: 100, one: "hundred", many: "hundreds", ab: "H", col: "Hundreds" },
  { k: "t", v: 10, one: "ten", many: "tens", ab: "T", col: "Tens" },
  { k: "o", v: 1, one: "one", many: "ones", ab: "O", col: "Ones" }];
const PI = {}; P.forEach((p, i) => { PI[p.k] = i; });
const places = cols => P.slice(P.length - cols);
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const digits = (n, cols) => String(n).padStart(cols, "0").split("").map(Number);
const colsFor = n => (n >= 10000 ? 5 : 4);
const total = b => { const ps = places(b.length); return b.reduce((s, c, i) => s + c * ps[i].v, 0); };
const cnt = (c, p) => c + " " + (c === 1 ? p.one : p.many);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const SYM = { x: "×", d: "÷" };

/* "2 thousands, 2 hundreds and 14 tens". With blank = a column number, that count becomes an answer box. */
function say(b, blank) {
  const ps = places(b.length), parts = [];
  b.forEach((c, i) => {
    if (i === blank) parts.push("{0} " + ps[i].many);
    else if (c > 0) parts.push(cnt(c, ps[i]));
  });
  if (!parts.length) return "0";
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
}

/* number names, the British way: "three thousand, two hundred and five" */
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const w2 = n => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
function nameParts(n) {
  const out = [], th = Math.floor(n / 1000), h = Math.floor(n % 1000 / 100), r = n % 100;
  if (th) out.push({ t: w2(th) + " thousand", p: "th" });
  if (h) out.push({ t: ONES[h] + " hundred", p: "h" });
  if (r) {
    if (r < 10) out.push({ t: ONES[r], p: "o" });
    else if (r < 20) out.push({ t: ONES[r], p: r === 10 ? "t" : "to" });
    else { out.push({ t: TENS[Math.floor(r / 10)], p: "t" }); if (r % 10) out.push({ t: ONES[r % 10], p: "o", hy: true }); }
  }
  /* joiners: a comma after the thousands when hundreds follow, "and" before the last part when it is under one hundred */
  out.forEach((x, i) => {
    if (!i) { x.j = ""; return; }
    if (x.hy) x.j = "-";
    else if (x.p === "h") x.j = ", ";
    else x.j = " and ";
  });
  return out;
}
const words = n => (n === 0 ? "zero" : nameParts(n).map(x => x.j + x.t).join(""));

/* put the right option where the data says (so the answer is not always first), the others keep their order */
function arrange(list, at) {
  const first = list[0], rest = list.slice(1), out = rest.slice();
  out.splice(Math.max(0, Math.min(rest.length, at || 0)), 0, first);
  return out;
}
const LET = ["A", "B", "C", "D", "E"];

/* feedback for a wrong answer to n × by or n ÷ by */
function slipMsg(n, op, by, v) {
  const k = by === 10 ? 1 : 2, ans = op === "x" ? n * by : n / by;
  if (v === ans) return "";
  if (op === "x") {
    if (v === n + by) return "× " + by + " is not + " + by + ". Move every digit " + (k === 1 ? "one place" : "two places") + " to the left.";
    if (v === n) return "The number must change. Move every digit " + (k === 1 ? "one place" : "two places") + " to the left.";
    if (v === n * (by === 10 ? 100 : 10)) return by === 10 ? "That is two places. × 10 moves the digits only one place." : "That is one place. × 100 moves the digits two places.";
    if (v * by === n) return "That is dividing. Multiplying by " + by + " makes this number bigger.";
    return "× " + by + " moves every digit " + (k === 1 ? "one place" : "two places") + " to the left.";
  }
  if (v === n - by) return "÷ " + by + " is not − " + by + ". Move every digit " + (k === 1 ? "one place" : "two places") + " to the right.";
  if (v === n) return "The number must change. Move every digit " + (k === 1 ? "one place" : "two places") + " to the right.";
  if (v * (by === 10 ? 100 : 10) === n) return by === 10 ? "That is two places. ÷ 10 moves the digits only one place." : "That is one place. ÷ 100 moves the digits two places.";
  if (v === n * by) return "That is multiplying. Dividing by " + by + " makes this number smaller.";
  return "÷ " + by + " moves every digit " + (k === 1 ? "one place" : "two places") + " to the right.";
}
const ruleText = (op, by) => SYM[op] + " " + by + ": move every digit " + (by === 10 ? "1 place" : "2 places") + " to the " + (op === "x" ? "left" : "right") + ".";
const zeroPlace = (n, cols) => { const d = digits(n, cols), ps = places(cols); for (let i = 1; i < cols; i++) if (d[i] === 0 && d.slice(0, i).some(x => x > 0)) return ps[i]; return null; };
const noZeros = n => String(n).replace(/0/g, "");

/* ---------- the task types ---------- */
const M = {};

/* Build it: make a number with blocks */
M.build = function (d, mode) {
  const n = d.n, std = digits(n, 4), ps = places(4);
  return {
    q: "Build the number <b>" + fmt(n) + "</b> with blocks.",
    how: mode === "our" ? "Let's do this one together. Tap <b>+</b> to add a block. Watch the number grow." : "Tap <b>+</b> to add a block. Tap <b>−</b> to take one away.",
    ui: { k: "mat", b: [0, 0, 0, 0], ctl: true, counts: true, total: mode === "our", max: 12 },
    ready: r => total(r.b) > 0,
    check(r) {
      if (total(r.b) === n) return { ok: true, note: same(r.b, std) ? "" : "You used " + say(r.b) + ". That makes " + fmt(n) + " too!" };
      for (let i = 0; i < 4; i++) if (r.b[i] !== std[i]) return { ok: false, msg: "Check the " + ps[i].many + ". You have " + r.b[i] + "." };
      return { ok: false, msg: "Check each place." };
    },
    hint: { pic: { k: "chart", n: n, cols: 4 }, step: "Do one place at a time. Start with the thousands. " + fmt(n) + " has " + cnt(std[0], ps[0]) + "." },
    worked: { text: fmt(n) + " = " + say(std) + ".", pic: { k: "mat", b: std, counts: true } },
    yes: cap(say(std)) + " make " + fmt(n) + ".",
    key: fmt(n) + " = " + std.join(" | ")
  };
};

/* Build it: read the number that the blocks show */
M.read = function (d, mode) {
  const b = d.b, n = total(b), z = zeroPlace(n, 4);
  return {
    q: "What number do the blocks show?",
    how: mode === "our" ? "Count the blocks in each place. If a place is empty, write <b>0</b> there." : "Count the blocks in each place. Then write the number.",
    ui: { k: "mat", b: b, counts: mode === "our" },
    lines: ["{0}"], blanks: [{ len: 5, w: "big" }],
    check(r) {
      const v = r.v[0];
      if (+v === n) return { ok: true };
      if (z && v === noZeros(n)) return { ok: false, msg: "Look for the empty place. Write 0 there to hold the place.", parts: [false] };
      return { ok: false, msg: "Count each place again: thousands, hundreds, tens, ones.", parts: [false] };
    },
    hint: { reveal: mode === "our" ? "" : "counts", pic: mode === "our" ? { k: "chart", cols: 4, ask: true } : null,
      step: "Write one digit for each place." + (z ? " The " + z.many + " place is empty, so write 0 there." : "") },
    worked: { text: cap(b.map((c, i) => cnt(c, places(4)[i])).join(", ")) + ". The number is " + fmt(n) + ".", pic: { k: "chart", n: n, cols: 4 } },
    yes: fmt(n) + "." + (z ? " The 0 holds the " + z.many + " place." : ""),
    key: fmt(n), fill: [String(n)]
  };
};

/* Build it: break one block into ten smaller ones, or join ten into one bigger block */
M.trade = function (d) {
  const b0 = d.b, n = total(b0), ps = places(4), i = PI[d.p] - 1; /* column number on the 4-column mat */
  if (d.act === "break") {
    const hi = ps[i], lo = ps[i + 1], after = b0.slice(); after[i] -= 1; after[i + 1] += 10;
    const ans = after[i + 1], was = b0[i + 1];
    return {
      q: "Tap one <b>" + hi.one + "</b> to break it into 10 " + lo.many + ". Then fill in the box.",
      how: "Tap a " + hi.one + " block. Watch what happens!",
      ui: { k: "mat", b: b0, counts: false, can: { brk: [hi.k] } },
      lines: [fmt(n) + " = " + say(after, i + 1)], blanks: [{ len: 2, w: "mid" }],
      check(r) {
        const v = +r.v[0];
        if (v === ans) return { ok: true };
        if (!r.traded) return { ok: false, msg: "Tap a " + hi.one + " block first. It breaks into 10 " + lo.many + ".", parts: [false] };
        if (v === 10 && was > 0) return { ok: false, msg: "10 new " + lo.many + ", and the " + cnt(was, lo) + " from before. Count them all.", parts: [false] };
        if (v === was) return { ok: false, msg: "Count all the " + lo.many + " now. There are 10 new ones.", parts: [false] };
        return { ok: false, msg: "Count the " + lo.many + " again. The dotted box holds 10.", parts: [false] };
      },
      hint: { pic: { k: "swap", p: hi.k }, step: "Tap a " + hi.one + ". You get 10 new " + lo.many + "." + (was ? " Add the " + cnt(was, lo) + " from before." : "") },
      worked: { text: "1 " + hi.one + " = 10 " + lo.many + ". " + (was ? "10 + " + was + " = " + ans + ". " : "") + "So " + fmt(n) + " = " + say(after) + ".", pic: { k: "mat", b: after, counts: true } },
      yes: fmt(n) + " = " + say(after) + ". The number did not change!",
      key: String(ans), after: after, fill: [String(ans)]
    };
  }
  const lo = ps[i], up = ps[i - 1], after = b0.slice(); after[i] -= 10; after[i - 1] += 1;
  return {
    q: "Too many " + lo.many + "! Join 10 " + lo.many + " to make 1 " + up.one + ". Then write the number.",
    how: "Tap <b>Join 10</b> under the " + lo.many + ".",
    ui: { k: "mat", b: b0, counts: false, can: { join: [lo.k] } },
    lines: ["{0}"], blanks: [{ len: 5, w: "big" }],
    check(r) {
      const v = r.v[0];
      if (+v === n) return { ok: true };
      if (v === b0.filter(c => c > 0).join("")) return { ok: false, msg: cap(cnt(b0[i], lo)) + " is too many for one place. Join 10 " + lo.many + " first.", parts: [false] };
      if (!r.traded) return { ok: false, msg: "Tap “Join 10” first. Then count each place.", parts: [false] };
      return { ok: false, msg: "Count each place again: thousands, hundreds, tens, ones.", parts: [false] };
    },
    hint: { pic: { k: "swap", p: up.k, join: true }, step: "Tap “Join 10”. Then count the blocks in each place." },
    worked: { text: "10 " + lo.many + " make 1 " + up.one + ". Now there are " + say(after) + ". The number is " + fmt(n) + ".", pic: { k: "mat", b: after, counts: true } },
    yes: cap(say(b0)) + " make " + fmt(n) + ".",
    key: fmt(n), after: after, fill: [String(n)]
  };
};

/* Build it: tick the blocks that show the number */
M.pickmat = function (d) {
  const n = d.n, std = digits(n, 4), z = zeroPlace(n, 4);
  const opts = arrange(d.opts.map(b => ({ b: b, ok: total(b) === n, why: "These blocks show " + fmt(total(b)) + "." })), d.at);
  return {
    q: "Which blocks show <b>" + fmt(n) + "</b>?",
    how: "Look at each set of blocks. Tick (✓) one box.", sub: "Tick (✓) one box.",
    ui: { k: "matpick" }, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Look again." }; },
    hint: { pic: { k: "chart", n: n, cols: 4 },
      step: d.regrouped ? "Work out the number for each set of blocks. Remember: 10 hundreds make 1 thousand." : (z ? fmt(n) + " has no " + z.many + ". Find the blocks with an empty " + z.many + " place." : "Check one place at a time.") },
    worked: { text: opts.map((o, i) => LET[i] + " shows " + fmt(total(o.b)) + (o.ok ? " ✓" : "")).join(". ") + ". The answer is " + LET[opts.findIndex(o => o.ok)] + "." },
    yes: d.regrouped ? cap(say(opts.find(o => o.ok).b)) + " make " + fmt(n) + "." : fmt(n) + " = " + say(std) + ".",
    key: LET[opts.findIndex(o => o.ok)]
  };
};

/* Draw it: the value of one digit */
M.digit = function (d, mode) {
  const n = d.n, cols = colsFor(n), ds = digits(n, cols), ps = places(cols), i = ds.indexOf(d.d), val = d.d * ps[i].v;
  let cand = ps.map((p, j) => ({ v: d.d * p.v, j: j })).reverse();              /* small to big */
  if (cand.length > 4) { const far = cand.filter(c => c.j !== i && c.v !== d.d).sort((a, b) => Math.abs(b.j - i) - Math.abs(a.j - i))[0]; cand = cand.filter(c => c !== far); }
  const opts = cand.map(c => ({ html: fmt(c.v), ok: c.v === val, why: c.v === val ? "" : c.v === d.d ? d.d + " is the digit. What is it worth in its place?" : (d.d === 8 ? "An " : "A ") + d.d + " in the " + ps[c.j].many + " place is worth " + fmt(c.v) + "." }));
  return {
    q: "What is the [[value]] of the [[digit]] <b>" + d.d + "</b> in <b>" + fmt(n) + "</b>?",
    how: mode === "our" ? "Find the " + d.d + " in the chart. Which place is it in?" : "Use the chart. Then tick (✓) one box.", sub: "Tick (✓) one box.",
    ui: { k: "chart", n: n, cols: cols, hl: mode === "our" ? ps[i].k : "" }, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Look at the chart again." }; },
    hint: { reveal: mode === "our" ? "" : "hl:" + ps[i].k, step: "The " + d.d + " is in the " + ps[i].many + " place." },
    worked: { text: "The " + d.d + " is in the " + ps[i].many + " place. Its value is " + fmt(val) + ".", pic: { k: "chart", n: n, cols: cols, hl: ps[i].k, vals: true } },
    yes: "The " + d.d + " is in the " + ps[i].many + " place, so it is worth " + fmt(val) + ".",
    key: fmt(val)
  };
};

/* Draw it: read a number name and draw it with counters on the chart */
M.counters = function (d) {
  const n = d.n, std = digits(n, 4), ps = places(4), z = zeroPlace(n, 4);
  return {
    q: "Show this number on the chart.", name: n,
    how: "Tap <b>+</b> to draw a counter. Tap <b>−</b> to rub one out.",
    ui: { k: "counters", cols: 4, max: 9 },
    ready: r => total(r.b) > 0,
    check(r) {
      if (total(r.b) === n) return { ok: true };
      for (let i = 0; i < 4; i++) if (r.b[i] !== std[i])
        return { ok: false, msg: std[i] === 0 ? "The name does not say any " + ps[i].many + ". Leave that place empty." : "Check the " + ps[i].many + ". Read the number name again." };
      return { ok: false, msg: "Check each place." };
    },
    hint: { pic: { k: "name", n: n }, step: z ? "The name does not say any " + z.many + ". So the " + z.many + " place stays empty." : "Read one part at a time: thousands, hundreds, tens, ones." },
    worked: { text: cap(words(n)) + " = " + say(std) + ". In digits: " + fmt(n) + ".", pic: { k: "chart", n: n, cols: 4, dots: true, digitsRow: true } },
    yes: cap(words(n)) + " is " + fmt(n) + " in digits.",
    key: fmt(n) + " = " + std.join(" | ")
  };
};

/* Draw it: multiply or divide by 10 or 100 on the place value slider */
M.slide = function (d, mode) {
  const n = d.n, op = d.op, by = d.by, k = by === 10 ? 1 : 2, ans = op === "x" ? n * by : n / by, dir = op === "x" ? "left" : "right", pl = k === 1 ? "one place" : "two places";
  return {
    q: "Calculate <b>" + fmt(n) + " " + SYM[op] + " " + by + "</b>.",
    how: mode === "our" ? "Let's do it together. " + ruleText(op, by) + " Then write the answer." : "Slide the digits. Then write the answer.",
    ui: { k: "slider", n: n, cols: 5, zeros: mode === "our" },
    lines: [fmt(n) + " " + SYM[op] + " " + by + " = {0}"], blanks: [{ len: 6, w: "big" }],
    check(r) { const v = +r.v[0]; return v === ans ? { ok: true } : { ok: false, msg: slipMsg(n, op, by, v), parts: [false] }; },
    hint: { pic: { k: "rule", op: op, by: by }, step: ruleText(op, by) + (op === "x" ? " Write 0 in " + (k === 1 ? "the empty place." : "each empty place.") : "") },
    worked: { text: "Every digit moves " + pl + " to the " + dir + ". " + (op === "x" ? (k === 1 ? "A zero holds the empty place. " : "Zeros hold the empty places. ") : "") + fmt(n) + " " + SYM[op] + " " + by + " = " + fmt(ans) + ".",
      pic: { k: "slider", n: n, cols: 5, shift: op === "x" ? k : -k, zeros: true, fixed: true } },
    yes: fmt(n) + " " + SYM[op] + " " + by + " = " + fmt(ans) + ". The digits moved " + pl + " to the " + dir + ".",
    key: fmt(ans), fill: [String(ans)]
  };
};

/* Draw it: put the parts of a number into the chart */
M.expand = function (d) {
  const n = d.parts.reduce((s, x) => s + x, 0), cols = colsFor(n), ds = digits(n, cols), ps = places(cols), z = zeroPlace(n, cols);
  return {
    q: "Write the number in the chart.", sum: d.parts.map(fmt).join(" + ") + " = ?",
    how: "Tap a box in the chart. Then tap a digit.",
    ui: { k: "cells", cols: cols }, blanks: ds.map(() => ({ len: 1, w: "cell" })),
    check(r) {
      const parts = ds.map((x, i) => r.v[i] === String(x));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const typed = r.v.join("");
      if (z && noZeros(typed) === noZeros(n)) return { ok: false, msg: "One place has no value. Write 0 in the " + z.many + " place.", parts: parts };
      return { ok: false, msg: "Check the " + ps[parts.indexOf(false)].many + " place.", parts: parts };
    },
    hint: { pic: { k: "stack", parts: d.parts, cols: cols }, step: z ? "There are no " + z.many + ". Write 0 in the " + z.many + " place." : "Put each part in its own place." },
    worked: { text: d.parts.map(fmt).join(" + ") + " = " + fmt(n) + ".", pic: { k: "chart", n: n, cols: cols } },
    yes: d.parts.map(fmt).join(" + ") + " = " + fmt(n) + "." + (z ? " The 0 holds the " + z.many + " place." : ""),
    key: fmt(n), fill: ds.map(String)
  };
};

/* Solve it: "Calculate." with one line for each part */
M.calc = function (d) {
  const it = d.items, ans = it.map(x => (x.op === "x" ? x.n * x.by : x.n / x.by));
  return {
    q: "Calculate.", marks: it.length,
    lines: it.map((x, i) => (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + fmt(x.n) + " " + SYM[x.op] + " " + x.by + " = {" + i + "}"),
    blanks: it.map(() => ({ len: 6, w: "big" })),
    check(r) {
      const parts = it.map((x, i) => +r.v[i] === ans[i] && r.v[i] !== "");
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + slipMsg(it[i].n, it[i].op, it[i].by, +r.v[i]), parts: parts };
    },
    hint: { pic: it.map(x => ({ k: "chart", n: x.n, cols: 5, cap: fmt(x.n) + " " + SYM[x.op] + " " + x.by })), step: it.map(x => ruleText(x.op, x.by)).join(" ") },
    worked: { text: it.map((x, i) => fmt(x.n) + " " + SYM[x.op] + " " + x.by + " = " + fmt(ans[i]) + " (" + (x.by === 10 ? "one place" : "two places") + " to the " + (x.op === "x" ? "left" : "right") + ")").join(". ") + "." },
    yes: it.map((x, i) => fmt(x.n) + " " + SYM[x.op] + " " + x.by + " = " + fmt(ans[i])).join(" and ") + ".",
    key: ans.map(fmt).join(" ; "), fill: ans.map(String)
  };
};

/* Solve it: missing numbers in × and ÷ by 10 and 100 */
M.missing = function (d) {
  const it = d.items.map(x => {
    const res = x.op === "x" ? x.a * x.by : x.a / x.by;
    return x.hide === "a"
      ? { line: "{#} " + SYM[x.op] + " " + x.by + " = " + fmt(res), ans: x.a, tell: fmt(x.a) + " " + SYM[x.op] + " " + x.by + " = " + fmt(res),
        tip: x.op === "x" ? "Which number moves " + (x.by === 10 ? "1 place" : "2 places") + " to the left to make " + fmt(res) + "?" : "Which number moves " + (x.by === 10 ? "1 place" : "2 places") + " to the right to make " + fmt(res) + "?", show: res }
      : { line: fmt(x.a) + " " + SYM[x.op] + " {#} = " + fmt(res), ans: x.by, tell: fmt(x.a) + " " + SYM[x.op] + " " + x.by + " = " + fmt(res),
        tip: "How many places did the digits of " + fmt(x.a) + " move? One place is 10. Two places is 100.", show: x.a };
  });
  return {
    q: it.length > 1 ? "Write the missing numbers." : "Write the missing number.", marks: it.length,
    lines: it.map((x, i) => (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + x.line.replace("{#}", "{" + i + "}")),
    blanks: it.map(() => ({ len: 6, w: "box" })),
    check(r) {
      const parts = it.map((x, i) => r.v[i] !== "" && +r.v[i] === x.ans);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + it[i].tip, parts: parts };
    },
    hint: { pic: it.map(x => ({ k: "chart", n: x.show, cols: 5 })), step: it.map(x => x.tip).join(" ") },
    worked: { text: it.map(x => x.tell).join(". ") + "." },
    yes: it.map(x => x.tell).join(" and ") + ".",
    key: it.map(x => fmt(x.ans)).join(" ; "), fill: it.map(x => String(x.ans))
  };
};

/* Solve it: write the number from its parts */
M.fromexp = function (d) {
  const n = d.parts.reduce((s, x) => s + x, 0), cols = colsFor(n), z = zeroPlace(n, cols);
  return {
    q: "Write the number.",
    lines: [d.parts.map(fmt).join(" + ") + " = {0}"], blanks: [{ len: 6, w: "big" }],
    check(r) {
      if (+r.v[0] === n) return { ok: true };
      if (z && noZeros(r.v[0]) === noZeros(n)) return { ok: false, msg: "One place has no value. Zero must hold that place.", parts: [false] };
      return { ok: false, msg: "Put each part in its own place.", parts: [false] };
    },
    hint: { pic: { k: "stack", parts: d.parts, cols: cols }, step: z ? "There are no " + z.many + ". Write 0 in the " + z.many + " place." : "Put each part in its own place." },
    worked: { text: d.parts.map(fmt).join(" + ") + " = " + fmt(n) + ".", pic: { k: "chart", n: n, cols: cols } },
    yes: d.parts.map(fmt).join(" + ") + " = " + fmt(n) + ".",
    key: fmt(n), fill: [String(n)]
  };
};

/* Solve it: one part of the number is missing */
M.part = function (d) {
  const n = d.n, cols = colsFor(n), ds = digits(n, cols), ps = places(cols), i = ps.findIndex(p => p.k === d.miss), val = ds[i] * ps[i].v;
  const parts = ds.map((x, j) => (j === i ? "{0}" : x ? fmt(x * ps[j].v) : "")).filter(Boolean);
  return {
    q: "Write the missing number.",
    lines: [fmt(n) + " = " + parts.join(" + ")], blanks: [{ len: 6, w: "box" }],
    check(r) {
      const v = +r.v[0];
      if (v === val) return { ok: true };
      if (v === ds[i]) return { ok: false, msg: ds[i] + " is the digit. What is it worth in the " + ps[i].many + " place?", parts: [false] };
      return { ok: false, msg: "Which digit of " + fmt(n) + " is missing from the sum?", parts: [false] };
    },
    hint: { pic: { k: "chart", n: n, cols: cols }, step: "The " + ds[i] + " is in the " + ps[i].many + " place." },
    worked: { text: "The " + ds[i] + " is in the " + ps[i].many + " place, so it is worth " + fmt(val) + ". " + fmt(n) + " = " + parts.join(" + ").replace("{0}", fmt(val)) + ".", pic: { k: "chart", n: n, cols: cols, hl: ps[i].k, vals: true } },
    yes: fmt(n) + " = " + parts.join(" + ").replace("{0}", fmt(val)) + ".",
    key: fmt(val), fill: [String(val)]
  };
};

/* Solve it: write the value of a digit */
M.value = function (d) {
  const n = d.n, cols = colsFor(n), ds = digits(n, cols), ps = places(cols), i = ds.indexOf(d.d), val = d.d * ps[i].v;
  return {
    q: "Write the value of the digit <b>" + d.d + "</b> in <b>" + fmt(n) + "</b>.",
    lines: ["{0}"], blanks: [{ len: 6, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === val) return { ok: true };
      if (v === d.d) return { ok: false, msg: d.d + " is the digit. What is it worth in its place?", parts: [false] };
      if (v === n) return { ok: false, msg: "That is the whole number. Write what the " + d.d + " is worth.", parts: [false] };
      return { ok: false, msg: "Which place is the " + d.d + " in?", parts: [false] };
    },
    hint: { pic: { k: "chart", n: n, cols: cols }, step: "The " + d.d + " is in the " + ps[i].many + " place." },
    worked: { text: "The " + d.d + " is in the " + ps[i].many + " place. Its value is " + fmt(val) + ".", pic: { k: "chart", n: n, cols: cols, hl: ps[i].k, vals: true } },
    yes: "The " + d.d + " is in the " + ps[i].many + " place, so it is worth " + fmt(val) + ".",
    key: fmt(val), fill: [String(val)]
  };
};

/* Solve it: write a number name in digits */
M.name = function (d) {
  const n = d.n, cols = colsFor(n), z = zeroPlace(n, cols);
  return {
    q: "Write this number in digits.", name: n,
    lines: ["{0}"], blanks: [{ len: 6, w: "big" }],
    check(r) {
      if (+r.v[0] === n) return { ok: true };
      if (z && noZeros(r.v[0]) === noZeros(n)) return { ok: false, msg: "Check the " + z.many + " place. The name has no " + z.many + ", so zero must hold that place.", parts: [false] };
      return { ok: false, msg: "Read one part of the name at a time.", parts: [false] };
    },
    hint: { pic: { k: "name", n: n }, step: z ? "The name has no " + z.many + ". Write 0 in the " + z.many + " place." : "Read one part at a time." },
    worked: { text: cap(words(n)) + " = " + fmt(n) + ".", pic: { k: "chart", n: n, cols: cols } },
    yes: cap(words(n)) + " is " + fmt(n) + ".",
    key: fmt(n), fill: [String(n)]
  };
};

/* Solve it: tick another way to make the number */
M.regroup = function (d) {
  const n = d.n;
  const opts = arrange(d.opts.map(b => ({ b: b, html: cap(say(b)), ok: total(b) === n, why: total(b) === n ? "" : cap(say(b)) + " make " + fmt(total(b)) + ", not " + fmt(n) + "." })), d.at);
  const sum = b => { const ps = places(4); return b.map((c, i) => (c ? fmt(c * ps[i].v) : "")).filter(Boolean).join(" + "); };
  return {
    q: "Which is another way to make <b>" + fmt(n) + "</b>?", sub: "Tick (✓) one box.", letters: !!d.letters,
    opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "mat", b: digits(n, 4), counts: true, cap: fmt(n) + " with blocks" }, step: d.tip || "Work out each one. Add the thousands, hundreds, tens and ones." },
    worked: { text: opts.map((o, i) => (d.letters ? LET[i] + ": " : "") + sum(o.b) + " = " + fmt(total(o.b)) + (o.ok ? " ✓" : "")).join(". ") + "." },
    yes: cap(say(opts.find(o => o.ok).b)) + " make " + fmt(n) + ".",
    key: (d.letters ? LET[opts.findIndex(o => o.ok)] + ": " : "") + say(opts.find(o => o.ok).b)
  };
};

/* Solve it: tick the number that a regrouped description makes */
M.same = function (d) {
  const n = total(d.b), ps = places(4), i = d.b.findIndex(c => c >= 10);
  const opts = arrange(d.opts.map(v => ({ html: fmt(v), ok: v === n, why: fmt(v) + " = " + say(digits(v, colsFor(v))) + "." })), d.at);
  return {
    q: "<b>" + cap(say(d.b)) + "</b> is the same as:", sub: "Tick (✓) one box.",
    opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Work out " + cnt(d.b[i], ps[i]) + " first." }; },
    hint: { pic: { k: "mat", b: d.b, counts: true }, step: "10 " + ps[i].many + " make 1 " + ps[i - 1].one + ". So " + cnt(d.b[i], ps[i]) + " = " + fmt(d.b[i] * ps[i].v) + "." },
    worked: { text: d.b.map((c, j) => (c ? cnt(c, ps[j]) + " = " + fmt(c * ps[j].v) : "")).filter(Boolean).join(". ") + ". " + d.b.map((c, j) => (c ? fmt(c * ps[j].v) : "")).filter(Boolean).join(" + ") + " = " + fmt(n) + "." },
    yes: cap(say(d.b)) + " make " + fmt(n) + ".",
    key: fmt(n)
  };
};

/* Solve it: "Is ... correct?" Decide, then choose the reason. */
M.claim = function (d) {
  const rs = arrange(d.reasons.map((x, i) => ({ html: x.t, ok: i === 0, why: x.why || "" })), d.at);
  return {
    q: d.who + " says:", says: d.says, ask: "Is " + d.who + " correct?", marks: 2, who: d.who, opts: rs, verdict: d.ok,
    sub: "Choose <b>correct</b> or <b>incorrect</b>. Then tick (✓) the best reason.",
    ready: r => !!r.dec && r.pick >= 0,
    check(r) {
      const decOk = (r.dec === "correct") === d.ok, o = rs[r.pick];
      if (decOk && o.ok) return { ok: true };
      if (!decOk && !o.ok) return { ok: false, msg: o.why || "Work it out first. Then decide.", decOk: false, reasonOk: false };
      if (!decOk) return { ok: false, msg: "Your reason is good. Now read your first choice again: correct or incorrect?", decOk: false, reasonOk: true };
      return { ok: false, msg: o.why || "The reason does not fit. Use numbers to show why.", decOk: true, reasonOk: false };
    },
    hint: d.hint,
    worked: { text: d.worked, model: d.model },
    yes: d.model,
    key: (d.ok ? "correct" : "incorrect") + " | " + d.reasons[0].t
  };
};

/* Mini test: a short real-life problem. The numbers are in the data, the answer is worked out here. */
M.story = function (d) {
  const nm = d.small === 10 ? "tens" : "hundreds";
  let ans, work, step, slips = [];
  if (d.kind === "times") {
    ans = d.n * d.by; work = fmt(d.n) + " × " + d.by + " = " + fmt(ans);
    step = "There are " + d.by + " in each " + d.one + ". So multiply " + fmt(d.n) + " by " + d.by + ".";
    slips = [[d.n + d.by, "Do not add. There are " + fmt(d.n) + " " + d.many + " with " + d.by + " in each one. Multiply."], [d.n, "That is the number of " + d.many + ". Each " + d.one + " holds " + d.by + "."],
      [d.n * (d.by === 10 ? 100 : 10), slipMsg(d.n, "x", d.by, d.n * (d.by === 10 ? 100 : 10))]];
  } else if (d.kind === "share") {
    ans = d.total / d.by; work = fmt(d.total) + " ÷ " + d.by + " = " + fmt(ans);
    step = "Each " + d.one + " holds " + d.by + ". So divide " + fmt(d.total) + " by " + d.by + ".";
    slips = [[d.total * d.by, "That is multiplying. The number of " + d.many + " is smaller than " + fmt(d.total) + "."], [d.total - d.by, "Do not subtract. Put " + d.by + " in each " + d.one + ". Divide."],
      [d.total / (d.by === 10 ? 100 : 10), slipMsg(d.total, "d", d.by, d.total / (d.by === 10 ? 100 : 10))]];
  } else if (d.kind === "need") {
    const got = d.have * d.big, left = d.total - got; ans = left / d.small;
    work = d.have + " × " + fmt(d.big) + " = " + fmt(got) + ". " + fmt(d.total) + " − " + fmt(got) + " = " + fmt(left) + ". " + fmt(left) + " is " + ans + " " + nm;
    step = "First find how many are still missing: " + fmt(d.total) + " − " + fmt(got) + ". Then make that number with " + nm + ".";
    slips = [[(d.total % d.big) / d.small, "That makes only " + fmt(got + (d.total % d.big)) + ". You need " + fmt(d.total) + "."], [left, fmt(left) + " are still missing. How many " + nm + " make " + fmt(left) + "?"]];
  } else {
    const a = d.nb * d.big, b = d.ns * d.small; ans = a + b;
    work = d.nb + " × " + fmt(d.big) + " = " + fmt(a) + ". " + d.ns + " × " + d.small + " = " + fmt(b) + ". " + fmt(a) + " + " + fmt(b) + " = " + fmt(ans);
    step = "Work out each part. " + d.ns + " " + nm + " make " + fmt(b) + ".";
    slips = [[+(String(d.nb) + String(d.ns)), "Do not write the digits side by side. " + d.ns + " " + nm + " make " + fmt(b) + "."], [a + d.ns, d.ns + " " + nm + " are worth " + fmt(b) + ", not " + d.ns + "."]];
  }
  return {
    q: d.text, real: d.pic || "",
    lines: ["{0} " + d.unit], blanks: [{ len: 6, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (r.v[0] !== "" && v === ans) return { ok: true };
      const s = slips.find(x => x[0] === v);
      return { ok: false, msg: s ? s[1] : step, parts: [false] };
    },
    hint: { pic: null, step: step },
    worked: { text: work + ". The answer is " + fmt(ans) + " " + d.unit + "." },
    yes: work + ".",
    key: fmt(ans), fill: [String(ans)]
  };
};

/* a chain of boxes: an operation on each arrow, one box is printed, the others are empty.
   When the printed box is the last one, the child works backwards. */
M.chain = function (d) {
  const vals = [d.start]; d.ops.forEach(o => vals.push(o[0] === "x" ? vals[vals.length - 1] * o[1] : vals[vals.length - 1] / o[1]));
  const emp = vals.map((v, i) => i).filter(i => i !== d.give), OPP = { x: "d", d: "x" }, nm = ["first", "middle", "last"];
  const cell = i => (i === d.give ? '<span class="cbox">' + fmt(vals[i]) + "</span>" : "{" + emp.indexOf(i) + "}");
  const arw = o => '<span class="carw"><b>' + SYM[o[0]] + " " + o[1] + "</b></span>";
  /* how to get box i from the box next to it that is nearer to the printed box */
  const how = i => (i > d.give ? "going forwards: " + fmt(vals[i - 1]) + " " + SYM[d.ops[i - 1][0]] + " " + d.ops[i - 1][1] + " = " + fmt(vals[i])
    : "going backwards, " + SYM[d.ops[i][0]] + " " + d.ops[i][1] + " becomes " + SYM[OPP[d.ops[i][0]]] + " " + d.ops[i][1] + ": " + fmt(vals[i + 1]) + " " + SYM[OPP[d.ops[i][0]]] + " " + d.ops[i][1] + " = " + fmt(vals[i]));
  const order = emp.slice().sort((a, b) => Math.abs(a - d.give) - Math.abs(b - d.give)), back = emp.some(i => i < d.give);
  return {
    q: "Write the missing numbers in the boxes.", marks: emp.length,
    sub: "Follow the arrows from left to right.",
    lines: ['<span class="chain">' + vals.map((v, i) => cell(i) + (i < d.ops.length ? arw(d.ops[i]) : "")).join("") + "</span>"],
    blanks: emp.map(() => ({ len: 6, w: "cbox" })),
    check(r) {
      const parts = emp.map((i, k) => r.v[k] !== "" && +r.v[k] === vals[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = order.find(j => !parts[emp.indexOf(j)]), v = +r.v[emp.indexOf(i)], near = i > d.give ? vals[i - 1] : vals[i + 1], o = i > d.give ? d.ops[i - 1] : d.ops[i];
      let msg = "Look at the " + nm[i] + " box. ";
      if (i < d.give && v === (o[0] === "x" ? near * o[1] : near / o[1])) msg += "You went forwards. To go backwards, do the opposite: " + SYM[OPP[o[0]]] + " " + o[1] + ".";
      else if (i < d.give) msg += "Go backwards from " + fmt(near) + ". The opposite of " + SYM[o[0]] + " " + o[1] + " is " + SYM[OPP[o[0]]] + " " + o[1] + ".";
      else msg += slipMsg(near, o[0], o[1], v) || "Check " + fmt(near) + " " + SYM[o[0]] + " " + o[1] + ".";
      return { ok: false, msg: msg, parts: parts };
    },
    hint: { pic: { k: "chart", n: vals[d.give], cols: 5, cap: "You know this number: " + fmt(vals[d.give]) },
      step: back ? "Start at the number you know. To go backwards along an arrow, do the opposite. " + emp.filter(i => i < d.give).sort((x, y) => y - x).map(i => "The opposite of " + SYM[d.ops[i][0]] + " " + d.ops[i][1] + " is " + SYM[OPP[d.ops[i][0]]] + " " + d.ops[i][1] + ".").join(" ") : "Start at the number you know and follow each arrow." },
    worked: { text: "Start at " + fmt(vals[d.give]) + ". " + order.map(i => cap(how(i))).join(". ") + "." },
    yes: vals.map(fmt).join(" → ") + ".", key: emp.map(i => fmt(vals[i])).join(" ; "), fill: emp.map(i => String(vals[i]))
  };
};

function make(def, mode) {
  const t = M[def.type](def, mode || "your");
  t.type = def.type; t.mode = mode || "your"; t.marks = t.marks || 1; t.def = def;
  if (def.ctx) t.q = def.ctx + " " + t.q;                 /* a real-life sentence in front of the question */
  if (def.pic && !t.real) { t.real = def.pic; t.lcd = def.n; }
  if (def.fig && !t.fig) t.fig = def.fig;                 /* a picture that comes with the data (for a claim about a scale or a table) */
  /* "7:00 a.m." at the end of a sentence must not get a second full stop */
  const tidy = x => (typeof x === "string" ? x.replace(/([ap])\.m\.(<\/b>)?\./g, "$1.m.$2") : x);
  t.q = tidy(t.q); t.yes = tidy(t.yes); if (t.worked) t.worked.text = tidy(t.worked.text); if (t.hint && t.hint.step) t.hint.step = tidy(t.hint.step);
  return t;
}

/* signed numbers are shown with a real minus sign: −4 */
const sg = n => (n < 0 ? "\u2212" + fmt(-n) : fmt(n));
const ORD = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
return { P: P, PI: PI, places: places, fmt: fmt, sg: sg, ORD: ORD, digits: digits, colsFor: colsFor, total: total, cnt: cnt, cap: cap, say: say, words: words, nameParts: nameParts, SYM: SYM, LET: LET, make: make,
  M: M, arrange: arrange, same: same, slipMsg: slipMsg, ruleText: ruleText, get types() { return Object.keys(M); } };
})();
if (typeof module !== "undefined") module.exports = MX;

/* Question models for Stop 2 (patterns and negative numbers) and Stop 3 (compare, order and round).
   No page code here. Each model gives the question, the check with feedback, hints, the worked answer,
   fill (what goes in the answer boxes) and right (the right state of the tool, if there is one). */
(function () {
"use strict";
const M = MX.M, fmt = MX.fmt, sg = MX.sg, ORD = MX.ORD, arrange = MX.arrange, LET = MX.LET;
const list = a => a.map(sg).join(", ");
const jumps = n => n + (n === 1 ? " jump" : " jumps");
const SYMH = { "<": "&lt;", ">": "&gt;", "=": "=" };
const NUMW = ["", "", "two", "three"];

/* ================= STOP 2 ================= */

/* Build it: jump along the number track, also below zero */
M.jump = function (d, mode) {
  const s = d.dir === "on" ? 1 : -1, end = d.start + s * d.step * d.n, seq = Array.from({ length: d.n + 1 }, (x, i) => d.start + s * d.step * i), word = d.dir === "on" ? "on" : "back";
  return {
    q: "Start at <b>" + sg(d.start) + "</b>. Count " + word + " in steps of <b>" + fmt(d.step) + "</b>. Make <b>" + d.n + "</b> jumps. Where do you land?",
    how: mode === "our" ? "Let's jump together. Tap <b>Jump " + word + "</b> and count each jump. Watch what happens at zero." : "Tap <b>Jump " + word + "</b> " + d.n + " times. Then write the number.",
    ui: { k: "nline", mode: "jump", skin: "wood", min: d.min, max: d.max, tick: d.tick || 1, lab: d.lab || 1, start: d.start, jump: d.step, dir: d.dir },
    lines: ["{0}"], blanks: [{ len: 5, w: "big", neg: true }],
    check(r) {
      const v = +r.v[0];
      if (v === end) return { ok: true };
      if (!r.hops) return { ok: false, msg: "Tap “Jump " + word + "” first. Zip will show you the way.", parts: [false] };
      if (v === -end) return { ok: false, msg: end < 0 ? "You are below zero now. A number below zero needs a minus sign." : "You are above zero now. This number has no minus sign.", parts: [false] };
      if (r.hops !== d.n) return { ok: false, msg: "You made " + jumps(r.hops) + ". Make " + d.n + " jumps from " + sg(d.start) + ".", parts: [false] };
      return { ok: false, msg: "Read the number under Zip.", parts: [false] };
    },
    hint: { step: "Each jump is " + fmt(d.step) + ". Say the numbers: " + list(seq.slice(0, 3)) + " ..." + (end < 0 && d.start >= 0 ? " After 0 the numbers are negative." : "") },
    worked: { text: "Count " + word + " in " + fmt(d.step) + "s: " + list(seq) + ". You land on " + sg(end) + "." },
    yes: list(seq) + ". You land on " + sg(end) + ".",
    key: sg(end), fill: [String(end)], right: { pos: end, hops: d.n }
  };
};

/* Build it: make a square number with counters */
M.sqbuild = function (d, mode) {
  const k = d.k, n = k * k;
  return {
    q: "Build the <b>" + ORD[k] + " [[square number]]</b> with counters. How many counters do you need?",
    how: mode === "our" ? "A square number makes a square. Tap <b>Bigger</b> until you have " + k + " rows of " + k + "." : "Make a square with " + k + " rows of " + k + ". Then write how many counters.",
    ui: { k: "grid", mode: "square", rows: 1, cols: 1, max: 9 },
    lines: ["{0} counters"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (r.rows === k && v === n) return { ok: true };
      if (r.rows !== k) return { ok: false, msg: "Your square has " + r.rows + " rows of " + r.cols + ". Make " + k + " rows of " + k + ".", parts: [v === n] };
      if (v === 2 * k) return { ok: false, msg: k + " + " + k + " is not the same as " + k + " rows of " + k + ". Count every counter.", parts: [false] };
      if (v === 4 * k || v === 4 * k - 4) return { ok: false, msg: "Count all the counters, not only the ones on the outside.", parts: [false] };
      return { ok: false, msg: "Count the counters: " + k + " rows of " + k + ".", parts: [false] };
    },
    hint: { step: "The " + ORD[k] + " square number is " + k + " × " + k + "." },
    worked: { text: k + " rows of " + k + " counters: " + k + " × " + k + " = " + n + ". The " + ORD[k] + " square number is " + n + ".", pic: { k: "dots", r: k, c: k } },
    yes: k + " × " + k + " = " + n + ". The " + ORD[k] + " square number is " + n + ".",
    key: String(n), fill: [String(n)], right: { rows: k, cols: k }
  };
};

/* A temperature gets warmer or colder. With the thermometer tool, or on paper with a picture. */
M.temp = function (d) {
  const end = d.start + d.change, up = d.change > 0, n = Math.abs(d.change), min = d.min != null ? d.min : -10, max = d.max != null ? d.max : 10, cross = (d.start < 0) !== (end < 0) && end !== 0 && d.start !== 0;
  const path = n <= 8 ? Array.from({ length: n + 1 }, (x, i) => d.start + (up ? i : -i)).map(sg).join(", ") : cross ? sg(d.start) + " to 0 is " + Math.abs(d.start) + " degrees. Then " + (n - Math.abs(d.start)) + " more" : sg(d.start) + (up ? " + " : " − ") + n + " = " + sg(end);
  const t = {
    q: d.text || "The [[temperature]] is <b>" + sg(d.start) + " °C</b>. It gets <b>" + n + " degrees " + (up ? "warmer" : "colder") + "</b>. What is the temperature now?",
    lines: ["{0} °C"], blanks: [{ len: 3, w: "big", neg: true }],
    check(r) {
      const v = +r.v[0];
      if (v === end) return { ok: true };
      if (v === -end) return { ok: false, msg: end < 0 ? "The temperature is below zero. Write a minus sign in front." : "The temperature is above zero now. It has no minus sign.", parts: [false] };
      if (v === d.start - d.change) return { ok: false, msg: (up ? "The temperature goes up, so count up " : "The temperature goes down, so count down ") + n + " from " + sg(d.start) + ".", parts: [false] };
      return { ok: false, msg: "Start at " + sg(d.start) + ". Count " + (up ? "up " : "down ") + n + " degrees, one at a time. Do not miss zero.", parts: [false] };
    },
    hint: { step: "Start at " + sg(d.start) + ". Count " + (up ? "up " : "down ") + n + " degrees, one at a time." + (cross ? " You will cross zero." : "") },
    worked: { text: "Start at " + sg(d.start) + " °C and count " + (up ? "up" : "down") + ": " + path + ". The temperature is " + sg(end) + " °C.", pic: { k: "thermo", t: end, min: min, max: max } },
    yes: "From " + sg(d.start) + " °C, " + n + " degrees " + (up ? "up" : "down") + " is " + sg(end) + " °C.",
    key: sg(end), fill: [String(end)]
  };
  if (d.paper) t.fig = { k: "thermo", t: d.start, min: min, max: max };
  else { t.ui = { k: "thermo", min: min, max: max, start: d.start, dir: up ? 1 : -1 }; t.how = "Tap <b>" + (up ? "Warmer" : "Colder") + "</b> " + n + " times. Watch the red line. Then write the temperature."; t.right = { pos: end }; }
  return t;
};

/* read a thermometer that shows a temperature below zero */
M.thermoread = function (d) {
  const t = d.t, min = d.min != null ? d.min : -10, max = d.max != null ? d.max : 10;
  return {
    q: "What [[temperature]] does the thermometer show?", fig: { k: "thermo", t: t, min: min, max: max },
    lines: ["{0} °C"], blanks: [{ len: 3, w: "big", neg: true }],
    check(r) {
      const v = +r.v[0];
      if (v === t) return { ok: true };
      if (v === -t) return { ok: false, msg: t < 0 ? "The red line is below zero. Write a minus sign in front." : "The red line is above zero. This number has no minus sign.", parts: [false] };
      return { ok: false, msg: "Each small line is 1 degree. Count from 0 to the top of the red line.", parts: [false] };
    },
    hint: { step: "Find 0 first. Each small line is 1 degree. " + (t < 0 ? "Count down from 0 to the top of the red line." : "Count up from 0 to the top of the red line.") },
    worked: { text: "The top of the red line is " + Math.abs(t) + (t < 0 ? " lines below 0. The temperature is " : " lines above 0. The temperature is ") + sg(t) + " °C." },
    yes: "The thermometer shows " + sg(t) + " °C.", key: sg(t), fill: [String(t)]
  };
};

/* tick the picture that shows a square number */
M.sqpick = function (d) {
  const opts = arrange(d.opts.map(o => ({ fig: { k: "dots", r: o[0], c: o[1] }, alt: o[0] + " rows of " + o[1], ok: o[0] === o[1], n: o[0] * o[1], why: o[0] + " rows of " + o[1] + " make a rectangle, not a square." })), d.at), ok = opts.find(o => o.ok);
  return {
    q: "Which picture shows a <b>[[square number]]</b>?", sub: "Tick (✓) one box.", how: "A square number makes a square. It has the same number of rows and columns.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Look for the same number of rows and columns." }; },
    hint: { step: "Count the rows. Then count how many are in each row. Are the two numbers the same?" },
    worked: { text: opts.map((o, i) => LET[i] + ": " + o.alt + " = " + o.n + (o.ok ? " ✓" : "")).join(". ") + ". " + ok.n + " is a square number." },
    yes: cap1(ok.alt) + " make a square. " + ok.n + " is a square number.", key: LET[opts.indexOf(ok)]
  };
};
function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* sequences: steps that stay the same (linear), or double, halve and growing steps (non-linear) */
function seq(d, n) { const t = [d.a]; for (let i = 1; i < n; i++) { const p = t[i - 1]; t.push(d.kind === "double" ? p * 2 : d.kind === "halve" ? p / 2 : d.kind === "grow" ? p + d.d + (i - 1) * (d.g || 1) : p + d.d); } return t; }
const ruleOf = d => (d.kind === "double" ? "double each time" : d.kind === "halve" ? "halve each time" : d.kind === "grow" ? "add " + d.d + ", then " + (d.d + (d.g || 1)) + ", then " + (d.d + 2 * (d.g || 1)) + ", and so on" : (d.d > 0 ? "add " : "subtract ") + fmt(Math.abs(d.d)) + " each time");
const labs = (d, n) => Array.from({ length: n - 1 }, (x, i) => (d.kind === "double" ? "× 2" : d.kind === "halve" ? "÷ 2" : d.kind === "grow" ? "+ " + (d.d + i * (d.g || 1)) : (d.d > 0 ? "+ " : "− ") + fmt(Math.abs(d.d))));

M.seqnext = function (d, mode) {
  const n = d.shown + d.ask, t = seq(d, n), L = labs(d, n), lin = !d.kind;
  return {
    q: d.ask === 1 ? "Write the next number in the [[sequence]]." : "Write the next " + NUMW[d.ask] + " numbers in the [[sequence]].",
    how: mode === "our" ? "Find the [[rule]] first. How do you get from one number to the next?" : "Find the rule. Then carry on the sequence.",
    ui: d.line ? { k: "pics", list: [{ k: "hops", terms: t.slice(0, d.shown), blanks: d.ask, labs: mode === "our" ? L.slice(0, d.shown - 1) : [L[0]] }] } : null,
    lines: [list(t.slice(0, d.shown)) + ", " + Array.from({ length: d.ask }, (x, i) => "{" + i + "}").join(", ")],
    blanks: Array.from({ length: d.ask }, () => ({ len: 5, w: "mid", neg: true })),
    check(r) {
      const parts = r.v.map((x, i) => x !== "" && +x === t[d.shown + i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), want = t[d.shown + i];
      if (+r.v[i] === -want) return { ok: false, msg: want < 0 ? "This number is below zero. It needs a minus sign." : "This number is above zero. It has no minus sign.", parts: parts };
      return { ok: false, msg: lin ? "Look at the jump from " + sg(t[0]) + " to " + sg(t[1]) + ". Use the same jump each time." : "The jumps are not all the same. Look how the jump changes each time.", parts: parts };
    },
    hint: { pic: d.line ? null : { k: "hops", terms: t.slice(0, d.shown), blanks: d.ask, labs: L.slice(0, d.shown - 1) }, step: "The rule is: " + ruleOf(d) + "." },
    worked: { text: "The rule is: " + ruleOf(d) + ". The sequence is " + list(t) + ".", pic: { k: "hops", terms: t, blanks: 0, labs: L } },
    yes: "The rule is: " + ruleOf(d) + ". " + list(t) + ".",
    key: t.slice(d.shown).map(sg).join(" ; "), fill: t.slice(d.shown).map(String)
  };
};

M.seqgap = function (d) {
  const t = seq(d, d.n), g = d.gaps, known = t.map((x, i) => g.indexOf(i) < 0), p = known.findIndex((x, i) => x && known[i + 1]); let k = 0;
  return {
    q: g.length > 1 ? "Write the missing numbers in the [[sequence]]." : "Write the missing number in the [[sequence]].",
    lines: [t.map((x, i) => (g.indexOf(i) >= 0 ? "{" + (k++) + "}" : sg(x))).join(", ")], blanks: g.map(() => ({ len: 5, w: "mid", neg: true })),
    check(r) {
      const parts = g.map((gi, i) => r.v[i] !== "" && +r.v[i] === t[gi]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      return { ok: false, msg: "Find two numbers that are next to each other. The jump between them is the rule.", parts: parts };
    },
    hint: { step: sg(t[p]) + " and " + sg(t[p + 1]) + " are next to each other. Work out the jump between them. That is the rule." },
    worked: { text: "From " + sg(t[p]) + " to " + sg(t[p + 1]) + " the rule is: " + ruleOf(d) + ". The sequence is " + list(t) + ".", pic: { k: "hops", terms: t, blanks: 0, labs: labs(d, d.n) } },
    yes: "The rule is: " + ruleOf(d) + ". " + list(t) + ".",
    key: g.map(i => sg(t[i])).join(" ; "), fill: g.map(i => String(t[i]))
  };
};

M.seqrule = function (d) {
  const t = seq(d, d.n), ad = Math.abs(d.d), up = d.d > 0, off = d.off || 1;
  const opts = arrange([{ html: (up ? "add " : "subtract ") + fmt(ad), ok: true },
    { html: (up ? "subtract " : "add ") + fmt(ad), ok: false, why: "The numbers get " + (up ? "bigger" : "smaller") + ", so the rule is to " + (up ? "add" : "subtract") + "." },
    { html: (up ? "add " : "subtract ") + fmt(ad + off), ok: false, why: "Check the jump. From " + sg(t[0]) + " to " + sg(t[1]) + " is " + fmt(ad) + ", not " + fmt(ad + off) + "." }], d.at);
  return {
    q: "What is the [[rule]] of this [[sequence]]?", sum: list(t) + ", ...", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "hops", terms: t, blanks: 0, labs: ["?"] }, step: "Work out the jump from " + sg(t[0]) + " to " + sg(t[1]) + ". Is it the same every time?" },
    worked: { text: "Each number is " + fmt(ad) + (up ? " more" : " less") + " than the one before. The rule is: " + ruleOf(d) + ".", pic: { k: "hops", terms: t, blanks: 0, labs: labs(d, d.n) } },
    yes: "The rule is: " + ruleOf(d) + ".", key: (up ? "add " : "subtract ") + fmt(ad)
  };
};

/* the number at a place in a sequence (for example the 10th number) */
M.seqnth = function (d) {
  const ans = d.a + (d.n - 1) * d.d, up = d.d > 0, ad = Math.abs(d.d), t = seq(d, 4);
  return {
    q: "A [[sequence]] starts at <b>" + sg(d.a) + "</b>. The [[rule]] is <b>" + (up ? "add " : "subtract ") + fmt(ad) + "</b>. What is the <b>" + ORD[d.n] + "</b> number in the sequence?",
    lines: ["{0}"], blanks: [{ len: 5, w: "big", neg: true }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (v === d.a + d.n * d.d) return { ok: false, msg: "The 1st number is " + sg(d.a) + ". To reach the " + ORD[d.n] + " number you make only " + (d.n - 1) + " jumps.", parts: [false] };
      if (v === d.a + (d.n - 2) * d.d) return { ok: false, msg: "That is the " + ORD[d.n - 1] + " number. Make one more jump.", parts: [false] };
      return { ok: false, msg: "Write the sequence: " + list(t) + " ... Carry on to the " + ORD[d.n] + " number.", parts: [false] };
    },
    hint: { step: "The 1st number is " + sg(d.a) + ". The " + ORD[d.n] + " number is " + (d.n - 1) + " jumps of " + fmt(ad) + " away.", pic: { k: "hops", terms: t, blanks: 1, labs: labs(d, 4) } },
    worked: { text: (d.n - 1) + " jumps of " + fmt(ad) + " make " + fmt((d.n - 1) * ad) + ". " + sg(d.a) + (up ? " + " : " − ") + fmt((d.n - 1) * ad) + " = " + sg(ans) + "." },
    yes: "The " + ORD[d.n] + " number is " + sg(ans) + ". That is " + (d.n - 1) + " jumps of " + fmt(ad) + " from " + sg(d.a) + ".",
    key: sg(ans), fill: [String(ans)]
  };
};

/* square numbers as dot patterns and as numbers */
M.sqnth = function (d) {
  const k = d.k, n = k * k;
  return {
    q: "These patterns show [[square numbers|square number]]. How many dots will the <b>" + ORD[k] + "</b> pattern have?", fig: { k: "dotseq", ks: [1, 2, 3], ask: k },
    lines: ["{0} dots"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === n) return { ok: true };
      if (v === 2 * k) return { ok: false, msg: "It is not " + k + " + " + k + ". The " + ORD[k] + " pattern has " + k + " rows of " + k + ".", parts: [false] };
      if (v === (k - 1) * (k - 1) || v === (k + 1) * (k + 1)) return { ok: false, msg: "That is a different pattern. The " + ORD[k] + " pattern has " + k + " rows of " + k + ".", parts: [false] };
      return { ok: false, msg: "The " + ORD[k] + " pattern is a square with " + k + " rows of " + k + ".", parts: [false] };
    },
    hint: { step: "Pattern 1 is 1 × 1. Pattern 2 is 2 × 2. Pattern 3 is 3 × 3. What is pattern " + k + "?" },
    worked: { text: "The " + ORD[k] + " pattern has " + k + " rows of " + k + ". " + k + " × " + k + " = " + n + ".", pic: { k: "dots", r: k, c: k } },
    yes: k + " × " + k + " = " + n + ". The " + ORD[k] + " pattern has " + n + " dots.", key: String(n), fill: [String(n)]
  };
};
M.sqval = function (d) {
  const k = d.k, n = k * k;
  return {
    q: "Write the <b>" + ORD[k] + " [[square number]]</b>.", lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === n) return { ok: true };
      if (v === 2 * k) return { ok: false, msg: "That is " + k + " + " + k + ". A square number is a number times itself.", parts: [false] };
      return { ok: false, msg: "The " + ORD[k] + " square number is " + k + " × " + k + ".", parts: [false] };
    },
    hint: { step: "The " + ORD[k] + " square number is " + k + " × " + k + ".", pic: { k: "dotseq", ks: [1, 2, 3] } },
    worked: { text: "The " + ORD[k] + " square number is " + k + " × " + k + " = " + n + "." },
    yes: k + " × " + k + " = " + n + ".", key: String(n), fill: [String(n)]
  };
};
const root = v => Math.round(Math.sqrt(v)), isSq = v => root(v) * root(v) === v;
M.sqtick = function (d) {
  const opts = arrange(d.opts.map(v => { const lo = Math.floor(Math.sqrt(v)); return { html: fmt(v), ok: isSq(v), v: v, why: lo + " × " + lo + " = " + lo * lo + " and " + (lo + 1) + " × " + (lo + 1) + " = " + (lo + 1) * (lo + 1) + ". " + fmt(v) + " is between them." }; }), d.at), ok = opts.find(o => o.ok);
  return {
    q: "Which number is a <b>[[square number]]</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Say the square numbers: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.", pic: { k: "dotseq", ks: [1, 2, 3] } },
    worked: { text: root(ok.v) + " × " + root(ok.v) + " = " + ok.v + ". So " + ok.v + " is a square number." },
    yes: root(ok.v) + " × " + root(ok.v) + " = " + ok.v + ".", key: LET[opts.indexOf(ok)] + ": " + ok.v
  };
};

/* ================= STOP 3 ================= */
const symOf = (a, b) => (a < b ? "<" : a > b ? ">" : "=");
function cmpWhy(a, b) {
  if (a === b) return "Both numbers are the same.";
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi < 0) return "On the number line, " + sg(lo) + " is further to the left than " + sg(hi) + ". So " + sg(lo) + " is less.";
  if (lo < 0) return hi === 0 ? "Negative numbers are less than zero." : "A negative number is always less than a positive number.";
  const A = String(a), B = String(b);
  if (A.length !== B.length) return fmt(hi) + " has more digits, so it is greater.";
  const ps = MX.places(A.length); let i = 0; while (A[i] === B[i]) i++;
  return (i ? "The " + ps.slice(0, i).map(p => p.many).join(" and ") + " are the same. " : "") + "Look at the " + ps[i].many + ": " + A[i] + " is " + (A[i] < B[i] ? "less" : "greater") + " than " + B[i] + ".";
}
M.cmp = function (d, mode) {
  const it = d.items, ans = it.map(x => symOf(x.a, x.b)), two = it.length > 1;
  const t = {
    q: "Write <b>&lt;</b>, <b>&gt;</b> or <b>=</b> in " + (two ? "each box." : "the box."), marks: it.length,
    how: mode === "our" ? "Compare the two numbers. The open side of the sign points to the greater number." : "Which number is greater? Choose the sign.",
    lines: it.map((x, i) => sg(x.a) + " {" + i + "} " + sg(x.b)), blanks: it.map(() => ({ len: 1, w: "sym", sym: true })),
    check(r) {
      const parts = it.map((x, i) => r.v[i] === ans[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), x = it[i];
      return { ok: false, msg: (two ? "Look at the " + (i ? "second" : "first") + " line. " : "") + cmpWhy(x.a, x.b), parts: parts };
    },
    hint: { step: (two ? "" : cmpWhy(it[0].a, it[0].b) + " ") + "The open side of the sign points to the greater number." },
    worked: { text: it.map((x, i) => cmpWhy(x.a, x.b) + " So " + sg(x.a) + " " + SYMH[ans[i]] + " " + sg(x.b) + ".").join(" ") },
    yes: it.map((x, i) => sg(x.a) + " " + SYMH[ans[i]] + " " + sg(x.b)).join(" and ") + ".",
    key: ans.map(x => SYMH[x]).join(" ; "), fill: ans
  };
  if (d.mats) t.ui = { k: "pics", list: [{ k: "mat", u: 5.8, b: MX.digits(it[0].a, 4), counts: mode === "our", cap: fmt(it[0].a) }, { k: "mat", u: 5.8, b: MX.digits(it[0].b, 4), counts: mode === "our", cap: fmt(it[0].b) }] };
  else if (d.line) t.ui = { k: "pics", list: [{ k: "nline", mode: "show", skin: "board", min: d.line.min, max: d.line.max, tick: d.line.tick || 1, lab: d.line.lab || 1, marks: [it[0].a, it[0].b] }] };
  return t;
};

/* put numbers in order with the tiles */
/* a number line that shows a few numbers on both sides of zero (a picture for hints) */
const lineFor = nums => { const lo = Math.min(0, Math.floor(Math.min.apply(null, nums) / 5) * 5), hi = Math.max(0, Math.ceil(Math.max.apply(null, nums) / 5) * 5), wide = hi - lo > 20;
  return { k: "nline", mode: "show", skin: "board", min: lo, max: hi, tick: wide ? 5 : 1, lab: wide ? 1 : 5, marks: nums.slice().sort((x, y) => x - y) }; };
M.order = function (d, mode) {
  const sorted = d.nums.slice().sort((a, b) => a - b), neg = d.nums.some(x => x < 0);
  return {
    q: (d.text ? d.text + " " : "") + "Put the numbers in order. Start with the <b>smallest</b>.",
    how: mode === "our" ? "Tap the smallest number first. " + (neg ? "Negative numbers are smaller than zero." : "Compare the biggest place first.") : "Tap the numbers in order, smallest first. Tap a placed number to take it back.",
    ui: { k: "order", nums: d.nums, from: "smallest", to: "largest" },
    check(r) {
      const parts = r.order.map((x, i) => x === sorted[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      if (r.order.every((x, i) => x === sorted[sorted.length - 1 - i])) return { ok: false, msg: "This is largest first. Start with the smallest number.", parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: "Look at place " + (i + 1) + ". " + (sorted[i] < 0 ? "With negative numbers, the one further from zero is smaller." : "Which number is the smallest of the ones that are left?"), parts: parts };
    },
    hint: neg ? { pic: lineFor(sorted), step: "Negative numbers come first. " + sg(sorted[0]) + " is the furthest below zero." } : { step: "Compare the biggest place first. If it is the same, look at the next place." },
    worked: { text: "From smallest to largest: " + list(sorted) + ".", pic: neg ? lineFor(sorted) : null },
    yes: "From smallest to largest: " + list(sorted) + ".",
    key: list(sorted), right: { order: sorted }
  };
};

/* rounding */
const rnd = (n, to) => Math.floor(n / to + 0.5) * to;
const LOOK = { 10: "ones", 100: "tens", 1000: "hundreds", 10000: "thousands", 100000: "ten thousands" };
function roundBits(n, to) { const lo = Math.floor(n / to) * to, hi = lo + to, ans = rnd(n, to); return { lo: lo, hi: hi, ans: ans, up: ans === hi, dg: Math.floor((n % to) / (to / 10)), mid: lo + to / 2 }; }
M.round = function (d) {
  const n = d.n, to = d.to, b = roundBits(n, to);
  return {
    fig: d.line ? { k: "rline", n: n, to: to } : null,
    q: (d.text ? d.text + " " : "") + "[[Round|round]] <b>" + fmt(n) + "</b> to the [[nearest]] <b>" + fmt(to) + "</b>.",
    lines: ["{0}"], blanks: [{ len: 6, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === b.ans) return { ok: true };
      if (v === (b.up ? b.lo : b.hi)) return { ok: false, msg: "Look at the " + LOOK[to] + " digit. It is " + b.dg + ". " + (b.dg >= 5 ? "5 or more rounds up." : "4 or less rounds down."), parts: [false] };
      if (to > 10 && v === rnd(n, to / 10)) return { ok: false, msg: "That is the nearest " + fmt(to / 10) + ". Round to the nearest " + fmt(to) + ".", parts: [false] };
      if (to < 100000 && v === rnd(n, to * 10)) return { ok: false, msg: "That is the nearest " + fmt(to * 10) + ". Round to the nearest " + fmt(to) + ".", parts: [false] };
      return { ok: false, msg: fmt(n) + " is between " + fmt(b.lo) + " and " + fmt(b.hi) + ". Which one is nearer?", parts: [false] };
    },
    hint: { pic: { k: "rline", n: n, to: to }, step: fmt(n) + " is between " + fmt(b.lo) + " and " + fmt(b.hi) + ". Look at the " + LOOK[to] + " digit." },
    worked: { text: fmt(n) + " is between " + fmt(b.lo) + " and " + fmt(b.hi) + ". The " + LOOK[to] + " digit is " + b.dg + ", so round " + (b.up ? "up" : "down") + " to " + fmt(b.ans) + ".", pic: { k: "rline", n: n, to: to, show: b.ans } },
    yes: fmt(n) + " rounds to " + fmt(b.ans) + ". The " + LOOK[to] + " digit is " + b.dg + ".",
    key: fmt(b.ans), fill: [String(b.ans)]
  };
};
/* rounding on the number track: tap the nearer end */
M.roundline = function (d, mode) {
  const n = d.n, to = d.to, b = roundBits(n, to), half = n === b.mid;
  return {
    q: "[[Round|round]] <b>" + fmt(n) + "</b> to the [[nearest]] <b>" + fmt(to) + "</b>.",
    how: mode === "our" ? "Is " + fmt(n) + " nearer to " + fmt(b.lo) + " or to " + fmt(b.hi) + "? Tap that number." : "Tap the number that " + fmt(n) + " is nearer to.",
    ui: { k: "nline", mode: "round", skin: d.skin || "wood", n: n, to: to },
    check(r) {
      if (r.choice === b.ans) return { ok: true };
      return { ok: false, msg: half ? fmt(n) + " is exactly halfway. Halfway numbers round up." : fmt(n) + " is " + fmt(n - b.lo) + " away from " + fmt(b.lo) + " and " + fmt(b.hi - n) + " away from " + fmt(b.hi) + "." };
    },
    hint: { reveal: "mid", step: "The halfway number is " + fmt(b.mid) + ". " + (half ? fmt(n) + " is exactly halfway, so it rounds up." : fmt(n) + " is " + (n > b.mid ? "past" : "before") + " halfway.") },
    worked: { text: (half ? fmt(n) + " is exactly halfway between " + fmt(b.lo) + " and " + fmt(b.hi) + ". Halfway numbers round up" : fmt(n) + " is nearer to " + fmt(b.ans) + " than to " + fmt(b.up ? b.lo : b.hi)) + ". So " + fmt(n) + " rounds to " + fmt(b.ans) + "." },
    yes: fmt(n) + " rounds to " + fmt(b.ans) + ".", key: fmt(b.ans), right: { choice: b.ans }
  };
};
/* several numbers on the paper: put a ring around ALL the numbers that round to the target */
M.roundall = function (d) {
  const good = d.nums.filter(v => rnd(v, d.to) === d.target).sort((x, y) => x - y);
  return {
    q: "Put a ring around <b>all</b> the numbers that [[round]] to <b>" + fmt(d.target) + "</b>, to the [[nearest]] <b>" + fmt(d.to) + "</b>.",
    sub: "Tap a number to put a ring around it. Tap it again to rub the ring out.",
    ui: { k: "pickall", nums: d.nums }, right: { picks: good },
    check(r) {
      const bad = r.picks.filter(v => good.indexOf(v) < 0), miss = good.filter(v => r.picks.indexOf(v) < 0);
      if (!bad.length && !miss.length) return { ok: true };
      if (bad.length) return { ok: false, msg: fmt(bad[0]) + " rounds to " + fmt(rnd(bad[0], d.to)) + ", not " + fmt(d.target) + ".", parts: bad };
      return { ok: false, msg: "Your " + (r.picks.length === 1 ? "ring is" : "rings are") + " right. But more numbers round to " + fmt(d.target) + ". Check every number.", parts: [] };
    },
    hint: { pic: { k: "rline", n: d.target - d.to / 2, to: d.to }, step: "Round each number to the nearest " + fmt(d.to) + ". Look at the " + LOOK[d.to] + " digit each time. Halfway numbers round up." },
    worked: { text: d.nums.map(v => fmt(v) + " rounds to " + fmt(rnd(v, d.to)) + (rnd(v, d.to) === d.target ? " ✓" : "")).join(". ") + "." },
    yes: good.map(fmt).join(", ").replace(/, ([^,]*)$/, " and $1") + " round to " + fmt(d.target) + ".", key: good.map(fmt).join(" ; ")
  };
};
/* the smallest or the largest whole number that rounds to a given number */
M.roundrange = function (d) {
  const lo = d.r - d.to / 2, hi = d.r + d.to / 2 - 1, ans = d.ask === "min" ? lo : hi, word = d.ask === "min" ? "smallest" : "largest";
  return {
    q: "A whole number is [[rounded|round]] to the [[nearest]] <b>" + fmt(d.to) + "</b>. The answer is <b>" + fmt(d.r) + "</b>. What is the <b>" + word + "</b> number it could be?",
    lines: ["{0}"], blanks: [{ len: 6, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (rnd(v, d.to) !== d.r) return { ok: false, msg: fmt(v) + " rounds to " + fmt(rnd(v, d.to)) + ", not " + fmt(d.r) + ". Try a number that is nearer to " + fmt(d.r) + ".", parts: [false] };
      return { ok: false, msg: fmt(v) + " does round to " + fmt(d.r) + ". But is there a " + (d.ask === "min" ? "smaller" : "larger") + " number that also rounds to " + fmt(d.r) + "?", parts: [false] };
    },
    hint: { step: d.ask === "min" ? "Numbers from halfway and up round up. What is halfway between " + fmt(d.r - d.to) + " and " + fmt(d.r) + "?" : "Numbers below halfway round down. What is halfway between " + fmt(d.r) + " and " + fmt(d.r + d.to) + "?" },
    worked: { text: d.ask === "min" ? "Halfway between " + fmt(d.r - d.to) + " and " + fmt(d.r) + " is " + fmt(lo) + ". It rounds up to " + fmt(d.r) + ". So the smallest number is " + fmt(lo) + "."
      : "Halfway between " + fmt(d.r) + " and " + fmt(d.r + d.to) + " is " + fmt(hi + 1) + ". It rounds up. So the largest number is " + fmt(hi) + "." },
    yes: "The " + word + " number is " + fmt(ans) + ". Every whole number from " + fmt(lo) + " to " + fmt(hi) + " rounds to " + fmt(d.r) + ".",
    key: fmt(ans), fill: [String(ans)]
  };
};
})();

/* Question models for Stops 4 to 6. Every answer is worked out here from the numbers in the data. */
(function () {
const M = MX.M, fmt = MX.fmt, LET = MX.LET, arrange = MX.arrange, digits = MX.digits, places = MX.places, cnt = MX.cnt, cap = MX.cap, total = MX.total;
const OPS = { "+": "+", "-": "−" };                       /* the minus sign that is printed */
const apply = (a, op, b) => (op === "+" ? a + b : a - b);
const list = a => a.map(fmt).join(", ").replace(/, ([^,]*)$/, " and $1");
const PN = ["ones", "tens", "hundreds", "thousands"], P1 = ["one", "ten", "hundred", "thousand"];

/* ================= STOP 4: ADD AND SUBTRACT ================= */

/* the written method, column by column from the ones: the answer digits, what is regrouped, and one sentence for each column */
function colwork(a, op, b) {
  if (op === "x") return mulwork(a, b);
  const n = Math.max(String(a).length, String(b).length), A = digits(a, n).reverse(), B = digits(b, n).reverse(), out = [], steps = [], marks = [], asks = [];
  let c = 0;
  for (let i = 0; i < n; i++) {
    const nm = cap(PN[i]);
    if (op === "+") {
      const s = A[i] + B[i] + c, d = s % 10, c2 = Math.floor(s / 10);
      steps.push(nm + ": " + A[i] + " + " + B[i] + (c ? " + " + c : "") + " = " + s + "." + (c2 ? " Write " + d + " and regroup 1 " + P1[i + 1] + "." : ""));
      asks.push("What is " + A[i] + " + " + B[i] + (c ? " + " + c + " (the " + P1[i] + " you regrouped)" : "") + "?" + (c2 ? " Write only the last digit here." : ""));
      out.push(d); marks.push(c2); c = c2;
    } else {
      let top = A[i] - c; const was = c; let c2 = 0, txt = nm + ": ";
      if (was) txt += "1 " + P1[i] + " was used, so " + top + " " + (top === 1 ? P1[i] + " is" : PN[i] + " are") + " left. ";
      if (top < B[i]) { c2 = 1; txt += (was ? "You" : "you") + " cannot take " + B[i] + " from " + top + ". Regroup 1 " + P1[i + 1] + ": " + (top + 10) + " − " + B[i] + " = " + (top + 10 - B[i]) + "."; top += 10; }
      else txt += top + " − " + B[i] + " = " + (top - B[i]) + ".";
      asks.push((was ? "1 " + P1[i] + " was used. " : "") + (c2 ? "You cannot take " + B[i] + " from " + (top - 10) + ". Regroup 1 " + P1[i + 1] + " first." : "What is " + top + " \u2212 " + B[i] + "?"));
      steps.push(txt); out.push(top - B[i]); marks.push(c2); c = c2;
    }
  }
  if (op === "+" && c) { out.push(c); steps.push(cap(PN[n]) + ": write the " + c + " " + P1[n] + "."); asks.push("Write the " + P1[n] + " that you regrouped."); }
  const ans = apply(a, op, b), len = String(ans).length;
  return { ans: ans, cells: digits(ans, len).reverse(), steps: steps, asks: asks, marks: marks, n: n };
}
/* short multiplication, digit by digit from the ones: n times a one-digit number k */
function mulwork(n, k) {
  const len = String(n).length, A = digits(n, len).reverse(), out = [], steps = [], asks = [], marks = [];
  let c = 0;
  for (let i = 0; i < len; i++) {
    const p = A[i] * k + c, d = p % 10, c2 = Math.floor(p / 10), last = i === len - 1;
    steps.push(cap(PN[i]) + ": " + k + " \u00D7 " + A[i] + " = " + A[i] * k + (c ? ", and " + c + " more makes " + p : "") + "." + (!last && c2 ? " Write " + d + " and regroup " + c2 + " " + (c2 === 1 ? P1[i + 1] : PN[i + 1]) + "." : ""));
    asks.push("What is " + k + " \u00D7 " + A[i] + "?" + (c ? " Then add the " + c + " that you regrouped." : "") + (!last && c2 ? " Write only the last digit here." : ""));
    if (last) { String(p).split("").reverse().forEach(x => out.push(+x)); marks.push(0); } else { out.push(d); marks.push(c2); }
    c = c2;
  }
  return { ans: n * k, cells: out, steps: steps, asks: asks, marks: marks, n: len };
}
/* what went wrong in a written sum, said kindly */
function sumSlip(a, op, b, v) {
  const n = Math.max(String(a).length, String(b).length), A = digits(a, n), B = digits(b, n), ans = apply(a, op, b);
  if (v === ans) return "";
  if (op === "+" && v === +A.map((x, i) => (x + B[i]) % 10).join("")) return "Do not forget the tens or hundreds that you regroup. Add them in the next column.";
  if (op === "+" && v === a - b) return "This is an addition. Add the two numbers.";
  if (op === "-" && v === +A.map((x, i) => Math.abs(x - B[i])).join("")) return "Always take the bottom digit from the top digit. If the top digit is too small, regroup first.";
  if (op === "-" && v === a + b) return "This is a subtraction. Take the second number away from the first.";
  if (Math.abs(v - ans) === 10 || Math.abs(v - ans) === 100) return "Nearly! Check the column where you regrouped.";
  return "Work in columns. Start with the ones.";
}
const sumText = (a, op, b) => fmt(a) + " " + OPS[op] + " " + fmt(b);

/* Build it: both numbers are on the mat as blocks. Join 10 small blocks, then write the sum. */
M.addmat = function (d, mode) {
  const A = digits(d.a, 4), B = digits(d.b, 4), b0 = A.map((x, i) => x + B[i]), after = b0.slice(), need = [], ps = places(4), sum = d.a + d.b;
  for (let i = 3; i > 0; i--) if (after[i] >= 10) { after[i] -= 10; after[i - 1] += 1; need.push(ps[i]); }
  const first = need[0];
  return {
    q: "Add <b>" + fmt(d.a) + "</b> and <b>" + fmt(d.b) + "</b>. All the blocks are on the mat. Join 10 " + need.map(p => p.many).join(", then 10 ") + ". Then write the [[sum]].",
    how: mode === "our" ? "Tap <b>Join 10</b> under the " + first.many + "." : "Join 10 first. Then count the blocks.",
    ui: { k: "mat", b: b0, counts: false, multi: true, can: { join: need.map(p => p.k) } },
    lines: [sumText(d.a, "+", d.b) + " = {0}"], blanks: [{ len: 4, w: "big" }],
    check(r) {
      const v = +r.v[0], done = MX.same(r.b, after);
      if (v === sum && done) return { ok: true };
      if (!done) { const i = [3, 2, 1].find(j => r.b[j] >= 10); return { ok: false, msg: "There are " + r.b[i] + " " + ps[i].many + ". Tap <b>Join 10</b> to make 1 " + ps[i - 1].one + ".", parts: [v === sum] }; }
      return { ok: false, msg: "The blocks are ready. Now count: " + MX.say(after) + ".", parts: [false] };
    },
    hint: { reveal: "counts", step: "10 " + first.many + " make 1 " + ps[ps.indexOf(first) - 1].one + ". After you join, count each place." },
    worked: { text: colwork(d.a, "+", d.b).steps.join(" ") + " So " + sumText(d.a, "+", d.b) + " = " + fmt(sum) + ".", pic: { k: "mat", b: after, counts: true } },
    yes: sumText(d.a, "+", d.b) + " = " + fmt(sum) + ".", key: String(sum), fill: [String(sum)], after: after
  };
};
/* Build it: take away with blocks. Break a bigger block when there are not enough small ones. */
M.submat = function (d, mode) {
  const A = digits(d.a, 4), B = digits(d.b, 4), ps = places(4), diff = d.a - d.b, after = digits(diff, 4);
  const short = []; { let c = 0; for (let i = 3; i >= 1; i--) { if (A[i] - c < B[i]) { short.push(i); c = 1; } else c = 0; } }
  const first = short[0];
  return {
    q: "Take <b>" + fmt(d.b) + "</b> away from <b>" + fmt(d.a) + "</b> with the blocks. Then write the [[difference]].",
    how: first != null ? (mode === "our" ? "You need " + cnt(B[first], ps[first]) + ". Break 1 " + ps[first - 1].one + " first." : "Are there enough blocks to take away? Break a block if you need to.") : "Tap the button to take the blocks away.",
    ui: { k: "takeaway", b: A, take: B }, right: { b: after },
    lines: [sumText(d.a, "-", d.b) + " = {0}"], blanks: [{ len: 4, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (!r.taken) return { ok: false, msg: "Take the blocks away first. " + (r.b.some((x, i) => x < B[i]) ? "Break a block when there are not enough." : "Tap the button under the mat."), parts: [v === diff] };
      if (v === diff) return { ok: true };
      return { ok: false, msg: "Count the blocks that are left: " + MX.say(after) + ".", parts: [false] };
    },
    hint: { step: first != null ? "There are only " + cnt(A[first], ps[first]) + ". Tap 1 " + ps[first - 1].one + " to break it into 10 " + ps[first].many + "." : "Take away " + MX.say(B) + "." },
    worked: { text: colwork(d.a, "-", d.b).steps.join(" ") + " So " + sumText(d.a, "-", d.b) + " = " + fmt(diff) + ".", pic: { k: "mat", b: after, counts: true } },
    yes: sumText(d.a, "-", d.b) + " = " + fmt(diff) + ".", key: String(diff), fill: [String(diff)]
  };
};

/* a calculation with one box. sides: l and r are [x] or [x, op, y]; null is the box */
function eqSolve(d) {
  const side = s => s.indexOf(null) >= 0, val = s => (s.length === 1 ? s[0] : apply(s[0], s[1], s[2]));
  const box = side(d.l) ? d.l : d.r, other = side(d.l) ? d.r : d.l, T = val(other);
  let ans;
  if (box.length === 1) ans = T; else if (box[1] === "+") ans = T - (box[0] == null ? box[2] : box[0]); else ans = box[0] == null ? T + box[2] : box[0] - T;
  const txt = s => (s.length === 1 ? (s[0] == null ? "{0}" : fmt(s[0])) : (s[0] == null ? "{0}" : fmt(s[0])) + " " + OPS[s[1]] + " " + (s[2] == null ? "{0}" : fmt(s[2])));
  const withV = (s, v) => (s.length === 1 ? (s[0] == null ? v : s[0]) : apply(s[0] == null ? v : s[0], s[1], s[2] == null ? v : s[2]));
  /* the bar picture for the side with the box */
  let bar = null, how = "";
  if (box.length === 3 && box[1] === "+") { const k = box[0] == null ? box[2] : box[0]; bar = { k: "bar", whole: T, parts: box[0] == null ? [null, k] : [k, null] }; how = fmt(T) + " − " + fmt(k) + " = " + fmt(ans); }
  else if (box.length === 3 && box[0] == null) { bar = { k: "bar", whole: null, parts: [T, box[2]] }; how = fmt(T) + " + " + fmt(box[2]) + " = " + fmt(ans); }
  else if (box.length === 3) { bar = { k: "bar", whole: box[0], parts: [T, null] }; how = fmt(box[0]) + " − " + fmt(T) + " = " + fmt(ans); }
  const tip = box.length === 1 ? "" : box[1] === "+" ? "What do you add to " + fmt(box[0] == null ? box[2] : box[0]) + " to make " + fmt(T) + "?" : box[0] == null ? "The box is the whole. It is " + fmt(box[2]) + " more than " + fmt(T) + "." : "The whole is " + fmt(box[0]) + ". Take away " + fmt(T) + " to find the box.";
  return { ans: ans, T: T, tip: tip, line: txt(d.l) + " = " + txt(d.r), box: box, other: other, two: other.length === 3, bar: bar, how: how, withV: v => [withV(d.l, v), withV(d.r, v)],
    said: (txt(d.l) + " = " + txt(d.r)).replace("{0}", "<b>" + fmt(ans) + "</b>"), otherTxt: txt(other) };
}
M.eqbox = function (d, mode) {
  const e = eqSolve(d);
  const t = {
    q: d.text || "Write the missing number in the box.", marks: e.two ? 2 : 1,
    lines: [e.line], blanks: [{ len: 4, w: "box" }],
    check(r) {
      const v = +r.v[0];
      if (v === e.ans) return { ok: true };
      const s = e.withV(v);
      return { ok: false, msg: "Try your number: the left side is " + fmt(s[0]) + " and the right side is " + fmt(s[1]) + ". Both sides must be equal.", parts: [false] };
    },
    hint: { pic: e.bar, step: (e.two ? "First work out the side with no box: " + e.otherTxt + " = " + fmt(e.T) + ". " : "") + e.tip },
    worked: { text: (e.two ? e.otherTxt + " = " + fmt(e.T) + ". " : "") + (e.how ? "So the box is " + e.how + "." : "The box is " + fmt(e.ans) + "."), pic: e.bar },
    yes: e.said + ".", key: String(e.ans), fill: [String(e.ans)]
  };
  if (d.bar && e.bar) t.fig = e.bar;
  if (d.scale) { t.ui = { k: "balance", left: d.l, right: d.r }; t.q = "Make the scale balance. Write the missing number."; t.how = mode === "our" ? "Type a number. Watch the scale!" : "Both sides must weigh the same."; t.hint = { step: "Both sides must weigh the same. " + (e.two ? "The other side is " + e.otherTxt + " = " + fmt(e.T) + ". " : "The other side is " + fmt(e.T) + ". ") + e.tip }; }
  return t;
};

/* odd or even? two numbers shown as counters in pairs */
M.oddeven = function (d) {
  const s = apply(d.a, d.op, d.b), odd = n => n % 2 !== 0, w = n => (odd(n) ? "odd" : "even");
  const opts = arrange([{ html: w(s), ok: true }, { html: w(s + 1), ok: false, why: "Look at the counters. " + (odd(d.a) && odd(d.b) ? "The two counters that are left over make a new pair." : odd(s) ? "One counter has no partner." : "Every counter has a partner.") }], d.at);
  return {
    q: "Is <b>" + sumText(d.a, d.op, d.b) + "</b> [[odd|odd number]] or [[even|even number]]?", sub: "Tick (✓) one box.",
    fig: d.op === "+" ? { k: "pairs", groups: [d.a, d.b] } : null, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: d.op === "+" ? { k: "pairs", groups: [d.a, d.b], sum: true } : null, step: "An even number makes pairs with none left over. An odd number has one left over." },
    worked: { text: fmt(d.a) + " is " + w(d.a) + " and " + fmt(d.b) + " is " + w(d.b) + ". " + sumText(d.a, d.op, d.b) + " = " + fmt(s) + ", and " + fmt(s) + " is " + w(s) + ".", pic: d.op === "+" ? { k: "pairs", groups: [d.a, d.b], sum: true } : null },
    yes: sumText(d.a, d.op, d.b) + " = " + fmt(s) + ". It is " + w(s) + ".", key: w(s)
  };
};
/* the rule, without numbers: odd + odd is always ... */
M.oddrule = function (d) {
  const par = { odd: 1, even: 0 }, res = (par[d.x] + par[d.y]) % 2 ? "odd" : "even", ex = d.ex, sign = OPS[d.op];
  const opts = arrange([{ html: "always " + res, ok: true }, { html: "always " + (res === "odd" ? "even" : "odd"), ok: false, why: "Try it: " + sumText(ex[0], d.op, ex[1]) + " = " + fmt(apply(ex[0], d.op, ex[1])) + "." }, { html: "sometimes odd, sometimes even", ok: false, why: "Try two more examples. The answer is always " + res + "." }], d.at);
  return {
    q: "An <b>" + d.x + "</b> number " + (d.op === "+" ? "plus" : "take away") + " an <b>" + d.y + "</b> number is ...", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Test it with small numbers, for example " + sumText(ex[0], d.op, ex[1]) + "." },
    worked: { text: "Test it: " + sumText(ex[0], d.op, ex[1]) + " = " + fmt(apply(ex[0], d.op, ex[1])) + " and " + sumText(ex[2], d.op, ex[3]) + " = " + fmt(apply(ex[2], d.op, ex[3])) + ". Both answers are " + res + "." },
    yes: cap(d.x) + " " + sign + " " + d.y + " is always " + res + ".", key: res
  };
};

/* the written method on squared paper: type the answer digits, ones first */
M.col = function (d, mode) {
  const w = colwork(d.a, d.op, d.b), n = Math.max(w.n, w.cells.length), A = digits(d.a, w.n), B = digits(d.b, w.n), padL = n - w.n;
  const row = (sign, ds) => '<span class="cr"><i>' + sign + "</i>" + "<b></b>".repeat(padL) + ds.map(x => "<b>" + x + "</b>").join("") + "</span>";
  const ansRow = '<span class="cr ans"><i></i>' + "<b></b>".repeat(n - w.cells.length) + w.cells.map((x, i) => "{" + (w.cells.length - 1 - i) + "}").join("") + "</span>";
  const pic = show => ({ k: "col", a: d.a, b: d.b, op: d.op, ans: show ? w.ans : null, marks: w.marks });
  return {
    q: (d.text ? d.text + " " : "") + (d.op === "+" ? "Add in columns." : "Subtract in columns.") + " Start with the <b>ones</b>.",
    how: mode === "our" ? w.steps[0] : "Start with the ones. Regroup when you need to.",
    lines: ['<span class="colw"><span class="colsum" style="--n:' + n + '">' + row("", A) + row(OPS[d.op], B) + ansRow + "</span></span>"], blanks: w.cells.map(() => ({ len: 1, w: "cell" })),
    given: r => r.v.slice().reverse().join(""),
    check(r) {
      const parts = w.cells.map((x, i) => r.v[i] !== "" && +r.v[i] === x);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), v = +r.v.slice().reverse().join("");
      return { ok: false, msg: "Look at the " + PN[i] + ". " + (w.asks[i] || "Check this column again."), parts: parts };
    },
    hint: { step: w.steps[0] },
    worked: { text: w.steps.join(" "), pic: pic(true) },
    yes: sumText(d.a, d.op, d.b) + " = " + fmt(w.ans) + ".", key: String(w.ans), fill: w.cells.map(String)
  };
};
/* "Calculate." with parts (a) and (b), the way the test prints it */
M.sumdiff = function (d) {
  const it = d.items, ans = it.map(x => apply(x.a, x.op, x.b));
  return {
    q: (d.text ? d.text + " " : "") + "Calculate.", marks: it.length,
    lines: it.map((x, i) => (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + sumText(x.a, x.op, x.b) + " = {" + i + "}"), blanks: it.map(() => ({ len: 5, w: "big" })),
    check(r) {
      const parts = it.map((x, i) => r.v[i] !== "" && +r.v[i] === ans[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + sumSlip(it[i].a, it[i].op, it[i].b, +r.v[i]), parts: parts };
    },
    hint: { pic: it.map(x => ({ k: "col", a: x.a, b: x.b, op: x.op, ans: null })), step: "Write the numbers in columns. Start with the ones. Regroup when you need to." },
    worked: { text: it.map((x, i) => (it.length > 1 ? "(" + "abc"[i] + ") " : "") + colwork(x.a, x.op, x.b).steps.join(" ")).join(" "), pic: it.map((x, i) => ({ k: "col", a: x.a, b: x.b, op: x.op, ans: ans[i], marks: colwork(x.a, x.op, x.b).marks })) },
    yes: it.map((x, i) => sumText(x.a, x.op, x.b) + " = " + fmt(ans[i])).join(" and ") + ".", key: ans.map(fmt).join(" ; "), fill: ans.map(String)
  };
};
/* a short real-life problem with one addition or subtraction */
M.sumstory = function (d) {
  const ans = apply(d.a, d.op, d.b);
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 5, w: "big" }],
    check(r) { const v = +r.v[0]; if (v === ans) return { ok: true }; return { ok: false, msg: v === apply(d.a, d.op === "+" ? "-" : "+", d.b) ? (d.op === "+" ? "Read again. You need the total, so add." : "Read again. You need the part that is left, so subtract.") : sumSlip(d.a, d.op, d.b, v), parts: [false] }; },
    hint: { pic: d.op === "+" ? { k: "bar", whole: null, parts: [d.a, d.b] } : { k: "bar", whole: d.a, parts: [d.b, null] }, step: d.op === "+" ? "You need the total. Add " + fmt(d.a) + " and " + fmt(d.b) + "." : "You need the part that is left. Take " + fmt(d.b) + " away from " + fmt(d.a) + "." },
    worked: { text: sumText(d.a, d.op, d.b) + " = " + fmt(ans) + ". " + colwork(d.a, d.op, d.b).steps.join(" "), pic: { k: "col", a: d.a, b: d.b, op: d.op, ans: ans, marks: colwork(d.a, d.op, d.b).marks } },
    yes: sumText(d.a, d.op, d.b) + " = " + fmt(ans) + " " + d.unit + ".", key: String(ans), fill: [String(ans)]
  };
};

/* estimate first: round each number, then add or subtract the round numbers */
const rnd = (n, to) => Math.floor(n / to + 0.5) * to;
M.estimate = function (d) {
  const ra = rnd(d.a, d.to), rb = rnd(d.b, d.to), est = apply(ra, d.op, rb), exact = apply(d.a, d.op, d.b);
  return {
    q: "[[Estimate|estimate]] <b>" + sumText(d.a, d.op, d.b) + "</b>. Round each number to the [[nearest]] <b>" + fmt(d.to) + "</b> first.", marks: 1,
    lines: [fmt(d.a) + " is about {0}", fmt(d.b) + " is about {1}", "My estimate: {2}"],
    blanks: [{ len: 5, w: "mid" }, { len: 5, w: "mid" }, { len: 5, w: "mid" }],
    check(r) {
      const v = r.v.map(Number), parts = [v[0] === ra, v[1] === rb, v[2] === est];
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      if (!parts[0] || !parts[1]) { const i = parts[0] ? 1 : 0, n = i ? d.b : d.a; return { ok: false, msg: fmt(n) + " is between " + fmt(Math.floor(n / d.to) * d.to) + " and " + fmt(Math.floor(n / d.to) * d.to + d.to) + ". Which one is nearer?", parts: parts }; }
      return { ok: false, msg: v[2] === exact ? "That is the exact answer. For the estimate, use the round numbers: " + fmt(ra) + " " + OPS[d.op] + " " + fmt(rb) + "." : "Now " + (d.op === "+" ? "add" : "subtract") + " the round numbers: " + fmt(ra) + " " + OPS[d.op] + " " + fmt(rb) + ".", parts: parts };
    },
    hint: { pic: [{ k: "rline", n: d.a, to: d.to }, { k: "rline", n: d.b, to: d.to }], step: "Round each number to the nearest " + fmt(d.to) + ". Then " + (d.op === "+" ? "add" : "subtract") + " the two round numbers." },
    worked: { text: fmt(d.a) + " is about " + fmt(ra) + ". " + fmt(d.b) + " is about " + fmt(rb) + ". " + fmt(ra) + " " + OPS[d.op] + " " + fmt(rb) + " = " + fmt(est) + ". The exact answer is " + fmt(exact) + ", so the estimate is close." },
    yes: "A good estimate is " + fmt(est) + ". The exact answer is " + fmt(exact) + ".", key: [ra, rb, est].map(fmt).join(" ; "), fill: [String(ra), String(rb), String(est)]
  };
};
/* tick the best estimate */
M.estpick = function (d) {
  const ra = rnd(d.a, d.to), rb = rnd(d.b, d.to), est = apply(ra, d.op, rb);
  const opts = arrange([est].concat(d.wrong).map((v, i) => ({ html: fmt(v), ok: i === 0, why: "Round first: " + fmt(d.a) + " is about " + fmt(ra) + " and " + fmt(d.b) + " is about " + fmt(rb) + "." })), d.at);
  return {
    q: (d.text ? d.text + " " : "") + "Which is the best [[estimate]] for <b>" + sumText(d.a, d.op, d.b) + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: [{ k: "rline", n: d.a, to: d.to }, { k: "rline", n: d.b, to: d.to }], step: "Round each number to the nearest " + fmt(d.to) + ". Then " + (d.op === "+" ? "add" : "subtract") + "." },
    worked: { text: fmt(d.a) + " is about " + fmt(ra) + " and " + fmt(d.b) + " is about " + fmt(rb) + ". " + fmt(ra) + " " + OPS[d.op] + " " + fmt(rb) + " = " + fmt(est) + "." },
    yes: fmt(ra) + " " + OPS[d.op] + " " + fmt(rb) + " = " + fmt(est) + ".", key: LET[opts.findIndex(o => o.ok)] + ": " + fmt(est)
  };
};

/* pictures with + and =: find what one picture is worth, then a different number of them */
M.piceq = function (d) {
  const one = d.total / d.n1, many = one * d.n2;
  return {
    q: d.text + " Each " + d.one + " is worth the same number of " + d.unit + ".", marks: 2,
    fig: { k: "piceq", pic: d.img, n: d.n1, total: d.total, unit: d.unit, alt: d.n1 + " " + d.many + " = " + d.total + " " + d.unit },
    lines: ["1 " + d.one + " = {0} " + d.unit, d.n2 + " " + d.many + " = {1} " + d.unit], blanks: [{ len: 4, w: "mid" }, { len: 4, w: "mid" }],
    check(r) {
      const v = r.v.map(Number), parts = [v[0] === one, v[1] === many];
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      if (!parts[0]) return { ok: false, msg: v[0] === d.total ? fmt(d.total) + " is for " + d.n1 + " " + d.many + ". Share it into " + d.n1 + " equal parts." : d.n1 + " equal parts make " + fmt(d.total) + ". What is one part? Try " + d.n1 + " × your number.", parts: parts };
      return { ok: false, msg: "1 " + d.one + " is " + fmt(one) + ". Now find " + d.n2 + " lots of " + fmt(one) + ".", parts: parts };
    },
    hint: { pic: { k: "bar", whole: d.total, parts: Array.from({ length: d.n1 }, () => null) }, step: "The " + d.n1 + " pictures are equal. " + fmt(d.total) + " shared into " + d.n1 + " equal parts gives one " + d.one + "." },
    worked: { text: fmt(d.total) + " ÷ " + d.n1 + " = " + fmt(one) + ", so 1 " + d.one + " is " + fmt(one) + " " + d.unit + ". " + d.n2 + " × " + fmt(one) + " = " + fmt(many) + ", so " + d.n2 + " " + d.many + " are " + fmt(many) + " " + d.unit + "." },
    yes: "1 " + d.one + " = " + fmt(one) + " and " + d.n2 + " " + d.many + " = " + fmt(many) + " " + d.unit + ".", key: fmt(one) + " ; " + fmt(many), fill: [String(one), String(many)]
  };
};

/* odd and even in a chain of numbers: rules in words, rows of a table as the answers */
M.parityrow = function (d) {
  const par = { odd: 1, even: 0 }, W = ["even", "odd"], right = [d.start]; d.adds.forEach(x => right.push(W[(par[right[right.length - 1]] + par[x]) % 2]));
  const chips = row => '<span class="prow">' + row.map(x => '<i class="pc-' + x + '">' + x + "</i>").join("") + "</span>";
  const whyRow = row => { const j = row.findIndex((x, k) => x !== right[k]); return j < 0 ? "" : "Check number " + (j + 1) + ". " + (j === 0 ? "The first number is " + d.start + "." : cap(right[j - 1]) + " + " + d.adds[j - 1] + " is " + right[j] + "."); };
  const opts = arrange([right].concat(d.wrong).map((row, i) => ({ html: chips(row), ok: i === 0, txt: row.join(", "), why: whyRow(row) })), d.at);
  const ORD = MX.ORD, he = d.he ? "He" : "She";
  return {
    q: d.who + " writes " + right.length + " numbers.<br>• The 1st number is <b>" + d.start + "</b>.<br>" + d.adds.map((x, i) => "• " + he + " adds an <b>" + x + "</b> number to make the " + ORD[i + 2] + " number.").join("<br>") + "<br>Which row shows " + d.who + "'s numbers?",
    sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Go one number at a time. Odd + odd = even. Odd + even = odd. Even + even = even." },
    worked: { text: right.map((x, i) => (i ? cap(right[i - 1]) + " + " + d.adds[i - 1] + " = " + x : "Start: " + x)).join(". ") + ". The row is " + right.join(", ") + "." },
    yes: "The numbers are " + right.join(", ") + ".", key: LET[opts.findIndex(o => o.ok)] + ": " + right.join(", ")
  };
};

/* a written sum with two digits missing: find the hidden digits */
M.digitpuzzle = function (d) {
  const w = colwork(d.a, d.op, d.b), n = Math.max(w.n, w.cells.length), rows = [digits(d.a, w.n), digits(d.b, w.n), digits(w.ans, w.cells.length)], padL = [n - w.n, n - w.n, n - w.cells.length];
  const hide = d.hide, want = hide.map(h => rows[h[0]][h[1]]);
  const row = (ri, sign) => '<span class="cr' + (ri === 2 ? " ans" : "") + '"><i>' + sign + "</i>" + "<b></b>".repeat(padL[ri]) + rows[ri].map((x, ci) => { const k = hide.findIndex(h => h[0] === ri && h[1] === ci); return k >= 0 ? "{" + k + "}" : "<b>" + x + "</b>"; }).join("") + "</span>";
  const place = h => PN[rows[h[0]].length - 1 - h[1]];
  return {
    q: "Two digits are hidden. Write the missing digits.", marks: 2,
    lines: ['<span class="colw"><span class="colsum" style="--n:' + n + '">' + row(0, "") + row(1, OPS[d.op]) + row(2, "") + "</span></span>"], blanks: hide.map(() => ({ len: 1, w: "cell" })),
    given: r => r.v.join(" and "),
    check(r) {
      const parts = want.map((x, i) => r.v[i] !== "" && +r.v[i] === x);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: "Look at the " + place(hide[i]) + " column. Which digit makes that column right? Remember what was regrouped.", parts: parts };
    },
    hint: { step: "Start with the ones column. Which digit makes it right? Then go to the next column. Remember what you regroup." },
    worked: { text: w.steps.join(" ") + " So the missing digits are " + want.join(" and ") + ".", pic: { k: "col", a: d.a, b: d.b, op: d.op, ans: w.ans, marks: w.marks } },
    yes: sumText(d.a, d.op, d.b) + " = " + fmt(w.ans) + ".", key: want.join(" ; "), fill: want.map(String)
  };
};

MX.colwork = colwork; MX.eqSolve = eqSolve; MX.rnd = rnd;
})();

/* Question models for Stop 5 (times tables, multiples and factors). Every answer is worked out here from the numbers in the data. */
(function () {
const M = MX.M, fmt = MX.fmt, LET = MX.LET, arrange = MX.arrange, cap = MX.cap;
const X = "×", D = "÷", SYMH = { "<": "&lt;", ">": "&gt;", "=": "=" }, SYMW = { "<": "less than", ">": "greater than", "=": "equal to" };
const calc = f => (f[1] === "x" ? f[0] * f[2] : f[0] / f[2]), ftxt = f => f[0] + " " + (f[1] === "x" ? X : D) + " " + f[2];
const list = a => a.map(fmt).join(", ").replace(/, ([^,]*)$/, " and $1");
const isMult = (v, k) => v % k === 0;
const table = (k, v) => { const lo = Math.floor(v / k); return lo + " " + X + " " + k + " = " + lo * k + " and " + (lo + 1) + " " + X + " " + k + " = " + (lo + 1) * k; };

/* Build it: make an array of counters and write the product */
M.arr = function (d, mode) {
  const p = d.r * d.c;
  return {
    q: "Make <b>" + d.r + " rows of " + d.c + "</b> counters. Then write the [[product]].",
    how: mode === "our" ? "Tap + to add rows. Then tap + to put " + d.c + " in each row." : "Make the [[array]] first. Then count in " + d.c + "s.",
    ui: { k: "grid", mode: "array", rows: 1, cols: 1, max: 10 }, right: { rows: d.r, cols: d.c },
    lines: [d.r + " " + X + " " + d.c + " = {0}"], blanks: [{ len: 3, w: "mid" }],
    check(r) {
      const v = +r.v[0], built = r.rows === d.r && r.cols === d.c, turned = r.rows === d.c && r.cols === d.r;
      if (v === p && (built || turned)) return { ok: true, note: turned ? d.c + " rows of " + d.r + " is the same number: " + p + "." : "" };
      if (!built && !turned) return { ok: false, msg: "You made " + r.rows + (r.rows === 1 ? " row of " : " rows of ") + r.cols + ". Make " + d.r + " rows with " + d.c + " in each row.", parts: [v === p] };
      return { ok: false, msg: v === d.r + d.c ? "Do not add " + d.r + " and " + d.c + ". Count all the counters: " + d.r + " rows of " + d.c + "." : "Count in " + d.c + "s: one row is " + d.c + ", two rows are " + 2 * d.c + " ...", parts: [false] };
    },
    hint: { step: "Count the rows one by one: " + Array.from({ length: d.r }, (x, i) => (i + 1) * d.c).join(", ") + "." },
    worked: { text: d.r + " rows of " + d.c + ": " + Array.from({ length: d.r }, (x, i) => (i + 1) * d.c).join(", ") + ". So " + d.r + " " + X + " " + d.c + " = " + p + ".", pic: { k: "dots", r: d.r, c: d.c } },
    yes: d.r + " " + X + " " + d.c + " = " + p + ".", key: String(p), fill: [String(p)]
  };
};
/* Build it: a fixed number of counters in equal rows. How many in each row? */
M.rowsof = function (d, mode) {
  const each = d.n / d.rows;
  return {
    q: "Put <b>" + d.n + "</b> counters in <b>" + d.rows + " equal rows</b>. How many counters are in each row?",
    how: mode === "our" ? "Tap <b>More</b> until there are " + d.rows + " rows." : "Make " + d.rows + " rows. Are any counters left over?",
    ui: { k: "rows", n: d.n, rows: 1 }, right: { rows: d.rows },
    lines: [d.rows + " " + X + " {0} = " + d.n], blanks: [{ len: 2, w: "mid" }],
    check(r) {
      const v = +r.v[0];
      if (v === each && r.rows === d.rows) return { ok: true };
      if (r.rows !== d.rows) return { ok: false, msg: "You made " + r.rows + (r.rows === 1 ? " row" : " rows") + ". Make " + d.rows + " equal rows.", parts: [v === each] };
      return { ok: false, msg: "Count the counters in one row.", parts: [false] };
    },
    hint: { step: d.rows + " rows share " + d.n + " counters equally. Count one row." },
    worked: { text: d.n + " counters in " + d.rows + " equal rows gives " + each + " in each row. " + d.rows + " " + X + " " + each + " = " + d.n + ". So " + d.rows + " and " + each + " are [[factors|factor]] of " + d.n + ".", pic: { k: "dots", r: d.rows, c: each } },
    yes: d.rows + " " + X + " " + each + " = " + d.n + ". " + d.rows + " and " + each + " are factors of " + d.n + ".", key: String(each), fill: [String(each)]
  };
};
/* Build it: is k a factor of n? Try to make k equal rows */
M.isfactor = function (d) {
  const left = d.n % d.k, each = Math.floor(d.n / d.k), yes = left === 0;
  const opts = arrange([{ html: yes ? "Yes. No counters are left over." : "No. " + left + (left === 1 ? " counter is" : " counters are") + " left over.", ok: true },
    { html: yes ? "No. Some counters are left over." : "Yes. No counters are left over.", ok: false, why: "Make " + d.k + " rows with the counters and look again." }], d.at);
  return {
    q: "Is <b>" + d.k + "</b> a [[factor]] of <b>" + d.n + "</b>? Try to make " + d.k + " equal rows.", sub: "Tick (✓) one box.",
    how: "Tap <b>More</b> until there are " + d.k + " rows. Then look.",
    ui: { k: "rows", n: d.n, rows: 1 }, opts: opts,
    check(r) { const o = opts[r.pick]; if (o.ok) return { ok: true }; return { ok: false, msg: r.rows === d.k ? (yes ? "Look again: every row has " + each + " counters and none are left over." : "Look at the yellow counters. They do not fit in the rows.") : o.why }; },
    hint: { pic: { k: "rows", n: d.n, rows: d.k, fixed: true }, step: "A factor makes equal rows with nothing left over." },
    worked: { text: yes ? d.k + " " + X + " " + each + " = " + d.n + ". Nothing is left over, so " + d.k + " is a factor of " + d.n + "." : d.k + " " + X + " " + each + " = " + d.k * each + ". " + left + " left over, so " + d.k + " is not a factor of " + d.n + ".", pic: { k: "rows", n: d.n, rows: d.k, fixed: true } },
    yes: yes ? d.k + " is a factor of " + d.n + " because " + d.k + " " + X + " " + each + " = " + d.n + "." : d.k + " is not a factor of " + d.n + ". " + left + (left === 1 ? " counter is" : " counters are") + " left over.", key: yes ? "yes" : "no, " + left + " left"
  };
};
/* which picture shows r x c? */
M.arrpick = function (d) {
  const all = [[d.r, d.c]].concat(d.wrong), opts = arrange(all.map((x, i) => ({ fig: { k: "dots", r: x[0], c: x[1] }, alt: x[0] + " rows of " + x[1], ok: i === 0, why: "That picture shows " + x[0] + " rows of " + x[1] + ". That is " + x[0] + " " + X + " " + x[1] + "." })), d.at);
  return {
    q: "Which [[array]] shows <b>" + d.r + " " + X + " " + d.c + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: d.r + " " + X + " " + d.c + " means " + d.r + " rows with " + d.c + " in each row." },
    worked: { text: "Count the rows, then count how many are in one row. " + d.r + " rows of " + d.c + " is " + d.r + " " + X + " " + d.c + " = " + d.r * d.c + "." },
    yes: d.r + " rows of " + d.c + " shows " + d.r + " " + X + " " + d.c + " = " + d.r * d.c + ".", key: LET[opts.findIndex(o => o.ok)] + ": " + d.r + " by " + d.c
  };
};

/* Draw it: find a fact on the multiplication square */
M.msqfind = function (d, mode) {
  const p = d.r * d.c;
  return {
    q: "Find <b>" + d.r + " " + X + " " + d.c + "</b> on the multiplication square. Tap the answer.",
    how: mode === "our" ? "Go along row " + d.r + " and down column " + d.c + ". Tap where they meet." : "Find the row and the column. Tap where they meet.",
    ui: { k: "msq" }, right: { r: d.r, c: d.c },
    check(r) {
      if ((r.r === d.r && r.c === d.c) || (r.r === d.c && r.c === d.r)) return { ok: true };
      if (r.r * r.c === p) return { ok: false, msg: "That is " + p + " too, but it is " + r.r + " " + X + " " + r.c + ". Find row " + d.r + " and column " + d.c + ".", parts: [] };
      return { ok: false, msg: "You tapped " + r.r + " " + X + " " + r.c + " = " + r.r * r.c + ". Find row " + d.r + " and column " + d.c + ".", parts: [] };
    },
    hint: { reveal: "cross", step: "Put one finger on row " + d.r + " and one on column " + d.c + ". Slide them until they meet." },
    worked: { text: "Row " + d.r + " and column " + d.c + " meet at " + p + ". So " + d.r + " " + X + " " + d.c + " = " + p + "." },
    yes: d.r + " " + X + " " + d.c + " = " + p + ".", key: String(p)
  };
};
/* a times table fact with one factor missing */
M.missfact = function (d) {
  const p = d.a * d.b, want = d.miss === 0 ? d.a : d.b, other = d.miss === 0 ? d.b : d.a;
  return {
    q: "Write the missing number.",
    lines: [(d.miss === 0 ? "{0} " + X + " " + d.b : d.a + " " + X + " {0}") + " = " + p], blanks: [{ len: 2, w: "box" }],
    check(r) { const v = +r.v[0]; if (v === want) return { ok: true }; return { ok: false, msg: v + " " + X + " " + other + " = " + v * other + ", not " + p + ". Count in " + other + "s until you reach " + p + ".", parts: [false] }; },
    hint: { pic: { k: "msq", fixed: true, row: other, hl: p }, step: "Count in " + other + "s: " + Array.from({ length: Math.min(want, 5) }, (x, i) => (i + 1) * other).join(", ") + " ... How many " + other + "s make " + p + "?" },
    worked: { text: "Count in " + other + "s: " + Array.from({ length: want }, (x, i) => (i + 1) * other).join(", ") + ". That is " + want + " lots of " + other + ". So the missing number is " + want + "." },
    yes: want + " " + X + " " + other + " = " + p + ".", key: String(want), fill: [String(want)]
  };
};
/* ring ALL the multiples of k */
M.multall = function (d) {
  const good = d.nums.filter(v => isMult(v, d.k)).sort((a, b) => a - b);
  return {
    q: "Put a ring around <b>all</b> the [[multiples|multiple]] of <b>" + d.k + "</b>.", sub: "Tap a number to put a ring around it. Tap it again to rub the ring out.",
    ui: { k: "pickall", nums: d.nums }, right: { picks: good },
    check(r) {
      const bad = r.picks.filter(v => good.indexOf(v) < 0), miss = good.filter(v => r.picks.indexOf(v) < 0);
      if (!bad.length && !miss.length) return { ok: true };
      if (bad.length) return { ok: false, msg: bad[0] + " is not in the " + d.k + " times table: " + table(d.k, bad[0]) + ".", parts: bad };
      return { ok: false, msg: "Your " + (r.picks.length === 1 ? "ring is" : "rings are") + " right. But there are more multiples of " + d.k + ". Check every number.", parts: [] };
    },
    hint: { pic: { k: "msq", fixed: true, row: d.k }, step: "Say the " + d.k + " times table: " + Array.from({ length: 10 }, (x, i) => (i + 1) * d.k).join(", ") + "." },
    worked: { text: d.nums.map(v => (isMult(v, d.k) ? v + " = " + v / d.k + " " + X + " " + d.k + " ✓" : v + " is not a multiple of " + d.k)).join(". ") + "." },
    yes: list(good) + " are multiples of " + d.k + ".", key: good.join(" ; ")
  };
};
/* the paper style: a row of numbers, write the one that does NOT belong to the times table */
M.notmult = function (d) {
  const bad = d.nums.filter(v => !isMult(v, d.k));
  return {
    q: "Look at the numbers. Write the number that is <b>not</b> a [[multiple]] of <b>" + d.k + "</b>.", sum: d.nums.join("&emsp;"),
    lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === bad[0]) return { ok: true };
      if (d.nums.indexOf(v) < 0) return { ok: false, msg: "Choose one of the five numbers.", parts: [false] };
      return { ok: false, msg: v + " is a multiple of " + d.k + ": " + v / d.k + " " + X + " " + d.k + " = " + v + ". Look for the number that is not in the " + d.k + " times table.", parts: [false] };
    },
    hint: { pic: { k: "msq", fixed: true, row: d.k }, step: "Say the " + d.k + " times table. Which number in the list is not in it?" },
    worked: { text: d.nums.map(v => (isMult(v, d.k) ? v + " = " + v / d.k + " " + X + " " + d.k : v + " is not in the " + d.k + " times table (" + table(d.k, v) + ")")).join(". ") + "." },
    yes: bad[0] + " is not a multiple of " + d.k + ".", key: String(bad[0]), fill: [String(bad[0])]
  };
};
/* the next multiples in the list */
M.nextmult = function (d) {
  const shown = Array.from({ length: d.shown }, (x, i) => (i + 1) * d.k), next = [d.shown + 1, d.shown + 2].map(i => i * d.k);
  return {
    q: "Write the next two [[multiples|multiple]] of <b>" + d.k + "</b>.",
    lines: [shown.join(", ") + ", {0} , {1}"], blanks: [{ len: 3, w: "mid" }, { len: 3, w: "mid" }],
    check(r) { const parts = next.map((x, i) => +r.v[i] === x && r.v[i] !== ""); if (parts.every(Boolean)) return { ok: true, parts: parts }; return { ok: false, msg: "Add " + d.k + " each time. " + shown[shown.length - 1] + " + " + d.k + " = ?", parts: parts }; },
    hint: { pic: { k: "hops", terms: shown, blanks: 2, labs: shown.slice(1).map(() => "+ " + d.k) }, step: "Multiples of " + d.k + " go up in " + d.k + "s." },
    worked: { text: shown[shown.length - 1] + " + " + d.k + " = " + next[0] + ". " + next[0] + " + " + d.k + " = " + next[1] + "." },
    yes: "The next multiples of " + d.k + " are " + next[0] + " and " + next[1] + ".", key: next.join(" ; "), fill: next.map(String)
  };
};
/* which number is a factor of n? */
M.factorpick = function (d) {
  const opts = arrange(d.opts.map((v, i) => ({ html: String(v), ok: d.n % v === 0, why: d.n + " ÷ " + v + " leaves " + d.n % v + " left over. So " + v + " is not a factor of " + d.n + "." })), d.at);
  const ok = opts.find(o => o.ok), f = +ok.html;
  return {
    q: "Which number is a [[factor]] of <b>" + d.n + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "A factor divides " + d.n + " exactly. Which times table has " + d.n + " in it?" },
    worked: { text: f + " " + X + " " + d.n / f + " = " + d.n + ". So " + f + " is a factor of " + d.n + "." },
    yes: f + " " + X + " " + d.n / f + " = " + d.n + ", so " + f + " is a factor of " + d.n + ".", key: LET[opts.indexOf(ok)] + ": " + f
  };
};
/* factor pairs drawn as a rainbow: fill in the missing partners */
M.fpairs = function (d) {
  const pairs = []; for (let a = 1; a * a <= d.n; a++) if (d.n % a === 0) pairs.push([a, d.n / a]);
  const hide = d.hide, want = hide.map(i => pairs[i][1]);
  return {
    q: "Complete the [[factor]] pairs of <b>" + d.n + "</b>.",
    fig: d.pic === false ? null : { k: "frain", n: d.n, hide: hide.map(i => pairs[i][1]) },
    lines: pairs.map((p, i) => p[0] + " " + X + " " + (hide.indexOf(i) >= 0 ? "{" + hide.indexOf(i) + "}" : p[1]) + " = " + d.n), blanks: hide.map(() => ({ len: 2, w: "mid" })),
    check(r) { const parts = want.map((x, i) => +r.v[i] === x && r.v[i] !== ""); if (parts.every(Boolean)) return { ok: true, parts: parts }; const i = parts.indexOf(false), a = pairs[hide[i]][0]; return { ok: false, msg: a + " " + X + " " + (+r.v[i]) + " = " + a * +r.v[i] + ", not " + d.n + ". How many " + a + "s make " + d.n + "?", parts: parts }; },
    hint: { step: "Each pair multiplies to " + d.n + ". Count in " + pairs[hide[0]][0] + "s until you reach " + d.n + "." },
    worked: { text: pairs.map(p => p[0] + " " + X + " " + p[1] + " = " + d.n).join(". ") + ". The factors of " + d.n + " are " + list(pairs.map(p => p[0]).concat(pairs.map(p => p[1]).reverse()).filter((v, i, a) => a.indexOf(v) === i)) + ".", pic: { k: "frain", n: d.n, hide: [] } },
    yes: pairs.map(p => p[0] + " " + X + " " + p[1]).join(", ") + " all make " + d.n + ".", key: want.join(" ; "), fill: want.map(String)
  };
};
/* three numbers to multiply: pair the two that make an easy number first */
M.group3 = function (d) {
  const n = d.nums, i = d.pair[0], j = d.pair[1], k = [0, 1, 2].find(x => x !== i && x !== j), easy = n[i] * n[j], p = easy * n[k];
  return {
    q: (d.text ? d.text + " " : "") + "Work out <b>" + n.join(" " + X + " ") + "</b>. Multiply the easy pair first.",
    fig: d.arc ? { k: "grp", nums: n, pair: d.pair, show: false } : null,
    lines: [n.join(" " + X + " ") + " = {0}"], blanks: [{ len: 4, w: "big" }],
    check(r) { const v = +r.v[0]; if (v === p) return { ok: true }; return { ok: false, msg: v === n[0] + n[1] + n[2] ? "Multiply, do not add." : "Start with " + n[i] + " " + X + " " + n[j] + ". That makes " + easy + ". Then multiply by " + n[k] + ".", parts: [false] }; },
    hint: { pic: { k: "grp", nums: n, pair: d.pair, show: true }, step: "You can multiply in any order. " + n[i] + " " + X + " " + n[j] + " makes an easy number." },
    worked: { text: n[i] + " " + X + " " + n[j] + " = " + easy + ". Then " + easy + " " + X + " " + n[k] + " = " + fmt(p) + ".", pic: { k: "grp", nums: n, pair: d.pair, show: true } },
    yes: n[i] + " " + X + " " + n[j] + " = " + easy + ", and " + easy + " " + X + " " + n[k] + " = " + fmt(p) + ".", key: String(p), fill: [String(p)]
  };
};
/* "Calculate." a row of times table facts or division facts */
M.facts = function (d) {
  const it = d.items, ans = it.map(calc);
  return {
    q: "Calculate.", marks: 1,
    lines: it.map((f, i) => "<i>(" + "abc"[i] + ")</i> " + ftxt(f) + " = {" + i + "}"), blanks: it.map(() => ({ len: 3, w: "mid" })),
    check(r) {
      const parts = it.map((f, i) => r.v[i] !== "" && +r.v[i] === ans[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), f = it[i];
      return { ok: false, msg: "Look at (" + "abc"[i] + "). " + (f[1] === "x" ? "Count in " + f[2] + "s, " + f[0] + " times." : "How many " + f[2] + "s make " + f[0] + "? Count in " + f[2] + "s."), parts: parts };
    },
    hint: { pic: { k: "msq", fixed: true, row: it[0][2] }, step: it[0][1] === "x" ? "Use the times tables. For " + ftxt(it[0]) + ", count in " + it[0][2] + "s." : "Division is the opposite of multiplication. For " + ftxt(it[0]) + ", ask: how many " + it[0][2] + "s make " + it[0][0] + "?" },
    worked: { text: it.map((f, i) => (f[1] === "x" ? ftxt(f) + " = " + ans[i] : ans[i] + " " + X + " " + f[2] + " = " + f[0] + ", so " + ftxt(f) + " = " + ans[i])).join(". ") + "." },
    yes: it.map((f, i) => ftxt(f) + " = " + ans[i]).join(", ") + ".", key: ans.join(" ; "), fill: ans.map(String)
  };
};
/* compare two facts with <, > or = */
M.factcmp = function (d) {
  const rows = d.rows, val = rows.map(rw => [calc(rw[0]), calc(rw[1])]), ans = val.map(v => (v[0] < v[1] ? "<" : v[0] > v[1] ? ">" : "="));
  return {
    q: "Write &lt;, &gt; or = in " + (rows.length > 1 ? "each box." : "the box."), marks: rows.length,
    lines: rows.map((rw, i) => ftxt(rw[0]) + " {" + i + "} " + ftxt(rw[1])), blanks: rows.map(() => ({ len: 1, w: "sym", sym: true })),
    given: r => r.v.join(" "),
    check(r) {
      const parts = ans.map((x, i) => r.v[i] === x);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (rows.length > 1 ? "Look at row " + (i + 1) + ". " : "") + "Work out both sides first: " + ftxt(rows[i][0]) + " and " + ftxt(rows[i][1]) + ". Then compare.", parts: parts };
    },
    hint: { step: "Work out each side. Write the two answers on your paper. Then compare them." },
    worked: { text: rows.map((rw, i) => ftxt(rw[0]) + " = " + val[i][0] + " and " + ftxt(rw[1]) + " = " + val[i][1] + ". " + val[i][0] + " is " + SYMW[ans[i]] + " " + val[i][1]).join(". ") + "." },
    yes: rows.map((rw, i) => ftxt(rw[0]) + " " + SYMH[ans[i]] + " " + ftxt(rw[1])).join(" and ") + ".", key: ans.map(x => SYMH[x]).join(" ; "), fill: ans
  };
};
/* two children with equal groups: work out both totals, then say who has more */
M.twofacts = function (d) {
  const A = d.a, B = d.b, pa = A.n * A.each, pb = B.n * B.each, win = pa > pb ? 0 : 1;
  const opts = [{ html: A.who, ok: win === 0 }, { html: B.who, ok: win === 1 }];
  return {
    q: d.text + " Who has more " + d.unit + "? Show your working.", marks: 2,
    lines: [A.who + ": " + A.n + " " + X + " " + A.each + " = {0}", B.who + ": " + B.n + " " + X + " " + B.each + " = {1}", "Tick (✓) who has more " + d.unit + "."], blanks: [{ len: 3, w: "mid" }, { len: 3, w: "mid" }], opts: opts,
    ready: r => r.v.every(x => x !== "") && r.pick >= 0,
    given: r => r.v.join(" and ") + ", " + (r.pick >= 0 ? opts[r.pick].html : ""),
    check(r) {
      const parts = [+r.v[0] === pa, +r.v[1] === pb], pickOk = opts[r.pick].ok;
      if (parts.every(Boolean) && pickOk) return { ok: true, parts: parts };
      if (!parts.every(Boolean)) { const i = parts.indexOf(false), g = i ? B : A; return { ok: false, msg: g.who + " has " + g.n + " groups of " + g.each + ". Count in " + g.each + "s, " + g.n + " times.", parts: parts, pickOk: pickOk }; }
      return { ok: false, msg: "Your two answers are right. Now compare " + pa + " and " + pb + ". Which is more?", parts: parts, pickOk: false };
    },
    hint: { pic: [{ k: "dots", r: A.n, c: A.each, cap: A.who }, { k: "dots", r: B.n, c: B.each, cap: B.who }], step: "Work out each child's total with a times table fact. Then compare the two totals." },
    worked: { text: A.who + ": " + A.n + " " + X + " " + A.each + " = " + pa + ". " + B.who + ": " + B.n + " " + X + " " + B.each + " = " + pb + ". " + Math.max(pa, pb) + " is more than " + Math.min(pa, pb) + ", so " + opts[win].html + " has more." },
    yes: pa + " and " + pb + ": " + opts[win].html + " has more " + d.unit + ".", key: pa + " ; " + pb + " ; " + opts[win].html, fill: [String(pa), String(pb)]
  };
};
/* a grouping story: n things in groups of k */
M.divstory = function (d) {
  const ans = d.n / d.k;
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
    check(r) { const v = +r.v[0]; if (v === ans) return { ok: true }; return { ok: false, msg: v === d.n * d.k ? "Do not multiply. " + d.n + " are put into groups of " + d.k + "." : v === d.n - d.k ? "Do not take away only once. How many groups of " + d.k + " are in " + d.n + "?" : "How many " + d.k + "s make " + d.n + "? Count in " + d.k + "s.", parts: [false] }; },
    hint: { pic: { k: "msq", fixed: true, row: d.k, hl: d.n }, step: "Make groups of " + d.k + ". Count in " + d.k + "s until you reach " + d.n + "." },
    worked: { text: "Count in " + d.k + "s: " + Array.from({ length: ans }, (x, i) => (i + 1) * d.k).join(", ") + ". That is " + ans + " groups. " + d.n + " " + D + " " + d.k + " = " + ans + "." },
    yes: d.n + " " + D + " " + d.k + " = " + ans + " " + d.unit + ".", key: String(ans), fill: [String(ans)]
  };
};
/* a riddle with two clues about multiples */
M.riddle = function (d) {
  const sol = []; for (let v = d.lo + 1; v < d.hi; v++) if (v % d.a === 0 && v % d.b === 0) sol.push(v);
  const ans = sol[0], ma = [], mb = []; for (let v = d.lo + 1; v < d.hi; v++) { if (v % d.a === 0) ma.push(v); if (v % d.b === 0) mb.push(v); }
  return {
    q: "I am a [[multiple]] of <b>" + d.a + "</b>. I am also a multiple of <b>" + d.b + "</b>. I am between <b>" + d.lo + "</b> and <b>" + d.hi + "</b>. What number am I?", marks: 1,
    lines: ["{0}"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (v <= d.lo || v >= d.hi) return { ok: false, msg: "The number is between " + d.lo + " and " + d.hi + ".", parts: [false] };
      if (v % d.a !== 0) return { ok: false, msg: v + " is not a multiple of " + d.a + ". The multiples of " + d.a + " here are " + list(ma) + ".", parts: [false] };
      return { ok: false, msg: v + " is a multiple of " + d.a + ", but not of " + d.b + ". Check the other clue.", parts: [false] };
    },
    hint: { step: "List the multiples of " + d.a + " between " + d.lo + " and " + d.hi + ". Then find the one that is also a multiple of " + d.b + "." },
    worked: { text: "Multiples of " + d.a + " between " + d.lo + " and " + d.hi + ": " + list(ma) + ". Multiples of " + d.b + ": " + list(mb) + ". Only " + ans + " is in both lists." },
    yes: ans + " = " + ans / d.a + " " + X + " " + d.a + " and " + ans + " = " + ans / d.b + " " + X + " " + d.b + ".", key: String(ans), fill: [String(ans)]
  };
};
})();

/* Question models for Stop 6 (multiply and divide). Every answer is worked out here from the numbers in the data. */
(function () {
const M = MX.M, fmt = MX.fmt, LET = MX.LET, arrange = MX.arrange, digits = MX.digits, places = MX.places, cap = MX.cap, rnd = MX.rnd;
const X = "×", D = "÷", PN = ["ones", "tens", "hundreds", "thousands"];
const parts = n => String(n).split("").map((d, i, a) => +d * Math.pow(10, a.length - 1 - i)).filter(Boolean);
const listAnd = a => a.join(", ").replace(/, ([^,]*)$/, " and $1");
const calc = f => (f[1] === "x" ? f[0] * f[2] : f[0] / f[2]), ftxt = f => fmt(f[0]) + " " + (f[1] === "x" ? X : D) + " " + f[2];

/* Build it: k lots of n are on the mat as blocks. Join tens, then write the product. */
M.mulmat = function (d, mode) {
  const b0 = digits(d.n, 4).map(x => x * d.k), after = b0.slice(), need = [], ps = places(4), p = d.n * d.k;
  for (let i = 3; i > 0; i--) if (after[i] >= 10) { after[i - 1] += Math.floor(after[i] / 10); after[i] %= 10; need.push(ps[i]); }
  return {
    q: "Here are <b>" + d.k + " lots of " + fmt(d.n) + "</b> in blocks. Join 10 " + need.map(x => x.many).join(", then 10 ") + ". Then write the [[product]].",
    how: mode === "our" ? "Tap <b>Join 10</b> under the " + need[0].many + "." : "Join every group of 10 first. Then count the blocks.",
    ui: { k: "mat", b: b0, counts: false, multi: true, can: { join: need.map(x => x.k) } },
    lines: [d.k + " " + X + " " + fmt(d.n) + " = {0}"], blanks: [{ len: 4, w: "big" }],
    check(r) {
      const v = +r.v[0], done = MX.same(r.b, after);
      if (v === p && done) return { ok: true };
      if (!done) { const i = [3, 2, 1].find(j => r.b[j] >= 10); return { ok: false, msg: "There are " + r.b[i] + " " + ps[i].many + ". Tap <b>Join 10</b> to make 1 " + ps[i - 1].one + ".", parts: [v === p] }; }
      return { ok: false, msg: "The blocks are ready. Now count: " + MX.say(after) + ".", parts: [false] };
    },
    hint: { reveal: "counts", step: "10 " + need[0].many + " make 1 " + ps[ps.indexOf(need[0]) - 1].one + ". After you join, count each place." },
    worked: { text: MX.colwork(d.n, "x", d.k).steps.join(" ") + " So " + d.k + " " + X + " " + fmt(d.n) + " = " + fmt(p) + ".", pic: { k: "mat", b: after, counts: true } },
    yes: d.k + " " + X + " " + fmt(d.n) + " = " + fmt(p) + ".", key: String(p), fill: [String(p)], after: after
  };
};
/* Build it: share counters among plates, one round at a time. What is left over is the remainder. */
M.sharec = function (d, mode) {
  const q = Math.floor(d.n / d.k), rem = d.n % d.k;
  return {
    q: "[[Share|share]] <b>" + d.n + "</b> counters equally among <b>" + d.k + "</b> plates. How many are on each plate? What is the [[remainder]]?",
    how: mode === "our" ? "Tap <b>Give 1 to each plate</b> until you cannot go on." : "Share them out. Stop when there are not enough for every plate.",
    ui: { k: "share", n: d.n, plates: d.k }, right: { each: q },
    lines: [d.n + " " + D + " " + d.k + " = {0} remainder {1}"], blanks: [{ len: 2, w: "sm" }, { len: 2, w: "sm" }],
    check(r) {
      const v = r.v.map(Number), parts = [v[0] === q, v[1] === rem];
      if (r.each < q) return { ok: false, msg: "Keep sharing. There are still enough counters to give 1 to each plate.", parts: parts };
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      return { ok: false, msg: !parts[0] ? "Count the counters on one plate." : "Count the counters that are not on a plate.", parts: parts };
    },
    hint: { step: "Give 1 to each plate, again and again. The counters that are left at the end are the remainder." },
    worked: { text: d.k + " " + X + " " + q + " = " + d.k * q + ". " + d.n + " − " + d.k * q + " = " + rem + ". So each plate gets " + q + " and " + rem + (rem === 1 ? " is" : " are") + " left over.", pic: { k: "share", n: d.n, plates: d.k, each: q, fixed: true } },
    yes: d.n + " " + D + " " + d.k + " = " + q + " remainder " + rem + ".", key: q + " r " + rem, fill: [String(q), String(rem)]
  };
};
/* Build it: division as jumps back to zero on the number track */
M.jumpdiv = function (d, mode) {
  const q = d.n / d.k;
  return {
    q: "How many <b>" + d.k + "s</b> are in <b>" + d.n + "</b>? Jump back in " + d.k + "s from " + d.n + " to 0. Count the jumps.",
    how: mode === "our" ? "Tap <b>Jump back</b> until Zip stands on 0." : "Jump back to 0. Each jump is one group of " + d.k + ".",
    ui: { k: "nline", mode: "jump", skin: "wood", min: 0, max: d.n, tick: d.k, lab: 1, start: d.n, jump: d.k, dir: "back" }, right: { pos: 0, hops: q },
    lines: [d.n + " " + D + " " + d.k + " = {0}"], blanks: [{ len: 2, w: "mid" }],
    check(r) {
      const v = +r.v[0];
      if (v === q && r.pos === 0) return { ok: true };
      if (r.pos !== 0) return { ok: false, msg: "Jump back until you reach 0. You are on " + r.pos + " now.", parts: [v === q] };
      return { ok: false, msg: "Count the jumps on the track. Each jump is one " + d.k + ".", parts: [false] };
    },
    hint: { step: "Each jump takes away one group of " + d.k + ". The number of jumps is the answer." },
    worked: { text: "From " + d.n + " back to 0 in " + d.k + "s: " + Array.from({ length: q + 1 }, (x, i) => d.n - i * d.k).join(", ") + ". That is " + q + " jumps. So " + d.n + " " + D + " " + d.k + " = " + q + "." },
    yes: d.n + " " + D + " " + d.k + " = " + q + ".", key: String(q), fill: [String(q)]
  };
};

/* Draw it: the grid method. Partition the number, multiply each part, add. */
M.gridmul = function (d, mode) {
  const ps = parts(d.n), prods = ps.map(x => x * d.k), tot = d.n * d.k;
  return {
    q: "Use the grid to work out <b>" + d.k + " " + X + " " + fmt(d.n) + "</b>. [[Partition|partition]] " + fmt(d.n) + " into " + listAnd(ps.map(fmt)) + ".",
    how: mode === "our" ? "Multiply each part by " + d.k + ". Start with " + d.k + " " + X + " " + fmt(ps[0]) + "." : "Multiply each part. Then add the answers.",
    fig: { k: "gridm", n: d.n, m: d.k },
    lines: ps.map((x, i) => d.k + " " + X + " " + fmt(x) + " = {" + i + "}").concat(["Add them: {" + ps.length + "}"]), blanks: ps.map(() => ({ len: 4, w: "mid" })).concat([{ len: 5, w: "mid" }]),
    check(r) {
      const v = r.v.map(Number), pt = prods.map((x, i) => v[i] === x).concat([v[ps.length] === tot]);
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = pt.indexOf(false);
      if (i < ps.length) return { ok: false, msg: d.k + " " + X + " " + fmt(ps[i]) + ": first work out " + d.k + " " + X + " " + String(ps[i])[0] + ". Then put the zeros back.", parts: pt };
      return { ok: false, msg: "Now add the parts: " + prods.map(fmt).join(" + ") + ".", parts: pt };
    },
    hint: { pic: { k: "gridm", n: d.n, m: d.k, show: 1 }, step: d.k + " " + X + " " + fmt(ps[0]) + " is " + d.k + " " + X + " " + String(ps[0])[0] + " with " + (String(ps[0]).length - 1) + " zero" + (String(ps[0]).length === 2 ? "" : "s") + " after it." },
    worked: { text: ps.map((x, i) => d.k + " " + X + " " + fmt(x) + " = " + fmt(prods[i])).join(". ") + ". " + prods.map(fmt).join(" + ") + " = " + fmt(tot) + ".", pic: { k: "gridm", n: d.n, m: d.k, show: 9 } },
    yes: d.k + " " + X + " " + fmt(d.n) + " = " + fmt(tot) + ".", key: prods.concat([tot]).map(fmt).join(" ; "), fill: prods.concat([tot]).map(String)
  };
};
/* estimate a product: round the big number first */
M.estmul = function (d) {
  const rn = rnd(d.n, d.to), est = rn * d.k, exact = d.n * d.k;
  return {
    q: "[[Estimate|estimate]] <b>" + d.k + " " + X + " " + fmt(d.n) + "</b>. Round " + fmt(d.n) + " to the [[nearest]] <b>" + fmt(d.to) + "</b> first.",
    lines: [fmt(d.n) + " is about {0}", "My estimate: {1}"], blanks: [{ len: 5, w: "mid" }, { len: 5, w: "mid" }],
    check(r) {
      const v = r.v.map(Number), pt = [v[0] === rn, v[1] === est];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      if (!pt[0]) return { ok: false, msg: fmt(d.n) + " is between " + fmt(Math.floor(d.n / d.to) * d.to) + " and " + fmt(Math.floor(d.n / d.to) * d.to + d.to) + ". Which one is nearer?", parts: pt };
      return { ok: false, msg: v[1] === exact ? "That is the exact answer. For the estimate use the round number: " + d.k + " " + X + " " + fmt(rn) + "." : "Now work out " + d.k + " " + X + " " + fmt(rn) + ".", parts: pt };
    },
    hint: { pic: { k: "rline", n: d.n, to: d.to }, step: "Round " + fmt(d.n) + " to the nearest " + fmt(d.to) + ". Then multiply the round number by " + d.k + "." },
    worked: { text: fmt(d.n) + " is about " + fmt(rn) + ". " + d.k + " " + X + " " + fmt(rn) + " = " + fmt(est) + ". The exact answer is " + fmt(exact) + ", so the estimate is close." },
    yes: "A good estimate is " + fmt(est) + ". The exact answer is " + fmt(exact) + ".", key: fmt(rn) + " ; " + fmt(est), fill: [String(rn), String(est)]
  };
};
M.estmulpick = function (d) {
  const rn = rnd(d.n, d.to), est = rn * d.k;
  const opts = arrange([est].concat(d.wrong).map((v, i) => ({ html: fmt(v), ok: i === 0, why: "Round first: " + fmt(d.n) + " is about " + fmt(rn) + ". Then work out " + d.k + " " + X + " " + fmt(rn) + "." })), d.at);
  return {
    q: (d.text ? d.text + " " : "") + "Which is the best [[estimate]] for <b>" + d.k + " " + X + " " + fmt(d.n) + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "rline", n: d.n, to: d.to }, step: "Round " + fmt(d.n) + " to the nearest " + fmt(d.to) + ". Then multiply by " + d.k + "." },
    worked: { text: fmt(d.n) + " is about " + fmt(rn) + ". " + d.k + " " + X + " " + fmt(rn) + " = " + fmt(est) + "." },
    yes: d.k + " " + X + " " + fmt(rn) + " = " + fmt(est) + ".", key: LET[opts.findIndex(o => o.ok)] + ": " + fmt(est)
  };
};
/* divide by splitting the number into two easy parts */
M.partdiv = function (d) {
  const a = d.parts[0] / d.k, b = d.parts[1] / d.k, q = d.n / d.k;
  return {
    q: "Work out <b>" + d.n + " " + D + " " + d.k + "</b>. [[Partition|partition]] " + d.n + " into " + d.parts[0] + " and " + d.parts[1] + ".",
    fig: { k: "bar", whole: d.n, parts: d.parts },
    lines: [d.parts[0] + " " + D + " " + d.k + " = {0}", d.parts[1] + " " + D + " " + d.k + " = {1}", d.n + " " + D + " " + d.k + " = {2}"], blanks: [{ len: 3, w: "mid" }, { len: 3, w: "mid" }, { len: 3, w: "mid" }],
    check(r) {
      const v = r.v.map(Number), pt = [v[0] === a, v[1] === b, v[2] === q];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = pt.indexOf(false);
      return { ok: false, msg: i < 2 ? "How many " + d.k + "s make " + d.parts[i] + "?" + (d.parts[i] % 10 === 0 && d.parts[i] > 10 ? " Think of " + d.parts[i] / 10 + " " + D + " " + d.k + " first." : "") : "Add your two answers: " + a + " + " + b + ".", parts: pt };
    },
    hint: { step: "Divide each part by " + d.k + ". Then add the two answers." },
    worked: { text: d.parts[0] + " " + D + " " + d.k + " = " + a + ". " + d.parts[1] + " " + D + " " + d.k + " = " + b + ". " + a + " + " + b + " = " + q + "." },
    yes: d.n + " " + D + " " + d.k + " = " + q + ".", key: [a, b, q].join(" ; "), fill: [String(a), String(b), String(q)]
  };
};
/* short multiplication on squared paper: type the answer digits, ones first */
M.colmul = function (d, mode) {
  const w = MX.colwork(d.n, "x", d.k), n = Math.max(w.n, w.cells.length), A = digits(d.n, w.n);
  const row = (sign, ds) => '<span class="cr"><i>' + sign + "</i>" + "<b></b>".repeat(n - ds.length) + ds.map(x => "<b>" + x + "</b>").join("") + "</span>";
  const ansRow = '<span class="cr ans"><i></i>' + "<b></b>".repeat(n - w.cells.length) + w.cells.map((x, i) => "{" + (w.cells.length - 1 - i) + "}").join("") + "</span>";
  return {
    q: (d.text ? d.text + " " : "") + "Multiply in columns. Start with the <b>ones</b>.",
    how: mode === "our" ? w.steps[0] : "Start with the ones. Regroup when you need to.",
    lines: ['<span class="colw"><span class="colsum" style="--n:' + n + '">' + row("", A) + row(X, [d.k]) + ansRow + "</span></span>"], blanks: w.cells.map(() => ({ len: 1, w: "cell" })),
    given: r => r.v.slice().reverse().join(""),
    check(r) {
      const pt = w.cells.map((x, i) => r.v[i] !== "" && +r.v[i] === x);
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = Math.min(pt.indexOf(false), w.n - 1);
      return { ok: false, msg: "Look at the " + PN[i] + ". " + w.asks[i], parts: pt };
    },
    hint: { pic: { k: "gridm", n: d.n, m: d.k }, step: w.steps[0] },
    worked: { text: w.steps.join(" "), pic: { k: "col", a: d.n, b: d.k, op: "x", ans: w.ans, marks: w.marks } },
    yes: fmt(d.n) + " " + X + " " + d.k + " = " + fmt(w.ans) + ".", key: String(w.ans), fill: w.cells.map(String)
  };
};
/* "Calculate." with a multiplication and a division beyond the times tables */
M.calcmd = function (d) {
  const it = d.items, ans = it.map(calc);
  const how = f => (f[1] === "x" ? parts(f[0]).map(x => f[2] + " " + X + " " + fmt(x) + " = " + fmt(x * f[2])).join(". ") + (parts(f[0]).length > 1 ? ". Add them: " + fmt(calc(f)) : "") : calc(f) + " " + X + " " + f[2] + " = " + f[0] + ", so " + ftxt(f) + " = " + calc(f));
  return {
    q: (d.text ? d.text + " " : "") + "Calculate.", marks: it.length,
    lines: it.map((f, i) => (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + ftxt(f) + " = {" + i + "}"), blanks: it.map(() => ({ len: 5, w: "big" })),
    check(r) {
      const pt = it.map((f, i) => r.v[i] !== "" && +r.v[i] === ans[i]);
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = pt.indexOf(false), f = it[i];
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + (f[1] === "x" ? "Split " + fmt(f[0]) + " into " + listAnd(parts(f[0]).map(fmt)) + ". Multiply each part by " + f[2] + ", then add." : "How many " + f[2] + "s make " + f[0] + "? Try " + (Math.floor(f[0] / f[2] / 10) * 10 || 10) + " " + X + " " + f[2] + " first."), parts: pt };
    },
    hint: { pic: it[0][1] === "x" ? { k: "gridm", n: it[0][0], m: it[0][2] } : null, step: it[0][1] === "x" ? "Partition the big number. Multiply each part by " + it[0][2] + ". Then add." : "Division is the opposite of multiplication. Which number times " + it[0][2] + " makes " + it[0][0] + "?" },
    worked: { text: it.map((f, i) => (it.length > 1 ? "(" + "abc"[i] + ") " : "") + how(f)).join(". ") + "." },
    yes: it.map((f, i) => ftxt(f) + " = " + fmt(ans[i])).join(" and ") + ".", key: ans.map(fmt).join(" ; "), fill: ans.map(String)
  };
};
/* a division with a remainder */
M.divrem = function (d) {
  const q = Math.floor(d.n / d.k), rem = d.n % d.k;
  return {
    q: "Work out the division. Write the [[remainder]] too.",
    lines: [d.n + " " + D + " " + d.k + " = {0} remainder {1}"], blanks: [{ len: 2, w: "sm" }, { len: 2, w: "sm" }],
    check(r) {
      const v = r.v.map(Number), pt = [v[0] === q, v[1] === rem];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      if (v[1] >= d.k) return { ok: false, msg: "The remainder must be smaller than " + d.k + ". You can make one more group.", parts: pt };
      return { ok: false, msg: "Count in " + d.k + "s. Stop before you pass " + d.n + ". What is left?", parts: pt };
    },
    hint: { pic: { k: "share", n: d.n, plates: d.k, each: q, fixed: true }, step: "Count in " + d.k + "s: " + Array.from({ length: q }, (x, i) => (i + 1) * d.k).join(", ") + ". How far is it from " + q * d.k + " to " + d.n + "?" },
    worked: { text: q + " " + X + " " + d.k + " = " + q * d.k + ". " + d.n + " − " + q * d.k + " = " + rem + ". So " + d.n + " " + D + " " + d.k + " = " + q + " remainder " + rem + "." },
    yes: d.n + " " + D + " " + d.k + " = " + q + " remainder " + rem + ".", key: q + " r " + rem, fill: [String(q), String(rem)]
  };
};
/* a real-life division where the remainder matters: round up, round down, or the remainder is the answer */
M.remstory = function (d) {
  const q = Math.floor(d.n / d.k), rem = d.n % d.k, ans = d.want === "up" ? q + 1 : d.want === "down" ? q : rem;
  const div = d.n + " " + D + " " + d.k + " = " + q + " remainder " + rem;
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (d.want === "up" && v === q) return { ok: false, msg: div + ". Think about the " + rem + " that " + (rem === 1 ? "is" : "are") + " left over. " + d.why, parts: [false] };
      if (d.want === "down" && v === q + 1) return { ok: false, msg: div + ". Is the last one complete? " + d.why, parts: [false] };
      if (d.want === "rem" && v === q) return { ok: false, msg: "That is the number of groups. " + d.why, parts: [false] };
      return { ok: false, msg: "First work out " + d.n + " " + D + " " + d.k + ". How many " + d.k + "s fit in " + d.n + ", and what is left over?", parts: [false] };
    },
    hint: { pic: { k: "share", n: d.n, plates: d.k, each: q, fixed: true, groups: true }, step: "Work out " + d.n + " " + D + " " + d.k + " with its remainder. Then read the question again." },
    worked: { text: div + ". " + d.why + " So the answer is " + ans + " " + d.unit + "." },
    yes: div + ". The answer is " + ans + " " + d.unit + ".", key: String(ans), fill: [String(ans)]
  };
};
/* a written multiplication with one mistake: say what went wrong, then write the right answer */
M.findmistake = function (d) {
  const right = d.n * d.k, he = d.he ? "He" : "She";
  const opts = arrange(d.opts.map((o, i) => ({ html: o.t, ok: i === 0, why: o.why })), d.at);
  return {
    q: d.who + " works out <b>" + fmt(d.n) + " " + X + " " + d.k + "</b>. " + he + " makes a mistake.", marks: 2,
    fig: { k: "col", a: d.n, b: d.k, op: "x", ans: d.shown },
    sub: "Tick (✓) the sentence that tells the mistake. Then write the correct answer.", letters: true, opts: opts, optsFirst: true,
    lines: ["Correct answer: {0}"], blanks: [{ len: 5, w: "big" }],
    ready: r => r.v[0] !== "" && r.pick >= 0,
    given: r => (r.pick >= 0 ? LET[r.pick] : "") + ", " + r.v[0],
    check(r) {
      const pickOk = opts[r.pick].ok, numOk = +r.v[0] === right;
      if (pickOk && numOk) return { ok: true, parts: [true] };
      if (!pickOk) return { ok: false, msg: opts[r.pick].why, parts: [numOk], pickOk: false };
      return { ok: false, msg: "You found the mistake. Now work it out again: " + (+r.v[0] === d.shown ? d.shown + " is the wrong answer." : "start with the ones and regroup."), parts: [false], pickOk: true };
    },
    hint: { pic: { k: "gridm", n: d.n, m: d.k }, step: "Work the multiplication out yourself, one digit at a time. Compare each digit with " + d.who + "'s answer." },
    worked: { text: MX.colwork(d.n, "x", d.k).steps.join(" ") + " The correct answer is " + fmt(right) + ", not " + fmt(d.shown) + ".", pic: { k: "col", a: d.n, b: d.k, op: "x", ans: right, marks: MX.colwork(d.n, "x", d.k).marks } },
    yes: fmt(d.n) + " " + X + " " + d.k + " = " + fmt(right) + ".", key: LET[opts.findIndex(o => o.ok)] + " ; " + fmt(right), fill: [String(right)]
  };
};
})();

/* Question models for Stop 7 (fractions). Every answer is worked out here from the numbers in the data. */
(function () {
const M = MX.M, fmt = MX.fmt, LET = MX.LET, arrange = MX.arrange, cap = MX.cap;
const X = "×", D = "÷", SYMH = { "<": "&lt;", ">": "&gt;", "=": "=" };
/* a fraction written the way it is on paper; read aloud and in plain text as "1/4" */
const F = (n, d) => '<span class="fr"><i>' + n + '</i><span class="frs">/</span><i>' + d + "</i></span>";
const FB = (i, j) => '<span class="frb">{' + i + '}<span class="frl"></span>{' + j + "}</span>";      /* two answer boxes, one over the other */
const NAMES = { 2: "half", 3: "third", 4: "quarter", 5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth", 12: "twelfth" };
const plural = d => (d === 2 ? "halves" : NAMES[d] + "s");
MX.F = F;

/* Build it: cut a strip into equal parts and name one part */
M.cutbar = function (d, mode) {
  return {
    q: "Cut the strip into <b>" + d.parts + "</b> equal parts. What [[fraction]] of the strip is <b>one part</b>?",
    how: mode === "our" ? "Tap <b>More</b> until there are " + d.parts + " parts. Look how the parts get smaller." : "Cut the strip first. Then write the fraction.",
    ui: { k: "strip", parts: 1, max: 12 }, right: { parts: d.parts },
    lines: ["One part is " + FB(0, 1)], blanks: [{ len: 2, w: "fr" }, { len: 2, w: "fr" }],
    given: r => r.v.join("/"),
    check(r) {
      const v = r.v.map(Number), pt = [v[0] === 1, v[1] === d.parts];
      if (r.parts !== d.parts) return { ok: false, msg: "The strip has " + r.parts + (r.parts === 1 ? " part" : " parts") + ". Cut it into " + d.parts + " equal parts.", parts: pt };
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      return { ok: false, msg: !pt[1] ? "The bottom number tells how many equal parts make the whole. Count the parts." : "The top number tells how many parts you take. You take one part.", parts: pt };
    },
    hint: { step: "The bottom number is the number of equal parts. The top number is how many parts you take." },
    worked: { text: "The strip has " + d.parts + " equal parts. One part is one " + NAMES[d.parts] + ". We write 1 over " + d.parts + ".", pic: { k: "fbar", parts: d.parts, shade: 1 } },
    yes: "One of " + d.parts + " equal parts is one " + NAMES[d.parts] + ".", key: "1/" + d.parts, fill: ["1", String(d.parts)]
  };
};
/* which unit fraction is bigger (or smaller)? two strips to look at */
M.ucmp = function (d, mode) {
  const want = d.ask === "smaller" ? Math.max(d.a, d.b) : Math.min(d.a, d.b), other = want === d.a ? d.b : d.a;
  const opts = arrange([want, other].map((x, i) => ({ html: F(1, x), fig: d.bars === false ? null : { k: "fbar", parts: x, shade: 1 }, alt: "one " + NAMES[x], ok: i === 0, why: "Look at the two strips. " + (d.ask === "smaller" ? "More parts make smaller parts." : "Fewer parts make bigger parts.") })), d.at);
  return {
    q: "Which [[fraction]] is <b>" + (d.ask || "bigger") + "</b>?", sub: "Tick (✓) one box.", opts: opts,
    how: mode === "our" && d.bars !== false ? "Look at the orange part of each strip. Which one is " + (d.ask === "smaller" ? "shorter" : "longer") + "?" : "",
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: d.bars === false ? [{ k: "fbar", parts: d.a, shade: 1 }, { k: "fbar", parts: d.b, shade: 1 }] : null, step: "Think of one strip cut into " + d.a + " parts and the same strip cut into " + d.b + " parts. Which parts are bigger?" },
    worked: { text: "When a whole is cut into more parts, each part is smaller. So one " + NAMES[Math.max(d.a, d.b)] + " is smaller than one " + NAMES[Math.min(d.a, d.b)] + "." },
    yes: "One " + NAMES[want] + " is " + (d.ask || "bigger") + " than one " + NAMES[other] + ".", key: "1/" + want
  };
};
/* compare unit fractions with <, > or = */
M.fsym = function (d) {
  const ans = d.rows.map(rw => (rw[0] === rw[1] ? "=" : rw[0] > rw[1] ? "<" : ">"));
  return {
    q: "Write &lt;, &gt; or = in " + (d.rows.length > 1 ? "each box." : "the box."), marks: d.rows.length,
    fig: d.bars ? { k: "fbars", list: [d.rows[0][0], d.rows[0][1]] } : null,
    lines: d.rows.map((rw, i) => F(1, rw[0]) + " {" + i + "} " + F(1, rw[1])), blanks: d.rows.map(() => ({ len: 1, w: "sym", sym: true })),
    given: r => r.v.join(" "),
    check(r) {
      const pt = ans.map((x, i) => r.v[i] === x);
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = pt.indexOf(false), rw = d.rows[i];
      return { ok: false, msg: (d.rows.length > 1 ? "Look at row " + (i + 1) + ". " : "") + "A whole cut into " + Math.max(rw[0], rw[1]) + " parts has smaller parts than a whole cut into " + Math.min(rw[0], rw[1]) + " parts.", parts: pt };
    },
    hint: { pic: [{ k: "fbar", parts: d.rows[0][0], shade: 1 }, { k: "fbar", parts: d.rows[0][1], shade: 1 }], step: "The bigger the bottom number, the more parts there are, and the smaller each part is." },
    worked: { text: d.rows.map((rw, i) => "One " + NAMES[rw[0]] + " is " + (ans[i] === "<" ? "smaller than" : ans[i] === ">" ? "bigger than" : "equal to") + " one " + NAMES[rw[1]]).join(". ") + ". More parts make smaller parts." },
    yes: d.rows.map((rw, i) => F(1, rw[0]) + " " + SYMH[ans[i]] + " " + F(1, rw[1])).join(" and ") + ".", key: ans.map(x => SYMH[x]).join(" ; "), fill: ans
  };
};
/* tick the smallest (or largest) of three unit fractions */
M.upick = function (d) {
  const want = d.ask === "largest" ? Math.min.apply(null, d.ds) : Math.max.apply(null, d.ds), rest = d.ds.filter(x => x !== want);
  const opts = arrange([want].concat(rest).map((x, i) => ({ html: F(1, x), ok: i === 0, why: "One " + NAMES[x] + " is not the " + d.ask + ". " + (d.ask === "largest" ? "Fewer parts make bigger parts." : "More parts make smaller parts.") })), d.at);
  return {
    q: (d.text ? d.text + " " : "") + "Which [[fraction]] is the <b>" + d.ask + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: d.ds.map(x => ({ k: "fbar", parts: x, shade: 1 })), step: "Look at the bottom numbers. The biggest bottom number means the most parts, so the smallest parts." },
    worked: { text: "The parts get smaller when there are more of them. The " + d.ask + " fraction is one " + NAMES[want] + "." },
    yes: "One " + NAMES[want] + " is the " + d.ask + ".", key: LET[opts.findIndex(o => o.ok)] + ": 1/" + want
  };
};
/* a unit fraction of an amount. With counters: share them among as many plates as the bottom number. */
M.fracof = function (d, mode) {
  const ans = d.n / d.d;
  const t = {
    q: (d.text ? d.text + " " : "") + "Find " + F(1, d.d) + " of <b>" + d.n + "</b>." + (d.tool ? " Share " + d.n + " counters among " + d.d + " plates." : ""),
    lines: [F(1, d.d) + " of " + d.n + " = {0}" + (d.unit ? " " + d.unit : "")], blanks: [{ len: 3, w: "mid" }],
    check(r) {
      const v = +r.v[0];
      if (d.tool && r.each < ans) return { ok: false, msg: "Keep sharing until all the counters are on the plates.", parts: [v === ans] };
      if (v === ans) return { ok: true };
      return { ok: false, msg: v === d.n * d.d ? "Do not multiply. One " + NAMES[d.d] + " means: share into " + d.d + " equal parts." : v === d.n - d.d ? "Do not take away. Divide " + d.n + " by " + d.d + "." : "One " + NAMES[d.d] + " of " + d.n + " is " + d.n + " " + D + " " + d.d + ". How many " + d.d + "s make " + d.n + "?", parts: [false] };
    },
    hint: { pic: d.tool ? null : { k: "bar", whole: d.n, parts: Array.from({ length: d.d }, () => null) }, step: "To find one " + NAMES[d.d] + ", divide by " + d.d + "." },
    worked: { text: "One " + NAMES[d.d] + " of " + d.n + " means " + d.n + " shared into " + d.d + " equal parts. " + d.n + " " + D + " " + d.d + " = " + ans + ".", pic: { k: "share", n: d.n, plates: d.d, each: ans, fixed: true } },
    yes: "One " + NAMES[d.d] + " of " + d.n + " is " + ans + ".", key: String(ans), fill: [String(ans)]
  };
  if (d.tool) { t.ui = { k: "share", n: d.n, plates: d.d }; t.right = { each: ans }; t.how = mode === "our" ? "Tap <b>Give 1 to each plate</b> until no counters are left. Then count one plate." : "Share the counters. One plate is one " + NAMES[d.d] + "."; }
  if (d.bar) t.fig = { k: "bar", whole: d.n, parts: Array.from({ length: d.d }, () => null) };
  return t;
};
/* "Calculate." with unit fractions of amounts */
M.fcalc = function (d) {
  const it = d.items, ans = it.map(x => x[1] / x[0]);
  return {
    q: "Calculate.", marks: it.length > 2 ? 2 : it.length,
    lines: it.map((x, i) => "<i>(" + "abc"[i] + ")</i> " + F(1, x[0]) + " of " + x[1] + " = {" + i + "}"), blanks: it.map(() => ({ len: 3, w: "mid" })),
    check(r) {
      const pt = it.map((x, i) => r.v[i] !== "" && +r.v[i] === ans[i]);
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = pt.indexOf(false);
      return { ok: false, msg: "Look at (" + "abc"[i] + "). To find one " + NAMES[it[i][0]] + ", divide " + it[i][1] + " by " + it[i][0] + ".", parts: pt };
    },
    hint: { pic: { k: "bar", whole: it[0][1], parts: Array.from({ length: it[0][0] }, () => null) }, step: "A unit fraction tells you to divide. One " + NAMES[it[0][0]] + " of " + it[0][1] + " is " + it[0][1] + " " + D + " " + it[0][0] + "." },
    worked: { text: it.map((x, i) => "(" + "abc"[i] + ") " + x[1] + " " + D + " " + x[0] + " = " + ans[i]).join(". ") + "." },
    yes: it.map((x, i) => F(1, x[0]) + " of " + x[1] + " = " + ans[i]).join(", ") + ".", key: ans.join(" ; "), fill: ans.map(String)
  };
};
/* a fraction is a division: a things shared equally among b */
M.fdiv = function (d, mode) {
  return {
    q: d.text, marks: 1,
    how: mode === "our" ? "Each " + d.one + " is cut into " + d.b + " equal parts. Count the parts that one child gets." : "Share every " + d.one + " equally. Count one child's parts.",
    fig: d.pic === false ? null : { k: "pizzas", wholes: d.a, people: d.b, kind: d.kind || "pizza" },
    lines: ["Each child gets " + FB(0, 1) + " of a " + d.one + "."], blanks: [{ len: 2, w: "fr" }, { len: 2, w: "fr" }],
    given: r => r.v.join("/"),
    check(r) {
      const v = r.v.map(Number), pt = [v[0] === d.a, v[1] === d.b];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      if (v[0] === d.b && v[1] === d.a) return { ok: false, msg: "You have the two numbers, but the other way round. The number of children goes at the bottom.", parts: [false, false] };
      return { ok: false, msg: !pt[1] ? "Each " + d.one + " is cut into " + d.b + " equal parts, one for each child. That is the bottom number." : "Each child gets one part from every " + d.one + ". There are " + d.a + " " + d.many + ".", parts: pt };
    },
    hint: { step: d.a + " shared among " + d.b + " is " + d.a + " " + D + " " + d.b + ". Write " + d.a + " on top and " + d.b + " at the bottom." },
    worked: { text: "Cut each " + d.one + " into " + d.b + " equal parts. Each child gets 1 part from each of the " + d.a + " " + d.many + ". That is " + d.a + " parts of size one " + NAMES[d.b] + ". So " + d.a + " " + D + " " + d.b + " is " + d.a + " over " + d.b + ".", pic: { k: "pizzas", wholes: d.a, people: d.b, kind: d.kind || "pizza" } },
    yes: d.a + " " + D + " " + d.b + " = " + F(d.a, d.b) + ".", key: d.a + "/" + d.b, fill: [String(d.a), String(d.b)]
  };
};
/* the link between a division and a fraction, in both directions */
M.fdivsent = function (d) {
  const toFrac = d.miss === "frac";
  return {
    q: toFrac ? "Write the division as a [[fraction]]." : "Write the fraction as a division.",
    lines: [toFrac ? d.a + " " + D + " " + d.b + " = " + FB(0, 1) : "{0} " + D + " {1} = " + F(d.a, d.b)], blanks: toFrac ? [{ len: 2, w: "fr" }, { len: 2, w: "fr" }] : [{ len: 2, w: "sm" }, { len: 2, w: "sm" }],
    given: r => r.v.join(toFrac ? "/" : " ÷ "),
    check(r) {
      const v = r.v.map(Number), pt = [v[0] === d.a, v[1] === d.b];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      return { ok: false, msg: v[0] === d.b && v[1] === d.a ? "The other way round. The number you share goes first (on top). The number you divide by goes at the bottom." : "The top number is the number you share. The bottom number is the number you divide by.", parts: pt };
    },
    hint: { step: "A fraction is a division. The top number is shared. The bottom number says into how many parts." },
    worked: { text: d.a + " " + D + " " + d.b + " and " + d.a + " over " + d.b + " mean the same: " + d.a + " shared into " + d.b + " equal parts." },
    yes: d.a + " " + D + " " + d.b + " = " + F(d.a, d.b) + ".", key: d.a + " ; " + d.b, fill: [String(d.a), String(d.b)]
  };
};
/* how many unit fractions make one whole? */
M.fwhole = function (d) {
  return {
    q: "How many " + plural(d.d) + " make <b>1 whole</b>?", fig: { k: "fbar", parts: d.d, shade: 0 },
    lines: ["{0} " + plural(d.d)], blanks: [{ len: 2, w: "mid" }],
    check(r) { const v = +r.v[0]; if (v === d.d) return { ok: true }; return { ok: false, msg: "Count the equal parts in the strip.", parts: [false] }; },
    hint: { step: "One " + NAMES[d.d] + " is 1 of " + d.d + " equal parts." },
    worked: { text: "A whole cut into " + d.d + " equal parts gives " + d.d + " " + plural(d.d) + "." },
    yes: d.d + " " + plural(d.d) + " make 1 whole.", key: String(d.d), fill: [String(d.d)]
  };
};
/* a unit fraction backwards: one part is known, find the whole */
M.fback = function (d) {
  const whole = d.d * d.part;
  return {
    q: "One " + NAMES[d.d] + " of a number is <b>" + d.part + "</b>. What is the number?",
    fig: { k: "bar", whole: null, parts: [d.part].concat(Array.from({ length: d.d - 1 }, () => null)) },
    lines: ["The number is {0}"], blanks: [{ len: 3, w: "big" }],
    check(r) { const v = +r.v[0]; if (v === whole) return { ok: true }; return { ok: false, msg: v === d.part / d.d || v === Math.round(d.part / d.d) ? "The whole number is bigger than one part. There are " + d.d + " equal parts of " + d.part + "." : "The bar has " + d.d + " equal parts. Each part is " + d.part + ". Count in " + d.part + "s.", parts: [false] }; },
    hint: { step: "One " + NAMES[d.d] + " is one of " + d.d + " equal parts. All " + d.d + " parts are " + d.part + "." },
    worked: { text: "There are " + d.d + " equal parts and each part is " + d.part + ". " + d.d + " " + X + " " + d.part + " = " + whole + ".", pic: { k: "bar", whole: whole, parts: Array.from({ length: d.d }, () => d.part) } },
    yes: "One " + NAMES[d.d] + " of " + whole + " is " + d.part + ".", key: String(whole), fill: [String(whole)]
  };
};
/* a real-life problem with a unit fraction of an amount */
M.fstory = function (d) {
  const ans = d.n / d.d, left = d.n - ans, want = d.rest ? left : ans;
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === want) return { ok: true };
      if (d.rest && v === ans) return { ok: false, msg: ans + " is one " + NAMES[d.d] + ". The question asks for what is left. Take " + ans + " away from " + d.n + ".", parts: [false] };
      return { ok: false, msg: "First find one " + NAMES[d.d] + " of " + d.n + ": divide " + d.n + " by " + d.d + ".", parts: [false] };
    },
    hint: { pic: { k: "bar", whole: d.n, parts: Array.from({ length: d.d }, () => null) }, step: "One " + NAMES[d.d] + " of " + d.n + " is " + d.n + " " + D + " " + d.d + "." + (d.rest ? " Then take it away from " + d.n + "." : "") },
    worked: { text: d.n + " " + D + " " + d.d + " = " + ans + "." + (d.rest ? " " + d.n + " − " + ans + " = " + left + "." : "") },
    yes: "One " + NAMES[d.d] + " of " + d.n + " is " + ans + "." + (d.rest ? " So " + left + " " + d.unit + " are left." : ""), key: String(want), fill: [String(want)]
  };
};
})();

/* Question models for Stop 8 (time and timetables). Every answer is worked out here from the numbers in the data. */
(function () {
const M = MX.M, fmt = MX.fmt, LET = MX.LET, arrange = MX.arrange, cap = MX.cap;
const pad = n => String(n).padStart(2, "0"), t24 = (h, m) => pad(h) + ":" + pad(m), t12 = (h, m) => ((h % 12) || 12) + ":" + pad(m) + (h < 12 ? " a.m." : " p.m.");
const NUM = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
const MW = { 5: "five", 10: "ten", 15: "quarter", 20: "twenty", 25: "twenty-five", 30: "half" };
const part = h => (h < 12 ? "in the morning" : h < 18 ? "in the afternoon" : "in the evening");
const clockWords = (h, m) => (m === 0 ? NUM[h % 12] + " o'clock" : m <= 30 ? MW[m] + " past " + NUM[h % 12] : MW[60 - m] + " to " + NUM[(h + 1) % 12]);
const words = (h, m) => clockWords(h, m) + " " + part(h);
const mins = t => t[0] * 60 + t[1];
const dur = n => (n >= 60 ? Math.floor(n / 60) + (n >= 120 ? " hours" : " hour") + (n % 60 ? " " + n % 60 + " minutes" : "") : n + " minutes");
const durS = n => (n >= 60 ? Math.floor(n / 60) + " h" + (n % 60 ? " " + n % 60 + " min" : "") : n + " min");          /* short, for the labels on a time line */
const UNIT = { "minutes>seconds": 60, "hours>minutes": 60, "days>hours": 24, "weeks>days": 7, "years>months": 12 }, ONE = { minutes: "minute", hours: "hour", days: "day", weeks: "week", years: "year", seconds: "second", months: "month" };
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
MX.time = { t24: t24, t12: t12, words: words, clockWords: clockWords };
const LQ = s => '<span class="lq">' + s + "</span>";

/* read an analogue clock */
M.clockread = function (d, mode) {
  const pos = d.m / 5;
  return {
    q: "What time does the clock show?", how: mode === "our" ? "The short hand shows the hours. The long hand shows the minutes." : "Hours first, then minutes.",
    fig: { k: "clock", h: d.h, m: d.m, secret: true },
    lines: ["{0} : {1}"], blanks: [{ len: 2, w: "sm" }, { len: 2, w: "sm" }],
    given: r => r.v.join(":"),
    check(r) {
      const pt = [+r.v[0] === d.h, +r.v[1] === d.m && r.v[1] !== ""];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      if (!pt[1]) return { ok: false, msg: +r.v[1] === pos ? "The long hand points to " + pos + ". Each number is 5 minutes: count in 5s." : "Look at the long hand. Count in 5s from the 12.", parts: pt };
      return { ok: false, msg: "Look at the short hand. Which number has it just passed?", parts: pt };
    },
    hint: { step: "The short hand has passed " + d.h + ". The long hand points to " + (pos || 12) + ". Count in 5s: " + (pos ? Array.from({ length: pos }, (x, i) => (i + 1) * 5).join(", ") : "0") + "." },
    worked: { text: "The short hand has passed " + d.h + ", so the hour is " + d.h + ". The long hand points to " + (pos || 12) + ": " + pos + " × 5 = " + d.m + " minutes. The time is " + d.h + ":" + pad(d.m) + "." },
    yes: "The clock shows " + d.h + ":" + pad(d.m) + ", " + clockWords(d.h, d.m) + ".", key: d.h + ":" + pad(d.m), fill: [String(d.h), pad(d.m)]
  };
};
/* move the hands of the clock to a time given in words or as a digital time */
M.clockset = function (d, mode) {
  const h12 = (d.h % 12) || 12, shown = d.as === "24" ? t24(d.h, d.m) : d.as === "12" ? t12(d.h, d.m) : clockWords(d.h, d.m);
  return {
    q: "Set the clock to <b class=\"wr\">" + shown + "</b>.",
    how: mode === "our" ? "The blue buttons move the short hand. The red buttons move the long hand." : "Move the hands. Then tap Check.",
    ui: { k: "clock", h: 12, m: 0 }, right: { h: h12, m: d.m },
    check(r) {
      if (r.h === h12 && r.m === d.m) return { ok: true };
      if (r.m !== d.m) return { ok: false, msg: "Look at the long hand. " + (d.m === 0 ? "For o'clock it points to 12." : d.m <= 30 || d.as !== "words" ? d.m + " minutes is " + d.m / 5 + " jumps of 5 from the 12." : clockWords(d.h, d.m).split(" to ")[0] + " to the hour: the long hand points to " + d.m / 5 + "."), parts: [] };
      return { ok: false, msg: "The long hand is right. Now the short hand: " + (d.as === "24" && d.h > 12 ? d.h + " − 12 = " + h12 + ", so it is " + h12 + " in the afternoon or evening." : "the hour is " + h12 + (d.m > 30 ? ", and the short hand is nearly at " + ((h12 % 12) + 1) + "." : ".")), parts: [] };
    },
    hint: { step: (d.as === "24" && d.h > 12 ? d.h + ":" + pad(d.m) + " is after midday. Take away 12: " + d.h + " − 12 = " + h12 + ". " : "") + "The time is " + h12 + ":" + pad(d.m) + ". The long hand points to " + (d.m / 5 || 12) + "." },
    worked: { text: shown + " is " + h12 + ":" + pad(d.m) + ". The long hand points to " + (d.m / 5 || 12) + ". The short hand is " + (d.m === 0 ? "on " + h12 : d.m > 30 ? "nearly at " + ((h12 % 12) + 1) : "just past " + h12) + ".", pic: { k: "clock", h: h12, m: d.m } },
    yes: "The clock shows " + h12 + ":" + pad(d.m) + ".", key: h12 + ":" + pad(d.m)
  };
};
/* 12-hour time to 24-hour time */
M.to24 = function (d) {
  return {
    q: "Write <b>" + t12(d.h, d.m) + "</b> as a 24-hour time.",
    lines: ["{0} : {1}"], blanks: [{ len: 2, w: "sm" }, { len: 2, w: "sm" }],
    given: r => r.v.join(":"),
    check(r) {
      const pt = [+r.v[0] === d.h && r.v[0] !== "", +r.v[1] === d.m && r.v[1] !== ""];
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      if (!pt[0]) return { ok: false, msg: d.h >= 13 ? "p.m. means after midday. Add 12 to the hours: " + (d.h - 12) + " + 12." : d.h === 12 ? "12 p.m. is midday. The hours stay 12." : "a.m. means before midday. The hours stay the same.", parts: pt };
      return { ok: false, msg: "The minutes stay the same: " + pad(d.m) + ".", parts: pt };
    },
    hint: { step: d.h >= 13 ? "For p.m. times, add 12 to the hours. The minutes stay the same." : "For a.m. times the hours stay the same. Write two digits for the hours." },
    worked: { text: d.h >= 13 ? (d.h - 12) + " + 12 = " + d.h + ". So " + t12(d.h, d.m) + " is " + t24(d.h, d.m) + "." : t12(d.h, d.m) + " is in the morning. It is " + t24(d.h, d.m) + "." },
    yes: t12(d.h, d.m) + " is " + t24(d.h, d.m) + ".", key: t24(d.h, d.m), fill: [pad(d.h), pad(d.m)]
  };
};
/* which words (or which 12-hour time) say the same as a 24-hour time? */
M.timewords = function (d) {
  const say = x => (d.as === "12" ? t12(x[0], x[1]) : cap(words(x[0], x[1])));
  const opts = arrange([[d.h, d.m]].concat(d.wrong).map((x, i) => ({ html: say(x), ok: i === 0, why: say(x) + " is " + t24(x[0], x[1]) + ", not " + t24(d.h, d.m) + "." })), d.at);
  return {
    q: (d.text ? d.text + " " : "") + "Which is the same time as <b>" + t24(d.h, d.m) + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    fig: { k: "dclock", t: t24(d.h, d.m) },
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: d.h >= 13 ? "After midday, take away 12 from the hours: " + d.h + " − 12 = " + (d.h - 12) + ". That is " + (d.h - 12) + " p.m." : "Before 12:00 it is morning (a.m.)." },
    worked: { text: t24(d.h, d.m) + " is " + t12(d.h, d.m) + ". In words: " + words(d.h, d.m) + "." },
    yes: t24(d.h, d.m) + " is " + words(d.h, d.m) + ".", key: LET[opts.findIndex(o => o.ok)] + ": " + t12(d.h, d.m)
  };
};
/* change units of time */
M.tconv = function (d) {
  const k = UNIT[d.from + ">" + d.to], ans = d.back ? d.n / k : d.n * k, big = d.from, small = d.to;
  return {
    q: (d.text ? d.text + " " : "") + "Complete.",
    lines: [d.back ? fmt(d.n) + " " + small + " = {0} " + big : d.n + " " + (d.n === 1 ? ONE[big] : big) + " = {0} " + small], blanks: [{ len: 4, w: "mid" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      return { ok: false, msg: "1 " + ONE[big] + " = " + k + " " + small + ". " + (d.back ? "How many " + k + "s make " + fmt(d.n) + "?" : v === d.n + k ? "Do not add. Multiply: " + d.n + " lots of " + k + "." : "So " + d.n + " " + big + " is " + d.n + " lots of " + k + "."), parts: [false] };
    },
    hint: { step: "Remember: 1 " + ONE[big] + " = " + k + " " + small + "." },
    worked: { text: "1 " + ONE[big] + " = " + k + " " + small + ". " + (d.back ? fmt(d.n) + " ÷ " + k + " = " + ans : d.n + " × " + k + " = " + fmt(ans)) + "." },
    yes: d.back ? fmt(d.n) + " " + small + " = " + ans + " " + big + "." : d.n + " " + big + " = " + fmt(ans) + " " + small + ".", key: String(ans), fill: [String(ans)]
  };
};
/* count on in 60s (or 24s, 7s) on the number line to change a unit of time */
M.tjump = function (d, mode) {
  const k = UNIT[d.from + ">" + d.to], end = d.n * k, one = ONE[d.from], seq = Array.from({ length: d.n }, (x, i) => (i + 1) * k);
  const base = M.jump({ start: 0, step: k, n: d.n, dir: "on", min: 0, max: k * 10, tick: k }, mode);
  return Object.assign(base, {
    q: "1 " + one + " is " + k + " " + d.to + ". How many " + d.to + " are in <b>" + d.n + " " + d.from + "</b>?",
    how: mode === "our" ? "Each jump is 1 " + one + ". Tap <b>Jump on</b> " + d.n + " times and count the " + d.to + "." : "Tap <b>Jump on</b> once for each " + one + ". Then write the number.",
    lines: [d.n + " " + d.from + " = {0} " + d.to], blanks: [{ len: 4, w: "mid" }],
    check(r) {
      const v = +r.v[0];
      if (v === end) return { ok: true };
      if (!r.hops) return { ok: false, msg: "Tap “Jump on” first. Each jump is 1 " + one + ".", parts: [false] };
      if (r.hops !== d.n) return { ok: false, msg: "You made " + r.hops + (r.hops === 1 ? " jump" : " jumps") + ". Make " + d.n + " jumps: one for each " + one + ".", parts: [false] };
      return { ok: false, msg: "Read the number under Zip. That is the number of " + d.to + ".", parts: [false] };
    },
    hint: { step: "Count on in " + k + "s, once for each " + one + ": " + seq.slice(0, 2).join(", ") + ", ..." },
    worked: { text: "Count on in " + k + "s: " + seq.join(", ") + ". So " + d.n + " " + d.from + " = " + fmt(end) + " " + d.to + "." },
    yes: d.n + " " + d.from + " = " + fmt(end) + " " + d.to + ".", key: String(end), fill: [String(end)]
  });
};
/* how long from one time to another on the same day? jumps to the next whole hour help */
function gapParts(a, b) {
  const A = mins(a), B = mins(b), up = (Math.floor(A / 60) + 1) * 60, down = Math.floor(B / 60) * 60, f = t => t24(Math.floor(t / 60), t % 60);
  if (a[1] === 0 || up > B) return { terms: [f(A), f(B)], mins: [B - A] };
  const terms = [f(A), f(up)], m = [up - A];
  if (down > up) { terms.push(f(down)); m.push(down - up); }
  if (B > Math.max(up, down)) { terms.push(f(B)); m.push(B - Math.max(up, down)); }
  return { terms: terms, mins: m };
}
const gapPic = (a, b, blank) => { const g = gapParts(a, b); return { k: "hops", terms: g.terms, labs: g.mins.map(x => (blank ? "?" : durS(x))) }; };
const gapSum = (a, b) => gapParts(a, b).mins.map(dur).join(" + ");
M.tgap = function (d, mode) {
  const g = mins(d.to) - mins(d.from), hm = d.unit === "hm", f = t => (d.h12 ? t12(t[0], t[1]) : t24(t[0], t[1]));
  return {
    q: (d.text ? d.text + " " : "") + "How long is it from <b>" + f(d.from) + "</b> to <b>" + f(d.to) + "</b>?",
    how: mode === "our" ? "Jump to the next whole hour first. Then jump on." : d.line === "blank" ? "How long is each jump? Add the jumps." : "Use jumps on a time line.",
    fig: d.line ? gapPic(d.from, d.to, d.line === "blank") : null,
    lines: [hm ? "{0} hours {1} minutes" : "{0} minutes"], blanks: hm ? [{ len: 2, w: "sm" }, { len: 2, w: "sm" }] : [{ len: 3, w: "mid" }],
    given: r => r.v.join(hm ? " h " : "") + (hm ? " min" : " min"),
    check(r) {
      const v = r.v.map(Number), got = hm ? v[0] * 60 + v[1] : v[0];
      if (got === g && (!hm || v[1] < 60)) return { ok: true, parts: hm ? [true, true] : [true] };
      if (hm && got === g) return { ok: false, msg: "60 minutes make 1 hour. Write the answer with fewer than 60 minutes.", parts: [false, false] };
      return { ok: false, msg: "Jump from " + f(d.from) + " to the next whole hour first. How many minutes is that?", parts: hm ? [v[0] === Math.floor(g / 60), v[1] === g % 60] : [false] };
    },
    hint: { pic: d.line === true ? null : gapPic(d.from, d.to), step: "Jump to the next whole hour. Then jump to the end time. Add the jumps." },
    worked: { text: gapSum(d.from, d.to) + " = " + dur(g) + ".", pic: gapPic(d.from, d.to) },
    yes: "From " + f(d.from) + " to " + f(d.to) + " is " + dur(g) + ".", key: hm ? Math.floor(g / 60) + " h " + g % 60 + " min" : g + " min", fill: hm ? [String(Math.floor(g / 60)), String(g % 60)] : [String(g)]
  };
};
/* a timetable: stops down the side, one journey in each column. All journeys take the same time. */
const ttPic = T => ({ k: "table", head: [T.kind].concat(T.runs.map((x, i) => T.kind + " " + (i + 1))).slice(0, 1).concat(T.runs.map((x, i) => String.fromCharCode(65 + i))), rows: T.stops.map((s, i) => [s].concat(T.runs.map(run => run[i]))), cap: T.cap });
const tm = s => mins(s.split(":").map(Number));
M.ttread = function (d) {
  const T = d.table, t = T.runs[d.run][d.stop], hh = +t.split(":")[0], mm = +t.split(":")[1];
  return {
    q: T.intro + " At what time does " + T.one + " <b>" + String.fromCharCode(65 + d.run) + "</b> " + (d.stop === 0 ? "leave" : "reach") + " <b>" + T.stops[d.stop] + "</b>?",
    fig: ttPic(T), lines: ["{0} : {1}"], blanks: [{ len: 2, w: "sm" }, { len: 2, w: "sm" }],
    given: r => r.v.join(":"),
    check(r) { const pt = [+r.v[0] === hh && r.v[0] !== "", +r.v[1] === mm && r.v[1] !== ""]; if (pt.every(Boolean)) return { ok: true, parts: pt }; return { ok: false, msg: "Find the row for " + T.stops[d.stop] + ". Then go across to column " + String.fromCharCode(65 + d.run) + ".", parts: pt }; },
    hint: { step: "Each row is a place. Each column is one " + T.one + ". Find where the row and the column meet." },
    worked: { text: "Row " + T.stops[d.stop] + ", column " + String.fromCharCode(65 + d.run) + ": the time is " + t + "." },
    yes: T.one.charAt(0).toUpperCase() + T.one.slice(1) + " " + String.fromCharCode(65 + d.run) + " is at " + T.stops[d.stop] + " at " + t + ".", key: t, fill: [pad(hh), pad(mm)]
  };
};
/* the two test questions about one timetable: (a) how long is a journey, in minutes; (b) the latest journey that gets there in time */
M.ttwo = function (d) {
  const T = d.table, g = tm(T.runs[0][d.to]) - tm(T.runs[0][d.from]);
  const okRuns = T.runs.filter(run => tm(run[d.at]) < tm(d.by)), best = okRuns[okRuns.length - 1], bt = best[0], bh = +bt.split(":")[0], bm = +bt.split(":")[1];
  return {
    q: T.intro + " Every " + T.one + " takes the same time.", marks: 2, fig: ttPic(T),
    lines: [LQ("<i>(a)</i> How many minutes does the journey from <b>" + T.stops[d.from] + "</b> to <b>" + T.stops[d.to] + "</b> take?"), "{0} minutes",
      LQ("<i>(b)</i> " + d.who + " must be at <b>" + T.stops[d.at] + "</b> before <b>" + d.by + "</b>. Write the time of the latest " + T.one + " " + (d.he ? "he" : "she") + " can take from <b>" + T.stops[0] + "</b>."), "{1} : {2}"],
    blanks: [{ len: 3, w: "mid" }, { len: 2, w: "sm" }, { len: 2, w: "sm" }],
    given: r => r.v[0] + " min, " + r.v[1] + ":" + r.v[2],
    check(r) {
      const a = +r.v[0] === g, b = +r.v[1] === bh && +r.v[2] === bm && r.v[1] !== "" && r.v[2] !== "", pt = [a, b, b];
      if (a && b) return { ok: true, parts: pt };
      if (!a) return { ok: false, msg: "Look at (a). Use one column: from " + T.runs[0][d.from] + " to " + T.runs[0][d.to] + ". Count on in minutes.", parts: pt };
      const typed = t24(+r.v[1], +r.v[2]), col = T.runs.findIndex(run => run[0] === typed);
      return { ok: false, msg: "Look at (b). " + (col < 0 ? "Write a time from the " + T.stops[0] + " row." : tm(T.runs[col][d.at]) >= tm(d.by) ? "That " + T.one + " reaches " + T.stops[d.at] + " at " + T.runs[col][d.at] + ". That is too late." : "That " + T.one + " is in time, but a later one is in time too."), parts: pt };
    },
    hint: { pic: gapPic(T.runs[0][d.from].split(":").map(Number), T.runs[0][d.to].split(":").map(Number)), step: "(a) Count on from " + T.runs[0][d.from] + " to " + T.runs[0][d.to] + ". (b) Look along the " + T.stops[d.at] + " row for the last time before " + d.by + "." },
    worked: { text: "(a) From " + T.runs[0][d.from] + " to " + T.runs[0][d.to] + " is " + g + " minutes. (b) In the " + T.stops[d.at] + " row, the last time before " + d.by + " is " + best[d.at] + ". That " + T.one + " leaves " + T.stops[0] + " at " + bt + "." },
    yes: "The journey takes " + g + " minutes. The latest " + T.one + " leaves at " + bt + ".", key: g + " ; " + bt, fill: [String(g), pad(bh), pad(bm)]
  };
};
/* a table of things that happen at 24-hour times; the question uses the 12-hour clock */
M.tablewhen = function (d) {
  const rows = d.rows, pic = { k: "table", head: d.head, rows: rows.map(x => [x[0], x[1]]), cap: d.cap };
  if (d.ask.k === "at") {
    const i = rows.findIndex(x => x[1] === t24(d.ask.h, d.ask.m)), opts = rows.map((x, j) => ({ html: x[0], ok: j === i, why: x[0] + " is at " + x[1] + ". That is " + words(+x[1].split(":")[0], +x[1].split(":")[1]) + "." }));
    return {
      q: d.intro + " " + d.which + " at <b class=\"wr\">" + words(d.ask.h, d.ask.m) + "</b>?", sub: "Tick (✓) one box.", fig: pic, opts: opts, marks: 1,
      check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
      hint: { step: "Change the words into a 24-hour time. " + (d.ask.h >= 13 ? "In the afternoon or evening, add 12 to the hours." : "In the morning the hours stay the same.") },
      worked: { text: cap(words(d.ask.h, d.ask.m)) + " is " + t12(d.ask.h, d.ask.m) + ". In 24-hour time that is " + t24(d.ask.h, d.ask.m) + ". The table shows " + rows[i][0] + "." },
      yes: cap(words(d.ask.h, d.ask.m)) + " is " + t24(d.ask.h, d.ask.m) + ".", key: rows[i][0]
    };
  }
  const lim = d.ask.h * 60, hit = rows.filter(x => tm(x[1]) > lim), n = hit.length;
  return {
    q: d.intro + " " + d.many + " <b>after " + t12(d.ask.h, 0).replace(":00", "") + "</b>?", fig: pic, marks: 1,
    lines: ["{0}"], blanks: [{ len: 1, w: "mid" }],
    check(r) { const v = +r.v[0]; if (v === n) return { ok: true }; return { ok: false, msg: t12(d.ask.h, 0).replace(":00", "") + " is " + t24(d.ask.h, 0) + ". Count the times in the table that are later than " + t24(d.ask.h, 0) + ".", parts: [false] }; },
    hint: { step: "Change " + t12(d.ask.h, 0).replace(":00", "") + " into a 24-hour time first. Then compare each time in the table." },
    worked: { text: t12(d.ask.h, 0).replace(":00", "") + " is " + t24(d.ask.h, 0) + ". Later than that: " + hit.map(x => x[0] + " (" + x[1] + ")").join(", ") + ". That is " + n + "." },
    yes: n + " of them are after " + t24(d.ask.h, 0) + ".", key: String(n), fill: [String(n)]
  };
};
/* a time interval that goes over midnight or over several days, in hours */
M.tacross = function (d) {
  const full = ((d.d2 - d.d1) % 7 + 7) % 7, rest = d.h2 - d.h1, hrs = full * 24 + rest,                /* Sunday to Monday is one day on */ nm = (dd, hh) => DAYS[dd] + " " + t12(hh, 0);
  const pic = rest > 0 && full > 0 ? { k: "hops", terms: [nm(d.d1, d.h1), nm(d.d2, d.h1), nm(d.d2, d.h2)].map(x => x.replace("day ", " ").replace(":00", "")), labs: [full * 24 + " h", rest + " h"] } : null;
  return {
    q: d.text.replace("{from}", "<b class=\"wr\">" + DAYS[d.d1] + " at " + t12(d.h1, 0).replace(" ", "&nbsp;") + "</b>").replace("{to}", "<b class=\"wr\">" + DAYS[d.d2] + " at " + t12(d.h2, 0).replace(" ", "&nbsp;") + "</b>"), marks: 2,
    lines: ["{0} hours"], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === hrs) return { ok: true };
      if (v === rest || v === Math.abs(rest)) return { ok: false, msg: "Remember the day changes. " + (full ? "From " + DAYS[d.d1] + " to " + DAYS[d.d2] + " is " + full + (full === 1 ? " day" : " days") + "." : ""), parts: [false] };
      return { ok: false, msg: rest >= 0 ? "1 day = 24 hours. Go to the same clock time on " + DAYS[d.d2] + " first. Then count on." : "Count to midnight first: from " + t12(d.h1, 0) + " to midnight. Then count on to " + t12(d.h2, 0) + ".", parts: [false] };
    },
    hint: { pic: pic, step: rest >= 0 ? "From " + nm(d.d1, d.h1) + " to " + nm(d.d2, d.h1) + " is " + full + (full === 1 ? " day" : " days") + ". 1 day = 24 hours." : "Count the hours to midnight. Then count the hours after midnight." },
    worked: { text: rest > 0 ? "1 day is 24 hours" + (full > 1 ? ", so " + full + " days are " + full * 24 + " hours" : "") + ". From " + t12(d.h1, 0) + " to " + t12(d.h2, 0) + " is " + rest + " more hours. " + full * 24 + " + " + rest + " = " + hrs + "."
      : rest === 0 ? "From " + DAYS[d.d1] + " to " + DAYS[d.d2] + " is " + full + " days. 1 day is 24 hours. " + full + " × 24 = " + hrs + "." : "From " + t12(d.h1, 0) + " to midnight is " + (24 - d.h1) + " hours. From midnight to " + t12(d.h2, 0) + " is " + d.h2 + " hours. " + (full > 1 ? "Add " + (full - 1) * 24 + " hours for the full day" + (full > 2 ? "s" : "") + ". " : "") + "That is " + hrs + " hours.", pic: pic },
    yes: "It is " + hrs + " hours.", key: String(hrs), fill: [String(hrs)]
  };
};
/* draw a line to match digital times to the same times in words or on a clock */
M.tmatch = function (d) {
  const L = d.items.map(x => ({ fig: { k: "dclock", t: t24(x.h, x.m) }, alt: t24(x.h, x.m) }));
  const R = d.order.map(i => { const x = d.items[i]; return x.show === "clock" ? { fig: { k: "clock", h: x.h % 12 || 12, m: x.m, secret: true }, alt: "a clock" } : { html: x.show === "12" ? t12(x.h, x.m) : cap(words(x.h, x.m)) }; });
  const ans = d.items.map((x, i) => d.order.indexOf(i));
  return {
    q: "Draw a line to match each digital time to the same time.", sub: "Tap a time on the left. Then tap its partner on the right.", marks: 1,
    ui: { k: "match", left: L, right: R }, right: { pairs: ans },
    given: r => r.pairs.map((x, i) => (i + 1) + "-" + LET[x]).join(" "),
    check(r) {
      const wrong = r.pairs.map((x, i) => (x === ans[i] ? -1 : i)).filter(i => i >= 0);
      if (!wrong.length) return { ok: true };
      const x = d.items[wrong[0]];
      return { ok: false, msg: t24(x.h, x.m) + " is " + t12(x.h, x.m) + ". " + (x.h >= 13 ? "Take away 12 from the hours." : "It is before midday."), parts: wrong };
    },
    hint: { step: "Change each 24-hour time to a 12-hour time first. After midday, take away 12 from the hours." },
    worked: { text: d.items.map(x => t24(x.h, x.m) + " is " + words(x.h, x.m)).join(". ") + "." },
    yes: d.items.map(x => t24(x.h, x.m) + " = " + t12(x.h, x.m)).join(", ") + ".", key: ans.join(",")
  };
};
})();

/* Question models for Stop 9 (chance and scales with fractions). Every answer is worked out here from the data. */
(function () {
const M = MX.M, LET = MX.LET, arrange = MX.arrange, cap = MX.cap, F = MX.F;
const FB = (i, j) => '<span class="frb">{' + i + '}<span class="frl"></span>{' + j + "}</span>";
const W4 = ["impossible", "maybe", "likely", "certain"];
const MEAN = { impossible: "it cannot happen", maybe: "it might happen or it might not", likely: "it will probably happen", certain: "it will happen for sure" };
const PART = { 2: "half", 3: "third", 4: "quarter", 5: "fifth", 10: "tenth" };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const times = n => n + (n === 1 ? " time" : " times");
const dot = c => '<span class="cdot c-' + c.toLowerCase() + '"></span>';
const COLS = ["green", "purple", "orange", "pink", "blue", "red", "yellow"];
const withDot = nm => (COLS.indexOf(nm.toLowerCase()) >= 0 ? dot(nm) : "") + nm;
const listOf = items => { const p = items.map(x => x[1] + " " + x[0] + (x[1] === 1 ? " counter" : " counters")); return p.length > 1 ? p.slice(0, -1).join(", ") + " and " + p[p.length - 1] : p[0]; };
/* how likely is it? k of the n equally likely things are the one we want */
const lik = (k, n) => (k === 0 ? "impossible" : k === n ? "certain" : k * 4 >= n * 3 ? "likely" : k * 2 === n ? "maybe" : null);
/* a reading on a scale: `at` small steps after `min`, `per` small steps for each whole number */
function reading(min, per, at) { const w = min + Math.floor(at / per), r = at % per, g = r ? gcd(r, per) : 1; return { w: w, n: r / g, d: per / g }; }
const mixed = v => (v.w || !v.n ? v.w : "") + (v.n ? (v.w ? " " : "") + F(v.n, v.d) : "");
const NW = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const mixedSay = v => (v.w || !v.n ? v.w : "") + (v.n ? (v.w ? " and " + (v.n === 1 ? "a " : NW[v.n] + " ") : NW[v.n] + " ") + PART[v.d] + (v.n === 1 ? "" : "s") : "");
const UNITS = { jug: ["litre", "litres"], kg: ["kilogram", "kilograms"] };
/* "one half of a litre", "1 litre", "1 and a half litres" */
const amount = (v, u) => (!v.w ? mixedSay(v) + " of a " + u[0] : !v.n ? v.w + " " + (v.w === 1 ? u[0] : u[1]) : mixedSay(v) + " " + u[1]);
MX.chance = { lik: lik, reading: reading, W4: W4 };

/* do the experiment, then say which colour came most or fewest times */
M.trial = function (d, mode) {
  const bag = d.kind === "bag", names = bag ? d.items.map(x => x[0]) : d.parts.filter((x, i, a) => a.indexOf(x) === i), n = d.seq.length, least = d.ask === "least";
  const cnt = names.map(nm => d.seq.filter(x => x === nm).length), best = least ? Math.min.apply(null, cnt) : Math.max.apply(null, cnt), win = names[cnt.indexOf(best)], come = bag ? "came out " : "came up ";
  const opts = names.map((nm, i) => ({ html: dot(nm) + cap(nm), ok: nm === win, why: cap(nm) + " " + come + times(cnt[i]) + ". Look for the " + (least ? "smallest" : "biggest") + " total in your table." }));
  return {
    q: (bag ? "A bag has " + listOf(d.items) + ". Pick a counter" : "Spin the spinner") + " <b>" + n + " times</b>." + (bag ? " The counter goes back each time." : "") + " Which colour " + come + "the <b>" + (least ? "fewest" : "most") + "</b> times?",
    sub: "Tick (✓) one box.", opts: opts,
    how: mode === "our" ? "Tap <b>" + (bag ? "Pick a counter" : "Spin") + "</b> " + n + " times. Watch the tally table grow." : "Do the experiment first. Then read your table.",
    ui: { k: "trial", kind: d.kind, items: d.items, parts: d.parts, names: names, seq: d.seq }, right: { done: n },
    ready: r => r.done >= n && r.pick >= 0,
    check(r) { if (r.done < n) return { ok: false, msg: "Finish the experiment first: " + n + (bag ? " picks." : " spins.") }; const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Look at the Total column of your table. Find the " + (least ? "smallest" : "biggest") + " number." },
    worked: { text: names.map((nm, i) => cap(nm) + ": " + cnt[i]).join(". ") + ". The " + (least ? "smallest" : "biggest") + " total is " + best + ". So the answer is " + win + "." },
    yes: cap(win) + " " + come + times(best) + ". That is the " + (least ? "fewest" : "most") + ".", key: win
  };
};
/* which word tells how likely it is? (bag of counters or spinner) */
M.chance = function (d) {
  const bag = d.dev.k === "bag", n = bag ? d.dev.items.reduce((a, x) => a + x[1], 0) : d.dev.parts.length, k = bag ? (d.dev.items.find(x => x[0] === d.target) || [0, 0])[1] : d.dev.parts.filter(x => x === d.target).length, ans = lik(k, n);
  const thing = bag ? "counter" : "part", things = bag ? "counters in the bag" : "parts of the spinner";
  const opts = W4.map(w => ({ html: cap(w), ok: w === ans, why: cap(w) + " means " + MEAN[w] + ". Look at the " + things + " again." }));
  const why = ans === "impossible" ? "There is no " + d.target + " " + thing + ". So it is impossible." : ans === "certain" ? "Every " + thing + " is " + d.target + ". So it is certain."
    : ans === "likely" ? k + " of the " + n + " " + thing + "s are " + d.target + ". That is most of them. So it is likely." : k + " of the " + n + " " + thing + "s are " + d.target + ". That is half of them. It might happen or it might not.";
  return {
    q: (bag ? "A bag has " + listOf(d.dev.items) + ". You pick one counter without looking. How likely is it that you pick a <b>" + d.target + "</b> counter?" : "Look at the spinner. How likely is it that it lands on <b>" + d.target + "</b>?"),
    sub: "Tick (✓) one box.", opts: opts, fig: d.dev,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Count the " + d.target + " " + thing + "s. Is it none, half, most or all of them?" },
    worked: { text: why },
    yes: ans === "maybe" ? "The best word is maybe. It might happen or it might not." : (bag ? "Picking " : "Landing on ") + d.target + " is " + ans + ".", key: ans
  };
};
/* a results table: most likely, least likely, or the total number of tries */
M.results = function (d) {
  const cnt = d.rows.map(x => x[1]), tot = cnt.reduce((a, b) => a + b, 0), fig = { k: "table", head: [d.col, "Number of times"], rows: d.rows.map(x => [withDot(x[0]), String(x[1])]) };
  if (d.ask === "total") return {
    q: d.intro + " How many " + d.unit + " were there in total?", fig: fig, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "mid" }],
    check(r) { const v = +r.v[0]; if (v === tot) return { ok: true }; return { ok: false, msg: v === Math.max.apply(null, cnt) ? "That is the biggest number. Add all the numbers in the table." : "Add all the numbers in the table: " + cnt.join(" + ") + ".", parts: [false] }; },
    hint: { step: "Every time is counted once in the table. Add the numbers." },
    worked: { text: cnt.join(" + ") + " = " + tot + ". There were " + tot + " " + d.unit + "." },
    yes: cnt.join(" + ") + " = " + tot + ".", key: String(tot), fill: [String(tot)]
  };
  const least = d.ask === "least", best = least ? Math.min.apply(null, cnt) : Math.max.apply(null, cnt), win = d.rows[cnt.indexOf(best)][0];
  const opts = d.rows.map(x => ({ html: withDot(x[0]), ok: x[0] === win, why: x[0] + " has " + x[1] + ". Look for the " + (least ? "smallest" : "biggest") + " number in the table." }));
  return {
    q: d.intro + " Which " + d.col.toLowerCase() + " is <b>" + (least ? "least" : "most") + " likely</b> " + d.end + "?", sub: "Tick (✓) one box.", fig: fig, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "What happened " + (least ? "fewest" : "most") + " times is " + (least ? "least" : "most") + " likely next time. Find the " + (least ? "smallest" : "biggest") + " number." },
    worked: { text: "The " + (least ? "smallest" : "biggest") + " number in the table is " + best + ". It belongs to " + win + ". So " + win + " is " + (least ? "least" : "most") + " likely." },
    yes: win + " has the " + (least ? "smallest" : "biggest") + " number, " + best + ".", key: win
  };
};
/* count the results and fill in the table */
M.tallyfill = function (d) {
  const cnt = d.names.map(nm => d.seq.filter(x => x === nm).length);
  return {
    q: d.intro + " Count each colour. Complete the table.", fig: { k: "strip", seq: d.seq, dev: d.dev },
    lines: d.names.map((nm, i) => dot(nm) + cap(nm) + ": {" + i + "}"), blanks: d.names.map(() => ({ len: 2, w: "sm" })),
    check(r) { const pt = d.names.map((nm, i) => r.v[i] !== "" && +r.v[i] === cnt[i]); if (pt.every(Boolean)) return { ok: true, parts: pt }; return { ok: false, msg: "Count the " + d.names[pt.indexOf(false)] + " ones again. Point at each one as you count.", parts: pt }; },
    hint: { step: "Count one colour at a time. The totals must add up to " + d.seq.length + "." },
    worked: { text: d.names.map((nm, i) => cap(nm) + ": " + cnt[i]).join(". ") + ". Check: " + cnt.join(" + ") + " = " + d.seq.length + "." },
    yes: d.names.map((nm, i) => cap(nm) + " " + cnt[i]).join(", ") + ".", key: cnt.join(" ; "), fill: cnt.map(String)
  };
};
/* draw a line from each sentence to the best chance word */
M.ematch = function (d) {
  const ans = d.items.map(x => d.order.indexOf(x.w));
  return {
    q: "Draw a line from each sentence to the best word.", sub: "Tap a sentence. Then tap its word.", marks: 1,
    ui: { k: "match", wide: true, left: d.items.map(x => ({ html: x.t })), right: d.order.map(w => ({ html: cap(w) })) }, right: { pairs: ans },
    given: r => r.pairs.map((x, i) => (i + 1) + "-" + (d.order[x] || "?")).join(" "),
    check(r) {
      const wrong = r.pairs.map((x, i) => (x === ans[i] ? -1 : i)).filter(i => i >= 0);
      if (!wrong.length) return { ok: true };
      return { ok: false, msg: "Look again at this one: " + d.items[wrong[0]].t + " Can it happen? Does it always happen?", parts: wrong };
    },
    hint: { step: "Certain: it always happens. Impossible: it never happens. Likely: it happens most times. Maybe: it might or might not." },
    worked: { text: d.items.map(x => x.t.replace(/\.$/, "") + ": " + x.w + ".").join(" ") },
    yes: "Certain, likely, maybe, impossible: all matched.", key: ans.join(",")
  };
};
/* pour water into the jug up to a mark */
M.jugset = function (d, mode) {
  const v = reading(0, d.per, d.tick), say = l => (l === 0 ? "no water" : amount(reading(0, d.per, l), UNITS.jug));
  return {
    q: "Pour water into the jug until it shows <b>" + mixed(v) + "</b> " + (d.tick < d.per ? "of a litre" : d.tick === d.per ? "litre" : "litres") + ".",
    how: mode === "our" ? "Each small step is one " + PART[d.per] + " of a litre. Tap <b>Pour in</b> and watch the water." : "Tap <b>Pour in</b>. Read the scale each time.",
    ui: { k: "jug", max: d.max, per: d.per, level: 0 }, right: { level: d.tick },
    check(r) { if (r.level === d.tick) return { ok: true }; return { ok: false, msg: "The jug shows " + say(r.level) + " now. " + (r.level < d.tick ? "Pour in more." : "Pour some out."), parts: [] }; },
    hint: { step: "Each small step is one " + PART[d.per] + " of a litre. " + (v.w ? "Go to " + v.w + " first. Then go up " + (d.tick % d.per) + (d.tick % d.per === 1 ? " small step." : " small steps.") : "Go up " + d.tick + (d.tick === 1 ? " small step." : " small steps.")) },
    worked: { text: "From one number to the next there are " + d.per + " small steps. So each step is one " + PART[d.per] + " of a litre. Count " + d.tick + (d.tick === 1 ? " small step" : " small steps") + " up from the bottom.", pic: { k: "jug", max: d.max, per: d.per, level: d.tick } },
    yes: "The jug shows " + say(d.tick) + ".", key: v.w + " " + v.n + "/" + v.d
  };
};
/* read a scale: a jug or a straight scale with an arrow. Tick the reading or write it. */
M.scaleread = function (d, mode) {
  const jug = d.dev === "jug", min = d.min || 0, v = reading(min, d.per, d.tick), r0 = d.tick % d.per, u = UNITS[jug ? "jug" : "kg"], oUnit = x => (jug ? (x.w > 1 || (x.w === 1 && x.n) ? "litres" : "litre") : "kg");
  const fig = jug ? { k: "jug", max: d.max, per: d.per, level: d.tick } : { k: "scale", min: min, max: d.max, per: d.per, at: d.tick, cap: "kilograms (kg)" };
  const q = jug ? "How much water is in the jug?" : "The arrow shows the mass of a parcel. What is the mass?";
  const steps = "From " + v.w + " to " + (v.w + 1) + " there are " + d.per + " small steps. So each step is one " + PART[d.per] + ".";
  const worked = { text: steps + " The " + (jug ? "water" : "arrow") + " is " + r0 + (r0 === 1 ? " step" : " steps") + " after " + v.w + ". So it shows " + amount(v, u) + "." };
  const yes = "It shows " + amount(v, u) + ".";
  if (d.as === "write") return {
    q: q, fig: fig, how: mode === "our" ? "First find how much one small step is. Then count the steps after " + v.w + "." : "",
    lines: ["{0} " + FB(1, 2) + " " + (jug ? "litres" : "kg")], blanks: [{ len: 2, w: "sm" }, { len: 2, w: "fr" }, { len: 2, w: "fr" }],
    given: r => r.v[0] + " " + r.v[1] + "/" + r.v[2],
    check(r) {
      const w = +r.v[0], a = +r.v[1], b = +r.v[2], okW = r.v[0] !== "" && w === v.w, okF = b > 0 && a * v.d === v.n * b, pt = [okW, okF, okF];
      if (okW && okF) return { ok: true, parts: pt };
      if (!okW) return { ok: false, msg: "Which number has the " + (jug ? "water" : "arrow") + " just passed? That is the whole number.", parts: pt };
      return { ok: false, msg: "Count the small steps from " + v.w + " to " + (v.w + 1) + ". That is the bottom number of the fraction.", parts: pt };
    },
    hint: { step: steps }, worked: worked, yes: yes, key: v.w + " " + v.n + "/" + v.d, fill: [String(v.w), String(v.n), String(v.d)]
  };
  const alt = [{ w: v.w + r0, n: 0, d: 1, why: "The small steps are not whole numbers. Count the steps from " + v.w + " to " + (v.w + 1) + "." }, { w: v.w, n: 1, d: v.d === 2 ? 4 : 2, why: "Count the small steps from " + v.w + " to " + (v.w + 1) + ". There are " + d.per + "." },
    { w: v.w + 1, n: v.n, d: v.d, why: "The " + (jug ? "water" : "arrow") + " has not reached " + (v.w + 1) + " yet." }].filter(x => !(x.w === v.w && x.n * v.d === v.n * x.d)).slice(0, 2);
  const opts = arrange([{ html: mixed(v) + " " + oUnit(v), ok: true }].concat(alt.map(x => ({ html: mixed(x) + " " + oUnit(x), ok: false, why: x.why }))), d.at);
  return {
    q: q, sub: "Tick (✓) one box.", fig: fig, opts: opts, letters: true,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: steps }, worked: worked, yes: yes, key: LET[opts.findIndex(o => o.ok)] + ": " + v.w + " " + v.n + "/" + v.d
  };
};
/* how much is one small step of the scale? */
M.scalestep = function (d) {
  const jug = d.dev === "jug", u = UNITS[jug ? "jug" : "kg"][0];
  const opts = arrange([{ html: F(1, d.per) + " " + u, ok: true }, { html: F(1, d.per + 1) + " " + u, ok: false, why: "Count the gaps from 0 to 1, not the marks. There are " + d.per + " gaps." }, { html: "1 " + u, ok: false, why: "The numbers go up in 1s. A small step is only a part of 1." }], d.at);
  return {
    q: "Look at the scale. How much is <b>one small step</b>?", sub: "Tick (✓) one box.", opts: opts,
    fig: jug ? { k: "jug", max: d.max, per: d.per, level: 0 } : { k: "scale", min: 0, max: d.max, per: d.per, at: null, cap: "kilograms (kg)" },
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Count the small steps from 0 to 1. The whole is shared into that many equal parts." },
    worked: { text: "From 0 to 1 there are " + d.per + " equal steps. So one step is one " + PART[d.per] + " of a " + u + "." },
    yes: "One small step is one " + PART[d.per] + " of a " + u + ".", key: "1/" + d.per
  };
};
})();

/* Question models added in v3 (Session 7, Stop 3: compare, order and round), in the same shape as the Maths v2 models
   (06-mtasks*.js, which stay unchanged). Every answer is worked out here from the data.

   roundpick   "Which number rounds to 4,000, to the nearest 1,000?" Tick one of 3 or 4 numbers.
               d = { target, to, opts: [the right number first, then the others], at: where the right one sits } */
(function () {
"use strict";
const M = MX.M, fmt = MX.fmt, arrange = MX.arrange, LET = MX.LET;
const rnd = (n, to) => Math.floor(n / to + 0.5) * to;
const LOOK = { 10: "ones", 100: "tens", 1000: "hundreds", 10000: "thousands", 100000: "ten thousands" };

M.roundpick = function (d) {
  const lo = d.target - d.to / 2, hi = d.target + d.to / 2 - 1;
  const opts = arrange(d.opts.map(v => {
    const r = rnd(v, d.to), half = v % d.to === d.to / 2;
    return { html: fmt(v), ok: r === d.target, v: v,
      why: half ? fmt(v) + " is exactly halfway, so it rounds up to " + fmt(r) + "." : fmt(v) + " rounds to " + fmt(r) + ", not " + fmt(d.target) + ". Look at the " + LOOK[d.to] + " digit." };
  }), d.at);
  const ok = opts.find(o => o.ok);
  return {
    q: "Which number [[rounds|round]] to <b>" + fmt(d.target) + "</b>, to the [[nearest]] <b>" + fmt(d.to) + "</b>?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "rline", n: lo, to: d.to }, step: "Round each number to the nearest " + fmt(d.to) + ". Look at the " + LOOK[d.to] + " digit. Halfway numbers round up." },
    worked: { text: opts.map(o => fmt(o.v) + " rounds to " + fmt(rnd(o.v, d.to))).join(". ") + ". Every whole number from " + fmt(lo) + " to " + fmt(hi) + " rounds to " + fmt(d.target) + "." },
    yes: fmt(ok.v) + " rounds to " + fmt(d.target) + ".",
    key: LET[opts.indexOf(ok)] + ": " + fmt(ok.v)
  };
};
})();

/* Question models added in v3 for Stop 4 (Session 8, add and subtract), in the same shape as the Maths v2 models
   (06-mtasks*.js, which stay unchanged). Every answer is worked out here from the data.

   colfix   Spot the mistake: a child's written calculation in columns has one mistake. (a) Tick the mistake (one of 3),
            (b) write the correct answer. Two parts, 1 mark each (task.ab: the paper marks them apart, 71-test-paper.js).
            d = { who, he: true for "he", a, b, op: '+' | '-', slip, at: where the right reason sits }
            slip  'carry'  (+) the regrouped 1 was not added in the next column
                  'flip'   (-) in a column with a smaller top digit, the top digit was taken from the bottom digit
                  'used'   (-) a column was regrouped, but the 1 was not taken from the next column */
(function () {
"use strict";
const M = MX.M, fmt = MX.fmt, arrange = MX.arrange, digits = MX.digits, cap = MX.cap;
const OPS = { "+": "+", "-": "−" };
const sumText = (a, op, b) => fmt(a) + " " + OPS[op] + " " + fmt(b);

/* the answer written with the slip: every column worked from the ones, the way the child did it */
function slipped(a, op, b, slip) {
  const n = Math.max(String(a).length, String(b).length), A = digits(a, n).reverse(), B = digits(b, n).reverse(), out = [];
  let c = 0;
  for (let i = 0; i < n; i++) {
    if (op === "+") { const s = A[i] + B[i] + (slip === "carry" ? 0 : c); out.push(i === n - 1 ? s : s % 10); c = s >= 10 ? 1 : 0; }
    else if (slip === "flip") out.push(Math.abs(A[i] - B[i]));
    else { const top = A[i] - (slip === "used" ? 0 : c); if (top < B[i]) { out.push(top + 10 - B[i]); c = 1; } else { out.push(top - B[i]); c = 0; } }
  }
  return +out.reverse().join("");
}
MX.slipped = slipped;

const SAY = {
  carry: s => s.He + " did not add the 1 that " + s.he + " regrouped.",
  flip: s => "In one column, " + s.he + " took the top digit away from the bottom digit.",
  used: s => s.He + " regrouped, but did not take the 1 from the next column."
};
const WORK = {
  carry: s => s.He + " forgot to add the 1 that " + s.he + " regrouped into the next column.",
  flip: s => s.He + " took the smaller digit from the bigger digit. " + s.He + " should regroup first.",
  used: s => s.He + " regrouped, but did not take the 1 away from the next column."
};

M.colfix = function (d) {
  const s = { he: d.he ? "he" : "she", He: d.he ? "He" : "She", his: d.he ? "his" : "her" };
  const ans = d.op === "+" ? d.a + d.b : d.a - d.b, wrong = slipped(d.a, d.op, d.b, d.slip), w = MX.colwork(d.a, d.op, d.b);
  const reasons = [{ t: SAY[d.slip](s), ok: true }].concat(d.op === "+" ? [
    { t: s.He + " took away instead of adding.", why: "Look at " + s.his + " answer. It is bigger than both numbers, so " + s.he + " did add." },
    { t: s.He + " did not put the ones under the ones.", why: "Look again. Every digit is in the right column." }] : [
    { t: s.He + " added instead of taking away.", why: "Look at " + s.his + " answer. It is less than " + fmt(d.a) + ", so " + s.he + " did take away." },
    { t: s.He + " did not put the ones under the ones.", why: "Look again. Every digit is in the right column." }]);
  const opts = arrange(reasons.map(x => ({ html: x.t, ok: !!x.ok, why: x.why || "" })), d.at);
  return {
    q: d.who + " worked out <b>" + sumText(d.a, d.op, d.b) + "</b> in columns. " + cap(s.his) + " answer is wrong.", marks: 2, ab: true,
    fig: { k: "col", a: d.a, b: d.b, op: d.op, ans: wrong },
    sub: "What was " + s.his + " mistake? Tick (✓) one box.", letters: true, opts: opts,
    abAsk: "Write the correct answer.",
    lines: [sumText(d.a, d.op, d.b) + " = {0}"], blanks: [{ len: 4, w: "big" }],
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const o = opts[r.pick], pickOk = !!(o && o.ok), v = +((r.v || [])[0]), vOk = v === ans;
      if (pickOk && vOk) return { ok: true, parts: [true], pickOk: true };
      const msg = !pickOk ? (o && o.why ? o.why : "Read the three boxes again.") + (vOk ? "" : " Then work it out in columns.") :
        v === wrong ? "That is " + d.who + "'s answer. Work it out again in columns. Start with the ones." :
        "The mistake is right. Now work it out in columns. Start with the ones. Regroup when you need to.";
      return { ok: false, msg: msg, parts: [vOk], pickOk: pickOk };
    },
    hint: { pic: { k: "col", a: d.a, b: d.b, op: d.op }, step: "Work it out yourself in columns. Then find the first column where " + s.his + " digit is different." },
    worked: { text: w.steps.join(" ") + " So " + sumText(d.a, d.op, d.b) + " = " + fmt(ans) + ". " + d.who + " wrote " + fmt(wrong) + ". " + WORK[d.slip](s),
      pic: { k: "col", a: d.a, b: d.b, op: d.op, ans: ans, marks: w.marks } },
    yes: sumText(d.a, d.op, d.b) + " = " + fmt(ans) + ".", key: String(ans), fill: [String(ans)]
  };
};
})();

/* Question models added in v3 for Stop 5 (Session 9, times tables, multiples and factors), in the same shape as the Maths v2
   models (06-mtasks*.js, which stay unchanged). Every answer is worked out here from the data.

   multstory   A short story in two steps: equal groups, then some more (or some fewer). One answer line with the unit
               printed after it. d = { text, n (groups), k (in each group), extra (more: +, fewer: -), unit }
               The answer is n × k + extra. The likely slips get their own feedback: stopping after n × k, adding instead
               of multiplying.
   mulbox      A box on one side, a times table fact on the other: 4 × [] = 3 × 8. d = { left: [4, null], right: [3, 8] }
               (null is the box). Work out the side with no box, then the missing factor. The hint lights that times
               table on the multiplication square. */
(function () {
"use strict";
const M = MX.M, X = "×";

M.multstory = function (d) {
  const p = d.n * d.k, ans = p + d.extra, more = d.extra >= 0, e = Math.abs(d.extra);
  const then = more ? p + " + " + e : p + " − " + e;
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (v === p) return { ok: false, msg: d.n + " " + X + " " + d.k + " = " + p + " is right. Now do the second step: " + (more ? "add " : "take away ") + e + ".", parts: [false] };
      if (v === d.n + d.k + d.extra || v === d.n + d.k) return { ok: false, msg: "Do not add " + d.n + " and " + d.k + ". There are " + d.n + " groups of " + d.k + ", so multiply first.", parts: [false] };
      return { ok: false, msg: "First work out " + d.n + " " + X + " " + d.k + ". Then " + (more ? "add " : "take away ") + e + ".", parts: [false] };
    },
    hint: { pic: { k: "dots", r: d.n, c: d.k }, step: "There are two steps. First work out " + d.n + " " + X + " " + d.k + ". Then " + (more ? "add " : "take away ") + e + "." },
    worked: { text: d.n + " groups of " + d.k + ": " + d.n + " " + X + " " + d.k + " = " + p + ". Then " + then + " = " + ans + "." },
    yes: d.n + " " + X + " " + d.k + " = " + p + " and " + then + " = " + ans + ".", key: String(ans), fill: [String(ans)]
  };
};
M.mulbox = function (d) {
  const L = d.left, R = d.right, tot = R[0] * R[1], i = L.indexOf(null), known = L[1 - i], ans = tot / known;
  const side = R[0] + " " + X + " " + R[1];
  return {
    q: "Write the missing number in the box.",
    lines: [L.map(x => (x == null ? "{0}" : x)).join(" " + X + " ") + " = " + side], blanks: [{ len: 2, w: "box" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (v === tot) return { ok: false, msg: side + " = " + tot + ". Now ask: " + known + " times which number makes " + tot + "?", parts: [false] };
      return { ok: false, msg: "Try your number: " + known + " " + X + " " + v + " = " + known * v + ", but " + side + " = " + tot + ". Both sides must be equal.", parts: [false] };
    },
    hint: { pic: { k: "msq", row: known, hl: tot }, step: "First work out the side with no box: " + side + " = " + tot + ". Then count in " + known + "s to " + tot + "." },
    worked: { text: side + " = " + tot + ". " + known + " " + X + " " + ans + " = " + tot + ". So the box is " + ans + "." },
    yes: L.map(x => (x == null ? ans : x)).join(" " + X + " ") + " = " + side + " = " + tot + ".", key: String(ans), fill: [String(ans)]
  };
};
})();

/* Question models added in v3 for Stop 6 (Session 10, multiply and divide), in the same shape as the Maths v2 models
   (06-mtasks*.js, which stay unchanged). Every answer is worked out here from the data.

   mdbox      Missing numbers in boxes: work backwards with the opposite operation. One line per item, 1 mark each.
              d = { items: [[a, op, b, c], ...] }: a op b = c with a or b null (the box); op 'x' or 'd'.
              [null, 'd', 3, 24] is [] ÷ 3 = 24 (the box is 24 × 3); [5, 'x', null, 85] is 5 × [] = 85 (the box is 85 ÷ 5).
   bigstory   A short story in two steps: a 2-digit or 3-digit number of things in each group, times a 1-digit number of
              groups, then some more (or some fewer). One answer line with the unit printed after it.
              d = { text, n (in each group), k (groups), extra (more: +, fewer: -), unit }. The answer is n × k + extra.
              The likely slips get their own feedback: stopping after n × k, adding instead of multiplying.
   mulderive  Use a fact you know to work out a new one: double it, or one group more or fewer.
              d = { who, know: [a, n] (a × n is known), ask: b (2a, a + 1 or a - 1) }. The answer is b × n. */
(function () {
"use strict";
const M = MX.M, fmt = MX.fmt, X = "×", D = "÷";
const sym = op => (op === "x" ? X : D);

M.mdbox = function (d) {
  const it = d.items;
  // the box of each item, worked out with the opposite operation
  const ans = it.map(f => (f[1] === "d" ? (f[0] == null ? f[3] * f[2] : f[0] / f[3]) : (f[0] == null ? f[3] / f[2] : f[3] / f[0])));
  const back = (f, i) => {
    if (f[1] === "d" && f[0] == null) return "□ " + D + " " + f[2] + " = " + f[3] + ", so □ = " + f[3] + " " + X + " " + f[2] + " = " + fmt(ans[i]);
    if (f[1] === "d") return f[0] + " " + D + " □ = " + f[3] + ", so □ = " + f[0] + " " + D + " " + f[3] + " = " + ans[i];
    const known = f[0] == null ? f[2] : f[0];
    return (f[0] == null ? "□ " + X + " " + f[2] : f[0] + " " + X + " □") + " = " + f[3] + ", so □ = " + f[3] + " " + D + " " + known + " = " + ans[i];
  };
  const line = f => [f[0] == null ? null : fmt(f[0]), sym(f[1]), f[2] == null ? null : fmt(f[2])];
  return {
    q: "Write the missing number in each box.", marks: it.length,
    lines: it.map((f, i) => { const l = line(f); return (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + (l[0] == null ? "{" + i + "}" : l[0]) + " " + l[1] + " " + (l[2] == null ? "{" + i + "}" : l[2]) + " = " + fmt(f[3]); }),
    blanks: it.map(() => ({ len: 3, w: "box" })),
    check(r) {
      const pt = it.map((f, i) => r.v[i] !== "" && +r.v[i] === ans[i]);
      if (pt.every(Boolean)) return { ok: true, parts: pt };
      const i = pt.indexOf(false), f = it[i], v = +r.v[i], pre = it.length > 1 ? "Look at (" + "abc"[i] + "). " : "";
      if (f[1] === "d" && f[0] == null) return { ok: false, msg: pre + (v === f[3] / f[2] || v === f[3] - f[2] ? "The box is the number you share. Work backwards: multiply " + f[3] + " by " + f[2] + "." : "Check: " + v + " " + D + " " + f[2] + " must make " + f[3] + ". Work out " + f[3] + " " + X + " " + f[2] + "."), parts: pt };
      const known = f[0] == null ? f[2] : f[0];
      return { ok: false, msg: pre + (v === f[3] * known ? "That is too big. " : "") + "Which number times " + known + " makes " + f[3] + "? Divide " + f[3] + " by " + known + ".", parts: pt };
    },
    hint: { pic: it[0][1] === "d" && it[0][0] == null ? { k: "gridm", n: it[0][3], m: it[0][2] } : null,
      step: "Use the opposite operation. Multiplying undoes dividing, and dividing undoes multiplying." },
    worked: { text: it.map((f, i) => (it.length > 1 ? "(" + "abc"[i] + ") " : "") + back(f, i)).join(". ") + "." },
    yes: it.map((f, i) => { const l = line(f); return (l[0] == null ? fmt(ans[i]) : l[0]) + " " + l[1] + " " + (l[2] == null ? fmt(ans[i]) : l[2]) + " = " + fmt(f[3]); }).join(" and ") + ".",
    key: ans.map(fmt).join(" ; "), fill: ans.map(String)
  };
};

M.bigstory = function (d) {
  const p = d.n * d.k, ans = p + d.extra, more = d.extra >= 0, e = Math.abs(d.extra);
  const first = d.k + " " + X + " " + fmt(d.n) + " = " + fmt(p), then = more ? fmt(p) + " + " + e : fmt(p) + " − " + e;
  return {
    q: d.text, lines: ["{0} " + d.unit], blanks: [{ len: 4, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (v === p) return { ok: false, msg: first + " is right. Now do the second step: " + (more ? "add " : "take away ") + e + ".", parts: [false] };
      if (v === d.n + d.k + d.extra || v === d.n + d.k) return { ok: false, msg: "Do not add " + fmt(d.n) + " and " + d.k + ". There are " + d.k + " groups of " + fmt(d.n) + ", so multiply first.", parts: [false] };
      return { ok: false, msg: "First work out " + d.k + " " + X + " " + fmt(d.n) + ". Then " + (more ? "add " : "take away ") + e + ".", parts: [false] };
    },
    hint: { pic: { k: "gridm", n: d.n, m: d.k }, step: "There are two steps. First work out " + d.k + " " + X + " " + fmt(d.n) + ". Then " + (more ? "add " : "take away ") + e + "." },
    worked: { text: d.k + " groups of " + fmt(d.n) + ": " + first + ". Then " + then + " = " + fmt(ans) + "." },
    yes: first + " and " + then + " = " + fmt(ans) + ".", key: String(ans), fill: [String(ans)]
  };
};

M.mulderive = function (d) {
  const a = d.know[0], n = d.know[1], b = d.ask, p = a * n, ans = b * n;
  const rel = b === 2 * a ? b + " is double " + a + ", so " + b + " " + X + " " + fmt(n) + " is double " + fmt(p) + ": " + fmt(p) + " + " + fmt(p) + " = " + fmt(ans)
    : b === a + 1 ? b + " " + X + " " + fmt(n) + " is one more " + fmt(n) + " than " + a + " " + X + " " + fmt(n) + ": " + fmt(p) + " + " + fmt(n) + " = " + fmt(ans)
    : b + " " + X + " " + fmt(n) + " is one " + fmt(n) + " fewer than " + a + " " + X + " " + fmt(n) + ": " + fmt(p) + " − " + fmt(n) + " = " + fmt(ans);
  return {
    q: d.who + " knows that <b>" + a + " " + X + " " + fmt(n) + " = " + fmt(p) + "</b>. Use this fact to work out <b>" + b + " " + X + " " + fmt(n) + "</b>.",
    lines: [b + " " + X + " " + fmt(n) + " = {0}"], blanks: [{ len: 5, w: "big" }],
    check(r) {
      const v = +r.v[0];
      if (v === ans) return { ok: true };
      if (v === p + (b - a) || v === p - (a - b)) return { ok: false, msg: "You changed " + fmt(p) + " by " + Math.abs(b - a) + ". But " + b + " " + X + " " + fmt(n) + " changes by whole groups of " + fmt(n) + ".", parts: [false] };
      return { ok: false, msg: "Use the fact. How is " + b + " linked to " + a + "?", parts: [false] };
    },
    hint: { step: "Compare " + b + " with " + a + ". Is it double, one more or one fewer?" },
    worked: { text: rel + "." },
    yes: rel + ".", key: String(ans), fill: [String(ans)]
  };
};
})();

