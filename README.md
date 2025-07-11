# Interview Optimiser

Interview Optimiser is an AI-powered interview practice platform that provides real-time, voice-to-voice interview simulations with advanced feedback and analysis. The platform serves both individual job seekers (B2C) and recruiters/HR professionals (B2B), creating a comprehensive ecosystem for interview preparation and candidate evaluation.

## Features

### For Job Seekers (B2C)

- Real-time voice-to-voice AI interview simulations
- Immediate feedback and performance assessment
- Detailed analytics on communication, technical knowledge, and problem-solving skills
- Emotional and prosody analysis of responses
- Personalized improvement recommendations
- Complete interview audio recording and playback capabilities

### For Recruiters (B2B)

- Tools to create, manage, and evaluate job-specific interviews
- Streamlined candidate tracking and reporting
- AI-driven candidate assessment based on specific job criteria
- Time-saving pre-screening capabilities
- Data-driven insights for hiring decisions
- Interview recording archive for compliance and review

## Tech Stack

- **Frontend**: Next.js 15+ with App Router, React 19, Tailwind CSS, ShadCN/UI
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack React Query
- **Backend**: Next.js API Routes & Server Components
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: ReactEmail & Resend
- **Authentication**: Clerk
- **Storage**: AWS S3 with CloudFront CDN
- **Monitoring**: Sentry, Pino Logger
- **AI & Voice**: OpenAI API, Hume AI Voice SDK
- **Infrastructure**: AWS via Terraform
- **CI/CD**: GitHub Actions
- **Secret Management**: Doppler

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- PostgreSQL database
- AWS account
- Doppler for secrets management

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/interviewoptimiser.git
cd interviewoptimiser
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables using Doppler:

```bash
doppler setup
```

**Important**: Ensure the following critical environment variable is set:
- `ID_ENCODING_SALT`: A secure random string used for encoding IDs. Generate one using `openssl rand -base64 32`

See `.env.example` for a complete list of required environment variables.

4. Run database migrations:

```bash
bun run db:migrate
```

5. Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

## Documentation

- [Product Requirements Document](docs/prd.md)
- [Technical Specification](docs/technical-spec.md)
- [Design Specification](docs/design-spec.md)
- [Development Roadmap](docs/roadmap.md)
- [Audio Recording System](docs/audio-recording.md)

## Testing

We use Vitest for testing. Run the test suite with:

```bash
bun run test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your PR adheres to our coding standards and includes appropriate tests.

## Development Guidelines

- Write clean, simple, readable code
- Keep files small and focused
- Test after every meaningful change
- Use clear, consistent naming
- Document functions using JSDoc
- Prefer named exports
- Use server components by default in Next.js
- Follow accessibility best practices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, please reach out to [your-email@example.com]

## Acknowledgments

- OpenAI for AI capabilities
- Hume AI for voice analysis
- All contributors and maintainers
