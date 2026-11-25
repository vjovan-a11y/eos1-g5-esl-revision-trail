/* 00-core.js - the look-independent core of the Maths Revision Trail (Grade 5, Cambridge Primary Mathematics Stage 6).

   T.util      small DOM, text and array helpers
   T.store     one saved JSON document per child (localStorage key 'g5-maths-trail-v1:<player id>'), kept in memory
               (the school build: useKey('g5-maths-trail-v1:<school child id>'), replace(doc), watch(fn))
   T.STEPS     the five steps of every stop, in order (they win the stars)
   T.EXTRAS    the two extras on every hub: Lightning round and My self-check (no stars)
   T.progress  units, results, stars and badges: the same rule for every step of every stop
   T.debug     shortcuts for testing
   T.packs, T.steps   empty registries that later files fill

   Nothing here draws anything, and nothing runs at load except defining members of T.
   T.store, T.progress and T.debug never throw. The full API is in brief/api-core.md. */
(function (T) {
  'use strict';

  /* ---------- registries that later files fill ---------- */

  T.packs = T.packs || {};   // stop number -> content pack (22-pack-stop1.js and friends)
  T.steps = T.steps || {};   // step id -> {mount(ctx)} (40-words.js and friends)

  /* ---------- small type checks ---------- */

  const hasOwn = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
  const isBag = function (x) { return x !== null && typeof x === 'object'; };
  const isNumber = function (x) { return typeof x === 'number' && isFinite(x); };
  const isPlain = function (x) {
    if (!isBag(x) || Array.isArray(x)) return false;
    const proto = Object.getPrototypeOf(x);
    return proto === Object.prototype || proto === null;
  };

  /* ---------- T.util: query helpers ---------- */

  // the first match inside root (default: the whole page), or null
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  // every match inside root, as a real array
  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  /* ---------- T.util: el(tag, attrs, ...kids) ----------
     attrs: class (a string, an array of names or a {name: condition} map), dataset {…},
            style {…} (or a string), html (trusted markup), text, on<Event> handlers (onClick,
            onPointerDown …), aria-* and any other attribute. null and undefined values are left
            out; false leaves a plain attribute out (disabled: false) but is written as "false"
            for aria-*, data-* and the like; true writes an empty attribute (or "true" for those).
     kids:  nodes, strings, numbers, arrays of those (nested is fine); null and false are skipped.
     SVG tag names (svg, path, circle …) get the SVG namespace, so drawn icons can be built too.
     For a name that HTML also has, say so: el('svg:title', {text: 'Star'}). */

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SVG_TAGS = /^(svg|g|path|circle|ellipse|rect|line|polyline|polygon|text|tspan|textPath|defs|desc|use|symbol|stop|linearGradient|radialGradient|clipPath|mask|pattern|marker|filter|fe[A-Z]\w*|animate|animateTransform|animateMotion|foreignObject)$/;
  const WRITES_FALSE = /^(aria-|data-|draggable$|spellcheck$|contenteditable$)/;
  const ATTR_NAMES = { className: 'class', htmlFor: 'for' };

  function el(tag, attrs, ...kids) {
    const node = createNode(String(tag));
    if (isPlain(attrs)) setAttrs(node, attrs); else kids.unshift(attrs);   // el('p', 'text') works too
    append(node, kids);
    return node;
  }

  function createNode(tag) {
    if (tag.indexOf('svg:') === 0) return document.createElementNS(SVG_NS, tag.slice(4));
    return SVG_TAGS.test(tag) ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
  }

  function setAttrs(node, attrs) {
    Object.keys(attrs).forEach(function (key) {
      const value = attrs[key];
      if (value == null) return;
      const name = hasOwn(ATTR_NAMES, key) ? ATTR_NAMES[key] : key;
      if (name === 'class') setClass(node, value);
      else if (name === 'dataset') setDataset(node, value);
      else if (name === 'style') setStyle(node, value);
      else if (name === 'html') node.innerHTML = String(value);
      else if (name === 'text') node.textContent = String(value);
      else if (typeof value === 'function') {
        if (/^on./.test(name)) node.addEventListener(name.slice(2).toLowerCase(), value);
      }
      else if (typeof value === 'boolean') {
        if (WRITES_FALSE.test(name)) node.setAttribute(name, String(value));
        else if (value) node.setAttribute(name, '');
      }
      else node.setAttribute(name, String(value));
    });
  }

  function setClass(node, value) {
    let names;
    if (Array.isArray(value)) names = value.filter(Boolean).join(' ');
    else if (isPlain(value)) names = Object.keys(value).filter(function (name) { return value[name]; }).join(' ');
    else names = String(value);
    if (names) node.setAttribute('class', names);
  }

  // dataset: {stopNumber: 1} and dataset: {'stop-number': 1} both write data-stop-number="1"
  function setDataset(node, data) {
    if (!isBag(data)) return;
    Object.keys(data).forEach(function (key) {
      if (data[key] == null) return;
      const name = key.replace(/[A-Z]/g, function (ch) { return '-' + ch.toLowerCase(); });
      node.setAttribute('data-' + name, String(data[key]));
    });
  }

  function setStyle(node, style) {
    if (typeof style === 'string') { node.setAttribute('style', style); return; }
    if (!isBag(style)) return;
    Object.keys(style).forEach(function (key) {
      const value = style[key];
      if (value == null || value === false) return;
      if (key.indexOf('-') >= 0) node.style.setProperty(key, String(value));   // '--token' and 'font-size'
      else node.style[key] = value;                                            // fontSize
    });
  }

  function append(node, kid) {
    if (kid == null || kid === false || kid === true) return;
    if (kid instanceof Node) node.appendChild(kid);
    else if (typeof kid === 'string' || typeof kid === 'number') node.appendChild(document.createTextNode(String(kid)));
    else if (typeof kid !== 'function' && typeof kid.length === 'number') Array.prototype.slice.call(kid).forEach(function (k) { append(node, k); });
    else node.appendChild(document.createTextNode(String(kid)));
  }

  /* ---------- T.util: text, arrays, numbers ---------- */

  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  // make any value safe to put inside HTML text or a quoted attribute
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return HTML_ESCAPES[ch]; });
  }

  // Fisher-Yates; returns a new array and leaves the given one alone
  function shuffle(a) {
    const out = Array.prototype.slice.call(a || []);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const kept = out[i];
      out[i] = out[j];
      out[j] = kept;
    }
    return out;
  }

  // sample(a, n) -> a new array of n different random items (fewer if a is shorter);
  // sample(a) without n -> one random item (undefined for an empty array)
  function sample(a, n) {
    const mixed = shuffle(a);
    if (n === undefined) return mixed[0];
    return mixed.slice(0, Math.max(0, Math.floor(Number(n)) || 0));
  }

  // clamp(value, low, high); a value that is not a number becomes low
  function clamp(value, low, high) {
    const v = Number(value);
    if (v !== v) return low;
    return v < low ? low : v > high ? high : v;
  }

  // a new id on every call, safe as an HTML id and inside url(#…): 'card-1', 'card-2' …
  let uidCount = 0;
  function uid(prefix) {
    uidCount += 1;
    return (prefix || 'id') + '-' + uidCount.toString(36);
  }

  T.util = { $: $, $$: $$, el: el, esc: esc, shuffle: shuffle, sample: sample, clamp: clamp, uid: uid };

  /* ---------- T.store: one saved JSON document, kept in memory ----------
     The document, with the paths used so far:

       { v: 2,
         settings: { sound: true },
         stops: { 1: { words: { units: { A: {score: 5, max: 6}, … } }, see: {…}, … } } }

     A step may keep its own small state next to `units` (say stops.1.words.seen); T.progress reads
     only `units`. Values go in and come out as copies, so the saved document only changes through
     set(). A path is a dotted string or an array of keys. Storage that is missing, full or blocked
     is never an error: the document then simply lives in memory until the page closes. */

  const STORE_KEY = 'g5-esl-trail-v1';             // + ':' + the player's id: one document per child
                                                       // (25-players.js TRAIL_KEY must be this + ':')
  const SCHEMA = 2;                                    // saved in the document as {v: 2}
  const UNSAFE_KEY = /^(__proto__|constructor|prototype)$/;
  let doc = null;                                      // read once, on first use
  let player = null;                                   // the id of the child who is playing (T.players), or null
  let wholeKey = null;                                 // useKey(key): the school build names the whole key itself
  const watchers = [];                                 // watch(fn): fn() after every change of the document

  // the key of the saved document of the child who is playing; null while nobody has been chosen
  // (the document then lives in memory only, and nothing is written)
  function storeKey() {
    if (wholeKey) return wholeKey;
    return player ? STORE_KEY + ':' + player : null;
  }

  // tell the watchers (the school bridge) that the document changed; a watcher never breaks the caller
  function changed() {
    watchers.slice().forEach(function (fn) { try { fn(); } catch (e) { /* only a listener */ } });
  }

  function freshDoc() {
    return { v: SCHEMA };
  }

  // a deep copy through JSON; undefined for things JSON cannot hold; throws on a circular value
  function copy(value) {
    if (value === undefined) return undefined;
    const json = JSON.stringify(value);
    return json === undefined ? undefined : JSON.parse(json);
  }

  function pathKeys(path) {
    const keys = Array.isArray(path) ? path.map(String) : String(path == null ? '' : path).split('.');
    const usable = keys.length > 0 && keys.every(function (k) { return k !== '' && !UNSAFE_KEY.test(k); });
    return usable ? keys : null;
  }

  let seenRaw = null;                                  // the saved text this tab last read or wrote
  let dirty = false;                                   // this tab wrote since it last took the saved copy as it was

  function load() {
    if (doc) return doc;
    doc = freshDoc();
    const key = storeKey();
    if (!key) return doc;
    try {
      const raw = window.localStorage.getItem(key);
      const saved = raw ? JSON.parse(raw) : null;
      if (isPlain(saved) && saved.v === SCHEMA) { doc = saved; seenRaw = raw; dirty = false; }   // anything else: start fresh
    } catch (e) { /* no storage, or corrupt JSON: start fresh */ }
    return doc;
  }

  // Another tab (or window) of the same child may have saved since this one read the document: a change
  // starts from that saved copy, so one tab never writes over the stars won in the other (Jovan: progress
  // must never be lost). Storage that cannot be read keeps the document in memory as it is.
  function refresh() {
    const key = storeKey();
    if (!key || !doc) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw || raw === seenRaw) return;
      const saved = JSON.parse(raw);
      // a copy saved by a tab that had not seen this tab's last save yet: joined, keeping the best of both (below)
      if (isPlain(saved) && saved.v === SCHEMA) { doc = dirty ? joinBest(saved, doc, '') : saved; seenRaw = raw; }
    } catch (e) { /* keep the document in memory */ }
  }

  // write the document; when the device is full, the answer log (the oldest part, kept only for the record)
  // is cut short first, so that stars and progress are still saved
  function persist() {
    const key = storeKey();
    if (!key) return false;
    for (let tries = 0; tries < 3; tries++) {
      try {
        const raw = JSON.stringify(doc);
        window.localStorage.setItem(key, raw);
        seenRaw = raw;
        dirty = true;
        return true;
      } catch (e) {
        if (!Array.isArray(doc.log) || doc.log.length <= 20) return false;
        doc.log = doc.log.slice(-Math.floor(doc.log.length / 4));
      }
    }
    return false;
  }

  /* Two tabs of one child, in different browser processes: a save reaches the other tab a moment later, so a tab can
     save on top of a copy that misses the other tab's last result (seen in a test, Phase 6). When the other tab's copy
     arrives and this tab has saved since it last took the saved copy, the two are joined, keeping the best of both
     (results, bests, plays and runs the bigger, true wins, the first day a badge was won), and the join is saved.
     Text, lists, settings and half-played games come from the copy that arrived. */
  function better(x, y) { const p = x.score * y.max, q = y.score * x.max; return p > q || (p === q && x.score > y.score); }
  function joinBest(a, b, key) {
    if (b === undefined) return a;
    if (a === undefined) return key === 'resume' || key === 'log' || key === 'settings' ? undefined : copy(b);
    if (key === 'resume' || key === 'log' || key === 'settings') return a;
    if (key === 'on' && isNumber(a) && isNumber(b)) return Math.min(a, b);
    if (isNumber(a) && isNumber(b)) return Math.max(a, b);
    if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
    if (isPlain(a) && isPlain(b)) {
      if (isNumber(a.score) && isNumber(a.max) && isNumber(b.score) && isNumber(b.max)) return better(b, a) ? copy(b) : a;
      if (isNumber(a.right) && isNumber(b.right)) return b.right > a.right ? copy(b) : a;
      const o = {};
      Object.keys(a).forEach(function (k) { const v = joinBest(a[k], b[k], k); if (v !== undefined) o[k] = v; });
      Object.keys(b).forEach(function (k) { if (!hasOwn(a, k)) { const v = joinBest(undefined, b[k], k); if (v !== undefined) o[k] = v; } });
      return o;
    }
    return a;
  }

  // the other tab saved: take its copy (joined with this tab's own unsaved-elsewhere results), and let the screen show it
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('storage', function (e) {
      if (!doc || !e || e.key !== storeKey() || e.newValue == null || e.newValue === seenRaw) return;
      let theirs = null;
      try { theirs = JSON.parse(e.newValue); } catch (err) { theirs = null; }
      if (dirty && isPlain(theirs) && theirs.v === SCHEMA) {
        const joined = joinBest(theirs, doc, '');
        doc = joined;
        if (JSON.stringify(joined) !== e.newValue) persist();       // this tab's results were missing: save the join
        else { seenRaw = e.newValue; dirty = false; }
      } else {
        doc = null;
      }
      announce({ stop: null, step: null, unit: null });
    });
  }

  // get('stops.1.words.units.A', null) -> a copy of the value, or the fallback when nothing is there
  function storeGet(path, fallback) {
    const keys = pathKeys(path);
    if (!keys) return fallback;
    let node = load();
    for (let i = 0; i < keys.length; i++) {
      if (!isBag(node) || !hasOwn(node, keys[i])) return fallback;
      node = node[keys[i]];
    }
    if (node === undefined) return fallback;
    return isBag(node) ? copy(node) : node;
  }

  // set(path, value) creates the parents and saves. set(path, undefined) removes the entry.
  // Returns true when the document reached localStorage, false when it is kept in memory only
  // (or when the path or the value cannot be used).
  function storeSet(path, value) {
    const keys = pathKeys(path);
    if (!keys) return false;
    let clean;
    try { clean = copy(value); } catch (e) { return false; }
    refresh();
    let node = load();
    for (let i = 0; i < keys.length - 1; i++) {
      if (!hasOwn(node, keys[i]) || !isBag(node[keys[i]])) node[keys[i]] = {};
      node = node[keys[i]];
    }
    const last = keys[keys.length - 1];
    if (clean === undefined) delete node[last]; else node[last] = clean;
    doc.v = SCHEMA;
    const saved = persist();
    changed();
    return saved;
  }

  function storeAll() {
    return copy(load());
  }

  // Forget everything: progress and settings. Progress changes, so 'trail:progress' is announced.
  // Returns true when the saved copy was removed too.
  function storeReset() {
    doc = freshDoc();
    dirty = false;
    let removed = true;
    const key = storeKey();
    try {
      if (key) window.localStorage.removeItem(key);
    } catch (e) {
      removed = false;
    }
    announce({ stop: null, step: null, unit: null });
    return removed;
  }

  // usePlayer(id): switch to that child's saved document (null: nobody, memory only). Everything the
  // trail shows changes, so 'trail:progress' is announced.
  function usePlayer(id) {
    player = typeof id === 'string' && /^[a-z0-9]{4,40}$/.test(id) ? id : null;
    wholeKey = null;
    doc = null;
    seenRaw = null;
    dirty = false;
    announce({ stop: null, step: null, unit: null });
    return player;
  }

  // useKey(key): the school build (src/school/) keeps the document under a key it names in full
  // ('g5-maths-trail-v1:' + the school's child id); null: memory only. 'trail:progress' is announced.
  function useKey(key) {
    wholeKey = typeof key === 'string' && key !== '' ? key : null;
    player = null;
    doc = null;
    seenRaw = null;
    dirty = false;
    announce({ stop: null, step: null, unit: null });
    return wholeKey;
  }

  // replace(next): the whole document at once (the school build joins a copy from the server with this
  // device's). Saves, tells the watchers and announces 'trail:progress'. -> true when it reached localStorage.
  function storeReplace(next) {
    if (!isPlain(next)) return false;
    let clean;
    try { clean = copy(next); } catch (e) { return false; }
    doc = clean;
    doc.v = SCHEMA;
    const saved = persist();
    changed();
    announce({ stop: null, step: null, unit: null });
    return saved;
  }

  // watch(fn): fn() after every set() and replace(); -> a function that stops it
  function watch(fn) {
    if (typeof fn !== 'function') return function () {};
    watchers.push(fn);
    return function () { const i = watchers.indexOf(fn); if (i >= 0) watchers.splice(i, 1); };
  }

  T.store = {
    get: storeGet, set: storeSet, all: storeAll, reset: storeReset,
    usePlayer: usePlayer, player: function () { return player; },
    useKey: useKey, replace: storeReplace, watch: watch
  };

  /* ---------- T.STEPS: the five steps of every stop ---------- */

  T.STEPS = [
    { id: 'words', label: 'Words' },
    { id: 'see', label: 'See it' },
    { id: 'practise', label: 'Practise' },
    { id: 'notes', label: 'Notes' },
    { id: 'test', label: 'Mini Practice test' }
  ];

  /* ---------- T.EXTRAS: the hub extras of every stop (they win bolts and a self-check, not stars) ---------- */

  T.EXTRAS = [
    { id: 'lightning', label: 'Lightning round' },
    { id: 'selfcheck', label: 'My self-check' }
  ];

  // the label of a step or an extra: 'words' -> 'Words', 'lightning' -> 'Lightning round'
  T.stepLabel = function (id) {
    const all = T.STEPS.concat(T.EXTRAS);
    for (let i = 0; i < all.length; i++) if (all[i].id === id) return all[i].label;
    return String(id || '');
  };

  /* ---------- T.progress: stops, steps and units ----------
     A step is made of units (word sets, the See it challenge, games, the notes check, the test
     paper). Each unit saves its best {score, max} under stops.<stop>.<step>.units.<unitId>.
     Everywhere below `stop` is the stop number (1, '1' and '01' mean the same stop) and `step`
     is a step id ('words', 'see' …); an entry of T.STEPS is accepted too. */

  // -> the stop's key in T.packs and in the saved document ('1'), or null if it is no stop number
  //    (a stop number is a whole number from 1 to 9999)
  function stopKey(stop) {
    const n = typeof stop === 'string' && /^\d{1,4}$/.test(stop) ? Number(stop) : stop;
    return isNumber(n) && n >= 1 && n <= 9999 && Math.floor(n) === n ? String(n) : null;
  }

  // -> the step id if it is one of T.STEPS, else null
  function stepKey(step) {
    const id = isBag(step) ? step.id : step;
    for (let i = 0; i < T.STEPS.length; i++) {
      if (T.STEPS[i].id === id) return T.STEPS[i].id;
    }
    return null;
  }

  function idsOf(list) {
    const ids = [];
    if (!Array.isArray(list)) return ids;
    list.forEach(function (item) {
      if (!isBag(item) || item.id == null) return;
      const id = String(item.id);
      if (id !== '' && ids.indexOf(id) < 0) ids.push(id);
    });
    return ids;
  }

  // the unit ids of a step, read from the stop's pack; no pack means no units
  function units(stop, step) {
    const key = stopKey(stop);
    const pack = key === null ? null : T.packs[key];
    if (!isBag(pack)) return [];
    switch (stepKey(step)) {
      case 'words': return idsOf(pack.words && pack.words.sets);
      case 'see': return ['challenge'];
      case 'practise': return idsOf(pack.practise);
      case 'notes': return ['check'];
      case 'test': return ['paper'];
      default: return [];
    }
  }

  // -> where a unit's result is saved, or null when the stop, the step or the unit id is not usable
  function unitPath(stop, step, unitId) {
    const key = stopKey(stop), id = stepKey(step);
    const unitKey = unitId == null ? '' : String(unitId);
    if (key === null || id === null || unitKey === '' || UNSAFE_KEY.test(unitKey)) return null;
    return ['stops', key, id, 'units', unitKey];
  }

  // tidy numbers: max is 0 or more, score lies between 0 and max
  function cleanResult(score, max) {
    const m = Number(max);
    const top = isNumber(m) && m > 0 ? m : 0;
    return { score: clamp(score, 0, top), max: top };
  }

  // -> {score, max}, or null when this unit has no result yet
  function unit(stop, step, unitId) {
    const path = unitPath(stop, step, unitId);
    const saved = path ? storeGet(path, null) : null;
    if (!isPlain(saved) || !isNumber(saved.score) || !isNumber(saved.max)) return null;
    return cleanResult(saved.score, saved.max);
  }

  // better means a higher score/max, and for the same score/max a higher score
  // (the fractions are compared by cross-multiplying, so whole numbers stay exact; 0/0 counts as 0)
  function isBetter(next, prev) {
    const a = next.score * prev.max, b = prev.score * next.max;
    return a > b || (a === b && next.score > prev.score);
  }

  function announce(detail) {
    try {
      document.dispatchEvent(new CustomEvent('trail:progress', { detail: detail }));
    } catch (e) { /* telling the listeners must never break the caller */ }
  }

  // Record a result. Only the best one is kept. Returns true when it became the saved result;
  // then, and only then, 'trail:progress' is dispatched on document with detail {stop, step, unit}.
  // A stop, step or unit id that cannot exist is refused (false) and nothing is saved.
  function saveUnit(stop, step, unitId, score, max) {
    const path = unitPath(stop, step, unitId);
    if (!path) {
      try { console.warn('T.progress.saveUnit: not a stop, step and unit:', stop, step, unitId); } catch (e) { /* no console */ }
      return false;
    }
    const next = cleanResult(score, max);
    const prev = unit(stop, step, unitId);
    if (prev && !isBetter(next, prev)) return false;
    storeSet(path, next);
    announce({ stop: Number(path[1]), step: path[2], unit: path[4] });
    return true;
  }

  /* ---------- T.progress: stars, states, badges ----------
     Step stars: 0 until every unit of the step has a result; then 1 star = finished,
     2 stars = sum(score) / sum(max) is 75% or more, 3 stars = 90% or more. */

  const NEARLY = 1e-9;   // so that 2.7 out of 3 is 90% even after floating point sums

  // how far a step is: {units, played, score, max}
  function tally(stop, step) {
    const ids = units(stop, step);
    const sum = { units: ids.length, played: 0, score: 0, max: 0 };
    ids.forEach(function (id) {
      const result = unit(stop, step, id);
      if (!result) return;
      sum.played += 1;
      sum.score += result.score;
      sum.max += result.max;
    });
    return sum;
  }

  function stepStars(stop, step) {
    const sum = tally(stop, step);
    if (sum.units === 0 || sum.played < sum.units) return 0;
    if (sum.max <= 0) return 1;                                    // finished, with nothing to score
    if (sum.score * 10 + NEARLY >= sum.max * 9) return 3;          // 90% or more
    if (sum.score * 4 + NEARLY >= sum.max * 3) return 2;           // 75% or more
    return 1;
  }

  // 'new' = no unit has a result, 'done' = every unit has one, 'started' = in between.
  // A step without units (no pack yet) stays 'new'.
  function stepState(stop, step) {
    const sum = tally(stop, step);
    if (sum.played === 0) return 'new';
    return sum.played === sum.units ? 'done' : 'started';
  }

  // 0 to 15
  function stopStars(stop) {
    return T.STEPS.reduce(function (total, step) { return total + stepStars(stop, step.id); }, 0);
  }

  // the stars of every stop that has a pack
  function totalStars() {
    return Object.keys(T.packs).reduce(function (total, stop) { return total + stopStars(stop); }, 0);
  }

  // the id of the first step that is not done ('words' … 'test'), or null when all five are done
  function nextStep(stop) {
    for (let i = 0; i < T.STEPS.length; i++) {
      if (stepState(stop, T.STEPS[i].id) !== 'done') return T.STEPS[i].id;
    }
    return null;
  }

  // all five steps done = the stop's badge
  function hasBadge(stop) {
    return nextStep(stop) === null;
  }

  T.progress = {
    units: units, unit: unit, saveUnit: saveUnit,
    stepStars: stepStars, stepState: stepState,
    stopStars: stopStars, totalStars: totalStars, nextStep: nextStep, hasBadge: hasBadge
  };

  /* ---------- T.debug: shortcuts for testing (never linked from the app) ---------- */

  const DEBUG_MAX = 10;
  const DEBUG_SCORES = [0, 5, 8, 10];   // 50% -> 1 star, 80% -> 2 stars, 100% -> 3 stars

  // overwrite every unit of a step so that the step shows exactly `stars` stars (0 clears it)
  function forceStep(stop, step, stars) {
    const key = stopKey(stop), id = stepKey(step);
    const ids = units(stop, step);
    if (!ids.length) return false;
    const want = Math.round(clamp(stars === undefined ? 3 : stars, 0, 3));
    if (want === 0) storeSet(['stops', key, id, 'units'], undefined);
    else ids.forEach(function (unitId) { storeSet(unitPath(stop, step, unitId), { score: DEBUG_SCORES[want], max: DEBUG_MAX }); });
    return true;
  }

  // -> true when the step exists (its stop has a pack and the step has units)
  function winStep(stop, step, stars) {
    const done = forceStep(stop, step, stars);
    if (done) announce({ stop: Number(stopKey(stop)), step: stepKey(step), unit: null });
    return done;
  }

  // every step of every stop that has a pack gets 3 stars, so every badge is won; -> the total stars
  function unlockAll() {
    Object.keys(T.packs).forEach(function (stop) {
      T.STEPS.forEach(function (step) { forceStep(stop, step.id, 3); });
    });
    announce({ stop: null, step: null, unit: null });
    return totalStars();
  }

  // a brand new child: no progress, default settings (the same as T.store.reset())
  function resetAll() {
    storeReset();
  }

  T.debug = { unlockAll: unlockAll, winStep: winStep, reset: resetAll };
})(window.T = window.T || {});

