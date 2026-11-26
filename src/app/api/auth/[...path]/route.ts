import { neonAuth } from "@/lib/neon-auth";

// The SDK's proxy to Neon Auth, mounted where the browser client expects it. The magic
// link needs it: the browser trades the link's one-time verifier for a session cookie here.
// neonAuth() is read per request so a missing env var fails the request, not the build.
type Ctx = { params: Promise<{ path: string[] }> };

export function GET(req: Request, ctx: Ctx) {
  return neonAuth().handler().GET(req, ctx);
}

export function POST(req: Request, ctx: Ctx) {
  return neonAuth().handler().POST(req, ctx);
}
