const isDev = process.env.NODE_ENV === "development";
const domain = isDev ? "localhost:3000" : "mockmate.pro";

export const config = {
  projectName: "MockMate",
  baseUrl: `http://${domain}`,
  domain,
  maxTextLengths: {
    cv: 15000,
    jobDescription: 5000,
    additionalInfo: 3000,
    customisations: 3000,
  },
  startingFreeCredits: 3,
  earlyBirdPromo: {
    credits: 10,
    userCount: 20,
    enabled: true,
  },
};
