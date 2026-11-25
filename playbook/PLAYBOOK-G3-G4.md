# PLAYBOOK: build the EOS 1 Grade 3 and Grade 4 ESL Revision Trails (one unattended run)

Written on 25 November 2026 from the Grade 5 project (this repository). For a Claude Code cloud session (Opus).
Goal: by the time Jovan wakes up, **both apps are built, tested, published and backed up**, with a short plain-English report.

Owner: **Jovan Tacatani**, Vice Principal (Cambridge Advanced Programme), Vinschool Times City T36. He is not technical:
write to him in plain words, British English, **never use em dashes**, and do the work rather than handing it back.

---

## 0. The decisions already made (do not ask Jovan again)

| Topic | Decision |
| --- | --- |
| Apps | Two new ESL trails for the **End of Semester 1** exam: **Grade 3 = Cambridge Primary ESL Stage 4**, **Grade 4 = Stage 5**. Same school, same engine and look as the Grade 5 trail in this repository. |
| Size | **Full, like Grade 5**: one stop per exam skill/part (7 to 9 stops, decided from each grade's test specification), each stop with Words, See it, Practise (Learn it + Exam style), Notes, Mini test, Lightning, Self-check; plus the **Summit** (full timed practice exam with every paper and part of that grade's exam, Writing paper, Lightning round, certificate). |
| Skills | Listening, Reading and Use of English (or whatever the papers are called for that grade), Writing. **No Speaking.** |
| Sign-in classes | Grade 3: **3B01 to 3B09**. Grade 4: **4B01 to 4B09**. Student / Teacher / Visitor as in Grade 5. |
| Look | The Grade 5 **paper look with ink cartoon animation** (99-paper.css, 99-cartoon.css), black line-drawing pictures (Fluent Emoji high-contrast), Map and Stops buttons, listening exam mode. Everything in the Grade 5 trail as it is now. |
| Summit | **Open for everyone** (OPEN_AT = 0). Trophy at 70% of that grade's real total marks. |
| Teacher-only labels | Objective code and DOK label under questions show for teachers only (as in Grade 5). |
| School label | `Vinschool Times City T36 Primary School – Advanced Programme` |
| Publishing | **Allowed without asking**, but only after every check in section 6 passes: new private claude.ai links (one per grade), push to the two GitHub repositories, back up zips to each grade's Drive folder. Jovan shares the links himself. |
| Materials | One Google Drive folder per grade, holding: test specification, real EOS1 papers + answer key (+ listening transcript), units / pacing guide, writing rubric. |

---

## 1. Inputs and the first 15 minutes

1. **Drive folders**: the prompt gives one link per grade. Use the Google Drive connector (`search_files` with `parentId = '<folder id>'`, then `download_file_content`; files land in the session's tool-results folder). Google Docs/Sheets: export as text/PDF. PDFs: `pdftotext -layout` (install `poppler-utils` if missing) or the Read tool.
2. **Split the files at once (item security, section 3)**:
   - Real papers, answer key, listening transcript, mark scheme of the real paper → `/home/user/private-papers/g3/` and `/home/user/private-papers/g4/` (convert to `.txt` there). **Never** copy them into a project folder, a repository, the app, a zip or an upload.
   - Test specification, units / pacing, writing rubric → `/home/user/inputs/g3/` and `/home/user/inputs/g4/` (also as `.txt`).
   - If you cannot tell whether a file is a real paper, treat it as one. The real listening recordings (MP3) are papers too.
   - Use the newest version when there are two (e.g. "(Updated 16.11)"); skip "Old Versions" / "Old Files" subfolders and anything about Speaking.
   - Spreadsheets (.xlsx test specification, pacing guide): read them with `python3 -c "import openpyxl"` (`pip install openpyxl`) and use only the rows for the grade you are building.
3. **Template**: this repository (`vjovan-a11y/eos1-g5-esl-revision-trail`) is public. Clone it, read `CLAUDE.md`, `docs/*.md`, and this playbook. The two target repositories are named in the prompt (`<owner>/eos1-g3-esl-revision-trail` and `<owner>/eos1-g4-esl-revision-trail`; since 25 November the owner is the school organisation `Times-City-T36-Primary-School`) (Jovan creates them, public, with a README; attach them with `add_repo` access `push` and clone them).
4. Copy the Grade 5 project (everything except `.git`, `content/stop*.json`, `content/summit.json`, `dist/audio/*`, `app/audio/manifest-*.json`, `app/audio/cache.json`, `playbook/`) into each target clone as the starting point.
5. **Tools to install** (all worked in the Grade 5 session): `pip install playwright kokoro-onnx soundfile sherpa-onnx`; Chromium is pre-installed (`/usr/bin/google-chrome` wrapper, Playwright `executable_path`); `ffmpeg` is installed. Downloads that worked: Kokoro `model-files-v1.0` (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) from the kokoro-onnx GitHub release into `./tts/` (git-ignored); Whisper `sherpa-onnx-whisper-small.en` and `-base.en` from the k2-fsa/sherpa-onnx GitHub release `asr-models`; npm `fluentui-emoji@1.3.0` and `emojibase-data@15.3.2` (`npm pack`). huggingface.co and openaipublic are blocked: do not try them.

---

## 2. The pipeline (per grade; run the two grades side by side where CPU allows)

Use subagents for the parallel writing work. Keep recordings (CPU heavy) one grade at a time.

| Step | Who | Output |
| --- | --- | --- |
| A. Analyst | ONE subagent, the only one that may open `/home/user/private-papers/gN/` | `docs/exam-style-guide-esl.md` for the grade (HOW the exam asks: papers, parts, counts, marks, timings, text lengths, kinds of distractors, DOK mix, Listening play rules, Writing tasks and word ranges, rubric categories and marks), a **"Reserved situations"** list (every situation, topic, person type and writing prompt in the real papers, described generally) for `docs/stops-brief.md`, and `/home/user/private-papers/gN/names.txt` (every person name in the papers). **Never WHAT the papers ask.** Use the Grade 5 guide as the model of tone and depth. |
| B. Planner | you | `docs/learning-objectives.md` (from the spec), `docs/stops-brief.md` (stops, worlds, LOs, exam parts per stop, per-stop notes, Writing stop format, reserved situations), `docs/coverage-map.md` skeleton, `docs/design-decisions.md` (copy Grade 5's decisions that still apply + this playbook's table). Map every exam part to a stop; split Listening or Reading across two stops when there are many parts (Grade 5 did). |
| C. Writers | one subagent per stop (and one for the Summit), reading ONLY `docs/exam-style-guide-esl.md`, `docs/content-format.md`, `docs/stops-brief.md`, `docs/learning-objectives.md`, and one Grade 5 stop JSON of the same kind as a format example | `content/stopN.json`, `content/summit.json` |
| D. Checker | one subagent (may read the papers) | runs `scripts/overlap_check.py` against the paper texts and `names.txt`, reads for reused situations and writing prompts, writes the fixes into the content JSON (or sends them back to a writer). Expected: no RUN flags, no NAME flags; NEAR flags only on standard instructions. Record the result table in `docs/item-security.md`. |
| E. Quality gates | you | section 4 (lessons) + section 6 (checks). Fix until all pass. |
| F. Engine | you | section 5 |
| G. Recordings | you | `scripts/tts_build.py` (v2), then `scripts/audio_clarity.py` |
| H. Pictures | you | `scripts/emoji_build.py <fluentui-emoji>/icons/high-contrast <emojibase-data>/en/data.json` |
| I. Build and test | you | section 6 |
| J. Publish and back up | you | section 7 |

**Level guidance for writers** (put it in each grade's style guide too):
- Grade 3 / Stage 4: age 8 to 9, about CEFR A1+ to A2. Short sentences, very concrete everyday topics, Part 1 talks of 3 to 4 turns, texts shorter than Grade 5, vocabulary from the units.
- Grade 4 / Stage 5: age 9 to 10, about CEFR A2. Between Grade 3 and Grade 5 in length and difficulty.
- Always: British English, names mixing international and Vietnamese, no brands, no real people, nothing from the reserved list.

---

## 3. Item security (the most important rule)

- The real papers are opened only by the Analyst (A) and the Checker (D). Writers (C) never receive their paths or text.
- Papers live only in `/home/user/private-papers/` (outside every repository). Never commit, zip, publish, upload or quote them. `names.txt` stays there too.
- No real-paper text, name, situation or writing prompt may appear in the trail. The Summit must also be fresh against the trail's own stops (section 4, lesson 2).

---

## 4. Lessons from Grade 5: build them in from the start (each one was a real bug or weakness found in review)

1. **Summit totals come from the ESL papers, not the Maths engine.** `79-summit-esl.js` must set `T.summit.paperMax(k)` and `T.summit.total()` from the real question counts, and `STOP_OF` (Part → stop) so "Practise again" names real stops. `19-summit-text.js` `facts` and `papers` lines must state that grade's papers, question counts and minutes. Trophy = ceil(70% of the real total). Play the whole Summit in the browser and read the result screen.
2. **The Summit must not repeat trail texts.** No Summit dialogue, article, talk or writing prompt may reuse a topic, situation or name from any stop (Grade 5's Summit had copied a Stop 8 article and the Stop 6 test dialogue). Check with a script: shared rare nouns and 6-word runs between `summit.json` and every `stopN.json`.
3. **No answer-length pattern.** In every stop, the right answer (`opts[0]`) is the uniquely longest option in 25 to 40% of mcqs, never 0% and never over 45%; uniquely shortest at most 35%. Grade 5 had 52% (Stop 2), 46% (Stop 8) and 0% (Stop 5, so "never pick the longest" worked). Measure in characters.
4. **No "but" pattern** in reading answers: distractors use two-part "but" sentences as often as keys.
5. **Real grammatical distractors only** (no "didn't saw", "are going open"): contrast real forms ("was built / was building / has built"); the context decides.
6. **Listening distractors must all be mentioned in the talk** (with the meaning changed). Vary where the answer comes: not always the last thing said, not always right after "but / instead / actually".
7. **Hints teach a strategy and never give or paraphrase the answer** (no first letters, no "X means Y" that is the key). `whys` are one kind sentence each. `worked` quotes the text.
8. **Accept every correct answer in typed gaps**: contractions ('ve, 's), "in ages", planning/hoping/going to, time forms (8.15, 8:15, 08:15, 8:15 am, quarter past eight...), names after the verb. One gap = one defensible answer; reword items with several.
9. **DOK labels must match the thinking** (DOK 1 = said directly; DOK 2 = paraphrase/inference). Mini tests: exactly 10, five DOK 1 then five DOK 2.
10. **Words step = definitions, not emoji riddles.** Each word: an emoji that pictures it where possible, a `def` that does not contain the word, and an `ex` sentence with the word in `*stars*`. The quiz is "Which word fits this meaning?" (already built in `40-words.js`).
11. **Writing models carry marks.** Every model has `marks` per rubric category (from THAT grade's rubric: categories and maxima may differ from Grade 5; update `RUBRIC` in `56-kit-write.js`) and notes that start "Content 3/4: ...". Secure and Excellent inside the word range; Developing a little short with 2 or 3 typical learner errors. The desk asks the child to mark the model first, then their own writing; models appear after the self-mark.
12. **Recordings**: spelled names use phoneme letters (built into `tts_build.py` v2; v1 read "A" as "eye"); every line levelled; -16 LUFS; limiter; 64 kbps; 0.75 s between speakers. For Grade 3 consider `SPEED = 0.85`. After building, run `audio_clarity.py` (Whisper small.en; base.en is about 3x faster): investigate anything under 90% heard. Spelled letters score low on Whisper even when clear: listen to the pattern, not just the number.
13. **Picture answers**: time answers draw a clock automatically from the tag (`5:15`); give every pmcq option a short tag when two pictures could be confused (kingfisher vs duck); avoid brand-new emoji.
14. **Accessibility of navigation**: Map and Stops buttons are on every screen (`26-nav.js`); keep them.
15. **Storage keys must change per grade** (`g5-esl-trail-*` → `g3-esl-trail-*`, `g4-esl-trail-*`) or the three trails would share stars on one device. Grep for `g5-esl` and `G5`.
16. **No em dashes** anywhere a person reads (the title uses an en dash: "EOS 1 – G3 ESL Revision Trail"). **British spelling** scan (color, favorite, center, program, practice as a verb, mom, soccer, cookies, vacation).
17. Do not show emoji or pictures that are not in the picture set: `emoji_build.py` reports any emoji left as device emoji; ★ ✓ ✗ are intentional text.

---

## 5. Engine changes per grade (grep `G5`, `Grade 5`, `g5-`, `5B0`, `Stage 6`, `6U`, `6L`, `6R`, `6W` across `app/src`, `scripts`, `docs`, `CLAUDE.md`, `README.md`)

- `20-stops.js`: the stops (n, title, world, place, badge, unit, los, badgeArt), `T.OBJECTIVES` (that grade's codes and wording from the spec), DOK settings.
- `02-esl-badges.js`: one emoji badge per stop.
- `19-summit-text.js`, `79-summit-esl.js`: papers, parts, counts, minutes, `STOP_OF`, `PAPER_KEYS` (if the papers differ), writing paper minutes.
- `25-players.js`: class list (3B01 to 3B09 / 4B01 to 4B09), school label, brand title.
- `00-core.js`, `17-guide.js`, `25-players.js`: storage key prefix.
- `56-kit-write.js`: `RUBRIC` for that grade; word ranges come from the content.
- Text files (`18-rewards-text.js`, `31-howto-text.js`, `19-summit-text.js`): grade, stop count ("Questions from all 9 stops"), wording.
- `CLAUDE.md`, `README.md`, `docs/architecture.md`, `docs/coverage-map.md`, `docs/design-decisions.md`, `docs/item-security.md`: rewrite for the grade (keep the structure).
- `scripts/validate.py`: works for any stop count; extend it if a new item type is needed.

---

## 6. Checks before publishing (all must pass; copy the Grade 5 test scripts' approach)

1. `python3 scripts/validate.py content/stop*.json` → **NO PROBLEMS**.
2. Overlap check (section 2 D) clean; Summit-vs-stops freshness check clean.
3. Lesson 3/4 statistics per stop and Summit; British spelling and em dash scans (content, docs, built page).
4. Build: `python3 scripts/build.py app/src dist/index.html`.
5. `scripts/walk.py` over **every** route (home, each `stop-N`, `-words`, `-see`, `-practise`, `-notes`, `-test`, `-lightning`, `-selfcheck`, `summit`, `summit-test`, `summit-writing`) at 1280x900 **and** 390x760 → "no errors".
6. Playwright scripts (write them as in Grade 5): play the full Summit (both/all papers, mark, read the result: totals, trophy number, "Practise again: Stop ..."); play every word-set quiz; the Writing desk (mark model → self-mark → models with marks → stars); listening exam mode (reading time → two automatic plays → finished); student vs teacher (labels hidden / shown); Summit open with 0 tests.
7. Every recording loads in the browser (`new Audio()` metadata) and every picture file in the map exists.
8. Look at screenshots of: the map, a stop page, a listening question with pictures, a reading test, the Writing desk, the Summit result. Fix anything ugly or cut off.

---

## 7. Publish, back up, report

1. **claude.ai link (new, private)**: publish `dist/index.html` with `files` for `audio/*.mp3` and `img/emoji/*.svg` (paths relative to the working directory). More than 255 files: two publishes to the same URL (page + pictures + most audio first, the rest second). Then `list` the files and read back `index.html` to confirm, and run the browser tests on the downloaded copy.
2. **GitHub**: commit the project (no `tts/`, no papers; `.gitignore` from Grade 5) to `main` with a root `index.html` that redirects to `dist/` and a `.nojekyll` (Jovan's Pages setting is `main` / root, so the site is `https://<owner in lower case>.github.io/eos1-gN-esl-revision-trail/`). Push with `git -c push.negotiate=true push`. Check the "pages build and deployment" run finishes with success (`gh api repos/<repo>/actions/runs`). github.io itself cannot be opened from the session.
3. **Drive backup** in each grade's folder: `app-v1-<date>-part-1-source.zip`, `part-2-app-page.zip`, `part-3-audio-N.zip` (under 3 MB each), after unzipping them in a scratch folder and confirming they rebuild the same page. Upload with `create_file` (`base64Content` as a `sha256:<hex>:<absolute path>` file reference, `disableConversionToGoogleType: true`). Add `START-HERE-<date>.md`. Never include the papers.
4. **Report** to Jovan (also saved as `REPORT-<date>.md` in each grade's Drive folder): the two app links per grade (claude.ai + GitHub website), what each app contains (stops, questions, recordings), every check and its result, anything to review (lowest-clarity recordings, items the checker changed), and what he must do (share the claude.ai links; confirm the GitHub website opens). Plain words, short, no em dashes.

---

## 8. If something blocks you

Do not stop and wait. Do everything else, then report exactly what is blocked and the one step Jovan must take. Typical cases:
- A Drive file cannot be opened → work from the rest; if the papers are missing, write the style guide from the test specification alone and say so.
- A target GitHub repository is missing or not public → finish and publish the claude.ai link and Drive backup; give Jovan the 2-minute steps (create the repo Public with a README, Settings → Pages → main / root → Save) and push later if the session is still alive.
- Time is short → finish one grade completely (published and backed up) before polishing the other.
