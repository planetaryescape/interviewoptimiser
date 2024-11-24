export const ONE_MINUTE_LEFT_MESSAGE =
  "<One minute left>Tell the candidate how much time is left and start wrapping up the interview and tell the candidate that a report will be generated</One minute left>.";

// Format message - remove one minute left message and split on {
export const formatMessage = (message?: string) => {
  if (!message) return "";
  return message.replace(ONE_MINUTE_LEFT_MESSAGE, "")?.split("{")?.[0] ?? "";
};
