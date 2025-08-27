"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCSRFToken } from "@/hooks/use-csrf-token";
import { useState } from "react";
import { toast } from "sonner";

export function CSRFProtectedForm() {
  const { secureFetch, isLoading } = useCSRFToken();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) {
      toast.error("Please wait for security initialization");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await secureFetch("/api/example", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const _data = await response.json();
        toast.success("Form submitted successfully!");
        setFormData({ name: "", email: "" });
      } else {
        const error = await response.json();
        toast.error(error.message || "Submission failed");
      }
    } catch (_error) {
      toast.error("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting || isLoading}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
