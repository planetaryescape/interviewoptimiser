import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InterviewReportsPage from "./page";

// Mock required components and hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/hooks/useUser", () => ({
  useUser: () => ({
    data: { id: "user-1", minutes: 30 },
  }),
}));

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockImplementation(({ queryKey }) => {
    if (queryKey[0] === "interview-reports") {
      return {
        data: {
          data: [
            {
              sys: { id: 1 },
              data: {
                isCompleted: true,
                createdAt: "2023-01-01",
                overallScore: 85,
                technicalKnowledgeScore: 80,
                communicationSkillsScore: 90,
                problemSolvingSkillsScore: 85,
                teamworkScore: 85,
                technicalKnowledge: "Good technical knowledge",
                communicationSkills: "Excellent communication",
                problemSolvingSkills: "Strong problem solving",
                teamwork: "Good teamwork skills",
                transcript: "[]",
              },
            },
          ],
        },
        isLoading: false,
        error: null,
      };
    }

    if (queryKey[0] === "interview") {
      return {
        data: {
          data: {
            role: "Software Engineer",
            company: "Test Company",
            type: "technical",
            duration: 30,
            createdAt: "2023-01-01",
          },
        },
        isLoading: false,
        error: null,
      };
    }

    return {
      data: null,
      isLoading: false,
      error: null,
    };
  }),
}));

vi.mock("@/components/ui/particle-swarm-loader", () => ({
  ParticleSwarmLoader: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock("@/components/report-card", () => ({
  ReportCard: ({ report, interviewId }: { report: any; interviewId: string }) => (
    <div data-testid="report-card">
      <div>Score: {report.data.overallScore}%</div>
      <div>Date: {new Date(report.data.createdAt).toLocaleDateString()}</div>
      <div>Interview ID: {interviewId}</div>
    </div>
  ),
}));

vi.mock("@/components/create-optimization/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="confirmation-modal" className={isOpen ? "visible" : "hidden"}>
      Confirmation Modal
    </div>
  ),
}));

vi.mock("@/components/create-optimization/OutOfMinutesModal", () => ({
  OutOfMinutesModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="out-of-minutes-modal" className={isOpen ? "visible" : "hidden"}>
      Out of Minutes Modal
    </div>
  ),
}));

vi.mock("@radix-ui/react-tabs", async () => {
  const actual = await vi.importActual("@radix-ui/react-tabs");
  return {
    ...actual,
    Root: ({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) => (
      <div data-testid="tabs-root" data-default-value={defaultValue}>
        {children}
      </div>
    ),
    List: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="tabs-list">{children}</div>
    ),
    Trigger: ({
      children,
      value,
      className,
    }: {
      children: React.ReactNode;
      value: string;
      className?: string;
    }) => (
      <button type="button" data-testid={`tab-${value}`} data-value={value} className={className}>
        {children}
      </button>
    ),
    Content: ({
      children,
      value,
      className,
    }: {
      children: React.ReactNode;
      value: string;
      className?: string;
    }) => (
      <div data-testid={`tab-content-${value}`} data-value={value} className={className}>
        {children}
      </div>
    ),
  };
});

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: (props: any) => <div data-testid={`chart-line-${props.dataKey}`} />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock the use function from React
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: (promise: Promise<any>) => {
      // Return a mock interviewId for testing
      return { interviewId: "test-interview-id" };
    },
  };
});

describe("InterviewReportsPage", () => {
  it("renders the page header with interview information", async () => {
    render(<InterviewReportsPage params={Promise.resolve({ interviewId: "test-id" })} />);

    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText(/at Test Company/)).toBeInTheDocument();
      expect(screen.getByText(/1 report/)).toBeInTheDocument();
      expect(screen.getByText(/Technical Interview/i)).toBeInTheDocument();
    });
  });

  it("displays the reports tab by default", async () => {
    render(<InterviewReportsPage params={Promise.resolve({ interviewId: "test-id" })} />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs-root")).toHaveAttribute("data-default-value", "reports");
      expect(screen.getByTestId("report-card")).toBeInTheDocument();
    });
  });

  it("displays the report card with correct information", async () => {
    render(<InterviewReportsPage params={Promise.resolve({ interviewId: "test-id" })} />);

    await waitFor(() => {
      const reportCard = screen.getByTestId("report-card");
      expect(reportCard).toHaveTextContent("Score: 85%");
      expect(reportCard).toHaveTextContent("Date: 1/1/2023");
      expect(reportCard).toHaveTextContent("Interview ID: test-interview-id");
    });
  });

  it("has analytics tab with charts", async () => {
    render(<InterviewReportsPage params={Promise.resolve({ interviewId: "test-id" })} />);

    await waitFor(() => {
      expect(screen.getByTestId("tab-analytics")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    // Check that the analytics content is in the document
    expect(screen.getByTestId("tab-content-analytics")).toBeInTheDocument();
    expect(screen.getByText("Skills Progress")).toBeInTheDocument();
    expect(screen.getByText("Prosody Trends")).toBeInTheDocument();
  });
});
