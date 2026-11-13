# Kite Learning: Phase 1 prototype

A clickable prototype of the Kite Learning 11+ platform (Years 3 to 6). It is one self-contained web page with no server and no build dependencies beyond Node.

Published at https://claude.ai/artifact/EyFY139G4Hfk6unn2R2ATo

## What is in it

Homepage → log in / create account → who is learning (parent or child) → subjects → Mathematics → Fractions → the lesson **Understanding Fractions** (Learn, Explore, Examples, Practise, Mastery check) with the **Watch teacher explain** player at the bottom of the lesson.

Only that one lesson is built. The other subjects and lessons are placeholders, the parent view uses sample figures, and any login details are accepted.

## Files

| File | What it holds |
|---|---|
| `src/head.html` | Page title and font links |
| `src/styles.css` | The whole design system and every screen's styles |
| `src/core.js` | Helpers, icons, the kite logo, fraction pictures, saved state, read-aloud voice, the maths curriculum map |
| `src/views.js` | Homepage, login, profiles, parent view, student home, Mathematics, topic pages |
| `src/lesson.js` | The lesson: animated Learn story, fraction lab, worked examples, practice and mastery questions |
| `src/teacher.js` | The handwriting teacher player: the script, hand-drawn strokes, timeline, captions, voice |
| `src/main.js` | Routing (`#home`, `#login`, `#join`, `#profiles`, `#parent`, `#subjects`, `#maths`, `#topic-<id>`, `#lesson`) and click handling |
| `build.js` | Joins everything in `src/` into one page |
| `kite-learning.html` | Built page, in the form that gets published |
| `preview.html` | The same page wrapped so it opens directly in a browser |

## Changing it

1. Edit the files in `src/`.
2. Run `node build.js`.
3. Open `preview.html` in a browser to check it.

## Where things live

- Lesson content (story steps, questions, hints, feedback): `LEARN`, `MISSIONS`, `EXAMPLES`, `PRACTICE` and `MASTERY` in `src/lesson.js`.
- What the teacher says and writes: `SCRIPT` in `src/teacher.js`. Each step has a sentence to say and a list of marks to draw on a 900 × 600 board.
- Topics and lesson names: `PATHWAYS` and `LESSONS` in `src/core.js`.
- Colours, type and spacing: the `:root` block at the top of `src/styles.css`.
- Progress is saved in the browser under the key `kite-learning-proto-v1`.
