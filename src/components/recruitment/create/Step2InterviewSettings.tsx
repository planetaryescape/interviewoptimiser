"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { interviewTypes as allInterviewTypeDefinitions } from "@/fixtures/interview-types";
import { useRecruitmentCreateStore } from "@/stores/recruitmentCreateStore";
import { AlertCircle, Clock, HelpCircle } from "lucide-react";
import type React from "react";
import type { InterviewType } from "~/db/schema/interviews";

const Step2InterviewSettings = () => {
  const { interviewType, setInterviewType, duration, setDuration } = useRecruitmentCreateStore();

  const handleInterviewTypeChange = (value: string) => {
    setInterviewType(value as InterviewType);
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number.parseInt(event.target.value, 10);
    if (!Number.isNaN(newDuration) && newDuration >= 5 && newDuration <= 180) {
      setDuration(newDuration);
    } else if (event.target.value === "") {
      setDuration(0); // Or some other indicator for empty/invalid that you handle
    }
  };

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Step 2: Interview Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the type and duration for the interview.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column (Settings) - Takes 3/5 of space on lg+ */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interview-type" className="text-base font-medium">
                  Interview Type
                </Label>
                <Select value={interviewType} onValueChange={handleInterviewTypeChange}>
                  <SelectTrigger id="interview-type" className="w-full">
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allInterviewTypeDefinitions.map((typeDef) => (
                      <SelectItem key={typeDef.type} value={typeDef.type}>
                        {typeDef.type.charAt(0).toUpperCase() +
                          typeDef.type.slice(1).replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {interviewType && (
                  <p className="text-xs text-muted-foreground">
                    {allInterviewTypeDefinitions.find((t) => t.type === interviewType)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview-duration" className="text-base font-medium">
                  Interview Duration (minutes)
                </Label>
                <Input
                  id="interview-duration"
                  type="number"
                  min={5}
                  max={180}
                  value={duration || ""}
                  onChange={handleDurationChange}
                  className="w-full"
                  placeholder="Enter duration"
                />
                <p className="text-xs text-muted-foreground">
                  Enter duration between 5 and 180 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Guidance & Information) - Takes 2/5 of space on lg+ */}
          <div className="lg:col-span-2 space-y-8">
            <Alert className="bg-muted/50 border-amber-200/30">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-foreground">Interview Settings</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Choose the interview type that best matches your needs and set an appropriate
                duration. Different interview types will generate different kinds of questions.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/30 rounded-lg p-5 border border-border/60">
              <div className="flex items-start gap-3 mb-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <h3 className="text-base font-semibold">Duration recommendations</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-8 list-disc">
                <li>15-30 minutes for initial screening interviews</li>
                <li>30-60 minutes for standard technical interviews</li>
                <li>60-90 minutes for in-depth technical assessments</li>
                <li>90-120 minutes for senior-level or complex roles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2InterviewSettings;
