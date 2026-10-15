"use server";
import { redirect } from "next/navigation";
import { clearSession, createSession, roleForCode } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "/");
  const role = code ? roleForCode(code) : null;
  if (!role) return { error: "That code didn't match. Try again." };
  await createSession(role);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
