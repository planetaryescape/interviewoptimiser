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
      remainingTime: 0,
      wrapUpSent: false,
      interviewEnded: false,
      isConnected: false,
      messages: [],
      actions: useActiveInterviewStore.getState().actions,
    });
  });

  it("should initialize with default values", () => {
    const state = useActiveInterviewStore.getState();
    expect(state.callDurationTimestamp).toBeNull();
    expect(state.totalTime).toBe(0);
    expect(state.remainingTime).toBe(0);
    expect(state.wrapUpSent).toBe(false);
    expect(state.interviewEnded).toBe(false);
    expect(state.isConnected).toBe(false);
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
    // 120 seconds elapsed, 480 seconds remaining
    expect(state.remainingTime).toBe(480);
  });

  it("should update connection status", () => {
    const { actions } = useActiveInterviewStore.getState();
    actions.setConnectionStatus(true);

    const state = useActiveInterviewStore.getState();
    expect(state.isConnected).toBe(true);
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
    actions.setConnectionStatus(true);
    actions.markWrapUpSent();
    actions.setInterviewEnded(true);

    // Reset the state
    actions.resetState();

    // Verify reset values
    const state = useActiveInterviewStore.getState();
    expect(state.callDurationTimestamp).toBeNull();
    expect(state.totalTime).toBe(0);
    expect(state.remainingTime).toBe(0);
    expect(state.wrapUpSent).toBe(false);
    expect(state.interviewEnded).toBe(false);
    expect(state.isConnected).toBe(false);
    expect(state.messages).toEqual([]);
  });
});
