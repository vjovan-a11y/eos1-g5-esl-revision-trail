# EOS 1 – G5 ESL Revision Trail (source package)

Everything needed to rebuild, change and republish the Grade 5 ESL revision app for the End of Semester 1 exam (Vinschool Times City T36, Cambridge Advanced Programme, SY 2026-27).

**Give this whole folder to Claude Code and say:** "Read CLAUDE.md, then help me with the EOS 1 – G5 ESL Revision Trail."

## Inside

- `CLAUDE.md`: instructions for Claude Code (start here)
- `dist/`: the finished app, ready to publish (`index.html` + 103 recordings)
- `app/src/`: the app source (150 parts) and `app/audio/` (recording scripts)
- `content/`: all questions, texts, listening scripts and writing tasks (JSON)
- `docs/`: exam-style guide, content format, stop briefs, learning objectives, decisions, architecture, item security, coverage map
- `scripts/`: convert, validate, build, recordings, browser tests, overlap check

## Quick rebuild

```bash
pip install playwright kokoro-onnx soundfile
python3 scripts/validate.py content/stop{1,2,3,4,5,6,7,8,9}.json
python3 scripts/build.py app/src dist/index.html
```

## Not included, on purpose

- The real EOS1 papers and any text from them (item security: see `docs/item-security.md`).
- The TTS voice model files (about 340 MB): download them as described in `CLAUDE.md`.

Live app: https://claude.ai/artifact/Kxdsd2ShBmx83GV8byznSk
