# Interview Optimiser - Product Requirements Document (PRD)

1. Product Overview

Interview Optimiser is an AI-powered interview practice platform designed to provide real-time, voice-to-voice interview simulations with advanced feedback and analysis. In its new phase, the product extends its capabilities to cater to recruiters and HR professionals, allowing them to streamline their candidate evaluation process.

2. Core Value Proposition

The platform now offers:
• Real voice-to-voice interaction with AI for candidates.
• Emotional and prosody analysis of responses.
• Comprehensive performance analytics and tailored feedback.
• B2B tools for recruiters to create, manage, and evaluate job-specific interviews.
• Streamlined candidate tracking and reporting.

3. User Journey

3.1 For B2C Customers (Candidates)

1. CV Upload/Input
   Candidates upload their CV, which is analyzed to tailor interview questions.
2. Job Description Input
   The target job description helps the AI simulate a realistic interview experience.
3. Interview Configuration
   Candidates select interview type and duration, then proceed to the interview.
4. Interview Experience
   Candidates interact with AI in real-time and receive feedback post-interview.
5. Performance Report
   A detailed report helps candidates identify strengths and areas for improvement.

3.2 For B2B Users (Recruiters and HR Professionals)

1. Account Setup
   Recruiters create a dedicated account, landing on a dashboard customized for job management.
2. Jobs Page
   • A centralized page listing all the jobs created by the recruiter.
   • Features a “Create Job” button to start the job creation process.
3. Job Creation Wizard
   • Step 1: Job description input.
   • Step 2: Specify key candidate assessment criteria (optional).
   • Step 3: Select interview type and duration.
   • Step 4: Finalize and create the job.
4. Job Details Page
   • Displays job-specific information, including a unique shareable link for candidates.
   • Link format: /jobs/<job-id>/share.
5. Candidate Flow
   • Candidates accessing the shareable link are prompted to:
   • Create an account.
   • Upload their CV.
   • Provide basic details (name, contact information).
   • Start the AI-driven interview.
   • Link format for interviews: /jobs/<job-id>/interviews/<interview-id>/.
6. Candidate Management
   • Recruiters access a list of candidates for a job, available at /jobs/<job-id>/candidates/.
   • Clicking a candidate displays their details and tailored report at /jobs/<job-id>/candidates/<candidate-id>/.
7. Tailored Reports for Recruiters
   • Recruiters receive detailed reports focused on job-specific criteria and AI evaluations for each candidate.

8. Key Features

4.1 B2B Features

• Job Management Dashboard
A centralized interface for creating, managing, and tracking jobs.
• Job Creation Wizard
Guided workflow for defining job details, assessment criteria, and interview configurations.
• Candidate Management
Tools for tracking candidate progress and accessing detailed reports.
• Recruiter-Specific Reports
AI-generated insights tailored to the recruiter’s job-specific requirements.
• Candidate Onboarding via Shareable Links
Simplified candidate access to job-specific interviews.

4.2 Core Platform Features

• Real-time voice interaction.
• Adaptive AI responses based on CV and job description.
• Comprehensive performance analytics.
• Emotional and prosody analysis.
• Industry-specific interview types and templates.

5. User Interface Components

5.1 For Candidates

• Interview Dashboard
Access to practice sessions, performance reports, and resource libraries.
• Interview Interface
• Real-time voice interaction.
• Visual progress indicators.
• Feedback and performance analytics.

5.2 For Recruiters

• Recruiter Dashboard
• Jobs Page: Lists all jobs with options to create new ones.
• Candidate Management: Track and evaluate candidates for specific jobs.
• Job Creation Wizard
• Multi-step process for defining job and interview details.
• Candidate Reports
Tailored insights highlighting candidate suitability based on job criteria.

6. Technical Requirements

6.1 Frontend

• Framework: Next.js with App Router.
• Styling: Tailwind CSS.
• Responsive Design: Fully optimized for desktop and mobile devices.

6.2 Backend

• AI Integration: For tailored interview processing and feedback generation.
• Voice Processing: Real-time interaction capabilities.
• Data Management: Secure storage of job, candidate, and report data.
• Notifications: Email alerts for both recruiters and candidates.

6.3 APIs

• Recruiter API:
• Endpoints for job creation, retrieval, and management.
• Candidate tracking and reporting.
• Candidate API:
• Endpoints for CV uploads, interview initiation, and report retrieval.

7. Success Metrics

• For B2C:
• Candidate engagement and completion rates.
• Improvements in candidate interview performance.
• For B2B:
• Number of jobs created.
• Candidate submissions per job.
• Recruiter satisfaction with tailored reports.

8. Future Enhancements

• B2B Integrations:
• Integration with ATS (Applicant Tracking Systems) for seamless workflows.
• Advanced Analytics:
• Deeper insights into candidate performance trends.
• Enhanced Reports:
• Role-based recommendations and comparison metrics for recruiters.
• Mobile App for Recruiters:
• Access to job management and candidate tracking on the go.
• Custom Branding:
• White-label solutions for enterprise clients.

## Work Breakdown Structure

Feature 1: Recruiter Account Management

1.1 Backend
• Extend the authentication system to support recruiter roles.
• Implement role-based access control (RBAC) to differentiate between recruiter and candidate accounts.

1.2 Frontend
• Create a recruiter-specific onboarding flow.
• Design and implement a recruiter dashboard layout as a landing page.

1.3 Testing
• Verify recruiter-specific login and role-based access control.

Feature 2: Jobs Page

2.1 Backend
• Create APIs to list, create, update, and delete jobs for a recruiter.
• Implement data structures to store job-related information (e.g., job description, criteria, interview settings).

2.2 Frontend
• Design the Jobs page UI with:
• List of jobs created by the recruiter.
• Actions for creating, editing, and deleting jobs.

2.3 Testing
• Validate job CRUD operations.
• Ensure correct association between recruiters and jobs.

Feature 3: Job Creation Wizard

3.1 Backend
• Implement APIs for creating a job through multi-step submissions:
• Step 1: Input job description.
• Step 2: Specify candidate assessment criteria.
• Step 3: Configure interview type and duration.

3.2 Frontend
• Build a multi-step wizard for job creation:
• UI for each step with validation.
• Confirmation page showing the completed job details.

3.3 Testing
• Validate seamless navigation through the wizard.
• Test data persistence at each step.

Feature 4: Shareable Job Links

4.1 Backend
• Create an API to generate a unique, secure shareable link for each job.
• Validate link expiration and security.

4.2 Frontend
• Display the shareable link prominently on the job details page.
• Design a landing page for candidates visiting the link.

4.3 Testing
• Test link generation, access, and security.
• Verify correct navigation from the link to candidate onboarding.

Feature 5: Candidate Onboarding (Job-Specific Flow)

5.1 Backend
• Adapt existing APIs to handle job-specific candidate data (e.g., associating candidates with a job).
• Validate candidate data submission.

5.2 Frontend
• Build candidate-facing pages accessible via the shareable link:
• Input form for candidate CV and basic details (name, contact info).
• Redirect to the interview start page.

5.3 Testing
• Ensure smooth candidate onboarding and data association with the job.
• Validate error handling for incomplete submissions.

Feature 6: Job-Specific Interviews

6.1 Backend
• Extend the existing interview APIs to link interviews to jobs and recruiters.
• Customize question generation based on recruiter-defined criteria.

6.2 Frontend
• Modify the interview interface for job-specific flows.
• Add indicators showing the job context to the candidate.

6.3 Testing
• Validate the accuracy of job-specific question generation.
• Ensure job and recruiter associations are maintained throughout the interview process.

Feature 7: Candidate List

7.1 Backend
• Create APIs to list all candidates who have applied for a specific job.

7.2 Frontend
• Design the Candidate List page for recruiters:
• Display basic candidate information (e.g., name, submission date).
• Include actions to view individual candidate reports.

7.3 Testing
• Verify the correct association of candidates with their respective jobs.
• Test sorting and filtering options on the Candidate List page.

Feature 8: Candidate Reports

8.1 Backend
• Generate recruiter-specific reports, highlighting:
• Overall performance.
• Job-specific criteria matches.
• Strengths and areas for improvement.

8.2 Frontend
• Design a recruiter-friendly report view:
• Key metrics emphasized.
• Download option for reports.

8.3 Testing
• Ensure accuracy and clarity of report data.
• Test report accessibility and download functionality.

Feature 9: Notifications

9.1 Backend
• Automate notifications:
• Notify recruiters when a candidate completes an interview.
• Notify candidates of their results.

9.2 Frontend
• Design notification messages for recruiters and candidates.
• Include notification preferences in recruiter settings.

9.3 Testing
• Validate notification triggers and delivery.
• Ensure notifications are clear and actionable.

Feature 10: Security Enhancements

10.1 Backend
• Implement role-based data access to ensure recruiters can only view their jobs and candidates.
• Secure shareable links against unauthorized access.

10.2 Testing
• Conduct penetration tests on shareable links and APIs.
• Verify data isolation for recruiters.

Feature 11: Deployment and Monitoring

11.1 Deployment
• Deploy features incrementally to production, starting with Recruiter Account Management.
• Migrate new data structures to production.

11.2 Monitoring
• Set up monitoring dashboards for recruiter and candidate activities.
• Track system performance under increased load.

Suggested Build Order

1. Recruiter Account Management.
2. Jobs Page.
3. Job Creation Wizard.
4. Shareable Job Links.
5. Candidate Onboarding.
6. Job-Specific Interviews.
7. Candidate List.
8. Candidate Reports.
9. Notifications.
10. Security Enhancements.
11. Deployment and Monitoring.

This feature-based breakdown allows you to build and release functionality incrementally, providing value to users at each step while maintaining focus on development priorities.

## Schema Updates

Here’s how we can extend your schema with new tables and roles for recruiters and candidates, along with the required relationships for jobs and candidates:

Schema Updates

1. Jobs Table

The jobs table will represent jobs created by recruiters. Each job is associated with a recruiter (user) and can have multiple candidates.

```typescript
import { relations } from "drizzle-orm";
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const jobs = pgTable(
  "jobs",
  (p) => ({
    id: p.serial().primaryKey(),
    recruiterId: p
      .integer()
      .references(() => users.id)
      .notNull(), // Recruiter who created the job
    name: p.varchar({ length: 255 }).notNull(), // Job title
    description: p.text().notNull(), // Detailed job description
    shareLink: p.varchar({ length: 255 }).notNull().unique(), // Unique link to share with candidates
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (jobs) => ({
    recruiterIdIdx: index("jobs_recruiter_id_idx").on(jobs.recruiterId),
  })
);

export const jobRelations = relations(jobs, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [jobs.recruiterId],
    references: [users.id],
  }),
  candidates: many(candidates), // Relation to candidates for the job
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
```

2. Candidates Table

The candidates table tracks users applying for specific jobs. Each candidate is linked to a job and their corresponding interview(s).

```typescript
import { relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { jobs } from "./jobs";
import { interviews } from "./interviews";

export const candidates = pgTable(
  "candidates",
  (p) => ({
    id: p.serial().primaryKey(),
    jobId: p
      .integer()
      .references(() => jobs.id)
      .notNull(), // Job the candidate applied for
    userId: p
      .integer()
      .references(() => users.id)
      .notNull(), // User ID of the candidate
    interviewId: p.integer().references(() => interviews.id), // Optional: Interview tied to this candidate
    status: p.varchar({ length: 50 }).default("pending"), // Status of the candidate (e.g., pending, interviewed, rejected, hired)
    createdAt: p.timestamp().defaultNow().notNull(),
    updatedAt: p.timestamp().defaultNow().notNull(),
  }),
  (candidates) => ({
    jobIdIdx: index("candidates_job_id_idx").on(candidates.jobId),
    userIdIdx: index("candidates_user_id_idx").on(candidates.userId),
  })
);

export const candidateRelations = relations(candidates, ({ one }) => ({
  job: one(jobs, {
    fields: [candidates.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [candidates.userId],
    references: [users.id],
  }),
  interview: one(interviews, {
    fields: [candidates.interviewId],
    references: [interviews.id],
  }),
}));

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
```

3. Roles Update

Extend the roleEnum to distinguish recruiters and candidates:

```typescript
export const roleEnum = pgEnum("role", [
  "user",
  "admin",
  "recruiter",
  "candidate",
]);
```

• Recruiter: Users who create jobs and track candidates.
• Candidate: Users applying for jobs via recruiter share links.

Update the users table to allow these roles.

CRUD Endpoints for Jobs

1. Create Job

Endpoint: POST /api/jobs
Request Body:
• name (string)
• description (string)

Response:
• Job ID
• Shareable link (/jobs/<job-id>/share)

2. Get Jobs

Endpoint: GET /api/jobs
Query Params:
• recruiterId (optional)

Response:
• List of jobs for the authenticated recruiter.

3. Update Job

Endpoint: PUT /api/jobs/:id
Request Body:
• name (optional)
• description (optional)

Response:
• Updated job details.

4. Delete Job

Endpoint: DELETE /api/jobs/:id
Response:
• Success message or error.

CRUD Endpoints for Candidates

1. Create Candidate

Endpoint: POST /api/jobs/:jobId/candidates
Request Body:
• userId (candidate user ID)

Response:
• Candidate ID
• Status: pending

2. Get Candidates

Endpoint: GET /api/jobs/:jobId/candidates
Response:
• List of candidates for the job.

3. Update Candidate Status

Endpoint: PUT /api/candidates/:id
Request Body:
• status (string, e.g., pending, interviewed, hired, rejected)

Relationships Overview

1. Users → Jobs: One recruiter (user) creates many jobs.
2. Jobs → Candidates: Each job has multiple candidates.
3. Candidates → Interviews: Each candidate can have one or more interviews.
4. Reports → Interviews: Reports are generated based on interviews.

This schema ensures scalability and proper tracking for B2B features, while leveraging the existing user, interview, and report structures.
