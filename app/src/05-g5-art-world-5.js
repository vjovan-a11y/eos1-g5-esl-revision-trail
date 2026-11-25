/* 05-g5-art-world-5.js - the Fraction Bakery, the world scene of Stop 5 (window.T_ART['world-fraction-bakery']).

   The hub header of Stop 5 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the round cake cut into 8 equal slices with 4 of them left on its plate, carries data-heart.
     Layers, back to front: sky (the striped wall of the shop and a window on the street: sun or moon, stars, a cloud,
     under a striped valance), building (a chalkboard with the stacked fractions 4/8 = 1/2 and two chalk circles, shelves
     of bread, hanging lamps, a brick oven), floor (the tiled floor and the wooden counter in two parts), things: on the counter
     the cake cut into 8 equal slices: 4 are still on the plate (4/8, one half) and the other 4 are served, 2 on small
     plates and 2 on the plates that Zip holds up; a baking tray for 12 buns in 4 equal rows of 3, with 3 of the 4 rows
     lifted out on to a board (9 buns, tagged 3/4) and 1 row left; a mixing bowl, a jar of biscuits, a sack of flour.
     Zip, in a baker's hat, stands in the way through the counter, beside the cake.
     Maths meaning: equal parts and simplest form (4/8 = 1/2: the cake and the chalkboard), a fraction of an amount
     (3/4 of 12 = 9: the buns).
     Palette: CSS variables on .art (--fb-*), redefined by the class world-fraction-bakery-night (the dark theme):
       the room is dim, the lamps and the oven glow, the window shows the moon and stars.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the lamps sway, the steam rises and fades, the cloud drifts, the stars twinkle, Zip bobs.
       Still under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-fraction-bakery';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#BFE3F7', sk2: '#FFF1DC', wl: '#FFEBCB', wl2: '#FCDDB0', wn: '#F4C283', wn2: '#E9AE66', aw: '#E0902F', aw2: '#FFFFFF', awl: '#8A4E10',
    wd: '#C98E52', wd2: '#A8703C', wdl: '#6E4320', ctt: '#F8DDB0', fl: '#F3E5D2', fl2: '#E6CFAE', tl: '#D2B78E', bk: '#D9825A', bk2: '#B9623E',
    cld: '#FFFFFF', lamp: '#FFF3B8', glow: '0', dim: '0', fire: '.75', su: '1', mo: '0', sr: '0'
  };
  const NIGHT = {
    sk1: '#141B3E', sk2: '#34365E', wl: '#5A4028', wl2: '#644830', wn: '#4A321E', wn2: '#3E2A18', aw: '#A8661C', aw2: '#D8C8B0', awl: '#3E2206',
    wd: '#7A5838', wd2: '#5E4229', wdl: '#2C1C0E', ctt: '#B39468', fl: '#4A3A2C', fl2: '#3E3024', tl: '#2E2218', bk: '#7E4A32', bk2: '#643824',
    cld: '#4A4E78', lamp: '#FFE27A', glow: '1', dim: '.24', fire: '1', su: '0', mo: '1', sr: '1'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--fb-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--fb-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['wl', 'wl2', 'wn', 'wn2', 'aw', 'aw2', 'wd', 'wd2', 'ctt', 'fl', 'fl2', 'bk', 'bk2', 'cld', 'lamp']) +
    S + 'ow{stroke:var(--fb-wdl);stroke-width:2.5}' + S + 'oa{stroke:var(--fb-awl);stroke-width:2.4}' +
    S + 'tl{stroke:var(--fb-tl);stroke-width:2;fill:none}' + S + 'gr{stroke:var(--fb-wd2);stroke-width:2;fill:none}' +
    S + 'su{fill:#FFE08A;opacity:var(--fb-su)}' + S + 'mo{fill:#FFF4CF;opacity:var(--fb-mo)}' + S + 'stars{fill:#FFF4CF;opacity:var(--fb-sr)}' +
    S + 'glow{opacity:var(--fb-glow)}' + S + 'dim{fill:#1A0E05;opacity:var(--fb-dim)}' + S + 'fire{opacity:var(--fb-fire)}' +
    S + 'chalk{fill:#FFFFFF;font:800 22px/1 ' + FONT + ';text-anchor:middle}' + S + 'chl{stroke:#FFFFFF;stroke-width:3;fill:none}' +
    S + 'nt{fill:#5A2E00;font:800 13px/1 ' + FONT + ';text-anchor:middle}' + S + 'steam{stroke:#FFFFFF;stroke-width:3;fill:none;opacity:.7}' +
    // what moves: each part turns or slides around its own box
    S + 'lan{transform-box:fill-box;transform-origin:50% 0}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    live + 'cloud{animation:' + ID + '-drift 26s ease-in-out infinite alternate}' +
    live + 'lan{animation:' + ID + '-sway 5.6s ease-in-out infinite alternate}' + live + 'lan-b{animation-delay:-2.8s}' +
    live + 'steam{animation:' + ID + '-steam 4.4s ease-in-out infinite}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'stars{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-8px)}100%{transform:translateX(10px)}}' +
    '@keyframes ' + ID + '-sway{0%{transform:rotate(-2.5deg)}100%{transform:rotate(2.5deg)}}' +
    '@keyframes ' + ID + '-steam{0%{transform:translateY(4px);opacity:0}40%{opacity:.75}100%{transform:translateY(-8px);opacity:0}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-3px)}}' +
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
  const ell = function (x, y, rx, ry, cls, extra) { return '<ellipse cx="' + r1(x) + '" cy="' + r1(y) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  // a stacked fraction: numerator, bar, denominator (the bar is at y)
  const frac = function (x, y, n, d, cls, bar, size) {
    return text(x, y - size * .28, n, cls) + path('M' + r1(x - size * .5) + ' ' + y + 'h' + size, bar) + text(x, y + size * .95, d, cls);
  };

  /* ---------- reusable shapes (defs) ---------- */
  const defs = '<defs>' +
    '<linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--fb-sk1)"/><stop offset="1" style="stop-color:var(--fb-sk2)"/></linearGradient>' +
    '<path id="fb-cloud" d="M0 0h42c6 0 8-8 2-10 1-7-7-10-11-6-3-7-13-7-16-1-5-2-11 1-10 7-5 1-6 10 0 10z"/>' +
    // a bun, a loaf, a round loaf, a baguette
    '<g id="fb-bun"><circle r="9.5" fill="#EAA94E" stroke="#8E5A1E" stroke-width="2"/><path d="M-5-3q5-4 10 0" stroke="#FCE0A6" stroke-width="2.4"/></g>' +
    '<g id="fb-loaf"><path d="M-22 0v-12c0-9 8-14 22-14s22 5 22 14v12z" fill="#D9984A" stroke="#7E4B16" stroke-width="2.2"/><path d="M-10-20l5 9M0-22l5 9M10-20l5 9" stroke="#F6D49A" stroke-width="2.6"/></g>' +
    '<g id="fb-boule"><path d="M-18 0c-6-12 4-22 18-22s24 10 18 22z" fill="#C98742" stroke="#7E4B16" stroke-width="2.2"/><path d="M-7-17v10M0-19v12M7-17v10" stroke="#F6D49A" stroke-width="2.4"/></g>' +
    '<g id="fb-bag"><rect x="-5" y="-58" width="10" height="60" rx="5" fill="#E2A956" stroke="#7E4B16" stroke-width="2"/><path d="M-3-48l6 5M-3-36l6 5M-3-24l6 5" stroke="#F8DDA8" stroke-width="2.2"/></g>' +
    // a slice of the cake from the side, on a small plate; its foot is at 0,0
    '<g id="fb-slice"><ellipse cx="0" cy="1" rx="19" ry="5" fill="#FFFFFF" stroke="#8A97A8" stroke-width="1.8"/>' +
    '<path d="M-13-1H12V-17L-13-8Z" fill="#FBE3B0" stroke="#8E5A1E" stroke-width="1.8"/><path d="M-13-5L12-10" stroke="#F58FA8" stroke-width="2.2"/>' +
    '<path d="M-13-8L12-17v-4L-13-11Z" fill="#F58FA8" stroke="#A8324F" stroke-width="1.8"/><circle cx="7" cy="-23" r="3.6" fill="#E5404A" stroke="#8E1F2A" stroke-width="1.4"/></g>' +
    // a hanging lamp; its top is at 0,0
    '<g id="fb-lan"><path d="M0 0v26" stroke="#6E4320" stroke-width="2.4"/><circle cx="0" cy="50" r="8" class="' + ID + '-lamp"/>' +
    '<path d="M-7 26h14l15 22h-44z" class="' + ID + '-aw ' + ID + '-oa"/></g>' +
    '</defs>';

  /* ---------- sky: the wall of the shop, and the window on the street under its striped valance ---------- */
  let stripes = '';
  for (let x = 20; x < 800; x += 56) stripes += rect(x, 0, 22, 222, 'wl2');
  const WX = 330, WY = 88, WW = 144, WH = 108;
  let val = '';
  for (let i = 0; i < 7; i++) { const sw = (WW + 28) / 7; val += path('M' + r1(WX - 14 + i * sw) + ' ' + (WY - 26) + 'h' + r1(sw) + 'v24a' + r1(sw / 2) + ' 8 0 0 1-' + r1(sw) + ' 0z', (i % 2 ? 'aw2' : 'aw') + ' oa'); }
  const sky = rect(0, 0, 800, 310, 'wl') + stripes +
    rect(WX - 8, WY - 8, WW + 16, WH + 16, 'wd ow', 'rx="6"') + rect(WX, WY, WW, WH, '', 'fill="url(#fb-sky)"') +
    '<g ' + c('stars') + '>' + circ(WX + 20, WY + 30, 1.8) + circ(WX + 52, WY + 54, 1.5) + circ(WX + 64, WY + 22, 2.2) + circ(WX + 124, WY + 76, 1.6) + circ(WX + 30, WY + 78, 2) + '</g>' +
    circ(WX + 106, WY + 40, 15, 'su') + '<path d="M' + (WX + 112) + ' ' + (WY + 26) + 'a15 15 0 1 0 5 25 13 13 0 1 1-5-25z" ' + c('mo') + '/>' +
    '<g ' + c('cloud') + '>' + use('fb-cloud', WX + 26, WY + 62, c('cld')) + '</g>' +
    path('M' + WX + ' ' + (WY + 92) + 'h24v-22h22v-14h30v20h26v-12h42v44H' + WX + 'Z', 'wn2', 'opacity=".55"') +
    path('M' + (WX + WW / 2) + ' ' + WY + 'v' + WH + 'M' + WX + ' ' + (WY + WH / 2) + 'h' + WW, '', 'stroke="var(--fb-wd)" stroke-width="5"') +
    rect(WX, WY, WW, WH, 'ow') + rect(WX - 16, WY + WH + 6, WW + 32, 9, 'wd ow', 'rx="3"') +
    val + rect(WX - 18, WY - 34, WW + 36, 10, 'aw oa', 'rx="4"');

  /* ---------- building: the chalkboard, the shelves of bread, the wainscot, the oven, the lamps ---------- */
  // the chalkboard: 4/8 = 1/2, and two chalk circles: 4 of 8 parts and 1 of 2 parts coloured
  const CX = 238, CY = 132;
  let pie8 = '';
  for (let i = 0; i < 4; i++) { const a = (i * 45 + 90) * Math.PI / 180; pie8 += 'M' + r1(CX - 36 + Math.cos(a) * 15) + ' ' + r1(CY + 42 + Math.sin(a) * 15) + 'L' + r1(CX - 36 - Math.cos(a) * 15) + ' ' + r1(CY + 42 - Math.sin(a) * 15); }
  const board = rect(CX - 72, CY - 64, 144, 132, 'wd ow', 'rx="8"') + rect(CX - 63, CY - 55, 126, 114, '', 'rx="4" fill="#2F5D4A"') +
    frac(CX - 36, CY - 18, '4', '8', 'chalk', 'chl', 24) + path('M' + (CX - 9) + ' ' + (CY - 23) + 'h18M' + (CX - 9) + ' ' + (CY - 13) + 'h18', 'chl') + frac(CX + 36, CY - 18, '1', '2', 'chalk', 'chl', 24) +
    path('M' + (CX - 36) + ' ' + (CY + 27) + 'a15 15 0 0 0 0 30z', '', 'fill="#F7A8BC"') + path('M' + (CX + 36) + ' ' + (CY + 27) + 'a15 15 0 0 0 0 30z', '', 'fill="#F7A8BC"') +
    circ(CX - 36, CY + 42, 15, '', 'stroke="#FFFFFF" stroke-width="2.2"') + path(pie8, '', 'stroke="#FFFFFF" stroke-width="1.8"') +
    circ(CX + 36, CY + 42, 15, '', 'stroke="#FFFFFF" stroke-width="2.2"') + path('M' + (CX + 36) + ' ' + (CY + 27) + 'v30', '', 'stroke="#FFFFFF" stroke-width="1.8"') +
    rect(CX - 30, CY + 64, 60, 7, 'wd2 ow', 'rx="2"') + rect(CX - 20, CY + 60, 16, 5, '', 'rx="2" fill="#FFFFFF"');
  // two shelves of bread
  const shelf = function (y) { return rect(500, y, 204, 9, 'wd ow', 'rx="3"') + path('M516 ' + (y + 9) + 'v12l12-12M696 ' + (y + 9) + 'v12l-12-12', 'ow'); };
  const shelves = shelf(118) + use('fb-loaf', 532, 118) + use('fb-boule', 584, 118) + use('fb-loaf', 636, 118) + use('fb-boule', 684, 118) +
    shelf(184) + use('fb-bag', 520, 184, 'transform="rotate(-8 520 184)"') + use('fb-bag', 532, 184) + use('fb-bag', 545, 184, 'transform="rotate(8 545 184)"') +
    path('M508 184v-22h50v22z', 'wn ow') + path('M512 170h42M512 177h42', 'gr') + use('fb-boule', 596, 184) + use('fb-loaf', 648, 184) + use('fb-bun', 688, 174);
  // the wainscot behind the counter
  let panels = '';
  for (let x = 14; x < 800; x += 78) panels += rect(x, 236, 62, 60, 'wn2', 'rx="6" opacity=".6"');
  const wains = rect(0, 222, 800, 92, 'wn') + path('M0 222H800', 'ow') + panels;
  // the brick oven on the left, with its fire
  let bricks = '';
  [176, 196, 216, 236, 256, 276].forEach(function (y, i) { bricks += 'M18 ' + y + 'H146'; for (let x = (i % 2 ? 38 : 58); x < 146; x += 40) bricks += 'M' + x + ' ' + y + 'v20'; });
  const oven = rect(18, 156, 128, 156, 'bk ow', 'rx="6"') + path(bricks, '', 'stroke="var(--fb-bk2)" stroke-width="2"') + rect(10, 146, 144, 14, 'bk2 ow', 'rx="4"') + rect(56, 60, 40, 88, 'bk ow') +
    path('M46 300v-52a36 36 0 0 1 72 0v52z', '', 'fill="#3A2418" stroke="#2C1C0E" stroke-width="2.5"') +
    '<g ' + c('fire') + '>' + path('M58 300c-4-22 10-26 12-44 10 10 6 20 12 26 4-8 2-14 8-20 8 14 18 22 14 38z', '', 'fill="#F59E2A"') + path('M70 300c-2-12 6-14 8-24 8 8 12 14 10 24z', '', 'fill="#FFE08A"') + '</g>';
  // three hanging lamps, and their light at night
  let lans = '', glow = '';
  [206, 402, 606].forEach(function (x, i) {
    lans += '<g ' + c('lan' + (i % 2 ? ' lan-b' : '')) + '>' + use('fb-lan', x, 0) + '</g>';
    glow += circ(x, 52, 30, '', 'fill="#FFE38A" opacity=".45"') + path('M' + (x - 20) + ' 52L' + (x - 96) + ' 310H' + (x + 96) + 'L' + (x + 20) + ' 52Z', '', 'fill="#FFE38A" opacity=".1"');
  });

  /* ---------- floor: the tiled floor and the counter in two parts, with a way through for the baker ---------- */
  const TOP = 286, FRONT = 340, FLOOR = 418, BACK = 312;
  let tiles = '';
  [334, 362, 398, 440, 484].forEach(function (y) { tiles += 'M0 ' + y + 'H800'; });
  for (let x = -200; x <= 1000; x += 60) tiles += 'M' + x + ' ' + BACK + 'L' + r1(400 + (x - 400) * 1.9) + ' 500';
  const unit = function (x0, x1) {             // one part of the counter, from x0 to x1 at the front
    let s = rect(x0, FRONT, x1 - x0, FLOOR - FRONT, 'wd ow');
    const n = Math.round((x1 - x0) / 124), w = (x1 - x0 - 16) / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + 14 + i * w;
      s += rect(x, FRONT + 14, w - 12, 50, 'wd2 ow', 'rx="6"') + path('M' + r1(x + 12) + ' ' + (FRONT + 32) + 'h' + r1(w - 36) + 'M' + r1(x + 12) + ' ' + (FRONT + 46) + 'h' + r1(w - 36), '', 'stroke="var(--fb-wd)" stroke-width="2"');
    }
    return s + rect(x0, FLOOR - 8, x1 - x0, 10, 'wd2 ow') +
      path('M' + (x0 + (x0 < 400 ? 20 : 10)) + ' ' + TOP + 'H' + (x1 - (x0 < 400 ? 10 : 20)) + 'L' + x1 + ' ' + FRONT + 'H' + x0 + 'Z', 'ctt ow') + rect(x0 - 4, FRONT - 2, x1 - x0 + 8, 9, 'aw oa', 'rx="4"');
  };
  const floor = rect(0, BACK, 800, 188, 'fl') + path('M0 ' + BACK + 'H800', 'ow') + path(tiles, 'tl') + ell(427, 346, 30, 6, 'tl', 'style="fill:var(--fb-tl);stroke:none" opacity=".7"') +
    unit(8, 368) + unit(486, 792);

  /* ---------- things ---------- */
  // the heart: a round cake cut into 8 equal slices; 4 are still here (the half at the front), 4 have been served
  const KX = 300, KY = 292, RX = 48, RY = 20, KH = 17;
  const P = function (deg, dy) { const a = deg * Math.PI / 180; return r1(KX + RX * Math.cos(a)) + ' ' + r1(KY + RY * Math.sin(a) + (dy || 0)); };
  const arc = function (deg, dy, sweep) { return 'A' + RX + ' ' + RY + ' 0 0 ' + sweep + ' ' + P(deg, dy); };
  let cuts = '', marks = '', berries = '';
  [65, 110, 155].forEach(function (d) { cuts += 'M' + KX + ' ' + KY + 'L' + P(d) + 'L' + P(d, KH); });
  [245, 290, 335].forEach(function (d) { marks += 'M' + KX + ' ' + (KY + KH) + 'L' + P(d, KH); });
  [42.5, 87.5, 132.5, 177.5].forEach(function (d) {
    const a = d * Math.PI / 180, x = KX + RX * .62 * Math.cos(a), y = KY + RY * .62 * Math.sin(a);
    berries += circ(x, y - 2, 4.4, '', 'fill="#E5404A" stroke="#8E1F2A" stroke-width="1.5"') + circ(x - 1.2, y - 3.4, 1.2, '', 'fill="#FFB3B3"');
  });
  const cake = '<g data-heart="cake">' +
    ell(KX, KY + KH + 3, 61, 25, '', 'fill="#FFFFFF" stroke="#8A97A8" stroke-width="2.4"') + ell(KX, KY + KH + 2, 53, 21, '', 'stroke="#D5DCE6" stroke-width="2"') +
    // the empty half of the plate: the places of the 4 slices that were served
    path('M' + P(200, KH) + arc(290, KH, 1) + arc(20, KH, 1), '', 'stroke="#AAB5C4" stroke-width="2" stroke-dasharray="4 5"') + path(marks, '', 'stroke="#AAB5C4" stroke-width="2" stroke-dasharray="4 5"') +
    // the half that is left: its side (front), then its top with the cuts
    path('M' + P(20) + arc(110, 0, 1) + arc(180, 0, 1) + 'L' + P(180, KH) + arc(110, KH, 0) + arc(20, KH, 0) + 'Z', '', 'fill="#FBE3B0" stroke="#8E5A1E" stroke-width="2.2"') +
    path('M' + P(20, KH * .55) + arc(110, KH * .55, 1) + arc(180, KH * .55, 1), '', 'stroke="#F58FA8" stroke-width="3.2"') +
    path('M' + P(20) + arc(110, 0, 1) + arc(200, 0, 1) + 'Z', '', 'fill="#F9A8BC" stroke="#A8324F" stroke-width="2.2"') +
    path(cuts, '', 'stroke="#A8324F" stroke-width="2"') + berries + '</g>';
  // 2 of the served slices wait on small plates; Zip holds up the other 2
  const served = use('fb-slice', 176, 312) + use('fb-slice', 212, 330);

  // Zip the baker in the way through the counter, a slice on a plate in each hand
  const ZX = 394, ZY = 278;
  const zip = '<g ' + c('zip') + '><g transform="translate(' + ZX + ' ' + ZY + ') scale(.55)">' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="60" cy="107" r="6" fill="#E5404A"/>' +
    '<path d="M36 100Q2 106 -18 84" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="-20" cy="81" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q118 106 138 84" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="140" cy="81" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the baker's hat (the antenna pokes through)
    '<line x1="60" y1="-8" x2="60" y2="-17" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="-19" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<path d="M34 14c-16-3-14-22 4-20 4-12 40-12 44 0 18-2 20 17 4 20z" fill="#FFFFFF" stroke="#7C8AA0" stroke-width="3"/>' +
    '<rect x="32" y="10" width="56" height="17" rx="5" fill="#FFFFFF" stroke="#7C8AA0" stroke-width="3"/><path d="M48 -2v9M60 -5v12M72 -2v9" stroke="#C5CEDB" stroke-width="2.5"/></g>' +
    use('fb-slice', ZX - 12, ZY + 41) + use('fb-slice', ZX + 78, ZY + 41) + '</g>';

  // the baking tray for 12 buns: 4 equal rows of 3; 3 of the rows have been lifted out on to the board beside it
  const TX = 506, TY = 232;
  let tray = rect(TX - 2, TY + 84, 88, 14, '', 'rx="4" fill="#8E9BAA" stroke="#4A5564" stroke-width="2.4"') +
    rect(TX, TY, 84, 94, '', 'rx="8" fill="#C9D3DC" stroke="#4A5564" stroke-width="2.4"') + rect(TX + 6, TY + 6, 72, 82, '', 'rx="5" fill="#AEBBC8"');
  let lifted = rect(TX + 100, TY + 20, 84, 74, 'wd ow', 'rx="8"') + path('M' + (TX + 108) + ' ' + (TY + 44) + 'h68M' + (TX + 108) + ' ' + (TY + 68) + 'h68', 'gr');
  for (let row = 0; row < 4; row++) for (let i = 0; i < 3; i++) {
    const x = TX + 20 + i * 22, y = TY + 14 + row * 21.5;
    if (row < 3) { tray += circ(x, y, 8.5, '', 'stroke="#E8EEF4" stroke-width="1.8" stroke-dasharray="3 4"'); lifted += use('fb-bun', x + 100, y + 23); } else tray += use('fb-bun', x, y);
  }
  const buns = tray + lifted +
    path('M' + (TX + 70) + ' ' + (TY - 4) + 'q28-22 56 8', '', 'stroke="#AC661A" stroke-width="3"') + path('M' + (TX + 127) + ' ' + (TY - 8) + 'v13h-13', '', 'stroke="#AC661A" stroke-width="3"') +
    rect(TX + 152, TY - 24, 30, 40, '', 'rx="6" fill="#FFFFFF" stroke="#AC661A" stroke-width="2.4"') + frac(TX + 167, TY - 4, '3', '4', 'nt', 'gr', 14);

  // small things on the counter and on the floor
  const bowl = path('M56 296h76c0 22-16 32-38 32s-38-10-38-32z', '', 'fill="#8FCBE8" stroke="#2F6E94" stroke-width="2.4"') + ell(94, 296, 38, 7, '', 'fill="#FFF6E0" stroke="#2F6E94" stroke-width="2.4"') +
    path('M100 294L128 246', '', 'stroke="#6E4320" stroke-width="5"') + path('M64 314q30 8 60 0', '', 'stroke="#FFFFFF" stroke-width="2.4" opacity=".7"');
  const jar = rect(716, 280, 44, 48, '', 'rx="9" fill="#E6F4FA" stroke="#5C7A8A" stroke-width="2.4" opacity=".9"') + circ(729, 314, 7, '', 'fill="#D9984A" stroke="#7E4B16" stroke-width="1.8"') +
    circ(745, 316, 7, '', 'fill="#D9984A" stroke="#7E4B16" stroke-width="1.8"') + circ(737, 303, 7, '', 'fill="#D9984A" stroke="#7E4B16" stroke-width="1.8"') + rect(712, 270, 52, 12, 'aw oa', 'rx="5"');
  const sack = path('M84 470c-10-22-8-44 2-62h56c10 18 12 40 2 62z', '', 'fill="#F3E3C3" stroke="#8A6A3A" stroke-width="2.5"') + path('M92 408q22 10 44 0', '', 'stroke="#8A6A3A" stroke-width="2.5"') +
    path('M102 440l12-14 12 14-12 14z', 'aw') +
    path('M650 474l-6-44h84l-6 44z', 'wn ow') + path('M648 444h76M650 458h72', 'gr') + use('fb-bag', 664, 440, 'transform="rotate(-10 664 440)"') + use('fb-bag', 684, 440) + use('fb-bag', 704, 440, 'transform="rotate(10 704 440)"');
  const steam = '<g ' + c('steam') + '>' + path('M532 86q-6-8 0-16M584 84q6-8 0-16M636 86q-6-8 0-16') + '</g>';

  const label = 'The Fraction Bakery: a warm shop with a striped wall, a window and shelves of bread. On the counter a round cake is cut ' +
    'into 8 equal slices: 4 are still on the plate, one half, and 4 are served on small plates. A chalkboard shows 4 over 8 = 1 over 2. ' +
    'A baking tray holds 12 buns in 4 equal rows; 3 of the 4 rows, 9 buns, are lifted out on to a board tagged 3 over 4. ' +
    'Zip, in a baker\'s hat, holds up two slices beside the cake.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="150,150,550,220" data-band="262,340" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + wains + board + shelves + oven + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + bowl + jar + served + cake + zip + buns + steam + sack + rect(0, 0, 800, 500, 'dim') +
    '<g ' + c('glow') + '>' + glow + '</g>' + lans + '</g>' +
    '</svg>';

  window.T_ART = Object.assign(window.T_ART || {}, { [ID]: svg });
})();

