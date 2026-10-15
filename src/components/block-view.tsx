import { Markdown } from "@/components/markdown";
import type { SlideData } from "@/lib/lesson-types";
import { cn } from "@/lib/utils";

export function SlideView({ data, big = false }: { data: SlideData; big?: boolean }) {
  return (
    <div className={cn(big && "slide")}>
      <h2 className={cn("font-semibold tracking-tight", big ? "mb-6 text-4xl" : "mb-3 text-xl")}>{data.title}</h2>
      {data.body ? <Markdown>{data.body}</Markdown> : null}
    </div>
  );
}
