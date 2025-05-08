import { Server, Shield } from "lucide-react";
import SectionWrapper from "../ui/SectionWrapper";

export default function EnterpriseTrustSection() {
  return (
    <SectionWrapper className="bg-muted/20">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          {/* Compliance badges */}
          <div className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted">
                SOC 2 Type II (In Progress)
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted">
                GDPR Compliant
              </span>
            </div>
          </div>

          {/* ATS Integration */}
          <div className="flex flex-col items-center text-center">
            <Server className="h-12 w-12 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">ATS Integration</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted">
                Greenhouse
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted">
                Lever
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted">
                Workday
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-8">
          On‑premise AI inference and custom data residency options available for regulated
          industries and specific enterprise requirements.
        </p>
      </div>
    </SectionWrapper>
  );
}
