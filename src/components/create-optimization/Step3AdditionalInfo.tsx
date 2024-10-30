import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/lib/config";
import {
  useCreateInterviewActions,
  useCreateInterviewAdditionalInfo,
  useCreateInterviewDuration,
  useCreateInterviewInterviewType,
} from "@/stores/createInterviewStore";

export function Step3AdditionalInfo() {
  const additionalInfo = useCreateInterviewAdditionalInfo();
  const { setAdditionalInfo } = useCreateInterviewActions();
  const interviewType = useCreateInterviewInterviewType();
  const { setInterviewType } = useCreateInterviewActions();
  const duration = useCreateInterviewDuration();
  const { setDuration } = useCreateInterviewActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <p className="text-sm font-medium">
          Customize your interview experience with these final settings
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="interview-type" className="text-base">
              Interview Type
            </Label>
            <span className="text-sm text-muted-foreground">
              Choose the style that best fits
            </span>
          </div>
          <Select value={interviewType} onValueChange={setInterviewType}>
            <SelectTrigger id="interview-type">
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

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="interview-duration" className="text-base">
              Duration
            </Label>
            <span className="text-sm text-muted-foreground">
              Longer interviews are more thorough
            </span>
          </div>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger id="interview-duration">
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

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="additional-info" className="text-base">
            Special Instructions
          </Label>
          <span className="text-sm text-muted-foreground">Optional</span>
        </div>
        <Textarea
          id="additional-info"
          value={additionalInfo}
          maxLength={config.maxTextLengths.additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="min-h-[300px] h-full resize-none"
          placeholder={`Examples:\n- Conduct the interview in French\n- Use British English\n- Focus on leadership experience\n- Include questions about specific projects`}
        />
      </div>
    </div>
  );
}
