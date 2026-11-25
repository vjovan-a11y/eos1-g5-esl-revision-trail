/* 39-tools-share.js - the maths tools of Stop 6 (multiply and divide), flat on the light art plate (39-tools-share.css).
   Ported from Maths v2 (legacy/maths-v2/src/mui_d.js: TOOLS.share, PICS.share, PICS.gridm), drawn in the Grade 4 flat
   style, with the v2 answers kept: get() returns what the models' check(r) reads, solve(task.right) shows the right state.

   Every tool: T.tools.<name>(host, spec) -> { el, get(), on('change' | 'trade', fn), lock(), destroy(), ready(), solve(right),
     tip(), allow(can) }. host may be null. allow(can) is used by See it (one step at a time); without it everything works.

   T.tools.share(host, spec)   share things equally: "Give 1 to each plate" gives one to every plate at once, "Take back"
       takes one back from each. What cannot be shared any more is left over (gold): the remainder.
       spec = { n, plates, each (at the start), fixed, skin: 'fish' (See it at the Sharing Harbour: fish into crates),
       cap }. get() -> { each, left }; allow({ deal, back }); trade { act: 'deal' | 'back', each, left }
   T.tools.gridm(host, spec)   the grid method: the number partitioned across the top, the multiplier at the side. Tap a
       box to multiply that part; when every box is done, "Add the parts" writes the total under the grid.
       spec = { n, m, show (boxes done at the start, from the left), fixed, cap }. get() -> { show, added };
       allow({ fill, add }); trade { act: 'fill', i, show } and { act: 'add' }
   Pictures (T.tools.pic): { k: 'share', n, plates, each, skin }, { k: 'gridm', n, m, show } (show 9: all, with the total)
   Motion: transform and opacity only (a new counter pops onto each plate, one plate a little after the other; a product
   pops into its box); still = the final state at once (00-tokens.css). */
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
  const fmt = function (n) { return window.MX ? window.MX.fmt(n) : String(n); };
  function tbtn(label, cls, data, iconStart) {
    return el('button', { type: 'button', class: ['btn', 'tl__btn', cls], dataset: data || {} },
      iconStart ? T.ui.icon(iconStart) : null, el('span', { class: 'btn__label' }, label));
  }

  /* ---------- share equally ---------- */

  const SKIN = {
    plain: { one: 'counter', many: 'counters', plate: 'plate', plates: 'plates', on: 'on' },
    fish: { one: 'fish', many: 'fish', plate: 'crate', plates: 'crates', on: 'in' }
  };
  // one thing at x, y: a counter, or a small fish
  function thing(skin, x, y, cls, delay) {
    const st = delay != null ? ' style="animation-delay:' + delay + 'ms"' : '';
    if (skin === 'fish') return '<g class="' + cls + '"' + st + '><path d="M' + (x - 9) + ' ' + y + 'q7-8 15 0q-8 8-15 0z"/><path d="M' + (x + 5) + ' ' + y + 'l6-5v10z"/><circle cx="' + (x - 4) + '" cy="' + (y - 1) + '" r="1.4" class="sh__eye"/></g>';
    return '<circle class="' + cls + '"' + st + ' cx="' + x + '" cy="' + y + '" r="8"/>';
  }

  function share(host, spec) {
    spec = spec || {};
    const n = spec.n || 12, k = spec.plates || 3, fixed = !!spec.fixed, ev = T.tools.emitter(), maxEach = Math.floor(n / k);
    const skin = spec.skin === 'fish' ? 'fish' : 'plain', W = SKIN[skin];
    let each = Math.max(0, Math.min(maxEach, spec.each || 0)), locked = fixed, can = spec.can || null, shown = -1;
    // the pile: the things still to share, in rows of 10 (its box keeps the size of all n, so nothing jumps; a picture
    // only has room for the things left over)
    const G = skin === 'fish' ? 25 : 20, base = fixed ? Math.max(1, n - each * k) : n, per = Math.min(base, 10), pw = per * G + 8, ph = Math.ceil(base / 10) * 20 + 8;
    const pile = el('span', { class: 'sh__pile', style: '--pw:' + pw, html: '<svg viewBox="0 0 ' + pw + ' ' + ph + '" aria-hidden="true" focusable="false"></svg>' });
    const pileCap = el('b', { class: 'sh__pcap' });
    const tray = el('div', { class: 'sh__tray' }, pile, pileCap);
    const plates = el('div', { class: 'sh__plates', style: '--k:' + k });
    const pl = [];
    for (let i = 0; i < k; i++) { const p = el('span', { class: 'sh__plate', html: '<svg viewBox="0 0 96 84" aria-hidden="true" focusable="false"></svg>' }); pl.push(p); plates.appendChild(p); }
    const felt = el('div', { class: 'sh__felt', role: 'img' }, tray, plates);
    const root = el('div', { class: ['sh', fixed && 'sh--mini', skin === 'fish' && 'sh--fish'] }, felt);
    const info = el('p', { class: 'sh__info', 'aria-live': fixed ? null : 'polite' });
    let back = null, deal = null;
    if (!fixed) {
      back = tbtn('Take back', 'sh__btn', { a: 'back' }, 'minus');
      deal = tbtn('Give 1 to each ' + W.plate, 'sh__btn sh__btn--deal', { a: 'deal' }, 'plus');
      back.addEventListener('click', function () { step(-1); });
      deal.addEventListener('click', function () { step(1); });
      root.appendChild(el('div', { class: 'sh__ctl' }, back, deal));
    }
    root.appendChild(info);
    if (spec.cap) root.appendChild(el('p', { class: 'ar__cap', html: spec.cap }));

    const plateBg = skin === 'fish'
      ? '<rect x="6" y="18" width="84" height="62" rx="5" class="sh__crate"/><path d="M6 39h84M6 60h84" class="sh__plank"/>'
      : '<ellipse cx="48" cy="50" rx="45" ry="32" class="sh__dish"/><ellipse cx="48" cy="50" rx="34" ry="23" class="sh__dish-in"/>';
    function paint(fresh) {
      const left = n - each * k, pop = fresh && !still() && each > shown;
      // the plates: each thing in a grid of 3 (or 4) across, the newest one pops in
      const cols = each <= 6 ? 3 : 4, rows = Math.ceil(each / cols);
      pl.forEach(function (p, j) {
        let s = plateBg;
        for (let i = 0; i < each; i++) {
          const x = 48 - (cols - 1) * 10 + (i % cols) * 20, y = 50 - (rows - 1) * 10 + Math.floor(i / cols) * 20;
          const isNew = pop && i === each - 1;
          s += thing(skin, x, y, 'sh__t' + (isNew ? ' is-new' : ''), isNew ? j * 60 : null);
        }
        p.firstChild.innerHTML = s;
      });
      // the pile: the things left; gold once they cannot be shared any more (the remainder)
      const rest = each > 0 && left < k;
      let s = '';
      for (let i = 0; i < left; i++) s += thing(skin, 14 + (i % 10) * G, 14 + Math.floor(i / 10) * 20, 'sh__t' + (rest ? ' is-left' : ''));
      pile.firstChild.innerHTML = s;
      tray.classList.toggle('is-left', rest);
      tray.classList.toggle('is-empty', left === 0);
      pileCap.textContent = left === 0 ? 'Nothing is left' : rest ? left + ' left over' : left + ' ' + (left === 1 ? W.one : W.many) + ' to share';
      const say = !each ? 'The ' + W.plates + ' are empty.' : each + ' ' + W.on + ' each ' + W.plate + (left === 0 ? '. Nothing is left over.' : rest ? ', ' + left + ' left over.' : '.');
      info.textContent = say;
      felt.setAttribute('aria-label', n + ' ' + W.many + ' shared among ' + k + ' ' + W.plates + ': ' + each + ' ' + W.on + ' each ' + W.plate + ', ' + left + ' not ' + W.on + ' a ' + W.plate);
      if (deal) {
        deal.disabled = locked || left < k || !may(can, 'deal');
        back.disabled = locked || each < 1 || !may(can, 'back');
      }
      shown = each;
    }
    function step(d) {
      if (locked || !may(can, d > 0 ? 'deal' : 'back')) return false;
      if ((d > 0 && n - each * k < k) || (d < 0 && each < 1)) return false;
      each += d;
      sfx(d > 0 ? 'snap' : 'pop');
      paint(true);
      ev.emit('change', get());
      ev.emit('trade', { act: d > 0 ? 'deal' : 'back', each: each, left: n - each * k });
      return true;
    }
    function get() { return { each: each, left: n - each * k }; }
    paint(false);
    mount(host, root);
    return {
      el: root, get: get, on: ev.on, step: step,
      solve: function (r) { if (r && r.each != null) { each = Math.min(maxEach, r.each); paint(true); ev.emit('change', get()); } },
      ready: function () { return true; },
      lock: function () { locked = true; paint(false); },
      allow: function (c) { can = c || {}; locked = fixed; paint(false); },
      tip: function () { return deal && !deal.disabled ? deal : back && !back.disabled ? back : null; },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the grid method ---------- */

  const PLACE = ['p-o', 'p-t', 'p-h', 'p-th'];
  const partsOf = function (v) { return String(v).split('').map(function (d, i, a) { return +d * Math.pow(10, a.length - 1 - i); }).filter(Boolean); };

  function gridm(host, spec) {
    spec = spec || {};
    const fixed = !!spec.fixed, ev = T.tools.emitter(), m = spec.m || 3, ps = partsOf(spec.n || 124);
    const done = ps.map(function (x, i) { return i < (spec.show || 0); });
    let added = fixed && (spec.show || 0) >= 9, locked = fixed, can = spec.can || null;
    const grid = el('div', { class: 'gm__g', style: '--k:' + ps.length });
    grid.appendChild(el('b', { class: 'gm__x', 'aria-hidden': 'true' }, '×'));
    ps.forEach(function (p) { grid.appendChild(el('b', { class: ['gm__h', PLACE[String(p).length - 1]] }, fmt(p))); });
    grid.appendChild(el('b', { class: 'gm__m' }, String(m)));
    const cells = ps.map(function (p, i) {
      const c = fixed ? el('span', { class: 'gm__c' })
        : el('button', { type: 'button', class: 'gm__c', 'aria-label': 'Work out ' + m + ' × ' + fmt(p) });
      if (!fixed) c.addEventListener('click', function () { fill(i); });
      grid.appendChild(c);
      return c;
    });
    const sum = el('p', { class: 'gm__sum', 'aria-live': fixed ? null : 'polite' });
    const root = el('div', { class: ['gm', fixed && 'gm--mini'] }, grid);
    let addBtn = null;
    if (!fixed) {
      addBtn = tbtn('Add the parts', 'gm__add', { a: 'add' }, 'plus');
      addBtn.addEventListener('click', add);
      root.appendChild(el('div', { class: 'gm__ctl' }, addBtn));
    }
    root.appendChild(sum);
    if (spec.cap) root.appendChild(el('p', { class: 'ar__cap', html: spec.cap }));
    if (fixed) {
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', 'Grid for ' + m + ' × ' + fmt(spec.n) + ': ' + ps.map(function (p, i) { return m + ' × ' + fmt(p) + (done[i] ? ' = ' + fmt(p * m) : ''); }).join(', ') + (added ? '. Total ' + fmt(spec.n * m) : ''));
    }
    const count = function () { return done.filter(Boolean).length; };
    function paint(popAt) {
      cells.forEach(function (c, i) {
        c.textContent = done[i] ? fmt(ps[i] * m) : '?';
        c.classList.toggle('is-done', done[i]);
        c.classList.toggle('is-ask', !done[i]);
        c.classList.toggle('is-pop', popAt === i && !still());
        if (!fixed) c.disabled = locked || done[i] || !may(can, 'fill');
      });
      const all = count() === ps.length;
      sum.hidden = !added;
      sum.textContent = added ? ps.map(function (p) { return fmt(p * m); }).join(' + ') + ' = ' + fmt(spec.n * m) : '';
      sum.classList.toggle('is-pop', popAt === 'add' && !still());
      if (addBtn) { addBtn.hidden = added; addBtn.disabled = locked || !all || !may(can, 'add'); }
    }
    function fill(i) {
      if (locked || done[i] || !may(can, 'fill')) return false;
      done[i] = true;
      sfx('snap');
      paint(i);
      ev.emit('change', get());
      ev.emit('trade', { act: 'fill', i: i, show: count() });
      return true;
    }
    function add() {
      if (locked || added || count() < ps.length || !may(can, 'add')) return false;
      added = true;
      sfx('ok');
      paint('add');
      ev.emit('change', get());
      ev.emit('trade', { act: 'add' });
      return true;
    }
    function get() { return { show: count(), added: added }; }
    paint(null);
    mount(host, root);
    return {
      el: root, get: get, on: ev.on,
      solve: function () { ps.forEach(function (p, i) { done[i] = true; }); added = true; paint(null); },
      ready: function () { return true; },
      lock: function () { locked = true; paint(null); },
      allow: function (c) { can = c || {}; locked = fixed; paint(null); },
      tip: function () {
        const i = done.indexOf(false);
        if (i >= 0 && !cells[i].disabled) return cells[i];
        return addBtn && !addBtn.disabled && !addBtn.hidden ? addBtn : null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  T.tools.share = share;
  T.tools.gridm = gridm;
  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  kinds.share = function (spec) { return share(null, Object.assign({}, spec, { fixed: true })).el; };
  kinds.gridm = function (spec) { return gridm(null, Object.assign({}, spec, { fixed: true })).el; };
})(window.T = window.T || {});

