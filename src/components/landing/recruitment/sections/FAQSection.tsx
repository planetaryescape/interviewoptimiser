"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQItem } from "@/lib/landing/recruitment/types";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function FAQSection() {
  const faqs: FAQItem[] = [
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

  return (
    <SectionWrapper className="bg-muted/20">
      <SectionTitle>Frequently Asked Questions</SectionTitle>

      <div className="max-w-3xl mx-auto mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionWrapper>
  );
}
