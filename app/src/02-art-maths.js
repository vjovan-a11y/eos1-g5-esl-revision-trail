/* 02-art-maths.js - the maths pictures drawn for this trail, in the flat style of the Grade 4 badges.

   badge-1 ... badge-9      the round world badges of the trail map (viewBox 200, data-shape circle):
                            1 a factory and base-ten blocks, 2 the canyon steps that count back past zero and a thermometer, 3 the number line bridge over the river (a frog jumps from 47 to 50),
                            4 a market stall and a level balance scale, 5 tower of times-table dots, 6 boat sharing crates,
                            7 garden bed cut in quarters, 8 station clock, 9 fair spinner
   icon-extra-lightning     the Lightning round extra (viewBox 96): a gold bolt
   icon-extra-selfcheck     the My self-check extra (viewBox 96): a clipboard with a tick

   Every drawing is a string in window.T_ART, like the Grade 4 art. Class names start with the id, so
   many copies on one page never clash. Built here by small helpers, once, when the page loads. */
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

  function icon(id, label, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" class="art" data-art="' + id +
      '" role="img" aria-label="' + label + '" fill="none" stroke-linejoin="round" stroke-linecap="round">' + body + '</svg>';
  }

  const o = 'stroke="' + INK + '" stroke-width="3"';          // the outline of every shape
  const thin = 'stroke="' + INK + '" stroke-width="1.6" opacity=".45"';

  function grid(x, y, w, h, cols, rows) {
    let s = '';
    for (let i = 1; i < cols; i++) s += '<path d="M' + (x + i * w / cols) + ' ' + y + 'v' + h + '" ' + thin + '/>';
    for (let j = 1; j < rows; j++) s += '<path d="M' + x + ' ' + (y + j * h / rows) + 'h' + w + '" ' + thin + '/>';
    return s;
  }

  function txt(x, y, size, text, fill) {
    return '<text x="' + x + '" y="' + y + '" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="' + size +
      '" text-anchor="middle" fill="' + (fill || INK) + '">' + text + '</text>';
  }

  const ART = {};

  // 1 Number Factory: the factory of the hub scene (world-number-factory, 05-art-world-1.js) behind a hundred flat,
  // a ten and three ones, in the place colours of the mat (hundreds green, tens blue, ones amber; 39-mat.css)
  ART['badge-1'] = badge(1, 'Number Factory: a factory with base-ten blocks, a hundred, a ten and three ones.', '#F9D5E2', '#AE3465',
    '<path d="M30 150V70l34-26v26l34-26v26l34-26v26l36-26v106z" fill="#F2B3CA"/>' +
    '<rect x="146" y="26" width="14" height="34" fill="#E7A0BB"/><circle cx="160" cy="18" r="7" fill="#FFFFFF" opacity=".8"/>' +
    '<path d="M40 74h14v10H40zM74 74h14v10H74zM108 74h14v10h-14zM142 74h14v10h-14z" fill="#FFFFFF" opacity=".75"/>' +
    '<rect x="38" y="84" width="64" height="64" rx="3" fill="#B4E8CD" ' + o + '/>' + grid(38, 84, 64, 64, 10, 10) +
    '<path d="M38 84l8-8h64l-8 8z" fill="#D6F4E4" ' + o + '/><path d="M102 84l8-8v64l-8 8z" fill="#8FD6B2" ' + o + '/>' +
    '<rect x="122" y="84" width="11" height="64" rx="2" fill="#B5D5F7" ' + o + '/>' + grid(122, 84, 11, 64, 1, 10) +
    '<rect x="144" y="134" width="13" height="13" rx="2" fill="#FFD47E" ' + o + '/>' +
    '<rect x="144" y="117" width="13" height="13" rx="2" fill="#FFD47E" ' + o + '/>' +
    '<rect x="161" y="134" width="13" height="13" rx="2" fill="#FFD47E" ' + o + '/>');

  // 2 Pattern Canyon: a thermometer below zero and stepping stones that count on in 2s
  ART['badge-2'] = badge(2, 'Pattern Canyon: steps in an orange canyon count back in 2s, 4, 2, 0 at the water and \u22122 below it. A thermometer below zero.', '#FBE0C2', '#AC661A',
    // the canyon walls with their stripes, the river at sea level (0), the steps 4, 2, 0, -2, a thermometer at -4
    '<path d="M30 66l22-6 18 6 16-4v100H30z" fill="#E58A4E" ' + o + '/><path d="M32 92h52M32 118h52" stroke="#C25E2C" stroke-width="5"/>' +
    '<path d="M86 128h88v34H86z" fill="#5DB6E8"/><path d="M86 128c10-5 20 5 30 0s20-5 30 0 20 5 28 0" stroke="#2F7FD4" stroke-width="3"/>' +
    '<path d="M86 74h22v90H86z" fill="#F0A465" ' + o + '/><path d="M108 92h22v72h-22z" fill="#E58A4E" ' + o + '/>' +
    '<path d="M130 110h22v54h-22z" fill="#F0A465" ' + o + '/><path d="M152 128h22v36h-22z" fill="#E58A4E" ' + o + '/>' +
    '<path d="M86 128h88v34H86z" fill="#5DB6E8" opacity=".55"/>' +
    txt(97, 90, 14, '4') + txt(119, 108, 14, '2') + txt(141, 126, 14, '0') + txt(163, 146, 14, '\u22122', '#123E70') +
    '<rect x="44" y="40" width="16" height="78" rx="8" fill="#FFFFFF" ' + o + '/><rect x="48" y="84" width="8" height="34" fill="#E5404A"/>' +
    '<circle cx="52" cy="122" r="12" fill="#E5404A" ' + o + '/><path d="M60 52h7M60 66h7M60 80h10M60 94h7M60 108h7" ' + o + '/>');

  // 3 Rounding River: the number line bridge over the river, 40 to 50, the halfway post 45, a frog jumps from 47 to 50
  ART['badge-3'] = badge(3, 'Rounding River: a bridge over a river is a number line from 40 to 50. A frog jumps from 47 to 50, the nearest ten. A gold post marks 45, halfway.', '#D6F0D9', '#2D7C3A',
    '<path d="M22 112c18-10 34-12 46-6v54H22z" fill="#7CC56E"/><path d="M178 112c-18-10-34-12-46-6v54h46z" fill="#7CC56E"/>' +
    '<path d="M44 124h112v38H44z" fill="#5DB6E8"/><path d="M48 140c10-5 20 5 30 0s20-5 30 0 20 5 30 0 14-4 16-2" stroke="#D4F0FC" stroke-width="3"/>' +
    '<rect x="30" y="104" width="140" height="10" rx="3" fill="#C98E52" stroke="#6E4320" stroke-width="2.5"/>' +
    '<path d="M40 104V90M152 104V90" stroke="#6E4320" stroke-width="5"/><path d="M51 104v-8M62 104v-8M74 104v-8M85 104v-8M107 104v-8M118 104v-8M130 104v-8M141 104v-8" stroke="#6E4320" stroke-width="3"/>' +
    '<path d="M96 104V70" stroke="#A66A06" stroke-width="3.5" stroke-dasharray="6 5"/><path d="M96 70h14l-4 6 4 6H96z" fill="#F7B23B" stroke="#A66A06" stroke-width="2"/>' +
    txt(40, 134, 15, '40') + '<rect x="83" y="119" width="26" height="20" rx="6" fill="#F7B23B"/>' + txt(96, 134, 15, '45', '#3A2600') +
    '<ellipse cx="152" cy="129" rx="17" ry="12" fill="#FFF1CF" stroke="#F5A623" stroke-width="3"/>' + txt(152, 134, 15, '50') +
    '<path d="M130 86c6-30 18-32 22-6" stroke="#D9730D" stroke-width="3.5" stroke-dasharray="5 5"/><path d="M146 80l6 8 4-9" stroke="#D9730D" stroke-width="3.5"/>' +
    '<ellipse cx="130" cy="94" rx="11" ry="8" fill="#6CC04A" stroke="#2D7C3A" stroke-width="2.5"/><circle cx="125" cy="86" r="3.6" fill="#FFFFFF" stroke="#2D7C3A" stroke-width="2"/><circle cx="135" cy="86" r="3.6" fill="#FFFFFF" stroke="#2D7C3A" stroke-width="2"/><circle cx="125.5" cy="86" r="1.6" fill="' + INK + '"/><circle cx="135.5" cy="86" r="1.6" fill="' + INK + '"/>');

  // 4 Market Square: a stall with a striped purple awning and, in front, a level balance scale with 15 and 25 on one pan
  // and 40 on the other (both sides are equal), as in the world scene
  let awn = '';
  for (let i = 0; i < 6; i++) awn += '<path d="M' + (40 + i * 20) + ' 54h20v16a10 6 0 0 1-20 0z" fill="' + (i % 2 ? '#FFFFFF' : '#7B5BD6') + '" stroke="#3F2A86" stroke-width="2.5"/>';
  const blk = function (x, w, t) { return '<rect x="' + x + '" y="108" width="' + w + '" height="16" rx="3" fill="#FFFFFF" stroke="#10305E" stroke-width="2"/>' + txt(x + w / 2, 121, 12, t, '#10305E'); };
  ART['badge-4'] = badge(4, 'Market Square: a market stall with a striped awning. In front, a level balance scale: 15 and 25 on one pan, 40 on the other.', '#E6DEFA', '#5940A8',
    '<path d="M46 74v74M154 74v74" stroke="#6E4320" stroke-width="5"/>' + '<rect x="36" y="46" width="128" height="10" rx="4" fill="#7B5BD6" stroke="#3F2A86" stroke-width="2.5"/>' + awn +
    '<path d="M82 152h36l-5-8H87z" fill="#8A6CE0" stroke="#3F2A86" stroke-width="2.5"/><rect x="97" y="98" width="6" height="48" rx="2" fill="#B9A6EE" stroke="#3F2A86" stroke-width="2"/>' +
    '<rect x="50" y="95" width="100" height="7" rx="3.5" fill="#6E52C8" stroke="#3F2A86" stroke-width="2"/>' +
    '<path d="M56 98l-12 26M56 98l12 26M144 98l-12 26M144 98l12 26" stroke="#5C6472" stroke-width="1.6"/>' +
    blk(44, 19, '15') + blk(66, 19, '25') + blk(130, 24, '40') +
    '<path d="M40 124h44l-5 6H45zM116 124h44l-5 6h-34z" fill="#DCD2F7" stroke="#3F2A86" stroke-width="2"/>' +
    '<circle cx="100" cy="98" r="5" fill="#F5A623" stroke="#A66A06" stroke-width="2"/>' +
    '<circle cx="100" cy="80" r="10" fill="#1E9E6A" stroke="#FFFFFF" stroke-width="2"/><path d="M95 78h10M95 83h10" stroke="#FFFFFF" stroke-width="2.5"/>');

  // 5 Times Table Tower: a tower of windows in rows of 3, with a flag
  let dots = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) dots += '<circle cx="' + (82 + c * 18) + '" cy="' + (78 + r * 18) + '" r="6" fill="#F5C24A" ' + 'stroke="' + INK + '" stroke-width="2"/>';
  ART['badge-5'] = badge(5, 'Times Table Tower: a tower with 4 rows of 3 windows, 3 times 4.', '#CFF0F2', '#0E7682',
    '<rect x="68" y="62" width="64" height="96" rx="4" fill="#17A2B0" ' + o + '/>' +
    '<path d="M64 62l36-26 36 26z" fill="#0E7682" ' + o + '/><path d="M100 36V20" ' + o + '/><path d="M100 20h20l-5 6 5 6h-20z" fill="#E5533D" ' + o + '/>' +
    dots + txt(154, 120, 34, '×', '#0E7682'));

  // 6 Sharing Harbour: a boat with 3 equal crates of fish and a division sign on the sail (Session 10: 3 crates, as its label says)
  ART['badge-6'] = badge(6, 'Sharing Harbour: a boat shares fish into 3 equal crates.', '#D5E6F8', '#1F5CA0',
    '<path d="M98 34v66" ' + o + '/><path d="M102 40l40 52h-40z" fill="#FFFFFF" ' + o + '/>' +
    '<circle cx="120" cy="66" r="3.5" fill="' + INK + '"/><path d="M112 76h16" stroke="' + INK + '" stroke-width="3.5"/><circle cx="120" cy="86" r="3.5" fill="' + INK + '"/>' +
    '<rect x="36" y="80" width="18" height="20" rx="2" fill="#D9A066" ' + o + '/><rect x="56" y="80" width="18" height="20" rx="2" fill="#D9A066" ' + o + '/>' +
    '<rect x="76" y="80" width="18" height="20" rx="2" fill="#D9A066" ' + o + '/>' +
    '<circle cx="45" cy="76" r="4" fill="#4F9BE8"/><circle cx="65" cy="76" r="4" fill="#4F9BE8"/><circle cx="85" cy="76" r="4" fill="#4F9BE8"/>' +
    '<path d="M36 100h128l-16 30H52z" fill="#2F7FD4" ' + o + '/>' +
    '<path d="M30 146c12-6 22 6 34 0s22-6 34 0 22 6 34 0 22-6 36 0" stroke="#1F5CA0" stroke-width="4"/>');

  // 7 Fraction Garden: a round flower bed cut into 4 equal parts, 1 part planted
  ART['badge-7'] = badge(7, 'Fraction Garden: a round flower bed in 4 equal parts. One quarter has flowers.', '#E5F1CF', '#66861A',
    '<circle cx="100" cy="104" r="50" fill="#B98A5E" ' + o + '/>' +
    '<path d="M100 104V54a50 50 0 0 1 50 50z" fill="#8DB32E"/>' +
    '<path d="M100 54v100M50 104h100" ' + o + '/><circle cx="100" cy="104" r="50" ' + o + '/>' +
    '<circle cx="118" cy="80" r="7" fill="#F7889B" ' + o + '/><circle cx="132" cy="94" r="7" fill="#F5C24A" ' + o + '/>' +
    txt(64, 44, 18, '1') + '<path d="M54 50h20" ' + o + '/>' + txt(64, 70, 18, '4'));

  // 8 Clock Station: a station clock under a little roof
  ART['badge-8'] = badge(8, 'Clock Station: a station clock showing ten past ten.', '#DCE8EF', '#3C6880',
    '<path d="M44 66l56-30 56 30z" fill="#5B8CA8" ' + o + '/><path d="M100 66v12" ' + o + '/>' +
    '<circle cx="100" cy="116" r="40" fill="#FFFFFF" ' + o + '/>' +
    '<path d="M100 80v6M100 146v6M64 116h6M130 116h6" ' + o + '/>' +
    '<path d="M100 116l-17-10M100 116l20-22" stroke="' + INK + '" stroke-width="5"/><circle cx="100" cy="116" r="4" fill="#E5533D"/>');

  // 9 Chance Fair: a spinner in 4 colours with an arrow
  ART['badge-9'] = badge(9, 'Chance Fair: a spinner with four colours and an arrow.', '#F6D9EE', '#92367E',
    '<path d="M100 100V50a50 50 0 0 1 50 50z" fill="#E5533D"/><path d="M100 100h50a50 50 0 0 1-50 50z" fill="#2F7FD4"/>' +
    '<path d="M100 100v50a50 50 0 0 1-50-50z" fill="#F5C24A"/><path d="M100 100H50a50 50 0 0 1 50-50z" fill="#43A852"/>' +
    '<circle cx="100" cy="100" r="50" ' + o + '/><path d="M100 50v100M50 100h100" ' + o + '/>' +
    '<path d="M100 100l26-30" stroke="' + INK + '" stroke-width="6"/><path d="M126 70l-12 2 8 8z" fill="' + INK + '" ' + o + '/>' +
    '<circle cx="100" cy="100" r="7" fill="#FFFFFF" ' + o + '/><path d="M100 150v12" ' + o + '/>');

  // the hub extras
  ART['icon-extra-lightning'] = icon('icon-extra-lightning', 'A gold lightning bolt.',
    '<circle cx="48" cy="48" r="40" fill="#FFF3D6"/>' +
    '<path d="M54 12L26 54h20l-6 30 30-44H50z" fill="#F5A623" stroke="#A9690E" stroke-width="3.5"/>' +
    '<path d="M50 22L36 46" stroke="#FFD98A" stroke-width="3"/>');
  ART['icon-extra-selfcheck'] = icon('icon-extra-selfcheck', 'A clipboard with a green tick.',
    '<rect x="20" y="16" width="56" height="70" rx="6" fill="#C98B4E" stroke="#7A4E22" stroke-width="3"/>' +
    '<rect x="27" y="24" width="42" height="56" rx="3" fill="#FFFFFF" stroke="#7A4E22" stroke-width="2"/>' +
    '<rect x="36" y="10" width="24" height="12" rx="4" fill="#9AA3B2" stroke="#4D5566" stroke-width="3"/>' +
    '<path d="M35 52l9 9 18-20" stroke="#2E9E4F" stroke-width="6"/>' +
    '<path d="M35 34h26" stroke="#C3C9D3" stroke-width="3"/>');

  window.T_ART = Object.assign(window.T_ART || {}, ART);
})();

