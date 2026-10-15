import { requireRole } from "@/lib/auth";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { recommendations } from "@/content/recommendations";

export default async function RecommendationsPage() {
  const role = await requireRole();
  return (
    <>
      <PageHeader title="How to improve" lead="Advice from Jamie, not from a machine." />
      {recommendations.length ? (
        <div className="space-y-4">
          {recommendations.map((r) => (
            <Card key={r.title}>
              <h2 className="text-lg font-semibold">{r.title}</h2>
              <Markdown className="mt-1">{r.body}</Markdown>
              {r.tags?.length ? (
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
          {role === "teacher" ? <span className="mt-1 block font-mono text-xs">Add entries in src/content/recommendations.ts</span> : null}
        </Empty>
      )}
    </>
  );
}
