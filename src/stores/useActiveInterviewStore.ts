import { unformatTime } from "@/lib/utils/unformatTime";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Chat } from "~/db/schema";

interface Message {
  role: string;
  content: string;
}

interface ActiveInterviewState {
  callDurationTimestamp: string | null;
  totalTime: number;
  wrapUpSent: boolean;
  interviewEnded: boolean;
  interviewStarted: boolean;
  messages: Message[];
  activeInterviewChat: Chat | null;
  showTakeover: boolean;
}

interface ActiveInterviewActions {
  setCallDurationTimestamp: (timestamp: string | null) => void;
  setTotalTime: (time: number) => void;
  setInterviewEnded: (ended: boolean) => void;
  setInterviewStarted: (started: boolean) => void;
  markWrapUpSent: () => void;
  setMessages: (messages: Message[]) => void;
  setActiveInterviewChat: (chat: Chat | null) => void;
  resetState: () => void;
  setShowTakeover: (showTakeover: boolean) => void;
}

const initialState: ActiveInterviewState = {
  callDurationTimestamp: null,
  totalTime: 0,
  interviewStarted: false,
  wrapUpSent: false,
  interviewEnded: false,
  messages: [],
  activeInterviewChat: null,
  showTakeover: false,
};

export const useActiveInterviewStore = create(
  devtools<ActiveInterviewState & { actions: ActiveInterviewActions }>((set, get) => ({
    ...initialState,
    actions: {
      setCallDurationTimestamp: (timestamp: string | null) =>
        set((state) => ({
          callDurationTimestamp: timestamp,
          remainingTime: Math.max(0, state.totalTime - unformatTime(timestamp)),
        })),
      setTotalTime: (totalTime: number) => set({ totalTime }),
      setInterviewEnded: (interviewEnded: boolean) => set({ interviewEnded }),
      setShowTakeover: (showTakeover: boolean) => set({ showTakeover }),
      setActiveInterviewChat: (chat: Chat | null) => set({ activeInterviewChat: chat }),
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
export const useActiveInterviewChat = () =>
  useActiveInterviewStore((state) => state.activeInterviewChat);
export const useActiveInterviewMessages = () => useActiveInterviewStore((state) => state.messages);
export const useActiveInterviewStarted = () =>
  useActiveInterviewStore((state) => state.interviewStarted);
export const useActiveInterviewShowTakeover = () =>
  useActiveInterviewStore((state) => state.showTakeover);
export const useActiveInterviewActions = () => useActiveInterviewStore((state) => state.actions);
