/* 70-test.js - the Mini Practice test step: ONE test paper with 10 questions, from easy to hard. Fills T.steps.test.

   Reads ctx.pack.test = { items: [{ dok: 1 | 2 | 3, lo: ['4Np.01'], twm: ['TWM.05'], v: [DEF, DEF, DEF] }] }
     10 questions with the DOK mix of the public specification: 4 at DOK 1, 5 at DOK 2, 1 at DOK 3, in that order
     (T.DOK_MIX; docs/05-content-rules.md). Every question shows its label: code and skill, DOK, TWM (71-test-paper.js).
     Each item is one question made by the v2 models (MX.make): the first paper uses v[0], the next v[1], then v[2].
   The paper (Jovan, 24 Nov 2026, like a printed Cambridge paper): a header (MINI PRACTICE TEST · STOP 1 · UNIT 1),
     the title, a Marks box, the strand chip (N Number, G Geometry and measure, S Statistics and probability),
     the instructions, then the numbered questions with parts (a), (b), the marks [n] and the label.
     Each question is drawn and marked by 71-test-paper.js (T.testPaper). The answer boxes share ONE number pad.
   Flow:  the child answers in any order -> "Mark my paper" (a first press with a question left empty says which one)
          -> every part gets a tick or a cross and its marks, the Marks box the total, a wrong question shows the
          answer and how to do it -> "Finish" (the result with a medal) or "Try again" (the next set of numbers).
   Every question is logged once, when the paper is marked:
          T.events.log({s, g: 'm', q: 0-9, v, lo, ok, first, tries: 1, hints: 0, dok}); ok = full marks on the question.
   Saved: the unit 'paper' (questions fully right out of 10, the step's stars), and for the dashboards (docs/04 "mini"):
          stops.N.test.best (the best number fully right, out of 10) and stops.N.test.plays (papers marked).
   Medals (as in v2): gold 10 right, silver 8 or 9, bronze 6 or 7.
   Rewards (Phase 6, 18-rewards.js): once marked, the longest run of questions fully right pops on Zip ("7 out of 10
   right, 5 in a row!",
   saved as stops.N.streak.test); a new best (compared before it is saved) and the medal swinging onto the result card. */
(function (T) {
  'use strict';

  const el = T.util.el;

  const MEDALS = [
    { at: 10, k: 'gold', name: 'Gold medal' },
    { at: 8, k: 'silver', name: 'Silver medal' },
    { at: 6, k: 'bronze', name: 'Bronze medal' }
  ];
  const STRANDS = { L: 'Listening', U: 'Use of English', R: 'Reading', W: 'Writing' };
  const INSTRUCTIONS = 'Answer all the questions. Tap a dotted line or a box to write. The bold words tell you what to do. ' +
    'The number in [ ] brackets shows how many marks a part is worth.';

  // Zip's lines: at most 10 words each (Phase 3); how to write on the paper is in the paper's own instructions
  const STR = {
    first: { en: 'Answer every question. Then tap *Mark my paper*.',
      vi: 'Trả lời mọi câu hỏi. Rồi bấm *Mark my paper* (Chấm bài).' },
    best: { en: 'Your best is *{b} out of {n}*. Beat it!',
      vi: 'Điểm cao nhất của em là *{b} trên {n}*. Hãy vượt qua nhé!' },
    missing: { en: 'Question {q} is empty. Try it, or tap *Mark* again.',
      vi: 'Câu {q} còn trống. Em thử làm, hoặc bấm *Mark* lần nữa.' },
    full: { en: 'Full marks! *Brilliant!* Tap *Finish*.',
      vi: 'Điểm tối đa! *Tuyệt vời!* Bấm *Finish* (Hoàn thành).' },
    marked: { en: '*{r} out of {n}* right. Read the green answers.',
      vi: 'Em làm đúng *{r} trên {n}* câu. Hãy đọc các đáp án màu xanh.' },
    perfect: { en: 'A *perfect* score! Now try the Lightning round.', vi: 'Điểm *tuyệt đối*! Bây giờ hãy thử vòng Tia chớp nhé.' },
    medal: { en: 'Well done! Which *question* can you get next time?', vi: 'Giỏi lắm! Lần sau em có thể làm đúng *câu* nào nữa?' },
    none: { en: 'Get *6 right* to win a medal. Try again!', vi: 'Làm đúng *6 câu* để nhận huy chương. Thử lại nhé!' }
  };
  function say(line, vars, mood) {
    const fill = function (s) { return String(s).replace(/\{(\w)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); };
    return { en: fill(line.en), vi: fill(line.vi), mood: mood || 'happy' };
  }

  function medalFor(right) {
    for (let i = 0; i < MEDALS.length; i++) if (right >= MEDALS[i].at) return MEDALS[i];
    return null;
  }

  function mount(ctx) {
    const items = ((ctx.pack && ctx.pack.test && ctx.pack.test.items) || []).filter(function (it) { return it && Array.isArray(it.v) && it.v.length; });
    const N = items.length;
    const base = ['stops', String(ctx.stop), 'test'];
    const info = (T.stops || []).filter(function (s) { return s.n === ctx.stop; })[0] || {};
    let pad = null, over = false;

    ctx.onLeave(function () { over = true; if (pad) pad.destroy(); pad = null; });

    if (!N) {
      ctx.instruct({ en: 'No questions here yet.', vi: 'Chưa có câu hỏi nào.', mood: 'think' });
      ctx.primary({ label: 'Back to the stop', icon: 'back', onClick: function () { T.router.go('stop-' + ctx.stop); } });
      return;
    }

    /* ---------- the paper ---------- */

    function paper() {
      if (over) return;
      if (pad) { pad.destroy(); pad = null; }
      T.ui.empty(ctx.body);
      ctx.title('Mini Practice test');
      ctx.progress(null);
      ctx.secondary(null);
      const round = Number(T.store.get(base.concat('plays'), 0)) || 0;          // 0: v[0], 1: v[1], 2: v[2], 3: v[0] ...
      const best = T.store.get(base.concat('best'), null);
      ctx.instruct(best != null ? say(STR.best, { b: best, n: N }) : say(STR.first));

      // the questions (a question whose model fails is left off the paper, and not logged)
      const qs = [];
      items.forEach(function (item, q) {
        let task = null;
        try { task = T.gameKit.modelTask({ mode: 'your', v: item.v }, round); } catch (e) { console.error('Mini test: question ' + (q + 1) + ' did not build', e); }
        if (task) qs.push({ q: q, item: item, task: task });
      });

      const tp = el('div', { class: 'tp' });
      const sheet = el('div', { class: 'tp-sheet', tabindex: '-1' });
      const totalBox = el('b', { class: 'tp-total__box' });
      const total = el('div', { class: 'tp-total' }, el('span', 'Marks'), totalBox);
      const max = qs.reduce(function (s, x) { return s + (x.task.marks || 1); }, 0);
      totalBox.textContent = '– / ' + max;
      const strands = [];
      items.forEach(function (it) { (it.lo || []).forEach(function (c) { const k = String(c).charAt(1); if (STRANDS[k] && strands.indexOf(k) < 0) strands.push(k); }); });
      sheet.appendChild(el('header', { class: 'tp-top' },
        el('div', { class: 'tp-top__words' },
          el('p', { class: 'tp-kicker' }, ['Mini Practice test', 'Stop ' + ctx.stop, info.unit].filter(Boolean).join(' · ')),
          el('h2', { class: 'tp-title' }, info.title || 'Mini Practice test')),
        total));
      if (strands.length) {
        sheet.appendChild(el('ul', { class: 'tp-strands' }, strands.map(function (k) {
          return el('li', { class: 'tp-strand' }, el('b', k), STRANDS[k]);
        })));
      }
      sheet.appendChild(el('p', { class: 'tp-instr' }, INSTRUCTIONS));

      const padBox = el('div', { class: 'tp-pad' });
      function showPad(on) { tp.classList.toggle('is-typing', !!on); }

      const allBlanks = [], allDefs = [];
      qs.forEach(function (x, k) {
        x.Q = T.testPaper.question(x.task, { num: k + 1, lo: x.item.lo, dok: x.item.dok, twm: x.item.twm, onTap: function () { showPad(false); ctx.later(recount, 0); } });
        x.off = allBlanks.length;
        x.Q.blanks.forEach(function (b) { allBlanks.push(b); });
        x.Q.defs.forEach(function (d) { allDefs.push(d); });
        sheet.appendChild(x.Q.el);
      });
      sheet.appendChild(el('p', { class: 'tp-end' }, 'End of the test'));
      if (T.esl) T.esl.dedupe(sheet);
      tp.appendChild(sheet);
      tp.appendChild(padBox);
      ctx.body.appendChild(tp);

      function vals(x) { return pad ? pad.get().slice(x.off, x.off + x.Q.blanks.length) : []; }
      function intoView(node) {
        ctx.later(function () { try { node.scrollIntoView({ block: 'nearest' }); } catch (e) { /* a nicety */ } }, 60);
      }

      if (allBlanks.length) {
        pad = T.tools.numpad({
          blanks: allBlanks, defs: allDefs, onChange: function () { showPad(true); recount(); },
          onEnter: function () {
            const i = allBlanks.findIndex(function (b) { return b.classList.contains('is-on'); });
            if (i >= 0 && i < allBlanks.length - 1) { pad.focus(i + 1); intoView(allBlanks[i + 1]); }
          }
        });
        padBox.appendChild(pad.el);
        allBlanks.forEach(function (b) {
          b.addEventListener('click', function () { if (tp.classList.contains('is-marked')) return; showPad(true); intoView(b); });
        });
      }

      T.testPaper.current = { tasks: qs.map(function (x) { return x.task; }), round: round };   // read by the tests only

      // the top bar counts the questions with an answer (a tool on the paper changes with a tap too)
      function recount() {
        if (over || tp.classList.contains('is-marked')) return;
        const k = qs.filter(function (x) { return x.Q.complete(vals(x)); }).length;
        ctx.progress(k, qs.length, { count: true });
        // every question has an answer: the first time, a hand shows "Mark my paper"
        if (k === qs.length) T.guide.point('paper-mark', function () { return ctx.root.querySelector('.actionbar__primary'); }, { delay: 900 });
      }
      sheet.addEventListener('click', function () { ctx.later(recount, 0); });
      recount();
      // the first paper: a hand shows where to write
      if (allBlanks.length) T.guide.point('paper', function () { return allBlanks[0]; });

      let warned = false;
      function markIt() {
        if (over || tp.classList.contains('is-marked')) return;
        const empty = qs.filter(function (x) { return !x.Q.complete(vals(x)); })[0];
        if (empty && !warned) {
          warned = true;
          showPad(false);
          ctx.instruct(say(STR.missing, { q: qs.indexOf(empty) + 1 }, 'think'));
          intoView(empty.Q.el);
          empty.Q.el.classList.remove('is-missing'); void empty.Q.el.offsetWidth; empty.Q.el.classList.add('is-missing');
          return;
        }
        mark(qs, round, sheet, totalBox, tp, max);
      }
      ctx.primary({ label: 'Mark my paper', iconEnd: 'next', onClick: markIt });
    }

    /* ---------- marking ---------- */

    function mark(qs, round, sheet, totalBox, tp, max) {
      showOff();
      tp.classList.add('is-marked');
      const MX = window.MX;
      let score = 0, right = 0, run = 0, longest = 0;
      const boxes = [];
      qs.forEach(function (x, k) {
        x.Q.el.style.setProperty('--i', String(k));         // the teacher's pen marks the questions in turn (Phase 5)
        const v = pad ? pad.get().slice(x.off, x.off + x.Q.blanks.length) : [];
        const r = x.Q.answer(v);
        const res = T.testPaper.mark(x.task, r);
        x.Q.lock();
        x.Q.review(res);
        (res.boxes || x.Q.blanks.map(function () { return false; })).forEach(function (b) { boxes.push(b); });
        score += res.score;
        if (res.full) right++;
        run = res.full ? run + 1 : 0;                       // Phase 6: the longest run of questions fully right
        longest = Math.max(longest, run);
        const given = (r.v ? r.v.join(' | ') : '') + (r.dec ? r.dec + ' ' : '') + (r.pick >= 0 && MX ? MX.LET[r.pick] : '') + (!r.v && r.b ? r.b.join('-') : '') +
          (T.gameKit.toolGiven ? T.gameKit.toolGiven(r) : '');
        T.events.log({ s: ctx.stop, g: 'm', q: x.q, v: given.trim(), lo: x.item.lo || [], ok: res.full, first: res.full, tries: 1, hints: 0, dok: x.item.dok });
      });
      if (pad) { pad.lock(); pad.mark(boxes); }
      totalBox.parentNode.classList.add('is-marked');
      // the Marks box counts up while the pen goes down the paper; a soft pen sound for each question
      T.ui.countUp(totalBox, score, { from: 0, ms: Math.min(1100, 110 * qs.length + 200), format: function (n) { return n + ' / ' + max; } });
      if (!T.ui.reducedMotion()) qs.forEach(function (x, k) { ctx.later(function () { T.fx.sfx('step'); }, 60 + k * 110); });

      T.store.set(base.concat('plays'), round + 1);
      const old = T.store.get(base.concat('best'), null);
      if (old == null || right > old) T.store.set(base.concat('best'), right);
      ctx.saveUnit('paper', right, N);
      T.rewards.saveRun(ctx.stop, 'test', longest);
      // a new best (compared BEFORE it was saved): the result card shows it with the old best
      const best = old != null && right > old ? { was: T.rewards.fill(T.REWARDS.outOf, { n: old, m: N }) } : null;

      const markedAt = T.ui.reducedMotion() ? 0 : Math.min(1100, 110 * qs.length + 200);
      ctx.later(function () { T.fx.sfx(right === N ? 'win' : 'ok'); }, markedAt);
      ctx.zip(right === N ? 'cheer' : 'happy');
      // Zip: full marks; else the score with a run of 3 or more ("7 out of 10 right, 5 in a row!"); else the score
      ctx.instruct(right === N ? say(STR.full, null, 'cheer') : longest >= 3 ? say(T.REWARDS.streak.paper, { r: right, m: N, n: longest }, 'cheer') : say(STR.marked, { r: right, n: N }));
      // Phase 6: the longest run pops on Zip once the pen has marked the paper ("5 in a row!")
      if (longest >= 3) ctx.later(function () { T.rewards.pop(longest); }, markedAt + 150);
      try { sheet.scrollTop = 0; } catch (e) { /* a nicety */ }
      ctx.secondary({ label: 'Try again', icon: 'replay', onClick: paper });
      ctx.primary({ label: 'Finish', iconEnd: 'next', onClick: function () { end(right, score, max, best); } });
    }

    function showOff() { const t = ctx.body.querySelector('.tp'); if (t) t.classList.remove('is-typing'); }

    /* ---------- the result ---------- */

    function end(right, score, max, best) {
      if (over) return;
      if (pad) { pad.destroy(); pad = null; }
      const medal = medalFor(right);
      const line = right === N ? STR.perfect : medal ? STR.medal : STR.none;
      ctx.instruct(Object.assign({ mood: medal ? 'cheer' : 'happy' }, line));
      ctx.title('Mini Practice test');
      ctx.finish({
        title: medal ? medal.name + '!' : 'Good try!',
        lines: ['You got *' + right + '* out of ' + N + ' questions right.', 'Your marks: *' + score + '* out of ' + max + '.', line.en],
        art: medal ? 'medal-' + medal.k : null,
        // Phase 6: the medal swings onto the card (a gold one with the biggest burst); a new best shows the old one
        artMove: medal ? 'swing' : null, burst: medal ? { gold: 40, silver: 30, bronze: 22 }[medal.k] : 0,
        best: best || null, won: !!(medal || best)
      });
    }

    paper();
  }

  T.steps = T.steps || {};
  T.steps.test = { mount: mount, medals: MEDALS };
  // what a stop's paper is saved out of (the unit 'paper': questions fully right, out of the questions on it);
  // 0 when the pack has no test. Used by the progress code (26-progress-code.js)
  T.steps.test.maxMarks = function (pack) {
    const items = (pack && pack.test && pack.test.items) || [];
    return items.filter(function (it) { return it && Array.isArray(it.v) && it.v.length; }).length;
  };
  (T.zipLines = T.zipLines || {}).test = STR;           // checked by test/guide.mjs (at most 10 words)
})(window.T = window.T || {});

