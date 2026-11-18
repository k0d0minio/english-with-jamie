"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/neon-auth";
import type { ActionState } from "@/lib/action-state";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  if (!email || !password) return { error: "Enter your email and password." };
  const { error } = await neonAuth().signIn.email({ email, password });
  if (error) return { error: "That email and password didn't match. Try again." };
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

/**
 * Email a one-time sign-in link (Neon Auth magic link plugin). Only for the teacher's
 * address in TEACHER_EMAIL; any other address gets the same reply and no email.
 */
export async function sendMagicLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const teacher = process.env.TEACHER_EMAIL?.trim().toLowerCase();
  if (!email) return { error: "Enter your email." };
  const sent = { ok: true, message: "If that is the teacher's address, a sign-in link is on its way. Open it in this browser." };
  if (!teacher || email !== teacher) return sent;

  // The link must come back to this site so the proxy can turn it into a session cookie.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const { error } = await neonAuth().signIn.magicLink({ email, callbackURL: `${proto}://${host}/` });
  if (error) return { error: "Could not send the link. Try again in a minute." };
  return sent;
}

export async function logout() {
  await neonAuth().signOut();
  redirect("/login");
}
