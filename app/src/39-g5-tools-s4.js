/* 39-g5-tools-s4.js - Grade 5, Stop 4 (common multiples and common factors): the two-list tool and its pictures.
   Flat, on the light art plate (39-g5-tools-s4.css). Every list is worked out here from the two numbers.

   T.tools.clist(host, spec)   two lists, one over the other: the multiples of a and of b, or the factors of a and
                               of b. The child taps the numbers that are in BOTH lists (the common ones).
       spec = { kind: 'mult' | 'fact', a, b, upto, names, shown, marked, hl, fixed, mini, cap, can }
       kind    'mult': the multiples of each number up to `upto` (default 6 x the number); 'fact': all its factors
       names   [text, text] the title of each list (default 'Multiples of 6' / 'Factors of 18')
       shown   [na, nb] how much of each list is open at the start. Then each list has its own button: "Next
               multiple of 6" opens one more number, "Next factor pair of 18" opens the next pair (1 and 18 ...)
       marked  'all' or '18,36': numbers marked at the start (pictures); hl: 'low' | 'high' the lowest / highest
               common number is filled in green and named under the lists (pictures)
       get() -> { marked: '18,36', count: 2, na, nb, done }   marked: the marked numbers, smallest first, as text;
               na, nb: how many numbers each list shows; done: every common number is marked and nothing else
       events  'change' get(); 'trade' { act: 'grow', row: 'a' | 'b' }, { act: 'mark', v }, { act: 'rub', v }
       See it  spec.can = {} makes it guided: only a number that is in both lists can be marked (others shake);
               allow({ growA: 3, growB: true, mark: true }): a list may grow to 3 numbers / to its end; marks are on
               steps: wait: 'grow', until: { na: 3 }; wait: 'mark', until: { count: 1 } or { done: true }
       extras  ready() one mark or more; mark() crosses the marked numbers that are not common; solve({ marked }),
               tip(), restart(), lock(), destroy()
   T.tools.cpick(host, spec)   numbers to ring (the Grade 3 pickall, 39-tools-order.js): spec = { nums };
                               get() -> { picks: [..] }. Here solve() also says 'change', so Check wakes up.
   Pictures (T.tools.pic): { k: 'clist', ... } the two lists, small and fixed;
       { k: 'venn', kind, a, b, upto, ask: 'mid', letters, cap } two rings: the numbers only in the first list, in
       both (where the rings cross) and only in the second list. ask: 'mid' shows "?" where the rings cross;
       letters: the four regions are named A, B, C and D (outside both rings) and hold no numbers. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const still = function () {
    try { if (T.fx && T.fx.still) return !!T.fx.still(); } catch (e) { /* fall through */ }
    return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion());
  };
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /* ---------- the numbers ---------- */

  function multiples(k, upto) { const out = []; for (let v = k; v <= upto; v += k) out.push(v); return out; }
  function factors(n) { const out = []; for (let v = 1; v <= n; v++) if (n % v === 0) out.push(v); return out; }
  const byValue = function (x, y) { return x - y; };

  // the two lists of a spec: the whole list, and the groups it opens in (one multiple, or one factor pair, at a time)
  function listsOf(spec) {
    const kind = spec.kind === 'fact' ? 'fact' : 'mult';
    return [spec.a, spec.b].map(function (n, i) {
      let full, groups;
      if (kind === 'mult') {
        full = multiples(n, spec.upto || n * 6);
        groups = full.map(function (v) { return [v]; });
      } else {
        full = factors(n); groups = [];
        for (let x = 1; x * x <= n; x++) if (n % x === 0) groups.push(x * x === n ? [x] : [x, n / x]);
      }
      const name = spec.names && spec.names[i] ? spec.names[i] : (kind === 'mult' ? 'Multiples of ' : 'Factors of ') + n;
      return { n: n, full: full, groups: groups, name: name };
    });
  }
  function commonOf(rows) { return rows[0].full.filter(function (v) { return rows[1].full.indexOf(v) >= 0; }); }

  /* ---------- the two lists ---------- */

  function clist(host, spec) {
    spec = spec || {};
    const kind = spec.kind === 'fact' ? 'fact' : 'mult', fixed = !!spec.fixed, guided = !!spec.can && !fixed;
    const ev = T.tools.emitter(), rows = listsOf(spec), common = commonOf(rows);
    const grows = Array.isArray(spec.shown) && !fixed;
    const startOpen = function (i) { return grows ? Math.max(0, Math.min(rows[i].groups.length, spec.shown[i])) : rows[i].groups.length; };
    const open = [startOpen(0), startOpen(1)];
    const keyV = spec.hl === 'low' ? common[0] : spec.hl === 'high' ? common[common.length - 1] : null;
    let marks = {}, bad = {}, fresh = {}, can = spec.can || {}, locked = fixed, solved = false;
    function startMarks() {
      marks = {};
      if (spec.marked === 'all') common.forEach(function (v) { marks[v] = true; });
      else if (spec.marked) String(spec.marked).split(',').forEach(function (v) { if (v !== '') marks[+v] = true; });
    }
    startMarks();

    const visible = function (i) { return [].concat.apply([], rows[i].groups.slice(0, open[i])).sort(byValue); };
    const inBoth = function (v) { return visible(0).indexOf(v) >= 0 && visible(1).indexOf(v) >= 0; };
    const marked = function () { return Object.keys(marks).filter(function (k) { return marks[k]; }).map(Number).sort(byValue); };

    const both = kind === 'mult' ? 'multiples' : 'factors';
    const root = el('div', { class: ['wb', 's4l', 's4l--' + kind, spec.mini && 'wb--mini', fixed && 's4l--fixed'] });
    const chipBox = [], more = [];
    rows.forEach(function (r, i) {
      const chips = el('div', { class: 's4l__chips' });
      chipBox.push(chips);
      const row = el('div', { class: ['s4l__row', 's4l__row--' + (i ? 'b' : 'a')] }, el('p', { class: 's4l__name' }, r.name), chips);
      if (grows) {
        const b = el('button', { type: 'button', class: 'btn tl__btn s4l__more', dataset: { row: i ? 'b' : 'a' } },
          T.ui.icon('plus'), el('span', { class: 'btn__label' }, (kind === 'mult' ? 'Next multiple of ' : 'Next factor pair of ') + r.n));
        b.addEventListener('click', function () { grow(i); });
        more.push(b);
        row.appendChild(b);
      }
      root.appendChild(row);
    });
    const foot = el('p', { class: 's4l__foot', 'aria-live': fixed ? null : 'polite' });
    root.appendChild(foot);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    function canGrow(i) {
      if (locked || !grows || open[i] >= rows[i].groups.length) return false;
      if (!guided) return true;
      const c = can[i ? 'growB' : 'growA'];
      return c === true || (typeof c === 'number' && visible(i).length < c);
    }

    function paint() {
      const m = marked();
      rows.forEach(function (r, i) {
        T.ui.empty(chipBox[i]);
        visible(i).forEach(function (v) {
          const cls = ['s4l__n', marks[v] && 'is-on', marks[v] && bad[v] && 'is-bad', marks[v] && solved && 'is-shown', keyV === v && marks[v] && 'is-key',
            fresh[i + ':' + v] && !still() && 'is-new'];
          let c;
          if (fixed) c = el('span', { class: cls }, String(v));
          else {
            c = el('button', { type: 'button', class: cls, dataset: { v: String(v) }, 'aria-pressed': marks[v] ? 'true' : 'false' }, String(v));
            c.disabled = locked || (guided && !can.mark);
            c.addEventListener('click', function () { tap(v, c); });
          }
          chipBox[i].appendChild(c);
        });
        if (more[i]) more[i].disabled = !canGrow(i);
      });
      fresh = {};
      let text = '';
      if (keyV != null && marks[keyV]) text = (kind === 'mult' ? 'Lowest common multiple: ' : 'Highest common factor: ') + keyV;
      else if (fixed) text = m.length ? 'In both lists: ' + m.join(', ') : '';
      else if (guided) text = 'In both lists: ' + (m.length ? m.join(', ') : '?');
      else text = 'Your marks: ' + (m.length ? m.join(', ') : 'none yet');
      foot.textContent = text;
      foot.hidden = !text;
      if (fixed) {
        root.setAttribute('role', 'img');
        root.setAttribute('aria-label', rows.map(function (r, i) { return r.name + ': ' + visible(i).join(', '); }).join('. ') +
          (m.length ? '. Marked in both lists: ' + m.join(', ') : '') + '.');
      } else {
        root.setAttribute('role', 'group');
        root.setAttribute('aria-label', 'Two lists of ' + both + '. Tap the numbers that are in both lists.');
      }
    }

    function shake(v) {
      T.util.$$('.s4l__n', root).forEach(function (c) {
        if (+c.dataset.v !== v) return;
        c.classList.remove('is-shake'); void c.offsetWidth; c.classList.add('is-shake');
      });
    }

    function tap(v) {
      if (locked) return;
      if (guided) {
        if (!can.mark || marks[v]) return;
        if (!inBoth(v)) { sfx('no'); shake(v); return; }
        marks[v] = true;
      } else {
        marks[v] = !marks[v];
      }
      bad = {}; solved = false;
      sfx(marks[v] ? 'pick' : 'pop');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: marks[v] ? 'mark' : 'rub', v: v });
    }

    function grow(i) {
      if (!canGrow(i)) return false;
      rows[i].groups[open[i]].forEach(function (v) { fresh[i + ':' + v] = true; });
      open[i]++;
      sfx('snap');
      paint();
      ev.emit('change', get());
      ev.emit('trade', { act: 'grow', row: i ? 'b' : 'a' });
      return true;
    }

    function get() {
      const m = marked();
      return { marked: m.join(','), count: m.length, na: visible(0).length, nb: visible(1).length,
        done: m.length === common.length && m.every(function (v) { return common.indexOf(v) >= 0; }) };
    }

    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, grow: grow, tap: tap,
      ready: function () { return marked().length > 0; },
      allow: function (c) { can = c || {}; paint(); },
      restart: function () { open[0] = startOpen(0); open[1] = startOpen(1); startMarks(); bad = {}; solved = false; paint(); },
      mark: function () { bad = {}; marked().forEach(function (v) { if (common.indexOf(v) < 0) bad[v] = true; }); paint(); },
      solve: function (right) {
        if (!right || right.marked == null) return;
        open[0] = rows[0].groups.length; open[1] = rows[1].groups.length;
        marks = {}; bad = {}; solved = true;
        String(right.marked).split(',').forEach(function (v) { if (v !== '') marks[+v] = true; });
        paint();
        ev.emit('change', get());
      },
      tip: function () {
        if (locked) return null;
        if (canGrow(0)) return more[0];
        if (canGrow(1)) return more[1];
        if (!guided) return root.querySelector('button.s4l__n:not([disabled])');
        if (!can.mark) return null;
        const v = common.filter(function (x) { return !marks[x] && inBoth(x); })[0];
        return v == null ? null : chipBox[0].querySelector('button.s4l__n[data-v="' + v + '"]');
      },
      lock: function () { locked = true; root.classList.add('is-locked'); paint(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- rings around numbers: the Grade 3 pickall, which also says 'change' when it shows the answer ---------- */

  function cpick(host, spec) {
    const tool = T.tools.pickall(host, spec), fns = [], on = tool.on, solve = tool.solve;
    tool.on = function (name, fn) { if (name === 'change') fns.push(fn); return on(name, fn); };
    tool.solve = function (right) { solve(right); fns.forEach(function (fn) { fn(tool.get()); }); };
    return tool;
  }

  /* ---------- the two rings (a picture) ---------- */

  function venn(spec) {
    const kind = spec.kind === 'fact' ? 'fact' : 'mult', rows = listsOf(spec), common = commonOf(rows);
    const onlyA = rows[0].full.filter(function (v) { return common.indexOf(v) < 0; });
    const onlyB = rows[1].full.filter(function (v) { return common.indexOf(v) < 0; });
    const W = 340, H = 222, cy = 124, r = 84, xa = 125, xb = 215;
    const say = spec.letters
      ? 'Two rings that cross. Ring 1: ' + rows[0].name + '. Ring 2: ' + rows[1].name + '. A is only in ring 1, B is where the rings cross, C is only in ring 2, D is outside both rings.'
      : 'Two rings that cross. Only ' + rows[0].name.toLowerCase() + ': ' + (onlyA.join(', ') || 'none') + '. In both rings: ' +
        (spec.ask === 'mid' ? 'not shown' : common.join(', ') || 'none') + '. Only ' + rows[1].name.toLowerCase() + ': ' + (onlyB.join(', ') || 'none') + '.';
    const g = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 's4v__svg', role: 'img', 'aria-label': say });
    g.appendChild(svg('rect', { x: 2, y: 28, width: W - 4, height: H - 30, rx: 10, class: 's4v__box' }));
    g.appendChild(svg('circle', { cx: xa, cy: cy, r: r, class: 's4v__ring s4v__ring--a' }));
    g.appendChild(svg('circle', { cx: xb, cy: cy, r: r, class: 's4v__ring s4v__ring--b' }));
    g.appendChild(svg('circle', { cx: xa, cy: cy, r: r, class: 's4v__edge s4v__edge--a' }));
    g.appendChild(svg('circle', { cx: xb, cy: cy, r: r, class: 's4v__edge s4v__edge--b' }));
    g.appendChild(svg('text', { x: 88, y: 19, class: 's4v__name s4v__name--a' }, [rows[0].name]));
    g.appendChild(svg('text', { x: 252, y: 19, class: 's4v__name s4v__name--b' }, [rows[1].name]));
    // a region: its numbers in one column, or in two when there are more than four (eight at most are drawn)
    function region(vals, xs, cls) {
      const two = vals.length > 4, per = two ? Math.ceil(Math.min(vals.length, 8) / 2) : vals.length;
      vals.slice(0, 8).forEach(function (v, j) {
        const col = two ? Math.floor(j / per) : 0, row = two ? j % per : j, n = two ? per : vals.length;
        const x = two ? xs[col] : (xs[0] + xs[1]) / 2, y = cy + (row - (n - 1) / 2) * 24 + 6;
        g.appendChild(svg('text', { x: x, y: y, class: 's4v__n ' + cls }, [String(v)]));
      });
    }
    if (spec.letters) {
      [['A', 80, cy + 8], ['B', 170, cy + 8], ['C', 260, cy + 8], ['D', 22, H - 12]].forEach(function (L) {
        g.appendChild(svg('text', { x: L[1], y: L[2], class: 's4v__let' }, [L[0]]));
      });
    } else {
      region(onlyA, [62, 98], 's4v__n--a');
      region(onlyB, [242, 278], 's4v__n--b');
      if (spec.ask === 'mid') g.appendChild(svg('text', { x: 170, y: cy + 10, class: 's4v__q' }, ['?']));
      else region(common, [158, 182], 's4v__n--mid');
    }
    const box = el('figure', { class: 's4v' }, g);
    if (spec.cap) box.appendChild(el('figcaption', { class: 'wb__cap', html: spec.cap }));
    return box;
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.clist = function (spec) { return clist(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  kinds.venn = venn;

  // Zip's first line when a question opens with the two lists (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    clist: { en: 'Tap the numbers in *both* lists.', vi: 'Bấm vào các số có trong *cả hai* danh sách.' },
    cpick: { en: 'Tap *every* number that fits.', vi: 'Bấm vào *tất cả* các số phù hợp.' }
  });

  T.tools.clist = clist;
  T.tools.cpick = cpick;
  T.tools.clist.multiples = multiples;
  T.tools.clist.factors = factors;
})(window.T = window.T || {});

