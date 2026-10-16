"use server";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getUser, requireRole } from "@/lib/auth";
import { getForm } from "@/lib/content";
import { isOther, otherLabel, SCALE, type FormAnswers, type FormQuestion } from "@/lib/form-dsl";
import type { ActionState } from "@/lib/action-state";

const MAX = { text: 500, long: 5000 } as const;
const okSlug = (s: string) => /^[a-z0-9-]+$/.test(s);

function refresh(slug: string) {
  revalidatePath("/profile");
  revalidatePath(`/profile/forms/${slug}`);
  revalidatePath("/teach/forms");
  revalidatePath(`/teach/forms/${slug}`);
  revalidatePath("/");
}

/** Teacher only: put a form in a student's profile. Sending is what makes a form live. */
export async function sendForm(slug: string, userId: string) {
  await requireRole("teacher");
  const form = okSlug(slug) ? await getForm(slug) : null;
  if (!form || !userId) return;
  await db.insert(schema.formResponses).values({ formSlug: slug, userId }).onConflictDoNothing();
  refresh(slug);
}

/** Teacher only: take a form back, but only while the student hasn't saved anything in it. */
export async function withdrawForm(slug: string, userId: string) {
  await requireRole("teacher");
  await db
    .delete(schema.formResponses)
    .where(and(eq(schema.formResponses.formSlug, slug), eq(schema.formResponses.userId, userId), isNull(schema.formResponses.savedAt)));
  refresh(slug);
}

/** One question's answer from the posted form, or undefined if she left it blank or sent something the form doesn't offer. */
function readAnswer(q: FormQuestion, fd: FormData): string | string[] | undefined {
  const other = (option: string) => {
    const text = String(fd.get(`${q.key}::other`) ?? "").trim().slice(0, MAX.text);
    return text ? `${otherLabel(option)}: ${text}` : otherLabel(option);
  };
  const otherOption = q.options.find(isOther);
  const typedOther = String(fd.get(`${q.key}::other`) ?? "").trim() !== "";
  switch (q.kind) {
    case "text":
    case "long": {
      const v = String(fd.get(q.key) ?? "").trim().slice(0, MAX[q.kind]);
      return v || undefined;
    }
    case "scale": {
      const v = String(fd.get(q.key) ?? "");
      return (SCALE as readonly string[]).includes(v) ? v : undefined;
    }
    case "one": {
      const v = String(fd.get(q.key) ?? "");
      if (!q.options.includes(v)) return otherOption && typedOther ? other(otherOption) : undefined;
      return isOther(v) ? other(v) : v;
    }
    case "many": {
      const picked = fd.getAll(q.key).map(String).filter((v) => q.options.includes(v));
      if (otherOption && typedOther && !picked.includes(otherOption)) picked.push(otherOption);
      const out = q.options.filter((o) => picked.includes(o)).map((o) => (isOther(o) ? other(o) : o));
      return out.length ? out : undefined;
    }
  }
}

/** Student only: save her answers. `intent=send` also marks the form as sent back to the teacher. */
export async function saveFormAnswers(slug: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("student");
  const user = await getUser();
  const form = okSlug(slug) ? await getForm(slug) : null;
  if (!user || !form) return { error: "This form isn't available any more." };

  const answers: FormAnswers = {};
  for (const q of form.sections.flatMap((s) => s.questions)) {
    const answer = readAnswer(q, fd);
    if (answer !== undefined) answers[q.key] = { prompt: q.prompt, answer };
  }
  const send = fd.get("intent") === "send";
  const now = new Date();
  const updated = await db
    .update(schema.formResponses)
    .set({ answers, savedAt: now, ...(send ? { submittedAt: now } : {}) })
    .where(and(eq(schema.formResponses.formSlug, slug), eq(schema.formResponses.userId, user.id)))
    .returning({ slug: schema.formResponses.formSlug });
  if (!updated.length) return { error: "This form hasn't been sent to you." };
  refresh(slug);
  return { ok: true, message: send ? "Sent. Thank you." : "Saved. Come back to it whenever you like." };
}
