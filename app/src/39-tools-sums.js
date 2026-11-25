/* 39-tools-sums.js - the maths tools of Stop 4 (add and subtract), flat on the light art plate (39-tools-sums.css).
   Ported from Maths v2 (legacy/maths-v2/src/mui_d.js: TOOLS.takeaway, TOOLS.balance, PICS.pairs, PICS.col, PICS.bar,
   PICS.piceq), drawn in the Grade 4 flat style, with the v2 answers kept: get() returns what the models' check(r) reads,
   solve(task.right) shows the right state.

   Every tool: T.tools.<name>(host, spec) -> { el, get(), on('change' | 'trade', fn), lock(), destroy(), ready(), solve(right),
     tip(), allow(can) }. host may be null. allow(can) is used by See it (one step at a time); without it everything works.

   T.tools.takeaway(host, spec)   take away with blocks: the mat (39-mat.js) shows the first number; when a place has too
       few blocks, the child taps a bigger block to break it; then "Take away 156" takes the second number away.
       spec = { b: [th, h, t, o], take: [th, h, t, o], room }. get() -> { b, taken }; allow({ brk: ['t'], take: true });
       trade { act: 'brk', k } (from the mat) and { act: 'take' }
   T.tools.balance(host, spec)    a balance scale: number blocks on two pans, the yellow block is the missing number. The
       beam tips to the heavier side and comes level when both sides are equal. spec = { left, right, val } (sides as in
       the eqbox model: [25, '+', null]); live(r) takes the typed number (r.v[0]) from the number pad
   T.tools.pairs(host, spec)      counters put in pairs (See it): "Make pairs" for each number, then "Put together".
       spec = { groups: [7, 5] }. get() -> { paired: [true, false], joined }; allow({ pair: 0 | 1, join: true });
       trade { act: 'pair', g } and { act: 'join' }
   Pictures (T.tools.pic): { k: 'pairs', groups, sum }, { k: 'col', a, b, op ('+', '-'; Stop 6: 'x'), ans, marks, upto }, { k: 'bar', whole, parts },
       { k: 'piceq', pic, n, total, unit, alt }, { k: 'balance', left, right, val }
   Motion: transform and opacity only (the beam turns, counters pop into pairs, the taken blocks fade); still = at once. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const still = function () {
    try { if (T.fx && T.fx.still) return !!T.fx.still(); } catch (e) { /* fall through */ }
    return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion());
  };
  const mount = function (host, node) { if (host) host.appendChild(node); return node; };
  const fmt = function (n) { return window.MX ? window.MX.fmt(n) : String(n); };
  function tbtn(label, cls, data, iconStart) {
    return el('button', { type: 'button', class: ['btn', 'tl__btn', cls], dataset: data || {} },
      iconStart ? T.ui.icon(iconStart) : null, el('span', { class: 'btn__label' }, label));
  }
  const same = function (a, b) { return JSON.stringify(a || {}) === JSON.stringify(b || {}); };

  /* ---------- take away with blocks ---------- */

  function takeaway(host, spec) {
    spec = spec || {};
    const MX = window.MX, P = MX.places(4), need = spec.take || [0, 0, 0, 0], n = MX.total(need), ev = T.tools.emitter();
    let taken = false, locked = !!spec.fixed, guided = spec.can || null, matCan = null;
    const root = el('div', { class: 'tk' });
    const info = el('p', { class: 'tk__info', 'aria-live': 'polite' });
    const btn = tbtn('Take away ' + fmt(n), 'tk__take', null, 'minus');
    const bar = el('div', { class: 'tk__bar' }, info, btn);
    // the mat fits in the room the scene gives, less the line and the button under it
    const room = spec.room ? function () { return spec.room() - bar.offsetHeight - 12; } : null;
    const mat = T.tools.mat(root, { b: (spec.b || [0, 0, 0, 0]).slice(), counts: true, multi: true, can: {}, room: room });
    root.appendChild(bar);

    // the first place (from the ones) that has too few blocks, and the place of the block to break for it
    function shortAt(b) { return [3, 2, 1].find(function (i) { return b[i] < need[i]; }); }
    function breakAt(b, i) { let j = i - 1; while (j > 0 && b[j] === 0) j--; return b[j] > 0 ? j : null; }
    function allowMat(c) { if (!same(c, matCan)) { matCan = c; mat.allow(c); } }

    function paint() {
      const b = mat.get().b;
      if (taken) {
        info.innerHTML = '<b>' + fmt(n) + '</b> is gone. Count the blocks that are left.';
        btn.hidden = true;
        return;
      }
      const i = shortAt(b);
      if (i != null) {
        const j = breakAt(b, i);
        info.innerHTML = 'You need <b>' + MX.cnt(need[i], P[i]) + '</b>, but there ' + (b[i] === 1 ? 'is' : 'are') + ' only <b>' + b[i] + '</b>.' +
          (j != null ? ' Tap 1 ' + P[j].one + ' to break it.' : '');
        const may = j != null && !locked && (!guided || (guided.brk || []).indexOf(P[j].k) >= 0);
        allowMat(may ? { brk: [P[j].k] } : {});
        btn.disabled = true;
      } else {
        info.innerHTML = 'Now there are enough blocks to take away.';
        allowMat({});
        btn.disabled = locked || !mat.ready() || (!!guided && !guided.take);
      }
    }
    function get() { const g = mat.get(); return { b: g.b, taken: taken }; }
    function take() {
      if (taken || locked || btn.disabled) return false;
      const b = mat.get().b;
      taken = true;
      mat.set(b.map(function (x, i) { return x - need[i]; }));
      mat.lock();
      sfx('pop');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: 'take' });
      return true;
    }
    btn.addEventListener('click', take);
    mat.on('change', function () { paint(); ev.emit('change', get()); });
    mat.on('trade', function (t) { paint(); ev.emit('trade', t); });
    paint();
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, take: take,
      ready: function () { return mat.ready(); },
      solve: function (r) { if (!taken && r && r.b) { taken = true; mat.set(r.b); mat.lock(); paint(); } },
      lock: function () { locked = true; mat.lock(); btn.disabled = true; },
      allow: function (c) { guided = c || {}; paint(); },
      reveal: function (what) { if (mat.reveal) mat.reveal(what); },
      tip: function () { return taken ? null : !btn.disabled ? btn : root.querySelector('.mat__pc.is-tap'); },
      fit: function () { if (mat.fit) mat.fit(); },
      destroy: function () { mat.destroy(); if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- a balance scale ---------- */

  const nums = function (side) { return (side || []).filter(function (x) { return x !== '+' && x !== '-'; }); };
  function balance(host, spec) {
    spec = spec || {};
    const left = spec.left || [], right = spec.right || [], fixed = !!spec.fixed;
    const boxLeft = nums(left).indexOf(null) >= 0;
    let val = spec.val != null ? spec.val : null, state = '';
    const NS = 'svg:';
    const W = 360, PIV = 180, ARM = 110;
    // one weight: a block with its number (the missing one is gold with a dashed edge)
    function weights(side) {
      const list = nums(side), ws = list.map(function (x) { return Math.max(46, 18 + 13 * String(x == null ? '?' : fmt(x)).length); });
      const tot = ws.reduce(function (s, w) { return s + w; }, 0) + (ws.length - 1) * 6;
      let x = -tot / 2;
      const g = el(NS + 'g', { class: 'bal__ws' });
      list.forEach(function (v, i) {
        const w = ws[i], ask = v == null;
        const cell = el(NS + 'g', { class: ['bal__w', ask && 'is-ask'] },
          el(NS + 'rect', { x: x, y: -42, width: w, height: 40, rx: 8 }),
          el(NS + 'text', { x: x + w / 2, y: -15 }, ask ? '?' : fmt(v)));
        g.appendChild(cell);
        x += w + 6;
      });
      return g;
    }
    // a pan hangs from each end of the beam: it turns back by the beam's tilt (.bal__keep), so it hangs straight down
    function pan(side, x) {
      return el(NS + 'g', { transform: 'translate(' + x + ' 0)' }, el(NS + 'g', { class: 'bal__keep' },
        el(NS + 'path', { class: 'bal__str', d: 'M0 0L-48 58M0 0L48 58' }),
        el(NS + 'g', { transform: 'translate(0 58)' }, weights(side),
          el(NS + 'path', { class: 'bal__pan', d: 'M-66 0h132l-12 14h-108z' }))));
    }
    const beam = el(NS + 'g', { class: 'bal__beam' },
      el(NS + 'rect', { class: 'bal__arm', x: -ARM - 8, y: -6, width: 2 * ARM + 16, height: 12, rx: 6 }),
      pan(left, -ARM), pan(right, ARM));
    const svg = el(NS + 'svg', { class: 'bal__svg', viewBox: '0 4 ' + W + ' 214', 'aria-hidden': 'true', focusable: 'false' },
      el(NS + 'path', { class: 'bal__base', d: 'M' + (PIV - 62) + ' 214h124l-10-16h-104z' }),
      el(NS + 'rect', { class: 'bal__post', x: PIV - 7, y: 20, width: 14, height: 180, rx: 5 }),
      el(NS + 'g', { transform: 'translate(' + PIV + ' 22)' }, beam),
      el(NS + 'circle', { class: 'bal__pin', cx: PIV, cy: 22, r: 10 }));
    const say = el('p', { class: 'bal__say', 'aria-live': 'polite' });
    const root = el('div', { class: ['bal', fixed && 'bal--mini'], role: 'group' }, el('div', { class: 'bal__plate' }, svg), fixed ? null : say);
    const sum = function (side) { return nums(side).reduce(function (s, x) { return s + (x == null ? (val || 0) : x); }, 0); };
    function paint(quiet) {
      const L = sum(left), R = sum(right), st = val == null ? 'open' : L === R ? 'level' : L > R ? 'left' : 'right';
      T.util.$$('.bal__w.is-ask text', svg).forEach(function (t) { t.textContent = val == null ? '?' : fmt(val); });
      root.dataset.st = st;
      // the beam turns around its pin; the pans turn back, so they hang straight down
      const tilt = st === 'level' ? 0 : st === 'open' ? (boxLeft ? 6 : -6) : st === 'left' ? -6 : 6;
      root.style.setProperty('--tilt', tilt + 'deg');
      const words = st === 'open' ? 'Type a number for the yellow block.' : st === 'level' ? 'It balances! Both sides are ' + fmt(L) + '.' :
        'The ' + (L > R ? 'left' : 'right') + ' side is heavier: ' + fmt(L) + ' and ' + fmt(R) + '.';
      say.textContent = words;
      root.setAttribute('aria-label', 'A balance scale. ' + (st === 'open' ? 'One block is missing.' : words));
      if (!quiet && st !== state && state) sfx(st === 'level' ? 'chime' : 'slide');
      state = st;
    }
    paint(true);
    mount(host, root);
    return {
      el: root, get: function () { return {}; }, on: function () {}, ready: function () { return true; },
      live: function (r) { const raw = r && r.v && r.v[0], v = raw === '' || raw == null ? null : +raw; if (v !== val) { val = v; paint(); } },
      set: function (v) { val = v; paint(true); },
      lock: function () {}, allow: function () {}, tip: function () { return null; },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- counters in pairs ---------- */

  const COL = ['red', 'blue'];
  // one tray of counters: loose in a row, or in pairs (2 rows) with the odd one left over
  function tray(n, col, paired, fresh) {
    const box = el('span', { class: ['pr__tray', paired && 'is-paired'], style: '--c:' + Math.ceil(n / 2) });
    for (let i = 0; i < n; i++) {
      const lone = paired && n % 2 === 1 && i === n - 1;
      const c = el('i', { class: ['pr__c', 'is-' + (Array.isArray(col) ? col[i] : col), lone && 'is-lone', fresh && !still() && 'is-new'] });
      if (fresh && !still()) c.style.animationDelay = Math.min(i, 12) * 30 + 'ms';
      box.appendChild(c);
    }
    return box;
  }
  const parity = function (n) { return n % 2 ? 'odd' : 'even'; };
  function said(n) {
    const p = Math.floor(n / 2), left = n % 2;
    return p + (p === 1 ? ' pair' : ' pairs') + (left ? ' and 1 left over' : ', none left over') + '. ' + n + ' is ' + parity(n) + '.';
  }
  // the caption in two lines: what the pairs show, then odd or even
  function capLines(n) {
    const t = said(n).split('. ');
    return [el('span', { class: 'pr__cap-l' }, t[0] + '.'), el('span', { class: 'pr__cap-l pr__cap-l--k' }, t[1])];
  }
  // the counters of a and b together, in pairs: the two left over (one of each colour) make a new pair
  function together(a, b) {
    const cols = [];
    for (let i = 0; i < a - a % 2; i++) cols.push(COL[0]);
    for (let i = 0; i < b - b % 2; i++) cols.push(COL[1]);
    if (a % 2) cols.push(COL[0]);
    if (b % 2) cols.push(COL[1]);
    return cols;
  }

  function pairs(host, spec) {
    spec = spec || {};
    const g = (spec.groups || [7, 5]).slice(0, 2), ev = T.tools.emitter();
    const paired = g.map(function () { return false; });
    let joined = false, locked = !!spec.fixed, can = spec.can || null, fresh = -1;
    const root = el('div', { class: 'pr' });
    const row = el('div', { class: 'pr__row' });
    const ctl = el('div', { class: 'pr__ctl' });
    const btns = g.map(function (n, i) {
      const b = tbtn('Make pairs: ' + n, 'pr__pair', { g: String(i) });
      b.addEventListener('click', function () { pair(i); });
      return b;
    });
    const joinBtn = tbtn('Put together', 'pr__join', null, 'plus');
    joinBtn.addEventListener('click', function () { join(); });
    btns.forEach(function (b) { ctl.appendChild(b); });
    ctl.appendChild(joinBtn);
    root.appendChild(row); root.appendChild(ctl);

    const may = function (k, i) { if (!can) return true; if (k === 'pair') return can.pair === i || can.pair === true; return !!can.join; };
    function group(n, col, on, isNew, cap) {
      return el('figure', { class: 'pr__g' }, el('b', { class: 'pr__n' }, String(n)), tray(n, col, on, isNew), el('figcaption', { class: 'pr__cap' }, cap));
    }
    function paint() {
      T.ui.empty(row);
      g.forEach(function (n, i) {
        if (i) row.appendChild(el('b', { class: 'pr__op', 'aria-hidden': 'true' }, '+'));
        row.appendChild(group(n, COL[i], paired[i], fresh === i, paired[i] ? capLines(n) : '\u00a0'));
      });
      if (joined) {
        const t = g[0] + g[1];
        row.appendChild(el('b', { class: 'pr__op', 'aria-hidden': 'true' }, '='));
        row.appendChild(group(t, together(g[0], g[1]), true, fresh === 2, capLines(t)));
      }
      row.setAttribute('aria-label', g.map(function (n, i) { return n + ' counters' + (paired[i] ? ' in pairs: ' + said(n) : ''); }).join(', ') +
        (joined ? '. Together: ' + said(g[0] + g[1]) : ''));
      row.setAttribute('role', 'img');
      btns.forEach(function (b, i) { b.disabled = locked || paired[i] || !may('pair', i); });
      joinBtn.disabled = locked || joined || !paired.every(Boolean) || !may('join');
      fresh = -1;
    }
    function pair(i) {
      if (locked || paired[i] || !may('pair', i)) return false;
      paired[i] = true; fresh = i;
      sfx('snap');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: 'pair', g: i });
      return true;
    }
    function join() {
      if (locked || joined || !paired.every(Boolean) || !may('join')) return false;
      joined = true; fresh = 2;
      sfx('chime');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: 'join' });
      return true;
    }
    function get() { return { paired: paired.slice(), joined: joined }; }
    paint();
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, pair: pair, join: join, ready: function () { return true; },
      solve: function () { paired.fill(true); joined = true; paint(); },
      lock: function () { locked = true; paint(); },
      allow: function (c) { can = c || {}; paint(); },
      tip: function () { return btns.concat([joinBtn]).filter(function (b) { return !b.disabled; })[0] || null; },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- pictures ---------- */

  // counters in pairs: each number, then (sum) the two together
  function pairsPic(spec) {
    const g = spec.groups || [];
    const fig = el('div', { class: 'prpic', role: 'img', 'aria-label': g.map(function (n) { return n + ' counters in pairs: ' + n + ' is ' + parity(n); }).join('. ') +
      (spec.sum && g.length === 2 ? '. Together ' + (g[0] + g[1]) + ' is ' + parity(g[0] + g[1]) : '') + '.' });
    g.forEach(function (n, i) {
      if (i) fig.appendChild(el('b', { class: 'pr__op', 'aria-hidden': 'true' }, '+'));
      fig.appendChild(el('figure', { class: 'pr__g' }, tray(n, COL[i % 2], true, false), el('figcaption', { class: 'pr__cap' }, n + ' is ' + parity(n))));
    });
    if (spec.sum && g.length === 2) {
      const t = g[0] + g[1];
      fig.appendChild(el('b', { class: 'pr__op', 'aria-hidden': 'true' }, '='));
      fig.appendChild(el('figure', { class: 'pr__g' }, tray(t, together(g[0], g[1]), true, false), el('figcaption', { class: 'pr__cap' }, t + ' is ' + parity(t))));
    }
    return fig;
  }

  // a written sum on squared paper (the column method); ans: the answer row (a wrong one too, for a mistake to spot);
  // marks: the regrouped digits above (addition); upto: only the first places of the answer so far
  function colPic(spec) {
    const MX = window.MX, show = spec.ans != null, mul = spec.op === 'x';
    const w = MX.colwork(spec.a, spec.op, spec.b), A = MX.digits(spec.a, w.n), B = mul ? [spec.b] : MX.digits(spec.b, w.n);
    const ansDs = show ? String(spec.ans).split('').map(Number) : [];
    const n = Math.max(w.n, w.cells.length, ansDs.length);
    const upto = spec.upto != null ? spec.upto : 99;
    const cell = function (x, cls) { return el('b', { class: cls || null }, x == null ? '' : String(x)); };
    const rowOf = function (cls, sign, ds, lead) {
      const r = el('span', { class: ['cs__r', cls] }, el('i', sign));
      for (let k = 0; k < lead; k++) r.appendChild(cell(null));
      ds.forEach(function (x) { r.appendChild(cell(x)); });
      return r;
    };
    const grid = el('span', { class: 'cs', style: '--n:' + n });
    if (show && spec.marks && spec.op !== '-' && spec.marks.some(Boolean)) {   // the regrouped digits (addition; Stop 6: multiplication)
      const m = [];
      for (let j = 0; j < n; j++) { const place = n - 1 - j; m.push(place > 0 && place <= upto && spec.marks[place - 1] ? spec.marks[place - 1] : null); }
      grid.appendChild(rowOf('cs__r--mk', '', m, 0));
    }
    grid.appendChild(rowOf('', '', A, n - w.n));
    grid.appendChild(rowOf('', mul ? '×' : spec.op === '+' ? '+' : '−', B, n - B.length));
    const shown = show ? ansDs.map(function (x, j) { return ansDs.length - 1 - j < upto ? x : null; }) : [];
    grid.appendChild(rowOf('cs__r--ans', '', show ? shown : Array.from({ length: n }, function () { return null; }), show ? n - shown.length : 0));
    return el('div', { class: 'cspic', role: 'img', 'aria-label': fmt(spec.a) + (mul ? ' times ' : spec.op === '+' ? ' plus ' : ' take away ') + fmt(spec.b) +
      (show ? ' equals ' + fmt(spec.ans) : '') + ', written in columns' }, grid);
  }

  // a bar model: the whole on top, its parts below; null is the part (or the whole) to find
  function barPic(spec) {
    const parts = spec.parts || [], known = parts.filter(function (x) { return x != null; });
    const sumK = known.reduce(function (s, x) { return s + x; }, 0), nUn = parts.length - known.length;
    const whole = spec.whole != null ? spec.whole : nUn ? null : sumK;
    const rest = whole != null && nUn ? Math.max(whole - sumK, 0) / nUn : 0;
    // a part to find is as long as the known parts (equal parts, Stop 7: one sixth is 4, find the whole)
    const flex = function (x) { return x != null ? x : rest || (whole == null && known.length ? sumK / known.length : (whole || sumK || 1) / parts.length); };
    const tot = parts.reduce(function (s, x) { return s + flex(x); }, 0) || 1;
    const say = function (x) { return x == null ? 'to find' : fmt(x); };
    return el('div', { class: 'barm', role: 'img', 'aria-label': 'Bar model. Whole: ' + say(spec.whole) + '. Parts: ' + parts.map(say).join(', ') + '.' },
      el('div', { class: ['barm__whole', spec.whole == null && 'is-ask'] }, el('span', spec.whole == null ? '?' : fmt(spec.whole))),
      el('div', { class: 'barm__parts' }, parts.map(function (x, i) {
        return el('span', { class: ['barm__p', 'c' + (i % 3), x == null && 'is-ask'], style: 'flex:' + Math.max(flex(x) / tot, 0.16).toFixed(3) + ' 1 0' }, x == null ? '?' : fmt(x));
      })));
  }

  // pictures with + and =: n of the same picture make a total
  function picEq(spec) {
    const box = el('div', { class: 'peq', role: 'img', 'aria-label': spec.alt || '' });
    const one = function () {
      const a = window.T_ART && window.T_ART[spec.pic] ? T.ui.art(spec.pic, { decorative: true }) : T.ui.icon(spec.pic || 'star');
      return el('span', { class: 'peq__i', 'aria-hidden': 'true' }, a);
    };
    for (let i = 0; i < spec.n; i++) {
      if (i) box.appendChild(el('b', { class: 'peq__op', 'aria-hidden': 'true' }, '+'));
      box.appendChild(one());
    }
    box.appendChild(el('span', { class: 'peq__eq', 'aria-hidden': 'true' }, el('b', { class: 'peq__op' }, '='),
      el('span', { class: 'peq__t' }, fmt(spec.total), spec.unit ? el('small', ' ' + spec.unit) : null)));
    return box;
  }

  T.tools.takeaway = takeaway;
  T.tools.balance = balance;
  T.tools.pairs = pairs;
  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.pairs = pairsPic;
  kinds.col = colPic;
  kinds.bar = barPic;
  kinds.piceq = picEq;
  kinds.balance = function (spec) { return balance(null, Object.assign({}, spec, { fixed: true })).el; };
})(window.T = window.T || {});

