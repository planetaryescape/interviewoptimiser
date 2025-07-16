import { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadialProsodyChartProps {
  data: { name: string; value: number }[];
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
}

// Custom shape for curved radar
const CurvedRadarShape = (props: RadarShapeProps) => {
  const { points, fill, stroke, fillOpacity } = props;

  // Create path with bezier curves between points
  const pathData = useMemo(() => {
    if (!points || points.length < 3) return "";

    const pathPoints = [...points]; // Work with all points
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

    // Create a smooth curve through all points using cubic bezier curves
    for (let i = 0; i < pathPoints.length; i++) {
      const current = pathPoints[i];
      const next = pathPoints[(i + 1) % pathPoints.length];

      // Calculate control points for bezier curve
      // Use a tension factor to control curve smoothness (0.2 = smoother)
      const tension = 0.2;

      // Previous and next points (wrapping around for closed shape)
      const prev = pathPoints[(i - 1 + pathPoints.length) % pathPoints.length];
      const nextNext = pathPoints[(i + 2) % pathPoints.length];

      // First control point
      const cp1x = current.x + (next.x - prev.x) * tension;
      const cp1y = current.y + (next.y - prev.y) * tension;

      // Second control point
      const cp2x = next.x - (nextNext.x - current.x) * tension;
      const cp2y = next.y - (nextNext.y - current.y) * tension;

      // Add cubic bezier curve
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    // Close the path
    path += " Z";

    return path;
  }, [points]);

  return (
    <path d={pathData} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={2} />
  );
};

export function RadialProsodyChart({ data }: RadialProsodyChartProps) {
  // Calculate max value with padding
  const maxValue = Math.max(...data.map((d) => d.value));
  const scalePadding = 0.2;
  const maxDomain = Math.ceil((maxValue * (1 + scalePadding)) / 10) * 10;

  // Consistent colors regardless of theme
  const colors = {
    background: "#ffffff",
    grid: "#e5e7eb",
    text: "#1f2937",
    primary: "#2563eb",
    accent: "#3b82f6",
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
        No voice characteristics data available
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-white rounded-lg p-4">
      <ResponsiveContainer>
        <RadarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <PolarGrid gridType="circle" stroke={colors.grid} strokeWidth={1} />
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fill: colors.text,
              fontSize: 12,
              fontWeight: 500,
            }}
            axisLine={{ stroke: colors.grid }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxDomain]}
            axisLine={false}
            tick={{
              fill: colors.text,
              fontSize: 10,
            }}
            tickFormatter={(value) => `${value}%`}
            stroke={colors.grid}
          />
          <Radar
            name="Prevalence"
            dataKey="value"
            stroke={colors.primary}
            fill={colors.accent}
            fillOpacity={0.15}
            dot={{
              r: 4,
              fill: colors.background,
              strokeWidth: 2,
              stroke: colors.primary,
            }}
            isAnimationActive={true}
            shape={CurvedRadarShape as any}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white px-3 py-2 shadow-lg border border-gray-100 rounded-lg">
                  <div className="grid gap-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      {payload[0].payload.name}
                    </p>
                    <p className="text-sm font-bold text-gray-900">{payload[0].value}%</p>
                  </div>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
