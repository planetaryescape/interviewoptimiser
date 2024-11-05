import { config } from "@/lib/config";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export const AccountDeletedEmail = ({ firstName }: { firstName?: string }) => {
  return (
    <Html>
      <Head />
      <Preview>{config.projectName}: Your account has been deleted</Preview>
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
          <Container className="p-45 bg-[hsl(210, 36%, 96%)]">
            <Heading className="my-0 text-center leading-8">
              Your Account Has Been Deleted
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hi {firstName ?? "there"},</Text>
                <Text className="text-base">
                  We’re sorry to see you go. Your account with{" "}
                  {config.projectName} has been successfully deleted, and all of
                  your personal data has been removed from our systems.
                </Text>
                <Text className="text-base">
                  If this was a mistake or if you have any questions, please
                  reach out to our support team. Additionally, if you’d like to
                  share why you decided to delete your account, simply reply to
                  this email and let us know. Your feedback helps us improve.
                </Text>
              </Row>
            </Section>

            <Section className="text-center">
              <Button
                href={`mailto:${config.supportEmail}`}
                className="bg-brand rounded-lg px-[18px] py-3 text-white"
              >
                Contact Support
              </Button>
            </Section>
            <Section>
              <Text className="text-base">
                Thank you for having been a part of {config.projectName}. If you
                decide to return, you’re always welcome to sign up again at any
                time.
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

export default AccountDeletedEmail;
