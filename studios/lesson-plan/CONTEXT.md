# studios/lesson-plan — plan one lesson

Entered when Jamie asks for a lesson: a new one, the next one in the syllabus, or a
revision of an existing file. One run writes one lesson file. Work from the repo root.

## Inputs

| Layer | File | Why |
|---|---|---|
| 3 | [`../_shared/learner.md`](../_shared/learner.md) | Who it is for and what she needs |
| 3 | [`../_shared/voice.md`](../_shared/voice.md) | How it sounds |
| 3 | [`../_shared/syllabus.md`](../_shared/syllabus.md) | Which theme is next and what it must cover |
| 3 | [`../_shared/formats.md`](../_shared/formats.md) | The exact file shape the app parses |
| 4 | `intake/<date>.md` (if present) | Jamie's brief: theme, date, anything from the last lesson to pick up |
| 4 | `content/lessons/` — filenames and frontmatter only | What has been taught; don't repeat a theme unless asked |
| 4 | The previous lesson's body, if the brief says "follow on" | Continuity |

Don't read the app source, other studios, or `content/` beyond the lines above.

## Process

1. **Fix the theme and date.** From the brief if there is one; otherwise the next
   unticked row of the syllabus and the next lesson day Jamie names. If neither gives a
   date, ask once, then proceed with the date he gives.
2. **Shape it.** Sixty minutes, full: about 20–28 slides and 5–6 exercises, in
   presentation order, grouped into four or five parts (`@kicker: Part 2 · …`).
   - The first slide (`cover`) says what she will be able to do by the end; the last
     (`talk`) is the speaking task she does with Jamie, not an exercise.
   - **One idea per slide.** A story, a situation or a set of phrases gets its own slide,
     with something to read (a lead line and three or four bullets), a `@stat`, and its
     own drawing from the library in `formats.md`. Ask for a new drawing rather than
     reuse one inside a lesson.
   - **An exercise after every part,** never two in a row. Across the lesson use at least
     four of the five item kinds, and end most parts with a poll so the quiz turns into
     talk.
   - Mark slides that can be skipped in the lesson's teacher notes; it's fine for a lesson
     to hold a little more than an hour.
   The same layouts, parts and drawings across lessons are what make it one course.
3. **Write the phrases first.** Each lesson ships at least ten lines she can actually
   say, grouped by moment ("at the door", "at the table"). Then the one grammar point
   the theme leans on, shown through those same phrases. Then one listening or
   pronunciation note.
4. **Write the exercises** in the items grammar: gap-fills on the lesson's phrases,
   multiple choice on register (which one sounds natural) or on facts, order and match
   for anything with a sequence or a cast of characters, polls for opinions. Four to
   eight items each, with a `|| note` on the fact questions. Every answer must appear
   somewhere on a slide.
5. **Write the teacher notes.** Lesson level (`## Teacher notes`): the aim in one line
   and the French-shaped errors this theme invites. Per slide and exercise
   (`### Teacher`): the time, what Jamie says to open it, one or two questions to get
   her talking, and anything to listen for or bring in. Jamie reads these live, so keep
   each to a few bullets.
6. **Save** as `content/lessons/<date>-<slug>.md` with `status: draft`, then read it
   back once against `formats.md`: frontmatter complete, every `## ` heading one of the
   three kinds, every `@layout` and `@art` from the lists, every item line parses.

## Output

One file, `content/lessons/<date>-<slug>.md`. Revising an existing lesson edits that
file in place; it never creates a sibling.

## Gate (Jamie's, never the agent's)

- [ ] Jamie reads the draft in the app (teacher view, Lessons) and either edits the file
      or asks for changes.
- [ ] Jamie sets `status: scheduled`. The student can now see it.
- [ ] After teaching, Jamie sets `status: done`.

## Done when

The file is saved, parses, and the session has reported the slug, the date, the theme
and the exercise count in one line. Homework is a separate studio; if Jamie wants it
in the same session, go to [`../homework/CONTEXT.md`](../homework/CONTEXT.md) next.
