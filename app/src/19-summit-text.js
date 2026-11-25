/* 19-summit-text.js - the words of the Summit (Session 14: 79-summit.js, the map, the trophy shelf), as data only, so
   that build.mjs puts them in dist/dump.txt. Zip's lines are {en, vi} and at most 10 words (test/guide.mjs counts them).
   Kind words only: below 70% the child is told to try again with new questions, never that they failed. */
(function (T) {
  'use strict';

  T.SUMMIT = {
    name: 'The Summit',
    eyebrow: 'The top of the trail',
    mapSoon: 'Do 4 Mini tests',
    mapOpen: 'Final test',
    mapWon: 'Trophy won',
    blurb: { en: 'The top of the trail! Show what you know in a practice exam like the real one.',
      vi: 'Đỉnh của hành trình! Hãy thể hiện điều em biết trong bài thi thử giống bài thi thật.' },
    zip: {
      locked: { en: 'Finish *{n} more* Mini tests to climb up here!', vi: 'Hoàn thành thêm *{n}* bài kiểm tra nhỏ để leo lên đây!' },
      open: { en: 'You made it! Start with the *final test*.', vi: 'Em đã đến nơi! Hãy bắt đầu với *bài kiểm tra cuối*.' },
      again: { en: 'Try the final test again with *new questions*.', vi: 'Làm lại bài kiểm tra cuối với *câu hỏi mới* nhé.' },
      won: { en: 'You won the *Summit Trophy*! Print your certificate.', vi: 'Em đã giành *Cúp Đỉnh núi*! Hãy in giấy chứng nhận.' }
    },
    locked: {
      title: 'The Summit opens soon',
      line: 'Do 4 Mini Practice tests to open it. You have done {d} of 9.',
      card: 'Opens after 4 Mini tests'
    },
    cards: {
      test: { label: 'Final test', line: 'Two papers, like the real test', best: 'Best: {s} out of {t} marks' },
      big: { label: 'Big Lightning round', line: '90 seconds, questions from every stop', best: 'Best: {b} right' },
      cert: { label: 'My certificate', line: 'Win the trophy to get it', ready: 'Ready to print' }
    },
    test: {
      title: 'Final test',
      kicker: 'Final test · Paper {p} of 2',
      short: 'Short test · One paper',
      paperTitle: 'EOS 1 – G5 ESL Revision Trail',
      end: 'End of Paper {p}',
      intro: { en: 'Two papers, like the *real test*. Do your best!', vi: 'Hai bài, giống *bài thi thật*. Em cố gắng hết sức nhé!' },
      carry: { en: 'Paper 1 is marked. Now do *Paper 2*.', vi: 'Bài 1 đã chấm xong. Bây giờ làm *Bài 2* nhé.' },
      facts: ['Paper 1, Listening: 19 questions, 25 minutes.', 'Paper 2, Reading and Use of English: 34 questions, 35 minutes.', 'Paper 3, Writing, is on its own card: 2 tasks, 35 minutes.',
        'No hints. Check your answers, then mark your paper.', 'Get {w} of the {t} marks (70%) to win the Summit Trophy.'],
      best: 'Your best: {s} out of {t} marks.',
      first: { en: 'Answer every question. Then tap *Mark my paper*.', vi: 'Trả lời mọi câu hỏi. Rồi bấm *Mark my paper* (Chấm bài).' },
      missing: { en: 'Question {q} is empty. Try it, or tap *Mark* again.', vi: 'Câu {q} còn trống. Em thử làm, hoặc bấm *Mark* lần nữa.' },
      marked: { en: '*{s} out of {m}* marks. Read the green answers.', vi: 'Em được *{s} trên {m}* điểm. Hãy đọc các đáp án màu xanh.' },
      timer: 'Time left: {n} min',
      timerUp: 'Time is up. You can still finish.',
      timerHide: 'Hide the clock',
      timerShow: 'Show the clock',
      won: { en: 'You did it! You won the *Summit Trophy*!', vi: 'Em làm được rồi! Em đã giành *Cúp Đỉnh núi*!' },
      wonAgain: { en: 'Great test! Your trophy is still yours.', vi: 'Bài làm tuyệt vời! Chiếc cúp vẫn là của em.' },
      notYet: { en: 'Good try! Try again with *new questions*.', vi: 'Cố gắng tốt lắm! Thử lại với *câu hỏi mới* nhé.' },
      sample: { en: 'Well done! Do both papers to win the trophy.', vi: 'Giỏi lắm! Làm cả hai bài để giành cúp nhé.' },
      titleWon: 'Summit Trophy!',
      titleTry: 'Good try!',
      titleSample: 'Short test finished',
      score: 'You got *{s}* out of {t} marks.',
      papers: ['Paper 1, Listening: {n} out of {m}.', 'Paper 2, Reading and Use of English: {n} out of {m}.'],
      need: 'Get {w} marks to win the trophy. Try again with new questions.',
      practise: 'Practise again: {list}.',
      allStops: 'You got at least half the marks in every part. Brilliant!',
      trophyOver: 'You reached the top!'
    },
    big: { title: 'Big Lightning round', from: 'Questions from all 9 stops' },
    cert: {
      title: 'My certificate',
      zip: { en: 'Well done! Print it and show your family.', vi: 'Giỏi lắm! Hãy in ra và khoe với gia đình nhé.' },
      nameLabel: 'Name on the certificate',
      top: 'EOS 1 – G5 ESL Revision Trail',
      heading: 'Certificate',
      to: 'This certificate is given to',
      for: 'for climbing to the Summit of the EOS 1 – G5 ESL Revision Trail and winning the Summit Trophy.',
      test: 'Final test: {s} out of {t} marks',
      badges: 'Badges: {n} of 9',
      stars: 'Stars: {n}',
      date: 'Date: {d}',
      print: 'Print my certificate',
      noPrint: 'Printing does not work here. Ask your teacher to help.'
    },
    shelf: {
      title: 'The Summit',
      how: 'Win the Summit Trophy with 70% in the final test.',
      trophy: 'Summit Trophy',
      trophyNot: 'No trophy yet',
      test: 'Final test',
      big: 'Big Lightning',
      notYet: 'Not yet'
    },
    way: { label: 'Next: the Summit', back: 'Back to the Summit' }
  };

  (T.zipLines = T.zipLines || {}).summit = { zip: T.SUMMIT.zip, test: {
    intro: T.SUMMIT.test.intro, carry: T.SUMMIT.test.carry, first: T.SUMMIT.test.first, missing: T.SUMMIT.test.missing, marked: T.SUMMIT.test.marked,
    won: T.SUMMIT.test.won, wonAgain: T.SUMMIT.test.wonAgain, notYet: T.SUMMIT.test.notYet, sample: T.SUMMIT.test.sample }, cert: T.SUMMIT.cert.zip };
})(window.T = window.T || {});

