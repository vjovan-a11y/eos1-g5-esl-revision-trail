/* 05-g5-art-world-3.js - the Sequence Station, the world scene of Stop 3 (window.T_ART['world-sequence-station']).

   The hub header of Stop 3 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the two middle wagons (terms 8 and 12, positions 2 and 3), carries data-heart (kept near the middle, so a phone can
     slide it into the gap between the buttons).
     Layers, back to front: sky (sun or moon, stars, clouds), building (far hills, a green field with trees, a far track
     that runs to the horizon with its sleepers, the departures board on two posts: position plate, "×4", wagon; a small
     station house), floor (the track bed with sleepers at equal steps, the rail, the platform with its yellow line),
     things: a signal with a green light, a blue engine with steam, four wagons that carry the terms 4, 8, 12, 16, each
     with a small position plate 1, 2, 3, 4 under it (term = position × 4), a buffer stop, Zip the station master with a
     cap and a green flag on the raised platform, the station clock, a bench and suitcases.
     Maths meaning: a sequence with equal steps (the wagons, the sleepers), the position-to-term rule (plate × 4 = wagon).
     Palette: CSS variables on .art (--ss-*), redefined by the class world-sequence-station-night (the dark theme):
       a dark sky with stars and the moon; the board, the signal, the engine lamp, the clock and the windows glow.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the clouds drift, the steam rises, the flag waves, the signal light and the stars twinkle, Zip bobs. Still under
       reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-sequence-station';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#A9D4F8', sk2: '#EAF6FF', h1: '#A8DDB0', h2: '#7FCB8C', tr: '#4FA868', ln: '#1B3F6E', gd: '#C9BBA6', sl: '#8A5E3A',
    rl: '#7C8798', pf: '#E8E4DC', pf2: '#CFC8BB', pe: '#FFFFFF', en: '#2F7FD4', en2: '#6EADF1', bd: '#1F3A66', st: '#FFF3DC',
    rf: '#1F5CA0', win: '#DDF1FF', wd: '#C98E52', cld: '#FFFFFF', cf: '#FFFFFF',
    glow: '0', su: '1', mo: '0', sr: '0', cso: '.95'
  };
  const NIGHT = {
    sk1: '#0A1436', sk2: '#2B3C72', h1: '#24465A', h2: '#1B3A44', tr: '#12303A', ln: '#060E22', gd: '#4A4650', sl: '#3E2C1E',
    rl: '#9AA5B8', pf: '#4A5066', pf2: '#3B4156', pe: '#B9C0D4', en: '#255E9E', en2: '#3F7CC0', bd: '#0F1E3C', st: '#6E6A7A',
    rf: '#16365E', win: '#FFD872', wd: '#7A5838', cld: '#3F4C7C', cf: '#FFF1B8',
    glow: '1', su: '0', mo: '1', sr: '1', cso: '.5'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--ss-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--ss-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['h1', 'h2', 'tr', 'gd', 'sl', 'rl', 'pf', 'pe', 'en', 'en2', 'bd', 'st', 'rf', 'win', 'wd', 'cld', 'cf']) +
    S + 'o{stroke:var(--ss-ln);stroke-width:2.5}' + S + 'o2{stroke:var(--ss-ln);stroke-width:1.8}' +
    S + 'pl{stroke:var(--ss-pf2);stroke-width:2;fill:none}' +
    S + 'su{fill:#FFE08A;opacity:var(--ss-su)}' + S + 'sun-ray{stroke:#FFD05A;stroke-width:5;opacity:var(--ss-su)}' +
    S + 'mo{fill:#FFF4CF;opacity:var(--ss-mo)}' + S + 'stars{fill:#FFF4CF;opacity:var(--ss-sr)}' +
    S + 'clouds{opacity:var(--ss-cso)}' + S + 'glow{opacity:var(--ss-glow)}' +
    S + 'n{fill:#10305E;font:800 25px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'np{fill:#10305E;font:800 13px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'led{fill:#FFC53D;font:800 37px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'flag{transform-box:fill-box;transform-origin:100% 50%}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    live + 'cloud-a{animation:' + ID + '-drift 30s ease-in-out infinite alternate}' +
    live + 'cloud-b{animation:' + ID + '-drift 38s ease-in-out -12s infinite alternate-reverse}' +
    live + 'puff{animation:' + ID + '-puff 6s ease-out infinite}' +
    live + 'puff-b{animation-delay:-2s}' + live + 'puff-c{animation-delay:-4s}' +
    live + 'flag{animation:' + ID + '-wave 2.6s ease-in-out infinite alternate}' +
    live + 'sig{animation:' + ID + '-tw 2.8s ease-in-out infinite alternate}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'stars{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-12px)}100%{transform:translateX(14px)}}' +
    '@keyframes ' + ID + '-puff{0%{transform:translate(0,10px);opacity:0}25%{opacity:.95}100%{transform:translate(8px,-22px);opacity:0}}' +
    '@keyframes ' + ID + '-wave{0%{transform:scaleY(1)}100%{transform:scaleY(.72)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-tw{0%{opacity:1}100%{opacity:.4}}' +
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

  const defs = '<defs>' +
    '<linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ss-sk1)"/><stop offset="1" style="stop-color:var(--ss-sk2)"/></linearGradient>' +
    '<path id="ss-cloud" d="M0 0h70c10 0 13-13 3-17 1-11-12-16-19-10-5-11-22-12-26-1-9-4-18 2-16 11-9 1-10 17 0 17z"/>' +
    '</defs>';

  /* ---------- sky: the sun or the moon, stars, clouds ---------- */
  const SUN = [236, 66];
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    rays += 'M' + r1(SUN[0] + Math.cos(a) * 42) + ' ' + r1(SUN[1] + Math.sin(a) * 42) + 'L' + r1(SUN[0] + Math.cos(a) * 55) + ' ' + r1(SUN[1] + Math.sin(a) * 55);
  }
  let stars = '';
  [[48, 30], [130, 84], [330, 28], [384, 70], [470, 30], [560, 62], [640, 26], [732, 54], [774, 118], [30, 130], [612, 120], [168, 150]].forEach(function (p, i) {
    stars += circ(p[0], p[1], i % 3 ? 1.6 : 2.4);
  });
  const sky = rect(0, 0, 800, 500, '', 'fill="url(#ss-sky)"') +
    '<g ' + c('stars') + '>' + stars + '</g>' +
    path(rays, 'sun-ray') + circ(SUN[0], SUN[1], 30, 'su') +
    '<path d="M250 42a28 28 0 1 0 8 46 24 24 0 1 1-8-46z" ' + c('mo') + '/>' +
    '<g ' + c('clouds') + '><g ' + c('cloud-a') + '>' + use('ss-cloud', 560, 76, c('cld')) + '</g>' +
    '<g ' + c('cloud-b') + '>' + use('ss-cloud', 60, 60, c('cld') + ' transform="translate(60 60) scale(.75) translate(-60 -60)"') + '</g></g>';

  /* ---------- building: hills, a far track to the horizon, the departures board, a station house ---------- */
  const RAIL = 332;
  const tree = function (x, y, s) { return rect(x - 2 * s, y - 12 * s, 4 * s, 14 * s, 'sl') + circ(x, y - 20 * s, r1(11 * s), 'tr'); };
  // the far track: from the gap between the hills down to the station; its sleepers get nearer as it runs away
  const Q = function (t) { const u = 1 - t; return [u * u * 458 + 2 * u * t * 452 + t * t * 250, u * u * 213 + 2 * u * t * 262 + t * t * 276]; };
  let railA = '', railB = '', ties = '';
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, p = Q(t), w = 1.4 + 13 * t;
    railA += (i ? 'L' : 'M') + r1(p[0] - w * 0.22) + ' ' + r1(p[1] - w * 0.7);
    railB = 'L' + r1(p[0] + w * 0.22) + ' ' + r1(p[1] + w * 0.7) + railB;
    if (i % 2 === 0 && i > 1) ties += '<path d="M' + r1(p[0] - w * 0.3) + ' ' + r1(p[1] - w * 0.95) + 'L' + r1(p[0] + w * 0.3) + ' ' + r1(p[1] + w * 0.95) + '" stroke="var(--ss-sl)" stroke-width="' + r1(1.4 + 3.4 * t) + '"/>';
  }
  const farTrack = path(railA + railB + 'Z', 'gd', 'stroke="var(--ss-gd)" stroke-width="5"') + ties + path(railA + 'M' + railB.slice(1), '', 'stroke="var(--ss-rl)" stroke-width="2.2"');
  const hills = path('M0 240Q120 168 260 210Q360 238 456 214Q570 150 690 204Q750 226 800 204V340H0Z', 'h1') +
    path('M0 286Q200 232 400 262T800 252V340H0Z', 'h2') + farTrack +
    tree(84, 268, 1) + tree(112, 274, .8) + tree(548, 262, 1) + tree(700, 256, .9) + tree(22, 282, 1.1);
  // the departures board: a position plate, "×4", a wagon
  const board = rect(312, 172, 8, 160, 'rl', c('o2')) + rect(500, 172, 8, 160, 'rl', c('o2')) +
    '<g ' + c('glow') + '>' + rect(280, 92, 260, 92, '', 'rx="20" fill="#FFC53D" opacity=".22"') + '</g>' +
    rect(288, 100, 244, 76, 'bd', c('o') + ' rx="12"') + rect(296, 108, 228, 60, '', 'rx="7" fill="#0B1730"') +
    rect(308, 126, 30, 24, '', 'rx="5" fill="#FFD95A"') + circ(323, 138, 3.4, '', 'fill="#0B1730"') +
    text(410, 152, '×4', 'led') +
    path('M350 138h12M452 138h12', '', 'stroke="#FFC53D" stroke-width="4"') + path('M360 131l8 7-8 7zM462 131l8 7-8 7z', '', 'fill="#FFC53D"') +
    rect(482, 124, 30, 20, '', 'rx="4" fill="#8FDDB0"') + circ(490, 149, 4, '', 'fill="#8FDDB0"') + circ(504, 149, 4, '', 'fill="#8FDDB0"');
  // a small station house on the right
  const house = rect(718, 204, 100, 120, 'st', c('o')) + path('M706 206L728 176H820V206Z', 'rf', c('o')) +
    rect(738, 226, 30, 34, 'win', c('o') + ' rx="4"') + path('M753 226v34M738 243h30', '', c('o2')) + rect(778, 262, 30, 62, 'rf', c('o') + ' rx="3"');
  const building = hills + board + house;

  /* ---------- floor: the track bed with sleepers at equal steps, the rail, the platform ---------- */
  let sleepers = '';
  for (let x = 4; x < 580; x += 24) sleepers += rect(x, RAIL + 3, 12, 8, 'sl', 'rx="2"');
  let joints = '';
  [392, 424, 464].forEach(function (y) { joints += 'M0 ' + y + 'H800'; });
  for (let x = -40; x <= 840; x += 80) joints += 'M' + x + ' 372L' + r1(400 + (x - 400) * 1.45) + ' 500';
  const floor = rect(0, RAIL - 4, 800, 28, 'gd') + sleepers + rect(0, RAIL, 584, 4, 'rl', 'rx="2"') +
    rect(0, 352, 800, 148, 'pf') + path(joints, 'pl') + rect(0, 350, 800, 8, 'pe', c('o2')) +
    rect(0, 362, 800, 8, '', 'fill="#FFD23F"');

  /* ---------- things ---------- */
  // a signal: the green light is on
  const signal = rect(137, 244, 6, 90, 'rl', c('o2')) + rect(127, 194, 26, 54, 'bd', c('o') + ' rx="9"') +
    circ(140, 209, 7, '', 'fill="#7A2E38"') + '<g ' + c('glow') + '>' + circ(140, 232, 20, '', 'fill="#7CF0B0" opacity=".4"') + '</g>' +
    '<g ' + c('sig') + '>' + circ(140, 232, 7, '', 'fill="#5BE39A" stroke="#DFFFEF" stroke-width="1.6"') + '</g>';

  // the engine, facing left, with steam
  const wheel = function (x, r) { return circ(x, RAIL - r, r, '', 'fill="#3A4660" stroke="var(--ss-ln)" stroke-width="2.4"') + circ(x, RAIL - r, r1(r * 0.36), '', 'fill="#C9D3E2"'); };
  const engine = '<g>' +
    '<g ' + c('glow') + '>' + path('M160 290L96 262V318Z', '', 'fill="#FFE38A" opacity=".4"') + '</g>' +
    '<g fill="#FFFFFF">' + '<circle cx="176" cy="238" r="9" ' + c('puff') + '/><circle cx="170" cy="220" r="12" ' + c('puff puff-b') + '/><circle cx="182" cy="198" r="14" ' + c('puff puff-c') + '/></g>' +
    rect(168, 254, 16, 22, 'bd', c('o')) + rect(163, 248, 26, 9, 'bd', c('o') + ' rx="3"') +
    rect(156, 272, 56, 44, 'en2', c('o') + ' rx="12"') + path('M196 272a8 8 0 0 1 16 0', '', 'fill="#FFD23F" stroke="var(--ss-ln)" stroke-width="2.2"') +
    rect(206, 246, 42, 70, 'en', c('o') + ' rx="5"') + rect(214, 256, 26, 24, 'win', c('o2') + ' rx="4"') + rect(200, 239, 54, 9, 'bd', c('o') + ' rx="4"') +
    path('M172 288v20M186 288v20', '', 'stroke="var(--ss-en)" stroke-width="3"') +
    circ(158, 290, 6.5, '', 'fill="#FFE98A" stroke="var(--ss-ln)" stroke-width="2.2"') +
    rect(154, 312, 96, 8, 'bd', 'rx="3"') + path('M146 ' + RAIL + 'l14-16h10v16z', '', 'fill="#E5404A" stroke="var(--ss-ln)" stroke-width="2.2"') +
    wheel(176, 9) + wheel(198, 9) + wheel(230, 13) + '</g>';

  // a wagon that carries a term; its position plate hangs under it
  const WC = ['#FFC94D', '#F58FA8', '#8FDDB0', '#FFA55A'], W0 = 256, WS = 78;
  const wagon = function (i) {
    const x = W0 + i * WS, t = 4 * (i + 1);
    return path('M' + (x - 8) + ' 314h8', '', 'stroke="var(--ss-ln)" stroke-width="4"') +
      rect(x, 264, 72, 50, '', 'rx="7" fill="' + WC[i] + '" stroke="var(--ss-ln)" stroke-width="2.5"') +
      rect(x + 11, 271, 50, 34, '', 'rx="7" fill="#FFFFFF" stroke="var(--ss-ln)" stroke-width="1.8"') + text(x + 36, 297, t, 'n') +
      rect(x + 2, 311, 68, 8, 'bd', 'rx="3"') + wheel(x + 13, 8) + wheel(x + 59, 8) +
      rect(x + 24, 315, 24, 18, '', 'rx="4" fill="#FFD95A" stroke="var(--ss-ln)" stroke-width="1.8"') + text(x + 36, 329, i + 1, 'np');
  };
  const train = engine + wagon(0) + '<g data-heart="wagons">' + wagon(1) + wagon(2) + '</g>' + wagon(3) +
    // the buffer stop at the end of the line
    rect(570, 306, 8, 28, '', 'fill="#E5404A" stroke="var(--ss-ln)" stroke-width="2.2"') + rect(566, 300, 16, 9, 'pe', c('o2') + ' rx="2"');

  // the raised platform on the right, with the station clock on its post
  const stand = rect(588, 322, 220, 30, 'pf', c('o') + ' rx="4"') + rect(588, 322, 220, 7, 'pe', c('o2') + ' rx="3"') +
    rect(679, 174, 6, 150, 'rl', c('o2')) + '<g ' + c('glow') + '>' + circ(682, 156, 32, '', 'fill="#FFE38A" opacity=".35"') + '</g>' +
    circ(682, 156, 21, 'cf', 'stroke="var(--ss-rf)" stroke-width="5"') +
    path('M682 140v4M682 168v4M666 156h4M694 156h4', '', 'stroke="#10305E" stroke-width="2"') +
    path('M682 156V143M682 156l9.500 5.500', '', 'stroke="#10305E" stroke-width="3"') + circ(682, 156, 2.4, '', 'fill="#E5404A"');

  // Zip the station master: a cap, a green flag in his hand
  const zip = '<g ' + c('zip') + '><g transform="translate(602 246) scale(.62)">' +
    '<g ' + c('flag') + '><path d="M-6 26l-30 9 30 11z" fill="#3CC47C" stroke="#17703F" stroke-width="2.5"/></g>' +
    '<path d="M6 76L-6 22" stroke="#6E4320" stroke-width="4"/>' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="60" cy="107" r="6" fill="#E5404A"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="35" width="66" height="44" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="54" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="54" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="51" r="2" fill="#FFFFFF"/><circle cx="76" cy="51" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="67" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="67" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 64Q60 75 73 64" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the cap
    '<path d="M22 27Q22 2 60 2T98 27Z" fill="#E5404A" stroke="#0E2B58" stroke-width="3"/><rect x="20" y="19" width="80" height="9" fill="#FFD23F" stroke="#0E2B58" stroke-width="2.5"/>' +
    '<rect x="12" y="27" width="96" height="9" rx="4.500" fill="#0E2B58"/><circle cx="60" cy="11" r="5" fill="#FFD23F" stroke="#B8770E" stroke-width="2"/>' +
    '</g></g>';

  // on the platform: a bench and two suitcases
  const bench = path('M52 462V436M132 462V436', '', c('o') + ' stroke-width="5"') + rect(40, 426, 104, 11, 'wd', c('o') + ' rx="4"') + rect(44, 400, 96, 11, 'wd', c('o') + ' rx="4"') +
    path('M56 411v15M128 411v15', '', c('o'));
  const cases = rect(668, 420, 64, 44, '', 'rx="6" fill="#F58FA8" stroke="var(--ss-ln)" stroke-width="2.5"') + path('M690 420v-8h20v8M668 436h64', '', c('o')) +
    rect(722, 438, 46, 30, '', 'rx="5" fill="#8FDDB0" stroke="var(--ss-ln)" stroke-width="2.5"') + path('M738 438v-6h14v6', '', c('o'));

  const things = signal + train + stand + zip + bench + cases;

  const label = 'The Sequence Station: a cheerful train station with hills behind and a track that runs to the horizon. A blue engine ' +
    'pulls four wagons that carry the terms 4, 8, 12 and 16; small plates under them show the positions 1, 2, 3 and 4. ' +
    'The departures board shows the rule: times 4. The sleepers of the track lie at equal steps. ' +
    'Zip is the station master, with a cap and a green flag, under the station clock.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="128,150,580,220" data-band="150,330" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + building + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = window.T_ART || {};
  Object.assign(window.T_ART, { [ID]: svg });
})();

