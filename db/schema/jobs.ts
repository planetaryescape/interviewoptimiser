import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const jobs = pgTable(
  "jobs",
  {
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
  },
  (jobs) => [
    index("jobs_organization_id_idx").on(jobs.organizationId),
    index("jobs_created_by_id_idx").on(jobs.createdById),
    index("jobs_status_idx").on(jobs.status),
    index("jobs_is_deleted_idx").on(jobs.isDeleted),
    index("jobs_org_active_idx").on(jobs.organizationId, jobs.isDeleted),
  ]
);

export const jobCandidates = pgTable(
  "job_candidates",
  {
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
  },
  (jobCandidates) => ({
    jobIdIdx: index("job_candidates_job_id_idx").on(jobCandidates.jobId),
    userIdIdx: index("job_candidates_user_id_idx").on(jobCandidates.userId),
    statusIdx: index("job_candidates_status_idx").on(jobCandidates.status),
    uniqueJobUserIdx: uniqueIndex("job_candidates_job_user_uidx").on(
      jobCandidates.jobId,
      jobCandidates.userId
    ),
  })
);

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
