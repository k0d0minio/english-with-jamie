"use server";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { getLesson } from "@/lib/content";
import { checkAnswer } from "@/lib/exercise-dsl";

export type AnswerResult = { correct: boolean; attempts: number; reveal?: string };

const REVEAL_AFTER = 3;

export async function submitAnswer(lessonSlug: string, blockKey: string, itemIndex: number, response: string): Promise<AnswerResult> {
  const role = await requireRole();
  const lesson = await getLesson(lessonSlug);
  const block = lesson?.blocks.find((b) => b.key === blockKey);
  if (!block || block.data.kind !== "exercise") throw new Error("Not an exercise");
  const item = block.data.items[itemIndex];
  if (!item) throw new Error("No such item");
  const correct = checkAnswer(item, response);

  // Only the student's answers are recorded; the teacher can try things without polluting results.
  let attempts = 1;
  if (role === "student") {
    const [row] = await db
      .insert(schema.itemAnswers)
      .values({ lessonSlug, blockKey, itemIndex, response, correct })
      .onConflictDoUpdate({
        target: [schema.itemAnswers.lessonSlug, schema.itemAnswers.blockKey, schema.itemAnswers.itemIndex],
        set: {
          response,
          correct: sql`${schema.itemAnswers.correct} or ${correct}`,
          attempts: sql`${schema.itemAnswers.attempts} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ attempts: schema.itemAnswers.attempts });
    attempts = row?.attempts ?? 1;
  }

  const reveal =
    !correct && attempts >= REVEAL_AFTER ? (item.kind === "mc" ? item.options[item.correct] : item.answer.split("/")[0].trim()) : undefined;
  return { correct, attempts, reveal };
}
