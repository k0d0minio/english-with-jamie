// Shapes shared by the markdown content loader, the legacy DB tables and the UI.

/** How a slide is laid out. Every lesson uses the same few, so lessons look like one course. */
export const SLIDE_LAYOUTS = ["cover", "split", "cards", "talk", "plain"] as const;
export type SlideLayout = (typeof SLIDE_LAYOUTS)[number];

/** The illustration library in src/components/slide-art.tsx. Add a name here when you add a drawing. */
export const ART_NAMES = ["maple", "parliament", "canal", "tulips", "lakes", "chat", "quiz"] as const;
export type ArtName = (typeof ART_NAMES)[number];

export type SlideData = { kind: "slide"; title: string; body: string; layout?: SlideLayout; art?: ArtName; kicker?: string };
export type ClozeItem = { kind: "cloze"; prompt: string; answer: string; hint?: string };
export type McItem = { kind: "mc"; prompt: string; options: string[]; correct: number };
export type ExerciseItem = ClozeItem | McItem;
export type ExerciseData = { kind: "exercise"; title: string; instructions?: string; items: ExerciseItem[]; art?: ArtName };
export type BlockData = SlideData | ExerciseData;
