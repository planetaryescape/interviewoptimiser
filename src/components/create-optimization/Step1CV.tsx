import { extractTextFromFile } from "@/actions/extractTextFromFile";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateInterviewActions, useCreateInterviewCVText } from "@/stores/createInterviewStore";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { config } from "~/config";

export function Step1CV() {
  const cvText = useCreateInterviewCVText();
  const { setCVText } = useCreateInterviewActions();
  const [cvFile, setCVFile] = useState<File | null>(null);
  const [showStep1Error, setShowStep1Error] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (files: File[]) => {
    if (files.length === 0) {
      setCVFile(null);
      setCVText("");
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
            setCVText(extractedText);
            setCVFile(file);
            setShowStep1Error(false);
          } else {
            toast.error("Failed to parse the CV. Please try again or paste the content manually.", {
              position: "top-center",
              richColors: true,
              duration: 10000,
            });
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
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-sm font-medium">
            Upload your CV or paste its content below - this helps us understand your background
          </p>
        </div>
        <div className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg bg-white dark:bg-black">
          <FileUpload
            files={[cvFile].filter(Boolean) as File[]}
            label="Upload your CV (PDF or Word)"
            description="Drag and drop your file here or click to upload"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            loading={isLoading}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Note: Sometimes we may not be able to parse text from uploaded PDFs. If the textbox
          doesn&apos;t populate shortly after uploading your document, please try copying the text
          from your document and pasting it below.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="cv-paste" className="text-base">
            Or paste your CV
          </Label>
          <span className="text-sm text-muted-foreground">
            Include work experience, education, and skills
          </span>
        </div>
        <Textarea
          id="cv-paste"
          value={cvText}
          maxLength={config.maxTextLengths.cv}
          onChange={(e) => {
            setCVText(e.target.value);
            if (e.target.value?.trim()) {
              setShowStep1Error(false);
            }
          }}
          className={cn("min-h-[400px] h-full resize-none", showStep1Error && "border-destructive")}
          placeholder="Paste your CV content here..."
        />
        {showStep1Error && (
          <p className="text-destructive text-sm">
            Please upload or paste your CV before proceeding.
          </p>
        )}
      </div>
    </div>
  );
}
