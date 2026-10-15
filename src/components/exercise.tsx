"use client";
import { useState, useTransition, type ReactNode } from "react";
import { Check, Lightbulb, RotateCcw, Sparkles, X } from "lucide-react";
import { submitAnswer } from "@/actions/answers";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/fields";
import { shuffleOrder } from "@/lib/exercise-dsl";
import type { ExerciseData, ExerciseItem, MatchItem, OrderItem } from "@/lib/lesson-types";
import { cn } from "@/lib/utils";

export type SavedAnswer = { response: string; correct: boolean; attempts: number };
type ItemState = {
  response: string;
  status: "idle" | "correct" | "wrong";
  attempts: number;
  reveal?: string;
  hint?: boolean;
  /** order: original step indices in the order she tapped them */
  picks: number[];
  /** match: for each left, the original index of the right she chose */
  matches: (number | null)[];
};

const KIND_LABEL: Record<ExerciseItem["kind"], string> = {
  cloze: "Fill the gap",
  mc: "Pick one",
  order: "Put in order",
  match: "Match them up",
  poll: "Your call",
};

function initialState(item: ExerciseItem, s?: SavedAnswer): ItemState {
  const solved = s?.correct ? s.response.split(",").map(Number) : [];
  return {
    response: s?.response ?? "",
    status: s ? (s.correct ? "correct" : "wrong") : "idle",
    attempts: s?.attempts ?? 0,
    picks: item.kind === "order" ? solved : [],
    matches: item.kind === "match" ? (solved.length ? solved : item.pairs.map(() => null)) : [],
  };
}

export function Exercise({
  lessonSlug,
  blockKey,
  data,
  saved = {},
  readOnly = false,
  big = false,
  aside,
}: {
  lessonSlug: string;
  blockKey: string;
  data: ExerciseData;
  saved?: Record<number, SavedAnswer>;
  readOnly?: boolean;
  big?: boolean;
  /** Shown beside the title, e.g. the quiz illustration on the live stage. */
  aside?: ReactNode;
}) {
  const [state, setState] = useState<Record<number, ItemState>>(() => Object.fromEntries(data.items.map((item, i) => [i, initialState(item, saved[i])])));
  const [pending, start] = useTransition();

  const patch = (i: number, p: Partial<ItemState>) => setState((s) => ({ ...s, [i]: { ...s[i], ...p } }));

  function submit(i: number, response: string) {
    if (readOnly || !response.trim()) return;
    patch(i, { response });
    start(async () => {
      const r = await submitAnswer(lessonSlug, blockKey, i, response);
      patch(i, { response, status: r.correct ? "correct" : "wrong", attempts: r.attempts, reveal: r.reveal });
    });
  }

  const done = data.items.filter((_, i) => state[i].status === "correct").length;

  return (
    <div className={cn(big && "text-lg")}>
      <div className={cn("flex items-center gap-6", big ? "mb-8" : "mb-4")}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className={cn("font-semibold tracking-tight text-balance", big ? "text-4xl md:text-[2.75rem] leading-[1.05]" : "text-xl")}>{data.title}</h2>
            <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums", done === data.items.length ? "bg-ok-soft text-ok" : "bg-line/70 text-muted")}>
              {done}/{data.items.length}
            </span>
          </div>
          {data.instructions ? <p className={cn("text-muted", big ? "mt-3 max-w-2xl" : "mt-2")}>{data.instructions}</p> : null}
        </div>
        {aside ? <div className="hidden shrink-0 sm:block">{aside}</div> : null}
      </div>
      <ol className="space-y-4">
        {data.items.map((item, i) => {
          const st = state[i];
          const poll = item.kind === "poll";
          const tone =
            st.status === "correct"
              ? poll
                ? "border-accent/40 bg-accent-soft/40"
                : "border-ok/50 bg-ok-soft/40"
              : st.status === "wrong"
                ? "border-danger/40 bg-red-50/60"
                : "border-line bg-card";
          const note = item.kind !== "cloze" ? item.note : undefined;
          const props = { item, st, i, big, readOnly, pending, patch, submit };
          return (
            <li key={i} className={cn("rounded-xl border p-4 transition-colors", big && "p-5", st.status === "correct" && "pop-in", tone)}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-muted">{i + 1}.</span>
                <div className="min-w-0 flex-1 space-y-3">
                  {item.kind !== "cloze" && item.kind !== "mc" ? (
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted">{KIND_LABEL[item.kind]}</p>
                  ) : null}
                  {item.kind === "cloze" ? <Cloze {...props} item={item} /> : null}
                  {item.kind === "mc" || item.kind === "poll" ? <Choice {...props} item={item} /> : null}
                  {item.kind === "order" ? <Order {...props} item={item} /> : null}
                  {item.kind === "match" ? <Match {...props} item={item} /> : null}

                  {st.status === "correct" ? (
                    <p className={cn("flex items-center gap-1 text-sm font-medium", poll ? "text-accent-strong" : "text-ok")}>
                      <Check className="h-4 w-4" />
                      {poll ? "Your pick. Tell Jamie why." : `Correct${st.attempts > 1 ? ` (${st.attempts} tries)` : ""}`}
                    </p>
                  ) : st.status === "wrong" ? (
                    <p className="flex flex-wrap items-center gap-1 text-sm text-danger">
                      <X className="h-4 w-4" /> Not quite{st.attempts > 1 ? ` (${st.attempts} tries)` : ""}
                      {st.reveal ? <span className="ml-2 text-muted">Answer: {st.reveal}</span> : null}
                    </p>
                  ) : null}
                  {note && (st.status === "correct" || st.reveal) ? (
                    <div className="flex gap-2 rounded-lg bg-warm-soft/70 px-3 py-2 text-sm">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warm" />
                      <Markdown className="prose-sm">{note}</Markdown>
                    </div>
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

type PartProps<T extends ExerciseItem> = {
  item: T;
  st: ItemState;
  i: number;
  big: boolean;
  readOnly: boolean;
  pending: boolean;
  patch: (i: number, p: Partial<ItemState>) => void;
  submit: (i: number, response: string) => void;
};

function Cloze({ item, st, i, readOnly, pending, patch, submit }: PartProps<Extract<ExerciseItem, { kind: "cloze" }>>) {
  return (
    <>
      <p className="leading-relaxed">
        {item.prompt.split("___").map((part, k, arr) => (
          <span key={k}>
            {part}
            {k < arr.length - 1 ? (
              <span className="mx-1 inline-block min-w-24 border-b-2 border-dotted border-accent/60 text-center font-medium text-accent-strong">
                {st.status === "correct" ? st.response : " "}
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
            submit(i, st.response);
          }}
        >
          <Input className="max-w-xs" value={st.response} onChange={(e) => patch(i, { response: e.target.value })} placeholder="Your answer" autoComplete="off" />
          <Button type="submit" size="sm" disabled={pending}>
            Check
          </Button>
          {item.hint ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => patch(i, { hint: !st.hint })}>
              <Lightbulb className="h-4 w-4" /> Hint
            </Button>
          ) : null}
        </form>
      ) : null}
      {st.hint && item.hint ? <p className="text-sm text-muted">Hint: {item.hint}</p> : null}
    </>
  );
}

function Choice({ item, st, i, big, readOnly, pending, submit }: PartProps<Extract<ExerciseItem, { kind: "mc" | "poll" }>>) {
  const poll = item.kind === "poll";
  // Two short options (True / Not true) read better as big side-by-side buttons.
  const binary = item.options.length === 2;
  return (
    <>
      <p className="leading-relaxed">{item.prompt}</p>
      <div className={cn("grid gap-2", binary ? "grid-cols-2" : "sm:grid-cols-2")}>
        {item.options.map((opt, k) => {
          const chosen = st.response === String(k);
          return (
            <button
              key={k}
              type="button"
              disabled={readOnly || pending || (!poll && st.status === "correct")}
              onClick={() => submit(i, String(k))}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                big && "px-4 py-3 text-base",
                binary && "text-center font-semibold",
                chosen && st.status === "correct" && (poll ? "border-accent bg-accent-soft" : "border-ok bg-ok-soft"),
                chosen && st.status === "wrong" && "border-danger bg-red-50",
                !chosen && "border-line bg-card hover:border-accent/60",
              )}
            >
              {binary ? null : <span className="mr-2 font-mono text-xs text-muted">{String.fromCharCode(65 + k)}</span>}
              {opt}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Order({ item, st, i, big, readOnly, pending, patch, submit }: PartProps<OrderItem>) {
  const shuffled = shuffleOrder(item.steps.length, item.prompt);
  const solved = st.status === "correct";
  const left = shuffled.filter((k) => !st.picks.includes(k));
  const tap = (k: number) => {
    const picks = [...st.picks, k];
    patch(i, { picks, status: "idle" });
    if (picks.length === item.steps.length) submit(i, picks.join(","));
  };
  return (
    <>
      <p className="leading-relaxed">{item.prompt}</p>
      {st.picks.length ? (
        <ol className="space-y-1.5">
          {st.picks.map((k, n) => (
            <li key={k} className={cn("flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm", big && "text-base", solved ? "border-ok/50" : "border-accent/40")}>
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", solved ? "bg-ok" : "bg-accent")}>{n + 1}</span>
              {item.steps[k]}
            </li>
          ))}
        </ol>
      ) : null}
      {!solved && left.length ? (
        <div className="flex flex-wrap gap-2">
          {left.map((k) => (
            <button
              key={k}
              type="button"
              disabled={readOnly || pending}
              onClick={() => tap(k)}
              className={cn("rounded-full border border-dashed border-accent/60 bg-card px-3 py-1.5 text-sm hover:border-solid hover:bg-accent-soft", big && "px-4 py-2 text-base")}
            >
              {item.steps[k]}
            </button>
          ))}
        </div>
      ) : null}
      {!solved && st.picks.length && !readOnly ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => patch(i, { picks: [], status: "idle" })}>
          <RotateCcw className="h-4 w-4" /> Start again
        </Button>
      ) : null}
    </>
  );
}

function Match({ item, st, i, big, readOnly, pending, patch, submit }: PartProps<MatchItem>) {
  const rights = shuffleOrder(item.pairs.length, item.prompt);
  const solved = st.status === "correct";
  const ready = st.matches.every((m) => m !== null);
  return (
    <>
      <p className="leading-relaxed">{item.prompt}</p>
      <div className="space-y-2">
        {item.pairs.map(([l], row) => (
          <div key={row} className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <span className={cn("font-medium", big ? "text-base" : "text-sm")}>{l}</span>
            <Select
              value={st.matches[row] ?? ""}
              disabled={readOnly || pending || solved}
              onChange={(e) => {
                const matches = [...st.matches];
                matches[row] = e.target.value === "" ? null : Number(e.target.value);
                patch(i, { matches, status: "idle" });
              }}
              className={cn(big && "h-11 text-base", solved && "border-ok/60 bg-ok-soft/40")}
            >
              <option value="">Choose…</option>
              {rights.map((k) => (
                <option key={k} value={k}>
                  {item.pairs[k][1]}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>
      {!solved && !readOnly ? (
        <Button type="button" size="sm" disabled={!ready || pending} onClick={() => submit(i, st.matches.join(","))}>
          Check
        </Button>
      ) : null}
    </>
  );
}
