/* 75-lightning.js - the Lightning round (a hub extra, no stars): quick questions against the clock. Fills T.steps.lightning.

   Reads ctx.pack.lightning = { secs: 60, items: [[question, [right answer, wrong answer, wrong answer]], ...] }
     (the Maths v2 Lightning pool of the stop; a plain list of items works too).
   Flow:  intro (the bolts, the best score) -> 3, 2, 1 -> the round: one question at a time, three answers in a
          new order each time (tap, or the keys 1, 2, 3); a right answer moves on at once, a wrong one shows the
          right answer for a moment -> the result with a bolt.
   Bolts (as in v2): gold 20 right, silver 14, bronze 8.
   Logged once per round, as in v2: T.events.log({s, g: 'l', v: '<number right>', ok: a bolt was won, q: last question}).
   Saved for the hub and the dashboards (docs/04 "bolt"): stops.N.lightning.best and stops.N.lightning.plays.
   T.steps.lightning.secs, when set, replaces the length of every round (the tests use a short one).
   The Summit's big round (79-summit.js): mount(ctx, {big: {items, secs}}) plays the items of all nine stops (90 s), saves
   summit.big.best and .plays, logs {s: 0, g: 'L', v, ok} as v2 did, and its way on goes back to the Summit.
   Rewards (Phase 6, 18-rewards.js): right answers in a row pop on Zip at 3, 5, 10, then every 5 (stops.N.streak.lightning);
   a new best shows the old best on the result card; the bolt zaps onto it. */
(function (T) {
  'use strict';

  const el = T.util.el;

  const BOLTS = [
    { at: 20, k: 'gold', name: 'Gold bolt' },
    { at: 14, k: 'silver', name: 'Silver bolt' },
    { at: 8, k: 'bronze', name: 'Bronze bolt' }
  ];

  const STR = {
    intro: { en: 'Tap the *right answers* fast. How many can you get?', vi: 'Bấm thật nhanh vào *đáp án đúng*. Em được bao nhiêu câu?' },
    ready: { en: 'Get ready...', vi: 'Chuẩn bị nào...' },
    go: { en: 'Tap the *right answer*. Be quick!', vi: 'Bấm vào *đáp án đúng*. Nhanh lên nào!' },
    won: { en: 'Lightning fast! Can you *beat* your score?', vi: 'Nhanh như chớp! Em có *vượt* được điểm của mình không?' },
    none: { en: 'Get *8 right* to win a bolt. Go again!', vi: 'Làm đúng *8 câu* để nhận tia chớp. Chơi lại nhé!' }
  };

  (T.zipLines = T.zipLines || {}).lightning = STR;      // checked by test/guide.mjs (at most 10 words)

  // the pool writes a few signs as HTML entities (&lt; &gt;): show them as signs
  function plain(t) { return String(t).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }

  function boltFor(score) {
    for (let i = 0; i < BOLTS.length; i++) if (score >= BOLTS[i].at) return BOLTS[i];
    return null;
  }

  function itemsOf(pack) {
    const L = pack && pack.lightning;
    const list = Array.isArray(L) ? L : (L && L.items) || [];
    return list.filter(function (x) { return Array.isArray(x) && x[0] && Array.isArray(x[1]) && x[1].length >= 2; });
  }

  function mount(ctx, opts) {
    const big = opts && opts.big ? opts.big : null;
    const items = big ? big.items : itemsOf(ctx.pack);
    const secs = Number(T.steps.lightning.secs) || (big ? Number(big.secs) || 90 : Number(ctx.pack && ctx.pack.lightning && ctx.pack.lightning.secs) || 60);
    const base = big ? ['summit', 'big'] : ['stops', String(ctx.stop), 'lightning'];
    let stopRound = null, onKey = null, shown = null;

    function quit() {
      if (shown) shown.close();
      shown = null;
      if (stopRound) stopRound();
      stopRound = null;
      if (onKey) document.removeEventListener('keydown', onKey);
      onKey = null;
    }
    ctx.onLeave(quit);

    /* ---------- 1. the intro ---------- */

    function intro() {
      quit();
      T.ui.empty(ctx.body);
      ctx.secondary(null);
      ctx.instruct(Object.assign({ mood: 'happy' }, STR.intro));
      const best = T.store.get(base.concat('best'), null);
      const card = el('section', { class: 'panel lt-intro rise' },
        el('p', { class: 'lt-intro__time' }, el('b', String(secs)), ' seconds'),
        el('ul', { class: 'mt-medals', 'aria-label': 'Bolts' }, BOLTS.slice().reverse().map(function (b) {
          return el('li', { class: 'mt-medal' }, T.ui.art('bolt-' + b.k, { decorative: true }), el('span', b.at + ' or more'));
        })),
        big ? el('p', { class: 'lt-intro__from' }, T.SUMMIT.big.from) : null,
        best != null ? el('p', { class: 'mt-best' }, 'Your best: ', el('b', String(best))) : null);
      ctx.body.appendChild(el('div', { class: 'mt-wrap' }, card));
      ctx.primary({ label: 'Start the clock', icon: 'play', onClick: countdown });
      T.guide.point('lightning', function () { return ctx.root.querySelector('.actionbar__primary'); });
    }

    /* ---------- 2. 3, 2, 1 ---------- */

    function countdown() {
      quit();
      ctx.primary(null);
      ctx.secondary(null);
      ctx.instruct(Object.assign({ mood: 'happy' }, STR.ready));
      const num = el('b', '3');
      T.ui.empty(ctx.body).appendChild(el('div', { class: 'lt-count', 'aria-live': 'assertive' }, num));
      let c = 3;
      T.fx.sfx('pop');
      const step = T.ui.reducedMotion() ? 350 : 700;
      const cancel = ctx.every(function () {
        c--;
        if (c <= 0) { cancel(); round(); return; }
        num.textContent = String(c);
        num.classList.remove('is-pop'); void num.offsetWidth; num.classList.add('is-pop');
        T.fx.sfx('pop');
      }, step);
      stopRound = cancel;
    }

    /* ---------- 3. the round ---------- */

    function round() {
      quit();
      ctx.instruct(Object.assign({ mood: 'happy' }, STR.go));
      const order = T.util.shuffle(items.slice());
      let qi = 0, score = 0, streak = 0, busy = false, over = false;
      const t0 = Date.now();
      const run = T.rewards.counter(big ? 0 : ctx.stop, 'lightning');   // the big round's runs are not kept (stop 0)   // Phase 6: "5 in a row!" on Zip (never a word when it ends)

      const timeNum = el('b', String(secs));
      const timeBar = el('i', { class: 'lt-time__bar' });
      const scoreNum = el('b', { 'aria-live': 'polite' }, '0');
      const qEl = el('p', { class: 'lt-q' });
      const opts = el('div', { class: 'lt-opts' });
      const card = el('div', { class: 'panel lt-card' }, qEl, opts);
      const top = el('div', { class: 'lt-top' },
        el('span', { class: 'lt-time', role: 'timer', 'aria-label': 'Time left' }, el('span', { class: 'lt-time__track' }, timeBar), timeNum),
        el('span', { class: 'lt-score' }, T.ui.art('bolt-gold', { decorative: true }), scoreNum));
      T.ui.empty(ctx.body).appendChild(el('div', { class: 'lt' }, top, card));

      function next() {
        if (over) return;
        const it = order[qi % order.length];
        qi++;
        busy = false;
        qEl.textContent = plain(it[0]);
        T.ui.empty(opts);
        if (qi > 1 && !T.ui.reducedMotion()) { card.classList.remove('is-next'); void card.offsetWidth; card.classList.add('is-next'); }
        T.util.shuffle(it[1].map(function (t, j) { return { t: t, ok: j === 0 }; })).forEach(function (o, j) {
          const b = T.ui.choice({ label: plain(o.t), layout: 'word', cls: 'lt-o', sfx: false, onClick: function () { tap(b); } });
          b.setAttribute('data-ok', o.ok ? '1' : '0');
          b.insertBefore(el('kbd', { class: 'lt-o__key', 'aria-hidden': 'true' }, String(j + 1)), b.firstChild);
          opts.appendChild(b);
        });
        if (T.tools && T.tools.fracText) { T.tools.fracText(qEl); T.tools.fracText(opts); }   // Stop 7: 1/4 as on paper
      }

      function tap(b) {
        if (busy || over || !b) return;
        busy = true;
        if (b.dataset.ok === '1') {
          score++; streak++;
          scoreNum.textContent = String(score);
          if (!T.ui.reducedMotion()) { scoreNum.classList.remove('is-tick'); void scoreNum.offsetWidth; scoreNum.classList.add('is-tick'); }
          b.classList.add('is-right');
          T.fx.sfx('ok', { streak: Math.min(streak, 8) });
          const line = run.hit(true);
          if (line) ctx.instruct(line);
          ctx.later(next, 170);
        } else {
          streak = 0;
          run.hit(false);
          b.classList.add('is-wrong');
          const good = opts.querySelector('[data-ok="1"]');
          if (good) good.classList.add('is-right');
          T.fx.sfx('no');
          card.classList.remove('gm-shake'); void card.offsetWidth; card.classList.add('gm-shake');
          ctx.later(next, 850);
        }
      }

      onKey = function (e) {
        if (!/^[123]$/.test(e.key)) return;
        tap(T.util.$$('.lt-o', opts)[Number(e.key) - 1]);
      };
      document.addEventListener('keydown', onKey);

      // the bar: with motion ONE transition from full to empty over the whole round, run by the compositor (smooth
      // on a slow iPad, nothing to lay out); still: the bar steps with the number. The number ticks every 100 ms.
      const glide = !T.ui.reducedMotion();
      if (glide) {
        timeBar.style.transition = 'none';
        timeBar.style.transform = 'scaleX(1)';
        void timeBar.offsetWidth;
        timeBar.style.transition = 'transform ' + secs + 's linear';
        timeBar.style.transform = 'scaleX(0)';
      }
      const tick = function () {
        const left = secs - (Date.now() - t0) / 1000;
        timeNum.textContent = String(Math.max(0, Math.ceil(left)));
        if (!glide) timeBar.style.transform = 'scaleX(' + Math.max(0, left / secs).toFixed(3) + ')';
        top.classList.toggle('is-low', left <= 10);
        if (left <= 0) end();
      };
      const cancel = ctx.every(tick, 100);
      stopRound = cancel;

      function end() {
        if (over) return;
        over = true;
        quit();
        T.fx.sfx('whoosh');
        const bolt = boltFor(score), old = T.store.get(base.concat('best'), null);
        T.store.set(base.concat('plays'), (Number(T.store.get(base.concat('plays'), 0)) || 0) + 1);
        if (old == null || score > old) T.store.set(base.concat('best'), score);
        T.events.log({ s: big ? 0 : ctx.stop, g: big ? 'L' : 'l', v: String(score), ok: !!bolt, q: qi - 1 });
        const say = bolt ? STR.won : STR.none;
        ctx.instruct(Object.assign({ mood: bolt ? 'cheer' : 'happy' }, say));
        // ONE big button to the way on (the next step, the self-check or the next stop); "Go again" is quiet
        const way = big ? { line: '', primary: { label: T.SUMMIT.way.back, icon: 'back', onClick: function () { T.router.go('summit'); } },
          secondary: [{ label: 'Go again', icon: 'replay', onClick: countdown }] }
          : T.stage.wayOn(ctx.stop, 'lightning', { again: countdown, againLabel: 'Go again' });
        // Phase 6: a new best (compared before it was saved) shows the old best; the bolt zaps onto the card
        const newBest = old != null && score > old;
        shown = ctx.result({
          title: bolt ? bolt.name + '!' : 'Time is up!',
          lines: ['You got *' + score + '* right.'].concat(newBest ? [] : ['Your best: ' + Math.max(score, old == null ? 0 : old) + '.'], [say.en], way.line ? [way.line] : []),
          art: bolt ? 'bolt-' + bolt.k : null,
          artMove: bolt ? 'zap' : null, burst: bolt ? { gold: 40, silver: 30, bronze: 22 }[bolt.k] : 0,
          best: newBest ? { was: old } : null,
          primary: way.primary,
          secondary: bolt || newBest ? way.secondary.concat([T.rewards.link()]) : way.secondary
        });
      }

      next();
    }

    if (!items.length) {
      ctx.instruct({ en: 'No questions here yet.', vi: 'Chưa có câu hỏi nào.', mood: 'think' });
      ctx.primary({ label: 'Back to the stop', icon: 'back', onClick: function () { T.router.go(big ? 'summit' : 'stop-' + ctx.stop); } });
      return;
    }
    intro();
  }

  T.steps = T.steps || {};
  T.steps.lightning = { mount: mount, secs: null, bolts: BOLTS };
})(window.T = window.T || {});

