"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, GitBranch, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function FeatureSpotlightCarousel() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const features = [
    {
      id: "feature-1",
      title: "True Conversational Interviews",
      description:
        "Candidates respond naturally as our AI listens, probes, and pivots—a dynamic conversation validated by hundreds of users seeking realistic practice.",
      icon: <MessageSquare className="h-8 w-8" />,
      color: "from-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:to-blue-600/10",
    },
    {
      id: "feature-2",
      title: "Dynamic Adaptive Questioning",
      description:
        "Follow‑up questions auto‑calibrate to candidate performance, exposing genuine skill ceilings—an intelligence honed through extensive real-world candidate interactions.",
      icon: <GitBranch className="h-8 w-8" />,
      color: "from-purple-500/20 to-purple-600/20 dark:from-purple-500/10 dark:to-purple-600/10",
    },
    {
      id: "feature-3",
      title: "Comprehensive Candidate Insights",
      description:
        "Full recording, transcript, prosody analysis, key competency scores—the actionable intelligence your team needs, with feedback depth praised by career advancers.",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-green-500/20 to-green-600/20 dark:from-green-500/10 dark:to-green-600/10",
    },
  ];

  // Autoplay functionality for desktop cards
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <SectionWrapper className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <SectionTitle>Core Technology</SectionTitle>
      </motion.div>

      {/* Mobile view: Carousel */}
      <div className="md:hidden mt-8">
        <Carousel
          opts={{
            loop: true,
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={feature.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={cn("h-full overflow-hidden relative")}>
                    <div
                      className={cn("absolute inset-0 bg-gradient-to-br opacity-30", feature.color)}
                    />
                    <CardHeader>
                      <motion.div
                        className="mb-4 text-primary"
                        whileHover={{
                          scale: 1.1,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.5 },
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-4">
            <CarouselPrevious className="relative left-0 right-0 translate-y-0" />
            <CarouselNext className="relative left-0 right-0 translate-y-0" />
          </div>
        </Carousel>
      </div>

      {/* Desktop view: Interactive Cards */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 mt-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <Card
              className={cn(
                "h-full cursor-pointer transition-all duration-300 relative overflow-hidden border-2",
                activeFeature === index
                  ? "border-primary/50 shadow-lg"
                  : "border-transparent hover:border-primary/30"
              )}
              onClick={() => setActiveFeature(index)}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", feature.color)} />
              <CardHeader>
                <motion.div
                  className="mb-4 text-primary"
                  animate={{
                    scale: activeFeature === index ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: activeFeature === index ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "reverse",
                  }}
                >
                  {feature.icon}
                </motion.div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
