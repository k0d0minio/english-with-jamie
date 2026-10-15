# english-with-jamie

A shared classroom for one-to-one English lessons. The teacher drives; the student's screen follows.

- **Stack:** Next.js 16 (App Router), React 19, Tailwind v4, Drizzle + Neon Postgres, Vercel.
- **Auth:** two access codes (`TEACHER_CODE`, `STUDENT_CODE`) → signed cookie. No accounts.
- **Realtime:** the teacher writes a single `live_state` row; the student's page polls `/api/live` every 1.5 s.

## Features (MVP)

| Area | Where |
|---|---|
| Lesson plans (slides + exercises), teacher notes | `/lessons`, `/teach/lessons/*` |
| Presentation / follow mode | `/live` |
| Exercises: gap-fill and multiple choice, results | inside lessons, `/teach/results` |
| Homework | `/homework` |
| Grammar & syntax guide, recommendations, watch/read lists | `/reference/*` (content in `src/content/`) |

## Running locally

```bash
vercel env pull .env.local   # DATABASE_URL etc. from the linked Vercel project
npm install
npm run db:migrate
npm run dev
```

Secrets live in Vercel env vars and `.env.local` only. See `.env.example` for the keys.

## Database

Schema: `src/lib/db/schema.ts`. After changing it, run `npm run db:generate` and commit the new file in `drizzle/`.
Migrations run automatically on every Vercel build (`vercel-build`).

## Content

- `src/content/grammar/*.md` — one topic per file, indexed in `src/content/grammar.ts`.
- `src/content/recommendations.ts`, `watch.ts`, `read.ts` — curated lists, written by the teacher.
