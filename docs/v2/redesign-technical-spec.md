# **Interview Optimiser: Landing Page Technical Development Specification (v1.2)**

## **1\. Introduction & Project Overview**

This document outlines the technical specifications for developing the new B2B-focused marketing landing page for Interview Optimiser. This page will be an enhancement to the existing Next.js 15+ application.

**Primary Goal:** Create a high-performance, SEO-friendly, and visually compelling landing page that effectively converts B2B clients while providing a clear path for B2C users.

**Tech Stack:**

- **Framework:** Next.js 15+ (App Router)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Theming:** next-themes
- **Linting/Formatting:** Biome
- **Animation:** Lottie for hero animation, CSS animations/transitions. Framer Motion for complex interactions if necessary (e.g., carousels, though shadcn/ui Carousel with Embla is preferred).
- **Testing:** **Vitest**/React Testing Library with MSW for API mocking. Playwright for E2E tests.
- **Project Management:** Linear

**Target Directory:** All new code for this landing page will reside within app/(marketing)/recruitment/.

**Key Principle:** Default to Next.js Server Components for performance. Explicitly use Client Components ('use client';) only when client-side interactivity (hooks, event handlers) is essential.

## **2\. Project Setup & Configuration**

This section assumes the Next.js project is already set up with Tailwind CSS, shadcn/ui, and next-themes.

### **2.1. Tailwind CSS Configuration**

- The tailwind.config.js (refer to merged_tailwind_config_interview_optimiser artifact) includes the project's color palette as CSS variables.
- The global CSS file (app/globals.css or similar) must define the root CSS variables for the light and dark themes as per the provided color scheme.
- Ensure tailwindcss-animate plugin is installed and configured.

### **2.2. Directory Structure**

- **Main Page:** app/(marketing)/recruitment/page.tsx (Server Component by default).
- **Layout:** app/(marketing)/recruitment/layout.tsx.
- **Components:**
  - Page-specific components for this landing page: src/components/landing/recruitment/ (e.g., src/components/landing/recruitment/sections/HeroSection.tsx).
  - Shared UI primitives (if any new ones are created that are not page-specific but follow shadcn/ui patterns): src/components/ui/.
- **Constants:** src/lib/landing/recruitment/constants.ts for navigation links, CTA text, etc., specific to this landing page. Global constants in src/lib/constants.ts.
- **Types:** src/lib/landing/recruitment/types.ts for page-specific type definitions. Global types in src/lib/types.ts.

### **2.3. Theming**

- ThemeProvider from next-themes should be configured in the root layout (src/app/layout.tsx or similar).
- A theme toggle component should be available (likely in the global site header, outside this specific landing page's scope, but ensure compatibility).

### **2.4. Linting & Formatting**

- Biome configured for linting and formatting.
- package.json scripts: biome check \--apply ., biome format \--write ..

### **2.5. Testing**

- MSW handlers for API mocks (e.g., contact form, demo booking).
- Unit/integration tests for components (Vitest/React Testing Library).
- E2E tests for key user flows (Playwright).

### **2.6. Environment Variables**

- Use .env.local (and other environment-specific files) for any configurable values.
- Examples:
  - NEXT_PUBLIC_PRACTICE_PAGE_URL="/practice"
  - NEXT_PUBLIC_TRY_AI_PAGE_URL="/try"
  - NEXT_PUBLIC_API_BASE_URL="/api" (or full URL for external API)

## **3\. Global Components & Layout (app/(marketing)/recruitment/layout.tsx)**

- **Purpose:** Defines the shared layout, global metadata, and persistent UI for the recruitment landing page.
- **Structure:**
  // app/(marketing)/recruitment/layout.tsx
  import type { Metadata, Viewport } from 'next';
  import { Inter } from 'next/font/google'; // Or your chosen primary project font (e.g., GeistSans from your Tailwind config)
  import NavigationBar from '@/components/landing/recruitment/NavigationBar'; // Updated path
  import Footer from '@/components/landing/recruitment/Footer'; // Updated path
  import { SITE_TITLE, SITE_DESCRIPTION, BASE_URL } from '@/lib/constants'; // Assuming global constants are in src/lib

  // Choose primary font for the page
  const fontSans \= Inter({ subsets: \['latin'\], variable: '--font-sans' }); // Example, align with your project's primary font

  export const metadata: Metadata \= {
  title: \`AI-Powered Interview Optimisation | ${SITE\_TITLE}\`,
    description: \`Revolutionise your hiring with AI-driven interviews. Scale your screening, cut hiring time, and discover top talent with ${SITE\_TITLE}.\`,
    keywords: "AI interview, recruitment AI, candidate screening, hiring automation, interview practice, talent acquisition, B2B hiring solutions",
    metadataBase: new URL(BASE\_URL),
    openGraph: {
      title: \`AI-Powered Interview Optimisation | ${SITE\_TITLE}\`,
      description: 'Scale your screening, cut hiring time, and discover top talent.',
      url: \`${BASE_URL}/recruitment\`, // Dynamic URL for this specific page
  siteName: SITE_TITLE,
  // images: \[{ url: \`${BASE\_URL}/og-recruitment.jpg\`, width: 1200, height: 630 }\], // Specific OG image for this page
      type: 'website',
    },
    twitter: {
      card: 'summary\_large\_image',
      title: \`AI-Powered Interview Optimisation | ${SITE\_TITLE}\`,
      description: \`Revolutionise your hiring with AI-driven interviews.\`,
      // images: \[\`${BASE_URL}/twitter-recruitment.jpg\`\], // Specific Twitter image for this page
  },
  // alternates: {
  // canonical: \`${BASE_URL}/recruitment\`, // Add if needed
  // },
  };

  export const viewport: Viewport \= {
  themeColor: \[ // From your color scheme
  { media: '(prefers-color-scheme: light)', color: 'hsl(30, 20%, 96%)' }, // Example light theme color
  { media: '(prefers-color-scheme: dark)', color: 'hsl(220, 15%, 10%)' }, // Example dark theme color
  \],
  }

  export default function RecruitmentLayout({
  children,
  }: {
  children: React.ReactNode;
  }) {
  return (
  // This layout assumes ThemeProvider is in a higher-level root layout (e.g., src/app/layout.tsx).
  // Ensure html and body in root layout have necessary classes for next-themes and font variables.
  \<div className={\`flex flex-col min-h-screen ${fontSans.variable} font-sans antialiased\`}\>
  \<NavigationBar /\>
  \<main className="flex-grow"\>{children}\</main\>
  \<Footer /\>
  \</div\>
  );
  }

- **Typography Note:** The primary body font (e.g., Inter or geistSans) should be applied via the fontSans.variable and font-sans utility class. Guide developers on specific fonts from your Tailwind config for headings (e.g., font-display) vs. body text.

## **4\. Phased Development Plan (Page & Components)**

Each "Task" should be a distinct ticket in Linear. Code comments are mandatory for non-obvious logic.

### **Phase 1: Core Page Structure & Global Shell**

- **Task 1.1 (Linear: FEAT-XXX: Setup Recruitment Landing Page Layout & Page Shell):**

  - Implement app/(marketing)/recruitment/layout.tsx (as above).
  - Implement app/(marketing)/recruitment/page.tsx (Server Component shell).
    // app/(marketing)/recruitment/page.tsx
    import HeroSection from '@/components/landing/recruitment/sections/HeroSection';
    import SocialProofBar from '@/components/landing/recruitment/sections/SocialProofBar';
    import ProblemSolutionSection from '@/components/landing/recruitment/sections/ProblemSolutionSection';
    import FeatureSpotlightCarousel from '@/components/landing/recruitment/sections/FeatureSpotlightCarousel';
    import HowItWorksSection from '@/components/landing/recruitment/sections/HowItWorksSection';
    import RecruiterROIBand from '@/components/landing/recruitment/sections/RecruiterROIBand';
    import EnterpriseTrustSection from '@/components/landing/recruitment/sections/EnterpriseTrustSection';
    import B2BTestimonialsSection from '@/components/landing/recruitment/sections/B2BTestimonialsSection';
    import CandidatePracticeZone from '@/components/landing/recruitment/sections/CandidatePracticeZone';
    import PricingPreviewSection from '@/components/landing/recruitment/sections/PricingPreviewSection';
    import FAQSection from '@/components/landing/recruitment/sections/FAQSection';
    import ContactFormSection from '@/components/landing/recruitment/sections/ContactFormSection'; // Added for clarity
    // import { Suspense } from 'react'; // Use for client components that might be heavy

    export default function RecruitmentPage() {
    return (
    \<\>
    \<HeroSection /\>
    \<SocialProofBar /\>
    \<ProblemSolutionSection /\>
    \<FeatureSpotlightCarousel /\>
    \<HowItWorksSection /\>
    \<RecruiterROIBand /\>
    \<EnterpriseTrustSection /\>
    \<B2BTestimonialsSection /\>
    \<CandidatePracticeZone /\>
    \<PricingPreviewSection /\>
    \<FAQSection /\>
    \<ContactFormSection /\> {/\* Placed before Footer in the flow \*/}
    \</\>
    );
    }

  - Create src/components/landing/recruitment/sections/ for section components.
  - Create src/components/landing/recruitment/ui/ for any new UI primitives specific to this landing page (if not general enough for src/components/ui/).

- **Task 1.2 (Linear: FEAT-XXX: Develop Global Navigation Bar):**
  - **Component:** src/components/landing/recruitment/NavigationBar.tsx ('use client'; required for sticky header state).
  - **Sub-Components:**
    - Logo: next/link \+ next/image (optimized SVG/PNG).
    - Nav Links (shadcn/ui NavigationMenu or custom): Data from src/lib/landing/recruitment/constants.ts.
    - B2C CTA: shadcn/ui Button (variant="ghost"). Text from constants. Link from env.NEXT_PUBLIC_PRACTICE_PAGE_URL.
    - B2B CTA: shadcn/ui Button. Text from constants. Action to open demo modal/form or link.
  - **Interactivity (Sticky Header):** useState, useEffect for scroll detection. Apply bg-background/75 backdrop-blur-sm shadow-md on scroll.
  - **Mobile Menu:** shadcn/ui Sheet or DropdownMenu.
- **Task 1.3 (Linear: FEAT-XXX: Develop Global Footer):**
  - **Component:** src/components/landing/recruitment/Footer.tsx (Server Component).
  - **Sub-Components:** Copyright, links (from src/lib/landing/recruitment/constants.ts), social media icons (lucide-react or SVGs).

### **Phase 2: Hero Section (§1)**

- **Task 2.1 (Linear: FEAT-XXX: Build Hero Section UI Shell):**
  - **Component:** src/components/landing/recruitment/sections/HeroSection.tsx (Server Component).
  - **Sub-Components:** HeroCopy.tsx (SC), HeroVisual.tsx (CC for Lottie), HeroBadgeRow.tsx (SC). Place these in src/components/landing/recruitment/hero/.
  - **Styling:** min-h-\[90vh\], bg-custom-gradient.
- **Task 2.2 (Linear: FEAT-XXX: Develop Hero Section Copy & CTAs):**
  - **Component:** src/components/landing/recruitment/hero/HeroCopy.tsx (Server Component).
  - **Interactivity:**
    - "Watch 60-sec Demo": Trigger HeroDemoModal.tsx ('use client';) using shadcn/ui Dialog.
    - "Try our AI...": next/link to env.NEXT_PUBLIC_TRY_AI_PAGE_URL.
    - Micro-copy: Anchor link \#candidate-zone.
- **Task 2.3 (Linear: FEAT-XXX: Implement Hero Section Visual (Lottie)):**
  - **Component:** src/components/landing/recruitment/hero/HeroVisual.tsx ('use client';).
  - **Lottie Player:** lottie-react. Consider dynamic(() \=\> import('lottie-react'), { ssr: false }).
  - **Asset:** /public/animations/hero-animation.lottie.json.
- **Task 2.4 (Linear: FEAT-XXX: Develop Hero Badge Row):**
  - **Component:** src/components/landing/recruitment/hero/HeroBadgeRow.tsx (Server Component).

### **Phase 3: Social Proof Bar (§2)**

- **Task 3.1 (Linear: FEAT-XXX: Build Social Proof Bar):**
  - **Component:** src/components/landing/recruitment/sections/SocialProofBar.tsx (Server Component).
  - **Auto-scroll for logos:** Use react-fast-marquee (will make this component a Client Component).

### **Phase 4: Problem → Solution Section (§3)**

- **Task 4.1 (Linear: FEAT-XXX: Develop ProblemSolutionSection):**
  - **Component:** src/components/landing/recruitment/sections/ProblemSolutionSection.tsx (Server Component).
  - **Icons:** lucide-react.

### **Phase 5: Feature Spotlight Carousel (§4)**

- **Task 5.1 (Linear: FEAT-XXX: Implement Feature Spotlight Carousel):**
  - **Component:** src/components/landing/recruitment/sections/FeatureSpotlightCarousel.tsx ('use client';).
  - **Carousel:** shadcn/ui Carousel.
  - **Card Component:** src/components/landing/recruitment/FeatureCard.tsx (Server Component).

### **Phase 6: How It Works Section (§5)**

- **Task 6.1 (Linear: FEAT-XXX: Build How It Works Stepper):**
  - **Component:** src/components/landing/recruitment/sections/HowItWorksSection.tsx (Server Component).
  - **Modal for Scorecard:** src/components/landing/recruitment/ScorecardModal.tsx ('use client';) using Dialog.

### **Phase 7: Recruiter ROI Band (§6)**

- **Task 7.1 (Linear: FEAT-XXX: Develop Recruiter ROI Band):**
  - **Component:** src/components/landing/recruitment/sections/RecruiterROIBand.tsx (Server Component).
  - **CTA Scroll:** If smooth scroll needed, this section might need to be a Client Component or use a global scroll context/hook. Prefer anchor link \#contact-form for simplicity if acceptable.

### **Phase 8: Enterprise-Ready Trust Section (§7)**

- **Task 8.1 (Linear: FEAT-XXX: Implement Enterprise Trust Section):**
  - **Component:** src/components/landing/recruitment/sections/EnterpriseTrustSection.tsx (Server Component).

### **Phase 9: B2B Testimonials Section (§8)**

- **Task 9.1 (Linear: FEAT-XXX: Build B2B Testimonials Carousel/Display):**
  - **Component:** src/components/landing/recruitment/sections/B2BTestimonialsSection.tsx ('use client'; if carousel).

### **Phase 10: Candidate Practice Zone (§9)**

- **Task 10.1 (Linear: FEAT-XXX: Develop Candidate Practice Zone):**
  - **Component:** src/components/landing/recruitment/sections/CandidatePracticeZone.tsx (Server Component).
  - **ID:** id="candidate-zone".
  - **CTA:** Button linking to env.NEXT_PUBLIC_PRACTICE_PAGE_URL.

### **Phase 11: Pricing Preview Section (§10)**

- **Task 11.1 (Linear: FEAT-XXX: Implement B2B Pricing Preview):**
  - **Component:** src/components/landing/recruitment/sections/PricingPreviewSection.tsx (Server Component).

### **Phase 12: FAQ Section (§11)**

- **Task 12.1 (Linear: FEAT-XXX: Build FAQ Accordion & Schema):**
  - **Component:** src/components/landing/recruitment/sections/FAQSection.tsx ('use client';).
  - **Accordion:** shadcn/ui Accordion.
  - **Schema Markup:** JSON-LD for FAQPage in this component or page.tsx.

### **Phase 13: Conversion Contact Section (New Section before Footer)**

- **Task 13.1 (Linear: FEAT-XXX: Develop B2B Contact Form Section):**
  - **Component:** src/components/landing/recruitment/sections/ContactFormSection.tsx ('use client';).
  - **ID:** Add id="contact-form" for ROI band CTA anchor.
  - **Form Handling:** react-hook-form with zod.
  - **API Submission:** fetch to /api/recruitment-contact/route.ts. Mock with MSW.
  - **Feedback:** shadcn/ui Toast via useToast().

## **5\. Shared Utility Components (Examples)**

- **SectionWrapper.tsx:** (Server Component) src/components/landing/recruitment/ui/SectionWrapper.tsx (or src/components/ui/ if globally applicable).
  // src/components/landing/recruitment/ui/SectionWrapper.tsx (or src/components/ui/)
  import { cn } from "@/lib/utils"; // Path to your global lib/utils
  import React from "react";

  interface SectionWrapperProps extends React.HTMLAttributes\<HTMLElement\> {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  containerClassName?: string;
  }

  const SectionWrapper \= React.forwardRef\<HTMLElement, SectionWrapperProps\>(
  ({ children, className, containerClassName, as: Component \= 'section', ...props }, ref) \=\> {
  return (
  \<Component
  ref={ref}
  className={cn("py-12 md:py-16 lg:py-20", className)} // Standard vertical padding
  {...props}
  \>
  \<div className={cn("container mx-auto px-4 md:px-6", containerClassName)}\> {/\* Uses Tailwind container \*/}
  {children}
  \</div\>
  \</Component\>
  );
  }
  );
  SectionWrapper.displayName \= "SectionWrapper";
  export default SectionWrapper;

- **SectionTitle.tsx:** (Server Component) src/components/landing/recruitment/ui/SectionTitle.tsx (or src/components/ui/).
  // src/components/landing/recruitment/ui/SectionTitle.tsx (or src/components/ui/)
  import { cn } from "@/lib/utils"; // Path to your global lib/utils
  import React from "react";

  interface SectionTitleProps extends React.HTMLAttributes\<HTMLHeadingElement\> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Allow specifying heading level
  }

  const SectionTitle \= React.forwardRef\<HTMLHeadingElement, SectionTitleProps\>(
  ({ children, className, as: Component \= 'h2', ...props }, ref) \=\> {
  return (
  \<Component
  ref={ref}
  // Example: text-foreground, specific font from your Tailwind config (e.g., font-display)
  className={cn("text-3xl md:text-4xl font-bold tracking-tight text-center mb-8 md:mb-12 text-foreground", className)}
  {...props}
  \>
  {children}
  \</Component\>
  );
  }
  );
  SectionTitle.displayName \= "SectionTitle";
  export default SectionTitle;

## **6\. SEO Implementation Details (Reiteration & Emphasis)**

- **JSON-LD:**
  - Organization, WebSite schema in app/(marketing)/recruitment/layout.tsx.
  - Product schema (for the B2B offering) and FAQPage schema in app/(marketing)/recruitment/page.tsx or dynamically within their respective section components. Data should be sourced from constants or props.
- **OG/Twitter Images:** Define specific, optimized images for this landing page in the metadata.

## **7\. Accessibility (WCAG AA Compliance) \- Key Reminders**

- **Focus Management:** Critical for modals (Dialog), Sheet, DropdownMenu.
- **Semantic HTML:** Use landmark elements correctly.
- **ARIA Attributes:** Use for dynamic content and custom controls. shadcn/ui generally handles this well.

## **8\. Performance \- Key Reminders**

- **next/image:** Mandatory for static images; priority for LCP (Hero visual).
- **Font Loading:** next/font (as in layout.tsx).
- **Bundle Analysis:** Periodically use @next/bundle-analyzer.
- **Dynamic Imports dynamic():** For heavy client components not immediately in view.

This updated specification (v1.2) incorporates your feedback and should serve as a more accurate and robust guide for the development team.
