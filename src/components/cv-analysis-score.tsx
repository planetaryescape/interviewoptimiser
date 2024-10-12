"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

interface CVAnalysisScoreProps {
  score: number;
}

export function CVAnalysisScore({ score }: CVAnalysisScoreProps) {
  const data = [
    {
      name: "score",
      value: score,
      fill: score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444",
    },
  ];

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>CV Analysis Score</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <div className="w-36 h-36">
          <RadialBarChart
            width={160}
            height={160}
            cx={80}
            cy={80}
            innerRadius={50}
            outerRadius={90}
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              angleAxisId={0}
              data={data}
              cornerRadius={12}
            />
            <text
              x={80}
              y={80}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-3xl font-bold"
            >
              {score}%
            </text>
          </RadialBarChart>
        </div>
        <p className="text-sm text-muted-foreground flex-1">
          This is what our optimiser scored you based on the information
          provided. Note that this score is static and won&apos;t change as you
          update your CV with the feedback provided.
        </p>
      </CardContent>
    </Card>
  );
}
