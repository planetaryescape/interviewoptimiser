import { extractTextFromFile } from "@/actions/extractTextFromFile";
import { extractTextFromUrl } from "@/actions/extractTextFromUrl";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useCreateInterviewActions,
  useCreateInterviewJobDescriptionText,
} from "@/stores/createInterviewStore";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { config } from "~/config";

export function Step2JobDescription() {
  const jobDescriptionText = useCreateInterviewJobDescriptionText();
  const { setJobDescriptionText } = useCreateInterviewActions();
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobDescriptionLink, setJobDescriptionLink] = useState("");
  const [showStep2Error, setShowStep2Error] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedJobDescriptionLink = useDebounce(jobDescriptionLink, 300);

  useEffect(() => {
    const getJobDescriptionText = async () => {
      if (!debouncedJobDescriptionLink) return;

      setIsLoading(true);
      try {
        const extractedText = await extractTextFromUrl(debouncedJobDescriptionLink);
        if (extractedText?.trim()) {
          setJobDescriptionText(extractedText);
          setShowStep2Error(false);
        } else {
          toast.error(
            "Failed to extract text from the provided URL. Please try again or paste the content manually."
          );
        }
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setExtra("context", "getJobDescriptionText");
          scope.setExtra("url", debouncedJobDescriptionLink);
          scope.setExtra("error", error);
          Sentry.captureException(error);
        });
        toast.error(
          "Failed to extract text from the provided URL. Please try again or paste the content manually."
        );
      } finally {
        setIsLoading(false);
      }
    };

    getJobDescriptionText();
  }, [debouncedJobDescriptionLink, setJobDescriptionText]);

  const handleFileChange = async (files: File[]) => {
    if (files.length === 0) {
      setJobFile(null);
      setJobDescriptionText("");
      return;
    }

    if (files?.[0]) {
      setIsLoading(true);
      const file = files[0];
      const fileType = file.type;
      if (
        fileType === "application/pdf" ||
        fileType === "application/msword" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const extractedText = await extractTextFromFile(formData);

          if (extractedText?.trim()) {
            setJobDescriptionText(extractedText);
            setJobFile(file);
            setShowStep2Error(false);
          } else {
            toast.error(
              "Failed to parse the job description. Please try again or paste the content manually."
            );
          }
        } catch (error) {
          Sentry.withScope((scope) => {
            scope.setExtra("context", "handleFileChange");
            scope.setExtra("error", error);
            Sentry.captureException(error);
          });
          toast.error("An error occurred while processing the file. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Please upload only PDF or Word documents.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 bg-card rounded-xl border shadow-md overflow-hidden">
      {/* Main Header */}
      <div className="px-6 pt-8 pb-6 text-center border-b">
        <h2 className="text-2xl font-semibold mb-2">Now, let&apos;s add the job details</h2>
        <p className="text-base text-muted-foreground">
          We&apos;ll align the interview questions with the role requirements
        </p>
      </div>

      {/* Warning Notice */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <span aria-hidden="true" role="presentation">
              <svg
                className="w-5 h-5 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Information</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sometimes we may not be able to parse text from uploaded PDFs or URLs. If the textbox
            doesn&apos;t populate shortly after uploading your document or entering a URL, please
            try copying the text and pasting it in the textbox below.
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="px-6 py-8 space-y-6 border-b">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Upload job description</h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ll extract the content automatically from PDF or Word documents
            </p>
          </div>
        </div>

        <div className="w-full border-2 border-dashed border-muted/60 rounded-xl bg-background/80 hover:bg-background/90 transition-colors duration-200">
          <FileUpload
            files={[jobFile].filter(Boolean) as File[]}
            label="Drop your file here"
            description="or click to browse PDF and Word documents"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            loading={isLoading}
          />
        </div>
      </div>

      {/* URL Input Section */}
      <div className="px-6 py-8 space-y-6 border-b">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Provide a link</h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ll extract the content automatically from the job posting URL
            </p>
          </div>
        </div>

        <Input
          type="url"
          placeholder="https://example.com/job-description"
          value={jobDescriptionLink}
          onChange={(e) => setJobDescriptionLink(e.target.value)}
          className="bg-background/80 rounded-xl transition-colors duration-200 hover:bg-background/90"
        />
      </div>

      {/* Manual Input Section */}
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Paste job description</h3>
            <p className="text-sm text-muted-foreground">
              Include requirements and responsibilities
            </p>
          </div>
        </div>

        <Textarea
          value={jobDescriptionText}
          maxLength={config.maxTextLengths.jobDescription}
          onChange={(e) => {
            setJobDescriptionText(e.target.value);
            if (e.target.value?.trim()) {
              setShowStep2Error(false);
            }
          }}
          className={cn(
            "min-h-[300px] resize-none bg-background/80 rounded-xl transition-colors duration-200 hover:bg-background/90",
            showStep2Error && "border-destructive"
          )}
          placeholder="Paste the job description here..."
        />

        {showStep2Error && (
          <p className="text-destructive text-sm text-center font-medium">
            Please provide the job description before continuing
          </p>
        )}
      </div>
    </div>
  );
}
