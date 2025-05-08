"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { TestimonialType } from "@/lib/landing/recruitment/types";
import { Quote } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function B2BTestimonialsSection() {
  const testimonials: TestimonialType[] = [
    {
      id: "testimonial-1",
      quote:
        "Our AI doesn't just ask questions, it truly listens. Users consistently tell us: 'The feedback was incredibly detailed and helped me pinpoint exactly what to improve for my next real interview.' Imagine this level of insight for every candidate.",
      author: "Anonymised User Feedback",
    },
    {
      id: "testimonial-2",
      quote:
        "The AI felt like a real interviewer, the feedback was invaluable. I was able to identify my strengths and weaknesses and focus my preparation accordingly.",
      author: "User Review",
    },
    {
      id: "testimonial-3",
      quote:
        "I've used several interview practice tools, but this one stands out for its conversational nature. It doesn't feel scripted, and the follow-up questions are impressively relevant.",
      author: "Practice User",
    },
  ];

  return (
    <SectionWrapper>
      <SectionTitle>Why Hiring Teams & Candidates Rate Our AI Highly</SectionTitle>

      <div className="mt-12">
        <Carousel className="w-full">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <Quote className="h-6 w-6 text-muted-foreground mb-4" />
                    <p className="flex-1 text-muted-foreground mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {testimonial.author.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{testimonial.author}</p>
                        {testimonial.role && testimonial.company && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}, {testimonial.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-8">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </SectionWrapper>
  );
}
