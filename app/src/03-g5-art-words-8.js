/* 03-g5-art-words-8.js - the Stop 8 word card pictures (Circles), flat style of 03-art-words.js.

   w-circle, w-centre, w-radius, w-diameter, w-circumference     the parts of a circle (viewBox 400 x 300)
   w-compasses, w-construct                                      the tool, and drawing exactly with tools
   w-double, w-half                                              two times as much, one of two equal parts

   Stop colours: magenta #C050A8 / #92367E; gold #F5A623 points at the thing meant.
   No word is written in a picture (the Words quiz asks for the word). */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const FONT = 'font-family="Arial, Helvetica, sans-serif" font-weight="700"';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  const MAG = '#C050A8', MAG_D = '#92367E', MAG_L = '#F6DDF0', GOLD = '#F5A623', GOLD_L = '#FFF1CF';
  const TEAL = '#17A2B0', BLUE = '#2F7FD4', AMBER = '#E89B12';

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
  const RAD = Math.PI / 180;

  function line(a, b, color, sw) {
    return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="' + (color || INK) + '" stroke-width="' + (sw || 5) + '"/>';
  }

  function dot(p, r, fill) {
    return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + r + '" fill="' + (fill || INK) + '" ' + o + '/>';
  }

  // the pale disc that the part pictures share
  function disc(cx, cy, r, edge, sw) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + MAG_L + '" stroke="' + (edge || MAG_D) + '" stroke-width="' + (sw || 6) + '"/>';
  }

  function arrow(a, b, color, sw) {
    const w = sw || 7, L = 18, t = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const e = function (d) { return f(b[0] - L * Math.cos(t + d)) + ' ' + f(b[1] - L * Math.sin(t + d)); };
    return line(a, b, color, w) +
      '<path d="M' + e(0.55) + 'L' + f(b[0]) + ' ' + f(b[1]) + 'L' + e(-0.55) + '" stroke="' + (color || INK) + '" stroke-width="' + w + '"/>';
  }

  // a curved arrow on the circle (cx, cy, r) from angle a0 to a1 in degrees (clockwise on the screen when a1 > a0)
  function turn(cx, cy, r, a0, a1, color, sw) {
    const w = sw || 7, dir = a1 > a0 ? 1 : -1, L = 18;
    const at = function (a) { return [cx + r * Math.cos(a * RAD), cy + r * Math.sin(a * RAD)]; };
    const p0 = at(a0), pm = at((a0 + a1) / 2), p1 = at(a1);
    const t = a1 * RAD + dir * Math.PI / 2 - dir * (L / r) * 0.5;
    const e = function (d) { return f(p1[0] - L * Math.cos(t + d)) + ' ' + f(p1[1] - L * Math.sin(t + d)); };
    const seg = function (p) { return 'A' + r + ' ' + r + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + f(p[0]) + ' ' + f(p[1]); };
    return '<path d="M' + f(p0[0]) + ' ' + f(p0[1]) + seg(pm) + seg(p1) + '" stroke="' + (color || GOLD) + '" stroke-width="' + w + '"/>' +
      '<path d="M' + e(0.6) + 'L' + f(p1[0]) + ' ' + f(p1[1]) + 'L' + e(-0.6) + '" stroke="' + (color || GOLD) + '" stroke-width="' + w + '"/>';
  }

  // a pair of compasses: hinge h, needle point n, pencil point p
  function compasses(h, n, p) {
    const cut = function (a, b, back) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [b[0] - (b[0] - a[0]) / L * back, b[1] - (b[1] - a[1]) / L * back]; };
    const leg = function (a, b) { return line(a, b, INK, 21) + line(a, b, '#B8C4D2', 15); };
    const n1 = cut(h, n, 34), p1 = cut(h, p, 74), p2 = cut(h, p, 22);
    const ux = (p[0] - h[0]) / Math.hypot(p[0] - h[0], p[1] - h[1]), uy = (p[1] - h[1]) / Math.hypot(p[0] - h[0], p[1] - h[1]);
    const side = function (q, k) { return f(q[0] - uy * k) + ' ' + f(q[1] + ux * k); };
    const up = [h[0] - (n[0] + p[0] - 2 * h[0]) / Math.hypot(n[0] + p[0] - 2 * h[0], n[1] + p[1] - 2 * h[1]) * 34,
      h[1] - (n[1] + p[1] - 2 * h[1]) / Math.hypot(n[0] + p[0] - 2 * h[0], n[1] + p[1] - 2 * h[1]) * 34];
    return line(h, up, INK, 19) + line(h, up, MAG, 13) +
      leg(h, n1) + line(n1, n, INK, 6) +
      leg(h, p1) +
      '<path d="M' + side(p1, 12) + 'L' + side(p2, 12) + 'L' + f(p[0]) + ' ' + f(p[1]) + 'L' + side(p2, -12) + 'L' + side(p1, -12) + 'z" fill="' + AMBER + '" ' + o + '/>' +
      '<path d="M' + side(p2, 12) + 'L' + f(p[0]) + ' ' + f(p[1]) + 'L' + side(p2, -12) + 'z" fill="#FBE3B4" ' + o + '/>' +
      '<circle cx="' + f(h[0]) + '" cy="' + f(h[1]) + '" r="19" fill="' + MAG + '" ' + o + '/><circle cx="' + f(h[0]) + '" cy="' + f(h[1]) + '" r="6" fill="#FFFFFF"/>';
  }

  // a measured line from x to x + cm * 40 on the line y, with a small tick at every centimetre
  function bar(x, y, cm, color) {
    let s = line([x, y], [x + cm * 40, y], color, 12);
    for (let i = 0; i <= cm; i++) s += line([x + i * 40, y - (i % cm ? 9 : 17)], [x + i * 40, y + (i % cm ? 9 : 17)], INK, i % cm ? 3 : 5);
    return s;
  }

  function badge(x, y, text) {
    return '<rect x="' + x + '" y="' + y + '" width="104" height="70" rx="18" fill="' + GOLD_L + '" stroke="' + GOLD + '" stroke-width="5"/>' +
      txt(x + 52, y + 51, 46, text);
  }

  const ART = {};

  /* ---------- the parts of a circle ---------- */

  ART['w-circle'] = word('w-circle', 'A perfectly round flat shape, like a coin or a wheel.',
    '<circle cx="200" cy="150" r="122" fill="' + MAG + '" stroke="' + INK + '" stroke-width="5"/>' +
    '<path d="M112 108a98 98 0 0 1 58-52" stroke="#FFFFFF" stroke-width="10" opacity=".55"/>');

  ART['w-centre'] = word('w-centre', 'A round shape with a bold gold dot exactly in the middle. An arrow points to the dot.',
    disc(200, 150, 122) +
    arrow([318, 48], [226, 128], INK, 8) +
    '<circle cx="200" cy="150" r="30" fill="' + GOLD_L + '"/>' + dot([200, 150], 17, GOLD));

  ART['w-radius'] = word('w-radius', 'A round shape with one gold line from the middle dot out to the edge.',
    (function () {
      const c = [200, 150], e = [200 + 122 * Math.cos(-30 * RAD), 150 + 122 * Math.sin(-30 * RAD)];
      return disc(200, 150, 122) + line(c, e, INK, 15) + line(c, e, GOLD, 10) + dot(c, 10) + dot(e, 10, GOLD);
    })());

  ART['w-diameter'] = word('w-diameter', 'A round shape with one gold line from edge to edge, straight through the middle dot.',
    (function () {
      const a = [200 - 122 * Math.cos(20 * RAD), 150 + 122 * Math.sin(20 * RAD)], b = [200 + 122 * Math.cos(20 * RAD), 150 - 122 * Math.sin(20 * RAD)];
      return disc(200, 150, 122) + line(a, b, INK, 15) + line(a, b, GOLD, 10) + dot(a, 10, GOLD) + dot(b, 10, GOLD) + dot([200, 150], 10);
    })());

  ART['w-circumference'] = word('w-circumference', 'A round shape. Its whole edge is a thick gold line, and a curved arrow goes all the way round it.',
    '<circle cx="200" cy="150" r="96" fill="#FFFFFF" stroke="' + INK + '" stroke-width="20"/>' +
    '<circle cx="200" cy="150" r="96" stroke="' + GOLD + '" stroke-width="14"/>' +
    turn(200, 150, 132, -75, 255, MAG_D, 8));

  /* ---------- the tool, and drawing with tools ---------- */

  ART['w-compasses'] = word('w-compasses', 'A drawing tool with two legs joined at the top: one leg has a sharp point and the other leg holds a pencil.',
    '<ellipse cx="200" cy="270" rx="120" ry="10" fill="' + MAG_L + '"/>' +
    compasses([200, 66], [112, 272], [288, 272]));

  ART['w-construct'] = word('w-construct', 'The drawing tool with a point and a pencil is in the middle of drawing an exact curve. A ruler lies beside it.',
    (function () {
      const n = [120, 220], r = 170, a = -9, p = [n[0] + r * Math.cos(a * RAD), n[1] + r * Math.sin(a * RAD)];
      const m = [(n[0] + p[0]) / 2, (n[1] + p[1]) / 2], L = Math.hypot(p[0] - n[0], p[1] - n[1]);
      const h = [m[0] + (p[1] - n[1]) / L * 104, m[1] - (p[0] - n[0]) / L * 104];
      const s0 = [n[0] + r * Math.cos(-118 * RAD), n[1] + r * Math.sin(-118 * RAD)];
      let ruler = '<rect x="24" y="246" width="352" height="42" rx="6" fill="#FBE3B4" ' + o + '/>';
      for (let i = 0; i <= 16; i++) ruler += '<path d="M' + (40 + i * 20) + ' 246v' + (i % 2 ? 10 : 18) + '" ' + o + '/>';
      return ruler +
        '<path d="M' + f(s0[0]) + ' ' + f(s0[1]) + 'A' + r + ' ' + r + ' 0 0 1 ' + f(p[0]) + ' ' + f(p[1]) + '" stroke="' + GOLD + '" stroke-width="9"/>' +
        compasses(h, n, p) + dot(n, 6);
    })());

  /* ---------- double and half ---------- */

  ART['w-double'] = word('w-double', 'A line of 3 cm. Below it, a line that is two times as long: 6 cm. The sign says times 2.',
    txt(82, 62, 36, '3 cm') + bar(22, 92, 3, MAG) +
    arrow([82, 124], [82, 176], GOLD, 8) +
    bar(22, 214, 6, MAG) + txt(142, 276, 36, '6 cm') +
    badge(280, 100, '× 2'));

  ART['w-half'] = word('w-half', 'A line of 6 cm is cut into two equal parts of 3 cm. One part is gold. The sign says divide by 2.',
    txt(142, 56, 36, '6 cm') + bar(22, 86, 6, MAG) +
    arrow([142, 114], [142, 158], INK, 7) +
    '<path d="M22 204h112" stroke="' + INK + '" stroke-width="17"/><path d="M22 204h112" stroke="' + GOLD + '" stroke-width="11"/>' +
    '<path d="M150 204h112" stroke="' + INK + '" stroke-width="17"/><path d="M150 204h112" stroke="' + MAG_L + '" stroke-width="11"/>' +
    '<path d="M142 176v56" stroke="' + INK + '" stroke-width="4" stroke-dasharray="7 7"/>' +
    txt(78, 268, 34, '3 cm') + txt(206, 268, 34, '3 cm', '#8B93A1') +
    badge(286, 110, '÷ 2'));

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

