import { headers } from "next/headers";

export const createDefaultApiRouteContext = async (
  request: Request
): Promise<Record<string, unknown>> => {
  return {
    route: new URL(request.url).pathname,
    method: request.method,
    requestId: (await headers()).get("request-id"),
  };
};
