"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");
const note = z.string().trim().max(200, "Keep the note under 200 characters.");

const paidInput = z.object({
  lessons: z.coerce.number().int("Whole lessons only.").min(1, "At least one lesson.").max(100, "That's a lot of lessons. Check the number."),
  date: day,
  note,
});

const taughtInput = z.object({ date: day, note });

function refresh() {
  revalidatePath("/payments");
  revalidatePath("/");
}

/** Teacher only: add lessons once a payment has been verified. */
export async function addPaidLessons(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const parsed = paidInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  await db.insert(schema.lessonLedger).values({ kind: "paid", ...parsed.data });
  refresh();
  return { ok: true };
}

/** Teacher only: use up one lesson from the balance. */
export async function markLessonTaught(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const parsed = taughtInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  await db.insert(schema.lessonLedger).values({ kind: "taught", lessons: 1, ...parsed.data });
  refresh();
  return { ok: true };
}

/** Teacher only: remove a mistaken entry. */
export async function deleteLedgerEntry(id: number) {
  await requireRole("teacher");
  if (!Number.isInteger(id)) return;
  await db.delete(schema.lessonLedger).where(eq(schema.lessonLedger.id, id));
  refresh();
}
