import { useVoice } from "@humeai/voice-react";
import { useQueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimerHume } from "./timer-hume";

// Mock dependencies
vi.mock("@humeai/voice-react", () => ({
  useVoice: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useQueryClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/lib/data/repositoryFactory", () => ({
  getRepository: vi.fn().mockResolvedValue({
    update: vi.fn().mockResolvedValue({}),
  }),
}));

describe("TimerHume", () => {
  const mockSetInterviewEnded = vi.fn();
  const mockVoice = {
    disconnect: vi.fn(),
    status: { value: "connected" },
    callDurationTimestamp: "00:00",
    sendUserInput: vi.fn(),
    sendAssistantInput: vi.fn(),
    messages: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mark document as being in test environment
    document.documentElement.setAttribute("data-vitest", "true");

    (useVoice as any).mockReturnValue(mockVoice);
    (useQueryClient as any).mockReturnValue({
      invalidateQueries: vi.fn(),
    });
    (useParams as any).mockReturnValue({
      interviewId: "123",
    });
  });

  it("renders correctly with connected status", () => {
    render(<TimerHume totalTime={900} setInterviewEnded={mockSetInterviewEnded} />);

    // Should render the status indicator in connected state
    expect(screen.getByText("Live")).toBeInTheDocument();

    // Should initialize with the time display
    expect(screen.getByText("Time Left")).toBeInTheDocument();
  });

  it("renders correctly with disconnected status", () => {
    (useVoice as any).mockReturnValue({
      ...mockVoice,
      status: { value: "disconnected" },
    });

    render(<TimerHume totalTime={900} setInterviewEnded={mockSetInterviewEnded} />);

    // Should render the status indicator in disconnected state
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
