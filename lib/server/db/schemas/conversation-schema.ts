import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const onboarding = pgTable("onboarding", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id),
	hasBeenAdded: boolean("has_been_added").default(false).notNull(),
	hasChangedName: boolean("has_changed_name").default(false).notNull(),
	hasOnboarded: boolean("has_onboarded").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
