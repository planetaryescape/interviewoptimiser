import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import InterviewPlaceholder from "./messages-placeholder";

// Mock the hooks
vi.mock("@humeai/voice-react", () => ({
  useVoice: () => ({
    connect: vi.fn(),
    status: { value: "disconnected" },
  }),
}));

vi.mock("@/stores/useActiveInterviewStore", () => ({
  useActiveInterviewEnded: () => false,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ interviewId: "123" }),
}));

const mockInterview = {
  id: 1,
  userId: 1,
  submittedCVText: "Mock CV",
  jobDescriptionText: "Mock Job Description",
  additionalInfo: null,
  transcript: null,
  duration: 15,
  actualTime: null,
  type: "behavioral",
  candidate: null,
  company: null,
  role: null,
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  candidateDetails: {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    location: "London",
    currentRole: "Software Engineer",
    professionalSummary: "Experienced developer",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    portfolioUrl: "https://johndoe.com",
    otherUrls: [],
  },
  jobDescription: {
    company: "Acme Inc",
    role: "Senior Software Engineer",
    requiredQualifications: ["Bachelor's in CS"],
    requiredExperience: ["5+ years"],
    requiredSkills: ["JavaScript", "TypeScript"],
    preferredQualifications: [],
    preferredSkills: [],
    responsibilities: ["Build features"],
    benefits: ["Health insurance"],
    location: "London",
    employmentType: "Full-time",
    seniority: "Senior",
    industry: "Technology",
    keyTechnologies: ["React", "Node.js"],
    keywords: ["frontend", "backend"],
    keyQuestions: ["Tell me about yourself"],
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("InterviewPlaceholder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should show loading state initially", () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<InterviewPlaceholder setInterviewStarted={() => {}} />);

    expect(screen.getByText("Loading interview details...")).toBeInTheDocument();
  });

  it("should display interview details when loaded", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockInterview }),
    });

    renderWithProviders(<InterviewPlaceholder setInterviewStarted={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Hello John Doe!")).toBeInTheDocument();
    });

    expect(screen.getByText(/15 minute behavioral interview/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior Software Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Inc/i)).toBeInTheDocument();
  });

  it("should show error state when fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Failed to load" }),
    });

    renderWithProviders(<InterviewPlaceholder setInterviewStarted={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load interview details")).toBeInTheDocument();
    });
  });

  it("should handle start interview button click", async () => {
    const mockSetInterviewStarted = vi.fn();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockInterview }),
    });

    renderWithProviders(<InterviewPlaceholder setInterviewStarted={mockSetInterviewStarted} />);

    await waitFor(() => {
      expect(screen.getByText("Hello John Doe!")).toBeInTheDocument();
    });

    const startButton = screen.getByText("Start Interview");
    await userEvent.click(startButton);

    // Modal should be shown
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Click start in modal
    const modalStartButton = screen.getByText("Begin Interview");
    await userEvent.click(modalStartButton);

    expect(mockSetInterviewStarted).toHaveBeenCalledWith(true);
  });
});
