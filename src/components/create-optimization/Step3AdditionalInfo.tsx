import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateInterviewActions,
  useCreateInterviewAdditionalInfo,
  useCreateInterviewDuration,
  useCreateInterviewInterviewType,
} from "@/stores/createInterviewStore";
import { config } from "~/config";

export function Step3AdditionalInfo() {
  const additionalInfo = useCreateInterviewAdditionalInfo();
  const { setAdditionalInfo } = useCreateInterviewActions();
  const interviewType = useCreateInterviewInterviewType();
  const { setInterviewType } = useCreateInterviewActions();
  const duration = useCreateInterviewDuration();
  const { setDuration } = useCreateInterviewActions();

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

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <Label htmlFor="interview-type" className="text-sm font-medium block mb-1.5">
              Interview Type
            </Label>
            <p className="text-sm text-muted-foreground mb-3">Choose the style that best fits</p>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger
                id="interview-type"
                className="bg-background/80 hover:bg-background/90 transition-colors duration-200"
              >
                <SelectValue placeholder="Select an interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
                <SelectItem value="competency_based">Competency Based</SelectItem>
                <SelectItem value="stress">Stress</SelectItem>
                <SelectItem value="cultural_fit">Cultural Fit</SelectItem>
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
