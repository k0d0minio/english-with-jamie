import "server-only";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getLesson, type ContentBlock } from "@/lib/content";

export type LiveSnapshot = {
  version: number;
  mode: "follow" | "free";
  lesson: { slug: string; title: string; teacherNotes?: string } | null;
  blockIndex: number;
  total: number;
  block: ContentBlock | null;
  blocks: ContentBlock[];
};

export async function ensureLiveRow() {
  await db.insert(schema.liveState).values({ id: 1 }).onConflictDoNothing();
}

/**
 * `teacher: false` strips everything private (lesson and per-slide teacher notes); the
 * student's poll and page get that version.
 */
export async function getLiveSnapshot({ teacher }: { teacher: boolean }): Promise<LiveSnapshot> {
  await ensureLiveRow();
  const [state] = await db.select().from(schema.liveState).where(eq(schema.liveState.id, 1));
  const empty: LiveSnapshot = { version: state?.version ?? 0, mode: state?.mode ?? "follow", lesson: null, blockIndex: 0, total: 0, block: null, blocks: [] };
  if (!state?.lessonSlug) return empty;
  const lesson = await getLesson(state.lessonSlug);
  if (!lesson) return empty;
  const blocks: ContentBlock[] = teacher ? lesson.blocks : lesson.blocks.map((b) => ({ key: b.key, kind: b.kind, data: b.data }));
  const idx = Math.min(Math.max(state.blockIndex, 0), Math.max(blocks.length - 1, 0));
  return {
    version: state.version,
    mode: state.mode,
    lesson: teacher ? { slug: lesson.slug, title: lesson.title, teacherNotes: lesson.teacherNotes } : { slug: lesson.slug, title: lesson.title },
    blockIndex: idx,
    total: blocks.length,
    block: blocks[idx] ?? null,
    blocks,
  };
}

/** Direct state write without revalidation: used when a page render needs to start a lesson. */
export async function setLiveLesson(lessonSlug: string) {
  await ensureLiveRow();
  await db
    .update(schema.liveState)
    .set({ lessonSlug, blockIndex: 0, mode: "follow", version: sql`${schema.liveState.version} + 1`, updatedAt: new Date() })
    .where(eq(schema.liveState.id, 1));
}
