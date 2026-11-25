/* 03-art-words.js - the Stop 1 word card pictures and the reward pictures, in the flat style of 02-art-maths.js.

   w-digit, w-value, w-place-value, w-place-holder       Set A of Stop 1 (viewBox 400 x 300)
   w-ones, w-tens, w-hundreds, w-thousands, w-ten-thousands   Set B: the base-ten blocks, one place each
   w-regroup, w-expanded-form, w-multiply, w-divide        Set C
   medal-gold, medal-silver, medal-bronze                  Mini test medals (viewBox 96, round)
   bolt-gold, bolt-silver, bolt-bronze                     Lightning round bolts (viewBox 96, round)

   Colours of the places as in 38-tools.css: ten thousands rose, thousands violet, hundreds green, tens blue,
   ones amber. No word is written in a picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const thin = 'stroke="' + INK + '" stroke-width="1.4" opacity=".45"';

  // front, top and side colours of the blocks of each place
  const C = {
    tth: ['#E58AA8', '#F2B8CB', '#C2456E'],
    th: ['#B9A5F2', '#D6CBF8', '#8E72DE'],
    h: ['#7DD3A8', '#B3E8CB', '#3FB27E'],
    t: ['#8EC1F2', '#BFDDF8', '#5A9FE0'],
    o: ['#F7C65A', '#FBDD96', '#DDA020']
  };
  const PC = { tth: '#C2456E', th: '#7A5BD6', h: '#1E9E6A', t: '#2F7FD4', o: '#E89B12' };

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

  // a block: front w x h (grid cols x rows), top and right faces d deep
  function block(x, y, w, h, d, k, cols, rows) {
    const c = C[k];
    return '<path d="M' + x + ' ' + y + 'l' + d + ' ' + (-d) + 'h' + w + 'l' + (-d) + ' ' + d + 'z" fill="' + c[1] + '" ' + o + '/>' +
      '<path d="M' + (x + w) + ' ' + y + 'l' + d + ' ' + (-d) + 'v' + h + 'l' + (-d) + ' ' + d + 'z" fill="' + c[2] + '" ' + o + '/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c[0] + '" ' + o + '/>' + grid(x, y, w, h, cols, rows);
  }
  const unit = function (x, y, s) { return block(x, y, s, s, s * 0.35, 'o', 1, 1); };
  const rod = function (x, y, s) { return block(x, y, s * 10, s, s * 0.35, 't', 10, 1); };
  const flat = function (x, y, s) { return block(x, y, s * 10, s * 10, s * 0.35, 'h', 10, 10); };
  const cube = function (x, y, s, k) { return block(x, y, s * 10, s * 10, s * 4, k || 'th', 10, 10); };

  // a row of digit tiles, centred on cx: [[digit, place], ...] (a ',' takes a narrow slot); hl = the index of the
  // tile with a gold ring
  function tiles(cx, y, size, list, hl) {
    const wOf = function (t) { return t[0] === ',' ? size * 0.4 : size; };
    const width = list.reduce(function (sum, t, i) { return sum + wOf(t) + (i ? 10 : 0); }, 0);
    let x = cx - width / 2, s = '';
    list.forEach(function (t, i) {
      if (t[0] === ',') { s += txt(x + size * 0.2, y + size * 0.86, size * 0.8, ','); x += wOf(t) + 10; return; }
      s += '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="10" fill="#FFFFFF" stroke="' + PC[t[1]] + '" stroke-width="5"/>';
      if (i === hl) s += '<rect x="' + (x - 7) + '" y="' + (y - 7) + '" width="' + (size + 14) + '" height="' + (size + 14) + '" rx="14" stroke="#F5A623" stroke-width="5"/>';
      s += txt(x + size / 2, y + size * 0.72, size * 0.62, t[0], PC[t[1]]);
      x += size + 10;
    });
    return s;
  }

  // a place value chart with a header row of coloured letters and one row of digits
  function chart(x, y, cw, places, digits, hl) {
    let s = '';
    places.forEach(function (k, i) {
      const cx = x + i * cw, ab = { tth: 'TTh', th: 'Th', h: 'H', t: 'T', o: 'O' }[k];
      s += '<rect x="' + cx + '" y="' + y + '" width="' + cw + '" height="44" fill="' + PC[k] + '" ' + o + '/>' + txt(cx + cw / 2, y + 31, 24, ab, '#FFFFFF');
      s += '<rect x="' + cx + '" y="' + (y + 44) + '" width="' + cw + '" height="80" fill="' + (i === hl ? '#FFF1C9' : '#FFFFFF') + '" ' + o + '/>';
      s += txt(cx + cw / 2, y + 102, 52, digits[i], PC[k]);
    });
    return s;
  }

  function arrow(x1, y1, x2, y2, color) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = 16;
    const p = function (t) { return (x2 - L * Math.cos(a + t)).toFixed(1) + ' ' + (y2 - L * Math.sin(a + t)).toFixed(1); };
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="' + (color || INK) + '" stroke-width="6"/>' +
      '<path d="M' + p(0.5) + 'L' + x2 + ' ' + y2 + 'L' + p(-0.5) + '" stroke="' + (color || INK) + '" stroke-width="6"/>';
  }

  const ART = {};

  /* ---------- Set A: digits and value ---------- */

  ART['w-digit'] = word('w-digit', 'Ten number cards: 0, 1, 2, 3, 4, 5, 6, 7, 8 and 9.',
    (function () {
      const ks = ['o', 't', 'h', 'th', 'tth'];
      let s = '';
      for (let i = 0; i < 10; i++) {
        const x = 38 + (i % 5) * 68, y = i < 5 ? 62 : 162;
        s += '<rect x="' + x + '" y="' + y + '" width="56" height="76" rx="10" fill="#FFFFFF" stroke="' + PC[ks[i % 5]] + '" stroke-width="5"/>' +
          txt(x + 28, y + 55, 46, String(i), PC[ks[i % 5]]);
      }
      return s;
    })());

  ART['w-value'] = word('w-value', 'The number 2,315. The 3 has a gold ring and an arrow to 300.',
    tiles(200, 46, 58, [['2', 'th'], [',', ''], ['3', 'h'], ['1', 't'], ['5', 'o']], 2) +
    arrow(183, 124, 183, 192, '#F5A623') +
    '<rect x="111" y="202" width="144" height="70" rx="16" fill="#FFF1C9" stroke="#F5A623" stroke-width="5"/>' + txt(183, 253, 46, '300', PC.h));

  ART['w-place-value'] = word('w-place-value', 'A place value chart: thousands, hundreds, tens and ones, with 2, 3, 1 and 5.',
    chart(60, 70, 70, ['th', 'h', 't', 'o'], ['2', '3', '1', '5'], -1) +
    '<path d="M60 222h280" stroke="' + INK + '" stroke-width="3" stroke-dasharray="2 10" opacity=".4"/>');

  ART['w-place-holder'] = word('w-place-holder', 'Blocks for 2,035: two thousands, no hundreds, three tens and five ones. The 0 in 2,035 has a gold ring.',
    cube(22, 56, 6) + cube(96, 56, 6) +
    '<rect x="178" y="50" width="60" height="66" rx="6" stroke="' + PC.h + '" stroke-width="4" stroke-dasharray="8 7"/>' +
    block(250, 56, 10, 60, 4, 't', 1, 10) + block(268, 56, 10, 60, 4, 't', 1, 10) + block(286, 56, 10, 60, 4, 't', 1, 10) +
    unit(306, 105, 11) + unit(321, 105, 11) + unit(336, 105, 11) + unit(351, 105, 11) + unit(366, 105, 11) +
    tiles(200, 168, 58, [['2', 'th'], [',', ''], ['0', 'h'], ['3', 't'], ['5', 'o']], 2));

  /* ---------- Set B: the places ---------- */

  ART['w-ones'] = word('w-ones', 'Five small cubes. Each small cube is 1.',
    unit(78, 150, 34) + unit(132, 150, 34) + unit(186, 150, 34) + unit(240, 150, 34) + unit(294, 150, 34) +
    '<rect x="160" y="54" width="80" height="62" rx="14" fill="#FFFFFF" stroke="' + PC.o + '" stroke-width="5"/>' + txt(200, 101, 44, '1', PC.o));

  ART['w-tens'] = word('w-tens', 'A rod of ten small cubes. A rod is 10.',
    rod(58, 170, 27) +
    '<rect x="150" y="50" width="100" height="62" rx="14" fill="#FFFFFF" stroke="' + PC.t + '" stroke-width="5"/>' + txt(200, 97, 44, '10', PC.t));

  ART['w-hundreds'] = word('w-hundreds', 'A flat square of one hundred small cubes. A flat is 100.',
    flat(60, 100, 15) +
    '<rect x="258" y="122" width="116" height="62" rx="14" fill="#FFFFFF" stroke="' + PC.h + '" stroke-width="5"/>' + txt(316, 169, 44, '100', PC.h));

  ART['w-thousands'] = word('w-thousands', 'A big cube of one thousand small cubes. A big cube is 1,000.',
    cube(50, 100, 15) +
    '<rect x="244" y="122" width="136" height="62" rx="14" fill="#FFFFFF" stroke="' + PC.th + '" stroke-width="5"/>' + txt(312, 169, 40, '1,000', PC.th));

  ART['w-ten-thousands'] = word('w-ten-thousands', 'Ten big cubes in two rows. Ten big cubes are 10,000.',
    (function () {
      let s = '';
      for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) s += cube(30 + i * 50 + r * 14, 64 + r * 70, 3.6, 'tth');
      return s;
    })() +
    '<rect x="112" y="212" width="176" height="62" rx="14" fill="#FFFFFF" stroke="' + PC.tth + '" stroke-width="5"/>' + txt(200, 259, 42, '10,000', PC.tth));

  /* ---------- Set C: change a number ---------- */

  ART['w-regroup'] = word('w-regroup', 'One flat of 100 is the same as ten rods of 10.',
    flat(28, 96, 11) +
    txt(178, 170, 64, '=') +
    (function () {
      let s = '';
      for (let i = 0; i < 10; i++) s += block(222, 52 + i * 21, 140, 14, 5, 't', 10, 1);
      return s;
    })());

  ART['w-expanded-form'] = word('w-expanded-form', 'The number 2,315 is 2,000 plus 300 plus 10 plus 5.',
    tiles(200, 34, 56, [['2', 'th'], [',', ''], ['3', 'h'], ['1', 't'], ['5', 'o']], -1) +
    arrow(200, 104, 200, 148) +
    txt(26, 206, 36, '2,000', PC.th, 'start') + txt(132, 206, 36, '+', INK, 'start') + txt(158, 206, 36, '300', PC.h, 'start') +
    txt(228, 206, 36, '+', INK, 'start') + txt(254, 206, 36, '10', PC.t, 'start') + txt(304, 206, 36, '+', INK, 'start') +
    txt(330, 206, 36, '5', PC.o, 'start'));

  ART['w-multiply'] = word('w-multiply', '47 times 10 is 470. The digits move one place to the left.',
    tiles(143, 54, 58, [['4', 't'], ['7', 'o']], -1) + txt(228, 99, 44, '× 10', INK, 'start') +
    arrow(250, 160, 150, 160, '#F5A623') +
    tiles(200, 190, 58, [['4', 'h'], ['7', 't'], ['0', 'o']], -1));

  ART['w-divide'] = word('w-divide', '470 divided by 10 is 47. The digits move one place to the right.',
    tiles(146, 54, 58, [['4', 'h'], ['7', 't'], ['0', 'o']], -1) + txt(260, 99, 44, '÷ 10', INK, 'start') +
    arrow(150, 160, 250, 160, '#F5A623') +
    tiles(200, 190, 58, [['4', 't'], ['7', 'o']], -1));

  /* ---------- rewards: medals and bolts ---------- */

  const METAL = {
    gold: ['#F7C948', '#FFE9A3', '#A9690E'],
    silver: ['#C4CDD8', '#EEF2F6', '#5E6B7A'],
    bronze: ['#D98C4E', '#F4C49A', '#7A4520']
  };

  function medal(k) {
    const m = METAL[k], id = 'medal-' + k;
    return svg(id, 'A ' + k + ' medal with a star.', 96, 96,
      '<circle cx="48" cy="48" r="48" fill="#FFF7E3"/>' +
      '<path d="M30 6h14l10 26H40zM66 6H52L42 32h14z" fill="#2F7FD4" stroke="#1D4F8C" stroke-width="2.5"/>' +
      '<circle cx="48" cy="58" r="26" fill="' + m[0] + '" stroke="' + m[2] + '" stroke-width="3.5"/>' +
      '<circle cx="48" cy="58" r="19" fill="' + m[1] + '" stroke="' + m[2] + '" stroke-width="2" opacity=".9"/>' +
      '<path d="M48 45l3.9 8 8.8 1.2-6.4 6.1 1.6 8.7L48 64.8 40.1 69l1.6-8.7-6.4-6.1 8.8-1.2z" fill="' + m[0] + '" stroke="' + m[2] + '" stroke-width="2.2"/>');
  }

  function bolt(k) {
    const m = METAL[k], id = 'bolt-' + k;
    return svg(id, 'A ' + k + ' lightning bolt.', 96, 96,
      '<circle cx="48" cy="48" r="48" fill="#FFF7E3"/>' +
      '<circle cx="48" cy="48" r="36" fill="' + m[1] + '"/>' +
      '<path d="M54 12L26 54h20l-6 30 30-44H50z" fill="' + m[0] + '" stroke="' + m[2] + '" stroke-width="3.5"/>' +
      '<path d="M50 22L36 46" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>');
  }

  ['gold', 'silver', 'bronze'].forEach(function (k) {
    ART['medal-' + k] = medal(k);
    ART['bolt-' + k] = bolt(k);
  });

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

