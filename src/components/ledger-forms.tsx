"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addPaidLessons, deleteLedgerEntry, markLessonTaught } from "@/actions/ledger";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/fields";
import type { ActionState } from "@/lib/action-state";

function useLedgerForm(action: (prev: ActionState, fd: FormData) => Promise<ActionState>, done: string) {
  const [state, run, pending] = useActionState<ActionState, FormData>(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast.success(done);
      ref.current?.reset();
    }
  }, [state, done]);
  return { state, run, pending, ref };
}

/** Teacher: add lessons after verifying a payment. */
export function AddPaidForm({ today }: { today: string }) {
  const { state, run, pending, ref } = useLedgerForm(addPaidLessons, "Lessons added");
  return (
    <form ref={ref} action={run} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lessons">
          <Input name="lessons" type="number" min={1} max={100} defaultValue={10} required />
        </Field>
        <Field label="Paid on">
          <Input name="date" type="date" defaultValue={today} required />
        </Field>
      </div>
      <Field label="Note" hint="Optional. Shown to the student.">
        <Input name="note" placeholder="Bundle of 10" maxLength={200} />
      </Field>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add paid lessons"}
      </Button>
    </form>
  );
}

/** Teacher: use up one lesson. Lesson titles are offered as note suggestions. */
export function MarkTaughtForm({ today, lessonTitles }: { today: string; lessonTitles: string[] }) {
  const { state, run, pending, ref } = useLedgerForm(markLessonTaught, "Lesson marked as completed");
  return (
    <form ref={ref} action={run} className="space-y-3">
      <Field label="Taught on">
        <Input name="date" type="date" defaultValue={today} required />
      </Field>
      <Field label="Lesson" hint="Optional. Shown to the student.">
        <Input name="note" list="ledger-lesson-titles" placeholder="Meet Ottawa" maxLength={200} />
        <datalist id="ledger-lesson-titles">
          {lessonTitles.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Field>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" variant="warm" disabled={pending}>
        {pending ? "Saving…" : "Mark one lesson completed"}
      </Button>
    </form>
  );
}

export function DeleteLedgerEntry({ id, what }: { id: number; what: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="icon"
      variant="danger"
      disabled={pending}
      aria-label={`Delete ${what}`}
      title="Delete entry"
      onClick={() => {
        if (!confirm(`Delete "${what}"? The balance will be recalculated.`)) return;
        start(async () => {
          await deleteLedgerEntry(id);
          toast.success("Entry deleted");
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
