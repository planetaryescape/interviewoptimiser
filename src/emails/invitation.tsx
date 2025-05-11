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
import { config } from "~/config";

interface InvitationEmailProps {
  invitationLink: string;
  organizationName: string;
  expiresAt: string;
}

export function InvitationEmail({
  invitationLink,
  organizationName,
  expiresAt,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You have been invited to join {organizationName} on {config.projectName}
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
            src={`${config.baseUrl}/logo.png`}
            width={200}
            height={200}
            alt={`${config.projectName} Logo`}
            className="mx-auto my-20"
          />
          <Container className="p-45 bg-[hsl(210, 36%, 96%)]">
            <Heading className="my-0 text-center leading-8">
              Join {organizationName} on {config.projectName}
            </Heading>

            <Section>
              <Row>
                <Text className="text-base mt-8">
                  You have been invited to join {organizationName} on {config.projectName}. As a
                  member, you&apos;ll have access to the organization&apos;s interview resources,
                  templates, and collaborative features.
                </Text>

                <Text className="text-base">
                  This invitation will expire on {expiresAt}. Click the button below to accept the
                  invitation and join the organization.
                </Text>
              </Row>
            </Section>

            <Section className="text-center mt-8">
              <Button
                href={invitationLink}
                className="bg-brand rounded-lg px-[18px] py-3 text-white"
              >
                Accept Invitation
              </Button>
            </Section>

            <Section>
              <Text className="text-base text-gray-600 mt-8">
                This invitation was intended for you. If you were not expecting this invitation, you
                can safely ignore this email.
                <br />
                <br />– The {config.projectName} Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
