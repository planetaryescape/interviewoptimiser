"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecruitmentCreateStore } from "@/stores/recruitmentCreateStore";
import { AlertCircle, Loader2, PlusCircle, Sparkles, Trash2, Wand2, XCircle } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

const Step3InterviewQuestions = () => {
  const {
    jobDescriptionText,
    interviewType,
    duration,
    questions,
    isGeneratingQuestions,
    generationError,
    loadGeneratedQuestions,
    addCustomQuestion,
    updateQuestionText,
    removeQuestion,
    setIsGeneratingQuestions,
    setGenerationError,
  } = useRecruitmentCreateStore();

  const [customQuestionInput, setCustomQuestionInput] = useState("");

  const handleGenerateQuestions = async () => {
    if (!jobDescriptionText || !interviewType || duration <= 0) {
      setGenerationError(
        "Please ensure job description, interview type, and duration are set correctly before generating questions."
      );
      return;
    }

    setIsGeneratingQuestions(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/recruitment/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescriptionText, interviewType, duration }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const parsedApiResponse = await response.json();
      // API returns Entity<GeneratedQuestion[]>, where the 'data' field of the entity is the questions array.
      if (parsedApiResponse.status === "success" && Array.isArray(parsedApiResponse.data)) {
        loadGeneratedQuestions(parsedApiResponse.data);
      } else if (parsedApiResponse.status === "error") {
        throw new Error(
          parsedApiResponse.error?.message ||
            parsedApiResponse.error?.detail ||
            "API returned an error without a message."
        );
      } else {
        throw new Error("Received invalid or malformed question format from API.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setGenerationError(errorMessage);
      loadGeneratedQuestions([]); // Clear any existing generated questions on error
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAddCustomQuestion = () => {
    if (customQuestionInput.trim()) {
      addCustomQuestion(customQuestionInput.trim());
      setCustomQuestionInput("");
    }
  };

  const handleQuestionTextChange = (id: string, newText: string) => {
    updateQuestionText(id, newText);
  };

  const handleRemoveQuestion = (id: string) => {
    removeQuestion(id);
  };

  return (
    <div className="px-6 py-8 md:px-8 md:py-10">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Step 3: Interview Questions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate or manually add interview questions. You can edit them below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                {isGeneratingQuestions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Generate Questions with AI
              </Button>
              {generationError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error Generating Questions</AlertTitle>
                  <AlertDescription>{generationError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Your Questions:</h3>
              {questions.length === 0 && !isGeneratingQuestions && (
                <p className="text-sm text-muted-foreground">
                  No questions yet. Generate questions using AI or add them manually.
                </p>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Q{index + 1}
                          </span>
                          {q.isGenerated && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <Textarea
                          value={q.text}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            handleQuestionTextChange(q.id, e.target.value)
                          }
                          className="mt-2 min-h-[80px] w-full resize-none"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {q.reasoning && (
                      <div className="mt-3 rounded-md bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Reasoning:</p>
                        <p className="mt-1 text-sm text-muted-foreground">{q.reasoning}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Question */}
            <div className="mt-6 space-y-2">
              <h3 className="text-base font-medium text-foreground">Add Custom Question</h3>
              <div className="flex gap-2">
                <Textarea
                  value={customQuestionInput}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setCustomQuestionInput(e.target.value)
                  }
                  placeholder="Type your custom question here..."
                  className="flex-grow"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomQuestion}
                  disabled={!customQuestionInput.trim()}
                  className="self-end"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Alert className="bg-muted/50 border-amber-200/30">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-foreground">Interview Questions</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                You can generate AI-powered questions based on the job description or add your own
                custom questions. All questions can be edited or removed as needed.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3InterviewQuestions;
