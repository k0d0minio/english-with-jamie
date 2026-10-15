import { getRole } from "@/lib/auth";
import { getAnswersForBlock } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if ((await getRole()) !== "teacher") return Response.json({ error: "forbidden" }, { status: 403 });
  const url = new URL(req.url);
  const lesson = url.searchParams.get("lesson") ?? "";
  const block = url.searchParams.get("block") ?? "";
  if (!lesson || !block) return Response.json({ answers: [] });
  const rows = await getAnswersForBlock(lesson, block);
  return Response.json({ answers: rows }, { headers: { "cache-control": "no-store" } });
}
