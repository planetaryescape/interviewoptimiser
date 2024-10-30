"use client";

import { Button } from "@/components/ui/button";
import { Review } from "@/db/schema";
import { config } from "@/lib/config";
import { EntityList } from "@/lib/utils/formatEntity";
import { useQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, StarIcon, TwitterIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

async function getTestimonials() {
  const res = await fetch("/api/public/reviews");
  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  return await res.json();
}

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
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
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              What Our Users Say
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Don&apos;t just take our word for it. Here&apos;s what people are
              saying about {config.projectName}.
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
                  <div className="relative flex h-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800/50 dark:shadow-gray-900/50">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.data.name}`}
                          alt={testimonial.data.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {testimonial.data.name}
                        </h3>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: testimonial.data.rating }).map(
                            (_, i) => (
                              <StarIcon
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <blockquote className="text-gray-600 dark:text-gray-300">
                      &quot;{testimonial.data.comment}&quot;
                    </blockquote>
                    <div className="mt-auto flex items-center gap-4">
                      {testimonial.data.twitterUsername && (
                        <Link
                          href={`https://twitter.com/${testimonial.data.twitterUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <TwitterIcon className="h-4 w-4" />
                          <span>@{testimonial.data.twitterUsername}</span>
                        </Link>
                      )}
                      {testimonial.data.linkedinUrl && (
                        <Link
                          href={testimonial.data.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          <span>LinkedIn</span>
                        </Link>
                      )}
                    </div>
                  </div>
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
            <h3 className="text-xl font-semibold">
              Have You Used {config.projectName}?
            </h3>
            <p className="text-muted-foreground">
              Your feedback helps us improve and helps others make informed
              decisions. Whether you had a great experience or see room for
              improvement, we&apos;d love to hear your thoughts.
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link
              href="/submit-testimonial"
              className="flex items-center gap-2"
            >
              Share Your Experience
              <StarIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
