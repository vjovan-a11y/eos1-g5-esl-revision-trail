/* 05-g5-art-world-9.js - the Data Stadium, the world scene of Stop 9 (window.T_ART['world-data-stadium']).

   The hub header of Stop 9 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, section 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the scoreboard with five score cards in order, carries data-heart.
     Layers, back to front: sky (the sun or the moon, stars, clouds), building (the stands with a crowd of dots, a row of
     flags on top, two floodlights and their beams, a wall of coloured panels), floor (the grass with mown stripes and a
     running track with lanes 1, 2, 3), things: a winners' podium (2, 1, 3) with a cup; Zip the coach with a cap, a
     whistle and a stopwatch; the scoreboard: the cards 3, 5, 5, 7, 10 in order, the two 5s in the same colour (the
     mode), the middle card lit with a pointer over it (the median); five towers of blocks made level: 3, 5, 5, 7 and 10
     blocks shared out equally are 6 in each tower (the mean; the moved blocks are yellow, their old places are dashed,
     a dashed line and a tag show the level, 6); cones and a ball on the grass, two hurdles on the track.
     Maths meaning: put the data in order; the value that comes up most often is the mode (5); the middle value is the
     median (5); sharing out equally gives the mean (30 ÷ 5 = 6); the range is from the first card to the last (10 − 3).
     Palette: CSS variables on .art (--ds9-*), redefined by the class world-data-stadium-night (the dark theme):
       a dark sky with stars and the moon, the floodlights shine on the pitch, the lit card glows more.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the clouds drift, the flags wave, the crowd bobs, the stars twinkle, the lit card's glow breathes, Zip bobs.
       Still under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-data-stadium';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#A9D8F5', sk2: '#EAF6FF', st: '#7FA9C2', st2: '#5B8CA8', stl: '#3C6880', wall: '#F4F7FA', gr: '#9AD47E', gr2: '#8AC96E',
    tr: '#E08A68', tr2: '#C96F50', ln: '#FFFFFF', bd: '#24384C', bdl: '#101C2A', cd: '#EAF2F8', pd: '#5B8CA8', pd2: '#7FA9C2',
    mt: '#8A97A8', cld: '#FFFFFF', sh: '#6FAF58',
    glow: '0', halo: '.55', su: '1', mo: '0', sr: '0', cso: '.95', crowd: '1'
  };
  const NIGHT = {
    sk1: '#0E1630', sk2: '#2C3E66', st: '#33485C', st2: '#273A4C', stl: '#14222E', wall: '#55687A', gr: '#3E6E46', gr2: '#35623E',
    tr: '#7E4A3A', tr2: '#6A3C2E', ln: '#C9D2DC', bd: '#16222E', bdl: '#070C12', cd: '#C9D6E2', pd: '#3C6880', pd2: '#4E7C96',
    mt: '#4E5A6A', cld: '#3E4A72', sh: '#2A5234',
    glow: '1', halo: '.9', su: '0', mo: '1', sr: '1', cso: '.45', crowd: '.6'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--ds9-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--ds9-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const INK = '#1C2B3A';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['st', 'st2', 'wall', 'gr', 'gr2', 'tr', 'bd', 'cd', 'pd', 'pd2', 'mt', 'cld', 'sh']) +
    S + 'o{stroke:var(--ds9-stl);stroke-width:2.5}' + S + 'ob{stroke:var(--ds9-bdl);stroke-width:3}' + S + 'ink{stroke:' + INK + ';stroke-width:2.4}' +
    S + 'tier{stroke:var(--ds9-stl);stroke-width:2;fill:none;opacity:.55}' + S + 'ln{stroke:var(--ds9-ln);stroke-width:3;fill:none}' +
    S + 'tr2{stroke:var(--ds9-tr2);stroke-width:3;fill:none}' +
    S + 'su{fill:#FFE08A;opacity:var(--ds9-su)}' + S + 'sun-ray{stroke:#FFD05A;stroke-width:5;opacity:var(--ds9-su)}' +
    S + 'mo{fill:#FFF4CF;opacity:var(--ds9-mo)}' + S + 'stars{fill:#FFF4CF;opacity:var(--ds9-sr)}' +
    S + 'clouds{opacity:var(--ds9-cso)}' + S + 'glow{opacity:var(--ds9-glow)}' + S + 'halo{opacity:var(--ds9-halo)}' + S + 'crowd{opacity:var(--ds9-crowd)}' +
    S + 'dot{stroke-width:9.5;fill:none}' +
    S + 'n{fill:' + INK + ';font:800 24px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'ns{fill:#FFFFFF;font:800 15px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'nl{fill:var(--ds9-ln);font:800 17px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'nt{fill:' + INK + ';font:800 14px/1 ' + FONT + ';text-anchor:middle}' +
    // what moves: each part turns or slides around its own box
    S + 'flag{transform-box:fill-box;transform-origin:0 50%}' + S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' +
    live + 'cloud-a{animation:' + ID + '-drift 30s ease-in-out infinite alternate}' +
    live + 'cloud-b{animation:' + ID + '-drift 38s ease-in-out -12s infinite alternate-reverse}' +
    live + 'flag{animation:' + ID + '-wave 3.6s ease-in-out infinite alternate}' +
    live + 'flag-b{animation-delay:-1.8s}' +
    live + 'crowd-a{animation:' + ID + '-hop 2.6s ease-in-out infinite alternate}' +
    live + 'crowd-b{animation:' + ID + '-hop 2.6s ease-in-out -1.3s infinite alternate}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'tw{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    live + 'lit{animation:' + ID + '-tw 2.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-12px)}100%{transform:translateX(14px)}}' +
    '@keyframes ' + ID + '-wave{0%{transform:skewY(-7deg) scaleX(1)}100%{transform:skewY(7deg) scaleX(.9)}}' +
    '@keyframes ' + ID + '-hop{0%{transform:translateY(0)}100%{transform:translateY(-2.5px)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@keyframes ' + ID + '-tw{0%{opacity:1}100%{opacity:.4}}' +
    '@media (prefers-reduced-motion:reduce){.art.is-live *{animation:none!important;transition:none!important}}' +
    'html[data-fx="1"] .art.is-live *{animation:none!important}';

  /* ---------- small drawing helpers ---------- */
  const rect = function (x, y, w, h, cls, extra) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>';
  };
  const path = function (d, cls, extra) { return '<path d="' + d + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  const use = function (id, x, y, extra) { return '<use href="#' + id + '" x="' + r1(x) + '" y="' + r1(y) + '"' + (extra ? ' ' + extra : '') + '/>'; };
  const circle = function (x, y, r, extra) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '" ' + extra + '/>'; };
  const text = function (x, y, t, cls) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" ' + c(cls) + '>' + t + '</text>'; };

  /* ---------- reusable shapes (defs) ---------- */
  const defs = '<defs>' +
    '<linearGradient id="ds9-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ds9-sk1)"/><stop offset="1" style="stop-color:var(--ds9-sk2)"/></linearGradient>' +
    '<path id="ds9-cloud" d="M0 0h70c10 0 13-13 3-17 1-11-12-16-19-10-5-11-22-12-26-1-9-4-18 2-16 11-9 1-10 17 0 17z"/>' +
    // a floodlight: a mast and a panel of six lamps
    '<g id="ds9-lamp"><path d="M0 0V-196" stroke="#5C6472" stroke-width="7"/><path d="M-8-150L8-120M8-150L-8-120M-8-90L8-60M8-90L-8-60" stroke="#5C6472" stroke-width="2.4"/>' +
    '<rect x="-32" y="-236" width="64" height="42" rx="6" fill="#3A4656" stroke="#1C2B3A" stroke-width="2.6"/>' +
    '<path d="M-18-224h0M0-224h0M18-224h0M-18-206h0M0-206h0M18-206h0" stroke="#FFF1B8" stroke-width="12"/></g>' +
    // a cone on the grass
    '<g id="ds9-cone"><path d="M-9 0L-3-22h6L9 0z" fill="#F59E2A" stroke="#8A4A06" stroke-width="2"/><path d="M-6-9h12" stroke="#FFFFFF" stroke-width="3.4"/><rect x="-13" y="-1" width="26" height="5" rx="2" fill="#F59E2A" stroke="#8A4A06" stroke-width="2"/></g>' +
    '</defs>';

  /* ---------- sky: the sun or the moon, stars, clouds ---------- */
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    rays += 'M' + r1(180 + Math.cos(a) * 40) + ' ' + r1(58 + Math.sin(a) * 40) + 'L' + r1(180 + Math.cos(a) * 52) + ' ' + r1(58 + Math.sin(a) * 52);
  }
  let stars = '';
  [[48, 30], [250, 44], [320, 18], [404, 52], [470, 22], [552, 60], [628, 26], [690, 70], [774, 40], [120, 84], [590, 96], [352, 86]].forEach(function (p, i) {
    stars += circle(p[0], p[1], i % 3 ? 1.6 : 2.4, '');
  });
  const sky = rect(0, 0, 800, 300, '', 'fill="url(#ds9-sky)"') +
    '<g ' + c('stars') + '><g ' + c('tw') + '>' + stars + '</g></g>' +
    path(rays, 'sun-ray') + circle(180, 58, 29, c('su')) +
    '<path d="M192 36a26 26 0 1 0 8 43 22 22 0 1 1-8-43z" ' + c('mo') + '/>' +
    '<g ' + c('clouds') + '><g ' + c('cloud-a') + '>' + use('ds9-cloud', 540, 64, c('cld')) + '</g>' +
    '<g ' + c('cloud-b') + '>' + use('ds9-cloud', 300, 50, c('cld') + ' transform="translate(300 50) scale(.75) translate(-300 -50)"') + '</g></g>';

  /* ---------- building: the stands and the crowd, flags, floodlights, a wall of panels ---------- */
  const GROUND = 262;
  const bowl = function (x) { const u = (x - 400) / 400; return 18 * u * u; };          // the stands rise a little towards the sides
  const edge = function (y0) { return 'M0 ' + r1(y0 - bowl(0)) + 'Q400 ' + r1(y0 + bowl(0)) + ' 800 ' + r1(y0 - bowl(0)); };
  let tiers = '';
  [150, 170, 190, 210, 230].forEach(function (y) { tiers += edge(y); });
  // the crowd: rows of dots (short round strokes), one path for each colour and each half of the crowd
  const CROWD = ['#F7889B', '#FFD05A', '#FFFFFF', '#8FD3F4', '#F59E2A', '#B8E08A'];
  const dots = CROWD.map(function () { return ['', '']; });
  let seed = 7;
  const rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let row = 0; row < 5; row++) {
    for (let x = 10 + (row % 2) * 8; x < 800; x += 16) {
      const k = Math.floor(rnd() * CROWD.length);
      if (rnd() < 0.12) continue;                                                        // an empty seat now and then
      dots[k][(row + Math.floor(x / 160)) % 2] += 'M' + x + ' ' + r1(141 + row * 20 - bowl(x)) + 'h0';
    }
  }
  let crowd = '';
  dots.forEach(function (d, k) { d.forEach(function (p, j) { crowd += '<g ' + c(j ? 'crowd-b' : 'crowd-a') + '>' + path(p, 'dot', 'stroke="' + CROWD[k] + '"') + '</g>'; }); });
  const FLAGC = ['#E5404A', '#FFD05A', '#3FB98A', '#F59E2A'];
  let flags = '';
  [60, 170, 280, 400, 520, 630, 740].forEach(function (x, i) {
    const y = 124 - bowl(x);
    flags += path('M' + x + ' ' + r1(y) + 'v-40', '', 'stroke="#5C6472" stroke-width="3"') +
      '<g ' + c('flag' + (i % 2 ? ' flag-b' : '')) + '>' + path('M' + (x + 1) + ' ' + r1(y - 40) + 'l26 8l-26 8z', '', 'fill="' + FLAGC[i % 4] + '" stroke="' + INK + '" stroke-width="1.8"') + '</g>';
  });
  const PANEL = ['#5B8CA8', '#FFD05A', '#F4F7FA', '#E5404A', '#F4F7FA', '#3FB98A'];
  let panels = '';
  for (let i = 0; i < 10; i++) panels += rect(i * 80 + 4, 246, 72, 12, '', 'rx="3" fill="' + PANEL[i % 6] + '" opacity=".9"');
  const stands = path('M0 ' + r1(124 - bowl(0)) + 'Q400 ' + r1(124 + bowl(0)) + ' 800 ' + r1(124 - bowl(0)) + 'V250H0z', 'st o') + path(tiers, 'tier') +
    '<g ' + c('crowd') + '>' + crowd + '</g>' + rect(0, 240, 800, 24, 'wall o') + panels;
  const beams = path('M36 60L170 500H560L96 44z', '', 'fill="#FFF1B8" opacity=".13"') + path('M764 60L630 500H240L704 44z', '', 'fill="#FFF1B8" opacity=".13"') +
    circle(66, 47, 40, 'fill="#FFF1B8" opacity=".22"') + circle(734, 47, 40, 'fill="#FFF1B8" opacity=".22"');
  const lamps = use('ds9-lamp', 66, 262) + use('ds9-lamp', 734, 262);

  /* ---------- floor: the grass with mown stripes, and a running track with three lanes ---------- */
  let mown = '';
  for (let i = 0; i < 6; i++) mown += path('M' + (i * 160 - 40) + ' ' + GROUND + 'h80L' + r1(400 + (i * 160 + 40 - 400) * 1.5) + ' 500H' + r1(400 + (i * 160 - 40 - 400) * 1.5) + 'z', 'gr2');
  const TY = 392, LANE = 26;
  let lanes = '';
  for (let i = 0; i <= 3; i++) lanes += 'M0 ' + (TY + i * LANE) + 'H800';
  const floor = rect(0, GROUND, 800, 500 - GROUND, 'gr') + mown + path('M0 ' + GROUND + 'H800', '', 'stroke="var(--ds9-stl)" stroke-width="3"') +
    rect(0, TY, 800, 3 * LANE, 'tr') + path(lanes, 'ln') + path('M212 ' + TY + 'v' + 3 * LANE, 'ln') +
    text(190, TY + 19, '1', 'nl') + text(190, TY + LANE + 19, '2', 'nl') + text(190, TY + 2 * LANE + 19, '3', 'nl');

  /* ---------- things ---------- */
  const shadow = function (x, y, rx) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="5" ' + c('sh') + '/>'; };
  // the winners' podium: 2, 1, 3, with a cup on the top step
  const podium = '<g transform="translate(52 0)">' + shadow(180, 352, 62) +
    rect(132, 322, 32, 30, 'pd2 ink') + rect(164, 306, 32, 46, 'pd ink') + rect(196, 332, 32, 20, 'pd2 ink') +
    text(148, 344, '2', 'ns') + text(180, 336, '1', 'ns') + text(212, 348, '3', 'ns') +
    path('M171 284h18v6a9 9 0 0 1-18 0zM180 299v5M173 306h14', '', 'fill="#FFD05A" stroke="#8A5A06" stroke-width="2.2"') +
    path('M171 287q-6 0-5 5q1 4 6 4M189 287q6 0 5 5q-1 4-6 4', '', 'stroke="#8A5A06" stroke-width="2"') + '</g>';

  // Zip the coach, in front of the scoreboard: a cap, a striped top, a whistle and a stopwatch
  const zip = shadow(329, 372, 32) + '<g ' + c('zip') + '><g transform="translate(296 304) scale(.55)">' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#FFFFFF" stroke="#1C2B3A" stroke-width="3"/><path d="M47 96v23M60 95v25M73 96v23" stroke="#1C2B3A" stroke-width="6" stroke-linecap="butt"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/>' +
    // the stopwatch (left hand) and the whistle (right hand)
    '<path d="M-4 46v-7M-9 38h10" stroke="#1C2B3A" stroke-width="3.5"/><circle cx="-4" cy="60" r="14" fill="#FFFFFF" stroke="#1C2B3A" stroke-width="3"/><path d="M-4 60v-9M-4 60l6 4" stroke="#E5404A" stroke-width="3"/>' +
    '<path d="M112 58h20a10 10 0 1 1-10 10v-4h-10z" fill="#C9D2DC" stroke="#1C2B3A" stroke-width="3"/><circle cx="132" cy="68" r="3" fill="#1C2B3A"/>' +
    '<path d="M148 52l8-6M151 66h10M148 80l8 6" stroke="#F59E2A" stroke-width="3.5"/>' +
    '<circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the cap with its peak, and Zip's yellow knob on top
    '<path d="M94 22q24-2 32 10q-18 4-36-2z" fill="#3C6880" stroke="#1C2B3A" stroke-width="3"/>' +
    '<path d="M17 30q0-28 43-28q43 0 43 28q-43-9-86 0z" fill="#5B8CA8" stroke="#1C2B3A" stroke-width="3"/><path d="M60 3v20" stroke="#1C2B3A" stroke-width="2.4"/>' +
    '<line x1="60" y1="2" x2="60" y2="-6" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="-9" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/></g></g>';

  // the heart: the scoreboard. Five cards in order; the two 5s share a colour (the mode); the middle card is lit (the median)
  const SCORES = [3, 5, 5, 7, 10], CW = 34, CG = 4, BX = 304, BY = 250, BW = SCORES.length * CW + (SCORES.length + 1) * CG + 12, MID = (SCORES.length - 1) / 2;
  let cards = '';
  SCORES.forEach(function (v, i) {
    const x = BX + 8 + CG + i * (CW + CG), same = SCORES.filter(function (w) { return w === v; }).length > 1;
    if (i === MID) {
      cards += '<g ' + c('halo') + '><g ' + c('lit') + '>' + rect(x - 5, BY + 9, CW + 10, 48, '', 'rx="9" fill="#FFE27A" opacity=".75"') + '</g></g>' +
        path('M' + (x + CW / 2 - 7) + ' ' + (BY + 3) + 'h14l-7 8z', '', 'fill="#FFE27A" stroke="#8A5A06" stroke-width="1.6"');
    }
    cards += rect(x, BY + 14, CW, 38, same ? '' : 'cd', 'rx="5" ' + (same ? 'fill="' + (i === MID ? '#FFD84A' : '#F2B43A') + '" ' : '') + 'stroke="' + (i === MID ? '#FFFFFF' : INK) + '" stroke-width="' + (i === MID ? 3 : 2) + '"') +
      text(x + CW / 2, BY + 42, v, 'n');
  });
  const board = shadow(BX + BW / 2, 350, 96) + rect(BX + BW / 2 - 6, BY + 54, 12, 46, 'mt ink') + rect(BX + BW / 2 - 28, 346, 56, 8, 'mt ink', 'rx="3"') +
    '<g data-heart="scores">' + rect(BX, BY, BW, 60, 'bd ob', 'rx="8"') + cards + '</g>';

  // five towers of blocks made level: 3, 5, 5, 7 and 10 blocks shared out equally are 6 in each tower
  const TX = 552, TBASE = 350, TW = 17, TH = 10, MEAN = SCORES.reduce(function (a, b) { return a + b; }, 0) / SCORES.length;
  let towers = '', ghosts = '';
  SCORES.forEach(function (v, i) {
    const x = TX + i * (TW + 4);
    for (let j = 0; j < Math.max(v, MEAN); j++) {
      const y = TBASE - (j + 1) * TH;
      if (j < MEAN) towers += rect(x, y, TW, TH, '', 'rx="2" fill="' + (j < v ? '#7FB8DC' : '#FFD05A') + '" stroke="' + INK + '" stroke-width="1.6"');
      else ghosts += rect(x, y, TW, TH, '', 'rx="2" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="3 3" opacity=".7"');
    }
  });
  const LV = TBASE - MEAN * TH;
  const mean = shadow(TX + 51, 352, 62) + rect(TX - 6, TBASE, 5 * (TW + 4) + 8, 6, 'mt ink', 'rx="2"') + ghosts + towers +
    path('M' + (TX - 8) + ' ' + LV + 'H' + (TX + 112), '', 'stroke="#E5404A" stroke-width="2.6" stroke-dasharray="7 5"') +
    path('M' + (TX + 78) + ' ' + (LV - 34) + 'Q' + (TX + 40) + ' ' + (LV - 62) + ' ' + (TX + 10) + ' ' + (LV - 12), '', 'stroke="#E5404A" stroke-width="2.6"') +
    path('M' + (TX + 8) + ' ' + (LV - 23) + 'l2 12l11-5', '', 'stroke="#E5404A" stroke-width="2.6"') +
    rect(TX - 30, LV - 11, 22, 22, '', 'rx="6" fill="#FFFFFF" stroke="#E5404A" stroke-width="2.4"') + text(TX - 19, LV + 5, MEAN, 'nt');

  // on the grass and the track: cones and a ball
  const extras = use('ds9-cone', 150, 384) + use('ds9-cone', 222, 384) + use('ds9-cone', 444, 384) + use('ds9-cone', 516, 384) +
    shadow(96, 372, 22) + circle(96, 354, 17, 'fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.4"') +
    path('M96 346l8 6-3 9h-10l-3-9z', '', 'fill="' + INK + '"') + path('M96 346v-9M104 352l8-3M101 361l5 8M91 361l-5 8M88 352l-8-3', '', 'stroke="' + INK + '" stroke-width="2"');

  // two hurdles on the track
  const hurdle = function (x, y) {
    return path('M' + x + ' ' + y + 'v-30M' + (x + 52) + ' ' + y + 'v-30M' + (x - 6) + ' ' + y + 'h12M' + (x + 46) + ' ' + y + 'h12', '', 'stroke="' + INK + '" stroke-width="4"') +
      rect(x - 4, y - 36, 60, 10, '', 'rx="3" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.2"') +
      path('M' + (x + 8) + ' ' + (y - 31) + 'h10M' + (x + 30) + ' ' + (y - 31) + 'h10', '', 'stroke="#E5404A" stroke-width="7" style="stroke-linecap:butt"');
  };
  const hurdles = hurdle(430, 440) + hurdle(610, 440);

  const things = podium + board + mean + extras + hurdles + zip;

  const label = 'The Data Stadium: stands full of people, flags and floodlights around a pitch with a running track. A big scoreboard shows ' +
    'five score cards in order: 3, 5, 5, 7, 10. The two 5s have the same colour and the middle card is lit. Beside it, five towers of blocks ' +
    'are made level: 6 blocks in each. There is a winners’ podium with a cup. Zip the coach has a cap, a whistle and a stopwatch.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="150,150,500,210" data-band="240,328" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + flags + stands + '</g>' +
    '<g data-layer="floor">' + floor + lamps + '<g ' + c('glow') + '>' + beams + '</g></g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = window.T_ART || {};
  Object.assign(window.T_ART, { [ID]: svg });
})();

