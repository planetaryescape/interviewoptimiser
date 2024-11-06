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
import { Badge } from "@/components/badge";
import { Expressions } from "@/components/expressions";
import PagePreview from "@/components/page-preview";
import {
  marginSizes,
  PagePreviewToolbar,
  paperSizes,
} from "@/components/page-preview-toolbar";
import { RadialProsodyChart } from "@/components/radial-prosody-chart";
import { remarkMarkdownComponents } from "@/components/remark-markdown-components";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleSwarmLoader } from "@/components/ui/particle-swarm-loader";
import { Switch } from "@/components/ui/switch";
import { Interview, PageSettings, Report } from "@/db/schema";
import { config } from "@/lib/config";
import { getRepository } from "@/lib/data/repositoryFactory";
import { getPagePreviewHtml } from "@/lib/getPagePreviewHtml";
import { prepareHtml } from "@/lib/prepareHtml";
import { mmToPx, remToPx } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import "easymde/dist/easymde.min.css";
import saveAs from "file-saver";
import {
  ArrowUpCircle,
  Briefcase,
  CheckCircle,
  Clock,
  Code,
  Copy,
  FileSearch,
  MessageCircle,
  MessageSquare,
  Puzzle,
  Target,
  ThumbsUp,
  Timer,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

function aggregateProsodyData(transcript: string) {
  const messages = JSON.parse(transcript || "[]");

  const prosodyTotals: { [key: string]: number } = {};
  let totalMessages = 0;

  messages.forEach(
    (message: { role: string; prosody: Record<string, number> }) => {
      if (message.role === "user" && message.prosody) {
        totalMessages++;
        Object.entries(message.prosody).forEach(([key, value]) => {
          prosodyTotals[key] = (prosodyTotals[key] || 0) + value;
        });
      }
    }
  );

  const result = Object.entries(prosodyTotals)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((value / totalMessages) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return result;
}

export default function InterviewReportPage(props: {
  params: Promise<{ interviewId: string; reportId: string }>;
}) {
  const params = use(props.params);
  const queryClient = useQueryClient();
  const {
    data: interview,
    isLoading,
    isPending: interviewIsPending,
  } = useQuery({
    queryKey: ["interview", params.interviewId],
    queryFn: async () => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.getById(params.interviewId);
    },
  });

  const {
    data: report,
    isLoading: reportIsLoading,
    isPending: reportIsPending,
  } = useQuery({
    queryKey: ["report", params.reportId],
    queryFn: async () => {
      const reportRepo = await getRepository<
        Report & { pageSettings: PageSettings }
      >(`interviews/${params.interviewId}/reports`);
      return await reportRepo.getById(params.reportId);
    },
  });

  const { mutate: exportDocument, isPending: isExporting } = useMutation({
    mutationFn: async (format: "pdf" | "docx") => {
      const htmlContent = getPagePreviewHtml("report-preview");

      const processedHtml = prepareHtml(htmlContent);

      const response = await fetch(`/api/generate-${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          htmlContent: processedHtml,
          paperSize: "A4",
          margin: 20,
          bodyFont: "font-montserrat",
          headingFont: "font-raleway",
        }),
      });

      if (!response.ok) {
        Sentry.withScope(async (scope) => {
          scope.setExtra("context", "exportDocument");
          scope.setExtra("format", format);
          scope.setExtra("error", response.statusText);
          scope.setExtra("status", response.status);
          scope.setExtra("response", response);
          scope.setExtra("response", await response.text());
          Sentry.captureException(
            new Error(`Failed to generate ${format.toUpperCase()}`)
          );
        });
        throw new Error(`Failed to generate ${format.toUpperCase()}`);
      }

      return response.blob();
    },
    onSuccess: (blob, format) => {
      saveAs(
        blob,
        `Interview Optimiser Report - ${interview?.data.candidate} - ${interview?.data.role}.${format}`
      );
      toast.success(`Report exported as ${format.toUpperCase()} successfully`, {
        description:
          format === "docx"
            ? "If you encounter any issues with opening the document in Microsoft Word, please use Google Docs as an alternative, then you can convert it back to docx format."
            : undefined,
        duration: 10000,
      });
    },
    onError: (error, format) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "exportDocument");
        scope.setExtra("format", format);
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error(
        `Something went wrong while exporting ${format.toUpperCase()}. Please try again.`
      );
    },
  });

  const [includeTranscript, setIncludeTranscript] = useState(true);

  const [paperSize, setPaperSize] = useState<keyof typeof paperSizes>(
    (report?.data.pageSettings?.paperSize as keyof typeof paperSizes) || "A4"
  );
  const [marginSize, setMarginSize] = useState<keyof typeof marginSizes>(
    (report?.data.pageSettings?.marginSize as keyof typeof marginSizes) ||
      "Normal"
  );
  const [bodyFont, setBodyFont] = useState(
    report?.data.pageSettings?.bodyFont || "font-raleway"
  );
  const [headingFont, setHeadingFont] = useState(
    report?.data.pageSettings?.headingFont || "font-roboto"
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(report?.data.isPublic);

  const [containerRef, { width: containerWidth }] =
    useMeasure<HTMLDivElement>();

  const pageWidth = paperSizes[paperSize].width;
  const scale = Math.min(
    ((containerWidth ?? 0) - remToPx(4)) / mmToPx(pageWidth),
    1
  );

  const { mutate: toggleReportPublicStatus, isPending: isToggling } =
    useMutation({
      mutationFn: async (newPublicStatus: boolean) => {
        const reportRepo = await getRepository<
          Report & { pageSettings: PageSettings }
        >(`interviews/${params.interviewId}/reports`);
        return reportRepo.update(idHandler.encode(report?.sys.id ?? 0), {
          isPublic: newPublicStatus,
        });
      },
      onSuccess: (_, newPublicStatus) => {
        queryClient.invalidateQueries({
          queryKey: ["report", params.reportId],
        });
        setIsPublic(newPublicStatus);
        toast.success(
          newPublicStatus ? "Report made public" : "Report made private",
          {
            description: newPublicStatus
              ? "Your report is now publicly viewable."
              : "Your report is now private.",
          }
        );
      },
      onError: (error) => {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "toggleReportPublicStatus");
          scope.setExtra("error", error);
          scope.setExtra("message", error.message);

          Sentry.captureException(error);
        });
        toast.error("Failed to update report visibility", {
          description: "Please try again.",
        });
      },
    });

  const { mutate: updatePageSettings } = useMutation({
    mutationFn: async (settings: Partial<PageSettings>) => {
      const pageSettingsRepo = await getRepository<PageSettings>(
        "page-settings"
      );
      return pageSettingsRepo.update(
        idHandler.encode(report?.data.pageSettings?.id ?? 0),
        settings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview", params.interviewId],
      });
      toast.success("Page settings updated successfully");
    },
    onError: (error) => {
      Sentry.withScope((scope) => {
        scope.setExtra("context", "updatePageSettings");
        scope.setExtra("error", error);
        scope.setExtra("message", error.message);

        Sentry.captureException(error);
      });
      toast.error("Failed to update page settings");
    },
  });

  const handleShare = (option: "pdf" | "docx" | "link") => {
    if (option === "link") {
      setIsShareDialogOpen(true);
    } else {
      exportDocument(option);
    }
  };

  const handleTogglePublic = () => {
    toggleReportPublicStatus(!isPublic);
  };

  const handleViewPublic = () => {
    window.open(
      `/interview/${idHandler.encode(interview?.sys.id ?? 0)}`,
      "_blank"
    );
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/cv/${idHandler.encode(
      interview?.sys.id ?? 0
    )}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard", {
      description: "You can now share this link with others.",
    });
  };

  const handleSettingsChange = async (settings: Partial<PageSettings>) => {
    updatePageSettings(settings);
  };

  if (isLoading || interviewIsPending || reportIsLoading || reportIsPending)
    return (
      <div className="size-full flex items-center justify-center">
        <ParticleSwarmLoader />
      </div>
    );

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-background text-foreground p-4">
        <FileSearch className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-2">Report Not Found</h1>
        <p className="text-xl mb-6 text-center max-w-md">
          We couldn&apos;t find the report you&apos;re looking for.
        </p>
        <Button asChild size="lg">
          <Link href="/">Start a New Mock Interview</Link>
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
      <PagePreviewToolbar
        paperSize={paperSize}
        setPaperSize={setPaperSize}
        marginSize={marginSize}
        setMarginSize={setMarginSize}
        bodyFont={bodyFont}
        setBodyFont={setBodyFont}
        headingFont={headingFont}
        setHeadingFont={setHeadingFont}
        onShare={handleShare}
        isSharing={isExporting || isToggling}
        onSettingsChange={handleSettingsChange}
        pageSettings={report?.data.pageSettings}
        includeTranscript={includeTranscript}
        setIncludeTranscript={setIncludeTranscript}
        interviewId={idHandler.encode(interview?.sys.id ?? 0)}
      />
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background",
          bodyFont
        )}
        ref={containerRef}
      >
        <PagePreview
          scale={scale}
          pageWidth={pageWidth}
          pageHeight={paperSizes[paperSize].height}
          margin={marginSizes[marginSize]}
          id="report-preview"
          className={cn("text-black", bodyFont, headingFont)}
          bodyFont={bodyFont}
          headingFont={headingFont}
          noBorder
        >
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="bg-gradient-to-b from-blue-50 to-white px-4 pb-8 pt-12 rounded-b-3xl shadow-sm">
              <Image
                src="https://interviewoptimiser.com/logo.png"
                alt={`${config.projectName} Logo`}
                width={160}
                height={160}
                className="mx-auto mb-6"
              />
              <h1
                className={cn(
                  "text-4xl font-bold text-gray-900 mb-3",
                  headingFont
                )}
              >
                Interview Assessment Report
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {interview?.data.candidate} • {interview?.data.role}
              </p>
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(
                    interview?.data.createdAt ?? ""
                  ).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Timer className="w-4 h-4 mr-1.5" />
                  {interview?.data.duration ?? 0} minutes
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Technical Interview
                </div>
              </div>
            </div>
          </header>

          {/* Executive Summary */}
          <section className="mb-12">
            <div className="flex items-center gap-6 mb-8">
              <div className="flex-1">
                <h2
                  className={cn(
                    "text-2xl font-semibold mb-4 text-gray-800",
                    headingFont
                  )}
                >
                  Executive Summary
                </h2>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={remarkMarkdownComponents}
                  className="text-gray-700 leading-relaxed"
                >
                  {report.data.generalAssessment}
                </ReactMarkdown>
              </div>
              <div className="flex flex-col items-center bg-blue-50 p-6 rounded-2xl min-w-[200px]">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {report.data.overallScore}%
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Overall Performance Score
                </div>
                <div className="mt-4">
                  {report.data.overallScore >= 80 ? (
                    <Badge variant="success" className="font-medium">
                      Excellent
                    </Badge>
                  ) : report.data.overallScore >= 60 ? (
                    <Badge variant="warning" className="font-medium">
                      Good
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="font-medium">
                      Needs Improvement
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Candidate Profile */}
          <section className="mb-12 bg-gray-50 p-6 rounded-xl">
            <h2
              className={cn(
                "text-2xl font-semibold mb-6 text-gray-800",
                headingFont
              )}
            >
              Candidate Profile
            </h2>
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="flex items-center text-blue-600 mb-2">
                  <User className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Candidate</span>
                </div>
                <p className="font-medium text-gray-900">
                  {interview?.data.candidate}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-blue-600 mb-2">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Company</span>
                </div>
                <p className="font-medium text-gray-900">
                  {interview?.data.company}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-blue-600 mb-2">
                  <UserCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Role</span>
                </div>
                <p className="font-medium text-gray-900">
                  {interview?.data.role}
                </p>
              </div>
            </div>
          </section>

          {/* Detailed Assessment */}
          <section className="mb-12">
            <h2
              className={cn(
                "text-2xl font-semibold mb-6 text-gray-800 border-b pb-2",
                headingFont
              )}
            >
              Detailed Assessment
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {[
                {
                  title: "Technical Knowledge",
                  content: report.data.technicalKnowledge,
                  score: report.data.technicalKnowledgeScore,
                  icon: Code,
                },
                {
                  title: "Problem-Solving Skills",
                  content: report.data.problemSolvingSkills,
                  score: report.data.problemSolvingSkillsScore,
                  icon: Puzzle,
                },
                {
                  title: "Communication Skills",
                  content: report.data.communicationSkills,
                  score: report.data.communicationSkillsScore,
                  icon: MessageCircle,
                },
                {
                  title: "Teamwork & Collaboration",
                  content: report.data.teamwork,
                  score: report.data.teamworkScore,
                  icon: Users,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "text-lg font-semibold text-gray-800",
                          headingFont
                        )}
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center mt-1">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.score >= 80
                                ? "bg-green-500"
                                : item.score >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            )}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-600">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                    className="text-gray-600 text-sm leading-relaxed"
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths and Areas for Improvement */}
          <section className="mb-12">
            <h2
              className={cn(
                "text-2xl font-semibold mb-6 text-gray-800 border-b pb-2",
                headingFont
              )}
            >
              Key Observations
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h3
                  className={cn(
                    "text-lg font-semibold text-green-800 mb-4 flex items-center gap-2",
                    headingFont
                  )}
                >
                  <ThumbsUp className="w-5 h-5" />
                  Areas of Strength
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report.data.areasOfStrength).map(
                    (strength: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-green-900"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                <h3
                  className={cn(
                    "text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2",
                    headingFont
                  )}
                >
                  <Target className="w-5 h-5" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report.data.areasForImprovement).map(
                    (area: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-amber-900"
                      >
                        <ArrowUpCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <span>{area}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Action Plan */}
          <section className="mb-12">
            <h2
              className={cn(
                "text-2xl font-semibold mb-6 text-gray-800 border-b pb-2",
                headingFont
              )}
            >
              Recommended Action Plan
            </h2>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <ol className="space-y-4">
                {JSON.parse(report.data.actionableNextSteps).map(
                  (step: string, index: number) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-gray-700">{step}</p>
                      </div>
                    </li>
                  )
                )}
              </ol>
            </div>
          </section>

          {/* Prosody Analysis */}
          {includeTranscript && (
            <section className="mb-12">
              <h2
                className={cn(
                  "text-2xl font-semibold mb-6 text-gray-800 border-b pb-2",
                  headingFont
                )}
              >
                Voice Characteristics Analysis
              </h2>
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
                  This analysis shows the top emotional and tonal patterns
                  detected in your responses during the interview. The further a
                  point extends from the center, the more prevalent that
                  characteristic was in your speech.
                </p>
                <div className="w-full">
                  <RadialProsodyChart
                    data={aggregateProsodyData(report?.data.transcript ?? "[]")}
                  />
                </div>
                <div className="mt-6 text-sm text-gray-500 text-center">
                  <p>
                    Values represent the percentage of responses where each
                    characteristic was significantly detected. Only the top 6
                    most prevalent characteristics are shown.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Interview Transcript (if included) */}
          {includeTranscript && (
            <section className="mb-12">
              <h2
                className={cn(
                  "text-2xl font-semibold mb-6 text-gray-800 border-b pb-2",
                  headingFont
                )}
              >
                Interview Transcript
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                {JSON.parse(report?.data.transcript ?? "[]").map(
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
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg",
                          persona === "Interviewer"
                            ? "bg-blue-50 ml-4"
                            : "bg-white mr-4"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {persona === "Interviewer" ? (
                            <UserCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <User className="w-5 h-5 text-green-600" />
                          )}
                          <span
                            className={cn(
                              "font-medium",
                              persona === "Interviewer"
                                ? "text-blue-600"
                                : "text-green-600"
                            )}
                          >
                            {persona}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {message.content?.split("{")?.[0] ?? ""}
                        </p>
                        {persona === "Candidate" &&
                          Object.keys(message.prosody).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <Expressions
                                values={message.prosody}
                                withScores={false}
                              />
                            </div>
                          )}
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm mt-12 pt-6 border-t">
            <div className="flex justify-center items-center gap-4">
              <Image
                src="https://interviewoptimiser.com/logo.png"
                alt={`${config.projectName} Logo`}
                width={24}
                height={24}
                className="opacity-50"
              />
              <p>
                Generated by Interview Optimiser on{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </footer>
        </PagePreview>
      </div>
      <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Report</AlertDialogTitle>
            <AlertDialogDescription>
              You need to make your report public before sharing. Once public,
              anyone with the link can view it. You can always make it private
              again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Switch
              id="public-mode"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isToggling}
            />
            <Label htmlFor="public-mode">
              Make report {isPublic ? "private" : "public"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/report/${idHandler.encode(
                report?.sys.id ?? 0
              )}`}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              className="flex-grow"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyShareLink}
              disabled={!isPublic}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter className="flex justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div className="flex space-x-2">
              <Button onClick={handleViewPublic} disabled={!isPublic}>
                View Public
              </Button>
              <Button onClick={() => setIsShareDialogOpen(false)}>Done</Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
