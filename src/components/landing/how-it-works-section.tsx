export function HowItWorksSection() {
  const steps = [
    {
      title: "Upload Your Details",
      description:
        "Share your CV and target job description for a personalized experience.",
    },
    {
      title: "Select Interview Type",
      description:
        "Choose from various interview styles and durations to suit your needs.",
    },
    {
      title: "Practice with AI",
      description:
        "Engage in a realistic interview with our AI, complete with real-time feedback.",
    },
    {
      title: "Review and Improve",
      description:
        "Analyze your performance with our detailed feedback report and AI-powered suggestions.",
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-8">
          How It Works
        </h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 my-16">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
