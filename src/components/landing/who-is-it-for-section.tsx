import { Button } from "@/components/ui/button";
import Link from "next/link";

export function WhoIsItForSection() {
  const plans = [
    {
      duration: "15 Minutes",
      description: "Quick practice session",
      price: "$7",
    },
    {
      duration: "45 Minutes",
      description: "Comprehensive interview prep",
      price: "$18",
    },
    {
      duration: "1.5 Hours",
      description: "In-depth practice and feedback",
      price: "$32",
    },
    {
      duration: "3 Hours",
      description: "Ultimate interview mastery",
      price: "$55",
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-8">
          Flexible Plans for Every Job Seeker
        </h2>
        <p className="text-center mb-8">
          Choose the perfect practice duration to fit your schedule and
          preparation needs.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{plan.duration}</h3>
              <p className="mb-4">{plan.description}</p>
              <p className="text-2xl font-bold">{plan.price}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link href="/pricing">View Pricing & Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
