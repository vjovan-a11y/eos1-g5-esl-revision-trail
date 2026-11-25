#!/usr/bin/env python3
"""Compare every English string in the trail content JSON against the real EOS1 papers.
Reports: shared runs of >= N consecutive words, shared person names, near-copy sentences.
Usage: python3 -I overlap.py [content files...]
"""
import json, re, sys, glob, os, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
N = 6
PAPERS = ["reading.txt", "listening.txt", "writing.txt", "answerkey.txt"]
CONTENT = sys.argv[1:]
SKIP_KEYS = {"vi"}  # Vietnamese fields are not compared
# Names of people in the real papers: one per line in names.txt beside this script (kept private, never in the package)
NAMES = set(l.strip().lower() for l in open(os.path.join(HERE, "names.txt"), encoding="utf-8") if l.strip()) if os.path.exists(os.path.join(HERE, "names.txt")) else set()
# Generic exam rubric sentences that may legitimately recur
GENERIC = {"for each question circle the correct letter a b or c"}

def norm_words(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("’", "'").replace("*", " ")
    s = re.sub(r"[^a-z0-9' ]+", " ", s.lower())
    return [w.strip("'") for w in s.split() if w.strip("'")]

def sentences(s):
    s = re.sub(r"<[^>]+>", " ", s).replace("*", "")
    return [x.strip() for x in re.split(r"(?<=[.!?])\s+|\n+", s) if len(x.split()) >= 5]

def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in SKIP_KEYS:
                continue
            yield from walk(v, f"{path}.{k}")
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        yield path, o

paper_text = ""
for p in PAPERS:
    with open(os.path.join(HERE, p), encoding="utf-8") as f:
        paper_text += f.read() + "\n"
pw = norm_words(paper_text)
grams = set(tuple(pw[i:i + N]) for i in range(len(pw) - N + 1))
psent = [" ".join(norm_words(x)) for x in sentences(paper_text)]
psent = [x for x in psent if len(x.split()) >= 5]

flags = []
for fn in CONTENT:
    with open(fn, encoding="utf-8") as f:
        data = json.load(f)
    base = os.path.basename(fn)
    for path, s in walk(data):
        w = norm_words(s)
        # 1) shared runs of N+ words (merge overlapping hits into maximal runs)
        hit = [i for i in range(len(w) - N + 1) if tuple(w[i:i + N]) in grams]
        if hit:
            runs, start, prev = [], hit[0], hit[0]
            for i in hit[1:]:
                if i != prev + 1:
                    runs.append((start, prev)); start = i
                prev = i
            runs.append((start, prev))
            for a, b in runs:
                run = " ".join(w[a:b + N])
                if run not in GENERIC:
                    flags.append((base, path, "RUN", run))
        # 2) shared person names (capitalised in the content string)
        for nm in set(re.findall(r"\b[A-Z][a-z]+\b", s)):
            if nm.lower() in NAMES:
                flags.append((base, path, "NAME", nm))
        # 3) near-copy sentences
        for cs in sentences(s):
            c = " ".join(norm_words(cs))
            if len(c.split()) < 5:
                continue
            for ps in psent:
                r = difflib.SequenceMatcher(None, c, ps).ratio()
                if r >= 0.75:
                    flags.append((base, path, f"NEAR {r:.2f}", c[:90]))
                    break

for f in flags:
    print(" | ".join(f))
print(f"TOTAL FLAGS: {len(flags)}")
