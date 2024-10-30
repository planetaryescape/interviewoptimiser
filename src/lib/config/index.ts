const isDev = process.env.NODE_ENV === "development";
const domain = isDev ? "localhost:3000" : "interviewoptimiser.com";

export const config = {
  projectName: "Interview Optimiser",
  baseUrl: `http://${domain}`,
  domain,
  supportEmail: `${domain.split(".")[0]}@bhekani.com`,
  maxTextLengths: {
    cv: 15000,
    jobDescription: 5000,
    additionalInfo: 1000,
    customisations: 1000,
  },
  fomoDiscountPromoStartDate: new Date(2024, 11, 5, 12, 0, 0),
  fomoDiscountPromoLengthInDays: 30,
  fomoDiscountPercentage: 20,
  earlyBirdPromoLengthInDays: 14,
  startingFreeMinutes: 15,
  earlyBirdPromo: {
    minutes: 20,
    userCount: 20,
    enabled: true,
  },
};
