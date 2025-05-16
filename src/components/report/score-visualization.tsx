import { cn } from "@/lib/utils";

interface ScoreVisualizationProps {
  score: number;
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "bar" | "pill" | "circle";
  showLabel?: boolean;
  showCategory?: boolean;
}

/**
 * Returns a text category based on the score
 */
const getScoreCategory = (score: number) => {
  if (score >= 90) return { text: "Exceptional", color: "text-green-700" };
  if (score >= 80) return { text: "Distinguished", color: "text-green-700" };
  if (score >= 65) return { text: "Proficient", color: "text-blue-700" };
  if (score >= 50) return { text: "Developing", color: "text-amber-700" };
  if (score >= 30) return { text: "Limited", color: "text-orange-700" };
  return { text: "Insufficient", color: "text-red-700" };
};

/**
 * Returns bg color class based on score
 */
const getScoreBgColor = (score: number) => {
  if (score >= 90) return "bg-green-600";
  if (score >= 80) return "bg-green-500";
  if (score >= 65) return "bg-blue-600";
  if (score >= 50) return "bg-amber-500";
  if (score >= 30) return "bg-orange-500";
  return "bg-red-500";
};

/**
 * Component for visualizing scores in various formats
 */
export function ScoreVisualization({
  score,
  className,
  size = "medium",
  variant = "bar",
  showLabel = true,
  showCategory = true,
}: ScoreVisualizationProps) {
  const scoreCategory = getScoreCategory(score);
  const scoreBgColor = getScoreBgColor(score);

  const sizes = {
    bar: {
      small: "h-1.5 w-20",
      medium: "h-2 w-24",
      large: "h-2.5 w-32",
    },
    pill: {
      small: "text-xs px-2 py-0.5",
      medium: "text-sm px-2.5 py-1",
      large: "text-base px-3 py-1.5",
    },
    circle: {
      small: "w-16 h-16 text-lg",
      medium: "w-20 h-20 text-xl",
      large: "w-24 h-24 text-2xl",
    },
  };

  if (variant === "bar") {
    return (
      <div className={cn("flex flex-col items-end", className)}>
        <div className="flex items-center mb-1 gap-2" aria-label={`Score: ${score}%`}>
          {showLabel && <span className="text-sm font-medium text-slate-700">{score}%</span>}
          <div className={cn("bg-slate-200 rounded-sm overflow-hidden", sizes.bar[size])}>
            <div className={cn("h-full", scoreBgColor)} style={{ width: `${score}%` }} />
          </div>
        </div>
        {showCategory && (
          <span className={cn("text-xs uppercase tracking-wider", scoreCategory.color)}>
            {scoreCategory.text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("font-medium rounded-full text-white", scoreBgColor, sizes.pill[size])}>
          {score}%
        </div>
        {showCategory && (
          <span className={cn("text-xs uppercase tracking-wider", scoreCategory.color)}>
            {scoreCategory.text}
          </span>
        )}
      </div>
    );
  }

  // Circle variant
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "rounded-full border-2 border-blue-200 bg-blue-50 flex items-center justify-center",
          sizes.circle[size]
        )}
        aria-label={`Score: ${score}%`}
      >
        <div className="font-semibold text-blue-800">{score}%</div>
      </div>
      {showCategory && (
        <span className={cn("text-xs uppercase tracking-wider mt-2", scoreCategory.color)}>
          {scoreCategory.text}
        </span>
      )}
    </div>
  );
}
