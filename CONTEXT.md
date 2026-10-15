# english-with-jamie — Layer 1: where do I go?

A small Next.js app used as a shared tool for teaching English online, one to one, plus
the ICM studios that produce everything the app shows.

## How it is used

- The teacher (Jamie) has the app open on his machine; the student has it open on hers.
- Whatever the teacher drives (current lesson, slide, exercise) the student's screen follows.
- Content is **not** written in the app. It is written as markdown in `content/`, in a
  Claude session, through a studio. The app renders it.
- Built for a single student today. Multi-student support comes later; keep the data
  model simple but don't paint it into a corner.

## The map

| Layer | Where | Answers |
|---|---|---|
| 0 | [`AGENTS.md`](AGENTS.md) | Where am I? |
| 1 | this file · [`studios/CONTEXT.md`](studios/CONTEXT.md) | Where do I go? |
| 2 | `studios/<studio>/CONTEXT.md` | What do I do? |
| 3 | [`studios/_shared/`](studios/_shared/) | What rules apply? (learner, voice, syllabus, formats) |
| 4 | `studios/<studio>/intake/` · [`content/`](content/) | What am I working with, and what did I make? |

## What the lessons are for

1. Conversation first: the everyday situations she will have to handle on arrival —
   introductions, host family, school admin, classes, friends, shops, transport, health.
2. Practical English over exam English: idiom, register, listening at natural speed.
3. Things to watch, read and listen to, chosen with her, not for her. Recommendations in
   this app come from the teacher, never generated.
4. Light accountability: homework and visible progress, shared with the teacher rather
   than gamified for its own sake.

Private notes about the student (personal details, family messages, assessments) do not
belong in this repository. Keep them outside git.
