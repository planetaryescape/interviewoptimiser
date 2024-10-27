import { getHumeAccessToken } from "@/utils/get-hume-access-token";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/chat"), {
  ssr: false,
});

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className={"grow flex flex-col h-full overflow-auto"}>
      <Chat accessToken={accessToken} id={params.id} />
    </div>
  );
}
