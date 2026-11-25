/* 08-g5-models-s1.js - Grade 5 question models for Stop 1: decimal place value (6Np.01) and multiplying and dividing
   whole numbers and decimals by 10, 100 and 1000 (6Np.02). Every answer is worked out here from the numbers in the
   data. Numbers are given as text ('35.724') and kept exact as thousandths (MX.D, 07-g5-models-base.js).

   dvalue    { n: '35.724', d: 2, p?: 'hu' }                 tick the value of a digit (with the chart)
   dvaluew   { n, d, p? }                                    write the value of a digit
   dfracval  { n, d, p? }                                    the value of a decimal digit as a fraction (tick)
   dmake     { parts: [['o', 6], ['ths', 9], ['hu', 4]], cells?: true }   write the decimal from its places (given in
                                                             any order); cells: in the boxes of the chart
   dclue     { whole: 2, te: 4, hu: 0, ths: 7 }               clues about each decimal place: write the number
   dexp      { n: '6.305', miss?: 'ths' }                     expanded form: one part is missing, or (no miss) write the number
   dslide    { n: '3.75', op: 'x' | 'd', by: 10 | 100 | 1000 }   on the decimal slider, then write the answer
   dcalc     { items: [{ n, op, by }, ...] }                  "Calculate." with one line for each part
   dmissing  { items: [{ a, op, by, hide: 'a' | 'by' }] }     a missing number in a x or / by 10, 100, 1000
   dsame     { n, op, by, opts: [{ n, op, by } x 3], at }     which calculation has the same answer? (opts[0] must match)
   dchain    { start: '0.48', ops: [['x', 100], ['d', 10]], give: 0 }   a chain of boxes (the v2 chain, with decimals)
   dscale    { text, n, op, by, unit, plus?, plusSay? }       a real-life problem: x or / by 10, 100 or 1000; with plus
                                                             ('12'), a second step: add it (plusSay: "Add the box.") */
(function () {
"use strict";
const M = MX.M, D = MX.D, PL = D.PL, PLK = D.PLK, fmt = MX.fmt, arrange = MX.arrange, cap = MX.cap, F = MX.F;
const SYM = { x: "×", d: "÷" }, OPP = { x: "d", d: "x" };
const K = by => (by === 10 ? 1 : by === 100 ? 2 : 3);
const pl = k => (k === 1 ? "1 place" : k + " places");
const calc = (n, op, by) => (op === "x" ? D.p(n) * by : D.p(n) / by);            /* thousandths; exact when the data is sound */
const show = t => D.s(t);
const an = d => (d === 8 ? "An " : "A ");

/* the place of digit d in n: the place given, else the first place (from the left) that holds d */
function placeOf(n, d, p) {
  if (p) return PL[PLK[p]];
  const t = D.p(n);
  return PL.find(x => D.digit(t, x.k) === d && (x.v <= 1000 || t >= x.v));
}
const asFrac = (d, p) => (p.fr ? F(d, fmt(p.fr)) : String(d * p.v / 1000));
const rule = (op, by) => SYM[op] + " " + fmt(by) + ": move every digit " + pl(K(by)) + " to the " + (op === "x" ? "left" : "right") + ".";

/* a zero that appears in the answer: it holds an empty place (7.4 x 100 = 740, 8 / 100 = 0.08) */
function zeroNote(n, ans) {
  const zeros = s => (String(s).replace(/,/g, "").replace(/^0\./, ".").match(/0/g) || []).length;
  const more = zeros(show(ans)) - zeros(n);
  return more > 1 ? "Zeros hold the empty places. " : more === 1 ? "A zero holds the empty place. " : "";
}

/* what went wrong in n x by or n / by */
function slip(n, op, by, typed) {
  const t = D.p(n), ans = calc(n, op, by), v = D.p(typed), k = K(by), dir = op === "x" ? "left" : "right";
  if (isNaN(v)) return "Write a number.";
  if (v === t) return "The number must change. Move every digit " + pl(k) + " to the " + dir + ".";
  if (op === "x" && v === t + by * 1000) return "× " + fmt(by) + " is not + " + fmt(by) + ". Move every digit " + pl(k) + " to the left.";
  if (op === "d" && v === t - by * 1000) return "÷ " + fmt(by) + " is not − " + fmt(by) + ". Move every digit " + pl(k) + " to the right.";
  if (op === "x" && v * by === t) return "That is dividing. Multiplying by " + fmt(by) + " makes the number bigger.";
  if (op === "d" && v === t * by) return "That is multiplying. Dividing by " + fmt(by) + " makes the number smaller.";
  /* "just add a zero": 2.5 x 10 written as 2.50, 0.6 x 100 as 0.600 */
  if (op === "x" && String(typed).replace(/0+$/, "").replace(/\.$/, "") === String(n).replace(/0+$/, "").replace(/\.$/, "")) return "Writing zeros at the end of a decimal does not change it. Move the digits " + pl(k) + " to the left.";
  for (const b of [10, 100, 1000]) if (b !== by && v === (op === "x" ? t * b : t / b)) return "That is " + pl(K(b)) + ". " + SYM[op] + " " + fmt(by) + " moves the digits " + pl(k) + ".";
  return rule(op, by);
}

/* ---------- the value of a digit ---------- */
M.dvalue = function (d, mode) {
  const n = d.n, p = placeOf(n, d.d, d.p), i = PLK[p.k], val = D.val(d.d, p.k);
  let cand = [i - 1, i, i + 1, i + 2].filter(j => j >= 0 && j < PL.length);
  if (cand.length > 4) cand = cand.slice(0, 4);
  if (cand.length < 3) cand = [i - 2, i - 1, i].filter(j => j >= 0);
  const opts = cand.map(j => ({ html: D.val(d.d, PL[j].k), ok: j === i, why: j === i ? "" : an(d.d) + d.d + " in the " + PL[j].many + " place is worth " + D.val(d.d, PL[j].k) + "." }));
  return {
    q: "What is the [[value]] of the [[digit]] <b>" + d.d + "</b> in <b>" + n + "</b>?",
    how: mode === "our" ? "Find the " + d.d + " in the chart. Which place is it in?" : "Use the chart. Then tick (✓) one box.", sub: "Tick (✓) one box.",
    ui: { k: "dchart", n: n, hl: mode === "our" ? p.k : "" }, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Look at the chart again." }; },
    hint: { reveal: mode === "our" ? "" : "hl:" + p.k, step: "The " + d.d + " is in the " + p.many + " place." },
    worked: { text: "The " + d.d + " is in the " + p.many + " place. Its value is " + val + (p.fr ? " (" + d.d + " " + (d.d === 1 ? p.one : p.many) + ")" : "") + ".", pic: { k: "dchart", n: n, hl: p.k, vals: true } },
    yes: "The " + d.d + " is in the " + p.many + " place, so it is worth " + val + ".",
    key: val
  };
};

M.dvaluew = function (d) {
  const n = d.n, p = placeOf(n, d.d, d.p), i = PLK[p.k], val = D.val(d.d, p.k), want = d.d * p.v;
  return {
    q: "Write the value of the digit <b>" + d.d + "</b> in <b>" + n + "</b>.",
    lines: ["{0}"], blanks: [{ len: 6, w: "big", dec: 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (v === want) return { ok: true };
      if (v === d.d * 1000 && p.k !== "o") return { ok: false, msg: d.d + " is the digit. What is it worth in the " + p.many + " place?", parts: [false] };
      if (v === D.p(n)) return { ok: false, msg: "That is the whole number. Write what the " + d.d + " is worth.", parts: [false] };
      const near = PL.find(x => d.d * x.v === v);
      if (near) return { ok: false, msg: "That is " + an(d.d).toLowerCase() + d.d + " in the " + near.many + " place. Look where the " + d.d + " is in " + n + ".", parts: [false] };
      return { ok: false, msg: "Which place is the " + d.d + " in? Count from the decimal point.", parts: [false] };
    },
    hint: { pic: { k: "dchart", n: n }, step: "The " + d.d + " is in the " + p.many + " place." },
    worked: { text: "The " + d.d + " is in the " + p.many + " place. Its value is " + val + ".", pic: { k: "dchart", n: n, hl: p.k, vals: true } },
    yes: "The " + d.d + " is in the " + p.many + " place, so it is worth " + val + ".",
    key: val, fill: [val.replace(/,/g, "")]
  };
};

M.dfracval = function (d) {
  const n = d.n, p = placeOf(n, d.d, d.p);
  const opts = arrange([p].concat(PL.filter(x => x.fr && x.k !== p.k)).map((x, j) => ({ html: F(d.d, fmt(x.fr)), alt: d.d + " over " + fmt(x.fr), ok: j === 0,
    why: j === 0 ? "" : F(d.d, fmt(x.fr)) + " is " + d.d + " " + x.many + ". That is the " + x.many + " place." })), d.at);
  return {
    q: "In <b>" + n + "</b>, the digit <b>" + d.d + "</b> is worth:", sub: "Tick (✓) one box.",
    opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Where is the " + d.d + " in " + n + "?" }; },
    hint: { pic: { k: "dchart", n: n }, step: "Tenths are parts out of 10. Hundredths are parts out of 100. Thousandths are parts out of 1,000." },
    worked: { text: "The " + d.d + " is in the " + p.many + " place. " + D.val(d.d, p.k) + " is " + d.d + " " + p.many + ": " + d.d + " out of " + fmt(p.fr) + ".", pic: { k: "dchart", n: n, hl: p.k, vals: true } },
    yes: D.val(d.d, p.k) + " = " + d.d + " " + (d.d === 1 ? p.one : p.many) + ".",
    key: d.d + "/" + fmt(p.fr)
  };
};

/* ---------- make a decimal from its places ---------- */
const sayParts = parts => {
  const t = parts.map(x => x[1] + " " + (x[1] === 1 ? PL[PLK[x[0]]].one : PL[PLK[x[0]]].many));
  return t.length === 1 ? t[0] : t.slice(0, -1).join(", ") + " and " + t[t.length - 1];
};
function madeOf(parts) {
  const t = parts.reduce((s, x) => s + x[1] * PL[PLK[x[0]]].v, 0);
  const i0 = Math.min(2, Math.min.apply(null, parts.map(x => PLK[x[0]]))), i1 = Math.max.apply(null, parts.map(x => PLK[x[0]]));
  const empty = PL.slice(i0, i1 + 1).filter(p => !parts.some(x => x[0] === p.k));           /* the places that need a zero */
  return { t: t, i0: i0, i1: i1, empty: empty, text: D.s(t, i1 - 2 > 0 ? i1 - 2 : 0) };
}
M.dmake = function (d) {
  const m = madeOf(d.parts), z = m.empty[0], ps = PL.slice(m.i0, m.i1 + 1);
  const noZero = m.text.replace(/0/g, "");
  const base = {
    q: d.cells ? "Write the number in the chart." : "Write the [[decimal]] number.", sum: cap(sayParts(d.parts)),
    hint: { pic: { k: "dchart", from: PL[m.i0].k, to: PL[m.i1].k, ask: true }, step: z ? "There are no " + z.many + ". Write 0 in the " + z.many + " place." : "Put each digit in its own place. The decimal point comes after the ones." },
    worked: { text: cap(sayParts(d.parts)) + " make " + m.text + "." + (m.empty.length > 1 ? " The zeros hold the " + m.empty.map(p => p.many).join(" and the ") + " places." : z ? " The 0 holds the " + z.many + " place." : ""), pic: { k: "dchart", n: m.text, from: PL[m.i0].k, to: PL[m.i1].k } },
    yes: cap(sayParts(d.parts)) + " make " + m.text + ".", key: m.text
  };
  if (d.cells) {
    const ds = ps.map(p => String(D.digit(m.t, p.k)));
    return Object.assign(base, {
      how: "Tap a box in the chart. Then tap a digit.",
      ui: { k: "dchart", from: PL[m.i0].k, to: PL[m.i1].k, cells: true }, blanks: ds.map(() => ({ len: 1, w: "cell" })),
      check(r) {
        const parts = ds.map((x, i) => r.v[i] === x);
        if (parts.every(Boolean)) return { ok: true, parts: parts };
        const i = parts.indexOf(false);
        return { ok: false, msg: ds[i] === "0" ? "No " + ps[i].many + " are given. Write 0 in the " + ps[i].many + " place." : "Check the " + ps[i].many + " place.", parts: parts };
      },
      fill: ds
    });
  }
  return Object.assign(base, {
    lines: ["{0}"], blanks: [{ len: 6, w: "big", dec: 3 }],
    check(r) {
      if (D.eq(r.v[0], m.t)) return { ok: true };
      if (z && r.v[0].replace(/0/g, "") === noZero) return { ok: false, msg: "One place is empty. Write 0 to hold the " + z.many + " place.", parts: [false] };
      if (r.v[0].replace(".", "") === m.text.replace(".", "")) return { ok: false, msg: "The digits are right. Check where the decimal point goes: after the ones.", parts: [false] };
      return { ok: false, msg: "Put each digit in its own place: " + ps.map(p => p.many).join(", ") + ".", parts: [false] };
    },
    fill: [m.text]
  });
};

/* clues about each decimal place: one number fits */
M.dclue = function (d) {
  const parts = [["o", d.whole % 10]].concat(d.whole >= 10 ? [["t", Math.floor(d.whole / 10)]] : [], [["te", d.te], ["hu", d.hu]], d.ths != null ? [["ths", d.ths]] : []);
  const t = parts.reduce((s, x) => s + x[1] * PL[PLK[x[0]]].v, 0), dp = d.ths != null ? 3 : 2, text = D.s(t, dp);
  const clues = [["te", d.te], ["hu", d.hu]].concat(d.ths != null ? [["ths", d.ths]] : []);
  const order = d.order ? d.order.map(i => clues[i]) : clues;
  const line = x => "the digit <b>" + x[1] + "</b> in the " + PL[PLK[x[0]]].many + " place";
  return {
    q: "My number is between <b>" + d.whole + "</b> and <b>" + (d.whole + 1) + "</b>. " + (dp === 2 ? "It has two decimal places. " : "") + "It has " + order.map(line).join(order.length > 2 ? ", " : " and ").replace(/, ([^,]*)$/, " and $1") + ". Write my number.",
    lines: ["{0}"], blanks: [{ len: 6, w: "big", dec: 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (v === t) return { ok: true };
      if (!isNaN(v) && Math.floor(v / 1000) !== d.whole) return { ok: false, msg: "The number is between " + d.whole + " and " + (d.whole + 1) + ". So it starts with " + d.whole + " and a decimal point.", parts: [false] };
      const bad = clues.find(x => isNaN(v) || D.digit(v, x[0]) !== x[1]);
      return { ok: false, msg: bad ? "Check the " + PL[PLK[bad[0]]].many + " place. It must be " + bad[1] + "." : "Read each clue again.", parts: [false] };
    },
    hint: { pic: { k: "dchart", from: d.whole >= 10 ? "t" : "o", to: dp === 3 ? "ths" : "hu", ask: true }, step: "Between " + d.whole + " and " + (d.whole + 1) + " means the whole part is " + d.whole + ". Then fill the tenths" + (dp === 3 ? ", hundredths and thousandths." : " and hundredths.") },
    worked: { text: "The whole part is " + d.whole + ". " + clues.map(x => cap(PL[PLK[x[0]]].many) + ": " + x[1]).join(". ") + ". The number is " + text + ".", pic: { k: "dchart", n: text, to: dp === 3 ? "ths" : "hu" } },
    yes: text + " is between " + d.whole + " and " + (d.whole + 1) + ".", key: text, fill: [text]
  };
};

/* expanded form with decimals */
M.dexp = function (d) {
  const t = D.p(d.n), ps = PL.filter(p => D.digit(t, p.k) > 0), vals = ps.map(p => D.val(D.digit(t, p.k), p.k));
  if (!d.miss) {
    return {
      q: "Write the number.", lines: [vals.join(" + ") + " = {0}"], blanks: [{ len: 6, w: "big", dec: 3 }],
      check(r) {
        if (D.eq(r.v[0], t)) return { ok: true };
        if (r.v[0].replace(/[0.]/g, "") === String(d.n).replace(/[0.]/g, "")) return { ok: false, msg: "The digits are right, but one is in the wrong place. A place with no part needs a 0.", parts: [false] };
        return { ok: false, msg: "Put each part in its own place.", parts: [false] };
      },
      hint: { pic: { k: "dchart", from: ps[0].k, to: ps[ps.length - 1].k, ask: true }, step: "Put each part in its own place. If a place has no part, write 0 there." },
      worked: { text: vals.join(" + ") + " = " + d.n + ".", pic: { k: "dchart", n: d.n } },
      yes: vals.join(" + ") + " = " + d.n + ".", key: String(d.n), fill: [String(d.n)]
    };
  }
  const i = ps.findIndex(p => p.k === d.miss), p = ps[i], dg = D.digit(t, p.k), want = dg * p.v;
  const line = d.n + " = " + vals.map((v, j) => (j === i ? "{0}" : v)).join(" + ");
  return {
    q: "Write the missing number.", lines: [line], blanks: [{ len: 6, w: "box", dec: 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (v === want) return { ok: true };
      if (v === dg * 1000 && p.k !== "o") return { ok: false, msg: dg + " is the digit. What is it worth in the " + p.many + " place?", parts: [false] };
      return { ok: false, msg: "Which digit of " + d.n + " is missing from the sum? Find its place.", parts: [false] };
    },
    hint: { pic: { k: "dchart", n: d.n }, step: "The " + dg + " is in the " + p.many + " place." },
    worked: { text: "The " + dg + " is in the " + p.many + " place, so it is worth " + vals[i] + ". " + line.replace("{0}", vals[i]) + ".", pic: { k: "dchart", n: d.n, hl: p.k, vals: true } },
    yes: line.replace("{0}", vals[i]) + ".", key: vals[i], fill: [vals[i]]
  };
};

/* ---------- multiply and divide by 10, 100 and 1000 ---------- */
M.dslide = function (d, mode) {
  const n = d.n, op = d.op, by = d.by, k = K(by), ans = calc(n, op, by), dir = op === "x" ? "left" : "right", a = show(ans);
  return {
    q: "Calculate <b>" + n + " " + SYM[op] + " " + fmt(by) + "</b>.",
    how: mode === "our" ? "Let's do it together. " + rule(op, by) + " Then write the answer." : "Slide the digits. Then write the answer.",
    ui: { k: "dslider", n: n, zeros: mode === "our" }, right: { shift: op === "x" ? k : -k },
    lines: [n + " " + SYM[op] + " " + fmt(by) + " = {0}"], blanks: [{ len: 7, w: "big", dec: 3 }],
    check(r) { return D.eq(r.v[0], ans) ? { ok: true } : { ok: false, msg: slip(n, op, by, r.v[0]), parts: [false] }; },
    hint: { pic: { k: "drule", op: op, by: by }, step: rule(op, by) + " The decimal point stays where it is." },
    worked: { text: "Every digit moves " + pl(k) + " to the " + dir + ". " + zeroNote(n, ans) + n + " " + SYM[op] + " " + fmt(by) + " = " + a + ".", pic: { k: "dslider", n: n, shift: op === "x" ? k : -k } },
    yes: n + " " + SYM[op] + " " + fmt(by) + " = " + a + ". The digits moved " + pl(k) + " to the " + dir + ".",
    key: a, fill: [a.replace(/,/g, "")]
  };
};

M.dcalc = function (d) {
  const it = d.items, ans = it.map(x => calc(x.n, x.op, x.by)), tx = it.map(x => x.n + " " + SYM[x.op] + " " + fmt(x.by));
  return {
    q: "Calculate.", marks: it.length,
    lines: it.map((x, i) => (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + tx[i] + " = {" + i + "}"),
    blanks: it.map(() => ({ len: 7, w: "big", dec: 3 })),
    check(r) {
      const parts = it.map((x, i) => D.eq(r.v[i], ans[i]));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + slip(it[i].n, it[i].op, it[i].by, r.v[i]), parts: parts };
    },
    hint: { pic: it.map(x => ({ k: "dslider", n: x.n, cap: x.n + " " + SYM[x.op] + " " + fmt(x.by) })), step: it.map(x => rule(x.op, x.by)).join(" ") },
    worked: { text: it.map((x, i) => tx[i] + " = " + show(ans[i]) + " (" + pl(K(x.by)) + " to the " + (x.op === "x" ? "left" : "right") + ")").join(". ") + ".",
      pic: it.length === 1 ? { k: "dslider", n: it[0].n, shift: it[0].op === "x" ? K(it[0].by) : -K(it[0].by) } : null },
    yes: it.map((x, i) => tx[i] + " = " + show(ans[i])).join(" and ") + ".",
    key: ans.map(show).join(" ; "), fill: ans.map(x => show(x).replace(/,/g, ""))
  };
};

M.dmissing = function (d) {
  const it = d.items.map(x => {
    const res = show(calc(x.a, x.op, x.by)), tell = x.a + " " + SYM[x.op] + " " + fmt(x.by) + " = " + res, k = K(x.by);
    return x.hide === "a"
      ? { line: "{#} " + SYM[x.op] + " " + fmt(x.by) + " = " + res, want: D.p(x.a), ans: String(x.a), tell: tell, dec: 3,
        tip: "Go backwards from " + res + ": do the opposite, " + SYM[OPP[x.op]] + " " + fmt(x.by) + ".", pic: { k: "dslider", n: res } }
      : { line: x.a + " " + SYM[x.op] + " {#} = " + res, want: x.by * 1000, ans: String(x.by), tell: tell, dec: 0,
        tip: "How many places did the digits of " + x.a + " move? 1 place is 10, 2 places is 100, 3 places is 1,000.", pic: { k: "dslider", n: x.a } };
  });
  return {
    q: it.length > 1 ? "Write the missing numbers." : "Write the missing number.", marks: it.length,
    lines: it.map((x, i) => (it.length > 1 ? "<i>(" + "abc"[i] + ")</i> " : "") + x.line.replace("{#}", "{" + i + "}")),
    blanks: it.map(x => ({ len: 7, w: "box", dec: x.dec })),
    check(r) {
      const parts = it.map((x, i) => D.eq(r.v[i], x.want));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + it[i].tip, parts: parts };
    },
    hint: { pic: it.map(x => x.pic), step: it.map((x, i) => (it.length > 1 ? "(" + "abc"[i] + ") " : "") + x.tip).join(" ") },
    worked: { text: it.map(x => x.tell).join(". ") + "." },
    yes: it.map(x => x.tell).join(" and ") + ".",
    key: it.map(x => (x.dec ? x.ans : fmt(+x.ans))).join(" ; "), fill: it.map(x => x.ans)
  };
};

/* which calculation has the same answer? */
M.dsame = function (d) {
  const tx = x => x.n + " " + SYM[x.op] + " " + fmt(x.by), ans = calc(d.n, d.op, d.by);
  const opts = arrange(d.opts.map((x, i) => ({ html: tx(x), ok: calc(x.n, x.op, x.by) === ans, why: tx(x) + " = " + show(calc(x.n, x.op, x.by)) + ", not " + show(ans) + "." })), d.at);
  if (opts.filter(o => o.ok).length !== 1 || calc(d.opts[0].n, d.opts[0].op, d.opts[0].by) !== ans) throw new Error("dsame: exactly one option, the first, must match");
  const right = d.opts[0];
  return {
    q: "Which calculation has the same answer as <b>" + tx(d) + "</b>?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "dslider", n: d.n, cap: tx(d) }, step: "First work out " + tx(d) + ". Then work out each answer." },
    worked: { text: tx(d) + " = " + show(ans) + ". " + tx(right) + " = " + show(ans) + " too." },
    yes: tx(d) + " and " + tx(right) + " are both " + show(ans) + ".",
    key: tx(right)
  };
};

/* a chain of boxes with decimals (the v2 chain, 06: M.chain) */
M.dchain = function (d) {
  const vals = [D.p(d.start)]; d.ops.forEach(o => vals.push(o[0] === "x" ? vals[vals.length - 1] * o[1] : vals[vals.length - 1] / o[1]));
  const emp = vals.map((v, i) => i).filter(i => i !== d.give), nm = ["first", "middle", "last"];
  const cell = i => (i === d.give ? '<span class="cbox">' + show(vals[i]) + "</span>" : "{" + emp.indexOf(i) + "}");
  const arw = o => '<span class="carw"><b>' + SYM[o[0]] + " " + fmt(o[1]) + "</b></span>";
  const how = i => (i > d.give ? "going forwards: " + show(vals[i - 1]) + " " + SYM[d.ops[i - 1][0]] + " " + fmt(d.ops[i - 1][1]) + " = " + show(vals[i])
    : "going backwards, " + SYM[d.ops[i][0]] + " " + fmt(d.ops[i][1]) + " becomes " + SYM[OPP[d.ops[i][0]]] + " " + fmt(d.ops[i][1]) + ": " + show(vals[i + 1]) + " " + SYM[OPP[d.ops[i][0]]] + " " + fmt(d.ops[i][1]) + " = " + show(vals[i]));
  const order = emp.slice().sort((a, b) => Math.abs(a - d.give) - Math.abs(b - d.give)), back = emp.some(i => i < d.give);
  return {
    q: "Write the missing numbers in the boxes.", marks: emp.length, sub: "Follow the arrows from left to right.",
    lines: ['<span class="chain">' + vals.map((v, i) => cell(i) + (i < d.ops.length ? arw(d.ops[i]) : "")).join("") + "</span>"],
    blanks: emp.map(() => ({ len: 7, w: "cbox", dec: 3 })),
    check(r) {
      const parts = emp.map((i, k) => D.eq(r.v[k], vals[i]));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = order.find(j => !parts[emp.indexOf(j)]), o = i > d.give ? d.ops[i - 1] : d.ops[i], near = i > d.give ? vals[i - 1] : vals[i + 1];
      const msg = "Look at the " + nm[i] + " box. " + (i < d.give
        ? "Go backwards from " + show(near) + ". The opposite of " + SYM[o[0]] + " " + fmt(o[1]) + " is " + SYM[OPP[o[0]]] + " " + fmt(o[1]) + "."
        : slip(show(near).replace(/,/g, ""), o[0], o[1], r.v[emp.indexOf(i)]));
      return { ok: false, msg: msg, parts: parts };
    },
    hint: { pic: { k: "dslider", n: show(vals[d.give]).replace(/,/g, ""), cap: "You know this number: " + show(vals[d.give]) },
      step: back ? "Start at the number you know. To go backwards along an arrow, do the opposite." : "Start at the number you know and follow each arrow." },
    worked: { text: "Start at " + show(vals[d.give]) + ". " + order.map(i => cap(how(i))).join(". ") + "." },
    yes: vals.map(show).join(" → ") + ".", key: emp.map(i => show(vals[i])).join(" ; "), fill: emp.map(i => show(vals[i]).replace(/,/g, ""))
  };
};

/* a real-life problem with one multiplication or division by 10, 100 or 1000 */
M.dscale = function (d) {
  const first = calc(d.n, d.op, d.by), ans = first + (d.plus ? D.p(d.plus) : 0), a = show(ans);
  const work = d.n + " " + SYM[d.op] + " " + fmt(d.by) + " = " + show(first) + (d.plus ? ". " + show(first) + " + " + d.plus + " = " + a : "");
  const step = (d.op === "x" ? "Multiply " : "Divide ") + d.n + " by " + fmt(d.by) + ". " + rule(d.op, d.by);
  return {
    q: d.text, real: d.pic || "",
    lines: ["{0} " + d.unit], blanks: [{ len: 7, w: "big", dec: 3 }],
    check(r) { return D.eq(r.v[0], ans) ? { ok: true } : { ok: false, msg: d.plus && D.eq(r.v[0], first) ? "That is the first step. " + (d.plusSay || "Now add " + d.plus + ".") : D.eq(r.v[0], calc(d.n, OPP[d.op], d.by)) ? (d.op === "x" ? "You divided. Here the answer must be bigger than " + d.n + "." : "You multiplied. Here the answer must be smaller than " + d.n + ".") : slip(d.n, d.op, d.by, r.v[0]), parts: [false] }; },
    hint: { pic: { k: "drule", op: d.op, by: d.by }, step: step + (d.plus ? " Then do the second step: " + (d.plusSay || "add " + d.plus + ".") : "") },
    worked: { text: work + ". The answer is " + a + " " + d.unit + ".", pic: { k: "dslider", n: d.n, shift: d.op === "x" ? K(d.by) : -K(d.by) } },
    yes: work + ".", key: a, fill: [a.replace(/,/g, "")]
  };
};

MX.dslip = slip; MX.drule = rule;
})();

