"use server";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ensureLiveRow } from "@/lib/live";

async function bump(patch: Partial<typeof schema.liveState.$inferInsert>) {
  await ensureLiveRow();
  await db
    .update(schema.liveState)
    .set({ ...patch, version: sql`${schema.liveState.version} + 1`, updatedAt: new Date() })
    .where(eq(schema.liveState.id, 1));
  revalidatePath("/live");
}

export async function startLive(lessonSlug: string) {
  await requireRole("teacher");
  await bump({ lessonSlug, blockIndex: 0, mode: "follow" });
}

export async function stopLive() {
  await requireRole("teacher");
  await bump({ lessonSlug: null, blockIndex: 0 });
}

export async function gotoBlock(index: number) {
  await requireRole("teacher");
  await bump({ blockIndex: Math.max(0, index) });
}

export async function setLiveMode(mode: "follow" | "free") {
  await requireRole("teacher");
  await bump({ mode });
}
