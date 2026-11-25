/* 39-mat.js - the base-ten blocks on the mat: flat drawn blocks (inline SVG), like a good textbook picture.
   Jovan, 24 Nov 2026: the realistic 3D pictures were "not clear, confusing and not child friendly", so the blocks
   are now drawn in the Grade 4 illustrated style (clean outline, soft fill, one colour per place, as in 38-tools.css):
     thousand = a cube (front square with a 10 x 10 grid, top and side faces), hundred = a flat 10 x 10 grid square,
     ten = a strip of 10 squares, one = a single small square.
   Blocks of a kind sit side by side in rows (never stacked, never overlapping): thousands and hundreds in rows of 2,
   tens and ones in rows of 5, with a bigger gap after every 10, so a child can count them and see "10".
   The behaviour is the one ported from Maths v2 (legacy/maths-v2/src/mui_a.js: Mat); only the drawing changed.

   T.tools.mat(host, spec) -> { el, get(), set(v), on(event, fn), lock(), destroy(), ready(), brk(k), join(k),
                               allow(can), showCounts(), reveal(what), fit() }
     spec = { b: [th, h, t, o],      the blocks at the start (4 places)
              ctl: true,             + and - buttons under each place (build a number); max: most blocks in a place
              counts: true,          the number of blocks under each place ("2 thousands"); total: true, the total above
              can: { brk: ['h'], join: ['t'] }   the child may tap a block of these places to break it into 10,
                                     or tap "Join 10" under these places to join 10 into one bigger block
              multi: true,           more than one trade (else one trade, until allow() is called again)
              mini: true, fixed: true, u: 6      a small picture that cannot be changed (hints, answers, options);
                                     u: the biggest block unit in px (x 0.75); hmax: the tallest the blocks may be, in px
              room: () => px         the height the mat should fit in (a See it scene); else only the width counts
              cap }                  a caption under the mat (HTML)
     get() -> { b: [th, h, t, o], traded }   (b counts every block, in groups of 10 too)
     Events: 'change' (blocks added, taken away, or a trade starts or ends), 'trade' ({ act: 'brk' | 'join', k })
     ready() is false while blocks are moving.
     A fixed picture sizes each place to its blocks; a mat the child uses keeps the same place widths.
   T.tools.blocks(host, spec)   the same mat as a small fixed picture (hints, worked answers, answer options)
   Pictures for T.tools.pic: { k: 'legend' } the four blocks with their values;
     { k: 'swap', p: 'h', join } 1 hundred = 10 tens (join: 10 tens = 1 hundred). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  // still = reduced motion or the lowest effects tier (T.ui.reducedMotion): every block lands at once
  const still = function () {
    if (T.ui && T.ui.reducedMotion) return T.ui.reducedMotion();
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  };
  /* Phase 5 timings (ms), in step with the tokens of 00-tokens.css and .mat__pc in 39-mat.css (--mat-move):
     SPLIT the ten appear on the block that breaks; MOVE one block slides to its place (and snaps); STAG each of the
     ten starts a little after the one before, so they spread like a fan. A trade keeps the mat busy for at most
     SPLIT + MOVE + 9 STAG (about 0.8 s); the main button is never blocked. */
  const SPLIT = 220, MOVE = 460, STAG = 16;

  /* sizes in block units (u px each, set by fit()): w, h = the block's box; gap = between blocks in a row,
     vg = between rows; row = most blocks in a row. A cube: f = its front square, d = how deep it looks. */
  const GEO = {
    th: { w: 11.3, h: 11.3, f: 8.5, d: 2.8, gap: 1.2, vg: 1.1, row: 2 },
    h: { w: 8.5, h: 8.5, gap: 1.2, vg: 1.1, row: 2 },
    t: { w: 1.9, h: 8.5, gap: 0.8, vg: 1.1, row: 5 },
    o: { w: 1.9, h: 1.9, gap: 0.8, vg: 0.8, row: 5 }
  };
  const KS = ['th', 'h', 't', 'o'], PAD = 0.5, TOP = 0.9, TEN = 1.3;
  let PID = 0;

  /* ---------- the drawings (one SVG per block, cached as text) ---------- */

  const ART = {};
  function lines(n, x0, y0, dx, dy, lx, ly) {     // n - 1 grid lines: from (x0 + i dx, y0 + i dy), each (lx, ly) long
    let d = '';
    for (let i = 1; i < n; i++) d += 'M' + (x0 + i * dx).toFixed(1) + ' ' + (y0 + i * dy).toFixed(1) + 'l' + lx + ' ' + ly;
    return d;
  }
  const NS = ' vector-effect="non-scaling-stroke"';
  function art(k) {
    if (ART[k]) return ART[k];
    const g = GEO[k], W = g.w * 10, H = g.h * 10;
    let face = '', grid = '', line = '';
    if (k === 'th') {
      const F = g.f * 10, D = g.d * 10, c = F / 10;
      const top = '0,' + D + ' ' + D + ',0 ' + W + ',0 ' + F + ',' + D, side = F + ',' + D + ' ' + W + ',0 ' + W + ',' + F + ' ' + F + ',' + H;
      face = '<polygon class="b-t" points="' + top + '"/><polygon class="b-s" points="' + side + '"/><rect class="b-f" x="0" y="' + D + '" width="' + F + '" height="' + F + '"/>';
      grid = lines(10, 0, D, c, 0, 0, F) + lines(10, 0, D, 0, c, F, 0) + lines(10, 0, D, c, 0, D, -D) + lines(10, F, D, 0, c, D, -D);
      line = '<polygon class="b-o" points="' + top + '"/><polygon class="b-o" points="' + side + '"/><rect class="b-o" x="0" y="' + D + '" width="' + F + '" height="' + F + '"/>';
    } else {
      const r = k === 'o' ? 2 : 1.5;
      face = '<rect class="b-f" x="0" y="0" width="' + W + '" height="' + H + '" rx="' + r + '"/>';
      if (k === 'h') grid = lines(10, 0, 0, W / 10, 0, 0, H) + lines(10, 0, 0, 0, H / 10, W, 0);
      if (k === 't') grid = lines(10, 0, 0, 0, H / 10, W, 0);
      line = '<rect class="b-o" x="0" y="0" width="' + W + '" height="' + H + '" rx="' + r + '"/>';
    }
    ART[k] = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' + face +
      (grid ? '<path class="b-g" d="' + grid + '"' + NS + '/>' : '') + line.replace(/\/>/g, NS + '/>') + '</svg>';
    return ART[k];
  }

  // one drawn block: <i class="blk pc-k"> with its SVG; its size is --w and --h block units
  function block(k, tag, cls) {
    const e = el(tag || 'i', { class: ['blk', 'pc-' + k, cls] });
    e.innerHTML = art(k);
    e.style.setProperty('--w', GEO[k].w);
    e.style.setProperty('--h', GEO[k].h);
    return e;
  }

  // the width of a row of n blocks of kind k (at most row in a row)
  function rowW(k, n, row) { const g = GEO[k]; n = Math.min(n, row || g.row); return n > 0 ? n * g.w + (n - 1) * g.gap : 0; }

  // where the 10 smaller blocks sit when they make the bigger block at p (right after a break, or just before a join)
  function form(k, p, j) {
    const big = GEO[KS[KS.indexOf(k) - 1]], g = GEO[k];
    if (k === 'h') return { k: k, x: p.x + big.d * (9 - j) / 9, y: p.y + big.d * j / 9, zi: 900 + j };    // 10 flats make the cube
    if (k === 't') return { k: k, x: p.x + j * (big.w - g.w) / 9, y: p.y, zi: 900 + j };              // 10 strips make the flat
    return { k: k, x: p.x, y: p.y + j * (big.h - g.h) / 9, zi: 900 + j };                             // 10 ones make the strip
  }

  /* ---------- the mat ---------- */

  function mat(host, spec) {
    spec = spec || {};
    const MX = window.MX, P4 = MX.places(4), ev = T.tools.emitter();
    const start = (spec.b || []).slice(-4);
    while (start.length < 4) start.unshift(0);
    const st = { cols: start.map(function (n) { return { loose: fresh(n), groups: [] }; }) }, els = {};
    let locked = !!spec.fixed, traded = false, counts = !!spec.counts, can = spec.can || {}, busy = false, gone = false;
    let shown = null;                                   // the counts on screen (a count that changes ticks: Phase 5)
    let C = null;                                       // the columns: { w: [4 widths], x: [4 lefts], W: the mat's width }
    const R = { th: GEO.th.row, h: GEO.h.row, t: GEO.t.row, o: GEO.o.row };   // blocks in a row (a fixed picture may use 5)
    const timers = [];

    function fresh(n) { const ids = []; for (let j = 0; j < n; j++) ids.push(++PID); return ids; }
    function wait(fn, ms) {
      if (!ms) { fn(); return; }
      timers.push(setTimeout(function () { if (!gone) fn(); }, ms));
    }

    const heads = el('div', { class: 'mat__heads', 'aria-hidden': 'true' },
      P4.map(function (p) { return el('span', { class: ['mat__h', 'p-' + p.k] }, el('b', p.col), el('i', p.ab)); }));
    const bg = el('div', { class: 'mat__bg', 'aria-hidden': 'true' }, P4.map(function (p) { return el('i', { class: 'p-' + p.k }); }));
    const layer = el('div', { class: 'mat__layer', role: 'img' });
    const feet = P4.map(function (p, i) { return el('div', { class: ['mat__f', 'p-' + p.k], dataset: { i: i } }); });
    const felt = el('div', { class: 'mat__felt' }, bg, heads, layer, el('div', { class: 'mat__feet' }, feet));
    const totalEl = spec.total ? el('p', { class: 'mat__total', 'aria-live': 'polite' }) : null;
    const root = el('div', { class: ['mat', spec.mini && 'mat--mini', spec.ctl && 'mat--ctl', locked && 'is-locked'] }, totalEl, felt,
      spec.cap ? el('p', { class: 'mat__cap', html: spec.cap }) : null);

    // blocks still on their way count where they came from, so the counts and the total never show a wrong number
    // while blocks move: they change together when the blocks land (held = { i: place, n: blocks })
    let held = null;
    const count = function (i) { return st.cols[i].loose.length + 10 * st.cols[i].groups.length + (held && held.i === i ? held.n : 0); };
    const b = function () { return st.cols.map(function (c, i) { return count(i); }); };
    const get = function () { return { b: b(), traded: traded }; };

    // the width of each place: a mat the child uses keeps full rows; a fixed picture fits its blocks
    // (a fixed picture has no dotted boxes, so its places need less room around the blocks)
    function columns() {
      const cp = spec.fixed ? 0.6 : 1.2, minw = spec.fixed ? 4.4 : 4;
      const w = KS.map(function (k, i) {
        const n = spec.fixed ? (st.cols[i].groups.length ? R[k] : count(i)) : R[k];
        return Math.max(minw, rowW(k, n, R[k])) + 2 * cp;
      });
      const x = [];
      let c = PAD;
      w.forEach(function (v) { x.push(c); c += v; });
      C = { w: w, x: x, W: c + PAD };
      const cols = w.map(function (v) { return 'calc(' + v.toFixed(2) + ' * var(--u))'; }).join(' ');
      felt.style.setProperty('--cols', cols);
      felt.style.setProperty('--mw', C.W.toFixed(2));
    }

    // the place of every block: groups of 10 (in a dotted box) first, then the loose blocks, in rows
    function layout() {
      const pos = {}, boxes = [];
      let H = 0;
      st.cols.forEach(function (c, i) {
        const k = KS[i], g = GEO[k], row = R[k], full = rowW(k, row, row);
        const cw = c.groups.length ? full : rowW(k, c.loose.length, row);
        const x0 = C.x[i] + (C.w[i] - cw) / 2;
        let y = TOP + (c.groups.length ? 2.6 : 0), low = 0;              // room for the "10" on a dotted box
        const at = function (j) { return { x: x0 + (j % row) * (g.w + g.gap), y: Math.floor(j / row) * (g.h + g.vg) }; };
        c.groups.forEach(function (ids) {
          const top = y + 0.5;
          ids.forEach(function (id, j) { const a = at(j); pos[id] = { k: k, x: a.x, y: top + a.y }; });
          const gh = Math.ceil(10 / row) * (g.h + g.vg) - g.vg;
          boxes.push({ k: k, x: x0 - 0.5, y: top - 0.5, w: full + 1, h: gh + 1 });
          low = top + gh + 0.5;
          y = low + 1.2;
        });
        c.loose.forEach(function (id, j) {
          const a = at(j);
          pos[id] = { k: k, x: a.x, y: y + a.y + Math.floor(j / 10) * TEN };
          low = pos[id].y + g.h;
        });
        H = Math.max(H, low + 0.9);
      });
      return { pos: pos, boxes: boxes, H: Math.max(H, 4) };
    }

    function mk(id, k) {
      const e = block(k, 'i', 'mat__pc');
      e.dataset.k = k;
      e.dataset.id = id;
      layer.appendChild(e);
      els[id] = e;
      return e;
    }

    function put(e, p) {
      e.style.setProperty('--x', p.x.toFixed(3));
      e.style.setProperty('--y', p.y.toFixed(3));
      e.style.zIndex = String(p.zi != null ? p.zi : 10);
    }

    function drop(e, ms) { e.classList.add('is-gone'); wait(function () { if (e.parentNode) e.parentNode.removeChild(e); }, still() ? 0 : ms); }

    function place(first) {
      if (spec.fixed || !C) columns();
      const L = layout();
      Object.keys(L.pos).forEach(function (id) {
        let e = els[id];
        if (!e) { e = mk(id, L.pos[id].k); if (!first && !still()) e.classList.add('is-drop'); }
        put(e, L.pos[id]);
      });
      Object.keys(els).forEach(function (id) {
        const e = els[id];
        if (!L.pos[id] && !e._keep) { delete els[id]; drop(e, 260); }
      });
      T.util.$$('.mat__ten', layer).forEach(function (x) { x.parentNode.removeChild(x); });
      L.boxes.forEach(function (bx) {
        const d = el('i', { class: ['mat__ten', 'p-' + bx.k] }, el('b', '10'));
        d.style.cssText = '--x:' + bx.x.toFixed(2) + ';--y:' + bx.y.toFixed(2) + ';--w:' + bx.w.toFixed(2) + ';--h:' + bx.h.toFixed(2);
        layer.appendChild(d);
      });
      layer.style.setProperty('--hh', L.H.toFixed(2));
      paint();
      if (!first) fit();
    }

    // the buttons and counts under the mat, and which blocks can be tapped
    function paint() {
      const bb = b();
      layer.setAttribute('aria-label', 'Blocks: ' + MX.say(bb));
      feet.forEach(function (f, i) {
        const k = KS[i], p = P4[i], mx = k === 'th' ? Math.min(spec.max || 9, 4) : (spec.max || 9);
        T.ui.empty(f);
        if (spec.ctl && !locked) {
          f.appendChild(el('button', { type: 'button', class: 'mat__stp mat__stp--plus', dataset: { act: 'inc' }, 'aria-label': 'Add one ' + p.one,
            disabled: bb[i] >= mx || busy, onclick: function () { step(i, 1); } }, T.ui.icon('plus')));
        }
        if (counts || spec.ctl) {
          const cnt = el('b', { class: 'mat__cnt', 'aria-label': MX.cnt(bb[i], p) }, String(bb[i]));
          f.appendChild(el('span', { class: 'mat__n' }, cnt,
            el('span', { class: 'mat__cw', 'aria-hidden': 'true' }, bb[i] === 1 ? p.one : p.many)));
          if (shown && shown[i] !== bb[i] && !spec.mini && !still()) cnt.classList.add('is-tick');
        }
        if (spec.ctl && !locked) {
          f.appendChild(el('button', { type: 'button', class: 'mat__stp', dataset: { act: 'dec' }, 'aria-label': 'Take away one ' + p.one,
            disabled: !st.cols[i].loose.length || busy, onclick: function () { step(i, -1); } }, T.ui.icon('minus')));
        }
        const joinable = spec.multi ? st.cols[i].loose.length >= 10 || st.cols[i].groups.length > 0 : !traded;
        if (!locked && joinable && can.join && can.join.indexOf(k) >= 0) {
          f.appendChild(el('button', { type: 'button', class: 'mat__join', dataset: { act: 'join' }, disabled: busy,
            onclick: function () { join(k); } }, 'Join 10'));
        }
      });
      if (totalEl) {
        const was = totalEl.getAttribute('data-n'), now = String(MX.total(bb));
        T.ui.empty(totalEl); totalEl.appendChild(document.createTextNode('Total: '));
        const tb = totalEl.appendChild(el('b', MX.fmt(MX.total(bb))));
        if (was != null && was !== now && !still()) tb.classList.add('is-tick');
        totalEl.setAttribute('data-n', now);
      }
      shown = bb;
      T.util.$$('.mat__pc', layer).forEach(function (e) {
        const i = KS.indexOf(e.dataset.k);
        const on = !locked && (!traded || spec.multi) && !busy && !!can.brk && can.brk.indexOf(e.dataset.k) >= 0 && st.cols[i].loose.indexOf(+e.dataset.id) >= 0;
        e.classList.toggle('is-tap', on);
        if (on) {
          e.tabIndex = 0;
          e.setAttribute('role', 'button');
          e.setAttribute('aria-label', 'Break this ' + P4[i].one + ' into 10 ' + P4[i + 1].many);
        } else {
          e.removeAttribute('tabindex'); e.removeAttribute('role'); e.removeAttribute('aria-label');
        }
      });
      words();
    }

    // a count's word ("hundreds") shows only when it fits under its place; the number always shows
    function words() {
      T.util.$$('.mat__cw', felt).forEach(function (w) {
        w.hidden = false;
        const f = w.parentNode && w.parentNode.parentNode;
        if (f && f.clientWidth && w.scrollWidth > f.clientWidth + 1) w.hidden = true;
      });
    }

    function step(i, d) {
      if (locked || busy) return;
      const c = st.cols[i];
      if (d > 0) c.loose.push(++PID); else if (c.loose.length) c.loose.pop(); else return;
      sfx(d > 0 ? 'drop' : 'pop');
      place();
      const nb = feet[i].querySelector('[data-act="' + (d > 0 ? 'inc' : 'dec') + '"]');
      if (nb && !nb.disabled) nb.focus({ preventScroll: true });
      ev.emit('change', get());
    }

    // break one block into ten smaller ones: the ten appear on the block, then slide into a dotted box in the next place
    function brk(k, id) {
      const i = KS.indexOf(k), c = i >= 0 ? st.cols[i] : null;
      if (busy || locked || i < 0 || i > 2 || !c.loose.length) return false;
      if (id == null || c.loose.indexOf(id) < 0) id = c.loose[c.loose.length - 1];
      busy = true; traded = true;
      sfx('thud');
      const p = layout().pos[id], big = els[id], k2 = KS[i + 1], ids = [];
      c.loose.splice(c.loose.indexOf(id), 1);
      held = { i: i, n: 1 };
      for (let j = 0; j < 10; j++) {
        const nid = ++PID, e = mk(nid, k2);
        ids.push(nid);
        e._keep = true;
        if (!still()) e.classList.add('is-born');
        put(e, form(k2, p, j));
      }
      delete els[id];
      if (big) drop(big, 300);
      paint();
      ev.emit('change', get());
      const go = function () {
        held = null;
        st.cols[i + 1].groups.push(ids);
        ids.forEach(function (nid, j) { const e = els[nid]; e._keep = false; e.classList.remove('is-born'); e.style.transitionDelay = (still() ? 0 : j * STAG) + 'ms'; });
        place();
        sfx('whoosh');
        wait(function () {
          ids.forEach(function (nid) { if (els[nid]) els[nid].style.transitionDelay = ''; });
          sfx('tick');
          busy = false;
          paint();
          ev.emit('change', get());
          ev.emit('trade', { act: 'brk', k: k });
        }, still() ? 0 : MOVE + 9 * STAG + 20);
      };
      wait(go, still() ? 0 : SPLIT);
      return true;
    }

    // join ten into one bigger block: the ten slide together into the bigger block's place, then turn into it
    function join(k) {
      const i = KS.indexOf(k), c = i >= 0 ? st.cols[i] : null;
      if (busy || locked || i < 1) return false;
      const ids = c.groups.length ? c.groups.pop() : c.loose.length >= 10 ? c.loose.splice(0, 10) : null;
      if (!ids) return false;
      busy = true; traded = true;
      held = { i: i, n: 10 };
      sfx('whoosh');
      const nid = ++PID, up = st.cols[i - 1];
      up.loose.push(nid);
      const p = layout().pos[nid];
      up.loose.pop();
      ids.forEach(function (id, j) { const e = els[id]; e._keep = true; e.style.transitionDelay = (still() ? 0 : j * STAG) + 'ms'; put(e, form(k, p, j)); });
      place();
      ev.emit('change', get());
      const done = function () {
        held = null;
        ids.forEach(function (id) { const e = els[id]; delete els[id]; if (e) drop(e, 300); });
        up.loose.push(nid);
        place();
        const e = els[nid];
        e.classList.remove('is-drop');
        if (!still()) {
          e.classList.add('is-born', 'is-snap');                   // the new block arrives with a small snap
          wait(function () { e.classList.remove('is-born', 'is-snap'); }, 450);   // played once: never again
        }
        sfx('chime');
        wait(function () {
          busy = false;
          paint();
          ev.emit('change', get());
          ev.emit('trade', { act: 'join', k: k });
        }, still() ? 0 : 160);
      };
      wait(done, still() ? 0 : MOVE + 9 * STAG + 20);
      return true;
    }

    layer.addEventListener('click', function (e) {
      const pc = e.target.closest && e.target.closest('.mat__pc.is-tap');
      if (pc) brk(pc.dataset.k, +pc.dataset.id);
    });
    layer.addEventListener('keydown', function (e) {
      const t = e.target;
      if ((e.key === 'Enter' || e.key === ' ') && t.classList && t.classList.contains('is-tap')) { e.preventDefault(); brk(t.dataset.k, +t.dataset.id); }
    });

    /* the block unit u in px: as big as the mat's box allows. A small picture stays small and short (spec.u, spec.hmax:
       an answer card picture is at most about 110 px of blocks on a phone). With spec.room (a function -> px), the
       whole mat also fits in that height when it can (never smaller than u = 3.5). */
    function fit() {
      const w = root.clientWidth;
      if (!w || !C) return;
      const top = spec.mini ? (spec.u ? Math.min(6, spec.u * 0.75) : 5) : 10;
      const hmax = spec.mini ? spec.hmax || ((window.innerWidth || 0) >= 700 ? 150 : 108) : Infinity;
      const size = function (H) { return Math.min(top, w / C.W, hmax / H); };
      if (spec.fixed) {
        // a fixed picture: thousands and hundreds in rows of 2, or of 5 when that makes the blocks clearly bigger
        // (so the answer cards of one question look alike)
        let best = null;
        const was = R.th + ',' + R.h;
        [[2, 2], [2, 5], [5, 2], [5, 5]].forEach(function (c) {
          R.th = c[0]; R.h = c[1]; columns();
          const uu = size(layout().H);
          if (!best || uu > best.u * 1.1) best = { u: uu, c: c };        // rows of 2 unless 5 make them clearly bigger
        });
        R.th = best.c[0]; R.h = best.c[1];
        if (best.c.join(',') !== was) place(true); else columns();
      }
      const H = parseFloat(layer.style.getPropertyValue('--hh')) || 8;
      let u = Math.max(2, size(H));
      const room = spec.room ? spec.room() : 0;
      if (room > 0) {
        const now = parseFloat(root.style.getPropertyValue('--u')) || u;
        const rest = root.offsetHeight - layer.offsetHeight - 1.4 * now;      // labels, counts, buttons, total
        const byHeight = (room - rest) / (H + 1.4);
        if (byHeight < u) u = Math.max(3.5, byHeight);
      }
      const was = parseFloat(root.style.getPropertyValue('--u')) || 0;
      if (Math.abs(was - u) > 0.05) root.style.setProperty('--u', u.toFixed(2) + 'px');
      root.classList.toggle('is-narrow', u < 3.7);
      words();
    }
    let ro = null;
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(fit); ro.observe(root); } else wait(fit, 30);

    place(true);
    if (host) host.appendChild(root);
    fit();

    return {
      el: root,
      get: get,
      set: function (v) {
        const nb = Array.isArray(v) ? v : v && v.b;
        if (!Array.isArray(nb)) return;
        nb.slice(-4).forEach(function (n, i) {
          const c = st.cols[i];
          c.groups = [];
          while (c.loose.length < n) c.loose.push(++PID);
          while (c.loose.length > n) c.loose.pop();
        });
        place();
      },
      on: ev.on,
      ready: function () { return !busy; },
      brk: brk, join: join, fit: fit,
      lock: function () { locked = true; root.classList.add('is-locked'); paint(); },
      allow: function (c) { can = c || {}; traded = false; paint(); },
      showCounts: function () { counts = true; paint(); },
      reveal: function (what) { if (what === 'counts') { counts = true; paint(); } },
      destroy: function () {
        gone = true;
        timers.forEach(clearTimeout);
        if (ro) ro.disconnect();
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  /* ---------- small pictures with drawn blocks ---------- */

  // n blocks of kind k in rows of per (a "set": 10 strips side by side make a flat)
  function set(k, n, per) {
    const g = el('span', { class: 'bpic__set', style: '--per:' + per + ';--gap:' + (k === 'o' || k === 't' ? 0.6 : 0.9) });
    for (let j = 0; j < n; j++) g.appendChild(block(k, 'span'));
    return g;
  }

  // the four blocks and what each is worth
  function legend() {
    const MX = window.MX;
    const row = KS.map(function (k, i) {
      const p = MX.places(4)[i];
      return el('figure', { class: ['bpic__fig', 'p-' + p.k], style: '--i:' + i },
        el('span', { class: 'bpic__pic' }, block(k, 'span')),
        el('figcaption', { class: 'bpic__cap' }, el('b', MX.fmt(p.v)), el('span', p.one)));
    });
    return el('div', { class: 'bpic bpic--legend', role: 'img', 'aria-label': 'A cube is 1,000. A flat is 100. A strip is 10. A small square is 1.' }, row);
  }

  // 1 hundred = 10 tens (or, with join, 10 tens = 1 hundred)
  function swap(spec) {
    const MX = window.MX, P4 = MX.places(4), i = KS.indexOf(spec.p);
    if (i < 0 || i > 2) return null;
    const big = P4[i], small = P4[i + 1], k2 = KS[i + 1];
    const one = el('figure', { class: 'bpic__fig' }, block(spec.p, 'span'), el('figcaption', { class: ['bpic__tag', 'p-' + big.k] }, '1 ' + big.one));
    const tens = el('figure', { class: 'bpic__fig' }, set(k2, 10, k2 === 't' ? 10 : 5), el('figcaption', { class: ['bpic__tag', 'p-' + small.k] }, '10 ' + small.many));
    const eq = el('b', { class: 'bpic__eq' }, '=');
    const label = spec.join ? '10 ' + small.many + ' make 1 ' + big.one : '1 ' + big.one + ' is 10 ' + small.many;
    return el('div', { class: 'bpic bpic--swap', role: 'img', 'aria-label': label }, spec.join ? [tens, eq, one] : [one, eq, tens]);
  }

  T.tools = T.tools || {};
  T.tools.mat = mat;
  T.tools.blocks = function (host, spec) { return mat(host, Object.assign({ mini: true, fixed: true }, spec || {})); };
  T.tools.picKinds = T.tools.picKinds || {};
  T.tools.picKinds.legend = legend;
  T.tools.picKinds.swap = swap;
  T.tools.matGeo = { GEO: GEO, art: art };
})(window.T = window.T || {});

