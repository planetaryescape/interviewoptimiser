"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BarChart3, GitBranch, MessageSquare } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function FeatureSpotlightCarousel() {
  const features = [
    {
      id: "feature-1",
      title: "True Conversational Interviews",
      description:
        "Candidates respond naturally as our AI listens, probes, and pivots—a dynamic conversation validated by hundreds of users seeking realistic practice.",
      icon: <MessageSquare className="h-8 w-8" />,
    },
    {
      id: "feature-2",
      title: "Dynamic Adaptive Questioning",
      description:
        "Follow‑up questions auto‑calibrate to candidate performance, exposing genuine skill ceilings—an intelligence honed through extensive real-world candidate interactions.",
      icon: <GitBranch className="h-8 w-8" />,
    },
    {
      id: "feature-3",
      title: "Comprehensive Candidate Insights",
      description:
        "Full recording, transcript, prosody analysis, key competency scores—the actionable intelligence your team needs, with feedback depth praised by career advancers.",
      icon: <BarChart3 className="h-8 w-8" />,
    },
  ];

  return (
    <SectionWrapper>
      <SectionTitle>Core Technology</SectionTitle>

      {/* Mobile view: Carousel */}
      <div className="md:hidden mt-8">
        <Carousel>
          <CarouselContent>
            {features.map((feature) => (
              <CarouselItem key={feature.id}>
                <Card>
                  <CardHeader>
                    <div className="mb-4 text-primary">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>

      {/* Desktop view: Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 mt-8">
        {features.map((feature) => (
          <Card key={feature.id} className="h-full">
            <CardHeader>
              <div className="mb-4 text-primary">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
