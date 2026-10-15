// Runs in both the proxy (edge-safe) and server code: Web Crypto only.
export type Role = "teacher" | "student";
export const COOKIE_NAME = "ewj_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET missing or too short");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function b64url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function signSession(role: Role, exp: number) {
  const payload = `${role}.${exp}`;
  const key = await secretKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySession(value: string): Promise<Role | null> {
  const [role, expStr, sig] = value.split(".");
  if (!role || !expStr || !sig) return null;
  if (role !== "teacher" && role !== "student") return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return null;
  const key = await secretKey();
  const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${role}.${exp}`));
  if (b64url(expected) !== sig) return null;
  return role;
}
