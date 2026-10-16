import Link from "next/link";
import { ArrowRight, ClipboardList, Presentation } from "lucide-react";
import { getUser, requireRole } from "@/lib/auth";
import { currentLesson, listForms, listGrammar, listHomework } from "@/lib/content";
import { formResponsesForUser, homeworkDoneSet, lessonBalance, recentlySubmittedForms } from "@/lib/queries";
import { getLiveSnapshot } from "@/lib/live";
import { Badge, Card, Empty } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const role = await requireRole();
  const student = role === "student";
  const [lesson, homework, done, live, grammar, balance] = await Promise.all([
    currentLesson(student),
    listHomework(),
    homeworkDoneSet(),
    getLiveSnapshot({ teacher: !student }),
    listGrammar(),
    lessonBalance(),
  ]);
  const open = homework.filter((h) => !done.has(h.slug) && (!student || !h.draft)).slice(0, 5);
  const user = (await getUser())!;
  // Student: forms still to send back. Teacher: forms sent back in the last fortnight.
  const [responses, forms] = await Promise.all([student ? formResponsesForUser(user.id) : recentlySubmittedForms(), listForms()]);
  const formSlugs = new Set(forms.map((f) => f.slug));
  const formsWaiting = responses.filter((r) => formSlugs.has(r.formSlug) && (!student || !r.submittedAt)).length;

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

        {formsWaiting ? (
          <Link
            href={student ? "/profile" : "/teach/forms"}
            className="flex items-center justify-between rounded-lg border border-warm/40 bg-warm-soft/60 px-5 py-4 hover:bg-warm-soft"
          >
            <span className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-warm" />
              <span className="font-medium">
                {student
                  ? `Jamie has ${formsWaiting === 1 ? "a question form" : `${formsWaiting} question forms`} for you`
                  : `${formsWaiting} ${formsWaiting === 1 ? "form" : "forms"} sent back recently`}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-warm" />
          </Link>
        ) : null}

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{student ? "Your next lesson" : "Up next"}</h2>
            <span className="flex gap-2">
              {!student && lesson?.status === "draft" ? <Badge>draft</Badge> : null}
              {lesson?.date ? <Badge tone="accent">{formatDate(lesson.date)}</Badge> : null}
            </span>
          </div>
          {lesson ? (
            <>
              <h3 className="text-2xl font-semibold tracking-tight">{lesson.title}</h3>
              {lesson.summary ? <p className="mt-2 text-muted">{lesson.summary}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/lessons/${lesson.slug}`} className={buttonClass({ variant: "outline", size: "sm" })}>
                  Open lesson
                </Link>
                {!student ? (
                  <Link href={`/live?lesson=${lesson.slug}`} className={buttonClass({ size: "sm" })}>
                    <Presentation className="h-4 w-4" /> Present
                  </Link>
                ) : null}
              </div>
              {!student && lesson.teacherNotes ? (
                <div className="mt-4 rounded-md bg-warm-soft/60 p-3 text-sm">
                  <span className="font-semibold text-warm">Your notes · </span>
                  <span className="whitespace-pre-wrap">{lesson.teacherNotes}</span>
                </div>
              ) : null}
            </>
          ) : (
            <Empty>No lessons yet. {student ? "" : "Plan one in the lesson-plan studio."}</Empty>
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
                <li key={h.slug} className="flex items-center justify-between py-2">
                  <span>
                    {h.title}
                    {h.draft ? <Badge className="ml-2">draft</Badge> : null}
                  </span>
                  {h.due ? <span className="text-xs text-muted">due {formatDate(h.due)}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing outstanding.</p>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Link href="/payments" className="block">
          <Card className="hover:border-accent/50">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Lessons left</h2>
            <div className={balance.remaining <= 2 ? "mt-1 text-3xl font-semibold text-warm" : "mt-1 text-3xl font-semibold text-accent-strong"}>{balance.remaining}</div>
            <p className="mt-1 text-sm text-muted">
              {balance.taught} of {balance.paid} paid lessons completed
            </p>
          </Card>
        </Link>
        <Card>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Reference</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <Link className="hover:text-accent" href="/reference/grammar">
                Grammar &amp; syntax guide <span className="text-muted">· {grammar.filter((g) => !student || !g.draft).length} topics</span>
              </Link>
            </li>
            <li><Link className="hover:text-accent" href="/reference/recommendations">How to improve</Link></li>
            <li><Link className="hover:text-accent" href="/reference/watch">Things to watch</Link></li>
            <li><Link className="hover:text-accent" href="/reference/read">Things to read</Link></li>
          </ul>
        </Card>
        {!student ? (
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Teacher</h2>
            <ul className="space-y-1 text-sm">
              <li><Link className="hover:text-accent" href="/lessons">All lessons</Link></li>
              <li><Link className="hover:text-accent" href="/teach/results">Exercise results</Link></li>
              <li><Link className="hover:text-accent" href="/teach/forms">Forms</Link></li>
              <li><Link className="hover:text-accent" href="/live">Live controls</Link></li>
            </ul>
            <p className="mt-3 text-xs text-muted">Content is written in the studios, not here. See AGENTS.md in the repo.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
