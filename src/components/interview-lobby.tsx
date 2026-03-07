"use client";

import { InterviewPlaceholder } from "./interview-placeholder";

export default function InterviewLobby({
  jobId,
  accessToken,
}: {
  jobId: string;
  accessToken: string;
}) {
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  return (
    <div className={"relative grid grid-rows-[1fr_auto] mx-auto w-full overflow-auto h-full"}>
      <InterviewPlaceholder accessToken={accessToken} configId={configId} />
    </div>
  );
}
