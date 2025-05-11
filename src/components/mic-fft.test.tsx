import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MicFFT } from "./mic-fft";

// Mock react-virtualized AutoSizer as it doesn't work well in test environment
vi.mock("react-virtualized", () => ({
  AutoSizer: ({
    children,
  }: { children: (size: { width: number; height: number }) => React.ReactNode }) =>
    children({ width: 100, height: 50 }),
}));

describe("MicFFT", () => {
  it("renders visualization with empty FFT data", () => {
    render(<MicFFT fft={[]} />);

    // Check that the SVG with title exists
    expect(screen.getByTitle("Audio Frequency Visualization")).toBeInTheDocument();

    // Should render 24 bars even with empty data
    const svg = screen.getByTitle("Audio Frequency Visualization").parentElement;
    expect(svg?.querySelectorAll("rect").length).toBe(24);
  });

  it("renders visualization with FFT data", () => {
    const mockFFT = Array(24)
      .fill(0)
      .map((_, i) => i / 10);
    render(<MicFFT fft={mockFFT} />);

    // Check that the SVG with title exists
    expect(screen.getByTitle("Audio Frequency Visualization")).toBeInTheDocument();

    // Should render 24 bars
    const svg = screen.getByTitle("Audio Frequency Visualization").parentElement;
    expect(svg?.querySelectorAll("rect").length).toBe(24);
  });

  it("applies custom className", () => {
    render(<MicFFT fft={[]} className="test-class" />);

    const svg = screen.getByTitle("Audio Frequency Visualization").parentElement;
    expect(svg).toHaveClass("test-class");
  });
});
