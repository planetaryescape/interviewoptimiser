"use client";

import { createInterviewInstructions } from "@/utils/conversation_config";
import { useMemo } from "react";
import { useJob } from "./useJob";

export default function useCustomisedSystemPrompt({
  jobId,
}: {
  jobId: string;
}) {
  const { data: job } = useJob(jobId);

  const systemPrompt = useMemo(() => {
    return createInterviewInstructions({
      cvText: job?.data?.submittedCVText ?? "",
      structuredCandidateDetails: {
        ...job?.data?.candidateDetails,
        location: job?.data?.candidateDetails?.location ?? "",
        name: job?.data?.candidateDetails?.name ?? "",
        email: job?.data?.candidateDetails?.email ?? "",
        phone: job?.data?.candidateDetails?.phone ?? "",
        currentRole: job?.data?.candidateDetails?.currentRole ?? "",
        professionalSummary: job?.data?.candidateDetails?.professionalSummary ?? "",
        linkedinUrl: job?.data?.candidateDetails?.linkedinUrl ?? "",
        portfolioUrl: job?.data?.candidateDetails?.portfolioUrl ?? "",
        otherUrls: job?.data?.candidateDetails?.otherUrls ?? [],
      },
      structuredJobDescription: {
        ...job?.data?.jobDescription,
        role: job?.data?.jobDescription?.role ?? "",
        seniority: job?.data?.jobDescription?.seniority ?? "",
        company: job?.data?.jobDescription?.company ?? "",
        employmentType: job?.data?.jobDescription?.employmentType ?? "",
        location: job?.data?.jobDescription?.location ?? "",
        industry: job?.data?.jobDescription?.industry ?? "",
        requiredQualifications: job?.data?.jobDescription?.requiredQualifications ?? [],
        requiredExperience: job?.data?.jobDescription?.requiredExperience ?? [],
        requiredSkills: job?.data?.jobDescription?.requiredSkills ?? [],
        preferredQualifications: job?.data?.jobDescription?.preferredQualifications ?? [],
        preferredSkills: job?.data?.jobDescription?.preferredSkills ?? [],
        responsibilities: job?.data?.jobDescription?.responsibilities ?? [],
        benefits: job?.data?.jobDescription?.benefits ?? [],
        keyTechnologies: job?.data?.jobDescription?.keyTechnologies ?? [],
        keywords: job?.data?.jobDescription?.keywords ?? [],
        keyQuestions: job?.data?.jobDescription?.keyQuestions ?? [],
      },
      duration: job?.data?.duration ?? 15,
      interviewType: job?.data?.type ?? "behavioral",
    });
  }, [job]);

  return { systemPrompt, job };
}
