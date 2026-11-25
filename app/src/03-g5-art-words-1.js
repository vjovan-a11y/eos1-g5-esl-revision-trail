/* 03-g5-art-words-1.js - the Stop 1 (Decimal Lab) word card pictures, in the flat style of 03-art-words.js.

   w-decimal, w-decimal-point, w-tenth, w-hundredth, w-thousandth, w-digit        (viewBox 400 x 300)
   w-value, w-place-value, w-decimal-place, w-multiply, w-divide, w-place-holder

   Some of these ids have a whole-number picture in 03-art-words.js (Grade 3); this file loads later and replaces them
   with the decimal versions. Colours of the places: ones amber, tenths pink, hundredths teal, thousandths violet
   (tens blue, hundreds green). No word is written in its picture (the Words quiz asks for the word). */
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

  /* ---------- the number and its point ---------- */

  ART['w-decimal'] = word('w-decimal', 'The number 3.75 on tiles. An arrow shows where it is on a number line, between 3 and 4.',
    (function () {
      let s = row(200, 28, 74, [['3', 'o'], ['.'], ['7', 'd'], ['5', 'c']], -1).s;
      for (let i = 0; i <= 10; i++) s += '<path d="M' + (50 + i * 30) + ' 220v' + (i % 10 === 0 ? -24 : -12) + '" stroke="' + INK + '" stroke-width="' + (i % 10 === 0 ? 4 : 2.5) + '"/>';
      s += '<path d="M50 220h300" stroke="' + INK + '" stroke-width="4"/>' + txt(50, 266, 40, '3') + txt(350, 266, 40, '4') +
        arrow(275, 122, 275, 190, GOLD) + '<circle cx="275" cy="220" r="11" fill="' + GOLD + '" ' + o + '/>';
      return s;
    })());

  ART['w-decimal-point'] = word('w-decimal-point', 'The number 3.75 in grey. The dot between the 3 and the 7 is big, in a gold circle, and an arrow points to it.',
    tile(26, 60, 84, '3', 'g') + tile(206, 60, 84, '7', 'g') + tile(300, 60, 84, '5', 'g') +
    '<circle cx="158" cy="124" r="40" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="5"/><circle cx="158" cy="124" r="17" fill="' + INK + '"/>' +
    arrow(158, 272, 158, 184, GOLD, 8));

  /* ---------- the three decimal parts of one whole ---------- */

  ART['w-tenth'] = word('w-tenth', 'A square cut into 10 equal strips. One strip is pink. 0.1 and 1 over 10.',
    '<rect x="30" y="50" width="200" height="200" fill="#FFFFFF" ' + o + '/><rect x="30" y="50" width="20" height="200" fill="' + PC.d + '"/>' +
    (function () { let s = ''; for (let i = 1; i < 10; i++) s += '<path d="M' + (30 + i * 20) + ' 50v200" stroke="' + INK + '" stroke-width="2"/>'; return s; })() +
    '<rect x="30" y="50" width="200" height="200" ' + o + '/>' +
    txt(316, 128, 76, '0.1', '#C2356E') + frac(316, 196, 40, '1', '10', INK));

  ART['w-hundredth'] = word('w-hundredth', 'A square cut into 100 small squares. One small square is teal. 0.01 and 1 over 100.',
    '<rect x="30" y="50" width="200" height="200" fill="#FFFFFF" ' + o + '/>' +
    (function () { let s = ''; for (let i = 1; i < 10; i++) s += '<path d="M' + (30 + i * 20) + ' 50v200M30 ' + (50 + i * 20) + 'h200" stroke="' + INK + '" stroke-width="1.4" opacity=".5"/>'; return s; })() +
    '<rect x="30" y="230" width="20" height="20" fill="' + PC.c + '" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<rect x="30" y="50" width="200" height="200" ' + o + '/>' +
    txt(316, 124, 62, '0.01', '#0E7682') + frac(316, 192, 40, '1', '100', INK));

  ART['w-thousandth'] = word('w-thousandth', 'A magnifying glass on one tiny square of a hundred grid. The tiny square is cut into 10 slivers and one sliver is violet. 0.001.',
    '<rect x="16" y="40" width="110" height="110" fill="#FFFFFF" ' + o + '/>' + grid(16, 40, 110, 110, 10, 10) +
    '<rect x="104" y="128" width="11" height="11" fill="' + PC.c + '" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M110 128L196 78M110 139L196 196" stroke="' + INK + '" stroke-width="2" stroke-dasharray="5 6" opacity=".6"/>' +
    '<path d="M318 196l50 50" stroke="' + INK + '" stroke-width="20"/><path d="M318 196l50 50" stroke="#8A6CE0" stroke-width="13"/>' +
    '<circle cx="258" cy="134" r="86" fill="#FFFFFF" stroke="' + INK + '" stroke-width="12"/><circle cx="258" cy="134" r="86" stroke="#B9C0CE" stroke-width="6"/>' +
    '<rect x="203" y="79" width="110" height="110" fill="' + PT.c + '" ' + o + '/><rect x="203" y="79" width="11" height="110" fill="' + PC.m + '"/>' +
    (function () { let s = ''; for (let i = 1; i < 10; i++) s += '<path d="M' + (203 + i * 11) + ' 79v110" stroke="' + INK + '" stroke-width="1.6"/>'; return s; })() +
    '<rect x="203" y="79" width="110" height="110" ' + o + '/>' +
    txt(104, 268, 62, '0.001', '#5A3CB8'));

  /* ---------- digits and their value ---------- */

  ART['w-digit'] = word('w-digit', 'Ten number cards: 0, 1, 2, 3, 4, 5, 6, 7, 8 and 9.',
    (function () {
      const ks = ['o', 'd', 'c', 'm', 't'];
      let s = '';
      for (let i = 0; i < 10; i++) {
        const x = 38 + (i % 5) * 68, y = i < 5 ? 62 : 162;
        s += '<rect x="' + x + '" y="' + y + '" width="56" height="76" rx="10" fill="#FFFFFF" stroke="' + PC[ks[i % 5]] + '" stroke-width="5"/>' +
          txt(x + 28, y + 55, 46, String(i), PC[ks[i % 5]]);
      }
      return s;
    })());

  ART['w-value'] = word('w-value', 'The number 3.75. The 7 has a gold ring and an arrow to 0.7.',
    (function () {
      const r = row(200, 34, 66, [['3', 'o'], ['.'], ['7', 'd'], ['5', 'c']], 2), cx = r.x[2] + 33;
      return r.s + arrow(cx, 116, cx, 180, GOLD) +
        '<rect x="' + (cx - 76) + '" y="192" width="152" height="78" rx="16" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="5"/>' + txt(cx, 250, 56, '0.7', '#C2356E');
    })());

  ART['w-place-value'] = word('w-place-value', 'A chart with a column for ones, tenths and hundredths, and a decimal point after the ones. It holds 3, 7 and 5. Under the columns: 1, 0.1 and 0.01.',
    (function () {
      const cols = [['o', 'O', '3', '1', 50], ['d', 't', '7', '0.1', 176], ['c', 'h', '5', '0.01', 268]];
      let s = '<rect x="142" y="42" width="34" height="150" fill="#EEF1F6" ' + o + '/><circle cx="159" cy="166" r="8" fill="' + INK + '"/>';
      cols.forEach(function (c) {
        s += '<rect x="' + c[4] + '" y="42" width="92" height="50" fill="' + PC[c[0]] + '" ' + o + '/>' + txt(c[4] + 46, 79, 34, c[1], '#FFFFFF') +
          '<rect x="' + c[4] + '" y="92" width="92" height="100" fill="#FFFFFF" ' + o + '/>' + txt(c[4] + 46, 166, 66, c[2], PC[c[0]]) +
          '<path d="M' + (c[4] + 46) + ' 200v14" stroke="' + PC[c[0]] + '" stroke-width="4"/>' +
          '<rect x="' + (c[4] + 3) + '" y="218" width="86" height="46" rx="12" fill="' + PT[c[0]] + '"/>' + txt(c[4] + 46, 253, 32, c[3]);
      });
      return s;
    })());

  ART['w-decimal-place'] = word('w-decimal-place', 'The number 3.758. The three digits after the dot stand on a gold band and are counted: 1, 2, 3.',
    (function () {
      const r = row(200, 44, 66, [['3', 'o'], ['.'], ['7', 'd'], ['5', 'c'], ['8', 'm']], -1);
      let s = '<rect x="' + (r.x[2] - 10) + '" y="30" width="' + (r.x[4] + 66 - r.x[2] + 20) + '" height="94" rx="16" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="4"/>' + r.s;
      [2, 3, 4].forEach(function (i, n) {
        const cx = r.x[i] + 33;
        s += '<path d="M' + (cx - 26) + ' 138v12h52v-12M' + cx + ' 150v16" stroke="' + INK + '" stroke-width="3.5"/>' +
          '<circle cx="' + cx + '" cy="206" r="34" fill="' + GOLD + '" ' + o + '/>' + txt(cx, 224, 50, String(n + 1));
      });
      return s;
    })());

  /* ---------- 10 times as big, 10 times as small ---------- */

  // two rows of tiles in fixed columns (tens, ones, point, tenths, hundredths); every digit moves one column
  // dir -1 = to the left (times 10), +1 = to the right (divided by 10)
  function shift(sign, colour, top, bottom) {
    const X = [136, 192, 270, 326], K = ['t', 'o', 'd', 'c'], S = 48;
    let s = '<circle cx="66" cy="150" r="54" fill="' + colour + '" ' + o + '/>' + txt(66, 166, 44, sign + '10', '#FFFFFF');
    [[top, 34], [bottom, 218]].forEach(function (rw) {
      rw[0].forEach(function (d, i) {
        s += d === '' ? '<rect x="' + X[i] + '" y="' + rw[1] + '" width="' + S + '" height="' + S + '" rx="10" stroke="#B9C0CE" stroke-width="3" stroke-dasharray="6 7"/>'
          : tile(X[i], rw[1], S, d, K[i]);
      });
      s += '<circle cx="255" cy="' + (rw[1] + 42) + '" r="6" fill="' + INK + '"/>';
    });
    top.forEach(function (d, i) {
      const j = bottom.indexOf(d);
      if (d !== '' && j >= 0) s += arrow(X[i] + 24, 96, X[j] + 24, 204, colour, 5);
    });
    return s;
  }

  ART['w-multiply'] = word('w-multiply', 'Times 10: 3.75 becomes 37.5. Every digit moves one place to the left.',
    shift('×', '#1E9E6A', ['', '3', '7', '5'], ['3', '7', '5', '']));

  ART['w-divide'] = word('w-divide', 'Divided by 10: 37.5 becomes 3.75. Every digit moves one place to the right.',
    shift('÷', '#2F7FD4', ['3', '7', '5', ''], ['', '3', '7', '5']));

  /* ---------- the zero that keeps a place ---------- */

  ART['w-place-holder'] = word('w-place-holder', 'The number 6.049. Under each digit a box of counters: 6, none, 4 and 9. The 0 has a gold ring and its box is empty.',
    (function () {
      const list = [['6', 'o'], ['.'], ['0', 'd'], ['4', 'c'], ['9', 'm']], r = row(200, 36, 64, list, 2);
      let s = r.s;
      list.forEach(function (t, i) {
        if (t[0] === '.') return;
        const x = r.x[i], n = +t[0];
        s += n ? '<rect x="' + x + '" y="134" width="64" height="72" rx="10" fill="' + PT[t[1]] + '" stroke="' + PC[t[1]] + '" stroke-width="3"/>'
          : '<rect x="' + x + '" y="134" width="64" height="72" rx="10" fill="' + SOFT + '" stroke="' + GOLD + '" stroke-width="4" stroke-dasharray="8 8"/>';
        for (let k = 0; k < n; k++) s += '<circle cx="' + (x + 14 + (k % 3) * 18) + '" cy="' + (150 + Math.floor(k / 3) * 20) + '" r="7" fill="' + PC[t[1]] + '" stroke="' + INK + '" stroke-width="2"/>';
      });
      s += arrow(r.x[2] + 32, 272, r.x[2] + 32, 222, GOLD, 7);
      return s;
    })());

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

