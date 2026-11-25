/* 39-tools-times.js - the maths tools of Stop 5 (times tables, multiples and factors), flat on the light art plate
   (39-tools-times.css). Ported from Maths v2 (legacy/maths-v2/src/mui_c.js TOOLS.grid in array mode; mui_d.js
   TOOLS.rows, TOOLS.msq, PICS.rows, PICS.msq, PICS.frain, PICS.grp), drawn in the Grade 4 flat style, with the v2
   answers kept: get() returns what the models' check(r) reads, solve(task.right) shows the right state.

   Every tool: T.tools.<name>(host, spec) -> { el, get(), on('change' | 'trade', fn), lock(), destroy(), ready(), solve(right),
     tip(), allow(can) }. host may be null. allow(can) is used by See it (one step at a time); without it everything works.

   T.tools.array(host, spec)   an array of counters: "Rows" and "In each row", each with - and + (the model arr; the v2
       grid in array mode: T.tools.grid passes { mode: 'array' } here). spec = { rows, cols, max (10), turn (See it: a
       "Turn" button turns the array round), fixed, cap }. get() -> { rows, cols }; allow({ rows, cols, turn });
       trade { act: 'row' | 'col' | 'turn', rows, cols }
   T.tools.rows(host, spec)    n counters put in equal rows: "Fewer" and "More". Counters that do not fit are left over
       (gold, in a dashed box). spec = { n, rows, fixed, cap }. get() -> { rows, cols, left }; allow({ more, less });
       trade { act: 'rows', rows }
   T.tools.msq(host, spec)     the multiplication square, 1 to 10. Tap the box where a row and a column meet: the row
       and the column light up to it. spec = { fixed, row (a lit times table), hl (a lit product in that row),
       cross: [r, c] (a picture: the way along row r and down column c), rowTap (See it: the row numbers are buttons),
       task, room (See it: the height left; fit() keeps the square inside it) }. get() -> { r, c, p, row }; ready() once a box is tapped; reveal('cross') lights the row and the column
       of task.right (the hint); allow({ tap, row }); trade { act: 'tap', r, c, p } and { act: 'row', row }
   Pictures (T.tools.pic): { k: 'rows', n, rows, cap }, { k: 'msq', row, hl, cross, cap }, { k: 'frain', n, hide }
       (the factor pairs joined by arcs), { k: 'grp', nums, pair, show } (three numbers, the easy pair joined by an arc)
   Motion: transform and opacity only (counters slide to their places and pop in, the array turns round, a lit box
   pops); still = the final state at once (00-tokens.css). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const still = function () {
    try { if (T.fx && T.fx.still) return !!T.fx.still(); } catch (e) { /* fall through */ }
    return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion());
  };
  const mount = function (host, node) { if (host) host.appendChild(node); return node; };
  const may = function (can, k) { return !can || !!can[k]; };
  function tbtn(label, cls, data, iconStart, aria) {
    const b = el('button', { type: 'button', class: ['btn', 'tl__btn', cls], dataset: data || {} },
      iconStart ? T.ui.icon(iconStart) : null, label ? el('span', { class: 'btn__label' }, label) : null);
    if (aria) b.setAttribute('aria-label', aria);
    return b;
  }
  const rowsOf = function (r, c) { return r + (r === 1 ? ' row of ' : ' rows of ') + c; };

  /* ---------- an array of counters ---------- */

  const CELL = 30, GAP = 6;
  const at = function (i) { return GAP + i * (CELL + GAP); };

  function array(host, spec) {
    spec = spec || {};
    const fixed = !!spec.fixed, mx = spec.max || 10, ev = T.tools.emitter();
    let rows = Math.max(1, Math.min(mx, spec.rows || 1)), cols = Math.max(1, Math.min(mx, spec.cols || 1));
    let locked = fixed, can = spec.can || null, side = 0, turned = false;
    const svg = el('svg:svg', { class: 'ar__svg', 'aria-hidden': 'true', focusable: 'false' });
    const group = el('svg:g', { class: 'ar__g' });
    svg.appendChild(group);
    const felt = el('div', { class: 'ar__felt', role: 'img' }, svg);
    const root = el('div', { class: ['ar', fixed && 'ar--mini'] }, felt);
    const btn = {}, val = {};
    let info = null, turnBtn = null;
    if (!fixed) {
      const stepper = function (k, label, less, more) {
        btn[k + '-'] = tbtn('', 'ar__step', { a: k + '-' }, 'minus', less);
        btn[k + '+'] = tbtn('', 'ar__step', { a: k + '+' }, 'plus', more);
        val[k] = el('b', { class: 'ar__n', 'aria-hidden': 'true' });
        btn[k + '-'].addEventListener('click', function () { act(k + '-'); });
        btn[k + '+'].addEventListener('click', function () { act(k + '+'); });
        return el('div', { class: 'ar__st' }, el('span', { class: 'ar__lab' }, label), el('span', { class: 'ar__row' }, btn[k + '-'], val[k], btn[k + '+']));
      };
      info = el('b', { class: 'ar__info', 'aria-live': 'polite' });
      const ctl = el('div', { class: 'ar__ctl' }, stepper('r', 'Rows', 'One row less', 'One more row'), stepper('c', 'In each row', 'One less in each row', 'One more in each row'));
      if (spec.turn) {
        turnBtn = tbtn('Turn', 'ar__turn', { a: 'turn' }, 'flip');
        turnBtn.addEventListener('click', function () { act('turn'); });
        ctl.appendChild(turnBtn);
      }
      root.appendChild(info);
      root.appendChild(ctl);
    }
    if (spec.cap) root.appendChild(el('p', { class: 'ar__cap', html: spec.cap }));

    const dots = {};          // 'r-c' -> the counter's group (it slides to its place)
    function paint(fresh) {
      const m = Math.max(fixed ? 1 : 5, rows, cols);
      const s = m * CELL + (m + 1) * GAP;
      if (s !== side) { side = s; svg.setAttribute('viewBox', '0 0 ' + s + ' ' + s); }
      // the array in the middle of the felt
      const x0 = (s - (cols * CELL + (cols + 1) * GAP)) / 2, y0 = (s - (rows * CELL + (rows + 1) * GAP)) / 2;
      Object.keys(dots).forEach(function (key) {
        const rc = key.split('-').map(Number);
        if (rc[0] >= rows || rc[1] >= cols) { group.removeChild(dots[key]); delete dots[key]; }
      });
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const key = r + '-' + c;
        let d = dots[key];
        if (!d) {
          d = el('svg:g', { class: 'ar__c' }, el('svg:circle', { cx: CELL / 2, cy: CELL / 2, r: CELL / 2 - 1 }));
          if (fresh && !still()) { d.classList.add('is-new'); d.firstChild.style.animationDelay = ((r + c) % 6) * 30 + 'ms'; }
          group.appendChild(d);
          dots[key] = d;
        }
        d.style.transform = 'translate(' + (x0 + at(c)) + 'px, ' + (y0 + at(r)) + 'px)';   // a CSS transform: it slides
      }
      group.style.transformOrigin = (s / 2) + 'px ' + (s / 2) + 'px';
      const say = rowsOf(rows, cols);
      felt.setAttribute('aria-label', say + (rows * cols === 1 ? ' counter' : ' counters'));
      if (info) info.textContent = say;
      if (val.r) { val.r.textContent = rows; val.c.textContent = cols; }
      if (btn['r-']) {
        btn['r-'].disabled = locked || rows <= 1 || !may(can, 'rows');
        btn['r+'].disabled = locked || rows >= mx || !may(can, 'rows');
        btn['c-'].disabled = locked || cols <= 1 || !may(can, 'cols');
        btn['c+'].disabled = locked || cols >= mx || !may(can, 'cols');
      }
      if (turnBtn) turnBtn.disabled = locked || rows === cols || !may(can, 'turn');
    }
    function act(a) {
      if (locked) return false;
      if (a === 'turn') {
        if (!turnBtn || rows === cols || !may(can, 'turn')) return false;
        const r = rows; rows = cols; cols = r; turned = !turned;
        Object.keys(dots).forEach(function (key) { group.removeChild(dots[key]); delete dots[key]; });
        paint(false);
        if (!still()) { group.classList.remove('is-turn'); void svg.getBoundingClientRect(); group.classList.add('is-turn'); }
        sfx('slide');
      } else {
        const k = a[0], up = a[1] === '+';
        if (!may(can, k === 'r' ? 'rows' : 'cols')) return false;
        if (k === 'r') { if ((up && rows >= mx) || (!up && rows <= 1)) return false; rows += up ? 1 : -1; }
        else { if ((up && cols >= mx) || (!up && cols <= 1)) return false; cols += up ? 1 : -1; }
        sfx(up ? 'snap' : 'pop');
        paint(up);
      }
      ev.emit('change', get());
      ev.emit('trade', { act: a === 'turn' ? 'turn' : a[0] === 'r' ? 'row' : 'col', rows: rows, cols: cols });
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
      tip: function () {
        if (turnBtn && !turnBtn.disabled && can && can.turn) return turnBtn;
        return ['r+', 'c+', 'r-', 'c-'].map(function (k) { return btn[k]; }).filter(function (b) { return b && !b.disabled; })[0] || null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- counters in equal rows ---------- */

  function rowsTool(host, spec) {
    spec = spec || {};
    const n = spec.n || 12, fixed = !!spec.fixed, ev = T.tools.emitter();
    const minR = Math.ceil(n / 12), maxR = Math.min(n, 10), wide = Math.floor(n / minR);
    let rows = Math.max(minR, Math.min(maxR, spec.rows || 1)), locked = fixed, can = spec.can || null, shown = -1;
    const svg = el('svg:svg', { class: 'rw__svg', 'aria-hidden': 'true', focusable: 'false' });
    const left = el('div', { class: 'rw__left' });
    const felt = el('div', { class: 'rw__felt', role: 'img' }, svg, left);
    const root = el('div', { class: ['rw', fixed && 'rw--mini'] }, felt);
    let less = null, more = null, info = null;
    if (!fixed) {
      less = tbtn('Fewer', 'rw__btn', { a: 'less' }, 'minus', 'Fewer rows');
      more = tbtn('More', 'rw__btn rw__btn--more', { a: 'more' }, 'plus', 'More rows');
      info = el('b', { class: 'rw__info', 'aria-live': 'polite' });
      less.addEventListener('click', function () { step(-1); });
      more.addEventListener('click', function () { step(1); });
      root.appendChild(el('div', { class: 'rw__ctl' }, less, info, more));
    }
    if (spec.cap) root.appendChild(el('p', { class: 'ar__cap', html: spec.cap }));
    const dot = function (x, y, cls, i, fresh) {
      return '<circle class="' + cls + (fresh ? ' is-new' : '') + '" cx="' + (x + CELL / 2) + '" cy="' + (y + CELL / 2) + '" r="' + (CELL / 2 - 1) + '"' +
        (fresh ? ' style="animation-delay:' + Math.min(i, 14) * 25 + 'ms"' : '') + '/>';
    };
    function paint(fresh) {
      const cols = Math.floor(n / rows), lo = n - rows * cols, pop = fresh && !still() && rows !== shown;
      const W = wide * CELL + (wide + 1) * GAP, H = rows * CELL + (rows + 1) * GAP;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.style.setProperty('--rw-w', W);
      let s = '';
      const x0 = (W - (cols * CELL + (cols + 1) * GAP)) / 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += dot(x0 + at(c), at(r), 'rw__c', r * cols + c, pop);
      svg.innerHTML = s;
      T.ui.empty(left);
      left.hidden = !lo;
      if (lo) {
        const lw = lo * CELL + (lo + 1) * GAP;
        let ls = '';
        for (let i = 0; i < lo; i++) ls += dot(at(i), GAP, 'rw__c is-left', i, pop);
        const ln = el('span', { class: 'rw__lsvg', html: '<svg viewBox="0 0 ' + lw + ' ' + (CELL + 2 * GAP) + '" style="width:' + (lw * 0.05).toFixed(2) + 'rem" aria-hidden="true" focusable="false">' + ls + '</svg>' });
        left.appendChild(ln);
        left.appendChild(el('b', { class: 'rw__lt' }, lo + ' left over'));
      }
      const say = rowsOf(rows, cols) + (lo ? ', ' + lo + ' left over' : '');
      felt.setAttribute('aria-label', n + ' counters: ' + say);
      if (info) info.textContent = say;
      if (less) {
        less.disabled = locked || rows <= minR || !may(can, 'less');
        more.disabled = locked || rows >= maxR || !may(can, 'more');
      }
      shown = rows;
    }
    function step(k) {
      if (locked || !may(can, k > 0 ? 'more' : 'less')) return false;
      if ((k > 0 && rows >= maxR) || (k < 0 && rows <= minR)) return false;
      rows += k;
      sfx(k > 0 ? 'snap' : 'pop');
      paint(true);
      ev.emit('change', get());
      ev.emit('trade', { act: 'rows', rows: rows });
      return true;
    }
    function get() { return { rows: rows, cols: Math.floor(n / rows), left: n % rows }; }
    paint(false);
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, step: step,
      solve: function (r) { if (r && r.rows) { rows = r.rows; paint(true); } },
      ready: function () { return true; },
      lock: function () { locked = true; paint(false); },
      allow: function (c) { can = c || {}; locked = fixed; paint(false); },
      tip: function () { return more && !more.disabled ? more : less && !less.disabled ? less : null; },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the multiplication square ---------- */

  function msq(host, spec) {
    spec = spec || {};
    const fixed = !!spec.fixed, ev = T.tools.emitter(), task = spec.task || null;
    let pr = 0, pc = 0, row = spec.row || 0, locked = fixed, can = spec.can || null, rowTap = !!spec.rowTap && !fixed;
    const cross = spec.cross || null, shownH = {};
    const grid = el('div', { class: 'msq__g' });
    const cells = [], heads = [];
    grid.appendChild(el('i', { class: 'msq__x', 'aria-hidden': 'true' }, '×'));
    for (let c = 1; c <= 10; c++) { const h = el('b', { class: 'msq__h', dataset: { hc: String(c) } }, String(c)); heads.push(h); grid.appendChild(h); }
    for (let r = 1; r <= 10; r++) {
      const h = rowTap ? el('button', { type: 'button', class: 'msq__h msq__h--btn', dataset: { hr: String(r) }, 'aria-label': 'Light up the ' + r + ' times table' }, String(r))
        : el('b', { class: 'msq__h', dataset: { hr: String(r) } }, String(r));
      if (rowTap) h.addEventListener('click', function () { lightRow(r); });
      heads.push(h); grid.appendChild(h);
      for (let c = 1; c <= 10; c++) {
        const cell = fixed ? el('span', { class: 'msq__c', dataset: { r: String(r), c: String(c) } }, String(r * c))
          : el('button', { type: 'button', class: 'msq__c', dataset: { r: String(r), c: String(c) }, 'aria-label': 'row ' + r + ', column ' + c + ': ' + r * c }, String(r * c));
        if (!fixed) cell.addEventListener('click', function () { tapCell(r, c, cell); });
        cells.push(cell); grid.appendChild(cell);
      }
    }
    const root = el('div', { class: ['msq', fixed && 'msq--mini'] }, grid);
    if (spec.cap) root.appendChild(el('p', { class: 'ar__cap', html: spec.cap }));
    if (fixed) {
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', 'Multiplication square' + (row ? '. The ' + row + ' times table is lit' : '') +
        (cross ? '. Row ' + cross[0] + ' and column ' + cross[1] + ' meet at ' + cross[0] * cross[1] : ''));
    }
    function paint(popAt) {
      const a = cross ? cross[0] : pr, b = cross ? cross[1] : pc;
      cells.forEach(function (x) {
        const r = +x.dataset.r, c = +x.dataset.c;
        const on = r === a && c === b;
        x.classList.toggle('is-on', on);
        x.classList.toggle('is-band', !on && !!a && ((r === a && c < b) || (c === b && r < a)));
        x.classList.toggle('is-row', !!row && r === row);
        x.classList.toggle('is-hl', !!spec.hl && r === row && r * c === spec.hl);
        if (!fixed) x.disabled = locked || !may(can, 'tap');
        if (on && popAt && !still()) { x.classList.remove('is-pop'); void x.offsetWidth; x.classList.add('is-pop'); }
      });
      heads.forEach(function (h) {
        const hr = +h.dataset.hr || 0, hc = +h.dataset.hc || 0;
        h.classList.toggle('is-on', (!!hr && (hr === a || hr === row)) || (!!hc && hc === b));
        h.classList.toggle('is-show', !!shownH[hr ? 'r' + hr : 'c' + hc]);
        if (h.tagName === 'BUTTON') h.disabled = locked || !can || can.row == null || (can.row !== true && can.row !== hr);
      });
    }
    function tapCell(r, c) {
      if (locked || !may(can, 'tap')) return;
      pr = r; pc = c;
      sfx('pick');
      paint(true);
      ev.emit('change', get());
      ev.emit('trade', { act: 'tap', r: r, c: c, p: r * c });
    }
    function lightRow(r) {
      if (locked || !can || can.row == null || (can.row !== true && can.row !== r)) return;
      row = r;
      sfx('chime');
      paint(false);
      ev.emit('change', get());
      ev.emit('trade', { act: 'row', row: r });
    }
    function get() { return { r: pr, c: pc, p: pr * pc, row: row }; }
    // See it gives the height left for the tool (spec.room): the square is as wide as it is tall, so it fits that height
    function fit() {
      if (!spec.room) return;
      const h = spec.room() - (root.offsetHeight - grid.offsetHeight) - 4;
      if (h > 0) grid.style.width = 'min(100%, ' + Math.max(240, Math.floor(h)) + 'px)';
    }
    paint(false);
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, tapCell: tapCell, fit: fit,
      ready: function () { return pr > 0; },
      solve: function (right) { if (right && right.r) { pr = right.r; pc = right.c; paint(true); } },
      reveal: function () { const t = task && task.right; if (!t) return; shownH['r' + t.r] = true; shownH['c' + t.c] = true; paint(false); },
      lock: function () { locked = true; paint(false); },
      allow: function (c) { can = c || {}; locked = fixed; paint(false); },
      tip: function () {
        if (can && can.row != null && rowTap) return grid.querySelector('.msq__h--btn[data-hr="' + (can.row === true ? 5 : can.row) + '"]');
        if (locked) return null;
        return grid.querySelector('.msq__c[data-r="5"][data-c="5"]');
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- pictures ---------- */

  // the factor pairs of n joined by arcs (a rainbow); hide = the factors shown as "?"
  function frain(spec) {
    const n = spec.n, fs = [], hide = spec.hide || [];
    for (let a = 1; a <= n; a++) if (n % a === 0) fs.push(a);
    const cw = 58, W = fs.length * cw, base = 34 + Math.ceil(fs.length / 2) * 20, H = base + 48;
    let s = '';
    for (let i = 0; i < fs.length / 2; i++) {
      const j = fs.length - 1 - i;
      if (j <= i) break;                                   // a square number: its middle factor pairs with itself
      const x1 = i * cw + cw / 2, x2 = j * cw + cw / 2, top = base - 16 - (j - i) * 11 - 6;
      s += '<path class="fr__a fr__a--' + (i % 5) + '" d="M' + x1 + ' ' + (base - 4) + ' C' + x1 + ' ' + top + ' ' + x2 + ' ' + top + ' ' + x2 + ' ' + (base - 4) + '"/>';
    }
    fs.forEach(function (v, i) {
      const x = i * cw + cw / 2, q = hide.indexOf(v) >= 0;
      s += '<rect class="hp__b' + (q ? ' is-ask' : '') + '" x="' + (x - 23) + '" y="' + base + '" width="46" height="40" rx="20"/>' +
        '<text class="hp__t' + (q ? ' is-ask' : '') + '" x="' + x + '" y="' + (base + 28) + '">' + (q ? '?' : v) + '</text>';
    });
    const pairs = [];
    for (let i = 0; i < fs.length / 2; i++) { const j = fs.length - 1 - i; pairs.push(i === j ? fs[i] + ' × ' + fs[i] : fs[i] + ' × ' + fs[j]); }
    const say = 'The factor pairs of ' + n + ' joined by arcs: ' + pairs.join(', ') + (hide.length ? '. ' + (hide.length === 1 ? 'One factor is' : hide.length + ' factors are') + ' hidden' : '');
    const box = el('div', { class: 'hops frain' });
    box.innerHTML = '<svg class="hops__svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.round(W * 1.1) + 'px" role="img" aria-label="' + say + '">' + s + '</svg>';
    return box;
  }

  // three numbers to multiply, an arc joins the easy pair (and its product when show is set)
  function grp(spec) {
    const n = spec.nums, xs = [46, 150, 254], i = spec.pair[0], j = spec.pair[1], x1 = xs[i], x2 = xs[j], top = 62, peak = j - i === 2 ? 6 : 24;
    let s = n.map(function (v, k) {
      return '<text class="gp__n" x="' + xs[k] + '" y="96">' + v + '</text>' + (k < 2 ? '<text class="gp__x" x="' + (xs[k] + 52) + '" y="94">×</text>' : '');
    }).join('');
    s += '<path class="gp__a" d="M' + x1 + ' ' + top + ' Q' + (x1 + x2) / 2 + ' ' + (peak - 22) + ' ' + x2 + ' ' + top + '"/>';
    if (spec.show) s += '<rect class="gp__b" x="' + ((x1 + x2) / 2 - 28) + '" y="' + (peak - 4) + '" width="56" height="32" rx="9"/><text class="gp__l" x="' + (x1 + x2) / 2 + '" y="' + (peak + 19) + '">' + n[i] * n[j] + '</text>';
    const box = el('div', { class: 'hops grp' });
    box.innerHTML = '<svg class="hops__svg" viewBox="0 -14 300 122" style="max-width:320px" role="img" aria-label="' + n.join(' times ') + '. Multiply ' + n[i] + ' and ' + n[j] + ' first' +
      (spec.show ? ': that makes ' + n[i] * n[j] : '') + '.">' + s + '</svg>';
    return box;
  }

  T.tools.array = array;
  T.tools.rows = rowsTool;
  T.tools.msq = msq;
  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.rows = function (spec) { return rowsTool(null, Object.assign({}, spec, { fixed: true })).el; };
  kinds.msq = function (spec) { return msq(null, Object.assign({}, spec, { fixed: true })).el; };
  kinds.array = function (spec) { return array(null, Object.assign({}, spec, { fixed: true })).el; };
  kinds.frain = frain;
  kinds.grp = grp;
})(window.T = window.T || {});

