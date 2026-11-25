/* 79-summit-esl.js - the ESL Summit: the practice exam of T.SUMMIT_ESL (22-summit-esl.js) in place of a mix of
   Mini test items. Paper 1 is Listening (19 questions, 25 minutes), Paper 2 is Reading and Use of English (34
   questions, 35 minutes). Questions keep their real numbers and their Part headings. The Writing paper (2 tasks,
   35 minutes, self-checked) has its own card and route 'summit-writing'. Loaded after 79-summit-build.js. */
(function (T) {
  'use strict';
  const el = T.util.el;
  const S = function () { return T.SUMMIT_ESL; };
  const PAPER_KEYS = ['listening', 'reading'];
  function flat(k) {
    const out = [];
    ((S()[PAPER_KEYS[k]] || {}).parts || []).forEach(function (part) {
      part.items.forEach(function (it) { out.push({ part: part, item: it }); });
    });
    return out;
  }
  function q(k, i) {
    const x = flat(k)[i];
    if (!x) return null;
    const c = String((x.item.lo || [])[0] || '').charAt(1);
    return { s: k, i: i, v: 0, stop: STOP_OF[k][x.part.n] || null, dok: x.item.dok, lo: x.item.lo, marks: 1, strand: c || 'R', num: x.item.num || i + 1,
      partN: x.part.n, partTitle: x.part.title, partInstr: x.part.instr };
  }
  if (!T.summit || !T.SUMMIT_ESL) return;
  // which stop trains each Part (for "Practise again: Stop N" after the test)
  const STOP_OF = [{ 1: 4, 2: 4, 3: 5 }, { 1: 7, 2: 6, 3: 6, 4: 7, 5: 8, 6: 8 }];
  T.summit.paperMax = function (k) { return flat(k).length; };
  T.summit.total = function () { return flat(0).length + flat(1).length; };
  T.summit.plan = function () {
    return { seed: 1, papers: [0, 1].map(function (k) { return flat(k).map(function (x, i) { return q(k, i); }); }) };
  };
  T.summit.fromCodes = function (packs, codes) {
    if (!Array.isArray(codes) || codes.length !== 2) return null;
    const papers = codes.map(function (list) {
      return (list || []).map(function (c) { const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(c)); return m ? q(Number(m[1]), Number(m[2])) : null; });
    });
    return papers.every(function (p, k) { return p.length === flat(k).length && p.every(Boolean); }) ? { papers: papers } : null;
  };
  T.summit.item = function (x) { const f = flat(x.s)[x.i]; return f ? f.item : null; };
  T.summit.minutes = function (k) { return ((S()[PAPER_KEYS[k]] || {}).mins) || 35; };
  T.summit.PER = 40;
  T.summit.paperName = function (k) { return k === 0 ? 'Paper 1: Listening' : 'Paper 2: Reading and Use of English'; };
  // the Part heading above the first question of each Part
  T.summit.partHead = function (x, prev) {
    if (!x.q || x.q.partN == null || (prev && prev.q && prev.q.partN === x.q.partN)) return null;
    return el('div', { class: 'tp-part' }, el('h3', x.q.partTitle || ('Part ' + x.q.partN)), x.q.partInstr ? el('p', x.q.partInstr) : null);
  };

  /* ---------- the Writing paper: Task 1 and Task 2 on one page, a calm 35-minute clock ---------- */
  function mountWriting() {
    if (T.summit.isOpen && !T.summit.isOpen()) { T.router.go('summit'); return null; }
    const W = S().writing || {};
    const ctx = T.stage.open({ stop: 0, step: 'summit-writing', title: 'Paper 3: Writing' });
    if (!ctx) return null;
    const page = el('div', { class: 'wd-page sm-write' });
    ctx.body.appendChild(page);
    ctx.instruct({ en: 'Write both tasks. You have *35 minutes*. Then check and mark your writing.', vi: 'Viết cả hai bài. Em có *35 phút*. Sau đó tự kiểm tra và chấm bài.', mood: 'think' });
    const t0 = Date.now();
    const clock = el('p', { class: 'tp-instr' });
    const tick = function () { const left = Math.max(0, Math.ceil((W.mins || 35) - (Date.now() - t0) / 60000)); clock.textContent = left > 0 ? left + ' minutes left' : 'Time is up. Finish your sentence, then check your writing.'; };
    tick(); ctx.every(tick, 15000);
    page.appendChild(clock);
    const desks = (W.tasks || []).map(function (t) { return T.esl.writeDesk(page, t, {}); });
    let checked = false;
    ctx.primary({ label: 'Check my writing', iconEnd: 'next', onClick: function () {
      if (checked) { T.router.go('summit'); return; }
      checked = true;
      desks.forEach(function (d) { d.check(); });
      const total = desks.reduce(function (s, d) { return s + d.words(); }, 0);
      T.store.set(['summit', 'writing'], { done: true, words: total, at: Date.now() });
      ctx.instruct({ en: 'Mark each *model* first, then mark your own writing.', vi: 'Chấm từng *bài mẫu* trước, rồi chấm bài của em.', mood: 'cheer' });
      ctx.primary({ label: 'Back to the Summit', icon: 'back', onClick: function () { T.router.go('summit'); } });
    } });
    return function () {};
  }
  if (T.router) T.router.register('summit-writing', mountWriting);
})(window.T = window.T || {});
