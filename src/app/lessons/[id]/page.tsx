import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Pencil, Presentation } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAnswersForLesson, getLesson } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { SlideView } from "@/components/block-view";
import { Exercise, type SavedAnswer } from "@/components/exercise";
import { AnswersTable } from "@/components/answers-table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await requireRole();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const lesson = await getLesson(id);
  if (!lesson) notFound();
  if (role === "student" && lesson.status === "draft") redirect("/lessons");
  const answers = await getAnswersForLesson(id);

  return (
    <>
      <PageHeader
        title={lesson.title}
        lead={lesson.summary || undefined}
        actions={
          role === "teacher" ? (
            <>
              <Link href={`/teach/lessons/${id}`} className={buttonClass({ variant: "outline" })}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <Link href={`/live?lesson=${id}`} className={buttonClass()}>
                <Presentation className="h-4 w-4" /> Present
              </Link>
            </>
          ) : null
        }
      />
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Badge tone={lesson.status === "done" ? "ok" : lesson.status === "scheduled" ? "accent" : "neutral"}>{lesson.status}</Badge>
        {lesson.scheduledFor ? <span>{formatDate(lesson.scheduledFor)}</span> : null}
      </div>
      {role === "teacher" && lesson.teacherNotes ? (
        <Card className="mb-6 bg-warm-soft/40">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-warm">Teacher notes (only you see this)</h2>
          <p className="whitespace-pre-wrap text-sm">{lesson.teacherNotes}</p>
        </Card>
      ) : null}
      {lesson.blocks.length ? (
        <div className="space-y-6">
          {lesson.blocks.map((b, i) => {
            const saved: Record<number, SavedAnswer> = Object.fromEntries(
              answers.filter((a) => a.blockId === b.id).map((a) => [a.itemIndex, { response: a.response, correct: a.correct, attempts: a.attempts }]),
            );
            return (
              <Card key={b.id}>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {i + 1} · {b.kind}
                </div>
                {b.data.kind === "slide" ? (
                  <SlideView data={b.data} />
                ) : role === "teacher" ? (
                  <>
                    <h2 className="mb-3 text-xl font-semibold">{b.data.title}</h2>
                    <AnswersTable data={b.data} answers={answers.filter((a) => a.blockId === b.id)} />
                  </>
                ) : (
                  <Exercise blockId={b.id} data={b.data} saved={saved} />
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty>This lesson has no content yet.</Empty>
      )}
    </>
  );
}
