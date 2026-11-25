"""content/summit.json -> app/src/22-summit-esl.js (T.SUMMIT_ESL) and app/audio/manifest-summit.json"""
import json, sys
sys.argv = ['x']
import importlib.util
spec = importlib.util.spec_from_file_location('conv', './scripts/convert.py')
conv = importlib.util.module_from_spec(spec)
try:
    spec.loader.exec_module(conv)
except SystemExit:
    pass
conv.PFX = 'sm-'
d = json.load(open('./content/summit.json', encoding='utf8'))
out = {}
for paper in ('listening', 'reading'):
    P = d[paper]
    parts = []
    for part in P['parts']:
        items = []
        for it in part['items']:
            items.append({'num': it.get('num'), 'dok': it.get('dok', 1), 'lo': it.get('lo', []), 'v': [conv.item(it)]})
        parts.append({'n': part['n'], 'title': part.get('title', 'Part %d' % part['n']), 'instr': part.get('instr', ''), 'items': items})
    out[paper] = {'mins': P.get('mins', 25 if paper == 'listening' else 35), 'parts': parts}
out['writing'] = d['writing']
js = ('/* 22-summit-esl.js - the Summit practice exam (Listening 19, Reading and Use of English 34, Writing 2 tasks).\n'
      '   Made by scripts/convert_summit.py from content/summit.json (written from the exam-style guide only; no real paper seen). */\n'
      '(function (T) {\n  \'use strict\';\n  T.SUMMIT_ESL = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n})(window.T = window.T || {});\n')
open('./app/src/22-summit-esl.js', 'w', encoding='utf8').write(js)
json.dump(conv.audio, open('./app/audio/manifest-summit.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
n = sum(len(p['items']) for p in out['listening']['parts']), sum(len(p['items']) for p in out['reading']['parts'])
print('summit: listening', n[0], 'reading', n[1], 'audio', len(conv.audio))
for w in conv.warn: print('WARN', w)
