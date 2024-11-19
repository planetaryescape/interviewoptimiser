const isDev = process.env.NODE_ENV === "development";
const domain = isDev ? "localhost:3000" : "interviewoptimiser.com";

export const config = {
  projectName: "Interview Optimiser",
  baseUrl: `http://${domain}`,
  domain,
  supportEmail: `${domain.split(".")[0]}@bhekani.com`,
  discordUserId: "549143313257725969",
  apiGatewayUrlAddToQueue:
    "https://h2m69x4dwd.execute-api.eu-west-2.amazonaws.com/prod/add-to-queue",
  apiGatewayUrlGeneratePdf:
    "https://1l4wnz22x0.execute-api.eu-west-2.amazonaws.com/prod/generate-pdf",
  maxTextLengths: {
    cv: 15000,
    jobDescription: 5000,
    additionalInfo: 1000,
    customisations: 1000,
  },
  startingFreeMinutes: 15,
  earlyAccessOffer: {
    startDate: new Date(2024, 10, 30, 12, 0, 0),
    lengthInDays: 10,
  },
  fomoDiscountPromoStartDate: new Date(2024, 11, 5, 12, 0, 0),
  fomoDiscountPromoLengthInDays: 30,
  fomoDiscountPercentage: 20,
  earlyBirdPromoLengthInDays: 14,
  earlyBirdPromo: {
    minutes: 20,
    userCount: 20,
    enabled: true,
  },
};
