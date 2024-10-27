import Chat from "@/components/chat";
import { getHumeAccessToken } from "@/utils/get-hume-access-token";
import { Suspense } from "react";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className={"grow flex flex-col h-full overflow-auto"}>
      <Suspense fallback={null}>
        <Chat accessToken={accessToken} id={params.id} />
      </Suspense>
    </div>
  );
}
