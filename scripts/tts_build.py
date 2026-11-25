"""Make the listening recordings: every audio stim in app/audio/manifest-*.json -> dist/audio/<id>.mp3

Version 2 (November 2026, clearer audio):
- Spelled names (W-A-L-L-I-S) are read with the exact British letter names, given to the voice engine as sounds
  (phonemes), at a slower speed with a clear pause after every letter. Version 1 read the letter A as "eye".
- Every line is brought to the same loudness, so a quiet voice is never harder to hear than a loud one.
- A longer pause between speakers (0.75 s) so children can tell who is talking.
- The finished file is loudness-matched (EBU R128, -16 LUFS, peaks below -1.5 dB: no crackle on tablet speakers),
  gently cleaned of rumble below 70 Hz, and saved as mono MP3 at 64 kbps (version 1: 40 kbps).
Voices: Kokoro British voices only (bf_*, bm_*); each speaker keeps one voice. VOICE_STYLE can blend a child voice
with a clearer voice of the same kind (chosen by scripts/audio_clarity.py tests).
Cached: a recording is made again only when its lines or this BUILD version change (app/audio/cache.json).

  python3 scripts/tts_build.py              all stops
  python3 scripts/tts_build.py 4 5 summit   only these manifests"""
import json, glob, os, re, hashlib, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

BUILD = 'v2'
ROOT = './app'
OUT = os.environ.get('TTS_OUT', './dist/audio')
TTS_DIR = os.environ.get('TTS_DIR', './tts')
os.makedirs(OUT, exist_ok=True)
cache_p = ROOT + '/audio/cache.json'
cache = json.load(open(cache_p)) if os.path.exists(cache_p) else {}
k = Kokoro(TTS_DIR + '/kokoro-v1.0.onnx', TTS_DIR + '/voices-v1.0.bin')
VOICES = set(k.get_voices())
SR = 24000
SPEED = 0.9                 # every line (the exam recordings are calm and clear)
SPELL_SPEED = 0.8
SPELL = re.compile(r"\b([A-Za-z](?:-[A-Za-z]){2,})\b")
# British letter names as sounds (IPA, as the voice engine reads them)
LETTER = {'A': 'ˈeɪ', 'B': 'bˈiː', 'C': 'sˈiː', 'D': 'dˈiː', 'E': 'ˈiː', 'F': 'ˈɛf', 'G': 'dʒˈiː', 'H': 'ˈeɪtʃ', 'I': 'ˈaɪ', 'J': 'dʒˈeɪ',
          'K': 'kˈeɪ', 'L': 'ˈɛl', 'M': 'ˈɛm', 'N': 'ˈɛn', 'O': 'ˈəʊ', 'P': 'pˈiː', 'Q': 'kjˈuː', 'R': 'ˈɑː', 'S': 'ˈɛs', 'T': 'tˈiː',
          'U': 'jˈuː', 'V': 'vˈiː', 'W': 'dˈʌbəl jˌuː', 'X': 'ˈɛks', 'Y': 'wˈaɪ', 'Z': 'zˈɛd'}
# a voice id in the scripts -> the voice (or blend 'a*0.6+b*0.4') that reads it
VOICE_STYLE = json.load(open(ROOT + '/audio/voices.json')) if os.path.exists(ROOT + '/audio/voices.json') else {}


def style(v):
    spec = VOICE_STYLE.get(v, v)
    if '+' not in spec: return spec if spec in VOICES else 'bf_emma'
    return sum(float(w) * k.get_voice_style(n) for n, w in (p.split('*') for p in spec.split('+')))


def clean(t):
    t = re.sub(r'<[^>]+>', '', t).replace('*', '')
    return t.replace('£', 'pounds ') if re.search(r'£\s*$', t) else t


def gap(s): return np.zeros(int(SR * s), dtype=np.float32)


def trim(a, th=0.004):
    idx = np.where(np.abs(a) > th)[0]
    return a[max(0, idx[0] - int(SR * 0.03)):idx[-1] + int(SR * 0.08)] if len(idx) else a


def say(text, voice, speed):
    text = clean(text).strip()
    if not text: return np.zeros(0, dtype=np.float32)
    a, _ = k.create(text, voice=style(voice), speed=speed, lang='en-gb')
    return a.astype(np.float32)


def spell(word, voice):
    """W-A-L-L-I-S -> 'W. A. L. L. I. S.' as letter sounds, one calm line with a pause after every letter"""
    ph = '. '.join(LETTER.get(c.upper(), c) for c in word.split('-')) + '.'
    a, _ = k.create(ph, voice=style(voice), speed=SPELL_SPEED, lang='en-gb', is_phonemes=True, trim=False, sentence_pause=0.55)
    return trim(a.astype(np.float32))


def level(a, target_db=-20.0):
    """bring the speech of one line to the same loudness (RMS of the voiced part)"""
    if not len(a): return a
    v = a[np.abs(a) > 0.01]
    if not len(v): return a
    rms = np.sqrt(np.mean(v ** 2))
    g = 10 ** (target_db / 20) / max(rms, 1e-6)
    return a * min(g, 8.0)


def line_audio(voice, text):
    parts, at = [], 0
    for m in SPELL.finditer(text):
        before = text[at:m.start()]
        if before.strip(): parts += [say(before, voice, SPEED), gap(0.35)]
        parts += [spell(m.group(1), voice), gap(0.35)]
        at = m.end()
    rest = text[at:]
    if rest.strip(): parts.append(say(rest, voice, SPEED))
    return level(np.concatenate(parts)) if parts else gap(0.1)


def fade(a, ms=15):
    n = int(SR * ms / 1000)
    if len(a) > 2 * n:
        a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    return a


def build(aid, lines):
    chunks = [gap(0.5)]
    for i, ln in enumerate(lines):
        voice = ln[0]
        text = ln[2] if len(ln) > 2 else ln[-1]
        chunks.append(line_audio(voice, text))
        chunks.append(gap(0.75 if i < len(lines) - 1 else 0.6))
    wav = fade(np.concatenate(chunks))
    peak = np.max(np.abs(wav)) or 1
    wav = wav / peak * 0.7
    tmp = f'/tmp/tts-{aid}.wav'
    sf.write(tmp, wav, SR)
    # loudness: measure, then a linear (no pumping) correction to -16 LUFS with true peak under -1.5 dB
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rfind('{'):m.rfind('}') + 1])
    ln = ('highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}'
          ':measured_thresh={input_thresh}:offset={target_offset}').format(**j)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', ln + ',aresample=48000,alimiter=limit=0.75:attack=3:release=60:level=false,aresample=24000', '-ac', '1', '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', '64k',
                    f'{OUT}/{aid}.mp3'], check=True)
    os.remove(tmp)
    return len(wav) / SR


todo = {}
for f in sorted(glob.glob(ROOT + '/audio/manifest-*.json')):
    if len(sys.argv) > 1 and not any(f.endswith(f'manifest-{x}.json') for x in sys.argv[1:]): continue
    for aid, lines in json.load(open(f, encoding='utf8')).items(): todo[aid] = lines
only = os.environ.get('ONLY')
done = 0; secs = 0
for aid, lines in todo.items():
    if only and aid not in only.split(','): continue
    h = hashlib.md5((BUILD + json.dumps(VOICE_STYLE, sort_keys=True) + json.dumps(lines, ensure_ascii=False)).encode()).hexdigest()
    if cache.get(aid) == h and os.path.exists(f'{OUT}/{aid}.mp3'): continue
    secs += build(aid, lines); cache[aid] = h; done += 1
    if OUT == './dist/audio': json.dump(cache, open(cache_p, 'w'))
    print('made', aid, flush=True)
print(f'done: {done} new recordings, {secs:.0f} s of audio; total {len(todo)}')
