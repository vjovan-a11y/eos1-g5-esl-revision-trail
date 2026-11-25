/* 26-nav.js - the way home from anywhere: a "Map" button (the trail map) and a "Stops" button (a menu of the nine
   stops, the Summit and the steps of the stop you are in) on the top bar of every step, and a "Stops" button on
   every stop hub and the Summit. Leaving a step in the middle asks first, because an unfinished game or paper
   starts again (stars already won are kept).
   T.nav.bar(kind, stop, inStep) -> the two buttons for a top bar ('band') or a hub bar ('float')
   T.nav.menu(stop)              -> opens the Stops menu */
(function (T) {
  'use strict';
  const el = function () { return T.util.el.apply(null, arguments); };
  const GRID = '<svg viewBox="0 0 24 24" aria-hidden="true" class="icon" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/>' +
    '<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>';

  function current() { return String(window.location.hash || '').replace(/^#/, ''); }

  // go somewhere; from inside a step ask first (a game or a test paper in progress starts again)
  function go(route, inStep) {
    if (route === current()) return;
    if (!inStep) { T.router.go(route); return; }
    T.ui.dialog({
      title: 'Leave this activity?',
      body: 'Your stars are saved. If you are in the middle of a game or a test, it will start again next time.',
      sheet: true,
      actions: [{ label: 'Stay here', kind: 'secondary' }, { label: 'Leave', icon: 'next', onClick: function () { T.router.go(route); } }]
    });
  }

  function navButton(kind, iconNode, label, onClick, cls) {
    const b = el('button', { type: 'button', class: ['icon-btn', 'icon-btn--' + kind, 'nav-btn', cls], 'aria-label': label });
    if (typeof iconNode === 'string') b.innerHTML = iconNode; else b.appendChild(iconNode);
    b.appendChild(el('span', { class: 'nav-btn__label' }, label));
    b.addEventListener('click', function () { if (T.fx && T.fx.sfx) T.fx.sfx('tap'); onClick(); });
    return b;
  }

  function menu(stop, inStep) {
    const list = el('ul', { class: 'nav-list' });
    const row = function (art, title, sub, route, on) {
      const b = el('button', { type: 'button', class: ['nav-row', 'pressable', on && 'is-here'] },
        el('span', { class: 'nav-row__art', 'aria-hidden': 'true' }, art),
        el('span', { class: 'nav-row__text' }, el('b', title), sub ? el('span', sub) : null),
        on ? el('span', { class: 'nav-row__here' }, 'You are here') : null);
      b.addEventListener('click', function () { handle.close(); go(route, inStep); });
      list.appendChild(el('li', b));
    };
    row(T.ui.icon('map'), 'Trail map', 'See the whole trail', 'home', current() === 'home');
    (T.stops || []).forEach(function (s) {
      const stars = T.progress && T.progress.stopStars ? T.progress.stopStars(s.n) : 0;
      row(T.ui.art(s.badgeArt, { decorative: true }), s.n + '. ' + s.world, s.unit + ' · ★ ' + stars + ' / 15', 'stop-' + s.n, Number(stop) === s.n && current() === 'stop-' + s.n);
    });
    row(T.ui.art('icon-summit-test', { decorative: true }), 'The Summit', 'The practice exam: Listening, Reading, Writing', 'summit', current() === 'summit');
    const body = [list];
    // the steps of the stop you are in: jump straight to one
    if (stop && T.packs && T.packs[stop]) {
      const chips = el('div', { class: 'nav-steps' });
      T.STEPS.forEach(function (st) {
        const route = 'stop-' + stop + '-' + st.id;
        const c = el('button', { type: 'button', class: ['chip', 'nav-step', current() === route && 'is-here'] }, st.label);
        c.addEventListener('click', function () { handle.close(); go(route, inStep); });
        chips.appendChild(c);
      });
      body.unshift(el('div', { class: 'nav-stop' }, el('p', { class: 'nav-stop__h' }, 'Stop ' + stop + ': jump to a step'), chips));
    }
    const handle = T.ui.dialog({ title: 'Where do you want to go?', body: body, sheet: true, cls: 'nav-dialog' });
    return handle;
  }

  function bar(kind, stop, inStep) {
    return el('div', { class: ['nav-bar', 'nav-bar--' + kind] },
      navButton(kind, T.ui.icon('map'), 'Map', function () { go('home', inStep); }, 'nav-btn--map'),
      navButton(kind, GRID, 'Stops', function () { menu(stop, inStep); }, 'nav-btn--stops'));
  }

  T.nav = { bar: bar, menu: menu, go: go };
})(window.T = window.T || {});
