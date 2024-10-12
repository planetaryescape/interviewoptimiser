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

export const UserDetailsUpdatedEmail = ({
  firstName,
}: {
  firstName?: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {config.projectName}: Your account details have been updated
      </Preview>
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
              Your Account Details Have Been Updated
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">Hi {firstName ?? "there"},</Text>
                <Text className="text-base">
                  We wanted to let you know that your account details have been
                  successfully updated. If these changes were made by you, no
                  further action is required.
                </Text>
                <Text className="text-base">
                  However, if you did not make these changes or if you have any
                  concerns, please contact us immediately to secure your
                  account.
                </Text>
              </Row>
            </Section>

            <Section className="text-center">
              <Button
                href={`https://accounts.${config.domain}/user`}
                className="bg-brand rounded-lg px-[18px] py-3 text-white"
              >
                Review Your Account Details
              </Button>
            </Section>
            <Section>
              <Text className="text-base">
                Thank you for using {config.projectName}. If you need further
                assistance, feel free to contact{" "}
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

export default UserDetailsUpdatedEmail;
