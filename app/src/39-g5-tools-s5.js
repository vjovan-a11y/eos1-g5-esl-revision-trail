/* 39-g5-tools-s5.js - Grade 5, Stop 5 (fractions: simplest form and fractions of amounts): the fraction bar, the
   bar model for a fraction of an amount, and their small pictures. Flat, on the light art plate (39-g5-tools-s5.css).
   Every number is a whole number (a fraction is a numerator and a denominator): no decimals anywhere.

   T.tools.fbar(host, spec)      a bar cut into d equal parts, n of them shaded. A "÷ 2" (÷ 3, ÷ 5, ÷ 7) button merges
                                 the parts in groups when BOTH numbers can be divided: 8/12 -> 4/6 -> 2/3. The first
                                 bar stays above, so the child sees that the shaded amount does not change.
       spec = { n: 8, d: 12, by: [2, 3, 5], tell: true, fixed, mini, cap }
       tell         the tool says when the fraction is in its simplest form (See it, "our turn")
       get() -> { n, d, steps, simplest }; events: 'change', 'trade' { act: 'merge', by, n, d } and { act: 'bump', by }
       (a button that does not divide both numbers); See it: wait: 'merge', until: { d: 6 }
       extras: allow({ merge: true | [2], reset: true }), restart(), solve({ n, d }), tip()
   T.tools.famt(host, spec)      a fraction of an amount: "Share into d" cuts the amount into d equal boxes, "+ 1 part"
                                 takes one more box (past d boxes a second whole appears: an improper fraction)
       spec = { amt: 20, d: 4, unit: '', total: true, parts: 0, shared: false, max: 2 * d, fixed, mini, cap }
       total        the tool shows the total of the parts taken (See it, "our turn")
       get() -> { shared, parts, total }; events: 'change', 'trade' { act: 'share' }, { act: 'take', parts },
       { act: 'back', parts }; See it: wait: 'take', until: { parts: 3 }
       extras: allow({ share: true, take: true }), restart(), solve({ parts }), tip()
   Pictures (T.tools.pic):
     { k: 'fbar', n, d, to: [n2, d2], ask, cap }      one bar, or two equal bars (to: the equal fraction below; ask: its
                                                      label is "?")
     { k: 'famt', amt, n, d, show: 'all' | 'ask' | 'back', unit, cap }   the bar model of n/d of amt. ask: the total is
                                                      "?"; back: the whole is "?" and the n parts are known */
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
  const fmt = function (n) { return window.MX.fmt(n); };
  const gcd = function (a, b) { return window.MX.gcd(a, b); };
  const frac = function (n, d) { return window.MX.F(n, d); };
  const PRIMES = [2, 3, 5, 7];

  /* ---------- the fraction bar ---------- */

  // one bar: n of d equal parts are shaded. `other` is the cut of the bar beside it: when it is finer (8/12 beside
  // 2/3) its lines show as thin dashes inside the parts; when it is coarser its lines are drawn thick.
  function barSvg(n, d, other, fresh) {
    const W = 240, H = 34, w = W / d;
    const g = svg('svg', { viewBox: '-2 -2 244 38', class: 's5-fb__svg' + (fresh && !still() ? ' is-new' : ''), 'aria-hidden': 'true', preserveAspectRatio: 'none' });
    for (let i = 0; i < d; i++) g.appendChild(svg('rect', { x: i * w, y: 0, width: w, height: H, class: 's5-fb__p' + (i < n ? ' is-on' : '') }));
    if (other > d && other % d === 0) for (let j = 1; j < other; j++) if (j % (other / d)) g.appendChild(svg('line', { x1: j * W / other, y1: 3, x2: j * W / other, y2: H - 3, class: 's5-fb__g' }));
    const thick = other && other < d && d % other === 0 ? d / other : 0;
    for (let i = 1; i < d; i++) g.appendChild(svg('line', { x1: i * w, y1: 0, x2: i * w, y2: H, class: 's5-fb__ln' + (thick && i % thick === 0 ? ' is-thick' : thick ? ' is-thin' : '') }));
    g.appendChild(svg('rect', { x: 0, y: 0, width: W, height: H, class: 's5-fb__frame' }));
    return g;
  }
  function barRow(n, d, other, o) {
    o = o || {};
    return el('div', { class: ['s5-fb__row', o.cls] },
      el('span', { class: 's5-fb__f', html: o.ask ? '<b class="s5-ask">?</b>' : frac(n, d) }),
      el('div', { class: 's5-fb__bar' }, barSvg(n, d, other, o.fresh)));
  }

  function fbar(host, spec) {
    spec = spec || {};
    const n0 = Math.min(spec.n || 0, spec.d || 1), d0 = spec.d || 1, ev = T.tools.emitter(), fixed = !!spec.fixed;
    const by = spec.by || PRIMES.filter(function (p) { return p < 7 || d0 % 7 === 0; });
    let n = n0, d = d0, steps = 0, locked = fixed, can = spec.can || null, last = '';
    const rows = el('div', { class: 's5-fb__rows' });
    const say = el('p', { class: 's5-fb__say', 'aria-live': 'polite' });
    const btns = by.map(function (p) {
      return el('button', { type: 'button', class: 'btn tl__btn s5-b s5-fb__m', dataset: { by: p }, 'aria-label': 'Divide both numbers by ' + p,
        onclick: function () { merge(p); } }, el('span', { class: 'btn__label' }, '÷ ' + p));
    });
    const again = el('button', { type: 'button', class: 'btn tl__btn s5-b s5-fb__again', 'aria-label': 'Start again', onclick: function () { if (!locked && mayReset()) { restart(); sfx('pop'); ev.emit('change', get()); ev.emit('trade', { act: 'reset' }); } } },
      T.ui.icon('replay'), el('span', { class: 'btn__label' }, 'Start again'));
    const ctl = fixed ? null : el('div', { class: 'sl__ctl s5-ctl' }, btns, again);
    const root = el('div', { class: ['wb', 's5-fb', spec.mini && 'wb--mini'] }, rows, fixed ? null : say, ctl);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    const mayMerge = function (p) { return !can || can.merge === true || (Array.isArray(can.merge) && can.merge.indexOf(p) >= 0); };
    const mayReset = function () { return !can || !!can.reset; };
    function get() { return { n: n, d: d, steps: steps, simplest: gcd(n, d) === 1 }; }

    function draw(fresh) {
      T.ui.empty(rows);
      if (fixed) {
        rows.appendChild(barRow(n0, d0, spec.to ? spec.to[1] : 0));
        if (spec.to) rows.appendChild(barRow(spec.to[0], spec.to[1], d0, { ask: !!spec.ask, cls: 'is-now' }));
        root.setAttribute('role', 'img');
        root.setAttribute('aria-label', 'A bar with ' + d0 + ' equal parts. ' + n0 + ' are shaded.' +
          (spec.to ? ' Below it, the same bar with ' + spec.to[1] + ' equal parts. ' + spec.to[0] + ' are shaded.' : ''));
        return;
      }
      rows.appendChild(barRow(n0, d0, 0, { cls: 'is-start' }));
      rows.appendChild(barRow(n, d, d0, { cls: 'is-now', fresh: fresh }));
      const done = gcd(n, d) === 1;
      say.innerHTML = last || (steps === 0 ? 'The bar has <b>' + d0 + '</b> equal parts. <b>' + n0 + '</b> are shaded.' : '');
      if (done && spec.tell && steps > 0) say.innerHTML += ' <b class="s5-fb__done">Simplest form!</b>';
      btns.forEach(function (b) { b.disabled = locked || !mayMerge(+b.dataset.by); });
      again.disabled = locked || !mayReset() || steps === 0;
      again.hidden = !!can && !can.reset;
    }

    function merge(p) {
      if (locked || !mayMerge(p)) return false;
      if (n % p || d % p) {
        sfx('no');
        const bad = n % p ? n : d;
        last = '<b>' + bad + '</b> cannot be divided by ' + p + '. Both numbers must divide.';
        draw(false);
        rows.classList.remove('is-shake'); void rows.offsetWidth; rows.classList.add('is-shake');
        ev.emit('trade', { act: 'bump', by: p });
        return false;
      }
      last = n + ' ÷ ' + p + ' = <b>' + n / p + '</b> and ' + d + ' ÷ ' + p + ' = <b>' + d / p + '</b>.';
      n /= p; d /= p; steps++;
      sfx('snap');
      draw(true);
      ev.emit('change', get());
      ev.emit('trade', { act: 'merge', by: p, n: n, d: d });
      return true;
    }
    function restart() { n = n0; d = d0; steps = 0; last = ''; draw(false); }

    draw(false);
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, merge: merge, restart: restart,
      allow: function (c) { can = c || {}; locked = fixed; draw(false); },
      solve: function (right) {
        if (!right || !right.d || d0 % right.d) return;
        n = right.n; d = right.d; steps = Math.max(steps, 1);
        last = n0 + ' ÷ ' + d0 / d + ' = <b>' + n + '</b> and ' + d0 + ' ÷ ' + d0 / d + ' = <b>' + d + '</b>.';
        draw(true);
      },
      tip: function () {
        return btns.filter(function (b) { const p = +b.dataset.by; return !b.disabled && n % p === 0 && d % p === 0; })[0] || null;
      },
      lock: function () { locked = true; draw(false); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the bar model: a fraction of an amount ---------- */

  function famt(host, spec) {
    spec = spec || {};
    const amt = spec.amt || 0, d = spec.d || 1, each = amt / d, ev = T.tools.emitter(), fixed = !!spec.fixed;
    if (each !== Math.floor(each)) throw new Error('famt: ' + amt + ' cannot be shared into ' + d + ' equal whole parts');
    const show = spec.show || 'all', unit = spec.unit ? ' ' + spec.unit : '';
    const max = spec.max || 2 * d;
    let shared = fixed || !!spec.shared, parts = fixed ? spec.n || 0 : spec.parts || 0, locked = fixed, can = spec.can || null;
    // the value fits in every box when the boxes are wide enough (about 300 px for the whole bar on a phone)
    const fits = String(each).length * 10 + 10 <= 300 / d;
    const bars = el('div', { class: 's5-am__bars' });
    const say = el('p', { class: 's5-am__say', 'aria-live': 'polite' });
    const bShare = el('button', { type: 'button', class: 'btn tl__btn s5-b s5-am__share', onclick: share }, el('span', { class: 'btn__label' }, 'Share into ' + d));
    const bLess = el('button', { type: 'button', class: 'btn tl__btn s5-b s5-am__less', 'aria-label': 'Take one part fewer', onclick: function () { take(-1); } }, T.ui.icon('minus'), el('span', { class: 'btn__label' }, '1 part'));
    const bMore = el('button', { type: 'button', class: 'btn tl__btn s5-b s5-am__more', 'aria-label': 'Take one more part', onclick: function () { take(1); } }, T.ui.icon('plus'), el('span', { class: 'btn__label' }, '1 part'));
    const ctl = fixed ? null : el('div', { class: 'sl__ctl s5-ctl' }, bShare, bLess, bMore);
    const root = el('div', { class: ['wb', 's5-am', spec.mini && 'wb--mini'] }, bars, say, ctl);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    const may = function (k) { return !can || !!can[k]; };
    function get() { return { shared: shared, parts: parts, total: parts * each }; }

    function draw(fresh) {
      T.ui.empty(bars);
      const nb = shared ? Math.max(1, Math.ceil(parts / d)) : 1, hide = fixed && show !== 'all';
      for (let w = 0; w < nb; w++) {
        const row = el('div', { class: 's5-am__row' });
        if (!shared) row.appendChild(el('span', { class: 's5-am__p is-whole' }, ''));
        else for (let i = 0; i < d; i++) {
          const on = w * d + i < parts;
          row.appendChild(el('span', { class: ['s5-am__p', on && 'is-on', fresh === w * d + i && !still() && 'is-new'] }, hide ? '' : fits || i === 0 ? fmt(each) : ''));
        }
        bars.appendChild(el('div', { class: ['s5-am__bar', w > 0 && 'is-extra'] },
          el('div', { class: 's5-am__whole' }, el('span', { html: (fixed && show === 'back' ? '<b class="s5-ask">?</b>' : '<b>' + fmt(amt) + '</b>' + unit) })),
          row));
      }
      const tot = parts * each;
      if (fixed) {
        const t = fmt(tot) + unit;
        say.innerHTML = frac(parts, d) + ' of ' + (show === 'back' ? '<b class="s5-ask">?</b>' : fmt(amt) + unit) + ' = ' + (show === 'ask' ? '<b class="s5-ask">?</b>' : '<b>' + t + '</b>');
        root.setAttribute('role', 'img');
        root.setAttribute('aria-label', 'Bar model. ' + (show === 'back' ? 'The whole is not known.' : 'The whole is ' + fmt(amt) + '.') + ' It is shared into ' + d + ' equal parts. ' +
          parts + (parts === 1 ? ' part is' : ' parts are') + ' shaded' + (show === 'ask' ? '.' : ': ' + fmt(tot) + '.'));
        return;
      }
      if (!shared) say.innerHTML = 'The whole is <b>' + fmt(amt) + '</b>' + unit + '.';
      else if (!parts) say.innerHTML = fmt(amt) + ' ÷ ' + d + ' = <b>' + fmt(each) + '</b> in each part.';
      else say.innerHTML = frac(parts, d) + ' of ' + fmt(amt) + (spec.total ? ' = ' + parts + ' × ' + fmt(each) + ' = <b>' + fmt(tot) + '</b>' : ': <b>' + parts + '</b> ' + (parts === 1 ? 'part' : 'parts'));
      bShare.hidden = shared; bLess.hidden = !shared; bMore.hidden = !shared;
      bShare.disabled = locked || !may('share');
      bLess.disabled = locked || !(may('back') || may('take')) || parts <= 0;
      bMore.disabled = locked || !may('take') || parts >= max;
    }

    function share() {
      if (locked || shared || !may('share')) return;
      shared = true;
      sfx('snap');
      draw(-1);
      if (!still()) bars.classList.add('is-cut');
      ev.emit('change', get());
      ev.emit('trade', { act: 'share' });
    }
    function take(k) {
      if (locked || !shared) return;
      if (k > 0 ? !may('take') || parts >= max : !(may('back') || may('take')) || parts <= 0) { sfx('no'); return; }
      parts += k;
      bars.classList.remove('is-cut');
      sfx(k > 0 ? 'snap' : 'pop');
      draw(k > 0 ? parts - 1 : -1);
      ev.emit('change', get());
      ev.emit('trade', { act: k > 0 ? 'take' : 'back', parts: parts });
    }

    draw(-1);
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, share: share, take: take,
      allow: function (c) { can = c || {}; locked = fixed; draw(-1); },
      restart: function () { shared = !!spec.shared; parts = spec.parts || 0; draw(-1); },
      solve: function (right) { if (!right || typeof right.parts !== 'number') return; shared = true; parts = Math.min(right.parts, Math.max(max, right.parts)); draw(-1); },
      tip: function () { const b = shared ? bMore : bShare; return b.disabled ? null : b; },
      lock: function () { locked = true; draw(-1); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds;
  kinds.fbar = function (spec) { return fbar(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  kinds.famt = function (spec) { return famt(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    fbar: { en: 'Tap a *÷* button to merge the parts.', vi: 'Bấm một nút *÷* để gộp các phần lại.' },
    famt: { en: '*Share* the amount. Then take the parts.', vi: '*Chia đều* số đó. Rồi lấy các phần.' }
  });

  T.tools = Object.assign(T.tools || {}, { fbar: fbar, famt: famt });
})(window.T = window.T || {});

