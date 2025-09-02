import { StarIcon, TwitterIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BackgroundGradient } from "@/components/background-gradient";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Review } from "~/db/schema";

interface TestimonialCardProps {
  testimonial: {
    data: Review;
  };
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="relative p-px rounded-2xl bg-gradient-to-b from-primary/20 via-primary/10 to-transparent">
      <Card className="group relative h-full overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <BackgroundGradient degrees={212} />

        <div className="relative z-10 flex h-full flex-col gap-6 p-8">
          {/* Rating Display */}
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: testimonial.data.rating }).map((_, i) => (
              <StarIcon
                key={`star-${testimonial.data.id}-${i + 1}`}
                className="h-4 w-4 fill-yellow-500/90 text-yellow-500 drop-shadow-sm transition-transform group-hover:scale-105"
              />
            ))}
          </div>

          {/* Quote Content */}
          <blockquote className="relative">
            <div className="font-serif text-6xl text-primary/20 absolute -top-6 -left-3 select-none">
              {'"'}
            </div>
            <p className="text-style-body-base text-foreground/90 leading-relaxed pl-3">
              {testimonial.data.comment}
            </p>
          </blockquote>

          {/* Author Info */}
          <div className="mt-auto flex items-center gap-4 pt-4 border-t border-primary/10">
            <div className="relative h-14 w-14">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-lg opacity-75" />

              {/* Image container with border */}
              <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <Image
                  src={
                    testimonial.data.imageUrl?.trim() ??
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.data.name}`
                  }
                  alt={testimonial.data.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            <div>
              <h3 className="text-style-h5 text-foreground">{testimonial.data.name}</h3>
              <div className="flex items-center gap-4 mt-1.5">
                {testimonial.data.twitterUsername && (
                  <Link
                    href={`https://twitter.com/${testimonial.data.twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1.5",
                      "text-style-caption text-muted-foreground hover:text-primary",
                      "transition-all duration-200 hover:-translate-y-0.5"
                    )}
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
                    className={cn(
                      "flex items-center gap-1.5",
                      "text-style-caption text-muted-foreground hover:text-primary",
                      "transition-all duration-200 hover:-translate-y-0.5"
                    )}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <title>LinkedIn icon</title>
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
