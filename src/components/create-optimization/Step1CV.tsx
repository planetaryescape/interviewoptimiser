import { extractTextFromFile } from "@/app/actions/extractTextFromFile";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/lib/config";
import {
  useCreateOptimizationActions,
  useCreateOptimizationCVText,
} from "@/stores/createOptimizationStore";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export function Step1CV() {
  const cvText = useCreateOptimizationCVText();
  const { setCVText } = useCreateOptimizationActions();
  const [cvFile, setCVFile] = useState<File | null>(null);
  const [showStep1Error, setShowStep1Error] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (files: File[]) => {
    if (files.length === 0) {
      setCVFile(null);
      setCVText("");
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

          if (extractedText.trim()) {
            setCVText(extractedText);
            setCVFile(file);
            setShowStep1Error(false);
          } else {
            toast.error(
              "Failed to parse the CV. Please try again or paste the content manually.",
              {
                position: "top-center",
                richColors: true,
                duration: 10000,
              }
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
    <div className="space-y-4">
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload
          files={[cvFile].filter(Boolean) as File[]}
          label="Upload your CV (PDF or Word)"
          description="Drag or drop your file here or click to upload"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          loading={isLoading}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Note: Sometimes we may not be able to parse text from uploaded PDFs. If
        the textbox doesn&apos;t populate shortly after uploading your document,
        please try copying the text from your document and pasting it in the
        textbox below.
      </p>
      <div className="space-y-4">
        <Label htmlFor="cv-paste">Or paste your CV</Label>
        <Textarea
          id="cv-paste"
          value={cvText}
          maxLength={config.maxTextLengths.cv}
          onChange={(e) => {
            setCVText(e.target.value);
            if (e.target.value.trim()) {
              setShowStep1Error(false);
            }
          }}
          className={`min-h-[200px] ${showStep1Error ? "border-red-500" : ""}`}
        />
        {showStep1Error && (
          <p className="text-red-500 text-sm mt-1">
            Please upload or paste your CV before proceeding.
          </p>
        )}
      </div>
    </div>
  );
}
