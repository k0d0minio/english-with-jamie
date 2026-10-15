import Link from "next/link";
import { BookOpen, Compass, Film, Newspaper } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listGrammar, listRead, listRecommendations, listWatch } from "@/lib/content";
import { Card, PageHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ReferencePage() {
  const role = await requireRole();
  const student = role === "student";
  const [grammar, recs, watch, read] = await Promise.all([listGrammar(), listRecommendations(), listWatch(), listRead()]);
  const count = <T extends { draft: boolean }>(xs: T[]) => xs.filter((x) => !student || !x.draft).length;
  const sections = [
    { href: "/reference/grammar", icon: BookOpen, title: "Grammar & syntax guide", desc: `${count(grammar)} topics, B2 and up. Examples first, rules second.` },
    { href: "/reference/recommendations", icon: Compass, title: "How to improve", desc: `${count(recs)} pieces of advice from Jamie.` },
    { href: "/reference/watch", icon: Film, title: "Things to watch", desc: `${count(watch)} series and films.` },
    { href: "/reference/read", icon: Newspaper, title: "Things to read", desc: `${count(read)} articles and books.` },
  ];
  return (
    <>
      <PageHeader title="Reference" lead="Things to come back to between lessons." />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:border-accent">
              <Icon className="mb-3 h-6 w-6 text-accent" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
