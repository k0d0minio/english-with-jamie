import { getRole } from "@/lib/auth";
import { getAnswersForBlock } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if ((await getRole()) !== "teacher") return Response.json({ error: "forbidden" }, { status: 403 });
  const blockId = Number(new URL(req.url).searchParams.get("blockId"));
  if (!Number.isInteger(blockId)) return Response.json({ answers: [] });
  const rows = await getAnswersForBlock(blockId);
  return Response.json({ answers: rows }, { headers: { "cache-control": "no-store" } });
}
