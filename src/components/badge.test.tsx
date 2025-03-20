import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");
    expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
  });

  it("applies success variant styles", () => {
    render(<Badge variant="success">Success Badge</Badge>);
    const badge = screen.getByText("Success Badge");
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  it("applies warning variant styles", () => {
    render(<Badge variant="warning">Warning Badge</Badge>);
    const badge = screen.getByText("Warning Badge");
    expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  it("applies destructive variant styles", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badge = screen.getByText("Destructive Badge");
    expect(badge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText("Custom Badge");
    expect(badge).toHaveClass("custom-class");
  });

  it("combines variant and custom className", () => {
    render(
      <Badge variant="success" className="custom-class">
        Combined Badge
      </Badge>
    );
    const badge = screen.getByText("Combined Badge");
    expect(badge).toHaveClass("bg-green-100", "text-green-800", "custom-class");
  });
});
