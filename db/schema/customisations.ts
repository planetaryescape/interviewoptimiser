import { relations } from "drizzle-orm";
import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const customisations = pgTable(
  "customisations",
  (p) => ({
    id: p.serial().primaryKey(),
    userId: p
      .integer()
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    name: p.varchar({ length: 255 }).notNull(),
    address: p.varchar({ length: 255 }).notNull(),
    email: p.varchar({ length: 255 }).notNull(),
    phone: p.varchar({ length: 50 }).notNull(),
    customInstructions: p.text().notNull(),
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (customisations) => ({
    userIdIdx: uniqueIndex("customisations_user_id_idx").on(customisations.userId),
  })
);

export const customisationsRelations = relations(customisations, ({ one }) => ({
  user: one(users, {
    fields: [customisations.userId],
    references: [users.id],
  }),
}));

export type Customisation = typeof customisations.$inferSelect;
export type NewCustomisation = typeof customisations.$inferInsert;
