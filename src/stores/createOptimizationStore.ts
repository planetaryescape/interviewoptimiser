import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CreateOptimizationState {
  step: number;
  cvText: string;
  jobDescriptionText: string;
  additionalInfo: string;
  showTakeover: boolean;
  isAlertDialogOpen: boolean;
  isOutOfCreditsDialogOpen: boolean;
  isScheduleErrorDialogOpen: boolean;
}

interface CreateOptimizationActions {
  setStep: (step: number) => void;
  setCVText: (text: string) => void;
  setJobDescriptionText: (text: string) => void;
  setAdditionalInfo: (text: string) => void;
  setShowTakeover: (show: boolean) => void;
  setIsAlertDialogOpen: (isOpen: boolean) => void;
  setIsOutOfCreditsDialogOpen: (isOpen: boolean) => void;
  setIsScheduleErrorDialogOpen: (isOpen: boolean) => void;
  resetStore: () => void;
}

const initialState: CreateOptimizationState = {
  step: 1,
  cvText: "",
  jobDescriptionText: "",
  additionalInfo: "",
  showTakeover: false,
  isAlertDialogOpen: false,
  isOutOfCreditsDialogOpen: false,
  isScheduleErrorDialogOpen: false,
};

export const useCreateOptimizationStore = create(
  devtools<CreateOptimizationState & { actions: CreateOptimizationActions }>(
    (set) => ({
      ...initialState,
      actions: {
        setStep: (step: number) => set({ step }),
        setCVText: (cvText: string) => set({ cvText }),
        setJobDescriptionText: (jobDescriptionText: string) =>
          set({ jobDescriptionText }),
        setAdditionalInfo: (additionalInfo: string) => set({ additionalInfo }),
        setShowTakeover: (showTakeover: boolean) => set({ showTakeover }),
        setIsAlertDialogOpen: (isAlertDialogOpen: boolean) =>
          set({ isAlertDialogOpen }),
        setIsOutOfCreditsDialogOpen: (isOutOfCreditsDialogOpen: boolean) =>
          set({ isOutOfCreditsDialogOpen }),
        setIsScheduleErrorDialogOpen: (isScheduleErrorDialogOpen: boolean) =>
          set({ isScheduleErrorDialogOpen }),
        resetStore: () => set(initialState),
      },
    })
  )
);

export const useCreateOptimizationStep = () =>
  useCreateOptimizationStore((state) => state.step);
export const useCreateOptimizationCVText = () =>
  useCreateOptimizationStore((state) => state.cvText);
export const useCreateOptimizationJobDescriptionText = () =>
  useCreateOptimizationStore((state) => state.jobDescriptionText);
export const useCreateOptimizationAdditionalInfo = () =>
  useCreateOptimizationStore((state) => state.additionalInfo);
export const useCreateOptimizationShowTakeover = () =>
  useCreateOptimizationStore((state) => state.showTakeover);
export const useCreateOptimizationIsAlertDialogOpen = () =>
  useCreateOptimizationStore((state) => state.isAlertDialogOpen);
export const useCreateOptimizationIsOutOfCreditsDialogOpen = () =>
  useCreateOptimizationStore((state) => state.isOutOfCreditsDialogOpen);
export const useCreateOptimizationIsScheduleErrorDialogOpen = () =>
  useCreateOptimizationStore((state) => state.isScheduleErrorDialogOpen);
export const useCreateOptimizationActions = () =>
  useCreateOptimizationStore((state) => state.actions);
