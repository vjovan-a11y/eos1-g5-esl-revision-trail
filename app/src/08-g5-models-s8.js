/* 08-g5-models-s8.js - Grade 5 question models for Stop 8, Circles: the parts of a circle (6Gg.02) and drawing a
   circle of a given radius or diameter with compasses (6Gg.11). Every length is worked out here from the numbers in
   the data. A length is given as text ('3.5') and kept exact as thousandths (MX.D, 07-g5-models-base.js); the
   circumference is only named, never calculated. Each model takes ONE of r (the radius) or d (the diameter): the
   other one is worked out (d = 2 x r).

   cname   { part: 'centre' | 'radius' | 'diameter' | 'circumference', a?: 30, at }      name the part marked "?" (tick)
   cshow   { part, opts: ['diameter', 'chord', 'radius'], a?, at }     which picture shows the part? (opts[0] = part;
                                                                        also 'chord': misses the centre, 'short': stops short)
   cline   { ask: 'r' | 'd' | 'none', lines: ['c', 'r', 'd'], turn?: 0, tap?: true }
                                                  which line is a radius / a diameter / neither? lines: the kind of line
                                                  A, B, C (, D): r, d, c (misses the centre), s (from the centre, stops
                                                  short). tap: answered on the circle tool (cparts), else tick a box
   crd     { items: [{ r: '3.5' } | { d: '9' }, ...], unit: 'cm', fig?: true, text? }    radius <-> diameter (typed);
                                                  text: a real-life sentence for ONE item, with {r} or {d} for the length
   ccset   { r | d, unit: 'cm', who?, to?: 'cm' } the opening of the compasses for this circle (to: give the answer in
                                                  another unit: mm, cm, m)
   cdraw   { r | d, at: 'P', pts?: [['P', 5, 5], ['M', 3, 7]] }      draw the circle with the compasses tool (cm, halves)
   cwhich  { r | d, wrong: ['5', '1.5'], size?: 10, at }   which circle on the centimetre grid? (wrong: the radii of the others)
   crow    { n, r, give: 'r' | 'd', ask: 'len' | 'r' | 'd' | 'n', unit, text?, box?, obj? }    n equal circles touch in
                                                  a row (two steps). r is the radius of one circle; give: what the
                                                  question tells; text: with {n} {r} {d} {len}; obj: the word for one
                                                  and for many, e.g. ['plate', 'plates'] (default circle, circles)
   csq     { r, give: 'r' | 'd' | 'side', ask: 'side' | 'perim' | 'r' | 'd', unit, text? }   a circle that fits exactly
                                                  inside a square; text: with {r} {d} {side}
   ccfix   { who, kind: 'set' | 'same', d | r, unit, text?, at }   spot the mistake (tick), then write the right length.
                                                  set: the compasses were opened to the diameter (give d);
                                                  same: the radius was taken as the distance across (give r;
                                                  text with {who} {r})
   cprop   { want: true | false, ids: ['t1', 'f3', 'f6'], at }       which sentence about circles is true / not true?
                                                  (ids[0] is the answer; the sentences are in PROPS below) */
(function () {
"use strict";
const M = MX.M, D = MX.D, arrange = MX.arrange, cap = MX.cap, LET = MX.LET;
const L = (t, u) => D.s(t) + " " + u;                                  /* 3500, 'cm' -> '3.5 cm' */
const raw = t => D.s(t).replace(/,/g, "");                             /* the text to type: no comma */
const UN = { mm: 1, cm: 10, m: 1000 }, UNAME = { mm: "millimetres", cm: "centimetres", m: "metres" };
function conv(t, from, to) {
  const v = t * UN[from] / UN[to];
  if (v !== Math.floor(v)) throw new Error("circle: " + t + " " + from + " is not exact in " + to);
  return v;
}
/* the radius and the diameter, in thousandths, from the one that is given */
function rd(d) {
  if (d.r != null) { const r = D.p(d.r); if (isNaN(r) || r <= 0) throw new Error("circle: bad radius " + d.r); return { r: r, d: 2 * r, from: "r" }; }
  const dd = D.p(d.d);
  if (isNaN(dd) || dd <= 0 || dd % 2) throw new Error("circle: bad diameter " + d.d);
  return { r: dd / 2, d: dd, from: "d" };
}
const tpl = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? "<b>" + o[k] + "</b>" : m));

/* what went wrong when a radius is changed into a diameter (ask 'd') or back (ask 'r') */
function slip(ask, c, typed, u) {
  const v = D.p(typed);
  if (isNaN(v)) return "Write a number.";
  if (ask === "d") {
    if (v === c.r) return "That is the radius. The diameter goes all the way across: 2 radii.";
    if (v * 2 === c.r) return "You halved the radius. For the diameter, double it.";
    if (v === c.r + 2000) return "Do not add 2. Double the radius: " + D.s(c.r) + " × 2.";
    return "Diameter = 2 × radius. Double " + L(c.r, u) + ".";
  }
  if (v === c.d) return "That is the diameter. The radius is only half of it.";
  if (v === c.d * 2) return "You doubled. The radius is shorter than the diameter: halve it.";
  if (v === c.d - 2000) return "Do not take away 2. Halve the diameter: " + D.s(c.d) + " ÷ 2.";
  return "Radius = diameter ÷ 2. Halve " + L(c.d, u) + ".";
}

/* ---------- the parts of a circle ---------- */
const NAMES = ["centre", "radius", "diameter", "circumference"];
const WHAT = {
  centre: "the point in the middle of the circle",
  radius: "a straight line from the centre to the circumference",
  diameter: "a straight line across the circle, through the centre",
  circumference: "the line all the way round the circle",
  chord: "a straight line across the circle that misses the centre",
  short: "a line from the centre that stops before the circumference"
};
const THE = k => (k === "centre" || k === "circumference" ? "the " + k : k === "chord" || k === "short" ? WHAT[k] : "a " + k);
function partFig(part, a, lab) {
  a = a == null ? 30 : a;
  if (part === "centre") return { k: "circle", dot: "hl", dotLab: lab || "" };
  if (part === "circumference") return { k: "circle", ring: "hl", ringLab: lab || "" };
  const t = { radius: "r", diameter: "d", chord: "c", short: "s" }[part];
  if (!t) throw new Error("circle: no part " + part);
  return { k: "circle", lines: [{ t: t, a: a, lab: lab || "", hl: true }] };
}

M.cname = function (d) {
  const part = d.part;
  if (NAMES.indexOf(part) < 0) throw new Error("cname: no part " + part);
  const opts = arrange([part].concat(NAMES.filter(x => x !== part)).map((x, i) => ({ html: x, ok: i === 0,
    why: i === 0 ? "" : cap(THE(x)) + " is " + WHAT[x] + ". Look at the part marked ? again." })), d.at);
  return {
    q: "Look at the circle. What is the name of the part marked <b>?</b>", sub: "Tick (✓) one box.",
    fig: partFig(part, d.a, "?"), opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Is it a point, a straight line or a curved line? Does it pass through the centre?" },
    worked: { text: "The part marked ? is " + WHAT[part] + ". It is " + THE(part) + ".", pic: partFig(part, d.a, part) },
    yes: cap(THE(part)) + " is " + WHAT[part] + ".",
    key: part
  };
};

M.cshow = function (d) {
  const part = d.part, a0 = d.a == null ? 20 : d.a;
  if (d.opts[0] !== part || new Set(d.opts).size !== d.opts.length) throw new Error("cshow: opts[0] must be the part, all different");
  const opts = arrange(d.opts.map((x, i) => ({ html: "", fig: partFig(x, a0 + i * 55), alt: "A circle with " + WHAT[x], ok: i === 0,
    why: i === 0 ? "" : "This picture shows " + THE(x) + ". " + cap(THE(part)) + " is " + WHAT[part] + "." })), d.at);
  const right = opts.findIndex(o => o.ok);
  return {
    q: "Which picture shows <b>" + THE(part) + "</b> of the circle?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: cap(THE(part)) + " is " + WHAT[part] + "." },
    worked: { text: "Picture " + LET[right] + " shows " + THE(part) + ": " + WHAT[part] + ".", pic: partFig(part, a0, part) },
    yes: cap(THE(part)) + " is " + WHAT[part] + ".",
    key: LET[right]
  };
};

const SAYS = {
  r: "goes from the centre to the circumference. It is a radius.",
  d: "goes across the circle, through the centre. It is a diameter.",
  c: "goes across the circle, but it does not pass through the centre. It is not a diameter and not a radius.",
  s: "starts at the centre, but it stops before the circumference. It is not a radius."
};
M.cline = function (d, mode) {
  const kinds = d.lines, n = kinds.length, turn = d.turn || 0;
  const slots = n === 4 ? [90, 162, 234, 306] : [90, 210, 330];          /* four lines: fifths of a turn, so a diameter ends in a gap */
  if (n < 3 || n > 4 || kinds.some(k => !SAYS[k])) throw new Error("cline: 3 or 4 lines of kind r, d, c, s");
  const fits = k => (d.ask === "none" ? k === "c" || k === "s" : k === d.ask);
  if (kinds.filter(fits).length !== 1) throw new Error("cline: exactly one line must fit");
  const right = kinds.findIndex(fits), lines = kinds.map((k, i) => Object.assign({ t: k, a: slots[i] + turn, tag: LET[i] }, k === "c" && n === 4 ? { off: 0.86 } : {}));
  const q = d.ask === "r" ? "Which line is a <b>[[radius]]</b> of the circle?" : d.ask === "d" ? "Which line is a <b>[[diameter]]</b> of the circle?"
    : "Which line is <b>not</b> a radius and <b>not</b> a diameter?";
  const tell = i => "Line " + LET[i] + " " + SAYS[kinds[i]];
  const step = d.ask === "r" ? "A radius starts at the centre and ends on the circumference."
    : d.ask === "d" ? "A diameter goes from one side of the circle to the other, through the centre."
    : "Check each line. Does it pass through the centre? Does it reach the circumference?";
  const base = {
    q: q,
    hint: { step: step },
    worked: { text: kinds.map((k, i) => tell(i)).join(" "), pic: { k: "circle", lines: lines.map((x, i) => Object.assign({}, x, { hl: i === right, dim: i !== right })) } },
    yes: tell(right), key: "Line " + LET[right]
  };
  if (d.tap) {
    return Object.assign(base, {
      how: mode === "our" ? "Let's do it together. " + step + " Tap the letter of that line." : "Look at the circle. Tap the letter of the line.",
      ui: { k: "cparts", pick: true, lines: lines }, right: { choice: LET[right] },
      ready: r => !!r.choice,
      check(r) { return r.choice === LET[right] ? { ok: true } : { ok: false, msg: tell(LET.indexOf(r.choice)) + " " + step }; },
      given: r => "Line " + r.choice
    });
  }
  const opts = kinds.map((k, i) => ({ html: "Line " + LET[i], ok: i === right, why: i === right ? "" : tell(i) }));
  return Object.assign(base, {
    sub: "Tick (✓) one box.", fig: { k: "circle", plain: true, lines: lines }, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " " + step }; }
  });
};

/* ---------- radius and diameter ---------- */
M.crd = function (d) {
  const u = d.unit || "cm", it = d.items.map(x => { const c = rd(x); return Object.assign(c, { ask: c.from === "r" ? "d" : "r" }); });
  const one = it.length === 1, c0 = it[0];
  const NM = { r: "radius", d: "diameter" };
  const ans = it.map(c => c[c.ask]);
  const work = c => (c.ask === "d" ? "Diameter = 2 × radius = 2 × " + D.s(c.r) + " = " + L(c.d, u) : "Radius = diameter ÷ 2 = " + D.s(c.d) + " ÷ 2 = " + L(c.r, u));
  const q = d.text && one ? tpl(d.text, { r: L(c0.r, u), d: L(c0.d, u) })
    : one ? (d.fig ? "Look at the circle. Its [[" + NM[c0.from] + "]] is <b>" : "The [[" + NM[c0.from] + "]] of a circle is <b>") + L(c0[c0.from], u) + "</b>. What is its [[" + NM[c0.ask] + "]]?"
    : "Write the missing lengths.";
  const fig = !d.fig ? null : c0.from === "r"
    ? { k: "circle", lines: [{ t: "d", a: 0, lab: "?" }, { t: "r", a: 125, lab: L(c0.r, u) }] }
    : { k: "circle", lines: [{ t: "d", a: 0, lab: L(c0.d, u) }, { t: "r", a: 235, lab: "?" }] };
  return {
    q: q, marks: it.length, fig: fig,
    lines: it.map((c, i) => (one ? NM[c.ask] + " = {0} " + u : "<i>(" + "abc"[i] + ")</i> " + NM[c.from] + " " + L(c[c.from], u) + ", " + NM[c.ask] + " = {" + i + "} " + u)),
    blanks: it.map(() => ({ len: 6, w: one ? "big" : "box", dec: 3 })),
    check(r) {
      const parts = it.map((c, i) => D.eq(r.v[i], ans[i]));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: (one ? "" : "Look at (" + "abc"[i] + "). ") + slip(it[i].ask, it[i], r.v[i], u), parts: parts };
    },
    hint: {
      pic: c0.ask === "d" ? { k: "circle", lines: [{ t: "r", a: 0, lab: L(c0.r, u) }, { t: "r", a: 180, lab: L(c0.r, u), dash: true }] } : { k: "circle", lines: [{ t: "d", a: 0, lab: L(c0.d, u) }] },
      step: one ? (c0.ask === "d" ? "The diameter is 2 radii in a straight line. Double " + L(c0.r, u) + "." : "The centre cuts the diameter into 2 equal parts. Halve " + L(c0.d, u) + ".")
        : "The diameter is double the radius. The radius is half of the diameter."
    },
    worked: { text: it.map(work).join(". ") + ".", pic: one ? { k: "circle", lines: [{ t: "d", a: 0, lab: L(c0.d, u) }, { t: "r", a: 125, lab: L(c0.r, u) }] } : null },
    yes: it.map(work).join(". ") + ".",
    key: ans.map(t => L(t, u)).join(" ; "), fill: ans.map(raw)
  };
};

/* ---------- the compasses ---------- */
M.ccset = function (d) {
  const u = d.unit || "cm", to = d.to || u, c = rd(d), ans = conv(c.r, u, to), dia = conv(c.d, u, to);
  const NM = c.from === "r" ? "radius" : "diameter";
  const half = c.from === "d" ? "Radius = " + D.s(c.d) + " ÷ 2 = " + L(c.r, u) + "." : "The radius is given: " + L(c.r, u) + ".";
  const change = to !== u ? " " + L(c.r, u) + " = " + L(ans, to) + "." : "";
  const h = to === "cm" && ans % 500 === 0 && ans >= 500 && ans <= 5000;
  return {
    q: (d.who ? d.who + " wants" : "You want") + " to draw a circle with a <b>" + NM + "</b> of <b>" + L(c[c.from], u) + "</b>. What is the distance between the point and the pencil of the [[compasses]]?" +
      (to !== u ? " Give your answer in " + UNAME[to] + "." : ""),
    lines: ["{0} " + to], blanks: [{ len: 6, w: "big", dec: 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (D.eq(r.v[0], ans)) return { ok: true };
      let msg = "The point is on the centre and the pencil is on the circumference. That distance is the radius.";
      if (v === dia) msg = c.from === "d" ? "That is the diameter. The compasses are set to the radius: halve the diameter." : "That is the diameter. The compasses are set to the radius, and you know the radius.";
      else if (c.from === "r" && v * 2 === ans) msg = "The radius is given. Do not halve it.";
      else if (to !== u && v === c.r) msg = "That is in " + UNAME[u] + ". Change it to " + UNAME[to] + ".";
      else if (c.from === "d" && v * 4 === dia) msg = "You halved two times. Halve the diameter once.";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: c.from === "d" ? { k: "circle", lines: [{ t: "d", a: 0, lab: L(c.d, u) }, { t: "r", a: 125, lab: "?" }] } : { k: "circle", lines: [{ t: "r", a: 0, lab: L(c.r, u) }] },
      step: "The point of the compasses is on the centre. The pencil is on the circumference. So the opening is the radius." + (c.from === "d" ? " Halve the diameter." : "") },
    worked: { text: "The compasses are set to the radius. " + half + change, pic: h ? { k: "cruler", r: raw(ans) } : { k: "circle", lines: [{ t: "d", a: 0, lab: L(c.d, u) }, { t: "r", a: 125, lab: L(c.r, u) }] } },
    yes: "The compasses are set to the radius. " + half + change,
    key: L(ans, to), fill: [raw(ans)]
  };
};

M.cdraw = function (d, mode) {
  const c = rd(d), h = c.r / 500, at = d.at || "P", pts = d.pts || [[at, 5, 5]];
  if (h !== Math.floor(h) || h < 1 || h > 10) throw new Error("cdraw: the radius must be 0.5 cm to 5 cm, in halves");
  if (!pts.some(p => p[0] === at)) throw new Error("cdraw: the centre " + at + " is not a marked point");
  const u = "cm", cmOf = hh => D.s(hh * 500);
  const text = (c.from === "d" ? "Halve the diameter: " + D.s(c.d) + " ÷ 2 = " + D.s(c.r) + ". " : "") + "Open the compasses to the radius, " + L(c.r, u) + ". Put the point on " + at + " and draw.";
  return {
    q: "Use the [[compasses]]. Draw a circle " + (c.from === "r" ? "with a [[radius]] of <b>" + L(c.r, u) + "</b>" : "that is <b>" + L(c.d, u) + "</b> across (its [[diameter]])") + ". Its [[centre]] is <b>" + at + "</b>.",
    how: mode === "our" ? "Let's do it together. Open the compasses with <b>+</b>. Tap point " + at + ". Then tap <b>Draw</b>." : "Set the compasses. Tap the centre. Then tap <b>Draw</b>.",
    ui: { k: "compass", pts: pts }, right: { h: h, at: at, drawn: true },
    ready: r => !!r.drawn,
    check(r) {
      if (!r.drawn) return { ok: false, msg: "Tap Draw to draw your circle." };
      if (r.at !== at) return { ok: false, msg: "The centre must be " + at + ". Put the point of the compasses on " + at + "." };
      if (r.h === h) return { ok: true };
      const open = "Your compasses are open " + cmOf(r.h) + " cm. ";
      if (r.h === 2 * h) return { ok: false, msg: c.from === "d" ? open + "That is the diameter. Set them to the radius: half of " + L(c.d, u) + "." : open + "Your circle is too big. The radius must be " + L(c.r, u) + "." };
      if (c.from === "r" && r.h * 2 === h) return { ok: false, msg: open + "The radius is given: do not halve it." };
      return { ok: false, msg: open + (c.from === "d" ? "The opening is the radius: half of " + L(c.d, u) + "." : "They must be open " + L(c.r, u) + ": the radius.") };
    },
    hint: { pic: c.from === "d" ? { k: "circle", lines: [{ t: "d", a: 0, lab: L(c.d, u) }, { t: "r", a: 125, lab: "?" }] } : { k: "circle", lines: [{ t: "r", a: 0, lab: L(c.r, u) }] },
      step: "The opening of the compasses is the radius." + (c.from === "d" ? " Halve the diameter first: " + D.s(c.d) + " ÷ 2." : "") },
    worked: { text: text, pic: { k: "cgrid", r: raw(c.r), lab: c.from === "r", across: c.from === "d", big: true } },
    yes: "The compasses were open " + L(c.r, u) + ": the radius. The circle is " + L(c.d, u) + " across.",
    key: "compasses open " + L(c.r, u) + ", point on " + at,
    given: r => "open " + r.r + " cm, point on " + (r.at || "no point")
  };
};

M.cwhich = function (d) {
  const c = rd(d), u = "cm", rs = [raw(c.r)].concat((d.wrong || []).map(String)), size = d.size || 10;
  const hs = rs.map(x => D.p(x));
  if (hs.some(t => isNaN(t) || t % 500 || t < 500 || t > size * 500 - 500) || new Set(hs).size !== hs.length || hs.length < 3) throw new Error("cwhich: 3 different radii in halves that fit on the grid");
  const opts = arrange(hs.map((t, i) => ({ html: "", fig: { k: "cgrid", r: rs[i], size: size }, alt: "A circle on the grid. From its centre to the circle is " + D.s(t) + " squares.", ok: i === 0,
    why: i === 0 ? "" : "This circle has a radius of " + L(t, u) + ", so it is " + L(t * 2, u) + " across." + (t === c.d ? " The compasses were set to the diameter." : "") })), d.at);
  const right = opts.findIndex(o => o.ok);
  return {
    q: "Each small square is <b>1 cm</b> wide. Which circle has a <b>" + (c.from === "r" ? "radius" : "diameter") + "</b> of <b>" + L(c[c.from], u) + "</b>?",
    sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { step: "Count the squares from the centre to the circle. That is the radius." + (c.from === "d" ? " The diameter is 2 radii." : "") },
    worked: { text: "Circle " + LET[right] + " has a radius of " + L(c.r, u) + ". " + (c.from === "d" ? "Its diameter is 2 × " + D.s(c.r) + " = " + L(c.d, u) + "." : "Count the squares from the centre to the circle."),
      pic: { k: "cgrid", r: raw(c.r), size: size, lab: c.from === "r", across: c.from === "d", big: true } },
    yes: "A radius of " + L(c.r, u) + " gives a diameter of " + L(c.d, u) + ".",
    key: LET[right]
  };
};

/* ---------- two steps: circles in a row, a circle inside a square ---------- */
M.crow = function (d) {
  const u = d.unit || "cm", n = d.n, c = rd({ r: d.r }), len = n * c.d, give = d.give || "r", ask = d.ask || "len";
  if (!(n >= 2 && n <= 12 && n === Math.floor(n))) throw new Error("crow: n must be 2 to 12");
  const NM = { r: "radius", d: "diameter" }, o = { n: n, r: L(c.r, u), d: L(c.d, u), len: L(len, u) };
  const ob = d.obj || ["circle", "circles"], one1 = "One " + ob[0];
  const told = "Each circle has a <b>" + NM[give] + "</b> of <b>" + L(c[give], u) + "</b>.";
  const q = d.text ? tpl(d.text, o)
    : ask === "len" ? "<b>" + n + "</b> equal circles touch in a row. " + told + " How long is the row?"
    : ask === "n" ? "Equal circles touch in a row. " + told + " The row is <b>" + L(len, u) + "</b> long. How many circles are in the row?"
    : "<b>" + n + "</b> equal circles touch in a row. The row is <b>" + L(len, u) + "</b> long. What is the <b>" + NM[ask] + "</b> of one circle?";
  const ans = ask === "len" ? len : ask === "n" ? n * 1000 : c[ask];
  const one = give === "r" ? one1 + " is 2 radii wide: 2 × " + D.s(c.r) + " = " + L(c.d, u) + "." : one1 + " is " + L(c.d, u) + " wide.";
  const work = ask === "len" ? one + " " + n + " " + ob[1] + ": " + n + " × " + D.s(c.d) + " = " + L(len, u) + "."
    : ask === "n" ? one + " " + D.s(len) + " ÷ " + D.s(c.d) + " = " + n + " " + ob[1] + "."
    : one1 + " is " + D.s(len) + " ÷ " + n + " = " + L(c.d, u) + " wide. That is its diameter." + (ask === "r" ? " Radius = " + D.s(c.d) + " ÷ 2 = " + L(c.r, u) + "." : "");
  const fig = ask === "n" ? null : { k: "crow", n: n, box: !!d.box, lab: ask === "len" ? "?" : L(len, u),
    r: ask === "len" && give === "r" ? L(c.r, u) : ask === "r" ? "?" : "", d: ask === "len" && give === "d" ? L(c.d, u) : ask === "d" ? "?" : "" };
  return {
    q: q, fig: fig, marks: 1,
    lines: [ask === "n" ? "{0} circles" : "{0} " + u], blanks: [{ len: 6, w: "big", dec: ask === "n" ? 0 : 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (D.eq(r.v[0], ans)) return { ok: true };
      let msg;
      if (ask === "len") {
        msg = one1 + " is " + L(c.d, u) + " wide. There are " + n + " " + ob[1] + ".";
        if (give === "r" && v === n * c.r) msg = "You used the radius. " + one1 + " is 2 radii wide. Double first, then multiply by " + n + ".";
        else if (v === c.d) msg = "That is the width of one " + ob[0] + ". There are " + n + " " + ob[1] + " in the row.";
        else if (give === "d" && v === 2 * len) msg = "The diameter is given. Do not double it.";
        else if (v === c.d + n * 1000 || v === c.r + n * 1000) msg = "Do not add. Multiply the width of one " + ob[0] + " by " + n + ".";
      } else if (ask === "n") {
        msg = "How wide is one circle? Then see how many fit in " + L(len, u) + ".";
        if (give === "r" && v * c.r === len) msg = "You divided by the radius. One circle is 2 radii wide: " + L(c.d, u) + ".";
      } else {
        msg = "First share the row between the " + n + " circles: " + D.s(len) + " ÷ " + n + ". That is one diameter.";
        if (ask === "r" && v === c.d) msg = "That is the diameter of one circle. Halve it to find the radius.";
        else if (ask === "d" && v === c.r) msg = "That is the radius. The question asks for the diameter.";
        else if (v === len) msg = "That is the whole row. Share it between the " + n + " circles.";
      }
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: ask === "n" || ask === "len" ? { k: "crow", n: 1, r: give === "r" ? L(c.r, u) : "", d: give === "d" ? L(c.d, u) : "" } : { k: "crow", n: n, lab: L(len, u) },
      step: ask === "len" || ask === "n" ? "Step 1: how wide is one " + ob[0] + "? It is as wide as its diameter." + (ask === "len" ? " Step 2: multiply by " + n + "." : " Step 2: how many fit in the row?")
        : "Step 1: share the row between the " + n + " circles. Step 2: is that the radius or the diameter?" },
    worked: { text: work, pic: ask === "n" ? { k: "crow", n: Math.min(n, 6), d: L(c.d, u), lab: n <= 6 ? L(len, u) : "" } : Object.assign({}, fig, { lab: L(len, u), r: fig.r ? L(c.r, u) : "", d: fig.d ? L(c.d, u) : "" }) },
    yes: work, key: ask === "n" ? String(n) : L(ans, u), fill: [raw(ans)]
  };
};

M.csq = function (d) {
  const u = d.unit || "cm", c = rd({ r: d.r }), give = d.give || "r", ask = d.ask || "side";
  if (give === ask || (give === "side" && ask === "perim")) throw new Error("csq: give and ask do not fit");
  const NM = { r: "radius", d: "diameter" }, side = c.d, perim = 4 * c.d, o = { r: L(c.r, u), d: L(c.d, u), side: L(side, u) };
  const told = give === "side" ? "Each side of the square is <b>" + L(side, u) + "</b> long." : "The <b>" + NM[give] + "</b> of the circle is <b>" + L(c[give], u) + "</b>.";
  const asks = ask === "side" ? "How long is one side of the square?" : ask === "perim" ? "What is the perimeter of the square?" : "What is the <b>" + NM[ask] + "</b> of the circle?";
  const ans = ask === "side" ? side : ask === "perim" ? perim : c[ask];
  const toD = give === "r" ? "Diameter = 2 × " + D.s(c.r) + " = " + L(c.d, u) + ". " : "";
  const work = ask === "side" ? toD + "The square is as wide as the circle, so one side is " + L(side, u) + "."
    : ask === "perim" ? toD + "One side of the square is " + L(side, u) + ". Perimeter = 4 × " + D.s(side) + " = " + L(perim, u) + "."
    : "The circle is as wide as the square, so its diameter is " + L(side, u) + "." + (ask === "r" ? " Radius = " + D.s(c.d) + " ÷ 2 = " + L(c.r, u) + "." : "");
  const lines = give === "r" ? [{ t: "r", a: 0, lab: L(c.r, u) }] : give === "d" ? [{ t: "d", a: 0, lab: L(c.d, u) }] : ask === "r" ? [{ t: "r", a: 0, lab: "?" }] : [{ t: "d", a: 0, lab: "?" }];
  const fig = { k: "circle", sq: give === "side" ? L(side, u) : ask === "side" ? "?" : true, lines: lines };
  return {
    q: d.text ? tpl(d.text, o) : "A circle fits exactly inside a square. " + told + " " + asks, fig: fig,
    lines: ["{0} " + u], blanks: [{ len: 6, w: "big", dec: 3 }],
    check(r) {
      const v = D.p(r.v[0]);
      if (D.eq(r.v[0], ans)) return { ok: true };
      let msg = ask === "r" || ask === "d" ? "The circle touches all four sides. So its diameter is as long as one side of the square." : "The circle touches all four sides. So one side of the square is as long as the diameter.";
      if (ask === "side" && v === c.r) msg = "That is the radius. The square is as wide as the whole circle: the diameter.";
      else if (ask === "perim" && v === side) msg = "That is one side. The perimeter is all 4 sides together.";
      else if (ask === "perim" && v === 4 * c.r) msg = "One side of the square is a diameter, not a radius. Double the radius first.";
      else if (ask === "perim" && v === 2 * side) msg = "A square has 4 equal sides. Multiply one side by 4.";
      else if (ask === "r" && v === side) msg = "That is the diameter. Halve it to find the radius.";
      else if (ask === "side" && give === "d" && v === 2 * c.d) msg = "The diameter is given. Do not double it.";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: { k: "circle", sq: true, lines: [{ t: "d", a: 0, lab: "diameter" }] },
      step: "The circle touches all four sides. The diameter of the circle and the side of the square have the same length." },
    worked: { text: work, pic: { k: "circle", sq: L(side, u), lines: [{ t: "d", a: 0, lab: L(c.d, u) }] } },
    yes: work, key: L(ans, u), fill: [raw(ans)]
  };
};

/* ---------- spot the mistake ---------- */
M.ccfix = function (d) {
  const u = d.unit || "cm", who = d.who, c = rd(d), kind = d.kind || "set";
  let story, reasons, abAsk, ans, fig = null, step, work, line, wrongV;
  if (kind === "set") {
    if (c.from !== "d") throw new Error("ccfix set: give d");
    ans = c.r; wrongV = c.d; line = "{0} " + u;
    story = who + " must draw a circle with a <b>diameter</b> of <b>" + L(c.d, u) + "</b>. " + who + " opens the compasses to <b>" + L(c.d, u) + "</b> and draws the circle. The circle is wrong.";
    reasons = [
      { t: "The compasses must be set to the radius, not to the diameter." },
      { t: "The compasses must be opened to double the diameter.", why: "Then the circle is even bigger. The opening of the compasses is the radius of the circle." },
      { t: "There is no mistake. The circle is " + L(c.d, u) + " across.", why: "With the compasses open " + L(c.d, u) + ", the radius is " + L(c.d, u) + ". So the circle is " + L(2 * c.d, u) + " across." }];
    abAsk = "Write the correct distance between the point and the pencil.";
    if (u === "cm" && c.d % 500 === 0 && c.d <= 5000) fig = { k: "cruler", r: raw(c.d), cap: who + "'s compasses" };
    step = "The opening of the compasses is the radius of the circle. What is the radius when the diameter is " + L(c.d, u) + "?";
    work = "The opening of the compasses is the radius. " + who + "'s circle has a radius of " + L(c.d, u) + ", so it is " + L(2 * c.d, u) + " across. The right opening is " + D.s(c.d) + " ÷ 2 = " + L(c.r, u) + ".";
  } else if (kind === "same") {
    if (c.from !== "r") throw new Error("ccfix same: give r");
    ans = c.d; wrongV = c.r; line = "{0} " + u;
    const o = { who: who, r: L(c.r, u) };
    story = tpl(d.text || "The radius of a circle is {r}. {who} says the circle is {r} across.", o) + " That is wrong.";
    reasons = [
      { t: who + " used the radius. The distance across is the diameter: double the radius." },
      { t: who + " must add 2 to the radius: " + D.s(c.r) + " + 2 = " + L(c.r + 2000, u) + ".", why: "Double means × 2, not + 2." },
      { t: "There is no mistake. The radius is the distance across.", why: "A radius goes only from the centre to the circumference. The distance across, through the centre, is 2 radii." }];
    abAsk = "Write the correct distance across, through the centre.";
    step = "The distance across a circle, through the centre, is the diameter. It is 2 radii.";
    work = "The distance across, through the centre, is the diameter. Diameter = 2 × radius = 2 × " + D.s(c.r) + " = " + L(c.d, u) + ". " + who + " used the radius.";
  } else throw new Error("ccfix: no kind " + kind);
  const opts = arrange(reasons.map((x, i) => ({ html: x.t, ok: i === 0, why: x.why || "" })), d.at);
  return {
    q: story, marks: 2, ab: true, fig: fig,
    sub: "What is the mistake? Tick (✓) one box.", letters: true, opts: opts, abAsk: abAsk,
    lines: [line], blanks: [{ len: 6, w: "big", dec: 3 }],
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const o = opts[r.pick], pickOk = !!(o && o.ok), vOk = D.eq((r.v || [])[0], ans), v = D.p((r.v || [])[0]);
      if (pickOk && vOk) return { ok: true, parts: [true], pickOk: true };
      const msg = !pickOk ? (o && o.why ? o.why : "Read the three boxes again.") + (vOk ? "" : " Then write the right length.")
        : v === wrongV ? "That is " + who + "'s length. " + step : "The mistake is right. Now find the length. " + step;
      return { ok: false, msg: msg, parts: [vOk], pickOk: pickOk };
    },
    hint: { pic: { k: "circle", lines: kind === "set" ? [{ t: "d", a: 0, lab: L(c.d, u) }, { t: "r", a: 125, lab: "?" }] : [{ t: "r", a: 0, lab: L(c.r, u) }, { t: "r", a: 180, lab: L(c.r, u), dash: true }] }, step: step },
    worked: { text: work, pic: { k: "circle", lines: [{ t: "d", a: 0, lab: L(c.d, u) }, { t: "r", a: 125, lab: L(c.r, u) }] } },
    yes: work, key: L(ans, u), fill: [raw(ans)]
  };
};

/* ---------- true or not true: the properties of a circle (checked sentence by sentence) ---------- */
const PROPS = {
  t1: { ok: true, t: "Every radius of a circle has the same length.", why: "Every point on the circumference is the same distance from the centre." },
  t2: { ok: true, t: "A diameter always passes through the centre.", why: "A line across the circle is a diameter only when it goes through the centre." },
  t3: { ok: true, t: "The diameter of a circle is twice as long as its radius.", why: "A diameter is 2 radii in a straight line." },
  t4: { ok: true, t: "The circumference is the line all the way round a circle.", why: "It is the curved line that the pencil of the compasses draws." },
  t5: { ok: true, t: "The compasses are opened to the radius of the circle.", why: "The point is on the centre and the pencil is on the circumference." },
  t6: { ok: true, t: "The radius of a circle is half of its diameter.", why: "The centre cuts every diameter into 2 equal radii." },
  t7: { ok: true, t: "You can draw more than one diameter in a circle.", why: "Every straight line through the centre, from side to side, is a diameter." },
  f1: { ok: false, t: "A radius goes from one side of the circle to the other side.", why: "A radius starts at the centre. A line from side to side, through the centre, is a diameter." },
  f2: { ok: false, t: "The radius of a circle is twice as long as its diameter.", why: "It is the other way round: the diameter is twice as long as the radius." },
  f3: { ok: false, t: "Every straight line across a circle is a diameter.", why: "Only a line that passes through the centre is a diameter." },
  f4: { ok: false, t: "The circumference is a straight line through the centre.", why: "The circumference is the curved line all the way round. A straight line through the centre is a diameter." },
  f5: { ok: false, t: "The compasses are opened to the diameter of the circle.", why: "The compasses are opened to the radius: from the centre to the circumference." },
  f6: { ok: false, t: "A circle has only one radius.", why: "You can draw as many radii as you like. They all have the same length." },
  f7: { ok: false, t: "Some radii of a circle are longer than others.", why: "Every radius of one circle has the same length." },
  f8: { ok: false, t: "The centre is a point on the circumference.", why: "The centre is in the middle. It is the same distance from every point on the circumference." }
};
M.cprop = function (d) {
  const ps = d.ids.map(id => { if (!PROPS[id]) throw new Error("cprop: no sentence " + id); return PROPS[id]; });
  if (ps[0].ok !== d.want || ps.filter(p => p.ok === d.want).length !== 1) throw new Error("cprop: only ids[0] may be " + (d.want ? "true" : "not true"));
  const opts = arrange(ps.map((p, i) => ({ html: p.t, ok: i === 0, why: i === 0 ? "" : (p.ok ? "This sentence is true. " : "This sentence is not true. ") + p.why })), d.at);
  const pic = { k: "circle", lines: [{ t: "d", a: 0, lab: "diameter" }, { t: "r", a: 125, lab: "radius" }] };
  return {
    q: d.want ? "Which sentence about circles is <b>true</b>?" : "Which sentence about circles is <b>not true</b>?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: pic, step: "Think of one circle with its centre, a radius and a diameter. Test each sentence on it." },
    worked: { text: (d.want ? "True: " : "Not true: ") + ps[0].t + " " + ps[0].why, pic: pic },
    yes: ps[0].why,
    key: ps[0].t
  };
};
MX.circleProps = PROPS;
})();

