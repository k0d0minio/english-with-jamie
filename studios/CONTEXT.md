# studios/ — how a studio works

A studio is a folder with a contract. Jamie opens a session in this repo, says what he
wants ("plan Tuesday's lesson on asking for help at school"), Layer 0 routes here, the
session reads the studio's `CONTEXT.md`, reads only the inputs it names, and writes the
markdown files it names. That is the whole machine. No script drives it, no studio calls
another, nothing acts outward.

## The shape of every studio

```
studios/<studio>/
  CONTEXT.md     the contract: purpose, inputs, process, output, gate, done-when
  intake/        Jamie's briefs and raw notes for this studio (Layer 4 input)
```

Outputs do not stay in the studio. They land in [`content/`](../content/), one folder
per type, because the app reads from there. `content/` is this repo's `output/` under
the name the app uses.

| Studio | Writes to | Gate field |
|---|---|---|
| [`lesson-plan/`](lesson-plan/CONTEXT.md) | `content/lessons/<date>-<slug>.md` | `status: draft → scheduled → done` |
| [`homework/`](homework/CONTEXT.md) | `content/homework/<date>-<slug>.md` | `draft: true` → removed |
| [`recommendations/`](recommendations/CONTEXT.md) | `content/recommendations/<slug>.md` | `draft: true` → removed |
| [`watch/`](watch/CONTEXT.md) | `content/watch/<slug>.md` | `draft: true` → removed |
| [`read/`](read/CONTEXT.md) | `content/read/<slug>.md` | `draft: true` → removed |
| [`reference/`](reference/CONTEXT.md) | `content/reference/grammar/<slug>.md` | `draft: true` → removed |
| [`forms/`](forms/CONTEXT.md) | `content/forms/<slug>.md` | none: Jamie sending it to a student in the app is the gate |

The student's answers to forms are the one input that is not in git: they live in the
database and are pulled to `_private/forms/` (gitignored) with `npm run forms:pull`.
Studios that use them read them there and never copy her words into `content/`.

## Shared references (Layer 3)

Every studio reads these first; they are stable across runs.

| File | What it fixes |
|---|---|
| [`_shared/learner.md`](_shared/learner.md) | Who the student is, without identifying her |
| [`_shared/voice.md`](_shared/voice.md) | How student-facing text sounds, and markdown conventions |
| [`_shared/syllabus.md`](_shared/syllabus.md) | The arc of themes between now and departure |
| [`_shared/formats.md`](_shared/formats.md) | The exact frontmatter and section grammar the app parses |

## Rules that apply to every studio

1. **Read the contract, then only its Inputs.** Don't pull in the app source, other
   studios, or the whole `content/` tree unless the contract lists it.
2. **Write only the files the contract names.** One studio, one content folder.
3. **Drafts first.** Every new file is written behind its gate field. Jamie reviews in
   the app (the teacher view shows drafts with a badge) and flips the gate by editing the
   frontmatter. The agent never flips it. Forms are the exception: no flag, because a
   form reaches a student only when Jamie sends it from the app.
4. **Idempotent by name.** A file is identified by its name. Re-running a studio for the
   same lesson or entry edits that file; it does not create a sibling.
5. **No personal data.** The repo is public. Nothing identifying goes into content,
   intake or contracts.
6. **Commit on Jamie's word, on a `claude/*` branch.** The PR's Vercel preview is where
   he reads the result; CI is the verdict.
