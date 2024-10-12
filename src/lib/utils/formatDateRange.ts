export function formatDateRange(dateRange: {
  startDate: string;
  endDate: string | null;
  current: boolean;
}) {
  const startDate = new Date(dateRange.startDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
  const endDate = dateRange.current
    ? "Present"
    : dateRange.endDate
    ? new Date(dateRange.endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : "";
  return `${startDate} - ${endDate}`;
}
