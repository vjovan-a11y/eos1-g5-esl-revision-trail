/* 79-summit.js - the Summit (Session 14): the end of the trail, after Stop 9. Words in T.SUMMIT (19-summit-text.js).

   Routes:
     summit             a hub-like page: the Summit scene (13-art-summit.js), Zip's line, three cards (Final test, Big
                        Lightning round, My certificate) and ONE main button to the next thing to do. Locked kindly
                        until the Mini Practice tests of 7 of the 9 stops are done (v2 asked for every mini test first;
                        the main button then leads to the next stop whose test is still to do).
     summit-test        the final test, like the real test: Paper 1 and Paper 2 (79-summit-build.js chooses the questions:
                        14 numbered questions and 20 marks each, every objective, the DOK and strand mix), drawn and marked
                        by the Mini test's paper (71-test-paper.js: the label code, DOK, TWM; Mark my paper; the review
                        with the worked answers). A calm clock shows 35 minutes a paper; it never stops the child. Paper 1
                        is marked, then Paper 2; leaving between them keeps Paper 1 (summit.resume, this device only).
                        "Short test: one paper" is the sample (one paper of a new mix; no trophy).
     summit-lightning   the big Lightning round: every Lightning item of the nine stops, 90 seconds (75-lightning.js)
     summit-cert        the certificate, once the trophy is won: the name (as typed at the start, or the school's), the
                        date, the trail, the 9 badges, the score; "Print my certificate" (A4 landscape, nothing else)
   Logged (docs/04): every question when its paper is marked {s: its stop, g: 'x', q: 0-25, v, lo, ok, first, tries: 1,
     hints: 0, dok}; the test {s: 0, g: 'X', v: score, tot: total, ok: 70% or more, full: both papers}; the big round
     {s: 0, g: 'L', v, ok} (75-lightning.js).
   Saved: summit.test {best, total, won, plays, last} (both papers; the school build sends it as `exam`), summit.sample
     {best, total, plays}, summit.big {best, plays} (sent as `big`), summit.trophy.on (the first day the trophy was won),
     summit.lastItems (the items of the last try: the next try takes others where it can, and other numbers).
   T.summit.isOpen(), .won(), .need() for the map, the shelf and the tests.
   A teacher or TA signed in on the start screen (the preview build) may open the Summit and its final test at any
   time, to look at it: T.summit.isOpen() is true for them, and the page shows a small "Teacher view" chip while it is
   still locked by the children's rule (T.summit.earned(): 7 Mini tests). Nothing changes for students or the school build. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const OPEN_AT = 0;                                  // Mini Practice tests done to open the Summit (0: open for everyone, Jovan 25 Nov 2026, the exam is on 27 Nov)
  const WIN = 0.7;
  const STRANDS = { L: 'Listening', U: 'Use of English', R: 'Reading', W: 'Writing' };
  const INSTRUCTIONS = 'Answer all the questions. Tap a dotted line or a box to write. The bold words tell you what to do. ' +
    'The number in [ ] brackets shows how many marks a part is worth.';
  const MIN = 35;                                     // minutes a paper (the calm clock)

  const W = function () { return T.SUMMIT; };
  const fill = function (s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); };
  const say = function (line, vars, mood) { return { en: fill(line.en, vars), vi: fill(line.vi, vars), mood: mood || 'happy' }; };

  /* ---------- the state ---------- */

  function testsDone() {
    return (T.stops || []).filter(function (s) { return T.packs[s.n] && T.progress.stepState(s.n, 'test') === 'done'; }).length;
  }
  function earned() { return testsDone() >= OPEN_AT; }
  // a teacher or TA (the preview's start screen) looks at the Summit without the 7 Mini tests
  function teacher() {
    if (T.school) return false;
    const p = T.players && typeof T.players.active === 'function' ? T.players.active() : null;
    return !!(p && T.players.roleOf && T.players.roleOf(p.cls) === 'teacher');
  }
  function isOpen() { return earned() || teacher(); }
  const total = function () { return T.summit.total ? T.summit.total() : T.summit.PAPERS * T.summit.MARKS; };
  function need(t) { return Math.ceil((t || total()) * WIN - 1e-9); }
  function exam() { return T.store.get(['summit', 'test'], null); }
  function won() { const e = exam(); return !!(e && e.won); }
  function bigBest() { return T.store.get(['summit', 'big', 'best'], null); }

  function allLightning() {
    const out = [];
    (T.stops || []).forEach(function (s) {
      const L = T.packs[s.n] && T.packs[s.n].lightning, list = Array.isArray(L) ? L : (L && L.items) || [];
      list.forEach(function (x) { if (Array.isArray(x) && x[0] && Array.isArray(x[1]) && x[1].length >= 2) out.push(x); });
    });
    return out;
  }

  /* ---------- the Summit page ---------- */

  function card(art, label, line, onClick, off) {
    const b = el('button', { type: 'button', class: ['step-card', 'step-card--extra', 'sm-card', off && 'is-building'], disabled: !!off },
      el('span', { class: 'step-card__icon' }, T.ui.plate(T.ui.art(art, { decorative: true }), { shape: 'round', replay: false })),
      el('span', { class: 'step-card__text' }, el('span', { class: 'step-card__label' }, label), el('span', { class: 'step-card__line' }, line)));
    if (!off) b.addEventListener('click', function () { T.fx.sfx('tap'); onClick(); });
    b.setAttribute('aria-label', label + '. ' + line + '.');
    return el('li', b);
  }

  function nextStopForTest() {
    return (T.stops || []).filter(function (s) { return T.packs[s.n] && T.progress.stepState(s.n, 'test') !== 'done'; })[0] || null;
  }

  function mountHub() {
    const S = W(), open = isOpen(), e = exam(), hasWon = won(), big = bigBest();
    const done = testsDone();
    const teacherView = open && !earned();            // open only because a teacher or TA is looking
    let sheet = null;
    const back = T.ui.iconButton({ icon: 'back', label: 'Back to the map', kind: 'float', onClick: function () { T.router.go('home'); } });
    const scene = T.hubKit.buildScene({ sceneArt: 'world-summit', badgeArt: 'badge-summit' },
      el('div', { class: 'hub__bar' }, back, el('span', { class: 'hub__spacer' }), T.nav ? T.nav.bar('float', 0, false) : null, T.ui.soundSwitch({ kind: 'float' })), function () { return sheet; });
    const resume = T.store.get(['summit', 'resume'], null);
    const line = !open ? say(S.zip.locked, { n: OPEN_AT - done }, 'think') : hasWon ? say(S.zip.won, null, 'cheer') : e ? say(S.zip.again) : say(S.zip.open, null, 'cheer');
    const C = S.cards;
    const lockLine = S.locked.card;
    const cards = el('ol', { class: 'steps sm-cards' },
      card('icon-summit-test', C.test.label, !open ? lockLine : e ? fill(C.test.best, { s: e.best, t: e.total }) : C.test.line, function () { T.router.go('summit-test'); }, !open),
      T.SUMMIT_ESL ? card('icon-step-notes', 'Writing paper', !open ? lockLine : T.store.get(['summit', 'writing'], null) ? 'Done. You can write again.' : 'Task 1 and Task 2, 35 minutes', function () { T.router.go('summit-writing'); }, !open) : null,
      card('icon-extra-lightning', C.big.label, !open ? lockLine : big != null ? fill(C.big.best, { b: big }) : C.big.line, function () { T.router.go('summit-lightning'); }, !open),
      card(hasWon ? 'trophy-summit' : 'icon-summit-cert', C.cert.label, hasWon ? C.cert.ready : C.cert.line, function () { T.router.go('summit-cert'); }, !hasWon));
    // how far the child is: the Mini tests done (open at 7) and the badges
    const dots = (T.stops || []).map(function (s) {
      const d = T.packs[s.n] && T.progress.stepState(s.n, 'test') === 'done';
      return el('span', { class: ['sm-dot', d && 'is-done'], dataset: { hue: s.n }, title: 'Stop ' + s.n });
    });
    const badges = (T.stops || []).filter(function (s) { return T.progress.hasBadge(s.n); }).length;
    const progress = el('div', { class: 'hub__progress sm-progress', role: 'img', 'aria-label': done + ' of 9 Mini tests done, ' + badges + ' of 9 badges' },
      el('span', { class: 'sm-dots', 'aria-hidden': 'true' }, dots),
      el('span', { class: 'hub__progress-text', 'aria-hidden': 'true' }, done + ' of 9 Mini tests done'),
      el('span', { class: 'hub__progress-stars', 'aria-hidden': 'true' }, T.ui.icon('trophy'), el('span', badges + ' / 9')));
    sheet = el('div', { class: 'hub__sheet rise sm-sheet' },
      el('div', { class: 'hub__intro' },
        el('p', { class: 'hub__eyebrow' }, S.eyebrow),
        el('h1', { class: 'hub__title' }, S.name),
        teacherView ? el('p', { class: 'sm-teacher' }, T.ui.icon('pencil'), el('span', 'Teacher view'), el('span', { class: 'sm-teacher__vi', lang: 'vi' }, 'Chế độ giáo viên')) : null,
        T.ui.instruction({ en: S.blurb.en, vi: S.blurb.vi, zip: false, plain: true }).el,
        progress,
        !open ? el('p', { class: 'hub__hint sm-locked' }, T.ui.icon('lock'), el('span', fill(S.locked.line, { d: done }))) : null),
      T.ui.instruction({ en: line.en, vi: line.vi, mood: line.mood, sound: false, cls: 'sm-zip' }).el,
      cards);
    const bar = T.ui.actionBar();
    T.shell.screen.appendChild(el('div', { class: 'hub sm-hub', dataset: { hue: 10 } }, scene.el, sheet, bar.el));

    // the ONE main button: the next thing to do here
    if (!open) {
      const st = nextStopForTest();
      bar.primary(st ? { label: 'Next: Stop ' + st.n, iconEnd: 'next', onClick: function () { T.router.go('stop-' + st.n); } }
        : { label: 'Back to the map', icon: 'map', onClick: function () { T.router.go('home'); } });
    } else if (!hasWon) {
      bar.primary({ label: resume ? 'Continue: Final test' : e ? 'Try the final test again' : 'Start: Final test', iconEnd: 'next', onClick: function () { T.router.go('summit-test'); } });
    } else {
      bar.primary({ label: 'Next: ' + C.cert.label, iconEnd: 'next', onClick: function () { T.router.go('summit-cert'); } });
    }
    scene.fit();
    return function cleanup() { scene.stop(); T.ui.closeOverlays(); };
  }

  /* ---------- the final test ---------- */

  function taskOf(q) {
    const item = T.summit.item ? T.summit.item(q) : T.packs[q.s].test.items[q.i];
    return T.gameKit.modelTask({ mode: 'your', v: item.v }, q.v);
  }

  function mountTest() {
    if (!isOpen()) { T.router.go('summit'); return null; }
    const S = W(), TX = S.test;
    const ctx = T.stage.open({ stop: 0, step: 'summit-test', title: TX.title, backLabel: S.way.back });
    let pad = null, over = false, stopClock = null, shown = null;
    ctx.onLeave(function () { over = true; if (pad) pad.destroy(); pad = null; if (stopClock) stopClock(); });
    const RS = ['summit', 'resume'];

    /* 1. the intro */
    function intro() {
      if (over) return;
      if (pad) { pad.destroy(); pad = null; }
      T.ui.empty(ctx.body);
      ctx.title(TX.title);
      ctx.progress(null);
      const resume = T.store.get(RS, null), e = exam();
      const carry = !!(resume && resume.at === 1 && resume.full);
      ctx.instruct(say(carry ? TX.carry : TX.intro));
      const facts = TX.facts.map(function (f) { return el('li', fill(f, { w: need(), t: total() })); });
      ctx.body.appendChild(el('div', { class: 'mt-wrap' }, el('section', { class: 'panel sm-intro rise' },
        el('div', { class: 'sm-intro__pic' }, T.ui.plate(T.ui.art('icon-summit-test', { decorative: true }), { shape: 'round', replay: false })),
        el('ul', { class: 'sm-intro__facts' }, facts),
        e ? el('p', { class: 'mt-best' }, fill(TX.best, { s: e.best, t: e.total })) : null)));
      if (carry) {
        ctx.primary({ label: 'Start Paper 2', icon: 'play', onClick: function () { paper(resume, 1); } });
        ctx.secondary({ label: 'Start a new test', icon: 'replay', onClick: function () { start(true); } });
      } else {
        ctx.primary({ label: 'Start Paper 1', icon: 'play', onClick: function () { start(true); } });
        ctx.secondary({ label: 'One paper only', onClick: function () { start(false); } });
      }
    }

    // a new mix: other questions than the last try where it can, and other numbers
    function start(full) {
      const avoid = {};
      (T.store.get(['summit', 'lastItems'], []) || []).forEach(function (c) { const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(c); if (m) avoid[m[1] + '.' + m[2]] = Number(m[3]); });
      const plan = T.summit.plan(T.packs, { avoid: avoid });
      if (!plan) { ctx.instruct({ en: 'No questions here yet.', vi: 'Chưa có câu hỏi nào.', mood: 'think' }); return; }
      const codes = plan.papers.map(function (p) { return p.map(T.summit.code); });
      T.store.set(['summit', 'lastItems'], codes[0].concat(codes[1]));
      const resume = { codes: full ? codes : [codes[0], codes[1]], full: !!full, at: 0, p: [], by: {} };
      T.store.set(RS, resume);
      paper(resume, 0);
    }

    /* 2. a paper: the Mini test's paper, its questions numbered 1 to 14 */
    function paper(resume, k) {
      if (over) return;
      if (shown) { shown.close(); shown = null; }        // "Try again" from the result card
      const plan = T.summit.fromCodes(T.packs, resume.codes);
      if (!plan) { T.store.set(RS, null); intro(); return; }
      if (pad) { pad.destroy(); pad = null; }
      if (stopClock) { stopClock(); stopClock = null; }
      T.ui.empty(ctx.body);
      ctx.title(resume.full ? 'Paper ' + (k + 1) + ' of 2' : TX.title);
      ctx.secondary(null);
      ctx.instruct(say(TX.first));
      const qs = [];
      plan.papers[k].forEach(function (q, n) {
        let task = null;
        try { task = taskOf(q); } catch (e) { console.error('Summit: question ' + (n + 1) + ' did not build', e); }
        if (task) qs.push({ q: q, task: task, g: k * T.summit.PER + n });
      });
      const max = qs.reduce(function (s, x) { return s + (x.task.marks || 1); }, 0);
      const tp = el('div', { class: 'tp sm-tp' });
      const sheet = el('div', { class: 'tp-sheet', tabindex: '-1' });
      const totalBox = el('b', { class: 'tp-total__box' }, '– / ' + max);
      const strands = [];
      qs.forEach(function (x) { if (strands.indexOf(x.q.strand) < 0) strands.push(x.q.strand); });
      strands.sort(function (a, b) { return 'NGS'.indexOf(a) - 'NGS'.indexOf(b); });
      // the calm clock: minutes left, a tap hides it; at 0 it only says so (nothing is taken away)
      const clockText = el('span', { class: 'sm-clock__t' });
      const clock = el('button', { type: 'button', class: 'sm-clock', 'aria-pressed': 'false' }, T.ui.icon('clock'), clockText);
      const t0 = Date.now();
      let hidden = false;
      const tick = function () {
        const left = Math.max(0, Math.ceil((T.summit.minutes ? T.summit.minutes(k) : MIN) - (Date.now() - t0) / 60000));
        clockText.textContent = hidden ? TX.timerShow : left > 0 ? fill(TX.timer, { n: left }) : TX.timerUp;
        clock.classList.toggle('is-up', left <= 0 && !hidden);
      };
      clock.addEventListener('click', function () { hidden = !hidden; clock.setAttribute('aria-pressed', String(hidden)); clock.classList.toggle('is-hidden', hidden); tick(); });
      tick();
      stopClock = ctx.every(tick, 15000);
      sheet.appendChild(el('header', { class: 'tp-top' },
        el('div', { class: 'tp-top__words' },
          el('p', { class: 'tp-kicker' }, resume.full ? fill(TX.kicker, { p: k + 1 }) : TX.short),
          el('h2', { class: 'tp-title' }, T.summit.paperName ? T.summit.paperName(k) : TX.paperTitle)),
        el('div', { class: 'tp-total' }, el('span', 'Marks'), totalBox)));
      sheet.appendChild(el('ul', { class: 'tp-strands' }, strands.map(function (s) { return el('li', { class: 'tp-strand' }, el('b', s), STRANDS[s]); })));
      sheet.appendChild(el('div', { class: 'sm-row' }, el('p', { class: 'tp-instr' }, INSTRUCTIONS), clock));
      const padBox = el('div', { class: 'tp-pad' });
      const showPad = function (on) { tp.classList.toggle('is-typing', !!on); };
      const allBlanks = [], allDefs = [];
      qs.forEach(function (x, n) {
        const item = T.summit.item ? T.summit.item(x.q) : T.packs[x.q.s].test.items[x.q.i];
        const head = T.summit.partHead ? T.summit.partHead(x, qs[n - 1]) : null;
        if (head) sheet.appendChild(head);
        x.Q = T.testPaper.question(x.task, { num: x.q.num || n + 1, lo: item.lo, dok: item.dok, twm: item.twm, onTap: function () { showPad(false); ctx.later(recount, 0); } });
        x.off = allBlanks.length;
        x.Q.blanks.forEach(function (b) { allBlanks.push(b); });
        x.Q.defs.forEach(function (d) { allDefs.push(d); });
        sheet.appendChild(x.Q.el);
      });
      sheet.appendChild(el('p', { class: 'tp-end' }, resume.full ? fill(TX.end, { p: k + 1 }) : 'End of the test'));
      if (T.esl) T.esl.dedupe(sheet);
      tp.appendChild(sheet);
      tp.appendChild(padBox);
      ctx.body.appendChild(tp);
      const vals = function (x) { return pad ? pad.get().slice(x.off, x.off + x.Q.blanks.length) : []; };
      const intoView = function (node) { ctx.later(function () { try { node.scrollIntoView({ block: 'nearest' }); } catch (e) { /* a nicety */ } }, 60); };
      if (allBlanks.length) {
        pad = T.tools.numpad({
          blanks: allBlanks, defs: allDefs, onChange: function () { showPad(true); recount(); },
          onEnter: function () {
            const i = allBlanks.findIndex(function (b) { return b.classList.contains('is-on'); });
            if (i >= 0 && i < allBlanks.length - 1) { pad.focus(i + 1); intoView(allBlanks[i + 1]); }
          }
        });
        padBox.appendChild(pad.el);
        allBlanks.forEach(function (b) { b.addEventListener('click', function () { if (tp.classList.contains('is-marked')) return; showPad(true); intoView(b); }); });
      }
      T.testPaper.current = { tasks: qs.map(function (x) { return x.task; }), summit: true, paper: k };   // read by the tests only
      function recount() {
        if (over || tp.classList.contains('is-marked')) return;
        ctx.progress(qs.filter(function (x) { return x.Q.complete(vals(x)); }).length, qs.length, { count: true });
      }
      sheet.addEventListener('click', function () { ctx.later(recount, 0); });
      recount();
      let warned = false;
      ctx.primary({ label: 'Mark my paper', iconEnd: 'next', onClick: function () {
        if (over || tp.classList.contains('is-marked')) return;
        const empty = qs.filter(function (x) { return !x.Q.complete(vals(x)); })[0];
        if (empty && !warned) {
          warned = true;
          showPad(false);
          ctx.instruct(say(TX.missing, { q: qs.indexOf(empty) + 1 }, 'think'));
          intoView(empty.Q.el);
          empty.Q.el.classList.remove('is-missing'); void empty.Q.el.offsetWidth; empty.Q.el.classList.add('is-missing');
          return;
        }
        mark(resume, k, qs, tp, totalBox, max, sheet);
      } });
    }

    /* 3. marking a paper: every question logged once (game 'x'), Paper 1 kept for later */
    function mark(resume, k, qs, tp, totalBox, max, sheet) {
      tp.classList.remove('is-typing');
      tp.classList.add('is-marked');
      if (stopClock) { stopClock(); stopClock = null; }
      const MX = window.MX;
      let score = 0;
      const boxes = [], by = resume.by || {};
      qs.forEach(function (x, n) {
        x.Q.el.style.setProperty('--i', String(n));
        const v = pad ? pad.get().slice(x.off, x.off + x.Q.blanks.length) : [];
        const r = x.Q.answer(v);
        const res = T.testPaper.mark(x.task, r);
        x.Q.lock();
        x.Q.review(res);
        (res.boxes || x.Q.blanks.map(function () { return false; })).forEach(function (b) { boxes.push(b); });
        score += res.score;
        const s = String(x.q.stop != null ? x.q.stop : x.q.s);
        by[s] = [(by[s] ? by[s][0] : 0) + res.score, (by[s] ? by[s][1] : 0) + res.max];
        const given = (r.v ? r.v.join(' | ') : '') + (r.dec ? r.dec + ' ' : '') + (r.pick >= 0 && MX ? MX.LET[r.pick] : '') + (!r.v && r.b ? r.b.join('-') : '') +
          (T.gameKit.toolGiven ? T.gameKit.toolGiven(r) : '');
        const item = T.summit.item ? T.summit.item(x.q) : T.packs[x.q.s].test.items[x.q.i];
        T.events.log({ s: x.q.stop != null ? x.q.stop : x.q.s, g: 'x', q: x.g, v: given.trim(), lo: item.lo || [], ok: res.full, first: res.full, tries: 1, hints: 0, dok: item.dok });
      });
      if (pad) { pad.lock(); pad.mark(boxes); }
      totalBox.parentNode.classList.add('is-marked');
      T.ui.countUp(totalBox, score, { from: 0, ms: Math.min(1100, 90 * qs.length + 200), format: function (n) { return n + ' / ' + max; } });
      const p = (resume.p || []).slice();
      p[k] = score;
      const next = Object.assign({}, resume, { p: p, by: by, at: k + 1 });
      const more = resume.full && k === 0;
      T.store.set(RS, more ? next : null);
      ctx.zip(score >= need(max) ? 'cheer' : 'happy');
      ctx.instruct(say(W().test.marked, { s: score, m: max }));
      try { sheet.scrollTop = 0; } catch (e) { /* a nicety */ }
      ctx.secondary(null);
      if (more) ctx.primary({ label: 'Next: Paper 2', iconEnd: 'next', onClick: function () { paper(next, 1); } });
      else ctx.primary({ label: 'See my result', iconEnd: 'next', onClick: function () { end(next); } });
    }

    /* 4. the result: the score, the trophy at 70% (both papers), kind words below it */
    function end(r) {
      if (over) return;
      if (pad) { pad.destroy(); pad = null; }
      const TXT = W().test;
      const full = !!r.full, tot = full ? total() : (T.summit.paperMax ? T.summit.paperMax(0) : T.summit.MARKS);
      const score = (r.p || []).reduce(function (s, x) { return s + (Number(x) || 0); }, 0);
      const reached = score >= need(tot), hasWon = full && reached;
      T.events.log({ s: 0, g: 'X', v: String(score), tot: tot, ok: reached, full: full });
      const path = ['summit', full ? 'test' : 'sample'];
      const old = T.store.get(path, null) || {};
      const wasWon = !!old.won;
      T.store.set(path, Object.assign({}, old, { best: Math.max(Number(old.best) || 0, score), total: tot, plays: (Number(old.plays) || 0) + 1, last: score },
        full ? { won: wasWon || hasWon } : {}));
      const newBest = old.best != null && score > old.best ? { was: fill(T.REWARDS.outOf, { n: old.best, m: tot }) } : null;
      const firstTrophy = hasWon && T.store.get(['summit', 'trophy', 'on'], null) == null;
      if (firstTrophy) T.store.set(['summit', 'trophy', 'on'], T.rewards.today());
      // stops to practise: less than half of their marks
      const low = Object.keys(r.by || {}).filter(function (s) { return r.by[s][0] * 2 < r.by[s][1]; }).sort(function (a, b) { return a - b; })
        .map(function (s) { return 'Stop ' + s; });
      const lines = [fill(TXT.score, { s: score, t: tot })];
      if (full) TXT.papers.forEach(function (x, k) { lines.push(fill(x, { n: r.p[k], m: T.summit.paperMax ? T.summit.paperMax(k) : T.summit.MARKS })); });
      if (full && !hasWon) lines.push(fill(TXT.need, { w: need(tot) }));
      lines.push(low.length ? fill(TXT.practise, { list: low.join(', ') }) : TXT.allStops);
      const zipLine = !full ? TXT.sample : hasWon ? (firstTrophy ? TXT.won : TXT.wonAgain) : TXT.notYet;
      ctx.instruct(say(zipLine, null, reached ? 'cheer' : 'happy'));
      ctx.title(TXT.title);
      const again = { label: 'Try again', icon: 'replay', onClick: function () { start(true); } };
      const toSummit = { label: W().way.back, onClick: function () { T.router.go('summit'); } };
      shown = ctx.result({
        title: !full ? TXT.titleSample : hasWon ? TXT.titleWon : TXT.titleTry,
        lines: lines,
        art: hasWon ? 'trophy-summit' : null, artMove: hasWon ? 'swing' : null, burst: hasWon ? 40 : 0,
        best: newBest, mood: reached ? 'cheer' : 'happy',
        primary: hasWon ? { label: 'Next: ' + W().cards.cert.label, iconEnd: 'next', onClick: function () { T.router.go('summit-cert'); } }
          : !full ? { label: 'Do both papers', icon: 'play', onClick: function () { start(true); } }
          : { label: 'Try again', icon: 'replay', onClick: function () { start(true); } },
        secondary: hasWon ? [again, toSummit, T.rewards.link()] : [toSummit],
        onDone: firstTrophy ? function () {
          T.rewards.moment({ art: 'trophy-summit', over: TXT.trophyOver, title: W().shelf.trophy, target: shown && shown.el && shown.el.querySelector('.result__art') });
        } : null
      });
    }

    intro();
    return ctx.leave;
  }

  /* ---------- the big Lightning round ---------- */

  function mountBig() {
    if (!isOpen()) { T.router.go('summit'); return null; }
    const ctx = T.stage.open({ stop: 0, step: 'summit-lightning', title: W().big.title, backLabel: W().way.back });
    try { T.steps.lightning.mount(ctx, { big: { items: allLightning(), secs: 90 } }); } catch (e) { console.error('Summit: the big round did not open.', e); }
    return ctx.leave;
  }

  /* ---------- the certificate ---------- */

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function childName() {
    if (T.school && typeof T.school.name === 'function') { const n = T.school.name(); if (n) return n; }
    const p = T.players && T.players.active ? T.players.active() : null;
    return p && p.name ? String(p.name) : '';
  }

  function mountCert() {
    if (!won()) { T.router.go('summit'); return null; }
    const S = W(), CT = S.cert, e = exam() || {};
    const ctx = T.stage.open({ stop: 0, step: 'summit-cert', title: CT.title, backLabel: S.way.back });
    ctx.instruct(say(CT.zip, null, 'cheer'));
    const d = new Date();
    const day = d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    const nameOut = el('p', { class: 'sm-cert__name' });
    const input = el('input', { class: 'sm-cert__input', type: 'text', id: 'sm-cert-name', maxlength: '36', autocomplete: 'off', spellcheck: 'false' });
    input.value = childName();
    const paint = function () { nameOut.textContent = input.value.replace(/\s+/g, ' ').trim() || ' '; };
    input.addEventListener('input', paint);
    paint();
    const badges = (T.stops || []).map(function (s) {
      const has = T.progress.hasBadge(s.n);
      return el('li', { class: ['sm-cert__badge', has ? 'is-won' : 'is-outline'] }, T.ui.art(s.badgeArt, { decorative: true }));
    });
    const nBadges = (T.stops || []).filter(function (s) { return T.progress.hasBadge(s.n); }).length;
    const cert = el('article', { class: 'sm-cert', 'aria-label': CT.heading },
      el('div', { class: 'sm-cert__frame' },
        el('p', { class: 'sm-cert__top' }, CT.top),
        el('div', { class: 'sm-cert__head' }, el('span', { class: 'sm-cert__cup' }, T.ui.art('trophy-summit', { decorative: true })), el('h2', { class: 'sm-cert__title' }, CT.heading)),
        el('p', { class: 'sm-cert__to' }, CT.to),
        nameOut,
        el('p', { class: 'sm-cert__for' }, CT.for),
        el('ul', { class: 'sm-cert__badges', 'aria-label': fill(CT.badges, { n: nBadges }) }, badges),
        el('p', { class: 'sm-cert__facts' },
          el('span', fill(CT.test, { s: e.best, t: e.total })), el('span', fill(CT.badges, { n: nBadges })),
          el('span', fill(CT.stars, { n: T.progress.totalStars() }))),
        el('div', { class: 'sm-cert__foot' }, el('p', { class: 'sm-cert__date' }, fill(CT.date, { d: day })),
          el('span', { class: 'sm-cert__zip', 'aria-hidden': 'true' }, T.ui.zip('cheer')))));
    ctx.body.appendChild(el('div', { class: 'sm-certwrap' },
      el('label', { class: 'sm-cert__field', for: 'sm-cert-name' }, el('span', CT.nameLabel), input), cert));
    ctx.primary({ label: CT.print, icon: 'print', onClick: function () {
      try { window.print(); } catch (err) { T.ui.toast(CT.noPrint); }
    } });
    return ctx.leave;
  }

  T.summit = Object.assign(T.summit || {}, { isOpen: isOpen, earned: earned, teacher: teacher, won: won, need: need, testsDone: testsDone, OPEN_AT: OPEN_AT, allLightning: allLightning });
  T.router.register('summit', mountHub);
  T.router.register('summit-test', mountTest);
  T.router.register('summit-lightning', mountBig);
  T.router.register('summit-cert', mountCert);
})(window.T = window.T || {});

