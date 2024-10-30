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

interface Review {
  id: number;
  content: string;
  rating: number;
  author: string;
  rejectionReason?: string;
}

interface ReviewReportEmailProps {
  publishedReviews: Review[];
  rejectedReviews: Review[];
  date: string;
}

export const ReviewReportEmail = ({
  publishedReviews,
  rejectedReviews,
  date,
}: ReviewReportEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Daily Review Report - {config.projectName} - {date}
      </Preview>
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
            alt="CV Optimiser Logo"
            className="mx-auto my-20"
          />
          <Container className="p-45 bg-white rounded-lg shadow">
            <Heading className="text-2xl font-bold text-brand mb-6 text-center">
              Daily Review Report - {date}
            </Heading>

            <Section className="mb-8">
              <Heading className="text-xl font-semibold text-green-600 mb-4">
                Published Reviews ({publishedReviews.length})
              </Heading>
              {publishedReviews.length === 0 ? (
                <Text className="text-gray-600 italic">
                  No reviews were published today
                </Text>
              ) : (
                publishedReviews.map((review) => (
                  <div key={review.id} className="mb-4 p-4 bg-gray-50 rounded">
                    <Text className="font-medium">
                      {review.author} - {review.rating} stars
                    </Text>
                    <Text className="text-gray-700">{review.content}</Text>
                  </div>
                ))
              )}
            </Section>

            <Section>
              <Heading className="text-xl font-semibold text-red-600 mb-4">
                Rejected Reviews ({rejectedReviews.length})
              </Heading>
              {rejectedReviews.length === 0 ? (
                <Text className="text-gray-600 italic">
                  No reviews were rejected today
                </Text>
              ) : (
                rejectedReviews.map((review) => (
                  <div key={review.id} className="mb-4 p-4 bg-gray-50 rounded">
                    <Text className="font-medium">
                      {review.author} - {review.rating} stars
                    </Text>
                    <Text className="text-gray-700 mb-2">{review.content}</Text>
                    {review.rejectionReason && (
                      <Text className="text-red-600 text-sm">
                        Reason for rejection: {review.rejectionReason}
                      </Text>
                    )}
                  </div>
                ))
              )}
            </Section>

            <Section className="mt-8 pt-8 border-t border-gray-200">
              <Text className="text-sm text-gray-600 text-center">
                This is an automated report from {config.projectName}. If you
                have any questions, please contact our support team at{" "}
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

export default ReviewReportEmail;
