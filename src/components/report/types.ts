import type { Entity } from "@/lib/utils/formatEntity";
import type { InferResultType } from "~/db/helpers";
import type { Interview, Job } from "~/db/schema";

/**
 * Type for a report with its associated page settings
 */
export type ReportWithPageSettings = InferResultType<
  "reports",
  {
    pageSettings: true;
  }
>;

/**
 * Base props shared across multiple report components
 */
export interface ReportComponentBaseProps {
  headingFont: string;
}

/**
 * Props for components that need report data
 */
export interface ReportDataProps extends ReportComponentBaseProps {
  report: Entity<ReportWithPageSettings>;
}

/**
 * Props for components that need job data
 */
export interface JobDataProps extends ReportComponentBaseProps {
  job?: Entity<Job>;
}

/**
 * Props for components that need interview data and potentially transcript visibility settings
 */
export interface InterviewDataProps extends ReportComponentBaseProps {
  interview?: Entity<Interview>;
  includeTranscript: boolean;
}
