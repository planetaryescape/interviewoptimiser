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

interface PurchaseNotificationEmailProps {
  customerName: string;
  minutesPurchased: number;
  amountPaid: number;
  currency: string;
  purchaseDate: string;
}

export const PurchaseNotificationEmail = ({
  customerName,
  minutesPurchased,
  amountPaid,
  currency,
  purchaseDate,
}: PurchaseNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        New Purchase - {customerName} bought {minutesPurchased.toString()}{" "}
        minutes
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
              New Purchase Notification
            </Heading>

            <Section className="mb-8">
              <div className="mb-4 p-6 bg-gray-50 rounded-lg">
                <Text className="font-medium text-xl mb-4">
                  {customerName} has made a purchase!
                </Text>

                <div className="space-y-3">
                  <Text className="text-gray-700">
                    <span className="font-semibold">Minutes Purchased:</span>{" "}
                    {minutesPurchased} minutes
                  </Text>

                  <Text className="text-gray-700">
                    <span className="font-semibold">Amount Paid:</span>{" "}
                    {currency} {amountPaid.toFixed(2)}
                  </Text>

                  <Text className="text-gray-700">
                    <span className="font-semibold">Purchase Date:</span>{" "}
                    {purchaseDate}
                  </Text>
                </div>
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

export default PurchaseNotificationEmail;
