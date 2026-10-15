"use client";
import { useState, useTransition } from "react";
import { Check, Lightbulb, X } from "lucide-react";
import { submitAnswer } from "@/actions/answers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import type { ExerciseData } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export type SavedAnswer = { response: string; correct: boolean; attempts: number };
type ItemState = { response: string; status: "idle" | "correct" | "wrong"; attempts: number; reveal?: string; hint?: boolean };

export function Exercise({
  blockId,
  data,
  saved = {},
  readOnly = false,
  big = false,
}: {
  blockId: number;
  data: ExerciseData;
  saved?: Record<number, SavedAnswer>;
  readOnly?: boolean;
  big?: boolean;
}) {
  const [state, setState] = useState<Record<number, ItemState>>(() =>
    Object.fromEntries(
      data.items.map((_, i) => {
        const s = saved[i];
        return [i, { response: s?.response ?? "", status: s ? (s.correct ? "correct" : "wrong") : "idle", attempts: s?.attempts ?? 0 }];
      }),
    ),
  );
  const [pending, start] = useTransition();

  function check(i: number) {
    const current = state[i];
    if (!current.response.trim()) return;
    start(async () => {
      const r = await submitAnswer(blockId, i, current.response);
      setState((s) => ({ ...s, [i]: { ...s[i], status: r.correct ? "correct" : "wrong", attempts: r.attempts, reveal: r.reveal } }));
    });
  }

  const done = data.items.filter((_, i) => state[i].status === "correct").length;

  return (
    <div className={cn(big && "text-lg")}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className={cn("font-semibold tracking-tight", big ? "text-3xl" : "text-xl")}>{data.title}</h2>
        <span className="text-sm text-muted">
          {done}/{data.items.length}
        </span>
      </div>
      {data.instructions ? <p className="mb-4 text-muted">{data.instructions}</p> : null}
      <ol className="space-y-4">
        {data.items.map((item, i) => {
          const st = state[i];
          const tone = st.status === "correct" ? "border-ok/50 bg-ok-soft/40" : st.status === "wrong" ? "border-danger/40 bg-red-50/60" : "border-line bg-card";
          return (
            <li key={i} className={cn("rounded-lg border p-4 transition-colors", tone)}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-muted">{i + 1}.</span>
                <div className="flex-1 space-y-3">
                  {item.kind === "cloze" ? (
                    <>
                      <p className="leading-relaxed">
                        {item.prompt.split("___").map((part, k, arr) => (
                          <span key={k}>
                            {part}
                            {k < arr.length - 1 ? (
                              <span className="mx-1 inline-block min-w-24 border-b-2 border-dotted border-accent/60 text-center font-medium text-accent-strong">
                                {st.status === "correct" ? st.response : " "}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </p>
                      {st.status !== "correct" && !readOnly ? (
                        <form
                          className="flex flex-wrap items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            check(i);
                          }}
                        >
                          <Input
                            className="max-w-xs"
                            value={st.response}
                            onChange={(e) => setState((s) => ({ ...s, [i]: { ...s[i], response: e.target.value } }))}
                            placeholder="Your answer"
                            autoComplete="off"
                          />
                          <Button type="submit" size="sm" disabled={pending}>
                            Check
                          </Button>
                          {item.hint ? (
                            <Button type="button" size="sm" variant="ghost" onClick={() => setState((s) => ({ ...s, [i]: { ...s[i], hint: !s[i].hint } }))}>
                              <Lightbulb className="h-4 w-4" /> Hint
                            </Button>
                          ) : null}
                        </form>
                      ) : null}
                      {st.hint && item.hint ? <p className="text-sm text-muted">Hint: {item.hint}</p> : null}
                    </>
                  ) : (
                    <>
                      <p className="leading-relaxed">{item.prompt}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.options.map((opt, k) => {
                          const chosen = st.response === String(k);
                          return (
                            <button
                              key={k}
                              type="button"
                              disabled={readOnly || st.status === "correct" || pending}
                              onClick={() => {
                                setState((s) => ({ ...s, [i]: { ...s[i], response: String(k) } }));
                                start(async () => {
                                  const r = await submitAnswer(blockId, i, String(k));
                                  setState((s) => ({ ...s, [i]: { ...s[i], response: String(k), status: r.correct ? "correct" : "wrong", attempts: r.attempts, reveal: r.reveal } }));
                                });
                              }}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                                chosen && st.status === "correct" && "border-ok bg-ok-soft",
                                chosen && st.status === "wrong" && "border-danger bg-red-50",
                                !chosen && "border-line bg-card hover:border-accent/60",
                              )}
                            >
                              <span className="mr-2 font-mono text-xs text-muted">{String.fromCharCode(65 + k)}</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {st.status === "correct" ? (
                    <p className="flex items-center gap-1 text-sm font-medium text-ok">
                      <Check className="h-4 w-4" /> Correct{st.attempts > 1 ? ` (${st.attempts} tries)` : ""}
                    </p>
                  ) : st.status === "wrong" ? (
                    <p className="flex items-center gap-1 text-sm text-danger">
                      <X className="h-4 w-4" /> Not quite{st.attempts > 1 ? ` (${st.attempts} tries)` : ""}
                      {st.reveal ? <span className="ml-2 text-muted">Answer: {st.reveal}</span> : null}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
