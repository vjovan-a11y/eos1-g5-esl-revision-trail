/* 05-g5-art-world-6.js - the Percent Market, the world scene of Stop 6 (window.T_ART['world-percent-market']).

   The hub header of Stop 6 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the crates of fruit with the price tags 50% and 25% on the middle stall and Zip beside them, carries data-heart.
     Layers, back to front: sky (sun or moon, stars, clouds, far roofs), building (the long wall of the market hall under
     a tiled roof, with arched windows; on it a big hundred-square mosaic, 10 rows of 10 tiles, with one quarter of the
     tiles, 25, coloured, and a plaque 25%; a lamp post and a string of lanterns), floor (the paved street), things: the
     middle stall with a striped awning; its sign shows three names for one number: the stacked fraction 1/2 = 0.5 = 50%;
     on its counter three crates of fruit, two with hanging price tags, 50% and 25%; Zip, the stall keeper with an apron, beside
     it; a second stall with baskets and a tag 10%; baskets of melons and a sack on the street.
     Maths meaning: a percentage is a number of parts out of 100 (the mosaic: 25 of 100 tiles is 25%, one quarter),
     fractions, decimals and percentages name the same number (the sign), percentages in daily life (the tags).
     Palette: CSS variables on .art (--pm-*), redefined by the class world-percent-market-night (the dark theme):
       a dark sky with stars and the moon, the lanterns glow, the windows are lit.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the clouds drift, the lanterns and the price tags sway, the stars twinkle, Zip bobs.
       Still under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-percent-market';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#CFC4F6', sk2: '#FFEBD8', far: '#D9CDF2', w1: '#FFE6C9', w2: '#F3CB9C', wl: '#8A6A4A', rf: '#8E78DC', rf2: '#6F58C4', rfl: '#3F2A86',
    win: '#BFE3F7', fl: '#E7DDEB', fl2: '#D6C9DD', tl: '#BDAECB', aw: '#7C5FD8', aw2: '#FFFFFF', awl: '#3F2A86', ab: '#2FA39A', abl: '#14605A',
    wd: '#C98E52', wd2: '#A8703C', wdl: '#6E4320', cld: '#FFFFFF', bd: '#FFF8E8', lf: '#5DB26A', lf2: '#2D7C3A',
    glow: '0', dim: '0', su: '1', mo: '0', sr: '0', cso: '.9'
  };
  const NIGHT = {
    sk1: '#120E2C', sk2: '#3A2C62', far: '#2A2250', w1: '#5A4C68', w2: '#4A3E58', wl: '#241A30', rf: '#4A3A8C', rf2: '#3A2C72', rfl: '#150C36',
    win: '#FFD872', fl: '#443A54', fl2: '#3A3148', tl: '#2C2438', aw: '#5A44AE', aw2: '#CFC8E2', awl: '#1E1448', ab: '#1E6E68', abl: '#0A3632',
    wd: '#7A5838', wd2: '#5E4229', wdl: '#2C1C0E', cld: '#4A4E78', bd: '#E4DCCB', lf: '#245E3A', lf2: '#123A22',
    glow: '1', dim: '.2', su: '0', mo: '1', sr: '1', cso: '.45'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--pm-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--pm-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['far', 'w1', 'w2', 'rf', 'rf2', 'win', 'fl', 'fl2', 'aw', 'aw2', 'ab', 'wd', 'wd2', 'cld', 'bd', 'lf']) +
    S + 'o{stroke:var(--pm-wl);stroke-width:2.5}' + S + 'ow{stroke:var(--pm-wdl);stroke-width:2.4}' + S + 'oa{stroke:var(--pm-awl);stroke-width:2.4}' +
    S + 'ob{stroke:var(--pm-abl);stroke-width:2.4}' + S + 'or{stroke:var(--pm-rfl);stroke-width:2.5}' + S + 'ol{stroke:var(--pm-lf2);stroke-width:2.5}' +
    S + 'tl{stroke:var(--pm-tl);stroke-width:2;fill:none}' + S + 'str{stroke:var(--pm-wdl);stroke-width:2;fill:none}' + S + 'gr{stroke:var(--pm-wd2);stroke-width:2;fill:none}' +
    S + 'su{fill:#FFE08A;opacity:var(--pm-su)}' + S + 'sun-ray{stroke:#FFD05A;stroke-width:5;opacity:var(--pm-su)}' +
    S + 'mo{fill:#FFF4CF;opacity:var(--pm-mo)}' + S + 'stars{fill:#FFF4CF;opacity:var(--pm-sr)}' +
    S + 'clouds{opacity:var(--pm-cso)}' + S + 'glow{opacity:var(--pm-glow)}' + S + 'dim{fill:#120A2A;opacity:var(--pm-dim)}' +
    S + 'ns{fill:#2A1A6A;font:800 21px/1 ' + FONT + ';text-anchor:middle}' + S + 'nl{stroke:#2A1A6A;stroke-width:3;fill:none}' +
    S + 'nt{fill:#5940A8;font:800 15px/1 ' + FONT + ';text-anchor:middle}' + S + 'np{fill:#FFFFFF;font:800 15px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'lan{transform-box:fill-box;transform-origin:50% 0}' + S + 'tag{transform-box:fill-box;transform-origin:50% 0}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    live + 'cloud-a{animation:' + ID + '-drift 30s ease-in-out infinite alternate}' +
    live + 'cloud-b{animation:' + ID + '-drift 38s ease-in-out -12s infinite alternate-reverse}' +
    live + 'lan{animation:' + ID + '-sway 4.8s ease-in-out infinite alternate}' + live + 'lan-b{animation-delay:-2.4s}' +
    live + 'tag{animation:' + ID + '-sway 5.4s ease-in-out -1s infinite alternate}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'stars{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-12px)}100%{transform:translateX(14px)}}' +
    '@keyframes ' + ID + '-sway{0%{transform:rotate(-3deg)}100%{transform:rotate(3deg)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-tw{0%{opacity:1}100%{opacity:.35}}' +
    '@media (prefers-reduced-motion:reduce){.art.is-live *{animation:none!important;transition:none!important}}' +
    'html[data-fx="1"] .art.is-live *{animation:none!important}';

  /* ---------- small drawing helpers ---------- */
  const rect = function (x, y, w, h, cls, extra) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>';
  };
  const path = function (d, cls, extra) { return '<path d="' + d + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  const use = function (id, x, y, extra) { return '<use href="#' + id + '" x="' + r1(x) + '" y="' + r1(y) + '"' + (extra ? ' ' + extra : '') + '/>'; };
  const text = function (x, y, t, cls) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" ' + c(cls) + '>' + t + '</text>'; };
  const circ = function (x, y, r, cls, extra) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  // a striped awning with a scalloped edge, from x over w, its top at y
  const awning = function (x, w, y, n, a, b, o) {
    let s = '';
    const sw = w / n;
    for (let i = 0; i < n; i++) s += path('M' + r1(x + i * sw) + ' ' + y + 'h' + r1(sw) + 'v26a' + r1(sw / 2) + ' 9 0 0 1-' + r1(sw) + ' 0z', (i % 2 ? b : a) + ' ' + o);
    return s + rect(x - 4, y - 8, w + 8, 10, a + ' ' + o, 'rx="4"');
  };

  /* ---------- reusable shapes (defs) ---------- */
  const defs = '<defs>' +
    '<linearGradient id="pm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--pm-sk1)"/><stop offset=".6" style="stop-color:var(--pm-sk2)"/></linearGradient>' +
    '<path id="pm-cloud" d="M0 0h70c10 0 13-13 3-17 1-11-12-16-19-10-5-11-22-12-26-1-9-4-18 2-16 11-9 1-10 17 0 17z"/>' +
    // a lantern on its string
    '<g id="pm-lan"><path d="M0 0v8" stroke="#6E4320" stroke-width="2"/><rect x="-5" y="7" width="10" height="4" rx="1" fill="#6E4320"/>' +
    '<rect x="-9" y="11" width="18" height="22" rx="8"/><rect x="-5" y="33" width="10" height="4" rx="1" fill="#6E4320"/><path d="M0 37v6" stroke="#A66A06" stroke-width="2"/></g>' +
    // an arched window of the hall
    '<g id="pm-win"><path d="M0 70V22a22 22 0 0 1 44 0v48z" class="' + ID + '-win ' + ID + '-o"/><path d="M22 0v70M0 34h44" class="' + ID + '-o"/></g>' +
    // fruit: an orange, an apple, a lemon, a melon
    '<circle id="pm-or" r="7" fill="#F59E2A" stroke="#B4650E" stroke-width="1.7"/>' +
    '<g id="pm-ap"><circle r="7" fill="#E5484D" stroke="#8E1F2A" stroke-width="1.7"/><path d="M0-7q1-4 4-5" stroke="#5E3A1C" stroke-width="1.8"/></g>' +
    '<ellipse id="pm-le" rx="8" ry="6" fill="#F7D84A" stroke="#A8860E" stroke-width="1.7"/>' +
    '<g id="pm-me"><circle r="15" fill="#5DB26A" stroke="#1F5A2C" stroke-width="2.2"/><path d="M-7-13q-6 13 0 26M7-13q6 13 0 26M0-15v30" stroke="#2D7C3A" stroke-width="2.4"/></g>' +
    '</defs>';

  /* ---------- sky: the sun or the moon, stars, clouds, far roofs ---------- */
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    rays += 'M' + r1(84 + Math.cos(a) * 40) + ' ' + r1(70 + Math.sin(a) * 40) + 'L' + r1(84 + Math.cos(a) * 52) + ' ' + r1(70 + Math.sin(a) * 52);
  }
  let stars = '';
  [[30, 30], [140, 24], [60, 150], [226, 46], [318, 22], [404, 52], [486, 20], [560, 48], [650, 26], [742, 50], [20, 210], [120, 190]].forEach(function (p, i) {
    stars += circ(p[0], p[1], i % 3 ? 1.6 : 2.4);
  });
  const sky = rect(0, 0, 800, 500, '', 'fill="url(#pm-sky)"') +
    '<g ' + c('stars') + '>' + stars + '</g>' +
    path(rays, 'sun-ray') + circ(84, 70, 29, 'su') + '<path d="M96 48a26 26 0 1 0 8 43 22 22 0 1 1-8-43z" ' + c('mo') + '/>' +
    '<g ' + c('clouds') + '><g ' + c('cloud-a') + '>' + use('pm-cloud', 430, 52, c('cld')) + '</g>' +
    '<g ' + c('cloud-b') + '>' + use('pm-cloud', 228, 44, c('cld') + ' transform="translate(228 44) scale(.7) translate(-228 -44)"') + '</g></g>' +
    path('M0 334V250h30v-26l22-18 22 18v36h34v-44h40v118z', 'far');

  /* ---------- building: the wall of the market hall, its roof and windows, the mosaic, lanterns ---------- */
  const FLOOR = 334, WX = 150;
  let roof = '';
  for (let x = WX - 12; x < 800; x += 26) roof += path('M' + x + ' 76h26v18a13 9 0 0 1-26 0z', 'rf2 or');
  let courses = '';
  [150, 200, 250].forEach(function (y, i) { for (let x = WX + 30 + i * 37; x < 800; x += 150) courses += 'M' + x + ' ' + y + 'h34'; });
  const hall = rect(WX, 96, 660, FLOOR - 96, 'w1 o') + path(courses, '', 'stroke="var(--pm-w2)" stroke-width="3"') + rect(WX, FLOOR - 30, 660, 30, 'w2 o') +
    rect(WX - 14, 58, 680, 22, 'rf or') + roof +
    use('pm-win', 604, 132) + use('pm-win', 672, 132) + use('pm-win', 740, 132);
  // the hundred-square mosaic: 10 rows of 10 tiles; the 25 coloured ones are one quarter of the square
  const MX = 176, MY = 110, T = 13;
  let tilesOn = '', grid = '';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) tilesOn += rect(MX + k * T, MY + r * T, T, T, '', 'fill="' + ((r + k) % 2 ? '#8E72E6' : '#6F52CE') + '"');
  for (let i = 1; i < 10; i++) grid += 'M' + (MX + i * T) + ' ' + MY + 'v' + T * 10 + 'M' + MX + ' ' + (MY + i * T) + 'h' + T * 10;
  const mosaic = rect(MX - 9, MY - 9, T * 10 + 18, T * 10 + 18, '', 'rx="6" fill="#5940A8" stroke="#2A1A6A" stroke-width="2.5"') +
    rect(MX, MY, T * 10, T * 10, '', 'fill="#FFF6E6"') + tilesOn + path(grid, '', 'stroke="#CDBFE8" stroke-width="1.4"') +
    rect(MX, MY, T * 5, T * 5, '', 'stroke="#2A1A6A" stroke-width="2.4"') + rect(MX, MY, T * 10, T * 10, '', 'stroke="#2A1A6A" stroke-width="2"') +
    rect(MX + 36, MY + T * 10 + 3, 58, 23, '', 'rx="7" fill="#5940A8" stroke="#2A1A6A" stroke-width="2.2"') + text(MX + 65, MY + T * 10 + 20, '25%', 'np');
  // a lamp post on the left, with a string of lanterns to the hall; a row of lanterns under the roof
  const Q = function (x0, y0, xc, yc, x1, y1, t) { const u = 1 - t; return [u * u * x0 + 2 * u * t * xc + t * t * x1, u * u * y0 + 2 * u * t * yc + t * t * y1]; };
  const LANC = ['#F7B23B', '#E5404A', '#2FA39A'];
  let lans = '', glow = '';
  const lantern = function (x, y, i) {
    lans += '<g ' + c('lan' + (i % 2 ? ' lan-b' : '')) + '>' + use('pm-lan', x, y, 'fill="' + LANC[i % 3] + '" stroke="#6E4320" stroke-width="1.6"') + '</g>';
    glow += circ(x, y + 22, 19, '', 'fill="#FFE38A" opacity=".5"');
  };
  [0.2, 0.5, 0.8].forEach(function (t, i) { const p = Q(40, 128, 96, 150, WX, 100, t); lantern(p[0], p[1], i); });
  [340, 394, 448, 502, 556].forEach(function (x, i) { lantern(x, 94, i + 1); });
  const post = path('M40 128Q96 150 ' + WX + ' 100', 'str') + rect(35, 120, 10, 216, 'rf2 or', 'rx="4"') + rect(26, 326, 28, 12, 'rf2 or', 'rx="3"') +
    path('M40 122c-16-4-18-20-8-28', '', 'stroke="var(--pm-rfl)" stroke-width="4"') + rect(20, 92, 22, 26, '', 'rx="6" fill="#FFE9A6" stroke="#6E4320" stroke-width="2.2"') +
    // a small tree in a tub beside the hall
    rect(102, 250, 10, 60, 'wd2 ow') + circ(107, 226, 34, 'lf ol') + circ(86, 250, 20, 'lf ol') + circ(128, 250, 20, 'lf ol') + circ(107, 236, 28, 'lf') +
    path('M84 306h46l-6 30H90z', 'rf or');

  /* ---------- floor: the paved street ---------- */
  let tiles = '';
  [352, 378, 414, 460].forEach(function (y) { tiles += 'M0 ' + y + 'H800'; });
  for (let x = -280; x <= 1080; x += 68) tiles += 'M' + x + ' ' + FLOOR + 'L' + r1(400 + (x - 400) * 1.6) + ' 500';
  const floor = rect(0, FLOOR, 800, 166, 'fl') + path('M0 ' + FLOOR + 'H800', '', 'stroke="var(--pm-tl)" stroke-width="3"') + path(tiles, 'tl');

  /* ---------- things ---------- */
  // the middle stall: two posts, a sign over a striped awning, and a wooden counter
  const SX = 328, SW = 226, CT = 304;
  const sign = rect(SX + 6, 148, SW - 12, 52, 'bd oa', 'rx="8"') +
    text(SX + 36, 170, '1', 'ns') + path('M' + (SX + 24) + ' 175h24', 'nl') + text(SX + 36, 196, '2', 'ns') +
    path('M' + (SX + 58) + ' 170h14M' + (SX + 58) + ' 179h14', 'nl') + text(SX + 100, 182, '0.5', 'ns') +
    path('M' + (SX + 128) + ' 170h14M' + (SX + 128) + ' 179h14', 'nl') + text(SX + 180, 182, '50%', 'ns');
  const stall = rect(SX, 144, 8, 206, 'wd2 ow') + rect(SX + SW - 8, 144, 8, 206, 'wd2 ow') + sign + awning(SX - 8, SW + 16, 208, 8, 'aw', 'aw2', 'oa') +
    rect(SX - 4, CT, SW + 8, 46, 'wd ow', 'rx="4"') + path('M' + SX + ' ' + (CT + 16) + 'h' + SW + 'M' + SX + ' ' + (CT + 31) + 'h' + SW, 'gr') +
    rect(SX - 8, CT - 4, SW + 16, 9, 'aw oa', 'rx="4"');
  // a crate of fruit on the counter: two rows of fruit over a sloping wooden front
  const crate = function (x, id, n) {
    let s = '';
    for (let i = 0; i < n - 1; i++) s += use(id, x + 15 + i * 13.5, CT - 31);
    for (let i = 0; i < n; i++) s += use(id, x + 8 + i * 13.5, CT - 22);
    return s + path('M' + x + ' ' + (CT - 4) + 'l4-18h' + (n * 13.5 - 6) + 'l4 18z', 'wd ow') + path('M' + (x + 3) + ' ' + (CT - 12) + 'h' + (n * 13.5 - 4), 'gr');
  };
  // a price tag that hangs from the edge of the counter
  const tag = function (x, y, t) {
    return '<g ' + c('tag') + '>' + path('M' + x + ' ' + y + 'v8', '', 'stroke="#6E4320" stroke-width="2.4"') +
      rect(x - 24, y + 7, 48, 24, '', 'rx="7" fill="#FFFFFF" stroke="#5940A8" stroke-width="2.4"') + text(x, y + 25, t, 'nt') + '</g>';
  };
  const crates = crate(SX + 10, 'pm-or', 4) + crate(SX + 76, 'pm-ap', 4) + tag(SX + 39, CT + 3, '50%') + tag(SX + 105, CT + 3, '25%');
  const third = crate(SX + 146, 'pm-le', 5);

  // Zip the stall keeper, beside the stall, in an apron with a pocket
  const zip = '<g ' + c('zip') + '><g transform="translate(252 275) scale(.6)">' +
    '<line x1="60" y1="24" x2="60" y2="13" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="11" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the apron
    '<path d="M40 93h40v21a9 9 0 0 1-9 9H49a9 9 0 0 1-9-9z" fill="#FFFFFF" stroke="#5940A8" stroke-width="3"/>' +
    '<path d="M40 99h40" stroke="#7C5FD8" stroke-width="4"/><rect x="51" y="106" width="18" height="11" rx="3" fill="#E6DEFA" stroke="#5940A8" stroke-width="2"/></g></g>';

  // the second stall on the right: baskets of fruit and a tag 10%
  const basket = function (x, y, id) {
    return use(id, x - 12, y - 6) + use(id, x, y - 9) + use(id, x + 12, y - 6) + path('M' + (x - 24) + ' ' + (y - 2) + 'h48l-5 22h-38z', '', 'fill="#E2B56E" stroke="#6E4320" stroke-width="2.2"') +
      path('M' + (x - 22) + ' ' + (y + 6) + 'h44M' + (x - 20) + ' ' + (y + 13) + 'h40', 'gr');
  };
  const RX = 600, RW = 172;
  const right = rect(RX, 216, 7, 134, 'wd2 ow') + rect(RX + RW - 7, 216, 7, 134, 'wd2 ow') + awning(RX - 8, RW + 16, 224, 6, 'ab', 'aw2', 'ob') +
    rect(RX - 4, CT, RW + 8, 46, 'wd ow', 'rx="4"') + path('M' + RX + ' ' + (CT + 16) + 'h' + RW + 'M' + RX + ' ' + (CT + 31) + 'h' + RW, 'gr') +
    basket(RX + 34, CT - 18, 'pm-le') + basket(RX + 88, CT - 18, 'pm-or') + basket(RX + 142, CT - 18, 'pm-ap') + tag(RX + 88, CT + 3, '10%');
  // on the street: a basket of melons, a crate and a sack
  const street = use('pm-me', 468, 392) + use('pm-me', 496, 396) + use('pm-me', 482, 378) + path('M444 392h76l-8 40h-60z', '', 'fill="#E2B56E" stroke="#6E4320" stroke-width="2.4"') +
    path('M447 406h70M450 419h64', 'gr') +
    rect(574, 392, 64, 40, 'wd ow', 'rx="3"') + path('M578 412h56', 'gr') + use('pm-or', 590, 388) + use('pm-or', 606, 388) + use('pm-or', 622, 388) + use('pm-or', 598, 378) + use('pm-or', 614, 378) +
    path('M176 440c-10-22-8-42 2-58h52c10 16 12 36 2 58z', '', 'fill="#F3E3C3" stroke="#8A6A3A" stroke-width="2.5"') + path('M184 382q20 10 40 0', '', 'stroke="#8A6A3A" stroke-width="2.5"') +
    path('M192 414l12-13 12 13-12 13z', 'aw') + use('pm-ap', 244, 432) + use('pm-ap', 258, 436) +
    rect(300, 404, 60, 36, 'wd ow', 'rx="3"') + path('M304 422h52', 'gr') + use('pm-le', 314, 400) + use('pm-le', 330, 400) + use('pm-le', 346, 400) + use('pm-le', 322, 391) + use('pm-le', 338, 391) +
    rect(366, 414, 60, 36, 'wd ow', 'rx="3"') + path('M370 432h52', 'gr') + use('pm-ap', 380, 410) + use('pm-ap', 396, 410) + use('pm-ap', 412, 410) + use('pm-ap', 388, 400) + use('pm-ap', 404, 400) +
    use('pm-me', 700, 430) + use('pm-me', 728, 436);

  // the heart: Zip and the two crates with their price tags (together they fit between the floating buttons on a phone)
  const heart = '<ellipse cx="288" cy="350" rx="30" ry="6" fill="var(--pm-tl)" opacity=".7"/><g data-heart="tags">' + crates + zip + '</g>';
  const things = stall + third + heart + right + street;

  const label = 'The Percent Market: a street by a long market hall. On its wall a mosaic of 100 small tiles, 10 rows of 10, has 25 tiles ' +
    'coloured, one quarter, with a plaque: 25%. The middle stall has a striped awning and a sign: 1 over 2 = 0.5 = 50%. On its counter, crates of ' +
    'oranges and apples carry price tags: 50% and 25%. A second stall has a tag: 10%. Lanterns hang under the roof. Zip, the stall keeper, ' +
    'stands by the stall in an apron.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="165,150,520,220" data-band="252,348" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + hall + mosaic + post + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + things + rect(0, 0, 800, 500, 'dim') + '<g ' + c('glow') + '>' + glow + '</g>' + lans + '</g>' +
    '</svg>';

  window.T_ART = Object.assign(window.T_ART || {}, { [ID]: svg });
})();

