/* 10-ui.js - the UI kit: every look-dependent building block of the app.

   Pictures   T.ui.art(id, opts)  T.ui.playArt(svg)  T.ui.plate(artOrId, opts)
              T.ui.zip(mood)  T.ui.zipMood(svg, mood)  T.ui.icon(name)  T.ui.brandMark()
   Controls   T.ui.button(opts)  T.ui.iconButton(opts)  T.ui.soundSwitch(opts)  T.ui.choice(opts)
              T.ui.actionBar()
   Meters     T.ui.stars(n, max)  T.ui.hearts(n, max)  T.ui.dots(i, n)  T.ui.bar(fraction)
              T.ui.meter(el, value)  T.ui.revealStars(el, n)  T.ui.countUp(el, to, {from, ms, format})
   Text       T.ui.instruction({en, vi, mood})  T.ui.richText(str)  T.ui.viButton(onToggle)
   Overlays   T.ui.dialog(opts)  T.ui.toast(text)  T.ui.celebrate(opts)  T.ui.wordCard(key)
              T.ui.closeOverlays()
   Cards      T.ui.resultCard(opts)
   Helpers    T.ui.isDark()  T.ui.onTheme(fn)  T.ui.reducedMotion()  T.ui.stagger(parent)  T.ui.empty(node)

   Every function returns a DOM node (or a small handle with .el) and never throws on bad input.
   The full API, the class names and the tokens that step engines may use are in brief/api-ui.md. */
(function (T) {
  'use strict';

  const el = T.util.el, esc = T.util.esc, uid = T.util.uid, $$ = T.util.$$;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const noop = function () {};

  /* ---------- small helpers ---------- */

  function empty(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function wholeNumber(value, low, high) {
    return Math.round(T.util.clamp(value, low, high));
  }

  // markup of ONE <svg> -> the element (parsed as HTML, so the SVG namespace is right), or null
  function parseSvg(markup) {
    const holder = document.createElement('template');
    holder.innerHTML = String(markup).trim();
    const node = holder.content.firstElementChild;
    return node && node.namespaceURI === SVG_NS ? node : null;
  }

  function addClasses(node, names) {
    String(names || '').split(/\s+/).filter(Boolean).forEach(function (name) { node.classList.add(name); });
  }

  // run a handler from the kit without letting its error break the kit
  function safely(fn, arg) {
    try { return fn(arg); } catch (e) { console.error('T.ui: a handler failed.', e); }
    return undefined;
  }

  function sound(name, opts) {
    if (name !== false && T.fx) T.fx.sfx(name || 'tap', opts);
  }

  /* ---------- the environment: motion and theme ---------- */

  function media(query) {
    try { return !!(window.matchMedia && window.matchMedia(query).matches); } catch (e) { return false; }
  }

  // reduced motion, or the lowest effects tier (T.fx.still): the same answer everywhere
  function reducedMotion() {
    if (T.fx && T.fx.still) { try { return !!T.fx.still(); } catch (e) { /* fall back to the media query */ } }
    return media('(prefers-reduced-motion: reduce)');
  }

  // the theme that is showing now: the tokens know (--is-dark), so CSS and code never disagree
  function isDark() {
    try {
      const flag = getComputedStyle(document.documentElement).getPropertyValue('--is-dark').trim();
      if (flag === '1') return true;
      if (flag === '0') return false;
    } catch (e) { /* fall through */ }
    const chosen = document.documentElement.getAttribute('data-theme');
    return chosen ? chosen === 'dark' : media('(prefers-color-scheme: dark)');
  }

  // onTheme(fn): fn(isDark) runs whenever the theme changes. Returns a function that stops watching:
  // call it in your cleanup.
  function onTheme(fn) {
    let last = isDark();
    const check = function () {
      const now = isDark();
      if (now === last) return;
      last = now;
      safely(fn, now);
    };
    let observer = null, query = null;
    try {
      observer = new MutationObserver(check);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) { observer = null; }
    try {
      query = window.matchMedia('(prefers-color-scheme: dark)');
      if (query.addEventListener) query.addEventListener('change', check); else query.addListener(check);
    } catch (e) { query = null; }
    return function stop() {
      if (observer) observer.disconnect();
      if (query) {
        try { if (query.removeEventListener) query.removeEventListener('change', check); else query.removeListener(check); } catch (e) { /* gone */ }
      }
      observer = null;
      query = null;
    };
  }

  // children that arrive one after another (CSS class .stagger reads --i)
  function stagger(parent) {
    if (!parent) return parent;
    parent.classList.add('stagger');
    Array.prototype.forEach.call(parent.children, function (kid, i) { kid.style.setProperty('--i', String(i)); });
    return parent;
  }

  /* ---------- drawn icons: 24 x 24, one stroke style (see .icon in 20-components.css) ---------- */

  const SPEAKER = '<path d="M4 9.6v4.8h3.4l4.6 3.8V5.8L7.4 9.6z"/>';
  const ICONS = {
    back: '<path d="M19 12H5.5"/><path d="M11.5 5.5 5 12l6.5 6.5"/>',
    next: '<path d="M5 12h13.5"/><path d="M12.5 5.5 19 12l-6.5 6.5"/>',
    check: '<path d="M5 12.8l4.6 4.6L19 7.6"/>',
    cross: '<path d="M6.5 6.5l11 11"/><path d="M17.5 6.5l-11 11"/>',
    star: '<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
    heart: '<path d="M12 20.2C6.7 16.6 3.6 13.6 3.6 9.8c0-2.7 2.1-4.7 4.6-4.7 1.5 0 2.9.8 3.8 2 .9-1.2 2.3-2 3.8-2 2.5 0 4.6 2 4.6 4.7 0 3.8-3.1 6.8-8.4 10.4z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.6"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.6v2"/>',
    'sound-on': SPEAKER + '<path d="M15.6 9.2a4 4 0 0 1 0 5.6"/><path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    'sound-off': SPEAKER + '<path d="M16 9.6l4.8 4.8"/><path d="M20.8 9.6 16 14.4"/>',
    flip: '<path d="M4.5 10a7.6 7.6 0 0 1 13.4-3.2L20 9"/><path d="M20 4.5V9h-4.5"/><path d="M19.5 14a7.6 7.6 0 0 1-13.4 3.2L4 15"/><path d="M4 19.5V15h4.5"/>',
    speaker: SPEAKER + '<path d="M15.8 8.4c1.6 2 1.6 5.2 0 7.2"/>',
    vi: '<path d="M4.5 7l4 10.5L12.5 7"/><path d="M17.5 7v10.5"/>',
    replay: '<path d="M5 12a7 7 0 1 0 2.3-5.2"/><path d="M4.6 4.6v4.6h4.6"/>',
    home: '<path d="M4 11.4 12 4.5l8 6.9"/><path d="M6.2 10v9.5h11.6V10"/><path d="M10 19.5v-5h4v5"/>',
    trophy: '<path d="M8 4.5h8v4.8a4 4 0 0 1-8 0z"/><path d="M8 6.2H5.2a2.9 2.9 0 0 0 2.9 3.9"/><path d="M16 6.2h2.8a2.9 2.9 0 0 1-2.9 3.9"/><path d="M12 13.4v3.4"/><path d="M8.6 19.8h6.8"/>',
    pencil: '<path d="M4.5 19.5l1-4.2L15.8 5a1.9 1.9 0 0 1 2.7 0l.5.5a1.9 1.9 0 0 1 0 2.7L8.7 18.5z"/><path d="M14 6.8l3.2 3.2"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    chevron: '<path d="M6.5 9.5 12 15l5.5-5.5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.8h.01"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 16.9h.01"/>',
    map: '<path d="M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2z"/><path d="M9 4.5v13"/><path d="M15 6.5v13"/>',
    people: '<circle cx="8.5" cy="8" r="2.8"/><path d="M3.5 19c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="16.6" cy="9.4" r="2.2"/><path d="M15 14.3c2.9-.5 5.5 1.2 5.5 4.7"/>',
    device: '<rect x="7" y="3.5" width="10" height="17" rx="2.4"/><path d="M11 17.4h2"/>',
    shield: '<path d="M12 3.8l7 2.6v5.2c0 4.2-2.9 7.3-7 8.6-4.1-1.3-7-4.4-7-8.6V6.4z"/><path d="M9 12l2.2 2.2L15 10.4"/>',
    share: '<path d="M12 3.6v11"/><path d="M8.2 7.4 12 3.6l3.8 3.8"/><path d="M8.8 10.4H7a1.8 1.8 0 0 0-1.8 1.8v6.4A1.8 1.8 0 0 0 7 20.4h10a1.8 1.8 0 0 0 1.8-1.8v-6.4a1.8 1.8 0 0 0-1.8-1.8h-1.8"/>',
    // maths (Grade 3): counters and steppers, and the hint button
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    up: '<path d="M12 19V5.5"/><path d="M5.5 11.5 12 5l6.5 6.5"/>',
    down: '<path d="M12 5v13.5"/><path d="M5.5 12.5 12 19l6.5-6.5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.4 1.1 2.2h5c0-.8.3-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    print: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14.5h10V21H7z"/>'
  };

  // icon(name) -> a small inline <svg>. An unknown name gives a plain dot (never throws).
  // opts.label makes it speak for itself; without one the icon is hidden from screen readers.
  function icon(name, opts) {
    const key = String(name == null ? '' : name).replace(/[^a-z0-9-]/gi, '');
    const inner = Object.prototype.hasOwnProperty.call(ICONS, key) ? ICONS[key] : '<circle cx="12" cy="12" r="2.5"/>';
    const svg = parseSvg('<svg class="icon icon--' + key + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + inner + '</svg>');
    if (opts && opts.label) {
      svg.removeAttribute('aria-hidden');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', String(opts.label));
    }
    return svg;
  }

  // the red tile with the atom: the brand mark of the trail
  function brandMark() {
    return parseSvg('<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
      '<rect class="brand-mark__tile" width="40" height="40" rx="11"/>' +
      // ESL: a speech bubble with "Aa" (the English trail)
      '<path class="brand-mark__orbit" stroke-linejoin="round" d="M10 9h20a3.5 3.5 0 0 1 3.5 3.5v11a3.5 3.5 0 0 1-3.5 3.5h-10l-6 5v-5h-4a3.5 3.5 0 0 1-3.5-3.5v-11a3.5 3.5 0 0 1 3.5-3.5z"/>' +
      '<text class="brand-mark__core" x="20" y="22.2" text-anchor="middle" font-size="11.5" font-weight="800" font-family="Nunito, Segoe UI, sans-serif">Aa</text></svg>');
  }

  /* ---------- Zip the robot: four moods, never a voice ---------- */

  const ZIP_MOODS = { happy: 'M47 63 Q60 74 73 63', cheer: 'M45 61 Q60 81 75 61 Z', oops: 'M50 69 Q60 62 70 69', think: 'M52 67 L68 65' };
  // the two arms: hanging by the body, or thrown up beside the head (cheer)
  const ZIP_ARMS = { down: ['M36 102 Q20 106 14 92', 'M84 102 Q100 106 106 92'], up: ['M36 100 Q13 103 6 75', 'M84 100 Q107 103 114 75'] };
  const ZIP_BODY =
    '<g class="zip-halo">' +
      '<line x1="60" y1="24" x2="60" y2="11"/><circle cx="60" cy="9" r="7"/>' +
      '<rect x="9" y="46" width="12" height="22" rx="6"/><rect x="99" y="46" width="12" height="22" rx="6"/>' +
      '<path class="zip-arm-l" d="M36 102 Q20 106 14 92"/><path class="zip-arm-r" d="M84 102 Q100 106 106 92"/>' +
      '<rect x="34" y="92" width="52" height="30" rx="13"/><rect x="17" y="22" width="86" height="68" rx="24"/>' +
    '</g>' +
    '<line class="zip-ant" x1="60" y1="24" x2="60" y2="11"/><circle class="zip-bulb" cx="60" cy="9" r="7"/>' +
    '<rect class="zip-ear" x="9" y="46" width="12" height="22" rx="6"/><rect class="zip-ear" x="99" y="46" width="12" height="22" rx="6"/>' +
    '<path class="zip-arm zip-arm-l" d="M36 102 Q20 106 14 92"/><path class="zip-arm zip-arm-r" d="M84 102 Q100 106 106 92"/>' +
    '<rect class="zip-body" x="34" y="92" width="52" height="30" rx="13"/><circle class="zip-heart" cx="60" cy="107" r="6"/>' +
    '<rect class="zip-head" x="17" y="22" width="86" height="68" rx="24"/>' +
    '<path class="zip-shine" d="M22.5 44 Q23 28 41 27"/>' +
    '<rect class="zip-face" x="27" y="33" width="66" height="46" rx="16"/>' +
    '<g class="zip-look"><g class="zip-eyes"><ellipse cx="46" cy="52" rx="6" ry="7.5"/><ellipse cx="74" cy="52" rx="6" ry="7.5"/></g>' +
    '<circle class="zip-glint" cx="48" cy="49" r="2"/><circle class="zip-glint" cx="76" cy="49" r="2"/></g>' +
    '<circle class="zip-cheek" cx="36" cy="66" r="4.5"/><circle class="zip-cheek" cx="84" cy="66" r="4.5"/>';

  function moodName(mood) {
    return Object.prototype.hasOwnProperty.call(ZIP_MOODS, mood) ? mood : 'happy';
  }

  // the face and the arms of a mood
  function poseZip(svg, name) {
    const arms = ZIP_ARMS[name === 'cheer' ? 'up' : 'down'];
    Object.keys(ZIP_MOODS).forEach(function (m) { svg.classList.remove('zip--' + m); });
    svg.classList.add('zip--' + name);
    svg.setAttribute('data-mood', name);
    const mouth = svg.querySelector('.zip-mouth');
    if (mouth) mouth.setAttribute('d', ZIP_MOODS[name]);
    Array.prototype.forEach.call(svg.querySelectorAll('.zip-arm-l'), function (arm) { arm.setAttribute('d', arms[0]); });
    Array.prototype.forEach.call(svg.querySelectorAll('.zip-arm-r'), function (arm) { arm.setAttribute('d', arms[1]); });
  }

  // zip(mood) -> svg. mood: 'happy' | 'cheer' | 'oops' | 'think'
  function zip(mood) {
    const svg = parseSvg('<svg class="zip" viewBox="0 0 120 128" aria-hidden="true" focusable="false">' +
      ZIP_BODY + '<path class="zip-mouth" d="' + ZIP_MOODS.happy + '"/></svg>');
    poseZip(svg, moodName(mood));
    return svg;
  }

  // change the face of a Zip that is already on screen; react = a small hop (cheer) or wobble (oops)
  function zipMood(svg, mood, react) {
    if (!svg || !svg.classList) return svg;
    const name = moodName(mood);
    const before = svg.getAttribute('data-mood');
    poseZip(svg, name);
    if (react && name !== before && (name === 'cheer' || name === 'oops')) {
      const move = name === 'cheer' ? 'is-hop' : 'is-wobble';
      svg.classList.remove('is-hop', 'is-wobble');
      void svg.getBoundingClientRect();                 // so that the move starts again
      svg.classList.add(move);
      setTimeout(function () { svg.classList.remove(move); }, 700);
    }
    return svg;
  }

  /* ---------- drawings: T.ui.art(id, opts) ----------
     window.T_ART[id] is the markup of one drawing. Many copies of many drawings live in one page,
     so every copy gets its own ids: id="x", url(#x) and href="#x" are renamed together. */

  let artCopies = 0;
  // the box of a drawing we do not have yet, guessed from its id
  const MISSING_BOX = [[/^badge-/, [200, 200]], [/^icon-/, [96, 96]], [/^world-/, [800, 450]], [/^kit-skeleton/, [320, 660]]];

  // Styles inside an inlined drawing are global to the page. A rule that points at an id
  // (fill:url(#x)) would make every copy use the gradient of the last copy, so such rules are tied
  // to their own copy: the selector gets :where([data-uid="u7"]), which adds no weight.
  function scopeStyle(css, tag, rename) {
    if (css.indexOf('url(') < 0) return css;
    const scope = ':where([data-uid="' + tag + '"])';
    return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^{}]+)\{([^{}]*url\(\s*['"]?#[^{}]*)\}/g, function (whole, selector, body) {
      const decls = body.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g, function (m, quote, id) { return 'url(#' + rename(id) + ')'; });
      const list = selector.trim();
      if (/^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(list)) return list + '{' + decls + '}';   // a keyframe
      return list.split(',').map(function (one) {
        const s = one.trim();
        const head = /^([^\s>+~]+)([\s\S]*)$/.exec(s);
        // the first part of a selector may be the drawing itself (.art.is-playing .x) or something in it (.x)
        return scope + ' ' + s + '{' + decls + '}' + (head ? head[1] + scope + head[2] + '{' + decls + '}' : '');
      }).join('');
    });
  }

  // Every drawing declares its palette on the shared class: .art{--bone:…}. Inlined, that rule is
  // global, so the palette of one drawing could repaint another. Each palette is tied to its own
  // drawing: .art[data-art="w-jaw"]{…}. Only the bare .art rule is touched.
  function scopePalette(css, id) {
    return css.replace(/(^|\})\s*\.art\s*\{/g, function (m, before) { return before + '.art[data-art="' + id + '"]{'; });
  }

  function uniqueIds(markup, tag, id) {
    const names = {};
    let found = false;
    markup.replace(/\sid="([^"]+)"/g, function (m, name) { names[name] = name + '-' + tag; found = true; return m; });
    const rename = function (name) { return Object.prototype.hasOwnProperty.call(names, name) ? names[name] : name; };
    let out = markup.replace(/<svg\b/, '<svg data-uid="' + tag + '"');
    out = out.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, function (m, open, css, close) {
      const scoped = /^[\w-]+$/.test(id) ? scopePalette(css, id) : css;
      return open + (found ? scopeStyle(scoped, tag, rename) : scoped) + close;
    });
    if (!found) return out;
    return out
      .replace(/(\sid=")([^"]+)(")/g, function (m, a, id, b) { return a + rename(id) + b; })
      .replace(/((?:xlink:)?href=")#([^"]+)(")/g, function (m, a, id, b) { return a + '#' + rename(id) + b; })
      .replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g, function (m, quote, id) { return 'url(#' + rename(id) + ')'; });
  }

  // a neat neutral plate for a drawing that has not arrived yet: it shows the id
  function missingArt(id) {
    const name = String(id == null ? '' : id);
    let size = [400, 300];
    MISSING_BOX.forEach(function (rule) { if (rule[0].test(name)) size = rule[1]; });
    const w = size[0], h = size[1], unit = Math.min(w, h) / 10, cx = w / 2, cy = h / 2;
    const round = /^badge-/.test(name);
    const frame = round
      ? '<circle class="art-missing__box" cx="' + cx + '" cy="' + cy + '" r="' + (Math.min(w, h) / 2 - 3) + '"/>'
      : '<rect class="art-missing__box" x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" rx="' + (unit * 0.8) + '"/>';
    const sign = '<g class="art-missing__glyph" transform="translate(' + cx + ' ' + (cy - unit * 0.9) + ') scale(' + (unit / 14).toFixed(3) + ')">' +
      '<rect x="-26" y="-20" width="52" height="40" rx="7"/><path d="M-24 13l14-14 10 10 8-8 16 15"/><circle cx="12" cy="-7" r="4.5"/></g>';
    const fontSize = Math.min(unit * 1.15, (w * 0.84) / Math.max(1, name.length * 0.62));
    const text = '<text class="art-missing__id" x="' + cx + '" y="' + (cy + unit * 2.7) + '" font-size="' + fontSize.toFixed(1) + '">' + esc(name) + '</text>';
    return parseSvg('<svg class="art art--missing" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Picture coming soon" data-art="' + esc(name) +
      '" data-missing="true">' + frame + sign + text + '</svg>');
  }

  // show only some regions of a drawing that names its parts with data-bone, data-organ or data-part
  // (kit-skeleton does), and crop the picture to them
  function showOnly(svg, names, opts) {
    const wanted = [].concat(names).map(String);
    const groups = svg.querySelectorAll('[data-bone],[data-organ],[data-part]');
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    Array.prototype.forEach.call(groups, function (g) {
      const name = g.getAttribute('data-bone') || g.getAttribute('data-organ') || g.getAttribute('data-part');
      const named = wanted.indexOf(name) >= 0;
      const keep = named || (opts.ghost === true && name === 'ghost');
      if (g.hasAttribute('data-organ')) g.classList.toggle('is-on', keep);
      else g.style.display = keep ? '' : 'none';
      const box = named ? g.getAttribute('data-box') : null;
      if (!box) return;
      const b = box.split(',').map(Number);
      x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]);
      x1 = Math.max(x1, b[0] + b[2]); y1 = Math.max(y1, b[1] + b[3]);
    });
    if (x1 < x0) return;
    const pad = opts.pad == null ? 8 : Number(opts.pad) || 0;
    svg.setAttribute('viewBox', [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].join(' '));
  }

  // art(id, opts) -> an inline <svg>. Never throws: an unknown id gives the placeholder.
  // opts: play (run its animation now), grey, label (aria label), decorative (hide from screen readers),
  //       cls (extra classes), only + pad + ghost (one region of a kit drawing)
  function art(id, opts) {
    opts = opts || {};
    const source = window.T_ART && typeof window.T_ART[id] === 'string' ? window.T_ART[id] : null;
    let svg = null;
    if (source) {
      artCopies += 1;
      try { svg = parseSvg(uniqueIds(source, 'u' + artCopies.toString(36), String(id))); } catch (e) { svg = null; }
    }
    if (!svg) svg = missingArt(id);
    svg.classList.add('art');
    svg.setAttribute('data-art', String(id));
    svg.setAttribute('focusable', 'false');
    addClasses(svg, opts.cls);
    if (opts.grey) svg.classList.add('art--grey');
    if (opts.label != null) svg.setAttribute('aria-label', String(opts.label));
    if (opts.decorative) { svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role'); svg.removeAttribute('aria-label'); }
    if (opts.only != null) safely(function () { showOnly(svg, opts.only, opts); });
    if (opts.play) playArt(svg);
    return svg;
  }

  const playTimers = new WeakMap();

  function canPlay(svg) {
    return !!svg && !!svg.getAttribute && Number(svg.getAttribute('data-anim-ms')) > 0 && !reducedMotion();
  }

  // playArt(svg): run the drawing's animation once. is-playing goes on at the next frame and comes
  // off after data-anim-ms plus 100ms. Nothing happens under reduced motion. -> true if it will play
  function playArt(svg) {
    if (!canPlay(svg)) return false;
    const ms = Number(svg.getAttribute('data-anim-ms'));
    clearTimeout(playTimers.get(svg));
    svg.classList.remove('is-playing');
    let waited = 0;
    const start = function () {
      if (!svg.isConnected && waited++ < 90) { requestAnimationFrame(start); return; }   // wait until it is on the page
      svg.classList.add('is-playing');
      playTimers.set(svg, setTimeout(function () { svg.classList.remove('is-playing'); }, ms + 100));
    };
    requestAnimationFrame(start);
    return true;
  }

  // plate(artOrId, opts) -> the light art plate around a drawing. Tapping it replays the drawing.
  // opts: size 'xs'|'sm'|'md'|'lg', shape 'square'|'wide'|'tall'|'round'|'fill'|'bleed' (several: 'round bleed'),
  //       play, replay:false (no tap to replay: use it inside another button), grey, label, cls, only, pad, ghost
  function plate(artOrId, opts) {
    opts = opts || {};
    const drawing = typeof artOrId === 'string'
      ? art(artOrId, { grey: opts.grey, label: opts.label, only: opts.only, pad: opts.pad, ghost: opts.ghost })
      : artOrId;
    const box = el('span', { class: ['art-plate', opts.size && 'art-plate--' + opts.size, opts.cls] });   // a span: it may sit inside a button
    String(opts.shape || '').split(/\s+/).filter(Boolean).forEach(function (shape) { box.classList.add('art-plate--' + shape); });
    if (drawing instanceof Node) box.appendChild(drawing);
    if (opts.replay !== false && canPlay(drawing)) makeReplayable(box, drawing);
    if (opts.play) playArt(drawing);
    return box;
  }

  function makeReplayable(box, drawing) {
    const name = drawing.getAttribute('aria-label') || 'Picture.';
    box.classList.add('is-replayable');
    box.setAttribute('role', 'button');
    box.setAttribute('tabindex', '0');
    box.setAttribute('aria-label', name + ' Tap to see it move again.');
    drawing.setAttribute('aria-hidden', 'true');
    box.appendChild(el('span', { class: 'art-plate__replay', 'aria-hidden': 'true' }, icon('replay')));
    const replay = function () { playArt(drawing); };
    box.addEventListener('click', replay);
    box.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      replay();
    });
  }

  /* ---------- buttons ---------- */

  const KINDS = ['primary', 'secondary', 'quiet', 'good', 'danger'];

  // button({label, kind, icon, onClick, big}) -> <button>
  // more: sub (a small second line), iconEnd (an icon after the label), disabled, full (as wide as its box),
  //       aria (aria-label), cls, sfx (a sound name; false = silent; default 'tap')
  function button(opts) {
    opts = opts || {};
    const kind = KINDS.indexOf(opts.kind) >= 0 ? opts.kind : 'secondary';
    const label = el('span', { class: 'btn__label' }, opts.label == null ? '' : opts.label);
    const text = opts.sub ? el('span', { class: 'btn__text' }, label, el('span', { class: 'btn__sub' }, opts.sub)) : label;
    const node = el('button', {
      type: 'button',
      class: ['btn', 'btn--' + kind, opts.big && 'btn--big', opts.full && 'btn--full', opts.cls],
      disabled: !!opts.disabled,
      'aria-label': opts.aria || null
    }, opts.icon ? icon(opts.icon) : null, text, opts.iconEnd ? icon(opts.iconEnd) : null);
    node.addEventListener('click', function (event) {
      sound(opts.sfx);
      if (typeof opts.onClick === 'function') opts.onClick(event);
    });
    return node;
  }

  // iconButton({icon, label, onClick}) -> a square button with only a drawn icon; label is its aria-label
  // more: kind 'band' (on the dark top bar) | 'float' (over a picture), cls, sfx
  function iconButton(opts) {
    opts = opts || {};
    const node = el('button', {
      type: 'button',
      class: ['icon-btn', opts.kind && 'icon-btn--' + opts.kind, opts.cls],
      'aria-label': opts.label || opts.icon || 'Button'
    }, icon(opts.icon));
    node.addEventListener('click', function (event) {
      sound(opts.sfx);
      if (typeof opts.onClick === 'function') opts.onClick(event);
    });
    return node;
  }

  // the ONE sound switch: every copy on the page shows the saved value of T.fx.on
  function soundSwitch(opts) {
    opts = opts || {};
    const node = iconButton({
      icon: 'sound-on', label: 'Sound', kind: opts.kind, cls: 'sound-switch ' + (opts.cls || ''), sfx: false,
      onClick: function () {
        const on = T.fx.toggle();
        syncSound();
        if (on) T.fx.sfx('pop');
      }
    });
    node.appendChild(icon('sound-off'));
    paintSound(node);
    return node;
  }

  function paintSound(node) {
    const on = !!T.fx.on;
    node.classList.toggle('is-off', !on);
    node.setAttribute('aria-pressed', String(on));
    node.setAttribute('title', on ? 'Sound is on' : 'Sound is off');
  }

  function syncSound() {
    $$('.sound-switch').forEach(paintSound);
  }

  // choice({label, art, onClick}) -> a big answer button. States are classes that the caller sets:
  // is-picked (chosen, not checked yet), is-right, is-wrong (soft coral and a small shake), is-dim (out of play)
  // more: layout 'row' | 'tile' (picture on top) | 'word' (one centred word), value (data-value), aria, cls, sfx
  function choice(opts) {
    opts = opts || {};
    const hasLabel = opts.label != null && opts.label !== '';
    const layout = opts.layout || (opts.art && !hasLabel ? 'tile' : 'row');
    let picture = null;
    if (opts.art) {
      const drawing = typeof opts.art === 'string' ? art(opts.art, { decorative: hasLabel }) : opts.art;
      picture = el('span', { class: 'choice__art' }, drawing);
    }
    const node = el('button', {
      type: 'button',
      class: ['choice', layout !== 'row' && 'choice--' + layout, opts.cls],
      'aria-label': opts.aria || null,
      dataset: opts.value == null ? null : { value: opts.value }
    }, picture, hasLabel ? el('span', { class: 'choice__label' }, opts.label) : null,
      el('span', { class: 'choice__mark', 'aria-hidden': 'true' }, icon('check'), icon('cross')));
    node.addEventListener('click', function (event) {
      sound(opts.sfx);
      if (typeof opts.onClick === 'function') opts.onClick(event);
    });
    return node;
  }

  /* ---------- the bottom action bar: the ONE main button of a screen ----------
     actionBar() -> {el, primary(opts), secondary(opts)}. primary(null) hides the button; the bar hides
     itself when it is empty. The main button is ONE element that is updated in place, so the focus
     stays on it, and for a moment after its label changes it ignores taps (a child who taps "Check"
     twice does not skip the answer). */

  const TAP_GUARD_MS = 280;

  function actionBar() {
    const inner = el('div', { class: 'actionbar__inner' });
    const bar = el('footer', { class: 'actionbar', hidden: true }, inner);
    const main = { node: null, opts: null, since: 0 };
    const side = { node: null, opts: null };

    function show() {
      const wasHidden = bar.hidden;
      bar.hidden = !main.opts && !side.opts;
      if (wasHidden && !bar.hidden) {
        bar.classList.remove('is-entering');
        void bar.offsetWidth;
        bar.classList.add('is-entering');
      }
    }

    function fillButton(node, opts, kind, big) {
      empty(node);
      node.className = 'btn btn--' + kind + (big ? ' btn--big actionbar__primary' : ' actionbar__secondary') + (opts.cls ? ' ' + opts.cls : '');
      node.disabled = !!opts.disabled;
      if (opts.aria) node.setAttribute('aria-label', opts.aria); else node.removeAttribute('aria-label');
      if (opts.icon) node.appendChild(icon(opts.icon));
      const label = el('span', { class: 'btn__label' }, opts.label == null ? '' : opts.label);
      node.appendChild(opts.sub ? el('span', { class: 'btn__text' }, label, el('span', { class: 'btn__sub' }, opts.sub)) : label);
      if (opts.iconEnd) node.appendChild(icon(opts.iconEnd));
    }

    function primary(opts) {
      if (!opts) {
        if (main.node) main.node.hidden = true;
        main.opts = null;
        show();
        return null;
      }
      if (!main.node) {
        main.node = el('button', { type: 'button' });
        main.node.addEventListener('click', function (event) {
          if (!main.opts || Date.now() - main.since < TAP_GUARD_MS) return;
          sound(main.opts.sfx);
          if (typeof main.opts.onClick === 'function') main.opts.onClick(event);
        });
        inner.appendChild(main.node);
      }
      const changed = !main.opts || main.opts.label !== opts.label;
      if (changed) main.since = Date.now();
      main.opts = opts;
      main.node.hidden = false;
      fillButton(main.node, opts, KINDS.indexOf(opts.kind) >= 0 ? opts.kind : 'primary', true);
      show();
      return main.node;
    }

    function secondary(opts) {
      if (!opts) {
        if (side.node) side.node.hidden = true;
        side.opts = null;
        show();
        return null;
      }
      if (!side.node) {
        side.node = el('button', { type: 'button' });
        side.node.addEventListener('click', function (event) {
          if (!side.opts) return;
          sound(side.opts.sfx);
          if (typeof side.opts.onClick === 'function') side.opts.onClick(event);
        });
        inner.insertBefore(side.node, inner.firstChild);
      }
      side.opts = opts;
      side.node.hidden = false;
      fillButton(side.node, opts, KINDS.indexOf(opts.kind) >= 0 ? opts.kind : 'quiet', false);
      show();
      return side.node;
    }

    return { el: bar, primary: primary, secondary: secondary };
  }

  /* ---------- meters: stars, hearts, dots, the bar (all drawn, never text glyphs) ---------- */

  function starPath(cx, cy, outer, inner) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2, r = i % 2 ? inner : outer;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ' ' + (cy + Math.sin(a) * r).toFixed(2);
    }
    return d + 'Z';
  }
  const STAR = '<path d="' + starPath(12, 12.7, 10.3, 5) + '"/><path class="star__shine" d="M10.2 9.3l1.3-3.2"/>';
  const HEART = '<path d="M12 20.6C6.5 16.9 3.2 13.7 3.2 9.7c0-2.8 2.2-4.9 4.8-4.9 1.6 0 3.1.8 4 2.2.9-1.4 2.4-2.2 4-2.2 2.6 0 4.8 2.1 4.8 4.9 0 4-3.3 7.2-8.8 10.9z"/>' +
    '<path class="heart__shine" d="M6.5 8.9c.4-1 1.1-1.6 2-1.8"/>';

  function pip(kind, on) {
    const svg = parseSvg('<svg class="' + kind + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (kind === 'star' ? STAR : HEART) + '</svg>');
    if (on) svg.classList.add('is-on');
    return svg;
  }

  function pips(kind, n, max, opts) {
    opts = opts || {};
    const total = wholeNumber(max == null ? 3 : max, 1, 12);
    const count = wholeNumber(n, 0, total);
    const box = el('span', { class: [kind + 's', opts.size && kind + 's--' + opts.size, opts.cls], role: 'img', 'aria-label': count + ' of ' + total + ' ' + kind + 's' });
    for (let i = 0; i < total; i++) box.appendChild(pip(kind, i < count));
    return box;
  }

  // stars(n, max = 3) -> n gold stars of max. opts.size: 'sm' | 'lg'
  function stars(n, max, opts) { return pips('star', n, max, opts); }
  // hearts(n, max = 3) -> n red hearts of max
  function hearts(n, max, opts) { return pips('heart', n, max, opts); }

  function fillDots(box, i, n, asText, count) {
    const total = wholeNumber(n, 1, 99), now = wholeNumber(i, 0, total);
    empty(box);
    box.setAttribute('aria-label', now + ' of ' + total + (count ? ' done' : ''));
    box.setAttribute('data-i', String(now));
    box.setAttribute('data-n', String(total));
    if (count) box.setAttribute('data-count', '1'); else box.removeAttribute('data-count');
    if (asText || total > 10) {
      box.appendChild(el('span', { class: 'dots__text', 'aria-hidden': 'true' }, now + ' of ' + total));
      return;
    }
    for (let k = 1; k <= total; k++) {
      const done = count ? k <= now : k < now;
      box.appendChild(el('span', { class: ['dot', done && 'is-done', !count && k === now && 'is-now'], 'aria-hidden': 'true' }));
    }
  }

  // dots(i, n) -> n dots: the ones before i are done, dot i is "now". More than 10 (or opts.text) reads "3 of 12".
  // opts.count: i is how many are done (the test paper: questions answered), so dots 1 to i are all done.
  function dots(i, n, opts) {
    const box = el('span', { class: ['dots', opts && opts.cls], role: 'img' });
    fillDots(box, i, n, !!(opts && opts.text), !!(opts && opts.count));
    return box;
  }

  // bar(fraction) -> a progress bar, fraction 0 to 1
  function bar(fraction, opts) {
    const f = T.util.clamp(fraction, 0, 1);
    return el('span', {
      class: ['bar', opts && opts.cls], role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(f * 100))
    }, el('span', { class: 'bar__fill', style: { '--f': String(f) } }));
  }

  // meter(el, value, max?) -> change a meter that is on screen: stars and hearts take n, dots take i (and n),
  // a bar takes a fraction. A heart or star that changes gives a small pop.
  function meter(node, value, max) {
    if (!node || !node.classList) return node;
    if (node.classList.contains('bar')) {
      const f = T.util.clamp(value, 0, 1);
      node.setAttribute('aria-valuenow', String(Math.round(f * 100)));
      if (node.firstElementChild) node.firstElementChild.style.setProperty('--f', String(f));
    } else if (node.classList.contains('dots')) {
      fillDots(node, value, max == null ? node.getAttribute('data-n') : max, !!node.querySelector('.dots__text') && max == null, node.getAttribute('data-count') === '1');
    } else {
      const kind = node.classList.contains('hearts') ? 'heart' : 'star';
      const items = $$('.' + kind, node);
      const count = wholeNumber(value, 0, items.length);
      items.forEach(function (item, i) {
        const on = i < count;
        if (on !== item.classList.contains('is-on')) {
          item.classList.toggle('is-on', on);
          item.classList.remove('is-pop');
          void item.getBoundingClientRect();
          item.classList.add('is-pop');
        }
      });
      node.setAttribute('aria-label', count + ' of ' + items.length + ' ' + kind + 's');
    }
    return node;
  }

  // revealStars(starsEl, n, {onDone}) -> light n stars one after another, with a chime and sparkles each.
  // Returns a function that cancels what has not happened yet (call it in your cleanup).
  function revealStars(box, n, opts) {
    opts = opts || {};
    const items = box ? $$('.star', box) : [];
    const count = wholeNumber(n, 0, items.length);
    const done = function () { if (typeof opts.onDone === 'function') safely(opts.onDone, count); };
    if (box) box.setAttribute('aria-label', count + ' of ' + items.length + ' stars');
    if (reducedMotion()) {
      items.forEach(function (item, i) { item.classList.toggle('is-on', i < count); });
      if (count) sound('star');
      const wait = setTimeout(done, 300);
      return function () { clearTimeout(wait); };
    }
    const timers = [];
    const light = function (i) {
      items[i].classList.add('is-on', 'is-pop');
      const r = items[i].getBoundingClientRect();
      if (r.width) T.fx.sparkle(r.left + r.width / 2, r.top + r.height / 2, 10);
      sound('chime', { i: 5 + i });
    };
    for (let i = 0; i < count; i++) timers.push(setTimeout(light, 450 + i * 340, i));
    timers.push(setTimeout(done, 450 + count * 340 + 300));
    return function cancel() { timers.forEach(clearTimeout); };
  }

  // countUp(node, to, {from, ms, format}) -> cancel(). The number in node counts up (or down) to `to`, eased,
  // and pops once when it lands (class is-tick). Still (reduced motion or tier 1): the final number at once.
  // format(n) -> text (default: the number). Phase 5: the Marks box of the test paper.
  function countUp(node, to, opts) {
    opts = opts || {};
    const fmt = typeof opts.format === 'function' ? opts.format : function (n) { return String(n); };
    const end = Math.round(Number(to) || 0);
    const from = Math.round(Number(opts.from) || 0);
    if (!node) return noop;
    const land = function () {
      node.textContent = fmt(end);
      node.classList.remove('is-tick');
      if (!reducedMotion()) { void node.offsetWidth; node.classList.add('is-tick'); }
    };
    if (reducedMotion() || from === end || typeof requestAnimationFrame !== 'function') { land(); return noop; }
    const ms = Math.max(150, Number(opts.ms) || Math.min(700, 120 + Math.abs(end - from) * 60));
    let raf = 0, t0 = 0, stopped = false;
    const frame = function (now) {
      if (stopped) return;
      if (!node.isConnected) { stopped = true; return; }
      if (!t0) t0 = now;
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      if (k >= 1) { land(); return; }
      node.textContent = fmt(Math.round(from + (end - from) * e));
      raf = requestAnimationFrame(frame);
    };
    node.textContent = fmt(from);
    raf = requestAnimationFrame(frame);
    return function cancel() { if (stopped) return; stopped = true; cancelAnimationFrame(raf); land(); };
  }

  /* ---------- text: highlights, key words, the instruction strip ---------- */

  // richText('Tap the *skull*. Your [[skeleton]] is all your [[bones|bones]].') -> a fragment:
  // *words* become a gold highlight that sweeps in; [[key]] or [[shown|key]] becomes a key word
  // that opens its word card. Everything else stays plain text (never markup).
  const TRAILING = /^[.,;:!?…)’”"']+/;          // punctuation that must stay with the highlighted word before it
  function richText(str) {
    const frag = document.createDocumentFragment();
    const text = String(str == null ? '' : str);
    const pattern = /\*([^*\n]+)\*|\[\[([^\]\n]+)\]\]/g;
    let at = 0, found = null, marks = 0, lastKw = null, lastKwEnd = -1;
    while ((found = pattern.exec(text))) {
      if (found.index > at) frag.appendChild(document.createTextNode(text.slice(at, found.index)));
      at = found.index + found[0].length;
      if (found[1] != null) {
        // punctuation right after a highlight goes with its last word: "to a *stigma*." never wraps as "stigma / ."
        const tail = TRAILING.exec(text.slice(at));
        marks = highlight(frag, found[1], marks, tail ? tail[0] : '');
        if (tail) { at += tail[0].length; pattern.lastIndex = at; }
      } else {
        // two key words with only a space or a sign between them ("[[solute]] [[dissolves|dissolve]]"): their
        // wide tap targets would overlap, so the facing sides lose the extra width (R3B-03)
        const kw = keyWord(found[2]);
        if (lastKw && /^[\s.,;:!?]{0,3}$/.test(text.slice(lastKwEnd, found.index))) {
          lastKw.classList.add('kw--snug-r');
          kw.classList.add('kw--snug-l');
        }
        frag.appendChild(kw);
        lastKw = kw;
        lastKwEnd = at;
      }
    }
    if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
    return frag;
  }

  // One mark per word, so a highlighted phrase can still wrap. A word that is followed by another
  // keeps its space inside its own mark (hl--join), so the strokes meet exactly and never overlap.
  // The last word and the punctuation after it (`tail`) share a span.hl-end that does not break.
  function highlight(frag, phrase, first, tail) {
    const words = phrase.split(/\s+/).filter(Boolean);
    words.forEach(function (word, k) {
      const last = k === words.length - 1;
      const mark = el('mark', { class: ['hl', !last && 'hl--join'], style: { '--hl-i': String(first + k) } }, last ? word : word + ' ');
      frag.appendChild(last && tail ? el('span', { class: 'hl-end' }, mark, tail) : mark);
    });
    return first + words.length;
  }

  function keyWord(spec) {
    const parts = String(spec).split('|');
    const shown = parts[0].trim(), key = (parts.length > 1 ? parts[1] : parts[0]).trim();
    const node = el('span', { class: 'kw', role: 'button', tabindex: '0', 'aria-haspopup': 'dialog', dataset: { word: key } }, shown);
    const open = function () { sound('tap'); wordCard(key); };
    node.addEventListener('click', open);
    node.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
    return node;
  }

  // viButton(onToggle) -> the small "VI" button. onToggle(open) runs on every tap.
  function viButton(onToggle) {
    const node = el('button', { type: 'button', class: 'vi-btn', 'aria-pressed': 'false', 'aria-label': 'Vietnamese', title: 'Tiếng Việt' },
      el('span', { class: 'vi-btn__pill', 'aria-hidden': 'true' }, 'VI'));
    node.addEventListener('click', function () {
      const open = node.getAttribute('aria-pressed') !== 'true';
      node.setAttribute('aria-pressed', String(open));
      sound(open ? 'pop' : 'tap');
      if (typeof onToggle === 'function') onToggle(open);
    });
    return node;
  }

  function restart(node, name) {
    node.classList.remove(name);
    void node.offsetWidth;
    node.classList.add(name);
  }

  // instruction({en, vi, mood}) -> {el, set({en, vi, mood}), zip(mood)}
  // The Zip strip: a small Zip and ONE line. *words* are highlighted. The VI button shows the
  // Vietnamese line under the English one (tap again to hide); it stays open when the line changes.
  // A soft 'pop' plays when the English line changes. more: zip:false + plain:true (two plain lines
  // with a VI button, no Zip, no plate), sound:false, cls
  function instruction(opts) {
    opts = opts || {};
    const withZip = opts.zip !== false;
    const quiet = opts.sound === false || opts.plain === true;
    const viId = uid('vi');
    const robot = withZip ? zip(opts.mood) : null;
    const en = el('p', { class: 'instruct__en' });
    const vi = el('p', { class: 'instruct__vi', lang: 'vi', id: viId, hidden: true });
    const now = { en: '', vi: '' };
    let open = false;
    const toggle = viButton(function (isOpen) {
      open = isOpen;
      showVi();
      if (open) restart(vi, 'is-fresh');
    });
    toggle.setAttribute('aria-controls', viId);
    const root = el('div', { class: ['instruct', opts.plain && 'instruct--plain', opts.cls] },
      robot ? el('span', { class: 'instruct__zip' }, robot) : null,
      el('div', { class: 'instruct__text', 'aria-live': 'polite' }, en, vi),
      toggle);

    function showVi() {
      vi.hidden = !(open && now.vi);
      toggle.hidden = !now.vi;
    }

    function set(next) {
      next = next || {};
      let changed = false;
      if (next.en !== undefined) {
        const text = String(next.en == null ? '' : next.en);
        changed = text !== now.en;
        now.en = text;
        empty(en).appendChild(richText(text));
      }
      if (next.vi !== undefined) {
        now.vi = String(next.vi == null ? '' : next.vi);
        empty(vi).appendChild(richText(now.vi));
      }
      if (next.mood && robot) zipMood(robot, next.mood, true);
      showVi();
      if (changed) {
        restart(en, 'is-fresh');
        if (!quiet && now.en) sound('pop');
      }
      return api;
    }

    const api = {
      el: root,
      set: set,
      zip: function (mood) { if (robot) zipMood(robot, mood, true); return api; }
    };
    set({ en: opts.en == null ? '' : opts.en, vi: opts.vi == null ? '' : opts.vi });
    return api;
  }

  /* ---------- overlays: one way in and out for dialogs, the celebration and the word card ---------- */

  const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const overlays = [];                 // the open ones: {close}
  let modals = 0;

  function overlayRoot() {
    return T.shell ? T.shell.app : document.body;
  }

  function focusables(root) {
    return $$(FOCUSABLE, root).filter(function (node) { return node.getClientRects().length > 0; });
  }

  // the screen behind a modal takes no focus and is not read
  function holdScreen(on) {
    const screen = T.shell && T.shell.screen;
    if (!screen) return;
    if (on) { screen.setAttribute('inert', ''); screen.setAttribute('aria-hidden', 'true'); }
    else { screen.removeAttribute('inert'); screen.removeAttribute('aria-hidden'); }
  }

  // Put a modal layer on the page: focus moves in and is kept in (Tab cycles), Escape closes,
  // a tap on the shade closes (unless dismiss is false), focus goes back where it was. -> {el, close}
  function openOverlay(layer, box, opts) {
    const before = document.activeElement;
    let closed = false;

    function onKey(event) {
      if (overlays[overlays.length - 1] !== handle) return;          // only the top layer listens
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables(box);
      if (!items.length) { event.preventDefault(); box.focus(); return; }
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (event.shiftKey && (active === first || !box.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !box.contains(active))) { event.preventDefault(); first.focus(); }
    }

    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      const at = overlays.indexOf(handle);
      if (at >= 0) overlays.splice(at, 1);
      modals = Math.max(0, modals - 1);
      if (!modals) holdScreen(false);
      if (before && before.isConnected && typeof before.focus === 'function') {
        try { before.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ }
      }
      if (reducedMotion()) { if (layer.parentNode) layer.parentNode.removeChild(layer); }
      else {
        layer.classList.add('is-leaving');
        setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 170);
      }
      if (typeof opts.onClose === 'function') safely(opts.onClose);
    }

    const handle = { el: box, close: close };
    overlayRoot().appendChild(layer);
    overlays.push(handle);
    const target = box.querySelector('[data-autofocus]') || focusables(box)[0] || box;
    try { target.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ }
    modals += 1;
    holdScreen(true);
    document.addEventListener('keydown', onKey, true);
    if (opts.dismiss !== false) layer.addEventListener('click', function (event) { if (event.target === layer) close(); });
    return handle;
  }

  // close every dialog, word card, celebration and toast (every screen does this when it is left)
  function closeOverlays() {
    overlays.slice().forEach(function (handle) { handle.close(); });
    $$('.toasts').forEach(function (box) { if (box.parentNode) box.parentNode.removeChild(box); });
  }

  // dialog({title, body, actions}) -> {el, close}
  // body: a string, a node or a list of nodes. actions: [{label, kind, onClick, keepOpen}] (an action
  // closes the dialog first unless keepOpen). more: onClose, sheet (rises from the bottom on a phone),
  // dismiss:false (no closing by a tap outside), closeButton:false, label (aria-label when there is no title), cls,
  // inline:true (only build the box and return it: for the gallery; dialog, wordCard, celebrate and toast take it)
  function dialog(opts) {
    opts = opts || {};
    const titleId = uid('dialog');
    const box = el('div', { class: ['dialog', opts.cls], role: 'dialog', 'aria-modal': 'true', tabindex: '-1' });
    let handle = null;
    if (opts.title) {
      box.setAttribute('aria-labelledby', titleId);
      box.appendChild(el('h2', { class: 'dialog__title', id: titleId }, opts.title));
    } else {
      box.setAttribute('aria-label', opts.label || 'Message');
    }
    if (opts.body != null) box.appendChild(el('div', { class: 'dialog__body' }, typeof opts.body === 'string' ? el('p', opts.body) : opts.body));
    const actions = [].concat(opts.actions || []).filter(Boolean);
    if (actions.length) {
      box.appendChild(el('div', { class: 'dialog__actions' }, actions.map(function (action, i) {
        const node = button({
          label: action.label, kind: action.kind || (i === actions.length - 1 ? 'primary' : 'secondary'), icon: action.icon,
          onClick: function (event) {
            if (!action.keepOpen && handle) handle.close();
            if (typeof action.onClick === 'function') action.onClick(event);
          }
        });
        if (i === actions.length - 1) node.setAttribute('data-autofocus', '');
        return node;
      })));
    }
    if (opts.closeButton !== false) {
      box.appendChild(iconButton({ icon: 'cross', label: 'Close', cls: 'dialog__close', onClick: function () { if (handle) handle.close(); } }));
    }
    if (opts.inline) return { el: box, close: noop };       // a specimen for the gallery: not opened, not modal
    const layer = el('div', { class: ['overlay', opts.sheet && 'overlay--sheet'] }, box);
    handle = openOverlay(layer, box, { onClose: opts.onClose, dismiss: opts.dismiss });
    return handle;
  }

  // toast(text, {ms}) -> a short message above the action bar; it leaves by itself. *words* are highlighted.
  function toast(text, opts) {
    if (opts && opts.inline) return el('div', { class: 'toast' }, richText(text));
    const root = overlayRoot();
    let box = root.querySelector('.toasts');
    if (!box) {
      box = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
      root.appendChild(box);
    }
    while (box.children.length > 1) box.removeChild(box.firstChild);      // never a pile of messages
    const node = el('div', { class: 'toast' }, richText(text));
    box.appendChild(node);
    const leave = function () {
      node.classList.add('is-leaving');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 220);
    };
    setTimeout(leave, (opts && Number(opts.ms)) || 2600);
    return node;
  }

  // celebrate({title, sub, art}) -> {el, close}: the big moment (a stop's badge). Confetti and the 'win' sound.
  // more: over (a small line above the title), button (its label, default 'Continue'), onClose
  function celebrate(opts) {
    opts = opts || {};
    const picture = typeof opts.art === 'string' ? art(opts.art) : (opts.art instanceof Node ? opts.art : zip('cheer'));
    const badge = el('div', { class: 'celebrate__badge' }, picture);
    const timers = [];
    let handle = null;
    const layer = el('div', { class: 'celebrate', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title || 'Well done', tabindex: '-1' },
      el('div', { class: 'celebrate__stage' },
        el('div', { class: 'celebrate__rays', 'aria-hidden': 'true' }), badge,
        opts.art ? el('span', { class: 'celebrate__zip' }, zip('cheer')) : null),
      opts.over ? el('p', { class: 'celebrate__over' }, opts.over) : null,
      el('h2', { class: 'celebrate__title' }, opts.title || 'Well done!'),
      opts.sub ? el('p', { class: 'celebrate__sub' }, opts.sub) : null,
      button({ label: opts.button || 'Continue', kind: 'primary', big: true, onClick: function () { if (handle) handle.close(); } }));
    if (opts.inline) {
      layer.classList.add('celebrate--inline');
      return { el: layer, close: noop };
    }
    handle = openOverlay(layer, layer, {
      dismiss: false,
      onClose: function () {
        timers.forEach(clearTimeout);
        if (typeof opts.onClose === 'function') opts.onClose();
      }
    });
    sound('win');
    const burst = function (dx, n) {
      const r = badge.getBoundingClientRect();
      if (r.width) T.fx.confetti(r.left + r.width / 2 + dx * r.width, r.top + r.height * 0.4, n, 14);
    };
    timers.push(setTimeout(burst, 200, 0, 60), setTimeout(burst, 650, -0.9, 36), setTimeout(burst, 1000, 0.9, 36));
    return handle;
  }

  // the word and its entry in a pack: the stop that is showing first, then every other pack
  function findWord(key, stop) {
    const want = String(key == null ? '' : key).trim().toLowerCase();
    const here = stop != null ? stop : (T.router ? T.router.current().params.n : null);
    const order = Object.keys(T.packs || {}).sort(function (a, b) { return (Number(b) === Number(here)) - (Number(a) === Number(here)); });
    for (let i = 0; i < order.length; i++) {
      const items = T.packs[order[i]] && T.packs[order[i]].words && T.packs[order[i]].words.items;
      if (!items) continue;
      const words = Object.keys(items);
      for (let k = 0; k < words.length; k++) {
        if (words[k].toLowerCase() === want) return { word: words[k], item: items[words[k]] || {} };
      }
    }
    return null;
  }

  // wordCard(key, {stop}) -> {el, close}, or null when no pack has the word.
  // A popover with the picture, the word, its English meaning, a VI button for its Vietnamese meaning and a
  // "hear the word" button (left out when the device cannot speak: always, in Maths).
  // a key word with a long part ("multiplication square") gets a smaller title, so it breaks between its words only
  function longWord(w) { return String(w || '').split(/\s+/).some(function (x) { return x.length >= 12; }); }

  function wordCard(key, opts) {
    const entry = findWord(key, opts && opts.stop);
    if (!entry) {
      console.warn('T.ui.wordCard: no pack has the word "' + key + '".');
      return null;
    }
    const item = entry.item;
    const canSpeak = !!(T.fx && T.fx.status && T.fx.status().speech);
    const hear = canSpeak ? iconButton({
      icon: 'speaker', label: 'Hear the word', sfx: false,
      onClick: function () { if (!T.fx.sayWord(entry.word)) hear.hidden = true; }
    }) : null;
    // the Vietnamese meaning waits behind a VI button (docs/01-brief.md: English first)
    const viLine = item.vi ? el('p', { class: 'wordcard__vi', lang: 'vi', hidden: true }, item.vi) : null;
    const viToggle = viLine ? viButton(function (open) { viLine.hidden = !open; }) : null;
    const card = el('div', { class: 'wordcard' },
      el('div', { class: 'wordcard__head' }, el('h2', { class: ['wordcard__word', longWord(entry.word) && 'is-long'] }, entry.word), hear, viToggle),
      viLine,
      item.art ? plate(item.art, { cls: 'wordcard__pic', play: true }) : null,
      item.def ? el('p', { class: 'wordcard__def' }, item.def) : null);
    return dialog({ label: entry.word, body: card, sheet: true, cls: 'dialog--word', inline: !!(opts && opts.inline) });
  }

  /* ---------- the result card ---------- */

  // resultCard({stars, title, lines, primary, secondary}) -> <section class="result">
  // stars: 0 to 3 (leave it out for a card without stars). lines: short sentences (*highlights* allowed).
  // primary: {label, onClick, ...button options}: ONE big button inside the card. secondary: one or a
  // list of {label, onClick}: quiet actions. more: max, art (a picture instead of Zip), mood, reveal
  // (the stars start empty: light them with T.ui.revealStars), cls.
  // Phase 6 (rewards): artMove 'swing' (a medal swings in on its ribbon) or 'zap' (a bolt); best {was} (the
  // "New best!" ribbon with the old best); prize {art, text} (a badge just won: the big moment flies into it)
  function resultCard(opts) {
    opts = opts || {};
    const max = wholeNumber(opts.max == null ? 3 : opts.max, 1, 5);
    const n = wholeNumber(opts.stars, 0, max);
    const mood = opts.mood || (n >= max ? 'cheer' : 'happy');
    const top = opts.art
      ? el('div', { class: ['result__art', opts.artMove && 'result__art--' + opts.artMove] }, typeof opts.art === 'string' ? art(opts.art) : opts.art)
      : el('div', { class: 'result__zip' }, zip(mood));
    const card = el('section', { class: ['result', opts.cls] }, top);
    if (opts.stars != null) card.appendChild(stars(opts.reveal ? 0 : n, max, { size: 'lg' }));
    card.appendChild(el('h2', { class: 'result__title' }, opts.title || 'Well done!'));
    const words = T.REWARDS || {};
    if (opts.best) {
      card.appendChild(el('div', { class: 'result__best rw-best' },
        el('span', { class: 'rw-best__tag' }, icon('star'), (words.best && words.best.tag) || 'New best!'),
        opts.best.was != null ? el('span', { class: 'rw-best__was' }, String(((words.best && words.best.was) || 'Old best: {b}')).replace('{b}', opts.best.was)) : null));
    }
    if (opts.prize) {
      card.appendChild(el('p', { class: 'result__prize' },
        el('span', { class: 'result__prize-pic', 'aria-hidden': 'true' }, typeof opts.prize.art === 'string' ? art(opts.prize.art, { decorative: true }) : null),
        el('span', richText(opts.prize.text || ''))));
    }
    const lines = [].concat(opts.lines || []).filter(function (line) { return line != null && line !== ''; });
    if (lines.length) card.appendChild(el('div', { class: 'result__lines' }, lines.map(function (line) { return el('p', richText(line)); })));
    if (opts.primary) card.appendChild(button(Object.assign({ kind: 'primary', big: true }, opts.primary, { cls: 'result__primary ' + (opts.primary.cls || '') })));
    const quiet = [].concat(opts.secondary || []).filter(Boolean);
    if (quiet.length) card.appendChild(el('div', { class: 'result__actions' }, quiet.map(function (action) { return button(Object.assign({ kind: 'quiet' }, action)); })));
    return card;
  }

  T.ui = {
    art: art, playArt: playArt, plate: plate, zip: zip, zipMood: zipMood, icon: icon, brandMark: brandMark,
    button: button, iconButton: iconButton, soundSwitch: soundSwitch, syncSound: syncSound, choice: choice, actionBar: actionBar,
    stars: stars, hearts: hearts, dots: dots, bar: bar, meter: meter, revealStars: revealStars, countUp: countUp,
    instruction: instruction, richText: richText, viButton: viButton,
    dialog: dialog, toast: toast, celebrate: celebrate, wordCard: wordCard, longWord: longWord, closeOverlays: closeOverlays,
    resultCard: resultCard,
    isDark: isDark, onTheme: onTheme, reducedMotion: reducedMotion, stagger: stagger, empty: empty,
    icons: Object.keys(ICONS)
  };
})(window.T = window.T || {});

