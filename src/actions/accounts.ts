"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { neonAuth } from "@/lib/neon-auth";
import type { ActionState } from "@/lib/action-state";

const NewAccount = z.object({
  name: z.string().trim().min(1, "Give the account a name."),
  email: z.string().trim().toLowerCase().pipe(z.email("That email doesn't look right.")),
  password: z.string().min(8, "The password needs at least 8 characters.").max(128),
  role: z.enum(["student", "teacher"]),
});

/** Teacher-only: make a new email + password account. No email is sent. */
export async function createAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("teacher");
  const parsed = NewAccount.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const { name, email, password, role } = parsed.data;
  const { error } = await neonAuth().admin.createUser({
    name,
    email,
    password,
    role: role === "teacher" ? "admin" : "user",
  });
  if (error) return { error: error.message || "Couldn't create that account." };
  revalidatePath("/teach/accounts");
  return { ok: true };
}
