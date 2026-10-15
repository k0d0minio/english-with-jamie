import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { neonAuth } from "./neon-auth";

export type Role = "teacher" | "student";

/** Neon Auth role → classroom role. Admins teach; plain users are students. */
export function roleOf(user: { role?: string | null; banned?: boolean | null }): Role | null {
  if (user.banned) return null;
  const roles = (user.role ?? "user").split(",").map((r) => r.trim());
  if (roles.includes("admin")) return "teacher";
  if (roles.includes("user")) return "student";
  return null;
}

/** The signed-in user, once per request. */
export const getUser = cache(async () => {
  const { data } = await neonAuth().getSession();
  return data?.user ?? null;
});

export async function getRole(): Promise<Role | null> {
  const user = await getUser();
  return user ? roleOf(user) : null;
}

export async function requireRole(role?: Role): Promise<Role> {
  const current = await getRole();
  if (!current) redirect("/login");
  if (role && current !== role) redirect("/");
  return current;
}
