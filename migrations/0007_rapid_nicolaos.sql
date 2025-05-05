ALTER TABLE "onboarding" ADD COLUMN "has_been_added" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onboarding" ADD COLUMN "has_changed_name" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "has_signed_up";