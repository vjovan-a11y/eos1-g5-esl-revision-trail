/* 13-art-summit.js - the pictures of the Summit (Session 14), in the flat style of the world badges and scenes.

   badge-summit      the round map badge of the Summit (viewBox 200, data-shape circle): a mountain top, a gold flag
   world-summit      the Summit's hub scene (viewBox 800 x 500, the recipe of docs/02 "World scenes"): mountain tops over
                     a sea of clouds, the trail coming up to the top, nine stones in the colours of the nine stops, and the
                     heart (data-heart): the cairn with the gold flag. Night: .world-summit-night (stars, the moon).
   trophy-summit     the Summit Trophy (viewBox 96, round): a gold cup with a star
   icon-summit-test  the final test (viewBox 96): two papers with marks
   icon-summit-cert  the certificate (viewBox 96): a scroll with a gold seal
   Class names start with the id; motion only under .art.is-live (transform and opacity), still under reduced motion. */
(function () {
  'use strict';

  const INK = '#2A2F3A';
  const o = 'stroke="' + INK + '" stroke-width="3"';
  window.T_ART = window.T_ART || {};
  const ART = window.T_ART;

  function icon(id, label, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" class="art" data-art="' + id +
      '" role="img" aria-label="' + label + '" fill="none" stroke-linejoin="round" stroke-linecap="round">' + body + '</svg>';
  }

  // the stop colours (00-tokens.css --world-1 ... --world-9): the nine stones of the trail
  const STOPS = ['#2F7FD4', '#E07A2E', '#2BA3A0', '#E2A019', '#7A5BD6', '#1E8FB8', '#3FA34D', '#D9534F', '#C050A8'];
  const flag = function (x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M0 0V-62" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M2-62h38l-9 11 9 11H2z" fill="#F5A623" stroke="#A9690E" stroke-width="3"/>' +
      '<path d="M17-56l2.2 4.4 4.8.6-3.5 3.3.9 4.8-4.4-2.4-4.4 2.4.9-4.8-3.5-3.3 4.8-.6z" fill="#FFFFFF"/></g>';
  };

  /* ---------- the map badge ---------- */
  ART['badge-summit'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="art" data-art="badge-summit" data-shape="circle" role="img" ' +
    'aria-label="The Summit: a mountain top with a gold flag." fill="none" stroke-linejoin="round" stroke-linecap="round">' +
    '<circle cx="100" cy="100" r="100" fill="#DCE9FB"/><circle cx="100" cy="100" r="92" stroke="#3B4FA8" stroke-width="4" opacity=".35"/>' +
    '<circle cx="150" cy="58" r="14" fill="#FFE08A"/>' +
    '<path d="M18 150L64 92l22 22 28-50 66 86z" fill="#8FA3C7" ' + o + '/>' +
    '<path d="M114 64l-16 29 10-5 7 9 9-10 9 6z" fill="#FFFFFF" ' + o + '/>' +
    '<path d="M64 92l-12 15 8-2 6 6 8-7z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.4"/>' +
    '<path d="M18 150h162c-6 12-30 22-80 22S24 162 18 150z" fill="#9FD69B" ' + o + '/>' +
    STOPS.map(function (col, k) { return '<circle cx="' + (40 + k * 15) + '" cy="' + (162 - Math.abs(k - 4) * 1.5) + '" r="4.6" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6"/>'; }).join('') +
    flag(114, 66, 0.62) + '</svg>';

  /* ---------- the trophy and the two icons ---------- */
  ART['trophy-summit'] = icon('trophy-summit', 'The Summit Trophy: a gold cup with a star.',
    '<circle cx="48" cy="48" r="44" fill="#FFF3D6"/>' +
    '<path d="M28 20h40v14c0 13-9 22-20 22S28 47 28 34z" fill="#F5A623" stroke="#A9690E" stroke-width="3.5"/>' +
    '<path d="M28 26H18c0 11 5 17 12 18M68 26h10c0 11-5 17-12 18" stroke="#A9690E" stroke-width="3.5"/>' +
    '<path d="M42 56h12v10H42z" fill="#E0901A" stroke="#A9690E" stroke-width="3"/>' +
    '<path d="M32 66h32v10H32z" fill="#3B4FA8" stroke="#24316E" stroke-width="3"/>' +
    '<path d="M48 26l3 6.2 6.8.9-5 4.7 1.3 6.7L48 41.3l-6.1 3.2 1.3-6.7-5-4.7 6.8-.9z" fill="#FFFFFF"/>' +
    '<path d="M33 24v9" stroke="#FFD98A" stroke-width="3"/>');
  ART['icon-summit-test'] = icon('icon-summit-test', 'Two test papers with marks.',
    '<circle cx="48" cy="48" r="40" fill="#E4ECFB"/>' +
    '<rect x="20" y="22" width="40" height="52" rx="4" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3" transform="rotate(-8 40 48)"/>' +
    '<rect x="36" y="18" width="40" height="52" rx="4" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
    '<path d="M44 30h18M44 40h24M44 50h20" stroke="#8FA3C7" stroke-width="3"/>' +
    '<path d="M64 56l4 4 8-9" stroke="#2E9E4F" stroke-width="3.5"/><path d="M45 62h12" stroke="#D9534F" stroke-width="3"/>');
  ART['icon-summit-cert'] = icon('icon-summit-cert', 'A certificate with a gold seal.',
    '<circle cx="48" cy="48" r="40" fill="#FFF3D6"/>' +
    '<rect x="16" y="24" width="64" height="44" rx="4" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
    '<rect x="21" y="29" width="54" height="34" rx="2" stroke="#F5A623" stroke-width="2"/>' +
    '<path d="M29 38h26M29 46h20" stroke="#8FA3C7" stroke-width="3"/>' +
    '<path d="M58 62l-4 14 8-5 8 5-4-14" fill="#3B4FA8" stroke="#24316E" stroke-width="2.4"/>' +
    '<circle cx="64" cy="56" r="9" fill="#F5A623" stroke="#A9690E" stroke-width="3"/>');

  /* ---------- the hub scene ---------- */
  const ID = 'world-summit';
  const DAY = { sk1: '#BFD9F7', sk2: '#F2F8FF', far: '#A9B8D6', far2: '#8FA3C7', snow: '#FFFFFF', cl: '#FFFFFF', gr: '#A8D69B', gr2: '#8CC487',
    rock: '#9AA3B5', rock2: '#7C869B', pa: '#EAD9B6', su: '1', mo: '0', sr: '0', cso: '.96' };
  const NIGHT = { sk1: '#0E1838', sk2: '#34406E', far: '#3C4870', far2: '#2E395E', snow: '#C9D3EC', cl: '#55628F', gr: '#3E6247', gr2: '#33523B',
    rock: '#5C657C', rock2: '#4A5268', pa: '#6E6650', su: '0', mo: '1', sr: '1', cso: '.7' };
  const vars = function (p) { return Object.keys(p).map(function (k) { return '--sm-' + k + ':' + p[k]; }).join(';'); };
  const S = '.' + ID + '-';
  const c = function (name) { return 'class="' + ID + '-' + name + '"'; };
  const cc = function (a, b) { return 'class="' + ID + '-' + a + ' ' + ID + '-' + b + '"'; };
  const css = '.art{' + vars(DAY) + '}.art.' + ID + '-night{' + vars(NIGHT) + '}' +
    ['far', 'far2', 'snow', 'cl', 'gr', 'gr2', 'rock', 'rock2', 'pa'].map(function (n) { return S + n + '{fill:var(--sm-' + n + ')}'; }).join('') +
    S + 'o{stroke:#2A2F3A;stroke-width:2.5}' + S + 'su{fill:#FFE08A;opacity:var(--sm-su)}' + S + 'mo{fill:#FFF4CF;opacity:var(--sm-mo)}' +
    S + 'stars{fill:#FFF4CF;opacity:var(--sm-sr)}' + S + 'clouds{opacity:var(--sm-cso)}' +
    S + 'flag,' + S + 'zip{transform-box:fill-box}' + S + 'flag{transform-origin:0 100%}' + S + 'zip{transform-origin:50% 100%}' +
    '.art.is-live ' + S + 'cloud-a{animation:' + ID + '-drift 34s ease-in-out infinite alternate}' +
    '.art.is-live ' + S + 'cloud-b{animation:' + ID + '-drift 42s ease-in-out -14s infinite alternate-reverse}' +
    '.art.is-live ' + S + 'flag{animation:' + ID + '-wave 2.8s ease-in-out infinite alternate}' +
    '.art.is-live ' + S + 'zip{animation:' + ID + '-bob 3.2s ease-in-out infinite alternate}' +
    '@keyframes ' + ID + '-drift{0%{transform:translateX(-14px)}100%{transform:translateX(14px)}}' +
    '@keyframes ' + ID + '-wave{0%{transform:skewY(-2deg)}100%{transform:skewY(2deg)}}' +
    '@keyframes ' + ID + '-bob{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}' +
    '@media (prefers-reduced-motion:reduce){.art.is-live *{animation:none!important}}html[data-fx="1"] .art.is-live *{animation:none!important}';

  const FLOOR = 392;
  const cloud = function (x, y, s, cls) {
    return '<g ' + c(cls) + '><path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" ' + c('cl') +
      ' d="M0 0h90c12 0 15-15 3-20 1-13-15-19-23-12-6-13-27-14-32-1-11-5-22 2-20 13-11 1-12 20 0 20z"/></g>';
  };
  let stars = '';
  [[70, 40], [150, 90], [240, 30], [330, 70], [470, 36], [560, 84], [700, 50], [760, 110], [620, 140], [110, 150]].forEach(function (p, k) {
    stars += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (k % 3 ? 2 : 3) + '"/>';
  });
  const sky = '<rect width="800" height="500" fill="url(#sm-sky)"/>' +
    '<g ' + c('su') + '><circle cx="566" cy="88" r="30"/></g>' +
    '<g ' + c('mo') + '><path d="M566 58a30 30 0 1 0 20 52 25 25 0 1 1-20-52z"/></g>' +
    '<g ' + c('stars') + '>' + stars + '</g>' +
    '<g ' + c('clouds') + '>' + cloud(90, 120, 0.9, 'cloud-a') + cloud(520, 160, 0.7, 'cloud-b') + '</g>';
  // far: mountain tops over a sea of clouds
  const far = '<path ' + c('far2') + ' d="M0 300L70 220 120 260 190 170 260 250 300 230 340 300z"/>' +
    '<path ' + c('far') + ' d="M440 300L520 200 570 240 640 150 720 240 760 210 800 250V300z"/>' +
    '<path ' + c('snow') + ' d="M190 170l-22 30 14-6 8 10 10-12 12 6zM640 150l-24 32 14-6 10 10 10-12 14 6z"/>' +
    '<path ' + c('cl') + ' d="M0 292c40-14 80 6 120-6s80 8 130-2 90 10 140 0 110 12 160 2 90 8 130-4 70 6 120-2V350H0z"/>';
  // floor: the top of the mountain, the trail coming up, the nine stones
  const floor = '<path ' + c('rock2') + ' d="M0 360C120 330 230 320 330 318 420 314 540 322 640 334 720 344 770 352 800 356V500H0z"/>' +
    '<path ' + c('gr') + ' d="M0 384C140 368 260 362 400 362S660 370 800 384V500H0z"/>' +
    '<path ' + c('gr2') + ' d="M0 430C150 418 290 414 420 416S680 424 800 436V500H0z"/>' +
    '<path ' + c('pa') + ' d="M120 500C170 460 230 430 300 410 340 400 370 396 392 394L410 396C380 402 350 410 322 422 262 448 214 474 190 500z"/>' +
    STOPS.map(function (col, k) {
      const t = k / 8, x = 150 + t * 215 - Math.sin(t * 3.1) * 18, y = 486 - t * 86;
      return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (7.5 - t * 2.5).toFixed(1) + '" fill="' + col + '" stroke="#2A2F3A" stroke-width="2"/>';
    }).join('');
  // the heart: the cairn of stones with the gold flag
  const heart = '<g data-heart="1">' +
    '<path ' + cc('rock', 'o') + ' d="M362 392c-4-14 6-24 20-24h36c14 0 24 10 20 24z"/>' +
    '<path ' + cc('rock2', 'o') + ' d="M372 370c-2-12 8-20 20-20h18c12 0 20 8 18 20z"/>' +
    '<path ' + cc('rock', 'o') + ' d="M384 351c-1-10 6-16 16-16s17 6 16 16z"/>' +
    '<path d="M400 336V292" stroke="#2A2F3A" stroke-width="4.5"/>' +
    '<g ' + c('flag') + '><path d="M402 292h42l-10 12 10 12h-42z" fill="#F5A623" stroke="#A9690E" stroke-width="3"/>' +
    '<path d="M418 297l2.5 5 5.5.7-4 3.8 1 5.4-5-2.7-5 2.7 1-5.4-4-3.8 5.5-.7z" fill="#FFFFFF"/></g></g>';
  const zip = '<g ' + c('zip') + '><g transform="translate(458 ' + (FLOOR - 52) + ') scale(.42)">' +
    '<line x1="60" y1="24" x2="60" y2="13" stroke="#0E2B58" stroke-width="4"/><circle cx="60" cy="11" r="6" fill="#F7B53C" stroke="#B8770E" stroke-width="2.5"/>' +
    '<rect x="34" y="92" width="52" height="30" rx="13" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M36 100Q13 103 6 75" stroke="#1E5D9F" stroke-width="7"/><circle cx="6" cy="72" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<path d="M84 100Q110 96 118 62" stroke="#1E5D9F" stroke-width="7"/><circle cx="118" cy="58" r="6.5" fill="#5AB4EE" stroke="#1E5D9F" stroke-width="3"/>' +
    '<rect x="17" y="22" width="86" height="68" rx="24" fill="#1D4F9C" stroke="#0E2B58" stroke-width="3"/>' +
    '<rect x="27" y="33" width="66" height="46" rx="16" fill="#EAF6FF"/>' +
    '<ellipse cx="46" cy="52" rx="6" ry="7.5" fill="#0E2B58"/><ellipse cx="74" cy="52" rx="6" ry="7.5" fill="#0E2B58"/>' +
    '<circle cx="36" cy="66" r="4.5" fill="#FF9AA2"/><circle cx="84" cy="66" r="4.5" fill="#FF9AA2"/>' +
    '<path d="M47 63Q60 74 73 63" stroke="#0E2B58" stroke-width="3"/></g></g>';

  const label = 'The Summit: the top of a mountain over a sea of clouds. The trail comes up past nine coloured stones, one for each stop, ' +
    'to a pile of stones with a gold flag on top. Other mountain tops stand far away. Zip waves by the flag.';
  ART[ID] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="art" data-art="' + ID +
    '" data-view="0 0 800 500" data-safe="180,190,440,250" data-band="290,394" role="img" aria-label="' + label +
    '" fill="none" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' +
    '<defs><linearGradient id="sm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sm-sk1)"/><stop offset="1" style="stop-color:var(--sm-sk2)"/></linearGradient></defs>' +
    '<g data-layer="sky">' + sky + '</g><g data-layer="building">' + far + '</g><g data-layer="floor">' + floor + '</g>' +
    '<g data-layer="things">' + heart + zip + '</g></svg>';
})();

