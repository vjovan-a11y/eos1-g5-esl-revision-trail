/* 02-events.js - the answer log: every answer a child gives, in the SAME shape as Maths v2.

   T.events.log(e)       e = { s: stop, g: game letter, q: question index (0 = the first), v: the answer given,
                               lo: ['4Np.01', ...], ok: finally right, first: right at the first try with no hint,
                               tries, hints, dok: 0-3 (the Mini test) }
                         Game letters (docs/04-data-contract.md): See it and Practise answers use 'c' (concrete),
                         'r' (pictorial) or 'a' (abstract); Mini test 'm'; final test 'X'/'x'; Lightning 'l'/'L';
                         self-check 's'. The school bridge (Session 5) turns each one into an Events row with the
                         v2 toEvent() rule, so the dashboards keep working.
   T.events.list()       the last 500 entries of this child (saved with their trail, under 'log')
   T.events.on(fn)       fn(e) for every new entry; -> a function that stops it

   Each entry also goes out as the DOM event 'trail:answer' (detail = e). Nothing is sent anywhere here:
   the preview build keeps the log on this device only. */
(function (T) {
  'use strict';

  const MAX = 500;
  const fns = [];

  function log(e) {
    if (!e || typeof e !== 'object') return null;
    const entry = Object.assign({}, e, { t: Date.now() });
    try {
      const list = (T.store.get(['log'], []) || []).slice(-(MAX - 1));
      list.push(entry);
      T.store.set(['log'], list);
    } catch (err) { /* the log never breaks a game */ }
    fns.slice().forEach(function (fn) { try { fn(entry); } catch (err) { console.error('T.events: a listener failed', err); } });
    try { document.dispatchEvent(new CustomEvent('trail:answer', { detail: entry })); } catch (err) { /* old browsers */ }
    return entry;
  }

  T.events = {
    log: log,
    list: function () { return (T.store.get(['log'], []) || []).slice(); },
    on: function (fn) {
      if (typeof fn !== 'function') return function () {};
      fns.push(fn);
      return function () { const i = fns.indexOf(fn); if (i >= 0) fns.splice(i, 1); };
    }
  };
})(window.T = window.T || {});

