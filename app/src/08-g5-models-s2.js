/* 08-g5-models-s2.js - Grade 5 question models for Stop 2: rounding numbers with two decimal places to the nearest
   tenth or whole number (6Np.04) and estimating, adding and subtracting decimals with the same or a different number
   of decimal places (6Nf.09). Every answer is worked out here from the numbers in the data. Numbers are given as
   text ('6.38') and kept exact as thousandths (MX.D, 07-g5-models-base.js). Halfway numbers round up.

   to = 'whole' (the nearest whole number) or 'tenth' (the nearest tenth); op = '+' or '-'.

   drline     { n: '6.38', to, mid?: true }              tap the nearer end of the rounding line (tool dround); mid: the
                                                         halfway mark is shown from the start (always in 'our' mode)
   dround     { items: [{ n, to }, ...] }                write each rounded number
   droundto   { n, to, at, line?: true }                 tick the rounded number (the wrong options are the usual slips);
                                                         line: the rounding line is drawn in the question
   droundpick { target: '4.6', to, opts: [4 numbers], at }   which number rounds to the target? (opts[0] must be the one)
   droundall  { nums: ['6.35', ...], to, target }        ring every number that rounds to the target (tool dpick)
   drange     { target: '3.4', to, ask: 'min' | 'max', dp: 2 }   the smallest / largest number with dp decimal places
                                                         that rounds to the target
   dest       { a, b, op }                               estimate with whole numbers, then calculate
   dcolsum    { a, b, op }                               line up in the column tool (dcol), then write each answer digit
   dsum       { items: [{ a, b, op }, ...] }             "Calculate." with one line for each part
   dmiss      { items: [{ a, b, op, hide: 'a' | 'b' }] } a missing number in an addition or a subtraction
   dstory     { text, unit, pre?, dp?, kind, ... }       a real-life problem (money: pre '$', dp 2)
                kind 'add'    nums: [..]                 the total
                kind 'sub'    a, b                       a − b
                kind 'change' have, items: [..]          have − (the sum of the items): two steps
                kind 'left'   start, each, n             start − n lots of each: two steps
                kind 'both'   a, d, more: true | false   a + (a + d) or a + (a − d): two steps
   dcolfix    { who, pro?, a, b, op, slip, at }          spot the mistake in a written calculation, then correct it
                                                         (pro: 'she' | 'he', the pronoun for who; default 'they')
                slip 'right' (digits lined up from the right), 'nozero' (no place holder: the extra digit is brought
                down), 'noex' (no exchange: the smaller digit from the bigger one), 'nocarry' (the carried 1 is lost)

   MX.dwork(a, b, op) -> the written method, column by column (also read by the column tool, 39-g5-tools-s2.js).
   MX.d2 = { rd, slips }: the rounding and the slip values, for the tests. */
(function () {
"use strict";
const M = MX.M, D = MX.D, PL = D.PL, PLK = D.PLK, arrange = MX.arrange, cap = MX.cap;
const OPS = { "+": "+", "-": "−" };
const TO = {
  whole: { u: 1000, dp: 0, name: "whole number", link: "[[whole number]]", look: PL[PLK.te], keep: PL[PLK.o], other: "tenth" },
  tenth: { u: 100, dp: 1, name: "tenth", link: "[[tenth]]", look: PL[PLK.hu], keep: PL[PLK.te], other: "whole" }
};
const rd = (t, u) => Math.floor((t + u / 2) / u) * u;            /* halfway rounds up (whole thousandths, t >= 0) */
const fl = (t, u) => Math.floor(t / u) * u;
const rs = (t, to) => D.s(t, TO[to].dp);                          /* a rounded number as text: 7 | 7.0 */
const near = to => "to the [[nearest]] " + TO[to].link;
const nearP = to => "to the nearest " + TO[to].name;
const sumText = (a, op, b) => a + " " + OPS[op] + " " + b;
const abc = (n, i) => (n > 1 ? "<i>(" + "abc"[i] + ")</i> " : "");
const list = a => (a.length === 1 ? a[0] : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

/* why n rounds the way it does */
function why(n, to) {
  const t = D.p(n), T0 = TO[to], l = fl(t, T0.u), h = l + T0.u, dg = D.digit(t, T0.look.k), up = rd(t, T0.u) === h, half = t - l === T0.u / 2;
  return n + " is between " + rs(l, to) + " and " + rs(h, to) + ". The " + T0.look.many + " digit is " + dg + ". " +
    (half ? "That is exactly halfway, and halfway rounds up: " : up ? dg + " is 5 or more, so round up: " : dg + " is less than 5, so round down: ") + rs(up ? h : l, to) + ".";
}
/* what went wrong when n was rounded */
function rslip(n, to, typed) {
  const t = D.p(n), T0 = TO[to], u = T0.u, l = fl(t, u), h = l + u, a = rd(t, u), v = D.p(typed), dg = D.digit(t, T0.look.k);
  const between = n + " is between " + rs(l, to) + " and " + rs(h, to) + ". Which one is nearer?";
  if (isNaN(v)) return "Write a number.";
  if (v === t) return "Rounding changes this number. " + between;
  if (a === h && v === l) return t - l === u / 2 ? n + " is exactly halfway. Halfway numbers round up." : "The " + T0.look.many + " digit is " + dg + ". 5 or more: round up.";
  if (a === l && v === h) return "The " + T0.look.many + " digit is " + dg + ". Less than 5: round down. The " + T0.keep.many + " digit stays the same.";
  if (v === rd(t, TO[T0.other].u)) return "That is " + n + " to the nearest " + TO[T0.other].name + ". Round it to the nearest " + T0.name + ".";
  if (to === "tenth" && D.dp(typed) > 1) return "A number rounded to the nearest tenth has only 1 decimal place.";
  if (to === "whole" && D.dp(typed) > 0 && v % 1000) return "A whole number has no tenths or hundredths. " + between;
  return between;
}

/* ---------- the written method, column by column ---------- */
const lead = t => (t >= 100000 ? 0 : t >= 10000 ? 1 : 2);        /* the first place (in PL) that t needs; the ones always show */
function work(a, b, op) {
  const ta = D.p(a), tb = D.p(b), ans = op === "+" ? ta + tb : ta - tb;
  if (isNaN(ta) || isNaN(tb) || ans < 0) throw new Error("dwork: bad numbers " + a + " " + op + " " + b);
  const dpa = D.dp(a), dpb = D.dp(b), dp = Math.max(dpa, dpb);
  const i0 = Math.min(lead(ta), lead(tb), lead(ans)), i1 = 2 + dp, cols = PL.slice(i0, i1 + 1), n = cols.length;
  const row = (t, dpx) => cols.map((p, j) => { const i = i0 + j; return i >= lead(t) && i <= 2 + dpx ? D.digit(t, p.k) : null; });
  const A = row(ta, dpa), B = row(tb, dpb);
  const padA = cols.map((p, j) => i0 + j > 2 + dpa), padB = cols.map((p, j) => i0 + j > 2 + dpb);     /* the place holder zeros */
  const ansDigits = cols.map((p, j) => (i0 + j >= lead(ans) ? D.digit(ans, p.k) : null));
  const first = Math.min(lead(ta), lead(tb)) - i0;               /* the first column that holds a digit of a or b */
  const steps = [], eff = A.map(x => x || 0);
  let carry = 0;
  for (let j = n - 1; j >= first; j--) {
    const p = cols[j], bot = B[j] || 0;
    if (op === "+") {
      const top = A[j] || 0, s = top + bot + carry, cin = carry;
      carry = Math.floor(s / 10);
      steps.push({ j: j, k: p.k, need: false, top: top, bot: bot, cin: cin, res: s % 10, cout: carry,
        say: top + " + " + bot + (cin ? " + 1" : "") + " = " + s + "." + (carry ? " Write " + (s % 10) + " and carry 1." : "") });
    } else {
      let need = false, exSay = "";
      if (eff[j] < bot) {
        need = true;
        let k = j - 1; while (k >= 0 && eff[k] === 0) k--;
        if (k < 0) throw new Error("dwork: cannot exchange");
        eff[k]--; for (let m = k + 1; m < j; m++) eff[m] = 9; eff[j] += 10;
        const says = []; for (let m = k; m < j; m++) says.push("1 " + cols[m].one + " = 10 " + cols[m + 1].many + ".");
        exSay = says.join(" ");
      }
      if (ansDigits[j] == null && eff[j] === 0 && bot === 0) break;                     /* nothing left to do on the left */
      steps.push({ j: j, k: p.k, need: need, exSay: exSay, eff: eff.slice(), top: eff[j], bot: bot, res: eff[j] - bot, cout: 0,
        say: eff[j] + " − " + bot + " = " + (eff[j] - bot) + "." });
    }
  }
  const text = steps.map(s => cap(cols[s.j].many) + ": " + (s.need ? "exchange. " + s.exSay + " " : "") + s.say).join(" ") +
    (op === "+" && carry ? " Write the carried 1 in the " + (cols[first - 1] ? cols[first - 1].many : "next") + " place." : "");
  return { cols: cols, A: A, B: B, padA: padA, padB: padB, dpa: dpa, dpb: dpb, dp: dp, first: first, steps: steps, lastCarry: op === "+" ? carry : 0,
    ans: ans, ansText: D.s(ans, dp), ansDigits: ansDigits, text: text };
}
MX.dwork = work;

/* the answers that the classic slips give (thousandths; null when the slip cannot happen with these numbers) */
function slips(a, b, op) {
  const w = work(a, b, op), f = Math.pow(10, 3 - w.dp), n = w.cols.length, out = {};
  const num = ds => ds.reduce((s, d) => s * 10 + d, 0) * f;
  const Ad = w.A.map(x => x || 0), Bd = w.B.map(x => x || 0);
  /* the last digits lined up, not the decimal points: 3.4 + 2.15 -> 34 + 215 = 249 -> 2.49 */
  if (w.dpa !== w.dpb) {
    const ia = D.p(a) / Math.pow(10, 3 - w.dpa), ib = D.p(b) / Math.pow(10, 3 - w.dpb);
    out.right = Math.abs(op === "+" ? ia + ib : ia - ib) * f;
  }
  if (op === "+") out.nocarry = num(Ad.map((x, j) => (x + Bd[j]) % 10));
  else {
    out.noex = num(Ad.map((x, j) => Math.abs(x - Bd[j])));                       /* the smaller digit from the bigger one */
    out.noreduce = num(Ad.map((x, j) => (x >= Bd[j] ? x - Bd[j] : x + 10 - Bd[j])));   /* exchanged, but the next column did not go down */
    if (w.dpb > w.dpa) {                                                         /* no place holder: the extra digits are brought down */
      const fa = Math.pow(10, 3 - w.dpa), tb = D.p(b), cut = Math.floor(tb / fa) * fa;
      if (D.p(a) >= cut) out.nozero = D.p(a) - cut + tb % fa;
    }
  }
  out.otherop = op === "+" ? Math.abs(D.p(a) - D.p(b)) : D.p(a) + D.p(b);
  Object.keys(out).forEach(k => { if (out[k] === w.ans) out[k] = null; });
  return out;
}
/* feedback for a wrong answer to a + b or a − b */
function sumSlip(a, b, op, typed) {
  const v = D.p(typed), s = slips(a, b, op), w = work(a, b, op);
  if (isNaN(v)) return "Write a number.";
  if (v === s.right) return "Line up the decimal points, not the last digits. Tenths go under tenths.";
  if (v === s.nozero) { const p = w.cols[w.cols.length - 1]; return a + " has no " + p.many + ". Write 0 there as a place holder. Then exchange."; }
  if (v === s.nocarry) return "You forgot to carry. When a column makes 10 or more, carry 1 to the next column.";
  if (v === s.noex) return "Take the bottom digit from the top digit. When the top digit is smaller, exchange.";
  if (v === s.noreduce) return "You exchanged. Now the next column on the left must go down by 1.";
  if (v === s.otherop) return op === "+" ? "You subtracted. This is an addition." : "You added. This is a subtraction.";
  if (String(typed).replace(".", "") === w.ansText.replace(".", "")) return "The digits are right. Check where the decimal point goes.";
  return "Line up the decimal points. Then work from the right, one column at a time.";
}
MX.d2 = { rd: rd, slips: slips };

/* ---------- rounding ---------- */

/* Draw it: tap the nearer end of the rounding line */
M.drline = function (d, mode) {
  const n = d.n, to = d.to, T0 = TO[to], t = D.p(n), l = fl(t, T0.u), h = l + T0.u, a = rd(t, T0.u), ans = rs(a, to), mid = D.s(l + T0.u / 2);
  return {
    q: "Round <b>" + n + "</b> " + near(to) + ".",
    how: mode === "our" ? n + " is between " + rs(l, to) + " and " + rs(h, to) + ". Halfway is " + mid + ". Tap the end that is nearer." : "Tap the end of the line that is nearer to " + n + ".",
    ui: { k: "dround", n: n, to: to, mid: mode === "our" || !!d.mid }, right: { choice: ans },
    ready: r => !!r.choice,
    check(r) { return r.choice === ans ? { ok: true } : { ok: false, msg: rslip(n, to, r.choice) }; },
    given: r => String(r.choice || ""),
    hint: { reveal: "mid", step: "Halfway between " + rs(l, to) + " and " + rs(h, to) + " is " + mid + ". Is " + n + " before halfway, or is it halfway or more?" },
    worked: { text: why(n, to), pic: { k: "dround", n: n, to: to, mid: true, show: true } },
    yes: n + " rounds to " + ans + " " + nearP(to) + ".",
    key: ans
  };
};

/* Solve it: write each rounded number */
M.dround = function (d) {
  const it = d.items.map(x => ({ n: x.n, to: x.to, a: rd(D.p(x.n), TO[x.to].u) })), one = it.length === 1;
  return {
    q: one ? "Round <b>" + it[0].n + "</b> " + near(it[0].to) + "." : "Round each number.", marks: it.length,
    lines: it.map((x, i) => (one ? "" : abc(it.length, i) + x.n + " " + nearP(x.to) + ": ") + "{" + i + "}"),
    blanks: it.map(() => ({ len: 5, w: one ? "big" : "mid", dec: 2 })),
    check(r) {
      const parts = it.map((x, i) => D.eq(r.v[i], x.a));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (one ? "" : "Look at (" + "abc"[i] + "). ") + rslip(it[i].n, it[i].to, r.v[i]), parts: parts };
    },
    hint: { pic: it.map(x => ({ k: "dround", n: x.n, to: x.to, mid: true })), step: it.map(x => "To round " + nearP(x.to) + ", look at the " + TO[x.to].look.many + " digit of " + x.n + ".").join(" ") + " 5 or more rounds up." },
    worked: { text: it.map(x => why(x.n, x.to)).join(" "), pic: one ? { k: "dround", n: it[0].n, to: it[0].to, mid: true, show: true } : null },
    yes: it.map(x => x.n + " rounds to " + rs(x.a, x.to)).join(" and ") + ".",
    key: it.map(x => rs(x.a, x.to)).join(" ; "), fill: it.map(x => rs(x.a, x.to).replace(/,/g, ""))
  };
};

/* tick the rounded number: the wrong options are the other end, the other place and one step too far */
M.droundto = function (d) {
  const n = d.n, to = d.to, T0 = TO[to], O = TO[T0.other], t = D.p(n), l = fl(t, T0.u), h = l + T0.u, a = rd(t, T0.u), end = a === l ? h : l, dg = D.digit(t, T0.look.k);
  const oa = rd(t, O.u), far = a === h ? h + T0.u : l - T0.u, cut = to === "whole" ? fl(t, 100) : (rd(t, 1000) === fl(t, 1000) ? fl(t, 1000) + 1000 : fl(t, 1000));
  const cand = [
    { v: end, html: rs(end, to), why: a === h ? "The " + T0.look.many + " digit is " + dg + ". 5 or more: round up." : "The " + T0.look.many + " digit is " + dg + ". Less than 5: round down." },
    { v: oa, html: rs(oa, T0.other), why: "That is " + n + " to the nearest " + O.name + ", not to the nearest " + T0.name + "." },
    { v: cut, html: to === "whole" ? D.s(cut, 1) : D.s(cut, 0), why: n + " is between " + rs(l, to) + " and " + rs(h, to) + ". Choose the nearer one." },
    { v: far, html: rs(far, to), why: n + " is between " + rs(l, to) + " and " + rs(h, to) + ". Choose the nearer one." }];
  const seen = [a], wrong = [];
  cand.forEach(c => { if (c.v >= 0 && seen.indexOf(c.v) < 0 && wrong.length < 3) { seen.push(c.v); wrong.push(c); } });
  const opts = arrange([{ html: rs(a, to), ok: true, why: "" }].concat(wrong.map(c => ({ html: c.html, ok: false, why: c.why }))), d.at);
  return {
    q: "What is <b>" + n + "</b> rounded " + near(to) + "?", sub: "Tick (✓) one box.", opts: opts,
    fig: d.line ? { k: "dround", n: n, to: to } : null,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "dround", n: n, to: to, mid: true }, step: "Look at the " + T0.look.many + " digit of " + n + ". Less than 5 rounds down. 5 or more rounds up." },
    worked: { text: why(n, to), pic: { k: "dround", n: n, to: to, mid: true, show: true } },
    yes: why(n, to), key: rs(a, to)
  };
};

/* which number rounds to the target? */
M.droundpick = function (d) {
  const to = d.to, T0 = TO[to], tt = D.p(d.target), r0 = d.opts.map(x => rd(D.p(x), T0.u));
  if (r0[0] !== tt || r0.filter(x => x === tt).length !== 1) throw new Error("droundpick: exactly one option, the first, must round to " + d.target);
  const opts = arrange(d.opts.map((x, i) => ({ html: String(x), ok: i === 0, why: i === 0 ? "" : x + " rounds to " + rs(r0[i], to) + ": its " + T0.look.many + " digit is " + D.digit(D.p(x), T0.look.k) + "." })), d.at);
  return {
    q: "Which number rounds to <b>" + rs(tt, to) + "</b>, " + near(to) + "?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Try another number." }; },
    hint: { pic: { k: "dround", from: D.s(tt - T0.u, T0.dp), to: to, mid: true }, step: "Round each number " + nearP(to) + ". Look at the " + T0.look.many + " digit each time. Halfway rounds up." },
    worked: { text: d.opts.map((x, i) => x + " rounds to " + rs(r0[i], to) + (i === 0 ? " ✓" : "")).join(". ") + ".", pic: { k: "dround", n: String(d.opts[0]), to: to, mid: true, show: true } },
    yes: why(String(d.opts[0]), to), key: String(d.opts[0])
  };
};

/* Draw it: put a ring around every number that rounds to the target */
M.droundall = function (d) {
  const to = d.to, T0 = TO[to], tt = D.p(d.target), nums = d.nums.map(Number), txt = v => String(d.nums[nums.indexOf(v)]);
  const rOf = s => rd(D.p(s), T0.u), good = nums.filter((v, i) => rOf(d.nums[i]) === tt).sort((x, y) => x - y);
  if (!good.length || good.length === nums.length) throw new Error("droundall: some numbers, not all, must round to " + d.target);
  return {
    q: "Put a ring around <b>all</b> the numbers that [[round]] to <b>" + rs(tt, to) + "</b>, " + near(to) + ".",
    sub: "Tap a number to put a ring around it. Tap it again to rub the ring out.",
    ui: { k: "dpick", nums: nums }, right: { picks: good },
    ready: r => !!(r.picks && r.picks.length),
    check(r) {
      const bad = r.picks.filter(v => good.indexOf(v) < 0), miss = good.filter(v => r.picks.indexOf(v) < 0);
      if (!bad.length && !miss.length) return { ok: true };
      if (bad.length) return { ok: false, msg: txt(bad[0]) + " rounds to " + rs(rOf(txt(bad[0])), to) + ", not " + rs(tt, to) + ". Look at its " + T0.look.many + " digit.", parts: bad };
      return { ok: false, msg: "Your " + (r.picks.length === 1 ? "ring is" : "rings are") + " right. But more numbers round to " + rs(tt, to) + ". Remember: halfway rounds up.", parts: [] };
    },
    given: r => (r.picks || []).join(" "),
    hint: { pic: { k: "dround", from: D.s(tt - T0.u, T0.dp), to: to, mid: true }, step: "Round each number " + nearP(to) + ". Look at the " + T0.look.many + " digit each time. Halfway numbers round up." },
    worked: { text: d.nums.map(s => s + " rounds to " + rs(rOf(s), to) + (rOf(s) === tt ? " ✓" : "")).join(". ") + "." },
    yes: cap(list(good.map(txt))) + " round" + (good.length === 1 ? "s" : "") + " to " + rs(tt, to) + ".", key: good.map(txt).join(" ; ")
  };
};

/* the smallest or the largest number (with dp decimal places) that rounds to the target */
M.drange = function (d) {
  const to = d.to, T0 = TO[to], u = T0.u, tt = D.p(d.target), dp = d.dp || 2, step = Math.pow(10, 3 - dp), min = d.ask === "min";
  if (step * 2 > u || tt % u) throw new Error("drange: bad target or dp");
  const ans = min ? tt - u / 2 : tt + u / 2 - step, a = D.s(ans, dp), T1 = rs(tt, to), lo = min ? tt - u : tt, half = lo + u / 2;
  const places = dp + (dp === 1 ? " decimal place" : " decimal places");
  return {
    q: "A number with <b>" + places + "</b> is rounded " + near(to) + ". The answer is <b>" + T1 + "</b>. What is the <b>" + (min ? "smallest" : "largest") + "</b> number it can be?",
    lines: ["{0}"], blanks: [{ len: 5, w: "big", dec: dp }],
    check(r) {
      const v = D.p(r.v[0]);
      if (v === ans) return { ok: true };
      if (isNaN(v)) return { ok: false, msg: "Write a number.", parts: [false] };
      if (rd(v, u) === tt) return { ok: false, msg: D.s(v) + " does round to " + T1 + ". But a " + (min ? "smaller" : "bigger") + " number does too. " + (min ? "Try the halfway number." : "Which number comes just before halfway?"), parts: [false] };
      if (!min && v === tt + u / 2) return { ok: false, msg: D.s(v, dp) + " is exactly halfway between " + T1 + " and " + rs(tt + u, to) + ". Halfway rounds up, so it rounds to " + rs(tt + u, to) + ".", parts: [false] };
      return { ok: false, msg: D.s(v) + " rounds to " + rs(rd(v, u), to) + ", not " + T1 + ". Find the halfway number between " + rs(lo, to) + " and " + rs(lo + u, to) + ".", parts: [false] };
    },
    hint: { pic: { k: "dround", from: rs(lo, to), to: to, mid: true }, step: "Find the halfway number between " + rs(lo, to) + " and " + rs(lo + u, to) + ". Halfway rounds up." },
    worked: { text: "Halfway between " + rs(lo, to) + " and " + rs(lo + u, to) + " is " + D.s(half, dp) + ". Halfway rounds up, so " + D.s(half, dp) + " rounds to " + rs(lo + u, to) + ". " +
        (min ? D.s(half - step, dp) + " rounds down to " + rs(lo, to) + ". So the smallest number is " + a + "." : "The number just before it is " + a + ". It rounds down to " + T1 + ". So the largest number is " + a + "."),
      pic: { k: "dround", n: a, to: to, mid: true, show: true } },
    yes: a + " is the " + (min ? "smallest" : "largest") + " number with " + places + " that rounds to " + T1 + ".",
    key: a, fill: [a]
  };
};

/* ---------- estimate, add and subtract ---------- */

/* estimate with whole numbers, then calculate */
M.dest = function (d) {
  const a = d.a, b = d.b, op = d.op, ra = rd(D.p(a), 1000), rb = rd(D.p(b), 1000), est = op === "+" ? ra + rb : ra - rb, w = work(a, b, op);
  const word = op === "+" ? "add" : "subtract";
  return {
    q: "[[Estimate|estimate]] <b>" + sumText(a, op, b) + "</b> first. Then calculate.", marks: 2,
    sub: "For the estimate, round each number to the nearest whole number.",
    lines: ["Estimate:", "{0} " + OPS[op] + " {1} = {2}", "Calculate: " + sumText(a, op, b) + " = {3}"],
    blanks: [{ len: 3, w: "mid" }, { len: 3, w: "mid" }, { len: 3, w: "mid" }, { len: 6, w: "big", dec: 3 }],
    check(r) {
      const parts = [D.eq(r.v[0], ra), D.eq(r.v[1], rb), D.eq(r.v[2], est), D.eq(r.v[3], w.ans)];
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      if (!parts[0] || !parts[1]) { const n = parts[0] ? b : a; return { ok: false, msg: "Look at the estimate. " + rslip(n, "whole", r.v[parts[0] ? 1 : 0]), parts: parts }; }
      if (!parts[2]) return { ok: false, msg: D.eq(r.v[2], w.ans) ? "That is the exact answer. For the estimate, use the whole numbers: " + D.s(ra) + " " + OPS[op] + " " + D.s(rb) + "." : "Now " + word + " the whole numbers: " + D.s(ra) + " " + OPS[op] + " " + D.s(rb) + ".", parts: parts };
      return { ok: false, msg: "The estimate is right. Now the exact answer: it must be close to " + D.s(est) + ". " + sumSlip(a, b, op, r.v[3]), parts: parts };
    },
    hint: { pic: [{ k: "dround", n: a, to: "whole", mid: true }, { k: "dround", n: b, to: "whole", mid: true }], step: "Round each number to the nearest whole number and " + word + " them. Then line up the decimal points and " + word + " the real numbers." },
    worked: { text: a + " is about " + D.s(ra) + " and " + b + " is about " + D.s(rb) + ". Estimate: " + D.s(ra) + " " + OPS[op] + " " + D.s(rb) + " = " + D.s(est) + ". Exact: " + sumText(a, op, b) + " = " + w.ansText + ". It is close to " + D.s(est) + ", so it looks right.",
      pic: { k: "dcol", a: a, b: b, op: op, ans: true } },
    yes: "The estimate is " + D.s(est) + ". The exact answer is " + w.ansText + ".",
    key: [D.s(ra), D.s(rb), D.s(est), w.ansText].join(" ; "), fill: [String(ra / 1000), String(rb / 1000), String(est / 1000), w.ansText.replace(/,/g, "")]
  };
};

/* Draw it: line up the numbers in the column tool, then write the answer, one digit in each column */
M.dcolsum = function (d, mode) {
  const a = d.a, b = d.b, op = d.op, w = work(a, b, op), word = op === "+" ? "add" : "subtract";
  const js = w.cols.map((p, j) => j).filter(j => w.ansDigits[j] != null).reverse();       /* the answer boxes, from the right */
  const needZero = w.padA.some(Boolean) || w.padB.some(Boolean), needLine = w.dpa !== w.dpb;
  /* what to look at in column j (the first wrong box): the sum to do there, without its answer */
  const colTip = j => {
    const s = w.steps.find(x => x.j === j), p = w.cols[j];
    if (!s) return "Do not forget the carried 1. Write it in the " + p.many + " place.";
    if (op === "+") return "Check the " + p.many + " column: " + s.top + " + " + s.bot + (s.cin ? ", and the carried 1." : ".");
    if (s.need) return "Check the " + p.many + " column. The top digit is smaller, so exchange first.";
    return "Check the " + p.many + " column: " + s.top + " − " + s.bot + "." + (s.top !== (w.A[j] || 0) ? " The top digit changed when you exchanged." : "");
  };
  return {
    q: "Calculate <b>" + sumText(a, op, b) + "</b>.",
    how: (needLine ? "Tap <b>Line up</b> to put the decimal points in a line. " : "") + (needZero ? "Tap <b>Write 0</b> to fill the empty place. " : "") + "Then " + word + ". Start on the right" + (mode === "our" ? ", with the " + w.cols[w.cols.length - 1].many + "." : "."),
    ui: { k: "dcol", a: a, b: b, op: op, cells: true }, right: { lined: true, zeros: true },
    blanks: js.map(() => ({ len: 1, w: "cell" })),
    ready: r => Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const parts = js.map((j, i) => r.v[i] === String(w.ansDigits[j]));
      if (r.lined === false) return { ok: false, msg: "First line up the decimal points. Tap “Line up”.", parts: parts };
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      /* the number that the boxes show */
      const typed = w.cols.map((p, j) => { const i = js.indexOf(j); return (i < 0 ? "" : r.v[i]) + (p.k === "o" ? "." : ""); }).join("");
      const i = parts.indexOf(false), msg = sumSlip(a, b, op, typed);
      return { ok: false, msg: /^Line up/.test(msg) ? colTip(js[i]) : msg, parts: parts };
    },
    hint: { pic: { k: "dcol", a: a, b: b, op: op }, step: "Start with the " + w.cols[w.cols.length - 1].many + ". " + (w.steps[0].need ? "The top digit is smaller, so exchange: " + w.steps[0].exSay + " " : "") + w.steps[0].say },
    worked: { text: w.text + " " + sumText(a, op, b) + " = " + w.ansText + ".", pic: { k: "dcol", a: a, b: b, op: op, ans: true } },
    yes: sumText(a, op, b) + " = " + w.ansText + ".",
    key: w.ansText, fill: js.map(j => String(w.ansDigits[j]))
  };
};

/* Solve it: "Calculate." with one line for each part */
M.dsum = function (d) {
  const it = d.items.map(x => ({ a: x.a, b: x.b, op: x.op, w: work(x.a, x.b, x.op) })), one = it.length === 1;
  return {
    q: "Calculate.", marks: it.length,
    lines: it.map((x, i) => abc(it.length, i) + sumText(x.a, x.op, x.b) + " = {" + i + "}"),
    blanks: it.map(() => ({ len: 6, w: "big", dec: 3 })),
    check(r) {
      const parts = it.map((x, i) => D.eq(r.v[i], x.w.ans));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (one ? "" : "Look at (" + "abc"[i] + "). ") + sumSlip(it[i].a, it[i].b, it[i].op, r.v[i]), parts: parts };
    },
    hint: { pic: it.map(x => ({ k: "dcol", a: x.a, b: x.b, op: x.op })), step: "Write the numbers in columns. Line up the decimal points. Write 0 in an empty place. Start on the right." },
    worked: { text: it.map(x => sumText(x.a, x.op, x.b) + " = " + x.w.ansText).join(". ") + "." + (one ? " " + it[0].w.text : ""), pic: one ? { k: "dcol", a: it[0].a, b: it[0].b, op: it[0].op, ans: true } : it.map(x => ({ k: "dcol", a: x.a, b: x.b, op: x.op, ans: true })) },
    yes: it.map(x => sumText(x.a, x.op, x.b) + " = " + x.w.ansText).join(" and ") + ".",
    key: it.map(x => x.w.ansText).join(" ; "), fill: it.map(x => x.w.ansText.replace(/,/g, ""))
  };
};

/* a missing number in an addition or a subtraction */
M.dmiss = function (d) {
  const it = d.items.map(x => {
    const w = work(x.a, x.b, x.op), c = w.ansText, tell = sumText(x.a, x.op, x.b) + " = " + c;
    const hideA = x.hide === "a", want = D.p(hideA ? x.a : x.b), other = hideA ? x.b : x.a;
    /* how to find it: the inverse (a = c − b or c + b); for a − ? = c the missing number is the difference a − c */
    const back = x.op === "+" ? c + " − " + other : hideA ? c + " + " + other : other + " − " + c;
    const how = (x.op === "-" && !hideA ? "The missing number is the difference: work out " : "Use the inverse: work out ") + back + ".";
    const fwd = x.op === "+" ? D.p(c) + D.p(other) : hideA ? D.p(c) - D.p(other) : D.p(other) + D.p(c);     /* the slip: the wrong way round */
    return { how: how, line: (hideA ? "{#} " + OPS[x.op] + " " + x.b : x.a + " " + OPS[x.op] + " {#}") + " = " + c, want: want, ans: String(hideA ? x.a : x.b), tell: tell, back: back, fwd: fwd,
      bw: x.op === "+" ? [c, other, "-"] : hideA ? [c, other, "+"] : [other, c, "-"],
      pic: x.op === "+" ? { k: "bar", whole: Number(c), parts: hideA ? [null, Number(x.b)] : [Number(x.a), null] } : hideA ? { k: "bar", whole: null, parts: [Number(x.b), Number(c)] } : { k: "bar", whole: Number(x.a), parts: [null, Number(c)] } };
  });
  return {
    q: it.length > 1 ? "Write the missing numbers." : "Write the missing number.", marks: it.length,
    lines: it.map((x, i) => abc(it.length, i) + x.line.replace("{#}", "{" + i + "}")),
    blanks: it.map(() => ({ len: 6, w: "box", dec: 3 })),
    check(r) {
      const parts = it.map((x, i) => D.eq(r.v[i], x.want));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), x = it[i], v = D.p(r.v[i]);
      const msg = v === x.fwd && x.fwd >= 0 ? "That is the wrong way round. Work out " + x.back + "." : v === x.want ? "" : x.how + " " + (isNaN(v) ? "" : sumSlip(x.bw[0], x.bw[1], x.bw[2], r.v[i]));
      return { ok: false, msg: (it.length > 1 ? "Look at (" + "abc"[i] + "). " : "") + msg, parts: parts };
    },
    hint: { pic: it.map(x => x.pic), step: it.map((x, i) => (it.length > 1 ? "(" + "abc"[i] + ") " : "") + x.how).join(" ") + " Line up the decimal points." },
    worked: { text: it.map(x => x.back + " = " + x.ans + ". Check: " + x.tell).join(". ") + "." },
    yes: it.map(x => x.tell).join(" and ") + ".",
    key: it.map(x => x.ans).join(" ; "), fill: it.map(x => x.ans)
  };
};

/* a real-life problem with decimals: one or two steps */
M.dstory = function (d) {
  const pre = d.pre || "", dp = d.dp, sh = t => pre + D.s(t, dp), T = x => D.p(x), unit = d.unit || "";
  const u = t => (pre ? sh(t) : D.s(t, dp) + (unit ? " " + unit : ""));
  let ans, calcs, step, sl = [], last, bar = null;
  const add = xs => xs.reduce((s, x) => s + T(x), 0);
  if (d.kind === "add") {
    ans = add(d.nums); calcs = [d.nums.join(" + ") + " = " + D.s(ans, dp)];
    step = "Add the numbers. Line up the decimal points.";
    last = d.nums.length === 2 ? [d.nums[0], d.nums[1], "+"] : null; bar = { k: "bar", whole: null, parts: d.nums.map(Number) };
    if (d.nums.length === 2) sl.push([Math.abs(T(d.nums[0]) - T(d.nums[1])), "You subtracted. Here you must add."]);
  } else if (d.kind === "sub") {
    ans = T(d.a) - T(d.b); calcs = [d.a + " − " + d.b + " = " + D.s(ans, dp)];
    step = "Subtract " + d.b + " from " + d.a + ". Line up the decimal points.";
    last = [d.a, d.b, "-"]; bar = { k: "bar", whole: Number(d.a), parts: [Number(d.b), null] };
    sl.push([T(d.a) + T(d.b), "You added. Here you must find the difference: subtract."]);
  } else if (d.kind === "change") {
    const tot = add(d.items); ans = T(d.have) - tot;
    calcs = [d.items.join(" + ") + " = " + D.s(tot, dp), d.have + " − " + D.s(tot, dp) + " = " + D.s(ans, dp)];
    step = "There are two steps. First add: " + d.items.join(" + ") + ". Then subtract the total from " + d.have + ".";
    last = [String(d.have), D.s(tot, dp), "-"]; bar = { k: "bar", whole: Number(d.have), parts: d.items.map(Number).concat([null]) };
    sl.push([tot, "That is the total, " + u(tot) + ". Now subtract it from " + u(T(d.have)) + "."]);
    d.items.forEach(x => sl.push([T(d.have) - T(x), "You subtracted only " + u(T(x)) + ". Subtract all of them."]));
    sl.push([T(d.have) + tot, "Do not add everything. Subtract the total from " + u(T(d.have)) + "."]);
  } else if (d.kind === "left") {
    const used = T(d.each) * d.n; ans = T(d.start) - used;
    const rep = []; for (let i = 0; i < d.n; i++) rep.push(d.each);
    calcs = [rep.join(" + ") + " = " + D.s(used, dp), d.start + " − " + D.s(used, dp) + " = " + D.s(ans, dp)];
    step = "There are two steps. First find how much is used: " + rep.join(" + ") + ". Then subtract it from " + d.start + ".";
    last = [String(d.start), D.s(used, dp), "-"]; bar = { k: "bar", whole: Number(d.start), parts: rep.map(Number).concat([null]) };
    sl.push([T(d.start) - T(d.each), "You subtracted only one lot of " + d.each + ". There are " + d.n + " of them."]);
    sl.push([used, "That is how much is used, " + u(used) + ". How much is left? Subtract it from " + d.start + "."]);
    sl.push([T(d.start) + used, "Do not add. Subtract " + D.s(used, dp) + " from " + d.start + "."]);
  } else {
    const second = d.more ? T(d.a) + T(d.d) : T(d.a) - T(d.d); ans = T(d.a) + second;
    calcs = [d.a + (d.more ? " + " : " − ") + d.d + " = " + D.s(second, dp), d.a + " + " + D.s(second, dp) + " = " + D.s(ans, dp)];
    step = "There are two steps. First find the second amount: " + d.a + (d.more ? " + " : " − ") + d.d + ". Then add the two amounts.";
    last = [String(d.a), D.s(second, dp), "+"];
    sl.push([second, "That is only the second amount, " + u(second) + ". Now add the first amount, " + u(T(d.a)) + "."]);
    sl.push([T(d.a) + T(d.d), d.more ? "That is only the second amount. Now add the first amount, " + u(T(d.a)) + "." : "Read again: it is " + d.d + " less, not more."]);
    sl.push([d.more ? T(d.a) - T(d.d) : T(d.a) + T(d.d), "Read the words again: more or less?"]);
  }
  if (isNaN(ans) || ans < 0) throw new Error("dstory: bad numbers");
  const a = D.s(ans, dp);
  return {
    q: d.text,
    lines: [pre + "{0}" + (unit ? " " + unit : "")], blanks: [{ len: 6, w: "big", dec: 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (v === ans) return { ok: true };
      const s = sl.find(x => x[0] === v && x[0] !== ans);
      return { ok: false, msg: s ? s[1] : calcs.length > 1 ? step : (last ? sumSlip(last[0], last[1], last[2], r.v[0]) : step), parts: [false] };
    },
    hint: { pic: bar, step: step },
    worked: { text: calcs.join(". ") + ". The answer is " + u(ans) + ".", pic: last ? { k: "dcol", a: last[0], b: last[1], op: last[2], ans: true } : null },
    yes: calcs.join(". ") + ".",
    key: a, fill: [a.replace(/,/g, "")]
  };
};

/* spot the mistake in a written calculation, then write the correct answer */
M.dcolfix = function (d) {
  const a = d.a, b = d.b, op = d.op, who = d.who, w = work(a, b, op), s = slips(a, b, op), wrongT = s[d.slip];
  if (wrongT == null) throw new Error("dcolfix: the slip " + d.slip + " does not change " + sumText(a, op, b));
  const wrong = D.s(wrongT, w.dp), did = op === "+" ? "add" : "subtract", last = w.cols[w.cols.length - 1], pro = d.pro || "they";
  const TRUE = {
    right: "The decimal points are not in a line. Tenths must be under tenths.",
    nozero: who + " did not write " + a + " as " + D.s(D.p(a), w.dp) + ", so " + pro + " did not exchange in the " + last.many + ".",
    noex: who + " did not exchange. " + who + " took the smaller digit from the bigger digit each time.",
    nocarry: who + " did not carry 1 to the next column."
  };
  const WORK = {
    right: who + " lined up the last digits, so tenths were under " + last.many + ".",
    nozero: who + " left the " + last.many + " place of " + a + " empty and wrote the " + D.digit(D.p(b), last.k) + " down.",
    noex: who + " took the smaller digit from the bigger digit and did not exchange.",
    nocarry: who + " forgot the carried 1."
  };
  const reasons = [{ t: TRUE[d.slip], ok: true },
    { t: who + (op === "+" ? " subtracted the numbers." : " added the numbers."), why: "Look at each column again. " + who + " did " + did + "." },
    d.slip === "right" ? { t: who + " forgot the decimal point in the answer.", why: "The answer has a decimal point. Look at the decimal points of the two numbers." }
      : { t: "The decimal points are not in a line.", why: "Look again. The decimal points are in a line, and tenths are under tenths." }];
  const opts = arrange(reasons.map(x => ({ html: x.t, ok: !!x.ok, why: x.why || "" })), d.at);
  return {
    q: who + " works out <b>" + sumText(a, op, b) + "</b> like this. The answer is wrong.", marks: 2, ab: true,
    fig: { k: "dcol", a: a, b: b, op: op, lined: d.slip !== "right", zeros: d.slip !== "nozero" && d.slip !== "right", shown: wrong },
    sub: "What is the mistake? Tick (✓) one box.", letters: true, opts: opts,
    abAsk: "Write the correct answer.",
    lines: [sumText(a, op, b) + " = {0}"], blanks: [{ len: 6, w: "big", dec: 3 }],
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null && x.slice(-1) !== "."),
    check(r) {
      const o = opts[r.pick], pickOk = !!(o && o.ok), v = D.p((r.v || [])[0]), vOk = v === w.ans;
      if (pickOk && vOk) return { ok: true, parts: [true], pickOk: true };
      const msg = !pickOk ? (o && o.why ? o.why : "Read the three boxes again.") + (vOk ? "" : " Then work it out again in columns.") :
        v === wrongT ? "That is " + who + "'s answer, and it is wrong. Work it out again in columns." :
        "The mistake is right. Now work it out again. " + sumSlip(a, b, op, (r.v || [])[0]);
      return { ok: false, msg: msg, parts: [vOk], pickOk: pickOk };
    },
    hint: { pic: { k: "dcol", a: a, b: b, op: op }, step: "Set the calculation out again. Line up the decimal points. " +
      (d.slip === "noex" ? "When the top digit is smaller, exchange." : "Write 0 in an empty place.") + " Then compare with " + who + "'s working." },
    worked: { text: WORK[d.slip] + " The right way: " + w.text + " So " + sumText(a, op, b) + " = " + w.ansText + ", not " + wrong + ".", pic: { k: "dcol", a: a, b: b, op: op, ans: true } },
    yes: sumText(a, op, b) + " = " + w.ansText + ".", key: w.ansText, fill: [w.ansText.replace(/,/g, "")]
  };
};
})();

