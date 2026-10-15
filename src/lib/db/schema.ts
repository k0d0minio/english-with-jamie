import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const lessonStatus = pgEnum("lesson_status", ["draft", "scheduled", "done"]);
export const blockKind = pgEnum("block_kind", ["slide", "exercise"]);
export const liveMode = pgEnum("live_mode", ["follow", "free"]);

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  teacherNotes: text("teacher_notes").notNull().default(""),
  scheduledFor: date("scheduled_for"),
  status: lessonStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  kind: blockKind("kind").notNull(),
  data: jsonb("data").$type<BlockData>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const answers = pgTable(
  "answers",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    blockId: integer("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    itemIndex: integer("item_index").notNull(),
    response: text("response").notNull(),
    correct: boolean("correct").notNull(),
    attempts: integer("attempts").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("answers_block_item_idx").on(t.blockId, t.itemIndex)],
);

export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  details: text("details").notNull().default(""),
  dueDate: date("due_date"),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Single-row table: what the teacher is currently showing.
export const liveState = pgTable("live_state", {
  id: integer("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  blockIndex: integer("block_index").notNull().default(0),
  mode: liveMode("mode").notNull().default("follow"),
  version: integer("version").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- Block payloads -------------------------------------------------------

export type SlideData = {
  kind: "slide";
  title: string;
  body: string; // markdown
};

export type ClozeItem = { kind: "cloze"; prompt: string; answer: string; hint?: string };
export type McItem = { kind: "mc"; prompt: string; options: string[]; correct: number };
export type ExerciseItem = ClozeItem | McItem;

export type ExerciseData = {
  kind: "exercise";
  title: string;
  instructions?: string;
  items: ExerciseItem[];
};

export type BlockData = SlideData | ExerciseData;

export type Lesson = typeof lessons.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Homework = typeof homework.$inferSelect;
export type LiveState = typeof liveState.$inferSelect;
