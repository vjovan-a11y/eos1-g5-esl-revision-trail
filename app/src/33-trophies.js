/* 33-trophies.js - "My trophies" (route 'trophies', Phase 6): the trophy shelf, everything the child has collected.

   Reached from the map header (the total of stars) and from a result card that won something ("My trophies").
   Zip's line (empty, some, all: kind words, never shame), four tiles (stars, badges, medals, bolts), then three
   drawn shelves in the G4 flat style: the 9 stop badges (won: bright, with the day; others as outlines, "Not yet" or
   "Coming soon"), the Mini Practice test medal and the Lightning bolt of every stop that has them (with the best
   scores), and "My best runs" (the longest runs of right answers in a row). A trophy the shelf has not shown yet
   wears "New!" once (trophy.seen). The Summit (Session 14): the Summit Trophy (70% in the final test), the final test's
   best and the big Lightning round's best (T.SUMMIT.shelf). ONE main button: "Back to the map". Readable on the classroom board.
   The words are in T.REWARDS.shelf (18-rewards-text.js). */
(function (T) {
  'use strict';

  const el = T.util.el;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function words() { return T.REWARDS.shelf; }
  const fill = function (s, vars) { return T.rewards.fill(s, vars); };

  // 20261128 -> '28 Nov' (null: no day kept, a badge won before Phase 6)
  function day(on) {
    const n = Number(on);
    if (!(n > 19000000)) return null;
    const m = Math.floor(n / 100) % 100, d = n % 100;
    return m >= 1 && m <= 12 && d >= 1 ? d + ' ' + MONTHS[m - 1] : null;
  }

  // a stop with something to play (else its badge is "Coming soon")
  function ready(s) {
    return !!(T.packs[s.n] && T.stage && T.STEPS.some(function (st) { return T.stage.hasPart(s.n, st.id); }));
  }

  function prizeFor(list, score) {
    for (let i = 0; i < (list || []).length; i++) if (score >= list[i].at) return list[i];
    return null;
  }

  // everything on the shelf, worked out from the child's document
  function collect() {
    const seen = T.store.get(['trophy', 'seen'], {}) || {};
    const medals = (T.steps.test && T.steps.test.medals) || [];
    const bolts = (T.steps.lightning && T.steps.lightning.bolts) || [];
    const out = { stars: T.progress.totalStars(), badges: [], prizes: [], soon: 0, runs: {}, seen: seen, won: 0, medals: 0, bolts: 0 };
    T.rewards.KINDS.forEach(function (k) { out.runs[k] = 0; });
    (T.stops || []).forEach(function (s) {
      const open = ready(s);
      const won = open && T.progress.hasBadge(s.n);
      out.badges.push({ s: s, open: open, won: won, day: won ? day(T.store.get(['trophy', 'badges', String(s.n), 'on'], null)) : null, key: 'b' + s.n });
      if (won) out.won += 1;
      const base = ['stops', String(s.n)];
      T.rewards.KINDS.forEach(function (k) { out.runs[k] = Math.max(out.runs[k], Number(T.store.get(base.concat('streak', k), 0)) || 0); });
      const hasTest = open && T.stage.hasPart(s.n, 'test'), hasBolt = open && T.stage.hasPart(s.n, 'lightning');
      if (!hasTest && !hasBolt) { out.soon += 1; return; }
      const tb = T.store.get(base.concat('test', 'best'), null), lb = T.store.get(base.concat('lightning', 'best'), null);
      const medal = tb != null ? prizeFor(medals, tb) : null, bolt = lb != null ? prizeFor(bolts, lb) : null;
      if (medal) out.medals += 1;
      if (bolt) out.bolts += 1;
      const n = T.packs[s.n] && T.packs[s.n].test && T.packs[s.n].test.items ? T.packs[s.n].test.items.length : 10;
      out.prizes.push({ s: s, stars: T.progress.stopStars(s.n),
        medal: hasTest ? { prize: medal, best: tb == null ? null : fill(T.REWARDS.outOf, { n: tb, m: n }), key: medal ? 'm' + s.n + '-' + medal.k : '' } : null,
        bolt: hasBolt ? { prize: bolt, best: lb, key: bolt ? 'l' + s.n + '-' + bolt.k : '' } : null });
    });
    const sm = T.store.get(['summit'], null) || {};
    out.summit = { won: !!(sm.test && sm.test.won), day: day(sm.trophy && sm.trophy.on), test: sm.test && sm.test.best != null ? sm.test : null,
      big: sm.big && sm.big.best != null ? sm.big.best : null };
    out.any = out.summit.won || out.summit.test != null || out.summit.big != null || out.stars > 0 || out.won > 0 || out.medals > 0 || out.bolts > 0 || T.rewards.KINDS.some(function (k) { return out.runs[k] > 0; });
    return out;
  }

  function pic(id, cls) {
    return T.ui.plate(T.ui.art(id, { decorative: true }), { shape: 'round', replay: false, cls: cls });
  }

  function freshTag(c, key, fresh) {
    if (!key || c.seen[key]) return null;
    fresh.push(key);
    return el('span', { class: 'shelf__new' }, words().fresh);
  }

  function badgeItem(b, i, c, fresh) {
    const W = words();
    const status = b.won ? (b.day ? fill(W.won, { d: b.day }) : W.wonNoDate) : b.open ? W.notYet : W.soon;
    return el('li', { class: ['shelf__item', b.won ? 'is-won' : 'is-outline'], style: { '--i': String(i) },
      'aria-label': 'Stop ' + b.s.n + ', ' + b.s.badge + ': ' + status + '.' },
      b.won ? freshTag(c, b.key, fresh) : null,
      pic(b.s.badgeArt, 'shelf__pic'),
      el('span', { class: 'shelf__name', 'aria-hidden': 'true' }, b.s.badge),
      el('span', { class: 'shelf__status', 'aria-hidden': 'true' }, status));
  }

  // one prize of a stop: the medal or the bolt (an outline until it is won) with the best score
  function prizeSlot(kind, slot, c, fresh) {
    const W = words();
    const won = slot.prize;
    const art = won ? kind + '-' + won.k : kind + '-gold';
    const name = won ? won.name : kind === 'medal' ? W.medalNone : W.boltNone;
    const best = slot.best != null ? fill(W.best, { b: slot.best }) : W.notYet;
    return el('div', { class: ['shelf__slot', won ? 'is-won' : 'is-outline'], role: 'group', 'aria-label': name + '. ' + best + '.' },
      won ? freshTag(c, slot.key, fresh) : null,
      pic(art, 'shelf__pic shelf__pic--prize'),
      el('span', { class: 'shelf__name', 'aria-hidden': 'true' }, name),
      el('span', { class: 'shelf__status', 'aria-hidden': 'true' }, best));
  }

  function section(title, how, body, cls) {
    return el('section', { class: ['shelf', cls] },
      el('h2', { class: 'shelf__title' }, title),
      how ? el('p', { class: 'shelf__how' }, how) : null,
      body);
  }

  function mount() {
    const W = words();
    const school = !!(T.school && T.school.chip);
    const playing = school || !!(T.players && T.players.active && T.players.active());
    const c = collect();
    const fresh = [];
    const line = !c.any ? W.empty : c.won >= (T.stops || []).length && c.won > 0 ? W.all : W.some;
    const zip = T.ui.instruction({ en: line.en, vi: line.vi, mood: c.any ? 'cheer' : 'happy', sound: false });

    // a tile: a picture, the number, the word (one star, 2 stars)
    const tile = function (cls, iconNode, n, shown, names) {
      return el('li', { class: ['trophies__tile', cls] }, el('span', { class: 'trophies__tile-pic', 'aria-hidden': 'true' }, iconNode),
        el('b', { class: 'trophies__tile-n' }, String(shown)), el('span', { class: 'trophies__tile-t' }, names[n === 1 ? 0 : 1]));
    };
    const nine = (T.stops || []).length;
    const tiles = el('ul', { class: 'trophies__tiles' },
      tile('is-stars', T.ui.stars(1, 1), c.stars, c.stars, W.tiles.stars),
      tile('is-badges', T.ui.art((T.stops[0] || {}).badgeArt || 'badge-1', { decorative: true }), nine, c.won + ' / ' + nine, W.tiles.badges),
      tile('is-medals', T.ui.art('medal-gold', { decorative: true }), c.medals, c.medals, W.tiles.medals),
      tile('is-bolts', T.ui.art('bolt-gold', { decorative: true }), c.bolts, c.bolts, W.tiles.bolts));

    const badges = section(W.badges, W.badgesHow,
      el('ol', { class: 'shelf__row shelf__row--badges' }, c.badges.map(function (b, i) { return badgeItem(b, i, c, fresh); })), 'shelf--badges');

    const cubbies = c.prizes.map(function (p) {
      return el('li', { class: 'shelf__cubby' },
        el('h3', { class: 'shelf__cubby-title' }, fill(W.stop, { n: p.s.n }) + ': ' + p.s.world,
          el('span', { class: 'shelf__cubby-stars' }, T.ui.stars(p.stars > 0 ? 1 : 0, 1, { size: 'sm' }), el('span', p.stars + ' / 15'))),
        el('div', { class: 'shelf__slots' },
          p.medal ? prizeSlot('medal', p.medal, c, fresh) : null,
          p.bolt ? prizeSlot('bolt', p.bolt, c, fresh) : null));
    });
    const prizes = section(W.prizes, W.prizesHow, el('div', null,
      el('ul', { class: 'shelf__cubbies' }, cubbies),
      c.soon ? el('p', { class: 'shelf__soon' }, c.soon === 1 ? W.moreSoonOne : fill(W.moreSoon, { n: c.soon })) : null), 'shelf--prizes');

    // the Summit: the trophy, the final test's best, the big Lightning round's best
    const SW = T.SUMMIT.shelf, sm = c.summit;
    const smSlot = function (art, name, status, on, key) {
      return el('div', { class: ['shelf__slot', on ? 'is-won' : 'is-outline'], role: 'group', 'aria-label': name + '. ' + status + '.' },
        on && key ? freshTag(c, key, fresh) : null,
        pic(art, 'shelf__pic shelf__pic--prize'),
        el('span', { class: 'shelf__name', 'aria-hidden': 'true' }, name),
        el('span', { class: 'shelf__status', 'aria-hidden': 'true' }, status));
    };
    const summit = section(SW.title, SW.how, el('div', { class: 'shelf__slots shelf__slots--summit' },
      smSlot('trophy-summit', sm.won ? SW.trophy : SW.trophyNot, sm.won ? (sm.day ? fill(W.won, { d: sm.day }) : W.wonNoDate) : SW.notYet, sm.won, 'summit'),
      smSlot('icon-summit-test', SW.test, sm.test ? fill(W.best, { b: fill(T.REWARDS.outOf, { n: sm.test.best, m: sm.test.total }) }) : SW.notYet, !!sm.test, ''),
      smSlot('icon-extra-lightning', SW.big, sm.big != null ? fill(W.best, { b: sm.big }) : SW.notYet, sm.big != null, '')), 'shelf--summit');

    const runs = section(W.runs, W.runsHow, el('ul', { class: 'shelf__runs' }, T.rewards.KINDS.map(function (k) {
      const n = c.runs[k];
      return el('li', { class: ['shelf__run', n ? 'is-won' : 'is-outline'] },
        el('span', { class: 'shelf__run-n', 'aria-hidden': 'true' }, n ? String(n) : '0'),
        el('span', { class: 'shelf__run-t' }, el('b', W.kinds[k]), el('span', n ? fill(W.run, { n: n }) : W.notYet)));
    })), 'shelf--runs');

    const leave = function () { T.router.go(playing ? 'home' : 'players'); };
    const head = el('header', { class: 'home__head trophies__head' },
      T.ui.iconButton({ icon: 'back', label: playing ? 'Back to the map' : 'Back to the start', onClick: leave }),
      el('div', { class: 'brand' }, el('span', { class: 'trophies__cup', 'aria-hidden': 'true' }, T.ui.icon('trophy')), el('h1', { class: 'brand__name' }, W.title)));
    const inner = el('div', { class: 'trophies__inner rise' }, zip.el, tiles, badges, prizes, summit, runs);
    const scroller = el('div', { class: 'trophies__scroll' }, inner);
    const bar = T.ui.actionBar();
    T.shell.screen.appendChild(el('div', { class: ['trophies', !c.any && 'is-empty'] }, head, scroller, bar.el));
    bar.primary(playing
      ? { label: 'Back to the map', icon: 'map', onClick: leave }
      : { label: 'Start', iconEnd: 'next', onClick: leave });

    // what wore "New!" now is seen (it follows the child: trophy.seen joins with "true wins")
    if (fresh.length) {
      const seen = Object.assign({}, c.seen);
      fresh.forEach(function (k) { seen[k] = true; });
      T.store.set(['trophy', 'seen'], seen);
      if (!T.ui.reducedMotion()) {
        const first = inner.querySelector('.shelf__new');
        const r = first && first.parentNode.getBoundingClientRect();
        if (r && r.width && r.bottom < window.innerHeight) setTimeout(function () { T.fx.sparkle(r.left + r.width / 2, r.top + r.height / 3, 14); T.fx.sfx('chime', { i: 8 }); }, 650);
      }
    }
    return function cleanup() { T.ui.closeOverlays(); };
  }

  T.trophies = { collect: collect, day: day };
  T.router.register('trophies', mount);
})(window.T = window.T || {});

