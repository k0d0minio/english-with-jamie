"use server";
import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { parseExerciseItems } from "@/lib/exercise-dsl";
import type { BlockData } from "@/lib/db/schema";
import type { ActionState } from "@/lib/action-state";

async function nextPosition(lessonId: number) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${schema.blocks.position}), 0)::int` })
    .from(schema.blocks)
    .where(eq(schema.blocks.lessonId, lessonId));
  return (row?.max ?? 0) + 1;
}

function revalidate(lessonId: number) {
  revalidatePath(`/teach/lessons/${lessonId}`);
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/live");
}

function readBlockData(formData: FormData): { data?: BlockData; error?: string } {
  const kind = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required" };
  if (kind === "slide") {
    const body = String(formData.get("body") ?? "").trim();
    return { data: { kind: "slide", title, body } };
  }
  if (kind === "exercise") {
    const instructions = String(formData.get("instructions") ?? "").trim();
    const { items, errors } = parseExerciseItems(String(formData.get("items") ?? ""));
    if (errors.length) return { error: errors.join(" ") };
    if (!items.length) return { error: "Add at least one item." };
    return { data: { kind: "exercise", title, instructions: instructions || undefined, items } };
  }
  return { error: "Unknown block kind" };
}

export async function addBlock(lessonId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const { data, error } = readBlockData(formData);
  if (!data) return { error };
  await db.insert(schema.blocks).values({ lessonId, kind: data.kind, data, position: await nextPosition(lessonId) });
  revalidate(lessonId);
  return { ok: true };
}

export async function updateBlock(blockId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const { data, error } = readBlockData(formData);
  if (!data) return { error };
  const [row] = await db.update(schema.blocks).set({ data, kind: data.kind }).where(eq(schema.blocks.id, blockId)).returning();
  if (row) revalidate(row.lessonId);
  return { ok: true };
}

export async function deleteBlock(blockId: number) {
  await requireRole("teacher");
  const [row] = await db.delete(schema.blocks).where(eq(schema.blocks.id, blockId)).returning();
  if (row) revalidate(row.lessonId);
}

export async function moveBlock(blockId: number, direction: "up" | "down") {
  await requireRole("teacher");
  const [row] = await db.select().from(schema.blocks).where(eq(schema.blocks.id, blockId));
  if (!row) return;
  const siblings = await db.select().from(schema.blocks).where(eq(schema.blocks.lessonId, row.lessonId)).orderBy(asc(schema.blocks.position));
  const i = siblings.findIndex((b) => b.id === blockId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= siblings.length) return;
  const other = siblings[j];
  await db.update(schema.blocks).set({ position: other.position }).where(eq(schema.blocks.id, row.id));
  await db.update(schema.blocks).set({ position: row.position }).where(and(eq(schema.blocks.id, other.id), eq(schema.blocks.lessonId, row.lessonId)));
  revalidate(row.lessonId);
}

