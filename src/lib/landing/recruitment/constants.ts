// Basic constants for the recruitment landing page
// Will be populated further as sections are built.

export const RECRUITMENT_PAGE_PATH = "/recruitment";

export const NAVIGATION_LINKS = [
  { label: "Product", href: "#product-features" }, // Placeholder HREFs
  { label: "How It Works", href: "#how-it-works-business" },
  { label: "Pricing", href: "#pricing-preview" },
  { label: "Resources", href: "#resources" },
];

export const CTA_PRACTICE_FOR_FREE = {
  text: "Practice for Free",
  href: "/dashboard/create", // Assuming this is the B2C practice link
};

export const CTA_BOOK_A_DEMO = {
  text: "Book a Demo",
  href: "#contact-form", // Placeholder, could be a Calendly link or contact form
};

export const FOOTER_LINKS = [
  { label: "Documentation", href: "/docs" }, // Example global doc link
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/interviewoptimiser", // Example
  twitter: "https://twitter.com/bhekanik", // Example
};

export const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Interview Optimiser Ltd. All rights reserved.`;
