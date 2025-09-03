# V2 Landing Page Documentation - Consolidated Archive

**Archive Date:** 2025-09-03  
**Status:** Archived - consolidated from three separate V2 landing page documents  
**Original Documents:**
- `docs/v2/landing-page-redesign.md`
- `docs/v2/new_landing.md` 
- `docs/v2/redesign-technical-spec.md`

---

## Table of Contents

1. [Strategic Overview](#strategic-overview)
2. [B2B-Focused Landing Page Plan](#b2b-focused-landing-page-plan)
3. [RPO Market Positioning](#rpo-market-positioning)
4. [Interactive Features & Content Strategy](#interactive-features--content-strategy)
5. [Technical Development Specification](#technical-development-specification)
6. [SEO & Performance Guidelines](#seo--performance-guidelines)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Strategic Overview

### Core Mission
Interview Optimiser is an AI-powered interview practice platform serving both B2C (job seekers) and B2B (recruiters/HR professionals) markets. The V2 landing page redesign focuses primarily on B2B conversion while maintaining clear pathways for B2C users.

### Key Differentiators
- **Real-time voice-to-voice AI interviews** using Hume AI SDK
- **Prosody analysis** (tone, hesitation, enthusiasm) beyond content analysis
- **Conversational realism** - dynamic, adaptive dialogue vs. static Q&A
- **"Shift-left" efficiency** - interview every candidate from the start
- **Scalable ROI** - demonstrable time and cost savings

---

## B2B-Focused Landing Page Plan

### Visual Theme & Brand Identity

**Color Palette:**
- Two brand primaries (trustworthy deep blue, innovative teal/green accent)
- Range of greys for typography hierarchy
- Distinct CTA color (vibrant coral or optimistic yellow)

**Typography:**
- Clean, modern sans-serif fonts
- Clear hierarchy following British English conventions
- Target Flesch-Kincaid score ≥ 60 for readability

**Imagery & Layout:**
- Custom 3-colour isometric SVGs or bespoke illustrations
- Avoid stock photography
- Generous whitespace, mobile-first grid
- 4px or 8px baseline rhythm

### Page Structure & Components

#### 0. Global Shell (Persistent Elements)
**Navigation Components:**
- Logo (left) - links to home
- Navigation links (right): "Product", "How It Works", "Pricing", "Resources"
- **Dual CTAs:**
  - B2C Path (Ghost Button): "Practice for Free"
  - B2B Path (Solid Button): "Book a Demo"
- **Sticky Header:** Appears after ~80px scroll with backdrop-blur effect

#### 1. Hero Section (~90vh Height)
**Layout:** 50/50 responsive split

**Copy (Left Side):**
- **H1:** "Live, adaptive AI interviews—at any scale."
- **Sub-headline:** "Give every candidate a pressure-tested conversation, cut hiring time in half, and surface talent your competitors miss."
- **Primary B2B CTA:** "Book a Discovery Call"
- **Secondary B2B CTA:** "Watch 60-sec Demo" (modal with product demo)
- **Interactive CTA:** "Try our AI: 3-min Interview (no sign-up)"
- **B2C Path Micro-copy:** "Job Seeker? Practise your interview skills for free (15 mins daily) →"

**Visual (Right Side):**
- Gradient backdrop (brand-aligned colors)
- 3-second Lottie animation (sound waves, chat bubbles, data points)
- Optimized <150kB, fetchPriority="high"
- Static fallback for prefers-reduced-motion

**Hero Badge Row:**
- "Our AI: Proven & Engaging"
- Statistics: "Over [759+] AI Interviews Conducted | [721+] Minutes of Adaptive Dialogue | [120+] Professionals Advancing"

#### 2. Social Proof Bar
**Components:**
- Compliance badges: SOC 2 Type II, GDPR Compliant
- User trust element: "Trusted by [120+] Professionals to Sharpen Their Interview Skills"
- Reserved space for future B2B client logos

#### 3. Problem → Solution: "Shift-Left" Advantage
**Two-column layout:**

**Pain Points (Column A):**
- Keyword screens miss high-potential talent
- Interview scheduling blocks pipeline
- One-way video feels staged, yields thin insight
- High costs & time drain for initial screening

**Solutions (Column B):**
- Interview every applicant—no CV filter required
- Zero calendar friction—candidates click link, talk anytime
- Proven adaptive dialogue (refined over [759+] sessions)
- Slash screening costs & free up recruiters

#### 4. Feature Spotlight Carousel
**Three cards with custom illustrations:**

1. **True Conversational AI**
   - Dynamic conversation flow with AI listening, probing, pivoting
   - Validated by hundreds of practice users

2. **Dynamic Adaptive Questioning** 
   - Auto-calibrating follow-up questions
   - Performance-based difficulty adjustment
   - Exposes genuine skill ceilings

3. **Comprehensive Candidate Insights**
   - Full recording, transcript, prosody analysis
   - Key competency scores and actionable intelligence
   - Feedback depth praised by career advancers

#### 5. How It Works (Business Flow)
**4-step process with icons:**

1. **Upload Job Description** - AI maps competencies, builds question set
2. **Share Interview Link** - Candidates self-serve, any device/timezone
3. **Review Rich Reports** - Real-time dashboard with recordings/analytics
4. **Identify Top Talent & Export** - Auto-ranked scorecards, ATS integration

**Visual:** Lazy-loaded GIF/video of recruiter dashboard interface

#### 6. Recruiter ROI Band
**Data-focused metrics table:**

| Metric | Typical Process | With Interview Optimiser | Improvement |
|--------|----------------|--------------------------|-------------|
| Time-to-Hire | 38 days | 24–28 days | Up to 37% |
| Recruiter Hours/Hire | 3.5 hrs | < 0.4 hrs | Over 80% |
| Candidate Experience | Variable | Consistently Positive | Enhanced Brand |

**Caption:** "Illustrative ROI based on typical hiring metrics and Interview Optimiser's automation capabilities."

#### 7. Enterprise-Ready Trust Section
**Security & Integration:**
- Compliance badges: SOC 2 Type II, GDPR, ISO 27001
- ATS integration logos: Greenhouse, Lever, Workday
- Custom data residency options for regulated industries

#### 8. B2B Testimonials/User Reviews
**Content Strategy:**
- Prioritize B2B pilot feedback when available
- Use strong anonymized B2C reviews framed for B2B relevance
- Focus on: realism, feedback depth, confidence gained
- Target replacement with direct B2B client testimonials

#### 9. Candidate Practice Zone (B2C Focus)
**Distinct visual styling for job seekers:**
- **Headline:** "Job Seekers: Ace Your Next Interview – Practise for Free!"
- **Stats Grid:**
  - [721+] Minutes of Live Interview Practice Logged
  - [759+] Adaptive AI Interviews Successfully Completed
  - [120+] Career Journeys Enhanced Through Practice
- **CTA:** "Start Your Free Daily Practice"

#### 10. Pricing Preview (B2B Focus)
**Three-tier structure:**
- Growth Tier, Scale Tier, Enterprise Suite
- Feature bullets without displayed prices
- CTAs: "Contact Sales" or "Request Custom Quote"

#### 11. FAQ Accordion
**Key questions with structured data markup:**
- How does adaptive difficulty AI work?
- Company and candidate data security measures
- Customization of competency models and questions
- AI transparency and candidate awareness
- Free practice for individuals

#### 12. Conversion Footer/Final Contact Section
**Components:**
- Headline: "Ready to Revolutionise Your Hiring?"
- Contact form: Work email, company name, brief message
- Primary CTA: "Book a Discovery Call"
- Secondary links: Documentation, API status, privacy policy
- Footer note: Copyright and company registration details

---

## RPO Market Positioning

### Key Positioning Pillars

**Updated Messaging:**
- Current: "Live, adaptive AI interviews—at any scale."
- RPO-focused: "AI interview automation built for RPO & embedded talent teams."

**Market Context:**
- RPO demand exploding to US $22.9B by 2030
- AI-first screening is #1 requested add-on from RPO buyers
- CV parsing alone misses 26% of qualified candidates
- Average time-to-fill stuck at 43 days

### RPO-Specific Features

**"Built for RPO Playbooks" Section:**
- White-label ready, multi-tenant dashboards
- SOC 2 & GDPR compliance
- REST hooks for Workday, Taleo & AMS One
- Partner stack logos for social proof

**Case Study Integration:**
- Pilot: Randstad RPO — Pharma Ramp-Up
- 692 hires in 7 months
- 8 recruiter days saved per week
- 93% offer-acceptance rate
- Gated PDF as lead magnet

### SEO Optimization for RPO Market

**Primary Keywords:**
- recruitment process outsourcing technology
- RPO interview automation
- AI screening platform
- reduce time-to-fill
- cost-per-hire savings
- ATS integration
- structured interview AI
- GDPR compliant hiring tech

**Content Strategy:**
- Blog series: "RPO 101" (definition, models, pricing)
- Whitepaper: "Interview-First Screening: 3x ROI for RPO Providers"
- Webinar partnerships with RPOA analysts
- Glossary pages for RPO/MSP/ATS definitions

---

## Interactive Features & Content Strategy

### New Interactive Components

#### 1. Upload & Analyze Demo (5-minute feature)
**Flagship interactive element:**
- Drop-zone component (accepts .mp4/.mp3)
- Progress bar with breathing animation
- Synthetic insight card showing sentiment, talk-ratio, skill tags
- Implementation: @uppy/js + presigned-URL

#### 2. Interactive ROI Calculator
**Input Fields:**
- Hires per year
- Average salary
- Recruiter FTE cost

**Outputs:**
- Dollar savings and days saved
- Backed by SHRM baseline: Cost-per-Hire $4,700, Time-to-Fill 42 days
- Visual charts using Recharts with CSS variables

#### 3. Dual-Persona Hero Enhancement
**Updated hero messaging:**
- H1: "AI-powered interview insights in 5 minutes — at RPO scale."
- Sub: "Upload recordings or run interviews natively; cut average time-to-fill from 42→27 days."

### Enhanced Proof Elements

#### Credibility Bar
- Logo strip: Randstad, Cielo, NHS, Capitec
- Tooltips reveal metrics: "95% direct-source hires"

#### Case Study Carousel
- Swiper.js with 3D-coverflow effect
- Cards cycling through client snippets
- CTA: "Read full PDF"
- Autoplay with pause on hover

#### Integration Matrix
- ATS logos in hex grid layout
- Hover reveals code snippets
- Systems: Workday, SuccessFactors, Greenhouse, Lever, SAP

---

## Technical Development Specification

### Tech Stack & Architecture

**Framework & Libraries:**
- Next.js 15+ (App Router) with React 19
- shadcn/ui components with Tailwind CSS
- next-themes for theming
- Biome for linting/formatting
- Animation: Lottie for hero, CSS transitions/Framer Motion for complex interactions
- Testing: Vitest/React Testing Library + Playwright for E2E

**Development Principles:**
- Default to Server Components for performance
- Client Components ('use client') only for interactivity
- Target directory: `app/(marketing)/recruitment/`

### Project Structure

```
app/(marketing)/recruitment/
├── layout.tsx                    # Page-specific layout & metadata
├── page.tsx                      # Main page component
└── components/
    ├── sections/                 # Page sections
    │   ├── HeroSection.tsx
    │   ├── SocialProofBar.tsx
    │   ├── ProblemSolutionSection.tsx
    │   ├── FeatureSpotlightCarousel.tsx
    │   ├── HowItWorksSection.tsx
    │   ├── RecruiterROIBand.tsx
    │   ├── EnterpriseTrustSection.tsx
    │   ├── B2BTestimonialsSection.tsx
    │   ├── CandidatePracticeZone.tsx
    │   ├── PricingPreviewSection.tsx
    │   ├── FAQSection.tsx
    │   └── ContactFormSection.tsx
    ├── hero/                     # Hero-specific components
    │   ├── HeroCopy.tsx
    │   ├── HeroVisual.tsx
    │   └── HeroBadgeRow.tsx
    └── ui/                       # Page-specific UI components
        ├── SectionWrapper.tsx
        └── SectionTitle.tsx

src/
├── lib/landing/recruitment/
│   ├── constants.ts              # Page-specific constants
│   └── types.ts                  # Page-specific types
└── components/ui/                # Global UI primitives
```

### Key Implementation Details

#### Layout Configuration
```tsx
// app/(marketing)/recruitment/layout.tsx
export const metadata: Metadata = {
  title: `AI-Powered Interview Optimisation | ${SITE_TITLE}`,
  description: `Revolutionise your hiring with AI-driven interviews...`,
  keywords: "AI interview, recruitment AI, candidate screening...",
  openGraph: {
    title: `AI-Powered Interview Optimisation | ${SITE_TITLE}`,
    description: 'Scale your screening, cut hiring time...',
    url: `${BASE_URL}/recruitment`,
  },
};
```

#### Component Patterns
**Server Component (Default):**
```tsx
// sections/HeroSection.tsx
import HeroCopy from '@/components/landing/recruitment/hero/HeroCopy';
import HeroVisual from '@/components/landing/recruitment/hero/HeroVisual';

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] bg-custom-gradient">
      <HeroCopy />
      <HeroVisual />
    </section>
  );
}
```

**Client Component (Interactive):**
```tsx
// hero/HeroVisual.tsx
'use client';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function HeroVisual() {
  return (
    <div className="hero-visual">
      <Lottie animationData={heroAnimation} loop autoplay />
    </div>
  );
}
```

### Phased Development Plan

#### Phase 1: Core Structure
- Layout and page shell setup
- Global navigation bar with sticky header
- Global footer component

#### Phase 2: Hero Section
- Hero UI shell and responsive layout
- Copy section with CTAs and modal integration
- Lottie animation implementation
- Badge row with statistics

#### Phase 3-13: Sequential Section Development
Each section as separate Linear tickets:
- Social proof bar with auto-scroll logos
- Problem/solution comparison
- Feature spotlight carousel
- How it works stepper
- ROI metrics table
- Enterprise trust badges
- Testimonials carousel
- B2C practice zone
- B2B pricing preview
- FAQ accordion with schema
- Contact form with validation

### Shared Utility Components

#### SectionWrapper
```tsx
interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  containerClassName?: string;
}

const SectionWrapper = React.forwardRef<HTMLElement, SectionWrapperProps>(
  ({ children, className, containerClassName, as: Component = 'section', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn("py-12 md:py-16 lg:py-20", className)}
        {...props}
      >
        <div className={cn("container mx-auto px-4 md:px-6", containerClassName)}>
          {children}
        </div>
      </Component>
    );
  }
);
```

---

## SEO & Performance Guidelines

### SEO Implementation

#### Meta Data & Structured Data
**Page-level metadata:**
- Title: "AI Interview Automation for RPO & Embedded Talent | Interview Optimiser" (≤ 60 chars)
- Meta Description: "Replace CV screens with real voice AI interviews. Cut time-to-fill 40%, reduce cost-per-hire—SOC 2, GDPR ready." (≤ 155 chars)
- Canonical URL with hreflang for en-gb, en-us, en-za

**JSON-LD Schema:**
- Organization and WebSite schema in layout
- Product schema for B2B offering
- FAQPage schema for accordion
- BreadcrumbList for navigation

#### Content Optimization
**Keyword Integration:**
- H2s and alt-text optimization
- Internal linking strategy
- External authority link to RPOA stats
- Blog content calendar for RPO topics

### Performance Targets

#### Core Web Vitals
- LCP ≤ 2.5 seconds (mobile)
- INP ≤ 200ms
- Colour contrast ratios ≥ 4.5:1 (WCAG AA)

#### Optimization Techniques
- next/image with priority for LCP elements
- Font loading with next/font
- Lazy loading for below-fold content
- Dynamic imports for heavy client components
- Bundle analysis with @next/bundle-analyzer

#### Accessibility Standards
- Semantic HTML with proper landmark elements
- ARIA attributes for dynamic content
- Focus management for modals and sheets
- prefers-reduced-motion support
- Keyboard navigation support

---

## Implementation Roadmap

### Quick-Win Copy Blocks (Ready to Paste)

**H1 Replacement:**
```
AI Interview Automation for RPO Providers
```

**Sub-hero Sentence:**
```
Run a structured, voice-to-voice interview for every applicant, 24/7, 
and hand hiring managers a ranked shortlist—no agency fees, zero scheduling ping-pong.
```

**Proof Bar:**
```
37% faster time-to-hire | 30-50% lower cost-per-hire | 93% offer-acceptance in pilot
```

### Development Timeline

**Sprint 1 (2 weeks):** Core infrastructure and hero section
**Sprint 2 (2 weeks):** Interactive components (ROI calculator, upload demo)
**Sprint 3 (2 weeks):** Content sections and testimonials
**Sprint 4 (1 week):** SEO optimization and performance tuning
**Sprint 5 (1 week):** Testing, accessibility audit, and launch preparation

### Success Metrics

**Expected Improvements:**
- Average scroll-depth: ~49% → >65%
- Lead-to-MQL rate: 1.8% → 4-6%
- Time-on-page: 1m 22s → 2m 30s
- SEO keyword coverage: 730 → 2,300+ monthly impressions

### Launch Strategy

**Deployment Approach:**
- Feature flag new page at `/recruitment-v2`
- A/B test against current version
- Full redirect once KPIs exceed baseline
- Monitoring with performance budgets

---

## Conclusion

This consolidated V2 landing page specification represents a comprehensive approach to B2B conversion optimization while maintaining B2C pathways. The design emphasizes:

1. **Clear value proposition** for RPO and enterprise buyers
2. **Interactive proof elements** that demonstrate capability
3. **Performance-first technical architecture**
4. **SEO optimization** for competitive keywords
5. **Measurable success criteria** for continuous improvement

The implementation balances modern web development practices with business conversion goals, creating a scalable foundation for Interview Optimiser's growth in both B2B and B2C markets.

---

**End of Consolidated Document**  
*Last Updated: 2025-09-03*