"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import type { Lesson } from "@/lib/db/schema";
import type { ActionState } from "@/lib/action-state";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function LessonForm({ action, lesson, submitLabel }: { action: Action; lesson?: Lesson; submitLabel: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  useEffect(() => {
    if (state?.ok) toast.success("Saved");
  }, [state]);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Title">
        <Input name="title" defaultValue={lesson?.title} required placeholder="e.g. Arriving: meeting the host family" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <Input type="date" name="scheduledFor" defaultValue={lesson?.scheduledFor ?? ""} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={lesson?.status ?? "draft"}>
            <option value="draft">Draft (hidden from student)</option>
            <option value="scheduled">Scheduled</option>
            <option value="done">Done</option>
          </Select>
        </Field>
      </div>
      <Field label="Summary" hint="Shown to the student on the dashboard and lesson list.">
        <Textarea name="summary" defaultValue={lesson?.summary} className="min-h-20 font-sans text-sm" />
      </Field>
      <Field label="Teacher notes" hint="Only you see these: aims, timing, things to listen for.">
        <Textarea name="teacherNotes" defaultValue={lesson?.teacherNotes} className="font-sans text-sm" />
      </Field>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
