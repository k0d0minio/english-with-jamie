CREATE TYPE "public"."block_kind" AS ENUM('slide', 'exercise');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('draft', 'scheduled', 'done');--> statement-breakpoint
CREATE TYPE "public"."live_mode" AS ENUM('follow', 'free');--> statement-breakpoint
CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"block_id" integer NOT NULL,
	"item_index" integer NOT NULL,
	"response" text NOT NULL,
	"correct" boolean NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"position" integer NOT NULL,
	"kind" "block_kind" NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homework" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer,
	"title" text NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"due_date" date,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"teacher_notes" text DEFAULT '' NOT NULL,
	"scheduled_for" date,
	"status" "lesson_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_state" (
	"id" integer PRIMARY KEY NOT NULL,
	"lesson_id" integer,
	"block_index" integer DEFAULT 0 NOT NULL,
	"mode" "live_mode" DEFAULT 'follow' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_state" ADD CONSTRAINT "live_state_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answers_block_item_idx" ON "answers" USING btree ("block_id","item_index");