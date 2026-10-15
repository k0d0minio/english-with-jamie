// Shapes shared by the markdown content loader, the legacy DB tables and the UI.
export type SlideData = { kind: "slide"; title: string; body: string };
export type ClozeItem = { kind: "cloze"; prompt: string; answer: string; hint?: string };
export type McItem = { kind: "mc"; prompt: string; options: string[]; correct: number };
export type ExerciseItem = ClozeItem | McItem;
export type ExerciseData = { kind: "exercise"; title: string; instructions?: string; items: ExerciseItem[] };
export type BlockData = SlideData | ExerciseData;
