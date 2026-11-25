# Item security

No question, text, talk, person's name, situation or writing prompt in the trail comes from the real Grade 5 EOS1 papers. This is the most important rule of the project.

## The process

1. **Analyst.** Reads the real papers and the test specification and writes `exam-style-guide-esl.md`: HOW each part asks questions (task types, counts, lengths, kinds of wrong answers, DOK mix), never WHAT it asks.
2. **Writers.** Write all content from the four writer documents only (`exam-style-guide-esl.md`, `content-format.md`, `stops-brief.md`, `learning-objectives.md`). They never open the real papers. `stops-brief.md` lists situations they must not use.
3. **Checker.** Compares every English string in `content/*.json` with the real papers using `scripts/overlap_check.py`: runs of 6 or more identical words, shared person names, near-copy sentences. Then reads for reused situations or writing prompts. Fixes every flag in the content JSON.

## Running the overlap check

Keep the paper texts in a private local folder that is NEVER part of this package, the app or any upload:

```
private-papers/
  overlap_check.py   (copy of scripts/overlap_check.py)
  reading.txt  listening.txt  writing.txt  answerkey.txt   (text of the real papers)
  names.txt          (people's names in the real papers, one per line)
```

```bash
python3 -I private-papers/overlap_check.py content/stop{1,2,3,4,5,6,7,8,9}.json content/summit.json
```

Expected result: no RUN flags and no NAME flags. NEAR flags on standard exam instructions ("Give your writing a suitable title", "What is the writer mainly doing in this article?", "Explain why one step is important") are accepted: they are format wording.

## Result of the check on 25 November 2026

| Check | Found | Action |
| --- | --- | --- |
| Runs of 6+ identical words | 0 in content | none |
| Shared person names | 4 names (in Stops 4 to 8 and the Summit) | renamed everywhere, same gender; recordings remade |
| Near-copy sentences | 1 question in Stop 4 | reworded |
| Standard exam instructions | 18 | kept (format wording) |
| Reused situations or writing prompts | 0 | none |

## When you add content

Any new content goes through the same three roles. A writer never sees the papers. Run the overlap check before publishing.
