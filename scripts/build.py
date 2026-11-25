import os, sys
src, out = sys.argv[1], sys.argv[2]
order = [l.strip() for l in open(os.path.join(src, '_order.txt')) if l.strip()]
parts = [open(os.path.join(src, p), encoding='utf8').read().rstrip('\n') for p in order]
open(out, 'w', encoding='utf8').write('\n'.join(parts) + '\n')
