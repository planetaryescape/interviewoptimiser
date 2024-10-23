"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function PricingPageFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="px-6 py-8 sm:p-10 lg:flex-auto">
      <h3 className="text-2xl font-bold tracking-tight text-card-foreground">
        Frequently Asked Questions
      </h3>
      <dl className="mt-10 space-y-6 divide-y divide-primary/10">
        {[
          {
            question: "How does the free trial work?",
            answer:
              "We offer a 5-minute free trial for first-time users to give you a sneak peek into how our AI-powered mock interviews work. Sign up today and start practicing for free!",
          },
          {
            question: "Can I upgrade my plan after starting?",
            answer:
              "Yes! You can always purchase more minutes if you feel you need extra practice time. Any unused minutes will roll over to your next session.",
          },
          {
            question: "What if I'm not satisfied?",
            answer:
              "We offer a 30-day money-back guarantee on unused minutes. If you're not satisfied with your experience, just let us know, and we'll refund your purchase.",
          },
        ].map((faq, index) => (
          <div key={faq.question} className="pt-6">
            <dt className="text-lg">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-start justify-between text-left text-card-foreground"
                aria-expanded={openFaq === index}
              >
                <span className="font-semibold text-card-foreground">
                  {faq.question}
                </span>
                <span className="ml-6 flex h-7 items-center">
                  <ChevronDown
                    className={`h-6 w-6 transform transition-transform ${
                      openFaq === index ? "-rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </dt>
            {openFaq === index && (
              <dd className="mt-2 pr-12">
                <p className="text-base text-muted-foreground">{faq.answer}</p>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
