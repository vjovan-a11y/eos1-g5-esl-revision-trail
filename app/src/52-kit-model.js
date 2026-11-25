/* 52-kit-model.js: the maths game kits 'model' and 'numpad' for the Practise step (50-practise.js).

   T.gameKit.model(entry) -> game     runs the Maths v2 question models (src/models, MX.make) one by one
     entry = { id: 's1r', kit: 'model', game: 'r', surface: 'board' | 'paper', title, blurb: {en, vi}, art,
               levels: [{ title, rounds: [ROUND, ...] }, ...] }
     ROUND = a v2 slot, copied as it is: { mode: 'our' | 'your', lo: ['4Np.01'], twm: ['TWM.05'], v: [DEF, DEF, DEF] }
             (twm: added in v3, the TWM characteristics of the round; shown under the code and skill)
             DEF is the data of one question ({ type: 'digit', n: 4650, d: 6 }); the model works out the
             question, the check, the feedback, the hints and the worked answer. v holds 3 sets of numbers:
             the first play uses v[0], 'Play again' v[1], then v[2] (T.games.plays).
     game   the letter of the answer log (docs/04): 'r' pictorial, 'a' abstract ('c' concrete in See it)
     The tool of a question comes from task.ui.k: 'chart' | 'counters' | 'cells' | 'slider', else T.tools[k]
     ('mat': the drawn base-ten blocks, 39-mat.js; 'nline', 'thermo', 'grid', 'pics': 39-tools-lines.js; Stop 3: 'nline'
     in round mode, 'order', 'pickall': 39-tools-order.js, their mark(out.parts) on the first miss; Stop 5: 'grid' in
     array mode, 'rows', 'msq': 39-tools-times.js; Stop 6: 'share': 39-tools-share.js);
     'matpick' has no tool: its options show blocks (op.b). After two misses or "Show me how" a tool shows the
     right state (tool.solve(task.right)); the first time, a hand points at the tool's button (tool.tip()).

   T.gameKit.numpad(entry) -> game    simple "type the number" questions, same look and rules
     level.rounds = [{ q: 'What is 4,000 + 300 + 7?', answer: 4307, lo: [...], hint: 'Put each part in its place.',
                       worked: '4,000 + 300 + 7 = 4,307.', neg: false }]

   Rules (as in Maths v2): two tries; after the second miss, or "Show me how", Zip shows the worked answer.
   Zip's first line says what to do in at most 10 words, with VI (Phase 3, less reading: DO below, made from the
   tool and the kind of answer). The model's own longer "how" waits behind the Hint button: it opens with the
   first hint. The first time a child meets a tool, a hand shows where to tap (T.guide, 17-guide.js).
   Hints come in steps: a picture, then a tip, then "Show me how". An 'our' round is done together: the hint
   box is open from the start with the "how", the first tip and the hint picture. Points per question (shell, max 2):
   2 = right at the first try with no hint, 1 = right later, 0 = shown. No hearts (game.hearts = false).
   Every answer is logged with T.events.log({s, g, q, v, lo, ok, first, tries, hints}).
   One main button on screen: Check, then Next. The quiet button is Hint. */
(function (T) {
  'use strict';

  const el = T.util.el;

  const LINES = {
    tryAgain: { en: 'Try again!', vi: 'Thử lại nhé!' },
    shown: { en: 'Good try! Look how it works.', vi: 'Cố gắng tốt lắm! Xem cách làm nhé.' },
    showMe: { en: 'Look at each step. You can do the next one!', vi: 'Xem từng bước nhé. Câu sau em làm được!' },
    praise: [
      { en: 'Great!', vi: 'Tuyệt!' }, { en: 'Well done!', vi: 'Giỏi lắm!' }, { en: 'Yes!', vi: 'Đúng rồi!' },
      { en: 'Super!', vi: 'Xuất sắc!' }, { en: 'Brilliant!', vi: 'Tuyệt vời!' }
    ]
  };

  // Zip's first line of a question: the tool part, then the answer part (each line at most 10 words in all)
  const DO = {
    build: { en: 'Tap *+* to add blocks. Then tap *Check*.', vi: 'Bấm *+* để thêm khối. Rồi bấm *Check* (Kiểm tra).' },
    brk: { en: 'Tap a block to *break* it.', vi: 'Bấm vào một khối để *tách* nó.' },
    join: { en: 'Tap *Join 10* to join ten blocks.', vi: 'Bấm *Join 10* để gộp mười khối.' },
    blocks: { en: 'Look at the *blocks*.', vi: 'Em hãy nhìn các *khối*.' },
    chart: { en: 'Look at the *place value chart*.', vi: 'Em hãy nhìn *bảng giá trị theo hàng*.' },
    counters: { en: 'Tap *+* to draw counters in the chart.', vi: 'Bấm *+* để vẽ hạt tính vào bảng.' },
    cells: { en: 'Tap a box in the chart. Then tap a digit.', vi: 'Bấm vào một ô trong bảng. Rồi bấm một chữ số.' },
    slider: { en: 'Move the digits with the arrows.', vi: 'Di chuyển các chữ số bằng nút mũi tên.' },
    matpick: { en: 'Look at each set of blocks.', vi: 'Em hãy nhìn từng nhóm khối.' },
    nline: { en: 'Hop with the *Jump* buttons.', vi: 'Nhảy bằng các nút *Jump* (Nhảy).' },
    thermo: { en: 'Tap *Warmer* or *Colder*.', vi: 'Bấm *Warmer* (Ấm hơn) hoặc *Colder* (Lạnh hơn).' },
    grid: { en: 'Tap *Bigger* to grow the square.', vi: 'Bấm *Bigger* (Lớn hơn) để làm hình vuông to ra.' },
    pics: { en: 'Look at the jumps. Find the *rule*.', vi: 'Nhìn các bước nhảy. Tìm *quy luật*.' },
    line: { en: 'Look at the *number line*.', vi: 'Em hãy nhìn *trục số*.' },
    round: { en: 'Tap the *nearer* round number.', vi: 'Bấm vào số tròn *gần hơn*.' },
    order: { en: 'Tap the numbers in order, *smallest* first.', vi: 'Bấm các số theo thứ tự, số *bé nhất* trước.' },
    pickall: { en: 'Tap *every* number that fits.', vi: 'Bấm vào *tất cả* các số phù hợp.' },
    // Stop 4: take away with blocks, the balance scale
    takeaway: { en: '*Break* a block, then tap *Take away*.', vi: '*Tách* một khối, rồi bấm *Take away* (Bớt đi).' },
    balance: { en: 'Make the scale *balance*.', vi: 'Làm cho cân *thăng bằng*.' },
    // Stop 5: the array of counters, counters in equal rows, the multiplication square
    array: { en: 'Tap *+* to add rows and counters.', vi: 'Bấm *+* để thêm hàng và hạt tính.' },
    rows: { en: 'Tap *More* to make more rows.', vi: 'Bấm *More* (Thêm) để có thêm hàng.' },
    msq: { en: 'Tap where the *row* and *column* meet.', vi: 'Bấm vào ô nơi *hàng* và *cột* gặp nhau.' },
    // Stop 6: sharing counters among plates (the remainder is left over)
    share: { en: 'Tap *Give 1 to each plate*.', vi: 'Bấm *Give 1 to each plate* (Cho mỗi đĩa 1).' },
    // Stop 9: a chance experiment, the measuring jug, lines to match
    trial: { en: 'Do the *experiment* first. Then read the table.', vi: 'Làm *thí nghiệm* trước. Rồi đọc bảng kết quả.' },
    jug: { en: 'Tap *Pour in* or *Pour out*.', vi: 'Bấm *Pour in* (Rót vào) hoặc *Pour out* (Đổ bớt).' },
    match: { en: 'Join each one to its *partner*.', vi: 'Nối mỗi ô với *cặp* của nó.' },        // Stops 8 and 9
    // Stop 8: the clock with buttons for its hands, draw a line to match
    clock: { en: 'Move the hands with the *buttons*.', vi: 'Xoay kim đồng hồ bằng các *nút*.' },
    // Stop 7: a strip cut into equal parts, counters shared among plates (the Zip line is the Stop 6 one above)
    strip: { en: 'Tap *More* to cut the strip.', vi: 'Bấm *More* (Thêm) để cắt băng giấy.' },
    claim: { en: 'Tap *correct* or *incorrect*. Then tap a reason.', vi: 'Bấm *correct* (đúng) hoặc *incorrect* (sai). Rồi chọn một lý do.' },
    read: { en: 'Read the question.', vi: 'Em đọc câu hỏi.' },
    opts: { en: 'Tap one answer.', vi: 'Bấm vào một đáp án.' },
    blanks: { en: 'Type your answer.', vi: 'Nhập câu trả lời của em.' },
    check: { en: 'Then tap *Check*.', vi: 'Rồi bấm *Check* (Kiểm tra).' }
  };

  // -> {en, vi}: what to do with this question, from its tool and its kind of answer
  function doLine(task, surface) {
    const ui = task.ui || {};
    let first = null;
    if (task.type === 'claim') return DO.claim;
    if (ui.k === 'mat') first = ui.ctl ? DO.build : ui.can && ui.can.join ? DO.join : ui.can && ui.can.brk ? DO.brk : DO.blocks;
    else if (ui.k === 'nline' && ui.mode === 'round') first = DO.round;
    else if (ui.k === 'grid' && ui.mode === 'array') first = DO.array;
    else if (ui.k === 'pics') {                 // pictures only: what they show (blocks, a number line, jumps)
      const k0 = ((ui.list || [])[0] || {}).k;
      first = k0 === 'mat' ? DO.blocks : k0 === 'nline' || k0 === 'rline' ? DO.line : DO.pics;
    } else if (ui.k && DO[ui.k]) first = DO[ui.k];
    else if (ui.k) first = null;
    if (first === DO.build || first === DO.counters || first === DO.cells) return first;   // the tool is the answer
    const then = task.opts ? DO.opts : task.blanks ? DO.blanks : first ? DO.check : DO.opts;
    const lead = first || (surface === 'paper' || !ui.k ? DO.read : null);
    if (lead && task.opts && /Tick|Tap one/.test(String(task.sub || ''))) return lead;   // the card already says: Tap one answer.
    return lead ? { en: lead.en + ' ' + then.en, vi: lead.vi + ' ' + then.vi } : then;
  }

  /* ---------- text: the models write a little HTML (<b>, entities) and [[word]] links ---------- */

  function hasWord(key) {
    const want = String(key).trim().toLowerCase();
    return Object.keys(T.packs || {}).some(function (n) {
      const items = T.packs[n] && T.packs[n].words && T.packs[n].words.items;
      return !!items && Object.keys(items).some(function (w) { return w.toLowerCase() === want; });
    });
  }

  function decode(text) {
    const t = document.createElement('textarea');
    t.innerHTML = text;
    return t.value;
  }

  // HTML of a model -> a line for Zip's strip: <b>x</b> -> *x*, [[w]] kept only when its word card exists
  function toLine(html) {
    let s = String(html || '');
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, shown, key) { return hasWord(key || shown) ? m : shown; });
    s = s.replace(/<\/?(b|strong)>/gi, '*').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
    return decode(s).replace(/\*\s*\*/g, '').replace(/\s+/g, ' ').trim();
  }

  // HTML of a model -> nodes for the question card: [[w]] becomes a word card link (or bold until the card exists)
  function html(host, text) {
    const s = String(text || '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, shown, key) {
      return '<span data-kw="' + (key || shown).replace(/"/g, '') + '">' + shown + '</span>';
    });
    host.innerHTML = s;
    T.util.$$('[data-kw]', host).forEach(function (span) {
      const key = span.getAttribute('data-kw'), shown = span.textContent;
      const node = hasWord(key) ? T.ui.richText('[[' + shown + '|' + key + ']]') : el('b', shown);
      span.parentNode.replaceChild(node, span);
    });
    return host;
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  // the answer given with a Stop 3 tool, as text for the answer log: tiles in order, rings, the end it rounds to
  function toolGiven(r) {
    if (Array.isArray(r.order)) return r.order.map(function (x) { return x == null ? '_' : String(x); }).join(',');
    if (Array.isArray(r.picks)) return r.picks.join(',') || '-';
    if (r.choice != null) return String(r.choice);
    if (r.r != null && r.c != null && r.p != null && !r.v) return r.r ? r.r + ' × ' + r.c : '';   // Stop 5: the box tapped on the multiplication square
    if (r.level != null && r.read != null) return r.read;           // Stop 9: the water in the jug ("1 1/2 l")
    if (Array.isArray(r.pairs) && r.said) return r.said;             // Stop 9: the lines drawn ("1-Maybe 2-Certain ...")
    if (r.h != null && r.m != null && !r.v) return r.h + ':' + (r.m < 10 ? '0' : '') + r.m;     // Stop 8: the time set on the clock
    return '';
  }

  /* ---------- one question ---------- */

  // ask(g, task, meta) -> cleanup(); meta = { q, total, game, lo, surface, last, done(result) }
  //   optional: dok (1-3, logged with the answer: the Mini test), chip (a short label beside "Question 1 of 10")
  function ask(g, task, meta) {
    const ctx = g.ctx, MX = window.MX, ui = task.ui || {}, isClaim = task.type === 'claim';
    T.gameKit.current = task;                 // the question on screen (read by the tests only)
    let tries = 0, hints = 0, over = false, tool = null, chart = null, slider = null, pad = null, dec = '';
    let picked = -1;
    const crossed = {};

    const root = el('div', { class: ['mk', 'mk--' + (meta.surface || 'paper')] });
    const scroller = el('div', { class: 'mk__scroll' });
    root.appendChild(scroller);
    g.body.appendChild(root);

    // the question card
    const headRow = el('p', { class: 'mk__head' },
      el('span', { class: 'mk__num' }, 'Question ' + (meta.q + 1) + ' of ' + meta.total),
      task.mode === 'our' ? el('span', { class: 'chip mk__turn' }, 'Our turn') : null,
      meta.chip ? el('span', { class: ['chip', 'mk__lvl', meta.dok && 'mk__lvl--' + meta.dok] }, meta.chip) : null,
      meta.surface === 'paper' ? el('span', { class: 'mk__marks', 'aria-label': task.marks + (task.marks === 1 ? ' mark' : ' marks') }, '[' + task.marks + ']') : null);
    // Practise: what this question practises, the Cambridge code(s) and the skill (Jovan, 24 Nov 2026), then the
    // TWM characteristic(s) of the round (round.twm, T.TWM: "TWM.05 Characterising"). No DOK on Practise.
    const skills = meta.showLo ? (meta.lo || []).filter(function (c) { return T.OBJECTIVES && T.OBJECTIVES[c]; }) : [];
    const twms = meta.showLo ? (meta.twm || []).filter(function (c) { return T.TWM && T.TWM[c]; }) : [];
    const loRow = skills.length || twms.length ? el('ul', { class: 'mk__lo', 'aria-label': 'What you practise' }, skills.map(function (c) {
      return el('li', { class: 'mk__lo-item' }, el('b', { class: 'mk__lo-code' }, c), el('span', { class: 'mk__lo-skill' }, T.OBJECTIVES[c]));
    }).concat(twms.length ? [el('li', { class: 'mk__lo-item mk__lo-item--twm' }, twms.map(function (c, i) {
      return el('span', { class: 'mk__twm' }, el('b', { class: 'mk__lo-code mk__twm-code' }, c), el('span', { class: 'mk__twm-name' }, T.TWM[c].name));
    }))] : [])) : null;
    const card = el('div', { class: 'mk__card' });
    card.appendChild(html(el('p', { class: 'mk__q' }), task.q));
    if (task.says) {
      card.appendChild(html(el('p', { class: 'mk__says' }), task.says));
      card.appendChild(html(el('p', { class: 'mk__q' }), task.ask));
    }
    if (task.name != null) card.appendChild(el('p', { class: 'mk__name' }, MX.words(task.name)));
    if (task.sum) card.appendChild(html(el('p', { class: 'mk__sum' }), task.sum));
    if (task.fig) { const f = T.tools.pic(task.fig); if (f) card.insertBefore(f, isClaim || task.fig.k === 'stim' ? card.firstChild : null); }
    // two columns on a wide screen when the question is big (a tool, a picture or a claim): the question on the
    // left, the answer and the help on the right; one column on a phone
    const big = !!(ui.k || task.fig || isClaim);
    const left = el('div', { class: 'mk__col' }), right = el('div', { class: 'mk__col' });
    // Stop 5: the multiplication square is tall: on a wide screen it takes the right column, and the answer and the help
    // stay under the question on the left (so the whole square shows with no scrolling); in one column (a phone, an
    // upright iPad) the square comes straight after the question and the help under it
    const wideCols = !!(window.matchMedia && window.matchMedia('(min-width: 900px)').matches);
    const side = ui.k === 'msq' && wideCols ? left : right;
    if (big) root.classList.add('mk--split');
    scroller.appendChild(headRow);
    if (loRow) scroller.appendChild(loRow);
    scroller.appendChild(el('div', { class: 'mk__cols' }, left, right));
    left.appendChild(card);

    // the tool on the desk
    if (ui.k === 'chart' || ui.k === 'counters' || ui.k === 'cells') {
      chart = T.tools.chart(left, ui);
      chart.on('change', change);
    } else if (ui.k === 'slider') {
      slider = T.tools.slider(left, ui);
      slider.on('change', change);
    } else if (ui.k && T.tools[ui.k]) {
      tool = T.tools[ui.k](ui.k === 'msq' ? right : left, Object.assign({ task: task }, ui));
      if (tool && tool.on) tool.on('change', change);
    }

    // the answer
    const box = el('div', { class: 'mk__answer' });
    // on screen the answers are buttons, not boxes on paper: "Tick (✓) one box." reads "Tap one answer."
    const tap = function (t) { return String(t || '').replace(/Tick \(✓\) one box\./g, 'Tap one answer.').replace(/Tick \(✓\)/g, 'Tap').replace(/tick \(✓\)/g, 'tap'); };
    if (task.sub && !isClaim) box.appendChild(html(el('p', { class: 'mk__sub' }), tap(task.sub)));
    let linesNode = null;
    if (task.lines) {
      const lines = linesNode = el('div', { class: 'mk__lines' });
      task.lines.forEach(function (line) {
        const p = html(el('p', { class: 'mk__line' }), line.replace(/\{(\d)\}/g, function (m, i) {
          return '<button type="button" class="blank blank--' + (task.blanks[+i].w || 'big') + '" data-i="' + i + '"></button>';
        }));
        lines.appendChild(p);
      });
      box.appendChild(lines);
    }
    let verdict = null;
    if (isClaim) {
      box.appendChild(html(el('p', { class: 'mk__sub' }), tap(task.sub)));
      const vbtn = function (d) {
        return el('button', { type: 'button', class: 'mk__vd', 'aria-pressed': 'false', dataset: { d: d },
          onclick: function () { if (over) return; setDec(d); T.fx.sfx('pick'); change(); } }, d);
      };
      verdict = el('p', { class: 'mk__line mk__verdict' }, task.who + ' is ', vbtn('correct'), vbtn('incorrect'), ' because');
      box.appendChild(verdict);
    }
    let choices = null;
    const optNodes = [];
    if (task.opts) {
      choices = el('div', { class: ['choices', 'mk__opts', task.opts.length === 4 && !isClaim && 'choices--2'], role: 'radiogroup', 'aria-label': 'Choose one answer' });
      task.opts.forEach(function (op, i) {
        const label = el('span', { class: 'mk__opt' },
          task.letters ? el('b', { class: 'mk__let' }, MX.LET[i]) : null,
          html(el('span'), op.html || ''));
        if (op.fig) { const f = T.tools.pic(op.fig); if (f) label.appendChild(f); }
        if (op.b) label.appendChild(T.tools.blocks(null, { b: op.b, counts: false, u: 6 }).el);
        const aria = op.alt || (op.b ? 'Blocks ' + (task.letters ? MX.LET[i] + ': ' : '') + MX.say(op.b) : null);
        const node = T.ui.choice({ label: label, value: String(i), sfx: 'pick', aria: aria,
          onClick: function () { if (over || crossed[i]) return; choose(i); } });
        node.setAttribute('role', 'radio');
        node.setAttribute('aria-checked', 'false');
        optNodes.push(node);
        choices.appendChild(node);
      });
      box.appendChild(choices);
    }
    // Stop 4, a question in two parts (task.ab): (a) tick one box, then (b) write the answer (task.abAsk says what)
    // (Stop 6: findmistake says "Tick the sentence ... Then write the correct answer": task.optsFirst, the same order)
    if ((task.ab || task.optsFirst) && choices && linesNode) {
      box.appendChild(choices);
      if (task.abAsk) box.appendChild(html(el('p', { class: 'mk__sub' }), tap(task.abAsk)));
      box.appendChild(linesNode);
    }
    if (box.children.length) (big ? side : left).appendChild(box);

    const blanks = T.util.$$('.blank', root).sort(function (a, b) { return a.dataset.i - b.dataset.i; });
    if (task.blanks && blanks.length) {
      pad = T.tools.numpad({ blanks: blanks, defs: task.blanks, onChange: change, onEnter: function () { if (!over && ready()) check(); } });
      root.appendChild(pad.el);
    }

    const fb = el('div', { class: 'mk__fb', 'aria-live': 'polite' });
    (big ? side : left).appendChild(fb);

    function setDec(d) {
      dec = d;
      T.util.$$('.mk__vd', verdict).forEach(function (b) {
        const on = b.dataset.d === d;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function choose(i) {
      picked = i;
      optNodes.forEach(function (n, j) {
        n.classList.toggle('is-picked', j === i);
        n.setAttribute('aria-checked', j === i ? 'true' : 'false');
      });
      change();
    }

    function resp() {
      const r = {};
      if (chart && ui.k === 'counters') r.b = chart.get().b;
      if (tool && tool.get) Object.assign(r, tool.get());
      if (pad) r.v = pad.get();
      if (task.opts) r.pick = picked;
      if (isClaim) r.dec = dec;
      return r;
    }

    function ready() {
      const r = resp();
      if (task.ready) return !!task.ready(r);
      if (tool && tool.ready && !tool.ready()) return false;
      if (pad) return pad.full();
      if (task.opts) return r.pick >= 0;
      return true;
    }

    function given(r) {
      if (task.given) return task.given(r);
      return (r.v ? r.v.join(' | ') : '') + (r.dec ? r.dec + ' ' : '') + (r.pick >= 0 ? MX.LET[r.pick] : '') +
        (!r.v && r.b ? r.b.join('-') : '') + toolGiven(r);
    }

    function setButtons() {
      if (over) return;
      ctx.primary({ label: 'Check', disabled: !ready(), onClick: check });
    }

    function change() {
      if (over) return;
      if (tool && tool.live) tool.live(resp());          // Stop 4: the balance scale follows the typed number
      if (pad) pad.mark(null);
      setButtons();
    }

    function scrollToFeedback() {
      ctx.later(function () {
        const r = fb.getBoundingClientRect(), s = scroller.getBoundingClientRect();
        if (r.bottom > s.bottom) scroller.scrollTop += r.bottom - s.bottom + 8;
      }, 60);
    }

    function lockAll() {
      if (chart) chart.lock();
      if (slider) slider.lock();
      if (tool && tool.lock) tool.lock();
      if (pad) pad.lock();
      optNodes.forEach(function (n) { n.disabled = true; });
      if (verdict) T.util.$$('.mk__vd', verdict).forEach(function (b) { b.disabled = true; });
    }

    function check() {
      if (over || !ready()) return;
      const r = resp(), out = task.check(r) || {};
      tries++;
      if (out.ok) { finish(true, r, out); return; }
      if (tries >= 2) { finish(false, r, out); return; }
      // the first miss: say what to look at, and let the child try again
      const at = answerNode(), onOption = !!task.opts && picked >= 0;
      if (pad && out.parts) pad.mark(out.parts);
      if (tool && tool.mark && out.parts) tool.mark(out.parts);      // Stop 3: the places in the wrong order, the wrong rings
      if (isClaim) {
        if (out.reasonOk === false && picked >= 0) cross(picked);
        if (out.decOk === false) shake(verdict);
      } else if (task.opts && picked >= 0 && out.pickOk !== true) cross(picked);
      // the shake: an option shakes as it is crossed and a marked box shakes itself (numpad mark); else the answer
      g.wrong(onOption || (pad && out.parts) ? null : at);
      ctx.instruct({ en: toLine(out.msg || 'Not yet.') + ' *' + LINES.tryAgain.en + '*', vi: LINES.tryAgain.vi, mood: 'oops' });
      setButtons();
      // the first miss ever: a hand shows the Hint button
      T.guide.point('hint', function () { return document.querySelector('.actionbar__secondary:not([hidden])'); }, { delay: 900 });
    }

    function cross(i) {
      crossed[i] = true;
      const n = optNodes[i];
      n.classList.remove('is-picked');
      n.classList.add('is-wrong');
      ctx.later(function () { n.classList.remove('is-wrong'); n.classList.add('is-dim'); n.disabled = true; }, 700);
      if (picked === i) picked = -1;
    }

    // where the child answered: the picked option, the answer boxes, the claim's words, the tool (Phase 5: the
    // burst of a right answer and the shake of a wrong one happen there, not on the whole card)
    function answerNode() {
      if (task.opts && picked >= 0 && optNodes[picked]) return optNodes[picked];
      if (pad && blanks.length) return blanks.length === 1 ? blanks[0] : blanks[0].closest('.mk__lines, .pv') || blanks[0];
      if (verdict) return verdict;
      const t = (tool && tool.el) || (chart && chart.el) || (slider && slider.el);
      return t || card;
    }

    function shake(node) {
      if (!node) return;
      node.classList.remove('is-shake'); void node.offsetWidth; node.classList.add('is-shake');
    }

    function finish(ok, r, out, shown) {
      over = true;
      lockAll();
      const first = ok && tries === 1 && hints === 0;
      const result = { ok: ok, first: first, tries: tries, hints: hints, shown: !!shown, v: given(r) };
      const entry = { s: g.stop, g: meta.game, q: meta.q, v: result.v, lo: meta.lo || [], ok: ok, first: first, tries: tries, hints: hints };
      if (meta.dok) entry.dok = meta.dok;                   // the Mini test: DOK level 1, 2 or 3
      T.events.log(entry);
      g.score(ok ? (first ? 2 : 1) : 0, 2);
      // Phase 6: a run of right answers at the first try ("3 in a row!" pops on Zip); the shell or See it keeps it
      const run = typeof g.streak === 'function' ? g.streak(first) : null;
      if (ok) {
        if (pad) pad.mark(task.blanks.map(function () { return true; }));
        if (task.opts && picked >= 0) optNodes[picked].classList.add('is-right');
        g.right(answerNode());
        const praise = run || pick(LINES.praise);
        ctx.instruct({ en: (run ? run.en : '*' + praise.en + '*') + ' ' + toLine(out.note || task.yes || ''), vi: praise.vi, mood: 'cheer' });
      } else {
        reveal(shown);
      }
      ctx.secondary(null);
      ctx.primary({ label: meta.last ? 'Finish' : 'Next question', iconEnd: 'next', onClick: function () { meta.done(result); } });
    }

    function reveal(byChoice) {
      T.fx.sfx(byChoice ? 'pop' : 'no');
      if (pad && task.fill) { pad.mark(null); pad.fill(task.fill); }
      if (tool && tool.live && pad) tool.live({ v: pad.get() });
      if (task.opts) {
        const right = task.opts.findIndex(function (x) { return x.ok; });
        if (right >= 0) { optNodes[right].classList.remove('is-dim'); optNodes[right].classList.add('is-right'); }
      }
      if (isClaim) setDec(task.verdict ? 'correct' : 'incorrect');
      if (tool && tool.solve && task.right) tool.solve(task.right);          // the tool shows the right state
      const worked = el('div', { class: 'mk__worked' },
        el('h3', { class: 'mk__fbtitle' }, byChoice ? 'Here is how' : "Let's look together"),
        html(el('p'), task.worked && task.worked.text));
      if (task.worked && task.worked.model) worked.appendChild(html(el('p', { class: 'mk__model' }), task.worked.model));
      const p = task.worked ? T.tools.pic(task.worked.pic) : null;
      if (p) worked.appendChild(p);
      fb.appendChild(worked);
      const line = byChoice ? LINES.showMe : LINES.shown;
      ctx.instruct({ en: line.en, vi: line.vi, mood: 'think' });
      scrollToFeedback();
    }

    // hints: a picture (or a highlight on the tool), then a tip in words, then "Show me how"
    const steps = [];
    // a hint picture that is the question's own picture (Stop 3: the rounding line) is not drawn twice
    const samePic = !!(task.fig && task.hint && task.hint.pic && JSON.stringify(task.fig) === JSON.stringify(task.hint.pic));
    if (task.hint && (task.hint.reveal || (task.hint.pic && !samePic))) steps.push('pic');
    if (task.hint && task.hint.step) steps.push('step');
    steps.push('show');

    function hintBox() {
      let bx = fb.querySelector('.mk__hint');
      if (!bx) {
        bx = el('div', { class: 'mk__hint' }, el('h3', { class: 'mk__fbtitle' }, T.ui.icon('bulb'), 'Hint'));
        // the model's own "how" (longer than Zip's line) comes first in the hint
        if (task.how) bx.appendChild(html(el('p', { class: 'mk__tip mk__how' }), tap(task.how)));
        fb.insertBefore(bx, fb.firstChild);
      }
      return bx;
    }

    function openHint(k) {
      const bx = hintBox();
      if (k === 'pic') {
        const rv = task.hint.reveal || '';
        if (rv.indexOf('hl:') === 0 && chart) { chart.setHl(rv.slice(3)); bx.appendChild(el('p', { class: 'mk__in' }, 'Look at the yellow place in the chart.')); }
        else if (rv && tool && tool.reveal) tool.reveal(rv);
        const p = samePic ? null : T.tools.pic(task.hint.pic);
        if (p) { p.classList.add('mk__in'); bx.appendChild(p); }
      } else if (!(task.how && toLine(task.how) === toLine(task.hint.step))) {   // never the same tip twice (Stop 4's columns)
        bx.appendChild(html(el('p', { class: 'mk__tip mk__in' }), task.hint.step));
      }
    }

    function hintLabel() { return steps[Math.min(hints, steps.length - 1)] === 'show' ? 'Show me how' : hints ? 'More help' : 'Hint'; }

    function onHint() {
      if (over) return;
      const k = steps[Math.min(hints, steps.length - 1)];
      hints++;
      if (k === 'show') { finish(false, resp(), {}, true); return; }
      T.fx.sfx('pop');
      openHint(k);
      ctx.secondary({ label: hintLabel(), icon: 'bulb', onClick: onHint });
      scrollToFeedback();
    }

    // Zip's first line: what to do, in a few words (with VI); the longer "how" is in the hint. An 'our' round
    // is done together: the hint box is open from the start with the how, the hint picture and the first tip.
    const line = doLine(task, meta.surface);
    ctx.instruct({ en: line.en, vi: line.vi, mood: 'happy' });
    if (task.mode === 'our') {
      if (steps[0] === 'pic' && task.hint.pic) { openHint('pic'); steps.shift(); }
      if (steps[0] === 'step') { openHint('step'); steps.shift(); }
      if (!fb.querySelector('.mk__hint') && task.how) hintBox();
    }

    setButtons();
    ctx.secondary({ label: hintLabel(), icon: 'bulb', onClick: onHint });
    guideFirst();

    // the first time a child meets a tool or a kind of answer, a hand shows where to tap (one per question)
    function guideFirst() {
      const q = function (sel) { return function () { return root.querySelector(sel); }; };
      const list = [];
      if (ui.k === 'mat') {
        if (ui.ctl) list.push(['mat-plus', q('.mat__stp--plus:not([disabled])')]);
        if (ui.can && ui.can.join) list.push(['mat-join', q('.mat__join')]);
        if (ui.can && ui.can.brk) list.push(['mat-break', q('.mat__pc.is-tap')]);
      }
      if (ui.k === 'counters') list.push(['counters', q('.pv__step[aria-label^="Draw"]:not([disabled])')]);
      if (ui.k === 'slider') list.push(['slider', q('.sl__b')]);
      if (tool && tool.tip && ui.k !== 'mat') list.push(['tool-' + (ui.mode === 'array' ? 'array' : ui.k), function () { return tool.tip(); }]);
      if (isClaim) list.push(['verdict', q('.mk__vd')]);
      if (task.opts) list.push(['choice', function () { return optNodes[0] || null; }]);
      if (blanks.length) list.push(['numpad', function () { return blanks[0]; }]);
      const first = list.filter(function (x) { return !T.guide.seen(x[0]); })[0];
      if (first) T.guide.point(first[0], first[1]);
    }
    return function cleanup() { over = true; if (pad) pad.destroy(); };
  }

  /* ---------- a game: the levels of an entry ---------- */

  const tally = {};          // 'stop:id' -> right answers in this play (for the v2 star rule, Session 5)

  function game(entry, makeTask) {
    const levels = entry.levels || [];
    return {
      title: entry.title,
      blurb: entry.blurb,
      art: entry.art,
      levels: levels.length,
      hearts: false,
      levelTitles: levels.map(function (l) { return l && l.title ? (l.title.en || l.title) : ''; }),
      resultTitle: 'Well done!',
      mount: function (g) {
        const level = levels[g.level - 1] || { rounds: [] };
        const rounds = level.rounds || [];
        const before = levels.slice(0, g.level - 1).reduce(function (s, l) { return s + ((l && l.rounds) || []).length; }, 0);
        const total = levels.reduce(function (s, l) { return s + ((l && l.rounds) || []).length; }, 0);
        const play = T.games.plays(g.stop, g.id);
        const key = g.stop + ':' + g.id;
        if (g.level === 1) tally[key] = { right: 0, of: total };
        let i = 0, cleanup = null;
        g.ctx.onLeave(function () { if (cleanup) cleanup(); });

        function next() {
          if (cleanup) { cleanup(); cleanup = null; }
          if (i >= rounds.length) { saveBest(g, key); g.levelDone(); return; }
          const round = rounds[i];
          T.ui.empty(g.body);
          g.rounds(before + i + 1, total);                   // the top bar: question 3 of 5 of the whole game
          let task;
          try { task = makeTask(round, play); } catch (e) { console.error('model kit: round ' + (before + i + 1) + ' of ' + entry.id + ' did not build', e); i++; next(); return; }
          cleanup = ask(g, task, {
            q: before + i, total: total, game: entry.game || 'r', lo: round.lo, twm: round.twm, showLo: true, surface: entry.surface || 'paper',
            last: before + i === total - 1,
            done: function (res) {
              if (res.ok && tally[key]) tally[key].right++;
              i++;
              next();
            }
          });
        }
        next();
      }
    };
  }

  function saveBest(g, key) {
    if (g.level !== g.levels || !tally[key]) return;
    const path = ['stops', String(g.stop), 'practise', 'right', g.id];
    const old = T.store.get(path, null);
    if (!old || tally[key].right > old.right) T.store.set(path, { right: tally[key].right, of: tally[key].of });
  }

  // a v2 slot -> one question, with the set of numbers for this play
  function modelTask(round, play) {
    const v = round.v || [];
    const def = v[play % Math.max(1, v.length)];
    return window.MX.make(def, round.mode || 'your');
  }

  // a simple numpad round -> a task in the same shape as a model's
  function numpadTask(round) {
    const MX = window.MX, ans = Number(round.answer);
    return {
      type: 'numpad', mode: round.mode || 'your', marks: 1,
      q: round.q, how: round.how || 'Type the answer with the number pad.',
      lines: [round.line || '{0}'], blanks: [{ len: round.len || 6, w: 'big', neg: !!round.neg || ans < 0 }],
      check: function (r) {
        const v = Number(r.v[0]);
        return v === ans ? { ok: true } : { ok: false, msg: round.slip && round.slip[r.v[0]] ? round.slip[r.v[0]] : 'Check your answer again.', parts: [false] };
      },
      hint: round.hint ? { step: round.hint } : null,
      worked: { text: round.worked || ('The answer is ' + MX.fmt(ans) + '.') },
      yes: round.yes || '', fill: [String(ans)]
    };
  }

  T.gameKit = T.gameKit || {};
  T.gameKit.model = function (entry) { return game(entry, modelTask); };
  T.gameKit.numpad = function (entry) { return game(entry, function (round) { return numpadTask(round); }); };
  T.gameKit.modelText = { toLine: toLine, html: html };
  T.gameKit.toolGiven = toolGiven;                         // the Mini test logs a tool's answer the same way (70-test.js)   // for the tests, the text dump and the Mini test paper
  // one question, for other steps that run the models (the See it challenge, 45-see.js):
  // ask(g, task, meta) with g = { ctx, body, stop, score(points, max), right(el), wrong(el) }; modelTask(round, play)
  T.gameKit.ask = ask;
  T.gameKit.doLine = doLine;
  (T.zipLines = T.zipLines || {}).model = { lines: LINES, doLines: DO };   // checked by test/guide.mjs (10 words)
  T.gameKit.modelTask = modelTask;
})(window.T = window.T || {});

