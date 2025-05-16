import { cn } from "@/lib/utils";
import type { Entity } from "@/lib/utils/formatEntity";
import { idHandler } from "@/lib/utils/idHandler";
import Image from "next/image";
import { config } from "~/config";
import type { Interview } from "~/db/schema";
import type { JobDataProps } from "./types";

interface ReportHeaderProps extends JobDataProps {
  interview?: Entity<Interview>;
}

/**
 * Report header component displaying report title, logo, and candidate information
 */
export function ReportHeader({ job, interview, headingFont }: ReportHeaderProps) {
  return (
    <header className="mb-16">
      <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-6">
          <Image
            src="/logo.png"
            alt={`${config.projectName} Logo`}
            width={48}
            height={48}
            className="opacity-90"
          />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 font-medium">
              Confidential Assessment
            </span>
            <h1 className={cn("text-xl font-semibold text-slate-800 tracking-tight", headingFont)}>
              Interview Performance Evaluation
            </h1>
          </div>
        </div>
        <div className="text-right bg-slate-50 px-4 py-2 rounded-sm border border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1">Reference</p>
          <p className="text-sm font-mono text-slate-700">
            IO-{idHandler.encode(job?.sys.id ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-8 gap-y-0 text-sm">
        <div className="col-span-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">Candidate</p>
          <p className="font-medium text-slate-800">{job?.data.candidate}</p>
        </div>
        <div className="col-span-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">Position</p>
          <p className="font-medium text-slate-800">{job?.data.role}</p>
        </div>
        <div className="col-span-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">
            Organization
          </p>
          <p className="font-medium text-slate-800">{job?.data.company}</p>
        </div>
        <div className="col-span-1 flex flex-col items-start">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">Date</p>
            <p className="font-medium text-slate-800">
              {new Date(job?.data.createdAt ?? "").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 w-full">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">
              Duration
            </p>
            <p className="font-medium text-slate-800">{interview?.data.actualTime ?? 0} minutes</p>
          </div>
        </div>
      </div>
    </header>
  );
}
