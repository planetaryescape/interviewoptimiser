import { Shield } from "lucide-react";
import SectionWrapper from "../ui/SectionWrapper";

export default function SocialProofBar() {
  return (
    <SectionWrapper className="py-8 bg-muted/30">
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
        {/* Compliance badges */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span className="font-medium">SOC 2 Type II (In Progress)</span>
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />

        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span className="font-medium">GDPR Compliant</span>
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />

        {/* User trust element */}
        <div className="text-center md:text-left text-muted-foreground">
          <p className="font-medium">
            Trusted by 120+ Professionals to Sharpen Their Interview Skills
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
