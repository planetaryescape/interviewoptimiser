import { config } from "@/lib/config";
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
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export const WelcomeEmail = ({ firstName }: { firstName?: string }) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {config.projectName} - Optimise Your CV Now</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "hsl(228 73% 13%)",
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
              Welcome to {config.projectName}
            </Heading>

            <Section>
              <Row>
                <br />
                <Text className="text-base">Hi {firstName ?? "there"},</Text>

                <Text className="text-base">
                  We&apos;re excited to welcome you to the {config.projectName}{" "}
                  community. Our AI-powered tool helps you create tailored CVs
                  that stand out and get through ATS systems, making sure you
                  have the best chance to land that interview.
                </Text>

                <Text className="text-base">
                  You now have {config.startingFreeCredits} free credits to
                  start optimising your CV. Simply upload your CV, a job
                  description and some custom instructions if any to see how
                  quickly we can tailor your CV for the job you want.
                </Text>

                {config.earlyBirdPromo.enabled && (
                  <Text className="text-base">
                    If you&apos;re one of the first{" "}
                    {config.earlyBirdPromo.userCount} sign ups, you&apos;ll
                    receive {config.earlyBirdPromo.credits} credits instead! Get
                    started now and make sure your CV is ready for the
                    opportunities ahead.
                  </Text>
                )}
              </Row>
            </Section>

            <Section className="text-center">
              <Button
                href={`${config.baseUrl}/dashboard/create`}
                className="bg-brand rounded-lg px-[18px] py-3 text-white"
              >
                Optimise Your CV Now
              </Button>
            </Section>
            <Section>
              <Text className="text-base">
                Thank you for signing up! If you have any questions, feel free
                to contact{" "}
                <Link href="mailto:cvoptimiser@bhekani.com">
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

export default WelcomeEmail;
