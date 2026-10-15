import { requireRole } from "@/lib/auth";
import { listHomework, listLessons } from "@/lib/queries";
import { deleteHomework, toggleHomework } from "@/actions/homework";
import { Card, Empty, PageHeader } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { HomeworkForm } from "@/components/homework-form";
import { cn, formatDate, todayISO } from "@/lib/utils";
import { Check, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomeworkPage() {
  const role = await requireRole();
  const [items, lessons] = await Promise.all([listHomework(), role === "teacher" ? listLessons() : Promise.resolve([])]);
  const open = items.filter((h) => !h.done);
  const done = items.filter((h) => h.done);
  const today = todayISO();

  const Row = ({ h }: { h: (typeof items)[number] }) => (
    <li className="flex gap-3 py-3">
      <form action={toggleHomework.bind(null, h.id)}>
        <button
          type="submit"
          aria-label={h.done ? "Mark as not done" : "Mark as done"}
          className={cn(
            "mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
            h.done ? "border-ok bg-ok text-white" : "border-line bg-card hover:border-accent",
          )}
        >
          {h.done ? <Check className="h-4 w-4" /> : null}
        </button>
      </form>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className={cn("font-medium", h.done && "text-muted line-through")}>{h.title}</span>
          {h.dueDate ? (
            <span className={cn("text-xs", !h.done && h.dueDate < today ? "font-semibold text-danger" : "text-muted")}>due {formatDate(h.dueDate)}</span>
          ) : null}
        </div>
        {h.details ? <Markdown className="prose-sm mt-1 text-muted">{h.details}</Markdown> : null}
      </div>
      {role === "teacher" ? (
        <form action={deleteHomework.bind(null, h.id)}>
          <button type="submit" className="rounded-md p-1 text-muted hover:text-danger" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      ) : null}
    </li>
  );

  return (
    <>
      <PageHeader title="Homework" lead={role === "teacher" ? "Assign, tick off, and see what's overdue." : "Tick things off as you finish them."} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">To do</h2>
            {open.length ? <ul className="divide-y divide-line">{open.map((h) => <Row key={h.id} h={h} />)}</ul> : <p className="py-3 text-sm text-muted">All clear.</p>}
          </Card>
          {done.length ? (
            <Card>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Done</h2>
              <ul className="divide-y divide-line">{done.map((h) => <Row key={h.id} h={h} />)}</ul>
            </Card>
          ) : null}
          {!items.length ? <Empty>No homework yet.</Empty> : null}
        </div>
        {role === "teacher" ? (
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Assign</h2>
            <HomeworkForm lessons={lessons.map((l) => ({ id: l.id, title: l.title }))} />
          </Card>
        ) : null}
      </div>
    </>
  );
}
