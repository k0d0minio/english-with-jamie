CREATE TABLE "homework_done" (
	"slug" text PRIMARY KEY NOT NULL,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_slug" text NOT NULL,
	"block_key" text NOT NULL,
	"item_index" integer NOT NULL,
	"response" text NOT NULL,
	"correct" boolean NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "live_state" ADD COLUMN "lesson_slug" text;--> statement-breakpoint
CREATE UNIQUE INDEX "item_answers_key_idx" ON "item_answers" USING btree ("lesson_slug","block_key","item_index");