import { requireRole } from "@/lib/auth";
import { listWatch } from "@/lib/content";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";

export const dynamic = "force-dynamic";

export default async function WatchPage() {
  const role = await requireRole();
  const items = (await listWatch()).filter((w) => role === "teacher" || !w.draft);
  return (
    <>
      <PageHeader title="Things to watch" lead="Subtitles in English, never in French. Pause and repeat lines you like." />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((w) => (
            <Card key={w.slug}>
              <div className="mb-1 flex items-center gap-2">
                <Badge tone="accent">{w.kind}</Badge>
                {w.level ? <Badge tone={w.level === "stretch" ? "warm" : "ok"}>{w.level}</Badge> : null}
                {w.draft ? <Badge>draft</Badge> : null}
                {w.where ? <span className="text-xs text-muted">{w.where}</span> : null}
              </div>
              <h2 className="text-lg font-semibold">{w.title}</h2>
              <Markdown className="prose-sm mt-1 text-muted">{w.body}</Markdown>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          Nothing here yet.
          {role === "teacher" ? <span className="mt-1 block font-mono text-xs">studios/watch → content/watch/</span> : null}
        </Empty>
      )}
    </>
  );
}
