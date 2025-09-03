# Interview Optimiser

AI-powered voice interview practice that analyzes not just what you say, but how you say it.

## 💰 The Money Feature

**Real-time voice-to-voice AI interviews with prosody analysis** - Our AI doesn&apos;t just transcribe your answers, it analyzes your tone, hesitation, enthusiasm, and confidence levels to give you feedback that actually improves your interview performance.

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourusername/interviewoptimiser.git
cd interviewoptimiser
bun install

# 2. Setup secrets with Doppler
doppler setup

# 3. Run database migrations
bun run db:migrate:dev

# 4. Start development server
bun run dev
```

Visit `http://localhost:3000` and upload your CV to start practicing.

## 📦 Requirements

- Node.js 18+
- Bun package manager
- PostgreSQL
- Doppler account (for secrets)
- AWS account (for S3 storage)

## 🔧 Essential Commands

```bash
bun run dev              # Start development server
bun run build            # Production build
bun run test             # Run tests
bun run lint:fix         # Fix linting issues
bun run typecheck        # Check TypeScript types
bun run db:studio        # Open Drizzle Studio GUI
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, ShadCN/UI
- **Backend**: PostgreSQL, Drizzle ORM, Next.js API Routes
- **AI/Voice**: OpenAI, Hume AI Voice SDK
- **Auth**: Clerk
- **Storage**: AWS S3
- **Monitoring**: Sentry

## 📚 Documentation

- [Technical Architecture](docs/technical-spec.md) - System design and API docs
- [Product Spec](docs/prd.md) - Features and roadmap
- [Development Guide](CLAUDE.md) - Patterns and conventions
- [Security](docs/security/) - CSRF, webhooks, rate limiting

## 🤝 Contributing

1. Fork and clone
2. Create feature branch
3. Make changes with tests
4. Run `bun run lint:fix && bun run typecheck`
5. Submit PR

## 📄 License

MIT

---

Built for indie developers shipping fast 🚀