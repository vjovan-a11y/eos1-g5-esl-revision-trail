/* 35-hub.js - the stop hub (route 'stop-:n').

   The world scene is the header. Under it: the stop's title, its blurb (with a VI button) and the
   five steps as a short path of cards, then the two extras (Lightning round, My self-check) side by side. Nothing is locked, but the recommended next step is
   highlighted, Zip stands on it, and it is repeated as the ONE big button ("Start: Words").
   A stop whose pack has not arrived yet gets a friendly "coming soon" hub with a way back.
   Step lines are counted from the pack; a step whose part is missing says "Coming soon".
   A quick-practice stop (T.stops[i].quick: only its games are ready) says so under its title:
   a "Quick practice" chip and one strip line.
   Way-finding (Phase 2): under the title, a bar of five parts and "2 of 5 steps done" with the stars; the next
   step's card says why in one short line ("Next: learn the words first."). When the five steps are done, the next
   extra is highlighted and the main button opens it; then the next stop (or the map while it is coming soon).
   The first visit: a hand points at the next step's card (T.guide). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const STEP_ART = T.STEP_ART;                       // 16-stage.js: the picture of every step and extra
  const SOON = 'Coming soon';                        // the line of a step whose part is not in the pack yet
  // why the next step is next: one short line on its card
  const WHY = {
    words: 'Next: learn the words first.',
    see: 'Next: see how it works.',
    practise: 'Next: practise it.',
    notes: 'Next: read how to do it.',
    test: 'Next: show what you know!',
    lightning: 'Next: beat the clock!',
    selfcheck: 'Next: tell your teacher how it went.',
    started: 'Next: carry on where you stopped.'
  };
  const QUICK = {
    chip: 'Quick practice',
    line: { en: 'Practise now. The rest of this stop is *coming soon*.', vi: 'Hãy luyện tập ngay. Phần còn lại của trạm này *sắp ra mắt*.' }
  };

  // the world as a sentence says it: 'the Flower Lab', 'Water on Earth' (20-stops.js)
  function place(info) {
    return info.place || 'the ' + info.world;
  }

  function stepLabel(id) {
    return T.stepLabel(id);
  }

  function count(thing) {
    if (Array.isArray(thing)) return thing.length;
    return thing && typeof thing === 'object' ? Object.keys(thing).length : 0;
  }

  function plural(k, one, many) {
    return k + ' ' + (k === 1 ? one : many);
  }

  // does the pack have this step's part yet? (16-stage.js decides; without it, assume yes)
  function ready(n, step) {
    return !(T.stage && typeof T.stage.hasPart === 'function') || T.stage.hasPart(n, step);
  }

  // the key words of the stop: every word of a set that has its card in the pack
  function wordCount(pack) {
    const words = pack.words || {}, items = words.items || {}, seen = {};
    (words.sets || []).forEach(function (set) {
      ((set && set.keys) || []).forEach(function (key) { if (items[key]) seen[key] = true; });
    });
    return count(seen);
  }

  // the one line under a step, counted from the pack's own content (so it can never go stale);
  // See it uses the pack's line (ui.steps.see) when it has one, else the number of scenes
  function stepLine(pack, step, n) {
    if (!ready(n, step)) return SOON;
    if (step === 'test') {
      const best = T.progress.unit(n, 'test', 'paper');
      if (best && best.max > 0) return 'Best: ' + best.score + ' out of ' + best.max + ' right';
    }
    switch (step) {
      case 'words': return plural(wordCount(pack), 'picture word', 'picture words');
      case 'see': {
        const own = pack.ui && pack.ui.steps && pack.ui.steps.see;
        if (own) return typeof own === 'string' ? own : String(own.en || '');
        const def = T.see && T.see.get ? T.see.get(n) : null;
        const k = def && def.scenes ? def.scenes.length - 1 : 0;
        return k > 0 ? plural(k, 'example', 'examples') + ' to explore, then a challenge' : 'Explore, then try the challenge';
      }
      case 'practise': return plural(count(pack.practise), 'game', 'games') + ': learn it, then exam style';
      case 'lightning': {
        const best = T.store.get(['stops', String(n), 'lightning', 'best'], null);
        return best ? 'Best: ' + best + ' right' : 'Quick questions against the clock';
      }
      case 'selfcheck': return T.store.get(['stops', String(n), 'selfcheck', 'answers'], null) ? 'Saved. You can change it.' : 'What can I do? Tell your teacher.';
      case 'notes': return plural(count(pack.notes && pack.notes.items), 'thing', 'things') + ' to remember';
      case 'test': return plural(count(pack.test && pack.test.items), 'question', 'questions') + ', from easy to hard';
      default: return '';
    }
  }

  // the step to recommend: the first one that is not done and has its part in the pack
  function nextReady(n) {
    for (let i = 0; i < T.STEPS.length; i++) {
      const id = T.STEPS[i].id;
      if (T.progress.stepState(n, id) !== 'done' && ready(n, id)) return id;
    }
    return null;
  }

  /* ---------- the world scene as a header ---------- */

  function numbers(text) {
    return String(text || '').split(/[\s,]+/).filter(Boolean).map(Number);
  }

  const MAX_ZOOM_OUT = 1.3;          // how far the scene may shrink to keep its heart clear

  // Zoom the scene so that its important part (data-safe: x, y, width, height) runs from edge to
  // edge of the header. Its heart (data-band: top, bottom) should stay clear of the buttons that
  // float on top of the header (cover.top px) and of the sheet that laps over its foot
  // (cover.bottom px): the scene zooms out a little for that. A slim header cannot keep the whole
  // heart clear, so it shows the foot of it (the bench) large, and the buttons float over the rest.
  // A very tall box shows all the height instead, and its sides are cut.
  function fitScene(svg, box, cover) {
    const view = numbers(svg.getAttribute('data-view')), safe = numbers(svg.getAttribute('data-safe'));
    const w = box.clientWidth, h = box.clientHeight;
    if (view.length !== 4 || safe.length !== 4 || !w || !h) return;
    const band = numbers(svg.getAttribute('data-band'));
    const aspect = w / h, free = h - cover.top - cover.bottom;
    let bw = Math.min(view[2], safe[2] * 1.04), bh = bw / aspect;   // a little air beside the safe part
    const need = band.length === 2 && free > 0 ? (band[1] - band[0]) * h / free : Infinity;   // the height that keeps the band clear
    const roomy = need <= bh * MAX_ZOOM_OUT;
    if (roomy && bh < need) { bh = need; bw = bh * aspect; }
    if (bw > view[2]) { bw = view[2]; bh = bw / aspect; }
    if (bh > view[3]) { bh = view[3]; bw = bh * aspect; }
    const centred = safe[1] + safe[3] / 2 - bh / 2;
    let top = centred;
    if (band.length === 2) {
      top = roomy
        ? Math.min(centred, band[0] - cover.top * bh / h)                     // the band starts just under the buttons
        : band[1] + (band[1] - band[0]) * 0.1 - (h - cover.bottom) * bh / h;    // the foot of the band sits just above the sheet
    }
    let x = T.util.clamp(safe[0] + safe[2] / 2 - bw / 2, view[0], view[0] + view[2] - bw);
    const y = T.util.clamp(top, view[1], view[1] + view[3] - bh);
    x = T.util.clamp(x - intoGap(svg, x, y, w / bw, cover) * bw / w, view[0], view[0] + view[2] - bw);
    svg.setAttribute('viewBox', [x, y, bw, bh].map(function (v) { return Math.round(v * 10) / 10; }).join(' '));
  }

  // A slim header (a phone) cannot keep the heart under the buttons. If the scene marks the main part of its
  // heart (data-heart) and that part reaches up among the buttons, the scene slides sideways by the least
  // amount that puts it in the free gap between them (cover.gap: left, right px). -> the slide in px
  function intoGap(svg, x, y, k, cover) {
    const heart = cover.gap && svg.querySelector('[data-heart]');
    if (!heart) return 0;
    let b = null;
    try { b = heart.getBBox(); } catch (e) { b = null; }
    if (!b || !b.width || (b.y - y) * k >= cover.top) return 0;
    const l = (b.x - x) * k, r = (b.x + b.width - x) * k, g0 = cover.gap[0], g1 = cover.gap[1];
    if (r - l > g1 - g0) return (g0 + g1) / 2 - (l + r) / 2;          // too wide for the gap: its middle in the middle
    if (r > g1) return g1 - r;
    if (l < g0) return g0 - l;
    return 0;
  }

  // the free span between the buttons on the left and those on the right of the bar, in px from the box's left
  // (layout offsets, so an enter animation cannot disturb it)
  function freeGap(controls, box) {
    const mid = box.offsetWidth / 2;
    let left = 0, right = box.offsetWidth;
    Array.prototype.forEach.call(controls.children, function (c) {
      if (!c.offsetWidth) return;
      const a = controls.offsetLeft + c.offsetLeft, b = a + c.offsetWidth;
      if ((a + b) / 2 < mid) left = Math.max(left, b + 8); else right = Math.min(right, a - 8);
    });
    return [left, right];
  }

  // -> {el, fit(), stop()}: the scene, live when motion is allowed, at night when the dark theme is showing.
  // controls: the buttons that float on the scene. sheet(): the element that laps over its bottom, if any.
  /* Until a world's scene is drawn, the header shows a placeholder made of the world's own tokens:
     a sky, two soft hills, slow motes, and the stop's badge in the middle. It carries the same
     data-view / data-safe / data-band hints as a real scene, so fitScene keeps the badge clear of
     the buttons and of the sheet. */
  function placeholderScene(info) {
    const sky = T.util.uid('wph-sky'), clip = T.util.uid('wph-clip');
    const badge = T.ui.art(info.badgeArt, { decorative: true });
    ['x', 'y', 'width', 'height'].forEach(function (name, k) { badge.setAttribute(name, String([302, 118, 196, 196][k])); });
    badge.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const motes = [[120, 120, 7], [215, 70, 5], [610, 95, 6], [700, 160, 4], [540, 50, 4], [300, 200, 4], [80, 230, 5]];
    return el('svg', {
      class: 'art hub__art world-ph', viewBox: '0 0 800 400', 'aria-hidden': 'true', focusable: 'false',
      'data-view': '0 0 800 400', 'data-safe': '0 70 800 280', 'data-band': '104 328'
    },
      el('defs',
        el('linearGradient', { id: sky, x1: '0', y1: '0', x2: '0', y2: '1' },
          el('stop', { offset: '0', class: 'world-ph__sky1' }), el('stop', { offset: '1', class: 'world-ph__sky2' })),
        el('clipPath', { id: clip }, el('circle', { cx: '400', cy: '216', r: '98' }))),
      el('rect', { x: '0', y: '0', width: '800', height: '400', fill: 'url(#' + sky + ')' }),
      el('circle', { class: 'world-ph__sun', cx: '400', cy: '210', r: '170' }),
      el('path', { class: 'world-ph__far', d: 'M0 286C120 236 230 250 330 270S560 226 680 250 780 268 800 260V400H0Z' }),
      el('path', { class: 'world-ph__near', d: 'M0 330C150 300 290 316 420 324S680 298 800 316V400H0Z' }),
      el('g', { class: 'world-ph__motes' }, motes.map(function (m, k) {
        return el('circle', { class: 'world-ph__mote', cx: String(m[0]), cy: String(m[1]), r: String(m[2]), style: { '--k': String(k) } });
      })),
      el('circle', { class: 'world-ph__ring', cx: '400', cy: '216', r: '112' }),
      el('circle', { class: 'world-ph__rim', cx: '400', cy: '216', r: '104' }),
      el('g', { 'clip-path': 'url(#' + clip + ')' }, badge));
  }

  function buildScene(info, controls, sheet) {
    const drawn = !!(window.T_ART && typeof window.T_ART[info.sceneArt] === 'string');
    const scene = drawn ? T.ui.art(info.sceneArt, { cls: 'hub__art' }) : placeholderScene(info);
    const box = el('div', { class: ['hub__scene', !drawn && 'hub__scene--placeholder'] }, scene, controls);
    const night = info.sceneArt + '-night';
    const paint = function () { scene.classList.toggle(night, T.ui.isDark()); };
    const fit = function () {
      // how far the sheet laps over the foot of the scene (not at all when it stands beside it);
      // layout offsets are used, so an enter animation cannot disturb the sums
      const below = sheet();
      const under = below && below.offsetTop > box.offsetTop && below.offsetLeft < box.offsetLeft + box.offsetWidth;
      const lap = under ? box.offsetTop + box.offsetHeight - below.offsetTop : 0;
      fitScene(scene, box, { top: controls.offsetTop + controls.offsetHeight + 8, bottom: Math.max(0, lap) + 8, gap: freeGap(controls, box) });
    };
    scene.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    if (!T.ui.reducedMotion()) scene.classList.add('is-live');
    paint();
    const stopTheme = T.ui.onTheme(paint);
    let observer = null;
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(fit);
      observer.observe(box);
    } else {
      window.addEventListener('resize', fit);
    }
    return {
      el: box,
      fit: fit,
      stop: function () {
        stopTheme();
        if (observer) observer.disconnect(); else window.removeEventListener('resize', fit);
      }
    };
  }

  function backButton() {
    return T.ui.iconButton({ icon: 'back', label: 'Back to the map', kind: 'float', onClick: function () { T.router.go('home'); } });
  }

  /* ---------- an open stop ---------- */

  function buildStep(info, step, i) {
    const starsBox = el('span', { class: 'step-card__stars' });
    const line = el('span', { class: 'step-card__line' });
    const state = el('span', { class: 'step-card__state', 'aria-hidden': 'true' });
    const zipSpot = el('span', { class: 'step-card__zip', 'aria-hidden': 'true' });
    const card = el('button', { type: 'button', class: 'step-card' },
      el('span', { class: 'step-card__icon' },
        T.ui.plate(T.ui.art(STEP_ART[step.id], { decorative: true }), { shape: 'round', replay: false }),
        el('span', { class: 'step-card__num', 'aria-hidden': 'true' }, String(i + 1)),
        state),
      el('span', { class: 'step-card__text' },
        el('span', { class: 'step-card__top' }, el('span', { class: 'step-card__label' }, step.label), starsBox),
        line),
      zipSpot);
    card.addEventListener('click', function () {
      T.fx.sfx('tap');
      T.router.go('stop-' + info.n + '-' + step.id);
    });
    const item = el('li', card);

    function refresh(pack, isNext) {
      const now = T.progress.stepState(info.n, step.id);
      const stars = T.progress.stepStars(info.n, step.id);
      ['new', 'started', 'done'].forEach(function (name) { card.classList.toggle('is-' + name, name === now); });
      card.classList.toggle('is-next', isNext);
      card.classList.toggle('is-building', !ready(info.n, step.id));
      item.classList.toggle('is-soon', !ready(info.n, step.id));      // a quick-practice hub draws these smaller
      line.textContent = isNext ? (now === 'started' ? WHY.started : WHY[step.id]) : stepLine(pack, step.id, info.n);
      T.ui.empty(starsBox).appendChild(T.ui.stars(stars, 3, { size: 'sm' }));
      T.ui.empty(state);
      if (now === 'done') state.appendChild(T.ui.icon('check'));
      T.ui.empty(zipSpot);
      if (isNext) zipSpot.appendChild(T.ui.zip('happy'));
      card.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + step.label + '. ' + line.textContent.replace(/\.$/, '') + '. ' +
        (now === 'done' ? 'Done, ' + stars + ' of 3 stars.' : now === 'started' ? 'Started.' : 'Not started yet.') +
        (isNext ? ' Do this step next.' : ''));
    }

    return { id: step.id, el: item, stars: starsBox, refresh: refresh };
  }

  // one extra (Lightning round, My self-check): a smaller card, no number and no stars
  function buildExtra(info, extra) {
    const line = el('span', { class: 'step-card__line' });
    const card = el('button', { type: 'button', class: 'step-card step-card--extra' },
      el('span', { class: 'step-card__icon' },
        T.ui.plate(T.ui.art(STEP_ART[extra.id], { decorative: true }), { shape: 'round', replay: false })),
      el('span', { class: 'step-card__text' },
        el('span', { class: 'step-card__label' }, extra.label),
        line));
    card.addEventListener('click', function () {
      T.fx.sfx('tap');
      T.router.go('stop-' + info.n + '-' + extra.id);
    });
    const item = el('li', card);

    function refresh(pack, isNext) {
      const on = ready(info.n, extra.id);
      card.classList.toggle('is-building', !on);
      card.classList.toggle('is-next', !!isNext);
      item.classList.toggle('is-soon', !on);
      line.textContent = isNext ? WHY[extra.id] : stepLine(pack, extra.id, info.n);
      card.setAttribute('aria-label', extra.label + '. ' + line.textContent.replace(/[.!]$/, '') + '.' + (isNext ? ' Do this next.' : ''));
    }

    return { id: extra.id, el: item, refresh: refresh };
  }

  /* The total of stars of the stop, in the corner of the scene. New stars fly to it from their step
     card, once: what has been shown is remembered per step under stops.<n>.starsSeen, next to
     the results. -> {el, show(steps), stop()} */
  function buildTotal(info) {
    const total = el('span', { class: 'star-total star-total--float', role: 'img' });
    const seenPath = ['stops', String(info.n), 'starsSeen'];
    const flights = [];                // timers of the stars that are still to fly
    let showing = 0, gone = false;

    function paint(n, bump) {
      showing = n;
      T.ui.empty(total);
      total.appendChild(T.ui.stars(n > 0 ? 1 : 0, 1));
      total.lastChild.setAttribute('aria-hidden', 'true');
      total.appendChild(el('span', n + ' / 15'));
      total.setAttribute('aria-label', n + ' of 15 stars');
      if (!bump) return;
      total.classList.remove('is-bump');
      void total.offsetWidth;
      total.classList.add('is-bump');
    }

    // -> one entry per star that nobody has seen yet: the step card it belongs to
    function newStars(steps) {
      const seen = T.store.get(seenPath, {}) || {};
      const fresh = [];
      steps.forEach(function (step) {
        const have = T.progress.stepStars(info.n, step.id);
        for (let k = Math.min(have, Number(seen[step.id]) || 0); k < have; k++) fresh.push(step);
        seen[step.id] = have;
      });
      T.store.set(seenPath, seen);
      return fresh;
    }

    function show(steps) {
      const stars = T.progress.stopStars(info.n);
      const fresh = newStars(steps);
      flights.splice(0).forEach(clearTimeout);
      if (!fresh.length || T.ui.reducedMotion()) { paint(stars); return; }
      const flying = fresh.slice(0, 5);                // more than five at once only count up
      paint(Math.max(0, stars - flying.length));
      flying.forEach(function (step, k) {
        flights.push(setTimeout(function () {
          T.fx.flyStar(step.stars, total, { i: 4 + k }).then(function () {
            if (!gone) paint(Math.min(stars, showing + 1), true);
          });
        }, 550 + k * 280));
      });
      flights.push(setTimeout(function () { paint(stars); }, 550 + flying.length * 280 + 1200));   // whatever happened, end right
    }

    function stop() {
      gone = true;
      flights.forEach(clearTimeout);
    }

    return { el: total, show: show, stop: stop };
  }

  // the extra to recommend once the five steps are done (16-stage.js), or null
  function nextExtra(n) {
    return nextReady(n) === null && T.stage && T.stage.nextExtra ? T.stage.nextExtra(n, '') : null;
  }

  // the ONE big button of the hub: the recommended next step, then the extras, then the next stop or the map
  function setMainButton(bar, info) {
    const next = nextReady(info.n);
    if (!next) {
      const extra = nextExtra(info.n);
      const after = T.stage && T.stage.nextStop ? T.stage.nextStop(info.n) : null;
      if (extra) bar.primary({ label: 'Start: ' + stepLabel(extra), iconEnd: 'next', onClick: function () { T.router.go('stop-' + info.n + '-' + extra); } });
      else if (after && after.ready) bar.primary({ label: 'Next stop: ' + after.info.world, iconEnd: 'next', onClick: function () { T.router.go('stop-' + after.info.n); } });
      else bar.primary({ label: 'Back to the map', icon: 'map', onClick: function () { T.router.go('home'); } });
      return;
    }
    bar.primary({
      label: (T.progress.stepState(info.n, next) === 'started' ? 'Continue' : 'Start') + ': ' + stepLabel(next),
      iconEnd: 'next',
      onClick: function () { T.router.go('stop-' + info.n + '-' + next); }
    });
  }

  function mountOpen(info, pack) {
    const total = buildTotal(info);
    let sheet = null;
    const scene = buildScene(info, el('div', { class: 'hub__bar' }, backButton(), total.el, T.nav ? T.nav.bar('float', info.n, false) : null, T.ui.soundSwitch({ kind: 'float' })),
      function () { return sheet; });
    const badge = el('p', { class: 'hub__badge', hidden: true }, T.ui.icon('trophy'), el('span', 'Badge won: ' + info.badge));
    // how far the child is: five parts (one per step), "2 of 5 steps done" and the stars
    const segs = T.STEPS.map(function (s, k) { return el('span', { class: 'hub__seg', style: { '--i': String(k) } }); });   // they fill in turn (Phase 5)
    const progText = el('span', { class: 'hub__progress-text' });
    const progStars = el('span', { class: 'hub__progress-stars' });
    const progress = el('div', { class: 'hub__progress', role: 'img' },
      el('span', { class: 'hub__segs', 'aria-hidden': 'true' }, segs), progText, progStars);
    const blurb = pack.blurb || {};
    const steps = T.STEPS.map(function (step, i) { return buildStep(info, step, i); });
    const extras = T.EXTRAS.map(function (extra) { return buildExtra(info, extra); });
    const bar = T.ui.actionBar();
    const quick = !!info.quick;
    sheet = el('div', { class: ['hub__sheet', 'rise', quick && 'hub__sheet--quick'] },
      el('div', { class: 'hub__intro' },
        el('p', { class: 'hub__eyebrow' }, 'Stop\u00a0' + info.n + ' · ' + info.world),
        el('h1', { class: 'hub__title' }, pack.title || info.title),
        quick ? el('span', { class: 'chip hub__quick' }, T.ui.icon('play'), QUICK.chip) : null,
        T.ui.instruction({ en: blurb.en, vi: blurb.vi, zip: false, plain: true }).el,
        quick ? null : progress,
        badge),
      // a quick-practice stop: why four of the five steps say "Coming soon"
      quick ? T.ui.instruction({ en: QUICK.line.en, vi: QUICK.line.vi, zip: false, sound: false, cls: 'hub__quickline' }).el : null,
      el('ol', { class: 'steps' }, steps.map(function (s) { return s.el; })),
      el('ul', { class: 'hub__extras', 'aria-label': 'Extras' }, extras.map(function (x) { return x.el; })));
    T.shell.screen.appendChild(el('div', { class: ['hub', quick && 'hub--quick'], dataset: { hue: info.n } }, scene.el, sheet, bar.el));

    function refresh() {
      const next = nextReady(info.n);
      const extra = nextExtra(info.n);
      steps.forEach(function (s) { s.refresh(pack, s.id === next); });
      extras.forEach(function (x) { x.refresh(pack, x.id === extra); });
      const done = T.STEPS.filter(function (st) { return T.progress.stepState(info.n, st.id) === 'done'; }).length;
      const stars = T.progress.stopStars(info.n);
      segs.forEach(function (seg, k) { seg.classList.toggle('is-done', T.progress.stepState(info.n, T.STEPS[k].id) === 'done'); });
      progText.textContent = done + ' of ' + T.STEPS.length + ' steps done';
      T.ui.empty(progStars).appendChild(T.ui.stars(stars > 0 ? 1 : 0, 1, { size: 'sm' }));
      progStars.lastChild.setAttribute('aria-hidden', 'true');
      progStars.appendChild(el('span', stars + ' / 15'));
      progress.setAttribute('aria-label', done + ' of ' + T.STEPS.length + ' steps done, ' + stars + ' of 15 stars');
      total.show(steps);
      badge.hidden = !T.progress.hasBadge(info.n);
      setMainButton(bar, info);
    }
    refresh();
    scene.fit();
    document.addEventListener('trail:progress', refresh);
    // the first visit to a stop: a hand points at the card of the step to do next
    T.guide.point('hub', function () { return sheet.querySelector('.step-card.is-next'); }, { delay: 900 });

    return function cleanup() {
      document.removeEventListener('trail:progress', refresh);
      total.stop();
      scene.stop();
      T.ui.closeOverlays();
    };
  }

  /* ---------- a stop that is coming soon: a friendly locked hub ---------- */

  function mountSoon(info) {
    const bar = T.ui.actionBar();
    // a stop to try meanwhile: the first one with a pack that is not finished (no badge yet; a quick-practice
    // stop: a step that is ready is still to do), else the first with a pack
    const playable = T.stops.filter(function (s) { return s.status === 'open' && !!T.packs[s.n]; });
    const unfinished = function (s) { return !T.progress.hasBadge(s.n) && !(s.quick && nextReady(s.n) === null); };
    const open = playable.filter(unfinished)[0] || playable[0];
    const building = info.status === 'open';         // open, but its pack has not arrived yet
    const disc = el('div', { class: 'hub__lockdisc' },
      T.ui.plate(T.ui.art(info.badgeArt, { decorative: true }), { shape: 'round bleed', replay: false }),
      el('span', { class: 'hub__lock', 'aria-hidden': 'true' }, T.ui.icon(building ? 'pencil' : 'lock')));
    const top = el('div', { class: 'hub__scene hub__scene--soon' }, disc,
      el('div', { class: 'hub__bar' }, backButton(), el('span', { class: 'hub__spacer' }), T.ui.soundSwitch({ kind: 'float' })));
    const sheet = el('div', { class: 'hub__sheet hub__sheet--soon rise' },
      el('div', { class: 'hub__intro' },
        el('p', { class: 'hub__eyebrow' }, 'Stop\u00a0' + info.n + ' · ' + info.world),
        el('h1', { class: 'hub__title' }, info.title)),
      T.ui.instruction({ en: 'This stop is *coming soon*.', vi: 'Trạm này *sắp ra mắt*.', mood: 'think', sound: false }).el,
      // what is on the way: the same five steps, and the badge to win
      el('div', { class: 'hub__preview' },
        el('ol', { class: 'hub__ghosts' }, T.STEPS.map(function (step) {
          return el('li', T.ui.plate(T.ui.art(STEP_ART[step.id], { decorative: true }), { size: 'xs', shape: 'round', replay: false }), el('span', step.label));
        })),
        el('p', { class: 'hub__badge' }, T.ui.icon('trophy'), el('span', 'Badge to win: ' + info.badge))),
      open ? el('p', { class: 'hub__hint' }, 'Try Stop\u00a0' + open.n + ' now: ' + place(open) + '.') : null);
    bar.primary({ label: 'Back to the map', icon: 'map', onClick: function () { T.router.go('home'); } });
    T.shell.screen.appendChild(el('div', { class: 'hub hub--soon', dataset: { hue: info.n } }, top, sheet, bar.el));
    return function cleanup() { T.ui.closeOverlays(); };
  }

  /* ---------- the route ---------- */

  function mount(params) {
    const info = (T.stops || []).filter(function (s) { return s.n === params.n; })[0];
    if (!info) { T.router.go('home'); return null; }
    const pack = T.packs[info.n];
    return info.status === 'open' && pack ? mountOpen(info, pack) : mountSoon(info);
  }

  T.router.register('stop-:n', mount);
  T.hubKit = { buildScene: buildScene };              // the Summit's page (79-summit.js) uses the same scene header
})(window.T = window.T || {});

