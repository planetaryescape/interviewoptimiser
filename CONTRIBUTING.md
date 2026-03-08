# Contributing to Interview Optimiser

Thanks for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Bun](https://bun.sh) (latest stable)
- Node.js 20+
- PostgreSQL (local or hosted via Neon, Supabase, etc.)
- Accounts for external services (see [External Services](#external-services))

## Setup

```bash
git clone https://github.com/planetaryescape/interviewoptimiser.git
cd interviewoptimiser
bun install
cp .env.example .env.local
# Fill in your API keys in .env.local
bun run db:migrate:dev
bun run dev
```

Visit `http://localhost:3000`.

## External Services

You'll need API keys from these services to run the full app locally:

| Service | Purpose | Required |
|---------|---------|----------|
| [Clerk](https://clerk.com) | Authentication | Yes |
| [Hume AI](https://hume.ai) | Voice interviews | Yes |
| [OpenAI](https://platform.openai.com) | AI analysis | Yes |
| PostgreSQL | Database | Yes |
| [Stripe](https://stripe.com) | Payments | For payment features |
| [AWS S3](https://aws.amazon.com/s3/) | Audio storage | For audio features |
| [Upstash Redis](https://upstash.com) | Rate limiting | For rate limiting |

See `.env.example` for all variable names and descriptions.

## Development Workflow

1. Fork the repo and create a feature branch from `main`
2. Make your changes
3. Run checks before submitting:
   ```bash
   bun run lint:fix
   bun run typecheck
   bun run test
   ```
4. Open a pull request against `main`

## Code Standards

- **Package manager**: Bun exclusively. Never use npm or yarn.
- **Linting**: Biome (not ESLint/Prettier). Run `bun run lint:fix`.
- **TypeScript**: Strict mode. No `any` types without justification.
- **Commit format**: `type: description` (e.g., `fix: resolve login redirect`, `feat: add voice settings`)
- **HTML entities in JSX**: Use `&apos;` `&quot;` `&amp;` `&lt;` `&gt;`
- **Data fetching**: React Query (TanStack Query). Never `useEffect` for fetching.
- **Next.js 15**: Dynamic route params are async -- always `await props.params`.

## Project Structure

```
src/app/                 # Next.js pages and API routes
lib/ai/                  # AI analysis and interview logic
lib/db/                  # Database schema, queries, migrations
lib/inngest/             # Background job processing
lib/utils/               # Shared utilities
src/components/          # React components
src/emails/              # Email templates (React Email)
terraform/               # AWS infrastructure
```

## Useful Commands

```bash
bun run dev              # Dev server
bun run build            # Production build
bun run test             # Run tests
bun run test:watch       # Watch mode
bun run lint:fix         # Fix linting
bun run typecheck        # TypeScript check
bun run db:studio        # Drizzle Studio GUI
```

## Reporting Bugs

Use the [bug report template](https://github.com/planetaryescape/interviewoptimiser/issues/new?template=bug_report.yml) on GitHub.

## Security Vulnerabilities

Please report security issues privately. See [SECURITY.md](SECURITY.md) for details.
