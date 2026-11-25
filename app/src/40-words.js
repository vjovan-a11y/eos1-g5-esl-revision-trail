/* 40-words.js - the Words step: picture cards in small sets, then a quick picture quiz for each set.
   Copied from the Grade 4 trail (reference/g4-science/parts/40-words.js). Changes for Maths: no "hear the word"
   button (no voice anywhere), and the Vietnamese meaning on the back of a card waits behind a VI button.
   Route stop-N-words. Fills T.steps.words = {mount(ctx)}.

   Flow:  set menu -> learn one set (flip cards) -> check that set (picture quiz) -> set result
          -> back to the menu or on to the next set. When every set has a result: ctx.finish().
   Data:  ctx.pack.words = {sets: [{id, title: {en, vi}, keys}], items: {word: {art, vi, def, cue, chunks}}}
          cue and chunks may be missing. A drawing that is not there yet gives the kit's placeholder.
   State: only the set results are saved (ctx.saveUnit); a child who leaves starts at the menu. */
(function (T) {
  'use strict';

  /* ---------- strings (a pack may override any of them with pack.ui.words.<name>) ---------- */

  const STR = {
    menu:      { en: 'Pick a *set* of words.', vi: 'Chọn một *nhóm* từ.' },
    menuDone:  { en: 'All sets done. Tap *Finish*.', vi: 'Đã xong hết các nhóm. Bấm *Finish* (Hoàn thành).' },
    front:     { en: 'What is this? *Say the word.*', vi: 'Đây là gì? *Hãy nói từ đó.*' },
    back:      { en: 'Do you *know* this word?', vi: 'Em đã *biết* từ này chưa?' },
    again:     { en: 'Try this one *again*.', vi: 'Hãy thử *lại* từ này nhé.' },
    pickWord:  { en: 'Tap the *word* for this picture.', vi: 'Chạm vào *từ* đúng với bức tranh này.' },
    pickPic:   { en: 'Tap the *picture* for this word.', vi: 'Chạm vào *bức tranh* đúng với từ này.' },
    list:      { en: 'Read the words. Then tap *Quiz me*.', vi: 'Đọc các từ. Rồi bấm *Quiz me* (Kiểm tra).' },
    meaning:   { en: 'Which word *fits* this meaning?', vi: 'Từ nào *đúng* với nghĩa này?' },
    right:     { en: 'Yes! That is *right*.', vi: 'Giỏi lắm! Em chọn *đúng* rồi.' },
    wrong:     { en: 'This is the *right* one.', vi: 'Đây mới là đáp án *đúng*.' }
  };

  const LABEL = {
    start: 'Start: ', finish: 'Finish', flip: 'Flip the card', know: 'I know it', notYet: 'Not yet',
    nextSet: 'Next set', backToSets: 'Back to the sets', words: ' words',
    picture: 'Picture', blank: 'blank', done: 'Words done!', quiz: 'Quiz me', cards: 'Flip the cards'
  };

  /* ---------- small helpers ---------- */

  const el = function () { return T.util.el.apply(null, arguments); };

  function str(ctx, name) {
    const own = ctx.pack && ctx.pack.ui && ctx.pack.ui.words && ctx.pack.ui.words[name];
    return own && own.en ? own : STR[name];
  }

  function enOf(t) { return t && typeof t === 'object' ? (t.en || '') : String(t || ''); }

  // the saved result of a set, or null
  function resultOf(ctx, set) { return T.progress.unit(ctx.stop, 'words', set.id); }

  // a set's words that really have an entry in the pack
  function keysOf(words, set) {
    return (set.keys || []).filter(function (k) { return words.items && words.items[k]; });
  }

  function starsFor(score, max) {
    const f = max ? score / max : 0;
    return f >= 0.9 ? 3 : f >= 0.75 ? 2 : 1;
  }

  // the cue sentence with its gap drawn as a line; '___' (two or more underscores) marks the gap
  function cueNode(text) {
    const box = el('p', { class: 'wd-cue' });
    String(text).split(/_{2,}/).forEach(function (part, i) {
      if (i > 0) box.appendChild(el('span', { class: 'wd-gap' }, el('span', { class: 'sr-only' }, LABEL.blank)));
      if (part) box.appendChild(document.createTextNode(part));
    });
    return box;
  }

  // chunks 'skel·e·ton' -> ['skel', 'e', 'ton']
  function chunksOf(item) {
    const raw = item && typeof item.chunks === 'string' ? item.chunks : '';
    return raw.split(/\s*[·•|]\s*/).filter(Boolean);
  }

  /* ---------- the step ---------- */

  function mount(ctx) {
    const words = (ctx.pack && ctx.pack.words) || { sets: [], items: {} };
    const sets = (words.sets || []).filter(function (s) { return keysOf(words, s).length > 0; });
    let view = 'menu';            // 'menu' | 'learn' | 'check' | 'result'
    let resultHandle = null;
    let token = 0;                // bumps on every screen change: late timers of an old screen do nothing

    ctx.onBack(function () {
      if (view === 'menu') return false;
      showMenu();
      return true;
    });

    function clear() {
      token++;
      if (resultHandle) { resultHandle.close(); resultHandle = null; }
      T.ui.empty(ctx.body);
      ctx.primary(null);
      ctx.secondary(null);
    }

    function nextOpenSet() {
      for (let i = 0; i < sets.length; i++) if (!resultOf(ctx, sets[i])) return sets[i];
      return null;
    }

    /* ---------- 1. the set menu ---------- */

    function showMenu() {
      clear();
      view = 'menu';
      ctx.title('Words');
      const next = nextOpenSet();
      ctx.instruct(Object.assign({ mood: 'happy' }, str(ctx, next ? 'menu' : 'menuDone')));
      ctx.progress(sets.filter(function (s) { return !!resultOf(ctx, s); }).length, sets.length, { count: true });   // sets done

      const list = el('div', { class: 'wd-menu' });
      sets.forEach(function (set, i) {
        const keys = keysOf(words, set);
        const res = resultOf(ctx, set);
        const firstArt = words.items[keys[0]].art;
        const status = res
          ? el('span', { class: 'wd-set__score' },
              el('span', { class: 'wd-set__tick' }, T.ui.icon('check')),
              el('span', { class: 'wd-set__num' }, res.score + ' / ' + res.max))
          : el('span', { class: 'wd-set__go' }, T.ui.icon('next'));
        const card = el('button', {
          type: 'button',
          class: ['wd-set', 'pressable', res && 'is-done', set === next && 'is-next'],
          'aria-label': enOf(set.title) + ', ' + keys.length + LABEL.words + (res ? ', ' + res.score + ' of ' + res.max : '')
        },
          T.ui.plate(firstArt, { cls: 'wd-set__pic', replay: false, label: LABEL.picture, decorative: true }),
          el('span', { class: 'wd-set__text' },
            el('span', { class: 'wd-set__n' }, 'Set ' + (i + 1)),
            el('span', { class: 'wd-set__title' }, enOf(set.title)),
            el('span', { class: 'wd-set__count' }, keys.length + LABEL.words)),
          status);
        card.addEventListener('click', function () { T.fx.sfx('tap'); startSet(set); });
        list.appendChild(card);
      });
      ctx.body.appendChild(list);
      T.ui.stagger(list);

      if (next) {
        // a long set name would wrap the big button on a phone: then "Start: Set 2"
        const nextTitle = enOf(next.title);
        const nextName = nextTitle.length <= 20 ? nextTitle : 'Set ' + (sets.indexOf(next) + 1);
        ctx.primary({ label: LABEL.start + nextName, iconEnd: 'next', onClick: function () { startSet(next); } });
      } else {
        ctx.primary({ label: LABEL.finish, iconEnd: 'next', onClick: finishStep });
      }
    }

    function startSet(set) { learnList(set); }

    /* ---------- 2a. learn: all the words of a set on one screen (quick), then the quiz ---------- */

    // the pack's def is "meaning Example: sentence" (scripts/convert.py): split it back
    function partsOf(item) {
      const d = String(item.def || ''), at = d.indexOf(' Example: ');
      return at < 0 ? { def: d, ex: '' } : { def: d.slice(0, at), ex: d.slice(at + 10) };
    }
    function starred(text) {
      const p = el('p', { class: 'wd-ex' });
      String(text).split(/\*([^*]+)\*/).forEach(function (bit, i) { p.appendChild(i % 2 ? el('mark', bit) : document.createTextNode(bit)); });
      return p;
    }

    function learnList(set) {
      clear();
      view = 'learn';
      ctx.title(enOf(set.title));
      ctx.progress(0, 0);
      ctx.instruct(Object.assign({ mood: 'happy' }, str(ctx, 'list')));
      const list = el('ul', { class: 'wd-list' });
      keysOf(words, set).forEach(function (key, n) {
        const item = words.items[key], pr = partsOf(item);
        const viLine = item.vi ? el('p', { class: 'wd-vi', lang: 'vi', hidden: true }, item.vi) : null;
        const viToggle = viLine ? T.ui.viButton(function (open) { viLine.hidden = !open; }) : null;
        list.appendChild(el('li', { class: 'wd-row rise', style: '--i:' + n },
          el('span', { class: 'wd-row__pic', 'aria-hidden': 'true' }, T.ui.art(item.art, { decorative: true })),
          el('div', { class: 'wd-row__text' },
            el('div', { class: 'wd-row__head' }, el('h3', { class: 'wd-row__word' }, key), viToggle),
            el('p', { class: 'wd-def' }, pr.def),
            pr.ex ? starred(pr.ex) : null,
            viLine)));
      });
      ctx.body.appendChild(el('div', { class: 'wd-listwrap' }, list));
      ctx.primary({ label: LABEL.quiz, iconEnd: 'next', onClick: function () { check(set); } });
      ctx.secondary({ label: LABEL.cards, icon: 'flip', onClick: function () { learn(set); } });
    }

    /* ---------- 2b. learn with cards (optional): one card at a time, flip, "Not yet" comes back once ---------- */

    function learn(set) {
      clear();
      view = 'learn';
      ctx.title(enOf(set.title));
      const queue = keysOf(words, set).slice();
      const repeated = {};
      let pos = 0;
      const wrap = el('div', { class: 'wd-learn' });
      ctx.body.appendChild(wrap);
      showCard();

      function showCard() {
        if (pos >= queue.length) { check(set); return; }
        const key = queue[pos];
        const item = words.items[key];
        const again = !!repeated[key];
        ctx.progress(pos + 1, queue.length);
        ctx.instruct(Object.assign({ mood: 'think' }, str(ctx, again ? 'again' : 'front')));
        ctx.secondary(null);

        const card = buildCard(key, item);
        T.ui.empty(wrap).appendChild(card.el);
        ctx.primary({ label: LABEL.flip, icon: 'flip', sfx: false, onClick: flip });
        T.guide.point('flip', function () { return ctx.root.querySelector('.actionbar__primary'); });

        function flip() {
          T.fx.sfx('flip');
          card.flip();
          ctx.instruct(Object.assign({ mood: 'happy' }, str(ctx, 'back')));
          ctx.secondary({ label: LABEL.notYet, onClick: function () {
            if (!repeated[key]) { repeated[key] = true; queue.push(key); }
            pos++; showCard();
          } });
          ctx.primary({ label: LABEL.know, icon: 'check', onClick: function () { pos++; showCard(); } });
        }
      }
    }

    // one word card with two faces; returns {el, flip()}
    function buildCard(key, item) {
      const frontPic = T.ui.plate(item.art, { shape: 'fill', play: true, label: LABEL.picture, cls: 'wd-face__pic' });
      const cue = item.cue && enOf(item.cue) ? cueNode(enOf(item.cue)) : null;
      const front = el('div', { class: 'wd-face wd-face--front' }, frontPic, cue);

      const parts = chunksOf(item);
      const viLine = item.vi ? el('p', { class: 'wd-vi', lang: 'vi', hidden: true }, item.vi) : null;
      const viToggle = viLine ? T.ui.viButton(function (open) { viLine.hidden = !open; }) : null;
      const back = el('div', { class: 'wd-face wd-face--back', 'aria-hidden': 'true' },
        el('div', { class: 'wd-back__head' },
          el('div', { class: 'wd-back__wordline' }, el('h2', { class: ['wd-word', T.ui.longWord && T.ui.longWord(key) && 'is-long'] }, key), viToggle),
          parts.length > 1
            ? el('p', { class: 'wd-chunks', 'aria-label': parts.join(' ') },
                parts.map(function (p, i) { return el('span', { class: 'wd-chunk', style: '--i:' + i }, p); }))
            : null),
        el('div', { class: 'wd-back__body' },
          T.ui.plate(item.art, { cls: 'wd-back__pic', label: key }),
          el('div', { class: 'wd-back__meaning' },
            item.def ? el('p', { class: 'wd-def' }, item.def) : null,
            viLine)));

      const inner = el('div', { class: 'wd-card__inner' }, front, back);
      const card = el('div', { class: 'wd-card rise' }, inner);
      return {
        el: card,
        flip: function () {
          card.classList.add('is-flipped');
          front.setAttribute('aria-hidden', 'true');
          back.removeAttribute('aria-hidden');
          T.util.$$('[role="button"]', front).forEach(function (n) { n.setAttribute('tabindex', '-1'); });
          const pic = back.querySelector('svg.art');
          ctx.later(function () { if (pic) T.ui.playArt(pic); }, 460);
        }
      };
    }

    /* ---------- 3. check: one question per word, two kinds in turn ---------- */

    function check(set) {
      clear();
      view = 'check';
      const mine = token;
      const keys = T.util.shuffle(keysOf(words, set));
      const others = [];
      sets.forEach(function (s) { if (s !== set) keysOf(words, s).forEach(function (k) { if (keys.indexOf(k) < 0) others.push(k); }); });
      let i = 0, score = 0, streak = 0;
      ask();

      function ask() {
        if (mine !== token) return;
        if (i >= keys.length) { showResult(set, score, keys.length); return; }
        T.ui.empty(ctx.body);
        ctx.progress(i + 1, keys.length);
        const key = keys[i];
        askMeaning(key);
      }

      // distractor words: same set first, then the other sets
      function wordPool(key) {
        return T.util.shuffle(keys.filter(function (k) { return k !== key; })).concat(T.util.shuffle(others));
      }

      // the meaning (the word itself hidden) with three word choices; the example shows after the answer
      function askMeaning(key) {
        ctx.instruct(Object.assign({ mood: 'think' }, str(ctx, 'meaning')));
        const item = words.items[key], pr = partsOf(item);
        const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const def = pr.def.replace(/for example/gi, '\u0001').replace(new RegExp('\\b' + esc + '(?![a-z])', 'gi'), '_____').replace(/\u0001/g, 'for example');
        const options = T.util.shuffle([key].concat(wordPool(key).slice(0, 2)));
        const box = el('div', { class: 'choices wd-words' });
        options.forEach(function (k) {
          box.appendChild(T.ui.choice({ label: k, layout: 'word', value: k, sfx: false, onClick: function (e) {
            answer(e.currentTarget, k, key, box);
            if (pr.ex) card.appendChild(starred(pr.ex));
          } }));
        });
        const card = el('div', { class: 'wd-mean' },
          el('span', { class: 'wd-row__pic', 'aria-hidden': 'true' }, T.ui.art(item.art, { decorative: true })),
          el('p', { class: 'wd-mean__def' }, def));
        ctx.body.appendChild(el('div', { class: 'wd-q wd-q--mean' }, card, box));
        T.ui.stagger(box);
        T.guide.point('choice', function () { return box.querySelector('.choice'); });
      }

      // (a) the picture with three word choices (not used now: kept for other trails)
      function askWord(key) {
        ctx.instruct(Object.assign({ mood: 'think' }, str(ctx, 'pickWord')));
        const options = T.util.shuffle([key].concat(wordPool(key).slice(0, 2)));
        const pic = el('div', { class: 'stage-pic' },
          T.ui.plate(words.items[key].art, { shape: 'fill', play: true, label: LABEL.picture }));
        const box = el('div', { class: 'choices wd-words' });
        options.forEach(function (k) {
          box.appendChild(T.ui.choice({ label: k, layout: 'word', value: k, sfx: false, onClick: function (e) { answer(e.currentTarget, k, key, box); } }));
        });
        ctx.body.appendChild(el('div', { class: 'stage-stack stage-stack--split wd-q wd-q--word' }, pic, el('div', { class: 'stage-do' }, box)));
        T.ui.stagger(box);
        T.guide.point('choice', function () { return box.querySelector('.choice'); });
      }

      // (b) the word with four picture choices (three when there are not four different pictures)
      function askPicture(key) {
        ctx.instruct(Object.assign({ mood: 'think' }, str(ctx, 'pickPic')));
        const arts = [words.items[key].art];
        const picks = [key];
        const add = function (list, cap) {
          list.forEach(function (k) {
            const a = words.items[k].art;
            if (picks.length < cap && arts.indexOf(a) < 0) { arts.push(a); picks.push(k); }
          });
        };
        add(T.util.shuffle(keys.filter(function (k) { return k !== key; })), 4);
        if (picks.length < 3) add(T.util.shuffle(others), 3);
        const options = T.util.shuffle(picks);
        const wordBox = el('div', { class: 'stage-pic wd-bigword' }, el('p', { class: ['wd-word', 'wd-word--q', T.ui.longWord && T.ui.longWord(key) && 'is-long'] }, key));
        const box = el('div', { class: ['choices', 'choices--2', 'wd-pics', options.length === 3 && 'wd-pics--3'] });
        options.forEach(function (k, n) {
          box.appendChild(T.ui.choice({
            art: T.ui.art(words.items[k].art, { decorative: true }), layout: 'tile', value: k, sfx: false,
            aria: LABEL.picture + ' ' + (n + 1),
            onClick: function (e) { answer(e.currentTarget, k, key, box); }
          }));
        });
        ctx.body.appendChild(el('div', { class: 'stage-stack stage-stack--split wd-q wd-q--pic' }, wordBox, el('div', { class: 'stage-do' }, box)));
        T.ui.stagger(box);
      }

      // one tap answers: right or wrong, then the next question after a pause
      function answer(node, picked, key, box) {
        if (box.classList.contains('is-locked')) return;
        box.classList.add('is-locked');
        const all = T.util.$$('.choice', box);
        const right = picked === key;
        if (right) {
          score++; streak++;
          node.classList.add('is-right');
          T.fx.sfx('ok', { streak: Math.min(streak, 8) });
          T.fx.burst(node, streak >= 3 ? 20 : 12);
          ctx.instruct(Object.assign({ mood: 'cheer' }, str(ctx, 'right')));
          all.forEach(function (c) { if (c !== node) c.classList.add('is-dim'); });
        } else {
          streak = 0;
          node.classList.add('is-wrong');
          T.fx.sfx('no');
          ctx.instruct(Object.assign({ mood: 'oops' }, str(ctx, 'wrong')));
          const good = all.filter(function (c) { return c.getAttribute('data-value') === key; })[0];
          ctx.later(function () {
            if (mine !== token) return;
            node.classList.remove('is-wrong');
            all.forEach(function (c) { if (c !== good) c.classList.add('is-dim'); });
            if (good) good.classList.add('is-right');
          }, 650);
        }
        ctx.later(function () { i++; ask(); }, right ? 1900 : 3200);
      }
    }

    /* ---------- 4. the result of one set ---------- */

    function showResult(set, score, total) {
      ctx.saveUnit(set.id, score, total);
      view = 'result';
      ctx.primary(null);
      ctx.secondary(null);
      const next = nextOpenSet();
      const after = sets[sets.indexOf(set) + 1];
      const goOn = next || null;
      const primary = goOn
        ? { label: LABEL.nextSet, iconEnd: 'next', onClick: function () { learn(after && !resultOf(ctx, after) ? after : goOn); } }
        : { label: LABEL.finish, iconEnd: 'next', onClick: finishStep };
      resultHandle = ctx.result({
        stars: starsFor(score, total),
        title: score === total ? 'All right!' : score / total >= 0.75 ? 'Well done!' : 'Good try!',
        lines: ['You got *' + score + '* out of ' + total + '.', enOf(set.title)],
        primary: primary,
        secondary: { label: LABEL.backToSets, icon: 'back', onClick: showMenu }
      });
    }

    /* ---------- 5. the whole step ---------- */

    function finishStep() {
      clear();
      view = 'result';
      ctx.title('Words');
      let score = 0, max = 0;
      sets.forEach(function (s) { const r = resultOf(ctx, s); if (r) { score += r.score; max += r.max; } });
      let count = 0;
      sets.forEach(function (s) { count += keysOf(words, s).length; });
      ctx.finish({
        title: LABEL.done,
        lines: ['You learnt *' + count + '* words.', 'Quiz score: ' + score + ' out of ' + max + '.']
      });
    }

    if (!sets.length) {
      ctx.instruct({ en: 'No words here yet.', vi: 'Chưa có từ nào.' });
      return;
    }
    showMenu();
  }

  T.steps = T.steps || {};
  T.steps.words = { mount: mount };
  (T.zipLines = T.zipLines || {}).words = STR;          // every Zip line, checked by test/guide.mjs (at most 10 words)
})(window.T = window.T || {});

