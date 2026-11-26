"""el_build.py - make the listening recordings with ElevenLabs (natural British voices), version 3 of the audio.

Every line of every audio stim in app/audio/manifest-*.json is spoken by an ElevenLabs voice (text-to-speech,
model eleven_multilingual_v2, speed 0.9), then the lines are joined exactly as in scripts/tts_build.py v2:
each line levelled, 0.75 s between speakers, -16 LUFS, a peak limiter, mono MP3 64 kbps -> dist/audio/<id>.mp3.
A spelled name (W-A-L-L-I-S) is sent as "W. A. L. L. I. S." so every letter is said clearly.

Needs: the ElevenLabs key saved as a network secret for api.elevenlabs.io (header xi-api-key) on the cloud
environment (the proxy adds it; the value sent here is a placeholder). Lines are cached in ./el-cache/ (git-ignored)
so a run can be repeated without paying again.

  python3 scripts/el_build.py                 all recordings
  ONLY=s4-a1-1a,s4-r3-1a python3 scripts/el_build.py
  EL_OUT=/some/dir python3 scripts/el_build.py   write somewhere other than dist/audio"""
import json, glob, os, re, sys, hashlib, subprocess, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
import numpy as np, soundfile as sf

OUT = os.environ.get('EL_OUT', './dist/audio')
CACHE = './el-cache'
MODEL = 'eleven_multilingual_v2'
SETTINGS = {'stability': 0.6, 'similarity_boost': 0.8, 'style': 0.0, 'use_speaker_boost': True, 'speed': 0.9}
SR = 44100
# script voice ids (kept from the Kokoro version) -> ElevenLabs British voices
VOICE = {
    'bf_emma': 'Xb7hH8MSUJpSbSDYk0k2',      # Alice - clear educator (women, mums, teachers)
    'bf_isabella': 'pFZP5JQG7iQjIQuC4Bku',  # Lily - warm (women)
    'bm_george': 'JBFqnCBsd6RMkjVDRZzb',    # George - warm storyteller (men, dads, coaches)
    'bm_daniel': 'onwK4e9ZLuTAKqWW03F9',    # Daniel - steady broadcaster (men)
    'bf_lily': '6fZce9LFNG3iEITDfqZZ',      # Charlotte - young, bright (girls)
    'bf_alice': 'B5QSQFV9Yu7xHDMZJbWb',     # Abigail - young, conversational (girls)
    'bm_lewis': 'mHlts5QHKpF8NPCOjcgW',     # Harry - young, soft London (boys)
    'bm_fable': 'yJSTU8D97YocC6Dqg20L',     # Charlie - young, friendly (boys)
}
SPELL = re.compile(r"\b([A-Za-z](?:-[A-Za-z]){2,})\b")
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)


def clean(t):
    t = re.sub(r'<[^>]+>', '', t).replace('*', '')
    return SPELL.sub(lambda m: ' '.join(c.upper() + '.' for c in m.group(1).split('-')), t).strip()


def say(text, voice):
    vid = VOICE.get(voice, VOICE['bf_emma'])
    key = hashlib.md5(json.dumps([MODEL, SETTINGS, vid, text]).encode()).hexdigest()
    path = f'{CACHE}/{key}.mp3'
    if not os.path.exists(path):
        body = json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': SETTINGS, 'seed': 7}).encode()
        for attempt in range(5):
            req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', data=body,
                                         headers={'xi-api-key': 'placeholder', 'Content-Type': 'application/json'}, method='POST')
            try:
                data = urllib.request.urlopen(req, timeout=120).read()
                open(path + '.tmp', 'wb').write(data); os.replace(path + '.tmp', path)
                break
            except urllib.error.HTTPError as e:
                msg = e.read()[:300]
                if e.code in (429, 500, 502, 503) and attempt < 4: time.sleep(3 * (attempt + 1)); continue
                raise SystemExit(f'ElevenLabs {e.code}: {msg}')
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def gap(s): return np.zeros(int(SR * s), dtype=np.float32)


def trim(a, th=0.004):
    idx = np.where(np.abs(a) > th)[0]
    return a[max(0, idx[0] - int(SR * 0.03)):idx[-1] + int(SR * 0.08)] if len(idx) else a


def level(a, target_db=-20.0):
    v = a[np.abs(a) > 0.01]
    if not len(v): return a
    return a * min(10 ** (target_db / 20) / max(np.sqrt(np.mean(v ** 2)), 1e-6), 8.0)


def build(aid, lines):
    chunks = [gap(0.5)]
    for i, ln in enumerate(lines):
        chunks.append(level(trim(say(clean(ln[2] if len(ln) > 2 else ln[-1]), ln[0]))))
        chunks.append(gap(0.75 if i < len(lines) - 1 else 0.6))
    wav = np.concatenate(chunks)
    wav = wav / (np.max(np.abs(wav)) or 1) * 0.7
    tmp = f'/tmp/el-{aid}.wav'
    sf.write(tmp, wav, SR)
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rfind('{'):m.rfind('}') + 1])
    ln = ('highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}'
          ':measured_thresh={input_thresh}:offset={target_offset}').format(**j)
    af = ln + ',aresample=48000,alimiter=limit=0.7:attack=3:release=60:level=false,aresample=24000'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', af, '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '64k',
                    f'{OUT}/{aid}.mp3'], check=True)
    os.remove(tmp)
    return aid, len(wav) / SR


todo = {}
for f in sorted(glob.glob('./app/audio/manifest-*.json')):
    for aid, lines in json.load(open(f, encoding='utf8')).items():
        todo[aid] = lines
only = os.environ.get('ONLY')
if only: todo = {k: v for k, v in todo.items() if k in only.split(',')}
# fetch every line first (4 at a time), then join
jobs = [(clean(l[2] if len(l) > 2 else l[-1]), l[0]) for lines in todo.values() for l in lines]
with ThreadPoolExecutor(4) as ex:
    for k, _ in enumerate(ex.map(lambda j: say(*j), jobs)):
        if (k + 1) % 25 == 0: print(f'lines {k + 1}/{len(jobs)}', flush=True)
secs = 0
for aid, lines in todo.items():
    secs += build(aid, lines)[1]
print(f'done: {len(todo)} recordings, {len(jobs)} lines, {secs / 60:.1f} minutes of audio -> {OUT}')
