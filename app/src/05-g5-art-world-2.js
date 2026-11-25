/* 05-g5-art-world-2.js - the Rounding Reef, the world scene of Stop 2 (window.T_ART['world-rounding-reef']).

   The hub header of Stop 2 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the little fish at 6.7 with its tag, the arrow and the post "7" (kept left of the middle, so a phone can slide it into the gap between the buttons), carries data-heart.
     Layers, back to front: sky (the sea: light rays by day, glowing specks by night, far fish), building (two rows of far
     reef, corals, seaweed, a jellyfish), floor (the sandy sea bed), things: a number line laid along the reef like a rope
     from the post 6 to the post 7, with ten equal steps and a ring at the half-way mark; a little fish hovers over 6.7
     and an arrow shows that 7 is the nearer end (6.7 rounds to 7); Zip in a diving helmet; two treasure chests labelled
     2.4 and 1.35 with a + between them; ten shells in a row; a starfish; bubbles.
     Maths meaning: rounding a decimal to the nearest whole number on a number line (the rope and the fish), adding
     decimals with a different number of decimal places (the chests), ten tenths in one whole (the steps, the shells).
     Palette: CSS variables on .art (--rr-*), redefined by the class world-rounding-reef-night (the dark theme):
       deep dark water, the corals, the jellyfish and small specks glow, Zip's lamp shines.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the seaweed sways, the bubbles rise, the far fish drift, the little fish and Zip bob, the specks twinkle. Still
       under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-rounding-reef';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#5CC9D6', sk2: '#C9F1F0', fr1: '#8ED8DC', fr2: '#5FBFC8', sd: '#F6E3B4', sd2: '#E9CE92', ln: '#0B5560',
    c1: '#F58FA8', c2: '#F9A65A', c3: '#B592E8', wd: '#3FB58A', wd2: '#2A8F6C', rp: '#E9C27A', rp2: '#A8793A',
    ps: '#C98E52', cs: '#C9853F', cs2: '#8A5524', ff: '#2E9FAE', jl: '#FFFFFF',
    glow: '0', su: '1', sr: '0', jo: '.55'
  };
  const NIGHT = {
    sk1: '#03202C', sk2: '#0D4350', fr1: '#0E4A56', fr2: '#0A3742', sd: '#3F5F64', sd2: '#2E4A50', ln: '#02161C',
    c1: '#A8506C', c2: '#B06A2E', c3: '#6E52A6', wd: '#1F7358', wd2: '#145441', rp: '#B49660', rp2: '#5E431E',
    ps: '#7A5838', cs: '#7E5429', cs2: '#523316', ff: '#136573', jl: '#BFF6FF',
    glow: '1', su: '0', sr: '1', jo: '.95'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--rr-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--rr-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['fr1', 'fr2', 'sd', 'sd2', 'c1', 'c2', 'c3', 'wd', 'wd2', 'rp', 'ps', 'cs', 'cs2', 'ff', 'jl']) +
    S + 'o{stroke:var(--rr-ln);stroke-width:2.5}' + S + 'o2{stroke:var(--rr-ln);stroke-width:1.8}' +
    S + 'rays{fill:#FFFFFF;opacity:calc(var(--rr-su)*.16)}' + S + 'specks{fill:#BFF6FF;opacity:var(--rr-sr)}' +
    S + 'glow{opacity:var(--rr-glow)}' + S + 'jelly{opacity:var(--rr-jo)}' +
    S + 'bubs{fill:#FFFFFF;fill-opacity:.35;stroke:#FFFFFF;stroke-width:1.6}' +
    S + 'n{fill:#10305E;font:800 20px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'nt{fill:#10305E;font:800 16px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'nc{fill:#10305E;font:800 19px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'plus{fill:#FFFFFF;stroke:var(--rr-ln);stroke-width:5;paint-order:stroke;font:800 40px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'weed{transform-box:fill-box;transform-origin:50% 100%}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    live + 'weed{animation:' + ID + '-sway 5.6s ease-in-out infinite alternate}' +
    live + 'weed-b{animation-delay:-2.8s}' +
    live + 'bub{animation:' + ID + '-rise 7s ease-in infinite}' +
    live + 'bub-b{animation-delay:-2.3s}' + live + 'bub-c{animation-delay:-4.6s}' +
    live + 'far{animation:' + ID + '-drift 34s ease-in-out infinite alternate}' +
    live + 'fish{animation:' + ID + '-bob 2.8s ease-in-out infinite alternate}' +
    live + 'zip{animation:' + ID + '-bob 3.6s ease-in-out infinite alternate}' +
    live + 'jelly{animation:' + ID + '-float 6s ease-in-out infinite alternate}' +
    live + 'specks{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-sway{0%{transform:rotate(-5deg)}100%{transform:rotate(5deg)}}' +
    '@keyframes ' + ID + '-rise{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-70px);opacity:0}}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-16px)}100%{transform:translateX(18px)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-float{0%{transform:translateY(0)}100%{transform:translateY(-10px)}}' +
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
  const use = function (id, x, y, extra) { return '<use href="#' + id + '" x="' + r1(x) + '" y="' + r1(y) + '"' + (extra ? ' ' + extra : '') + '/>'; };

  /* ---------- reusable shapes (defs) ---------- */
  const defs = '<defs>' +
    '<linearGradient id="rr-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--rr-sk1)"/><stop offset="1" style="stop-color:var(--rr-sk2)"/></linearGradient>' +
    // a small far fish (a silhouette), a shell, a blade of seaweed
    '<path id="rr-ff" d="M-12 0q6-7 14-3l7-5v16l-7-5q-8 4-14-3z"/>' +
    '<g id="rr-shell"><path d="M0 0c-13 0-17-11-12-18 4-6 20-6 24 0 5 7 1 18-12 18z"/><path d="M0-1v-20M-5-2l-4-17M5-2l4-17" fill="none" stroke-width="1.5"/></g>' +
    '<path id="rr-weed" d="M-7 0c-6-22 10-30 4-52s8-30 4-48c12 16 2 30 8 50s-6 30-1 50z"/>' +
    '</defs>';

  /* ---------- sky: the sea, light rays, glowing specks, far fish ---------- */
  let specks = '';
  [[60, 60], [150, 130], [236, 44], [318, 110], [420, 58], [504, 150], [590, 70], [676, 126], [748, 52], [112, 214], [700, 220], [380, 196]].forEach(function (p, i) {
    specks += circ(p[0], p[1], i % 3 ? 1.6 : 2.4);
  });
  let far = '';
  [[540, 96], [566, 84], [570, 110], [596, 98], [250, 150], [276, 162]].forEach(function (p) { far += use('rr-ff', p[0], p[1]); });
  const sky = rect(0, 0, 800, 500, '', 'fill="url(#rr-sea)"') +
    path('M90 0L20 360h110L210 0zM330 0L300 360h80L430 0zM560 0L600 360h120L660 0z', 'rays') +
    '<g ' + c('specks') + '>' + specks + '</g>' + '<g ' + c('far') + '><g ' + c('ff') + ' opacity=".7">' + far + '</g>' +
    use('rr-ff', 330, 120, 'fill="#FFD95A" stroke="var(--rr-ln)" stroke-width="1.4" transform="translate(330 120) scale(1.7) translate(-330 -120)"') +
    use('rr-ff', 150, 84, 'fill="#F58FA8" stroke="var(--rr-ln)" stroke-width="1.4" transform="translate(150 84) scale(1.5) translate(-150 -84)"') + '</g>';

  /* ---------- building: far reef, corals, seaweed, a jellyfish ---------- */
  const FLOOR = 346;
  const reef = path('M0 280Q60 214 130 250T260 236Q330 190 400 244T540 226Q620 180 690 236T800 220V360H0Z', 'fr1') +
    path('M0 318Q70 262 150 300T300 290Q380 262 450 304T620 288Q700 250 800 296V360H0Z', 'fr2');
  // a branch coral, a tube coral and a fan coral, each growing from (x, y)
  const branch = function (x, y, k, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      path('M0 0V-44M0-22Q-22-26-22-52M0-30Q20-34 22-62M-22-40Q-34-42-34-58M22-46Q34-48 36-64M0-44Q-4-58-10-66M0-44Q6-60 10-70', '', 'stroke="var(--rr-ln)" stroke-width="15"') +
      path('M0 0V-44M0-22Q-22-26-22-52M0-30Q20-34 22-62M-22-40Q-34-42-34-58M22-46Q34-48 36-64M0-44Q-4-58-10-66M0-44Q6-60 10-70', '', 'stroke="var(--rr-' + k + ')" stroke-width="10"') + '</g>';
  };
  const tubes = function (x, y, k) {
    let s = '';
    [[-20, 34], [-6, 52], [9, 40], [22, 26]].forEach(function (t) {
      s += rect(x + t[0] - 7, y - t[1], 14, t[1] + 4, k, c('o') + ' rx="7"') + '<ellipse cx="' + (x + t[0]) + '" cy="' + (y - t[1] + 5) + '" rx="4" ry="2.4" fill="var(--rr-ln)" opacity=".55"/>';
    });
    return s;
  };
  const fan = function (x, y, k) {
    return path('M' + x + ' ' + y + 'q-52-22-40-66 12-26 40-22 28-4 40 22 12 44-40 66z', k, c('o')) +
      path('M' + x + ' ' + (y - 4) + 'v-78M' + x + ' ' + (y - 14) + 'l-26-50M' + x + ' ' + (y - 14) + 'l26-50M' + x + ' ' + (y - 8) + 'l-36-26M' + x + ' ' + (y - 8) + 'l36-26', '', 'stroke="var(--rr-ln)" stroke-width="1.8" opacity=".5"');
  };
  const weed = function (x, y, s, b, k) {
    return '<g ' + c('weed' + (b ? ' weed-b' : '')) + '>' + use('rr-weed', x, y, c(k || 'wd') + ' stroke="var(--rr-ln)" stroke-width="2" transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(' + -x + ' ' + -y + ')"') + '</g>';
  };
  const corals = weed(40, 372, 1.5, 0, 'wd2') + weed(78, 366, 1.1, 1) + fan(112, 354, 'c3') + branch(74, 372, 'c1', 1.25) +
    weed(770, 372, 1.6, 1, 'wd2') + weed(726, 366, 1.2, 0) + tubes(690, 356, 'c2') + branch(752, 380, 'c1', 1.05) +
    weed(612, 352, .8, 1) + tubes(640, 352, 'c3');
  // glowing dots on the corals at night
  let glow = '';
  [[52, 306], [96, 296], [118, 300], [140, 290], [684, 312], [700, 300], [752, 314], [774, 304], [634, 300], [648, 312]].forEach(function (p) {
    glow += circ(p[0], p[1], 9, '', 'fill="#8CF5E6" opacity=".35"') + circ(p[0], p[1], 2.6, '', 'fill="#E6FFFB"');
  });
  // a jellyfish, top right
  const jelly = '<g ' + c('jelly') + '><g ' + c('glow') + '>' + circ(716, 108, 40, '', 'fill="#8CF5E6" opacity=".25"') + '</g>' +
    path('M700 112q-4 16 2 30M712 114q4 18-2 34M724 114q-4 16 2 30M734 112q5 14 0 26', '', 'stroke="var(--rr-jl)" stroke-width="3"') +
    path('M690 112a27 27 0 0 1 54 0q-6 6-13 0-7 6-14 0-7 6-14 0-7 6-13 0z', 'jl', 'stroke="#C58FE0" stroke-width="2.2"') + '</g>';
  const building = reef + jelly + corals + '<g ' + c('glow') + '>' + glow + '</g>';

  /* ---------- floor: the sandy sea bed ---------- */
  let dots = '';
  [[60, 404], [150, 470], [226, 396], [560, 472], [640, 398], [716, 440], [470, 486], [96, 448], [330, 480]].forEach(function (p) { dots += 'M' + p[0] + ' ' + p[1] + 'h10M' + (p[0] + 18) + ' ' + (p[1] + 8) + 'h6'; });
  const floor = path('M0 ' + FLOOR + 'Q100 ' + (FLOOR - 12) + ' 200 ' + FLOOR + 'T400 ' + FLOOR + 'T600 ' + FLOOR + 'T800 ' + FLOOR + 'V500H0Z', 'sd') +
    path('M0 430Q140 412 290 428T560 426T800 420V500H0Z', 'sd2', 'opacity=".55"') + path(dots, '', 'stroke="var(--rr-sd2)" stroke-width="3"');

  /* ---------- things ---------- */
  // the number line: a rope from the post 6 to the post 7, ten equal steps
  const X6 = 170, X7 = 470, RY = 308, STEP = (X7 - X6) / 10;
  const post = function (x, t) {
    return rect(x - 6, RY - 26, 12, 68, 'ps', c('o') + ' rx="4"') + rect(x - 18, RY - 56, 36, 32, '', 'rx="7" fill="#FFFFFF" stroke="var(--rr-ln)" stroke-width="2.5"') + text(x, RY - 33, t, 'n');
  };
  let marks = '', twist = '';
  for (let i = 1; i < 10; i++) marks += i === 5 ? '' : rect(X6 + i * STEP - 2.5, RY - 8, 5, 16, '', 'rx="2.5" fill="#FFFFFF" stroke="var(--rr-ln)" stroke-width="1.6"');
  for (let x = X6 + 10; x < X7 - 6; x += 9) twist += 'M' + x + ' ' + (RY + 3) + 'l4-6';
  const rope = path('M' + X6 + ' ' + RY + 'H' + X7, '', 'stroke="var(--rr-ln)" stroke-width="10"') + path('M' + X6 + ' ' + RY + 'H' + X7, '', 'stroke="var(--rr-rp)" stroke-width="6"') +
    path(twist, '', 'stroke="var(--rr-rp2)" stroke-width="1.6"') + marks +
    // the half-way mark: a ring
    circ(X6 + 5 * STEP, RY, 8, '', 'fill="#FFD95A" stroke="var(--rr-ln)" stroke-width="2.2"') + circ(X6 + 5 * STEP, RY, 2.6, '', 'fill="var(--rr-ln)"') +
    post(X6, '6');
  // the heart: the little fish over 6.7, its tag, the arrow to 7 and the post 7
  const FX = X6 + 7 * STEP, FY = 276;
  const fish = '<g data-heart="fish">' + post(X7, '7') +
    path('M' + FX + ' ' + (FY + 15) + 'V' + (RY - 9), '', 'stroke="#FFFFFF" stroke-width="2.4" stroke-dasharray="1 6"') +
    rect(FX - 3.5, RY - 9, 7, 18, '', 'rx="3.5" fill="#FF8A3C" stroke="var(--rr-ln)" stroke-width="1.8"') +
    // the arrow under the rope: 7 is the nearer end
    path('M' + (FX + 2) + ' ' + (RY + 14) + 'h' + (X7 - FX - 24) + 'v-7l18 12-18 12v-7h' + -(X7 - FX - 24) + 'z', '', 'fill="#FFD95A" stroke="var(--rr-ln)" stroke-width="2.4"') +
    '<g ' + c('fish') + '>' +
    // its tag, 6.7, beside its tail
    rect(FX - 92, FY - 14, 50, 28, '', 'rx="14" fill="#FFFFFF" stroke="var(--rr-ln)" stroke-width="2.2"') + path('M' + (FX - 43) + ' ' + (FY - 5) + 'l8 5-8 5', '', 'fill="#FFFFFF" stroke="var(--rr-ln)" stroke-width="2.2"') +
    rect(FX - 46, FY - 6, 4, 12, '', 'fill="#FFFFFF"') + text(FX - 67, FY + 6, '6.7', 'nt') +
    '<g transform="translate(' + r1(FX) + ' ' + FY + ') scale(1.12)">' +
    '<path d="M-14 0l-16-13q4 13 0 26z" fill="#FFB24A" stroke="#0B5560" stroke-width="2.2"/><path d="M-4-12q6-9 14-6l-2 8z" fill="#FFB24A" stroke="#0B5560" stroke-width="2.2"/>' +
    '<ellipse cx="2" cy="0" rx="20" ry="13.5" fill="#FF8A3C" stroke="#0B5560" stroke-width="2.4"/>' +
    '<path d="M-6-12.500q5 12.500 0 25M3-13.300q4 13.300 0 26.600" fill="none" stroke="#FFFFFF" stroke-width="4"/>' +
    '<circle cx="13" cy="-3" r="4.6" fill="#FFFFFF" stroke="#0B5560" stroke-width="1.6"/><circle cx="14.200" cy="-3" r="2.2" fill="#0E2B58"/>' +
    '<path d="M12 5.500q4 2.500 7 0" fill="none" stroke="#0B5560" stroke-width="1.8"/></g></g></g>';

  // Zip in a diving helmet, floating by the post 7
  const zip = '<g ' + c('zip') + '><g transform="translate(510 250) scale(.62)">' +
    '<line x1="60" y1="24" x2="60" y2="15" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="13" r="5" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="60" cy="110" r="6" fill="#E5404A"/>' +
    '<path d="M36 102Q13 105 4 80" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="4" cy="77" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 102Q107 105 116 80" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="116" cy="77" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the diving helmet: a glass bowl, a brass collar, a lamp
    '<circle cx="60" cy="52" r="54" fill="#D8F6FA" fill-opacity=".28" stroke="#0E7682" stroke-width="4.5"/>' +
    '<path d="M22 30a44 44 0 0 1 24-22" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".85"/>' +
    '<rect x="26" y="93" width="68" height="13" rx="6.500" fill="#F7B53C" stroke="#B8770E" stroke-width="3"/>' +
    '<circle cx="60" cy="-3" r="7" fill="#FFE98A" stroke="#B8770E" stroke-width="2.5"/></g></g>';
  const lamp = '<g ' + c('glow') + '>' + circ(547, 248, 22, '', 'fill="#FFE98A" opacity=".4"') + '</g>';
  // bubbles: from Zip's helmet, from the fish, from the reef
  let bubs = '';
  [[592, 236, 5], [600, 218, 3.4], [586, 202, 4.2], [FX + 34, 256, 3], [FX + 40, 242, 2.2], [690, 260, 5], [700, 236, 3.4], [96, 250, 4], [104, 228, 3]].forEach(function (b, i) {
    bubs += '<circle cx="' + r1(b[0]) + '" cy="' + b[1] + '" r="' + b[2] + '" ' + c('bub' + (i % 3 === 1 ? ' bub-b' : i % 3 === 2 ? ' bub-c' : '')) + '/>';
  });

  // two treasure chests, 2.4 and 1.35, with a + between them
  const chest = function (x, y, t) {
    return rect(x, y + 20, 92, 42, 'cs', c('o') + ' rx="4"') + path('M' + x + ' ' + (y + 22) + 'q0-24 46-24t46 24z', 'cs2', c('o')) +
      path('M' + (x + 16) + ' ' + (y + 3) + 'v59M' + (x + 76) + ' ' + (y + 3) + 'v59', '', 'stroke="#F7B53C" stroke-width="5"') +
      rect(x + 22, y + 28, 48, 27, '', 'rx="6" fill="#FFFFFF" stroke="var(--rr-ln)" stroke-width="2.2"') + text(x + 46, y + 48.5, t, 'nc') +
      rect(x + 39, y + 15, 14, 12, '', 'rx="3" fill="#F7B53C" stroke="#B8770E" stroke-width="2"');
  };
  const chests = chest(250, 364, '2.4') + text(385, 416, '+', 'plus') + chest(428, 364, '1.35');

  // ten shells in a row, a starfish
  let shells = '';
  const SC = ['#FFC9D6', '#FFE3A8', '#D9C8F5'];
  for (let i = 0; i < 10; i++) shells += use('rr-shell', 196 + i * 46, 466 + (i % 2 ? 3 : 0), 'fill="' + SC[i % 3] + '" stroke="var(--rr-ln)" stroke-width="2"');
  const star = '<g transform="translate(676 430) rotate(12)">' + path('M0-20l6 13 14 1-10 10 3 14-13-7-13 7 3-14-10-10 14-1z', '', 'fill="#FF8A6B" stroke="var(--rr-ln)" stroke-width="2.4"') +
    circ(0, 0, 2, '', 'fill="#FFFFFF"') + '</g>';

  const things = rope + lamp + zip + fish + '<g ' + c('bubs') + '>' + bubs + '</g>' + chests + star + shells;

  const label = 'The Rounding Reef: under the sea, with coral, seaweed, bubbles and a sandy floor. A rope lies along the reef like a number ' +
    'line from 6 to 7 with ten equal steps. A little fish hovers at 6.7 and an arrow shows that 7 is the nearer end: 6.7 rounds to 7. ' +
    'Two treasure chests say 2.4 and 1.35, with a plus sign between them. Ten shells lie in a row. Zip wears a diving helmet.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="120,150,580,220" data-band="240,336" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + building + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = window.T_ART || {};
  Object.assign(window.T_ART, { [ID]: svg });
})();

