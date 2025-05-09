"use client";

import { Step1CV } from "@/components/create-optimization/Step1CV";
import { Step2JobDescription } from "@/components/create-optimization/Step2JobDescription";
import { Step3AdditionalInfo } from "@/components/create-optimization/Step3AdditionalInfo";
import { Button } from "@/components/ui/button";
import { useCreateInterviewStep } from "@/stores/createInterviewStore";
import { Home, Layout } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContentArea() {
  const step = useCreateInterviewStep();
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full px-4 md:px-6 lg:px-8 py-16 mt-16 min-h-[calc(100vh-64px)]">
      {/* Main content box */}
      <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border/40 overflow-hidden w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        {step === 1 && <Step1CV />}
        {step === 2 && <Step2JobDescription />}
        {step === 3 && <Step3AdditionalInfo />}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 pt-6 border-t border-border/40 flex flex-wrap gap-4 justify-center w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <Layout className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
