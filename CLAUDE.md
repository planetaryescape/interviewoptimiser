# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interview Optimiser is an AI-powered interview practice platform serving both B2C (job seekers) and B2B (recruiters/HR professionals) markets. It provides real-time voice-to-voice AI interview simulations with advanced feedback and analysis.

### Key Context

- **B2C Market**: Job seekers practicing interviews with AI-powered voice simulation
- **B2B Market**: Recruiters/HR professionals evaluating candidates
- **Core Technology**: Real-time voice-to-voice AI using Hume AI SDK
- **Differentiator**: Prosody analysis (tone, hesitation, enthusiasm) beyond just content

## Development Commands

### Essential Commands

```bash
# Start development server with Doppler secrets
bun run dev

# Run tests
bun run test
bun run test:watch       # Watch mode
bun run test:coverage    # With coverage

# Type checking and linting
bun run typecheck        # Check TypeScript types
bun run lint             # Run Biome linter
bun run lint:fix         # Fix linting issues
bun run check            # Run Biome check and fix

# Build and production
bun run build            # Production build
bun run build:check      # Type check + build
```

### Database Commands

```bash
# Database operations (uses Doppler for env vars)
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate:dev   # Run migrations (development)
bun run db:studio        # Open Drizzle Studio GUI
```

### Email Development

```bash
bun run email:dev        # Start React Email development server
bun run email:build      # Build email templates
```

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TailwindCSS, ShadCN/UI
- **Backend**: PostgreSQL with Drizzle ORM, Next.js API Routes
- **AI/Voice**: OpenAI SDK, Hume AI Voice React
- **Authentication**: Clerk
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack React Query
- **Email**: ReactEmail + Resend
- **Monitoring**: Sentry, PostHog
- **Infrastructure**: AWS (S3, CloudFront, Lambda), Terraform
- **Package Manager**: Bun

### Project Structure

```text
src/
├── app/                   # Next.js 15 app router
│   ├── (auth)/           # Authentication pages
│   ├── (marketing)/      # Public marketing pages
│   ├── api/              # API routes
│   └── dashboard/        # Protected dashboard
├── components/           # Reusable UI components
├── lib/                  # Core utilities and business logic
│   ├── ai/              # AI integration (OpenAI, Hume)
│   ├── auth/            # Authentication helpers
│   └── db/              # Database utilities
├── emails/              # React Email templates
└── hooks/               # Custom React hooks

db/                      # Database schema and migrations
functions/               # AWS Lambda functions
docs/                    # Project documentation
```

## Development Guidelines

### General Rules

1. **Always reference .cursorrules**: Start responses with (Cursorrules referenced...)
2. **Use Bun**: All commands use `bun`, not `npm` or `yarn`
3. **Documentation sync**: Update `/docs` after code changes to prevent drift
4. **Minimize file creation**: Always prefer editing existing files
5. **No unnecessary documentation**: Don't create README/docs unless explicitly requested

### Code Style

- **Variable naming**: Use auxiliary verbs (isLoading, hasError, canEdit)
- **Exports**: Favor named exports for components
- **Styling**: Use ShadCN/UI and Tailwind CSS only
- **Responsive**: Mobile-first approach
- **Special chars**: Use HTML entities (&apos;, &quot;, &amp;, &lt;, &gt;)

### Key Patterns

#### API Routes

**CRITICAL: Dynamic params are async in Next.js 15!**

```typescript
// ❌ WRONG - Will cause build errors
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  // This pattern is deprecated in Next.js 15
}

// ✅ CORRECT - Always use this pattern
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ jobId: string }> }
) {
  const params = await props.params;
  const { jobId } = params;
  // Now you can use jobId
}
```

#### Standard API Pattern

```typescript
import { getUserFromClerkId } from "@/lib/auth";
import { formatEntity, formatErrorEntity } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromClerkId();
    const body = await request.json();
    const validated = schema.parse(body);

    // Business logic here

    return NextResponse.json(formatEntity(data));
  } catch (error) {
    logger.error({ error }, "API error");
    return NextResponse.json(formatErrorEntity(error), { status: 500 });
  }
}
```

#### Database Access

- Use Drizzle ORM for all database operations
- Schema defined in `db/schema/index.ts`
- Snake_case naming convention for database fields
- Always use transactions for multi-table operations
- Index performance-critical queries
- Handle cascade deletes properly

#### Component Development

- Server Components by default
- Use 'use client' only when necessary
- Prefer named exports
- Mobile-first responsive design with Tailwind
- Use ShadCN/UI components as base
- Implement loading states with skeletons
- Add proper TypeScript types

#### Standard Component Pattern

```tsx
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["resource", "id"],
    queryFn: fetchFunction,
  });

  if (isLoading) return <Skeleton />;

  return <div className="space-y-4">{/* Component content */}</div>;
}
```

#### Form Handling

```tsx
// Use React Hook Form with Zod validation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
});

// Validate on server as well
const validatedData = formSchema.parse(formData);
```

#### State Management

- Use Zustand for global client state and complex forms
- Server state via TanStack Query - DO NOT use useEffect for data fetching
- Form state via React Hook Form
- Query keys pattern: [resource, id, params]

#### Data Fetching Patterns

**Always use React Query for network requests:**

```tsx
// ✅ CORRECT
const { data, isLoading } = useQuery({
  queryKey: ["jobs", jobId],
  queryFn: () => fetchJob(jobId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ❌ WRONG - Don't use useEffect
useEffect(() => {
  fetch('/api/jobs').then(...);
}, []);
```

## Testing Guidelines

### Framework & Setup

- **Test Runner**: Vitest with React Testing Library
- **Command**: `bun run test` (not npm/yarn)
- **Test files**: `*.test.ts`, `*.test.tsx`
- **Environment**: jsdom for React components

### Testing Restrictions

**IMPORTANT: Do NOT create tests for:**

- API route files (`route.ts`, `route.tsx`)
- Page component files (`page.tsx`)

**Rationale**: These are Next.js framework endpoints that should be tested through integration/E2E tests.

**What TO test instead:**

- Extract business logic into utility functions in `lib/`
- Create separate components for complex UI logic
- Test utilities and components independently

### Test Patterns

```typescript
// Business logic testing
const result = calculateInterviewScore(data);
expect(result.score).toBe(85);

// Async operations
await expect(processInterview()).resolves.toBe(expected);
await expect(failingOperation()).rejects.toThrow("Error");

// Validation testing
const errors = validateInterviewData(invalidData);
expect(errors).toContain("Duration must be positive");
```

## Important Constraints

- Use Doppler for environment variables
- Never commit secrets or API keys
- Always use encoded HTML entities in JSX (&apos;, &quot;, etc.)
- Follow existing code patterns and conventions
- Update documentation when making changes
- Run tests after changes: `bun run test`
- Always run linting: `bun run lint:fix`
- Type check before committing: `bun run typecheck`

## Naming Conventions

- **Files**: kebab-case (`interview-report.ts`, `job-details.tsx`)
- **Components**: PascalCase (`InterviewContainer`, `DashboardStats`)
- **Functions**: camelCase (`fetchInterviewData`, `calculateScore`)
- **Database**: snake_case plural (`interview_reports`, `job_applications`)
- **API Routes**: RESTful kebab-case (`/api/interview-reports`)
- **IDs**: Hashids for public-facing IDs

## Common Workflows

### 1. Creating New API Endpoints

1. Create route file in `app/api/` following REST conventions
2. Define Zod schema for validation
3. Implement handler with error handling pattern
4. Use `formatEntity()` for responses
5. Add structured logging with Pino

### 2. Adding Database Tables

1. Create schema in `db/schema/`
2. Run: `bun run db:generate && bun run db:migrate:dev`
3. Update `db/schema/index.ts` exports
4. Create type-safe queries using Drizzle

### 3. Building UI Components

1. Use ShadCN/UI components as base
2. Mobile-first responsive design
3. Tailwind CSS only (no custom CSS)
4. Loading states with skeletons
5. Proper TypeScript types

### 4. Multi-step Forms

1. Create Zustand store for form state
2. Implement step components
3. Validate at each step with Zod
4. Use server actions for file processing
5. Show progress indicators

## Voice Interview Flow

1. User uploads CV and job description
2. AI extracts and analyzes content
3. Real-time voice interview via Hume AI
4. Interview recorded and transcribed
5. AI generates detailed performance report with prosody analysis
6. Results stored and accessible via dashboard

## Key Features

### B2C Features (Job Seekers)

- Real-time voice-to-voice AI interviews
- Prosody analysis (tone, hesitation, enthusiasm)
- Detailed performance reports
- Interview history and progress tracking
- Practice mode with various difficulty levels

### B2B Features (Recruiters)

- Organization/team management
- Custom interview templates
- Candidate tracking and comparison
- Bulk interview management
- Analytics and reporting dashboards
- Integration with ATS systems

## Database Schema (Key Entities)

- `users`: User accounts with Clerk integration
- `organizations`: Multi-tenant support
- `jobs`: Job postings with descriptions
- `interviews`: Voice conversation sessions
- `reports`: AI-generated performance analysis
- `customizations`: User preferences and settings
- `questions`: Question banks and templates
