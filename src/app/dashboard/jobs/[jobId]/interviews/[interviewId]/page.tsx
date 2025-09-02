import { Suspense } from "react";
import { InterviewContainer } from "@/components/interview-container";
import { getHumeAccessToken } from "@/utils/get-hume-access-token";

export default async function Page(props: {
  params: Promise<{ jobId: string; interviewId: string }>;
}) {
  const params = await props.params;
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error("No access token");
  }

  return (
    <div className={"grow flex flex-col h-full overflow-auto"}>
      <Suspense fallback={null}>
        <InterviewContainer
          accessToken={accessToken}
          jobId={params.jobId}
          interviewId={params.interviewId}
        />
      </Suspense>
    </div>
  );
}
