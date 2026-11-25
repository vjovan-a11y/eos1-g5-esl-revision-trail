/* 07-g5-models-base.js - Grade 5 (Cambridge Stage 6): what every Grade 5 question model shares.
   Loaded after the Maths v2 models (window.MX, in 06-art-world-2.js). No page code here.

   MX.D        exact decimals. Every decimal is kept as a whole number of THOUSANDTHS, so 0.1 + 0.2 is 0.3.
     D.p(x)            '4.2' | 4.2 | '−0.63' -> 4200 | -630 (NaN when x is not a number)
     D.s(t, dp)        4200 -> '4.2'; with dp: D.s(4200, 2) -> '4.20'. Commas in the thousands, a real minus sign.
     D.eq(typed, t)    is the typed answer worth t thousandths? ('0.60' is 0.6)
     D.dp(x)           how many decimal places x is written with: '6.85' -> 2
     D.digit(t, k)     the digit of t in place k ('h','t','o','te','hu','ths': hundreds ... thousandths); D.PL the six
                       places, big to small: { k, v (in thousandths), one, many, ab, col, fr }; D.val(7, 'hu') -> '0.07'
   MX.F(n, d)  a fraction on the page (from the v2 Stop 7 models); MX.FB(i, j) two answer boxes, one over the other
   MX.gcd, MX.lcm

   Two models for questions that are written out in the data (use them for ideas and words; for anything that is
   a calculation, write a model that works the answer out from the numbers):
   mcq   { type: 'mcq', q, opts: [right, wrong, wrong, (wrong)], at: 2, whys: [null, why, why, (why)],
           sub?, letters?, fig?, hint: { pic?, step }, worked: 'text' | { text, pic }, yes? }
         opts[0] is the right answer; `at` says where it is shown (0 = first). whys[i] is said when opts[i] is picked.
   fill  { type: 'fill', q, lines: ['4.2 − 1.26 = {0}'], ans: ['2.94'], blanks?: [{ len, w, dec, neg }],
           slips?: [['3.57', 'You took away only one glass.']], msg?, sub?, fig?, hint, worked, yes?, unit? }
         Each answer is a number (compared by value: 2.940 = 2.94) or one of < > = (a sym box).
         A fraction: write MX.FB(0, 1) in the line and give ans: ['2', '3'] (top, bottom: both must match). */
(function () {
"use strict";
const M = MX.M, arrange = MX.arrange, LET = MX.LET;

/* ---------- exact decimals (thousandths) ---------- */
const PL = [
  { k: "h", v: 100000, one: "hundred", many: "hundreds", ab: "H", col: "Hundreds" },
  { k: "t", v: 10000, one: "ten", many: "tens", ab: "T", col: "Tens" },
  { k: "o", v: 1000, one: "one", many: "ones", ab: "O", col: "Ones" },
  { k: "te", v: 100, one: "tenth", many: "tenths", ab: "t", col: "Tenths", fr: 10 },
  { k: "hu", v: 10, one: "hundredth", many: "hundredths", ab: "h", col: "Hundredths", fr: 100 },
  { k: "ths", v: 1, one: "thousandth", many: "thousandths", ab: "th", col: "Thousandths", fr: 1000 }];
const PLK = {}; PL.forEach((p, i) => { PLK[p.k] = i; });
const D = {
  PL: PL, PLK: PLK,
  p(x) {
    const s = String(x).replace(/−/g, "-").replace(/,/g, "").trim();
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    const neg = s[0] === "-", parts = s.replace("-", "").split(".");
    const t = +(parts[0] || 0) * 1000 + +((parts[1] || "") + "000").slice(0, 3);
    if ((parts[1] || "").length > 3 && /[1-9]/.test(parts[1].slice(3))) return NaN;       /* finer than thousandths */
    return neg ? -t : t;
  },
  s(t, dp) {
    const neg = t < 0, a = Math.abs(Math.round(t)), whole = Math.floor(a / 1000);
    let frac = String(a % 1000).padStart(3, "0");
    if (dp == null) frac = frac.replace(/0+$/, ""); else frac = frac.slice(0, dp);
    return (neg ? "−" : "") + MX.fmt(whole) + (frac ? "." + frac : "");
  },
  eq(typed, t) { const v = D.p(typed); return typed !== "" && v === t; },
  dp(x) { const s = String(x); return s.indexOf(".") < 0 ? 0 : s.length - s.indexOf(".") - 1; },
  digit(t, k) { return Math.floor(Math.abs(t) / PL[PLK[k]].v) % 10; },
  /* the value of a digit in a place, as text: (7, 'hu') -> '0.07' */
  val(d, k) { return D.s(d * PL[PLK[k]].v); }
};
MX.D = D;

if (!MX.F) MX.F = (n, d) => '<span class="fr"><i>' + n + '</i><span class="frs">/</span><i>' + d + "</i></span>";
MX.FB = (i, j) => '<span class="frb">{' + i + '}<span class="frl"></span>{' + j + "}</span>";
MX.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const r = a % b; a = b; b = r; } return a; };
MX.lcm = (a, b) => a / MX.gcd(a, b) * b;
MX.SYMH = { "<": "&lt;", ">": "&gt;", "=": "=" };

/* ---------- a question with one right option, written out in the data ---------- */
M.mcq = function (d) {
  const whys = d.whys || [];
  const opts = arrange(d.opts.map((t, i) => (typeof t === "string" ? { html: t } : Object.assign({}, t)))
    .map((o, i) => Object.assign(o, { ok: i === 0, why: i === 0 ? "" : whys[i] || "" })), d.at);
  const right = opts.findIndex(o => o.ok), w = typeof d.worked === "string" ? { text: d.worked } : d.worked || {};
  return {
    q: d.q, sub: d.sub || "Tick (✓) one box.", letters: !!d.letters, opts: opts, fig: d.fig || null,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why || d.msg || "Look again." }; },
    hint: d.hint || null,
    worked: { text: w.text || "", pic: w.pic || null },
    yes: d.yes || "",
    key: (d.letters ? LET[right] + ": " : "") + String(d.opts[0].html || d.opts[0]).replace(/<[^>]+>/g, "")
  };
};

/* ---------- a question with answer boxes, written out in the data ---------- */
M.fill = function (d) {
  const ans = d.ans.map(String);
  const blanks = ans.map((a, i) => {
    const sym = /^[<>=]$/.test(a), given = (d.blanks && d.blanks[i]) || {};
    if (sym) return Object.assign({ len: 1, w: "sym", sym: true }, given);
    const digits = a.replace(/[^0-9]/g, "").length;
    return Object.assign({ len: Math.max(4, digits + 2), w: "big", neg: a[0] === "-" || !!d.neg, dec: a.indexOf(".") >= 0 || d.dec ? 3 : 0 }, given);
  });
  const want = ans.map((a, i) => (blanks[i].sym ? a : D.p(a)));
  const w = typeof d.worked === "string" ? { text: d.worked } : d.worked || {};
  return {
    q: d.q, sub: d.sub || "", marks: d.marks || 1, lines: d.lines, blanks: blanks, fig: d.fig || null,
    check(r) {
      const parts = want.map((x, i) => (blanks[i].sym ? r.v[i] === x : D.eq(r.v[i], x)));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      const slip = (d.slips || []).find(s => !blanks[i].sym && D.eq(r.v[i], D.p(s[0])) && (s[2] == null || s[2] === i));
      return { ok: false, msg: slip ? slip[1] : d.msg || "Check your answer again.", parts: parts };
    },
    hint: d.hint || null,
    worked: { text: w.text || "", pic: w.pic || null },
    yes: d.yes || "",
    key: ans.join(" ; "), fill: ans.slice()
  };
};
})();

