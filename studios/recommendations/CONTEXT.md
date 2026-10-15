# studios/recommendations — "How to improve", in Jamie's words

Entered when Jamie has written advice he wants in the app. This studio **structures**;
it does not invent. Per [`../../OBJECTIVES.md`](../../OBJECTIVES.md) every
recommendation is sourced from Jamie. Work from the repo root.

## Inputs

| Layer | File | Why |
|---|---|---|
| 3 | [`../_shared/voice.md`](../_shared/voice.md) | Light edit toward the house voice, nothing more |
| 3 | [`../_shared/formats.md`](../_shared/formats.md) § Recommendation | File shape |
| 4 | `intake/*.md` | Jamie's raw notes: voice-memo transcripts, bullet lists, half sentences |
| 4 | `content/recommendations/` — frontmatter only | What already exists; merge, don't duplicate |

## Process

1. **Read every intake note.** Group lines that make the same point.
2. **One entry per point.** Title in six words or fewer; body in Jamie's sentences,
   tidied for punctuation and length only. If a note is ambiguous, keep the ambiguity
   and flag it in the session, don't resolve it by guessing.
3. **Tag** with two or three of: `speaking`, `listening`, `vocabulary`, `confidence`,
   `habit`, `pronunciation`, `writing`.
4. **Save** as `content/recommendations/<slug>.md` with `draft: true`. Move the used
   intake note into `intake/_done/` and say so.

## Output

`content/recommendations/<slug>.md`, one per point.

## Gate (Jamie's)

- [ ] Jamie reads each entry, checks it still sounds like him, removes `draft: true`.

## Done when

Every intake note is either turned into entries or flagged as unclear.
