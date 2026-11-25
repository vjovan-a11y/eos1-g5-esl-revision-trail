/* 03-g5-art-words-5.js - the Stop 5 word card pictures (Fractions), flat style of 03-art-words.js.

   w-fraction, w-numerator, w-denominator                  a circle with 3 of 4 parts shaded, the top number, the bottom number
   w-equivalent-fractions, w-simplify, w-simplest-form     two equal bars 1/2 = 2/4, 6/8 to 3/4 with divide-by-2 arrows, 3/4 on a star
   w-proper-fraction, w-improper-fraction, w-mixed-number  3/5 (less than 1), 7/4 (more than 1), 1 and 3/4 with circles
   w-unit-fraction, w-fraction-of-an-amount                1/5 with one part shaded, 3/4 next to 12 counters in 4 groups

   viewBox 400 x 300, literal colours (Stop 5 orange #E0902F / #AC661A, gold #F5A623 points at the thing meant).
   Fractions are stacked (never a slash). No word is written in its picture (the Words quiz asks for the word). */
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

  const ORANGE = '#E0902F', DEEP = '#AC661A', TEAL = '#17A2B0', PINK = '#E0548A', VIOLET = '#7A5BD6', GREEN = '#1E9E6A', GREY = '#9AA3B2';

  /* ---------- the parts of a fraction ---------- */

  ART['w-fraction'] = word('w-fraction', 'A circle cut into 4 equal parts with 3 parts shaded, and the numbers 3 over 4.',
    pie(124, 150, 104, 4, 3, ORANGE) + frac(316, 146, 100, '3', '4'));

  ART['w-numerator'] = word('w-numerator', 'The numbers 3 over 4. The top number, 3, is in a gold circle and a gold arrow points at it.',
    circ(140, 84, 62, SOFT, GOLD, 6) + frac(140, 150, 112, '3', '4', INK, GREY, GREY) +
    arrow(340, 84, 222, 84, GOLD, 14));

  ART['w-denominator'] = word('w-denominator', 'The numbers 3 over 4. The bottom number, 4, is in a gold circle. An arrow joins it to a bar cut into 4 equal parts.',
    (function () {
      let s = circ(96, 216, 62, SOFT, GOLD, 6) + frac(96, 150, 112, '3', '4', GREY, INK, GREY) +
        arrow(222, 216, 172, 216, GOLD, 11) + bar(232, 184, 160, 64, 4, 0, ORANGE);
      for (let i = 0; i < 4; i++) s += txt(252 + i * 40, 226, 28, String(i + 1), DEEP);
      return s;
    })());

  /* ---------- same value, smaller numbers ---------- */

  ART['w-equivalent-fractions'] = word('w-equivalent-fractions', 'Two bars of the same length. One half of the top bar is shaded and two quarters of the bottom bar: the same amount. Under them: 1 over 2 equals 2 over 4.',
    bar(30, 16, 340, 54, 2, 1, ORANGE) + bar(30, 82, 340, 54, 4, 2, TEAL) +
    '<path d="M200 8v136" stroke="' + GOLD + '" stroke-width="5" stroke-dasharray="2 11"/>' +
    frac(112, 216, 70, '1', '2', DEEP, DEEP, DEEP) + txt(200, 238, 66, '=') + frac(288, 216, 70, '2', '4', '#0E7A85', '#0E7A85', '#0E7A85'));

  ART['w-simplify'] = word('w-simplify', '6 over 8 changes into 3 over 4. One arrow marked divide by 2 goes from 6 to 3 and one from 8 to 4.',
    frac(84, 150, 92, '6', '8') + frac(316, 150, 92, '3', '4', DEEP, DEEP, DEEP) +
    hop(130, 270, 92, 30, GOLD, 8) + pill(200, 36, 96, 48, DIV + '2', GOLD, INK, 34) +
    hop(130, 270, 208, -30, GOLD, 8) + pill(200, 264, 96, 48, DIV + '2', GOLD, INK, 34));

  ART['w-simplest-form'] = word('w-simplest-form', '3 over 4 on a big gold star with a green tick: the numbers cannot be made smaller. A small bar shows 3 of 4 parts shaded.',
    star(150, 150, 142, SOFT, GOLD, 7) + frac(150, 142, 84, '3', '4') +
    circ(318, 76, 44, GREEN, INK, 3) + tick(313, 76, 19, '#FFFFFF', 12) +
    bar(262, 196, 128, 46, 4, 3, ORANGE));

  /* ---------- less than 1, more than 1 ---------- */

  ART['w-proper-fraction'] = word('w-proper-fraction', '3 over 5 and one bar with 3 of its 5 parts shaded. It is less than 1.',
    frac(70, 150, 100, '3', '5') + bar(150, 62, 236, 76, 5, 3, ORANGE) + txt(268, 236, 64, '&lt; 1', DEEP));

  ART['w-improper-fraction'] = word('w-improper-fraction', '7 over 4 and two bars cut into quarters: one bar is all shaded and 3 parts of the other. It is more than 1.',
    frac(70, 150, 100, '7', '4') + bar(150, 26, 236, 62, 4, 4, PINK) + bar(150, 102, 236, 62, 4, 3, PINK) +
    txt(268, 252, 64, '&gt; 1', '#B02E63'));

  ART['w-mixed-number'] = word('w-mixed-number', 'The number 1 with 3 over 4 next to it. One whole circle is shaded and 3 quarters of a second circle.',
    txt(40, 196, 130, '1', VIOLET) + frac(116, 150, 66, '3', '4', VIOLET, VIOLET, VIOLET) +
    pie(222, 150, 54, 1, 1, '#B9A5F2') + pie(338, 150, 54, 4, 3, '#B9A5F2'));

  ART['w-unit-fraction'] = word('w-unit-fraction', '1 over 5 with the 1 in a gold circle. A bar is cut into 5 equal parts and exactly one part is shaded.',
    circ(74, 92, 56, SOFT, GOLD, 6) + frac(74, 150, 100, '1', '5') + bar(152, 112, 236, 76, 5, 1, TEAL));

  ART['w-fraction-of-an-amount'] = word('w-fraction-of-an-amount', '12 counters in 4 equal groups of 3. Gold rings go round 3 of the 4 groups. Next to them: 3 over 4.',
    (function () {
      let s = frac(58, 126, 88, '3', '4');
      for (let g = 0; g < 4; g++) {
        const x = 124 + g * 68, on = g < 3;
        s += rect(x, 22, 60, 184, 18, on ? SOFT : '#FFFFFF', on ? GOLD : GREY, on ? 6 : 3);
        for (let k = 0; k < 3; k++) s += circ(x + 30, 56 + k * 58, 21, on ? ORANGE : '#E3E7ED', INK, 3);
      }
      return s + '<path d="M124 220v12h260v-12" stroke="' + INK + '" stroke-width="4"/>' + txt(254, 284, 44, '12');
    })());

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

