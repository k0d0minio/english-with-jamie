import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { listLessons } from "@/lib/content";
import { roleOf } from "@/lib/auth";
import { neonAuth } from "@/lib/neon-auth";

export async function getAnswersForLesson(lessonSlug: string) {
  return db.select().from(schema.itemAnswers).where(eq(schema.itemAnswers.lessonSlug, lessonSlug));
}

export async function getAnswersForBlock(lessonSlug: string, blockKey: string) {
  return db
    .select()
    .from(schema.itemAnswers)
    .where(and(eq(schema.itemAnswers.lessonSlug, lessonSlug), eq(schema.itemAnswers.blockKey, blockKey)))
    .orderBy(asc(schema.itemAnswers.itemIndex));
}

export async function homeworkDoneSet(): Promise<Set<string>> {
  const rows = await db.select({ slug: schema.homeworkDone.slug }).from(schema.homeworkDone);
  return new Set(rows.map((r) => r.slug));
}

export async function resultsOverview() {
  const rows = await db
    .select({
      lessonSlug: schema.itemAnswers.lessonSlug,
      blockKey: schema.itemAnswers.blockKey,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${schema.itemAnswers.correct} then 1 else 0 end)::int`,
      attempts: sql<number>`sum(${schema.itemAnswers.attempts})::int`,
      last: sql<string>`max(${schema.itemAnswers.updatedAt})`,
    })
    .from(schema.itemAnswers)
    .groupBy(schema.itemAnswers.lessonSlug, schema.itemAnswers.blockKey)
    .orderBy(desc(sql`max(${schema.itemAnswers.updatedAt})`));
  const lessons = new Map((await listLessons()).map((l) => [l.slug, l]));
  return rows.map((r) => {
    const lesson = lessons.get(r.lessonSlug) ?? null;
    const block = lesson?.blocks.find((b) => b.key === r.blockKey) ?? null;
    return { ...r, lesson, block };
  });
}

// ---- forms ------------------------------------------------------------------

export async function formResponsesForUser(userId: string) {
  return db.select().from(schema.formResponses).where(eq(schema.formResponses.userId, userId)).orderBy(desc(schema.formResponses.sentAt));
}

export async function getFormResponse(formSlug: string, userId: string) {
  const [row] = await db
    .select()
    .from(schema.formResponses)
    .where(and(eq(schema.formResponses.formSlug, formSlug), eq(schema.formResponses.userId, userId)));
  return row ?? null;
}

export async function allFormResponses() {
  return db.select().from(schema.formResponses).orderBy(desc(schema.formResponses.sentAt));
}

/** Teacher only (Neon Auth admin API): every account with the student role. */
export async function listStudents(): Promise<{ id: string; name: string; email: string }[]> {
  const { data } = await neonAuth().admin.listUsers({ query: { limit: 100, sortBy: "createdAt", sortDirection: "asc" } });
  return (data?.users ?? []).filter((u) => roleOf(u) === "student").map((u) => ({ id: u.id, name: u.name, email: u.email }));
}
