import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id),
  createdById: serial("created_by_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  interviewDuration: integer("interview_duration").notNull(), // in minutes
  assessmentCriteria: jsonb("assessment_criteria"), // JSON array of criteria
  status: varchar("status", { length: 50 }).notNull().default("active"), // "active", "paused", "closed"
  shareableLink: varchar("shareable_link", { length: 255 }).notNull().unique(),
  isDeleted: boolean("is_deleted").default(false),
  isShared: boolean("is_shared").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobCandidates = pgTable("job_candidates", {
  id: serial("id").primaryKey(),
  jobId: serial("job_id")
    .references(() => jobs.id)
    .notNull(),
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // "pending", "interviewed", "reviewed"
  cvUrl: varchar("cv_url", { length: 255 }),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobRelations = relations(jobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobs.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [jobs.createdById],
    references: [users.id],
  }),
  candidates: many(jobCandidates),
}));

export const jobCandidateRelations = relations(jobCandidates, ({ one }) => ({
  job: one(jobs, {
    fields: [jobCandidates.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [jobCandidates.userId],
    references: [users.id],
  }),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobCandidate = typeof jobCandidates.$inferSelect;
export type NewJobCandidate = typeof jobCandidates.$inferInsert;
