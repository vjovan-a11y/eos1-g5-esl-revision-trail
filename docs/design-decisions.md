# Design decisions (agreed with Jovan, 24 to 25 November 2026)

| Topic | Decision |
| --- | --- |
| Exam | Grade 5 ESL End of Semester 1, Cambridge Primary ESL Stage 6, SY 2026-27. Exam on Friday 27 November 2026. |
| Units | My World; Sport and Healthy Living; Living Things; Inventions and Technology (the school's pacing, not the Cambridge Scheme of Work order). |
| Scope | Full 9 stops + Summit, built fast. Speaking is NOT included. |
| Stops | 1 Word Vault, 2 Time Machine, 3 Grammar Toolkit, 4 Listening Lounge (pictures and notes), 5 Chat Café (conversations), 6 Notice Board, 7 Gap Garage, 8 Reading Lighthouse, 9 Writing Workshop. Listening was split into two stops to keep nine. |
| Listening count | 19 questions, following the test specification (not the 15 on the paper): Part 1 pictures 7, Part 2 notes 5, Part 3 conversation 7. |
| Audio | Pre-made recordings with British voices, each played two times like the exam. |
| Sign-in | Exactly as the G5 Maths trail: Student / Teacher / Visitor, progress code, How to use guide, school label. |
| Writing feedback | Self-check: word counter, bullet checklist, language spotter, self-mark with the rubric, model answers at three levels. No teacher view of writing. |
| Summit | Full practice exam (Listening 19, Reading and Use of English 34, Writing 2 tasks), timed with a visible clock and a 5-minute warning (students may finish after time), then the Lightning round and the certificate. |
| Summit unlock | Open for everyone (since 25 November; before that it opened after 4 Mini tests). |
| Look | Same family look as the Maths trail; Zip the robot and the VI (Vietnamese) button kept. |
| Companion documents | Coverage map + item-security note, and a simple steps guide for teachers, children and families (Claude Docs). |
| Reviews | One preview, then the final version. |

## Writing prompts kept apart

The Summit mock's writing prompts (since 25 November: Task 1 how to make a cup telephone; Task 2 a hobby I love) are not used in Stop 9, so the mock stays a fresh test. The first prompts (a fruit smoothie; a person I admire) were replaced because Stop 9 examples rehearsed them. Stop 9 tasks: goldfish, Grandma's video call, sunflower seed (Task 1); my favourite place in my town, the Arctic fox, sports day (Task 2).

## Review and improvements (25 November 2026)

An expert review (listening, reading and grammar, writing, and a play-through as a student) led to these changes, agreed with Jovan.

| Area | Change |
| --- | --- |
| Summit scoring | Totals from the ESL papers: Listening 19 + Reading and Use of English 34 = 53; trophy at 38 (70%); "Practise again" names Stops 4 to 8 by Part. The start screen and lock message describe the ESL papers. |
| Fresh Summit | New Reading Part 3 dialogue (a hedgehog in the garden), new Part 6 article (learning to ride a unicycle), new Writing tasks (a cup telephone; a hobby I love). The old ones repeated Stop 6, Stop 8 and Stop 9 material. |
| Fair options | The right answer is the longest option in about one item in three in every stop (it was 52% in Stop 2, 46% in Stop 8 and never in Stop 5). Non-English distractors removed; Stop 5 distractors all come from the talk; hints teach a strategy and never give the answer. |
| Accepted answers | Valid alternatives added (in ages, planning/hoping to, 've, 08.15 and other time forms). |
| Words step | One screen per set (word, meaning, example, VI), then a "Which word fits this meaning?" quiz. Flip cards are optional. |
| Writing desk | Step 1: mark a model with the rubric, then see the teacher's marks. Step 2: mark your own writing. Models (with marks per category) show after the self-mark. Stars: word count 2 + marking close to the teacher 2 + self-mark done 1. |
| Navigation | "Map" and "Stops" buttons on every step, stop hub and the Summit; the Stops menu lists the trail map, the nine stops (with stars), the Summit and the steps of the current stop. Leaving a step asks first. |
| Pictures | One illustrated picture set (Microsoft Fluent Emoji, MIT licence) replaces device emoji everywhere (img/emoji/*.svg, 04-emoji.js); bigger picture answers; time answers show a real clock with the right hands. |
| Listening exam mode | On a test paper: reading time (10 s, or 20 s for a long talk), then the recording plays two times by itself with a 5-second gap and no pause, like the real paper. In practice: free play and a "Slower" button. |
| Recordings (v2) | Spelled names use the exact British letter names (v1 read the letter A as "eye"); every line at the same loudness; 0.75 s between speakers; files loudness-matched to -16 LUFS with no clipping; 64 kbps. Checked with a speech recogniser (scripts/audio_clarity.py). |

Later the same day (Jovan's go-ahead):
- The objective code and DOK label under each question show for teachers and TAs only (students see the question alone).
- The school label reads "Advanced Programme" (British spelling).
- The Summit is open for everyone (it opened after 4 Mini tests), because the exam is on 27 November.
- The PAPER look: Arial, black on white, black line-drawing pictures (Fluent Emoji high-contrast), navy buttons, green and red only for right and wrong (99-paper.css), with ink cartoon animation (99-cartoon.css). This trail now looks different from the other EOS1 trails on purpose.
