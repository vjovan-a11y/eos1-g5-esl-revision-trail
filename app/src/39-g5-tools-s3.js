/* 39-g5-tools-s3.js - Grade 5, Stop 3 (sequences and term rules): the sequence track, the position / term table,
   the rule builder, and their small pictures. Flat, on the light art plate (39-g5-tools-s3.css). Every number is
   exact (MX.Q, 08-g5-models-s3.js): whole numbers, decimals as text ('-0.3') and fractions as text ('1/4').

   T.tools.strack(host, spec)    the sequence track: each term in a box, a hop from one term to the next
       spec = { a: '0.6', d: '-0.3', shown: 1, max: 5, set, pos, mode: 'fit', to, at, unit, cap, mini, fixed }
       a, d         the first term and the step; shown: how many terms are there at the start; max: the most terms
       set          the child sets the step with − and + (it starts at 0); without it the step is d and is shown
       pos          the position (1st, 2nd ...) under each term
       mode 'fit'   the 1st term a and the at-th term `to` are given; the child changes the step until the last hop
                    lands on `to` (all the hops are drawn at once)
       unit         how much one tap on − or + changes the step (default 1, 0.1 for decimals, 1/den for fractions)
       get() -> { n, step: '-0.3', last: '-0.6', hit, moved }; events: 'change', 'trade' { act: 'hop' | 'undo' | 'step' }
       (See it: wait: 'hop', until: { n: 5 }); extras: allow({ hop, undo, step }), restart(), solve({ step, n }), tip()
   T.tools.stable(host, spec)    the table: position over term
       spec = { pos: [1, 2, 3, 4, 10], rule: { k: 3, c: 2 } | sq: { s: 0, c: 0 }, hide: [4], cells: [2, 4], hl, cap, mini }
       rule         term = position x k + c; sq: term = (position + s) x (position + s) + c
       hide         these columns (indexes) show "?"; cells: these columns are answer boxes (class 'blank', data-i)
       get() -> {}
   T.tools.srule(host, spec)     the rule builder: the table with a third row, "Your rule", and two steppers:
       "Multiply the position by k" and "then add c". spec = { pos, rule: { k, c }, far: 10, k0: 1, c0: 0 }
       far: one more column (a far position) that shows its term when the rule fits
       get() -> { k, c, fit, moved }; events: 'change', 'trade' { act: 'mul' | 'add' } (See it: wait: 'mul',
       until: { k: 3 }); extras: allow({ mul, add }), restart(), solve({ k, c }), tip()
   Pictures (T.tools.pic): { k: 'strack', a, d, n, blanks, gaps: [i], labs: 'all' | 'first' | 'ask' | 'none', mark: [i],
   den, pos }, { k: 'stable', ... }, { k: 'smachine', rule: { k, c } | sq: { s, c }, ask, back } the rule as a machine:
   position -> x 3 -> + 2 -> term (back: term -> - 2 -> divide by 3 -> position). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };
  function mount(host, node) { if (host) host.appendChild(node); return node; }
  const still = function () { return !!(T.ui && T.ui.reducedMotion && T.ui.reducedMotion()) || !!(T.fx && T.fx.still && T.fx.still()); };
  const ARC = '<svg class="s3-arc" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path d="M8 30 Q50 -22 92 30"/></svg>';
  const fmtN = function (v) { return window.MX.sg(v); };

  /* ---------- the sequence track ---------- */

  function strack(host, spec) {
    spec = spec || {};
    const Q = window.MX.Q, F = window.MX.F, ord = window.MX.s3.ord, ev = T.tools.emitter();
    const a = Q.p(spec.a), fit = spec.mode === 'fit', fixed = !!spec.fixed;
    const to = fit ? Q.p(spec.to) : null;
    const trueStep = fit ? Q.over(Q.sub(to, a), spec.at - 1) : Q.p(spec.d);
    const set = fit || !!spec.set;
    const unit = spec.unit != null ? Q.p(spec.unit) : trueStep.k === 'frac' ? Q.mk(1, trueStep.d, 'frac') : trueStep.k === 'dec' ? Q.p(Q.dp(trueStep) > 1 ? '0.01' : '0.1') : Q.p(1);
    const units = function (q) { return (q.n * unit.d) / (q.d * unit.n); };                  // q as a number of units
    const lim = Math.max(12, Math.abs(units(trueStep)) + 2);
    const shown = fit ? 1 : Math.max(1, spec.shown || 1);
    const max = fit ? spec.at : Math.max(shown, spec.max || spec.n || shown);
    const den = spec.den || 0;
    if (!Number.isInteger(units(trueStep))) throw new Error('strack: the step must be a whole number of units');
    let stepU = set ? 0 : units(trueStep), hops = fit ? max - 1 : 0;
    let can = spec.can || null, locked = fixed, moved = false, fresh = -1;
    const canDo = function (k) { return !can || !!can[k]; };
    const step = function () { return Q.mk(unit.n * stepU, unit.d, unit.k); };
    const show = function (q) { return den ? F(Q.top(q, den), den) : Q.html(q); };
    const lab = function (q) { return (Q.sign(q) < 0 ? '− ' : '+ ') + show(Q.abs(q)); };

    const track = el('div', { class: 's3-track' });
    const goal = fit ? el('p', { class: 's3-goal' }) : null;
    const say = el('p', { class: 's3-say', 'aria-live': 'polite' });
    const minus = el('button', { type: 'button', class: 'btn tl__btn s3-pm', 'aria-label': 'Step: one less', onclick: function () { change(-1); } }, T.ui.icon('minus'));
    const plus = el('button', { type: 'button', class: 'btn tl__btn s3-pm', 'aria-label': 'Step: one more', onclick: function () { change(1); } }, T.ui.icon('plus'));
    const stepV = el('span', { class: 's3-stepv' });
    const stepper = set ? el('div', { class: 's3-stepper' }, minus, stepV, plus) : null;
    const hopB = fit ? null : el('button', { type: 'button', class: 'btn tl__btn s3-hop', onclick: hop }, el('span', { class: 'btn__label' }, 'Hop'), T.ui.icon('next'));
    const undoB = fit ? null : el('button', { type: 'button', class: 'btn tl__btn s3-undo', 'aria-label': 'Take away the last hop', onclick: undo }, T.ui.icon('replay'));
    const ctl = fixed ? null : el('div', { class: 's3-ctl' }, stepper, hopB ? el('div', { class: 's3-ctl__hop' }, undoB, hopB) : null);
    const root = el('div', { class: ['wb', 's3-root', 's3-strack', spec.mini && 'wb--mini', fit && 's3-strack--fit'] }, goal, track, fixed ? null : say, ctl);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    // the terms on the track now: the terms that are given, then one for each hop with the step of this moment
    function terms() {
      const t = [a];
      if (fixed || !fit) {
        const d0 = Q.p(spec.d), n0 = fixed ? (spec.n != null ? spec.n : shown) : shown;
        for (let i = 1; i < n0; i++) t.push(Q.add(t[i - 1], d0));
        if (fixed) return t;
      }
      const st = step();
      for (let i = 0; i < hops; i++) t.push(Q.add(t[t.length - 1], st));
      return t;
    }

    function cell(i, body, cls, hopLab, cols) {
      const rowStart = i > 0 && i % cols === 0;
      const c = el('div', { class: ['s3-cell', rowStart && 'is-rowstart', i === fresh && !still() && 'is-new'] });
      const h = el('div', { class: 's3-hopbox' });
      if (i > 0 && hopLab !== null) { h.innerHTML = ARC + '<span class="s3-arrow" aria-hidden="true"></span><span class="s3-lab">' + (hopLab || '') + '</span>'; }
      c.appendChild(h);
      c.appendChild(el('div', { class: ['s3-bub'].concat(cls || []), html: body }));
      if (spec.pos) c.appendChild(el('div', { class: 's3-pos' }, ord(i + 1)));
      return c;
    }

    function draw() {
      const t = terms(), gaps = spec.gaps || [], marks = spec.mark || [], blanks = fixed ? spec.blanks || 0 : fit ? 0 : max - t.length;
      const total = t.length + blanks, cols = Math.min(total, 6), st = step(), labs = spec.labs || 'all';
      const zeroStep = set && stepU === 0;
      T.ui.empty(track);
      track.style.setProperty('--s3-cols', String(cols));
      const hopText = function (i) {                                  // the words over the hop into cell i
        if (labs === 'none' || i === 0) return null;
        if (labs === 'ask') return '?';
        if (labs === 'first' && i > 1) return '';
        if (!fixed && set && i < shown && stepU !== units(trueStep)) return '?';   // the child finds the step of the given terms
        return lab(fixed ? Q.p(spec.d) : i < shown ? Q.p(spec.d) : st);
      };
      t.forEach(function (q, i) {
        const hid = gaps.indexOf(i) >= 0, last = fit && i === max - 1, wait = fit && zeroStep && i > 0;
        const cls = [Q.sign(q) < 0 && !hid && !wait && 'is-neg', Q.sign(q) === 0 && !hid && !wait && 'is-zero', (hid || wait) && 'is-ask', marks.indexOf(i) >= 0 && 'is-mark',
          last && !zeroStep && (Q.eq(q, to) ? 'is-hit' : 'is-miss'), !fixed && i >= shown && 'is-made'];
        track.appendChild(cell(i, hid || wait ? '?' : show(q), cls, wait ? '?' : hopText(i), cols));
      });
      for (let j = 0; j < blanks; j++) track.appendChild(cell(t.length + j, '?', ['is-ask'], fixed ? (labs === 'all' ? lab(Q.p(spec.d)) : labs === 'ask' ? '?' : labs === 'none' ? null : '') : set ? '' : lab(st), cols));
      if (fixed) {
        root.setAttribute('role', 'img');
        root.setAttribute('aria-label', 'A sequence: ' + t.map(function (q, i) { return gaps.indexOf(i) >= 0 ? 'a missing term' : Q.txt(q); }).join(', ') + (blanks ? ', and ' + blanks + ' more to find' : '') +
          (labs === 'all' || labs === 'first' ? '. Each step: ' + (Q.sign(Q.p(spec.d)) < 0 ? 'subtract ' : 'add ') + Q.txt(Q.abs(Q.p(spec.d))) : ''));
        return;
      }
      if (goal) goal.innerHTML = 'Goal: the ' + ord(max) + ' term is <b>' + Q.html(to) + '</b>';
      if (stepper) {
        stepV.innerHTML = 'Step: <b>' + (stepU === 0 ? '0' : lab(st)) + '</b>';
        minus.disabled = locked || !canDo('step') || stepU <= -lim;
        plus.disabled = locked || !canDo('step') || stepU >= lim;
      }
      if (hopB) {
        hopB.disabled = locked || !canDo('hop') || zeroStep || t.length >= max;
        undoB.disabled = locked || !canDo('undo') || hops === 0;
      }
      const lastQ = t[t.length - 1];
      if (fit) say.innerHTML = zeroStep ? 'Choose a step with − and +.' : Q.eq(lastQ, to) ? 'The last hop lands on <b>' + Q.html(to) + '</b>. The step fits!'
        : 'The last hop lands on <b>' + Q.html(lastQ) + '</b>: ' + (Q.cmp(Q.abs(Q.sub(lastQ, a)), Q.abs(Q.sub(to, a))) > 0 && Q.sign(Q.sub(lastQ, a)) === Q.sign(Q.sub(to, a)) ? 'too far.' : 'not far enough.');
      else say.innerHTML = zeroStep ? 'Find the step. Set it with − and +.' : t.length >= max ? 'The track is full: ' + t.length + ' terms.' : hops === 0 ? 'Tap <b>Hop</b> to make the next term.' : 'Now at <b>' + Q.html(lastQ) + '</b>' + (Q.sign(lastQ) < 0 ? ': below zero.' : '.');
    }

    function emit(act) {
      moved = true;
      draw(); fresh = -1;
      ev.emit('change', get());
      ev.emit('trade', Object.assign({ act: act }, get()));
    }
    function nudge() { sfx('no'); track.classList.remove('is-shake'); void track.offsetWidth; track.classList.add('is-shake'); }
    function hop() {
      if (locked || !canDo('hop') || fit) return false;
      if ((set && stepU === 0) || shown + hops >= max) { nudge(); return false; }
      hops++; fresh = shown + hops - 1;
      sfx('boing');
      emit('hop');
      return true;
    }
    function undo() {
      if (locked || !canDo('undo') || fit || hops === 0) return false;
      hops--; sfx('pop'); emit('undo');
      return true;
    }
    function change(dv) {
      if (locked || !canDo('step') || !set) return false;
      if (Math.abs(stepU + dv) > lim) { nudge(); return false; }
      stepU += dv; sfx('tick'); emit('step');
      return true;
    }
    function get() {
      const t = terms(), lastQ = t[t.length - 1];
      return { n: t.length, step: Q.isFrac(step()) ? Q.txt(step()).replace('−', '-') : Q.raw(step()), last: Q.isFrac(lastQ) ? Q.txt(lastQ).replace('−', '-') : Q.raw(lastQ),
        hit: fit ? stepU !== 0 && Q.eq(lastQ, to) : shown + hops >= max, moved: moved };
    }

    draw();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, hop: hop, undo: undo, step: change,
      allow: function (c) { can = c || {}; locked = fixed; draw(); },
      restart: function () { hops = fit ? max - 1 : 0; stepU = set ? 0 : units(trueStep); moved = false; draw(); },
      solve: function (right) {
        if (!right) return;
        if (right.step != null && set) stepU = units(Q.p(right.step));
        if (right.n != null && !fit) hops = Math.max(0, Math.min(max, right.n) - shown);
        moved = true; draw(); ev.emit('change', get());
      },
      tip: function () {
        if (locked) return null;
        const want = units(trueStep);
        if (set && stepU !== want && canDo('step')) return stepU < want ? plus : minus;
        return hopB && !hopB.disabled ? hopB : null;
      },
      lock: function () { locked = true; draw(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ---------- the position / term table and the rule builder ---------- */

  function table(host, spec, build) {
    spec = spec || {};
    const ev = T.tools.emitter(), fixed = !!spec.fixed;
    const R = spec.rule || null, S = spec.sq || null;
    const f = function (p) { return S ? (p + (S.s || 0)) * (p + (S.s || 0)) + (S.c || 0) : R.k * p + (R.c || 0); };
    const far = build && spec.far ? spec.far : 0;
    const pos = (spec.pos || [1, 2, 3, 4]).concat(far ? [far] : []);
    const hide = spec.hide || [], cells = (spec.cells || []).slice().sort(function (x, y) { return x - y; });
    let k = build ? spec.k0 || 1 : 0, c = build ? spec.c0 || 0 : 0, can = spec.can || null, locked = fixed, moved = false;
    const canDo = function (key) { return !can || !!can[key]; };
    const mine = function (p) { return k * p + c; };
    const fits = function () { return pos.every(function (p) { return mine(p) === f(p); }); };

    const grid = el('div', { class: 's3-tbl' });
    const say = build ? el('p', { class: 's3-say', 'aria-live': 'polite' }) : null;
    const pm = function (cls, name, icon, fn) { return el('button', { type: 'button', class: 'btn tl__btn s3-pm ' + cls, 'aria-label': name, onclick: fn }, T.ui.icon(icon)); };
    const kMinus = pm('s3-kminus', 'Multiply by one less', 'minus', function () { change('mul', -1); }), kPlus = pm('s3-kplus', 'Multiply by one more', 'plus', function () { change('mul', 1); });
    const cMinus = pm('s3-cminus', 'One less', 'minus', function () { change('add', -1); }), cPlus = pm('s3-cplus', 'One more', 'plus', function () { change('add', 1); });
    const kV = el('span', { class: 's3-rulev' }), cV = el('span', { class: 's3-rulev' });
    const ctl = build ? el('div', { class: 's3-rule' },
      el('div', { class: 's3-rule__row' }, kMinus, kV, kPlus),
      el('div', { class: 's3-rule__row' }, cMinus, cV, cPlus)) : null;
    const root = el('div', { class: ['wb', 's3-root', 's3-stable', build && 's3-stable--build', spec.mini && 'wb--mini'] }, grid, say, ctl);
    if (spec.cap) root.appendChild(el('p', { class: 'wb__cap', html: spec.cap }));

    function draw() {
      const ok = build && fits();
      // a narrow column with dots where positions are left out (4 ... 10)
      const colsT = ['auto'];
      pos.forEach(function (p, i) { if (i > 0 && p - pos[i - 1] > 1) colsT.push('minmax(.75rem, 1.25rem)'); colsT.push('minmax(0, 1fr)'); });
      grid.style.gridTemplateColumns = colsT.join(' ');
      T.ui.empty(grid);
      const row = function (name, cls, make) {
        grid.appendChild(el('div', { class: ['s3-th', cls] }, name));
        pos.forEach(function (p, i) {
          if (i > 0 && p - pos[i - 1] > 1) grid.appendChild(el('div', { class: 's3-dots', 'aria-hidden': 'true' }, '…'));
          grid.appendChild(make(p, i));
        });
      };
      row('Position', 's3-th--pos', function (p, i) { return el('div', { class: ['s3-td', 's3-td--pos', spec.hl === i && 'is-hl'] }, fmtN(p)); });
      row('Term', 's3-th--term', function (p, i) {
        const ci = cells.indexOf(i);
        if (ci >= 0) return el('div', { class: 's3-td s3-td--cell' }, el('button', { type: 'button', class: 'blank blank--tcell', dataset: { i: ci } }));
        const ask = hide.indexOf(i) >= 0 || (far && i === pos.length - 1 && !ok);
        return el('div', { class: ['s3-td', ask && 'is-ask', spec.hl === i && 'is-hl', far && i === pos.length - 1 && ok && 'is-far'] }, ask ? '?' : fmtN(f(p)));
      });
      if (build) row('Your rule', 's3-th--try', function (p, i) {
        const good = mine(p) === f(p);
        return el('div', { class: ['s3-td', 's3-td--try', good ? 'is-ok' : 'is-off'] }, fmtN(mine(p)), good ? T.ui.icon('check') : null);
      });
      if (fixed || !build) {
        if (fixed) { root.setAttribute('role', 'img'); root.setAttribute('aria-label', 'A table. ' + pos.map(function (p, i) { return 'Position ' + p + ': ' + (hide.indexOf(i) >= 0 ? 'not shown' : 'term ' + f(p)); }).join('. ')); }
        return;
      }
      kV.innerHTML = 'Multiply the position by <b>' + k + '</b>';
      cV.innerHTML = c < 0 ? 'then subtract <b>' + (-c) + '</b>' : 'then add <b>' + c + '</b>';
      kMinus.disabled = locked || !canDo('mul') || k <= 1; kPlus.disabled = locked || !canDo('mul') || k >= 12;
      cMinus.disabled = locked || !canDo('add') || c <= -12; cPlus.disabled = locked || !canDo('add') || c >= 12;
      say.innerHTML = ok ? 'Your rule fits every term!' + (far ? ' The ' + window.MX.s3.ord(far) + ' term is <b>' + fmtN(f(far)) + '</b>.' : '')
        : 'Your rule gives ' + pos.slice(0, far ? -1 : pos.length).map(function (p) { return fmtN(mine(p)); }).join(', ') + '.';
      root.classList.toggle('is-fit', ok);
    }

    function change(what, dv) {
      if (locked || !build || !canDo(what)) return false;
      const nk = what === 'mul' ? k + dv : k, nc = what === 'add' ? c + dv : c;
      if (nk < 1 || nk > 12 || nc < -12 || nc > 12) { sfx('no'); return false; }
      k = nk; c = nc; moved = true;
      sfx(fits() ? 'chime' : 'tick');
      draw();
      ev.emit('change', get());
      ev.emit('trade', Object.assign({ act: what }, get()));
      return true;
    }
    function get() { return build ? { k: k, c: c, fit: fits(), moved: moved } : {}; }

    draw();
    mount(host, root);
    return {
      el: root, on: ev.on, get: get, change: change,
      allow: function (cn) { can = cn || {}; locked = fixed; if (build) draw(); },
      restart: function () { k = spec.k0 || 1; c = spec.c0 || 0; moved = false; draw(); },
      solve: function (right) { if (!build || !right) return; k = right.k; c = right.c || 0; moved = true; draw(); ev.emit('change', get()); },
      tip: function () {
        if (!build || locked) return null;
        if (R && k !== R.k && canDo('mul')) return k < R.k ? kPlus : kMinus;
        if (R && c !== (R.c || 0) && canDo('add')) return c < (R.c || 0) ? cPlus : cMinus;
        return null;
      },
      lock: function () { locked = true; root.classList.add('is-locked'); if (build) draw(); },
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }
  function stable(host, spec) { return table(host, spec, false); }
  function srule(host, spec) { return table(host, spec, true); }

  /* ---------- the rule as a machine (a picture): position -> x 3 -> + 2 -> term ---------- */

  function smachine(spec) {
    const R = spec.rule, S = spec.sq, steps = [];
    if (S) {
      if (S.s) steps.push('+ ' + S.s);
      steps.push('× itself');
      if (S.c) steps.push((S.c > 0 ? '+ ' : '− ') + Math.abs(S.c));
    } else if (R) {
      steps.push('× ' + fmtN(R.k));
      if (R.c) steps.push((R.c > 0 ? '+ ' : '− ') + fmtN(Math.abs(R.c)));
    }
    // back: the same machine run backwards, from the term to the position, with the opposite of each step
    const back = !!spec.back && !!R && !S;
    const inv = back ? (R.c ? [(R.c > 0 ? '− ' : '+ ') + fmtN(Math.abs(R.c))] : []).concat(['÷ ' + fmtN(R.k)]) : null;
    const shown = back ? inv : spec.ask ? steps.map(function () { return '?'; }) : steps;
    const box = el('div', { class: ['s3-mach', back && 's3-mach--back'], role: 'img',
      'aria-label': back ? 'Work backwards: start with the term, then ' + inv.join(', then ') + ', to get the position.'
        : spec.ask ? 'A rule machine: position, then a rule to find, then term.' : 'A rule machine: position, then ' + steps.join(', then ') + ', gives the term.' });
    const arrow = function () { return el('span', { class: 's3-mach__ar', 'aria-hidden': 'true' }, '→'); };
    const end = function (name, term) { return el('span', { class: ['s3-mach__end', term && 's3-mach__end--term'] }, name); };
    box.appendChild(back ? end('term', true) : end('position'));
    shown.forEach(function (st) { box.appendChild(arrow()); box.appendChild(el('b', { class: ['s3-mach__op', spec.ask && !back && 'is-ask'] }, st)); });
    box.appendChild(arrow());
    box.appendChild(back ? end('position') : end('term', true));
    return box;
  }

  /* ---------- the small pictures ---------- */

  const kinds = T.tools.picKinds;
  kinds.strack = function (spec) { return strack(null, Object.assign({ mini: true }, spec, { fixed: true })).el; };
  kinds.stable = function (spec) { return stable(null, Object.assign({ mini: true }, spec, { fixed: true, cells: null })).el; };
  kinds.smachine = smachine;

  // Zip's first line when a question opens with one of these tools (54-g5-glue.js)
  T.G5_DO = Object.assign(T.G5_DO || {}, {
    strack: { en: 'Set the *step* with − and +. Watch the hops.', vi: 'Chọn *bước nhảy* bằng nút − và +. Quan sát các bước nhảy.' },
    stable: { en: 'Look at the table. Fill in the boxes.', vi: 'Em hãy nhìn bảng. Điền số vào các ô trống.' },
    srule: { en: 'Change the *rule* with − and +.', vi: 'Thay đổi *quy luật* bằng nút − và +.' }
  });

  T.tools = Object.assign(T.tools || {}, { strack: strack, stable: stable, srule: srule });
})(window.T = window.T || {});

