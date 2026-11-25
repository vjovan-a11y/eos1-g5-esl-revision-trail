/* 39-g5-tools-s7.js - Grade 5, Stop 7 (quadrilaterals and rotational symmetry): the shape pictures, the turning
   tool, the dot grid and the shape picker. Flat, on the light art plate (39-g5-tools-s7.css). All the geometry
   (what fits, what is parallel, the name of a drawing) comes from MX.G7 in 08-g5-models-s7.js: nothing is typed here.

   Pictures (T.tools.pic):
     { k: 'shape', id: 'kite' | pts: [[x, y] ...], ticks, par, right, diag, sym, centre, grid, lens, cap, label }
         one shape with its marks: equal-side ticks, parallel arrows, right-angle squares, the diagonals, the lines
         of symmetry, the centre, a dot grid behind it, side lengths
     { k: 'shapes', list: [{ id, cap? } ...], marks: { ... }, letters: false }   a row of shapes, lettered A, B, C ...
     { k: 'shkey' }                              what the three marks mean
     { k: 'rot', id, turns? }                    the turning tool as a picture (all the turns shown)
   T.tools.rot(host, spec)      a shape turns over its dotted outline; the ticks count how many times it fits
       spec = { id, step?, turns?, tell?, fixed, mini }   step: 90 degrees (120 for a shape of order 3); tell: say "Order n"
       get() -> { turns, fits, full, order }; events 'change', 'trade' { act: 'turn' } (See it: wait 'turn',
       until { full: true }); extras: allow({ turn: true }), restart(), solve(), tip()
   T.tools.qgrid(host, spec)    a dot grid: tap dots to make the corners of a quadrilateral
       spec = { cols: 7, rows: 6, given: [[x, y] ...], goal: [[x, y] ...], info: true }   x across, y down, from 0
       get() -> { n, pts: '2,1;5,1', name, par, right, eq4 }; events 'change', 'trade' { act: 'dot' | 'clear' }
       (See it: wait 'dot', until { name: 'kite' }); extras: allow({ dot: true }), solve({ pts }), tip(), restart()
   T.tools.shpick(host, spec)   lettered shapes: tap every one that fits
       spec = { ids: [...], marks }; get() -> { sel: 'ACE' }; mark(['B']), solve({ sel }) */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const G = function () { return window.MX.G7; };
  const L6 = 'ABCDEF';
  const shapeArg = function (spec) { return spec.id ? spec.id : { pts: spec.pts, polys: spec.polys, say: spec.say }; };

  /* ---------- the pictures ---------- */

  function shapePic(spec) {
    const box = el('figure', { class: ['shp', spec.big && 'shp--big', spec.grid && 'shp--grid'] });
    if (spec.label) box.appendChild(el('b', { class: 'shp__let' }, spec.label));
    box.appendChild(el('span', { class: 'shp__pic', html: G().svg(shapeArg(spec), spec) }));
    if (spec.cap) box.appendChild(el('figcaption', { class: 'wb__cap', html: spec.cap }));
    return box;
  }
  function shapesPic(spec) {
    const row = el('div', { class: 'shps' });
    (spec.list || []).forEach(function (x, i) {
      row.appendChild(shapePic(Object.assign({}, spec.marks, x, { label: x.label || (spec.letters === false ? null : L6[i]) })));
    });
    return row;
  }
  function keyPic() {
    const row = function (svg, text) { return el('li', { class: 'shkey__row' }, el('span', { class: 'shkey__pic', html: svg }), el('span', text)); };
    const open = '<svg viewBox="0 0 44 26" class="shp__svg" aria-hidden="true">';
    return el('ul', { class: 'shkey', 'aria-label': 'What the marks mean' },
      row(open + '<path class="shp__ln" d="M4 13h36"/><path class="shp__tick" d="M22 7v12"/></svg>', 'The same ticks: equal sides'),
      row(open + '<path class="shp__ln" d="M4 13h36"/><path class="shp__par" d="M19 8l6 5l-6 5"/></svg>', 'The same arrows: parallel sides'),
      row(open + '<path class="shp__ln" d="M8 4v18h30"/><path class="shp__ra" d="M8 13h9v9"/></svg>', 'A small square: a right angle'));
  }

  /* ---------- the turning tool ---------- */

  function rot(host, spec) {
    spec = spec || {};
    const g = G(), s = shapeArg(spec), p = g.of(s), ev = T.tools.emitter();
    const step = spec.step || (p.rot === 3 ? 120 : 90), n = Math.round(360 / step);
    const fit = []; for (let k = 1; k <= n; k++) fit.push(g.fitsAfter(s, k * step));
    const start = spec.turns != null ? spec.turns : (spec.fixed ? n : 0);
    let turns = start, locked = !!spec.fixed, can = spec.can ? !!spec.can.turn : true;
    const spin = el('span', { class: 's7rot__spin', html: g.svg(s, { box: 'turn', dot: true, alt: 'The shape' }) });
    const stage = el('div', { class: 's7rot__stage' }, el('span', { class: 's7rot__ghost', html: g.svg(s, { box: 'turn', ghost: true, alt: 'The outline of the shape' }) }), spin);
    const chips = el('ol', { class: 's7rot__chips', 'aria-label': 'The turns' });
    const chip = fit.map(function (f, i) {
      return chips.appendChild(el('li', { class: 's7rot__chip' }, el('span', { class: 's7rot__deg' }, (i + 1) * step + '°'), el('span', { class: 's7rot__mk', 'aria-hidden': 'true' })));
    });
    const count = el('p', { class: 's7rot__count' });
    const now = el('p', { class: 's7rot__now', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'btn tl__btn s7rot__turn', onclick: function () { doTurn(); } }, T.ui.icon('replay'), el('span', { class: 'btn__label' }, 'Turn ' + step + '°'));
    const again = el('button', { type: 'button', class: 'btn btn--quiet sl__b s7rot__again', onclick: function () { if (locked || !can) return; turns = 0; sfx('pop'); paint(); ev.emit('change', get()); ev.emit('trade', { act: 'again' }); } }, el('span', 'Start again'));
    const root = el('div', { class: ['wb', 's7rot', spec.mini && 'wb--mini s7rot--mini'] }, stage,
      el('div', { class: 's7rot__panel' }, chips, spec.fixed ? null : count, spec.fixed ? null : now, spec.fixed ? null : el('div', { class: 'sl__ctl' }, btn, again),
        spec.cap ? el('p', { class: 'wb__cap', html: spec.cap }) : null));
    if (spec.fixed) { root.setAttribute('role', 'img'); root.setAttribute('aria-label', 'A ' + p.say + ' turned ' + n + ' times. It fits its outline ' + fit.filter(Boolean).length + (fit.filter(Boolean).length === 1 ? ' time.' : ' times.')); }

    const fits = function () { return fit.slice(0, turns).filter(Boolean).length; };
    function get() { return { turns: turns, fits: fits(), full: turns >= n, order: turns >= n ? fits() : 0 }; }
    function paint() {
      spin.style.transform = 'rotate(' + turns * step + 'deg)';
      chip.forEach(function (c, i) {
        const done = i < turns;
        c.classList.toggle('is-fit', done && fit[i]); c.classList.toggle('is-no', done && !fit[i]); c.classList.toggle('is-now', i === turns - 1);
        const mk = c.querySelector('.s7rot__mk'); T.ui.empty(mk);
        if (done) mk.appendChild(T.ui.icon(fit[i] ? 'check' : 'cross'));
      });
      const f = fits(), full = turns >= n;
      count.textContent = 'Fits: ' + f;
      now.textContent = turns === 0 ? 'Turn the shape. Does it fit its outline?'
        : full ? 'One full turn. It fits ' + f + (f === 1 ? ' time.' : ' times.') + (spec.tell ? ' Order ' + f + '.' : '')
          : 'After ' + turns * step + '°: ' + (fit[turns - 1] ? 'it fits!' : 'it does not fit.');
      btn.disabled = locked || !can || full;
      again.disabled = locked || !can || turns === 0;
    }
    function doTurn() {
      if (locked || !can || turns >= n) return false;
      turns++;
      sfx(fit[turns - 1] ? 'chime' : 'slide');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: 'turn', turns: turns });
      return true;
    }

    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, turn: doTurn,
      allow: function (c) { can = !!(c && c.turn); paint(); },
      restart: function () { turns = start; paint(); },
      solve: function () { turns = n; paint(); ev.emit('change', get()); },
      tip: function () { return btn.disabled ? null : btn; },
      lock: function () { locked = true; paint(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the dot grid ---------- */

  function qgrid(host, spec) {
    spec = spec || {};
    const g = G(), cols = spec.cols || 7, rows = spec.rows || 6, U = 40, ev = T.tools.emitter();
    const given = (spec.given || []).map(function (p) { return [p[0], p[1]]; }), max = 4 - given.length;
    const edges = given.slice(1).map(function (p, i) { return [given[i], p]; });
    const goal = (spec.goal || []).map(function (p) { return p[0] + ',' + p[1]; });
    let added = (spec.pts || []).map(function (p) { return [p[0], p[1]]; }), locked = !!spec.fixed, can = spec.can ? !!spec.can.dot : true;
    const key = function (p) { return p[0] + ',' + p[1]; };
    const isGiven = function (x, y) { return given.some(function (p) { return p[0] === x && p[1] === y; }); };
    const at = function (x, y) { return added.findIndex(function (p) { return p[0] === x && p[1] === y; }); };
    const C = function (p) { return ((p[0] + 0.5) * U) + ' ' + ((p[1] + 0.5) * U); };

    const svg = svgEl('svg', { viewBox: '0 0 ' + cols * U + ' ' + rows * U, class: 's7g__svg', 'aria-hidden': 'true' });
    const shapeL = svg.appendChild(svgEl('g', {})), dotL = svg.appendChild(svgEl('g', {}));
    const stage = el('div', { class: 's7g__stage', style: 'aspect-ratio:' + cols + '/' + rows + ';--s7g-cols:' + cols + ';--s7g-rows:' + rows });
    stage.appendChild(svg);
    const btns = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const b = el('button', { type: 'button', class: 's7g__dot', 'aria-pressed': 'false', 'aria-label': 'Dot: column ' + (x + 1) + ', row ' + (y + 1), dataset: { x: String(x), y: String(y) },
        style: 'left:' + (x / cols * 100) + '%;top:' + (y / rows * 100) + '%;width:' + (100 / cols) + '%;height:' + (100 / rows) + '%' });
      b.addEventListener('click', function () { tap(x, y); });
      btns.push(b); stage.appendChild(b);
    }
    const info = el('p', { class: 's7g__info', 'aria-live': 'polite' });
    const clear = el('button', { type: 'button', class: 'btn btn--quiet sl__b s7g__clear', onclick: function () { if (locked || !can || !added.length) return; added = []; sfx('pop'); draw(); ev.emit('change', get()); ev.emit('trade', { act: 'clear' }); } }, el('span', 'Clear'));
    const root = el('div', { class: ['wb', 's7g', spec.mini && 'wb--mini'] }, stage, spec.info ? info : null, spec.fixed ? null : el('div', { class: 'sl__ctl' }, clear));

    function shape() { const all = given.concat(added); return all.length === 4 ? g.order4(all, edges) : null; }
    function get() {
      const o = shape(), p = o ? g.quad(o) : null;
      return { n: given.length + added.length, pts: added.map(key).sort().join(';'), name: p ? p.name : '', par: p ? p.par : -1, right: p ? p.right : -1, eq4: p ? p.eqAll : false };
    }
    function draw() {
      while (shapeL.firstChild) shapeL.removeChild(shapeL.firstChild);
      while (dotL.firstChild) dotL.removeChild(dotL.firstChild);
      const all = given.concat(added), o = shape();
      if (o) shapeL.appendChild(svgEl('path', { class: 's7g__shape', d: 'M' + o.map(C).join('L') + 'Z' }));
      else if (all.length > 1) shapeL.appendChild(svgEl('path', { class: 's7g__line' + (all.length === 4 ? ' is-bad' : ''), d: 'M' + all.map(C).join('L') }));
      if (given.length > 1) shapeL.appendChild(svgEl('path', { class: 's7g__given', d: 'M' + given.map(C).join('L') }));
      btns.forEach(function (b) {
        const x = +b.dataset.x, y = +b.dataset.y, gv = isGiven(x, y), on = gv || at(x, y) >= 0, want = !on && goal.indexOf(x + ',' + y) >= 0 && can && !locked;
        const c = C([x, y]).split(' ');
        if (want) dotL.appendChild(svgEl('circle', { class: 's7g__ring', cx: c[0], cy: c[1], r: 11 }));
        dotL.appendChild(svgEl('circle', { class: 's7g__d' + (gv ? ' is-given' : on ? ' is-on' : ''), cx: c[0], cy: c[1], r: on ? 6.5 : 3.2 }));
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.disabled = locked || !can || gv;
      });
      clear.disabled = locked || !can || !added.length;
      if (spec.info) {
        const p = o ? g.quad(o) : null;
        T.ui.empty(info);
        if (p) { info.appendChild(el('b', MX.cap(p.name))); info.appendChild(el('span', ': ' + g.tell('par', p) + ', ' + g.tell('eq', p) + '.')); }
        else info.appendChild(el('span', all.length === 4 ? 'Three corners are in one line. Move one corner.' : 'Tap a dot to make a corner.'));
      }
    }
    function tap(x, y) {
      if (locked || !can || isGiven(x, y)) return;
      const i = at(x, y);
      if (i >= 0) { added.splice(i, 1); sfx('pop'); }
      else if (added.length >= max) { sfx('no'); stage.classList.remove('is-shake'); void stage.offsetWidth; stage.classList.add('is-shake'); return; }
      else { added.push([x, y]); sfx('snap'); }
      draw();
      ev.emit('change', get());
      ev.emit('trade', { act: 'dot', n: given.length + added.length });
    }
    const btnAt = function (k) { return btns.filter(function (b) { return b.dataset.x + ',' + b.dataset.y === k; })[0] || null; };

    draw();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, tap: tap,
      allow: function (c) { can = !!(c && c.dot); draw(); },
      restart: function () { added = []; draw(); },
      solve: function (right) {
        if (!right || right.pts == null) return;
        added = String(right.pts).split(';').filter(Boolean).map(function (s) { return s.split(',').map(Number); });
        draw(); ev.emit('change', get());
      },
      // the dot that moves the drawing forward: a wrong corner comes off first, then the next corner of the goal
      tip: function () {
        if (locked || !can) return null;
        if (goal.length) {
          const off = added.filter(function (p) { return goal.indexOf(key(p)) < 0; })[0];
          if (off) return btnAt(key(off));
          const next = goal.filter(function (k) { return !added.some(function (p) { return key(p) === k; }); })[0];
          return next ? btnAt(next) : null;
        }
        return added.length >= max ? null : btns.filter(function (b) { return !b.disabled && b.getAttribute('aria-pressed') !== 'true'; })[Math.floor(cols * rows / 2)] || null;
      },
      mark: function () { stage.classList.remove('is-shake'); void stage.offsetWidth; stage.classList.add('is-shake'); },
      lock: function () { locked = true; draw(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the shape picker: tap every shape that fits ---------- */

  function shpick(host, spec) {
    spec = spec || {};
    const ids = spec.ids || [], ev = T.tools.emitter(), on = {};
    let locked = !!spec.fixed, can = spec.can ? !!spec.can.pick : true, bad = [];
    const root = el('div', { class: 's7pk', role: 'group', 'aria-label': 'Shapes. Tap every shape that fits.' });
    const btns = ids.map(function (id, i) {
      const b = el('button', { type: 'button', class: 's7pk__b', 'aria-pressed': 'false', 'aria-label': 'Shape ' + L6[i] },
        el('b', { class: 'shp__let' }, L6[i]), el('span', { class: 'shp__pic', html: G().svg(id, spec.marks || {}) }),
        el('span', { class: 's7pk__mk', 'aria-hidden': 'true' }, T.ui.icon('check')));
      b.addEventListener('click', function () { toggle(i); });
      root.appendChild(b);
      return b;
    });
    const sel = function () { return ids.map(function (x, i) { return L6[i]; }).filter(function (x) { return on[x]; }).join(''); };
    function paint() {
      btns.forEach(function (b, i) {
        b.classList.toggle('is-on', !!on[L6[i]]); b.classList.toggle('is-bad', bad.indexOf(L6[i]) >= 0 && !!on[L6[i]]);
        b.setAttribute('aria-pressed', on[L6[i]] ? 'true' : 'false'); b.disabled = locked || !can;
      });
    }
    function toggle(i) {
      if (locked || !can) return;
      on[L6[i]] = !on[L6[i]]; bad = [];
      sfx(on[L6[i]] ? 'pick' : 'pop'); paint();
      ev.emit('change', { sel: sel() });
      ev.emit('trade', { act: 'pick', sel: sel() });
    }
    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, get: function () { return { sel: sel() }; },
      ready: function () { return sel().length > 0; },
      allow: function (c) { can = !!(c && c.pick); paint(); },
      mark: function (list) { bad = Array.isArray(list) ? list.slice() : []; paint(); },
      solve: function (r) { if (!r || r.sel == null) return; ids.forEach(function (x, i) { on[L6[i]] = String(r.sel).indexOf(L6[i]) >= 0; }); bad = []; paint(); ev.emit('change', { sel: sel() }); },
      tip: function () { return btns.filter(function (b) { return !b.disabled; })[0] || null; },
      lock: function () { locked = true; root.classList.add('is-locked'); paint(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.shape = shapePic;
  kinds.shapes = shapesPic;
  kinds.shkey = keyPic;
  kinds.rot = function (spec) { return rot(null, Object.assign({ mini: true, fixed: true }, spec)).el; };
  kinds.qgrid = function (spec) { return qgrid(null, Object.assign({ mini: true, fixed: true }, spec)).el; };

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    rot: { en: 'Tap *Turn*. Count how many times it fits.', vi: 'Bấm *Turn* (Xoay). Đếm số lần hình khớp.' },
    qgrid: { en: 'Tap the dots to make the corners.', vi: 'Chạm vào các chấm để tạo các đỉnh.' },
    shpick: { en: 'Tap every shape that fits.', vi: 'Chạm vào mọi hình phù hợp.' }
  });

  T.tools = Object.assign(T.tools || {}, { rot: rot, qgrid: qgrid, shpick: shpick });
})(window.T = window.T || {});

