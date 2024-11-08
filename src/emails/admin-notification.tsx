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

interface AdminNotificationEmailProps {
  eventType: "signup" | "deletion";
  userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    timestamp: string;
  };
}

export const AdminNotificationEmail = ({
  eventType,
  userData,
}: AdminNotificationEmailProps) => {
  const isSignup = eventType === "signup";

  return (
    <Html>
      <Head />
      <Preview>
        {isSignup ? "New User Signup" : "User Account Deleted"} -{" "}
        {userData.email}
      </Preview>
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
            src={`https://${config.domain}/logo.png`}
            width="49"
            height="63.6"
            alt={`${config.projectName} Logo`}
            className="mx-auto my-20"
          />
          <Container className="p-45 bg-white rounded-lg shadow">
            <Heading className="text-2xl font-bold text-brand mb-6 text-center">
              {isSignup ? "New User Signup" : "User Account Deleted"}
            </Heading>

            <Section className="mb-8">
              <div className="mb-4 p-6 bg-gray-50 rounded-lg">
                <Text className="font-medium text-xl mb-4">User Details:</Text>
                <div className="space-y-2">
                  <Text className="text-gray-700">
                    <span className="font-semibold">Email:</span>{" "}
                    {userData.email}
                  </Text>
                  {userData.firstName && (
                    <Text className="text-gray-700">
                      <span className="font-semibold">First Name:</span>{" "}
                      {userData.firstName}
                    </Text>
                  )}
                  {userData.lastName && (
                    <Text className="text-gray-700">
                      <span className="font-semibold">Last Name:</span>{" "}
                      {userData.lastName}
                    </Text>
                  )}
                  <Text className="text-gray-700">
                    <span className="font-semibold">Timestamp:</span>{" "}
                    {userData.timestamp}
                  </Text>
                </div>
              </div>
            </Section>

            <Section className="mt-8 pt-8 border-t border-gray-200">
              <Text className="text-sm text-gray-600 text-center">
                This is an automated notification from {config.projectName}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AdminNotificationEmail;
