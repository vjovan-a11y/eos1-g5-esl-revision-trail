"""audio_clarity.py - how clear is each recording? A speech recogniser (Whisper small.en via sherpa-onnx) writes down
what it hears in dist/audio/<id>.mp3, and we compare it with the script in app/audio/manifest-*.json.
A machine that mishears a line is a warning that a child may mishear it too.

  python3 scripts/audio_clarity.py <whisper model dir> [out.json]

Prints, per recording: word accuracy (100 = every script word heard), loudness (LUFS) and peak, and the words
the recogniser missed. Spelled names are compared letter by letter. Numbers are compared as words."""
import json, glob, os, re, subprocess, sys, difflib
import numpy as np
import sherpa_onnx

MODEL = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else None
SR = 16000

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()


def num_words(n):
    n = int(n)
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    if n < 1000: return ONES[n // 100] + ' hundred' + ('' if n % 100 == 0 else ' and ' + num_words(n % 100))
    if n < 10000 and n % 1000 == 0: return ONES[n // 1000] + ' thousand'
    if 2000 <= n < 2100: return 'twenty ' + (num_words(n % 100) if n % 100 else 'hundred')
    return ' '.join(ONES[int(d)] for d in str(n))


def norm(t):
    t = re.sub(r'<[^>]+>', ' ', t).replace('*', '').lower()
    t = t.replace('£', ' ').replace('%', ' percent')
    t = re.sub(r'\b([a-z])(?:-([a-z]))+\b', lambda m: ' '.join(m.group(0).split('-')), t)    # W-A-L-L-I-S -> w a l l i s
    t = re.sub(r'(\d+)[:.](\d\d)', lambda m: num_words(m.group(1)) + ' ' + (num_words(m.group(2)) if m.group(2) != '00' else ''), t)
    t = re.sub(r'\d+', lambda m: ' ' + num_words(m.group(0)) + ' ', t)
    t = t.replace("'", '').replace('’', '')
    t = re.sub(r'[^a-z ]+', ' ', t)
    t = t.replace(' oclock', ' o clock')
    return t.split()


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def loudness(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', r)
    p = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
    return (float(i[-1]) if i else None, float(p[-1]) if p else None)


def chunks(a, most=26.0):
    """cut at quiet gaps so that no piece is longer than `most` seconds (Whisper hears 30 s at a time)"""
    win = int(SR * 0.05)
    e = np.array([np.sqrt(np.mean(a[i:i + win] ** 2)) for i in range(0, len(a), win)]) if len(a) else np.zeros(0)
    quiet = e < max(0.003, 0.08 * (np.median(e) if len(e) else 0))
    out, start = [], 0
    while start < len(a):
        end = min(len(a), start + int(SR * most))
        if end < len(a):
            lo = (start + int(SR * most * 0.5)) // win
            hi = end // win
            cand = [i for i in range(hi - 1, lo, -1) if quiet[i] and quiet[i - 1]]
            if cand: end = cand[0] * win
        out.append(a[start:end])
        start = end
    return out


rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=glob.glob(MODEL + '/*encoder.int8.onnx')[0], decoder=glob.glob(MODEL + '/*decoder.int8.onnx')[0],
    tokens=glob.glob(MODEL + '/*tokens.txt')[0], language='en', task='transcribe', num_threads=4)


def hear(a):
    words = []
    for c in chunks(a):
        s = rec.create_stream()
        s.accept_waveform(SR, c)
        rec.decode_stream(s)
        words.append(s.result.text)
    return ' '.join(words)


scripts = {}
for f in sorted(glob.glob('app/audio/manifest-*.json')):
    for aid, lines in json.load(open(f, encoding='utf8')).items():
        scripts[aid] = ' '.join(l[2] if len(l) > 2 else l[-1] for l in lines)

only = os.environ.get('ONLY')
res = {}
for aid, text in scripts.items():
    if only and aid not in only.split(','): continue
    path = os.environ.get('AUDIO_DIR', 'dist/audio') + '/' + aid + '.mp3'
    if not os.path.exists(path): continue
    ref, heard = norm(text), hear(load(path))
    hyp = norm(heard)
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    ok = sum(b.size for b in sm.get_matching_blocks())
    acc = 100 * ok / max(1, len(ref))
    missed = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ('replace', 'delete'): missed.append(' '.join(ref[i1:i2]) + (' -> ' + ' '.join(hyp[j1:j2]) if tag == 'replace' else ' -> (nothing)'))
    lufs, peak = loudness(path)
    res[aid] = {'acc': round(acc, 1), 'lufs': lufs, 'peak': peak, 'missed': missed, 'heard': heard}
    print(f'{aid:24s} heard {acc:5.1f}%  loudness {lufs} LUFS  peak {peak}  ' + ('| ' + ' ; '.join(missed[:4]) if missed else ''), flush=True)
accs = [r['acc'] for r in res.values()]
if accs:
    print(f'\nrecordings {len(accs)}  average heard {sum(accs) / len(accs):.1f}%  below 95%: {sum(a < 95 for a in accs)}  below 90%: {sum(a < 90 for a in accs)}')
    l = [r['lufs'] for r in res.values() if r['lufs'] is not None]
    print(f'loudness from {min(l)} to {max(l)} LUFS')
if OUT: json.dump(res, open(OUT, 'w'), indent=1)
