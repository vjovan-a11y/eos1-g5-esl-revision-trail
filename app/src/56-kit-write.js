/* 56-kit-write.js - the Writing desk (Stop 9 'write' kit, and the Summit's Writing paper).

   A pack entry { id: 's9w', kit: 'write', tasks: [TASK] }; TASK = { id, task: 1 | 2, title, prompt, bullets: [3],
   min, max, needTitle, starters: [], models: [{ level, text, notes: [] }] }.
   Level 1 is Task 1 (35 to 45 words), level 2 is Task 2 (90 to 110 words). In a level the child picks one prompt,
   writes, then checks the writing in three ways:
     1. the counter: words now, and the target zone of the task (green inside it)
     2. "My checklist": a box for each bullet point (the child ticks what is done), the title (Task 2), and what the
        desk spots by itself: connectives, advice words (should, don't forget to), if ... will, opinions, paragraphs,
        capital letters at the start of sentences
     3. the self-mark with the school's own rubric words (content, organisation, language: 0 to 4 or 0 to 3), then
        the three model answers (Developing, Secure, Excellent) with what each does well or misses.
   Nothing is sent anywhere: the text is kept on this device (store: write.<task id>).
   Points for the shell (most 5): inside the word zone 2, marking the model close to the teacher's marks 2 (within 1: 2,
   within 3: 1; tasks without model marks: every bullet ticked 2), the self-mark done 1. The models show after the self-mark.
   T.esl.writeDesk(host, task, opts) -> { text(), words(), destroy() } is the desk alone (the Summit uses it). */
(function (T) {
  'use strict';

  const el = T.util.el;
  T.esl = T.esl || {};

  const CONNECT = ['first', 'firstly', 'second', 'secondly', 'next', 'then', 'after that', 'afterwards', 'finally', 'lastly', 'because', 'so', 'but',
    'however', 'also', 'when', 'before', 'after', 'if', 'although', 'as soon as', 'while', 'until', 'in addition', 'for example', 'as well as', 'in the end', 'as a result'];
  const ADVICE = ['should', 'shouldn\'t', 'must', 'mustn\'t', 'ought to', 'don\'t forget to', 'make sure', 'remember to', 'you need to', 'it\'s a good idea', 'try to', 'don\'t'];
  const OPINION = ['i think', 'in my opinion', 'i believe', 'i feel', 'i love', 'i like', 'my favourite', 'i would', 'i hope'];

  const RUBRIC = {
    1: [
      { k: 'content', name: 'Content', max: 4, lv: ['Off-topic or nothing useful.', 'Only one point, or very little advice.', 'Two points clear; something is missing.', 'All three points, but some advice needs more detail.', 'Clear advice on all three points, with a good reason.'] },
      { k: 'organisation', name: 'Organisation', max: 3, lv: ['No clear order.', 'Hard to follow.', 'Mostly in order, some linking words.', 'Clear order with good connectives (first, next, finally).'] },
      { k: 'language', name: 'Language', max: 3, lv: ['Mistakes stop the meaning.', 'Many mistakes; meaning sometimes unclear.', 'Simple words; some mistakes, meaning clear.', 'Good words and advice forms; spelling mostly correct.'] }
    ],
    2: [
      { k: 'content', name: 'Content', max: 4, lv: ['Off-topic or nothing useful.', 'Only one point, very little detail.', 'Two points clear, or three with little detail.', 'All three points; some need more detail.', 'All three points, relevant and detailed.'] },
      { k: 'reader', name: 'Clear for the reader', max: 4, lv: ['No meaningful message.', 'The reader struggles to understand.', 'Basic ideas are clear; some parts are not.', 'Ideas are clear; some could be explained better.', 'Very clear and interesting for the reader.'] },
      { k: 'organisation', name: 'Organisation', max: 3, lv: ['No organisation.', 'Ideas are hard to follow.', 'Organised, with some linking; title may be missing.', 'A good title; paragraphs; ideas clearly linked.'] },
      { k: 'language', name: 'Language', max: 4, lv: ['No meaningful language.', 'Very limited words and grammar.', 'Mainly simple words and sentences; many mistakes.', 'Good words, mostly correct grammar.', 'Varied words and sentences, accurate; tiny mistakes only.'] }
    ]
  };
  T.esl.RUBRIC = RUBRIC;

  const count = function (s) { const m = String(s || '').trim().match(/[A-Za-z0-9À-ɏ]+(?:['’-][A-Za-z0-9À-ɏ]+)*/g); return m ? m.length : 0; };
  const has = function (text, list) {
    const t = ' ' + String(text || '').toLowerCase().replace(/[’]/g, "'").replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    return list.filter(function (w) { return t.indexOf(' ' + w + ' ') >= 0; });
  };

  function spot(text, task) {
    const out = [];
    const con = has(text, CONNECT);
    out.push({ ok: con.length >= (task.task === 2 ? 3 : 2), en: con.length ? 'Linking words: ' + con.slice(0, 6).join(', ') : 'Add linking words: first, next, because, finally.' });
    if (task.task === 1) {
      const adv = has(text, ADVICE);
      out.push({ ok: adv.length > 0, en: adv.length ? 'Advice words: ' + adv.slice(0, 4).join(', ') : 'Add advice words: should, make sure, don\'t forget to.' });
    } else {
      const op = has(text, OPINION);
      out.push({ ok: op.length > 0, en: op.length ? 'Your feelings and opinions: ' + op.slice(0, 3).join(', ') : 'Say what you think or feel: I think ..., I love ... because ...' });
      const paras = String(text || '').split(/\n\s*\n|\n/).filter(function (p) { return count(p) >= 8; }).length;
      out.push({ ok: paras >= 2, en: paras >= 2 ? paras + ' paragraphs.' : 'Use 2 or 3 paragraphs (press Enter to start a new one).' });
    }
    if (/\bif\b[^.!?]*\b(will|'ll|won't|can)\b/i.test(text)) out.push({ ok: true, en: 'Great: you used if ... will.' });
    const sentences = String(text || '').split(/(?<=[.!?])\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
    const low = sentences.filter(function (s) { return /^[a-z]/.test(s); }).length;
    out.push({ ok: low === 0 && sentences.length > 0, en: low ? low + ' sentence(s) start with a small letter. Use a capital letter.' : 'Every sentence starts with a capital letter.' });
    const ends = /[.!?]["”']?\s*$/.test(String(text || '').trim());
    out.push({ ok: ends, en: ends ? 'Your writing ends with a full stop.' : 'Finish your last sentence with a full stop.' });
    return out;
  }

  function writeDesk(host, task, opts) {
    const o = opts || {};
    const key = ['write', String(task.id)];
    const saved = T.store.get(key, {}) || {};
    const desk = el('div', { class: 'wd' });
    const brief = el('section', { class: 'wd-brief' },
      el('p', { class: 'wd-kicker' }, 'Task ' + task.task + ' · ' + task.min + ' to ' + task.max + ' words'),
      el('h3', { class: 'wd-title' }, task.title),
      el('p', { class: 'wd-prompt' }, task.prompt),
      el('p', { class: 'wd-sub' }, 'In your writing, you should:'),
      el('ul', { class: 'wd-bullets' }, (task.bullets || []).map(function (b) { return el('li', b); })),
      task.needTitle ? el('p', { class: 'wd-sub' }, 'Give your writing a suitable title.') : null);
    const titleIn = task.needTitle ? el('input', { class: 'wd-titlein', type: 'text', placeholder: 'Your title', value: saved.title || '', 'aria-label': 'Your title', maxlength: '60' }) : null;
    const area = el('textarea', { class: 'wd-area', rows: task.task === 2 ? '11' : '6', placeholder: 'Write here ...', 'aria-label': 'Your writing', spellcheck: 'false' });
    area.value = saved.text || '';
    const counter = el('div', { class: 'wd-count', 'aria-live': 'polite' });
    const meter = el('div', { class: 'wd-meter' }, el('span', { class: 'wd-meter__zone' }), el('span', { class: 'wd-meter__dot' }));
    const starters = (task.starters || []).length ? el('div', { class: 'wd-starters' }, el('span', { class: 'wd-starters__lab' }, 'Sentence starters:'),
      task.starters.map(function (s) {
        const b = el('button', { type: 'button', class: 'chip wd-starter' }, s);
        b.addEventListener('click', function () {
          const add = s.replace(/\s*\.\.\.\s*$|…$/, ' ');
          const pos = area.selectionStart != null ? area.selectionStart : area.value.length;
          const before = area.value.slice(0, pos), after = area.value.slice(pos);
          const glue = before && !/\s$/.test(before) ? ' ' : '';
          area.value = before + glue + add + after;
          area.focus();
          const c = (before + glue + add).length; try { area.setSelectionRange(c, c); } catch (e) { /* old browsers */ }
          update();
        });
        return b;
      })) : null;
    desk.appendChild(brief);
    const paper = el('section', { class: 'wd-paper' }, titleIn, area, el('div', { class: 'wd-foot' }, meter, counter), starters);
    desk.appendChild(paper);
    const checks = el('section', { class: 'wd-checks' });
    desk.appendChild(checks);
    host.appendChild(desk);

    const ticks = saved.ticks || [];
    let modelsShown = false;
    function update() {
      const n = count(area.value);
      const inZone = n >= task.min && n <= task.max;
      counter.textContent = n + (n === 1 ? ' word' : ' words') + ' · target ' + task.min + ' to ' + task.max;
      counter.className = 'wd-count ' + (inZone ? 'is-good' : n > task.max ? 'is-over' : 'is-under');
      const top = Math.max(task.max * 1.35, n);
      meter.style.setProperty('--z0', (task.min / top * 100) + '%');
      meter.style.setProperty('--z1', (task.max / top * 100) + '%');
      meter.style.setProperty('--at', Math.min(100, n / top * 100) + '%');
      meter.classList.toggle('is-good', inZone);
      T.store.set(key, { text: area.value, title: titleIn ? titleIn.value : '', ticks: ticks, self: saved.self || null, calib: saved.calib != null ? saved.calib : null });
      if (o.onChange) o.onChange(n);
    }
    area.addEventListener('input', update);
    if (titleIn) titleIn.addEventListener('input', update);
    update();

    function showChecks() {
      T.ui.empty(checks);
      const n = count(area.value);
      checks.appendChild(el('h4', { class: 'wd-h' }, 'My checklist'));
      const list = el('ul', { class: 'wd-list' });
      (task.bullets || []).forEach(function (b, i) {
        const box = el('input', { type: 'checkbox', checked: !!ticks[i] || null });
        box.addEventListener('change', function () { ticks[i] = box.checked; update(); });
        list.appendChild(el('li', { class: 'wd-li' }, el('label', box, el('span', 'I did this: ' + b))));
      });
      const auto = [{ ok: n >= task.min && n <= task.max, en: n < task.min ? 'Too short: add ' + (task.min - n) + ' more words.' : n > task.max ? 'Too long: cut ' + (n - task.max) + ' words.' : 'The length is just right.' }];
      if (task.needTitle) auto.push({ ok: !!(titleIn && titleIn.value.trim()), en: titleIn && titleIn.value.trim() ? 'You gave it a title.' : 'Add a title.' });
      spot(area.value, task).forEach(function (x) { auto.push(x); });
      auto.forEach(function (x) { list.appendChild(el('li', { class: ['wd-li', 'wd-auto', x.ok ? 'is-ok' : 'is-todo'] }, T.ui.icon(x.ok ? 'check' : 'next'), el('span', x.en))); });
      checks.appendChild(list);
    }

    // marks of a model as one line: "Teacher's marks: Content 3/4 · Organisation 2/3 · Language 2/3 = 7 / 10"
    function marksLine(marks) {
      const rub = RUBRIC[task.task] || RUBRIC[1];
      const tot = rub.reduce(function (s, r) { return s + (marks[r.k] || 0); }, 0), max = rub.reduce(function (s, r) { return s + r.max; }, 0);
      return 'Teacher\'s marks: ' + rub.map(function (r) { return r.name + ' ' + (marks[r.k] || 0) + '/' + r.max; }).join(' · ') + '  =  ' + tot + ' / ' + max;
    }

    // "Mark the model first": the child marks one model with the rubric, then sees the teacher's marks
    let calib = saved.calib != null ? saved.calib : null;
    function showPractice(after) {
      const rub = RUBRIC[task.task] || RUBRIC[1];
      const m = (task.models || [])[1] || (task.models || [])[0];
      if (!m || !m.marks) { after(); return; }
      const mine = {};
      const box = el('section', { class: 'wd-self wd-practice' }, el('h4', { class: 'wd-h' }, 'Step 1: mark this answer like a teacher'),
        el('p', { class: 'wd-sub' }, 'Another student wrote this. Read it, then tap a mark in each row.'));
      const model = el('div', { class: 'wd-model' }); model.innerHTML = String(m.text || '').replace(/\n/g, '<br>');
      box.appendChild(model);
      const out = el('div', { class: 'wd-compare', hidden: true });
      rub.forEach(function (c) {
        const row = el('div', { class: 'wd-crit' }, el('p', { class: 'wd-crit__name' }, c.name + ' (out of ' + c.max + ')'));
        const opts = el('div', { class: 'wd-crit__opts', role: 'radiogroup', 'aria-label': c.name });
        for (let v = c.max; v >= 0; v--) {
          const b = el('button', { type: 'button', class: 'wd-lv', role: 'radio', 'aria-checked': 'false' }, el('b', String(v)), el('span', c.lv[v]));
          b.addEventListener('click', function () {
            if (!out.hidden) return;
            mine[c.k] = v;
            T.util.$$('.wd-lv', opts).forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', String(x === b)); });
            if (rub.every(function (r) { return mine[r.k] != null; })) reveal();
          });
          opts.appendChild(b);
        }
        row.appendChild(opts);
        box.appendChild(row);
      });
      box.appendChild(out);
      checks.appendChild(box);
      function reveal() {
        let diff = 0;
        out.hidden = false;
        out.appendChild(el('p', { class: 'wd-compare__head' }, 'How close were you? This answer is ' + m.level + '.'));
        out.appendChild(el('ul', { class: 'wd-notes' }, rub.map(function (r) {
          const a = mine[r.k], b = m.marks[r.k] || 0; diff += Math.abs(a - b);
          return el('li', { class: a === b ? 'is-same' : 'is-diff' }, r.name + ': you gave ' + a + ', the teacher gave ' + b + (a === b ? '. Spot on!' : a > b ? '. You were too kind.' : '. You were too strict.'));
        })));
        out.appendChild(el('ul', { class: 'wd-notes' }, (m.notes || []).map(function (x) { return el('li', x); })));
        calib = diff <= 1 ? 2 : diff <= 3 ? 1 : 0;
        saved.calib = calib; update();
        out.appendChild(el('p', { class: 'wd-compare__head' }, calib === 2 ? 'You mark like a teacher!' : 'Now use what you learnt to mark your own writing.'));
        after();
      }
    }

    function showSelf(done) {
      const rub = RUBRIC[task.task] || RUBRIC[1];
      const self = saved.self || {};
      const box = el('section', { class: 'wd-self' }, el('h4', { class: 'wd-h' }, (task.models || []).some(function (m) { return m.marks; }) ? 'Step 2: mark my own writing' : 'Mark my writing'),
        el('p', { class: 'wd-sub' }, 'Be honest, like a teacher. Read each row and tap the one that fits.'));
      rub.forEach(function (c) {
        const row = el('div', { class: 'wd-crit' }, el('p', { class: 'wd-crit__name' }, c.name + ' (out of ' + c.max + ')'));
        const opts = el('div', { class: 'wd-crit__opts', role: 'radiogroup', 'aria-label': c.name });
        for (let v = c.max; v >= 0; v--) {
          const b = el('button', { type: 'button', class: ['wd-lv', self[c.k] === v && 'is-on'], role: 'radio', 'aria-checked': String(self[c.k] === v) },
            el('b', String(v)), el('span', c.lv[v]));
          b.addEventListener('click', function () {
            self[c.k] = v; saved.self = self;
            T.util.$$('.wd-lv', opts).forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', String(x === b)); });
            update();
            const total = rub.reduce(function (s, r) { return s + (self[r.k] || 0); }, 0), max = rub.reduce(function (s, r) { return s + r.max; }, 0);
            sum.textContent = 'My mark: ' + total + ' / ' + max + (rub.every(function (r) { return self[r.k] != null; }) ? '' : ' (not finished)');
            if (rub.every(function (r) { return self[r.k] != null; })) { if (!modelsShown) { modelsShown = true; showModels(); } if (done) done(self); }
          });
          opts.appendChild(b);
        }
        row.appendChild(opts);
        box.appendChild(row);
      });
      const sum = el('p', { class: 'wd-sum' });
      box.appendChild(sum);
      checks.appendChild(box);
    }

    function showModels() {
      const ms = task.models || [];
      if (!ms.length) return;
      const box = el('section', { class: 'wd-models' }, el('h4', { class: 'wd-h' }, 'Compare with model answers'),
        el('p', { class: 'wd-sub' }, 'Which model is most like your writing? Find one thing to add or fix, then change your writing.'));
      const tabs = el('div', { class: 'wd-tabs', role: 'tablist' });
      const pane = el('div', { class: 'wd-pane' });
      function show(i) {
        T.util.$$('.wd-tab', tabs).forEach(function (t, j) { t.classList.toggle('is-on', i === j); t.setAttribute('aria-selected', String(i === j)); });
        T.ui.empty(pane);
        const m = ms[i];
        const box = el('div', { class: 'wd-model' });
        box.innerHTML = String(m.text || '').replace(/\n/g, '<br>');     // our own model texts: <b> titles, <br> paragraphs
        pane.appendChild(box);
        if (m.marks) pane.appendChild(el('p', { class: 'wd-marks' }, marksLine(m.marks)));
        pane.appendChild(el('ul', { class: 'wd-notes' }, (m.notes || []).map(function (x) { return el('li', x); })));
      }
      ms.forEach(function (m, i) {
        const t = el('button', { type: 'button', class: 'wd-tab', role: 'tab' }, m.level);
        t.addEventListener('click', function () { show(i); });
        tabs.appendChild(t);
      });
      box.appendChild(tabs); box.appendChild(pane);
      checks.appendChild(box);
      show(Math.min(1, ms.length - 1));
    }

    return {
      el: desk, area: area,
      text: function () { return area.value; },
      words: function () { return count(area.value); },
      ticks: function () { return ticks.filter(Boolean).length; },
      calib: function () { return calib; },
      check: function (done) { showChecks(); showPractice(function () { showSelf(done); }); checks.scrollIntoView && checks.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
      destroy: function () { if (desk.parentNode) desk.parentNode.removeChild(desk); }
    };
  }
  T.esl.writeDesk = writeDesk;
  T.esl.wordCount = count;

  /* ---------- the kit for the Practise step ---------- */
  T.gameKit = T.gameKit || {};
  T.gameKit.write = function (entry) {
    const byTask = { 1: [], 2: [] };
    (entry.tasks || []).forEach(function (t) { (byTask[t.task] || byTask[1]).push(t); });
    return {
      title: entry.title, blurb: entry.blurb, art: entry.art, levels: 2, hearts: false,
      levelTitles: ['Task 1: instructions and advice', 'Task 2: a longer text'],
      resultTitle: 'Writing done!',
      result: { en: 'You wrote, checked and marked your own writing.', vi: 'Em đã viết, tự kiểm tra và tự chấm bài viết của mình.' },
      mount: function (g) {
        const tasks = byTask[g.level] || [];
        const page = el('div', { class: 'wd-page' });
        g.body.appendChild(page);
        function pick() {
          T.ui.empty(page);
          g.say({ en: 'Choose a task to write.', vi: 'Chọn một đề để viết.' }, 'happy');
          const list = el('div', { class: 'wd-pick' });
          tasks.forEach(function (t) {
            const done = (T.store.get(['write', String(t.id)], {}) || {}).text;
            const b = el('button', { type: 'button', class: 'wd-card pressable' },
              el('b', { class: 'wd-card__t' }, t.title), el('span', { class: 'wd-card__p' }, t.prompt),
              done ? el('span', { class: 'chip' }, 'Started') : null);
            b.addEventListener('click', function () { write(t); });
            list.appendChild(b);
          });
          page.appendChild(list);
          g.ctx.primary(null);
        }
        function write(t) {
          T.ui.empty(page);
          g.say({ en: 'Write ' + t.min + ' to ' + t.max + ' words. Cover all three points.', vi: 'Viết từ ' + t.min + ' đến ' + t.max + ' từ. Viết đủ cả ba ý.' }, 'think');
          const desk = writeDesk(page, t, {
            onChange: function (n) { g.ctx.primary({ label: 'Check my writing', disabled: n < Math.min(10, t.min), onClick: checkIt }); }
          });
          let checked = false;
          function checkIt() {
            if (checked) return;
            checked = true;
            g.say({ en: 'Mark the *model* first, then mark your own writing.', vi: 'Chấm *bài mẫu* trước, rồi chấm bài của em.' }, 'cheer');
            desk.check(function () {
              g.ctx.primary({ label: g.level < g.levels ? 'Next: Task 2' : 'Finish', iconEnd: 'next', onClick: finish });
            });
            g.ctx.primary({ label: g.level < g.levels ? 'Next: Task 2' : 'Finish', iconEnd: 'next', onClick: finish });
            function finish() {
              const n = desk.words();
              const zone = n >= t.min && n <= t.max ? 2 : Math.abs(n - (n < t.min ? t.min : t.max)) <= 5 ? 1 : 0;
              const tk = desk.ticks(), bl = (t.bullets || []).length || 3;
              const self = ((T.store.get(['write', String(t.id)], {}) || {}).self) ? 1 : 0;
              const cal = desk.calib();
              g.score(zone + (cal != null ? cal : (tk >= bl ? 2 : tk > 0 ? 1 : 0)) + self, 5);
              g.levelDone();
            }
          }
          g.ctx.primary({ label: 'Check my writing', disabled: desk.words() < Math.min(10, t.min), onClick: checkIt });
          g.ctx.secondary && g.ctx.secondary({ label: 'Other tasks', icon: 'back', onClick: pick });
        }
        pick();
      }
    };
  };
})(window.T = window.T || {});
