/* 39-esl-tools.js - the ESL pictures and tools (Grade 5 ESL trail).

   T.tools.pic kinds (T.tools.picKinds):
     { k: 'stim', id, kind: 'text' | 'audio', head, html, lines }   a text, a conversation or a talk that questions use
         text:  a card with a small heading (what it is: "Text message", "Notice") and the words
         audio: the listening player (T.esl.player): Play, the plays used (2 on a test paper, as in the exam), and in
                practice "Show the words" after two plays (the transcript, every speaker named)
     { k: 'pico', pic: '🚲', tag: '£8' }    a picture answer of Listening Part 1: big emoji on a light plate, a tag
   T.esl.dedupe(root)   on a test paper, a text or a talk shared by several questions is shown once, at the first
   T.esl.scene(sc, s)   a See it scene from the pack (s.esl): the text or the talk, then Zip's teaching lines
   T.esl.emojiArt(e, label) -> an SVG string for T_ART (word cards, badges) */
(function (T) {
  'use strict';

  const el = T.util.el;
  const kinds = T.tools.picKinds = T.tools.picKinds || {};
  T.esl = T.esl || {};

  const html = function (node, s) { node.innerHTML = T.ui.richHTML ? T.ui.richHTML(s) : rich(s); return node; };
  function rich(s) {
    return String(s == null ? '' : s).replace(/\*([^*]+)\*/g, '<mark class="hl">$1</mark>');
  }

  /* ---------- the listening player ---------- */
  let playing = null;                         // only one recording plays at a time

  function player(stim) {
    const box = el('div', { class: 'au', dataset: { id: stim.id } });
    const audio = new Audio();
    audio.preload = 'none';
    audio.src = 'audio/' + stim.id + '.mp3';
    let plays = 0, busy = false;
    const label = el('span', { class: 'au__label' }, 'Listen');
    const btn = el('button', { type: 'button', class: 'au__btn pressable' }, T.ui.icon('play'), label);
    const bar = el('span', { class: 'au__bar' }, el('span', { class: 'au__fill' }));
    const dots = el('span', { class: 'au__dots', 'aria-hidden': 'true' }, el('i'), el('i'));
    const eq = el('span', { class: 'au__eq', 'aria-hidden': 'true' }, el('i'), el('i'), el('i'), el('i'));      // ink sound bars (99-cartoon.css)
    const tick = el('span', { class: 'au__clock', 'aria-hidden': 'true' });
    const count = el('span', { class: 'au__count' });
    const words = el('button', { type: 'button', class: 'au__words', hidden: true }, 'Show the words');
    const script = el('div', { class: 'au__script', hidden: true },
      (stim.lines || []).map(function (ln) {
        return el('p', { class: 'au__line' }, ln[1] ? el('b', ln[1] + ': ') : null, html(el('span'), String(ln[2] || '').replace(/([A-Z])-(?=[A-Z])/g, '$1-')));
      }));
    // practice only: a slower speed for a first listen (the exam speed is always used on a test paper)
    const slow = el('button', { type: 'button', class: 'chip au__slow', 'aria-pressed': 'false' }, 'Slower');
    slow.addEventListener('click', function () {
      const on = slow.getAttribute('aria-pressed') !== 'true';
      slow.setAttribute('aria-pressed', String(on));
      slow.classList.toggle('is-on', on);
      audio.playbackRate = on ? 0.85 : 1;
      try { audio.preservesPitch = true; } catch (e) { /* older browsers */ }
    });
    box.appendChild(el('div', { class: 'au__row' }, btn, eq, tick, bar, dots));
    box.appendChild(el('div', { class: 'au__under' }, count, slow));
    box.appendChild(words);
    box.appendChild(script);

    const onPaper = function () { return !!box.closest('.tp') && !box.closest('.tp.is-marked'); };
    const limit = function () { return onPaper() ? 2 : 99; };
    function paint() {
      const lim = limit();
      T.util.$$('i', dots).forEach(function (d, i) { d.classList.toggle('is-used', i < plays); });
      dots.hidden = lim > 2;
      slow.hidden = lim === 2;
      box.classList.toggle('is-playing', busy);
      box.classList.toggle('is-reading', !!exam && (exam.phase === 'read' || exam.phase === 'gap'));
      if (exam && exam.phase === 'done' && !onPaper()) exam = null;      // the paper is marked: free listening again
      if (exam) { paintExam(); words.hidden = true; return; }
      label.textContent = busy ? 'Pause' : plays === 0 ? 'Listen' : plays >= lim ? 'No more plays' : 'Listen again';
      btn.disabled = !busy && plays >= lim;
      count.textContent = lim === 2 ? 'Exam mode: tap Listen. You will hear it two times, like the real exam.' : plays ? 'Played ' + plays + (plays === 1 ? ' time' : ' times') + '.' : 'Listen two times, like the exam.';
      words.hidden = onPaper() || plays < 2 || !script.hidden;
    }

    /* exam mode (a test paper): reading time, then the recording plays twice by itself with a short gap,
       no pausing, like the real Listening paper */
    let exam = null;              // null, or {phase: 'read' | 'play' | 'gap' | 'done', left}
    const READ = (stim.lines || []).reduce(function (n, l) { return n + String(l[2] || '').split(/\s+/).length; }, 0) > 90 ? 20 : 10;   // a long talk: more reading time
    function paintExam() {
      btn.disabled = exam.phase !== 'read';
      label.textContent = exam.phase === 'read' ? 'Start now' : exam.phase === 'done' ? 'Finished' : 'Listening...';
      count.textContent = exam.phase === 'read' ? 'Read the question(s) now. The recording starts in ' + exam.left + ' seconds.'
        : exam.phase === 'gap' ? 'You will hear it again in ' + exam.left + ' seconds.'
        : exam.phase === 'play' ? (plays === 1 ? 'First listening.' : 'Second listening.')
        : 'You have heard it two times. Check your answers.';
      box.classList.toggle('is-exam', true);
    }
    function countdown(secs, then) {
      exam.left = secs; paint();
      const tick = setInterval(function () {
        if (!document.body.contains(box)) { clearInterval(tick); return; }
        if (exam.skip) { exam.skip = false; clearInterval(tick); then(); return; }
        exam.left -= 1;
        if (exam.left <= 0) { clearInterval(tick); then(); } else paint();
      }, 1000);
    }
    function examPlay() {
      if (!document.body.contains(box)) return;
      if (playing && playing !== audio) playing.pause();
      playing = audio;
      exam.phase = 'play'; plays += 1; busy = true;
      audio.currentTime = 0;
      const p = audio.play();
      if (p && p.catch) p.catch(function () { busy = false; exam = null; plays = Math.max(0, plays - 1); paint(); count.textContent = 'The sound could not play. Check the volume and try again.'; });
      paint();
    }
    audio.addEventListener('ended', function () {
      if (!exam) return;
      if (plays < 2) { exam.phase = 'gap'; countdown(5, examPlay); } else { exam.phase = 'done'; paint(); }
    });
    audio.addEventListener('pause', function () {
      if (exam && exam.phase === 'play' && !audio.ended && document.body.contains(box)) {
        // another recording was started: this one cannot be paused on a paper, so it is counted as heard
        exam.phase = plays < 2 ? 'gap' : 'done';
        if (plays < 2) countdown(5, examPlay); else paint();
      }
    });
    btn.addEventListener('click', function () {
      if (exam) { if (exam.phase === 'read') exam.skip = true; return; }
      if (onPaper() && plays === 0 && !busy) { exam = { phase: 'read', left: READ }; countdown(READ, examPlay); return; }
      if (busy) { audio.pause(); busy = false; paint(); return; }
      if (plays >= limit()) return;
      if (playing && playing !== audio) playing.pause();
      playing = audio;
      if (audio.ended || audio.currentTime === 0) { audio.currentTime = 0; plays += 1; }
      busy = true;
      const p = audio.play();
      if (p && p.catch) p.catch(function () { busy = false; count.textContent = 'The sound could not play. Check the volume and try again.'; plays = Math.max(0, plays - 1); paint(); });
      paint();
    });
    audio.addEventListener('pause', function () { busy = false; paint(); });
    audio.addEventListener('ended', function () { busy = false; paint(); });
    audio.addEventListener('timeupdate', function () {
      const f = audio.duration ? audio.currentTime / audio.duration : 0;
      bar.firstChild.style.transform = 'scaleX(' + f + ')';
    });
    words.addEventListener('click', function () { script.hidden = false; paint(); });
    paint();
    setTimeout(paint, 0);            // again once the player is on the page (a test paper or practice)
    // when a paper is marked, the words may be shown in the review
    box._paint = paint;
    return box;
  }
  T.esl.player = player;
  T.esl.stopAudio = function () { if (playing) playing.pause(); };

  /* ---------- a text, a conversation or a talk ---------- */
  kinds.stim = function (s) {
    const fig = el('figure', { class: ['stim', 'stim--' + (s.kind || 'text')], dataset: { id: s.id || '' } });
    if (s.head) fig.appendChild(html(el('figcaption', { class: 'stim__head' }), s.head));
    if (s.kind === 'audio') fig.appendChild(player(s));
    else fig.appendChild(html(el('div', { class: 'stim__body' }), s.html || ''));
    return fig;
  };

  /* ---------- a picture answer ---------- */
  // a clock face with the hands at a time like "5:15" (Listening Part 1 time pictures)
  function clock(h, m) {
    const a = function (deg, len) { const r = (deg - 90) * Math.PI / 180; return [50 + len * Math.cos(r), 50 + len * Math.sin(r)]; };
    const hh = a(((h % 12) + m / 60) * 30, 22), mm = a(m * 6, 33);
    let ticks = '';
    for (let i = 0; i < 12; i++) { const p1 = a(i * 30, 40), p2 = a(i * 30, i % 3 ? 37 : 33); ticks += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="#10305E" stroke-width="' + (i % 3 ? 2 : 3.2) + '" stroke-linecap="round"/>'; }
    const s = el('span', { class: 'pico__clock' });
    s.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#FFF1CF" stroke="#F5A623" stroke-width="5"/><circle cx="50" cy="50" r="41" fill="#fff"/>' + ticks +
      '<line x1="50" y1="50" x2="' + hh[0].toFixed(1) + '" y2="' + hh[1].toFixed(1) + '" stroke="#10305E" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="50" y1="50" x2="' + mm[0].toFixed(1) + '" y2="' + mm[1].toFixed(1) + '" stroke="#2F7FD4" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="50" cy="50" r="4.5" fill="#D22630"/></svg>';
    return s;
  }
  kinds.pico = function (s) {
    const tm = /^\s*(\d{1,2})[:.](\d\d)\s*(?:a\.?m\.?|p\.?m\.?)?\s*$/i.exec(s.tag || '');
    return el('span', { class: ['pico', tm && 'pico--time'], 'aria-hidden': 'true' },
      tm ? clock(Number(tm[1]), Number(tm[2])) : el('span', { class: 'pico__e' }, s.pic || ''),
      s.tag ? el('b', { class: 'pico__tag' }, s.tag) : null);
  };

  /* ---------- a shared text on a paper: once ---------- */
  T.esl.dedupe = function (root) {
    let last = null;
    T.util.$$('figure.stim', root).forEach(function (f) {
      const id = f.dataset.id;
      if (id && id === last) { const box = f.closest('.tp-stim') || f; box.remove(); }
      else last = id;
    });
  };

  /* ---------- a See it scene ---------- */
  T.esl.scene = function (sc, s) {
    const wrap = el('div', { class: 'esl-see' });
    const stim = kinds.stim({ id: s.audio ? s.audio.id : s.id, kind: s.kind === 'audio' ? 'audio' : 'text', head: s.head,
      html: s.html, lines: s.audio ? s.audio.lines : null });
    wrap.appendChild(stim);
    if (s.kind === 'audio' && s.html) {
      const t = html(el('div', { class: 'stim__body esl-see__script', hidden: true }), s.html);
      const show = el('button', { type: 'button', class: 'au__words' }, 'Show the words');
      show.addEventListener('click', function () { t.hidden = false; show.hidden = true; });
      wrap.appendChild(show); wrap.appendChild(t);
    }
    const lines = el('ol', { class: 'esl-see__steps' });
    wrap.appendChild(lines);
    sc.el.appendChild(wrap);
    const steps = s.steps || [];
    let at = 0;
    function next() {
      if (at >= steps.length) return;
      const st = steps[at];
      sc.instruct({ en: st.en, vi: st.vi || null, mood: at === steps.length - 1 ? 'cheer' : 'happy' });
      lines.appendChild(html(el('li', { class: 'esl-see__step' }), st.en));
      at += 1;
      if (at < steps.length) sc.later(next, 2600);
      else sc.ready();
    }
    sc.later(next, 400);
    return function () { T.esl.stopAudio(); };
  };

  /* ---------- emoji pictures for T_ART ---------- */
  const esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  T.esl.emojiArt = function (e, label, opts) {
    const o = opts || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" class="art art--emoji" role="img" aria-label="' + esc(label || '') + '">' +
      (o.ring ? '<circle cx="48" cy="48" r="44" fill="' + o.ring + '"/><circle cx="48" cy="48" r="36" fill="#FFFFFF"/>' : '') +
      '<text x="48" y="52" font-size="' + (o.size || 54) + '" text-anchor="middle" dominant-baseline="middle" ' +
      'font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">' + esc(e) + '</text></svg>';
  };
})(window.T = window.T || {});
