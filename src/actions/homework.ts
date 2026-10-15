"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";

const input = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  details: z.string().trim().max(5000).default(""),
  dueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).default(""),
  lessonId: z.coerce.number().int().positive().optional(),
});

export async function createHomework(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const parsed = input.safeParse({
    title: formData.get("title"),
    details: formData.get("details") ?? "",
    dueDate: formData.get("dueDate") ?? "",
    lessonId: formData.get("lessonId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const v = parsed.data;
  await db.insert(schema.homework).values({ title: v.title, details: v.details, dueDate: v.dueDate || null, lessonId: v.lessonId ?? null });
  revalidatePath("/homework");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleHomework(id: number) {
  await requireRole();
  const [row] = await db.select().from(schema.homework).where(eq(schema.homework.id, id));
  if (!row) return;
  await db.update(schema.homework).set({ done: !row.done, doneAt: row.done ? null : new Date() }).where(eq(schema.homework.id, id));
  revalidatePath("/homework");
  revalidatePath("/");
}

export async function deleteHomework(id: number) {
  await requireRole("teacher");
  await db.delete(schema.homework).where(eq(schema.homework.id, id));
  revalidatePath("/homework");
  revalidatePath("/");
}
