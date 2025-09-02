import { useQuery } from "@tanstack/react-query";
import type { EntityList } from "@/lib/utils/formatEntity";

interface LookupItem {
  id?: number;
  name: string;
  [key: string]: unknown;
}

async function fetchLookupData(endpoint: string) {
  const response = await fetch(`/api/lookups/${endpoint}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data: EntityList<LookupItem> = await response.json();
  return data.data.map((item) => ({
    id: item.sys.id,
    name: item.data.name,
  }));
}

export function useLookupData<T = { id: number | string | undefined; name: string }>(
  endpoint: string
) {
  return useQuery<T[]>({
    queryKey: ["lookup", endpoint],
    queryFn: () => fetchLookupData(endpoint) as Promise<T[]>,
  });
}
