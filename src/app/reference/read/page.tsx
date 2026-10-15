import { requireRole } from "@/lib/auth";
import { listRead } from "@/lib/content";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";

export const dynamic = "force-dynamic";

export default async function ReadPage() {
  const role = await requireRole();
  const items = (await listRead()).filter((r) => role === "teacher" || !r.draft);
  return (
    <>
      <PageHeader title="Things to read" lead="Articles and books to enjoy, not to study." />
      {items.length ? (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.slug}>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                {r.source ? <span>{r.source}</span> : null}
                {r.length ? <Badge>{r.length}</Badge> : null}
                {r.draft ? <Badge>draft</Badge> : null}
              </div>
              <h2 className="text-lg font-semibold">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    {r.title} ↗
                  </a>
                ) : (
                  r.title
                )}
              </h2>
              <Markdown className="prose-sm mt-1 text-muted">{r.body}</Markdown>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          Nothing here yet.
          {role === "teacher" ? <span className="mt-1 block font-mono text-xs">studios/read → content/read/</span> : null}
        </Empty>
      )}
    </>
  );
}
