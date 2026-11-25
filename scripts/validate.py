import json, re, sys
from collections import Counter
def items_of(d):
    out=[]
    def add(where, it): out.append((where, it))
    for i,r in enumerate(d['see']['challenge']['rounds']):
        for j,v in enumerate(r['v']): add(f'see.ch{i}.{j}', v)
    for g in d['practise']:
        for li,L in enumerate(g.get('levels',[])):
            for ri,r in enumerate(L['rounds']):
                for j,v in enumerate(r['v']): add(f"{g.get('id')}.L{li+1}.R{ri+1}.{j}", v)
    for i,t in enumerate(d['test']['items']):
        for j,v in enumerate(t['v']): add(f'test{i+1}.{j}', v)
    return out
def norm(s): return re.sub(r"[^a-z0-9' ]+"," ",re.sub(r'<[^>]+>','',str(s)).lower().replace('’',"'"))
def spelled(s): return re.sub(r"\b([A-Za-z])(?:-([A-Za-z]))+\b", lambda m: m.group(0).replace('-',''), s)
probs=[]
def check(name, where, it):
    t=it.get('type'); st=it.get('stim') or {}
    P=lambda m: probs.append(f'{name} {where}: {m}')
    if t in ('mcq','pmcq'):
        if len(it['opts'])!=3: P('not 3 options')
        if it.get('at') not in (0,1,2): P('bad at')
        o=[json.dumps(x) for x in it['opts']]
        if len(set(o))!=len(o): P('duplicate options')
    elif t=='tfill':
        n=len(re.findall(r'\{\d\}', ' '.join(it['lines'])))
        if n!=len(it['ans']): P(f'{n} boxes but {len(it["ans"])} answers')
        if st.get('kind')=='audio':
            txt=norm(spelled(' '.join(l[2] for l in st.get('lines',[]))))
            for a in it['ans']:
                al=a if isinstance(a,list) else [a]
                if not any(norm(x).strip() in txt for x in al): P(f'answer {al} not said in audio')
    elif t=='bank':
        bank=st.get('bank') or []
        if it['ans'] not in [b[0] for b in bank]: P('bank answer missing')
    else: P(f'unknown type {t}')
    if st.get('kind')=='audio':
        if not st.get('lines'): P('audio without lines')
        for l in st.get('lines',[]):
            if len(l)<3 or not l[0].startswith(('bf_','bm_')): P(f'bad audio line {l[:2]}')
files=sys.argv[1:]
for f in files:
    d=json.load(open(f)); name=f.split('/')[-1]
    its=items_of(d)
    for w,it in its: check(name,w,it)
    ats=Counter(it.get('at') for w,it in its if it.get('type') in ('mcq','pmcq'))
    dok=[t.get('dok') for t in d['test']['items']]
    print(f'{name}: {len(its)} items, at {dict(ats)}, test {len(d["test"]["items"])} dok {dok}, lightning {len(d["lightning"]["items"])}')
    for q,o in d['lightning']['items']:
        if len(o)!=3 or len(set(o))!=3: probs.append(f'{name} lightning bad: {q}')
print('\n'.join(probs) or 'NO PROBLEMS')
