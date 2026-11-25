"""emoji_build.py - swap the system emoji for one illustrated picture set (Microsoft Fluent Emoji, MIT licence).

Run from the folder root:  python3 scripts/emoji_build.py <fluentui-emoji>/icons/high-contrast <emojibase-data>/en/data.json
(since 25 November 2026 the high-contrast style: black line drawings like exam pictures; icons/modern is the colour style)

1. finds every emoji used in content/*.json and app/src/* (not the generated packs)
2. matches each one to a Fluent Emoji SVG by its CLDR name (people and hands: the "-default" yellow version)
3. copies the SVGs to dist/img/emoji/<codepoints>.svg (shrunk with svgo when it is installed)
4. writes app/src/04-emoji.js: the map emoji -> file, used at run time by the same file (see its header)
Emoji with no match keep the device's own emoji. """
import json, os, re, shutil, subprocess, sys, glob

MODERN, EMOJIBASE = sys.argv[1], sys.argv[2]
OUT_DIR = 'dist/img/emoji'
PAT = re.compile(r'(?:[\U0001F1E6-\U0001F1FF]{2})|(?:[#*0-9]️?⃣)|(?:[☀-➿⬀-⯿⌀-⏿\U0001F000-\U0001FAFF]'
                 r'(?:️|[\U0001F3FB-\U0001F3FF])?(?:‍[☀-➿⬀-⯿⌀-⏿\U0001F000-\U0001FAFF](?:️)?)*)')
SKIP = {'✓', '✗', '★'}     # tick, cross and star marks are text, not pictures


def slug(label):
    return re.sub(r'[^a-z0-9]+', '-', label.lower().replace('’', '').replace("'", '')).strip('-')


text = ''.join(open(f, encoding='utf8').read() for f in sorted(glob.glob('content/*.json')))
text += ''.join(open(f, encoding='utf8').read() for f in sorted(glob.glob('app/src/*'))
                if not os.path.basename(f).startswith('22-') and not f.endswith('04-emoji.js'))
used = sorted(set(m.group(0) for m in PAT.finditer(text)) - SKIP)
names = {e['emoji'].replace('️', ''): slug(e['label']) for e in json.load(open(EMOJIBASE, encoding='utf8'))}
avail = set(f[:-4] for f in os.listdir(MODERN))

if os.path.isdir(OUT_DIR):
    shutil.rmtree(OUT_DIR)
os.makedirs(OUT_DIR)
mp, missing = {}, []
for e in used:
    n = names.get(e.replace('️', ''))
    hit = n if n in avail else (n + '-default' if n and n + '-default' in avail else None)
    if not hit:
        missing.append(e)
        continue
    code = '-'.join('%x' % ord(c) for c in e if c != '️')
    shutil.copy(os.path.join(MODERN, hit + '.svg'), os.path.join(OUT_DIR, code + '.svg'))
    mp[e] = code
    if '️' in e:
        mp[e.replace('️', '')] = code
    else:
        mp[e + '️'] = code

before = sum(os.path.getsize(f) for f in glob.glob(OUT_DIR + '/*.svg'))
try:
    subprocess.run(['npx', '--yes', 'svgo@3.3.2', '-q', '-f', OUT_DIR, '--multipass'], check=True, capture_output=True, timeout=600)
except Exception as ex:   # svgo is only a size saving
    print('svgo skipped:', ex)
after = sum(os.path.getsize(f) for f in glob.glob(OUT_DIR + '/*.svg'))

js = open('scripts/emoji_runtime.js', encoding='utf8').read().replace('__MAP__', json.dumps(mp, ensure_ascii=False, sort_keys=True))
open('app/src/04-emoji.js', 'w', encoding='utf8').write(js)
print('emoji used', len(used), 'pictures', len(set(mp.values())), 'kept as device emoji', missing)
print('picture files', before // 1024, 'KB ->', after // 1024, 'KB')
