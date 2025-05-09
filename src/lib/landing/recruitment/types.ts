export interface NavigationLink {
  label: string;
  href: string;
}

export interface CTALink {
  text: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  href: string;
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
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
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

export interface NavItem {
  label: string;
  href: string;
}
