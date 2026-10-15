import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { signSession, verifySession, type Role, COOKIE_NAME } from "./session";

export type { Role };

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function roleForCode(code: string): Role | null {
  const teacher = process.env.TEACHER_CODE ?? "";
  const student = process.env.STUDENT_CODE ?? "";
  if (teacher && safeEqual(code, teacher)) return "teacher";
  if (student && safeEqual(code, student)) return "student";
  return null;
}

export async function createSession(role: Role) {
  const exp = Math.floor(Date.now() / 1000) + THIRTY_DAYS;
  const value = await signSession(role, exp);
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getRole(): Promise<Role | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

export async function requireRole(role?: Role): Promise<Role> {
  const current = await getRole();
  if (!current) redirect("/login");
  if (role && current !== role) redirect("/");
  return current;
}
