/* 30-home.js - Home: the trail map (route 'home').

   One winding path through nine worlds. Each world is a round picture badge with its name and
   either its stars or "Coming soon". Zip stands at the next stop. A compact header carries the
   app name, the total of stars and the sound switch. ONE big button starts or continues the next
   step. A quiet note for families and teachers sits at the very bottom.

   Way-finding (Phase 2): a gold arc on each open world's ring shows how many of its five steps are done; a "?"
   button in the header opens the How to use page (route 'how-to').
   Rewards (Phase 6): the total of stars in the header is a button to the trophy shelf (route 'trophies'); a badge
   that was just won flies onto its stop once (T.rewards.land, trophy.landed.N).

   The Summit (Session 14) is a tenth node after Stop 9: a mountain top with a flag (badge-summit), locked kindly until
   the Mini Practice tests of 7 stops are done (T.summit.isOpen, 79-summit.js); Zip stands there once every stop is finished.

   The nodes are placed by CSS (four layouts: a tall zigzag on phones, a three by three snake and the Summit under it on
   an upright tablet, two rows of five on a laptop, one long wave on the board). The
   trail is then drawn through the places the nodes really have, so the two can never disagree. */
(function (T) {
  'use strict';

  const el = T.util.el;

  const TEXT = {
    app: T.brand ? T.brand.title : 'EOS 1 – G5 ESL Revision Trail',
    soon: 'Coming soon',
    family: 'For families and teachers',
    notes: [
      { icon: 'info',
        en: 'This app helps Grade\u00a05 pupils revise ESL (English) for the End of Semester\u00a01 exam: Listening, Reading and Use of English, and Writing. It follows Cambridge Primary English as a Second Language Stage\u00a06.',
        vi: 'Ứng dụng giúp học sinh lớp\u00a05 ôn tập môn Tiếng Anh (ESL) cho bài kiểm tra cuối học kì\u00a01: Nghe, Đọc và Sử dụng tiếng Anh, Viết. Theo chương trình Cambridge Primary English as a Second Language Stage\u00a06.' },
      { icon: 'people',
        en: 'Each child taps their class, types their name and starts straight away. On a shared device, typing the same class and name again brings back that child\'s stars.',
        vi: 'Mỗi em chọn lớp, nhập tên rồi bắt đầu ngay. Trên thiết bị dùng chung, em nhập lại đúng lớp và tên để chơi tiếp với số sao của mình.' },
      { icon: 'device',
        en: 'Stars and progress are saved on this device, separately for each child. To move them to another device, tap the child\'s name at the top, then My progress code. On an iPad, tap Share, then Add to Home Screen, and always open the trail from that icon so the stars are kept.',
        vi: 'Sao và tiến độ được lưu trên thiết bị này, riêng cho từng em. Để chuyển sang thiết bị khác, chạm vào tên của em ở trên cùng, rồi chọn My progress code. Trên iPad, hãy chạm Chia sẻ, chọn Thêm vào MH chính, và luôn mở ứng dụng từ biểu tượng đó để giữ sao.' },
      { icon: 'shield',
        en: 'Names stay on this device and are never sent anywhere. There is no login and no password.',
        vi: 'Tên chỉ được lưu trên thiết bị này và không được gửi đi đâu. Không cần đăng nhập hay mật khẩu.' }
    ]
  };

  /* ---------- which stop is next ---------- */

  function stepLabel(id) {
    for (let i = 0; i < T.STEPS.length; i++) if (T.STEPS[i].id === id) return T.STEPS[i].label;
    return String(id || '');
  }

  // a stop that can be played: it is open and its content pack has arrived
  function playable(info) {
    return !!info && info.status === 'open' && !!T.packs[info.n];
  }

  // a stop that can be opened from the map (its hub says "coming soon" while the pack is missing)
  function openable(info) {
    return !!info && info.status === 'open';
  }

  // a stop is finished when its badge is won; a quick-practice stop (only its games are ready) is
  // finished once every step it has is done, so Zip walks on to the next stop
  function finished(info) {
    if (T.progress.hasBadge(info.n)) return true;
    return !!info.quick && playable(info) && nextReady(info.n) === null;
  }

  // where Zip stands: the first open stop that is not finished, else the last open stop
  function currentStop() {
    const open = T.stops.filter(openable);
    for (let i = 0; i < open.length; i++) if (!finished(open[i])) return open[i];
    return open.length ? open[open.length - 1] : null;
  }

  // the world as a sentence says it: 'the Flower Lab', 'Water on Earth' (20-stops.js)
  function place(info) {
    return info.place || 'the ' + info.world;
  }

  // the step to continue at: the first one that is not done and whose part is in the pack
  function nextReady(n) {
    const has = T.stage && typeof T.stage.hasPart === 'function' ? T.stage.hasPart : function () { return true; };
    for (let i = 0; i < T.STEPS.length; i++) {
      const id = T.STEPS[i].id;
      if (T.progress.stepState(n, id) !== 'done' && has(n, id)) return id;
    }
    return null;
  }

  function hasStarted(n) {
    return T.STEPS.some(function (step) { return T.progress.stepState(n, step.id) !== 'new'; });
  }

  /* ---------- the header: brand, total of stars, sound ---------- */

  function buildHead() {
    const count = el('span', { class: 'star-total__n' }, '0');
    // the total of stars is the way to the trophy shelf (Phase 6): a trophy, the star and the count; "My trophies" where there is room
    const total = el('button', { type: 'button', class: 'star-total home__trophies', 'aria-label': 'My trophies: 0 stars',
      onClick: function () { T.fx.sfx('tap'); T.router.go('trophies'); } });
    // the child who is playing: tap to switch (the school build: its "Subjects" chip and the child's name)
    const who = T.school && T.school.chip ? T.school.chip() : T.players ? T.players.chip() : null;
    const help = T.howtoButton();
    const head = el('header', { class: 'home__head' },
      el('div', { class: 'brand' }, T.ui.brandMark(), T.brand.text()),
      who ? who.el : null, total, help, T.ui.soundSwitch());

    function refresh() {
      if (who) who.refresh();
      const n = T.progress.totalStars();
      T.ui.empty(total);
      total.appendChild(el('span', { class: 'home__trophies-icon', 'aria-hidden': 'true' }, T.ui.icon('trophy')));
      total.appendChild(el('span', { class: 'home__trophies-text', 'aria-hidden': 'true' }, T.REWARDS.link));
      total.appendChild(T.ui.stars(n > 0 ? 1 : 0, 1));
      total.lastChild.setAttribute('aria-hidden', 'true');
      count.textContent = String(n);
      total.appendChild(count);
      total.setAttribute('aria-label', T.REWARDS.link + ': ' + n + (n === 1 ? ' star' : ' stars'));
    }

    return { el: head, refresh: refresh };
  }

  /* ---------- one node of the map ---------- */

  function buildNode(info, i) {
    // where the stop stands in each layout: its index (the phone zigzag and the board wave), its row and
    // column in the four-wide snake (an upright tablet: 4, 4, then Stop 9 and the Summit) and in the two rows of five (a laptop)
    const row = Math.floor(i / 4), col = row === 2 ? 1 + i % 4 : row % 2 ? 3 - i % 4 : i % 4;   // Stop 9 and the Summit in the middle
    // two rows of five on a laptop: stops 6 to 9 under stops 5 to 2, the Summit under stop 1
    const row5 = i < 5 ? 0 : 1, col5 = i < 5 ? i : [4, 3, 2, 1][i - 5];     // the Summit (col 0) ends the second row
    const side = i % 2 ? 'is-odd' : 'is-even';
    const pos = {
      '--i': String(i), '--row': String(row), '--col': String(col), '--wob': col === 1 || col === 2 ? '1' : '0',
      '--row5': String(row5), '--col5': String(col5), '--wob5': String(col5 % 2)   // the same column, the same step down
    };

    const disc = T.ui.plate(T.ui.art(info.badgeArt, { decorative: true }), { shape: 'round bleed', replay: false, cls: 'map-node__disc' });
    const meta = el('span', { class: 'map-node__meta' });
    const flag = el('span', { class: 'map-node__flag', 'aria-hidden': 'true' });
    // the steps done, as a gold arc on the world's ring (drawn from the top, clockwise)
    const arc = el('circle', { class: 'map-node__arc', cx: '50', cy: '50', r: '48.4', pathLength: '100' });
    const prog = el('svg', { class: 'map-node__prog', viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false' }, arc);
    const button = el('button', { type: 'button', class: 'map-node__btn' },
      disc, prog,
      el('span', { class: 'map-node__num', 'aria-hidden': 'true' }, String(info.n)),
      flag,
      el('span', { class: 'map-node__label', 'aria-hidden': 'true' }, el('span', { class: 'map-node__name' }, info.world), meta));
    button.addEventListener('click', function () {
      T.fx.sfx('tap');
      T.router.go('stop-' + info.n);
    });
    const zipSpot = el('span', { class: 'map-node__zip', 'aria-hidden': 'true' });
    const item = el('li', { class: ['map-pos', 'map-node', side], style: pos, dataset: { hue: info.n, n: info.n } }, button, zipSpot);
    const blob = el('span', { class: ['map-pos', 'map__blob', side], style: pos, dataset: { hue: info.n } });

    function refresh(isCurrent) {
      const open = openable(info);
      const ready = playable(info);
      const stars = ready ? T.progress.stopStars(info.n) : 0;
      const badge = ready && T.progress.hasBadge(info.n);
      item.classList.toggle('is-open', open);
      item.classList.toggle('is-soon', !open);
      item.classList.toggle('is-building', open && !ready);
      item.classList.toggle('is-current', isCurrent);
      item.classList.toggle('is-done', badge);
      T.ui.empty(meta);
      T.ui.empty(flag);
      T.ui.empty(zipSpot);
      const done = ready ? T.STEPS.filter(function (st) { return T.progress.stepState(info.n, st.id) === 'done'; }).length : 0;
      prog.style.display = done > 0 ? '' : 'none';
      arc.setAttribute('stroke-dasharray', (done / T.STEPS.length * 100).toFixed(1) + ' 100');
      if (ready) {
        meta.appendChild(T.ui.stars(stars > 0 ? 1 : 0, 1));
        meta.appendChild(el('span', { class: 'map-node__count' }, stars + ' / 15'));
        if (badge) flag.appendChild(T.ui.icon('trophy'));
      } else {
        meta.appendChild(document.createTextNode(TEXT.soon));          // open, but its pack has not arrived yet; or soon
        if (!open) flag.appendChild(T.ui.icon('lock'));
      }
      if (isCurrent) zipSpot.appendChild(T.ui.zip(badge ? 'cheer' : 'happy'));
      button.setAttribute('aria-label', 'Stop ' + info.n + ': ' + info.world + '. ' + info.title + '. ' +
        (ready ? done + ' of ' + T.STEPS.length + ' steps done, ' + stars + ' of 15 stars.' + (badge ? ' Badge won: ' + info.badge + '.' : '') + (info.quick ? ' Quick practice.' : '') : TEXT.soon + '.'));
    }

    return { info: info, el: item, blob: blob, disc: disc, refresh: refresh };
  }

  /* ---------- the Summit: the tenth node, after Stop 9 ---------- */

  function buildSummit(i) {
    const W = T.SUMMIT;
    const row = Math.floor(i / 4);
    const pos = { '--i': String(i), '--row': String(row), '--col': '2', '--wob': '1', '--row5': '1', '--col5': '0', '--wob5': '1' };   // a step lower than stop 1 above it (its name)
    const side = i % 2 ? 'is-odd' : 'is-even';
    const disc = T.ui.plate(T.ui.art('badge-summit', { decorative: true }), { shape: 'round bleed', replay: false, cls: 'map-node__disc' });
    const meta = el('span', { class: 'map-node__meta' });
    const flag = el('span', { class: 'map-node__flag', 'aria-hidden': 'true' });
    const button = el('button', { type: 'button', class: 'map-node__btn' }, disc,
      flag, el('span', { class: 'map-node__label', 'aria-hidden': 'true' }, el('span', { class: 'map-node__name' }, W.name), meta));
    button.addEventListener('click', function () { T.fx.sfx('tap'); T.router.go('summit'); });
    const zipSpot = el('span', { class: 'map-node__zip', 'aria-hidden': 'true' });
    const item = el('li', { class: ['map-pos', 'map-node', 'map-node--summit', side], style: pos, dataset: { hue: 10, n: 'summit' } }, button, zipSpot);
    const blob = el('span', { class: ['map-pos', 'map__blob', side], style: pos, dataset: { hue: 10 } });

    function refresh(isCurrent) {
      const open = T.summit.isOpen(), won = T.summit.won();
      item.classList.toggle('is-open', open);
      item.classList.toggle('is-soon', !open);
      item.classList.toggle('is-current', isCurrent);
      item.classList.toggle('is-done', won);
      T.ui.empty(meta); T.ui.empty(flag); T.ui.empty(zipSpot);
      meta.appendChild(document.createTextNode(won ? W.mapWon : open ? W.mapOpen : W.mapSoon));
      flag.appendChild(T.ui.icon(won ? 'trophy' : open ? 'star' : 'lock'));
      if (isCurrent) zipSpot.appendChild(T.ui.zip(won ? 'cheer' : 'happy'));
      button.setAttribute('aria-label', W.name + '. ' + (won ? W.mapWon : open ? W.mapOpen : W.locked.title) + '.');
    }
    return { info: { n: 10, summit: true }, el: item, blob: blob, disc: disc, refresh: refresh };
  }

  // Zip walks on to the Summit once every open stop is finished and the Summit is open
  function atSummit() {
    return !!T.summit && T.summit.isOpen() && T.stops.filter(openable).every(finished);
  }

  /* ---------- the map: ground colours, the trail, the nodes ---------- */

  function round1(v) {
    return Math.round(v * 10) / 10;
  }

  // one stretch of trail from a to b, as the tail of an SVG path
  function curve(a, b, layout, width) {
    const dx = b.x - a.x, dy = b.y - a.y;
    let c;
    if (layout === 'tall') {
      c = [a.x, a.y + dy * 0.58, b.x, b.y - dy * 0.58];                 // leaves downwards, arrives from above
    } else if (Math.abs(dx) < Math.abs(dy) * 0.6) {
      // the turn at the end of a row: a hairpin that bulges towards the nearer edge, and stays on the map
      const right = a.x > width / 2;
      const room = (right ? width - Math.max(a.x, b.x) : Math.min(a.x, b.x)) - 20;
      const out = (right ? 1 : -1) * Math.max(0, Math.min(width * 0.13, Math.abs(dy) * 0.75, room));
      const far = right ? Math.max(a.x, b.x) + out : Math.min(a.x, b.x) + out;
      c = [far, a.y + dy * 0.05, far, b.y - dy * 0.05];
    } else {
      c = [a.x + dx * 0.5, a.y, b.x - dx * 0.5, b.y];                   // leaves sideways, arrives sideways
    }
    return 'C' + c.concat([b.x, b.y]).map(round1).join(' ');
  }

  function buildMap() {
    const stops = T.stops.map(buildNode);
    const nodes = stops.concat([buildSummit(T.stops.length)]);
    const road = ['trail--case', 'trail--road', 'trail--dash'].map(function (name) { return el('path', { class: 'trail ' + name }); });
    const gold = el('g', { class: 'trail-gold' });
    const trail = el('svg', { class: 'map__trail', 'aria-hidden': 'true', focusable: 'false' }, road, gold);
    const root = el('div', { class: 'map rise' },
      el('div', { class: 'map__ground', 'aria-hidden': 'true' }, nodes.map(function (n) { return n.blob; })),
      trail,
      el('ol', { class: 'map__nodes' }, nodes.map(function (n) { return n.el; })));

    // draw the trail through the places the nodes have right now
    function draw() {
      const width = root.clientWidth, height = root.clientHeight;
      if (!width || !height) return;
      const layout = getComputedStyle(root).getPropertyValue('--map-layout').trim() || 'tall';
      const pts = nodes.map(function (n) { return { x: n.el.offsetLeft, y: n.el.offsetTop, r: n.disc.offsetWidth / 2 }; });
      const start = function (p) { return 'M' + round1(p.x) + ' ' + round1(p.y); };
      trail.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      let d = start(pts[0]);
      for (let i = 1; i < pts.length; i++) d += curve(pts[i - 1], pts[i], layout, width);
      road.forEach(function (path) { path.setAttribute('d', d); });

      // gold: the stretch after a stop fills up as its stars are won (all 15 reach the next stop)
      T.ui.empty(gold);
      for (let i = 0; i < pts.length - 1; i++) {
        const info = nodes[i].info;
        const part = !info.summit && playable(info) ? T.progress.stopStars(info.n) / 15 : 0;
        if (part <= 0) continue;
        const path = el('path', { class: 'trail trail--gold', d: start(pts[i]) + curve(pts[i], pts[i + 1], layout, width) });
        gold.appendChild(path);
        let length = 0;
        try { length = path.getTotalLength(); } catch (e) { length = 0; }
        const hiddenA = pts[i].r + 7, hiddenB = pts[i + 1].r + 7;        // the ends lie under the two badges
        const shown = hiddenA + Math.max(0, length - hiddenA - hiddenB) * Math.min(1, part);
        path.style.strokeDasharray = round1(shown) + ' ' + round1(length + 20);
      }
    }

    function refresh() {
      const current = atSummit() ? { n: 10 } : currentStop();
      nodes.forEach(function (n) { n.refresh(!!current && n.info.n === current.n); });
      draw();
    }

    // keep the trail right when the size of the map changes; returns a function that stops watching
    function watch() {
      let observer = null;
      if (typeof ResizeObserver === 'function') {
        observer = new ResizeObserver(draw);
        observer.observe(root);
      } else {
        window.addEventListener('resize', draw);
      }
      return function () {
        if (observer) observer.disconnect(); else window.removeEventListener('resize', draw);
      };
    }

    // bring the stop where Zip stands into view, Zip included (it matters once later stops are open)
    function showCurrent(scroller) {
      const current = atSummit() ? { n: 10 } : currentStop();
      const node = current && nodes[current.n - 1];
      if (!node || scroller.scrollHeight <= scroller.clientHeight) return;
      const above = Math.max(scroller.clientHeight * 0.4, node.disc.offsetHeight * 1.3);
      scroller.scrollTop = Math.max(0, node.el.offsetTop - above);
    }

    // the disc of a stop (a new badge flies onto it, 18-rewards.js)
    function discOf(n) { const node = stops[n - 1]; return node ? node.disc : null; }

    return { el: root, refresh: refresh, watch: watch, showCurrent: showCurrent, discOf: discOf };
  }

  /* ---------- the quiet note for families and teachers ---------- */

  // onToggle(open) runs just before the note opens or closes
  function buildFamily(onToggle) {
    const panelId = T.util.uid('family');
    const viLines = [];
    const notes = (T.school && T.school.notes) || TEXT.notes;   // the school build has its own (src/school/)
    const list = el('ul', { class: 'family__list' }, notes.map(function (note) {
      const vi = el('p', { class: 'family__vi', lang: 'vi', hidden: true }, note.vi);
      viLines.push(vi);
      return el('li', T.ui.icon(note.icon), el('div', el('p', { class: 'family__en' }, note.en), vi));
    }));
    const viButton = T.ui.viButton(function (open) {
      viLines.forEach(function (line) { line.hidden = !open; });
      if (panel.scrollIntoView) panel.scrollIntoView({ block: 'nearest' });
    });
    const panel = el('div', { class: 'family__panel', id: panelId, hidden: true }, list, viButton);
    const toggle = el('button', { type: 'button', class: 'family__toggle', 'aria-expanded': 'false', 'aria-controls': panelId },
      T.ui.icon('people'), el('span', TEXT.family), T.ui.icon('chevron'));
    toggle.addEventListener('click', function () {
      const open = panel.hidden;
      if (typeof onToggle === 'function') onToggle(open);
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      T.fx.sfx('tap');
      if (open && panel.scrollIntoView) panel.scrollIntoView({ block: 'nearest' });
    });
    return el('section', { class: 'family' }, toggle, panel);
  }

  /* ---------- the ONE big button ---------- */

  function setMainButton(bar) {
    if (atSummit()) {                                  // every stop is finished: the way on is the Summit
      bar.primary({ label: T.SUMMIT.way.label, iconEnd: 'next', onClick: function () { T.router.go('summit'); } });
      return;
    }
    const info = currentStop();
    if (!info) { bar.primary(null); return; }
    const next = playable(info) ? nextReady(info.n) : null;
    if (!next) {                                       // all done, or nothing ready yet: the stop is a place to visit
      bar.primary({ label: 'Visit ' + place(info), onClick: function () { T.router.go('stop-' + info.n); } });
      return;
    }
    bar.primary({
      label: hasStarted(info.n) ? 'Continue' : 'Start',
      sub: info.world + ': ' + stepLabel(next),
      iconEnd: 'next',
      onClick: function () { T.router.go('stop-' + info.n + '-' + next); }
    });
  }

  /* ---------- the screen ---------- */

  function mount() {
    const head = buildHead(), map = buildMap(), bar = T.ui.actionBar();
    // On big screens the map stretches to fill the screen. While the family note is open the map
    // keeps the height it had, so the note makes the page longer instead of squeezing the map.
    const holdMap = function (open) {
      map.el.style.minHeight = '';
      if (open) map.el.style.minHeight = map.el.offsetHeight + 'px';
    };
    const scroller = el('div', { class: 'home__scroll' }, map.el, buildFamily(holdMap));
    T.shell.screen.appendChild(el('div', { class: 'home' }, head.el, T.brand.strip(), scroller, bar.el));

    function refresh() {
      head.refresh();
      map.refresh();
      setMainButton(bar);
    }
    refresh();
    map.showCurrent(scroller);
    document.addEventListener('trail:progress', refresh);
    const unwatch = map.watch();
    const stopLanding = T.rewards.land(map.discOf);      // Phase 6: a badge just won flies onto its stop, once

    return function cleanup() {
      document.removeEventListener('trail:progress', refresh);
      unwatch();
      stopLanding();
      T.ui.closeOverlays();
    };
  }

  T.router.register('home', mount);
})(window.T = window.T || {});

