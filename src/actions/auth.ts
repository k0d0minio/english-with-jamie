"use server";
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

export async function logout() {
  await neonAuth().signOut();
  redirect("/login");
}
