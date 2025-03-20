import { cn } from "@/lib/utils";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={`meteor-${el.top}-${el.left}-${el.size}`}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[rgba(255,255,255,0.25)] before:to-transparent"
          )}
          style={{
            top: el.top,
            left: el.left,
            animationDelay: el.delay,
            animationDuration: el.duration,
          }}
        />
      ))}
    </>
  );
};
