import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactFormSection from "../sections/ContactFormSection";

// Import setup file for mocks
import "../__tests__/setup";

describe("ContactFormSection", () => {
  it("renders the section title", () => {
    render(<ContactFormSection />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });

  it("renders the contact form with all fields", () => {
    render(<ContactFormSection />);

    // Check for form labels
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Work Email")).toBeInTheDocument();
    expect(screen.getByText("Company Name")).toBeInTheDocument();
    expect(screen.getByText("Your Role")).toBeInTheDocument();
    expect(screen.getByText("I'm interested in")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();

    // Check for form inputs
    expect(screen.getByPlaceholderText("John Smith")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@company.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Company Ltd.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tell us about your hiring needs...")).toBeInTheDocument();

    // Check for select components by their combobox role and text content
    const roleSelect = screen.getByText("Select your role");
    expect(roleSelect).toBeInTheDocument();

    const interestSelect = screen.getByText("Select your interest");
    expect(interestSelect).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("has a submit button", () => {
    render(<ContactFormSection />);

    // Get the submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.getAttribute("type")).toBe("submit");
  });
});
