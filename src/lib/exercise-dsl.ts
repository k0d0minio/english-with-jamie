import type { ExerciseItem } from "@/lib/db/schema";

/**
 * One exercise item per line.
 *
 *   Fill the gap:      She ___ (live) in Lisbon since 2019. => has lived
 *   With a hint:       I ___ (not/see) him for ages. => haven't seen || present perfect
 *   Alternatives:      We ___ (go) out last night. => went / did go
 *   Multiple choice:   ? Which sounds natural? | I'm agree | I agree | I am agreeing => 2
 *
 * Blank lines and lines starting with # are ignored.
 */
export function parseExerciseItems(src: string): { items: ExerciseItem[]; errors: string[] } {
  const items: ExerciseItem[] = [];
  const errors: string[] = [];
  src.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const n = i + 1;
    if (line.startsWith("?")) {
      const [head, correctRaw] = line.slice(1).split("=>");
      const parts = head.split("|").map((s) => s.trim()).filter(Boolean);
      const correct = Number((correctRaw ?? "").trim());
      if (parts.length < 3) return errors.push(`Line ${n}: a multiple-choice line needs a prompt and at least two options.`);
      if (!Number.isInteger(correct) || correct < 1 || correct > parts.length - 1)
        return errors.push(`Line ${n}: "=> N" must point at one of the ${parts.length - 1} options.`);
      items.push({ kind: "mc", prompt: parts[0], options: parts.slice(1), correct: correct - 1 });
      return;
    }
    const [promptRaw, rest] = line.split("=>");
    if (!rest) return errors.push(`Line ${n}: missing "=> answer".`);
    const [answerRaw, hintRaw] = rest.split("||");
    const prompt = promptRaw.trim();
    const answer = answerRaw.trim();
    if (!prompt.includes("___")) return errors.push(`Line ${n}: the prompt needs a ___ gap.`);
    if (!answer) return errors.push(`Line ${n}: empty answer.`);
    items.push({ kind: "cloze", prompt, answer, hint: hintRaw?.trim() || undefined });
  });
  return { items, errors };
}

export function serializeExerciseItems(items: ExerciseItem[]): string {
  return items
    .map((it) =>
      it.kind === "mc"
        ? `? ${it.prompt} | ${it.options.join(" | ")} => ${it.correct + 1}`
        : `${it.prompt} => ${it.answer}${it.hint ? ` || ${it.hint}` : ""}`,
    )
    .join("\n");
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function checkAnswer(item: ExerciseItem, response: string): boolean {
  if (item.kind === "mc") return Number(response) === item.correct;
  const accepted = item.answer.split("/").map(norm).filter(Boolean);
  return accepted.includes(norm(response));
}
