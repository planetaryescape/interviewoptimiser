import { addDays, isAfter, isBefore } from "date-fns";
import { config } from "../config";

export const isFomoDiscountActive = () => {
  const startDate = config.fomoDiscountPromoStartDate;
  const endDate = addDays(
    config.fomoDiscountPromoStartDate,
    config.fomoDiscountPromoLengthInDays
  );
  const today = new Date();

  const isAfterStartDate = isAfter(today, startDate);
  const isBeforeEndDate = isBefore(today, endDate);
  const offerActive = isAfterStartDate && isBeforeEndDate;

  return offerActive;
};
