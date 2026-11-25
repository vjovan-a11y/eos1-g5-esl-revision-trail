/* 03-g5-art-words-3.js - the Stop 3 word card pictures (Sequences and term rules), flat style of 03-art-words.js.

   w-sequence, w-term, w-position                          number cards 2, 5, 8, 11: the row, one card, one place
   w-rule, w-term-to-term-rule, w-position-to-term-rule    a +3 machine, +3 jumps from card to card, a table with x3
   w-constant, w-count-on, w-count-back                    equal jumps of +0.5, jumps to the right, jumps to the left
   w-negative-number, w-square-number                      -3 on a number line, dot squares 1, 4, 9

   viewBox 400 x 300, literal colours (Stop 3 blue #2F7FD4 / #1F5CA0, gold #F5A623 points at the thing meant).
   No word is written in its picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A', GOLD = '#F5A623', SOFT = '#FFF1CF', RED = '#D22630';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const TIMES = '×', DIV = '÷', MINUS = '−';

  function svg(id, label, w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" class="art" data-art="' + id +
      '" role="img" aria-label="' + label + '" fill="none" stroke-linejoin="round" stroke-linecap="round">' + body + '</svg>';
  }

  function word(id, label, body) {
    return svg(id, label, 400, 300, body);
  }

  function txt(x, y, size, text, fill, anchor) {
    return '<text x="' + x + '" y="' + y + '" ' + FONT + ' font-size="' + size + '" text-anchor="' + (anchor || 'middle') +
      '" fill="' + (fill || INK) + '">' + text + '</text>';
  }

  function rect(x, y, w, h, rx, fill, stroke, sw) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + fill +
      '" stroke="' + (stroke || INK) + '" stroke-width="' + (sw || 3) + '"/>';
  }

  function circ(cx, cy, r, fill, stroke, sw) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + (stroke || INK) +
      '" stroke-width="' + (sw || 3) + '"/>';
  }

  // a number card; hl = the gold one
  function card(x, y, w, h, text, col, hl, size) {
    const fs = size || Math.round(h * 0.52);
    return rect(x, y, w, h, 12, hl ? SOFT : '#FFFFFF', hl ? GOLD : col, hl ? 6 : 5) +
      txt(x + w / 2, y + h / 2 + fs * 0.35, fs, text, hl ? INK : col);
  }

  // a rounded label with a number or a sign in it
  function pill(cx, cy, w, h, text, fill, color, size) {
    const fs = size || Math.round(h * 0.68);
    return rect(cx - w / 2, cy - h / 2, w, h, h / 2, fill || GOLD, INK, 3) + txt(cx, cy + fs * 0.35, fs, text, color || INK);
  }

  function head(x, y, a, color, sw, L) {
    const p = function (t) { return (x - L * Math.cos(a + t)).toFixed(1) + ' ' + (y - L * Math.sin(a + t)).toFixed(1); };
    return '<path d="M' + p(0.5) + 'L' + x + ' ' + y + 'L' + p(-0.5) + '" stroke="' + color + '" stroke-width="' + sw + '"/>';
  }

  function arrow(x1, y1, x2, y2, color, sw) {
    const c = color || INK, w = sw || 6;
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + c + '" stroke-width="' + w + '"/>' +
      head(x2, y2, Math.atan2(y2 - y1, x2 - x1), c, w, w * 2.4);
  }

  // a curved jump from (x1, y) to (x2, y), h high (h < 0 curves below), with an arrow head at the end
  function hop(x1, x2, y, h, color, sw) {
    const c = color || INK, w = sw || 5, mx = (x1 + x2) / 2;
    return '<path d="M' + x1 + ' ' + y + 'Q' + mx + ' ' + (y - 2 * h) + ' ' + x2 + ' ' + y + '" stroke="' + c + '" stroke-width="' + w + '"/>' +
      head(x2, y, Math.atan2(2 * h, x2 - mx), c, w, w * 2.4);
  }

  // a stacked fraction centred on (cx, cy): numerator, bar, denominator
  function frac(cx, cy, size, n, d, cn, cd, cb) {
    const len = Math.max(String(n).length, String(d).length), w = size * (0.3 + 0.52 * len);
    return txt(cx, cy - size * 0.17, size, n, cn) +
      '<path d="M' + (cx - w / 2) + ' ' + cy + 'h' + w + '" stroke="' + (cb || INK) + '" stroke-width="' + Math.max(5, Math.round(size / 11)) + '"/>' +
      txt(cx, cy + size * 0.88, size, d, cd);
  }

  function tick(cx, cy, s, color, sw) {
    return '<path d="M' + (cx - s) + ' ' + cy + 'l' + (s * 0.7) + ' ' + (s * 0.7) + 'l' + (s * 1.3) + ' ' + (-s * 1.5) +
      '" stroke="' + (color || '#1E9E6A') + '" stroke-width="' + (sw || 10) + '"/>';
  }

  function cross(cx, cy, s, sw) {
    return '<path d="M' + (cx - s) + ' ' + (cy - s) + 'l' + (2 * s) + ' ' + (2 * s) + 'M' + (cx + s) + ' ' + (cy - s) + 'l' + (-2 * s) + ' ' + (2 * s) +
      '" stroke="' + RED + '" stroke-width="' + (sw || 10) + '"/>';
  }

  function star(cx, cy, r, fill, stroke, sw) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return '<path d="' + d + 'z" fill="' + (fill || GOLD) + '" stroke="' + (stroke || INK) + '" stroke-width="' + (sw || 3) + '"/>';
  }

  // a bar cut into equal parts, the first ones shaded
  function bar(x, y, w, h, parts, shaded, fill) {
    let s = rect(x, y, w, h, 6, '#FFFFFF', INK, 3);
    const pw = w / parts;
    if (shaded > 0) {
      s += shaded >= parts ? rect(x, y, w, h, 6, fill, INK, 3)
        : '<path d="M' + (x + 6) + ' ' + y + 'h' + (pw * shaded - 6) + 'v' + h + 'h' + (6 - pw * shaded) + 'a6 6 0 0 1 -6 -6v' + (12 - h) + 'a6 6 0 0 1 6 -6z" fill="' + fill + '"/>';
    }
    for (let i = 1; i < parts; i++) s += '<path d="M' + (x + i * pw) + ' ' + y + 'v' + h + '" ' + o + '/>';
    return s + rect(x, y, w, h, 6, 'none', INK, 3);
  }

  // a circle cut into equal parts from the top, clockwise, the first ones shaded
  function pie(cx, cy, r, parts, shaded, fill) {
    let s = circ(cx, cy, r, shaded >= parts ? fill : '#FFFFFF', INK, 3);
    const pt = function (i) { const a = -Math.PI / 2 + i * 2 * Math.PI / parts; return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); };
    if (shaded < parts) for (let i = 0; i < shaded; i++) s += '<path d="M' + cx + ' ' + cy + 'L' + pt(i) + 'A' + r + ' ' + r + ' 0 0 1 ' + pt(i + 1) + 'z" fill="' + fill + '"/>';
    for (let i = 0; i < parts; i++) s += '<path d="M' + cx + ' ' + cy + 'L' + pt(i) + '" ' + o + '/>';
    return s + circ(cx, cy, r, 'none', INK, 3);
  }

  const ART = {};

  const BLUE = '#2F7FD4', DEEP = '#1F5CA0', PALE = '#E3F0FC', GREEN = '#1E9E6A', PINK = '#E0548A';

  // the row of four number cards used by the first three pictures
  function row(y, h, list, hl, col) {
    let s = '';
    list.forEach(function (t, i) { s += card(30 + i * 88, y, 72, h, t, col || BLUE, i === hl, 44); });
    return s;
  }

  // a number line with ticks and labels: xs and labels are lists
  function line(y, x1, x2, xs, labels, size) {
    let s = '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" stroke="' + INK + '" stroke-width="4"/>';
    xs.forEach(function (x, i) {
      s += '<path d="M' + x + ' ' + (y - 11) + 'v22" ' + o + '/>';
      if (labels[i] !== '') s += txt(x, y + 16 + size, size, labels[i]);
    });
    return s;
  }

  /* ---------- the row, one card, one place ---------- */

  ART['w-sequence'] = word('w-sequence', 'Number cards in a row: 2, 5, 8, 11 and three dots. The numbers go on in the same way.',
    rect(6, 78, 388, 144, 22, PALE, '#BFD9F5', 3) +
    card(18, 98, 74, 104, '2', BLUE, false, 54) + card(100, 98, 74, 104, '5', BLUE, false, 54) +
    card(182, 98, 74, 104, '8', BLUE, false, 54) + card(264, 98, 74, 104, '11', BLUE, false, 54) +
    circ(352, 186, 5.5, DEEP, DEEP, 1) + circ(366, 186, 5.5, DEEP, DEEP, 1) + circ(380, 186, 5.5, DEEP, DEEP, 1));

  ART['w-term'] = word('w-term', 'Number cards 2, 5, 8 and 11 in a row. A gold arrow points at one card: the 8.',
    row(136, 100, ['2', '5', '8', '11'], 2) +
    rect(199, 129, 86, 114, 16, 'none', GOLD, 5) +
    arrow(242, 28, 242, 108, GOLD, 12));

  ART['w-position'] = word('w-position', 'Number cards 2, 5, 8 and 11 with the small numbers 1, 2, 3 and 4 under them. The small number 3 is gold: the third place.',
    (function () {
      let s = row(34, 96, ['2', '5', '8', '11'], -1, '#8FB6E3');
      for (let i = 0; i < 4; i++) {
        const cx = 66 + i * 88, on = i === 2;
        s += '<path d="M' + cx + ' 136v' + (on ? 22 : 30) + '" stroke="' + (on ? GOLD : '#8FB6E3') + '" stroke-width="5"/>' +
          circ(cx, 200, on ? 38 : 28, on ? GOLD : '#FFFFFF', on ? INK : DEEP, on ? 4 : 4) +
          txt(cx, on ? 218 : 213, on ? 50 : 36, String(i + 1), on ? INK : DEEP);
      }
      return s + arrow(242, 292, 242, 252, GOLD, 9);
    })());

  /* ---------- rules ---------- */

  ART['w-rule'] = word('w-rule', 'A machine with + 3 on it. The number 5 goes in and the number 8 comes out.',
    card(18, 108, 78, 84, '5', BLUE, false, 50) + arrow(104, 150, 136, 150, INK, 7) +
    '<path d="M200 62v-22" ' + o + '/>' + circ(200, 34, 9, GOLD, INK, 3) +
    rect(160, 236, 22, 16, 4, DEEP, INK, 3) + rect(218, 236, 22, 16, 4, DEEP, INK, 3) +
    rect(144, 62, 112, 176, 18, BLUE, INK, 3) +
    rect(158, 104, 84, 84, 14, SOFT, INK, 3) + txt(200, 164, 50, '+3') +
    circ(170, 84, 6, '#FFFFFF', INK, 3) + circ(190, 84, 6, '#FFFFFF', INK, 3) +
    '<path d="M162 212h76" stroke="#FFFFFF" stroke-width="6" opacity=".7"/>' +
    arrow(264, 150, 296, 150, INK, 7) + card(304, 108, 78, 84, '8', BLUE, false, 50));

  ART['w-term-to-term-rule'] = word('w-term-to-term-rule', 'Number cards 4, 7, 10 and 13. A jump marked + 3 goes from each card to the next card.',
    (function () {
      let s = row(170, 96, ['4', '7', '10', '13'], -1);
      for (let i = 0; i < 3; i++) {
        s += hop(72 + i * 88, 148 + i * 88, 158, 34, GOLD, 7) + pill(110 + i * 88, 76, 74, 50, '+3', GOLD, INK, 34);
      }
      return s;
    })());

  ART['w-position-to-term-rule'] = word('w-position-to-term-rule', 'A table. Top row: 1, 2, 3, 4 in circles. Bottom row: the cards 3, 6, 9, 12. An arrow marked times 3 goes down from the top row to the bottom row.',
    (function () {
      let s = rect(104, 20, 284, 84, 18, PALE, '#BFD9F5', 3) + rect(104, 186, 284, 96, 18, PALE, '#BFD9F5', 3);
      ['3', '6', '9', '12'].forEach(function (t, i) {
        const cx = 144 + i * 68;
        s += circ(cx, 62, 27, '#FFFFFF', DEEP, 4) + txt(cx, 75, 36, String(i + 1), DEEP) +
          arrow(cx, 112, cx, 176, '#8FB6E3', 6) + card(cx - 29, 198, 58, 72, t, BLUE, false, 38);
      });
      return s + arrow(52, 34, 52, 100, GOLD, 10) + pill(52, 150, 88, 64, TIMES + '3', GOLD, INK, 42) + arrow(52, 200, 52, 270, GOLD, 10);
    })());

  /* ---------- jumps ---------- */

  ART['w-constant'] = word('w-constant', 'A number line from 1 to 2.5 with three jumps. Every jump is the same size: + 0.5, + 0.5, + 0.5.',
    (function () {
      let s = line(196, 24, 376, [50, 150, 250, 350], ['1', '1.5', '2', '2.5'], 34);
      for (let i = 0; i < 3; i++) {
        s += hop(54 + i * 100, 146 + i * 100, 184, 38, BLUE, 7) + pill(100 + i * 100, 78, 90, 50, '+0.5', GOLD, INK, 30);
      }
      return s;
    })());

  ART['w-count-on'] = word('w-count-on', 'A number line from 3 to 7. Green jumps go to the right from 3: 4, 5, 6, 7. A big arrow points right.',
    (function () {
      let s = line(150, 20, 380, [50, 125, 200, 275, 350], ['3', '4', '5', '6', '7'], 36);
      for (let i = 0; i < 4; i++) s += hop(54 + i * 75, 121 + i * 75, 138, 40, GREEN, 7);
      return s + circ(50, 150, 13, GOLD, INK, 3) + arrow(110, 258, 290, 258, GREEN, 16);
    })());

  ART['w-count-back'] = word('w-count-back', 'A number line from 3 to 7. Pink jumps go to the left from 7: 6, 5, 4, 3. A big arrow points left.',
    (function () {
      let s = line(150, 20, 380, [50, 125, 200, 275, 350], ['3', '4', '5', '6', '7'], 36);
      for (let i = 0; i < 4; i++) s += hop(346 - i * 75, 279 - i * 75, 138, 40, PINK, 7);
      return s + circ(350, 150, 13, GOLD, INK, 3) + arrow(290, 258, 110, 258, PINK, 16);
    })());

  /* ---------- kinds of number ---------- */

  ART['w-negative-number'] = word('w-negative-number', 'A number line from minus 4 to 4. The side below zero is blue. A gold ring and an arrow mark minus 3.',
    (function () {
      const xs = [], ls = [];
      for (let i = -4; i <= 4; i++) { xs.push(200 + i * 42); ls.push(i < 0 ? '' : String(i)); }
      let s = rect(10, 120, 190, 130, 16, '#D6E9FB', '#BFD9F5', 3) +
        circ(74, 216, 25, SOFT, GOLD, 5) + line(170, 14, 386, xs, ls, 26);
      for (let i = -4; i < 0; i++) s += txt(200 + i * 42 - 3, 225, 26, MINUS + (-i), DEEP);
      return s + '<path d="M200 150v40" stroke="' + INK + '" stroke-width="6"/>' +
        card(30, 14, 88, 66, MINUS + '3', DEEP, true, 44) + arrow(74, 90, 74, 150, GOLD, 9);
    })());

  ART['w-square-number'] = word('w-square-number', 'Three squares made of dots: 1 dot, 4 dots in 2 rows of 2, and 9 dots in 3 rows of 3. Under them: 1, 4, 9.',
    (function () {
      let s = '', x = 34;
      [1, 2, 3].forEach(function (n) {
        const side = n * 38 + 12, y = 196 - side;
        s += rect(x, y, side, side, 10, n === 3 ? SOFT : PALE, n === 3 ? GOLD : BLUE, 4);
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) s += circ(x + 25 + c * 38, y + 25 + r * 38, 13, BLUE, INK, 3);
        s += txt(x + side / 2, 262, 50, String(n * n));
        x += side + 40;
      });
      return s;
    })());

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

