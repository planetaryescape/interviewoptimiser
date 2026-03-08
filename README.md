# Interview Optimiser

AI voice interview practice that analyses not just what you say, but how you say it -- tone, hesitation, enthusiasm, and confidence.

## Quick Start

```bash
git clone git@github.com:planetaryescape/interviewoptimiser.git
cd interviewoptimiser
bun install
```

### Secrets

**With Doppler** (recommended):
```bash
doppler setup
```

**Without Doppler** -- copy `.env.example` and add keys from each service below:
```bash
cp .env.example .env.local
```

### Database

```bash
bun run db:migrate:dev
```

### Run

```bash
bun run dev
```

Visit `http://localhost:3000`.

## External Services

| Service | Purpose | Get Keys |
|---------|---------|----------|
| [Clerk](https://clerk.com) | Authentication | Dashboard > API Keys |
| [Hume AI](https://hume.ai) | Voice-to-voice interviews | Platform > API Keys |
| [Stripe](https://stripe.com) | Payments | Developers > API Keys |
| [OpenAI](https://platform.openai.com) | AI analysis | API Keys |
| PostgreSQL | Database | Local or hosted (Neon, Supabase) |
| [AWS S3](https://aws.amazon.com/s3/) | Audio file storage | IAM > Access Keys |
| [Upstash Redis](https://upstash.com) | Rate limiting, caching | Console > REST API |
| [Sentry](https://sentry.io) | Error monitoring | Settings > Client Keys |

All keys are managed via Doppler. See `.env.example` for variable names.

## Commands

```bash
bun run dev              # Dev server (Doppler injects secrets)
bun run build            # Production build
bun run test             # Run tests
bun run lint:fix         # Fix linting (Biome)
bun run typecheck        # TypeScript check
bun run db:studio        # Drizzle Studio GUI
bun run dev:webhooks     # Start ngrok for webhook testing
```

## Project Structure

```
src/app/                 # Next.js pages and API routes
lib/ai/                  # AI analysis and interview logic
lib/db/                  # Database schema, queries, migrations
lib/inngest/             # Background job processing
lib/utils/               # Shared utilities
src/components/          # React components
src/emails/              # Email templates (React Email)
terraform/               # AWS infrastructure (Lambda, S3)
docs/                    # Detailed documentation
```

## Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL, Drizzle ORM
- **AI/Voice**: Hume AI Voice SDK, AI SDK v6 + OpenAI
- **Auth**: Clerk
- **Payments**: Stripe
- **Background Jobs**: Inngest
- **Storage**: AWS S3, CloudFront
- **Monitoring**: Sentry, PostHog

## Documentation

- [Technical Architecture](docs/technical-spec.md)
- [Product Spec](docs/product/prd.md)
- [Development Guides](docs/development/) -- auth, audio, caching, migrations
- [Security](docs/security/) -- CSRF, webhooks, rate limiting

## Contributing

1. Fork and clone
2. Create feature branch
3. Use Bun exclusively (never npm/yarn)
4. Biome for linting (not ESLint)
5. Commit format: `type: description`
6. Run `bun run lint:fix && bun run typecheck` before PRs

## License

MIT
