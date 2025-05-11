"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface HeroDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeroDemoModal({ isOpen, onClose }: HeroDemoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
        <div className="relative">
          <DialogHeader className="absolute top-4 right-4 z-10">
            <Button
              className="h-8 w-8 rounded-full p-0 bg-background/80 backdrop-blur-sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>

          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" // Replace with actual video ID
              title="Interview Optimiser Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              className="w-full h-full"
            />
          </div>

          <div className="p-6">
            <DialogTitle className="text-xl">How Interview Optimiser Works</DialogTitle>
            <DialogDescription className="mt-2">
              This 60-second demo shows how our AI-powered interview platform helps recruiters save
              time and find the best candidates through adaptive conversations.
            </DialogDescription>
            <div className="mt-4 flex justify-end">
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
              <Button
                className="ml-2"
                size="sm"
                onClick={() => {
                  onClose();
                  const contactForm = document.getElementById("contact-form");
                  if (contactForm) {
                    contactForm.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
