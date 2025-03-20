import { unformatTime } from "@/lib/utils/unformatTime";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Message {
  role: string;
  content: string;
}

interface ActiveInterviewState {
  callDurationTimestamp: string | null;
  totalTime: number;
  remainingTime: number;
  wrapUpSent: boolean;
  interviewEnded: boolean;
  isConnected: boolean;
  messages: Message[];
}

interface ActiveInterviewActions {
  setCallDurationTimestamp: (timestamp: string | null) => void;
  setTotalTime: (time: number) => void;
  setInterviewEnded: (ended: boolean) => void;
  setConnectionStatus: (connected: boolean) => void;
  markWrapUpSent: () => void;
  setMessages: (messages: Message[]) => void;
  resetState: () => void;
}

const initialState: ActiveInterviewState = {
  callDurationTimestamp: null,
  totalTime: 0,
  remainingTime: 0,
  wrapUpSent: false,
  interviewEnded: false,
  isConnected: false,
  messages: [],
};

export const useActiveInterviewStore = create(
  devtools<ActiveInterviewState & { actions: ActiveInterviewActions }>((set, get) => ({
    ...initialState,
    actions: {
      setCallDurationTimestamp: (timestamp: string | null) =>
        set((state) => ({
          callDurationTimestamp: timestamp,
          remainingTime: timestamp
            ? Math.max(0, state.totalTime - unformatTime(timestamp))
            : state.remainingTime,
        })),
      setTotalTime: (totalTime: number) => set({ totalTime }),
      setInterviewEnded: (interviewEnded: boolean) => set({ interviewEnded }),
      setConnectionStatus: (isConnected: boolean) => set({ isConnected }),
      markWrapUpSent: () => set({ wrapUpSent: true }),
      setMessages: (messages: Message[]) => set({ messages }),
      resetState: () => set(initialState),
    },
  }))
);

export const useActiveInterviewCallDuration = () =>
  useActiveInterviewStore((state) => state.callDurationTimestamp);
export const useActiveInterviewTotalTime = () =>
  useActiveInterviewStore((state) => state.totalTime);
export const useActiveInterviewRemainingTime = () =>
  useActiveInterviewStore((state) => state.remainingTime);
export const useActiveInterviewWrapUpSent = () =>
  useActiveInterviewStore((state) => state.wrapUpSent);
export const useActiveInterviewEnded = () =>
  useActiveInterviewStore((state) => state.interviewEnded);
export const useActiveInterviewIsConnected = () =>
  useActiveInterviewStore((state) => state.isConnected);
export const useActiveInterviewMessages = () => useActiveInterviewStore((state) => state.messages);
export const useActiveInterviewActions = () => useActiveInterviewStore((state) => state.actions);
