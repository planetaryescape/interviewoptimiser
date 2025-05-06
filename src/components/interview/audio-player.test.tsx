import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "./audio-player";

// Mock play and pause methods on HTMLMediaElement
beforeEach(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("AudioPlayer", () => {
  it("does not render if audioUrl is not provided", () => {
    const { container } = render(<AudioPlayer />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders and is enabled when audioUrl is provided", () => {
    render(<AudioPlayer audioUrl="test.mp3" />);
    expect(screen.getByLabelText(/audio player/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("is grayed out and disabled when disabled=true", () => {
    render(<AudioPlayer audioUrl="test.mp3" disabled />);
    const player = screen.getByLabelText(/audio player/i);
    expect(player).toHaveClass("opacity-50");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("toggles play/pause when button is clicked", () => {
    render(<AudioPlayer audioUrl="test.mp3" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    fireEvent.click(button);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
