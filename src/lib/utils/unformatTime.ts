// Unformat time - HH:MM:SS to number
export const unformatTime = (time: string | null) => {
  if (!time) return 0;
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};
