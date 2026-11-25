# EOS 1 – G5 ESL Revision Trail: instructions for Claude Code

You are working on the **EOS 1 – G5 ESL Revision Trail**: a revision web app for Grade 5 students at Vinschool Times City (T36), Cambridge Advanced Programme. It covers the End of Semester 1 ESL exam (Cambridge Primary English as a Second Language, Stage 6, Units 1 to 4). It is the ESL member of a family of EOS1 trails (G3 to G5 Maths and Science) and runs on the same engine as the G5 Maths trail.

Owner: Jovan Tacatani, Vice Principal (Cambridge Advanced Programme). He is not technical: explain steps plainly, and do the work rather than handing it back.

## What is in this folder

| Path | What it is |
| --- | --- |
| `dist/index.html` + `dist/audio/*.mp3` + `dist/img/emoji/*.svg` | The finished app (one HTML page + 103 recordings + the picture set). This is what gets published. |
| `app/src/` | The app source: 150 parts (CSS and JS) joined in the order of `app/src/_order.txt`. |
| `app/audio/` | One manifest per stop of every recording (who says what), plus `cache.json` (which recordings are up to date). |
| `content/stop1.json` to `stop9.json`, `content/summit.json` | ALL the questions, texts, listening scripts, writing tasks and model answers. The source of truth for content. |
| `docs/` | The design documents: exam-style guide, content format, stop briefs, learning objectives, decisions, architecture, item security, coverage. Read these before changing anything. |
| `scripts/` | Converters, build, recordings (TTS), validation and browser tests. Run every script from this folder's root. |

## Build and check (run from the folder root)

```bash
# 1. content JSON -> app packs (one per changed stop), and the Summit
python3 scripts/convert.py 4            # writes app/src/22-pack-stop4.js and app/audio/manifest-4.json
python3 scripts/convert_summit.py       # writes app/src/22-summit-esl.js and app/audio/manifest-summit.json
# 2. check every item and key
python3 scripts/validate.py content/stop{1,2,3,4,5,6,7,8,9}.json      # must end with NO PROBLEMS
# 3. recordings: only new or changed scripts are made (see "Audio" below)
python3 scripts/tts_build.py            # or: python3 scripts/tts_build.py 4 5 summit
# 4. join the parts into the page
python3 scripts/build.py app/src dist/index.html
# 5. open it in a headless browser and look for errors (needs playwright + Chrome)
python3 scripts/walk.py "home,stop-1,stop-4-test,summit" 1280 900    # prints "no errors"; screenshots in /tmp/w*.png
```

Never edit `app/src/22-pack-stop*.js` or `22-summit-esl.js` by hand: they are generated. Change `content/*.json`, then convert.

## Audio

- Engine: Kokoro TTS (`pip install kokoro-onnx soundfile`), model files from the kokoro-onnx GitHub release `model-files-v1.0` (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) saved in `./tts/`. Needs `ffmpeg`. Build v2 (see the header of `scripts/tts_build.py`): exact letter sounds for spelled names, equal loudness, -16 LUFS, 64 kbps.
- Clarity check: `python3 scripts/audio_clarity.py <sherpa-onnx whisper model dir>` (`pip install sherpa-onnx`; models from the k2-fsa/sherpa-onnx GitHub release `asr-models`).
- British voices only: girls/women `bf_emma`, `bf_isabella`, `bf_alice`, `bf_lily`; boys/men `bm_george`, `bm_lewis`, `bm_daniel`, `bm_fable`. Each speaker keeps one voice.
- A spelled name in a script (`W-A-L-L-I-S`) is read letter by letter. Output: mono MP3, 64 kbps, `dist/audio/<stim id>.mp3`.
- The app plays `audio/<id>.mp3` relative to the page, so the mp3 files must be published beside `index.html`.

## Publishing

The app is a claude.ai artifact (multi-file: `index.html` + `audio/*.mp3`), published with the claude-artifacts `publish_files` tool.
- Live artifact (since 25 November 2026): https://claude.ai/artifact/LoQE6GoHcH9gbz6QAerMXe (publish `index.html` with `files` for `audio/*.mp3` and `img/emoji/*.svg`; more than 255 files go up over two publishes to the same URL).
- The first version (before the 25 November review) is at https://claude.ai/artifact/Kxdsd2ShBmx83GV8byznSk.
- To republish: `get_artifact` for the live version, then `publish_files` with `slug`, `base_version`, mode `replace`, and every file (`index.html` and every `audio/*.mp3`).

## Rules that must not be broken

1. **Item security.** The real EOS1 papers must never be seen by whoever writes questions, and no real-paper text, name, situation or writing prompt may appear in the trail. Question writers work only from `docs/exam-style-guide-esl.md`, `docs/content-format.md`, `docs/stops-brief.md` and `docs/learning-objectives.md`. A separate checker compares new content with the papers using `scripts/overlap_check.py` (the paper texts and a `names.txt` sit beside it in a private local folder, never in this package or in the app). See `docs/item-security.md`.
2. **British English** in all content (colour, favourite, centre, practise as a verb, programme, mum).
3. **No em dashes** in any text Jovan will read or send.
4. Vietnamese (`vi`) is only for instructions, titles and word meanings, never for the English being tested.
5. Mini tests: exactly 10 items, 5 at DOK 1 then 5 at DOK 2. Three options per multiple-choice question, one right answer, `opts[0]` is the right one and `at` says where it is shown.
6. Keep the behaviour of the EOS1 trails: Student / Teacher / Visitor sign-in, progress codes, How to use guide, Zip the robot, the VI button, stars and badges, the school label line. The LOOK is this trail's own (Jovan, 25 November 2026): the paper look with ink cartoon animation (`99-paper.css`, `99-cartoon.css`), black line-drawing pictures, Map and Stops buttons.
7. Browser tests for every feature are in `scripts/tests/` (see its README). The plan for building the Grade 3 and Grade 4 trails from this one is `playbook/PLAYBOOK-G3-G4.md`.

## Where to start

- To understand the app: `docs/architecture.md`.
- To change or add questions: `docs/content-format.md`, then the stop's JSON, then convert, validate, build, walk.
- To understand why things are as they are: `docs/design-decisions.md`.
