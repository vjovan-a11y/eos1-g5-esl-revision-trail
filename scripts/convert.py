"""Turn a stop's content JSON (content-format.md) into the app's pack file src/22-pack-stopN.js.
Also collects every audio stim into audio/manifest-N.json for the TTS build.
usage: python3 convert.py N   (reads ./content/stopN.json)"""
import json, re, sys, os, html as H

N = int(sys.argv[1]) if __name__ == '__main__' else 0
PFX = f's{N}-'
audio = {}
warn = []

def star2b(s):
    if s is None: return s
    return re.sub(r'\*([^*\n]+)\*', r'<b>\1</b>', str(s))

def sid(i):
    i = str(i)
    return i if i.startswith(PFX) else PFX + i

def stim_fig(st, keep_bank=False):
    if not st: return None
    f = {'k': 'stim', 'id': sid(st.get('id', 'x')), 'kind': st.get('kind', 'text'), 'head': st.get('head') or ''}
    if f['kind'] == 'audio':
        lines = st.get('lines') or []
        f['lines'] = lines
        prev = audio.get(f['id'])
        if prev and prev != lines: warn.append('audio id reused with other lines: ' + f['id'])
        audio[f['id']] = lines
    else:
        f['html'] = st.get('html') or ''
    return f

def hint(h):
    if not h: return None
    return h if isinstance(h, dict) else {'step': star2b(h)}

def item(it):
    t = it.get('type')
    st = it.get('stim')
    base = {'hint': hint(it.get('hint')), 'worked': star2b(it.get('worked') or '')}
    if t == 'mcq':
        o = dict(base, type='mcq', q=star2b(it['q']), opts=[star2b(x) for x in it['opts']], at=it.get('at', 0),
                 whys=it.get('whys') or [], letters=True)
        f = stim_fig(st)
        if f: o['fig'] = f
        return o
    if t == 'pmcq':
        opts = []
        for x in it['opts']:
            if isinstance(x, str): x = {'pic': x}
            opts.append({'html': '', 'fig': {'k': 'pico', 'pic': x.get('pic', ''), 'tag': x.get('tag', '')},
                         'alt': (x.get('tag') or '') + ' picture'})
        o = dict(base, type='mcq', q=star2b(it['q']), opts=opts, at=it.get('at', 0), whys=it.get('whys') or [],
                 letters=True, sub='Tap one picture.')
        f = stim_fig(st)
        if f: o['fig'] = f
        return o
    if t == 'tfill':
        o = dict(base, type='tfill', q=star2b(it['q']), lines=[star2b(x) for x in it['lines']],
                 ans=[[str(a) for a in (x if isinstance(x, list) else [x])] for x in it['ans']])
        f = stim_fig(st)
        if f: o['fig'] = f
        return o
    if t == 'bank':
        bank = (st or {}).get('bank') or it.get('bankList')
        if not bank: raise ValueError('bank item without a bank: ' + json.dumps(it)[:120])
        o = dict(base, type='bank', q=star2b(it['q']), bank=[[b[0], star2b(b[1])] for b in bank], ans=it['ans'])
        f = stim_fig(st)
        if f: o['fig'] = f
        if o['ans'] not in [b[0] for b in bank]: warn.append('bank answer not in bank: ' + it['q'][:60])
        return o
    raise ValueError('unknown item type ' + str(t))

def rounds(rs):
    out = []
    for r in rs:
        out.append({'mode': r.get('mode', 'your'), 'lo': r.get('lo', []), 'v': [item(x) for x in r['v']]})
    return out

def emoji_svg(e, label):
    esc = lambda s: H.escape(str(s), quote=True)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" class="art art--emoji" role="img" aria-label="' + esc(label) + '">'
            '<text x="48" y="52" font-size="58" text-anchor="middle" dominant-baseline="middle" '
            'font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">' + esc(e) + '</text></svg>')

if __name__ != '__main__': raise SystemExit
SRC = f'./content/stop{N}.json'
OUT = f'./app/src/22-pack-stop{N}.js'
MAN = f'./app/audio/manifest-{N}.json'
d = json.load(open(SRC, encoding='utf8'))
pack = {'n': N, 'title': d['title'], 'los': [], 'blurb': d['blurb']}
art = {}
# words
w = d['words']
items = {}
for i, (k, v) in enumerate(w['items'].items()):
    aid = f'e-s{N}-{i}'
    art[aid] = emoji_svg(v.get('emoji', '📘'), k)
    df = v.get('def', '')
    if v.get('ex'): df = df.rstrip() + ' Example: ' + v['ex']
    items[k] = {'art': aid, 'vi': v.get('vi', ''), 'def': df}
pack['words'] = {'sets': w['sets'], 'items': items}
# see
scenes = []
for s in d['see']['scenes']:
    sc = {'id': s['id'], 'title': s['title'], 'esl': True, 'kind': s.get('kind', 'text'), 'head': s.get('head', ''),
          'html': s.get('html', ''), 'steps': s.get('steps', [])}
    if s.get('kind') == 'audio' and s.get('audio'):
        a = s['audio']
        aid = sid(a.get('id', s['id']))
        audio[aid] = a.get('lines', [])
        sc['audio'] = {'id': aid, 'lines': a.get('lines', [])}
    scenes.append(sc)
ch = d['see']['challenge']
scenes.append({'id': 'challenge', 'title': {'en': 'Challenge', 'vi': 'Thử thách'},
               'challenge': {'end': ch['end'], 'result': ch.get('result', 'You finished the challenge.'), 'rounds': rounds(ch['rounds'])}})
pack['see'] = {'scenes': scenes}
# practise
prac = []
for g, entry in enumerate(d['practise']):
    if entry.get('kind') == 'write':
        prac.append({'id': entry.get('id', f's{N}w'), 'kit': 'write', 'game': 'w', 'surface': 'paper', 'art': 'icon-step-notes',
                     'title': entry.get('title', 'Writing desk'), 'blurb': entry['blurb'], 'tasks': entry['tasks']})
        continue
    exam = g == 1
    prac.append({'id': entry.get('id', f's{N}' + ('a' if exam else 'r')), 'kit': 'model', 'game': 'a' if exam else 'r',
                 'surface': 'paper' if exam else 'board', 'art': 'icon-step-test' if exam else 'icon-step-practise',
                 'title': entry.get('title', 'Exam style' if exam else 'Learn it'), 'blurb': entry['blurb'],
                 'levels': [{'title': L['title'], 'rounds': rounds(L['rounds'])} for L in entry['levels']]})
pack['practise'] = prac
# notes
pack['notes'] = {'items': [{'en': x['en'], 'vi': x.get('vi', ''), 'example': x.get('example', [])} for x in d['notes']['items']],
                 'check': d['notes']['check']}
pack['test'] = {'items': [{'dok': x.get('dok', 1), 'lo': x.get('lo', []), 'v': [item(y) for y in x['v']]} for x in d['test']['items']]}
pack['lightning'] = d['lightning']
pack['selfcheck'] = d['selfcheck']
los = []
for x in d['test']['items']:
    for c in x.get('lo', []):
        if c not in los: los.append(c)
pack['los'] = los

js = (f'/* 22-pack-stop{N}.js - ALL the content of Stop {N}, {d["title"]} (Grade 5 ESL, Cambridge Stage 6).\n'
      '   Made by scripts/convert.py from content/stop' + str(N) + '.json (written from the exam-style guide only; no real paper seen). */\n'
      '(function (T) {\n  \'use strict\';\n'
      '  window.T_ART = Object.assign(window.T_ART || {}, ' + json.dumps(art, ensure_ascii=False) + ');\n'
      f'  T.packs[{N}] = ' + json.dumps(pack, ensure_ascii=False, indent=1) + ';\n'
      '})(window.T = window.T || {});\n')
open(OUT, 'w', encoding='utf8').write(js)
os.makedirs(os.path.dirname(MAN), exist_ok=True)
json.dump(audio, open(MAN, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'stop {N}: words {len(items)}, scenes {len(scenes)}, games {len(prac)}, test {len(pack["test"]["items"])}, lightning {len(d["lightning"]["items"])}, audio {len(audio)}')
for x in warn: print('WARN', x)
