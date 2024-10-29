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
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-8">
          How It Works
        </h2>
        <div className="grid gap-x-10 gap-y-4 md:grid-cols-2 lg:grid-cols-4 grid-rows-[auto_1fr] my-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative row-span-2 grid grid-rows-subgrid items-start text-center border border-primary/30 bg-gradient-to-b from-accent/10 to-primary/10 rounded-lg p-8 pb-12 overflow-hidden"
            >
              <div className="row-span-1 grid grid-cols-[auto_1fr] gap-4 items-start justify-center text-left">
                <div className="mt-2 w-10 h-10 border border-foreground text-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-foreground text-xl font-semibold mb-2">
                  {step.title}
                </h3>
              </div>
              <p className="row-span-1 text-left text-muted-foreground">
                {step.description}
              </p>
              <div className="absolute bottom-[-6rem] right-[-2rem] z-0 w-14.5 overflow-hidden text-muted-foreground/50 tablet:block">
                <svg
                  width="110"
                  height="162"
                  viewBox="0 0 110 162"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="3" cy="3" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="3" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="3" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="3" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="3" r="3" fill="currentColor"></circle>
                  <circle cx="3" cy="29" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="29" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="29" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="29" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="29" r="3" fill="currentColor"></circle>
                  <circle cx="3" cy="55" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="55" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="55" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="55" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="55" r="3" fill="currentColor"></circle>
                  <circle cx="3" cy="81" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="81" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="81" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="81" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="81" r="3" fill="currentColor"></circle>
                  <circle cx="3" cy="107" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="107" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="107" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="107" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="107" r="3" fill="currentColor"></circle>
                  <circle cx="3" cy="133" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="133" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="133" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="133" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="133" r="3" fill="currentColor"></circle>
                  <circle cx="3" cy="159" r="3" fill="currentColor"></circle>
                  <circle cx="29" cy="159" r="3" fill="currentColor"></circle>
                  <circle cx="55" cy="159" r="3" fill="currentColor"></circle>
                  <circle cx="81" cy="159" r="3" fill="currentColor"></circle>
                  <circle cx="107" cy="159" r="3" fill="currentColor"></circle>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
