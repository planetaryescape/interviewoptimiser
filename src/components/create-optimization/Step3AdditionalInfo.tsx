import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/lib/config";
import {
  useCreateOptimizationActions,
  useCreateOptimizationAdditionalInfo,
} from "@/stores/createOptimizationStore";

export function Step3AdditionalInfo() {
  const additionalInfo = useCreateOptimizationAdditionalInfo();
  const { setAdditionalInfo } = useCreateOptimizationActions();

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-4">
        <Label htmlFor="additional-info">
          Additional Information or Instructions
        </Label>
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
