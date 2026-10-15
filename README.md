# english-with-jamie

A shared classroom for one-to-one English lessons. The teacher drives; the student's
screen follows. Everything the app shows is markdown in [`content/`](content/), written in
session through the ICM studios in [`studios/`](studios/CONTEXT.md).

Start at [`AGENTS.md`](AGENTS.md) (Layer 0) → [`CONTEXT.md`](CONTEXT.md) (Layer 1).

## How content gets made

1. Jamie opens a Claude session in the repo and asks for a thing ("plan next Tuesday's
   lesson on school admin").
2. `AGENTS.md` routes to the studio; the session reads that studio's `CONTEXT.md`, its
   inputs in `studios/_shared/` and `studios/<studio>/intake/`, and writes markdown into
   `content/<type>/`, behind a gate (`status: draft` or `draft: true`).
3. Jamie reviews in the app (teacher view shows drafts with a badge), edits the file or
   asks for changes, and flips the gate by editing the frontmatter.
4. Push on a `claude/*` branch; the PR's Vercel preview is where it is read; merge to
   `main` publishes.

Formats the app parses: [`studios/_shared/formats.md`](studios/_shared/formats.md).

## The app

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4 (compiled by the
  `@tailwindcss/turbopack` loader in `next.config.ts`), Drizzle + Neon Postgres, Vercel.
- **Auth:** Neon Auth (Managed Better Auth): email + password accounts in the `neon_auth`
  schema. Neon `admin` role = teacher, `user` = student. Public sign-up is off; the teacher
  creates accounts at `/teach/accounts`. No email verification yet.
- **Realtime:** the teacher writes a single `live_state` row; the student's page polls
  `/api/live` every 1.5 s.
- **Database holds only state, never content:** the student's answers (`item_answers`),
  homework ticked off (`homework_done`), and what is live (`live_state`). The tables from
  the first cut's in-app editor (`lessons`, `blocks`, `answers`, `homework`) are unused
  and documented for removal in `src/lib/db/schema.ts`.

| Route | What |
|---|---|
| `/` | Dashboard: next lesson, open homework, reference links |
| `/lessons`, `/lessons/<slug>` | Lesson files; exercises are interactive for the student, answer tables for the teacher |
| `/live` | Presentation / follow mode |
| `/homework` | Homework files with done state |
| `/teach/results` | Every exercise the student touched |
| `/teach/accounts` | Teacher: list accounts, create a new student or teacher |
| `/reference/*` | Grammar guide, recommendations, things to watch, things to read |

## Running locally

```bash
vercel env pull .env.local   # DATABASE_URL etc. from the linked Vercel project
npm install
npm run db:migrate
npm run dev
```

Secrets live in Vercel env vars and `.env.local` only. See `.env.example` for the keys.

## Database changes

Schema: `src/lib/db/schema.ts`. After changing it, run `npm run db:generate` and commit
the new file in `drizzle/`. Migrations run automatically on every Vercel build.
