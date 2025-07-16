import { idHandler } from "@/lib/utils/idHandler";
import { config } from "~/config";
import type { ReportDataProps } from "./types";

/**
 * Footer component for the report
 */
export function ReportFooter({ report }: Omit<ReportDataProps, "headingFont">) {
  return (
    <footer className="text-slate-500 text-xs mt-16 pt-4 border-t border-slate-200">
      <div className="flex justify-between items-center">
        <div className="text-left text-xs uppercase tracking-wider">Confidential Document</div>
        <div>
          <p className="font-mono">
            {config.projectName} •{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            • Ref: IO-{idHandler.encode(typeof report?.sys.id === "number" ? report.sys.id : 0)}
          </p>
        </div>
        <div className="text-right text-xs uppercase tracking-wider">Page 1</div>
      </div>
    </footer>
  );
}
