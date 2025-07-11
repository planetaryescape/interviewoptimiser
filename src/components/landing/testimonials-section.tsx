"use client";

import { Button } from "@/components/ui/button";
import type { EntityList } from "@/lib/utils/formatEntity";
import { useQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, StarIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { config } from "~/config";
import type { Review } from "~/db/schema";
import { TestimonialCard } from "./testimonial-card";

async function getTestimonials() {
  const res = await fetch("/api/public/reviews");
  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  return await res.json();
}

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }) as any,
  ]);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const { data: testimonials, error } = useQuery<EntityList<Review>>({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
  });

  if (error) {
    console.error("Failed to load testimonials:", error);
    return null;
  }

  if (!testimonials?.data?.length) {
    return null;
  }

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-style-h2 text-foreground tracking-tighter">What Our Users Say</h2>
            <p className="max-w-[900px] text-style-body-lead text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don&apos;t just take our word for it. Here&apos;s what people are saying about{" "}
              {config.projectName}.
            </p>
          </div>
        </div>

        <div className="relative mt-12 w-full max-w-7xl mx-auto">
          <div className="overflow-hidden w-full mx-auto" ref={emblaRef}>
            <div className="flex gap-6 py-4">
              {testimonials.data.map((testimonial) => (
                <div
                  key={testimonial.data.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-12 space-y-6 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="text-style-h3 text-foreground">Have You Used {config.projectName}?</h3>
            <p className="text-style-body-base text-muted-foreground">
              Your feedback helps us improve and helps others make informed decisions. Whether you
              had a great experience or see room for improvement, we&apos;d love to hear your
              thoughts.
            </p>
          </div>
          <Button asChild variant="outline" className="group text-style-body-base">
            <Link href="/submit-testimonial" className="flex items-center gap-2">
              Share Your Experience
              <StarIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
