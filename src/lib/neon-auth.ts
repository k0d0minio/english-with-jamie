// Neon Auth (Managed Better Auth). Users, passwords and sessions live in the `neon_auth`
// schema on the same Neon branch. Built lazily so a missing env var fails the request,
// not the build.
import { createNeonAuth } from "@neondatabase/auth/next/server";

let instance: ReturnType<typeof createNeonAuth> | undefined;

export function neonAuth() {
  instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  });
  return instance;
}
