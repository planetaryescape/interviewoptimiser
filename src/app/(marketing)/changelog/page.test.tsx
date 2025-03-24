import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChangelogPage from "./page";

// Mock required components and hooks
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: { id: "user-1" },
    isLoaded: true,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      data: [
        {
          sys: { id: 1 },
          data: {
            title: "Test Changelog",
            date: "2023-01-01",
            content: "This is a test changelog entry",
            likes: 5,
          },
        },
      ],
    },
    isLoading: false,
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@/lib/data/repositoryFactory", () => ({
  getRepository: () => ({
    getAll: vi.fn().mockResolvedValue({
      data: [
        {
          sys: { id: 1 },
          data: {
            title: "Test Changelog",
            date: "2023-01-01",
            content: "This is a test changelog entry",
            likes: 5,
          },
        },
      ],
    }),
    update: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock("@/components/ui/particle-swarm-loader", () => ({
  ParticleSwarmLoader: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock("remark-gfm", () => ({
  default: vi.fn(),
}));

describe("ChangelogPage", () => {
  it("renders the changelog page with title and header", async () => {
    render(<ChangelogPage />);

    await waitFor(() => {
      expect(screen.getByText("Changelog")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Track our product updates and improvements as we build a better experience for you."
        )
      ).toBeInTheDocument();
    });
  });

  it("renders changelog entries with correct information", async () => {
    render(<ChangelogPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Changelog")).toBeInTheDocument();
      expect(screen.getByTestId("markdown")).toHaveTextContent("This is a test changelog entry");
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("displays the date in the correct format", async () => {
    render(<ChangelogPage />);

    await waitFor(() => {
      // Check for the formatted date (January 1, 2023)
      expect(screen.getByText("January 1, 2023")).toBeInTheDocument();
    });
  });

  it("renders like button when user is logged in", async () => {
    render(<ChangelogPage />);

    await waitFor(() => {
      expect(screen.getByText("Like")).toBeInTheDocument();
    });
  });
});
