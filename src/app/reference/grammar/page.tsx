import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { grammarGroups, listGrammar } from "@/lib/content";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function GrammarIndex() {
  const role = await requireRole();
  const topics = (await listGrammar()).filter((t) => role === "teacher" || !t.draft);
  const groups = [...grammarGroups, ...topics.map((t) => t.group).filter((g) => !(grammarGroups as readonly string[]).includes(g))];
  return (
    <>
      <PageHeader title="Grammar & syntax guide" lead="Short, example-led pages. Read the examples out loud." />
      {topics.length ? (
        <div className="space-y-8">
          {groups.map((g) => {
            const inGroup = topics.filter((t) => t.group === g);
            if (!inGroup.length) return null;
            return (
              <section key={g}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{g}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {inGroup.map((t) => (
                    <Link key={t.slug} href={`/reference/grammar/${t.slug}`}>
                      <Card className="h-full transition-colors hover:border-accent">
                        <h3 className="font-semibold">
                          {t.title} {t.draft ? <Badge className="ml-1">draft</Badge> : null}
                        </h3>
                        <p className="mt-1 text-sm text-muted">{t.blurb}</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <Empty>No pages yet.</Empty>
      )}
    </>
  );
}
