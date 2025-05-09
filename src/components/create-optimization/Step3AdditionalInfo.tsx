import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import {
  type InterviewType,
  useCreateInterviewActions,
  useCreateInterviewAdditionalInfo,
  useCreateInterviewDuration,
  useCreateInterviewInterviewType,
} from "@/stores/createInterviewStore";
import { interviewTypes } from "@/utils/conversation_config";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, CreditCard, MessageSquare, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { config } from "~/config";

export function Step3AdditionalInfo() {
  const additionalInfo = useCreateInterviewAdditionalInfo();
  const { setAdditionalInfo } = useCreateInterviewActions();
  const interviewType = useCreateInterviewInterviewType();
  const { setInterviewType } = useCreateInterviewActions();
  const duration = useCreateInterviewDuration();
  const { setDuration } = useCreateInterviewActions();
  const { data: user } = useUser();
  const router = useRouter();

  const selectedInterviewType =
    interviewTypes.find((type) => type.type === interviewType) ||
    interviewTypes.find((type) => type.type === "behavioral");

  const [isExamplesExpanded, setIsExamplesExpanded] = useState(true);

  // Check if user has enough minutes for the selected duration
  const hasEnoughMinutes = user && user.minutes >= duration;

  return (
    <div>
      {/* Main Header */}
      <div className="px-8 py-6 text-center border-b border-border/60">
        <h2 className="text-2xl font-semibold mb-2">Finally, let&apos;s customize the interview</h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Configure the interview settings to match your requirements
        </p>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-10 lg:p-12">
        {/* Two column layout for larger screens, stacks on smaller screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Interview Settings Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Interview Settings</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Choose the interview type and duration that best fits your needs
              </p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="interview-type" className="text-sm font-medium mb-1.5 block">
                    Interview Type
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Choose the interview style that best fits your goals
                  </p>
                  <Select
                    value={interviewType}
                    onValueChange={(value) => {
                      setInterviewType(value as InterviewType);
                    }}
                  >
                    <SelectTrigger id="interview-type" className="bg-background border-border">
                      <SelectValue placeholder="Select an interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewTypes.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.type
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="interview-duration" className="text-sm font-medium">
                      Duration
                    </Label>

                    {/* Minutes Display - Toned down with Top Up button */}
                    {user && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 py-1 px-2 rounded-md border border-border/60 bg-background/80">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Available:</span>
                          <Badge
                            variant={hasEnoughMinutes ? "default" : "destructive"}
                            className="font-medium text-xs py-0 h-5"
                          >
                            {user.minutes} minutes
                          </Badge>
                        </div>
                        <Link
                          href="/pricing"
                          className="h-7 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/5 cursor-pointer inline-flex items-center rounded-md"
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Top up
                        </Link>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    Longer interviews are more thorough but cost more minutes
                  </p>
                  <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number.parseInt(value))}
                  >
                    <SelectTrigger
                      id="interview-duration"
                      className={cn(
                        "bg-background border-border",
                        !hasEnoughMinutes && "border-destructive/50 text-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select interview duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>

                  {!hasEnoughMinutes && (
                    <p className="text-destructive text-xs mt-1 flex items-center">
                      <span>You don&apos;t have enough minutes.</span>
                      <Link
                        href="/pricing"
                        className="ml-1 text-xs text-destructive hover:text-destructive/90 underline cursor-pointer"
                      >
                        Top up now
                      </Link>
                    </p>
                  )}
                </div>

                {/* Duration Guide - Now located closer to duration selection */}
                <div className="bg-muted/30 rounded-lg border border-border/60 p-5">
                  <div className="flex items-start gap-2.5 mb-4">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-base">Duration Guide</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose a duration that matches your needs:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 text-primary px-3 py-2 rounded w-[90px] text-center flex-shrink-0">
                        <span className="text-sm font-medium">3-5 min</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Quick practice with basic questions
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 text-primary px-3 py-2 rounded w-[90px] text-center flex-shrink-0">
                        <span className="text-sm font-medium">10-15 min</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Standard practice with more depth
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 text-primary px-3 py-2 rounded w-[90px] text-center flex-shrink-0">
                        <span className="text-sm font-medium">20-30 min</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Thorough preparation with detailed questions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Special Instructions</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Add any specific requirements or preferences for the interview (optional)
              </p>

              <Textarea
                value={additionalInfo}
                maxLength={config.maxTextLengths.additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="min-h-[180px] resize-none bg-background border-border"
                placeholder={
                  "Examples:\n- Conduct the interview in French\n- Use British English\n- Focus on leadership experience\n- Include questions about specific projects"
                }
              />

              <p className="text-xs text-muted-foreground mt-2">
                Special instructions are optional but help tailor the interview to your specific
                needs
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {selectedInterviewType && (
              <div className="bg-muted/30 rounded-lg border border-border/60 overflow-hidden">
                <div className="p-5">
                  <h4 className="font-medium text-base mb-2">
                    About{" "}
                    {selectedInterviewType.type
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}{" "}
                    Interviews
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedInterviewType.description}
                  </p>
                </div>

                <div className="border-t border-border/60 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setIsExamplesExpanded(!isExamplesExpanded)}
                    className="flex items-center text-sm font-medium text-primary"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 mr-1.5",
                        isExamplesExpanded ? "rotate-180" : ""
                      )}
                    />
                    {isExamplesExpanded ? "Hide" : "Show"} example questions
                  </button>
                </div>

                <AnimatePresence>
                  {isExamplesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/60 overflow-hidden"
                    >
                      <div className="px-5 py-3 space-y-3">
                        {selectedInterviewType.exampleQuestions
                          .slice(0, 5)
                          .map((question, index) => (
                            <motion.div
                              key={`question-${question.slice(0, 20)}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/20"
                            >
                              {question}
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Up Modal - removed in favor of direct link */}
    </div>
  );
}
