import { config } from "@/lib/config";

export function SocialProofSection() {
  return (
    <section className="relative w-full py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-8">
          Why Choose {config.projectName}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Realism</h3>
            <p>Experience interviews that adapt to your industry and role.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
            <p>
              Receive detailed insights on your performance after each session.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Tailored Experience</h3>
            <p>
              Practice with questions based on your CV and target job
              description.
            </p>
          </div>
        </div>
        {/* Add testimonials here */}
      </div>
    </section>
  );
}
