"use client";

import { AlertCircle, HelpCircle } from "lucide-react";
import type React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecruitmentCreateStore } from "@/stores/recruitmentCreateStore";

const Step1JobDescription = () => {
  const { jobDescriptionText, setJobDescriptionText } = useRecruitmentCreateStore();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescriptionText(event.target.value);
  };

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Step 1: Job Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste the full job description below. This will be used to generate relevant interview
            questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column (Job Description Input) - Takes 3/5 of space on lg+ */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-description" className="text-base font-medium">
                Job Description Content
              </Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                value={jobDescriptionText}
                onChange={handleTextChange}
                rows={12}
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters. The more detailed the description, the better the generated
                questions will be.
              </p>
            </div>
          </div>

          {/* Right Column (Guidance & Information) - Takes 2/5 of space on lg+ */}
          <div className="lg:col-span-2 space-y-8">
            <Alert className="bg-muted/50 border-amber-200/30">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-foreground">Job Description Tips</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                The quality of the generated interview questions depends on the detail in your job
                description. Include specific skills, responsibilities, and requirements.
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
                  The more detailed the job description, the more relevant the interview questions
                  will be
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1JobDescription;
