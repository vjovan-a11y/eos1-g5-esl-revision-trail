/* 05-g5-art-world-7.js - the Shape Studio, the world scene of Stop 7 (window.T_ART['world-shape-studio']).

   The hub header of Stop 7 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, section 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the canvas on the easel with a kite painted on it, carries data-heart.
     Layers, back to front: sky (the wall of the studio and its big window: the sun or the moon, clouds, hills), building
     (three hanging lamps, a row of five framed quadrilaterals: square, rectangle, parallelogram, rhombus, trapezium, each
     with its tick marks, arrow marks and right angles), floor (wooden boards, a round rug, splashes of paint), things:
     a bench with paint pots and a jar of brushes; Zip the painter with a beret, a brush and a palette; the easel with a
     kite on the canvas; a pinwheel with 4 identical arms and a curved quarter-turn arrow; a table with paint pots and a
     set square; a ruler on the floor.
     Maths meaning: the properties of quadrilaterals (equal sides have the same ticks, parallel sides the same arrows,
     little squares mark right angles); a kite has two pairs of equal sides next to each other; the pinwheel fits onto
     itself 4 times in a full turn (rotational symmetry of order 4).
     Palette: CSS variables on .art (--ss7-*), redefined by the class world-shape-studio-night (the dark theme):
       a dim room, a night sky with stars and the moon in the window, the lamps glow.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the clouds drift, the lamps sway, the stars twinkle, Zip bobs, the pinwheel makes a quarter turn and rests (after
       each quarter turn it looks the same). Still under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-shape-studio';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#BFE6FA', sk2: '#FFF6DA', hl: '#A9D27A', wl: '#FBF6E4', wl2: '#DDEBB0', rl: '#8DB32E', bl: '#5A4A32',
    fl: '#EBD3A6', fl2: '#DDBF8C', tl: '#C9A66E', rg: '#B9D86A', rg2: '#8DB32E', fr: '#C98E52', mat: '#FFFFFF',
    cv: '#FFFFFF', wd: '#D9A55E', wd2: '#B07A3E', wdl: '#6E4320', sh: '#8DB32E', shl: '#66861A', cld: '#FFFFFF',
    glow: '0', su: '1', mo: '0', sr: '0', cso: '.95'
  };
  const NIGHT = {
    sk1: '#141A3A', sk2: '#3A3466', hl: '#2F4A2A', wl: '#3B3F4E', wl2: '#34432A', rl: '#55701C', bl: '#1E1A14',
    fl: '#5A4A38', fl2: '#4C3E2E', tl: '#3A2E20', rg: '#55702A', rg2: '#3E5418', fr: '#7A5838', mat: '#E4E2D4',
    cv: '#F1EEDD', wd: '#7A5838', wd2: '#5E4229', wdl: '#2C1C0E', sh: '#66861A', shl: '#33440C', cld: '#4A4E78',
    glow: '1', su: '0', mo: '1', sr: '1', cso: '.5'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--ss7-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--ss7-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const INK = '#2B3A5C';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['hl', 'wl', 'wl2', 'fl', 'fl2', 'rg', 'rg2', 'fr', 'mat', 'cv', 'wd', 'wd2', 'sh', 'cld']) +
    S + 'o{stroke:var(--ss7-bl);stroke-width:2.5}' + S + 'ow{stroke:var(--ss7-wdl);stroke-width:2.4}' + S + 'os{stroke:var(--ss7-shl);stroke-width:2.4}' +
    S + 'tl{stroke:var(--ss7-tl);stroke-width:2;fill:none}' + S + 'rl{stroke:var(--ss7-rl);stroke-width:4;fill:none}' +
    S + 'ink{stroke:' + INK + ';stroke-width:2.4}' + S + 'mk{stroke:' + INK + ';stroke-width:1.8;fill:none}' +
    S + 'su{fill:#FFD86A;opacity:var(--ss7-su)}' + S + 'mo{fill:#FFF4CF;opacity:var(--ss7-mo)}' + S + 'stars{fill:#FFF4CF;opacity:var(--ss7-sr)}' +
    S + 'clouds{opacity:var(--ss7-cso)}' + S + 'glow{opacity:var(--ss7-glow)}' +
    S + 'n{fill:' + INK + ';font:800 9px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'lamp{transform-box:fill-box;transform-origin:50% 0}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    S + 'spin{transform-box:fill-box;transform-origin:50% 50%}' +
    live + 'cloud-a{animation:' + ID + '-drift 30s ease-in-out infinite alternate}' +
    live + 'cloud-b{animation:' + ID + '-drift 38s ease-in-out -12s infinite alternate-reverse}' +
    live + 'lamp{animation:' + ID + '-sway 5.2s ease-in-out infinite alternate}' +
    live + 'lamp-b{animation-delay:-2.6s}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'tw{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    live + 'spin{animation:' + ID + '-turn 7s ease-in-out infinite}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-8px)}100%{transform:translateX(10px)}}' +
    '@keyframes ' + ID + '-sway{0%{transform:rotate(-2.5deg)}100%{transform:rotate(2.5deg)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-tw{0%{opacity:1}100%{opacity:.35}}' +
    // a quarter turn, then a rest: with 4 identical arms the wheel looks the same after each quarter turn
    '@keyframes ' + ID + '-turn{0%,55%{transform:rotate(0deg)}100%{transform:rotate(90deg)}}' +
    '@media (prefers-reduced-motion:reduce){.art.is-live *{animation:none!important;transition:none!important}}' +
    'html[data-fx="1"] .art.is-live *{animation:none!important}';

  /* ---------- small drawing helpers ---------- */
  const rect = function (x, y, w, h, cls, extra) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>';
  };
  const path = function (d, cls, extra) { return '<path d="' + d + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  const use = function (id, x, y, extra) { return '<use href="#' + id + '" x="' + r1(x) + '" y="' + r1(y) + '"' + (extra ? ' ' + extra : '') + '/>'; };
  const circle = function (x, y, r, extra) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '" ' + extra + '/>'; };
  const poly = function (pts) { return 'M' + pts.map(function (p) { return r1(p[0]) + ' ' + r1(p[1]); }).join('L') + 'Z'; };
  // marks on the side from a to b, at its middle: n short ticks (equal sides) or n arrow heads (parallel sides)
  const marks = function (a, b, n, arrow) {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let d = '';
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * (arrow ? 7 : 4.5), px = mx + ux * o, py = my + uy * o;
      d += arrow
        ? 'M' + r1(px - ux * 3 - uy * 4) + ' ' + r1(py - uy * 3 + ux * 4) + 'L' + r1(px + ux * 3) + ' ' + r1(py + uy * 3) + 'L' + r1(px - ux * 3 + uy * 4) + ' ' + r1(py - uy * 3 - ux * 4)
        : 'M' + r1(px - uy * 4.5) + ' ' + r1(py + ux * 4.5) + 'L' + r1(px + uy * 4.5) + ' ' + r1(py - ux * 4.5);
    }
    return d;
  };

  /* ---------- reusable shapes (defs) ---------- */
  const defs = '<defs>' +
    '<linearGradient id="ss7-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ss7-sk1)"/><stop offset="1" style="stop-color:var(--ss7-sk2)"/></linearGradient>' +
    '<path id="ss7-cloud" d="M0 0h48c7 0 9-9 2-12 1-8-8-11-13-7-3-8-15-8-18-1-6-3-12 1-11 8-6 1-7 12 0 12z"/>' +
    // a paint pot: the fill is the colour of the paint
    '<g id="ss7-pot"><rect x="-11" y="-22" width="22" height="22" rx="3" fill="#F4F6FA" stroke="#5C6472" stroke-width="2.2"/>' +
    '<ellipse cx="0" cy="-22" rx="11" ry="4" stroke="#5C6472" stroke-width="2.2"/><path d="M-11-12h22" stroke="#5C6472" stroke-width="1.6"/><path d="M5-21v9a2.5 2.5 0 0 0 5 0v-8" stroke="none"/></g>' +
    // a hanging lamp
    '<g id="ss7-lamp"><path d="M0 0v46" stroke="#5C6472" stroke-width="2.4"/><circle cx="0" cy="72" r="7" fill="#FFE9A0" stroke="#C9A23A" stroke-width="1.8"/>' +
    '<path d="M-22 72L-10 46h20l12 26z" class="' + ID + '-sh ' + ID + '-os"/></g>' +
    '</defs>';

  /* ---------- sky: the studio wall and its big window (the sun or the moon, clouds, hills) ---------- */
  const WX = 36, WY = 60, WW = 190, WH = 196, FLOOR = 336;
  let stars = '';
  [[58, 84], [92, 120], [120, 78], [150, 140], [196, 150], [74, 168], [206, 84], [128, 176]].forEach(function (p, i) {
    stars += circle(p[0], p[1], i % 3 ? 1.6 : 2.4, '');
  });
  const sky = rect(0, 0, 800, FLOOR, 'wl') + rect(0, 292, 800, FLOOR - 292, 'wl2') + path('M0 292H800', 'rl') +
    rect(WX, WY, WW, WH, '', 'fill="url(#ss7-sky)"') +
    '<g ' + c('stars') + '><g ' + c('tw') + '>' + stars + '</g></g>' +
    circle(178, 104, 22, c('su')) + '<path d="M186 84a22 22 0 1 0 6 36 19 19 0 1 1-6-36z" ' + c('mo') + '/>' +
    '<g ' + c('clouds') + '><g ' + c('cloud-a') + '>' + use('ss7-cloud', 62, 122, c('cld')) + '</g>' +
    '<g ' + c('cloud-b') + '>' + use('ss7-cloud', 128, 170, c('cld')) + '</g></g>' +
    path('M' + WX + ' 232q46-34 92-8q50-30 98 4v28H' + WX + 'z', 'hl') +
    // the frame, the bars and the sill
    rect(WX, WY, WW, WH, '', 'rx="4" fill="none" stroke="var(--ss7-fr)" stroke-width="10"') + rect(WX - 5, WY - 5, WW + 10, WH + 10, 'o', 'rx="7"') +
    path('M' + (WX + WW / 2) + ' ' + WY + 'v' + WH + 'M' + WX + ' ' + (WY + 84) + 'h' + WW, '', 'stroke="var(--ss7-fr)" stroke-width="7"') +
    rect(WX - 14, WY + WH + 4, WW + 28, 12, 'fr o', ' rx="4"');

  /* ---------- building: the lamps and the wall of framed quadrilaterals ---------- */
  let lamps = '', glow = '';
  [318, 456, 594].forEach(function (x, i) {
    lamps += '<g ' + c('lamp' + (i % 2 ? ' lamp-b' : '')) + '>' + use('ss7-lamp', x, 0) + '</g>';
    glow += circle(x, 76, 30, 'fill="#FFE38A" opacity=".3"') + path('M' + (x - 22) + ' 74L' + (x - 70) + ' 292H' + (x + 70) + 'L' + (x + 22) + ' 74z', '', 'fill="#FFE38A" opacity=".1"');
  });
  // a framed picture: a nail and a string, a wooden frame, a white mount and the shape (drawn around the frame's middle)
  const FW = 80, FH = 76, FY = 122, Z = 1.2;
  const frame = function (x, pts, col, mk, corners) {
    const cx = x + FW / 2, cy = FY + FH / 2, P = pts.map(function (p) { return [cx + p[0] * Z, cy + p[1] * Z]; });
    let m = '', ra = '';
    mk.forEach(function (k) { m += marks(P[k[0]], P[k[1]], k[2], k[3]); });
    // right angles: a little square in each corner of a square or a rectangle (the sides lie flat and upright)
    if (corners) P.forEach(function (p) { const sx = p[0] < cx ? 5 : -5, sy = p[1] < cy ? 5 : -5; ra += 'M' + r1(p[0] + sx) + ' ' + r1(p[1]) + 'v' + sy + 'h' + (-sx); });
    return path('M' + (cx - 12) + ' ' + FY + 'L' + cx + ' ' + (FY - 12) + 'L' + (cx + 12) + ' ' + FY, 'mk') + circle(cx, FY - 12, 2.4, 'fill="' + INK + '"') +
      rect(x, FY, FW, FH, 'fr ow', ' rx="4"') + rect(x + 6, FY + 6, FW - 12, FH - 12, 'mat', 'rx="2"') +
      path(poly(P), 'ink', 'fill="' + col + '"') + path(m + ra, 'mk');
  };
  const RH = Math.sqrt(32 * 32 - 28 * 28);      // the rhombus: its slanted sides rise 28 and lean RH, so all four sides are 32 long
  const pictures =
    // a square: 4 equal sides (one tick each), 4 right angles
    frame(242, [[-18, -18], [18, -18], [18, 18], [-18, 18]], '#F7889B', [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], true) +
    // a rectangle: opposite sides equal (one tick, two ticks), 4 right angles
    frame(326, [[-24, -14], [24, -14], [24, 14], [-24, 14]], '#7CC4F2', [[0, 1, 1], [2, 3, 1], [1, 2, 2], [3, 0, 2]], true) +
    // a parallelogram: two pairs of parallel sides (one arrow, two arrows)
    frame(410, [[-12, -14], [24, -14], [12, 14], [-24, 14]], '#F7B23B', [[0, 1, 1, true], [3, 2, 1, true], [3, 0, 2, true], [2, 1, 2, true]]) +
    // a rhombus: 4 equal sides (one tick each)
    frame(494, [[-16 + RH / 2, -14], [16 + RH / 2, -14], [16 - RH / 2, 14], [-16 - RH / 2, 14]], '#A98CF0', [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]]) +
    // a trapezium: exactly one pair of parallel sides (one arrow on each)
    frame(578, [[-16, -14], [10, -14], [24, 14], [-24, 14]], '#5CCB9C', [[0, 1, 1, true], [3, 2, 1, true]]);

  /* ---------- floor: wooden boards, a round rug, splashes of paint ---------- */
  let boards = '';
  [360, 392, 432, 478].forEach(function (y) { boards += 'M0 ' + y + 'H800'; });
  for (let x = -40; x <= 840; x += 80) boards += 'M' + x + ' ' + FLOOR + 'L' + r1(400 + (x - 400) * 1.5) + ' 500';
  const floor = rect(0, FLOOR, 800, 500 - FLOOR, 'fl') + path('M0 ' + FLOOR + 'H800', '', 'stroke="var(--ss7-tl)" stroke-width="3"') + path(boards, 'tl') +
    '<ellipse cx="400" cy="398" rx="168" ry="30" ' + c('rg') + '/><ellipse cx="400" cy="398" rx="150" ry="24" fill="none" stroke="var(--ss7-rg2)" stroke-width="3" stroke-dasharray="2 10"/>' +
    path('M96 446q14-12 30-4q18-6 22 8q-4 14-24 10q-22 8-28-14z', '', 'fill="#F7889B"') + circle(160, 470, 6, 'fill="#F7889B"') +
    path('M520 462q16-10 30 0q14 4 6 14q-18 10-36-2q-8-6 0-12z', '', 'fill="#7CC4F2"') + circle(574, 452, 5, 'fill="#7CC4F2"');

  /* ---------- things ---------- */
  // a bench under the window: a jar of brushes and three paint pots
  const bench = rect(64, 300, 8, 62, 'wd2 ow') + rect(208, 300, 8, 62, 'wd2 ow') + rect(52, 292, 176, 12, 'wd ow', ' rx="4"') +
    path('M82 270L76 236M90 270V230M98 270L106 238', '', 'stroke="#B07A3E" stroke-width="3.5"') +
    path('M76 236l-2-10M90 230v-10M106 238l3-10', '', 'stroke-width="6" stroke="#E5404A"') + path('M90 230v-10', '', 'stroke-width="6" stroke="#3F8FD8"') + path('M106 238l3-10', '', 'stroke-width="6" stroke="#F7B23B"') +
    rect(76, 262, 28, 30, '', 'rx="5" fill="#CFEAF7" stroke="#5C6472" stroke-width="2.2" fill-opacity=".85"') +
    use('ss7-pot', 132, 292, 'fill="#E5404A"') + use('ss7-pot', 162, 292, 'fill="#F7B23B"') + use('ss7-pot', 192, 292, 'fill="#3F8FD8"');

  // Zip the painter, between the bench and the easel: a beret, a palette in one hand and a brush in the other
  const zip = '<g ' + c('zip') + '><g transform="translate(262 286) scale(.58)">' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="60" cy="107" r="6" fill="#E5404A"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/>' +
    // the palette (left hand) and the brush (right hand, its tip towards the canvas)
    '<path d="M-22 78q-4-20 20-22q26-2 26 16q0 16-22 18q-8 0-8-7q0-6-7-4q-8 2-9-1z" fill="#E8C690" stroke="#6E4320" stroke-width="2.6"/>' +
    '<circle cx="-8" cy="68" r="4" fill="#E5404A"/><circle cx="4" cy="63" r="4" fill="#F7B23B"/><circle cx="15" cy="68" r="4" fill="#3F8FD8"/><circle cx="12" cy="80" r="4" fill="#3FB98A"/>' +
    '<path d="M108 84L140 40" stroke="#B07A3E" stroke-width="6" stroke-linecap="round"/><path d="M140 40l7-10" stroke="#F7B23B" stroke-width="9" stroke-linecap="round"/>' +
    '<circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the beret, tipped to one side, with Zip's yellow knob on top
    '<path d="M12 30q-6-22 38-26q52-4 60 18q2 10-10 10q-44-8-82 2q-5 1-6-4z" fill="#E5404A" stroke="#8E1F2A" stroke-width="3"/>' +
    '<line x1="62" y1="5" x2="64" y2="-3" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="64" cy="-5" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/></g></g>';

  // the heart: the easel, and on its canvas a kite: two pairs of equal sides next to each other (one tick, two ticks)
  const EX = 400, K = [[EX, 250], [EX + 27, 273], [EX, 326], [EX - 27, 273]];
  const easel =
    path('M' + (EX - 24) + ' 212L' + (EX - 54) + ' 404M' + (EX + 24) + ' 212L' + (EX + 54) + ' 404M' + EX + ' 206V392', '', 'stroke="var(--ss7-wdl)" stroke-width="9"') +
    path('M' + (EX - 24) + ' 212L' + (EX - 54) + ' 404M' + (EX + 24) + ' 212L' + (EX + 54) + ' 404M' + EX + ' 206V392', '', 'stroke="var(--ss7-wd)" stroke-width="5"') +
    rect(EX - 30, 208, 60, 9, 'wd ow', ' rx="3"') + rect(EX - 60, 332, 120, 10, 'wd ow', ' rx="3"') +
    '<g data-heart="kite">' + rect(EX - 50, 222, 100, 110, 'cv ow', ' rx="3"') +
    path('M' + EX + ' 250V326M' + (EX - 27) + ' 273H' + (EX + 27), '', 'stroke="#C98A12" stroke-width="1.6" stroke-dasharray="4 4"') +
    path(poly(K), 'ink', 'fill="#F7B23B" fill-opacity=".9"') +
    path(marks(K[0], K[1], 1) + marks(K[3], K[0], 1) + marks(K[1], K[2], 2) + marks(K[2], K[3], 2), 'mk', 'style="stroke-width:2.2"') + '</g>';

  // the pinwheel: 4 identical arms around a pin, on a stick in a pot, with a quarter-turn arrow (order 4)
  const PX = 546, PY = 272;
  let arms = '';
  for (let i = 0; i < 4; i++) {
    arms += '<g transform="rotate(' + i * 90 + ')">' + path('M0 0L0-44L22-22Z', '', 'fill="#B9D86A" stroke="#4E6812" stroke-width="2.2"') +
      path('M0 0L22-22V0Z', '', 'fill="#7FA428" stroke="#4E6812" stroke-width="2.2"') + '</g>';
  }
  const A0 = -72 * Math.PI / 180, A1 = 18 * Math.PI / 180, AR = 56;       // the arrow: a quarter of a full turn
  const ax = PX + Math.cos(A1) * AR, ay = PY + Math.sin(A1) * AR;
  const pinwheel = rect(PX - 3, PY, 6, 84, 'wd ow') + path('M' + (PX - 20) + ' 350h40l-5 26h-30z', '', 'fill="#E8875A" stroke="#8E4420" stroke-width="2.4"') +
    rect(PX - 23, 344, 46, 9, '', 'rx="3" fill="#F29C70" stroke="#8E4420" stroke-width="2.4"') +
    '<g transform="translate(' + PX + ' ' + PY + ')"><g ' + c('spin') + '>' + arms + '</g>' + circle(0, 0, 5.5, 'fill="#F7B53C" stroke="#8A5A06" stroke-width="2.2"') + '</g>' +
    path('M' + r1(PX + Math.cos(A0) * AR) + ' ' + r1(PY + Math.sin(A0) * AR) + 'A' + AR + ' ' + AR + ' 0 0 1 ' + r1(ax) + ' ' + r1(ay), '', 'stroke="#D8434E" stroke-width="4" fill="none"') +
    path('M' + r1(ax - 9) + ' ' + r1(ay - 5) + 'L' + r1(ax + 1) + ' ' + r1(ay + 5) + 'L' + r1(ax + 8) + ' ' + r1(ay - 8), '', 'stroke="#D8434E" stroke-width="4" fill="none"');

  // a table on the right: three paint pots and a set square; a ruler lies on the floor in front
  const table = rect(640, 322, 8, 96, 'wd2 ow') + rect(786, 322, 8, 96, 'wd2 ow') + rect(626, 312, 184, 12, 'wd ow', ' rx="4"') +
    use('ss7-pot', 648, 312, 'fill="#3FB98A"') + use('ss7-pot', 676, 312, 'fill="#A98CF0"') +
    path('M704 312V258L786 312ZM716 302V282L746 302Z', '', 'fill="#9AD4F5" fill-opacity=".8" fill-rule="evenodd" stroke="#1E5D9F" stroke-width="2.4"') +
    path('M704 300h6v6', '', 'stroke="#1E5D9F" stroke-width="1.8" fill="none"');
  let rticks = '';
  for (let i = 1; i < 15; i++) rticks += 'M' + (i * 10) + ' 0v' + (i % 5 ? 6 : 10);
  const ruler = '<g transform="translate(606 452) rotate(-7)">' + rect(0, 0, 150, 18, '', 'rx="3" fill="#FFE08A" stroke="#A66A06" stroke-width="2.4"') + path(rticks, '', 'stroke="#A66A06" stroke-width="1.6"') + '</g>';
  // two pots of paint on the rug, by the easel
  const pots = use('ss7-pot', 474, 372, 'fill="#F7889B"') + use('ss7-pot', 498, 384, 'fill="#3F8FD8"');

  const things = bench + table + easel + pinwheel + zip + pots + ruler;

  const label = 'The Shape Studio: a bright art room with a big window. On the wall hang five framed quadrilaterals: a square, a rectangle, ' +
    'a parallelogram, a rhombus and a trapezium, with ticks on equal sides and arrows on parallel sides. On the easel is a painting of a kite. ' +
    'A pinwheel with 4 identical arms has a quarter-turn arrow. Zip the painter wears a beret and holds a brush.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="150,150,500,210" data-band="222,330" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building"><g ' + c('glow') + '>' + glow + '</g>' + lamps + pictures + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = window.T_ART || {};
  Object.assign(window.T_ART, { [ID]: svg });
})();

