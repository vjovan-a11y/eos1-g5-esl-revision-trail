/* 60-notes.js - the Notes step: how to do it (worked methods), then a short check.
   Copied from the Grade 4 trail (reference/g4-science/parts/60-notes.js) and made for maths: each note has a
   worked example and a picture drawn by the maths tools.

   Reads ctx.pack.notes = { items: [{en, vi, example, pic, art}], check: [{sentence: 'A {right|wrong|wrong}.', answer}] }.
     example   short lines of a worked example (*highlights* and [[key words]] allowed), shown under the note
     pic       a picture made by the maths tools (T.tools.pic spec: chart, slider, stack, swap, mat ...); else art
   Part 1: one note per screen (the picture, the note in large type with [[key words]]
   that open the word card, the example, a VI button for the Vietnamese). Under the last note: the learning
   objective codes for teachers.
   Part 2: one gap sentence per screen with its three choices, shuffled. One try each. No picture here:
   the child uses the method from memory.
   The step has one unit, 'check': the score out of the number of sentences (1 out of 1 when the
   pack has no check yet). Missing vi, art or check never break the step. */
(function (T) {
  'use strict';

  /* ---------- strings (a pack may override any of them with pack.ui.notes.<name>) ---------- */

  const STR = {
    read:    { en: 'Read this *note*.', vi: 'Hãy đọc *ghi chú* này.' },
    last:    { en: 'Last note. Then a *check*.', vi: 'Đây là ghi chú cuối. Sau đó là phần *kiểm tra*.' },
    lastNo:  { en: 'Last note. Tap *Finish*.', vi: 'Đây là ghi chú cuối. Bấm *Finish* (Hoàn thành).' },
    check:   { en: 'Tap the word that *fits*.', vi: 'Chạm vào từ *phù hợp* để điền vào chỗ trống.' },
    right:   { en: 'Yes! That is *right*.', vi: 'Giỏi lắm! Em chọn *đúng* rồi.' },
    wrong:   { en: 'This is the *right* word.', vi: 'Đây mới là từ *đúng*.' },
    empty:   { en: 'No notes here yet.', vi: 'Chưa có ghi chú nào.' }
  };

  (T.zipLines = T.zipLines || {}).notes = STR;          // checked by test/guide.mjs (at most 10 words)

  const LABEL = {
    next: 'Next', back: 'Back', finish: 'Finish', of: ' of ', note: 'Note ', check: 'Check ',
    teachers: 'For teachers:', gap: 'gap', picture: 'Picture for this note', example: 'Example',
    title: 'Notes done!', score: function (s, n) { return 'You got *' + s + ' out of ' + n + '* right.'; }
  };

  /* ---------- small helpers ---------- */

  const el = function () { return T.util.el.apply(null, arguments); };

  function str(ctx, name) {
    const own = ctx.pack && ctx.pack.ui && ctx.pack.ui.notes && ctx.pack.ui.notes[name];
    return own && own.en ? own : STR[name];
  }

  function say(ctx, name, mood) { ctx.instruct(Object.assign({ mood: mood || 'happy' }, str(ctx, name))); }

  // 'Muscles work in {pairs|threes|lines}.' -> {before, choices, after}, or null when there is no gap
  function parseGap(sentence) {
    const m = /^([\s\S]*?)\{([^}]*)\}([\s\S]*)$/.exec(String(sentence || ''));
    if (!m) return null;
    const choices = m[2].split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    return choices.length ? { before: m[1], choices: choices, after: m[3] } : null;
  }

  // a few items that can be shown; tolerant of a pack that is still being written
  function usableItems(notes) {
    return ((notes && notes.items) || []).filter(function (it) { return it && it.en; });
  }
  function usableChecks(notes) {
    return ((notes && notes.check) || []).map(function (c) {
      const gap = c && parseGap(c.sentence);
      return gap && gap.choices.indexOf(c.answer) >= 0 ? Object.assign({ answer: c.answer }, gap) : null;
    }).filter(Boolean);
  }

  /* ---------- the step ---------- */

  // A tall, thin drawing (the whole skeleton) sits in a 4:3 frame and looks small in a tall plate.
  // Trim the empty sides of the frame (height untouched) so the drawing fills the plate it gets.
  function snugPlate(plate) {
    requestAnimationFrame(function () {
      const svg = plate.querySelector('svg.art');
      if (!svg || !svg.isConnected || !svg.viewBox || !svg.viewBox.baseVal) return;
      const vb = svg.viewBox.baseVal;
      let b;
      try { b = svg.getBBox(); } catch (e) { return; }
      if (!b || !b.width || b.width > vb.width * 0.6) return;
      const pad = vb.width * 0.08;
      const x0 = Math.max(vb.x, b.x - pad);
      const x1 = Math.min(vb.x + vb.width, b.x + b.width + pad);
      svg.setAttribute('viewBox', [x0, vb.y, x1 - x0, vb.height].join(' '));
    });
    return plate;
  }

  T.steps = T.steps || {};
  T.steps.notes = {
    mount: function (ctx) {
      const notes = ctx.pack && ctx.pack.notes;
      const items = usableItems(notes);
      const checks = usableChecks(notes);
      let busyUntil = 0;   // a double tap on "Next" must not skip a screen

      // one tap = one move, even when the label of the main button does not change
      function guard(fn) {
        return function () {
          const now = Date.now();
          if (now < busyUntil) return;
          busyUntil = now + 380;
          fn();
        };
      }

      function clear() { T.ui.empty(ctx.body); ctx.secondary(null); }

      /* ---------- 1. the notes ---------- */

      function showNote(i) {
        clear();
        const item = items[i];
        const isLast = i === items.length - 1;
        ctx.progress(i + 1, items.length);
        say(ctx, isLast ? (checks.length ? 'last' : 'lastNo') : 'read');


        const head = el('div', { class: 'nt-head' },
          el('span', { class: 'nt-num', text: (i + 1) + LABEL.of + items.length }));
        const viLine = item.vi ? el('p', { class: 'nt-vi', lang: 'vi', hidden: true, text: item.vi }) : null;
        if (viLine) {
          head.appendChild(T.ui.viButton(function (open) { viLine.hidden = !open; }));
        }
        const text = el('p', { class: 'nt-text' });
        text.appendChild(T.ui.richText(item.en));
        const lines = [].concat(item.example || []).filter(Boolean);
        const example = lines.length ? el('div', { class: 'nt-ex' },
          el('p', { class: 'nt-ex__label', text: LABEL.example }),
          lines.map(function (line) { return el('p', { class: 'nt-ex__line' }, T.ui.richText(line)); })) : null;
        const card = el('article', { class: 'panel nt-card', 'aria-label': LABEL.note + (i + 1) + LABEL.of + items.length },
          head, text, example, viLine);

        const doBox = el('div', { class: 'stage-do nt-do' }, card);
        const los = ctx.pack && ctx.pack.los;
        if (isLast && los && los.length) {
          doBox.appendChild(el('p', { class: 'nt-los' },
            el('span', { class: 'nt-los__label', text: LABEL.teachers }), ' ' + los.join(', ')));
        }

        const tool = item.pic && T.tools && T.tools.pic ? T.tools.pic(item.pic) : null;
        const stack = el('div', { class: 'stage-stack stage-stack--split nt-stack rise' + (tool || item.art ? '' : ' nt-stack--noart') });
        if (tool) stack.appendChild(el('div', { class: 'stage-pic nt-pic nt-pic--tool', role: 'img', 'aria-label': LABEL.picture }, tool));
        else if (item.art) stack.appendChild(el('div', { class: 'stage-pic nt-pic' }, snugPlate(T.ui.plate(item.art, { shape: 'fill', play: true, label: LABEL.picture }))));
        stack.appendChild(doBox);
        ctx.body.appendChild(stack);

        if (i > 0) ctx.secondary({ label: LABEL.back, icon: 'back', onClick: guard(function () { showNote(i - 1); }) });
        ctx.primary({
          label: isLast && !checks.length ? LABEL.finish : LABEL.next,
          iconEnd: 'next',
          kind: 'primary',
          onClick: guard(function () {
            if (!isLast) return showNote(i + 1);
            if (checks.length) return showCheck(0, 0, 0);
            ctx.saveUnit('check', 1, 1);
            ctx.finish({});
          })
        });
      }

      /* ---------- 2. the check ---------- */

      function showCheck(i, score, streak) {
        clear();
        const c = checks[i];
        const isLast = i === checks.length - 1;
        ctx.progress(i + 1, checks.length);
        say(ctx, 'check', 'think');

        const gap = el('span', { class: 'nt-gap', 'aria-label': LABEL.gap });
        const sentence = el('p', { class: 'nt-sentence' });
        sentence.appendChild(T.ui.richText(c.before));
        sentence.appendChild(gap);
        sentence.appendChild(T.ui.richText(c.after));

        const art = null;                                 // maths: no picture in the check (the method comes from memory)
        const head = el('div', { class: 'nt-head' }, el('span', { class: 'nt-num', text: LABEL.check + (i + 1) + LABEL.of + checks.length }));
        const card = el('div', { class: 'panel nt-card nt-card--check' }, head, sentence);
        const box = el('div', { class: 'choices nt-choices' });
        T.util.shuffle(c.choices).forEach(function (word) {
          box.appendChild(T.ui.choice({
            label: word, layout: 'word', value: word, sfx: false,
            onClick: function (e) { answer(e.currentTarget, word); }
          }));
        });

        const stack = el('div', { class: 'stage-stack stage-stack--split nt-stack rise' + (art ? '' : ' nt-stack--noart') });
        if (art) stack.appendChild(el('div', { class: 'stage-pic nt-pic' }, snugPlate(T.ui.plate(art, { shape: 'fill', label: LABEL.picture }))));
        stack.appendChild(el('div', { class: 'stage-do nt-do' }, card, box));
        ctx.body.appendChild(stack);
        T.ui.stagger(box);
        ctx.primary({ label: isLast ? LABEL.finish : LABEL.next, iconEnd: 'next', disabled: true });
        T.guide.point('choice', function () { return box.querySelector('.choice'); });

        function fill() {
          gap.removeAttribute('aria-label');
          gap.textContent = c.answer;
          gap.classList.add('is-filled');
        }

        // one tap answers: right or wrong, the gap fills with the right word, then "Next"
        function answer(node, word) {
          if (box.classList.contains('is-locked')) return;
          box.classList.add('is-locked');
          const all = T.util.$$('.choice', box);
          const right = word === c.answer;
          if (right) {
            score++; streak++;
            node.classList.add('is-right');
            T.fx.sfx('ok', { streak: Math.min(streak, 8) });
            T.fx.burst(node, streak >= 3 ? 20 : 12);
            say(ctx, 'right', 'cheer');
            all.forEach(function (o) { if (o !== node) o.classList.add('is-dim'); });
            fill();
          } else {
            streak = 0;
            node.classList.add('is-wrong');
            T.fx.sfx('no');
            say(ctx, 'wrong', 'oops');
            const good = all.filter(function (o) { return o.getAttribute('data-value') === c.answer; })[0];
            ctx.later(function () {
              node.classList.remove('is-wrong');
              all.forEach(function (o) { if (o !== good) o.classList.add('is-dim'); });
              if (good) good.classList.add('is-right');
              fill();
            }, 650);
          }
          ctx.primary({
            label: isLast ? LABEL.finish : LABEL.next, iconEnd: 'next', kind: 'primary',
            onClick: guard(function () {
              if (!isLast) return showCheck(i + 1, score, streak);
              ctx.saveUnit('check', score, checks.length);
              ctx.finish({ lines: [LABEL.score(score, checks.length)] });
            })
          });
        }
      }

      /* ---------- start ---------- */

      if (!items.length) {
        say(ctx, 'empty', 'think');
        ctx.progress(null);
        ctx.primary({ label: LABEL.back, icon: 'back', onClick: function () { T.router.go('stop-' + ctx.stop); } });
        return;
      }
      showNote(0);
    }
  };
})(window.T = window.T || {});

