/* 27-howto.js - the written "How to use" guide for students and for teachers and families, every line in English
   and Vietnamese (ported from the Grade 5 Science trail's 27-guide.js; T.guide is the pointing hand here, 17-guide.js).
   It goes with the picture page "How to use" (route 'how-to', 32-howto.js): every "How to use" button opens that
   page, and the page and the start screen carry this card, whose two buttons open the guide on its tab.
   The preview build only (it speaks of saving on this device); the school build has its own notes.

   The text is T.HOWTO.guide (31-howto-text.js: data only, so build.mjs writes it to dist/dump.txt).
   T.howto.card()       the card: "How to use the trail" with Students / Teachers and families
   T.howto.open(tab)    the guide as a sheet; tab 'students' (default) or 'teachers' */
(function (T) {
  'use strict';
  const el = T.util.el;

  const TABS = ['students', 'teachers'];
  let GUIDE = null;                                   // T.HOWTO.guide (31-howto-text.js), read when first used
  function guide() { return GUIDE || (GUIDE = T.HOWTO.guide); }

  function list(items) {
    return el('ul', { class: 'howto-g__list' }, items.map(function (it) {
      return el('li', { class: 'howto-g__item' },
        el('span', { class: 'howto-g__icon' }, T.ui.icon(it.icon)),
        el('div', { class: 'howto-g__text' },
          el('p', { class: 'howto-g__en' }, T.ui.richText(it.en)),
          el('p', { class: 'howto-g__vi', lang: 'vi' }, T.ui.richText(it.vi))));
    }));
  }

  function open(tab) {
    T.ui.closeOverlays();
    const GUIDE = guide();
    const tabs = {}, panels = {};
    const bar = el('div', { class: 'howto__tabs', role: 'tablist' });
    TABS.forEach(function (key) {
      const g = GUIDE[key];
      const tabId = T.util.uid('htab'), panelId = T.util.uid('hpanel');
      tabs[key] = el('button', { type: 'button', class: 'howto__tab', role: 'tab', id: tabId, 'aria-controls': panelId, dataset: { tab: key } },
        el('span', { class: 'howto__tab-en' }, g.tab.en), el('span', { class: 'howto__tab-vi', lang: 'vi' }, g.tab.vi));
      tabs[key].addEventListener('click', function () { T.fx.sfx('tap'); show(key); });
      panels[key] = el('div', { class: 'howto__panel', role: 'tabpanel', id: panelId, 'aria-labelledby': tabId, dataset: { tab: key } }, list(g.items));
      bar.appendChild(tabs[key]);
    });
    function show(key) {
      TABS.forEach(function (k) {
        const on = k === key;
        tabs[k].classList.toggle('is-on', on);
        tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
        panels[k].hidden = !on;
      });
    }
    show(tab === 'teachers' ? 'teachers' : 'students');
    T.ui.dialog({
      title: GUIDE.title.en,
      sheet: true,
      cls: 'howto-sheet',
      body: [el('p', { class: 'howto-sheet__sub', lang: 'vi' }, GUIDE.title.vi), bar].concat(TABS.map(function (k) { return panels[k]; })),
      actions: [{ label: 'Got it', kind: 'primary', icon: 'check' }]
    });
  }

  function card() {
    const GUIDE = guide();
    const students = T.ui.button({ label: GUIDE.students.tab.en, sub: GUIDE.students.tab.vi, icon: 'people', kind: 'secondary', cls: 'howto-card__btn', onClick: function () { open('students'); } });
    const teachers = T.ui.button({ label: GUIDE.teachers.tab.en, sub: GUIDE.teachers.tab.vi, icon: 'info', kind: 'secondary', cls: 'howto-card__btn', onClick: function () { open('teachers'); } });
    return el('section', { class: 'howto-card', 'aria-label': GUIDE.title.en },
      el('div', { class: 'howto-card__head' },
        el('span', { class: 'howto-card__icon' }, T.ui.icon('info')),
        el('div', el('p', { class: 'howto-card__title' }, GUIDE.title.en),
          el('p', { class: 'howto-card__vi', lang: 'vi' }, GUIDE.title.vi))),
      el('div', { class: 'howto-card__btns' }, students, teachers));
  }

  T.howto = { open: open, card: card };
})(window.T = window.T || {});

