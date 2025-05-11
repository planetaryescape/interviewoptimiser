import { extractTextFromFile } from "@/actions/extractTextFromFile";
import { extractTextFromUrl } from "@/actions/extractTextFromUrl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { AlertCircle, FileText, HelpCircle, LinkIcon } from "lucide-react";
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
    <div>
      {/* Main Header */}
      <div className="px-8 py-6 text-center border-b border-border/60">
        <h2 className="text-2xl font-semibold mb-2">Now, let&apos;s add the job details</h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          We&apos;ll align the interview questions with the role requirements
        </p>
      </div>

      {/* Content Area */}
      <div className="p-8 md:p-10 lg:p-12">
        {/* Two column layout for larger screens, stacks on smaller screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column (Main Content - Input Methods) - Takes 3/5 of space on lg+ */}
          <div className="lg:col-span-3 space-y-8">
            {/* File Upload Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Upload job description</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                We&apos;ll extract the content automatically from PDF or Word documents
              </p>

              <div className="w-full border border-dashed border-border rounded-lg bg-background hover:bg-background/90 transition-colors duration-200">
                <FileUpload
                  files={[jobFile].filter(Boolean) as File[]}
                  label="Drop your file here"
                  description="or click to browse PDF and Word documents"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  loading={isLoading}
                />
              </div>
            </section>

            {/* URL Input Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Provide a job posting link
                </h3>
              </div>

              <p className="text-sm text-muted-foreground">
                We&apos;ll extract the content automatically from the job posting URL
              </p>

              <Input
                type="url"
                placeholder="https://example.com/job-description"
                value={jobDescriptionLink}
                onChange={(e) => setJobDescriptionLink(e.target.value)}
                className="bg-background border-border focus:ring-1 focus:ring-primary/30"
              />
            </section>

            {/* Manual Input Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Paste job description</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Include requirements, responsibilities, and any other relevant details
              </p>

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
                  "min-h-[200px] resize-none bg-background border-border focus:ring-1 focus:ring-primary/30",
                  showStep2Error && "border-destructive focus:ring-destructive/30"
                )}
                placeholder="Paste the job description here..."
              />

              {showStep2Error && (
                <p className="text-destructive text-sm font-medium">
                  Please provide the job description before continuing
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
                Sometimes we may not be able to parse text from uploaded PDFs or URLs. If the
                textbox doesn&apos;t populate shortly after uploading your document or entering a
                URL, please try copying the text and pasting it in the textbox.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/30 rounded-lg p-5 border border-border/60">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                <h3 className="text-base font-semibold">Tips for effective job descriptions</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-8 list-disc">
                <li>Include detailed requirements and qualifications</li>
                <li>List key responsibilities and daily tasks</li>
                <li>Mention technical skills, tools, and technologies required</li>
                <li>Include information about the team structure if available</li>
                <li>
                  The more detailed the job description, the more relevant your mock interview will
                  be
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
