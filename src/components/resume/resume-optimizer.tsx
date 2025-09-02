"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ATSScore {
  overall: number;
  formatting: number;
  keywords: number;
  structure: number;
  readability: number;
}

interface Recommendation {
  id: string;
  type: "error" | "warning" | "success";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function ResumeOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      analyzeResume(uploadedFile);
    }
  };

  const analyzeResume = async (resumeFile: File) => {
    setIsAnalyzing(true);

    // Simulate API call
    setTimeout(() => {
      setAtsScore({
        overall: 78,
        formatting: 85,
        keywords: 72,
        structure: 90,
        readability: 65,
      });

      setRecommendations([
        {
          id: "missing-keywords",
          type: "error",
          title: "Missing Keywords",
          description:
            "Your resume is missing 5 important keywords from the job description: 'React', 'TypeScript', 'AWS', 'CI/CD', 'Agile'",
          priority: "high",
        },
        {
          id: "passive-voice",
          type: "warning",
          title: "Passive Voice Detected",
          description:
            "Consider using active voice in your experience descriptions for stronger impact",
          priority: "medium",
        },
        {
          id: "good-structure",
          type: "success",
          title: "Good Structure",
          description: "Your resume has a clear structure with proper sections and hierarchy",
          priority: "low",
        },
        {
          id: "quantify-achievements",
          type: "warning",
          title: "Quantify Achievements",
          description:
            "Add measurable results to 3 of your bullet points (e.g., 'increased sales by 25%')",
          priority: "high",
        },
      ]);

      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Resume ATS Optimizer</CardTitle>
          <CardDescription>
            Optimize your resume to pass Applicant Tracking Systems and land more interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground mb-4">PDF, DOC, or DOCX (Max 5MB)</p>
                <label htmlFor="resume-upload">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setAtsScore(null);
                  setRecommendations([]);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Upload New
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
              <p className="text-lg font-medium">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {atsScore && !isAnalyzing && (
        <>
          {/* Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle>ATS Score Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={cn("text-6xl font-bold mb-2", getScoreColor(atsScore.overall))}>
                    {atsScore.overall}%
                  </div>
                  <Badge variant={atsScore.overall >= 80 ? "default" : "secondary"}>
                    {getScoreLabel(atsScore.overall)}
                  </Badge>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Formatting", score: atsScore.formatting, icon: FileText },
                    { label: "Keywords", score: atsScore.keywords, icon: Target },
                    { label: "Structure", score: atsScore.structure, icon: TrendingUp },
                    { label: "Readability", score: atsScore.readability, icon: Sparkles },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <item.icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">{item.label}</p>
                      <div className={cn("text-2xl font-bold", getScoreColor(item.score))}>
                        {item.score}%
                      </div>
                      <Progress value={item.score} className="mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Follow these suggestions to improve your ATS score</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="high">High Priority</TabsTrigger>
                  <TabsTrigger value="medium">Medium Priority</TabsTrigger>
                  <TabsTrigger value="low">Low Priority</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </TabsContent>

                <TabsContent value="high" className="space-y-4 mt-6">
                  {recommendations
                    .filter((r) => r.priority === "high")
                    .map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                </TabsContent>

                <TabsContent value="medium" className="space-y-4 mt-6">
                  {recommendations
                    .filter((r) => r.priority === "medium")
                    .map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                </TabsContent>

                <TabsContent value="low" className="space-y-4 mt-6">
                  {recommendations
                    .filter((r) => r.priority === "low")
                    .map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button size="lg">
              Apply Suggestions with AI
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const getIcon = () => {
    switch (recommendation.type) {
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getPriorityBadge = () => {
    const variants = {
      high: "destructive" as const,
      medium: "secondary" as const,
      low: "outline" as const,
    };
    return (
      <Badge variant={variants[recommendation.priority]} className="text-xs">
        {recommendation.priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex gap-3 p-4 rounded-lg border">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{recommendation.title}</h4>
          {getPriorityBadge()}
        </div>
        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
      </div>
    </div>
  );
}
