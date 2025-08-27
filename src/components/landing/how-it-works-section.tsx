"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export function HowItWorksSection() {
  const steps = [
    {
      title: "Tell Us About Your Dream Job (30 seconds)",
      description:
        "Drop in your CV and the job you want. We'll instantly know exactly what questions they'll ask and what answers they're looking for—no more guessing.",
      gifSrc: "/images/cvjobsubmit.gif",
      alt: "Upload CV and job description process",
      features: [
        "Works with any document format",
        "Instantly ready—no setup required",
        "Get the exact questions for YOUR role",
      ],
    },
    {
      title: "Pick What You Need to Practice (10 seconds)",
      description:
        "Focus on what matters to you. Struggling with behavioral questions? Need to nail technical discussions? Choose what to practice and skip what you don't need.",
      gifSrc: "/images/interview-settings.gif",
      alt: "Choose interview settings",
      features: [
        "Practice only what you need",
        "Short 15-min or full 60-min sessions",
        "Skip the stuff you already know",
      ],
    },
    {
      title: "Have a Real Conversation (Not a Quiz)",
      description:
        "Talk naturally, like you will on interview day. No typing, no scripts—just speak. The interviewer responds to YOU, not generic answers, making every practice unique.",
      gifSrc: "/images/interview-settings.gif",
      alt: "Live interview process",
      features: [
        "Speak naturally, no typing required",
        "Get follow-ups based on YOUR answers",
        "Feel the real interview pressure (safely)",
      ],
    },
    {
      title: "Know Exactly How to Improve (Instantly)",
      description:
        "See exactly what impressed the interviewer and what didn't. Get specific fixes you can apply immediately—no vague feedback like 'be more confident.'",
      gifSrc: "/images/report.gif",
      alt: "Interview performance report",
      features: [
        "See your exact words that worked",
        "Fix specific issues before they matter",
        "Track your improvement over time",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative w-full py-16 md:py-28 lg:py-36 bg-background overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-0 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-primary/10 via-transparent to-transparent -translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[800px] w-[800px] rounded-full bg-gradient-to-tl from-secondary/10 via-transparent to-transparent translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 text-center"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            Ready in Under 5 Minutes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            From Nervous to Interview-Ready in 4 Simple Steps
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            No complex setup. No generic questions. Just real practice that gets you hired. 
            Most users feel confident after just one session.
          </p>
        </motion.div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-1/2 md:left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 rounded-full -translate-x-1/2 md:-translate-x-0"
          />

          <div className="space-y-24 md:space-y-32">
            {steps.map((step, index) => (
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                key={step.title}
                className="relative group"
              >
                <div className="md:flex md:gap-12 lg:gap-16 items-start">
                  <div className="hidden md:flex flex-col items-center mr-4 md:mr-0 self-stretch">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="z-10 w-16 h-16 md:w-20 md:h-20 border-2 border-primary bg-background rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold text-primary shadow-xl mb-2 md:mb-0 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      {index + 1}
                    </motion.div>
                    <div className="hidden md:block w-12 h-1 bg-primary/40 group-hover:bg-primary/70 transition-colors duration-300" />
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 bg-card/50 backdrop-blur-md border border-border/30 rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-primary/50">
                    <div className="w-full md:w-2/5 text-center md:text-left">
                      <div className="md:hidden flex items-center justify-center mb-6">
                        <div className="z-10 w-16 h-16 border-2 border-primary bg-background rounded-full flex items-center justify-center text-2xl font-bold text-primary shadow-lg">
                          {index + 1}
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-md md:text-lg text-muted-foreground mb-5 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-2.5 text-left">
                        {step.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="w-full md:w-3/5 mt-6 md:mt-0">
                      <motion.div
                        whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative overflow-hidden rounded-lg shadow-lg border border-primary/20 aspect-video bg-muted group-hover:border-primary/40 transition-colors duration-300"
                      >
                        <Image
                          src={step.gifSrc}
                          alt={step.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={true}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
