import OpenAI from "openai";

export const getOpenAiClient = (userEmail?: string) => {
  const defaultHeaders = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Cache-Enabled": "true",
    "Helicone-Posthog-Key": process.env.POSTHOG_KEY ?? "",
    "Helicone-Posthog-Host": "https://eu.posthog.com",
  };

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
    baseURL: "https://oai.hconeai.com/v1",
    defaultHeaders: userEmail
      ? { ...defaultHeaders, "Helicone-User-Id": userEmail }
      : defaultHeaders,
  });
};
