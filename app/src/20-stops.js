/* 20-stops.js - the nine stops of the Grade 5 ESL trail: what the map and the hubs know about each one.

   T.stops[i] = { n, title, world, place, badge, unit, los, status, quick, dataWorld, badgeArt, sceneArt }
     n         the stop number, 1 to 9 (T.stops[n - 1]); a Number
     title     the maths topic (the same as the pack's title; the nine topics of docs/01-brief.md)
     world     the name of the stop's world (shown on the map, the hub, the big button)
     place     the world as a sentence says it: 'the Number Factory' ("Visit ...", "Try Stop N now: ...",
               "You finished every step of ...")
     badge     the badge that all five steps win
     unit      the unit of the course, for teachers (as in Maths v2)
     los       the learning objective codes of the stop (Cambridge Primary Mathematics Stage 6)
     status    'open' (it can be opened; a stop whose pack has not arrived yet shows a "coming soon" hub) or 'soon'
     quick     true for a quick-practice stop: only its Practise games are ready. Its hub says so ("Quick practice")
     dataWorld the value of data-world on #app inside the stop ('1' to '9'): it switches the world tokens
     badgeArt  the id of the round map picture, 'badge-N' (src/art/02-art-maths.js)
     sceneArt  the id of the world scene for the hub header (until it is drawn, the hub shows the badge on
               the world's own sky and hills)

   Also here: T.OBJECTIVES (code -> skill), T.TWM (the 8 TWM characteristics), T.DOK (the 3 DOK levels) and
   T.DOK_MIX (the DOK of the 10 Mini Practice test questions, in order).

   Session 1: all nine stops are open and every pack holds only its title and blurb, so every step
   says "Coming soon". The steps arrive stop by stop (docs/03-build-plan.md). */
(function (T) {
  'use strict';

  // the Cambridge Primary Mathematics Stage 6 objectives of the test (codes and official 0096 wording, as in the
  // school's "Maths Grade 5 Stage 6 Detailed test specifications", EOS1 SY 26-27): shown with every Practise question
  // the Cambridge Primary ESL Stage 6 objectives of the EOS1 test (codes and wording of the school's public test
  // specification, Grade 5, AY 2026-2027): shown with every Practise question and on the test papers
  T.OBJECTIVES = {
    "6Ld.01": "Understand a range of instructions.",
    "6Ld.04": "Understand, with support, most specific information and detail of short and extended talk.",
    "6Ld.05": "Understand, with support, most of the detail of an argument in short and extended talk.",
    "6Lm.01": "Understand, with support, most of the main points of short and extended talk.",
    "6Ug.01": "Use a limited range of verb forms to ask questions to develop ideas and extend understanding.",
    "6Ug.03": "Use a range of present simple active forms and begin to use passive forms.",
    "6Ug.04": "Use a range of past simple active forms for habits and states and begin to use passive forms.",
    "6Ug.07": "Use present perfect forms to express recent, indefinite and unfinished past.",
    "6Ug.08": "Use a range of future forms, including present continuous and present simple with future meaning.",
    "6Ug.09": "Begin to use if clauses in first conditionals.",
    "6Ug.10": "Use common prepositional verbs (e.g. walk away).",
    "6Ug.12": "Use an increasing range of modal forms (e.g. needn't, should, ought to).",
    "6Us.05": "Use an increasing range of defining relative clauses (e.g. with whose and whom) and begin to use non-defining relative clauses.",
    "6Us.07": "Use the patterns verb + object + infinitive and give/take/send/bring/show + direct/indirect object.",
    "6Uv.02": "Use an increasing range of prepositions preceding nouns.",
    "6Uv.06": "Use collective nouns.",
    "6Rd.01": "Understand, with support, most specific information and detail in short and extended texts.",
    "6Rd.03": "Understand, with support, most of the detail of an argument in short and extended texts.",
    "6Rd.04": "Deduce meaning from context, with support, in short and extended texts.",
    "6Rm.01": "Understand, with support, most of the main points of short and extended texts.",
    "6Rm.02": "Read independently a range of short, simple fiction and non-fiction texts with confidence and enjoyment.",
    "6Ro.01": "Recognise, with support, the opinions of the writer(s) in short and extended texts.",
    "6Wc.01": "Write a sequence of instructions.",
    "6Wc.02": "Write short texts describing people, places, objects and events.",
    "6Wc.03": "Express opinions and feelings.",
    "6Wca.02": "Spell most familiar words accurately on a range of familiar topics.",
    "6Wca.03": "Plan, write, edit and proofread short texts, with little or no support.",
    "6Wca.04": "Use grammatical structures correctly, allowing for occasional mistakes.",
    "6Wor.02": "Link sentences using an increasing range of connectives to create a short text organised into paragraphs.",
    "6Wor.03": "Use appropriate layout for a limited range of written genres."
  };

  // ESL has no TWM characteristics (they are a maths idea): the labels show the code, the skill and the DOK only
  T.TWM = {};

  // Depth of Knowledge (Webb), as in the public test specification. Grade 5 ESL EOS1: at least 30% DOK 1 and at least
  // 30% DOK 2 in Listening, Reading and Use of English; DOK 3 is not used. A Mini test is 5 DOK 1, then 5 DOK 2.
  T.DOK = {
    1: { name: "Recall", what: "Find or recognise what the text or the speaker says" },
    2: { name: "Skill and concept", what: "Understand a paraphrase, infer, compare, decide what someone means or thinks" },
    3: { name: "Strategic thinking", what: "Reason with evidence across a text" }
  };
  T.DOK_MIX = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2];

  T.stops = [
    { n: 1, title: 'Topic words and word building', world: 'Word Vault', place: 'the Word Vault', badge: 'Word Wizard', unit: 'Units 1 to 4', los: ['6Uv.06', '6Ug.10', '6Uv.02', '6Rd.04'], status: 'open', dataWorld: '1', badgeArt: 'badge-1', sceneArt: 'world-word-vault' },
    { n: 2, title: 'Verb forms: now, then and next', world: 'Time Machine', place: 'the Time Machine', badge: 'Time Traveller', unit: 'Use of English', los: ['6Ug.03', '6Ug.04', '6Ug.07', '6Ug.08'], status: 'open', dataWorld: '2', badgeArt: 'badge-2', sceneArt: 'world-time-machine' },
    { n: 3, title: 'Modals, if, who/which/whose and verb patterns', world: 'Grammar Toolkit', place: 'the Grammar Toolkit', badge: 'Grammar Builder', unit: 'Use of English', los: ['6Ug.12', '6Ug.09', '6Us.05', '6Us.07', '6Ug.01'], status: 'open', dataWorld: '3', badgeArt: 'badge-3', sceneArt: 'world-grammar-toolkit' },
    { n: 4, title: 'Listening: pictures and notes', world: 'Listening Lounge', place: 'the Listening Lounge', badge: 'Sharp Listener', unit: 'Listening Parts 1 and 2', los: ['6Ld.01', '6Ld.04'], status: 'open', dataWorld: '4', badgeArt: 'badge-4', sceneArt: 'world-listening-lounge' },
    { n: 5, title: 'Listening: conversations', world: 'Chat Café', place: 'the Chat Café', badge: 'Chat Champion', unit: 'Listening Part 3', los: ['6Lm.01', '6Ld.05', '6Ld.04'], status: 'open', dataWorld: '5', badgeArt: 'badge-5', sceneArt: 'world-chat-cafe' },
    { n: 6, title: 'Signs, messages and conversations', world: 'Notice Board', place: 'the Notice Board', badge: 'Message Master', unit: 'Reading Parts 2 and 3', los: ['6Rd.01', '6Rd.03', '6Rm.01'], status: 'open', dataWorld: '6', badgeArt: 'badge-6', sceneArt: 'world-notice-board' },
    { n: 7, title: 'Grammar in sentences and emails', world: 'Gap Garage', place: 'the Gap Garage', badge: 'Gap Fixer', unit: 'Reading Parts 1 and 4', los: ['6Ug.03', '6Ug.04', '6Ug.07', '6Ug.09', '6Ug.12', '6Us.05', '6Uv.02'], status: 'open', dataWorld: '7', badgeArt: 'badge-7', sceneArt: 'world-gap-garage' },
    { n: 8, title: 'Matching and longer texts', world: 'Reading Lighthouse', place: 'the Reading Lighthouse', badge: 'Reading Ranger', unit: 'Reading Parts 5 and 6', los: ['6Rm.01', '6Rd.01', '6Ro.01', '6Rd.04', '6Rm.02'], status: 'open', dataWorld: '8', badgeArt: 'badge-8', sceneArt: 'world-reading-lighthouse' },
    { n: 9, title: 'Instructions, advice and descriptions', world: 'Writing Workshop', place: 'the Writing Workshop', badge: 'Star Writer', unit: 'Writing Tasks 1 and 2', los: ['6Wc.01', '6Wc.02', '6Wc.03', '6Wca.03', '6Wor.02'], status: 'open', dataWorld: '9', badgeArt: 'badge-9', sceneArt: 'world-writing-workshop' }
  ];
})(window.T = window.T || {});

