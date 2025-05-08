import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function RecruiterROIBand() {
  const roiData = [
    {
      metric: "Time‑to‑Hire",
      typical: "38 days",
      withIO: "24–28 days",
      improvement: "Up to 37%",
    },
    {
      metric: "Recruiter Hours / Hire",
      typical: "3.5 hrs",
      withIO: "< 0.4 hrs",
      improvement: "Over 80%",
    },
    {
      metric: "Candidate Experience",
      typical: "Variable",
      withIO: "Consistently Positive & Fair",
      improvement: "Enhanced Brand",
    },
  ];

  return (
    <SectionWrapper>
      <SectionTitle>Recruiter ROI</SectionTitle>

      <div className="mt-8 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Typical Hiring Process</TableHead>
              <TableHead>With Interview Optimiser (Projected)</TableHead>
              <TableHead>Potential Improvement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roiData.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell>{row.typical}</TableCell>
                <TableCell className="font-medium">{row.withIO}</TableCell>
                <TableCell className="font-medium text-primary">{row.improvement}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Illustrative ROI based on typical hiring metrics and Interview Optimiser&apos;s automation
          capabilities. Let&apos;s estimate yours →
        </p>
        <Button asChild>
          <Link href="#contact-form">Estimate My ROI</Link>
        </Button>
      </div>
    </SectionWrapper>
  );
}
