/* 17-guide.js - "Show me where to tap": a friendly drawn hand that points at the right control, the first time a
   child meets each tool (Jovan's improvement plan, Phase 2; the idea of Maths v2 mui_a.js point() and hooks.seen).

   T.guide.point(key, target, opts) -> off()
     key      what is being shown: 'hub', 'flip', 'mat-plus', 'numpad' ... (one hand per key, once per child)
     target   an element, or a function that finds it (a tool may draw its buttons again: the hand follows)
     opts     { at: 0.55 (how far down the target the fingertip goes), delay: 650 ms, ms: 6000 (how long it stays),
                scope: 'device' (the start screen: nobody is playing yet, so it is remembered on this device) }
   The hand never takes a tap (pointer-events: none), goes away on the first tap or key press anywhere, after a
   few seconds, when the screen changes, or when its target goes. Only one hand at a time: a second request while
   a hand shows waits for another visit. A child who taps before the hand appears does not need it (it is then
   marked as seen without showing). Reduced motion: the hand stands still and a still ring marks the target.
   Remembered in the child's saved document: seen.<key> = 1 (T.store). The school build also sends it to the
   server in the v2 field `seen` (as 'v3-<key>', 86-mtrail.js), so a new device knows it too (T.school.seen).
   T.guide.seen(key), T.guide.mark(key), T.guide.clear() (the router calls it on every change of screen),
   T.guide.showing() -> the key of the hand on screen, or ''. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const DEVICE_KEY = 'g5-esl-trail-guide';          // localStorage: what the start screen has shown on this device
  const W = 64, H = 82, TIP = { x: 21, y: 3 };        // the drawing's size and where its fingertip is

  // a hand with the index finger up, a sleeve in the world's colour (the flat Grade 4 style: ink outline, soft fill)
  const HAND = '<svg class="guide-hand__svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' +
    '<g stroke="#2A2F3A" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
    '<path fill="#FFD7B0" d="M15 36V9a6 6 0 0 1 12 0v21a5.5 5.5 0 0 1 11 0v3a5.5 5.5 0 0 1 11 0v3a5 5 0 0 1 10 0v16' +
    'c0 11-8 19-19 19h-9c-6 0-10-3-13-7L5 46c-1.8-2.6-1-6 1.8-7.4 2.6-1.4 5.6-.6 7.4 1.6L15 42z"/>' +
    '<path fill="none" stroke-width="2.4" d="M27 30v7M38 33v6M49 36v5"/>' +
    '<rect x="21" y="66" width="37" height="14" rx="3.5" fill="currentColor"/></g>' +
    '<path d="M18.6 10v8" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".75"/></svg>';

  let layer = null, live = null;
  const pending = new Set();
  let lastDown = 0;
  document.addEventListener('pointerdown', function () { lastDown = Date.now(); }, true);

  /* ---------- what has been shown ---------- */

  function deviceSeen() {
    try { return JSON.parse(window.localStorage.getItem(DEVICE_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function seen(key, scope) {
    if (scope === 'device') return !!deviceSeen()[key];
    if (T.store.get(['seen', key], 0)) return true;
    return !!(T.school && typeof T.school.seen === 'function' && T.school.seen(key));
  }

  function mark(key, scope) {
    if (scope === 'device') {
      const all = deviceSeen();
      all[key] = 1;
      try { window.localStorage.setItem(DEVICE_KEY, JSON.stringify(all)); } catch (e) { /* a full or blocked device: it shows again */ }
      return;
    }
    if (!T.store.get(['seen', key], 0)) T.store.set(['seen', key], 1);
  }

  /* ---------- the hand ---------- */

  function host() {
    if (!layer || !layer.isConnected) {
      layer = el('div', { class: 'guide-layer', 'aria-hidden': 'true' });
      (T.shell ? T.shell.app : document.body).appendChild(layer);
    }
    return layer;
  }

  function find(target) {
    const node = typeof target === 'function' ? target() : target;
    if (!node || !node.isConnected || !node.getBoundingClientRect) return null;
    const r = node.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || node.closest('[hidden]')) return null;
    return node;
  }

  function show(key, target, opts) {
    const still = T.ui.reducedMotion();
    const hand = el('span', { class: ['guide-hand', still && 'is-still'], html: '<span class="guide-hand__in">' + HAND + '</span>' });
    const ring = el('span', { class: ['guide-ring', still && 'is-still'] });
    const box = host();
    box.appendChild(ring);
    box.appendChild(hand);
    let done = false, timer = 0, tick = 0;

    function place() {
      const node = find(target);
      if (!node) { off(); return; }
      const r = node.getBoundingClientRect();
      const size = hand.offsetWidth || 56, scale = size / W;
      const x = r.left + r.width / 2, y = r.top + r.height * (opts.at == null ? 0.55 : opts.at);
      // a target near the bottom (the main button): the hand points down at it from above
      const flip = y + (H - TIP.y) * scale > window.innerHeight - 4;
      hand.classList.toggle('is-flip', flip);
      hand.style.left = Math.round(x - TIP.x * scale) + 'px';
      hand.style.top = Math.round(y - TIP.y * scale) + 'px';
      ring.style.left = Math.round(r.left - 6) + 'px';
      ring.style.top = Math.round(r.top - 6) + 'px';
      ring.style.width = Math.round(r.width + 12) + 'px';
      ring.style.height = Math.round(r.height + 12) + 'px';
    }

    function off() {
      if (done) return;
      done = true;
      clearInterval(tick);
      clearTimeout(timer);
      document.removeEventListener('pointerdown', off, true);
      document.removeEventListener('keydown', off, true);
      window.removeEventListener('resize', place);
      [hand, ring].forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      if (live && live.off === off) live = null;
    }

    live = { key: key, off: off };
    place();
    if (done) return off;
    tick = setInterval(place, 250);
    timer = setTimeout(off, opts.ms || 6000);
    window.addEventListener('resize', place);
    document.addEventListener('pointerdown', off, true);
    document.addEventListener('keydown', off, true);
    return off;
  }

  function point(key, target, opts) {
    opts = opts || {};
    if (!key || !target || T.guide.enabled === false || seen(key, opts.scope)) return function () {};
    const asked = Date.now();
    let cancelled = false, off = null;
    const id = setTimeout(function () {
      pending.delete(cancel);
      if (cancelled || live) return;                       // another hand is showing: this one waits for another visit
      if (lastDown > asked) { mark(key, opts.scope); return; }     // the child is already busy: no need to show
      if (!find(target)) return;
      mark(key, opts.scope);
      off = show(key, target, opts);
    }, opts.delay == null ? 650 : opts.delay);
    function cancel() { cancelled = true; clearTimeout(id); pending.delete(cancel); if (off) off(); }
    pending.add(cancel);
    return cancel;
  }

  function clear() {
    Array.from(pending).forEach(function (cancel) { cancel(); });
    if (live) live.off();
  }

  T.guide = {
    point: point, seen: seen, mark: mark, clear: clear,
    showing: function () { return live ? live.key : ''; },
    handSvg: HAND,
    enabled: true
  };
})(window.T = window.T || {});

