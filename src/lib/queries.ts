import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { listLessons } from "@/lib/content";

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
