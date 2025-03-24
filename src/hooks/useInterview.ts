import { useQuery } from "@tanstack/react-query";

interface CandidateDetails {
  name: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  professionalSummary: string;
  linkedinUrl: string;
  portfolioUrl: string;
  otherUrls: string[];
}

interface JobDescription {
  company: string;
  role: string;
  requiredQualifications: string[];
  requiredExperience: string[];
  requiredSkills: string[];
  preferredQualifications: string[];
  preferredSkills: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  employmentType: string;
  seniority: string;
  industry: string;
  keyTechnologies: string[];
  keywords: string[];
  keyQuestions: string[];
}

interface Interview {
  id: number;
  userId: number;
  submittedCVText: string;
  jobDescriptionText: string;
  additionalInfo: string | null;
  transcript: string | null;
  duration: number;
  actualTime: number | null;
  type:
    | "behavioral"
    | "situational"
    | "technical"
    | "case_study"
    | "competency_based"
    | "stress"
    | "cultural_fit";
  candidate: string | null;
  company: string | null;
  role: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  candidateDetails: CandidateDetails;
  jobDescription: JobDescription;
}

export function useInterview(interviewId: string) {
  return useQuery({
    queryKey: ["interview", interviewId],
    queryFn: async () => {
      const response = await fetch(`/api/interviews/${interviewId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch interview details");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.data as Interview;
    },
  });
}
