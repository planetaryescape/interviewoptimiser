"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

interface JobScoreRadialComparisonProps {
  metricName: string;
  latestScore: number;
  averageScore: number; // This will be the 'background' or 'full' value for comparison
  Icon?: LucideIcon; // Making Icon optional for now
  className?: string;
  primaryColor?: string; // e.g., 'hsl(var(--primary))'
  secondaryColor?: string; // e.g., 'hsl(var(--muted-foreground))'
}

export const JobScoreRadialComparison = ({
  metricName,
  latestScore,
  averageScore,
  Icon,
  className,
  primaryColor = "hsl(var(--primary))",
  secondaryColor = "hsl(var(--muted))", // Using muted as fallback
}: JobScoreRadialComparisonProps) => {
  const normalizedLatestScore = Math.min(Math.max(latestScore, 0), 100); // Ensure 0-100 range
  const normalizedAverageScore = Math.min(Math.max(averageScore, 0), 100);

  const data = [
    {
      name: metricName,
      value: normalizedLatestScore,
      fill: primaryColor,
    },
    // We can add a background bar for the average if the chart type supports it easily
    // Or, we imply the average by setting the domain of PolarAngleAxis
  ];

  const percentageOfAverage =
    normalizedAverageScore > 0
      ? (normalizedLatestScore / normalizedAverageScore) * 100
      : normalizedLatestScore > 0
        ? 100
        : 0;

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
        "bg-card border border-border/20 dark:border-border/30",
        "hover:border-primary/20 dark:hover:border-primary/30",
        "flex flex-col items-center",
        className
      )}
    >
      {Icon && <Icon className="h-6 w-6 mb-2 text-primary/70" />}
      <h4 className="text-sm font-medium text-muted-foreground mb-1 text-center h-10">
        {metricName}
      </h4>
      <div className="w-32 h-32 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            barSize={10}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]} // Assuming scores are 0-100
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              // The 'background' prop colors the track behind the bar
              // We can make the background represent 100, and the bar the latestScore
            />
            {/* Custom label in the center */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-foreground"
            >
              {normalizedLatestScore.toFixed(0)}
            </text>
            <text
              x="50%"
              y="68%" // Position below the main score
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-muted-foreground"
            >
              Avg: {normalizedAverageScore.toFixed(0)}
            </text>
            {/* <Tooltip /> */}
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        {percentageOfAverage.toFixed(0)}% of job average
      </p>
    </div>
  );
};
