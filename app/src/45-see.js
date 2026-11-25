/* 45-see.js - See it: the step framework (copied from Grade 4 reference/g4-science/parts/45-see.js) and
   the maths scene runner that turns a stop pack's see.scenes (data) into scenes.

   Scenes come from the stop's pack (src/packs/22-pack-stopN.js), or a stop file can register its own:
     T.see.register(1, { scenes: [ {id, title: {en, vi}, mount(sc)}, ... ] })
   T.see.get(n) -> the registered scenes, else the pack's scenes made into mount functions, else null.
   This file runs them as a short pager: the top bar shows the scene's title and one dot per scene,
   the bottom bar has ONE primary button, "Next". The back arrow goes to the scene before (on the
   first scene it opens the stop hub). The LAST scene is the challenge: it ends the step itself.
   The framework gives it a "Finish" button that stays off until the scene calls
   sc.primary({label, onClick}) (and then ctx.saveUnit and ctx.finish).

   mount(sc) builds inside sc.el and may return a cleanup. sc is:
     el                    the scene's own box (a flex column that fills the stage body)
     stage                 the stage ctx (saveUnit, finish, pack ...)
     index, count          this scene's place, from 0
     instruct({en, vi, mood}), zip(mood)
     later(fn, ms), every(fn, ms), frame(fn)   timers that stop when the scene changes or the child leaves
     onLeave(fn)           extra cleanup for this scene
     onResize(fn)          fn() after the scene's box changes size (once at the start too)
     ready()               "you have seen it all": the Next button pulses once
     primary(opts)         the main button, for the last scene (null hides it)
     next()                go on to the next scene

   ---------- scenes as data (pack.see.scenes) ----------
   A hands-on scene: the child does something with a tool, step by step.
     { id: 'meet', title: {en, vi}, tool: 'mat', pic: { k: 'legend' },     pic: a small picture above the tool
       mat: { b: [0, 2, 3, 1], counts: true },                              the tool's spec at the start
       steps: [ { mat: {...},                    a new tool for this step (optional)
                  can: { join: ['o'] },          what the child may do now (tool.allow)
                  wait: 'join' | 'brk',          the action that ends the step (the tool's 'trade' event)
                  fresh: true,                   a new count starts here (tool.restart(): the number line)
                  until: { pos: -4 },            ... once the tool's get() shows this (optional; Stop 2:
                                                 'jump' on the number line, 'warm' | 'cold' on the
                                                 thermometer, 'grow' with the counters: 39-tools-lines.js)
                  zip: {en, vi},                 Zip says what to do
                  then: {en, vi} } ] }           Zip says what happened; the next step starts after a pause
     When the last step is done, the Next button pulses. tool: 'mat' (the default), 'nline', 'thermo' or 'grid';
     its spec at the start is s[tool] (s.mat, s.nline, ...) and a step may bring a new one in st[tool].
     The first time a child meets a step, a hand points at what to tap (the mat's block or "Join 10", else tool.tip()).
   The challenge (the last scene): Concrete questions run by the v2 question models (52-kit-model.js ask()).
     { id: 'challenge', title: {en, vi},
       challenge: { rounds: [v2 slot { mode, lo, v: [3 sets of numbers] }],   play 1 uses v[0], then v[1], v[2]
                    end: {en, vi},             Zip's line at the end
                    result: 'You built, broke and joined blocks.' } }   the line on the result card
     Two tries, hints and "Show me how", as in Practise. Points: 2 at the first try with no hint, 1 later, 0 shown.
     Every answer is logged with T.events.log, game letter 'c' (Concrete), q = 0, 1, ...
     At the end: ctx.saveUnit('challenge', points, 2 per question), the best number right (stops.N.see.right
     = {right, of}, for the school build's v2 stars), then the step's result.
   Words of the framework itself ("Next", "Finish") are in English like the rest of the core;
   every child-facing line of a scene comes from the stop's pack. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const registry = {};
  const made = {};

  /* ---------- registry ---------- */

  T.see = {
    register: function (stop, def) {
      if (!def || !Array.isArray(def.scenes)) return;
      registry[stop] = def;
    },
    get: function (stop) {
      if (registry[stop]) return registry[stop];
      const pack = T.packs && T.packs[stop];
      const scenes = pack && pack.see && Array.isArray(pack.see.scenes) ? pack.see.scenes : null;
      if (!scenes || !scenes.length) return null;
      if (!made[stop] || made[stop].from !== scenes) made[stop] = { from: scenes, def: { scenes: scenes.map(function (s) { return fromData(stop, s); }) } };
      return made[stop].def;
    },
  };

  const WAITING = { en: 'This picture is on the way.', vi: 'Hình ảnh này sắp có rồi.' };

  /* ---------- the step ---------- */

  T.steps = T.steps || {};
  T.steps.see = {
    mount: function (ctx) {
      const def = T.see.get(ctx.stop);
      if (!def || !def.scenes.length) return mountEmpty(ctx);
      const scenes = def.scenes;
      const box = el('div', { class: 'see' });
      ctx.body.appendChild(box);

      let index = -1;
      let current = null;          // {el, cleanups: []}
      let mainButton = null;

      // one scene's ctx, with its own timers and cleanups
      function sceneCtx(i, node) {
        const cleanups = [];
        const track = function (cancel) { cleanups.push(cancel); return cancel; };
        const sc = {
          el: node, stage: ctx, index: i, count: scenes.length,
          instruct: function (line) { ctx.instruct(line); },
          zip: function (mood) { ctx.zip(mood); },
          later: function (fn, ms) { return track(ctx.later(fn, ms)); },
          every: function (fn, ms) { return track(ctx.every(fn, ms)); },
          frame: function (fn) { return track(ctx.frame(fn)); },
          onLeave: function (fn) { if (typeof fn === 'function') cleanups.push(fn); },
          onResize: function (fn) { watchSize(node, fn, sc); },
          ready: function () { if (mainButton) mainButton.classList.add('see-ready'); },
          primary: function (opts) { mainButton = ctx.primary(opts); clearPulse(); return mainButton; },
          next: function () { if (i === index && i < scenes.length - 1) show(i + 1, 1); },
        };
        return { sc: sc, cleanups: cleanups };
      }

      function clearPulse() { if (mainButton) mainButton.classList.remove('see-ready'); }

      function teardown() {
        if (!current) return;
        current.cleanups.splice(0).reverse().forEach(function (fn) {
          try { fn(); } catch (err) { console.error(err); }
        });
        if (current.el.parentNode) current.el.parentNode.removeChild(current.el);
        current = null;
      }

      function show(i, dir) {
        teardown();
        index = i;
        const scene = scenes[i];
        const last = i === scenes.length - 1;
        const node = el('div', { class: ['see-scene', 'see-scene--' + (scene.id || i), dir < 0 ? 'is-back' : 'is-fwd'], 'data-scene': scene.id || String(i) });
        box.appendChild(node);
        const madeCtx = sceneCtx(i, node);
        current = { el: node, cleanups: madeCtx.cleanups };
        ctx.title(scene.title ? scene.title.en : 'See it');
        ctx.progress(i + 1, scenes.length);
        ctx.secondary(null);
        clearPulse();
        if (last) mainButton = ctx.primary({ label: 'Finish', iconEnd: 'next', disabled: true });
        else mainButton = ctx.primary({ label: 'Next', iconEnd: 'next', onClick: function () { madeCtx.sc.next(); } });
        try {
          const cleanup = scene.mount(madeCtx.sc);
          if (typeof cleanup === 'function') madeCtx.cleanups.push(cleanup);
        } catch (err) {
          console.error(err);
        }
      }

      ctx.onBack(function () {
        if (index > 0) { show(index - 1, -1); return true; }
        return false;
      });

      show(0, 1);
      return function () { clearPulse(); teardown(); };
    },
  };

  // fn() whenever the box changes size; the first call comes on the next frame
  function watchSize(node, fn, sc) {
    let pending = null;
    const run = function () {
      if (pending) return;
      pending = sc.frame(function () { pending = null; fn(); });
    };
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(run);
      ro.observe(node);
      sc.onLeave(function () { ro.disconnect(); });
    } else {
      window.addEventListener('resize', run);
      sc.onLeave(function () { window.removeEventListener('resize', run); });
    }
    run();
  }

  // a stop without scenes: one calm line and the way back
  function mountEmpty(ctx) {
    ctx.instruct({ en: WAITING.en, vi: WAITING.vi, mood: 'think' });
    ctx.body.appendChild(el('div', { class: 'see-empty' }, T.ui.zip('think')));
    ctx.primary({ label: 'Back to the stop', onClick: function () { T.router.go('stop-' + ctx.stop); } });
  }

  /* ---------- scenes from data ---------- */

  function fromData(stop, s) {
    return {
      id: s.id, title: s.title,
      mount: function (sc) { return s.challenge ? challenge(sc, stop, s.challenge) : s.esl && T.esl ? T.esl.scene(sc, s) : handsOn(sc, s); }
    };
  }

  function say(sc, line, mood) {
    if (line) sc.instruct({ en: line.en, vi: line.vi || null, mood: mood || line.mood || 'happy' });
  }

  // a hands-on scene: the child does each step with the tool; Zip says what to do, then what happened
  function handsOn(sc, s) {
    const wrap = el('div', { class: 'see-hands' });
    if (s.pic) { const p = T.tools.pic(s.pic); if (p) wrap.appendChild(el('div', { class: 'see-hands__pic' }, p)); }
    const desk = el('div', { class: 'see-hands__desk' });
    wrap.appendChild(desk);
    sc.el.appendChild(wrap);
    const steps = s.steps || [];
    let tool = null, at = -1;

    // the height left for the tool: the scene's box, less the picture when it sits above the tool (a phone)
    function room() {
      let h = wrap.clientHeight - 16;
      const pic = wrap.querySelector('.see-hands__pic');
      if (pic && window.getComputedStyle(wrap).flexDirection === 'column') h -= pic.offsetHeight + 12;
      return h;
    }

    function makeTool(spec) {
      if (tool) tool.destroy();
      const make = T.tools[s.tool || 'mat'];
      tool = make ? make(desk, Object.assign({}, spec, { can: {}, room: room })) : null;
      if (tool) tool.on('trade', function (t) { done(t); });
    }
    sc.onResize(function () { if (tool && tool.fit) tool.fit(); });
    const kind = s.tool || 'mat';

    function begin(i) {
      at = i;
      const st = steps[i];
      if (!st) { sc.ready(); return; }
      if (st[kind] || !tool) makeTool(Object.assign({}, s[kind], st[kind]));
      if (st.fresh && tool && tool.restart) tool.restart();          // a new count from here (the old jumps go)
      if (tool && tool.allow) tool.allow(st.can || {});
      say(sc, st.zip, 'happy');
      // the first time: a hand shows the block to tap, or the "Join 10" button, or the tool's button
      const can = st.can || {};
      if (can.join && can.join.length) T.guide.point('mat-join', function () { return desk.querySelector('.mat__join'); });
      else if (can.brk && can.brk.length) T.guide.point('mat-break', function () { return desk.querySelector('.mat__pc.is-tap'); });
      else if (tool && tool.tip) T.guide.point('see-' + kind, function () { return tool && tool.tip(); });
    }

    // the step's target is reached: every key of st.until is what the tool shows now
    function reached(st) {
      if (!st.until) return true;
      const now = tool && tool.get ? tool.get() : {};
      return Object.keys(st.until).every(function (k) { return now[k] === st.until[k]; });
    }

    function done(t) {
      const st = steps[at];
      if (!st || !st.wait || st.wait !== t.act || !reached(st)) return;
      if (tool && tool.allow) tool.allow({});
      T.fx.sfx('ok');
      say(sc, st.then, 'cheer');
      if (at >= steps.length - 1) { at = steps.length; sc.ready(); return; }
      const nextStep = at + 1;
      at = -1;                                        // no action counts during the pause
      sc.later(function () { begin(nextStep); }, 2600);
    }

    begin(0);
    return function () { if (tool) tool.destroy(); tool = null; };
  }

  // the challenge: Concrete questions from the v2 models, answers logged with game letter 'c'
  function challenge(sc, stop, ch) {
    const ctx = sc.stage, rounds = ch.rounds || [];
    const playsPath = ['stops', String(stop), 'see', 'plays'];
    const play = Number(T.store.get(playsPath, 0)) || 0;
    const holder = el('div', { class: 'see-ch' });
    sc.el.appendChild(holder);
    let q = 0, points = 0, most = 0, right = 0, cleanup = null, over = false;
    const run = T.rewards.counter(stop, 'see');            // Phase 6: "3 in a row!" on Zip (right at the first try)

    const g = {
      ctx: {
        primary: function (o) { return sc.primary(o); },
        secondary: function (o) { return ctx.secondary(o); },
        instruct: function (line) { sc.instruct(line); },
        later: function (fn, ms) { return sc.later(fn, ms); },
        zip: function (mood) { sc.zip(mood); }
      },
      body: holder, stop: stop,
      score: function (p, m) { points += Math.max(0, +p || 0); most += Math.max(0, +m || 0); },
      streak: function (first) { return over ? null : run.hit(!!first); },
      right: function (node) { T.fx.sfx('ok'); if (node) T.fx.burst(node, 14); sc.zip('cheer'); },
      wrong: function (node) {
        T.fx.sfx('no');
        if (node) { node.classList.remove('gm-shake'); void node.offsetWidth; node.classList.add('gm-shake'); sc.later(function () { node.classList.remove('gm-shake'); }, 500); }
        sc.zip('oops');
      }
    };

    function next() {
      if (cleanup) { cleanup(); cleanup = null; }
      T.ui.empty(holder);
      if (q >= rounds.length) { end(); return; }
      const round = rounds[q];
      let task;
      try { task = T.gameKit.modelTask(round, play); } catch (e) { console.error('See it: question ' + (q + 1) + ' did not build', e); q++; next(); return; }
      cleanup = T.gameKit.ask(g, task, {
        q: q, total: rounds.length, game: 'c', lo: round.lo, surface: 'board', last: q === rounds.length - 1,
        done: function (res) { if (res && res.ok) right++; q++; next(); }
      });
    }

    function end() {
      if (over) return;
      over = true;
      ctx.saveUnit('challenge', points, most);
      T.store.set(playsPath, play + 1);
      // the best number finally right, for the v2 star rule of the school build ('N-c': right >= questions - 1)
      const bestPath = ['stops', String(stop), 'see', 'right'], old = T.store.get(bestPath, null);
      if (!old || right > old.right) T.store.set(bestPath, { right: right, of: rounds.length });
      T.fx.sfx('win');
      say(sc, ch.end, 'cheer');
      ctx.title('See it');                                  // else the result sits under the scene title
      ctx.finish({ lines: [ch.result || 'You finished the challenge.', 'Score: *' + points + '* out of ' + most] });
    }

    sc.onLeave(function () { over = true; if (cleanup) cleanup(); cleanup = null; });
    next();
  }
})(window.T = window.T || {});

