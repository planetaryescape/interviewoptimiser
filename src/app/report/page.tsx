"use client";

import {
  bebasNeue,
  comfortaa,
  crimsonText,
  exo,
  firaCode,
  firaSans,
  geistMono,
  geistSans,
  ibmPlexSans,
  jetbrainsMono,
  lato,
  lora,
  merriweather,
  montserrat,
  nunito,
  openSans,
  oswald,
  playfairDisplay,
  raleway,
  roboto,
  robotoMono,
  rubik,
  sourceSerif,
  ubuntu,
  workSans,
} from "@/app/fonts";
import { Expressions } from "@/components/expressions";
import PagePreview from "@/components/page-preview";
import { marginSizes, paperSizes } from "@/components/page-preview-toolbar";
import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import { Button } from "@/components/ui/button";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Interview, PageSettings, Report } from "@/db/schema";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { mmToPx, remToPx } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import "easymde/dist/easymde.min.css";
import {
  AlertTriangle,
  BarChart2,
  Briefcase,
  FileSearch,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  User,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PublicInterviewReportPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: report,
    isLoading,
    isPending: reportIsPending,
    error,
  } = useQuery({
    queryKey: ["public-report", params.id],
    queryFn: async () => {
      const reportRepo = await getRepository<
        Report & {
          pageSettings: PageSettings;
          interview: Pick<
            Interview,
            "candidate" | "role" | "company" | "transcript"
          >;
        }
      >("public/reports");
      return await reportRepo.getById(params.id);
    },
  });

  const [includeTranscript, setIncludeTranscript] = useState(true);

  const [containerRef, { width: containerWidth }] =
    useMeasure<HTMLDivElement>();

  const pageWidth =
    paperSizes[report?.data.pageSettings.paperSize ?? "A4"].width;
  const scale = Math.min(
    ((containerWidth ?? 0) - remToPx(4)) / mmToPx(pageWidth),
    1
  );

  if (isLoading) {
    return (
      <div className="size-full h-screen w-screen size-screen flex items-center justify-center">
        <ParticleSwarmLoader className="size-96" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-background text-foreground p-4">
        <FileSearch className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-2">Report Not Found</h1>
        <p className="text-xl mb-6 text-center max-w-md">
          We couldn&apos;t find the report you&apos;re looking for.
        </p>
        <Button asChild size="lg">
          <Link href="/">Start Your Own Mock Interview</Link>
        </Button>
        <p className="mt-8 text-sm text-muted-foreground text-center max-w-md">
          Our AI-powered mock interviews help you practice for your interview
          skills and prepare you for success.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col",
        bebasNeue.variable,
        comfortaa.variable,
        crimsonText.variable,
        exo.variable,
        firaCode.variable,
        firaSans.variable,
        geistMono.variable,
        geistSans.variable,
        ibmPlexSans.variable,
        jetbrainsMono.variable,
        lato.variable,
        lora.variable,
        merriweather.variable,
        montserrat.variable,
        nunito.variable,
        openSans.variable,
        oswald.variable,
        playfairDisplay.variable,
        raleway.variable,
        roboto.variable,
        robotoMono.variable,
        rubik.variable,
        sourceSerif.variable,
        ubuntu.variable,
        workSans.variable
      )}
    >
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background",
          report?.data.pageSettings.bodyFont
        )}
        ref={containerRef}
      >
        <PagePreview
          scale={scale}
          pageWidth={pageWidth}
          pageHeight={
            paperSizes[report?.data.pageSettings.paperSize ?? "A4"].height
          }
          margin={marginSizes[report?.data.pageSettings.marginSize ?? "Normal"]}
          id="report-preview"
          className={cn(
            "text-black",
            report?.data.pageSettings.bodyFont,
            report?.data.pageSettings.headingFont
          )}
          bodyFont={report?.data.pageSettings.bodyFont}
          headingFont={report?.data.pageSettings.headingFont}
          noBorder
        >
          <header className="text-center mb-8 bg-blue-50 px-4 pb-8">
            <Image
              src="https://interviewoptimiser.com/logo.png"
              alt={`${config.projectName} Logo`}
              width={200}
              height={200}
              className="mx-auto"
            />
            <h1
              className={cn(
                "text-3xl font-bold text-gray-900 mb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Interview Optimiser Report
            </h1>
            <p className="text-xl text-gray-600">
              {report?.data.interview.candidate} - {report?.data.interview.role}
            </p>
          </header>

          {/* Candidate Info */}
          <section className="mb-8 text-gray-800">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Candidate Information
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm">Name</p>
                  <p className="font-medium">
                    {report?.data.interview.candidate}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm">Company</p>
                  <p className="font-medium">
                    {report?.data.interview.company}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <UserCircle className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm">Role</p>
                  <p className="font-medium">{report?.data.interview.role}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Overall Performance */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Overall Performance
            </h2>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <BarChart2 className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-800">
                    {report?.data.overallScore}%
                  </p>
                  <p className="text-gray-500">Overall Score</p>
                </div>
              </div>
              <div>
                {report?.data.overallScore >= 80 ? (
                  <div className="flex items-center text-green-600">
                    <ThumbsUp className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">Excellent</span>
                  </div>
                ) : report?.data.overallScore >= 60 ? (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">Good</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">
                      Needs Improvement
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={remarkMarkdownComponents}
              className="text-gray-700 leading-relaxed"
            >
              {report?.data.generalAssessment}
            </ReactMarkdown>
          </section>

          {/* Detailed Feedback */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Detailed Feedback
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "Speaking Skills",
                  content: report?.data.speakingSkills,
                  score: report?.data.speakingSkillsScore,
                },
                {
                  title: "Communication Skills",
                  content: report?.data.communicationSkills,
                  score: report?.data.communicationSkillsScore,
                },
                {
                  title: "Problem-Solving Skills",
                  content: report?.data.problemSolvingSkills,
                  score: report?.data.problemSolvingSkillsScore,
                },
                {
                  title: "Technical Knowledge",
                  content: report?.data.technicalKnowledge,
                  score: report?.data.technicalKnowledgeScore,
                },
                {
                  title: "Teamwork",
                  content: report?.data.teamwork,
                  score: report?.data.teamworkScore,
                },
                {
                  title: "Adaptability",
                  content: report?.data.adaptability,
                  score: report?.data.adaptabilityScore,
                },
              ].map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={cn(
                        "text-xl font-semibold text-gray-800",
                        report?.data.pageSettings.headingFont
                      )}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-xl font-bold text-blue-600">
                          {item.score}%
                        </span>
                      </div>
                      {item.score >= 80 ? (
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      ) : item.score >= 60 ? (
                        <TrendingUp className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                    className="text-gray-700"
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths and Areas for Improvement */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Strengths and Areas for Improvement
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 text-green-600",
                    report?.data.pageSettings.headingFont
                  )}
                >
                  Areas of Strength
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report?.data.areasOfStrength ?? "[]").map(
                    (strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <ThumbsUp className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 text-red-600",
                    report?.data.pageSettings.headingFont
                  )}
                >
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report?.data.areasForImprovement ?? "[]").map(
                    (area: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="w-5  h-5 text-red-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{area}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Actionable Next Steps */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Actionable Next Steps
            </h2>

            <ol className="space-y-4 list-decimal list-inside">
              {JSON.parse(report?.data.actionableNextSteps ?? "[]").map(
                (step: string, index: number) => (
                  <li key={index} className="pl-2 py-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 ml-2">{step}</span>
                  </li>
                )
              )}
            </ol>
          </section>

          {/* Interview Transcript */}
          {includeTranscript && (
            <section className="mb-8">
              <h2
                className={cn(
                  "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                  report?.data.pageSettings.headingFont
                )}
              >
                Interview Transcript
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
                {JSON.parse(report?.data.interview.transcript ?? "[]").map(
                  (
                    message: {
                      role: string;
                      content: string;
                      prosody: Record<string, number>;
                    },
                    index: number
                  ) => {
                    const persona = message.role
                      .replace("assistant", "Interviewer")
                      .replace("user", "Candidate")
                      ?.trim();
                    return (
                      <div key={index} className="mb-4 last:mb-0">
                        <span
                          className={cn(
                            "font-semibold text-blue-600 block mb-1",
                            persona === "Candidate" && "text-green-600"
                          )}
                        >
                          {persona}:
                        </span>
                        <p className="text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                          <span className="block mb-2">{message.content}</span>
                          {persona === "Candidate" &&
                            Object.keys(message.prosody).length > 0 && (
                              <Expressions
                                values={message.prosody}
                                withScores={false}
                              />
                            )}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm mt-8 pt-4 border-t">
            <p>
              Generated on {new Date().toLocaleDateString()} by Interview
              Optimiser
            </p>
          </footer>
        </PagePreview>
      </div>
    </div>
  );
}
