import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { readGrammarTopic } from "@/lib/grammar";
import { grammarTopics } from "@/content/grammar";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/card";

export default async function GrammarTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole();
  const { slug } = await params;
  const topic = await readGrammarTopic(slug);
  if (!topic) notFound();
  const i = grammarTopics.findIndex((t) => t.slug === slug);
  const prev = grammarTopics[i - 1];
  const next = grammarTopics[i + 1];
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/reference/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> All topics
      </Link>
      <Badge tone="accent" className="mb-2 block w-fit">{topic.group}</Badge>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{topic.title}</h1>
      {topic.body ? <Markdown className="prose-lg">{topic.body}</Markdown> : <p className="text-muted">This page has not been written yet.</p>}
      <nav className="mt-10 flex justify-between border-t border-line pt-4 text-sm">
        {prev ? <Link href={`/reference/grammar/${prev.slug}`} className="text-accent hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/reference/grammar/${next.slug}`} className="text-accent hover:underline">{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
