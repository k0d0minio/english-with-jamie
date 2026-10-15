import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getUser, requireRole } from "@/lib/auth";
import { listForms } from "@/lib/content";
import { formStatus, isAnswered, questionCount, STATUS_TONE } from "@/lib/form-dsl";
import { formResponsesForUser } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const role = await requireRole();
  const user = (await getUser())!;
  const [rows, forms] = await Promise.all([formResponsesForUser(user.id), listForms()]);
  const bySlug = new Map(forms.map((f) => [f.slug, f]));
  const sent = rows.map((r) => ({ r, form: bySlug.get(r.formSlug) })).filter((x) => x.form && !x.form.draft);

  return (
    <>
      <PageHeader title={user.name || "Profile"} lead={user.email} />
      <div className="mx-auto max-w-3xl space-y-6">
        {role === "teacher" ? (
          <Card>
            <p className="text-sm text-muted">
              Forms are sent to students from{" "}
              <Link href="/teach/forms" className="text-accent hover:underline">
                Teach → Forms
              </Link>
              ; they fill them in here, on their own profile.
            </p>
          </Card>
        ) : (
          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Questions from Jamie</h2>
            <p className="mb-3 text-sm text-muted">Your answers shape what the lessons are about. Save as you go; send when you&apos;re happy.</p>
            {sent.length ? (
              <ul className="divide-y divide-line">
                {sent.map(({ r, form }) => {
                  const status = formStatus(r);
                  const answered = Object.values(r.answers).filter(isAnswered).length;
                  return (
                    <li key={r.formSlug}>
                      <Link href={`/profile/forms/${r.formSlug}`} className="group flex items-center gap-3 py-3">
                        <span className="flex-1">
                          <span className="font-medium group-hover:text-accent">{form!.title}</span>
                          {form!.summary ? <span className="block text-sm text-muted">{form!.summary}</span> : null}
                          <span className="block text-xs text-muted">
                            {answered}/{questionCount(form!)} answered · from {formatDate(new Date(r.sentAt))}
                          </span>
                        </span>
                        <Badge tone={STATUS_TONE[status]}>{status === "new" ? "to do" : status}</Badge>
                        <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty>Nothing to fill in right now.</Empty>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
