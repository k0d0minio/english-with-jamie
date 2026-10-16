# AGENTS.md — Layer 0: identity & routing

> First file any session reads. Says what this repo is and where to go. Layer 1 is
> [`CONTEXT.md`](CONTEXT.md); the contracts live in [`studios/`](studios/CONTEXT.md).
> `CLAUDE.md` is a one-line `@AGENTS.md` import.

## What this repo is

**`english-with-jamie`** — a shared classroom for one-to-one English lessons, and the
content that fills it. Two halves:

- **`studios/`** — ICM studios. Each one is a folder with a `CONTEXT.md` contract that
  turns Jamie's brief into markdown: lesson plans, homework, recommendations, things to
  watch, things to read, reference pages. The agent writes the markdown in session; Jamie
  reviews and flips the gate. Nothing runs itself.
- **`src/`** — the Next.js app that renders [`content/`](content/) for teacher and student,
  keeps the student's answers, and lets the teacher drive the student's screen live.

The folders are the orchestration. There is no script that "runs a studio"; a studio run
is one session that reads the contract and writes the files it names.

## Routing

| The task | Go to |
|---|---|
| Plan a lesson (new or revised) | [`studios/lesson-plan/CONTEXT.md`](studios/lesson-plan/CONTEXT.md) |
| Set homework after a lesson | [`studios/homework/CONTEXT.md`](studios/homework/CONTEXT.md) |
| Turn Jamie's advice into "How to improve" entries | [`studios/recommendations/CONTEXT.md`](studios/recommendations/CONTEXT.md) |
| Suggest series or films | [`studios/watch/CONTEXT.md`](studios/watch/CONTEXT.md) |
| Suggest articles or books | [`studios/read/CONTEXT.md`](studios/read/CONTEXT.md) |
| Write or fix a grammar / syntax reference page | [`studios/reference/CONTEXT.md`](studios/reference/CONTEXT.md) |
| Ask a student questions (a form on her profile) to plan from | [`studios/forms/CONTEXT.md`](studios/forms/CONTEXT.md) |
| Change how the app looks or behaves | `src/` — stack notes in [`README.md`](README.md) |
| Who the learner is, how we talk to her, what the course covers | [`studios/_shared/`](studios/_shared/) |

## Standing rules

- **No personal data in git.** The repo is public. The learner profile in
  [`studios/_shared/learner.md`](studios/_shared/learner.md) is deliberately non-identifying;
  keep names, family messages and assessments out of every file.
- **Recommendations are Jamie's words.** The recommendations studio structures what Jamie
  wrote in its `intake/`; it never invents advice ([`OBJECTIVES.md`](OBJECTIVES.md)).
- **Her answers stay out of git.** Form answers live in the database; `npm run forms:pull`
  copies them to `studios/_private/` (gitignored) for a session to read. Never commit
  them or quote them in `content/`.
- **Gates are Jamie's.** A studio writes `status: draft` (lessons) or `draft: true` (lists).
  Only Jamie changes that; the agent never flips a gate. Forms have no draft flag: Jamie
  sending one from the app is their gate, and the agent never sends one.
- **CI is the verdict.** No local build, lint, typecheck or dev server; push and read the
  PR checks and the Vercel preview.
- **Secrets stay in Vercel and `.env.local`.** Never in a committed file.
