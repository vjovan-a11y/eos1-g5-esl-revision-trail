/* 71-test-paper.js - one question of the Mini Practice test, written on the paper, and its marking.
   Used by 70-test.js (the flow). The look (pencil rings and ticks, the teacher's pen) comes from the
   Grade 4 Science paper (reference/g4-science/parts/70-test.js).

   T.testPaper.question(task, meta) -> Q      task = a v2 model task (MX.make);
     meta = { num: 1, lo: ['4Np.01'], dok: 2, twm: ['TWM.04'], onTap() }
     Under the question, a small label says what it tests (Jovan, Nov 2026), from T.OBJECTIVES, T.DOK and T.TWM:
       "4Np.02 Multiply and divide ... · DOK 2 Skill and concept · TWM.04 Convincing"   (T.testPaper.tag(meta))
     Q = { el, task, parts: [{ label, max }], blanks: [answer box elements], defs: [their numpad defs],
           answer(vals) -> r (the response for task.check; vals = this question's values from the shared numpad),
           complete(vals) -> true when every part has an answer, lock(), review(result) }
     How each kind of task is answered on paper:
       answer boxes ({0} in task.lines)   typed with the keyboard or the shared number pad (T.tools.numpad)
       task.opts                          tick boxes, one row per option ("Tick (✓) one box.")
       claim (says, who)                  (a) circle "correct" or "incorrect", (b) tick the best reason
       a tool (task.ui.k)                 the tool itself on the paper (chart, counters, cells, slider, others)
       pictures (task.fig, op.fig, op.b)  drawn with T.tools.pic and T.tools.blocks (the flat drawn blocks, under the words)

   T.testPaper.mark(task, r) -> { parts: [{ score, max, ok }], boxes, score, max, full }   (pure, used by the tests)
     one part: task.check(r) decides; a part worth 2 or more may score 1 when some of its boxes (out.parts) are right;
     a box left empty is wrong. A claim: (a) the verdict, (b) the reason, 1 mark each (task.check when both are given).
     boxes = right or wrong per answer box (for the colours), or null. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const sfx = function (name) { try { if (T.fx && T.fx.sfx) T.fx.sfx(name); } catch (e) { /* sound is a nicety */ } };

  // the model's text (a little HTML and [[word]] links) into a node
  function html(host, text) {
    const kit = T.gameKit && T.gameKit.modelText;
    if (kit && kit.html) return kit.html(host, text);
    host.innerHTML = String(text || '');
    return host;
  }

  // a model's key may hold HTML entities (&lt; for <): the answer line shows the sign itself
  function decode(text) { const t = document.createElement('textarea'); t.innerHTML = text; return t.value; }

  // the command word of an instruction in bold, as on a printed paper
  const VERBS = /^(Write|Calculate|Tick|Circle|Complete|Find|Draw|Shade|Show|Explain|Join|Choose|Use|Work out|Round|Order|Put|Colour|Measure|Fill in)\b/;
  function cmd(text) { return String(text || '').replace(VERBS, '<b>$1</b>'); }

  /* ---------- pencil strokes (the child) and pen marks (the teacher) ---------- */

  const PENCIL = {
    // a closed ring, drawn solid (Jovan, EOS 1 finishing touches: no open end, no tilt)
    ring: { box: '0 0 120 50', d: 'M60 4 C28 4 4 13 4 25 C4 37 28 46 60 46 C92 46 116 37 116 25 C116 13 92 4 60 4 Z' },
    tick: { box: '0 0 40 40', d: 'M5 21 C9 24 12 28 15 34 C21 22 28 12 37 3' }
  };
  function pencil(kind, fix) {
    const spec = PENCIL[kind];
    const svg = el('svg:svg', { class: ['tp-pencil', 'tp-pencil--' + kind, fix && 'is-fix'], viewBox: spec.box, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
      el('svg:path', { d: spec.d, pathLength: '1', 'vector-effect': 'non-scaling-stroke' }));
    return svg;
  }
  const PEN = {
    correct: 'M6 21 C10 25 13 29 16 35 C22 22 29 12 38 3',
    partial: 'M6 21 C10 25 13 29 16 35 C22 22 29 12 38 3 M18 12 L31 26',
    wrong: 'M8 7 L33 34 M33 7 L8 34'
  };
  const PEN_SAYS = { correct: 'Right', partial: 'Part right', wrong: 'Not right' };
  function pen(state) {
    return el('span', { class: 'tp-pen tp-pen--' + state, role: 'img', 'aria-label': PEN_SAYS[state] },
      el('svg:svg', { viewBox: '0 0 40 40', 'aria-hidden': 'true', focusable: 'false' }, el('svg:path', { d: PEN[state], pathLength: '1' })));
  }
  // the review's sign next to what the child chose: a green tick (right) or a red cross (wrong)
  function sign(ok) {
    return el('span', { class: 'tp-sign tp-sign--' + (ok ? 'right' : 'wrong'), 'aria-hidden': 'true' }, ok ? '✓' : '✗');
  }
  // the right answer the child did not choose: a dashed green ring
  function answerRing() {
    const svg = pencil('ring');
    svg.classList.add('tp-pencil--answer');
    return svg;
  }
  T.testPaperSign = sign;                             // the tools on the paper use the same sign (39-tools-order.js)

  function setMark(node, on, kind) {
    const host = kind === 'tick' ? node.querySelector('.tp-tick__box') : node;
    const old = host.querySelector(':scope > .tp-pencil:not(.is-fix)');
    node.classList.toggle('is-on', !!on);
    node.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on && !old) host.appendChild(pencil(kind));
    if (!on && old) host.removeChild(old);
  }

  /* ---------- marking ---------- */

  const filled = function (x) { return x != null && x !== '' && x !== '-'; };

  function partsOf(task) {
    if (task.type === 'claim' || task.ab) return [{ label: '(a)', max: 1 }, { label: '(b)', max: 1 }];
    return [{ label: '', max: task.marks || 1 }];
  }

  function answered(task, r) {
    if (task.type === 'claim') return [!!r.dec, r.pick >= 0];
    if (task.ab) return [r.pick >= 0, (r.v || []).length === (task.blanks || []).length && (r.v || []).every(filled)];
    let ok = true;
    if (task.blanks && task.blanks.length) ok = ok && (r.v || []).length === task.blanks.length && r.v.every(filled);
    if (task.opts) ok = ok && r.pick >= 0;
    // Stop 3 tools on the paper: every number in its place, at least one ring, an end chosen
    if (Array.isArray(r.order)) ok = ok && r.order.length > 0 && r.order.every(function (x) { return x != null; });
    if (Array.isArray(r.picks)) ok = ok && r.picks.length > 0;
    if ('choice' in r) ok = ok && r.choice != null;
    if (Array.isArray(r.pairs)) ok = ok && r.pairs.every(function (x) { return x >= 0; });     // Stop 9: every line drawn
    if (task.ready) { try { ok = ok && !!task.ready(r); } catch (e) { ok = false; } }
    else if (r.b && !(task.blanks && task.blanks.length)) ok = ok && r.b.some(function (x) { return x > 0; });
    return [ok];
  }

  function mark(task, r) {
    r = r || {};
    const max = task.marks || 1;
    let parts, boxes = null;
    if (task.type === 'claim') {
      let a, b;
      if (r.dec && r.pick >= 0) {
        const out = task.check(r) || {};
        a = !!out.ok || out.decOk === true;
        b = !!out.ok || out.reasonOk === true;
      } else {
        a = !!r.dec && ((r.dec === 'correct') === !!task.verdict);
        b = r.pick >= 0 && !!(task.opts[r.pick] && task.opts[r.pick].ok);
      }
      parts = [{ score: a ? 1 : 0, max: 1, ok: a }, { score: b ? 1 : 0, max: 1, ok: b }];
    } else if (task.ab) {
      // Stop 4, two parts marked apart: (a) the ticked box, (b) the answer boxes (all right)
      const v = r.v || [], n = (task.blanks || []).length;
      const a = r.pick >= 0 && !!(task.opts[r.pick] && task.opts[r.pick].ok);
      let out = {};
      if (v.some(filled)) { try { out = task.check(Object.assign({}, r, { pick: r.pick >= 0 ? r.pick : 0 })) || {}; } catch (e) { out = {}; } }
      boxes = Array.isArray(out.parts) && out.parts.length === n ? out.parts.map(Boolean) : v.map(function () { return false; });
      while (boxes.length < n) boxes.push(false);
      v.forEach(function (x, i) { if (!filled(x)) boxes[i] = false; });
      const b = n > 0 && boxes.every(Boolean);
      parts = [{ score: a ? 1 : 0, max: 1, ok: a }, { score: b ? 1 : 0, max: 1, ok: b }];
    } else {
      const n = (task.blanks || []).length;
      const v = r.v || [];
      const some = n ? v.some(filled) : true;
      let ok = false, score = 0;
      if (some && (r.pick == null || r.pick >= 0 || !task.opts)) {
        let out = {};
        try { out = task.check(r) || {}; } catch (e) { out = { ok: false }; }
        ok = !!out.ok;
        if (n) {
          boxes = Array.isArray(out.parts) && out.parts.length === n ? out.parts.map(Boolean) : v.map(function () { return ok; });
          v.forEach(function (x, i) { if (!filled(x)) { boxes[i] = false; ok = false; } });
        }
        if (ok) score = max;
        else if (max > 1 && boxes) score = Math.min(max - 1, boxes.filter(Boolean).length);
      } else if (n) {
        boxes = v.map(function () { return false; });
        while (boxes.length < n) boxes.push(false);
      }
      parts = [{ score: score, max: max, ok: ok }];
    }
    const total = parts.reduce(function (s, p) { return s + p.score; }, 0);
    return { parts: parts, boxes: boxes, score: total, max: parts.reduce(function (s, p) { return s + p.max; }, 0), full: total === max && parts.every(function (p) { return p.ok; }) };
  }

  /* ---------- the label: code and skill, DOK level, TWM characteristics ---------- */

  function tagParts(meta) {
    const lo = (meta.lo || []).map(function (c) { return { code: c, name: (T.OBJECTIVES && T.OBJECTIVES[c]) || '' }; });
    const d = T.DOK && T.DOK[meta.dok];
    const twm = (meta.twm || []).map(function (c) { return { code: c, name: (T.TWM && T.TWM[c] && T.TWM[c].name) || '' }; });
    return { lo: lo, dok: d ? { code: 'DOK ' + meta.dok, name: d.name } : null, twm: twm };
  }
  function tagNode(meta) {
    const t = tagParts(meta), groups = [];
    const pair = function (x, cls) { return el('span', { class: cls }, el('b', x.code), x.name ? ' ' + x.name : ''); };
    const join = function (list, cls, sep) {
      const g = el('span', { class: 'tp-tag__group' });
      list.forEach(function (x, i) { if (i) g.appendChild(document.createTextNode(sep)); g.appendChild(pair(x, cls)); });
      return g;
    };
    if (t.lo.length) groups.push(join(t.lo, 'tp-code', '; '));
    if (t.dok) groups.push(join([t.dok], 'tp-dok', ''));
    if (t.twm.length) groups.push(join(t.twm, 'tp-twm', ', '));
    if (!groups.length) return null;
    const p = el('p', { class: 'tp-tag' });
    groups.forEach(function (g, i) { if (i) p.appendChild(el('span', { class: 'tp-tag__dot', 'aria-hidden': 'true' }, '\u00a0· ')); p.appendChild(g); });
    return p;
  }
  function tag(meta) { const n = tagNode(meta); return n ? n.textContent.replace(/\u00a0/g, ' ') : ''; }

  /* ---------- one question on the paper ---------- */

  function question(task, meta) {
    const MX = window.MX, ui = task.ui || {}, isClaim = task.type === 'claim';
    const num = meta.num;
    const onTap = function () { if (typeof meta.onTap === 'function') meta.onTap(); };
    let locked = false, dec = '', pick = -1, tool = null, chart = null, slider = null;
    const rows = [], rings = [], marksCols = [];

    const sec = el('section', { class: 'tp-q', dataset: { q: String(num - 1) }, 'aria-label': 'Question ' + num });

    function marksCol(max) {
      const col = el('div', { class: 'tp-mk' },
        el('span', { class: 'tp-mk__n', 'aria-label': max + (max === 1 ? ' mark' : ' marks') }, '[' + max + ']'));
      marksCols.push(col);
      return col;
    }
    function row(label, cell, max, cls) {
      return el('div', { class: ['tp-row', cls] }, el('span', { class: 'tp-lab' }, label), cell, max != null ? marksCol(max) : el('span', { class: 'tp-mk' }));
    }
    const p = function (cls, text) { return html(el('p', { class: cls }), text); };

    // tick boxes: one row per option, the box at the right
    function tickRows(opts, because) {
      const list = el('div', { class: 'tp-ticks', role: 'group', 'aria-label': 'Tick one box' });
      opts.forEach(function (op, i) {
        const txt = el('span', { class: 'tp-tick__txt' });
        if (task.letters && MX) txt.appendChild(el('b', { class: 'tp-tick__let' }, MX.LET[i]));
        const words = html(el('span'), (because ? 'because ' : '') + (op.html || ''));
        if (op.html || because) txt.appendChild(words);
        if (op.fig) { const f = T.tools.pic(op.fig); if (f) txt.appendChild(f); }
        // the flat drawn blocks show under the words (from a tablet up: 71-test-paper.css)
        if (op.b && T.tools.blocks) txt.appendChild(el('span', { class: 'tp-tick__pic' }, T.tools.blocks(null, { b: op.b, counts: false, u: 5, hmax: 96 }).el));
        const node = el('button', { type: 'button', class: 'tp-tick', 'aria-pressed': 'false', dataset: { i: String(i) },
          'aria-label': op.alt || (op.b && MX ? 'Blocks: ' + MX.say(op.b) : null) },
          txt, el('span', { class: 'tp-tick__box', 'aria-hidden': 'true' }));
        node.addEventListener('click', function () {
          if (locked) return;
          onTap();
          pick = pick === i ? -1 : i;
          rows.forEach(function (n, j) { setMark(n, j === pick, 'tick'); });
          sfx('pick');
        });
        rows.push(node);
        list.appendChild(node);
      });
      return list;
    }

    // the answer lines with their boxes
    function lineNodes() {
      const box = el('div', { class: 'tp-lines' });
      (task.lines || []).forEach(function (line) {
        box.appendChild(html(el('p', { class: 'tp-line' }), line.replace(/\{(\d)\}/g, function (m, i) {
          return '<button type="button" class="blank blank--' + ((task.blanks[+i] || {}).w || 'big') + '" data-i="' + i + '"></button>';
        })));
      });
      return box;
    }

    if (isClaim) {
      // the stem, then (a) circle correct or incorrect, then (b) tick the best reason
      const stem = el('div', { class: 'tp-cell' }, p('tp-text', task.q), p('tp-says', '“' + task.says + '”'), p('tp-text', task.ask));
      if (task.fig) { const f = T.tools.pic(task.fig); if (f) stem.appendChild(f); }
      sec.appendChild(row(num + '.', stem, null, 'tp-row--stem'));
      const ring = function (d) {
        const b = el('button', { type: 'button', class: 'tp-ring', 'aria-pressed': 'false', dataset: { d: d } }, d);
        b.addEventListener('click', function () {
          if (locked) return;
          onTap();
          dec = dec === d ? '' : d;
          rings.forEach(function (n) { setMark(n, n.dataset.d === dec, 'ring'); });
          sfx('pick');
        });
        rings.push(b);
        return b;
      };
      const a = el('div', { class: 'tp-cell' }, p('tp-ask', '<b>Circle</b> one word.'),
        el('p', { class: 'tp-circle' }, el('span', task.who + ' is'), ring('correct'), ring('incorrect')));
      sec.appendChild(row('(a)', a, 1, 'tp-row--part'));
      const b = el('div', { class: 'tp-cell' }, p('tp-ask', '<b>Tick (✓)</b> the best reason.'), tickRows(task.opts, true));
      sec.appendChild(row('(b)', b, 1, 'tp-row--part'));
    } else if (task.ab) {
      // Stop 4: the stem (a worked calculation to look at), then (a) tick one box, then (b) write the answer
      const stem = el('div', { class: 'tp-cell' }, p('tp-text', cmd(task.q)));
      if (task.fig) { const f = T.tools.pic(task.fig); if (f) stem.appendChild(f); }
      sec.appendChild(row(num + '.', stem, null, 'tp-row--stem'));
      sec.appendChild(row('(a)', el('div', { class: 'tp-cell' }, p('tp-ask', cmd(task.sub)), tickRows(task.opts, false)), 1, 'tp-row--part'));
      sec.appendChild(row('(b)', el('div', { class: 'tp-cell' }, p('tp-ask', cmd(task.abAsk || '')), lineNodes()), 1, 'tp-row--part'));
    } else {
      const cell = el('div', { class: 'tp-cell' });
      const stimFig = task.fig && task.fig.k === 'stim';
      if (stimFig) { const f = T.tools.pic(task.fig); if (f) sec.appendChild(el('div', { class: 'tp-stim' }, f)); }
      cell.appendChild(p('tp-text', cmd(task.q)));
      if (task.name != null && MX) cell.appendChild(el('p', { class: 'tp-name' }, MX.words(task.name)));
      if (task.sum) cell.appendChild(p('tp-text', task.sum));
      if (task.fig && !stimFig) { const f = T.tools.pic(task.fig); if (f) cell.appendChild(f); }
      if (task.sub) cell.appendChild(p('tp-ask', cmd(task.sub)));
      if (ui.k === 'chart' || ui.k === 'counters' || ui.k === 'cells') chart = T.tools.chart(cell, ui);
      else if (ui.k === 'slider') slider = T.tools.slider(cell, ui);
      else if (ui.k && T.tools[ui.k]) tool = T.tools[ui.k](cell, Object.assign({ task: task }, ui));
      if (task.lines) cell.appendChild(lineNodes());
      if (task.opts) cell.appendChild(tickRows(task.opts, false));
      sec.appendChild(row(num + '.', cell, task.marks || 1));
    }

    const label = tagNode(meta);
    if (label) sec.appendChild(label);

    const blanks = T.util.$$('.blank', sec).sort(function (x, y) { return x.dataset.i - y.dataset.i; });

    function answer(vals) {
      const r = {};
      if (chart && ui.k === 'counters') r.b = chart.get().b;
      if (tool && tool.get) Object.assign(r, tool.get());
      if (slider && slider.get) Object.assign(r, slider.get());
      if (blanks.length) r.v = (vals || []).slice(0, blanks.length);
      if (task.opts) r.pick = pick;
      if (isClaim) r.dec = dec;
      return r;
    }

    function lock() {
      locked = true;
      if (chart && chart.lock) chart.lock();
      if (slider && slider.lock) slider.lock();
      if (tool && tool.lock) tool.lock();
      rows.concat(rings).forEach(function (n) { n.disabled = true; });
    }

    // the teacher's marks: a pen mark and the score per part, the right answer in green, then how to do it
    function review(res) {
      res.parts.forEach(function (pt, i) {
        const col = marksCols[i];
        if (!col) return;
        const state = pt.ok ? 'correct' : pt.score > 0 ? 'partial' : 'wrong';
        col.classList.add('is-marked');
        col.insertBefore(el('span', { class: 'tp-mk__got tp-got--' + state }, pen(state), el('b', pt.score + '/' + pt.max)), col.firstChild);
        col.querySelector('.tp-mk__n').hidden = true;
      });
      // what was ringed or ticked: chosen and right = green with a tick, chosen and wrong = red with a cross,
      // the right one not chosen = a dashed green ring (a dashed green box for a tick)
      if (task.opts) {
        const right = task.opts.findIndex(function (o) { return o.ok; });
        const pickOk = pick >= 0 && !!(task.opts[pick] && task.opts[pick].ok);
        if (pick >= 0 && rows[pick]) {
          rows[pick].classList.add(pickOk ? 'is-good' : 'is-bad');
          rows[pick].querySelector('.tp-tick__box').appendChild(sign(pickOk));
        }
        if (!pickOk && rows[right]) rows[right].classList.add('is-fix', 'is-answer');
      }
      if (isClaim) {
        const want = task.verdict ? 'correct' : 'incorrect', decOk = res.parts[0].ok;
        rings.forEach(function (n) {
          if (n.dataset.d === dec) { n.classList.add(decOk ? 'is-good' : 'is-bad'); n.appendChild(sign(decOk)); }
          if (!decOk && n.dataset.d === want) { n.classList.add('is-fix', 'is-answer'); n.appendChild(answerRing()); }
        });
      }
      // a tool that rings numbers (Stop 3 and Stop 5: ring every number that fits) colours its own rings the same way
      const colours = !!(tool && typeof tool.review === 'function' && task.right);
      if (colours) { try { tool.review(task.right); } catch (e) { /* colour is a help, never a blocker */ } }
      if (res.full) return;
      const fix = el('div', { class: 'tp-fix' }, el('p', { class: 'tp-fix__t' }, 'How to do it'));
      // a tool on the paper (Stop 3: tiles in order, rings): the places or rings that are wrong are marked, then the answer
      if (tool && !blanks.length) {
        let out = {};
        try { out = task.check(answer([])) || {}; } catch (e) { out = {}; }
        if (tool.mark && out.parts && !colours) tool.mark(out.parts);
      }
      // (lines to match have no short answer: the worked answer says each one)
      if ((blanks.length || (tool && !task.opts && ui.k !== 'match')) && task.key != null) fix.appendChild(el('p', { class: 'tp-fix__ans' }, 'Answer: ', el('b', decode(String(task.key)).replace(/ ; /g, '; '))));
      if (task.worked && task.worked.text) fix.appendChild(p('tp-fix__line', task.worked.text));
      if (task.worked && task.worked.model) fix.appendChild(p('tp-fix__line tp-fix__model', task.worked.model));
      const pic = task.worked && task.worked.pic ? T.tools.pic(task.worked.pic) : null;
      if (pic) fix.appendChild(el('div', { class: 'tp-fix__pic' }, pic));
      sec.appendChild(fix);
    }

    return {
      el: sec, task: task, parts: partsOf(task), blanks: blanks,
      defs: (task.blanks || []).slice(0, blanks.length).concat(blanks.slice((task.blanks || []).length).map(function () { return { len: 1, w: 'cell' }; })),
      answer: answer,
      complete: function (vals) { return answered(task, answer(vals)).every(Boolean); },
      lock: lock, review: review
    };
  }

  T.testPaper = { question: question, mark: mark, partsOf: partsOf, answered: answered, pen: pen, tag: tag };
})(window.T = window.T || {});

