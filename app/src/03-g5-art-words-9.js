/* 03-g5-art-words-9.js - the Stop 9 word card pictures (Mode, median, mean and range), flat style of 03-art-words.js.

   w-data, w-data-set, w-average                 numbers that are collected (viewBox 400 x 300)
   w-mode, w-bimodal, w-median, w-mean           the kinds of typical value
   w-range, w-total, w-frequency                 spread, sum, how many times

   Stop colours: slate blue #5B8CA8 / #3C6880; gold #F5A623 points at the thing meant.
   No word is written in a picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const SLATE = '#5B8CA8', SLATE_D = '#3C6880', SLATE_L = '#DCE9F1', GOLD = '#F5A623', GOLD_L = '#FFF1CF';
  const TEAL = '#17A2B0', BLUE = '#2F7FD4', PINK = '#E0548A', PINK_L = '#FBDDE8', AMBER = '#E89B12';

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

  const f = function (n) { return (Math.round(n * 10) / 10).toString(); };

  // a number card; kind: 0 plain slate, 1 gold, 2 pink
  function card(x, y, w, h, n, kind) {
    const st = [SLATE_D, GOLD, PINK][kind || 0], fl = ['#FFFFFF', GOLD_L, PINK_L][kind || 0], size = Math.min(h * 0.62, w * 0.8);
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" fill="' + fl + '" stroke="' + st + '" stroke-width="5"/>' +
      txt(x + w / 2, y + h / 2 + size * 0.36, size, n, kind ? INK : SLATE_D);
  }

  function arrow(a, b, color, sw, both) {
    const w = sw || 6, L = 15;
    const head = function (p, q) {
      const t = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const e = function (d) { return f(q[0] - L * Math.cos(t + d)) + ' ' + f(q[1] - L * Math.sin(t + d)); };
      return '<path d="M' + e(0.55) + 'L' + f(q[0]) + ' ' + f(q[1]) + 'L' + e(-0.55) + '" stroke="' + (color || INK) + '" stroke-width="' + w + '"/>';
    };
    return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + (color || INK) + '" stroke-width="' + w + '"/>' +
      head(a, b) + (both ? head(b, a) : '');
  }

  // n tally marks from x on the base line y (a bundle of five has a stroke across)
  function tally(x, y, n, h, color) {
    let s = '', cx = x;
    for (let g = 0; g < Math.ceil(n / 5); g++) {
      const k = Math.min(5, n - g * 5), m = Math.min(k, 4);
      for (let i = 0; i < m; i++) s += '<path d="M' + (cx + i * 11) + ' ' + (y - h) + 'v' + h + '" stroke="' + (color || INK) + '" stroke-width="5"/>';
      if (k === 5) s += '<path d="M' + (cx - 7) + ' ' + (y - h * 0.22) + 'L' + (cx + 40) + ' ' + (y - h * 0.78) + '" stroke="' + (color || INK) + '" stroke-width="5"/>';
      cx += 62;
    }
    return s;
  }

  // a square bracket under (or over) a group of cards, open towards the cards
  function bracket(x1, x2, y, d, color) {
    return '<path d="M' + x1 + ' ' + (y - d) + 'V' + y + 'H' + x2 + 'V' + (y - d) + '" stroke="' + color + '" stroke-width="6"/>';
  }

  // a tower of n blocks standing on the line y; the top `hi` blocks are gold
  function tower(x, y, n, hi) {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += '<rect x="' + x + '" y="' + (y - (i + 1) * 32) + '" width="38" height="32" rx="4" fill="' + (i >= n - hi ? GOLD : SLATE) + '" ' + o + '/>';
    }
    return s;
  }

  const ART = {};

  /* ---------- numbers that are collected ---------- */

  ART['w-data'] = word('w-data', 'A clipboard with a tally chart: three rows of tally marks that someone has collected, and a pencil.',
    '<rect x="78" y="34" width="204" height="252" rx="16" fill="' + SLATE + '" ' + o + '/>' +
    '<rect x="94" y="56" width="172" height="216" rx="6" fill="#FFFFFF" ' + o + '/>' +
    '<rect x="138" y="20" width="84" height="40" rx="10" fill="#B8C4D2" ' + o + '/><circle cx="180" cy="34" r="7" fill="#FFFFFF" ' + o + '/>' +
    '<path d="M94 132h172M94 200h172" stroke="' + INK + '" stroke-width="1.4" opacity=".45"/>' +
    '<circle cx="122" cy="100" r="13" fill="' + BLUE + '" ' + o + '/>' + tally(152, 118, 7, 36) +
    '<circle cx="122" cy="166" r="13" fill="' + PINK + '" ' + o + '/>' + tally(152, 184, 4, 36) +
    '<circle cx="122" cy="236" r="13" fill="' + TEAL + '" ' + o + '/>' + tally(152, 254, 5, 36) +
    '<g transform="rotate(28 330 150)"><rect x="318" y="62" width="24" height="130" rx="3" fill="' + AMBER + '" ' + o + '/>' +
    '<path d="M318 192h24l-12 30z" fill="#FBE3B4" ' + o + '/><path d="M326 212h8l-4 10z" fill="' + INK + '"/>' +
    '<rect x="318" y="50" width="24" height="18" rx="3" fill="' + PINK + '" ' + o + '/></g>');

  ART['w-data-set'] = word('w-data-set', 'Five number cards kept together inside curly brackets: 3, 5, 5, 7 and 9.',
    (function () {
      const brace = function (x, k) {
        return '<path d="M' + (x + 24 * k) + ' 62C' + (x + 4 * k) + ' 62 ' + (x + 12 * k) + ' 92 ' + (x + 12 * k) + ' 112C' + (x + 12 * k) + ' 134 ' + (x + 6 * k) + ' 146 ' + (x - 6 * k) + ' 150C' +
          (x + 6 * k) + ' 154 ' + (x + 12 * k) + ' 166 ' + (x + 12 * k) + ' 188C' + (x + 12 * k) + ' 208 ' + (x + 4 * k) + ' 238 ' + (x + 24 * k) + ' 238" stroke="' + GOLD + '" stroke-width="9"/>';
      };
      let s = '<rect x="46" y="84" width="308" height="132" rx="16" fill="' + SLATE_L + '"/>';
      ['3', '5', '5', '7', '9'].forEach(function (n, i) { s += card(58 + i * 58, 110, 52, 80, n); });
      return s + brace(18, 1) + brace(382, -1);
    })());

  ART['w-average'] = word('w-average', 'Five number cards: 4, 7, 5, 3 and 6. Arrows from all of them point to one gold card, 5, that stands for the whole group.',
    (function () {
      let s = '';
      ['4', '7', '5', '3', '6'].forEach(function (n, i) {
        const x = 30 + i * 72;
        s += card(x, 24, 52, 62, n) + arrow([x + 26 + (2 - i) * 6, 98], [200 + (i - 2) * 26, 168], SLATE, 5);
      });
      return s + '<rect x="150" y="180" width="100" height="100" rx="18" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="7"/>' + txt(200, 254, 68, '5');
    })());

  /* ---------- the kinds of typical value ---------- */

  ART['w-mode'] = word('w-mode', 'Number cards 3, 5, 5, 5 and 8. The three gold 5 cards are stacked in one tall pile: 5 comes up most often.',
    '<path d="M40 252h320" ' + o + '/>' +
    card(72, 186, 64, 62, '3') +
    card(168, 186, 64, 62, '5', 1) + card(168, 118, 64, 62, '5', 1) + card(168, 50, 64, 62, '5', 1) +
    card(264, 186, 64, 62, '8') +
    arrow([330, 116], [248, 116], GOLD, 8));

  ART['w-bimodal'] = word('w-bimodal', 'Number cards 2, 2, 6, 9 and 9. The two gold 2 cards and the two pink 9 cards make two piles of the same height.',
    '<path d="M40 252h320" ' + o + '/>' +
    card(72, 186, 64, 62, '2', 1) + card(72, 118, 64, 62, '2', 1) +
    card(168, 186, 64, 62, '6') +
    card(264, 186, 64, 62, '9', 2) + card(264, 118, 64, 62, '9', 2) +
    arrow([104, 52], [104, 104], GOLD, 7) + arrow([296, 52], [296, 104], PINK, 7));

  ART['w-median'] = word('w-median', 'Number cards in order: 2, 4, 6, 8 and 9. The middle card, 6, is gold. A bracket holds two cards on its left and two cards on its right.',
    card(14, 112, 60, 76, '2') + card(84, 112, 60, 76, '4') +
    card(160, 98, 80, 104, '6', 1) +
    card(256, 112, 60, 76, '8') + card(326, 112, 60, 76, '9') +
    bracket(18, 140, 224, 20, SLATE) + bracket(260, 382, 224, 20, SLATE) +
    txt(79, 272, 34, '2', SLATE_D) + txt(321, 272, 34, '2', SLATE_D) +
    arrow([200, 30], [200, 82], GOLD, 8));

  ART['w-mean'] = word('w-mean', 'Three block towers of 2, 6 and 4 blocks. An arrow shows the blocks shared out: three equal towers of 4 blocks.',
    '<path d="M8 268h130M258 268h134" ' + o + '/>' +
    tower(12, 266, 2, 0) + tower(54, 266, 6, 2) + tower(96, 266, 4, 0) +
    arrow([156, 190], [238, 190], INK, 9) +
    tower(262, 266, 4, 2) + tower(304, 266, 4, 0) + tower(346, 266, 4, 0) +
    '<path d="M254 138h140" stroke="' + PINK + '" stroke-width="5" stroke-dasharray="10 9"/>');

  /* ---------- spread, sum, how many times ---------- */

  ART['w-range'] = word('w-range', 'A number line from 0 to 10. The smallest number, 2, and the biggest number, 9, are marked. A gold arrow between them shows 9 minus 2.',
    (function () {
      const X = function (n) { return 30 + n * 34; };
      let s = '<path d="M20 196h360" stroke="' + INK + '" stroke-width="5"/>';
      for (let i = 0; i <= 10; i++) s += '<path d="M' + X(i) + ' 184v24" ' + o + '/>';
      return s + txt(200, 78, 62, '9 − 2') +
        arrow([X(2) + 4, 130], [X(9) - 4, 130], GOLD, 10, true) +
        '<path d="M' + X(2) + ' 112v84M' + X(9) + ' 112v84" stroke="' + INK + '" stroke-width="3" stroke-dasharray="6 7"/>' +
        '<circle cx="' + X(2) + '" cy="196" r="13" fill="' + BLUE + '" ' + o + '/><circle cx="' + X(9) + '" cy="196" r="13" fill="' + PINK + '" ' + o + '/>' +
        txt(X(2), 262, 48, '2', BLUE) + txt(X(9), 262, 48, '9', PINK);
    })());

  ART['w-total'] = word('w-total', 'Counters in three groups: 3 plus 5 plus 4. Added together they make 12, in a gold box.',
    (function () {
      const dots = function (cx, n, col) {
        let s = '';
        for (let i = 0; i < n; i++) s += '<circle cx="' + cx + '" cy="' + (150 - i * 26) + '" r="11" fill="' + col + '" ' + o + '/>';
        return s;
      };
      return dots(44, 3, BLUE) + dots(134, 5, PINK) + dots(224, 4, TEAL) +
        txt(44, 240, 60, '3', BLUE) + txt(89, 236, 48, '+') + txt(134, 240, 60, '5', PINK) + txt(179, 236, 48, '+') + txt(224, 240, 60, '4', TEAL) +
        txt(265, 236, 48, '=') +
        '<rect x="290" y="172" width="100" height="92" rx="18" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="7"/>' + txt(340, 240, 60, '12');
    })());

  ART['w-frequency'] = word('w-frequency', 'A table with three rows of tally marks. The last column is gold and gives the count for each row: 4, 7 and 3.',
    (function () {
      const rows = [[BLUE, 4], [PINK, 7], [TEAL, 3]];
      let s = '<rect x="24" y="30" width="352" height="240" fill="#FFFFFF"/><rect x="280" y="30" width="96" height="240" fill="' + GOLD_L + '"/>';
      rows.forEach(function (r, i) {
        const y = 30 + i * 80;
        s += '<circle cx="64" cy="' + (y + 40) + '" r="17" fill="' + r[0] + '" ' + o + '/>' + tally(126, y + 62, r[1], 44) +
          txt(328, y + 60, 56, String(r[1]));
      });
      return s + '<path d="M24 110h352M24 190h352M104 30v240M280 30v240" ' + o + '/>' +
        '<rect x="24" y="30" width="352" height="240" rx="4" ' + o + '/>' +
        '<rect x="280" y="30" width="96" height="240" rx="4" stroke="' + GOLD + '" stroke-width="7"/>';
    })());

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

