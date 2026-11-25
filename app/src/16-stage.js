/* 16-stage.js - the full-screen activity stage that every step is built in, and the five step routes.

   T.stage.open({stop, step, title}) draws the three zones of the UI brief and returns ctx:

     top bar      back arrow (to the stop), the title, the progress, the sound switch
     stage        the Zip instruction strip, then ctx.body: the step engine builds its activity there
     bottom bar   the ONE main button (ctx.primary) and an optional quiet one (ctx.secondary)

   ctx = { stop, step, pack, body,
           instruct({en, vi, mood}), zip(mood), title(text),
           primary({label, onClick, disabled, kind}), secondary({label, onClick}), progress(i, n, {count}),
           later(fn, ms), every(fn, ms), frame(fn), onLeave(fn), onBack(fn),
           saveUnit(unitId, score, max), finish({title, lines}), result({...}), leave() }

   Progress (Phase 2, way-finding): ctx.progress(i, n) shows where the child is inside the step in the top bar:
   dots and "3 of 5" (only "3 of 5" when the dots do not fit beside the title), and a thin bar along the bottom
   edge of the top bar. {count: true}: i is how many are done (the test paper: questions answered).
   The way on (T.stage.wayOn(stop, from)): after a step's result ONE big button to the recommended next step
   ("Next: See it"), quiet buttons "Play again" and "Back to the stop"; when the five steps are done, the extras
   (Lightning round, then My self-check); when those are done too, the next stop (while it is coming soon, the card
   says so and the button goes back to the map).
   The routes 'stop-:n-words' ... 'stop-:n-test' (and the extras 'stop-:n-lightning', 'stop-:n-selfcheck') open the stage and call T.steps[step].mount(ctx).
   A step that is not built yet, whose part is missing from the pack (T.stage.hasPart(n, step)), or
   that throws, shows a friendly "coming soon" screen instead (.stage-soon). The way on after a step
   only ever points at a step that is ready (a quick-practice stop has only its practise games). When the last
   of the nine badges is won, a final moment follows the badge's own (T.rewards.moment, 18-rewards.js).
   The full API is in brief/api-ui.md. */
(function (T) {
  'use strict';

  const el = T.util.el;

  const RESULT_TITLES = ['Nearly there!', 'Step finished!', 'Good work!', 'Excellent!'];      // by stars, 0 to 3
  const RESULT_LINES = [
    'Finish every part to win your first star.',
    'You won 1 star. Play again to win more.',
    'You won 2 stars. So close to 3!',
    'You won all 3 stars.'
  ];

  function stepLabel(id) {
    return T.stepLabel(id);
  }

  function stopInfo(n) {
    return (T.stops || []).filter(function (s) { return s.n === n; })[0] || null;
  }

  // the world as a sentence says it: 'the Flower Lab', 'Water on Earth' (20-stops.js)
  function place(info) {
    return info.place || 'the ' + info.world;
  }

  // the first step of the stop that is not done and has its part in the pack (null: all of those are done)
  function nextReady(stop) {
    for (let i = 0; i < T.STEPS.length; i++) {
      const id = T.STEPS[i].id;
      if (T.progress.stepState(stop, id) !== 'done' && hasPart(stop, id)) return id;
    }
    return null;
  }

  /* ---------- T.stage.open ---------- */

  function open(opts) {
    opts = opts || {};
    const stop = Number(opts.stop) || 0;
    const step = opts.step && opts.step.id ? opts.step.id : String(opts.step || '');
    const pack = (T.packs && T.packs[stop]) || null;
    const screen = T.shell.screen;
    T.ui.empty(screen);

    /* the three zones */
    const backButton = T.ui.iconButton({ icon: 'back', label: opts.backLabel || 'Back to the stop', kind: 'band', cls: 'topbar__back', onClick: goBack });
    const titleEl = el('h1', { class: 'topbar__title' }, opts.title || stepLabel(step));
    const progressEl = el('div', { class: 'topbar__progress', hidden: true });
    const meterFill = el('span', { class: 'stage__meter-fill' });
    const meter = el('span', { class: 'stage__meter', 'aria-hidden': 'true', hidden: true }, meterFill);
    const topbar = el('header', { class: 'topbar' }, backButton, titleEl, progressEl, T.nav ? T.nav.bar('band', stop, true) : null, T.ui.soundSwitch({ kind: 'band', cls: 'topbar__sound' }), meter);

    const strip = T.ui.instruction({ mood: 'happy' });
    const stripBox = el('div', { class: 'stage__strip', hidden: true }, strip.el);
    const body = el('div', { class: 'stage__body' });
    const main = el('div', { class: 'stage__main rise' }, stripBox, body);

    const bar = T.ui.actionBar();
    const root = el('div', { class: 'stage', dataset: { stop: stop, step: step } }, topbar, main, bar.el);
    screen.appendChild(root);

    /* what must stop when the child leaves */
    const timeouts = new Set(), intervals = new Set(), frames = new Set();
    let leaveFns = [];
    let left = false;
    let backFn = null;
    let progress = null;                 // {i, n, count} or null
    let stripOn = false;                 // the step has given the strip a line
    let resultBox = null, stopReveal = null;

    function run(fn, arg) {
      try { return fn(arg); } catch (e) { console.error('T.stage: a step handler failed.', e); }
      return undefined;
    }

    function later(fn, ms) {
      if (left || typeof fn !== 'function') return function () {};
      const id = setTimeout(function () { timeouts.delete(id); run(fn); }, Math.max(0, Number(ms) || 0));
      timeouts.add(id);
      return function cancel() { clearTimeout(id); timeouts.delete(id); };
    }

    function every(fn, ms) {
      if (left || typeof fn !== 'function') return function () {};
      const id = setInterval(function () { run(fn); }, Math.max(16, Number(ms) || 0));
      intervals.add(id);
      return function cancel() { clearInterval(id); intervals.delete(id); };
    }

    function frame(fn) {
      if (left || typeof fn !== 'function') return function () {};
      const id = requestAnimationFrame(function (time) { frames.delete(id); run(fn, time); });
      frames.add(id);
      return function cancel() { cancelAnimationFrame(id); frames.delete(id); };
    }

    function stopTimers() {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      frames.forEach(cancelAnimationFrame);
      timeouts.clear();
      intervals.clear();
      frames.clear();
    }

    function runLeaveFns() {
      const fns = leaveFns;
      leaveFns = [];
      fns.forEach(function (fn) { run(fn); });
    }

    /* the top bar */

    function goBack() {
      if (backFn && run(backFn) === true) return;      // the step handled it (a game goes back to its menu)
      T.router.back();
    }

    // dots and "3 of 7" when they fit beside the whole title, otherwise "3 of 7" only; the thin bar under the top bar
    function drawProgress() {
      T.ui.empty(progressEl);
      progressEl.hidden = !progress || !!resultBox;
      meter.hidden = progressEl.hidden;
      if (!progress) return;
      const count = !!progress.count;
      const text = el('span', { class: 'topbar__count', 'aria-hidden': 'true' }, progress.i + ' of ' + progress.n);
      meterFill.style.setProperty('--f', String(Math.max(0, Math.min(1, progress.i / progress.n))));
      if (progress.n <= 10) progressEl.appendChild(T.ui.dots(progress.i, progress.n, { count: count }));
      else progressEl.appendChild(el('span', { class: 'sr-only' }, progress.i + ' of ' + progress.n + (count ? ' done' : '')));
      progressEl.appendChild(text);
      // measured now, and again on the next frame (the title may still be laying out, e.g. a new scene's title)
      const fit = function () {
        const dots = progressEl.querySelector('.dots');
        if (dots && dots.parentNode === progressEl && titleEl.scrollWidth > titleEl.clientWidth) {   // even 1 px: the title would end in "..."
          progressEl.removeChild(dots);
          text.removeAttribute('aria-hidden');
        }
      };
      if (progress.n <= 10) { fit(); requestAnimationFrame(fit); }
    }

    function setProgress(i, n, o) {
      progress = (i == null || !n) ? null : { i: Number(i) || 0, n: Number(n), count: !!(o && o.count) };
      drawProgress();
    }

    function setTitle(text) {
      titleEl.textContent = String(text == null ? '' : text);
      drawProgress();
    }

    window.addEventListener('resize', drawProgress);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!left) drawProgress(); }, function () {});

    /* the instruction strip */

    // instruct({en, vi, mood}); a plain string is the English line; instruct(null) hides the strip
    function instruct(line) {
      stripOn = line != null;
      stripBox.hidden = !stripOn || !!resultBox;
      if (stripOn) strip.set(typeof line === 'string' ? { en: line, vi: '' } : line);
    }

    /* the result view: a card over the stage, its ONE big button in the bottom bar */

    function closeResult() {
      if (stopReveal) stopReveal();
      stopReveal = null;
      if (!resultBox) return;
      if (resultBox.parentNode) resultBox.parentNode.removeChild(resultBox);
      resultBox = null;
      body.hidden = false;
      stripBox.hidden = !stripOn;
      drawProgress();
    }

    // result({stars, title, lines, primary, secondary, art, mood, onDone}) -> {el, close}
    function result(r) {
      if (left) return { el: null, close: function () {} };       // the child has gone: nothing to show
      r = r || {};
      closeResult();
      const card = T.ui.resultCard({
        stars: r.stars, max: r.max, title: r.title, lines: r.lines, secondary: r.secondary, art: r.art, mood: r.mood, reveal: r.stars != null,
        artMove: r.artMove, best: r.best, prize: r.prize
      });
      resultBox = el('div', { class: 'stage__result' }, card);
      body.hidden = true;
      stripBox.hidden = true;
      progressEl.hidden = true;
      meter.hidden = true;
      main.appendChild(resultBox);
      bar.secondary(null);
      const button = bar.primary(r.primary || null);
      if (button) { try { button.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ } }
      // Phase 6: the medal or bolt lands (a burst the size of the win), then the "New best!" ribbon sparkles
      if (r.artMove && !T.ui.reducedMotion()) {
        later(function () { T.fx.burst(card.querySelector('.result__art'), r.burst || 24); T.fx.sfx('chime', { i: 8 }); }, 620);
      }
      if (r.best) {
        later(function () {
          const ribbon = card.querySelector('.rw-best'), box = ribbon && ribbon.getBoundingClientRect();
          if (box && box.width && !T.ui.reducedMotion()) T.fx.sparkle(box.left + box.width / 2, box.top + box.height / 2, 14);
          T.fx.sfx('pop');
        }, 650);
      }
      if (r.stars != null) {
        stopReveal = T.ui.revealStars(card.querySelector('.stars'), r.stars, {
          onDone: function (count) {
            if (left) return;
            if (count >= (r.max || 3)) { T.fx.sfx('win'); T.fx.burst(card.querySelector('.stars'), 30); }
            if (typeof r.onDone === 'function') run(r.onDone);
          }
        });
      } else if (typeof r.onDone === 'function') {
        later(r.onDone, 400);
      }
      return { el: card, close: closeResult };
    }

    // finish({title, lines, art}): the result of the whole STEP, with the way on (art: a picture instead of Zip, a medal).
    // Phase 6: artMove ('swing' a medal), burst (its size), best ({was}: "New best!"), won (something was won: the quiet
    // "My trophies" button). A badge won now: its line on the card, the big moment (once: stops.N.badgeSeen), its day.
    function finish(f) {
      if (left) return result();
      f = f || {};
      const stars = T.progress.stepStars(stop, step);
      const info = stopInfo(stop);
      const way = wayOn(stop, step, { again: f.again });
      const primary = way.primary, secondary = way.secondary;
      const seenPath = ['stops', String(stop), 'badgeSeen'];
      const newBadge = !!info && T.progress.hasBadge(stop) && T.store.get(seenPath, false) !== true;
      if (newBadge) { T.store.set(seenPath, true); T.rewards.badgeWon(stop); }
      const finale = newFinale();
      // Phase 6: big moments never block the way on (the main button works all the time; a tap skips them)
      const showFinale = finale ? function () {
        T.rewards.moment({ over: T.REWARDS.finale.over, title: T.REWARDS.finale.title });
      } : null;
      const won = newBadge || !!f.won;
      const handle = result({
        stars: stars,
        title: f.title || RESULT_TITLES[stars],
        lines: (f.lines || [RESULT_LINES[stars]]).concat(way.line ? [way.line] : []),
        primary: primary,
        secondary: won ? secondary.concat([T.rewards.link()]) : secondary,
        art: f.art, artMove: f.artMove, burst: f.burst, best: f.best,
        prize: newBadge ? { art: info.badgeArt, text: T.rewards.fill(T.REWARDS.badge.won, { b: info.badge }) } : null,
        onDone: newBadge ? function () {
          // the stop's own badge first, flying into the card; when it was the last of the nine, the trail's moment follows
          T.rewards.moment({ art: info.badgeArt, over: T.REWARDS.badge.over, title: info.badge, target: handle.el && handle.el.querySelector('.result__prize'), onEnd: showFinale });
        } : showFinale
      });
      return handle;
    }

    /* leaving */

    // put the stage back to empty (used when a step engine fails half way through its mount)
    function reset() {
      stopTimers();
      runLeaveFns();
      closeResult();
      T.ui.empty(body);
      backFn = null;
      bar.primary(null);
      bar.secondary(null);
      setProgress(null);
      instruct(null);
    }

    function leave() {
      if (left) return;
      left = true;
      window.removeEventListener('resize', drawProgress);
      stopTimers();
      runLeaveFns();
      if (stopReveal) stopReveal();
      T.ui.closeOverlays();
    }

    return {
      stop: stop, step: step, pack: pack, body: body, root: root,
      instruct: instruct,
      zip: function (mood) { strip.zip(mood); },
      title: setTitle,
      primary: function (o) { return bar.primary(o); },
      secondary: function (o) { return bar.secondary(o); },
      progress: setProgress,
      later: later, every: every, frame: frame,
      onLeave: function (fn) { if (typeof fn === 'function') { if (left) run(fn); else leaveFns.push(fn); } },
      onBack: function (fn) { backFn = typeof fn === 'function' ? fn : null; },
      saveUnit: function (unitId, score, max) { return T.progress.saveUnit(stop, step, unitId, score, max); },
      finish: finish, result: result,
      reset: reset, leave: leave
    };
  }

  /* ---------- the way on: the ONE recommended next thing after a result ---------- */

  const EXTRA_DONE = {
    lightning: function (n) { return T.store.get(['stops', String(n), 'lightning', 'best'], null) != null; },
    selfcheck: function (n) { return !!T.store.get(['stops', String(n), 'selfcheck', 'answers'], null); }
  };

  // the extra to recommend once the five steps are done: the first one that is ready and not done yet (null: none)
  function nextExtra(stop, from) {
    for (let i = 0; i < T.EXTRAS.length; i++) {
      const id = T.EXTRAS[i].id;
      if (id !== from && hasPart(stop, id) && !(EXTRA_DONE[id] && EXTRA_DONE[id](stop))) return id;
    }
    return null;
  }

  // the stop after this one: {info, ready} or null at the end of the trail
  function nextStop(stop) {
    const info = stopInfo(stop + 1);
    if (!info) return null;
    return { info: info, ready: info.status === 'open' && !!(T.packs && T.packs[info.n]) && !!nextReady(info.n) };
  }

  /* wayOn(stop, from, {again}) -> {id, primary, secondary: [quiet buttons], line}
       id         what the main button opens: a step or extra id, 'stop-N' (the next stop), 'map', or 'same' (keep going)
       primary    the ONE big button: "Next: See it", "Next: Lightning round", "Next stop: <world>", "Back to the map"
       secondary  "Play again" (unless the main button already plays again) and "Back to the stop"
       line       a short line for the result card when the next stop is still coming soon, else '' */
  function wayOn(stop, from, opts) {
    opts = opts || {};
    const here = T.router.current().route;
    const again = typeof opts.again === 'function' ? opts.again : function () { T.router.go(here); };
    const playAgain = { label: opts.againLabel || 'Play again', icon: 'replay', onClick: again };
    const backToStop = { label: 'Back to the stop', onClick: function () { T.router.go('stop-' + stop); } };
    const open = function (id) { return function () { T.router.go('stop-' + stop + '-' + id); }; };
    const step = nextReady(stop);
    if (step && step !== from) {
      return { id: step, primary: { label: 'Next: ' + stepLabel(step), iconEnd: 'next', onClick: open(step) }, secondary: [playAgain, backToStop], line: '' };
    }
    if (step === from) {                              // parts of this step are still to do
      return { id: 'same', primary: { label: 'Keep going', iconEnd: 'next', onClick: again }, secondary: [backToStop], line: '' };
    }
    const extra = nextExtra(stop, from);
    if (extra) {
      return { id: extra, primary: { label: 'Next: ' + stepLabel(extra), iconEnd: 'next', onClick: open(extra) }, secondary: [playAgain, backToStop], line: '' };
    }
    const after = nextStop(stop);
    if (after && after.ready) {
      return { id: 'stop-' + after.info.n, primary: { label: 'Next stop: ' + after.info.world, iconEnd: 'next', onClick: function () { T.router.go('stop-' + after.info.n); } },
        secondary: [playAgain, backToStop], line: '' };
    }
    return {
      id: 'map', primary: { label: 'Back to the map', icon: 'map', onClick: function () { T.router.go('home'); } },
      secondary: [playAgain, backToStop],
      line: after ? 'Next stop: ' + after.info.world + '. It is *coming soon*.' : ''
    };
  }

  /* ---------- the end of the whole trail ---------- */

  // the words of the final moment: T.REWARDS.finale ('All nine badges', 'Trail Champion!', 18-rewards-text.js, loaded later)

  // true once, the first time every one of the nine stops has its badge (remembered in trail.finaleSeen)
  function newFinale() {
    const stops = T.stops || [];
    if (!stops.length || !stops.every(function (s) { return T.progress.hasBadge(s.n); })) return false;
    if (T.store.get(['trail', 'finaleSeen'], false) === true) return false;
    T.store.set(['trail', 'finaleSeen'], true);
    return true;
  }

  /* ---------- does the pack have this step's part? ---------- */

  function filled(list) {
    return Array.isArray(list) && list.some(Boolean);
  }

  // hasPart(n, step) -> true when the stop's pack (or, for See it, the stop's registered scenes) has
  // something to show for the step. A step without its part shows the "coming soon" screen, never an error.
  function hasPart(n, step) {
    const pack = T.packs && T.packs[n];
    if (!pack || typeof pack !== 'object') return false;
    switch (step) {
      case 'words': {
        const items = (pack.words && pack.words.items) || {};
        return filled(pack.words && pack.words.sets) && pack.words.sets.some(function (set) {
          return set && Array.isArray(set.keys) && set.keys.some(function (key) { return !!items[key]; });
        });
      }
      case 'see': {
        const def = T.see && typeof T.see.get === 'function' ? T.see.get(n) : null;
        return !!def && filled(def.scenes);
      }
      case 'practise': return filled(pack.practise);
      case 'lightning': return !!pack.lightning && T.steps && !!T.steps.lightning;
      case 'selfcheck': return filled(pack.selfcheck && pack.selfcheck.goals);
      case 'notes': return filled(pack.notes && pack.notes.items);
      case 'test': return filled(pack.test && pack.test.items);
      default: return false;
    }
  }

  /* ---------- "This step is coming soon" ---------- */

  const STEP_ART = T.STEP_ART = {
    words: 'icon-step-words', see: 'icon-step-see', practise: 'icon-step-practise', notes: 'icon-step-notes', test: 'icon-step-test',
    lightning: 'icon-extra-lightning', selfcheck: 'icon-extra-selfcheck'
  };

  function showBeingBuilt(ctx) {
    const label = stepLabel(ctx.step);
    ctx.instruct({ en: 'This step is *coming soon*.', vi: 'Phần này *sắp ra mắt*.', mood: 'think' });
    ctx.body.appendChild(el('div', { class: 'stage-soon' },
      el('div', { class: 'stage-soon__pic' },
        T.ui.plate(T.ui.art(STEP_ART[ctx.step] || 'icon-step', { decorative: true }), { shape: 'round', replay: false }),
        el('span', { class: 'stage-soon__zip' }, T.ui.zip('think'))),
      el('h2', { class: 'stage-soon__title' }, label + ' is coming soon'),
      el('p', { class: 'stage-soon__text' }, 'Zip is still getting this step ready. Try another step for now.')));
    ctx.primary({ label: 'Back to the stop', icon: 'back', onClick: function () { T.router.go('stop-' + ctx.stop); } });
  }

  /* ---------- the five step routes ---------- */

  function openStep(n, step) {
    const info = stopInfo(n);
    if (!info) { T.router.go('home'); return null; }
    if (info.status !== 'open' || !T.packs[n]) { T.router.go('stop-' + n); return null; }    // the locked hub explains
    const ctx = open({ stop: n, step: step.id, title: step.label });
    const engine = T.steps && T.steps[step.id];
    if (!hasPart(n, step.id)) {
      showBeingBuilt(ctx);                            // the pack has no words, scenes, games, notes or test yet: "coming soon"
    } else if (engine && typeof engine.mount === 'function') {
      try {
        const extra = engine.mount(ctx);
        if (typeof extra === 'function') ctx.onLeave(extra);
      } catch (e) {
        console.error('T.stage: the step "' + step.id + '" did not open.', e);
        ctx.reset();
        showBeingBuilt(ctx);
      }
    } else {
      showBeingBuilt(ctx);
    }
    return ctx.leave;
  }

  T.STEPS.concat(T.EXTRAS).forEach(function (step) {
    T.router.register('stop-:n-' + step.id, function (params) { return openStep(params.n, step); });
  });

  T.stage = { open: open, hasPart: hasPart, wayOn: wayOn, nextReady: nextReady, nextExtra: nextExtra, nextStop: nextStop, extraDone: EXTRA_DONE };
})(window.T = window.T || {});

