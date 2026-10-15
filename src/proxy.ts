import { NextResponse, type NextRequest } from "next/server";
import { neonAuth } from "@/lib/neon-auth";

const PUBLIC = ["/login", "/api/health"];

// Signed-in check only (and session refresh). Roles are enforced where the data is read:
// requireRole() in pages and server actions, getRole() in route handlers.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  const loginUrl = pathname === "/" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
  const res = await neonAuth().middleware({ loginUrl })(req);
  if (pathname.startsWith("/api/") && res.status >= 300 && res.status < 400) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
