import { getRole } from "@/lib/auth";
import { getLiveSnapshot } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await getLiveSnapshot({ teacher: (await getRole()) === "teacher" });
  return Response.json(snap, { headers: { "cache-control": "no-store" } });
}
