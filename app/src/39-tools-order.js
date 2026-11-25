/* 39-tools-order.js - the maths tools of Stop 3 (compare, order and round), flat on the light art plate (39-tools-order.css).
   Ported from Maths v2 (legacy/maths-v2/src/mui_c.js: TOOLS.order, TOOLS.pickall), with the v2 answers kept:
   get() returns what the models' check(r) reads, solve(task.right) shows the right state. The rounding line is the
   number line's round mode (39-tools-lines.js). On the Mini test paper (.tp) the same tools look like pencil on paper.

   Every tool: T.tools.<name>(host, spec) -> { el, get(), on('change' | 'trade', fn), lock(), destroy(), ready(), solve(right),
     tip(), allow(can), mark(parts) }. host may be null. allow(can) is used by See it (one step at a time); without it
     everything works.

   T.tools.order(host, spec)    number tiles to put in order. spec = { nums, from: 'smallest', to: 'largest' }
       tap a tile: it goes to the first empty place; tap a placed tile: it goes back. get() -> { order: [v | null], placed };
       ready() when every place is full; mark(parts) rings the places that are wrong (false); allow({ place: true |
       [values in the order they must come] }) (a tile that is not next shakes); trade { act: 'place', v, placed }
   T.tools.pickall(host, spec)  numbers in a row: tap to draw a ring around each one that fits (more than one can be right).
       spec = { nums }. get() -> { picks: [sorted] }; ready() with one ring or more; mark(bad values) crosses those rings;
       review(right) colours the rings on the marked paper (green tick, red cross, dashed green answer)
   T.tools.pvcmp(host, spec)    two numbers on a place value chart, compared place by place (See it only).
       spec = { a, b, cols }. "Next place" lights the next place from the left and says "same", or the two digits with
       the sign; then the signs < > = for the box between the numbers. get() -> { at: the place looked at (-1 none),
       sym }; allow({ look, sign: true | the one sign that fits }); trade { act: 'look', at } and { act: 'sign', sym }
   Motion: a placed tile and a ring pop in or draw themselves (transform, opacity, stroke-dashoffset); still = at once. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const still = function () {
    try { if (T.fx && T.fx.still) return !!T.fx.still(); } catch (e) { /* fall through */ }
    return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion());
  };
  const sg = function (v) { return window.MX ? window.MX.sg(v) : (v < 0 ? '−' + (-v) : String(v)); };
  const mount = function (host, node) { if (host) host.appendChild(node); return node; };
  function replay(node, cls) {
    if (!node || still()) return;
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
  }
  function tbtn(label, cls, data, iconStart, iconEnd) {
    return el('button', { type: 'button', class: ['btn', 'tl__btn', cls], dataset: data },
      iconStart ? T.ui.icon(iconStart) : null, el('span', { class: 'btn__label' }, label), iconEnd ? T.ui.icon(iconEnd) : null);
  }
  // a pencil ring around a number (drawn like a pen: stroke-dashoffset)
  function ring() {
    return el('svg:svg', { class: 'pk__ring', viewBox: '0 0 120 50', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
      el('svg:path', { pathLength: '1', 'vector-effect': 'non-scaling-stroke', d: 'M60 4 C28 4 4 13 4 25 C4 37 28 46 60 46 C92 46 116 37 116 25 C116 13 92 4 60 4 Z' }));
  }

  /* ---------- number tiles to put in order ---------- */

  function order(host, spec) {
    spec = spec || {};
    const nums = (spec.nums || []).slice(), ev = T.tools.emitter();
    const slots = nums.map(function () { return null; }), used = nums.map(function () { return -1; });
    let locked = !!spec.fixed, can = spec.can || null, bad = null;
    const wide = Math.max.apply(null, nums.map(function (v) { return sg(v).length; }).concat([1]));
    const root = el('div', { class: 'ord', role: 'group', 'aria-label': 'Put the numbers in order, ' + (spec.from || 'smallest') + ' first', style: '--ch:' + wide });
    const row = el('div', { class: 'ord__row' });
    const slotEls = slots.map(function (x, i) {
      const s = el('button', { type: 'button', class: 'ord__slot', dataset: { i: String(i) } });
      s.addEventListener('click', function () { takeBack(i); });
      row.appendChild(s);
      return s;
    });
    const ends = el('p', { class: 'ord__ends', 'aria-hidden': 'true' }, el('span', spec.from || 'smallest'), el('i', { class: 'ord__arrow' }), el('span', spec.to || 'largest'));
    const pool = el('div', { class: 'ord__pool' });
    const tiles = nums.map(function (v, j) {
      const t = el('button', { type: 'button', class: 'ord__tile', dataset: { j: String(j), v: String(v) } }, sg(v));
      t.addEventListener('click', function () { place(j); });
      pool.appendChild(t);
      return t;
    });
    root.appendChild(row); root.appendChild(ends); root.appendChild(pool);

    const placed = function () { return slots.filter(function (j) { return j != null; }).length; };
    function get() { return { order: slots.map(function (j) { return j == null ? null : nums[j]; }), placed: placed() }; }
    // the value that must come next in a See it step (allow({ place: [values] })), else null (any tile)
    function want() {
      if (!can || !Array.isArray(can.place)) return null;
      const now = get().order;
      const left = can.place.filter(function (v) { return now.indexOf(v) < 0; });
      return left.length ? left[0] : null;
    }
    const mayPlace = function () { return !can || (can.place != null && can.place !== false); };
    function paint(fresh) {
      slotEls.forEach(function (s, i) {
        const j = slots[i];
        s.textContent = '';
        if (j != null) s.appendChild(el('span', { class: ['ord__tile', 'is-in', fresh === i && !still() && 'is-new'] }, sg(nums[j])));
        s.classList.toggle('is-full', j != null);
        s.classList.toggle('is-bad', !!bad && bad[i] === false && j != null);
        s.disabled = locked || j == null || !mayPlace();
        s.setAttribute('aria-label', 'Place ' + (i + 1) + (j == null ? ', empty' : ': ' + sg(nums[j]) + (locked ? '' : '. Tap to take it back')));
      });
      tiles.forEach(function (t, j) {
        t.classList.toggle('is-gone', used[j] >= 0);
        t.disabled = locked || used[j] >= 0 || !mayPlace();
      });
    }
    function place(j) {
      if (locked || used[j] >= 0 || !mayPlace()) return false;
      const w = want();
      if (w != null && nums[j] !== w) { replay(tiles[j], 'is-shake'); sfx('no'); return false; }
      const i = slots.indexOf(null);
      if (i < 0) return false;
      slots[i] = j; used[j] = i; bad = null;
      sfx('snap');
      paint(i);
      ev.emit('change', get());
      ev.emit('trade', { act: 'place', v: nums[j], placed: placed() });
      return true;
    }
    function takeBack(i) {
      if (locked || slots[i] == null || !mayPlace() || (can && Array.isArray(can.place))) return;
      used[slots[i]] = -1; slots[i] = null; bad = null;
      sfx('pop');
      paint(-1);
      ev.emit('change', get());
    }
    function solve(r) {
      if (!r || !Array.isArray(r.order)) return;
      slots.fill(null); used.fill(-1);
      r.order.forEach(function (v, i) { const j = nums.findIndex(function (x, jj) { return x === v && used[jj] < 0; }); if (j >= 0) { slots[i] = j; used[j] = i; } });
      bad = null;
      paint(-1);
    }
    paint(-1);
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, place: function (v) { const j = nums.findIndex(function (x, jj) { return x === v && used[jj] < 0; }); return j >= 0 && place(j); },
      solve: solve, set: solve,
      ready: function () { return slots.every(function (j) { return j != null; }); },
      lock: function () { locked = true; paint(-1); },
      mark: function (parts) { bad = Array.isArray(parts) ? parts : null; paint(-1); },
      allow: function (c) { can = c || {}; locked = !!spec.fixed; paint(-1); },
      tip: function () {
        const w = want();
        if (w != null) return tiles.filter(function (t, j) { return nums[j] === w && used[j] < 0 && !t.disabled; })[0] || null;
        return tiles.filter(function (t) { return !t.disabled; })[0] || null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- a ring around every number that fits ---------- */

  function pickall(host, spec) {
    spec = spec || {};
    const nums = (spec.nums || []).slice(), ev = T.tools.emitter(), on = {};
    let locked = !!spec.fixed, bad = [];
    const root = el('div', { class: 'pkall', role: 'group', 'aria-label': 'Numbers. Put a ring around every one that fits.' });
    const btns = nums.map(function (v) {
      const b = el('button', { type: 'button', class: 'pk', dataset: { v: String(v) }, 'aria-pressed': 'false' }, el('span', { class: 'pk__n' }, sg(v)));
      b.addEventListener('click', function () { toggle(v); });
      root.appendChild(b);
      return b;
    });
    const btnOf = function (v) { return btns.filter(function (b) { return +b.dataset.v === v; })[0]; };
    const picks = function () { return nums.filter(function (v) { return on[v]; }).sort(function (x, y) { return x - y; }); };
    function setOn(v, yes, fresh) {
      on[v] = !!yes;
      const b = btnOf(v), old = b.querySelector('.pk__ring');
      b.classList.toggle('is-on', !!yes);
      b.setAttribute('aria-pressed', yes ? 'true' : 'false');
      if (yes && !old) { const r = ring(); if (fresh && !still()) r.classList.add('is-new'); b.appendChild(r); }
      if (!yes && old) b.removeChild(old);
    }
    function paint() {
      btns.forEach(function (b) {
        const v = +b.dataset.v;
        b.classList.toggle('is-bad', bad.indexOf(v) >= 0 && !!on[v]);
        b.disabled = locked;
        b.setAttribute('aria-label', sg(v) + (on[v] ? ', ringed' : ''));
      });
    }
    function toggle(v) {
      if (locked) return;
      setOn(v, !on[v], true);
      bad = [];
      sfx(on[v] ? 'pick' : 'pop');
      paint();
      ev.emit('change', { picks: picks() });
      ev.emit('trade', { act: on[v] ? 'ring' : 'rub', v: v });
    }
    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, get: function () { return { picks: picks() }; },
      ready: function () { return picks().length > 0; },
      lock: function () { locked = true; root.classList.add('is-locked'); paint(); },
      mark: function (list) { bad = Array.isArray(list) ? list.filter(function (x) { return typeof x === 'number'; }) : []; paint(); },
      // the marked test paper: a ring that is right turns green with a tick, a wrong one red with a cross, and a
      // number that should have a ring gets a dashed green one (71-test-paper.js)
      review: function (right) {
        const want = (right && Array.isArray(right.picks)) ? right.picks : [];
        const sign = T.testPaperSign;
        bad = []; paint();
        btns.forEach(function (b) {
          const v = +b.dataset.v, mine = !!on[v], ok = want.indexOf(v) >= 0;
          if (mine) {
            b.classList.add(ok ? 'is-right' : 'is-wrong');
            if (sign) b.appendChild(sign(ok));
            b.setAttribute('aria-label', sg(v) + (ok ? ', ringed, right' : ', ringed, not right'));
          } else if (ok) {
            const r = ring();
            r.classList.add('pk__ring--answer');
            b.classList.add('is-answer');
            b.appendChild(r);
            b.setAttribute('aria-label', sg(v) + ', the answer');
          }
        });
      },
      solve: function (r) {
        if (!r || !Array.isArray(r.picks)) return;
        nums.forEach(function (v) { setOn(v, r.picks.indexOf(v) >= 0, true); });
        btns.forEach(function (b) { b.classList.toggle('is-shown', !!on[+b.dataset.v]); });
        bad = []; paint();
      },
      set: function (r) { if (r && Array.isArray(r.picks)) nums.forEach(function (v) { setOn(v, r.picks.indexOf(v) >= 0, false); }); paint(); },
      allow: function () { locked = !!spec.fixed; paint(); },
      tip: function () { return btns.filter(function (b) { return !b.disabled; })[0] || null; },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- compare two numbers on a place value chart, place by place ---------- */

  const SYMS = ['<', '>', '='], SAY = { '<': 'is less than', '>': 'is greater than', '=': 'is equal to' };

  function pvcmp(host, spec) {
    spec = spec || {};
    const MX = window.MX, a = spec.a, b = spec.b, cols = spec.cols || 4, ps = MX.places(cols), ev = T.tools.emitter();
    const da = MX.digits(a, cols), dbg = MX.digits(b, cols);
    const lead = function (d) { const i = d.findIndex(function (x) { return x > 0; }); return i < 0 ? cols - 1 : i; };
    const la = lead(da), lb = lead(dbg);
    const decide = (function () { for (let i = 0; i < cols; i++) if (da[i] !== dbg[i]) return i; return cols - 1; })();
    const right = a < b ? '<' : a > b ? '>' : '=';
    let at = -1, sym = '', locked = !!spec.fixed, can = spec.can || null;

    const grid = el('div', { class: 'pc__grid', style: '--cols:' + cols });
    const heads = ps.map(function (p) { const h = el('div', { class: ['pv__h', 'pc__h', 'p-' + p.k] }, el('b', p.col), el('i', p.ab)); grid.appendChild(h); return h; });
    const cell = function (d, i, l) { return el('div', { class: ['pc__d', 'p-' + ps[i].k] }, el('span', i >= l ? String(d) : '')); };
    const rowA = da.map(function (d, i) { const c = cell(d, i, la); grid.appendChild(c); return c; });
    const mids = ps.map(function () { const m = el('div', { class: 'pc__mid', 'aria-hidden': 'true' }); grid.appendChild(m); return m; });
    const rowB = dbg.map(function (d, i) { const c = cell(d, i, lb); grid.appendChild(c); return c; });
    const names = el('div', { class: 'pc__names', 'aria-hidden': 'true' }, el('b', MX.fmt(a)), el('b', MX.fmt(b)));
    const chart = el('div', { class: 'pc__chart', role: 'img' }, names, grid);
    const look = tbtn('Next place', 'pc__look', { a: 'look' }, null, 'next');
    look.addEventListener('click', function () { next(); });
    const box = el('b', { class: 'pc__box', 'aria-live': 'polite' });
    const signs = SYMS.map(function (s) {
      const bt = el('button', { type: 'button', class: 'pc__sign', dataset: { s: s }, 'aria-label': SAY[s].replace(/^is /, '') }, s);
      bt.addEventListener('click', function () { choose(s, bt); });
      return bt;
    });
    const line = el('p', { class: 'pc__line' }, el('span', MX.fmt(a)), box, el('span', MX.fmt(b)));
    const root = el('div', { class: 'pc' }, chart, el('div', { class: 'pc__ctl' }, look, el('div', { class: 'pc__signs', role: 'group', 'aria-label': 'Signs' }, signs)), line);

    const mayLook = function () { return !can || !!can.look; };
    const maySign = function () { return !can || (can.sign != null && can.sign !== false); };
    function paint(fresh) {
      [heads, rowA, rowB].forEach(function (list) { list.forEach(function (c, i) { c.classList.toggle('is-hl', i === at); c.classList.toggle('is-done', i < at); }); });
      mids.forEach(function (m, i) {
        m.textContent = '';
        if (i > at) return;
        const same = da[i] === dbg[i];
        m.appendChild(el('span', { class: ['pc__say', same ? 'is-same' : 'is-diff', fresh && i === at && !still() && 'is-new'] }, same ? 'same' : da[i] + ' ' + (da[i] < dbg[i] ? '<' : '>') + ' ' + dbg[i]));
      });
      look.disabled = locked || !mayLook() || at >= decide;
      signs.forEach(function (s) { s.disabled = locked || !maySign(); s.classList.toggle('is-on', s.dataset.s === sym); s.setAttribute('aria-pressed', s.dataset.s === sym ? 'true' : 'false'); });
      box.textContent = sym || '';
      box.classList.toggle('is-full', !!sym);
      chart.setAttribute('aria-label', 'A place value chart with ' + MX.fmt(a) + ' and ' + MX.fmt(b) + (at >= 0 ? '. Looking at the ' + ps[at].many + ': ' + da[at] + ' and ' + dbg[at] + '.' : '.'));
    }
    function next() {
      if (locked || !mayLook() || at >= decide) return false;
      at++;
      sfx(da[at] === dbg[at] ? 'tap' : 'pick');
      paint(true);
      ev.emit('trade', { act: 'look', at: at });
      return true;
    }
    function choose(s, bt) {
      if (locked || !maySign()) return false;
      if (can && typeof can.sign === 'string' && s !== can.sign) { replay(bt, 'is-shake'); sfx('no'); return false; }
      sym = s;
      sfx('snap');
      paint(false);
      if (!still()) replay(box, 'is-tick');
      ev.emit('change', { at: at, sym: sym });
      ev.emit('trade', { act: 'sign', sym: sym });
      return true;
    }
    paint(false);
    mount(host, root);
    return {
      el: root, on: ev.on, get: function () { return { at: at, sym: sym }; },
      ready: function () { return !!sym; },
      solve: function () { at = decide; sym = right; paint(false); },
      lock: function () { locked = true; paint(false); },
      allow: function (c) { can = c || {}; locked = !!spec.fixed; paint(false); },
      tip: function () {
        if (!look.disabled) return look;
        const want = can && typeof can.sign === 'string' ? can.sign : null;
        return signs.filter(function (s) { return !s.disabled && (!want || s.dataset.s === want); })[0] || null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  T.tools.order = order;
  T.tools.pickall = pickall;
  T.tools.pvcmp = pvcmp;
})(window.T = window.T || {});

