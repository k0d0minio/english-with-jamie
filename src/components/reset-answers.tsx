"use client";
import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetAnswers } from "@/actions/answers";
import { Button } from "@/components/ui/button";

/** Clears the student's recorded answers, after a confirm. Omit blockKey to reset the whole lesson. */
export function ResetAnswers({ lessonSlug, blockKey, label, count }: { lessonSlug: string; blockKey?: string; label: string; count: number }) {
  const [pending, start] = useTransition();
  const what = blockKey ? "this exercise" : "this lesson";
  return (
    <Button
      size="sm"
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete the student's ${count} recorded answer${count === 1 ? "" : "s"} for ${what}? This can't be undone.`)) return;
        start(async () => {
          await resetAnswers(lessonSlug, blockKey);
          toast.success(blockKey ? "Exercise reset" : "Lesson reset");
        });
      }}
    >
      <RotateCcw className="h-4 w-4" /> {label}
    </Button>
  );
}
