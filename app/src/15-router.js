/* 15-router.js - the hash router and the screen it draws into.

   T.shell.app       the #app element (created if the page has none)
   T.shell.screen    <main class="screen" id="screen" tabindex="-1"> inside it: every screen is built here

   T.router.register(pattern, mount)   pattern: 'home', 'stop-:n', 'stop-:n-words' … (:n matches digits)
                                       mount(params) builds the screen into T.shell.screen and may
                                       return a cleanup function; params.n is a number
   T.router.go(route)                  open a route (it also sets the hash); the same route again restarts it
   T.router.back()                     from a step to its stop hub, from a hub to home
   T.router.current()                  -> {route, pattern, params}
   T.router.start()                    called once by the boot file; nothing happens before that

   On every change of screen the router runs the old screen's cleanup (exactly once), empties the
   screen, sets data-route (the pattern) and data-world (the stop number, or '') on #app, scrolls to
   the top, moves the focus to the screen and gives it the class is-entering for about 400ms.
   Unknown and malformed hashes show 'home'. A mount that throws shows a plain message instead.
   The full API is in brief/api-core.md. */
(function (T) {
  'use strict';

  /* ---------- T.shell: #app and the screen (found or made on first use) ---------- */

  let appEl = null, screenEl = null;

  function ensureShell() {
    if (!appEl) {
      appEl = document.getElementById('app');
      if (!appEl) {
        appEl = document.createElement('div');
        appEl.id = 'app';
      }
    }
    if (!appEl.isConnected) document.body.appendChild(appEl);
    if (!screenEl) {
      screenEl = appEl.querySelector('#screen');
      if (!screenEl) {
        screenEl = document.createElement('main');
        screenEl.id = 'screen';
      }
      resetScreen(screenEl);
    }
    if (!appEl.contains(screenEl)) appEl.appendChild(screenEl);
  }

  // every screen starts from the same clean element: no leftover classes or inline styles
  function resetScreen(screen) {
    screen.className = 'screen';
    screen.setAttribute('tabindex', '-1');
    screen.removeAttribute('style');
    screen.style.outline = 'none';                     // it takes focus by script only: no ring around the page
  }

  T.shell = {};
  Object.defineProperties(T.shell, {
    app: { enumerable: true, get: function () { ensureShell(); return appEl; } },
    screen: { enumerable: true, get: function () { ensureShell(); return screenEl; } }
  });

  /* ---------- routes: patterns and matching ---------- */

  const PARAM = /:([A-Za-z_]\w*)/g;
  const PATTERN_OK = /^(?:[A-Za-z0-9-]|:[A-Za-z_]\w*)+$/;   // letters, digits, hyphens and :names
  const routes = [];                                   // {pattern, regex, names, mount}, in order of registration
  const NOWHERE = { route: '', pattern: '', params: {} };
  let gate = null;                                     // setGate(fn): fn(route) -> a route to draw instead, or nothing

  function compile(pattern) {
    const names = [];
    const source = pattern.split(/(:[A-Za-z_]\w*)/).map(function (part, i) {
      if (i % 2 === 1) { names.push(part.slice(1)); return '(\\d{1,4})'; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    return { pattern: pattern, regex: new RegExp('^' + source + '$'), names: names, mount: null };
  }

  // Registering a pattern again replaces its mount (the last one wins).
  function register(pattern, mount) {
    if (typeof pattern !== 'string' || !PATTERN_OK.test(pattern) || typeof mount !== 'function') {
      console.error('T.router.register needs a pattern (letters, digits, hyphens, :n) and a mount function; got', pattern, mount);
      return;
    }
    const entry = compile(pattern);
    entry.mount = mount;
    const at = routes.findIndex(function (r) { return r.pattern === pattern; });
    if (at >= 0) routes[at] = entry; else routes.push(entry);
  }

  // a hash is letters, digits and hyphens only; anything else is not a route
  function cleanRoute(raw) {
    const route = String(raw == null ? '' : raw).replace(/^#/, '');
    return /^[A-Za-z0-9-]+$/.test(route) ? route : '';
  }

  function match(route) {
    for (let i = 0; i < routes.length; i++) {
      const found = routes[i].regex.exec(route);
      if (!found) continue;
      const params = {};
      routes[i].names.forEach(function (name, k) { params[name] = Number(found[k + 1]); });
      // the tidy spelling of the route: 'stop-01' becomes 'stop-1'
      const tidy = routes[i].pattern.replace(PARAM, function (whole, name) { return String(params[name]); });
      return { route: tidy, pattern: routes[i].pattern, params: params, mount: routes[i].mount };
    }
    return null;
  }

  // any hash or route -> the screen to show; unknown and malformed ones give home
  function resolve(raw) {
    const route = cleanRoute(raw);
    const target = (route && match(route)) || match('home') || { route: 'home', pattern: 'home', params: {}, mount: null };
    if (!gate) return target;
    let other = null;
    try { other = gate(target.route); } catch (e) { other = null; }
    const instead = typeof other === 'string' && other !== target.route ? match(cleanRoute(other)) : null;
    return instead || target;
  }

  /* ---------- the hash ---------- */

  function hashRoute() {
    return String(window.location.hash || '').replace(/^#/, '');
  }

  // Write the route into the address. replace = tidy the address in place, so that a bad one is
  // not left in the history (an empty hash already means home and is left alone).
  function writeHash(route, replace) {
    const now = hashRoute();
    if (now === route || (replace && now === '' && route === 'home')) return;
    if (!replace) {
      try { window.location.hash = route; } catch (e) { /* the screen still changes */ }
      return;
    }
    const url = String(window.location.href).replace(/#.*$/, '') + '#' + route;   // absolute: safe with a <base>
    try {
      window.history.replaceState(window.history.state, '', url);
    } catch (e) {
      try { window.location.replace(url); } catch (e2) { /* the address stays as it is */ }
    }
  }

  /* ---------- drawing a screen ---------- */

  const ENTER_MS = 400;
  let currentRoute = NOWHERE;
  let cleanup = null;                                  // the cleanup of the screen that is showing
  let started = false, busy = false, queued = null, enterTimer = 0;

  function runCleanup() {
    const fn = cleanup;
    cleanup = null;                                    // cleared first: it can never run twice
    if (!fn) return;
    try { fn(); } catch (e) { console.error('T.router: a screen cleanup failed.', e); }
  }

  function empty(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function scrollToTop(screen, app) {
    try {
      window.scrollTo(0, 0);
      screen.scrollTop = 0;
      app.scrollTop = 0;
    } catch (e) { /* nothing to scroll */ }
  }

  function focusScreen(screen) {
    if (screen.contains(document.activeElement)) return;   // the new screen put the focus somewhere itself
    try { screen.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ }
  }

  // a plain message when a screen cannot be drawn, with one button back to home
  function showFallback(screen, route) {
    const box = document.createElement('div');
    box.className = 'screen-fallback';
    box.setAttribute('role', 'alert');
    box.style.cssText = 'padding:2rem 1rem;text-align:center';
    const text = document.createElement('p');
    text.textContent = 'Sorry, this page did not open.';
    const label = route === 'home' ? 'Try again' : 'Back to home';
    const goHome = function () { go('home'); };
    let button = null;
    try {
      if (T.ui && typeof T.ui.button === 'function') button = T.ui.button({ label: label, kind: 'primary', onClick: goHome });
    } catch (e) { button = null; }
    if (!(button instanceof Node)) {
      button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.style.cssText = 'min-height:3rem;padding:0 1.5rem;font:inherit';
      button.addEventListener('click', goHome);
    }
    box.appendChild(text);
    box.appendChild(button);
    screen.appendChild(box);
  }

  function render(target) {
    const app = T.shell.app, screen = T.shell.screen;
    if (T.guide) T.guide.clear();                      // a pointing hand belongs to the screen it was shown on
    runCleanup();
    empty(screen);
    resetScreen(screen);
    clearTimeout(enterTimer);
    currentRoute = { route: target.route, pattern: target.pattern, params: target.params };
    app.setAttribute('data-route', target.pattern);
    app.setAttribute('data-world', target.params.n == null ? '' : String(target.params.n));
    scrollToTop(screen, app);
    void screen.offsetWidth;                           // so that the enter animation starts again
    screen.classList.add('is-entering');
    enterTimer = setTimeout(function () { screen.classList.remove('is-entering'); }, ENTER_MS);

    let result = null;
    try {
      if (!target.mount) throw new Error('no screen is registered for "' + target.route + '"');
      result = target.mount(Object.assign({}, target.params));
    } catch (e) {
      console.error('T.router: the screen "' + target.route + '" did not open.', e);
      result = null;
      empty(screen);
      showFallback(screen, target.route);
    }
    cleanup = typeof result === 'function' ? result : null;
    focusScreen(screen);
  }

  // draw the target; a go() made while a screen is being drawn waits and is drawn straight after
  function navigate(target) {
    if (busy) { queued = target; return; }
    busy = true;
    try {
      let hops = 0;
      while (target) {
        render(target);
        target = queued;
        queued = null;
        if (target && ++hops > 8) {
          console.error('T.router: too many redirects, stopped before "' + target.route + '".');
          target = null;
          writeHash(currentRoute.route, true);         // the address shows the screen that is really there
        }
      }
    } finally {
      busy = false;
    }
  }

  function onHashChange() {
    const target = resolve(hashRoute());
    writeHash(target.route, true);                     // tidy a bad address without a new history entry
    if (target.route === currentRoute.route) return;   // go() has already drawn it
    navigate(target);
  }

  /* ---------- T.router ---------- */

  // Open a route: set the hash and draw the screen at once. The route that is already showing
  // is drawn again from scratch. Before start() only the hash is set.
  function go(route) {
    const target = resolve(route);
    writeHash(target.route, false);
    if (started) navigate(target);
  }

  // one level up: 'stop-1-words' -> 'stop-1' -> 'home'; on home nothing happens
  function back() {
    if (currentRoute.route === 'home') return;
    const parts = currentRoute.route.split('-');
    while (parts.length > 1) {
      parts.pop();
      const up = parts.join('-');
      if (match(up)) { go(up); return; }
    }
    go('home');
  }

  function current() {
    return { route: currentRoute.route, pattern: currentRoute.pattern, params: Object.assign({}, currentRoute.params) };
  }

  // Called once by the boot file, after every screen has been registered: start listening to the
  // hash and draw the screen that the address asks for.
  function start() {
    if (started) return current();
    started = true;
    window.addEventListener('hashchange', onHashChange);
    const target = resolve(hashRoute());
    writeHash(target.route, true);
    navigate(target);
    return current();
  }

  // setGate(fn): before a screen is drawn, fn(route) may name another route to draw instead (the player
  // screen, while nobody has said who is playing). setGate(null) removes it.
  function setGate(fn) {
    gate = typeof fn === 'function' ? fn : null;
  }

  T.router = { register: register, go: go, back: back, current: current, start: start, setGate: setGate };
})(window.T = window.T || {});

