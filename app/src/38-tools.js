/* 38-tools.js - the maths tools on the desk, and the small pictures of hints and worked answers.
   Ported from Maths v2 (legacy/maths-v2/src/mui_b.js: Chart, Slider, pic), drawn with the Grade 4 tokens.

   A tool: T.tools.<name>(host, spec) appends itself to host (host may be null) and returns
     { el, get(), set(v), on(event, fn), lock(), destroy() } plus its own extras.
   Events: 'change' (the child changed something).

   T.tools.chart(host, spec)    the place value chart
       spec = { k: 'chart' | 'counters' | 'cells', cols: 4 | 5, n, hl: 'h', dots, digitsRow, vals, ask, cap, max, mini }
       'chart'     shows n: one digit (and/or counters with dots) per place; hl = the highlighted place
       'counters'  the child draws counters with - and + under each place; get() -> { b: [th, h, t, o] }
       'cells'     one empty answer box per place (class 'blank', data-i = the place): the numpad fills them
       extras: setHl(k)
   T.tools.slider(host, spec)   the place value slider: the digits of n slide left (x 10, x 100) or right (/ 10, / 100)
       spec = { n, cols: 5, shift, fixed, zeros, mini }; get() -> { shift }; extras: move(d)
   T.tools.mat, T.tools.blocks   the base-ten blocks (flat drawn, SVG): see 39-mat.js
   T.tools.pic(spec) -> element | null   a small picture: { k: 'chart' | 'slider' | 'mat' | 'rule' | 'stack' | 'name' },
       'legend' and 'swap' (39-mat.js)
       or a list of them. A kind that is not known gives null (T.tools.picKinds[k](spec) adds more: 39-mat.js,
       39-tools-lines.js). T.tools.pics(host, {list}) is the tool that only shows pictures (39-tools-lines.js). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };

  // the tiny event helper every tool shares
  function emitter() {
    const fns = {};
    return {
      on: function (name, fn) { (fns[name] = fns[name] || []).push(fn); },
      emit: function (name, value) { (fns[name] || []).slice().forEach(function (fn) { fn(value); }); }
    };
  }

  function mount(host, node) { if (host) host.appendChild(node); return node; }

  function head(ps, hl) {
    return ps.map(function (p) {
      return el('div', { class: ['pv__h', 'p-' + p.k, hl === p.k && 'is-hl'] }, el('b', p.col), el('i', p.ab));
    });
  }

  // n counters; fresh: the last one has just been drawn (it pops in: Phase 5)
  function dots(n, k, fresh) {
    const box = el('span', { class: 'pv__dots' });
    for (let i = 0; i < n; i++) box.appendChild(el('i', { class: ['pv__dot', 'p-' + k, fresh && i === n - 1 && 'is-new'] }));
    return box;
  }

  /* ---------- the place value chart ---------- */

  function chart(host, spec) {
    spec = spec || {};
    const MX = window.MX;
    const cols = spec.cols || 4, ps = MX.places(cols), kind = spec.k || 'chart';
    const ds = spec.n != null ? MX.digits(spec.n, cols) : ps.map(function () { return 0; });
    const lead = spec.n ? ds.findIndex(function (x) { return x > 0; }) : cols - 1;
    const cnt = ps.map(function () { return 0; });
    const ev = emitter();
    const root = el('div', { class: ['wb', spec.mini && 'wb--mini', 'wb--' + kind] });
    let locked = false, hl = spec.hl || '', added = -1, ticked = -1;

    function draw() {
      const grid = el('div', { class: 'pv', style: '--cols:' + cols });
      head(ps, hl).forEach(function (h) { grid.appendChild(h); });
      if (kind === 'counters') {
        ps.forEach(function (p, i) { grid.appendChild(el('div', { class: ['pv__c', hl === p.k && 'is-hl'] }, dots(cnt[i], p.k, added === i))); });
        ps.forEach(function (p, i) {
          const cell = el('div', { class: 'pv__s' });
          if (locked) cell.appendChild(el('b', { class: 'pv__cnt' }, String(cnt[i])));
          else {
            cell.appendChild(el('button', { type: 'button', class: 'pv__step', 'aria-label': 'Rub out one ' + p.one + ' counter', disabled: !cnt[i],
              onclick: function () { step(i, -1); } }, T.ui.icon('minus')));
            cell.appendChild(el('b', { class: ['pv__cnt', ticked === i && 'is-tick'], 'aria-live': 'polite' }, String(cnt[i])));
            cell.appendChild(el('button', { type: 'button', class: 'pv__step', 'aria-label': 'Draw one ' + p.one + ' counter', disabled: cnt[i] >= (spec.max || 9),
              onclick: function () { step(i, 1); } }, T.ui.icon('plus')));
          }
          grid.appendChild(cell);
        });
      } else if (kind === 'cells') {
        ps.forEach(function (p, i) {
          grid.appendChild(el('div', { class: 'pv__d' }, el('button', { type: 'button', class: 'blank blank--cell', dataset: { i: i } })));
        });
      } else {
        if (spec.dots) ps.forEach(function (p, i) { grid.appendChild(el('div', { class: ['pv__c', hl === p.k && 'is-hl'] }, dots(ds[i], p.k))); });
        if (!spec.dots || spec.digitsRow) {
          ps.forEach(function (p, i) {
            grid.appendChild(el('div', { class: ['pv__d', hl === p.k && 'is-hl'] },
              spec.ask ? el('span', { class: 'pv__dg is-ask' }, '?') : i >= lead ? el('span', { class: 'pv__dg' }, String(ds[i])) : null));
          });
        }
        if (spec.vals) {
          ps.forEach(function (p, i) {
            grid.appendChild(el('div', { class: ['pv__v', 'p-' + p.k, hl === p.k && 'is-hl'] },
              i >= lead && (!hl || hl === p.k) ? MX.fmt(ds[i] * p.v) : ''));
          });
        }
      }
      T.ui.empty(root);
      root.appendChild(grid);
      if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));
    }

    function step(i, d) {
      if (locked) return;
      cnt[i] = Math.max(0, cnt[i] + d);
      sfx(d > 0 ? 'snap' : 'pop');
      const still = T.ui && T.ui.reducedMotion && T.ui.reducedMotion();
      added = d > 0 && !still ? i : -1;
      ticked = still ? -1 : i;
      draw();
      added = -1; ticked = -1;
      ev.emit('change', { b: cnt.slice() });
    }

    draw();
    mount(host, root);
    return {
      el: root,
      get: function () { return { b: cnt.slice() }; },
      set: function (v) { if (v && Array.isArray(v.b)) { v.b.forEach(function (x, i) { cnt[i] = x; }); draw(); } },
      on: ev.on,
      lock: function () { locked = true; root.classList.add('is-locked'); if (kind === 'counters') draw(); },
      setHl: function (k) { hl = k || ''; if (kind !== 'cells') draw(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the place value slider ---------- */

  function slider(host, spec) {
    spec = spec || {};
    const MX = window.MX;
    const cols = spec.cols || 5, ps = MX.places(cols), s0 = String(spec.n), L = s0.length;
    const tz = (s0.match(/0*$/) || [''])[0].length, maxL = cols - L, maxR = Math.min(tz, L - 1);
    const ev = emitter();
    let shift = spec.shift || 0, locked = !!spec.fixed;
    const grid = el('div', { class: 'pv', style: '--cols:' + cols });
    head(ps, '').forEach(function (h) { grid.appendChild(h); });
    const track = el('div', { class: 'sl__track', style: '--cols:' + cols });
    const slots = ps.map(function (p, i) { return track.appendChild(el('span', { class: 'sl__slot', style: '--c:' + i })); });
    const tiles = s0.split('').map(function (d) { return track.appendChild(el('span', { class: 'sl__tile' }, d)); });
    const left = el('button', { type: 'button', class: 'btn btn--quiet sl__b', onclick: function () { move(1); } }, T.ui.icon('back'), el('span', 'Move left'));
    const right = el('button', { type: 'button', class: 'btn btn--quiet sl__b', onclick: function () { move(-1); } }, el('span', 'Move right'), T.ui.icon('next'));
    const ctl = spec.fixed ? null : el('div', { class: 'sl__ctl' }, left, right);
    const root = el('div', { class: ['wb', 'wb--slider', spec.mini && 'wb--mini'] }, grid, track, ctl);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    function place() {
      tiles.forEach(function (t, j) {
        const c = cols - L + j - shift;
        t.style.setProperty('--c', String(c));
        t.classList.toggle('is-off', c >= cols || c < 0);
      });
      slots.forEach(function (sl, i) {
        const empty = shift > 0 && i >= cols - shift;
        sl.classList.toggle('is-zero', empty && !!spec.zeros);
        sl.classList.toggle('is-hole', empty && !spec.zeros);
        sl.textContent = empty && spec.zeros ? '0' : '';
      });
      left.disabled = locked; right.disabled = locked;
    }

    function move(d) {
      if (locked) return false;
      const ns = shift + d;
      if (ns > maxL || ns < -maxR) {
        sfx('no');
        track.classList.remove('is-shake'); void track.offsetWidth; track.classList.add('is-shake');
        return false;
      }
      shift = ns;
      sfx('slide');
      place();
      ev.emit('change', { shift: shift });
      return true;
    }

    place();
    mount(host, root);
    return {
      el: root,
      get: function () { return { shift: shift }; },
      set: function (v) { shift = v && typeof v.shift === 'number' ? v.shift : +v || 0; place(); },
      on: ev.on, move: move,
      lock: function () { locked = true; place(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the small pictures of hints and worked answers ---------- */

  const pics = {};           // more kinds of picture: T.tools.picKinds (39-mat.js, 39-tools-lines.js)

  function pic(spec) {
    if (!spec) return null;
    const MX = window.MX;
    if (Array.isArray(spec)) {
      const row = el('div', { class: 'pics' });
      spec.forEach(function (s) { const p = pic(s); if (p) row.appendChild(p); });
      return row.children.length ? row : null;
    }
    // Stop 9: results in the order they came ({k: 'strip', seq}) are not a fraction strip (39-tools-chance.js)
    if (spec.k === 'strip' && spec.seq && pics.seqstrip) return pics.seqstrip(spec);
    switch (spec.k) {
      case 'chart': return chart(null, Object.assign({ mini: true }, spec, { k: 'chart' })).el;
      case 'slider': return slider(null, Object.assign({ mini: true, fixed: true }, spec)).el;
      case 'mat': return T.tools.blocks ? T.tools.blocks(null, spec).el : null;   // the drawn blocks (39-mat.js)
      case 'rule': {
        const n = spec.by === 10 ? 1 : 2, toLeft = spec.op === 'x';
        const arrows = el('span', { class: 'rule__arrows' });
        for (let i = 0; i < n; i++) arrows.appendChild(T.ui.icon(toLeft ? 'back' : 'next'));
        return el('div', { class: 'rule' }, el('b', { class: 'rule__op' }, MX.SYM[spec.op] + ' ' + spec.by), arrows,
          el('span', (n === 1 ? '1 place' : '2 places') + ' to the ' + (toLeft ? 'left' : 'right')));
      }
      case 'stack': {
        const cols = spec.cols, ps = MX.places(cols);
        const grid = el('div', { class: 'stack', style: '--cols:' + cols });
        ps.forEach(function (p) { grid.appendChild(el('b', { class: 'p-' + p.k }, p.ab)); });
        spec.parts.forEach(function (v) {
          const d = MX.digits(v, cols), lead = d.findIndex(function (x) { return x > 0; });
          d.forEach(function (x, i) { grid.appendChild(el('span', i >= lead ? String(x) : '')); });
        });
        return grid;
      }
      case 'name': {
        const p = el('p', { class: 'namepic' });
        MX.nameParts(spec.n).forEach(function (x) {
          p.appendChild(document.createTextNode(x.j));
          p.appendChild(el('span', { class: 'namepic__part p-' + (x.p === 'to' ? 't' : x.p) }, x.t));
        });
        return p;
      }
      default: return pics[spec.k] ? pics[spec.k](spec) : null;
    }
  }

  T.tools = Object.assign(T.tools || {}, { chart: chart, slider: slider, pic: pic, picKinds: pics, emitter: emitter });
})(window.T = window.T || {});

