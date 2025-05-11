"use client";

import { BackgroundGradient } from "@/components/background-gradient";
import { motion } from "framer-motion";
import { Brain, ChartLine, Clock, MessageSquare, Mic, Shield, Target, Zap } from "lucide-react";
import { useState } from "react";
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

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      question: `How does ${config.projectName} differ from just asking ChatGPT?`,
      answer: `While ChatGPT can provide question-and-answer guidance, ${config.projectName} delivers a fully immersive, real-time voice-to-voice interview experience that simulates the pressures of an actual interview. Our AI adapts dynamically to your responses, assessing not only your answers but also your delivery, confidence, and speaking style—features that ChatGPT alone cannot offer.`,
      icon: <Brain className="w-6 h-6" />,
    },
    {
      question: `How does ${config.projectName}'s AI interview practice work?`,
      answer: `${config.projectName} uses advanced AI to create personalized interview simulations based on your CV and target job. You engage in a live, voice-based interaction with the AI, which adapts its questions and tone in real-time to create an authentic interview experience. Afterward, you receive a detailed feedback report to refine your skills.`,
      icon: <Mic className="w-6 h-6" />,
    },
    {
      question: `Is ${config.projectName} suitable for all career levels?`,
      answer:
        "Absolutely! Our AI customizes each session to suit a range of industries, job roles, and experience levels, ensuring you get relevant questions and feedback that align with your specific career goals, whether you're entry-level or a seasoned professional.",
      icon: <Target className="w-6 h-6" />,
    },
    {
      question: "What types of interviews can I practice?",
      answer: `${config.projectName} offers a variety of interview types, including behavioral, technical, and situational formats. Each interview style adapts to your industry and role, so you can choose the style that best fits your goals.`,
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      question: "Can I practice specific soft skills?",
      answer: `Yes! Unlike traditional platforms, ${config.projectName} uses prosody analysis to evaluate and provide feedback on key communication traits, such as confidence, clarity, and engagement. This allows you to improve not just what you say, but how you say it.`,
      icon: <Zap className="w-6 h-6" />,
    },
    {
      question: "How do I track my progress?",
      answer: `After each interview, you receive a detailed feedback report that highlights your strengths, areas for improvement, and actionable suggestions. These reports are saved in your ${config.projectName} account, allowing you to track your growth over time.`,
      icon: <ChartLine className="w-6 h-6" />,
    },
    {
      question: "Can I try a session for free?",
      answer: `Yes! We offer a free 15-minutes so you can experience the platform's unique, real-time, voice-to-voice AI interview simulation before committing.`,
      icon: <Clock className="w-6 h-6" />,
    },
    {
      question: "Is there a money-back guarantee?",
      answer: `Absolutely! We offer a 30-day money-back guarantee on any unused minutes. If you're unsatisfied with your experience, just reach out to our support team for assistance at ${config.supportEmail}.`,
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 border-t border-b border-primary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-style-h2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Frequently Asked Questions
          </h2>
          <p className="text-style-body-lead text-muted-foreground">
            Everything you need to know about {config.projectName}. Can&apos;t find the answer
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
    </section>
  );
}
