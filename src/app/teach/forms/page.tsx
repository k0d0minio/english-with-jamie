import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listForms } from "@/lib/content";
import { formStatus, questionCount, STATUS_TONE } from "@/lib/form-dsl";
import { allFormResponses, listStudents } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TeachFormsPage() {
  await requireRole("teacher");
  const [forms, rows, students] = await Promise.all([listForms(), allFormResponses(), listStudents()]);
  const names = new Map(students.map((s) => [s.id, s.name]));
  return (
    <>
      <PageHeader
        title="Forms"
        lead="Questions for students, written in the forms studio. Students only see a form once you send it from its page. Answers stay in the database; pull them for a studio with npm run forms:pull."
      />
      {forms.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((f) => {
            const sent = rows.filter((r) => r.formSlug === f.slug);
            return (
              <Card key={f.slug} className="flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  {f.problems.length ? (
                    <span className="flex items-center gap-1 text-xs text-warm" title={f.problems.join("\n")}>
                      <AlertTriangle className="h-3.5 w-3.5" /> {f.problems.length}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs text-muted">{questionCount(f)} questions</span>
                </div>
                <h3 className="text-lg font-semibold">
                  <Link href={`/teach/forms/${f.slug}`} className="hover:text-accent">
                    {f.title}
                  </Link>
                </h3>
                {f.summary ? <p className="mt-1 text-sm text-muted">{f.summary}</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-3 text-xs">
                  {sent.length ? (
                    sent.map((r) => (
                      <Badge key={r.userId} tone={STATUS_TONE[formStatus(r)]}>
                        {names.get(r.userId) ?? "unknown"} · {formStatus(r)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted">Not sent yet.</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty>No forms yet. Write one in the forms studio (studios/forms/CONTEXT.md).</Empty>
      )}
    </>
  );
}
