"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQItem } from "@/lib/landing/recruitment/types";
import { motion } from "framer-motion";
import SchemaMarkup from "../SchemaMarkup";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

// Export FAQs data so it can be used for both UI and schema
export const faqData: FAQItem[] = [
  {
    question: "How does the adaptive difficulty AI work during an interview?",
    answer:
      "Our AI analyses candidate responses in real-time for depth, relevance, and clarity. Based on this, it selects subsequent questions that appropriately challenge the candidate, providing a more accurate assessment of their true capabilities.",
  },
  {
    question: "How is our company and candidate data secured?",
    answer:
      "Data security is paramount. We are pursuing SOC 2 certification and are GDPR compliant. We employ end-to-end encryption, secure cloud infrastructure, and robust access controls to protect all your data.",
  },
  {
    question: "Can we customise the competency models and question sets for our business?",
    answer:
      "Absolutely. While our AI can auto-generate interviews from a job description, you have full control to edit questions, add your own, and align the assessment criteria with your organisation's specific competency frameworks.",
  },
  {
    question: "Will candidates know they are interacting with an AI?",
    answer:
      "Yes, we believe in transparency. Candidates are informed that they are participating in an AI-assisted interview. Our focus is on providing a fair, consistent, and insightful experience.",
  },
  {
    question: "How does the free practice for individuals work?",
    answer:
      "Anyone can sign up for a free account and access 15 minutes of our adaptive AI interview practice daily. Simply click 'Practice for Free' in our main menu or the Candidate Practice Zone.",
  },
];

export default function FAQSection() {
  const faqs = faqData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
  };

  return (
    <SectionWrapper className="bg-muted/20" id="faq">
      {/* FAQ Schema Markup */}
      <SchemaMarkup faqs={faqs} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>Frequently Asked Questions</SectionTitle>
      </motion.div>

      <motion.div
        className="max-w-3xl mx-auto mt-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div key={faq.question} custom={index} variants={itemVariants}>
              <AccordionItem value={faq.question}>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="hover:underline">{faq.question}</span>
                  </AccordionTrigger>
                </motion.div>
                <AccordionContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </SectionWrapper>
  );
}
