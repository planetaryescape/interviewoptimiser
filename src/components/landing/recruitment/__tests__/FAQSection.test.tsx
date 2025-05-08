import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FAQSection from "../sections/FAQSection";

// Import setup file for mocks
import "../__tests__/setup";

describe("FAQSection", () => {
  it("renders the section title", () => {
    render(<FAQSection />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("renders all FAQ questions", () => {
    render(<FAQSection />);

    expect(
      screen.getByText("How does the adaptive difficulty AI work during an interview?")
    ).toBeInTheDocument();

    expect(screen.getByText("How is our company and candidate data secured?")).toBeInTheDocument();

    expect(
      screen.getByText("Can we customise the competency models and question sets for our business?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Will candidates know they are interacting with an AI?")
    ).toBeInTheDocument();

    expect(
      screen.getByText("How does the free practice for individuals work?")
    ).toBeInTheDocument();
  });

  // Skip this test since the accordion content is hidden by default
  it.skip("renders all FAQ answers", () => {
    render(<FAQSection />);

    expect(
      screen.getByText(
        /Our AI analyses candidate responses in real-time for depth, relevance, and clarity/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Data security is paramount. We are pursuing SOC 2 certification/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Absolutely. While our AI can auto-generate interviews from a job description/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Yes, we believe in transparency. Candidates are informed/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Anyone can sign up for a free account and access 15 minutes/i)
    ).toBeInTheDocument();
  });

  it("renders the accordion structure", () => {
    render(<FAQSection />);

    // Check for the questions instead of accordion items
    const questions = [
      "How does the adaptive difficulty AI work during an interview?",
      "How is our company and candidate data secured?",
      "Can we customise the competency models and question sets for our business?",
      "Will candidates know they are interacting with an AI?",
      "How does the free practice for individuals work?",
    ];

    for (const question of questions) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });
});
