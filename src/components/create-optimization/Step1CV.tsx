import { extractTextFromFile } from "@/actions/extractTextFromFile";
import { FileUpload } from "@/components/ui/file-upload";
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
    <div className="space-y-6 bg-card rounded-xl border shadow-md overflow-hidden">
      {/* Main Header */}
      <div className="px-6 pt-8 pb-6 text-center border-b">
        <h2 className="text-2xl font-semibold mb-2">Let&apos;s start with your CV</h2>
        <p className="text-base text-muted-foreground">
          We&apos;ll use your CV to understand your experience and tailor the interview questions
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
            Sometimes we may not be able to parse text from uploaded PDFs. If the textbox
            doesn&apos;t populate shortly after uploading your document, please try copying the text
            from your document and pasting it in the textbox below.
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="px-6 py-8 space-y-6 border-b">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Upload your document</h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ll extract the content automatically from PDF or Word documents
            </p>
          </div>
        </div>

        <div className="w-full border-2 border-dashed border-muted/60 rounded-xl bg-background/80 hover:bg-background/90 transition-colors duration-200">
          <FileUpload
            files={[cvFile].filter(Boolean) as File[]}
            label="Drop your file here"
            description="or click to browse PDF and Word documents"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Manual Input Section */}
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Paste your CV content</h3>
            <p className="text-sm text-muted-foreground">
              Include your work experience, education, and skills
            </p>
          </div>
        </div>

        <Textarea
          value={cvText}
          maxLength={config.maxTextLengths.cv}
          onChange={(e) => {
            setCVText(e.target.value);
            if (e.target.value?.trim()) {
              setShowStep1Error(false);
            }
          }}
          className={cn(
            "min-h-[300px] resize-none bg-background/80 rounded-xl transition-colors duration-200 hover:bg-background/90",
            showStep1Error && "border-destructive"
          )}
          placeholder="Paste your CV content here..."
        />

        {showStep1Error && (
          <p className="text-destructive text-sm text-center font-medium">
            Please provide your CV content before continuing
          </p>
        )}
      </div>
    </div>
  );
}
