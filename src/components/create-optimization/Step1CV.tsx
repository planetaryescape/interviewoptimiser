import { extractTextFromFile } from "@/actions/extractTextFromFile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateJobActions, useCreateJobCVText } from "@/stores/createJobStore";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, FileText, HelpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { config } from "~/config";

export function Step1CV() {
  const cvText = useCreateJobCVText();
  const { setCVText } = useCreateJobActions();
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
    <div>
      {/* Main Header */}
      <div className="px-8 py-6 text-center border-b border-border/60">
        <h2 className="text-2xl font-semibold mb-2">Let&apos;s start with your CV</h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          We&apos;ll use your CV to understand your experience and tailor the job profile to your
          skills and experience.
        </p>
      </div>

      {/* Content Area */}
      <div className="p-8 md:p-10 lg:p-12">
        {/* Two column layout for larger screens, stacks on smaller screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column (Main Content - File Upload & Text Input) - Takes 3/5 of space on lg+ */}
          <div className="lg:col-span-3 space-y-8">
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
                    setShowStep1Error(false);
                  }
                }}
                className={cn(
                  "min-h-[200px] resize-none bg-background border-border focus:ring-1 focus:ring-primary/30",
                  showStep1Error && "border-destructive focus:ring-destructive/30"
                )}
                placeholder="Paste your CV content here..."
              />

              {showStep1Error && (
                <p className="text-destructive text-sm font-medium">
                  Please provide your CV content before continuing
                </p>
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
