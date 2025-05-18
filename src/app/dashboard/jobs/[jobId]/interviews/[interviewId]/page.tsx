import InterviewLobby from "@/components/interview-lobby";
import { getHumeAccessToken } from "@/utils/get-hume-access-token";
import { Suspense } from "react";

export default async function Page(props: {
  params: Promise<{ jobId: string }>;
}) {
  const params = await props.params;
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className={"grow flex flex-col h-full overflow-auto"}>
      <Suspense fallback={null}>
        <InterviewLobby accessToken={accessToken} jobId={params.jobId} />
      </Suspense>
    </div>
  );
}
