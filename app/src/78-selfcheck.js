/* 78-selfcheck.js - My self-check (a hub extra, no stars): how is each skill of the stop going? Fills T.steps.selfcheck.

   Reads ctx.pack.selfcheck = { goals: ['read and write numbers bigger than 1,000', ...],
                                again: ['r', 'r', 'c', 'r'] }   the step to practise again for each goal
                                                               (c = See it, r and a = Practise), as in Maths v2.
   Flow:  the form: each goal "I can ..." with three answers (I can do this / I want to get better / I need help);
          the main button "Save my self-check" works once every goal has an answer ->
          thank you: the answers, and a "practise again" button for each goal that is not "I can do this".
          A child who has saved before sees the thank-you screen first ("Change my answers" opens the form).
   Logged on save, as in v2: T.events.log({s, g: 's', v: 'can,better,help,can' (one word per goal, in goal order), ok: true}).
   Saved for the dashboards (docs/04 "self"): stops.N.selfcheck.answers = {0: 'can' | 'better' | 'help', ...}. */
(function (T) {
  'use strict';

  const el = T.util.el;

  const FEEL = [
    { k: 'can', t: 'I can do this', icon: 'check' },
    { k: 'better', t: 'I want to get better', icon: 'star' },
    { k: 'help', t: 'I need help', icon: 'info' }
  ];
  const AGAIN = { c: 'see', r: 'practise', a: 'practise' };

  const STR = {
    form: { en: 'How is it going? Tap *one answer* for each skill.', vi: 'Em học thế nào rồi? Bấm *một câu trả lời* cho mỗi kỹ năng.' },
    honest: { en: 'There are no wrong answers. Your teacher will *help* you.', vi: 'Không có câu trả lời sai. Thầy cô sẽ *giúp* em.' },
    thanks: { en: 'Thank you for being *honest*! Your teacher will see this.', vi: 'Cảm ơn em đã *thành thật*! Thầy cô sẽ thấy điều này.' },
    allCan: { en: 'You feel good about *every skill*. Brilliant!', vi: 'Em tự tin với *mọi kỹ năng*. Tuyệt vời!' }
  };

  function mount(ctx) {
    const sc = (ctx.pack && ctx.pack.selfcheck) || {};
    const goals = (sc.goals || []).filter(Boolean);
    const again = sc.again || [];
    const path = ['stops', String(ctx.stop), 'selfcheck', 'answers'];
    const saved = T.store.get(path, null);
    const cur = Object.assign({}, saved || {});

    function feel(k) { return FEEL.filter(function (f) { return f.k === k; })[0] || null; }

    /* ---------- 1. the form ---------- */

    function form() {
      T.ui.empty(ctx.body);
      ctx.secondary(null);
      ctx.instruct(Object.assign({ mood: 'happy' }, STR.form));
      const list = el('ol', { class: 'sc-list' });
      goals.forEach(function (goal, i) {
        const row = el('div', { class: 'sc-feel', role: 'radiogroup', 'aria-label': 'I can ' + goal });
        FEEL.forEach(function (f) {
          const b = el('button', { type: 'button', class: 'sc-opt sc-opt--' + f.k + ' pressable', role: 'radio', 'aria-checked': 'false', dataset: { i: String(i), k: f.k } },
            el('span', { class: 'sc-opt__dot', 'aria-hidden': 'true' }, T.ui.icon(f.icon)), el('span', { class: 'sc-opt__t' }, f.t));
          b.addEventListener('click', function () { cur[i] = f.k; T.fx.sfx('pick'); paint(); });
          row.appendChild(b);
        });
        list.appendChild(el('li', { class: 'sc-goal panel' },
          el('p', { class: 'sc-goal__t' }, 'I can ', el('b', goal), '.'), row));
      });
      ctx.body.appendChild(el('div', { class: 'sc-wrap rise' }, list,
        el('p', { class: 'sc-note' }, T.ui.richText(STR.honest.en))));

      function done() { return goals.every(function (g, i) { return !!cur[i]; }); }

      function paint() {
        T.util.$$('.sc-opt', list).forEach(function (b) {
          const on = cur[b.dataset.i] === b.dataset.k;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        ctx.progress(goals.filter(function (g, i) { return !!cur[i]; }).length, goals.length, { count: true });   // skills answered
        ctx.primary({ label: 'Save my self-check', icon: 'check', disabled: !done(), onClick: save });
      }

      function save() {
        if (!done()) return;
        const answers = {};
        goals.forEach(function (g, i) { answers[i] = cur[i]; });
        T.store.set(path, answers);
        T.events.log({ s: ctx.stop, g: 's', v: goals.map(function (g, i) { return cur[i]; }).join(','), ok: true });
        T.fx.sfx('star');
        thanks();
      }
      paint();
      T.guide.point('selfcheck', function () { return list.querySelector('.sc-opt'); });
    }

    /* ---------- 2. thank you ---------- */

    function thanks() {
      T.ui.empty(ctx.body);
      const weak = goals.map(function (g, i) { return { g: g, i: i, k: cur[i] }; }).filter(function (x) { return x.k !== 'can'; });
      ctx.instruct(Object.assign({ mood: 'cheer' }, weak.length ? STR.thanks : STR.allCan));
      const sum = el('ul', { class: 'sc-sum' }, goals.map(function (g, i) {
        const f = feel(cur[i]) || FEEL[0];
        return el('li', { class: 'sc-sum__row sc-opt--' + f.k },
          el('span', { class: 'sc-opt__dot', 'aria-hidden': 'true' }, T.ui.icon(f.icon)),
          el('span', el('b', f.t + ': '), g));
      }));
      const box = el('section', { class: 'panel sc-done rise' }, el('h2', { class: 'sc-done__title' }, 'Thank you!'), sum);
      if (weak.length) {
        const list = el('div', { class: 'sc-again' }, el('h3', { class: 'sc-again__title' }, 'Practise again'));
        weak.forEach(function (x) {
          const step = AGAIN[again[x.i]] || 'practise';
          list.appendChild(T.ui.button({
            label: T.stepLabel(step) + ': ' + x.g, kind: 'quiet', iconEnd: 'next', cls: 'sc-again__btn',
            onClick: function () { T.router.go('stop-' + ctx.stop + '-' + step); }
          }));
        });
        box.appendChild(list);
      }
      ctx.body.appendChild(el('div', { class: 'sc-wrap' }, box));
      ctx.progress(null);
      // the way on: the next step or stop (ONE big button); the back arrow goes to the stop
      const way = T.stage.wayOn(ctx.stop, 'selfcheck', { again: form });
      if (way.line) box.appendChild(el('p', { class: 'sc-next' }, T.ui.richText(way.line)));
      ctx.primary(way.primary);
      ctx.secondary({ label: 'Change my answers', icon: 'pencil', onClick: form });
    }

    if (!goals.length) {
      ctx.instruct({ en: 'No skills here yet.', vi: 'Chưa có kỹ năng nào.', mood: 'think' });
      ctx.primary({ label: 'Back to the stop', icon: 'back', onClick: function () { T.router.go('stop-' + ctx.stop); } });
      return;
    }
    if (saved && goals.every(function (g, i) { return !!saved[i]; })) thanks(); else form();
  }

  T.steps = T.steps || {};
  T.steps.selfcheck = { mount: mount, feel: FEEL };
  (T.zipLines = T.zipLines || {}).selfcheck = STR;      // checked by test/guide.mjs (at most 10 words)
})(window.T = window.T || {});

