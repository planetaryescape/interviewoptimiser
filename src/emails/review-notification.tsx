import { config } from "@/lib/config";
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

interface ReviewNotificationEmailProps {
  name: string;
  rating: number;
  comment: string;
  twitterUsername?: string;
  linkedinUrl?: string;
  showOnLanding: boolean;
}

export const ReviewNotificationEmail = ({
  name,
  rating,
  comment,
  twitterUsername,
  linkedinUrl,
  showOnLanding,
}: ReviewNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Review Submitted - {config.projectName}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "hsl(340, 65%, 45%)", // Adjust to match your Interview Optimiser branding
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
            src={`https://${config.domain}/logo.png`}
            width="49"
            height="63.6"
            alt={`${config.projectName} Logo`}
            className="mx-auto my-20"
          />
          <Container className="p-45 bg-white rounded-lg shadow">
            <Heading className="text-2xl font-bold text-brand mb-6 text-center">
              New Review Submitted
            </Heading>

            <Section className="mb-8">
              <div className="mb-4 p-6 bg-gray-50 rounded-lg">
                <Text className="font-medium text-xl mb-2">{name}</Text>
                <div className="flex items-center mb-4">
                  <Text className="text-lg font-semibold mr-2">Rating:</Text>
                  <Text className="text-yellow-500">{"★".repeat(rating)}</Text>
                  <Text className="text-gray-300">
                    {"★".repeat(5 - rating)}
                  </Text>
                </div>
                <Text className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {comment}
                </Text>

                {(twitterUsername || linkedinUrl) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Text className="font-medium mb-2">Social Links:</Text>
                    {twitterUsername && (
                      <Text className="text-blue-600">
                        Twitter: @{twitterUsername}
                      </Text>
                    )}
                    {linkedinUrl && (
                      <Text className="text-blue-600">
                        LinkedIn: {linkedinUrl}
                      </Text>
                    )}
                  </div>
                )}

                <Text className="mt-4 text-sm text-gray-600">
                  Show on landing page: {showOnLanding ? "Yes" : "No"}
                </Text>
              </div>
            </Section>

            <Section className="mt-8 pt-8 border-t border-gray-200">
              <Text className="text-sm text-gray-600 text-center">
                This is an automated notification from {config.projectName}. If
                you have any questions, please contact our support team at{" "}
                <a
                  href={`mailto:${config.supportEmail}`}
                  className="text-brand"
                >
                  {config.supportEmail}
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReviewNotificationEmail;
