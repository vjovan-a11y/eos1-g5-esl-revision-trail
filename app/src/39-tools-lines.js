/* 39-tools-lines.js - the maths tools of Stop 2 (patterns and negative numbers) and their small pictures.
   Ported from Maths v2 (legacy/maths-v2/src/mui_c.js: TOOLS.nline, thermo, grid, pics; PICS.nline, thermo, dots,
   dotseq, hops), redrawn flat in SVG with the Grade 4 tokens (39-tools-lines.css). The v2 answers are kept:
   get() returns what the models' check(r) reads, solve(task.right) shows the right state.

   Every tool: T.tools.<name>(host, spec) -> { el, get(), set(v), on('change' | 'trade', fn), lock(), destroy(),
     ready(), solve(right), tip(), allow(can) }. host may be null.
     'trade' = one action of the child ({ act, ... }): See it (45-see.js) waits for it; 'change' = the answer changed.
     allow(can): which buttons work now (a See it scene, one step at a time); without allow() every button works.
     tip() -> the button a pointing hand shows (the first one that works now).
   Motion (Phase 5): Zip slides along the line and hops (transform), a jump's arc draws itself like a pen
   (stroke-dashoffset), the red line of the thermometer slides (transform), a new row and column of counters pops
   in (transform and opacity). Still (reduced motion, effects tier 1): the final state at once (00-tokens.css).

   T.tools.nline(host, spec)    a number line, one number a tick. spec = { mode: 'jump' | 'show', skin: 'wood' | 'board',
       min, max, tick (1), lab (label every lab-th tick, 1), start, jump, dir: 'on' | 'back', marks: [numbers] (show),
       to (a picture of jumps: from start to this number), mini, fixed, cap }
       jump: Zip hops with "Jump back" and "Jump on"; get() -> { pos, hops }; allow({ on, back }); trade { act: 'jump', pos };
       restart(): a new count from where Zip is (the jumps so far are rubbed out)
       show: a dot and a flag on each of marks
       round (Stop 3): spec = { mode: 'round', skin, n, to, show, mid (halfway shown from the start) }: the line from the ten (hundred, ...) below n to the
       one above, a tick each tenth, halfway in the middle; the two ends are buttons (tap the nearer one: Zip jumps
       there, or an arc on the board), "Halfway" shows the halfway mark; get() -> { choice }; ready() once an end is
       tapped; reveal('mid') (the hint); allow({ pick: true | the one end that works, mid }); trade { act: 'pick', choice }
       and { act: 'mid' }
   T.tools.thermo(host, spec)   a thermometer, one degree a line. spec = { min (-10), max (10), start | t, dir: 1 | -1,
       fixed, cap }. "Warmer" and "Colder"; get() -> { pos }; allow({ up, down }); trade { act: 'warm' | 'cold', pos }
   T.tools.grid(host, spec)     counters in a growing square. spec = { mode: 'square', rows, cols, max (9), fixed, cap }
       (mode: 'array', Stop 5: the array of counters of 39-tools-times.js, T.tools.array)
       "Smaller" and "Bigger"; get() -> { rows, cols }; allow({ more, less }); trade { act: 'grow' | 'shrink', rows }
   T.tools.pics(host, spec)     pictures only, nothing to answer in them: spec.list = [pic specs] (the v2 'pics' tool)
   Pictures for T.tools.pic: nline { as the tool, fixed }, rline { n, to, show } (rounding, Stop 3), thermo { t, min, max, cap }, dots { r, c, col, cap },
     dotseq { ks: [1, 2, 3], ask } (square patterns, the asked one a "?"), hops { terms, blanks, labs } (a sequence
     drawn with jumps). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const still = function () {
    try { if (T.fx && T.fx.still) return !!T.fx.still(); } catch (e) { /* fall through */ }
    return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion());
  };
  const sg = function (v) { return window.MX ? window.MX.sg(v) : (v < 0 ? '−' + (-v) : String(v)); };
  const ORD = function (k) { return window.MX && window.MX.ORD ? window.MX.ORD[k] : k + 'th'; };
  const canDo = function (can, k) { return !can || !!can[k]; };
  const mount = function (host, node) { if (host) host.appendChild(node); return node; };
  let uid = 0;

  function shake(node) {
    if (!node || still()) return;
    node.classList.remove('is-shake'); void node.getBoundingClientRect(); node.classList.add('is-shake');
  }
  function replay(node, cls) {
    if (!node || still()) return;
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
  }

  // a tool button: never the main action of the screen (that is the green button in the bar)
  function tbtn(label, cls, data, iconStart, iconEnd) {
    return el('button', { type: 'button', class: ['btn', 'tl__btn', cls], dataset: data },
      iconStart ? T.ui.icon(iconStart) : null, el('span', { class: 'btn__label' }, label), iconEnd ? T.ui.icon(iconEnd) : null);
  }

  function svgNode(markup) {
    const box = document.createElement('div');
    box.innerHTML = markup;
    return box.firstChild;
  }
  /* ---------- the number line ---------- */

  function nline(host, spec) {
    spec = spec || {};
    const round = spec.mode === 'round', show = spec.mode === 'show', fixed = !!spec.fixed || show, skin = spec.skin || 'wood';
    const ev = T.tools.emitter();
    let min = spec.min, max = spec.max, tick = spec.tick || 1;
    // round: the line from the ten (hundred, ...) below n to the one above, a tick every tenth, the halfway number in the middle
    if (round) { min = Math.floor(spec.n / spec.to) * spec.to; max = min + spec.to; tick = spec.to / 10; }
    const jump = spec.jump || tick, mid = round ? min + spec.to / 2 : null;
    const X = round ? function (v) { return 12 + (v - min) / (max - min) * 76; }           // room for the two end buttons
      : function (v) { return 4 + (v - min) / (max - min) * 92; };                         // where a number sits, in % of the line
    let start = round ? spec.n : spec.start != null ? spec.start : min;
    let pos = start, locked = fixed, can = spec.can || null, choice = round && spec.show != null ? spec.show : null, midOn = round && (fixed || !!spec.mid);
    const arcs = [];
    if (round && choice != null) arcs.push([spec.n, choice]);

    const root = el('div', { class: ['nl', 'nl--' + skin, 'nl--' + (round ? 'round' : show ? 'show' : 'jump'), spec.mini && 'nl--mini'] });
    const stage = el('div', { class: 'nl__stage', role: 'img' });
    // the cold side (below zero) and the warm side are tinted on the track
    const track = el('div', { class: 'nl__track', style: min < 0 && max > 0 ? '--zero:' + X(0).toFixed(2) + '%' : null });
    if (min < 0 && max > 0) track.classList.add('has-zero');
    let labels = 0;
    const ends = round && !fixed;                          // the two ends are buttons: tap the nearer one
    for (let v = min, i = 0; v <= max + 1e-9; v += tick, i++) {
      const vv = Math.round(v * 1000) / 1000;
      const lab = round ? (i === 5 || (!ends && (i === 0 || i === 10))) : i % (spec.lab || 1) === 0;
      if (lab) labels++;
      track.appendChild(el('i', { class: ['nl__t', vv === 0 && 'is-zero', lab && 'is-lab', round && i === 5 && 'is-mid', round && i % 10 === 0 && 'is-end',
        round && vv === choice && 'is-lit'], style: 'left:' + X(vv).toFixed(2) + '%' },
        lab ? el('b', { class: vv < 0 ? 'is-neg' : null }, sg(vv)) : null));
    }
    if (labels > (spec.mini ? 9 : 13)) root.classList.add('nl--dense');
    if (round) track.appendChild(el('span', { class: 'nl__half', style: 'left:' + X(mid).toFixed(2) + '%', 'aria-hidden': 'true' }, el('b', 'halfway')));
    const arcSvg = el('svg:svg', { class: 'nl__arcs', viewBox: '0 0 100 40', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    track.appendChild(arcSvg);
    stage.appendChild(track);

    // a marker rides on a layer as wide as the line: translateX(p%) of that layer is p% of the line (transform only)
    function rider(v, body, k) {
      const layer = el('div', { class: ['nl__layer', k != null && 'nl__layer--k' + k], style: 'transform:translateX(' + X(v).toFixed(2) + '%)' },
        el('span', { class: 'nl__m' }, body));
      track.appendChild(layer);
      return layer;
    }
    const marks = show ? (spec.marks || []).map(function (v, i) {
      return rider(v, [el('i', { class: 'nl__dot' }), el('b', { class: 'nl__flag' }, sg(v))], i);
    }) : [];
    if (round) marks.push(rider(spec.n, [el('i', { class: 'nl__dot' }), el('b', { class: 'nl__flag' }, sg(spec.n))], 0));
    // Zip rides the line (wood); on the board a dot (jump), or nothing more than the number (round)
    const me = round && skin !== 'wood' ? null : show ? null
      : rider(pos, skin === 'wood' ? el('span', { class: 'nl__lift' }, el('span', { class: 'nl__zip' }, T.ui.zip('happy'))) : el('i', { class: 'nl__dot' }));
    const endBtns = ends ? [min, max].map(function (v, i) {
      const b = el('button', { type: 'button', class: ['nl__end', 'nl__end--' + i], dataset: { v: String(v) }, style: 'left:' + X(v).toFixed(2) + '%', 'aria-pressed': 'false' }, sg(v));
      b.addEventListener('click', function () { pick(v, b); });
      track.appendChild(b);
      return b;
    }) : [];
    root.appendChild(stage);

    let back = null, on = null, info = null, half = null;
    if (!fixed && !round) {
      back = tbtn('Jump back', 'nl__btn', { d: '-1' }, 'back');
      on = tbtn('Jump on', 'nl__btn', { d: '1' }, null, 'next');
      info = el('b', { class: 'nl__info', 'aria-live': 'polite' });
      back.addEventListener('click', function () { move(-1); });
      on.addEventListener('click', function () { move(1); });
      root.appendChild(el('div', { class: 'nl__ctl' }, back, info, on));
    }
    if (ends) {
      half = tbtn('Halfway', 'nl__btn nl__btn--half', { a: 'mid' }, 'bulb');
      half.addEventListener('click', function () { showMid(true); });
      info = el('b', { class: 'nl__info', 'aria-live': 'polite' });
      root.appendChild(el('div', { class: 'nl__ctl nl__ctl--round' }, half, info));
    }
    if (spec.cap) root.appendChild(el('p', { class: 'nl__cap', html: spec.cap }));

    const hops = function () { return Math.round(Math.abs(pos - start) / jump); };
    function get() { return round ? { choice: choice } : show ? {} : { pos: pos, hops: hops() }; }

    function arcPath(a) {
      const x1 = X(a[0]), x2 = X(a[1]), up = Math.min(34, 12 + Math.abs(x2 - x1) * 2);
      return 'M' + x1.toFixed(2) + ' 39 Q' + ((x1 + x2) / 2).toFixed(2) + ' ' + (39 - up * 1.9).toFixed(1) + ' ' + x2.toFixed(2) + ' 39';
    }
    function paintArcs(fresh) {
      while (arcSvg.childNodes.length > arcs.length) arcSvg.removeChild(arcSvg.lastChild);
      arcs.forEach(function (a, i) {
        let p = arcSvg.childNodes[i];
        if (!p) {
          p = el('svg:path', { pathLength: '1', 'vector-effect': 'non-scaling-stroke' });
          arcSvg.appendChild(p);
          if (fresh && !still()) p.classList.add('is-new');
        }
        p.setAttribute('d', arcPath(a));
        p.setAttribute('class', (a[1] < a[0] ? 'is-back' : 'is-on') + (p.classList.contains('is-new') ? ' is-new' : ''));
      });
    }
    const canPick = function () { return !can || (can.pick != null && can.pick !== false); };
    const want = function () { return can && typeof can.pick === 'number' ? can.pick : null; };
    function paint(fresh) {
      if (me) {
        me.style.transform = 'translateX(' + X(pos).toFixed(2) + '%)';
        me.classList.toggle('is-at-n', round && pos === spec.n);
      }
      paintArcs(fresh);
      if (info && !round) info.textContent = hops() + (hops() === 1 ? ' jump' : ' jumps');
      if (info && round) info.textContent = choice == null ? '' : sg(spec.n) + ' → ' + sg(choice);
      if (back) { back.disabled = locked || !canDo(can, 'back'); on.disabled = locked || !canDo(can, 'on'); }
      endBtns.forEach(function (b) {
        const lit = +b.dataset.v === choice;
        b.classList.toggle('is-on', lit);
        b.setAttribute('aria-pressed', lit ? 'true' : 'false');
        b.disabled = locked || !canPick();
        b.setAttribute('aria-label', 'Round to ' + sg(+b.dataset.v));
      });
      if (half) half.disabled = locked || !canDo(can, 'mid');
      root.classList.toggle('is-mid', midOn);
      const who = skin === 'wood' ? 'Zip' : 'The dot';
      stage.setAttribute('aria-label', show ? 'A number line from ' + sg(min) + ' to ' + sg(max) + ' with ' + (spec.marks || []).map(sg).join(' and ') + ' marked'
        : round ? 'A number line from ' + sg(min) + ' to ' + sg(max) + ', halfway ' + sg(mid) + '. ' + sg(spec.n) + ' is marked.' +
          (choice != null ? ' It rounds to ' + sg(choice) + '.' : '') + (me ? ' Zip is on ' + sg(pos) + '.' : '')
        : 'A number line from ' + sg(min) + ' to ' + sg(max) + '. ' + who + ' is on ' + sg(pos) + '.');
    }
    function move(d) {
      if (locked || !canDo(can, d > 0 ? 'on' : 'back')) return false;
      const np = Math.round((pos + d * jump) * 1000) / 1000;
      if (np < min - 1e-9 || np > max + 1e-9) { shake(track); sfx('no'); return false; }
      const last = arcs[arcs.length - 1];                       // a jump straight back over the last one rubs it out
      if (last && last[0] === np && last[1] === pos) arcs.pop(); else arcs.push([pos, np]);
      pos = np;
      if (me) replay(me.firstChild, 'is-hop');
      sfx('boing', { v: 0.07 });
      paint(true);
      ev.emit('change', get());
      ev.emit('trade', { act: 'jump', pos: pos, d: d });
      return true;
    }
    // round: tap the nearer end; Zip (or the jump arc) goes from n to it
    function pick(v, btn) {
      if (locked || !canPick()) return false;
      if (want() != null && v !== want()) { shake(btn); sfx('no'); return false; }
      choice = v; pos = v;
      arcs.length = 0; arcs.push([spec.n, v]);
      while (arcSvg.firstChild) arcSvg.removeChild(arcSvg.firstChild);     // a new arc draws itself
      if (me) replay(me.firstChild, 'is-hop');
      sfx('slide');
      paint(true);
      ev.emit('change', get());
      ev.emit('trade', { act: 'pick', choice: v });
      return true;
    }
    function showMid(byChild) {
      if (byChild && (locked || !canDo(can, 'mid'))) return;
      const was = midOn;
      midOn = true;
      if (!was && !still()) replay(track.querySelector('.nl__half'), 'is-in');
      paint(false);
      if (byChild) { sfx('pop'); ev.emit('trade', { act: 'mid' }); }
    }
    function solve(r) {
      if (round) { if (r && typeof r.choice === 'number') { choice = r.choice; pos = r.choice; arcs.length = 0; arcs.push([spec.n, r.choice]);
        while (arcSvg.firstChild) arcSvg.removeChild(arcSvg.firstChild); paint(true); } return; }
      if (show || !r || typeof r.pos !== 'number') return;
      arcs.length = 0; pos = start;
      const n = Math.round((r.pos - start) / jump), s = Math.sign(n);
      for (let i = 0; i < Math.abs(n); i++) { arcs.push([pos, pos + s * jump]); pos += s * jump; }
      paint(false);
    }
    paint(false);
    if (!round && spec.to != null) solve({ pos: spec.to });
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, move: move, solve: solve, pick: function (v) { return pick(v, endBtns.filter(function (b) { return +b.dataset.v === v; })[0]); },
      restart: function () { start = pos; arcs.length = 0; paint(false); },     // a new count from here
      set: function (v) { if (v && (typeof v.pos === 'number' || typeof v.choice === 'number')) solve(v); },
      ready: function () { return !round || choice != null; },
      reveal: function (what) { if (round && (!what || what === 'mid')) showMid(false); },
      lock: function () { locked = true; paint(false); },
      allow: function (c) { can = c || {}; locked = fixed; paint(false); },
      tip: function () {
        if (round) {
          const w = want();
          if (w != null) return endBtns.filter(function (b) { return +b.dataset.v === w && !b.disabled; })[0] || null;
          if (half && !half.disabled && !midOn && can && can.mid && can.pick == null) return half;    // See it: "Tap Halfway"
          return endBtns.filter(function (b) { return !b.disabled; })[0] || null;
        }
        const wantB = spec.dir === 'on' ? on : back;
        if (wantB && !wantB.disabled) return wantB;
        return [back, on].filter(function (b) { return b && !b.disabled; })[0] || null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the thermometer ---------- */

  const TH = { top: 34, per: 15, x: 70, w: 26 };            // the scale, in SVG units

  function thermoSvg(min, max, id) {
    const yOf = function (v) { return TH.top + (max - v) * TH.per; };
    const bot = yOf(min), bulbY = bot + 34, H = bulbY + 34;
    const x0 = TH.x, x1 = TH.x + TH.w, cx = TH.x + TH.w / 2;
    let ticks = '';
    for (let v = min; v <= max; v++) {
      const y = yOf(v), big = v % 5 === 0, zero = v === 0;
      ticks += '<path class="th__t' + (big ? ' is-big' : '') + (zero ? ' is-zero' : '') + '" d="M' + (x1 + 4) + ' ' + y + 'h' + (zero ? 26 : big ? 20 : 11) + '"/>';
      if (big) ticks += '<text class="th__n' + (zero ? ' is-zero' : '') + (v < 0 ? ' is-neg' : '') + '" x="' + (x1 + 34) + '" y="' + (y + 6) + '">' + sg(v) + '</text>';
    }
    const cold = min < 0 ? '<rect class="th__cold" x="' + (x0 - 16) + '" y="' + (max > 0 ? yOf(0) : TH.top - 8) + '" width="' + (TH.w + 70) + '" height="' + (bot - (max > 0 ? yOf(0) : TH.top - 8) + 6) + '" rx="8"/>' : '';
    const tube = 'M' + x0 + ' ' + bot + 'V' + (TH.top - 8) + 'a' + (TH.w / 2) + ' ' + (TH.w / 2) + ' 0 0 1 ' + TH.w + ' 0V' + bot;
    return {
      H: H, yOf: yOf, bot: bot,
      markup: '<svg class="th__svg" viewBox="0 0 170 ' + H + '" aria-hidden="true" focusable="false">' +
        '<defs><clipPath id="' + id + '"><path d="' + tube + 'Z"/></clipPath></defs>' + cold +
        '<path class="th__glass" d="' + tube + 'Z"/>' +
        '<g clip-path="url(#' + id + ')"><rect class="th__liq" x="' + x0 + '" y="' + (TH.top - 10) + '" width="' + TH.w + '" height="' + (bot - TH.top + 60) + '"/></g>' +
        '<circle class="th__bulb" cx="' + cx + '" cy="' + bulbY + '" r="25"/><rect class="th__neck" x="' + (x0 + 4) + '" y="' + (bot - 4) + '" width="' + (TH.w - 8) + '" height="' + 22 + '"/>' +
        '<path class="th__shine" d="M' + (x0 + 7) + ' ' + (TH.top + 2) + 'V' + (bot - 10) + '"/>' +
        ticks + '<text class="th__unit" x="' + (x0 - 34) + '" y="' + (TH.top + 4) + '">°C</text></svg>'
    };
  }

  function thermo(host, spec) {
    spec = spec || {};
    const min = spec.min != null ? spec.min : -10, max = spec.max != null ? spec.max : 10, fixed = !!spec.fixed;
    const ev = T.tools.emitter();
    let pos = spec.start != null ? spec.start : spec.t != null ? spec.t : 0, locked = fixed, can = spec.can || null;
    const d = thermoSvg(min, max, 'th-clip-' + (++uid));
    const pic = el('div', { class: 'th__pic', role: 'img' });
    pic.appendChild(svgNode(d.markup));
    const liq = pic.querySelector('.th__liq');
    const root = el('div', { class: ['th', fixed && 'th--mini'] }, pic);
    let up = null, down = null, read = null;
    if (!fixed) {
      read = el('b', { class: 'th__read', 'aria-live': 'polite' });
      up = tbtn('Warmer', 'th__btn th__btn--up', { d: '1' }, 'up');
      down = tbtn('Colder', 'th__btn th__btn--down', { d: '-1' }, 'down');
      up.addEventListener('click', function () { move(1); });
      down.addEventListener('click', function () { move(-1); });
      root.appendChild(el('div', { class: 'th__side' }, read, up, down));
    } else if (spec.cap) root.appendChild(el('p', { class: 'th__cap', html: spec.cap }));

    function paint() {
      // the red line: a tall bar slid down so that its top is at pos (transform only), cut to the glass
      liq.style.transform = 'translateY(' + (d.yOf(pos) - (TH.top - 10)).toFixed(1) + 'px)';
      pic.setAttribute('aria-label', 'A thermometer that shows ' + (pos < 0 ? 'negative ' + (-pos) : pos) + ' degrees Celsius');
      if (read) {
        const was = read.textContent, now = sg(pos) + ' °C';
        read.textContent = now;
        if (was && was !== now) replay(read, 'is-tick');
      }
      if (up) { up.disabled = locked || !canDo(can, 'up'); down.disabled = locked || !canDo(can, 'down'); }
    }
    function move(k) {
      if (locked || !canDo(can, k > 0 ? 'up' : 'down')) return false;
      const np = pos + k;
      if (np < min || np > max) { shake(pic); sfx('no'); return false; }
      pos = np;
      sfx('tap');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: k > 0 ? 'warm' : 'cold', pos: pos });
      return true;
    }
    function get() { return { pos: pos }; }
    paint();
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, move: move,
      set: function (v) { if (v && typeof v.pos === 'number') { pos = v.pos; paint(); } },
      solve: function (r) { if (r && typeof r.pos === 'number') { pos = r.pos; paint(); } },
      ready: function () { return true; },
      lock: function () { locked = true; paint(); },
      allow: function (c) { can = c || {}; locked = fixed; paint(); },
      tip: function () {
        const want = spec.dir > 0 ? up : down;
        if (want && !want.disabled) return want;
        return [down, up].filter(function (b) { return b && !b.disabled; })[0] || null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- counters in a growing square ---------- */

  const CELL = 30, GAP = 6;

  function grid(host, spec) {
    spec = spec || {};
    // Stop 5: the v2 grid in array mode (rows and "in each row" apart) is the array of 39-tools-times.js
    if (spec.mode === 'array' && T.tools.array) return T.tools.array(host, spec);
    const fixed = !!spec.fixed, mx = spec.max || 9;
    const ev = T.tools.emitter();
    let rows = spec.rows || 1, cols = spec.cols || rows, locked = fixed, can = spec.can || null;
    const side = mx * CELL + (mx + 1) * GAP;
    const svg = el('svg:svg', { class: 'cg__svg', viewBox: '0 0 ' + side + ' ' + side, 'aria-hidden': 'true', focusable: 'false' });
    const felt = el('div', { class: 'cg__felt', role: 'img' }, svg);
    const root = el('div', { class: ['cg', fixed && 'cg--mini'] }, felt);
    let less = null, more = null, info = null;
    if (!fixed) {
      less = tbtn('Smaller', 'cg__btn', { a: 'less' }, 'minus');
      more = tbtn('Bigger', 'cg__btn cg__btn--more', { a: 'more' }, 'plus');
      info = el('b', { class: 'cg__info', 'aria-live': 'polite' });
      less.addEventListener('click', function () { act(-1); });
      more.addEventListener('click', function () { act(1); });
      root.appendChild(el('div', { class: 'cg__ctl' }, less, info, more));
    }
    if (spec.cap) root.appendChild(el('p', { class: 'cg__cap', html: spec.cap }));

    const dots = {};          // 'r-c' -> circle
    function paint(grew) {
      Object.keys(dots).forEach(function (key) {
        const rc = key.split('-').map(Number);
        if (rc[0] >= rows || rc[1] >= cols) { svg.removeChild(dots[key]); delete dots[key]; }
      });
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const key = r + '-' + c, edge = rows > 1 && (r === rows - 1 || c === cols - 1);
        let dot = dots[key];
        if (!dot) {
          dot = el('svg:circle', { cx: GAP + c * (CELL + GAP) + CELL / 2, cy: GAP + r * (CELL + GAP) + CELL / 2, r: CELL / 2 - 1 });
          svg.appendChild(dot);
          dots[key] = dot;
          if (grew && !still()) { dot.style.animationDelay = ((r + c) % 6) * 30 + 'ms'; dot.classList.add('is-new'); }
        }
        dot.classList.toggle('cg__c', true);
        dot.classList.toggle('is-edge', edge);
      }
      const say = rows + (rows === 1 ? ' row of ' : ' rows of ') + cols;
      felt.setAttribute('aria-label', say + (rows * cols === 1 ? ' counter' : ' counters'));
      if (info) info.textContent = say;
      if (less) {
        less.disabled = locked || rows <= 1 || !canDo(can, 'less');
        more.disabled = locked || rows >= mx || !canDo(can, 'more');
      }
    }
    function act(k) {
      if (locked || !canDo(can, k > 0 ? 'more' : 'less')) return false;
      if ((k > 0 && rows >= mx) || (k < 0 && rows <= 1)) return false;
      rows += k; cols = rows;
      sfx(k > 0 ? 'snap' : 'pop');
      paint(k > 0);
      ev.emit('change', get());
      ev.emit('trade', { act: k > 0 ? 'grow' : 'shrink', rows: rows });
      return true;
    }
    function get() { return { rows: rows, cols: cols }; }
    paint(false);
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, act: act,
      set: function (v) { if (v && v.rows) { rows = v.rows; cols = v.cols || v.rows; paint(false); } },
      solve: function (r) { if (r && r.rows) { rows = r.rows; cols = r.cols || r.rows; paint(true); } },
      ready: function () { return true; },
      lock: function () { locked = true; paint(false); },
      allow: function (c) { can = c || {}; locked = fixed; paint(false); },
      tip: function () { return more && !more.disabled ? more : less && !less.disabled ? less : null; },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- pictures ---------- */

  // r rows of c counters (the dots of a square number pattern)
  function dots(spec) {
    const r = spec.r || 1, c = spec.c || 1, s = 22, g = 5, w = c * s + (c + 1) * g, h = r * s + (r + 1) * g;
    let body = '';
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
      body += '<circle cx="' + (g + j * (s + g) + s / 2) + '" cy="' + (g + i * (s + g) + s / 2) + '" r="' + (s / 2 - 1) + '"/>';
    }
    const fig = el('figure', { class: ['dpic', 'p-' + (spec.col || 't')] });
    const svg = svgNode('<svg class="dpic__svg" viewBox="0 0 ' + w + ' ' + h + '" style="width:' + (w * 0.0625 * 1.2).toFixed(3) + 'rem" role="img" aria-label="' +
      r + (r === 1 ? ' row of ' : ' rows of ') + c + (r * c === 1 ? ' dot' : ' dots') + '">' + body + '</svg>');
    fig.appendChild(svg);
    if (spec.cap) fig.appendChild(el('figcaption', { html: String(spec.cap) }));
    return fig;
  }

  // the square number patterns 1st, 2nd, 3rd ... and the asked one as a "?"
  function dotseq(spec) {
    const row = el('div', { class: 'dotseq' });
    (spec.ks || [1, 2, 3]).forEach(function (k) { row.appendChild(dots({ r: k, c: k, cap: ORD(k) })); });
    if (spec.ask) row.appendChild(el('figure', { class: 'dpic dpic--ask' }, el('span', { class: 'dpic__q', 'aria-label': 'The ' + ORD(spec.ask) + ' pattern: not shown' }, '?'), el('figcaption', ORD(spec.ask))));
    return row;
  }

  // a sequence drawn with marker: each number in a ring, an arrow from one to the next, the jump over each arrow.
  // One drawing that fits the width, so the row never breaks (as v2).
  function hops(spec) {
    const tx = function (v) { return typeof v === 'string' ? v : sg(v); };
    const terms = spec.terms || [], n = terms.length + (spec.blanks || 0), labs = spec.labs || [];
    const long = Math.max.apply(null, terms.map(function (v) { return tx(v).length; }).concat([1]));
    const cw = long >= 5 ? 92 : long === 4 ? 80 : 70, bw = cw - 16, bh = 44, W = n * cw, cy = 74, H = cy + bh / 2 + 6, top = cy - bh / 2 - 4;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = i * cw + cw / 2, ask = i >= terms.length;
      if (i < n - 1) {
        const x1 = x + 8, x2 = x + cw - 8, xm = x + cw / 2;
        s += '<path class="hp__a" d="M' + x1 + ' ' + top + ' Q' + xm + ' ' + (top - 34) + ' ' + x2 + ' ' + top + '"/>' +
          '<path class="hp__a" d="M' + (x2 - 9) + ' ' + (top - 3) + ' L' + x2 + ' ' + top + ' L' + (x2 - 2) + ' ' + (top - 10) + '"/>' +
          (labs[i] ? '<text class="hp__l" x="' + xm + '" y="' + (top - 24) + '">' + labs[i] + '</text>' : '');
      }
      s += '<rect class="hp__b' + (ask ? ' is-ask' : '') + '" x="' + (x - bw / 2) + '" y="' + (cy - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="' + (bh / 2) + '"/>' +
        '<text class="hp__t' + (ask ? ' is-ask' : '') + '" x="' + x + '" y="' + (cy + 8) + '">' + (ask ? '?' : tx(terms[i])) + '</text>';
    }
    const say = terms.map(tx).join(', ') + (spec.blanks ? ', and ' + spec.blanks + ' more to find' : '') + (labs[0] && labs[0] !== '?' ? '. Each jump: ' + labs[0] : '');
    const box = el('div', { class: 'hops' });
    box.appendChild(svgNode('<svg class="hops__svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.round(W * 1.15) + 'px" role="img" aria-label="' + say + '">' + s + '</svg>'));
    return box;
  }

  // pictures only, as a tool on the desk (nothing to answer inside it)
  function pics(host, spec) {
    const box = el('div', { class: 'toolpics' });
    (spec && spec.list || []).forEach(function (x) { const p = T.tools.pic(x); if (p) box.appendChild(p); });
    mount(host, box);
    return { el: box, get: function () { return {}; }, on: function () {}, lock: function () {}, ready: function () { return true; },
      destroy: function () { if (box.parentNode) box.parentNode.removeChild(box); } };
  }

  T.tools.nline = nline;
  T.tools.thermo = thermo;
  T.tools.grid = grid;
  T.tools.pics = pics;
  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.nline = function (spec) { return nline(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  // Stop 3: rounding on a line (v2 PICS.rline): n between the two round numbers, halfway in the middle; show = the end it
  // rounds to (lit, with the jump to it)
  kinds.rline = function (spec) { return nline(null, { mode: 'round', skin: 'board', n: spec.n, to: spec.to, show: spec.show, fixed: true, mini: true, cap: spec.cap }).el; };
  kinds.thermo = function (spec) { return thermo(null, Object.assign({}, spec, { fixed: true })).el; };
  kinds.dots = dots;
  kinds.dotseq = dotseq;
  kinds.hops = hops;
})(window.T = window.T || {});

