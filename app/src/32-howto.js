/* 32-howto.js - "How to use" (route 'how-to'): a short, picture-led page for children and teachers.

   Reached from the "?" button in the map header and on the start screen. Readable on the classroom board
   (big type at 1920 x 1080). Few words: one short caption per card, {en, vi}; ONE VI button shows every
   Vietnamese caption. The pictures are the app's own drawings and real parts of its screens (the step icons,
   the nine badges, stars, a medal and a bolt, Zip's line, the Hint buttons, a test paper, the pointing hand).
   ONE main button: "Back to the map" when a child is playing (or in the school build), else "Start".
   The captions are in T.HOWTO (31-howto-text.js, data only, so build.mjs writes them to dist/dump.txt too).
   Every "How to use" button opens this page (the map, the start screen); in the preview build it ends with the card of
   the written guide (27-howto.js: Students, Teachers and families, every line in English and Vietnamese). */
(function (T) {
  'use strict';

  const el = T.util.el;

  const STEP_TEXT = T.HOWTO.steps;

  function pic(id, cls) {
    return T.ui.plate(T.ui.art(id, { decorative: true }), { shape: 'round', replay: false, cls: cls });
  }

  // a part of a real screen, shown as a picture: it looks like the button but cannot be tapped
  function fake(label, icon, kind) {
    return el('span', { class: ['btn', 'btn--' + (kind || 'quiet'), 'howto__fake'], 'aria-hidden': 'true' },
      icon && icon !== 'next' ? T.ui.icon(icon) : null, el('span', { class: 'btn__label' }, label), icon === 'next' ? T.ui.icon(icon) : null);
  }

  function pictureOf(key) {
    switch (key) {
      case 'trail':
        return el('ol', { class: 'howto__badges', 'aria-hidden': 'true' }, (T.stops || []).map(function (s) {
          return el('li', pic(s.badgeArt, 'howto__badge'), el('b', String(s.n)));
        }));
      case 'steps':
        return el('ol', { class: 'howto__steps' }, T.STEPS.map(function (s, i) {
          return el('li', pic(T.STEP_ART[s.id], 'howto__icon'),
            el('span', { class: 'howto__step' }, el('b', (i + 1) + '. ' + s.label), el('span', STEP_TEXT[s.id] || '')));
        }));
      case 'extras':
        return el('ul', { class: 'howto__steps howto__steps--two' }, T.EXTRAS.map(function (x) {
          return el('li', pic(T.STEP_ART[x.id], 'howto__icon'), el('span', { class: 'howto__step' }, el('b', x.label)));
        }));
      case 'win':
        return el('div', { class: 'howto__win', 'aria-hidden': 'true' },
          T.ui.stars(3, 3, { size: 'lg' }),
          el('span', { class: 'howto__prize' }, pic((T.stops[0] || {}).badgeArt || 'badge-1', 'howto__icon')),
          el('span', { class: 'howto__prize' }, T.ui.art('medal-gold', { decorative: true })),
          el('span', { class: 'howto__prize' }, T.ui.art('bolt-gold', { decorative: true })));
      case 'zip':
        return el('div', { class: 'howto__zip' }, T.ui.instruction({ en: T.HOWTO.zipLine.en, vi: T.HOWTO.zipLine.vi, mood: 'happy', sound: false }).el);
      case 'stuck':
        return el('div', { class: 'howto__row', 'aria-hidden': 'true' }, fake('Hint', 'bulb'), fake('Show me how', 'bulb'));
      case 'paper':
        return el('div', { class: 'howto__paper', 'aria-hidden': 'true' },
          el('p', el('b', '1 '), 'Write the number.'),
          el('p', { class: 'howto__dots' }, el('span'), el('i', '[1]')),
          el('p', el('b', '2 '), 'Tick one box.'),
          el('p', { class: 'howto__ticks' }, el('span', { class: 'is-on' }, T.ui.icon('check')), el('span'), el('span')),
          fake('Mark my paper', 'next', 'primary'));
      case 'hand':
        return el('div', { class: 'howto__handbox', 'aria-hidden': 'true' }, fake('Flip the card', 'flip', 'primary'),
          el('span', { class: 'howto__hand', html: T.guide.handSvg }));
      default:
        return el('div', { class: 'howto__saved', 'aria-hidden': 'true' }, T.ui.icon(key === 'saved' ? 'people' : 'device'), T.ui.stars(3, 3, { size: 'lg' }));
    }
  }

  function mount() {
    const school = !!(T.school && T.school.chip);
    const playing = school || !!(T.players && T.players.active && T.players.active());
    const keys = ['trail', 'steps', 'extras', 'win', 'zip', 'stuck', 'paper', 'hand', school ? 'saved' : 'device'];
    const viLines = [];
    const cards = keys.map(function (key) {
      const c = T.HOWTO.cards[key];
      const vi = el('p', { class: 'howto__vi', lang: 'vi', hidden: true }, c.vi);
      viLines.push(vi);
      return el('li', { class: ['howto__card', 'panel', 'howto__card--' + key] },
        el('div', { class: 'howto__pic' }, pictureOf(key)),
        el('h2', { class: 'howto__title' }, c.t),
        el('p', { class: 'howto__en' }, c.en), vi);
    });
    const viButton = T.ui.viButton(function (open) { viLines.forEach(function (line) { line.hidden = !open; }); });
    const leave = function () { T.router.go(playing ? 'home' : 'players'); };
    const head = el('header', { class: 'home__head howto__head' },
      T.ui.iconButton({ icon: 'back', label: playing ? 'Back to the map' : 'Back to the start', onClick: leave }),
      el('div', { class: 'brand' }, T.ui.brandMark(), el('h1', { class: 'brand__name' }, T.HOWTO.title.en)),
      viButton);
    const list = el('ol', { class: 'howto__grid' }, cards);
    // the preview build: the written guide for students and for teachers and families (27-howto.js) under the pictures
    const more = !school && T.howto ? el('div', { class: 'howto__more' }, T.howto.card()) : null;
    const scroller = el('div', { class: 'howto__scroll' }, el('div', { class: 'howto__inner rise' }, list, more));
    const bar = T.ui.actionBar();
    T.shell.screen.appendChild(el('div', { class: 'howto' }, head, scroller, bar.el));
    bar.primary(playing
      ? { label: 'Back to the map', icon: 'map', onClick: leave }
      : { label: 'Start', iconEnd: 'next', onClick: leave });
    return function cleanup() { T.ui.closeOverlays(); };
  }

  // the button that opens this page (the map header, the start screen): "?" and, where there is room, "How to use"
  T.howtoButton = function () {
    const node = T.ui.iconButton({ icon: 'help', label: 'How to use', cls: 'home__help', onClick: function () { T.router.go('how-to'); } });
    node.appendChild(el('span', { class: 'home__help-text', 'aria-hidden': 'true' }, 'How to use'));
    return node;
  };

  T.router.register('how-to', mount);
})(window.T = window.T || {});

