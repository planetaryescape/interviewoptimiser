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
import {
  marginSizes,
  PagePreviewToolbar,
  paperSizes,
} from "@/components/page-preview-toolbar";
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
  AlertTriangle,
  BarChart2,
  Briefcase,
  Copy,
  FileSearch,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  User,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export default function InterviewReportPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
  const queryClient = useQueryClient();
  const {
    data: interview,
    isLoading,
    isPending: interviewIsPending,
  } = useQuery({
    queryKey: ["interview", params.id],
    queryFn: async () => {
      const interviewRepo = await getRepository<
        Interview & {
          report: Report & { pageSettings: PageSettings };
        }
      >("interviews");
      return await interviewRepo.getById(params.id);
    },
  });

  console.log("interview:", interview);
  const report = interview?.data.report;

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
    (report?.pageSettings?.paperSize as keyof typeof paperSizes) || "A4"
  );
  const [marginSize, setMarginSize] = useState<keyof typeof marginSizes>(
    (report?.pageSettings?.marginSize as keyof typeof marginSizes) || "Normal"
  );
  const [bodyFont, setBodyFont] = useState(
    report?.pageSettings?.bodyFont || "font-raleway"
  );
  const [headingFont, setHeadingFont] = useState(
    report?.pageSettings?.headingFont || "font-roboto"
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(report?.isPublic);

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
        const reportRepo = await getRepository<Report>("reports");
        return reportRepo.update(idHandler.encode(report?.id ?? 0), {
          isPublic: newPublicStatus,
        });
      },
      onSuccess: (_, newPublicStatus) => {
        queryClient.invalidateQueries({
          queryKey: ["report", params.id],
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
        idHandler.encode(report?.pageSettings.id ?? 0),
        settings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview", params.id],
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

  if (isLoading || interviewIsPending)
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
        pageSettings={report?.pageSettings}
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
                headingFont
              )}
            >
              Interview Optimiser Report
            </h1>
            <p className="text-xl text-gray-600">
              {interview?.data.candidate} - {interview?.data.role}
            </p>
          </header>

          {/* Candidate Info */}
          <section className="mb-8 text-gray-800">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 border-b pb-2",
                headingFont
              )}
            >
              Candidate Information
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm">Name</p>
                  <p className="font-medium">{interview?.data.candidate}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm">Company</p>
                  <p className="font-medium">{interview?.data.company}</p>
                </div>
              </div>
              <div className="flex items-center">
                <UserCircle className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm">Role</p>
                  <p className="font-medium">{interview?.data.role}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Overall Performance */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                headingFont
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
                    {report.overallScore}%
                  </p>
                  <p className="text-gray-500">Overall Score</p>
                </div>
              </div>
              <div>
                {report.overallScore >= 80 ? (
                  <div className="flex items-center text-green-600">
                    <ThumbsUp className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">Excellent</span>
                  </div>
                ) : report.overallScore >= 60 ? (
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
              {report.generalAssessment}
            </ReactMarkdown>
          </section>

          {/* Detailed Feedback */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                headingFont
              )}
            >
              Detailed Feedback
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "Fitness for Role",
                  content: report.fitnessForRole,
                  score: report.fitnessForRoleScore,
                },
                {
                  title: "Speaking Skills",
                  content: report.speakingSkills,
                  score: report.speakingSkillsScore,
                },
                {
                  title: "Communication Skills",
                  content: report.communicationSkills,
                  score: report.communicationSkillsScore,
                },
                {
                  title: "Problem-Solving Skills",
                  content: report.problemSolvingSkills,
                  score: report.problemSolvingSkillsScore,
                },
                {
                  title: "Technical Knowledge",
                  content: report.technicalKnowledge,
                  score: report.technicalKnowledgeScore,
                },
                {
                  title: "Teamwork",
                  content: report.teamwork,
                  score: report.teamworkScore,
                },
                {
                  title: "Adaptability",
                  content: report.adaptability,
                  score: report.adaptabilityScore,
                },
              ].map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={cn(
                        "text-xl font-semibold text-gray-800",
                        headingFont
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
                headingFont
              )}
            >
              Strengths and Areas for Improvement
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 text-green-600",
                    headingFont
                  )}
                >
                  Areas of Strength
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report.areasOfStrength).map(
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
                    headingFont
                  )}
                >
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report.areasForImprovement).map(
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
                headingFont
              )}
            >
              Actionable Next Steps
            </h2>

            <ol className="space-y-4 list-decimal list-inside">
              {JSON.parse(report.actionableNextSteps).map(
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
                  headingFont
                )}
              >
                Interview Transcript
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
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
                report?.id ?? 0
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
