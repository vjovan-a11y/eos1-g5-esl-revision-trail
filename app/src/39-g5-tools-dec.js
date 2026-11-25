/* 39-g5-tools-dec.js - Grade 5, Stop 1 (decimal place value): the decimal place value chart, the decimal slider,
   the square that is cut into ten, and their small pictures. Flat, on the light art plate (39-g5-tools-dec.css).

   T.tools.dchart(host, spec)    the place value chart with a decimal point between the ones and the tenths
       spec = { n: '35.724', from: 't', to: 'ths', hl: 'hu', vals: true, cells: true, ask, cap, mini }
       from, to     the first and the last place shown ('h','t','o','te','hu','ths'); default: what n needs, at least O to th
       hl           the highlighted place; vals: a row with the value of each digit (0.7, 0.02)
       cells        one empty answer box per place (class 'blank', data-i): the number pad fills them
       get() -> {}; extras: setHl(k), reveal('hl:te') (the hint of a question)
   T.tools.dslider(host, spec)   the digits slide across the decimal point: x 10, x 100, x 1000 left; divide, right
       spec = { n: '3.75', shift: 0, fixed, zeros, cap, mini }    zeros: the place holder zeros are written in
       get() -> { shift, value: '37.5' }; events: 'change' {shift}, 'trade' {act: 'slide'} (See it: wait: 'slide',
       until: { shift: 1 }); extras: move(d), allow({ slide: true, dir: 'left' | 'right' }) (dir: the arrow tip() points at),
       restart(), tip()
   T.tools.dzoom(host, spec)     one whole square; "Cut into 10" makes tenths, then hundredths, then thousandths
       spec = { level: 0, max: 3 }; get() -> { level }; events: 'trade' {act: 'cut'}; extras: allow({ cut: true }), tip()
   Pictures (T.tools.pic): { k: 'dchart', ... }, { k: 'dslider', n, shift, ... }, { k: 'hgrid', shade: 37, cap } a
   hundred square with 37 squares shaded (also for percentages, Stop 6), { k: 'drule', op: 'x', by: 100 }. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const still = function () { return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion()); };
  // the columns of a chart with a narrow column for the decimal point after the ones place (index `ones`; -1: no point)
  function template(n, ones) {
    const cols = [];
    for (let i = 0; i < n; i++) { cols.push('minmax(0, 1fr)'); if (i === ones && i < n - 1) cols.push('var(--pt-w, .75rem)'); }
    return cols.join(' ');
  }

  /* ---------- the decimal place value chart ---------- */

  function dchart(host, spec) {
    spec = spec || {};
    const D = window.MX.D, PL = D.PL;
    const t = spec.n != null ? D.p(spec.n) : 0, a = Math.abs(t);
    let i0 = spec.from ? D.PLK[spec.from] : 2, i1 = spec.to ? D.PLK[spec.to] : 5;
    if (!spec.from) while (i0 > 0 && a >= PL[i0].v * 10) i0--;
    const ps = PL.slice(i0, i1 + 1), ev = T.tools.emitter();
    const onesAt = ps.findIndex(function (p) { return p.k === 'o'; }), firstAt = ps.findIndex(function (p) { return D.digit(t, p.k) > 0; });
    const lead = onesAt < 0 ? 0 : firstAt < 0 ? onesAt : Math.min(onesAt, firstAt);        // the ones place always shows
    const root = el('div', { class: ['wb', 'wb--dchart', spec.mini && 'wb--mini'] });
    let hl = spec.hl || '', n = -1;

    function draw() {
      const grid = el('div', { class: 'dpv', style: 'grid-template-columns:' + template(ps.length, onesAt) });
      const row = function (make, cls) {
        ps.forEach(function (p, i) {
          grid.appendChild(make(p, i));
          if (p.k === 'o' && i < ps.length - 1) grid.appendChild(el('div', { class: ['dpv__pt', cls], 'aria-hidden': cls === 'is-dot' ? null : 'true' }, cls === 'is-dot' ? '.' : ''));
        });
      };
      row(function (p) { return el('div', { class: ['pv__h', 'p-' + p.k, hl === p.k && 'is-hl'] }, el('b', p.col), el('i', p.ab)); }, 'is-head');
      n = -1;
      row(function (p, i) {
        if (spec.cells) { n++; return el('div', { class: 'pv__d' }, el('button', { type: 'button', class: 'blank blank--cell', dataset: { i: n } })); }
        return el('div', { class: ['pv__d', hl === p.k && 'is-hl'] },
          spec.ask ? el('span', { class: 'pv__dg is-ask' }, '?') : i >= lead ? el('span', { class: 'pv__dg' }, String(D.digit(t, p.k))) : null);
      }, 'is-dot');
      if (spec.vals) row(function (p, i) {
        const d = D.digit(t, p.k);
        return el('div', { class: ['pv__v', 'p-' + p.k, hl === p.k && 'is-hl'] }, i >= lead && (!hl || hl === p.k) ? D.val(d, p.k) : '');
      }, 'is-gap');
      T.ui.empty(root);
      root.appendChild(grid);
      if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));
    }

    draw();
    mount(host, root);
    return {
      el: root, on: ev.on,
      get: function () { return {}; },
      lock: function () { root.classList.add('is-locked'); },
      setHl: function (k) { hl = k || ''; if (!spec.cells) draw(); },
      reveal: function (rv) { if (String(rv).indexOf('hl:') === 0) { hl = String(rv).slice(3); if (!spec.cells) draw(); } },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the decimal slider ---------- */

  // the seven places of the slider, big to small; the decimal point sits after the ones (index 3)
  const SP = [
    { k: 'th', ab: 'Th', col: 'Thousands' }, { k: 'h', ab: 'H', col: 'Hundreds' }, { k: 't', ab: 'T', col: 'Tens' }, { k: 'o', ab: 'O', col: 'Ones' },
    { k: 'te', ab: 't', col: 'Tenths' }, { k: 'hu', ab: 'h', col: 'Hundredths' }, { k: 'ths', ab: 'th', col: 'Thousandths' }];
  const ONES = 3;

  // the digits of a number and the column of the first one: '3.75' -> { ds: ['3','7','5'], c0: 3 }
  function digitsOf(n) {
    const s = String(n).replace(/,/g, ''), parts = s.split('.');
    let whole = parts[0].replace(/^0+(?=\d)/, ''), frac = (parts[1] || '').replace(/0+$/, '');
    let ds = (whole + frac).split(''), c0 = ONES - (whole.length - 1);
    while (ds.length > 1 && ds[0] === '0') { ds.shift(); c0++; }                // 0.06: the tile is the 6 alone
    return { ds: ds, c0: c0 };
  }

  // the number the tiles show after a shift, as text
  function valueAt(n, shift) {
    const g = digitsOf(n), cells = SP.map(function () { return '0'; });
    g.ds.forEach(function (d, j) { const c = g.c0 + j - shift; if (c >= 0 && c < SP.length) cells[c] = d; });
    const whole = cells.slice(0, ONES + 1).join('').replace(/^0+(?=\d)/, ''), frac = cells.slice(ONES + 1).join('').replace(/0+$/, '');
    return whole + (frac ? '.' + frac : '');
  }

  function dslider(host, spec) {
    spec = spec || {};
    const g = digitsOf(spec.n), L = g.ds.length, cols = SP.length, ev = T.tools.emitter();
    const zeroN = L === 1 && g.ds[0] === '0';
    const maxL = g.c0, maxR = cols - (g.c0 + L);                 // how far the tiles can go and stay on the chart
    let shift = spec.shift || 0, locked = !!spec.fixed, can = spec.can ? !!spec.can.slide : true;
    let want = (spec.can && spec.can.dir) || '';
    const grid = el('div', { class: 'dpv dpv--slider', style: 'grid-template-columns:' + template(cols, ONES) });
    const colOf = function (i) { return String(i + (i > ONES ? 2 : 1)); };          // the grid column of place i (the point takes one)
    SP.forEach(function (p, i) {
      grid.appendChild(el('div', { class: ['pv__h', 'p-' + p.k], style: 'grid-row:1;grid-column:' + colOf(i) }, el('b', p.col), el('i', p.ab)));
    });
    const slots = SP.map(function (p, i) { return grid.appendChild(el('span', { class: 'dsl__slot', style: 'grid-row:2;grid-column:' + colOf(i) })); });
    grid.appendChild(el('span', { class: 'dsl__pt', style: 'grid-row:2;grid-column:' + (ONES + 2), 'aria-hidden': 'true' }, '.'));
    const tiles = g.ds.map(function (d) { return grid.appendChild(el('span', { class: 'dsl__tile', style: 'grid-row:2' }, d)); });
    const left = el('button', { type: 'button', class: 'btn btn--quiet sl__b dsl__b', onclick: function () { move(1); } }, T.ui.icon('back'), el('span', 'Move left'));
    const right = el('button', { type: 'button', class: 'btn btn--quiet sl__b dsl__b', onclick: function () { move(-1); } }, el('span', 'Move right'), T.ui.icon('next'));
    const ctl = spec.fixed ? null : el('div', { class: 'sl__ctl' }, left, right);
    const now = el('p', { class: 'dsl__now', 'aria-live': 'polite' });
    const root = el('div', { class: ['wb', 'wb--dslider', spec.mini && 'wb--mini'] }, grid, spec.fixed || spec.quiet ? null : now, ctl);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    // the tiles sit in the grid; when they change column they slide there (first, last, invert, play)
    function place(slide) {
      const first = g.c0 - shift, last = first + L - 1;
      const from = slide && !still() && grid.isConnected ? tiles.map(function (tile) { return tile.getBoundingClientRect().left; }) : null;
      tiles.forEach(function (tile, j) { tile.style.gridColumn = colOf(Math.max(0, Math.min(cols - 1, first + j))); });
      if (from) tiles.forEach(function (tile, j) {
        const dx = from[j] - tile.getBoundingClientRect().left;
        if (dx && tile.animate) tile.animate([{ transform: 'translateX(' + dx + 'px)' }, { transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.3, 1.12, .4, 1)' });
      });
      // a place holder zero: every empty place between the digits and the ones place (25 x 100 = 2500, 0.6 / 10 = 0.06)
      slots.forEach(function (sl, i) {
        const empty = !zeroN && ((i > last && i <= ONES) || (i < first && i >= ONES));
        sl.classList.toggle('is-zero', empty && !!spec.zeros);
        sl.classList.toggle('is-hole', empty && !spec.zeros);
        sl.textContent = empty && spec.zeros ? '0' : '';
      });
      const off = locked || !can;
      left.disabled = off; right.disabled = off;
      now.textContent = shift === 0 ? 'The digits are at the start.' : 'Moved ' + Math.abs(shift) + (Math.abs(shift) === 1 ? ' place' : ' places') + ' to the ' + (shift > 0 ? 'left' : 'right') + '.';
    }

    function move(d) {
      if (locked || !can) return false;
      const ns = shift + d;
      if (ns > maxL || ns < -maxR) {
        sfx('no');
        grid.classList.remove('is-shake'); void grid.offsetWidth; grid.classList.add('is-shake');
        return false;
      }
      shift = ns;
      sfx('slide');
      place(true);
      ev.emit('change', { shift: shift });
      ev.emit('trade', { act: 'slide', shift: shift });
      return true;
    }

    place();
    mount(host, root);
    return {
      el: root, on: ev.on, move: move,
      get: function () { return { shift: shift, value: valueAt(spec.n, shift) }; },
      set: function (v) { shift = v && typeof v.shift === 'number' ? v.shift : +v || 0; place(); },
      allow: function (c) { can = !!(c && c.slide); want = (c && c.dir) || ''; place(); },
      restart: function () { shift = spec.shift || 0; place(); },
      solve: function (right) { if (right && typeof right.shift === 'number') { shift = right.shift; place(true); } },
      tip: function () { const b = want === 'right' ? right : left; return b.disabled ? null : b; },      // the arrow of this step (allow({ slide, dir }))
      lock: function () { locked = true; place(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the hundred square (a picture): n of the 100 small squares are shaded, column by column ---------- */

  function hgridSvg(shade, o) {
    o = o || {};
    const u = 10, g = svg('svg', { viewBox: '-2 -2 104 104', class: 'hg__svg', role: 'img', 'aria-label': o.alt || (shade + ' of 100 squares are shaded') });
    for (let c = 0; c < 10; c++) for (let r = 0; r < 10; r++) {
      const i = c * 10 + r;
      g.appendChild(svg('rect', { x: c * u, y: r * u, width: u, height: u, class: 'hg__c' + (i < shade ? ' is-on' : '') + (o.mark != null && i === o.mark ? ' is-mark' : '') }));
    }
    if (o.cols) for (let c = 1; c < 10; c++) g.appendChild(svg('line', { x1: c * u, y1: 0, x2: c * u, y2: 100, class: 'hg__col' }));
    g.appendChild(svg('rect', { x: 0, y: 0, width: 100, height: 100, class: 'hg__frame' }));
    return g;
  }

  /* ---------- the square that is cut into ten (See it) ---------- */

  const ZL = [
    { name: '1 whole', val: '1', say: 'This square is 1 whole.' },
    { name: '1 tenth', val: '0.1', say: '10 equal strips. One strip is 1 tenth.' },
    { name: '1 hundredth', val: '0.01', say: '100 small squares. One square is 1 hundredth.' },
    { name: '1 thousandth', val: '0.001', say: '1,000 tiny parts. One part is 1 thousandth.' }];

  function dzoom(host, spec) {
    spec = spec || {};
    const ev = T.tools.emitter(), max = spec.max || 3;
    let level = spec.level || 0, can = spec.can ? !!spec.can.cut : true, locked = false;
    const pic = el('div', { class: 'dz__pic' });
    const label = el('p', { class: 'dz__label', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'btn dz__cut', onclick: cut }, T.ui.icon('plus'), el('span', 'Cut into 10'));
    const root = el('div', { class: ['wb', 'wb--dzoom'] }, pic, label, el('div', { class: 'sl__ctl' }, btn));

    function draw(fresh) {
      const g = svg('svg', { viewBox: '-3 -3 106 106', class: 'dz__svg' + (fresh && !still() ? ' is-new' : ''), role: 'img', 'aria-label': ZL[level].say });
      g.appendChild(svg('rect', { x: 0, y: 0, width: 100, height: 100, class: 'dz__whole' + (level === 0 ? ' is-on' : '') }));
      if (level >= 1) {
        g.appendChild(svg('rect', { x: 0, y: 0, width: 10, height: 100, class: 'dz__part' + (level === 1 ? ' is-on' : '') }));
        for (let c = 1; c < 10; c++) g.appendChild(svg('line', { x1: c * 10, y1: 0, x2: c * 10, y2: 100, class: 'dz__ln' }));
      }
      if (level >= 2) {
        for (let r = 1; r < 10; r++) g.appendChild(svg('line', { x1: 0, y1: r * 10, x2: 100, y2: r * 10, class: 'dz__ln dz__ln--thin' }));
        g.appendChild(svg('rect', { x: 0, y: 0, width: 10, height: 10, class: 'dz__part' + (level === 2 ? ' is-on' : '') }));
      }
      if (level >= 3) {
        // the first small square, drawn again much bigger beside it: ten tiny parts, one is coloured
        g.appendChild(svg('path', { d: 'M10 0 L46 34 M10 10 L46 84', class: 'dz__zoomln' }));
        g.appendChild(svg('rect', { x: 46, y: 34, width: 50, height: 50, class: 'dz__zoom' }));
        g.appendChild(svg('rect', { x: 46, y: 34, width: 5, height: 50, class: 'dz__part is-on' }));
        for (let c = 1; c < 10; c++) g.appendChild(svg('line', { x1: 46 + c * 5, y1: 34, x2: 46 + c * 5, y2: 84, class: 'dz__ln dz__ln--thin' }));
      }
      g.appendChild(svg('rect', { x: 0, y: 0, width: 100, height: 100, class: 'dz__frame' }));
      T.ui.empty(pic); pic.appendChild(g);
      T.ui.empty(label);
      label.appendChild(el('span', { class: 'dz__sw', 'aria-hidden': 'true' }));
      label.appendChild(el('b', ZL[level].name));
      label.appendChild(el('span', { class: 'dz__eq' }, '= ' + ZL[level].val));
      btn.disabled = locked || !can || level >= max;
      btn.hidden = level >= max && !can;
    }

    function cut() {
      if (locked || !can || level >= max) return;
      level++;
      sfx('snap');
      draw(true);
      ev.emit('change', { level: level });
      ev.emit('trade', { act: 'cut', level: level });
    }

    draw(false);
    mount(host, root);
    return {
      el: root, on: ev.on,
      get: function () { return { level: level }; },
      allow: function (c) { can = !!(c && c.cut); draw(false); },
      restart: function () { level = spec.level || 0; draw(false); },
      tip: function () { return btn.disabled ? null : btn; },
      lock: function () { locked = true; draw(false); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds;
  kinds.dchart = function (spec) { return dchart(null, Object.assign({ mini: true }, spec)).el; };
  kinds.dslider = function (spec) { return dslider(null, Object.assign({ mini: true, fixed: true, zeros: true }, spec)).el; };
  kinds.hgrid = function (spec) {
    const box = el('figure', { class: ['hg', spec.big && 'hg--big'] }, hgridSvg(spec.shade || 0, spec));
    if (spec.cap) box.appendChild(el('figcaption', { class: 'wb__cap', html: spec.cap }));
    return box;
  };
  kinds.drule = function (spec) {
    const n = spec.by === 10 ? 1 : spec.by === 100 ? 2 : 3, toLeft = spec.op === 'x';
    const arrows = el('span', { class: 'rule__arrows' });
    for (let i = 0; i < n; i++) arrows.appendChild(T.ui.icon(toLeft ? 'back' : 'next'));
    return el('div', { class: 'rule' }, el('b', { class: 'rule__op' }, (toLeft ? '×' : '÷') + ' ' + window.MX.fmt(spec.by)), arrows,
      el('span', n + (n === 1 ? ' place' : ' places') + ' to the ' + (toLeft ? 'left' : 'right')));
  };

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    dchart: { en: 'Look at the *decimal chart*.', vi: 'Em hãy nhìn *bảng giá trị số thập phân*.' },
    dslider: { en: 'Move the digits with the arrows.', vi: 'Di chuyển các chữ số bằng nút mũi tên.' }
  });

  T.tools = Object.assign(T.tools || {}, { dchart: dchart, dslider: dslider, dzoom: dzoom, hgridSvg: hgridSvg, svgEl: svg });
  T.tools.dslider.valueAt = valueAt;
})(window.T = window.T || {});

