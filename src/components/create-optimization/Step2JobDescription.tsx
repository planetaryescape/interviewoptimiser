import { extractTextFromFile } from "@/actions/extractTextFromFile";
import { extractTextFromUrl } from "@/actions/extractTextFromUrl";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  useCreateInterviewActions,
  useCreateInterviewJobDescriptionText,
} from "@/stores/createInterviewStore";
import * as Sentry from "@sentry/nextjs";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
        const extractedText = await extractTextFromUrl(
          debouncedJobDescriptionLink
        );
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
  }, [debouncedJobDescriptionLink]);

  const handleFileChange = async (files: File[]) => {
    if (files.length === 0) {
      setJobFile(null);
      setJobDescriptionText("");
      return;
    }

    if (files && files[0]) {
      setIsLoading(true);
      const file = files[0];
      const fileType = file.type;
      if (
        fileType === "application/pdf" ||
        fileType === "application/msword" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          toast.error(
            "An error occurred while processing the file. Please try again."
          );
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
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-sm font-medium">
            Share the job posting - we&apos;ll align the interview questions
            with the role requirements
          </p>
        </div>
        <div className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg bg-white dark:bg-black">
          <FileUpload
            files={[jobFile].filter(Boolean) as File[]}
            label="Upload Job Description (PDF or Word)"
            description="Drag and drop your file here or click to upload"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            loading={isLoading}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Note: Sometimes we may not be able to parse text from uploaded PDFs.
          If the textbox doesn&apos;t populate shortly after uploading your
          document, please try copying the text from your document and pasting
          it below.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="job-link" className="text-base">
            Or provide a link to the job posting
          </Label>
          <span className="text-sm text-muted-foreground">
            We&apos;ll extract the content automatically
          </span>
        </div>
        <Input
          id="job-link"
          type="url"
          placeholder="https://example.com/job-description"
          value={jobDescriptionLink}
          onChange={(e) => setJobDescriptionLink(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="job-paste" className="text-base">
            Or paste the job description
          </Label>
          <span className="text-sm text-muted-foreground">
            Include requirements and responsibilities
          </span>
        </div>
        <Textarea
          id="job-paste"
          value={jobDescriptionText}
          maxLength={config.maxTextLengths.jobDescription}
          onChange={(e) => {
            setJobDescriptionText(e.target.value);
            if (e.target.value?.trim()) {
              setShowStep2Error(false);
            }
          }}
          className={cn(
            "min-h-[400px] h-full resize-none",
            showStep2Error && "border-destructive"
          )}
          placeholder="Paste the job description content here..."
        />
        {showStep2Error && (
          <p className="text-destructive text-sm">
            Please provide the job description before proceeding.
          </p>
        )}
      </div>
    </div>
  );
}
