import { BackgroundGradient } from "@/components/ui/background-gradient";

export function FeaturesSection() {
  const features = [
    {
      title: "Practice Until You're Ready",
      description:
        "Run through as many mock interviews as you need. No session limits, no scheduling, no extra charges. The AI interviewer is available whenever you are.",
    },
    {
      title: "Questions That Match Your Role",
      description:
        "Get asked about your actual experience and the job you're applying for. The questions adapt to your background, not a one-size-fits-all script.",
    },
    {
      title: "Know What to Improve Right Away",
      description:
        "See exactly where your answer was strong and where it fell short—immediately after you finish. No waiting days to find out what to work on.",
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, _index) => (
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
