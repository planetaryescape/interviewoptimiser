"use client";

import { ChartTooltip } from "@/components/ui/chart";
import "easymde/dist/easymde.min.css";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export function RadialProsodyChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const chartData = data.map((item) => ({
    characteristic: item.name,
    value: item.value,
  }));

  const maxValue = Math.max(...data.map((d) => d.value));
  const scalePadding = 0.2;
  const maxDomain = Math.ceil((maxValue * (1 + scalePadding)) / 10) * 10;

  // Add a guard clause for empty data
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
        No voice characteristics data available
      </div>
    );
  }

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="80%"
          data={chartData}
          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        >
          <PolarGrid gridType="circle" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
          <PolarAngleAxis
            dataKey="characteristic"
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
            className="font-medium"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxDomain]}
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10,
            }}
            tickFormatter={(value) => `${value}%`}
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.2}
          />
          <Radar
            name="Prevalence"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            dot={{
              r: 4,
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              stroke: "hsl(var(--background))",
            }}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Characteristic
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.characteristic}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Prevalence
                      </span>
                      <span className="font-bold">{payload[0].value}%</span>
                    </div>
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
