/* 39-g5-tools-s2.js - Grade 5, Stop 2 (round, add and subtract decimals): the decimal rounding line and the column
   tool for adding and subtracting decimals, with their small pictures. Flat, on the light art plate
   (39-g5-tools-s2.css). The numbers are text ('6.38') and are kept exact as thousandths (MX.D).

   T.tools.dround(host, spec)   a number line between two tenths or two whole numbers; the child taps the nearer end
       spec = { n: '6.38', to: 'whole' | 'tenth', mid: true, show: true | 'lo' | 'hi', from: '6', fixed, mini, cap }
       n            the number on the line (no n: an empty line that starts at `from`)
       mid          the halfway mark is shown from the start; show: the end that n rounds to is chosen (pictures)
       get() -> { choice: '6' | '', mid: true | false }
       events: 'change', 'trade' { act: 'mid' } and { act: 'pick', choice } (See it: wait: 'pick', until: { choice: '3.5' })
       extras: allow({ mid: true, pick: true | '3.5' }), reveal('mid'), solve({ choice }), tip(), restart()
   T.tools.dcol(host, spec)     two decimals in columns: line up the decimal points, write 0 as a place holder, then
                                add or subtract column by column (carry, exchange)
       spec = { a: '5.3', b: '2.47', op: '+' | '-', cells: true, fixed, mini, cap,
                lined: false, zeros: false, ans: true, done: 2, shown: '2.97' }      (the last five: pictures)
       cells        the child types each digit of the answer in its column (answer boxes, class 'blank', from the right);
                    without it the one button does every step: Line up, Write 0, Exchange, Add / Subtract a column
       get() -> { lined, zeros, done, complete, ans }    (done: columns worked out; ans: '2.83' when complete)
       events: 'change', 'trade' { act: 'line' | 'zero' | 'exchange' | 'col', done }
       extras: allow({ line, zero, exchange, col }), solve({ lined, zeros, done }), restart(), tip()
   T.tools.dpick(host, spec)    the ring-all tool `pickall` (spec = { nums }, get() -> { picks }), with a 'change'
                                event when solve() shows the answer
   Pictures (T.tools.pic): { k: 'dround', ... } and { k: 'dcol', a, b, op, ans: true } (the finished working),
   { k: 'dcol', ..., lined: false, shown: '2.49' } (a wrong answer under numbers that are not lined up). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const still = function () { return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion()); };
  const canDo = function (can, k) { return !can || !!can[k]; };
  function replay(node, cls) { if (!node || still()) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }

  /* ---------- the decimal rounding line ---------- */

  const X0 = 13, X1 = 87;                      // the line runs from 13% to 87% of the tool's width
  function dround(host, spec) {
    spec = spec || {};
    const D = window.MX.D, ev = T.tools.emitter();
    const whole = spec.to === 'whole', u = whole ? 1000 : 100, dp = whole ? 0 : 1, fixed = !!spec.fixed;
    const has = spec.n != null, t = has ? D.p(spec.n) : NaN;
    const lo = has ? Math.floor(t / u) * u : D.p(spec.from || 0), hi = lo + u, half = lo + u / 2;
    const ends = [D.s(lo, dp), D.s(hi, dp)], midText = D.s(half, dp + 1);
    const right = has ? ends[t - lo >= u / 2 ? 1 : 0] : '';
    const frac = has ? (t - lo) / u : 0, xOf = function (f) { return X0 + (X1 - X0) * f; };
    let choice = spec.show ? (spec.show === 'lo' ? ends[0] : spec.show === 'hi' ? ends[1] : right) : '';
    let midOn = !!spec.mid, locked = fixed, can = spec.can || null;

    const track = el('div', { class: 'drl__track' });
    track.appendChild(el('span', { class: 'drl__line', style: 'left:' + X0 + '%;right:' + (100 - X1) + '%' }));
    const run = track.appendChild(el('span', { class: 'drl__run' }));
    for (let i = 0; i <= 10; i++) track.appendChild(el('span', { class: ['drl__tick', (i === 0 || i === 10) && 'is-end', i === 5 && 'is-mid'], style: 'left:' + xOf(i / 10) + '%' }));
    const midLab = track.appendChild(el('span', { class: 'drl__half', style: 'left:' + xOf(0.5) + '%' }, el('b', midText), el('i', 'halfway')));
    const pin = has ? track.appendChild(el('span', { class: 'drl__pin', style: 'left:' + xOf(frac) + '%' }, el('b', String(spec.n)))) : null;
    const endBtns = ends.map(function (label, i) {
      const b = el(fixed ? 'span' : 'button', { class: 'drl__end', style: 'left:' + xOf(i) + '%', dataset: { v: label } }, label);
      if (!fixed) { b.type = 'button'; b.addEventListener('click', function () { pick(label, b); }); }
      return track.appendChild(b);
    });
    const midBtn = fixed ? null : el('button', { type: 'button', class: 'btn tl__btn drl__midbtn', onclick: function () { showMid(true); } }, T.ui.icon('bulb'), el('span', { class: 'btn__label' }, 'Halfway'));
    const root = el('div', { class: ['wb', 'wb--dround', spec.mini && 'wb--mini', whole ? 'drl--whole' : 'drl--tenth'] }, track, midBtn ? el('div', { class: 'sl__ctl' }, midBtn) : null);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));
    if (fixed) {
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', 'A number line from ' + ends[0] + ' to ' + ends[1] + '.' + (has ? ' ' + spec.n + ' is marked.' : '') + (midOn ? ' Halfway is ' + midText + '.' : '') + (choice ? ' It rounds to ' + choice + '.' : ''));
    } else track.setAttribute('aria-label', 'A number line from ' + ends[0] + ' to ' + ends[1] + (has ? '. ' + spec.n + ' is marked.' : '.'));

    const want = function () { return can && typeof can.pick === 'string' ? can.pick : null; };
    function paint(fresh) {
      root.classList.toggle('is-mid', midOn);
      midLab.hidden = !midOn;
      endBtns.forEach(function (b) {
        const on = b.dataset.v === choice;
        b.classList.toggle('is-on', on);
        if (!fixed) { b.disabled = locked || !canDo(can, 'pick'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
      });
      // the part of the line between the number and the end it rounds to
      const to = choice === ends[0] ? 0 : 1, a = Math.min(frac, to), b = Math.max(frac, to);
      run.hidden = !choice || !has;
      run.style.left = xOf(a) + '%'; run.style.width = (X1 - X0) * (b - a) + '%';
      run.style.transformOrigin = (to === 0 ? 'right' : 'left') + ' center';
      if (fresh && choice) replay(run, 'is-new');
      if (midBtn) { midBtn.disabled = locked || midOn || !canDo(can, 'mid'); }
    }
    function pick(label, btn) {
      if (locked || !canDo(can, 'pick')) return false;
      if (want() != null && label !== want()) { sfx('no'); replay(btn, 'is-shake'); return false; }
      choice = label;
      sfx('slide');
      paint(true);
      ev.emit('change', get());
      ev.emit('trade', { act: 'pick', choice: choice });
      return true;
    }
    function showMid(byChild) {
      if (byChild && (locked || !canDo(can, 'mid'))) return;
      const was = midOn;
      midOn = true;
      paint(false);
      if (!was) replay(midLab, 'is-new');
      if (byChild) { sfx('pop'); ev.emit('change', get()); ev.emit('trade', { act: 'mid' }); }
    }
    function get() { return { choice: choice, mid: midOn }; }

    paint(false);
    mount(host, root);
    return {
      el: root, on: ev.on, get: get,
      pick: function (label) { return pick(label, endBtns.filter(function (b) { return b.dataset.v === label; })[0]); },
      ready: function () { return !!choice; },
      reveal: function (what) { if (!what || what === 'mid') showMid(false); },
      solve: function (r) { if (r && typeof r.choice === 'string') { choice = r.choice; midOn = true; paint(true); ev.emit('change', get()); } },
      set: function (r) { if (r && typeof r.choice === 'string') { choice = r.choice; paint(false); } },
      restart: function () { choice = ''; midOn = !!spec.mid; paint(false); },
      allow: function (c) { can = c || {}; locked = fixed; paint(false); },
      lock: function () { locked = true; paint(false); },
      tip: function () {
        if (locked) return null;
        if (midBtn && !midBtn.disabled && (!can || can.mid)) return midBtn;              // "Tap Halfway" (never an end that may be wrong)
        const w = want();
        const open = endBtns.filter(function (b) { return !b.disabled; });
        return (w != null ? open.filter(function (b) { return b.dataset.v === w; })[0] : open[0]) || null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the column tool: add and subtract decimals ---------- */

  const GO = { line: 'Line up the points', zero: 'Write 0', exchange: 'Exchange' };
  function dcol(host, spec) {
    spec = spec || {};
    const MX = window.MX, D = MX.D, ev = T.tools.emitter();
    const op = spec.op === '-' ? '-' : '+', W = MX.dwork(spec.a, spec.b, op), n = W.cols.length, fixed = !!spec.fixed, cells = !!spec.cells && !fixed;
    const onesAt = W.cols.findIndex(function (p) { return p.k === 'o'; });
    const shiftA = W.dp - W.dpa, shiftB = W.dp - W.dpb;                 // how far a number sits to the right before it is lined up
    const needLine = shiftA !== shiftB, needZero = W.padA.some(Boolean) || W.padB.some(Boolean);
    let lined, zeros, done, exd, locked = fixed, can = spec.can || null;
    let said = false;
    function reset() {
      lined = fixed ? spec.lined !== false : !needLine;
      zeros = fixed ? lined && spec.zeros !== false : !needZero;
      done = fixed ? (spec.ans ? W.steps.length : Math.min(spec.done || 0, W.steps.length)) : 0;
      exd = false;
    }
    reset();

    const sheet = el('div', { class: 'dcl__sheet', style: '--n:' + n, role: fixed ? null : 'group', 'aria-label': fixed ? null : spec.a + (op === '+' ? ' plus ' : ' minus ') + spec.b + ', written in columns' });
    const rowOf = function (cls, sign) {
      const num = el('div', { class: 'dcl__num' });
      sheet.appendChild(el('div', { class: ['dcl__row', cls] }, el('span', { class: 'dcl__sign', 'aria-hidden': 'true' }, sign || ''), num));
      return num;
    };
    const cellsOf = function (num, cls) { return W.cols.map(function () { return num.appendChild(el('span', { class: ['dcl__c', cls] })); }); };
    const head = cellsOf(rowOf('dcl__row--head'), 'dcl__h');
    W.cols.forEach(function (p, j) { head[j].classList.add('p-' + p.k); head[j].textContent = p.ab; head[j].title = p.col; });
    const marks = cellsOf(rowOf('dcl__row--marks'), 'dcl__m');
    const numA = rowOf('dcl__row--a'), cA = cellsOf(numA);
    const numB = rowOf('dcl__row--b', op === '+' ? '+' : '−'), cB = cellsOf(numB);
    sheet.appendChild(el('div', { class: 'dcl__rule' }));
    const numR = rowOf('dcl__row--ans'), cR = [];
    // the answer row: in `cells` mode one answer box per digit, made from the right (the pad moves on to the left)
    const boxAt = {};
    if (cells) {
      let i = 0;
      for (let j = n - 1; j >= 0; j--) {
        if (W.ansDigits[j] == null) continue;
        const b = el('button', { type: 'button', class: 'blank blank--cell', dataset: { i: i++ } });
        boxAt[j] = numR.appendChild(el('span', { class: ['dcl__c', 'dcl__c--box', j === onesAt && j < n - 1 && 'has-pt'], style: 'grid-row:1;grid-column:' + (j + 1) }, b));
      }
    } else W.cols.forEach(function (p, j) { cR.push(numR.appendChild(el('span', { class: 'dcl__c dcl__r', style: 'grid-row:1;grid-column:' + (j + 1) }))); });
    const ptLine = sheet.appendChild(el('span', { class: 'dcl__ptline', 'aria-hidden': 'true', style: '--at:' + (onesAt + 1) }));
    const now = el('p', { class: 'dcl__now', 'aria-live': 'polite' });
    const go = fixed ? null : el('button', { type: 'button', class: 'btn tl__btn dcl__go', onclick: act }, el('span', { class: 'btn__label' }, ''));
    // the button sits beside the working (under it when there is no room), so it is in view on a phone
    const root = el('div', { class: ['wb', 'wb--dcol', spec.mini && 'wb--mini', cells && 'dcl--cells'] },
      el('div', { class: 'dcl__top' }, sheet, go ? el('div', { class: 'dcl__side' }, go) : null), fixed ? null : now);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    // what the one button does next
    function next() {
      if (!lined) return 'line';
      if (!zeros) return 'zero';
      if (cells || done >= W.steps.length) return null;
      return W.steps[done].need && !exd ? 'exchange' : 'col';
    }
    function digits(cs, ds, pad, dpx, isTop) {
      const eff = op === '-' && isTop ? (exd ? W.steps[done].eff : done > 0 ? W.steps[done - 1].eff : null) : null;
      cs.forEach(function (c, j) {
        const zero = pad[j] && lined;
        c.textContent = ds[j] != null ? String(ds[j]) : zero && zeros ? '0' : '';
        c.classList.toggle('is-zero', zero && zeros);
        c.classList.toggle('is-hole', zero && !zeros);
        // the decimal point: after the ones (a whole number gets its point with its zeros)
        c.classList.toggle('has-pt', j === onesAt && j < n - 1 && (dpx > 0 || (lined && zeros)));
        if (isTop) {
          const orig = ds[j] || 0, v = eff ? eff[j] : orig, changed = v !== orig;
          c.classList.toggle('is-x', changed);
          marks[j].textContent = changed ? String(v) : '';
          marks[j].classList.toggle('is-ex', changed);
        }
      });
    }
    function paint(what) {
      numA.style.setProperty('--shift', lined ? 0 : shiftA);
      numB.style.setProperty('--shift', lined ? 0 : shiftB);
      root.classList.toggle('is-lined', lined);
      root.classList.toggle('is-set', lined && zeros);
      digits(cA, W.A, W.padA, W.dpa, true);
      digits(cB, W.B, W.padB, W.dpb, false);
      if (op === '+') {
        marks.forEach(function (m) { m.textContent = ''; m.classList.remove('is-carry'); });
        W.steps.slice(0, done).forEach(function (s) { if (s.cout && s.j - 1 >= W.first) { marks[s.j - 1].textContent = '1'; marks[s.j - 1].classList.add('is-carry'); } });
      }
      if (!cells) {
        const shown = spec.shown != null ? String(spec.shown) : null;
        cR.forEach(function (c) { c.textContent = ''; c.classList.remove('has-pt', 'is-new'); });
        if (shown != null) {
          // a (wrong) answer as it was written: by place when the numbers are lined up, else pushed to the right
          const parts = shown.replace(/,/g, '').split('.'), ds = (parts[0] + (parts[1] || '')).split(''), end = lined ? onesAt + (parts[1] || '').length : n - 1;
          ds.forEach(function (ch, i) { const j = end - (ds.length - 1 - i); if (cR[j]) { cR[j].textContent = ch; if (i === parts[0].length - 1 && parts[1]) cR[j].classList.add('has-pt'); } });
          root.classList.add('is-wrong');
        } else {
          W.steps.slice(0, done).forEach(function (s, i) { cR[s.j].textContent = String(s.res); if (what === 'col' && i === done - 1) replay(cR[s.j], 'is-new'); });
          if (done >= W.steps.length && W.lastCarry && cR[W.first - 1]) cR[W.first - 1].textContent = String(W.lastCarry);
          if (done > 0 && onesAt < n - 1) cR[onesAt].classList.add('has-pt');
        }
      }
      root.classList.toggle('no-marks', fixed && marks.every(function (m) { return !m.textContent; }));   // a picture with no carry or exchange
      Object.keys(boxAt).forEach(function (j) { boxAt[j].firstChild.disabled = locked || !(lined && zeros); });
      const k = locked ? null : next();
      if (go) {
        go.classList.toggle('is-off', !k);                 // its room is kept, so the working does not jump
        go.disabled = !k || !canDo(can, k);
        if (k) go.firstChild.textContent = GO[k] || (op === '+' ? 'Add the ' : 'Subtract the ') + W.cols[W.steps[done].j].many;
      }
      if (!fixed && (what || what === '' && !said)) { now.textContent = say(what); said = !!what; }   // the last sentence stays while a step is closed
      if (fixed) {
        root.setAttribute('role', 'img');
        root.setAttribute('aria-label', spec.a + (op === '+' ? ' plus ' : ' minus ') + spec.b + ' in columns' + (lined ? ', the decimal points in a line.' : ', the decimal points not in a line.') +
          (spec.shown != null ? ' The answer written is ' + spec.shown + '.' : done >= W.steps.length ? ' The answer is ' + W.ansText + '.' : ''));
      }
    }
    // one short sentence about what has just happened (and what to do in `cells` mode)
    function say(what) {
      if (what === 'line') return 'The decimal points are in a line.';
      if (what === 'zero') return cells ? 'A 0 holds the empty place. Now ' + (op === '+' ? 'add' : 'subtract') + ', from the right.' : 'A 0 holds the empty place.';
      if (what === 'exchange') return W.steps[done].exSay;
      if (what === 'col') { const s = W.steps[done - 1]; return W.cols[s.j].col + ': ' + s.say + (done >= W.steps.length ? ' The answer is ' + W.ansText + '.' : ''); }
      if (!lined) return 'The decimal points are not in a line.';
      if (!zeros) return 'One place is empty.';
      return cells ? 'Now ' + (op === '+' ? 'add' : 'subtract') + '. Start on the right.' : '';
    }
    function act() {
      const k = next();
      if (locked || !k || !canDo(can, k)) return false;
      if (k === 'line') lined = true;
      else if (k === 'zero') zeros = true;
      else if (k === 'exchange') exd = true;
      else { done++; exd = false; }
      sfx(k === 'line' ? 'slide' : k === 'exchange' ? 'pop' : 'snap');
      paint(k);
      ev.emit('change', get());
      ev.emit('trade', { act: k, done: done });
      return true;
    }
    function get() {
      const complete = lined && zeros && !cells && done >= W.steps.length;
      return { lined: lined, zeros: zeros, done: done, complete: complete, ans: complete ? W.ansText : '' };
    }

    paint('');
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, act: act,
      ready: function () { return lined && zeros; },
      solve: function (r) {
        if (!r) return;
        if (r.lined) lined = true;
        if (r.zeros) zeros = lined;
        if (typeof r.done === 'number' && !cells) { done = Math.min(r.done, W.steps.length); exd = false; }
        paint('');
        ev.emit('change', get());
      },
      restart: function () { reset(); said = false; paint(''); },
      allow: function (c) { can = c || {}; locked = fixed; paint(''); },
      lock: function () { locked = true; paint(''); },
      tip: function () {
        if (locked) return null;
        if (go && !go.disabled) return go;
        return cells && lined && zeros ? root.querySelector('.blank:not(.is-filled)') : null;
      },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- ring every number that fits: the pickall tool of 39-tools-order.js, which also says 'change' when
     solve() shows the answer (the question's own ready() test is asked again) ---------- */

  function dpick(host, spec) {
    const t = T.tools.pickall(host, spec), fns = [];
    return Object.assign({}, t, {
      on: function (name, fn) { if (name === 'change') fns.push(fn); return t.on(name, fn); },
      solve: function (r) { t.solve(r); fns.forEach(function (fn) { fn(t.get()); }); }
    });
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds;
  kinds.dround = function (spec) { return dround(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  kinds.dcol = function (spec) { return dcol(null, Object.assign({ mini: true }, spec, { fixed: true, cells: false })).el; };

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    dround: { en: 'Tap the *nearer* end of the line.', vi: 'Bấm vào đầu *gần hơn* của trục số.' },
    dcol: { en: '*Line up* the decimal points first.', vi: 'Trước tiên, *đặt thẳng cột* các dấu thập phân.' },
    dpick: { en: 'Tap *every* number that fits.', vi: 'Bấm vào *tất cả* các số phù hợp.' }
  });

  T.tools = Object.assign(T.tools || {}, { dround: dround, dcol: dcol, dpick: dpick });
})(window.T = window.T || {});

