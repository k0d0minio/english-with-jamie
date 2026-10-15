import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { resultsOverview } from "@/lib/queries";
import { Card, Empty, PageHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  await requireRole("teacher");
  const rows = await resultsOverview();
  return (
    <>
      <PageHeader title="Results" lead="Every exercise the student has touched, most recent first. Open the lesson for item-by-item answers." />
      {rows.length ? (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2">Lesson</th>
                <th className="px-4 py-2">Exercise</th>
                <th className="px-4 py-2">Correct</th>
                <th className="px-4 py-2">Tries</th>
                <th className="px-4 py-2">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const items = r.block && r.block.data.kind === "exercise" ? r.block.data.items.length : r.total;
                return (
                  <tr key={`${r.lessonSlug}/${r.blockKey}`} className="border-t border-line">
                    <td className="px-4 py-2">
                      {r.lesson ? (
                        <Link href={`/lessons/${r.lessonSlug}`} className="text-accent hover:underline">
                          {r.lesson.title}
                        </Link>
                      ) : (
                        <span className="text-muted">{r.lessonSlug} (file missing)</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{r.block?.data.title ?? r.blockKey}</td>
                    <td className="px-4 py-2 font-medium">
                      {r.correct}/{items}
                    </td>
                    <td className="px-4 py-2 text-muted">{r.attempts}</td>
                    <td className="px-4 py-2 text-muted">{new Date(r.last).toLocaleString("en-GB")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <Empty>No answers yet.</Empty>
      )}
    </>
  );
}
