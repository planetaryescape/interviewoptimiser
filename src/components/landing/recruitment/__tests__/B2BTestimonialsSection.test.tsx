import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Try with doMock as it's not hoisted
vi.doMock("embla-carousel-react", () => ({
  default: () => [
    // This mocks the default export
    vi.fn(), // carouselRef
    {
      // api object
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      scrollTo: vi.fn(),
      scrollSnapList: vi.fn(() => []),
      selectedScrollSnap: vi.fn(() => 0),
      canScrollPrev: vi.fn(() => true),
      canScrollNext: vi.fn(() => true),
      scrollProgress: vi.fn(() => 0),
    },
  ],
}));

describe("B2BTestimonialsSection", () => {
  // Test to ensure the mock is applied and vi is available
  it("should have vi defined and mock embla-carousel-react", async () => {
    // Dynamically import the component *after* vi.doMock has been called
    const B2BTestimonialsSectionWithMock = (await import("../sections/B2BTestimonialsSection"))
      .default;
    render(<B2BTestimonialsSectionWithMock />);
    expect(vi).toBeDefined();
    // Add a basic assertion related to the component if needed,
    // but the main goal here is to check if vi.doMock works and vi is defined.
    expect(
      screen.getByText("Why Hiring Teams & Candidates Rate Our AI Highly")
    ).toBeInTheDocument();
  });

  it("renders the section title correctly", async () => {
    const B2BTestimonialsSectionWithMock = (await import("../sections/B2BTestimonialsSection"))
      .default;
    render(<B2BTestimonialsSectionWithMock />);
    expect(
      screen.getByText("Why Hiring Teams & Candidates Rate Our AI Highly")
    ).toBeInTheDocument();
  });

  it("renders testimonial content correctly", async () => {
    const B2BTestimonialsSectionWithMock = (await import("../sections/B2BTestimonialsSection"))
      .default;
    render(<B2BTestimonialsSectionWithMock />);
    // Check for presence of testimonial content (adjust selectors as needed)
    expect(screen.getByText(/Anonymised User Feedback/i)).toBeInTheDocument();
    expect(screen.getByText(/User Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Practice User/i)).toBeInTheDocument();
    // Check for a snippet of one of the quotes
    expect(screen.getByText(/truly listens/i)).toBeInTheDocument();
  });

  it("renders navigation buttons", async () => {
    const B2BTestimonialsSectionWithMock = (await import("../sections/B2BTestimonialsSection"))
      .default;
    render(<B2BTestimonialsSectionWithMock />);
    expect(screen.getByRole("button", { name: /Previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next slide/i })).toBeInTheDocument();
  });
});
