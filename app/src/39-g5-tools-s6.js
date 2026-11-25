/* 39-g5-tools-s6.js - Grade 5, Stop 6 (fractions, decimals and percentages): the hundred square to shade, the 0 to 1
   number line for fractions, decimals and percentages, the cards to put in order, and their small pictures.
   Flat, on the light art plate (39-g5-tools-s6.css; every class starts with s6-). A quantity is text: '3/5', '0.45',
   '70%' (MX.Q6, 08-g5-models-s6.js: exact, as a numerator and a denominator).

   T.tools.pgrid(host, spec)     a hundred square: − 10, − 1, + 1, + 10 shade the squares column by column (a tap on
       a square shades up to it). The fraction, the decimal and the percentage show together.
       spec = { shade: 0, show: 'nfdp', fixed, mini, cap }   show: n the count, f the fraction, d the decimal, p the percentage
       get() -> { shade }; events 'change' { shade }, 'trade' { act: 'shade', shade } (See it: wait: 'shade',
       until: { shade: 50 }); allow({ shade: true, to: 50 }) (to: where tip() leads); solve({ shade }); restart()
   T.tools.pcells(host, spec)    a small shape of r rows and c columns: tap a part to shade it, tap again to clear it.
       spec = { r, c, shade (the first parts, for a picture), fixed, mini }; get() -> { shade: how many parts }
   T.tools.fdpline(host, spec)   a number line from 0 to 1. Tap a card: it goes to its place on the line.
       spec = { cards: ['1/2', '0.25', '70%'], scale: 'p' | 'd', fixed, mini, cap }
       get() -> { placed }; 'trade' { act: 'place', placed }; allow({ place: true | ['1/2'] }); solve({ placed })
   T.tools.fdpmove(host, spec)   the same line with one card on an arrow that the child moves with four buttons.
       spec = { cards: ['3/5'], scale: 'd' | 'p', pos: 0 }; get() -> { pos: hundredths };
       'trade' { act: 'move', pos }; allow({ move: true, to: 60 }); solve({ pos })
   T.tools.ftiles(host, spec)    cards with fractions, decimals and percentages to put in order (as the v2 order tiles).
       spec = { items: ['3/10', '0.25', '35%'], from: 'smallest', to: 'largest', seq: '1,0,2' (a picture: placed), fixed }
       get() -> { seq: '1,0,' (the card in each place, by its index), placed }; ready() when full; mark([bool per
       place]); 'trade' { act: 'place', placed }; allow({ place: true, to: '1,0,2' }); solve({ seq })
   Pictures (T.tools.pic): { k: 'pgrid', r, c, shade, cap } (10 by 10 when r and c are left out), { k: 'fdpline', cards,
   scale, cap }, { k: 'ftiles', items, seq }, { k: 'pctbar', n: 80, parts: 10, take: 3, pre: '$', unit, cut, ask, cap }: a bar
   for a percentage of an amount (100% is the whole bar, cut into 2, 4, 10 or 20 equal parts). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  const still = function () {
    try { if (T.fx && T.fx.still) return !!T.fx.still(); } catch (e) { /* fall through */ }
    return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion());
  };
  const NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  function replay(node, cls) {
    if (!node || still()) return;
    node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls);
  }
  function tbtn(label, cls, onClick, aria) {
    return el('button', { type: 'button', class: ['btn', 'btn--quiet', 's6-btn', cls], onclick: onClick, 'aria-label': aria || null }, el('span', { class: 'btn__label' }, label));
  }
  const Q = function (x) { return window.MX.Q6(x); };
  const D = function () { return window.MX.D; };
  const decOf = function (h) { return D().s(h * 10); };
  const gcd = function (a, b) { return window.MX.gcd(a, b); };
  const tag = function (q, cls) { return el('span', { class: cls, html: q.html }); };          // a label; a fraction is drawn n over d
  const clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  /* ---------- the hundred square to shade, and a small shape to shade part by part ---------- */

  function pgrid(host, spec) {
    spec = spec || {};
    const R = spec.r || 10, C = spec.c || 10, N = R * C, hundred = N === 100 && !spec.tap, fixed = !!spec.fixed;
    const ev = T.tools.emitter(), show = spec.show == null ? (fixed ? '' : 'nfdp') : String(spec.show);
    const on = []; for (let k = 0; k < N; k++) on.push(k < (spec.shade || 0));
    let can = spec.can || null, locked = fixed;
    const count = function () { return on.filter(Boolean).length; };
    const may = function () { return !locked && (!can || !!can.shade); };
    const root = el('div', { class: ['wb', 's6-pg', hundred ? 's6-pg--100' : 's6-pg--shape', spec.mini && 's6-pg--mini', fixed && 'is-fixed'] });
    const cells = [];
    let pic;

    if (hundred) {
      // the squares fill column by column (as the hundred square of Stop 1): square k is in column k / 10, row k % 10
      pic = svg('svg', { viewBox: '-2 -2 104 104', class: 's6-pg__svg', role: 'img' });
      for (let k = 0; k < N; k++) {
        const r = svg('rect', { x: Math.floor(k / 10) * 10, y: (k % 10) * 10, width: 10, height: 10, class: 's6-pg__c' });
        if (!fixed) r.addEventListener('click', (function (kk) { return function () { tapSquare(kk); }; })(k));
        cells.push(r); pic.appendChild(r);
      }
      for (let c = 1; c < 10; c++) pic.appendChild(svg('line', { x1: c * 10, y1: 0, x2: c * 10, y2: 100, class: 's6-pg__col' }));
      pic.appendChild(svg('line', { x1: 0, y1: 50, x2: 100, y2: 50, class: 's6-pg__half' }));
      pic.appendChild(svg('rect', { x: 0, y: 0, width: 100, height: 100, class: 's6-pg__frame' }));
    } else {
      pic = el('div', { class: 's6-pg__shape', style: '--c:' + C + ';--r:' + R, role: fixed ? 'img' : 'group' });
      for (let k = 0; k < N; k++) {
        const b = fixed ? el('span', { class: 's6-pg__cell' }) : el('button', { type: 'button', class: 's6-pg__cell' });
        if (!fixed) b.addEventListener('click', (function (kk) { return function () { toggle(kk); }; })(k));
        cells.push(b); pic.appendChild(b);
      }
    }
    const out = show ? el('div', { class: 's6-pg__out', 'aria-live': 'polite' }) : null;
    const btns = hundred && !fixed ? [[-10, '− 10', 'Take away 10 squares'], [-1, '− 1', 'Take away 1 square'], [1, '+ 1', 'Shade 1 more square'], [10, '+ 10', 'Shade 10 more squares']].map(function (x) {
      const b = tbtn(x[1], x[0] > 0 ? 's6-btn--plus' : 's6-btn--minus', function () { step(x[0]); }, x[2]);
      b.dataset.d = String(x[0]);
      return b;
    }) : [];
    root.appendChild(el('div', { class: 's6-pg__main' }, el('div', { class: 's6-pg__pic' }, pic), out));
    if (btns.length) root.appendChild(el('div', { class: 's6-pg__ctl' }, btns));
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    function chip(name, node) { return el('span', { class: 's6-pg__chip' }, el('i', name), node); }
    function paint() {
      const n = count();
      cells.forEach(function (c, k) {
        if (hundred) c.setAttribute('class', 's6-pg__c' + (on[k] ? ' is-on' : ''));
        else {
          c.classList.toggle('is-on', on[k]);
          if (!fixed) { c.disabled = !may(); c.setAttribute('aria-pressed', on[k] ? 'true' : 'false'); c.setAttribute('aria-label', 'Part ' + (k + 1) + (on[k] ? ', shaded' : ', not shaded')); }
        }
      });
      pic.setAttribute('aria-label', n + ' of ' + N + (hundred ? ' squares are shaded' : ' parts are shaded'));
      if (out) {
        T.ui.empty(out);
        const g = gcd(n, N) || 1, h = n * 100 / N;
        if (show.indexOf('n') >= 0) out.appendChild(chip(hundred ? 'squares' : 'parts', el('b', String(n))));
        if (show.indexOf('f') >= 0) out.appendChild(chip('fraction', el('b', { html: window.MX.F(n, N) + (n > 0 && g > 1 ? ' = ' + window.MX.F(n / g, N / g) : '') })));
        if (show.indexOf('d') >= 0) out.appendChild(chip('decimal', el('b', decOf(h))));
        if (show.indexOf('p') >= 0) out.appendChild(chip('percentage', el('b', h + '%')));
      }
      btns.forEach(function (b) { const d = +b.dataset.d; b.disabled = !may() || n + d < 0 || n + d > N; });
      root.classList.toggle('is-off', !may());
    }
    function setPrefix(n) { for (let k = 0; k < N; k++) on[k] = k < n; }
    function changed() {
      paint();
      ev.emit('change', { shade: count() });
      ev.emit('trade', { act: 'shade', shade: count() });
    }
    function step(d) {
      if (!may()) return false;
      const n = count(), ns = n + d;
      if (ns < 0 || ns > N) { sfx('no'); return false; }
      setPrefix(ns); sfx(d > 0 ? 'snap' : 'pop');
      changed();
      return true;
    }
    function tapSquare(k) {
      if (!may()) return;
      setPrefix(count() === k + 1 ? k : k + 1); sfx('snap');
      changed();
    }
    function toggle(k) {
      if (!may()) return;
      on[k] = !on[k]; sfx(on[k] ? 'snap' : 'pop');
      changed();
    }
    const goal = function () { return can && typeof can.to === 'number' ? can.to : spec.task && spec.task.right && typeof spec.task.right.shade === 'number' ? spec.task.right.shade : null; };

    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, step: step, toggle: toggle,
      get: function () { return { shade: count() }; },
      ready: function () { return count() > 0; },
      set: function (v) { setPrefix(v && typeof v.shade === 'number' ? v.shade : +v || 0); paint(); },
      solve: function (right) { if (right && typeof right.shade === 'number') { setPrefix(right.shade); paint(); ev.emit('change', { shade: count() }); } },
      allow: function (c) { can = c || {}; locked = fixed; paint(); },
      restart: function () { setPrefix(spec.shade || 0); paint(); },
      tip: function () {
        if (!may()) return null;
        const g = goal(), n = count();
        if (!hundred) return g != null && n >= g ? null : cells.filter(function (c, k) { return !on[k]; })[0] || null;
        const d = g == null ? (n + 10 <= N ? 10 : 1) : g - n >= 10 ? 10 : g > n ? 1 : n - g >= 10 ? -10 : n > g ? -1 : 0;
        const b = btns.filter(function (x) { return +x.dataset.d === d; })[0];
        return b && !b.disabled ? b : null;
      },
      lock: function () { locked = true; paint(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }
  function pcells(host, spec) { return pgrid(host, Object.assign({ show: 'n' }, spec, { tap: true })); }

  /* ---------- the number line from 0 to 1 ---------- */

  function fdpline(host, spec, moveMode) {
    spec = spec || {};
    const cards = (spec.cards || []).map(Q), fixed = !!spec.fixed, ev = T.tools.emitter();
    cards.forEach(function (q) { if (q.h == null || q.h < 0 || q.h > 100) throw new Error('fdpline: ' + q.text + ' is not between 0 and 1 in hundredths'); });
    const scale = spec.scale || 'p';
    const at = function (h) { return scale === 'p' ? h + '%' : decOf(h); };
    // the height of each flag: neighbours on the line never share a level
    const rank = cards.map(function (q, i) { return i; }).sort(function (i, j) { return cards[i].h - cards[j].h || i - j; });
    const levels = moveMode ? 1 : Math.min(3, cards.length), level = [];
    rank.forEach(function (i, k) { level[i] = k % levels; });
    const placed = cards.map(function () { return fixed && !moveMode; });
    let pos = clamp(spec.pos || 0, 0, 100), can = spec.can || null, locked = fixed;
    if (fixed && moveMode) pos = cards[0].h;
    const may = function (k) { return !locked && (!can || !!can[k]); };

    const root = el('div', { class: ['wb', 's6-fl', moveMode && 's6-fl--move', spec.mini && 's6-fl--mini', fixed && 'is-fixed'], style: '--lv:' + levels });
    const track = el('div', { class: 's6-fl__track' });
    const flags = cards.map(function (q, i) {
      const f = el('span', { class: 's6-fl__flag', style: '--at:' + (moveMode ? pos : q.h) + ';--l:' + level[i] }, tag(q, 's6-fl__tag'), el('i', { class: 's6-fl__stem', 'aria-hidden': 'true' }));
      track.appendChild(f);
      return f;
    });
    const axis = el('div', { class: 's6-fl__axis', 'aria-hidden': 'true' });
    for (let h = 0; h <= 100; h += 5) {
      axis.appendChild(el('i', { class: ['s6-fl__tick', h % 10 === 0 && 'is-ten', h % 50 === 0 && 'is-half'], style: '--at:' + h }));
      if (h % 10 === 0) axis.appendChild(el('b', { class: ['s6-fl__lab', h % 20 !== 0 && 'is-odd', h % 50 === 0 && 'is-half'], style: '--at:' + h }, at(h)));
    }
    track.appendChild(axis);
    root.appendChild(track);
    const now = moveMode && !fixed ? el('p', { class: 's6-fl__now', 'aria-live': 'polite' }) : null;
    if (now) root.appendChild(now);
    const pool = !moveMode && !fixed ? el('div', { class: 's6-fl__pool' }) : null;
    const cardBtns = pool ? cards.map(function (q, i) {
      const b = el('button', { type: 'button', class: 's6-fl__card', 'aria-label': 'Put ' + q.text + ' on the line' }, tag(q, 's6-fl__cardtxt'));
      b.addEventListener('click', function () { place(i); });
      pool.appendChild(b);
      return b;
    }) : [];
    if (pool) root.appendChild(pool);
    const eqs = pool ? el('ul', { class: 's6-fl__eq', 'aria-live': 'polite' }) : null;
    if (eqs) root.appendChild(eqs);
    const steps = scale === 'p' ? [[-10, '− 10%'], [-1, '− 1%'], [1, '+ 1%'], [10, '+ 10%']] : [[-10, '− 0.1'], [-1, '− 0.01'], [1, '+ 0.01'], [10, '+ 0.1']];
    const btns = moveMode && !fixed ? steps.map(function (x) {
      const b = tbtn(x[1], x[0] > 0 ? 's6-btn--plus' : 's6-btn--minus', function () { move(x[0]); }, (x[0] > 0 ? 'Move right ' : 'Move left ') + x[1].slice(2));
      b.dataset.d = String(x[0]);
      return b;
    }) : [];
    if (btns.length) root.appendChild(el('div', { class: 's6-pg__ctl' }, btns));
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    const count = function () { return placed.filter(Boolean).length; };
    const allowed = function (i) { return may('place') && !placed[i] && (!can || !Array.isArray(can.place) || can.place.indexOf(cards[i].text) >= 0); };
    function paint(fresh) {
      flags.forEach(function (f, i) {
        f.hidden = !moveMode && !placed[i];
        if (moveMode) f.style.setProperty('--at', String(pos));
        if (fresh === i && !still()) replay(f, 'is-new');
      });
      cardBtns.forEach(function (b, i) { b.classList.toggle('is-gone', placed[i]); b.disabled = !allowed(i); });
      if (eqs) {
        T.ui.empty(eqs);
        rank.forEach(function (i) { if (placed[i]) eqs.appendChild(el('li', { class: 's6-fl__eqi', html: cards[i].kind === 'p' && scale === 'p' ? cards[i].html : cards[i].html + ' = ' + at(cards[i].h) })); });
      }
      if (now) now.textContent = 'The arrow is at ' + at(pos) + '.';
      btns.forEach(function (b) { const d = +b.dataset.d; b.disabled = !may('move') || pos + d < 0 || pos + d > 100; });
      root.setAttribute('aria-label', 'A number line from 0 to 1' + (moveMode ? '. The arrow is at ' + at(pos) : cards.filter(function (q, i) { return placed[i]; }).length ? ' with ' + rank.filter(function (i) { return placed[i]; }).map(function (i) { return cards[i].text; }).join(', ') : ''));
    }
    function place(i) {
      if (!allowed(i)) return false;
      placed[i] = true; sfx('snap');
      paint(i);
      ev.emit('change', { placed: count() });
      ev.emit('trade', { act: 'place', placed: count(), v: cards[i].text });
      return true;
    }
    function move(d) {
      if (!may('move')) return false;
      if (pos + d < 0 || pos + d > 100) { sfx('no'); return false; }
      pos += d; sfx('slide');
      paint();
      ev.emit('change', { pos: pos });
      ev.emit('trade', { act: 'move', pos: pos });
      return true;
    }
    const goal = function () { return can && typeof can.to === 'number' ? can.to : spec.task && spec.task.right && typeof spec.task.right.pos === 'number' ? spec.task.right.pos : null; };

    if (fixed) root.setAttribute('role', 'img');
    paint();
    mount(host, root);
    return {
      el: root, on: ev.on, place: place, move: move,
      get: function () { return moveMode ? { pos: pos } : { placed: count() }; },
      ready: function () { return moveMode ? pos > 0 : count() === cards.length; },
      solve: function (right) {
        if (!right) return;
        if (moveMode && typeof right.pos === 'number') pos = clamp(right.pos, 0, 100);
        if (!moveMode) placed.forEach(function (x, i) { placed[i] = true; });
        paint();
        ev.emit('change', moveMode ? { pos: pos } : { placed: count() });
      },
      allow: function (c) { can = c || {}; locked = fixed; paint(); },
      restart: function () { pos = clamp(spec.pos || 0, 0, 100); placed.forEach(function (x, i) { placed[i] = false; }); paint(); },
      tip: function () {
        if (!moveMode) return cardBtns.filter(function (b, i) { return allowed(i); })[0] || null;
        if (!may('move')) return null;
        const g = goal(), d = g == null ? 10 : g - pos >= 10 ? 10 : g > pos ? 1 : pos - g >= 10 ? -10 : pos > g ? -1 : 0;
        const b = btns.filter(function (x) { return +x.dataset.d === d; })[0];
        return b && !b.disabled ? b : null;
      },
      lock: function () { locked = true; paint(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }
  function fdpmove(host, spec) { return fdpline(host, Object.assign({ scale: 'd' }, spec), true); }

  /* ---------- cards to put in order ---------- */

  function ftiles(host, spec) {
    spec = spec || {};
    const items = (spec.items || []).map(Q), ev = T.tools.emitter(), fixed = !!spec.fixed;
    const slots = items.map(function () { return null; }), used = items.map(function () { return -1; });
    let locked = fixed, can = spec.can || null, bad = null;
    const root = el('div', { class: ['s6-ft', spec.mini && 's6-ft--mini', fixed && 'is-fixed'], role: fixed ? 'img' : 'group', 'aria-label': 'Put the numbers in order, ' + (spec.from || 'smallest') + ' first' });
    const row = el('div', { class: 's6-ft__row' });
    const slotEls = slots.map(function (x, i) {
      const s = fixed ? el('span', { class: 's6-ft__slot' }) : el('button', { type: 'button', class: 's6-ft__slot' });
      if (!fixed) s.addEventListener('click', function () { takeBack(i); });
      row.appendChild(s);
      return s;
    });
    const ends = el('p', { class: 's6-ft__ends', 'aria-hidden': 'true' }, el('span', spec.from || 'smallest'), el('i', { class: 's6-ft__arrow' }), el('span', spec.to || 'largest'));
    const pool = fixed ? null : el('div', { class: 's6-ft__pool' });
    const tiles = pool ? items.map(function (q, j) {
      const t = el('button', { type: 'button', class: 's6-ft__tile', 'aria-label': q.text }, tag(q, 's6-ft__txt'));
      t.addEventListener('click', function () { place(j); });
      pool.appendChild(t);
      return t;
    }) : [];
    root.appendChild(row); root.appendChild(ends); if (pool) root.appendChild(pool);

    const placed = function () { return slots.filter(function (j) { return j != null; }).length; };
    const seq = function () { return slots.map(function (j) { return j == null ? '' : String(j); }).join(','); };
    const get = function () { return { seq: seq(), placed: placed() }; };
    const may = function () { return !locked && (!can || !!can.place); };
    function setSeq(s) {
      slots.fill(null); used.fill(-1);
      String(s == null ? '' : s).split(',').forEach(function (x, i) { const j = x === '' ? -1 : +x; if (j >= 0 && j < items.length && i < slots.length && used[j] < 0) { slots[i] = j; used[j] = i; } });
    }
    function paint(fresh) {
      slotEls.forEach(function (s, i) {
        const j = slots[i];
        T.ui.empty(s);
        if (j != null) s.appendChild(el('span', { class: ['s6-ft__tile', 'is-in', fresh === i && !still() && 'is-new'] }, tag(items[j], 's6-ft__txt')));
        s.classList.toggle('is-full', j != null);
        s.classList.toggle('is-bad', !!bad && bad[i] === false && j != null);
        if (!fixed) { s.disabled = j == null || !may(); s.setAttribute('aria-label', 'Place ' + (i + 1) + (j == null ? ', empty' : ': ' + items[j].text + (locked ? '' : '. Tap to take it back'))); }
      });
      tiles.forEach(function (t, j) { t.classList.toggle('is-gone', used[j] >= 0); t.disabled = used[j] >= 0 || !may(); });
    }
    function place(j) {
      if (used[j] >= 0 || !may()) return false;
      const i = slots.indexOf(null);
      if (i < 0) return false;
      slots[i] = j; used[j] = i; bad = null;
      sfx('snap');
      paint(i);
      ev.emit('change', get());
      ev.emit('trade', { act: 'place', placed: placed() });
      return true;
    }
    function takeBack(i) {
      if (slots[i] == null || !may()) return;
      used[slots[i]] = -1; slots[i] = null; bad = null;
      sfx('pop');
      paint(-1);
      ev.emit('change', get());
    }
    const goal = function () { const g = can && typeof can.to === 'string' ? can.to : spec.task && spec.task.right && spec.task.right.seq; return g ? String(g).split(',').map(Number) : null; };

    if (spec.seq != null) setSeq(spec.seq);
    paint(-1);
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, place: place,
      ready: function () { return placed() === items.length; },
      solve: function (right) { if (right && right.seq != null) { setSeq(right.seq); bad = null; paint(-1); ev.emit('change', get()); } },
      mark: function (parts) { bad = Array.isArray(parts) ? parts : null; paint(-1); },
      allow: function (c) { can = c || {}; locked = fixed; paint(-1); },
      restart: function () { setSeq(''); bad = null; paint(-1); },
      tip: function () {
        if (!may()) return null;
        const g = goal(), i = slots.indexOf(null);
        if (g && i >= 0 && tiles[g[i]] && !tiles[g[i]].disabled) return tiles[g[i]];
        return tiles.filter(function (t) { return !t.disabled; })[0] || null;
      },
      lock: function () { locked = true; paint(-1); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- a bar for a percentage of an amount (a picture) ---------- */

  function pctbar(spec) {
    const n = spec.n, parts = spec.parts || 10, take = clamp(spec.take || 0, 0, parts), Dx = D();
    const money = function (t) { return (spec.pre || '') + Dx.s(t) + (spec.unit ? ' ' + spec.unit : ''); };
    const each = (n * 1000) % parts === 0 ? n * 1000 / parts : null, pct = 100 / parts;
    const short = !spec.ask && each != null && parts <= 10 && Dx.s(each).length <= (parts > 5 ? 2 : 6);
    const bar = el('div', { class: 's6-pb__bar', style: '--n:' + parts });
    for (let i = 0; i < parts; i++) bar.appendChild(el('span', { class: ['s6-pb__c', i < take && 'is-on', i < take && spec.cut && 'is-cut'] }, short ? Dx.s(each) : ''));
    const label = take * pct + '% = ' + (each != null && !spec.ask ? money(each * take) : '?');
    const root = el('div', { class: ['wb', 'wb--mini', 's6-pb'], role: 'img', 'aria-label': 'A bar for ' + money(n * 1000) + ', cut into ' + parts + ' equal parts. ' + label },
      el('p', { class: 's6-pb__top' }, el('i', { 'aria-hidden': 'true' }), el('b', '100% = ' + money(n * 1000)), el('i', { 'aria-hidden': 'true' })),
      bar,
      take > 0 && take < parts ? el('p', { class: 's6-pb__under', style: '--w:' + (take / parts * 100) }, el('span', { class: 's6-pb__brace', 'aria-hidden': 'true' }), el('b', label)) : null,
      parts > 1 ? el('p', { class: 's6-pb__note' }, 'Each part is ' + pct + '%' + (each != null && !spec.ask ? ' = ' + money(each) : '') + '.') : null);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));
    return root;
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.pgrid = function (spec) { return pgrid(null, Object.assign({ mini: true, show: '' }, spec, { fixed: true })).el; };
  kinds.fdpline = function (spec) { return fdpline(null, Object.assign({ mini: true }, spec, { fixed: true }), false).el; };
  kinds.ftiles = function (spec) { return ftiles(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  kinds.pctbar = pctbar;

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    pgrid: { en: 'Shade the squares with the buttons.', vi: 'Tô màu các ô vuông bằng các nút.' },
    pcells: { en: 'Tap the parts to shade them.', vi: 'Bấm vào các phần để tô màu.' },
    fdpline: { en: 'Tap each card. It goes on the line.', vi: 'Bấm vào từng thẻ. Thẻ sẽ lên trục số.' },
    fdpmove: { en: 'Move the arrow with the buttons.', vi: 'Di chuyển mũi tên bằng các nút.' },
    ftiles: { en: 'Tap the cards in order.', vi: 'Bấm các thẻ theo thứ tự.' }
  });

  T.tools = Object.assign(T.tools || {}, { pgrid: pgrid, pcells: pcells, fdpline: function (host, spec) { return fdpline(host, spec, false); }, fdpmove: fdpmove, ftiles: ftiles });
})(window.T = window.T || {});

