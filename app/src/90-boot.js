/* 90-boot.js - start the app: apply the saved settings, then open the screen the address asks for.

   This file runs last, when every screen has been registered. Nothing else starts the router. */
(function (T) {
  'use strict';

  function boot() {
    const app = T.shell.app;

    // Saved settings. There is one: the sound switch (settings.sound, default on). T.fx reads it
    // from the store every time it is asked, so here every switch on the page is made to show it.
    T.ui.syncSound();

    // Phones only show the pressed look of a button (:active) when something listens for touches.
    app.addEventListener('touchstart', function () {}, { passive: true });

    // the school label: a thin quiet line at the very bottom of every screen, under the action bar (Jovan: the title and
    // the school line on a laptop, the school line only on a phone; hidden when printing, 49-label.css)
    void T.shell.screen;                              // the screen first, so the label sits under it
    const B = T.brand, U = T.util;
    app.appendChild(U.el('footer', { class: 'app-label', 'aria-label': B.title + ', ' + B.school },
      U.el('span', { class: 'app-label__title' }, B.title),
      U.el('span', { class: 'app-label__dot', 'aria-hidden': 'true' }, '·'),
      U.el('span', { class: 'app-label__school' }, B.school)));
    app.classList.add('has-label');

    // The school build (src/school/) waits: its bridge finds out who is logged in, then starts the router
    // through MTRAIL.start (docs/04-data-contract.md). The preview build starts at once.
    if (T.school && typeof T.school.boot === 'function') T.school.boot();
    else T.router.start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(window.T = window.T || {});
