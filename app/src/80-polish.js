/* 80-polish.js - the presentation layer that sits on top of the finished app.

   It adds four things and changes nothing that the trail says, counts or scores:
     1. no read-aloud anywhere (the "hear the word" voice is off)
     2. an effects tier that measures the device and drops the costly layers by itself
     3. a living background for every world, and depth on the trail map
     4. richer feedback, reward and screen-change choreography, and the school masthead

   The rule for every effect in here: transform and opacity only, slow loops, nothing over text.
   Tier 3 is a laptop or a good tablet, tier 2 a modest one, tier 1 is still (and is also what
   reduced motion gets). The tier only ever goes down, so a device is never left flickering
   between two budgets. */
(function (T) {
  'use strict';

  if (!T || !T.util) return;

  var el = T.util.el;
  var root = document.documentElement;
  var raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : function (fn) { return setTimeout(function () { fn(Date.now()); }, 16); };

  function safely(fn) {
    try { return fn(); } catch (e) { return undefined; }
  }

  /* ================= 1. the read-aloud voice is off ================= */

  if (T.fx) {
    T.fx.sayWord = function () { return false; };            // any caller sees "this device cannot speak"
    var status0 = T.fx.status;
    if (typeof status0 === 'function') {
      T.fx.status = function () {
        var s = status0.apply(T.fx, arguments) || {};
        s.speech = false;                                     // so the kit never builds a "hear it" button
        return s;
      };
    }
  }

  /* ================= 2. the effects tier ================= */

  var tier = 3;
  var watchdogs = 0;

  function reducedMotion() {
    return safely(function () {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }) || false;
  }

  function setTier(next) {
    next = Math.max(1, Math.min(3, next));
    if (next === tier) return;
    tier = next;
    root.setAttribute('data-fx', String(tier));
    fillMotes();
  }

  // what the device says about itself, before anything has been drawn
  function firstGuess() {
    if (reducedMotion()) return 1;
    var cores = Number(navigator.hardwareConcurrency) || 0;
    var memory = Number(navigator.deviceMemory) || 0;
    if ((cores && cores <= 4) || (memory && memory <= 3)) return 2;
    return 3;
  }

  // how many frames we really get while the background is running; null = the sample cannot be trusted
  function sampleFps(ms, done) {
    var frames = 0, start = 0, prev = 0, stalled = false;
    function step(now) {
      if (!start) { start = prev = now; raf(step); return; }
      if (now - prev > 500) stalled = true;                   // the tab slept, or a screen was being built
      prev = now;
      frames += 1;
      if (now - start < ms) { raf(step); return; }
      done(stalled || document.hidden || frames < 4 ? null : frames / ((now - start) / 1000));
    }
    raf(step);
  }

  function watchFrames() {
    if (tier < 2 || watchdogs > 3) return;
    watchdogs += 1;
    sampleFps(1800, function (fps) {
      if (fps == null) { setTimeout(watchFrames, 6000); return; }
      if (fps < 26) { setTier(1); return; }
      if (fps < 44) { setTier(tier - 1); }
      setTimeout(watchFrames, 9000);
    });
  }

  /* ================= 3. the living background ================= */

  // one motif per world, and the four ways a motif can move
  var MOTIF = {
    '': 'dust', '1': 'particle', '2': 'bubble', '3': 'streak', '4': 'seed',
    '5': 'grain', '6': 'pollen', '7': 'petal', '8': 'sound', '9': 'dust'
  };
  var FAMILY = {
    dust: 'rise', petal: 'fall', pollen: 'rise', seed: 'fall', sound: 'ring',
    particle: 'drift', bubble: 'rise', grain: 'rise', streak: 'drift', drop: 'fall'
  };
  var HOW_MANY = { 3: 15, 2: 7, 1: 0 };

  var sky = null, motes = null;

  function rnd(low, high) { return low + Math.random() * (high - low); }

  function buildSky() {
    var app = T.shell && T.shell.app;
    if (!app || sky) return;
    motes = el('div', { class: 'atmos__motes' });
    sky = el('div', { class: 'atmos', 'aria-hidden': 'true' },
      el('div', { class: 'atmos__wash' }),
      el('div', { class: 'atmos__aura atmos__aura--a' }),
      el('div', { class: 'atmos__aura atmos__aura--b' }),
      motes);
    app.insertBefore(sky, app.firstChild);
    fillMotes();
  }

  function mote(motif, family, i, total) {
    var node = el('span', { class: 'mote mote--' + motif });
    var seconds = family === 'ring' ? rnd(7, 11) : rnd(17, 34);
    var set = function (name, value) { node.style.setProperty(name, value); };
    set('--x', (100 * (i + rnd(0.15, 0.85)) / total).toFixed(2) + '%');
    set('--y', rnd(6, 94).toFixed(1) + '%');
    set('--sz', rnd(0.6, 1.5).toFixed(2));
    set('--sway', rnd(-7, 7).toFixed(1) + 'vw');
    set('--spin', Math.round(rnd(-300, 300)) + 'deg');
    set('--op', rnd(0.22, 0.52).toFixed(2));
    set('--dur', seconds.toFixed(1) + 's');
    set('--delay', (-rnd(0, seconds)).toFixed(1) + 's');      // they are already under way on arrival
    return node;
  }

  function fillMotes() {
    if (!motes) return;
    while (motes.firstChild) motes.removeChild(motes.firstChild);
    var world = (T.shell.app.getAttribute('data-world') || '');
    var motif = MOTIF[world] || 'dust';
    var family = FAMILY[motif];
    motes.setAttribute('data-motif', motif);
    var total = HOW_MANY[tier] || 0;
    if (family === 'ring') total = Math.min(total, 5);
    if (reducedMotion()) total = 0;
    for (var i = 0; i < total; i++) motes.appendChild(mote(motif, family, i, total));
  }

  /* ---------- the map drifts a little behind the trail as it scrolls ---------- */

  var stopParallax = null;

  function startParallax() {
    if (stopParallax) { stopParallax(); stopParallax = null; }
    if (tier < 2) return;
    var scroller = T.shell.screen.querySelector('.home__scroll');
    if (!scroller) return;
    var ground = scroller.querySelector('.map__ground');
    var waiting = false;
    function paint() {
      waiting = false;
      var y = scroller.scrollTop || 0;
      if (ground) ground.style.transform = 'translate3d(0,' + (-y * 0.06).toFixed(1) + 'px,0)';
      if (sky) sky.style.transform = 'translate3d(0,' + (-y * 0.022).toFixed(1) + 'px,0)';
    }
    function onScroll() { if (!waiting) { waiting = true; raf(paint); } }
    scroller.addEventListener('scroll', onScroll, { passive: true });
    paint();
    stopParallax = function () {
      scroller.removeEventListener('scroll', onScroll);
      if (ground) ground.style.transform = '';
      if (sky) sky.style.transform = '';
    };
  }

  /* ================= 4. choreography ================= */

  function centre(node) {
    var r = node && node.getBoundingClientRect ? node.getBoundingClientRect() : null;
    return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  }

  function sparkleAt(node, n) {
    if (tier < 2 || !T.fx || !T.fx.sparkle) return;
    var at = centre(node);
    if (at) safely(function () { T.fx.sparkle(at.x, at.y, n); });
  }

  // a step that already burst on its right answer (T.fx.burst) gets no second shower of sparkles from here:
  // one small celebration per right answer (Phase 5)
  var lastBurst = 0;
  if (T.fx && T.fx.burst) {
    var burst0 = T.fx.burst;
    T.fx.burst = function () { lastBurst = Date.now(); return burst0.apply(T.fx, arguments); };
  }

  function onChoice(node) {
    var mark = node.getAttribute('data-fx');
    if (node.classList.contains('is-right')) {
      if (mark === 'yes') return;
      node.setAttribute('data-fx', 'yes');
      if (Date.now() - lastBurst < 250) return;
      sparkleAt(node.querySelector('.choice__mark') || node, tier >= 3 ? 12 : 7);
    } else if (node.classList.contains('is-wrong')) {
      if (mark === 'no') return;
      node.setAttribute('data-fx', 'no');
    }
  }

  function onTotal(node) {
    if (!node.classList.contains('is-bump')) return;
    if (node.getAttribute('data-fx') === 'bump') return;
    node.setAttribute('data-fx', 'bump');
    if (tier >= 2 && T.fx && T.fx.ring) {
      var at = centre(node);
      if (at) safely(function () { T.fx.ring(at.x, at.y); });
    }
    setTimeout(function () { node.removeAttribute('data-fx'); }, 700);
  }

  // a new instruction: Zip's bulb blinks, so a child who is not reading still knows something changed
  function onLine(node) {
    if (!node.classList.contains('is-fresh')) return;
    var strip = node.parentNode && node.parentNode.parentNode;
    if (!strip || !strip.classList || !strip.classList.contains('instruct')) return;
    strip.classList.remove('is-say');
    void strip.offsetWidth;
    strip.classList.add('is-say');
  }

  function watchScreen() {
    if (!window.MutationObserver) return;
    var seen = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var node = list[i].target;
        if (!node || !node.classList) continue;
        if (node.classList.contains('choice')) onChoice(node);
        else if (node.classList.contains('star-total')) onTotal(node);
        else if (node.classList.contains('instruct__en')) onLine(node);
      }
    });
    seen.observe(T.shell.screen, { attributes: true, attributeFilter: ['class'], subtree: true });
  }

  /* ---------- the one big button asks for a tap when nothing has happened for a while ---------- */

  var idleTimer = null;

  function armIdle() {
    var button = document.querySelector('.actionbar__primary');
    if (button) button.classList.remove('is-idle');
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
    if (tier < 3) return;
    idleTimer = setTimeout(function () {
      var now = document.querySelector('.actionbar__primary');
      if (now && !now.disabled && !now.hidden) now.classList.add('is-idle');
    }, 7000);
  }

  /* ---------- a screen that goes deeper comes in from the right, one that goes back from the left ---------- */

  var wasDeep = -1;

  function depthOf(route) {
    if (!route || route === 'home') return 0;
    if (/^summit-/.test(route)) return 2;                   // the Summit's test, big round and certificate are step screens
    return route.split('-').length >= 3 ? 2 : 1;
  }

  /* ---------- the school masthead on Home ---------- */

  var SCHOOL = 'Vinschool Times City Primary School - T36';

  // EOS 1 finishing touches (Jovan): the school line now sits in the map's own header, in his exact words
  // ("Vinschool Times City T36 Primary School – Advanced Programme", 25-players.js T.brand), so this older band with
  // other words is not drawn any more (two school lines, one above the other, would only confuse)
  var MASTHEAD = false;

  function masthead() {
    if (!MASTHEAD) return;
    var head = T.shell.screen.querySelector('.home__head');
    if (!head || !head.parentNode) return;
    if (head.parentNode.querySelector('.school')) return;
    // the logo pictures are not part of this repository: the masthead is the school's name only
    var band = el('div', { class: 'school school--text' }, el('span', { class: 'school__name' }, SCHOOL));
    head.parentNode.insertBefore(band, head);
  }

  /* ================= wiring ================= */

  // the router may set the route a tick before the screen is filled: wait for the header, briefly
  function whenHomeIsThere(tries) {
    if (T.shell.screen.querySelector('.home__head')) { masthead(); startParallax(); return; }
    if (tries > 0) raf(function () { whenHomeIsThere(tries - 1); });
  }

  function onRoute() {
    var app = T.shell.app;
    var deep = depthOf(app.getAttribute('data-route'));
    app.setAttribute('data-depth', String(deep));            // 2 = a step screen: the background holds still (CSS)
    if (wasDeep >= 0 && deep !== wasDeep) app.setAttribute('data-nav', deep > wasDeep ? 'fwd' : 'back');
    wasDeep = deep;
    if (app.getAttribute('data-route') === 'home') whenHomeIsThere(6);
    else if (stopParallax) { stopParallax(); stopParallax = null; }
    armIdle();
  }

  function start() {
    if (!T.shell || !T.shell.app) return;
    root.setAttribute('data-fx', String(tier = firstGuess()));
    buildSky();
    watchScreen();
    if (window.MutationObserver) {
      new MutationObserver(fillMotes).observe(T.shell.app, { attributes: true, attributeFilter: ['data-world'] });
      new MutationObserver(onRoute).observe(T.shell.app, { attributes: true, attributeFilter: ['data-route'] });
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (name) {
      document.addEventListener(name, armIdle, { passive: true });
    });
    onRoute();
    setTimeout(watchFrames, 1200);
  }

  // the router has not started yet (this file is loaded before the boot file), so the shell is made here
  if (T.shell && typeof T.shell.app !== 'undefined') start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})(window.T = window.T || {});

