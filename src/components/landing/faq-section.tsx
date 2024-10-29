import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { config } from "@/lib/config";

export function FAQSection() {
  const faqs = [
    {
      question: `How does ${config.projectName} differ from just asking ChatGPT for interview practice?`,
      answer: `While ChatGPT can provide question-and-answer guidance, ${config.projectName} delivers a fully immersive, real-time voice-to-voice interview experience that simulates the pressures of an actual interview. Our AI adapts dynamically to your responses, assessing not only your answers but also your delivery, confidence, and speaking style—features that ChatGPT alone cannot offer.`,
    },
    {
      question: `How does ${config.projectName}'s AI interview practice work?`,
      answer: `${config.projectName} uses advanced AI to create personalized interview simulations based on your CV and target job. You engage in a live, voice-based interaction with the AI, which adapts its questions and tone in real-time to create an authentic interview experience. Afterward, you receive a detailed feedback report to refine your skills.`,
    },
    {
      question: `Is ${config.projectName} suitable for all career levels and industries?`,
      answer:
        "Absolutely! Our AI customizes each session to suit a range of industries, job roles, and experience levels, ensuring you get relevant questions and feedback that align with your specific career goals, whether you're entry-level or a seasoned professional.",
    },
    {
      question: `What types of interviews can I practice with ${config.projectName}?`,
      answer: `${config.projectName} offers a variety of interview types, including behavioral, technical, and situational formats. Each interview style adapts to your industry and role, so you can choose the style that best fits your goals.`,
    },
    {
      question:
        "Can I practice specific soft skills, like confidence and clarity?",
      answer: `Yes! Unlike traditional platforms, ${config.projectName} uses prosody analysis to evaluate and provide feedback on key communication traits, such as confidence, clarity, and engagement. This allows you to improve not just what you say, but how you say it.`,
    },
    {
      question: `How do I access my interview feedback and track my progress?`,
      answer: `After each interview, you receive a detailed feedback report that highlights your strengths, areas for improvement, and actionable suggestions. These reports are saved in your ${config.projectName} account, allowing you to track your growth over time.`,
    },
    {
      question: "Can I try a session for free before committing?",
      answer: `Yes! We offer a free 5-minute session so you can experience the platform’s unique, real-time, voice-to-voice AI interview simulation before committing to a full plan.`,
    },
    {
      question: "Is there a money-back guarantee?",
      answer: `Absolutely! We offer a 30-day money-back guarantee on any unused minutes. If you're unsatisfied with your experience, just reach out to our support team for assistance.`,
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 border-t border-b border-primary/50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-xl font-bold">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </section>
  );
}
