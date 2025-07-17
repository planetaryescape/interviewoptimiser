import { unformatTime } from "@/lib/utils/unformatTime";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Interview } from "~/db/schema";

interface Message {
  role: string;
  content: string;
}

export type InterviewWithPublicJobId = Omit<Interview, "jobId"> & {
  jobId: string;
};

interface ActiveInterviewState {
  callDurationTimestamp: string | null;
  totalTime: number;
  remainingTime: number;
  wrapUpSent: boolean;
  interviewEnded: boolean;
  interviewStarted: boolean;
  messages: Message[];
  activeInterview: InterviewWithPublicJobId | null;
  showTakeover: boolean;
}

interface ActiveInterviewActions {
  setCallDurationTimestamp: (timestamp: string | null) => void;
  setTotalTime: (time: number) => void;
  setInterviewEnded: (ended: boolean) => void;
  setInterviewStarted: (started: boolean) => void;
  markWrapUpSent: () => void;
  setMessages: (messages: Message[]) => void;
  setActiveInterview: (interview: InterviewWithPublicJobId | null) => void;
  resetState: () => void;
  setShowTakeover: (showTakeover: boolean) => void;
}

const initialState: ActiveInterviewState = {
  callDurationTimestamp: null,
  totalTime: 0,
  remainingTime: 0,
  interviewStarted: false,
  wrapUpSent: false,
  interviewEnded: false,
  messages: [],
  activeInterview: null,
  showTakeover: false,
};

export const useActiveInterviewStore = create(
  devtools<ActiveInterviewState & { actions: ActiveInterviewActions }>((set, get) => ({
    ...initialState,
    actions: {
      setCallDurationTimestamp: (timestamp: string | null) =>
        set((state) => ({
          ...state,
          callDurationTimestamp: timestamp,
          remainingTime: timestamp
            ? Math.max(0, state.totalTime - unformatTime(timestamp))
            : state.totalTime,
        })),
      setTotalTime: (totalTime: number) => set({ totalTime }),
      setInterviewEnded: (interviewEnded: boolean) => set({ interviewEnded }),
      setShowTakeover: (showTakeover: boolean) => set({ showTakeover }),
      setActiveInterview: (interview: InterviewWithPublicJobId | null) =>
        set({ activeInterview: interview }),
      markWrapUpSent: () => set({ wrapUpSent: true }),
      setMessages: (messages: Message[]) => set({ messages }),
      setInterviewStarted: (interviewStarted: boolean) => set({ interviewStarted }),
      resetState: () => set(initialState),
    },
  }))
);

export const useActiveInterviewCallDuration = () =>
  useActiveInterviewStore((state) => state.callDurationTimestamp);
export const useActiveInterviewTotalTime = () =>
  useActiveInterviewStore((state) => state.totalTime);
export const useActiveInterviewWrapUpSent = () =>
  useActiveInterviewStore((state) => state.wrapUpSent);
export const useActiveInterviewEnded = () =>
  useActiveInterviewStore((state) => state.interviewEnded);
export const useActiveInterview = () => useActiveInterviewStore((state) => state.activeInterview);
export const useActiveInterviewRemainingTime = () =>
  useActiveInterviewStore((state) => state.remainingTime);
export const useActiveInterviewMessages = () => useActiveInterviewStore((state) => state.messages);
export const useActiveInterviewStarted = () =>
  useActiveInterviewStore((state) => state.interviewStarted);
export const useActiveInterviewShowTakeover = () =>
  useActiveInterviewStore((state) => state.showTakeover);
export const useActiveInterviewActions = () => useActiveInterviewStore((state) => state.actions);
