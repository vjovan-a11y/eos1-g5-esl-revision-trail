/* 50-practise.js: the Practise step shell (route stop-N-practise). Copied from the Grade 4 Games shell (50-games.js).

   Rewards (Phase 6, 18-rewards.js): g.streak(first) counts right answers at the first try in a row over the whole
   game ("3 in a row!" on Zip, stops.N.streak.practise); the result card shows "New best!" with the old best points.
   Maths changes: the step is 'practise' and reads pack.practise (ids unique across stops: 's1r', 's1a');
   a game may set hearts: false (the maths kits: two tries and hints instead of hearts; no heart bonus);
   T.games.plays(stop, id) -> how many times a game was played, so 'Play again' can give new numbers.

   ========================== THE SHELL API (final) ==========================

   Register a game (one file per game, 51-game-<name>.js, loaded after this one):

     T.games.register(id, game)     id = 'g1' | 'g2' | 'g3', the ids in pack.games
     T.games.get(id) -> game | null
     T.games.LINES                  the shared lines of brief 05 section 2.9: spare, zipShows, levelDone ({en, vi})
     T.games.starsFor(score, max)   0 (no max) or 1..3: 1 = finished, 2 = 75% or more, 3 = 90% or more

   game = {
     title: 'Flower Builder',       optional: the pack entry's title is used when missing
     blurb: {en, vi},               optional: the pack entry's blurb is used when missing (menu card line)
     art: 'kit-flower',             optional: the pack entry's art is used when missing (menu card picture)
     levels: 3,                     number of levels
     mount(g)                       build ONE level into g.body. Called again for the next level and
                                    for a retry, always with a fresh, empty g.body and a fresh g.
     // optional extras
     levelTitles: ['Build', 'Label', 'Test'],   banner "Level 2: Label" (else pack levels[i].title, else "Level 2")
     resultTitle: 'Flower built!',              title of the game's result card (else 'Game finished!')
     result: {en, vi},                          the one line on the result card (else pack entry ui.result)
     outOfHearts: 'spare' | 'retry'             default 'spare' (brief 05 section 2.4). 'retry' = the
                                                contract's original rule: at 0 hearts the shell stops the
                                                level and offers "Try this level again".
   }

   g = {   (a new g for every level; after the level ends every member is a harmless no-op)
     level,                 1, 2 or 3
     levels,                how many levels this game has
     body,                  the element to build in: a flex column (position: relative) that fills the
                            stage body under the instruction strip. Use the kit's stage-stack recipes in it.
     ctx,                   the stage ctx: instruct(), zip(), primary(), secondary(), progress(), later(),
                            every(), frame(), onLeave(). Do NOT call ctx.title, ctx.onBack, ctx.result,
                            ctx.finish or ctx.saveUnit: the shell owns them.
     hearts,                hearts left (read-only getter; 3 at the start of every level)
     loseHeart(),           -> hearts left after the loss. Pops a heart and plays nothing else.
                            When it returns 0 (outOfHearts 'spare'): the shell plays 'chime', sets the
                            strip to LINES.spare and refills ONE heart (g.hearts is 1 again right away),
                            and the level loses its heart bonus. The game must then show the answer to
                            the round in play (it scores 0): r.wrong() below does the scoring for you.
     score(points, max),    add the points earned for one answer and the most it could have earned
     levelDone(),           the level is finished: the shell adds the heart bonus, saves the checkpoint,
                            shows the level card ("Next level"), or after the last level saves the
                            unit with ctx.saveUnit(id, earned, max) and shows the game's result card.

     // added by the shell for brief 05 section 2
     id,                    the game id ('g1')
     stop,                  the stop number
     data,                  the pack entry of this game: {id, module, title, blurb, art, levels: [...], ui: {...}}
     levelData,             data.levels[level - 1] or null
     line(key) -> {en, vi}  data.ui[key], else LINES[key], else null
     say(keyOrLine, mood)   ctx.instruct with line(key) (or a {en, vi} object). mood optional.
     rounds(i, n)           top-bar round dots for this level (ctx.progress); rounds(null) hides them
     round({choices}) -> r  one scored answer with the points rule of section 2.4 (max 2 points):
        r.right(el?)        -> points: 2 at the first try; 1 at the second try if the first try had
                               3 or more choices; else 0. Scores it, plays 'ok' with the streak,
                               bursts on el, Zip cheers. Returns 0 if the round is already closed.
        r.wrong(el?, {heart: true}) -> 'again' | 'show'
                               a miss: plays 'no', shakes el, Zip 'oops', costs a heart (unless
                               heart: false, for the 2nd, 3rd ... mistake found by one Check).
                               'show' = Zip shows this answer now: second miss, or the last heart went.
                               The round is then scored 0 and closed; the strip says LINES.zipShows
                               (or LINES.spare when the heart ran out). On 'again' the game sets its
                               own nudge line.
        r.show()            close the round with 0 points (the game reveals the answer itself)
        r.misses, r.closed
     right(el), wrong(el)   the feedback alone (sound, burst / shake, Zip's face), no scoring, no heart
     lamp(el)               Zip's lamp: a gold ring pulses twice on el, sound 'pop'
     lock(ms) / busy()      ignore taps for ms (a piece flying, the arm moving); busy() -> true while locked
     flyTo(node, target, {ms}) -> Promise   slides node onto target's box (transform only), then
                            resolves; the game then moves the node in the DOM. Locks taps meanwhile.
                            Under reduced motion it resolves at once.
     pickPlace({pieces, slots, onPlace(piece, slot), onPick(piece|null), drag: true}) -> {clear(), picked()}
                            tap a piece to pick it (class is-picked), tap it again to let go, tap a slot
                            to place: onPlace(piece, slot) is called (the game decides right or wrong
                            and moves the piece). Optional drag of a piece onto a slot (a move under
                            8 px is a tap; a drop elsewhere springs back, no penalty). pieces and slots
                            are arrays of elements (or functions returning arrays, read on every tap).
                            Slots under a picked piece get the class gm-slot-on (a soft dashed ring).
     pencil(svg, shape) -> path   draws a pencil stroke that draws itself, in svg's viewBox units.
                            shape: {kind: 'line'|'arrow', x1, y1, x2, y2} | {kind: 'circle', cx, cy, rx, ry}
                                 | {kind: 'tick', x, y, size}; optional width, ms, cls.
     heartsTo(el)           move the hearts pill into el (absolute, top right): e.g. the picture area.
                            By default it sits at the top right of g.body.
   }

   What the shell draws: the games menu (cards: picture, name, blurb, best stars, a tick when
   played; the first game without a result is highlighted and is the primary button "Play: <name>";
   "Finish" -> ctx.finish() once every game has a result), the top-bar title (the game's name), the
   hearts pill ("Level 2" and three hearts), the level banner (no tap needed), the level card with
   "Next level", the checkpoint (stops.N.games.resume.<id> = {level, score, max}; a returning child
   starts at the first unfinished level with the quiet button "Start again", until the first
   answer), the game's result card (stars, "Play again", "Back to the games", primary to the next
   game without a result, or "Finish"), and a friendly "coming soon" card for a game that is
   missing or whose mount throws. The back arrow inside a game returns to the menu (finished
   levels are kept by the checkpoint; the level in play is dropped).
   What a game draws: everything inside g.body for its level (picture area, the things to tap),
   its own strip lines, its own round dots (g.rounds), its own Check / Next / Go buttons.
   Points (section 2.4): 2 x scored answers through r (or g.score), plus a heart bonus the shell
   adds at levelDone: 1 point per heart left, max 3, none if a spare heart was given.
   So max = 2 x scored answers + 3 x levels.

   Changes after the API was published (dated, additions only):
   2026-11-19  T.games.forceDemo = true (testing only): the demo game plays every slot.
*/
// SHELL API READY
(function (T) {
  'use strict';

  const U = T.util;
  const el = U.el;

  /* ---------- shared lines (brief 05 section 2.9) ---------- */
  const LINES = {
    spare: { en: 'Here is a spare heart. Keep going.', vi: 'Tặng em một trái tim dự phòng. Cố lên nhé.' },
    zipShows: { en: 'Watch. Zip shows you this one.', vi: 'Em xem nhé. Zip làm mẫu câu này.' },
    levelDone: { en: 'Well done. Tap *Next level* to go on.', vi: 'Giỏi lắm. Bấm *Next level* (Màn tiếp theo) để chơi tiếp.' },
    menu: { en: 'Pick a *game*. Play all three.', vi: 'Chọn một *trò chơi*. Hãy chơi cả ba trò nhé.' },
    menuOne: { en: 'Tap the *game* to play it.', vi: 'Chạm vào *trò chơi* để chơi nhé.' },
    menuTwo: { en: 'Pick a *game*. Play both.', vi: 'Chọn một *trò chơi*. Hãy chơi cả hai trò nhé.' },
    menuMany: { en: 'Pick a *game*. Play them all.', vi: 'Chọn một *trò chơi*. Hãy chơi hết các trò nhé.' },
    menuDone: { en: 'All games played. Tap *Finish*.', vi: 'Em đã chơi hết các trò. Bấm *Finish* (Hoàn thành).' },
    soon: { en: 'This game is *coming soon*.', vi: 'Trò chơi này *sắp ra mắt*.' },
    noHearts: { en: 'No hearts left. *Try again*.', vi: 'Hết trái tim rồi. *Thử lại* nhé.' },
    back: { en: 'Welcome back. Keep going.', vi: 'Chào mừng em quay lại. Tiếp tục nhé.' }
  };

  (T.zipLines = T.zipLines || {}).practise = LINES;     // checked by test/guide.mjs (at most 10 words)

  const registry = {};

  function starsFor(score, max) {
    if (!max) return 0;
    const f = score / max;
    return f >= 0.9 ? 3 : f >= 0.75 ? 2 : 1;
  }

  T.games = {
    register(id, game) {
      if (!id || !game || typeof game.mount !== 'function') { console.error('T.games.register: bad game', id); return; }
      registry[id] = game;
    },
    get(id) { return registry[id] || null; },
    LINES: LINES,
    starsFor: starsFor,
    // how many times this game was played to the end (0 the first time): 'Play again' picks new numbers with it
    plays(stop, id) { return Number(T.store.get(playsPath(stop, id), 0)) || 0; }
  };

  /* ---------- small helpers ---------- */

  function reduced() { return T.ui.reducedMotion ? T.ui.reducedMotion() : false; }
  function resumePath(stop, id) { return ['stops', String(stop), 'practise', 'resume', id]; }
  function playsPath(stop, id) { return ['stops', String(stop), 'practise', 'plays', id]; }
  function list(fn) { return (typeof fn === 'function' ? fn() : fn) || []; }

  /* ---------- the demo game (only when no real game is registered) ---------- */

  const DEMO_ROUNDS = [
    { word: 'petals', art: 'w-petals' }, { word: 'sepals', art: 'w-sepals' }, { word: 'anther', art: 'w-anther' },
    { word: 'stigma', art: 'w-stigma' }, { word: 'ovary', art: 'w-ovary' }
  ];
  const DEMO = {
    levels: 3,
    levelTitles: ['Look', 'Name', 'Check'],
    resultTitle: 'Demo done!',
    result: { en: 'The game shell works.', vi: 'Khung trò chơi hoạt động tốt.' },
    mount(g) {
      const rounds = U.sample(DEMO_ROUNDS, 2);
      const pic = el('div', { class: 'stage-pic' });
      const answers = el('div', { class: 'choices choices--2' });
      g.body.appendChild(el('div', { class: 'stage-stack stage-stack--split' }, pic, el('div', { class: 'stage-do' }, answers)));
      g.heartsTo(pic);
      let i = 0;
      function next() {
        if (i >= rounds.length) { g.levelDone(); return; }
        const item = rounds[i];
        const r = g.round({ choices: 4 });
        g.rounds(i + 1, rounds.length);
        g.ctx.primary(null);
        g.say({ en: 'Tap the name of this *part*.', vi: 'Chạm vào tên của *bộ phận* này.' }, 'think');
        T.ui.empty(pic);
        pic.appendChild(T.ui.plate(item.art, { shape: 'fill', play: true, label: 'A part of a flower' }));
        g.heartsTo(pic);
        T.ui.empty(answers);
        const words = U.shuffle([item.word].concat(U.sample(DEMO_ROUNDS.filter((x) => x.word !== item.word).map((x) => x.word), 3)));
        words.forEach((w) => {
          const b = T.ui.choice({ label: w, layout: 'word', sfx: 'pick', onClick() {
            if (g.busy() || r.closed) return;
            if (w === item.word) {
              b.classList.add('is-right'); r.right(b);
              g.say({ en: 'Yes. That is the *' + w + '*.', vi: 'Đúng rồi.' }, 'cheer');
              done();
            } else {
              b.classList.add('is-wrong');
              g.ctx.later(() => { b.classList.remove('is-wrong'); b.classList.add('is-dim'); }, 700);
              if (r.wrong(b) === 'show') {
                const good = U.$$('.choice', answers).filter((x) => x.textContent.trim() === item.word)[0];
                if (good) { good.classList.add('is-right'); g.lamp(good); }
                done();
              } else {
                g.say({ en: 'Not this one. *Try again*.', vi: 'Chưa đúng. *Thử lại* nhé.' }, 'oops');
              }
            }
          } });
          answers.appendChild(b);
        });
        T.ui.stagger(answers);
      }
      function done() {
        U.$$('.choice', answers).forEach((x) => { if (!x.classList.contains('is-right')) x.classList.add('is-dim'); });
        g.ctx.primary({ label: 'Next', iconEnd: 'next', onClick() { i++; next(); } });
      }
      next();
    }
  };

  /* ---------- the step ---------- */

  T.steps = T.steps || {};
  T.steps.practise = {
    mount(ctx) {
      const pack = ctx.pack || {};
      const entries = (pack.practise || []).filter((e) => e && e.id);
      const demo = !!T.games.forceDemo || !entries.some((e) => registry[e.id]);       // no real game yet: the demo plays every slot
      let mode = 'menu';            // 'menu' | 'game'
      let resultHandle = null;
      let run = null;               // the game in play

      ctx.onBack(() => {
        if (mode === 'menu') return false;
        showMenu();
        return true;
      });
      ctx.onLeave(() => { if (run && run.g) run.g._end(); run = null; });

      function gameOf(entry) { return demo ? DEMO : registry[entry.id] || null; }
      function titleOf(entry) { const gm = gameOf(entry); return (gm && !demo && gm.title) || entry.title || entry.id; }
      function best(entry) { return T.progress.unit(ctx.stop, 'practise', entry.id); }
      function firstUnplayed() { return entries.filter((e) => !best(e) && gameOf(e))[0] || null; }
      function allPlayed() { return entries.length > 0 && entries.every((e) => !!best(e)); }

      function clearScreen() {
        if (resultHandle) { resultHandle.close(); resultHandle = null; }
        if (run && run.g) run.g._end();
        T.ui.empty(ctx.body);
        ctx.primary(null);
        ctx.secondary(null);
        ctx.progress(null);
      }

      /* ---- the menu ---- */
      function showMenu() {
        clearScreen();
        run = null;
        mode = 'menu';
        ctx.title('Practise');
        const next = firstUnplayed();
        const done = allPlayed();
        const count = entries.length;
        const pickLine = count === 1 ? LINES.menuOne : count === 2 ? LINES.menuTwo : count === 3 ? LINES.menu : LINES.menuMany;
        ctx.instruct(Object.assign({ mood: done ? 'cheer' : 'happy' }, done ? LINES.menuDone : pickLine));
        const grid = el('div', { class: 'gm-menu' });
        entries.forEach((entry, i) => {
          const gm = gameOf(entry);
          const res = best(entry);
          const stars = res ? starsFor(res.score, res.max) : 0;
          const blurb = (gm && !demo && gm.blurb) || entry.blurb || {};
          const card = el('button', {
            type: 'button',
            class: { 'gm-card': true, pressable: true, 'is-next': next === entry, 'is-played': !!res, 'is-soon': !gm },
            'aria-label': titleOf(entry) + (res ? ', ' + stars + ' of 3 stars' : '') + (!gm ? ', coming soon' : ''),
            onClick() { T.fx.sfx('tap'); openGame(entry); }
          },
          el('span', { class: 'gm-card__pic' }, T.ui.plate((gm && !demo && gm.art) || entry.art || 'icon-step-practise', { shape: 'fill', replay: false, label: titleOf(entry) }),
            res ? el('span', { class: 'gm-card__tick' }, T.ui.icon('check')) : null),
          el('span', { class: 'gm-card__text' },
            el('span', { class: 'gm-card__num', text: 'Game ' + (i + 1) }),
            el('span', { class: 'gm-card__title', text: titleOf(entry) }),
            el('span', { class: 'gm-card__blurb', text: String(blurb.en || '').replace(/\*/g, '') }),
            res ? T.ui.stars(stars, 3, { size: 'sm' }) : el('span', { class: 'gm-card__state', text: gm ? 'New' : 'Coming soon' })));
          grid.appendChild(card);
        });
        ctx.body.appendChild(grid);
        T.ui.stagger(grid);
        // how many games have a result (the same look as the dots inside a game)
        ctx.progress(entries.filter((e) => !!best(e)).length, entries.length, { count: true });
        if (done) {
          ctx.primary({ label: 'Finish', iconEnd: 'next', onClick() { ctx.finish(); } });
        } else if (next) {
          ctx.primary({ label: 'Play: ' + titleOf(next), icon: 'play', onClick() { openGame(next); } });
        }
      }

      /* ---- the "coming soon" card (no engine, or its mount threw) ---- */
      function showSoon(entry) {
        clearScreen();
        mode = 'game';
        ctx.title(titleOf(entry));
        ctx.instruct(Object.assign({ mood: 'think' }, LINES.soon));
        ctx.body.appendChild(el('div', { class: 'stage-soon gm-soon' },
          el('div', { class: 'stage-soon__pic' },
            T.ui.plate(entry.art || 'icon-step-practise', { shape: 'round', replay: false, label: titleOf(entry) }),
            el('span', { class: 'stage-soon__zip' }, T.ui.zip('think'))),
          el('h2', { class: 'stage-soon__title', text: titleOf(entry) + ' is coming soon' }),
          el('p', { class: 'stage-soon__text', text: 'Zip is still getting this game ready. Try another game for now.' })));
        ctx.primary({ label: 'Back to the games', icon: 'back', onClick: showMenu });
      }

      /* ---- a game ---- */
      function openGame(entry, fresh) {
        const game = gameOf(entry);
        if (!game) { showSoon(entry); return; }
        const path = resumePath(ctx.stop, entry.id);
        if (fresh) T.store.set(path, undefined);
        const cp = T.store.get(path, null);
        const levels = Math.max(1, game.levels || 3);
        const resumed = !!(cp && cp.level >= 1 && cp.level < levels);
        run = {
          entry: entry, game: game, levels: levels,
          level: resumed ? cp.level + 1 : 1,
          earned: resumed ? +cp.score || 0 : 0,
          max: resumed ? +cp.max || 0 : 0,
          resumed: resumed, streak: 0, g: null,
          run: T.rewards.counter(ctx.stop, 'practise')       // Phase 6: right at the first try, in a row (all levels)
        };
        mode = 'game';
        runLevel();
      }

      function runLevel() {
        const r = run;
        clearScreen();
        run = r;
        mode = 'game';
        const entry = r.entry;
        const game = r.game;
        ctx.title(titleOf(entry));
        const wrap = el('div', { class: 'gm-level' });
        const pill = el('div', { class: 'gm-pill', 'aria-label': 'Level ' + r.level + ' of ' + r.levels },
          el('span', { class: 'gm-pill__level', text: 'Level ' + r.level + (game.hearts === false ? ' of ' + r.levels : '') }),
          game.hearts === false ? null : T.ui.hearts(3, 3, { size: 'sm' }));
        wrap.appendChild(pill);
        ctx.body.appendChild(wrap);
        const g = makeG(r, wrap, pill);
        r.g = g;
        if (r.resumed) {
          ctx.secondary({ label: 'Start again', icon: 'replay', onClick() { openGame(entry, true); } });
        }
        banner(wrap, r);
        try {
          game.mount(g);
        } catch (err) {
          console.error('Game ' + entry.id + ' failed to start', err);
          g._end();
          showSoon(entry);
        }
      }

      function banner(wrap, r) {
        const titles = r.game.levelTitles || [];
        const ld = (r.entry.levels || [])[r.level - 1];
        const name = titles[r.level - 1] || (ld && ld.title && (ld.title.en || ld.title)) || '';
        const b = el('div', { class: 'gm-banner', 'aria-hidden': 'true' },
          el('span', { class: 'gm-banner__level', text: 'Level ' + r.level }),
          name ? el('span', { class: 'gm-banner__name', text: String(name) }) : null);
        wrap.appendChild(b);
        T.fx.sfx('whoosh');
        ctx.later(() => { b.classList.add('is-out'); }, reduced() ? 700 : 1100);
        ctx.later(() => { if (b.parentNode) b.parentNode.removeChild(b); }, reduced() ? 750 : 1500);
      }

      /* ---- g: the object a game gets for one level ---- */
      function makeG(r, wrap, pill) {
        let alive = true;
        let hearts = 3;
        let spared = false;
        let earned = 0;
        let max = 0;
        let lockedUntil = 0;
        const heartsEl = pill.querySelector('.hearts');
        const body = el('div', { class: 'gm-body' });
        wrap.appendChild(body);

        function dropResume() {
          if (r.resumed) { r.resumed = false; if (alive) ctx.secondary(null); }
        }

        const g = {
          level: r.level,
          levels: r.levels,
          body: body,
          ctx: ctx,
          id: r.entry.id,
          stop: ctx.stop,
          data: r.entry,
          levelData: (r.entry.levels || [])[r.level - 1] || null,
          get hearts() { return hearts; },

          loseHeart() {
            if (!alive || r.game.hearts === false) return hearts;
            dropResume();
            hearts = Math.max(0, hearts - 1);
            T.ui.meter(heartsEl, hearts);
            pill.classList.remove('is-hit'); void pill.offsetWidth; pill.classList.add('is-hit');
            if (hearts > 0) return hearts;
            if (r.game.outOfHearts === 'retry') {
              outOfHearts();
              return 0;
            }
            spared = true;
            hearts = 1;
            ctx.later(() => {
              if (!alive) return;
              T.fx.sfx('chime');
              T.ui.meter(heartsEl, hearts);
              pill.classList.add('is-spare');
            }, 450);
            ctx.instruct(Object.assign({ mood: 'happy' }, LINES.spare));
            return 0;
          },

          score(points, most) {
            if (!alive) return;
            dropResume();
            earned += Math.max(0, +points || 0);
            max += Math.max(0, +most || 0);
          },

          levelDone() {
            if (!alive) return;
            const bonus = r.game.hearts === false ? 0 : spared ? 0 : hearts;
            earned += bonus;
            if (r.game.hearts !== false) max += 3;
            alive = false;
            r.earned += earned;
            r.max += max;
            T.fx.sfx('level');
            if (r.level >= r.levels) gameDone(r);
            else levelCard(r, bonus, wrap);
          },

          line(key) {
            const ui = r.entry.ui || {};
            return (key && ui[key]) || LINES[key] || null;
          },
          say(k, mood) {
            if (!alive) return;
            const line = typeof k === 'string' ? g.line(k) : k;
            if (!line) return;
            ctx.instruct(Object.assign({}, line, mood ? { mood: mood } : {}));
          },
          rounds(i, n) { if (alive) ctx.progress(i == null ? null : i, n); },

          round(opts) {
            const choices = (opts && opts.choices) || 2;
            const rr = {
              misses: 0, closed: false,
              right(node) {
                if (rr.closed || !alive) return 0;
                rr.closed = true;
                const pts = rr.misses === 0 ? 2 : (rr.misses === 1 && choices >= 3 ? 1 : 0);
                r.streak = rr.misses === 0 ? r.streak + 1 : 1;
                g.score(pts, 2);
                g.right(node);
                return pts;
              },
              wrong(node, o) {
                if (rr.closed || !alive) return 'show';
                rr.misses++;
                r.streak = 0;
                g.wrong(node);
                let left = hearts;
                if (!o || o.heart !== false) left = g.loseHeart();
                if (!alive) { rr.closed = true; return 'show'; }       // 'retry' mode stopped the level
                if (left === 0 || rr.misses >= 2) {
                  rr.closed = true;
                  g.score(0, 2);
                  if (left !== 0) ctx.instruct(Object.assign({ mood: 'think' }, LINES.zipShows));
                  return 'show';
                }
                return 'again';
              },
              show() {
                if (rr.closed || !alive) return;
                rr.closed = true;
                g.score(0, 2);
              }
            };
            return rr;
          },

          // Phase 6: one answer more in the run (first: right at the first try, no hint) -> Zip's line at 3, 5, 10 ...
          streak(first) { return alive ? r.run.hit(!!first) : null; },
          right(node) {
            if (!alive) return;
            T.fx.sfx('ok', { streak: Math.max(1, r.streak) });
            if (node) T.fx.burst(node, 14);
            ctx.zip('cheer');
          },
          wrong(node) {
            if (!alive) return;
            T.fx.sfx('no');
            if (node && !reduced()) {
              node.classList.remove('gm-shake'); void node.offsetWidth; node.classList.add('gm-shake');
              ctx.later(() => node.classList.remove('gm-shake'), 500);
            }
            ctx.zip('oops');
          },
          lamp(node) {
            if (!alive || !node) return;
            T.fx.sfx('pop');
            node.classList.remove('gm-lamp'); void node.offsetWidth; node.classList.add('gm-lamp');
            ctx.later(() => node.classList.remove('gm-lamp'), 1700);
          },
          lock(ms) { lockedUntil = Math.max(lockedUntil, Date.now() + (ms || 0)); },
          busy() { return !alive || Date.now() < lockedUntil; },

          flyTo(node, target, o) {
            return new Promise((resolve) => {
              if (!node || !target || !alive || reduced() || !node.animate) { resolve(); return; }
              const ms = (o && o.ms) || 420;
              const a = node.getBoundingClientRect();
              const b = target.getBoundingClientRect();
              const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
              const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
              g.lock(ms);
              node.classList.add('gm-flying');
              const anim = node.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + dx + 'px,' + dy + 'px)' }],
                { duration: ms, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
              const end = () => { node.classList.remove('gm-flying'); try { anim.cancel(); } catch (e) { /* gone */ } resolve(); };
              anim.onfinish = end;
              ctx.later(end, ms + 80);
            });
          },

          pickPlace(o) { return pickPlace(g, o); },

          pencil(svg, s) {
            if (!svg || !s) return null;
            let d = '';
            if (s.kind === 'line' || s.kind === 'arrow') {
              d = 'M' + s.x1 + ' ' + s.y1 + 'L' + s.x2 + ' ' + s.y2;
              if (s.kind === 'arrow') {
                const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
                const L = s.head || 12;
                const p = (t) => (s.x2 - L * Math.cos(ang + t)) + ' ' + (s.y2 - L * Math.sin(ang + t));
                d += 'M' + p(0.5) + 'L' + s.x2 + ' ' + s.y2 + 'L' + p(-0.5);
              }
            } else if (s.kind === 'circle') {
              const rx = s.rx, ry = s.ry || s.rx;
              d = 'M' + (s.cx + rx) + ' ' + s.cy + 'A' + rx + ' ' + ry + ' 0 1 1 ' + (s.cx - rx) + ' ' + (s.cy + 1) +
                  'A' + rx + ' ' + ry + ' 0 0 1 ' + (s.cx + rx * 0.96) + ' ' + (s.cy - ry * 0.2);
            } else if (s.kind === 'tick') {
              const z = s.size || 20;
              d = 'M' + (s.x - z * 0.5) + ' ' + s.y + 'L' + (s.x - z * 0.15) + ' ' + (s.y + z * 0.4) + 'L' + (s.x + z * 0.55) + ' ' + (s.y - z * 0.5);
            }
            const path = el('path', { d: d, class: 'gm-pencil' + (s.cls ? ' ' + s.cls : ''), fill: 'none', 'stroke-width': s.width || 4,
              'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
            svg.appendChild(path);
            if (!reduced() && path.getTotalLength && path.animate) {
              let len = 0;
              try { len = path.getTotalLength(); } catch (e) { len = 0; }
              if (len > 0) {
                path.style.strokeDasharray = len;
                path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: s.ms || 450, easing: 'ease-out', fill: 'both' });
              }
            }
            return path;
          },

          heartsTo(node) {
            if (!node || !alive) return;
            if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
            node.appendChild(pill);
          },

          _end() { alive = false; }
        };
        return g;
      }

      /* ---- out of hearts (game.outOfHearts === 'retry') ---- */
      function outOfHearts() {
        const r = run;
        if (!r || !r.g) return;
        r.g._end();
        ctx.instruct(Object.assign({ mood: 'oops' }, LINES.noHearts));
        ctx.primary({ label: 'Try this level again', icon: 'replay', onClick: runLevel });
        ctx.secondary(null);
      }

      /* ---- the level card ---- */
      function levelCard(r, bonus, wrap) {
        T.store.set(resumePath(ctx.stop, r.entry.id), { level: r.level, score: r.earned, max: r.max });
        const total = el('span', { class: 'star-total gm-lvcard__total' }, T.ui.icon('star'), el('span', { text: String(r.earned - bonus) }));
        const noHearts = r.game.hearts === false;
        const hearts = noHearts ? el('span') : T.ui.hearts(bonus, 3, { size: 'lg' });
        const card = el('div', { class: 'gm-lvcard', role: 'status' },
          el('h2', { class: 'gm-lvcard__title', text: 'Level ' + r.level + ' done!' }),
          el('div', { class: 'gm-lvcard__row' }, noHearts ? null : hearts, total),
          el('p', { class: 'gm-lvcard__sub', text: noHearts ? 'Points so far: ' + r.earned + ' of ' + r.max : bonus ? 'Hearts left: ' + bonus : 'You kept going!' }));
        wrap.appendChild(el('div', { class: 'gm-lvcard__scrim' }, card));
        ctx.progress(null);
        ctx.secondary(null);
        ctx.instruct(Object.assign({ mood: 'cheer' }, LINES.levelDone));
        // the hearts that are left fly into the score (a copy flies; the heart itself stays lit)
        const on = U.$$('.heart.is-on', hearts);
        on.forEach((h, i) => {
          ctx.later(() => {
            if (!reduced() && h.animate) {
              const c = card.getBoundingClientRect(), a = h.getBoundingClientRect(), b = total.getBoundingClientRect();
              const copy = h.cloneNode(true);
              copy.classList.add('gm-heart-fly');
              copy.style.left = (a.left - c.left) + 'px';
              copy.style.top = (a.top - c.top) + 'px';
              copy.style.width = a.width + 'px';
              copy.style.height = a.height + 'px';
              card.appendChild(copy);
              const anim = copy.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px) scale(.5)', opacity: 0 }],
                { duration: 420, easing: 'ease-in', fill: 'forwards' });
              anim.onfinish = () => { copy.remove(); };
            }
            ctx.later(() => {
              total.lastChild.textContent = String(r.earned - bonus + i + 1);
              total.classList.remove('is-bump'); void total.offsetWidth; total.classList.add('is-bump');
              T.fx.sfx('tick');
            }, reduced() ? 0 : 400);
          }, 500 + i * 300);
        });
        ctx.primary({ label: 'Next level', iconEnd: 'next', onClick() { r.level++; runLevel(); } });
      }

      /* ---- the game's result ---- */
      function gameDone(r) {
        const entry = r.entry;
        // Phase 6: a new best is compared with the saved best BEFORE this result is saved (the old one is shown)
        const before = T.progress.unit(ctx.stop, 'practise', entry.id);
        const better = ctx.saveUnit(entry.id, r.earned, r.max);
        const best = before && better ? { was: T.rewards.fill(T.REWARDS.points, { n: before.score }) } : null;
        T.store.set(playsPath(ctx.stop, entry.id), (Number(T.store.get(playsPath(ctx.stop, entry.id), 0)) || 0) + 1);
        T.store.set(resumePath(ctx.stop, entry.id), undefined);
        const stars = starsFor(r.earned, r.max);
        const next = firstUnplayed();
        const line = r.game.result || (entry.ui && entry.ui.result) || null;
        const game = r;
        run = null;
        if (game.g) game.g._end();
        ctx.progress(null);
        ctx.secondary(null);
        const primary = next
          ? { label: 'Next game', sub: titleOf(next), iconEnd: 'next', onClick() { openGame(next); } }
          : allPlayed()
            ? { label: 'Finish', iconEnd: 'next', onClick() { resultHandle = null; ctx.finish(); } }
            : { label: 'Back to the games', icon: 'back', onClick: showMenu };
        resultHandle = ctx.result({
          stars: stars,
          title: (!demo && r.game.resultTitle) || (demo ? DEMO.resultTitle : 'Game finished!'),
          lines: [line ? line.en : 'You finished all ' + r.levels + ' levels.', 'Points: *' + r.earned + '* of ' + r.max + '.'],
          best: best,
          primary: primary,
          secondary: [
            { label: 'Play again', icon: 'replay', onClick() { openGame(entry, true); } },
            next || allPlayed() ? { label: 'Back to the games', icon: 'back', onClick: showMenu } : null,
            best ? T.rewards.link() : null
          ].filter(Boolean)
        });
        mode = 'game';
      }

      showMenu();
    }
  };

  /* ---------- tap to choose, tap to place (drag is optional) ---------- */

  function pickPlace(g, o) {
    o = o || {};
    const ctx = g.ctx;
    let picked = null;
    let drag = null;

    function slots() { return list(o.slots); }
    function pieces() { return list(o.pieces); }
    function mark() {
      slots().forEach((s) => s.classList.toggle('gm-slot-on', !!picked));
    }
    function pick(p) {
      if (picked) picked.classList.remove('is-picked');
      picked = p && p !== picked ? p : null;
      if (picked) { picked.classList.add('is-picked'); T.fx.sfx('pick'); }
      mark();
      if (typeof o.onPick === 'function') o.onPick(picked);
    }
    function place(p, s) {
      if (!p || !s) return;
      p.classList.remove('is-picked');
      picked = null;
      mark();
      if (typeof o.onPlace === 'function') o.onPlace(p, s);
    }
    function slotAt(x, y) {
      return slots().filter((s) => { const b = s.getBoundingClientRect(); return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom; })[0] || null;
    }

    function onClick(e) {
      if (g.busy()) return;
      if (drag && drag.moved) return;
      const p = pieces().filter((x) => x.contains(e.target))[0];
      if (p) { pick(p); return; }
      const s = slots().filter((x) => x.contains(e.target))[0];
      if (s && picked) place(picked, s);
    }
    function onDown(e) {
      if (o.drag === false || g.busy() || (e.button != null && e.button > 0)) return;
      const p = pieces().filter((x) => x.contains(e.target))[0];
      if (!p) return;
      drag = { p: p, x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      if (!drag.moved) {
        drag.moved = true;
        try { drag.p.setPointerCapture(drag.id); } catch (err) { /* fine */ }
        drag.p.classList.add('gm-dragging');
        if (picked !== drag.p) pick(drag.p);
      }
      e.preventDefault();
      drag.p.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      if (d.moved) {
        d.p.classList.remove('gm-dragging');
        d.p.style.transform = '';
        const s = slotAt(e.clientX, e.clientY);
        if (s) place(d.p, s); else pick(null);
        ctx.later(() => { drag = null; }, 0);       // swallow the click that follows a drag
      } else {
        drag = null;
      }
    }

    if (o.drag !== false) pieces().forEach((p) => p.classList.add('gm-piece'));
    const root = g.body;
    root.addEventListener('click', onClick);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    return {
      clear() { pick(null); },
      picked() { return picked; }
    };
  }
})(window.T = window.T || {});

