import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Block } from "@/lib/db/schema";

export type LiveSnapshot = {
  version: number;
  mode: "follow" | "free";
  lesson: { id: number; title: string } | null;
  blockIndex: number;
  total: number;
  block: Block | null;
  blocks: Block[];
};

export async function ensureLiveRow() {
  await db.insert(schema.liveState).values({ id: 1 }).onConflictDoNothing();
}

export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  await ensureLiveRow();
  const [state] = await db.select().from(schema.liveState).where(eq(schema.liveState.id, 1));
  if (!state?.lessonId) {
    return { version: state?.version ?? 0, mode: state?.mode ?? "follow", lesson: null, blockIndex: 0, total: 0, block: null, blocks: [] };
  }
  const [lesson] = await db.select().from(schema.lessons).where(eq(schema.lessons.id, state.lessonId));
  const list = await db
    .select()
    .from(schema.blocks)
    .where(eq(schema.blocks.lessonId, state.lessonId))
    .orderBy(asc(schema.blocks.position));
  const idx = Math.min(Math.max(state.blockIndex, 0), Math.max(list.length - 1, 0));
  return {
    version: state.version,
    mode: state.mode,
    lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
    blockIndex: idx,
    total: list.length,
    block: list[idx] ?? null,
    blocks: list,
  };
}

/** Direct state write without revalidation: used when a page render needs to start a lesson. */
export async function setLiveLesson(lessonId: number) {
  await ensureLiveRow();
  await db
    .update(schema.liveState)
    .set({ lessonId, blockIndex: 0, mode: "follow", version: sql`${schema.liveState.version} + 1`, updatedAt: new Date() })
    .where(eq(schema.liveState.id, 1));
}
