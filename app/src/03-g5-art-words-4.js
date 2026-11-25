/* 03-g5-art-words-4.js - the Stop 4 word card pictures (Common multiples and factors), flat style of 03-art-words.js.

   w-multiple, w-factor, w-factor-pair                     jumps of 4 on a line, 12 dots in 3 rows, 12 split into 2 x 6
   w-common-multiple, w-lowest-common-multiple             two rows (2 4 6 ... and 3 6 9 12): both shared rings / the first one, with a star
   w-common-factor, w-highest-common-factor                two rings for 8 and 12: 1, 2, 4 in the middle / the 4 on a star
   w-divisible, w-product, w-counter-example               12 / 4 with a tick and 13 / 4 with a cross, 3 x 4 = 12, a claim and 3 + 5 = 8

   viewBox 400 x 300, literal colours (Stop 4 green #43A852 / #2D7C3A, gold #F5A623 points at the thing meant).
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

  const GREEN = '#43A852', DEEP = '#2D7C3A', PALE = '#E3F4E5', BLUE = '#2F7FD4', PINK = '#E0548A', GREY = '#9AA3B2';

  /* ---------- multiples and factors ---------- */

  ART['w-multiple'] = word('w-multiple', 'A number line from 0 to 16 with jumps of 4. The jumps land on 4, 8, 12 and 16, in gold circles.',
    (function () {
      let s = '<path d="M16 150H384" stroke="' + INK + '" stroke-width="4"/>';
      for (let i = 0; i <= 16; i++) s += '<path d="M' + (40 + i * 20) + ' ' + (i % 4 ? 144 : 138) + 'v' + (i % 4 ? 12 : 24) + '" stroke="' + INK + '" stroke-width="' + (i % 4 ? 2 : 3) + '"/>';
      s += txt(40, 212, 34, '0');
      for (let i = 1; i <= 4; i++) {
        const x = 40 + i * 80;
        s += hop(x - 76, x - 4, 134, 42, GREEN, 7) + circ(x, 200, 30, GOLD, INK, 3) + txt(x, 212, 34, String(i * 4));
      }
      return s;
    })());

  ART['w-factor'] = word('w-factor', '12 dots in 3 equal rows of 4. A gold card with the number 3 points at the rows.',
    (function () {
      let s = card(16, 104, 84, 92, '3', DEEP, true, 60) + '<path d="M132 42q-16 0 -16 16v76q0 16 -12 16q12 0 12 16v76q0 16 16 16" stroke="' + GOLD + '" stroke-width="6"/>';
      for (let r = 0; r < 3; r++) {
        s += rect(146, 32 + r * 82, 240, 72, 18, PALE, GREEN, 4);
        for (let c = 0; c < 4; c++) s += circ(182 + c * 56, 68 + r * 82, 21, GREEN, INK, 3);
      }
      return s;
    })());

  ART['w-factor-pair'] = word('w-factor-pair', 'The number 12 in a circle. Two lines go down to two gold cards: 2 times 6.',
    '<path d="M176 100L122 172M224 100L278 172" stroke="' + INK + '" stroke-width="5"/>' +
    circ(200, 70, 54, GREEN, INK, 3) + txt(200, 90, 58, '12', '#FFFFFF') +
    card(72, 172, 100, 104, '2', DEEP, true, 68) + card(228, 172, 100, 104, '6', DEEP, true, 68) +
    txt(200, 244, 56, TIMES));

  /* ---------- shared numbers: two rows for multiples ---------- */

  // the multiples of 2 over the multiples of 3, the same numbers under each other; rings = columns with a gold ring
  function rows(y, rings) {
    const xs = [48, 109, 170, 231, 292, 353];
    let s = rect(8, y - 44, 384, 62, 14, '#E1EEFB', '#BFD9F5', 3) + rect(8, y + 34, 384, 62, 14, '#FBE3EC', '#F2BCD0', 3);
    rings.forEach(function (x) { s += rect(x - 33, y - 54, 66, 160, 22, SOFT, GOLD, 6); });
    ['2', '4', '6', '8', '10', '12'].forEach(function (t, i) { s += txt(xs[i], y, 38, t, '#1F5CA0'); });
    [['3', 109], ['6', 170], ['9', 261], ['12', 353]].forEach(function (t) { s += txt(t[1], y + 78, 38, t[0], '#B02E63'); });
    return s;
  }

  ART['w-common-multiple'] = word('w-common-multiple', 'Two rows of numbers. Top: 2, 4, 6, 8, 10, 12. Bottom: 3, 6, 9, 12. Gold rings go round the numbers that are in both rows: 6 and 12.',
    rows(124, [170, 353]));

  ART['w-lowest-common-multiple'] = word('w-lowest-common-multiple', 'Two rows of numbers. Top: 2, 4, 6, 8, 10, 12. Bottom: 3, 6, 9, 12. One gold ring with a star goes round the first number that is in both rows: 6.',
    rows(156, [170]) + star(170, 52, 44, GOLD, INK, 3));

  /* ---------- shared numbers: two rings for factors ---------- */

  function venn(mid) {
    return circ(150, 172, 104, '#E1EEFB', INK, 3) + circ(250, 172, 104, '#FBE3EC', INK, 3) +
      '<path d="M200 80.8A104 104 0 0 1 200 263.2A104 104 0 0 1 200 80.8z" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="6"/>' +
      circ(150, 172, 104, 'none', INK, 3) + circ(250, 172, 104, 'none', INK, 3) +
      pill(84, 34, 70, 46, '8', BLUE, '#FFFFFF', 34) + pill(316, 34, 80, 46, '12', PINK, '#FFFFFF', 34) +
      txt(92, 186, 40, '8', '#1F5CA0') +
      txt(300, 134, 36, '3', '#B02E63') + txt(316, 186, 36, '6', '#B02E63') + txt(298, 238, 36, '12', '#B02E63') + mid;
  }

  ART['w-common-factor'] = word('w-common-factor', 'Two rings that cross, one for 8 and one for 12. The numbers 1, 2 and 4 are in the gold middle part: they belong to both rings.',
    venn(circ(200, 116, 23, GOLD, INK, 3) + txt(200, 128, 34, '1') + circ(200, 172, 23, GOLD, INK, 3) + txt(200, 184, 34, '2') +
      circ(200, 228, 23, GOLD, INK, 3) + txt(200, 240, 34, '4')));

  ART['w-highest-common-factor'] = word('w-highest-common-factor', 'Two rings that cross, one for 8 and one for 12. In the middle part are 1, 2 and 4. The biggest one, 4, sits on a big gold star.',
    venn(txt(200, 116, 30, '1', '#7A5A12') + txt(200, 258, 30, '2', '#7A5A12') + star(200, 176, 48, GOLD, INK, 3) + txt(200, 192, 42, '4')));

  /* ---------- dividing, multiplying, testing a claim ---------- */

  ART['w-divisible'] = word('w-divisible', 'Left: 12 divided by 4, the dots make 3 equal groups with none left, and a green tick. Right: 13 divided by 4, one dot is left over, and a red cross.',
    (function () {
      function groups(x, col) {
        let s = '';
        for (let g = 0; g < 3; g++) {
          const gx = x + g * 58;
          s += rect(gx, 92, 52, 52, 12, '#FFFFFF', col, 4);
          for (let k = 0; k < 4; k++) s += circ(gx + 15 + (k % 2) * 22, 107 + (k > 1 ? 22 : 0), 8.5, col, INK, 2.5);
        }
        return s;
      }
      return rect(6, 10, 190, 280, 20, SOFT, GOLD, 5) + txt(101, 66, 40, '12 ' + DIV + ' 4') + groups(15, GREEN) +
        circ(101, 216, 46, '#FFFFFF', DEEP, 4) + tick(96, 216, 20, '#1E9E6A', 12) +
        rect(204, 10, 190, 280, 20, '#F3F5F8', GREY, 4) + txt(299, 66, 40, '13 ' + DIV + ' 4') + groups(213, GREY) +
        circ(371, 172, 10, RED, INK, 2.5) +
        circ(299, 216, 46, '#FFFFFF', RED, 4) + cross(299, 216, 19, 12);
    })());

  ART['w-product'] = word('w-product', 'The sum 3 times 4 equals 12. The answer 12 is on a shining gold card.',
    txt(46, 176, 76, '3') + txt(108, 172, 64, TIMES) + txt(170, 176, 76, '4') + txt(232, 172, 64, '=') +
    '<path d="M324 62v-22M258 86l-14 -16M390 86l8 -10M324 238v22M258 214l-14 16M390 214l8 10" stroke="' + GOLD + '" stroke-width="7"/>' +
    card(266, 88, 120, 124, '12', DEEP, true, 76));

  ART['w-counter-example'] = word('w-counter-example', 'A speech bubble says odd + odd = odd, with a red cross on it. Under it, a gold card shows why not: 3 + 5 = 8.',
    '<path d="M70 118l-22 34l52 -34" fill="#FFFFFF" ' + o + '/>' +
    rect(14, 20, 330, 100, 26, '#FFFFFF', INK, 3) + '<path d="M72 118h26" stroke="#FFFFFF" stroke-width="6"/>' +
    txt(160, 82, 34, 'odd + odd = odd') +
    circ(352, 46, 38, '#FFFFFF', RED, 4) + cross(352, 46, 16, 11) +
    rect(64, 176, 300, 108, 18, SOFT, GOLD, 6) + txt(214, 252, 62, '3 + 5 = 8'));

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

