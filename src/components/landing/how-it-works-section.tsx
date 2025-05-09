"use client";

import { motion } from "framer-motion";

export function HowItWorksSection() {
  const steps = [
    {
      title: "Upload Your Details",
      description:
        "Start by sharing your CV and target job description. This allows our AI to tailor the interview experience to your specific career goals and desired role.",
    },
    {
      title: "Choose Your Interview Style",
      description:
        "Select the interview type that suits you best—whether it's behavioral, technical, or situational—and set the duration to fit your preparation needs.",
    },
    {
      title: "Get a Realistic, Adaptive Interview",
      description:
        "Experience a true-to-life interview simulation where our AI interacts with you in real-time, adapting to your responses and providing live voice-to-voice feedback.",
    },
    {
      title: "Analyze and Refine Your Performance",
      description:
        "After the session, receive a comprehensive feedback report, featuring insights into your strengths, areas for improvement, and actionable tips to help you refine your responses.",
    },
  ];

  return (
    <section id="how-it-works" className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-style-h2 text-foreground text-center">How It Works</h2>
        </motion.div>
        <div className="grid gap-x-10 gap-y-4 md:grid-cols-2 lg:grid-cols-4 grid-rows-[auto_1fr] my-16">
          {steps.map((step, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
              }}
              key={step.title}
              className="relative row-span-2 grid grid-rows-subgrid items-start text-center border border-primary/30 bg-gradient-to-b from-accent/20 to-primary/20 rounded-lg p-8 pb-12 overflow-hidden transition-colors duration-300 hover:border-primary/50 group"
            >
              <div className="row-span-1 grid grid-cols-[auto_1fr] gap-4 items-start justify-center text-left">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="mt-2 w-10 h-10 border border-foreground text-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4 bg-background/50 backdrop-blur-sm"
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-style-h5 text-left font-medium group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
              </div>
              <p className="row-span-1 text-left text-style-body-base text-muted-foreground">
                {step.description}
              </p>
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 50,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                }}
                className="absolute bottom-[-6rem] right-[-2rem] z-0 w-14.5 overflow-hidden text-muted-foreground/30 group-hover:text-primary/30 transition-colors duration-300"
              >
                <svg
                  width="110"
                  height="162"
                  viewBox="0 0 110 162"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Gradient line</title>
                  <circle cx="3" cy="3" r="3" fill="currentColor" />
                  <circle cx="29" cy="3" r="3" fill="currentColor" />
                  <circle cx="55" cy="3" r="3" fill="currentColor" />
                  <circle cx="81" cy="3" r="3" fill="currentColor" />
                  <circle cx="107" cy="3" r="3" fill="currentColor" />
                  <circle cx="3" cy="29" r="3" fill="currentColor" />
                  <circle cx="29" cy="29" r="3" fill="currentColor" />
                  <circle cx="55" cy="29" r="3" fill="currentColor" />
                  <circle cx="81" cy="29" r="3" fill="currentColor" />
                  <circle cx="107" cy="29" r="3" fill="currentColor" />
                  <circle cx="3" cy="55" r="3" fill="currentColor" />
                  <circle cx="29" cy="55" r="3" fill="currentColor" />
                  <circle cx="55" cy="55" r="3" fill="currentColor" />
                  <circle cx="81" cy="55" r="3" fill="currentColor" />
                  <circle cx="107" cy="55" r="3" fill="currentColor" />
                  <circle cx="3" cy="81" r="3" fill="currentColor" />
                  <circle cx="29" cy="81" r="3" fill="currentColor" />
                  <circle cx="55" cy="81" r="3" fill="currentColor" />
                  <circle cx="81" cy="81" r="3" fill="currentColor" />
                  <circle cx="107" cy="81" r="3" fill="currentColor" />
                  <circle cx="3" cy="107" r="3" fill="currentColor" />
                  <circle cx="29" cy="107" r="3" fill="currentColor" />
                  <circle cx="55" cy="107" r="3" fill="currentColor" />
                  <circle cx="81" cy="107" r="3" fill="currentColor" />
                  <circle cx="107" cy="107" r="3" fill="currentColor" />
                  <circle cx="3" cy="133" r="3" fill="currentColor" />
                  <circle cx="29" cy="133" r="3" fill="currentColor" />
                  <circle cx="55" cy="133" r="3" fill="currentColor" />
                  <circle cx="81" cy="133" r="3" fill="currentColor" />
                  <circle cx="107" cy="133" r="3" fill="currentColor" />
                  <circle cx="3" cy="159" r="3" fill="currentColor" />
                  <circle cx="29" cy="159" r="3" fill="currentColor" />
                  <circle cx="55" cy="159" r="3" fill="currentColor" />
                  <circle cx="81" cy="159" r="3" fill="currentColor" />
                  <circle cx="107" cy="159" r="3" fill="currentColor" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
