# **Interview Optimiser: B2B-Focused Landing Page Plan (v3)**

**Overall Strategy:** This landing page is designed primarily to attract and convert **B2B clients** (recruiters, hiring managers, talent acquisition leaders) by showcasing Interview Optimiser's power to revolutionise their hiring process. It will also provide an explicit and welcoming path for **individual candidates (B2C users)** to access the free AI practice tool. B2C engagement data will be strategically used to showcase AI maturity and user validation, indirectly supporting B2B trust.

**Core Pillars to Emphasise Throughout:**

1. **Conversational Realism:** Highlight that this isn't just Q\&A; it's a dynamic, speech-to-speech AI interview.
2. **"Shift-Left" Efficiency:** Emphasise how businesses can interview every candidate effectively from the start.
3. **Actionable Insights:** Stress the depth and quality of reports for both candidates (on the practice tier) and businesses.
4. **Scalability & ROI:** Demonstrate how this solution saves time, reduces costs, and improves hiring outcomes for businesses.
5. **AI Maturity:** Leverage B2C usage data to underscore the AI's refinement and reliability.

**Visual Theme:**

- **Palette:** Minimal – two brand primaries (e.g., a trustworthy deep blue, an innovative teal/green accent), a range of greys, and a distinct "success" or "action" colour for CTAs (perhaps a vibrant coral or optimistic yellow).
- **Typography:** Clean, modern, and highly readable sans-serif fonts. Clear hierarchy. British English spelling and tone.
- **Imagery:** Custom 3-colour isometric SVGs or high-quality, bespoke illustrations. Avoid stock photos.
- **Layout:** Generous whitespace, mobile-first grid, 4px or 8px baseline rhythm.

## **0\. Global Shell (Persistent Elements)**

- **Purpose:** Provide consistent navigation and crystal-clear paths for both B2B and B2C audiences.
- **Components & Layout:**
  - **Navigation (Left):** Logo (links to home).
  - **Navigation (Right):**
    - Links: "Product" (B2B features), "How It Works" (B2B flow), "Pricing" (B2B focus), "Resources" (B2B thought leadership).
    - **Clear Dual CTAs:**
      - **B2C Path (Ghost Button Style):** **"Practice for Free"** (Directly addresses individual users; links to /practice or individual user area).
      - **B2B Path (Solid Primary Button Style):** **"Book a Demo"** (Clear B2B conversion point).
  - **Sticky Header:** Appears after \~80px scroll. Duplicates the dual CTAs ("Practice for Free" and "Book a Demo"). Header background transitions from transparent to a semi-opaque solid brand color (e.g., light grey or white) with a subtle shadow for depth.

## **1\. Hero Section (Above the Fold – Approx. 90vh Height)**

- **Purpose:** Primarily capture B2B interest with strong value, while making the B2C path instantly visible and reassuring.
- **Layout:** \~50/50 responsive split; Left \= Copy, Right \= Hero Visual.
- **Copy (Left Side):**
  - **Headline (H1):**
    - **Copy:** **_Live, adaptive AI interviews—at any scale._**
  - **Sub‑headline:**
    - **Copy:** Give every candidate a pressure‑tested conversation, cut hiring time in half, and surface talent your competitors miss.
  - **Primary B2B CTA (Solid Button):**
    - **Copy:** **"Book a Discovery Call"**
  - **Secondary B2B CTA (Ghost Button):**
    - **Copy:** **"Watch 60‑sec Demo"** (Opens a modal with a concise product demo video focusing on the business workflow and benefits).
  - **Interactive Engagement CTA (Serves both B2B curiosity & B2C trial):**
    - **Copy:** **"Try our AI: 3‑min Interview (no sign‑up)"** (Styled distinctively, e.g., underlined link with an icon. Opens /try sandbox. Records nothing, returns blurred/teaser scorecard to showcase output).
  - **Micro‑copy (Explicit B2C Path \- Enhanced Clarity):**
    - **Copy (Small, clear text):** **Job Seeker? Practise your interview skills for free (15 mins daily) →** (Anchors to §9 Candidate Practice Zone).
- **Visual (Right Side):**
  - **Backdrop:** Gradient (e.g., brand peach → deep purple, or other brand-aligned choices).
  - **Animation:** 3-second Lottie animation: e.g., abstract representation of sound waves, conversational chat bubbles, and data points coalescing, visually hinting at "live, adaptive AI interviews."
  - **Fallback:** Static image (representative of the animation) for users with prefers-reduced-motion enabled.
  - **Performance:** Optimised Lottie JSON (\<150kB), loaded with fetchPriority="high".
- **Hero Badge Row (Below CTAs \- Leveraging B2C Data for B2B Trust):**
  - **Purpose:** Show product maturity and engagement, implying a refined AI.
  - **Layout:** Centre‑aligned pill badges or clean stats row.
  - **Optional Mini-Headline for this row:** "Our AI: Proven & Engaging"
  - Copy (Using your B2C data, framed for B2B appeal):
    Over \[759+\] AI Interviews Conducted | \[721+\] Minutes of Adaptive Dialogue Logged | \[120+\] Professionals Advancing Their Careers
    (This frames B2C stats as proof of the AI's capability and real-world interaction, valuable for B2B to know the tech is tested).

## **2\. Social Proof Bar (Immediately Below Fold)**

- **Purpose:** Build initial B2B trust using available assets. _(To be updated as B2B client logos/quotes become available)._
- **Components & Layout:**
  - Horizontal strip.
  - **Compliance Badges (Centre/Prominent):** **SOC 2 Type II (State status: e.g., "Certified," "In Progress," or "Planned") • GDPR Compliant**
  - **User Trust Element (Leveraging B2C data until B2B proof is stronger):**
    - "Trusted by \[120+\] Professionals to Sharpen Their Interview Skills"
    - **OR a strong, B2B-relevant snippet from an anonymised user review:** e.g., _"The AI felt like a real interviewer, the feedback was invaluable." \- User Review_
  - _(Space reserved for future B2B client logos or media quotes)._

## **3\. Problem → Solution: The "Shift-Left" Advantage (Light Grey Background Band)**

- **Purpose:** Clearly articulate common pains in traditional hiring and position Interview Optimiser as the definitive solution, introducing the "shift-left" concept.
- **Layout:** Two-column responsive layout.
- **Column A – Pain Points (The "Before"):**
  - **Visuals:** Red '×' icons next to each point.
  - **Copy:**
    1. Keyword screens miss high‑potential talent.
    2. Interview scheduling blocks your pipeline.
    3. One‑way video feels staged, yields thin insight.
    4. High costs & time drain for initial screening.
- **Column B – Our Fix (The "Interview Optimiser Solution"):**
  - **Visuals:** Green '✓' icons next to each point.
  - **Copy:**
    1. **Interview every applicant**—no CV filter required.
    2. **Zero calendar friction**—candidates click a link, talk anytime.
    3. Our **proven adaptive dialogue** (refined over \[759+\] practice sessions) reveals true thinking under pressure.
    4. **Slash screening costs** & free up your recruiters.
- **Inline CTA (End of section):**
  - **Copy:** **"See How It Works →"** (Anchors to §5 How It Works or the "Watch 60-sec Demo" modal).

## **4\. Feature Spotlight Carousel (Snap-scroll on mobile, multi-card view on desktop)**

- **Purpose:** Highlight the core technological differentiators that power the B2B solution, implicitly backed by B2C refinement.
- **Layout:** 3 cards, each with a custom illustration, H3 heading, and \~30-word descriptive copy.
- **Card 1: True Conversational AI**
  - **Illustration:** Abstract depiction of natural conversation flow with AI.
  - **H3:** **True Conversational Interviews**
  - **Copy:** Candidates respond naturally as our AI listens, probes, and pivots—a dynamic conversation validated by hundreds of users seeking realistic practice.
- **Card 2: Dynamic Adaptive Questioning**
  - **Illustration:** Visual of a pathway or challenge level adjusting.
  - **H3:** **Dynamic Adaptive Questioning**
  - **Copy:** Follow‑up questions auto‑calibrate to candidate performance, exposing genuine skill ceilings—an intelligence honed through extensive real-world candidate interactions.
- **Card 3: Comprehensive Candidate Insights**
  - **Illustration:** Dashboard elements, data insights, report icon.
  - **H3:** **Comprehensive Candidate Insights**
  - **Copy:** Full recording, transcript, prosody analysis, key competency scores—the actionable intelligence your team needs, with feedback depth praised by career advancers.

## **5\. How It Works (For Businesses \- Stepper Component)**

- **Purpose:** Simplify the business user's journey to understand ease of use and integration.
- **Layout:** Vertical or horizontal stepper with 4 clear steps, icons, and concise text. Lazy-loaded GIF/short video of the recruiter dashboard.
- **Step 1 – Upload Job Description**
  - **Icon:** Upload/Document icon.
  - **Copy:** Our AI engine maps key competencies from your job description and auto‑builds a calibrated, role-specific question set in minutes.
- **Step 2 – Share Interview Link**
  - **Icon:** Link/Share icon.
  - **Copy:** Candidates self‑serve their AI interview—any device, any time zone. No downloads, no scheduling chaos.
- **Step 3 – Review Rich Reports**
  - **Icon:** Dashboard/Analytics icon.
  - **Copy:** Your dashboard updates in real time with recordings, transcripts, and deep analytics. Compare candidates side-by-side.
- **Step 4 – Identify Top Talent & Export**
  - **Icon:** Trophy/Export icon.
  - **Copy:** Intelligent scorecards auto‑rank top performers. One‑click export of all data to your existing ATS/HRIS.
  - **Secondary CTA:** **"\[View Sample Scorecard\]"** (Opens a modal with an anonymised, professional-looking PDF sample of a B2B candidate report).
- **Visual:** Include a lazy-loaded GIF or short silent video showcasing the recruiter dashboard interface.

## **6\. Recruiter ROI Band (White Background, Data-focused)**

- **Purpose:** Quantify the business benefits with compelling metrics.
- **Layout:** Clean table showcasing "Before" and "With Interview Optimiser (IO)" metrics.
- **Table Data (Update with your pilot/client data ASAP. If limited, use projected figures transparently):**

| Metric                 | Typical Hiring Process | With Interview Optimiser (Projected) | Potential Improvement |
| :--------------------- | :--------------------- | :----------------------------------- | :-------------------- |
| Time‑to‑Hire           | e.g., 38 days          | **e.g., 24–28 days**                 | **e.g., Up to 37%**   |
| Recruiter Hours / Hire | e.g., 3.5 hrs          | **e.g., \< 0.4 hrs**                 | **e.g., Over 80%**    |
| Candidate Experience   | Variable               | **Consistently Positive & Fair**     | **Enhanced Brand**    |

- **Caption:**
  - **Copy:** “Illustrative ROI based on typical hiring metrics and Interview Optimiser's automation capabilities. Let's estimate yours →”
- **CTA:**
  - **Copy:** **"Estimate My ROI"** (Scrolls to the contact form in §12 or links to a dedicated ROI calculator page if developed).

## **7\. Enterprise-Ready Trust Section**

- **Purpose:** Reassure larger clients about security, compliance, and integration capabilities.
- **Components & Layout:**
  - Prominent display of **Compliance Badges/Logos:** SOC 2 Type II (state current status), GDPR Compliant. (Add others like ISO 27001 if applicable).
  - **ATS Integration Logos:** Clearly display logos of key ATS systems you integrate with (e.g., Greenhouse, Lever, Workday).
  - **Short Paragraph (Optional):**
    - **Copy:** “On‑premise AI inference and custom data residency options available for regulated industries and specific enterprise requirements.”
- **Design Notes:** Clean, authoritative, instilling confidence.

## **8\. B2B Testimonials / User Reviews Section**

- **Purpose:** Build B2B trust using the best available proof.
- **Layout:** Carousel or curated static display.
- **Headline for the section:** "Why Hiring Teams & Candidates Rate Our AI Highly"
- **Content Adaptation (Prioritise any B2B pilot feedback. If limited, use strong, anonymised B2C user reviews framed for B2B relevance):**
  - Focus on reviews praising: Realism, depth of feedback, confidence gained.
  - **Example (framing a B2C review for B2B):**
    - _"Our AI doesn't just ask questions, it truly listens. Users consistently tell us: 'The feedback was incredibly detailed and helped me pinpoint exactly what to improve for my next real interview.' Imagine this level of insight for every candidate."_ – Anonymised User Feedback
  - _(Aim to replace with direct B2B client testimonials featuring names, titles, company, and quantifiable results as soon as possible)._

## **9\. Candidate Practice Zone (Clearly for B2C Users \- Grey Background Band)**

- **Purpose:** This is the primary, welcoming section for individual users. Make it feel like _their_ space on this B2B-focused page. Clearly link the B2C stats to _their_ benefit.
- **Layout:** Visually distinct, perhaps a slightly different background or a clear heading that calls out to job seekers.
- **Headline (H2 or H3 \- welcoming and direct):**
  - **Copy:** **Job Seekers: Ace Your Next Interview – Practise for Free\!**
- **Intro Copy:**
  - **Copy:** Join over **\[120+\] individuals** who are already mastering their interview skills with our adaptive AI. Get **15 minutes of free, dynamic interview practice every day**. No catch, just real improvement.
- **Stats Grid (Your current "Our Growing Impact" stats are perfect here):**
  - Copy:
    \[721+\]
    Minutes of Live Interview Practice Logged
    \[759+\]
    Adaptive AI Interviews Successfully Completed
    \[120+\]
    Career Journeys Enhanced Through Practice
- **Clear CTA for B2C Users (Large, clear button):**
  - **Copy:** **"Start Your Free Daily Practice"** (Links to /practice or the individual user sign-up/access page).
- **Optional:** A single, powerful B2C testimonial here that speaks directly to the practice experience.

## **10\. Pricing Preview (B2B Focus)**

- **Purpose:** Give an overview of B2B solution tiers and encourage contact for detailed pricing.
- **Layout:** Three cards (e.g., **Growth Tier**, **Scale Tier**, **Enterprise Suite**).
- **Content per Card:**
  - Package Name.
  - A few key bullet points highlighting the main features/limits (e.g., "Up to X interviews/month," "Standard Reporting," "ATS Integration").
  - **NO PRICES DISPLAYED.**
  - CTA on each card: "Contact Sales" or "Request Custom Quote".
- **Overall Section CTA:** Link to a full pricing page if one exists, otherwise funnel to sales.

## **11\. FAQ Accordion (Primarily B2B, but can include a B2C question)**

- **Purpose:** Proactively answer common business client questions and provide clarity for individuals. (Ensure FAQPage Schema markup).
- **Example Questions (Tailor to your offering):**
  1. Q: How does the adaptive difficulty AI work during an interview?
     A: Our AI analyses candidate responses in real-time for depth, relevance, and clarity. Based on this, it selects subsequent questions that appropriately challenge the candidate, providing a more accurate assessment of their true capabilities.
  2. Q: How is our company and candidate data secured?
     A: Data security is paramount. We are \[mention SOC 2, GDPR compliance\] and employ end-to-end encryption, secure cloud infrastructure, and robust access controls.
  3. Q: Can we customise the competency models and question sets for our business?
     A: Absolutely. While our AI can auto-generate interviews from a job description, you have full control to edit questions, add your own, and align the assessment criteria with your organisation's specific competency frameworks.
  4. Q: Will candidates know they are interacting with an AI?
     A: Yes, we believe in transparency. Candidates are informed that they are participating in an AI-assisted interview. Our focus is on providing a fair, consistent, and insightful experience.
  5. Q: How does the free practice for individuals work?
     A: Anyone can sign up for a free account and access 15 minutes of our adaptive AI interview practice daily. Simply click "Practice for Free" in our main menu or the Candidate Practice Zone.

## **12\. Conversion Footer / Final B2B Contact Section**

- **Purpose:** Provide a final, easy way for B2B leads to get in touch.
- **Components & Layout:**
  - **Headline:** "Ready to Revolutionise Your Hiring?" or "Let's Optimise Your Interview Process."
  - **Contact Form (Simple):** Work Email, Company Name, Brief Message/Question. Include privacy consent checkbox.
  - **CTA Button (Matches primary B2B CTA style):** **"Book a Discovery Call"** or **"Request Your Demo"**.
  - **Secondary Links:** "Documentation," "API Status" (if applicable), "Privacy Policy," "Cookie Policy," "LinkedIn Profile."
  - **Footer Note:** © 2025 Interview Optimiser Ltd. All rights reserved. \[Registered Company Number, Address if required by law\].

## **Technical & Style Guidelines (To be enforced by relevant teams):**

- **Accessibility & Performance Checklist:**
  - Validate heading hierarchy (H1 → H2 etc.).
  - All images with width, height, and descriptive alt attributes.
  - Colour contrast ratios ≥ 4.5:1 (WCAG AA).
  - Target LCP ≤ 2.5 seconds (mobile), INP ≤ 200ms.
  - Respect prefers-reduced-motion for all animations.
- **Copy Tone & Style Rules:**
  - **British English:** Consistent use of "optimise," "analyse," "organisation," "behaviour," etc.
  - **Reading Ease:** Target Flesch-Kincaid score ≥ 60\.
  - **Clarity:** Jargon-free where possible. Outcome-first statements. Prioritise active voice.
  - **Conciseness:** Aim for max sentence length of \~24 words.

This consolidated plan provides a comprehensive blueprint for your B2B-focused landing page, designed for high performance, clarity, and conversion, while thoughtfully integrating the B2C practice offering.nterview Optimiser: B2B-Focused Landing Page Plan (v3)Overall Strategy: This landing page is designed primarily to attract and convert B2B clients (recruiters, hiring managers, talent acquisition leaders) by showcasing Interview Optimiser's power to revolutionise their hiring process. It will also provide an explicit and welcoming path for individual candidates (B2C users) to access the free AI practice tool. B2C engagement data will be strategically used to showcase AI maturity and user validation, indirectly supporting B2B trust.Core Pillars to Emphasise Throughout:Conversational Realism: Highlight that this isn't just Q&A; it's a dynamic, speech-to-speech AI interview."Shift-Left" Efficiency: Emphasise how businesses can interview every candidate effectively from the start.Actionable Insights: Stress the depth and quality of reports for both candidates (on the practice tier) and businesses.Scalability & ROI: Demonstrate how this solution saves time, reduces costs, and improves hiring outcomes for businesses.AI Maturity: Leverage B2C usage data to underscore the AI's refinement and reliability.Visual Theme:Palette: Minimal – two brand primaries (e.g., a trustworthy deep blue, an innovative teal/green accent), a range of greys, and a distinct "success" or "action" colour for CTAs (perhaps a vibrant coral or optimistic yellow).Typography: Clean, modern, and highly readable sans-serif fonts. Clear hierarchy. British English spelling and tone.Imagery: Custom 3-colour isometric SVGs or high-quality, bespoke illustrations. Avoid stock photos.Layout: Generous whitespace, mobile-first grid, 4px or 8px baseline rhythm.0. Global Shell (Persistent Elements)Purpose: Provide consistent navigation and crystal-clear paths for both B2B and B2C audiences.Components & Layout:Navigation (Left): Logo (links to home).Navigation (Right):Links: "Product" (B2B features), "How It Works" (B2B flow), "Pricing" (B2B focus), "Resources" (B2B thought leadership).Clear Dual CTAs:B2C Path (Ghost Button Style): "Practice for Free" (Directly addresses individual users; links to /practice or individual user area).B2B Path (Solid Primary Button Style): "Book a Demo" (Clear B2B conversion point).Sticky Header: Appears after ~80px scroll. Duplicates the dual CTAs ("Practice for Free" and "Book a Demo"). Header background transitions from transparent to a semi-opaque solid brand color (e.g., light grey or white) with a subtle shadow for depth.1. Hero Section (Above the Fold – Approx. 90vh Height)Purpose: Primarily capture B2B interest with strong value, while making the B2C path instantly visible and reassuring.Layout: ~50/50 responsive split; Left = Copy, Right = Hero Visual.Copy (Left Side):Headline (H1):Copy: Live, adaptive AI interviews—at any scale.Sub‑headline:Copy: Give every candidate a pressure‑tested conversation, cut hiring time in half, and surface talent your competitors miss.Primary B2B CTA (Solid Button):Copy: "Book a Discovery Call"Secondary B2B CTA (Ghost Button):Copy: "Watch 60‑sec Demo" (Opens a modal with a concise product demo video focusing on the business workflow and benefits).Interactive Engagement CTA (Serves both B2B curiosity & B2C trial):Copy: "Try our AI: 3‑min Interview (no sign‑up)" (Styled distinctively, e.g., underlined link with an icon. Opens /try sandbox. Records nothing, returns blurred/teaser scorecard to showcase output).Micro‑copy (Explicit B2C Path - Enhanced Clarity):Copy (Small, clear text): Job Seeker? Practise your interview skills for free (15 mins daily) → (Anchors to §9 Candidate Practice Zone).Visual (Right Side):Backdrop: Gradient (e.g., brand peach → deep purple, or other brand-aligned choices).Animation: 3-second Lottie animation: e.g., abstract representation of sound waves, conversational chat bubbles, and data points coalescing, visually hinting at "live, adaptive AI interviews."Fallback: Static image (representative of the animation) for users with prefers-reduced-motion enabled.Performance: Optimised Lottie JSON (<150kB), loaded with fetchPriority="high".Hero Badge Row (Below CTAs - Leveraging B2C Data for B2B Trust):Purpose: Show product maturity and engagement, implying a refined AI.Layout: Centre‑aligned pill badges or clean stats row.Optional Mini-Headline for this row: "Our AI: Proven & Engaging"Copy (Using your B2C data, framed for B2B appeal):Over [759+] AI Interviews Conducted | [721+] Minutes of Adaptive Dialogue Logged | [120+] Professionals Advancing Their Careers(This frames B2C stats as proof of the AI's capability and real-world interaction, valuable for B2B to know the tech is tested).2. Social Proof Bar (Immediately Below Fold)Purpose: Build initial B2B trust using available assets. (To be updated as B2B client logos/quotes become available).Components & Layout:Horizontal strip.Compliance Badges (Centre/Prominent): SOC 2 Type II (State status: e.g., "Certified," "In Progress," or "Planned") • GDPR CompliantUser Trust Element (Leveraging B2C data until B2B proof is stronger):"Trusted by [120+] Professionals to Sharpen Their Interview Skills"OR a strong, B2B-relevant snippet from an anonymised user review: e.g., "The AI felt like a real interviewer, the feedback was invaluable." - User Review(Space reserved for future B2B client logos or media quotes).3. Problem → Solution: The "Shift-Left" Advantage (Light Grey Background Band)Purpose: Clearly articulate common pains in traditional hiring and position Interview Optimiser as the definitive solution, introducing the "shift-left" concept.Layout: Two-column responsive layout.Column A – Pain Points (The "Before"):Visuals: Red '×' icons next to each point.Copy:Keyword screens miss high‑potential talent.Interview scheduling blocks your pipeline.One‑way video feels staged, yields thin insight.High costs & time drain for initial screening.Column B – Our Fix (The "Interview Optimiser Solution"):Visuals: Green '✓' icons next to each point.Copy:Interview every applicant—no CV filter required.Zero calendar friction—candidates click a link, talk anytime.Our proven adaptive dialogue (refined over [759+] practice sessions) reveals true thinking under pressure.Slash screening costs & free up your recruiters.Inline CTA (End of section):Copy: "See How It Works →" (Anchors to §5 How It Works or the "Watch 60-sec Demo" modal).4. Feature Spotlight Carousel (Snap-scroll on mobile, multi-card view on desktop)Purpose: Highlight the core technological differentiators that power the B2B solution, implicitly backed by B2C refinement.Layout: 3 cards, each with a custom illustration, H3 heading, and ~30-word descriptive copy.Card 1: True Conversational AIIllustration: Abstract depiction of natural conversation flow with AI.H3: True Conversational InterviewsCopy: Candidates respond naturally as our AI listens, probes, and pivots—a dynamic conversation validated by hundreds of users seeking realistic practice.Card 2: Dynamic Adaptive QuestioningIllustration: Visual of a pathway or challenge level adjusting.H3: Dynamic Adaptive QuestioningCopy: Follow‑up questions auto‑calibrate to candidate performance, exposing genuine skill ceilings—an intelligence honed through extensive real-world candidate interactions.Card 3: Comprehensive Candidate InsightsIllustration: Dashboard elements, data insights, report icon.H3: Comprehensive Candidate InsightsCopy: Full recording, transcript, prosody analysis, key competency scores—the actionable intelligence your team needs, with feedback depth praised by career advancers.5. How It Works (For Businesses - Stepper Component)Purpose: Simplify the business user's journey to understand ease of use and integration.Layout: Vertical or horizontal stepper with 4 clear steps, icons, and concise text. Lazy-loaded GIF/short video of the recruiter dashboard.Step 1 – Upload Job DescriptionIcon: Upload/Document icon.Copy: Our AI engine maps key competencies from your job description and auto‑builds a calibrated, role-specific question set in minutes.Step 2 – Share Interview LinkIcon: Link/Share icon.Copy: Candidates self‑serve their AI interview—any device, any time zone. No downloads, no scheduling chaos.Step 3 – Review Rich ReportsIcon: Dashboard/Analytics icon.Copy: Your dashboard updates in real time with recordings, transcripts, and deep analytics. Compare candidates side-by-side.Step 4 – Identify Top Talent & ExportIcon: Trophy/Export icon.Copy: Intelligent scorecards auto‑rank top performers. One‑click export of all data to your existing ATS/HRIS.Secondary CTA: "[View Sample Scorecard]" (Opens a modal with an anonymised, professional-looking PDF sample of a B2B candidate report).Visual: Include a lazy-loaded GIF or short silent video showcasing the recruiter dashboard interface.6. Recruiter ROI Band (White Background, Data-focused)Purpose: Quantify the business benefits with compelling metrics.Layout: Clean table showcasing "Before" and "With Interview Optimiser (IO)" metrics.Table Data (Update with your pilot/client data ASAP. If limited, use projected figures transparently):| Metric | Typical Hiring Process | With Interview Optimiser (Projected) | Potential Improvement || Time‑to‑Hire | e.g., 38 days | e.g., 24–28 days | e.g., Up to 37% || Recruiter Hours / Hire | e.g., 3.5 hrs | e.g., < 0.4 hrs | e.g., Over 80% || Candidate Experience | Variable | Consistently Positive & Fair | Enhanced Brand |Caption:Copy: “Illustrative ROI based on typical hiring metrics and Interview Optimiser's automation capabilities. Let's estimate yours →”CTA:Copy: "Estimate My ROI" (Scrolls to the contact form in §12 or links to a dedicated ROI calculator page if developed).7. Enterprise-Ready Trust SectionPurpose: Reassure larger clients about security, compliance, and integration capabilities.Components & Layout:Prominent display of Compliance Badges/Logos: SOC 2 Type II (state current status), GDPR Compliant. (Add others like ISO 27001 if applicable).ATS Integration Logos: Clearly display logos of key ATS systems you integrate with (e.g., Greenhouse, Lever, Workday).Short Paragraph (Optional):Copy: “On‑premise AI inference and custom data residency options available for regulated industries and specific enterprise requirements.”Design Notes: Clean, authoritative, instilling confidence.8. B2B Testimonials / User Reviews SectionPurpose: Build B2B trust using the best available proof.Layout: Carousel or curated static display.Headline for the section: "Why Hiring Teams & Candidates Rate Our AI Highly"Content Adaptation (Prioritise any B2B pilot feedback. If limited, use strong, anonymised B2C user reviews framed for B2B relevance):Focus on reviews praising: Realism, depth of feedback, confidence gained.Example (framing a B2C review for B2B):"Our AI doesn't just ask questions, it truly listens. Users consistently tell us: 'The feedback was incredibly detailed and helped me pinpoint exactly what to improve for my next real interview.' Imagine this level of insight for every candidate." – Anonymised User Feedback(Aim to replace with direct B2B client testimonials featuring names, titles, company, and quantifiable results as soon as possible).9. Candidate Practice Zone (Clearly for B2C Users - Grey Background Band)Purpose: This is the primary, welcoming section for individual users. Make it feel like their space on this B2B-focused page. Clearly link the B2C stats to their benefit.Layout: Visually distinct, perhaps a slightly different background or a clear heading that calls out to job seekers.Headline (H2 or H3 - welcoming and direct):Copy: Job Seekers: Ace Your Next Interview – Practise for Free!Intro Copy:Copy: Join over [120+] individuals who are already mastering their interview skills with our adaptive AI. Get 15 minutes of free, dynamic interview practice every day. No catch, just real improvement.Stats Grid (Your current "Our Growing Impact" stats are perfect here):Copy:[721+]Minutes of Live Interview Practice Logged[759+]Adaptive AI Interviews Successfully Completed[120+]Career Journeys Enhanced Through PracticeClear CTA for B2C Users (Large, clear button):Copy: "Start Your Free Daily Practice" (Links to /practice or the individual user sign-up/access page).Optional: A single, powerful B2C testimonial here that speaks directly to the practice experience.10. Pricing Preview (B2B Focus)Purpose: Give an overview of B2B solution tiers and encourage contact for detailed pricing.Layout: Three cards (e.g., Growth Tier, Scale Tier, Enterprise Suite).Content per Card:Package Name.A few key bullet points highlighting the main features/limits (e.g., "Up to X interviews/month," "Standard Reporting," "ATS Integration").NO PRICES DISPLAYED.CTA on each card: "Contact Sales" or "Request Custom Quote".Overall Section CTA: Link to a full pricing page if one exists, otherwise funnel to sales.11. FAQ Accordion (Primarily B2B, but can include a B2C question)Purpose: Proactively answer common business client questions and provide clarity for individuals. (Ensure FAQPage Schema markup).Example Questions (Tailor to your offering):Q: How does the adaptive difficulty AI work during an interview?A: Our AI analyses candidate responses in real-time for depth, relevance, and clarity. Based on this, it selects subsequent questions that appropriately challenge the candidate, providing a more accurate assessment of their true capabilities.Q: How is our company and candidate data secured?A: Data security is paramount. We are [mention SOC 2, GDPR compliance] and employ end-to-end encryption, secure cloud infrastructure, and robust access controls.Q: Can we customise the competency models and question sets for our business?A: Absolutely. While our AI can auto-generate interviews from a job description, you have full control to edit questions, add your own, and align the assessment criteria with your organisation's specific competency frameworks.Q: Will candidates know they are interacting with an AI?A: Yes, we believe in transparency. Candidates are informed that they are participating in an AI-assisted interview. Our focus is on providing a fair, consistent, and insightful experience.Q: How does the free practice for individuals work?A: Anyone can sign up for a free account and access 15 minutes of our adaptive AI interview practice daily. Simply click "Practice for Free" in our main menu or the Candidate Practice Zone.12. Conversion Footer / Final B2B Contact SectionPurpose: Provide a final, easy way for B2B leads to get in touch.Components & Layout:Headline: "Ready to Revolutionise Your Hiring?" or "Let's Optimise Your Interview Process."Contact Form (Simple): Work Email, Company Name, Brief Message/Question. Include privacy consent checkbox.CTA Button (Matches primary B2B CTA style): "Book a Discovery Call" or "Request Your Demo".Secondary Links: "Documentation," "API Status" (if applicable), "Privacy Policy," "Cookie Policy," "LinkedIn Profile."Footer Note: © 2025 Interview Optimiser Ltd. All rights reserved. [Registered Company Number, Address if required by law].Technical & Style Guidelines (To be enforced by relevant teams):Accessibility & Performance Checklist:Validate heading hierarchy (H1 → H2 etc.).All images with width, height, and descriptive alt attributes.Colour contrast ratios ≥ 4.5:1 (WCAG AA).Target LCP ≤ 2.5 seconds (mobile), INP ≤ 200ms.Respect prefers-reduced-motion for all animations.Copy Tone & Style Rules:British English: Consistent use of "optimise," "analyse," "organisation," "behaviour," etc.Reading Ease: Target Flesch-Kincaid score ≥ 60.Clarity: Jargon-free where possible. Outcome-first statements. Prioritise active voice.Conciseness: Aim for max sentence length of ~24 words.This consolidated plan provides a comprehensive blueprint for your B2B-focused landing page, designed for high performance, clarity, and conversion, while thoughtfully integrating the B2C practice offering..
