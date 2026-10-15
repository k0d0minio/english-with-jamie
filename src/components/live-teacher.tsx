"use client";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Lock, Square, Unlock } from "lucide-react";
import { gotoBlock, setLiveMode, startLive, stopLive } from "@/actions/live";
import { useLive } from "@/components/use-live";
import { SlideView } from "@/components/block-view";
import { Exercise } from "@/components/exercise";
import { AnswersTable } from "@/components/answers-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { Badge, Card } from "@/components/ui/card";
import type { LiveSnapshot } from "@/lib/live";
import type { Answer } from "@/lib/db/schema";
import { cn, formatDate } from "@/lib/utils";

type LessonOption = { id: number; title: string; status: string; scheduledFor: string | null };

export function LiveTeacher({ initial, lessons }: { initial: LiveSnapshot; lessons: LessonOption[] }) {
  const { snap, refresh } = useLive(initial, 2000);
  const [pending, start] = useTransition();
  const [answerSet, setAnswerSet] = useState<{ blockId: number; rows: Answer[] } | null>(null);
  const [showExercise, setShowExercise] = useState(false);
  const block = snap.block;

  // Poll the student's answers for the current exercise.
  const answers = answerSet && block && answerSet.blockId === block.id ? answerSet.rows : [];
  useEffect(() => {
    if (!block || block.data.kind !== "exercise") return;
    let alive = true;
    const blockId = block.id;
    const load = async () => {
      const res = await fetch(`/api/live/answers?blockId=${blockId}`, { cache: "no-store" });
      if (res.ok && alive) setAnswerSet({ blockId, rows: (await res.json()).answers ?? [] });
    };
    load();
    const id = setInterval(load, 2000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [block]);

  const act = (fn: () => Promise<void>) => start(async () => { await fn(); await refresh(); });
  const go = (i: number) => act(() => gotoBlock(i));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" && snap.blockIndex < snap.total - 1) go(snap.blockIndex + 1);
      if (e.key === "ArrowLeft" && snap.blockIndex > 0) go(snap.blockIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.blockIndex, snap.total]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="space-y-4 lg:col-span-1">
        <Card>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Lesson</h2>
          <Select
            value={snap.lesson?.id ?? ""}
            disabled={pending}
            onChange={(e) => {
              const id = Number(e.target.value);
              if (id) act(() => startLive(id));
            }}
          >
            <option value="">— choose a lesson —</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
                {l.scheduledFor ? ` · ${formatDate(l.scheduledFor)}` : ""}
                {l.status === "draft" ? " (draft)" : ""}
              </option>
            ))}
          </Select>
          {snap.lesson ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={snap.mode === "follow" ? "default" : "outline"}
                disabled={pending}
                onClick={() => act(() => setLiveMode(snap.mode === "follow" ? "free" : "follow"))}
                title="Follow: the student sees what you see. Free: the student can move around the lesson."
              >
                {snap.mode === "follow" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                {snap.mode === "follow" ? "Following you" : "Free to explore"}
              </Button>
              <Button size="sm" variant="danger" disabled={pending} onClick={() => act(stopLive)}>
                <Square className="h-4 w-4" /> End
              </Button>
            </div>
          ) : null}
        </Card>

        {snap.lesson ? (
          <Card className="p-2">
            <ol className="space-y-0.5">
              {snap.blocks.map((b, i) => (
                <li key={b.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => go(i)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                      i === snap.blockIndex ? "bg-accent-soft text-accent-strong" : "hover:bg-line/60",
                    )}
                  >
                    <span className="w-5 text-xs text-muted">{i + 1}</span>
                    <span className="truncate">{b.data.title}</span>
                    {b.kind === "exercise" ? <Badge tone="accent" className="ml-auto">ex</Badge> : null}
                  </button>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}
      </div>

      <div className="lg:col-span-3">
        {snap.lesson && block ? (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-muted">
              <span>
                <span className="font-medium text-ink">{snap.lesson.title}</span> · {snap.blockIndex + 1} / {snap.total}
              </span>
              <span className="flex gap-2">
                <Button size="sm" variant="outline" disabled={pending || snap.blockIndex === 0} onClick={() => go(snap.blockIndex - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={pending || snap.blockIndex >= snap.total - 1} onClick={() => go(snap.blockIndex + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </span>
            </div>
            <div className="rounded-lg border border-line bg-card p-8 md:p-10">
              {block.data.kind === "slide" ? (
                <SlideView data={block.data} big />
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{block.data.title}</h2>
                    <Button size="sm" variant="ghost" onClick={() => setShowExercise((s) => !s)}>
                      {showExercise ? "Show answers" : "Show as student sees it"}
                    </Button>
                  </div>
                  {showExercise ? <Exercise key={block.id} blockId={block.id} data={block.data} readOnly /> : <AnswersTable data={block.data} answers={answers} />}
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-muted">Arrow keys move between blocks.</p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line p-16 text-center text-muted">Pick a lesson to go live. The student&apos;s screen follows you.</div>
        )}
      </div>
    </div>
  );
}
