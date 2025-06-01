import { interviewTypes as allInterviewTypeDefinitions } from "@/fixtures/interview-types";
import { create } from "zustand";
import type { InterviewType } from "~/db/schema/interviews";

// Helper to generate simple unique IDs for questions
const generateId = () => Math.random().toString(36).slice(2, 11);

export interface QuestionItem {
  // This is what the UI components expect
  id: string;
  text: string;
  isGenerated: boolean;
  reasoning?: string; // Added to match API and allow storing it if needed
}

// This type comes from the API route
export type ApiGeneratedQuestion = {
  id: string;
  text: string;
  isGenerated: boolean;
  reasoning?: string;
};

interface RecruitmentCreateState {
  currentStep: number;
  jobDescriptionText: string;
  interviewType: InterviewType;
  duration: number; // in minutes
  questions: QuestionItem[];
  isGeneratingQuestions: boolean;
  generationError: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  setJobDescriptionText: (text: string) => void;
  setInterviewType: (type: InterviewType) => void;
  setDuration: (duration: number) => void;

  // Question actions
  loadGeneratedQuestions: (generatedQuestions: ApiGeneratedQuestion[]) => void;
  addCustomQuestion: (text: string) => void;
  updateQuestionText: (id: string, newText: string) => void;
  removeQuestion: (id: string) => void;
  setQuestions: (questions: QuestionItem[]) => void; // For reordering or wholesale replacement

  setIsGeneratingQuestions: (loading: boolean) => void;
  setGenerationError: (error: string | null) => void;
  resetStore: () => void;
}

const defaultInterviewTypeDefinition =
  allInterviewTypeDefinitions.find((it) => it.type === "behavioral") ||
  allInterviewTypeDefinitions[0];
const defaultInterviewType =
  (defaultInterviewTypeDefinition?.type as InterviewType) || "behavioral";
const defaultDuration = 15; // Matches schema default for interviews.duration

const initialState = {
  currentStep: 1,
  jobDescriptionText: "",
  interviewType: defaultInterviewType,
  duration: defaultDuration,
  questions: [],
  isGeneratingQuestions: false,
  generationError: null,
};

export const useRecruitmentCreateStore = create<RecruitmentCreateState>((set) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  setJobDescriptionText: (text) => set({ jobDescriptionText: text }),
  setInterviewType: (type) => set({ interviewType: type }),
  setDuration: (duration) => set({ duration }),

  loadGeneratedQuestions: (generatedQuestions) =>
    set({
      questions: generatedQuestions.map((q) => ({ ...q })),
      generationError: null,
    }),
  addCustomQuestion: (text) =>
    set((state) => ({
      questions: [...state.questions, { id: generateId(), text, isGenerated: false }],
    })),
  updateQuestionText: (id, newText) =>
    set((state) => ({
      questions: state.questions.map((q) => (q.id === id ? { ...q, text: newText } : q)),
    })),
  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    })),
  setQuestions: (questions) => set({ questions }),

  setIsGeneratingQuestions: (loading) => set({ isGeneratingQuestions: loading }),
  setGenerationError: (error) => set({ generationError: error }),
  resetStore: () => set(initialState),
}));
