import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, EyeOff, Presentation } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getLesson } from "@/lib/content";
import { getAnswersForLesson } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { ExerciseStage, SlideView } from "@/components/block-view";
import { Markdown } from "@/components/markdown";
import { Exercise, type SavedAnswer } from "@/components/exercise";
import { AnswersTable } from "@/components/answers-table";
import { ResetAnswers } from "@/components/reset-answers";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const role = await requireRole();
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();
  if (role === "student" && lesson.status === "draft") redirect("/lessons");
  const answers = await getAnswersForLesson(slug);

  return (
    <>
      <PageHeader
        title={lesson.title}
        lead={lesson.summary || undefined}
        actions={
          role === "teacher" ? (
            <>
              {answers.length ? <ResetAnswers lessonSlug={slug} label="Reset answers" count={answers.length} /> : null}
              <Link href={`/live?lesson=${slug}`} className={buttonClass()}>
                <Presentation className="h-4 w-4" /> Present
              </Link>
            </>
          ) : null
        }
      />
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Badge tone={lesson.status === "done" ? "ok" : lesson.status === "scheduled" ? "accent" : "neutral"}>{lesson.status}</Badge>
        {lesson.date ? <span>{formatDate(lesson.date)}</span> : null}
        {role === "teacher" ? <span className="font-mono text-xs">content/lessons/{slug}.md</span> : null}
      </div>
      {role === "teacher" && lesson.problems.length ? (
        <Card className="mb-6 border-warm/40 bg-warm-soft/40">
          <h2 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-warm">
            <AlertTriangle className="h-4 w-4" /> The file has problems
          </h2>
          <ul className="list-disc pl-5 text-sm">
            {lesson.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>
      ) : null}
      {role === "teacher" && lesson.teacherNotes ? (
        <Card className="mb-6 bg-warm-soft/40">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-warm">Teacher notes (only you see this)</h2>
          <Markdown className="prose-sm">{lesson.teacherNotes}</Markdown>
        </Card>
      ) : null}
      {lesson.blocks.length ? (
        <div className="space-y-8">
          {lesson.blocks.map((b, i) => {
            const mine = answers.filter((a) => a.blockKey === b.key);
            const saved: Record<number, SavedAnswer> = Object.fromEntries(mine.map((a) => [a.itemIndex, { response: a.response, correct: a.correct, attempts: a.attempts }]));
            const progress = { index: i, total: lesson.blocks.length };
            const teacher = role === "teacher";
            const view =
              b.data.kind === "slide" ? (
                <SlideView data={b.data} lessonTitle={lesson.title} progress={progress} compact />
              ) : (
                <ExerciseStage progress={progress} compact>
                  {teacher ? (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">{b.data.title}</h2>
                        {mine.length ? <ResetAnswers lessonSlug={slug} blockKey={b.key} label="Reset" count={mine.length} /> : null}
                      </div>
                      <AnswersTable data={b.data} answers={mine} />
                    </>
                  ) : (
                    <Exercise lessonSlug={slug} blockKey={b.key} data={b.data} saved={saved} />
                  )}
                </ExerciseStage>
              );
            if (!teacher) return <div key={b.key}>{view}</div>;
            return (
              <div key={b.key} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                {view}
                <div className="rounded-lg border border-warm/30 bg-warm-soft/40 p-4">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warm">
                    <EyeOff className="h-3.5 w-3.5" /> Your notes
                  </h3>
                  {b.notes ? <Markdown className="prose-sm">{b.notes}</Markdown> : <p className="text-sm text-muted">No notes for this one.</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty>This lesson has no content yet.</Empty>
      )}
    </>
  );
}
