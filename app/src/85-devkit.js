/* 85-devkit.js - the component gallery (route 'dev-kit') and a demo activity (route 'dev-stage').

   Neither route is linked from the app. The gallery shows every part of the UI kit in every
   state, in the theme that is showing. The demo is a tiny activity built on the stage with the
   layout recipes of brief/api-ui.md: copy it as a starting point for a step. It saves nothing. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const ui = T.ui;

  function section(title, note, kids) {
    return el('section', { class: 'kit-section' },
      el('h2', { class: 'kit-section__title' }, title),
      note ? el('p', { class: 'kit-section__note' }, note) : null,
      kids);
  }

  // one specimen: the thing and a small caption
  function spec(caption, node, cls) {
    return el('figure', { class: ['kit-spec', cls] }, el('div', { class: 'kit-spec__box' }, node), el('figcaption', caption));
  }

  function row(kids, cls) {
    return el('div', { class: ['kit-row', cls] }, kids);
  }

  /* ---------- the sections ---------- */

  function buttons() {
    const band = el('div', { class: 'kit-band' },
      ui.iconButton({ icon: 'back', label: 'Back', kind: 'band' }),
      el('span', { class: 'topbar__title' }, 'On the top bar'),
      el('span', { class: 'topbar__progress' }, ui.dots(3, 6)),
      ui.soundSwitch({ kind: 'band' }));
    const disabledIcon = ui.iconButton({ icon: 'next', label: 'Next (disabled)' });
    disabledIcon.disabled = true;
    return section('Buttons', 'Only things you can press have the chunky edge. One primary button per screen, in the bottom bar.', [
      row([
        spec('primary, big', ui.button({ label: 'Start: Words', kind: 'primary', big: true, iconEnd: 'next' })),
        spec('primary with a second line', ui.button({ label: 'Continue', sub: 'Number Factory: Practise', kind: 'primary', big: true, iconEnd: 'next' })),
        spec('primary, disabled', ui.button({ label: 'Check', kind: 'primary', big: true, disabled: true }))
      ]),
      row([
        spec('primary', ui.button({ label: 'Next', kind: 'primary' })),
        spec('secondary', ui.button({ label: 'Flip', kind: 'secondary', icon: 'flip' })),
        spec('good', ui.button({ label: 'My answer means the same', kind: 'good', icon: 'check' })),
        spec('danger', ui.button({ label: 'Not yet', kind: 'danger' })),
        spec('quiet', ui.button({ label: 'Play again', kind: 'quiet', icon: 'replay' })),
        spec('secondary, disabled', ui.button({ label: 'Next', kind: 'secondary', disabled: true }))
      ]),
      row([
        spec('icon button', ui.iconButton({ icon: 'home', label: 'Home' })),
        spec('icon button, float', ui.iconButton({ icon: 'back', label: 'Back', kind: 'float' })),
        spec('icon button, disabled', disabledIcon),
        spec('sound switch', ui.soundSwitch()),
        spec('VI button', ui.viButton()),
        spec('icon buttons on the band', band, 'kit-spec--wide')
      ])
    ]);
  }

  function choices() {
    const make = function (label, state, extra) {
      const node = ui.choice(Object.assign({ label: label }, extra || {}));
      if (state) node.classList.add(state);
      return node;
    };
    const dim = make('the stalk', 'is-dim');
    return section('Choices', 'Set the class on the button: is-picked, is-right, is-wrong (soft coral, a small shake), is-dim.', [
      row([
        spec('default', make('It is worth 300.')),
        spec('is-picked', make('It is worth 300.', 'is-picked')),
        spec('is-right', make('It is worth 300.', 'is-right')),
        spec('is-wrong', make('It makes nectar.', 'is-wrong')),
        spec('is-dim', dim)
      ], 'kit-row--cards'),
      row([
        spec('with a picture', make('a hundred', '', { art: 'badge-1' })),
        spec('with a picture, is-right', make('a hundred', 'is-right', { art: 'badge-1' })),
        spec('layout: word', make('digit', '', { layout: 'word' })),
        spec('layout: word, is-wrong', make('ovary', 'is-wrong', { layout: 'word' }))
      ], 'kit-row--cards'),
      row([
        spec('layout: tile', make('hundreds', '', { art: 'badge-1', layout: 'tile' })),
        spec('tile, is-picked', make('hundreds', 'is-picked', { art: 'badge-1', layout: 'tile' })),
        spec('tile, is-right', make('hundreds', 'is-right', { art: 'badge-1', layout: 'tile' })),
        spec('tile, picture missing', make('tens', '', { art: 'w-none', layout: 'tile' }))
      ], 'kit-row--tiles')
    ]);
  }

  function plates() {
    return section('Plates and chips', 'Content that is read sits on a flat, quiet plate. No edge: it cannot be pressed.',
      row([
        spec('.panel', el('div', { class: 'panel' }, el('p', '4,372 has 4 thousands, 3 hundreds, 7 tens and 2 ones.'))),
        spec('.panel.panel--soft', el('div', { class: 'panel panel--soft' }, el('p', 'A softer plate, for a second level.'))),
        spec('.chip', el('span', { class: 'chip' }, ui.icon('lock'), 'Coming soon')),
        spec('.pressable: your own tappable thing', el('button', { type: 'button', class: 'pressable kit-tile' }, 'sepals'))
      ], 'kit-row--cards'));
  }

  function meters() {
    const total = el('span', { class: 'star-total' }, ui.stars(1, 1), el('span', '12'));
    return section('Stars, hearts, dots, bar', 'All drawn, never text glyphs. T.ui.meter(el, value) changes one that is on screen.', [
      row([
        spec('stars(0, 3)', ui.stars(0, 3)),
        spec('stars(1, 3)', ui.stars(1, 3)),
        spec('stars(2, 3)', ui.stars(2, 3)),
        spec('stars(3, 3)', ui.stars(3, 3)),
        spec('size sm', ui.stars(2, 3, { size: 'sm' })),
        spec('size lg', ui.stars(2, 3, { size: 'lg' })),
        spec('the star total', total)
      ]),
      row([
        spec('hearts(3, 3)', ui.hearts(3, 3)),
        spec('hearts(2, 3)', ui.hearts(2, 3)),
        spec('hearts(0, 3)', ui.hearts(0, 3)),
        spec('dots(3, 6)', ui.dots(3, 6)),
        spec('dots(3, 12): words', ui.dots(3, 12)),
        spec('bar(0.4)', ui.bar(0.4), 'kit-spec--wide')
      ])
    ]);
  }

  function strip() {
    const open = ui.instruction({ en: 'Tap the digit in the *hundreds* place.', vi: 'Chạm vào chữ số ở *hàng trăm*.', mood: 'happy', sound: false });
    open.el.querySelector('.vi-btn').click();                // show it with VI open
    const oops = ui.instruction({ en: 'Not this one. *Try again*.', vi: 'Chưa đúng. *Thử lại* nhé.', mood: 'oops', sound: false });
    const plain = ui.instruction({ en: 'Read the number. Say what each digit is worth.', vi: 'Đọc số. Nói giá trị của mỗi chữ số.', zip: false, plain: true });
    const text = el('p', { class: 'kit-text' }, ui.richText('The [[digit]] 3 in 4,372 is worth 300. A *highlight* marks a key idea.'));
    return section('The instruction strip and text', 'One short line. *asterisks* make the gold highlight. [[key words]] open the word card.', [
      row([
        spec('instruction, VI open', open.el, 'kit-spec--wide'),
        spec('mood: oops', oops.el, 'kit-spec--wide'),
        spec('plain: a blurb with VI', plain.el, 'kit-spec--wide'),
        spec('richText: highlight and key words', text, 'kit-spec--wide')
      ], 'kit-row--cards')
    ]);
  }

  function zips() {
    const moods = ['happy', 'cheer', 'oops', 'think'];
    return section('Zip', 'Four moods. Zip never talks: his line is the instruction strip.',
      row(moods.map(function (mood) { return spec(mood, el('span', { class: 'kit-zip' }, ui.zip(mood))); })));
  }

  function icons() {
    return section('Icons', 'T.ui.icon(name): drawn, one stroke style, the colour of the text around them.',
      el('div', { class: 'kit-icons' }, ui.icons.map(function (name) {
        return el('span', { class: 'kit-icon' }, ui.icon(name), el('span', name));
      })));
  }

  function pictures() {
    return section('Drawings and the art plate', 'The plate is light in both themes. Tap a plate to see its drawing move again.', [
      row([
        spec('plate, playing (tap to replay)', ui.plate('badge-1', { play: true })),
        spec('grey: the test paper look', ui.plate('badge-1', { grey: true, replay: false })),
        spec('a drawing that has not arrived', ui.plate('w-none')),
        spec('a step icon', ui.plate('icon-step-practise', { pad: 10 }))
      ], 'kit-row--tiles'),
      row([
        spec('size sm (7.5rem)', ui.plate('badge-2', { size: 'sm', replay: false })),
        spec('size xs, round', ui.plate('icon-step-see', { size: 'xs', shape: 'round' })),
        spec('round, bleed: a badge', ui.plate('badge-1', { size: 'sm', shape: 'round bleed' })),
        spec('missing badge', ui.plate('badge-0', { size: 'sm', shape: 'round bleed' })),
        spec('shape wide: a world scene (the Number Factory)', ui.plate('world-number-factory', { shape: 'wide bleed' }), 'kit-spec--wide'),
        spec('shape wide: a scene not drawn yet', ui.plate('world-sharing-harbour', { shape: 'wide bleed' }), 'kit-spec--wide')
      ])
    ]);
  }

  function cards() {
    const say = function (text) { return function () { ui.toast(text); }; };
    return section('Result card', 'T.ui.resultCard: stars, a title, short lines, ONE big button, quiet actions.',
      row([
        spec('3 stars', ui.resultCard({
          stars: 3, title: 'Excellent!', lines: ['You know all *8* words.'],
          primary: { label: 'Next: See it', iconEnd: 'next', onClick: say('Next: See it') },
          secondary: [{ label: 'Play again', icon: 'replay', onClick: say('Play again') }, { label: 'Back to the stop', onClick: say('Back to the stop') }]
        })),
        spec('1 star', ui.resultCard({
          stars: 1, title: 'Step finished!', lines: ['You won 1 star. Play again to win more.'],
          primary: { label: 'Next: Practise', iconEnd: 'next', onClick: say('Next: Practise') },
          secondary: [{ label: 'Play again', icon: 'replay', onClick: say('Play again') }]
        }))
      ], 'kit-row--cards'));
  }

  function overlays() {
    const openDialog = function () {
      ui.dialog({
        title: 'Start again?', body: 'Your stars are safe. Only this game starts again.',
        actions: [{ label: 'Keep playing', kind: 'secondary' }, { label: 'Start again', kind: 'primary', onClick: function () { ui.toast('Started again.'); } }]
      });
    };
    const openBadge = function () {
      ui.celebrate({ over: 'New badge', title: 'Place Value Pro', sub: 'You finished every step of the Number Factory.', art: 'badge-1' });
    };
    const still = function (handle) { return handle ? handle.el : el('p', 'The pack has no words yet.'); };
    return section('Dialog, toast, word card, celebration', 'They open over the page: focus is kept inside, Escape closes. The specimens below are the same parts, not opened.', [
      row([
        spec('open them', el('div', { class: 'kit-stack' },
          ui.button({ label: 'Open a dialog', onClick: openDialog, cls: 'kit-open-dialog' }),
          ui.button({ label: 'Show a toast', onClick: function () { ui.toast('Saved on this device. *Well done!*'); }, cls: 'kit-open-toast' }),
          ui.button({ label: 'Open the word card', onClick: function () { ui.wordCard('digit'); }, cls: 'kit-open-word' }),
          ui.button({ label: 'Celebrate a badge', onClick: openBadge, cls: 'kit-open-badge' }))),
        spec('dialog', still(ui.dialog({
          inline: true, title: 'Start again?', body: 'Your stars are safe. Only this game starts again.',
          actions: [{ label: 'Keep playing', kind: 'secondary' }, { label: 'Start again', kind: 'primary' }]
        }))),
        spec('word card', still(ui.wordCard('digit', { inline: true }))),
        spec('toast', ui.toast('Saved on this device. *Well done!*', { inline: true }))
      ], 'kit-row--cards'),
      row([
        spec('celebration', still(ui.celebrate({ inline: true, over: 'New badge', title: 'Place Value Pro', sub: 'You finished every step of the Number Factory.', art: 'badge-1' })), 'kit-spec--wide')
      ], 'kit-row--cards')
    ]);
  }

  function recipes() {
    return section('A stage, built with the recipes', 'A tiny activity on the real stage: picture on top, choices below, the bottom bar. It saves nothing.',
      row([spec('route dev-stage', ui.button({ label: 'Open the demo activity', kind: 'secondary', iconEnd: 'next', cls: 'kit-open-stage', onClick: function () { T.router.go('dev-stage'); } }))]));
  }

  /* ---------- the gallery screen ---------- */

  function mountKit() {
    const page = el('div', { class: 'devkit' },
      el('header', { class: 'devkit__head' },
        ui.iconButton({ icon: 'home', label: 'Home', onClick: function () { T.router.go('home'); } }),
        el('div', el('h1', 'UI kit'), el('p', 'Grade\u00a03 Maths Revision Trail: every component and state. Theme: ' + (ui.isDark() ? 'dark' : 'light') + '.'))),
      buttons(), choices(), meters(), strip(), plates(), zips(), pictures(), cards(), overlays(), icons(), recipes());
    T.shell.screen.appendChild(page);
    return function cleanup() { ui.closeOverlays(); };
  }

  /* ---------- the demo activity: "What is the gold digit worth?" ---------- */

  const DEMO = [
    { text: '4,*3*72', answer: '300', options: ['3', '30', '300', '3,000'] },
    { text: '5,0*8*1', answer: '80', options: ['8', '80', '800', '8,000'] },
    { text: '*6*,215', answer: '6,000', options: ['6', '60', '600', '6,000'] }
  ];

  function mountDemo() {
    const ctx = T.stage.open({ stop: 1, step: 'practise', title: 'Demo: what is it worth?' });
    const pic = el('div', { class: 'stage-pic' });
    const answers = el('div', { class: 'choices choices--2' });
    ctx.body.appendChild(el('div', { class: 'stage-stack stage-stack--split' }, pic, el('div', { class: 'stage-do' }, answers)));
    let round = 0, score = 0, picked = null, tries = 0;

    function ask() {
      const q = DEMO[round];
      picked = null;
      tries = 0;
      ctx.progress(round + 1, DEMO.length);
      ctx.instruct({ en: 'What is the *gold* digit worth?', vi: 'Chữ số *màu vàng* có giá trị bao nhiêu?', mood: 'think' });
      ui.empty(pic).appendChild(el('p', { class: 'demo-number' }, ui.richText(q.text)));
      ui.empty(answers);
      q.options.forEach(function (word) {
        const node = ui.choice({ label: word, layout: 'word', value: word, sfx: 'pick', onClick: function () { pick(node, word); } });
        answers.appendChild(node);
      });
      ui.stagger(answers);
      ctx.primary({ label: 'Check', disabled: true });
    }

    function pick(node, word) {
      T.util.$$('.choice', answers).forEach(function (other) { other.classList.remove('is-picked', 'is-wrong'); });
      node.classList.add('is-picked');
      picked = { node: node, word: word };
      ctx.primary({ label: 'Check', onClick: check });
    }

    function check() {
      if (!picked) return;
      const q = DEMO[round];
      picked.node.classList.remove('is-picked');
      if (picked.word === q.answer) {
        picked.node.classList.add('is-right');
        T.util.$$('.choice', answers).forEach(function (other) { if (other !== picked.node) other.classList.add('is-dim'); });
        if (tries === 0) score += 1;
        T.fx.sfx('ok', { streak: score });
        T.fx.burst(picked.node, 14);
        ctx.instruct({ en: 'Yes. The digit is worth *' + q.answer + '*.', vi: 'Đúng rồi. Chữ số đó có giá trị ' + q.answer + '.', mood: 'cheer' });
        ctx.primary({ label: round + 1 < DEMO.length ? 'Next' : 'Finish', iconEnd: 'next', onClick: next });
      } else {
        const wrong = picked.node;
        tries += 1;
        wrong.classList.add('is-wrong');
        T.fx.sfx('no');
        ctx.instruct({ en: 'Not this one. *Try again*.', vi: 'Chưa đúng. *Thử lại* nhé.', mood: 'oops' });
        ctx.later(function () { wrong.classList.remove('is-wrong'); wrong.classList.add('is-dim'); }, 700);
        picked = null;
        ctx.primary({ label: 'Check', disabled: true });
      }
    }

    function next() {
      round += 1;
      if (round < DEMO.length) { ask(); return; }
      ctx.result({
        stars: score === DEMO.length ? 3 : score === DEMO.length - 1 ? 2 : 1,
        title: 'Demo finished',
        lines: ['First try: *' + score + ' of ' + DEMO.length + '*.', 'This was only a demo. Nothing was saved.'],
        primary: { label: 'Back to the kit', onClick: function () { T.router.go('dev-kit'); } },
        secondary: [{ label: 'Play again', icon: 'replay', onClick: function () { T.router.go('dev-stage'); } }]
      });
    }

    ctx.onBack(function () { T.router.go('dev-kit'); return true; });
    ask();
    return ctx.leave;
  }

  T.router.register('dev-kit', mountKit);
  T.router.register('dev-stage', mountDemo);
})(window.T = window.T || {});

