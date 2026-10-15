import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listLessons } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
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
        lead={role === "teacher" ? "Every plan, newest first. Drafts are only visible to you." : "What we've covered and what's coming up."}
        actions={
          role === "teacher" ? (
            <Link href="/teach/lessons/new" className={buttonClass()}>
              <Plus className="h-4 w-4" /> New lesson
            </Link>
          ) : null
        }
      />
      {lessons.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((l) => (
            <Card key={l.id} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge tone={tone[l.status]}>{l.status}</Badge>
                {l.scheduledFor ? <span className="text-xs text-muted">{formatDate(l.scheduledFor)}</span> : null}
              </div>
              <h3 className="text-lg font-semibold">
                <Link href={`/lessons/${l.id}`} className="hover:text-accent">
                  {l.title}
                </Link>
              </h3>
              {l.summary ? <p className="mt-1 line-clamp-3 text-sm text-muted">{l.summary}</p> : null}
              {role === "teacher" ? (
                <div className="mt-auto flex gap-3 pt-3 text-sm">
                  <Link href={`/teach/lessons/${l.id}`} className="text-accent hover:underline">Edit</Link>
                  <Link href={`/live?lesson=${l.id}`} className="text-accent hover:underline">Present</Link>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Empty>No lessons yet.</Empty>
      )}
    </>
  );
}
