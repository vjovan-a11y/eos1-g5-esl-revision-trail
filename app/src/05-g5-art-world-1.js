/* 05-g5-art-world-1.js - the Decimal Lab, the world scene of Stop 1 (window.T_ART['world-decimal-lab']).

   The hub header of Stop 1 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the window of the digit-sliding machine (the tiles 3 7 . 5 and the fixed decimal point), carries data-heart.
     Layers, back to front: sky (the lab wall, a window with the sun or the moon), building (shelves with flasks and jars,
     hanging lamps, the wall chart: a place value chart O . t h th that shows 3 . 7 5, a card "0.1" with one tenth of a
     bar shaded), floor (pale tiles), things: a long lab bench; on it Zip in goggles and a lab coat, the digit-sliding
     machine (the tiles 3, 7, 5 have slid one place to the left past the fixed decimal point: 3.75 x 10 = 37.5; the arrow
     "x10" is lit, the arrow "÷10" points the other way; a lever on its side), and a tray with one whole square (100 small
     squares), a tenth strip and a tiny hundredth square; a stool and a crate on the floor.
     Maths meaning: decimal place value (the chart, the tray), multiplying and dividing by 10 (the machine: the digits
     move, the decimal point stays).
     Palette: CSS variables on .art (--dl-*), redefined by the class world-decimal-lab-night (the dark theme):
       a dark room, the lamps and the machine window glow, the moon and stars in the window.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the lever rocks, the bubbles rise, the machine lights blink, the stars twinkle, Zip bobs. Still under reduced
       motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-decimal-lab';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    wl1: '#FFDCE8', wl2: '#FFF3F0', wl3: '#F8C4D6', ln: '#7A3550', fl: '#F6E9E1', tl: '#E2CBBE', sk1: '#AEDDF7', sk2: '#EAF8FF',
    sh: '#DDA56C', sh2: '#B67C45', bn: '#FFFFFF', bn2: '#E0548A', bn3: '#C43F74', mc: '#F283AC', mc2: '#FFE1EB', wn: '#FFFDF4',
    gl: '#EEF9FC', ch: '#FFFFFF', lp: '#AE3465', lb: '#FFF6D6', st: '#9AA7B8',
    glow: '0', su: '1', mo: '0', sr: '0'
  };
  const NIGHT = {
    wl1: '#24121F', wl2: '#44243C', wl3: '#562E49', ln: '#190B15', fl: '#3B2A39', tl: '#2B1D2A', sk1: '#10173A', sk2: '#2E3266',
    sh: '#7A5338', sh2: '#573824', bn: '#C9BCCB', bn2: '#8E3059', bn3: '#6C2143', mc: '#A5426E', mc2: '#D69AB4', wn: '#FFF1B0',
    gl: '#8C9DB2', ch: '#E4D8E0', lp: '#7A2A4E', lb: '#FFE27A', st: '#5C6578',
    glow: '1', su: '0', mo: '1', sr: '1'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--dl-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--dl-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['wl3', 'fl', 'sh', 'sh2', 'bn', 'bn2', 'bn3', 'mc', 'mc2', 'wn', 'gl', 'ch', 'lp', 'lb', 'st']) +
    S + 'o{stroke:var(--dl-ln);stroke-width:2.5}' + S + 'o2{stroke:var(--dl-ln);stroke-width:1.8}' +
    S + 'tl{stroke:var(--dl-tl);stroke-width:2;fill:none}' +
    S + 'su{fill:#FFE08A;opacity:var(--dl-su)}' + S + 'mo{fill:#FFF4CF;opacity:var(--dl-mo)}' +
    S + 'stars{fill:#FFF4CF;opacity:var(--dl-sr)}' + S + 'glow{opacity:var(--dl-glow)}' +
    S + 'd{fill:#10305E;font:800 23px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'cd{fill:#10305E;font:800 30px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'hd{fill:#10305E;font:800 15px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'ar{fill:#10305E;font:800 14px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'sm{fill:#10305E;font:800 17px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'lever{transform-box:fill-box;transform-origin:0% 100%}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    live + 'lever{animation:' + ID + '-rock 5s ease-in-out infinite alternate}' +
    live + 'bub{animation:' + ID + '-rise 4.5s ease-in infinite}' +
    live + 'bub-b{animation-delay:-1.5s}' + live + 'bub-c{animation-delay:-3s}' +
    live + 'led{animation:' + ID + '-tw 2.8s ease-in-out infinite alternate}' +
    live + 'led-b{animation-delay:-1.4s}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'stars{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-rock{0%{transform:rotate(-5deg)}100%{transform:rotate(7deg)}}' +
    '@keyframes ' + ID + '-rise{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-22px);opacity:0}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-tw{0%{opacity:1}100%{opacity:.35}}' +
    '@media (prefers-reduced-motion:reduce){.art.is-live *{animation:none!important;transition:none!important}}' +
    'html[data-fx="1"] .art.is-live *{animation:none!important}';

  /* ---------- small drawing helpers ---------- */
  // class names and other attributes; a class="..." at the start of extra is merged with cls (one class attribute only)
  const at = function (cls, extra) {
    const m = /^class="([^"]*)"\s*/.exec(extra || '');
    const rest = m ? extra.slice(m[0].length) : (extra || '');
    const k = (cls ? ID + '-' + cls.split(' ').join(' ' + ID + '-') : '') + (m ? (cls ? ' ' : '') + m[1] : '');
    return (k ? ' class="' + k + '"' : '') + (rest ? ' ' + rest : '');
  };
  const rect = function (x, y, w, h, cls, extra) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + at(cls, extra) + '/>';
  };
  const path = function (d, cls, extra) { return '<path d="' + d + '"' + at(cls, extra) + '/>'; };
  const circ = function (x, y, r, cls, extra) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"' + at(cls, extra) + '/>'; };
  const text = function (x, y, t, cls) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" ' + c(cls) + '>' + t + '</text>'; };
  // place colours (fixed): ones, tenths, hundredths, thousandths
  const PC = ['#8CCBF5', '#8FDDB0', '#FBCB78', '#CDB9F5'];

  const defs = '<defs>' +
    '<linearGradient id="dl-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--dl-wl1)"/><stop offset="1" style="stop-color:var(--dl-wl2)"/></linearGradient>' +
    '<linearGradient id="dl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--dl-sk1)"/><stop offset="1" style="stop-color:var(--dl-sk2)"/></linearGradient>' +
    '</defs>';

  /* ---------- sky: the lab wall and a window with the sun or the moon ---------- */
  const FLOOR = 350;
  let stars = '';
  [[44, 76], [70, 104], [96, 70], [112, 120], [52, 136], [84, 150]].forEach(function (p, i) { stars += circ(p[0], p[1], i % 2 ? 1.6 : 2.3); });
  const sky = rect(0, 0, 800, FLOOR, '', 'fill="url(#dl-wall)"') + rect(0, 318, 800, 32, 'wl3') +
    path('M0 318H800', '', 'stroke="var(--dl-ln)" stroke-width="2" opacity=".35"') +
    rect(26, 54, 104, 118, '', 'rx="10" fill="url(#dl-sky)" stroke="var(--dl-ln)" stroke-width="3"') +
    '<g ' + c('stars') + '>' + stars + '</g>' + circ(98, 92, 17, 'su') +
    '<path d="M104 76a18 18 0 1 0 6 30 15 15 0 1 1-6-30z" ' + c('mo') + '/>' +
    path('M78 54V172M26 113H130', '', 'stroke="var(--dl-ln)" stroke-width="3"') + rect(18, 170, 120, 9, 'bn', c('o') + ' rx="4"');

  /* ---------- building: lamps, shelves with flasks, the place value chart, a tenth card ---------- */
  // a conical flask, a round flask and a jar, each standing on the line y
  const flask = function (x, y, col) {
    return path('M' + (x - 5) + ' ' + (y - 34) + 'h10v11l11 18q3 5-3 5h-26q-6 0-3-5l11-18z', 'gl', c('o2')) +
      path('M' + (x - 9) + ' ' + (y - 13) + 'h18l6 9q2 3-2 3h-26q-4 0-2-3z', '', 'fill="' + col + '"') + path('M' + (x - 8) + ' ' + (y - 34) + 'h16', '', c('o2'));
  };
  const bulb = function (x, y, col) {
    return rect(x - 4, y - 36, 8, 14, 'gl', c('o2')) + circ(x, y - 13, 13, 'gl', c('o2')) +
      path('M' + (x - 12) + ' ' + (y - 11) + 'a12 12 0 0 0 24 0z', '', 'fill="' + col + '"') + path('M' + (x - 7) + ' ' + (y - 36) + 'h14', '', c('o2'));
  };
  const jar = function (x, y, col) {
    return rect(x - 11, y - 28, 22, 28, 'gl', c('o2') + ' rx="4"') + rect(x - 10, y - 15, 20, 14, '', 'rx="3" fill="' + col + '"') +
      rect(x - 13, y - 33, 26, 7, 'st', c('o2') + ' rx="3"');
  };
  const shelf = function (x, y, w) {
    return rect(x, y, w, 8, 'sh', c('o') + ' rx="3"') + path('M' + (x + 12) + ' ' + (y + 8) + 'v10M' + (x + w - 12) + ' ' + (y + 8) + 'v10', '', 'stroke="var(--dl-sh2)" stroke-width="5"');
  };
  const shelves = shelf(10, 240, 122) + flask(34, 240, '#F58FB4') + jar(72, 240, '#8FDDB0') + bulb(108, 240, '#8CCBF5') +
    shelf(10, 306, 122) + jar(32, 306, '#FBCB78') + flask(68, 306, '#8CCBF5') + flask(104, 306, '#CDB9F5') +
    shelf(712, 214, 96) + bulb(738, 214, '#FBCB78') + flask(776, 214, '#8FDDB0') +
    shelf(712, 292, 96) + jar(736, 292, '#F58FB4') + jar(770, 292, '#8CCBF5') +
    // bubbles over the pink flask
    '<g fill="#F58FB4">' + '<circle cx="34" cy="204" r="3" ' + c('bub') + '/><circle cx="38" cy="200" r="2.2" ' + c('bub bub-b') + '/><circle cx="31" cy="198" r="2.6" ' + c('bub bub-c') + '/></g>';
  // two hanging lamps; at night each throws a cone of light
  let lamps = '', glow = '';
  [[196, 44], [604, 44]].forEach(function (p) {
    const x = p[0], y = p[1];
    glow += path('M' + (x - 22) + ' ' + (y + 22) + 'L' + (x - 96) + ' 318H' + (x + 96) + 'L' + (x + 22) + ' ' + (y + 22) + 'Z', '', 'fill="#FFE38A" opacity=".13"') +
      circ(x, y + 26, 26, '', 'fill="#FFE38A" opacity=".22"');
    lamps += path('M' + x + ' 0V' + y, '', c('o')) + circ(x, y + 24, 9, 'lb') +
      path('M' + (x - 9) + ' ' + y + 'h18l15 24h-48z', 'lp', c('o'));
  });
  // the wall chart: a place value chart, O . t h th, showing 3 . 7 5
  const CX = 296, CY = 96, CW = [50, 22, 50, 50, 50];
  let chart = path('M' + (CX + 60) + ' ' + CY + 'L407 74L' + (CX + 162) + ' ' + CY, '', 'stroke="var(--dl-ln)" stroke-width="2"') + circ(407, 74, 4, 'st', c('o2')) +
    rect(CX - 8, CY - 8, 238, 116, 'ch', c('o') + ' rx="10"');
  const HEAD = ['O', '', 't', 'h', 'th'], DIG = ['3', '', '7', '5', ''];
  let cx = CX;
  CW.forEach(function (w, i) {
    if (i !== 1) {
      chart += rect(cx, CY, w, 30, '', 'fill="' + PC[i ? i - 1 : 0] + '" stroke="#10305E" stroke-width="1.8"') +
        rect(cx, CY + 30, w, 70, '', 'fill="#FFFFFF" stroke="#10305E" stroke-width="1.8"') +
        text(cx + w / 2, CY + 21, HEAD[i], 'hd') + (DIG[i] ? text(cx + w / 2, CY + 76, DIG[i], 'cd') : '');
    } else {
      chart += circ(cx + w / 2, CY + 20, 3.5, '', 'fill="#E0548A"') + circ(cx + w / 2, CY + 80, 6, '', 'fill="#E0548A" stroke="#AE3465" stroke-width="1.8"');
    }
    cx += w;
  });
  // a card: one tenth of a bar is shaded, 0.1
  let card = rect(566, 122, 116, 72, 'ch', c('o') + ' rx="8"') + text(624, 150, '0.1', 'sm');
  for (let i = 0; i < 10; i++) card += rect(579 + i * 9, 162, 9, 18, '', 'fill="' + (i ? '#FFFFFF' : PC[1]) + '" stroke="#10305E" stroke-width="1.4"');
  const building = shelves + '<g ' + c('glow') + '>' + glow + '</g>' + lamps + chart + card;

  /* ---------- floor: pale tiles ---------- */
  let tiles = '';
  [372, 400, 436, 476].forEach(function (y) { tiles += 'M0 ' + y + 'H800'; });
  for (let x = -40; x <= 840; x += 80) tiles += 'M' + x + ' ' + FLOOR + 'L' + r1(400 + (x - 400) * 1.5) + ' 500';
  const floor = rect(0, FLOOR, 800, 150, 'fl') + path('M0 ' + FLOOR + 'H800', '', 'stroke="var(--dl-tl)" stroke-width="3"') + path(tiles, 'tl');

  /* ---------- things ---------- */
  // the lab bench: a white top, a pink front with drawers
  const TOP = 330;
  let bench = rect(124, TOP + 10, 14, 96, 'bn3', c('o')) + rect(672, TOP + 10, 14, 96, 'bn3', c('o')) +
    rect(118, TOP + 10, 574, 74, 'bn2', c('o') + ' rx="6"');
  [134, 274, 414, 554].forEach(function (x) {
    bench += rect(x, TOP + 22, 122, 50, 'bn3', 'rx="6"') + rect(x + 46, TOP + 40, 30, 8, 'bn', 'rx="4" opacity=".9"');
  });
  bench += rect(106, TOP, 598, 13, 'bn', c('o') + ' rx="5"');

  // Zip in goggles and a lab coat, standing on the bench beside the machine
  const zip = '<g ' + c('zip') + '><g transform="translate(138 253.5) scale(.62)">' +
    '<line x1="60" y1="24" x2="60" y2="13" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="11" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#FFFFFF" stroke="#1E5D9F" stroke-width="3"/><path d="M50 92l10 12 10-12M60 104v17" fill="none" stroke="#9DB4CC" stroke-width="2.5"/><circle cx="66" cy="111" r="2.6" fill="#E0548A"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="68" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="68" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 67Q60 77 73 67" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the goggles
    '<path d="M18 50h15M87 50h15" stroke="#AE3465" stroke-width="7"/><path d="M58 51h4" stroke="#AE3465" stroke-width="4"/>' +
    '<circle cx="46" cy="52" r="12.5" fill="#FFFFFF" fill-opacity=".3" stroke="#E0548A" stroke-width="4"/><circle cx="74" cy="52" r="12.5" fill="#FFFFFF" fill-opacity=".3" stroke="#E0548A" stroke-width="4"/>' +
    '</g></g>';

  // the heart: the digit-sliding machine. The tiles 3, 7, 5 slid one place to the left: 37.5; the decimal point is fixed.
  const MX = 258, MY = 232, STEP = 38, T0 = 286, PT = 404;      // PT: the middle of the fixed decimal point
  const slotX = function (i) { return T0 + i * STEP + (i > 2 ? 12 : 0); };   // 0 hundreds, 1 tens, 2 ones | 3 tenths, 4 hundredths, 5 thousandths
  let slots = '', tilesM = '';
  [0, 4, 5].forEach(function (i) { slots += rect(slotX(i) + 2, MY + 21, 30, 30, '', 'rx="6" fill="none" stroke="#C9B8A6" stroke-width="2" stroke-dasharray="5 5"'); });
  [[1, '3', 0], [2, '7', 0], [3, '5', 1]].forEach(function (t) {
    const x = slotX(t[0]);
    tilesM += rect(x, MY + 19, 34, 34, '', 'rx="7" fill="' + PC[t[2]] + '" stroke="#10305E" stroke-width="2.2"') + text(x + 17, MY + 44.5, t[1], 'd');
  });
  const arrow = function (x, dir, t, lit) {     // a fat arrow 110 wide with its label inside
    const d = dir < 0 ? 'M' + x + ' ' + (MY + 80) + 'l16-16v6h94v20h-94v6z' : 'M' + (x + 110) + ' ' + (MY + 80) + 'l-16-16v6h-94v20h94v6z';
    return path(d, lit ? '' : 'mc2', c('o2') + (lit ? ' fill="#FFD95A"' : '')) + text(x + 55 - dir * 5, MY + 85, t, 'ar');
  };
  const machine = '<g>' +
    // two lights on top, a chimney, the body
    path('M' + (MX + 36) + ' ' + MY + 'v-10M' + (MX + 256) + ' ' + MY + 'v-10', '', c('o')) +
    '<g ' + c('led') + '>' + circ(MX + 36, MY - 14, 7, '', 'fill="#FFD95A" stroke="#B8770E" stroke-width="2"') + '</g>' +
    '<g ' + c('led led-b') + '>' + circ(MX + 256, MY - 14, 7, '', 'fill="#7CF0B0" stroke="#1E7A52" stroke-width="2"') + '</g>' +
    rect(MX, MY, 292, 98, 'mc', c('o') + ' rx="14"') + rect(MX + 8, MY + 58, 276, 34, 'mc2', 'rx="9" opacity=".55"') +
    arrow(MX + 22, -1, '×10', true) + arrow(MX + 160, 1, '÷10', false) +
    '<g data-heart="machine">' +
    rect(MX + 16, MY + 10, 260, 50, 'wn', c('o') + ' rx="9"') + '<g ' + c('glow') + '>' + rect(MX + 10, MY + 4, 272, 62, '', 'rx="14" fill="#FFE38A" opacity=".3"') + '</g>' +
    path('M' + (MX + 22) + ' ' + (MY + 55) + 'H' + (MX + 270), '', 'stroke="#C9B8A6" stroke-width="2"') + slots + tilesM +
    // the fixed decimal point: bolted to the frame
    path('M' + (PT - 9) + ' ' + (MY + 4) + 'h18v9l-9 8-9-8z', '', 'fill="#AE3465" stroke="var(--dl-ln)" stroke-width="2"') +
    circ(PT, MY + 47, 6, '', 'fill="#E0548A" stroke="#AE3465" stroke-width="2"') +
    '</g>' +
    // feet
    rect(MX + 20, MY + 94, 34, 6, 'st', 'rx="3"') + rect(MX + 238, MY + 94, 34, 6, 'st', 'rx="3"') +
    // the lever on the side
    rect(MX + 290, MY + 38, 14, 40, 'st', c('o') + ' rx="4"') +
    '<g ' + c('lever') + '>' + path('M' + (MX + 298) + ' ' + (MY + 58) + 'L' + (MX + 322) + ' ' + (MY + 16), '', 'stroke="var(--dl-ln)" stroke-width="6"') +
    circ(MX + 322, MY + 16, 9, '', 'fill="#FFD95A" stroke="#B8770E" stroke-width="2.4"') + '</g>' +
    '</g>';

  // a tray: one whole square (10 by 10), a tenth strip, a hundredth square
  const U = 5, WX = 604, WY = TOP - 8 - 10 * U;
  let grid = '';
  for (let i = 1; i < 10; i++) grid += 'M' + (WX + i * U) + ' ' + WY + 'v' + 10 * U + 'M' + WX + ' ' + (WY + i * U) + 'h' + 10 * U;
  let strip = '';
  for (let i = 1; i < 10; i++) strip += 'M' + (WX + 60) + ' ' + (WY + i * U) + 'h' + U;
  const tray = rect(WX - 10, TOP - 8, 96, 8, 'st', c('o2') + ' rx="3"') +
    rect(WX, WY, 10 * U, 10 * U, '', 'fill="' + PC[0] + '" stroke="#10305E" stroke-width="2"') + path(grid, '', 'stroke="#FFFFFF" stroke-width="1" opacity=".85"') +
    rect(WX + 60, WY, U, 10 * U, '', 'fill="' + PC[1] + '" stroke="#10305E" stroke-width="1.6"') + path(strip, '', 'stroke="#FFFFFF" stroke-width="1" opacity=".85"') +
    rect(WX + 74, TOP - 8 - U, U, U, '', 'fill="' + PC[2] + '" stroke="#10305E" stroke-width="1.4"');

  // on the floor: a stool and a crate of flasks
  const stool = path('M46 474L54 424M98 474L90 424M50 452H94', '', c('o') + ' stroke-width="4"') + rect(40, 414, 64, 12, 'bn2', c('o') + ' rx="6"');
  const crate = flask(732, 440, '#F58FB4') + bulb(764, 440, '#8FDDB0') + rect(708, 436, 80, 40, 'sh', c('o') + ' rx="4"') +
    path('M712 456H784', '', 'stroke="var(--dl-sh2)" stroke-width="2.4"');

  const things = stool + crate + bench + zip + machine + tray;

  const label = 'The Decimal Lab: a bright, tidy science lab with shelves of flasks and jars. A wall chart shows 3.75 in a place value ' +
    'chart: 3 ones, 7 tenths, 5 hundredths. On the bench, a machine slides the digit tiles past a fixed decimal point: times 10 makes 37.5. ' +
    'A tray holds one whole square, a tenth strip and a tiny hundredth square. Zip wears goggles and a lab coat.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="130,150,580,220" data-band="140,318" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + building + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = window.T_ART || {};
  Object.assign(window.T_ART, { [ID]: svg });
})();

