import type { ConnectionMessage, JSONMessage } from "@humeai/voice-react";

export const ONE_MINUTE_LEFT_MESSAGE =
  "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>.";

export const INTERVIEW_START_MESSAGE = "I'm ready to start the interview.";

// Format message - remove one minute left message and split on {
export const formatMessage = (message?: string) => {
  if (!message) return "";
  return message.replace(ONE_MINUTE_LEFT_MESSAGE, "")?.split("{")?.[0] ?? "";
};

export const formatTranscript = (messages: (JSONMessage | ConnectionMessage)[]) => {
  return messages
    .filter((msg) => msg.type === "user_message" || msg.type === "assistant_message")
    .filter((msg) => msg.message.content?.split("{")?.[0].trim() !== INTERVIEW_START_MESSAGE)
    .map((msg) => {
      return {
        content: formatMessage(msg.message.content),
        role: msg.type === "user_message" ? "user" : "assistant",
        prosody: msg.type === "user_message" ? msg.models?.prosody?.scores : undefined,
      };
    });
};

export const formatTranscriptToJsonString = (messages: (JSONMessage | ConnectionMessage)[]) => {
  return JSON.stringify(formatTranscript(messages));
};
