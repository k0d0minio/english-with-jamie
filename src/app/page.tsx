import Link from "next/link";
import { ArrowRight, Presentation } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCurrentLesson, listHomework } from "@/lib/queries";
import { getLiveSnapshot } from "@/lib/live";
import { Badge, Card, Empty } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { grammarTopics } from "@/content/grammar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const role = await requireRole();
  const [lesson, homework, live] = await Promise.all([getCurrentLesson(), listHomework(), getLiveSnapshot()]);
  const open = homework.filter((h) => !h.done).slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {live.lesson ? (
          <Link href="/live" className="flex items-center justify-between rounded-lg bg-accent px-5 py-4 text-white hover:bg-accent-strong">
            <span className="flex items-center gap-3">
              <Presentation className="h-5 w-5" />
              <span>
                <span className="block text-xs uppercase tracking-wide opacity-80">Live now</span>
                <span className="font-semibold">{live.lesson.title}</span>
              </span>
            </span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        ) : null}

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{role === "teacher" ? "Up next" : "Your next lesson"}</h2>
            {lesson?.scheduledFor ? <Badge tone="accent">{formatDate(lesson.scheduledFor)}</Badge> : null}
          </div>
          {lesson ? (
            <>
              <h3 className="text-2xl font-semibold tracking-tight">{lesson.title}</h3>
              {lesson.summary ? <p className="mt-2 text-muted">{lesson.summary}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/lessons/${lesson.id}`} className={buttonClass({ variant: "outline", size: "sm" })}>
                  Open lesson
                </Link>
                {role === "teacher" ? (
                  <>
                    <Link href={`/teach/lessons/${lesson.id}`} className={buttonClass({ variant: "ghost", size: "sm" })}>
                      Edit
                    </Link>
                    <Link href={`/live?lesson=${lesson.id}`} className={buttonClass({ size: "sm" })}>
                      <Presentation className="h-4 w-4" /> Present
                    </Link>
                  </>
                ) : null}
              </div>
              {role === "teacher" && lesson.teacherNotes ? (
                <div className="mt-4 rounded-md bg-warm-soft/60 p-3 text-sm">
                  <span className="font-semibold text-warm">Your notes · </span>
                  <span className="whitespace-pre-wrap">{lesson.teacherNotes}</span>
                </div>
              ) : null}
            </>
          ) : (
            <Empty>
              No lessons yet.{" "}
              {role === "teacher" ? (
                <Link href="/teach/lessons/new" className="text-accent underline">
                  Plan the first one.
                </Link>
              ) : null}
            </Empty>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Homework</h2>
            <Link href="/homework" className="text-sm text-accent hover:underline">
              All homework
            </Link>
          </div>
          {open.length ? (
            <ul className="divide-y divide-line">
              {open.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2">
                  <span>{h.title}</span>
                  {h.dueDate ? <span className="text-xs text-muted">due {formatDate(h.dueDate)}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing outstanding.</p>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Reference</h2>
          <ul className="space-y-1 text-sm">
            <li><Link className="hover:text-accent" href="/reference/grammar">Grammar &amp; syntax guide <span className="text-muted">· {grammarTopics.length} topics</span></Link></li>
            <li><Link className="hover:text-accent" href="/reference/recommendations">How to improve</Link></li>
            <li><Link className="hover:text-accent" href="/reference/watch">Things to watch</Link></li>
            <li><Link className="hover:text-accent" href="/reference/read">Things to read</Link></li>
          </ul>
        </Card>
        {role === "teacher" ? (
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Teacher</h2>
            <ul className="space-y-1 text-sm">
              <li><Link className="hover:text-accent" href="/teach/lessons/new">New lesson plan</Link></li>
              <li><Link className="hover:text-accent" href="/lessons">All lessons</Link></li>
              <li><Link className="hover:text-accent" href="/teach/results">Exercise results</Link></li>
              <li><Link className="hover:text-accent" href="/live">Live controls</Link></li>
            </ul>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
