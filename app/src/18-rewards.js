/* 18-rewards.js - Phase 6 (Jovan's plan): rewards that feel earned. The words are in T.REWARDS (18-rewards-text.js).

   Celebrations are scaled to the win and never block the next step: nothing here takes a tap (pointer-events: none),
   nothing covers the action bar, the main button keeps working all the time, and a tap or a key skips a big moment.
   Every moment lasts at most about 1.5 s. Still (reduced motion or effects tier 1): the final state at once, then a
   gentle fade (opacity only), no particles.
     a star      the step's stars light one by one (T.ui.revealStars) and fly to the hub's total (35-hub.js)   small
     a run       T.rewards.counter: "3 in a row!" (then 5, 10, every 5): a small badge pops on Zip, Zip says it    small
     a new best  the result card's "New best!" ribbon with the old best (T.ui.resultCard opts.best)                medium
     a medal     the medal swings onto the result card, a bolt zaps onto it (resultCard opts.artMove)             medium
     a badge     T.rewards.moment: the badge pops over the stage (not the action bar) with confetti and Zip's
                 cheer, then flies into the result card; on the map it flies onto its stop (T.rewards.land)     big

   T.rewards.counter(stop, kind) -> {hit(first) -> Zip's line {en, vi} at a milestone (else null), count()}
                                  kind: 'practise' | 'see' | 'lightning'. A right answer at the first try adds one;
                                  anything else starts again quietly (no "you lost your run" message, ever).
   T.rewards.pop(n)               the small streak badge on Zip in the strip
   T.rewards.saveRun(stop, kind, n)   keep the longest run (kind 'test' too: the paper, once it is marked)
   T.rewards.runLine(n)           Zip's line for a run of n
   T.rewards.moment({art, over, title, target, onEnd})   the big moment; target: a node in the result card that the
                                  badge flies into (it waits hidden, class is-waiting, and lands with is-landed)
   T.rewards.badgeWon(stop)       note the day a badge was first won (trophy.badges.N.on)
   T.rewards.land(discOf)         the map: a badge not yet on the map flies onto its stop's disc, once per badge
   T.rewards.link()               the quiet "My trophies" button of a result card that won something
   T.rewards.skip()               end every big moment now (a tap, a key, a new screen)

   Saved in the child's v3 document (it follows the child in the school build; 86-mtrail.js joins it "keep the best"):
     stops.N.streak.<kind>   the longest run (a number; the bigger one wins a join)
     trophy.badges.N.on      the day the badge was first won, as 20261128 (the earlier day wins a join)
     trophy.landed.N         true once the badge has flown onto the map (true wins)
     trophy.seen.<key>       true once the shelf has shown a trophy as "New!" (b1, m1-gold, l1-silver; true wins)
   The personal bests are the results the steps already keep (never lower): a Practise game's unit {score, max},
   stops.N.test.best, stops.N.lightning.best; a step compares with them BEFORE it saves (the old best is shown). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const R = T.REWARDS;
  const KINDS = ['practise', 'see', 'test', 'lightning'];

  const still = function () { return T.ui.reducedMotion(); };
  const fill = function (s, vars) { return String(s).replace(/\{(\w)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; }); };

  // 3, 5, 10, then every 5 (a long Lightning round): a milestone of a run
  function isMilestone(n) { return n === 3 || n === 5 || n === 10 || (n > 10 && n % 5 === 0); }

  function runLine(n) {
    const line = R.streak[n] || R.streak.more;
    return { en: fill(line.en, { n: n }), vi: fill(line.vi, { n: n }), mood: 'cheer' };
  }

  function saveRun(stop, kind, n) {
    if (KINDS.indexOf(kind) < 0 || !(n >= 3) || !(Number(stop) >= 1)) return false;   // stop 0: the Summit's big round
    const path = ['stops', String(stop), 'streak', kind];
    const old = Number(T.store.get(path, 0)) || 0;
    if (n <= old) return false;
    T.store.set(path, n);
    return true;
  }

  /* ---------- the small streak badge on Zip ---------- */

  let popNode = null, popTimer = 0;

  function clearPop() {
    clearTimeout(popTimer);
    if (popNode && popNode.parentNode) popNode.parentNode.removeChild(popNode);
    popNode = null;
  }

  // n on a gold badge that Zip holds up in the strip (over Zip only: never over Zip's words, the question or a
  // button); it never takes a tap and leaves by itself (about 1.4 s). Zip's line says "3 in a row!".
  function pop(n) {
    clearPop();
    const zip = document.querySelector('#screen .stage__strip:not([hidden]) .instruct__zip');
    const box = zip && zip.closest('.instruct');
    const r = zip ? zip.getBoundingClientRect() : null, s = box ? box.getBoundingClientRect() : null;
    if (!r || !r.width || !s) return null;
    const node = el('div', { class: ['rw-pop', still() && 'is-still'], 'aria-hidden': 'true' }, el('span', { class: 'rw-pop__n' }, String(n)));
    // Zip may be in the middle of a hop (a transform): the badge keeps inside the strip's own box all the same
    const size = Math.min(r.width * 0.86, 44);
    node.style.width = node.style.height = Math.round(size) + 'px';
    node.style.left = Math.round(r.left + (r.width - size) / 2) + 'px';
    node.style.top = Math.round(Math.min(r.top + r.height * 0.42, s.bottom - size - 5)) + 'px';
    (T.shell ? T.shell.app : document.body).appendChild(node);
    popNode = node;
    T.fx.sfx('chime', { i: Math.min(10, 6 + Math.floor(n / 5)) });
    if (!still()) {
      const b = node.getBoundingClientRect();
      T.fx.sparkle(b.left + b.width / 2, b.top + b.height / 2, 12);
    }
    popTimer = setTimeout(function () { fadeOut(node, 250, clearPop); }, 1150);
    return node;
  }

  // a gentle fade (the Web Animations API runs under reduced motion too: opacity only, a quarter of a second)
  function fadeOut(node, ms, done) {
    try {
      if (node && node.animate) {
        const a = node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
        a.onfinish = done; a.oncancel = done;
        return;
      }
    } catch (e) { /* fall through */ }
    done();
  }

  /* ---------- a run of right answers ---------- */

  function counter(stop, kind) {
    let n = 0;
    return {
      hit: function (first) {
        if (!first) { n = 0; return null; }
        n += 1;
        saveRun(stop, kind, n);
        if (!isMilestone(n)) return null;
        pop(n);
        return runLine(n);
      },
      count: function () { return n; }
    };
  }

  /* ---------- the big moment (a badge, the end of the trail) ---------- */

  const live = [];

  function skip() { live.slice().forEach(function (m) { m.end(true); }); }
  ['pointerdown', 'keydown', 'click'].forEach(function (type) { document.addEventListener(type, function () { if (live.length) skip(); }, true); });
  window.addEventListener('hashchange', function () { skip(); clearPop(); });

  function moment(o) {
    o = o || {};
    skip();
    const quiet = still();
    const target = o.target && o.target.isConnected ? o.target : null;
    const bar = document.querySelector('#screen .actionbar');
    const barTop = bar && bar.getBoundingClientRect().height ? bar.getBoundingClientRect().top : window.innerHeight;
    const pic = el('div', { class: 'rw-moment__badge' }, o.art ? T.ui.art(o.art, { decorative: true }) : T.ui.zip('cheer'));
    const layer = el('div', { class: ['rw-moment', quiet && 'is-still'], role: 'status', 'aria-live': 'polite' },
      el('div', { class: 'rw-moment__shade', 'aria-hidden': 'true' }),
      el('div', { class: 'rw-moment__stage' },
        el('div', { class: 'rw-moment__rays', 'aria-hidden': 'true' }), pic,
        o.art ? el('span', { class: 'rw-moment__zip', 'aria-hidden': 'true' }, T.ui.zip('cheer')) : null),
      o.over ? el('p', { class: 'rw-moment__over' }, o.over) : null,
      el('p', { class: 'rw-moment__title' }, o.title || ''));
    layer.style.bottom = Math.max(0, Math.round(window.innerHeight - barTop)) + 'px';
    (T.shell ? T.shell.app : document.body).appendChild(layer);
    if (target && !quiet) target.classList.add('is-waiting');
    const timers = [];
    let done = false;
    const handle = {
      el: layer,
      end: function () {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout);
        const i = live.indexOf(handle);
        if (i >= 0) live.splice(i, 1);
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        if (target) target.classList.remove('is-waiting');
        if (typeof o.onEnd === 'function') { try { o.onEnd(); } catch (e) { console.error('T.rewards: onEnd failed.', e); } }
      }
    };
    live.push(handle);
    T.fx.sfx('win');
    if (quiet) {
      timers.push(setTimeout(function () { fadeOut(layer, 250, handle.end); }, 1200));
      return handle;
    }
    const at = function (dx, n) {
      const r = pic.getBoundingClientRect();
      if (r.width) T.fx.confetti(r.left + r.width / 2 + dx * r.width, r.top + r.height * 0.4, n, 12, 52);   // a short fall: gone before it reaches the action bar
    };
    timers.push(setTimeout(at, 150, 0, 44), setTimeout(at, 420, -0.8, 24), setTimeout(at, 560, 0.8, 24));
    // at 1.05 s the words fade and the badge flies into the result card (or shrinks away): gone by 1.5 s
    timers.push(setTimeout(function () {
      layer.classList.add('is-leaving');
      const a = pic.getBoundingClientRect(), b = target ? target.getBoundingClientRect() : null;
      const k = b && b.width ? Math.max(0.12, Math.min(1, b.height / Math.max(1, a.height))) : 0.3;
      const dx = b && b.width ? b.left + b.width / 2 - (a.left + a.width / 2) : 0, dy = b && b.width ? b.top + b.height / 2 - (a.top + a.height / 2) : 0;
      try {
        pic.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')', opacity: b && b.width ? 1 : 0 }],
          { duration: 420, easing: 'cubic-bezier(.45, 0, .25, 1)', fill: 'forwards' });
      } catch (e) { /* the badge just leaves with the layer */ }
    }, 1050));
    timers.push(setTimeout(function () {
      if (target) {
        target.classList.remove('is-waiting');
        target.classList.remove('is-landed'); void target.offsetWidth; target.classList.add('is-landed');
        const r = target.getBoundingClientRect();
        if (r.width) T.fx.sparkle(r.left + Math.min(r.width, r.height) / 2, r.top + r.height / 2, 14);
        T.fx.sfx('chime', { i: 9 });
      }
      handle.end();
    }, 1480));
    return handle;
  }

  /* ---------- badges: the day, the flight onto the map ---------- */

  function today() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function badgeWon(stop) {
    const path = ['trophy', 'badges', String(stop), 'on'];
    if (T.store.get(path, null) != null) return false;
    T.store.set(path, today());
    return true;
  }

  // discOf(n) -> the map node's disc. A badge that has not flown onto the map yet pops in the middle of the screen
  // and flies onto its stop (about 1.3 s, one after another), once. Still, hidden or off screen: it is simply there.
  // -> a function that ends it now (the map's cleanup)
  function land(discOf) {
    const todo = (T.stops || []).filter(function (s) {
      return T.packs[s.n] && T.progress.hasBadge(s.n) && T.store.get(['trophy', 'landed', String(s.n)], false) !== true;
    });
    const timers = [];
    let flying = null, gone = false;
    const mark = function (s) { T.store.set(['trophy', 'landed', String(s.n)], true); };
    if (!todo.length) return function () {};
    const finish = function () {
      if (flying) { const f = flying; flying = null; f(); }
    };
    const next = function (i) {
      if (gone || i >= todo.length) return;
      const s = todo[i], disc = discOf(s.n);
      const r = disc ? disc.getBoundingClientRect() : null;
      const onScreen = r && r.width && r.bottom > 0 && r.top < window.innerHeight;
      if (still() || !onScreen || typeof document.body.animate !== 'function') { mark(s); next(i + 1); return; }
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.34;
      const copy = el('div', { class: 'rw-fly', 'aria-hidden': 'true' }, T.ui.art(s.badgeArt, { decorative: true }));
      copy.style.width = copy.style.height = Math.round(size) + 'px';
      copy.style.left = Math.round(window.innerWidth / 2 - size / 2) + 'px';
      copy.style.top = Math.round(window.innerHeight * 0.42 - size / 2) + 'px';
      (T.shell ? T.shell.app : document.body).appendChild(copy);
      T.fx.sfx('whoosh');
      const dx = r.left + r.width / 2 - window.innerWidth / 2, dy = r.top + r.height / 2 - window.innerHeight * 0.42, k = r.width / size;
      const anim = copy.animate([
        { offset: 0, transform: 'scale(.3)', opacity: 0 },
        { offset: 0.25, transform: 'scale(1.06)', opacity: 1 },
        { offset: 0.5, transform: 'scale(1)', opacity: 1 },
        { offset: 1, transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')', opacity: 1 }
      ], { duration: 1150, easing: 'ease-in-out', fill: 'forwards' });
      let over = false;
      flying = function () {
        if (over) return;
        over = true;
        try { anim.cancel(); } catch (e) { /* gone */ }
        if (copy.parentNode) copy.parentNode.removeChild(copy);
        mark(s);
        const node = disc.closest('.map-node');
        if (node) { node.classList.remove('is-landed'); void node.offsetWidth; node.classList.add('is-landed'); }
        const q = disc.getBoundingClientRect();
        if (q.width) T.fx.sparkle(q.left + q.width / 2, q.top + q.height / 2, 16);
        T.fx.sfx('chime', { i: 9 });
      };
      anim.onfinish = function () { if (flying) { finish(); timers.push(setTimeout(next, 250, i + 1)); } };
    };
    timers.push(setTimeout(next, 500, 0));
    // a tap or a key: every badge lands at once (the tap itself goes on to what it was for)
    const skipNow = function () { if (!flying || gone) return; gone = true; timers.forEach(clearTimeout); finish(); todo.forEach(mark); };
    document.addEventListener('pointerdown', skipNow, true);
    document.addEventListener('keydown', skipNow, true);
    return function stop() {
      gone = true;
      timers.forEach(clearTimeout);
      finish();
      document.removeEventListener('pointerdown', skipNow, true);
      document.removeEventListener('keydown', skipNow, true);
    };
  }

  function link() {
    return { label: R.link, icon: 'trophy', onClick: function () { T.router.go('trophies'); } };
  }

  T.rewards = {
    counter: counter, pop: pop, saveRun: saveRun, runLine: runLine, isMilestone: isMilestone,
    moment: moment, badgeWon: badgeWon, land: land, link: link, skip: skip, today: today, fill: fill, KINDS: KINDS
  };
})(window.T = window.T || {});

