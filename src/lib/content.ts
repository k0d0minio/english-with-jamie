import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { parseExerciseItems } from "@/lib/exercise-dsl";
import { ART_NAMES, SLIDE_LAYOUTS, type ArtName, type BlockData, type SlideLayout } from "@/lib/lesson-types";

const ROOT = path.join(process.cwd(), "content");

// ---- frontmatter ------------------------------------------------------------

export type Frontmatter = Record<string, string>;

export function parseFrontmatter(src: string): { data: Frontmatter; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { data: {}, body: src };
  const data: Frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i <= 0 || line.trimStart().startsWith("#")) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    value = value.replace(/\s+#.*$/, "").replace(/^["'](.*)["']$/, "$1");
    data[key] = value;
  }
  return { data, body: m[2].trim() };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const isDraft = (d: Frontmatter) => d.draft === "true";

type RawFile = { slug: string; data: Frontmatter; body: string };

async function readFolder(sub: string): Promise<RawFile[]> {
  const dir = path.join(ROOT, sub);
  let names: string[] = [];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }
  const files = names.filter((n) => n.endsWith(".md") && !/^readme\.md$/i.test(n)).sort();
  return Promise.all(
    files.map(async (name) => {
      const { data, body } = parseFrontmatter(await fs.readFile(path.join(dir, name), "utf8"));
      return { slug: name.replace(/\.md$/, ""), data, body };
    }),
  );
}

async function readOne(sub: string, slug: string): Promise<RawFile | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const { data, body } = parseFrontmatter(await fs.readFile(path.join(ROOT, sub, `${slug}.md`), "utf8"));
    return { slug, data, body };
  } catch {
    return null;
  }
}

// ---- lessons ----------------------------------------------------------------

export type LessonStatus = "draft" | "scheduled" | "done";
/** `notes` is teacher-only markdown from the section's `### Teacher` part. Strip it before a block reaches the student. */
export type ContentBlock = { key: string; kind: "slide" | "exercise"; data: BlockData; notes?: string };
export type Lesson = {
  slug: string;
  title: string;
  date: string | null;
  status: LessonStatus;
  summary: string;
  teacherNotes: string;
  blocks: ContentBlock[];
  problems: string[];
};

/**
 * A section is: optional `@key: value` lines, the body, then an optional `### Teacher`
 * heading whose text is private to the teacher.
 */
function splitSection(content: string) {
  const nm = /^###\s+teacher(?:\s+notes?)?\s*$/im.exec(content);
  const notes = nm ? content.slice(nm.index + nm[0].length).trim() : "";
  const lines = (nm ? content.slice(0, nm.index) : content).split("\n");
  const meta: Record<string, string> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = /^@([a-z]+)\s*:\s*(.*)$/i.exec(line);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
    else if (line) break;
  }
  return { meta, body: lines.slice(i).join("\n").trim(), notes };
}

function pickArt(value: string | undefined, where: string, problems: string[]): ArtName | undefined {
  if (!value) return undefined;
  if ((ART_NAMES as readonly string[]).includes(value)) return value as ArtName;
  problems.push(`${where}: unknown @art "${value}". Use one of: ${ART_NAMES.join(", ")}.`);
  return undefined;
}

function parseLesson({ slug, data, body }: RawFile): Lesson {
  const problems: string[] = [];
  const status: LessonStatus = data.status === "scheduled" || data.status === "done" ? data.status : "draft";
  if (data.status && status !== data.status) problems.push(`Unknown status "${data.status}", treated as draft.`);
  const blocks: ContentBlock[] = [];
  const used = new Map<string, number>();
  let teacherNotes = "";

  const parts = body.split(/^## +/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const content = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    if (/^teacher notes?$/i.test(heading)) {
      teacherNotes = content;
      continue;
    }
    const m = /^(slide|exercise)\s*:\s*(.+)$/i.exec(heading);
    if (!m) {
      problems.push(`Section "${heading}" is not "Slide: …", "Exercise: …" or "Teacher notes".`);
      continue;
    }
    const kind = m[1].toLowerCase() as "slide" | "exercise";
    const title = m[2].trim();
    let key = `${kind}:${slugify(title) || "untitled"}`;
    const n = (used.get(key) ?? 0) + 1;
    used.set(key, n);
    if (n > 1) key = `${key}-${n}`;

    const { meta, body: main, notes } = splitSection(content);
    const art = pickArt(meta.art, title, problems);
    const extra = notes ? { notes } : {};

    if (kind === "slide") {
      let layout: SlideLayout | undefined;
      if (meta.layout) {
        if ((SLIDE_LAYOUTS as readonly string[]).includes(meta.layout)) layout = meta.layout as SlideLayout;
        else problems.push(`${title}: unknown @layout "${meta.layout}". Use one of: ${SLIDE_LAYOUTS.join(", ")}.`);
      }
      layout ??= blocks.length === 0 ? "cover" : art ? "split" : "plain";
      blocks.push({ key, kind, data: { kind: "slide", title, body: main, layout, art, kicker: meta.kicker || undefined }, ...extra });
      continue;
    }
    const fence = /```items[^\n]*\n([\s\S]*?)```/.exec(main);
    const itemsSrc = fence ? fence[1] : main.split("\n").filter((l) => l.includes("=>")).join("\n");
    const instructions = (fence ? main.slice(0, fence.index) : main.split("\n").filter((l) => !l.includes("=>")).join("\n")).trim();
    const { items, errors } = parseExerciseItems(itemsSrc);
    errors.forEach((e) => problems.push(`${title}: ${e}`));
    if (!items.length) problems.push(`${title}: no items parsed.`);
    blocks.push({ key, kind, data: { kind: "exercise", title, instructions: instructions || undefined, items, art: art ?? "quiz" }, ...extra });
  }

  return {
    slug,
    title: data.title || slug,
    date: /^\d{4}-\d{2}-\d{2}$/.test(data.date ?? "") ? data.date : null,
    status,
    summary: data.summary ?? "",
    teacherNotes,
    blocks,
    problems,
  };
}

export async function listLessons(): Promise<Lesson[]> {
  const all = (await readFolder("lessons")).map(parseLesson);
  return all.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.slug.localeCompare(a.slug));
}

export async function getLesson(slug: string): Promise<Lesson | null> {
  const raw = await readOne("lessons", slug);
  return raw ? parseLesson(raw) : null;
}

/** The lesson to surface on the dashboard: today's, else the next scheduled, else the latest. */
export async function currentLesson(visibleToStudent: boolean): Promise<Lesson | null> {
  const today = new Date().toISOString().slice(0, 10);
  const all = (await listLessons()).filter((l) => !visibleToStudent || l.status !== "draft");
  return (
    all.find((l) => l.date === today) ??
    all
      .filter((l) => l.date && l.date > today && l.status !== "done")
      .sort((a, b) => a.date!.localeCompare(b.date!))[0] ??
    all[0] ??
    null
  );
}

// ---- homework ---------------------------------------------------------------

export type HomeworkItem = { slug: string; title: string; due: string | null; lesson: string | null; draft: boolean; body: string };

export async function listHomework(): Promise<HomeworkItem[]> {
  return (await readFolder("homework")).map(({ slug, data, body }) => ({
    slug,
    title: data.title || slug,
    due: /^\d{4}-\d{2}-\d{2}$/.test(data.due ?? "") ? data.due : null,
    lesson: data.lesson || null,
    draft: isDraft(data),
    body,
  }));
}

// ---- lists ------------------------------------------------------------------

export type Recommendation = { slug: string; title: string; tags: string[]; draft: boolean; body: string };
export async function listRecommendations(): Promise<Recommendation[]> {
  return (await readFolder("recommendations")).map(({ slug, data, body }) => ({
    slug,
    title: data.title || slug,
    tags: (data.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    draft: isDraft(data),
    body,
  }));
}

export type WatchItem = { slug: string; title: string; kind: string; where: string; level: string; draft: boolean; body: string };
export async function listWatch(): Promise<WatchItem[]> {
  return (await readFolder("watch")).map(({ slug, data, body }) => ({
    slug,
    title: data.title || slug,
    kind: data.kind || "series",
    where: data.where ?? "",
    level: data.level ?? "",
    draft: isDraft(data),
    body,
  }));
}

export type ReadItem = { slug: string; title: string; url: string; source: string; length: string; draft: boolean; body: string };
export async function listRead(): Promise<ReadItem[]> {
  return (await readFolder("read")).map(({ slug, data, body }) => ({
    slug,
    title: data.title || slug,
    url: data.url ?? "",
    source: data.source ?? "",
    length: data.length ?? "",
    draft: isDraft(data),
    body,
  }));
}

// ---- reference --------------------------------------------------------------

export const grammarGroups = ["Verbs & time", "Sentence building", "Words & phrases"] as const;

export type GrammarTopic = { slug: string; title: string; group: string; order: number; blurb: string; draft: boolean; body: string };

export async function listGrammar(): Promise<GrammarTopic[]> {
  const topics = (await readFolder("reference/grammar")).map(({ slug, data, body }) => ({
    slug,
    title: data.title || slug,
    group: data.group || grammarGroups[grammarGroups.length - 1],
    order: Number(data.order) || 999,
    blurb: data.blurb ?? "",
    draft: isDraft(data),
    body,
  }));
  const rank = (g: string) => {
    const i = (grammarGroups as readonly string[]).indexOf(g);
    return i === -1 ? 99 : i;
  };
  return topics.sort((a, b) => rank(a.group) - rank(b.group) || a.order - b.order || a.title.localeCompare(b.title));
}

export async function getGrammar(slug: string): Promise<GrammarTopic | null> {
  return (await listGrammar()).find((t) => t.slug === slug) ?? null;
}
