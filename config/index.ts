const isDev = process.env.NODE_ENV === "development";
const domain = isDev ? "localhost:3000" : "interviewoptimiser.com";

export const config = {
  projectName: "Interview Optimiser",
  baseUrl: `http://${domain}`,
  domain,
  supportEmail: `${domain.split(".")[0]}@bhekani.com`,
  discordUserId: "549143313257725969",
  apiGatewayUrlAddToQueue:
    "https://90w85lvw6l.execute-api.eu-west-2.amazonaws.com/prod/shared-infra-add-to-queue",
  apiGatewayUrlGeneratePdf:
    "https://t8bqlb879i.execute-api.eu-west-2.amazonaws.com/prod/shared-infra-generate-pdf",
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
  blackFridayPriceId: isDev ? "price_1QPVMGAN8Y6xS9fBBDDCsyLr" : "price_1QPVaaAN8Y6xS9fBye0k5Dgi",
};
