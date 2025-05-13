import { Interview } from "@/components/interview";
import { getHumeAccessToken } from "@/utils/get-hume-access-token";
import { Suspense } from "react";

export default async function Page(props: {
  params: Promise<{ jobId: string; chatId: string }>;
}) {
  const params = await props.params;
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error("No access token");
  }

  return (
    <div className={"grow flex flex-col h-full overflow-auto"}>
      <Suspense fallback={null}>
        <Interview accessToken={accessToken} jobId={params.jobId} chatId={params.chatId} />
      </Suspense>
    </div>
  );
}
