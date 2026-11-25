/* 05-g5-art-world-4.js - the Factor Forest, the world scene of Stop 4 (window.T_ART['world-factor-forest']).

   The hub header of Stop 4 (35-hub.js buildScene), drawn with the recipe of every world scene (brief/ENGINE-API.md, 6):
     viewBox 0 0 800 500, preserveAspectRatio xMidYMid slice, data-view, data-safe (x, y, w, h: what must show at every
     size) and data-band (top, bottom: the heart, clear of the floating buttons and the sheet). The heart's main part,
     the big shared stone "12" where the two paths meet, carries data-heart.
     Layers, back to front: sky (sun or moon, stars, clouds), building (far hills, a row of pines and round trees, a tall
     tree on the left and an apple tree on the right with 12 apples in 3 equal rows of 4), floor (the grass clearing and
     a stream that widens into a pool), things: two paths of stepping stones across the pool that start on one stone:
     the sand stones count in threes (3, 6, 9, 12), the blue stones count in fours (4, 8, 12); they are set out like a
     number line and meet on the big golden stone 12, which glows (a common multiple of 3 and 4). Behind the pool a
     signpost holds two overlapping rings: 3, 6, 9 in one, 4, 8 in the other and 12 where they overlap. Zip, the forest
     ranger with a hat, waits on the bank by the 12. Mushrooms, ferns, flowers and reeds around.
     Maths meaning: multiples (each path), a common multiple (the shared stone and the overlap of the rings),
     equal rows (the apples: 3 rows of 4 = 12, so 3 and 4 are factors of 12).
     Palette: CSS variables on .art (--ff-*), redefined by the class world-factor-forest-night (the dark theme):
       a dark sky with stars and the moon, fireflies glow, the stone 12 shines brighter.
     Motion: only under .art.is-live (35-hub.js adds it when motion is allowed), transform and opacity only, slow loops:
       the clouds drift, the halo of the 12 breathes, the fireflies and the stars twinkle, the ripples fade, Zip bobs.
       Still under reduced motion and on the lowest effects tier (html[data-fx="1"]).
   Class names start with the id, so many copies on one page never clash; ids are renamed per copy by T.ui.art. */
(function () {
  'use strict';

  const ID = 'world-factor-forest';
  const c = function (name) { return 'class="' + ID + '-' + name.split(' ').join(' ' + ID + '-') + '"'; };
  const r1 = function (v) { return Math.round(v * 10) / 10; };

  /* ---------- palette: day, then night ---------- */
  const DAY = {
    sk1: '#BFE6F2', sk2: '#EAF8E0', hl: '#A9D9A0', p1: '#5DB26A', p2: '#43A852', p3: '#2D7C3A', tc: '#58B865', tc2: '#7CCB7F',
    gr: '#9FD88A', gr2: '#B9E4A2', gr3: '#7FC272', wt: '#8FD3EC', wt2: '#C4ECF8', wtl: '#4E9DBF', tk: '#A9764A', tk2: '#8A5A34',
    bl: '#1F5A2C', bk: '#5E3A1C', sa: '#F6E7BE', sb: '#DCE9F7', sd: '#8C9AA6', sg: '#FFD95C', cld: '#FFFFFF', bd: '#FFF8E6',
    glow: '0', halo: '.55', su: '1', mo: '0', sr: '0', cso: '.9'
  };
  const NIGHT = {
    sk1: '#0C1B33', sk2: '#1F3F4A', hl: '#22503E', p1: '#1E5A38', p2: '#17482E', p3: '#0F3320', tc: '#1F6038', tc2: '#2A7446',
    gr: '#2A5E3C', gr2: '#346D46', gr3: '#1F4A30', wt: '#215B7C', wt2: '#3C84A6', wtl: '#12384E', tk: '#6A4A30', tk2: '#4E3420',
    bl: '#0A2413', bk: '#2A190B', sa: '#B9AD8C', sb: '#9AAABD', sd: '#4A5560', sg: '#FFE27A', cld: '#3A5670', bd: '#D8D0BC',
    glow: '1', halo: '.95', su: '0', mo: '1', sr: '1', cso: '.45'
  };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--ff-' + k + ':' + p[k]; }).join(';'); };
  const fill = function (names) { return names.map(function (n) { return '.' + ID + '-' + n + '{fill:var(--ff-' + n + ')}'; }).join(''); };

  const S = '.' + ID + '-';
  const live = '.art.is-live ' + S;
  const FONT = 'var(--font-display,Arial,Helvetica,sans-serif)';
  const css =
    '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    fill(['hl', 'p1', 'p2', 'p3', 'tc', 'tc2', 'gr', 'gr2', 'gr3', 'wt', 'wt2', 'tk', 'tk2', 'sa', 'sb', 'sd', 'sg', 'cld', 'bd']) +
    S + 'o{stroke:var(--ff-bl);stroke-width:2.5}' + S + 'ob{stroke:var(--ff-bk);stroke-width:2.5}' +
    S + 'oc{stroke:var(--ff-bl);stroke-width:5}' + S + 'os{stroke:#3D4A57;stroke-width:2.2}' + S + 'ow{stroke:var(--ff-wtl);stroke-width:2.5}' +
    S + 'rip{stroke:var(--ff-wt2);stroke-width:2.2;fill:none}' + S + 'blade{stroke:var(--ff-gr3);stroke-width:2.6;fill:none}' +
    S + 'su{fill:#FFE08A;opacity:var(--ff-su)}' + S + 'sun-ray{stroke:#FFD05A;stroke-width:5;opacity:var(--ff-su)}' +
    S + 'mo{fill:#FFF4CF;opacity:var(--ff-mo)}' + S + 'stars{fill:#FFF4CF;opacity:var(--ff-sr)}' +
    S + 'clouds{opacity:var(--ff-cso)}' + S + 'glow{opacity:var(--ff-glow)}' + S + 'halo{fill:#FFE98A;opacity:var(--ff-halo)}' +
    S + 'n{fill:#1F3B2A;font:800 18px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'nx{fill:#5A3A00;font:800 24px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'nv{fill:#1F3B2A;font:800 13px/1 ' + FONT + ';text-anchor:middle}' +
    S + 'hopa{stroke:#E07B1F;stroke-width:2.6;stroke-dasharray:1 7;fill:none}' + S + 'hopb{stroke:#2F6FD0;stroke-width:2.6;stroke-dasharray:1 7;fill:none}' +
    // what moves: each part turns or slides around its own box
    S + 'zip{transform-box:fill-box;transform-origin:50% 100%}' + S + 'halo{transform-box:fill-box;transform-origin:50% 50%}' +
    live + 'cloud-a{animation:' + ID + '-drift 32s ease-in-out infinite alternate}' +
    live + 'cloud-b{animation:' + ID + '-drift 40s ease-in-out -12s infinite alternate-reverse}' +
    live + 'halo{animation:' + ID + '-breathe 3.6s ease-in-out infinite alternate}' +
    live + 'fly{animation:' + ID + '-tw 2.8s ease-in-out infinite alternate}' + live + 'fly-b{animation-delay:-1.4s}' +
    live + 'rip{animation:' + ID + '-tw 4.2s ease-in-out infinite alternate}' +
    live + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    live + 'stars{animation:' + ID + '-tw 3.4s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-12px)}100%{transform:translateX(14px)}}' +
    '@keyframes ' + ID + '-breathe{0%{transform:scale(.92)}100%{transform:scale(1.1)}}' +
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
  const ell = function (x, y, rx, ry, cls, extra) { return '<ellipse cx="' + r1(x) + '" cy="' + r1(y) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '"' + (cls ? ' ' + c(cls) : '') + (extra ? ' ' + extra : '') + '/>'; };
  // a leafy crown: the circles are drawn once with an outline and once without, so only the outer edge is outlined
  const crown = function (list, cls) {
    let a = '', b = '';
    list.forEach(function (p) { a += circ(p[0], p[1], p[2], cls + ' oc'); b += circ(p[0], p[1], p[2], cls); });
    return a + b;
  };

  /* ---------- reusable shapes (defs) ---------- */
  const defs = '<defs>' +
    '<linearGradient id="ff-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ff-sk1)"/><stop offset=".5" style="stop-color:var(--ff-sk2)"/></linearGradient>' +
    '<path id="ff-cloud" d="M0 0h70c10 0 13-13 3-17 1-11-12-16-19-10-5-11-22-12-26-1-9-4-18 2-16 11-9 1-10 17 0 17z"/>' +
    // a pine: three tiers on a short trunk; its foot is at 0,0
    '<g id="ff-pine"><rect x="-4" y="-14" width="8" height="16" class="' + ID + '-tk2"/><path d="M0-112L22-70H10L28-38H14L34-10H-34L-14-38H-28L-10-70H-22Z"/></g>' +
    // a mushroom: a red cap with white dots; its foot is at 0,0
    '<g id="ff-mush"><path d="M-5 0c1-7 1-12-1-16h12c-2 4-2 9-1 16z" fill="#FFF3DC" stroke="#8A5A34" stroke-width="2"/>' +
    '<path d="M-17-15c0-12 8-19 17-19s17 7 17 19c-10 4-24 4-34 0z" fill="#E5484D" stroke="#8E1F2A" stroke-width="2.2"/>' +
    '<circle cx="-7" cy="-22" r="3" fill="#FFFFFF"/><circle cx="4" cy="-27" r="2.6" fill="#FFFFFF"/><circle cx="9" cy="-19" r="2.4" fill="#FFFFFF"/></g>' +
    // an apple and a flower
    '<g id="ff-ap"><circle r="8" fill="#E5484D" stroke="#8E1F2A" stroke-width="2"/><path d="M0-8q1-5 5-6" stroke="#5E3A1C" stroke-width="2"/><circle cx="-3" cy="-3" r="2" fill="#FFB3B3"/></g>' +
    '<g id="ff-fl"><path d="M0 0v-12" stroke="#2D7C3A" stroke-width="2.2"/><circle cx="0" cy="-15" r="5" fill="#FFFFFF" stroke="#C9A227" stroke-width="1.6"/><circle cx="0" cy="-15" r="2" fill="#F5B830"/></g>' +
    '</defs>';

  /* ---------- sky: the sun or the moon, stars, clouds ---------- */
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    rays += 'M' + r1(278 + Math.cos(a) * 40) + ' ' + r1(56 + Math.sin(a) * 40) + 'L' + r1(278 + Math.cos(a) * 53) + ' ' + r1(56 + Math.sin(a) * 53);
  }
  let stars = '';
  [[150, 28], [262, 96], [310, 30], [388, 62], [452, 24], [520, 70], [586, 34], [330, 116], [480, 112], [556, 128], [132, 100], [420, 100]].forEach(function (p, i) {
    stars += circ(p[0], p[1], i % 3 ? 1.6 : 2.4);
  });
  const sky = rect(0, 0, 800, 500, '', 'fill="url(#ff-sky)"') +
    '<g ' + c('stars') + '>' + stars + '</g>' +
    path(rays, 'sun-ray') + circ(278, 56, 29, 'su') +
    '<path d="M290 34a26 26 0 1 0 8 43 22 22 0 1 1-8-43z" ' + c('mo') + '/>' +
    '<g ' + c('clouds') + '><g ' + c('cloud-a') + '>' + use('ff-cloud', 400, 78, c('cld')) + '</g>' +
    '<g ' + c('cloud-b') + '>' + use('ff-cloud', 560, 40, c('cld') + ' transform="translate(560 40) scale(.7) translate(-560 -40)"') + '</g></g>';

  /* ---------- far: hills, a row of pines and round trees, a tall tree (left) and the apple tree (right) ---------- */
  const H = 206;                       // where the grass begins
  let pines = '';
  [[112, 1.05, 'p1'], [158, .8, 'p2'], [236, 1.2, 'p2'], [286, .9, 'p1'], [506, .95, 'p1'], [548, 1.25, 'p2'], [602, .85, 'p1'], [742, 1.15, 'p2'], [786, .9, 'p1']].forEach(function (p) {
    pines += '<g transform="translate(' + p[0] + ' ' + (H + 6) + ') scale(' + p[1] + ')">' + use('ff-pine', 0, 0, c(p[2] + ' o')) + '</g>';
  });
  const round = function (x, y, r) {   // a small round tree behind the clearing
    return rect(x - 5, y, 10, H + 6 - y, 'tk2') + crown([[x, y - r * .5, r], [x - r * .8, y, r * .7], [x + r * .8, y, r * .7]], 'tc2');
  };
  const far = path('M0 176Q130 120 270 168T540 150T800 160V230H0Z', 'hl') + round(200, 150, 30) + round(452, 142, 26) + round(330, 166, 22) + pines;
  // the tall tree on the left: a trunk with roots, a branch and a wide crown
  const tall = path('M30 0C36 150 34 300 18 410h76C74 300 78 150 84 0Z', 'tk ob') +
    path('M46 70q6 60 0 120M64 200q4 70-2 150', '', 'stroke="var(--ff-tk2)" stroke-width="3"') +
    path('M80 150q34-10 52-40', '', 'stroke="var(--ff-bk)" stroke-width="13"') + path('M80 150q34-10 52-40', '', 'stroke="var(--ff-tk)" stroke-width="8"') +
    crown([[20, 20, 62], [96, 10, 54], [150, 60, 40], [-10, 88, 44], [70, 60, 40]], 'p2') + crown([[136, 104, 22]], 'tc');
  // the apple tree on the right: 12 apples in 3 equal rows of 4
  let apples = '';
  for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) apples += use('ff-ap', 600 + i * 25, 102 + row * 27);
  const appleTree = path('M628 180C632 240 630 280 616 306h60C662 280 660 240 664 180Z', 'tk ob') +
    path('M646 214q4 40-2 76', '', 'stroke="var(--ff-tk2)" stroke-width="3"') +
    crown([[638, 126, 70], [578, 152, 38], [702, 156, 44], [592, 86, 40], [686, 78, 44], [638, 178, 38]], 'tc') + apples;

  /* ---------- floor: the grass clearing and the stream that widens into a pool ---------- */
  const POOL = 'M562 208C558 224 548 230 520 232C440 222 290 224 222 242C182 254 162 288 136 330C108 380 60 430 0 452V500H170' +
    'C190 450 230 392 290 370C350 350 430 366 474 350C506 338 500 296 512 264C522 242 578 232 584 208Z';
  let tufts = '';
  [[120, 250], [96, 300], [640, 262], [610, 380], [330, 410], [420, 452], [530, 420], [690, 446], [250, 470], [760, 300], [150, 440]].forEach(function (p) {
    tufts += 'M' + p[0] + ' ' + p[1] + 'q-5-10-9-13M' + p[0] + ' ' + p[1] + 'v-16M' + p[0] + ' ' + p[1] + 'q5-10 9-13';
  });
  const floor = path('M0 ' + H + 'Q200 ' + (H - 10) + ' 400 ' + H + 'T800 ' + (H - 2) + 'V500H0Z', 'gr') +
    path('M0 ' + H + 'Q200 ' + (H - 10) + ' 400 ' + H + 'T800 ' + (H - 2), '', 'stroke="var(--ff-gr3)" stroke-width="3"') +
    ell(670, 350, 120, 34, 'gr2') + ell(120, 268, 70, 20, 'gr2') + ell(430, 440, 190, 40, 'gr2') +
    path(POOL, 'wt ow') +
    path('M560 222q8 4 16 0M236 258q14-6 28 0M160 344q14-6 28 0M90 420q14-6 28 0M120 462q14-6 28 0M470 250q14-6 28 0M214 400q14-6 28 0', 'rip') +
    path(tufts, 'blade');

  /* ---------- things ---------- */
  // the two paths of stepping stones, set out like a number line: x = X0 + 20 for each 1
  const X0 = 200, STEP = 20;
  const A = [[0, 290], [3, 262], [6, 251], [9, 258], [12, 292]];       // counting in threes
  const B = [[0, 290], [4, 324], [8, 330], [12, 292]];                 // counting in fours
  const sx = function (n) { return X0 + n * STEP; };
  const stone = function (n, y, cls) {
    const x = sx(n);
    return ell(x, y + 6, 31, 17, 'rip') + ell(x, y + 5, 24, 13, 'sd os') + ell(x, y, 24, 13, cls + ' os') + (n ? text(x, y + 6, n, 'n') : '');
  };
  const hops = function (list, cls, lift) {
    let d = '';
    for (let i = 0; i < list.length - 1; i++) {
      const x0 = sx(list[i][0]), y0 = list[i][1] - 15, x1 = sx(list[i + 1][0]), y1 = list[i + 1][1] - (i === list.length - 2 ? 24 : 15);
      d += 'M' + r1(x0 + 6) + ' ' + y0 + 'Q' + r1((x0 + x1) / 2) + ' ' + r1(Math.min(y0, y1) - lift) + ' ' + r1(x1 - 6) + ' ' + y1;
    }
    return path(d, cls);
  };
  let stones = stone(0, 290, 'bd');
  A.slice(1, 4).forEach(function (p) { stones += stone(p[0], p[1], 'sa'); });
  B.slice(1, 3).forEach(function (p) { stones += stone(p[0], p[1], 'sb'); });
  // the heart: the big shared stone 12, golden and glowing
  const HX = sx(12), HY = 292;
  const heart = ell(HX, HY + 2, 52, 32, 'halo') + '<g data-heart="twelve">' +
    ell(HX, HY + 7, 37, 21, '', 'fill="#C9962A" stroke="#7A5200" stroke-width="2.4"') + ell(HX, HY, 37, 21, 'sg', 'stroke="#7A5200" stroke-width="2.4"') +
    ell(HX, HY, 29, 15, '', 'stroke="#FFFFFF" stroke-width="2" opacity=".7"') + text(HX, HY + 9, '12', 'nx');
  const paths = stones + hops(A, 'hopa', 16) + hops(B, 'hopb', 4) + heart;

  // the signpost behind the pool: two overlapping rings, 3 6 9 | 12 | 4 8
  const VX = 372, VY = 156;
  const sign = rect(VX - 5, VY + 38, 10, 38, 'tk2 ob') +
    rect(VX - 74, VY - 44, 148, 86, 'tk ob', 'rx="8"') + rect(VX - 67, VY - 37, 134, 72, 'bd', 'rx="5"') +
    circ(VX - 21, VY - 1, 32, '', 'fill="#F7B53C" opacity=".35"') + circ(VX + 21, VY - 1, 32, '', 'fill="#5AB4EE" opacity=".35"') +
    circ(VX - 21, VY - 1, 32, '', 'stroke="#E07B1F" stroke-width="2.6"') + circ(VX + 21, VY - 1, 32, '', 'stroke="#2F6FD0" stroke-width="2.6"') +
    text(VX - 32, VY - 12, '3', 'nv') + text(VX - 40, VY + 5, '6', 'nv') + text(VX - 30, VY + 21, '9', 'nv') +
    text(VX, VY + 4, '12', 'nv') + text(VX + 35, VY - 6, '4', 'nv') + text(VX + 35, VY + 14, '8', 'nv');

  // Zip the forest ranger, on the bank by the stone 12 (a ranger hat with a band; the antenna pokes through)
  const zip = '<g ' + c('zip') + '><g transform="translate(493 275) scale(.51)">' +
    '<rect x="9" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/><rect x="99" y="46" width="12" height="22" rx="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/><circle cx="60" cy="107" r="6" fill="#E5404A"/>' +
    '<path d="M36 100Q13 103 6 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q107 103 114 75" fill="none" stroke="#1E5D9F" stroke-width="7" stroke-linecap="round"/><circle cx="114" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="48" cy="49" r="2" fill="#FFFFFF"/><circle cx="76" cy="49" r="2" fill="#FFFFFF"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" fill="none" stroke="#0E2B58" stroke-width="3" stroke-linecap="round"/>' +
    // the ranger hat
    '<line x1="60" y1="2" x2="60" y2="-9" stroke="#0E2B58" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="-11" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<path d="M32 26C34 6 44-2 60-2s26 8 28 28z" fill="#B98A4E" stroke="#5E3A1C" stroke-width="3"/>' +
    '<ellipse cx="60" cy="27" rx="56" ry="8" fill="#C99A5B" stroke="#5E3A1C" stroke-width="3"/>' +
    '<path d="M33 19q27 7 54 0" stroke="#2D7C3A" stroke-width="6" fill="none"/><path d="M60 14l3 5-3 5-3-5z" fill="#FFD95C" stroke="#7A5200" stroke-width="1.4"/></g></g></g>';

  // small things: mushrooms, flowers, reeds, a fern log; fireflies for the night
  const mush = function (x, y, k) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' + use('ff-mush', 0, 0) + '</g>'; };
  const reeds = function (x, y) {
    return path('M' + x + ' ' + y + 'q-2-22 2-40M' + (x + 9) + ' ' + y + 'q2-18-1-30M' + (x - 8) + ' ' + y + 'q-3-14 0-24', '', 'stroke="var(--ff-p3)" stroke-width="3"') +
      rect(x - 1, y - 52, 6, 15, '', 'rx="3" fill="#8A5A34" stroke="#5E3A1C" stroke-width="1.6"') + rect(x + 5, y - 41, 6, 13, '', 'rx="3" fill="#8A5A34" stroke="#5E3A1C" stroke-width="1.6"');
  };
  const log = path('M560 410h110a14 14 0 0 1 0 28H560a14 14 0 0 1 0-28z', 'tk ob') + ell(560, 424, 9, 14, 'bd ob') + ell(560, 424, 4, 7, '', 'stroke="var(--ff-tk2)" stroke-width="2"') +
    path('M590 418h40M600 430h50', '', 'stroke="var(--ff-tk2)" stroke-width="2.4"');
  let flies = '';
  [[176, 226], [300, 196], [452, 206], [690, 250], [560, 366], [246, 380], [700, 330], [392, 394], [110, 330], [596, 190]].forEach(function (p, i) {
    flies += '<g ' + c('fly' + (i % 2 ? ' fly-b' : '')) + '>' + circ(p[0], p[1], 9, '', 'fill="#FFF08A" opacity=".35"') + circ(p[0], p[1], 3, '', 'fill="#FFF8C4"') + '</g>';
  });
  const small = mush(600, 350, 1) + mush(624, 356, .7) + mush(580, 356, .6) + mush(118, 300, .9) + mush(96, 306, .6) + mush(338, 440, 1.2) + mush(370, 446, .8) + mush(736, 452, 1.1) +
    use('ff-fl', 684, 372) + use('ff-fl', 706, 384) + use('ff-fl', 208, 440) + use('ff-fl', 470, 420) + use('ff-fl', 492, 430) + use('ff-fl', 136, 262) + use('ff-fl', 770, 352) +
    reeds(190, 262) + reeds(486, 388) + reeds(70, 452) + log + mush(662, 412, .6);

  const things = tall + appleTree + sign + paths + zip + small + '<g ' + c('glow') + '>' + flies + '</g>';

  const label = 'The Factor Forest: a clearing among tall trees, with a stream that widens into a pool. Two paths of stepping stones ' +
    'start on one stone: one counts in threes, 3, 6, 9, 12, and the other counts in fours, 4, 8, 12. They meet on a big golden stone, 12, ' +
    'which glows. A signpost holds two overlapping rings: 3, 6, 9 in one, 4, 8 in the other and 12 in both. An apple tree has 12 apples ' +
    'in 3 rows of 4. Zip, in a ranger hat, waits by the stone 12.';

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="165,150,520,220" data-band="234,346" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' + defs +
    '<g data-layer="sky">' + sky + '</g>' +
    '<g data-layer="building">' + far + '</g>' +
    '<g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + things + '</g>' +
    '</svg>';

  window.T_ART = Object.assign(window.T_ART || {}, { [ID]: svg });
})();

