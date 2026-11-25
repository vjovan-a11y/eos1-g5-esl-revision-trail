/* 39-g5-tools-s9.js - Grade 5, Stop 9 (mode, median, mean and range): the data cards, the towers that are made
   level, and their small pictures. Flat, on the light art plate (39-g5-tools-s9.css). Class prefixes: dc, dt, dfq, s9.

   T.tools.dcards(host, spec)    number cards. The child taps them from smallest to largest; they go into a row in
                                 order. Then: Median (cross off both ends until the middle card or cards are left),
                                 Mode (equal cards make a pile; the tallest pile is the mode), Range (the first and
                                 the last card light up).
       spec = { nums: [6, 3, 8, 3, 5], views: ['median', 'mode', 'range'], sorted, show, cap, mini, fixed }
       views        the views the child may open; the first one opens when the last card is in order
       sorted       the cards are already in order (pictures); show: 'median' | 'mode' | 'range' the view of a picture
       get() -> { placed, sorted, view, left, crossed }    left: cards not crossed off in the Median view
       events: 'change'; 'trade' { act: 'place' } | { act: 'cross', left } | { act: 'view', view }
       See it: can: { place: true }, wait: 'place', until: { sorted: true }; can: { cross: true }, wait: 'cross',
       until: { left: 1 }; can: { view: 'mode' }, wait: 'view', until: { view: 'mode' }
       extras: allow(can), tip(), solve({ sorted: true, view: 'median' }), restart(), lock()
   T.tools.dtowers(host, spec)   one tower of blocks for each value. Tap a tower to lift its top block, tap another
                                 tower to put the block there. When all the towers are level, their height is the mean.
       spec = { nums: [2, 7, 4, 3], labels: ['Mon', ...], level, line, sum, cap, mini, fixed }
       level        a picture of the towers made level; line: a dashed line at the mean; sum: the "Total" line
       get() -> { level, moves, hand, each }               each: the height when level, else -1
       events: 'change'; 'trade' { act: 'pick' } | { act: 'move', moves, level }
       See it: can: { move: true }, wait: 'move', until: { level: true }
       extras: allow(can), tip(), solve({ level: true }), restart(), lock()
   Pictures (T.tools.pic): { k: 'dcards', nums, sorted, show, cap }, { k: 'dtowers', nums, level, line, cap },
   { k: 'dfreq', head: ['Shoe size', 'Frequency'], vals, freqs, hl } a frequency table (hl: the row to light up),
   { k: 'ddata', rows: [{ name, nums }] } the values of two data sets, one row each,
   { k: 'dsay', who, text } what a child wrote (for "spot the mistake"). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const still = function () { return !!((T.fx && T.fx.still && T.fx.still()) || (T.ui && T.ui.reducedMotion && T.ui.reducedMotion())); };
  const canDo = function (can, k) { return !can || !!can[k]; };
  const fmt = function (n) { return window.MX && window.MX.fmt ? window.MX.fmt(n) : String(n); };
  const VIEW = { median: 'Median', mode: 'Mode', range: 'Range' };
  function shake(node) { node.classList.remove('is-shake'); void node.offsetWidth; node.classList.add('is-shake'); }
  function toolBtn(label, icon, cls, onClick) {
    return el('button', { type: 'button', class: ['btn', 'tl__btn', cls], onclick: onClick }, icon ? T.ui.icon(icon) : null, el('span', { class: 'btn__label' }, label));
  }

  /* ---------- the data cards ---------- */

  function dcards(host, spec) {
    spec = spec || {};
    const nums = (spec.nums || []).slice(), n = nums.length, ev = T.tools.emitter(), fixed = !!spec.fixed;
    const sortedVals = nums.slice().sort(function (a, b) { return a - b; });
    const views = (spec.views || ['median', 'mode', 'range']).filter(function (k) { return VIEW[k]; });
    const maxCross = Math.floor((n - 1) / 2);
    const freq = {}; nums.forEach(function (v) { freq[v] = (freq[v] || 0) + 1; });
    const maxF = Math.max.apply(null, nums.map(function (v) { return freq[v]; }));
    const start = spec.sorted || spec.show ? n : 0;
    let placed = start, used = nums.map(function () { return start > 0; });
    let view = spec.show || '', crossed = spec.show === 'median' ? maxCross : 0, can = spec.can, locked = fixed, fresh = -1;

    const tray = el('div', { class: 'dc__tray', role: 'group', 'aria-label': 'The data. Tap the cards from smallest to largest.' });
    const row = el('div', { class: 'dc__row', role: 'group', 'aria-label': 'The cards in order' });
    const note = el('p', { class: 'dc__note', 'aria-live': 'polite' });
    const ctl = el('div', { class: 'dc__ctl' });
    const crossBtn = toolBtn('Cross off the ends', 'cross', 'dc__cross', cross);
    const viewBtns = {};
    views.forEach(function (k) { viewBtns[k] = toolBtn(VIEW[k], null, 'dc__view', function () { setView(k, true); }); viewBtns[k].setAttribute('aria-pressed', 'false'); });
    const root = el('div', { class: ['wb', 'wb--dcards', spec.mini && 'wb--mini', fixed && 'is-fixed'] });
    const showTray = !fixed || start === 0;
    const trayZone = el('div', { class: 'dc__zone' }, fixed ? null : el('p', { class: 'dc__lab' }, 'The data'), tray);
    if (showTray) root.appendChild(trayZone);
    if (!fixed || start > 0) root.appendChild(el('div', { class: 'dc__zone' }, fixed ? null : el('p', { class: 'dc__lab' }, 'In order: smallest to largest'), row));
    if (!fixed) { root.appendChild(note); root.appendChild(ctl); }
    if (fixed) { root.setAttribute('role', 'img'); root.setAttribute('aria-label', (start > 0 ? 'The data in order: ' : 'The data: ') + (start > 0 ? sortedVals : nums).join(', ') + '.'); }
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    const trayCards = nums.map(function (v, i) {
      const b = el(fixed ? 'span' : 'button', fixed ? { class: 'dc__card' } : { type: 'button', class: 'dc__card', 'aria-label': 'Card ' + fmt(v), onclick: function () { place(i); } }, fmt(v));
      tray.appendChild(b);
      return b;
    });
    const sorted = function () { return placed === n; };
    const left = function () { return n - 2 * crossed; };
    const canView = function (k) { return !can || can.view === true || can.view === k; };

    function card(v, cls) { return el('span', { class: ['dc__card', cls] }, fmt(v)); }

    function drawRow() {
      T.ui.empty(row);
      row.classList.toggle('dc__row--piles', view === 'mode' && sorted());
      if (view === 'mode' && sorted()) {
        // equal cards make a pile; the tallest pile (2 cards or more) is the mode
        const seen = {};
        sortedVals.forEach(function (v) {
          if (seen[v]) return; seen[v] = 1;
          const top = freq[v] === maxF && maxF > 1;
          const pile = el('div', { class: ['dc__pile', top && 'is-top'] });
          for (let i = 0; i < freq[v]; i++) pile.appendChild(card(v, top && 'is-hl'));
          pile.appendChild(el('span', { class: 'dc__f' }, '×' + freq[v]));
          row.appendChild(pile);
        });
        return;
      }
      for (let i = 0; i < n; i++) {
        if (i >= placed) { row.appendChild(el('span', { class: 'dc__slot', 'aria-hidden': 'true' })); continue; }
        let cls = '';
        if (view === 'median') cls = i < crossed || i >= n - crossed ? 'is-x' : left() <= 2 ? 'is-hl' : '';
        if (view === 'range') cls = i === 0 || i === n - 1 ? 'is-hl' : 'is-dim';
        const c = card(sortedVals[i], cls);
        if (i === fresh && !still()) c.classList.add('is-new');
        row.appendChild(c);
      }
    }

    function say() {
      if (!sorted()) return placed === 0 ? 'Tap the smallest card.' : 'Tap the smallest card that is left. ' + placed + ' of ' + n + ' in order.';
      if (view === 'median') {
        if (left() > 2) return 'Cross off the smallest and the largest card.';
        return left() === 1 ? 'One card is left in the middle. It is the median.' : 'Two cards are left in the middle. The median is halfway between them.';
      }
      if (view === 'mode') {
        const tops = Object.keys(freq).filter(function (v) { return freq[v] === maxF; }).length;
        return maxF === 1 ? 'Every pile has 1 card. There is no mode.' : tops > 1 ? tops + ' piles are the tallest. There are ' + tops + ' modes.' : 'The tallest pile shows the mode.';
      }
      if (view === 'range') return 'Range = largest − smallest. Look at the last card and the first card.';
      return 'The cards are in order.';
    }

    function draw() {
      trayCards.forEach(function (b, i) {
        b.classList.toggle('is-gone', used[i]);
        if (!fixed) { b.disabled = locked || used[i] || !canDo(can, 'place'); b.setAttribute('aria-hidden', used[i] ? 'true' : 'false'); }
      });
      drawRow();
      fresh = -1;
      if (fixed) return;
      trayZone.hidden = sorted();                      // every card is in the row: the empty tray goes away
      note.textContent = say();
      T.ui.empty(ctl);
      if (!sorted()) return;
      if (views.length > 1) views.forEach(function (k) {
        const b = viewBtns[k];
        b.classList.toggle('is-on', view === k);
        b.setAttribute('aria-pressed', view === k ? 'true' : 'false');
        b.disabled = locked || !canView(k);
        ctl.appendChild(b);
      });
      if (view === 'median' && maxCross > 0) {
        crossBtn.disabled = locked || left() <= 2 || !canDo(can, 'cross');
        ctl.appendChild(crossBtn);
      }
    }

    function place(i) {
      if (locked || used[i] || !canDo(can, 'place')) return false;
      if (nums[i] !== sortedVals[placed]) {             // not the smallest card that is left
        sfx('no'); shake(trayCards[i]);
        note.textContent = fmt(nums[i]) + ' is not the smallest card that is left. Look again.';
        return false;
      }
      used[i] = true; fresh = placed; placed++;
      if (sorted()) { view = views[0] || ''; sfx('chime'); } else sfx('snap');
      draw();
      ev.emit('change', get());
      ev.emit('trade', { act: 'place', placed: placed });
      return true;
    }

    function cross() {
      if (locked || !sorted() || view !== 'median' || left() <= 2 || !canDo(can, 'cross')) return false;
      crossed++;
      sfx(left() <= 2 ? 'chime' : 'pop');
      draw();
      ev.emit('change', get());
      ev.emit('trade', { act: 'cross', left: left() });
      return true;
    }

    function setView(k, byChild) {
      if (locked || !sorted() || !VIEW[k] || (byChild && !canView(k))) return false;
      view = k; if (k !== 'median') crossed = 0;
      sfx('pick');
      draw();
      ev.emit('change', get());
      ev.emit('trade', { act: 'view', view: view });
      return true;
    }

    function get() { return { placed: placed, sorted: sorted(), view: view, left: left(), crossed: crossed }; }

    draw();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, place: place, cross: cross, view: setView,
      allow: function (c) { can = c || {}; locked = fixed; draw(); },
      restart: function () { placed = start; used = nums.map(function () { return start > 0; }); view = spec.show || ''; crossed = 0; draw(); },
      solve: function (right) {
        if (!right) return;
        if (right.sorted) { placed = n; used = nums.map(function () { return true; }); if (!view) view = views[0] || ''; }
        if (right.view && VIEW[right.view] && sorted()) view = right.view;
        crossed = view === 'median' && sorted() ? maxCross : 0;
        draw();
        ev.emit('change', get());
      },
      tip: function () {
        if (locked) return null;
        if (!sorted()) {
          if (!canDo(can, 'place')) return null;
          const i = nums.findIndex(function (v, j) { return !used[j] && v === sortedVals[placed]; });
          return trayCards[i] || null;
        }
        if (can && typeof can.view === 'string' && view !== can.view && viewBtns[can.view]) return viewBtns[can.view];
        if (view === 'median' && left() > 2 && canDo(can, 'cross')) return crossBtn;
        return null;
      },
      lock: function () { locked = true; root.classList.add('is-locked'); draw(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the towers: make them level to find the mean ---------- */

  function dtowers(host, spec) {
    spec = spec || {};
    const nums = (spec.nums || []).slice(), n = nums.length, ev = T.tools.emitter(), fixed = !!spec.fixed;
    const total = nums.reduce(function (s, x) { return s + x; }, 0), mean = total % n === 0 ? total / n : null;
    const labels = spec.labels || [];
    let h = spec.level && mean != null ? nums.map(function () { return mean; }) : nums.slice();
    const top = Math.max.apply(null, (fixed ? h : nums).concat([1]));           // the height of the field, in blocks
    let hand = -1, moves = 0, can = spec.can, locked = fixed, fresh = -1;

    const field = el('div', { class: 'dt__field', style: '--dt-top:' + top });
    const note = el('p', { class: 'dt__note', 'aria-live': 'polite' });
    const sum = el('p', { class: 'dt__sum' }, 'Total: ' + fmt(total) + (total === 1 ? ' block' : ' blocks') + ' in ' + n + ' towers');
    const root = el('div', { class: ['wb', 'wb--dtowers', spec.mini && 'wb--mini', fixed && 'is-fixed'] }, field);
    if (!fixed) { root.appendChild(note); root.appendChild(sum); } else if (spec.sum) root.appendChild(sum);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));
    const towers = nums.map(function (v, i) {
      const b = el(fixed ? 'div' : 'button', fixed ? { class: 'dt__tower' } : { type: 'button', class: 'dt__tower', onclick: function () { tap(i); } });
      field.appendChild(b);
      return b;
    });
    const line = el('span', { class: 'dt__line', 'aria-hidden': 'true' });
    field.appendChild(line);

    const level = function () { return h.every(function (x) { return x === h[0]; }); };

    function draw() {
      const lv = level();
      towers.forEach(function (b, i) {
        T.ui.empty(b);
        const stack = el('span', { class: 'dt__stack' });
        for (let k = 0; k < h[i]; k++) stack.appendChild(el('span', { class: ['dt__blk', hand === i && k === h[i] - 1 && 'is-lift', fresh === i && k === h[i] - 1 && !still() && 'is-new', lv && 'is-level'] }));
        b.appendChild(stack);
        b.appendChild(el('span', { class: 'dt__n' }, String(h[i])));
        if (labels[i]) b.appendChild(el('span', { class: 'dt__name' }, labels[i]));
        b.classList.toggle('is-hand', hand === i);
        if (!fixed) {
          b.disabled = locked || !canDo(can, 'move');
          b.setAttribute('aria-label', (labels[i] ? labels[i] + ': ' : 'Tower ' + (i + 1) + ': ') + h[i] + (h[i] === 1 ? ' block' : ' blocks') + (hand === i ? ', one block lifted' : ''));
        }
      });
      fresh = -1;
      // the dashed line: at the mean of a picture (spec.line), or where the towers are level
      const at = lv ? h[0] : spec.line ? total / n : null;
      line.hidden = at == null;
      if (at != null) line.style.bottom = 'calc(var(--dt-foot) + var(--dt-u) * ' + at + ')';
      if (fixed) {
        root.setAttribute('role', 'img');
        root.setAttribute('aria-label', 'Towers of blocks: ' + h.join(', ') + '.' + (lv ? ' All the towers are level.' : ''));
        return;
      }
      note.textContent = lv ? 'Level! Every tower has ' + h[0] + '.' : hand >= 0 ? 'Now tap a shorter tower to put the block there.' : 'Tap a tall tower to lift a block.';
      root.classList.toggle('is-level', lv);
    }

    function tap(i) {
      if (locked || !canDo(can, 'move')) return false;
      if (hand < 0) {
        if (h[i] === 0) { sfx('no'); shake(towers[i]); return false; }
        hand = i; sfx('pick'); draw();
        ev.emit('trade', { act: 'pick', i: i });
        return true;
      }
      if (hand === i) { hand = -1; sfx('pop'); draw(); return true; }                 // put it back
      if (h[i] >= top) { sfx('no'); shake(towers[i]); return false; }                  // the field is full here
      h[hand]--; h[i]++; hand = -1; moves++; fresh = i;
      sfx(level() ? 'chime' : 'snap');
      draw();
      ev.emit('change', get());
      ev.emit('trade', { act: 'move', moves: moves, level: level() });
      return true;
    }

    function get() { const lv = level(); return { level: lv, moves: moves, hand: hand >= 0, each: lv ? h[0] : -1 }; }

    draw();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, tap: tap,
      allow: function (c) { can = c || {}; locked = fixed; draw(); },
      restart: function () { h = nums.slice(); hand = -1; moves = 0; draw(); },
      solve: function (right) {
        if (!right || !right.level || mean == null) return;
        h = nums.map(function () { return mean; }); hand = -1;
        draw();
        ev.emit('change', get());
      },
      tip: function () {
        if (locked || !canDo(can, 'move') || level()) return null;
        if (hand < 0) return towers[h.indexOf(Math.max.apply(null, h))];
        let low = -1;
        h.forEach(function (x, i) { if (i !== hand && (low < 0 || x < h[low])) low = i; });
        return towers[low] || null;
      },
      lock: function () { locked = true; hand = -1; root.classList.add('is-locked'); draw(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.dcards = function (spec) { return dcards(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  kinds.dtowers = function (spec) { return dtowers(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  // a frequency table: one row for each value
  kinds.dfreq = function (spec) {
    const head = spec.head || ['Value', 'Frequency'], vals = spec.vals || [], fr = spec.freqs || [];
    const table = el('table', { class: 'dfq__t' },
      el('thead', null, el('tr', null, el('th', { scope: 'col' }, head[0]), el('th', { scope: 'col' }, head[1]))),
      el('tbody', null, vals.map(function (v, i) {
        return el('tr', { class: spec.hl === i ? 'is-hl' : null }, el('td', null, fmt(v)), el('td', null, fmt(fr[i])));
      })));
    const box = el('div', { class: 'wb wb--mini dfq' }, table);
    if (spec.cap) box.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));
    return box;
  };
  // two (or more) data sets, one row each: the name, then the values
  kinds.ddata = function (spec) {
    return el('div', { class: 'wb wb--mini dfq' }, el('table', { class: 'dfq__t dfq__t--rows' }, el('tbody', null, (spec.rows || []).map(function (r) {
      return el('tr', null, el('th', { scope: 'row' }, r.name), el('td', null, r.nums.map(fmt).join(', ')));
    }))));
  };
  // what a child wrote (spot the mistake)
  kinds.dsay = function (spec) {
    return el('div', { class: 's9-say' }, el('p', { class: 's9-say__who' }, (spec.who || '') + ' writes:'), el('p', { class: 's9-say__text' }, spec.text || ''));
  };

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    dcards: { en: 'Tap the cards from *smallest* to *largest*.', vi: 'Bấm các thẻ số từ *bé nhất* đến *lớn nhất*.' },
    dtowers: { en: 'Move blocks until all the towers are *level*.', vi: 'Chuyển các khối cho đến khi các tháp *cao bằng nhau*.' }
  });

  T.tools = Object.assign(T.tools || {}, { dcards: dcards, dtowers: dtowers });
})(window.T = window.T || {});

