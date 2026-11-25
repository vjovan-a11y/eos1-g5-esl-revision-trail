import re, os, sys
src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf8').read().split('\n')
os.makedirs(out, exist_ok=True)
hdr = re.compile(r'^/\* ([0-9]{2}[a-z0-9-]*\.(css|js))')
cur, buf, order = '_head.html', [], []
def flush():
    if buf or cur:
        open(os.path.join(out, cur), 'w', encoding='utf8').write('\n'.join(buf) + '\n'); order.append(cur)
mode = 'head'
for ln in lines:
    if mode == 'head' and ln.strip() == '<style>' :
        buf.append(ln); flush(); cur, buf, mode = '_css_pre.css', [], 'css'; continue
    if mode == 'css' and ln.strip() == '</style>':
        flush(); cur, buf, mode = '_mid.html', [ln], 'mid'; continue
    if mode == 'mid' and ln.strip() == '<script>':
        buf.append(ln); flush(); cur, buf, mode = '_js_pre.js', [], 'js'; continue
    if mode == 'js' and ln.strip() == '</script>':
        flush(); cur, buf, mode = '_tail.html', [ln], 'tail'; continue
    m = hdr.match(ln)
    if m and mode in ('css', 'js'):
        flush(); cur, buf = m.group(1), [ln]
        if cur in order: cur = cur.replace('.', '.dup.', 1)
        continue
    buf.append(ln)
flush()
open(os.path.join(out, '_order.txt'), 'w').write('\n'.join(order) + '\n')
print(len(order), 'parts')
