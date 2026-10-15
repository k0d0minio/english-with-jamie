import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listGrammar } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function GrammarTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const role = await requireRole();
  const { slug } = await params;
  const topics = (await listGrammar()).filter((t) => role === "teacher" || !t.draft);
  const i = topics.findIndex((t) => t.slug === slug);
  if (i === -1) {
    if (role === "student") redirect("/reference/grammar");
    notFound();
  }
  const topic = topics[i];
  const prev = topics[i - 1];
  const next = topics[i + 1];
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/reference/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> All topics
      </Link>
      <div className="mb-2 flex gap-2">
        <Badge tone="accent">{topic.group}</Badge>
        {topic.draft ? <Badge>draft</Badge> : null}
      </div>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">{topic.title}</h1>
      {topic.body ? <Markdown className="prose-lg">{topic.body}</Markdown> : <p className="text-muted">This page has not been written yet.</p>}
      <nav className="mt-10 flex justify-between border-t border-line pt-4 text-sm">
        {prev ? <Link href={`/reference/grammar/${prev.slug}`} className="text-accent hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/reference/grammar/${next.slug}`} className="text-accent hover:underline">{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
