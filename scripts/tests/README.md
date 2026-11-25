# Browser tests (Playwright + the pre-installed Chromium)

Run from the project root. `ROOT` is the project folder (it opens `ROOT/dist/index.html`); `OUT` is a folder for screenshots.

| Script | What it checks |
| --- | --- |
| `python3 scripts/tests/summit_full.py ROOT OUT` | Plays every Summit paper blank and prints the result screen (totals, trophy marks, "Practise again: Stop ...") |
| `python3 scripts/tests/wordquiz.py ROOT OUT` | Signs in as a student and plays every word-set quiz in every stop |
| `python3 scripts/tests/writetest.py ROOT OUT` | Writing desk: mark the model, self-mark, models with marks; then the Summit Writing paper |
| `python3 scripts/tests/examtest.py ROOT OUT` | Listening exam mode: reading time, two automatic plays, finished; Slower button in practice |
| `python3 scripts/tests/audiocheck.py ROOT` | Every recording in dist/audio loads in the browser; total minutes |
| `python3 scripts/tests/roles.py ROOT` | Student vs teacher: objective labels hidden or shown, Summit open, school label |
| `python3 scripts/tests/preview.py ROOT OUT` | Five large preview screenshots (map, stop, listening question, reading test, word list) |

They were written for Grade 5 (class 5B03, Stop 4 listening, Stop 6/7 tests, the Stop 1 "Group words" set). For another
grade, change those names first (grep for `5B03`, `stop-4`, `Group words`, `herd`). Each prints "no errors" or the problems.
