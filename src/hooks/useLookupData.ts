import { useQuery } from "@tanstack/react-query";

async function fetchLookupData(endpoint: string) {
  const response = await fetch(`/api/lookups/${endpoint}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.data.map((item: any) => ({
    id: item.sys.id,
    name: item.data.name,
  }));
}

export function useLookupData<T = { id: number; name: string }>(
  endpoint: string
) {
  return useQuery<T[]>({
    queryKey: ["lookup", endpoint],
    queryFn: () => fetchLookupData(endpoint),
  });
}
