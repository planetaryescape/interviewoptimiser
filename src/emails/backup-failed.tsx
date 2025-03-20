import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { config } from "~/config";

interface BackupFailedEmailProps {
  error: string;
  timestamp: string;
}

export const BackupFailedEmail = ({ error, timestamp }: BackupFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Database Backup Failed - {config.projectName}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "hsl(340, 65%, 45%)",
                offwhite: "hsl(210, 36%, 96%)",
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
            width="49"
            height="63.6"
            alt={`${config.projectName} Logo`}
            className="mx-auto my-20"
          />
          <Container className="p-45 bg-white rounded-lg shadow">
            <Heading className="text-2xl font-bold text-red-600 mb-6 text-center">
              Database Backup Failed
            </Heading>

            <Section className="mb-8">
              <div className="mb-4 p-6 bg-gray-50 rounded-lg">
                <Text className="font-medium text-xl mb-2">Error Details</Text>
                <Text className="text-gray-700 mb-2">Timestamp: {timestamp}</Text>
                <Text className="text-red-600 whitespace-pre-wrap font-mono text-sm">{error}</Text>
              </div>
            </Section>

            <Section className="mt-8 pt-8 border-t border-gray-200">
              <Text className="text-sm text-gray-600 text-center">
                This is an automated notification from {config.projectName}. Please investigate this
                issue as soon as possible to ensure data safety.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BackupFailedEmail;
