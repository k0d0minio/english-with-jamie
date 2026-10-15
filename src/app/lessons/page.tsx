import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listLessons } from "@/lib/content";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tone = { draft: "neutral", scheduled: "accent", done: "ok" } as const;

export default async function LessonsPage() {
  const role = await requireRole();
  const all = await listLessons();
  const lessons = role === "teacher" ? all : all.filter((l) => l.status !== "draft");
  return (
    <>
      <PageHeader
        title="Lessons"
        lead={role === "teacher" ? "Every lesson file in content/lessons, newest first. Drafts are only visible to you." : "What we have covered and what is coming up."}
      />
      {lessons.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((l) => (
            <Card key={l.slug} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Badge tone={tone[l.status]}>{l.status}</Badge>
                  {role === "teacher" && l.problems.length ? (
                    <span className="flex items-center gap-1 text-xs text-warm" title={l.problems.join("\n")}>
                      <AlertTriangle className="h-3.5 w-3.5" /> {l.problems.length}
                    </span>
                  ) : null}
                </span>
                {l.date ? <span className="text-xs text-muted">{formatDate(l.date)}</span> : null}
              </div>
              <h3 className="text-lg font-semibold">
                <Link href={`/lessons/${l.slug}`} className="hover:text-accent">
                  {l.title}
                </Link>
              </h3>
              {l.summary ? <p className="mt-1 line-clamp-3 text-sm text-muted">{l.summary}</p> : null}
              <div className="mt-auto flex gap-3 pt-3 text-xs text-muted">
                <span>{l.blocks.filter((b) => b.kind === "slide").length} slides</span>
                <span>{l.blocks.filter((b) => b.kind === "exercise").length} exercises</span>
                {role === "teacher" ? (
                  <Link href={`/live?lesson=${l.slug}`} className="ml-auto text-sm text-accent hover:underline">
                    Present
                  </Link>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>No lessons yet.</Empty>
      )}
    </>
  );
}
