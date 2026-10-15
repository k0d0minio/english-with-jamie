import type { ExerciseItem } from "@/lib/db/schema";

/**
 * One exercise item per line.
 *
 *   Fill the gap:      She ___ (live) in Lisbon since 2019. => has lived
 *   With a hint:       I ___ (not/see) him for ages. => haven't seen || present perfect
 *   Alternatives:      We ___ (go) out last night. => went / did go
 *   Multiple choice:   ? Which sounds natural? | I'm agree | I agree | I am agreeing => 2
 *   Put in order:      ^ Oldest first | Bytown | the canal | Ottawa         (written in the right order)
 *   Match the pairs:   & Who did what? | Karsh = the photo | Hays = the hotel
 *   Opinion poll:      * Would you rather… | skate to work | take the bus
 *
 * On every kind except gap-fill, `|| note` at the end is shown once the item is answered.
 * On a gap-fill, `|| hint` is a hint shown on request. Blank lines and # lines are ignored.
 */
export function parseExerciseItems(src: string): { items: ExerciseItem[]; errors: string[] } {
  const items: ExerciseItem[] = [];
  const errors: string[] = [];
  src.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const n = i + 1;
    const sigil = line[0];

    if (sigil === "?" || sigil === "^" || sigil === "&" || sigil === "*") {
      const [main, noteRaw] = splitOnce(line.slice(1), "||");
      const note = noteRaw?.trim() || undefined;
      if (sigil === "?") {
        const [head, correctRaw] = splitOnce(main, "=>");
        const parts = cells(head);
        const correct = Number((correctRaw ?? "").trim());
        if (parts.length < 3) return errors.push(`Line ${n}: a multiple-choice line needs a prompt and at least two options.`);
        if (!Number.isInteger(correct) || correct < 1 || correct > parts.length - 1)
          return errors.push(`Line ${n}: "=> N" must point at one of the ${parts.length - 1} options.`);
        items.push({ kind: "mc", prompt: parts[0], options: parts.slice(1), correct: correct - 1, note });
        return;
      }
      const parts = cells(main);
      if (parts.length < 3) return errors.push(`Line ${n}: needs a prompt and at least two entries, separated by |.`);
      const [prompt, ...rest] = parts;
      if (sigil === "^") {
        items.push({ kind: "order", prompt, steps: rest, note });
        return;
      }
      if (sigil === "*") {
        items.push({ kind: "poll", prompt, options: rest, note });
        return;
      }
      const pairs: [string, string][] = [];
      for (const cell of rest) {
        const [l, r] = splitOnce(cell, "=");
        if (!r?.trim()) return errors.push(`Line ${n}: each pair is "left = right" ("${cell}").`);
        pairs.push([l.trim(), r.trim()]);
      }
      items.push({ kind: "match", prompt, pairs, note });
      return;
    }

    const [promptRaw, rest] = splitOnce(line, "=>");
    if (!rest) return errors.push(`Line ${n}: missing "=> answer".`);
    const [answerRaw, hintRaw] = splitOnce(rest, "||");
    const prompt = promptRaw.trim();
    const answer = answerRaw.trim();
    if (!prompt.includes("___")) return errors.push(`Line ${n}: the prompt needs a ___ gap.`);
    if (!answer) return errors.push(`Line ${n}: empty answer.`);
    items.push({ kind: "cloze", prompt, answer, hint: hintRaw?.trim() || undefined });
  });
  return { items, errors };
}

function splitOnce(s: string, sep: string): [string, string | undefined] {
  const i = s.indexOf(sep);
  return i === -1 ? [s, undefined] : [s.slice(0, i), s.slice(i + sep.length)];
}

const cells = (s: string) =>
  s
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

export function serializeExerciseItems(items: ExerciseItem[]): string {
  return items
    .map((it) => {
      const note = "note" in it && it.note ? ` || ${it.note}` : "";
      switch (it.kind) {
        case "mc":
          return `? ${it.prompt} | ${it.options.join(" | ")} => ${it.correct + 1}${note}`;
        case "order":
          return `^ ${it.prompt} | ${it.steps.join(" | ")}${note}`;
        case "match":
          return `& ${it.prompt} | ${it.pairs.map(([l, r]) => `${l} = ${r}`).join(" | ")}${note}`;
        case "poll":
          return `* ${it.prompt} | ${it.options.join(" | ")}${note}`;
        case "cloze":
          return `${it.prompt} => ${it.answer}${it.hint ? ` || ${it.hint}` : ""}`;
      }
    })
    .join("\n");
}

/** "0,1,2" for n = 3: the response that means "in the written order". */
export const identity = (n: number) => Array.from({ length: n }, (_, i) => i).join(",");

/**
 * A fixed shuffle of 0..n-1 seeded by text, so server and client agree and the order
 * never comes out already solved.
 */
export function shuffleOrder(n: number, seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (n > 1 && out.every((v, i) => v === i)) out.push(out.shift()!);
  return out;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function checkAnswer(item: ExerciseItem, response: string): boolean {
  switch (item.kind) {
    case "mc":
      return Number(response) === item.correct;
    case "poll": {
      const k = Number(response);
      return Number.isInteger(k) && k >= 0 && k < item.options.length;
    }
    case "order":
      return response === identity(item.steps.length);
    case "match":
      return response === identity(item.pairs.length);
    case "cloze": {
      const accepted = item.answer.split("/").map(norm).filter(Boolean);
      return accepted.includes(norm(response));
    }
  }
}

/** The right answer in words, for the reveal after a few wrong tries. */
export function answerText(item: ExerciseItem): string | undefined {
  switch (item.kind) {
    case "mc":
      return item.options[item.correct];
    case "order":
      return item.steps.join(" → ");
    case "match":
      return item.pairs.map(([l, r]) => `${l} = ${r}`).join("; ");
    case "cloze":
      return item.answer.split("/")[0].trim();
    case "poll":
      return undefined;
  }
}

/** A stored response in words, for the teacher's tables. */
export function responseText(item: ExerciseItem, response: string): string {
  const picks = response.split(",").map(Number);
  switch (item.kind) {
    case "mc":
    case "poll":
      return item.options[Number(response)] ?? response;
    case "order":
      return picks.map((k) => item.steps[k] ?? "?").join(" → ");
    case "match":
      return picks.map((k, i) => `${item.pairs[i]?.[0] ?? "?"} = ${item.pairs[k]?.[1] ?? "?"}`).join("; ");
    case "cloze":
      return response;
  }
}
