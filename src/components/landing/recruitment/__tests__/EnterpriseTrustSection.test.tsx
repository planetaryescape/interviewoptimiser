import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EnterpriseTrustSection from "../sections/EnterpriseTrustSection";

// Import setup file for mocks
import "../__tests__/setup";

describe("EnterpriseTrustSection", () => {
  it("renders the enterprise security section", () => {
    render(<EnterpriseTrustSection />);

    // Check for security heading
    expect(screen.getByText("Enterprise Security")).toBeInTheDocument();

    // Check for security badges
    expect(screen.getByText("SOC 2 Type II (In Progress)")).toBeInTheDocument();
    expect(screen.getByText("GDPR Compliant")).toBeInTheDocument();
  });

  it("renders the ATS integration section", () => {
    render(<EnterpriseTrustSection />);

    // Check for ATS heading
    expect(screen.getByText("ATS Integration")).toBeInTheDocument();

    // Check for ATS options
    expect(screen.getByText("Greenhouse")).toBeInTheDocument();
    expect(screen.getByText("Lever")).toBeInTheDocument();
    expect(screen.getByText("Workday")).toBeInTheDocument();
  });

  it("renders the enterprise options text", () => {
    render(<EnterpriseTrustSection />);

    const text = screen.getByText(/On‑premise AI inference and custom data residency options/i);
    expect(text).toBeInTheDocument();
  });
});
