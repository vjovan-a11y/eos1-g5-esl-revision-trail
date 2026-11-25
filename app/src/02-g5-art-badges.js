/* 02-g5-art-badges.js - the nine Grade 5 stop badges of the trail map, in the flat style of 02-art-maths.js.

   badge-1 ... badge-9      round world badges (viewBox 200, data-shape circle). They replace the Grade 3 badges of
                            02-art-maths.js (this file loads later and overwrites the ids):
                            1 Decimal Lab: a flask with 0.1 on it, 2 Rounding Reef: a fish on a number line from 4 to 5 swims to 5,
                            3 Sequence Station: a train with 3, 6, 9, 4 Factor Forest: a tree whose crown is two overlapping
                            rings (4, 12, 6), 5 Fraction Bakery: a cake in 8 slices with 3 taken, 6 Percent Market: a price tag
                            with %, 7 Shape Studio: an easel with a kite, 8 Circle Circus: compasses drawing a circle,
                            9 Data Stadium: four bars and a dashed level line

   One bold object per badge, so it still reads at the map disc size. Literal colours; the ring is the world's deep hue. */
(function () {
  'use strict';

  const INK = '#2A2F3A';

  function badge(n, label, bg, ring, body) {
    const id = 'badge-' + n;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="art" data-art="' + id +
      '" data-shape="circle" role="img" aria-label="' + label + '" fill="none" stroke-linejoin="round" stroke-linecap="round">' +
      '<circle cx="100" cy="100" r="100" fill="' + bg + '"/>' +
      '<circle cx="100" cy="100" r="92" fill="none" stroke="' + ring + '" stroke-width="4" opacity=".35"/>' +
      '<ellipse cx="100" cy="160" rx="62" ry="10" fill="' + ring + '" opacity=".25"/>' +
      body + '</svg>';
  }

  const o = 'stroke="' + INK + '" stroke-width="3"';          // the outline of every shape

  function txt(x, y, size, text, fill) {
    return '<text x="' + x + '" y="' + y + '" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="' + size +
      '" text-anchor="middle" fill="' + (fill || INK) + '">' + text + '</text>';
  }

  const ART = {};

  // 1 Decimal Lab: a conical flask of pink liquid with 0.1 on it, three bubbles rise from the neck
  ART['badge-1'] = badge(1, 'Decimal Lab: a lab flask of pink liquid with 0.1 written on it.', '#F9D5E2', '#AE3465',
    '<path d="M84 46h32v34l40 66a9 9 0 0 1-8 14H52a9 9 0 0 1-8-14l40-66z" fill="#FFFFFF" ' + o + '/>' +
    '<path d="M72 100h56l28 46a9 9 0 0 1-8 14H52a9 9 0 0 1-8-14z" fill="#E0548A"/>' +
    '<path d="M72 100c10-6 18 5 28 0s18-5 28 0" stroke="#AE3465" stroke-width="3"/>' +
    '<path d="M84 46h32v34l40 66a9 9 0 0 1-8 14H52a9 9 0 0 1-8-14l40-66z" ' + o + '/>' +
    '<rect x="78" y="38" width="44" height="11" rx="5.5" fill="#FFFFFF" ' + o + '/>' +
    txt(100, 147, 36, '0.1', '#FFFFFF') +
    '<circle cx="100" cy="84" r="6" fill="#F7A9C6" stroke="#AE3465" stroke-width="2.5"/>' +
    '<circle cx="109" cy="66" r="4.5" fill="#F7A9C6" stroke="#AE3465" stroke-width="2.5"/>' +
    '<circle cx="138" cy="34" r="9" fill="#FFFFFF" stroke="#AE3465" stroke-width="2.5"/>' +
    '<circle cx="154" cy="56" r="5.5" fill="#FFFFFF" stroke="#AE3465" stroke-width="2.5"/>');

  // 2 Rounding Reef: a number line from 4 to 5 with the halfway tick; an orange fish near the 5 end swims to 5
  let reefTicks = '';
  for (let i = 1; i < 10; i++) reefTicks += '<path d="M' + (34 + i * 13.2) + ' 118v' + (i === 5 ? -16 : -9) + '" stroke="' + INK + '" stroke-width="' + (i === 5 ? 3 : 2) + '"/>';
  ART['badge-2'] = badge(2, 'Rounding Reef: a fish on a number line from 4 to 5 swims to 5, the nearer end.', '#CFF0F2', '#0E7682',
    '<path d="M88 164c-6-12 4-16 0-26M100 164c5-12-4-18 0-30M112 164c6-10-3-16 1-24" stroke="#17A2B0" stroke-width="6"/>' +
    '<path d="M34 118h132" stroke="' + INK + '" stroke-width="4"/><path d="M34 118v-18M166 118v-18" stroke="' + INK + '" stroke-width="4"/>' + reefTicks +
    txt(38, 148, 28, '4') +
    '<circle cx="162" cy="138" r="17" fill="#FFF1CF" stroke="#F5A623" stroke-width="4"/>' + txt(162, 148, 28, '5') +
    // the fish at about 4.7
    '<path d="M92 70l-22-14v28z" fill="#F08A2C" ' + o + '/>' +
    '<ellipse cx="112" cy="70" rx="26" ry="17" fill="#F5A623" ' + o + '/>' +
    '<path d="M104 55c0 10 0 20 0 30" stroke="#FFFFFF" stroke-width="6"/>' +
    '<circle cx="124" cy="65" r="4.5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/><circle cx="125" cy="65" r="1.8" fill="' + INK + '"/>' +
    '<path d="M144 70h20" stroke="#0E7682" stroke-width="5"/><path d="M158 62l9 8-9 8" stroke="#0E7682" stroke-width="5"/>' +
    '<path d="M166 80v14" stroke="#0E7682" stroke-width="3" stroke-dasharray="3 5"/>' +
    '<circle cx="62" cy="40" r="5" fill="#FFFFFF" stroke="#0E7682" stroke-width="2.5"/><circle cx="76" cy="30" r="3.5" fill="#FFFFFF" stroke="#0E7682" stroke-width="2.5"/>');

  // 3 Sequence Station: an engine pulls three wagons that carry 3, 6 and 9; +3 hops above
  const wagon = function (x, d) {
    return '<rect x="' + x + '" y="92" width="36" height="38" rx="5" fill="#FFFFFF" ' + o + '/>' + txt(x + 18, 121, 28, d, '#1F5CA0') +
      '<circle cx="' + (x + 9) + '" cy="138" r="7" fill="#F5C24A" ' + o + '/><circle cx="' + (x + 27) + '" cy="138" r="7" fill="#F5C24A" ' + o + '/>';
  };
  const hop = function (x) {
    return '<path d="M' + x + ' 84c6-20 34-20 40 0" stroke="#E5533D" stroke-width="3.5"/><path d="M' + (x + 31) + ' 80l9 4 2-10" stroke="#E5533D" stroke-width="3.5"/>' +
      txt(x + 20, 60, 17, '+3', '#B8321F');
  };
  ART['badge-3'] = badge(3, 'Sequence Station: a little train whose wagons carry 3, 6 and 9. Each jump is plus 3.', '#D5E6F8', '#1F5CA0',
    '<path d="M16 146h168" stroke="#1F5CA0" stroke-width="4"/>' +
    '<path d="M52 130h8M96 130h4M136 130h4" ' + o + '/>' +
    // the engine, facing left
    '<rect x="20" y="104" width="34" height="26" rx="5" fill="#2F7FD4" ' + o + '/><rect x="36" y="80" width="22" height="50" rx="4" fill="#2F7FD4" ' + o + '/>' +
    '<rect x="41" y="87" width="12" height="13" rx="2" fill="#D5E6F8" stroke="' + INK + '" stroke-width="2"/>' +
    '<rect x="24" y="90" width="8" height="14" fill="#1F5CA0" ' + o + '/>' +
    '<circle cx="24" cy="78" r="5" fill="#FFFFFF"/><circle cx="32" cy="66" r="7" fill="#FFFFFF"/>' +
    '<circle cx="30" cy="138" r="7" fill="#F5C24A" ' + o + '/><circle cx="48" cy="138" r="7" fill="#F5C24A" ' + o + '/>' +
    wagon(60, '3') + wagon(100, '6') + wagon(140, '9') + hop(78) + hop(118));

  // 4 Factor Forest: a tree whose crown is two overlapping rings; 4 and 6 in the rings, 12 where they overlap
  ART['badge-4'] = badge(4, 'Factor Forest: a tree whose crown is two overlapping rings. 4 is in one ring, 6 in the other and 12 is in both.', '#D6F0D9', '#2D7C3A',
    '<path d="M90 160l4-38h12l4 38z" fill="#A8703C" ' + o + '/>' +
    '<circle cx="76" cy="88" r="44" fill="#8FD68F" ' + o + '/><circle cx="124" cy="88" r="44" fill="#F5D76A" ' + o + '/>' +
    '<path d="M100 51.1a44 44 0 0 1 0 73.8a44 44 0 0 1 0-73.8z" fill="#2D7C3A" ' + o + '/>' +
    '<circle cx="76" cy="88" r="44" ' + o + '/>' +
    txt(55, 100, 32, '4') + txt(100, 98, 26, '12', '#FFFFFF') + txt(146, 100, 32, '6'));

  // 5 Fraction Bakery: a round cake seen from above, cut into 8 equal slices; 3 slices are taken (the plate shows)
  let cake = '', cuts = '';
  for (let i = 0; i < 8; i++) {
    const a0 = (-90 + i * 45) * Math.PI / 180, a1 = (-45 + i * 45) * Math.PI / 180, am = (a0 + a1) / 2;
    const P = function (r, a) { return (100 + r * Math.cos(a)).toFixed(1) + ' ' + (100 + r * Math.sin(a)).toFixed(1); };
    cuts += '<path d="M100 100L' + P(52, a0) + '" ' + (i >= 1 && i <= 2 ? 'stroke="#C9B49A" stroke-width="2" stroke-dasharray="4 5"' : o) + '/>';
    if (i < 3) continue;
    cake += '<path d="M100 100L' + P(52, a0) + 'A52 52 0 0 1 ' + P(52, a1) + 'z" fill="#F2B45A" ' + o + '/>' +
      '<path d="M100 100L' + P(38, a0) + 'A38 38 0 0 1 ' + P(38, a1) + 'z" fill="#FFF3DC"/>' +
      '<circle cx="' + P(26, am).split(' ')[0] + '" cy="' + P(26, am).split(' ')[1] + '" r="6" fill="#E5404A" stroke="' + INK + '" stroke-width="2"/>';
  }
  ART['badge-5'] = badge(5, 'Fraction Bakery: a round cake cut into 8 equal slices. 3 slices are taken, 5 are left.', '#FBE0C2', '#AC661A',
    '<circle cx="100" cy="100" r="62" fill="#FFFFFF" ' + o + '/><circle cx="100" cy="100" r="52" fill="#FFFFFF" stroke="#C9B49A" stroke-width="2"/>' +
    cake + cuts);

  // 6 Percent Market: a tilted price tag on a string with a big % sign
  ART['badge-6'] = badge(6, 'Percent Market: a price tag with a big per cent sign.', '#E6DEFA', '#5940A8',
    '<path d="M62 60c-10-22 6-34 22-26" stroke="#5940A8" stroke-width="4"/>' +
    '<g transform="rotate(-14 100 100)">' +
    '<path d="M70 50h64a10 10 0 0 1 10 10v86a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V60a10 10 0 0 1 10-10z" fill="#7C5FD8" ' + o + '/>' +
    '<path d="M60 76h84" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="2 8" opacity=".7"/>' +
    '<circle cx="72" cy="62" r="6" fill="#E6DEFA" ' + o + '/>' +
    '<circle cx="82" cy="100" r="11" stroke="#FFFFFF" stroke-width="8"/><circle cx="122" cy="132" r="11" stroke="#FFFFFF" stroke-width="8"/>' +
    '<path d="M124 90L80 142" stroke="#FFFFFF" stroke-width="9"/>' +
    '</g>');

  // 7 Shape Studio: an easel; on the canvas a kite with its two diagonals
  ART['badge-7'] = badge(7, 'Shape Studio: an easel with a painting of a kite and its two diagonals.', '#E5F1CF', '#66861A',
    '<path d="M70 130l-18 34M130 130l18 34M100 130v30" stroke="#8A5A2B" stroke-width="7"/>' +
    '<rect x="44" y="34" width="112" height="98" rx="5" fill="#FFFFFF" ' + o + '/>' +
    '<rect x="38" y="130" width="124" height="10" rx="4" fill="#B98A5E" ' + o + '/>' +
    '<path d="M100 44l34 30-34 50-34-50z" fill="#8DB32E" ' + o + '/>' +
    '<path d="M100 44l34 30-34 50z" fill="#B5D660"/><path d="M100 44l34 30-34 50-34-50z" ' + o + '/>' +
    '<path d="M100 44v80M66 74h68" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="5 5"/>');

  // 8 Circle Circus: a pair of compasses, its point on the centre, its pencil drawing the circle
  ART['badge-8'] = badge(8, 'Circle Circus: a pair of compasses draws a circle around its centre point.', '#F6D9EE', '#92367E',
    '<circle cx="86" cy="118" r="44" fill="#FFFFFF" opacity=".55"/>' +
    '<path d="M130 118a44 44 0 1 1-13-31" stroke="#C050A8" stroke-width="6"/>' +
    '<path d="M117 87a44 44 0 0 1 13 31" stroke="#C050A8" stroke-width="4" stroke-dasharray="3 8" opacity=".7"/>' +
    '<path d="M108 40L86 118M108 40l22 66" stroke="' + INK + '" stroke-width="12"/>' +
    '<path d="M108 40L86 118M108 40l22 66" stroke="#B9C0CE" stroke-width="6"/>' +
    '<path d="M126 104l8-3 3 12-7 8z" fill="#F5C24A" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<path d="M94 86h28" stroke="' + INK + '" stroke-width="3.5"/>' +
    '<circle cx="108" cy="40" r="10" fill="#C050A8" ' + o + '/><rect x="104" y="18" width="8" height="14" rx="3" fill="#92367E" ' + o + '/>' +
    '<circle cx="86" cy="118" r="5" fill="' + INK + '"/>');

  // 9 Data Stadium: four bars of different heights on a board, a dashed gold line shows the level they share
  const bar = function (x, h, fill) { return '<rect x="' + x + '" y="' + (148 - h) + '" width="24" height="' + h + '" rx="3" fill="' + fill + '" ' + o + '/>'; };
  ART['badge-9'] = badge(9, 'Data Stadium: a scoreboard with four bars of different heights and a dashed line at their middle level.', '#DCE8EF', '#3C6880',
    '<rect x="34" y="36" width="132" height="118" rx="10" fill="#FFFFFF" ' + o + '/>' +
    bar(46, 44, '#E0548A') + bar(74, 92, '#5B8CA8') + bar(102, 64, '#43A852') + bar(130, 28, '#7C5FD8') +
    '<path d="M34 148h132" ' + o + '/>' +
    '<path d="M40 91h120" stroke="#F5A623" stroke-width="5" stroke-dasharray="9 7"/>' +
    '<path d="M70 154v10M130 154v10" stroke="' + INK + '" stroke-width="5"/>');

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

