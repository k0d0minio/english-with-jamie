import { requireRole } from "@/lib/auth";
import { listRecommendations } from "@/lib/content";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const role = await requireRole();
  const items = (await listRecommendations()).filter((r) => role === "teacher" || !r.draft);
  return (
    <>
      <PageHeader title="How to improve" lead="Advice from Jamie, not from a machine." />
      {items.length ? (
        <div className="space-y-4">
          {items.map((r) => (
            <Card key={r.slug}>
              <h2 className="text-lg font-semibold">
                {r.title} {r.draft ? <Badge className="ml-1">draft</Badge> : null}
              </h2>
              <Markdown className="mt-1">{r.body}</Markdown>
              {r.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          Nothing here yet.
          {role === "teacher" ? <span className="mt-1 block font-mono text-xs">studios/recommendations → content/recommendations/</span> : null}
        </Empty>
      )}
    </>
  );
}
