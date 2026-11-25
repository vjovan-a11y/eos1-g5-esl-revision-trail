/* 05-g5-art-world-8.js - the Circle Circus, the world scene of Stop 8 (window.T_ART['world-circle-circus']).

   The hub header of Stop 8 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, section 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the circus ring with its centre, one radius and one diameter, carries data-heart.
     Layers, back to front: sky (the striped wall of the big top, fanning down from its peak, and the scalloped rim),
     building (two spotlights and their beams, two strings of bunting with little lamps, a hanging sign "d = 2 × r"),
     floor (sawdust), things: a board on which a giant pair of compasses draws a circle (its needle on the centre);
     Zip the ringmaster with a top hat and a bow tie, juggling three rings; the ring, seen from above like a plan:
     a red and white kerb, the centre (the cap of the centre pole), a rope from the centre to the edge (a radius) and a
     striped plank right across through the centre (a diameter, exactly twice the rope); a unicycle whose spokes are
     radii of its wheel; a big hoop on a stand; a tub with a ball; rings and a ball on the floor.
     Maths meaning: the parts of a circle (centre, radius, diameter), every radius of one circle has the same length,
     the diameter is 2 times the radius, and a pair of compasses draws a circle around its needle.
     Palette: CSS variables on .art (--cc8-*), redefined by the class world-circle-circus-night (the dark theme):
       the tent goes dark, the spotlights shine on the ring, the little lamps on the bunting glow.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the flags sway, the juggling rings rise and fall, the unicycle wheel turns, the little lamps twinkle, Zip bobs.
       Still under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-circle-circus';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    w1: '#E08CCB', w2: '#FFF2E2', wl: '#B55A9E', rim: '#C050A8', rim2: '#F7C33C', riml: '#7A2A68',
    fl: '#F3DCA8', fl2: '#E3C488', in: '#FBEBC4', kb: '#FFFFFF', bd: '#2F5D4A', bdl: '#6E4320',
    wd: '#D9A55E', wd2: '#B07A3E', wdl: '#6E4320', str: '#7A5A3A', sg: '#FFFFFF', sh: '#C9A765',
    glow: '0', dim: '1'
  };
  const NIGHT = {
    w1: '#5E2A56', w2: '#463A5C', wl: '#2C1230', rim: '#7A2A68', rim2: '#9A7A1E', riml: '#2C0E26',
    fl: '#5A4A3C', fl2: '#4A3C30', in: '#8A7452', kb: '#E9E2D4', bd: '#1E3E32', bdl: '#2C1C0E',
    wd: '#7A5838', wd2: '#5E4229', wdl: '#2C1C0E', str: '#B8A88E', sg: '#EFE8D8', sh: '#3A2E24',
    glow: '1', dim: '.82'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--cc8-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--cc8-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const INK = '#2B2340';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['w1', 'w2', 'rim', 'rim2', 'fl', 'fl2', 'in', 'bd', 'wd', 'wd2', 'sg', 'sh']) +
    S + 'o{stroke:var(--cc8-riml);stroke-width:2.4}' + S + 'ow{stroke:var(--cc8-wdl);stroke-width:2.4}' + S + 'ob{stroke:var(--cc8-bdl);stroke-width:4}' +
    S + 'wl{stroke:var(--cc8-wl);stroke-width:1.6;fill:none}' + S + 'str{stroke:var(--cc8-str);stroke-width:2;fill:none}' +
    S + 'ink{stroke:' + INK + ';stroke-width:2.4}' + S + 'kb{stroke:var(--cc8-kb)}' +
    S + 'glow{opacity:var(--cc8-glow)}' + S + 'dim{opacity:var(--cc8-dim)}' +
    S + 'sign{fill:' + INK + ';font:800 22px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'flag{transform-box:fill-box;transform-origin:50% 0}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    S + 'spin{transform-box:fill-box;transform-origin:50% 50%}' +
    live + 'flag{animation:' + ID + '-sway 4.6s ease-in-out infinite alternate}' +
    live + 'flag-b{animation-delay:-2.3s}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'jug{animation:' + ID + '-toss 2.8s ease-in-out infinite alternate}' +
    live + 'jug-b{animation-delay:-1.4s}' +
    live + 'spin{animation:' + ID + '-turn 24s linear infinite}' +
    live + 'tw{animation:' + ID + '-tw 3s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-sway{0%{transform:rotate(-6deg)}100%{transform:rotate(6deg)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-toss{0%{transform:translateY(3px)}100%{transform:translateY(-7px)}}' +
    '@keyframes ' + ID + '-turn{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}' +
    '@keyframes ' + ID + '-tw{0%{opacity:1}100%{opacity:.45}}' +
    '@media (prefers-reduced-motion:reduce){.art.is-live *{animation:none!important;transition:none!important}}' +
    'html[data-fx="1"] .art.is-live *{animation:none!important}';

  /* ---------- small drawing helpers ---------- */
  const rect = function (x, y, w, h, cls, extra) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>';
  };
  const path = function (d, cls, extra) { return '<path d="' + d + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  const circle = function (x, y, r, extra, cls) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  const text = function (x, y, t, cls) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" ' + c(cls) + '>' + t + '</text>'; };
  // a ring: a circle line of one colour with a thin dark edge inside and outside
  const hoop = function (x, y, r, w, col) {
    return circle(x, y, r, 'stroke="' + INK + '" stroke-width="' + (w + 3.2) + '"') + circle(x, y, r, 'stroke="' + col + '" stroke-width="' + w + '"');
  };

  /* ---------- sky: the striped wall of the big top, and its scalloped rim ---------- */
  const FLOOR = 226, AX = 400, AY = -240;
  let wall = '', seams = '';
  for (let i = 0; i < 16; i++) {
    const x0 = -320 + i * 90;
    wall += path('M' + AX + ' ' + AY + 'L' + x0 + ' ' + FLOOR + 'h90z', i % 2 ? 'w2' : 'w1');
    seams += 'M' + AX + ' ' + AY + 'L' + x0 + ' ' + FLOOR;
  }
  let rim = '';
  for (let i = 0; i < 16; i++) rim += path('M' + (i * 50) + ' 0h50v16a25 15 0 0 1-50 0z', (i % 2 ? 'rim2' : 'rim') + ' o');
  const sky = wall + path(seams, 'wl') + rim;

  /* ---------- building: spotlights, bunting with little lamps, a hanging sign ---------- */
  const CX = 400, CY = 296, R = 42;           // the ring: its centre and its radius
  const beams = path('M96 40L' + (CX - 86) + ' ' + (CY + 30) + 'H' + (CX + 60) + 'L132 34z', '', 'fill="#FFE9A0" opacity=".2"') +
    path('M704 40L' + (CX + 86) + ' ' + (CY + 30) + 'H' + (CX - 60) + 'L668 34z', '', 'fill="#FFE9A0" opacity=".2"') +
    '<ellipse cx="' + CX + '" cy="' + (CY + 4) + '" rx="96" ry="72" fill="#FFE9A0" opacity=".22"/>';
  const spot = function (x, flip) {
    return '<g transform="translate(' + x + ' 30) scale(' + (flip ? -1 : 1) + ' 1)">' + path('M0-30V-6', '', 'stroke="#5C6472" stroke-width="5"') +
      path('M-18-8l30-8l10 22l-28 12z', '', 'fill="#5C6472" stroke="#2B2340" stroke-width="2.4"') + path('M-6 18l28-12', '', 'stroke="#FFE9A0" stroke-width="5"') + '</g>';
  };
  const Q = function (x0, y0, xc, yc, x1, y1, t) { const u = 1 - t; return [u * u * x0 + 2 * u * t * xc + t * t * x1, u * u * y0 + 2 * u * t * yc + t * t * y1]; };
  const FLAG = ['#F7C33C', '#3FB9C8', '#E5404A', '#7CC465'];
  let bunting = '', bulbs = '';
  [[0, 44, 200, 122, 400, 56], [400, 56, 600, 122, 800, 44]].forEach(function (sg, si) {
    bunting += path('M' + sg[0] + ' ' + sg[1] + 'Q' + sg[2] + ' ' + sg[3] + ' ' + sg[4] + ' ' + sg[5], 'str');
    for (let i = 0; i < 9; i++) {
      const p = Q(sg[0], sg[1], sg[2], sg[3], sg[4], sg[5], 0.06 + i * 0.11);
      bunting += '<g ' + c('flag' + (i % 2 ? ' flag-b' : '')) + '>' + path('M' + r1(p[0] - 9) + ' ' + r1(p[1]) + 'h18l-9 22z', '', 'fill="' + FLAG[(i + si) % 4] + '" stroke="' + INK + '" stroke-width="1.8"') + '</g>';
      if (i < 8) {
        const b = Q(sg[0], sg[1], sg[2], sg[3], sg[4], sg[5], 0.115 + i * 0.11);
        bunting += circle(b[0], b[1] + 3, 3.4, 'fill="#FFE9A0" stroke="#C9A23A" stroke-width="1.2"');
        bulbs += circle(b[0], b[1] + 3, 9, 'fill="#FFE38A" opacity=".55"');
      }
    }
  });
  // the sign over the ring: the diameter is 2 times the radius
  const sign = path('M352 14V150M448 14V150', 'str') + rect(334, 148, 132, 40, 'sg', 'rx="8" stroke="' + INK + '" stroke-width="2.6"') + text(400, 176, 'd = 2 × r', 'sign');

  /* ---------- floor: sawdust ---------- */
  let dust = '';
  [[60, 262], [150, 300], [236, 250], [330, 392], [470, 420], [560, 262], [664, 300], [744, 256], [90, 372], [200, 430], [300, 470], [420, 462], [540, 392], [640, 440],
    [716, 380], [770, 462], [40, 470], [500, 246], [280, 318]].forEach(function (p, i) {
    dust += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + (i % 3 ? 10 : 16) + '" ry="' + (i % 3 ? 2.6 : 3.6) + '"/>';
  });
  const floor = rect(0, FLOOR, 800, 500 - FLOOR, 'fl') + path('M0 ' + FLOOR + 'H800', '', 'stroke="var(--cc8-riml)" stroke-width="3"') + '<g ' + c('fl2') + '>' + dust + '</g>';

  /* ---------- things ---------- */
  // on the left: a board on legs, and a giant pair of compasses drawing a circle on it (needle on the centre, pencil on the circle)
  const BX = 150, BY = 262, BR = 46, BA = -28 * Math.PI / 180;
  const tip = [BX + Math.cos(BA) * BR, BY + Math.sin(BA) * BR];
  const mx = (BX + tip[0]) / 2, my = (BY + tip[1]) / 2, dl = BR, nx = -(tip[1] - BY) / dl, ny = (tip[0] - BX) / dl;   // the unit normal of the gap
  const hinge = [mx - nx * 96, my - ny * 96], knob = [mx - nx * 116, my - ny * 116];                                  // both legs have the same length
  const A2 = 14 * Math.PI / 180;                                                                                      // the chalk line so far: almost a full turn
  const compasses = path('M88 322L76 398M212 322L224 398', 'ow', 'style="stroke-width:6"') +
    rect(70, 194, 160, 136, 'bd ob', 'rx="6"') +
    path('M' + r1(BX + Math.cos(A2) * BR) + ' ' + r1(BY + Math.sin(A2) * BR) + 'A' + BR + ' ' + BR + ' 0 1 1 ' + r1(tip[0]) + ' ' + r1(tip[1]), '', 'stroke="#FFFFFF" stroke-width="3.4"') +
    circle(BX, BY, 3.6, 'fill="#FFFFFF"') +
    path('M' + r1(knob[0]) + ' ' + r1(knob[1]) + 'L' + r1(hinge[0]) + ' ' + r1(hinge[1]), '', 'stroke="#5C6472" stroke-width="7"') +
    path('M' + r1(hinge[0]) + ' ' + r1(hinge[1]) + 'L' + BX + ' ' + BY + 'M' + r1(hinge[0]) + ' ' + r1(hinge[1]) + 'L' + r1(tip[0]) + ' ' + r1(tip[1]), '', 'stroke="#2B2340" stroke-width="8.4"') +
    path('M' + r1(hinge[0]) + ' ' + r1(hinge[1]) + 'L' + BX + ' ' + BY, '', 'stroke="#AEB8C8" stroke-width="5"') +
    path('M' + r1(hinge[0]) + ' ' + r1(hinge[1]) + 'L' + r1(tip[0]) + ' ' + r1(tip[1]), '', 'stroke="#F7C33C" stroke-width="5"') +
    circle(hinge[0], hinge[1], 7, 'fill="#E5404A" stroke="#2B2340" stroke-width="2.4"');

  // Zip the ringmaster, beside the ring: a top hat, a bow tie, and three juggling rings in the air
  const zip = '<g ' + c('jug') + '>' + hoop(254, 262, 11, 4, '#3FB9C8') + '</g><g ' + c('jug jug-b') + '>' + hoop(290, 240, 11, 4, '#F7C33C') + '</g>' +
    '<g ' + c('jug') + '>' + hoop(326, 262, 11, 4, '#E5404A') + '</g>' +
    '<g ' + c('zip') + '><g transform="translate(256 292) scale(.58)">' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="60" cy="110" r="5" fill="#F7C33C"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the bow tie, then the top hat with its band and Zip's yellow knob on top
    '<path d="M60 95L44 86v18zM60 95L76 86v18z" fill="#E5404A" stroke="#8E1F2A" stroke-width="2.5"/><circle cx="60" cy="95" r="4" fill="#E5404A" stroke="#8E1F2A" stroke-width="2.5"/>' +
    '<rect x="36" y="-14" width="48" height="38" rx="4" fill="#2B2340" stroke="#120C22" stroke-width="3"/><rect x="36" y="10" width="48" height="10" fill="#C050A8"/>' +
    '<rect x="20" y="19" width="80" height="9" rx="4.5" fill="#2B2340" stroke="#120C22" stroke-width="3"/>' +
    '<line x1="60" y1="-14" x2="60" y2="-21" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="-24" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/></g></g>';

  // the heart: the ring, seen from above. The kerb, the centre, a rope from the centre to the edge (a radius, R long)
  // and a striped plank right across through the centre (a diameter, 2 × R long)
  const RA = -52 * Math.PI / 180, rx = CX + Math.cos(RA) * R, ry = CY + Math.sin(RA) * R;
  const ring = '<ellipse cx="' + (CX + 3) + '" cy="' + (CY + 8) + '" rx="' + (R + 9) + '" ry="' + (R + 7) + '" ' + c('sh') + ' opacity=".55"/>' +
    '<g data-heart="ring">' +
    circle(CX, CY, R + 3.5, 'stroke="#D8434E" stroke-width="7"', 'in') +
    circle(CX, CY, R + 3.5, 'stroke-width="7" stroke-dasharray="' + r1(2 * Math.PI * (R + 3.5) / 24) + '" fill="none" style="stroke-linecap:butt"', 'kb') +
    circle(CX, CY, R + 7, 'stroke="' + INK + '" stroke-width="2.4"') + circle(CX, CY, R, 'stroke="' + INK + '" stroke-width="2.4"') +
    // the diameter: from edge to edge through the centre
    rect(CX - R, CY - 5, 2 * R, 10, '', 'fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.2"') +
    path('M' + (CX - R) + ' ' + CY + 'H' + (CX + R), '', 'stroke="#3F8FD8" stroke-width="7.8" stroke-dasharray="8 8" style="stroke-linecap:butt"') +
    // the radius: from the centre to the edge
    path('M' + CX + ' ' + CY + 'L' + r1(rx) + ' ' + r1(ry), '', 'stroke="#6E4320" stroke-width="6"') +
    path('M' + CX + ' ' + CY + 'L' + r1(rx) + ' ' + r1(ry), '', 'stroke="#F2C777" stroke-width="3" stroke-dasharray="4 3" style="stroke-linecap:butt"') +
    circle(rx, ry, 4, 'fill="#F7C33C" stroke="#6E4320" stroke-width="2"') +
    // the centre
    circle(CX, CY, 7, 'fill="#F7C33C" stroke="' + INK + '" stroke-width="2.4"') + circle(CX, CY, 2.6, 'fill="' + INK + '"') + '</g>';

  // a unicycle: every spoke is a radius of the wheel
  const UX = 522, UY = 316, UR = 27;
  let spokes = '';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; spokes += 'M0 0L' + r1(Math.cos(a) * UR) + ' ' + r1(Math.sin(a) * UR); }
  const unicycle = '<ellipse cx="' + UX + '" cy="' + (UY + UR + 4) + '" rx="30" ry="5" ' + c('sh') + ' opacity=".6"/>' +
    '<g transform="translate(' + UX + ' ' + UY + ')"><g ' + c('spin') + '>' + circle(0, 0, UR, 'stroke="#2B2340" stroke-width="6" fill="#FFFFFF" fill-opacity=".35"') +
    path(spokes, '', 'stroke="#8A93A6" stroke-width="2"') + '</g></g>' +
    path('M' + UX + ' ' + UY + 'V' + (UY - 58), '', 'stroke="#2B2340" stroke-width="8"') + path('M' + UX + ' ' + UY + 'V' + (UY - 58), '', 'stroke="#E5404A" stroke-width="4.4"') +
    path('M' + (UX - 10) + ' ' + (UY + 8) + 'L' + (UX + 10) + ' ' + (UY - 8), '', 'stroke="#2B2340" stroke-width="4"') +
    rect(UX - 18, UY + 6, 12, 5, '', 'rx="2" fill="#2B2340"') + rect(UX + 6, UY - 11, 12, 5, '', 'rx="2" fill="#2B2340"') +
    circle(UX, UY, 5, 'fill="#F7C33C" stroke="#2B2340" stroke-width="2.2"') +
    path('M' + (UX - 17) + ' ' + (UY - 62) + 'q17-9 34 0q-2 9-17 8q-15 1-17-8z', '', 'fill="#C050A8" stroke="#2B2340" stroke-width="2.4"');

  // a big hoop on a stand, and a tub with a ball on it
  const HX = 610;
  const bigHoop = '<ellipse cx="' + HX + '" cy="368" rx="34" ry="6" ' + c('sh') + ' opacity=".6"/>' +
    path('M' + HX + ' 290V360', '', 'stroke="#2B2340" stroke-width="9"') + path('M' + HX + ' 290V360', '', 'stroke="#AEB8C8" stroke-width="5"') +
    path('M' + (HX - 30) + ' 368q30-16 60 0z', '', 'fill="#AEB8C8" stroke="#2B2340" stroke-width="2.4"') +
    hoop(HX, 242, 46, 8, '#F59E2A') + circle(HX, 242, 46, 'stroke="#FFE08A" stroke-width="3" stroke-dasharray="3 15"');
  const tub = '<ellipse cx="724" cy="372" rx="52" ry="8" ' + c('sh') + ' opacity=".6"/>' +
    path('M684 318h80l-10 52h-60z', '', 'fill="#E5404A" stroke="#2B2340" stroke-width="2.4"') + path('M704 318l4 52M724 318v52M744 318l-4 52', '', 'stroke="#FFFFFF" stroke-width="5" opacity=".9"') +
    rect(678, 308, 92, 12, '', 'rx="5" fill="#F7C33C" stroke="#2B2340" stroke-width="2.4"') +
    circle(724, 282, 26, 'fill="#3FB9C8" stroke="#2B2340" stroke-width="2.4"') + path('M698 282h52M724 256v52', '', 'stroke="#FFFFFF" stroke-width="3" opacity=".85"') +
    circle(724, 282, 26, 'stroke="#2B2340" stroke-width="2.4"');
  // in front: three rings lying on the sawdust and a striped ball
  const front = hoop(150, 430, 22, 5, '#E5404A') + hoop(182, 448, 22, 5, '#3FB9C8') + hoop(122, 456, 22, 5, '#F7C33C') +
    '<ellipse cx="628" cy="462" rx="26" ry="5" ' + c('sh') + ' opacity=".6"/>' + circle(626, 436, 24, 'fill="#F7C33C" stroke="#2B2340" stroke-width="2.4"') +
    path('M602 436h48', '', 'stroke="#C050A8" stroke-width="9"') + circle(626, 436, 24, 'stroke="#2B2340" stroke-width="2.4"');

  // a low stand with a star, in front of the ring
  const stand = '<ellipse cx="420" cy="470" rx="44" ry="6" ' + c('sh') + ' opacity=".6"/>' +
    path('M388 432h64l8 36h-80z', '', 'fill="#C050A8" stroke="#2B2340" stroke-width="2.4"') + rect(382, 424, 76, 11, '', 'rx="5" fill="#F7C33C" stroke="#2B2340" stroke-width="2.4"') +
    path('M420 440l3.2 6.6 7.2 1-5.2 5 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5 7.2-1z', '', 'fill="#FFE08A" stroke="#2B2340" stroke-width="1.6"');

  const things = '<g ' + c('dim') + '>' + compasses + tub + bigHoop + front + stand + '</g>' + ring + unicycle + zip;

  const label = 'The Circle Circus: inside a striped big top with bunting. On the floor is a round ring with its centre marked, a rope from ' +
    'the centre to the edge (a radius) and a striped plank right across through the centre (a diameter). A sign says d = 2 × r. ' +
    'A giant pair of compasses draws a circle on a board. There is a unicycle with spokes, a big hoop and juggling rings. ' +
    'Zip the ringmaster wears a top hat.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="150,150,500,210" data-band="232,325" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + spot(114, false) + spot(686, true) + '<g ' + c('glow') + '><g ' + c('tw') + '>' + bulbs + '</g></g>' + bunting + sign + '</g>' +
    '<g data-layer="floor">' + floor + '<g ' + c('glow') + '>' + beams + '</g></g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = window.T_ART || {};
  Object.assign(window.T_ART, { [ID]: svg });
})();

