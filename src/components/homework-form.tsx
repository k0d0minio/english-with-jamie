"use client";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createHomework } from "@/actions/homework";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import type { ActionState } from "@/lib/action-state";

export function HomeworkForm({ lessons }: { lessons: { id: number; title: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createHomework, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast.success("Homework assigned");
      formRef.current?.reset();
    }
  }, [state]);
  return (
    <form ref={formRef} action={action} className="space-y-3">
      <Field label="Title">
        <Input name="title" required placeholder="e.g. Watch one episode and note 5 new phrases" />
      </Field>
      <Field label="Details (markdown, optional)">
        <Textarea name="details" className="min-h-24 font-sans text-sm" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Due">
          <Input type="date" name="dueDate" />
        </Field>
        <Field label="Lesson (optional)">
          <Select name="lessonId" defaultValue="">
            <option value="">—</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Assign"}
      </Button>
    </form>
  );
}
