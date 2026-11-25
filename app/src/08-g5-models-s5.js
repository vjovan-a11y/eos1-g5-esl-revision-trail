/* 08-g5-models-s5.js - Grade 5 question models for Stop 5: fractions in their simplest form (6Nf.03) and proper and
   improper fractions as operators: a fraction of an amount (6Nf.02). Every answer is worked out here from the numbers
   in the data. A fraction is always two whole numbers, the numerator n and the denominator d: no decimals, no floats.
   A model throws when its data is not sound (an amount that cannot be shared, a fraction that is already simple).

   fsimp     { n: 8, d: 12, tool?: true }                     write n/d in its simplest form (two boxes, MX.FB); a fraction
                                                              that is equal but not fully simplified gets its own feedback;
                                                              tool: with the fraction bar (fbar)
   fsimpis   { fr: [[5, 9], [4, 10], [6, 9]], ask: 'is' | 'not', at }   which fraction is (is not) in its simplest form?
                                                              fr[0] must be the only one that fits
   fcomf     { n: 12, d: 20, k?: 2 }                          n/d = (n ÷ k)/(d ÷ k): which number divides both? Without k:
                                                              the number that gives the simplest form in one step
   fequiv    { n: 2, d: 5, k: 3, hide: 0..3, bar?: true }     n/d = nk/dk with one of the four numbers missing (0 top left,
                                                              1 bottom left, 2 top right, 3 bottom right); bar: two bars
   fopamt    { n: 3, d: 4, amt: 20, unit?, tool?: true }      n/d of amt (proper or improper); tool: with the bar model (famt)
   fopcalc   { items: [{ n, d, amt }, ...] }                  "Calculate." with one line for each part
   fopsize   { n: 5, d: 4, amt: 20 }                          is n/d of amt less than, equal to or more than amt? (tick)
   fopmore   { a: { n, d, amt }, b: { n, d, amt } }           which is more? (tick: the first, the second, or equal)
   fopmiss   { n: 3, d: 4, amt: 20, bar?: true }              n/d of a number is 15: find the number (amt is the answer)
   fopstory  { text, kind, n, d, amt, unit, n2?, d2?, amt2?, by?, step2? }   a story in two steps ({f} in the text is n/d, {f2} is n2/d2):
               kind 'left'   amt − n/d of amt                 kind 'extra'  n/d of amt − amt (improper: how many more)
               kind 'each'   n/d of amt, then × by            kind 'sum2'   n/d of amt + n2/d2 of amt2
               kind 'diff2'  the difference between n/d of amt and n2/d2 of amt2 (amt2: amt when not given)
   fsimpfix  { who, he, n, d, slip: 'part' | 'top' | 'sub' | 'two', at }   spot the mistake in a simplification, then
                                                              write the right answer (two parts, 2 marks)
   fopfix    { who, he, n, d, amt, slip: 'unit' | 'flip' | 'nodiv', at }   spot the mistake in a fraction of an amount */
(function () {
"use strict";
const M = MX.M, fmt = MX.fmt, arrange = MX.arrange, cap = MX.cap, F = MX.F, FB = MX.FB, gcd = MX.gcd;
["fsimp", "fsimpis", "fcomf", "fequiv", "fopamt", "fopcalc", "fopsize", "fopmore", "fopmiss", "fopstory", "fsimpfix", "fopfix"].forEach(k => { if (M[k]) throw new Error("Stop 5 models: the type " + k + " exists already"); });

const int = s => (/^\d+$/.test(String(s == null ? "" : s)) ? +s : NaN);          /* a typed whole number, else NaN */
const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const prime = (a, b) => [2, 3, 5, 7, 11, 13].find(p => a % p === 0 && b % p === 0) || 0;   /* the smallest prime that divides both */
const FR = { len: 2, w: "fr" };
const tx = (n, d) => n + "/" + d;                                                  /* plain text, for the answer key */
const alt = (n, d) => n + " over " + d;
const whole = (x, what) => { if (x !== Math.floor(x) || !(x >= 0)) throw new Error("Stop 5 models: " + what + " is not a whole number"); return x; };
const of = (n, d, amt) => whole(amt / d, amt + " ÷ " + d) * n;                      /* n/d of amt, exact */
const pp = h => (h ? { he: "he", He: "He", his: "his" } : { he: "she", He: "She", his: "her" });
const box = digits => ({ len: Math.max(3, String(digits).length + 1), w: "big" });

/* why a fraction a/b can be simplified again */
function again(a, b) {
  const p = prime(a, b);
  if (p === 2) return "You can divide again: both numbers are even.";
  if (p === 5) return "You can divide again: both numbers end in 0 or 5.";
  return "You can divide again: both " + a + " and " + b + " can be divided by " + p + ".";
}
/* feedback for a typed fraction a/b that should be the simplest form of n/d */
function simpSlip(n, d, a, b) {
  const s = simp(n, d);
  if (!(a > 0) || !(b > 0)) return "Write a number in each box: the numerator on top, the denominator below.";
  if (a * d === b * n) {
    if (a === n && b === d) return "That is the same fraction. Divide the numerator and the denominator by the same number.";
    if (a > n) return "That fraction is equal, but its numbers are bigger. To simplify, divide.";
    return a + "/" + b + " is equal to " + n + "/" + d + ", but it is not the simplest form. " + again(a, b);
  }
  if (a === s[1] && b === s[0]) return "The numbers are right, but they are upside down. The numerator goes on top.";
  if (b === d && a < n && n % a === 0) return "You divided only the numerator. Divide the denominator by the same number.";
  if (a === n && b < d && d % b === 0) return "You divided only the denominator. Divide the numerator by the same number.";
  if (a < n && n - a === d - b) return "Do not subtract. Divide the numerator and the denominator by the same number.";
  if (a < n && b < d && n % a === 0 && d % b === 0) return "You divided " + n + " by " + n / a + " and " + d + " by " + d / b + ". Divide both by the same number.";
  return "Find a number that divides both " + n + " and " + d + ". Then divide both by it.";
}
const divSteps = (n, d) => { const g = gcd(n, d); return n + " ÷ " + g + " = " + n / g + " and " + d + " ÷ " + g + " = " + d / g; };
const barOk = (n, d) => n <= d && d <= 24;                                         /* the fraction bar can draw it */

/* ---------- simplest form ---------- */
M.fsimp = function (d, mode) {
  const n = d.n, dn = d.d, g = gcd(n, dn), s = simp(n, dn), p = prime(n, dn);
  if (g === 1) throw new Error("fsimp: " + tx(n, dn) + " is already in its simplest form");
  if (d.tool && !barOk(n, dn)) throw new Error("fsimp: the bar cannot show " + tx(n, dn));
  const t = {
    q: "Write " + F(n, dn) + " in its [[simplest form]].",
    lines: [F(n, dn) + " = " + FB(0, 1)], blanks: [FR, FR],
    check(r) {
      const a = int(r.v[0]), b = int(r.v[1]);
      if (a === s[0] && b === s[1]) return { ok: true, parts: [true, true] };
      return { ok: false, msg: simpSlip(n, dn, a, b), parts: [a === s[0], b === s[1]] };
    },
    hint: { pic: barOk(n, dn) ? { k: "fbar", n: n, d: dn } : null,
      step: "Both " + n + " and " + dn + " can be divided by " + p + ". Divide both. Then look again: can you divide once more?" },
    worked: { text: "The biggest number that divides both " + n + " and " + dn + " is " + g + ". " + cap(divSteps(n, dn)) + ". So " + F(n, dn) + " = " + F(s[0], s[1]) + ". Only 1 divides both " + s[0] + " and " + s[1] + ".",
      pic: barOk(n, dn) ? { k: "fbar", n: n, d: dn, to: s } : null },
    yes: cap(divSteps(n, dn)) + ". " + F(n, dn) + " = " + F(s[0], s[1]) + ".",
    key: tx(s[0], s[1]), fill: [String(s[0]), String(s[1])]
  };
  if (d.tool) {
    t.how = mode === "our" ? "Let's do it together. Tap a <b>÷</b> button that works for both numbers. Go on until no button works. Then write the fraction."
      : "Merge the parts with the <b>÷</b> buttons until you cannot go on. Then write the fraction.";
    t.ui = { k: "fbar", n: n, d: dn, tell: mode === "our" };
    t.right = { n: s[0], d: s[1] };
  }
  return t;
};

M.fsimpis = function (d) {
  const not = d.ask === "not", fits = x => (gcd(x[0], x[1]) === 1) !== not;
  if (!fits(d.fr[0]) || d.fr.slice(1).some(fits)) throw new Error("fsimpis: the first fraction, and only the first, must fit");
  const why = x => { const g = gcd(x[0], x[1]);
    return g === 1 ? F(x[0], x[1]) + " is in its simplest form: only 1 divides both " + x[0] + " and " + x[1] + "."
      : F(x[0], x[1]) + " is not in its simplest form: both " + x[0] + " and " + x[1] + " can be divided by " + prime(x[0], x[1]) + "."; };
  const opts = arrange(d.fr.map((x, i) => ({ html: F(x[0], x[1]), alt: alt(x[0], x[1]), ok: i === 0, why: i === 0 ? "" : why(x) })), d.at);
  const r = d.fr[0];
  return {
    q: not ? "Which fraction is <b class=\"s5-not\">not</b> in its [[simplest form]]?" : "Which fraction is in its [[simplest form]]?", sub: "Tick (✓) one box.", opts: opts,
    check(x) { const o = opts[x.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "For each fraction ask: is there a number bigger than 1 that divides the numerator and the denominator?" },
    worked: { text: d.fr.map(why).join(" ") },
    yes: why(r), key: tx(r[0], r[1])
  };
};

M.fcomf = function (d) {
  const n = d.n, dn = d.d, g = gcd(n, dn), k = d.k || g;
  if (g === 1 || n % k || dn % k || k < 2) throw new Error("fcomf: " + k + " must divide both " + n + " and " + dn);
  const a = n / k, b = dn / k;
  return {
    q: d.k ? F(n, dn) + " = " + F(a, b) + ". The numerator and the denominator are divided by the same number. Write the number."
      : "You want to write " + F(n, dn) + " in its simplest form in <b>one</b> step. Which number do you divide the numerator and the denominator by?",
    lines: ["Divide both by {0}"], blanks: [{ len: 2, w: "box" }],
    check(r) {
      const v = int(r.v[0]);
      if (v === k) return { ok: true, parts: [true] };
      let msg = n + " ÷ ? = " + a + " and " + dn + " ÷ ? = " + b + ". Use your times tables.";
      if (!d.k && v > 1 && n % v === 0 && dn % v === 0) msg = v + " divides both, but a bigger number divides both too. Find the biggest one.";
      else if (!d.k) msg = v > 1 && (n % v === 0 || dn % v === 0) ? v + " does not divide both " + n + " and " + dn + ". Find a number that divides both." : "List the numbers that divide " + n + ". Which of them divide " + dn + " too? Take the biggest.";
      else if (v === a || v === b) msg = v + " is a number of the new fraction. What was " + n + " divided by to make " + a + "?";
      else if (v === n - a || v === dn - b) msg = "Do not subtract. " + n + " ÷ ? = " + a + ".";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: barOk(n, dn) ? { k: "fbar", n: n, d: dn, to: [a, b] } : null,
      step: d.k ? "Think: " + n + " ÷ ? = " + a + ". Check with the denominator: " + dn + " ÷ ? = " + b + "." : "Find the biggest number that divides both " + n + " and " + dn + "." },
    worked: { text: (d.k ? "" : "The biggest number that divides both " + n + " and " + dn + " is " + k + ". ") + n + " ÷ " + k + " = " + a + " and " + dn + " ÷ " + k + " = " + b + ". So " + F(n, dn) + " = " + F(a, b) + "." },
    yes: n + " ÷ " + k + " = " + a + " and " + dn + " ÷ " + k + " = " + b + ".",
    key: String(k), fill: [String(k)]
  };
};

/* equal fractions with one number missing */
M.fequiv = function (d) {
  const v = [d.n, d.d, d.n * d.k, d.d * d.k], h = d.hide, want = v[h], k = d.k;
  if (!(k > 1) || !(h >= 0 && h <= 3)) throw new Error("fequiv: k must be 2 or more, hide 0 to 3");
  const cell = i => (i === h ? "{0}" : '<span class="s5-fn">' + v[i] + "</span>");
  const frm = (i, j) => '<span class="frb">' + cell(i) + '<span class="frl"></span>' + cell(j) + "</span>";
  const top = h % 2 === 0, right = h >= 2;
  /* the pair in the other row is known: it shows what to multiply or divide by */
  const from = top ? v[1] : v[0], to = top ? v[3] : v[2], mine = right ? v[h - 2] : v[h + 2];
  const addSlip = right ? mine + (to - from) : mine - (to - from);
  const rule = right ? from + " × " + k + " = " + to + ", so " + mine + " × " + k + " = " + want : to + " ÷ " + k + " = " + from + ", so " + mine + " ÷ " + k + " = " + want;
  const small = barOk(v[0], v[1]) && barOk(v[2], v[3]);
  return {
    q: "The two fractions are equal. Write the missing number.",
    fig: d.bar && small ? { k: "fbar", n: v[0], d: v[1], to: [v[2], v[3]], ask: true } : null,
    lines: [frm(0, 1) + " = " + frm(2, 3)], blanks: [FR],
    check(r) {
      const x = int(r.v[0]);
      if (x === want) return { ok: true, parts: [true] };
      let msg = (right ? "What is " + from + " multiplied by to make " + to + "? Multiply " + mine + " by the same number." : "What is " + to + " divided by to make " + from + "? Divide " + mine + " by the same number.");
      if (x === addSlip) msg = "Do not add or subtract. " + (right ? "Multiply" : "Divide") + " the numerator and the denominator by the same number.";
      else if (x === k) msg = k + " is the number you " + (right ? "multiply" : "divide") + " by. Now work out " + mine + (right ? " × " : " ÷ ") + k + ".";
      else if (x === mine) msg = "The two fractions have different numbers. " + (right ? from + " × ? = " + to : to + " ÷ ? = " + from) + ". Do the same to " + mine + ".";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: !d.bar && small ? { k: "fbar", n: v[0], d: v[1], to: [v[2], v[3]], ask: true } : null,
      step: (right ? from + " × ? = " + to : to + " ÷ ? = " + from) + ". Do the same to the " + (top ? "numerator" : "denominator") + "." },
    worked: { text: cap(rule) + ". " + F(v[0], v[1]) + " = " + F(v[2], v[3]) + ".", pic: small ? { k: "fbar", n: v[0], d: v[1], to: [v[2], v[3]] } : null },
    yes: cap(rule) + ".", key: String(want), fill: [String(want)]
  };
};

/* ---------- a fraction of an amount ---------- */
const un = u => (u ? " " + u : "");
/* feedback for a typed answer v to n/d of amt */
function opSlip(n, d, amt, v) {
  const each = amt / d, ans = each * n;
  if (isNaN(v)) return "Write a number.";
  if (v === each && n !== 1) return "That is " + tx(1, d) + " of " + fmt(amt) + ": one part. You need " + n + " parts, so multiply by " + n + ".";
  if (v === amt * n) return "You multiplied by " + n + ". Divide by the denominator " + d + " too.";
  if (amt % n === 0 && v === amt / n * d) return "Divide by the denominator (" + d + "), not by the numerator. Then multiply by " + n + ".";
  if (v === amt - each && n !== d - 1) return "That is the amount less one part. Find one part (" + fmt(amt) + " ÷ " + d + "), then take " + n + " parts.";
  if (n > d && v <= amt) return tx(n, d) + " is more than 1 whole, so the answer is more than " + fmt(amt) + ". Find one part, then take " + n + " parts.";
  if (n < d && v >= amt) return tx(n, d) + " is less than 1 whole, so the answer is less than " + fmt(amt) + ". Find one part, then take " + n + " parts.";
  return "First find one part: " + fmt(amt) + " ÷ " + d + ". Then multiply by " + n + ".";
}
const opWork = (n, d, amt) => fmt(amt) + " ÷ " + d + " = " + fmt(amt / d) + (n === 1 ? "" : ". " + n + " × " + fmt(amt / d) + " = " + fmt(of(n, d, amt)));
const opText = (n, d, amt, u) => F(n, d) + " of " + fmt(amt) + un(u);
const amPic = (n, d, amt, show) => (d <= 12 && n <= 3 * d ? { k: "famt", amt: amt, n: n, d: d, show: show || "all" } : null);

M.fopamt = function (d, mode) {
  const n = d.n, dn = d.d, amt = d.amt, ans = of(n, dn, amt), u = d.unit || "";
  const t = {
    q: "Find " + F(n, dn) + " of <b>" + fmt(amt) + "</b>" + un(u) + ".",
    lines: [opText(n, dn, amt) + " = {0}" + un(u)], blanks: [box(ans)],
    check(r) { const v = int(r.v[0]); return v === ans ? { ok: true, parts: [true] } : { ok: false, msg: opSlip(n, dn, amt, v), parts: [false] }; },
    hint: { pic: d.tool ? null : amPic(n, dn, amt, "ask"), step: "First find one part: " + fmt(amt) + " ÷ " + dn + ". Then take " + n + " parts: multiply by " + n + "." },
    worked: { text: cap(opWork(n, dn, amt)) + ". So " + opText(n, dn, amt) + " = " + fmt(ans) + "." + (n > dn ? " That is more than " + fmt(amt) + ", because " + tx(n, dn) + " is more than 1 whole." : ""), pic: amPic(n, dn, amt) },
    yes: cap(opWork(n, dn, amt)) + ".", key: fmt(ans), fill: [String(ans)]
  };
  if (d.tool) {
    t.how = mode === "our" ? "Let's do it together. Tap <b>Share into " + dn + "</b>. Then tap <b>+ 1 part</b> until you have " + n + " parts. Write the total."
      : "Share the amount into " + dn + " equal parts. Take " + n + " parts. Then write the answer.";
    t.ui = { k: "famt", amt: amt, d: dn, unit: u, total: mode === "our", max: Math.max(2 * dn, n) };
    t.right = { parts: n };
  }
  return t;
};

M.fopcalc = function (d) {
  const it = d.items, ans = it.map(x => of(x.n, x.d, x.amt)), many = it.length > 1;
  return {
    q: "Calculate.", marks: it.length,
    lines: it.map((x, i) => (many ? "<i>(" + "abc"[i] + ")</i> " : "") + opText(x.n, x.d, x.amt) + " = {" + i + "}"),
    blanks: ans.map(a => box(a)),
    check(r) {
      const parts = it.map((x, i) => int(r.v[i]) === ans[i]);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (many ? "Look at (" + "abc"[i] + "). " : "") + opSlip(it[i].n, it[i].d, it[i].amt, int(r.v[i])), parts: parts };
    },
    hint: { pic: it.map(x => amPic(x.n, x.d, x.amt, "ask")).filter(Boolean), step: "Divide by the denominator to find one part. Then multiply by the numerator." },
    worked: { text: it.map(x => cap(opWork(x.n, x.d, x.amt)) + ". So " + opText(x.n, x.d, x.amt) + " = " + fmt(of(x.n, x.d, x.amt)) + ".").join(" "),
      pic: it.length === 1 ? amPic(it[0].n, it[0].d, it[0].amt) : null },
    yes: it.map((x, i) => opText(x.n, x.d, x.amt) + " = " + fmt(ans[i])).join(" and ") + ".",
    key: ans.map(fmt).join(" ; "), fill: ans.map(String)
  };
};

M.fopsize = function (d) {
  const n = d.n, dn = d.d, amt = d.amt, ans = of(n, dn, amt), kind = n < dn ? 0 : n === dn ? 1 : 2;
  const names = ["less than " + fmt(amt), "equal to " + fmt(amt), "more than " + fmt(amt)];
  const because = n < dn ? tx(n, dn) + " is less than 1 whole (a proper fraction)" : n === dn ? tx(n, dn) + " is exactly 1 whole" : tx(n, dn) + " is more than 1 whole (an improper fraction)";
  const opts = names.map((t, i) => ({ html: t, ok: i === kind, why: i === kind ? "" : cap(because) + ". So the answer is " + names[kind] + "." }));
  return {
    q: opText(n, dn, amt) + " is:", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: amPic(n, dn, amt, "ask"), step: "Compare the numerator and the denominator. Is " + tx(n, dn) + " less than 1 whole, or more?" },
    worked: { text: cap(because) + ". " + cap(opWork(n, dn, amt)) + ". " + fmt(ans) + " is " + names[kind] + ".", pic: amPic(n, dn, amt) },
    yes: cap(because) + ": " + opText(n, dn, amt) + " = " + fmt(ans) + ".", key: names[kind]
  };
};

M.fopmore = function (d) {
  const a = d.a, b = d.b, va = of(a.n, a.d, a.amt), vb = of(b.n, b.d, b.amt), kind = va > vb ? 0 : vb > va ? 1 : 2;
  const ta = opText(a.n, a.d, a.amt, d.unit), tb = opText(b.n, b.d, b.amt, d.unit);
  const facts = ta + " = " + fmt(va) + " and " + tb + " = " + fmt(vb) + ".";
  const opts = [ta, tb, "They are equal."].map((t, i) => ({ html: t, alt: i < 2 ? (i ? b : a).n + " over " + (i ? b : a).d + " of " + (i ? b : a).amt : null, ok: i === kind,
    why: i === kind ? "" : facts + (kind === 2 ? " They are the same." : " " + fmt(Math.max(va, vb)) + " is more than " + fmt(Math.min(va, vb)) + ".") }));
  return {
    q: "Which is more?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: [amPic(a.n, a.d, a.amt, "ask"), amPic(b.n, b.d, b.amt, "ask")].filter(Boolean), step: "Work out each one: divide by the denominator, then multiply by the numerator. Then compare." },
    worked: { text: cap(opWork(a.n, a.d, a.amt)) + ". " + cap(opWork(b.n, b.d, b.amt)) + ". " + (kind === 2 ? "Both are " + fmt(va) + "." : fmt(Math.max(va, vb)) + " is more than " + fmt(Math.min(va, vb)) + ".") },
    yes: facts, key: kind === 2 ? "They are equal." : (kind ? tx(b.n, b.d) + " of " + fmt(b.amt) : tx(a.n, a.d) + " of " + fmt(a.amt))
  };
};

/* the whole from a part: n/d of ? = part */
M.fopmiss = function (d) {
  const n = d.n, dn = d.d, amt = d.amt, part = of(n, dn, amt), each = amt / dn, u = d.unit || "";
  return {
    q: F(n, dn) + " of a number is <b>" + fmt(part) + "</b>. What is the number?",
    fig: d.bar ? amPic(n, dn, amt, "back") : null,
    lines: ["The number is {0}"], blanks: [box(amt)],
    check(r) {
      const v = int(r.v[0]);
      if (v === amt) return { ok: true, parts: [true] };
      let msg = fmt(part) + " is " + n + " equal parts. First find one part: " + fmt(part) + " ÷ " + n + ". The number has " + dn + " parts.";
      if (v === each && n !== 1) msg = "That is one part. The number has " + dn + " parts: multiply by " + dn + ".";
      else if (v === part * dn && n !== 1) msg = fmt(part) + " is " + n + " parts, not 1 part. First divide " + fmt(part) + " by " + n + ".";
      else if (part % dn === 0 && v === part / dn * n) msg = "That is " + tx(n, dn) + " of " + fmt(part) + ". But " + fmt(part) + " is already " + tx(n, dn) + " of the number.";
      else if (n < dn && v <= part) msg = fmt(part) + " is only a part of the number. The number is more than " + fmt(part) + ".";
      else if (n > dn && v >= part) msg = tx(n, dn) + " is more than 1 whole. So the number is less than " + fmt(part) + ".";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: d.bar ? null : amPic(n, dn, amt, "back"), step: n + " parts make " + fmt(part) + ". So one part is " + fmt(part) + " ÷ " + n + ". The number has " + dn + " parts." },
    worked: { text: n + " parts are " + fmt(part) + ", so one part is " + fmt(part) + " ÷ " + n + " = " + fmt(each) + ". The number has " + dn + " parts: " + dn + " × " + fmt(each) + " = " + fmt(amt) + ".", pic: amPic(n, dn, amt) },
    yes: "One part is " + fmt(each) + ". " + dn + " × " + fmt(each) + " = " + fmt(amt) + ".", key: fmt(amt), fill: [String(amt)]
  };
};

/* a story in two steps */
M.fopstory = function (d) {
  const n = d.n, dn = d.d, amt = d.amt, first = of(n, dn, amt), u = d.unit || "", k = d.kind;
  const amt2 = d.amt2 != null ? d.amt2 : amt, second = d.n2 ? of(d.n2, d.d2, amt2) : 0;
  let ans, step2, work2, stop;
  if (k === "left") {
    if (n >= dn) throw new Error("fopstory left: a proper fraction is needed");
    ans = amt - first; step2 = "subtract from " + fmt(amt) + " to find what is left.";
    work2 = fmt(amt) + " − " + fmt(first) + " = " + fmt(ans); stop = "That is the part that is used. The question asks for what is left.";
  } else if (k === "extra") {
    if (n <= dn) throw new Error("fopstory extra: an improper fraction is needed");
    ans = first - amt; step2 = "subtract " + fmt(amt) + " to find how many more.";
    work2 = fmt(first) + " − " + fmt(amt) + " = " + fmt(ans); stop = "That is the new amount. The question asks how many more than " + fmt(amt) + ".";
  } else if (k === "each") {
    ans = first * d.by; step2 = d.step2 || "multiply your answer by " + fmt(d.by) + ".";
    work2 = fmt(first) + " × " + fmt(d.by) + " = " + fmt(ans); stop = "That is step 1. Now multiply by " + fmt(d.by) + ".";
  } else if (k === "sum2") {
    ans = first + second; step2 = "find " + tx(d.n2, d.d2) + " of " + fmt(amt2) + " and add.";
    work2 = cap(opWork(d.n2, d.d2, amt2)) + ". " + fmt(first) + " + " + fmt(second) + " = " + fmt(ans); stop = "That is only one of the two parts. Find the other part and add.";
  } else if (k === "diff2") {
    if (first === second) throw new Error("fopstory diff2: the two parts are equal");
    ans = Math.abs(first - second); step2 = "find " + tx(d.n2, d.d2) + " of " + fmt(amt2) + " and subtract the smaller from the bigger.";
    work2 = cap(opWork(d.n2, d.d2, amt2)) + ". " + fmt(Math.max(first, second)) + " − " + fmt(Math.min(first, second)) + " = " + fmt(ans); stop = "That is only one of the two parts. Find the other part and subtract.";
  } else throw new Error("fopstory: kind " + k);
  whole(ans, "the answer");
  /* the fractions of the story come from the numbers: {f} is n/d, {f2} is n2/d2 */
  if (d.text.indexOf("{f}") < 0 || (d.n2 && d.text.indexOf("{f2}") < 0)) throw new Error("fopstory: the text must hold {f}" + (d.n2 ? " and {f2}" : ""));
  return {
    q: d.text.replace("{f}", F(n, dn)).replace("{f2}", d.n2 ? F(d.n2, d.d2) : ""),
    lines: ["{0}" + un(u)], blanks: [box(Math.max(ans, first, second))],
    check(r) {
      const v = int(r.v[0]);
      if (v === ans) return { ok: true, parts: [true] };
      let msg = "Two steps. First find " + tx(n, dn) + " of " + fmt(amt) + ". Then " + step2;
      if (v === first || (second && v === second)) msg = stop;
      else if (v === amt / dn && n !== 1) msg = "That is one part (" + tx(1, dn) + "). You need " + n + " parts first. Then " + step2;
      else if ((k === "sum2" || k === "diff2") && v === (k === "sum2" ? Math.abs(first - second) : first + second)) msg = k === "sum2" ? "You subtracted. Here the two parts are put together: add." : "You added. The question asks for the difference: subtract.";
      else if (k === "left" && v === amt + first) msg = "The part is taken away, so subtract it from " + fmt(amt) + ".";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: amPic(n, dn, amt, "ask"), step: "Step 1: find " + tx(n, dn) + " of " + fmt(amt) + ": divide by " + dn + ", then multiply by " + n + ". Step 2: " + step2 },
    worked: { text: cap(opWork(n, dn, amt)) + ". " + work2 + ". The answer is " + fmt(ans) + un(u) + ".", pic: amPic(n, dn, amt) },
    yes: cap(opWork(n, dn, amt)) + ". " + work2 + ".", key: fmt(ans), fill: [String(ans)]
  };
};

/* ---------- spot the mistake ---------- */
/* shared: tick the mistake (a), then write the right answer (b) */
function fixTask(o) {
  const opts = arrange(o.reasons.map((x, i) => ({ html: x.t, ok: i === 0, why: x.why || "" })), o.at);
  return {
    q: o.q, marks: 2, ab: true, sub: "What was the mistake? Tick (✓) one box.", letters: true, opts: opts,
    abAsk: o.abAsk, lines: o.lines, blanks: o.blanks,
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const op = opts[r.pick], pickOk = !!(op && op.ok), parts = o.parts(r.v || []), vOk = parts.every(Boolean);
      if (pickOk && vOk) return { ok: true, parts: parts, pickOk: true };
      const msg = !pickOk ? (op && op.why ? op.why : "Read the three boxes again.") + (vOk ? "" : " Then work it out yourself.") : o.slip(r.v || []);
      return { ok: false, msg: msg, parts: parts, pickOk: pickOk };
    },
    hint: o.hint, worked: o.worked, yes: o.yes, key: o.key, fill: o.fill
  };
}

M.fsimpfix = function (d) {
  const n = d.n, dn = d.d, g = gcd(n, dn), s = simp(n, dn), p = prime(n, dn), P = pp(d.he);
  const sp = x => [2, 3, 5, 7, 11, 13].find(q => x % q === 0);
  const made = { part: [n / p, dn / p], top: [n / g, dn], sub: [n - g, dn - g], two: [n / g, dn / sp(dn)] };
  const w = made[d.slip];
  if (!w || g === 1 || !(w[0] > 0) || (w[0] === s[0] && w[1] === s[1])) throw new Error("fsimpfix: the slip " + d.slip + " does not give a wrong answer for " + tx(n, dn));
  /* is each sentence true of the wrong answer w? Only the sentence of the slip may be true. */
  const equal = w[0] * dn === w[1] * n;
  const truth = {
    part: equal && gcd(w[0], w[1]) > 1,
    top: w[1] === dn && w[0] < n && n % w[0] === 0,
    sub: w[0] < n && n - w[0] === dn - w[1],
    two: w[0] < n && w[1] < dn && n % w[0] === 0 && dn % w[1] === 0 && n / w[0] !== dn / w[1]
  };
  const SAY = {
    part: P.He + " stopped too soon: " + F(w[0], w[1]) + " can be simplified again.",
    top: P.He + " divided only the numerator.",
    sub: P.He + " subtracted the same number from the numerator and the denominator.",
    two: P.He + " divided the numerator and the denominator by different numbers."
  };
  const WHY = {
    part: equal ? "Only 1 divides both " + w[0] + " and " + w[1] + ", so " + P.he + " did not stop too soon." : F(w[0], w[1]) + " is not equal to " + F(n, dn) + ". So this is not just stopping too soon.",
    top: "Look at the denominator: " + dn + " changed to " + w[1] + ".",
    sub: w[1] === dn ? "The numerator goes down by " + (n - w[0]) + ", but the denominator does not change. Not the same number." : n + " − " + w[0] + " = " + (n - w[0]) + ", but " + dn + " − " + w[1] + " = " + (dn - w[1]) + ". Not the same number.",
    two: n % w[0] === 0 && dn % w[1] === 0 && n / w[0] === dn / w[1] ? "Both numbers were divided by " + n / w[0] + ". That step is right." : "Check: is " + w[0] + " the answer to " + n + " ÷ a whole number, and " + w[1] + " to " + dn + " ÷ a whole number?"
  };
  if (!truth[d.slip]) throw new Error("fsimpfix: the sentence for " + d.slip + " is not true for " + tx(n, dn));
  const others = ["part", "top", "sub", "two"].filter(k => k !== d.slip && !truth[k]).slice(0, 2);
  if (others.length < 2) throw new Error("fsimpfix: not enough wrong sentences for " + tx(n, dn));
  const WORK = {
    part: w[0] + " and " + w[1] + " can both be divided by " + prime(w[0], w[1]) + ", so " + F(w[0], w[1]) + " is not the simplest form.",
    top: P.He + " must divide the denominator by " + g + " too.",
    sub: "Subtracting changes the value of a fraction. " + P.He + " must divide.",
    two: P.He + " divided " + n + " by " + n / w[0] + " and " + dn + " by " + dn / w[1] + ". Both must be divided by the same number."
  };
  return fixTask({
    q: d.who + " writes " + F(n, dn) + " in its simplest form. " + cap(P.his) + " answer is " + F(w[0], w[1]) + ". It is wrong.", at: d.at,
    reasons: [{ t: SAY[d.slip] }].concat(others.map(k => ({ t: SAY[k], why: WHY[k] }))),
    abAsk: "Write " + F(n, dn) + " in its simplest form.", lines: [F(n, dn) + " = " + FB(0, 1)], blanks: [FR, FR],
    parts: v => [int(v[0]) === s[0], int(v[1]) === s[1]],
    slip: v => (int(v[0]) === w[0] && int(v[1]) === w[1] ? "That is " + d.who + "'s answer. " : "The mistake is right. ") + simpSlip(n, dn, int(v[0]), int(v[1])),
    hint: { pic: barOk(n, dn) ? { k: "fbar", n: n, d: dn } : null, step: "Simplify " + tx(n, dn) + " yourself: divide both numbers by the same number until only 1 divides both. Then compare." },
    worked: { text: cap(divSteps(n, dn)) + ", so " + F(n, dn) + " = " + F(s[0], s[1]) + ". " + d.who + " wrote " + F(w[0], w[1]) + ". " + WORK[d.slip], pic: barOk(n, dn) ? { k: "fbar", n: n, d: dn, to: s } : null },
    yes: F(n, dn) + " = " + F(s[0], s[1]) + ".", key: tx(s[0], s[1]), fill: [String(s[0]), String(s[1])]
  });
};

M.fopfix = function (d) {
  const n = d.n, dn = d.d, amt = d.amt, ans = of(n, dn, amt), each = amt / dn, P = pp(d.he);
  const made = { unit: each, flip: amt % n === 0 ? amt / n * dn : NaN, nodiv: amt * n };
  const w = made[d.slip];
  if (!(w > 0) || w === ans) throw new Error("fopfix: the slip " + d.slip + " does not give a wrong answer");
  const SAY = {
    unit: P.He + " found " + F(1, dn) + " of " + fmt(amt) + ", but did not multiply by " + n + ".",
    flip: P.He + " divided by the numerator and multiplied by the denominator.",
    nodiv: P.He + " multiplied by " + n + ", but did not divide by " + dn + "."
  };
  const WHY = {
    unit: tx(1, dn) + " of " + fmt(amt) + " is " + fmt(each) + ", not " + fmt(w) + ".",
    flip: isNaN(made.flip) ? fmt(amt) + " ÷ " + n + " × " + dn + " is " + (amt * dn > 2 * w * n ? "much " : "") + (amt * dn > w * n ? "more" : "less") + " than " + fmt(w) + ". So " + P.he + " did not do that." : fmt(amt) + " ÷ " + n + " × " + dn + " = " + fmt(made.flip) + ", not " + fmt(w) + ".",
    nodiv: fmt(amt) + " × " + n + " = " + fmt(amt * n) + ", not " + fmt(w) + "."
  };
  const others = ["unit", "flip", "nodiv"].filter(k => k !== d.slip && made[k] !== w);
  if (others.length < 2) throw new Error("fopfix: not enough wrong sentences");
  const WORK = { unit: P.He + " found only one part.", flip: P.He + " mixed up the numerator and the denominator.", nodiv: P.He + " forgot to share into " + dn + " equal parts first." };
  return fixTask({
    q: d.who + " works out " + opText(n, dn, amt) + ". " + cap(P.his) + " answer is <b>" + fmt(w) + "</b>. It is wrong.", at: d.at,
    reasons: [{ t: SAY[d.slip] }].concat(others.map(k => ({ t: SAY[k], why: WHY[k] }))),
    abAsk: "Write the correct answer.", lines: [opText(n, dn, amt) + " = {0}"], blanks: [box(Math.max(ans, w))],
    parts: v => [int(v[0]) === ans],
    slip: v => (int(v[0]) === w ? "That is " + d.who + "'s answer. " : "The mistake is right. ") + opSlip(n, dn, amt, int(v[0]) === w ? NaN : int(v[0])).replace("Write a number.", "First find one part: " + fmt(amt) + " ÷ " + dn + ". Then multiply by " + n + "."),
    hint: { pic: amPic(n, dn, amt, "ask"), step: "Work it out yourself: " + fmt(amt) + " ÷ " + dn + ", then × " + n + ". Then look at what " + d.who + " did." },
    worked: { text: cap(opWork(n, dn, amt)) + ". So " + opText(n, dn, amt) + " = " + fmt(ans) + ". " + d.who + " wrote " + fmt(w) + ". " + WORK[d.slip], pic: amPic(n, dn, amt) },
    yes: opText(n, dn, amt) + " = " + fmt(ans) + ".", key: fmt(ans), fill: [String(ans)]
  });
};

MX.s5 = { simp: simp, of: of, simpSlip: simpSlip, opSlip: opSlip };
})();

