import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getLiveSnapshot, setLiveLesson } from "@/lib/live";
import { getLesson, listLessons } from "@/lib/content";
import { LiveTeacher } from "@/components/live-teacher";
import { LiveStudent } from "@/components/live-student";

export const dynamic = "force-dynamic";

export default async function LivePage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const role = await requireRole();
  const { lesson } = await searchParams;
  if (role === "teacher" && lesson) {
    if (await getLesson(lesson)) await setLiveLesson(lesson);
    redirect("/live");
  }
  const snap = await getLiveSnapshot();
  if (role === "teacher") {
    const lessons = (await listLessons()).map((l) => ({ slug: l.slug, title: l.title, status: l.status, date: l.date }));
    return <LiveTeacher initial={snap} lessons={lessons} />;
  }
  return <LiveStudent initial={snap} />;
}
