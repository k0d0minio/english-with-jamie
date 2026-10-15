/** Articles and books to read and enjoy. Written by the teacher. */
export type ReadItem = { title: string; url?: string; source?: string; why: string; length?: "short" | "medium" | "long" };

export const readList: ReadItem[] = [
  // { title: "...", url: "https://...", source: "The Guardian", why: "...", length: "short" },
];
