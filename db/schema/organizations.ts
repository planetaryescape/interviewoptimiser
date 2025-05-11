import { relations } from "drizzle-orm";
import { boolean, index, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const organizations = pgTable(
  "organizations",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    website: varchar("website", { length: 255 }),
    industry: varchar("industry", { length: 255 }),
    size: varchar("size", { length: 50 }), // e.g., "1-10", "11-50", "51-200", etc.
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (organizations) => [
    index("organizations_name_idx").on(organizations.name),
    index("organizations_is_deleted_idx").on(organizations.isDeleted),
  ]
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: serial("id").primaryKey(),
    organizationId: serial("organization_id")
      .references(() => organizations.id)
      .notNull(),
    userId: serial("user_id")
      .references(() => users.id)
      .notNull(),
    role: varchar("role", { length: 50 }).notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (organizationMembers) => ({
    organizationIdIdx: index("organization_members_organization_id_idx").on(
      organizationMembers.organizationId
    ),
    userIdIdx: index("organization_members_user_id_idx").on(organizationMembers.userId),
    activeIdx: index("organization_members_active_idx").on(
      organizationMembers.organizationId,
      organizationMembers.userId,
      organizationMembers.isActive
    ),
  })
);

export const organizationRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
}));

export const organizationMemberRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
