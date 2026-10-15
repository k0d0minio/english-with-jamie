import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getForm } from "@/lib/content";
import { answerWords, formStatus, isAnswered, STATUS_TONE } from "@/lib/form-dsl";
import { allFormResponses, listStudents } from "@/lib/queries";
import { sendForm, withdrawForm } from "@/actions/forms";
import { InfoForm } from "@/components/info-form";
import { Markdown } from "@/components/markdown";
import { Badge, Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeachFormPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole("teacher");
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) notFound();
  const [rows, students] = await Promise.all([allFormResponses().then((all) => all.filter((r) => r.formSlug === slug)), listStudents()]);
  const questions = form.sections.flatMap((s) => s.questions);

  return (
    <>
      <PageHeader title={form.title} lead={form.summary} actions={form.draft ? <Badge>draft</Badge> : <Badge tone="accent">published</Badge>} />
      {form.problems.length ? (
        <Card className="mb-6 border-warm/40 bg-warm-soft/40">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-warm">
            <AlertTriangle className="h-4 w-4" /> The file has problems
          </p>
          <ul className="list-disc pl-5 text-sm">{form.problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          {rows
            .filter((r) => r.savedAt)
            .map((r) => {
              const student = students.find((s) => s.id === r.userId);
              return (
                <Card key={r.userId}>
                  <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
                    <h2 className="font-semibold">{student?.name ?? "Unknown student"}&apos;s answers</h2>
                    <Badge tone={STATUS_TONE[formStatus(r)]}>{formStatus(r)}</Badge>
                    <span className="text-xs text-muted">last saved {formatDate(new Date(r.savedAt!))}</span>
                  </div>
                  <dl className="space-y-3 text-sm">
                    {questions.map((q) => {
                      const a = r.answers[q.key];
                      return (
                        <div key={q.key}>
                          <dt className="font-medium">{q.prompt}</dt>
                          <dd className={isAnswered(a) ? "whitespace-pre-wrap text-ink/90" : "text-muted"}>{isAnswered(a) ? answerWords(q, a!.answer) : "—"}</dd>
                        </div>
                      );
                    })}
                    {Object.entries(r.answers)
                      .filter(([k, a]) => !questions.some((q) => q.key === k) && isAnswered(a))
                      .map(([k, a]) => (
                        <div key={k}>
                          <dt className="font-medium">
                            {a.prompt} <span className="text-xs font-normal text-muted">(no longer in the form)</span>
                          </dt>
                          <dd className="whitespace-pre-wrap text-ink/90">{answerWords({ kind: "long", options: [] }, a.answer)}</dd>
                        </div>
                      ))}
                  </dl>
                </Card>
              );
            })}
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">What the student sees</h2>
            {form.intro ? <Markdown className="mb-6">{form.intro}</Markdown> : null}
            <InfoForm slug={slug} sections={form.sections} preview />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-semibold">Send to</h2>
            {form.draft ? (
              <p className="text-sm text-muted">Remove <code>draft: true</code> from the file to send it.</p>
            ) : students.length ? (
              <ul className="divide-y divide-line">
                {students.map((s) => {
                  const r = rows.find((x) => x.userId === s.id);
                  return (
                    <li key={s.id} className="flex items-center gap-2 py-2 text-sm">
                      <span className="flex-1 font-medium">{s.name}</span>
                      {r ? <Badge tone={STATUS_TONE[formStatus(r)]}>{formStatus(r)}</Badge> : null}
                      {!r ? (
                        <form action={sendForm.bind(null, slug, s.id)}>
                          <Button size="sm">Send</Button>
                        </form>
                      ) : !r.savedAt ? (
                        <form action={withdrawForm.bind(null, slug, s.id)}>
                          <Button size="sm" variant="ghost">Withdraw</Button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted">No student accounts yet.</p>
            )}
          </Card>
          {form.teacherNotes ? (
            <Card className="bg-warm-soft/40">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm">Your notes</h2>
              <Markdown className="prose-sm">{form.teacherNotes}</Markdown>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
