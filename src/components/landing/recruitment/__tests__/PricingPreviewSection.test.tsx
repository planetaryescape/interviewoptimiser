import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PricingPreviewSection from "../sections/PricingPreviewSection";

// Import setup file for mocks
import "../__tests__/setup";

describe("PricingPreviewSection", () => {
  it("renders the section title", () => {
    render(<PricingPreviewSection />);
    expect(screen.getByText("Pricing Plans")).toBeInTheDocument();
  });

  it("renders all pricing tiers", () => {
    render(<PricingPreviewSection />);

    // Check for tier names
    expect(screen.getByText("Growth Tier")).toBeInTheDocument();
    expect(screen.getByText("Scale Tier")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Suite")).toBeInTheDocument();
  });

  it("displays features for each tier", () => {
    render(<PricingPreviewSection />);

    // Growth tier features
    expect(screen.getByText("Up to 50 interviews/month")).toBeInTheDocument();
    expect(screen.getByText("Standard reporting")).toBeInTheDocument();
    expect(screen.getByText("Email support")).toBeInTheDocument();
    expect(screen.getByText("Basic ATS integration")).toBeInTheDocument();

    // Scale tier features
    expect(screen.getByText("Up to 200 interviews/month")).toBeInTheDocument();
    expect(screen.getByText("Advanced analytics")).toBeInTheDocument();
    expect(screen.getByText("Priority support")).toBeInTheDocument();
    expect(screen.getByText("Full ATS integration")).toBeInTheDocument();
    expect(screen.getByText("Custom question sets")).toBeInTheDocument();

    // Enterprise tier features
    expect(screen.getByText("Unlimited interviews")).toBeInTheDocument();
    expect(screen.getByText("Enterprise reporting")).toBeInTheDocument();
    expect(screen.getByText("Dedicated account manager")).toBeInTheDocument();
    expect(screen.getByText("Advanced integrations")).toBeInTheDocument();
    expect(screen.getByText("Custom deployment options")).toBeInTheDocument();
    expect(screen.getByText("On-premise options available")).toBeInTheDocument();
  });

  it("renders CTA buttons for each tier", () => {
    render(<PricingPreviewSection />);

    const contactSalesButton = screen.getByRole("link", { name: "Contact Sales" });
    expect(contactSalesButton).toBeInTheDocument();
    expect(contactSalesButton).toHaveAttribute("href", "#contact-form");

    const requestQuoteButton = screen.getByRole("link", { name: "Request Custom Quote" });
    expect(requestQuoteButton).toBeInTheDocument();
    expect(requestQuoteButton).toHaveAttribute("href", "#contact-form");

    const bookDemoButton = screen.getByRole("link", { name: "Book Enterprise Demo" });
    expect(bookDemoButton).toBeInTheDocument();
    expect(bookDemoButton).toHaveAttribute("href", "#contact-form");
  });

  it("counts the total number of features", () => {
    render(<PricingPreviewSection />);

    // Count the total number of features by counting the feature text elements
    const growthFeatures = [
      "Up to 50 interviews/month",
      "Standard reporting",
      "Email support",
      "Basic ATS integration",
    ];
    const scaleFeatures = [
      "Up to 200 interviews/month",
      "Advanced analytics",
      "Priority support",
      "Full ATS integration",
      "Custom question sets",
    ];
    const enterpriseFeatures = [
      "Unlimited interviews",
      "Enterprise reporting",
      "Dedicated account manager",
      "Advanced integrations",
      "Custom deployment options",
      "On-premise options available",
    ];

    const allFeatures = [...growthFeatures, ...scaleFeatures, ...enterpriseFeatures];

    for (const feature of allFeatures) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }

    // Verify the total count
    expect(allFeatures.length).toBe(15); // 4 + 5 + 6 features
  });

  it("displays the custom plan text", () => {
    render(<PricingPreviewSection />);

    expect(screen.getByText(/Need a custom plan\?/i)).toBeInTheDocument();
    const contactLink = screen.getByText("Contact our sales team");
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "#contact-form");
  });
});
