// Info-gathering forms: content/forms/<slug>.md. Pure (no server-only), so scripts/ can use it too.
import { slugify, type Frontmatter } from "@/lib/frontmatter";

/**
 * One question per line, inside a ```questions block (or bare lines in the section).
 *
 *   Short answer:   text: Your favourite band right now
 *   Long answer:    long: What do you do on a free Saturday? || As much or as little as you like.
 *   Pick one:       one: How do you like being corrected? | Straight away | At the end
 *   Pick any:       many: What would you like a lesson on? | Music | Animals | Something else…
 *   Scale 1–5:      scale: Speaking English out loud | I freeze | I'm at ease
 *
 * `|| help` at the end of any line is shown under the question. An option ending in "…"
 * opens a small text box when it is picked. Blank lines and # lines are ignored.
 */
export const QUESTION_KINDS = ["text", "long", "one", "many", "scale"] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

export type FormQuestion = {
  /** Stable id for the stored answer: section slug + prompt slug. Rewording a question after it is answered orphans that answer. */
  key: string;
  kind: QuestionKind;
  prompt: string;
  /** one / many: the choices. scale: [low label, high label]. */
  options: string[];
  help?: string;
};
export type FormSection = { title: string; intro: string; questions: FormQuestion[] };
export type Form = {
  slug: string;
  title: string;
  summary: string;
  /** Markdown before the first `## `, shown at the top. */
  intro: string;
  /** `## Teacher notes`: never sent to the student. */
  teacherNotes: string;
  sections: FormSection[];
  problems: string[];
};

/** What the database keeps per question. The prompt is stored with it so answers still read right if the form changes. */
export type FormAnswer = { prompt: string; answer: string | string[] };
export type FormAnswers = Record<string, FormAnswer>;

export const SCALE = ["1", "2", "3", "4", "5"] as const;
export const isOther = (option: string) => /(…|\.\.\.)$/.test(option);
export const otherLabel = (option: string) => option.replace(/\s*(…|\.\.\.)$/, "");

export function parseForm(slug: string, data: Frontmatter, body: string): Form {
  const problems: string[] = [];
  const first = body.search(/^## +/m);
  const intro = (first === -1 ? body : body.slice(0, first)).trim();
  const sections: FormSection[] = [];
  const keys = new Set<string>();
  let teacherNotes = "";

  for (const part of first === -1 ? [] : body.slice(first).split(/^## +/m).slice(1)) {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const content = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    if (/^teacher notes?$/i.test(title)) {
      teacherNotes = content;
      continue;
    }
    const fence = /```questions[^\n]*\n([\s\S]*?)```/.exec(content);
    const isLine = (l: string) => new RegExp(`^(${QUESTION_KINDS.join("|")})\\s*:`, "i").test(l.trim());
    const src = fence ? fence[1] : content.split("\n").filter(isLine).join("\n");
    const sectionIntro = (fence ? content.slice(0, fence.index) + content.slice(fence.index + fence[0].length) : content.split("\n").filter((l) => !isLine(l)).join("\n")).trim();

    const questions: FormQuestion[] = [];
    src.split(/\r?\n/).forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const m = /^([a-z]+)\s*:\s*(.*)$/i.exec(line);
      const kind = m?.[1].toLowerCase() as QuestionKind | undefined;
      if (!m || !kind || !(QUESTION_KINDS as readonly string[]).includes(kind)) {
        problems.push(`${title}, line ${i + 1}: start with ${QUESTION_KINDS.map((k) => `"${k}:"`).join(", ")}.`);
        return;
      }
      const [main, helpRaw] = splitOnce(m[2], "||");
      const [prompt, ...options] = main.split("|").map((c) => c.trim()).filter(Boolean);
      if (!prompt) return problems.push(`${title}, line ${i + 1}: empty question.`);
      if ((kind === "one" || kind === "many") && options.length < 2) return problems.push(`${title}: "${prompt}" needs at least two options.`);
      if (kind === "scale" && options.length !== 2) return problems.push(`${title}: "${prompt}" needs a low and a high label: scale: prompt | low | high.`);
      if ((kind === "text" || kind === "long") && options.length) problems.push(`${title}: "${prompt}" is a ${kind} question; its | options are ignored.`);

      const base = `${slugify(title)}/${slugify(prompt).slice(0, 60)}`;
      let key = base;
      for (let n = 2; keys.has(key); n++) key = `${base}-${n}`;
      keys.add(key);
      questions.push({ key, kind, prompt, options: kind === "text" || kind === "long" ? [] : options, help: helpRaw?.trim() || undefined });
    });
    if (!questions.length) problems.push(`${title}: no questions parsed.`);
    sections.push({ title, intro: sectionIntro, questions });
  }

  if (!sections.length) problems.push("No sections. Start each one with a `## ` heading.");
  return {
    slug,
    title: data.title || slug,
    summary: data.summary ?? "",
    intro,
    teacherNotes,
    sections,
    problems,
  };
}

function splitOnce(s: string, sep: string): [string, string | undefined] {
  const i = s.indexOf(sep);
  return i === -1 ? [s, undefined] : [s.slice(0, i), s.slice(i + sep.length)];
}

export const questionCount = (form: Form) => form.sections.reduce((n, s) => n + s.questions.length, 0);

export const isAnswered = (a: FormAnswer | undefined) => !!a && (Array.isArray(a.answer) ? a.answer.length > 0 : a.answer.trim() !== "");

/** An answer in words, for the teacher's view and the studio export. */
export function answerWords(q: Pick<FormQuestion, "kind" | "options">, a: FormAnswer["answer"]): string {
  if (Array.isArray(a)) return a.join("; ");
  if (q.kind === "scale") return `${a}/5 (1 = ${q.options[0] ?? "low"}, 5 = ${q.options[1] ?? "high"})`;
  return a;
}

export type ResponseRecord = { student: string; answers: FormAnswers; sentAt: Date | string; savedAt: Date | string | null; submittedAt: Date | string | null };

const day = (d: Date | string | null) => (d ? new Date(d).toISOString().slice(0, 10) : null);

/**
 * One student's answers as markdown, for a studio session to read. Questions in form
 * order first, then anything she answered that the form no longer asks.
 */
export function responseMarkdown(form: Form | null, slug: string, r: ResponseRecord): string {
  const out: string[] = [
    "---",
    `form: ${slug}`,
    `title: ${form?.title ?? slug}`,
    `student: ${r.student}`,
    `sent: ${day(r.sentAt)}`,
    `saved: ${day(r.savedAt) ?? "never"}`,
    `submitted: ${day(r.submittedAt) ?? "not yet"}`,
    "---",
    "",
    "Private: the student's own words. Never commit this file or quote it in content/.",
    "",
  ];
  const seen = new Set<string>();
  for (const section of form?.sections ?? []) {
    out.push(`## ${section.title}`, "");
    for (const q of section.questions) {
      seen.add(q.key);
      const a = r.answers[q.key];
      out.push(`**${q.prompt}**`, "", isAnswered(a) ? quote(answerWords(q, a!.answer)) : "_(no answer)_", "");
    }
  }
  const orphans = Object.entries(r.answers).filter(([k, a]) => !seen.has(k) && isAnswered(a));
  if (orphans.length) {
    out.push("## Answers to questions the form no longer asks", "");
    for (const [, a] of orphans) out.push(`**${a.prompt}**`, "", quote(answerWords({ kind: "long", options: [] }, a.answer)), "");
  }
  return out.join("\n");
}

const quote = (s: string) =>
  s
    .split(/\r?\n/)
    .map((l) => `> ${l}`)
    .join("\n");

export type FormStatus = "new" | "started" | "sent back";
export const formStatus = (r: { savedAt: Date | string | null; submittedAt: Date | string | null }): FormStatus =>
  r.submittedAt ? "sent back" : r.savedAt ? "started" : "new";
export const STATUS_TONE = { new: "warm", started: "accent", "sent back": "ok" } as const;
