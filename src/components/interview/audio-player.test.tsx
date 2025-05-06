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
    const playButton = screen.getByLabelText(/play audio/i);
    expect(playButton).not.toBeDisabled();
  });

  it("is grayed out and disabled when disabled=true", () => {
    render(<AudioPlayer audioUrl="test.mp3" disabled />);
    const player = screen.getByLabelText(/audio player/i);
    expect(player).toHaveClass("opacity-50");
    const playButton = screen.getByLabelText(/play audio/i);
    expect(playButton).toBeDisabled();
  });

  it("toggles play/pause when play/pause button is clicked", () => {
    render(<AudioPlayer audioUrl="test.mp3" />);
    const playButton = screen.getByLabelText(/play audio/i);
    fireEvent.click(playButton);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();

    // Now it should show pause button with different aria-label
    const pauseButton = screen.getByLabelText(/pause audio/i);
    fireEvent.click(pauseButton);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
