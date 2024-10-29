import { config } from "@/lib/config";

export function DifferentiatorsSection() {
  return (
    <section className="relative w-full py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-t border-b border-primary/50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-8">
          What Sets {config.projectName} Apart?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-2 uppercase">
              Real Voice-to-Voice Interaction
            </h3>
            <p>
              Unlike other platforms, {config.projectName} offers an authentic,
              real-time, voice-to-voice interview experience where you actually
              speak and receive spoken responses. Our platform adapts in real
              time, creating a true-to-life simulation of an in-person
              interview.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 uppercase">
              Emotional and Prosody Analysis
            </h3>
            <p>
              We go beyond just assessing your answers—{config.projectName}{" "}
              analyses how you deliver them. Using AI-powered prosody analysis,
              we evaluate key aspects like confidence, clarity, and
              concentration, providing a complete picture of your communication
              skills.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 uppercase">
              Adaptive and Personalised Feedback
            </h3>
            <p>
              Our interviews adjust dynamically based on your responses,
              providing tailored questions specific to your role and industry.
              Post-interview, receive in-depth feedback on both your answers and
              delivery, helping you improve in real, practical ways.
            </p>
          </div>
        </div>
        {/* Optional testimonials or additional differentiator content */}
      </div>
    </section>
  );
}
