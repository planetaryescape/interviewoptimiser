"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";
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
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function B2BTestimonialsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>Why Hiring Teams & Candidates Rate Our AI Highly</SectionTitle>
      </motion.div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Carousel className="w-full">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring" as const,
                    stiffness: 100,
                    damping: 15,
                  }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Quote className="h-6 w-6 text-muted-foreground mb-4" />
                      </motion.div>
                      <p className="flex-1 text-muted-foreground mb-6">"{testimonial.quote}"</p>
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
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
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <motion.div
            className="flex justify-center gap-2 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CarouselPrevious className="relative left-0 right-0 mx-2" />
            <CarouselNext className="relative left-0 right-0 mx-2" />
          </motion.div>
        </Carousel>
      </motion.div>
    </SectionWrapper>
  );
}
