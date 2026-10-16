"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { saveFormAnswers } from "@/actions/forms";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import type { ActionState } from "@/lib/action-state";
import { isOther, otherLabel, SCALE, type FormAnswers, type FormQuestion, type FormSection } from "@/lib/form-dsl";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-[15px] text-ink placeholder:text-muted/70 focus:outline-2 focus:outline-offset-1 focus:outline-accent disabled:bg-paper";

/** Was this option picked, and what did she type after it if it is a "something else…" option? */
function picked(option: string, answer: string | string[] | undefined): { on: boolean; text: string } {
  const list = answer === undefined ? [] : Array.isArray(answer) ? answer : [answer];
  if (!isOther(option)) return { on: list.includes(option), text: "" };
  const label = otherLabel(option);
  const hit = list.find((a) => a === label || a.startsWith(`${label}: `));
  return { on: !!hit, text: hit && hit !== label ? hit.slice(label.length + 2) : "" };
}

function Question({ q, n, answer, disabled }: { q: FormQuestion; n: number; answer?: string | string[]; disabled: boolean }) {
  const id = `q-${n}`;
  const single = typeof answer === "string" ? answer : "";
  return (
    <li className="rounded-xl border border-line bg-card p-4">
      <div className="flex gap-3">
        <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-muted">{n}.</span>
        <fieldset className="min-w-0 flex-1 space-y-3" disabled={disabled}>
          <legend className="font-medium">
            <label htmlFor={q.kind === "text" || q.kind === "long" ? id : undefined}>{q.prompt}</label>
          </legend>
          {q.help ? <p className="-mt-2 text-sm text-muted">{q.help}</p> : null}

          {q.kind === "text" ? <input id={id} name={q.key} defaultValue={single} maxLength={500} className={cn(field, "h-10")} /> : null}
          {q.kind === "long" ? <textarea id={id} name={q.key} defaultValue={single} maxLength={5000} rows={4} className={cn(field, "leading-relaxed")} /> : null}

          {q.kind === "one" || q.kind === "many" ? (
            <div className="space-y-1.5">
              {q.options.map((o) => {
                const p = picked(o, answer);
                return (
                  <label key={o} className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-lg px-2 py-1.5 hover:bg-paper">
                    <input type={q.kind === "one" ? "radio" : "checkbox"} name={q.key} value={o} defaultChecked={p.on} className="h-4 w-4 accent-[var(--color-accent)]" />
                    <span>{isOther(o) ? otherLabel(o) : o}</span>
                    {isOther(o) ? (
                      <Input name={`${q.key}::other`} defaultValue={p.text} maxLength={500} placeholder="Tell me" className="h-8 min-w-48 flex-1" />
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : null}

          {q.kind === "scale" ? (
            <div>
              <div className="flex gap-2">
                {SCALE.map((v) => (
                  <label key={v} className="flex-1">
                    <input type="radio" name={q.key} value={v} defaultChecked={single === v} className="peer sr-only" />
                    <span className="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-line font-semibold tabular-nums hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                      {v}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>{q.options[0]}</span>
                <span>{q.options[1]}</span>
              </div>
            </div>
          ) : null}
        </fieldset>
      </div>
    </li>
  );
}

/**
 * The form a student fills in on her profile. The teacher sees the same thing read-only
 * (`preview`) with no answers.
 */
export function InfoForm({
  slug,
  sections,
  answers = {},
  submitted = false,
  preview = false,
}: {
  slug: string;
  sections: FormSection[];
  answers?: FormAnswers;
  submitted?: boolean;
  preview?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveFormAnswers.bind(null, slug), undefined);
  useEffect(() => {
    if (state?.ok) toast.success(state.message ?? "Saved");
  }, [state]);

  // Questions are numbered straight through the form, not per section.
  const starts = sections.map((_, i) => sections.slice(0, i).reduce((n, s) => n + s.questions.length, 0));
  return (
    <form action={action} className="space-y-8">
      {sections.map((s, si) => (
        <section key={s.title}>
          <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
          {s.intro ? <Markdown className="prose-sm mt-1 text-muted">{s.intro}</Markdown> : null}
          <ol className="mt-4 space-y-3">
            {s.questions.map((q, qi) => (
              <Question key={q.key} q={q} n={starts[si] + qi + 1} answer={answers[q.key]?.answer} disabled={preview} />
            ))}
          </ol>
        </section>
      ))}
      {preview ? (
        <p className="text-sm text-muted">Preview: this is what the student sees. Only she can fill it in.</p>
      ) : (
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur">
          {submitted ? (
            <Button type="submit" name="intent" value="send" disabled={pending}>
              {pending ? "Saving…" : "Update my answers"}
            </Button>
          ) : (
            <>
              <Button type="submit" name="intent" value="send" disabled={pending}>
                {pending ? "Sending…" : "Send to Jamie"}
              </Button>
              <Button type="submit" name="intent" value="save" variant="outline" disabled={pending}>
                Save for later
              </Button>
            </>
          )}
          <span className="text-sm text-muted">Every question is optional. Skip anything you like.</span>
          {state?.error ? <p className="w-full text-sm text-danger">{state.error}</p> : null}
        </div>
      )}
    </form>
  );
}
