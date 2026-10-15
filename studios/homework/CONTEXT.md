# studios/homework — set homework after a lesson

Entered when Jamie asks for homework, usually right after a lesson is planned or
taught. One run writes one to three homework files. Work from the repo root.

## Inputs

| Layer | File | Why |
|---|---|---|
| 3 | [`../_shared/learner.md`](../_shared/learner.md) · [`../_shared/voice.md`](../_shared/voice.md) | Who and how |
| 3 | [`../_shared/formats.md`](../_shared/formats.md) § Homework | File shape |
| 4 | The lesson it follows: `content/lessons/<date>-<slug>.md` | Homework reuses the lesson's phrases and grammar, never new material |
| 4 | `intake/<date>.md` (if present) | Jamie's steer: what to practise, how much time, due date |
| 4 | `content/homework/` — frontmatter only | What is already open; don't pile on |

## Process

1. **One task, one skill.** Speaking tasks first (record a voice note, say three lines
   at dinner), then listening, then writing. No worksheets.
2. **Make it doable in twenty minutes** and say what to bring to the next lesson.
3. **Say why** in one clause, in the voice.
4. **Save** as `content/homework/<date>-<slug>.md` with `lesson:` pointing at the lesson
   filename, `due:` set, and `draft: true`.

## Output

`content/homework/<date>-<slug>.md`, one per task. The student ticks it off in the app;
that state lives in the database, not in the file.

## Gate (Jamie's)

- [ ] Jamie reads it in the app (teacher view, Homework) and removes `draft: true`.

## Done when

Files saved and listed back with their due dates.
