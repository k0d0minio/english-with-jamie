import { getLiveSnapshot } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await getLiveSnapshot();
  return Response.json(snap, { headers: { "cache-control": "no-store" } });
}
