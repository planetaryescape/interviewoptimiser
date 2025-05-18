# Interview Optimiser - Technical Specification

## 1. System Architecture

### 1.1 Overview

Interview Optimiser follows a modern web application architecture using Next.js 15+ with the App Router, leveraging both server and client components. The application is designed to handle complex real-time voice interactions, data processing, and AI-driven analysis.

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Web Application                    │
│                    (Next.js 15 App Router)                   │
└────────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
│         (Next.js API Routes + Server Components)             │
└────────┬─────────────────────┬────────────────┬─────────────┘
         │                    │                 │
         ▼                    ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Database      │  │   Third-Party   │  │     Storage     │
│  (PostgreSQL)   │  │     Services    │  │     (AWS S3)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                           │
                           ▼
               ┌─────────────────────────┐
               │    AI Services Layer    │
               │  (OpenAI, Voice Proc.)  │
               └─────────────────────────┘
```

## 2. Technology Stack

### 2.1 Frontend

- **Framework**: Next.js 15+ with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS, ShadCN/UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack React Query
- **Animation**: Framer Motion
- **Charting**: `recharts` (for data visualization like radar charts)

### 2.2 Backend

- **Framework**: Next.js API Routes & Server Components
- **Database ORM**: Drizzle
- **Email Service**: ReactEmail & Resend
- **Authentication**: Clerk
- **Storage**: AWS S3
- **Monitoring**: Sentry, Pino Logger

### 2.3 AI & Voice Processing

- **NLP & Text Generation**: OpenAI
- **Voice Processing**: Hume AI Voice SDK
- **Voice Synthesis**: OpenAI API

### 2.4 Infrastructure

- **Hosting**: AWS via Terraform
- **CI/CD**: GitHub Actions
- **Secret Management**: Doppler
- **Monitoring**: Sentry
- **Database**: PostgreSQL

## 3. Database Schema

### 3.1 Core Entities

#### Users

- Stores user information including role (user, admin, recruiter)
- Manages authentication credentials and subscription details

#### Organizations

- Represents companies or teams using the B2B features
- Contains organization details and member associations

#### Jobs

- Stores job listings created by recruiters
- Includes job descriptions, requirements, and interview configurations

#### Interviews

- Records interview sessions between candidates and the AI
- Stores metadata, transcripts, and configuration

#### Reports

- Contains AI-generated assessments and feedback
- Linked to specific interviews and includes detailed scoring

#### Job Candidates

- Associates candidates with specific jobs
- Tracks candidate status and progress

### 3.2 Schema Relationships

```
User ----|< Organization Members >|---- Organization
  |                                        |
  |                                        |
  v                                        v
Interview                                 Job
  |                                        |
  |                                        |
  v                                        v
Report                               Job Candidate
```

## 4. API Structure

### 4.1 Authentication APIs

- `/api/auth/*` - Clerk authentication endpoints
- `/api/user` - User management endpoints

### 4.2 Organization APIs

- `/api/organizations` - CRUD operations for organizations
- `/api/organizations/members` - Manage organization memberships

### 4.3 Interview APIs

- `/api/interviews` - Create and manage interviews
- `/api/interviews/[id]/start` - Initiate interview sessions
- `/api/interviews/[id]/transcript` - Record and retrieve interview transcripts

### 4.4 Job Management APIs

- `/api/jobs` - CRUD operations for job listings
- `/api/jobs/[id]/share` - Generate and manage shareable links
- `/api/jobs/[id]/candidates` - Manage candidates for a job

### 4.5 Report & Analytics APIs

- `/api/reports` - Generate and retrieve assessment reports
- `/api/analytics` - Performance metrics and statistics

### 4.6 Voice Processing APIs

- `/api/voice/stream` - Real-time voice streaming
- `/api/voice/analyze` - Voice emotion and prosody analysis

## 5. Client-Side Architecture

### 5.1 Page Structure

- `/` - Marketing landing page
- `/dashboard` - User dashboard
- `/interviews/[id]` - Interview session page
- `/reports/[id]` - Report viewing page
- `/jobs` - Job management (for recruiters)
- `/jobs/[id]` - Job details page
- `/jobs/[id]/candidates` - Candidate tracking page

### 5.2 Component Architecture

- Atomic design methodology:
  - Atoms (buttons, inputs, etc.)
  - Molecules (form groups, card elements)
  - Organisms (complex forms, data tables, specific section components)
  - Templates (page layouts)
  - Pages (complete views)

  **Example Dashboard Components (Organisms/Presentational):**
  - `DashboardHero`: Displays the main hero section of the dashboard.
  - `KeyMetricsSection`: Container for displaying key statistics.
  - `AnimatedStatCard`: Reusable card for individual animated statistics.
  - `PerformanceMetricsSection`: Section for detailed performance metrics, including charts and comparison cards.
  - `ScoreRadarChart`: Component for rendering radar charts (using `recharts`).
  - `ScoreComparisonCard`: Card for comparing two score values (e.g., recent vs. all-time).
  - `RecentActivitySection`: Section for displaying a timeline of recent activities.
  - `ActivityTimelineItem`: Component for an individual item in the activity timeline.

### 5.3 State Management

- Global state via Zustand for:
  - User preferences
  - Interview session state
  - Navigation state
  - Notification management

## 6. Security Considerations

### 6.1 Authentication & Authorization

- JWT-based authentication via Clerk
- Role-based access control (RBAC)
- Secure session management

### 6.2 Data Protection

- Data encryption at rest and in transit
- Secure storage of sensitive information
- Regular security audits

### 6.3 API Security

- Rate limiting
- CORS configuration
- Input validation
- Protection against common web vulnerabilities

## 7. Performance Considerations

### 7.1 Optimization Strategies

- Server-side rendering for initial page loads
- Client-side transitions for smooth navigation
- Code splitting and lazy loading
- Image optimization
- Edge caching

### 7.2 Database Optimization

- Efficient indexing
- Query optimization
- Connection pooling

### 7.3 AI Processing Optimization

- Streaming responses
- Caching common responses
- Asynchronous processing for non-critical operations

## 8. Deployment Architecture

### 8.1 AWS Infrastructure (Managed via Terraform)

- EC2 instances for application hosting
- RDS for PostgreSQL database
- S3 for file storage
- CloudFront for content delivery
- Lambda for serverless functions

### 8.2 CI/CD Pipeline

- GitHub Actions for automated builds and deployments
- Quality gates including testing and linting
- Automated deployment to staging and production environments

### 8.3 Monitoring & Observability

- Sentry for error tracking
- Pino for structured logging
- AWS CloudWatch for infrastructure monitoring

## 9. Testing Strategy

### 9.1 Unit Testing

- Vitest for component and utility function testing
- High coverage requirements for critical components

### 9.2 Integration Testing

- API endpoint testing
- Database interaction testing

### 9.3 End-to-End Testing

- Critical user flow validation
- Cross-browser compatibility testing

## 10. Development Workflow

### 10.1 Version Control

- GitHub for repository hosting
- Branch protection rules
- Pull request review requirements

### 10.2 Development Environment

- Local development with Bun for fast builds
- Doppler for local environment variables
- Docker for local database and service dependencies

### 10.3 Code Quality

- Biome for linting and formatting
- TypeScript for type safety
- Pull request templates and checklists

## 11. Third-Party Integrations

### 11.1 OpenAI

- GPT models for interview simulation
- Voice synthesis for interviewer responses

### 11.2 Hume AI

- Voice emotion and prosody analysis
- Real-time feedback generation

### 11.3 AWS Services

- S3 for document storage (resumes, assessments)
- Lambda for background processing

### 11.4 Stripe

- Subscription management
- Payment processing

### 11.5 Clerk

- User authentication
- Identity management

## 12. Scaling Considerations

### 12.1 Horizontal Scaling

- Stateless application design
- Load balancing across multiple instances

### 12.2 Database Scaling

- Read replicas for high-read scenarios
- Connection pooling and query optimization

### 12.3 AI Processing Scaling

- Queue-based processing for non-real-time tasks
- Caching and rate limiting strategies

## 13. Accessibility

### 13.1 WCAG Compliance

- Target WCAG 2.1 AA compliance
- Regular accessibility audits

### 13.2 Assistive Technology Support

- Screen reader compatibility
- Keyboard navigation
- Color contrast requirements
