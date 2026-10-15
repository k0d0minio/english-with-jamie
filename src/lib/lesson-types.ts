// Shapes shared by the markdown content loader, the legacy DB tables and the UI.

/** How a slide is laid out. Every lesson uses the same few, so lessons look like one course. */
export const SLIDE_LAYOUTS = ["cover", "split", "cards", "talk", "plain"] as const;
export type SlideLayout = (typeof SLIDE_LAYOUTS)[number];

/** The illustration library in src/components/slide-art.tsx. Add a name here when you add a drawing. */
export const ART_NAMES = [
  // general
  "maple", "chat", "quiz", "lakes",
  // Ottawa
  "parliament", "canal", "tulips", "locks", "logs", "raft", "bell", "dino", "cat", "flag",
  "camera", "secret", "bunker", "tree", "castle", "pastry", "coin", "spider", "cow", "trophy",
] as const;
export type ArtName = (typeof ART_NAMES)[number];

/** `stat` is one big figure shown with the slide: a year, a distance, a number. */
export type SlideData = { kind: "slide"; title: string; body: string; layout?: SlideLayout; art?: ArtName; kicker?: string; stat?: string };
// `note` (after `||` on a line) is shown once the item is answered: the story behind the answer.
export type ClozeItem = { kind: "cloze"; prompt: string; answer: string; hint?: string };
export type McItem = { kind: "mc"; prompt: string; options: string[]; correct: number; note?: string };
/** Put in order. `steps` is the correct order; the app shuffles them. */
export type OrderItem = { kind: "order"; prompt: string; steps: string[]; note?: string };
/** Match each left to its right. `pairs` is the correct pairing; the app shuffles the rights. */
export type MatchItem = { kind: "match"; prompt: string; pairs: [string, string][]; note?: string };
/** An opinion: any pick is right, and the teacher sees which. */
export type PollItem = { kind: "poll"; prompt: string; options: string[]; note?: string };
export type ExerciseItem = ClozeItem | McItem | OrderItem | MatchItem | PollItem;
export type ExerciseData = { kind: "exercise"; title: string; instructions?: string; items: ExerciseItem[]; art?: ArtName };
export type BlockData = SlideData | ExerciseData;
