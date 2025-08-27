import { Brain, Mic, Target } from "lucide-react";
import { config } from "~/config";

export function DifferentiatorsSection() {
  const differentiators = [
    {
      icon: Mic,
      title: "No More Typing—Speak Like You Will in the Interview",
      description: `Stop typing answers into text boxes. Practice exactly how you'll perform on interview day—with your voice. You'll walk in knowing your answers flow naturally, not stumbling over words you've only typed before.`,
    },
    {
      icon: Brain,
      title: "Fix Your Nervous Habits Before They Notice",
      description: `Discover if you're speaking too fast, using too many filler words, or sounding uncertain—issues that lose you jobs but no one tells you about. Get specific coaching on your tone, pace, and confidence so you sound like the professional you are.`,
    },
    {
      icon: Target,
      title: "Practice for YOUR Job, Not Generic Questions",
      description:
        "Stop wasting time on irrelevant questions. Get interview scenarios tailored to your exact industry, experience level, and target role. Know you're prepared for what they'll actually ask, not what some generic guide suggests.",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-t border-b border-primary/50 dark:from-primary/5 dark:via-primary/2 dark:to-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-style-h2 text-foreground mb-4">
            Why You&apos;ll Actually <span className="text-primary">Pass Your Interview</span>
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
