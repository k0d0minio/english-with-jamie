# studios/forms — ask the student, to plan better lessons

Entered when Jamie wants to find something out from a student before planning: what she
likes, what worries her about Ottawa, how she wants to be taught, what she wants next.
One run writes one form. The student fills it in on her profile in the app; her answers
are saved in the database and read back by the lesson-plan studio. Work from the repo root.

## Inputs

| Layer | File | Why |
|---|---|---|
| 3 | [`../_shared/learner.md`](../_shared/learner.md) | What we already know, so the form asks only what we don't |
| 3 | [`../_shared/voice.md`](../_shared/voice.md) | How it sounds (the form is student-facing) |
| 3 | [`../_shared/syllabus.md`](../_shared/syllabus.md) | The themes the answers will feed |
| 3 | [`../_shared/formats.md`](../_shared/formats.md) § Form | The exact file shape the app parses |
| 4 | `intake/<slug>.md` (if present) | Jamie's brief: what he wants to find out, and why now |
| 4 | `content/forms/` — filenames and frontmatter only | What has been asked already; don't ask twice |

Don't read the app source, other studios, or the answers to earlier forms.

## Process

1. **Fix the purpose.** One sentence: what lessons will these answers change? Every
   question has to earn its place against it. If the brief doesn't say, ask once.
2. **Shape it.** Ten to twenty minutes to fill in: three to five sections (`## `), twelve
   to twenty questions, the easy, enjoyable ones first. Open with something she will
   like answering, not admin.
3. **Mix the kinds.** Choices (`one`, `many`) get her started and are quick; `scale`
   gives a number to come back to in a month; every section ends with at least one open
   question (`text` or `long`), because the open answers are what lessons are built
   from. Give `many` lists a "Something else…" option.
4. **Ask for material, not ratings.** "Tell me about a moment you got stuck speaking
   English" beats "Rate your speaking". Ask for examples, stories, names of shows and
   songs: things a lesson can use.
5. **Keep it safe and private.** She is a minor. No questions about health, family
   relationships, money, appearance, or anything she'd only tell a friend. Nothing
   that asks for identifying details (address, school name, social handles). The file
   itself is public: no names in it.
6. **Write the teacher notes** (`## Teacher notes`): the purpose in one line, and for
   each section which lessons or syllabus rows its answers feed.
7. **Save** as `content/forms/<slug>.md` with `draft: true`, then read it back once
   against `formats.md`: frontmatter complete, every question line starts with a kind,
   every `one`/`many` has two or more options, every `scale` has exactly two labels.

## Output

One file, `content/forms/<slug>.md`. Revising a form edits that file in place. Answers
are keyed by section and question wording: reword before the form is sent, not after.

## Gate (Jamie's, never the agent's)

- [ ] Jamie previews the draft in the app (Forms → the form) and edits or asks for changes.
- [ ] Jamie removes `draft: true`.
- [ ] Jamie sends it to a student from the form's page. It appears on her profile.

## Afterwards: where the answers go

Answers live in the `form_responses` table, never in git. Jamie reads them on the form's
page in the app. A studio session reads them by running `npm run forms:pull`, which
writes one markdown file per student to `studios/_private/forms/<form>/` (gitignored).
The lesson-plan studio lists that folder as an input.

## Done when

The file is saved, parses, and the session has reported the slug, the purpose, and the
section and question counts in one line.
