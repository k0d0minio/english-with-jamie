import "server-only";
import { and, asc, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function listLessons() {
  return db.select().from(schema.lessons).orderBy(desc(schema.lessons.scheduledFor), desc(schema.lessons.id));
}

export async function getLesson(id: number) {
  const [lesson] = await db.select().from(schema.lessons).where(eq(schema.lessons.id, id));
  if (!lesson) return null;
  const list = await db.select().from(schema.blocks).where(eq(schema.blocks.lessonId, id)).orderBy(asc(schema.blocks.position));
  return { ...lesson, blocks: list };
}

export async function getAnswersForLesson(lessonId: number) {
  return db.select().from(schema.answers).where(eq(schema.answers.lessonId, lessonId));
}

export async function getAnswersForBlock(blockId: number) {
  return db.select().from(schema.answers).where(eq(schema.answers.blockId, blockId)).orderBy(asc(schema.answers.itemIndex));
}

export async function listHomework() {
  return db.select().from(schema.homework).orderBy(asc(schema.homework.done), asc(schema.homework.dueDate), desc(schema.homework.id));
}

/** The lesson to surface on the dashboard: today's, else the next scheduled, else the latest. */
export async function getCurrentLesson() {
  const today = new Date().toISOString().slice(0, 10);
  const [todays] = await db.select().from(schema.lessons).where(eq(schema.lessons.scheduledFor, today)).limit(1);
  if (todays) return todays;
  const [next] = await db
    .select()
    .from(schema.lessons)
    .where(and(gt(schema.lessons.scheduledFor, today), ne(schema.lessons.status, "draft")))
    .orderBy(asc(schema.lessons.scheduledFor))
    .limit(1);
  if (next) return next;
  const [latest] = await db.select().from(schema.lessons).orderBy(desc(schema.lessons.id)).limit(1);
  return latest ?? null;
}

export async function resultsOverview() {
  const rows = await db
    .select({
      lessonId: schema.answers.lessonId,
      blockId: schema.answers.blockId,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${schema.answers.correct} then 1 else 0 end)::int`,
      attempts: sql<number>`sum(${schema.answers.attempts})::int`,
      last: sql<string>`max(${schema.answers.updatedAt})`,
    })
    .from(schema.answers)
    .groupBy(schema.answers.lessonId, schema.answers.blockId)
    .orderBy(desc(sql`max(${schema.answers.updatedAt})`));
  const lessonsById = new Map((await listLessons()).map((l) => [l.id, l]));
  const blockIds = rows.map((r) => r.blockId);
  const blockRows = blockIds.length
    ? await db.select().from(schema.blocks).where(inArray(schema.blocks.id, blockIds))
    : [];
  const blocksById = new Map(blockRows.map((b) => [b.id, b]));
  return rows.map((r) => ({ ...r, lesson: lessonsById.get(r.lessonId) ?? null, block: blocksById.get(r.blockId) ?? null }));
}
