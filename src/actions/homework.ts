"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function toggleHomework(slug: string) {
  await requireRole();
  if (!/^[a-z0-9-]+$/.test(slug)) return;
  const [row] = await db.select().from(schema.homeworkDone).where(eq(schema.homeworkDone.slug, slug));
  if (row) await db.delete(schema.homeworkDone).where(eq(schema.homeworkDone.slug, slug));
  else await db.insert(schema.homeworkDone).values({ slug }).onConflictDoNothing();
  revalidatePath("/homework");
  revalidatePath("/");
}
