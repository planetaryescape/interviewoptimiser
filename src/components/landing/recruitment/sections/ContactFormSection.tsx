"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <SectionWrapper id="contact-form">
      <SectionTitle>Get in Touch</SectionTitle>

      <div className="max-w-2xl mx-auto mt-8">
        {submitted ? (
          <div className="text-center p-8 border border-border rounded-lg bg-muted/20">
            <h3 className="text-xl font-semibold mb-2">Thanks for reaching out!</h3>
            <p className="text-muted-foreground">
              We&apos;ve received your message and will get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input id="name" name="name" placeholder="John Smith" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Work Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company Name
                </label>
                <Input id="company" name="company" placeholder="Company Ltd." required />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Your Role
                </label>
                <Select name="role">
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="interest" className="text-sm font-medium">
                I&apos;m interested in
              </label>
              <Select name="interest">
                <SelectTrigger>
                  <SelectValue placeholder="Select your interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Product Demo</SelectItem>
                  <SelectItem value="pricing">Custom Pricing</SelectItem>
                  <SelectItem value="enterprise">Enterprise Solution</SelectItem>
                  <SelectItem value="integration">ATS Integration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your hiring needs..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit"}
            </Button>
          </form>
        )}
      </div>
    </SectionWrapper>
  );
}
