/* 18-rewards-text.js - the words of the rewards (Phase 6, 18-rewards.js and the trophy shelf 33-trophies.js), as data
   only, so that build.mjs puts them in dist/dump.txt with the rest of the child-facing text. Zip's lines are {en, vi}
   and at most 10 words (test/guide.mjs counts them). Kind words only: nothing is said when a run ends. */
(function (T) {
  'use strict';

  T.REWARDS = {
    // Zip, when a run of right answers (at the first try) reaches 3, 5, 10, then every 5
    streak: {
      3: { en: '*3 in a row!* Keep going.', vi: '*3 câu đúng liên tiếp!* Cố lên nào.' },
      5: { en: '*5 in a row!* Super work.', vi: '*5 câu đúng liên tiếp!* Giỏi lắm.' },
      10: { en: '*10 in a row!* Amazing!', vi: '*10 câu đúng liên tiếp!* Tuyệt vời!' },
      more: { en: '*{n} in a row!* Wow!', vi: '*{n} câu đúng liên tiếp!* Xuất sắc!' },
      // the Mini Practice test, once the paper is marked: the score and the longest run of questions fully right
      paper: { en: '*{r} out of {m}* right, *{n} in a row!*', vi: 'Em làm đúng *{r} trên {m}* câu, *{n} câu liên tiếp!*' }
    },
    best: { tag: 'New best!', was: 'Old best: {b}' },  // on a result card
    points: '{n} points',
    outOf: '{n} out of {m}',
    badge: { over: 'New badge!', won: 'New badge: {b}' },
    finale: { over: 'All nine badges', title: 'Trail Champion!' },
    link: 'My trophies',                               // the quiet button on a result card, the map's button
    shelf: {
      title: 'My trophies',
      empty: { en: 'Your trophies will go here. Win your *first star*!', vi: 'Phần thưởng của em sẽ ở đây. Hãy giành *ngôi sao đầu tiên*!' },
      some: { en: 'Look what you *won*! What will you win next?', vi: 'Xem em đã *giành được* gì này! Em sẽ giành gì tiếp theo?' },
      all: { en: 'Every badge! You are a *Trail Champion*!', vi: 'Đủ mọi huy hiệu! Em là *Nhà vô địch hành trình*!' },
      tiles: { stars: ['star', 'stars'], badges: ['badge', 'badges'], medals: ['medal', 'medals'], bolts: ['bolt', 'bolts'] },
      badges: 'Badges',
      badgesHow: 'Finish all 5 steps of a stop to win its badge.',
      prizes: 'Medals and bolts',
      prizesHow: 'Medals from the Mini Practice test. Bolts from the Lightning round.',
      runs: 'My best runs',
      runsHow: 'Right answers in a row, at the first try.',
      won: 'Won {d}',
      wonNoDate: 'Won',
      notYet: 'Not yet',
      soon: 'Coming soon',
      fresh: 'New!',
      stop: 'Stop {n}',
      medalNone: 'No medal yet',
      boltNone: 'No bolt yet',
      best: 'Best: {b}',
      moreSoon: '{n} more stops are coming soon.',
      moreSoonOne: 'One more stop is coming soon.',
      run: '{n} in a row',
      kinds: { practise: 'Practise', see: 'See it', test: 'Test paper', lightning: 'Lightning' }
    }
  };

  // Zip's lines, checked by test/guide.mjs (at most 10 words, with VI)
  (T.zipLines = T.zipLines || {}).rewards = { streak: T.REWARDS.streak, shelf: { empty: T.REWARDS.shelf.empty, some: T.REWARDS.shelf.some, all: T.REWARDS.shelf.all } };
})(window.T = window.T || {});

