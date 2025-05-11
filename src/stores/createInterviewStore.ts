import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type InterviewType =
  | "behavioral"
  | "technical"
  | "case_study"
  | "competency_based"
  | "stress"
  | "cultural_fit";

interface CreateInterviewState {
  step: number;
  cvText: string;
  jobDescriptionText: string;
  duration: number;
  interviewType: InterviewType;
  additionalInfo: string;
  showTakeover: boolean;
  isAlertDialogOpen: boolean;
  isOutOfMinutesDialogOpen: boolean;
  isScheduleErrorDialogOpen: boolean;
}

interface CreateInterviewActions {
  setStep: (step: number) => void;
  setCVText: (text: string) => void;
  setJobDescriptionText: (text: string) => void;
  setDuration: (duration: number) => void;
  setInterviewType: (type: InterviewType) => void;
  setAdditionalInfo: (text: string) => void;
  setShowTakeover: (show: boolean) => void;
  setIsAlertDialogOpen: (isOpen: boolean) => void;
  setIsOutOfMinutesDialogOpen: (isOpen: boolean) => void;
  setIsScheduleErrorDialogOpen: (isOpen: boolean) => void;
  resetStore: () => void;
}

const initialState: CreateInterviewState = {
  step: 1,
  cvText: "",
  jobDescriptionText: "",
  additionalInfo: "",
  duration: 15,
  interviewType: "behavioral",
  showTakeover: false,
  isAlertDialogOpen: false,
  isOutOfMinutesDialogOpen: false,
  isScheduleErrorDialogOpen: false,
};

export const useCreateInterviewStore = create(
  devtools<CreateInterviewState & { actions: CreateInterviewActions }>((set) => ({
    ...initialState,
    actions: {
      setStep: (step: number) => set({ step }),
      setCVText: (cvText: string) => set({ cvText }),
      setJobDescriptionText: (jobDescriptionText: string) => set({ jobDescriptionText }),
      setAdditionalInfo: (additionalInfo: string) => set({ additionalInfo }),
      setDuration: (duration: number) => set({ duration }),
      setInterviewType: (interviewType: InterviewType) => set({ interviewType }),
      setShowTakeover: (showTakeover: boolean) => set({ showTakeover }),
      setIsAlertDialogOpen: (isAlertDialogOpen: boolean) => set({ isAlertDialogOpen }),
      setIsOutOfMinutesDialogOpen: (isOutOfMinutesDialogOpen: boolean) =>
        set({ isOutOfMinutesDialogOpen }),
      setIsScheduleErrorDialogOpen: (isScheduleErrorDialogOpen: boolean) =>
        set({ isScheduleErrorDialogOpen }),
      resetStore: () => set(initialState),
    },
  }))
);

export const useCreateInterviewStep = () => useCreateInterviewStore((state) => state.step);
export const useCreateInterviewCVText = () => useCreateInterviewStore((state) => state.cvText);
export const useCreateInterviewJobDescriptionText = () =>
  useCreateInterviewStore((state) => state.jobDescriptionText);
export const useCreateInterviewAdditionalInfo = () =>
  useCreateInterviewStore((state) => state.additionalInfo);
export const useCreateInterviewInterviewType = () =>
  useCreateInterviewStore((state) => state.interviewType);
export const useCreateInterviewDuration = () => useCreateInterviewStore((state) => state.duration);
export const useCreateInterviewShowTakeover = () =>
  useCreateInterviewStore((state) => state.showTakeover);
export const useCreateInterviewIsAlertDialogOpen = () =>
  useCreateInterviewStore((state) => state.isAlertDialogOpen);
export const useCreateInterviewIsOutOfMinutesDialogOpen = () =>
  useCreateInterviewStore((state) => state.isOutOfMinutesDialogOpen);
export const useCreateInterviewIsScheduleErrorDialogOpen = () =>
  useCreateInterviewStore((state) => state.isScheduleErrorDialogOpen);
export const useCreateInterviewActions = () => useCreateInterviewStore((state) => state.actions);
