/* 26-progress-code.js - move a child's stars to another device with a short code (the preview build: no server).
   Ported from the Grade 5 Science trail, for the Maths steps. No account, no names: the code holds only stars.
   A child taps their name on the map, then "My progress code", and writes the code down. On the other device
   they sign in with the same class and name, tap their name, then "Enter a progress code".

   What the code carries, for each of the 9 stops:
     Words, See it, Practise, Notes (T.STEPS without the test): the stars of a FINISHED step (0 = not finished)
     Mini Practice test: the best mark (exact: questions fully right, out of the questions on the paper)
   A step that is only half done is not carried. Entering a code never takes stars away: for each unit the
   better result is kept (T.progress.saveUnit keeps the best), and the test's best (stops.N.test.best) only rises.
   After a code is applied on a new device, every finished step shows exactly the stars it had, and the Mini
   Practice test exactly its best mark.

   Format: Crockford base 32 (no I, L, O, U; O is read as 0, I and L as 1; case, spaces and dashes ignored),
   2 check characters then the data, trailing zeros dropped, shown in groups of 4: "K7Q2-M9..."
   Bits: version (3), then per stop: 4 steps x 2 bits (stars 0-3) + the test 5 bits (0 = none, else mark + 1).

   T.progressCode.make()          -> the code of the child who is playing
   T.progressCode.read(text)      -> {ok, data} or {ok:false, why:{en,vi}}
   T.progressCode.apply(text)     -> {ok, steps, before, after} or {ok:false, why:{en,vi}}
   T.progressCode.showMine()      the dialog with the child's code
   T.progressCode.askForCode()    the dialog to type a code in
   T.progressCode.showCheck()     teachers and TAs: a student's code as a table of stars (changes nothing)
   T.progressCode.unitMaxes(n, step)   what each unit of a step is saved out of (the steps' own maxima) */
(function (T) {
  'use strict';

  const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const VERSION = 1;
  const STOPS = 9;
  const TEST = 'test';
  const PARTS = T.STEPS.map(function (s) { return s.id; }).filter(function (id) { return id !== TEST; });
  const BITS_PER_STOP = PARTS.length * 2 + 5;
  const el = function () { return T.util.el.apply(null, arguments); };

  /* ---------- bits <-> text ---------- */

  function check(values) {
    let h = values.length % 1009;
    values.forEach(function (v) { h = (h * 37 + v + 1) % 1009; });
    return [h >> 5, h & 31];
  }

  function toText(bits) {
    while (bits.length % 5) bits.push(0);
    const values = [];
    for (let i = 0; i < bits.length; i += 5) values.push(bits.slice(i, i + 5).reduce(function (a, b) { return a * 2 + b; }, 0));
    while (values.length > 1 && values[values.length - 1] === 0) values.pop();
    const all = check(values).concat(values).map(function (v) { return ALPHA[v]; }).join('');
    return all.match(/.{1,4}/g).join('-');
  }

  function clean(text) {
    return String(text || '').toUpperCase().replace(/[\s\-_.·]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  }

  function fromText(text) {
    const s = clean(text);
    if (s.length < 3) return null;
    const values = [];
    for (let i = 0; i < s.length; i++) {
      const v = ALPHA.indexOf(s[i]);
      if (v < 0) return null;
      values.push(v);
    }
    const data = values.slice(2), sum = check(data);
    if (sum[0] !== values[0] || sum[1] !== values[1]) return null;
    const bits = [];
    data.forEach(function (v) { for (let b = 4; b >= 0; b--) bits.push((v >> b) & 1); });
    return bits;
  }

  function push(bits, value, width) { for (let b = width - 1; b >= 0; b--) bits.push((value >> b) & 1); }
  function take(bits, at, width) { let v = 0; for (let i = 0; i < width; i++) v = v * 2 + (bits[at + i] || 0); return v; }

  /* ---------- the child's progress <-> data ---------- */

  function hasPack(n) { return !!(T.packs && T.packs[n]); }
  function testMax(n) { return T.steps && T.steps.test && T.steps.test.maxMarks ? T.steps.test.maxMarks(T.packs[n]) : 0; }

  function snapshot() {
    const stops = [];
    for (let n = 1; n <= STOPS; n++) {
      const row = { parts: {}, test: null };
      PARTS.forEach(function (step) { row.parts[step] = hasPack(n) ? T.progress.stepStars(n, step) : 0; });
      const best = hasPack(n) ? T.progress.unit(n, TEST, 'paper') : null;
      row.test = best ? Math.max(0, Math.min(30, Math.floor(best.score))) : null;
      stops.push(row);
    }
    return stops;
  }

  function encode(stops) {
    const bits = [];
    push(bits, VERSION, 3);
    stops.forEach(function (row) {
      PARTS.forEach(function (step) { push(bits, Math.max(0, Math.min(3, row.parts[step] || 0)), 2); });
      push(bits, row.test == null ? 0 : row.test + 1, 5);
    });
    return toText(bits);
  }

  function decode(bits) {
    if (take(bits, 0, 3) !== VERSION) return null;
    if (bits.length > 3 + STOPS * BITS_PER_STOP + 5) return null;        // longer than any code this trail makes
    const stops = [];
    for (let n = 0; n < STOPS; n++) {
      const at = 3 + n * BITS_PER_STOP, row = { parts: {}, test: null };
      PARTS.forEach(function (step, i) { row.parts[step] = take(bits, at + i * 2, 2); });
      const t = take(bits, at + PARTS.length * 2, 5);
      row.test = t ? t - 1 : null;
      stops.push(row);
    }
    return stops;
  }

  function make() { return encode(snapshot()); }

  const BAD = {
    en: 'That code does not work. Check each letter and number, then try again.',
    vi: 'Mã này không đúng. Em hãy kiểm tra từng chữ và số rồi thử lại.'
  };
  const EMPTY = { en: 'Type your progress code first.', vi: 'Em hãy nhập mã tiến độ trước.' };

  function read(text) {
    if (!clean(text)) return { ok: false, why: EMPTY };
    const bits = fromText(text);
    const data = bits && decode(bits);
    return data ? { ok: true, data: data } : { ok: false, why: BAD };
  }

  /* ---------- writing results that give exactly the stars in the code ---------- */

  // what each unit of a step is saved out of, as the steps save it (every saveUnit caller):
  //   words     a set: one question per word card of the set (40-words.js, keysOf)
  //   see       'challenge': 2 points a question of the challenge (45-see.js)
  //   practise  a game: 2 points a question of every level (52-kit-model.js; a kit with hearts adds 3 a level)
  //   notes     'check': one point a sentence of the notes check, or 1 when there is no check (60-notes.js)
  //   test      'paper': the questions fully right, out of the questions on the paper (70-test.js)
  function unitMaxes(n, step) {
    const pack = T.packs[n] || {};
    return T.progress.units(n, step).map(function (id) {
      let max = 10;
      if (step === 'words') {
        const words = pack.words || {};
        const set = (words.sets || []).filter(function (s) { return String(s.id) === id; })[0];
        const keys = set && Array.isArray(set.keys) ? set.keys.filter(function (k) { return words.items && words.items[k]; }) : [];
        if (keys.length) max = keys.length;
      } else if (step === 'see') {
        const scenes = (pack.see && pack.see.scenes) || [];
        const ch = scenes.length ? scenes[scenes.length - 1].challenge : null;
        if (ch && Array.isArray(ch.rounds) && ch.rounds.length) max = 2 * ch.rounds.length;
      } else if (step === 'practise') {
        const entry = (pack.practise || []).filter(function (e) { return e && String(e.id) === id; })[0];
        const levels = (entry && entry.levels) || [];
        const rounds = levels.reduce(function (a, l) { return a + ((l && l.rounds) || []).length; }, 0);
        if (rounds) max = 2 * rounds + (entry.kit && entry.kit !== 'model' ? 3 * levels.length : 0);
      } else if (step === 'notes') {
        const c = pack.notes && pack.notes.check;
        max = Array.isArray(c) && c.length ? c.length : 1;
      } else if (step === TEST) {
        max = testMax(n) || 10;
      }
      return { id: id, max: max };
    });
  }

  // the smallest total that still gives these stars (3 stars: full marks); -1 when no whole number fits
  function targetFor(stars, total) {
    if (stars >= 3) return total;
    if (stars === 2) { const s = Math.ceil(total * 0.75); return s * 10 < total * 9 ? s : -1; }
    const s = Math.ceil(total * 0.6); return s * 4 < total * 3 ? s : Math.floor((total * 3 - 1) / 4);
  }

  function resultsFor(n, step, stars) {
    let units = unitMaxes(n, step);
    if (!units.length) return [];
    let total = units.reduce(function (a, u) { return a + u.max; }, 0);
    let want = targetFor(stars, total);
    if (want < 0) {                                   // too few marks to land between 75% and 90%: count in tenths
      units = units.map(function (u) { return { id: u.id, max: u.max * 10 }; });
      total *= 10;
      want = targetFor(stars, total);
    }
    const scores = units.map(function (u) { return u.max; });
    let less = total - Math.max(0, want), i = scores.length - 1, guard = 0;
    while (less > 0 && guard < 10000) {               // take the marks away evenly, one at a time
      if (scores[i] > 0) { scores[i] -= 1; less -= 1; }
      i = i === 0 ? scores.length - 1 : i - 1;
      guard += 1;
    }
    return units.map(function (u, k) { return { id: u.id, score: scores[k], max: u.max }; });
  }

  function apply(text) {
    const got = read(text);
    if (!got.ok) return got;
    const before = T.progress.totalStars();
    let steps = 0;
    got.data.forEach(function (row, k) {
      const n = k + 1;
      if (!hasPack(n)) return;
      PARTS.forEach(function (step) {
        const stars = row.parts[step];
        if (!stars) return;
        resultsFor(n, step, stars).forEach(function (r) { T.progress.saveUnit(n, step, r.id, r.score, r.max); });
        // a result saved here before out of another total could pull the step below the code: then full marks
        if (T.progress.stepStars(n, step) < stars) unitMaxes(n, step).forEach(function (u) { T.progress.saveUnit(n, step, u.id, u.max, u.max); });
        steps += 1;
      });
      const max = testMax(n);
      if (row.test != null && max > 0) {
        const mark = Math.min(row.test, max);
        T.progress.saveUnit(n, TEST, 'paper', mark, max);
        // the best mark the hub, the test and the trophy shelf show (and the school's "mini"): it only rises
        const path = ['stops', String(n), TEST, 'best'], old = T.store.get(path, null);
        if (old == null || mark > old) T.store.set(path, mark);
        steps += 1;
      }
    });
    return { ok: true, steps: steps, before: before, after: T.progress.totalStars() };
  }

  /* ---------- the two dialogs ---------- */

  function line(en, vi) {
    return el('div', { class: 'pc-line' }, el('p', { class: 'pc-line__en' }, T.ui.richText(en)), el('p', { class: 'pc-line__vi', lang: 'vi' }, T.ui.richText(vi)));
  }

  function showMine() {
    T.ui.closeOverlays();
    const code = make();
    const stars = T.progress.totalStars();
    const copyNote = el('p', { class: 'pc-copied', role: 'status' });
    const copy = T.ui.button({
      label: 'Copy', icon: 'check', kind: 'secondary', cls: 'pc-copy',
      onClick: function () {
        const done = function () { copyNote.textContent = 'Copied. · Đã sao chép.'; };
        try { navigator.clipboard.writeText(code).then(done, function () {}); } catch (e) { /* write it down instead */ }
      }
    });
    T.ui.dialog({
      title: 'My progress code',
      sheet: true,
      cls: 'pc-dialog',
      body: [
        line('This code keeps your *' + stars + ' stars*. Write it down carefully.', 'Mã này giữ *' + stars + ' sao* của em. Hãy chép lại thật cẩn thận.'),
        el('div', { class: 'pc-code', 'aria-label': 'Your code: ' + code.split('').join(' ') }, code.split('-').map(function (g) { return el('span', { class: 'pc-code__group' }, g); })),
        el('div', { class: 'pc-copyrow' }, copy, copyNote),
        el('ol', { class: 'pc-steps' },
          el('li', line('On the other device, open the trail and sign in with *the same class and name*.', 'Trên thiết bị kia, em mở ứng dụng và đăng nhập *đúng lớp và tên* như ở đây.')),
          el('li', line('Tap your *name* at the top, then *Enter a progress code*.', 'Chạm vào *tên* của em ở trên cùng, rồi chọn *Enter a progress code*.')),
          el('li', line('Type the code and tap *Bring my stars*.', 'Nhập mã và chạm *Bring my stars*.'))),
        line('Finished steps and your best Mini Practice test marks move over. A step you have only started does not.', 'Các bước đã hoàn thành và điểm bài kiểm tra nhỏ cao nhất sẽ được chuyển. Bước mới làm dở thì không được chuyển.'),
        line('Earned more stars? Make a new code before you change device.', 'Có thêm sao? Hãy lấy mã mới trước khi đổi thiết bị.')
      ],
      actions: [{ label: 'Done', kind: 'primary', icon: 'check' }]
    });
  }

  function codeInput(id) {
    return el('input', {
      id: id, class: 'name-field__input pc-input', type: 'text', maxlength: '60',
      autocomplete: 'off', autocapitalize: 'characters', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done',
      placeholder: 'XXXX-XXXX-XXXX'
    });
  }

  function showWhy(input, error, why) {
    T.fx.sfx('no');
    input.classList.add('is-wrong');
    error.appendChild(el('span', why.en));
    error.appendChild(el('span', { class: 'name-field__error-vi', lang: 'vi' }, why.vi));
  }

  function askForCode() {
    T.ui.closeOverlays();
    const inputId = T.util.uid('pcode');
    const input = codeInput(inputId);
    const error = el('p', { class: 'name-field__error', role: 'alert' });
    let handle = null;
    function go() {
      T.ui.empty(error);
      const res = apply(input.value);
      if (!res.ok) { showWhy(input, error, res.why); return; }
      if (handle) handle.close();
      T.fx.sfx('chime');
      T.ui.toast(res.after > res.before
        ? 'Your stars are back: *' + res.after + ' stars*. · Sao của em đã trở lại!'
        : 'Done. You already had these stars here. · Em đã có các sao này rồi.', { ms: 4200 });
    }
    input.addEventListener('input', function () { input.classList.remove('is-wrong'); T.ui.empty(error); });
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); go(); } });
    handle = T.ui.dialog({
      title: 'Enter a progress code',
      sheet: true,
      cls: 'pc-dialog',
      body: [
        line('Type the code from your other device. Dashes and small letters are fine.', 'Nhập mã từ thiết bị kia của em. Có hay không có dấu gạch, chữ hoa hay thường đều được.'),
        el('div', { class: 'name-field' }, el('label', { class: 'name-field__label', for: inputId }, 'Progress code ', el('span', { lang: 'vi' }, '(mã tiến độ)')), input, error),
        line('Your stars here are kept. The code only adds stars.', 'Sao em đang có ở đây vẫn được giữ. Mã chỉ thêm sao, không làm mất sao.')
      ],
      actions: [{ label: 'Bring my stars', kind: 'primary', icon: 'next', keepOpen: true, onClick: go }]
    });
    setTimeout(function () { try { input.focus(); } catch (e) { /* a nicety */ } }, 80);
  }

  /* ---------- for teachers and TAs: read a student's code without changing anything ---------- */

  // the test's stars from its mark, by the same rule as every step (T.progress: 75% and 90%)
  function testStars(score, max) {
    if (!max) return 0;
    if (score * 10 >= max * 9) return 3;
    if (score * 4 >= max * 3) return 2;
    return 1;
  }

  function starCell(k) {
    return el('td', { class: 'pcx-cell' }, k ? T.ui.stars(k, 3) : el('span', { class: 'pcx-none', 'aria-label': 'not finished' }, '–'));
  }

  function table(data) {
    let total = 0, badges = 0;
    const rows = data.map(function (row, k) {
      const n = k + 1, info = (T.stops || []).filter(function (s) { return s.n === n; })[0] || {};
      const max = testMax(n);
      const mark = row.test != null ? Math.min(row.test, max) : null;
      const ts = mark != null ? testStars(mark, max) : 0;
      const sum = PARTS.reduce(function (a, step) { return a + row.parts[step]; }, 0) + ts;
      const all = PARTS.every(function (step) { return row.parts[step] > 0; }) && mark != null;
      total += sum; if (all) badges += 1;
      return el('tr', { class: all ? 'is-badge' : null, dataset: { n: n } },
        el('th', { scope: 'row', class: 'pcx-stop' }, el('span', { class: 'pcx-stop__in' }, el('span', { class: 'pcx-n' }, String(n)), el('span', info.world || ('Stop ' + n)))),
        PARTS.map(function (step) { return starCell(row.parts[step]); }),
        el('td', { class: 'pcx-cell pcx-test' }, mark != null ? el('span', T.ui.stars(ts, 3), el('b', ' ' + mark + '/' + max)) : el('span', { class: 'pcx-none' }, '–')),
        el('td', { class: 'pcx-sum' }, sum + ' / 15'));
    });
    return el('div', { class: 'pcx' },
      el('p', { class: 'pcx-total' }, el('b', total + ' stars'), ' · ' + badges + (badges === 1 ? ' badge' : ' badges'),
        el('span', { lang: 'vi' }, ' · ' + total + ' sao, ' + badges + ' huy hiệu')),
      el('div', { class: 'pcx-wrap' }, el('table', { class: 'pcx-table' },
        el('thead', el('tr', el('th', { scope: 'col' }, 'Stop'),
          ['Words', 'See it', 'Practise', 'Notes', 'Mini test'].map(function (h) { return el('th', { scope: 'col' }, h); }),
          el('th', { scope: 'col' }, 'Total'))),
        el('tbody', rows))),
      line('A dash means the step is not finished yet (half-done steps are not in the code). This does not change any stars on this device.',
        'Dấu gạch nghĩa là bước đó chưa hoàn thành (bước làm dở không có trong mã). Việc xem mã không thay đổi sao trên thiết bị này.'));
  }

  function showCheck() {
    T.ui.closeOverlays();
    const inputId = T.util.uid('pcheck');
    const input = codeInput(inputId);
    const error = el('p', { class: 'name-field__error', role: 'alert' });
    const out = el('div', { class: 'pcx-out', 'aria-live': 'polite' });
    function go() {
      T.ui.empty(error); T.ui.empty(out);
      const res = read(input.value);
      if (!res.ok) { showWhy(input, error, res.why); return; }
      T.fx.sfx('pop');
      out.appendChild(table(res.data));
    }
    input.addEventListener('input', function () { input.classList.remove('is-wrong'); T.ui.empty(error); });
    input.addEventListener('keydown', function (event) { if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); go(); } });
    T.ui.dialog({
      title: 'Check a student\'s code',
      sheet: true,
      cls: 'pc-dialog pc-dialog--wide',
      body: [
        line('Ask the student for their *progress code* (they tap their name on the map, then My progress code).',
          'Nhờ học sinh cho xem *mã tiến độ* (em chạm vào tên trên bản đồ, rồi chọn My progress code).'),
        el('div', { class: 'name-field' }, el('label', { class: 'name-field__label', for: inputId }, 'Student\'s code ', el('span', { lang: 'vi' }, '(mã của học sinh)')), input, error),
        out
      ],
      actions: [{ label: 'Show stars', kind: 'primary', icon: 'star', keepOpen: true, onClick: go }]
    });
    setTimeout(function () { try { input.focus(); } catch (e) { /* a nicety */ } }, 80);
  }

  T.progressCode = {
    make: make, read: read, apply: apply, showMine: showMine, askForCode: askForCode, showCheck: showCheck,
    unitMaxes: unitMaxes, PARTS: PARTS, STOPS: STOPS
  };
})(window.T = window.T || {});

