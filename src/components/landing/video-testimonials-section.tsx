"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Star } from "lucide-react";
import { useState } from "react";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  videoUrl: string;
  thumbnailUrl: string;
  quote: string;
  rating: number;
}

const videoTestimonials: VideoTestimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    videoUrl: "#",
    thumbnailUrl: "/testimonials/sarah-thumb.jpg",
    quote:
      "Interview Optimiser's prosody analysis was a game-changer. It helped me realize I was speaking too fast when nervous.",
    rating: 5,
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    role: "Product Manager",
    company: "Microsoft",
    location: "Seattle, WA",
    videoUrl: "#",
    thumbnailUrl: "/testimonials/michael-thumb.jpg",
    quote:
      "The real-time voice feedback helped me land my dream job. The AI felt like talking to a real interviewer!",
    rating: 5,
  },
  {
    id: "3",
    name: "Priya Patel",
    role: "Data Scientist",
    company: "Amazon",
    location: "New York, NY",
    videoUrl: "#",
    thumbnailUrl: "/testimonials/priya-thumb.jpg",
    quote:
      "I improved my interview performance by 70% in just 2 weeks. The emotion analysis was incredibly insightful.",
    rating: 5,
  },
];

export function VideoTestimonialsSection() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Success Stories
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Hear From Our Success Stories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands who transformed their interview skills and landed their dream jobs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {videoTestimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-video bg-muted cursor-pointer group">
                {playingVideo === testimonial.id ? (
                  <iframe
                    title={`${testimonial.name} testimonial video`}
                    src={testimonial.videoUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={testimonial.thumbnailUrl}
                      alt={`${testimonial.name} testimonial`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <button
                        type="button"
                        onClick={() => setPlayingVideo(testimonial.id)}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={`star-${testimonial.id}-${i}`}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <blockquote className="text-sm mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-primary/5 rounded-lg">
            <div>
              <p className="text-3xl font-bold">4.9/5</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-3xl font-bold">10,000+</p>
              <p className="text-sm text-muted-foreground">Success Stories</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-3xl font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Got Job Offers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
