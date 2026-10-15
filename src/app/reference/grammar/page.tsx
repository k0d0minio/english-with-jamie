import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui/card";
import { grammarGroups, grammarTopics } from "@/content/grammar";

export default async function GrammarIndex() {
  await requireRole();
  return (
    <>
      <PageHeader title="Grammar & syntax guide" lead="Short, example-led pages. Read the examples out loud." />
      <div className="space-y-8">
        {grammarGroups.map((g) => (
          <section key={g}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{g}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {grammarTopics
                .filter((t) => t.group === g)
                .map((t) => (
                  <Link key={t.slug} href={`/reference/grammar/${t.slug}`}>
                    <Card className="h-full transition-colors hover:border-accent">
                      <h3 className="font-semibold">{t.title}</h3>
                      <p className="mt-1 text-sm text-muted">{t.blurb}</p>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
