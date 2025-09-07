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
import { AudioPlayer } from "@/components/interview/audio-player";
import PagePreview from "@/components/page-preview";
import { PagePreviewToolbar, marginSizes, paperSizes } from "@/components/page-preview-toolbar";
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
import { clientIdHandler } from "@/lib/utils/clientIdHandler";
import type { EntityList } from "@/lib/utils/formatEntity";
import * as Sentry from "@sentry/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMeasure } from "@uidotdev/usehooks";
import "easymde/dist/easymde.min.css";
import { CommunicationAnalysis } from "@/components/report/communication-analysis";
import { CompetencyAssessment } from "@/components/report/competency-assessment";
import { DevelopmentRecommendations } from "@/components/report/development-recommendations";
import { ExecutiveSummary } from "@/components/report/executive-summary";
import { KeyObservations } from "@/components/report/key-observations";
import { QuestionAnalysisSection } from "@/components/report/question-analysis";
import { ReportFooter } from "@/components/report/report-footer";
// Import components
import { ReportHeader } from "@/components/report/report-header";
import { TranscriptSection } from "@/components/report/transcript-section";
import saveAs from "file-saver";
import { FileSearch } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";
import type { InferResultType } from "~/db/helpers";
import type { Interview, Job, PageSettings, QuestionAnalysis } from "~/db/schema";

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
      return await interviewRepo.getById(clientIdHandler.formatId(report?.data.interviewId));
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
      return reportRepo.update(clientIdHandler.formatId(report?.sys.id), {
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
        clientIdHandler.formatId(report?.data.pageSettings?.id),
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
    window.open(`/job/${clientIdHandler.formatId(job?.sys.id)}`, "_blank");
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/job/${clientIdHandler.formatId(job?.sys.id)}`;
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
        body: JSON.stringify({
          jobId: params.jobId,
          reportId: params.reportId,
          interviewId: clientIdHandler.formatId(report?.data.interviewId),
        }),
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
    onError: (_error) => {
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

  if (!report || !job || !interview) {
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
      {/* Fixed Toolbar at top */}
      <div className="sticky top-0 z-10 bg-background shadow-sm">
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
          jobId={clientIdHandler.formatId(job?.sys.id)}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Scrollable Content */}
      <div
        className={cn("flex-1 overflow-y-auto overflow-x-hidden p-8 bg-muted", bodyFont)}
        ref={containerRef}
        style={{
          height: report?.data?.interviewAudioUrl ? "calc(100vh - 134px)" : "calc(100vh - 64px)",
          paddingBottom: report?.data?.interviewAudioUrl ? "76px" : "16px",
        }}
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
          {/* Use the extracted components */}
          <ReportHeader job={job} interview={interview} headingFont={headingFont} />

          <ExecutiveSummary report={report} headingFont={headingFont} />

          <CompetencyAssessment report={report} headingFont={headingFont} />

          <KeyObservations report={report} headingFont={headingFont} />

          <DevelopmentRecommendations report={report} headingFont={headingFont} />

          <QuestionAnalysisSection questionAnalyses={questionAnalyses} headingFont={headingFont} />

          <CommunicationAnalysis
            interview={interview}
            headingFont={headingFont}
            includeTranscript={includeTranscript}
          />

          <TranscriptSection
            interview={interview}
            headingFont={headingFont}
            includeTranscript={includeTranscript}
          />

          <ReportFooter report={report} />
        </PagePreview>
      </div>

      {/* Fixed Audio Player at bottom */}
      {report?.data?.interviewAudioUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <AudioPlayer audioUrl={report.data.interviewAudioUrl} disabled={false} />
        </div>
      )}

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
              value={`${window.location.origin}/report/${clientIdHandler.formatId(report?.sys.id)}`}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              className="flex-grow"
            />
            <Button size="icon" variant="outline" onClick={copyShareLink} disabled={!isPublic}>
              <FileSearch className="h-4 w-4" />
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
