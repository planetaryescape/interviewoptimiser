# ID Obfuscation Implementation Plan - Interview Optimiser

**Generated**: 2025-10-12
**Status**: Planning Complete - Ready for Implementation

---

## 📊 Analysis Summary

### API Routes Inventory (55 total)

#### Routes with [id] Parameters (Need Decoding)
1. `/api/customisations/[id]/route.ts`
2. `/api/feature-requests/[id]/route.ts`
3. `/api/page-settings/[id]/route.ts`
4. `/api/changelogs/[id]/route.ts`
5. `/api/invitations/[id]/route.ts`
6. `/api/organizations/[id]/route.ts`
7. `/api/organizations/[id]/members/route.ts`
8. `/api/organizations/[id]/members/[memberId]/route.ts`
9. `/api/interviews/[id]/route.ts`
10. `/api/interviews/[id]/audio-reconstruction/route.ts`
11. `/api/job-descriptions/[jobId]/route.ts`
12. `/api/jobs/[jobId]/route.ts`
13. `/api/jobs/[jobId]/interviews/route.ts`
14. `/api/jobs/[jobId]/interviews/[interviewId]/route.ts`
15. `/api/jobs/[jobId]/reports/route.ts`
16. `/api/jobs/[jobId]/reports/[reportId]/route.ts`
17. `/api/reports/[id]/route.ts`
18. `/api/reports/[id]/question-analyses/route.ts`
19. `/api/public/chats/[id]/route.ts`
20. `/api/public/reports/[id]/route.ts`

#### Routes Returning Lists (Need Encoding)
1. `/api/changelogs/route.ts`
2. `/api/feature-requests/route.ts`
3. `/api/reviews/route.ts`
4. `/api/interviews/route.ts`
5. `/api/jobs/route.ts`
6. `/api/invitations/route.ts`
7. `/api/organization-members/route.ts`
8. `/api/organizations/route.ts`
9. `/api/recruitment/questions/route.ts`
10. `/api/admin/jobs/route.ts`
11. `/api/public/reviews/route.ts`

#### Routes Creating Entities (Need Encoding)
1. `/api/interviews/route.ts` (POST)
2. `/api/jobs/route.ts` (POST)
3. `/api/organizations/route.ts` (POST)
4. `/api/invitations/route.ts` (POST)
5. `/api/feature-requests/route.ts` (POST)
6. `/api/reviews/route.ts` (POST)

#### Routes Not Requiring Changes
1. `/api/create-checkout-session/route.ts`
2. `/api/create-black-friday-checkout/route.ts`
3. `/api/webhooks/stripe/route.ts`
4. `/api/webhooks/auth/route.ts`
5. `/api/extract/*` (all extraction endpoints)
6. `/api/generate-pdf/route.ts`
7. `/api/generate-docx/route.ts`
8. `/api/csrf-token/route.ts`
9. `/api/lookups/countries/route.ts`
10. `/api/public/users/count/route.ts`
11. `/api/public/statistics/route.ts`
12. `/api/analytics/returning-users/route.ts`
13. `/api/admin/cache-stats/route.ts`
14. `/api/users/route.ts`
15. `/api/users/minutes/decrement/route.ts`
16. `/api/dashboard/summary/route.ts`
17. `/api/report/route.ts`
18. `/api/auth/sync/route.ts`

---

## 🎯 Entity Encoders Needed

### Primary Entities

```typescript
// Interview domain
encodeJob()
encodeInterview()
encodeReport()
encodeQuestionAnalysis()

// Organization/Team domain
encodeOrganization()
encodeOrganizationMember()
encodeInvitation()

// User domain
encodeUser()
encodeCustomisation()
encodePageSettings()

// General domain
encodeFeatureRequest()
encodeReview()
encodeChangelog()
```

### Entity Relationships

```
Job (1) → (N) Interviews
Interview (1) → (1) Report
Report (1) → (N) QuestionAnalyses

Organization (1) → (N) OrganizationMembers
Organization (1) → (N) Jobs
Organization (1) → (N) Invitations

User (1) → (N) Jobs
User (1) → (N) Interviews
User (1) → (1) Customisation
User (1) → (1) PageSettings
```

---

## 🔍 Client-Side Code Analysis

### Files with router.push (59 files)
**Critical navigation patterns found in:**
- Job creation → interview creation flow
- Dashboard → Job detail → Interview detail → Report detail
- Admin panels

### Files with useQuery/useMutation (39 files)
**Key data fetching patterns:**
- Jobs list
- Interviews list
- Reports fetching
- Organization management
- User settings

### Files with fetch() calls (29 files)
**Direct fetch usage in:**
- Report generation
- PDF/DOCX export
- Interview audio reconstruction
- Testimonial submission

---

## 🚀 Implementation Phases

### Phase 1: Setup (30 minutes)
- [x] Analysis complete
- [ ] Install hashids package
- [ ] Copy core utilities from cvoptimiser
- [ ] Generate ID_ENCODING_SALT
- [ ] Add to Doppler/environment

### Phase 2: Create Entity Encoders (2 hours)
- [ ] Create encodeHelpers.ts with all encoders
- [ ] Update formatEntity.ts to support string IDs

### Phase 3: Update API Routes (4-5 hours)

#### 3a: Job Routes
- [ ] `/api/jobs/route.ts` (GET, POST)
- [ ] `/api/jobs/[jobId]/route.ts` (GET, PUT, DELETE)
- [ ] `/api/jobs/[jobId]/interviews/route.ts`
- [ ] `/api/jobs/[jobId]/interviews/[interviewId]/route.ts`
- [ ] `/api/jobs/[jobId]/reports/route.ts`
- [ ] `/api/jobs/[jobId]/reports/[reportId]/route.ts`

#### 3b: Interview Routes
- [ ] `/api/interviews/route.ts` (GET, POST)
- [ ] `/api/interviews/[id]/route.ts` (GET, PUT, DELETE)
- [ ] `/api/interviews/[id]/audio-reconstruction/route.ts`

#### 3c: Report Routes
- [ ] `/api/reports/[id]/route.ts`
- [ ] `/api/reports/[id]/question-analyses/route.ts`

#### 3d: Organization Routes
- [ ] `/api/organizations/route.ts`
- [ ] `/api/organizations/[id]/route.ts`
- [ ] `/api/organizations/[id]/members/route.ts`
- [ ] `/api/organizations/[id]/members/[memberId]/route.ts`
- [ ] `/api/invitations/route.ts`
- [ ] `/api/invitations/[id]/route.ts`
- [ ] `/api/organization-members/route.ts`

#### 3e: General Routes
- [ ] `/api/customisations/[id]/route.ts`
- [ ] `/api/page-settings/[id]/route.ts`
- [ ] `/api/feature-requests/route.ts`
- [ ] `/api/feature-requests/[id]/route.ts`
- [ ] `/api/reviews/route.ts`
- [ ] `/api/changelogs/route.ts`
- [ ] `/api/changelogs/[id]/route.ts`
- [ ] `/api/job-descriptions/[jobId]/route.ts`

#### 3f: Public Routes
- [ ] `/api/public/chats/[id]/route.ts`
- [ ] `/api/public/reports/[id]/route.ts`

### Phase 4: Update Client Code (2-3 hours)

#### 4a: Navigation Updates
- [ ] Job navigation (dashboard → jobs list → job detail)
- [ ] Interview navigation (job → interviews → interview detail)
- [ ] Report navigation (interview → reports → report detail)
- [ ] Admin navigation

#### 4b: Data Fetching Updates (useQuery/useMutation)
- [ ] useJob hook
- [ ] useJobDetails hook
- [ ] useInterviewLogic hook
- [ ] Organization hooks
- [ ] User hooks

#### 4c: Direct Fetch Updates
- [ ] Report generation
- [ ] PDF/DOCX export
- [ ] Interview logic

### Phase 5: Testing (2-3 hours)
- [ ] Test job creation flow
- [ ] Test interview creation flow
- [ ] Test report viewing
- [ ] Test organization management
- [ ] Test public share links
- [ ] Test navigation between all levels
- [ ] Test admin features

---

## ⚠️ High-Risk Areas

### Complex Navigation Hierarchies
```
Dashboard
  └─ Jobs List
      └─ Job Detail [jobId]
          ├─ Interviews List
          │   └─ Interview Detail [interviewId]
          │       └─ Reports List
          │           └─ Report Detail [reportId]
          └─ Job Settings
```

**Action**: Each level must use encoded IDs consistently.

### Multi-Tenant (Organizations)
- Organization IDs used in filtering
- Member IDs for access control
- Invitation IDs for team management

**Action**: Ensure all organization-related IDs are encoded.

### Public Share Links
- `/api/public/chats/[id]`
- `/api/public/reports/[id]`

**Action**: Must work with encoded IDs.

### Real-time Interview Session
- Interview logic uses IDs for Hume AI session
- Audio reconstruction uses interview ID

**Action**: Verify numeric IDs used internally.

---

## 📝 Implementation Notes

### Database Schema Insights (from analysis)

**Primary Tables:**
- `jobs` - Job postings
- `interviews` - Interview sessions
- `reports` - Performance reports
- `question_analyses` - Question-level analysis
- `organizations` - Multi-tenant orgs
- `organization_members` - Team members
- `invitations` - Team invites
- `users` - User accounts
- `customisations` - User preferences
- `page_settings` - PDF export settings

### Foreign Key Relationships to Handle
```typescript
// Interview → Job
interview.jobId (decode on update)

// Report → Interview
report.interviewId (decode on update)

// QuestionAnalysis → Report
questionAnalysis.reportId (decode on update)

// OrganizationMember → Organization
organizationMember.organizationId (decode on update)

// Job → Organization
job.organizationId (decode on update)
```

---

## ✅ Verification Checklist

### API Routes
- [ ] All [id] parameters decoded with safeDecode
- [ ] All database queries use numeric IDs
- [ ] All responses encoded with entity encoders
- [ ] All responses wrapped in formatEntity/formatEntityList
- [ ] Invalid hash returns 404, not 500

### Client Code
- [ ] No idHandler.encode() calls on client
- [ ] router.push uses IDs as-is
- [ ] Link components use IDs as-is
- [ ] fetch URLs use IDs as-is
- [ ] No manual ID manipulation

### Testing
- [ ] Create → View → Update → Delete flows work
- [ ] Navigation between levels works
- [ ] Public share links work
- [ ] Organization multi-tenancy works
- [ ] Foreign key updates work

---

## 🎯 Success Criteria

1. ✅ All URLs use encoded IDs (no numeric IDs visible)
2. ✅ All API responses contain only encoded IDs
3. ✅ All database operations use numeric IDs
4. ✅ No client-side encoding/decoding
5. ✅ Invalid hashes return 404 errors
6. ✅ All existing tests pass
7. ✅ Navigation flows work end-to-end
8. ✅ Multi-tenant features work correctly

---

**Next Step**: Begin Phase 1 - Setup

