import { relations } from "drizzle-orm";
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const images = pgTable(
  "images",
  (p) => ({
    id: p.serial().primaryKey(),
    promptId: p
      .integer()
      .references(() => users.id, {
        onDelete: "no action",
      })
      .notNull(),
    cloudinaryPublicId: p.varchar({ length: 255 }).notNull().unique(),
    url: p.varchar({ length: 255 }).notNull().unique(),
    format: p.varchar({ length: 255 }).notNull(),
    originalFilename: p.varchar({ length: 255 }).notNull(),
    createdAt: p
      .timestamp()
      .$default(() => new Date())
      .notNull(),
    updatedAt: p
      .timestamp()
      .$default(() => new Date())
      .notNull(),
  }),
  (images) => [
    index("images_prompt_id_idx").on(images.promptId),
    uniqueIndex("images_cloudinary_public_id_idx").on(images.cloudinaryPublicId),
  ]
);

export const imagesRelations = relations(images, ({ one }) => ({
  user: one(users, {
    fields: [images.promptId],
    references: [users.id],
  }),
}));

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
