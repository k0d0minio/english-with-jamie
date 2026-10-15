"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";

const lessonInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().max(2000).default(""),
  teacherNotes: z.string().trim().max(10000).default(""),
  scheduledFor: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).default(""),
  status: z.enum(["draft", "scheduled", "done"]).default("draft"),
});

function readLesson(formData: FormData) {
  return lessonInput.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    teacherNotes: formData.get("teacherNotes") ?? "",
    scheduledFor: formData.get("scheduledFor") ?? "",
    status: formData.get("status") ?? "draft",
  });
}

export async function createLesson(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const parsed = readLesson(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const v = parsed.data;
  const [row] = await db
    .insert(schema.lessons)
    .values({ ...v, scheduledFor: v.scheduledFor || null })
    .returning({ id: schema.lessons.id });
  revalidatePath("/lessons");
  revalidatePath("/");
  redirect(`/teach/lessons/${row.id}`);
}

export async function updateLesson(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const parsed = readLesson(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const v = parsed.data;
  await db
    .update(schema.lessons)
    .set({ ...v, scheduledFor: v.scheduledFor || null, updatedAt: new Date() })
    .where(eq(schema.lessons.id, id));
  revalidatePath(`/lessons/${id}`);
  revalidatePath(`/teach/lessons/${id}`);
  revalidatePath("/lessons");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteLesson(id: number) {
  await requireRole("teacher");
  await db.delete(schema.lessons).where(eq(schema.lessons.id, id));
  revalidatePath("/lessons");
  revalidatePath("/");
  redirect("/lessons");
}
