import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Presentation } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getLesson } from "@/lib/queries";
import { deleteLesson, updateLesson } from "@/actions/lessons";
import { Card, PageHeader } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { LessonForm } from "@/components/lesson-form";
import { BlockEditor } from "@/components/block-editor";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("teacher");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const lesson = await getLesson(id);
  if (!lesson) notFound();

  return (
    <>
      <PageHeader
        title={`Edit · ${lesson.title}`}
        actions={
          <>
            <Link href={`/lessons/${id}`} className={buttonClass({ variant: "outline" })}>
              <Eye className="h-4 w-4" /> View
            </Link>
            <Link href={`/live?lesson=${id}`} className={buttonClass()}>
              <Presentation className="h-4 w-4" /> Present
            </Link>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <LessonForm action={updateLesson.bind(null, id)} lesson={lesson} submitLabel="Save lesson" />
          </Card>
          <form action={deleteLesson.bind(null, id)} className="mt-4">
            <Button variant="danger" size="sm" type="submit">
              Delete this lesson
            </Button>
          </form>
        </div>
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Content · {lesson.blocks.length} blocks</h2>
          <BlockEditor lessonId={id} blocks={lesson.blocks} />
        </div>
      </div>
    </>
  );
}
