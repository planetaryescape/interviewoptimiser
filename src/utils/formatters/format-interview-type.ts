import type { InterviewType } from "~/db/schema/interviews";

export const formatInterviewType = (type: InterviewType) => {
  return type
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
