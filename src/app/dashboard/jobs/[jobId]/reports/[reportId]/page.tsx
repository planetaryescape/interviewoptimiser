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
import { AudioPlayer } from "@/components/interview/audio-player";
import PagePreview from "@/components/page-preview";
import { PagePreviewToolbar, marginSizes, paperSizes } from "@/components/page-preview-toolbar";
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
import { getRepository } from "@/lib/data/repositoryFactory";
import { getPagePreviewHtml } from "@/lib/getPagePreviewHtml";
import { prepareHtml } from "@/lib/prepareHtml";
import { mmToPx, remToPx } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";
import type { EntityList } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import "easymde/dist/easymde.min.css";
import saveAs from "file-saver";
import { Code, Copy, FileSearch, MessageCircle, Puzzle, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { config } from "~/config";
import type { InferResultType } from "~/db/helpers";
import type { Interview, Job, PageSettings, QuestionAnalysis } from "~/db/schema";

function aggregateProsodyData(transcript: string) {
  const messages = JSON.parse(transcript || "[]");

  const prosodyTotals: { [key: string]: number } = {};
  let totalMessages = 0;

  for (const message of messages) {
    if (message.role === "user" && message.prosody) {
      totalMessages++;
      for (const [key, value] of Object.entries(message.prosody)) {
        prosodyTotals[key] = (prosodyTotals[key] || 0) + (value as number);
      }
    }
  }

  const result = Object.entries(prosodyTotals)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((value / totalMessages) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return result;
}

type ReportWithPageSettings = InferResultType<
  "reports",
  {
    pageSettings: true;
  }
>;

export default function JobReportPage(props: {
  params: Promise<{ jobId: string; reportId: string }>;
}) {
  const params = use(props.params);
  const queryClient = useQueryClient();
  const {
    data: job,
    isLoading,
    isPending: jobIsPending,
  } = useQuery({
    queryKey: ["job", params.jobId],
    queryFn: async () => {
      const jobRepo = await getRepository<Job>("jobs");
      return await jobRepo.getById(params.jobId);
    },
  });

  const {
    data: report,
    isLoading: reportIsLoading,
    isPending: reportIsPending,
  } = useQuery({
    queryKey: ["report", params.reportId],
    queryFn: async () => {
      const reportRepo = await getRepository<ReportWithPageSettings>(
        `jobs/${params.jobId}/reports`
      );
      return await reportRepo.getById(params.reportId);
    },
  });

  const { data: interview, isLoading: interviewIsLoading } = useQuery({
    queryKey: ["interview", params.reportId],
    queryFn: async () => {
      const interviewRepo = await getRepository<Interview>("interviews");
      return await interviewRepo.getById(idHandler.encode(report?.data.interviewId ?? 0));
    },
    enabled: !!params.reportId,
  });

  const { data: questionAnalyses, isLoading: questionAnalysesIsLoading } = useQuery<
    EntityList<QuestionAnalysis>
  >({
    queryKey: ["questionAnalyses", params.reportId],
    queryFn: async () => {
      const response = await fetch(`/api/reports/${params.reportId}/question-analyses`);
      if (!response.ok) {
        throw new Error("Failed to fetch question analyses");
      }
      return response.json();
    },
    enabled: !!params.reportId,
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
          Sentry.captureException(new Error(`Failed to generate ${format.toUpperCase()}`));
        });
        throw new Error(`Failed to generate ${format.toUpperCase()}`);
      }

      return response.blob();
    },
    onSuccess: (blob, format) => {
      saveAs(
        blob,
        `Interview Optimiser Report - ${job?.data.candidate} - ${job?.data.role}.${format}`
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
    (report?.data.pageSettings?.marginSize as keyof typeof marginSizes) || "Normal"
  );
  const [bodyFont, setBodyFont] = useState(report?.data.pageSettings?.bodyFont || "font-raleway");
  const [headingFont, setHeadingFont] = useState(
    report?.data.pageSettings?.headingFont || "font-roboto"
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(report?.data.isPublic);

  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const pageWidth = paperSizes[paperSize].width;
  const scale = Math.min(((containerWidth ?? 0) - remToPx(4)) / mmToPx(pageWidth), 1);

  const { mutate: toggleReportPublicStatus, isPending: isToggling } = useMutation({
    mutationFn: async (newPublicStatus: boolean) => {
      const reportRepo = await getRepository<ReportWithPageSettings>(
        `jobs/${params.jobId}/reports`
      );
      return reportRepo.update(idHandler.encode(report?.sys.id ?? 0), {
        isPublic: newPublicStatus,
      });
    },
    onSuccess: (_, newPublicStatus) => {
      queryClient.invalidateQueries({
        queryKey: ["report", params.reportId],
      });
      setIsPublic(newPublicStatus);
      toast.success(newPublicStatus ? "Report made public" : "Report made private", {
        description: newPublicStatus
          ? "Your report is now publicly viewable."
          : "Your report is now private.",
      });
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
      const pageSettingsRepo = await getRepository<PageSettings>("page-settings");
      return pageSettingsRepo.update(
        idHandler.encode(report?.data.pageSettings?.id ?? 0),
        settings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job", params.jobId],
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
    window.open(`/job/${idHandler.encode(job?.sys.id ?? 0)}`, "_blank");
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/job/${idHandler.encode(job?.sys.id ?? 0)}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard", {
      description: "You can now share this link with others.",
    });
  };

  const handleSettingsChange = async (settings: Partial<PageSettings>) => {
    updatePageSettings(settings);
  };

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: params.jobId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job", params.jobId],
      });
      toast.success("Report regeneration queued successfully", {
        description: "Your report will be regenerated shortly.",
      });
    },
    onError: (error) => {
      console.error("Error regenerating report:", error);
      toast.error("Failed to regenerate report. Please try again.");

      queryClient.invalidateQueries({
        queryKey: ["job", params.jobId],
      });
    },
  });

  const handleRegenerate = async () => {
    generateReportMutation.mutate();
  };

  if (
    isLoading ||
    jobIsPending ||
    reportIsLoading ||
    reportIsPending ||
    questionAnalysesIsLoading ||
    interviewIsLoading
  )
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
          Our AI-powered mock interviews help you practice for your interview skills and prepare you
          for success.
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
        jobId={idHandler.encode(job?.sys.id ?? 0)}
        onRegenerate={handleRegenerate}
      />
      <div
        className={cn("flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background", bodyFont)}
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
          {/* Header Section - Redesigned to be minimalist */}
          <header className="mb-16 border-b border-slate-200 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex items-center mr-4 border-r border-slate-200 pr-4">
                  <Image
                    src="/logo.png"
                    alt={`${config.projectName} Logo`}
                    width={56}
                    height={56}
                    className="opacity-80"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                    Confidential Assessment
                  </span>
                  <h1
                    className={cn(
                      "text-2xl font-medium text-slate-800 tracking-tight",
                      headingFont
                    )}
                  >
                    Interview Performance Evaluation
                  </h1>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Reference</p>
                <p className="text-sm font-medium text-slate-700 font-mono">
                  IO-{idHandler.encode(job?.sys.id ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="max-w-sm">
                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                      Candidate
                    </p>
                    <p className="font-medium text-slate-800">{job?.data.candidate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                      Position
                    </p>
                    <p className="font-medium text-slate-800">{job?.data.role}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                      Organization
                    </p>
                    <p className="font-medium text-slate-800">{job?.data.company}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Date</p>
                    <p className="font-medium text-slate-800">
                      {new Date(job?.data.createdAt ?? "").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Duration</p>
                <p className="font-medium text-slate-800">
                  {interview?.data.actualTime ?? 0} minutes
                </p>
              </div>
            </div>
          </header>

          {/* Executive Summary - Redesigned for better information hierarchy */}
          <section className="mb-16">
            <div className="flex flex-col">
              <div>
                <h2
                  className={cn(
                    "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 w-full",
                    headingFont
                  )}
                >
                  Executive Summary
                </h2>
                <div className="flex gap-8">
                  <div className="flex-1 max-w-prose">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ...remarkMarkdownComponents,
                        p: ({ node, ...props }) => (
                          <p className="mb-4 text-slate-700 leading-relaxed text-sm" {...props} />
                        ),
                      }}
                      className="text-slate-700"
                    >
                      {report.data.generalAssessment}
                    </ReactMarkdown>
                  </div>
                  <div className="w-40 flex flex-col items-center border-l border-slate-200 pl-6">
                    <div
                      className="mb-3"
                      aria-label={`Overall score: ${report.data.overallScore}%`}
                    >
                      <div className="rounded-full w-20 h-20 border-2 border-blue-200 bg-blue-50 flex items-center justify-center">
                        <div className="text-2xl font-semibold text-blue-800">
                          {report.data.overallScore}%
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-widest text-center mb-3">
                      Overall Assessment
                    </div>
                    <div>
                      {report.data.overallScore >= 80 ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-0.5 font-medium rounded">
                          Distinguished
                        </div>
                      ) : report.data.overallScore >= 60 ? (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-0.5 font-medium rounded">
                          Proficient
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-0.5 font-medium rounded">
                          Developing
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Assessment - Redesigned with proper typographic hierarchy */}
          <section className="mb-16 bg-slate-50 py-8 px-8 border-y border-slate-200">
            <h2
              className={cn(
                "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-8 w-full",
                headingFont
              )}
            >
              Competency Assessment
            </h2>
            <div className="space-y-10">
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
                  key={item.title}
                  className="border-b border-slate-200 pb-8 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="mr-3 p-1.5 bg-white rounded-sm border border-slate-300">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className={cn("text-base font-semibold text-slate-800", headingFont)}>
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center mb-1" aria-label={`Score: ${item.score}%`}>
                        <span className="text-sm font-medium text-slate-700 mr-2">
                          {item.score}%
                        </span>
                        <div className="w-24 h-2 bg-slate-200 rounded-sm overflow-hidden">
                          <div
                            className={cn(
                              "h-full",
                              item.score >= 80
                                ? "bg-green-600"
                                : item.score >= 60
                                  ? "bg-blue-600"
                                  : "bg-amber-500"
                            )}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-wider text-slate-600">
                        {item.score >= 80
                          ? "Distinguished"
                          : item.score >= 60
                            ? "Proficient"
                            : "Developing"}
                      </span>
                    </div>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ...remarkMarkdownComponents,
                      p: ({ node, ...props }) => (
                        <p className="mb-4 text-slate-700 leading-relaxed text-sm" {...props} />
                      ),
                    }}
                    className="text-slate-700 text-sm leading-relaxed pl-9 max-w-prose"
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths and Areas for Improvement - Redesigned with subtle visual cues */}
          <section className="mb-16">
            <h2
              className={cn(
                "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-8 w-full",
                headingFont
              )}
            >
              Key Observations
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="border-l-4 border-green-600 pl-6 pt-1">
                <h3
                  className={cn(
                    "text-sm font-semibold text-green-800 mb-5 uppercase tracking-wider",
                    headingFont
                  )}
                >
                  Areas of Strength
                </h3>
                <ul className="space-y-4 text-sm">
                  {JSON.parse(report.data.areasOfStrength).map(
                    (strength: string, index: number) => (
                      <li key={strength} className="flex items-start gap-3">
                        <span className="text-green-600 font-mono text-xs mt-0.5">
                          {index + 1}.
                        </span>
                        <span className="text-slate-700">{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="border-l-4 border-amber-500 pl-6 pt-1">
                <h3
                  className={cn(
                    "text-sm font-semibold text-amber-800 mb-5 uppercase tracking-wider",
                    headingFont
                  )}
                >
                  Areas for Development
                </h3>
                <ul className="space-y-4 text-sm">
                  {JSON.parse(report.data.areasForImprovement).map(
                    (area: string, index: number) => (
                      <li key={area} className="flex items-start gap-3">
                        <span className="text-amber-600 font-mono text-xs mt-0.5">
                          {index + 1}.
                        </span>
                        <span className="text-slate-700">{area}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Action Plan - Redesigned for academic credibility */}
          <section className="mb-16 bg-slate-50 py-8 border-y border-slate-200">
            <h2
              className={cn(
                "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 mx-8 w-auto",
                headingFont
              )}
            >
              Professional Development Recommendations
            </h2>
            <div className="px-8">
              <ol className="space-y-5 list-decimal pl-5 counter-reset text-slate-700">
                {JSON.parse(report.data.actionableNextSteps).map((step: string, index: number) => (
                  <li key={step} className="pl-2 text-sm">
                    <p className="leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Key Question Analysis - Professional academic style */}
          {questionAnalyses?.data?.length && questionAnalyses?.data?.length > 0 ? (
            <section className="mb-16">
              <h2
                className={cn(
                  "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 w-full",
                  headingFont
                )}
              >
                Key Question Analysis
              </h2>
              <div className="space-y-6">
                {questionAnalyses.data.map((item) => (
                  <div key={item.data.id} className="border border-slate-200 rounded-sm">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                      <div className="flex justify-between items-center">
                        <h3 className={cn("text-sm font-semibold text-slate-800", headingFont)}>
                          {item.data.question}
                        </h3>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-slate-700 mr-2">
                            {item.data.score}%
                          </span>
                          <div className="w-20 h-2 bg-slate-200 rounded-sm overflow-hidden">
                            <div
                              className={cn(
                                "h-full",
                                item.data.score >= 80
                                  ? "bg-green-600"
                                  : item.data.score >= 60
                                    ? "bg-blue-600"
                                    : "bg-amber-500"
                              )}
                              style={{ width: `${item.data.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ...remarkMarkdownComponents,
                          p: ({ node, ...props }) => (
                            <p className="mb-4 text-slate-700 leading-relaxed text-sm" {...props} />
                          ),
                        }}
                        className="text-slate-700 text-sm leading-relaxed"
                      >
                        {item.data.analysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Prosody Analysis - Redesigned for academic style */}
          {includeTranscript && (
            <section className="mb-16">
              <h2
                className={cn(
                  "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 w-full",
                  headingFont
                )}
              >
                Communication Pattern Analysis
              </h2>
              <div className="border border-slate-200 p-8">
                <p className="text-slate-700 mb-8 text-sm max-w-prose leading-relaxed">
                  The following analysis presents a quantitative assessment of vocal characteristics
                  exhibited during the interview. The data visualization below illustrates the
                  prevalence of each characteristic, with the radial distance from center
                  representing frequency of occurrence in the candidate&apos;s responses.
                </p>
                <div
                  className="w-full mb-8"
                  aria-label="Vocal characteristics chart showing the prevalence of different speech patterns"
                >
                  <RadialProsodyChart
                    data={aggregateProsodyData(interview?.data.transcript ?? "[]")}
                  />
                </div>
                <div className="mt-8 text-xs text-slate-600 italic border-t border-slate-200 pt-4">
                  <p>
                    <span className="font-semibold">Methodology note:</span> Values represent
                    percentage of responses where each characteristic was detected at significant
                    levels. Analysis is limited to the six most prevalent characteristics for
                    clarity of presentation.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Interview Transcript - Redesigned for better readability */}
          {includeTranscript && (
            <section className="mb-16 bg-slate-50 py-8 border-y border-slate-200">
              <h2
                className={cn(
                  "text-base font-semibold text-blue-800 uppercase tracking-widest border-b border-slate-300 pb-2 mb-6 mx-8 w-auto",
                  headingFont
                )}
              >
                Interview Transcript
              </h2>
              <div className="px-8 space-y-4 text-sm">
                {JSON.parse(interview?.data.transcript ?? "[]").map(
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
                        key={message.content}
                        className={cn(
                          "p-4 border-l-2",
                          persona === "Interviewer"
                            ? "border-blue-400 ml-4 bg-white"
                            : "border-blue-600 mr-4"
                        )}
                      >
                        <div className="mb-2">
                          <span
                            className={cn(
                              "font-medium text-xs uppercase tracking-wider",
                              persona === "Interviewer" ? "text-blue-600" : "text-blue-800"
                            )}
                          >
                            {persona}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-2">
                          {message.content?.split("{")?.[0] ?? ""}
                        </p>
                        {persona === "Candidate" &&
                        message.prosody &&
                        Object.keys(message.prosody).length > 0 ? (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs uppercase tracking-wider text-slate-600 mb-2">
                              Vocal characteristics
                            </p>
                            <Expressions values={message.prosody} withScores={false} />
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* Footer - Redesigned to be minimalist */}
          <footer className="text-slate-500 text-xs mt-16 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div className="text-left text-xs uppercase tracking-wider">
                Confidential Document
              </div>
              <div>
                <p className="font-mono">
                  {config.projectName} •{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • Ref: IO-{idHandler.encode(report?.sys.id ?? 0)}
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-wider">Page 1</div>
            </div>
          </footer>
        </PagePreview>
      </div>
      <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Report</AlertDialogTitle>
            <AlertDialogDescription>
              You need to make your report public before sharing. Once public, anyone with the link
              can view it. You can always make it private again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Switch
              id="public-mode"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isToggling}
            />
            <Label htmlFor="public-mode">Make report {isPublic ? "private" : "public"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/report/${idHandler.encode(report?.sys.id ?? 0)}`}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              className="flex-grow"
            />
            <Button size="icon" variant="outline" onClick={copyShareLink} disabled={!isPublic}>
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
      {/* Audio Player - fixed bottom bar */}
      {report?.data?.interviewAudioUrl && (
        <AudioPlayer audioUrl={report.data.interviewAudioUrl} disabled={false} />
      )}
    </div>
  );
}
