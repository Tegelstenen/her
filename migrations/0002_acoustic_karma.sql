CREATE TABLE "first_conversation" (
	"user_id" text PRIMARY KEY NOT NULL,
	"has_first_conversation" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "first_conversation" ADD CONSTRAINT "first_conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;