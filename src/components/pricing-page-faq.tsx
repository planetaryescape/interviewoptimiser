"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  ChevronsUpDown,
  Clock,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { BackgroundGradient } from "@/components/background-gradient";
import { config } from "~/config";

type FAQ = {
  question: string;
  answer: string;
  icon: React.ReactNode;
};

const HexagonPattern = () => (
  <motion.div
    animate={{
      rotate: [0, 360],
    }}
    transition={{
      duration: 60,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
    }}
    className="absolute bottom-[-8rem] right-[-4rem] z-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300"
  >
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hexagon pattern"
    >
      <title>Hexagon pattern</title>
      <path
        d="M25 0L47.1649 12.8333L47.1649 38.5L25 51.3333L2.83513 38.5L2.83513 12.8333L25 0Z"
        fill="currentColor"
      />
      <path
        d="M75 43L97.1649 55.8333L97.1649 81.5L75 94.3333L52.8351 81.5L52.8351 55.8333L75 43Z"
        fill="currentColor"
      />
      <path
        d="M125 0L147.165 12.8333L147.165 38.5L125 51.3333L102.835 38.5L102.835 12.8333L125 0Z"
        fill="currentColor"
      />
      <path
        d="M175 43L197.165 55.8333L197.165 81.5L175 94.3333L152.835 81.5L152.835 55.8333L175 43Z"
        fill="currentColor"
      />
      <path
        d="M25 86L47.1649 98.8333L47.1649 124.5L25 137.333L2.83513 124.5L2.83513 98.8333L25 86Z"
        fill="currentColor"
      />
      <path
        d="M75 129L97.1649 141.833L97.1649 167.5L75 180.333L52.8351 167.5L52.8351 141.833L75 129Z"
        fill="currentColor"
      />
      <path
        d="M125 86L147.165 98.8333L147.165 124.5L125 137.333L102.835 124.5L102.835 98.8333L125 86Z"
        fill="currentColor"
      />
      <path
        d="M175 129L197.165 141.833L197.165 167.5L175 180.333L152.835 167.5L152.835 141.833L175 129Z"
        fill="currentColor"
      />
    </svg>
  </motion.div>
);

const FAQCard = ({
  faq,
  isActive,
  onClick,
}: {
  faq: FAQ;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className={`group cursor-pointer transition-all duration-300 ease-out
        ${
          isActive
            ? "md:col-span-2 bg-gradient-to-br from-primary/20 to-primary/10 scale-100"
            : "hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:scale-[1.02] bg-card"
        }
        rounded-xl p-6 border border-primary/20 relative overflow-hidden shadow-sm hover:shadow-md`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">{faq.icon}</div>
      <HexagonPattern />

      <div
        className={`transition-all duration-300 relative z-10
        ${isActive ? "grid md:grid-cols-2 gap-6" : "space-y-3"}`}
      >
        <div className="space-y-3">
          <div className="text-primary">{faq.icon}</div>
          <h3 className="text-style-h4 text-foreground/90">{faq.question}</h3>
          {!isActive && (
            <p className="text-style-caption text-muted-foreground">Click to learn more →</p>
          )}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300
          ${isActive ? "opacity-100 max-h-96" : "opacity-0 max-h-0 md:max-h-none md:opacity-0"}`}
        >
          <p className="text-style-body-base text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
};

export default function PricingPageFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      question: "How does the free trial work?",
      answer:
        "We offer a 5-minute free trial for first-time users to give you a sneak peek into how our AI-powered mock interviews work. Sign up today and start practicing for free!",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      question: "Can I upgrade my plan after starting?",
      answer:
        "Yes! You can always purchase more minutes if you feel you need extra practice time. Any unused minutes will roll over to your next session.",
      icon: <ChevronsUpDown className="w-6 h-6" />,
    },
    {
      question: "What if I'm not satisfied?",
      answer: `We offer a 30-day money-back guarantee on unused minutes. If you're not satisfied with your experience, just let us know at ${config.supportEmail}, and we'll refund your purchase.`,
      icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
      question: "Do minutes expire?",
      answer:
        "No, your purchased minutes never expire. You can use them whenever you need them, whether that's tomorrow or months from now.",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      question: "Are there any discounts available?",
      answer:
        "We occasionally offer promotional discounts for students, new users, and during special events. Keep an eye on our newsletter and social media for announcements.",
      icon: <Tag className="w-6 h-6" />,
    },
    {
      question: "How do the pricing tiers differ?",
      answer:
        "The primary difference is the number of interview minutes you receive. All plans include the same premium features like advanced feedback, voice analysis, and personalized reports.",
      icon: <BarChart className="w-6 h-6" />,
    },
    {
      question: "Do you offer enterprise or team plans?",
      answer: `Yes, we offer custom plans for recruitment teams, career services departments, and educational institutions. Please contact us at ${config.supportEmail} for details.`,
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      question: "How do I get help if I have more questions?",
      answer: `Our support team is always ready to assist you. Reach out to us at ${config.supportEmail} with any questions or concerns, and we'll respond promptly.`,
      icon: <HelpCircle className="w-6 h-6" />,
    },
  ];

  return (
    <div className="relative w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-style-h2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Frequently Asked Questions
          </h2>
          <p className="text-style-body-lead text-muted-foreground">
            Everything you need to know about our pricing and plans. Can&apos;t find the answer
            you&apos;re looking for? Reach out to our support team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQCard
              key={faq.question}
              faq={faq}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
      <BackgroundGradient degrees={Math.random() * 360} />
    </div>
  );
}
