"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";
import { useLive } from "@/components/use-live";
import { ExerciseStage, SlideView } from "@/components/block-view";
import { SlideArt } from "@/components/slide-art";
import { Exercise } from "@/components/exercise";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import type { LiveSnapshot } from "@/lib/live";

export function LiveStudent({ initial }: { initial: LiveSnapshot }) {
  const { snap, offline } = useLive(initial, 1500);
  // In follow mode the teacher's index wins; in free mode the student keeps their own place,
  // starting from wherever the teacher was when the mode changed.
  const [tracked, setTracked] = useState({ version: snap.version, index: snap.blockIndex });
  if (tracked.version !== snap.version) {
    setTracked({ version: snap.version, index: snap.mode === "follow" ? snap.blockIndex : tracked.index });
  }
  const localIndex = snap.mode === "follow" ? snap.blockIndex : tracked.index;
  const setLocalIndex = (fn: (i: number) => number) => setTracked((t) => ({ ...t, index: fn(t.index) }));

  if (!snap.lesson) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
        <Radio className="mx-auto mb-4 h-10 w-10 text-muted" />
        <h1 className="text-2xl font-semibold">Waiting for Jamie to start</h1>
        <p className="mt-2 text-muted">This page updates by itself when the lesson begins.</p>
        {offline ? <p className="mt-4 text-sm text-danger">Connection lost, retrying…</p> : null}
      </div>
    );
  }

  const idx = Math.min(localIndex, Math.max(snap.blocks.length - 1, 0));
  const block = snap.blocks[idx];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        <Badge tone="accent">Live</Badge>
        {snap.mode === "free" ? <Badge tone="warm">Explore freely</Badge> : null}
        {offline ? <span className="text-danger">Connection lost, retrying…</span> : null}
      </div>

      {block ? (
        <div key={block.key}>
          {block.data.kind === "slide" ? (
            <SlideView data={block.data} lessonTitle={snap.lesson.title} progress={{ index: idx, total: snap.blocks.length }} />
          ) : (
            <ExerciseStage progress={{ index: idx, total: snap.blocks.length }}>
              <Exercise
                lessonSlug={snap.lesson.slug}
                blockKey={block.key}
                data={block.data}
                big
                aside={block.data.art ? <SlideArt name={block.data.art} className="w-36 md:w-44" /> : null}
              />
            </ExerciseStage>
          )}
        </div>
      ) : (
        <p className="text-muted">This lesson has no content yet.</p>
      )}

      {snap.mode === "free" ? (
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => setLocalIndex((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="outline" onClick={() => setLocalIndex((i) => Math.min(snap.blocks.length - 1, i + 1))} disabled={idx >= snap.blocks.length - 1}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
