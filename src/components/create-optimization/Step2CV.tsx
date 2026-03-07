"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { useExtractFile } from "@/hooks/useExtractText";
import { cn } from "@/lib/utils";
import {
  useCreateJobActions,
  useCreateJobCVText,
  useCreateJobSaveAsDefault,
} from "@/stores/createJobStore";
import * as Sentry from "@sentry/nextjs";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FileText, HelpCircle, Upload } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";
import { config } from "~/config";

interface DefaultCvResponse {
  data: {
    defaultCvText: string;
    defaultCvFilename: string | null;
  } | null;
}

export function Step2CV() {
  const cvText = useCreateJobCVText();
  const saveAsDefault = useCreateJobSaveAsDefault();
  const { setCVText, setSaveAsDefault, setCvFilename } = useCreateJobActions();
  const [cvFile, setCVFile] = useState<File | null>(null);
  const [showStep2Error, setShowStep2Error] = useState(false);
  const posthog = usePostHog();

  const extractFileMutation = useExtractFile();
  const isLoading = extractFileMutation.isPending;

  const { data: defaultCvData } = useQuery<DefaultCvResponse>({
    queryKey: ["default-cv"],
    queryFn: async () => {
      const response = await fetch("/api/users/default-cv");
      if (!response.ok) throw new Error("Failed to fetch default CV");
      return response.json();
    },
  });

  const hasDefaultCv = !!defaultCvData?.data?.defaultCvText;

  const handleLoadDefaultCv = () => {
    if (defaultCvData?.data?.defaultCvText) {
      setCVText(defaultCvData.data.defaultCvText);
      setCvFilename(defaultCvData.data.defaultCvFilename ?? null);
      setShowStep2Error(false);
      posthog.capture("default_cv_loaded");
      toast.success("Default CV loaded");
    }
  };

  const handleFileChange = async (files: File[]) => {
    if (files.length === 0) {
      setCVFile(null);
      setCVText("");
      return;
    }

    if (files?.[0]) {
      const file = files[0];
      const fileType = file.type;
      const startTime = Date.now();

      if (
        fileType === "application/pdf" ||
        fileType === "application/msword" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const formData = new FormData();
        formData.append("file", file);

        extractFileMutation.mutate(formData, {
          onSuccess: (data) => {
            const extractedText = data.data.extractedText;
            if (extractedText?.trim()) {
              setCVText(extractedText);
              setCVFile(file);
              setCvFilename(file.name);
              setShowStep2Error(false);

              posthog.capture("cv_uploaded", {
                fileSize: file.size,
                fileType: file.type,
                uploadMethod: "drag_drop",
                timeToUpload: Date.now() - startTime,
              });
            } else {
              toast.error(
                "Failed to parse the CV. Please try again or paste the content manually.",
                {
                  position: "top-center",
                  richColors: true,
                  duration: 10000,
                }
              );

              posthog.capture("error_encountered", {
                errorType: "cv_parsing_failed",
                errorMessage: "Failed to extract text from file",
                userAction: "cv_upload",
                resolved: false,
              });
            }
          },
          onError: (error) => {
            Sentry.withScope((scope) => {
              scope.setExtra("context", "handleFileChange");
              scope.setExtra("error", error);
              Sentry.captureException(error);
            });
            toast.error("An error occurred while processing the file. Please try again.");

            posthog.capture("error_encountered", {
              errorType: "cv_upload_error",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
              userAction: "cv_upload",
              resolved: false,
            });
          },
        });
      } else {
        toast.error("Please upload only PDF or Word documents.");

        posthog.capture("error_encountered", {
          errorType: "invalid_file_type",
          errorMessage: `Unsupported file type: ${fileType}`,
          userAction: "cv_upload",
          resolved: false,
        });
      }
    }
  };

  return (
    <div>
      {/* Main Header */}
      <div className="px-8 py-6 text-center border-b border-border/60">
        <h2 className="text-2xl font-semibold mb-2">Now, let&apos;s add your CV</h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          We&apos;ll use your CV to understand your experience and tailor the interview experience
          to your skills and experience.
        </p>
      </div>

      {/* Content Area */}
      <div className="p-8 md:p-10 lg:p-12">
        {/* Two column layout for larger screens, stacks on smaller screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column (Main Content - File Upload & Text Input) - Takes 3/5 of space on lg+ */}
          <div className="lg:col-span-3 space-y-8">
            {/* Default CV Button */}
            {hasDefaultCv && !cvText && (
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Use your saved default CV</p>
                  {defaultCvData?.data?.defaultCvFilename && (
                    <p className="text-xs text-muted-foreground">
                      {defaultCvData.data.defaultCvFilename}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLoadDefaultCv}>
                  Use Default CV
                </Button>
              </div>
            )}

            {/* File Upload Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Upload your document</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                We&apos;ll extract the content automatically from PDF or Word documents
              </p>

              <div className="w-full border border-dashed border-border rounded-lg bg-background hover:bg-background/90 transition-colors duration-200">
                <FileUpload
                  files={[cvFile].filter(Boolean) as File[]}
                  label="Drop your file here"
                  description="or click to browse PDF and Word documents"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  loading={isLoading}
                />
              </div>
            </section>

            {/* Manual Input Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Paste your CV content</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Include your work experience, education, skills, and other relevant information
              </p>

              <Textarea
                value={cvText}
                maxLength={config.maxTextLengths.cv}
                onChange={(e) => {
                  setCVText(e.target.value);
                  if (e.target.value?.trim()) {
                    setShowStep2Error(false);
                  }
                }}
                className={cn(
                  "min-h-[200px] resize-none bg-background border-border focus:ring-1 focus:ring-primary/30",
                  showStep2Error && "border-destructive focus:ring-destructive/30"
                )}
                placeholder="Paste your CV content here..."
              />

              {showStep2Error && (
                <p className="text-destructive text-sm font-medium">
                  Please provide your CV content before continuing
                </p>
              )}

              {/* Save as Default Checkbox */}
              {cvText?.trim() && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-default-cv"
                    checked={saveAsDefault}
                    onCheckedChange={(checked) => setSaveAsDefault(checked === true)}
                  />
                  <label
                    htmlFor="save-default-cv"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Save as my default CV for future interviews
                  </label>
                </div>
              )}
            </section>
          </div>

          {/* Right Column (Guidance & Information) - Takes 2/5 of space on lg+ */}
          <div className="lg:col-span-2 space-y-8">
            <Alert className="bg-muted/50 border-amber-200/30">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-foreground">Parsing Notice</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Sometimes we may not be able to parse text from uploaded PDFs. If the textbox
                doesn&apos;t populate shortly after uploading your document, please try copying the
                text from your document and pasting it in the textbox.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/30 rounded-lg p-5 border border-border/60">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                <h3 className="text-base font-semibold">Tips for a great job profile</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-8 list-disc">
                <li>
                  Include all relevant work experience, even if it doesn&apos;t seem directly
                  related
                </li>
                <li>Be specific about your achievements, skills and responsibilities</li>
                <li>Make sure to include education, certifications, and technical skills</li>
                <li>
                  The more detailed your CV, the more tailored your interview experience will be
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
