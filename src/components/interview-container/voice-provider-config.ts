import type { Entity } from "@/lib/utils/formatEntity";
import { formatInterviewType } from "@/utils/formatters/format-interview-type";
import type { InterviewType } from "~/db/schema/interviews";

export interface InterviewWithJob {
  duration: number;
  actualTime?: number | null;
  type?: InterviewType | null;
  keyQuestions?: string[] | null;
  job: {
    candidateDetails: {
      name: string;
    } | null;
    jobDescription: {
      role: string | null;
      company: string | null;
    } | null;
  };
}

export function createSessionContext(interview: Entity<InterviewWithJob> | undefined | null) {
  if (!interview?.data) return "";
  if (!interview.data.job.candidateDetails) return "";
  if (!interview.data.job.jobDescription) return "";

  const { duration, actualTime, type, job, keyQuestions } = interview.data;
  const interviewDuration = actualTime ? duration - actualTime : duration;
  const interviewType = formatInterviewType(type || "behavioral");
  // Non-null assertions safe here due to checks above
  const candidateName = job.candidateDetails!.name;
  const role = job.jobDescription!.role || "the specified";
  const company = job.jobDescription!.company || "the company";

  const baseContext = `You are an AI interviewer called Cora, the lead interviewer at Interview Optimiser. You are conducting a ${interviewDuration} minute ${interviewType} mock interview with ${candidateName} to help them prepare for a ${role} job at ${company}. Your goal is to ask relevant, insightful questions based on the candidate data and job role information, focusing on ${interviewType} questions.

IMPORTANT: It is absolutely CRUCIAL that you respect the interview type and ask questions in line with the type of interview.

Do not interrupt the candidate; always let them finish their thoughts. If the candidate's response seems incomplete, use affirming interjections like "uh-huh" to encourage them to continue. Use positive reinforcement and adjust the difficulty of questions based on the candidate's performance, allowing them to expand and providing feedback when necessary.`;

  if (!keyQuestions?.length) return baseContext;

  const keyQuestionsContext = `

IMPORTANT: These are the ${
    keyQuestions.length
  } key questions that MUST be asked during the interview. They are the HIGHEST PRIORITY questions and should be asked before exploring other topics. These questions have been specifically generated for this role and are crucial for assessing the candidate's suitability:

${keyQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}

IMPORTANT GUIDELINES FOR QUESTIONS:
1. Ask ALL of these key questions during the interview - they are mandatory and essential for the evaluation report
2. Space them naturally throughout the interview, but ensure they are all covered before exploring less critical topics
3. Ask follow-up questions based on the candidate's responses to these key questions
4. Only move to other questions when:
   - The candidate's response to a key question naturally leads to a relevant follow-up topic
   - All key questions have been thoroughly covered
5. Return to any key questions that weren't fully answered before concluding the interview`;

  return baseContext + keyQuestionsContext;
}
