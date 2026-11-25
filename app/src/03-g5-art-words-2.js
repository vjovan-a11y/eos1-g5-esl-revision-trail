/* 03-g5-art-words-2.js - the Stop 2 (Rounding Reef) word card pictures, in the flat style of 03-art-words.js.

   w-round, w-nearest, w-halfway, w-whole-number, w-estimate          (viewBox 400 x 300)
   w-sum, w-difference, w-line-up, w-exchange, w-working

   Some of these ids have a whole-number picture in the Grade 3 files; this file loads later and replaces them with
   the decimal versions. Colours of the places: ones amber, tenths pink, hundredths teal, thousandths violet.
   No word is written in its picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const thin = 'stroke="' + INK + '" stroke-width="1.4" opacity=".45"';
  const GOLD = '#F5A623', SOFT = '#FFF1CF';

  // the colour of each place (o ones, d tenths, c hundredths, m thousandths) and a pale tint of it
  const PC = { h: '#1E9E6A', t: '#2F7FD4', o: '#E89B12', d: '#E0548A', c: '#17A2B0', m: '#7A5BD6', g: '#AEB6C4' };
  const PT = { h: '#B3E8CB', t: '#BFDDF8', o: '#FBDD96', d: '#F7B6CF', c: '#A9E0E6', m: '#CFC2F5' };

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

  function grid(x, y, w, h, cols, rows) {
    let s = '';
    for (let i = 1; i < cols; i++) s += '<path d="M' + (x + i * w / cols) + ' ' + y + 'v' + h + '" ' + thin + '/>';
    for (let j = 1; j < rows; j++) s += '<path d="M' + x + ' ' + (y + j * h / rows) + 'h' + w + '" ' + thin + '/>';
    return s;
  }

  // one digit tile
  function tile(x, y, size, d, k) {
    return '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="10" fill="#FFFFFF" stroke="' + PC[k] + '" stroke-width="5"/>' +
      txt(x + size / 2, y + size * 0.74, size * 0.66, d, PC[k]);
  }
  const ring = function (x, y, size) {
    return '<rect x="' + (x - 7) + '" y="' + (y - 7) + '" width="' + (size + 14) + '" height="' + (size + 14) + '" rx="14" stroke="' + GOLD + '" stroke-width="5"/>';
  };
  const point = function (cx, y, size) { return '<circle cx="' + cx + '" cy="' + (y + size * 0.86) + '" r="' + (size * 0.1) + '" fill="' + INK + '"/>'; };

  // a row of digit tiles centred on cx: [[digit, place], ...]; ['.'] is the decimal point in a narrow slot.
  // Returns { s: the drawing, x: the left edge of every entry }. hl = the index of the tile with a gold ring.
  function row(cx, y, size, list, hl) {
    const gap = 10, wOf = function (t) { return t[0] === '.' ? size * 0.3 : size; };
    const width = list.reduce(function (sum, t, i) { return sum + wOf(t) + (i ? gap : 0); }, 0);
    let x = cx - width / 2, s = '';
    const xs = [];
    list.forEach(function (t, i) {
      xs.push(x);
      if (t[0] === '.') s += point(x + size * 0.15, y, size);
      else s += tile(x, y, size, t[0], t[1]) + (i === hl ? ring(x, y, size) : '');
      x += wOf(t) + gap;
    });
    return { s: s, x: xs };
  }

  function arrow(x1, y1, x2, y2, color, w) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = 16;
    const p = function (t) { return (x2 - L * Math.cos(a + t)).toFixed(1) + ' ' + (y2 - L * Math.sin(a + t)).toFixed(1); };
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + (color || INK) + '" stroke-width="' + (w || 6) + '"/>' +
      '<path d="M' + p(0.5) + 'L' + x2 + ' ' + y2 + 'L' + p(-0.5) + '" stroke="' + (color || INK) + '" stroke-width="' + (w || 6) + '"/>';
  }

  // a fraction written with a bar: n over d
  function frac(cx, y, size, n, d, fill) {
    const w = Math.max(String(n).length, String(d).length) * size * 0.6 + 8;
    return txt(cx, y, size, n, fill) + '<path d="M' + (cx - w / 2) + ' ' + (y + size * 0.22) + 'h' + w + '" stroke="' + fill + '" stroke-width="4"/>' +
      txt(cx, y + size * 1.12, size, d, fill);
  }

  const ART = {};
  const TEAL = '#0E7682';

  // a number line from x1 to x2 at height y with n equal steps; the two ends are taller
  function line(x1, x2, y, n) {
    let s = '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" stroke="' + INK + '" stroke-width="4"/>';
    for (let i = 0; i <= n; i++) {
      const end = i === 0 || i === n;
      s += '<path d="M' + (x1 + i * (x2 - x1) / n) + ' ' + (y + (end ? 14 : 0)) + 'v' + (end ? -28 : -12) + '" stroke="' + INK + '" stroke-width="' + (end ? 4 : 2.5) + '"/>';
    }
    return s;
  }
  // a hop over the line from x1 to x2, ht high
  function hopArc(x1, x2, y, ht, colour, w, dash) {
    return '<path d="M' + x1 + ' ' + y + 'Q' + ((x1 + x2) / 2) + ' ' + (y - 2 * ht) + ' ' + x2 + ' ' + y + '" stroke="' + colour + '" stroke-width="' + w + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  const pill = function (cx, cy, w, h, fill, stroke) {
    return '<rect x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + Math.min(18, h / 2) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="5"/>';
  };

  /* ---------- rounding on the number line ---------- */

  ART['w-round'] = word('w-round', 'The number 4.37 with a curved arrow to the simpler number 4.4 in a gold box.',
    txt(100, 206, 74, '4.37') +
    '<path d="M100 122C140 44 262 40 300 104" stroke="' + TEAL + '" stroke-width="7"/><path d="M276 98l25 8 5-26" stroke="' + TEAL + '" stroke-width="7"/>' +
    pill(306, 180, 150, 100, SOFT, GOLD) + txt(306, 206, 74, '4.4', '#C2356E'));

  ART['w-nearest'] = word('w-nearest', 'A number line from 4.3 to 4.4 with a dot at 4.37. A short gold hop goes to 4.4, which has a gold ring. A long grey dashed hop goes to 4.3.',
    hopArc(264, 40, 160, 50, '#9AA3B2', 5, '4 11') + hopArc(264, 360, 160, 34, GOLD, 9) +
    line(40, 360, 172, 10) +
    '<path d="M264 160V78" stroke="#C2356E" stroke-width="3.5"/><circle cx="264" cy="172" r="11" fill="' + PC.d + '" ' + o + '/>' +
    pill(264, 52, 104, 50, '#FFFFFF', PC.d) + txt(264, 65, 36, '4.37', '#C2356E') +
    txt(54, 240, 40, '4.3', '#7B8494') + pill(338, 228, 100, 58, SOFT, GOLD) + txt(338, 242, 40, '4.4'));

  ART['w-halfway'] = word('w-halfway', 'A number line from 4.3 to 4.4. A gold flag stands on 4.35, in the middle. The two hops to the ends are the same length.',
    hopArc(200, 40, 160, 38, '#17A2B0', 6) + hopArc(200, 360, 160, 38, '#17A2B0', 6) +
    line(40, 360, 172, 10) +
    '<path d="M200 172V34" stroke="' + INK + '" stroke-width="5"/><path d="M200 36h52l-12 17 12 17h-52z" fill="' + GOLD + '" ' + o + '/>' +
    '<circle cx="200" cy="172" r="10" fill="' + GOLD + '" ' + o + '/>' +
    txt(48, 240, 36, '4.3') + txt(352, 240, 36, '4.4') + pill(200, 228, 112, 56, SOFT, GOLD) + txt(200, 242, 40, '4.35'));

  /* ---------- kinds of number, rough answers ---------- */

  ART['w-whole-number'] = word('w-whole-number', 'Four cards, 0, 1, 2 and 3, each with a green tick. Below, two grey cards, 2.5 and 0.7, each with a red cross.',
    (function () {
      let s = '';
      ['0', '1', '2', '3'].forEach(function (d, i) {
        const x = 34 + i * 86;
        s += '<rect x="' + x + '" y="34" width="72" height="90" rx="12" fill="#FFFFFF" stroke="' + PC.o + '" stroke-width="5"/>' + txt(x + 36, 101, 62, d, '#B97400') +
          '<circle cx="' + (x + 66) + '" cy="40" r="15" fill="#1E9E6A" stroke="#FFFFFF" stroke-width="3"/><path d="M' + (x + 59) + ' 40l5 6 9-11" stroke="#FFFFFF" stroke-width="4"/>';
      });
      [['2.5', 62], ['0.7', 222]].forEach(function (c) {
        s += '<rect x="' + c[1] + '" y="176" width="116" height="84" rx="12" fill="#F1F3F7" stroke="#AEB6C4" stroke-width="5"/>' + txt(c[1] + 58, 237, 52, c[0], '#7B8494') +
          '<circle cx="' + (c[1] + 110) + '" cy="182" r="17" fill="#E5404A" stroke="#FFFFFF" stroke-width="3"/><path d="M' + (c[1] + 103) + ' 175l14 14M' + (c[1] + 117) + ' 175l-14 14" stroke="#FFFFFF" stroke-width="4.5"/>';
      });
      return s;
    })());

  ART['w-estimate'] = word('w-estimate', '3.9 plus 5.2. Arrows turn 3.9 into 4 and 5.2 into 5. 4 plus 5 is about 9.',
    txt(68, 78, 52, '3.9') + txt(140, 76, 48, '+') + txt(212, 78, 52, '5.2') +
    arrow(68, 98, 68, 150, '#17A2B0') + arrow(212, 98, 212, 150, '#17A2B0') +
    pill(68, 208, 84, 84, '#CFF0F2', '#17A2B0') + txt(68, 230, 62, '4', TEAL) + txt(140, 226, 48, '+') +
    pill(212, 208, 84, 84, '#CFF0F2', '#17A2B0') + txt(212, 230, 62, '5', TEAL) +
    txt(282, 228, 56, '≈') + '<circle cx="346" cy="208" r="44" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="5"/>' + txt(346, 231, 64, '9'));

  /* ---------- the answers of adding and subtracting ---------- */

  const bar = function (x, y, w, h, k, label) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + PT[k] + '" stroke="' + INK + '" stroke-width="3"/>' + txt(x + w / 2, y + h / 2 + 14, 40, label);
  };

  ART['w-sum'] = word('w-sum', 'A bar of 2.5 joined to a bar of 1.3. A bracket under both bars leads to 3.8 in a gold box.',
    bar(36, 40, 216, 70, 'd', '2.5') + bar(252, 40, 112, 70, 'c', '1.3') +
    '<circle cx="252" cy="75" r="19" fill="#FFFFFF" ' + o + '/><path d="M242 75h20M252 65v20" stroke="' + INK + '" stroke-width="4.5"/>' +
    '<path d="M36 124v16h328v-16M200 140v22" stroke="' + INK + '" stroke-width="4"/>' +
    pill(200, 214, 170, 96, SOFT, GOLD) + txt(200, 238, 68, '3.8'));

  ART['w-difference'] = word('w-difference', 'A long bar of 5.2 above a shorter bar of 3.9. The gap at the end of the short bar is gold and holds 1.3.',
    bar(30, 36, 340, 70, 'c', '5.2') + bar(30, 122, 255, 70, 'd', '3.9') +
    '<rect x="285" y="122" width="85" height="70" rx="8" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="5" stroke-dasharray="10 8"/>' + txt(327, 171, 38, '1.3') +
    '<path d="M285 206v40M370 206v40" stroke="' + INK + '" stroke-width="3"/>' +
    '<path d="M292 228h71" stroke="' + GOLD + '" stroke-width="7"/><path d="M304 216l-13 12 13 12M351 216l13 12-13 12" stroke="' + GOLD + '" stroke-width="7"/>');

  /* ---------- the written method ---------- */

  ART['w-line-up'] = word('w-line-up', 'The numbers 12.5 and 3.47 written one under the other. Their two dots are in one gold column.',
    (function () {
      const X = { t: 40, o: 114, d: 232, c: 306 }, S = 64;
      let s = '<rect x="188" y="26" width="34" height="248" rx="14" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="5"/>' +
        '<path d="M205 12v8M205 280v8" stroke="' + GOLD + '" stroke-width="5"/>';
      [[['t', '1'], ['o', '2'], ['d', '5']], [['o', '3'], ['d', '4'], ['c', '7']]].forEach(function (rw, j) {
        const y = 52 + j * 104;
        rw.forEach(function (c) { s += tile(X[c[0]], y, S, c[1], c[0]); });
        s += '<circle cx="205" cy="' + (y + 54) + '" r="9" fill="' + INK + '"/>';
      });
      return s;
    })());

  ART['w-exchange'] = word('w-exchange', 'One amber square on the left and ten pink strips on the right. Two arrows between them point both ways: 1 for 10.',
    (function () {
      let s = '<rect x="22" y="70" width="110" height="110" rx="4" fill="' + PT.o + '" ' + o + '/>' + txt(77, 246, 52, '1', '#B97400');
      for (let i = 1; i < 10; i++) s += '<path d="M' + (22 + i * 11) + ' 70v110" ' + thin + '/>';
      for (let i = 0; i < 10; i++) s += '<rect x="' + (206 + i * 18) + '" y="70" width="11" height="110" rx="2" fill="' + PC.d + '" stroke="' + INK + '" stroke-width="2.5"/>';
      s += txt(292, 246, 52, '10', '#C2356E') +
        arrow(146, 104, 192, 104, TEAL, 7) + arrow(192, 146, 146, 146, TEAL, 7);
      return s;
    })());

  ART['w-working'] = word('w-working', 'A sheet of paper with a pencil. On it, step by step: 5.2 minus 1.9, equals 5.2 minus 2 plus 0.1, equals 3.2 plus 0.1, equals 3.3.',
    '<rect x="30" y="16" width="262" height="268" rx="10" fill="#FFFFFF" ' + o + '/>' +
    '<path d="M30 82h262M30 142h262M30 202h262" stroke="#B8D4EA" stroke-width="2"/>' +
    txt(48, 64, 32, '5.2 − 1.9', INK, 'start') + txt(48, 124, 32, '= 5.2 − 2 + 0.1', '#5C6472', 'start') +
    txt(48, 184, 32, '= 3.2 + 0.1', '#5C6472', 'start') +
    '<rect x="88" y="214" width="92" height="52" rx="12" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="4"/>' + txt(48, 252, 36, '=', INK, 'start') + txt(134, 253, 38, '3.3') +
    '<g transform="rotate(28 326 150) translate(-14 0)"><rect x="326" y="50" width="28" height="150" fill="#F5C24A" ' + o + '/><rect x="326" y="36" width="28" height="22" rx="5" fill="#F7889B" ' + o + '/>' +
    '<path d="M326 200h28l-14 34z" fill="#F2D9B8" ' + o + '/><path d="M335 222h10l-5 12z" fill="' + INK + '"/><path d="M340 58v142" ' + thin + '/></g>');

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

