import { notFound, redirect } from "next/navigation";
import { getUser, requireRole } from "@/lib/auth";
import { getForm } from "@/lib/content";
import { getFormResponse } from "@/lib/queries";
import { InfoForm } from "@/components/info-form";
import { Markdown } from "@/components/markdown";
import { PageHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FillFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if ((await requireRole()) === "teacher") redirect(`/teach/forms/${slug}`);
  const user = (await getUser())!;
  const [form, row] = await Promise.all([getForm(slug), getFormResponse(slug, user.id)]);
  if (!form || !row) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={form.title}
        lead={row.submittedAt ? `Sent to Jamie on ${formatDate(new Date(row.submittedAt))}. You can still change anything.` : form.summary}
      />
      {form.intro ? <Markdown className="mb-8">{form.intro}</Markdown> : null}
      <InfoForm slug={slug} sections={form.sections} answers={row.answers} submitted={!!row.submittedAt} />
    </div>
  );
}
