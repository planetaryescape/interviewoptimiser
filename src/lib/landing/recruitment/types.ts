export interface NavigationLink {
  label: string;
  href: string;
}

export interface CTALink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface TestimonialType {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
}

export interface PricingTier {
  name: string;
  features: string[];
  cta: {
    label: string;
    href: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface StepItem {
  title: string;
  description: string;
  icon: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon?: string;
}

export interface StatItem {
  value: string;
  label: string;
}
