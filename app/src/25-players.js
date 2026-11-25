/* 25-players.js - who is playing: the start screen (route 'players') and one saved trail per child.

   ONE screen, no logins and no codes: a child taps their class, types their name and presses Start,
   and the trail opens straight away. Each child's stars and progress are saved in their own document
   on this device (T.store.usePlayer). The same class and name typed again on the same device brings
   that child's stars back; any other name starts at the very beginning of the trail. The names of
   other children are never shown. A fresh visit always opens this screen first (the router's gate),
   so a shared link never lands in the middle of the trail. Names stay on this device: nothing is
   sent anywhere.

   T.CLASSES                  the classes on the start screen (change this list for a new school year)
   T.players.list()           the children saved on this device, the last one to play first
   T.players.active()         the child who is playing in this tab, or null
   T.players.choose(id)       play as that child
   T.players.signOut()        back to the start screen, for the next child
   T.players.edit()           fix the name or class of the child who is playing (keeps the stars)
   T.players.remove(id)       forget a child and their stars on this device
   T.players.chip()           the name button on the map: {el, refresh}
   T.players.canSave()        false when this browser keeps nothing (a private window, blocked storage)
   T.players.homeTip()        the "Add to Home Screen" tip for iPads and iPhones, or null
   T.players.roleOf(cls)      'student', 'teacher' or 'visitor' (a teacher's or TA's cls is 'Teacher', a visitor's 'Visitor')
   T.brand                    the app's title and the school line: {title, school, text(), strip()}

   Who signs in (Jovan, EOS 1 finishing touches, ported from the Grade 5 Science trail): three tabs on the start screen.
     Student (Học sinh)                  tap the class, type the name (any name: the Maths rule)
     Teacher / TA (Giáo viên / Trợ giảng) type the name (letters only, 'ms lan' -> 'Ms Lan'); saved with cls 'Teacher';
                                          the same name again is the same player; may open the Summit at any time
     Visitor (Khách)                     no name: ONE shared 'Visitor' player on this device
   The name menu on the map: the class (or Teacher / TA, Visitor), the stars, "Changing device?" with the progress code
   (26-progress-code.js), for teachers "Help a student" (Check a student's code), Fix my name, Switch player. */
(function (T) {
  'use strict';

  const el = T.util.el;

  // the app's title and the school line (Jovan: the same everywhere; plain text, no logo)
  T.brand = {
    title: 'EOS 1 – G5 ESL Revision Trail',
    school: 'Vinschool Times City T36 Primary School – Advanced Programme',
    // the title and the school line beside the brand mark (the start screen and the map; hidden on phones)
    text: function () {
      return el('div', { class: 'brand__text' }, el('h1', { class: 'brand__name' }, T.brand.title), el('p', { class: 'brand__school' }, T.brand.school));
    },
    // phones: the same two lines in a quiet strip under the header
    strip: function () {
      return el('div', { class: 'school-strip' }, el('p', { class: 'school-strip__title' }, T.brand.title), el('p', { class: 'school-strip__school' }, T.brand.school));
    }
  };

  // the two sign-ins that are not a class: maths teachers and TAs, and visitors (saved as their 'cls')
  const TEACHER = 'Teacher', VISITOR = 'Visitor';
  function roleOf(cls) { return cls === TEACHER ? 'teacher' : cls === VISITOR ? 'visitor' : 'student'; }
  function clsLabel(cls) { return cls === TEACHER ? 'Teacher / TA' : cls === VISITOR ? 'Visitor' : 'Class ' + cls; }

  // Grade 5, 2026-27: 5B01 to 5B09 (the nine Times City classes; Jovan, 24 Nov 2026). A child's saved class stays as typed; a class that leaves this list is
  // still shown when that child fixes their details.
  T.CLASSES = ['5B01', '5B02', '5B03', '5B04', '5B05', '5B06', '5B07', '5B08', '5B09'];

  const LIST_KEY = 'g5-esl-trail-players';        // localStorage: the children on this device
  const ACTIVE_KEY = 'g5-esl-trail-playing';      // sessionStorage: who is playing in this tab
  const TIP_KEY = 'g5-esl-trail-home-tip';        // localStorage: the Home Screen tip was put away
  const TRAIL_KEY = 'g5-esl-trail-v1:';           // localStorage: one saved trail per child (T.store; = its STORE_KEY + ':')
  const ID_OK = /^[a-z0-9]{4,40}$/;
  const MAX_NAME = 40;                                // first name + family initial: 'Minh An N.'

  /* ---------- storage that never throws ---------- */

  function local() { try { return window.localStorage; } catch (e) { return null; } }
  function session() { try { return window.sessionStorage; } catch (e) { return null; } }

  function read(store, key) {
    try { return store ? store.getItem(key) : null; } catch (e) { return null; }
  }

  // write(store, key, null) removes the entry; -> true when it worked
  function write(store, key, value) {
    try {
      if (!store) return false;
      if (value == null) store.removeItem(key); else store.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  let saves = null;
  function canSave() {
    if (saves === null) {
      const probe = 'g5-esl-trail-probe';
      saves = write(local(), probe, '1') && read(local(), probe) === '1';
      write(local(), probe, null);
    }
    return saves;
  }

  // ask the browser to keep this site's data when space runs low (Chrome, Edge, Firefox; Safari decides itself)
  let askedToKeep = false;
  function keepSafe() {
    if (askedToKeep) return;
    askedToKeep = true;
    try {
      if (navigator.storage && typeof navigator.storage.persist === 'function') {
        navigator.storage.persist().catch(function () { /* the browser said no: nothing to do */ });
      }
    } catch (e) { /* not offered */ }
  }

  /* ---------- the children on this device ---------- */

  let memory = [];                                    // the list itself when storage is blocked

  // (a child saved by the older three-question screen also has a teacher: it is kept, and not used)
  // G4: ported from the new Grade 3 one-screen login (brief/13-login-port.md); the teacher step is gone
  function valid(p) {
    return !!p && typeof p.id === 'string' && ID_OK.test(p.id) &&
      typeof p.name === 'string' && p.name.length > 0 && p.name.length <= MAX_NAME &&
      typeof p.cls === 'string';
  }

  function loadList() {
    const raw = read(local(), LIST_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.players)) return data.players.filter(valid);
      } catch (e) { /* a broken list: the memory copy below */ }
    }
    return memory.map(function (p) { return Object.assign({}, p); });
  }

  function saveList(players) {
    memory = players.map(function (p) { return Object.assign({}, p); });
    return write(local(), LIST_KEY, JSON.stringify({ v: 1, players: players }));
  }

  function list() {
    return loadList().sort(function (a, b) { return (b.last || 0) - (a.last || 0); });
  }

  function find(id) {
    return loadList().filter(function (p) { return p.id === id; })[0] || null;
  }

  function newId() {
    let id = Date.now().toString(36);
    for (let i = 0; i < 2; i++) id += Math.floor(Math.random() * 1679616).toString(36);
    return id.replace(/[^a-z0-9]/g, '').slice(0, 24);
  }

  /* ---------- names ---------- */

  // the commonest Vietnamese family names: such a name is said with the LAST word ("Hi, An!")
  const FAMILY = ['nguyen', 'tran', 'le', 'pham', 'hoang', 'huynh', 'phan', 'vu', 'vo', 'dang', 'bui', 'do', 'ho',
    'ngo', 'duong', 'ly', 'dinh', 'trinh', 'truong', 'mai', 'lam', 'luong', 'ha', 'cao', 'ta', 'doan', 'vuong',
    'tong', 'chau', 'thai', 'quach', 'luu', 'la', 'to', 'trieu', 'giang', 'dao', 'tang', 'kim', 'phung', 'diep',
    'lai', 'mac', 'thach', 'au', 'chu', 'dam', 'khuc', 'kieu', 'nghiem', 'ong', 'tieu', 'hua', 'van', 'lu', 'bach'];

  // without accents and in small letters: 'Nguyễn Đức' -> 'nguyen duc'
  function plain(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  function sameName(a, b) {
    return plain(a).replace(/[^a-z]/g, '') === plain(b).replace(/[^a-z]/g, '');
  }

  // a word typed all in small or all in capital letters gets one capital; a mixed one (McKay) is kept
  function capWord(part) {
    if (!part) return part;
    const lower = part.toLocaleLowerCase('vi'), upper = part.toLocaleUpperCase('vi');
    if (part !== lower && part !== upper) return part;
    return lower.charAt(0).toLocaleUpperCase('vi') + lower.slice(1);
  }

  // tidy what a child typed: one space between words, each word with a capital letter
  // (a teacher's name keeps a last single letter as typed: 'Ms Lan' is checked for letters only)
  function tidy(raw, noInitial) {
    const text = String(raw || '').normalize('NFC').replace(/[\s ​]+/g, ' ').trim();
    if (!text) return '';
    const words = text.split(' ').map(function (word) { return word.split('-').map(capWord).join('-'); });
    const last = words[words.length - 1];
    if (!noInitial && words.length > 1 && INITIAL.test(last)) words[words.length - 1] = last.charAt(0).toLocaleUpperCase('vi') + '.';   // 'n' -> 'N.'
    return words.join(' ');
  }

  // the family initial at the end of the name: one letter, with or without its dot
  let INITIAL = /^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]\.?$/;
  try { INITIAL = new RegExp('^\\p{L}\\.?$', 'u'); } catch (e) { /* old browsers: the Latin letters above */ }

  // -> null when the name is fine, else what to fix: {en, vi}.
  // Easy to start (Jovan, 24 Nov 2026): any name is fine, it does not have to match a list. The screen only
  // suggests a short form ('Minh An N.'); an empty or very long name is the only thing refused.
  function problem(name) {
    if (!name) return { en: 'Type your name.', vi: 'Hãy nhập tên của em.' };
    if (name.length > MAX_NAME) return { en: 'That name is too long.', vi: 'Tên này quá dài.' };
    return null;
  }

  // a teacher's or TA's name: letters only (no numbers, dots or emoji), as on the Grade 5 trail
  let WORD_OK = null;
  try { WORD_OK = new RegExp("^[\\p{L}\\p{M}]+(?:['’-][\\p{L}\\p{M}]+)*$", 'u'); } catch (e) { WORD_OK = null; }
  const WORD_FALLBACK = /^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]+(?:['’-][A-Za-z\u00C0-\u024F\u1E00-\u1EFF]+)*$/;   // old browsers

  function lettersOnly(name) {
    return name.split(' ').every(function (word) { return WORD_OK ? WORD_OK.test(word) : WORD_FALLBACK.test(word); });
  }

  function teacherProblem(name) {
    const issue = problem(name);
    if (issue) return { en: issue.en, vi: name ? 'Tên này quá dài.' : 'Thầy/cô hãy nhập tên.' };
    if (!lettersOnly(name)) return { en: 'Use letters only: no numbers or emoji.', vi: 'Chỉ dùng chữ cái: không dùng số hay biểu tượng.' };
    return null;
  }

  // the name a child is called by: the first name without the family initial ('Minh An N.' -> 'Minh An');
  // an older full name keeps the Grade 4 rule ('Nguyễn Minh An' -> 'An', 'Tom Baker' -> 'Tom')
  function callName(name) {
    const words = String(name || '').split(' ').filter(Boolean);
    if (words.length > 1 && INITIAL.test(words[words.length - 1])) return words.slice(0, -1).join(' ');
    if (words.length < 2) return words[0] || '';
    return FAMILY.indexOf(plain(words[0])) >= 0 ? words[words.length - 1] : words[0];
  }

  function initialOf(text) {
    const first = String(text || '').trim().charAt(0);
    return first ? first.toLocaleUpperCase('vi') : '?';
  }

  // the same colour for the same child, from the world hues 1 to 9
  function hueOf(id) {
    let h = 7;
    const s = String(id || '');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003;
    return 1 + h % 9;
  }

  function avatar(letter, hue, cls) {
    return el('span', { class: ['avatar', cls], dataset: { hue: hue }, 'aria-hidden': 'true' }, letter);
  }

  function playerAvatar(p, cls) {
    return avatar(initialOf(callName(p.name)), hueOf(p.id), cls);
  }

  /* ---------- who is playing ---------- */

  let current = null;                                 // the child who is playing in this tab
  let pendingEdit = null;                             // the id whose details the start screen opens to fix

  function active() {
    return current ? Object.assign({}, current) : null;
  }

  function choose(id) {
    const all = loadList();
    const player = all.filter(function (p) { return p.id === id; })[0];
    if (!player) return null;
    player.last = Date.now();
    saveList(all);
    current = Object.assign({}, player);
    write(session(), ACTIVE_KEY, player.id);
    T.store.usePlayer(player.id);                     // announces 'trail:progress': the stars are counted below
    if (T.ui && typeof T.ui.syncSound === 'function') T.ui.syncSound();
    keepSafe();
    return active();
  }

  function create(fields) {
    const all = loadList();
    const now = Date.now();
    const player = { id: newId(), name: fields.name, cls: fields.cls, stars: 0, created: now, last: now };
    all.push(player);
    saveList(all);
    return player;
  }

  function update(id, fields) {
    const all = loadList();
    const player = all.filter(function (p) { return p.id === id; })[0];
    if (!player) return null;
    ['name', 'cls'].forEach(function (key) { if (fields[key] != null) player[key] = fields[key]; });
    saveList(all);
    if (current && current.id === id) current = Object.assign({}, player);
    return player;
  }

  function remove(id) {
    saveList(loadList().filter(function (p) { return p.id !== id; }));
    write(local(), TRAIL_KEY + id, null);
    if (current && current.id === id) {
      current = null;
      write(session(), ACTIVE_KEY, null);
      T.store.usePlayer(null);
    }
  }

  // copy the better result of every unit (the T.progress rule) from one child's saved trail into another's,
  // both on this device, and a badge celebration already seen (R3B-01: "Fix my name or class" found a twin).
  // -> true when the other trail now holds everything (or there was nothing to carry), false when it could not
  // be saved: then the caller keeps both records, so no star is ever lost
  function mergeTrail(fromId, toId) {
    let from = null, to = null;
    try {
      from = JSON.parse(read(local(), TRAIL_KEY + fromId) || 'null');
      to = JSON.parse(read(local(), TRAIL_KEY + toId) || 'null');
    } catch (e) { return false; }
    if (!from || typeof from !== 'object' || !from.stops) return true;
    if (!to || typeof to !== 'object' || to.v !== from.v) to = { v: from.v };
    to.stops = to.stops || {};
    Object.keys(from.stops).forEach(function (n) {
      const a = from.stops[n] || {};
      const b = to.stops[n] = to.stops[n] || {};
      if (a.badgeSeen === true) b.badgeSeen = true;
      Object.keys(a).forEach(function (step) {
        const units = a[step] && a[step].units;
        if (!units || typeof units !== 'object') return;
        b[step] = b[step] || {};
        const into = b[step].units = b[step].units || {};
        Object.keys(units).forEach(function (u) {
          const x = units[u], y = into[u];
          if (!x || typeof x.score !== 'number' || typeof x.max !== 'number') return;
          if (!y || x.score * y.max > y.score * x.max || (x.score * y.max === y.score * x.max && x.score > y.score)) into[u] = x;
        });
      });
    });
    return write(local(), TRAIL_KEY + toId, JSON.stringify(to));
  }

  function signOut() {
    current = null;
    write(session(), ACTIVE_KEY, null);
    T.store.usePlayer(null);
    T.router.go('players');
  }

  function edit() {
    if (!current) return;
    pendingEdit = current.id;
    T.router.go('players');
  }

  // the stars of each child are kept with their name, so the menu on the map can show them
  document.addEventListener('trail:progress', function () {
    if (!current || !T.progress || typeof T.progress.totalStars !== 'function') return;
    const stars = T.progress.totalStars();
    if (current.stars === stars) return;
    const all = loadList();
    const player = all.filter(function (p) { return p.id === current.id; })[0];
    if (!player) return;
    player.stars = stars;
    current.stars = stars;
    saveList(all);
  });

  /* ---------- the "Add to Home Screen" tip (iPad and iPhone) ---------- */

  function appleTouch() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  }

  function standalone() {
    try {
      if (window.navigator.standalone === true) return true;
      return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    } catch (e) {
      return false;
    }
  }

  function framed() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }

  // the tip shows in Safari on an iPad or iPhone, until someone puts it away
  function tipWanted() {
    return appleTouch() && !standalone() && !framed() && read(local(), TIP_KEY) !== 'away';
  }

  // homeTip(onAway) -> the tip card, or null when it is not wanted here
  function homeTip(onAway) {
    if (!tipWanted()) return null;
    const device = /iPhone|iPod/.test(navigator.userAgent || '') ? 'iPhone' : 'iPad';
    const card = el('aside', { class: 'home-tip', 'aria-label': 'Tip for ' + device },
      el('span', { class: 'home-tip__icon' }, T.ui.icon('share')),
      el('div', { class: 'home-tip__text' },
        el('p', { class: 'home-tip__title' }, 'Keep your stars safe on this ' + device),
        el('p', { class: 'home-tip__en' }, 'Tap ', el('b', 'Share'), ', then ', el('b', 'Add to Home Screen'),
          '. Always open the trail from the new icon.'),
        el('p', { class: 'home-tip__vi', lang: 'vi' }, 'Chạm ', el('b', 'Chia sẻ'), ', rồi chọn ', el('b', 'Thêm vào MH chính'),
          '. Luôn mở ứng dụng từ biểu tượng mới.'),
        T.ui.button({
          label: 'Got it', kind: 'quiet', icon: 'check', cls: 'home-tip__ok',
          onClick: function () {
            write(local(), TIP_KEY, 'away');
            if (card.parentNode) card.parentNode.removeChild(card);
            if (typeof onAway === 'function') onAway();
          }
        })));
    return card;
  }

  function saveWarning() {
    return el('aside', { class: 'home-tip home-tip--warn', role: 'note' },
      el('span', { class: 'home-tip__icon' }, T.ui.icon('info')),
      el('div', { class: 'home-tip__text' },
        el('p', { class: 'home-tip__title' }, 'This browser cannot save stars'),
        el('p', { class: 'home-tip__en' }, 'Open the trail in a normal window, not a private one.'),
        el('p', { class: 'home-tip__vi', lang: 'vi' }, 'Hãy mở ứng dụng trong cửa sổ thường, không phải cửa sổ ẩn danh.')));
  }

  /* ---------- the name button on the map ---------- */

  function chip() {
    const face = el('span', { class: 'who__face' });
    const name = el('span', { class: 'who__name' });
    const meta = el('span', { class: 'who__meta' });
    const node = el('button', { type: 'button', class: 'pressable who' }, face, el('span', { class: 'who__text' }, name, meta));
    node.addEventListener('click', function () {
      T.fx.sfx('tap');
      openMenu();
    });

    function refresh() {
      const p = current;
      node.hidden = !p;
      if (!p) return;
      T.ui.empty(face).appendChild(playerAvatar(p));
      name.textContent = p.name;
      meta.textContent = roleOf(p.cls) === 'student' ? p.cls : clsLabel(p.cls);
      node.setAttribute('aria-label', 'Playing: ' + p.name + ', ' + (roleOf(p.cls) === 'student' ? 'class ' + p.cls : clsLabel(p.cls)) + '. Tap to switch player.');
    }
    refresh();
    return { el: node, refresh: refresh };
  }

  function openMenu() {
    const p = current;
    if (!p) return;
    const role = roleOf(p.cls);
    T.ui.closeOverlays();                             // a greeting still showing would sit on the sheet
    const stars = T.progress.totalStars();
    const badges = (T.stops || []).filter(function (s) { return T.progress.hasBadge(s.n); }).length;
    const meter = T.ui.stars(stars > 0 ? 1 : 0, 1);
    meter.setAttribute('aria-hidden', 'true');        // read as "15 stars", like the home header (R3B-06)
    T.ui.dialog({
      title: p.name,
      sheet: true,
      cls: 'who-menu',
      body: [
        el('div', { class: 'who-menu__card', dataset: { hue: hueOf(p.id) } }, playerAvatar(p, 'avatar--lg'),
          el('div', { class: 'who-menu__text' },
            el('p', { class: 'who-menu__meta' }, clsLabel(p.cls)),
            el('p', { class: 'who-menu__score' },
              el('span', { class: 'star-total', role: 'img', 'aria-label': stars + (stars === 1 ? ' star' : ' stars') },
                meter, el('span', { 'aria-hidden': 'true' }, String(stars))),
              el('span', { class: 'who-menu__badges' }, badges + (badges === 1 ? ' badge' : ' badges'))))),
        role === 'student'
          ? el('p', { class: 'who-menu__note' }, 'Not you? Tap Switch player, then tap your class and type your own name.')
          : el('p', { class: 'who-menu__note' }, 'Not you? Tap Switch player.'),
        role === 'student'
          ? el('p', { class: 'who-menu__note', lang: 'vi' }, 'Không phải em? Chạm Switch player, rồi chọn lớp và nhập tên của em.')
          : el('p', { class: 'who-menu__note', lang: 'vi' }, 'Không phải bạn? Chạm Switch player.'),
        role === 'teacher' ? el('div', { class: 'who-menu__code who-menu__code--help' },
          el('p', { class: 'who-menu__code-title' }, 'Help a student ', el('span', { lang: 'vi' }, 'Hỗ trợ học sinh')),
          el('div', { class: 'who-menu__code-btns' },
            T.ui.button({ label: 'Check a student\'s code', icon: 'trophy', kind: 'primary', cls: 'who-menu__check', onClick: function () { if (T.progressCode) T.progressCode.showCheck(); } }))) : null,
        el('div', { class: 'who-menu__code' },
          el('p', { class: 'who-menu__code-title' }, 'Changing device? ', el('span', { lang: 'vi' }, 'Đổi thiết bị?')),
          el('div', { class: 'who-menu__code-btns' },
            T.ui.button({ label: 'My progress code', icon: 'share', kind: 'secondary', cls: 'who-menu__mine', onClick: function () { if (T.progressCode) T.progressCode.showMine(); } }),
            T.ui.button({ label: 'Enter a progress code', icon: 'device', kind: 'secondary', cls: 'who-menu__enter', onClick: function () { if (T.progressCode) T.progressCode.askForCode(); } })))
      ],
      actions: [
        role === 'visitor' ? null : { label: role === 'teacher' ? 'Fix my name' : 'Fix my name or class', kind: 'secondary', icon: 'pencil', onClick: edit },
        { label: 'Switch player', kind: 'primary', icon: 'people', onClick: signOut }
      ]
    });
  }

  /* ---------- the screen: tap the class, type the name, start ---------- */

  function mount() {
    const editing = pendingEdit ? find(pendingEdit) : null;
    pendingEdit = null;
    const playing = current;                          // someone already plays in this tab (the browser's Back led here)
    let role = editing ? roleOf(editing.cls) : 'student';
    const pick = { cls: editing && role === 'student' ? editing.cls : null };
    const classes = T.CLASSES.slice();
    if (pick.cls && classes.indexOf(pick.cls) < 0) classes.push(pick.cls);    // a class no longer on the list

    // who is signing in: a student, a teacher or TA, or a visitor
    const ROLES = [
      { id: 'student', icon: 'people', en: 'Student', vi: 'Học sinh' },
      { id: 'teacher', icon: 'pencil', en: 'Teacher / TA', vi: 'Giáo viên / Trợ giảng' },
      { id: 'visitor', icon: 'map', en: 'Visitor', vi: 'Khách' }
    ];
    const roleTabs = ROLES.map(function (r) {
      const node = el('button', { type: 'button', class: 'role-tab', role: 'tab', dataset: { role: r.id } },
        T.ui.icon(r.icon), el('span', { class: 'role-tab__text' }, el('span', { class: 'role-tab__en' }, r.en), el('span', { class: 'role-tab__vi', lang: 'vi' }, r.vi)));
      node.addEventListener('click', function () { if (role !== r.id) { T.fx.sfx('tap'); setRole(r.id); } });
      return node;
    });
    const roleBar = el('div', { class: 'role-tabs', role: 'tablist', 'aria-label': 'Who are you?' }, roleTabs);

    const TEXTS = {
      student: { strip: { en: 'Tap your *class*, then type your *name*.', vi: 'Chạm vào *lớp* của em, rồi nhập *tên* của em.' },
        fix: { en: 'Fix your *class* or your *name*.', vi: 'Sửa *lớp* hoặc *tên* của em.' },
        label: ['Your name ', 'tên của em'], hint: ['For example ', 'Minh An N.'] },
      teacher: { strip: { en: 'Type your *name*, then start.', vi: 'Thầy/cô nhập *tên*, rồi bắt đầu.' },
        fix: { en: 'Fix your *name*.', vi: 'Thầy/cô sửa *tên*.' },
        label: ['Your name ', 'tên của thầy/cô'], hint: ['Letters only, for example ', 'Ms Lan'] },
      visitor: { strip: { en: 'Tap *Start* to look around the trail.', vi: 'Chạm *Start* để tham quan ứng dụng.' } }
    };
    T.zipLines = T.zipLines || {};
    T.zipLines.players = { student: TEXTS.student.strip, studentFix: TEXTS.student.fix, teacher: TEXTS.teacher.strip, teacherFix: TEXTS.teacher.fix, visitor: TEXTS.visitor.strip };

    const bar = T.ui.actionBar();
    const strip = T.ui.instruction(Object.assign({ mood: 'happy' }, editing ? (TEXTS[role].fix || TEXTS[role].strip) : TEXTS.student.strip));

    // the class: every class at once, one tap
    const classLabelId = T.util.uid('class');
    const classError = el('p', { class: 'name-field__error', role: 'alert' });
    const classButtons = classes.map(function (c, i) {
      const node = T.ui.choice({ label: c, layout: 'word', value: c, sfx: 'pick', onClick: function () { pickClass(c); } });
      node.style.setProperty('--i', String(i));
      return node;
    });
    const classField = el('div', { class: 'name-field' },
      el('p', { class: 'name-field__label', id: classLabelId }, 'Class ', el('span', { lang: 'vi' }, '(lớp)')),
      el('div', { class: 'choices class-grid stagger', role: 'group', 'aria-labelledby': classLabelId }, classButtons),
      classError);

    // the name
    const inputId = T.util.uid('name');
    const hintId = T.util.uid('hint');
    const errorId = T.util.uid('error');
    const input = el('input', {
      id: inputId, class: 'name-field__input', type: 'text', value: editing && role !== 'visitor' ? editing.name : '', maxlength: String(MAX_NAME + 10),
      autocomplete: 'off', autocapitalize: 'words', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'go',
      'aria-describedby': hintId + ' ' + errorId
    });
    const nameError = el('p', { class: 'name-field__error', id: errorId, role: 'alert' });
    const nameLabel = el('label', { class: 'name-field__label', for: inputId });
    const nameHint = el('p', { class: 'name-field__hint', id: hintId });
    const nameField = el('div', { class: 'name-field' }, nameLabel, input, nameHint, nameError);
    // a visitor needs no name (the Vietnamese speaks to a grown-up: "bạn", not "em")
    const visitorNote = el('div', { class: 'visitor-note' },
      el('p', { class: 'visitor-note__en' }, 'Try every stop as a visitor. No name needed.'),
      el('p', { class: 'visitor-note__vi', lang: 'vi' }, 'Bạn có thể thử mọi trạm với tư cách khách. Không cần nhập tên.'),
      el('p', { class: 'visitor-note__en visitor-note__small' }, 'Visitor stars are saved on this device, shared by everyone who taps Visitor here.'),
      el('p', { class: 'visitor-note__vi visitor-note__small', lang: 'vi' }, 'Sao của khách được lưu trên thiết bị này, dùng chung cho mọi người chọn Khách.'));

    const extra = el('div', { class: 'players__extra' });
    const inner = el('div', { class: 'players__inner' }, strip.el, el('div', { class: 'players__body rise' }, roleBar, classField, nameField, visitorNote), extra);
    const scroller = el('div', { class: 'players__scroll' }, inner);
    // the top bar: the title and the school line, and "How to use" (the picture page, which also opens the written guide)
    const howto = T.ui.button({ label: 'How to use', sub: 'Hướng dẫn', icon: 'help', kind: 'secondary', cls: 'howto-open',
      onClick: function () { T.router.go('how-to'); } });
    const head = el('header', { class: 'home__head players__head' },
      el('div', { class: 'brand' }, T.ui.brandMark(), T.brand.text()),
      howto);
    T.shell.screen.appendChild(el('div', { class: 'players' }, head, T.brand.strip(), scroller, bar.el));

    if (T.howto && !editing) extra.appendChild(T.howto.card());
    if (!canSave()) extra.appendChild(saveWarning());
    if (!editing) {
      const tip = homeTip();
      if (tip) extra.appendChild(tip);
    }

    function paintClasses() {
      classButtons.forEach(function (node) {
        const on = node.getAttribute('data-value') === pick.cls;
        node.classList.toggle('is-picked', on);
        node.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function setRole(next) {
      role = next;
      roleTabs.forEach(function (node) {
        const on = node.getAttribute('data-role') === role;
        node.classList.toggle('is-on', on);
        node.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      classField.hidden = role !== 'student';
      nameField.hidden = role === 'visitor';
      visitorNote.hidden = role !== 'visitor';
      const t = TEXTS[role];
      strip.set(Object.assign({ mood: 'happy' }, editing && t.fix ? t.fix : t.strip));
      if (t.label) {
        T.ui.empty(nameLabel).append(t.label[0], el('span', { lang: 'vi' }, '(' + t.label[1] + ')'));
        T.ui.empty(nameHint).append(t.hint[0], el('b', t.hint[1]), role === 'teacher' ? '.' : '');
      }
      showProblem(classError, null);
      showProblem(nameError, null, input);
    }

    function pickClass(c) {
      pick.cls = c;
      paintClasses();
      showProblem(classError, null);
      // straight on to the name (the tap was the child's own, so a tablet opens its keyboard)
      if (!input.value.trim()) {
        try { input.focus(); } catch (e) { /* focus is a nicety */ }
      }
    }

    function showProblem(box, issue, field) {
      T.ui.empty(box);
      if (field) {
        field.classList.toggle('is-wrong', !!issue);
        field.setAttribute('aria-invalid', issue ? 'true' : 'false');
      }
      if (!issue) return;
      box.appendChild(el('span', issue.en));
      box.appendChild(el('span', { class: 'name-field__error-vi', lang: 'vi' }, issue.vi));
    }

    // start playing: the map opens with this child's own stars
    function start(id, isNew) {
      const p = choose(id);
      if (!p) return;
      T.router.go('home');
      T.fx.sfx(isNew ? 'chime' : 'pop');
      const r = roleOf(p.cls);
      if (r === 'visitor') { T.ui.toast('Welcome, *visitor*! Enjoy the trail.'); return; }
      const call = r === 'teacher' ? p.name : callName(p.name);
      T.ui.toast(isNew ? 'Hi *' + call + '*! Your trail starts here.' : 'Welcome back, *' + call + '*!');
    }

    function submit() {
      if (role === 'visitor') {
        if (editing) {
          update(editing.id, { name: 'Visitor', cls: VISITOR });
          if (current && current.id === editing.id) choose(editing.id);
          T.router.go('home');
          return;
        }
        // ONE shared visitor on this device: everyone who taps Visitor carries on with the same stars
        const guest = list().filter(function (p) { return p.cls === VISITOR; })[0];
        start(guest ? guest.id : create({ name: 'Visitor', cls: VISITOR }).id, !guest);
        return;
      }
      if (role === 'teacher') pick.cls = TEACHER;
      else if (pick.cls === TEACHER || pick.cls === VISITOR) pick.cls = null;
      const name = tidy(input.value, role === 'teacher');
      const classIssue = pick.cls ? null : { en: 'Tap your class.', vi: 'Hãy chạm vào lớp của em.' };
      const nameIssue = role === 'teacher' ? teacherProblem(name) : problem(name);
      showProblem(classError, classIssue);
      showProblem(nameError, nameIssue, input);
      if (classIssue || nameIssue) {
        T.fx.sfx('no');
        strip.zip('oops');
        if (classIssue) scroller.scrollTop = 0; else input.focus();
        return;
      }
      input.value = name;
      if (editing) {
        // the same class and name as another child on this device: it is this child's own trail (a wrong class
        // or a typo was just fixed), so carry on there, with the better result of every unit from both (R3B-01)
        const same = list().filter(function (p) { return p.id !== editing.id && p.cls === pick.cls && sameName(p.name, name); })[0];
        if (same && mergeTrail(editing.id, same.id)) {
          remove(editing.id);
          start(same.id, false);
          return;
        }
        update(editing.id, { name: name, cls: pick.cls });
        if (current && current.id === editing.id) choose(editing.id);
        T.router.go('home');
        T.fx.sfx('pop');
        T.ui.toast('Your details are saved, *' + (role === 'teacher' ? name : callName(name)) + '*.');
        return;
      }
      // the same class and name on this device: the same child (or teacher), who carries on with their stars
      const twin = list().filter(function (p) { return p.cls === pick.cls && sameName(p.name, name); })[0];
      if (twin) { start(twin.id, false); return; }
      start(create({ name: name, cls: pick.cls }).id, true);
    }

    input.addEventListener('input', function () {
      if (input.classList.contains('is-wrong')) showProblem(nameError, null, input);
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); submit(); }
    });

    paintClasses();
    setRole(role);
    // the first time on this device: a hand points at the classes (nobody is playing yet: remembered on the device)
    if (!editing && !pick.cls) T.guide.point('start', function () { return role === 'student' ? classButtons[0] : null; }, { scope: 'device' });
    bar.primary({ label: editing ? 'Save my details' : 'Start my trail', iconEnd: editing ? 'check' : 'next', onClick: submit });
    if (editing || playing) bar.secondary({ label: 'Back', icon: 'back', onClick: function () { T.router.go('home'); } });

    return function cleanup() {
      T.ui.closeOverlays();
    };
  }

  T.router.register('players', mount);

  // nobody has said who is playing in this tab: every address opens the start screen first
  T.router.setGate(function (route) {
    if (route === 'players' || route === 'how-to') return null;      // the How to use page opens from the start screen too
    return current ? null : 'players';
  });

  // a reload in the same tab keeps the child who was playing
  (function restore() {
    const id = read(session(), ACTIVE_KEY);
    const player = id ? find(id) : null;
    if (!player) { write(session(), ACTIVE_KEY, null); return; }
    current = Object.assign({}, player);
    T.store.usePlayer(player.id);
  })();

  T.players = {
    list: list, active: active, choose: choose, signOut: signOut, edit: edit, remove: remove,
    chip: chip, canSave: canSave, homeTip: homeTip, callName: callName, roleOf: roleOf, TEACHER: TEACHER, VISITOR: VISITOR
  };
})(window.T = window.T || {});

