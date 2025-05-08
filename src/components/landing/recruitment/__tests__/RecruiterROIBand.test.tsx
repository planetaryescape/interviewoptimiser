import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecruiterROIBand from "../sections/RecruiterROIBand";

// Import setup file for mocks
import "../__tests__/setup";

describe("RecruiterROIBand", () => {
  it("renders the component with correct title", () => {
    render(<RecruiterROIBand />);
    expect(screen.getByText("Recruiter ROI")).toBeInTheDocument();
  });

  it("displays all ROI metrics", () => {
    render(<RecruiterROIBand />);

    // Check for column headers
    expect(screen.getByText("Metric")).toBeInTheDocument();
    expect(screen.getByText("Typical Hiring Process")).toBeInTheDocument();
    expect(screen.getByText("With Interview Optimiser (Projected)")).toBeInTheDocument();
    expect(screen.getByText("Potential Improvement")).toBeInTheDocument();

    // Check for row data
    expect(screen.getByText("Time‑to‑Hire")).toBeInTheDocument();
    expect(screen.getByText("38 days")).toBeInTheDocument();
    expect(screen.getByText("24–28 days")).toBeInTheDocument();
    expect(screen.getByText("Up to 37%")).toBeInTheDocument();

    expect(screen.getByText("Recruiter Hours / Hire")).toBeInTheDocument();
    expect(screen.getByText("3.5 hrs")).toBeInTheDocument();
    expect(screen.getByText("< 0.4 hrs")).toBeInTheDocument();
    expect(screen.getByText("Over 80%")).toBeInTheDocument();

    expect(screen.getByText("Candidate Experience")).toBeInTheDocument();
    expect(screen.getByText("Variable")).toBeInTheDocument();
    expect(screen.getByText("Consistently Positive & Fair")).toBeInTheDocument();
    expect(screen.getByText("Enhanced Brand")).toBeInTheDocument();
  });

  it("contains a call-to-action button", () => {
    render(<RecruiterROIBand />);
    const button = screen.getByRole("link", { name: "Estimate My ROI" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "#contact-form");
  });
});
