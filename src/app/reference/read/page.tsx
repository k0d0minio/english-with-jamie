import { requireRole } from "@/lib/auth";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { readList } from "@/content/read";

export default async function ReadPage() {
  const role = await requireRole();
  return (
    <>
      <PageHeader title="Things to read" lead="Articles and books to enjoy, not to study." />
      {readList.length ? (
        <div className="space-y-3">
          {readList.map((r) => (
            <Card key={r.title}>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                {r.source ? <span>{r.source}</span> : null}
                {r.length ? <Badge>{r.length}</Badge> : null}
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
              <p className="mt-1 text-sm text-muted">{r.why}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          Nothing here yet.
          {role === "teacher" ? <span className="mt-1 block font-mono text-xs">Add entries in src/content/read.ts</span> : null}
        </Empty>
      )}
    </>
  );
}
