import type { ReactNode } from "react";
import { Markdown } from "@/components/markdown";
import { SlideArt } from "@/components/slide-art";
import type { SlideData, SlideLayout } from "@/lib/lesson-types";
import { cn } from "@/lib/utils";

// One stage for every block in every lesson: the same frame, header strip and progress
// bar, so a new lesson looks like the same course. Layouts only change what goes inside.

export type Progress = { index: number; total: number };
type Tone = SlideLayout | "quiz";

const surface: Record<Tone, string> = {
  cover: "stage-cover border-accent-strong bg-accent-strong text-white",
  split: "border-line bg-card",
  cards: "border-line bg-paper",
  talk: "stage-talk border-warm/30 bg-warm-soft",
  plain: "border-line bg-card",
  quiz: "border-line bg-card",
};

export function Stage({
  tone,
  kicker,
  progress,
  compact = false,
  children,
}: {
  tone: Tone;
  kicker?: string;
  progress?: Progress;
  compact?: boolean;
  children: ReactNode;
}) {
  const dark = tone === "cover";
  return (
    <div
      className={cn(
        "stage relative isolate flex flex-col overflow-hidden rounded-[1.75rem] border",
        `stage-${tone}`,
        compact ? "stage-compact" : "min-h-[min(36rem,72vh)]",
        surface[tone],
      )}
    >
      {/* soft light in the corner; the cover gets a stronger one */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full blur-3xl",
          dark ? "bg-white/10" : tone === "talk" ? "bg-white/50" : "bg-accent-soft/70",
        )}
      />
      {kicker || progress ? (
        <div
          className={cn(
            "flex items-center justify-between gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
            compact ? "px-5 pt-4" : "px-8 pt-6 md:px-12",
            dark ? "text-white/70" : "text-muted",
          )}
        >
          <span className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", dark ? "bg-[var(--art-amber)]" : tone === "quiz" ? "bg-maple" : "bg-accent")} />
            {kicker}
          </span>
          {progress ? (
            <span className="tabular-nums">
              {progress.index + 1} / {progress.total}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={cn("flex flex-1 flex-col", compact ? "p-5" : "px-8 pb-8 pt-5 md:px-12 md:pb-10")}>{children}</div>
      {progress && !compact ? (
        <div className="flex gap-1 px-8 pb-6 md:px-12" aria-hidden>
          {Array.from({ length: progress.total }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-500",
                i < progress.index ? (dark ? "bg-white/60" : "bg-accent") : i === progress.index ? "bg-[var(--art-amber)]" : dark ? "bg-white/15" : "bg-line",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const titleSize = (layout: SlideLayout, compact: boolean) =>
  compact ? (layout === "cover" ? "text-3xl" : "text-2xl") : layout === "cover" ? "text-5xl md:text-6xl" : "text-4xl md:text-[2.75rem]";

export function SlideView({
  data,
  lessonTitle,
  progress,
  compact = false,
}: {
  data: SlideData;
  lessonTitle?: string;
  progress?: Progress;
  compact?: boolean;
}) {
  const layout = data.layout ?? (data.art ? "split" : "plain");
  const kicker = data.kicker ?? (layout === "talk" ? "Your turn" : lessonTitle);
  const heading = <h2 className={cn("font-semibold leading-[1.05] tracking-tight text-balance", titleSize(layout, compact))}>{data.title}</h2>;
  const title = data.stat ? (
    <div className="space-y-3">
      <span
        className={cn(
          "inline-block rounded-2xl px-4 py-1 font-bold tabular-nums tracking-tight",
          compact ? "text-xl" : "text-3xl md:text-4xl",
          layout === "cover" ? "bg-white/15 text-[var(--art-amber)]" : "bg-warm-soft text-warm",
        )}
      >
        {data.stat}
      </span>
      {heading}
    </div>
  ) : (
    heading
  );
  const body = data.body ? <Markdown>{data.body}</Markdown> : null;
  const art = data.art ? <SlideArt name={data.art} /> : null;
  const sideBySide = (layout === "cover" || layout === "split" || layout === "talk") && art;

  return (
    <Stage tone={layout} kicker={kicker} progress={progress} compact={compact}>
      {sideBySide ? (
        <div className={cn("grid flex-1 items-center gap-8", compact ? "md:grid-cols-[1.5fr_1fr]" : layout === "cover" ? "md:grid-cols-[1.1fr_1fr] md:gap-12" : "md:grid-cols-[1.35fr_1fr] md:gap-10")}>
          <div className="stage-rise space-y-6">
            {title}
            {body}
          </div>
          <div className={cn("stage-rise mx-auto w-full", compact ? "max-w-[15rem]" : layout === "cover" ? "max-w-md" : "max-w-sm")}>{art}</div>
        </div>
      ) : (
        <div className="stage-rise flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between gap-6">
            {title}
            {art ? <div className={cn("hidden shrink-0 sm:block", compact ? "w-28" : "w-40 md:w-48")}>{art}</div> : null}
          </div>
          {body}
        </div>
      )}
    </Stage>
  );
}

/** The frame for an exercise: the same stage, with the quiz look. */
export function ExerciseStage({ progress, compact = false, children }: { progress?: Progress; compact?: boolean; children: ReactNode }) {
  return (
    <Stage tone="quiz" kicker="Quiz" progress={progress} compact={compact}>
      {children}
    </Stage>
  );
}
