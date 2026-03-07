import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type InterviewType =
  | "behavioral"
  | "technical"
  | "case_study"
  | "competency_based"
  | "stress"
  | "cultural_fit";

interface CreateJobState {
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
  errorMessage?: string;
  saveAsDefault: boolean;
  cvFilename: string | null;
}

interface CreateJobActions {
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
  setErrorMessage: (message?: string) => void;
  setSaveAsDefault: (save: boolean) => void;
  setCvFilename: (filename: string | null) => void;
  resetStore: () => void;
}

const initialState: CreateJobState = {
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
  errorMessage: undefined,
  saveAsDefault: false,
  cvFilename: null,
};

export const useCreateJobStore = create(
  devtools<CreateJobState & { actions: CreateJobActions }>((set) => ({
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
      setErrorMessage: (errorMessage?: string) => set({ errorMessage }),
      setSaveAsDefault: (saveAsDefault: boolean) => set({ saveAsDefault }),
      setCvFilename: (cvFilename: string | null) => set({ cvFilename }),
      resetStore: () => set(initialState),
    },
  }))
);

export const useCreateJobStep = () => useCreateJobStore((state) => state.step);
export const useCreateJobCVText = () => useCreateJobStore((state) => state.cvText);
export const useCreateJobJobDescriptionText = () =>
  useCreateJobStore((state) => state.jobDescriptionText);
export const useCreateJobAdditionalInfo = () => useCreateJobStore((state) => state.additionalInfo);
export const useCreateJobInterviewType = () => useCreateJobStore((state) => state.interviewType);
export const useCreateJobDuration = () => useCreateJobStore((state) => state.duration);
export const useCreateJobShowTakeover = () => useCreateJobStore((state) => state.showTakeover);
export const useCreateJobIsAlertDialogOpen = () =>
  useCreateJobStore((state) => state.isAlertDialogOpen);
export const useCreateJobIsOutOfMinutesDialogOpen = () =>
  useCreateJobStore((state) => state.isOutOfMinutesDialogOpen);
export const useCreateJobIsScheduleErrorDialogOpen = () =>
  useCreateJobStore((state) => state.isScheduleErrorDialogOpen);
export const useCreateJobErrorMessage = () => useCreateJobStore((state) => state.errorMessage);
export const useCreateJobSaveAsDefault = () => useCreateJobStore((state) => state.saveAsDefault);
export const useCreateJobCvFilename = () => useCreateJobStore((state) => state.cvFilename);
export const useCreateJobActions = () => useCreateJobStore((state) => state.actions);
