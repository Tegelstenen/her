CREATE TABLE "onboarding" (
	"user_id" text PRIMARY KEY NOT NULL,
	"has_onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "first_conversation" CASCADE;--> statement-breakpoint
ALTER TABLE "onboarding" ADD CONSTRAINT "onboarding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;