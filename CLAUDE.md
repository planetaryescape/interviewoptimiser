# CLAUDE.md

AI-powered interview practice platform with real-time voice-to-voice simulation (Hume AI), prosody analysis, serving B2C (job seekers) and B2B (recruiters).

## Package Manager

Bun exclusively. Never npm/yarn. Use `bun`, `bunx`, `bun run`.

## Commands

```bash
bun run dev              # Dev server (uses Doppler for secrets)
bun run build            # Production build
bun run build:check      # Typecheck + build
bun run typecheck        # TypeScript check
bun run lint             # Biome lint
bun run lint:fix         # Biome fix
bun run check            # Biome check + fix
bun run test             # Run tests
bun run test:watch       # Watch mode
bun run test:coverage    # With coverage
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate:dev   # Apply migrations
bun run db:studio        # Drizzle Studio GUI
bun run email:dev        # React Email dev server
```

## Key Rules

- Use Doppler for env vars, never commit secrets
- Use HTML entities in JSX: `&apos;` `&quot;` `&amp;` `&lt;` `&gt;`
- Next.js 15: dynamic route params are async -- always `await props.params`
- Database fields use snake_case, TypeScript uses camelCase
- Use transactions for multi-table DB operations
- All API responses use `formatEntity()` / `formatErrorEntity()` helpers
- Use React Query for data fetching, never useEffect
- Public-facing IDs use Hashids encoding
- Naming: files kebab-case, components PascalCase, functions camelCase, DB tables snake_case plural

## Testing Rules

- Do NOT test API route files (`route.ts`) or page files (`page.tsx`) directly
- Extract business logic to `lib/` and test that instead
- Vitest + React Testing Library

## Git Commits

NO Claude Code attribution. NO Co-Authored-By. ONLY user as author.
Format: `type: description` with optional body. No footers.
