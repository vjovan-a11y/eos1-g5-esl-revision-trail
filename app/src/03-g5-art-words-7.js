/* 03-g5-art-words-7.js - the Stop 7 word card pictures (Quadrilaterals and rotational symmetry), flat style of 03-art-words.js.

   w-quadrilateral, w-parallel, w-perpendicular, w-right-angle, w-diagonal        lines and corners (viewBox 400 x 300)
   w-square, w-rectangle, w-parallelogram, w-rhombus, w-trapezium, w-kite         the six special quadrilaterals
   w-rotational-symmetry, w-order-of-rotational-symmetry, w-line-of-symmetry     turn it, fold it

   The shapes are drawn exactly: right angles are 90 degrees, parallel sides are parallel, equal sides are equal.
   Marks: ticks = equal sides, arrowheads = parallel sides, a small square = a right angle.
   Stop colours: lime #8DB32E / #66861A; gold #F5A623 points at the thing meant.
   No word is written in a picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const LIME = '#8DB32E', LIME_D = '#66861A', LIME_L = '#E6F1C8', GOLD = '#F5A623', GOLD_L = '#FFF1CF';
  const TEAL = '#17A2B0', BLUE = '#2F7FD4', PINK = '#E0548A';

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

  // a closed shape from points [[x, y], ...]
  function poly(pts, fill, stroke, sw) {
    return '<path d="M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'z" fill="' + (fill || 'none') +
      '" stroke="' + (stroke || INK) + '" stroke-width="' + (sw || 5) + '"/>';
  }

  function line(a, b, color, sw, extra) {
    return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + (color || INK) + '" stroke-width="' + (sw || 5) + '"' + (extra || '') + '/>';
  }

  // n tick marks across the middle of the side a-b: equal sides
  function ticks(a, b, n, color) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let s = '';
    for (let i = 0; i < n; i++) {
      const t = (i - (n - 1) / 2) * 11, cx = mx + ux * t, cy = my + uy * t;
      s += line([cx - uy * 13, cy + ux * 13], [cx + uy * 13, cy - ux * 13], color || PINK, 7);
    }
    return s;
  }

  // n arrowheads on the middle of the side a-b, pointing from a to b: parallel sides
  function chev(a, b, n, color) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let s = '';
    for (let i = 0; i < n; i++) {
      const t = (i - (n - 1) / 2) * 16 + 8, tx = mx + ux * t, ty = my + uy * t;
      const p = [tx - ux * 16 - uy * 14, ty - uy * 16 + ux * 14], q = [tx - ux * 16 + uy * 14, ty - uy * 16 - ux * 14];
      s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + 'L' + f(tx) + ' ' + f(ty) + 'L' + f(q[0]) + ' ' + f(q[1]) + '" stroke="' + (color || BLUE) + '" stroke-width="7"/>';
    }
    return s;
  }

  // the small square in the corner v, between the sides towards a and b: a right angle
  function corner(v, a, b, size, fill, color) {
    const u = function (p) { const L = Math.hypot(p[0] - v[0], p[1] - v[1]); return [(p[0] - v[0]) / L * size, (p[1] - v[1]) / L * size]; };
    const p = u(a), q = u(b);
    return '<path d="M' + f(v[0] + p[0]) + ' ' + f(v[1] + p[1]) + 'L' + f(v[0] + p[0] + q[0]) + ' ' + f(v[1] + p[1] + q[1]) + 'L' + f(v[0] + q[0]) + ' ' + f(v[1] + q[1]) +
      (fill ? 'L' + f(v[0]) + ' ' + f(v[1]) + 'z' : '') + '" fill="' + (fill || 'none') + '" stroke="' + (color || GOLD) + '" stroke-width="' + 6 + '"/>';
  }

  function corners(pts, size) {
    return pts.map(function (v, i) { return corner(v, pts[(i + 3) % 4], pts[(i + 1) % 4], size); }).join('');
  }

  // a straight arrow, with a head at both ends when both is true
  function arrow(a, b, color, sw, both) {
    const w = sw || 6, L = 15;
    const head = function (p, q) {
      const t = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const e = function (d) { return f(q[0] - L * Math.cos(t + d)) + ' ' + f(q[1] - L * Math.sin(t + d)); };
      return '<path d="M' + e(0.55) + 'L' + f(q[0]) + ' ' + f(q[1]) + 'L' + e(-0.55) + '" stroke="' + (color || INK) + '" stroke-width="' + w + '"/>';
    };
    return line(a, b, color, w) + head(a, b) + (both ? head(b, a) : '');
  }

  // a curved arrow on the circle (cx, cy, r) from angle a0 to a1 in degrees, clockwise on the screen when a1 > a0
  function turn(cx, cy, r, a0, a1, color, sw) {
    const rad = Math.PI / 180, w = sw || 7, dir = a1 > a0 ? 1 : -1, L = 17;
    const at = function (a) { return [cx + r * Math.cos(a * rad), cy + r * Math.sin(a * rad)]; };
    const p0 = at(a0), p1 = at(a1);
    const t = a1 * rad + dir * Math.PI / 2 - dir * (L / r) * 0.5;
    const e = function (d) { return f(p1[0] - L * Math.cos(t + d)) + ' ' + f(p1[1] - L * Math.sin(t + d)); };
    return '<path d="M' + f(p0[0]) + ' ' + f(p0[1]) + 'A' + r + ' ' + r + ' 0 ' + (Math.abs(a1 - a0) > 180 ? 1 : 0) + ' ' + (dir > 0 ? 1 : 0) + ' ' + f(p1[0]) + ' ' + f(p1[1]) +
      '" stroke="' + (color || GOLD) + '" stroke-width="' + w + '"/>' +
      '<path d="M' + e(0.6) + 'L' + f(p1[0]) + ' ' + f(p1[1]) + 'L' + e(-0.6) + '" stroke="' + (color || GOLD) + '" stroke-width="' + w + '"/>';
  }

  // a number in a gold disc
  function disc(x, y, n, r) {
    const R = r || 21;
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + R + '" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="5"/>' + txt(f(x), f(y + R * 0.5), R * 1.45, n);
  }

  const ART = {};

  /* ---------- lines and corners ---------- */

  ART['w-quadrilateral'] = word('w-quadrilateral', 'A shape with 4 straight sides. The sides are numbered 1, 2, 3 and 4.',
    (function () {
      const P = [[74, 100], [282, 46], [344, 212], [118, 256]];
      return poly(P, LIME_L, LIME_D, 7) +
        P.map(function (p, i) { const q = P[(i + 1) % 4]; return disc((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, String(i + 1), 23); }).join('');
    })());

  ART['w-parallel'] = word('w-parallel', 'Two straight lines that go the same way, like train tracks. Arrow marks on both lines, and the gap between them stays the same.',
    (function () {
      const a = [26, 122], b = [374, 62], c = [26, 238], d = [374, 178];
      const L = Math.hypot(348, -60), n = [60 / L, 348 / L], gap = 116 * n[1];
      const tie = function (t) {
        const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        return arrow([p[0] + n[0] * 12, p[1] + n[1] * 12], [p[0] + n[0] * (gap - 12), p[1] + n[1] * (gap - 12)], TEAL, 5, true);
      };
      return tie(0.16) + tie(0.8) +
        line(a, b, LIME_D, 10) + line(c, d, LIME_D, 10) + chev(a, b, 1) + chev(c, d, 1);
    })());

  ART['w-perpendicular'] = word('w-perpendicular', 'Two straight lines that cross. A small gold square shows that they meet at a right angle.',
    corner([170, 178], [170, 40], [360, 178], 48, GOLD_L) +
    line([30, 178], [370, 178], LIME_D, 10) + line([170, 24], [170, 276], BLUE, 10));

  ART['w-right-angle'] = word('w-right-angle', 'One square corner. A gold square marks the corner and the label says 90 degrees.',
    '<rect x="78" y="182" width="58" height="58" fill="' + GOLD + '" stroke="' + GOLD + '" stroke-width="4"/>' +
    '<path d="M78 40V240H366" stroke="' + LIME_D + '" stroke-width="12"/>' +
    txt(252, 158, 76, '90°'));

  ART['w-diagonal'] = word('w-diagonal', 'A rectangle with one gold line that joins two opposite corners.',
    poly([[50, 62], [350, 62], [350, 238], [50, 238]], LIME_L, LIME_D, 6) +
    line([50, 238], [350, 62], GOLD, 11) +
    '<circle cx="50" cy="238" r="13" fill="' + GOLD + '" ' + o + '/><circle cx="350" cy="62" r="13" fill="' + GOLD + '" ' + o + '/>');

  /* ---------- the six special quadrilaterals ---------- */

  ART['w-square'] = word('w-square', 'A shape with 4 equal sides and 4 right angles. Every side has one tick mark and every corner has a small square.',
    (function () {
      const P = [[100, 50], [300, 50], [300, 250], [100, 250]];
      return poly(P, LIME_L, LIME_D, 7) + corners(P, 26) +
        P.map(function (p, i) { return ticks(p, P[(i + 1) % 4], 1); }).join('');
    })());

  ART['w-rectangle'] = word('w-rectangle', 'A long shape with 4 right angles. The two long sides have two tick marks and the two short sides have one tick mark.',
    (function () {
      const P = [[36, 82], [364, 82], [364, 218], [36, 218]];
      return poly(P, LIME_L, LIME_D, 7) + corners(P, 26) +
        ticks(P[0], P[1], 2) + ticks(P[2], P[3], 2) + ticks(P[1], P[2], 1) + ticks(P[3], P[0], 1);
    })());

  ART['w-parallelogram'] = word('w-parallelogram', 'A slanted shape with 4 sides. Opposite sides have matching arrow marks: one arrow on top and bottom, two arrows on the slanted sides.',
    (function () {
      const P = [[112, 66], [372, 66], [288, 234], [28, 234]];
      return poly(P, LIME_L, LIME_D, 7) +
        chev(P[0], P[1], 1) + chev(P[3], P[2], 1) + chev(P[3], P[0], 2) + chev(P[2], P[1], 2);
    })());

  ART['w-rhombus'] = word('w-rhombus', 'A diamond shape that is wider than it is tall. All 4 sides have one tick mark: they are equal.',
    (function () {
      const P = [[200, 36], [372, 150], [200, 264], [28, 150]];
      return poly(P, LIME_L, LIME_D, 7) +
        P.map(function (p, i) { return ticks(p, P[(i + 1) % 4], 1); }).join('');
    })());

  ART['w-trapezium'] = word('w-trapezium', 'A shape with 4 sides. Only the top side and the bottom side have arrow marks: one pair of sides goes the same way.',
    (function () {
      const P = [[128, 70], [262, 70], [368, 230], [32, 230]];
      return poly(P, LIME_L, LIME_D, 7) + chev(P[0], P[1], 1) + chev(P[3], P[2], 1);
    })());

  ART['w-kite'] = word('w-kite', 'A shape with a pointed top and a long pointed bottom. The two short sides at the top have one tick mark and the two long sides have two tick marks.',
    (function () {
      const P = [[200, 22], [298, 112], [200, 280], [102, 112]];
      return poly(P, LIME_L, LIME_D, 7) +
        '<path d="M200 22V280M102 112H298" stroke="' + LIME_D + '" stroke-width="3" opacity=".45"/>' +
        ticks(P[0], P[1], 1) + ticks(P[3], P[0], 1) + ticks(P[1], P[2], 2) + ticks(P[2], P[3], 2);
    })());

  /* ---------- turn it, fold it ---------- */

  ART['w-rotational-symmetry'] = word('w-rotational-symmetry', 'A pinwheel with 4 matching blades and curved arrows around it. After a turn it looks the same.',
    (function () {
      let s = '';
      for (let k = 0; k < 4; k++) {
        s += '<g transform="rotate(' + (k * 90) + ' 200 150)">' +
          '<path d="M200 150L316 150L258 92z" fill="' + LIME + '" ' + o + '/>' +
          '<path d="M200 150L258 92L200 92z" fill="' + LIME_L + '" ' + o + '/></g>';
      }
      return s + '<circle cx="200" cy="150" r="11" fill="' + INK + '"/>' +
        turn(200, 150, 132, -78, -22, GOLD, 9) + turn(200, 150, 132, 102, 158, GOLD, 9);
    })());

  ART['w-order-of-rotational-symmetry'] = word('w-order-of-rotational-symmetry', 'A square with a pink dot in one corner. Arrows turn it round to positions 1, 2, 3 and 4: it fits 4 times in one full turn.',
    (function () {
      const c = [200, 150], h = 62, R = 112, d = R / Math.SQRT2;
      let s = poly([[c[0] - h, c[1] - h], [c[0] + h, c[1] - h], [c[0] + h, c[1] + h], [c[0] - h, c[1] + h]], LIME_L, LIME_D, 7) +
        '<circle cx="' + (c[0] + h - 22) + '" cy="' + (c[1] - h + 22) + '" r="11" fill="' + PINK + '" ' + o + '/>' +
        '<path d="M200 128v44M178 150h44" stroke="' + LIME_D + '" stroke-width="5"/>';
      for (let k = 0; k < 4; k++) s += turn(c[0], c[1], R, -45 + k * 90 + 17, 45 + k * 90 - 17, TEAL, 7);
      [[1, -1], [1, 1], [-1, 1], [-1, -1]].forEach(function (q, i) { s += disc(c[0] + q[0] * d, c[1] + q[1] * d, String(i + 1), 23); });
      return s;
    })());

  ART['w-line-of-symmetry'] = word('w-line-of-symmetry', 'A butterfly with a dashed gold line down the middle. The left half and the right half match.',
    (function () {
      const wing = '<path d="M200 142C222 60 322 26 352 70C378 110 300 158 200 152z" fill="' + LIME + '" ' + o + '/>' +
        '<path d="M200 156C262 156 330 186 312 232C296 270 226 250 200 176z" fill="' + TEAL + '" ' + o + '/>' +
        '<circle cx="298" cy="92" r="17" fill="#FFFFFF" ' + o + '/><circle cx="268" cy="212" r="13" fill="#FFFFFF" ' + o + '/>' +
        '<path d="M204 100C212 70 226 54 244 46" ' + o + '/>';
      return wing + '<g transform="translate(400 0) scale(-1 1)">' + wing + '</g>' +
        '<ellipse cx="200" cy="158" rx="10" ry="56" fill="' + INK + '"/>' +
        '<path d="M200 14V288" stroke="#FFFFFF" stroke-width="9"/>' +
        '<path d="M200 14V288" stroke="' + GOLD + '" stroke-width="7" stroke-dasharray="16 12"/>';
    })());

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

