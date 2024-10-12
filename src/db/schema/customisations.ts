import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const customisations = pgTable("customisations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  customInstructions: text("custom_instructions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customisationsRelations = relations(customisations, ({ one }) => ({
  user: one(users, {
    fields: [customisations.userId],
    references: [users.id],
  }),
}));

export type Customisation = typeof customisations.$inferSelect;
export type NewCustomisation = typeof customisations.$inferInsert;
