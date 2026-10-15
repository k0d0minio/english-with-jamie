import { Check } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listHomework, type HomeworkItem } from "@/lib/content";
import { homeworkDoneSet } from "@/lib/queries";
import { toggleHomework } from "@/actions/homework";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { cn, formatDate, todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomeworkPage() {
  const role = await requireRole();
  const student = role === "student";
  const [all, done] = await Promise.all([listHomework(), homeworkDoneSet()]);
  const items = all.filter((h) => !student || !h.draft).sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
  const open = items.filter((h) => !done.has(h.slug));
  const finished = items.filter((h) => done.has(h.slug));
  const today = todayISO();

  const Row = ({ h }: { h: HomeworkItem }) => {
    const isDone = done.has(h.slug);
    return (
      <li className="flex gap-3 py-3">
        <form action={toggleHomework.bind(null, h.slug)}>
          <button
            type="submit"
            aria-label={isDone ? "Mark as not done" : "Mark as done"}
            className={cn(
              "mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
              isDone ? "border-ok bg-ok text-white" : "border-line bg-card hover:border-accent",
            )}
          >
            {isDone ? <Check className="h-4 w-4" /> : null}
          </button>
        </form>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className={cn("font-medium", isDone && "text-muted line-through")}>{h.title}</span>
            {h.draft ? <Badge>draft</Badge> : null}
            {h.due ? (
              <span className={cn("text-xs", !isDone && h.due < today ? "font-semibold text-danger" : "text-muted")}>due {formatDate(h.due)}</span>
            ) : null}
          </div>
          {h.body ? <Markdown className="prose-sm mt-1 text-muted">{h.body}</Markdown> : null}
        </div>
      </li>
    );
  };

  return (
    <>
      <PageHeader title="Homework" lead={student ? "Tick things off as you finish them." : "Set in the homework studio; tick off here. Drafts are only visible to you."} />
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">To do</h2>
          {open.length ? <ul className="divide-y divide-line">{open.map((h) => <Row key={h.slug} h={h} />)}</ul> : <p className="py-3 text-sm text-muted">All clear.</p>}
        </Card>
        {finished.length ? (
          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Done</h2>
            <ul className="divide-y divide-line">{finished.map((h) => <Row key={h.slug} h={h} />)}</ul>
          </Card>
        ) : null}
        {!items.length ? <Empty>No homework yet.</Empty> : null}
      </div>
    </>
  );
}
