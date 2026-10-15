// Read-only export: students' form answers → studios/_private/forms/<form>/<student>.md
// (gitignored), so a studio session can read them. Needs DATABASE_URL in .env.local
// (`vercel env pull .env.local`). Usage: npm run forms:pull
import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { parseFrontmatter, slugify } from "../src/lib/frontmatter";
import { parseForm, responseMarkdown, type Form, type FormAnswers } from "../src/lib/form-dsl";

config({ path: [".env.local", ".env"], quiet: true });

const OUT = path.join("studios", "_private", "forms");

async function readForm(slug: string): Promise<Form | null> {
  try {
    const { data, body } = parseFrontmatter(await fs.readFile(path.join("content", "forms", `${slug}.md`), "utf8"));
    return parseForm(slug, data, body);
  } catch {
    return null;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  const sql = neon(url);

  const rows = await sql`
    select form_slug, user_id, answers, sent_at, saved_at, submitted_at
    from form_responses where saved_at is not null order by form_slug, user_id`;

  const names = new Map<string, string>();
  try {
    for (const u of await sql`select id::text as id, name from neon_auth."user"`) names.set(String(u.id), String(u.name));
  } catch {
    // Names are a convenience; fall back to the user id.
  }

  if (!rows.length) return console.log("No answers saved yet.");
  for (const r of rows) {
    const slug = String(r.form_slug);
    const student = names.get(String(r.user_id)) ?? String(r.user_id);
    const md = responseMarkdown(await readForm(slug), slug, {
      student,
      answers: r.answers as FormAnswers,
      sentAt: r.sent_at,
      savedAt: r.saved_at,
      submittedAt: r.submitted_at,
    });
    const file = path.join(OUT, slug, `${slugify(student) || "student"}.md`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, md + "\n");
    console.log(`${file}${r.submitted_at ? "" : "  (not sent back yet)"}`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
