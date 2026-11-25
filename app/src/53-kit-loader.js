/* 53-kit-loader.js: registers the data-driven games of every stop with the games shell. Owner: game kit engineer.

   A game in a pack is data: { id: 's2g1', kit: 'sort', title, blurb, art, levels: [L1, L2, L3] }.
   For every pack T.packs[n] and every entry of pack.practise that has a kit, this file registers
   T.gameKit[kit](entry) under entry.id with T.games.register.

   When: once after all files have loaded, and again (lazily) every time the Practise step of a stop
   opens, just before the shell reads its registry. So a pack or a kit engine that loads later in file
   order (54-kit-*.js, 22-pack-stopN.js added at run time) is picked up without any change here.
   A game whose kit engine does not exist yet is skipped quietly: the shell shows its "coming soon" card.

   How it hooks in without editing 50-games.js: the shell looks games up in its registry inside
   T.steps.practise.mount(ctx) (it reads ctx.pack.practise there), so this file wraps that mount once.

   T.gameKit.load(pack?)   register the kit games of one pack, or of all packs; -> number registered
*/
(function (T) {
  'use strict';

  T.gameKit = T.gameKit || {};
  const made = {};                         // entry id -> the pack entry it was made from

  function loadPack(pack) {
    let n = 0;
    if (!pack || !Array.isArray(pack.practise) || !T.games || typeof T.games.register !== 'function') return 0;
    pack.practise.forEach((entry) => {
      if (!entry || !entry.id || !entry.kit) return;
      if (made[entry.id] === entry && T.games.get(entry.id)) return;      // already made from this very entry
      const make = T.gameKit[entry.kit];
      if (typeof make !== 'function') return;                              // kit not built yet: skip quietly
      try {
        const game = make(entry);
        if (game && typeof game.mount === 'function') {
          T.games.register(entry.id, game);
          made[entry.id] = entry;
          n++;
        }
      } catch (err) {
        console.error('T.gameKit: the game ' + entry.id + ' (kit ' + entry.kit + ') could not be made', err);
      }
    });
    return n;
  }

  function loadAll() {
    const packs = T.packs || {};
    return Object.keys(packs).reduce((n, k) => n + loadPack(packs[k]), 0);
  }

  T.gameKit.load = function (pack) { return pack ? loadPack(pack) : loadAll(); };

  // wrap the Practise step once, so each opening registers the kit games of that stop first
  function hook() {
    const step = T.steps && T.steps.practise;
    if (!step || typeof step.mount !== 'function' || step.mount._kitLoader) return !!(step && step.mount && step.mount._kitLoader);
    const inner = step.mount;
    const outer = function (ctx) {
      loadPack((ctx && ctx.pack) || (T.packs && ctx && T.packs[ctx.stop]));
      return inner.apply(this, arguments);
    };
    outer._kitLoader = true;
    step.mount = outer;
    return true;
  }

  hook();
  function boot() { hook(); loadAll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else setTimeout(boot, 0);
})(window.T = window.T || {});

