import { beforeEach, describe, expect, it, vi } from "vitest";
import { useActiveInterviewStore } from "./useActiveInterviewStore";

// Mock the unformatTime function
vi.mock("@/lib/utils/unformatTime", () => ({
  unformatTime: vi.fn((time: string) => {
    // Mock implementation of unformatTime for tests
    if (time === "02:00") return 120; // 2 minutes = 120 seconds
    return 0;
  }),
}));

describe("useActiveInterviewStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useActiveInterviewStore.setState({
      callDurationTimestamp: null,
      totalTime: 0,
      wrapUpSent: false,
      interviewEnded: false,
      messages: [],
      actions: useActiveInterviewStore.getState().actions,
    });
  });

  it("should initialize with default values", () => {
    const state = useActiveInterviewStore.getState();
    expect(state.callDurationTimestamp).toBeNull();
    expect(state.totalTime).toBe(0);
    expect(state.wrapUpSent).toBe(false);
    expect(state.interviewEnded).toBe(false);
    expect(state.messages).toEqual([]);
  });

  it("should update totalTime with setTotalTime action", () => {
    const { actions } = useActiveInterviewStore.getState();
    actions.setTotalTime(900);

    const state = useActiveInterviewStore.getState();
    expect(state.totalTime).toBe(900);
  });

  it("should update callDurationTimestamp and calculate remainingTime", () => {
    const { actions } = useActiveInterviewStore.getState();

    // Set total time to 10 minutes (600 seconds)
    actions.setTotalTime(600);

    // Set current time to 2 minutes (02:00)
    actions.setCallDurationTimestamp("02:00");

    const state = useActiveInterviewStore.getState();
    expect(state.callDurationTimestamp).toBe("02:00");
    expect(state.remainingTime).toBe(480); // 600 - 120 = 480 seconds remaining
  });

  it("should handle null timestamp without causing NaN", () => {
    const { actions } = useActiveInterviewStore.getState();

    // Set total time to 10 minutes (600 seconds)
    actions.setTotalTime(600);

    // Set timestamp to null
    actions.setCallDurationTimestamp(null);

    const state = useActiveInterviewStore.getState();
    expect(state.callDurationTimestamp).toBeNull();
    expect(state.remainingTime).toBe(600); // Should keep total time when timestamp is null
    expect(Number.isNaN(state.remainingTime)).toBe(false);
  });

  it("should mark wrap-up sent", () => {
    const { actions } = useActiveInterviewStore.getState();
    actions.markWrapUpSent();

    const state = useActiveInterviewStore.getState();
    expect(state.wrapUpSent).toBe(true);
  });

  it("should set interview ended status", () => {
    const { actions } = useActiveInterviewStore.getState();
    actions.setInterviewEnded(true);

    const state = useActiveInterviewStore.getState();
    expect(state.interviewEnded).toBe(true);
  });

  it("should reset state", () => {
    const { actions } = useActiveInterviewStore.getState();

    // Set some values
    actions.setTotalTime(900);
    actions.setCallDurationTimestamp("02:00");
    actions.markWrapUpSent();
    actions.setInterviewEnded(true);

    // Reset the state
    actions.resetState();

    // Verify reset values
    const state = useActiveInterviewStore.getState();
    expect(state.callDurationTimestamp).toBeNull();
    expect(state.totalTime).toBe(0);
    expect(state.wrapUpSent).toBe(false);
    expect(state.interviewEnded).toBe(false);
    expect(state.messages).toEqual([]);
  });
});
