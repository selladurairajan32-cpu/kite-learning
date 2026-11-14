# Kite Learning: prototype

A clickable prototype of the Kite Learning 11+ platform (Years 3 to 6). It is one self-contained web page with no server and no build dependencies beyond Node.

Published at https://claude.ai/artifact/EyFY139G4Hfk6unn2R2ATo

## What is in it

Homepage → log in / create account → who is learning (parent or child) → subjects → Mathematics → Fractions → a lesson.

Two lessons are built, both in Fractions (Foundation):

1. **Understanding Fractions**: sharing a pizza fairly; the fraction lab.
2. **Fractions on a Number Line**: Pip the frog crosses from 0 to 1 in equal jumps; the number-line lab.

Every lesson has the same five steps (Learn, Explore, Examples, Practise, Mastery check) and a **Watch teacher explain** player at the bottom. A lesson opens when the one before it is mastered; the topic page has a "Preview" link on a locked lesson so reviewers can open it directly.

The other subjects and lessons are placeholders, the parent view uses sample figures apart from the Fractions lessons, and any login details are accepted.

## Files

| File | What it holds |
|---|---|
| `src/head.html` | Page title and font links |
| `src/styles.css` | The whole design system and every screen's styles |
| `src/core.js` | Helpers, icons, the kite logo, fraction pictures, saved state, read-aloud voice, the maths curriculum map, the lesson register |
| `src/tools.js` | Shared maths tools: the fraction lab, the number line, Pip the frog, the story characters |
| `src/teacher.js` | The handwriting teacher player: hand-drawn strokes, timeline, captions, voice |
| `src/frame.js` | The lesson frame that runs the five steps for whichever lesson is open |
| `src/lessons/*.js` | One file per lesson: its story, tool, examples, questions and teacher script |
| `src/views.js` | Homepage, login, profiles, parent view, student home, Mathematics, topic pages |
| `src/main.js` | Routing (`#home`, `#login`, `#join`, `#profiles`, `#parent`, `#subjects`, `#maths`, `#topic-<id>`, `#lesson-<id>`) and click handling |
| `build.js` | Joins everything in `src/` into one page |
| `kite-learning.html` | Built page, in the form that gets published |
| `preview.html` | The same page wrapped so it opens directly in a browser |

## Changing it

1. Edit the files in `src/`.
2. Run `node build.js`.
3. Open `preview.html` in a browser to check it.

## Adding a lesson

Copy the shape of `src/lessons/number-line.js`. A lesson file is wrapped in `{ ... }` and ends with `addLesson({ ... })`, which needs:

- `id`, `topic`, `n` (its place in the topic), `title`, `level`, `minutes`, `blurb`, `thumb()`, `homeTip`
- `intro`: the opening sentence, three goals and three "why it matters" pictures
- `learn`: the story slides. Each slide has a picture (`viz`) and a list of beats; each beat has the sentence to say, the button label, and an `enter` function that plays its animation
- `explore`: the hands-on tool (`mount`) and its small challenges (`missions`)
- `examples`: worked examples revealed one step at a time
- `practice` and `mastery`: questions (types `pick`, `shade`, `place`, `build`), with hints and a message for each common mistake
- `skills`: plain names for the skills the questions test
- `teacher`: what the teacher says and writes, as marks on a 900 × 600 board
- `canDo`, `passSay`: the sentences on the completion screens

The file's position in the topic comes from `n`; `build.js` picks up every file in `src/lessons/`.

## Where things live

- Topics and lesson names: `PATHWAYS` and `LESSONS` in `src/core.js`.
- Colours, type and spacing: the `:root` block at the top of `src/styles.css`.
- Progress is saved in the browser under the key `kite-learning-proto-v2`, per child and per lesson.
