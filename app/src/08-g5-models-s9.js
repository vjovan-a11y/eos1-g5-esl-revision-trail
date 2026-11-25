/* 08-g5-models-s9.js - Grade 5 question models for Stop 9: mode, median, mean and range (6Ss.03).
   Every answer is worked out here from the numbers in the data. The data are whole numbers; the median and the mean
   are kept exact as thousandths (MX.D), so a median that ends in .5 and a mean with one decimal place are exact.
   A model throws when its data is not sound (a mean that does not divide to one decimal place, three or more
   modes, a mode that is not single where one is needed ...), so a bad set of numbers never reaches a child.

   Shared data fields: nums: [whole numbers], ctx?: a real-life sentence in front of the question (MX.make),
   unit?: 'cm' | '°C' | 'goals' ..., tool?: true (the data cards / the towers are part of the question).

   smode      { nums, unit?, tool? }                         write the mode (the data must have exactly one mode)
   smodes     { nums, unit?, tool?, at }                     tick the mode: one mode, two modes (bimodal) or no mode
   smedian    { nums, unit?, tool? }                         write the median (odd or even count; may end in .5)
   smean      { nums, unit?, tool?, labels? }                write the mean (tool: the towers; then the mean is whole)
   srange     { nums, unit?, tool? }                         write the range
   sall       { nums, unit?, which?: ['mode', 'median', 'mean', 'range'] }   several measures of one data set
   sfreq      { head: ['Shoe size', 'Frequency'], vals, freqs, ask?: 'mode' | 'count' }   read a frequency table
   smissmean  { known: [..], mean, what?, unit?, short? }    the mean and all values but one are given: find the last one
                                                             (short: "The mean time is 14 minutes." for a measure)
   smissrange { known: [..], range, end: 'max' | 'min', unit? }   the range is given: find the largest / smallest value
   scompare   { a: { name, nums }, b: { name, nums }, by: 'mean' | 'median' | 'range', ask: 'greater' | 'smaller',
                q, unit?, at }                               two data sets: (a) who ..., (b) write the two values
   sbest      { nums, thing, unit?, at }                     one value is very different: which measure describes the
                                                             data best? (the median; the mean is pulled by that value)
   sspot      { who, he, nums, slip: 'unsorted' | 'zero' | 'max', unit?, at }   spot the mistake: (a) the mistake,
                                                             (b) the correct answer */
(function () {
"use strict";
const M = MX.M, D = MX.D, fmt = MX.fmt, arrange = MX.arrange, cap = MX.cap;

/* ---------- the four measures of a data set (thousandths) ---------- */
function stats(nums) {
  if (!Array.isArray(nums) || nums.length < 2 || nums.some(x => !Number.isInteger(x) || x < 0)) throw new Error("stats: a data set is 2 or more whole numbers");
  const n = nums.length, sorted = nums.slice().sort((a, b) => a - b), total = nums.reduce((s, x) => s + x, 0);
  const freq = {}; sorted.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
  const vals = Object.keys(freq).map(Number).sort((a, b) => a - b), maxF = Math.max.apply(null, vals.map(v => freq[v]));
  const modes = maxF === 1 ? [] : vals.filter(v => freq[v] === maxF);
  if (modes.length > 2) throw new Error("stats: three or more modes (" + nums.join(", ") + ")");
  if (modes.length === 2 && modes.length === vals.length) throw new Error("stats: every value appears equally often (" + nums.join(", ") + ")");
  const lo = sorted[Math.floor((n - 1) / 2)], hi = sorted[Math.ceil((n - 1) / 2)];          /* the middle value(s) */
  const meanOk = (total * 10) % n === 0;
  return {
    nums: nums, n: n, sorted: sorted, total: total, freq: freq, vals: vals, maxF: maxF, modes: modes,
    lo: lo, hi: hi, med: (lo + hi) * 500, even: n % 2 === 0,
    meanOk: meanOk, mean: meanOk ? total * 1000 / n : NaN,
    min: sorted[0], max: sorted[n - 1], range: (sorted[n - 1] - sorted[0]) * 1000
  };
}
function needMean(s) { if (!s.meanOk) throw new Error("the mean of " + s.nums.join(", ") + " (" + s.total + " ÷ " + s.n + ") has more than one decimal place"); return s; }
function oneMode(s) { if (s.modes.length !== 1) throw new Error("the data " + s.nums.join(", ") + " must have exactly one mode"); return s; }
const show = t => D.s(t);                                  /* thousandths -> '6.5' */
const raw = t => D.s(t).replace(/,/g, "");                 /* what a child types */
const list = a => a.map(x => fmt(x)).join(", ");
const U = d => (d.unit ? " " + d.unit : "");
const typed = v => { const t = D.p(v); return isNaN(t) ? null : t; };
const times = f => (f === 1 ? "1 time" : f + " times");
const plus = a => a.map(x => fmt(x)).join(" + ");
/* the middle of the list as it is written (not in order): the classic slip */
function rawMid(s) { const a = s.nums, n = s.n; return (a[Math.floor((n - 1) / 2)] + a[Math.ceil((n - 1) / 2)]) * 500; }
const modeText = s => (s.modes.length === 0 ? "no mode" : s.modes.map(x => fmt(x)).join(" and "));

/* ---------- what went wrong: one sentence for each classic slip ---------- */
function modeSlip(s, v) {
  const t = typed(v), m = s.modes[0];
  if (t == null) return "Write a number.";
  const x = t / 1000;
  if (x === s.maxF && s.freq[x] !== s.maxF) return fmt(x) + " is how many times the mode appears: its frequency. Write the value that appears most often.";
  if (t === s.med && s.freq[x] !== s.maxF) return "That is the median, the middle value. The mode is the value that appears most often.";
  if (s.meanOk && t === s.mean) return "That is the mean. The mode is the value that appears most often.";
  if (x === s.max) return fmt(x) + " is the largest value. The mode is the value that appears most often.";
  if (t === s.range) return "That is the range. The mode is the value that appears most often.";
  if (s.freq[x]) return fmt(x) + " appears " + times(s.freq[x]) + ". Which value appears more often?";
  return "The mode is one of the values in the data. Count how many times each value appears.";
}
function medSlip(s, v) {
  const t = typed(v);
  if (t == null) return "Write a number.";
  if (t === rawMid(s) && rawMid(s) !== s.med) return "Put the data in order first, from smallest to largest. Then find the middle.";
  if (s.even && s.lo !== s.hi && (t === s.lo * 1000 || t === s.hi * 1000)) return "There are two middle values: " + fmt(s.lo) + " and " + fmt(s.hi) + ". The median is halfway between them.";
  if (s.even && s.lo !== s.hi && t === (s.lo + s.hi) * 1000) return fmt(s.lo) + " + " + fmt(s.hi) + " = " + fmt(s.lo + s.hi) + ". Now halve it: the median is halfway between " + fmt(s.lo) + " and " + fmt(s.hi) + ".";
  if (s.meanOk && t === s.mean) return "That is the mean (total ÷ " + s.n + "). The median is the middle value when the data is in order.";
  if (s.modes.length === 1 && t === s.modes[0] * 1000) return "That is the mode, the most common value. The median is the middle value when the data is in order.";
  if (t === s.range) return "That is the range. The median is the middle value when the data is in order.";
  return "Write the data in order. Cross off one value from each end until you reach the middle.";
}
function meanSlip(s, v) {
  const t = typed(v), tot = s.total * 1000;
  if (t == null) return "Write a number.";
  if (t === tot) return fmt(s.total) + " is the total. Now divide it by " + s.n + ", the number of values.";
  if (t * (s.n - 1) === tot || t * (s.n + 1) === tot) return "Count the values again. There are " + s.n + (s.nums.indexOf(0) >= 0 ? " (the 0 counts too)" : "") + ", so divide the total by " + s.n + ".";
  if (t === s.med) return "That is the median, the middle value. For the mean, add all the values. Then divide by " + s.n + ".";
  if (s.modes.length === 1 && t === s.modes[0] * 1000) return "That is the mode, the most common value. For the mean, add all the values. Then divide by " + s.n + ".";
  if (t === s.max * 1000) return "That is the largest value. For the mean, add all the values. Then divide by " + s.n + ".";
  if (t === s.range) return "That is the range. For the mean, add all the values. Then divide by " + s.n + ".";
  return "Add all the values to find the total. Then divide the total by " + s.n + ".";
}
function rangeSlip(s, v) {
  const t = typed(v), a = s.nums;
  if (t == null) return "Write a number.";
  if (t === s.max * 1000) return fmt(s.max) + " is the largest value. For the range, take away the smallest value from it.";
  if (t === s.min * 1000) return fmt(s.min) + " is the smallest value. The range is the largest value take away the smallest.";
  if (t === (s.max + s.min) * 1000) return "Do not add. The range is the largest value take away the smallest: a difference.";
  if (t === Math.abs(a[s.n - 1] - a[0]) * 1000) return "Use the largest and the smallest values, not the first and the last in the list.";
  if (t === s.n * 1000) return "That is how many values there are. The range is the largest value take away the smallest.";
  if (t === s.med) return "That is the median. The range is the largest value take away the smallest.";
  return "Find the largest value and the smallest value. Then subtract.";
}

/* ---------- how each measure is worked out, in words ---------- */
function modeWork(s) {
  if (s.modes.length === 0) return "Every value appears only 1 time. So there is no mode.";
  if (s.modes.length === 2) return fmt(s.modes[0]) + " and " + fmt(s.modes[1]) + " both appear " + times(s.maxF) + ", more often than any other value. There are two modes: the data is bimodal.";
  return fmt(s.modes[0]) + " appears " + times(s.maxF) + ", more often than any other value. The mode is " + fmt(s.modes[0]) + ".";
}
function medWork(s) {
  const inOrder = "In order: " + list(s.sorted) + ". ";
  if (!s.even) return inOrder + "The middle value is " + fmt(s.lo) + ". The median is " + fmt(s.lo) + ".";
  if (s.lo === s.hi) return inOrder + "The two middle values are both " + fmt(s.lo) + ". The median is " + fmt(s.lo) + ".";
  return inOrder + "The two middle values are " + fmt(s.lo) + " and " + fmt(s.hi) + ". Halfway between them: (" + fmt(s.lo) + " + " + fmt(s.hi) + ") ÷ 2 = " + show(s.med) + ". The median is " + show(s.med) + ".";
}
const meanWork = s => "Total: " + plus(s.nums) + " = " + fmt(s.total) + ". There are " + s.n + " values. " + fmt(s.total) + " ÷ " + s.n + " = " + show(s.mean) + ". The mean is " + show(s.mean) + ".";
const rangeWork = s => "The largest value is " + fmt(s.max) + " and the smallest is " + fmt(s.min) + ". " + fmt(s.max) + " − " + fmt(s.min) + " = " + show(s.range) + ". The range is " + show(s.range) + ".";
const TIP = {
  mode: "Count how many times each value appears. The mode is the value that appears most often.",
  median: "Write the data in order, from smallest to largest. The median is the middle value. With two middle values, it is halfway between them.",
  mean: "Add all the values to find the total. Then divide the total by the number of values.",
  range: "Find the largest value and the smallest value. The range is largest − smallest."
};
const SHORT = {
  mode: "The mode is the value that appears most often.",
  median: "The median is the middle value. With two middle values, it is halfway between them.",
  mean: "For the mean, divide the total by the number of values.",
  range: "The range is largest − smallest."
};
const withUnit = (text, u) => (u ? text.replace(/\.$/, u + ".") : text);          /* "The median is 139." -> "The median is 139 cm." */
const cards = (s, show_, capText) => ({ k: "dcards", nums: s.nums, sorted: true, show: show_, cap: capText || "" });

/* a question with one answer box for one measure */
function single(d, mode, kind) {
  const s = stats(d.nums);
  if (kind === "mode") oneMode(s);
  if (kind === "mean") needMean(s);
  const want = kind === "mode" ? s.modes[0] * 1000 : kind === "median" ? s.med : kind === "mean" ? s.mean : s.range;
  const slip = { mode: modeSlip, median: medSlip, mean: meanSlip, range: rangeSlip }[kind];
  const work = { mode: modeWork, median: medWork, mean: meanWork, range: rangeWork }[kind](s);
  const a = show(want), u = U(d);
  const towers = kind === "mean" && d.tool;
  if (towers && (want % 1000 !== 0 || s.max > 10 || s.n > 6)) throw new Error("smean with the towers: a whole-number mean, at most 6 towers of at most 10 blocks");
  const HOW = {
    mode: ["Let's do it together. Tap the cards from smallest to largest. Equal cards make a pile.", "Put the cards in order. Then write the mode."],
    median: ["Let's do it together. Tap the cards from smallest to largest. Then cross off the ends.", "Put the cards in order. Find the middle. Then write the median."],
    mean: ["Let's do it together. Move blocks from tall towers to short towers until all are level.", "Make the towers level. Then write the mean."],
    range: ["Let's do it together. Tap the cards from smallest to largest. Look at the first and the last card.", "Put the cards in order. Then write the range."]
  }[kind];
  const pic = kind === "mean"
    ? (want % 1000 === 0 && s.max <= 10 && s.n <= 6 ? { k: "dtowers", nums: s.nums, labels: d.labels, level: true, cap: fmt(s.total) + " ÷ " + s.n + " = " + a } : null)
    : cards(s, kind, kind === "median" ? "median = " + a : kind === "mode" ? "mode = " + a : fmt(s.max) + " − " + fmt(s.min) + " = " + a);
  const t = {
    q: "Find the <b>[[" + kind + "]]</b>" + (d.tool ? " of the data." : "."),
    lines: [kind + " = {0}" + u], blanks: [{ len: 5, w: "big", dec: kind === "median" || kind === "mean" ? 1 : 0 }],
    check(r) { return D.eq(r.v[0], want) ? { ok: true } : { ok: false, msg: slip(s, r.v[0]), parts: [false] }; },
    hint: { pic: d.tool ? null : kind === "mean" ? null : { k: "dcards", nums: s.nums, sorted: true, cap: "The data in order" }, step: TIP[kind] },
    worked: { text: withUnit(work, u), pic: pic },
    yes: kind === "mean" ? fmt(s.total) + " ÷ " + s.n + " = " + a + ". The mean is " + a + u + "." : "The " + kind + " is " + a + u + ".",
    key: a + u, fill: [raw(want)]
  };
  if (d.tool) {
    t.how = HOW[mode === "our" ? 0 : 1];
    if (towers) { t.ui = { k: "dtowers", nums: s.nums, labels: d.labels }; t.right = { level: true }; }
    else { t.ui = { k: "dcards", nums: s.nums, views: [kind] }; t.right = { sorted: true, view: kind }; }
  } else t.sum = list(s.nums);
  return t;
}
M.smode = (d, mode) => single(d, mode, "mode");
M.smedian = (d, mode) => single(d, mode, "median");
M.smean = (d, mode) => single(d, mode, "mean");
M.srange = (d, mode) => single(d, mode, "range");

/* tick the mode: one mode, two modes or no mode */
M.smodes = function (d, mode) {
  const s = stats(d.nums), k = s.modes.length, m = s.modes, right = { html: cap(modeText(s)), ok: true };
  const wrong = [];
  const add = (html, why) => { if (wrong.length < 2 && html !== right.html && !wrong.some(o => o.html === html)) wrong.push({ html: html, why: why }); };
  if (k === 2) {
    add(fmt(m[0]) + " only", fmt(m[1]) + " appears " + times(s.maxF) + " too. Two values can both be the mode.");
    add("No mode", "Look again: " + fmt(m[0]) + " and " + fmt(m[1]) + " appear more often than the other values.");
  } else if (k === 1) {
    const other = s.vals.filter(v => v !== m[0]).sort((a, b) => s.freq[b] - s.freq[a] || b - a)[0];
    add(fmt(Math.min(m[0], other)) + " and " + fmt(Math.max(m[0], other)), fmt(other) + " appears " + times(s.freq[other]) + ". " + fmt(m[0]) + " appears " + times(s.maxF) + ". Only the most common value is the mode.");
    if (s.max !== m[0]) add(String(fmt(s.max)), fmt(s.max) + " is the largest value. The mode is the value that appears most often.");
    add("No mode", "Look again: one value appears more often than the others.");
  } else {
    add(String(fmt(s.max)), fmt(s.max) + " is the largest value, but it appears only 1 time. The mode is the value that appears most often.");
    add(show(s.med), "That is the median, the middle value. Here every value appears only 1 time.");
    add(String(fmt(s.min)), fmt(s.min) + " appears only 1 time, like every other value.");
  }
  if (wrong.length < 2) throw new Error("smodes: not enough wrong options");
  const opts = arrange([right].concat(wrong), d.at);
  const t = {
    q: "What is the <b>[[mode]]</b>" + (d.tool ? " of the data?" : "?"), sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: d.tool ? null : { k: "dcards", nums: s.nums, sorted: true, cap: "The data in order" }, step: TIP.mode + " Two values can both be the mode. If every value appears 1 time, there is no mode." },
    worked: { text: "In order: " + list(s.sorted) + ". " + (k === 1 ? withUnit(modeWork(s), U(d)) : modeWork(s)), pic: cards(s, "mode", k === 0 ? "no mode" : (k === 2 ? "modes: " : "mode = ") + modeText(s)) },
    yes: modeWork(s), key: cap(modeText(s))
  };
  if (d.tool) {
    t.how = mode === "our" ? "Let's do it together. Tap the cards from smallest to largest. Equal cards make a pile." : "Put the cards in order. Look at the piles. Then tap one answer.";
    t.ui = { k: "dcards", nums: s.nums, views: ["mode"] }; t.right = { sorted: true, view: "mode" };
  } else t.sum = list(s.nums);
  return t;
};

/* several measures of one data set */
M.sall = function (d) {
  const s = stats(d.nums), which = d.which || ["mode", "median", "mean", "range"], u = U(d);
  if (which.indexOf("mode") >= 0) oneMode(s);
  if (which.indexOf("mean") >= 0) needMean(s);
  const want = { mode: s.modes.length ? s.modes[0] * 1000 : NaN, median: s.med, mean: s.mean, range: s.range };
  const slip = { mode: modeSlip, median: medSlip, mean: meanSlip, range: rangeSlip };
  const work = { mode: modeWork, median: medWork, mean: meanWork, range: rangeWork };
  return {
    q: "Find the " + which.map(k => "<b>" + k + "</b>").join(", ").replace(/, ([^,]*)$/, " and $1") + ".", sum: list(s.nums), marks: which.length,
    lines: which.map((k, i) => k + " = {" + i + "}" + u),
    blanks: which.map(k => ({ len: 5, w: "big", dec: k === "median" || k === "mean" ? 1 : 0 })),
    check(r) {
      const parts = which.map((k, i) => D.eq(r.v[i], want[k]));
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: "Look at the " + which[i] + ". " + slip[which[i]](s, r.v[i]), parts: parts };
    },
    hint: { pic: { k: "dcards", nums: s.nums, sorted: true, cap: "The data in order" }, step: "First write the data in order. " + which.map(k => SHORT[k]).join(" ") },
    worked: { text: which.map(k => withUnit(work[k](s), u)).join(" "), pic: cards(s, which.indexOf("median") >= 0 ? "median" : which[0], "") },
    yes: which.map(k => cap(k) + " " + show(want[k]) + u).join(". ") + ".",
    key: which.map(k => k + " " + show(want[k]) + u).join(" ; "), fill: which.map(k => raw(want[k]))
  };
};

/* a frequency table: the mode is the value with the highest frequency; the frequencies add up to the count */
M.sfreq = function (d) {
  const vals = d.vals, fr = d.freqs, ask = d.ask || "mode";
  if (vals.length !== fr.length) throw new Error("sfreq: one frequency for each value");
  const maxF = Math.max.apply(null, fr), tops = vals.filter((v, i) => fr[i] === maxF), count = fr.reduce((a, b) => a + b, 0);
  if (ask === "mode" && tops.length !== 1) throw new Error("sfreq: exactly one value must have the highest frequency");
  const mode = tops[0], at = fr.indexOf(maxF), thing = d.head[0].toLowerCase(), want = (ask === "mode" ? mode : count) * 1000;
  const table = { k: "dfreq", head: d.head, vals: vals, freqs: fr };
  return {
    q: ask === "mode" ? "The table shows the <b>[[frequency]]</b> of each " + thing + ". What is the <b>mode</b>?" : "The table shows the <b>[[frequency]]</b> of each " + thing + ". How many values are in the data set?",
    fig: table, lines: [(ask === "mode" ? "mode = " : "number of values = ") + "{0}"], blanks: [{ len: 4, w: "big" }],
    check(r) {
      if (D.eq(r.v[0], want)) return { ok: true };
      const t = typed(r.v[0]);
      if (ask === "mode") {
        if (t === maxF * 1000) return { ok: false, msg: fmt(maxF) + " is the highest frequency. The mode is the " + thing + " that has this frequency.", parts: [false] };
        if (t === Math.max.apply(null, vals) * 1000) return { ok: false, msg: "That is the largest " + thing + ". The mode has the highest frequency.", parts: [false] };
        return { ok: false, msg: "Find the highest number in the Frequency column. The mode is the " + thing + " in that row.", parts: [false] };
      }
      if (t === vals.length * 1000) return { ok: false, msg: "That is the number of rows. Add all the frequencies.", parts: [false] };
      if (t === maxF * 1000) return { ok: false, msg: "That is the highest frequency. Add all the frequencies.", parts: [false] };
      return { ok: false, msg: "The frequency tells how many times each value appears. Add all the frequencies.", parts: [false] };
    },
    hint: { step: ask === "mode" ? "The frequency tells how many times each value appears. The mode is the value with the highest frequency." : "The frequency tells how many times each value appears. Add all the frequencies." },
    worked: { text: ask === "mode" ? "The highest frequency is " + fmt(maxF) + ". It belongs to " + thing + " " + fmt(mode) + ". The mode is " + fmt(mode) + "." : fr.join(" + ") + " = " + fmt(count) + ". There are " + fmt(count) + " values in the data set.",
      pic: Object.assign({ hl: ask === "mode" ? at : -1 }, table) },
    yes: ask === "mode" ? fmt(mode) + " has the highest frequency, " + fmt(maxF) + ". The mode is " + fmt(mode) + "." : fr.join(" + ") + " = " + fmt(count) + ".",
    key: String(fmt(want / 1000)), fill: [String(want / 1000)]
  };
};

/* the mean is given: find the missing value (two steps: the total, then subtract) */
M.smissmean = function (d) {
  const known = d.known, n = known.length + 1, sum = known.reduce((a, b) => a + b, 0), total = d.mean * n, ans = total - sum;
  if (!Number.isInteger(d.mean) || !Number.isInteger(ans) || ans < 0) throw new Error("smissmean: the missing value must be a whole number, 0 or more");
  stats(known.concat(ans));
  const what = d.what || "number", u = U(d);
  const kmean = sum * 1000 / known.length;
  return {
    q: (d.short ? "The <b>[[mean]]</b> " + what + " is <b>" + fmt(d.mean) + "</b>" + u + ". "
      : "The <b>[[mean]]</b> of the <b>" + n + "</b> " + what + "s is <b>" + fmt(d.mean) + "</b>" + u + ". ") + cap(numWord(known.length)) + " of the " + what + "s are shown. Find the missing " + what + ".",
    sum: list(known) + ", <span class=\"s9-q\">?</span>",
    lines: ["missing " + what + " = {0}" + u], blanks: [{ len: 5, w: "big" }],
    check(r) {
      if (D.eq(r.v[0], ans * 1000)) return { ok: true };
      const t = typed(r.v[0]);
      if (t === total * 1000) return { ok: false, msg: fmt(total) + " is the total of all " + n + " values. Now take away the " + known.length + " you know.", parts: [false] };
      if (t === d.mean * 1000) return { ok: false, msg: fmt(d.mean) + " is the mean. The missing " + what + " does not have to be the mean. First find the total: " + fmt(d.mean) + " × " + n + ".", parts: [false] };
      if (t === sum * 1000) return { ok: false, msg: fmt(sum) + " is the total of the " + known.length + " values you know. The total of all " + n + " is " + fmt(d.mean) + " × " + n + ".", parts: [false] };
      if (t === (d.mean * known.length - sum) * 1000) return { ok: false, msg: "There are " + n + " values, not " + known.length + ". The total is " + fmt(d.mean) + " × " + n + ".", parts: [false] };
      if (t === kmean) return { ok: false, msg: "That is the mean of the " + known.length + " values you know. Use the mean of all " + n + ".", parts: [false] };
      return { ok: false, msg: "Go backwards. Mean × number of values = total. Then take away the values you know.", parts: [false] };
    },
    hint: { step: "Go backwards. The mean is the total ÷ " + n + ", so the total is " + fmt(d.mean) + " × " + n + ". Then take away the values you know." },
    worked: { text: "Total of all " + n + ": " + fmt(d.mean) + " × " + n + " = " + fmt(total) + ". The " + known.length + " you know: " + plus(known) + " = " + fmt(sum) + ". " + fmt(total) + " − " + fmt(sum) + " = " + fmt(ans) + ". The missing " + what + " is " + fmt(ans) + u + "." },
    yes: fmt(d.mean) + " × " + n + " = " + fmt(total) + " and " + fmt(total) + " − " + fmt(sum) + " = " + fmt(ans) + ".",
    key: fmt(ans) + u, fill: [String(ans)]
  };
};
function numWord(k) { return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][k] || String(k); }

/* the range is given: find the largest (or the smallest) value */
M.smissrange = function (d) {
  const known = d.known, mx = Math.max.apply(null, known), mn = Math.min.apply(null, known), isMax = d.end === "max";
  const ans = isMax ? mn + d.range : mx - d.range, u = U(d);
  if (!Number.isInteger(ans) || ans < 0 || (isMax ? ans <= mx : ans >= mn)) throw new Error("smissrange: the missing value must be the " + (isMax ? "largest" : "smallest"));
  const big = isMax ? "largest" : "smallest", other = isMax ? "smallest" : "largest", ov = isMax ? mn : mx;
  const wrongWay = isMax ? mx + d.range : mn - d.range;
  return {
    q: "The <b>[[range]]</b> of these values is <b>" + fmt(d.range) + "</b>" + u + ". The missing value is the <b>" + big + "</b>. Find the missing value.",
    sum: list(known) + ", <span class=\"s9-q\">?</span>",
    lines: ["missing value = {0}" + u], blanks: [{ len: 5, w: "big" }],
    check(r) {
      if (D.eq(r.v[0], ans * 1000)) return { ok: true };
      const t = typed(r.v[0]);
      if (t === wrongWay * 1000) return { ok: false, msg: "The range goes from the smallest value to the largest. Start from " + fmt(ov) + ", the " + other + " value.", parts: [false] };
      if (t === d.range * 1000) return { ok: false, msg: fmt(d.range) + " is the range: the difference between the largest and the smallest value.", parts: [false] };
      if (t === (isMax ? mx : mn) * 1000) return { ok: false, msg: "The missing value is the " + big + " of all. It is not in the list.", parts: [false] };
      return { ok: false, msg: "Largest − smallest = " + fmt(d.range) + ". The " + other + " value is " + fmt(ov) + ".", parts: [false] };
    },
    hint: { pic: { k: "dcards", nums: known, sorted: true, cap: "The values you know, in order" }, step: "Largest − smallest = range. Find the " + other + " value in the list. Then " + (isMax ? "add" : "take away") + " the range." },
    worked: { text: "The " + other + " value is " + fmt(ov) + ". The range is " + fmt(d.range) + ". " + fmt(ov) + (isMax ? " + " : " − ") + fmt(d.range) + " = " + fmt(ans) + ". Check: " + fmt(isMax ? ans : mx) + " − " + fmt(isMax ? mn : ans) + " = " + fmt(d.range) + ". The missing value is " + fmt(ans) + u + "." },
    yes: fmt(isMax ? ans : mx) + " − " + fmt(isMax ? mn : ans) + " = " + fmt(d.range) + ".",
    key: fmt(ans) + u, fill: [String(ans)]
  };
};

/* two data sets: (a) who has the greater / smaller mean, median or range, (b) write both values */
M.scompare = function (d) {
  const A = stats(d.a.nums), B = stats(d.b.nums), by = d.by, u = U(d);
  if (by === "mean") { needMean(A); needMean(B); }
  const va = A[by === "median" ? "med" : by], vb = B[by === "median" ? "med" : by];
  if (va === vb) throw new Error("scompare: the two values must be different");
  const aWins = d.ask === "smaller" ? va < vb : va > vb, win = aWins ? d.a.name : d.b.name, lose = aWins ? d.b.name : d.a.name;
  const tell = d.a.name + ": " + show(va) + u + ". " + d.b.name + ": " + show(vb) + u + ".";
  const opts = arrange([
    { html: win, ok: true, why: "" },
    { html: lose, ok: false, why: "Work out the " + by + " of each data set. Then choose the " + d.ask + " one." },
    { html: "They are the same", ok: false, why: "Work out the " + by + " of each data set. They are not equal." }], d.at);
  const work = { mean: meanWork, median: medWork, range: rangeWork }[by], slip = { mean: meanSlip, median: medSlip, range: rangeSlip }[by];
  return {
    q: d.q, marks: 2, ab: true,
    fig: { k: "ddata", rows: [{ name: d.a.name, nums: A.nums }, { name: d.b.name, nums: B.nums }] },
    sub: "Tick (✓) one box.", opts: opts,
    abAsk: "Write the " + by + " of each data set.",
    lines: [d.a.name + ": {0}", d.b.name + ": {1}"],
    blanks: [0, 1].map(() => ({ len: 5, w: "big", dec: by === "range" ? 0 : 1 })),
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const o = opts[r.pick], pickOk = !!(o && o.ok), parts = [D.eq((r.v || [])[0], va), D.eq((r.v || [])[1], vb)];
      if (pickOk && parts.every(Boolean)) return { ok: true, parts: parts, pickOk: true };
      const i = parts.indexOf(false);
      const msg = i >= 0 ? "Look at " + [d.a.name, d.b.name][i] + "'s data. " + slip([A, B][i], r.v[i])
        : "Your two values are right. " + show(Math.max(va, vb)) + " is greater than " + show(Math.min(va, vb)) + ". Read the question again.";
      return { ok: false, msg: msg, parts: parts, pickOk: pickOk };
    },
    hint: { step: TIP[by] + " Do this for each data set. Then compare." },
    worked: { text: d.a.name + ". " + withUnit(work(A), u) + " " + d.b.name + ". " + withUnit(work(B), u) + " " + show(aWins ? va : vb) + " is " + d.ask + " than " + show(aWins ? vb : va) + ", so the answer is " + win + "." },
    yes: tell, key: win + " ; " + show(va) + " ; " + show(vb), fill: [raw(va), raw(vb)]
  };
};

/* one value is very different from the others: which measure describes the data best? */
M.sbest = function (d) {
  const s = needMean(stats(d.nums)), u = U(d);
  const top = s.sorted[s.n - 1] - s.sorted[s.n - 2] > s.sorted[1] - s.sorted[0], out = top ? s.max : s.min;
  const rest = s.sorted.filter((x, i) => i !== (top ? s.n - 1 : 0));
  /* the pull must be clear: the mean lies outside all the other values */
  if (top ? s.mean <= rest[rest.length - 1] * 1000 : s.mean >= rest[0] * 1000) throw new Error("sbest: the very different value must pull the mean past all the other values");
  if (s.med === s.mean) throw new Error("sbest: the median and the mean must differ");
  const dir = top ? "up" : "down", cmp = top ? "more" : "less";
  const opts = arrange([
    { html: "The median, " + show(s.med) + u + ". Most of the values are close to it.", ok: true, why: "" },
    { html: "The mean, " + show(s.mean) + u + ". It uses every value.", ok: false, why: "One value, " + fmt(out) + ", is very different. It pulls the mean " + dir + " to " + show(s.mean) + ". All the other values are " + (top ? "less" : "more") + " than " + show(s.mean) + "." },
    { html: "The range, " + show(s.range) + u + ". It uses the largest and the smallest value.", ok: false, why: "The range tells how spread out the data is. It is not an average, so it cannot be a typical value." }], d.at);
  return {
    q: "Which value best describes a typical " + d.thing + "?", sum: list(s.nums), sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: { k: "dcards", nums: s.nums, sorted: true, cap: "The data in order" }, step: "Is one value very different from the others? A very different value pulls the mean towards it. The median does not move much." },
    worked: { text: "One value, " + fmt(out) + ", is much " + (top ? "larger" : "smaller") + " than the others. It pulls the mean " + dir + " to " + show(s.mean) + ": " + cmp + " than every other value. The median, " + show(s.med) + ", is in the middle of the data, so it describes a typical " + d.thing + " best.",
      pic: cards(s, "median", "median = " + show(s.med) + ", mean = " + show(s.mean)) },
    yes: fmt(out) + " pulls the mean " + dir + " to " + show(s.mean) + ". The median, " + show(s.med) + ", is typical.",
    key: "The median, " + show(s.med) + u
  };
};

/* spot the mistake: (a) what went wrong, (b) the correct answer */
M.sspot = function (d) {
  const s = stats(d.nums), u = U(d), p = { he: d.he ? "he" : "she", He: d.he ? "He" : "She", his: d.he ? "his" : "her" };
  let kind, wrong, want, says, reasons, fix;
  if (d.slip === "unsorted") {
    kind = "median"; wrong = rawMid(s); want = s.med;
    if (wrong === want) throw new Error("sspot unsorted: the middle of the list as written must not be the median");
    says = s.even ? "The two middle numbers are " + fmt(s.nums[s.n / 2 - 1]) + " and " + fmt(s.nums[s.n / 2]) + ". Halfway between them is " + show(wrong) + ". So the median is " + show(wrong) + "."
      : "The middle number in the list is " + show(wrong) + ". So the median is " + show(wrong) + ".";
    reasons = [
      { t: p.He + " did not put the data in order first." },
      { t: p.He + " did not add all the values and divide by " + s.n + ".", why: "Adding and dividing gives the mean. " + d.who + " wants the median: the middle value of the data in order." },
      { t: p.He + " did not choose the value that appears most often.", why: "The most common value is the mode. " + d.who + " wants the median: the middle value of the data in order." }];
    fix = medWork(s);
  } else if (d.slip === "zero") {
    needMean(s); kind = "mean"; want = s.mean;
    if (s.nums.filter(x => x === 0).length !== 1 || (s.total * 10) % (s.n - 1) !== 0) throw new Error("sspot zero: one 0 in the data, and total ÷ (count − 1) must be exact to one decimal place");
    wrong = s.total * 1000 / (s.n - 1);
    says = plus(s.nums.filter(x => x !== 0)) + " = " + fmt(s.total) + ". Then " + fmt(s.total) + " ÷ " + (s.n - 1) + " = " + show(wrong) + ". So the mean is " + show(wrong) + ".";
    reasons = [
      { t: p.He + " divided by " + (s.n - 1) + ", but there are " + s.n + " values. The 0 counts too." },
      { t: p.He + " added the values wrongly.", why: "Check the total: " + plus(s.nums) + " = " + fmt(s.total) + ". The total is right. Look at the number " + p.he + " divides by." },
      { t: p.He + " did not put the data in order first.", why: "You do not need the order for the mean. Look at the number " + p.he + " divides by." }];
    fix = meanWork(s);
  } else if (d.slip === "max") {
    kind = "range"; wrong = s.max * 1000; want = s.range;
    if (s.min === 0) throw new Error("sspot max: the smallest value must not be 0");
    says = "The largest value is " + fmt(s.max) + ". So the range is " + fmt(s.max) + ".";
    reasons = [
      { t: p.He + " did not take away the smallest value." },
      { t: p.He + " did not divide by " + s.n + ".", why: "Dividing the total by " + s.n + " gives the mean. The range is the largest value take away the smallest." },
      { t: p.He + " chose the wrong largest value.", why: fmt(s.max) + " is the largest value. But the range is a difference: largest − smallest." }];
    fix = rangeWork(s);
  } else throw new Error("sspot: slip must be unsorted, zero or max");
  const opts = arrange(reasons.map((x, i) => ({ html: x.t, ok: i === 0, why: x.why || "" })), d.at);
  const slip = { median: medSlip, mean: meanSlip, range: rangeSlip }[kind];
  return {
    q: d.who + " finds the <b>" + kind + "</b> of <b>" + list(s.nums) + "</b>. " + cap(p.his) + " answer is wrong. What is " + p.his + " mistake? Then find the correct " + kind + ".", marks: 2, ab: true,
    fig: { k: "dsay", who: d.who, text: says },
    sub: "Tick (✓) one box.", letters: true, opts: opts,
    abAsk: "Write the correct " + kind + ".",
    lines: [kind + " = {0}" + u], blanks: [{ len: 5, w: "big", dec: kind === "range" ? 0 : 1 }],
    ready: r => r.pick >= 0 && Array.isArray(r.v) && r.v.every(x => x !== "" && x != null),
    check(r) {
      const o = opts[r.pick], pickOk = !!(o && o.ok), vOk = D.eq((r.v || [])[0], want);
      if (pickOk && vOk) return { ok: true, parts: [true], pickOk: true };
      const msg = !pickOk ? (o && o.why ? o.why : "Read the three boxes again.")
        : typed(r.v[0]) === wrong ? "That is " + d.who + "'s answer, and it is wrong. " + TIP[kind]
        : "The mistake is right. Now find the " + kind + ". " + slip(s, r.v[0]);
      return { ok: false, msg: msg, parts: [vOk], pickOk: pickOk };
    },
    hint: { pic: kind === "mean" ? null : { k: "dcards", nums: s.nums, sorted: true, cap: "The data in order" }, step: "Work out the " + kind + " yourself. " + TIP[kind] },
    worked: { text: fix + " " + d.who + " wrote " + show(wrong) + ": " + reasons[0].t.replace(/^(He|She)/, x => x.toLowerCase()),
      pic: kind === "mean" ? null : cards(s, kind, kind + " = " + show(want)) },
    yes: "The " + kind + " is " + show(want) + u + ".", key: show(want) + u, fill: [raw(want)]
  };
};

MX.stats9 = stats;
})();

