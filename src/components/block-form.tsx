"use client";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/fields";
import type { Block } from "@/lib/db/schema";
import { serializeExerciseItems } from "@/lib/exercise-dsl";
import type { ActionState } from "@/lib/action-state";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const EXAMPLE = `# One item per line. Gaps use ___ and the answer comes after =>
She ___ (live) in Lisbon since 2019. => has lived || present perfect
We ___ (go) out last night. => went / did go
? Which sounds natural? | I'm agree | I agree | I am agreeing => 2`;

export function BlockForm({ action, block, kind }: { action: Action; block?: Block; kind?: "slide" | "exercise" }) {
  const resolvedKind = block?.kind ?? kind ?? "slide";
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast.success(block ? "Block updated" : "Block added");
      if (!block) formRef.current?.reset();
    }
  }, [state, block]);

  const data = block?.data;
  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="kind" value={resolvedKind} />
      <Field label={resolvedKind === "slide" ? "Slide title" : "Exercise title"}>
        <Input name="title" defaultValue={data?.title} required />
      </Field>
      {resolvedKind === "slide" ? (
        <Field label="Body (markdown)" hint="Headings, lists, **bold**, tables and links all work. Keep slides short.">
          <Textarea name="body" defaultValue={data?.kind === "slide" ? data.body : ""} className="min-h-40" />
        </Field>
      ) : (
        <>
          <Field label="Instructions (optional)">
            <Input name="instructions" defaultValue={data?.kind === "exercise" ? data.instructions ?? "" : ""} />
          </Field>
          <Field label="Items" hint="Gap-fill: prompt with ___ => answer (|| hint; use / for alternatives). Multiple choice: ? prompt | option | option => number of the right option.">
            <Textarea
              name="items"
              defaultValue={data?.kind === "exercise" ? serializeExerciseItems(data.items) : ""}
              placeholder={EXAMPLE}
              className="min-h-44"
            />
          </Field>
        </>
      )}
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : block ? "Save changes" : `Add ${resolvedKind}`}
      </Button>
    </form>
  );
}
