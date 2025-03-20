import { useQuery } from "@tanstack/react-query";
import type { Customisation, User } from "~/db/schema";

async function fetchUser() {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.data;
}

export function useUser() {
  return useQuery<
    User & {
      customisation: Customisation;
      organizationMemberships: {
        organizationId: number;
        role: string;
      }[];
    }
  >({
    queryKey: ["user"],
    queryFn: () => fetchUser(),
  });
}
