CREATE TYPE "public"."ledger_kind" AS ENUM('paid', 'taught');--> statement-breakpoint
CREATE TABLE "lesson_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "ledger_kind" NOT NULL,
	"lessons" integer NOT NULL,
	"date" date NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
