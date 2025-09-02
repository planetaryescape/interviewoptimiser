import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJobActions, useCreateJobAdditionalInfo } from "@/stores/createJobStore";
import { config } from "~/config";

export function Step3AdditionalInfo() {
  const additionalInfo = useCreateJobAdditionalInfo();
  const { setAdditionalInfo } = useCreateJobActions();

  return (
    <div>
      {/* Main Header */}
      <div className="px-8 py-6 text-center border-b border-border/60">
        <h2 className="text-2xl font-semibold mb-2">Finally, let&apos;s customize the job</h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Add any special instructions for your interview
        </p>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-10 lg:p-12">
        <div className="max-w-2xl mx-auto">
          {/* Special Instructions Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Special Instructions</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              Add any specific requirements or preferences for the interviews (optional)
            </p>

            <Textarea
              value={additionalInfo}
              maxLength={config.maxTextLengths.additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[120px] resize-none bg-background border-border"
              placeholder={
                "Examples:\n- Use British English\n- Focus on leadership experience\n- Include questions about specific projects"
              }
            />

            <p className="text-xs text-muted-foreground mt-2">
              Special instructions are optional but help tailor interviews to your specific needs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
