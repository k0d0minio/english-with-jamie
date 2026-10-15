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
import type { BlockData } from "@/lib/lesson-types";

export type { BlockData, ClozeItem, ExerciseData, ExerciseItem, MatchItem, McItem, OrderItem, PollItem, SlideData } from "@/lib/lesson-types";

export const lessonStatus = pgEnum("lesson_status", ["draft", "scheduled", "done"]);
export const blockKind = pgEnum("block_kind", ["slide", "exercise"]);
export const liveMode = pgEnum("live_mode", ["follow", "free"]);
export const ledgerKind = pgEnum("ledger_kind", ["paid", "taught"]);

// ---------------------------------------------------------------------------
// Live tables: what the app reads and writes. Content itself lives in content/*.md.
// ---------------------------------------------------------------------------

/** The student's latest answer per exercise item, keyed by lesson file and block key. */
export const itemAnswers = pgTable(
  "item_answers",
  {
    id: serial("id").primaryKey(),
    lessonSlug: text("lesson_slug").notNull(),
    blockKey: text("block_key").notNull(),
    itemIndex: integer("item_index").notNull(),
    response: text("response").notNull(),
    correct: boolean("correct").notNull(),
    attempts: integer("attempts").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("item_answers_key_idx").on(t.lessonSlug, t.blockKey, t.itemIndex)],
);

/** Homework ticked off by the student; the task itself is content/homework/<slug>.md. */
export const homeworkDone = pgTable("homework_done", {
  slug: text("slug").primaryKey(),
  doneAt: timestamp("done_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * The student's lesson balance, kept by hand by the teacher. A "paid" row adds lessons once
 * a payment has been verified; a "taught" row uses one up. Remaining = paid - taught.
 */
export const lessonLedger = pgTable("lesson_ledger", {
  id: serial("id").primaryKey(),
  kind: ledgerKind("kind").notNull(),
  lessons: integer("lessons").notNull(),
  date: date("date").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Single-row table: what the teacher is currently showing. */
export const liveState = pgTable("live_state", {
  id: integer("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "set null" }), // legacy, unused
  lessonSlug: text("lesson_slug"),
  blockIndex: integer("block_index").notNull().default(0),
  mode: liveMode("mode").notNull().default("follow"),
  version: integer("version").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Legacy tables from the first cut (in-app lesson editor). Unused since content moved
// to markdown; kept so no migration drops anything. Drop them by hand when convenient:
//   drop table answers, blocks, homework, lessons; alter table live_state drop column lesson_id;
// then delete this section and run `npm run db:generate`.
// ---------------------------------------------------------------------------

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

export type ItemAnswer = typeof itemAnswers.$inferSelect;
export type LiveState = typeof liveState.$inferSelect;
export type LedgerEntry = typeof lessonLedger.$inferSelect;
