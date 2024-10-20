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
    <div className="space-y-4 w-full">
      <div className="space-y-4">
        <Label htmlFor="additional-info">
          Additional Information or Instructions
        </Label>
        <Select value={interviewType} onValueChange={setInterviewType}>
          <SelectTrigger>
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

        <Select
          value={duration.toString()}
          onValueChange={(value) => setDuration(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an interview duration" />
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

        <Textarea
          id="additional-info"
          value={additionalInfo}
          maxLength={config.maxTextLengths.additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
}
