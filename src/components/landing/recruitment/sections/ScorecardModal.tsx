"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScorecardModal({ isOpen, onClose }: ScorecardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full overflow-y-auto max-h-[90vh]">
        <div className="relative">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">Candidate Scorecard</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sample AI-generated report for a full-stack developer interview
            </DialogDescription>
            <Button
              className="absolute right-0 top-0 h-8 w-8 rounded-full p-0"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>

          <div className="space-y-8">
            {/* Candidate Overview */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Candidate Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Position</div>
                  <div className="font-medium">Senior Full-Stack Developer</div>
                </div>
                <div className="border rounded-lg p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Interview Duration</div>
                  <div className="font-medium">28 minutes</div>
                </div>
                <div className="border rounded-lg p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Overall Assessment</div>
                  <div className="font-medium text-emerald-600">Strong Hire (87/100)</div>
                </div>
                <div className="border rounded-lg p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Key Strengths</div>
                  <div className="font-medium">System Design, Problem Solving</div>
                </div>
              </div>
            </section>

            {/* Competency Assessment */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Competency Assessment</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Technical Knowledge</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">System Design</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Problem Solving</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Communication</span>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Team Collaboration</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </section>

            {/* Key Insights */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Key Insights</h3>
              <div className="border rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Strengths</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      Demonstrated exceptional system design skills with scalable microservices
                      architecture solution
                    </li>
                    <li>
                      Strong knowledge of React, Node.js, and database optimization techniques
                    </li>
                    <li>Clear, articulate communication with appropriate technical terminology</li>
                    <li>
                      Thoughtful approach to problem solving with consideration for edge cases
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Areas for Development</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      Knowledge of containerization and orchestration tools could be strengthened
                    </li>
                    <li>Security considerations were present but not deeply explored in answers</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Answer Quality Analysis */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Answer Quality Analysis</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 text-sm font-medium text-muted-foreground">Question</th>
                      <th className="pb-2 text-sm font-medium text-muted-foreground">Assessment</th>
                      <th className="pb-2 text-sm font-medium text-muted-foreground">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 pr-4 text-sm">
                        Design a system to handle 10M daily active users
                      </td>
                      <td className="py-3 pr-4 text-sm">
                        Excellent response with load balancing and caching considerations
                      </td>
                      <td className="py-3 text-sm font-medium text-emerald-600">95/100</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-sm">
                        Explain your approach to debugging a production issue
                      </td>
                      <td className="py-3 pr-4 text-sm">
                        Good methodology but could improve on preventative measures
                      </td>
                      <td className="py-3 text-sm font-medium text-amber-600">80/100</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-sm">
                        Describe a challenging project and how you overcame obstacles
                      </td>
                      <td className="py-3 pr-4 text-sm">
                        Strong example with clear demonstration of problem-solving skills
                      </td>
                      <td className="py-3 text-sm font-medium text-emerald-600">90/100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* AI Recommendation */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">AI Recommendation</h3>
              <div className="border-l-4 border-emerald-500 pl-4 py-1">
                <p className="text-sm">
                  Based on comprehensive analysis of the candidate&apos;s responses, technical
                  acumen, and problem-solving approach, this candidate is recommended as a{" "}
                  <strong>Strong Hire</strong>. Their expertise in system design and full-stack
                  development aligns well with the position requirements, and they demonstrate the
                  ability to communicate complex technical concepts clearly.
                </p>
              </div>
            </section>

            <div className="pt-4 border-t flex justify-end">
              <Button variant="outline" onClick={onClose} className="mr-2">
                Close
              </Button>
              <Button>Download Full Report (PDF)</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
