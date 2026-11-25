/* 03-g5-art-words-6.js - the Stop 6 word card pictures (Fractions, decimals and percentages), flat style of 03-art-words.js.

   w-percentage, w-per-cent, w-equivalent, w-convert            the three forms of one number (viewBox 400 x 300)
   w-compare, w-greater-than, w-less-than                       which is bigger
   w-ascending-order, w-descending-order, w-discount            put in order, take money off

   Stop colours: violet #7C5FD8 / #5940A8; gold #F5A623 points at the thing meant. Fractions are stacked.
   No word is written in a picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const thin = 'stroke="' + INK + '" stroke-width="1.4" opacity=".45"';
  const VIO = '#7C5FD8', VIO_D = '#5940A8', VIO_L = '#E4DCFA', GOLD = '#F5A623', GOLD_L = '#FFF1CF';
  const TEAL = '#17A2B0', BLUE = '#2F7FD4', PINK = '#E0548A', RED = '#D22630';

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

  // a stacked fraction centred on (cx, cy): numerator, bar, denominator
  function frac(cx, cy, size, n, d, fill) {
    const w = Math.max(String(n).length, String(d).length) * size * 0.6 + size * 0.3;
    return txt(cx, cy - size * 0.22, size, n, fill) +
      '<path d="M' + (cx - w / 2) + ' ' + cy + 'h' + w + '" stroke="' + (fill || INK) + '" stroke-width="' + Math.max(3, size / 9) + '"/>' +
      txt(cx, cy + size * 0.92, size, d, fill);
  }

  // a number card; the text sits in the middle
  function card(x, y, w, h, stroke, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + (fill || '#FFFFFF') +
      '" stroke="' + stroke + '" stroke-width="5"/>';
  }

  function numCard(x, y, w, h, text, col, size, fill) {
    return card(x, y, w, h, col, fill) + txt(x + w / 2, y + h / 2 + size * 0.36, size, text, col);
  }

  function fracCard(x, y, w, h, n, d, col, size, fill) {
    return card(x, y, w, h, col, fill) + frac(x + w / 2, y + h / 2, size, n, d, col);
  }

  function arrow(x1, y1, x2, y2, color, sw) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = 18, w = sw || 7;
    const p = function (t) { return (x2 - L * Math.cos(a + t)).toFixed(1) + ' ' + (y2 - L * Math.sin(a + t)).toFixed(1); };
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + (color || INK) + '" stroke-width="' + w + '"/>' +
      '<path d="M' + p(0.55) + 'L' + x2 + ' ' + y2 + 'L' + p(-0.55) + '" stroke="' + (color || INK) + '" stroke-width="' + w + '"/>';
  }

  // a hundred square: n x n cells, the cells in `on` (a function of column, row) are filled
  function hundred(x, y, size, on, fill) {
    const c = size / 10;
    let s = '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="#FFFFFF"/>';
    for (let r = 0; r < 10; r++) for (let k = 0; k < 10; k++) {
      if (on(k, r)) s += '<rect x="' + (x + k * c) + '" y="' + (y + r * c) + '" width="' + c + '" height="' + c + '" fill="' + fill + '"/>';
    }
    for (let i = 1; i < 10; i++) {
      s += '<path d="M' + (x + i * c) + ' ' + y + 'v' + size + 'M' + x + ' ' + (y + i * c) + 'h' + size + '" ' + thin + '/>';
    }
    return s + '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" ' + o + '/>';
  }

  // a bar that stands on the line y = base
  function bar(x, base, w, h, fill) {
    return '<rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" rx="6" fill="' + fill + '" ' + o + '/>';
  }

  const ART = {};

  /* ---------- the three forms ---------- */

  ART['w-percentage'] = word('w-percentage', 'A hundred square with 25 of its 100 small squares shaded. It shows 25%.',
    hundred(24, 35, 230, function (k, r) { return k < 5 && r < 5; }, VIO) +
    '<rect x="24" y="35" width="115" height="115" stroke="' + VIO_D + '" stroke-width="5"/>' +
    '<rect x="270" y="112" width="118" height="76" rx="16" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="5"/>' +
    txt(329, 167, 46, '25%', VIO_D));

  ART['w-per-cent'] = word('w-per-cent', 'A big % sign. It is the same as an empty box over 100: so many out of 100.',
    '<circle cx="78" cy="96" r="34" fill="#FFFFFF" stroke="' + VIO + '" stroke-width="20"/>' +
    '<circle cx="178" cy="204" r="34" fill="#FFFFFF" stroke="' + VIO + '" stroke-width="20"/>' +
    '<path d="M184 56L72 244" stroke="' + VIO + '" stroke-width="22"/>' +
    txt(258, 172, 60, '=') +
    '<rect x="306" y="52" width="64" height="64" rx="10" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="5" stroke-dasharray="11 9"/>' +
    '<path d="M286 150h104" stroke="' + INK + '" stroke-width="7"/>' +
    txt(338, 234, 60, '100'));

  ART['w-equivalent'] = word('w-equivalent', 'One half = 0.5 = 50%. Three cards with the same value, joined by equals signs.',
    (function () {
      const half = function (x, col) {
        return '<rect x="' + x + '" y="196" width="100" height="26" rx="6" fill="#FFFFFF" ' + o + '/>' +
          '<path d="M' + (x + 6) + ' 196h44v26h-44a6 6 0 0 1-6-6v-14a6 6 0 0 1 6-6z" fill="' + col + '" ' + o + '/>';
      };
      return fracCard(14, 74, 100, 104, '1', '2', BLUE, 38) + half(14, BLUE) +
        txt(132, 142, 44, '=', GOLD) +
        numCard(150, 74, 100, 104, '0.5', TEAL, 42) + half(150, TEAL) +
        txt(268, 142, 44, '=', GOLD) +
        numCard(286, 74, 100, 104, '50%', VIO_D, 38) + half(286, VIO);
    })());

  ART['w-convert'] = word('w-convert', '0.25 goes through a machine with turning arrows and comes out as 25%.',
    numCard(14, 108, 118, 84, '0.25', TEAL, 40) +
    arrow(140, 150, 166, 150, GOLD, 8) +
    '<rect x="176" y="96" width="74" height="108" rx="16" fill="' + VIO + '" ' + o + '/>' +
    '<path d="M196 138a18 18 0 0 1 34 4" stroke="#FFFFFF" stroke-width="5"/><path d="M233 130l-2 13-12-5" stroke="#FFFFFF" stroke-width="5"/>' +
    '<path d="M230 162a18 18 0 0 1-34-4" stroke="#FFFFFF" stroke-width="5"/><path d="M193 170l2-13 12 5" stroke="#FFFFFF" stroke-width="5"/>' +
    arrow(256, 150, 284, 150, GOLD, 8) +
    numCard(292, 108, 100, 84, '25%', VIO_D, 38, GOLD_L));

  /* ---------- which is bigger ---------- */

  ART['w-compare'] = word('w-compare', 'A balance with 0.7 on one side and 0.4 on the other side, and a question mark above.',
    '<path d="M200 96v150" stroke="' + INK + '" stroke-width="8"/>' +
    '<path d="M150 262h100l-12-18h-76z" fill="' + VIO + '" ' + o + '/>' +
    '<path d="M70 132L330 92" stroke="' + INK + '" stroke-width="8"/>' +
    '<path d="M70 132l-40 78M70 132l40 78M330 92l-40 78M330 92l40 78" ' + o + '/>' +
    '<path d="M22 210h96a48 30 0 0 1-96 0z" fill="' + VIO_L + '" ' + o + '/>' +
    '<path d="M282 170h96a48 30 0 0 1-96 0z" fill="' + VIO_L + '" ' + o + '/>' +
    numCard(32, 150, 76, 56, '0.7', BLUE, 32) +
    numCard(292, 110, 76, 56, '0.4', PINK, 32) +
    '<circle cx="200" cy="52" r="36" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="5"/>' + txt(200, 71, 52, '?', INK) +
    '<circle cx="200" cy="112" r="9" fill="' + GOLD + '" ' + o + '/>');

  ART['w-greater-than'] = word('w-greater-than', 'A tall bar for 0.8, then the sign >, then a short bar for 0.5. The open end of the sign faces the bigger number.',
    '<path d="M20 222h360" ' + o + '/>' +
    bar(40, 222, 76, 176, VIO) + bar(284, 222, 76, 110, VIO_L) +
    '<path d="M158 76l88 58-88 58" stroke="' + GOLD + '" stroke-width="22"/>' +
    txt(78, 270, 40, '0.8') + txt(322, 270, 40, '0.5'));

  ART['w-less-than'] = word('w-less-than', 'A short bar for 0.3, then the sign <, then a tall bar for 0.6. The point of the sign faces the smaller number.',
    '<path d="M20 222h360" ' + o + '/>' +
    bar(40, 222, 76, 66, VIO_L) + bar(284, 222, 76, 132, VIO) +
    '<path d="M246 76l-88 58 88 58" stroke="' + TEAL + '" stroke-width="22"/>' +
    txt(78, 270, 40, '0.3') + txt(322, 270, 40, '0.6'));

  /* ---------- order and money off ---------- */

  // three steps; up = true climbs to the right
  function stairs(up) {
    const tops = up ? [232, 172, 112] : [112, 172, 232];
    let d = 'M20 282';
    tops.forEach(function (t, i) { d += 'V' + t + 'H' + (140 + i * 120); });
    return '<path d="' + d + 'V282z" fill="' + VIO_L + '" ' + o + '/>' +
      tops.map(function (t, i) {
        return '<path d="M' + (20 + i * 120) + ' ' + t + 'h120" stroke="' + VIO_D + '" stroke-width="7"/>';
      }).join('');
  }

  ART['w-ascending-order'] = word('w-ascending-order', 'Three cards climb the stairs from the smallest to the biggest: 10%, 0.3 and one half. An arrow points up.',
    stairs(true) +
    numCard(32, 164, 96, 64, '10%', VIO_D, 34) +
    numCard(152, 104, 96, 64, '0.3', TEAL, 36) +
    fracCard(272, 30, 96, 78, '1', '2', BLUE, 28) +
    arrow(40, 122, 128, 52, GOLD, 9));

  ART['w-descending-order'] = word('w-descending-order', 'Three cards go down the stairs from the biggest to the smallest: one half, 0.3 and 10%. An arrow points down.',
    stairs(false) +
    fracCard(32, 30, 96, 78, '1', '2', BLUE, 28) +
    numCard(152, 104, 96, 64, '0.3', TEAL, 36) +
    numCard(272, 164, 96, 64, '10%', VIO_D, 34) +
    arrow(272, 52, 360, 122, PINK, 9));

  ART['w-discount'] = word('w-discount', 'A price tag. The old price, 40 dollars, is crossed out. A gold badge shows minus 25%.',
    '<path d="M62 150l70-92h188a16 16 0 0 1 16 16v152a16 16 0 0 1-16 16H132z" fill="#FFFFFF" stroke="' + VIO_D + '" stroke-width="6"/>' +
    '<circle cx="116" cy="150" r="13" fill="' + VIO_L + '" ' + o + '/>' +
    '<path d="M104 150C70 150 50 130 16 138" ' + o + '/>' +
    txt(232, 126, 56, '$40', INK) +
    '<path d="M166 122l134-30" stroke="' + RED + '" stroke-width="9"/>' +
    '<rect x="160" y="150" width="150" height="72" rx="36" fill="' + GOLD + '" ' + o + '/>' +
    txt(235, 202, 44, '−25%', INK));

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

