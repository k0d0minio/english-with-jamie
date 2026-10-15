import Link from "next/link";
import { BookOpen, Compass, Film, Newspaper } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui/card";
import { grammarTopics } from "@/content/grammar";
import { recommendations } from "@/content/recommendations";
import { watchList } from "@/content/watch";
import { readList } from "@/content/read";

export default async function ReferencePage() {
  await requireRole();
  const sections = [
    { href: "/reference/grammar", icon: BookOpen, title: "Grammar & syntax guide", desc: `${grammarTopics.length} topics, B2 and up. Examples first, rules second.` },
    { href: "/reference/recommendations", icon: Compass, title: "How to improve", desc: `${recommendations.length} pieces of advice from Jamie.` },
    { href: "/reference/watch", icon: Film, title: "Things to watch", desc: `${watchList.length} series and films.` },
    { href: "/reference/read", icon: Newspaper, title: "Things to read", desc: `${readList.length} articles and books.` },
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
