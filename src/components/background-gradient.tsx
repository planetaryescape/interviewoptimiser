"use client";

import { useTheme } from "next-themes";

export const BackgroundGradient = ({
  degrees = 212,
}: {
  degrees?: number;
}) => {
  const { theme } = useTheme();
  const hue = theme === "dark" ? 12 : 171;
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 mx-auto h-72 max-w-md blur-[118px] backdrop-blur-lg"
      style={{
        background: `linear-gradient(${degrees}deg, hsla(${hue}, 25%, 75%, 0.2) 4.54%, hsla(${hue}, 75%, 70%, 0.26) 34.2%, hsla(${hue},  15%, 70%,  0.1) 77.55%)`,
      }}
    />
  );
};
