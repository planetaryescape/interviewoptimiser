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
  startingFreeMinutes: 2,
  earlyBirdPromo: {
    minutes: 3,
    userCount: 20,
    enabled: true,
  },
};
