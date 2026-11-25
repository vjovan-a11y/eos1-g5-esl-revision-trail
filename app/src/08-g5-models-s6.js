/* 08-g5-models-s6.js - Grade 5 question models for Stop 6: fractions, decimals and percentages with equal values
   (6Nf.04), percentages of shapes and of whole numbers (6Nf.07), comparing and ordering them (6Nf.08).
   Every answer is worked out here from the numbers in the data. A quantity is written in the data as text:
   '3/5' (a fraction), '0.45' (a decimal with one or two decimal places) or '70%' (a percentage). MX.Q6(text) keeps it
   exact as a numerator and a denominator ({ kind: 'f' | 'd' | 'p', n, d, h: hundredths or null, text, html });
   two quantities are compared by cross-multiplying (MX.Q6.cmp). No floating point anywhere.

   pshade   { v: '35%', r?: 4, c?: 5 }                      shade v of the hundred square (tool pgrid), or of a small
                                                            shape with r rows and c columns (tool pcells: tap the parts)
   pread    { shade: 37 }                                   a hundred square with 37 squares shaded: write the
                                                            fraction, the decimal and the percentage
   pconv    { items: [{ v: '3/4', ask?: 'dp' }, ...] }      write v in the other forms (f fraction, d decimal,
                                                            p percentage); ask defaults to the two other forms
   psame    { v: '0.4', opts: ['2/5', '4%', '1/4'], at }    which is equal to v? (opts[0] must be the only equal one)
   pshape   { r, c, shade, not?: true }                     what percentage of the shape is shaded (or not shaded)?
   pof      { items: [{ p: 25, n: 80 }], text?, unit?, pre?, bar?: true }   p% of n: "Calculate." lines, or (with text) a
                                                            story; bar: the percentage bar is shown with the question
   pchange  { text, n, p, dir: 'less' | 'more', unit?, pre?, labs?: ['Discount', 'New price'] }
                                                            a two-step problem: p% less or more than n (labs: two boxes)
   pcmp     { items: [{ a: '3/5', b: '0.55' }], line?: true }   write < > or = (line: with the number line tool)
   lplace   { v: '3/5', scale?: 'd' | 'p' }                 move the arrow to v on the 0 to 1 number line (tool fdpmove)
   porder   { items: ['3/10', '0.25', '35%'], dir?: 'asc' | 'desc' }   put the cards in order (tool ftiles)
   pordopt  { items, dir?, at }                             which list is in ascending / descending order? (options)
   pext     { items, ask: 'greatest' | 'smallest' }         tick the greatest / smallest of a mixed set
   pwho     { text, a: { who, v }, b: { who, v }, ask?: 'more' | 'less', same?: 'text of the third option' }
                                                            a "who has more" story: two names and "the same" */
(function () {
"use strict";
const M = MX.M, D = MX.D, F = MX.F, fmt = MX.fmt, arrange = MX.arrange, cap = MX.cap, gcd = MX.gcd, lcm = MX.lcm, SYMH = MX.SYMH;

/* ---------- exact quantities ---------- */
function Q(x) {
  if (x && typeof x === "object" && x.kind) return x;
  const s = String(x).trim();
  let m, kind, n, d;
  if ((m = /^(\d+)\s*\/\s*(\d+)$/.exec(s))) { kind = "f"; n = +m[1]; d = +m[2]; }
  else if ((m = /^(\d+)\s*%$/.exec(s))) { kind = "p"; n = +m[1]; d = 100; }
  else if (/^\d+(\.\d{1,2})?$/.test(s)) { kind = "d"; n = D.p(s) / 10; d = 100; }
  else throw new Error("Q: not a fraction, a decimal or a percentage: " + s);
  if (!d) throw new Error("Q: the denominator is 0: " + s);
  const text = kind === "f" ? n + "/" + d : kind === "p" ? n + "%" : s;
  return { kind: kind, n: n, d: d, h: (n * 100) % d === 0 ? n * 100 / d : null, text: text, html: kind === "f" ? F(n, d) : text };
}
Q.cmp = (a, b) => Math.sign(a.n * b.d - b.n * a.d);
MX.Q6 = Q;
const need = q => { if (q.h == null) throw new Error("Q: " + q.text + " is not a whole number of hundredths"); return q; };
const decOf = h => D.s(h * 10);                                   /* 60 -> '0.6', 7 -> '0.07' */
const simp = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
const FBX = (i, j) => '<span class="frb s6-frb">{' + i + '}<span class="frl s6-frl"></span>{' + j + "}</span>";
const abc = (i, many) => (many ? "<i>(" + "abc"[i] + ")</i> " : "");
const look = (i, many) => (many ? "Look at (" + "abc"[i] + "). " : "");
const num = v => (v === "" || v == null || isNaN(+v) ? NaN : +v);

/* '3/5 = 60/100 = 60%' : how a quantity becomes a percentage */
function toPct(q) {
  need(q);
  if (q.kind === "p") return q.html;
  if (q.kind === "d") return q.text + " = " + q.h + "%";
  return q.html + (q.d === 100 ? "" : " = " + F(q.h, 100)) + " = " + q.h + "%";
}
/* all the equal forms of a quantity in one line */
function chain(q) {
  need(q);
  const s = simp(q.h, 100), f100 = F(q.h, 100), fs = s[1] !== 100 ? " = " + F(s[0], s[1]) : "";
  if (q.kind === "f") return q.html + (q.d === 100 ? "" : " = " + f100) + " = " + decOf(q.h) + " = " + q.h + "%";
  if (q.kind === "d") return q.text + " = " + f100 + fs + " = " + q.h + "%";
  return q.text + " = " + f100 + fs + " = " + decOf(q.h);
}
/* why a is less than, greater than or equal to b */
function cmpWhy(a, b) {
  const s = Q.cmp(a, b), word = s < 0 ? "less than" : s > 0 ? "greater than" : "equal to";
  if (a.kind === "f" && b.kind === "f") {
    if (a.d === b.d) return "The denominators are the same. " + a.n + " is " + word + " " + b.n + ".";
    const L = lcm(a.d, b.d), x = a.n * L / a.d, y = b.n * L / b.d;
    const eq = (q, t) => (q.d === L ? "" : q.html + " = " + F(t, L));
    return "Use the same denominator, " + L + ". " + [eq(a, x), eq(b, y)].filter(Boolean).join(" and ") + ". " + F(x, L) + " is " + word + " " + F(y, L) + ".";
  }
  need(a); need(b);
  const conv = [a, b].filter(q => q.kind !== "p").map(toPct);
  if (s === 0) return (conv.length ? conv.join(" and ") + ". " : "") + "Both are " + a.h + "%.";
  return (conv.length ? conv.join(" and ") + ". " : "") + a.h + "% is " + word + " " + b.h + "%.";
}
const symOf = (a, b) => { const s = Q.cmp(a, b); return s < 0 ? "<" : s > 0 ? ">" : "="; };
const listPct = qs => qs.map(q => (q.kind === "p" ? q.text : q.html + " = " + q.h + "%")).join(", ");

/* ---------- the hundred square and shapes ---------- */
M.pshade = function (d, mode) {
  const q = need(Q(d.v)), small = !!(d.r && d.c), T = small ? d.r * d.c : 100;
  if ((q.h * T) % 100) throw new Error("pshade: " + q.text + " of " + T + " parts is not a whole number of parts");
  const want = q.h * T / 100, s = simp(q.h, 100), one = T / s[1];
  const workedSmall = "The shape has " + T + " equal parts. " + (q.kind === "f" && q.d === s[1] ? "" : q.html + " = " + F(s[0], s[1]) + ". ") +
    (s[1] === 1 ? "That is the whole shape: " : T + " ÷ " + s[1] + " = " + one + ". " + (s[0] === 1 ? "" : s[0] + " × " + one + " = " + want + ". ") + "Shade ") + want + (want === 1 ? " part." : " parts.");
  const worked100 = (q.kind === "p" ? q.h + "% means " + q.h + " out of 100. " : toPct(q) + ". ") + "Shade " + q.h + " of the 100 squares" +
    (q.h >= 10 ? ": " + Math.floor(q.h / 10) + (q.h >= 20 ? " whole columns" : " whole column") + (q.h % 10 ? " and " + (q.h % 10) + " more" : "") + "." : ".");
  return {
    q: "Shade <b>" + q.html + "</b> of the " + (small ? "shape." : "hundred square."),
    how: small ? "Tap a part to shade it. Tap it again to take the colour away." : mode === "our" ? "Let's do it together. One column is 10 squares. Tap + 10 or + 1." : "Tap + 10 for a whole column. Tap + 1 for one square.",
    ui: small ? { k: "pcells", r: d.r, c: d.c } : { k: "pgrid", show: mode === "our" ? "nfdp" : "n" },
    right: { shade: want },
    ready: r => r.shade > 0,
    given: r => String(r.shade),
    check(r) {
      if (r.shade === want) return { ok: true };
      if (small) {
        if (r.shade === q.h || (q.kind === "f" && r.shade === q.n && q.d !== T)) return { ok: false, msg: "The shape has " + T + " parts, not " + (r.shade === q.h ? 100 : q.d) + ". Find " + q.html + " of " + T + "." };
        return { ok: false, msg: "All " + T + " parts are 100%. " + (s[1] === 1 ? "" : "Share " + T + " into " + s[1] + " equal groups.") };
      }
      if (q.kind === "f" && r.shade === q.n) return { ok: false, msg: "That is " + F(q.n, 100) + ". Make an equal fraction with the denominator 100: " + q.html + " = " + F("?", 100) + "." };
      if (q.kind === "d" && q.h % 10 === 0 && r.shade === q.h / 10) return { ok: false, msg: q.text + " is " + q.h / 10 + " tenths. One tenth is a whole column of 10 squares." };
      if (q.kind === "d" && q.h < 10 && r.shade === q.h * 10) return { ok: false, msg: q.text + " is " + q.h + " hundredths. One hundredth is one small square." };
      return { ok: false, msg: q.kind === "p" ? q.h + "% means " + q.h + " out of 100. Count your squares again." : q.kind === "f" ? "Make the denominator 100: " + q.html + " = " + F("?", 100) + "." : "How many hundredths is " + q.text + "? One small square is 1 hundredth." };
    },
    hint: { step: small ? "All " + T + " parts are 100%." + (s[1] === 1 ? "" : " " + q.html + (q.kind === "f" && q.d === s[1] ? "" : " = " + F(s[0], s[1])) + ": share " + T + " into " + s[1] + " equal groups.") : q.kind === "p" ? "Per cent means out of 100. " + q.h + "% is " + q.h + " squares out of 100." : q.kind === "f" ? "Make the denominator 100: " + q.html + " = " + F("?", 100) + "." : "One small square is 0.01. One column is 0.1." },
    worked: { text: small ? workedSmall : worked100, pic: small ? { k: "pgrid", r: d.r, c: d.c, shade: want } : { k: "hgrid", shade: want, cols: true } },
    yes: small ? want + " of the " + T + " parts is " + q.text + "." : q.h + " squares out of 100 is " + q.text + ".",
    key: want + (small ? (want === 1 ? " part" : " parts") : " squares")
  };
};

M.pread = function (d) {
  const h = d.shade, s = simp(h, 100);
  if (!(h > 0 && h <= 100)) throw new Error("pread: shade 1 to 100");
  const blanks = [{ len: 3, w: "s6fr" }, { len: 3, w: "s6fr" }, { len: 4, w: "mid", dec: 2 }, { len: 3, w: "mid" }];
  return {
    q: "What part of the hundred square is shaded? Write it in three ways.", marks: 3,
    fig: { k: "pgrid", shade: h },
    lines: ["Fraction: " + FBX(0, 1), "Decimal: {2}", "Percentage: {3} %"], blanks: blanks,
    check(r) {
      const a = num(r.v[0]), b = num(r.v[1]);
      const fOk = b > 0 && a * 100 === h * b, dOk = D.eq(r.v[2], h * 10), pOk = num(r.v[3]) === h;
      const parts = [fOk, fOk, dOk, pOk];
      if (fOk && dOk && pOk) return { ok: true, parts: parts, note: b !== s[1] && s[1] !== 100 ? F(a, b) + " = " + F(s[0], s[1]) + " in its simplest form." : "" };
      if (!fOk) return { ok: false, msg: "Count the shaded squares. That number goes on top. All 100 squares go on the bottom.", parts: parts };
      if (!dOk) return { ok: false, msg: D.eq(r.v[2], h * 1000) ? "A decimal less than 1 starts with 0 and a decimal point. " + h + " squares is " + h + " hundredths." : h + " squares is " + h + " hundredths. " + (h < 10 ? "Hundredths go in the second decimal place: write 0 in the tenths place." : "Write the tenths, then the hundredths."), parts: parts };
      return { ok: false, msg: "Per cent means out of 100. How many squares out of 100 are shaded?", parts: parts };
    },
    hint: { step: "One column is 10 squares. Count the whole columns, then the squares left over. Each square is " + F(1, 100) + " = 0.01 = 1%." },
    worked: { text: h + " of the 100 squares are shaded. " + F(h, 100) + (s[1] !== 100 ? " (= " + F(s[0], s[1]) + ")" : "") + " = " + decOf(h) + " = " + h + "%." },
    yes: F(h, 100) + " = " + decOf(h) + " = " + h + "%.",
    key: h + "/100 ; " + decOf(h) + " ; " + h + "%", fill: [String(h), "100", decOf(h), String(h)]
  };
};

M.pshape = function (d) {
  const T = d.r * d.c, k = 100 / T;
  if (100 % T) throw new Error("pshape: the number of parts must divide 100");
  const sh = d.shade * k, want = d.not ? 100 - sh : sh, cnt = d.not ? T - d.shade : d.shade;
  return {
    q: "The shape has <b>" + T + "</b> equal parts. What [[percentage]] of the shape is " + (d.not ? "<b>not</b> shaded?" : "shaded?"),
    fig: { k: "pgrid", r: d.r, c: d.c, shade: d.shade },
    lines: ["{0} %"], blanks: [{ len: 3, w: "mid" }],
    check(r) {
      const v = num(r.v[0]);
      if (v === want) return { ok: true };
      if (v === 100 - want) return { ok: false, msg: "That is the part that is " + (d.not ? "shaded" : "not shaded") + ". Read the question again.", parts: [false] };
      if (v === cnt) return { ok: false, msg: "That is the number of parts. The shape has " + T + " parts, not 100. Make the denominator 100.", parts: [false] };
      if (v === T) return { ok: false, msg: T + " is the number of parts in the whole shape. The whole shape is 100%.", parts: [false] };
      return { ok: false, msg: "Write the fraction " + F(cnt, T) + " first. Then make the denominator 100.", parts: [false] };
    },
    hint: { step: cnt + " of the " + T + " parts are " + (d.not ? "not shaded" : "shaded") + ": " + F(cnt, T) + ". " + T + " × " + k + " = 100, so multiply the top and the bottom by " + k + "." },
    worked: { text: cnt + " of the " + T + " parts are " + (d.not ? "not shaded" : "shaded") + ". " + F(cnt, T) + (k === 1 ? "" : " = " + F(cnt * k, 100)) + " = " + want + "%." },
    yes: F(cnt, T) + (k === 1 ? "" : " = " + F(cnt * k, 100)) + " = " + want + "%.",
    key: want + "%", fill: [String(want)]
  };
};

/* ---------- equal values: fraction, decimal, percentage ---------- */
function convSlip(q, k, v1) {
  const v = num(v1), t = D.p(v1);
  if (k === "p") {
    if (q.kind === "d") {
      if (q.h % 10 === 0 && v === q.h / 10) return q.text + " is " + v + " tenths. That is " + q.h + " hundredths.";
      if (v === q.h * 10) return q.text + " is " + q.h + " hundredths. Per cent means out of 100.";
      return "Multiply the decimal by 100 to make a percentage.";
    }
    if (v === q.n || v === q.d) return "Per cent means out of 100. Make the denominator 100 first: " + q.html + " = " + F("?", 100) + ".";
    return "Make an equal fraction with the denominator 100: " + q.html + " = " + F("?", 100) + ".";
  }
  if (k === "d") {
    if (q.h < 10 && t === q.h * 100) return q.h + (q.h === 1 ? " hundredth" : " hundredths") + " is not " + q.h + (q.h === 1 ? " tenth" : " tenths") + ". Write 0 in the tenths place.";
    if (t === q.h * 1000) return "A percentage is out of 100. Divide " + q.h + " by 100 to make the decimal.";
    return q.kind === "f" ? "Make the denominator 100: " + q.html + " = " + F("?", 100) + ". Then write the hundredths as a decimal." : q.h + "% = " + F(q.h, 100) + ". Divide " + q.h + " by 100.";
  }
  return q.kind === "d" ? "Read the decimal: " + q.text + " is " + (q.h % 10 === 0 ? q.h / 10 + " tenths." : q.h + " hundredths.") + " Write that as a fraction." : q.h + "% means " + q.h + " out of 100. Write that as a fraction.";
}
M.pconv = function (d) {
  const blanks = [], fill = [], units = [], many = d.items.length > 1, keys = [];
  const lines = d.items.map((x, i) => {
    const q = need(Q(x.v)), ask = (x.ask || "fdp".replace(q.kind, "")).split("");
    let line = abc(i, many) + q.html;
    ask.forEach(k => {
      const at = blanks.length, s = simp(q.h, 100);
      if (k === q.kind) throw new Error("pconv: " + q.text + " is given in that form");
      if (k === "f") { blanks.push({ len: 3, w: "s6fr" }, { len: 3, w: "s6fr" }); fill.push(String(s[0]), String(s[1])); line += " = " + FBX(at, at + 1); keys.push(s[0] + "/" + s[1]); }
      else if (k === "d") { blanks.push({ len: 4, w: "mid", dec: 2 }); fill.push(decOf(q.h)); line += " = {" + at + "}"; keys.push(decOf(q.h)); }
      else { blanks.push({ len: 3, w: "mid" }); fill.push(String(q.h)); line += " = {" + at + "} %"; keys.push(q.h + "%"); }
      units.push({ q: q, k: k, at: at, i: i });
    });
    return line;
  });
  if (blanks.length > 10) throw new Error("pconv: at most 10 answer boxes");
  const qs = d.items.map(x => Q(x.v));
  return {
    q: blanks.length > 1 ? "Write the missing numbers." : "Write the missing number.", marks: units.length,
    lines: lines, blanks: blanks,
    check(r) {
      const parts = blanks.map(() => false);
      let msg = "", note = "";
      units.forEach(u => {
        let ok;
        if (u.k === "f") {
          const a = num(r.v[u.at]), b = num(r.v[u.at + 1]), s = simp(u.q.h, 100);
          ok = b > 0 && a * 100 === u.q.h * b; parts[u.at] = parts[u.at + 1] = ok;
          if (ok && b !== s[1]) note = "You can simplify: " + F(a, b) + " = " + F(s[0], s[1]) + ".";
        } else if (u.k === "d") { ok = D.eq(r.v[u.at], u.q.h * 10); parts[u.at] = ok; }
        else { ok = num(r.v[u.at]) === u.q.h; parts[u.at] = ok; }
        if (!ok && !msg) msg = look(u.i, many) + convSlip(u.q, u.k, r.v[u.at]);
      });
      return parts.every(Boolean) ? { ok: true, parts: parts, note: note } : { ok: false, msg: msg, parts: parts };
    },
    hint: { pic: qs.length === 1 ? { k: "hgrid", shade: qs[0].h, cols: true, cap: qs[0].h + " out of 100" } : null,
      step: "Per cent means out of 100. " + qs.map(q => (q.kind === "f" ? "Make the denominator 100: " + q.html + " = " + F("?", 100) + "." : q.kind === "d" ? q.text + " is " + q.h + " hundredths." : q.h + "% is " + q.h + " hundredths.")).join(" ") },
    worked: { text: qs.map((q, i) => (many ? "(" + "abc"[i] + ") " : "") + chain(q)).join(". ") + ".", pic: qs.length === 1 ? { k: "hgrid", shade: qs[0].h, cols: true, cap: qs[0].h + " out of 100" } : null },
    yes: qs.map(chain).join(" and ") + ".",
    key: keys.join(" ; "), fill: fill
  };
};

M.psame = function (d) {
  const q = need(Q(d.v)), os = d.opts.map(x => need(Q(x)));
  if (os.filter(o => Q.cmp(o, q) === 0).length !== 1 || Q.cmp(os[0], q) !== 0) throw new Error("psame: exactly one option, the first, must be equal to " + q.text);
  const opts = arrange(os.map((o, i) => ({ html: o.html, alt: o.text, ok: i === 0, why: i === 0 ? "" : (o.h > 100 ? o.text + " is more than 1 whole" : chain(o)) + ". But " + (q.kind === "p" ? q.text + " = " + F(q.h, 100) + " = " + decOf(q.h) : toPct(q)) + "." })), d.at);
  return {
    q: "Which is [[equivalent]] to <b>" + q.html + "</b>?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "hgrid", shade: q.h, cols: true, cap: q.html }, step: "Change " + q.html + " into hundredths: " + (q.kind === "p" ? q.h + "% = " + F(q.h, 100) : toPct(q)) + ". Then change each answer into hundredths too." },
    worked: { text: chain(q) + ". So " + q.html + " and " + os[0].html + " are equal." },
    yes: q.html + " = " + os[0].html + ". Both are " + q.h + " hundredths.",
    key: os[0].text
  };
};

/* ---------- percentages of whole numbers ---------- */
/* how to find p% of n in steps a child can do in the head, and the bar picture that shows it */
function route(p, n) {
  const ans = n * p * 10, a = D.s(ans), N = fmt(n), t = D.s(n * 100), f = D.s(n * 50), q4 = D.s(n * 250);
  if (!(p > 0 && p <= 100) || (p !== 1 && p % 5)) throw new Error("percentage: 1% or a multiple of 5%, not " + p);
  if (p === 100) return { ans: ans, text: "100% is the whole amount: " + N + ".", bar: { n: n, parts: 1, take: 1 }, first: "100% is the whole amount." };
  if (p === 50) return { ans: ans, text: "50% is one half. " + N + " ÷ 2 = " + a + ".", bar: { n: n, parts: 2, take: 1 }, first: "50% is one half: divide by 2." };
  if (p === 25) return { ans: ans, text: "25% is one quarter. " + N + " ÷ 4 = " + a + ".", bar: { n: n, parts: 4, take: 1 }, first: "25% is one quarter: divide by 4." };
  if (p === 75) return { ans: ans, text: "25% is one quarter: " + N + " ÷ 4 = " + q4 + ". 75% is three quarters: 3 × " + q4 + " = " + a + ".", bar: { n: n, parts: 4, take: 3 }, first: "Find 25% first: divide by 4. Then 75% is 3 times as much." };
  if (p === 10) return { ans: ans, text: "10% is one tenth. " + N + " ÷ 10 = " + a + ".", bar: { n: n, parts: 10, take: 1 }, first: "10% is one tenth: divide by 10." };
  if (p === 1) return { ans: ans, text: "1% is one hundredth. " + N + " ÷ 100 = " + a + ".", bar: null, first: "1% is one hundredth: divide by 100." };
  if (p === 20 && n % 10 !== 0 && n % 5 === 0) return { ans: ans, text: "20% is one fifth. " + N + " ÷ 5 = " + a + ".", bar: { n: n, parts: 5, take: 1 }, first: "20% is one fifth: divide by 5." };
  if (p === 5) return { ans: ans, text: "10% of " + N + " is " + N + " ÷ 10 = " + t + ". 5% is half of 10%: " + t + " ÷ 2 = " + a + ".", bar: { n: n, parts: 20, take: 1 }, first: "Find 10% first: divide by 10. Then 5% is half of 10%." };
  const k = Math.floor(p / 10), tens = D.s(n * 100 * k);
  if (p % 10 === 0) return { ans: ans, text: "10% of " + N + " is " + N + " ÷ 10 = " + t + ". " + p + "% is " + k + " × " + t + " = " + a + ".", bar: { n: n, parts: 10, take: k }, first: "Find 10% first: divide by 10. Then " + p + "% is " + k + " lots of 10%." };
  return { ans: ans, text: "10% of " + N + " is " + t + (k > 1 ? ", so " + k * 10 + "% is " + k + " × " + t + " = " + tens : "") + ". 5% is half of 10%: " + f + ". " + p + "% = " + k * 10 + "% + 5% = " + tens + " + " + f + " = " + a + ".",
    bar: { n: n, parts: 20, take: p / 5 }, first: "Find 10% first, then 5% (half of 10%). " + p + "% = " + k * 10 + "% + 5%." };
}
function ofSlip(p, n, typed, rt) {
  const v = D.p(typed), N = n * 1000;
  if (isNaN(v)) return "Write a number.";
  if (v === N) return "That is the whole amount, 100%. Find " + p + "% of it.";
  if (p !== 10 && v === n * 100) return "That is 10% of " + fmt(n) + ". Now use it to find " + p + "%.";
  if (v === N - rt.ans) return "That is what is left. The question asks for " + p + "% of " + fmt(n) + ".";
  if (v * p === N && p !== 10 && p !== 50 && p !== 25 && p !== 1) return p + "% does not mean ÷ " + p + ". " + rt.first;
  if (p === 5 && v * 5 === N) return "÷ 5 finds 20%. " + rt.first;
  if (v === p * 1000) return p + " is the percentage. Find " + p + "% of " + fmt(n) + ".";
  return rt.first;
}
const whole = (rt, where) => { if (rt.ans % 1000) throw new Error(where + ": the answer is not a whole number"); return rt; };

M.pof = function (d) {
  const it = d.items, many = it.length > 1, rts = it.map(x => whole(route(x.p, x.n), "pof")), story = !!d.text;
  const unit = d.unit ? " " + d.unit : "", pre = d.pre ? d.pre + " " : "";
  const tx = it.map(x => x.p + "% of " + fmt(x.n));
  const bar = i => (rts[i].bar ? Object.assign({ k: "pctbar", pre: d.pre || "", unit: d.unit || "" }, rts[i].bar) : { k: "hgrid", shade: 1, cap: "1% is 1 out of 100" });
  return {
    q: story ? d.text : "Calculate.", marks: it.length,
    fig: d.bar && !many && rts[0].bar ? Object.assign({ ask: true }, bar(0)) : null,
    lines: story ? [pre + "{0}" + unit] : it.map((x, i) => abc(i, many) + tx[i] + " = {" + i + "}"),
    blanks: it.map(x => ({ len: Math.max(4, String(x.n).length + 1), w: story ? "big" : "mid" })),
    check(r) {
      const parts = it.map((x, i) => D.eq(r.v[i], rts[i].ans));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: look(i, many) + ofSlip(it[i].p, it[i].n, r.v[i], rts[i]), parts: parts };
    },
    hint: { pic: many ? null : bar(0), step: rts.map((x, i) => (many ? "(" + "abc"[i] + ") " : "") + x.first).join(" ") },
    worked: { text: rts.map((x, i) => (many ? "(" + "abc"[i] + ") " : "") + x.text).join(" ") + (story ? " The answer is " + (d.pre || "") + D.s(rts[0].ans) + unit + "." : ""), pic: many ? null : bar(0) },
    yes: it.map((x, i) => tx[i] + " = " + D.s(rts[i].ans)).join(" and ") + ".",
    key: rts.map(x => D.s(x.ans)).join(" ; "), fill: rts.map(x => String(x.ans / 1000))
  };
};

/* two steps: find p% of n, then take it away (less) or add it on (more) */
M.pchange = function (d) {
  const rt = whole(route(d.p, d.n), "pchange"), less = d.dir !== "more", part = rt.ans, ans = less ? d.n * 1000 - part : d.n * 1000 + part;
  const unit = d.unit ? " " + d.unit : "", pre = d.pre ? d.pre + " " : "", N = fmt(d.n), two = !!d.labs;
  const sum = N + (less ? " − " : " + ") + D.s(part) + " = " + D.s(ans);
  const len = String(Math.round(ans / 1000)).length + 1;
  const bar = rt.bar ? Object.assign({ k: "pctbar", pre: d.pre || "", unit: d.unit || "", cut: less, add: !less }, rt.bar) : null;
  return {
    q: d.text, marks: two ? 2 : 1,
    lines: two ? [d.labs[0] + ": " + pre + "{0}" + unit, d.labs[1] + ": " + pre + "{1}" + unit] : [pre + "{0}" + unit],
    blanks: two ? [{ len: len, w: "mid" }, { len: len, w: "mid" }] : [{ len: len, w: "big" }],
    check(r) {
      const v = D.p(r.v[two ? 1 : 0]), p1 = two ? D.eq(r.v[0], part) : true, ok = v === ans, parts = two ? [p1, ok] : [ok];
      if (p1 && ok) return { ok: true, parts: parts };
      if (two && !p1) return { ok: false, msg: ofSlip(d.p, d.n, r.v[0], rt), parts: parts };
      if (v === part) return { ok: false, msg: "That is " + d.p + "% of " + N + ". Now " + (less ? "take it away from " : "add it to ") + N + ".", parts: parts };
      if (v === (less ? d.n * 1000 + part : d.n * 1000 - part)) return { ok: false, msg: less ? "You added. Here the answer must be less than " + N + "." : "You took away. Here the answer must be more than " + N + ".", parts: parts };
      if (v === (less ? d.n - d.p : d.n + d.p) * 1000) return { ok: false, msg: d.p + "% is not " + d.p + ". First find " + d.p + "% of " + N + ".", parts: parts };
      return { ok: false, msg: "Two steps. First find " + d.p + "% of " + N + ". Then " + (less ? "subtract." : "add."), parts: parts };
    },
    hint: { pic: bar, step: "Two steps. " + rt.first + " Then " + (less ? "take that away from " : "add that to ") + N + "." },
    worked: { text: rt.text + " Then " + sum + ". The answer is " + (d.pre || "") + D.s(ans) + unit + ".", pic: bar },
    yes: d.p + "% of " + N + " is " + D.s(part) + ", and " + sum + ".",
    key: (two ? D.s(part) + " ; " : "") + D.s(ans), fill: (two ? [String(part / 1000)] : []).concat([String(ans / 1000)])
  };
};

/* ---------- compare and order ---------- */
M.pcmp = function (d, mode) {
  const it = d.items.map(x => ({ a: Q(x.a), b: Q(x.b) })), ans = it.map(x => symOf(x.a, x.b)), many = it.length > 1;
  const t = {
    q: "Write <b>&lt;</b>, <b>&gt;</b> or <b>=</b> in " + (many ? "each box." : "the box."), marks: it.length,
    how: mode === "our" ? "Let's do it together. Change both numbers into percentages. Then compare." : "Change both numbers into the same form. Then compare.",
    lines: it.map((x, i) => abc(i, many) + x.a.html + " {" + i + "} " + x.b.html), blanks: it.map(() => ({ len: 1, w: "s6sym", sym: true })),
    check(r) {
      const parts = it.map((x, i) => r.v[i] === ans[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false), x = it[i];
      return { ok: false, msg: look(i, many) + cmpWhy(x.a, x.b) + " The open side of the sign points to the greater number.", parts: parts };
    },
    hint: { pic: many || it[0].a.h == null || it[0].b.h == null || d.line ? null : { k: "fdpline", cards: [it[0].a.text, it[0].b.text] },
      step: (it.every(x => x.a.kind === "f" && x.b.kind === "f") ? "Give both fractions the same denominator." : "Change both numbers into percentages.") + " The open side of the sign points to the greater number." },
    worked: { text: it.map((x, i) => (many ? "(" + "abc"[i] + ") " : "") + cmpWhy(x.a, x.b) + " So " + x.a.html + " " + SYMH[ans[i]] + " " + x.b.html + ".").join(" ") },
    yes: it.map((x, i) => x.a.html + " " + SYMH[ans[i]] + " " + x.b.html).join(" and ") + ".",
    key: ans.map(x => SYMH[x]).join(" ; "), fill: ans
  };
  if (d.line) {
    if (many) throw new Error("pcmp: the number line shows one pair");
    t.ui = { k: "fdpline", cards: [it[0].a.text, it[0].b.text] };
    t.right = { placed: 2 };
    t.how = mode === "our" ? "Let's do it together. Tap each card to put it on the line. The number on the right is greater." : "Tap each card to put it on the line. Then write the sign.";
  }
  return t;
};

M.lplace = function (d, mode) {
  const q = need(Q(d.v)), scale = d.scale || "d", at = h => (scale === "p" ? h + "%" : decOf(h));
  return {
    q: "Where is <b>" + q.html + "</b> on the number line? Move the arrow.",
    how: mode === "our" ? "Let's do it together. " + (scale === "p" ? "Change the number into a percentage." : "Change the number into a decimal.") + " Then move the arrow with the buttons." : "Tap the buttons to move the arrow.",
    ui: { k: "fdpmove", cards: [q.text], scale: scale }, right: { pos: q.h },
    ready: r => r.pos > 0,
    given: r => String(r.pos),
    check(r) {
      if (r.pos === q.h) return { ok: true };
      if (q.kind === "f" && (r.pos === q.n * 10 || r.pos === q.n)) return { ok: false, msg: q.html + " is not " + at(r.pos) + ". Make the denominator 100: " + q.html + " = " + F("?", 100) + "." };
      if (q.kind === "d" && q.h < 10 && r.pos === q.h * 10) return { ok: false, msg: q.text + " is " + q.h + " hundredths, not " + q.h + " tenths." };
      if (q.kind === "p" && q.h < 10 && r.pos === q.h * 10) return { ok: false, msg: q.h + "% is " + q.h + " hundredths: less than 0.1." };
      return { ok: false, msg: (r.pos < q.h ? "Too far to the left. " : "Too far to the right. ") + (q.kind === "f" ? "Make the denominator 100: " + q.html + " = " + F("?", 100) + "." : q.kind === "p" ? "Per cent means out of 100: " + q.h + "% = " + F(q.h, 100) + "." : "Read the tenths, then the hundredths.") };
    },
    hint: { step: q.kind === "f" ? "Make the denominator 100: " + q.html + " = " + F("?", 100) + ". The line goes from 0 to 1 in hundredths." : q.kind === "p" ? "100% is 1 whole. " + q.h + "% is " + q.h + " hundredths." : "Each big mark is one tenth: 0.1." },
    worked: { text: chain(q) + ". The arrow goes to " + at(q.h) + ".", pic: { k: "fdpline", cards: [q.text], scale: scale } },
    yes: q.html + " is at " + at(q.h) + " on the line.",
    key: at(q.h)
  };
};

/* the items in the right order, and what can go wrong */
function ordered(items, dir) {
  const qs = items.map(x => need(Q(x)));
  const idx = qs.map((q, i) => i).sort((i, j) => Q.cmp(qs[i], qs[j]));
  for (let k = 1; k < idx.length; k++) if (Q.cmp(qs[idx[k - 1]], qs[idx[k]]) === 0) throw new Error("order: two equal values, " + qs[idx[k - 1]].text + " and " + qs[idx[k]].text);
  if (dir === "desc") idx.reverse();
  return { qs: qs, idx: idx };
}
const DIR = { asc: { word: "ascending", from: "smallest", to: "largest" }, desc: { word: "descending", from: "largest", to: "smallest" } };

M.porder = function (d, mode) {
  const dir = d.dir === "desc" ? "desc" : "asc", o = ordered(d.items, dir), qs = o.qs, W = DIR[dir];
  const seq = o.idx.join(","), inOrder = o.idx.map(i => qs[i]);
  return {
    q: "Put the numbers in [[" + W.word + " order]]: the <b>" + W.from + "</b> first.",
    how: mode === "our" ? "Let's do it together. Change every number into a percentage. Then tap the " + W.from + " first." : "Tap the " + W.from + " number first. Tap a placed card to take it back.",
    ui: { k: "ftiles", items: qs.map(q => q.text), from: W.from, to: W.to }, right: { seq: seq, placed: qs.length },
    ready: r => r.placed === qs.length,
    given: r => String(r.seq).split(",").map(i => (qs[+i] ? qs[+i].text : "_")).join(" "),
    check(r) {
      const got = String(r.seq).split(","), parts = o.idx.map((i, k) => +got[k] === i && got[k] !== "");
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      if (got.slice().reverse().join(",") === seq) return { ok: false, msg: "That is " + (dir === "asc" ? "descending" : "ascending") + " order. Start with the " + W.from + " number.", parts: parts };
      const k = parts.indexOf(false), a = qs[+got[k]], b = qs[o.idx[k]];
      return { ok: false, msg: "Look at place " + (k + 1) + ". " + (a && b && a !== b ? cmpWhy(a, b) : "Change every number into a percentage first."), parts: parts };
    },
    hint: { pic: { k: "fdpline", cards: qs.map(q => q.text) }, step: "Change every number into a percentage: " + listPct(qs) + "." },
    worked: { text: listPct(qs) + ". In " + W.word + " order: " + inOrder.map(q => q.html).join(", ") + ".", pic: { k: "ftiles", items: qs.map(q => q.text), from: W.from, to: W.to, seq: seq } },
    yes: "In " + W.word + " order: " + inOrder.map(q => q.html).join(", ") + ".",
    key: inOrder.map(q => q.text).join(", ")
  };
};

M.pordopt = function (d) {
  const dir = d.dir === "desc" ? "desc" : "asc", o = ordered(d.items, dir), qs = o.qs, W = DIR[dir], n = qs.length;
  const right = o.idx.slice();
  /* the two closest neighbours swapped */
  let ks = 0, best = null;
  for (let k = 0; k < n - 1; k++) { const gap = Math.abs(qs[right[k]].h - qs[right[k + 1]].h); if (best == null || gap < best) { best = gap; ks = k; } }
  const swap = right.slice(); swap[ks] = right[ks + 1]; swap[ks + 1] = right[ks];
  /* ordered by the numbers you see: every percentage looks bigger than every decimal and fraction */
  const face = qs.map((q, i) => i).sort((i, j) => (qs[i].kind === "p") - (qs[j].kind === "p") || Q.cmp(qs[i], qs[j]));
  if (dir === "desc") face.reverse();
  const rev = right.slice().reverse();
  const A = qs[swap[ks]], B = qs[swap[ks + 1]];
  const cands = [
    { idx: right, why: "" },
    { idx: swap, why: "Look at " + A.html + " and " + B.html + ". " + cmpWhy(A, B) },
    { idx: face, why: "A percentage is not bigger just because its number looks bigger. Change every number into a percentage: " + listPct(qs) + "." },
    { idx: rev, why: "That is " + (dir === "asc" ? "descending" : "ascending") + " order: the " + W.to + " comes first." }];
  const seen = {}, list = [];
  cands.forEach(c => { const k = c.idx.join(","); if (!seen[k] && list.length < (d.n || 3)) { seen[k] = 1; list.push(c); } });
  if (list.length < 3) throw new Error("pordopt: fewer than 3 different lists");
  const show = idx => idx.map(i => '<span class="s6-li">' + qs[i].html + "</span>").join('<span class="s6-sep">,</span> ');
  const opts = arrange(list.map((c, i) => ({ html: '<span class="s6-list">' + show(c.idx) + "</span>", alt: c.idx.map(i => qs[i].text).join(", "), ok: i === 0, why: c.why })), d.at);
  return {
    q: "Which list is in [[" + W.word + " order]] (the <b>" + W.from + "</b> first)?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const x = opts[r.pick]; return x.ok ? { ok: true } : { ok: false, msg: x.why }; },
    hint: { pic: { k: "fdpline", cards: qs.map(q => q.text) }, step: "Change every number into a percentage: " + listPct(qs) + "." },
    worked: { text: listPct(qs) + ". In " + W.word + " order: " + right.map(i => qs[i].html).join(", ") + "." },
    yes: "In " + W.word + " order: " + right.map(i => qs[i].html).join(", ") + ".",
    key: MX.LET[opts.findIndex(x => x.ok)] + ": " + right.map(i => qs[i].text).join(", ")
  };
};

M.pext = function (d) {
  const big = d.ask !== "smallest", o = ordered(d.items, "asc"), qs = o.qs, win = big ? o.idx[o.idx.length - 1] : o.idx[0], word = big ? "greatest" : "smallest";
  const opts = qs.map((q, i) => ({ html: q.html, alt: q.text, ok: i === win, why: i === win ? "" : cmpWhy(q, qs[win]) }));
  return {
    q: "Which number is the <b>" + word + "</b>?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const x = opts[r.pick]; return x.ok ? { ok: true } : { ok: false, msg: x.why }; },
    hint: { pic: { k: "fdpline", cards: qs.map(q => q.text) }, step: "Change every number into a percentage. Then compare." },
    worked: { text: listPct(qs) + ". The " + word + " is " + qs[win].html + "." },
    yes: listPct(qs) + ". The " + word + " is " + qs[win].html + ".",
    key: qs[win].text
  };
};

M.pwho = function (d) {
  const a = need(Q(d.a.v)), b = need(Q(d.b.v)), s = Q.cmp(a, b), more = d.ask !== "less";
  const win = s === 0 ? 2 : (s > 0) === more ? 0 : 1, names = [d.a.who, d.b.who];
  const why = cmpWhy(a, b);
  const end = win === 2 ? "So the two amounts are equal." : "So " + names[win] + " has " + (more ? "more" : "less") + ".";
  const opts = [{ html: "<b>" + d.a.who + "</b>" }, { html: "<b>" + d.b.who + "</b>" }, { html: d.same || "The two amounts are the same" }]
    .map((x, i) => Object.assign(x, { ok: i === win, why: i === win ? "" : why }));
  return {
    q: d.text, sub: "Tick (✓) one box.", opts: opts,
    check(r) { const x = opts[r.pick]; return x.ok ? { ok: true } : { ok: false, msg: x.why + " Now decide again." }; },
    hint: { pic: { k: "fdpline", cards: [a.text, b.text] }, step: "You cannot compare " + a.html + " and " + b.html + " as they are. Change them into the same form: percentages." },
    worked: { text: d.a.who + ": " + (a.kind === "p" ? a.text : toPct(a)) + ". " + d.b.who + ": " + (b.kind === "p" ? b.text : toPct(b)) + ". " + (s === 0 ? "Both are " + a.h + "%." : a.h + "% is " + (s > 0 ? "greater" : "less") + " than " + b.h + "%.") + " " + end },
    yes: why + " " + end,
    key: win === 2 ? "the same" : names[win]
  };
};

MX.s6 = { toPct: toPct, chain: chain, cmpWhy: cmpWhy, route: route };
})();

