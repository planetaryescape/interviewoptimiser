import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type InterviewType,
  useCreateInterviewActions,
  useCreateInterviewAdditionalInfo,
  useCreateInterviewDuration,
  useCreateInterviewInterviewType,
} from "@/stores/createInterviewStore";
import {
  type InterviewType as ConversationInterviewType,
  interviewTypes,
} from "@/utils/conversation_config";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { config } from "~/config";

export function Step3AdditionalInfo() {
  const additionalInfo = useCreateInterviewAdditionalInfo();
  const { setAdditionalInfo } = useCreateInterviewActions();
  const interviewType = useCreateInterviewInterviewType();
  const { setInterviewType } = useCreateInterviewActions();
  const duration = useCreateInterviewDuration();
  const { setDuration } = useCreateInterviewActions();

  const selectedInterviewType =
    interviewTypes.find((type) => type.type.toLowerCase().replace(/\s+/g, "_") === interviewType) ||
    interviewTypes.find((type) => type.type.toLowerCase().replace(/\s+/g, "_") === "behavioral");

  return (
    <div className="space-y-6 bg-card rounded-xl border shadow-md overflow-hidden">
      {/* Main Header */}
      <div className="px-6 pt-8 pb-6 text-center border-b">
        <h2 className="text-2xl font-semibold mb-2">Finally, let&apos;s customize the interview</h2>
        <p className="text-base text-muted-foreground">
          Configure the interview settings to match your requirements
        </p>
      </div>

      {/* Interview Type and Duration Section */}
      <div className="px-6 py-8 space-y-8 border-b">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Interview Settings</h3>
            <p className="text-sm text-muted-foreground">
              Choose the interview type and duration that best fits your needs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="interview-type" className="text-sm font-medium block mb-1.5">
                Interview Type
              </Label>
              <p className="text-sm text-muted-foreground mb-3">Choose the style that best fits</p>
              <Select
                value={interviewType}
                onValueChange={(value) => {
                  setInterviewType(value as InterviewType);
                }}
              >
                <SelectTrigger
                  id="interview-type"
                  className="bg-background/80 hover:bg-background/90 transition-colors duration-200"
                >
                  <SelectValue placeholder="Select an interview type" />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((type) => (
                    <SelectItem
                      key={type.type}
                      value={type.type.toLowerCase().replace(/\s+/g, "_")}
                    >
                      {type.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interview-duration" className="text-sm font-medium block mb-1.5">
                Duration
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Longer interviews are more thorough
              </p>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(Number.parseInt(value))}
              >
                <SelectTrigger
                  id="interview-duration"
                  className="bg-background/80 hover:bg-background/90 transition-colors duration-200"
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
            </div>
          </div>

          {selectedInterviewType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-muted/50 p-6 space-y-6 h-fit"
            >
              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  About {selectedInterviewType.type} Interviews
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedInterviewType.description}
                </p>
              </div>
              <InterviewExamples type={selectedInterviewType} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Special Instructions Section */}
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary shadow-sm shadow-primary/50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Special Instructions</h3>
            <p className="text-sm text-muted-foreground">
              Add any specific requirements or preferences for the interview (optional)
            </p>
          </div>
        </div>

        <Textarea
          value={additionalInfo}
          maxLength={config.maxTextLengths.additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="min-h-[300px] resize-none bg-background/80 rounded-xl transition-colors duration-200 hover:bg-background/90"
          placeholder={
            "Examples:\n- Conduct the interview in French\n- Use British English\n- Focus on leadership experience\n- Include questions about specific projects"
          }
        />
      </div>
    </div>
  );
}

interface InterviewExamplesProps {
  type: ConversationInterviewType;
}

function InterviewExamples({ type }: InterviewExamplesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )}
        />
        {isExpanded ? "Hide" : "Show"} example questions
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {type.exampleQuestions.map((question: string, index: number) => (
                <motion.div
                  key={`${question.slice(0, 20)}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20"
                >
                  {question}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
