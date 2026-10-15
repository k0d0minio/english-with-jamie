import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { grammarTopics } from "@/content/grammar";

const dir = path.join(process.cwd(), "src", "content", "grammar");

export async function readGrammarTopic(slug: string) {
  const topic = grammarTopics.find((t) => t.slug === slug);
  if (!topic) return null;
  const body = await fs.readFile(path.join(dir, `${slug}.md`), "utf8").catch(() => "");
  return { ...topic, body };
}
