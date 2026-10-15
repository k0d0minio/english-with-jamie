CREATE TABLE "form_responses" (
	"form_slug" text NOT NULL,
	"user_id" text NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"saved_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	CONSTRAINT "form_responses_form_slug_user_id_pk" PRIMARY KEY("form_slug","user_id")
);
