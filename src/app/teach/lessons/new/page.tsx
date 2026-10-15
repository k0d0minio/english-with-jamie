import { requireRole } from "@/lib/auth";
import { createLesson } from "@/actions/lessons";
import { Card, PageHeader } from "@/components/ui/card";
import { LessonForm } from "@/components/lesson-form";

export default async function NewLessonPage() {
  await requireRole("teacher");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New lesson" lead="Set the frame first; you add slides and exercises on the next screen." />
      <Card>
        <LessonForm action={createLesson} submitLabel="Create lesson" />
      </Card>
    </div>
  );
}
