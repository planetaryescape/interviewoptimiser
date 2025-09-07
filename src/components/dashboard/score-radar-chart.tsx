"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Text,
  Tooltip,
} from "recharts";

export interface RadarChartDataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

interface ScoreRadarChartProps {
  data: RadarChartDataPoint[];
  className?: string;
}

interface RadarShapePoint {
  x: number;
  y: number;
}

interface RadarShapeProps {
  points: RadarShapePoint[];
  fill: string;
  stroke: string;
  fillOpacity: number;
  strokeWidth: number;
}

// Custom shape for curved radar (adapted from radial-prosody-chart.tsx)
const CurvedRadarShape = (props: RadarShapeProps) => {
  const { points, fill, stroke, fillOpacity, strokeWidth } = props;

  // Calculate path data directly without useMemo (shape functions can't use hooks)
  const calculatePathData = () => {
    if (!points || points.length < 3) return "";

    const pathPoints = [...points];
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

    for (let i = 0; i < pathPoints.length; i++) {
      const current = pathPoints[i];
      const next = pathPoints[(i + 1) % pathPoints.length];
      const prev = pathPoints[(i - 1 + pathPoints.length) % pathPoints.length];
      const nextNext = pathPoints[(i + 2) % pathPoints.length];

      const tension = 0.22; // Adjusted tension for smoothness

      const cp1x = current.x + (next.x - prev.x) * tension;
      const cp1y = current.y + (next.y - prev.y) * tension;
      const cp2x = next.x - (nextNext.x - current.x) * tension;
      const cp2y = next.y - (nextNext.y - current.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    path += " Z";
    return path;
  };

  const pathData = calculatePathData();

  return (
    <path
      d={pathData}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

interface CustomAngleTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
  };
  textAnchor: "start" | "middle" | "end" | "inherit";
  [key: string]: unknown;
}

// Custom tick for PolarAngleAxis to adjust styling and position
const CustomAngleTick = (props: CustomAngleTickProps) => {
  const { x, y, payload, textAnchor, ...rest } = props;
  return (
    <Text
      {...rest}
      verticalAnchor="middle"
      textAnchor={textAnchor}
      x={x}
      y={y}
      className="fill-muted-foreground text-xs md:text-sm group-hover:fill-primary transition-colors duration-300"
    >
      {payload.value}
    </Text>
  );
};

export const ScoreRadarChart = React.memo(
  ({ data, className }: ScoreRadarChartProps) => {
    if (!data || data.length === 0) {
      return (
        <div
          className={cn("flex items-center justify-center h-full text-muted-foreground", className)}
        >
          No score data available to display chart.
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%" className={cn("group", className)}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
            <radialGradient id="radarGradient" cx="0.5" cy="0.5" r="0.7">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border) / 0.5)" gridType="circle" />
          <PolarAngleAxis
            dataKey="subject"
            tick={CustomAngleTick as any}
            stroke="hsl(var(--foreground) / 0.7)"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickCount={6}
            stroke="hsl(var(--border) / 0.7)"
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground) / 0.8)", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="url(#radarGradient)"
            fillOpacity={1}
            strokeWidth={2.5}
            shape={CurvedRadarShape as any}
            dot={{
              r: 4,
              fill: "hsl(var(--background))",
              stroke: "hsl(var(--primary))",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "hsl(var(--background))",
              stroke: "hsl(var(--primary))",
              strokeWidth: 2.5,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              boxShadow: "0 4px 12px hsla(var(--shadow-color), 0.1)",
            }}
            labelStyle={{
              color: "hsl(var(--popover-foreground))",
              fontWeight: "bold",
            }}
            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            cursor={{
              stroke: "hsl(var(--primary) / 0.5)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.className === nextProps.className &&
      prevProps.data.length === nextProps.data.length &&
      prevProps.data.every(
        (item, index) =>
          item.subject === nextProps.data[index].subject &&
          item.score === nextProps.data[index].score &&
          item.fullMark === nextProps.data[index].fullMark
      )
    );
  }
);
