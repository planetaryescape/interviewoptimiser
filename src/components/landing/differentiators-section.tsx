import { Brain, Mic, Target } from "lucide-react";
import { config } from "~/config";

export function DifferentiatorsSection() {
  const differentiators = [
    {
      icon: Mic,
      title: "Real Voice-to-Voice Interaction",
      description: `Unlike other platforms, ${config.projectName} offers an authentic, real-time, voice-to-voice interview experience where you actually speak and receive spoken responses. Our platform adapts in real time, creating a true-to-life simulation of an in-person interview.`,
    },
    {
      icon: Brain,
      title: "Emotional and Prosody Analysis",
      description: `We go beyond just assessing your answers—${config.projectName} analyses how you deliver them. Using AI-powered prosody analysis, we evaluate key aspects like confidence, clarity, and concentration, providing a complete picture of your communication skills.`,
    },
    {
      icon: Target,
      title: "Adaptive and Personalised Feedback",
      description:
        "Our interviews adjust dynamically based on your responses, providing tailored questions specific to your role and industry. Post-interview, receive in-depth feedback on both your answers and delivery, helping you improve in real, practical ways.",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-t border-b border-primary/50 dark:from-primary/5 dark:via-primary/2 dark:to-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-style-h2 text-foreground mb-4">
            What Sets <span className="text-primary">{config.projectName}</span> Apart?
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className="relative group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 dark:border dark:border-gray-800"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-white p-4 rounded-xl shadow-lg">
                  <item.icon size={24} />
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-style-h5 mb-4 text-center">{item.title}</h3>
                <p className="text-style-body-base text-center text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
