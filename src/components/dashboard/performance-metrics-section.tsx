"use client";

import {
  Award,
  BarChart3,
  Brain,
  MessageSquare,
  Star,
  ThumbsUp,
  TrendingUp,
  Users2,
  Zap,
} from "lucide-react";
import { ScoreComparisonCard } from "./score-comparison-card";
import { type RadarChartDataPoint, ScoreRadarChart } from "./score-radar-chart";

// This should align with the structure from your API and page.tsx
interface AverageScoreSet {
  overallScore: number;
  communicationSkillsScore: number;
  fitnessForRoleScore: number;
  speakingSkillsScore: number;
  problemSolvingSkillsScore: number;
  technicalKnowledgeScore: number;
  teamworkScore: number;
  adaptabilityScore: number;
  [key: string]: number; // For dynamic access
}

interface PerformanceMetricsSectionProps {
  last3InterviewsScores: AverageScoreSet;
  allTimeScores: AverageScoreSet;
}

const scoreDisplayConfig = [
  {
    key: "overallScore",
    title: "Overall Score",
    Icon: Award,
    description: "General performance assessment.",
  },
  {
    key: "communicationSkillsScore",
    title: "Communication",
    Icon: MessageSquare,
    description: "Clarity and effectiveness in communication.",
  },
  {
    key: "fitnessForRoleScore",
    title: "Role Fitness",
    Icon: ThumbsUp,
    description: "Suitability for the job requirements.",
  },
  {
    key: "speakingSkillsScore",
    title: "Speaking Skills",
    Icon: Zap,
    description: "Eloquence and presentation abilities.",
  },
  {
    key: "problemSolvingSkillsScore",
    title: "Problem Solving",
    Icon: Brain,
    description: "Analytical and problem-resolution skills.",
  },
  {
    key: "technicalKnowledgeScore",
    title: "Tech Knowledge",
    Icon: Star, // Using Star as per original dashboard page
    description: "Understanding of technical concepts.",
  },
  {
    key: "teamworkScore",
    title: "Teamwork",
    Icon: Users2,
    description: "Collaboration and team interaction.",
  },
  {
    key: "adaptabilityScore",
    title: "Adaptability",
    Icon: TrendingUp,
    description: "Flexibility and response to change.",
  },
];

const formatScoresForRadar = (scores: AverageScoreSet): RadarChartDataPoint[] => {
  return scoreDisplayConfig.map((config) => ({
    subject: config.title.replace(" Score", ""), // Shorten for radar display
    score: scores[config.key] !== undefined ? scores[config.key] : 0, // Scores are already 0-100
    fullMark: 100, // Full mark is 100
  }));
};

export const PerformanceMetricsSection = ({
  last3InterviewsScores,
  allTimeScores,
}: PerformanceMetricsSectionProps) => {
  const radarDataLast3 = formatScoresForRadar(last3InterviewsScores);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-headingSecondary mb-6 text-foreground/90 flex items-center">
        <BarChart3 className="mr-3 h-6 w-6 text-primary opacity-80" /> Performance Metrics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/20 dark:border-border/30 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4 text-primary">Last 3 Interviews Snapshot</h3>
          <div className="h-72 md:h-80 lg:h-96">
            <ScoreRadarChart data={radarDataLast3} />
          </div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scoreDisplayConfig.map(({ key, title, Icon }) => (
            <ScoreComparisonCard
              key={key}
              title={title}
              Icon={Icon}
              last3Score={last3InterviewsScores[key] !== undefined ? last3InterviewsScores[key] : 0}
              allTimeScore={allTimeScores[key] !== undefined ? allTimeScores[key] : 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
