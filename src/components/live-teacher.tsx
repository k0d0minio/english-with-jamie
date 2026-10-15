"use client";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, EyeOff, Lock, Square, Unlock } from "lucide-react";
import { gotoBlock, setLiveMode, startLive, stopLive } from "@/actions/live";
import { useLive } from "@/components/use-live";
import { ExerciseStage, SlideView } from "@/components/block-view";
import { Markdown } from "@/components/markdown";
import { SlideArt } from "@/components/slide-art";
import { Exercise } from "@/components/exercise";
import { AnswersTable } from "@/components/answers-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { Badge, Card } from "@/components/ui/card";
import type { LiveSnapshot } from "@/lib/live";
import type { ItemAnswer } from "@/lib/db/schema";
import { cn, formatDate } from "@/lib/utils";

type LessonOption = { slug: string; title: string; status: string; date: string | null };

export function LiveTeacher({ initial, lessons }: { initial: LiveSnapshot; lessons: LessonOption[] }) {
  const { snap, refresh } = useLive(initial, 2000);
  const [pending, start] = useTransition();
  const [answerSet, setAnswerSet] = useState<{ blockKey: string; rows: ItemAnswer[] } | null>(null);
  const [showExercise, setShowExercise] = useState(false);
  const block = snap.block;

  // Poll the student's answers for the current exercise.
  const answers = answerSet && block && answerSet.blockKey === block.key ? answerSet.rows : [];
  useEffect(() => {
    if (!block || block.data.kind !== "exercise") return;
    let alive = true;
    const blockKey = block.key;
    const lessonSlug = snap.lesson?.slug ?? "";
    const load = async () => {
      const res = await fetch(`/api/live/answers?lesson=${encodeURIComponent(lessonSlug)}&block=${encodeURIComponent(blockKey)}`, { cache: "no-store" });
      if (res.ok && alive) setAnswerSet({ blockKey, rows: (await res.json()).answers ?? [] });
    };
    load();
    const id = setInterval(load, 2000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [block, snap.lesson?.slug]);

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

  const next = snap.blocks[snap.blockIndex + 1];
  const progress = { index: snap.blockIndex, total: snap.total };

  return (
    // Presenting wants the room: on wide screens this view breaks out of the page column.
    <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:relative xl:left-1/2 xl:w-[min(112rem,calc(100vw_-_3rem))] xl:-translate-x-1/2 xl:grid-cols-[15rem_minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        <Card>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Lesson</h2>
          <Select
            value={snap.lesson?.slug ?? ""}
            disabled={pending}
            onChange={(e) => {
              const slug = e.target.value;
              if (slug) act(() => startLive(slug));
            }}
          >
            <option value="">— choose a lesson —</option>
            {lessons.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.title}
                {l.date ? ` · ${formatDate(l.date)}` : ""}
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
                <li key={b.key}>
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

      <div className="min-w-0">
        {snap.lesson && block ? (
          <>
            <div className="mb-3 flex items-center justify-between text-sm text-muted">
              <span>
                <span className="font-medium text-ink">{snap.lesson.title}</span> · {snap.blockIndex + 1} / {snap.total}
              </span>
              <span className="flex gap-2">
                {block.data.kind === "exercise" ? (
                  <Button size="sm" variant="ghost" onClick={() => setShowExercise((s) => !s)}>
                    {showExercise ? "Show answers" : "Show as student sees it"}
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" disabled={pending || snap.blockIndex === 0} onClick={() => go(snap.blockIndex - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={pending || snap.blockIndex >= snap.total - 1} onClick={() => go(snap.blockIndex + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </span>
            </div>
            <div key={block.key}>
              {block.data.kind === "slide" ? (
                <SlideView data={block.data} lessonTitle={snap.lesson.title} progress={progress} />
              ) : showExercise ? (
                <ExerciseStage progress={progress}>
                  <Exercise
                    lessonSlug={snap.lesson.slug}
                    blockKey={block.key}
                    data={block.data}
                    readOnly
                    big
                    aside={block.data.art ? <SlideArt name={block.data.art} className="w-36 md:w-44" /> : null}
                  />
                </ExerciseStage>
              ) : (
                <ExerciseStage progress={progress}>
                  <h2 className="mb-1 text-3xl font-semibold tracking-tight">{block.data.title}</h2>
                  <p className="mb-5 text-sm text-muted">What she answers appears here as she goes.</p>
                  <AnswersTable data={block.data} answers={answers} />
                </ExerciseStage>
              )}
            </div>
            <p className="mt-2 text-xs text-muted">Arrow keys move between blocks.</p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line p-16 text-center text-muted">Pick a lesson to go live. The student&apos;s screen follows you.</div>
        )}
      </div>

      {snap.lesson && block ? (
        <aside className="space-y-4 lg:col-start-2 xl:col-start-auto">
          <Card className="border-warm/30 bg-warm-soft/50">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warm">
              <EyeOff className="h-3.5 w-3.5" /> Your notes · only you see these
            </h2>
            {block.notes ? <Markdown className="prose-sm">{block.notes}</Markdown> : <p className="text-sm text-muted">No notes for this one.</p>}
          </Card>
          {next ? (
            <Card className="py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Up next</h2>
              <p className="mt-1 font-medium">
                {next.data.title}
                {next.kind === "exercise" ? <Badge tone="accent" className="ml-2">quiz</Badge> : null}
              </p>
            </Card>
          ) : null}
          {snap.lesson.teacherNotes ? (
            <Card className="py-3">
              <details>
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">Lesson notes</summary>
                <Markdown className="prose-sm mt-2">{snap.lesson.teacherNotes}</Markdown>
              </details>
            </Card>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
