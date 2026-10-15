/** TV shows and films, chosen with the student. Written by the teacher. */
export type WatchItem = { title: string; kind: "series" | "film"; why: string; where?: string; level?: "comfortable" | "stretch" };

export const watchList: WatchItem[] = [
  // { title: "...", kind: "series", why: "...", where: "Netflix", level: "stretch" },
];
