import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { idHandler } from "@/lib/utils/idHandler";
import { formatInterviewType } from "@/utils/formatters/format-interview-type";
import { config } from "~/config";
import type { InterviewType } from "~/db/schema";

/**
 * Props for the ReportCompletedEmail component
 */
interface ReportCompletedEmailProps {
  firstName?: string;
  jobId: number;
  interviewId: number;
  reportId: number;
  interviewType: InterviewType;
  role: string;
  company: string;
}

export const ReportCompletedEmail = ({
  firstName,
  jobId,
  interviewId,
  reportId,
  interviewType,
  role,
  company,
}: ReportCompletedEmailProps) => {
  const reportUrl = `${config.baseUrl}/jobs/${idHandler.encode(
    jobId
  )}/reports/${idHandler.encode(reportId)}`;

  return (
    <Html>
      <Head />
      <Preview>
        Your {formatInterviewType(interviewType)} interview report for {role} at {company} is now
        ready
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "hsl(340, 65%, 45%)",
                offwhite: "hsl(210, 36%, 96%)",
                success: "hsl(160, 67%, 52%)",
              },
              spacing: {
                0: "0px",
                20: "20px",
                45: "45px",
              },
            },
          },
        }}
      >
        <Body className="bg-offwhite font-sans text-base text-brand">
          <Img
            src={`${config.baseUrl}/logo.png`}
            width={200}
            height={200}
            alt={`${config.projectName} Logo`}
            className="mx-auto my-20"
          />
          <Container className="p-45 bg-white rounded-lg shadow">
            <Heading className="my-0 text-center leading-8">Your Report Is Ready</Heading>

            <Section>
              <Text className="text-base">Hi {firstName ?? "there"},</Text>

              <Text className="text-base">
                Great news! Your{" "}
                <strong>{formatInterviewType(interviewType as InterviewType)}</strong> interview
                report for the <strong>{role}</strong> position at <strong>{company}</strong> is now
                ready for you to review.
              </Text>

              <Text className="text-base">
                This comprehensive analysis provides valuable insights into your interview
                performance, highlighting your strengths and offering actionable recommendations for
                improvement.
              </Text>

              <Text className="text-base">
                Click the button below to access your report and take the next step towards
                interview success.
              </Text>
            </Section>

            <Section className="text-center my-8">
              <Button
                href={reportUrl}
                className="bg-brand rounded-lg px-[18px] py-3 text-white font-medium"
              >
                View Your Report
              </Button>
            </Section>

            <Section className="bg-[#f8f9fa] p-4 rounded-lg border-l-4 border-success">
              <Text className="text-sm text-gray-700 m-0">
                <strong>Tip:</strong> You can access all your reports anytime from your dashboard.
              </Text>
            </Section>

            <Section className="mt-8">
              <Text className="text-base">
                Thank you for using {config.projectName}. We&apos;re committed to helping you
                succeed in your interview journey.
                <br />
                <br />
                If you have any questions about your report, please contact{" "}
                <Link href={`mailto:${config.supportEmail}`} className="text-brand">
                  our support team
                </Link>
                .
                <br />
                <br />– The {config.projectName} Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReportCompletedEmail;
