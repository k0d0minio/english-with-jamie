import { requireRole } from "@/lib/auth";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { watchList } from "@/content/watch";

export default async function WatchPage() {
  const role = await requireRole();
  return (
    <>
      <PageHeader title="Things to watch" lead="Subtitles in English, never in French. Pause and repeat lines you like." />
      {watchList.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {watchList.map((w) => (
            <Card key={w.title}>
              <div className="mb-1 flex items-center gap-2">
                <Badge tone="accent">{w.kind}</Badge>
                {w.level ? <Badge tone={w.level === "stretch" ? "warm" : "ok"}>{w.level}</Badge> : null}
                {w.where ? <span className="text-xs text-muted">{w.where}</span> : null}
              </div>
              <h2 className="text-lg font-semibold">{w.title}</h2>
              <p className="mt-1 text-sm text-muted">{w.why}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          Nothing here yet.
          {role === "teacher" ? <span className="mt-1 block font-mono text-xs">Add entries in src/content/watch.ts</span> : null}
        </Empty>
      )}
    </>
  );
}
