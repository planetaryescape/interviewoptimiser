"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface ToolbarBreadcrumbsProps {
  jobId: string;
}

export const ToolbarBreadcrumbs = React.memo(function ToolbarBreadcrumbs({
  jobId,
}: ToolbarBreadcrumbsProps) {
  return (
    <div className="px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center text-sm text-muted-foreground max-w-5xl mx-auto w-full">
        <Link
          href="/dashboard/jobs"
          className="flex items-center hover:text-foreground transition-colors"
        >
          Jobs
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link
          href={`/dashboard/jobs/${jobId}/interviews`}
          className="hover:text-foreground transition-colors"
        >
          Interviews
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Report Preview</span>
      </div>
    </div>
  );
});
