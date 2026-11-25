/* 31-howto-text.js - the captions of the "How to use" page (32-howto.js), as data only, so that build.mjs can put
   them in dist/dump.txt with the rest of the child-facing text. Short captions, {en, vi} (Jovan's plan, Phase 2). */
(function (T) {
  'use strict';

  T.HOWTO = {
    title: { en: 'How to use the trail', vi: 'Cách dùng hành trình' },
    cards: {
      trail: { t: 'The trail', en: '9 worlds. Go from Stop\u00a01 to Stop\u00a09.', vi: '9 thế giới. Đi từ Trạm 1 đến Trạm 9.' },
      steps: { t: '5 steps', en: 'Do the steps in order. Each step wins 3 stars.', vi: 'Làm các bước theo thứ tự. Mỗi bước được 3 sao.' },
      extras: { t: '2 extras', en: 'Beat the clock. Then tell your teacher how it went.', vi: 'Thi nhanh với đồng hồ. Rồi cho thầy cô biết em học thế nào.' },
      win: { t: 'Win', en: 'Stars, a badge for each stop, medals and bolts.', vi: 'Sao, huy hiệu cho mỗi trạm, huy chương và tia chớp.' },
      zip: { t: 'Zip helps you', en: 'Zip says what to do. Tap VI for Vietnamese.', vi: 'Zip nói em cần làm gì. Bấm VI để xem tiếng Việt.' },
      stuck: { t: 'Stuck?', en: 'Tap Hint for help. Show me how shows each step.', vi: 'Bấm Hint để được gợi ý. Show me how chỉ từng bước.' },
      paper: { t: 'The test paper', en: 'Write on the dotted lines. Then tap Mark my paper.', vi: 'Viết vào dòng chấm. Rồi bấm Mark my paper (Chấm bài).' },
      hand: { t: 'Where to tap', en: 'The first time, a hand shows where to tap.', vi: 'Lần đầu, một bàn tay chỉ chỗ em cần bấm.' },
      saved: { t: 'Saved', en: 'Your stars are saved. Your teacher can see them.', vi: 'Sao của em được lưu. Thầy cô có thể xem.' },
      device: { t: 'Saved', en: 'Your stars are saved on this device.', vi: 'Sao của em được lưu trên thiết bị này.' }
    },
    zipLine: { en: 'Tap the *word* for this picture.', vi: 'Chạm vào *từ* đúng với bức tranh này.' },
    // the line under each step's name on the "5 steps" card
    steps: { words: 'Learn the words', see: 'See how it works', practise: 'Play English games', notes: 'Read the notes', test: 'Do a test paper' },
    // the written guide (27-howto.js): two tabs, every line in English and Vietnamese
    guide: {
      title: { en: 'How to use the trail', vi: 'Hướng dẫn sử dụng' },
      students: {
        tab: { en: 'Students', vi: 'Học sinh' },
        items: [
          { icon: 'people', en: 'Keep *Student* picked. Tap your *class*, type your *name*, then tap *Start my trail*.',
            vi: 'Giữ ô *Student* (Học sinh). Chạm vào *lớp* của em, nhập *tên*, rồi chạm *Start my trail*.' },
          { icon: 'pencil', en: 'Always type the *same class and name*. Then your stars come back.',
            vi: 'Luôn nhập *đúng lớp và tên* như lần trước. Như vậy sao của em sẽ được giữ lại.' },
          { icon: 'map', en: 'There are *9 stops* and *the Summit*. Each stop has 5 steps: Words, See it, Practise, Notes and Mini Practice test.',
            vi: 'Có *9 trạm* và *Đỉnh núi*. Mỗi trạm có 5 bước: Từ vựng, Quan sát, Luyện tập, Ghi nhớ và Bài kiểm tra nhỏ.' },
          { icon: 'star', en: 'Win up to *3 stars* in each step. Finish all 5 steps to win the stop\'s *badge*. Do 4 Mini Practice tests to open the Summit.',
            vi: 'Mỗi bước em có thể đạt tối đa *3 sao*. Hoàn thành cả 5 bước để nhận *huy hiệu* của trạm. Làm 4 bài kiểm tra nhỏ để mở Đỉnh núi.' },
          { icon: 'vi', en: 'Tap *VI* to read the Vietnamese. The *speaker* button turns sounds on or off.',
            vi: 'Chạm *VI* để đọc tiếng Việt. Nút *loa* dùng để bật hoặc tắt âm thanh.' },
          { icon: 'device', en: 'Stars are saved *on this device, in this browser*. Open the link in Safari or Chrome. Do not open it inside Zalo or Messenger, or in a private window.',
            vi: 'Sao được lưu *trên thiết bị này, trong trình duyệt này*. Hãy mở liên kết bằng Safari hoặc Chrome. Đừng mở trong Zalo, Messenger hay cửa sổ ẩn danh.' },
          { icon: 'share', en: 'Changing device? Tap your *name* on the map, then *My progress code*. Write the code down. On the new device, sign in, tap your name, then *Enter a progress code*.',
            vi: 'Đổi thiết bị? Chạm vào *tên* của em trên bản đồ, chọn *My progress code* và chép mã lại. Trên thiết bị mới, em đăng nhập, chạm vào tên, rồi chọn *Enter a progress code*.' }
        ]
      },
      teachers: {
        tab: { en: 'Teachers and families', vi: 'Giáo viên và phụ huynh' },
        items: [
          { icon: 'info', en: 'Revision for Grade 5 ESL (English), following *Cambridge Primary English as a Second Language Stage 6*. 9 stops: words, grammar, listening, reading and writing, then the Summit with a full practice exam. No question comes from the real exam papers.',
            vi: 'Ứng dụng ôn tập Tiếng Anh (ESL) lớp 5 theo *Cambridge Primary English as a Second Language Stage 6*. Có 9 trạm: từ vựng, ngữ pháp, nghe, đọc và viết, rồi Đỉnh núi với bài thi thử đầy đủ. Không có câu hỏi nào lấy từ đề thi thật.' },
          { icon: 'map', en: 'Each stop has 5 steps: *Words*, *See it*, *Practise*, *Notes* and the *Mini Practice test*. The Summit opens after 4 Mini Practice tests.',
            vi: 'Mỗi trạm có 5 bước: *Từ vựng*, *Quan sát*, *Luyện tập*, *Ghi nhớ* và *Bài kiểm tra nhỏ*. Đỉnh núi mở sau 4 bài kiểm tra nhỏ.' },
          { icon: 'pencil', en: 'ESL teachers and TAs: tap *Teacher / TA* on the start screen and type your name. You can open the Summit at any time. Tap your name on the map, then *Check a student\'s code* to see a student\'s stars.',
            vi: 'Giáo viên Tiếng Anh và trợ giảng: chạm *Teacher / TA* ở màn hình đầu và nhập tên. Thầy cô có thể mở Đỉnh núi bất cứ lúc nào. Chạm vào tên trên bản đồ, rồi chọn *Check a student\'s code* để xem số sao của học sinh.' },
          { icon: 'map', en: 'Visitors: tap *Visitor* to look around. No name is needed.',
            vi: 'Khách tham quan: chạm *Visitor* để xem ứng dụng. Không cần nhập tên.' },
          { icon: 'people', en: 'No login and no password. Each child taps their class and types their name. On a shared device, each child signs in as themselves (tap the name, then *Switch player*).',
            vi: 'Không cần đăng nhập hay mật khẩu. Mỗi em chọn lớp và nhập tên. Trên thiết bị dùng chung, mỗi em đăng nhập bằng tên của mình (chạm vào tên, rồi chọn *Switch player*).' },
          { icon: 'device', en: 'Stars are saved *only on the device and browser* the child used. A new device, another browser, a private window or cleared browser data starts from zero.',
            vi: 'Sao chỉ được lưu *trên thiết bị và trình duyệt* em đã dùng. Thiết bị mới, trình duyệt khác, cửa sổ ẩn danh hoặc xoá dữ liệu trình duyệt sẽ bắt đầu lại từ đầu.' },
          { icon: 'share', en: 'To move stars, the child uses a *progress code* (tap the name on the map). It moves finished steps and the best Mini Practice test marks, not half-done steps.',
            vi: 'Để chuyển sao, em dùng *mã tiến độ* (chạm vào tên trên bản đồ). Mã chuyển các bước đã hoàn thành và điểm bài kiểm tra nhỏ cao nhất, không chuyển bước làm dở.' },
          { icon: 'trophy', en: 'Scores are *not sent to the teacher*. To check progress, ask the child to show the map: it shows the stars and badges of every stop.',
            vi: 'Điểm *không được gửi cho giáo viên*. Để xem tiến độ, hãy nhờ em mở bản đồ: bản đồ hiện số sao và huy hiệu của từng trạm.' },
          { icon: 'shield', en: 'Names stay on the device and are never sent anywhere.',
            vi: 'Tên chỉ được lưu trên thiết bị và không được gửi đi đâu.' },
          { icon: 'home', en: 'On an iPad: tap Share, then *Add to Home Screen*, and always open the trail from that icon.',
            vi: 'Trên iPad: chạm Chia sẻ, chọn *Thêm vào MH chính*, và luôn mở ứng dụng từ biểu tượng đó.' }
        ]
      }
    }
  };

})(window.T = window.T || {});

