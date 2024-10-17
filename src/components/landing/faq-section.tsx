import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { config } from "@/lib/config";

export function FAQSection() {
  const faqs = [
    {
      question: `How does ${config.projectName}'s AI interview practice work?`,
      answer: `${config.projectName} uses advanced AI to create personalized interview simulations based on your CV and target job. You'll engage in real-time conversations, receiving instant feedback to improve your skills.`,
    },
    {
      question: `Is ${config.projectName} suitable for all career levels and industries?`,
      answer:
        "Absolutely! Our AI adapts to various industries, job roles, and experience levels, providing tailored questions and feedback relevant to your specific career goals.",
    },
    {
      question: `What types of interviews can I practice with ${config.projectName}?`,
      answer: `${config.projectName} offers a range of interview types, including behavioral, technical, case studies, and more. You can choose the style that best fits your target role and industry.`,
    },
    {
      question: "How do I access my interview feedback and progress?",
      answer: `After each session, you'll receive a detailed feedback report highlighting your strengths and areas for improvement. You can access these reports anytime through your ${config.projectName} account and track your progress over time.`,
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-8">
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
