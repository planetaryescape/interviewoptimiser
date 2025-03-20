import { BackgroundGradient } from "@/components/ui/background-gradient";

export function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Interview Simulation",
      description:
        "Experience realistic interviews with our advanced AI that adapts to your responses and industry-specific scenarios.",
    },
    {
      title: "Personalized Question Bank",
      description:
        "Get asked questions tailored to your experience level, industry, and specific job role, ensuring relevant practice every time.",
    },
    {
      title: "Real-time Feedback and Coaching",
      description:
        "Receive instant feedback on your answers, body language, and tone, with suggestions for improvement as you practice.",
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <BackgroundGradient
            key={feature.title}
            className="rounded-[22px] h-full p-4 sm:p-10 bg-white dark:bg-zinc-900"
          >
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 font-sourceSerif">
              {feature.title}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
          </BackgroundGradient>
        ))}
      </div>
    </div>
  );
}
