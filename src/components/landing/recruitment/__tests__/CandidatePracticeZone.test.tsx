import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CandidatePracticeZone from "../sections/CandidatePracticeZone";

// Import setup file for mocks
import "../__tests__/setup";

describe("CandidatePracticeZone", () => {
  it("renders the section title", () => {
    render(<CandidatePracticeZone />);
    expect(
      screen.getByText("Job Seekers: Ace Your Next Interview – Practise for Free!")
    ).toBeInTheDocument();
  });

  it("displays all statistics", () => {
    render(<CandidatePracticeZone />);

    // Check for statistic values
    expect(screen.getByText("721+")).toBeInTheDocument();
    expect(screen.getByText("759+")).toBeInTheDocument();
    expect(screen.getByText("120+")).toBeInTheDocument();

    // Check for statistic labels
    expect(screen.getByText("Minutes of Live Interview Practice Logged")).toBeInTheDocument();
    expect(screen.getByText("Adaptive AI Interviews Successfully Completed")).toBeInTheDocument();
    expect(screen.getByText("Career Journeys Enhanced Through Practice")).toBeInTheDocument();
  });

  it("contains a call-to-action button with correct link", () => {
    render(<CandidatePracticeZone />);

    const ctaButton = screen.getByRole("link", { name: "Practice for Free" });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute("href", "/practice");
  });

  it("displays the free practice description", () => {
    render(<CandidatePracticeZone />);

    expect(screen.getByText(/Join over/i)).toBeInTheDocument();
    expect(
      screen.getByText(/15 minutes of free, dynamic interview practice every day/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/No catch, just real improvement./i)).toBeInTheDocument();
  });
});
