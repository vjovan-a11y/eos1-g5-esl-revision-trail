# Content format for the G5 ESL Revision Trail (one JSON file per stop)

Write valid JSON (UTF-8, double quotes, no comments, no trailing commas). Save as /home/claude/content/stopN.json.
Inside any English text you may use: *word* = gold highlight (for the key word or structure), <b>bold</b>, <br>.
Every {en, vi} pair: en = simple English for a 10-year-old; vi = natural Vietnamese translation of the SAME instruction.
Vietnamese is ONLY for instructions, titles, blurbs and word meanings, NEVER for the English being tested.

## Top level
{
  "n": 1,
  "title": "Topic words and word building",
  "blurb": {"en": "...", "vi": "..."},                       // one sentence, max 18 words
  "words": WORDS,
  "see": SEE,
  "practise": [GAME_LEARN, GAME_EXAM],
  "notes": NOTES,
  "test": TEST,
  "lightning": LIGHTNING,
  "selfcheck": {"goals": ["say ...", "use ...", "..."], "again": ["c","r","a","a"]}   // 4 goals; again: c = See it, r = Learn it game, a = Exam game
}

## WORDS: 3 sets, 4 to 5 words each (12 to 14 words). For the skills stops, the "words" are exam words and strategy words.
"words": {
  "sets": [{"id":"A","title":{"en":"Animals","vi":"Động vật"},"keys":["habitat","predator","..."]}, ...],
  "items": {"habitat": {"emoji":"🏞️", "vi":"môi trường sống", "def":"The natural home of an animal or plant.", "ex":"The *habitat* of a polar bear is cold and icy."}, ...}
}
emoji: ONE emoji that pictures the word (it is drawn big on the word card). def: max 18 words. ex: one example sentence with the word in *stars*.

## SEE ("See it"): 2 or 3 short teaching scenes, then a challenge.
"see": {
  "scenes": [
    {"id":"s1", "title":{"en":"...","vi":"..."},
     "kind":"text",                         // "text" (a short passage, notice or dialogue) or "audio" (a short talk, see AUDIO)
     "head":"A notice at the sports centre",  // what the text is
     "html":"Short text (40 to 120 words). Put the target language in *stars* so it lights up.",
     "audio": null,                         // or an AUDIO object when kind = "audio" (then html = the transcript, shown after listening)
     "steps":[{"en":"Look at the words in gold. They are all *passive*.","vi":"..."}, ...]   // 2 to 4 short teaching lines Zip says one by one
    }
  ],
  "challenge": {"end":{"en":"...","vi":"..."}, "result":"You spotted ...", "rounds":[ROUND, ROUND, ROUND, ROUND]}   // 4 rounds
}

## GAMES. Two games per stop: "Learn it" (id "sNr", step-by-step, easier) and "Exam style" (id "sNa", exactly like the exam part).
{"id":"s1r","title":"Learn it","blurb":{"en":"...","vi":"..."},
 "levels":[ {"title":{"en":"...","vi":"..."}, "rounds":[ROUND, ROUND, ROUND]}, ... ]}      // 3 levels x 3 rounds

ROUND = {"lo":["6Ug.07"], "v":[ITEM, ITEM]}      // the SAME kind of question twice (a child who plays again gets the second)

## ITEM types
1) Multiple choice
{"type":"mcq", "q":"Question text", "opts":["RIGHT answer","wrong","wrong"], "at":1,
 "whys":[null,"Why this is wrong / what to check.","..."], "hint":"A strategy hint, not the answer.",
 "worked":"Why the right answer is right, quoting the key words.", "stim": STIM_OR_NULL}
 - opts[0] is ALWAYS the right answer; "at" (0, 1 or 2) is where it will be SHOWN. Spread "at" evenly.
2) Picture choice (Listening Part 1 only)
{"type":"pmcq", "q":"Where did Maya go on Saturday?", "opts":[{"pic":"🏊","tag":""},{"pic":"🎬","tag":""},{"pic":"📚","tag":""}], "at":2, "whys":[...], "hint":"...", "worked":"...", "stim": AUDIO_STIM}
 - pic: 1 or 2 emoji that show the option clearly. tag: optional short text on the picture (a price "£12", a time "7:45", a day "Tue"); use tags for times, prices, days and numbers.
3) Type the word(s)
{"type":"tfill", "q":"Instruction or question", "lines":["She {0} lived here since 2019."], "ans":[["has","'s"]],
 "hint":"...", "worked":"...", "stim": STIM_OR_NULL}
 - {0}, {1} mark the boxes; ans[i] lists every accepted answer for box i (lower case; matching ignores capitals and extra spaces). One word per box unless the exam part allows two.
4) Letter choice from a bank (Reading Part 3 dialogue, Reading Part 5 matching)
 Use "mcq" with "letters": true and opts = ALL the bank options in letter order is NOT allowed; instead write it as:
{"type":"bank", "q":"Choose the best answer for gap 13.", "bank":"bankId", "ans":"E", "hint":"...", "worked":"...", "stim": STIM}
 and put the bank once in the stim: STIM.bank = [["A","text"],["B","text"],...] (8 options A to H for dialogues, 7 options A to G for matching).

## STIM (shared stimulus: a text or a talk that one or more items use)
Text:  {"id":"s6-notice-1", "kind":"text", "head":"Text message", "html":"...", "bank": null}
Dialogue with gaps: {"id":"s6-dlg-1", "kind":"text", "head":"Conversation", "html":"Leo: ...<br>Mai: (13) ________<br>Leo: ...", "bank":[["A","..."],...]}
Audio: {"id":"s4-a-07", "kind":"audio", "head":"Listen to Omar and his mum.", "lines":[["bm_george","Omar","Mum, have you seen my..."],["bf_emma","Mum","..."]]}
 - voices: girls/women bf_emma, bf_isabella, bf_alice, bf_lily; boys/men bm_george, bm_lewis, bm_daniel, bm_fable. Each speaker keeps one voice.
 - Child speakers: use bf_lily / bf_alice for girls and bm_lewis / bm_fable for boys; adults: bf_emma, bf_isabella, bm_george, bm_daniel.
 - To spell a name write it as letters with hyphens inside the line: "That's W-A-L-L-I-S." (spoken letter by letter).
 - Items that share one talk use the SAME stim object (same id, repeat it in full in each item; the build keeps one copy).
 - "id" must be unique across the whole stop (start with sN-).

## NOTES: 5 or 6 rules or strategies, each with an example, then one gap sentence per note.
"notes": {"items":[{"en":"Use the *present perfect* for something that started in the past and is still true.","vi":"...","example":["I *have lived* here *since* 2020.","She *has played* the piano *for* three years."]}],
          "check":[{"sentence":"We {have known|knew|know} each other since Grade 1.","answer":"have known"}]}
 - In check sentences the FIRST choice in the braces is the right one; "answer" repeats it.

## TEST (Mini test): exactly 10 items, easy to hard: 5 at dok 1, then 5 at dok 2. Exam format of the stop.
"test": {"items":[{"dok":1,"lo":["6Ug.03"],"v":[ITEM, ITEM]}, ...]}

## LIGHTNING: 50 quick questions, each [question, [RIGHT, wrong, wrong]]. Max 10 words per question, 1 to 4 words per answer.
"lightning": {"secs":60, "items":[["A ___ of bees", ["swarm","herd","flock"]], ...]}

## Quantities per stop (minimum)
words 12 to 14 | see: 2 to 3 scenes + 4 challenge rounds | Learn it: 3 levels x 3 rounds x 2 variants | Exam style: 3 levels x 3 rounds x 2 variants | notes 5 to 6 | test 10 items x 2 variants | lightning 50.
