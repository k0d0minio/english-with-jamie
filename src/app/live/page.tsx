import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getLiveSnapshot, setLiveLesson } from "@/lib/live";
import { listLessons } from "@/lib/queries";
import { LiveTeacher } from "@/components/live-teacher";
import { LiveStudent } from "@/components/live-student";

export const dynamic = "force-dynamic";

export default async function LivePage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const role = await requireRole();
  const { lesson } = await searchParams;
  if (role === "teacher" && lesson) {
    const id = Number(lesson);
    if (Number.isInteger(id)) await setLiveLesson(id);
    redirect("/live");
  }
  const snap = await getLiveSnapshot();
  if (role === "teacher") {
    const lessons = (await listLessons()).map((l) => ({ id: l.id, title: l.title, status: l.status, scheduledFor: l.scheduledFor }));
    return <LiveTeacher initial={snap} lessons={lessons} />;
  }
  return <LiveStudent initial={snap} />;
}
