/* 39-g5-tools-s8.js - Grade 5, Stop 8 (Circles: 6Gg.02, 6Gg.11): the circle pictures, the circle whose parts light up,
   and the compasses on a centimetre grid. Flat, on the light art plate (39-g5-tools-s8.css; every class starts c8).
   Lengths are whole centimetres and halves: the tools count in HALF centimetres (h = 7 is 3.5 cm), so nothing is
   ever a rounded decimal.

   T.tools.compass(host, spec)   the compasses on a centimetre grid: set the opening with − and + (0.5 cm steps, the
                                 ruler shows it), tap a marked point to put the compasses point there, tap "Draw"
       spec = { size: 10, pts: [['P', 5, 5], ['M', 3, 7]], h: 2, at: '', measure: false, fixed, can }
       size         the grid is size x size centimetres; pts: the marked points [letter, x, y] (cm from the top left)
       h            the opening at the start, in half centimetres (2 = 1 cm); the most is 10 (5 cm)
       measure      a "Measure across" button that shows the diameter of the drawn circle (See it)
       get() -> { h, r: '3.5', at: 'P', drawn, across }
       events: 'change' get(); 'trade' { act: 'set' | 'point' | 'draw' | 'across' }
       See it: allow({ set: true | 5 (the opening to reach), point: true | 'P', draw: true, across: true })
       extras: solve({ h, at }), tip(), restart(), lock()
   T.tools.cparts(host, spec)    one circle. Two ways to use it:
       explore  spec = { r: '5', unit: 'cm' }: four buttons (centre, radius, diameter, circumference); a tap lights
                the part up and says what it is. get() -> { part, seen }; 'trade' { act: 'show', part };
                allow({ show: true | 'radius' })
       pick     spec = { pick: true, lines: [{ t, a, tag }] }: lines with letters; the child taps a letter.
                get() -> { choice: 'B' }; 'trade' { act: 'pick' }; solve({ choice }), mark()
   Pictures (T.tools.pic):
     { k: 'circle', lines: [{ t: 'r' | 'd' | 'c' | 's', a: 30, lab: '4 cm', tag: 'A', hl: true }], dot: true | false | 'hl',
       dotLab: 'O', ring: 'hl', ringLab: '?', plain: true, sq: '10 cm', cap }
         t: r a radius, d a diameter, c a line across that misses the centre, s a line from the centre that stops short;
         a: the direction of the line from the centre, in degrees (0 = to the right, 90 = up);
         plain: every line in the same ink (the colour must not give the answer away); sq: a square round the circle
     { k: 'crow', n: 3, lab: '? cm', r: '2 cm', d: '', box: true, cap }   n equal circles that touch, in a row
     { k: 'cgrid', r: '2.5', size: 10, lab: true, cap }                   a circle drawn on the centimetre grid
     { k: 'cruler', r: '3.5', cap }                                       the compasses opened on a ruler */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const still = function () { return !!((T.fx && T.fx.still && T.fx.still()) || (T.ui && T.ui.reducedMotion && T.ui.reducedMotion())); };
  const canDo = function (can, k) { return !can || !!can[k]; };
  const f1 = function (x) { return Math.round(x * 10) / 10; };                 // a drawing coordinate (not a length of the maths)
  const rad = function (deg) { return deg * Math.PI / 180; };
  // half centimetres -> text: 7 -> '3.5', 6 -> '3'
  const cmText = function (h) { return (h % 2 ? (h - 1) / 2 + '.5' : String(h / 2)); };
  // '3.5' | 3.5 -> 7 half centimetres (NaN when it is not a whole number of halves)
  const halves = function (r) { const t = window.MX.D.p(r); return t % 500 === 0 ? t / 500 : NaN; };
  function text(x, y, s, cls, anchor) { return svg('text', { x: f1(x), y: f1(y), class: cls || 'c8-t', 'text-anchor': anchor || 'middle' }, [String(s)]); }
  // a letter in a small white tag that sits on a line
  function tag(x, y, s, on) {
    return svg('g', { class: 'c8-tag' + (on ? ' is-on' : '') }, [svg('circle', { cx: f1(x), cy: f1(y), r: 8.5 }), text(x, y + 4.2, s, 'c8-tag__t')]);
  }

  /* ---------- one circle with its parts (a picture) ---------- */

  const PART = { r: 'radius', d: 'diameter', c: 'a line across that misses the centre', s: 'a short line from the centre' };
  function describe(spec) {
    const bits = ['A circle'];
    if (spec.dot !== false) bits.push('its centre' + (spec.dotLab ? ' ' + spec.dotLab : ''));
    (spec.lines || []).forEach(function (ln) { bits.push((spec.plain ? 'line' : PART[ln.t]) + (ln.tag ? ' ' + ln.tag : '') + (ln.lab ? ' ' + ln.lab : '')); });
    if (spec.ring) bits.push('the line all the way round' + (spec.ringLab ? ' ' + spec.ringLab : ''));
    if (spec.sq) bits.push('inside a square' + (typeof spec.sq === 'string' ? ' of side ' + spec.sq : ''));
    return bits.join(', ') + '.';
  }

  function circleSvg(spec) {
    spec = spec || {};
    const W = 160, H = spec.sq ? 150 : 140, cx = 80, cy = spec.sq ? 66 : 70, R = spec.sq ? 46 : 48;
    const g = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'c8-svg', role: 'img', 'aria-label': spec.alt || describe(spec) });
    if (spec.sq) {
      g.appendChild(svg('rect', { x: cx - R, y: cy - R, width: 2 * R, height: 2 * R, class: 'c8-sq' }));
      if (typeof spec.sq === 'string') {
        g.appendChild(svg('path', { d: 'M' + (cx - R) + ' ' + (cy + R + 8) + 'h' + 2 * R + 'M' + (cx - R) + ' ' + (cy + R + 4) + 'v8M' + (cx + R) + ' ' + (cy + R + 4) + 'v8', class: 'c8-dim' }));
        g.appendChild(text(cx, cy + R + 23, spec.sq, 'c8-t'));
      }
    }
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: R, class: 'c8-disc' }));
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: R, class: 'c8-ring' + (spec.ring === 'hl' ? ' is-hl' : '') }));
    const labels = [];
    (spec.lines || []).forEach(function (ln) {
      const a = rad(ln.a || 0), ux = Math.cos(a), uy = -Math.sin(a), nx = -uy, ny = ux;          // u: along the direction, n: across it
      let x1, y1, x2, y2, lx, ly, tx, ty;
      if (ln.t === 'd') {
        x1 = cx - R * ux; y1 = cy - R * uy; x2 = cx + R * ux; y2 = cy + R * uy;
        lx = cx + .52 * R * ux; ly = cy + .52 * R * uy; tx = lx; ty = ly;
      } else if (ln.t === 'c') {
        const off = ln.off || .7, hw = Math.sqrt(1 - off * off) * R, mx = cx + off * R * ux, my = cy + off * R * uy;
        x1 = mx - hw * nx; y1 = my - hw * ny; x2 = mx + hw * nx; y2 = my + hw * ny;
        lx = mx; ly = my; tx = mx; ty = my;
      } else {
        const len = ln.t === 's' ? .6 * R : R;
        x1 = cx; y1 = cy; x2 = cx + len * ux; y2 = cy + len * uy;
        lx = cx + .55 * len * ux; ly = cy + .55 * len * uy; tx = lx; ty = ly;
        if (ln.t === 's') { tx = lx + nx * 11; ty = ly + ny * 11; }             // the short line stays in view: its letter sits beside it
      }
      const cls = 'c8-ln' + (spec.plain ? '' : ' c8-ln--' + ln.t) + (ln.hl ? ' is-hl' : '') + (ln.dim ? ' is-dim' : '') + (ln.dash ? ' is-dash' : '');
      g.appendChild(svg('line', { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), class: cls }));
      if (ln.t === 's') g.appendChild(svg('circle', { cx: f1(x2), cy: f1(y2), r: 2, class: 'c8-end' }));
      if (ln.tag) labels.push(tag(tx, ty, ln.tag, ln.hl));
      if (ln.lab) {
        // the length sits beside the line (above it when it can), far enough away for the words to clear the line
        const wide = String(ln.lab).length * 3.1, side = ln.side || (ny < -0.01 || (Math.abs(ny) <= 0.01 && nx > 0) ? 1 : -1);
        const gap = 6 + Math.abs(nx) * wide + Math.abs(ny) * 5;
        const back = 6 + Math.abs(ux) * wide + Math.abs(uy) * 5;                 // a line that misses the centre: its words sit on the centre side
        const ox = ln.t === 'c' ? -ux * back : nx * side * gap, oy = ln.t === 'c' ? -uy * back : ny * side * gap;
        labels.push(text(lx + ox, ly + oy + 4, ln.lab, 'c8-t c8-t--' + (spec.plain ? 'ink' : ln.t) + (ln.lab === '?' ? ' is-ask' : '')));
      }
    });
    if (spec.dot !== false) {
      if (spec.dot === 'hl') g.appendChild(svg('circle', { cx: cx, cy: cy, r: 8, class: 'c8-halo' }));
      g.appendChild(svg('circle', { cx: cx, cy: cy, r: spec.dot === 'hl' ? 4 : 2.8, class: 'c8-dot' + (spec.dot === 'hl' ? ' is-hl' : '') }));
      if (spec.dotLab) labels.push(text(cx - 9, cy + 15, spec.dotLab, 'c8-t' + (spec.dotLab === '?' ? ' c8-t--hl is-ask' : '')));
    }
    if (spec.ringLab) {
      // a label outside the circle: "?" at the top right with a short pointer; a word above the circle, in the middle
      if (spec.ringLab.length > 2) {
        g.appendChild(svg('line', { x1: cx, y1: cy - R - 2, x2: cx, y2: cy - R - 7, class: 'c8-lead' }));
        labels.push(text(cx, cy - R - 10, spec.ringLab, 'c8-t c8-t--ring'));
      } else {
        const a = rad(48), px = cx + R * Math.cos(a), py = cy - R * Math.sin(a);
        g.appendChild(svg('line', { x1: f1(px + 2), y1: f1(py - 2), x2: f1(px + 12), y2: f1(py - 11), class: 'c8-lead' }));
        labels.push(text(px + 17, py - 12, spec.ringLab, 'c8-t c8-t--ring' + (spec.ringLab === '?' ? ' is-ask' : '')));
      }
    }
    labels.forEach(function (n) { g.appendChild(n); });
    return g;
  }

  function figure(cls, node, spec) {
    const box = el('figure', { class: ['c8-fig', cls, spec && spec.big && 'c8-fig--big'] }, node);
    if (spec && spec.cap) box.appendChild(el('figcaption', { class: 'wb__cap', html: spec.cap }));
    return box;
  }

  /* ---------- n equal circles that touch, in a row (a picture) ---------- */

  function rowSvg(spec) {
    const n = Math.max(1, Math.min(6, spec.n || 3)), R = 20, x0 = 10, cy = spec.lab ? 46 : 28, W = n * 2 * R + 2 * x0, H = cy + R + (spec.r || spec.d ? 19 : spec.box ? 10 : 6);
    const g = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'c8-svg', role: 'img',
      'aria-label': spec.alt || (n + ' equal circles in a row. They touch.' + (spec.r ? ' The radius of one circle is ' + spec.r + '.' : '') + (spec.d ? ' The diameter of one circle is ' + spec.d + '.' : '') + (spec.lab ? ' The length of the row is ' + spec.lab + '.' : '')) });
    if (spec.box) g.appendChild(svg('rect', { x: x0, y: cy - R, width: n * 2 * R, height: 2 * R, class: 'c8-sq' }));
    for (let i = 0; i < n; i++) {
      const cx = x0 + R + i * 2 * R;
      g.appendChild(svg('circle', { cx: cx, cy: cy, r: R, class: 'c8-disc' }));
      g.appendChild(svg('circle', { cx: cx, cy: cy, r: R, class: 'c8-ring' }));
      g.appendChild(svg('circle', { cx: cx, cy: cy, r: 1.8, class: 'c8-dot' }));
    }
    const c0 = x0 + R;
    if (spec.r) {
      g.appendChild(svg('line', { x1: c0, y1: cy, x2: c0 + R, y2: cy, class: 'c8-ln c8-ln--r' }));
      g.appendChild(text(Math.max(c0, 21), cy + R + 14, spec.r, 'c8-t c8-t--r c8-t--sm' + (spec.r === '?' ? ' is-ask' : '')));
    }
    if (spec.d) {
      g.appendChild(svg('line', { x1: c0 - R, y1: cy, x2: c0 + R, y2: cy, class: 'c8-ln c8-ln--d' }));
      g.appendChild(text(Math.max(c0, 21), cy + R + 14, spec.d, 'c8-t c8-t--d c8-t--sm' + (spec.d === '?' ? ' is-ask' : '')));
    }
    if (spec.lab) {
      g.appendChild(svg('path', { d: 'M' + x0 + ' 18h' + n * 2 * R + 'M' + x0 + ' 13v10M' + (x0 + n * 2 * R) + ' 13v10', class: 'c8-dim' }));
      g.appendChild(text(W / 2, 11, spec.lab, 'c8-t c8-t--sm' + (/\?/.test(spec.lab) ? ' is-ask' : '')));
    }
    g.style.width = 'min(100%, ' + (n * 4 + 2) + 'rem)';
    return g;
  }

  /* ---------- the centimetre grid, with points and a circle ---------- */

  const U = 10, PADG = 4;                                                       // 10 units to one centimetre
  function gridSvg(o) {
    const N = o.size || 10, S = N * U;
    const g = svg('svg', { viewBox: -PADG + ' ' + -PADG + ' ' + (S + 2 * PADG) + ' ' + (S + 2 * PADG), class: 'c8-grid', role: 'img', 'aria-label': o.alt || 'A centimetre grid.' });
    g.appendChild(svg('rect', { x: 0, y: 0, width: S, height: S, class: 'c8-grid__bg' }));
    let d = '';
    for (let i = 1; i < N; i++) d += 'M' + i * U + ' 0v' + S + 'M0 ' + i * U + 'h' + S;
    g.appendChild(svg('path', { d: d, class: 'c8-grid__ln' }));
    g.appendChild(svg('rect', { x: 0, y: 0, width: S, height: S, class: 'c8-grid__frame' }));
    return g;
  }
  // the circle as 72 small arcs, so that the pencil can draw it with opacity alone
  function arcs(cx, cy, r, anim) {
    const g = svg('g', { class: 'c8-circ' }), n = 72;
    if (!anim) { g.appendChild(svg('circle', { cx: cx, cy: cy, r: r, class: 'c8-arc' })); return g; }
    for (let i = 0; i < n; i++) {
      const a0 = rad(i * 360 / n), a1 = rad((i + 1) * 360 / n + .6);
      const p = svg('path', { d: 'M' + f1(cx + r * Math.cos(a0)) + ' ' + f1(cy + r * Math.sin(a0)) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(cx + r * Math.cos(a1)) + ' ' + f1(cy + r * Math.sin(a1)), class: 'c8-arc is-new' });
      p.style.animationDelay = (i * 14) + 'ms';
      g.appendChild(p);
    }
    return g;
  }

  /* ---------- the compasses opened on a ruler ---------- */

  function rulerSvg(h, max) {
    max = max || 5;
    const x0 = 8, y0 = 30, L = 27, W = max * U + 2 * x0, half = h * U / 4, hy = y0 - Math.sqrt(L * L - half * half);
    const g = svg('svg', { viewBox: '0 0 ' + W + ' 46', class: 'c8-ruler', role: 'img', 'aria-label': 'The compasses are open ' + cmText(h) + ' cm on the ruler.' });
    g.appendChild(svg('rect', { x: 3, y: y0, width: W - 6, height: 14, rx: 1.5, class: 'c8-ruler__body' }));
    let d = '';
    for (let i = 0; i <= max * 2; i++) d += 'M' + (x0 + i * U / 2) + ' ' + y0 + 'v' + (i % 2 ? 2.6 : 4.4);
    g.appendChild(svg('path', { d: d, class: 'c8-ruler__tick' }));
    for (let i = 0; i <= max; i++) g.appendChild(text(x0 + i * U, y0 + 11.6, i, 'c8-ruler__n'));
    const xp = x0 + h * U / 2, xh = x0 + half;
    g.appendChild(svg('rect', { x: x0, y: y0, width: h * U / 2, height: 2.4, class: 'c8-ruler__span' }));
    g.appendChild(svg('path', { d: 'M' + x0 + ' ' + y0 + 'L' + f1(xh) + ' ' + f1(hy), class: 'c8-leg' }));
    g.appendChild(svg('path', { d: 'M' + f1(xp) + ' ' + y0 + 'L' + f1(xh) + ' ' + f1(hy), class: 'c8-leg c8-leg--pen' }));
    g.appendChild(svg('circle', { cx: f1(xh), cy: f1(hy), r: 2.4, class: 'c8-hinge' }));
    g.appendChild(svg('circle', { cx: x0, cy: y0, r: 1.3, class: 'c8-pin' }));
    g.appendChild(svg('circle', { cx: f1(xp), cy: y0, r: 1.5, class: 'c8-pen' }));
    return g;
  }

  /* ---------- the compasses on the grid (the tool) ---------- */

  const HMAX = 10;
  function compass(host, spec) {
    spec = spec || {};
    const N = spec.size || 10, S = N * U, ev = T.tools.emitter();
    const pts = (spec.pts && spec.pts.length ? spec.pts : [['P', N / 2, N / 2]]).map(function (p) { return { id: p[0], x: p[1], y: p[2] }; });
    const h0 = spec.h != null ? spec.h : 2;
    let h = h0, at = spec.at || '', drawn = !!spec.drawn, across = false, locked = !!spec.fixed, can = spec.can || null, touched = false;

    const board = el('div', { class: 'c8-board' });
    const g = gridSvg({ size: N, alt: 'A centimetre grid, ' + N + ' squares wide and ' + N + ' squares high.' });
    const layer = svg('g', {});
    g.appendChild(layer);
    pts.forEach(function (p) {
      g.appendChild(svg('circle', { cx: p.x * U, cy: p.y * U, r: 1.7, class: 'c8-pt__dot' }));
      g.appendChild(text(p.x * U - 7, p.y * U - 5.5, p.id, 'c8-pt__t'));
    });
    board.appendChild(g);
    const ptBtns = pts.map(function (p) {
      const b = el('button', { type: 'button', class: 'c8-pt', 'aria-label': 'Point ' + p.id + '. Put the compasses point here.', dataset: { id: p.id },
        style: 'left:' + ((PADG + p.x * U) / (S + 2 * PADG) * 100) + '%;top:' + ((PADG + p.y * U) / (S + 2 * PADG) * 100) + '%',
        onclick: function () { point(p.id); } });
      board.appendChild(b);
      return b;
    });

    const minus = el('button', { type: 'button', class: 'btn btn--quiet sl__b c8-b c8-b--sq', 'aria-label': 'Close the compasses by half a centimetre', onclick: function () { setBy(-1); } }, T.ui.icon('minus'));
    const plus = el('button', { type: 'button', class: 'btn btn--quiet sl__b c8-b c8-b--sq', 'aria-label': 'Open the compasses by half a centimetre', onclick: function () { setBy(1); } }, T.ui.icon('plus'));
    const rulerBox = el('div', { class: 'c8-rulerbox' });
    const now = el('p', { class: 'c8-now', 'aria-live': 'polite' });
    const drawBtn = el('button', { type: 'button', class: 'btn btn--quiet sl__b c8-b c8-b--draw', onclick: draw }, T.ui.icon('pencil'), el('span', 'Draw'));
    const acrossBtn = spec.measure ? el('button', { type: 'button', class: 'btn btn--quiet sl__b c8-b', onclick: measure }, el('span', 'Measure across')) : null;
    const say = el('p', { class: 'c8-say', 'aria-live': 'polite' });
    const setBox = el('div', { class: 'c8-setbox' }, el('div', { class: 'c8-set' }, minus, rulerBox, plus), now);
    const goBox = el('div', { class: 'c8-gobox' }, el('div', { class: 'c8-go' }, drawBtn, acrossBtn), say);
    // in the order of the work: the opening, the grid with the point, then Draw (side by side on a wide screen)
    const root = el('div', { class: ['wb', 'c8', 'c8-compass'] }, setBox, board, goBox);

    const ptOf = function (id) { return pts.filter(function (p) { return p.id === id; })[0] || null; };

    function paint(anim) {
      const p = ptOf(at), r = h * U / 2;
      T.ui.empty(layer);
      if (p) {
        const cx = p.x * U, cy = p.y * U, go = !!anim && !still();
        if (drawn) layer.appendChild(arcs(cx, cy, r, go));
        if (drawn && across) {
          layer.appendChild(svg('line', { x1: cx - r, y1: cy, x2: cx + r, y2: cy, class: 'c8-ln c8-ln--d' }));
          layer.appendChild(text(cx, cy + 9, cmText(h * 2) + ' cm', 'c8-grid__lab'));
        }
        // the compasses from above: the point on the centre, the pencil one opening away
        const arm = svg('g', { class: 'c8-arm' + (go ? ' is-turn' : '') }, [
          svg('line', { x1: cx, y1: cy, x2: cx + r, y2: cy, class: 'c8-arm__bar' + (drawn && across ? ' is-off' : '') }),
          svg('circle', { cx: cx + r, cy: cy, r: 2.3, class: 'c8-arm__pen' })]);
        arm.style.transformOrigin = cx + 'px ' + cy + 'px';
        layer.appendChild(arm);
        layer.appendChild(svg('circle', { cx: cx, cy: cy, r: 2.6, class: 'c8-arm__pin' }));
      }
      T.ui.empty(rulerBox); rulerBox.appendChild(rulerSvg(h, HMAX / 2));
      T.ui.empty(now); now.appendChild(el('span', 'Compasses: ')); now.appendChild(el('b', cmText(h) + ' cm'));
      say.textContent = !p ? 'Tap a point on the grid to put the compasses there.' : !drawn ? 'The point is on ' + at + '. Tap Draw.' : across ? 'Across the circle, through ' + at + ': ' + cmText(h * 2) + ' cm.' : 'A circle with centre ' + at + '.';
      const off = locked;
      minus.disabled = off || !canDo(can, 'set') || h <= 1;
      plus.disabled = off || !canDo(can, 'set') || h >= HMAX;
      ptBtns.forEach(function (b) {
        const okPt = canDo(can, 'point') && (!can || can.point === true || can.point === b.dataset.id);
        b.disabled = off || !okPt;
        b.classList.toggle('is-on', b.dataset.id === at);
      });
      drawBtn.disabled = off || !canDo(can, 'draw') || !p || drawn;
      if (acrossBtn) acrossBtn.disabled = off || !canDo(can, 'across') || !drawn || across;
    }
    function emit(act) { ev.emit('change', get()); ev.emit('trade', Object.assign({ act: act }, get())); }
    function get() { return { h: h, r: cmText(h), at: at, drawn: drawn, across: across }; }

    function setBy(d) {
      if (locked || !canDo(can, 'set')) return;
      const nh = h + d;
      if (nh < 1 || nh > HMAX) { sfx('no'); return; }
      h = nh; drawn = false; across = false; touched = true;
      sfx('tick'); paint(false); emit('set');
    }
    function point(id) {
      if (locked || !canDo(can, 'point') || !ptOf(id)) return;
      if (id === at && !drawn) { emit('point'); return; }
      at = id; drawn = false; across = false; touched = true;
      sfx('snap'); paint(false); emit('point');
    }
    function draw() {
      if (locked || !canDo(can, 'draw') || !ptOf(at) || drawn) return;
      drawn = true; touched = true;
      sfx('slide'); paint(true); emit('draw');
    }
    function measure() {
      if (locked || !canDo(can, 'across') || !drawn || across) return;
      across = true;
      sfx('snap'); paint(false); emit('across');
    }

    paint(false);
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, setBy: setBy, point: point, draw: draw,
      ready: function () { return drawn; },
      allow: function (c) { can = c || {}; locked = !!spec.fixed; paint(false); },
      restart: function () { h = h0; at = spec.at || ''; drawn = !!spec.drawn; across = false; paint(false); },
      solve: function (right) {
        if (!right) return;
        if (typeof right.h === 'number') h = right.h;
        if (right.at && ptOf(right.at)) at = right.at;
        drawn = true; across = false;
        paint(true); ev.emit('change', get());
      },
      mark: function () { board.classList.remove('is-shake'); void board.offsetWidth; board.classList.add('is-shake'); },
      // the control that moves the work on: the opening first, then the point, then Draw, then Measure across
      tip: function () {
        if (locked) return null;
        if (can) {
          const goal = typeof can.set === 'number' ? can.set : 0;
          if (can.set && h !== goal) { const b = goal && h > goal ? minus : plus; if (!b.disabled) return b; }
          if (can.point) { const b = ptBtns.filter(function (x) { return !x.disabled && x.dataset.id !== at; })[0]; if (b) return b; }
          if (can.draw && !drawBtn.disabled) return drawBtn;
          if (can.across && acrossBtn && !acrossBtn.disabled) return acrossBtn;
          return null;
        }
        if (!touched && !plus.disabled) return plus;
        if (!ptOf(at)) return ptBtns[0];
        return drawBtn.disabled ? null : drawBtn;
      },
      lock: function () { locked = true; root.classList.add('is-locked'); paint(false); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the circle whose parts light up, or whose lines are picked ---------- */

  const PARTS = [
    { k: 'centre', say: 'The centre is the point in the middle of the circle.' },
    { k: 'radius', say: 'A radius goes from the centre to the circumference.' },
    { k: 'diameter', say: 'A diameter goes across the circle, through the centre.' },
    { k: 'circumference', say: 'The circumference is the line all the way round.' }];

  function cparts(host, spec) {
    spec = spec || {};
    const ev = T.tools.emitter(), D = window.MX.D, unit = spec.unit || 'cm';
    const picking = !!spec.pick, lines = (spec.lines || []).map(function (x) { return Object.assign({}, x); });
    const rT = D.p(spec.r != null ? spec.r : '5');
    const rLab = D.s(rT) + ' ' + unit, dLab = D.s(rT * 2) + ' ' + unit;
    let part = '', choice = '', locked = !!spec.fixed, can = spec.can || null;
    const seen = {};
    const pic = el('div', { class: 'c8-fig c8-fig--tool' });
    const say = el('p', { class: 'c8-say', 'aria-live': 'polite' });
    const chips = (picking ? lines.map(function (ln) { return { k: ln.tag, label: 'Line ' + ln.tag }; }) : PARTS.map(function (p) { return { k: p.k, label: p.k }; }))
      .map(function (c) {
        return el('button', { type: 'button', class: 'c8-chip', dataset: { k: c.k }, 'aria-pressed': 'false', onclick: function () { tap(c.k); } }, c.label);
      });
    const root = el('div', { class: ['wb', 'c8', 'c8-parts', picking && 'c8-parts--pick'] }, pic, el('div', { class: 'c8-chips', role: 'group', 'aria-label': picking ? 'The lines' : 'The parts of a circle' }, chips), picking ? null : say);

    function paint() {
      let fig;
      if (picking) fig = { plain: true, lines: lines.map(function (ln) { return Object.assign({}, ln, { hl: ln.tag === choice }); }) };
      else {
        fig = { dot: part === 'centre' ? 'hl' : true, dotLab: seen.centre ? 'centre' : '', ring: part === 'circumference' ? 'hl' : '', ringLab: part === 'circumference' ? 'circumference' : '',
          lines: [].concat(
            seen.diameter ? [{ t: 'd', a: 0, lab: part === 'diameter' ? dLab : '', hl: part === 'diameter', dim: part !== 'diameter' }] : [],
            seen.radius ? [{ t: 'r', a: 55, lab: part === 'radius' ? rLab : '', hl: part === 'radius', dim: part !== 'radius' }] : []) };
        if (part !== 'centre') fig.dotLab = '';
      }
      T.ui.empty(pic); pic.appendChild(circleSvg(fig));
      chips.forEach(function (b) {
        const k = b.dataset.k, on = picking ? k === choice : k === part;
        b.classList.toggle('is-on', on); b.classList.toggle('is-seen', !picking && !!seen[k]);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.disabled = locked || (picking ? !canDo(can, 'pick') : !(canDo(can, 'show') && (!can || can.show === true || can.show === k)));
      });
      if (!picking) {
        const p = PARTS.filter(function (x) { return x.k === part; })[0];
        say.textContent = p ? p.say + (part === 'radius' ? ' Here: ' + rLab + '.' : part === 'diameter' ? ' Here: ' + dLab + ', 2 radii.' : '') : 'Tap a word to see that part of the circle.';
      }
    }
    function get() { return picking ? { choice: choice } : { part: part, seen: Object.keys(seen).length }; }
    function tap(k) {
      if (locked) return;
      if (picking) {
        if (!canDo(can, 'pick')) return;
        choice = k; sfx('pick'); paint();
        ev.emit('change', get()); ev.emit('trade', { act: 'pick', choice: choice });
        return;
      }
      if (!(canDo(can, 'show') && (!can || can.show === true || can.show === k))) return;
      part = k; seen[k] = true; sfx('snap'); paint();
      ev.emit('change', get()); ev.emit('trade', { act: 'show', part: part });
    }

    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, tap: tap,
      ready: function () { return picking ? !!choice : true; },
      allow: function (c) { can = c || {}; locked = !!spec.fixed; paint(); },
      restart: function () { part = ''; choice = ''; Object.keys(seen).forEach(function (k) { delete seen[k]; }); paint(); },
      solve: function (right) { if (right && right.choice) { choice = right.choice; paint(); ev.emit('change', get()); } },
      mark: function () { pic.classList.remove('is-shake'); void pic.offsetWidth; pic.classList.add('is-shake'); },
      tip: function () {
        const open = chips.filter(function (b) { return !b.disabled; });
        return open.filter(function (b) { return picking ? true : !seen[b.dataset.k]; })[0] || (picking ? null : open[0]) || null;
      },
      lock: function () { locked = true; root.classList.add('is-locked'); paint(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.circle = function (spec) { return figure('c8-fig--circle', circleSvg(spec), spec); };
  kinds.crow = function (spec) { return figure('c8-fig--row', rowSvg(spec), spec); };
  kinds.cgrid = function (spec) {
    const N = spec.size || 10, h = halves(spec.r), c = N / 2 * U;
    if (isNaN(h)) return null;
    const g = gridSvg({ size: N, alt: spec.alt || ('A circle on a centimetre grid. Its radius is ' + cmText(h) + ' squares.') });
    g.appendChild(arcs(c, c, h * U / 2, false));
    if (spec.lab) {
      g.appendChild(svg('line', { x1: c, y1: c, x2: c + h * U / 2, y2: c, class: 'c8-ln c8-ln--r' }));
      g.appendChild(text(c + h * U / 4, c - 3.5, cmText(h) + ' cm', 'c8-grid__lab c8-t--r'));
    }
    if (spec.across) {
      g.appendChild(svg('line', { x1: c - h * U / 2, y1: c, x2: c + h * U / 2, y2: c, class: 'c8-ln c8-ln--d' }));
      g.appendChild(text(c, c + 9.5, cmText(h * 2) + ' cm', 'c8-grid__lab c8-t--d'));
    }
    g.appendChild(svg('circle', { cx: c, cy: c, r: 1.7, class: 'c8-pt__dot' }));
    return figure('c8-fig--grid', g, spec);
  };
  kinds.cruler = function (spec) {
    const h = halves(spec.r);
    if (isNaN(h) || h < 1 || h > HMAX) return null;
    return figure('c8-fig--ruler', rulerSvg(h, HMAX / 2), Object.assign({ cap: 'The compasses are open <b>' + cmText(h) + ' cm</b>.' }, spec));
  };

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    compass: { en: 'Set the compasses. Tap the point. Then tap *Draw*.', vi: 'Chỉnh com-pa. Bấm vào điểm. Rồi bấm *Draw* (Vẽ).' },
    cparts: { en: 'Look at the lines. Tap one letter.', vi: 'Em hãy nhìn các đoạn thẳng. Bấm vào một chữ cái.' }
  });

  T.tools = Object.assign(T.tools || {}, { compass: compass, cparts: cparts });
  T.tools.compass.halves = halves; T.tools.compass.cmText = cmText;
})(window.T = window.T || {});

